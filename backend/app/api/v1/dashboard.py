# app/api/v1/dashboard.py

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import require_permission
from app.db.session import get_db
from app.schemas.daily_briefing import DailyBriefingOut
from app.services.daily_briefing import build_daily_briefing
from app.models.tenant_membership import TenantMembership

router = APIRouter()

@router.get("/tenants/{tenant_id}/daily-briefing", response_model=DailyBriefingOut,)
async def daily_briefing(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("dashboard.view")
    )
):
    return await build_daily_briefing(
        db=db,
        tenant_id=tenant_id,
    )