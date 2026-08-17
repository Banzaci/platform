import json

count = 0

with open("nlp/data/train.jsonl") as f:
    for line in f:
        item = json.loads(line)

        if item["intent"] == "check_availability":
            if " of " in item["text"]:
                count += 1

print(count)