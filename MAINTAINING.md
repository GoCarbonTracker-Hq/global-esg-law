# Maintaining global-esg-law

For people who change the corpus or the tools. Visitors should start with [`README.md`](README.md). Source watching and updates are in [`upkeep/README.md`](upkeep/README.md).

## What a record looks like

Each file under `records/<ISO2>/<instrument>/` is one text version with these fields: `source_id`, `in_force`, `kind` (`adopted`, `consolidated` or `translation`), `language`, `text`, and usually `message`, `fetched_url` and `fetched_sha256`. A repeal record has empty text and `repealed: true`. Every official language of a version is stored, plus an English version where the source publishes one.

On the `history` branch each record is one commit. The commit carries trailers that name its origin: `Source-url`, `Licence` and `Language`, plus `Instrument`, `In-force`, `Kind`, `Jurisdiction` and `Instrument-id`.

A record with `"re_enactment": true` marks an instrument re-enacted on or after its repeal. The builder writes `Re-enactment: true` on that commit. The publish gate refuses any other record dated on or after the instrument's repeal. A record with `in_force: null` uses its file-name date as a publication date and carries `Date-basis: publication` in its commit.

Records marked `"extraction": "ocr"` come from scanned PDFs. The text is stored uncorrected, with the URL and sha256 of the original PDF in `fetched_url` and `fetched_sha256`. Arabic OCR in particular misreads digits, so check dates and article numbers against the PDF.

## Rebuild the history

```
python3 tools/build.py --branch history
```

This builds the `history` branch from scratch from `records/` and replaces the branch if it exists. It is the only build command: once anything under `records/` is tracked by git, a run without `--branch` exits 2 and writes nothing. Records added by `tools/update.py` (see `upkeep/README.md`) are ordinary record files, so the same command rebuilds the branch in `In-force` order.

For a local test rebuild, choose a separate branch name, such as `history-gel-32-01`. Never use the published `history` name unless the release owner approves replacing it.

The branch must carry the `Language` trailer on each commit, or every lookup shows language `-`.

As of 2026-11-13 the published `history` build (`745289cd`, 3,240 commits) holds every record on `main`. A record added to `main` after a build does not show in a lookup on `origin/history` until the branch is rebuilt and published. Publishing replaces the branch, and the maintainer does that step by hand. The head commit of that build is dated 2034-01-01 because commits are dated by in-force date and the newest-dated record is an Estonian provision not yet in force.

## Tests

```
python3 -m pytest tests -q
```

Python 3.11 or later, standard library plus git. pytest is the only extra. The `tests` workflow runs this, the corpus check and the publish gate on every pull request and on `main`. On 2026-11-12 the run ended with `185 passed`. The workflow fetches the `history` branch first, and fails if a test that reads the real history is skipped; a local run without that branch skips those tests instead.

## Release checks

Run these in order and compare each last line with the expected one:

1. `python3 tools/check_corpus.py` ends with `3240 records checked` (as of 2026-11-10).
2. `python3 tools/publish_gate.py` exits 0.
3. `python3 -m pytest tests -q` ends with `N passed` and no failures.
4. `python3 tools/coverage.py`, then `git diff --quiet COVERAGE.md` exits 0 (no change).
5. `python3 tools/watch.py --dry-run` exits 0 or 1, never 2.
6. `python3 tools/coverage_grid.py`, then `git diff --quiet assets/coverage-grid.svg` exits 0 (no change).

`publish_gate.py` prints every source row and scope entry. It exits non-zero if an entry is `pending`, a stored entry has no record or a source row that is not `pass`, or a link-only entry has records.

## Watcher runs

One full watcher run takes close to an hour. The last full run on record, on 2026-11-11 from a laptop address, took 3481.9 s and ended with 158 failures across 1557 watchers (`upkeep/watch-run-2026-11-11.md`; that run is not yet in `upkeep/cadence.json`). That is over the 15-minute monthly ceiling in `upkeep/README.md`, so watchers are run by hand and no schedule is enabled. They need a decided compute budget before they run on a schedule. Some state sites also fail certificate checks under Python while curl accepts them.
