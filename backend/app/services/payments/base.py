from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class PaymentResult:
    provider: str
    status: str
    payment_id: str
    client_secret: str | None = None
    payment_url: str | None = None


class PaymentProvider(ABC):
    @abstractmethod
    async def create_payment(
        self,
        *,
        amount: int,
        currency: str,
        email: str,
        reference: str,
        metadata: dict[str, str],
    ) -> PaymentResult:
        raise NotImplementedError