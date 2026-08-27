# app/schemas/daily_briefing.py

from pydantic import BaseModel


class DailyBriefingOut(BaseModel):
    arrivals: int
    departures: int
    guests_staying: int
    available_properties: int
    unpaid_bookings: int

    attention: list[str]