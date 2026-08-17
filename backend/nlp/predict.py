# nlp/predict.py - uppdatera sökvägen till output
import spacy
import os

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "output", "model-best")  # ← ändra från model till output

print(f"Model path: {MODEL_PATH}")
print(f"Model exists: {os.path.exists(MODEL_PATH)}")

nlp = spacy.load(MODEL_PATH)

# INTENT_THRESHOLD = 0.6
INTENT_THRESHOLD = 0.25

def predict(text: str) -> dict:
    if not text:
        return { "intent": "unknown", "confidence": 0.0, "entities": [] }

    doc = nlp(text)

    best_intent, best_score = max(
        doc.cats.items(),
        key=lambda x: x[1],
        default=("unknown", 0.0)
    )

    # if best_score < INTENT_THRESHOLD:
    #     best_intent = "unknown"
    if best_intent != "conversation_update" and best_score < INTENT_THRESHOLD:
        best_intent = "unknown"

    print(f"Predicted intent: {doc.cats.items()} (confidence: {best_score:.2f})")

    return {
        "intent":     best_intent,
        "confidence": float(best_score),
        "entities":   [{"text": e.text, "label": e.label_} for e in doc.ents],
    }