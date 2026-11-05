#!/usr/bin/env python3
"""Pre-publication checklist: print every source row and scope entry, exit 1 on any refusal."""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def gate(repo=ROOT, iso2=None):
    """Return (report lines, refusal lines). With iso2, cover only that place's scope entries and their source rows."""
    repo = Path(repo).resolve()
    rows = {r["id"]: r for r in json.loads((repo / "sources.json").read_text(encoding="utf-8"))}
    out, bad = [], []
    scopes = sorted((repo / "register").glob(f"{iso2 or '*'}/scope.json"))
    used = None
    if iso2:
        used = set()
        for scope_path in scopes:
            for e in json.loads(scope_path.read_text(encoding="utf-8")):
                src = e.get("source_row")
                used.update(src if isinstance(src, list) else [src])
    for r in rows.values():
        if used is None or r["id"] in used:
            out.append(f"source {r['id']}: {r.get('verdict')}")
    for scope_path in scopes:
        iso2 = scope_path.parent.name
        for e in json.loads(scope_path.read_text(encoding="utf-8")):
            folder = repo / "records" / iso2 / e["id"]
            n = len(list(folder.glob("*.json"))) if folder.is_dir() else 0
            out.append(f"scope {iso2}/{e['id']}: {e.get('status')}, {n} records")
            status, name = e.get("status"), f"{iso2}/{e['id']}"
            if status == "pending":
                bad.append(f"{name}: status is pending")
            elif status == "stored":
                if n == 0:
                    bad.append(f"{name}: stored but has no record")
                src = e.get("source_row")
                for sid in src if isinstance(src, list) else [src]:
                    verdict = rows.get(sid, {}).get("verdict")
                    if verdict != "pass":
                        bad.append(f"{name}: source {sid} verdict is {verdict!r}, not 'pass'")
            elif status == "link only" and n:
                bad.append(f"{name}: link only but has {n} records")
    return out, bad


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", nargs="?", default=ROOT)
    parser.add_argument("--iso2", help="gate only this place's scope entries")
    args = parser.parse_args()
    report, refusals = gate(args.repo, iso2=args.iso2)
    print("\n".join(report))
    for line in refusals:
        print("REFUSED " + line, file=sys.stderr)
    raise SystemExit(1 if refusals else 0)
