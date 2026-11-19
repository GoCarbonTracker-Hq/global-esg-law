import csv
import fcntl
import importlib.util
import json
import subprocess
import sys
from datetime import date
from pathlib import Path

import pytest

TOOLS = Path(__file__).resolve().parents[1] / "tools"
sys.path.insert(0, str(TOOLS))
import watch  # noqa: E402
from test_watch import completes, while_locked  # noqa: E402

# tools/queue.py shares its name with the stdlib queue module that pytest has already imported,
# so load it from its path under another name.
_spec = importlib.util.spec_from_file_location("review_queue", TOOLS / "queue.py")
review = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(review)

TODAY = date(2026, 11, 2)
UK = "https://example.invalid/section/data.xml"
TERMS = "https://example.invalid/terms.html"
ZIP = "https://example.invalid/pubinfo.zip"
HASH = "a" * 64


def row(**values):
    base = {"detected_on": "2026-11-01", "watcher_id": "w-uk", "iso2": "XX", "source_id": "PASS", "instrument": "act",
            "change": "new_version", "signal": "2027-01-01", "evidence_url": UK,
            "reviewer": "", "outcome": "", "outcome_on": "", "notes": ""}
    return {**base, **values}


ROWS = [
    row(watcher_id="w-uk", change="baseline", signal="2"),
    row(watcher_id="w-uk", change="new_version", signal="2027-01-01"),
    row(watcher_id="w-terms", source_id="ASKED", instrument="*", change="terms_changed", signal=HASH, evidence_url=TERMS),
    row(watcher_id="w-zip", instrument="*", change="watch_failed", signal="HTTP 403", evidence_url=ZIP,
        notes="second_route: none listed"),
    row(watcher_id="w-uk", change="new_version", signal="2026-06-01", reviewer="ada", outcome="confirm",
        outcome_on="2026-11-01", notes="seen on the Timeline of Changes"),
]

SEEN = {
    "w-uk": {"signals": ["2016-12-26", "2022-04-06"], "failure": None, "checked_on": "2026-11-01"},
    "w-terms": {"signals": ["b" * 64], "failure": None, "checked_on": "2026-11-01"},
    "w-zip": {"signals": ["Content-Length: 42"], "failure": "HTTP 403", "checked_on": "2026-11-01"},
}


def make(repo, rows=ROWS, seen=SEEN):
    """Fixture repo: two source rows, one scope entry with an in_force date, a queue of five rows, seen.json."""
    (repo / "sources.json").write_text(json.dumps([
        {"id": "PASS", "verdict": "pass"}, {"id": "ASKED", "verdict": "permission requested"}]))
    (repo / "register" / "XX").mkdir(parents=True)
    (repo / "register" / "XX" / "scope.json").write_text(json.dumps([
        {"id": "act", "title": "Placeholder Act", "in_force": "2022-04-06", "source_row": "PASS"}]))
    (repo / "upkeep").mkdir()
    with (repo / "upkeep" / "queue.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=watch.COLUMNS, lineterminator="\r\n")
        writer.writeheader()
        writer.writerows(rows)
    (repo / "upkeep" / "seen.json").write_text(json.dumps(seen, indent=1, sort_keys=True) + "\n")
    return repo


def rows(repo):
    with (repo / "upkeep" / "queue.csv").open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def seen(repo):
    return json.loads((repo / "upkeep" / "seen.json").read_text())


def tree(repo):
    return sorted(p.relative_to(repo).as_posix() for p in repo.rglob("*") if p.is_file())


def test_list_shows_licence_verdict_scope_date_and_evidence(tmp_path, capsys):
    repo = make(tmp_path)
    before = tree(repo), (repo / "upkeep" / "queue.csv").read_bytes()
    assert review.main(["--repo", str(repo)]) == 0
    out = capsys.readouterr().out.splitlines()
    assert out[4] == "4 open rows"
    assert [line.split()[1] for line in out[:4]] == ["w-uk:2", "w-uk:2027-01-01", f"w-terms:{HASH}", "w-zip:HTTP"]
    assert "licence PASS: pass" in out[1] and "XX act in_force 2022-04-06" in out[1] and out[1].endswith(UK)
    assert "licence ASKED: permission requested" in out[2] and "XX source-level" in out[2] and TERMS in out[2]
    assert out[3].endswith("second_route: none listed")
    assert not any("2026-06-01" in line for line in out[:5])  # the confirmed row is not among the open rows
    assert "w-uk:2026-06-01 new_version (confirm)" in out[5] and out[5].endswith("seen on the Timeline of Changes")
    assert out[6:] == ["1 confirmed, not yet stored"]  # listed after the open rows, with its notes
    assert (tree(repo), (repo / "upkeep" / "queue.csv").read_bytes()) == before  # listing writes nothing


def test_confirm_fills_the_three_columns_and_nothing_else(tmp_path, capsys):
    repo = make(tmp_path)
    before = (repo / "upkeep" / "queue.csv").read_bytes()
    assert review.main(["--repo", str(repo), "--outcome", "confirm", "--row", "w-uk:2027-01-01", "--reviewer", "varun"]) == 0
    assert capsys.readouterr().out == f"w-uk:2027-01-01 confirm by varun on {date.today().isoformat()}\n"
    got = rows(repo)
    assert (got[1]["reviewer"], got[1]["outcome"], got[1]["outcome_on"]) == ("varun", "confirm", date.today().isoformat())
    assert {k: v for k, v in got[1].items() if k not in ("reviewer", "outcome", "outcome_on")} == \
        {k: v for k, v in ROWS[1].items() if k not in ("reviewer", "outcome", "outcome_on")}
    assert got[:1] + got[2:] == ROWS[:1] + ROWS[2:]
    raw = (repo / "upkeep" / "queue.csv").read_bytes()
    assert raw.split(b"\r\n")[0] == before.split(b"\r\n")[0] == ",".join(watch.COLUMNS).encode()
    assert raw.count(b"\r\n") == 6 and b"\n" not in raw.replace(b"\r\n", b"")
    assert seen(repo) == SEEN
    assert tree(repo) == ["register/XX/scope.json", "sources.json", "upkeep/queue.csv", "upkeep/seen.json"]


@pytest.mark.parametrize("key, watcher_id, signal, known", [
    ("w-uk:2027-01-01", "w-uk", "2027-01-01", ["2016-12-26", "2022-04-06"]),
    (f"w-terms:{HASH}", "w-terms", HASH, ["b" * 64]),
])
def test_reject_new_version_or_terms_changed_adds_signal_to_seen(tmp_path, key, watcher_id, signal, known):
    repo = make(tmp_path)
    assert seen(repo)[watcher_id]["signals"] == known
    done = review.decide(repo, "reject", key, "varun", TODAY)
    assert (done["outcome"], done["outcome_on"], done["reviewer"]) == ("reject", "2026-11-02", "varun")
    assert seen(repo)[watcher_id]["signals"] == sorted(known + [signal])
    assert seen(repo)[watcher_id]["checked_on"] == "2026-11-01" and seen(repo)[watcher_id]["failure"] is None
    assert {k: v for k, v in seen(repo).items() if k != watcher_id} == {k: v for k, v in SEEN.items() if k != watcher_id}
    kept = [r for r in rows(repo) if r["watcher_id"] == watcher_id and r["signal"] == signal]
    assert len(kept) == 1 and kept[0]["outcome"] == "reject"  # the row stays in the file
    assert len(rows(repo)) == len(ROWS)


@pytest.mark.parametrize("key", ["w-uk:2", "w-zip:HTTP 403"])
def test_reject_baseline_or_watch_failed_leaves_seen_unchanged(tmp_path, key):
    repo = make(tmp_path)
    before = (repo / "upkeep" / "seen.json").read_bytes()
    assert review.main(["--repo", str(repo), "--outcome", "reject", "--row", key, "--reviewer", "varun"]) == 0
    assert (repo / "upkeep" / "seen.json").read_bytes() == before
    watcher_id, _, signal = key.partition(":")
    kept = [r for r in rows(repo) if r["watcher_id"] == watcher_id and r["signal"] == signal]
    assert len(kept) == 1 and kept[0]["outcome"] == "reject"


def test_notes_are_written_appended_and_optional(tmp_path):
    repo = make(tmp_path)
    review.decide(repo, "reject", "w-uk:2027-01-01", "moka", TODAY, notes="N0: first run")
    assert rows(repo)[1]["notes"] == "N0: first run"
    review.decide(repo, "reject", "w-zip:HTTP 403", "moka", TODAY, notes="retired")
    assert rows(repo)[3]["notes"] == "second_route: none listed; retired"
    review.decide(repo, "reject", "w-terms:" + HASH, "moka", TODAY)
    assert rows(repo)[2]["notes"] == ""


def test_needs_evidence_leaves_the_row_open(tmp_path, capsys):
    repo = make(tmp_path)
    review.decide(repo, "needs_evidence", "w-uk:2027-01-01", "varun", TODAY)
    got = rows(repo)[1]
    assert (got["reviewer"], got["outcome"], got["outcome_on"]) == ("varun", "needs_evidence", "2026-11-02")
    assert review.main(["--repo", str(repo)]) == 0
    out = capsys.readouterr().out.splitlines()
    assert out[4] == "4 open rows" and "w-uk:2027-01-01 new_version (needs_evidence)" in out[1]
    done = review.decide(repo, "confirm", "w-uk:2027-01-01", "grace", date(2026, 11, 5))
    assert (done["reviewer"], done["outcome"], done["outcome_on"]) == ("grace", "confirm", "2026-11-05")
    assert seen(repo) == SEEN


def test_repeat_row_behind_needs_evidence_is_reachable(tmp_path):
    """A watcher that fails again with the same text adds a second row with the same key; the
    undecided row is decided first, then the needs_evidence row."""
    failed = dict(watcher_id="w-zip", instrument="*", change="watch_failed", signal="HTTP 403", evidence_url=ZIP)
    repo = make(tmp_path, rows=[row(**failed, reviewer="ada", outcome="needs_evidence", outcome_on="2026-11-01"),
                                row(**failed, detected_on="2026-11-02")])
    assert review.decide(repo, "needs_evidence", "w-zip:HTTP 403", "moka", TODAY)["detected_on"] == "2026-11-02"
    assert review.decide(repo, "reject", "w-zip:HTTP 403", "moka", TODAY)["detected_on"] == "2026-11-01"
    assert review.decide(repo, "reject", "w-zip:HTTP 403", "moka", TODAY)["detected_on"] == "2026-11-02"
    assert [r["outcome"] for r in rows(repo)] == ["reject", "reject"]


@pytest.mark.parametrize("outcome", ["confirm", "reject", "needs_evidence"])
def test_deciding_a_decided_row_exits_1(tmp_path, capsys, outcome):
    repo = make(tmp_path)
    before = (repo / "upkeep" / "queue.csv").read_bytes(), (repo / "upkeep" / "seen.json").read_bytes()
    assert review.main(["--repo", str(repo), "--outcome", outcome, "--row", "w-uk:2026-06-01", "--reviewer", "varun"]) == 1
    err = capsys.readouterr().err
    assert "already decided" in err and "confirm by ada on 2026-11-01" in err
    assert ((repo / "upkeep" / "queue.csv").read_bytes(), (repo / "upkeep" / "seen.json").read_bytes()) == before


@pytest.mark.parametrize("key, message", [
    ("w-uk:1999-01-01", "not in upkeep/queue.csv"),
    ("w-nope:2027-01-01", "not in upkeep/queue.csv"),
    ("w-uk", "not watcher_id:signal"),
])
def test_missing_row_exits_1(tmp_path, capsys, key, message):
    repo = make(tmp_path)
    before = (repo / "upkeep" / "queue.csv").read_bytes()
    assert review.main(["--repo", str(repo), "--outcome", "confirm", "--row", key, "--reviewer", "varun"]) == 1
    assert message in capsys.readouterr().err
    assert (repo / "upkeep" / "queue.csv").read_bytes() == before


def test_signal_with_colons_is_matched_whole(tmp_path):
    header = "Last-Modified: Mon, 26 Oct 2026 04:26:08 GMT"
    repo = make(tmp_path, ROWS + [row(watcher_id="w-zip", instrument="*", signal=header, evidence_url=ZIP)])
    done = review.decide(repo, "reject", f"w-zip:{header}", "varun", TODAY)
    assert done["signal"] == header
    assert seen(repo)["w-zip"]["signals"] == ["Content-Length: 42", header]


def test_rows_from_a_fork_without_seen_entry(tmp_path):
    repo = make(tmp_path, seen={})
    review.decide(repo, "reject", "w-uk:2027-01-01", "varun", TODAY)
    assert seen(repo) == {"w-uk": {"signals": ["2027-01-01"], "failure": None}}


def test_cli_rejects_half_a_decision(tmp_path):
    repo = make(tmp_path)
    for argv in (["--outcome", "confirm"], ["--row", "w-uk:2"], ["--reviewer", "varun"]):
        with pytest.raises(SystemExit) as exc:
            review.main(["--repo", str(repo)] + argv)
        assert exc.value.code == 2


def test_watcher_does_not_flag_a_rejected_signal_again(tmp_path):
    """End to end: reject a new_version row, then run the watcher with the same body; no new row."""
    from test_watch import FakeFetch, uk_body, WATCHERS
    repo = make(tmp_path, rows=[], seen={})
    (repo / "upkeep" / "watchers.json").write_text(json.dumps([WATCHERS[1]]))
    fetch = FakeFetch()
    watch.watch(repo, fetch, TODAY)
    fetch.bodies[UK] = (200, {}, uk_body(["2016-12-26", "2022-04-06", "2027-01-01"]))
    assert len(watch.watch(repo, fetch, date(2026, 11, 3))["rows"]) == 1
    review.decide(repo, "reject", "w-uk:2027-01-01", "varun", date(2026, 11, 3))
    assert watch.watch(repo, fetch, date(2026, 11, 4))["rows"] == []
    assert [r["outcome"] for r in rows(repo)] == ["", "reject"]


def test_write_queue_failure_leaves_the_old_file_and_no_temp_file(tmp_path):
    """#17 T15: a write that dies half way must not truncate queue.csv or leave a temp file beside it."""
    class Boom:
        def __str__(self):
            raise OSError("disk full")

    repo = make(tmp_path)
    before = (repo / "upkeep" / "queue.csv").read_bytes(), tree(repo)
    with pytest.raises(OSError):
        review.write_queue(repo, [ROWS[0], {**ROWS[1], "notes": Boom()}])
    assert ((repo / "upkeep" / "queue.csv").read_bytes(), tree(repo)) == before
    review.write_queue(repo, ROWS[:2])
    assert rows(repo) == ROWS[:2] and tree(repo) == before[1]


def test_conflicting_duplicate_source_rows_stop_the_listing(tmp_path, capsys):
    """#40: sources.json read through the shared loader, not a last-row-wins dict."""
    repo = make(tmp_path)
    (repo / "sources.json").write_text(json.dumps([
        {"id": "PASS", "verdict": "pass"}, {"id": "PASS", "verdict": "fail"}, {"id": "ASKED", "verdict": "permission requested"}]))
    assert review.main(["--repo", str(repo)]) == 1
    assert "conflicting duplicate rows for id 'PASS'" in capsys.readouterr().err


def test_decide_waits_for_the_upkeep_lock(tmp_path):  # #51
    repo = make(tmp_path)
    got = while_locked(repo, lambda: review.decide(repo, "reject", "w-uk:2027-01-01", "varun", TODAY))
    assert got["outcome"] == "reject" and rows(repo)[1]["outcome"] == "reject"
    assert "2027-01-01" in seen(repo)["w-uk"]["signals"]
    assert not (repo / "upkeep" / ".lock").exists()


def test_queue_command_in_another_process_waits_for_the_lock(tmp_path):  # #51
    repo = make(tmp_path)
    command = [sys.executable, str(TOOLS / "queue.py"), "--repo", str(repo), "--outcome", "confirm",
               "--row", "w-uk:2027-01-01", "--reviewer", "varun"]
    with (repo / "upkeep" / ".lock").open("a") as holder:
        fcntl.flock(holder, fcntl.LOCK_EX)
        proc = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        try:
            with pytest.raises(subprocess.TimeoutExpired):
                proc.wait(timeout=1)
            assert rows(repo) == ROWS  # nothing written while the other holder has the lock
        finally:
            holder.close()
            out, err = proc.communicate(timeout=30)
    assert proc.returncode == 0, err
    assert rows(repo)[1]["outcome"] == "confirm" and out.startswith("w-uk:2027-01-01 confirm by varun")


def test_decide_inside_the_lock_does_not_deadlock(tmp_path):  # #51
    repo = make(tmp_path)

    def nested():
        with review.upkeep_lock(repo):
            return review.decide(repo, "confirm", "w-uk:2027-01-01", "varun", TODAY)

    assert completes(nested)["outcome"] == "confirm"
    assert not (repo / "upkeep" / ".lock").exists()


NO_RECIPE = "no recipe for PASS: store the text by hand with --file"
RECORD = "records/XX/act/2026-06-01-adopted-en.json"


def test_a_confirmed_row_stays_listed_with_its_reason_until_it_is_stored(tmp_path, capsys):
    repo = make(tmp_path, rows=[row(reviewer="varun", outcome="confirm", outcome_on="2026-11-01", notes=NO_RECIPE)])
    assert review.main(["--repo", str(repo)]) == 0
    out = capsys.readouterr().out.splitlines()
    assert out[0] == "0 open rows" and out[1].endswith(NO_RECIPE) and out[-1] == "1 confirmed, not yet stored"
    assert "w-uk:2027-01-01 new_version (confirm)" in out[1]
    (repo / RECORD).parent.mkdir(parents=True)
    (repo / RECORD).write_text("{}")
    assert review.main(["--repo", str(repo), "--outcome", "stored", "--row", "w-uk:2027-01-01", "--reviewer", "varun",
                        "--notes", f"stored {RECORD}"]) == 0
    stored = rows(repo)[0]
    assert (stored["outcome"], stored["reviewer"], stored["notes"]) == ("stored", "varun", f"{NO_RECIPE}; stored {RECORD}")
    assert review.main(["--repo", str(repo)]) == 0
    assert capsys.readouterr().out.splitlines()[-1] == "0 open rows"  # a stored row is no longer listed


@pytest.mark.parametrize("outcome, notes, message", [
    ("", "", "is not a confirm row"),             # an undecided row cannot be stored
    ("reject", "", "is not a confirm row"),
    ("confirm", "", "name no record file that exists"),
    ("confirm", f"stored {RECORD}", "name no record file that exists"),  # the path is written but the file is not there
])
def test_stored_needs_a_confirm_row_and_an_existing_record(tmp_path, capsys, outcome, notes, message):
    repo = make(tmp_path, rows=[row(reviewer="varun", outcome=outcome, outcome_on="2026-11-01" if outcome else "")])
    before = (repo / "upkeep" / "queue.csv").read_bytes()
    args = ["--repo", str(repo), "--outcome", "stored", "--row", "w-uk:2027-01-01", "--reviewer", "varun"]
    assert review.main(args + (["--notes", notes] if notes else [])) == 1
    assert message in capsys.readouterr().err
    assert (repo / "upkeep" / "queue.csv").read_bytes() == before
