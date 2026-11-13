#!/usr/bin/env python3
"""Ask what law applied on a date: python3 tools/law.py <ISO2> <YYYY-MM-DD> [--repo PATH] [--ref REF] [--lang CODE] [--json]"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from query import in_force, known, lookup

ROOT = Path(__file__).resolve().parents[1]


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("iso2")
    ap.add_argument("date")
    ap.add_argument("--repo", default=str(ROOT))
    ap.add_argument("--ref", help="history ref (default: local history, then origin/history)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--lang", help="ISO 639-1 code: show that language's record when the version has one, else the official record")
    args = ap.parse_args(argv)
    iso2 = args.iso2.upper()
    if args.lang is not None and not re.fullmatch(r"[a-z]{2}", args.lang):
        print(f"malformed language {args.lang!r}, expected an ISO 639-1 code such as en", file=sys.stderr)
        return 2
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        print(f"malformed date {args.date!r}, expected YYYY-MM-DD", file=sys.stderr)
        return 2
    try:
        from datetime import date
        date.fromisoformat(args.date)
    except ValueError:
        print(f"malformed date {args.date!r}, expected YYYY-MM-DD", file=sys.stderr)
        return 2
    try:
        names = known(args.repo, args.ref)
        if iso2 not in names:
            print(f"unknown jurisdiction {iso2!r}; known: {', '.join(names)}", file=sys.stderr)
            return 2
        found, not_yet, first = lookup(iso2, args.date, args.repo, args.ref, args.lang, detail=True)
    except subprocess.CalledProcessError as exc:
        print(exc.stderr.strip() or exc, file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps({"jurisdiction": iso2, "date": args.date, "lang": args.lang, "in_force": found, "not_yet_in_force": not_yet}, indent=2))
        return 0
    for item in found:
        print(f"{item['id']}\t{item['in_force']}\t{item['kind']}\t{item['title']}"
              + (f"\tamends {item['amends']}" if "amends" in item else ""))
        for other in item["languages"][1:]:
            print(f"  {other['language'] or '-'}\t{other['kind']}")
        if args.lang:
            print(f"note {item['id']}: no {args.lang} record for this version, showing the official record ({item['language'] or '-'})"
                  if item["fallback"] else f"note {item['id']}: showing the {item['language']} record")
    for item in found:
        if "status_note" in item:
            print(f"note {item['id']}: {item['status_note']}")
        if item.get("date_basis") == "publication":
            print(f"note {item['id']}: date is a publication date because commencement is unknown")
    if not found:
        print((f"nothing in force before {first}" if args.date < first else f"nothing in force on {args.date}")
              if first else f"no instruments stored for {iso2}")
    if not_yet:
        print("not yet in force")
        for item in not_yet:
            print(f"{item['id']}\t{item['in_force']}\t{item['title']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
