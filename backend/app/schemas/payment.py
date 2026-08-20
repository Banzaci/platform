import uuid
from pydantic import BaseModel

class PaymentMethodUpdate(BaseModel):
    key: str
    enabled: bool


class PaymentMethodOut(BaseModel):
    id: uuid.UUID
    key: str
    name: str
    description: str | None = None
    enabled: bool


class TenantPaymentSettingsUpdate(BaseModel):
    methods: list[PaymentMethodUpdate]

    bank_name: str | None = None
    account_name: str | None = None
    account_number: str | None = None
    iban: str | None = None
    swift: str | None = None
    bank_instructions: str | None = None


class TenantPaymentSettingsOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    methods: list[PaymentMethodOut]

    bank_name: str | None = None
    account_name: str | None = None
    account_number: str | None = None
    iban: str | None = None
    swift: str | None = None
    bank_instructions: str | None = None
