from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property_block import PropertyBlock
from app.models.booking import Booking, BookingStatus
from app.models.blocked_period import BlockedPeriod
from app.models.property import Property


async def get_property_availability(
    db: AsyncSession,
    property: Property,
    check_in: date | None,
    check_out: date | None,
) -> bool:
    if not check_in or not check_out:
        return False

    # Manually blocked periods
    blocked_result = await db.execute(
        select(BlockedPeriod.id)
        .where(
            BlockedPeriod.property_id == property.id,
            BlockedPeriod.start_date < check_out,
            BlockedPeriod.end_date > check_in,
        )
        .limit(1)
    )

    if blocked_result.scalar_one_or_none() is not None:
        return False

    # External calendar blocks
    external_block_result = await db.execute(
        select(PropertyBlock.id)
        .where(
            PropertyBlock.property_id == property.id,
            PropertyBlock.start_date < check_out,
            PropertyBlock.end_date > check_in,
        )
        .limit(1)
    )

    if external_block_result.scalar_one_or_none() is not None:
        return False

    # Existing bookings
    booking_result = await db.execute(
        select(
            func.coalesce(
                func.sum(Booking.units),
                0,
            )
        ).where(
            Booking.property_id == property.id,
            Booking.check_in < check_out,
            Booking.check_out > check_in,
            Booking.status.in_([
                BookingStatus.pending_payment,
                BookingStatus.payment_success,
                BookingStatus.confirmed,
            ]),
        )
    )

    booked_units = booking_result.scalar_one()

    return property.units - booked_units > 0