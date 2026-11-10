#!/usr/bin/env python3
"""Triage of the open rows in upkeep/queue.csv: sort every watcher with an open row into a class.

Classes: baseline, churn, real_change_candidate, route_failure, dead_url, unclear. A watcher with 3 or more
open new_version/terms_changed rows is fetched twice, --gap seconds apart, with tools/watch.py's own fetch and
signal functions; two different signals on an unchanged URL is churn, the same signal twice is not. A watcher
that fails either fetch is unclear. Reads the corpus, fetches pages, writes only upkeep/triage-*.csv and .md.
Decides no row; that stays with tools/queue.py.
"""
import argparse
import collections
import csv
import difflib
import json
import pickle
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import watch  # noqa: E402 - the fetch and signal functions are the watcher's own

ROOT = Path(__file__).resolve().parents[1]
CLASSES = ("baseline", "churn", "real_change_candidate", "route_failure", "dead_url", "unclear")
CHANGE_ROWS = ("new_version", "terms_changed")
MIN_ROWS = 3  # open new_version/terms_changed rows that make a watcher worth the double fetch
DEAD = ("HTTP 404", "HTTP 410")
OUTCOME = {"baseline": "reject (N0-baseline)", "churn": "reject under a noise rule Varun approves; fix watcher in GEL-28-02",
           "real_change_candidate": "open the page and decide", "route_failure": "GEL-28-05: second route",
           "dead_url": "GEL-28-05: retire or find the new URL", "unclear": "needs_evidence; fetch again"}
COLUMNS = ["watcher_id", "iso2", "source_id", "licence_verdict", "kind", "change", "open_rows", "has_records",
           "class", "proposed_outcome", "evidence", "row_classes"]
# first match wins; the cause names what moves in the page, the pattern is looked for in the changed lines
CAUSES = (("nonce/token", r"nonce|csrf|token|viewstate|__RequestVerification|authenticity|form_build_id"),
          ("email-protection key", r"email-protection|cdn-cgi"),
          ("archive toolbar/timing", r"web\.archive\.org|wayback|playback|timing|servers?:"),
          ("visit/view counter", r"vistas|views?</|visitors|\bhits\b|counter"),
          ("timestamp/date in page", r"\b(19|20)\d\d[-/ ]\d\d[-/ ]\d\d|\d\d:\d\d:\d\d|timestamp|generated"),
          ("support/request id", r"support id|request[-_ ]?id|sid=|jsessionid|trace"),
          ("script/settings blob", r"wp_block_styles|userSettings|sourceURL|Drupal\.settings|Incapsula|<script|function\(")
          )


def read_csv(path):
    with Path(path).open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def is_open(row):
    return (row.get("outcome") or "").strip() in ("", "needs_evidence")


def failure_class(signal):
    return "dead_url" if signal.strip() in DEAD else "route_failure"


def visible(body):
    try:
        return watch.text_hash("", body, {}, {})[0][0]
    except ValueError:
        return None


def changed_lines(a, b, limit=6, width=100):
    """Lines that differ between two bodies, markup split at '>' so a minified page gives readable lines."""
    split = lambda body: re.sub(r">", ">\n", watch._text(body)).splitlines()  # noqa: E731
    lines = [l for l in difflib.unified_diff(split(a), split(b), lineterm="", n=0)
             if l[:1] in "+-" and l[:3] not in ("+++", "---")]
    return [l[:width] for l in lines[:limit]]


def cause_of(a, b, lines):
    """Name what moves: a keyword cause from the changed lines, else whether visible text moved."""
    joined = " ".join(lines)
    for name, pattern in CAUSES:
        if re.search(pattern, joined, re.I):
            return name
    return "markup only (visible text same)" if visible(a) == visible(b) else "visible text moves"


def one_fetch(watcher, fetch):
    """(signals, error, body): the watcher's own run_watcher; the first GET body is kept for the diff."""
    bodies = []

    def capture(url, method):
        response = fetch(url, method)
        bodies.append(response[2])
        return response

    signals, error = watch.run_watcher(watcher, capture)
    return (None if signals is None else [s for s, _ in signals]), error, (bodies[0] if bodies else b"")


def double_fetch(watchers, fetch, gap, cache=None, now=time.monotonic, sleep=time.sleep):
    """{watcher id: (first, second)}, each (signals, error, body); the second fetch starts gap seconds after the first."""
    if cache and Path(cache).exists():
        return pickle.loads(Path(cache).read_bytes())
    first = {}
    for w in watchers:
        first[w["id"]] = (now(), one_fetch(w, fetch))
    result = {}
    for w in watchers:
        started, one = first[w["id"]]
        wait = started + gap - now()
        if wait > 0:
            sleep(wait)
        result[w["id"]] = (one, one_fetch(w, fetch))
    if cache:
        Path(cache).write_bytes(pickle.dumps(result))
    return result


def judge(watcher, pair):
    """(class, evidence, cause) for a watcher with many change rows, from its two fetches."""
    (s1, e1, b1), (s2, e2, b2) = pair
    if e1 or e2:
        return "unclear", f"fetch failed: {e1 or 'first fetch ok'} / {e2 or 'second fetch ok'}", "fetch failed"
    if set(s1) == set(s2):
        return ("real_change_candidate", "same signal on both fetches; the rows are not page noise", "stable page")
    if watcher["kind"] in ("page_hash", "text_hash"):
        lines = changed_lines(b1, b2)
        cause = cause_of(b1, b2, changed_lines(b1, b2, limit=400, width=300))
        return "churn", f"[{cause}] " + " || ".join(lines or ["(bodies differ, no line diff)"]), cause
    only = sorted(set(s1) ^ set(s2))[:4]
    return "churn", f"[signal moves] signals differ between fetches: {only}", "signal moves"


def classify(rows, watchers, sources, fetched, repo=ROOT):
    """One dict per watcher with an open row, in COLUMNS order, plus the per-row class counts."""
    by = collections.defaultdict(list)
    for r in rows:
        if is_open(r):
            by[r["watcher_id"]].append(r)
    out = []
    for wid, rs in sorted(by.items()):
        w = watchers[wid]
        change_rows = [r for r in rs if r["change"] in CHANGE_ROWS]
        failed = [r for r in rs if r["change"] == "watch_failed"]
        if wid in fetched:
            klass, evidence, _ = judge(w, fetched[wid])
        elif change_rows:
            klass, evidence = "real_change_candidate", f"{len(change_rows)} open row(s), under {MIN_ROWS}: not fetched twice"
        elif failed:
            klass = "dead_url" if all(failure_class(r["signal"]) == "dead_url" for r in failed) else "route_failure"
            evidence = "; ".join(sorted({r["signal"][:80] for r in failed}))
        else:
            klass, evidence = "baseline", "first run"
        row_class = collections.Counter()
        for r in rs:
            row_class[{"baseline": "baseline"}.get(r["change"]) or
                      (failure_class(r["signal"]) if r["change"] == "watch_failed" else klass)] += 1
        has_records = (Path(repo) / "records" / w["iso2"] / w["instrument"]).is_dir() if w["instrument"] != "*" else False
        out.append(dict(zip(COLUMNS, [
            wid, w["iso2"], w["source_id"], sources.get(w["source_id"], {}).get("verdict", "not in sources.json"),
            w["kind"], "+".join(sorted({r["change"] for r in rs})), len(rs), "yes" if has_records else "no",
            klass, OUTCOME[klass], evidence,
            ";".join(f"{k}:{v}" for k, v in sorted(row_class.items()))])))
    return out


def repeated_pairs(rows, watchers):
    """Every watcher_id:signal that appears in more than one row, with a reason read from the watcher's other rows."""
    groups = collections.defaultdict(list)
    for r in rows:
        groups[(r["watcher_id"], r["signal"])].append(r)
    out = []
    for (wid, signal), rs in sorted(groups.items()):
        if len(rs) < 2:
            continue
        first, last = min(r["detected_on"] for r in rs), max(r["detected_on"] for r in rs)
        between = sorted({(r["change"], r["signal"][:40]) for r in rows if r["watcher_id"] == wid
                          and first < r["detected_on"] < last and r["signal"] != signal})
        change = rs[0]["change"]
        if change == "watch_failed":
            how = (f"a different result at {between[0][1]!r} came between" if between
                   else "a run in between succeeded or repeated it silently (no row)")
            reason = f"the same failure came back: {how}"
        else:
            kind = watchers[wid]["kind"]
            reason = (f"a {kind} watcher keeps only its current value, so the page flipped back to a signal seen before"
                      if kind not in watch.ACCUMULATE else f"a {kind} signal was raised again")
        out.append({"pair": f"{wid}:{signal[:60]}", "change": change, "rows": len(rs),
                    "dates": ",".join(sorted(r["detected_on"] for r in rs)), "reason": reason})
    return out


def noise_rules(lines):
    """Group churn watchers by cause: [(rule id, cause, [watcher ids], one evidence)]."""
    groups = collections.defaultdict(list)
    for l in lines:
        if l["class"] == "churn":
            groups[re.match(r"\[(.*?)\]", l["evidence"]).group(1)].append(l)
    ordered = sorted(groups.items(), key=lambda kv: -len(kv[1]))
    return [(f"N{i}", cause, [l["watcher_id"] for l in ls], ls[0]["evidence"]) for i, (cause, ls) in enumerate(ordered, 1)]


def write_outputs(repo, lines, rows, pairs, stamp, command):
    upkeep = Path(repo) / "upkeep"
    with (upkeep / f"triage-{stamp}.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(lines)
    open_rows = [r for r in rows if is_open(r)]
    wcount = collections.Counter(l["class"] for l in lines)
    rcount = collections.Counter()
    for l in lines:
        for item in l["row_classes"].split(";"):
            k, v = item.split(":")
            rcount[k] += int(v)
    by_change = collections.Counter((r["change"], r["watcher_id"]) for r in open_rows)
    change_watchers = collections.Counter(c for c, _ in by_change)
    rules = noise_rules(lines)
    md = [f"# Queue triage {stamp}", "", f"Produced by `{command}` from `upkeep/queue.csv` and `upkeep/watchers.json`. "
          f"Open rows: {len(open_rows)}. Watchers with an open row: {len(lines)}.", "",
          "## Rows and watchers per class", "", "| Class | Rows | Watchers |", "|---|---|---|"]
    md += [f"| {c} | {rcount[c]} | {wcount[c]} |" for c in CLASSES]
    md += [f"| total | {sum(rcount.values())} | {sum(wcount.values())} |", "",
           "Rows per class sum the row-level class of every open row (a baseline row is `baseline`, a failed row "
           "`route_failure` or `dead_url`, a new_version or terms_changed row the class of its watcher). "
           "Watchers per class use the class of the watcher's change rows, else its failure rows, else baseline. "
           "Count: `python3 -c` over `upkeep/triage-" + stamp + ".csv` columns `class` and `row_classes`.", "",
           "## Open rows per change type", "", "| Change | Open rows | Watchers |", "|---|---|---|"]
    md += [f"| {c} | {n} | {change_watchers[c]} |" for c, n in sorted(collections.Counter(r['change'] for r in open_rows).items())]
    md += ["", "Count: `python3 -c \"import csv,collections;print(collections.Counter(r['change'] for r in csv.DictReader(open('upkeep/queue.csv')) if r['outcome'] in ('','needs_evidence')))\"`",
           "", "## Proposed noise rules (for Varun; none is applied)", "",
           "N0-baseline is approved. The rest are proposals: no row is rejected under them until Varun approves each.", "",
           "| Rule | Cause | Watchers | Evidence (one watcher) |", "|---|---|---|---|"]
    md += [f"| {rid} | {cause} | {len(ws)} | `{ws[0]}`: {ev.replace('|', '/')[:240]} |" for rid, cause, ws, ev in rules]
    md += ["", "## Unclear", "",
           f"{wcount['unclear']} watchers are `unclear`: the double fetch failed on one or both fetches, so churn "
           "cannot be told from a real change. Their failure text is in the `evidence` column of the csv.", "",
           "## Repeated watcher_id:signal pairs", "", f"{len(pairs)} pairs, {sum(p['rows'] for p in pairs)} rows.", "",
           "| Pair | Change | Rows | Dates | Reason |", "|---|---|---|---|---|"]
    md += [f"| `{p['pair']}` | {p['change']} | {p['rows']} | {p['dates']} | {p['reason']} |" for p in pairs]
    (upkeep / f"triage-{stamp}.md").write_text("\n".join(md) + "\n", encoding="utf-8")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--gap", type=int, default=300, help="seconds between the two fetches of a watcher")
    parser.add_argument("--cache", help="pickle of the fetched bodies; reused when it exists, so a re-run does not fetch")
    parser.add_argument("--stamp", default="2026-11")
    parser.add_argument("--repo", default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    repo = Path(args.repo)
    rows = read_csv(repo / "upkeep" / "queue.csv")
    watchers = {w["id"]: w for w in watch.load_watchers(repo)}
    sources = {s["id"]: s for s in json.loads((repo / "sources.json").read_text(encoding="utf-8"))}
    counts = collections.Counter(r["watcher_id"] for r in rows if is_open(r) and r["change"] in CHANGE_ROWS)
    targets = [watchers[w] for w, n in sorted(counts.items()) if n >= MIN_ROWS]
    fetched = double_fetch(targets, watch.default_fetch, args.gap, args.cache)
    lines = classify(rows, watchers, sources, fetched, repo)
    write_outputs(repo, lines, rows, repeated_pairs(rows, watchers), args.stamp, "python3 tools/triage.py")
    print(f"{len(lines)} watchers, {len(targets)} fetched twice")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
