import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import acceptance_mcp as acc
from test_mcp import server_copy
from test_query import make_repo


def xx_status(answer):
    return [] if acc.place(answer, "XX").get("status") == "text stored" else ["XX not text stored"]


def wrong(answer):
    return ["deliberate mismatch"]


def fixture(tmp_path):
    repo = make_repo(tmp_path)
    server_copy(repo)
    return repo


def test_checks_pass_in_both_eras_against_a_fixture(tmp_path):
    repo = fixture(tmp_path)
    table = {"list_places": [("XX stored", {}, False, xx_status),
                             ("unknown argument", {"place": "XX"}, "protocol", lambda a: [])]}
    for era in (acc.MODERN, acc.LEGACY):
        lines = acc.run_checks(repo, era, table)
        assert all(ok for ok, _ in lines), lines


def test_mismatch_missing_tool_and_unchecked_tool_all_fail(tmp_path):
    repo = fixture(tmp_path)
    table = {"list_places": [("bad", {}, False, wrong)], "read_text": [("x", {}, False, wrong)]}
    failed = [line for ok, line in acc.run_checks(repo, acc.MODERN, table) if not ok]
    assert any("list_places: bad -> deliberate mismatch" in line for line in failed)
    assert any("read_text: not present on the server" in line for line in failed)
    failed = [line for ok, line in acc.run_checks(repo, acc.MODERN, {}) if not ok]
    assert any("list_places: listed by the server, no checks written" in line for line in failed)


def test_only_limits_the_run_to_one_tool(tmp_path):
    repo = fixture(tmp_path)
    table = {"list_places": [("XX stored", {}, False, xx_status)], "read_text": [("x", {}, False, wrong)]}
    assert all(ok for ok, _ in acc.run_checks(repo, acc.LEGACY, table, only="list_places"))
