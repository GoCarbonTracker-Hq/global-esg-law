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
# A terms_quote that opens like a fetch or block message is not a quote; when the terms were not read it says so instead.
FETCH_ERROR = re.compile(
    r"^\W*(curl: \(\d+\)|CONNECT tunnel failed|SSL certificate problem|(?:HTTP )?[45]\d\d\b|Just a moment"
    r"|(?:Sorry, )?you have been blocked|Request blocked|ERROR: The request could not be satisfied|Access Denied"
    r"|Account Suspended|Connection (?:reset|refused|timed out)|Recv failure|Visitor anti-robot"
    r"|Website Maintenance Notice|No HTTP response)",
    re.I,
)
UNREAD = re.compile(r"^(Terms page |Page |Terms )?(not (read|opened)|could not be opened|unread)\b", re.I)
BANNED = re.compile(
    r"\bISO\b|International Organi[sz]ation for Standardi[sz]ation|\bGRI\b|Global Reporting Initiative",
    re.I,
)


def load_sources(path):
    """Return {id: row} from sources.json. Identical duplicate rows collapse; conflicting ones raise ValueError."""
    rows = {}
    for r in json.loads(Path(path).read_text(encoding="utf-8")):
        if rows.setdefault(r["id"], r) != r:
            raise ValueError(f"{path}: conflicting duplicate rows for id {r['id']!r}")
    return rows


def build(csv_path, out_path):
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames != COLUMNS:
            sys.exit(f"columns must be exactly: {','.join(COLUMNS)}")
        rows = list(reader)
    seen = set()
    for r in rows:
        rid = r["id"]
        if rid in seen:
            sys.exit(f"{rid}: duplicate id")
        seen.add(rid)
        if BANNED.search(r["publisher"]) or BANNED.search(r["source_name"]):
            sys.exit(f"{rid}: standards bodies get no row")
        if not r["terms_url"].strip():
            sys.exit(f"{rid}: empty terms_url")
        if not r["terms_quote"].strip():
            sys.exit(f"{rid}: empty terms_quote")
        quote = r["terms_quote"].strip()
        if FETCH_ERROR.search(quote) and not UNREAD.match(quote):
            sys.exit(f'{rid}: terms_quote looks like a fetch error; if the terms were not read, start it with "Terms unread:"')
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
