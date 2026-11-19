import json
import subprocess
import sys
from pathlib import Path

import pytest

TOOLS = Path(__file__).resolve().parents[1] / "tools"
sys.path.insert(0, str(TOOLS))
import publish_gate


def make(repo, status="stored", verdict="pass", records=1, source_row="R1"):
    (repo / "sources.json").write_text(json.dumps([{"id": "R1", "verdict": verdict}, {"id": "R2", "verdict": "pass"},
                                                   {"id": "R3", "verdict": "fail"}]))
    (repo / "register" / "XX").mkdir(parents=True)
    (repo / "register" / "XX" / "scope.json").write_text(json.dumps([
        {"id": "act", "status": status, "source_row": source_row}]))
    folder = repo / "records" / "XX" / "act"
    folder.mkdir(parents=True)
    for i in range(records):
        (folder / f"{i}.json").write_text(json.dumps({"source_id": "R1", "in_force": f"2020-01-0{i + 1}"}))


def refusals(repo):
    report, bad = publish_gate.gate(repo)
    assert any("source R1" in line for line in report) and any("XX/act" in line for line in report)
    return bad


def test_pass(tmp_path):
    make(tmp_path)
    assert refusals(tmp_path) == []


def test_link_only_without_records_passes(tmp_path):
    make(tmp_path, status="link only", records=0)
    assert refusals(tmp_path) == []


def test_pending(tmp_path):
    make(tmp_path, status="pending", records=0)
    assert "pending" in refusals(tmp_path)[0]


def test_stored_without_record(tmp_path):
    make(tmp_path, records=0)
    assert "no record" in refusals(tmp_path)[0]


def test_stored_with_non_pass_row(tmp_path):
    make(tmp_path, verdict="permission requested")
    assert "not 'pass'" in refusals(tmp_path)[0]


def test_link_only_with_records(tmp_path):
    make(tmp_path, status="link only")
    assert "link only but has 1" in refusals(tmp_path)[0]


def test_later_record_after_repeal_requires_reenactment_flag(tmp_path):
    make(tmp_path, records=2)
    folder = tmp_path / "records" / "XX" / "act"
    (folder / "0.json").write_text(json.dumps({"source_id": "R1", "in_force": "2024-06-01", "repealed": True}))
    (folder / "1.json").write_text(json.dumps({"source_id": "R1", "in_force": "2024-06-02"}))
    assert any("after repeal" in line for line in refusals(tmp_path))


def test_flagged_reenactment_after_repeal_passes(tmp_path):
    make(tmp_path, records=2)
    folder = tmp_path / "records" / "XX" / "act"
    (folder / "0.json").write_text(json.dumps({"source_id": "R1", "in_force": "2024-06-01", "repealed": True}))
    (folder / "1.json").write_text(json.dumps({"source_id": "R1", "in_force": "2024-06-02", "re_enactment": True}))
    assert refusals(tmp_path) == []


def test_conflicting_duplicate_source_rows_refused(tmp_path):
    import pytest
    make(tmp_path)
    (tmp_path / "sources.json").write_text(json.dumps([{"id": "R1", "verdict": "fail"}, {"id": "R1", "verdict": "pass"}]))
    with pytest.raises(ValueError, match="conflicting duplicate rows"):
        publish_gate.gate(tmp_path)


def test_identical_duplicate_source_rows_print_once(tmp_path):
    make(tmp_path)
    (tmp_path / "sources.json").write_text(json.dumps([{"id": "R1", "verdict": "pass"}] * 2))
    report, bad = publish_gate.gate(tmp_path)
    assert sum("source R1" in line for line in report) == 1 and not bad


def edit_record(repo, name="0.json", **changes):
    path = repo / "records" / "XX" / "act" / name
    path.write_text(json.dumps({**json.loads(path.read_text()), **changes}))


def test_record_source_id_must_pass_even_when_scope_row_does(tmp_path):
    make(tmp_path)
    edit_record(tmp_path, source_id="R3")
    bad = refusals(tmp_path)
    assert any("R3" in line and "not 'pass'" in line for line in bad)


def test_record_source_id_must_be_in_sources(tmp_path):
    make(tmp_path)
    edit_record(tmp_path, source_id="NOPE")
    assert any("NOPE" in line for line in refusals(tmp_path))


def test_record_source_id_must_be_a_scope_source_row(tmp_path):
    make(tmp_path)
    edit_record(tmp_path, source_id="R2")
    assert any("R2" in line and "source_row" in line for line in refusals(tmp_path))


def test_record_source_id_in_a_scope_row_list_passes(tmp_path):
    make(tmp_path, source_row=["R1", "R2"])
    edit_record(tmp_path, source_id="R2")
    assert refusals(tmp_path) == []


def test_orphan_instrument_folder_is_refused(tmp_path):
    make(tmp_path)
    orphan = tmp_path / "records" / "XX" / "other"
    orphan.mkdir()
    (orphan / "0.json").write_text(json.dumps({"source_id": "R1", "in_force": "2020-01-01"}))
    (orphan / "1.json").write_text(json.dumps({"source_id": "R1", "in_force": "2020-01-02"}))
    bad = refusals(tmp_path)
    assert len(bad) == 1 and "XX/other" in bad[0] and "scope.json" in bad[0]


def test_orphan_place_without_scope_file_is_refused(tmp_path):
    make(tmp_path)
    orphan = tmp_path / "records" / "YY" / "act"
    orphan.mkdir(parents=True)
    (orphan / "0.json").write_text(json.dumps({"source_id": "R1", "in_force": "2020-01-01"}))
    assert any("YY/act" in line for line in refusals(tmp_path))
    assert publish_gate.gate(tmp_path, iso2="XX")[1] == []


def test_non_record_file_in_an_unlisted_folder_is_not_an_orphan(tmp_path):
    make(tmp_path)
    stray = tmp_path / "records" / "XX" / "test-dir"
    stray.mkdir()
    (stray / "test.txt").write_text("x")
    assert refusals(tmp_path) == []


def test_record_one_folder_too_deep_is_refused_under_a_link_only_entry(tmp_path):
    make(tmp_path, status="link only", records=0)
    deep = tmp_path / "records" / "XX" / "act" / "sub"
    deep.mkdir()
    (deep / "0.json").write_text(json.dumps({"source_id": "R1", "in_force": "2020-01-01"}))
    assert any("records/<ISO2>/<instrument>/<file>.json" in line for line in refusals(tmp_path))


@pytest.mark.parametrize("status", ["Stored", "stored ", "done", None])
def test_unknown_status_is_refused(tmp_path, status):
    make(tmp_path, status=status, verdict="fail")
    assert any("status" in line and "stored, link only or pending" in line for line in refusals(tmp_path))


@pytest.mark.parametrize("iso2", ["zz", "xx", "X", "XXX", ""])
def test_iso2_must_be_an_uppercase_place_with_a_scope_file(tmp_path, iso2):
    make(tmp_path)
    with pytest.raises(ValueError, match="--iso2"):
        publish_gate.gate(tmp_path, iso2=iso2)


def test_cli_exits_1_on_a_bad_iso2(tmp_path):
    make(tmp_path)
    run = lambda iso2: subprocess.run([sys.executable, str(TOOLS / "publish_gate.py"), str(tmp_path), "--iso2", iso2],
                                      capture_output=True, text=True)
    assert run("XX").returncode == 0
    for bad in ("xx", "ZZ"):
        done = run(bad)
        assert done.returncode == 1 and "--iso2" in done.stderr


@pytest.mark.parametrize("in_force", ["2020-02-30", "2020-13-01", "2020-1-5", 20200101])
def test_an_impossible_record_date_is_refused(tmp_path, in_force):  # T16
    make(tmp_path)
    (tmp_path / "records" / "XX" / "act" / "0.json").write_text(json.dumps({"source_id": "R1", "in_force": in_force}))
    assert any("0.json" in line and "not a real date" in line for line in refusals(tmp_path))


def test_an_impossible_file_name_date_is_refused_when_in_force_is_null(tmp_path):  # T16
    make(tmp_path)
    folder = tmp_path / "records" / "XX" / "act"
    (folder / "0.json").unlink()
    (folder / "2020-02-30-adopted-en.json").write_text(json.dumps({"source_id": "R1", "in_force": None}))
    assert any("2020-02-30" in line and "not a real date" in line for line in refusals(tmp_path))
