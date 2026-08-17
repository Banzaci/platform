import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenant_knowledge import TenantKnowledge


async def get_answer_for_intent(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    intent: str,
    language: str = "en",
) -> str | None:
    result = await db.execute(
        select(TenantKnowledge).where(
            TenantKnowledge.tenant_id == tenant_id,
            TenantKnowledge.intent == intent,
            TenantKnowledge.is_active.is_(True),
        )
    )

    item = result.scalar_one_or_none()

    if not item:
        return None

    return (
        item.answer.get(language)
        or item.answer.get("en")
        or next(iter(item.answer.values()), None)
    )