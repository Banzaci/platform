# nlp/scripts/split.py
import srsly
import spacy
from spacy.tokens import DocBin
import random

nlp = spacy.blank("en")

examples = [dict(e) for e in srsly.read_jsonl("nlp/data/train.jsonl")] # type: ignore
print(f"Total examples: {len(examples)}")

# Läs intents dynamiskt från datan – slipp hårdkoda listan
ALL_INTENTS = sorted(set(e["intent"] for e in examples))# type: ignore
print(f"Found intents: {ALL_INTENTS}")

# Varna om ett exempel har en intent som inte finns i listan
for e in examples:
    if e["intent"] not in ALL_INTENTS:# type: ignore
        print(f"⚠️  Unknown intent: {e['intent']} in: {e['text']}")# type: ignore

textcat = nlp.add_pipe("textcat")
for intent in ALL_INTENTS:
    textcat.add_label(intent)

random.shuffle(examples)
split      = int(len(examples) * 0.8)
train_data = examples[:split]
dev_data   = examples[split:]

def to_docbin(data, path):
    db = DocBin()
    for example in data:
        doc = nlp.make_doc(example["text"])
        doc.cats = {intent: 0.0 for intent in ALL_INTENTS}
        doc.cats[example["intent"]] = 1.0
        ents = []
        for ent in example.get("entities", []):
            span = doc.char_span(ent["start"], ent["end"], label=ent["label"])
            if span:
                ents.append(span)
        doc.ents = ents
        db.add(doc)
    db.to_disk(path)
    print(f"✅ Saved {len(data)} examples to {path}")

to_docbin(train_data, "nlp/data/train.spacy")
to_docbin(dev_data,   "nlp/data/dev.spacy")