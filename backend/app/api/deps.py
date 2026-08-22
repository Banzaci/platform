import uuid
import jwt
from jwt.exceptions import PyJWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.redis import redis_client
from pydantic import BaseModel
from app.models.tenant import Tenant
from app.core.config import settings
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

class CurrentTenantUser(BaseModel):
    id: str
    tenant_id: str
    username: str
    role: TenantRole
    permissions: dict

def require_permission(permission: str):
    async def dependency(
        tenant_id: uuid.UUID,
        membership: TenantMembership = Depends(
            require_tenant_access
        ),
    ) -> TenantMembership:
        if membership.tenant_id != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed for this tenant",
            )

        if membership.role in (
            TenantRole.owner,
            TenantRole.admin,
        ):
            return membership

        permissions = membership.permissions or {}

        if permissions.get(permission) is not True:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return membership

    return dependency

async def require_tenant_access(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> TenantMembership:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            options={
                "require": ["exp", "sub"],
            },
        )

        if payload.get("type") != "tenant":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid tenant token",
            )

        membership_id_raw = payload.get("sub")
        tenant_id_raw = payload.get("tenant_id")

        if not membership_id_raw or not tenant_id_raw:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid tenant token",
            )

        membership_id = uuid.UUID(
            str(membership_id_raw)
        )

        tenant_id = uuid.UUID(
            str(tenant_id_raw)
        )

        print(tenant_id)

    except HTTPException:
        raise

    except Exception as error:
        print("TOKEN ERROR:", type(error).__name__, repr(error))

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    # except (PyJWTError, ValueError, TypeError):
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Invalid or expired token",
    #     )

    result = await db.execute(
        select(TenantMembership)
        .join(
            Tenant,
            Tenant.id == TenantMembership.tenant_id,
        )
        .where(
            TenantMembership.id == membership_id,
            TenantMembership.tenant_id == tenant_id,
            Tenant.is_active.is_(True),
            Tenant.deleted.is_(False),
        )
    )

    membership = result.scalar_one_or_none()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant access denied",
        )

    return membership