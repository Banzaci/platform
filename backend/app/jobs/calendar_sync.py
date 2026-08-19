from sqlalchemy import select
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.property_block import PropertyBlock
import httpx
from datetime import datetime, timezone
from icalendar import Calendar
from app.models.property_calendar_source import PropertyCalendarSource
from app.services.calendar_sync import sync_calendar_source

async def sync_calendar_source(
    source: PropertyCalendarSource,
    db: AsyncSession,
):
    try:
        async with httpx.AsyncClient(
            timeout=20
        ) as client:
            response = await client.get(
                source.url
            )

            response.raise_for_status()

        calendar = Calendar.from_ical(
            response.content
        )

        # Ta bort gamla blocks från just denna source
        await db.execute(
            delete(PropertyBlock).where(
                PropertyBlock.source_id
                == source.id
            )
        )

        for component in calendar.walk():
            if component.name != "VEVENT":
                continue

            start = component.get("dtstart")
            end = component.get("dtend")
            uid = component.get("uid")

            if not start or not end or not uid:
                continue

            start_date = start.dt
            end_date = end.dt

            if hasattr(start_date, "date"):
                start_date = start_date.date()

            if hasattr(end_date, "date"):
                end_date = end_date.date()

            db.add(
                PropertyBlock(
                    property_id=source.property_id,
                    source_id=source.id,
                    external_id=str(uid),
                    start_date=start_date,
                    end_date=end_date,
                )
            )

        source.last_synced_at = datetime.now(
            timezone.utc
        )

        source.last_error = None

        await db.commit()

    except Exception as e:
        await db.rollback()

        source.last_error = str(e)

        db.add(source)

        await db.commit()

        raise