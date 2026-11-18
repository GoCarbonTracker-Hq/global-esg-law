STATUS: done

# GEL-34 story 04 report: look up the example law on a date (the page)

## Plan

BASE `141e4d67e5f79ad4b10b16f307ff1e4228942ec7`, branch `feat/gel-34-04-page`, ref `origin/history` (`55c8c2a9c`, 3360 records). Data file built to `web/law-data.json` with `--read-on 2026-11-17` (2.2 MB, 1404 entries, not committed; `.gitignore` line added).

Five pieces, one deliverable each, one writer per file, run as parallel Sonnet subagents against a shared contract; I integrated, ran the checks and committed.

| # | Piece | Files | Check that proves it done |
|---|---|---|---|
| 1 | Markup, styles, stylesheet checks | `web/index.html`, `web/style.css`, `tests/web/wcag.py`, `.gitignore` line | `python3 tests/web/wcag.py` exits 0 on 3.13 and 3.11 |
| 2 | Data and dates | `web/data.js`, `web/dates.js` | `GEL.dates.isDate` equals `query._valid_date` on 4.6M candidate strings (same count and sha256) |
| 3 | Answer, interim, find, wiring | `web/answer.js`, `web/interim.js`, `web/find.js`, `web/app.js` | `GEL.classify` on the story's cases against the real data file |
| 4 | Expected values | `tests/web/expected.py` | writes `expected.json`, prints `pairs=625 plain=622 interim=3`, byte-identical on 3.13 and 3.11 |
| 5 | Browser check | `tests/web/check.mjs` | `check.mjs: 66 passed, 0 failed` against Chrome 157 |

## What I did

- Wrote the plan and the contract (every `GEL` name, DOM id and printed text) into this file first, committed it, then started the five subagents. All five finished; none touched git.
- Read their reports and the two files that carry the logic (`answer.js`, `interim.js`). Two edits of mine: the hidden interim sentence is `title: sentence` (the first version put a capital "This" after a comma), and a translation reads "translation", not "translation version", in the hidden sentence.
- The design hook flagged two "cramped padding" findings in `index.html`. The checker could not resolve `calc(var(--unit) * 3)`, so it read the answer panel and the Browse section as having no padding (in a browser both were 24px). I wrote those two paddings as `1.5rem`; the checker is silent now. No ignore added.
- Ran `check.mjs` against real Chrome. First run: 66 passed, 0 failed, 5 s. Then broke `candidate.from <= date` to `<` in a throwaway edit: the run failed 4 checks (AC2, AC3 `differ=622`, AC4, AC8), and I restored the file with `git checkout`. The check is not vacuous.
- Both servers and Chrome were stopped by the script (no listener on 8404 or 9404 afterwards). The Chrome profile folder `~/.cache/gel34-chrome/story-04` is still there; nothing in it must survive.

Commits on the branch: the plan, the page, `expected.py` and `wcag.py`, the padding change, `check.mjs`, then this report and the `DONE:` commit.

## Acceptance criteria

The story has 12 acceptance bullets, not 14 (recounted; the brief says 14). `check.mjs` numbers them in the story's order. Run: `node tests/web/check.mjs --data web/law-data.json --expected ~/.cache/gel34-chrome/story-04/expected.json` (server 8404, Chrome 9404, both free, no fallback).

| AC | Result | Evidence (line from the run) |
|---|---|---|
| 1 example, CSRD on 2025-06-01 | pass | 8 PASS lines: box, date field and echo, every printed text, link `href`/`target`/`rel`, `data-commit` the full 40-character `8d07f20cf` commit; a changed data file (`changed` variant) changes the printed snapshot, read date and notice, so none is typed into the page |
| 2 CSRD dates | pass | `PASS AC2: 8 CSRD dates show the expected commit (2022-12-31 shows the interim panel)`; `expected.py` compared the fixed list with `query.lookup` in its own run (exits 1 on a difference) |
| 3 shared dates | pass | `PASS AC3: pairs=625 plain=622 interim=3 differ=0`; pairs also counted from the page's own `versions` and equal to the expected count |
| 4 interim cases | pass | five PASS lines: CSRD 2022-12-31, the repealed GN id, `ae-dl-11-2024-climate`, `eu-esrs-2023-2772` 2023-12-25, the `copy: "archive"` fixture; no "In force since", no link, no `data-commit` |
| 5 load failure | pass | `missing`, `cut`, `no-read-on` show the sentence with Reload and README links, disabled controls, no panel, notice or "Corpus read"; `slow`: "Loading the law list" at 59 ms and still loading at 1001 ms |
| 6 date values | pass | `2025-06-01` accepted; `10000-01-01` and `275760-09-13` (kept by Chrome in `.value`) refused; `2025-6-1`, `2025-06-01 `, empty refused; hint only after blur. Greps over all `web/*.js`: `Date.parse` 0, `Temporal` 0, `toISOString` 0, `new Date` 1 (`web/dates.js:20`) |
| 7 time zones | pass | Kiritimati default 2026-11-18, Pago_Pago 2026-11-17, each equal to that zone's `toLocaleDateString("sv-SE")` in the page and in Node. Kiritimati equals UTC at this instant; the check requires the two zones to differ, which a UTC default would fail |
| 8 offline | pass | load requested `/ /answer.js /app.js /data.js /dates.js /find.js /interim.js /law-data.json /style.css`; offline: example answers, `pairs=625 plain=622 interim=3 differ=0`, server log gained 0 requests |
| 9 tokens | pass | `wcag.py: ok` (ratios 18.1/16.5, 6.2/5.7, 6.1/5.6, white on green 6.1; ring on a green fill 1.00 with `outline-offset` 2px so the ring sits against the page); tokens once on one `:root`; 0 colour literals outside it; 0 `http` |
| 10 accessibility | partly run | pass: `#answer-sentence` is a polite `role="status"` region with the hidden sentence, noscript line shows with scripts off, Tab then Enter on the example gives the answer, ring on `#example` is 2px, offset 2px, rgb(31, 111, 74). **Lighthouse: not run, by hand later** (needs a download), box left unticked |
| 11 calendar dates | pass | `isDate` agrees with `query._valid_date` on all 103 table rows (every month end of 2023, 2024 and 2100 plus the story's dates); the seven refused dates show the message and no answer |
| 12 layout | pass | 768px: title and lookup bar share the top bar, rail 15rem left of the answer, page within 62rem; 767px: one column in the story's order, date field at least 44px, no sideways scroll; prose within 70ch; no autofocus, first Tab on the law box, no skip link, no sticky element, no dark theme. Also checked at 1400px |

Other results: `wcag.py` and `expected.py` run on Python 3.13 and 3.11 with the same output. `isDate` against Python: grid of years 0000 to 9999, months 00 to 13, days 00 to 32, `3652059` accepted strings, same sha256 on both sides.

## Recounts and differences from the story

- Story says 14 criteria in the brief and has 12 bullets. Story says "the seven CSRD dates" and lists eight (2022-12-31, 2023-01-05, 2025-04-16, 2025-04-17, 2025-06-01, 2026-03-17, 2026-03-18, 2026-11-17); all eight are checked.
- Live counts equal the story's: 625 shared-date pairs, 622 plain, 3 interim (`dz-lf-1992-art117` publication-dated, `eu-batteries-2023-1542` and `eu-esrs-2023-2772` not yet applying), 216 instruments, 47 places, 1404 entries, 3360 records at `origin/history`. The story names 2 `not_yet_applying` pairs; the live run has 2, as listed. I did not recount the 17 `applies_from` entries or the 11 `date_basis` rows; nothing here relies on them.
- Hidden sentence: the story quotes "Directive (EU) 2022/2464, version in force on 2025-06-01: consolidated version, in force since 2025-04-17." The data file has no short name for a law, so the page prints the stored title in full: "Directive (EU) 2022/2464 as regards corporate sustainability reporting (CSRD), version in force on 2025-06-01: consolidated version, in force since 2025-04-17."
- The story says the load requests `index.html`, the stylesheet, "the script" and the data file; with one file per feature there are six scripts, and the check compares the load against the script tags in `index.html`.
- The story says the check serves with `python3 -m http.server`. `check.mjs` serves with `node:http` on port 8404 because the `missing`, `cut`, `no-read-on` and 2-second `slow` variants and the request log need a server that can fake them.
- The story says `:user-invalid` shows the hint. The hint and `aria-invalid` come from script state on blur: a value set by script never matches `:user-invalid`, and Chrome turns an impossible date such as `2025-02-30` into an empty value on assignment. What the reader sees is the same (previous answer kept, hint after leaving the field).
- `#example` and `#date` start `disabled` and are enabled when the data loads, so a failed load leaves them disabled as the story asks. The law box is read-only and stays a tab stop.
- Later than the corpus (date asked after 2026-11-17, the default date today): the pair is shown with no sentence, as the story says; story 06 adds it.

## Seams

Stories 05 to 08 start here.

**Files** (`web/`, plain `<script defer>`, no modules, each one IIFE adding to one `window.GEL`):

| File | Job |
|---|---|
| `data.js` | `GEL.DATA_PATH` (`law-data.json`), `GEL.load()`, `GEL.loadFailed()`, `GEL.data`, `GEL.byId` (`Object.create(null)`: look ids up with `Object.hasOwn(GEL.byId, id)`, never `hasOwnProperty`). Owns `#load-status` |
| `dates.js` | `GEL.dates.isDate`, `.today` (the only `new Date`), `GEL.date`, `GEL.setDate(text)` (true or false; when true and `GEL.chosen` is set it calls `GEL.showAnswer`), `GEL.dateLeft()`, `GEL.initDate()` |
| `interim.js` | `GEL.interim.render({entry, date, reason, data})` fills `#answer-interim`, returns the hidden sentence. Story 06 replaces this file |
| `answer.js` | `GEL.classify(entry, date)`, `GEL.showAnswer(id, date)`, `GEL.onAnswer(fn)` |
| `find.js` | `GEL.EXAMPLE`, `GEL.chosen`, `GEL.choose(id)` (state and box only, no drawing), `GEL.pickExample()`. Story 05 owns it next |
| `app.js` | wiring only, loaded last: `initDate`, the `#date` `input`/`change`/`blur` listeners, the `#example` click, `GEL.load().then(enable, GEL.loadFailed)` |
| `style.css` | tokens (the only `:root`) and base layout. A later story adds its own `<feature>.css`; `wcag.py` reads every `web/*.css` and fails on a second `:root`, a colour literal outside it, or `http` |

**`showAnswer(id, date)`** draws only the panel: it does not set the law box or the date field and does not validate the date. It throws for an unknown id before touching the DOM. It sets on `#answer-panel`: `data-state` (`plain` or `interim`), `data-id`, `data-date`, and `data-commit` (plain only, full 40 characters). It fills the static `data-field` elements (`status`, `title`, `since`, `kind` with `data-kind`, `language`, `codes`, `link`, `asked`, `read`, `snapshot`, `notice`), toggles `hidden` on `#answer-plain`, `#answer-interim` and the status field, updates `#answer-sentence`, then calls every `GEL.onAnswer(fn)` as `fn({entry, date, interval, row, panel})` (`interval` and `row` are null for interim). A hook that throws is logged with `console.error` and the next one still runs.

**`classify`** returns `{kind: "plain", interval, row}` or `{kind: "interim", reason}` with `reason` one of `link-only`, `before-first`, `repealed`, `not-yet-applying`, `date-basis`, `archive-copy`, `other`. The only date comparison is the text test `interval.from <= date`; the row is the `versions` entry whose `commit` equals the interval's `commit`. Swept over every entry on every interval start date (6858 calls): no throw; `other` and `archive-copy` never occur in the real file (`archive-copy` only in the check's fixture).

**Slots in `index.html`** (empty, stable ids): `#match-list` (05, under the law box), `#slot-after-link` (13, inside `#answer-plain` after the link), `#slot-citation` (08, after it), `#rail` (07, an `aside` after `#answer`, 15rem at 48rem and wider), `#browse-by-place` (09, heading "Browse by place" and no content; story 06's link targets this id). The two slots inside the panel sit in `#answer-plain`, which is hidden on an interim answer, so a hook that fills them should check `ctx.panel.dataset.state === "plain"`. One comment-marked block of `<script defer>` tags, one per line; a later story adds its tag above the `app.js` line.

**Hidden sentence.** `#answer-sentence` sits in `#answer`, outside the panel, and is a persistent `role="status"` element (visually hidden); the panel itself is not a live region.

**Run the check** (needs Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, `node` 26, `python3`):
```
python3.13 tools/web_data.py --ref origin/history --read-on 2026-11-17 --out web/law-data.json
python3.13 tests/web/expected.py --ref origin/history --read-on 2026-11-17 --out ~/.cache/gel34-chrome/story-04/expected.json
node tests/web/check.mjs --data web/law-data.json --expected ~/.cache/gel34-chrome/story-04/expected.json
```
Flags: `--port 8404`, `--cdp 9404`, `--profile ~/.cache/gel34-chrome/story-04`, `--chrome`, `--workdir` (default `<profile>/work`, holds `server.log` and the fixture file). A busy port moves to the next free one and prints a `note:` line. `expected.py` takes about 22 s, `check.mjs` about 5 s.

**Add a feature file.** Create `web/<feature>.js` as an IIFE that starts with `const GEL = (window.GEL = window.GEL || {});`, register with `GEL.onAnswer` for anything that follows an answer, add one `<script defer>` line above `app.js`, and add `<feature>.css` with a `<link>` if it needs styles (no colour literals; use the tokens). The story's greps run over every `web/*.js`: no `Date.parse`, `Temporal` or `toISOString`, and no second `new Date`, not even in a comment.

## CI

The `tests` workflow runs `python -m pytest tests -q -rs` only. No workflow names `node` or `check.mjs`; `tests/web/expected.py` and `tests/web/wcag.py` are not `test_*.py`, so pytest does not collect them. The browser check does not run in CI; adding it needs a Chrome on the runner and Varun's yes. I did not edit `.github/workflows`.

## Tests

- `CI=1 python3.13 -m pytest -q` (Python 3.13.12): `451 passed in 899.30s (0:14:59)`.
- `CI=1 ~/.cache/gel34-py311/bin/python -m pytest -q` (Python 3.11.14): `451 passed in 857.59s (0:14:17)`. Both equal the BASE baseline of 451. The two runs shared the laptop, which is why each took about 15 minutes.
- `node tests/web/check.mjs ...` (node v26.10.0, Chrome 157): `check.mjs: 66 passed, 0 failed`; AC10 Lighthouse printed as `NOT RUN`.
- `python3.13 tests/web/wcag.py` and the 3.11 interpreter: `wcag.py: ok`.
- No Python file under `tools/` or `tests/test_*.py` changed, so the pytest result is the baseline's; the new files under `tests/web/` are not collected by pytest.

## Report

**Did.** Built the page in `web/` (six scripts, one stylesheet, `index.html`) and its checks in `tests/web/` (`expected.py`, `check.mjs`, `wcag.py`), one file per feature as the brief set out, with extension points for stories 05 to 08. The example and the plain in-force answer work; every other result shows one interim panel.

**Found.** The checks agree with `query.py` everywhere they look: 625 shared-date pairs, 622 plain, 3 interim, no difference; all eight CSRD dates; the 103-row date table. The check fails when the page is wrong (a one-character change to the date comparison failed four checks). The story has 12 acceptance bullets, not 14, and lists eight CSRD dates where it says seven. The design checker misread `calc(var(--unit) * 3)` as no padding; the real padding was already 24px.

**Left.** Lighthouse on the four states (first screen, a CSRD answer, an interim answer, the load failure): not run, by hand later, box unticked. A real-browser look at the page by a person: I did not view it, only measured it. Chrome only; Safari and Firefox, VoiceOver, forced colours and 200% text are story 11. The browser check does not run in CI. The sentence for a date later than the corpus is story 06.

**Varun must decide.**
1. The hidden screen-reader sentence prints the stored title in full, not the shorter "Directive (EU) 2022/2464" the story quotes. Keep that, or add a short-name field to the data file.
2. The wording of the kind lines for adopted ("Adopted version: the act as first published, with later amendments not merged in.") and translation ("Translation: a translation of the official-language text.") is mine, drawn from `COVERAGE.md` line 288 and `MAINTAINING.md` line 7; only the consolidated sentence comes from the story.
3. The page title, h1 ("Look up a law on a date"), the one plain sentence and the example button text ("Try the example: CSRD on 2025-06-01") are mine.
4. Whether the browser check joins a workflow (needs Chrome on the runner and a path override).
5. `check.mjs` serves with `node:http`, not `python3 -m http.server`, for the failure variants. Say if the story's wording should win.

## Next

Review the page in a browser and run Lighthouse on the four states by hand
Decide the hidden sentence: stored title in full, or add a short-name field
Decide whether the kind wording for adopted and translation stands
Decide whether the browser check joins a workflow
Start stories 05 to 08 from the Seams section
