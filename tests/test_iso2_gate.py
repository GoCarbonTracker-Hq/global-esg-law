"""--iso2 on check_corpus and publish_gate: a broken place does not fail another place's run."""
import json
import subprocess
import sys
from pathlib import Path

import pytest

TOOLS = Path(__file__).resolve().parents[1] / "tools"
sys.path.insert(0, str(TOOLS))
import check_corpus
import publish_gate


def two_places(repo):
    """Place AA is good. Place BB is broken: its record names a source row that does not pass."""
    rows = [{"id": "R1", "verdict": "pass", "form": "adopted", "publisher": "P", "source_name": "S"},
            {"id": "R2", "verdict": "refused", "form": "adopted", "publisher": "P", "source_name": "S"}]
    (repo / "sources.json").write_text(json.dumps(rows))
    for iso2, row in (("AA", "R1"), ("BB", "R2")):
        (repo / "register" / iso2).mkdir(parents=True)
        (repo / "register" / iso2 / "scope.json").write_text(json.dumps([
            {"id": "act", "title": "Placeholder Act", "status": "stored", "source_row": row}]))
        folder = repo / "records" / iso2 / "act"
        folder.mkdir(parents=True)
        (folder / "r.json").write_text(json.dumps({
            "source_id": row, "kind": "adopted", "language": "en", "text": "placeholder text"}))


def test_check_corpus_iso2_ignores_other_place(tmp_path):
    two_places(tmp_path)
    assert check_corpus.check(tmp_path, iso2="AA") == 1
    with pytest.raises(ValueError, match="records/BB/"):
        check_corpus.check(tmp_path)


def test_check_corpus_cli_iso2(tmp_path):
    two_places(tmp_path)
    run = lambda *a: subprocess.run([sys.executable, str(TOOLS / "check_corpus.py"), *a], capture_output=True, text=True)
    ok = run(str(tmp_path), "--iso2", "AA")
    assert ok.returncode == 0 and ok.stdout.strip() == "1 records checked"
    assert run(str(tmp_path)).returncode == 1


def test_publish_gate_iso2_ignores_other_place(tmp_path):
    two_places(tmp_path)
    report, bad = publish_gate.gate(tmp_path, iso2="AA")
    assert bad == [] and report == ["source R1: pass", "scope AA/act: stored, 1 records"]
    assert any("BB/act" in line for line in publish_gate.gate(tmp_path)[1])


def test_publish_gate_cli_iso2(tmp_path):
    two_places(tmp_path)
    run = lambda *a: subprocess.run([sys.executable, str(TOOLS / "publish_gate.py"), *a], capture_output=True, text=True)
    assert run(str(tmp_path), "--iso2", "AA").returncode == 0
    assert run(str(tmp_path)).returncode == 1
