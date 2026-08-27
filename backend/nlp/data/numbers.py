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
}

def parse_number(value: str | int | None) -> int | None:
    if value is None:
        return None

    if isinstance(value, int):
        return value

    value = value.strip().lower()

    if value.isdigit():
        return int(value)

    return NUMBER_WORDS.get(value)