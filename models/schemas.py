from typing import Any, Literal
from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    session_id: str = "default"


class SSEEvent(BaseModel):
    type: Literal["text_delta", "tool_call", "warning", "error", "done"]
    # text_delta
    content: str | None = None
    # tool_call
    id: str | None = None
    name: str | None = None
    args: dict[str, Any] | None = None
    # warning
    level: Literal["low", "medium", "high"] | None = None
    text: str | None = None
    # error
    message: str | None = None
