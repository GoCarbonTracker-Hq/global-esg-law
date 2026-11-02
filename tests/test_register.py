"""The register rows of the four pilot places carry a real status, not the placeholder."""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PILOT = ("EU", "GB", "IN", "US")
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
