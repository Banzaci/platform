import os
import stripe

from app.core.config import settings
from app.services.payments.base import (
    PaymentProvider,
    PaymentResult,
)


class StripeProvider(PaymentProvider):
    def __init__(self):
        if not settings.stripe_secret_key:
            raise RuntimeError(
                "STRIPE_SECRET_KEY is not configured"
            )

        stripe.api_key = settings.stripe_secret_key

    async def create_payment(
        self,
        *,
        amount: int,
        currency: str,
        email: str,
        reference: str,
        metadata: dict[str, str],
    ) -> PaymentResult:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency.lower(),
            receipt_email=email,
            metadata={
                **metadata,
                "reference": reference,
            },

            # Stripe determines eligible payment
            # methods based on account/currency/customer.
            automatic_payment_methods={
                "enabled": True,
            },
        )

        return PaymentResult(
            provider="stripe",
            status=intent.status,
            payment_id=intent.id,
            client_secret=intent.client_secret,
        )