from datetime import datetime, timezone

import httpx
from icalendar import Calendar
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property_block import PropertyBlock
from app.models.property_calendar_source import PropertyCalendarSource


async def sync_calendar_source(
    source: PropertyCalendarSource,
    db: AsyncSession,
):
    try:
        async with httpx.AsyncClient(
            timeout=20
        ) as client:
            response = await client.get(source.url)
            response.raise_for_status()

        calendar = Calendar.from_ical(
            response.content
        )

        # Ta bort gamla blocks från denna kalenderkälla
        await db.execute(
            delete(PropertyBlock).where(
                PropertyBlock.source_id == source.id
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

            # DTSTART/DTEND kan vara datetime eller date
            if isinstance(start_date, datetime):
                start_date = start_date.date()

            if isinstance(end_date, datetime):
                end_date = end_date.date()

            print(
                "CALENDAR EVENT:",
                uid,
                start_date,
                end_date,
            )

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

    except Exception as error:
        await db.rollback()

        source.last_error = str(error)

        db.add(source)
        await db.commit()

        raise