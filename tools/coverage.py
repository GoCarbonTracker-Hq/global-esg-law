#!/usr/bin/env python3
"""Coverage and currency report: write COVERAGE.md from the files in this repository.

Reads register/register.csv, register/<ISO2>/scope.json, records/, sources.json, upkeep/watchers.json,
upkeep/seen.json and upkeep/cadence.json. Writes COVERAGE.md at the repo root and nothing else.
Nothing in the report is typed by hand; rerun the command to refresh it.
"""
import argparse
import csv
import json
import sys
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMMAND = "python3 tools/coverage.py"
FAMILIES = [f"F{i}" for i in range(1, 8)]
PILOT = ("EU", "GB", "IN", "US")
TIERS = ("gazette_feed", "consolidation_site", "regulator_page", "tracker_pointer")
GAZETTE_HOSTS = ("publications.europa.eu", "federalregister.gov")
CONSOLIDATION_HOSTS = ("legislation.gov.uk", "ecfr.gov")


def _json(path, default=None):
    if not path.exists():
        if default is None:
            raise ValueError(f"{path.relative_to(ROOT) if path.is_relative_to(ROOT) else path} is missing")
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def _cell_text(value):
    """Markdown table cells cannot hold a pipe or a newline."""
    return str(value).replace("|", "/").replace("\n", " ")


def source_tier(row):
    """Cadence tier of a sources.json row, read from the host of its fetch URL. None means tracker_pointer."""
    if row is None:
        return "tracker_pointer"
    url = (row.get("fetch_url") or "").lower()
    if any(host in url for host in GAZETTE_HOSTS):
        return "gazette_feed"
    if any(host in url for host in CONSOLIDATION_HOSTS):
        return "consolidation_site"
    return "regulator_page"


def load(repo):
    """Read every input file once. Returns a dict of plain lists and dicts."""
    repo = Path(repo).resolve()
    with (repo / "register" / "register.csv").open(encoding="utf-8", newline="") as handle:
        register = list(csv.DictReader(handle))
    scopes = {}
    for scope_path in sorted((repo / "register").glob("*/scope.json")):
        scopes[scope_path.parent.name] = _json(scope_path)
    records = defaultdict(list)  # (iso2, instrument id) -> list of in_force dates
    kinds = defaultdict(list)  # (iso2, instrument id) -> list of record kinds
    records_root = repo / "records"
    if records_root.exists():
        for path in sorted(records_root.glob("*/*/*.json")):
            iso2, instrument = path.parent.parent.name, path.parent.name
            record = _json(path)
            records[(iso2, instrument)].append(record.get("in_force") or "")
            kinds[(iso2, instrument)].append(record.get("kind") or "")
    sources = {row["id"]: row for row in _json(repo / "sources.json", [])}
    watchers = _json(repo / "upkeep" / "watchers.json", [])
    seen_path = repo / "upkeep" / "seen.json"
    seen = _json(seen_path, {}) if seen_path.exists() else None
    cadence = _json(repo / "upkeep" / "cadence.json")
    missing = [t for t in TIERS if t not in cadence.get("tiers", {})]
    if missing:
        raise ValueError(f"upkeep/cadence.json: no cadence for {missing}")
    return {"register": register, "scopes": scopes, "records": records, "kinds": kinds, "sources": sources,
            "watchers": watchers, "seen": seen, "seen_exists": seen is not None, "cadence": cadence}


def instrument_facts(iso2, scope_entry, data, today):
    """Storage form, record count, last checked, last change, tier and staleness of one scope entry."""
    cadence = data["cadence"]["tiers"]
    source_rows = scope_entry.get("source_row") or []
    if isinstance(source_rows, str):
        source_rows = [source_rows]
    source_rows = [data["sources"].get(s) for s in source_rows]
    dates = data["records"].get((iso2, scope_entry["id"]), [])
    stored = scope_entry.get("status") == "stored" or bool(dates)
    watched = [w["id"] for w in data["watchers"] if w.get("iso2") == iso2 and w.get("instrument") == scope_entry["id"]]
    seen_dates = [(data["seen"] or {}).get(w, {}).get("checked_on") for w in watched]
    seen_dates = [d for d in seen_dates if d]
    if seen_dates:
        checked, checked_from = max(seen_dates), "watcher"
    else:
        licence_dates = [r.get("checked_on") for r in source_rows if r and r.get("checked_on")]
        checked, checked_from = (min(licence_dates), "licence row") if licence_dates else (None, None)
    tiers = sorted({source_tier(r) for r in source_rows}) or ["regulator_page"]
    tier = min(tiers, key=lambda t: cadence[t])  # the tightest cadence among the instrument's source rows
    return {"id": scope_entry["id"], "family": scope_entry.get("law_family") or "",
            "form": f"text {len(dates)}" if stored else "link only", "versions": len(dates),
            "stored": stored, "checked": checked, "checked_from": checked_from,
            "changed": max(dates) if dates else None, "tier": tier,
            "stale": is_stale(checked, tier, cadence, today), "watched": bool(watched)}


def is_stale(checked, tier, cadence, today):
    """True when the check date is older than the cadence of the tier. None when there is no check date."""
    if not checked:
        return None
    return (today - date.fromisoformat(checked)).days > cadence[tier]


def cell(entries):
    """One grid cell from the register rows (with their scope facts) that share a place and a family."""
    if not entries:
        return ""
    tiers = sorted({e["row"].get("tier_hint") or "?" for e in entries})
    verifications = sorted({e["row"].get("verification") or "?" for e in entries})
    facts = [e["facts"] for e in entries if e["facts"]]
    stored = [f for f in facts if f["stored"]]
    linked = [e for e in entries if not (e["facts"] and e["facts"]["stored"])]
    parts = ["/".join(tiers), "/".join(verifications)]
    form = []
    if stored:
        form.append(f"text {sum(f['versions'] for f in stored)}")
    if linked:
        with_url = [e for e in linked if (e["row"].get("official_source_url") or "").strip() or e["facts"]]
        if with_url:
            form.append(f"link only{' ' + str(len(with_url)) if stored else ''}")
        if len(with_url) < len(linked):
            form.append(f"no link{' ' + str(len(linked) - len(with_url)) if stored or with_url else ''}")
    parts.append(", ".join(form))
    checks = [f["checked"] for f in facts if f["checked"]]
    unchecked = len(entries) - len(checks)
    if checks:
        parts.append("checked " + min(checks) + (f" ({unchecked} unchecked)" if unchecked else ""))
    else:
        parts.append("unchecked")
    changes = [f["changed"] for f in facts if f["changed"]]
    if changes:
        parts.append("changed " + max(changes))
    if any(f["stale"] for f in facts):
        parts.append("stale")
    return _cell_text(" · ".join(parts))


def build(repo=ROOT, today=None):
    """Return the Markdown text of the report. today is a datetime.date; default is the run date."""
    today = today or date.today()
    as_of = today.isoformat()
    data = load(repo)
    cadence = data["cadence"]
    register = data["register"]

    # Index scope entries by (iso2, title) so a register row can find its instrument.
    scope_by_title = {}
    for iso2, entries in data["scopes"].items():
        for entry in entries:
            scope_by_title[(iso2, entry.get("title", ""))] = entry
    facts_cache = {}

    def facts_for(iso2, entry):
        key = (iso2, entry["id"])
        if key not in facts_cache:
            facts_cache[key] = instrument_facts(iso2, entry, data, today)
        return facts_cache[key]

    places = {}  # iso2 -> country name
    grid = defaultdict(lambda: defaultdict(list))  # iso2 -> family -> entries
    no_instrument_rows, no_family_rows, odd_family_rows = [], [], []
    for row in register:
        iso2 = row["iso2"]
        places.setdefault(iso2, row.get("country") or iso2)
        if not (row.get("instrument_title") or "").strip():
            no_instrument_rows.append(row)
            continue
        entry = scope_by_title.get((iso2, row["instrument_title"]))
        facts = facts_for(iso2, entry) if entry else None
        family = (row.get("law_family") or "").strip()
        if not family:
            no_family_rows.append(row)
            continue
        if family not in FAMILIES:
            odd_family_rows.append(row)
            continue
        grid[iso2][family].append({"row": row, "facts": facts})

    scope_facts = {iso2: [facts_for(iso2, e) for e in entries] for iso2, entries in data["scopes"].items()}
    all_facts = [f for fs in scope_facts.values() for f in fs]
    watched_places = sorted({w.get("iso2") for w in data["watchers"] if w.get("iso2")})
    unwatched_places = [p for p in sorted(places) if p not in watched_places]
    families_in_register = {row["law_family"] for row in register if row.get("law_family") in FAMILIES}
    families_no_instrument = [f for f in FAMILIES if f not in families_in_register]
    families_stored = {f["family"] for f in all_facts if f["stored"]}
    families_no_text = [f for f in FAMILIES if f not in families_stored]
    instrument_places = sorted({row["iso2"] for row in register if (row.get("instrument_title") or "").strip()})
    stored_places = sorted({iso2 for iso2, fs in scope_facts.items() if any(f["stored"] for f in fs)})
    link_only_places = [p for p in instrument_places if p not in stored_places]
    consolidated_places = {iso2 for (iso2, _), ks in data["kinds"].items() if "consolidated" in ks}
    as_published_places = [p for p in stored_places if p not in consolidated_places]
    empty_places = [p for p in sorted(places) if p not in instrument_places]
    stale_cells = sum(1 for iso2 in grid for fam in grid[iso2] if cell(grid[iso2][fam]).endswith("stale"))
    stale_instruments = [f for f in all_facts if f["stale"]]
    record_count = sum(len(v) for v in data["records"].values())

    out = []
    w = out.append
    w("# Coverage and currency")
    w("")
    w(f"Generated on {as_of} by `{COMMAND}` from `register/register.csv`, `register/<ISO2>/scope.json`, "
      "`records/`, `sources.json`, `upkeep/watchers.json`, `upkeep/seen.json` and `upkeep/cadence.json`. "
      "Nothing in this file is typed by hand; edit the inputs and rerun the command.")
    w("")
    w("This is a map of what the repository holds and when it was last checked. It is not a claim that the law of "
      "any place is covered completely, and it says nothing about whether any company complies with any law. "
      "The law families are the `law_family` codes of the register: " + ", ".join(FAMILIES) + ".")
    w("")
    if not cadence.get("measured"):
        w("The cadence values in `upkeep/cadence.json` are placeholders pending GEL-02-06; no cadence has been "
          "measured yet, so `stale` marks a cell against an assumed rhythm, not an observed one.")
        w("")
    if not data["seen_exists"]:
        w("`upkeep/seen.json` does not exist yet, so no watcher has run; every last checked date below comes from "
          "the `checked_on` of a licence row in `sources.json`.")
        w("")

    w("## Counts")
    w("")
    w("| Count | Value | As of | Command |")
    w("|---|---|---|---|")
    counts = [
        ("Places in the register", len(places)),
        ("Register rows", len(register)),
        ("Register rows with an instrument and a law family (shown in the grid)",
         sum(len(v) for fam in grid.values() for v in fam.values())),
        ("Register rows with an instrument but no law family (not in the grid)", len(no_family_rows)),
        ("Register rows with a law family outside " + FAMILIES[0] + " to " + FAMILIES[-1], len(odd_family_rows)),
        ("Register rows with no instrument (place listed, nothing found)", len(no_instrument_rows)),
        ("Pilot places with a scope file", len(data["scopes"])),
        ("Instruments in scope files", len(all_facts)),
        ("Instruments with stored text", sum(1 for f in all_facts if f["stored"])),
        ("Instruments link only", sum(1 for f in all_facts if not f["stored"])),
        ("Record files (text versions)", record_count),
        ("Watchers in upkeep/watchers.json", len(data["watchers"])),
        ("Watchers with a checked_on in upkeep/seen.json",
         sum(1 for w_ in data["watchers"] if (data["seen"] or {}).get(w_.get("id"), {}).get("checked_on"))),
        ("Instruments whose last check is older than its cadence (stale)", len(stale_instruments)),
        ("Grid cells marked stale", stale_cells),
        ("Places with no watcher", len(unwatched_places)),
        ("Places with instruments but no stored text (link only)", len(link_only_places)),
        ("Places with stored text but no consolidated text (as published only)", len(as_published_places)),
    ]
    for label, value in counts:
        w(f"| {label} | {value} | {as_of} | `{COMMAND}` |")
    w("")

    w("## Not covered")
    w("")
    w(f"Counts as of {as_of}, from `{COMMAND}`.")
    w("")
    w(f"- Places with no watcher ({len(unwatched_places)}): " + (", ".join(unwatched_places) or "none") + ".")
    w(f"- Families with no instrument anywhere in the register ({len(families_no_instrument)}): "
      + (", ".join(families_no_instrument) or "none") + ".")
    w(f"- Families with no stored text in any place ({len(families_no_text)}): "
      + (", ".join(families_no_text) or "none") + ".")
    for iso2 in sorted(data["scopes"]):
        missing = [f for f in FAMILIES if not grid.get(iso2, {}).get(f)]
        w(f"- {iso2}: families with no instrument ({len(missing)}): " + (", ".join(missing) or "none") + ".")
    w(f"- Places with instruments but no stored text, link only ({len(link_only_places)}): "
      + (", ".join(link_only_places) or "none") + ".")
    w(f"- Places whose stored texts are the acts as published, no consolidated text ({len(as_published_places)}): "
      + (", ".join(as_published_places) or "none") + ". A date lookup for these places returns the act as first "
      "printed and the amending acts stored as their own instruments; the amendments are not folded in.")
    w(f"- Places listed with no instrument found ({len(empty_places)}): " + (", ".join(empty_places) or "none") + ".")
    w(f"- Register rows with an instrument but no law family ({len(no_family_rows)}), not shown in the grid: "
      + (", ".join(sorted({r['iso2'] for r in no_family_rows})) or "none") + ".")
    w("- Register rows with no scope entry have no check date in the files; their cells read `unchecked` and are "
      "not counted as stale, although their cadence tier is `tracker_pointer`.")
    w("")

    w("## How to read a cell")
    w("")
    w("Each cell is `tier · verification · form · checked · changed · stale`, in this order:")
    w("")
    w("- tier: `tier_hint` of the register row (several rows in one cell are joined with `/`).")
    w("- verification: `verification` of the register row, joined the same way.")
    w("- form: `text N` where N is the number of record files under `records/` for the instruments in the cell; "
      "`link only` when the register lists the instrument with an official URL and no text is stored; "
      "`no link` when the register row has neither text nor a URL. A cell with both forms lists them with counts. "
      "Blank when the register has no instrument for that place and family.")
    w("- checked: the oldest last checked date among the cell's instruments. For an instrument with a watcher in "
      "`upkeep/watchers.json` whose `instrument` is its id, the date is that watcher's `checked_on` in "
      "`upkeep/seen.json`; otherwise it is the `checked_on` of the licence row in `sources.json`. `unchecked` "
      "when no instrument in the cell has a date (every register row without a scope entry).")
    w("- changed: the newest `in_force` among the cell's record files; absent when nothing is stored.")
    w("- stale: present when any instrument's last checked date is older than the cadence of its source tier. "
      "Tiers: rows fetched from Cellar or the Federal Register are `gazette_feed`; legislation.gov.uk and eCFR are "
      "`consolidation_site`; every other licence row is `regulator_page`; a register row with no scope entry is "
      "`tracker_pointer`. Cadence in days: "
      + ", ".join(f"{t} {cadence['tiers'][t]}" for t in TIERS) + ".")
    w("")

    w("## Grid")
    w("")
    w(f"One row per place in the register, one column per law family, as of {as_of}.")
    w("")
    w("| Place | Name | " + " | ".join(FAMILIES) + " |")
    w("|---|---|" + "---|" * len(FAMILIES))
    for iso2 in sorted(places):
        cells = [cell(grid.get(iso2, {}).get(f, [])) for f in FAMILIES]
        w(f"| {iso2} | {_cell_text(places[iso2])} | " + " | ".join(cells) + " |")
    w("")

    w("## Pilot places by instrument")
    w("")
    w(f"As of {as_of}. `versions` is the number of record files; `checked from` says whether the date came from a "
      "watcher or from the licence row.")
    w("")
    for iso2 in sorted(data["scopes"]):
        w(f"### {iso2} ({_cell_text(places.get(iso2, iso2))})")
        w("")
        w("| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |")
        w("|---|---|---|---|---|---|---|---|---|")
        for f in scope_facts[iso2]:
            stale = "stale" if f["stale"] else ("unchecked" if f["stale"] is None else "current")
            w(f"| {_cell_text(f['id'])} | {f['family']} | {f['form']} | {f['versions']} | {f['checked'] or ''} | "
              f"{f['checked_from'] or ''} | {f['tier']} | {f['changed'] or ''} | {stale} |")
        w("")
    return "\n".join(out).rstrip("\n") + "\n"


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", default=ROOT, help=argparse.SUPPRESS)
    parser.add_argument("--stdout", action="store_true", help="print the report instead of writing COVERAGE.md")
    args = parser.parse_args(argv)
    repo = Path(args.repo).resolve()
    try:
        text = build(repo)
    except (ValueError, OSError, json.JSONDecodeError, KeyError) as exc:
        print(exc, file=sys.stderr)
        return 1
    if args.stdout:
        sys.stdout.write(text)
        return 0
    (repo / "COVERAGE.md").write_text(text, encoding="utf-8")
    print(f"wrote COVERAGE.md ({len(text.splitlines())} lines) on {date.today().isoformat()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
