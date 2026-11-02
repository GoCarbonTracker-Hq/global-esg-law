#!/usr/bin/env python3
"""Turn a confirmed queue row into one record file and one commit on an upkeep branch.

python3 tools/update.py [--row <watcher_id>:<signal>] [--dry-run] [--no-commit]

Every row of upkeep/queue.csv with outcome `confirm` and change `new_version` (or the one named by
--row) is processed: the text is fetched with the recipe of its sources.json row, one record is
written under records/<iso2>/<instrument>/, the scope.json entry is marked stored, one line is added
to SOURCES.md under `### upkeep`, the admission gate (tools/check_corpus.py) runs, and the four paths
are committed to a branch upkeep/<iso2>-<instrument>-<in_force> created from the current branch.
A row whose source verdict is not `pass` at that moment, or whose record fails the gate, is refused:
the reason goes into its `notes`, `outcome` stays as the reviewer left it. Nothing is ever pushed.
"""
import argparse
import csv
import gzip
import hashlib
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

from check_corpus import check
from watch import COLUMNS

ROOT = Path(__file__).resolve().parents[1]
TIMEOUT = 60
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
CELEX_RE = re.compile(r"\b\d{5}[A-Z]{1,2}\d{4}\b")
UPKEEP_HEADING = "### upkeep"
UPKEEP_INTRO = ("Records stored by `tools/update.py` from confirmed `upkeep/queue.csv` rows, one line each: "
                "date stored, record path, source row, request URL, sha256 of the file as returned, queue row.")
CELLAR = "https://publications.europa.eu/resource/celex/"
EU_HEADERS = {"Accept": "application/xhtml+xml", "Accept-Language": "eng"}


# ---------------------------------------------------------------- fetch recipes (SOURCES.md)

def _celex(entry):
    match = CELEX_RE.search(entry.get("citation") or "")
    if not match:
        raise ValueError(f"no CELEX number in the citation of {entry.get('id')}")
    return match.group(0)


def eu_adopted(entry, in_force):
    """EUR-Lex Cellar, adopted act by CELEX number (SOURCES.md, EU)."""
    return {"url": CELLAR + _celex(entry), "headers": EU_HEADERS, "drop": ("head", "script", "style")}


def eu_consolidated(entry, in_force):
    """EUR-Lex Cellar, consolidated text: CELEX with a leading 0 and the consolidation date as a suffix."""
    celex = _celex(entry)
    return {"url": f"{CELLAR}0{celex[1:]}-{in_force.replace('-', '')}", "headers": EU_HEADERS,
            "drop": ("head", "script", "style")}


def _uk_base(entry):
    return re.sub(r"/(data\.xml|data\.html|made|enacted|contents)$", "", entry["official_url"].rstrip("/"))


def uk_adopted(entry, in_force):
    """legislation.gov.uk as enacted (primary) or as made (secondary) data.xml."""
    base = _uk_base(entry)
    form = "enacted" if re.search(r"legislation\.gov\.uk/(ukpga|asp|anaw|asc|nia|apni|ukla|ukcm|mwa|aep|aip|apgb|ukppa)/", base) else "made"
    return {"url": f"{base}/{form}/data.xml", "headers": {}, "drop": ("metadata", "explanatorynotes")}


def uk_consolidated(entry, in_force):
    """legislation.gov.uk revised text: the current data.xml of the instrument. The pilot found that the
    point-in-time URL for a version's own date does not return that version (SOURCES.md, UK)."""
    return {"url": f"{_uk_base(entry)}/data.xml", "headers": {}, "drop": ("metadata", "explanatorynotes")}


def ecfr(entry, in_force):
    """eCFR versioner, full title XML for one part at a date; the endpoint requires compression."""
    match = re.search(r"title-(\d+)/part-([\w.]+)", entry["official_url"])
    if not match:
        raise ValueError(f"official_url of {entry.get('id')} names no eCFR title and part")
    title, part = match.groups()
    return {"url": f"https://www.ecfr.gov/api/versioner/v1/full/{in_force}/title-{title}.xml?part={part}",
            "headers": {"Accept-Encoding": "gzip"}, "drop": (),
            "message": f"{title} CFR Part {part} eCFR version dated {in_force}"}


RECIPES = {"EU-EURLEX-ADOPTED": eu_adopted, "EU-EURLEX-CONSOLIDATED": eu_consolidated,
           "UK-LEGISLATION-ADOPTED": uk_adopted, "UK-LEGISLATION-CONSOLIDATED": uk_consolidated,
           "US-ECFR-ADOPTED": ecfr}


def default_fetch(url, headers):
    """Return (status, body_bytes). Gzip is undone, so the body is the file as the server has it."""
    request = urllib.request.Request(url, headers={
        "User-Agent": "global-esg-law-update/1 (+https://github.com/varunmoka7/global-esg-law)",
        "Accept-Encoding": "gzip", **headers})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            status, body = response.status, response.read()
    except urllib.error.HTTPError as exc:
        return exc.code, b""
    if body[:2] == b"\x1f\x8b":
        body = gzip.decompress(body)
    return status, body


# ---------------------------------------------------------------- text extraction

INLINE = {"a", "abbr", "acronym", "b", "cite", "code", "del", "em", "font", "i", "ins", "mark", "q", "s", "small",
          "span", "strike", "strong", "sub", "sup", "u", "img", "emphasis", "citation", "term", "abbreviation",
          "character", "commentaryref", "internallink", "e", "su", "fr", "prtpage", "addition", "repeal",
          "substitution", "noteref", "footnoteref", "inlineamendment"}
CELLS = {"td", "th", "ent"}
ROWS = {"tr", "row"}


class _Text(HTMLParser):
    """Tags stripped; every non-inline element is a line break; table cells are tab-separated;
    the subtrees named in `drop` are left out. Tolerant of XHTML and of plain XML."""

    def __init__(self, drop):
        super().__init__(convert_charrefs=True)
        self.drop, self.skip, self.parts, self.first_cell = set(drop), 0, [], True

    @staticmethod
    def _name(tag):
        return tag.rsplit(":", 1)[-1].lower()

    def handle_starttag(self, tag, attrs):
        name = self._name(tag)
        if name in self.drop:
            self.skip += 1
        if self.skip:
            return
        if name in ROWS:
            self.first_cell = True
        if name in CELLS:
            self.parts.append("" if self.first_cell else "\t")
            self.first_cell = False
        elif name not in INLINE:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        name = self._name(tag)
        if name in self.drop and self.skip:
            self.skip -= 1
            return
        if not self.skip and name not in INLINE and name not in CELLS:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(re.sub(r"\s*\n\s*", " ", data))

    def text(self):
        lines = ["\t".join(" ".join(cell.split()) for cell in line.split("\t")) for line in "".join(self.parts).split("\n")]
        return re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip() + "\n"


def extract_text(body, drop=()):
    parser = _Text(drop)
    parser.feed(body.decode("utf-8", errors="replace") if isinstance(body, bytes) else body)
    parser.close()
    return parser.text()


# ---------------------------------------------------------------- repository files

def git(repo, *args):
    return subprocess.run(["git", "-C", str(repo), *args], check=True, text=True,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout.strip()


def load_queue(repo):
    path = repo / "upkeep" / "queue.csv"
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def save_queue(repo, rows):
    with (repo / "upkeep" / "queue.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS, lineterminator="\r\n", extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def row_key(row):
    return f"{row['watcher_id']}:{row['signal']}"


def mark_row(repo, key, note, outcome=None):
    """Re-read the queue (a branch switch may have changed it) and write note and outcome on the row."""
    rows = load_queue(repo)
    for row in rows:
        if row_key(row) == key and row["outcome"] == "confirm":
            row["notes"] = f"{row['notes']}; {note}" if row["notes"] else note
            if outcome:
                row["outcome"] = outcome
    save_queue(repo, rows)


def mark_scope_stored(scope_path, instrument, source_id):
    """What the pilot stories did to a scope entry when its text was stored: status `stored`, and the
    source row added to `source_row` when a second form of the text arrives."""
    scope = json.loads(scope_path.read_text(encoding="utf-8"))
    entry = next(e for e in scope if e.get("id") == instrument)
    entry["status"] = "stored"
    allowed = entry.get("source_row")
    if isinstance(allowed, list):
        if source_id not in allowed:
            allowed.append(source_id)
    elif allowed != source_id:
        entry["source_row"] = [allowed, source_id] if allowed else source_id
    scope_path.write_text(json.dumps(scope, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def add_sources_line(path, line):
    """Append `line` at the end of the `### upkeep` section of SOURCES.md, creating the section if needed."""
    text = path.read_text(encoding="utf-8") if path.exists() else "# Sources\n"
    lines = text.rstrip("\n").split("\n")
    if UPKEEP_HEADING not in lines:
        lines += ["", UPKEEP_HEADING, "", UPKEEP_INTRO]
    start = lines.index(UPKEEP_HEADING) + 1
    end = next((i for i in range(start, len(lines)) if lines[i].startswith("#")), len(lines))
    section, tail = lines[start:end], lines[end:]
    while section and not section[-1].strip():
        section.pop()
    if not section[-1].startswith("- "):
        section.append("")
    section.append(line)
    path.write_text("\n".join(lines[:start] + section + ([""] if tail else []) + tail) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- the flow

def update(repo=ROOT, fetch=None, today=None, row=None, dry_run=False, commit=True, out=None):
    """Process the confirmed rows. Return a list of {key, status, detail[, path, branch]} where status is
    `stored`, `refused` (reason written to notes), `open` (left as is) or `planned` (dry run)."""
    repo = Path(repo).resolve()
    fetch = fetch or default_fetch
    today = (today or date.today()).isoformat() if not isinstance(today, str) else today
    out = out or sys.stdout
    sources = {r["id"]: r for r in json.loads((repo / "sources.json").read_text(encoding="utf-8"))}
    queue = load_queue(repo)
    selected = [r for r in queue if r.get("outcome") == "confirm" and r.get("change") == "new_version"
                and (row is None or row_key(r) == row)]
    if row is not None and not selected:
        raise ValueError(f"no confirmed new_version row {row!r} in upkeep/queue.csv")
    original = None
    if commit and not dry_run and selected:
        original = git(repo, "symbolic-ref", "--short", "-q", "HEAD")
        git(repo, "rev-parse", "--verify", "-q", "HEAD")  # the upkeep branch needs a commit to start from
        dirty = git(repo, "status", "--porcelain", "--", "SOURCES.md", "upkeep/queue.csv", "records", "register")
        if dirty:
            raise ValueError("uncommitted changes would be swept into the upkeep commit; commit or stash them, "
                             "or use --no-commit:\n" + dirty)
    results = []

    def say(key, status, detail, **extra):
        print(f"{key}: {detail}", file=out)
        results.append({"key": key, "status": status, "detail": detail, **extra})

    for r in selected:
        key, iso2, instrument, source_id, in_force = row_key(r), r["iso2"], r["instrument"], r["source_id"], r["signal"]

        def refuse(reason):
            if dry_run:
                say(key, "planned", f"would refuse: {reason}")
            else:
                mark_row(repo, key, f"refused {today}: {reason}")
                say(key, "refused", f"refused, {reason}")

        if instrument == "*":
            say(key, "open", "row names no instrument, left open")
            continue
        if not DATE_RE.fullmatch(in_force or ""):
            say(key, "open", f"signal {in_force!r} is not an in-force date, left open")
            continue
        source = sources.get(source_id)
        if source is None:
            refuse(f"source_id {source_id!r} not in sources.json")
            continue
        if source.get("verdict") != "pass":
            refuse(f"source {source_id} verdict is {source.get('verdict')!r}, not 'pass'")
            continue
        recipe = RECIPES.get(source_id)
        if recipe is None:
            say(key, "open", f"no recipe for {source_id}")
            continue
        scope_path = repo / "register" / iso2 / "scope.json"
        scope = json.loads(scope_path.read_text(encoding="utf-8")) if scope_path.exists() else []
        entry = next((e for e in scope if e.get("id") == instrument), None)
        if entry is None:
            refuse(f"no instrument {instrument!r} in register/{iso2}/scope.json")
            continue
        kind = source.get("form")
        path = repo / "records" / iso2 / instrument / f"{in_force}-{kind}.json"
        rel = path.relative_to(repo).as_posix()
        branch = f"upkeep/{iso2}-{instrument}-{in_force}"
        if path.exists():
            refuse(f"record {rel} already exists")
            continue
        if commit and not dry_run and git(repo, "branch", "--list", branch):
            say(key, "open", f"branch {branch} already exists, left open")
            continue
        try:
            plan = recipe(entry, in_force)
        except ValueError as exc:
            refuse(str(exc))
            continue
        if dry_run:
            say(key, "planned", f"would fetch {plan['url']}, write {rel}, mark {instrument} stored in "
                                f"register/{iso2}/scope.json, add a SOURCES.md line"
                                + (f", commit to {branch}" if commit else ", leave the files uncommitted"))
            continue
        status, body = fetch(plan["url"], plan["headers"])
        if status != 200:
            refuse(f"fetch of {plan['url']} returned HTTP {status}")
            continue
        if not body:
            refuse(f"fetch of {plan['url']} returned an empty body")
            continue
        text = extract_text(body, plan["drop"])
        if not text.strip():
            refuse(f"no text extracted from {plan['url']}")
            continue
        sha256 = hashlib.sha256(body).hexdigest()
        record = {"source_id": source_id, "in_force": in_force, "kind": kind, "text": text,
                  "fetched_url": plan["url"], "fetched_sha256": sha256}
        if plan.get("message"):
            record["message"] = plan["message"]
        sources_md = repo / "SOURCES.md"
        before = {p: (p.read_bytes() if p.exists() else None) for p in (scope_path, sources_md)}
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(record, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
        mark_scope_stored(scope_path, instrument, source_id)
        line = (f"- {today}: `{rel}`, row `{source_id}`, fetched `{plan['url']}`, sha256 `{sha256}`, "
                f"queue row `{key}`.")
        add_sources_line(sources_md, line)
        try:
            check(repo)
        except ValueError as exc:
            path.unlink()
            for p, raw in before.items():
                if raw is None:
                    p.unlink(missing_ok=True)
                else:
                    p.write_bytes(raw)
            refuse(f"gate: {exc}")
            continue
        paths = [rel, scope_path.relative_to(repo).as_posix(), "SOURCES.md", "upkeep/queue.csv"]
        if not commit:
            mark_row(repo, key, f"stored {rel}", outcome="stored")
            say(key, "stored", f"wrote {rel}; not committed: {', '.join(paths)}", path=rel)
            continue
        # The commit carries this row's mark only. Refusal notes written earlier in this run stay in the
        # working tree of the starting branch, uncommitted, for the reviewer.
        queue_path = repo / "upkeep" / "queue.csv"
        notes_in_tree = queue_path.read_bytes()
        git(repo, "checkout", "-q", "HEAD", "--", "upkeep/queue.csv")
        mark_row(repo, key, f"stored {rel}", outcome="stored")
        message = (f"upkeep: {instrument} {in_force} ({kind})\n\nQueue-row: {key}\n"
                   f"Fetched-url: {plan['url']}\nFetched-sha256: {sha256}")
        git(repo, "checkout", "-q", "-b", branch)
        try:
            git(repo, "add", "--", *paths)
            git(repo, "commit", "-q", "-m", message)
        finally:
            git(repo, "checkout", "-q", original)
        queue_path.write_bytes(notes_in_tree)
        say(key, "stored", f"wrote {rel}, committed to {branch} (not pushed). Next:\n"
                           f"  git push -u origin {branch}\n"
                           f"  gh pr create --head {branch} --title \"upkeep: {instrument} {in_force}\" "
                           f"--body \"Queue row {key}. Record {rel}, gate passed.\"",
            path=rel, branch=branch)
    return results


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--row", help="process only this row, as <watcher_id>:<signal>")
    parser.add_argument("--dry-run", action="store_true", help="fetch nothing, write nothing, print what would be done")
    parser.add_argument("--no-commit", action="store_true", help="leave the files in the working tree, create no branch")
    parser.add_argument("--repo", default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    try:
        results = update(args.repo, row=args.row, dry_run=args.dry_run, commit=not args.no_commit)
    except (ValueError, OSError, json.JSONDecodeError, KeyError, subprocess.CalledProcessError) as exc:
        print(getattr(exc, "stderr", None) or exc, file=sys.stderr)
        return 1
    counts = {s: sum(1 for r in results if r["status"] == s) for s in ("stored", "refused", "open", "planned")}
    print(f"{len(results)} rows: {counts['stored']} stored, {counts['refused']} refused, {counts['open']} left open"
          + (f", {counts['planned']} planned (dry run)" if args.dry_run else "")
          + (" (refusal notes are in upkeep/queue.csv, uncommitted)" if counts["refused"] and not args.dry_run else ""))
    return 1 if counts["refused"] or counts["open"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
