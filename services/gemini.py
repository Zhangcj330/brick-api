"""
Agentic tool loop — Copilot / Claude Code style.

Each round:
  1. Stream model response (text_delta + tool_call events)
  2. If tool calls fired → "execute" them (emit to frontend), feed dummy
     FunctionResponse back, start next round
  3. If no tool calls → done

Model: gemini-3.5-flash
Tools: google_search (grounding) + function_declarations (Gen UI)
"""

import json
import os
import time
import uuid
from typing import AsyncGenerator

from google import genai
from google.genai import types
from langfuse import Langfuse
from langfuse.types import TraceContext

from models.schemas import Message
from prompts.buyer_agent import SYSTEM_PROMPT
from services.tools import UI_TOOLS

MODEL = "gemini-3.5-flash"
MAX_ROUNDS = 5
MAX_MESSAGES = 40
_RISK_KW = {"flood", "bushfire", "overpriced", "heritage", "contamination"}

_SUBURB_STATS_PROMPT = """Search the web and return ONLY a JSON object (no markdown, no explanation) with current real estate statistics for {suburb}, {state}, Australia.

Fields to return:
{{
  "median_price": <integer, median house price AUD>,
  "clearance_rate": <float, auction clearance rate %>,
  "growth_12mo": <float, 12-month price growth %>,
  "rental_yield": <float, gross rental yield %>,
  "days_on_market": <integer, median days on market>,
  "source_note": <string, e.g. "Domain.com.au, May 2025">
}}

Search queries to use: "{suburb} {state} median house price 2025", "{suburb} clearance rate auction results", "{suburb} rental yield days on market".
Return only the JSON object. Use null for any field you cannot find."""


def get_client() -> genai.Client:
    return genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def _get_langfuse() -> Langfuse | None:
    try:
        lf = Langfuse(
            public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
            secret_key=os.environ["LANGFUSE_SECRET_KEY"],
            host=os.environ.get("LANGFUSE_HOST", "https://cloud.langfuse.com"),
        )
        return lf
    except KeyError:
        return None


def _build_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=[
            types.Tool(google_search=types.GoogleSearch()),
            types.Tool(function_declarations=UI_TOOLS),
        ],
        temperature=0.4,
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
        tool_config=types.ToolConfig(
            function_calling_config=types.FunctionCallingConfig(mode="AUTO"),
            include_server_side_tool_invocations=True,
        ),
    )


async def fetch_suburb_stats(suburb: str, state: str = "NSW") -> dict:
    """Use a dedicated Gemini + Google Search call to get real suburb stats."""
    client = get_client()
    prompt = _SUBURB_STATS_PROMPT.format(suburb=suburb, state=state)
    try:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0.1,
            ),
        )
        text = response.text or ""
        # Strip markdown code fences if present
        text = text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        data = json.loads(text)
        # Remove null values so model estimates are preserved for missing fields
        return {k: v for k, v in data.items() if v is not None}
    except Exception:
        return {}


def _to_contents(messages: list[Message]) -> list[types.Content]:
    contents = []
    for msg in messages:
        role = "model" if msg.role == "assistant" else "user"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))
    return contents


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


async def stream_chat(
    messages: list[Message], session_id: str
) -> AsyncGenerator[str, None]:
    messages = messages[-MAX_MESSAGES:]
    if not messages:
        yield _sse({"type": "error", "message": "No messages provided"})
        yield _sse({"type": "done"})
        return

    client = get_client()
    contents = _to_contents(messages)
    config = _build_config()
    lf = _get_langfuse()

    all_text: list[str] = []
    tools_called: list[str] = []
    all_grounding_sources: list[dict] = []
    all_grounding_supports: list[dict] = []  # accumulated across all rounds
    trace_obs = None

    if lf:
        trace_obs = lf.start_observation(
            name="buyer-agent-chat",
            as_type="agent",
            trace_context=TraceContext(session_id=session_id, tags=["chat", "buyer-agent"]),
            input=messages[-1].content,
        )

    try:
        for _round in range(MAX_ROUNDS):
            accumulated_text = ""
            fn_call_parts: list[types.Part] = []
            seen_names: set[str] = set()
            round_start = time.time()
            ttft: float | None = None

            gen_obs = None
            if lf and trace_obs:
                gen_obs = lf.start_observation(
                    name=f"round-{_round + 1}",
                    as_type="generation",
                    model=MODEL,
                    input=messages[-1].content,  # last user message for clarity
                )

            # ── Stream one round ──────────────────────────────────────────
            grounding_queries: list[str] = []
            round_sources: list[dict] = []
            round_supports: list[dict] = []
            async for chunk in await client.aio.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config=config,
            ):
                # Stream text
                if chunk.text:
                    if ttft is None:
                        ttft = round(time.time() - round_start, 3)
                    accumulated_text += chunk.text
                    yield _sse({"type": "text_delta", "content": chunk.text})

                # Collect function calls (deduplicated) + grounding metadata
                if chunk.candidates:
                    for candidate in chunk.candidates:
                        if ttft is None and candidate.content and candidate.content.parts:
                            ttft = round(time.time() - round_start, 3)
                        # Capture Google Search grounding data
                        if candidate.grounding_metadata:
                            gm = candidate.grounding_metadata
                            if gm.web_search_queries:
                                grounding_queries.extend(gm.web_search_queries)
                            if gm.grounding_chunks:
                                for gc in gm.grounding_chunks:
                                    if gc.web:
                                        round_sources.append({
                                            "title": gc.web.title,
                                            "url": gc.web.uri,
                                            "domain": gc.web.domain,
                                        })
                            if gm.grounding_supports:
                                for gs in gm.grounding_supports:
                                    support = {
                                        "text": gs.segment.text if gs.segment else None,
                                        "source_indices": list(gs.grounding_chunk_indices or []),
                                        "confidence": [round(s, 3) for s in (gs.confidence_scores or [])],
                                    }
                                    if support["text"]:
                                        round_supports.append(support)

                        if not candidate.content or not candidate.content.parts:
                            continue
                        for part in candidate.content.parts:
                            if not part.function_call:
                                continue
                            fc = part.function_call
                            if fc.name in seen_names:
                                continue
                            seen_names.add(fc.name)
                            fn_call_parts.append(part)

                            args = dict(fc.args) if fc.args else {}
                            tools_called.append(fc.name)

                            # For suburb stats: fetch real data via Google Search
                            if fc.name == "show_suburb_stats":
                                real = await fetch_suburb_stats(
                                    args.get("suburb", ""),
                                    args.get("state", "NSW"),
                                )
                                args = {**args, **real}  # real data wins over model estimates

                            # Track tool call as a span in Langfuse
                            if lf and trace_obs:
                                tool_span = trace_obs.start_observation(
                                    name=fc.name,
                                    as_type="span",
                                    input=args,
                                )
                                tool_span.update(
                                    output={"status": "ok", "rendered": "UI component displayed to user"},
                                )
                                tool_span.end()

                            # Emit tool call → frontend renders the component
                            yield _sse({
                                "type": "tool_call",
                                "id": str(uuid.uuid4()),
                                "name": fc.name,
                                "args": args,
                            })

                            # Surface embedded warnings
                            for w in args.get("warnings", []):
                                level = "high" if any(
                                    kw in w.lower() for kw in _RISK_KW
                                ) else "medium"
                                yield _sse({"type": "warning", "level": level, "text": w})

            round_duration = round(time.time() - round_start, 3)

            # Build meaningful output for Langfuse: text + any tool calls
            if accumulated_text and seen_names:
                gen_output = {"text": accumulated_text, "tool_calls": list(seen_names)}
            elif accumulated_text:
                gen_output = accumulated_text
            elif seen_names:
                gen_output = {"tool_calls": list(seen_names)}
            else:
                gen_output = None

            if gen_obs:
                gen_obs.update(
                    output=gen_output,
                    metadata={
                        "tools": list(seen_names),
                        "round": _round + 1,
                        "ttft_seconds": ttft,
                        "round_duration_seconds": round_duration,
                        "search_queries": grounding_queries,
                        "search_sources": round_sources[:10],
                        "grounding_supports": round_supports,
                    },
                )
                gen_obs.end()

            # Accumulate sources + supports across rounds
            all_grounding_sources.extend(round_sources)
            all_grounding_supports.extend(round_supports)

            # Remove per-round sources emit (now done after all rounds)

            if accumulated_text:
                all_text.append(accumulated_text)

            # ── No tool calls → conversation turn complete ────────────────
            if not fn_call_parts:
                break

            # ── Tool calls fired → build next turn ────────────────────────
            # IMPORTANT: use the raw Part objects from the stream — they carry
            # thought_signature which Gemini 3.5 Flash requires in multi-turn.
            model_parts: list[types.Part] = []
            if accumulated_text:
                model_parts.append(types.Part(text=accumulated_text))
            model_parts.extend(fn_call_parts)  # raw Parts with thought_signature intact

            # Function responses confirming each tool executed
            fn_resp_parts = [
                types.Part.from_function_response(
                    name=p.function_call.name,
                    response={"status": "ok", "result": "UI component displayed to user"},
                )
                for p in fn_call_parts
            ]

            # Extend history and loop
            contents = contents + [
                types.Content(role="model", parts=model_parts),
                types.Content(role="user", parts=fn_resp_parts),
            ]

        if trace_obs:
            trace_obs.update(
                output=" ".join(all_text),
                metadata={"tools_called": tools_called},
            )
            trace_obs.end()
            lf.flush()

        # Emit all accumulated sources (deduped) + supports after final text delta
        if all_grounding_sources:
            seen_urls: set[str] = set()
            unique_sources = []
            for s in all_grounding_sources:
                if s["url"] not in seen_urls:
                    seen_urls.add(s["url"])
                    unique_sources.append(s)
            yield _sse({"type": "sources", "items": unique_sources[:10]})

            if all_grounding_supports:
                yield _sse({"type": "supports", "items": all_grounding_supports})

        yield _sse({"type": "done"})

    except Exception as exc:  # noqa: BLE001
        if trace_obs:
            trace_obs.update(metadata={"error": str(exc)})
            trace_obs.end()
            lf.flush()
        yield _sse({"type": "error", "message": str(exc)})
        yield _sse({"type": "done"})
