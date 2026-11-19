#!/usr/bin/env python3
"""Pre-publication checklist: print every source row and scope entry, exit 1 on any refusal."""
import argparse
import json
import sys
from pathlib import Path

from check_corpus import real_date, require_place
from make_sources import load_sources

ROOT = Path(__file__).resolve().parents[1]


def gate(repo=ROOT, iso2=None):
    """Return (report lines, refusal lines). With iso2, cover only that place's scope entries and their source rows."""
    repo = Path(repo).resolve()
    if iso2 is not None:
        require_place(repo, iso2)
    rows = load_sources(repo / "sources.json")
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
    scoped = set()
    for scope_path in scopes:
        place = scope_path.parent.name
        for e in json.loads(scope_path.read_text(encoding="utf-8")):
            scoped.add((place, e["id"]))
            folder = repo / "records" / place / e["id"]
            files = list(folder.glob("*.json")) if folder.is_dir() else []
            records = [(path, json.loads(path.read_text(encoding="utf-8"))) for path in files]
            n = len(records)
            out.append(f"scope {place}/{e['id']}: {e.get('status')}, {n} records")
            status, name = e.get("status"), f"{place}/{e['id']}"
            repeal_dates = [record.get("in_force") or path.name[:10]
                            for path, record in records if record.get("repealed") is True]
            for path, record in records:
                effective = record.get("in_force") or path.name[:10]
                if not real_date(effective):
                    bad.append(f"{name}: record {path.name} in_force {effective!r} is not a real date as YYYY-MM-DD")
                    continue
                if record.get("repealed") is not True and any(effective >= day for day in repeal_dates) \
                        and record.get("re_enactment") is not True:
                    bad.append(f"{name}: record {path.name} is dated on or after repeal; flag it re_enactment to allow it")
            if status == "pending":
                bad.append(f"{name}: status is pending")
            elif status == "stored":
                if n == 0:
                    bad.append(f"{name}: stored but has no record")
                src = e.get("source_row")
                allowed = src if isinstance(src, list) else [src]
                for sid in allowed:
                    verdict = rows.get(sid, {}).get("verdict")
                    if verdict != "pass":
                        bad.append(f"{name}: source {sid} verdict is {verdict!r}, not 'pass'")
                for path, record in records:
                    sid = record.get("source_id")
                    if sid not in allowed:
                        bad.append(f"{name}: record {path.name} source_id {sid!r} is not in scope source_row {src!r}")
                    verdict = rows.get(sid, {}).get("verdict")
                    if verdict != "pass":
                        bad.append(f"{name}: record {path.name} source {sid!r} verdict is {verdict!r}, not 'pass'")
            elif status == "link only":
                if n:
                    bad.append(f"{name}: link only but has {n} records")
            else:
                bad.append(f"{name}: status {status!r} is not stored, link only or pending")
    orphans = set()
    for path in sorted((repo / "records" / (iso2 or "")).rglob("*.json")):
        parts = path.relative_to(repo / "records").parts
        if len(parts) != 3:
            bad.append(f"records/{'/'.join(parts)}: not at records/<ISO2>/<instrument>/<file>.json")
        elif parts[:2] not in scoped:
            orphans.add(parts[:2])
    for place, instrument in sorted(orphans):
        bad.append(f"records/{place}/{instrument}: records on disk but no instrument {instrument!r} in register/{place}/scope.json")
    return out, bad


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", nargs="?", default=ROOT)
    parser.add_argument("--iso2", help="gate only this place's scope entries")
    args = parser.parse_args()
    try:
        report, refusals = gate(args.repo, iso2=args.iso2)
    except ValueError as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1)
    print("\n".join(report))
    for line in refusals:
        print("REFUSED " + line, file=sys.stderr)
    raise SystemExit(1 if refusals else 0)
