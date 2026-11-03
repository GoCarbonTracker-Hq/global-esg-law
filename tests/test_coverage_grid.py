import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import coverage_grid


def make(repo):
    """Fixture repo: XX has a record, YY has a scope file and no record, ZZ has neither."""
    (repo / "register" / "XX").mkdir(parents=True)
    (repo / "register" / "YY").mkdir()
    with (repo / "register" / "register.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["iso2", "country"])
        writer.writeheader()
        writer.writerows([{"iso2": c, "country": c} for c in ("ZZ", "XX", "YY", "XX")])
    for code in ("XX", "YY"):
        (repo / "register" / code / "scope.json").write_text(json.dumps([{"id": "act", "status": "stored"}]))
    (repo / "records" / "XX" / "act").mkdir(parents=True)
    (repo / "records" / "XX" / "act" / "2020-01-01-adopted.json").write_text(json.dumps({"in_force": "2020-01-01"}))
    (repo / "upkeep").mkdir()
    (repo / "upkeep" / "cadence.json").write_text(json.dumps({"measured_on": "2026-11-03"}))
    return repo


def test_grid_counts_and_order(tmp_path):
    svg = coverage_grid.build(make(tmp_path))
    assert "As of 2026-11-03: 3 places. 1 with text stored, 1 link only, 1 with no corpus." in svg
    assert re.findall(r'text-anchor="middle" fill="#[0-9a-f]{6}">([A-Z]{2})<', svg) == ["XX", "YY", "ZZ"]


def test_two_runs_give_identical_bytes(tmp_path):
    repo = make(tmp_path)
    assert coverage_grid.main(["--repo", str(repo)]) == 0
    first = (repo / "assets" / "coverage-grid.svg").read_bytes()
    assert coverage_grid.main(["--repo", str(repo)]) == 0
    assert (repo / "assets" / "coverage-grid.svg").read_bytes() == first
