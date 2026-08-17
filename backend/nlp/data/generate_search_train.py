import json
import random
import re

OUTPUT_FILE = "nlp/data/search_train.jsonl"
TOTAL_SAMPLES = 14000

# ── Data ───────────────────────────────────────────────────────────────────────

COUNTRIES = [
    "Philippines", "Thailand", "Indonesia", "Bali", "Vietnam",
    "Malaysia", "Cambodia", "Sri Lanka", "Mexico", "Portugal",
    "Spain", "Greece", "Italy", "Croatia", "Morocco",
    "Costa Rica", "Colombia", "Brazil", "Japan", "India",
]

REGIONS = [
    "Asia", "Southeast Asia", "Europe", "Latin America",
    "South America", "Mediterranean", "Caribbean",
]

CITIES = [
    "Siargao", "Bali", "Chiang Mai", "Barcelona", "Lisbon",
    "Tulum", "Medellin", "Koh Samui", "Phuket", "Ubud",
    "Canggu", "Playa del Carmen", "Porto", "Valencia", "Athens",
]

CONVERSATIONAL_TEMPLATES = [
    "I keep seeing {location} mentioned, what's a good hotel there",
    "Someone told me about {location}, any good places to stay {amenities}",
    "What about {location}? Looking for somewhere {amenities}",
    "I've heard good things about {location}, need a hotel {amenities}",
    "Everyone talks about {location}, is there a hotel {amenities} {price}",
    "Thinking about {location} for my next trip, hotel {amenities} {price}",
    "What's a cheap hotel {amenities} in {location}",
    "Affordable place to stay {amenities} in {location} {price}",
    "Budget hotel {amenities} in {location} {price}",
]

AMENITIES = ["surf", "gym", "pool", "bars", "coworking", "yoga", "beach", "spa", "restaurant"]

AMENITY_PHRASES = {
    "surf":      ["surf", "surfing", "surf spots", "good waves", "surf beach"],
    "gym":       ["gym", "fitness center", "workout", "fitness"],
    "pool":      ["pool", "swimming pool"],
    "bars":      ["bars", "nightlife", "bar scene", "drinks"],
    "coworking": ["coworking", "coworking space", "work remotely", "digital nomad"],
    "yoga":      ["yoga", "yoga studio", "yoga classes"],
    "beach":     ["beach", "beachfront", "ocean", "sea"],
    "spa":       ["spa", "massage", "wellness"],
    "restaurant":["restaurants", "good food", "food scene", "dining"],
}

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
    "Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

PRICE_TEMPLATES_DAILY = [
    "max ${price} per night",
    "max ${price}/night",
    "under ${price} a night",
    "budget ${price} per night",
    "${price} max per night",
    "no more than ${price} per night",
    "max ${price} daily",
    "up to ${price} a night",
    "budget ${price} a night",
    "budget is ${price} per night",
    "${price} max a night",
    "${price} a night max",
]

PRICE_TEMPLATES_MONTHLY = [
    "max ${price} per month",
    "max ${price}/month",
    "under ${price} a month",
    "budget ${price} monthly",
    "${price} max per month",
    "no more than ${price} per month",
    "up to ${price} a month",
    "max ${price}/mo",
    "budget ${price} a month",
    "budget is ${price} per month",
    "${price} max a month",
    "${price} a month max",
]

DURATION_NIGHT_TEMPLATES = [
    "{n} nights",
    "{n} night stay",
    "for {n} nights",
    "{n} days",
    "for {n} days",
]

WEEK_TEMPLATES = [
    "a week",
    "for a week",
    "one week",
    "for one week",
]

TWO_WEEK_TEMPLATES = [
    "two weeks",
    "for two weeks",
    "a fortnight",
    "for a fortnight",
]

DURATION_MONTH_TEMPLATES = [
    "{n} months",
    "{n} month stay",
    "for {n} months",
    "{n} month",
]

DATE_TEMPLATES = [
    "from {month} {day}",
    "from {day} of {month}",
    "from {day} {month}",
    "starting {month} {day}",
    "starting {day} {month}",
    "in {month}",
    "from {month}",
    "arriving {month} {day}",
    "check in {month} {day}",
]

SEARCH_TEMPLATES = [
    "I want a hotel {amenities} in {location} {date} {duration} {price}",
    "I'm looking for a hotel {amenities} in {location} {date} {price}",
    "Find me a hotel {amenities} in {location} {date} {duration} {price}",
    "Looking for accommodation {amenities} in {location} {date} {price}",
    "I need a place to stay {amenities} in {location} {date} {duration} {price}",
    "Hotel {amenities} in {location} {date} {duration} {price}",
    "I want to book a room {amenities} in {location} {date} {duration} {price}",
    "I'd like to stay somewhere {amenities} in {location} {date} {price}",
    "Can you find me a hotel {amenities} in {location} {date} {duration} {price}",
    "Searching for a hotel {amenities} in {location} {date} {price}",
    "I want to visit {location} {date} {duration} and need a hotel {amenities} {price}",
    "Planning a trip to {location} {date} {duration} {amenities} {price}",
    "I'm going to {location} {date} for {duration} need a hotel {amenities} {price}",
]

# Lägg till en ny mall-kategori
BOOKING_STYLE_TEMPLATES = [
    "I want to book a room from {date} for {duration} and {guests} {guests_word} {amenities} in {location} max {price}",
    "I want to book a room from {date} for {duration} and {guests} {guests_word} close to {amenities} in {location}. Max {price}",
    "Book a room from {date} for {duration}, {guests} {guests_word}, {amenities} in {location} {price}",
    "I need a room from {date} for {duration} for {guests} {guests_word} {amenities} in {location} {price}",
    "I'd like to book from {date} for {duration} for {guests} {guests_word}, {amenities}, somewhere in {location}, {price}",
    "Book me a place from {date} for {duration}, {guests} {guests_word}, near {amenities} in {location}, budget {price}",
    "Reserve a room starting {date} for {duration} for {guests} {guests_word} {amenities} in {location} {price}",
    "I'm planning a {duration} trip to {location} from {date} for {guests} {guests_word}, looking for {amenities} {price}",
]

def random_guests():
    n = random.randint(1, 4)
    word = "person" if n == 1 else "people"
    return str(n), word

# ── Helpers ────────────────────────────────────────────────────────────────────

def add_entity(entities, text, value, label):
    import re
    if not value:
        return
    for match in re.finditer(re.escape(value), text, re.IGNORECASE):
        start, end = match.start(), match.end()
        if any(not (end <= e["start"] or start >= e["end"]) for e in entities):
            continue
        entities.append({"start": start, "end": end, "label": label, "text": value})
        break


def random_amenities():
    n = random.randint(1, 3)
    chosen = random.sample(AMENITIES, n)
    phrases = [random.choice(AMENITY_PHRASES[a]) for a in chosen]

    connectors = [", ", " and ", " with ", " near "]
    text = ""
    for i, phrase in enumerate(phrases):
        if i == 0:
            text = random.choice(["close to ", "near ", "with ", "next to ", ""]) + phrase
        elif i == len(phrases) - 1:
            text += " and " + phrase
        else:
            text += ", " + phrase

    return text, chosen


COUNTRY_PREFIXES = ["in ", "in the ", "to ", "to the ", ""]

# Mappning stad → land, så vi vet vilket land en stad faktiskt ligger i
CITY_TO_COUNTRY = {
    "Siargao": "Philippines",
    "Bali": "Indonesia",
    "Chiang Mai": "Thailand",
    "Barcelona": "Spain",
    "Lisbon": "Portugal",
    "Tulum": "Mexico",
    "Medellin": "Colombia",
    "Koh Samui": "Thailand",
    "Phuket": "Thailand",
    "Ubud": "Indonesia",
    "Canggu": "Indonesia",
    "Playa del Carmen": "Mexico",
    "Porto": "Portugal",
    "Valencia": "Spain",
    "Athens": "Greece",
    "Busua": "Ghana",
    "Mexico City": "Mexico",
}

CITY_COUNTRY_TEMPLATES = [
    "{city}, {country}",
    "{city} {country}",
    "{city} in {country}",
]


def random_location():
    """Returns (location_text, label) for the simple single-entity case,
    OR (combined_text, "CITY_COUNTRY") as a signal for the caller to split it."""
    choice = random.random()
    if choice < 0.4:
        loc = random.choice(COUNTRIES)
        label = "COUNTRY"
        if loc == "Philippines" and random.random() > 0.3:
            loc = "the Philippines"
    elif choice < 0.65:
        loc = random.choice(CITIES)
        label = "CITY"
    elif choice < 0.85:
        loc = random.choice(REGIONS)
        label = "REGION"
    else:
        # Combined city + country case — the pattern that was missing
        city = random.choice(list(CITY_TO_COUNTRY.keys()))
        country = CITY_TO_COUNTRY[city]
        template = random.choice(CITY_COUNTRY_TEMPLATES)
        loc = template.format(city=city, country=country)
        label = "CITY_COUNTRY"  # special signal,

    return loc, label


def random_date():
    month = random.choice(MONTHS)
    day = random.randint(1, 28)
    template = random.choice(DATE_TEMPLATES)
    text = template.format(month=month, day=day)
    return text, month, str(day)


def random_duration():
    choice = random.random()
    if choice < 0.15:
        if random.random() < 0.7:
            tag_text = random.choice(["a week", "one week"])
            full_text = f"for {tag_text}" if random.random() < 0.5 else tag_text
            return full_text, tag_text, "nights", "7"
        else:
            tag_text = random.choice(["two weeks", "a fortnight"])
            full_text = f"for {tag_text}" if random.random() < 0.5 else tag_text
            return full_text, tag_text, "nights", "14"
    elif choice < 0.55:
        n = random.randint(1, 14)
        if n == 1 and random.random() < 0.3:
            return "a night", "a night", "night", "1"
        text = random.choice(DURATION_NIGHT_TEMPLATES).format(n=n)
        return text, str(n), "nights", str(n)
    else:
        n = random.randint(1, 6)
        if n == 1 and random.random() < 0.4:
            return "a month", "a month", "month", "1"
        text = random.choice(DURATION_MONTH_TEMPLATES).format(n=n)
        return text, str(n), "months", str(n)


# I random_price(), ändra returvärdet för price_type till det som faktiskt finns i texten:

def random_price():
    choice = random.random()
    if choice < 0.5:
        price = random.choice([50, 75, 100, 150, 200, 250, 300, 400, 500])
        template = random.choice(PRICE_TEMPLATES_DAILY)
        text = template.replace("{price}", str(price))
        # Hitta vilket "type-ord" som faktiskt finns i texten
        for word in ["per night", "/night", "a night", "daily", "nightly"]:
            if word in text:
                return text, str(price), word
        return text, str(price), "night"
    else:
        price = random.choice([500, 700, 800, 1000, 1200, 1500, 2000])
        template = random.choice(PRICE_TEMPLATES_MONTHLY)
        text = template.replace("{price}", str(price))
        for word in ["per month", "/month", "a month", "monthly", "/mo"]:
            if word in text:
                return text, str(price), word
        return text, str(price), "month"


# ── Generator ──────────────────────────────────────────────────────────────────

def generate_search_query():
    amenity_text, _ = random_amenities()
    location, location_label = random_location()
    date_text, _, _ = random_date()
    duration_text, duration_tag, duration_type, duration_val = random_duration()
    price_text, price_val, price_type = random_price()
    guests_val, guests_word = random_guests()

    roll = random.random()
    if roll < 0.35:
        template = random.choice(BOOKING_STYLE_TEMPLATES)
        text = template.format(
            date=date_text, duration=duration_text,
            guests=guests_val, guests_word=guests_word,
            amenities=amenity_text, location=location, price=price_text,
        )
    elif roll < 0.85:
        template = random.choice(SEARCH_TEMPLATES)
        text = template.format(
            amenities=amenity_text, location=location,
            date=date_text, duration=duration_text, price=price_text,
        )
    else:
        template = random.choice(CONVERSATIONAL_TEMPLATES)
        text = template.format(
            amenities=amenity_text, location=location, price=price_text,
        )

    text = re.sub(r"\s+", " ", text).strip()

    entities = []
    if location_label == "CITY_COUNTRY":
        # Split the combined "City, Country" string into two separate entities
        # We need to find the city and country substrings within the full location string
        for city, country in CITY_TO_COUNTRY.items():
            if city in location and country in location:
                add_entity(entities, text, city, "CITY")
                add_entity(entities, text, country, "COUNTRY")
                break
    else:
        add_entity(entities, text, location, location_label)
    add_entity(entities, text, amenity_text, "AMENITIES")
    if price_val:
        add_entity(entities, text, price_val, "MAX_PRICE")
    if price_type:
        add_entity(entities, text, price_type, "PRICE_TYPE")
    if duration_tag:
        add_entity(entities, text, duration_tag, "DURATION")
    if duration_type:
        add_entity(entities, text, duration_type, "DURATION_TYPE")
    add_entity(entities, text, guests_val, "GUESTS")

    return {"text": text, "intent": "search_hotels", "entities": entities}


# ── Main ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for _ in range(TOTAL_SAMPLES):
            f.write(json.dumps(generate_search_query(), ensure_ascii=False) + "\n")

    print(f"✅ Generated {TOTAL_SAMPLES} search samples → {OUTPUT_FILE}")

    # Preview
    print("\nSample queries:")
    import random
    with open(OUTPUT_FILE) as f:
        lines = f.readlines()
    for line in random.sample(lines, 5):
        data = json.loads(line)
        print(f"  {data['text']}")
        # print(f"  → entities: {[f\"{e['label']}={e['text']}\" for e in data['entities']]}")
        # print()