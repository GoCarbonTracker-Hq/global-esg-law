import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import triage  # noqa: E402

W = {"id": "w1", "iso2": "XX", "source_id": "S", "instrument": "*", "kind": "page_hash", "url": "https://x.invalid/p"}


def fetcher(bodies):
    """Fake fetch returning the next body for each call; a body of None raises like a dead route."""
    calls = iter(bodies)

    def fetch(url, method):
        body = next(calls)
        if body is None:
            raise OSError("route down")
        return 200, {}, body
    return fetch


def run(bodies, watcher=W):
    return triage.double_fetch([watcher], fetcher(bodies), gap=0, sleep=lambda s: None)


def test_different_hash_with_nonce_is_churn_with_the_moving_line():
    pair = run([b"<p>law</p><input nonce=abc1>", b"<p>law</p><input nonce=zzz2>"])["w1"]
    klass, evidence, cause = triage.judge(W, pair)
    assert klass == "churn" and cause == "nonce/token" and "nonce=zzz2" in evidence


def test_same_hash_twice_is_not_churn():
    klass, _, _ = triage.judge(W, run([b"same", b"same"])["w1"])
    assert klass == "real_change_candidate"


def test_a_failed_fetch_is_unclear_never_churn():
    for bodies in ([b"a", None], [None, b"b"]):
        klass, evidence, _ = triage.judge(W, run(bodies)["w1"])
        assert klass == "unclear" and "OSError" in evidence


def test_second_fetch_waits_the_gap():
    slept = []
    clock = iter([0, 1, 2, 3])
    triage.double_fetch([W], fetcher([b"a", b"a"]), gap=300, now=lambda: next(clock), sleep=slept.append)
    assert slept == [299]


def row(wid, change, signal, day="2026-11-02", outcome=""):
    return {"detected_on": day, "watcher_id": wid, "iso2": "XX", "source_id": "S", "instrument": "*",
            "change": change, "signal": signal, "evidence_url": "u", "reviewer": "", "outcome": outcome,
            "outcome_on": "", "notes": ""}


def test_classes_add_up_to_open_rows(tmp_path):
    watchers = {k: {**W, "id": k} for k in ("base", "dead", "route", "few", "many")}
    rows = [row("base", "baseline", "1"), row("dead", "watch_failed", "HTTP 404"), row("route", "watch_failed", "HTTP 403"),
            row("few", "new_version", "h1"), row("many", "new_version", "h1"), row("many", "new_version", "h2"),
            row("many", "new_version", "h3"), row("many", "baseline", "1", outcome="reject")]
    fetched = {"many": ((["a"], None, b"x"), (["b"], None, b"y"))}
    lines = triage.classify(rows, watchers, {"S": {"verdict": "pass"}}, fetched, tmp_path)
    got = {l["watcher_id"]: l["class"] for l in lines}
    assert got == {"base": "baseline", "dead": "dead_url", "route": "route_failure",
                   "few": "real_change_candidate", "many": "churn"}
    assert sum(int(i.split(":")[1]) for l in lines for i in l["row_classes"].split(";")) == 7


def test_repeated_failure_pair_gets_a_reason():
    rows = [row("w1", "watch_failed", "HTTP 403", "2026-11-02"), row("w1", "watch_failed", "HTTP 403", "2026-11-10")]
    (pair,) = triage.repeated_pairs(rows, {"w1": W})
    assert pair["rows"] == 2 and "came back" in pair["reason"]
