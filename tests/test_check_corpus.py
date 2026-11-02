import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import check_corpus


def make(repo, **over):
    """One passing record; `over` keys: verdict, form, publisher, kind, source_id, scope_row, instrument, title."""
    row = {"id": "R1", "verdict": over.get("verdict", "pass"), "form": over.get("form", "adopted"),
           "publisher": over.get("publisher", "Placeholder Office"), "source_name": "Placeholder Journal"}
    (repo / "sources.json").write_text(json.dumps([row]))
    (repo / "register" / "XX").mkdir(parents=True)
    (repo / "register" / "XX" / "scope.json").write_text(json.dumps([
        {"id": "act", "title": over.get("title", "Placeholder Act"), "source_row": over.get("scope_row", "R1")}]))
    folder = repo / "records" / "XX" / over.get("instrument", "act")
    folder.mkdir(parents=True)
    (folder / "r.json").write_text(json.dumps({
        "source_id": over.get("source_id", "R1"), "in_force": "2020-01-01",
        "kind": over.get("kind", "adopted"), "language": over.get("language", "en"), "text": "placeholder text"}))


def refused(repo, reason):
    with pytest.raises(ValueError) as exc:
        check_corpus.check(repo)
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
