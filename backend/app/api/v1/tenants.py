
import uuid
from datetime import date
from calendar import monthrange
from app.models.user import User
from app.models.unanswered_question import UnansweredQuestion
from app.schemas.generator import GenerateProjectRequest, GenerateProjectResponse
from app.api.deps import require_tenant_access, invalidate_tenant_cache_for_tenant
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, delete, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.redis import redis_client
from app.core.config import settings
from app.models.booking import (
    Booking,
    BookingStatus,
)
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
from app.models.tenant_membership import TenantMembership
from app.schemas.entities import TenantCreate, TenantOut, TenantFullOut, ThemeSchema
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

def _default_pages(tenant_id: uuid.UUID) -> list[Page]:
    """Minimal starter template every new tenant gets: an index page and a
    contact page, with a couple of placeholder fields the owner can edit
    right away from the admin."""
    return [
         Page(
            tenant_id=tenant_id,
            slug="index",
            key="home",
            name={
                "en": "Home",
                "sv": "Hem",
            },
            sections=[
                {
                    "id": "hero",
                    "type": "hero",
                    "content": {
                        "heading": {
                            "en": "Welcome to Laughing Goat Ghana"
                        },
                        "text": {
                            "en": "A beautiful hotel in Ghana."
                        },
                        "image": "",
                        "button": {
                            "label": {
                                "en": "Book your stay"
                            },
                            "href": "/booking"
                        }
                    }
                },
                {
                    "id": "intro",
                    "type": "image-text",
                    "layout": "image-left",
                    "content": {
                        "image": "",
                        "heading": {
                            "en": "Relax and enjoy your stay"
                        },
                        "text": {
                            "en": "Experience a peaceful stay surrounded by beautiful nature in Ghana."
                        },
                        "button": {
                            "label": {
                                "en": "Learn more"
                            },
                            "href": "/about-us"
                        }
                    }
                },
                {
                    "id": "experience",
                    "type": "image-text",
                    "layout": "image-right",
                    "content": {
                        "image": "",
                        "heading": {
                            "en": "Experience Ghana"
                        },
                        "text": {
                            "en": "Discover the beauty, culture and experiences that Ghana has to offer."
                        },
                        "button": {
                            "label": {
                                "en": "Discover Ghana"
                            },
                            "href": "/activities"
                        }
                    }
                },
                {
                    "id": "gallery",
                    "type": "gallery",
                    "content": {
                        "heading": {
                            "en": "Our Hotel"
                        },
                        "images": [
                            {
                                "image": "",
                                "alt": "Hotel"
                            },
                            {
                                "image": "",
                                "alt": "Hotel room"
                            },
                            {
                                "image": "",
                                "alt": "Hotel surroundings"
                            },
                            {
                                "image": "",
                                "alt": "Ghana"
                            }
                        ]
                    }
                },
                {
                    "id": "rooms",
                    "type": "room-grid",
                    "content": {
                        "heading": {
                            "en": "Our Rooms"
                        },
                        "text": {
                            "en": "Choose the perfect room for your stay."
                        },
                        "limit": 6
                    }
                },
                {
                    "id": "amenities",
                    "type": "amenities",
                    "content": {
                        "heading": {
                            "en": "Hotel Facilities"
                        },
                        "items": [
                            {
                                "icon": "wifi",
                                "title": {
                                    "en": "Free WiFi"
                                },
                                "text": {
                                    "en": "Stay connected throughout the hotel."
                                }
                            },
                            {
                                "icon": "pool",
                                "title": {
                                    "en": "Swimming Pool"
                                },
                                "text": {
                                    "en": "Relax by our swimming pool."
                                }
                            },
                            {
                                "icon": "restaurant",
                                "title": {
                                    "en": "Restaurant"
                                },
                                "text": {
                                    "en": "Enjoy delicious local and international food."
                                }
                            }
                        ]
                    }
                },
                {
                    "id": "cta",
                    "type": "cta",
                    "content": {
                        "heading": {
                            "en": "Ready to stay with us?"
                        },
                        "text": {
                            "en": "Book your room and experience Laughing Goat Ghana."
                        },
                        "button": {
                            "label": {
                                "en": "Book now"
                            },
                            "href": "/booking"
                        }
                    }
                }
            ],
            theme={}
        ),
        
        Page(
            tenant_id=tenant_id,
            slug="about-us",
            key="about",
            name={
                "en": "About us",
                "sv": "Om oss",
            },
            sections=[
                {
                    "id": "hero",
                    "type": "hero",
                    "content": {
                        "heading": {
                            "en": "About Laughing Goat Ghana"
                        },
                        "text": {
                            "en": "A beautiful place to relax, explore and experience Ghana."
                        },
                        "image": ""
                    }
                },
                {
                    "id": "story",
                    "type": "image-text",
                    "layout": "image-left",
                    "content": {
                        "image": "",
                        "heading": {
                            "en": "Our Story"
                        },
                        "text": {
                            "en": "Tell your guests about your hotel, your team and what makes your property special."
                        }
                    }
                },
                {
                    "id": "amenities",
                    "type": "amenities",
                    "content": {
                        "heading": {
                            "en": "Why Stay With Us?"
                        },
                        "items": [
                            {
                                "icon": "wifi",
                                "title": {
                                    "en": "Free WiFi"
                                },
                                "text": {
                                    "en": "Fast and reliable internet."
                                }
                            },
                            {
                                "icon": "location",
                                "title": {
                                    "en": "Great Location"
                                },
                                "text": {
                                    "en": "A beautiful location in Ghana."
                                }
                            },
                            {
                                "icon": "heart",
                                "title": {
                                    "en": "Personal Service"
                                },
                                "text": {
                                    "en": "We want every guest to feel at home."
                                }
                            }
                        ]
                    }
                }
            ],
            theme={}
        ),

        Page(
            tenant_id=tenant_id,
            slug="contact",
            key="contact",
            name={
                "en": "Contact",
                "sv": "Kontakt",
            },
            sections=[
                {
                    "id": "hero",
                    "type": "hero",
                    "content": {
                        "heading": {
                            "en": "Contact Us"
                        },
                        "text": {
                            "en": "We would love to hear from you."
                        },
                        "image": ""
                    }
                },
                {
                    "id": "contact-info",
                    "type": "contact-info",
                    "content": {
                        "address": {
                            "en": ""
                        },
                        "phone": {
                            "en": ""
                        },
                        "email": {
                            "en": ""
                        }
                    }
                },
                {
                    "id": "contact-form",
                    "type": "contact-form",
                    "content": {
                        "heading": {
                            "en": "Send us a message"
                        }
                    }
                }
            ],
            theme={}
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

    print("create_tenant")
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
            result = await db.execute(
                select(Tenant).where(
                    Tenant.deleted.is_(False)
                )
            )
        else:
            result = await db.execute(
                select(Tenant)
                .join(
                    TenantMembership,
                    TenantMembership.tenant_id == Tenant.id,
                )
                .where(
                    TenantMembership.user_id == uuid.UUID(user.id),
                    Tenant.deleted.is_(False),
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
        booking_email="user.email",
        short_description="A beautiful hotel in Ghana.",
    )

    print("generate_project") 
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
            slug="accommodation",
            key="accommodation",
            name={
                "en": "Accommodation",
                "sv": "Boende",
            },
            layout_variant="default",
            sort_order=1,
            sections=[
                {
                    "id": "property-grid",
                    "type": "property-grid",
                    "content": {
                        "heading": {
                            "en": "Book your stay"
                        },
                        "text": {
                            "en": "Choose your dates and find the perfect place to stay."
                        },
                    },
                    "layout": None,
                    "theme": {},
                }
            ],
            theme={},
            is_system=True,
        ),
        Page(
            tenant_id=tenant.id,
            slug="index",
            key="home",
            name={
                "en": "Home",
                "sv": "Hem",
            },
            sections=[
                {
                    "id": "hero",
                    "type": "hero",
                    "content": {
                        "heading": {
                            "en": "Welcome to Laughing Goat Ghana"
                        },
                        "text": {
                            "en": "A beautiful hotel in Ghana."
                        },
                        "image": "",
                        "button": {
                            "label": {
                                "en": "Book your stay"
                            },
                            "href": "/booking"
                        }
                    }
                },
                {
                    "id": "intro",
                    "type": "image-text",
                    "layout": "image-left",
                    "content": {
                        "image": "",
                        "heading": {
                            "en": "Relax and enjoy your stay"
                        },
                        "text": {
                            "en": "Experience a peaceful stay surrounded by beautiful nature in Ghana."
                        },
                        "button": {
                            "label": {
                                "en": "Learn more"
                            },
                            "href": "/about-us"
                        }
                    }
                },
                {
                    "id": "experience",
                    "type": "image-text",
                    "layout": "image-right",
                    "content": {
                        "image": "",
                        "heading": {
                            "en": "Experience Ghana"
                        },
                        "text": {
                            "en": "Discover the beauty, culture and experiences that Ghana has to offer."
                        },
                        "button": {
                            "label": {
                                "en": "Discover Ghana"
                            },
                            "href": "/activities"
                        }
                    }
                },
                {
                    "id": "gallery",
                    "type": "gallery",
                    "content": {
                        "heading": {
                            "en": "Our Hotel"
                        },
                        "images": [
                            {
                                "image": "",
                                "alt": "Hotel"
                            },
                            {
                                "image": "",
                                "alt": "Hotel room"
                            },
                            {
                                "image": "",
                                "alt": "Hotel surroundings"
                            },
                            {
                                "image": "",
                                "alt": "Ghana"
                            }
                        ]
                    }
                },
                {
                    "id": "rooms",
                    "type": "room-grid",
                    "content": {
                        "heading": {
                            "en": "Our Rooms"
                        },
                        "text": {
                            "en": "Choose the perfect room for your stay."
                        },
                        "limit": 6
                    }
                },
                {
                    "id": "amenities",
                    "type": "amenities",
                    "content": {
                        "heading": {
                            "en": "Hotel Facilities"
                        },
                        "items": [
                            {
                                "icon": "wifi",
                                "title": {
                                    "en": "Free WiFi"
                                },
                                "text": {
                                    "en": "Stay connected throughout the hotel."
                                }
                            },
                            {
                                "icon": "pool",
                                "title": {
                                    "en": "Swimming Pool"
                                },
                                "text": {
                                    "en": "Relax by our swimming pool."
                                }
                            },
                            {
                                "icon": "restaurant",
                                "title": {
                                    "en": "Restaurant"
                                },
                                "text": {
                                    "en": "Enjoy delicious local and international food."
                                }
                            }
                        ]
                    }
                },
                {
                    "id": "cta",
                    "type": "cta",
                    "content": {
                        "heading": {
                            "en": "Ready to stay with us?"
                        },
                        "text": {
                            "en": "Book your room and experience Laughing Goat Ghana."
                        },
                        "button": {
                            "label": {
                                "en": "Book now"
                            },
                            "href": "/booking"
                        }
                    }
                }
            ],
            theme={}
        ),

        Page(
            tenant_id=tenant.id,
            slug="about-us",
            key="about",
            name={
                "en": "About us",
                "sv": "Om oss",
            },
            sections=[
                {
                    "id": "hero",
                    "type": "hero",
                    "content": {
                        "heading": {
                            "en": "About Laughing Goat Ghana"
                        },
                        "text": {
                            "en": "A beautiful place to relax, explore and experience Ghana."
                        },
                        "image": ""
                    }
                },
                {
                    "id": "story",
                    "type": "image-text",
                    "layout": "image-left",
                    "content": {
                        "image": "",
                        "heading": {
                            "en": "Our Story"
                        },
                        "text": {
                            "en": "Tell your guests about your hotel, your team and what makes your property special."
                        }
                    }
                },
                {
                    "id": "amenities",
                    "type": "amenities",
                    "content": {
                        "heading": {
                            "en": "Why Stay With Us?"
                        },
                        "items": [
                            {
                                "icon": "wifi",
                                "title": {
                                    "en": "Free WiFi"
                                },
                                "text": {
                                    "en": "Fast and reliable internet."
                                }
                            },
                            {
                                "icon": "location",
                                "title": {
                                    "en": "Great Location"
                                },
                                "text": {
                                    "en": "A beautiful location in Ghana."
                                }
                            },
                            {
                                "icon": "heart",
                                "title": {
                                    "en": "Personal Service"
                                },
                                "text": {
                                    "en": "We want every guest to feel at home."
                                }
                            }
                        ]
                    }
                }
            ],
            theme={}
        ),

        Page(
            tenant_id=tenant.id,
            slug="contact",
            key="contact",
            name={
                "en": "Contact",
                "sv": "Kontakt",
            },
            sections=[
                {
                    "id": "hero",
                    "type": "hero",
                    "content": {
                        "heading": {
                            "en": "Contact Us"
                        },
                        "text": {
                            "en": "We would love to hear from you."
                        },
                        "image": ""
                    }
                },
                {
                    "id": "contact-info",
                    "type": "contact-info",
                    "content": {
                        "address": {
                            "en": ""
                        },
                        "phone": {
                            "en": ""
                        },
                        "email": {
                            "en": ""
                        }
                    }
                },
                {
                    "id": "contact-form",
                    "type": "contact-form",
                    "content": {
                        "heading": {
                            "en": "Send us a message"
                        }
                    }
                }
            ],
            theme={}
        ),

    ]
    db.add_all(pages)

    # rooms = [
    #     Room(
    #         tenant_id=tenant.id,
    #         name=f"Room {i}",
    #         description=None,
    #         max_guests=2,
    #         bedrooms=1,
    #         beds=1,
    #         bathrooms=1,
    #         quantity=1,
    #         is_open=True,
    #     )
    #     for i in range(1, 10)
    # ]
    # db.add_all(rooms)

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
    print("RESOLVE HOST:", host)
    cache_key = f"tenant-resolve:{host}"
    cached = await redis_client.get(cache_key)

    if cached:
        full = TenantFullOut.model_validate_json(cached)

        await redis_client.sadd(
            f"tenant-cache-keys:{full.tenant.id}",
            cache_key,
        )

        return full

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

    full = TenantFullOut(
        tenant=TenantOut.model_validate(tenant),
        pages=pages,
    )

    await redis_client.set(
        cache_key,
        full.model_dump_json(),
        ex=settings.cache_ttl_seconds,
    )

    await redis_client.sadd(
        f"tenant-cache-keys:{tenant.id}",
        cache_key,
    )

    await redis_client.expire(
        f"tenant-cache-keys:{tenant.id}",
        settings.cache_ttl_seconds,
    )

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

@router.put("/{tenant_id}/theme", response_model=ThemeSchema)
async def update_tenant_theme(
    tenant_id: uuid.UUID,
    payload: ThemeSchema,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )
    
    if tenant.theme:
        history = ThemeHistory(
            tenant_id=tenant.id,
            theme=tenant.theme.copy(),
        )

        db.add(history)

    # Sätt nya temat
    incoming = payload.model_dump(
        exclude_unset=True
    )

    current = tenant.theme or {}

    tenant.theme = {
        **current,
        **incoming,
    }

    # Behåll endast de 20 senaste
    await db.flush()

    result = await db.execute(
        select(ThemeHistory.id)
        .where(
            ThemeHistory.tenant_id == tenant.id
        )
        .order_by(
            ThemeHistory.created_at.desc()
        )
        .offset(20)
    )

    old_ids = result.scalars().all()

    if old_ids:
        await db.execute(
            delete(ThemeHistory).where(
                ThemeHistory.id.in_(old_ids)
            )
        )

    await db.commit()
    await db.refresh(tenant)
    await invalidate_tenant_cache_for_tenant(
        tenant
    )
    return tenant.theme


@router.put("/{tenant_id}/cancellation-policy")
async def update_cancellation_policy(
    tenant_id: uuid.UUID,
    payload: CancellationPolicyUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
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


@router.delete("/{tenant_id}")
async def soft_delete_tenant(
    tenant_id: uuid.UUID,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id,
            Tenant.deleted.is_(False),
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )

    tenant.deleted = True

    await db.commit()

    return {
        "id": str(tenant.id),
        "deleted": True,
    }


@router.get("/{tenant_id}/unanswered-questions")
async def get_unanswered_questions(
    tenant_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
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
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
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
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
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
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
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
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
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
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
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


@router.put("/{tenant_id}/password", status_code=204)
async def update_password(
    tenant_id: uuid.UUID,
    payload: PasswordUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(User).where(
            User.id == uuid.UUID(user.id)
        )
    )

    db_user = result.scalar_one_or_none()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if not verify_password(
        payload.current_password,
        db_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect",
        )

    db_user.hashed_password = hash_password(
        payload.new_password
    )

    try:
        await db.commit()

    except Exception as error:
        await db.rollback()

        print(
            "UPDATE PASSWORD ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Could not update password",
        )


@router.get("/{tenant_id}/dashboard/bookings")
async def get_dashboard_bookings(
    tenant_id: uuid.UUID,
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
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
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
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