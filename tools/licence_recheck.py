#!/usr/bin/env python3
"""Reopen a licence row after its terms page changed. Stdlib only.

    python3 tools/licence_recheck.py --row <watcher_id>:<signal>

Takes a `terms_changed` row from upkeep/queue.csv (the watcher id and the new hash), sets that
watcher's source row in sources/licence-table.csv to verdict `unknown` with checked_on today,
regenerates sources.json, and prints what that costs: the instruments whose scope entry names the
row (they drop to link only, because tools/check_corpus.py treats anything but `pass` as fail) and
the record folders under records/ that hold text fetched under the row. Nothing is deleted; a
person rereads the terms, sets the verdict by hand, and decides about the records separately.
"""
import argparse
import csv
import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_sources import COLUMNS, build  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]


def parse_row(value):
    """Split `<watcher_id>:<signal>`; the signal may itself contain colons."""
    watcher_id, sep, signal = value.partition(":")
    if not sep or not watcher_id.strip() or not signal.strip():
        raise ValueError(f"--row must be <watcher_id>:<signal>, got {value!r}")
    return watcher_id.strip(), signal.strip()


def find_watcher(repo, watcher_id):
    watchers = json.loads((repo / "upkeep" / "watchers.json").read_text(encoding="utf-8"))
    watcher = next((w for w in watchers if w.get("id") == watcher_id), None)
    if watcher is None:
        raise ValueError(f"no watcher {watcher_id!r} in upkeep/watchers.json")
    if watcher.get("change") != "terms_changed":
        raise ValueError(f"watcher {watcher_id!r} is not a terms_changed watcher "
                         f"(change is {watcher.get('change', 'new_version')!r})")
    return watcher


def instruments_of(repo, source_id):
    """(iso2, instrument id) for every scope entry whose source_row names the source."""
    found = []
    for scope_path in sorted((repo / "register").glob("*/scope.json")):
        for entry in json.loads(scope_path.read_text(encoding="utf-8")):
            allowed = entry.get("source_row")
            if source_id in (allowed if isinstance(allowed, list) else [allowed]):
                found.append((scope_path.parent.name, entry.get("id")))
    return found


def record_folders_of(repo, source_id):
    """Folders under records/ holding at least one record fetched under the source."""
    folders = set()
    for path in (repo / "records").rglob("*.json") if (repo / "records").exists() else []:
        if json.loads(path.read_text(encoding="utf-8")).get("source_id") == source_id:
            folders.add(path.parent.relative_to(repo).as_posix())
    return sorted(folders)


def recheck(repo=ROOT, watcher_id=None, signal=None, today=None):
    """Flip the watcher's source row to `unknown`. Return a summary dict; raise ValueError on bad input."""
    repo = Path(repo).resolve()
    today = (today or date.today()).isoformat() if not isinstance(today, str) else today
    watcher = find_watcher(repo, watcher_id)
    source_id = watcher["source_id"]
    csv_path = repo / "sources" / "licence-table.csv"
    with csv_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != COLUMNS:
            raise ValueError(f"{csv_path.relative_to(repo).as_posix()}: columns must be exactly: {','.join(COLUMNS)}")
        rows = list(reader)
    row = next((r for r in rows if r["id"] == source_id), None)
    if row is None:
        raise ValueError(f"watcher {watcher_id!r} names source {source_id!r}, which is not in the licence table")
    previous = row["verdict"]
    row["verdict"] = "unknown"
    row["checked_on"] = today
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS, lineterminator="\r\n")
        writer.writeheader()
        writer.writerows(rows)
    build(csv_path, repo / "sources.json")
    return {"source_id": source_id, "watcher_id": watcher_id, "signal": signal, "previous_verdict": previous,
            "terms_url": row["terms_url"], "checked_on": today,
            "instruments": instruments_of(repo, source_id), "record_folders": record_folders_of(repo, source_id)}


def report(summary):
    lines = [f"{summary['source_id']}: verdict {summary['previous_verdict']!r} -> 'unknown', "
             f"checked_on {summary['checked_on']} (watcher {summary['watcher_id']}, new hash {summary['signal']})",
             f"reread the terms at {summary['terms_url']} and set the verdict by hand",
             f"instruments now link only ({len(summary['instruments'])}):"]
    lines += [f"  {iso2}/{instrument}" for iso2, instrument in summary["instruments"]] or ["  none"]
    lines.append(f"record folders holding text under this row ({len(summary['record_folders'])}), nothing deleted:")
    lines += [f"  {folder}" for folder in summary["record_folders"]] or ["  none"]
    return "\n".join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--row", required=True, help="<watcher_id>:<signal> from a terms_changed row in upkeep/queue.csv")
    parser.add_argument("--repo", default=ROOT, help=argparse.SUPPRESS)
    parser.add_argument("--today", default=None, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    try:
        watcher_id, signal = parse_row(args.row)
        summary = recheck(args.repo, watcher_id, signal, args.today)
    except (ValueError, OSError, json.JSONDecodeError, KeyError) as exc:
        print(exc, file=sys.stderr)
        return 1
    print(report(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
