import csv
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
from make_sources import COLUMNS, build  # noqa: E402

GOOD = {c: "x" for c in COLUMNS}
GOOD.update(publisher="P", source_name="S", form="adopted", verdict="pass",
            terms_url="https://t", terms_quote="q")


def run(tmp_path, **over):
    row = {**GOOD, **over, "id": "R1"}
    src = tmp_path / "t.csv"
    with open(src, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, COLUMNS)
        w.writeheader()
        w.writerow(row)
    out = tmp_path / "sources.json"
    build(src, out)
    return out


def test_pass_through(tmp_path):
    out = run(tmp_path)
    assert json.loads(out.read_text())[0]["id"] == "R1"


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
    assert "R1" in str(e.value) or "R1:" in str(e.value)
