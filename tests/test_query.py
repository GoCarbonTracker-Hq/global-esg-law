import csv
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build
import query
import coverage
from test_coverage import make as coverage_fixture


def make_repo(tmp_path):
    repo = coverage_fixture(tmp_path)
    sources = json.loads((repo / "sources.json").read_text())
    sources[0]["form"] = "consolidated"
    sources[0]["trailer_licence"] = "CC0"
    (repo / "sources.json").write_text(json.dumps(sources))
    scope = repo / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    for entry in entries:
        entry["official_url"] = f"https://example.invalid/{entry['id']}"
    scope.write_text(json.dumps(entries))
    scope_dir = repo / "register" / "EE"
    scope_dir.mkdir()
    (scope_dir / "scope.json").write_text("[]")
    with (repo / "register" / "register.csv").open("a", newline="", encoding="utf-8") as handle:
        csv.writer(handle).writerow(["EE", "Empty Example", "", "", "", "", "", "", ""])
    subprocess.run(["git", "-C", str(repo), "init", "-q"], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.name", "Test"], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.email", "test@example.org"], check=True)
    subprocess.run(["git", "-C", str(repo), "add", "-A"], check=True)
    subprocess.run(["git", "-C", str(repo), "commit", "-qm", "fixture"], check=True)
    build.build(repo, branch="history")
    return repo


def count(report, label):
    return int(next(line.split("|")[2].strip() for line in report.splitlines()
                    if line.startswith(f"| {label} |")))


def test_list_places_reports_storage_start_and_coverage_totals(tmp_path):
    repo = make_repo(tmp_path)
    answer = query.list_places(repo)
    places = {place["iso2"]: place for place in answer["places"]}

    assert places["XX"]["status"] == "text stored"
    assert (places["XX"]["stored_count"], places["XX"]["link_only_count"]) == (1, 1)
    assert next(item for item in places["XX"]["instruments"] if item["id"] == "act")["first_in_force"] == "2020-01-01"
    assert places["EE"]["status"] == "empty scope file"
    report = coverage.build(repo)
    assert sum(p["instrument_count"] for p in answer["places"]) == count(report, "Instruments in scope files")
    assert sum(p["stored_count"] for p in answer["places"]) == count(report, "Instruments with stored text")
    assert sum(p["link_only_count"] for p in answer["places"]) == count(report, "Instruments link only")
    assert answer["coverage"]["status"] == "matches working tree"
    assert answer["snapshot"]["history_ref"] == "history"
    assert answer["snapshot"]["working_tree_commit"]
    assert "not legal advice" in answer["notice"].lower()
    assert "official source" in answer["notice"].lower()
    assert "company" in answer["notice"].lower()


def test_envelope_returns_shared_fields_and_history_records(tmp_path):
    repo = make_repo(tmp_path)

    envelope, records = query.envelope(repo)

    assert set(envelope) == {"snapshot", "coverage", "notice"}
    assert envelope["snapshot"]["history_ref"] == "history"
    assert records and records[0]["jurisdiction"] == "XX"


def test_default_ref_uses_origin_history_when_local_history_is_absent(tmp_path):
    repo = make_repo(tmp_path)
    head = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "history"], text=True).strip()
    subprocess.run(["git", "-C", str(repo), "update-ref", "refs/remotes/origin/history", head], check=True)
    subprocess.run(["git", "-C", str(repo), "update-ref", "-d", "refs/heads/history"], check=True)

    assert query.list_places(repo)["snapshot"]["history_ref"] == "origin/history"


def test_snapshot_marks_history_that_trails_working_tree(tmp_path):
    repo = make_repo(tmp_path)
    folder = repo / "records" / "XX" / "act"
    (folder / "2025-01-01-extra.json").write_text(json.dumps(
        {"source_id": "PASS", "in_force": "2025-01-01", "kind": "consolidated", "language": "en", "text": "extra"}))
    answer = query.list_places(repo)

    assert answer["coverage"]["status"] == "history trails working tree"
    assert answer["coverage"]["missing_records"] == 1
    assert answer["snapshot"]["history_ref"] == "history"
    assert answer["snapshot"]["history_commit"] and answer["snapshot"]["working_tree_commit"]


def test_snapshot_marks_record_content_changed_without_date_or_kind_change(tmp_path):
    repo = make_repo(tmp_path)
    record = repo / "records" / "XX" / "act" / "2020-01-01-consolidated.json"
    data = json.loads(record.read_text())
    data["text"] = "changed in the working tree"
    record.write_text(json.dumps(data))

    coverage_state = query.list_places(repo)["coverage"]
    assert coverage_state["status"] == "history differs from working tree"
    assert coverage_state["missing_records"] == coverage_state["extra_records"] == 0
    assert coverage_state["record_content_diff"] is True


def test_law_uses_shared_query_functions(tmp_path):
    import law

    repo = make_repo(tmp_path)
    assert law.lookup("XX", "2024-01-01", repo) == query.lookup("XX", "2024-01-01", repo)
    assert law.known(repo) == query.known(repo)
