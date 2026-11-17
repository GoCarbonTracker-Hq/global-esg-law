"""The register rows of every place with a scope.json carry a real status, not the placeholder."""
import csv
from collections import Counter
from pathlib import Path

from conftest import real_scope_paths

ROOT = Path(__file__).resolve().parent.parent
PILOT = tuple(sorted(p.parent.name for p in real_scope_paths(ROOT)))  # every place with a scope list (GEL_ISO2: one place)
PLACEHOLDER = "scope list entry"
# Open question for Varun (GEL-33 F3-3): one bill listed as F1 and as F7 with different status text; the family is a policy call.
OPEN_DUPLICATES = {("LU", "Projet de loi n° 8370 transposing Directive (EU) 2022/2464")}


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


def test_no_duplicate_place_and_title_except_the_open_lu_pair():
    counts = Counter((r["iso2"], r["instrument_title"]) for r in _rows() if r["instrument_title"].strip())
    assert {key for key, n in counts.items() if n > 1} - OPEN_DUPLICATES == set()
