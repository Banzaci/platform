import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import require_tenant_access
from app.api.get_current_user import CurrentUser, get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.models.tenant import Tenant
from app.models.tenant_membership import TenantMembership
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, TenantLoginRequest
from app.schemas.entities import UserOut, TenantSessionOut, TenantOut

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Hotel owner signup: email + phone number + password. Returns an
    access token immediately (auto-login) so the frontend can go straight
    to the dashboard, where the owner creates their first tenant."""

    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=payload.email,
        phone_number=payload.phone_number,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=str(user.id), is_superadmin=user.is_superadmin)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    token = create_access_token(subject=str(user.id), is_superadmin=user.is_superadmin)
    return TokenResponse(access_token=token)


@router.post("/tenant/login", response_model=TokenResponse)
async def login_tenant(
    payload: TenantLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    if payload.host.startswith("localhost"):
        subdomain = "laughing-goat-ghana"
    else:
        subdomain = payload.host.split(".")[0]

    result = await db.execute(
        select(TenantMembership)
        .join(Tenant)
        .where(
            Tenant.subdomain == subdomain,
            TenantMembership.username == payload.email,
        )
    )

    membership = result.scalar_one_or_none()

    if not membership or not verify_password(
        payload.password,
        membership.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = create_access_token(
        subject=str(membership.id),
        tenant_id=str(membership.tenant_id),
        role=membership.role.value,
        token_type="tenant",
    )

    return TokenResponse(
        access_token=token,
    )

@router.get("/me/session", response_model=UserOut)
async def me_session(user: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user.id)))
    return result.scalar_one()

@router.get("/tenant/session",response_model=TenantSessionOut)
async def tenant_session(
    membership: TenantMembership = Depends(
        require_tenant_access
    ),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Tenant).where(
            Tenant.id == membership.tenant_id,
            Tenant.is_active.is_(True),
            Tenant.deleted.is_(False),
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    return TenantSessionOut(
        tenant=TenantOut.model_validate(
            tenant
        ),
        membership_id=membership.id,
        username=membership.username,
        role=membership.role,
        permissions=membership.permissions or {},
    )
