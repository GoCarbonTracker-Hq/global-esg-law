import json
import subprocess
from datetime import date
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build
from conftest import real_scope_paths


def fixture(repo):
    (repo / "records" / "EU" / "law").mkdir(parents=True)
    (repo / "records" / "EU" / "law2").mkdir(parents=True)
    rows = [
        {"id": "old", "verdict": "pass", "form": "adopted", "publisher": "P", "source_name": "S", "trailer_instrument": "Old Act", "trailer_source_url": "https://example.org/old", "trailer_licence": "CC0"},
        {"id": "new", "verdict": "pass", "form": "adopted", "publisher": "P", "source_name": "S", "trailer_instrument": "New Act", "trailer_source_url": "https://example.org/new", "trailer_licence": "OGL"},
    ]
    (repo / "sources.json").write_text(json.dumps(rows))
    (repo / "register" / "EU").mkdir(parents=True)
    (repo / "register" / "EU" / "scope.json").write_text(json.dumps([
        {"id": "law", "title": "Scope Title", "official_url": "https://example.org/scope", "source_row": "old"},
        {"id": "law2", "title": "Scope Title", "official_url": "https://example.org/scope", "source_row": "new"}]))
    for name, source, effective in [("old", "old", "1965-01-02"), ("new", "new", "2020-03-04")]:
        (repo / "records" / "EU" / ("law" if name == "old" else "law2") / f"{name}.json").write_text(json.dumps({"source_id": source, "in_force": effective, "kind": "adopted", "language": "en", "text": name}))
    subprocess.run(["git", "init", "-q", str(repo)], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.name", "Test"], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.email", "test@example.org"], check=True)


def test_build_trailers_order_and_rebuild(tmp_path):
    histories = []
    for name in ("one", "two"):
        repo = tmp_path / name
        repo.mkdir()
        fixture(repo)
        assert build.build(repo) == [("1965-01-02", "Scope Title"), ("2020-03-04", "Scope Title")]
        commits = subprocess.check_output(["git", "-C", str(repo), "log", "--reverse", "--format=%H"], text=True).splitlines()
        history = []
        for commit in commits:
            body = subprocess.check_output(["git", "-C", str(repo), "show", "-s", "--format=%B", commit], text=True)
            trailers = dict(line.split(": ", 1) for line in body.splitlines() if ": " in line)
            assert {"Instrument", "Source-url", "In-force", "Kind", "Licence", "Jurisdiction", "Instrument-id"} <= trailers.keys()
            assert (trailers["Jurisdiction"], trailers["Instrument-id"]) == ("EU", "law" if trailers["In-force"] == "1965-01-02" else "law2")
            history.append((trailers["In-force"], trailers["Instrument"]))
        assert history == [("1965-01-02", "Scope Title"), ("2020-03-04", "Scope Title")]
        histories.append(history)
    assert histories[0] == histories[1]


def test_language_trailer_and_official_record_first(tmp_path):
    fixture(tmp_path)
    rows = json.loads((tmp_path / "sources.json").read_text())
    rows.append({**rows[1], "id": "tr", "form": "translation"})
    (tmp_path / "sources.json").write_text(json.dumps(rows))
    folder = tmp_path / "records" / "EU" / "law2"
    for name, source, kind, lang in [("a-en", "tr", "translation", "en"), ("b-fr", "new", "adopted", "fr"), ("c-de", "new", "adopted", "de")]:
        (folder / f"2024-01-01-{name}.json").write_text(json.dumps(
            {"source_id": source, "in_force": "2024-01-01", "kind": kind, "language": lang, "text": name}))
    scope = tmp_path / "register" / "EU" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[1]["source_row"] = ["new", "tr"]
    scope.write_text(json.dumps(entries))
    build.build(tmp_path, branch="history")
    log = subprocess.check_output(["git", "-C", str(tmp_path), "log", "--reverse", "--format=%(trailers:key=Kind,valueonly)%(trailers:key=Language,valueonly)", "history"], text=True)
    assert log.split() == ["adopted", "en", "adopted", "en", "adopted", "de", "adopted", "fr", "translation", "en"]


def test_null_in_force_orders_by_file_name_date(tmp_path):
    fixture(tmp_path)
    folder = tmp_path / "records" / "EU" / "law2"
    (folder / "1990-06-07-null.json").write_text(json.dumps(
        {"source_id": "new", "in_force": None, "kind": "adopted", "language": "en", "text": "null"}))
    assert build.build(tmp_path, branch="history") == [("1965-01-02", "Scope Title"), ("1990-06-07", "Scope Title"), ("2020-03-04", "Scope Title")]


def test_branch_build_is_orphan_and_rebuild_equal(tmp_path):
    fixture(tmp_path)
    def snapshot():
        log = subprocess.check_output(["git", "-C", str(tmp_path), "log", "--first-parent", "--reverse", "--format=%an|%ad|%B", "--date=iso-strict", "history"], text=True)
        tree = subprocess.check_output(["git", "-C", str(tmp_path), "rev-parse", "history^{tree}"], text=True)
        return log, tree
    build.build(tmp_path, branch="history")
    first = snapshot()
    build.build(tmp_path, branch="history")
    assert snapshot() == first
    assert subprocess.check_output(["git", "-C", str(tmp_path), "rev-list", "--count", "history"], text=True).strip() == "2"
    assert subprocess.run(["git", "-C", str(tmp_path), "rev-parse", "HEAD"], capture_output=True).returncode != 0  # nothing committed on the current branch
    assert subprocess.check_output(["git", "-C", str(tmp_path), "show", "history:records/EU/law/old.json"], text=True)
    assert subprocess.check_output(["git", "-C", str(tmp_path), "status", "--porcelain"], text=True) == "?? records/\n?? register/\n?? sources.json\n"


def test_branch_required_once_records_are_tracked(tmp_path):
    fixture(tmp_path)
    build.build(tmp_path)  # an empty repo (nothing tracked under records/) still builds without a branch
    assert subprocess.check_output(["git", "-C", str(tmp_path), "rev-list", "--count", "HEAD"], text=True).strip() == "2"
    subprocess.run(["git", "-C", str(tmp_path), "add", "-A"], check=True)
    subprocess.run(["git", "-C", str(tmp_path), "commit", "-q", "-m", "track everything"], check=True)
    head = subprocess.check_output(["git", "-C", str(tmp_path), "rev-parse", "HEAD"], text=True)
    try:
        build.build(tmp_path)
    except build.BranchRequired as exc:
        assert "--branch" in str(exc)
    else:
        raise AssertionError("build without a branch ran on a populated repo")
    run = subprocess.run([sys.executable, str(ROOT / "tools" / "build.py"), "--repo", str(tmp_path)], capture_output=True, text=True)
    assert run.returncode == 2 and run.stdout == ""
    assert run.stderr == "records/ is tracked by git: --branch is required (python3 tools/build.py --branch history)\n"
    assert subprocess.check_output(["git", "-C", str(tmp_path), "rev-parse", "HEAD"], text=True) == head
    assert subprocess.check_output(["git", "-C", str(tmp_path), "status", "--porcelain"], text=True) == ""
    assert build.main(["--repo", str(tmp_path), "--branch"]) == 2  # a flag with no value is no flag
    assert build.main(["--repo", str(tmp_path), "--branch", "history"]) == 0
    assert subprocess.check_output(["git", "-C", str(tmp_path), "rev-list", "--count", "history"], text=True).strip() == "2"
    assert subprocess.check_output(["git", "-C", str(tmp_path), "rev-parse", "HEAD"], text=True) == head


def test_trailers_come_from_scope_json(tmp_path):
    fixture(tmp_path)
    build.build(tmp_path)
    body = subprocess.check_output(["git", "-C", str(tmp_path), "log", "-1", "--format=%B"], text=True)
    assert "Instrument: Scope Title" in body and "Source-url: https://example.org/scope" in body
    assert "Licence: OGL" in body


def test_build_refuses_instrument_missing_from_scope(tmp_path):
    fixture(tmp_path)
    (tmp_path / "register" / "EU" / "scope.json").write_text("[]")
    try:
        build.build(tmp_path)
    except ValueError as exc:
        assert "scope.json" in str(exc)
    else:
        raise AssertionError("record without scope entry was accepted")


def test_build_refuses_nonpass_row(tmp_path):
    repo = tmp_path / "blocked"
    repo.mkdir()
    fixture(repo)
    rows = json.loads((repo / "sources.json").read_text())
    rows[0]["verdict"] = "unknown"
    (repo / "sources.json").write_text(json.dumps(rows))
    try:
        build.build(repo)
    except ValueError as exc:
        assert "old" in str(exc)
    else:
        raise AssertionError("non-pass source row was accepted")


def test_scope_lists_match_sources_and_register():
    import csv
    rows = {r["id"]: r for r in json.loads((ROOT / "sources.json").read_text())}
    register = {(r["iso2"], r["official_source_url"], r["law_family"]) for r in csv.DictReader((ROOT / "register" / "register.csv").open(encoding="utf-8"))}
    for scope_path in real_scope_paths(ROOT):
        iso2 = scope_path.parent.name
        entries = json.loads(scope_path.read_text())
        assert len({e["id"] for e in entries}) == len(entries)
        for e in entries:
            assert e["status"] in ("stored", "link only", "pending")
            ids = e["source_row"] if isinstance(e["source_row"], list) else [e["source_row"]]
            # a row that is not pass forces link only; a pass row can still be link only when the fetch was blocked
            # or the source text is unusable (wave 1: NZ ETS regulations, ZA companies regulations, B-BBEE Act)
            if any(rows[i]["verdict"] != "pass" for i in ids):
                assert e["status"] == "link only", e["id"]
            assert e["law_family"] in ("F1", "F2", "F3", "F4", "F5", "F6", "F7")
            assert (iso2, e["official_url"], e["law_family"]) in register
            assert e["in_force"] is None or date.fromisoformat(e["in_force"])
