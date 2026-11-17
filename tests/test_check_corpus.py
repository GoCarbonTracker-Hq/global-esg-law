import json
import subprocess
import sys
from pathlib import Path

import pytest

TOOLS = Path(__file__).resolve().parents[1] / "tools"
sys.path.insert(0, str(TOOLS))
import check_corpus


def make(repo, **over):
    """One passing record; `over` keys: verdict, form, publisher, kind, source_id, scope_row, instrument, title, status."""
    row = {"id": "R1", "verdict": over.get("verdict", "pass"), "form": over.get("form", "adopted"),
           "publisher": over.get("publisher", "Placeholder Office"), "source_name": "Placeholder Journal"}
    (repo / "sources.json").write_text(json.dumps([row]))
    (repo / "register" / "XX").mkdir(parents=True)
    (repo / "register" / "XX" / "scope.json").write_text(json.dumps([
        {"id": "act", "title": over.get("title", "Placeholder Act"), "source_row": over.get("scope_row", "R1"),
         "status": over.get("status", "stored")}]))
    folder = repo / "records" / "XX" / over.get("instrument", "act")
    folder.mkdir(parents=True)
    (folder / "r.json").write_text(json.dumps({
        "source_id": over.get("source_id", "R1"), "in_force": "2020-01-01",
        "kind": over.get("kind", "adopted"), "language": over.get("language", "en"), "text": "placeholder text",
        "fetched_url": "https://example.org/act", "fetched_sha256": "a" * 64}))


def refused(repo, reason):
    with pytest.raises(ValueError) as exc:
        check_corpus.check(repo, strict=True)
    assert "records/XX/" in str(exc.value) and reason in str(exc.value)


def test_pass(tmp_path):
    make(tmp_path)
    assert check_corpus.check(tmp_path) == 1


def test_zero_records(tmp_path):
    (tmp_path / "sources.json").write_text("[]")
    assert check_corpus.check(tmp_path) == 0


@pytest.mark.parametrize("verdict", ["fail", "unknown", "permission requested"])
def test_nonpass_verdict(tmp_path, verdict):
    make(tmp_path, verdict=verdict)
    refused(tmp_path, "not 'pass'")


def test_missing_source_row(tmp_path):
    make(tmp_path, source_id="NOPE")
    refused(tmp_path, "not in sources.json")


def test_kind_not_allowed(tmp_path):
    make(tmp_path, kind="draft")
    refused(tmp_path, "is not one of")


def test_kind_differs_from_form(tmp_path):
    make(tmp_path, kind="translation")
    refused(tmp_path, "differs from source")


def test_instrument_missing_from_scope(tmp_path):
    make(tmp_path, instrument="other")
    refused(tmp_path, "scope.json")


def test_source_id_differs_from_source_row(tmp_path):
    make(tmp_path, scope_row="R2")
    refused(tmp_path, "source_row")


@pytest.mark.parametrize("over", [{"publisher": "International Organization for Standardization"},
                                  {"title": "GRI 305 Emissions"}])
def test_banned_standards_name(tmp_path, over):
    make(tmp_path, **over)
    refused(tmp_path, "standards text")


def test_body_text_may_cite_standard(tmp_path):
    make(tmp_path)
    path = tmp_path / "records" / "XX" / "act" / "r.json"
    record = json.loads(path.read_text())
    record["text"] = "placeholder text citing GRI and ISO 14064"
    path.write_text(json.dumps(record))
    assert check_corpus.check(tmp_path) == 1


def test_source_row_list(tmp_path):
    make(tmp_path, scope_row=["R0", "R1"])
    assert check_corpus.check(tmp_path) == 1
    make_other = tmp_path / "records" / "XX" / "act" / "r.json"
    make_other.write_text(make_other.read_text().replace('"R1"', '"R9"'))
    with pytest.raises(ValueError):
        check_corpus.check(tmp_path)


def test_language_is_required_and_must_be_iso_639_1(tmp_path):
    make(tmp_path)
    path = tmp_path / "records" / "XX" / "act" / "r.json"
    record = json.loads(path.read_text())
    for bad in (None, "", "EN", "eng", 5):
        path.write_text(json.dumps({**{k: v for k, v in record.items() if k != "language"}, **({} if bad is None else {"language": bad})}))
        refused(tmp_path, "ISO 639-1")


def test_new_file_name_must_end_in_the_record_language(tmp_path):
    make(tmp_path)
    folder = tmp_path / "records" / "XX" / "act"
    (folder / "r.json").rename(folder / "2020-01-01-adopted-en.json")
    assert check_corpus.check(tmp_path) == 1
    (folder / "2020-01-01-adopted-en.json").rename(folder / "2020-01-01-adopted-fr.json")
    refused(tmp_path, "file name ends -fr but language is 'en'")


def test_applies_from_must_be_a_real_date(tmp_path):
    make(tmp_path)
    scope = tmp_path / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[0]["applies_from"] = "2027-13-40"
    scope.write_text(json.dumps(entries))
    refused(tmp_path, "applies_from")
    entries[0]["applies_from"] = "2027-12-14"
    scope.write_text(json.dumps(entries))
    assert check_corpus.check(tmp_path) == 1


def test_conflicting_duplicate_source_rows_refused(tmp_path):
    make(tmp_path)
    rows = json.loads((tmp_path / "sources.json").read_text())
    (tmp_path / "sources.json").write_text(json.dumps([{**rows[0], "verdict": "fail"}, rows[0]]))
    with pytest.raises(ValueError, match="conflicting duplicate rows"):
        check_corpus.check(tmp_path)


def edit_record(repo, **changes):
    """Change keys of the one record written by make(); a value of None deletes the key."""
    path = repo / "records" / "XX" / "act" / "r.json"
    record = {**json.loads(path.read_text()), **changes}
    path.write_text(json.dumps({k: v for k, v in record.items() if v is not None}))


@pytest.mark.parametrize("status", ["link only", "pending", "Stored", None])
def test_scope_status_must_be_stored(tmp_path, status):
    make(tmp_path, status=status)
    refused(tmp_path, "not 'stored'")


@pytest.mark.parametrize("changes", [{"fetched_url": None}, {"fetched_url": "  "}, {"fetched_url": 5}])
def test_fetched_url_required_on_a_fetched_record(tmp_path, changes):
    make(tmp_path)
    edit_record(tmp_path, **changes)
    refused(tmp_path, "fetched_url")


@pytest.mark.parametrize("sha", [None, "", "A" * 64, "a" * 63, "g" * 64, 5])
def test_fetched_sha256_must_be_64_lowercase_hex(tmp_path, sha):
    make(tmp_path)
    edit_record(tmp_path, fetched_sha256=sha)
    refused(tmp_path, "fetched_sha256")


def test_repealed_stub_needs_no_fetched_fields_or_message(tmp_path):
    make(tmp_path)
    edit_record(tmp_path, text="", repealed=True, fetched_url=None, fetched_sha256=None)
    assert check_corpus.check(tmp_path, strict=True) == 1


def test_record_must_sit_exactly_at_records_place_instrument_file(tmp_path):
    make(tmp_path)
    folder = tmp_path / "records" / "XX" / "act"
    (folder / "sub").mkdir()
    (folder / "r.json").rename(folder / "sub" / "r.json")
    refused(tmp_path, "records/<ISO2>/<instrument>/<file>.json")
    (folder / "sub" / "r.json").rename(tmp_path / "records" / "XX" / "r.json")
    refused(tmp_path, "records/<ISO2>/<instrument>/<file>.json")
    (tmp_path / "records" / "XX" / "r.json").rename(tmp_path / "records" / "r.json")
    with pytest.raises(ValueError, match="records/r.json: record is not at records/<ISO2>/<instrument>/<file>.json"):
        check_corpus.check(tmp_path)


def test_in_force_must_be_a_real_date(tmp_path):
    make(tmp_path)
    for bad in ("2025-02-30", "2025-2-3", 20250101):
        edit_record(tmp_path, in_force=bad)
        refused(tmp_path, "in_force")


def test_null_in_force_falls_back_to_the_file_name_date(tmp_path):
    make(tmp_path)
    folder = tmp_path / "records" / "XX" / "act"
    (folder / "r.json").rename(folder / "2020-01-01-adopted-en.json")
    path = folder / "2020-01-01-adopted-en.json"
    path.write_text(json.dumps({**json.loads(path.read_text()), "in_force": None}))
    assert check_corpus.check(tmp_path, strict=True) == 1
    path.rename(folder / "2020-02-30-adopted-en.json")
    refused(tmp_path, "2020-02-30")


@pytest.mark.parametrize("iso2", ["zz", "xx", "X", "XXX", "X1", ""])
def test_iso2_must_be_an_uppercase_place_with_a_scope_file(tmp_path, iso2):
    make(tmp_path)
    with pytest.raises(ValueError, match="--iso2"):
        check_corpus.check(tmp_path, iso2=iso2)


def test_iso2_valid_place_is_checked(tmp_path):
    make(tmp_path)
    assert check_corpus.check(tmp_path, iso2="XX") == 1


def test_strict_false_skips_the_strict_record_rules_and_the_default_is_strict(tmp_path):
    make(tmp_path, status="link only")
    edit_record(tmp_path, in_force="2025-02-30", fetched_url=None, fetched_sha256=None)
    assert check_corpus.check(tmp_path, strict=False) == 1
    refused(tmp_path, "in_force")
    with pytest.raises(ValueError, match="in_force"):
        check_corpus.check(tmp_path)


def test_cli_is_strict(tmp_path):
    make(tmp_path)
    run = lambda: subprocess.run([sys.executable, str(TOOLS / "check_corpus.py"), str(tmp_path)],
                                 capture_output=True, text=True)
    assert run().returncode == 0
    edit_record(tmp_path, fetched_sha256=None)
    done = run()
    assert done.returncode == 1 and "fetched_sha256" in done.stderr


def test_cli_exits_1_on_a_bad_iso2(tmp_path):
    make(tmp_path)
    run = lambda iso2: subprocess.run([sys.executable, str(TOOLS / "check_corpus.py"), str(tmp_path), "--iso2", iso2],
                                      capture_output=True, text=True)
    assert run("XX").returncode == 0
    for bad in ("xx", "ZZ"):
        done = run(bad)
        assert done.returncode == 1 and "--iso2" in done.stderr
