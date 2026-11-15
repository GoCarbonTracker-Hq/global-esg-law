"""The register rows of every place with a scope.json carry a real status, not the placeholder."""
import csv
from pathlib import Path

from conftest import real_scope_paths

ROOT = Path(__file__).resolve().parent.parent
PILOT = tuple(sorted(p.parent.name for p in real_scope_paths(ROOT)))  # every place with a scope list (GEL_ISO2: one place)
PLACEHOLDER = "scope list entry"


def _rows():
    with open(ROOT / "register" / "register.csv", newline="") as f:
        return list(csv.DictReader(f))


def test_pilot_rows_exist():
    assert any(r["iso2"] in PILOT for r in _rows())


def test_no_pilot_row_keeps_the_placeholder_status():
    bad = [(r["iso2"], r["instrument_title"]) for r in _rows()
           if r["iso2"] in PILOT and r["status"].startswith(PLACEHOLDER)]
    assert bad == []


def test_every_row_has_the_header_field_count():
    with open(ROOT / "register" / "register.csv", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        width = len(next(reader))
        bad = [(reader.line_num, row[0], len(row)) for row in reader if len(row) != width]
    assert bad == [], f"rows not {width} fields wide (line, iso2, fields): {bad}"
