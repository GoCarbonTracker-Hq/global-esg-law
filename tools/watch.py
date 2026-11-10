#!/usr/bin/env python3
"""Source watcher: notice when an official source changes, without fetching or storing law text.

Reads upkeep/watchers.json, fetches each watcher's signal (a list of dates, a header or a hash),
compares it with upkeep/seen.json, appends candidate rows to upkeep/queue.csv for a person to
review, and updates seen.json. Writes only under upkeep/.
"""
import argparse
import csv
import gzip
import hashlib
import html
import http.client
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TIMEOUT = 30
COLUMNS = ["detected_on", "watcher_id", "iso2", "source_id", "instrument", "change", "signal",
           "evidence_url", "reviewer", "outcome", "outcome_on", "notes"]
CHANGES = ("new_version", "terms_changed", "repealed")
TIERS = ("gazette_feed", "consolidation_site", "regulator_page", "tracker_pointer")  # see upkeep/cadence.json
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
USER_AGENT = "global-esg-law-watch/1"  # lexpol.cloud.pf drops the connection for any agent carrying a URL


def default_fetch(url, method="GET"):
    """Return (status, headers, body_bytes). HTTP errors return their status; other errors raise."""
    request = urllib.request.Request(url, method=method, headers={
        "User-Agent": USER_AGENT,
        "Accept-Encoding": "gzip"})
    for attempt in (1, 2):  # one retry: a truncated read (IncompleteRead) is never a real signal
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
                status, headers, body = response.status, dict(response.headers), response.read()
            break
        except urllib.error.HTTPError as exc:
            status, headers, body = exc.code, dict(exc.headers or {}), b""
            break
        except http.client.IncompleteRead:
            if attempt == 2:
                raise
    if body[:2] == b"\x1f\x8b":
        body = gzip.decompress(body)
    return status, headers, body


def _text(body):
    return body.decode("utf-8", errors="replace") if isinstance(body, bytes) else body


def _header(headers, name):
    return next((v for k, v in headers.items() if k.lower() == name.lower()), None)


def _iso(value):
    """Accept YYYY-MM-DD or YYYYMMDD (the form inside a Cellar consolidation id) and return YYYY-MM-DD."""
    if re.fullmatch(r"\d{8}", value):
        value = f"{value[:4]}-{value[4:6]}-{value[6:]}"
    if not DATE_RE.fullmatch(value):
        raise ValueError(f"regex group {value!r} is not a date")
    return value


def date_list(url, body, headers, params):
    """Every date matched by the one group of params.regex."""
    regex = re.compile(params["regex"])
    if regex.groups != 1:
        raise ValueError("params.regex must have exactly one group")
    dates = sorted({_iso(m.group(1)) for m in regex.finditer(_text(body))})
    return [(d, url) for d in dates]


def version_list(url, body, headers, params):
    """eCFR versioner JSON: every content_versions[].date."""
    data = json.loads(_text(body))
    dates = sorted({v["date"] for v in data["content_versions"]})
    return [(d, url) for d in dates]


def http_head(url, body, headers, params):
    """Last-Modified of a HEAD request, or Content-Length when there is none."""
    for name in ("Last-Modified", "Content-Length"):
        value = _header(headers, name)
        if value:
            return [(f"{name}: {value.strip()}", url)]
    raise ValueError("HEAD response has neither Last-Modified nor Content-Length")


def page_hash(url, body, headers, params):
    """sha256 of the body."""
    return [(hashlib.sha256(body if isinstance(body, bytes) else body.encode()).hexdigest(), url)]


LINK_ATTRS = {"a": "href", "iframe": "src", "embed": "src", "object": "data"}  # not link, script, img or form: cache-busting URLs
LINK_TAG = re.compile(r"<(a|iframe|embed|object)\b([^>]*)>", re.I)


def link_targets(markup):
    """The href of every <a> and the src/data of every <iframe>, <embed> and <object>, in document order."""
    targets = []
    for tag in LINK_TAG.finditer(markup):
        attr = LINK_ATTRS[tag.group(1).lower()]
        found = re.search(rf"(?<![\w-]){attr}\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+))", tag.group(2), flags=re.I)
        if found:
            target = html.unescape(next(g for g in found.groups() if g is not None)).strip()
            if target:
                targets.append(target)
    return targets


def text_hash(url, body, headers, params):
    """sha256 of the visible text (scripts, styles, tags and whitespace runs removed) followed by the link targets
    (see link_targets), so a swapped PDF behind unchanged link wording moves the signal.

    params.cut, a list of regexes, is applied to that whole string to remove a moving part (a counter, a session id
    or token inside a link). Off unless set.
    """
    markup = re.sub(r"(?s)<(script|style)\b.*?</\1>", " ", _text(body), flags=re.I)
    visible = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", markup)).split())
    if not visible:
        raise ValueError("no visible text")
    targets = link_targets(markup)
    text = visible + (" ||links|| " + " ".join(targets) if targets else "")
    for pattern in params.get("cut", []):
        text = " ".join(re.sub(pattern, " ", text).split())
    if not text:
        raise ValueError("no visible text")
    return [(hashlib.sha256(text.encode("utf-8")).hexdigest(), url)]


def ecfr_more_pages(url, body):
    """The versioner paginates at 1000 entries; return the URLs of the pages after the first."""
    meta = json.loads(_text(body)).get("meta", {})
    total = int(meta.get("total_pages", 1))
    parts = urllib.parse.urlsplit(url)
    query = [(k, v) for k, v in urllib.parse.parse_qsl(parts.query) if k != "page"]
    return [urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(query + [("page", str(page))])))
            for page in range(2, total + 1)]


KINDS = {"date_list": date_list, "version_list": version_list, "http_head": http_head, "page_hash": page_hash,
         "text_hash": text_hash}
METHODS = {"http_head": "HEAD"}
MORE_PAGES = {"version_list": ecfr_more_pages}
ACCUMULATE = ("date_list", "version_list")  # signals are a growing set, not a single current value


def load_watchers(repo, source=None):
    """Read and validate upkeep/watchers.json against sources.json and register/<ISO2>/scope.json."""
    watchers = json.loads((repo / "upkeep" / "watchers.json").read_text(encoding="utf-8"))
    rows = {r["id"] for r in json.loads((repo / "sources.json").read_text(encoding="utf-8"))}
    ids = set()
    for w in watchers:
        for key in ("id", "source_id", "iso2", "instrument", "kind", "tier", "url"):
            if not w.get(key):
                raise ValueError(f"watcher {w.get('id')!r}: missing {key}")
        if w["id"] in ids:
            raise ValueError(f"watcher {w['id']!r}: duplicate id")
        ids.add(w["id"])
        if w["source_id"] not in rows:
            raise ValueError(f"watcher {w['id']}: source_id {w['source_id']!r} not in sources.json")
        if w["kind"] not in KINDS:
            raise ValueError(f"watcher {w['id']}: kind {w['kind']!r} is not one of {sorted(KINDS)}")
        if w["tier"] not in TIERS:
            raise ValueError(f"watcher {w['id']}: tier {w['tier']!r} is not one of {TIERS}")
        if w.get("change", "new_version") not in CHANGES:
            raise ValueError(f"watcher {w['id']}: change {w['change']!r} is not one of {CHANGES}")
        if w["kind"] == "date_list" and not w.get("params", {}).get("regex"):
            raise ValueError(f"watcher {w['id']}: date_list needs params.regex")
        if "cut" in w.get("params", {}):
            cut = w["params"]["cut"]
            if w["kind"] != "text_hash" or not isinstance(cut, list) or not all(isinstance(p, str) for p in cut):
                raise ValueError(f"watcher {w['id']}: params.cut is a list of regexes and needs kind text_hash")
            for pattern in cut:
                try:
                    re.compile(pattern)
                except re.error as exc:
                    raise ValueError(f"watcher {w['id']}: params.cut {pattern!r}: {exc}") from exc
        if w["instrument"] != "*":
            scope_path = repo / "register" / w["iso2"] / "scope.json"
            scope = json.loads(scope_path.read_text(encoding="utf-8")) if scope_path.exists() else []
            if not any(e.get("id") == w["instrument"] for e in scope):
                raise ValueError(f"watcher {w['id']}: instrument {w['instrument']!r} not in register/{w['iso2']}/scope.json")
    return [w for w in watchers if source is None or w["source_id"] == source]


def run_watcher(watcher, fetch):
    """Return (signals, error). signals is a list of (signal, evidence_url); error is None or text."""
    url, kind = watcher["url"], watcher["kind"]
    params = watcher.get("params", {})
    method = METHODS.get(kind, "GET")
    try:
        status, headers, body = fetch(url, method)
        if status != 200:
            return None, f"HTTP {status}"
        if method == "GET" and not body:
            return None, "empty body"
        signals = KINDS[kind](url, body, headers, params)
        for more in MORE_PAGES.get(kind, lambda u, b: [])(url, body):
            status, headers, body = fetch(more, method)
            if status != 200:
                return None, f"HTTP {status} on {more}"
            if not body:
                return None, f"empty body on {more}"
            signals += KINDS[kind](more, body, headers, params)
    except Exception as exc:  # noqa: BLE001 - any parser or transport failure is a watch_failed row
        return None, f"{type(exc).__name__}: {exc}"
    return signals, None


def _count(sizes, response):
    """Record the body length of one fetch response and pass the response through."""
    sizes.append(len(response[2]))
    return response


def watch(repo=ROOT, fetch=None, today=None, source=None, dry_run=False):
    """Run every watcher (or those of one source).

    Return {"run", "candidates", "failures", "rows", "seconds", "bytes"}; the last two are the run's totals of
    the per-watcher wall time and body bytes that are also written into seen.json.
    """
    repo = Path(repo).resolve()
    fetch = fetch or default_fetch
    today = (today or date.today()).isoformat() if not isinstance(today, str) else today
    upkeep = repo / "upkeep"
    seen_path, queue_path = upkeep / "seen.json", upkeep / "queue.csv"
    seen = json.loads(seen_path.read_text(encoding="utf-8")) if seen_path.exists() else {}
    watchers = load_watchers(repo, source)
    rows, failures, seconds, nbytes = [], 0, 0.0, 0

    def row(w, change, signal, evidence_url, notes=""):
        rows.append({"detected_on": today, "watcher_id": w["id"], "iso2": w["iso2"], "source_id": w["source_id"],
                     "instrument": w["instrument"], "change": change, "signal": signal,
                     "evidence_url": evidence_url, "reviewer": "", "outcome": "", "outcome_on": "", "notes": notes})

    for w in watchers:
        entry = seen.get(w["id"], {"signals": None, "failure": None})
        sizes, started = [], time.monotonic()
        signals, error = run_watcher(w, lambda url, method: _count(sizes, fetch(url, method)))
        cost = {"seconds": round(time.monotonic() - started, 2), "bytes": sum(sizes)}
        seconds, nbytes = seconds + cost["seconds"], nbytes + cost["bytes"]
        if error is not None:
            failures += 1
            if entry.get("failure") != error:
                second = w.get("params", {}).get("second_route") or "none listed"
                row(w, "watch_failed", error, w["url"], f"second_route: {second}")
            entry = {**entry, "failure": error, "checked_on": today, **cost}
        else:
            current = [s for s, _ in signals]
            known = entry.get("signals")
            if known is None:
                row(w, "baseline", str(len(set(current))), w["url"])
                known = []
            else:
                for signal, evidence_url in signals:
                    if signal not in known:
                        row(w, w.get("change", "new_version"), signal, evidence_url)
            kept = sorted(set(known) | set(current)) if w["kind"] in ACCUMULATE else current
            entry = {"signals": kept, "failure": None, "checked_on": today, **cost}
        seen[w["id"]] = entry

    candidates = sum(1 for r in rows if r["change"] != "watch_failed")
    if not dry_run and watchers:
        upkeep.mkdir(exist_ok=True)
        new_file = not queue_path.exists() or queue_path.stat().st_size == 0
        with queue_path.open("a", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=COLUMNS, lineterminator="\r\n")
            if new_file:
                writer.writeheader()
            writer.writerows(rows)
        seen_path.write_text(json.dumps(seen, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    return {"run": len(watchers), "candidates": candidates, "failures": failures, "rows": rows,
            "seconds": round(seconds, 2), "bytes": nbytes}


def reseed(repo, watcher_id, fetch=None, today=None):
    """Fetch one watcher once and write its current signals to seen.json. No queue row. Return the signal count.

    Raises ValueError when the watcher is unknown or its fetch fails; seen.json is then left as it was.
    """
    repo = Path(repo).resolve()
    today = (today or date.today()).isoformat() if not isinstance(today, str) else today
    watcher = next((w for w in load_watchers(repo) if w["id"] == watcher_id), None)
    if watcher is None:
        raise ValueError(f"no watcher {watcher_id!r} in upkeep/watchers.json")
    sizes, started = [], time.monotonic()
    fetch = fetch or default_fetch
    signals, error = run_watcher(watcher, lambda url, method: _count(sizes, fetch(url, method)))
    if error is not None:
        raise ValueError(f"{watcher_id}: {error}")
    seen_path = repo / "upkeep" / "seen.json"
    seen = json.loads(seen_path.read_text(encoding="utf-8")) if seen_path.exists() else {}
    current = [s for s, _ in signals]
    seen[watcher_id] = {"signals": sorted(set(current)) if watcher["kind"] in ACCUMULATE else current,
                        "failure": None, "checked_on": today,
                        "seconds": round(time.monotonic() - started, 2), "bytes": sum(sizes)}
    seen_path.write_text(json.dumps(seen, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    return len(current)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--source", help="run only the watchers of this sources.json id")
    parser.add_argument("--reseed", metavar="WATCHER_ID",
                        help="fetch this one watcher, store its current signal in seen.json, add no queue row")
    parser.add_argument("--dry-run", action="store_true", help="fetch and compare, write nothing")
    parser.add_argument("--repo", default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    try:
        if args.reseed:
            print(f"{args.reseed}: reseeded, {reseed(args.repo, args.reseed)} signal(s)")
            return 0
        result = watch(args.repo, source=args.source, dry_run=args.dry_run)
    except (ValueError, OSError, json.JSONDecodeError, KeyError) as exc:
        print(exc, file=sys.stderr)
        return 1
    if args.dry_run:
        writer = csv.DictWriter(sys.stdout, fieldnames=COLUMNS, lineterminator="\n")
        writer.writerows(result["rows"])
    print(f"{result['run']} watchers run, {result['candidates']} candidates, {result['failures']} failures, "
          f"{result['seconds']:.1f} s, {result['bytes']} bytes")
    return 1 if result["failures"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
