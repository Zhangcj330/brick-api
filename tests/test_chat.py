import json
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from google.genai import types
from models.schemas import Message
from services.gemini import stream_chat


def make_text_chunk(text: str):
    chunk = MagicMock()
    chunk.text = text
    chunk.candidates = []
    return chunk


def make_fn_chunk(text: str | None, fn_name: str, fn_args: dict):
    """Chunk with a real types.Part so Pydantic validation passes in multi-turn."""
    chunk = MagicMock()
    chunk.text = text
    part = types.Part.from_function_call(name=fn_name, args=fn_args)
    content = MagicMock()
    content.parts = [part]
    candidate = MagicMock()
    candidate.content = content
    chunk.candidates = [candidate]
    return chunk


async def _async_iter(items):
    for item in items:
        yield item


@pytest.mark.asyncio
async def test_stream_chat_emits_done():
    messages = [Message(role="user", content="Hello")]

    with patch("services.gemini.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.aio.models.generate_content_stream = AsyncMock(
            return_value=_async_iter([make_text_chunk("Hi there!")])
        )
        mock_get_client.return_value = mock_client

        events = []
        async for line in stream_chat(messages, "test-session"):
            if line.startswith("data: "):
                events.append(json.loads(line[6:]))

    assert any(e["type"] == "done" for e in events)


@pytest.mark.asyncio
async def test_stream_chat_emits_text_delta():
    messages = [Message(role="user", content="Hello")]

    with patch("services.gemini.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.aio.models.generate_content_stream = AsyncMock(
            return_value=_async_iter([make_text_chunk("Hello"), make_text_chunk(" world")])
        )
        mock_get_client.return_value = mock_client

        events = []
        async for line in stream_chat(messages, "test-session"):
            if line.startswith("data: "):
                events.append(json.loads(line[6:]))

    text_events = [e for e in events if e["type"] == "text_delta"]
    assert len(text_events) == 2
    assert text_events[0]["content"] == "Hello"


@pytest.mark.asyncio
async def test_stream_chat_emits_tool_call():
    """Round 1 fires a tool; Round 2 returns only text — verifies agentic loop."""
    messages = [Message(role="user", content="Show me Surry Hills")]

    round1 = make_fn_chunk("Here is Surry Hills.", "show_suburb_stats", {"suburb": "Surry Hills"})
    round2 = make_text_chunk("Median price is $1.2M.")

    with patch("services.gemini.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.aio.models.generate_content_stream = AsyncMock(
            side_effect=[_async_iter([round1]), _async_iter([round2])]
        )
        mock_get_client.return_value = mock_client

        events = []
        async for line in stream_chat(messages, "test-session"):
            if line.startswith("data: "):
                events.append(json.loads(line[6:]))

    tool_events = [e for e in events if e["type"] == "tool_call"]
    text_events = [e for e in events if e["type"] == "text_delta"]
    assert len(tool_events) == 1
    assert tool_events[0]["name"] == "show_suburb_stats"
    assert any("Surry Hills" in e["content"] for e in text_events)
    assert any("$1.2M" in e["content"] for e in text_events)
