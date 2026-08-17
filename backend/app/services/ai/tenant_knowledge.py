import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenant_knowledge import TenantKnowledge


async def get_tenant_knowledge(
    db: AsyncSession,
    tenant_id: uuid.UUID,
) -> list[TenantKnowledge]:
    result = await db.execute(
        select(TenantKnowledge)
        .where(
            TenantKnowledge.tenant_id == tenant_id,
            TenantKnowledge.is_active.is_(True),
        )
        .order_by(
            TenantKnowledge.priority.desc(),
            TenantKnowledge.created_at,
        )
    )

    return list(result.scalars().all())


async def get_answer_for_intent(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    intent: str,
    language: str = "en",
) -> str | None:
    result = await db.execute(
        select(TenantKnowledge)
        .where(
            TenantKnowledge.tenant_id == tenant_id,
            TenantKnowledge.intent == intent,
            TenantKnowledge.is_active.is_(True),
        )
        .order_by(
            TenantKnowledge.priority.desc()
        )
        .limit(1)
    )

    item = result.scalar_one_or_none()

    if not item:
        return None

    return get_localized_text(
        item.answer,
        language,
    )


def get_localized_text(
    value: dict | None,
    language: str,
) -> str | None:
    if not value:
        return None

    return (
        value.get(language)
        or value.get("en")
        or next(
            (
                text
                for text in value.values()
                if text
            ),
            None,
        )
    )


async def build_knowledge_context(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    language: str = "en",
) -> str:
    items = await get_tenant_knowledge(
        db=db,
        tenant_id=tenant_id,
    )

    rows: list[str] = []

    for item in items:
        question = get_localized_text(
            item.question,
            language,
        )

        answer = get_localized_text(
            item.answer,
            language,
        )

        if not question or not answer:
            continue

        rows.append(
            f"Q: {question}\nA: {answer}"
        )

    return "\n\n".join(rows)