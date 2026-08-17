## Engångssteg (görs en gång, inte vid varje iteration)

0a. Bygg nlp/data/eval.jsonl (handskrivna/varierade exempel, separat från träningsdata)
0b. Verifiera entity-spans: python nlp/scripts/verify_eval.py
    → fixa start/end manuellt i eval.jsonl tills alla spans stämmer

## Iterationsloop (varje gång du förbättrar modellen)

1. Kör: python -m nlp.scripts.export_unknowns
   → gå igenom nlp/data/unknowns_review.txt, identifiera vanliga luckor

2. Lägg till nya templates i generate_dataset.py
3. Lägg till ny generator-funktion
4. Lägg till i generators-listan

5. Kör: python nlp/data/generate_dataset.py
6. Kör: python nlp/scripts/split.py

7. Träna: python -m spacy train nlp/config.cfg \
            --output nlp/output \
            --paths.train nlp/data/train.spacy \
            --paths.dev nlp/data/dev.spacy

8. Starta om lokalt: uvicorn app.main:app --reload
   (i en annan terminal:)
9. Utvärdera: python -m nlp.scripts.eval

10. Jämför siffrorna mot förra körningen (intent accuracy, entity F1, confusions)
    → om bättre: fortsätt till nästa lucka (tillbaka till steg 1)
    → om sämre/oförändrat: granska vilka nya templates som orsakade förvirring


------------------------------------------------------------------------------------------------------


1. Lägg till nya templates i generate_dataset.py
2. Lägg till ny generator-funktion
3. Lägg till i generators-listan
4. Kör: python nlp/data/generate_dataset.py
5. Kör: python nlp/scripts/split.py
6. Träna: python -m spacy train nlp/config.cfg \
            --output nlp/output \
            --paths.train nlp/data/train.spacy \
            --paths.dev nlp/data/dev.spacy
7. uvicorn app.main:app --reload
# i en annan terminal:
8. python nlp/scripts/eval.py
9. Testa lokalt
10. Pusha till GitHub → ny Docker-image byggs automatiskt

# Ny intent
new_templates = [
    "Do you have a spa?",
    "Is there a gym?",
]

def generate_spa():
    return {"text": random.choice(new_templates), "intent": "ask_spa", "entities": []}

generators = [
    # ... befintliga ...
    generate_spa,  # ← lägg till
]

python -m spacy init config config.cfg --lang en --pipeline textcat,ner --force


  spacy train config.cfg \
  --output ./model \
  --paths.init_tok2vec ./model/model-best


python nlp/data/generate_dataset.py
python nlp/scripts/split.py
python -m spacy train nlp/config.cfg \
  --output nlp/output \
  --paths.train nlp/data/train.spacy \
  --paths.dev nlp/data/dev.spacy
python -m spacy evaluate nlp/output/model-best nlp/data/dev.spacy



  python -c "
from app.db.session import engine
from app.db.base import Base
from app.models.room import Room
from app.models.booking import Booking

Booking.__table__.drop(engine)
Base.metadata.create_all(bind=engine)
print('Done')

"

Remove duplicates: 
python -c "
import json

with open('nlp/data/train.jsonl') as f:
    lines = f.readlines()

seen = set()
unique = []
for line in lines:
    line = line.strip()
    if not line:
        continue
    if line not in seen:
        seen.add(line)
        unique.append(line)

with open('nlp/data/train.jsonl', 'w') as f:
    f.write('\n'.join(unique) + '\n')

print(f'Before: {len(lines)}, After: {len(unique)}, Removed: {len(lines) - len(unique)}')
"