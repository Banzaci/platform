from nlp.predict import predict as nlp_predict


def analyze_message(text: str) -> dict:
    result = nlp_predict(text)

    return {
        "intent": result["intent"],
        "confidence": result["confidence"],
        "entities": {
            entity["label"]: entity["text"]
            for entity in result["entities"]
        },
    }