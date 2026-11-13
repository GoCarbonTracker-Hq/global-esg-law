"""Read-only queries over the register and a history ref."""
import csv
import json
import subprocess
from collections import Counter, defaultdict
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIELDS = {"Instrument": "title", "Source-url": "source_url", "In-force": "in_force", "Kind": "kind",
          "Licence": "licence", "Jurisdiction": "jurisdiction", "Instrument-id": "id", "Language": "language",
          "Date-basis": "date_basis", "Re-enactment": "re_enactment"}
NOTICE = "This is not legal advice. The official source is the authority. Nothing here says whether any company complies with any law."


def _git(repo, *args, check=True):
    return subprocess.run(["git", "-C", str(repo), *args], check=check, text=True,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def resolve_ref(repo=ROOT, ref=None):
    """Use local history when present, then the clone's origin/history ref."""
    if ref is not None:
        return ref
    for candidate in ("history", "origin/history"):
        if _git(repo, "rev-parse", "--verify", "--quiet", f"{candidate}^{{commit}}", check=False).returncode == 0:
            return candidate
    return "history"


def _head(repo, ref):
    result = _git(repo, "rev-parse", "--verify", f"{ref}^{{commit}}")
    return result.stdout.strip()


@lru_cache(maxsize=8)
def _read_commits(repo, commit):
    out = _git(repo, "log", "--first-parent", "--reverse", "--format=%H%x1f%B%x1e", commit).stdout
    records = []
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
            records.append({**trailers, "commit": sha})
    return tuple(records)


def _commits(repo, ref=None):
    ref = resolve_ref(repo, ref)
    return _read_commits(str(Path(repo).resolve()), _head(repo, ref))


def _scope(repo, iso2):
    path = Path(repo) / "register" / iso2 / "scope.json"
    return {e["id"]: e for e in json.loads(path.read_text(encoding="utf-8"))} if path.exists() else {}


def known(repo=ROOT, ref=None):
    registered = {p.parent.name for p in (Path(repo) / "register").glob("*/scope.json")}
    return sorted(registered | {c["jurisdiction"] for c in _commits(repo, ref) if "jurisdiction" in c})


def _version(records, lang):
    """Pick the preferred same-day record and list the available languages."""
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


def lookup(iso2, on, repo=ROOT, ref=None, lang=None, detail=False):
    """Return (in_force list, not_yet list, first date) for one place and date."""
    versions = sorted((c for c in _commits(repo, ref) if c.get("jurisdiction") == iso2),
                      key=lambda c: c["in_force"])
    latest, pending, repealed = {}, {}, {}
    for c in versions:
        if c["kind"] == "repeal":
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
                latest[c["id"]].append(c)
            else:
                latest[c["id"]] = [c]
        else:
            pending.setdefault(c["id"], c)
    scope = _scope(repo, iso2)
    keys = ("id", "title", "in_force", "kind", "source_url", "licence", "commit", "date_basis")
    chosen = [_version(records, lang) for records in latest.values()]
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


def in_force(iso2, on, repo=ROOT, ref=None, lang=None, detail=False):
    return lookup(iso2, on, repo, ref, lang, detail)[0]


def _record_key(iso2, instrument, record, path):
    return (iso2, instrument, record.get("in_force") or path.name[:10],
            "repeal" if record.get("repealed") is True else record["kind"], record["language"])


def _coverage_status(repo, history, history_commit):
    working = Counter()
    for path in (Path(repo) / "records").glob("*/*/*.json"):
        record = json.loads(path.read_text(encoding="utf-8"))
        iso2, instrument = path.relative_to(Path(repo) / "records").parts[:2]
        working[_record_key(iso2, instrument, record, path)] += 1
    stored = Counter((c["jurisdiction"], c["id"], c["in_force"], c["kind"], c.get("language", ""))
                     for c in history if c.get("jurisdiction") and c.get("id"))
    missing = sum((working - stored).values())
    extra = sum((stored - working).values())
    content_diff = _git(repo, "diff", "--quiet", history_commit, "--", ":(glob)records/**/*.json",
                        check=False).returncode == 1
    if not missing and not extra and not content_diff:
        status = "matches working tree"
    elif missing and not extra:
        status = "history trails working tree"
    else:
        status = "history differs from working tree"
    return {"status": status, "missing_records": missing, "extra_records": extra,
            "record_content_diff": content_diff}


def envelope(repo=ROOT, ref=None):
    """Return (snapshot, coverage, notice envelope, history records) for this repo snapshot."""
    repo = Path(repo).resolve()
    ref = resolve_ref(repo, ref)
    history_commit = _head(repo, ref)
    history = _read_commits(str(repo), history_commit)
    return ({"snapshot": {"history_ref": ref, "history_commit": history_commit,
                          "working_tree_commit": _git(repo, "rev-parse", "--verify", "HEAD").stdout.strip()},
             "coverage": _coverage_status(repo, history, history_commit), "notice": NOTICE}, history)


def list_places(repo=ROOT, ref=None):
    """List scope-file places with storage facts and one shared evidence envelope."""
    repo = Path(repo).resolve()
    shared, history = envelope(repo, ref)
    first_dates = defaultdict(list)
    by_place_id = defaultdict(list)
    for record in history:
        iso2, instrument = record.get("jurisdiction"), record.get("id")
        if iso2 and instrument:
            by_place_id[(iso2, instrument)].append(record)
            first_dates[(iso2, instrument)].append(record["in_force"])
    names = {}
    csv_path = repo / "register" / "register.csv"
    if csv_path.exists():
        with csv_path.open(encoding="utf-8", newline="") as handle:
            names = {row["iso2"]: row.get("country") or row["iso2"] for row in csv.DictReader(handle)}
    scope_paths = {path.parent.name: path for path in (repo / "register").glob("*/scope.json")}
    places = []
    for iso2 in sorted(set(scope_paths) | set(key[0] for key in by_place_id)):
        path = scope_paths.get(iso2)
        entries = json.loads(path.read_text(encoding="utf-8")) if path else [
            {"id": instrument, "title": records[-1].get("title", ""), "status": "stored"}
            for (place, instrument), records in by_place_id.items() if place == iso2]
        instruments = []
        stored_count = link_only_count = missing_history_count = 0
        for entry in entries:
            records = by_place_id.get((iso2, entry["id"]), [])
            stored = bool(records)
            link_only = entry.get("status") == "link only"
            missing_history = entry.get("status") == "stored" and not stored
            stored_count += stored
            link_only_count += link_only
            missing_history_count += missing_history
            instruments.append({"id": entry["id"], "title": entry.get("title", ""),
                                "status": ("text stored" if stored else "link only" if link_only else
                                           "stored in working tree, absent from history snapshot"),
                                "first_in_force": min(first_dates[(iso2, entry["id"])], default=None)})
        places.append({"iso2": iso2, "name": names.get(iso2, iso2),
                       "status": ("empty scope file" if path and not entries else
                                 "text stored" if stored_count else
                                 "stored in working tree, absent from history snapshot" if missing_history_count else
                                 "link only"),
                       "instrument_count": len(entries), "stored_count": stored_count,
                       "link_only_count": link_only_count, "missing_history_count": missing_history_count,
                       "instruments": instruments})
    return {**shared, "places": places}


# --- STORY-GEL-32-03: law_in_force ---
NOT_AVAILABLE = "not available"
EMPTY_CASES = {
    "place_not_in_register": "{place} is not in this snapshot's register: it has no scope file and no stored record. "
                             "This does not mean no law exists there; the corpus does not cover the place.",
    "links_only": "{place} has links only: its instruments are listed under link_only with their official URLs, "
                  "and no text is stored. This does not mean no law was in force on {date}.",
    "before_record_starts": "The earliest stored record for {place} starts on {first}, after {date}. "
                            "This does not mean no law was in force on {date}; the corpus has no record that early.",
    "nothing_in_force": "Nothing in {place}'s scope was in force on {date} according to the stored records "
                        "(the earliest starts {first}). This does not mean no law applied; "
                        "link-only instruments and anything outside the scope list are not covered.",
    "registered_no_instruments": "{place} is in the register, and no instruments are listed for it yet. "
                                 "This does not mean no law was in force on {date}; the place has not been scoped.",
    "no_stored_text": "No text is stored in this snapshot for {place}. "
                      "This does not mean no law was in force on {date}.",
}


def _register_tiers(repo):
    path = Path(repo) / "register" / "register.csv"
    if not path.exists():
        return {}
    with path.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    found = defaultdict(set)
    for row in rows:
        found[(row["iso2"], row["official_source_url"], row["law_family"])].add(row.get("tier_hint") or None)
    # a key that matches rows with different tiers has no tier; the label then reads not available
    return {key: next(iter(values)) for key, values in found.items() if len(values) == 1}


def _labels(iso2, entry, tiers):
    """Tier and verification as the scope file and register give them; a missing value reads not available."""
    tier = tiers.get((iso2, entry.get("official_url"), entry.get("law_family"))) or NOT_AVAILABLE
    verification = entry.get("verification") or NOT_AVAILABLE
    unverified = verification != "official_text_seen"
    return {"official_url": entry.get("official_url") or NOT_AVAILABLE,
            "law_family": entry.get("law_family") or NOT_AVAILABLE,
            "duty_on": entry.get("duty_on") or NOT_AVAILABLE,
            "tier": tier, "verification": verification, "unverified": unverified,
            "tier_label": f"{tier}, unverified" if tier == "A" and unverified else tier}


def law_in_force(repo=ROOT, place=None, date=None, lang=None, ref=None):
    """Instruments in force in one place on one date, with link-only instruments listed apart."""
    import re
    from datetime import date as _date
    if not isinstance(place, str) or not re.fullmatch(r"[A-Z]{2}", place):
        raise ValueError(f"malformed place {place!r}: use two capital letters such as DE, or EU")
    try:
        if not isinstance(date, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
            raise ValueError
        _date.fromisoformat(date)
    except ValueError:
        raise ValueError(f"malformed date {date!r}: use a real calendar date as YYYY-MM-DD, such as 2024-12-31") from None
    if lang is not None and not (isinstance(lang, str) and re.fullmatch(r"[a-z]{2}", lang)):
        raise ValueError(f"malformed language {lang!r}: use a two-letter lowercase code such as en")
    repo = Path(repo).resolve()
    shared, _history = envelope(repo, ref)
    answer = {**shared, "place": place, "date": date, "language_requested": lang, "case": None, "message": None,
              "first_record_date": None, "in_force": [], "not_yet_in_force": [], "link_only": []}
    if place not in known(repo, ref):
        answer.update(case="place_not_in_register", message=EMPTY_CASES["place_not_in_register"].format(place=place))
        return answer
    found, not_yet, first = lookup(place, date, repo, ref, lang, detail=True)
    scope, tiers = _scope(repo, place), _register_tiers(repo)
    for item in found:
        item.update(_labels(place, scope.get(item["id"], {}), tiers))
        if lang:
            item["language_note"] = (f"no {lang} record for this version, showing the official record ({item['language']})"
                                     if item["fallback"] else f"showing the {item['language']} record")
    answer.update(in_force=found, not_yet_in_force=not_yet, first_record_date=first, link_only=[
        {"id": e["id"], "title": e.get("title", ""), "stored": False, "status": "link only, text not stored",
         **_labels(place, e, tiers)} for e in scope.values() if e.get("status") == "link only"])
    if not found:
        link_only_place = first is None and answer["link_only"] and all(e.get("status") == "link only" for e in scope.values())
        empty_scope = first is None and (repo / "register" / place / "scope.json").exists() and not scope
        case = ("links_only" if link_only_place else "registered_no_instruments" if empty_scope else
                "no_stored_text" if first is None else
                "before_record_starts" if date < first else "nothing_in_force")
        answer.update(case=case, message=EMPTY_CASES[case].format(place=place, date=date, first=first))
    return answer
