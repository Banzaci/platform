import spacy

guest_nlp = spacy.load("nlp/output/guest_count")

def predict_guest_count(text: str) -> int | None:
    if not text:
        return None

    doc = guest_nlp(text)

    if not doc.cats:
        return None

    label, confidence = max(
        doc.cats.items(),
        key=lambda item: item[1],
    )

    if confidence < 0.60:
        return None

    return int(label.replace("GUESTS_", ""))

if __name__ == "__main__":
    print(predict_guest_count("me and my girlfriend"))
    print(predict_guest_count("me and my boyfriend"))
    print(predict_guest_count("three of us"))
    print(predict_guest_count("me and two friends"))
    print(predict_guest_count("just me"))