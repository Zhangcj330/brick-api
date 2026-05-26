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

            gen_obs = None
            if lf and trace_obs:
                gen_obs = lf.start_observation(
                    name=f"round-{_round + 1}",
                    as_type="generation",
                    model=MODEL,
                    input=[{"role": m.role, "content": m.content} for m in messages],
                )

            # ── Stream one round ──────────────────────────────────────────
            async for chunk in await client.aio.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config=config,
            ):
                # Stream text
                if chunk.text:
                    accumulated_text += chunk.text
                    yield _sse({"type": "text_delta", "content": chunk.text})

                # Collect function calls (deduplicated)
                if chunk.candidates:
                    for candidate in chunk.candidates:
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

            if gen_obs:
                gen_obs.update(
                    output=accumulated_text,
                    metadata={"tools": list(seen_names), "round": _round + 1},
                )
                gen_obs.end()

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

        yield _sse({"type": "done"})

    except Exception as exc:  # noqa: BLE001
        if trace_obs:
            trace_obs.update(metadata={"error": str(exc)})
            trace_obs.end()
            lf.flush()
        yield _sse({"type": "error", "message": str(exc)})
        yield _sse({"type": "done"})
