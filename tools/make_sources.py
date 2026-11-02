#!/usr/bin/env python3
"""Generate sources.json from sources/licence-table.csv. Stdlib only."""
import csv
import json
import re
import sys
from pathlib import Path

COLUMNS = [
    "id", "jurisdiction", "publisher", "source_name", "form", "fetch_url",
    "pinned_version", "content_hash", "terms_url", "terms_quote",
    "terms_fingerprint", "verdict", "statute_exception", "verdict_basis", "checked_by", "checked_on",
    "trailer_instrument", "trailer_source_url", "trailer_licence", "notes",
]
VERDICTS = {"pass", "fail", "unknown", "permission requested"}
BASES = {"terms", "statute"}
FORMS = {"adopted", "consolidated", "translation"}
BANNED = re.compile(
    r"\bISO\b|International Organi[sz]ation for Standardi[sz]ation|\bGRI\b|Global Reporting Initiative",
    re.I,
)


def build(csv_path, out_path):
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames != COLUMNS:
            sys.exit(f"columns must be exactly: {','.join(COLUMNS)}")
        rows = list(reader)
    for r in rows:
        rid = r["id"]
        if BANNED.search(r["publisher"]) or BANNED.search(r["source_name"]):
            sys.exit(f"{rid}: standards bodies get no row")
        if not r["terms_url"].strip():
            sys.exit(f"{rid}: empty terms_url")
        if not r["terms_quote"].strip():
            sys.exit(f"{rid}: empty terms_quote")
        if r["verdict"] not in VERDICTS:
            sys.exit(f"{rid}: verdict must be one of {sorted(VERDICTS)}")
        if r["verdict_basis"] not in BASES:
            sys.exit(f"{rid}: verdict_basis must be one of {sorted(BASES)}")
        if not r["statute_exception"].strip():
            sys.exit(f"{rid}: empty statute_exception (write 'none found')")
        if r["form"] not in FORMS:
            sys.exit(f"{rid}: form must be one of {sorted(FORMS)}")
        if not (r["pinned_version"].strip() or r["content_hash"].strip()):
            sys.exit(f"{rid}: pinned_version or content_hash required")
    Path(out_path).write_text(
        json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    build(root / "sources" / "licence-table.csv", root / "sources.json")
