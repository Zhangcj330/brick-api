import json
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from models.schemas import Message
from services.gemini import stream_chat


def make_chunk(text=None, function_call=None):
    chunk = MagicMock()
    chunk.text = text
    chunk.candidates = []
    if function_call:
        part = MagicMock()
        part.function_call = MagicMock()
        part.function_call.name = function_call["name"]
        part.function_call.args = function_call.get("args", {})
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
    chunks = [make_chunk(text="Hi there!")]

    with patch("services.gemini.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.aio.models.generate_content_stream = AsyncMock(
            return_value=_async_iter(chunks)
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
    chunks = [make_chunk(text="Hello"), make_chunk(text=" world")]

    with patch("services.gemini.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.aio.models.generate_content_stream = AsyncMock(
            return_value=_async_iter(chunks)
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
    messages = [Message(role="user", content="Show me Surry Hills")]
    chunks = [
        make_chunk(function_call={"name": "show_suburb_stats", "args": {"suburb": "Surry Hills"}})
    ]

    with patch("services.gemini.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.aio.models.generate_content_stream = AsyncMock(
            return_value=_async_iter(chunks)
        )
        mock_get_client.return_value = mock_client

        events = []
        async for line in stream_chat(messages, "test-session"):
            if line.startswith("data: "):
                events.append(json.loads(line[6:]))

    tool_events = [e for e in events if e["type"] == "tool_call"]
    assert len(tool_events) == 1
    assert tool_events[0]["name"] == "show_suburb_stats"
