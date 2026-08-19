import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.property_block import PropertyBlock
from app.api.deps import require_tenant_access
from app.api.get_current_user import get_current_user
from app.db.session import get_db
from app.models.property import Property
from app.models.blocked_period import BlockedPeriod, BlockedReason


router = APIRouter(
    prefix="/tenants/{tenant_id}/properties/{property_id}/blocked-periods",
    tags=["blocked-periods"],
)


class BlockedPeriodCreate(BaseModel):
    start_date: date
    end_date: date
    reason: BlockedReason | None = None
    note: str | None = None


class BlockedPeriodOut(BaseModel):
    id: uuid.UUID
    property_id: uuid.UUID
    start_date: date
    end_date: date
    reason: BlockedReason | None
    note: str | None
    ical_source_id: str | None
    package_id: str | None
    external_uid: str | None

    class Config:
        from_attributes = True

@router.get("")
async def get_blocked_periods(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    property_result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    if not property_result.scalar_one_or_none():
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    blocked_result = await db.execute(
        select(BlockedPeriod)
        .where(
            BlockedPeriod.property_id == property_id
        )
        .order_by(BlockedPeriod.start_date)
    )

    blocked_periods = blocked_result.scalars().all()

    external_result = await db.execute(
        select(PropertyBlock)
        .where(
            PropertyBlock.property_id == property_id
        )
        .order_by(PropertyBlock.start_date)
    )

    property_blocks = external_result.scalars().all()

    return [
        *[
            {
                "id": str(block.id),
                "start_date": block.start_date,
                "end_date": block.end_date,
                "source": "manual",
            }
            for block in blocked_periods
        ],
        *[
            {
                "id": str(block.id),
                "start_date": block.start_date,
                "end_date": block.end_date,
                "source": "external",
            }
            for block in property_blocks
        ],
    ]

@router.post("", response_model=BlockedPeriodOut)
async def create_blocked_period(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    payload: BlockedPeriodCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date",
        )

    property_result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    if not property_result.scalar_one_or_none():
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    blocked_period = BlockedPeriod(
        property_id=property_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
        note=payload.note,
    )

    db.add(blocked_period)

    await db.commit()
    await db.refresh(blocked_period)

    return blocked_period


@router.delete("/{blocked_period_id}", status_code=204)
async def delete_blocked_period(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    blocked_period_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(BlockedPeriod)
        .join(
            Property,
            Property.id == BlockedPeriod.property_id,
        )
        .where(
            BlockedPeriod.id == blocked_period_id,
            BlockedPeriod.property_id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    blocked_period = result.scalar_one_or_none()

    if not blocked_period:
        raise HTTPException(
            status_code=404,
            detail="Blocked period not found",
        )

    await db.delete(blocked_period)
    await db.commit()