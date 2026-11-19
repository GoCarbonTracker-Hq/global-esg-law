import json
import re
import subprocess
import sys
from pathlib import Path

import pytest

TOOLS = Path(__file__).resolve().parents[1] / "tools"
ROOT = TOOLS.parent
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


def _stored_entries():
    for path in sorted(ROOT.glob("register/*/scope.json")):
        for entry in json.loads(path.read_text(encoding="utf-8")):
            if entry.get("status") == "stored":
                yield path.parent.name, entry


def test_every_stored_scope_entry_has_evidence():
    empty = [(iso2, e["id"]) for iso2, e in _stored_entries() if not (e.get("evidence") or "").strip()]
    assert empty == []


# Entries whose record states the commencement date outright (#58), plus three that state none and are explained.
BACKFILLED = {("DK", "dk-transport-ghg"): "2009-07-01", ("TW", "tw-annual-report-regs"): "1989-01-01",
              ("AR", "ar-ley-27520"): None, ("AR", "ar-ley-25675"): None, ("AR", "ar-dnu-274-2019"): None}


def test_backfilled_scope_entries_quote_their_records_verbatim():
    entries = {(iso2, e["id"]): e for iso2, e in _stored_entries()}
    for (iso2, instrument), in_force in BACKFILLED.items():
        entry = entries[(iso2, instrument)]
        assert entry["in_force"] == in_force, (iso2, instrument)
        texts = [json.loads(p.read_text(encoding="utf-8")).get("text") or ""
                 for p in (ROOT / "records" / iso2 / instrument).glob("*.json")]
        quotes = re.findall(r'"([^"]+)"', entry["evidence"])
        assert quotes, (iso2, instrument)
        for quote in quotes:
            assert any(quote in text for text in texts), (iso2, instrument, quote)


def set_amends(repo, **entry_keys):
    """Add keys to the one scope entry written by make(), and a second entry `other` to point at."""
    scope = repo / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[0].update(entry_keys)
    entries.append({"id": "other", "title": "Other Act", "status": "link only", "source_row": "R1"})
    scope.write_text(json.dumps(entries))


def refused_scope(repo, reason, **kwargs):
    with pytest.raises(ValueError) as exc:
        check_corpus.check(repo, **kwargs)
    message = str(exc.value)
    assert "register/XX/scope.json" in message and "'act'" in message and reason in message


@pytest.mark.parametrize(("value", "reason"), [
    ("other", "not a non-empty list"), ([], "not a non-empty list"), ([7], "not a non-empty string"),
    ([""], "not a non-empty string"), (["CELEX 32013L0034"], "not the id of any scope entry"),
    (["other", "other"], "twice"), (["act"], "own id")])
def test_amends_ids_refused(tmp_path, value, reason):
    make(tmp_path)
    set_amends(tmp_path, amends_ids=value)
    refused_scope(tmp_path, reason)


def test_old_amends_key_refused(tmp_path):
    make(tmp_path)
    set_amends(tmp_path, amends="other")
    refused_scope(tmp_path, "amends_ids")


def test_amends_ids_two_ids_pass(tmp_path):
    make(tmp_path)
    set_amends(tmp_path, amends_ids=["other", "third"])
    scope = tmp_path / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    entries.append({"id": "third", "title": "Third Act", "status": "link only", "source_row": "R1"})
    scope.write_text(json.dumps(entries))
    assert check_corpus.check(tmp_path) == 1


def test_amends_ids_on_link_only_entry_is_checked(tmp_path):
    """A link-only entry has no records, so the record loop never reaches it."""
    make(tmp_path)
    set_amends(tmp_path)
    scope = tmp_path / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[1]["amends_ids"] = ["nowhere"]
    scope.write_text(json.dumps(entries))
    with pytest.raises(ValueError, match=r"register/XX/scope.json: entry 'other'.*'nowhere'"):
        check_corpus.check(tmp_path)
    entries[1]["amends_ids"] = ["act"]
    scope.write_text(json.dumps(entries))
    assert check_corpus.check(tmp_path) == 1


def set_alias(repo, value=None, on="other"):
    """Write `aliases` on a scope entry (default: the link-only `other`, which has no record)."""
    set_amends(repo)
    scope = repo / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    next(e for e in entries if e["id"] == on)["aliases"] = value
    scope.write_text(json.dumps(entries))


@pytest.mark.parametrize(("value", "reason"), [
    ("CBAM", "not a non-empty list"), ([], "not a non-empty list"), (None, "not a non-empty list"),
    ([""], "not a non-blank string"), (["   "], "not a non-blank string"), ([7], "not a non-blank string"),
    ([None], "not a non-blank string"), ([" CBAM"], "leading or trailing space"),
    (["CBAM "], "leading or trailing space"), (["EU"], "under 3 characters"), (["CBAM", "EU"], "under 3 characters"),
    (["CBAM", "cbam"], "ignoring case"), (["Straße", "STRASSE", "straße"], "ignoring case")])
def test_aliases_refused_on_a_link_only_entry(tmp_path, value, reason):
    make(tmp_path)
    set_alias(tmp_path, value)
    with pytest.raises(ValueError) as exc:
        check_corpus.check(tmp_path)
    message = str(exc.value)
    assert message.startswith("register/XX/scope.json: other: aliases") and reason in message


def test_aliases_pass_with_two_items_or_no_key(tmp_path):
    make(tmp_path)
    set_alias(tmp_path, ["CBAM", "EU ETS"])
    assert check_corpus.check(tmp_path) == 1
    scope = tmp_path / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    del entries[1]["aliases"]
    scope.write_text(json.dumps(entries))
    assert check_corpus.check(tmp_path) == 1


def test_aliases_shared_by_two_entries_pass(tmp_path):
    make(tmp_path)
    set_alias(tmp_path, ["KSG"])
    scope = tmp_path / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    entries[0]["aliases"] = ["KSG"]
    scope.write_text(json.dumps(entries))
    assert check_corpus.check(tmp_path) == 1


def test_aliases_iso2_validates_only_that_place(tmp_path):
    make(tmp_path)
    set_alias(tmp_path, ["EU"])
    (tmp_path / "register" / "YY").mkdir()
    (tmp_path / "register" / "YY" / "scope.json").write_text("[]")
    assert check_corpus.check(tmp_path, iso2="YY") == 0
    with pytest.raises(ValueError, match="register/XX/scope.json: other: aliases"):
        check_corpus.check(tmp_path, iso2="XX")


def test_every_real_alias_is_valid_and_lists_are_never_empty():
    """The real corpus passes the rule, and no entry has `aliases: []` or null."""
    check_corpus.check_aliases(ROOT)
    for iso2, entry in (( p.parent.name, e) for p in ROOT.glob("register/*/scope.json")
                        for e in json.loads(p.read_text(encoding="utf-8"))):
        assert entry.get("aliases", ["x" * 3]), (iso2, entry["id"])


def test_hand_aliases_on_the_three_eu_entries():
    """Written from the official texts (see the report table); only the EU regulation holds CBAM."""
    eu = {e["id"]: e for e in json.loads((ROOT / "register" / "EU" / "scope.json").read_text(encoding="utf-8"))}
    assert eu["eu-cbam-2023-956"]["aliases"] == ["CBAM"]
    assert eu["eu-ets-2003-87"]["aliases"] == ["EU ETS"]
    assert eu["eu-empowering-consumers-2024-825"]["aliases"] == ["ECGT"]
    carriers = {e["id"] for p in ROOT.glob("register/*/scope.json") for e in json.loads(p.read_text(encoding="utf-8"))
                if "CBAM" in (e.get("aliases") or [])}
    assert carriers == {"eu-cbam-2023-956"}


def test_split_short_forms_sit_only_on_the_agreed_entries():
    """KSG, UWG, CSRD, EUDR on the agreed entries; ESG, JFSC, CMF, GHGs on none."""
    found = {}
    for p in ROOT.glob("register/*/scope.json"):
        for e in json.loads(p.read_text(encoding="utf-8")):
            for a in e.get("aliases") or []:
                found.setdefault(a, set()).add(e["id"])
    assert found["KSG"] == {"at-ksg", "de-ksg"} and found["UWG"] == {"at-uwg-s1-2a", "li-uwg"}
    assert found["CSRD"] == {"eu-csrd-2022-2464"} and found["EUDR"] == {"eu-eudr-2023-1115"}
    assert not {"ESG", "JFSC", "CMF", "GHGs"} & set(found)


@pytest.mark.parametrize("change", [{"status": "Stored"}, {"status": None}, {"applies_from": "2025-02-30"}])
def test_a_scope_entry_without_records_is_checked_for_status_and_dates(tmp_path, change):  # T16
    make(tmp_path)
    scope = tmp_path / "register" / "XX" / "scope.json"
    entries = json.loads(scope.read_text())
    entries.append({"id": "bare", "title": "Bare Act", "source_row": "R1", "status": "link only", **change})
    scope.write_text(json.dumps(entries))
    for kwargs in ({}, {"iso2": "XX"}, {"strict": False}):
        with pytest.raises(ValueError, match="register/XX/scope.json: entry 'bare'"):
            check_corpus.check(tmp_path, **kwargs)
