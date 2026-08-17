import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_tenant_access
from app.api.get_current_user import get_current_user
from app.db.session import get_db
from app.models.tenant_property_theme import TenantPropertyTheme


router = APIRouter(
    prefix="/tenants/{tenant_id}/property-theme",
    tags=["property-theme"],
)


class PropertyThemeUpdate(BaseModel):
    theme: dict


@router.put("")
async def update_property_theme(
    tenant_id: uuid.UUID,
    payload: PropertyThemeUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(TenantPropertyTheme).where(
            TenantPropertyTheme.tenant_id == tenant_id
        )
    )

    property_theme = result.scalar_one_or_none()

    if not property_theme:
        property_theme = TenantPropertyTheme(
            tenant_id=tenant_id,
            theme=payload.theme,
        )

        db.add(property_theme)
    else:
        property_theme.theme = payload.theme

    await db.commit()
    await db.refresh(property_theme)

    return {
        "theme": property_theme.theme,
    }