import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class RoomMapping(Base):
    __tablename__ = "room_mappings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    api_key_id: Mapped[str] = mapped_column(String, ForeignKey("api_keys.id"), nullable=False, index=True)
    external_room_id: Mapped[str] = mapped_column(String, nullable=False)
    room_id: Mapped[str] = mapped_column(String, ForeignKey("rooms.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    api_key = relationship("ApiKey", backref="room_mappings")
    room = relationship("Room", backref="room_mappings")

    __table_args__ = (
        UniqueConstraint("api_key_id", "external_room_id", name="uq_api_key_external_room"),
    )