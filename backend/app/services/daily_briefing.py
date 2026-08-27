# app/services/daily_briefing.py

from datetime import date

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking
from app.models.property import Property


async def build_daily_briefing(
    db: AsyncSession,
    tenant_id,
) -> dict:

    today = date.today()

    arrivals_result = await db.execute(
        select(func.count(Booking.id)).where(
            Booking.tenant_id == tenant_id,
            Booking.check_in == today,
        )
    )

    departures_result = await db.execute(
        select(func.count(Booking.id)).where(
            Booking.tenant_id == tenant_id,
            Booking.check_out == today,
        )
    )

    staying_result = await db.execute(
        select(func.count(Booking.id)).where(
            Booking.tenant_id == tenant_id,
            Booking.check_in <= today,
            Booking.check_out > today,
        )
    )

    properties_result = await db.execute(
        select(func.count(Property.id)).where(
            Property.tenant_id == tenant_id,
        )
    )

    arrivals = arrivals_result.scalar() or 0
    departures = departures_result.scalar() or 0
    guests_staying = staying_result.scalar() or 0
    total_properties = properties_result.scalar() or 0

    # Första enkla versionen
    available_properties = max(
        total_properties - guests_staying,
        0,
    )

    attention = []

    if arrivals:
        attention.append(
            f"{arrivals} guest arrival{'s' if arrivals != 1 else ''} today"
        )

    if departures:
        attention.append(
            f"{departures} departure{'s' if departures != 1 else ''} today"
        )

    return {
        "arrivals": arrivals,
        "departures": departures,
        "guests_staying": guests_staying,
        "available_properties": available_properties,
        "unpaid_bookings": 0,
        "attention": attention,
    }