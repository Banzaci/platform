from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.unanswered_question import UnansweredQuestion


async def save_unanswered_question(
    db: AsyncSession,
    tenant_id,
    question: str,
    language: str = "en",
) -> None:
    question = question.strip()

    result = await db.execute(
        select(UnansweredQuestion).where(
            UnansweredQuestion.tenant_id == tenant_id,
            UnansweredQuestion.question == question,
            UnansweredQuestion.language == language,
        )
    )

    existing = result.scalar_one_or_none()

    if existing:
        existing.count += 1
    else:
        db.add(
            UnansweredQuestion(
                tenant_id=tenant_id,
                question=question,
                language=language,
                count=1,
            )
        )

    await db.commit()