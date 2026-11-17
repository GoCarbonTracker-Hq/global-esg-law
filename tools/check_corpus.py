#!/usr/bin/env python3
"""Admission gate: refuse any record whose source row or scope entry does not allow storing it."""
import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

from make_sources import BANNED, FORMS, load_sources

ROOT = Path(__file__).resolve().parents[1]


def real_date(value):
    """True if value is a real calendar date written YYYY-MM-DD."""
    try:
        return bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", value) and date.fromisoformat(value))
    except (TypeError, ValueError):
        return False


def require_place(repo, iso2):
    """Raise ValueError unless iso2 is two upper-case letters with a register/<iso2>/scope.json."""
    if not re.fullmatch(r"[A-Z]{2}", iso2) or not (Path(repo) / "register" / iso2 / "scope.json").is_file():
        raise ValueError(f"--iso2 {iso2!r} is not an upper-case place code with a register/<ISO2>/scope.json")


def check(repo=ROOT, iso2=None, strict=False):
    """Return the number of records checked; raise ValueError naming the first bad record path.

    With iso2, check only records/<iso2>/**. With strict, also require scope status "stored", a real in_force date,
    and fetched_url plus fetched_sha256 on every record that is not repealed: true. The command line is always strict.
    ponytail: off by default because the record fixtures of other test files lack those fields; flip once they carry them."""
    repo = Path(repo).resolve()
    if iso2 is not None:
        require_place(repo, iso2)
    rows = load_sources(repo / "sources.json")
    count = 0
    for path in sorted((repo / "records" / (iso2 or "")).rglob("*.json")):
        rel = path.relative_to(repo).as_posix()
        parts = path.relative_to(repo / "records").parts

        def refuse(reason):
            raise ValueError(f"{rel}: {reason}")

        if len(parts) != 3:
            refuse("record is not at records/<ISO2>/<instrument>/<file>.json")
        iso2, instrument = parts[:2]
        record = json.loads(path.read_text(encoding="utf-8"))
        source_id, kind = record.get("source_id"), record.get("kind")
        row = rows.get(source_id)
        if row is None:
            refuse(f"source_id {source_id!r} not in sources.json")
        if row.get("verdict") != "pass":
            refuse(f"source {source_id} verdict is {row.get('verdict')!r}, not 'pass'")
        language = record.get("language")
        if not isinstance(language, str) or not re.fullmatch(r"[a-z]{2}", language):
            refuse(f"language {language!r} is not an ISO 639-1 code (two lowercase letters)")
        named = re.fullmatch(r"\d{4}-\d{2}-\d{2}-[a-z]+-([a-z]{2})", path.stem)
        if named and named.group(1) != language:
            refuse(f"file name ends -{named.group(1)} but language is {language!r}")
        if kind not in FORMS:
            refuse(f"kind {kind!r} is not one of {sorted(FORMS)}")
        if kind != row.get("form"):
            refuse(f"kind {kind!r} differs from source {source_id} form {row.get('form')!r}")
        if not (record.get("text") or "").strip() and record.get("repealed") is not True:
            refuse("empty text is allowed only with repealed: true")
        if strict:
            effective = record.get("in_force") or path.name[:10]
            if not real_date(effective):
                refuse(f"in_force {effective!r} is not a real date as YYYY-MM-DD")
            if record.get("repealed") is not True:
                fetched_url, sha = record.get("fetched_url"), record.get("fetched_sha256")
                if not isinstance(fetched_url, str) or not fetched_url.strip():
                    refuse(f"fetched_url {fetched_url!r} is empty; only a repealed: true stub may omit it")
                if not (isinstance(sha, str) and re.fullmatch(r"[0-9a-f]{64}", sha)):
                    refuse(f"fetched_sha256 {sha!r} is not 64 lowercase hex digits; only a repealed: true stub may omit it")
        scope_path = repo / "register" / iso2 / "scope.json"
        scope = json.loads(scope_path.read_text(encoding="utf-8")) if scope_path.exists() else []
        entry = next((e for e in scope if e.get("id") == instrument), None)
        if entry is None:
            refuse(f"no instrument {instrument!r} in register/{iso2}/scope.json")
        if strict and entry.get("status") != "stored":
            refuse(f"register/{iso2}/scope.json status is {entry.get('status')!r}, not 'stored'")
        applies = entry.get("applies_from")
        if applies is not None and not real_date(applies):
            refuse(f"applies_from {applies!r} in register/{iso2}/scope.json is not a real date as YYYY-MM-DD")
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
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", nargs="?", default=ROOT)
    parser.add_argument("--iso2", help="check only records/<ISO2>/**")
    args = parser.parse_args()
    try:
        print(f"{check(args.repo, iso2=args.iso2, strict=True)} records checked")
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1)
