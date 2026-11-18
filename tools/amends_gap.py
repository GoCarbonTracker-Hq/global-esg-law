#!/usr/bin/env python3
"""Amends gap pass: every entry whose notes say "Amended by" must be named or excused.

Reads register/*/scope.json. An entry with "Amended by" in its notes is `named` when some entry lists its id in
`amends_ids`, `outside the register` when tools/amends_outside.json has its id (the amender is not an entry),
and `unresolved` otherwise. Prints one line and exits 1 when any is unresolved. It also exits 1 when an id in
amends_outside.json is not an entry with an "Amended by" note or is named after all: a stale exception must
not hide a gap. Writes nothing.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTSIDE = Path(__file__).resolve().parent / "amends_outside.json"


def classify(register, outside):
    """Return (unresolved, named, outside_ids, stale) as sorted id lists; stale holds (id, reason) pairs."""
    entries = [e for path in sorted(Path(register).glob("*/scope.json"))
               for e in json.loads(path.read_text(encoding="utf-8"))]
    targets = {t for e in entries for t in e.get("amends_ids") or []}
    amended = {e["id"] for e in entries if "Amended by" in (e.get("notes") or "")}
    unresolved = sorted(i for i in amended if i not in targets and i not in outside)
    named = sorted(amended & targets)
    excused = sorted(i for i in amended if i in outside and i not in targets)
    stale = [(i, "is not an entry with an 'Amended by' note" if i not in amended else "is named by an entry's amends_ids")
             for i in sorted(outside) if i not in amended or i in targets]
    return unresolved, named, excused, stale


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--register", default=ROOT / "register", help="directory holding <ISO2>/scope.json")
    ap.add_argument("--outside", default=OUTSIDE, help="JSON object from entry id to the reason")
    args = ap.parse_args(argv)
    try:
        outside = json.loads(Path(args.outside).read_text(encoding="utf-8"))
        unresolved, named, excused, stale = classify(args.register, outside)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f"amends gap: {exc}", file=sys.stderr)
        return 1
    print(f"unresolved {len(unresolved)}, named {len(named)}, outside the register {len(excused)}")
    for entry_id in unresolved:
        print(f"unresolved: {entry_id}")
    for entry_id, why in stale:
        print(f"stale exception: {entry_id} in {Path(args.outside).name} {why}", file=sys.stderr)
    return 1 if unresolved or stale else 0


if __name__ == "__main__":
    raise SystemExit(main())
