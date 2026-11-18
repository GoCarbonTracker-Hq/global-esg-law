"""STORY-GEL-34-13: the data side of the "Amended by" line.

The pairs are read straight from register/*/scope.json; where each amender stands on a date comes from tools/query.py
(through tests/web/amended_expected.py). Nothing here calls web/*.js. The browser side is tests/web/checks/13-amended.mjs."""
import json
import re
import subprocess
import sys
from pathlib import Path

import pytest

from conftest import NO_HISTORY

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tests" / "web"))
import amended_expected as ae

REF = "origin/history"
CSRD = "eu-csrd-2022-2464"
A794, A470 = "eu-omnibus-stop-the-clock-2025-794", "eu-omnibus-content-2026-470"


def history_present():
    return subprocess.run(["git", "-C", str(ROOT), "rev-parse", "--verify", "--quiet", f"{REF}^{{commit}}"], capture_output=True).returncode == 0


@pytest.fixture(scope="module")
def expected(tmp_path_factory):
    """The generator run on the real register and history, as the page check runs it."""
    if not history_present():
        pytest.skip(NO_HISTORY)
    out = tmp_path_factory.mktemp("amended") / "amended-expected.json"
    run = subprocess.run([sys.executable, str(ROOT / "tests" / "web" / "amended_expected.py"), "--ref", REF, "--read-on", "2026-11-17", "--out", str(out)],
                         capture_output=True, text=True, cwd=ROOT)
    assert run.returncode == 0, run.stdout + run.stderr  # it dies when lookup and the story's fixed cases disagree
    print(run.stdout.strip())
    return json.loads(out.read_text(encoding="utf-8"))


def test_pairs_recount_from_the_scope_files():
    """Acceptance 1, data side: count the pairs without the generator's inverse, then compare with it."""
    raw = [json.loads(p.read_text(encoding="utf-8")) for p in sorted((ROOT / "register").glob("*/scope.json"))]
    entries = [e for scope in raw for e in scope]
    ids = {e["id"] for e in entries}
    named = [(e["id"], t) for e in entries for t in e.get("amends_ids") or []]
    inverse, skipped = ae.inverse(ae.read_scope(ROOT))
    print(f"pairs={len(named)} targets={len({t for _a, t in named})} amending entries={len({a for a, _t in named})} of {len(entries)} entries")
    assert named and len(named) == len(set(named))  # no pair listed twice
    assert all(a != t and t in ids for a, t in named)  # no self id, no id without an entry: the register the page reads is clean
    assert skipped == {}
    assert sum(len(v) for v in inverse.values()) == len(named)
    assert set(inverse) == {t for _a, t in named}
    assert all((a, t) in set(named) for t, amenders in inverse.items() for a in amenders)


def test_inverse_skips_self_repeated_and_dangling_ids():
    entries = {
        "a": ("XX", {"amends_ids": ["b", "b", "a", "nowhere"]}),
        "b": ("XX", {}),
        "c": ("YY", {"amends_ids": ["b"]}),  # another place
        "d": ("XX", {"amends_ids": ["c"]}),
        "c2": ("XX", {"amends_ids": ["d"]}),
    }
    inverse, skipped = ae.inverse(entries)
    assert inverse == {"b": ["a", "c"], "c": ["d"], "d": ["c2"]}
    assert dict(skipped) == {"repeated": 1, "self": 1, "dangling": 1}


def test_order_is_newest_first_undated_last_id_breaks_ties():
    items = [{"id": i, "at": at} for i, at in [("d", ""), ("b", "2024-01-01"), ("a", "2025-12-09"), ("c", "2024-01-01"), ("e", "")]]
    assert [i["id"] for i in ae.newest_first(items)] == ["a", "b", "c", "d", "e"]


def test_the_expected_groups_are_the_storys(expected):
    """Acceptance 2 to 5, data side: every target on every probe date, from lookup; the story's own cases are checked inside the generator."""
    t = expected["table"]
    ids = lambda group, target, date: [i["id"] for i in t[target][date][group]]
    assert ids("in-force", CSRD, "2025-04-16") == [] and ids("not-yet", CSRD, "2025-04-16") == [A470, A794]
    assert ids("in-force", CSRD, "2025-06-01") == [A794] and ids("not-yet", CSRD, "2025-06-01") == [A470]
    assert ids("in-force", CSRD, "2026-11-17") == [A470, A794]
    assert all(not t["hr-zor-2015"]["2025-06-01"][g] for g in ("in-force", "not-yet", "link-only"))
    assert expected["pairs"] == sum(len(v) for v in expected["inverse"].values()) and expected["targets"] == len(expected["inverse"])
    assert "de-lksg" not in expected["inverse"]
    assert set(expected["table"]) == set(expected["inverse"]) and all(set(v) == set(expected["dates"]) for v in expected["table"].values())
    print(f"pairs={expected['pairs']} targets={expected['targets']} amenders={expected['amenders']} stored={expected['stored']} "
          f"link_only={expected['link_only']} dated={expected['link_only_dated']}")


def test_gap_script_and_csrd_lists_both_amenders(expected):
    """Acceptance 9: Story 12's gap script prints unresolved 0 and CSRD lists both amenders on 2026-11-17."""
    run = subprocess.run([sys.executable, str(ROOT / "tools" / "amends_gap.py")], capture_output=True, text=True, cwd=ROOT)
    print(run.stdout.strip())
    assert run.returncode == 0 and run.stdout.startswith("unresolved 0,"), run.stdout + run.stderr
    assert [i["id"] for i in expected["table"][CSRD]["2026-11-17"]["in-force"]] == [A470, A794]


def test_index_html_places_the_slots_the_script_and_the_stylesheet():
    html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
    pos = lambda text: html.index(text)
    assert html.count('id="slot-after-link"') == 1 and html.count('id="slot-after-interim"') == 1
    assert pos('data-field="link"') < pos('id="slot-after-link"') < pos('id="slot-citation"') < pos('id="answer-interim"')
    assert re.search(r'<p id="answer-interim" hidden></p>\s*<div id="slot-after-interim"></div>', html)  # right after #answer-interim
    scripts = re.findall(r'<script defer src="([^"]+)"', html)
    assert scripts.count("amended.js") == 1 and scripts.index("answer.js") < scripts.index("amended.js") < scripts.index("app.js")
    assert html.count('href="amended.css"') == 1
