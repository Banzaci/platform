import uuid
from datetime import datetime, timezone
import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.tenant import Tenant
from app.models.booking import Booking, BookingStatus

router = APIRouter(
    prefix="/tenants/{tenant_id}/bookings",
    tags=["bookings"],
)

@router.get("/public/{public_token}")
async def get_public_booking(
    tenant_id: uuid.UUID,
    public_token: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking)
        .options(
            selectinload(Booking.property)
        )
        .where(
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

    property = booking.property
  
    property_image = None

    if property and property.images:
        first_image = property.images[0]

        if isinstance(first_image, dict):
            property_image = first_image.get("url")

    return {
      "id": str(booking.id),
      "public_token": booking.public_token,

      "property": {
          "id": str(property.id),
          "name": property.name,
          "image": property_image,
      } if property else None,

      "check_in": booking.check_in,
      "check_out": booking.check_out,
      "guests": booking.guests,
      "units": booking.units,
      "total_price": booking.total_price,
      "status": booking.status.value,
      "payment_method": booking.payment_method,
      "refund_status": booking.refund_status,
      "refund_amount": booking.refund_amount,
  }


@router.post("/public/{public_token}/cancel")
async def cancel_public_booking(
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

    if booking.status == BookingStatus.cancelled:
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled",
        )

    now = datetime.now(timezone.utc)

    check_in = datetime.combine(
        booking.check_in,
        datetime.min.time(),
        tzinfo=timezone.utc,
    )

    hours_until_check_in = (
        check_in - now
    ).total_seconds() / 3600

    refund_percent = 0

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

    policy = tenant.cancellation_policy or {}

    free_cancellation_days = policy.get(
        "free_cancellation_days",
        14,
    )

    partial_refund_hours = policy.get(
        "partial_refund_hours",
        48,
    )

    partial_refund_percent = policy.get(
        "partial_refund_percent",
        50,
    )

    if booking.status == BookingStatus.payment_success:
        if (
            hours_until_check_in
            >= free_cancellation_days * 24
        ):
            refund_percent = 100

        elif (
            hours_until_check_in
            >= partial_refund_hours
        ):
            refund_percent = (
                partial_refund_percent
            )

        else:
            refund_percent = 0
            
    refund = None
    refund_amount = 0.0

    if (
        refund_percent > 0
        and booking.provider_payment_intent_id
    ):
        refund_amount = round(
            booking.total_price
            * refund_percent
            / 100,
            2,
        )

        refund = stripe.Refund.create(
            payment_intent=booking.provider_payment_intent_id,
            amount=int(round(refund_amount * 100)),
            reason="requested_by_customer",
            metadata={
                "booking_id": str(booking.id),
                "tenant_id": str(tenant_id),
            },
        )

        booking.provider_refund_id = refund.id
        booking.refund_status = refund.status
        booking.refund_amount = refund_amount

    booking.status = BookingStatus.cancelled

    await db.commit()
    await db.refresh(booking)

    return {
      "id": str(booking.id),
      "public_token": booking.public_token,
      "status": booking.status.value,
      "refund": {
          "percent": refund_percent,
          "amount": booking.refund_amount or 0,
          "provider_refund_id": booking.provider_refund_id,
          "provider_status": booking.refund_status,
      },
  }