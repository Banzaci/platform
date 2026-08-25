import copy
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.theme_history import ThemeHistory


async def save_theme_history(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    theme: dict,
    key: str = "global",
) -> ThemeHistory:
    history = ThemeHistory(
        tenant_id=tenant_id,
        theme=copy.deepcopy(theme),
        key=key,
    )

    db.add(history)

    await db.flush()

    return history