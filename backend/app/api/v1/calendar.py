from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.property import Property
from app.models.booking import Booking, BookingStatus
from app.models.blocked_period import BlockedPeriod
from app.models.property_block import PropertyBlock
from app.models.property_calendar_source import (
    PropertyCalendarSource,
)


router = APIRouter(
    prefix="/calendar",
    tags=["calendar"],
)


@router.get("/{calendar_token}.ics")
async def export_property_calendar(
    calendar_token: str,
    provider: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Property).where(
            Property.calendar_token
            == calendar_token
        )
    )

    property = result.scalar_one_or_none()

    if not property:
        raise HTTPException(
            status_code=404,
            detail="Calendar not found",
        )

    booking_result = await db.execute(
        select(Booking).where(
            Booking.property_id == property.id,
            Booking.status.in_([
                BookingStatus.pending_payment,
                BookingStatus.payment_success,
                BookingStatus.confirmed,
            ]),
        )
    )

    bookings = booking_result.scalars().all()

    blocked_period_result = await db.execute(
        select(BlockedPeriod).where(
            BlockedPeriod.property_id
            == property.id
        )
    )

    blocked_periods = (
        blocked_period_result.scalars().all()
    )

    property_block_query = (
        select(PropertyBlock)
        .join(
            PropertyCalendarSource,
            PropertyCalendarSource.id
            == PropertyBlock.source_id,
        )
        .where(
            PropertyBlock.property_id
            == property.id
        )
    )

    if provider:
        property_block_query = (
            property_block_query.where(
                PropertyCalendarSource.name
                != provider
            )
        )

    property_block_result = await db.execute(
        property_block_query
    )

    property_blocks = (
        property_block_result.scalars().all()
    )

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Hotel Platform//Calendar//EN",
        "CALSCALE:GREGORIAN",
    ]

    for booking in bookings:
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:booking-{booking.id}",
            (
                "DTSTART;VALUE=DATE:"
                f"{booking.check_in.strftime('%Y%m%d')}"
            ),
            (
                "DTEND;VALUE=DATE:"
                f"{booking.check_out.strftime('%Y%m%d')}"
            ),
            "SUMMARY:Booked",
            "END:VEVENT",
        ])

    for block in blocked_periods:
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:block-{block.id}",
            (
                "DTSTART;VALUE=DATE:"
                f"{block.start_date.strftime('%Y%m%d')}"
            ),
            (
                "DTEND;VALUE=DATE:"
                f"{block.end_date.strftime('%Y%m%d')}"
            ),
            "SUMMARY:Unavailable",
            "END:VEVENT",
        ])

    for block in property_blocks:
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:external-{block.id}",
            (
                "DTSTART;VALUE=DATE:"
                f"{block.start_date.strftime('%Y%m%d')}"
            ),
            (
                "DTEND;VALUE=DATE:"
                f"{block.end_date.strftime('%Y%m%d')}"
            ),
            "SUMMARY:Unavailable",
            "END:VEVENT",
        ])

    lines.append("END:VCALENDAR")

    content = "\r\n".join(lines) + "\r\n"

    return Response(
        content=content,
        media_type="text/calendar",
        headers={
            "Content-Disposition":
                f'inline; filename="{property.id}.ics"',
        },
    )