import json
import subprocess
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parents[1] / "tools"
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))
import amends_gap


def fixture(tmp_path, excused=None):
    """A register with one amender of each kind (named by `named`, outside, unresolved) and the entry that names."""
    entries = [
        {"id": "target", "notes": "Amended by the named act."},
        {"id": "named", "notes": "Base text.", "amends_ids": ["target"]},
        {"id": "outside", "notes": "Amended by an act that is not an entry."},
        {"id": "gap", "notes": "Amended by another act."},
    ]
    (tmp_path / "register" / "XX").mkdir(parents=True, exist_ok=True)
    (tmp_path / "register" / "XX" / "scope.json").write_text(json.dumps(entries))
    (tmp_path / "outside.json").write_text(json.dumps({"outside": "no entry", **(excused or {})}))
    return ["--register", str(tmp_path / "register"), "--outside", str(tmp_path / "outside.json")]


def test_unresolved_fails_then_passes_once_listed(tmp_path, capsys):
    args = fixture(tmp_path)
    assert amends_gap.main(args) == 1
    assert capsys.readouterr().out.splitlines() == [
        "unresolved 1, named 1, outside the register 1", "unresolved: gap"]
    fixture(tmp_path, excused={"gap": "no entry"})
    assert amends_gap.main(args) == 0
    assert capsys.readouterr().out == "unresolved 0, named 1, outside the register 2\n"


def test_stale_exception_fails(tmp_path, capsys):
    args = fixture(tmp_path, excused={"gap": "no entry", "target": "named after all", "named": "no note", "ghost": "no entry"})
    assert amends_gap.main(args) == 1
    err = capsys.readouterr().err
    assert all(f"stale exception: {i} " in err for i in ("target", "named", "ghost")) and "gap" not in err


def test_real_register():
    run = subprocess.run([sys.executable, str(TOOLS / "amends_gap.py")], capture_output=True, text=True, cwd=ROOT)
    assert run.returncode == 0, run.stdout + run.stderr
    assert run.stdout.startswith("unresolved 0,")
