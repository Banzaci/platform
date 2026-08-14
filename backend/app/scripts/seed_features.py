"""Seeds the feature catalog with the four sellable modules.

Run once (safe to re-run — it upserts on `key`):

    python -m app.scripts.seed_features
"""

import asyncio

from sqlalchemy import select
from app.models import tenant, user, page, feature, transaction
from app.db.session import AsyncSessionLocal
from app.models.feature import Feature

FEATURES = [
    {
        "key": "booking_system",
        "name": "Booking System",
        "description": "Let guests book rooms directly from your website, with availability and pricing synced in real time.",
        "monthly_price": 29.00,
        "yearly_price": 290.00,
        "image_urls": [
            "https://placehold.co/800x500?text=Booking+System+1",
            "https://placehold.co/800x500?text=Booking+System+2",
        ],
        "video_url": "https://example.com/videos/booking-system-demo.mp4",
    },
    {
        "key": "employee_management",
        "name": "Employee Management",
        "description": "Manage staff, roles, and schedules for your property from one place.",
        "monthly_price": 19.00,
        "yearly_price": 190.00,
        "image_urls": [
            "https://placehold.co/800x500?text=Employee+Management+1",
            "https://placehold.co/800x500?text=Employee+Management+2",
        ],
        "video_url": "https://example.com/videos/employee-management-demo.mp4",
    },
    {
        "key": "analytics",
        "name": "Analytics",
        "description": "Track visitors, bookings, and revenue trends with a dashboard built for your business.",
        "monthly_price": 15.00,
        "yearly_price": 150.00,
        "image_urls": [
            "https://placehold.co/800x500?text=Analytics+1",
            "https://placehold.co/800x500?text=Analytics+2",
        ],
        "video_url": "https://example.com/videos/analytics-demo.mp4",
    },
    {
        "key": "ai_assistant",
        "name": "AI Assistant",
        "description": "A chat assistant on your website that answers guest questions and helps with bookings, day or night.",
        "monthly_price": 39.00,
        "yearly_price": 390.00,
        "image_urls": [
            "https://placehold.co/800x500?text=AI+Assistant+1",
            "https://placehold.co/800x500?text=AI+Assistant+2",
        ],
        "video_url": "https://example.com/videos/ai-assistant-demo.mp4",
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        for data in FEATURES:
            existing = await db.execute(select(Feature).where(Feature.key == data["key"]))
            feature = existing.scalar_one_or_none()
            if feature:
                for k, v in data.items():
                    setattr(feature, k, v)
            else:
                db.add(Feature(**data))
        await db.commit()
    print(f"Seeded {len(FEATURES)} features.")


if __name__ == "__main__":
    asyncio.run(seed())