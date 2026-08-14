import uuid

from app.schemas.generator import GenerateProjectRequest, GenerateProjectResponse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.page import Page
from app.api.deps import CurrentUser, get_current_user
from app.db.session import get_db
from app.models.tenant import Tenant
from app.models.user import TenantMembership
from app.schemas.entities import TenantCreate, TenantOut

router = APIRouter(prefix="/tenants", tags=["tenants"])

def _default_pages(tenant_id: uuid.UUID) -> list[Page]:
    """Minimal starter template every new tenant gets: an index page and a
    contact page, with a couple of placeholder fields the owner can edit
    right away from the admin."""
    return [
        Page(
            tenant_id=tenant_id,
            slug="index",
            fields=[
                {"id": "heading", "type": "text", "label": "Heading", "value": {"en": "Welcome"}},
                {
                    "id": "intro",
                    "type": "textarea",
                    "label": "Introduction",
                    "value": {"en": "Tell your guests about your hotel."},
                },
            ],
        ),
        Page(
            tenant_id=tenant_id,
            slug="contact",
            fields=[
                {"id": "address", "type": "text", "label": "Address", "value": {"en": ""}},
                {"id": "phone", "type": "text", "label": "Phone", "value": {"en": ""}},
            ],
        ),
    ]



@router.post("", response_model=TenantOut)
async def create_tenant(
    payload: TenantCreate,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    """Any logged-in user can create a tenant — this is what a hotel owner
    does right after registering. The creator is automatically linked as
    an 'owner' member, which is what lets them manage it afterward (and
    what makes it show up in GET /auth/me/tenants)."""

    tenant = Tenant(**payload.model_dump())
    db.add(tenant)

    try:
        await db.flush()  # get tenant.id before inserting the membership, and surface subdomain/domain conflicts here
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="That subdomain (or custom domain) is already taken.",
        )

    db.add(TenantMembership(tenant_id=tenant.id, user_id=uuid.UUID(user.id), role="owner"))
    db.add_all(_default_pages(tenant.id))
    await db.commit()
    await db.refresh(tenant)
    return tenant


@router.get("/{tenant_id}", response_model=TenantOut)
async def get_tenant(tenant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    return tenant


@router.get("", response_model=list[TenantOut])
async def list_tenants(db: AsyncSession = Depends(get_db)):
    """Public — this is what the central hub site (google.com/booking.com-
    style) queries to list/search all companies. Only lightweight summary
    fields, not the full page/theme config."""

    result = await db.execute(select(Tenant).where(Tenant.is_active == True))  # noqa: E712
    return result.scalars().all()

@router.post("/generate", response_model=GenerateProjectResponse)
async def generate_project(
    payload: GenerateProjectRequest,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    tenant = Tenant(
        name="Laughing Goat Ghana",
        subdomain="laughing-goat-ghana",
        category="Hotel",
        location="Ghana",
        short_description="A beautiful hotel in Ghana.",
    )

    db.add(tenant)
    await db.flush()

    db.add(
        TenantMembership(
            tenant_id=tenant.id,
            user_id=uuid.UUID(user.id),
            role="owner",
        )
    )

    pages = [
        Page(
            tenant_id=tenant.id,
            slug="index",
            fields=[
                {
                    "id": "hero",
                    "type": "text",
                    "label": "Hero heading",
                    "value": {
                        "en": "Welcome to Laughing Goat Ghana"
                    },
                },
                {
                    "id": "image-row",
                    "type": "image-row",
                    "label": "Three images",
                    "columns": 3,
                    "value": [
                        {
                            "image": "",
                            "text": "Relax and enjoy your stay.",
                        },
                        {
                            "image": "",
                            "text": "Beautiful rooms and surroundings.",
                        },
                        {
                            "image": "",
                            "text": "Experience Ghana with us.",
                        },
                    ],
                },
            ],
        ),
        Page(
            tenant_id=tenant.id,
            slug="about-us",
            fields=[
                {
                    "id": "heading",
                    "type": "text",
                    "label": "Heading",
                    "value": {
                        "en": "About Us"
                    },
                },
                {
                    "id": "content",
                    "type": "textarea",
                    "label": "Content",
                    "value": {
                        "en": "Tell your guests about your hotel."
                    },
                },
            ],
        ),
        Page(
            tenant_id=tenant.id,
            slug="contact",
            fields=[
                {
                    "id": "heading",
                    "type": "text",
                    "label": "Heading",
                    "value": {
                        "en": "Contact Us"
                    },
                },
                {
                    "id": "address",
                    "type": "text",
                    "label": "Address",
                    "value": {
                        "en": ""
                    },
                },
                {
                    "id": "phone",
                    "type": "text",
                    "label": "Phone",
                    "value": {
                        "en": ""
                    },
                },
            ],
        ),
    ]

    db.add_all(pages)

    rooms = [
        Room(
            tenant_id=tenant.id,
            name=f"Room {i}",
            description=None,
            max_guests=2,
            bedrooms=1,
            beds=1,
            bathrooms=1,
            quantity=1,
            is_open=True,
        )
        for i in range(1, 10)
    ]

    db.add_all(rooms)

    await db.commit()
    await db.refresh(tenant)

    return GenerateProjectResponse(
        tenant_id=str(tenant.id),
        message="Project created successfully",
    )