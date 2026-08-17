import uuid
import re
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai.session_service import (
    get_chat_session,
    save_chat_session,
    clear_chat_session,
)
from app.services.ai.nlp_service import analyze_message
from app.services.ai.knowledge_service import get_answer_for_intent
from app.services.ai.booking_service import (
    calculate_booking_price,
    find_available_properties,
    resolve_booking_dates,
    to_int,
    find_property_by_name,
    create_booking,
)

REQUIRED_BOOKING_SLOTS = [
    "START_DATE",
    "GUESTS",
    "NIGHTS",
]

BOOKING_FOLLOWUP_QUESTIONS = {
    "START_DATE": "What date would you like to check in?",
    "GUESTS": "How many guests will be staying?",
    "NIGHTS": "How many nights would you like to stay?",
}

GUEST_FOLLOWUP_QUESTIONS = {
    "GUEST_NAME": "What is your full name?",
    "GUEST_EMAIL": "What is your email address?",
    "PAYMENT_METHOD": "How would you like to pay? Online or cash?",
    "SPECIAL_REQUESTS": "Do you have any special requests? You can also say no.",
}

def is_valid_email(value: str) -> bool:
    return bool(
        re.fullmatch(
            r"[^@\s]+@[^@\s]+\.[^@\s]+",
            value.strip(),
        )
    )

def find_missing_slot(slots: dict) -> str | None:
    for slot in REQUIRED_BOOKING_SLOTS:
        # NIGHTS behövs inte om END_DATE redan finns
        if slot == "NIGHTS" and "END_DATE" in slots:
            continue

        if slot not in slots:
            return slot

    return None


async def handle_chat_message(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    text: str,
    session_id: str,
    language: str = "en",
) -> dict:
    session = await get_chat_session(session_id)

    slots = session.get("slots", {})
    pending_slot = session.get("pending_slot")

    print(text, tenant_id, session_id)
    # Gästuppgifter efter att property har valts
    if pending_slot in {
        "GUEST_NAME",
        "GUEST_EMAIL",
        "PAYMENT_METHOD",
        "SPECIAL_REQUESTS",
    }:
        slots[pending_slot] = text
        session["slots"] = slots

        if pending_slot == "GUEST_EMAIL":
            if not is_valid_email(text):
                session["pending_slot"] = "GUEST_EMAIL"

                await save_chat_session(
                    session_id,
                    session,
                )

                return {
                    "status": "follow_up",
                    "intent": "book_room",
                    "question": GUEST_FOLLOWUP_QUESTIONS[
                        "GUEST_EMAIL"
                    ],
                }
        if pending_slot == "GUEST_NAME":
            session["pending_slot"] = "GUEST_EMAIL"

            await save_chat_session(
                session_id,
                session,
            )

            return {
                "status": "follow_up",
                "intent": "book_room",
                "question": GUEST_FOLLOWUP_QUESTIONS[
                    "GUEST_EMAIL"
                ],
            }
        if pending_slot == "PAYMENT_METHOD":
            payment_method = text.strip().lower()

            if payment_method not in {
                "online",
                "cash",
            }:
                session["pending_slot"] = "PAYMENT_METHOD"

                await save_chat_session(
                    session_id,
                    session,
                )

                return {
                    "status": "follow_up",
                    "intent": "book_room",
                    "question": "Please choose online or cash.",
                }

            slots["PAYMENT_METHOD"] = payment_method
            session["slots"] = slots
            session["pending_slot"] = "SPECIAL_REQUESTS"

            await save_chat_session(
                session_id,
                session,
            )

            return {
                "status": "follow_up",
                "intent": "book_room",
                "question": GUEST_FOLLOWUP_QUESTIONS[
                    "SPECIAL_REQUESTS"
                ],
            }

        if pending_slot == "SPECIAL_REQUESTS":
            value = text.strip()

            if value.lower() in {
                "no",
                "none",
                "no thanks",
                "nothing",
            }:
                value = ""

            slots["SPECIAL_REQUESTS"] = value
            session["slots"] = slots
            session["pending_slot"] = None

        session["pending_slot"] = None
        session["intent"] = "book_room"
        dates = resolve_booking_dates(
            start_date=slots.get("START_DATE"),
            end_date=slots.get("END_DATE"),
            nights=slots.get("NIGHTS"),
        )

        if not dates:
            return {
                "status": "error",
                "message": "Could not resolve booking dates.",
            }

        check_in, check_out = dates

        price = await calculate_booking_price(
            db=db,
            property_id=uuid.UUID(
                session["selected_property_id"]
            ),
            check_in=check_in,
            check_out=check_out,
        )

        session["awaiting_confirmation"] = True
        session["intent"] = "book_room"

        await save_chat_session(
            session_id,
            session,
        )

        return {
            "status": "booking_ready",
            "property": {
                "id": session.get(
                    "selected_property_id"
                ),
                "name": session.get(
                    "selected_property_name"
                ),
            },
            "guest": {
                "name": slots.get("GUEST_NAME"),
                "email": slots.get("GUEST_EMAIL"),
            },
            "booking": {
                "check_in": check_in.isoformat(),
                "check_out": check_out.isoformat(),
                "nights": price["nights"],
                "guests": to_int(
                    slots.get("GUESTS")
                ),
                "units": (
                    to_int(slots.get("ROOMS"))
                    or 1
                ),
                "payment_method": slots.get("PAYMENT_METHOD"),
                "special_requests": slots.get("SPECIAL_REQUESTS") or None,
            },
            "price": {
                "total": price["total_price"],
                "breakdown": price["breakdown"],
            },
            "message": "Please confirm your booking details.",
        }

    if session.get("awaiting_confirmation"):
        normalized = text.strip().lower()

        if normalized not in {
            "yes",
            "confirm",
            "yes confirm",
            "book",
            "book it",
        }:
            return {
                "status": "booking_ready",
                "message": "Please confirm the booking or tell me what you would like to change.",
            }

        slots = session.get("slots", {})

        dates = resolve_booking_dates(
            start_date=slots.get("START_DATE"),
            end_date=slots.get("END_DATE"),
            nights=slots.get("NIGHTS"),
        )

        if not dates:
            return {
                "status": "error",
                "message": "Could not resolve booking dates.",
            }

        check_in, check_out = dates

        property_id = uuid.UUID(
            session["selected_property_id"]
        )

        price = await calculate_booking_price(
            db=db,
            property_id=property_id,
            check_in=check_in,
            check_out=check_out,
        )

        booking = await create_booking(
            db=db,
            tenant_id=tenant_id,
            property_id=property_id,
            check_in=check_in,
            check_out=check_out,
            guests=to_int(slots.get("GUESTS")) or 1,
            units=to_int(slots.get("ROOMS")) or 1,
            total_price=price["total_price"],
            guest_name=slots.get("GUEST_NAME"),
            guest_email=slots.get("GUEST_EMAIL"),
            payment_method=slots.get(
                "PAYMENT_METHOD",
                "online",
            ),
            special_requests=(
                slots.get("SPECIAL_REQUESTS")
                or None
            ),
            source="ai",
        )

        payment_method = slots.get(
            "PAYMENT_METHOD",
            "online",
        )

        response = {
            "status": "booking_confirmed",
            "booking": {
                "id": str(booking.id),
                "property_id": str(booking.property_id),
                "check_in": booking.check_in.isoformat(),
                "check_out": booking.check_out.isoformat(),
                "guests": booking.guests,
                "units": booking.units,
                "total_price": booking.total_price,
                "status": booking.status.value,
                "payment_method": booking.payment_method,
                "public_token": booking.public_token,
            },
            "message": "Your booking has been created.",
        }

        if payment_method == "online":
            payment_url = (
                f"/booking/{booking.public_token}/payment"
            )

            response["payment"] = {
                "method": "online",
                "status": "pending",
                "payment_url": payment_url,
                "message": "Continue to payment to complete your booking.",
            }

        elif payment_method == "cash":
            response["payment"] = {
                "method": "cash",
                "status": "pay_on_arrival",
                "payment_url": None,
                "message": "Payment will be collected at check-in.",
            }

        await clear_chat_session(session_id)

        return response
    
    # Gäst väljer property efter availability
    if session.get("awaiting_property_selection"):
        property = await find_property_by_name(
            db=db,
            tenant_id=tenant_id,
            name=text,
        )

        if property:
            session["selected_property_id"] = str(property.id)
            session["selected_property_name"] = property.name
            session["awaiting_property_selection"] = False
            session["pending_slot"] = "GUEST_NAME"

            await save_chat_session(
                session_id,
                session,
            )

            return {
                "status": "follow_up",
                "intent": "book_room",
                "property": {
                    "id": str(property.id),
                    "name": property.name,
                },
                "message": f"You selected {property.name}.",
                "question": GUEST_FOLLOWUP_QUESTIONS[
                    "GUEST_NAME"
                ],
            }

        # Ingen property matchade.
        # Fortsätt ner till NLP istället för att returnera fel.
        session["awaiting_property_selection"] = False


    # Om AI:n tidigare frågade efter ett specifikt värde,
    # exempelvis "How many guests?"
    if pending_slot:
        slots[pending_slot] = text
        session["pending_slot"] = None
        session["slots"] = slots

        intent = session.get(
            "intent",
            "check_availability"
        )

        confidence = 1.0
        entities = {}

    else:
        analysis = analyze_message(text)

        intent = analysis["intent"]
        confidence = analysis["confidence"]
        entities = analysis["entities"]

        if confidence < 0.60:
            return {
                "status": "unknown",
                "intent": intent,
                "confidence": confidence,
                "message": "I'm not sure about that.",
            }

        # Spara entities som booking-slots.
        slots.update(entities)

        session["slots"] = slots
        session["intent"] = intent

    # FAQ / tenant knowledge
    #
    # Kör bara FAQ när vi INTE befinner oss mitt i ett
    # booking-follow-up-flöde.
    if not pending_slot:
        answer = await get_answer_for_intent(
            db=db,
            tenant_id=tenant_id,
            intent=intent,
            language=language,
        )

        if answer:
            return {
                "status": "faq",
                "intent": intent,
                "confidence": confidence,
                "answer": answer,
            }

    # Availability / booking flow
    if intent in {
        "check_availability",
        "book_room",
    }:
        missing_slot = find_missing_slot(slots)

        if missing_slot:
            session["pending_slot"] = missing_slot
            session["slots"] = slots
            session["intent"] = intent

            await save_chat_session(
                session_id,
                session,
            )

            return {
                "status": "follow_up",
                "intent": intent,
                "question": BOOKING_FOLLOWUP_QUESTIONS[
                    missing_slot
                ],
            }

        dates = resolve_booking_dates(
            start_date=slots.get("START_DATE"),
            end_date=slots.get("END_DATE"),
            nights=slots.get("NIGHTS"),
        )

        guests = to_int(
            slots.get("GUESTS")
        )

        units = (
            to_int(slots.get("ROOMS"))
            or 1
        )

        if not dates:
            session["pending_slot"] = "START_DATE"

            await save_chat_session(
                session_id,
                session,
            )

            return {
                "status": "follow_up",
                "intent": intent,
                "question": BOOKING_FOLLOWUP_QUESTIONS[
                    "START_DATE"
                ],
            }

        if not guests:
            session["pending_slot"] = "GUESTS"

            await save_chat_session(
                session_id,
                session,
            )

            return {
                "status": "follow_up",
                "intent": intent,
                "question": BOOKING_FOLLOWUP_QUESTIONS[
                    "GUESTS"
                ],
            }

        check_in, check_out = dates

        properties = await find_available_properties(
            db=db,
            tenant_id=tenant_id,
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            units=units,
        )

        if properties:
            session["awaiting_property_selection"] = True
        else:
            session["awaiting_property_selection"] = False
            session["selected_property_id"] = None
            session["selected_property_name"] = None

        # Behåll slots efter availability.
        # De kan behövas om gästen väljer en property efteråt.
        session["slots"] = slots
        session["pending_slot"] = None
        session["intent"] = intent

        await save_chat_session(
            session_id,
            session,
        )

        return {
            "status": "availability",
            "intent": intent,
            "query": {
                "check_in": check_in.isoformat(),
                "check_out": check_out.isoformat(),
                "guests": guests,
                "units": units,
            },
            "properties": properties,
            "count": len(properties),
            "message": (
                "I found these available options. Which one would you like?"
                if properties
                else "I couldn't find anything available for those dates."
            ),
        }

    return {
        "status": "unknown",
        "intent": intent,
        "confidence": confidence,
        "entities": entities,
        "message": "I don't have information about that yet.",
    }