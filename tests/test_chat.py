import json
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from models.schemas import Message
from services.gemini import stream_chat


async def _async_iter(items):
    for item in items:
        yield item


def make_created_event(interaction_id: str = "test-id"):
    event = MagicMock()
    event.event_type = "interaction.created"
    event.interaction = MagicMock()
    event.interaction.id = interaction_id
    return event


def make_text_event(text: str):
    event = MagicMock()
    event.event_type = "step.delta"
    event.index = 0
    delta = MagicMock()
    delta.type = "text"
    delta.text = text
    event.delta = delta
    return event


def make_fn_start_event(index: int, fn_id: str, fn_name: str):
    event = MagicMock()
    event.event_type = "step.start"
    event.index = index
    step = MagicMock()
    step.type = "function_call"
    step.id = fn_id
    step.name = fn_name
    event.step = step
    return event


def make_fn_args_event(index: int, args_chunk: str):
    event = MagicMock()
    event.event_type = "step.delta"
    event.index = index
    delta = MagicMock()
    delta.type = "arguments_delta"
    delta.arguments = args_chunk
    event.delta = delta
    return event


def make_completed_event(status: str = "completed"):
    event = MagicMock()
    event.event_type = "interaction.completed"
    event.interaction = MagicMock()
    event.interaction.status = status
    return event


@pytest.mark.asyncio
async def test_stream_chat_emits_done():
    messages = [Message(role="user", content="Hello")]

    with patch("services.gemini.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.aio.interactions.create = AsyncMock(
            return_value=_async_iter([
                make_created_event(),
                make_text_event("Hi there!"),
                make_completed_event(),
            ])
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
        mock_client.aio.interactions.create = AsyncMock(
            return_value=_async_iter([
                make_created_event(),
                make_text_event("Hello"),
                make_text_event(" world"),
                make_completed_event(),
            ])
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
    """Round 1 fires a UI tool; Round 2 returns only text — verifies agentic loop."""
    messages = [Message(role="user", content="Show me Surry Hills")]

    round1 = [
        make_created_event("id-1"),
        make_text_event("Here is Surry Hills."),
        make_fn_start_event(1, "call-1", "show_suburb_stats"),
        make_fn_args_event(1, '{"suburb": "Surry Hills"}'),
        make_completed_event("requires_action"),
    ]
    round2 = [
        make_created_event("id-2"),
        make_text_event("Median price is $1.2M."),
        make_completed_event("completed"),
    ]

    with patch("services.gemini.get_client") as mock_get_client, \
         patch("services.gemini.run_fetch_suburb_data", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = {}
        mock_client = MagicMock()
        mock_client.aio.interactions.create = AsyncMock(
            side_effect=[_async_iter(round1), _async_iter(round2)]
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
