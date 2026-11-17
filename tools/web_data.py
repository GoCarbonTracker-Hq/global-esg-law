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
