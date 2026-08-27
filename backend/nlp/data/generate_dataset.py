import json
import random
import re

OUTPUT_FILE = "nlp/data/train.jsonl"
TOTAL_SAMPLES = 50000

PREFIXES = [""] * 10 + ["Hi, ", "Hello, ", "Hey, "]

BOOKING_ID_PLACEHOLDER = "BK12345679"

BED_TYPES = [
    "single", "twin", "double", "queen", "queen size", "queen-size",
    "king", "king size", "king-size", "bunk", "sofa bed",
    # vanliga stavfel/varianter
    "quen", "quene", "qeen", "quees size", "kign", "kign size",
    "dubble", "duble",
]

ROOM_FEATURES = [
    "air conditioning", "AC", "a sea view", "an ocean view", "a balcony",
    "a private bathroom", "an ensuite bathroom", "a mosquito net",
    "wifi", "hot water", "a fan", "a terrace", "a garden view",
]

room_feature_bed_templates = [
    "Do you have a room with a {bed_type} bed?",
    "Do you have any rooms with {bed_type} beds?",
    "Is there a room with a {bed_type} bed?",
    "Do you have {bed_type} beds?",
    "I need a room with a {bed_type} bed",
    "Can I get a room with a {bed_type} bed?",
    "Do your rooms have {bed_type} beds?",
    "Which rooms have a {bed_type} bed?",
    "Do you have a {bed_type} bed available?",
    "Looking for a room with a {bed_type} bed",
    "I'd like a room with a {bed_type} bed",
    "we need a bigger bed, do you have {bed_type}",
    "does the room come with a {bed_type} bed",
    "can we get a {bed_type} for the room",
    "we're after a {bed_type} bed if possible",
    "hoping for a {bed_type} in the room",
    "do you have a room with {bed_type} bed",
    "does the room come with {bed_type} bed",
    "is there {bed_type} bed available",
    "any rooms with {bed_type} bed",
    "we're looking for {bed_type} bed",
]

room_feature_amenity_templates = [
    "Do you have a room with {feature}?",
    "Is there a room with {feature}?",
    "Do your rooms have {feature}?",
    "Which rooms have {feature}?",
    "I need a room with {feature}",
    "Can I get a room with {feature}?",
    "Do you have any rooms with {feature}?",
    "Does the room have {feature}?",
    "Is {feature} available in the rooms?",
    "Looking for a room with {feature}",
    "does the room come with {feature}",
    "we'd really like {feature} if available",
    "hoping the room has {feature}",
    "is {feature} something the rooms have",
    "we need {feature} for our stay",
]

check_in_templates = [
    "When is the check-in?",
    "When is the checkin?",
    "What time is check-in?",
    "What time is checkin?",
    "When can I check in?",
    "When can I checkin?",
    "What's the check-in time?",
    "What's the checkin time?",
    "When does check-in start?",
    "When does checkin start?",
    "Can you tell me the check-in time?",
    "Can you tell me the checkin time?",
    "What time can I check in?",
    "What time can I checkin?",
    "When is check in?",
    "When is checkin?",
    "Check in time?",
    "Checkin time?",
    "What's check-in time?",
    "What's checkin time?",
    "When do I check in?",
    "When do I checkin?",
    "Is there a specific check-in time?",
    "Is there a specific checkin time?",
    "What time can we arrive at the property?",
    "Earliest we're allowed to show up?",
    "When can we start our stay?",
    "What's the earliest arrival time?",
    "From what time can we move into the room?",
    "When are guests allowed to arrive?",
    "What time does our stay begin?",
    "Can we come in early, what's the arrival time?",
    "When are rooms ready for arriving guests?",
]

check_out_templates = [
    "When is the check-out?",
    "When is the checkout?",
    "What time is check-out?",
    "What time is checkout?",
    "When do I check out?",
    "When do I checkout?",
    "What's the check-out time?",
    "What's the checkout time?",
    "When does check-out end?",
    "When does checkout end?",
    "What time can I check out?",
    "What time can I checkout?",
    "When is check out?",
    "When is checkout?",
    "Check out time?",
    "Checkout time?",
    "What time do we need to leave by?",
    "Latest we can stay before we need to go?",
    "When does our stay end?",
    "What's the final time to vacate the room?",
    "By when do we need to be out of the room?",
    "When are guests expected to leave?",
    "What time does our stay finish?",
    "Do we need to be gone by a certain time?",
    "When do rooms need to be vacated?",
]

def generate_check_in():
    return {"text": with_prefix(random.choice(check_in_templates)), "intent": "ask_check_in", "entities": []}

def generate_check_out():
    return {"text": with_prefix(random.choice(check_out_templates)), "intent": "ask_check_out", "entities": []}

booking_templates = [
    "{booking_id}",
    "Booking number {booking_id}",
    "My booking number is {booking_id}",
    "Reservation number {booking_id}",
    "Reference {booking_id}",
    "Booking reference {booking_id}",
    "I want to cancel my booking {booking_id}",
    "Cancel booking {booking_id}",
    "I want to cancel booking number {booking_id}",
    "Please cancel my reservation {booking_id}",
    "I need to cancel {booking_id}",
    "My booking number is {booking_id} and I want to cancel",
    "I want to see my booking {booking_id}",
    "Show me my booking {booking_id}",
    "My booking reference is {booking_id}",
    "I have a booking {booking_id}",
    "Can I see my reservation {booking_id}",
    "I want to check my booking {booking_id}",
    "What is the status of booking {booking_id}",
    "I want to modify booking {booking_id}",
    "I want to cancel",
    "Cancel my booking",
    "I want to cancel my reservation",
    "How do I cancel my booking",
    "I need to cancel my stay",
    "Cancel my reservation please",
    "I want to see my booking",
    "Where is my booking confirmation",
    "I want my booking details",
    "Show me my reservation",
]

def generate_booking_id() -> str:
    """Generera ett slumpmässigt bokningsnummer."""
    import random
    import string
    return "BK" + "".join(random.choices(string.digits, k=6))

def generate_ask_booking():
    template = random.choice(booking_templates)
    booking_id = generate_booking_id()

    text = (
        template.format(booking_id=booking_id)
        if "{booking_id}" in template
        else template
    )

    # Viktigt: prefix först
    text = with_prefix(text)

    entities = []

    if booking_id in text:
        start = text.index(booking_id)

        entities.append({
            "start": start,
            "end": start + len(booking_id),
            "label": "BOOKING_ID",
        })

    return {
        "text": text,
        "intent": "ask_booking",
        "entities": entities,
    }


def with_prefix(text: str) -> str:
    prefix = random.choice(PREFIXES)
    if not prefix:
        return text
    return prefix + text[0].lower() + text[1:]

def add_entity(entities, text, value, label):
    for match in re.finditer(re.escape(value), text, re.IGNORECASE):
        start, end = match.start(), match.end()
        if any(not (end <= e["start"] or start >= e["end"]) for e in entities):
            continue
        entities.append({"start": start, "end": end, "label": label})

months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

def random_date():
    day = random.randint(1, 28)
    month = random.choice(months)

    explicit_dates = [
        f"{day} {month}",
        f"{month} {day}",
        f"{day} of {month}",
        f"the {day}th of {month}",
    ]

    relative_dates = [
        "today",
        "tomorrow",
        "the day after tomorrow",
        "this Friday",
        "next Friday",
        "this Saturday",
        "next Saturday",
        "this Sunday",
        "next Sunday",
        "next Monday",
        "next Tuesday",
        "next Wednesday",
        "next Thursday",
    ]

    if random.random() < 0.5:
        return random.choice(explicit_dates)

    return random.choice(relative_dates)

# ── TEMPLATES ─────────────────────────────────────────────────────────────────

availability_templates = [
    "I need a room for {guests} people from {date} for {duration_value} {duration_unit}",
    "{guests} are thinking of coming {date} for {duration_value} {duration_unit}",
    "{guests} want to stay from {date} for {duration_value} {duration_unit}",
    "Do you have anything for {guests} from {date} for {duration_value} {duration_unit}?",
    "Do you have availability from {date} for {duration_value} {duration_unit}?",
    "Can I book a room from {date} for {duration_value} {duration_unit}?",
    "Room for {guests} people from {date}",
    "{guests} are thinking of coming {date} for {duration_value} {duration_unit}",
    "{guests} want to come {date} for {duration_value} {duration_unit}",
    "{guests} are planning to stay {date} for {duration_value} {duration_unit}",
    "{guests} are looking for somewhere to stay {date} for {duration_value} {duration_unit}",
    "Looking for a room from {date} for {duration_value} {duration_unit}",
    "I want a room from {date} for {guests} guests",
    "Any rooms available from {date} for {duration_value} {duration_unit}?",
    "Need accommodation from {date} for {duration_value} {duration_unit} for {guests} people",
    "I'd like to book a room from {date}",
    "We need a room for {guests} guests starting {date}",
    "Searching for a room from {date} for {duration_value} {duration_unit}",
    "Is there a room available from {date} for {guests} people?",
    "I'm looking for accommodation from {date} for {duration_value} {duration_unit}",
    "Do you have a room for {guests} from {date}?",
    "Book me a room from {date} for {duration_value} {duration_unit}",
    "I want to check in on {date} for {duration_value} {duration_unit}",
    "We are {guests} people looking for a room from {date}",
    "Arriving {date} and staying for {duration_value} {duration_unit}",
    "Checking in {date} for {duration_value} {duration_unit} for {guests} guests",
    "Any availability for {guests} people from {date}?",
    "I would like a room from {date} for {guests} people",
    "Is there anything available from {date} for {duration_value} {duration_unit}?",
    "Find me a room for {guests} people starting {date}",
    "I want to book a room",
    "I'd like to book a room",
    "Can I book a room?",
    "I want to make a reservation",
    "I'd like to make a booking",
    "Can I reserve a room?",
    "I want to stay at your hotel",
    "I need a room",
    "Do you have any rooms?",
    "I want to check in",
    "I want to book a room from {date} to {end_date}",
    "I need a room between {date} and {end_date}",
    "Book me a room from {date} until {end_date}",
    "I want to stay from {date} to {end_date}",
    "Room for {guests} people from {date} to {end_date}",
    "I'd like a room from {date} until {end_date} for {guests} guests",
    "Availability from {date} to {end_date}",
    "Do you have a room from {date} to {end_date}?",
    "Do you have a room for {guests} person on {date}?",
    "Do you have a room for {guests} people on {date}?",
    "Is there a room for {guests} on {date}?",
    "Any rooms for {guests} person on {date}?",
    "Room for {guests} on {date}",
    "Do you have availability on {date} for {guests} people?",
    "I need a room on {date} for {guests} person",
    "Do you have a room for {guests} person {date}?",
    "Room for {guests} people {date}",
    "I need a room for {guests} guests {date}",
    "Availability for {guests} people {date}",
    "we're thinking of staying {date} to {end_date}",
    "staying {date} through {end_date}",
    "our dates are {date} to {end_date}",
    "planning to be there {date} to {end_date}",
    "{date} to {end_date} works for us",
    "looking at {date} through {end_date}",
    "we'd be arriving {date} and leaving {end_date}",
    "thinking {date} until {end_date} for the trip",
    "we're coming {date} and heading out {end_date}",
    "our stay would be {date} to {end_date}",
    "we'll be there {date} through {end_date}",
    "planning a trip {date} to {end_date}",
    "we want to visit {date} to {end_date}",
    "hoping to come {date} until {end_date}",
    "we're {guests} of us coming {date} to {end_date}",
    "there'll be {guests} of us, {date} to {end_date}",
    "just the two of us, {date} to {end_date}",
    "can we get something for {guests} starting {date}?",
    "is there space for {guests} around {date}?",
    "we need somewhere to stay {date} for {duration_value} days",
    "got anything open {date}?",
    "what's free around {date}?",
    "anything for {guests} people around {date}?",
]

wifi_templates = [
    "Do you have wifi?", "Is wifi included?", "Does the hotel have wifi?",
    "Is there free wifi?", "What is the wifi password?", "Is the internet good?",
    "Do you have wireless internet?", "Is wifi available in the rooms?",
    "Can I get wifi in my room?", "Is there wifi in common areas?",
    "How fast is the wifi?", "Is wifi free of charge?",
    "Do you provide internet access?", "Is there good internet connection?",
    "Can I work from the hotel with wifi?", "Is wifi available throughout the hotel?",
    "Do guests get free wifi?", "Is there wifi by the pool?",
    "Can I stream with the hotel wifi?", "Is the wifi reliable?",
    "is the internet any good here",
    "can I get online easily",
    "does the connection work well",
    "is it easy to get connected here",
    "how's the signal for working online",
    "can guests connect to the internet",
]

breakfast_templates = [
    "Do you have breakfast?", "Is breakfast included?", "What time is breakfast?",
    "Do you serve breakfast?", "Is breakfast free?", "Can I get breakfast?",
    "What time does breakfast start?", "Is breakfast buffet?",
    "Is breakfast included in the room price?", "What is served for breakfast?",
    "Do you offer a full breakfast?", "Is there a breakfast menu?",
    "Can I have breakfast in my room?", "What time does breakfast end?",
    "Is continental breakfast available?", "Is breakfast served daily?",
    "What does breakfast include?", "Is there a breakfast surcharge?",
    "Do you serve eggs for breakfast?", "Is there a vegan breakfast option?",
    "what's on offer in the morning",
    "is there something to eat before we head out",
    "do we get fed in the morning",
    "what's the morning meal situation",
    "is there a morning spread",
    "can we grab something before checking out for the day",
]

pool_templates = [
    "Do you have a pool?", "Is there a swimming pool?", "Do guests have access to a pool?",
    "What time does the pool open?", "Is the pool heated?", "Is there an outdoor pool?",
    "Can I swim at the hotel?", "Is the pool free to use?",
    "Is there an indoor pool?", "What are the pool hours?",
    "Is the pool open year round?", "Do you have a kids pool?",
    "Is there a jacuzzi?", "Do you have a rooftop pool?",
    "Is pool access included?", "How big is the pool?",
    "Is the pool saltwater or chlorine?", "Is there a lifeguard at the pool?",
    "Can non-guests use the pool?", "Is there a pool bar?",
    "can the kids splash around somewhere",
    "is there somewhere to cool off",
    "anywhere to take a dip",
    "is swimming an option here",
    "can we relax by the water somewhere",
    "is there a place to sunbathe by water",
]

parking_templates = [
    "Do you have parking?", "Is there free parking?", "Can I park at the hotel?",
    "Is parking included?", "Where can I park?", "Is there a parking lot?",
    "Do you have secure parking?", "Is parking available on site?",
    "How much does parking cost?", "Is there underground parking?",
    "Is there overnight parking?", "Can I reserve a parking spot?",
    "Is there disabled parking?", "Is the parking area monitored?",
    "Is valet parking available?", "Is street parking available nearby?",
    "Do you have parking for large vehicles?", "Is parking 24 hours?",
    "Is parking free for guests?", "How many parking spaces are there?",
    "where do we leave the car",
    "is parking a hassle here",
    "can we just park outside",
    "is there somewhere safe to leave the vehicle",
    "do we need to worry about parking",
    "is bringing a car going to be a problem",
]

bar_templates = [
    "Do you have a bar?", "Is there a bar at the hotel?", "What time does the bar open?",
    "Can I get a drink?", "Do you serve cocktails?", "Is the bar open late?",
    "Where is the bar?", "Do you have drinks available?", "Can I get beer at the hotel?",
    "Is there somewhere to have a drink?", "What time does the bar close?",
    "Do you serve wine?", "Is there a pool bar?", "Do you have happy hour?",
    "Is the bar open every day?", "Can I get a drink in my room?",
    "Do you have non-alcoholic drinks?", "What drinks do you serve?",
    "Do you have local beers?", "Is the bar open to non-guests?",
    "Is there a bar around?", "Is there any bars around?",
    "Are there any bars nearby?", "Is there a bar close by?",
    "Any bars around here?", "Are there bars near the hotel?",
    "Is there somewhere nearby for drinks?", "Any good bars close by?",
    "Just want a drink, where do I go?",
    "Somewhere on site to grab a beer?",
    "Is there anywhere serving alcohol here?",
    "Where can we unwind with a cocktail?",
    "Anywhere for evening drinks on the property?",
]

restaurant_templates = [
    "Is there a restaurant?", "Do you have a restaurant?", "What time does the restaurant open?",
    "Where can I eat?", "Do you serve food?", "Is the restaurant open for dinner?",
    "Do you have food", "Is there food",
    "What are the restaurant hours?", "Can I have dinner at the hotel?",
    "Do you have room service?", "Is lunch available?", "Can I order food to my room?",
    "What food do you serve?", "Is the restaurant open all day?", "Do you have vegetarian options?",
    "What cuisine do you serve?", "Is there a set menu?",
    "Can I make a restaurant reservation?", "Is the restaurant open for lunch?",
    "Do you serve local food?", "Is there an outdoor dining area?",
    "Where can we get a proper meal?",
    "Is there somewhere for a sit-down dinner?",
    "Anywhere on site serving food?",
    "Where do guests usually eat?",
    "Is there a place to have lunch here?",
]

directions_templates = [
    "How do I get there?", "Where are you located?", "How far are you from the airport?",
    "How do I get to the hotel?", "Is there a shuttle from the airport?", "What is the address?",
    "How far is the hotel from the beach?", "Can I walk from the airport?",
    "What is the best way to get there?", "Is there public transport to the hotel?",
    "How long does it take from the city center?", "Can you arrange a pickup?",
    "How far is the nearest town?", "Is there a bus to the hotel?",
    "What is the nearest airport?", "How do I find you on Google Maps?",
    "Is there a train station nearby?", "How far is it from the port?",
    "Is the hotel easy to find?", "How long is the drive from downtown?",
    "How do I get to {property}?",
    "How do I reach {property}?",
    "How can I get to {property}?",
    "What is the best route to {property}?",
    "How do I find {property}?",
    "Can you give me directions to {property}?",
    "How far is it to {property}?",
    "What is the easiest way to get to {property}?",
]

taxi_templates = [
    "Is there a taxi service?", "Can I get a taxi?", "Are taxis available?",
    "How do I get a taxi?", "Is there a taxi nearby?", "Can you call a taxi for me?",
    "Where can I find a taxi?", "Are taxis available at the hotel?",
    "How much does a taxi cost?", "Can I get a ride from the hotel?",
    "Do you have a taxi number?", "Is it easy to get a taxi here?",
    "Are there taxis outside the hotel?", "Can you arrange a taxi for me?",
    "Is there an Uber nearby?", "How long does a taxi take to arrive?",
    "Can I book a taxi in advance?", "Is there a taxi stand nearby?",
    "How much is a taxi to the airport?", "Do taxis accept credit cards?",
    "Can someone drive us to the airport?",
    "Need a ride right now, is that possible?",
    "Can you organize a car for us?",
    "How do we get a private ride from here?",
    "Is there a driver we can call?",
]

transport_templates = [
    "Is there public transport nearby?", "Can I take a bus from here?",
    "Is there a metro nearby?", "How do I get around?",
    "What transport options are available?", "Can I rent a bicycle?",
    "How far is the bus stop?", "Is there a night bus?",
    "What is the cheapest way to get around?", "Can I walk to most places?",
    "Is there a free shuttle service?", "Can I rent a scooter?",
    "Is the area walkable?", "Is there a tram nearby?",
    "How do locals get around?", "Is there a water taxi?",
    "Is there a hop on hop off bus?", "Are there rickshaws available?",
    "Is there a tuk tuk service?", "Can I rent a car nearby?",
    "What are our options for getting around the area?",
    "How do most guests get to town?",
    "What's the general way people travel here?",
    "Are there different ways to get around locally?",
    "What transport is typically used around here?",
]

nearby_shops_templates = [
    "Are there shops nearby?", "Where can I buy groceries?",
    "Is there a supermarket nearby?", "Where is the nearest pharmacy?",
    "Are there markets nearby?", "Where can I buy souvenirs?",
    "Is there a mall nearby?", "Where is the nearest ATM?",
    "Are there local shops?", "Is there a convenience store nearby?",
    "Where can I buy medicine?", "Is there a bakery nearby?",
    "Where can I find local products?", "Are there street markets nearby?",
    "Is there a minimarket close by?", "Where can I exchange money?",
    "Is there a post office nearby?", "Where can I buy local crafts?",
    "Is there a market nearby?", "Are there restaurants nearby?",
    "anywhere close to grab snacks or supplies",
    "need to find a pharmacy nearby",
    "is there somewhere close for essentials",
    "where can we pick up basics nearby",
    "anywhere within walking distance to shop",
    "is there somewhere local to stock up on things",
]

general_menu_templates = [
    "Do you have a menu?", "Can I see the menu?", "What food do you serve?",
    "What's on the menu?", "Can I get something to eat?",
    "Do you have food available?", "What can I eat here?",
    "Is there a restaurant menu?", "What meals do you offer?",
    "Do you have a food menu?", "Can I have a look at the menu?",
    "What are your meal options?", "Is food available at the hotel?",
    "Do you offer meals?", "Show me the menu",
    "I'd like to see the menu", "What do you serve?",
    "Is there food at the hotel?", "Can I eat at the hotel?",
    "Do you have a digital menu?", "Can you show me what you serve?",
    "What's available to eat?", "Do you have a daily menu?",
    "Can I see today's menu?", "Is there a menu online?",
    "Do you have food?",
    "Is there food?",
    "Can I get food here?",
    "Do you sell food?",
    "Is food served here?",
    "Do you provide food?",
    "Can I order food?",
    "Is there anything to eat?",
    "Do you have something to eat?",
    "Can I eat something here?",
    "Do you have food?",
    "Is there food?",
    "Can I get food here?",
    "Do you sell food?",
    "Is food served here?",
    "Do you provide food?",
    "Can I order food?",
    "Is there anything to eat?",
    "Do you have something to eat?",
    "Can I eat something here?",
    "Is there food available?",
    "What food is available?",
    "Do you offer food?",
    "Is food included?",
    "Can guests get food here?",
    "Where can I eat?",
    "Can I get something to eat?",
    "Is there anywhere to eat?",
    "Do you serve any food?",
    "What can I eat?",
    "Is there a place to eat?",
    "Can I find food here?",
    "Do you have any food options?",
    "What are the food options?",
    "Is food available at the hotel?",
    "Do you provide meals?",
    "Are meals available?",
    "Can I get a meal here?",
    "Do you have meals?",
    "What meals are available?",
    "Is there somewhere I can eat?",
    "Can I grab something to eat?",
    "Do you have snacks?",
    "Is there a cafe?",
    "Do you have a cafe?",
    "Is there somewhere to grab a bite?",
]

meal_templates = [
    "Do you serve {meal}?", "What's on the {meal} menu?",
    "Can I see the {meal} menu?", "What do you have for {meal}?",
    "Is {meal} available?", "What is served for {meal}?",
    "Can you show today's {meal} menu?", "I'd like to see the {meal} menu",
    "What's for {meal} today?", "Do you offer {meal}?",
    "What time is {meal}?", "Is {meal} included?",
    "Can I have {meal} in my room?", "What does {meal} include?",
    "Is {meal} served daily?", "What time does {meal} start?",
    "What time does {meal} end?", "Is {meal} a buffet?",
    "How much does {meal} cost?", "Do you have {meal} on weekends?",
    "any veggie options for {meal}?",
    "any vegan options for {meal}?",
    "what's good for {meal}?",
    "anything special for {meal} tonight?",
    "what are you serving for {meal}?",
    "got any {meal} options?",
    "what can we expect for {meal}?",
    "any gluten free options for {meal}?",
    "what's on offer for {meal}?",
    "are there choices for {meal}?",
    "any recommendations for {meal}?",
    "what's usually served at {meal}?",
]

MEALS = ["breakfast", "lunch", "dinner"]
PROPERTY_NAMES = ["the lodge", "the hotel", "you", "your place", "there"]

book_room_templates = [
    "Book ROOM", "I want to book ROOM", "I want ROOM", "Reserve ROOM",
    "I'd like to book ROOM", "Can I book ROOM", "Can you book ROOM for me",
    "I'll take ROOM", "I'd like ROOM please", "Give me ROOM",
    "I want to stay in ROOM", "I want to reserve ROOM", "Can I get ROOM",
    "Book the ROOM please", "Reserve the ROOM for me", "Can you reserve ROOM",
    "I would like to book ROOM", "ROOM please", "ROOM",
    "I am interested in ROOM", "Can I have ROOM?", "Please reserve ROOM for me",
    "I'd love to stay in ROOM", "I choose ROOM", "Let's book ROOM",
    "Sign me up for ROOM", "Put me in ROOM", "I'll go with ROOM",
    "let's go with ROOM",
    "we'll take ROOM then",
    "ROOM sounds perfect, let's do that",
    "put us down for ROOM",
    "ROOM works for us",
    "we've decided on ROOM",
]

conversation_templates = [
    "Hello", "Hi", "Hey", "Good morning", "Good evening", "Good afternoon",
    "Thanks", "Thank you", "Goodbye", "See you", "OK", "Sure", "Alright",
    "Great", "Perfect", "Sounds good", "That's fine", "No problem",
    "I see", "Got it", "Understood", "Cool", "Nice", "Wonderful",
    "Excellent", "Fantastic", "Cheers", "Amazing", "Brilliant",
    "Howdy", "Greetings", "Good day", "Morning", "Evening",
    "Hiya", "Yo", "What's up", "How are you", "How are you doing",
    "Good to be here", "Nice to meet you", "Pleasure", "My pleasure",
    "You're welcome", "No worries", "Of course", "Absolutely",
    "That's great", "That's perfect", "That's wonderful", "That's amazing",
    "I appreciate it", "I appreciate that", "Thank you so much",
    "Many thanks", "Much appreciated", "Appreciate your help",
    "See you later", "Take care", "Have a good day", "Have a nice day",
    "Talk to you later", "Until next time", "Bye", "Bye bye",
    "I'm back", "Hello again", "Hi there", "Hey there",
    "Good to hear from you", "Nice talking to you",
    "Sounds great", "Looks good", "Works for me", "That works",
    "I understand", "I see what you mean", "Makes sense",
    "OK thanks", "OK great", "OK perfect", "OK sounds good",
    "Yes", "No", "Maybe", "Perhaps", "Definitely", "Certainly",
]

# ── GENERATORS ────────────────────────────────────────────────────────────────

def random_guests():
    number = random.randint(1, 6)

    natural = {
        1: [
            "1",
            "one",
            "just me",
        ],
        2: [
            "2",
            "two",
            "the two of us",
            "me and my girlfriend",
            "me and my boyfriend",
            "me and my partner",
            "my wife and I",
            "my husband and I",
        ],
        3: [
            "3",
            "three",
            "the three of us",
        ],
        4: [
            "4",
            "four",
            "the four of us",
        ],
        5: [
            "5",
            "five",
            "the five of us",
        ],
        6: [
            "6",
            "six",
            "the six of us",
        ],
    }

    return random.choice(natural[number])

def generate_room_feature():
    if random.random() < 0.5:
        bed_type = random.choice(BED_TYPES)
        template  = random.choice(room_feature_bed_templates)
        text      = with_prefix(template.format(bed_type=bed_type))

        entities = []
        add_entity(entities, text, f"{bed_type} bed", "BED_TYPE")
        return {"text": text, "intent": "ask_room_feature", "entities": entities}

    feature  = random.choice(ROOM_FEATURES)
    template = random.choice(room_feature_amenity_templates)
    text     = with_prefix(template.format(feature=feature))

    entities = []
    add_entity(entities, text, feature, "FEATURE")
    return {"text": text, "intent": "ask_room_feature", "entities": entities}

def generate_directions():
    template = random.choice(directions_templates)
    if "{property}" in template:
        text = template.format(property=random.choice(PROPERTY_NAMES))
    else:
        text = template
    return {"text": with_prefix(text), "intent": "ask_directions", "entities": []}

number_words = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
}

def generate_availability():
    guests = random_guests()
    date = random_date()
    end_date = random_date()

    duration_value = random.choice([
        "1", "2", "3", "5", "7", "10", "14",
        "one", "two", "three", "five", "seven", "ten", "fourteen",
    ])

    duration_unit = random.choice([
        "night",
        "nights",
        "day",
        "days",
        "week",
        "weeks",
    ])

    template = random.choice(availability_templates)

    text = template.format(
        guests=guests,
        date=date,
        end_date=end_date,
        duration_value=duration_value,
        duration_unit=duration_unit,
    )

    text = with_prefix(text)

    entities = []

    if "{guests}" in template:
        add_entity(entities, text, guests, "GUESTS")

    if "{date}" in template:
        add_entity(entities, text, date, "START_DATE")

    if "{end_date}" in template:
        add_entity(entities, text, end_date, "END_DATE")

    if "{duration_value}" in template:
        add_entity(
            entities,
            text,
            duration_value,
            "DURATION_VALUE",
        )

    if "{duration_unit}" in template:
        add_entity(
            entities,
            text,
            duration_unit,
            "DURATION_UNIT",
        )

    return {
        "text": text,
        "intent": "check_availability",
        "entities": entities,
    }

def generate_book_room():
    text = random.choice(book_room_templates)
    entities = []
    if "ROOM" in text:
        start = text.index("ROOM")
        entities = [{"start": start, "end": start + 4, "label": "ROOM_NAME"}]
    return {"text": text, "intent": "book_room", "entities": entities}

def generate_menu():
    if random.random() < 0.5:
        return {"text": with_prefix(random.choice(general_menu_templates)), "intent": "ask_menu", "entities": []}
    
    meal = random.choice(MEALS)
    text = with_prefix(random.choice(meal_templates).format(meal=meal))  # ← prefix först
    entities = []
    add_entity(entities, text, meal, "MEAL_TYPE")  # ← positioner beräknas på prefixad text
    return {"text": text, "intent": "ask_menu", "entities": entities}

def simple(templates, intent):
    return lambda: {"text": with_prefix(random.choice(templates)), "intent": intent, "entities": []}

generators = [
    generate_availability,
    generate_book_room,
    generate_menu,
    generate_ask_booking,
    generate_ask_booking,
    generate_check_in,
    generate_check_out,
    generate_room_feature,
    generate_room_feature,
    simple(wifi_templates,          "ask_wifi"),
    simple(breakfast_templates,     "ask_breakfast"),
    simple(pool_templates,          "ask_pool"),
    simple(parking_templates,       "ask_parking"),
    simple(bar_templates,           "ask_bar"),
    simple(restaurant_templates,    "ask_restaurant"),
    simple(directions_templates,    "ask_directions"),
    simple(taxi_templates,          "ask_taxi"),
    simple(transport_templates,     "ask_transport"),
    simple(nearby_shops_templates,  "ask_nearby_shops"),
    simple(conversation_templates,  "conversation_update"),
    simple(conversation_templates, "conversation_update"),
    simple(conversation_templates, "conversation_update"),
]

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    for _ in range(TOTAL_SAMPLES):
        f.write(json.dumps(random.choice(generators)(), ensure_ascii=False) + "\n")

print(f"✅ Generated {TOTAL_SAMPLES} samples → {OUTPUT_FILE}")

from collections import Counter
intents = []
with open(OUTPUT_FILE) as f:
    for line in f:
        line = line.strip()
        if line:
            intents.append(json.loads(line)["intent"])

counts = Counter(intents)
for k, v in sorted(counts.items()):
    print(f"  {k}: {v}")