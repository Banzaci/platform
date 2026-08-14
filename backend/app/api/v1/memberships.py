import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_tenant_access
from app.db.session import get_db
from app.models.tenant_membership import TenantMembership
from app.models.user import User
from app.schemas.entities import MembershipCreate, MembershipOut

router = APIRouter(prefix="/tenants/{tenant_id}/members", tags=["memberships"])


@router.get("", response_model=list[MembershipOut])
async def list_members(
    tenant_id: uuid.UUID, db: AsyncSession = Depends(get_db), _user=Depends(require_tenant_access)
):
    result = await db.execute(
        select(User.id, User.email, TenantMembership.role)
        .join(TenantMembership, TenantMembership.user_id == User.id)
        .where(TenantMembership.tenant_id == tenant_id)
    )
    return [{"user_id": row.id, "email": row.email, "role": row.role} for row in result.all()]


@router.post("", response_model=MembershipOut)
async def add_member(
    tenant_id: uuid.UUID,
    payload: MembershipCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_tenant_access),
):
    """Grants an existing user account access to this tenant. The user
    must already exist (sign up separately) — this just links them to the
    company, which is what lets one person administer several tenants."""

    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user with that email")

    existing = await db.execute(
        select(TenantMembership).where(
            TenantMembership.tenant_id == tenant_id, TenantMembership.user_id == user.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already a member")

    db.add(TenantMembership(tenant_id=tenant_id, user_id=user.id, role=payload.role))
    await db.commit()
    return {"user_id": user.id, "email": user.email, "role": payload.role}


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_tenant_access),
):
    result = await db.execute(
        select(TenantMembership).where(
            TenantMembership.tenant_id == tenant_id, TenantMembership.user_id == user_id
        )
    )
    membership = result.scalar_one_or_none()
    if membership:
        await db.delete(membership)
        await db.commit()
