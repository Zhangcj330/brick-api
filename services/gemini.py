"""
Gemini service — buyer agent orchestrator.
Streams SSE events: text_delta, tool_call, warning, done, error.
"""

import json
import os
import uuid
from typing import AsyncGenerator

from google import genai
from google.genai import types

from models.schemas import Message
from prompts.buyer_agent import SYSTEM_PROMPT
from services.tools import UI_TOOLS

MAX_MESSAGES = 40


def get_client() -> genai.Client:
    return genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def _build_config() -> types.GenerateContentConfig:
    # google_search (server-side grounding) + function_declarations require
    # include_server_side_tool_invocations = True
    tools = [
        types.Tool(google_search=types.GoogleSearch()),
        types.Tool(function_declarations=UI_TOOLS),
    ]
    return types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=tools,
        temperature=0.3,
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


def _sse_line(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


async def stream_chat(
    messages: list[Message], session_id: str
) -> AsyncGenerator[str, None]:
    """
    Async generator yielding SSE-formatted lines.
    Handles text deltas, tool calls, and done/error events.
    """
    messages = messages[-MAX_MESSAGES:]

    if not messages:
        yield _sse_line({"type": "error", "message": "No messages provided"})
        yield _sse_line({"type": "done"})
        return

    client = get_client()
    contents = _to_contents(messages)
    config = _build_config()

    try:
        async for chunk in await client.aio.models.generate_content_stream(
            model="gemini-3.5-flash",
            contents=contents,
            config=config,
        ):
            # Text delta
            if chunk.text:
                yield _sse_line({"type": "text_delta", "content": chunk.text})

            # Tool calls from candidates
            if chunk.candidates:
                for candidate in chunk.candidates:
                    if not candidate.content or not candidate.content.parts:
                        continue
                    for part in candidate.content.parts:
                        if part.function_call:
                            fc = part.function_call
                            args = dict(fc.args) if fc.args else {}

                            yield _sse_line({
                                "type": "tool_call",
                                "id": str(uuid.uuid4()),
                                "name": fc.name,
                                "args": args,
                            })

                            for w in args.get("warnings", []):
                                level = "high" if any(
                                    kw in w.lower()
                                    for kw in ["flood", "bushfire", "overpriced", "heritage"]
                                ) else "medium"
                                yield _sse_line({"type": "warning", "level": level, "text": w})

        yield _sse_line({"type": "done"})

    except Exception as exc:  # noqa: BLE001
        yield _sse_line({"type": "error", "message": str(exc)})
        yield _sse_line({"type": "done"})
