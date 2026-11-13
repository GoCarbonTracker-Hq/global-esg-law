#!/usr/bin/env python3
"""Ask what law applied on a date: python3 tools/law.py <ISO2> <YYYY-MM-DD> [--repo PATH] [--ref history] [--lang CODE] [--json]"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIELDS = {"Instrument": "title", "Source-url": "source_url", "In-force": "in_force", "Kind": "kind",
          "Licence": "licence", "Jurisdiction": "jurisdiction", "Instrument-id": "id", "Language": "language",
          "Date-basis": "date_basis", "Re-enactment": "re_enactment"}


def _commits(repo, ref):
    out = subprocess.run(["git", "-C", str(repo), "log", "--first-parent", "--reverse",
                          "--format=%H%x1f%B%x1e", ref], check=True, text=True,
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout
    for chunk in out.split("\x1e"):
        if not chunk.strip():
            continue
        sha, body = chunk.strip().split("\x1f", 1)
        trailers = {}
        for line in body.strip().split("\n\n")[-1].splitlines():
            key, _, value = line.partition(": ")
            if key in FIELDS:
                trailers[FIELDS[key]] = value
        if "in_force" in trailers:
            yield {**trailers, "commit": sha}


def _scope(repo, iso2):
    path = Path(repo) / "register" / iso2 / "scope.json"
    return {e["id"]: e for e in json.loads(path.read_text(encoding="utf-8"))} if path.exists() else {}


def known(repo=ROOT, ref="history"):
    registered = {p.parent.name for p in (Path(repo) / "register").glob("*/scope.json")}
    return sorted(registered | {c["jurisdiction"] for c in _commits(repo, ref) if "jurisdiction" in c})


def _version(records, lang):
    """One version of one instrument: all records sharing its in_force date, in commit order.
    Returns (shown record, fallback flag, languages list). Per language the last record wins (so a
    consolidated text replaces the adopted one, as before). The official record is the first
    non-translation language, which tools/build.py orders ahead of every translation."""
    by_lang = {}
    for c in records:
        by_lang[c.get("language")] = c
    ordered = sorted(by_lang.values(), key=lambda c: records.index(c))
    official = next((c for c in ordered if c["kind"] != "translation"), ordered[0])
    shown, fallback = official, False
    if lang:
        if lang in by_lang:
            shown = by_lang[lang]
        else:
            fallback = True
    languages = [{"language": c.get("language"), "kind": c["kind"], "commit": c["commit"]}
                 for c in [shown] + [c for c in ordered if c is not shown]]
    return shown, fallback, languages


def lookup(iso2, on, repo=ROOT, ref="history", lang=None, detail=False):
    """Return (in_force list, not_yet list of {id, title, in_force}, first date or None).
    One item per instrument: the official-language record of its latest version on or before `on`.
    With lang, the record in that language when the version has one, else the official record
    (fallback true). detail adds language, languages (the shown record first), and fallback."""
    versions = sorted((c for c in _commits(repo, ref) if c.get("jurisdiction") == iso2),
                      key=lambda c: c["in_force"])  # sorted() is stable, so commit order breaks ties
    latest, pending, repealed = {}, {}, {}
    for c in versions:
        if c["kind"] == "repeal":  # Kind trailer of a repeal record: out of force from that date
            if c["in_force"] <= on:
                latest.pop(c["id"], None)
                repealed[c["id"]] = c["in_force"]
            else:
                pending.setdefault(c["id"], c)
        elif c["in_force"] <= on:
            if c["kind"] == "translation" and c["id"] in latest \
                    and latest[c["id"]][0]["in_force"] < c["in_force"]:
                continue
            if c["id"] in repealed and c["in_force"] >= repealed[c["id"]]:
                if c.get("re_enactment") != "true":
                    continue
                repealed.pop(c["id"])
            if c["id"] in latest and latest[c["id"]][0]["in_force"] == c["in_force"]:
                latest[c["id"]].append(c)  # another record of the same version
            else:
                latest[c["id"]] = [c]
        else:
            pending.setdefault(c["id"], c)
    scope = _scope(repo, iso2)
    keys = ("id", "title", "in_force", "kind", "source_url", "licence", "commit", "date_basis")
    chosen = []
    for records in latest.values():
        shown, fallback, languages = _version(records, lang)
        chosen.append((shown, fallback, languages))
    found = []
    for c, fallback, languages in sorted(chosen, key=lambda t: (t[0]["in_force"], t[0]["id"])):
        item = {k: c[k] for k in keys if k in c}
        if detail:
            item.update(language=c.get("language"), languages=languages)
            if lang:
                item["fallback"] = fallback
        for key in ("status_note", "amends"):
            value = scope.get(c["id"], {}).get(key)
            if value:
                item[key] = value
        found.append(item)
    not_yet = [{k: c[k] for k in ("id", "title", "in_force")} for _, c in sorted(pending.items())]
    return found, not_yet, versions[0]["in_force"] if versions else None


def in_force(iso2, on, repo=ROOT, ref="history", lang=None, detail=False):
    return lookup(iso2, on, repo, ref, lang, detail)[0]


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("iso2")
    ap.add_argument("date")
    ap.add_argument("--repo", default=str(ROOT))
    ap.add_argument("--ref", default="history")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--lang", help="ISO 639-1 code: show that language's record when the version has one, else the official record")
    args = ap.parse_args(argv)
    iso2 = args.iso2.upper()
    if args.lang is not None and not re.fullmatch(r"[a-z]{2}", args.lang):
        print(f"malformed language {args.lang!r}, expected an ISO 639-1 code such as en", file=sys.stderr)
        return 2
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        print(f"malformed date {args.date!r}, expected YYYY-MM-DD", file=sys.stderr)
        return 2
    try:
        from datetime import date
        date.fromisoformat(args.date)
    except ValueError:
        print(f"malformed date {args.date!r}, expected YYYY-MM-DD", file=sys.stderr)
        return 2
    try:
        names = known(args.repo, args.ref)
        if iso2 not in names:
            print(f"unknown jurisdiction {iso2!r}; known: {', '.join(names)}", file=sys.stderr)
            return 2
        found, not_yet, first = lookup(iso2, args.date, args.repo, args.ref, args.lang, detail=True)
    except subprocess.CalledProcessError as exc:
        print(exc.stderr.strip() or exc, file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps({"jurisdiction": iso2, "date": args.date, "lang": args.lang, "in_force": found, "not_yet_in_force": not_yet}, indent=2))
        return 0
    for item in found:
        print(f"{item['id']}\t{item['in_force']}\t{item['kind']}\t{item['title']}"
              + (f"\tamends {item['amends']}" if "amends" in item else ""))
        for other in item["languages"][1:]:
            print(f"  {other['language'] or '-'}\t{other['kind']}")
        if args.lang:
            print(f"note {item['id']}: no {args.lang} record for this version, showing the official record ({item['language'] or '-'})"
                  if item["fallback"] else f"note {item['id']}: showing the {item['language']} record")
    for item in found:
        if "status_note" in item:
            print(f"note {item['id']}: {item['status_note']}")
        if item.get("date_basis") == "publication":
            print(f"note {item['id']}: date is a publication date because commencement is unknown")
    if not found:
        print((f"nothing in force before {first}" if args.date < first else f"nothing in force on {args.date}")
              if first else f"no instruments stored for {iso2}")
    if not_yet:
        print("not yet in force")
        for item in not_yet:
            print(f"{item['id']}\t{item['in_force']}\t{item['title']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
