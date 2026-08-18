import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.redis import redis_client

from app.models.tenant import Tenant
from app.api.get_current_user import CurrentUser, get_current_user
from app.db.session import get_db
from app.models.tenant_membership import TenantMembership, TenantRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def invalidate_tenant_cache_for_tenant(
    tenant: Tenant,
):
    keys = []

    if tenant.custom_domain:
        keys.append(
            f"tenant-resolve:{tenant.custom_domain}"
        )

    if tenant.subdomain:
        keys.append(
            f"tenant-resolve:{tenant.subdomain}"
        )

    # Development
    keys.append("tenant-resolve:localhost:3000")

    for key in keys:
        await redis_client.delete(key)

async def require_owner(
    tenant_id: uuid.UUID,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    """Stricter than require_tenant_access — only the tenant's owner (or a
    superadmin) may pass. Use this on endpoints like inviting/removing
    members or deleting the tenant itself."""

    if user.is_superadmin:
        return user

    result = await db.execute(
        select(TenantMembership).where(
            TenantMembership.tenant_id == tenant_id,
            TenantMembership.user_id == uuid.UUID(user.id),
            TenantMembership.role == TenantRole.owner,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the owner can do this")
    return user


def require_superadmin(
    user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    if not user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required",
        )
    return user


async def require_tenant_access(
    tenant_id: uuid.UUID,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    if user.is_superadmin:
        return user

    result = await db.execute(
        select(TenantMembership).where(
            TenantMembership.tenant_id == tenant_id,
            TenantMembership.user_id == uuid.UUID(user.id),
        )
    )

    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed for this tenant",
        )

    return user