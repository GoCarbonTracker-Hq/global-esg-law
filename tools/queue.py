#!/usr/bin/env python3
"""Review queue: list the open rows of upkeep/queue.csv, or record one person's decision on one row.

Listing puts beside each row the licence verdict of its source row, the register entry it touches
(with that entry's current in_force date) and the evidence URL. A decision fills reviewer, outcome
and outcome_on; a reject of a new_version or terms_changed row also records the signal in
upkeep/seen.json so the watcher does not flag it again. Writes only under upkeep/.
"""
import argparse
import csv
import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from watch import CHANGES, COLUMNS  # noqa: E402 - same column list as the watcher

ROOT = Path(__file__).resolve().parents[1]
OUTCOMES = ("confirm", "reject", "needs_evidence")
OPEN = ("", "needs_evidence")  # a needs_evidence row stays in the list until confirmed or rejected


class QueueError(Exception):
    """A decision that cannot be recorded: unknown row, row already decided, unreadable queue."""


def read_queue(repo):
    """Return the rows of upkeep/queue.csv; refuse a file whose header is not the watcher's columns."""
    path = Path(repo) / "upkeep" / "queue.csv"
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
    if rows and reader.fieldnames != COLUMNS:
        raise QueueError(f"{path}: columns are {reader.fieldnames}, expected {COLUMNS}")
    return rows


def write_queue(repo, rows):
    """Rewrite upkeep/queue.csv in place with the same columns and CRLF line ends."""
    path = Path(repo) / "upkeep" / "queue.csv"
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS, lineterminator="\r\n")
        writer.writeheader()
        writer.writerows(rows)


def is_open(row):
    return (row.get("outcome") or "").strip() in OPEN


def context(repo, row):
    """Return (licence verdict, register text) for one row, reading sources.json and scope.json."""
    repo = Path(repo)
    sources = {r["id"]: r for r in json.loads((repo / "sources.json").read_text(encoding="utf-8"))}
    verdict = sources.get(row["source_id"], {}).get("verdict", "not in sources.json")
    if row["instrument"] == "*":
        return verdict, f"{row['iso2']} source-level"
    scope_path = repo / "register" / row["iso2"] / "scope.json"
    scope = json.loads(scope_path.read_text(encoding="utf-8")) if scope_path.exists() else []
    entry = next((e for e in scope if e.get("id") == row["instrument"]), None)
    if entry is None:
        return verdict, f"{row['iso2']} {row['instrument']} not in register/{row['iso2']}/scope.json"
    return verdict, f"{row['iso2']} {row['instrument']} in_force {entry.get('in_force') or 'not set'}"


def describe(repo, row):
    """One line for one row: key, change, licence verdict, register entry, evidence URL, notes."""
    verdict, register = context(repo, row)
    state = f" ({row['outcome']})" if row.get("outcome") else ""
    parts = [f"{row['detected_on']} {row['watcher_id']}:{row['signal']} {row['change']}{state}",
             f"licence {row['source_id']}: {verdict}", register, row["evidence_url"]]
    if row.get("notes"):
        parts.append(row["notes"])
    return " | ".join(parts)


def list_open(repo=ROOT):
    """Return the lines to print: one per open row, then a count."""
    rows = [r for r in read_queue(repo) if is_open(r)]
    return [describe(repo, r) for r in rows] + [f"{len(rows)} open rows"]


def decide(repo, outcome, key, reviewer, today=None, notes=None):
    """Record outcome on the first open row whose watcher_id:signal is key. Return that row.

    notes, when given, goes into the row's notes column after any text already there, joined with '; '.
    """
    repo = Path(repo).resolve()
    if outcome not in OUTCOMES:
        raise QueueError(f"outcome {outcome!r} is not one of {OUTCOMES}")
    if not reviewer or not reviewer.strip():
        raise QueueError("reviewer is empty")
    watcher_id, sep, signal = key.partition(":")
    if not sep:
        raise QueueError(f"row {key!r} is not watcher_id:signal")
    today = (today or date.today()).isoformat() if not isinstance(today, str) else today
    rows = read_queue(repo)
    matches = [r for r in rows if r["watcher_id"] == watcher_id and r["signal"] == signal]
    if not matches:
        raise QueueError(f"row {key!r} is not in upkeep/queue.csv")
    row = next((r for r in matches if is_open(r)), None)
    if row is None:
        done = matches[0]
        raise QueueError(f"row {key!r} already decided: {done['outcome']} by {done['reviewer']} on {done['outcome_on']}")
    row["reviewer"], row["outcome"], row["outcome_on"] = reviewer.strip(), outcome, today
    if notes:
        row["notes"] = "; ".join(t for t in (row["notes"], notes) if t)
    write_queue(repo, rows)
    if outcome == "reject" and row["change"] in CHANGES:
        seen_path = repo / "upkeep" / "seen.json"
        seen = json.loads(seen_path.read_text(encoding="utf-8")) if seen_path.exists() else {}
        entry = seen.get(watcher_id, {"signals": None, "failure": None})
        signals = list(entry.get("signals") or [])
        if signal not in signals:
            entry = {**entry, "signals": sorted(signals + [signal])}
            seen[watcher_id] = entry
            seen_path.write_text(json.dumps(seen, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    return row


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--outcome", choices=OUTCOMES, help="record this decision (needs --row and --reviewer)")
    parser.add_argument("--row", metavar="WATCHER_ID:SIGNAL", help="the queue row to decide")
    parser.add_argument("--reviewer", help="who decided")
    parser.add_argument("--notes", help="text for the row's notes column; appended after any existing notes")
    parser.add_argument("--repo", default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    if args.outcome and not (args.row and args.reviewer):
        parser.error("--outcome needs --row and --reviewer")
    if not args.outcome and (args.row or args.reviewer or args.notes):
        parser.error("--row, --reviewer and --notes need --outcome")
    try:
        if args.outcome:
            row = decide(args.repo, args.outcome, args.row, args.reviewer, notes=args.notes)
            print(f"{row['watcher_id']}:{row['signal']} {row['outcome']} by {row['reviewer']} on {row['outcome_on']}")
        else:
            print("\n".join(list_open(args.repo)))
    except (QueueError, OSError, json.JSONDecodeError, KeyError) as exc:
        print(exc, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
