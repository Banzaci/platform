import asyncio
import app.models

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.property_calendar_source import PropertyCalendarSource
from app.services.calendar_sync import sync_calendar_source


async def sync_all_calendars():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(PropertyCalendarSource).where(
                PropertyCalendarSource.is_active.is_(True)
            )
        )

        sources = result.scalars().all()
        print("SOURCES:", len(sources))
        for source in sources:
            try:
                await sync_calendar_source(
                    source,
                    db,
                )

                print(
                    f"Calendar synced: {source.id}"
                )

            except Exception as e:
                await db.rollback()

                print(
                    f"Calendar sync failed {source.id}: {e}"
                )


if __name__ == "__main__":
    asyncio.run(sync_all_calendars())

# python -m app.jobs.sync_all_calendars
# crontab -e
# */15 * * * * cd /path/to/backend && /path/to/python -m app.jobs.sync_all_calendars >> /var/log/calendar-sync.log 2>&1