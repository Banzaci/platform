from datetime import datetime
import uuid
from sqlalchemy import DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class RoomImage(Base):
    __tablename__ = "room_images"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    room_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("rooms.id"),   # 🔥 FIX
        index=True,
        nullable=False
    )

    url: Mapped[str] = mapped_column(String, nullable=False)
    public_id: Mapped[str] = mapped_column(String, nullable=False)

    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="images")  # 🔥 ADD