from __future__ import annotations

from datetime import date, datetime, time, timedelta
import re

import dateparser


NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
    "thirty": 30,
}


def parse_number(value: str | int | None) -> int | None:
    if value is None:
        return None

    if isinstance(value, int):
        return value

    value = value.strip().lower()

    if value.isdigit():
        return int(value)

    if value in NUMBER_WORDS:
        return NUMBER_WORDS[value]

    # Ex: "twenty one"
    parts = re.split(r"[\s-]+", value)

    if all(part in NUMBER_WORDS for part in parts):
        return sum(NUMBER_WORDS[part] for part in parts)

    return None


from datetime import date, datetime, time
import dateparser
from dateparser.search import search_dates


def parse_date(
    value: str | None,
    reference_date: date | None = None,
) -> date | None:
    if not value:
        return None

    reference_date = reference_date or date.today()

    relative_base = datetime.combine(
        reference_date,
        time.min,
    )

    matches = search_dates(
        value,
        languages=["en"],
        settings={
            "RELATIVE_BASE": relative_base,
            "PREFER_DATES_FROM": "future",
        },
    )

    print("PARSE DATE INPUT:", value)
    print("PARSE DATE OUTPUT:", matches)

    if not matches:
        return None

    return matches[0][1].date()


def duration_to_nights(
    value: str | int | None,
    unit: str | None,
) -> int | None:
    number = parse_number(value)

    if number is None or not unit:
        return None

    unit = unit.strip().lower()

    if unit in {"night", "nights"}:
        return number

    if unit in {"day", "days"}:
        return number

    if unit in {"week", "weeks"}:
        return number * 7

    return None


def resolve_stay_dates(
    *,
    start_date: str | None,
    end_date: str | None = None,
    duration_value: str | int | None = None,
    duration_unit: str | None = None,
    reference_date: date | None = None,
) -> tuple[date, date] | None:

    check_in = parse_date(
        start_date,
        reference_date=reference_date,
    )

    if not check_in:
        return None

    if end_date:
        check_out = parse_date(
            end_date,
            reference_date=check_in,
        )

        if not check_out:
            return None

        if check_out <= check_in:
            return None

        return check_in, check_out

    nights = duration_to_nights(
        duration_value,
        duration_unit,
    )

    if not nights or nights <= 0:
        return None

    check_out = check_in + timedelta(days=nights)

    return check_in, check_out