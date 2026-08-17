import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.booking import (
    Booking,
    BookingStatus,
)
from app.services.payments.payment_service import (
    get_payment_provider,
)


router = APIRouter(
    prefix="/tenants/{tenant_id}/payments",
    tags=["payments"],
)


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