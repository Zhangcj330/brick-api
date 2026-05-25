from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest
from services.gemini import stream_chat

router = APIRouter()


@router.post("/api/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_chat(request.messages, request.session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
