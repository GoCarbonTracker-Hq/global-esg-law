#!/usr/bin/env python3
"""Expected citation lines for the copy-citation check (STORY-GEL-34-08).

python3.13 tests/web/cite_expected.py --ref origin/history --read-on 2026-11-17 --out PATH [--repo PATH]

Every line is built from one tools/query.py lookup item (lookup, envelope, _scope, _commits), never from
web/law-data.json, web_data.py output or any web/ file. Exits 1 when the corpus no longer matches what the story fixed."""
import argparse
import json
import sys
from pathlib import Path

# STORY-GEL-34-08 and the brief, read 2026-11-17: the two fixed lines, written out, not taken from line()
CSRD_FIXED = ("Directive (EU) 2022/2464 as regards corporate sustainability reporting (CSRD); "
              "in force on 2025-06-01, consolidated version since 2025-04-17; "
              "global-esg-law, corpus read 2026-11-17 (snapshot 55c8c2a9c); "
              "https://eur-lex.europa.eu/eli/dir/2022/2464/oj")
DZ_FIXED = ("Loi n° 91-25 du 18 décembre 1991 portant loi de finances pour 1992 "
            "(Art. 117: taxe sur les activités polluantes ou dangereuses pour l'environnement, as later amended); "
            "in force on 2025-06-01, adopted version, in-force date not recorded (published 1991-12-18); "
            "global-esg-law, corpus read 2026-11-17 (snapshot 55c8c2a9c); "
            "https://www.joradp.dz/FTP/jo-francais/1991/F1991065.pdf")
DATE_BASIS_ROWS = 11
LONGEST_ID, LONGEST_PLACE, LONGEST_LENGTH = "kr-carbon-neutrality-act-decree", "KR", 257


def die(message):
    print(f"cite_expected.py: {message}", file=sys.stderr)
    sys.exit(1)


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
    snapshot9 = history_commit[:9]

    cache = {}

    def item_for(instrument, place, date):
        """The lookup item for one id, place and date, or None."""
        if (place, date) not in cache:
            found, _not_yet, _first = query.lookup(place, date, repo, ref, detail=True)
            cache[(place, date)] = {i["id"]: i for i in found}
        return cache[(place, date)].get(instrument)

    def line(item, date):
        kind = item["kind"]
        if kind not in ("adopted", "consolidated", "translation"):
            die(f"{item['id']} on {date}: kind {kind!r} has no citation wording")
        phrase = "translation" if kind == "translation" else f"{kind} version"
        if item.get("date_basis"):
            version = f"{phrase}, in-force date not recorded (published {item['in_force']})"
        else:
            version = f"{phrase} since {item['in_force']}"
        return (f"{item['title']}; in force on {date}, {version}; "
                f"global-esg-law, corpus read {args.read_on} (snapshot {snapshot9}); {item['source_url']}")

    cases, seen = [], set()

    def add(label, instrument, place, date):
        item = item_for(instrument, place, date)
        if item is None:
            die(f"{label}: lookup({place}, {date}) has no item for {instrument}")
        seen.add((instrument, date))
        cases.append({"label": label, "id": instrument, "place": place, "date": date, "commit": item["commit"],
                      "kind": item["kind"], "date_basis": item.get("date_basis"), "line": line(item, date)})
        return item

    add("csrd", "eu-csrd-2022-2464", "EU", "2025-06-01")
    add("dz", "dz-lf-1992-art117", "DZ", "2025-06-01")
    for case, fixed in zip(cases, (CSRD_FIXED, DZ_FIXED)):
        if case["line"] != fixed:
            die(f"{case['label']}: line differs from the story's fixed string\n  got:   {case['line']}\n  fixed: {fixed}")

    # the history rows that carry date_basis
    rows = sorted((c for c in query._commits(repo, ref) if c.get("date_basis")),
                  key=lambda c: (c["jurisdiction"], c["id"], c["in_force"]))
    if len(rows) != DATE_BASIS_ROWS or {c["date_basis"] for c in rows} != {"publication"}:
        die(f"{len(rows)} history rows carry date_basis {sorted({c['date_basis'] for c in rows})}; "
            f"the story fixed {DATE_BASIS_ROWS} with 'publication'")
    for n, row in enumerate(rows, 1):
        if (row["id"], row["in_force"]) not in seen:
            add(f"publication-{n}", row["id"], row["jurisdiction"], row["in_force"])

    # A translation row shares its in-force date with the adopted or consolidated row and lookup prefers that one,
    # so on this snapshot lookup may never show a translation (read 2026-11-18: 116 rows, 0 shown). Count them.
    translation_rows = sorted((c for c in query._commits(repo, ref) if c["kind"] == "translation" and not c.get("date_basis")),
                              key=lambda c: (c["jurisdiction"], c["id"], c["in_force"]))
    shown = 0
    for row in translation_rows:
        item = item_for(row["id"], row["jurisdiction"], row["in_force"])
        if item is not None and item["kind"] == "translation":
            shown += 1
            if shown == 1:
                add("translation", row["id"], row["jurisdiction"], row["in_force"])

    # the longest address
    latest = max(c["in_force"] for c in query._commits(repo, ref) if c["id"] == LONGEST_ID and c["kind"] != "repeal")
    longest = add("longest", LONGEST_ID, LONGEST_PLACE, latest)
    length = len(longest["source_url"])
    if length != LONGEST_LENGTH:
        die(f"{LONGEST_ID} source_url has {length} characters, the story fixed {LONGEST_LENGTH}")

    esrs = add("not-yet-applying", "eu-esrs-2023-2772", "EU", "2023-12-25")
    if not esrs.get("not_yet_applying"):
        die("eu-esrs-2023-2772 on 2023-12-25 is not marked not_yet_applying")

    link_only = sorted(entry["id"] for path in (repo / "register").glob("*/scope.json")
                       for entry in query._scope(repo, path.parent.name).values() if entry.get("status") == "link only")

    out = {"ref": ref, "history_commit": history_commit, "snapshot9": snapshot9, "coverage_status": status,
           "read_on": args.read_on, "fixed": {"csrd": CSRD_FIXED, "dz": DZ_FIXED}, "cases": cases,
           "translation": {"rows": len(translation_rows), "shown_by_lookup": shown},
           "link_only_ids": link_only, "link_only_count": len(link_only),
           "longest": {"id": LONGEST_ID, "date": latest, "source_url_length": length}}
    path = Path(args.out).expanduser()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"cite_expected: cases={len(cases)} link_only={len(link_only)} snapshot={snapshot9}")


if __name__ == "__main__":
    main()
