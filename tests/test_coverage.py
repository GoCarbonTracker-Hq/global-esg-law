import csv
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import coverage

TODAY = date(2026, 11, 2)
REGISTER_COLUMNS = ["iso2", "country", "instrument_title", "law_family", "tier_hint", "verification",
                    "status", "in_force_date", "official_source_url"]
CADENCE = {"tiers": {"gazette_feed": 7, "consolidation_site": 14, "regulator_page": 30, "tracker_pointer": 90},
           "measured": False}


def make(repo, checked_on="2026-11-01", seen=True, cadence=CADENCE):
    """Fixture repo: place XX has one stored act (watched) and one link-only rule; YY is a register row with
    no scope entry and no watcher; ZZ is a place listed with no instrument."""
    (repo / "register" / "XX").mkdir(parents=True)
    with (repo / "register" / "register.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=REGISTER_COLUMNS)
        writer.writeheader()
        writer.writerows([
            {"iso2": "XX", "country": "Placeholder Land", "instrument_title": "Placeholder Act", "law_family": "F1",
             "tier_hint": "A", "verification": "official_text_seen", "status": "scope list entry",
             "in_force_date": "2020-01-01", "official_source_url": "https://example.invalid/act"},
            {"iso2": "XX", "country": "Placeholder Land", "instrument_title": "Placeholder Rule", "law_family": "F6",
             "tier_hint": "A", "verification": "official_page_seen", "status": "scope list entry",
             "in_force_date": "2024-01-01", "official_source_url": "https://example.invalid/rule"},
            {"iso2": "YY", "country": "Other Land", "instrument_title": "Other Decree", "law_family": "F3",
             "tier_hint": "B", "verification": "tracker_only", "status": "in force",
             "in_force_date": "", "official_source_url": "https://example.invalid/decree"},
            {"iso2": "ZZ", "country": "Empty Land", "instrument_title": "", "law_family": "",
             "tier_hint": "C", "verification": "not_checked", "status": "", "in_force_date": "",
             "official_source_url": ""},
        ])
    (repo / "register" / "XX" / "scope.json").write_text(json.dumps([
        {"id": "act", "title": "Placeholder Act", "law_family": "F1", "source_row": "PASS",
         "status": "stored", "in_force": "2020-01-01"},
        {"id": "rule", "title": "Placeholder Rule", "law_family": "F6", "source_row": "ASKED",
         "status": "link only", "in_force": "2024-01-01"},
    ]))
    (repo / "records" / "XX" / "act").mkdir(parents=True)
    for in_force in ("2020-01-01", "2023-06-01"):
        (repo / "records" / "XX" / "act" / f"{in_force}-consolidated.json").write_text(json.dumps(
            {"source_id": "PASS", "in_force": in_force, "kind": "consolidated", "language": "en", "text": "placeholder text"}))
    (repo / "sources.json").write_text(json.dumps([
        {"id": "PASS", "verdict": "pass", "checked_on": "2026-11-01",
         "fetch_url": "https://www.legislation.gov.uk/{type}/{year}/{number}/data.xml"},
        {"id": "ASKED", "verdict": "permission requested", "checked_on": "2026-10-20",
         "fetch_url": "https://example.invalid/handbook/{MODULE}"},
    ]))
    (repo / "upkeep").mkdir()
    (repo / "upkeep" / "watchers.json").write_text(json.dumps([
        {"id": "w-act", "source_id": "PASS", "iso2": "XX", "instrument": "act", "kind": "date_list",
         "url": "https://example.invalid/act/data.xml", "params": {"regex": r"/(\d{4}-\d{2}-\d{2})"}}]))
    if seen:
        (repo / "upkeep" / "seen.json").write_text(json.dumps(
            {"w-act": {"signals": ["2020-01-01", "2023-06-01"], "failure": None, "checked_on": checked_on}}))
    (repo / "upkeep" / "cadence.json").write_text(json.dumps(cadence))
    return repo


def grid_row(text, iso2):
    """The cells of one grid row, keyed F1..F7."""
    line = next(l for l in text.splitlines() if l.startswith(f"| {iso2} |"))
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    return dict(zip(coverage.FAMILIES, cells[2:]))


def instrument_row(text, instrument):
    line = next(l for l in text.splitlines() if l.startswith(f"| {instrument} |"))
    return [c.strip() for c in line.strip().strip("|").split("|")]


def test_stored_instrument_shows_text_n(tmp_path):
    text = coverage.build(make(tmp_path), today=TODAY)
    assert "text 2" in grid_row(text, "XX")["F1"]
    assert "changed 2023-06-01" in grid_row(text, "XX")["F1"]
    assert instrument_row(text, "act")[2:4] == ["text 2", "2"]


def test_link_only_instrument_shows_link_only(tmp_path):
    text = coverage.build(make(tmp_path), today=TODAY)
    cell = grid_row(text, "XX")["F6"]
    assert "link only" in cell and "text" not in cell and "changed" not in cell
    assert instrument_row(text, "rule")[2:4] == ["link only", "0"]
    # A register row with no scope entry is link only too, with no check date.
    assert grid_row(text, "YY")["F3"] == "B · tracker_only · link only · unchecked"
    assert all(cell == "" for cell in grid_row(text, "ZZ").values())


def test_cell_older_than_cadence_is_stale(tmp_path):
    old = (TODAY - timedelta(days=20)).isoformat()  # consolidation_site cadence is 14 days
    text = coverage.build(make(tmp_path, checked_on=old), today=TODAY)
    assert grid_row(text, "XX")["F1"].endswith("stale")
    assert f"checked {old}" in grid_row(text, "XX")["F1"]
    row = instrument_row(text, "act")
    assert row[4:6] == [old, "watcher"] and row[-1] == "stale"
    # The link-only rule has no watcher: its licence row was checked 13 days ago, within regulator_page's 30.
    assert instrument_row(text, "rule")[4:6] == ["2026-10-20", "licence row"]
    assert instrument_row(text, "rule")[-1] == "current"
    assert not grid_row(text, "XX")["F6"].endswith("stale")


def test_cell_within_cadence_is_not_stale(tmp_path):
    recent = (TODAY - timedelta(days=5)).isoformat()
    text = coverage.build(make(tmp_path, checked_on=recent), today=TODAY)
    assert "stale" not in grid_row(text, "XX")["F1"]
    assert instrument_row(text, "act")[-1] == "current"


def test_place_with_no_watcher_is_listed_under_not_covered(tmp_path):
    text = coverage.build(make(tmp_path), today=TODAY)
    not_covered = text.split("## Not covered")[1].split("## How to read")[0]
    line = next(l for l in not_covered.splitlines() if l.startswith("- Places with no watcher"))
    assert line == "- Places with no watcher (2): YY, ZZ."
    assert re.search(r"^- Places with instruments but no stored text, link only \(1\): YY\.$", not_covered, re.M)
    assert re.search(r"^- Families with no instrument anywhere in the register \(4\): F2, F4, F5, F7\.$",
                     not_covered, re.M)


def test_place_with_only_adopted_records_is_listed_as_published_only(tmp_path):
    repo = make(tmp_path)
    (repo / "register" / "AA").mkdir()
    (repo / "register" / "AA" / "scope.json").write_text(json.dumps([
        {"id": "law", "title": "Adopted Law", "law_family": "F1", "source_row": "PASS",
         "status": "stored", "in_force": "2021-01-01"}]))
    (repo / "records" / "AA" / "law").mkdir(parents=True)
    (repo / "records" / "AA" / "law" / "2021-01-01-adopted-en.json").write_text(json.dumps(
        {"source_id": "PASS", "in_force": "2021-01-01", "kind": "adopted", "language": "en", "text": "placeholder"}))
    text = coverage.build(repo, today=TODAY)
    not_covered = text.split("## Not covered")[1].split("## How to read")[0]
    assert re.search(r"^- Places whose stored texts are the acts as published, no consolidated text \(1\): AA\. ",
                     not_covered, re.M)
    assert "| Places with stored text but no consolidated text (as published only) | 1 |" in text


def test_header_carries_date_and_placeholder_sentence(tmp_path):
    text = coverage.build(make(tmp_path), today=TODAY)
    header = text.split("## Counts")[0]
    assert "Generated on 2026-11-02 by `python3 tools/coverage.py`" in header
    assert "placeholders pending GEL-02-06" in header
    assert "says nothing about whether any company complies" in header
    for line in text.split("## Counts")[1].split("## Not covered")[0].splitlines():
        if line.startswith("| ") and not line.startswith("| Count"):
            assert line.endswith("| 2026-11-02 | `python3 tools/coverage.py` |"), line


def test_placeholder_sentence_goes_when_cadence_is_measured(tmp_path):
    measured = {**CADENCE, "measured": True}
    text = coverage.build(make(tmp_path, cadence=measured), today=TODAY)
    assert "placeholders pending GEL-02-06" not in text


def test_no_seen_file_falls_back_to_licence_row(tmp_path):
    text = coverage.build(make(tmp_path, seen=False), today=TODAY)
    assert "`upkeep/seen.json` does not exist yet" in text
    assert instrument_row(text, "act")[4:6] == ["2026-11-01", "licence row"]


def test_main_writes_only_coverage_md(tmp_path):
    repo = make(tmp_path)
    before = sorted(str(p.relative_to(repo)) for p in repo.rglob("*") if p.is_file())
    assert coverage.main(["--repo", str(repo)]) == 0
    after = sorted(str(p.relative_to(repo)) for p in repo.rglob("*") if p.is_file())
    assert sorted(set(after) - set(before)) == ["COVERAGE.md"]
    assert (repo / "COVERAGE.md").read_text(encoding="utf-8").startswith("# Coverage and currency")


def test_missing_cadence_file_is_an_error(tmp_path):
    repo = make(tmp_path)
    (repo / "upkeep" / "cadence.json").unlink()
    with pytest.raises(ValueError):
        coverage.build(repo, today=TODAY)
