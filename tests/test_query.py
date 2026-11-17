import csv
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import pytest
from conftest import NO_HISTORY

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build
import query
import coverage
from test_build import PROVENANCE
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
    for path in (repo / "records").rglob("*.json"):
        path.write_text(json.dumps({**json.loads(path.read_text()), **PROVENANCE}))
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
    assert "places" not in answer and answer["place_count"] == len(answer["rows"])
    assert answer["columns"] == ["iso2", "name", "status", "instrument_count", "stored_count", "link_only_count",
                                 "missing_history_count", "first_in_force"]
    assert "columns" in answer["how_to_read"] and "place" in answer["how_to_read"]
    places = {row[0]: dict(zip(answer["columns"], row)) for row in answer["rows"]}

    assert places["XX"]["status"] == "text stored"
    assert (places["XX"]["stored_count"], places["XX"]["link_only_count"]) == (1, 1)
    assert "instruments" not in places["XX"] and places["XX"]["first_in_force"] == "2020-01-01"
    one = query.list_places(repo, place="XX")
    assert [p["iso2"] for p in one["places"]] == ["XX"]
    assert next(item for item in one["places"][0]["instruments"] if item["id"] == "act")["first_in_force"] == "2020-01-01"
    assert places["EE"]["status"] == "empty scope file"
    report = coverage.build(repo)
    assert sum(p["instrument_count"] for p in places.values()) == count(report, "Instruments in scope files")
    assert sum(p["stored_count"] for p in places.values()) == count(report, "Instruments with stored text")
    assert sum(p["link_only_count"] for p in places.values()) == count(report, "Instruments link only")
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
        {"source_id": "PASS", "in_force": "2025-01-01", "kind": "consolidated", "language": "en", "text": "extra", **PROVENANCE}))
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


def test_list_places_one_place_validates_input(tmp_path):
    repo = make_repo(tmp_path)
    for bad in ("xx", "XXX", 5):
        with pytest.raises(ValueError, match="two capital letters"):
            query.list_places(repo, place=bad)
    with pytest.raises(ValueError, match="unknown place"):
        query.list_places(repo, place="ZZ")


def test_list_places_reply_stays_under_30000_characters_on_the_real_corpus():
    if query.resolve_ref(ROOT) == "history" and subprocess.run(
            ["git", "-C", str(ROOT), "rev-parse", "--verify", "--quiet", "history"]).returncode != 0:
        pytest.skip(NO_HISTORY)
    answer = query.list_places(ROOT)
    reply = {"content": [{"type": "text", "text": json.dumps(answer, ensure_ascii=False, separators=(",", ":"))}], "structuredContent": answer}
    assert len(json.dumps(reply, ensure_ascii=False, separators=(",", ":"))) < 30000


@pytest.mark.parametrize("bad", ["2023-02-29", "2026-1-1", "", None, datetime(2026, 1, 1)])
def test_lookup_rejects_an_invalid_on_date(tmp_path, bad):
    repo = make_repo(tmp_path)
    with pytest.raises(ValueError, match="calendar date"):
        query.lookup("XX", bad, repo)
    with pytest.raises(ValueError, match="calendar date"):
        query.in_force("XX", bad, repo)
    assert query.lookup("XX", "2024-01-01", repo)[0]


def _commit(kind, language):
    return {"id": "x", "title": "X", "in_force": "2024-01-01", "kind": kind, "language": language,
            "jurisdiction": "XX", "commit": f"{kind}-{language}"}


@pytest.mark.parametrize("reverse", [False, True])
@pytest.mark.parametrize(("same_day", "lang", "shown"), [
    ([("adopted", "de"), ("consolidated", "fr")], None, ("consolidated", "fr")),
    ([("consolidated", "en"), ("translation", "en")], None, ("consolidated", "en")),
    ([("consolidated", "en"), ("translation", "en")], "en", ("consolidated", "en")),
    ([("adopted", "en"), ("translation", "en")], None, ("adopted", "en")),
    ([("adopted", "en"), ("consolidated", "en")], "en", ("consolidated", "en")),
    ([("adopted", "de"), ("consolidated", "fr"), ("translation", "en")], "en", ("translation", "en")),
])
def test_same_day_precedence_is_consolidated_then_adopted_then_translation(tmp_path, monkeypatch, same_day, lang, shown, reverse):
    commits = [_commit(*pair) for pair in (reversed(same_day) if reverse else same_day)]
    monkeypatch.setattr(query, "_commits", lambda repo, ref=None: tuple(commits))
    (item,) = query.in_force("XX", "2024-01-01", tmp_path, lang=lang, detail=True)
    assert (item["kind"], item["language"]) == shown
    assert {entry["language"] for entry in item["languages"]} == {language for _, language in same_day}


def test_read_text_withholds_when_duplicate_source_rows_differ_in_any_field(tmp_path):
    repo = make_repo(tmp_path)
    rows = json.loads((repo / "sources.json").read_text())
    pass_row = next(r for r in rows if r["id"] == "PASS")
    (repo / "sources.json").write_text(json.dumps(rows + [dict(pass_row)]))
    assert query.read_text(repo, "act", "2024-01-01")["text"]  # an identical copy is not ambiguous
    for field in ("jurisdiction", "terms_url", "terms_quote", "trailer_licence", "trailer_source_url"):
        (repo / "sources.json").write_text(json.dumps(rows + [{**pass_row, field: "changed"}]))
        answer = query.read_text(repo, "act", "2024-01-01")
        assert answer["text"] is None and "missing or ambiguous" in answer["reason"], field
