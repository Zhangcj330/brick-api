"""
Agentic tool loop — Interactions API (streaming).

Each round:
  1. Stream interaction events (text deltas, function call steps, grounding)
  2. If requires_action → execute data/UI tools, feed results back, next round
  3. If completed → done

Model: gemini-3.5-flash
Tools: google_search (grounding) + function declarations (DATA_TOOLS + UI_TOOLS)
"""

import asyncio
import contextlib
import json
import os
import time
import uuid
import warnings
from typing import AsyncGenerator

from langfuse import get_client as _langfuse_client, propagate_attributes as _lf_attrs
from langfuse import observe as _lf_observe

from models.schemas import Message
from prompts.buyer_agent import SYSTEM_PROMPT
from services.enrichments import get_client
from services.tool_runners import (
    run_fetch_listing_sources,
    run_fetch_property_data,
    run_fetch_risk_data,
    run_fetch_street_info,
    run_fetch_suburb_data,
)
from services.tools import DATA_TOOLS, UI_TOOLS

MODEL = "gemini-3.5-flash"
MAX_ROUNDS = 10
MAX_MESSAGES = 40
_RISK_KW = {"flood", "bushfire", "overpriced", "heritage", "contamination"}
_DATA_TOOL_NAMES: frozenset[str] = frozenset(t["name"] for t in DATA_TOOLS)
_UI_TOOL_NAMES: frozenset[str] = frozenset(t["name"] for t in UI_TOOLS)

# Suppress the experimental-feature warning emitted on first access of .interactions
warnings.filterwarnings(
    "ignore",
    message=".*Interactions usage is experimental.*",
    category=UserWarning,
)


# ---------------------------------------------------------------------------
# Gemini client helpers
# ---------------------------------------------------------------------------


@_lf_observe(as_type="span")
async def _trace_ui_tool(tool_name: str, input_args: dict, output_args: dict) -> dict:
    """No-op helper — purely for Langfuse tracing of UI tool calls."""
    _langfuse_client().update_current_span(name=tool_name)
    return output_args


def _build_tools(round: int = 0) -> list:
    """Plain tool dicts for the Interactions API, filtered by round.
    Round 0: google_search + data tools
    Round 1+: UI tools (data already fetched)
    """
    tools: list = []
    if round == 0:
        tools.append({"type": "google_search"})
        tools += [
            {"type": "function", "name": t["name"], "description": t["description"], "parameters": t["parameters"]}
            for t in DATA_TOOLS
        ]
    else:
        tools += [
            {"type": "function", "name": t["name"], "description": t["description"], "parameters": t["parameters"]}
            for t in UI_TOOLS
        ]
    return tools


def _to_steps(messages: list[Message]) -> list:
    """Convert message history to Interactions API step params."""
    steps = []
    for msg in messages[:-1]:
        role = "model_output" if msg.role == "assistant" else "user_input"
        steps.append({"type": role, "content": [{"type": "text", "text": msg.content}]})
    steps.append({"type": "user_input", "content": [{"type": "text", "text": messages[-1].content}]})
    return steps


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


def _sanitize_fn_result(obj):
    """Recursively replace empty lists with None.
    Interactions API rejects empty arrays in function_result payloads."""
    if isinstance(obj, dict):
        return {k: _sanitize_fn_result(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return None if len(obj) == 0 else [_sanitize_fn_result(i) for i in obj]
    return obj


# ---------------------------------------------------------------------------
# Stream chat
# ---------------------------------------------------------------------------


async def stream_chat(
    messages: list[Message], session_id: str
) -> AsyncGenerator[str, None]:
    messages = messages[-MAX_MESSAGES:]
    if not messages:
        yield _sse({"type": "error", "message": "No messages provided"})
        yield _sse({"type": "done"})
        return

    client = get_client()

    all_text: list[str] = []
    grounding: dict = {"sources": [], "queries": []}
    _enrichment_cache: dict = {}

    lf = None
    trace_cm: object = contextlib.nullcontext()
    attr_cm: object = contextlib.nullcontext()
    try:
        lf = _langfuse_client()
        trace_cm = lf.start_as_current_observation(
            name="buyer-agent-chat",
            as_type="agent",
            input=messages[-1].content,
        )
        attr_cm = _lf_attrs(session_id=session_id, tags=["chat", "buyer-agent"])
    except Exception:
        pass

    with trace_cm as trace_obs, attr_cm:
        try:
            # First round: full conversation history as steps
            current_input = _to_steps(messages)
            current_previous_id: str | None = None

            for _round in range(MAX_ROUNDS):
                fn_calls: dict[int, dict] = {}
                accumulated_text = ""
                round_start = time.time()
                final_status = "completed"

                round_grounding: dict = {"sources": [], "queries": []}
                tool_results: dict[str, dict] = {}

                create_kwargs: dict = dict(
                    model=MODEL,
                    input=current_input,
                    system_instruction=SYSTEM_PROMPT,
                    tools=_build_tools(_round),
                    generation_config={"temperature": 0.4},
                    stream=True,
                )
                if current_previous_id:
                    create_kwargs["previous_interaction_id"] = current_previous_id

                async for event in await client.aio.interactions.create(**create_kwargs):
                    et = event.event_type

                    if et == "interaction.created":
                        current_previous_id = event.interaction.id

                    elif et == "step.start":
                        step = event.step
                        if step.type == "function_call":
                            fn_calls[event.index] = {
                                "id": step.id,
                                "name": step.name,
                                "args_str": "",
                            }

                    elif et == "step.delta":
                        delta = event.delta
                        dt = delta.type

                        if dt == "text":
                            accumulated_text += delta.text
                            if _round == 0:
                                yield _sse({"type": "text_delta", "content": delta.text, "thinking": True})
                            else:
                                yield _sse({"type": "text_delta", "content": delta.text})

                        elif dt == "arguments_delta":
                            if event.index in fn_calls and delta.arguments:
                                fn_calls[event.index]["args_str"] += delta.arguments

                        elif dt == "google_search_call":
                            if delta.arguments and delta.arguments.queries:
                                round_grounding["queries"].extend(list(delta.arguments.queries))

                        elif dt == "text_annotation_delta":
                            for ann in delta.annotations or []:
                                if ann.type == "url_citation" and ann.url:
                                    round_grounding["sources"].append(
                                        {"title": ann.title or ann.url, "url": ann.url, "domain": None}
                                    )

                    elif et == "interaction.completed":
                        final_status = event.interaction.status

                # Parse fn_calls into (fc, name, args) tuples
                parsed_fcs: list[tuple[dict, str, dict]] = []
                for fc in fn_calls.values():
                    name = fc["name"]
                    try:
                        args = json.loads(fc["args_str"]) if fc["args_str"] else {}
                    except json.JSONDecodeError:
                        args = {}
                    parsed_fcs.append((fc, name, args))

                data_fcs = [(fc, name, args) for fc, name, args in parsed_fcs if name in _DATA_TOOL_NAMES]
                ui_fcs   = [(fc, name, args) for fc, name, args in parsed_fcs if name not in _DATA_TOOL_NAMES]

                # ── Data tools: all in parallel ───────────────────────────────
                if data_fcs:
                    results = await asyncio.gather(
                        *[_execute_data_tool(name, args, round_grounding["sources"])
                          for _, name, args in data_fcs],
                        return_exceptions=True,
                    )
                    for (fc, name, args), result in zip(data_fcs, results):
                        if isinstance(result, BaseException):
                            result = {"_error": str(result)}
                        _enrichment_cache[name] = result
                        tool_results[name] = result

                # ── UI tools: enrich then emit SSE (ordered) ──────────────────
                for fc, name, args in ui_fcs:
                    raw_args = dict(args)
                    args = await _enrich_ui_args(name, args, _enrichment_cache, round_grounding["sources"])
                    await _trace_ui_tool(name, raw_args, args)
                    tool_results[name] = args
                    yield _sse({"type": "tool_call", "id": str(uuid.uuid4()), "name": name, "args": args})

                    for w in args.get("warnings", []):
                        level = "high" if any(kw in w.lower() for kw in _RISK_KW) else "medium"
                        yield _sse({"type": "warning", "level": level, "text": w})

                for key in ("sources", "queries"):
                    grounding[key].extend(round_grounding[key])

                if accumulated_text:
                    all_text.append(accumulated_text)

                if final_status != "requires_action" or not fn_calls:
                    break

                if _round == 0:
                    yield _sse({"type": "thinking_done", "duration": round(time.time() - round_start, 3)})

                current_input = [
                    {
                        "type": "function_result",
                        "call_id": fc["id"],
                        "name": fc["name"],
                        "result": {"status": "displayed"} if fc["name"] not in _DATA_TOOL_NAMES
                                  else _sanitize_fn_result(tool_results.get(fc["name"], {"status": "ok"})),
                    }
                    for fc in fn_calls.values()
                ]

            if trace_obs is not None:
                trace_obs.update(output=" ".join(all_text))

            if grounding["sources"]:
                seen_urls: set[str] = set()
                unique_sources = []
                for s in grounding["sources"]:
                    if s["url"] not in seen_urls:
                        seen_urls.add(s["url"])
                        unique_sources.append(s)
                yield _sse({"type": "sources", "items": unique_sources[:10]})

            yield _sse({"type": "done"})

        except Exception as exc:  # noqa: BLE001
            if trace_obs is not None:
                trace_obs.update(metadata={"error": str(exc)})
            yield _sse({"type": "error", "message": str(exc)})
            yield _sse({"type": "done"})
        finally:
            if lf:
                lf.flush()


# ---------------------------------------------------------------------------
# Tool execution helpers (keep stream_chat lean)
# ---------------------------------------------------------------------------


async def _execute_data_tool(name: str, args: dict, round_sources: list) -> dict:
    """Dispatch a data tool call to the appropriate runner."""
    if name == "fetch_suburb_data":
        return await run_fetch_suburb_data(
            args.get("suburb", ""),
            args.get("state", "NSW"),
            args.get("postcode", ""),
            extra_sources=round_sources,
        )
    if name == "fetch_property_data":
        return await run_fetch_property_data(
            args.get("address", ""),
            args.get("suburb", ""),
            args.get("state", "NSW"),
            postcode=args.get("postcode", ""),
            extra_sources=round_sources,
        )
    if name == "fetch_street_info":
        return await run_fetch_street_info(
            args.get("address", ""),
            args.get("suburb", ""),
            args.get("state", "NSW"),
            extra_sources=round_sources,
        )
    if name == "fetch_listing_sources":
        return await run_fetch_listing_sources(
            args.get("address", ""),
            args.get("suburb", ""),
            args.get("state", "NSW"),
            extra_sources=round_sources,
        )
    if name == "fetch_risk_data":
        return await run_fetch_risk_data(
            args.get("address", ""),
            args.get("suburb", ""),
            args.get("state", "NSW"),
            args.get("postcode", ""),
            extra_sources=round_sources,
        )
    return {}


async def _cached(cache: dict, key: str, coro) -> dict:
    """Return cached result if present, otherwise await the coroutine."""
    v = cache.get(key)
    return v if v is not None else await coro


async def _enrich_ui_args(
    name: str, args: dict, cache: dict, round_sources: list
) -> dict:
    """
    Merge pre-fetched enrichment data into show_* tool args.
    Falls back to inline fetching if Gemini skipped the data tool.
    Cached data wins over Gemini's initial estimates for factual fields.
    """
    if name == "show_suburb_stats":
        enriched = await _cached(
            cache, "fetch_suburb_data",
            run_fetch_suburb_data(args.get("suburb", ""), args.get("state", "NSW"), args.get("postcode", ""), extra_sources=round_sources),
        )
        return {**args, **enriched}

    if name == "show_property_card":
        enriched = await _cached(
            cache, "fetch_property_data",
            run_fetch_property_data(args.get("address", ""), args.get("suburb", ""), args.get("state", "NSW"), postcode=args.get("postcode", ""), extra_sources=round_sources),
        )
        street = await _cached(
            cache, "fetch_street_info",
            run_fetch_street_info(args.get("address", ""), args.get("suburb", ""), args.get("state", "NSW"), extra_sources=round_sources),
        )
        listing = await _cached(
            cache, "fetch_listing_sources",
            run_fetch_listing_sources(args.get("address", ""), args.get("suburb", ""), args.get("state", "NSW"), extra_sources=round_sources),
        )
        merged = {**args, **street, **listing, **enriched}
        if enriched.get("images") is not None:
            merged["images"] = enriched["images"]  # always override hallucinated URLs
        return merged

    if name == "show_risk_summary":
        r = await _cached(
            cache, "fetch_risk_data",
            run_fetch_risk_data(args.get("address", ""), args.get("suburb", ""), args.get("state", "NSW"), args.get("postcode", ""), extra_sources=round_sources),
        )
        if r:
            risk_items = list(args.get("risks", []))
            if r.get("land_slope") and r["land_slope"] != "Flat":
                sev = "high" if r["land_slope"] == "Steep Slope" else "medium"
                risk_items.append({
                    "name": "Land Slope",
                    "description": r.get("land_slope_note", r["land_slope"]),
                    "severity": sev,
                    "status": r["land_slope"],
                })
            if r.get("noise_level") and r["noise_level"] != "Low":
                sev = "high" if r["noise_level"] == "High" else "medium"
                sources = r.get("noise_sources") or []
                desc = ", ".join(sources) if sources else r.get("noise_note", r["noise_level"])
                risk_items.append({
                    "name": "Noise",
                    "description": desc,
                    "severity": sev,
                    "status": r["noise_level"],
                })
            for flag in r.get("property_history_flags") or []:
                risk_items.append({
                    "name": "Property History",
                    "description": flag,
                    "severity": "medium",
                    "status": "Flag",
                })
            if r.get("needs_inspection"):
                risk_items.append({
                    "name": "Building Inspection",
                    "description": r.get("due_diligence_note", "Pre-purchase inspection recommended"),
                    "severity": "medium",
                    "status": "Recommended",
                })
            if r.get("needs_pest_control"):
                risk_items.append({
                    "name": "Pest Inspection",
                    "description": "Pest inspection recommended before purchase",
                    "severity": "low",
                    "status": "Recommended",
                })
            args["risks"] = risk_items

    return args
