import uuid

from app.schemas.generator import GenerateProjectRequest, GenerateProjectResponse
from app.api.deps import require_tenant_access
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.redis import redis_client
from app.core.config import settings

from app.models.page import Page
from app.models.room import Room
from app.api.get_current_user import CurrentUser, get_current_user
from app.db.session import get_db
from app.models.tenant import Tenant
from app.models.tenant_membership import TenantMembership
from app.schemas.entities import TenantCreate, TenantOut, TenantFullOut

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

@router.get("", response_model=list[TenantOut])
async def get_tenants(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """The company switcher — lists every tenant this user can administer.
    Superadmins get every tenant; everyone else gets only what they hold a
    TenantMembership row for.
    """

    try:
        if user.is_superadmin:
            result = await db.execute(select(Tenant))
        else:
            result = await db.execute(
                select(Tenant)
                .join(
                    TenantMembership,
                    TenantMembership.tenant_id == Tenant.id,
                )
                .where(
                    TenantMembership.user_id == uuid.UUID(user.id)
                )
            )

        return result.scalars().all()

    except Exception as e:
        print(f"Error fetching tenants: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tenants",
        )

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


@router.get("/resolve", response_model=TenantFullOut)
async def resolve_tenant_by_host(
    host: str,
    db: AsyncSession = Depends(get_db)
):
    """Public site resolution — tendant calls this with the Host header
    it received, and gets back the tenant + all its pages in one call.
    Matches either subdomain (laughing-goat-ghana.yourplatform.com) or a
    custom_domain (www.laughinggoatghana.com)."""

    cache_key = f"tenant-resolve:{host}"
    cached = await redis_client.get(cache_key)
    if cached:
        return TenantFullOut.model_validate_json(cached)

    if host.startswith("localhost"):
        subdomain = "laughing-goat-ghana"
    else:
        subdomain = host.split(".")[0]

    result = await db.execute(
        select(Tenant).where((Tenant.custom_domain == host) | (Tenant.subdomain == subdomain))
    )
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No tenant for this host")

    result = await db.execute(select(Page).where(Page.tenant_id == tenant.id).order_by(Page.sort_order))
    pages = result.scalars().all()

    full = TenantFullOut(tenant=TenantOut.model_validate(tenant), pages=pages)
    await redis_client.set(cache_key, full.model_dump_json(), ex=settings.cache_ttl_seconds)
    return full

@router.get("/{tenant_id}", response_model=TenantOut)
async def get_tenant_by_id(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_tenant_access),
):
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return tenant


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