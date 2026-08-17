# nlp/scripts/eval.py
import json
from collections import defaultdict
from datetime import datetime
from nlp.predict import predict as nlp_predict

EVAL_FILE = "nlp/data/eval.jsonl"
HISTORY_FILE = "nlp/data/eval_history.txt"


def load_eval_set(path: str) -> list[dict]:
    examples = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                examples.append(json.loads(line))
    return examples


def spans_match(pred_entities: list[dict], true_entities: list[dict], full_text: str) -> tuple[int, int, int]:
    """Returnerar (tp, fp, fn). Matchar på normaliserad text + label,
    eftersom nlp_predict inte returnerar start/end-positioner."""
    pred_set = {(e["text"].strip().lower(), e["label"]) for e in pred_entities}

    # true_entities har start/end från eval.jsonl — extrahera texten därifrån
    true_set = {
        (full_text[e["start"]:e["end"]].strip().lower(), e["label"])
        for e in true_entities
    }

    tp = len(pred_set & true_set)
    fp = len(pred_set - true_set)
    fn = len(true_set - pred_set)
    return tp, fp, fn


def read_last_accuracy() -> float | None:
    try:
        with open(HISTORY_FILE, encoding="utf-8") as f:
            lines = [l.strip() for l in f if l.strip()]
        if not lines:
            return None
        last_line = lines[-1]
        # format: "2026-08-12 14:30  intent_acc=89.0%  ..."
        for part in last_line.split():
            if part.startswith("intent_acc="):
                return float(part.split("=")[1].rstrip("%"))
    except FileNotFoundError:
        return None
    return None


def append_history(intent_acc: float, entity_stats: dict, total: int):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    entity_summary = "  ".join(
        f"{label}_f1={2 * (s['tp']/(s['tp']+s['fp']) if (s['tp']+s['fp']) > 0 else 0) * (s['tp']/(s['tp']+s['fn']) if (s['tp']+s['fn']) > 0 else 0) / max((s['tp']/(s['tp']+s['fp']) if (s['tp']+s['fp']) > 0 else 0) + (s['tp']/(s['tp']+s['fn']) if (s['tp']+s['fn']) > 0 else 0), 0.0001):.1%}"
        for label, s in sorted(entity_stats.items())
    )
    line = f"{timestamp}  intent_acc={intent_acc:.1%}  n={total}  {entity_summary}\n"
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(line)


def run_eval():
    CONFIDENCE_THRESHOLD = 0.60
    examples = load_eval_set(EVAL_FILE)
    intent_correct = 0
    intent_confusions = defaultdict(lambda: defaultdict(int))
    entity_stats = defaultdict(lambda: {"tp": 0, "fp": 0, "fn": 0})

    for ex in examples:
        result = nlp_predict(ex["text"])
        raw_intent = result["intent"]
        confidence = result["confidence"]
        predicted_intent = raw_intent if confidence >= CONFIDENCE_THRESHOLD else "unknown"
        predicted_entities = result["entities"]

        if predicted_intent == ex["intent"]:
            intent_correct += 1
        else:
            intent_confusions[ex["intent"]][predicted_intent] += 1

        true_entities = ex["entities"]
        for label in set([e["label"] for e in true_entities] + [e["label"] for e in predicted_entities]):
            pred_label_entities = [e for e in predicted_entities if e["label"] == label]
            true_label_entities = [e for e in true_entities if e["label"] == label]
            tp, fp, fn = spans_match(pred_label_entities, true_label_entities, ex["text"])
            entity_stats[label]["tp"] += tp
            entity_stats[label]["fp"] += fp
            entity_stats[label]["fn"] += fn

    total = len(examples)
    intent_acc = intent_correct / total if total > 0 else 0

    print(f"\n{'='*50}")
    print(f"Intent accuracy: {intent_correct}/{total} ({intent_acc:.1%})")

    last_acc = read_last_accuracy()
    if last_acc is not None:
        diff = intent_acc * 100 - last_acc
        arrow = "↑" if diff > 0 else ("↓" if diff < 0 else "→")
        print(f"Föregående körning: {last_acc:.1f}%  ({arrow} {diff:+.1f}pp)")
    print(f"{'='*50}\n")

    if intent_confusions:
        print("Top confusions (true → predicted):")
        for true_intent, confusions in sorted(intent_confusions.items()):
            for pred_intent, count in sorted(confusions.items(), key=lambda x: -x[1]):
                print(f"  {true_intent} → {pred_intent}: {count}x")
        print()

    print("Entity performance (per label):")
    print(f"{'Label':<15} {'Precision':<12} {'Recall':<12} {'F1':<8}")
    for label, stats in sorted(entity_stats.items()):
        tp, fp, fn = stats["tp"], stats["fp"], stats["fn"]
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        print(f"{label:<15} {precision:<12.1%} {recall:<12.1%} {f1:<8.1%}")

    append_history(intent_acc, entity_stats, total)
    print(f"\n📝 Loggad till {HISTORY_FILE}")


if __name__ == "__main__":
    run_eval()