#!/usr/bin/env python3
"""Turn a confirmed queue row into one record file and one commit on an upkeep branch.

python3 tools/update.py [--row <watcher_id>:<signal>] [--dry-run] [--no-commit]
python3 tools/update.py --row <key> --file <path> --url <url> [--plain] [--language <code>] [--in-force DATE] [--evidence TEXT]
python3 tools/update.py --row <key> --in-force DATE [--evidence TEXT]

Every row of upkeep/queue.csv with outcome `confirm` and change `new_version` (or the one named by
--row) is processed: the text is fetched with the recipe of its sources.json row, one record is
written under records/<iso2>/<instrument>/, the scope.json entry is marked stored, one line is added
to SOURCES.md under `### upkeep`, the admission gate (tools/check_corpus.py) runs, and the four paths
are committed to a branch upkeep/<iso2>-<instrument>-<in_force> created from the current branch.
A row whose source verdict is not `pass` at that moment, or whose record fails the gate, is refused:
the reason goes into its `notes`, `outcome` stays as the reviewer left it. A row whose source has no recipe
is left open with that reason in its `notes`. Nothing is ever pushed.

--in-force DATE (with --row) is the reviewer's in-force date. It is used instead of the row's signal, with or
without --file, so a page_hash, http_head or text_hash row (whose signal is no date) can be stored, and so can a
date_list row whose date is a publication date. --evidence TEXT (with --in-force) is the passage of the stored text
that gives the date, quoted as it stands; the row is refused when the text does not contain it. It goes into the
SOURCES.md line and the commit as an `In-force-evidence` trailer.

A confirmed row with change `repealed` goes the same way without a fetch: the record written is a
repeal (`text` empty, `repealed: true`, `in_force` the row's signal), so the dated history gains one
commit with trailer `Kind: repeal` and nothing earlier is edited. A `repealed` row whose signal is
not a date is refused.

With --file the text is a file the reviewer fetched by hand from --url, not a recipe fetch: the same verdict
check, record, scope mark, SOURCES.md line, gate and branch commit, with `supplied_by_hand: true` in the record
and a `Supplied-by: hand` trailer. --language is the record language (a source with no recipe has none), --plain
keeps the file's own line breaks instead of running the extractor. A `repealed` row is refused: a repeal stores no text.
"""
import argparse
import contextlib
import csv
import gzip
import hashlib
import http.client
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

from check_corpus import check, real_date
from make_sources import load_sources
from watch import COLUMNS, upkeep_lock

ROOT = Path(__file__).resolve().parents[1]
TIMEOUT = 60
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
CELEX_RE = re.compile(r"\b\d{5}[A-Z]{1,2}\d{4}\b")
UPKEEP_HEADING = "### upkeep"
UPKEEP_INTRO = ("Records stored by `tools/update.py` from confirmed `upkeep/queue.csv` rows, one line each: "
                "date stored, record path, source row, request URL, sha256 of the file as returned, queue row.")
CELLAR = "https://publications.europa.eu/resource/celex/"
EU_HEADERS = {"Accept": "application/xhtml+xml", "Accept-Language": "eng"}
HAND_DROP = ("head", "script", "style")  # extractor subtrees left out of a hand-fetched HTML file


# ---------------------------------------------------------------- fetch recipes (SOURCES.md)

def _celex(entry):
    match = CELEX_RE.search(entry.get("citation") or "")
    if not match:
        raise ValueError(f"no CELEX number in the citation of {entry.get('id')}")
    return match.group(0)


def eu_adopted(entry, in_force, today):
    """EUR-Lex Cellar, adopted act by CELEX number (SOURCES.md, EU)."""
    return {"url": CELLAR + _celex(entry), "headers": EU_HEADERS, "drop": ("head", "script", "style")}


def eu_consolidated(entry, in_force, today):
    """EUR-Lex Cellar, consolidated text: CELEX with a leading 0 and the consolidation date as a suffix."""
    celex = _celex(entry)
    return {"url": f"{CELLAR}0{celex[1:]}-{in_force.replace('-', '')}", "headers": EU_HEADERS,
            "drop": ("head", "script", "style")}


def _uk_base(entry):
    return re.sub(r"/(data\.xml|data\.html|made|enacted|contents)$", "", entry["official_url"].rstrip("/"))


def uk_adopted(entry, in_force, today):
    """legislation.gov.uk as enacted (primary) or as made (secondary) data.xml."""
    base = _uk_base(entry)
    form = "enacted" if re.search(r"legislation\.gov\.uk/(ukpga|asp|anaw|asc|nia|apni|ukla|ukcm|mwa|aep|aip|apgb|ukppa)/", base) else "made"
    return {"url": f"{base}/{form}/data.xml", "headers": {}, "drop": ("metadata", "explanatorynotes")}


def uk_consolidated(entry, in_force, today):
    """legislation.gov.uk revised text: the current data.xml of the instrument. The pilot found that the
    point-in-time URL for a version's own date does not return that version (SOURCES.md, UK), so the current text
    can be stored only under today's date; any other date is refused (fetch that version by hand and use --file)."""
    if in_force != today:
        raise ValueError(f"legislation.gov.uk serves only the current text, which cannot be stored under {in_force} "
                         f"(today is {today}): fetch that version by hand and use --file")
    return {"url": f"{_uk_base(entry)}/data.xml", "headers": {}, "drop": ("metadata", "explanatorynotes")}


def ecfr(entry, in_force, today):
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


# Language of the text each recipe fetches (ISO 639-1). A repeal fetches nothing and takes the language
# of the instrument's existing records.
LANGUAGES = {sid: "en" for sid in RECIPES}


def default_fetch(url, headers):
    """Return (status, body_bytes). Gzip is undone, so the body is the file as the server has it."""
    request = urllib.request.Request(url, headers={
        "User-Agent": "global-esg-law-update/1 (+https://github.com/GoCarbonTracker-Hq/global-esg-law)",
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
            if note not in row["notes"]:  # a rerun that meets the same obstacle adds nothing
                row["notes"] = f"{row['notes']}; {note}" if row["notes"] else note
            if outcome:
                row["outcome"] = outcome
    save_queue(repo, rows)


def restore_files(record_path, before):
    """Undo one row's file writes: remove the new record, put back the bytes the row's edits replaced."""
    record_path.unlink(missing_ok=True)
    for p, raw in before.items():
        if raw is None:
            p.unlink(missing_ok=True)
        else:
            p.write_bytes(raw)


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

def update(repo=ROOT, fetch=None, today=None, row=None, dry_run=False, commit=True, out=None, hand=None,
           reviewer_date=None, evidence=None):
    """Process the confirmed rows. Return a list of {key, status, detail[, path, branch]} where status is
    `stored`, `refused` (reason written to notes), `open` (left as is) or `planned` (dry run).

    A real run holds the upkeep lock from the first queue read to the last git command, so queue.py and watch.py
    wait their turn and nobody edits queue.csv while this run switches branches. A dry run writes nothing and takes none.

    hand = {file, url, plain, language} stores one row (`row` is required) from a file fetched by hand.
    reviewer_date (`row` is required) is the reviewer's in-force date, used instead of the row's signal, with or without
    a hand file. evidence (needs reviewer_date) is the passage of the stored text that gives that date.
    """
    repo = Path(repo).resolve()
    with contextlib.nullcontext() if dry_run else upkeep_lock(repo):
        return _update(repo, fetch, today, row, dry_run, commit, out, hand, reviewer_date, evidence)


def _update(repo, fetch, today, row, dry_run, commit, out, hand=None, reviewer_date=None, evidence=None):
    fetch = fetch or default_fetch
    if reviewer_date and (row is None or not real_date(reviewer_date)):
        raise ValueError(f"--in-force {reviewer_date!r} needs --row and a real date as YYYY-MM-DD")
    if evidence and not reviewer_date:
        raise ValueError("--evidence goes with --in-force")
    evidence = " ".join(evidence.split()) if evidence else None  # one line, so it fits a SOURCES.md line and a trailer
    if hand:
        if row is None or not re.fullmatch(r"https?://[^\s`]+", hand["url"] or ""):
            raise ValueError("--file needs --row and --url, an http(s) address with no spaces or backticks")
        if hand["language"] and not re.fullmatch(r"[a-z]{2}", hand["language"]):
            raise ValueError(f"--language {hand['language']!r} is not an ISO 639-1 code (two lowercase letters)")
        hand_body = Path(hand["file"]).read_bytes()
        if not hand_body.strip():
            raise ValueError(f"{hand['file']} is empty")
        try:
            hand_body.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError(f"{hand['file']} is not UTF-8: {exc}") from exc
        fetch = lambda url, headers: (200, hand_body)  # the file takes the place of the fetch; no network call is made
    today = (today or date.today()).isoformat() if not isinstance(today, str) else today
    out = out or sys.stdout
    sources = load_sources(repo / "sources.json")
    queue = load_queue(repo)
    selected = [r for r in queue if r.get("outcome") == "confirm" and r.get("change") in ("new_version", "repealed")
                and (row is None or row_key(r) == row)]
    if row is not None and not selected:
        raise ValueError(f"no confirmed new_version row {row!r} in upkeep/queue.csv (nor a confirmed repealed row)")
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
        key, iso2, instrument, source_id = row_key(r), r["iso2"], r["instrument"], r["source_id"]
        in_force = reviewer_date or r["signal"]  # --in-force is the reviewer's date: the signal may be a hash, or a publication date
        repeal = r.get("change") == "repealed"

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
            if repeal:
                refuse(f"signal {in_force!r} is not a repeal date (YYYY-MM-DD)")
            else:
                say(key, "open", f"signal {in_force!r} is not an in-force date, left open"
                                 + (" (pass --in-force DATE)" if row is not None else ""))
            continue
        source = sources.get(source_id)
        if source is None:
            refuse(f"source_id {source_id!r} not in sources.json")
            continue
        if source.get("verdict") != "pass":
            refuse(f"source {source_id} verdict is {source.get('verdict')!r}, not 'pass'")
            continue
        if hand and repeal:
            refuse("row is a repeal, which stores no text: run it without --file")
            continue
        recipe = RECIPES.get(source_id)
        if recipe is None and not repeal and not hand:  # a repeal fetches nothing, a hand file needs no recipe
            say(key, "open", f"no recipe for {source_id}")
            if not dry_run:
                mark_row(repo, key, f"no recipe for {source_id}: store the text by hand with --file")
            continue
        scope_path = repo / "register" / iso2 / "scope.json"
        scope = json.loads(scope_path.read_text(encoding="utf-8")) if scope_path.exists() else []
        entry = next((e for e in scope if e.get("id") == instrument), None)
        if entry is None:
            refuse(f"no instrument {instrument!r} in register/{iso2}/scope.json")
            continue
        kind = source.get("form")
        label = "repeal" if repeal else kind
        folder = repo / "records" / iso2 / instrument
        if repeal:
            languages = sorted({json.loads(p.read_text(encoding="utf-8")).get("language") for p in folder.glob("*.json")} - {None})
            if len(languages) != 1:
                refuse(f"cannot tell the repeal's language: records of {instrument} carry {languages or 'none'}")
                continue
            language = languages[0]
        else:
            language = (hand or {}).get("language") or LANGUAGES.get(source_id)
            if language is None:  # an input to fix and rerun, not a verdict on the row: nothing is written
                raise ValueError(f"{source_id} has no recipe language: pass --language")
        path = folder / f"{in_force}-{label}-{language}.json"  # new form; the old form {in_force}-{label}.json is still read
        rel = path.relative_to(repo).as_posix()
        branch = f"upkeep/{iso2}-{instrument}-{in_force}"
        if path.exists() or path.with_name(f"{in_force}-{label}.json").exists():
            refuse(f"record {rel} already exists")
            continue
        if commit and not dry_run and git(repo, "branch", "--list", branch):
            say(key, "open", f"branch {branch} already exists, left open")
            continue
        if repeal:
            plan = {"url": None}
        elif hand:
            plan = {"url": hand["url"], "headers": {}, "drop": HAND_DROP}
        else:
            try:
                plan = recipe(entry, in_force, today)
            except ValueError as exc:
                refuse(str(exc))
                continue
        if dry_run:
            act = ("would write a repeal record " if repeal else
                   f"would read {hand['file']} as {plan['url']}, write " if hand else f"would fetch {plan['url']}, write ")
            say(key, "planned", act + f"{rel}, mark {instrument} stored in register/{iso2}/scope.json, add a SOURCES.md line"
                                + (f", commit to {branch}" if commit else ", leave the files uncommitted"))
            continue
        if repeal:
            if evidence:
                refuse("a repeal stores no text for --evidence to quote")
                continue
            evidence_url = r.get("evidence_url") or "none"
            record = {"source_id": source_id, "in_force": in_force, "kind": kind, "language": language, "text": "", "repealed": True}
            provenance = f"repeal dated {in_force}, no fetch, evidence `{evidence_url}`"
            trailers = f"Evidence-url: {evidence_url}"
        else:
            try:
                status, body = fetch(plan["url"], plan["headers"])
            except (OSError, http.client.HTTPException) as exc:  # OSError covers URLError and TimeoutError
                refuse(f"fetch of {plan['url']} failed: {exc}")
                continue
            if status != 200:
                refuse(f"fetch of {plan['url']} returned HTTP {status}")
                continue
            if not body:
                refuse(f"fetch of {plan['url']} returned an empty body")
                continue
            text = body.decode("utf-8-sig").replace("\r\n", "\n") if hand and hand["plain"] else extract_text(body, plan["drop"])
            if not text.strip():
                refuse(f"no text extracted from {plan['url']}")
                continue
            if evidence and evidence not in " ".join(text.split()):
                refuse(f"--evidence {evidence!r} is not in the text of {plan['url']}")
                continue
            sha256 = hashlib.sha256(body).hexdigest()
            record = {"source_id": source_id, "in_force": in_force, "kind": kind, "language": language, "text": text,
                      "fetched_url": plan["url"], "fetched_sha256": sha256}
            if plan.get("message"):
                record["message"] = plan["message"]
            provenance = f"{'supplied by hand from' if hand else 'fetched'} `{plan['url']}`, sha256 `{sha256}`"
            trailers = f"Fetched-url: {plan['url']}\nFetched-sha256: {sha256}"
            if hand:
                record["supplied_by_hand"] = True
                trailers += "\nSupplied-by: hand"
            if evidence:
                provenance += f", in force {in_force} per \"{evidence}\""
                trailers += f"\nIn-force-evidence: {evidence}"
        sources_md = repo / "SOURCES.md"
        before = {p: (p.read_bytes() if p.exists() else None) for p in (scope_path, sources_md)}
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(record, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
        mark_scope_stored(scope_path, instrument, source_id)
        line = f"- {today}: `{rel}`, row `{source_id}`, {provenance}, queue row `{key}`."
        add_sources_line(sources_md, line)
        try:
            check(repo, strict=True)
        except ValueError as exc:
            restore_files(path, before)
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
        message = f"upkeep: {instrument} {in_force} ({label})\n\nQueue-row: {key}\n{trailers}"
        git(repo, "checkout", "-q", "-b", branch)
        try:
            git(repo, "add", "--", *paths)
            git(repo, "commit", "-q", "-m", message)
        except BaseException:  # a failing hook, a lock, Ctrl-C: leave no branch, staged file or stored mark behind
            git(repo, "reset", "-q", "--", *paths)
            git(repo, "checkout", "-q", original)
            git(repo, "branch", "-D", branch)
            restore_files(path, before)
            queue_path.write_bytes(notes_in_tree)
            raise
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
    parser.add_argument("--file", help="a text file fetched by hand, stored instead of running a recipe (needs --row and --url)")
    parser.add_argument("--url", help="the URL --file was fetched from, recorded as fetched_url")
    parser.add_argument("--plain", action="store_true", help="with --file: keep the file's line breaks, skip the extractor")
    parser.add_argument("--language", help="with --file: ISO 639-1 language of the text (default: the recipe's)")
    parser.add_argument("--in-force", help="in-force date YYYY-MM-DD, used instead of the row's signal (needs --row)")
    parser.add_argument("--evidence", help="with --in-force: the passage of the stored text that gives the date, quoted as it stands")
    parser.add_argument("--repo", default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    if args.file is None and (args.url or args.plain or args.language):
        parser.error("--url, --plain and --language go with --file")
    if args.file is not None and not (args.row and args.url):
        parser.error("--file needs --row and --url")
    if args.in_force and not args.row:
        parser.error("--in-force needs --row")
    if args.evidence and not args.in_force:
        parser.error("--evidence goes with --in-force")
    hand = None if args.file is None else {"file": args.file, "url": args.url, "plain": args.plain, "language": args.language}
    try:
        results = update(args.repo, row=args.row, dry_run=args.dry_run, commit=not args.no_commit, hand=hand,
                         reviewer_date=args.in_force, evidence=args.evidence)
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
