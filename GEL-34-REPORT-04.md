STATUS: working

# GEL-34 story 04 report: look up the example law on a date (the page)

## Plan

BASE `141e4d67e5f79ad4b10b16f307ff1e4228942ec7`, branch `feat/gel-34-04-page`, ref `origin/history` (`55c8c2a9c`, 3360 records). Data file built to `web/law-data.json` with `--read-on 2026-11-17` (2.2 MB, 1404 entries, not committed; `.gitignore` line added).

Pieces, one deliverable each, one writer per file. Pieces 1 to 5 run as parallel Sonnet subagents against the contract below; I integrate, run the checks and commit.

| # | Piece | Files (sole writer) | Check that proves it done |
|---|---|---|---|
| 1 | Markup, styles, stylesheet checks | `web/index.html`, `web/style.css`, `tests/web/wcag.py`, `.gitignore` line | `python3 tests/web/wcag.py` prints ratios and exits 0; page opens with the slots in place |
| 2 | Data and dates | `web/data.js`, `web/dates.js` | node unit probe of `GEL.dates.isDate` against `query._valid_date` table (done again by check.mjs) |
| 3 | Answer, interim, find, wiring | `web/answer.js`, `web/interim.js`, `web/find.js`, `web/app.js` | example shows the CSRD panel in Chrome |
| 4 | Expected values | `tests/web/expected.py` | writes `expected.json`; prints counts; runs on 3.13 and 3.11 |
| 5 | Browser check | `tests/web/check.mjs` | prints `pairs=625 plain=622 interim=3 differ=0` and a final `check.mjs: N passed, M failed` line |

Integration (me): serve, run `check.mjs`, fix what it finds, pytest on 3.13 and 3.11, commit.

## Contract (what the five pieces share)

### Files, load order in `index.html`
One comment-marked block, one tag per line, all `<script defer>`, no modules: `data.js`, `dates.js`, `interim.js`, `answer.js`, `find.js`, `app.js` (last). Each file is one IIFE that starts with `const GEL = (window.GEL = window.GEL || {});`. Styles: `style.css` is the only file with `:root`.

### `GEL` names
- `data.js`: `GEL.DATA_PATH = "law-data.json"`; `GEL.load()` returns a Promise that sets `GEL.data` (the parsed file) and `GEL.byId` (id to entry) and resolves, or rejects with an Error when the fetch fails, the status is not 200, the body is not JSON, or the file lacks `snapshot.history_commit`, `snapshot.read_on`, `notice` or `entries`. It owns `#load-status`: writes "Loading the law list" when it starts, clears it on success, and on failure writes "The law list did not load. Reload the page, or use the commands in the README." with a Reload link (`#reload`, `href=""` that calls `location.reload()`) and a README link (`https://github.com/GoCarbonTracker-Hq/global-esg-law`). `GEL.loadFailed()` (called by app.js on rejection) leaves `#example` and `#date` disabled and hides `#answer-panel`.
- `dates.js`: `GEL.dates.isDate(text)` (true only for `^\d{4}-\d{2}-\d{2}$` that is a real calendar date, year 0001 to 9999, month length and leap year by text arithmetic, no Date object), `GEL.dates.today()` (the only `new Date` in all of `web/*.js`; local `getFullYear`/`getMonth`/`getDate`, zero padded), `GEL.date` (last accepted date text), `GEL.setDate(text)` returns true or false: true sets `GEL.date`, the field value, the echo `#date-echo`, clears the hint, and if `GEL.chosen` is set calls `GEL.showAnswer(GEL.chosen, text)`; false keeps `GEL.date`, the echo and the answer, and remembers the refusal. `GEL.dateLeft()` (wired to `blur`): if the last attempt was refused, shows the hint `#date-hint` "Enter a date in the form 2025-06-01.", sets `aria-invalid="true"` on `#date` and `aria-describedby="date-echo date-hint"`; otherwise `aria-invalid="false"` and `aria-describedby="date-echo"`. `GEL.initDate()` sets the default date to today with `GEL.setDate`.
- `interim.js`: `GEL.interim.render(ctx)` fills `#answer-interim` for any answer that is not plain and returns the hidden sentence. `ctx = {entry, date, reason, data}`. Sentence on screen: "This build answers only the plain in-force case. For this date use the command line (see the README)." Hidden sentence: `${entry.title}, ${sentence}`. Story 06 replaces this file.
- `answer.js`: `GEL.classify(entry, date)` returns `{kind: "plain", interval, row}` or `{kind: "interim", reason}` with `reason` one of `link-only`, `before-first`, `repealed`, `not-yet-applying`, `date-basis`, `archive-copy`, `other`. Rule: no `intervals` or no versions is `link-only`; the last interval whose `from` is on or before the date (text compare) else `before-first`; state `repealed` is `repealed`; `not_yet_applying` is `not-yet-applying`; row = the `versions` row whose `commit` equals the interval `commit`; row with `date_basis` is `date-basis`; row with `copy` is `archive-copy`; row kind not adopted, consolidated or translation is `other`. The page never ranks kinds or compares version dates. `GEL.showAnswer(id, date)` draws only the panel (it does not set the box or the date field, does not validate the date): fills `#answer-panel`, sets `data-state` (`plain` or `interim`), `data-id`, `data-date`, and `data-commit` (plain only, the full 40-character commit of the row; removed for interim), unhides it, updates `#answer-sentence`, then calls every function registered with `GEL.onAnswer(fn)` as `fn({entry, date, interval, row, panel})` (`interval` and `row` are null for interim). Unknown id: draws nothing, throws an Error.
- `find.js`: `GEL.EXAMPLE = {id: "eu-csrd-2022-2464", date: "2025-06-01"}`; `GEL.chosen` (entry id or null); `GEL.choose(id)` sets `GEL.chosen` and writes the stored title into `#law` (read-only here; it does not draw); `GEL.pickExample()` runs `GEL.choose(EXAMPLE.id)` then `GEL.setDate(EXAMPLE.date)`. Story 05 owns this file next.
- `app.js` (wiring only): on load of the script: `GEL.initDate()`, listeners (`#date` `input` and `change` call `GEL.setDate(this.value)`, `#date` `blur` calls `GEL.dateLeft()`, `#example` `click` calls `GEL.pickExample()`), then `GEL.load().then(enable #example and #date, GEL.loadFailed)`.

### DOM ids in `index.html` (stable; check.mjs reads them)
`#title` (h1), `#law` (read-only text input with `<label for="law">Law</label>`, `autocomplete="off"`, first tab stop, no autofocus), `#match-list` (empty slot under the law box), `#date` (`type="date"`, `min="1000-01-01"`, `max="9999-12-31"`, `<label for="date">Date</label>`, starts `disabled`), `#date-echo` (monospace), `#date-hint` (hidden until shown), `#example` (button, starts `disabled`, text "Try the example: CSRD on 2025-06-01"), `#load-status` (`role="status"`, aria-live polite), `<noscript>` with "This page needs JavaScript to look up laws. The same lookup runs on the command line; see the README.", `#answer` (wrapper, never hidden) containing `#answer-sentence` (`role="status"`, visually hidden, persistent) and `#answer-panel` (`hidden` until the first answer). Inside the panel, in this order: `[data-field="status"]`, `[data-field="title"]` (Georgia), `#answer-plain` (`[data-field="since"]`, `[data-field="kind"]` with `data-kind`, `[data-field="language"]`, `[data-field="codes"]`, `a[data-field="link"]`, `#slot-after-link`, `#slot-citation`, `[data-field="asked"]` and `[data-field="read"]` side by side, `[data-field="snapshot"]`), `#answer-interim` (interim sentence), `[data-field="notice"]`. Plain answers hide `#answer-interim` and the interim ones hide `#answer-plain` and the status field (`hidden` attribute). Then `#rail` (empty slot, `aside`), then `#browse-by-place` (section with its heading "Browse by place" and no content). Source order: header (title, lookup bar), main (`#answer`, `#rail`), then `#browse-by-place`. At 48rem and wider the title and the lookup bar share the top bar and `#rail` (15rem) sits left of `#answer` in a page no wider than 62rem; below 48rem one column in source order. No skip link, sticky bar or dark theme.

### Text the page prints (plain answer)
- status: `Version in force on {date}`; title: stored title; since: `In force since {row.in_force}`; kind: consolidated is "Consolidated version: the publisher's text with later amendments merged in."; adopted and translation get a one-line plain statement in the same shape (the writer of answer.js reads README lines 40 to 55 and COVERAGE.md for what the kinds mean and does not invent a meaning). language: `Language: {row.language}`; codes: `Law family {law_family} · Verification {verification}` (the stored codes, for example `F1` and `official_text_seen`); link text `Official text (opens in a new tab)`, `href` = `row.source_url`, `target="_blank"`, `rel="noopener"`; asked: `Date asked {date}`; read: `Corpus read {snapshot.read_on}`; snapshot: `Snapshot {history_commit[0:9]}, {coverage.status}`; notice: `data.notice` verbatim from the file.
- hidden sentence (plain): `{title}, version in force on {date}: {kind word} version, in force since {row.in_force}.` with kind word `consolidated`, `adopted` or `translation`. (The story quotes the shorter "Directive (EU) 2022/2464, version in force on 2025-06-01: consolidated version, in force since 2025-04-17."; the data file has no short name for a law, so the stored title is used. Reported under "What Varun must decide".)
- interim: no "In force since", no link, no `data-commit`.

### `expected.json` (written by `tests/web/expected.py`, read by `check.mjs`)
`python3 tests/web/expected.py --ref origin/history --read-on 2026-11-17 --out PATH [--repo PATH]`. Values come from `query.lookup(..., detail=True)`, `query.law_in_force`, `query.envelope`, `query._commits`, `query._valid_date` and the register scope files, never from `web/law-data.json`.
```
{ "ref", "history_commit" (40 chars), "snapshot9", "coverage_status", "read_on", "notice", "snapshot_line",
  "example": {"id","date","title","since","kind","language","law_family","verification","source_url","commit","sentence"},
  "csrd": [{"date","commit"|null}] x8  (the story says "seven CSRD dates" but lists eight, recounted; in this order: 2022-12-31 null, 2023-01-05, 2025-04-16, 2025-04-17, 2025-06-01, 2026-03-17, 2026-03-18, 2026-11-17),
  "csrd_fixed": [{"date","commit_prefix"}]  (the story's fixed list, 9 characters, compared with lookup by expected.py itself and it exits non-zero on a mismatch),
  "pairs": [{"id","place","date","commit"|null,"kind","language","plain": true|false}],
  "pair_counts": {"pairs","plain","interim","instruments","places"},
  "interim_cases": [{"id","date","label","why"}]  (CSRD 2022-12-31; gn-arrete-2022-1646-evaluations-environnementales 2023-05-05; ae-dl-11-2024-climate; eu-esrs-2023-2772 2023-12-25),
  "date_table": [{"value","valid"}]  (the seven story dates, three passing dates, and every month end of 2023, 2024, 2100, valid from query._valid_date; plus the malformed-shape values 2025-6-1 and 10000-01-01 as false) }
```
Pairs: group `query._commits(repo, ref)` by id and `in_force`, non-repeal rows only; a pair is shared when a group has two or more rows; for each pair take the lookup of the instrument's place on that date (`detail=True`) and record the item with that id. `plain` is false when the item has `not_yet_applying` or `date_basis`, or `copy` would apply (host in archive hosts), otherwise true. Prints `pairs=… plain=… interim=…`.

### `check.mjs`
`node tests/web/check.mjs --data web/law-data.json --expected PATH [--port 8404] [--cdp 9404] [--profile ~/.cache/gel34-chrome/story-04] [--chrome PATH]`. Starts its own `node:http` server on the port (serves `web/`, maps `/law-data.json` to the variant of the run, logs every request), starts Chrome headless with remote debugging on the CDP port and a profile folder, drives it over `WebSocket` (Node global), stops both at the end, and prints one line per acceptance criterion then `check.mjs: N passed, M failed` (exit 1 when M > 0). Covers the story's 14 criteria except the Lighthouse box (printed as `not run, by hand later`) and the contrast numbers (wcag.py).

### Ports, tools
Server 8404, Chrome debugging 9404 (take the next free one and say so), profile `~/.cache/gel34-chrome/story-04`. Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, `node` v26.10.0, `python3.13`, `~/.cache/gel34-py311/bin/python`. Install and download nothing.

## What I did
(filled in as the work lands)
