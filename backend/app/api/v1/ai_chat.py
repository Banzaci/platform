import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.ai.chat_service import handle_chat_message, clear_chat_session


router = APIRouter(
    prefix="/tenants/{tenant_id}/ai",
    tags=["ai"],
)

class ChatPayload(BaseModel):
    text: str
    language: str = "en"
    session_id: str = "default"

@router.post("/chat")
async def chat(
    tenant_id: uuid.UUID,
    payload: ChatPayload,
    db: AsyncSession = Depends(get_db),
):
    text = payload.text.strip()
    if not text:
        return {
            "status": "error",
            "message": "Missing text",
        }

    return await handle_chat_message(
        db=db,
        tenant_id=tenant_id,
        text=text,
        session_id=payload.session_id,
        language=payload.language,
    )


@router.delete("/chat/{session_id}")
async def reset_ai_session(
    session_id: str,
):
    await clear_chat_session(session_id)

    return {
        "success": True,
        "session_id": session_id,
    }