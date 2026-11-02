# Upkeep

Tools that notice when an official source changes, so a person can decide whether a new version belongs in `records/`. Nothing here fetches or stores law text. The watcher reads version lists, response headers and page hashes, and writes only under `upkeep/`.

## Run

```
python3 tools/watch.py [--source <sources.json id>] [--dry-run]
```

Each watcher in `watchers.json` is fetched once (a `HEAD` request for `http_head`, a `GET` otherwise, 30 s timeout), its signal is compared with `seen.json`, candidate rows are appended to `queue.csv`, and `seen.json` is updated. The run prints `N watchers run, M candidates, K failures` and exits 1 when K > 0. `--source` runs only the watchers of one licence-table row. `--dry-run` fetches and compares, prints the rows it would append, and writes nothing.

A contributor's run ends in a pull request from a fork, never a push to main.

## watchers.json

One entry per watcher. A watcher may point at a `sources.json` row whose verdict is not `pass`; it still runs, because no watcher ever fetches law text.

| Key | Meaning |
|---|---|
| `id` | Unique name of the watcher, used in `seen.json` and `queue.csv`. |
| `source_id` | An `id` in `sources.json`. |
| `iso2` | Jurisdiction code, matching `register/<ISO2>/`. |
| `instrument` | An `id` in `register/<ISO2>/scope.json`, or `*` for a watcher that covers the source as a whole. |
| `kind` | One of the four kinds below. |
| `url` | What is fetched. Never a URL whose body is law text. |
| `params.regex` | `date_list` only: a regular expression with exactly one group that captures a date as `YYYY-MM-DD` or `YYYYMMDD`. |
| `params.second_route` | Optional: where a person can check by hand when the fetch fails. Copied into the `notes` of a `watch_failed` row. |
| `change` | Optional, default `new_version`. Set `terms_changed` on a watcher that points at a licence or terms page, such as a `page_hash` of a `sources.json` row's `terms_url`. |

### Kinds

| Kind | Signal | New when |
|---|---|---|
| `date_list` | Every date captured by `params.regex` (the Cellar SPARQL list and the legislation.gov.uk `hasVersion` links are both this kind with different regexes). | A date is not in `seen.json`. |
| `version_list` | Every `content_versions[].date` in eCFR versioner JSON. The versioner paginates at 1000 entries; the watcher follows `meta.total_pages`. | A date is not in `seen.json`. |
| `http_head` | `Last-Modified` of a `HEAD` request, or `Content-Length` when there is no `Last-Modified`. | The value differs from `seen.json`. |
| `page_hash` | sha256 of the body. | The hash differs from `seen.json`. |

## seen.json

One entry per watcher id: `signals` (the dates or the current value; `null` until the first successful fetch), `failure` (the text of the last failure, or `null`) and `checked_on`. A watcher with no entry records every current signal and gets one `baseline` row, so a source with many stored versions does not flood the queue on its first run. The file is written by the watcher and is not edited by hand.

## queue.csv

Appended, never rewritten; rows end in CRLF. A signal already in `seen.json` produces no row. A fetch failure (status not 200, empty body, timeout, parser error) produces one `watch_failed` row; the same failure on the next run produces no second row. A failure never counts as no change.

| Column | Meaning |
|---|---|
| `detected_on` | Date of the run, `YYYY-MM-DD`. |
| `watcher_id` | The `id` in `watchers.json`. |
| `iso2` | Jurisdiction code of the watcher. |
| `source_id` | The `sources.json` row of the watcher. |
| `instrument` | The scope entry id, or `*`. |
| `change` | `baseline` (first run, `signal` is the number of signals recorded), `new_version` (a date or value not seen before), `terms_changed` (same, for a watcher marked `change: terms_changed`) or `watch_failed`. |
| `signal` | The new date, the new header value or hash, the count for a baseline, or the status or exception text for a failure. |
| `evidence_url` | The URL the signal was read from. |
| `reviewer` | Filled by a person: who reviewed the row. |
| `outcome` | Filled by a person: `confirm` (a new version exists and should be stored or listed), `reject` (not a change that matters) or `needs_evidence` (the source must be opened by hand before deciding). |
| `outcome_on` | Filled by a person: date of the decision. |
| `notes` | For `watch_failed`, the watcher's `second_route` or `none listed`. Otherwise free text for the reviewer. |

Review of the queue is the next story (GEL-02-02). Storing a confirmed version still goes through `tools/check_corpus.py` and the licence table; the watcher has no say in that.

## Propose an update

The queue is reviewed by a person, one row at a time. `tools/queue.py` reads `queue.csv` and writes back the three reviewer columns; nothing else changes, and no law text is fetched.

```
python3 tools/queue.py
python3 tools/queue.py --outcome confirm|reject|needs_evidence --row <watcher_id>:<signal> --reviewer <name>
```

Without arguments the tool prints every open row (empty `outcome`, or `needs_evidence`) with the licence verdict of its `source_id` from `sources.json`, the register entry it touches (`iso2`, `instrument` and that entry's current `in_force` from `register/<ISO2>/scope.json`, or `source-level` for `*`), the evidence URL and the row's notes, then a count. With `--outcome` it fills `reviewer`, `outcome` and `outcome_on` (today) on the row named by `--row`, rewrites `queue.csv` with the same columns and CRLF line ends, and prints the decision. It exits 1 with a message when the row is not in the file or already carries `confirm` or `reject`. The `signal` part of `--row` is everything after the first colon, so a header value such as `Last-Modified: Mon, 26 Oct 2026 04:26:08 GMT` is passed whole. Filling the same three columns by hand in an editor is equivalent; put the reason in `notes` either way.

What each outcome does:

| Outcome | Effect |
|---|---|
| `confirm` | The row is closed. Only `confirm` rows are read by the update flow (GEL-02-04); the watcher and this tool store nothing in `records/`. |
| `reject` | The row is closed and stays in the file. For a `new_version` or `terms_changed` row the signal is also added to that watcher's `signals` in `seen.json`, so the same change is not flagged again. For a `baseline` or `watch_failed` row only the row is marked. |
| `needs_evidence` | The three columns are filled, but the row stays open and keeps appearing in the list until a later `confirm` or `reject`. Use it when the official page must be opened by hand first. |

A contributor proposes an update from a fork:

1. Fork and clone, then run `python3 tools/watch.py`. New rows land in `queue.csv`; `seen.json` is updated.
2. Run `python3 tools/queue.py` and open the evidence URL of each row. Decide each row with `--outcome`, or fill `reviewer`, `outcome` and `outcome_on` by hand with the same values, and write the reason in `notes`.
3. Run `python3 tools/publish_gate.py` and `python3 -m pytest tests -q`.
4. Open a pull request that carries the queue rows (the diff of `queue.csv` and `seen.json`) and the gate output pasted in the body. The pull request carries no law text and nothing under `records/`.

The owner opens the official page for every `confirm` row, checks the date or value against it, and merges only when the rows hold. Rows that do not hold are set to `reject` or `needs_evidence` in the same pull request rather than deleted, so the queue stays a record of what was looked at. Nothing in this flow says or implies that any company complies with any law.
