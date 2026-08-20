import uuid

from sqlalchemy import Boolean, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class TenantPaymentSettings(Base):
    __tablename__ = "tenant_payment_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    online: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    pay_on_property: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    pay_withbank_transfer: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    bank_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    account_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    account_number: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    iban: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    swift: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    bank_instructions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )