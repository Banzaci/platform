from nlp.predict import predict as nlp_predict
from nlp.data.guest_count import predict_guest_count
from nlp.data.numbers import parse_number

def analyze_message(text: str) -> dict:
    result = nlp_predict(text)

    entities = {
        entity["label"]: entity["text"]
        for entity in result["entities"]
    }

    if "GUESTS" in entities:
        guest_count = predict_guest_count(entities["GUESTS"])

        if guest_count is not None:
            entities["GUESTS"] = guest_count

    return {
        "intent": result["intent"],
        "confidence": result["confidence"],
        "entities": entities,
    }