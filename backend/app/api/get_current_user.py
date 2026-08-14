import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.db.session import get_db


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)


class CurrentUser:
    def __init__(self, id: str, is_superadmin: bool):
        self.id = id
        self.is_superadmin = is_superadmin


async def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> CurrentUser:
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    return CurrentUser(
        id=user_id,
        is_superadmin=bool(
            payload.get("is_superadmin", False)
        ),
    )