#!/usr/bin/env python3
"""Write the data file for the lookup page: python3 tools/web_data.py --ref REF --out PATH [--repo PATH] [--read-on YYYY-MM-DD]

Every rule comes from tools/query.py. This file only gathers the results and writes them in a fixed order."""
import argparse
import json
import subprocess
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
import query

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_HOSTS = {"web.archive.org", "archive.org"}
# version fields copied from a history row when the row has them
VERSION_KEYS = ("in_force", "kind", "language", "source_url", "licence", "commit", "date_basis", "re_enactment")
# scope fields copied to the entry when the scope entry has them
SCOPE_KEYS = ("status_note", "amends_ids", "aliases", "applies_from", "applies_note")


def _version(repo, row):
    item = {k: row[k] for k in VERSION_KEYS if row.get(k)}
    host = (urlparse(row.get("source_url") or "").hostname or "").lower()
    if host in ARCHIVE_HOSTS:
        item["copy"] = "archive"
    if row["kind"] == "repeal":
        record = query._load_record(repo, row["commit"])
        if record and record.get("message"):
            item["message"] = record["message"]
    return item


def _intervals(repo, ref, iso2, entries):
    """Set `intervals` on each entry of one place that has version rows.

    The state at each change date comes from query.lookup, so the date rules stay in query.py."""
    stored = [e for e in entries if e["versions"]]
    if not stored:
        return
    dates = {v["in_force"] for e in stored for v in e["versions"]} | {e["applies_from"] for e in stored if e.get("applies_from")}
    bad = sorted(d for d in dates if not query._valid_date(d))
    if bad:
        raise ValueError(f"place {iso2}: change dates that are not calendar dates: {bad[:5]}")
    for e in stored:
        e["intervals"] = []
    for on in sorted(dates):
        found, not_yet, _first = query.lookup(iso2, on, repo, ref)
        found = {i["id"]: i for i in found}
        waiting = {i["id"] for i in not_yet}
        for e in stored:
            if e["id"] in found:
                item = found[e["id"]]
                interval = {"from": on, "state": "in_force", "commit": item["commit"]}
                if item.get("not_yet_applying"):
                    interval["not_yet_applying"] = True
            else:
                # lookup gives no commit for a repeal; take the latest repeal row on or before the date,
                # first in the entry's sorted rows when two share the day (the fi and sv case)
                repeals = [v for v in e["versions"] if v["kind"] == "repeal" and v["in_force"] <= on]
                if not repeals:
                    if e["id"] not in waiting:
                        raise ValueError(f"{e['id']} on {on}: not in force, not waiting and not repealed")
                    continue  # leading "not yet in force": the page reads it as no interval
                last = max(v["in_force"] for v in repeals)
                interval = {"from": on, "state": "repealed",
                            "commit": next(v["commit"] for v in repeals if v["in_force"] == last)}
            if not e["intervals"] or {k: v for k, v in e["intervals"][-1].items() if k != "from"} != \
                    {k: v for k, v in interval.items() if k != "from"}:
                e["intervals"].append(interval)


def build(repo, ref, read_on=None):
    repo = Path(repo).resolve()
    read_on = read_on or date.today().isoformat()
    if not query._valid_date(read_on):
        raise ValueError(f"malformed read-on date {read_on!r}: use a real calendar date as YYYY-MM-DD")
    shared, history = query.envelope(repo, ref)
    places = {row[0]: row[1] for row in query.list_places(repo, ref)["rows"]}
    tiers = query._register_tiers(repo)
    by_id = {}
    for row in history:
        by_id.setdefault(row.get("id"), []).append(row)
    entries, seen = [], set()
    for path in sorted((repo / "register").glob("*/scope.json")):
        iso2 = path.parent.name
        for entry in query._scope(repo, iso2).values():
            if entry["id"] in seen:
                raise ValueError(f"id {entry['id']!r} appears in more than one scope file")
            seen.add(entry["id"])
            rows = sorted(by_id.get(entry["id"], []),
                          key=lambda r: (r["in_force"], r["kind"], r.get("language") or "", r["commit"]))
            link_only = entry.get("status") == "link only"
            item = {"id": entry["id"], "place": iso2, "title": entry.get("title", ""),
                    "citation": entry.get("citation"), "status": entry.get("status"),
                    **query._labels(iso2, entry, tiers),
                    "versions": [_version(repo, r) for r in rows]}
            item.update({k: entry[k] for k in SCOPE_KEYS if entry.get(k)})
            if link_only and entry.get("in_force"):
                item["register_date"] = entry["in_force"]
            entries.append(item)
    stray = sorted(set(by_id) - seen)
    if stray:
        raise ValueError(f"history rows with ids absent from every scope file: {stray[:5]}")
    entries.sort(key=lambda e: (e["place"], e["id"]))
    for iso2 in sorted({e["place"] for e in entries}):
        _intervals(repo, ref, iso2, [e for e in entries if e["place"] == iso2])
    return {"snapshot": {**shared["snapshot"], "read_on": read_on},
            "coverage": shared["coverage"], "notice": shared["notice"],
            "places": places, "entries": entries}


def dumps(data):
    return json.dumps(data, sort_keys=True, ensure_ascii=False, separators=(",", ":")) + "\n"


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--ref", required=True, help="history ref to read, such as origin/history (no default)")
    ap.add_argument("--out", required=True, help="path of the file to write")
    ap.add_argument("--repo", default=str(ROOT))
    ap.add_argument("--read-on", help="date the corpus was read, YYYY-MM-DD (default: today)")
    args = ap.parse_args(argv)
    try:
        data = build(args.repo, args.ref, args.read_on)
    except (ValueError, subprocess.CalledProcessError) as exc:
        print(getattr(exc, "stderr", None) and exc.stderr.strip() or exc, file=sys.stderr)
        return 1
    Path(args.out).write_text(dumps(data), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
