# nlp/scripts/export_unknowns.py
from collections import Counter
from app.db.session import SessionLocal
from app.models.unknown_query import UnknownQuery

OUTPUT_FILE = "nlp/data/unknowns_review.txt"
LIMIT = 300


def export():
    db = SessionLocal()
    try:
        rows = (
            db.query(UnknownQuery)
            .order_by(UnknownQuery.id.desc())
            .limit(LIMIT)
            .all()
        )

        if not rows:
            print("Inga unknown_queries hittades.")
            return

        counts = Counter(row.query.strip().lower() for row in rows)

        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            f.write(f"# {len(rows)} unknown queries, {len(counts)} unika\n")
            f.write("# Format: <antal>x  <fråga>\n\n")
            for query, count in counts.most_common():
                f.write(f"{count}x  {query}\n")

        print(f"✅ Exporterade {len(counts)} unika frågor → {OUTPUT_FILE}")
        print("\nTopp 15 vanligaste:")
        for query, count in counts.most_common(15):
            print(f"  {count}x  {query}")

    finally:
        db.close()


if __name__ == "__main__":
    export()