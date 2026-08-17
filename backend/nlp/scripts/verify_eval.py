# nlp/scripts/verify_eval.py
import json

EVAL_FILE = "nlp/data/eval.jsonl"


def verify():
    errors = 0
    total_entities = 0

    with open(EVAL_FILE, encoding="utf-8") as f:
        for i, line in enumerate(f):
            line = line.strip()
            if not line:
                continue

            ex = json.loads(line)
            text = ex["text"]

            for e in ex["entities"]:
                total_entities += 1
                start, end, label = e["start"], e["end"], e["label"]

                if start < 0 or end > len(text) or start >= end:
                    print(f"❌ Line {i}: invalid span [{start}:{end}] out of bounds for '{text}'")
                    errors += 1
                    continue

                span = text[start:end]
                print(f"Line {i}: [{label}] '{span}'")

                # Enkel sanity-check: varna om spannet börjar/slutar mitt i ett ord
                if start > 0 and text[start - 1].isalnum() and span[0].isalnum():
                    print(f"   ⚠️  möjligt off-by-one: tecknet innan är '{text[start-1]}'")
                if end < len(text) and text[end].isalnum() and span[-1].isalnum():
                    print(f"   ⚠️  möjligt off-by-one: tecknet efter är '{text[end]}'")

    print(f"\n{'='*50}")
    print(f"Totalt {total_entities} entities kontrollerade, {errors} ogiltiga spans")
    print(f"{'='*50}")


if __name__ == "__main__":
    verify()