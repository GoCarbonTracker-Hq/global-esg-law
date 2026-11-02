"""One test per outcome of the upkeep flow: new instrument, amended, repealed, blocked by licence.

Every fixture is in this file; all text is placeholder text. Each test runs the flow on a repository
under tmp_path, then rebuilds `history` and asks tools/law.py what the dated commits say.
"""
import csv
import io
import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build
import check_corpus
import law
import update
import watch

TODAY = "2026-11-02"
CELLAR = "https://publications.europa.eu/resource/celex/"
NEW_URL = CELLAR + "02099L0002-20270201"
AMEND_URL = CELLAR + "02099L0001-20270101"
BODY = b"<html><head><title>dropped</title></head><body><p>placeholder consolidated text</p></body></html>"
EVIDENCE = "https://example.invalid/evidence"


def source(sid, form, verdict="pass"):
    return {"id": sid, "verdict": verdict, "form": form, "publisher": "P", "source_name": "S",
            "trailer_instrument": sid, "trailer_source_url": f"https://example.invalid/{sid}", "trailer_licence": "CC0"}


SOURCES = [source("EU-EURLEX-CONSOLIDATED", "consolidated"), source("EU-EURLEX-ADOPTED", "adopted"),
           source("XX-BLOCKED", "adopted", "permission requested")]


def entry(iid, source_row, citation, status, **extra):
    return {"id": iid, "title": f"Placeholder {iid}", "official_url": f"https://example.invalid/eli/{iid}",
            "citation": citation, "in_force": "2020-01-01", "source_row": source_row, "status": status, **extra}


SCOPE = [entry("old-act", "EU-EURLEX-CONSOLIDATED", "32099L0001", "stored"),
         entry("new-act", "EU-EURLEX-CONSOLIDATED", "32099L0002", "pending"),
         entry("amend-act", "EU-EURLEX-ADOPTED", "32099L0003", "stored", amends="old-act"),
         entry("blocked-act", "XX-BLOCKED", "", "link only")]

RECORDS = {"old-act/2020-01-01-consolidated.json": {"source_id": "EU-EURLEX-CONSOLIDATED", "in_force": "2020-01-01",
                                                    "kind": "consolidated", "text": "placeholder text"},
           "amend-act/2024-06-01-adopted.json": {"source_id": "EU-EURLEX-ADOPTED", "in_force": "2024-06-01",
                                                 "kind": "adopted", "text": "placeholder amending text"}}


def queue_row(watcher_id, signal, instrument, source_id, change="new_version"):
    return {"detected_on": TODAY, "watcher_id": watcher_id, "iso2": "EU", "source_id": source_id,
            "instrument": instrument, "change": change, "signal": signal, "evidence_url": EVIDENCE,
            "reviewer": "varun", "outcome": "confirm", "outcome_on": TODAY, "notes": ""}


NEW, AMENDED, REPEALED, BAD_REPEAL, BLOCKED, BLOCKED_REPEAL = (
    "w-new:2027-02-01", "w-old:2027-01-01", "w-old:2028-03-01", "w-old:spring 2028",
    "w-blocked:2027-05-05", "w-blocked:2027-06-06")
QUEUE = [queue_row("w-new", "2027-02-01", "new-act", "EU-EURLEX-CONSOLIDATED"),
         queue_row("w-old", "2027-01-01", "old-act", "EU-EURLEX-CONSOLIDATED"),
         queue_row("w-old", "2028-03-01", "old-act", "EU-EURLEX-CONSOLIDATED", change="repealed"),
         queue_row("w-old", "spring 2028", "old-act", "EU-EURLEX-CONSOLIDATED", change="repealed"),
         queue_row("w-blocked", "2027-05-05", "blocked-act", "XX-BLOCKED"),
         queue_row("w-blocked", "2027-06-06", "blocked-act", "XX-BLOCKED", change="repealed")]


class FakeFetch:
    def __init__(self):
        self.calls = []

    def __call__(self, url, headers):
        self.calls.append(url)
        return 200, BODY


def git(repo, *args):
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()


def make(repo):
    """Repository on branch main: two placeholder records committed, a queue of confirmed rows."""
    (repo / "sources.json").write_text(json.dumps(SOURCES))
    (repo / "register" / "EU").mkdir(parents=True)
    (repo / "register" / "EU" / "scope.json").write_text(json.dumps(SCOPE, indent=2) + "\n")
    for rel, record in RECORDS.items():
        path = repo / "records" / "EU" / rel
        path.parent.mkdir(parents=True)
        path.write_text(json.dumps(record))
    (repo / "SOURCES.md").write_text("# Sources\n")
    (repo / "upkeep").mkdir()
    with (repo / "upkeep" / "queue.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=update.COLUMNS, lineterminator="\r\n")
        writer.writeheader()
        writer.writerows(QUEUE)
    subprocess.run(["git", "init", "-q", str(repo)], check=True)
    git(repo, "symbolic-ref", "HEAD", "refs/heads/main")
    git(repo, "config", "user.name", "Test")
    git(repo, "config", "user.email", "test@example.org")
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", "fixture")
    return repo


def run(repo, key, fetch=None):
    fetch = fetch or FakeFetch()
    results = update.update(repo, fetch, TODAY, row=key, commit=False, out=io.StringIO())
    return results[0], fetch


def rows(repo):
    with (repo / "upkeep" / "queue.csv").open(newline="", encoding="utf-8") as handle:
        return {update.row_key(r): r for r in csv.DictReader(handle)}


def tree(repo):
    return {p.relative_to(repo).as_posix(): p.read_bytes() for p in repo.rglob("*") if p.is_file() and ".git/" not in p.as_posix()}


def history(repo):
    """[(sha, In-force, Kind, Instrument-id)] of the history branch, oldest first."""
    out = git(repo, "log", "--reverse", "--format=%H%x1f%(trailers:key=In-force,valueonly)%x1f"
                                        "%(trailers:key=Kind,valueonly)%x1f%(trailers:key=Instrument-id,valueonly)%x1e", "history")
    return [tuple(f.strip() for f in chunk.split("\x1f")) for chunk in out.split("\x1e") if chunk.strip()]


def ids(found):
    return [i["id"] for i in found]


def test_new_instrument_first_record_for_an_id(tmp_path):
    repo = make(tmp_path)
    result, fetch = run(repo, NEW)
    assert result["status"] == "stored" and fetch.calls == [NEW_URL]
    path = repo / "records" / "EU" / "new-act" / "2027-02-01-consolidated.json"
    record = json.loads(path.read_text())
    assert record["text"] == "placeholder consolidated text\n" and "repealed" not in record
    assert check_corpus.check(repo) == 3
    build.build(repo, branch="history")
    assert [(d, k, i) for _, d, k, i in history(repo)] == [
        ("2020-01-01", "consolidated", "old-act"), ("2024-06-01", "adopted", "amend-act"), ("2027-02-01", "consolidated", "new-act")]
    found, not_yet, _ = law.lookup("EU", "2027-01-31", repo)
    assert ids(found) == ["old-act", "amend-act"] and ids(not_yet) == ["new-act"]
    assert ids(law.in_force("EU", "2027-02-01", repo)) == ["old-act", "amend-act", "new-act"]


def test_amended_second_version_at_a_later_date(tmp_path, capsys):
    repo = make(tmp_path)
    result, fetch = run(repo, AMENDED)
    assert result["status"] == "stored" and fetch.calls == [AMEND_URL]
    folder = repo / "records" / "EU" / "old-act"
    assert sorted(p.name for p in folder.iterdir()) == ["2020-01-01-consolidated.json", "2027-01-01-consolidated.json"]
    assert json.loads((folder / "2020-01-01-consolidated.json").read_text())["text"] == "placeholder text"  # untouched
    build.build(repo, branch="history")
    assert [(d, i) for _, d, _, i in history(repo)] == [("2020-01-01", "old-act"), ("2024-06-01", "amend-act"), ("2027-01-01", "old-act")]
    before = {i["id"]: i for i in law.in_force("EU", "2026-12-31", repo)}
    after = {i["id"]: i for i in law.in_force("EU", "2027-01-01", repo)}
    assert before["old-act"]["in_force"] == "2020-01-01" and after["old-act"]["in_force"] == "2027-01-01"
    assert len(after) == 2  # one line per instrument, the latest version
    # the amending act is itself an instrument in scope; its entry carries `amends`
    assert after["amend-act"]["amends"] == "old-act" and "amends" not in after["old-act"]
    assert law.main(["EU", "2027-01-01", "--repo", str(repo)]) == 0
    lines = capsys.readouterr().out.splitlines()
    assert "amend-act\t2024-06-01\tadopted\tPlaceholder amend-act\tamends old-act" in lines
    assert not any(line.startswith("old-act") and "amends" in line for line in lines)
    assert law.main(["EU", "2027-01-01", "--repo", str(repo), "--json"]) == 0
    assert {i["id"]: i.get("amends") for i in json.loads(capsys.readouterr().out)["in_force"]} == {"old-act": None, "amend-act": "old-act"}


def test_repealed_empty_text_and_law_drops_it_from_that_date(tmp_path):
    repo = make(tmp_path)
    result, fetch = run(repo, REPEALED)
    assert result["status"] == "stored" and fetch.calls == []  # no fetch for a repeal
    path = repo / "records" / "EU" / "old-act" / "2028-03-01-repeal.json"
    assert json.loads(path.read_text()) == {"source_id": "EU-EURLEX-CONSOLIDATED", "in_force": "2028-03-01",
                                            "kind": "consolidated", "text": "", "repealed": True}
    assert check_corpus.check(repo) == 3
    assert rows(repo)[REPEALED]["outcome"] == "stored"
    assert f"repeal dated 2028-03-01, no fetch, evidence `{EVIDENCE}`, queue row `{REPEALED}`." in (repo / "SOURCES.md").read_text()
    build.build(repo, branch="history")
    assert [(d, k, i) for _, d, k, i in history(repo)] == [
        ("2020-01-01", "consolidated", "old-act"), ("2024-06-01", "adopted", "amend-act"), ("2028-03-01", "repeal", "old-act")]
    body = git(repo, "log", "-1", "--format=%B", "history")
    assert body.startswith("Placeholder old-act repealed 2028-03-01\n") and "Kind: repeal\n" in body
    assert "Licence: CC0" in body and "Instrument-id: old-act" in body
    assert ids(law.in_force("EU", "2028-02-29", repo)) == ["old-act", "amend-act"]
    assert ids(law.in_force("EU", "2028-03-01", repo)) == ["amend-act"]
    assert ids(law.in_force("EU", "2030-01-01", repo)) == ["amend-act"]
    assert law.lookup("EU", "2028-02-29", repo)[1] == []  # a coming repeal is not "not yet in force"
    # a repealed row whose signal is not a date is refused, with the reason in notes
    result, _ = run(repo, BAD_REPEAL)
    assert result["status"] == "refused"
    row = rows(repo)[BAD_REPEAL]
    assert row["outcome"] == "confirm" and row["notes"] == "refused 2026-11-02: signal 'spring 2028' is not a repeal date (YYYY-MM-DD)"
    assert sorted(p.name for p in (repo / "records" / "EU" / "old-act").iterdir()) == ["2020-01-01-consolidated.json", "2028-03-01-repeal.json"]


def test_blocked_by_licence_leaves_row_open_and_writes_nothing(tmp_path):
    repo = make(tmp_path)
    before = tree(repo)
    for key in (BLOCKED, BLOCKED_REPEAL):
        result, fetch = run(repo, key)
        assert result["status"] == "refused" and fetch.calls == []
        row = rows(repo)[key]
        assert row["outcome"] == "confirm" and row["reviewer"] == "varun"
        assert row["notes"] == "refused 2026-11-02: source XX-BLOCKED verdict is 'permission requested', not 'pass'"
    after = tree(repo)
    assert not (repo / "records" / "EU" / "blocked-act").exists()
    assert {k for k in set(after) | set(before) if after.get(k) != before.get(k)} == {"upkeep/queue.csv"}
    assert "blocked-act" not in (repo / "SOURCES.md").read_text()


def test_gate_refuses_empty_text_unless_repealed_is_true(tmp_path):
    repo = make(tmp_path)
    path = repo / "records" / "EU" / "old-act" / "2028-03-01-repeal.json"
    record = {"source_id": "EU-EURLEX-CONSOLIDATED", "in_force": "2028-03-01", "kind": "consolidated", "text": ""}
    for bad in (record, {**record, "repealed": False}, {**record, "repealed": "yes"}, {**record, "text": "  \n"}):
        path.write_text(json.dumps(bad))
        with pytest.raises(ValueError) as exc:
            check_corpus.check(repo)
        assert str(exc.value) == "records/EU/old-act/2028-03-01-repeal.json: empty text is allowed only with repealed: true"
    path.write_text(json.dumps({**record, "repealed": True}))
    assert check_corpus.check(repo) == 3


def test_repeal_record_leaves_every_earlier_commit_unchanged(tmp_path):
    repo = make(tmp_path)
    build.build(repo, branch="history")
    before = history(repo)
    assert len(before) == 2
    run(repo, REPEALED)
    build.build(repo, branch="history")
    after = history(repo)
    assert after[:2] == before  # same hashes: a repeal is a new dated commit, never an edit to history
    assert after[2][1:] == ("2028-03-01", "repeal", "old-act") and len(after) == 3
    assert git(repo, "show", "history:records/EU/old-act/2020-01-01-consolidated.json") == json.dumps(RECORDS["old-act/2020-01-01-consolidated.json"])


def test_watcher_may_set_change_repealed(tmp_path):
    repo = make(tmp_path)
    watcher = {"id": "w-old-repeals", "source_id": "EU-EURLEX-CONSOLIDATED", "iso2": "EU", "instrument": "old-act",
               "kind": "date_list", "url": "https://example.invalid/repeals.csv", "change": "repealed",
               "params": {"regex": r"repealed on (\d{4}-\d{2}-\d{2})"}}
    (repo / "upkeep" / "watchers.json").write_text(json.dumps([watcher]))
    (repo / "upkeep" / "seen.json").write_text(json.dumps({"w-old-repeals": {"signals": [], "failure": None, "checked_on": "2026-01-01"}}))
    fetch = lambda url, method="GET": (200, {}, b"placeholder list, repealed on 2028-03-01")
    result = watch.watch(repo, fetch, TODAY)
    assert [(r["change"], r["signal"], r["instrument"]) for r in result["rows"]] == [("repealed", "2028-03-01", "old-act")]
    assert rows(repo)["w-old-repeals:2028-03-01"]["change"] == "repealed"
    assert "repealed" in watch.CHANGES and "deleted" not in watch.CHANGES
