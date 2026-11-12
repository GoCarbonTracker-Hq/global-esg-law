# Maintaining global-esg-law

For people who change the corpus or the tools. Visitors should start with [`README.md`](README.md). Source watching and updates are in [`upkeep/README.md`](upkeep/README.md).

## What a record looks like

Each file under `records/<ISO2>/<instrument>/` is one text version with these fields: `source_id`, `in_force`, `kind` (`adopted`, `consolidated` or `translation`), `language`, `text`, and usually `message`, `fetched_url` and `fetched_sha256`. A repeal record has empty text and `repealed: true`. Every official language of a version is stored, plus an English version where the source publishes one.

On the `history` branch each record is one commit. The commit carries trailers that name its origin: `Source-url`, `Licence` and `Language`, plus `Instrument`, `In-force`, `Kind`, `Jurisdiction` and `Instrument-id`.

Records marked `"extraction": "ocr"` come from scanned PDFs. The text is stored uncorrected, with the URL and sha256 of the original PDF in `fetched_url` and `fetched_sha256`. Arabic OCR in particular misreads digits, so check dates and article numbers against the PDF.

## Rebuild the history

```
python3 tools/build.py --branch history
```

This builds the `history` branch from scratch from `records/` and replaces the branch if it exists. It is the only build command: once anything under `records/` is tracked by git, a run without `--branch` exits 2 and writes nothing. Records added by `tools/update.py` (see `upkeep/README.md`) are ordinary record files, so the same command rebuilds the branch in `In-force` order.

The branch must carry the `Language` trailer on each commit, or every lookup shows language `-`.

As of 2026-11-10 the published `history` build (`7b5ed3a7`) predates one record on `main`: the Christmas Island plastic bag local law (`records/CX/cx-plastic-bag-local-law-2018/`). A lookup for CX on `origin/history` prints `no instruments stored for CX` until the branch is rebuilt. The head commit of that build is dated 2034-01-01 because commits are dated by in-force date and the newest-dated record is an Estonian provision not yet in force.

## Tests

```
python3 -m pytest tests -q
```

Python 3.11 or later, standard library plus git. pytest is the only extra. The `tests` workflow runs this, the corpus check and the publish gate on every pull request and on `main`. On 2026-11-12 the run ended with `185 passed`.

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

One full watcher run takes about 53 minutes (3191.6 s on 2026-11-10, from a laptop address, 183 failures across 1557 watchers; see `upkeep/cadence.json`, key `runs`). That is over the 15-minute monthly ceiling in `upkeep/README.md`, so watchers are run by hand and no schedule is enabled. They need a decided compute budget before they run on a schedule. Some state sites also fail certificate checks under Python while curl accepts them.
