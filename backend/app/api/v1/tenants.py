
import uuid
from datetime import date
from calendar import monthrange
from app.models.unanswered_question import UnansweredQuestion
from app.schemas.generator import GenerateProjectRequest, GenerateProjectResponse, GenerateProjectAIRequest
from app.api.deps import require_tenant_access, require_permission, slugify
from app.api.open_ai import generate_hotel_plan, generate_tenant_update
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tenant_knowledge import TenantKnowledge
from app.core.redis import (
    get_tenant_cache,
    add_tenant_cache,
    delete_tenant_cache_for_tenant,
)
from app.core.config import settings
from app.models.booking import (
    Booking,
    BookingStatus,
)
from app.schemas.ai_sections import GenerateKnowledgeRequest
from fastapi import status
from app.models.tenant_membership import TenantMembership
from app.helpers.build_sections import build_sections, normalize_page_slug, normalize_page_sections
from app.models.property import Property
from app.models.property_block import PropertyBlock
from app.models.property_calendar_source import PropertyCalendarSource
from app.services.payments.payment_service import (
    get_payment_provider,
)
from pydantic import BaseModel, EmailStr
from app.models.payment_method import PaymentMethod
from app.models.theme_history import ThemeHistory
from app.models.page import Page
from app.api.get_current_user import CurrentUser, get_current_user
from app.db.session import get_db
from app.models.tenant import Tenant
from app.models.tenant_membership import TenantMembership, TenantRole
from app.schemas.entities import TenantOut, TenantFullOut, ThemeSchema
from app.models.tenant_payment_settings import TenantPaymentSettings
from app.schemas.payment import TenantPaymentSettingsOut, TenantPaymentSettingsUpdate
from app.core.security import (
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/tenants", tags=["tenants"])

class CancellationPolicyUpdate(BaseModel):
    free_cancellation_days: int
    partial_refund_hours: int
    partial_refund_percent: int

class TenantEmailSettingsUpdate(BaseModel):
    booking_email: EmailStr


class TenantEmailSettingsOut(BaseModel):
    booking_email: EmailStr | None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.get("", response_model=list[TenantOut])
async def get_my_tenants(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Tenant)
        .where(
            Tenant.created_by_user_id == uuid.UUID(user.id),
            # Tenant.deleted.is_(False),
        )
        .order_by(Tenant.created_at.desc())
    )

    return result.scalars().all()

@router.post("/generate", response_model=GenerateProjectResponse)
async def generate_project(
    payload: GenerateProjectRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    subdomain = slugify(payload.name)

    tenant = Tenant(
        name=payload.name,
        subdomain=subdomain,
        short_description=payload.short_description,
        created_by_user_id=uuid.UUID(user.id),
    )

    db.add(tenant)
    await db.flush()
    tenant_account = TenantMembership(
        tenant_id=tenant.id,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        role=TenantRole.owner,
        permissions={},
    )

    db.add(tenant_account)

    home = Page(
        tenant_id=tenant.id,
        slug="index",
        key="index",
        name={
            "en": "Home",
        },
        layout_variant="default",
        sort_order=0,
        sections=[
            {
                "id": "hero",
                "type": "hero",
                "content": {
                    "heading": {
                        "en": "Home",
                    },
                    "text": {
                        "en": "",
                    },
                    "image": "",
                },
                "layout": None,
                "theme": {},
            }
        ],
        theme={},
        is_system=False,
    )

    accommodation_page = Page(
        tenant_id=tenant.id,
        slug="accommodation",
        key="accommodation",
        name={
            "en": "Accommodation",
        },
        layout_variant="default",
        sort_order=1,
        sections=[
            {
                "id": "property-grid",
                "type": "property-grid",
                "content": {
                    "heading": {
                        "en": "Book your stay",
                    },
                    "text": {
                        "en": "Choose your dates and find the perfect place to stay.",
                    },
                },
                "layout": None,
                "theme": {},
            }
        ],
        theme={},
        is_system=True,
    )

    pages = []

    for index, page_name in enumerate(
        payload.pages,
        start=2,
    ):
        page_name = page_name.strip()

        if not page_name:
            continue

        slug = slugify(page_name)

        page = Page(
            tenant_id=tenant.id,
            slug=slug,
            key=slug,
            name={
                "en": page_name,
            },
            layout_variant="default",
            sort_order=index,
            sections=[
                {
                    "id": "hero",
                    "type": "hero",
                    "content": {
                        "heading": {
                            "en": page_name,
                        },
                        "text": {
                            "en": "",
                        },
                        "image": "",
                    },
                    "layout": None,
                    "theme": {},
                }
            ],
            theme={},
            is_system=False,
        )

        pages.append(page)

    pages.append(home)
    pages.append(accommodation_page)
    db.add_all(pages)

    await db.commit()
    await db.refresh(tenant)

    return GenerateProjectResponse(
        tenant_id=str(tenant.id),
        message="Project created successfully",
    )

@router.get("/caddy/ask")
async def caddy_ask(
    domain: str,
    db: AsyncSession = Depends(get_db),
):
    if domain.startswith("localhost"):
        raise HTTPException(
            status_code=404,
            detail="Invalid domain",
        )

    subdomain = domain.split(".")[0]
    result = await db.execute(
        select(Tenant.id).where(
            (Tenant.custom_domain == domain)
            | (Tenant.subdomain == subdomain)
        )
    )

    tenant_id = result.scalar_one_or_none()

    if not tenant_id:
        raise HTTPException(
            status_code=404,
            detail="No tenant for this host",
        )

    return {"allowed": True}

@router.get("/resolve", response_model=TenantFullOut)
async def resolve_tenant_by_host(
    host: str,
    db: AsyncSession = Depends(get_db),
):
    cached = await get_tenant_cache(host)

    if cached:
        return TenantFullOut.model_validate_json(cached)

    if host.startswith("localhost"):
        subdomain = "laughing-goat-ghana"
    else:
        subdomain = host.split(".")[0]

    result = await db.execute(
        select(Tenant).where(
            (Tenant.custom_domain == host)
            | (Tenant.subdomain == subdomain)
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tenant for this host",
        )

    result = await db.execute(
        select(Page)
        .where(Page.tenant_id == tenant.id)
        .order_by(Page.sort_order)
    )

    pages = result.scalars().all()

    full = TenantFullOut(
        tenant=TenantOut.model_validate(tenant),
        pages=pages,
    )

    await add_tenant_cache(
        host,
        full.model_dump_json(),
        settings.cache_ttl_seconds,
    )

    return full

@router.get("/{tenant_id}", response_model=TenantFullOut)
async def get_tenant_by_id(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    pages_result = await db.execute(
        select(Page)
        .where(
            Page.tenant_id == tenant_id
        )
        .order_by(Page.sort_order)
    )

    pages = pages_result.scalars().all()

    return TenantFullOut(
        tenant=TenantOut.model_validate(
            tenant
        ),
        pages=pages,
    )


@router.get("/{tenant_id}/pages", response_model=TenantFullOut)
async def get_tenant_full(tenant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Public — everything about a tenant in one call: tenant info plus
    every page's fields. This is what a tenant's site (or a debug view)
    can fetch to render the whole thing at once."""

    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    result = await db.execute(select(Page).where(Page.tenant_id == tenant_id))
    pages = result.scalars().all()

    return TenantFullOut(tenant=TenantOut.model_validate(tenant), pages=pages)

@router.put(
    "/{tenant_id}/theme",
    response_model=ThemeSchema,
)
async def update_tenant_theme(
    tenant_id: uuid.UUID,
    payload: ThemeSchema,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    ),
):
    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )

    tenant.theme = payload.model_dump()

    await db.commit()
    await db.refresh(tenant) 

    await delete_tenant_cache_for_tenant(
        tenant
    )

    return tenant.theme


@router.put("/{tenant_id}/cancellation-policy")
async def update_cancellation_policy(
    tenant_id: uuid.UUID,
    payload: CancellationPolicyUpdate,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    )
):
    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )

    tenant.cancellation_policy = (
        payload.model_dump()
    )

    await db.commit()
    await db.refresh(tenant)

    return tenant.cancellation_policy
    
@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def soft_or_hard_delete_tenant(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id,
            Tenant.created_by_user_id == uuid.UUID(user.id),
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    # Second delete -> hard delete
    if tenant.deleted:
        await delete_tenant_cache_for_tenant(tenant)

        await db.delete(tenant)
        await db.commit()

        return

    # First delete -> soft delete
    tenant.deleted = True
    tenant.is_active = False

    await db.commit()

    await delete_tenant_cache_for_tenant(tenant)


@router.get("/{tenant_id}/unanswered-questions")
async def get_unanswered_questions(
    tenant_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _access=Depends(require_tenant_access),
):
    offset = (page - 1) * page_size

    total_result = await db.execute(
        select(func.count(UnansweredQuestion.id)).where(
            UnansweredQuestion.tenant_id == tenant_id
        )
    )

    total = total_result.scalar_one()

    result = await db.execute(
        select(UnansweredQuestion)
        .where(
            UnansweredQuestion.tenant_id == tenant_id
        )
        .order_by(
            UnansweredQuestion.count.desc(),
        )
        .offset(offset)
        .limit(page_size)
    )

    items = result.scalars().all()

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "pages": max(
            1,
            (total + page_size - 1) // page_size,
        ),
    }


@router.delete("/{tenant_id}/unanswered-questions/{question_id}", status_code=204)
async def delete_unanswered_question(
    tenant_id: uuid.UUID,
    question_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    ),
):
    result = await db.execute(
        select(UnansweredQuestion).where(
            UnansweredQuestion.id == question_id,
            UnansweredQuestion.tenant_id == tenant_id,
        )
    )

    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Unanswered question not found",
        )

    await db.delete(item)
    await db.commit()

@router.put("/{tenant_id}/payment-settings",response_model=TenantPaymentSettingsOut)
async def update_tenant_payment_settings(
    tenant_id: uuid.UUID,
    payload: TenantPaymentSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("payments.edit")
    ),
):
    result = await db.execute(
        select(TenantPaymentSettings).where(
            TenantPaymentSettings.tenant_id == tenant_id
        )
    )

    settings = result.scalar_one_or_none()

    if not settings:
        settings = TenantPaymentSettings(
            tenant_id=tenant_id,
        )
        db.add(settings)

    for method in payload.methods:
        setattr(
            settings,
            method.key,
            method.enabled,
        )

    settings.bank_name = payload.bank_name
    settings.account_name = payload.account_name
    settings.account_number = payload.account_number
    settings.iban = payload.iban
    settings.swift = payload.swift
    settings.bank_instructions = payload.bank_instructions

    try:
        await db.commit()
        await db.refresh(settings)

        methods_result = await db.execute(
            select(PaymentMethod)
            .where(PaymentMethod.is_active.is_(True))
            .order_by(PaymentMethod.sort_order)
        )

        methods = methods_result.scalars().all()

        return {
            "id": settings.id,
            "tenant_id": settings.tenant_id,

            "methods": [
                {
                    "id": method.id,
                    "key": method.key,
                    "name": method.name,
                    "description": method.description,
                    "enabled": getattr(
                        settings,
                        method.key,
                        False,
                    ),
                }
                for method in methods
            ],

            "bank_name": settings.bank_name,
            "account_name": settings.account_name,
            "account_number": settings.account_number,
            "iban": settings.iban,
            "swift": settings.swift,
            "bank_instructions": settings.bank_instructions,
        }

    except Exception as error:
        await db.rollback()

        print(
            "UPDATE TENANT PAYMENT SETTINGS ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Could not update payment settings",
        )

# TODO Ändra frontend
@router.post("/booking/{public_token}")
async def create_booking_payment(
    tenant_id: uuid.UUID,
    public_token: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking).where(
            Booking.tenant_id == tenant_id,
            Booking.public_token == public_token,
        )
    )

    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if (
        booking.status
        != BookingStatus.pending_payment
    ):
        raise HTTPException(
            status_code=400,
            detail="Booking is not awaiting payment",
        )

    if not booking.guest_email:
        raise HTTPException(
            status_code=400,
            detail="Booking has no guest email",
        )

    provider = get_payment_provider("stripe")

    payment = await provider.create_payment(
        amount=int(
            round(booking.total_price * 100)
        ),
        currency="usd",
        email=booking.guest_email,
        reference=str(booking.id),
        metadata={
            "booking_id": str(booking.id),
            "tenant_id": str(tenant_id),
            "public_token": booking.public_token,
        },
    )

    booking.provider_payment_intent_id = (
        payment.payment_id
    )

    await db.commit()

    return {
        "booking_id": str(booking.id),
        "public_token": booking.public_token,
        "amount": booking.total_price,
        "currency": "USD",
        "status": booking.status.value,
        "provider": payment.provider,
        "payment_id": payment.payment_id,
        "client_secret": payment.client_secret,
    }

@router.get("/{tenant_id}/payment-settings")
async def get_tenant_payment_settings(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("payments.view")
    ),
):
    methods_result = await db.execute(
        select(PaymentMethod)
        .where(
            PaymentMethod.is_active.is_(True)
        )
        .order_by(
            PaymentMethod.sort_order
        )
    )

    methods = methods_result.scalars().all()

    settings_result = await db.execute(
        select(TenantPaymentSettings).where(
            TenantPaymentSettings.tenant_id == tenant_id
        )
    )

    settings = settings_result.scalar_one_or_none()

    return {
        "methods": [
            {
                "id": method.id,
                "key": method.key,
                "name": method.name,
                "description": method.description,
                "enabled": (
                    getattr(settings, method.key, False)
                    if settings
                    else False
                ),
            }
            for method in methods
        ],
        "bank_name": settings.bank_name if settings else None,
        "account_name": settings.account_name if settings else None,
        "account_number": settings.account_number if settings else None,
        "iban": settings.iban if settings else None,
        "swift": settings.swift if settings else None,
        "bank_instructions": (
            settings.bank_instructions
            if settings
            else None
        ),
    }


@router.get(
    "/{tenant_id}/email-settings",
    response_model=TenantEmailSettingsOut,
)
async def get_tenant_email_settings(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("email_settings.view")
    ),
):
    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )

    return {
        "booking_email": tenant.booking_email,
    }


@router.put("/{tenant_id}/email-settings", response_model=TenantEmailSettingsOut)
async def update_tenant_email_settings(
    tenant_id: uuid.UUID,
    payload: TenantEmailSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("email_settings.edit")
    ),
):
    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )

    tenant.booking_email = str(
        payload.booking_email
    )

    try:
        await db.commit()
        await db.refresh(tenant)

        return {
            "booking_email":
                tenant.booking_email,
        }

    except Exception as error:
        await db.rollback()

        print(
            "UPDATE BOOKING EMAIL ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Could not update booking email",
        )


@router.put(
    "/{tenant_id}/password",
    status_code=204,
)
async def update_password(
    tenant_id: uuid.UUID,
    payload: PasswordUpdate,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_tenant_access
    ),
):
    if not verify_password(
        payload.current_password,
        _access.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    _access.hashed_password = hash_password(
        payload.new_password
    )

    try:
        await db.commit()

    except Exception as error:
        await db.rollback()

        print(
            "UPDATE TENANT PASSWORD ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update password",
        )


@router.get("/{tenant_id}/dashboard/bookings")
async def get_dashboard_bookings(
    tenant_id: uuid.UUID,
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("bookings.view")
    )
):
    first_day = date(
        year,
        month,
        1,
    )

    last_day = date(
        year,
        month,
        monthrange(year, month)[1],
    )

    next_month = (
        date(year + 1, 1, 1)
        if month == 12
        else date(year, month + 1, 1)
    )

    booking_result = await db.execute(
        select(
            Booking,
            Property.name.label("property_name"),
        )
        .join(
            Property,
            Property.id == Booking.property_id,
        )
        .where(
            Booking.tenant_id == tenant_id,
            Booking.check_in < next_month,
            Booking.check_out > first_day,
        )
        .order_by(
            Booking.check_in.asc()
        )
    )

    bookings = []

    for booking, property_name in booking_result.all():
        bookings.append(
            {
                "id": booking.id,
                "booking_ref": booking.booking_ref,
                "guest_name": booking.guest_name,
                "guest_email": booking.guest_email,
                "guest_phone": booking.guest_phone,

                "property_id": booking.property_id,
                "property_name": property_name,

                "check_in": booking.check_in,
                "check_out": booking.check_out,

                "guests": booking.guests,
                "units": booking.units,
                "total_price": booking.total_price,

                "status": booking.status.value,

                "source": booking.source or "direct",
                "external": False,
            }
        )

    block_result = await db.execute(
        select(
            PropertyBlock,
            Property.name.label("property_name"),
            PropertyCalendarSource.name.label("source_name"),
        )
        .join(
            Property,
            Property.id == PropertyBlock.property_id,
        )
        .join(
            PropertyCalendarSource,
            PropertyCalendarSource.id == PropertyBlock.source_id,
        )
        .where(
            Property.tenant_id == tenant_id,
            PropertyBlock.start_date < next_month,
            PropertyBlock.end_date > first_day,
        )
        .order_by(
            PropertyBlock.start_date.asc()
        )
    )

    for block, property_name, source_name in block_result.all():
        bookings.append(
            {
                "id": block.id,
                "booking_ref": block.external_id,
                "guest_name": None,
                "guest_email": None,
                "guest_phone": None,

                "property_id": block.property_id,
                "property_name": property_name,

                "check_in": block.start_date,
                "check_out": block.end_date,

                "guests": None,
                "units": None,
                "total_price": None,

                "status": "confirmed",

                "source": source_name,
                "external": True,
            }
        )

    bookings.sort(
        key=lambda item: item["check_in"]
    )

    return {
        "year": year,
        "month": month,
        "days_in_month": last_day.day,
        "bookings": bookings,
    }


@router.put("/{tenant_id}/bookings/{booking_id}/cancel")
async def cancel_booking(
    tenant_id: uuid.UUID,
    booking_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("bookings.edit")
    )
):
    result = await db.execute(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.tenant_id == tenant_id,
        )
    )

    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if booking.status == BookingStatus.cancelled:
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled",
        )

    booking.status = BookingStatus.cancelled

    try:
        await db.commit()
        await db.refresh(booking)

        return {
            "id": booking.id,
            "status": booking.status.value,
        }

    except Exception as error:
        await db.rollback()

        print(
            "CANCEL BOOKING ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Could not cancel booking",
        )

@router.post("/ai-generate", response_model=GenerateProjectResponse)
async def ai_generate_project(
    payload: GenerateProjectAIRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    plan = await generate_hotel_plan(
        payload.prompt
    )

    tenant = Tenant(
        name=plan.tenant.name,
        subdomain=slugify(
            plan.tenant.name
        ),
        category=plan.tenant.category,
        location=plan.tenant.location,
        short_description=plan.tenant.short_description,
        theme=plan.theme.model_dump(),
        created_by_user_id=uuid.UUID(
            user.id
        ),
    )

    db.add(tenant)
    await db.flush()

    properties = [
        Property(
            tenant_id=tenant.id,
            name=f"Property {i}",
            description=None,
            max_guests=2,
            bedrooms=1,
            beds=1,
            bathrooms=1,
            units=1,
            amenities=[],
            is_open=True,
        )
        for i in range(1, plan.property_count + 1)
    ]

    db.add_all(properties)

    membership = TenantMembership(
        tenant_id=tenant.id,
        username=payload.email,
        hashed_password=hash_password(
            payload.password
        ),
        role=TenantRole.owner,
        permissions={},
    )

    db.add(membership)

    for index, generated_page in enumerate(
        plan.pages
    ):
        slug = normalize_page_slug(
            generated_page
        )
        db.add(
            Page(
                tenant_id=tenant.id,
                name={
                    "en": generated_page.name
                },
                slug=slug,
                key=slug,
                sort_order=index,
                layout_variant="default",
                sections=normalize_page_sections(
                    generated_page
                ),
                theme={},
                is_system=(
                    generated_page.slug
                    in {
                        "index",
                        "accommodation",
                    }
                ),
            )
        )

    await db.commit()

    return GenerateProjectResponse(
        tenant_id=str(tenant.id),
        message="Project created",
    )


@router.post("/{tenant_id}/ai/update", status_code=status.HTTP_200_OK)
async def update_tenant_from_prompt(
    tenant_id: uuid.UUID,
    payload: GenerateKnowledgeRequest,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    ),
):
    tenant_result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id
        )
    )

    tenant = tenant_result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )

    plan = await generate_tenant_update(
        payload.prompt
    )

    # Theme
    if plan.theme:
        tenant.theme = plan.theme.model_dump()

    # Knowledge / FAQ
    for item in plan.knowledge:
        db.add(
            TenantKnowledge(
                tenant_id=tenant.id,
                category=item.category,
                intent=item.intent,
                question=item.question.model_dump(),
                answer=item.answer.model_dump(),
                source="ai",
                priority=0,
                is_active=True,
            )
        )

    # Pages
    for generated_page in plan.pages:
        slug = normalize_page_slug(
            generated_page
        )

        page_result = await db.execute(
            select(Page).where(
                Page.tenant_id == tenant.id,
                Page.slug == slug,
            )
        )

        page = page_result.scalar_one_or_none()

        if page:
            page.sections = build_sections(
                generated_page.sections
            )

            page.name = {
                "en": generated_page.name
            }

        else:
            db.add(
                Page(
                    tenant_id=tenant.id,
                    slug=slug,
                    key=slug,
                    name={
                        "en": generated_page.name
                    },
                    layout_variant="default",
                    sort_order=100,
                    sections=build_sections(
                        generated_page.sections
                    ),
                    theme={},
                    is_system=False,
                )
            )

    await db.commit()

    await delete_tenant_cache_for_tenant(
        tenant
    )

    return {
        "message": "Tenant updated successfully"
    }