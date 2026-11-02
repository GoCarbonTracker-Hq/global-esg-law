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

## From confirm to commit

Two commands. The first turns every row marked `confirm` with change `new_version` into one record file and one commit; the second rebuilds the dated history from all record files, upkeep records included.

```
python3 tools/update.py [--row <watcher_id>:<signal>] [--dry-run] [--no-commit]
python3 tools/build.py --branch history
```

`--branch history` is the only build command: on a repository with tracked records a run without `--branch` exits 2 and writes nothing.

For each row, `update.py` reads the `sources.json` row named by `source_id` and refuses the row at once, before any fetch, when that row's verdict is not `pass` at that moment. It then fetches the text with the recipe in `SOURCES.md` for that source (EUR-Lex Cellar by CELEX number, adopted or consolidated; legislation.gov.uk `data.xml`, enacted, made or revised; eCFR versioner by date), writes `records/<iso2>/<instrument>/<signal>-<kind>.json` with the six record keys, marks the scope.json entry `stored` and adds the source row to its `source_row` where a second form arrives (what the pilot stories did), appends one line under `### upkeep` in `SOURCES.md`, and runs `tools/check_corpus.py`. The `signal` of the row is the `in_force` date. A source without a recipe (Federal Register, California bulk files, non-pass rows) prints `no recipe for <source_id>` and the row stays open.

A refused row (verdict not `pass`, fetch failed, record already present, gate failed) keeps its `outcome`; the reason is written into `notes` as `refused <date>: <reason>`, and the files written for it are taken back. A stored row gets `outcome` `stored` and `notes` `stored <record path>`.

By default the four changed paths (the record, `register/<iso2>/scope.json`, `SOURCES.md`, `upkeep/queue.csv`) are committed to a branch `upkeep/<iso2>-<instrument>-<in_force>` created from the current branch, one branch per row, and the tool prints the `git push -u origin` and `gh pr create --head` commands. It never pushes and never commits on the current branch; refusal notes stay in the working tree of the current branch for the reviewer. The commit step refuses to run while `SOURCES.md`, `upkeep/queue.csv`, `records/` or `register/` have uncommitted changes. `--no-commit` leaves the files in the working tree instead. `--dry-run` fetches nothing, writes nothing and prints what each row would do. The exit code is 1 when any selected row was refused or left open.
