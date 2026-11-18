#!/usr/bin/env python3
"""Expected "Amended by" groups for the page check (STORY-GEL-34-13).

python3.13 tests/web/amended_expected.py --ref origin/history --read-on 2026-11-17 --out PATH [--repo PATH]

Write PATH beside expected.json; tests/web/checks/13-amended.mjs reads it from there.

The pairs come straight from register/*/scope.json (json only, no query code). Where each amender stands on a date comes from
one tools/query.py lookup (its place and the date), never from web/law-data.json, web_data.py output or any web/ file.
Exits 1 when the corpus no longer matches the cases the story fixed."""
import argparse
import json
import sys
from collections import Counter
from pathlib import Path

# every target is read on each of these dates: the story's dates, which also cover each interval of the real amenders
DATES = ["2016-06-01", "2018-01-01", "2021-01-01", "2024-01-01", "2025-04-16", "2025-06-01", "2025-09-01", "2026-11-17"]
CSRD, ZOR = "eu-csrd-2022-2464", "hr-zor-2015"
A794, A470 = "eu-omnibus-stop-the-clock-2025-794", "eu-omnibus-content-2026-470"
ZOR_NEWEST_FIRST = [f"hr-zor-2015-izm-{n}" for n in ("82-23", "42-20", "116-18", "120-16")]
# STORY-GEL-34-13 context, read 2026-11-17 and 2026-11-18: (target, date) -> {group: [amender ids in order]}; a group not named is empty
STORY = {
    (CSRD, "2025-04-16"): {"not-yet": [A470, A794]},
    (CSRD, "2025-06-01"): {"in-force": [A794], "not-yet": [A470]},
    (CSRD, "2026-11-17"): {"in-force": [A470, A794]},
    (ZOR, "2016-06-01"): {"not-yet": ZOR_NEWEST_FIRST},
    (ZOR, "2018-01-01"): {"in-force": ["hr-zor-2015-izm-120-16"], "not-yet": ZOR_NEWEST_FIRST[:3]},
    (ZOR, "2021-01-01"): {"in-force": ZOR_NEWEST_FIRST[1:], "not-yet": ["hr-zor-2015-izm-82-23"]},
    (ZOR, "2024-01-01"): {"in-force": ZOR_NEWEST_FIRST},
    (ZOR, "2025-06-01"): {},
    ("pl-csrd-act-2024", "2025-06-01"): {"not-yet": ["pl-csrd-act-2025"]},
    ("pl-csrd-act-2024", "2025-09-01"): {"in-force": ["pl-csrd-act-2025"]},
    ("cy-ets-law-2011", "2026-11-17"): {"link-only": ["cy-ets-amendment-2-2025", "cy-ets-amendment-2025", "cy-ets-amendment-2024"]},
    ("af-air-pollution-regulation", "2026-11-17"): {"link-only": ["af-air-pollution-regulation-amendment"]},
}
STORY_NO_AMENDER = "de-lksg"  # stored, named by no entry: the page says so in one sentence


def die(message):
    print(f"amended_expected.py: {message}", file=sys.stderr)
    sys.exit(1)


def read_scope(repo):
    """{entry id: (place, scope entry)} read straight from register/*/scope.json."""
    entries = {}
    for path in sorted((Path(repo) / "register").glob("*/scope.json")):
        for entry in json.loads(path.read_text(encoding="utf-8")):
            entries[entry["id"]] = (path.parent.name, entry)
    return entries


def inverse(entries):
    """(target id -> amender ids, counts of the pairs the page skips): an entry that amends itself, a repeated id
    and an id with no entry are skipped. The amender ids are sorted."""
    pairs, skipped = {}, Counter()
    for amender, (_place, entry) in entries.items():
        seen = set()
        for target in entry.get("amends_ids") or []:
            if target == amender:
                skipped["self"] += 1
            elif target in seen:
                skipped["repeated"] += 1
            elif target not in entries:
                skipped["dangling"] += 1
            else:
                pairs.setdefault(target, []).append(amender)
            seen.add(target)
    return {t: sorted(a) for t, a in sorted(pairs.items())}, skipped


def newest_first(items):
    """Newest date first, undated (empty `at`) last, the id breaking ties: sort by id, then by date descending (stable)."""
    return sorted(sorted(items, key=lambda i: i["id"]), key=lambda i: i["at"], reverse=True)


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
    snapshot9 = shared["snapshot"]["history_commit"][:9]
    commits = query._commits(repo, ref)

    entries = read_scope(repo)
    pairs_by_target, skipped = inverse(entries)
    pairs = sum(len(v) for v in pairs_by_target.values())
    amenders = {a for v in pairs_by_target.values() for a in v}
    link_only = {a for a in amenders if entries[a][1].get("status") == "link only"}

    lookups = {}

    def at_place(place, date):
        if (place, date) not in lookups:
            found, not_yet, _first = query.lookup(place, date, repo, ref)
            lookups[(place, date)] = ({i["id"]: i for i in found}, {i["id"]: i for i in not_yet})
        return lookups[(place, date)]

    def stand(amender, date):
        """(group, sort date, words) for one amender on a date, or None when it is repealed then."""
        place, entry = entries[amender]
        if entry.get("status") == "link only":
            at = entry.get("in_force") or ""
            return "link-only", at, f"register date {at}" if at else "link only"
        found, not_yet = at_place(place, date)
        if amender in found:
            item = found[amender]
            return "in-force", item["in_force"], (f"published {item['in_force']}" if item.get("date_basis") else f"in force since {item['in_force']}")
        if amender in not_yet:
            return "not-yet", not_yet[amender]["in_force"], f"in force from {not_yet[amender]['in_force']}"
        if not any(c["id"] == amender and c["kind"] == "repeal" and c["in_force"] <= date for c in commits):
            die(f"{amender} on {date}: not in force, not waiting and not repealed")
        return None

    table = {}
    for target in pairs_by_target:
        table[target] = {}
        for date in DATES:
            groups = {"in-force": [], "not-yet": [], "link-only": []}
            for amender in pairs_by_target[target]:
                state = stand(amender, date)
                if state:
                    group, at, when = state
                    groups[group].append({"id": amender, "title": entries[amender][1].get("title", ""),
                                          "url": entries[amender][1].get("official_url") or "", "at": at, "when": when})
            table[target][date] = {key: [{k: v for k, v in i.items() if k != "at"} for i in newest_first(items)]
                                   for key, items in groups.items()}

    # the story's own cases, written out in STORY, must agree with lookup
    for (target, date), fixed in STORY.items():
        got = {k: [i["id"] for i in v] for k, v in table[target][date].items() if v}
        if got != fixed:
            die(f"{target} on {date}: lookup gives {got}, the story fixed {fixed}")
    if STORY_NO_AMENDER in pairs_by_target or STORY_NO_AMENDER not in entries or entries[STORY_NO_AMENDER][1].get("status") == "link only":
        die(f"{STORY_NO_AMENDER} is no longer a stored entry that no entry names")
    if [i["when"] for i in table[CSRD]["2025-06-01"]["in-force"]] != ["in force since 2025-04-17"] \
            or [i["when"] for i in table[CSRD]["2025-06-01"]["not-yet"]] != ["in force from 2026-03-18"]:
        die("CSRD on 2025-06-01: the dates in words differ from the story")
    if [i["when"] for i in table["cy-ets-law-2011"]["2026-11-17"]["link-only"]] != ["register date 2025-12-09", "register date 2025-07-25", "register date 2024-07-26"] \
            or table["af-air-pollution-regulation"]["2026-11-17"]["link-only"][0]["when"] != "link only":
        die("link-only amenders: the dates in words differ from the story")

    out = {"ref": ref, "snapshot9": snapshot9, "read_on": args.read_on, "dates": DATES,
           "pairs": pairs, "targets": len(pairs_by_target), "amenders": len(amenders),
           "stored": len(amenders) - len(link_only), "link_only": len(link_only),
           "link_only_dated": sum(bool(entries[a][1].get("in_force")) for a in link_only), "skipped": dict(skipped),
           "entries": len(entries), "inverse": pairs_by_target, "table": table}
    path = Path(args.out).expanduser()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"amended_expected: pairs={pairs} targets={len(pairs_by_target)} amenders={len(amenders)} "
          f"link_only={len(link_only)} skipped={dict(skipped)} snapshot={snapshot9}")


if __name__ == "__main__":
    main()
