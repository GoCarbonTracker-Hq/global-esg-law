import csv
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from make_sources import COLUMNS, build  # noqa: E402

with open(ROOT / "sources" / "licence-table.csv", newline="", encoding="utf-8") as f:
    REAL = next(r for r in csv.DictReader(f) if r["verdict"] == "pass")


def run(tmp_path, **over):
    src = tmp_path / "t.csv"
    with open(src, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, COLUMNS)
        w.writeheader()
        w.writerow({**REAL, **over})
    out = tmp_path / "sources.json"
    build(src, out)
    return out


def test_pass_through(tmp_path):
    out = run(tmp_path)
    assert json.loads(out.read_text())[0]["id"] == REAL["id"]


@pytest.mark.parametrize("over", [
    {"publisher": "ISO"},
    {"source_name": "Global Reporting Initiative standards"},
    {"publisher": "International Organization for Standardization"},
    {"terms_url": ""},
    {"terms_quote": ""},
    {"verdict": "maybe"},
    {"pinned_version": "", "content_hash": ""},
])
def test_refusals(tmp_path, over):
    with pytest.raises(SystemExit) as e:
        run(tmp_path, **over)
    assert REAL["id"] in str(e.value)


def test_every_licence_row_has_the_header_field_count():
    with open(ROOT / "sources" / "licence-table.csv", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        width = len(next(reader))
        bad = [(reader.line_num, row[0], len(row)) for row in reader if row and len(row) != width]
    assert bad == [], f"rows not {width} fields wide (line, id, fields): {bad}"


def test_build_refuses_duplicate_id(tmp_path):
    src = tmp_path / "t.csv"
    with open(src, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, COLUMNS)
        w.writeheader()
        w.writerows([REAL, REAL])
    with pytest.raises(SystemExit, match="duplicate id"):
        build(src, tmp_path / "sources.json")


def test_load_sources_collapses_identical_and_rejects_conflicts(tmp_path):
    from make_sources import load_sources
    path = tmp_path / "sources.json"
    path.write_text(json.dumps([{"id": "A", "verdict": "pass"}, {"id": "A", "verdict": "pass"}]))
    assert load_sources(path) == {"A": {"id": "A", "verdict": "pass"}}
    path.write_text(json.dumps([{"id": "A", "verdict": "fail"}, {"id": "A", "verdict": "pass"}]))
    with pytest.raises(ValueError, match="conflicting duplicate rows for id 'A'"):
        load_sources(path)


def test_real_table_has_unique_ids_and_no_blank_lines():
    lines = (ROOT / "sources" / "licence-table.csv").read_text(encoding="utf-8").splitlines()
    assert all(line.strip() for line in lines)
    ids = [line.split(",", 1)[0] for line in lines[1:]]
    assert len(ids) == len(set(ids))
