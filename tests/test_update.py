import csv
import hashlib
import io
import json
import subprocess
import sys
from datetime import date
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build
import check_corpus
import update

TODAY = date(2026, 11, 2)
EU_URL = "https://publications.europa.eu/resource/celex/02022L2464-20270101"
GB_URL = "https://www.legislation.gov.uk/ukpga/2006/46/section/414CB/data.xml"
SI_URL = "https://www.legislation.gov.uk/uksi/2022/31/made/data.xml"
US_URL = "https://www.ecfr.gov/api/versioner/v1/full/2027-03-03/title-40.xml?part=98"
EU_BODY = (b"<html><head><title>dropped</title></head><body><p>placeholder consolidated text</p>"
           b"<p>second <em>placeholder</em> paragraph</p></body></html>")
GB_BODY = (b'<Legislation><ukm:Metadata><dc:title>metadata dropped</dc:title></ukm:Metadata>'
           b"<Body><P1><Text>placeholder section text</Text></P1></Body></Legislation>")
US_BODY = (b"<DIV5><HEAD>PART 98 placeholder</HEAD><P>placeholder part text</P>"
           b"<GPOTABLE><ROW><ENT>cell one</ENT><ENT>cell two</ENT></ROW></GPOTABLE></DIV5>")
BANNED_URL = "https://publications.europa.eu/resource/celex/02099R0001-20270606"
BODIES = {EU_URL: (200, EU_BODY), GB_URL: (200, GB_BODY), SI_URL: (200, GB_BODY), US_URL: (200, US_BODY),
          BANNED_URL: (200, EU_BODY)}


def source(sid, form, verdict="pass"):
    return {"id": sid, "verdict": verdict, "form": form, "publisher": "P", "source_name": "S",
            "trailer_instrument": sid, "trailer_source_url": f"https://example.invalid/{sid}", "trailer_licence": "CC0"}


SOURCES = [source("EU-EURLEX-ADOPTED", "adopted"), source("EU-EURLEX-CONSOLIDATED", "consolidated"),
           source("UK-LEGISLATION-ADOPTED", "adopted"), source("UK-LEGISLATION-CONSOLIDATED", "consolidated"),
           source("US-ECFR-ADOPTED", "consolidated"), source("US-FEDREG-ADOPTED", "adopted"),
           source("IN-SEBI-ADOPTED", "adopted", "permission requested")]


def entry(iid, url, source_row, citation="", title="Placeholder Act", status="stored"):
    return {"id": iid, "title": title, "official_url": url, "citation": citation, "in_force": "2016-12-26",
            "source_row": source_row, "status": status}


SCOPES = {
    "EU": [entry("eu-act", "https://example.invalid/eli/act", "EU-EURLEX-ADOPTED", "32022L2464"),
           entry("eu-banned", "https://example.invalid/eli/banned", "EU-EURLEX-CONSOLIDATED", "32099R0001",
                 title="GRI Placeholder Act", status="pending")],
    "GB": [entry("gb-sec", "https://www.legislation.gov.uk/ukpga/2006/46/section/414CB/data.html", "UK-LEGISLATION-CONSOLIDATED"),
           entry("gb-si", "https://www.legislation.gov.uk/uksi/2022/31/made", "UK-LEGISLATION-ADOPTED", status="pending")],
    "US": [entry("us-part", "https://www.ecfr.gov/current/title-40/part-98", "US-ECFR-ADOPTED"),
           entry("us-fr", "https://example.invalid/fr", "US-FEDREG-ADOPTED", status="pending")],
    "IN": [entry("in-circ", "https://example.invalid/sebi", "IN-SEBI-ADOPTED", status="link only")],
}


def queue_row(watcher_id, signal, iso2, instrument, source_id, outcome="confirm", change="new_version", notes=""):
    return {"detected_on": "2026-11-02", "watcher_id": watcher_id, "iso2": iso2, "source_id": source_id,
            "instrument": instrument, "change": change, "signal": signal, "evidence_url": "https://example.invalid/list",
            "reviewer": "varun", "outcome": outcome, "outcome_on": "2026-11-02", "notes": notes}


QUEUE = [
    queue_row("eu-cellar", "2027-01-01", "EU", "eu-act", "EU-EURLEX-CONSOLIDATED"),
    queue_row("gb-sec", "2027-02-02", "GB", "gb-sec", "UK-LEGISLATION-CONSOLIDATED"),
    queue_row("gb-si", "2027-02-03", "GB", "gb-si", "UK-LEGISLATION-ADOPTED"),
    queue_row("us-ecfr", "2027-03-03", "US", "us-part", "US-ECFR-ADOPTED"),
    queue_row("us-fr", "2027-04-04", "US", "us-fr", "US-FEDREG-ADOPTED", notes="reviewer note"),
    queue_row("in-sebi", "2027-05-05", "IN", "in-circ", "IN-SEBI-ADOPTED"),
    queue_row("eu-banned", "2027-06-06", "EU", "eu-banned", "EU-EURLEX-CONSOLIDATED"),
    queue_row("eu-cellar", "2026-03-18", "EU", "eu-act", "EU-EURLEX-CONSOLIDATED", outcome="reject"),
    queue_row("eu-cellar", "3", "EU", "eu-act", "EU-EURLEX-CONSOLIDATED", outcome="", change="baseline"),
    queue_row("us-zip", "Last-Modified: Tue, 03 Nov 2026 01:00:00 GMT", "US", "*", "US-ECFR-ADOPTED"),
]
EU_KEY, GB_KEY, SI_KEY, US_KEY = "eu-cellar:2027-01-01", "gb-sec:2027-02-02", "gb-si:2027-02-03", "us-ecfr:2027-03-03"
EU_BRANCH = "upkeep/EU-eu-act-2027-01-01"


class FakeFetch:
    def __init__(self, bodies=None):
        self.bodies = dict(BODIES if bodies is None else bodies)
        self.calls = []

    def __call__(self, url, headers):
        self.calls.append((url, dict(headers)))
        return self.bodies[url]


def git(repo, *args):
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()


def make(repo, queue=QUEUE):
    """Fixture repo on branch main with two placeholder records committed, a queue and a SOURCES.md."""
    (repo / "sources.json").write_text(json.dumps(SOURCES))
    for iso2, entries in SCOPES.items():
        (repo / "register" / iso2).mkdir(parents=True)
        (repo / "register" / iso2 / "scope.json").write_text(json.dumps(entries, indent=2) + "\n")
    for iso2, iid, sid, kind, day in (("EU", "eu-act", "EU-EURLEX-ADOPTED", "adopted", "2023-01-05"),
                                      ("GB", "gb-sec", "UK-LEGISLATION-CONSOLIDATED", "consolidated", "2016-12-26"),
                                      ("US", "us-part", "US-ECFR-ADOPTED", "consolidated", "2017-01-01")):
        folder = repo / "records" / iso2 / iid
        folder.mkdir(parents=True)
        (folder / f"{day}-{kind}.json").write_text(json.dumps({
            "source_id": sid, "in_force": day, "kind": kind, "language": "en", "text": "placeholder text",
            "fetched_url": "https://example.invalid/old", "fetched_sha256": "0" * 64}))
    (repo / "SOURCES.md").write_text("# Sources\n\n## EU\n\nPilot recipe text.\n\n## US\n\nPilot recipe text.\n")
    (repo / "upkeep").mkdir()
    with (repo / "upkeep" / "queue.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=update.COLUMNS, lineterminator="\r\n")
        writer.writeheader()
        writer.writerows(queue)
    subprocess.run(["git", "init", "-q", str(repo)], check=True)
    git(repo, "symbolic-ref", "HEAD", "refs/heads/main")
    git(repo, "config", "user.name", "Test")
    git(repo, "config", "user.email", "test@example.org")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "fixture")
    return repo


def rows(repo):
    with (repo / "upkeep" / "queue.csv").open(newline="", encoding="utf-8") as handle:
        return {update.row_key(r): r for r in csv.DictReader(handle)}


def scope(repo, iso2, iid):
    return next(e for e in json.loads((repo / "register" / iso2 / "scope.json").read_text()) if e["id"] == iid)


def tree(repo):
    return {p.relative_to(repo).as_posix(): p.read_bytes() for p in repo.rglob("*") if p.is_file() and ".git/" not in p.as_posix()}


def test_confirmed_row_becomes_record_that_passes_gate(tmp_path):
    repo = make(tmp_path)
    fetch = FakeFetch()
    out = io.StringIO()
    results = update.update(repo, fetch, TODAY, row=EU_KEY, commit=False, out=out)
    assert [(r["key"], r["status"]) for r in results] == [(EU_KEY, "stored")]
    assert fetch.calls == [(EU_URL, {"Accept": "application/xhtml+xml", "Accept-Language": "eng"})]
    path = repo / "records" / "EU" / "eu-act" / "2027-01-01-consolidated-en.json"
    record = json.loads(path.read_text())
    assert set(record) == {"source_id", "in_force", "kind", "language", "text", "fetched_url", "fetched_sha256"}
    assert (record["source_id"], record["in_force"], record["kind"]) == ("EU-EURLEX-CONSOLIDATED", "2027-01-01", "consolidated")
    assert record["text"] == "placeholder consolidated text\n\nsecond placeholder paragraph\n"
    assert record["fetched_url"] == EU_URL and record["fetched_sha256"] == hashlib.sha256(EU_BODY).hexdigest()
    assert check_corpus.check(repo) == 4
    changed = scope(repo, "EU", "eu-act")
    assert changed["status"] == "stored" and changed["source_row"] == ["EU-EURLEX-ADOPTED", "EU-EURLEX-CONSOLIDATED"]
    sources_md = (repo / "SOURCES.md").read_text()
    assert sources_md.count("### upkeep") == 1 and sources_md.startswith("# Sources\n\n## EU\n\nPilot recipe text.\n\n## US\n")
    assert ("- 2026-11-02: `records/EU/eu-act/2027-01-01-consolidated-en.json`, row `EU-EURLEX-CONSOLIDATED`, "
            f"fetched `{EU_URL}`, sha256 `{record['fetched_sha256']}`, queue row `{EU_KEY}`.") in sources_md
    row = rows(repo)[EU_KEY]
    assert row["outcome"] == "stored" and row["notes"] == "stored records/EU/eu-act/2027-01-01-consolidated-en.json"
    assert (repo / "upkeep" / "queue.csv").read_bytes().count(b"\r\n") == len(QUEUE) + 1
    assert "wrote records/EU/eu-act/2027-01-01-consolidated-en.json" in out.getvalue()
    assert git(repo, "branch", "--list", "upkeep/*") == ""  # --no-commit creates no branch


def test_all_three_recipes_fetch_the_documented_urls(tmp_path):
    repo = make(tmp_path)
    fetch = FakeFetch()
    results = update.update(repo, fetch, TODAY, commit=False, out=io.StringIO())
    stored = {r["key"]: r["path"] for r in results if r["status"] == "stored"}
    assert stored == {EU_KEY: "records/EU/eu-act/2027-01-01-consolidated-en.json",
                      GB_KEY: "records/GB/gb-sec/2027-02-02-consolidated-en.json",
                      SI_KEY: "records/GB/gb-si/2027-02-03-adopted-en.json",
                      US_KEY: "records/US/us-part/2027-03-03-consolidated-en.json"}
    assert [c[0] for c in fetch.calls] == [EU_URL, GB_URL, SI_URL, US_URL, BANNED_URL]
    assert fetch.calls[3][1] == {"Accept-Encoding": "gzip"}
    gb = json.loads((repo / stored[GB_KEY]).read_text())
    assert gb["text"] == "placeholder section text\n" and "metadata" not in gb["text"]
    us = json.loads((repo / stored[US_KEY]).read_text())
    assert us["text"] == "PART 98 placeholder\n\nplaceholder part text\n\ncell one\tcell two\n"
    assert us["message"] == "40 CFR Part 98 eCFR version dated 2027-03-03"
    assert scope(repo, "GB", "gb-si")["status"] == "stored" and scope(repo, "GB", "gb-si")["source_row"] == "UK-LEGISLATION-ADOPTED"
    assert check_corpus.check(repo) == 7
    assert (repo / "SOURCES.md").read_text().count("\n- 2026-11-02: `records/") == 4


def test_non_pass_licence_leaves_row_open_with_reason(tmp_path):
    repo = make(tmp_path)
    fetch = FakeFetch()
    before = tree(repo)
    results = update.update(repo, fetch, TODAY, row="in-sebi:2027-05-05", commit=False, out=io.StringIO())
    assert results[0]["status"] == "refused" and fetch.calls == []
    row = rows(repo)["in-sebi:2027-05-05"]
    assert row["outcome"] == "confirm" and row["outcome_on"] == "2026-11-02"
    assert row["notes"] == "refused 2026-11-02: source IN-SEBI-ADOPTED verdict is 'permission requested', not 'pass'"
    after = tree(repo)
    assert set(after) == set(before) and not (repo / "records" / "IN").exists()
    assert {k for k in after if after[k] != before[k]} == {"upkeep/queue.csv"}


def test_source_with_no_recipe_leaves_row_open(tmp_path):
    repo = make(tmp_path)
    fetch = FakeFetch()
    before = tree(repo)
    out = io.StringIO()
    results = update.update(repo, fetch, TODAY, row="us-fr:2027-04-04", commit=False, out=out)
    assert results == [{"key": "us-fr:2027-04-04", "status": "open", "detail": "no recipe for US-FEDREG-ADOPTED"}]
    assert "us-fr:2027-04-04: no recipe for US-FEDREG-ADOPTED" in out.getvalue()
    assert fetch.calls == [] and tree(repo) == before
    assert rows(repo)["us-fr:2027-04-04"]["notes"] == "reviewer note"


def test_gate_failure_reverts_record_scope_and_sources(tmp_path):
    repo = make(tmp_path)
    fetch = FakeFetch()
    before = tree(repo)
    results = update.update(repo, fetch, TODAY, row="eu-banned:2027-06-06", commit=False, out=io.StringIO())
    assert results[0]["status"] == "refused" and "gate: " in results[0]["detail"]
    row = rows(repo)["eu-banned:2027-06-06"]
    assert row["outcome"] == "confirm" and row["notes"].startswith("refused 2026-11-02: gate: records/EU/eu-banned/2027-06-06-consolidated-en.json: standards text by name")
    after = tree(repo)
    assert {k for k in set(after) | set(before) if after.get(k) != before.get(k)} == {"upkeep/queue.csv"}


@pytest.mark.parametrize("bodies, reason", [
    ({EU_URL: (404, b"")}, "returned HTTP 404"),
    ({EU_URL: (200, b"")}, "returned an empty body"),
    ({EU_URL: (200, b"<html><head><title>only dropped text</title></head></html>")}, "no text extracted"),
])
def test_fetch_failure_is_a_refusal_in_notes(tmp_path, bodies, reason):
    repo = make(tmp_path)
    results = update.update(repo, FakeFetch(bodies), TODAY, row=EU_KEY, commit=False, out=io.StringIO())
    assert results[0]["status"] == "refused"
    assert reason in rows(repo)[EU_KEY]["notes"] and rows(repo)[EU_KEY]["outcome"] == "confirm"
    assert not (repo / "records" / "EU" / "eu-act" / "2027-01-01-consolidated-en.json").exists()


def test_rows_without_instrument_or_date_are_left_open(tmp_path):
    repo = make(tmp_path)
    results = update.update(repo, FakeFetch(), TODAY, row="us-zip:Last-Modified: Tue, 03 Nov 2026 01:00:00 GMT",
                            commit=False, out=io.StringIO())
    assert results[0]["status"] == "open" and "no instrument" in results[0]["detail"]
    with pytest.raises(ValueError):
        update.update(repo, FakeFetch(), TODAY, row="eu-cellar:2026-03-18", commit=False, out=io.StringIO())  # rejected row


def test_commit_flow_makes_one_commit_on_an_upkeep_branch_and_never_touches_main(tmp_path):
    repo = make(tmp_path)
    main_before = git(repo, "rev-parse", "main")
    out = io.StringIO()
    results = update.update(repo, FakeFetch(), TODAY, row=EU_KEY, out=out)
    assert results[0]["status"] == "stored" and results[0]["branch"] == EU_BRANCH
    assert git(repo, "rev-parse", "main") == main_before
    assert git(repo, "symbolic-ref", "--short", "HEAD") == "main"
    assert git(repo, "status", "--porcelain") == ""
    assert git(repo, "rev-list", "--count", f"main..{EU_BRANCH}") == "1"
    assert git(repo, "diff", "--name-only", "main", EU_BRANCH).splitlines() == [
        "SOURCES.md", "records/EU/eu-act/2027-01-01-consolidated-en.json", "register/EU/scope.json", "upkeep/queue.csv"]
    body = git(repo, "log", "-1", "--format=%B", EU_BRANCH)
    assert body.startswith("upkeep: eu-act 2027-01-01 (consolidated)") and f"Queue-row: {EU_KEY}" in body
    assert "placeholder consolidated text" in git(repo, "show", f"{EU_BRANCH}:records/EU/eu-act/2027-01-01-consolidated-en.json")
    assert rows(repo)[EU_KEY]["outcome"] == "confirm"  # main's queue is untouched; the stored mark is on the branch
    printed = out.getvalue()
    assert f"git push -u origin {EU_BRANCH}" in printed and f"gh pr create --head {EU_BRANCH}" in printed
    assert "not pushed" in printed and git(repo, "remote") == ""
    # a second run finds the branch and leaves the row open instead of stacking commits
    again = update.update(repo, FakeFetch(), TODAY, row=EU_KEY, out=io.StringIO())
    assert again[0]["status"] == "open" and "already exists" in again[0]["detail"]
    assert git(repo, "rev-list", "--count", f"main..{EU_BRANCH}") == "1"


def test_each_row_gets_its_own_branch_from_the_starting_branch(tmp_path):
    repo = make(tmp_path)
    results = update.update(repo, FakeFetch(), TODAY, out=io.StringIO())
    branches = [r["branch"] for r in results if r["status"] == "stored"]
    assert branches == [EU_BRANCH, "upkeep/GB-gb-sec-2027-02-02", "upkeep/GB-gb-si-2027-02-03", "upkeep/US-us-part-2027-03-03"]
    for branch in branches:
        assert git(repo, "rev-list", "--count", f"main..{branch}") == "1"
        assert git(repo, "merge-base", "main", branch) == git(repo, "rev-parse", "main")
        # each branch marks its own row only
        diff = [l for l in git(repo, "diff", "main", branch, "--", "upkeep/queue.csv").splitlines() if l.startswith(("+2026", "-2026"))]
        assert len(diff) == 2 and "stored" in diff[1] and branch.split("-", 1)[1][:-11] in diff[1]
    # the refusals of the same run stay in the working tree of the starting branch, uncommitted
    assert git(repo, "status", "--porcelain") == "M upkeep/queue.csv" and git(repo, "symbolic-ref", "--short", "HEAD") == "main"
    got = rows(repo)
    assert got["in-sebi:2027-05-05"]["notes"].startswith("refused 2026-11-02: source IN-SEBI-ADOPTED")
    assert got["eu-banned:2027-06-06"]["notes"].startswith("refused 2026-11-02: gate:")
    assert [k for k, r in got.items() if r["outcome"] == "stored"] == []
    assert not (repo / "records" / "GB" / "gb-si").exists()  # committed on its branch, gone from main's tree


def test_commit_flow_refuses_to_sweep_uncommitted_changes(tmp_path):
    repo = make(tmp_path)
    (repo / "SOURCES.md").write_text("# Sources\n\nedited by hand\n")
    with pytest.raises(ValueError) as exc:
        update.update(repo, FakeFetch(), TODAY, row=EU_KEY, out=io.StringIO())
    assert "--no-commit" in str(exc.value) and "SOURCES.md" in str(exc.value)
    assert git(repo, "branch", "--list", "upkeep/*") == ""


def test_build_without_branch_on_populated_repo_exits_2(tmp_path):
    repo = make(tmp_path)
    update.update(repo, FakeFetch(), TODAY, row=EU_KEY, commit=False, out=io.StringIO())
    count = git(repo, "rev-list", "--count", "main")
    run = subprocess.run([sys.executable, str(ROOT / "tools" / "build.py"), "--repo", str(repo)], capture_output=True, text=True)
    assert run.returncode == 2 and run.stdout == ""
    assert run.stderr.count("\n") == 1 and "--branch" in run.stderr and "records/ is tracked" in run.stderr
    assert git(repo, "rev-list", "--count", "main") == count and git(repo, "status", "--porcelain").startswith("")
    with pytest.raises(build.BranchRequired):
        build.build(repo)
    run = subprocess.run([sys.executable, str(ROOT / "tools" / "build.py"), "--repo", str(repo), "--branch", "history"],
                         capture_output=True, text=True)
    assert run.returncode == 0 and git(repo, "rev-list", "--count", "history") == "4"


def test_rebuilt_history_hash_matches_across_two_runs_with_upkeep_record(tmp_path):
    repo = make(tmp_path)
    update.update(repo, FakeFetch(), TODAY, commit=False, out=io.StringIO())
    order = build.build(repo, branch="history")
    first = git(repo, "rev-parse", "history")
    assert build.build(repo, branch="history") == order
    assert git(repo, "rev-parse", "history") == first
    log = git(repo, "log", "--reverse", "--format=%(trailers:key=In-force,valueonly)", "history").split()
    assert log == ["2016-12-26", "2017-01-01", "2023-01-05", "2027-01-01", "2027-02-02", "2027-02-03", "2027-03-03"]
    assert log == sorted(log)
    assert git(repo, "show", "-s", "--format=%ad", "--date=short", "history") == "2027-03-03"


def test_dry_run_fetches_and_writes_nothing(tmp_path):
    repo = make(tmp_path)
    before = tree(repo)
    fetch = FakeFetch()
    out = io.StringIO()
    results = update.update(repo, fetch, TODAY, dry_run=True, out=out)
    assert fetch.calls == [] and tree(repo) == before
    assert git(repo, "branch", "--list", "upkeep/*") == "" and git(repo, "status", "--porcelain") == ""
    assert {r["status"] for r in results} <= {"planned", "open"}
    planned = {r["key"]: r["detail"] for r in results if r["status"] == "planned"}
    assert planned[EU_KEY] == (f"would fetch {EU_URL}, write records/EU/eu-act/2027-01-01-consolidated-en.json, "
                               f"mark eu-act stored in register/EU/scope.json, add a SOURCES.md line, commit to {EU_BRANCH}")
    assert planned["in-sebi:2027-05-05"].startswith("would refuse: source IN-SEBI-ADOPTED verdict")
    assert rows(repo)["in-sebi:2027-05-05"]["notes"] == ""
    assert "us-fr:2027-04-04: no recipe for US-FEDREG-ADOPTED" in out.getvalue()


def test_cli_exit_codes_and_summary(tmp_path, capsys, monkeypatch):
    repo = make(tmp_path)
    monkeypatch.setattr(update, "default_fetch", FakeFetch())
    assert update.main(["--repo", str(repo), "--row", EU_KEY, "--no-commit"]) == 0
    assert capsys.readouterr().out.splitlines()[-1] == "1 rows: 1 stored, 0 refused, 0 left open"
    assert update.main(["--repo", str(repo), "--dry-run"]) == 1
    assert capsys.readouterr().out.splitlines()[-1] == "7 rows: 0 stored, 0 refused, 2 left open, 5 planned (dry run)"
    assert update.main(["--repo", str(repo), "--row", "nope:1"]) == 1
    assert "no confirmed new_version row 'nope:1'" in capsys.readouterr().err


def test_sources_line_lands_inside_an_existing_upkeep_section(tmp_path):
    path = tmp_path / "SOURCES.md"
    path.write_text("# Sources\n\n### upkeep\n\nIntro.\n\n- first line.\n\n## Later\n\nText.\n")
    update.add_sources_line(path, "- second line.")
    assert path.read_text() == "# Sources\n\n### upkeep\n\nIntro.\n\n- first line.\n- second line.\n\n## Later\n\nText.\n"


def test_extract_text_strips_tags_drops_subtrees_and_tabs_cells():
    assert update.extract_text(EU_BODY, ("head",)) == "placeholder consolidated text\n\nsecond placeholder paragraph\n"
    assert update.extract_text(GB_BODY, ("metadata",)) == "placeholder section text\n"
    assert update.extract_text(US_BODY) == "PART 98 placeholder\n\nplaceholder part text\n\ncell one\tcell two\n"
    assert update.extract_text(b"<p>a &amp; b\n   c</p>") == "a & b c\n"
