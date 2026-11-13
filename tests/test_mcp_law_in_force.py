import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "tests"))
import law
import query
from test_mcp import modern, run_server
from test_query import make_repo


def repo_with_extras(tmp_path):
    repo = make_repo(tmp_path)
    scope = repo / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[0].update(verification="official_text_seen", duty_on="private_sector")
    entries[1].update(verification="official_page_seen")
    scope.write_text(json.dumps(entries))
    links = repo / "register" / "LL"
    links.mkdir()
    (links / "scope.json").write_text(json.dumps([
        {"id": "ll-rule", "title": "Link Rule", "law_family": "F6", "status": "link only",
         "official_url": "https://example.invalid/ll", "in_force": None}]))
    return repo


def cli(repo, place, on, *extra):
    import io
    from contextlib import redirect_stdout
    out = io.StringIO()
    with redirect_stdout(out):
        assert law.main([place, on, "--repo", str(repo), "--json", *extra]) == 0
    return json.loads(out.getvalue())


def test_in_force_list_equals_command_line_and_adds_labels(tmp_path):
    repo = repo_with_extras(tmp_path)
    answer = query.law_in_force(repo, "XX", "2021-01-01")
    expected = cli(repo, "XX", "2021-01-01")

    assert len(answer["in_force"]) == len(expected["in_force"]) == 1
    for mine, theirs in zip(answer["in_force"], expected["in_force"]):
        assert {k: mine[k] for k in theirs} == theirs
    item = answer["in_force"][0]
    assert item["language"] == "en" and item["licence"] == "CC0" and item["source_url"]
    assert item["official_url"] == "https://example.invalid/act"
    assert item["tier"] == "A" and item["verification"] == "official_text_seen" and item["unverified"] is False
    assert item["tier_label"] == "A"
    assert answer["not_yet_in_force"] == expected["not_yet_in_force"]
    assert answer["not_yet_in_force"][0]["in_force"] == "2023-06-01"
    assert {"snapshot", "coverage", "notice"} <= answer.keys()
    assert answer["case"] is None


def test_link_only_listed_apart_never_counted_and_unverified_tier_a(tmp_path):
    repo = repo_with_extras(tmp_path)
    answer = query.law_in_force(repo, "XX", "2021-01-01")

    assert [i["id"] for i in answer["in_force"]] == ["act"]
    (rule,) = answer["link_only"]
    assert rule["id"] == "rule" and rule["stored"] is False
    assert rule["official_url"] == "https://example.invalid/rule"
    assert rule["tier_label"] == "A, unverified" and rule["unverified"] is True


def test_missing_values_read_not_available(tmp_path):
    repo = repo_with_extras(tmp_path)
    (rule,) = query.law_in_force(repo, "XX", "2021-01-01")["link_only"]
    assert rule["duty_on"] == "not available"
    scope = repo / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    del entries[1]["verification"]
    scope.write_text(json.dumps(entries))
    (rule,) = query.law_in_force(repo, "XX", "2021-01-01")["link_only"]
    assert rule["verification"] == "not available" and rule["tier_label"] == "A, unverified"


def test_language_shown_and_fallback_noted(tmp_path):
    repo = repo_with_extras(tmp_path)
    shown = query.law_in_force(repo, "XX", "2021-01-01", lang="en")["in_force"][0]
    assert shown["fallback"] is False and "en" in shown["language_note"]
    fell = query.law_in_force(repo, "XX", "2021-01-01", lang="de")["in_force"][0]
    assert fell["fallback"] is True and "official" in fell["language_note"]
    assert fell["language"] == "en"


@pytest.mark.parametrize("place,on,case", [
    ("QQ", "2021-01-01", "place_not_in_register"),
    ("LL", "2021-01-01", "links_only"),
    ("XX", "2019-01-01", "before_record_starts"),
    ("EE", "2021-01-01", "registered_no_instruments"),
])
def test_empty_cases_each_name_themselves(tmp_path, place, on, case):
    repo = repo_with_extras(tmp_path)
    answer = query.law_in_force(repo, place, on)
    assert answer["in_force"] == [] and answer["case"] == case
    assert "does not mean" in answer["message"]
    if case == "before_record_starts":
        assert answer["first_record_date"] == "2020-01-01"
    if case == "links_only":
        assert answer["link_only"][0]["id"] == "ll-rule"


def test_nothing_in_force_after_repeal_case(tmp_path):
    repo = repo_with_extras(tmp_path)
    (repo / "records" / "XX" / "act" / "2024-01-01-repeal.json").write_text(json.dumps(
        {"source_id": "PASS", "in_force": "2024-01-01", "kind": "consolidated", "language": "en", "text": "",
         "repealed": True}))
    subprocess.run(["git", "-C", str(repo), "add", "-A"], check=True)
    subprocess.run(["git", "-C", str(repo), "commit", "-qm", "repeal"], check=True)
    import build
    build.build(repo, branch="history")
    answer = query.law_in_force(repo, "XX", "2025-01-01")
    assert answer["in_force"] == [] and answer["case"] == "nothing_in_force"
    assert answer["first_record_date"] == "2020-01-01" and "does not mean" in answer["message"]


@pytest.mark.parametrize("kwargs,hint", [
    ({"place": "xx", "date": "2021-01-01"}, "two capital letters"),
    ({"place": "XXX", "date": "2021-01-01"}, "two capital letters"),
    ({"place": "XX", "date": "2021-1-1"}, "YYYY-MM-DD"),
    ({"place": "XX", "date": "2021-02-30"}, "YYYY-MM-DD"),
    ({"place": "XX", "date": "2021-01-01", "lang": "EN"}, "two-letter"),
])
def test_malformed_input_is_an_input_error_with_hint(tmp_path, kwargs, hint):
    repo = repo_with_extras(tmp_path)
    with pytest.raises(ValueError, match=hint):
        query.law_in_force(repo, **kwargs)


def test_ambiguous_register_rows_give_no_tier(tmp_path):
    repo = repo_with_extras(tmp_path)
    with (repo / "register" / "register.csv").open("a", newline="", encoding="utf-8") as handle:
        import csv
        csv.writer(handle).writerow(["XX", "Placeholder Land", "Dup", "F1", "B", "official_text_seen", "", "",
                                     "https://example.invalid/act"])
    assert query.law_in_force(repo, "XX", "2021-01-01")["in_force"][0]["tier"] == "not available"


def test_validation_precedes_any_read(tmp_path):
    with pytest.raises(ValueError, match="place"):
        query.law_in_force(tmp_path / "no-such-repo", "usa", "2021-01-01")
    with pytest.raises(ValueError, match="date"):
        query.law_in_force(tmp_path / "no-such-repo", "US", "2021-13-01")
    with pytest.raises(ValueError, match="language"):
        query.law_in_force(tmp_path / "no-such-repo", "US", "2021-01-01", lang="eng")


def _real_history():
    return subprocess.run(["git", "-C", str(ROOT), "rev-parse", "--verify", "--quiet", "history^{commit}"]).returncode == 0 \
        or subprocess.run(["git", "-C", str(ROOT), "rev-parse", "--verify", "--quiet", "origin/history^{commit}"]).returncode == 0


needs_history = pytest.mark.skipif(not _real_history(), reason="no history or origin/history ref in this clone")


@needs_history
def test_real_corpus_ee_matches_command_line():
    answer = query.law_in_force(ROOT, "EE", "2026-01-01")
    expected = cli(ROOT, "EE", "2026-01-01")
    assert len(answer["in_force"]) == 6
    assert [{k: i[k] for k in e} for i, e in zip(answer["in_force"], expected["in_force"])] == expected["in_force"]
    assert ("ee-aoks-ets", "2026-03-28") in [(i["id"], i["in_force"]) for i in answer["not_yet_in_force"]]


@needs_history
def test_real_corpus_ae_lists_link_only_with_urls():
    answer = query.law_in_force(ROOT, "AE", "2025-06-01")
    assert answer["in_force"] == [] and answer["case"] == "links_only"
    assert len(answer["link_only"]) == 5 and all(i["official_url"].startswith("http") for i in answer["link_only"])


CALL = {"name": "law_in_force", "arguments": {"place": "XX", "date": "2021-01-01"}}


def test_modern_stdio_calls_law_in_force_and_reports_input_error(tmp_path):
    repo = repo_with_extras(tmp_path)
    replies, raw = run_server(repo, [
        modern("tools/list", "l1"),
        modern("tools/call", "c1", CALL),
        modern("tools/call", "c2", {"name": "law_in_force", "arguments": {"place": "XX", "date": "soon"}}),
    ])
    assert "law_in_force" in [t["name"] for t in replies[0]["result"]["tools"]]
    answer = replies[1]["result"]["structuredContent"]
    assert [i["id"] for i in answer["in_force"]] == ["act"] and {"snapshot", "coverage", "notice"} <= answer.keys()
    assert replies[2]["result"]["isError"] is True and "YYYY-MM-DD" in replies[2]["result"]["content"][0]["text"]
    assert len(raw) == 3


def test_legacy_stdio_calls_law_in_force(tmp_path):
    repo = repo_with_extras(tmp_path)
    replies, raw = run_server(repo, [
        {"jsonrpc": "2.0", "id": "i1", "method": "initialize", "params": {
            "protocolVersion": "2025-11-25", "capabilities": {}, "clientInfo": {"name": "test", "version": "1"}}},
        {"jsonrpc": "2.0", "method": "notifications/initialized"},
        {"jsonrpc": "2.0", "id": "c1", "method": "tools/call", "params": CALL},
    ])
    answer = replies[1]["result"]["structuredContent"]
    assert [i["id"] for i in answer["in_force"]] == ["act"] and answer["link_only"][0]["id"] == "rule"
    assert len(raw) == 2
