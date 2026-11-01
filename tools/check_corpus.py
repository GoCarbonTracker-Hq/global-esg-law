#!/usr/bin/env python3
"""Admission gate: refuse any record whose source row or scope entry does not allow storing it."""
import json
import sys
from pathlib import Path

from make_sources import BANNED, FORMS

ROOT = Path(__file__).resolve().parents[1]


def check(repo=ROOT):
    """Return the number of records checked; raise ValueError naming the first bad record path."""
    repo = Path(repo).resolve()
    rows = {r["id"]: r for r in json.loads((repo / "sources.json").read_text(encoding="utf-8"))}
    count = 0
    for path in sorted((repo / "records").rglob("*.json")):
        rel = path.relative_to(repo).as_posix()
        iso2, instrument = path.relative_to(repo / "records").parts[:2]
        record = json.loads(path.read_text(encoding="utf-8"))
        source_id, kind = record.get("source_id"), record.get("kind")

        def refuse(reason):
            raise ValueError(f"{rel}: {reason}")

        row = rows.get(source_id)
        if row is None:
            refuse(f"source_id {source_id!r} not in sources.json")
        if row.get("verdict") != "pass":
            refuse(f"source {source_id} verdict is {row.get('verdict')!r}, not 'pass'")
        if kind not in FORMS:
            refuse(f"kind {kind!r} is not one of {sorted(FORMS)}")
        if kind != row.get("form"):
            refuse(f"kind {kind!r} differs from source {source_id} form {row.get('form')!r}")
        scope_path = repo / "register" / iso2 / "scope.json"
        scope = json.loads(scope_path.read_text(encoding="utf-8")) if scope_path.exists() else []
        entry = next((e for e in scope if e.get("id") == instrument), None)
        if entry is None:
            refuse(f"no instrument {instrument!r} in register/{iso2}/scope.json")
        allowed = entry.get("source_row")
        if source_id not in (allowed if isinstance(allowed, list) else [allowed]):
            refuse(f"source_id {source_id!r} differs from scope.json source_row {allowed!r}")
        for label, value in (("publisher", row.get("publisher")), ("source_name", row.get("source_name")),
                             ("scope title", entry.get("title"))):
            if BANNED.search(value or ""):
                refuse(f"standards text by name in {label}: {value!r}")
        count += 1
    return count


if __name__ == "__main__":
    try:
        print(f"{check(sys.argv[1] if len(sys.argv) > 1 else ROOT)} records checked")
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1)
