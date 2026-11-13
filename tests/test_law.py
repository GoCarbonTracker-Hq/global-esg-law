import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build
import law
from test_build import fixture


def make(tmp_path, extra=()):
    fixture(tmp_path)
    scope = tmp_path / "register" / "EU" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[1]["status_note"] = "stayed by a court"
    scope.write_text(json.dumps(entries))
    for name, effective in extra:  # a second version of law2
        (tmp_path / "records" / "EU" / "law2" / f"{name}.json").write_text(json.dumps(
            {"source_id": "new", "in_force": effective, "kind": "adopted", "language": "en", "text": name}))
    build.build(tmp_path, branch="history")
    return tmp_path


def ids(found):
    return [i["id"] for i in found]


def test_lookups_before_between_after(tmp_path):
    repo = make(tmp_path)
    assert law.in_force("EU", "1960-01-01", repo) == []
    assert ids(law.in_force("EU", "1965-01-02", repo)) == ["law"]
    assert ids(law.in_force("EU", "2000-01-01", repo)) == ["law"]
    found = law.in_force("EU", "2021-01-01", repo)
    assert ids(found) == ["law", "law2"]
    assert set(found[0]) == {"id", "title", "in_force", "kind", "source_url", "licence", "commit"}


def test_latest_version_wins(tmp_path):
    repo = make(tmp_path, [("newer", "2022-01-01")])
    by_id = {i["id"]: i for i in law.in_force("EU", "2023-01-01", repo)}
    assert by_id["law2"]["in_force"] == "2022-01-01"
    assert {i["id"]: i for i in law.in_force("EU", "2021-01-01", repo)}["law2"]["in_force"] == "2020-03-04"


@pytest.mark.parametrize(("adopted_id", "consolidated_id"), [("a-adopted", "z-consolidated"),
                                                               ("z-adopted", "a-consolidated")])
def test_consolidated_wins_same_day_for_either_source_id_order(tmp_path, adopted_id, consolidated_id):
    fixture(tmp_path)
    sources = json.loads((tmp_path / "sources.json").read_text())
    sources[1]["id"] = adopted_id
    sources.append({**sources[1], "id": consolidated_id, "form": "consolidated"})
    (tmp_path / "sources.json").write_text(json.dumps(sources))
    scope = tmp_path / "register" / "EU" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[1]["source_row"] = [adopted_id, consolidated_id]
    scope.write_text(json.dumps(entries))
    record = tmp_path / "records" / "EU" / "law2" / "new.json"
    data = json.loads(record.read_text())
    data["source_id"] = adopted_id
    (tmp_path / "records" / "EU" / "law2" / "2020-03-04-adopted.json").write_text(json.dumps(data))
    record.unlink()
    (tmp_path / "records" / "EU" / "law2" / "2020-03-04-consolidated.json").write_text(json.dumps(
        {**data, "source_id": consolidated_id, "kind": "consolidated", "text": "consolidated"}))
    build.build(tmp_path, branch="history")
    shown = {i["id"]: i for i in law.in_force("EU", "2020-03-04", tmp_path)}["law2"]
    assert shown["kind"] == "consolidated"


def test_status_note_passthrough(tmp_path):
    repo = make(tmp_path)
    by_id = {i["id"]: i for i in law.in_force("EU", "2021-01-01", repo)}
    assert by_id["law2"]["status_note"] == "stayed by a court"
    assert "status_note" not in by_id["law"]


def commit_on_history(repo, message, *extra_parents):
    git = lambda *a: subprocess.check_output(["git", "-C", str(repo), "-c", "user.name=T", "-c", "user.email=t@x.org", *a], text=True).strip()
    tree = git("rev-parse", "history^{tree}")
    sha = git("commit-tree", tree, "-p", "history", *[x for p in extra_parents for x in ("-p", p)], "-m", message)
    git("update-ref", "refs/heads/history", sha)


def test_first_parent_walk_ignores_side_branch(tmp_path):
    repo = make(tmp_path)
    git = lambda *a: subprocess.check_output(["git", "-C", str(repo), "-c", "user.name=T", "-c", "user.email=t@x.org", *a], text=True).strip()
    tree = git("rev-parse", "history^{tree}")
    side = git("commit-tree", tree, "-m", "side\n\nInstrument: Ghost\nIn-force: 1900-01-01\nKind: adopted\nJurisdiction: EU\nInstrument-id: ghost")
    commit_on_history(repo, "merge", side)
    assert ids(law.in_force("EU", "2021-01-01", repo)) == ["law", "law2"]


def test_in_force_order_beats_commit_order(tmp_path):
    repo = make(tmp_path)
    commit_on_history(repo, "late commit\n\nInstrument: Old Act\nSource-url: u\nIn-force: 1990-01-01\nKind: adopted\nLicence: CC0\nJurisdiction: EU\nInstrument-id: law")
    found = {i["id"]: i for i in law.in_force("EU", "2021-01-01", repo)}
    assert found["law"]["in_force"] == "1990-01-01"  # last in commit order, latest by In-force
    assert law.in_force("EU", "1980-01-01", repo)[0]["in_force"] == "1965-01-02"
    commit_on_history(repo, "backfill\n\nInstrument: New Act\nIn-force: 2010-01-01\nKind: adopted\nJurisdiction: EU\nInstrument-id: law2")
    found = {i["id"]: i for i in law.in_force("EU", "2021-01-01", repo)}
    assert found["law2"]["in_force"] == "2020-03-04"  # added last, but dated earlier


def test_not_yet_in_force_and_cli(tmp_path, capsys):
    repo = make(tmp_path)
    assert law.main(["EU", "2000-01-01", "--repo", str(repo)]) == 0
    out = capsys.readouterr().out
    assert "law\t1965-01-02" in out and "not yet in force" in out and "law2\t2020-03-04" in out
    assert law.main(["EU", "1960-01-01", "--repo", str(repo)]) == 0
    assert "nothing in force before 1965-01-02" in capsys.readouterr().out
    assert law.main(["EU", "2021-01-01", "--repo", str(repo)]) == 0
    assert "note law2: stayed by a court" in capsys.readouterr().out
    assert law.main(["EU", "1960-01-01", "--repo", str(repo), "--json"]) == 0
    assert json.loads(capsys.readouterr().out)["not_yet_in_force"][0]["id"] == "law"


def test_unknown_jurisdiction_and_bad_date(tmp_path, capsys):
    repo = make(tmp_path)
    assert law.main(["ZZ", "2020-01-01", "--repo", str(repo)]) == 2
    assert "EU" in capsys.readouterr().err
    for bad in ("2020-13-01", "2020-1-1", "yesterday"):
        assert law.main(["EU", bad, "--repo", str(repo)]) == 2


def test_pre_1970_date(tmp_path):
    repo = make(tmp_path)
    assert ids(law.in_force("EU", "1969-12-31", repo)) == ["law"]


def test_unknown_commencement_marks_publication_date_in_text_and_json(tmp_path, capsys):
    fixture(tmp_path)
    folder = tmp_path / "records" / "EU" / "law2"
    (folder / "1990-06-07-null.json").write_text(json.dumps(
        {"source_id": "new", "in_force": None, "kind": "adopted", "language": "en", "text": "unknown start"}))
    build.build(tmp_path, branch="history")
    assert law.main(["EU", "1990-06-07", "--repo", str(tmp_path)]) == 0
    assert "note law2: date is a publication date" in capsys.readouterr().out
    assert law.main(["EU", "1990-06-07", "--repo", str(tmp_path), "--json"]) == 0
    item = {i["id"]: i for i in json.loads(capsys.readouterr().out)["in_force"]}["law2"]
    assert item["date_basis"] == "publication"


def test_repeal_drops_instrument_from_its_date(tmp_path):
    fixture(tmp_path)
    (tmp_path / "records" / "EU" / "law2" / "repeal.json").write_text(json.dumps(
        {"source_id": "new", "in_force": "2024-05-06", "kind": "adopted", "language": "en", "text": "", "repealed": True}))
    build.build(tmp_path, branch="history")
    assert ids(law.in_force("EU", "2021-01-01", tmp_path)) == ["law", "law2"]
    assert ids(law.in_force("EU", "2024-05-05", tmp_path)) == ["law", "law2"]
    assert ids(law.in_force("EU", "2024-05-06", tmp_path)) == ["law"]
    assert ids(law.in_force("EU", "2030-01-01", tmp_path)) == ["law"]
    # A coming repeal is listed under not yet in force for this active instrument.
    assert law.lookup("EU", "2021-01-01", tmp_path)[1][0]["in_force"] == "2024-05-06"
    assert [i["in_force"] for i in law.lookup("EU", "2000-01-01", tmp_path)[1]] == ["2020-03-04"]
    kinds = subprocess.check_output(["git", "-C", str(tmp_path), "log", "--reverse", "--format=%(trailers:key=Kind,valueonly)", "history"], text=True).split()
    assert kinds == ["adopted", "adopted", "repeal"]


@pytest.mark.parametrize("later_date", ["2024-06-01", "2024-06-02"])
def test_repeal_blocks_same_day_and_later_unflagged_records(tmp_path, later_date):
    fixture(tmp_path)
    folder = tmp_path / "records" / "EU" / "law2"
    (folder / "2024-06-01-repeal.json").write_text(json.dumps(
        {"source_id": "new", "in_force": "2024-06-01", "kind": "adopted", "language": "en", "text": "", "repealed": True}))
    (folder / f"{later_date}-snapshot.json").write_text(json.dumps(
        {"source_id": "new", "in_force": later_date, "kind": "adopted", "language": "en", "text": "snapshot"}))
    build.build(tmp_path, branch="history")
    assert "law2" not in ids(law.in_force("EU", "2030-01-01", tmp_path))
    if later_date == "2024-06-01":
        kinds = subprocess.check_output(["git", "-C", str(tmp_path), "log", "--reverse",
                                         "--format=%(trailers:key=Kind,valueonly)", "history"], text=True).split()
        assert kinds[-2:] == ["repeal", "adopted"]


def test_flagged_reenactment_restores_instrument_from_its_date(tmp_path):
    fixture(tmp_path)
    folder = tmp_path / "records" / "EU" / "law2"
    (folder / "2024-06-01-repeal.json").write_text(json.dumps(
        {"source_id": "new", "in_force": "2024-06-01", "kind": "adopted", "language": "en", "text": "", "repealed": True}))
    (folder / "2024-06-02-reenactment.json").write_text(json.dumps(
        {"source_id": "new", "in_force": "2024-06-02", "kind": "adopted", "language": "en", "text": "re-enacted", "re_enactment": True}))
    build.build(tmp_path, branch="history")
    assert "law2" in ids(law.in_force("EU", "2024-06-02", tmp_path))


def multilingual(tmp_path):
    """One Swiss-style instrument: de and fr official, en translation, all dated 2024-01-01."""
    fixture(tmp_path)
    rows = json.loads((tmp_path / "sources.json").read_text())
    rows.append({**rows[1], "id": "tr", "form": "translation", "trailer_licence": "CC0"})
    (tmp_path / "sources.json").write_text(json.dumps(rows))
    scope = tmp_path / "register" / "EU" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[1]["source_row"] = ["new", "tr"]
    scope.write_text(json.dumps(entries))
    folder = tmp_path / "records" / "EU" / "law2"
    for name, source, kind, lang in [("2024-01-01-adopted-fr", "new", "adopted", "fr"),
                                     ("2024-01-01-adopted-de", "new", "adopted", "de"),
                                     ("2024-01-01-translation-en", "tr", "translation", "en")]:
        (folder / f"{name}.json").write_text(json.dumps(
            {"source_id": source, "in_force": "2024-01-01", "kind": kind, "language": lang, "text": name}))
    build.build(tmp_path, branch="history")
    return tmp_path


def test_two_official_languages_and_a_translation(tmp_path, capsys):
    repo = multilingual(tmp_path)
    one = {i["id"]: i for i in law.in_force("EU", "2024-06-01", repo, detail=True)}["law2"]
    assert (one["language"], one["kind"]) == ("de", "adopted")  # the official record, not the later-listed translation
    assert [(x["language"], x["kind"]) for x in one["languages"]] == [("de", "adopted"), ("fr", "adopted"), ("en", "translation")]
    assert ids(law.in_force("EU", "2024-06-01", repo)) == ["law", "law2"]  # one entry per instrument
    en = {i["id"]: i for i in law.in_force("EU", "2024-06-01", repo, lang="en", detail=True)}["law2"]
    assert (en["language"], en["kind"], en["fallback"]) == ("en", "translation", False)
    assert en["languages"][0]["language"] == "en" and {x["language"] for x in en["languages"]} == {"de", "fr", "en"}
    fr = {i["id"]: i for i in law.in_force("EU", "2024-06-01", repo, lang="fr", detail=True)}["law2"]
    assert fr["language"] == "fr"
    ja = {i["id"]: i for i in law.in_force("EU", "2024-06-01", repo, lang="ja", detail=True)}["law2"]
    assert (ja["language"], ja["fallback"]) == ("de", True)
    # before the 2024 version only the older, single-language version exists
    assert law.in_force("EU", "2023-01-01", repo, detail=True)[1]["language"] == "en"
    assert law.main(["EU", "2024-06-01", "--repo", str(repo)]) == 0
    out = capsys.readouterr().out
    assert "law2\t2024-01-01\tadopted\tScope Title\n  fr\tadopted\n  en\ttranslation\n" in out
    assert law.main(["EU", "2024-06-01", "--repo", str(repo), "--lang", "en"]) == 0
    out = capsys.readouterr().out
    assert "law2\t2024-01-01\ttranslation\tScope Title\n  de\tadopted\n  fr\tadopted\n" in out
    assert law.main(["EU", "2024-06-01", "--repo", str(repo), "--lang", "ja"]) == 0
    assert "note law2: no ja record for this version, showing the official record (de)" in capsys.readouterr().out
    assert law.main(["EU", "2024-06-01", "--repo", str(repo), "--lang", "english"]) == 2
    assert law.main(["EU", "2024-06-01", "--repo", str(repo), "--json", "--lang", "en"]) == 0
    shown = {i["id"]: i for i in json.loads(capsys.readouterr().out)["in_force"]}["law2"]
    assert shown["language"] == "en" and [x["language"] for x in shown["languages"]] == ["en", "de", "fr"]


def test_translation_only_later_date_keeps_earlier_official_record(tmp_path):
    fixture(tmp_path)
    rows = json.loads((tmp_path / "sources.json").read_text())
    rows.append({**rows[1], "id": "tr", "form": "translation"})
    (tmp_path / "sources.json").write_text(json.dumps(rows))
    scope = tmp_path / "register" / "EU" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[1]["source_row"] = ["new", "tr"]
    scope.write_text(json.dumps(entries))
    folder = tmp_path / "records" / "EU" / "law2"
    earlier = json.loads((folder / "new.json").read_text())
    earlier["language"] = "de"
    (folder / "2020-03-04-adopted-de.json").write_text(json.dumps(earlier))
    (folder / "new.json").unlink()
    (folder / "2022-01-01-translation-en.json").write_text(json.dumps(
        {"source_id": "tr", "in_force": "2022-01-01", "kind": "translation", "language": "en", "text": "translation"}))
    build.build(tmp_path, branch="history")
    for lang in (None, "de"):
        found = {i["id"]: i for i in law.in_force("EU", "2023-01-01", tmp_path, lang=lang, detail=True)}["law2"]
        assert (found["in_force"], found["kind"], found["language"]) == ("2020-03-04", "adopted", "de")


def test_all_repealed_message_names_query_date(tmp_path, capsys):
    fixture(tmp_path)
    for instrument, source in (("law", "old"), ("law2", "new")):
        folder = tmp_path / "records" / "EU" / instrument
        (folder / "2020-12-31-repeal.json").write_text(json.dumps(
            {"source_id": source, "in_force": "2020-12-31", "kind": "adopted", "language": "en", "text": "", "repealed": True}))
    build.build(tmp_path, branch="history")
    assert law.main(["EU", "2021-01-01", "--repo", str(tmp_path)]) == 0
    assert "nothing in force on 2021-01-01" in capsys.readouterr().out


@pytest.mark.parametrize("future", ["version", "repeal"])
def test_future_version_or_repeal_is_listed_for_active_instrument(tmp_path, future):
    fixture(tmp_path)
    folder = tmp_path / "records" / "EU" / "law2"
    record = {"source_id": "new", "in_force": "2030-01-01", "kind": "adopted", "language": "en", "text": "future"}
    if future == "repeal":
        record.update(text="", repealed=True)
    (folder / f"2030-01-01-{future}.json").write_text(json.dumps(record))
    build.build(tmp_path, branch="history")
    _, pending, _ = law.lookup("EU", "2025-01-01", tmp_path)
    assert [item["id"] for item in pending] == ["law2"]
