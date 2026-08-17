from app.services.payments.base import PaymentProvider
from app.services.payments.stripe_provider import StripeProvider


def get_payment_provider(
    provider: str = "stripe",
) -> PaymentProvider:
    if provider == "stripe":
        return StripeProvider()

    raise ValueError(
        f"Unsupported payment provider: {provider}"
    )