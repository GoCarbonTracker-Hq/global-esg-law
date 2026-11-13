import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "tests"))
import query
from test_mcp import modern, run_server


def git(repo, *args):
    subprocess.run(["git", "-C", str(repo), *args], check=True, capture_output=True)


def stored(repo, day, kind, lang="en", extra="", id_="law", place="XX"):
    body = (f"{id_} {day}\n\nInstrument: Law\nSource-url: https://example.invalid/{id_}/{day}\n"
            f"In-force: {day}\nKind: {kind}\nLicence: CC0\nJurisdiction: {place}\nInstrument-id: {id_}\n"
            f"Language: {lang}{extra}\n")
    git(repo, "commit", "-q", "--allow-empty", "-m", body)


def fixture(tmp_path):
    repo = tmp_path / "repo"
    (repo / "register" / "XX").mkdir(parents=True)
    (repo / "register" / "XX" / "scope.json").write_text(json.dumps([
        {"id": "law", "title": "Law", "status": "stored", "official_url": "https://example.invalid/law"},
        {"id": "gone", "title": "Gone", "status": "stored", "official_url": "https://example.invalid/gone"},
        {"id": "rule", "title": "Rule", "status": "link only", "official_url": "https://example.invalid/rule"}]))
    git(repo, "init", "-q")
    git(repo, "config", "user.name", "T")
    git(repo, "config", "user.email", "t@example.org")
    git(repo, "add", "-A")
    git(repo, "commit", "-qm", "base")
    git(repo, "checkout", "-q", "-b", "history")
    stored(repo, "2020-01-01", "adopted")
    stored(repo, "2022-01-01", "consolidated", "en")
    stored(repo, "2022-01-01", "translation", "de")
    stored(repo, "2023-05-01", "consolidated", extra="\nDate-basis: publication")
    stored(repo, "2019-01-01", "adopted", id_="gone")
    stored(repo, "2021-01-01", "repeal", id_="gone")
    stored(repo, "2022-06-01", "adopted", id_="gone")
    stored(repo, "2023-01-01", "adopted", id_="gone", extra="\nRe-enactment: true")
    return repo


def test_versions_in_force_order_with_kind_languages_and_notes(tmp_path):
    repo = fixture(tmp_path)
    answer = query.instrument_history(repo, "law")
    assert {"snapshot", "coverage", "notice"} <= answer.keys()
    assert answer["stored"] is True and answer["jurisdiction"] == "XX"
    assert [(v["in_force"], v["kind"]) for v in answer["versions"]] == [
        ("2020-01-01", "adopted"), ("2022-01-01", "consolidated"), ("2023-05-01", "consolidated")]
    assert answer["versions"][1]["languages"] == ["en", "de"]
    assert answer["versions"][1]["licence"] == "CC0" and answer["versions"][1]["source_url"]
    assert "note" not in answer["versions"][0]
    assert "publication date" in answer["versions"][2]["note"]


def test_repeal_is_listed_and_unflagged_later_record_is_not(tmp_path):
    answer = query.instrument_history(fixture(tmp_path), "gone")
    assert [(v["in_force"], v["kind"]) for v in answer["versions"]] == [
        ("2019-01-01", "adopted"), ("2021-01-01", "repeal"), ("2023-01-01", "adopted")]
    assert answer["excluded_after_repeal"] == ["2022-06-01"]


def test_link_only_and_unknown(tmp_path):
    repo = fixture(tmp_path)
    answer = query.instrument_history(repo, "rule")
    assert answer["stored"] is False and answer["versions"] == []
    assert answer["official_url"] == "https://example.invalid/rule" and "not stored" in answer["reason"]
    with pytest.raises(ValueError, match="Unknown instrument"):
        query.instrument_history(repo, "nope")
    with pytest.raises(ValueError):
        query.instrument_history(repo, "../etc")
    with pytest.raises(ValueError):
        query.instrument_history(repo, None)


def test_tool_over_stdio(tmp_path):
    repo = fixture(tmp_path)
    replies, _ = run_server(repo, [
        modern("tools/list", 1),
        modern("tools/call", 2, {"name": "instrument_history", "arguments": {"instrument": "law"}}),
        modern("tools/call", 3, {"name": "instrument_history", "arguments": {"instrument": "nope"}})])
    assert "instrument_history" in [t["name"] for t in replies[0]["result"]["tools"]]
    assert len(replies[1]["result"]["structuredContent"]["versions"]) == 3
    assert replies[2]["result"]["isError"] is True


def test_eu_csrd_known_answer_on_real_history():
    ref = next((r for r in ("history", "origin/history") if subprocess.run(
        ["git", "-C", str(ROOT), "rev-parse", "--verify", "--quiet", r]).returncode == 0), None)
    if ref is None:
        pytest.skip("neither history nor origin/history exists in this clone")
    answer = query.instrument_history(ROOT, "eu-csrd-2022-2464", ref=ref)
    assert [v["in_force"] for v in answer["versions"]] == ["2023-01-05", "2025-04-17", "2026-03-18"]
    assert [v["kind"] for v in answer["versions"]] == ["adopted", "consolidated", "consolidated"]
