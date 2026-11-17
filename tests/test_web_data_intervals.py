"""STORY-GEL-34-02: the date intervals in the web data file give the same answers as query.law_in_force.

Expected answers come from query.law_in_force only. The only thing taken from the builder is `build`.
The file under test is the one the command line wrote, read back from disk."""
import json
import subprocess
import sys
import time
from datetime import date, timedelta
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import query
from web_data import build
from conftest import NO_HISTORY
from test_build import PROVENANCE, build as build_history
from test_law import make as make_history

REF = "origin/history"
READ_ON = "2026-11-17"
FAR = "9999-12-31"


# --- helpers: nothing here applies a date rule ---
def write_file(repo, ref, out):
    """Run the builder on the command line and read back the file it wrote."""
    run = subprocess.run([sys.executable, str(ROOT / "tools" / "web_data.py"), "--repo", str(repo), "--ref", ref,
                          "--read-on", READ_ON, "--out", str(out)], capture_output=True, text=True)
    assert run.returncode == 0, run.stderr
    return json.loads(Path(out).read_text(encoding="utf-8"))


def interval_at(intervals, on):
    """What the page does: the last interval whose `from` is on or before the date; None means not yet in force."""
    chosen = None
    for item in intervals:
        if item["from"] <= on:
            chosen = item
    return chosen


def probe_dates(entries):
    """Every change date, the day before, the day after, and the far date, for the entries of one place."""
    changes = {v["in_force"] for e in entries for v in e["versions"]} | {e["applies_from"] for e in entries if e.get("applies_from")}
    probes = {FAR}
    for d in changes:
        day = date.fromisoformat(d)
        probes |= {d, (day - timedelta(days=1)).isoformat(), (day + timedelta(days=1)).isoformat()}
    return sorted(probes)


def check_file_shape(data):
    """Acceptance 1: sorted, commits are the entry's own rows, a repealed `from` is its repeal row's date, none without rows."""
    stored = 0
    for e in data["entries"]:
        if not e["versions"]:
            assert "intervals" not in e, e["id"]
            continue
        stored += 1
        intervals = e["intervals"]
        assert intervals, e["id"]
        assert [i["from"] for i in intervals] == sorted(i["from"] for i in intervals), e["id"]
        assert len({i["from"] for i in intervals}) == len(intervals), e["id"]
        rows = {v["commit"]: v for v in e["versions"]}
        for i in intervals:
            assert set(i) <= {"from", "state", "commit", "not_yet_applying"}, i
            assert i["state"] in ("in_force", "repealed"), i
            assert i["commit"] in rows, (e["id"], i)
            if "not_yet_applying" in i:
                assert i["not_yet_applying"] is True and i["state"] == "in_force"
            if i["state"] == "repealed":
                assert rows[i["commit"]]["kind"] == "repeal" and rows[i["commit"]]["in_force"] == i["from"], (e["id"], i)
        assert intervals[0]["from"] == min(v["in_force"] for v in e["versions"]), e["id"]
    return stored


def compare(repo, ref, data, probes_of=None, answer_of=None):
    """Probe every place of the file and compare each instrument with query.law_in_force.

    Returns (place_probe_pairs, instrument_pairs, differences)."""
    answer_of = answer_of or (lambda place, on: query.law_in_force(repo, place, on, ref=ref))
    by_place = {}
    for e in data["entries"]:
        by_place.setdefault(e["place"], []).append(e)
    pairs = instrument_pairs = 0
    differ = []
    for place in sorted(data["places"]):
        entries = [e for e in by_place.get(place, []) if e["versions"]]
        if not entries:  # no version rows: one probe, and nothing in force
            answer = answer_of(place, READ_ON)
            pairs += 1
            if answer["in_force"]:
                differ.append((place, READ_ON, "in force without version rows", [i["id"] for i in answer["in_force"]]))
            continue
        seen = set()  # ids law_in_force showed in force at an earlier probe of this place
        for on in probe_dates(entries):
            answer = answer_of(place, on)
            pairs += 1
            found = {i["id"]: i for i in answer["in_force"]}
            waiting = {i["id"] for i in answer["not_yet_in_force"]}
            from_intervals = set()
            for e in entries:
                instrument_pairs += 1
                actual = interval_at(e["intervals"], on)
                if e["id"] in found:
                    item = found[e["id"]]
                    expected = ("in_force", item["commit"], bool(item.get("not_yet_applying")))
                elif e["id"] in waiting and e["id"] not in seen:
                    expected = None  # not yet in force
                else:
                    expected = "repealed"
                if actual is None:
                    got = None
                elif actual["state"] == "in_force":
                    got = ("in_force", actual["commit"], bool(actual.get("not_yet_applying")))
                    from_intervals.add(e["id"])
                else:
                    got = "repealed"
                    # repealed has to be backed by a repeal row on or before the date, the latest one
                    repeals = [v for v in e["versions"] if v["kind"] == "repeal" and v["in_force"] <= on]
                    if not repeals or actual["commit"] not in {v["commit"] for v in repeals if v["in_force"] == max(r["in_force"] for r in repeals)}:
                        got = ("repealed without its repeal row", actual["commit"])
                if got != expected:
                    differ.append((place, on, e["id"], expected, got))
            if from_intervals != set(found):
                differ.append((place, on, "in-force id sets", sorted(set(found) ^ from_intervals)))
            seen |= set(found)
    return pairs, instrument_pairs, differ


# --- fixtures: a small repo per rule; each is checked by name and against law_in_force ---
def make(tmp_path, extra=()):
    repo = make_history(tmp_path, extra)
    subprocess.run(["git", "-C", str(repo), "add", "-A"], check=True)
    subprocess.run(["git", "-C", str(repo), "commit", "-qm", "fixture"], check=True)
    return repo


def add_record(repo, name, **fields):
    record = {"source_id": "new", "in_force": "2020-03-04", "kind": "adopted", "language": "en", "text": name, **PROVENANCE}
    record.update(fields)
    (repo / "records" / "EU" / "law2" / f"{name}.json").write_text(json.dumps(record))


def repeal(repo, name, when, **fields):
    add_record(repo, name, in_force=when, text="", repealed=True, **fields)


def rebuild(repo, tmp_path, name="out.json"):
    build_history.build(repo, branch="history")
    data = write_file(repo, "history", tmp_path / name)
    pairs, _, differ = compare(repo, "history", data)
    assert pairs > 2 and differ == []
    check_file_shape(data)
    return data


def entry(data, instrument):
    return next(e for e in data["entries"] if e["id"] == instrument)


def shape(intervals):
    return [(i["from"], i["state"], bool(i.get("not_yet_applying"))) for i in intervals]


def commit_of(e, kind, when, language="en"):
    return next(v["commit"] for v in e["versions"] if (v["kind"], v["in_force"], v.get("language")) == (kind, when, language))


def test_fixture_repeal(tmp_path):
    repo = make(tmp_path, [("v2", "2021-01-01")])
    repeal(repo, "gone", "2022-06-01")
    data = rebuild(repo, tmp_path)
    e = entry(data, "law2")
    assert shape(e["intervals"]) == [("2020-03-04", "in_force", False), ("2021-01-01", "in_force", False), ("2022-06-01", "repealed", False)]
    assert e["intervals"][2]["commit"] == commit_of(e, "repeal", "2022-06-01")
    assert e["intervals"][0]["commit"] != e["intervals"][1]["commit"]  # different commits are never merged
    assert shape(entry(data, "law")["intervals"]) == [("1965-01-02", "in_force", False)]


def test_fixture_repeal_blocks_a_later_unflagged_record(tmp_path):
    repo = make(tmp_path)
    repeal(repo, "gone", "2021-06-01")
    add_record(repo, "after", in_force="2022-01-01")
    data = rebuild(repo, tmp_path)
    e = entry(data, "law2")
    assert shape(e["intervals"]) == [("2020-03-04", "in_force", False), ("2021-06-01", "repealed", False)]
    answer = query.law_in_force(repo, "EU", "2022-02-01", ref="history")
    assert "law2" not in [i["id"] for i in answer["in_force"]]  # the page must say repealed there as well
    assert interval_at(e["intervals"], "2022-02-01")["state"] == "repealed"


def test_fixture_flagged_reenactment_reads_in_force_repealed_in_force(tmp_path):
    repo = make(tmp_path)
    repeal(repo, "repeal", "2024-06-01")
    add_record(repo, "reenact", in_force="2024-06-02", re_enactment=True)
    data = rebuild(repo, tmp_path)
    e = entry(data, "law2")
    assert shape(e["intervals"]) == [("2020-03-04", "in_force", False), ("2024-06-01", "repealed", False), ("2024-06-02", "in_force", False)]
    assert e["intervals"][2]["commit"] == commit_of(e, "adopted", "2024-06-02")
    assert any(v.get("re_enactment") for v in e["versions"])  # the flag reached the file, so the case really ran


def test_fixture_consolidated_and_adopted_on_one_date(tmp_path):
    repo = make(tmp_path)
    rows = json.loads((repo / "sources.json").read_text())
    rows.append({**rows[1], "id": "cons", "form": "consolidated"})
    (repo / "sources.json").write_text(json.dumps(rows))
    scope = repo / "register" / "EU" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[1]["source_row"] = ["new", "cons"]
    scope.write_text(json.dumps(entries))
    add_record(repo, "consolidated", source_id="cons", kind="consolidated")
    data = rebuild(repo, tmp_path)
    e = entry(data, "law2")
    assert len([v for v in e["versions"] if v["in_force"] == "2020-03-04"]) == 2
    assert shape(e["intervals"]) == [("2020-03-04", "in_force", False)]
    assert e["intervals"][0]["commit"] == commit_of(e, "consolidated", "2020-03-04")  # the commit, not only the state


def test_fixture_translation_only_later_date(tmp_path):
    repo = make(tmp_path)
    rows = json.loads((repo / "sources.json").read_text())
    rows.append({**rows[1], "id": "tr", "form": "translation"})
    (repo / "sources.json").write_text(json.dumps(rows))
    scope = repo / "register" / "EU" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[1]["source_row"] = ["new", "tr"]
    scope.write_text(json.dumps(entries))
    add_record(repo, "translation", source_id="tr", kind="translation", in_force="2022-01-01", language="fr")
    data = rebuild(repo, tmp_path)
    e = entry(data, "law2")
    assert any(v["kind"] == "translation" for v in e["versions"])
    assert shape(e["intervals"]) == [("2020-03-04", "in_force", False)]  # the translation starts no interval
    assert e["intervals"][0]["commit"] == commit_of(e, "adopted", "2020-03-04")


def test_fixture_publication_dated_row(tmp_path):
    repo = make(tmp_path)
    add_record(repo, "2019-05-06-published", in_force=None)
    data = rebuild(repo, tmp_path)
    e = entry(data, "law2")
    published = next(v for v in e["versions"] if v.get("date_basis") == "publication")
    assert published["in_force"] == "2019-05-06"
    assert shape(e["intervals"])[0] == ("2019-05-06", "in_force", False)
    assert e["intervals"][0]["commit"] == published["commit"]
    assert interval_at(e["intervals"], "2019-05-05") is None  # not yet in force the day before


def test_fixture_applies_from_after_the_date_asked(tmp_path):
    repo = make(tmp_path)
    scope = repo / "register" / "EU" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[1]["applies_from"] = "2021-01-01"
    scope.write_text(json.dumps(entries))
    data = rebuild(repo, tmp_path)
    e = entry(data, "law2")
    assert shape(e["intervals"]) == [("2020-03-04", "in_force", True), ("2021-01-01", "in_force", False)]
    assert e["intervals"][0]["commit"] == e["intervals"][1]["commit"]  # same commit, still two intervals
    assert interval_at(e["intervals"], "2020-12-31")["not_yet_applying"] is True
    assert "not_yet_applying" not in interval_at(e["intervals"], "2021-01-01")


def test_fixture_two_repeal_rows_on_one_day_pick_the_same_one_every_build(tmp_path):
    repo = make(tmp_path)
    repeal(repo, "repeal-sv", "2022-01-01", language="sv")
    repeal(repo, "repeal-fi", "2022-01-01", language="fi")
    build_history.build(repo, branch="history")
    first = write_file(repo, "history", tmp_path / "a.json")
    second = write_file(repo, "history", tmp_path / "b.json")
    assert (tmp_path / "a.json").read_bytes() == (tmp_path / "b.json").read_bytes()
    e = entry(first, "law2")
    assert shape(e["intervals"])[-1] == ("2022-01-01", "repealed", False)
    assert e["intervals"][-1]["commit"] == commit_of(e, "repeal", "2022-01-01", "fi")  # first by language, then commit
    assert entry(second, "law2")["intervals"] == e["intervals"]


def test_fixture_link_only_entry_has_no_intervals_and_file_matches_build(tmp_path):
    repo = make(tmp_path)
    scope = repo / "register" / "EU" / "scope.json"
    entries = json.loads(scope.read_text())
    entries.append({"id": "linked", "title": "Linked", "status": "link only", "official_url": "https://example.org/l"})
    scope.write_text(json.dumps(entries))
    subprocess.run(["git", "-C", str(repo), "commit", "-qam", "scope"], check=True)
    data = write_file(repo, "history", tmp_path / "out.json")
    assert "intervals" not in entry(data, "linked") and check_file_shape(data) == 2
    assert json.loads(json.dumps(build(repo, "history", READ_ON))) == data  # what was written is what was built


def test_compare_catches_a_wrong_interval(tmp_path):
    """The comparison itself must fail when the data is wrong: change one commit, drop one repeal."""
    repo = make(tmp_path, [("v2", "2021-01-01")])
    repeal(repo, "gone", "2022-06-01")
    build_history.build(repo, branch="history")
    data = write_file(repo, "history", tmp_path / "out.json")
    e = entry(data, "law2")
    e["intervals"][0]["commit"] = e["intervals"][1]["commit"]
    assert compare(repo, "history", data)[2]
    e["intervals"][0]["commit"] = commit_of(e, "adopted", "2020-03-04")
    dropped = e["intervals"].pop()
    assert dropped["state"] == "repealed" and compare(repo, "history", data)[2]


# --- real data: reads origin/history; a skip for a missing ref fails CI ---
@pytest.fixture(scope="module")
def real_file(tmp_path_factory):
    if subprocess.run(["git", "-C", str(ROOT), "rev-parse", "--verify", "--quiet", f"{REF}^{{commit}}"],
                      capture_output=True).returncode:
        pytest.skip(NO_HISTORY)
    return write_file(ROOT, REF, tmp_path_factory.mktemp("web") / "web-data.json")


def test_real_file_shape_and_known_instruments(real_file):
    stored = check_file_shape(real_file)
    history = query._commits(ROOT, REF)
    assert stored == len({c["id"] for c in history}) > 0
    csrd = entry(real_file, "eu-csrd-2022-2464")
    assert [i["from"] for i in csrd["intervals"]] == ["2023-01-05", "2025-04-17", "2026-03-18"]
    gn = entry(real_file, "gn-arrete-2022-1646-evaluations-environnementales")
    assert [(i["from"], i["state"]) for i in gn["intervals"]][-1] == ("2023-05-05", "repealed")
    fi = entry(real_file, "fi-paastokauppalaki-2011")
    assert fi["intervals"][-1]["state"] == "repealed" and fi["intervals"][-1]["from"] == "2024-01-01"
    assert fi["intervals"][-1]["commit"] in {v["commit"] for v in fi["versions"] if v["kind"] == "repeal"}


def test_real_all_pairs_match_law_in_force(real_file, monkeypatch, capsys):
    shared = query.envelope(ROOT, REF)  # law_in_force reads coverage on every call (4 s); read it once
    monkeypatch.setattr(query, "envelope", lambda repo=ROOT, ref=None: shared)
    places_with_versions = {e["place"] for e in real_file["entries"] if e["versions"]}
    assert places_with_versions == {c["jurisdiction"] for c in query._commits(ROOT, REF) if c.get("jurisdiction") and c.get("id")}
    assert len(places_with_versions) > 100  # a loop over an empty list must not read as a pass
    start = time.perf_counter()
    pairs, instrument_pairs, differ = compare(ROOT, REF, real_file)
    seconds = time.perf_counter() - start
    with capsys.disabled():
        print(f"\nintervals={sum(len(e.get('intervals', [])) for e in real_file['entries'])} "
              f"places_with_versions={len(places_with_versions)} pairs={pairs} instrument_pairs={instrument_pairs} "
              f"differ={len(differ)} seconds={seconds:.0f}")
        for item in differ[:10]:
            print("DIFF", item)
    assert pairs > len(real_file["places"]) and instrument_pairs > pairs
    assert differ == []
