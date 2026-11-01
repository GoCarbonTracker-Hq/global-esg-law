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
