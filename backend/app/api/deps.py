import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import TenantMembership

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class CurrentUser:
    def __init__(self, id: str, is_superadmin: bool):
        self.id = id
        self.is_superadmin = is_superadmin


async def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> CurrentUser:
    try:
        payload = decode_access_token(token)
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return CurrentUser(
        id=payload["sub"],
        is_superadmin=bool(payload.get("is_superadmin", False)),
    )


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