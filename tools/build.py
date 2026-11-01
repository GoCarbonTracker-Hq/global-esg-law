#!/usr/bin/env python3
"""Build dated instrument commits from admitted source rows and JSON records."""
import json
import os
import subprocess
import sys
from datetime import date, datetime, time, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def git(repo, *args, env=None):
    return subprocess.run(["git", "-C", str(repo), *args], check=True, text=True,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env).stdout.strip()


def build(repo=ROOT):
    repo = Path(repo).resolve()
    rows = {r["id"]: r for r in json.loads((repo / "sources.json").read_text())}
    records = []
    for path in sorted((repo / "records").rglob("*.json")):
        record = json.loads(path.read_text())
        row_id = record["source_id"]
        row = rows[row_id]
        if row.get("verdict") != "pass":
            raise ValueError(f"{row_id}: source verdict is {row.get('verdict')!r}, not 'pass'")
        effective = date.fromisoformat(record["in_force"])
        iso2, instrument_id = path.relative_to(repo / "records").parts[:2]
        scope = json.loads((repo / "register" / iso2 / "scope.json").read_text())
        entry = next((e for e in scope if e["id"] == instrument_id), None)
        if entry is None:
            raise ValueError(f"{path}: no instrument {instrument_id!r} in register/{iso2}/scope.json")
        row = {**row, "trailer_instrument": entry["title"], "trailer_source_url": entry["official_url"]}
        records.append((effective, row_id, path, record, row))
    records.sort(key=lambda item: (item[0], item[4]["trailer_instrument"], item[1], item[2].as_posix()))
    for effective, row_id, path, record, row in records:
        env = os.environ.copy()
        timestamp = datetime.combine(max(effective, date(1970, 1, 1)), time(12), timezone.utc).strftime("%Y-%m-%dT%H:%M:%S +0000")
        env.update(GIT_AUTHOR_DATE=timestamp, GIT_COMMITTER_DATE=timestamp)
        git(repo, "add", "--", str(path.relative_to(repo)), env=env)
        message = (record.get("message") or f"{row['trailer_instrument']} effective {effective}") + "\n\n"
        message += (f"Instrument: {row['trailer_instrument']}\nSource-url: {row['trailer_source_url']}\n"
                    f"In-force: {effective}\nKind: {record['kind']}\nLicence: {row['trailer_licence']}")
        git(repo, "-c", "user.name=Global ESG Law Builder", "-c",
            "user.email=builder@global-esg-law.invalid", "commit", "--allow-empty", "-m", message, env=env)
    return [(str(d), r["trailer_instrument"]) for d, _, _, _, r in records]


if __name__ == "__main__":
    try:
        build()
    except (KeyError, ValueError, OSError, subprocess.CalledProcessError) as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1)
