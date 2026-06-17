"""
Agentic tool loop — streamGenerateContent (Vertex AI compatible).

Each round:
  1. Stream generate_content_stream (text chunks, function calls, grounding)
  2. If function calls → execute data/UI tools, feed results back, next round
  3. If no function calls → done

Model: gemini-3.5-flash
Tools: google_search (grounding) + function declarations (DATA_TOOLS + UI_TOOLS)
"""

import asyncio
import contextlib
import json
import os
import time
import uuid
from typing import AsyncGenerator

from google.genai import types
from langfuse import get_client as _langfuse_client, propagate_attributes as _lf_attrs

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

MODEL = "gemini-3.0-flash"
MAX_ROUNDS = 10
MAX_MESSAGES = 40
_RISK_KW = {"flood", "bushfire", "overpriced", "heritage", "contamination"}
_DATA_TOOL_NAMES: frozenset[str] = frozenset(t["name"] for t in DATA_TOOLS)
_UI_TOOL_NAMES: frozenset[str] = frozenset(t["name"] for t in UI_TOOLS)


# ---------------------------------------------------------------------------
# Gemini client helpers
# ---------------------------------------------------------------------------


def _build_tools(round: int = 0) -> list[types.Tool]:
    """Build Tool objects for generate_content_stream, filtered by round.
    Round 0: google_search + data tools
    Round 1+: UI tools (data already fetched)
    """
    if round == 0:
        fn_decls = [
            types.FunctionDeclaration(
                name=t["name"],
                description=t["description"],
                parameters=t["parameters"],
            )
            for t in DATA_TOOLS
        ]
        tools = [types.Tool(google_search=types.GoogleSearch())]
        if fn_decls:
            tools.append(types.Tool(function_declarations=fn_decls))
        return tools
    else:
        fn_decls = [
            types.FunctionDeclaration(
                name=t["name"],
                description=t["description"],
                parameters=t["parameters"],
            )
            for t in UI_TOOLS
        ]
        return [types.Tool(function_declarations=fn_decls)] if fn_decls else []


def _to_contents(messages: list[Message]) -> list[types.Content]:
    """Convert message history to generateContent contents list."""
    contents = []
    for msg in messages:
        role = "model" if msg.role == "assistant" else "user"
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=msg.content)])
        )
    return contents


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


def _sanitize_fn_result(obj):
    """Recursively replace empty lists with None to avoid API rejections."""
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

    # Outer observation groups all rounds under one Langfuse trace.
    # GoogleGenAIInstrumentor auto-creates a child LLM generation span for
    # every generate_content_stream call (input/output/tokens/tool decls captured).
    lf = None
    obs_cm: object = contextlib.nullcontext()
    attr_cm: object = contextlib.nullcontext()
    try:
        lf = _langfuse_client()
        obs_cm = lf.start_as_current_observation(
            name="buyer-agent-chat",
            as_type="agent",
            input=messages[-1].content,
        )
        attr_cm = _lf_attrs(session_id=session_id, tags=["chat", "buyer-agent"])
    except Exception:
        pass

    with obs_cm as obs, attr_cm:
        try:
            contents = _to_contents(messages)

            for _round in range(MAX_ROUNDS):
                fn_call_parts: list = []
                fn_calls: list = []
                accumulated_text = ""
                round_start = time.time()

                round_grounding: dict = {"sources": [], "queries": []}
                tool_results: dict[str, dict] = {}
                round0_buffer: list[str] = []

                config = types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    tools=_build_tools(_round),
                    temperature=0.4,
                )

                # GoogleGenAIInstrumentor wraps this call automatically:
                # → child LLM generation span with input messages, output text,
                #   function_call parts, token usage, and tool declarations.
                async for chunk in await client.aio.models.generate_content_stream(
                    model=MODEL,
                    contents=contents,
                    config=config,
                ):
                    candidate = (chunk.candidates or [None])[0]
                    if not candidate or not candidate.content:
                        continue

                    for part in candidate.content.parts or []:
                        if part.text:
                            accumulated_text += part.text
                            if _round == 0:
                                round0_buffer.append(part.text)
                            else:
                                yield _sse({"type": "text_delta", "content": part.text})

                        if part.function_call:
                            fn_call_parts.append(part)
                            fn_calls.append(part.function_call)

                    gm = getattr(candidate, "grounding_metadata", None)
                    if gm:
                        for gc in gm.grounding_chunks or []:
                            if gc.web and gc.web.uri:
                                round_grounding["sources"].append({
                                    "title": gc.web.title,
                                    "url": gc.web.uri,
                                    "domain": None,
                                })
                        for sq in gm.web_search_queries or []:
                            round_grounding["queries"].append(sq)

                # Deduplicate within this round's streaming output (model may emit same fc twice)
                seen_fc_names: set[str] = set()
                unique_parts, unique_fcs = [], []
                for part, fc in zip(fn_call_parts, fn_calls):
                    if fc.name not in seen_fc_names:
                        seen_fc_names.add(fc.name)
                        unique_parts.append(part)
                        unique_fcs.append(fc)
                fn_call_parts, fn_calls = unique_parts, unique_fcs

                data_fcs = [fc for fc in fn_calls if fc.name in _DATA_TOOL_NAMES]
                ui_fcs   = [fc for fc in fn_calls if fc.name not in _DATA_TOOL_NAMES]

                # Flush round-0 buffer now that we know whether tools fired
                if _round == 0 and round0_buffer:
                    for chunk_text in round0_buffer:
                        if fn_calls:
                            yield _sse({"type": "text_delta", "content": chunk_text, "thinking": True})
                        else:
                            yield _sse({"type": "text_delta", "content": chunk_text})

                # ── Data tools: all in parallel ───────────────────────────────
                if data_fcs:
                    results = await asyncio.gather(
                        *[_execute_data_tool(fc.name, dict(fc.args or {}), round_grounding["sources"])
                          for fc in data_fcs],
                        return_exceptions=True,
                    )
                    for fc, result in zip(data_fcs, results):
                        if isinstance(result, BaseException):
                            result = {"_error": str(result)}
                        _enrichment_cache[fc.name] = result
                        tool_results[fc.name] = result

                # ── UI tools: enrich then emit SSE (ordered) ──────────────────
                for fc in ui_fcs:
                    raw_args = dict(fc.args or {})
                    args = await _enrich_ui_args(fc.name, raw_args, _enrichment_cache, round_grounding["sources"])
                    tool_results[fc.name] = args
                    yield _sse({"type": "tool_call", "id": str(uuid.uuid4()), "name": fc.name, "args": args})

                    for w in args.get("warnings", []):
                        level = "high" if any(kw in w.lower() for kw in _RISK_KW) else "medium"
                        yield _sse({"type": "warning", "level": level, "text": w})

                for key in ("sources", "queries"):
                    grounding[key].extend(round_grounding[key])

                if accumulated_text:
                    all_text.append(accumulated_text)

                if not fn_calls:
                    break

                if _round == 0:
                    yield _sse({"type": "thinking_done", "duration": round(time.time() - round_start, 3)})

                # Build contents for next round — preserve original Parts for thought_signature
                model_parts = []
                if accumulated_text:
                    model_parts.append(types.Part.from_text(text=accumulated_text))
                model_parts.extend(fn_call_parts)
                contents.append(types.Content(role="model", parts=model_parts))

                result_parts = []
                for fc in fn_calls:
                    result = (
                        {"status": "displayed"}
                        if fc.name not in _DATA_TOOL_NAMES
                        else _sanitize_fn_result(tool_results.get(fc.name, {"status": "ok"}))
                    )
                    result_parts.append(
                        types.Part.from_function_response(name=fc.name, response=result)
                    )
                contents.append(types.Content(role="user", parts=result_parts))

            if grounding["sources"]:
                seen_urls: set[str] = set()
                unique_sources = []
                for s in grounding["sources"]:
                    if s["url"] not in seen_urls:
                        seen_urls.add(s["url"])
                        unique_sources.append(s)
                yield _sse({"type": "sources", "items": unique_sources[:10]})

            yield _sse({"type": "done"})

            if obs is not None:
                obs.update(output=" ".join(all_text))

        except Exception as exc:  # noqa: BLE001
            if obs is not None:
                obs.update(metadata={"error": str(exc)})
            yield _sse({"type": "error", "message": str(exc)})
            yield _sse({"type": "done"})
        finally:
            if lf is not None:
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


async def _cached(cache: dict, key: str, coro_fn) -> dict:
    """Return cached result if present, otherwise call and await the coroutine factory."""
    v = cache.get(key)
    if v is not None:
        return v
    return await coro_fn()


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
            lambda: run_fetch_suburb_data(args.get("suburb", ""), args.get("state", "NSW"), args.get("postcode", ""), extra_sources=round_sources),
        )
        return {**args, **enriched}

    if name == "show_property_card":
        enriched = await _cached(
            cache, "fetch_property_data",
            lambda: run_fetch_property_data(args.get("address", ""), args.get("suburb", ""), args.get("state", "NSW"), postcode=args.get("postcode", ""), extra_sources=round_sources),
        )
        street = await _cached(
            cache, "fetch_street_info",
            lambda: run_fetch_street_info(args.get("address", ""), args.get("suburb", ""), args.get("state", "NSW"), extra_sources=round_sources),
        )
        listing = await _cached(
            cache, "fetch_listing_sources",
            lambda: run_fetch_listing_sources(args.get("address", ""), args.get("suburb", ""), args.get("state", "NSW"), extra_sources=round_sources),
        )
        merged = {**args, **street, **listing, **enriched}
        if enriched.get("images") is not None:
            merged["images"] = enriched["images"]  # always override hallucinated URLs
        return merged

    if name == "show_risk_summary":
        r = await _cached(
            cache, "fetch_risk_data",
            lambda: run_fetch_risk_data(args.get("address", ""), args.get("suburb", ""), args.get("state", "NSW"), args.get("postcode", ""), extra_sources=round_sources),
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
