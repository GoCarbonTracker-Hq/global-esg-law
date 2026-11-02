import csv
import hashlib
import json
import sys
from datetime import date
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import check_corpus  # noqa: E402
import licence_recheck  # noqa: E402
import make_sources  # noqa: E402
import watch  # noqa: E402

TODAY = date(2026, 11, 2)
TERMS = "https://example.invalid/terms.html"
TERMS_BODY = b"<html>placeholder terms</html>"
FINGERPRINT = hashlib.sha256(TERMS_BODY).hexdigest()
CHANGED_BODY = b"<html>placeholder terms, rewritten</html>"
CHANGED_HASH = hashlib.sha256(CHANGED_BODY).hexdigest()
WATCHER = {"id": "terms-pass", "source_id": "PASS", "iso2": "XX", "instrument": "*", "kind": "page_hash",
           "tier": "regulator_page", "url": TERMS, "change": "terms_changed"}


def row(**over):
    base = {c: "" for c in make_sources.COLUMNS}
    base.update({"id": "PASS", "jurisdiction": "XX", "publisher": "Placeholder Office", "source_name": "Placeholder Journal",
                 "form": "adopted", "fetch_url": "https://example.invalid/{id}", "pinned_version": "v1",
                 "terms_url": TERMS, "terms_quote": "placeholder quote", "terms_fingerprint": FINGERPRINT,
                 "verdict": "pass", "statute_exception": "none found", "verdict_basis": "terms",
                 "checked_by": "test", "checked_on": "2026-11-01", "trailer_instrument": "Placeholder Act",
                 "trailer_source_url": "https://example.invalid/act", "trailer_licence": "placeholder licence",
                 "notes": "fixture"})
    base.update(over)
    return base


def write_table(repo, rows):
    (repo / "sources").mkdir(exist_ok=True)
    with (repo / "sources" / "licence-table.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=make_sources.COLUMNS, lineterminator="\r\n")
        writer.writeheader()
        writer.writerows(rows)


def make(repo, rows=None, watchers=(WATCHER,), seeded=True):
    """Fixture repo: licence table, sources.json, two scope entries, one record under PASS, one terms watcher."""
    write_table(repo, rows or [row(), row(id="ASKED", verdict="permission requested", terms_url="https://example.invalid/other")])
    make_sources.build(repo / "sources" / "licence-table.csv", repo / "sources.json")
    (repo / "register" / "XX").mkdir(parents=True)
    (repo / "register" / "XX" / "scope.json").write_text(json.dumps([
        {"id": "act", "title": "Placeholder Act", "source_row": "PASS"},
        {"id": "shared", "title": "Shared Act", "source_row": ["ASKED", "PASS"]},
        {"id": "other", "title": "Other Act", "source_row": "ASKED"}]))
    folder = repo / "records" / "XX" / "act"
    folder.mkdir(parents=True)
    (folder / "2020-01-01-adopted.json").write_text(json.dumps({
        "source_id": "PASS", "in_force": "2020-01-01", "kind": "adopted", "text": "placeholder text"}))
    (repo / "upkeep").mkdir()
    (repo / "upkeep" / "watchers.json").write_text(json.dumps(list(watchers)))
    if seeded:
        (repo / "upkeep" / "seen.json").write_text(json.dumps(
            {"terms-pass": {"signals": [FINGERPRINT], "failure": None, "checked_on": "2026-11-01"}}))
    return repo


def fetch_returning(body):
    def fetch(url, method):
        assert (url, method) == (TERMS, "GET")
        return 200, {"Content-Type": "text/html"}, body
    return fetch


def table(repo):
    with (repo / "sources" / "licence-table.csv").open(newline="", encoding="utf-8") as handle:
        return {r["id"]: r for r in csv.DictReader(handle)}


def queue(repo):
    path = repo / "upkeep" / "queue.csv"
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def tree(repo):
    return sorted(p.relative_to(repo).as_posix() for p in repo.rglob("*") if p.is_file())


def test_matching_fingerprint_gives_no_queue_row(tmp_path):
    repo = make(tmp_path)
    result = watch.watch(repo, fetch_returning(TERMS_BODY), TODAY)
    assert (result["run"], result["candidates"], result["failures"], result["rows"]) == (1, 0, 0, [])
    assert queue(repo) == []
    assert json.loads((repo / "upkeep" / "seen.json").read_text())["terms-pass"]["signals"] == [FINGERPRINT]


def test_changed_terms_page_gives_terms_changed_row(tmp_path):
    repo = make(tmp_path)
    result = watch.watch(repo, fetch_returning(CHANGED_BODY), TODAY)
    assert len(result["rows"]) == 1
    got = queue(repo)[-1]
    assert (got["change"], got["watcher_id"], got["source_id"], got["instrument"]) == ("terms_changed", "terms-pass", "PASS", "*")
    assert got["signal"] == CHANGED_HASH and got["evidence_url"] == TERMS and got["detected_on"] == "2026-11-02"
    # the watcher reports; it never touches the licence table
    assert table(repo)["PASS"]["verdict"] == "pass"


def test_recheck_flips_row_to_unknown_and_gate_refuses_record(tmp_path):
    repo = make(tmp_path)
    assert check_corpus.check(repo) == 1
    before = tree(repo)
    raw_before = (repo / "sources" / "licence-table.csv").read_bytes()
    summary = licence_recheck.recheck(repo, "terms-pass", CHANGED_HASH, date(2026, 11, 3))
    after = table(repo)
    assert after["PASS"]["verdict"] == "unknown" and after["PASS"]["checked_on"] == "2026-11-03"
    assert {k: v for k, v in after["PASS"].items() if k not in ("verdict", "checked_on")} == \
        {k: v for k, v in row().items() if k not in ("verdict", "checked_on")}
    assert after["ASKED"]["verdict"] == "permission requested" and after["ASKED"]["checked_on"] == "2026-11-01"
    rows = {r["id"]: r for r in json.loads((repo / "sources.json").read_text())}
    assert rows["PASS"]["verdict"] == "unknown"
    with pytest.raises(ValueError) as exc:
        check_corpus.check(repo)
    assert "records/XX/act/2020-01-01-adopted.json" in str(exc.value) and "not 'pass'" in str(exc.value)
    assert summary["instruments"] == [("XX", "act"), ("XX", "shared")]
    assert summary["record_folders"] == ["records/XX/act"]
    assert summary["previous_verdict"] == "pass" and summary["signal"] == CHANGED_HASH
    # nothing deleted, only the table and sources.json rewritten, CRLF kept
    assert tree(repo) == before
    raw_after = (repo / "sources" / "licence-table.csv").read_bytes()
    assert raw_after.count(b"\r\n") == raw_before.count(b"\r\n") == 3 and b"\n" not in raw_after.replace(b"\r\n", b"")
    assert (repo / "records" / "XX" / "act" / "2020-01-01-adopted.json").exists()


def test_new_columns_reach_sources_json(tmp_path):
    repo = make(tmp_path, rows=[row(statute_exception='Placeholder Act 1900 s.1: "no copyright"', verdict_basis="statute")])
    (built,) = json.loads((repo / "sources.json").read_text())
    assert built["statute_exception"] == 'Placeholder Act 1900 s.1: "no copyright"' and built["verdict_basis"] == "statute"
    assert list(built)[list(built).index("verdict") + 1:list(built).index("verdict") + 3] == ["statute_exception", "verdict_basis"]


@pytest.mark.parametrize("over, message", [
    ({"verdict_basis": "guess"}, "verdict_basis"),
    ({"statute_exception": ""}, "statute_exception"),
    ({"publisher": "International Organization for Standardization"}, "standards bodies"),
    ({"source_name": "GRI Standards"}, "standards bodies"),
])
def test_build_refuses_bad_basis_and_banned_publishers(tmp_path, over, message):
    write_table(tmp_path, [row(**over)])
    with pytest.raises(SystemExit) as exc:
        make_sources.build(tmp_path / "sources" / "licence-table.csv", tmp_path / "sources.json")
    assert "PASS" in str(exc.value) and message in str(exc.value)
    assert not (tmp_path / "sources.json").exists()


def test_recheck_regenerates_through_the_same_gate(tmp_path):
    repo = make(tmp_path)
    write_table(repo, [row(publisher="ISO")])  # a banned publisher slipped into the table by hand
    with pytest.raises(SystemExit) as exc:
        licence_recheck.recheck(repo, "terms-pass", CHANGED_HASH, TODAY)
    assert "standards bodies" in str(exc.value)


def test_cli_prints_instruments_and_folders(tmp_path, capsys):
    repo = make(tmp_path)
    code = licence_recheck.main(["--row", f"terms-pass:{CHANGED_HASH}", "--repo", str(repo), "--today", "2026-11-03"])
    out = capsys.readouterr().out
    assert code == 0
    assert "PASS: verdict 'pass' -> 'unknown', checked_on 2026-11-03" in out
    assert "  XX/act\n" in out and "  XX/shared\n" in out and "  XX/other" not in out
    assert "  records/XX/act\n" in out and "nothing deleted" in out and TERMS in out
    assert table(repo)["PASS"]["verdict"] == "unknown"


@pytest.mark.parametrize("value, message", [
    ("nope:abc", "no watcher 'nope'"),
    ("terms-pass", "<watcher_id>:<signal>"),
    ("terms-pass:", "<watcher_id>:<signal>"),
    ("versions:abc", "not a terms_changed watcher"),
])
def test_cli_refuses_bad_rows(tmp_path, capsys, value, message):
    versions = {"id": "versions", "source_id": "PASS", "iso2": "XX", "instrument": "act", "kind": "page_hash", "url": TERMS}
    repo = make(tmp_path, watchers=(WATCHER, versions))
    before = tree(repo)
    assert licence_recheck.main(["--row", value, "--repo", str(repo)]) == 1
    assert message in capsys.readouterr().err
    assert table(repo)["PASS"]["verdict"] == "pass" and tree(repo) == before


def test_whole_loop_from_watch_to_refusal(tmp_path):
    repo = make(tmp_path)
    watch.watch(repo, fetch_returning(CHANGED_BODY), TODAY)
    (hit,) = [r for r in queue(repo) if r["change"] == "terms_changed"]
    licence_recheck.main(["--row", f"{hit['watcher_id']}:{hit['signal']}", "--repo", str(repo), "--today", "2026-11-03"])
    with pytest.raises(ValueError):
        check_corpus.check(repo)
    # the watcher already stored the new hash, so the next run is quiet until the page moves again
    assert watch.watch(repo, fetch_returning(CHANGED_BODY), date(2026, 11, 4))["rows"] == []
