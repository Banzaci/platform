import uuid
from datetime import date, datetime, timedelta

from sqlalchemy.orm import selectinload

from app.models.base_price import BasePrice
from app.models.price_period import PricePeriod

import dateparser
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStatus
from app.models.property import Property
from app.helpers.property_helper import get_property_availability


def to_int(value: str | None) -> int | None:
    if not value:
        return None

    try:
        return int(value)
    except ValueError:
        pass

    word_map = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
        "thirteen": 13,
        "fourteen": 14,
        "fifteen": 15,
        "sixteen": 16,
        "seventeen": 17,
        "eighteen": 18,
        "nineteen": 19,
        "twenty": 20,
    }

    return word_map.get(value.lower().strip())

def resolve_date(value: str | None) -> date | None:
    if not value:
        return None

    parsed = dateparser.parse(
        value,
        settings={
            "PREFER_DATES_FROM": "future",
            "RETURN_AS_TIMEZONE_AWARE": False,
        },
    )

    if not parsed:
        return None

    resolved = parsed.date()

    if resolved < datetime.today().date():
        return None

    return resolved

def resolve_booking_dates(
    start_date: str | None,
    end_date: str | None = None,
    nights: str | None = None,
) -> tuple[date, date] | None:
    check_in = resolve_date(start_date)

    if not check_in:
        return None

    if end_date:
        check_out = resolve_date(end_date)

        if not check_out:
            return None
    else:
        night_count = to_int(nights)

        if not night_count or night_count < 1:
            return None

        check_out = check_in + timedelta(days=night_count)

    if check_out <= check_in:
        return None

    return check_in, check_out

async def find_available_properties(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    check_in: date,
    check_out: date,
    guests: int,
    units: int = 1,
) -> list[dict]:
    result = await db.execute(
        select(Property).where(
            Property.tenant_id == tenant_id,
            Property.is_open.is_(True),
            Property.max_guests >= guests,
        )
    )

    properties = result.scalars().all()

    available: list[dict] = []

    for property in properties:
        availability = await get_property_availability(
            db=db,
            property=property,
            check_in=check_in,
            check_out=check_out,
        )

        if not availability:
            continue

        available.append(
            {
                "id": str(property.id),
                "name": property.name,
                "description": property.description,
                "max_guests": property.max_guests,
                "bedrooms": property.bedrooms,
                "beds": property.beds,
                "bathrooms": property.bathrooms,
                "units": property.units,
                "amenities": property.amenities or [],
                "images": property.images or [],
            }
        )

    return available

async def calculate_booking_price(
    db: AsyncSession,
    property_id: uuid.UUID,
    check_in: date,
    check_out: date,
) -> dict:
    nights = (check_out - check_in).days

    if nights <= 0:
        raise ValueError("Invalid booking dates")

    property_result = await db.execute(
        select(Property)
        .where(Property.id == property_id)
        .options(selectinload(Property.base_price))
    )

    property = property_result.scalar_one_or_none()

    if not property:
        raise ValueError("Property not found")

    if not property.base_price:
        raise ValueError("Property has no base price")

    period_result = await db.execute(
        select(PricePeriod)
        .where(
            PricePeriod.property_id == property_id,
            PricePeriod.start_date < check_out,
            PricePeriod.end_date >= check_in,
        )
        .order_by(PricePeriod.start_date)
    )

    periods = period_result.scalars().all()

    total = 0.0
    breakdown = []

    current_date = check_in

    while current_date < check_out:
        price = property.base_price.daily_price
        source = "base"

        for period in periods:
            if (
                period.start_date <= current_date
                <= period.end_date
            ):
                price = period.daily_price
                source = period.name or "special"
                break

        total += float(price)

        breakdown.append({
            "date": current_date.isoformat(),
            "price": float(price),
            "source": source,
        })

        current_date += timedelta(days=1)

    return {
        "nights": nights,
        "total_price": total,
        "average_nightly_price": (
            round(total / nights, 2)
            if nights > 0
            else 0
        ),
        "breakdown": breakdown,
    }

async def find_property_by_name(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    name: str,
) -> Property | None:
    result = await db.execute(
        select(Property).where(
            Property.tenant_id == tenant_id,
            Property.is_open.is_(True),
            Property.name.ilike(name.strip()),
        )
    )

    return result.scalar_one_or_none()


async def create_booking(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    check_in: date,
    check_out: date,
    guests: int,
    units: int,
    total_price: float,
    guest_name: str | None = None,
    guest_email: str | None = None,
    guest_phone: str | None = None,
    special_requests: str | None = None,
    payment_method: str = "online",
    source: str = "ai",
    is_walk_in: bool = False,
) -> Booking:
    property_result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
            Property.is_open.is_(True),
        )
    )

    property = property_result.scalar_one_or_none()

    if not property:
        raise ValueError("Property not found")

    is_available = await get_property_availability(
        db=db,
        property=property,
        check_in=check_in,
        check_out=check_out,
    )

    if not is_available:
        raise ValueError("Property is not available")

    if guests > property.max_guests * units:
        raise ValueError("Too many guests for selected units")

    booking_ref = f"BK-{uuid.uuid4().hex[:8].upper()}"

    booking = Booking(
        tenant_id=tenant_id,
        booking_ref=booking_ref,
        property_id=property_id,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        units=units,
        total_price=total_price,
        status=BookingStatus.pending_payment,
        guest_name=guest_name,
        guest_email=guest_email,
        guest_phone=guest_phone,
        special_requests=special_requests,
        payment_method=payment_method,
        source=source,
        is_walk_in=is_walk_in,
    )

    db.add(booking)

    await db.commit()
    await db.refresh(booking)

    return booking