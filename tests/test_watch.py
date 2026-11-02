import csv
import json
import sys
from datetime import date
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import watch

TODAY = date(2026, 11, 2)
CELLAR = "https://example.invalid/sparql?q=cellar"
UK = "https://example.invalid/section/data.xml"
ECFR = "https://example.invalid/versions/title-40.json?part=98"
ZIP = "https://example.invalid/pubinfo.zip"
TERMS = "https://example.invalid/terms.html"
RECORDS_OF_INTEREST = ("records", "register", "sources")


def cellar_body(dates):
    return ('"celex"\r\n' + "".join(f'"02022L2464-{d.replace("-", "")}"\r\n' for d in dates)).encode()


def uk_body(dates):
    links = "".join(f'<atom:link rel="http://purl.org/dc/terms/hasVersion" '
                    f'href="http://example.invalid/section/{d}"/>' for d in dates)
    return f"<Legislation><Metadata>{links}</Metadata><Body>placeholder text</Body></Legislation>".encode()


def ecfr_body(dates, page=1, total_pages=1):
    versions = [{"date": d, "identifier": "98.1", "substantive": True} for d in dates]
    meta = {"title": "40", "part": "98", "page": str(page), "per_page": "1000", "total_pages": str(total_pages)}
    return json.dumps({"content_versions": versions, "meta": meta}).encode()


WATCHERS = [
    {"id": "w-cellar", "source_id": "PASS", "iso2": "XX", "instrument": "act", "kind": "date_list",
     "tier": "gazette_feed", "url": CELLAR,
     "params": {"regex": r"02022L2464-(\d{8})", "second_route": "open the browser list"}},
    {"id": "w-uk", "source_id": "PASS", "iso2": "XX", "instrument": "act", "kind": "date_list",
     "tier": "consolidation_site", "url": UK,
     "params": {"regex": r'hasVersion" href="[^"]*/(\d{4}-\d{2}-\d{2})"'}},
    {"id": "w-ecfr", "source_id": "PASS", "iso2": "XX", "instrument": "act", "kind": "version_list",
     "tier": "consolidation_site", "url": ECFR},
    {"id": "w-zip", "source_id": "PASS", "iso2": "XX", "instrument": "*", "kind": "http_head",
     "tier": "consolidation_site", "url": ZIP},
    {"id": "w-terms", "source_id": "PASS", "iso2": "XX", "instrument": "*", "kind": "page_hash",
     "tier": "regulator_page", "url": TERMS, "change": "terms_changed"},
]

BODIES = {
    CELLAR: (200, {}, cellar_body(["2022-12-16", "2025-04-17", "2026-03-18"])),
    UK: (200, {"Content-Type": "application/xml"}, uk_body(["2016-12-26", "2022-04-06"])),
    ECFR: (200, {}, ecfr_body(["2017-01-01", "2019-01-01", "2026-10-14"])),
    ZIP: (200, {"Last-Modified": "Mon, 26 Oct 2026 04:26:08 GMT", "Content-Length": "1292052065"}, b""),
    TERMS: (200, {}, b"<html>placeholder terms</html>"),
}


class FakeFetch:
    def __init__(self, bodies=None):
        self.bodies = dict(BODIES if bodies is None else bodies)
        self.calls = []

    def __call__(self, url, method):
        self.calls.append((url, method))
        value = self.bodies[url]
        if isinstance(value, Exception):
            raise value
        return value


def make(repo, watchers=WATCHERS):
    """Fixture repo: one pass row, one non-pass row, one scope entry, no records."""
    (repo / "sources.json").write_text(json.dumps([
        {"id": "PASS", "verdict": "pass"}, {"id": "ASKED", "verdict": "permission requested"}]))
    (repo / "register" / "XX").mkdir(parents=True)
    (repo / "register" / "XX" / "scope.json").write_text(json.dumps([{"id": "act", "title": "Placeholder Act"}]))
    (repo / "upkeep").mkdir()
    (repo / "upkeep" / "watchers.json").write_text(json.dumps(watchers))
    return repo


def rows(repo):
    path = repo / "upkeep" / "queue.csv"
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def seen(repo):
    return json.loads((repo / "upkeep" / "seen.json").read_text())


def tree(repo):
    return sorted(p.relative_to(repo).as_posix() for p in repo.rglob("*") if p.is_file())


def test_first_run_baseline(tmp_path):
    repo = make(tmp_path)
    before = tree(repo)
    result = watch.watch(repo, FakeFetch(), TODAY)
    assert (result["run"], result["candidates"], result["failures"]) == (5, 5, 0)
    got = rows(repo)
    assert [r["change"] for r in got] == ["baseline"] * 5
    assert {r["watcher_id"]: r["signal"] for r in got} == {
        "w-cellar": "3", "w-uk": "2", "w-ecfr": "3", "w-zip": "1", "w-terms": "1"}
    assert got[0]["detected_on"] == "2026-11-02" and got[0]["evidence_url"] == CELLAR
    assert seen(repo)["w-cellar"]["signals"] == ["2022-12-16", "2025-04-17", "2026-03-18"]
    assert seen(repo)["w-uk"]["signals"] == ["2016-12-26", "2022-04-06"]
    assert seen(repo)["w-ecfr"]["signals"] == ["2017-01-01", "2019-01-01", "2026-10-14"]
    assert seen(repo)["w-zip"]["signals"] == ["Last-Modified: Mon, 26 Oct 2026 04:26:08 GMT"]
    assert len(seen(repo)["w-terms"]["signals"][0]) == 64
    assert all(s["failure"] is None for s in seen(repo).values())
    assert sorted(set(tree(repo)) - set(before)) == ["upkeep/queue.csv", "upkeep/seen.json"]


def test_queue_columns_and_line_endings(tmp_path):
    repo = make(tmp_path)
    watch.watch(repo, FakeFetch(), TODAY)
    raw = (repo / "upkeep" / "queue.csv").read_bytes()
    assert raw.split(b"\r\n")[0].decode() == ",".join(watch.COLUMNS)
    assert raw.count(b"\r\n") == 6 and b"\n" not in raw.replace(b"\r\n", b"")
    assert watch.COLUMNS == ["detected_on", "watcher_id", "iso2", "source_id", "instrument", "change", "signal",
                             "evidence_url", "reviewer", "outcome", "outcome_on", "notes"]


def test_second_run_same_bodies_no_rows(tmp_path):
    repo = make(tmp_path)
    watch.watch(repo, FakeFetch(), TODAY)
    before = (repo / "upkeep" / "queue.csv").read_bytes()
    result = watch.watch(repo, FakeFetch(), date(2026, 11, 3))
    assert result["rows"] == [] and result["candidates"] == 0
    assert (repo / "upkeep" / "queue.csv").read_bytes() == before
    assert seen(repo)["w-cellar"]["checked_on"] == "2026-11-03"


def test_one_more_date_gives_one_new_version_row(tmp_path):
    repo = make(tmp_path)
    watch.watch(repo, FakeFetch(), TODAY)
    fetch = FakeFetch()
    fetch.bodies[UK] = (200, {}, uk_body(["2016-12-26", "2022-04-06", "2027-01-01"]))
    result = watch.watch(repo, fetch, date(2027, 1, 2))
    assert len(result["rows"]) == 1
    new = rows(repo)[-1]
    assert (new["change"], new["signal"], new["watcher_id"], new["evidence_url"]) == ("new_version", "2027-01-01", "w-uk", UK)
    assert new["detected_on"] == "2027-01-02" and new["instrument"] == "act" and new["source_id"] == "PASS"
    assert seen(repo)["w-uk"]["signals"] == ["2016-12-26", "2022-04-06", "2027-01-01"]
    # a date that later drops out of the list stays known, so it cannot come back as new
    fetch.bodies[UK] = (200, {}, uk_body(["2022-04-06", "2027-01-01"]))
    assert watch.watch(repo, fetch, date(2027, 1, 3))["rows"] == []
    assert seen(repo)["w-uk"]["signals"] == ["2016-12-26", "2022-04-06", "2027-01-01"]


def test_changed_header_and_hash_give_rows(tmp_path):
    repo = make(tmp_path)
    watch.watch(repo, FakeFetch(), TODAY)
    fetch = FakeFetch()
    fetch.bodies[ZIP] = (200, {"Last-Modified": "Tue, 03 Nov 2026 01:00:00 GMT"}, b"")
    fetch.bodies[TERMS] = (200, {}, b"<html>placeholder terms, changed</html>")
    result = watch.watch(repo, fetch, date(2026, 11, 3))
    got = {r["watcher_id"]: r for r in result["rows"]}
    assert got["w-zip"]["change"] == "new_version"
    assert got["w-zip"]["signal"] == "Last-Modified: Tue, 03 Nov 2026 01:00:00 GMT"
    assert got["w-terms"]["change"] == "terms_changed" and len(got["w-terms"]["signal"]) == 64
    assert seen(repo)["w-zip"]["signals"] == ["Last-Modified: Tue, 03 Nov 2026 01:00:00 GMT"]
    assert seen(repo)["w-terms"]["signals"] == [got["w-terms"]["signal"]]
    assert [c for c in fetch.calls if c[0] == ZIP] == [(ZIP, "HEAD")]


def test_http_head_falls_back_to_content_length(tmp_path):
    repo = make(tmp_path, [WATCHERS[3]])
    fetch = FakeFetch({ZIP: (200, {"Content-Length": "42"}, b"")})
    watch.watch(repo, fetch, TODAY)
    assert seen(repo)["w-zip"]["signals"] == ["Content-Length: 42"]


def test_version_list_follows_pages(tmp_path):
    repo = make(tmp_path, [WATCHERS[2]])
    fetch = FakeFetch({ECFR: (200, {}, ecfr_body(["2017-01-01", "2026-10-14"], page=1, total_pages=2)),
                       ECFR + "&page=2": (200, {}, ecfr_body(["2019-09-19"], page=2, total_pages=2))})
    result = watch.watch(repo, fetch, TODAY)
    assert result["rows"][0]["signal"] == "3"
    assert seen(repo)["w-ecfr"]["signals"] == ["2017-01-01", "2019-09-19", "2026-10-14"]
    assert fetch.calls == [(ECFR, "GET"), (ECFR + "&page=2", "GET")]


@pytest.mark.parametrize("failure, signal", [
    ((403, {}, b"forbidden"), "HTTP 403"),
    ((200, {}, b""), "empty body"),
    (TimeoutError("timed out"), "TimeoutError: timed out"),
    ((200, {}, b"not json"), "JSONDecodeError"),
])
def test_fetch_failure_gives_watch_failed_and_keeps_signals(tmp_path, failure, signal):
    repo = make(tmp_path)
    watch.watch(repo, FakeFetch(), TODAY)
    known = seen(repo)["w-ecfr"]["signals"]
    fetch = FakeFetch()
    fetch.bodies[ECFR] = failure
    result = watch.watch(repo, fetch, date(2026, 11, 3))
    assert (result["candidates"], result["failures"]) == (0, 1)
    failed = rows(repo)[-1]
    assert failed["change"] == "watch_failed" and failed["watcher_id"] == "w-ecfr"
    assert failed["signal"].startswith(signal) and failed["notes"] == "second_route: none listed"
    assert seen(repo)["w-ecfr"]["signals"] == known
    assert seen(repo)["w-ecfr"]["failure"].startswith(signal)


def test_same_failure_twice_gives_one_row_and_second_route_in_notes(tmp_path):
    repo = make(tmp_path)
    watch.watch(repo, FakeFetch(), TODAY)
    fetch = FakeFetch()
    fetch.bodies[CELLAR] = (403, {}, b"")
    first = watch.watch(repo, fetch, date(2026, 11, 3))
    second = watch.watch(repo, fetch, date(2026, 11, 4))
    assert first["failures"] == 1 and second["failures"] == 1
    failed = [r for r in rows(repo) if r["change"] == "watch_failed"]
    assert len(failed) == 1 and failed[0]["notes"] == "second_route: open the browser list"
    # a different failure text is a new row; recovery is silent and clears the failure
    fetch.bodies[CELLAR] = (500, {}, b"")
    watch.watch(repo, fetch, date(2026, 11, 5))
    assert [r["signal"] for r in rows(repo) if r["change"] == "watch_failed"] == ["HTTP 403", "HTTP 500"]
    assert watch.watch(repo, FakeFetch(), date(2026, 11, 6))["rows"] == []
    assert seen(repo)["w-cellar"]["failure"] is None


def test_failure_on_first_run_then_baseline_later(tmp_path):
    repo = make(tmp_path, [WATCHERS[1]])
    watch.watch(repo, FakeFetch({UK: (503, {}, b"")}), TODAY)
    assert seen(repo)["w-uk"]["signals"] is None
    result = watch.watch(repo, FakeFetch(), date(2026, 11, 3))
    assert [r["change"] for r in result["rows"]] == ["baseline"]


def test_dry_run_writes_nothing(tmp_path):
    repo = make(tmp_path)
    before = tree(repo)
    result = watch.watch(repo, FakeFetch(), TODAY, dry_run=True)
    assert len(result["rows"]) == 5 and tree(repo) == before


def test_source_filter(tmp_path):
    watchers = WATCHERS[:2] + [{**WATCHERS[2], "source_id": "ASKED"}]
    repo = make(tmp_path, watchers)
    result = watch.watch(repo, FakeFetch(), TODAY, source="ASKED")
    assert result["run"] == 1 and [r["watcher_id"] for r in result["rows"]] == ["w-ecfr"]
    assert list(seen(repo)) == ["w-ecfr"]


def test_non_pass_row_gives_row_and_nothing_under_records(tmp_path):
    watcher = {"id": "w-asked", "source_id": "ASKED", "iso2": "XX", "instrument": "act", "kind": "page_hash",
               "tier": "regulator_page", "url": TERMS}
    repo = make(tmp_path, [watcher])
    before = tree(repo)
    result = watch.watch(repo, FakeFetch(), TODAY)
    assert [(r["watcher_id"], r["change"], r["source_id"]) for r in result["rows"]] == [("w-asked", "baseline", "ASKED")]
    assert not (repo / "records").exists()
    assert [p for p in tree(repo) if p not in before] == ["upkeep/queue.csv", "upkeep/seen.json"]
    assert not any(p.startswith(RECORDS_OF_INTEREST) for p in tree(repo) if p not in before)


@pytest.mark.parametrize("bad, message", [
    ({"source_id": "NOPE"}, "not in sources.json"),
    ({"instrument": "other"}, "not in register/XX/scope.json"),
    ({"kind": "rss"}, "is not one of"),
    ({"params": {}}, "needs params.regex"),
    ({"change": "deleted"}, "change 'deleted'"),
    ({"tier": "blog"}, "tier 'blog' is not one of"),
    ({"tier": None}, "missing tier"),
])
def test_invalid_watcher_is_refused(tmp_path, bad, message):
    repo = make(tmp_path, [{**WATCHERS[0], **bad}])
    with pytest.raises(ValueError) as exc:
        watch.watch(repo, FakeFetch(), TODAY)
    assert message in str(exc.value)


def test_date_list_regex_needs_one_group(tmp_path):
    repo = make(tmp_path, [{**WATCHERS[0], "params": {"regex": r"02022L2464-\d{8}"}}])
    result = watch.watch(repo, FakeFetch(), TODAY)
    assert result["failures"] == 1 and "exactly one group" in result["rows"][0]["signal"]


def test_cli_summary_and_exit_code(tmp_path, capsys, monkeypatch):
    repo = make(tmp_path)
    fetch = FakeFetch()
    monkeypatch.setattr(watch, "default_fetch", fetch)
    assert watch.main(["--repo", str(repo)]) == 0
    total = sum(len(body) for _, _, body in BODIES.values())
    assert watch.re.fullmatch(rf"5 watchers run, 5 candidates, 0 failures, \d+\.\d s, {total} bytes\n",
                              capsys.readouterr().out)
    fetch.bodies[ZIP] = (404, {}, b"")
    assert watch.main(["--repo", str(repo), "--dry-run"]) == 1
    out = capsys.readouterr().out.splitlines()
    assert out[-1].startswith("5 watchers run, 0 candidates, 1 failures, ") and "watch_failed" in out[0]
    assert len(rows(repo)) == 5 and seen(repo)["w-zip"]["failure"] is None


def test_seen_records_seconds_and_bytes_per_watcher(tmp_path):
    """Each seen.json entry carries the wall time and body bytes of its last fetch; the result carries the totals."""
    repo = make(tmp_path)
    result = watch.watch(repo, FakeFetch(), TODAY)
    got = seen(repo)
    assert all(isinstance(e["seconds"], float) and e["seconds"] >= 0 for e in got.values())
    assert {k: e["bytes"] for k, e in got.items()} == {w["id"]: len(BODIES[w["url"]][2]) for w in WATCHERS}
    assert got["w-zip"]["bytes"] == 0  # HEAD request, no body
    assert result["bytes"] == sum(e["bytes"] for e in got.values())
    assert result["seconds"] == round(sum(e["seconds"] for e in got.values()), 2)
    # a failed fetch still records its cost, and the versioner's extra pages count towards one watcher
    fetch = FakeFetch({ECFR: (200, {}, ecfr_body(["2017-01-01"], page=1, total_pages=2)),
                       ECFR + "&page=2": (503, {}, b"down")})
    (tmp_path / "two").mkdir()
    watch.watch(make(tmp_path / "two", [WATCHERS[2]]), fetch, TODAY)
    entry = seen(tmp_path / "two")["w-ecfr"]
    assert entry["failure"].startswith("HTTP 503") and entry["bytes"] == len(fetch.bodies[ECFR][2]) + 4


def test_shipped_watchers_have_a_valid_tier():
    """upkeep/watchers.json: every entry names one of watch.TIERS, and the Cellar and Federal Register feeds are gazette_feed."""
    repo = Path(__file__).resolve().parents[1]
    shipped = json.loads((repo / "upkeep" / "watchers.json").read_text(encoding="utf-8"))
    assert watch.TIERS == ("gazette_feed", "consolidation_site", "regulator_page", "tracker_pointer")
    assert all(w.get("tier") in watch.TIERS for w in shipped), [w["id"] for w in shipped if w.get("tier") not in watch.TIERS]
    for w in shipped:
        host = watch.urllib.parse.urlsplit(w["url"]).netloc
        if host in ("publications.europa.eu", "www.federalregister.gov"):
            assert w["tier"] == "gazette_feed", w["id"]
        if w["id"].startswith("terms-"):
            assert w["tier"] == "regulator_page", w["id"]
    # upkeep/cadence.json names every tier once and its watcher counts match the shipped file
    cadence = json.loads((repo / "upkeep" / "cadence.json").read_text(encoding="utf-8"))
    assert set(cadence["tiers"]) == set(watch.TIERS)
    for tier, entry in cadence["tiers"].items():
        assert entry["watchers"] == sum(1 for w in shipped if w["tier"] == tier), tier
        assert entry["interval_days"] > 0 and entry["seconds_per_run"] >= 0 and entry["bytes_per_run"] >= 0
    assert cadence["measured"] is True and cadence["paid_tools"] == []


def test_cli_rejects_bad_config(tmp_path, capsys, monkeypatch):
    repo = make(tmp_path, [{**WATCHERS[0], "source_id": "NOPE"}])
    monkeypatch.setattr(watch, "default_fetch", FakeFetch())
    assert watch.main(["--repo", str(repo)]) == 1
    assert "not in sources.json" in capsys.readouterr().err


def test_shipped_watchers_validate_against_real_repo():
    """upkeep/watchers.json: every entry validates, covers every scope id, names the instrument's own row."""
    repo = Path(__file__).resolve().parents[1]
    shipped = json.loads((repo / "upkeep" / "watchers.json").read_text(encoding="utf-8"))
    loaded = watch.load_watchers(repo)  # raises ValueError on any invalid entry
    assert [w["id"] for w in loaded] == [w["id"] for w in shipped] and len(shipped) >= 4
    scope = {}
    for path in sorted((repo / "register").glob("*/scope.json")):
        for entry in json.loads(path.read_text(encoding="utf-8")):
            scope[entry["id"]] = (path.parent.name, entry)
    assert set(scope) <= {w["instrument"] for w in shipped}, "every scope id has a watcher"
    for w in shipped:
        assert w["kind"] in watch.KINDS
        if w["kind"] == "date_list":
            assert watch.re.compile(w["params"]["regex"]).groups == 1
        if w["instrument"] != "*":
            iso2, entry = scope[w["instrument"]]
            rows = entry["source_row"] if isinstance(entry["source_row"], list) else [entry["source_row"]]
            assert w["iso2"] == iso2 and w["source_id"] in rows, w["id"]
