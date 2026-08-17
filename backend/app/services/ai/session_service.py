import json

from app.core.redis import redis_client


SESSION_TTL = 60 * 30


async def get_chat_session(session_id: str) -> dict:
    data = await redis_client.get(f"ai-session:{session_id}")

    if not data:
        return {
            "slots": {},
            "pending_slot": None,
            "selected_property_id": None,
            "selected_property_name": None,
            "awaiting_property_selection": False,
            "awaiting_confirmation": False,
        }

    session = json.loads(data)

    session.setdefault("slots", {})
    session.setdefault("pending_slot", None)
    session.setdefault("selected_property_id", None)
    session.setdefault("selected_property_name", None)
    session.setdefault("awaiting_property_selection", False)
    session.setdefault("awaiting_confirmation", False)

    return session


async def save_chat_session(
    session_id: str,
    session: dict,
) -> None:
    await redis_client.setex(
        f"ai-session:{session_id}",
        SESSION_TTL,
        json.dumps(session),
    )


async def clear_chat_session(
    session_id: str,
) -> None:
    await redis_client.delete(
        f"ai-session:{session_id}"
    )