#!/usr/bin/env python3
"""Expected values for the lookup page check.

python3 tests/web/expected.py --ref origin/history --read-on 2026-11-17 --out PATH [--repo PATH]

Every value comes from tools/query.py (lookup, law_in_force, envelope, _commits, _valid_date), never from
web/law-data.json or web_data.py. Exits 1 when the corpus no longer matches what the story fixed."""
import argparse
import calendar
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

ARCHIVE_HOSTS = {"web.archive.org", "archive.org"}  # the `copy: archive` rule in tools/web_data.py
EXAMPLE_ID, EXAMPLE_PLACE, EXAMPLE_DATE = "eu-csrd-2022-2464", "EU", "2025-06-01"
# STORY-GEL-34-04, read 2026-11-17: date, 9-character prefix of the commit lookup shows (None: nothing in force)
CSRD_FIXED = [("2022-12-31", None), ("2023-01-05", "8960295fa"), ("2025-04-16", "8960295fa"),
              ("2025-04-17", "8d07f20cf"), ("2025-06-01", "8d07f20cf"), ("2026-03-17", "8d07f20cf"),
              ("2026-03-18", "d27225e8f"), ("2026-11-17", "d27225e8f")]
# the page's date rule also needs this shape; query._valid_date alone would accept some other shapes in Python
ISO_SHAPE = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}")


def die(message):
    print(f"expected.py: {message}", file=sys.stderr)
    sys.exit(1)


def page_valid(value):
    return ISO_SHAPE.fullmatch(value) is not None and query._valid_date(value)


def date_table():
    values = ["2025-02-30", "2025-13-45", "2025-04-31", "2100-02-29", "0000-01-01", "2025-6-1", "10000-01-01",
              "2024-02-29", "0001-01-01", "9999-12-31", "2025-06-01", "2025-06-01 ", ""]
    for year in (2023, 2024, 2100):
        for month in range(1, 13):
            last = calendar.monthrange(year, month)[1]
            values += [f"{year:04d}-{month:02d}-{day:02d}" for day in [last] + [d for d in (29, 30, 31, 32) if d > last]]
    return [{"value": v, "valid": page_valid(v)} for v in dict.fromkeys(values)]


def not_plain_reason(item):
    """The first reason the page answers this lookup item with the interim panel, or None for a plain answer."""
    if item is None:
        return "missing"
    if item.get("not_yet_applying"):
        return "not-yet-applying"
    if item.get("date_basis"):
        return "date-basis"
    if (urlparse(item.get("source_url") or "").hostname or "").lower() in ARCHIVE_HOSTS:
        return "archive-copy"
    if item["kind"] not in ("adopted", "consolidated", "translation"):
        return "other-kind"
    return None


def main():
    global query
    parser = argparse.ArgumentParser()
    parser.add_argument("--ref", required=True)
    parser.add_argument("--read-on", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--repo", default=str(Path(__file__).resolve().parents[2]))
    args = parser.parse_args()
    repo, ref = Path(args.repo).resolve(), args.ref
    sys.path.insert(0, str(repo / "tools"))
    import query
    if not query._valid_date(args.read_on):
        die(f"--read-on {args.read_on!r} is not a real calendar date")

    shared, _history = query.envelope(repo, ref)
    history_commit, status = shared["snapshot"]["history_commit"], shared["coverage"]["status"]

    cache = {}

    def at(place, date):
        """(items by id, ids waiting for their first version) from lookup for one place and date."""
        if (place, date) not in cache:
            found, not_yet, _first = query.lookup(place, date, repo, ref, detail=True)
            cache[(place, date)] = ({i["id"]: i for i in found}, {i["id"] for i in not_yet})
        return cache[(place, date)]

    # example
    answer = query.law_in_force(repo, EXAMPLE_PLACE, EXAMPLE_DATE, ref=ref)
    item = next((i for i in answer["in_force"] if i["id"] == EXAMPLE_ID), None)
    if item is None:
        die(f"{EXAMPLE_ID} is not in force in {EXAMPLE_PLACE} on {EXAMPLE_DATE}")
    example = {"id": EXAMPLE_ID, "date": EXAMPLE_DATE, "title": item["title"], "in_force": item["in_force"],
               "since": f"In force since {item['in_force']}", "kind": item["kind"], "language": item["language"],
               "law_family": item["law_family"], "verification": item["verification"],
               "source_url": item["source_url"], "commit": item["commit"],
               "sentence": f"{item['title']}, version in force on {EXAMPLE_DATE}: {item['kind']} version, "
                           f"in force since {item['in_force']}."}

    # the CSRD dates, compared with the story's fixed list
    csrd = []
    for date, prefix in CSRD_FIXED:
        shown = at(EXAMPLE_PLACE, date)[0].get(EXAMPLE_ID)
        commit = shown["commit"] if shown else None
        if (commit[:9] if commit else None) != prefix:
            die(f"CSRD on {date}: lookup gives {commit and commit[:9]}, the story fixed {prefix}")
        csrd.append({"date": date, "commit": commit})
    csrd_fixed = [{"date": d, "commit_prefix": p} for d, p in CSRD_FIXED]

    # shared-date pairs
    groups = defaultdict(list)
    for c in query._commits(repo, ref):
        if c["kind"] != "repeal":
            groups[(c["id"], c["in_force"])].append(c)
    pairs, reasons = [], Counter()
    for (instrument, date), rows in groups.items():
        if len(rows) < 2:
            continue
        place = rows[0]["jurisdiction"]
        if {r["jurisdiction"] for r in rows} != {place}:
            die(f"{instrument} on {date}: rows in more than one place")
        shown = at(place, date)[0].get(instrument)
        reason = not_plain_reason(shown)
        reasons[reason] += 1
        pairs.append({"id": instrument, "place": place, "date": date, "commit": shown["commit"] if shown else None,
                      "kind": shown["kind"] if shown else None, "language": shown.get("language") if shown else None,
                      "plain": reason is None})
    pairs.sort(key=lambda p: (p["place"], p["id"], p["date"]))
    plain = reasons.pop(None, 0)
    counts = {"pairs": len(pairs), "plain": plain, "interim": len(pairs) - plain,
              "instruments": len({p["id"] for p in pairs}), "places": len({p["place"] for p in pairs})}

    # the four interim cases, each checked against the query layer
    stored = defaultdict(list)
    for c in query._commits(repo, ref):
        stored[c["id"]].append(c)
    esrs = at("EU", "2023-12-25")[0].get("eu-esrs-2023-2772")
    link = query.law_in_force(repo, "AE", "2026-11-17", ref=ref)
    gn = "gn-arrete-2022-1646-evaluations-environnementales"
    checks = [
        ("before first version", EXAMPLE_ID not in at("EU", "2022-12-31")[0] and EXAMPLE_ID in at("EU", "2022-12-31")[1]),
        ("repealed", gn not in at("GN", "2023-05-05")[0]
         and any(c["kind"] == "repeal" and c["in_force"] <= "2023-05-05" for c in stored[gn])),
        ("link only", "ae-dl-11-2024-climate" not in stored
         and any(e["id"] == "ae-dl-11-2024-climate" for e in link["link_only"])
         and not any(i["id"] == "ae-dl-11-2024-climate" for i in link["in_force"])),
        ("not yet applying", bool(esrs and esrs.get("not_yet_applying"))),
    ]
    for label, ok in checks:
        if not ok:
            die(f"interim case {label!r} is not what its label says in this corpus")
    interim_cases = [
        {"id": EXAMPLE_ID, "date": "2022-12-31", "label": "before first version",
         "why": "The first stored version of the law is 2023-01-05, so nothing is in force on this date."},
        {"id": gn, "date": "2023-05-05", "label": "repealed",
         "why": "A repeal row takes effect on this date, so lookup lists no version."},
        {"id": "ae-dl-11-2024-climate", "date": "2026-11-17", "label": "link only",
         "why": "The law is in the register with an official link and no stored text."},
        {"id": "eu-esrs-2023-2772", "date": "2023-12-25", "label": "not yet applying",
         "why": "The version is in force, but its duties apply from a later date (applies_from)."},
    ]

    table = date_table()
    out = {"ref": ref, "history_commit": history_commit, "snapshot9": history_commit[:9], "coverage_status": status,
           "read_on": args.read_on, "notice": shared["notice"],
           "snapshot_line": f"Snapshot {history_commit[:9]}, {status}",
           "example": example, "csrd": csrd, "csrd_fixed": csrd_fixed, "pairs": pairs, "pair_counts": counts,
           "interim_cases": interim_cases, "date_table": table}
    path = Path(args.out).expanduser()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")
    print("not plain: " + (" ".join(f"{k}={v}" for k, v in sorted(reasons.items())) or "none"))
    print(f"expected: pairs={counts['pairs']} plain={counts['plain']} interim={counts['interim']} "
          f"instruments={counts['instruments']} places={counts['places']} csrd={len(csrd)} date_table={len(table)}")


if __name__ == "__main__":
    main()
