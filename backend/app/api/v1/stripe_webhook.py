import os

import stripe
from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.booking import Booking, BookingStatus


router = APIRouter(
    prefix="/stripe",
    tags=["stripe"],
)

STRIPE_WEBHOOK_SECRET = os.getenv(
    "STRIPE_WEBHOOK_SECRET"
)

async def handle_refund_updated(
    refund,
):
    refund_id = refund["id"]

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Booking).where(
                Booking.provider_refund_id
                == refund_id
            )
        )

        booking = result.scalar_one_or_none()

        if not booking:
            return

        booking.refund_status = refund["status"]

        # Stripe amount är i minsta valutaenhet
        booking.refund_amount = (
            refund["amount"] / 100
        )

        await db.commit()
        
async def handle_payment_processing(
    payment_intent,
):
    payment_intent_id = payment_intent["id"]

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Booking).where(
                Booking.provider_payment_intent_id
                == payment_intent_id
            )
        )

        booking = result.scalar_one_or_none()

        if not booking:
            return

        booking.status = (
            BookingStatus.payment_processing
        )

        await db.commit()

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Stripe webhook is not configured",
        )

    payload = await request.body()

    signature = request.headers.get(
        "stripe-signature"
    )

    if not signature:
        raise HTTPException(
            status_code=400,
            detail="Missing Stripe signature",
        )

    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            STRIPE_WEBHOOK_SECRET,
        )

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid payload",
        )

    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid Stripe signature",
        )

    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]

        await handle_payment_success(
            payment_intent
        )
    elif event["type"] == "payment_intent.processing":
      payment_intent = event["data"]["object"]

      await handle_payment_processing(
          payment_intent
      )
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]

        await handle_payment_failed(
            payment_intent
        )
    elif event["type"] == "refund.created":
        refund = event["data"]["object"]

        await handle_refund_updated(
            refund
        )

    elif event["type"] == "refund.updated":
        refund = event["data"]["object"]

        await handle_refund_updated(
            refund
        )

    elif event["type"] == "refund.failed":
        refund = event["data"]["object"]

        await handle_refund_updated(
            refund
        )
    return {
        "received": True,
    }


async def handle_payment_success(
    payment_intent,
):
    payment_intent_id = payment_intent["id"]

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Booking).where(
                Booking.provider_payment_intent_id
                == payment_intent_id
            )
        )

        booking = result.scalar_one_or_none()

        if not booking:
            return

        booking.status = BookingStatus.payment_success

        await db.commit()


async def handle_payment_failed(
    payment_intent,
):
    payment_intent_id = payment_intent["id"]

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Booking).where(
                Booking.provider_payment_intent_id
                == payment_intent_id
            )
        )

        booking = result.scalar_one_or_none()

        if not booking:
            return

        booking.status = BookingStatus.payment_failed

        await db.commit()