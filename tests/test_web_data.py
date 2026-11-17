import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import query
import web_data
from conftest import NO_HISTORY
from test_build import PROVENANCE
from test_law import make as make_history

READ_ON = "2026-11-17"
FORBIDDEN = ('"text"', '"evidence"', '"notes"', '"source_row"')


def make(tmp_path, extra=()):
    """The test_law fixture plus one commit on the working branch, which the snapshot header needs."""
    repo = make_history(tmp_path, extra)
    subprocess.run(["git", "-C", str(repo), "add", "-A"], check=True)
    subprocess.run(["git", "-C", str(repo), "commit", "-qm", "fixture"], check=True)
    return repo


def edit_scope(repo, change):
    path = repo / "register" / "EU" / "scope.json"
    entries = json.loads(path.read_text())
    change(entries)
    path.write_text(json.dumps(entries))


def entry_of(data, instrument):
    return next(e for e in data["entries"] if e["id"] == instrument)


def test_follows_history_not_working_tree(tmp_path):
    repo = make(tmp_path)
    (repo / "records" / "EU" / "law2" / "late.json").write_text(json.dumps(
        {"source_id": "new", "in_force": "2030-01-01", "kind": "adopted", "language": "en", "text": "late", **PROVENANCE}))
    data = web_data.build(repo, "history", READ_ON)
    assert data["coverage"]["status"] == "history trails working tree"
    assert [v["in_force"] for v in entry_of(data, "law2")["versions"]] == ["2020-03-04"]
    assert sum(len(e["versions"]) for e in data["entries"]) == 2


def test_snapshot_records_commit_and_read_on(tmp_path):
    repo = make(tmp_path)
    data = web_data.build(repo, "history", READ_ON)
    head = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "history"], text=True).strip()
    assert data["snapshot"]["history_commit"] == head
    assert data["snapshot"]["history_ref"] == "history"
    assert data["snapshot"]["read_on"] == READ_ON
    assert data["snapshot"]["working_tree_commit"]
    assert data["notice"] == query.NOTICE
    assert data["places"] == {"EU": "EU"}
    assert data["coverage"]["status"] == "matches working tree"


def test_read_on_defaults_to_today_and_rejects_bad_date(tmp_path):
    repo = make(tmp_path)
    from datetime import date
    assert web_data.build(repo, "history")["snapshot"]["read_on"] == date.today().isoformat()
    with pytest.raises(ValueError):
        web_data.build(repo, "history", "2026-13-01")


def test_cli_requires_ref(tmp_path):
    out = tmp_path / "x.json"
    run = subprocess.run([sys.executable, str(ROOT / "tools" / "web_data.py"), "--out", str(out)],
                         capture_output=True, text=True)
    assert run.returncode != 0
    assert "--ref" in run.stderr
    assert not out.exists()


def test_cli_writes_identical_files(tmp_path):
    repo = make(tmp_path / "repo")
    paths = [tmp_path / "a.json", tmp_path / "b.json"]
    for path in paths:
        assert web_data.main(["--repo", str(repo), "--ref", "history", "--read-on", READ_ON, "--out", str(path)]) == 0
    assert paths[0].read_bytes() == paths[1].read_bytes()
    assert json.loads(paths[0].read_text())["snapshot"]["read_on"] == READ_ON


def test_cli_bad_ref_exits_non_zero(tmp_path, capsys):
    repo = make(tmp_path / "repo")
    assert web_data.main(["--repo", str(repo), "--ref", "nope", "--out", str(tmp_path / "o.json")]) == 1
    assert not (tmp_path / "o.json").exists()


def test_link_only_entries_and_register_date(tmp_path):
    repo = make(tmp_path)
    edit_scope(repo, lambda e: e.extend([
        {"id": "dated", "title": "Dated", "status": "link only", "in_force": "2019-05-06", "official_url": "https://example.org/d"},
        {"id": "undated", "title": "Undated", "status": "link only", "official_url": "https://example.org/u"}]))
    data = web_data.build(repo, "history", READ_ON)
    dated, undated = entry_of(data, "dated"), entry_of(data, "undated")
    assert dated["versions"] == [] and dated["register_date"] == "2019-05-06" and dated["status"] == "link only"
    assert undated["versions"] == [] and "register_date" not in undated
    stored = entry_of(data, "law")
    assert "register_date" not in stored and len(stored["versions"]) == 1


def test_repeal_message_archive_and_no_stray_keys(tmp_path):
    repo = make(tmp_path)
    edit_scope(repo, lambda e: e[1].update(official_url="https://web.archive.org/web/2020/https://example.org/x"))
    folder = repo / "records" / "EU" / "law2"
    for name, when, message in (("r1", "2021-06-01", "Repealed by Act 9"), ("r2", "2022-06-01", None)):
        record = {"source_id": "new", "in_force": when, "kind": "adopted", "language": "en", "text": "", "repealed": True, **PROVENANCE}
        if message:
            record["message"] = message
        (folder / f"{name}.json").write_text(json.dumps(record))
    from test_build import build
    build.build(repo, branch="history")
    data = web_data.build(repo, "history", READ_ON)
    versions = entry_of(data, "law2")["versions"]
    repeals = {v["in_force"]: v for v in versions if v["kind"] == "repeal"}
    assert repeals["2021-06-01"]["message"] == "Repealed by Act 9"
    assert "message" not in repeals["2022-06-01"]
    assert all(v["copy"] == "archive" for v in versions)
    assert all("copy" not in v for v in entry_of(data, "law")["versions"])
    assert all("message" not in v for e in data["entries"] for v in e["versions"] if v["kind"] != "repeal")
    raw = web_data.dumps(data)
    assert not any(word in raw for word in FORBIDDEN)


def test_archive_host_rule_ignores_look_alikes(tmp_path):
    repo = make(tmp_path)
    edit_scope(repo, lambda e: e[0].update(official_url="https://archive.org.example.com/x?u=web.archive.org"))
    from test_build import build
    build.build(repo, branch="history")
    assert all("copy" not in v for v in entry_of(web_data.build(repo, "history", READ_ON), "law")["versions"])


def test_labels_and_scope_fields_pass_through(tmp_path):
    repo = make(tmp_path)
    edit_scope(repo, lambda e: e[1].update(applies_from="2021-01-01", applies_note="phased", aliases=["Two"], amends_ids=["law"]))
    data = web_data.build(repo, "history", READ_ON)
    one, two = entry_of(data, "law"), entry_of(data, "law2")
    assert two["status_note"] == "stayed by a court" and two["applies_from"] == "2021-01-01"
    assert two["aliases"] == ["Two"] and two["amends_ids"] == ["law"] and two["applies_note"] == "phased"
    assert "status_note" not in one and "aliases" not in one and "amends_ids" not in one
    assert (one["tier"], one["verification"], one["unverified"], one["tier_label"]) == ("not available", "not available", True, "not available")


def test_entries_sorted_and_keys_sorted(tmp_path):
    repo = make(tmp_path)
    data = web_data.build(repo, "history", READ_ON)
    assert [(e["place"], e["id"]) for e in data["entries"]] == sorted((e["place"], e["id"]) for e in data["entries"])
    raw = web_data.dumps(data)
    assert raw == json.dumps(json.loads(raw), sort_keys=True, ensure_ascii=False, separators=(",", ":")) + "\n"


# --- real data: reads origin/history; skipped without it (a skip fails CI) ---
REF = "origin/history"


@pytest.fixture(scope="module")
def real():
    if subprocess.run(["git", "-C", str(ROOT), "rev-parse", "--verify", "--quiet", f"{REF}^{{commit}}"],
                      capture_output=True).returncode:
        pytest.skip(NO_HISTORY)
    return web_data.build(ROOT, REF, READ_ON)


def test_real_counts_match_the_sources(real):
    history = query._commits(ROOT, REF)
    scope = [e for p in ROOT.glob("register/*/scope.json") for e in json.loads(p.read_text())]
    entries = real["entries"]
    assert len(entries) == len(scope) == len({e["id"] for e in entries})
    assert sum(len(e["versions"]) for e in entries) == len(history)
    assert sum(1 for e in entries if e["versions"]) == len({c["id"] for c in history})
    assert sum(1 for e in entries if e["status"] == "link only") == sum(1 for e in scope if e["status"] == "link only")
    assert sum(1 for e in entries if "register_date" in e) == sum(1 for e in scope if e["status"] == "link only" and e.get("in_force"))
    assert all(not e["versions"] for e in entries if e["status"] == "link only")
    assert len(real["places"]) == len(list(ROOT.glob("register/*/scope.json")))
    assert real["snapshot"]["history_commit"] == query._head(ROOT, REF)
    assert real["coverage"]["status"] == query.envelope(ROOT, REF)[0]["coverage"]["status"]
    assert sum(1 for e in entries for v in e["versions"] if v["kind"] == "repeal") == sum(1 for c in history if c["kind"] == "repeal")
    assert sum(1 for e in entries for v in e["versions"] if v.get("date_basis") == "publication") == \
        sum(1 for c in history if c.get("date_basis") == "publication")
    assert sum(1 for e in entries if e["tier"] == "not available") < len(entries) // 10
    assert not any(word in web_data.dumps(real) for word in FORBIDDEN)


def test_real_repeal_messages_and_no_archive_rows(real):
    repeals = [v for e in real["entries"] for v in e["versions"] if v["kind"] == "repeal"]
    assert all(v.get("message") != "" for v in repeals)
    assert {v["commit"] for v in repeals if "message" not in v} == \
        {v["commit"] for e in real["entries"] if e["id"] in ("ie-si-490-2012", "ie-si-755-2020") for v in e["versions"] if v["kind"] == "repeal"}
    assert all("message" not in v for e in real["entries"] for v in e["versions"] if v["kind"] != "repeal")
    assert sum("copy" in v for e in real["entries"] for v in e["versions"]) == \
        sum("archive.org" in (c.get("source_url") or "") for c in query._commits(ROOT, REF))


def five_samples(real):
    """One stored, one link only, one repealed, one publication-dated, one with two rows on one date."""
    entries = real["entries"]
    def shared_date(e):
        dates = [v["in_force"] for v in e["versions"] if v["kind"] != "repeal"]
        return len(dates) != len(set(dates))
    picks = {
        "stored": next(e for e in entries if e["versions"] and e["id"] == "eu-csrd-2022-2464"),
        "link only": next(e for e in entries if e["status"] == "link only" and "register_date" in e),
        "repealed": next(e for e in entries if any(v["kind"] == "repeal" for v in e["versions"])),
        "publication-dated": next(e for e in entries if any(v.get("date_basis") == "publication" for v in e["versions"])),
        "shared-date": next(e for e in entries if shared_date(e)),
    }
    return picks


def test_real_five_entries_match_law_py(real):
    import law  # noqa: F401  (same lookup the command line uses)
    for label, e in five_samples(real).items():
        place = e["place"]
        if not e["versions"]:
            answer = query.law_in_force(ROOT, place, READ_ON, ref=REF)
            row = next(x for x in answer["link_only"] if x["id"] == e["id"])
            for key in ("official_url", "law_family", "duty_on", "tier", "verification", "unverified", "tier_label"):
                assert row[key] == e[key], (label, key)
            continue
        repeals = [v for v in e["versions"] if v["kind"] == "repeal"]
        last = max(v["in_force"] for v in e["versions"] if v["kind"] != "repeal")
        on = last if not repeals else max(v["in_force"] for v in repeals)
        found = {i["id"]: i for i in query.law_in_force(ROOT, place, on, ref=REF)["in_force"]}
        if repeals and on >= repeals[-1]["in_force"] and max(v["in_force"] for v in e["versions"]) == on:
            assert e["id"] not in found, label
            continue
        item = found[e["id"]]
        match = [v for v in e["versions"] if v["commit"] == item["commit"]]
        assert match, label
        for key in ("in_force", "kind", "source_url", "licence", "date_basis"):
            assert match[0].get(key) == item.get(key), (label, key)
        for key in ("tier", "verification", "unverified", "tier_label", "official_url", "law_family", "duty_on"):
            assert item[key] == e[key], (label, key)
        for key in ("status_note", "applies_from", "applies_note"):
            assert item.get(key) == e.get(key), (label, key)
