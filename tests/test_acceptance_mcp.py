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
                             ("unknown argument", {"colour": "red"}, "protocol", lambda a: [])]}
    for era in (acc.MODERN, acc.LEGACY):
        lines = acc.run_checks(repo, era, table, only="list_places")
        assert all(ok for ok, _ in lines), lines


def test_mismatch_missing_tool_and_unchecked_tool_all_fail(tmp_path):
    repo = fixture(tmp_path)
    table = {"list_places": [("bad", {}, False, wrong)], "no_such_tool": [("x", {}, False, wrong)]}
    failed = [line for ok, line in acc.run_checks(repo, acc.MODERN, table) if not ok]
    assert any("list_places: bad -> deliberate mismatch" in line for line in failed)
    assert any("no_such_tool: not present on the server" in line for line in failed)
    failed = [line for ok, line in acc.run_checks(repo, acc.MODERN, {}) if not ok]
    assert any("list_places: listed by the server, no checks written" in line for line in failed)


def test_only_limits_the_run_to_one_tool(tmp_path):
    repo = fixture(tmp_path)
    table = {"list_places": [("XX stored", {}, False, xx_status)], "no_such_tool": [("x", {}, False, wrong)]}
    assert all(ok for ok, _ in acc.run_checks(repo, acc.LEGACY, table, only="list_places"))


STORED = {"instrument": "act", "date": "2024-01-01"}  # the fixture's stored instrument


def served(answer):
    return {"result": {"isError": False, "structuredContent": answer}}


def test_link_only_check_fails_when_text_leaks_alongside_the_reason():
    check = next(c[3] for c in acc.CHECKS["read_text"] if c[0].startswith("link-only"))
    honest = {"text": None, "official_url": acc.AE_URL, "reason": "The text is not stored (link only)."}
    assert acc.judge(served(honest), False, check) == []
    assert acc.judge(served({**honest, "text": "LEAKED PROPRIETARY TEXT"}), False, check) == [
        "text is 'LEAKED PROPRIETARY TEXT', expected null"]
    assert acc.judge(served({k: v for k, v in honest.items() if k != "text"}), False, check) == [
        "text is 'missing', expected null"]


def test_stored_non_pass_check_fails_when_the_text_is_served():
    check = acc.WITHHELD["read_text"][0][3]
    held = {"text": None, "official_url": acc.CSRD_URL, "reason": "The text is withheld: the licence verdict of source X is fail, not pass."}
    assert acc.judge(served(held), False, check) == []
    assert acc.judge(served({**held, "text": "SERVED"}), False, check)
    assert acc.judge(served({"text": "SERVED", "total_chars": 6}), False, check)


def test_withheld_check_passes_a_correct_server_and_fails_one_that_serves_text(tmp_path):
    table = {"read_text": [("stored record, verdict fail", STORED, False, acc.withheld("not pass"))]}
    good = fixture(tmp_path / "good")
    acc.fail_every_licence(good)
    broken = fixture(tmp_path / "broken")  # licences left at pass, so this server serves the text the check says must be withheld
    for era in (acc.MODERN, acc.LEGACY):
        lines = acc.run_checks(good, era, table, only="read_text", label=" verdict fail")
        assert all(ok for ok, _ in lines) and all(line.startswith(f"[{era} verdict fail] ") for _, line in lines)
        failed = [line for ok, line in acc.run_checks(broken, era, table, only="read_text") if not ok]
        assert any("read_text: stored record, verdict fail -> text is " in line for line in failed), failed
