# nlp/scripts/test_query.py
import sys
import json
from nlp.predict import predict as nlp_predict

if len(sys.argv) < 2:
    print("Usage: python nlp/scripts/test_query.py 'your query text here'")
    sys.exit(1)

text = sys.argv[1]
result = nlp_predict(text)
print(json.dumps(result, indent=2, ensure_ascii=False))


# python -m nlp.scripts.test_query "do you have a room with quees size bed"