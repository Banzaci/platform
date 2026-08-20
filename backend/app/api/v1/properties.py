import uuid

from sqlalchemy.orm import selectinload
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base_price import BasePrice
from app.schemas.base_price import BasePriceUpsert, BasePriceOut
from app.api.deps import require_tenant_access
from app.api.get_current_user import get_current_user
from app.db.session import get_db
from app.models.property import Property
from app.schemas.property import PropertyOut, PropertyUpdate, PricePeriodOut, PricePeriodCreate
from app.models.price_period import PricePeriod
from app.helpers.property_helper import get_property_availability
from app.services.ai.booking_service import calculate_booking_price
from app.models.property_calendar_source import PropertyCalendarSource
from datetime import date
from app.models.tenant_payment_settings import TenantPaymentSettings

# from app.models.booking import Booking, BookingStatus
# from app.models.blocked_period import BlockedPeriod

router = APIRouter(
    prefix="/tenants/{tenant_id}/properties",
    tags=["properties"],
)

class PublicPaymentSettingsOut(BaseModel):
    online: bool
    pay_on_property: bool
    pay_withbank_transfer: bool

    bank_name: str | None = None
    account_name: str | None = None
    account_number: str | None = None
    iban: str | None = None
    swift: str | None = None
    bank_instructions: str | None = None


class PublicPropertyOut(BaseModel):
    property: PropertyOut
    payment_settings: PublicPaymentSettingsOut

class PropertyBulkCreate(BaseModel):
    count: int = Field(ge=1, le=100)


@router.get("", response_model=list[PropertyOut])
async def get_properties(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(Property)
        .where(Property.tenant_id == tenant_id)
        .options(
            selectinload(Property.base_price)
        )
        .order_by(Property.created_at)
    )

    return result.scalars().all()

@router.post("/bulk", response_model=list[PropertyOut])
async def create_properties_bulk(
    tenant_id: uuid.UUID,
    payload: PropertyBulkCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    try:
        properties = [
            Property(
                tenant_id=tenant_id,
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
            for i in range(1, payload.count + 1)
        ]

        db.add_all(properties)

        await db.commit()

        result = await db.execute(
            select(Property)
            .options(
                selectinload(Property.base_price)
            )
            .where(
                Property.tenant_id == tenant_id,
                Property.id.in_(
                    [property.id for property in properties]
                ),
            )
        )

        return result.scalars().all()

    except Exception:
        await db.rollback()
        raise

@router.put("/{property_id}", response_model=PropertyOut)
async def update_property(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    payload: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    try:
        result = await db.execute(
            select(Property)
            .where(
                Property.id == property_id,
                Property.tenant_id == tenant_id,
            )
            .options(
                selectinload(Property.base_price)
            )
        )

        property = result.scalar_one_or_none()

        if not property:
            raise HTTPException(
                status_code=404,
                detail="Property not found",
            )

        updates = payload.model_dump(exclude_unset=True)

        for key, value in updates.items():
            setattr(property, key, value)

        await db.commit()
        
        result = await db.execute(
            select(Property)
            .where(
                Property.id == property_id,
                Property.tenant_id == tenant_id,
            )
            .options(
                selectinload(Property.base_price)
            )
        )

        property = result.scalar_one()

        return property

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        print("UPDATE PROPERTY ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Failed to update property",
        )


@router.put(
    "/{property_id}/base-price",
    response_model=BasePriceOut,
)
async def upsert_base_price(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    payload: BasePriceUpsert,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    try:
        property_result = await db.execute(
            select(Property).where(
                Property.id == property_id,
                Property.tenant_id == tenant_id,
            )
        )

        property = property_result.scalar_one_or_none()

        if not property:
            raise HTTPException(
                status_code=404,
                detail="Property not found",
            )

        result = await db.execute(
            select(BasePrice).where(
                BasePrice.property_id == property_id
            )
        )

        base_price = result.scalar_one_or_none()

        if not base_price:
            base_price = BasePrice(
                property_id=property_id,
                daily_price=payload.daily_price,
                weekly_price=payload.weekly_price,
                monthly_price=payload.monthly_price,
            )

            db.add(base_price)

        else:
            base_price.daily_price = payload.daily_price
            base_price.weekly_price = payload.weekly_price
            base_price.monthly_price = payload.monthly_price

        await db.commit()
        await db.refresh(base_price)

        return base_price

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        print("BASE PRICE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Failed to update base price",
        )


@router.get(
    "/{property_id}/base-price",
    response_model=BasePriceOut | None,
)
async def get_base_price(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    # Kontrollera att property tillhör rätt tenant
    property_result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    property = property_result.scalar_one_or_none()

    if not property:
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    result = await db.execute(
        select(BasePrice).where(
            BasePrice.property_id == property_id
        )
    )

    return result.scalar_one_or_none()


@router.get(
    "/{property_id}/price-periods",
    response_model=list[PricePeriodOut],
)
async def get_price_periods(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    property_result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    if not property_result.scalar_one_or_none():
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    result = await db.execute(
        select(PricePeriod)
        .where(PricePeriod.property_id == property_id)
        .order_by(PricePeriod.start_date)
    )

    return result.scalars().all()


@router.post(
    "/{property_id}/price-periods",
    response_model=PricePeriodOut,
)
async def create_price_period(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    payload: PricePeriodCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date",
        )

    property_result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    if not property_result.scalar_one_or_none():
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    period = PricePeriod(
        property_id=property_id,
        name=payload.name,
        start_date=payload.start_date,
        end_date=payload.end_date,
        daily_price=payload.daily_price,
        weekly_price=payload.weekly_price,
        monthly_price=payload.monthly_price,
    )

    db.add(period)

    await db.commit()
    await db.refresh(period)

    return period


@router.delete(
    "/{property_id}/price-periods/{price_period_id}",
    status_code=204,
)
async def delete_price_period(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    price_period_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(PricePeriod)
        .join(
            Property,
            Property.id == PricePeriod.property_id,
        )
        .where(
            PricePeriod.id == price_period_id,
            PricePeriod.property_id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    period = result.scalar_one_or_none()

    if not period:
        raise HTTPException(
            status_code=404,
            detail="Price period not found",
        )

    await db.delete(period)
    await db.commit()

@router.post(
    "/{property_id}/copy",
    response_model=PropertyOut,
)
async def copy_property(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(Property)
        .where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
        .options(selectinload(Property.base_price))
    )

    source = result.scalar_one_or_none()

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    copy = Property(
        tenant_id=tenant_id,
        name=f"{source.name} copy",
        description=source.description,
        max_guests=source.max_guests,
        bedrooms=source.bedrooms,
        beds=source.beds,
        bathrooms=source.bathrooms,
        units=source.units,
        amenities=list(source.amenities or []),
        images=list(source.images or []),
        is_open=False,
    )

    db.add(copy)
    await db.flush()

    if source.base_price:
        db.add(
            BasePrice(
                property_id=copy.id,
                daily_price=source.base_price.daily_price,
                weekly_price=source.base_price.weekly_price,
                monthly_price=source.base_price.monthly_price,
            )
        )

    await db.commit()

    result = await db.execute(
        select(Property)
        .where(Property.id == copy.id)
        .options(selectinload(Property.base_price))
    )

    return result.scalar_one()


@router.delete("/{property_id}", status_code=204)
async def delete_property(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    property = result.scalar_one_or_none()

    if not property:
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    await db.delete(property)
    await db.commit()

@router.get("/public", response_model=list[PropertyOut])
async def get_public_properties(
    tenant_id: uuid.UUID,
    check_in: date | None = Query(default=None),
    check_out: date | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Property)
        .where(
            Property.tenant_id == tenant_id,
            Property.is_open.is_(True),
        )
        .options(
            selectinload(Property.base_price)
        )
        .order_by(Property.created_at)
    )

    properties = result.scalars().all()

    response: list[PropertyOut] = []

    for property in properties:
        is_available = await get_property_availability(
            db=db,
            property=property,
            check_in=check_in,
            check_out=check_out,
        )

        data = PropertyOut.model_validate(
            property
        )

        total_price = None
        
        if check_in and check_out and property.base_price:
            price = await calculate_booking_price(
                db=db,
                property_id=property.id,
                check_in=check_in,
                check_out=check_out,
            )
    
            total_price = price["total_price"]
        
        response.append(
            data.model_copy(
                update={
                    "is_available": is_available,
                    "total_price": total_price,
                }
            )
        )

    return response


@router.get("/{property_id}/public",response_model=PublicPropertyOut)
async def get_public_property_by_id(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    check_in: date | None = Query(default=None),
    check_out: date | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Property)
        .where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
            Property.is_open.is_(True),
        )
        .options(
            selectinload(Property.base_price)
        )
    )

    property = result.scalar_one_or_none()

    if not property:
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    is_available = await get_property_availability(
        db=db,
        property=property,
        check_in=check_in,
        check_out=check_out,
    )

    total_price = None
    nights = None

    if check_in and check_out:
        nights = (check_out - check_in).days
        price = await calculate_booking_price(
            db=db,
            property_id=property.id,
            check_in=check_in,
            check_out=check_out,
        )

        total_price = price["total_price"]

    property_data = PropertyOut.model_validate(
        property
    ).model_copy(
        update={
            "is_available": is_available,
            "total_price": total_price,
            "nights": nights,
        }
    )

    payment_result = await db.execute(
        select(TenantPaymentSettings).where(
            TenantPaymentSettings.tenant_id == tenant_id
        )
    )

    payment_settings = payment_result.scalar_one_or_none()

    return {
        "property": property_data,
        "payment_settings": {
            "online": (
                payment_settings.online
                if payment_settings
                else False
            ),
            "pay_on_property": (
                payment_settings.pay_on_property
                if payment_settings
                else False
            ),
            "pay_withbank_transfer": (
                payment_settings.pay_withbank_transfer
                if payment_settings
                else False
            ),
            "bank_name": (
                payment_settings.bank_name
                if payment_settings
                else None
            ),
            "account_name": (
                payment_settings.account_name
                if payment_settings
                else None
            ),
            "account_number": (
                payment_settings.account_number
                if payment_settings
                else None
            ),
            "iban": (
                payment_settings.iban
                if payment_settings
                else None
            ),
            "swift": (
                payment_settings.swift
                if payment_settings
                else None
            ),
            "bank_instructions": (
                payment_settings.bank_instructions
                if payment_settings
                else None
            ),
        },
    }



@router.get("/calendar/{calendar_token}.ics")
async def export_calendar(
    calendar_token: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Property).where(
            Property.calendar_token == calendar_token
        )
    )

    property = result.scalar_one_or_none()

    if not property:
        raise HTTPException(
            status_code=404,
            detail="Calendar not found",
        )

    # Nästa steg: skapa själva ICS-innehållet

    return Response(
        content="",
        media_type="text/calendar",
    )


class CalendarSourceCreate(BaseModel):
    name: str
    url: str

@router.post("/{property_id}/calendar-sync")
async def add_calendar_source(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    payload: CalendarSourceCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    property = result.scalar_one_or_none()

    if not property:
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    source = PropertyCalendarSource(
        property_id=property.id,
        name=payload.name,
        url=payload.url,
    )

    db.add(source)

    await db.commit()
    await db.refresh(source)

    return source


@router.get("/{property_id}/calendar-sync")
async def get_calendar_sources(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    property_result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    property = property_result.scalar_one_or_none()

    if not property:
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    result = await db.execute(
        select(PropertyCalendarSource)
        .where(
            PropertyCalendarSource.property_id
            == property_id
        )
        .order_by(PropertyCalendarSource.name)
    )

    return result.scalars().all()


@router.post("/{property_id}/calendar-sync/{source_id}/sync")
async def sync_source(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    source_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(PropertyCalendarSource)
        .join(
            Property,
            Property.id == PropertyCalendarSource.property_id,
        )
        .where(
            PropertyCalendarSource.id == source_id,
            PropertyCalendarSource.property_id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    source = result.scalar_one_or_none()

    if not source:
        raise HTTPException(404, "Calendar source not found")

    await sync_calendar_source(source, db)

    return {"success": True}

@router.delete("/{property_id}/calendar-sync/{source_id}")
async def delete_calendar_source(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    source_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(PropertyCalendarSource)
        .join(
            Property,
            Property.id == PropertyCalendarSource.property_id,
        )
        .where(
            PropertyCalendarSource.id == source_id,
            PropertyCalendarSource.property_id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    source = result.scalar_one_or_none()

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Calendar source not found",
        )

    await db.delete(source)
    await db.commit()

    return {
        "id": str(source_id),
        "deleted": True,
    }