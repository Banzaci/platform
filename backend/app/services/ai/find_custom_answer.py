from difflib import SequenceMatcher

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tenant_knowledge import TenantKnowledge


async def find_custom_answer(
    db: AsyncSession,
    tenant_id,
    text: str,
    language: str = "en",
) -> str | None:
    result = await db.execute(
        select(TenantKnowledge).where(
            TenantKnowledge.tenant_id == tenant_id,
            TenantKnowledge.category == "ask_custom",
            TenantKnowledge.is_active.is_(True),
        )
    )

    items = result.scalars().all()

    if not items:
        return None

    query = text.strip().lower()

    best_score = 0.0
    best_answer = None

    for item in items:
        question = (
            item.question.get(language)
            or item.question.get("en")
            or ""
        )

        answer = (
            item.answer.get(language)
            or item.answer.get("en")
            or ""
        )

        if not question or not answer:
            continue

        score = SequenceMatcher(
            None,
            query,
            question.strip().lower(),
        ).ratio()

        if score > best_score:
            best_score = score
            best_answer = answer

    if best_score >= 0.65:
        return best_answer

    return None