STATUS: done

# GEL-34 story 05: find a law by typing its name

Base 9053af5afaf06709681459c85b2d7d5e99858d4f. Ref `origin/history` 55c8c2a9c1d8fdbb40fd2d5334ac397b743d76e7. Data file built with `python3.13 tools/web_data.py --ref origin/history --read-on 2026-11-17 --out web/law-data.json` (gitignored).

## Plan

Five pieces, one writer per file. Pieces A to D run as subagents (sonnet) at the same time, each from the contract below and each blind to the others' code, so the node test and the browser check do not take their expected side from the code they test. I integrate, run everything and commit. E is mine.

| Piece | Files | Done when |
|---|---|---|
| A | web/search.js | `node -e "require('./web/search.js')"` loads it; the tests of B pass against it |
| B | tests/web/search.test.mjs | `node --test tests/web/search.test.mjs` prints the four counters and passes |
| C | web/find.js, web/find.css, web/index.html (remove `readonly`, add one `<link>` and two `<script defer>` lines) | `node --check web/find.js`; `python3.13 tests/web/wcag.py` prints `wcag.py: ok`; the browser check of D passes |
| D | tests/web/checks/05-find.mjs | `node --check`; the run of check.mjs prints every 05 check as PASS |
| E | .github/workflows/tests.yml, this report | the step is present; YAML parses |

## Contract

### web/search.js (A)

DOM-free IIFE. It builds `api`; if `typeof window !== "undefined"` it sets `(window.GEL = window.GEL || {}).search = api`; if `typeof module !== "undefined"` it sets `module.exports = api`. No `new Date`, `Date.parse`, `Temporal` or `toISOString`, not even in a comment (a check greps every web/*.js).

`api` has exactly:
- `MAX_ROWS = 8`.
- `fold(text)`: `String(text).toLowerCase().normalize("NFD")`, remove every `\p{M}`, then ł→l ø→o đ→d ð→d ı→i ß→ss æ→ae œ→oe þ→th ə→e, U+2018 and U+2019 to a straight apostrophe, U+2013 and U+2014 to a hyphen. Does not trim.
- `buildIndex(entries, places)`: folds every searchable string once (title, id, citation, each alias; a missing or null citation or `aliases` counts as none), the folded place name `places[entry.place]` (the folded iso2 code when the place has no name), and the folded innermost bracket groups of the title (`/\(([^()]*)\)/g`, group 1, folded, trimmed). Returns an opaque index. Query time folds only the query.
- `query(index, text)` returns `{blank, total, entries, rows, line}`. `q = fold(text).trim()`; `blank` is `q === ""`; blank gives `total 0, entries [], rows [], line ""`. Otherwise `entries` is every entry whose folded title, id, citation or any folded alias contains `q` as a substring, in order; `total = entries.length`; `rows = entries.slice(0, 8)`; `line = countLine(total)`. The entries are the original objects.
- Order: group A first (`q` equals one folded bracket group of the title, or `q` equals one folded, trimmed alias exactly), then group B. Inside a group: place `EU` first, then the folded place name by plain `<` (never `localeCompare`), then id by plain `<`.
- `countLine(total)`: 0 gives `No law matches. Browse by place below.`; 1 gives `1 law matches`; 2 to 8 gives `N laws match`; more than 8 gives `N laws match, showing 8`.

### Page (C): DOM and behaviour

`find.js` keeps `GEL.EXAMPLE`, `GEL.chosen`, `GEL.choose`, `GEL.pickExample` and adds the lookup. `#match-list` (the empty slot under the box) gets two children made by `find.js` when it loads, so the live region exists before it is filled: `<p id="match-count" role="status" hidden></p>` and `<ul id="match-rows"></ul>`. A row is `<li><button type="button" class="match-row" data-id="ID"><span class="match-title">TITLE</span><span class="match-meta"><span class="match-place">PLACE NAME</span> <span class="match-id">ID</span></span></button></li>`. Text goes in with `textContent`, never `innerHTML`. No `role="combobox"`, no `role="listbox"`, no ARIA on the rows, no arrow-key handling.
- Remove `readonly` from `#law` in index.html. Add `<link rel="stylesheet" href="find.css">` after the `style.css` link and `<script defer src="search.js"></script>` on the line before `find.js`. No other line changes.
- The index is built on the first `input` event that finds `GEL.byId` set (from `GEL.data.entries` and `GEL.data.places`), once. With no data loaded, input does nothing.
- On every `input` in `#law`: run `GEL.search.query`; rows are drawn at once (first 8, in order); a blank query closes everything (rows removed, count line emptied and hidden). The count line text is set 500 ms after the last input event (a timer restarted on each key, constant `COUNT_DELAY = 500`); the count line is visible only when it has text. No rows and a non-blank query: the count line reads the no-match sentence (after the 500 ms).
- `GEL.choose(id)` keeps its checks and sets `GEL.chosen` and the box text to the title, and now also closes the list: removes the rows, empties and hides the count line, and cancels the pending timer, so nothing is announced after a choice and the list does not reopen (setting `value` fires no `input` event). It never draws the answer. Listed under Changes to seams.
- A row click (Enter or Space on a focused row is a native click): `GEL.choose(id)`, then `#law`.focus(), then `GEL.showAnswer(id, GEL.date)`.
- Enter in `#law` (keydown, preventDefault) while the list is open: with rows, the same as a click on row 1; with no rows, if `typeof GEL.showNoMatch === "function"` call `GEL.showNoMatch(trimmed box text, GEL.date)`, and choose nothing; the no-match line stays. With the list closed (blank box, or after a choice), Enter does nothing.
- Editing the box after a choice reopens the list from the new text; `GEL.chosen` and the answer stay until another law is chosen.
- find.css: custom properties of style.css only, no colour literal, no `:root`, no `http`; rem units; rows at least 2.5rem high with no fixed height, no line clamp, no overflow clipping (`overflow-wrap: anywhere`); title in the page font, place name and id in `var(--mono)` at 0.875rem; count line 0.875rem in `var(--text)`; no animation.

### Node test (B): tests/web/search.test.mjs

`node:test` and `node:assert/strict`, ES module, loads `../../web/search.js` with `createRequire`. Data: `process.env.LAW_DATA` if set; else `web/law-data.json` if it exists; else it builds it with `<PYTHON or python3> tools/web_data.py --ref origin/history --read-on 2026-11-17 --out <os.tmpdir() subfolder>` (run from the repo root, `spawnSync`) and fails with the command's output if that fails. Its expected side is written in the test (the 12 CSRD ids from the story, the query table, its own plain-NFD control and its own brute-force count), never taken from search.js. It prints `found_by_id`, `found_by_title`, `max_matches`, `outside_row_8` and the node version.

### Browser check (D): tests/web/checks/05-find.mjs

`export async function run(h)` as in check-extension.md, tags `"05"` and `"05-<name>"`. Drives the DOM contract above. Covers: CSRD typed once (8 rows, the first 8 of the story's 12 ids in order, count line `12 laws match, showing 8`, EU directive row 1); the count text for fixtures of 23, 8, 1, 0 matches and a blank box (variant made with `h.addVariant`); Enter chooses row 1 (title in box, answer panel `data-id`, list closed, focus on `#law`, count line empty, list still closed 700 ms later); Tab through each row then to `#date`; Enter and Space on a row; zero results: Enter chooses nothing and calls a stub `GEL.showNoMatch` once with the typed text and `GEL.date`; count line changes once, 500 ms after the last key, nothing changes after a choice; the 485-character title (lu-sfdr-law-2022) unclipped at 320 px and at 200% text; the five ECCB rows told apart by place name; entry without `aliases` (and a fixture whose only mention of "cbam" is an alias) does not throw; 0 requests while typing (resource timing entries before and after); an accented query (`przeciwdzialaniu`); no combobox or listbox role and no `readonly` on `#law`.

## What was done

An earlier run of this story built pieces A to D and committed them (1f66e9fa0 search module, node test and CI step; fbed9ac9b match list; 8a0b81165 browser check). Its window closed before the gates, so this run checked that the disk matched the plan, ran every gate, ran mutation checks, wrote the results and committed. No code file was changed in this run.

Decisions worth knowing (the code differs from the contract above in two places, and the code wins):

- `web/search.js` is an IIFE that sets `GEL.search` when `window` exists and `module.exports` when `module` exists. The page loads it as a plain `<script defer>`, because Chrome blocks module loading from `file://`. `node --test` loads it with `createRequire`.
- The count line `#match-count` is unhidden but empty the moment rows are drawn, and its text arrives 500 ms after the last key. The contract said "visible only when it has text". It was done so the live region is in the page before it is filled and row 1 does not move when the text fills in (check `05-csrd-count` reads row 1's top before and after). A blank box and a closed list still hide it (`05-blank`, `05-enter`).
- The story says the count line sits in "the page's one `role=status` region". The page already has two (`#load-status`, `#answer-sentence`), so the count line is a third. Not changed.

## Gates (run 2026-11-18, Node v26.10.0, data from `origin/history` 55c8c2a9c1d8fdbb40fd2d5334ac397b743d76e7, read-on 2026-11-17)

```
web_data.py        -> web/law-data.json (gitignored, not committed)
expected.py        -> expected: pairs=625 plain=622 interim=3 instruments=216 places=47 csrd=8 date_table=103
node --test tests/web/search.test.mjs
                   -> found_by_id=1404 found_by_title=1404 max_matches=5 (id 5, title 5) outside_row_8=0 entries=1404 node=v26.10.0
                   -> ℹ tests 13 / ℹ pass 13 / ℹ fail 0
check.mjs          -> check.mjs: 105 passed, 1 failed   (run twice, the same both times: 05 checks 32 of 32 PASS)
wcag.py            -> wcag.py: ok
check_corpus.py    -> 3360 records checked
pytest             -> not run (the task for this run said do not run pytest; no Python file changed)
```

The one failing check is story 04's AC8, known to fail for any story that links its own stylesheet:

```
  load requested: / /answer.js /app.js /data.js /dates.js /find.css /find.js /interim.js /law-data.json /search.js /style.css
FAIL AC8: the load requested only index.html, the stylesheet, one request per script and the data file | observed: want / /answer.js /app.js /data.js /dates.js /find.js /interim.js /law-data.json /search.js /style.css
```

The only difference between the two lists is `/find.css`. Story 04's AC5 (500 ms) passed both times (`PASS AC5: slow: "Loading the law list" at 21 ms (limit 500)`), so no timing rerun was needed. The node test also passes when `web/law-data.json` is absent (it builds the file with `tools/web_data.py` into `os.tmpdir()`), which is what CI will do.

## Mutation checks

Each edit was made in place, the checks run, and the file restored with `git checkout`. The tree was clean afterwards. Every edit made at least one check fail:

| Edit | Checks that failed |
|---|---|
| search: group A for any bracket text that contains the query | node `AC1` (CSRD order), `order` |
| search: plain NFD, ten letters not folded | node `fold`, `match covers ...`, `AC3` (query list and plain-NFD control) |
| search: one match reads "1 laws match" | node `AC5` |
| search: place order by iso2 code, not by place name | node `order`, `an entry whose place has no name ...` |
| search: rows not capped at 8 | node `AC1`, `order`, `AC5` |
| search: alias left out of the searched strings | node `AC2` (alias only), `order`, `match covers ...` |
| page: count line written with no 500 ms delay | `05-csrd-count`, `05-debounce` |
| page: `GEL.choose` leaves the list open | `05-enter`, `05-enter-quiet`, `05-closed-enter`, `05-reopen`, `05-row-enter`, `05-row-space`, `05-row-click` |
| page: Enter in the box does nothing | `05-enter`, `05-enter-quiet`, `05-closed-enter`, `05-reopen`, `05-nomatch-enter`, `05-nomatch-line`, `05-nomatch-no-hook` |
| page: row drops the place name | `05-csrd`, `05-csrd-rows`, `05-eccb` |
| page: row title set with `innerHTML` | `05-textcontent` |
| page: a row click does not return focus to the box | `05-row-enter`, `05-row-space`, `05-row-click` |
| css: fixed row height with `overflow: hidden` | `05-long-title-320`, `05-long-title-200` |

Not testable here: a place sort by `localeCompare` passes in Node under an English locale, so no check can fail it; the module uses plain `<`.

## Acceptance criteria

1. CSRD gives the 12 ids in order, "12 laws match, showing 8", EU directive in row 1. Result: pass. Node `AC1: CSRD on the real file gives the story's 12 ids in order and the 8-row line`; browser `05-csrd`, `05-csrd-rows`, `05-csrd-count`, all PASS. Live recount: 12 matches, same ids and order as the story, so no change to state. The data now has 45 entries with `aliases` (the story read none); the only CSRD alias is on eu-csrd-2022-2464, which already matched.
2. CBAM puts eu-cbam-2023-956 in row 1, and an alias-only fixture is found. Result: pass. Node `AC2: CBAM on the real file ...` and `AC2: an entry found only through its alias ...`; browser `05-cbam`, `05-alias`. Live: 4 matches (eu-cbam-2023-956, mt-cbam-implementing-regs, rs-cbam-tax-act, rs-cbam-tax-act-amend-2026); eu-cbam-2023-956 is the only entry whose `aliases` hold CBAM, and it is row 1 as an exact alias in group A. The other three still match by id only.
3. Fold: three spellings of `loi du 2 decembre 2024` return be-loi-2024-12-02-csrd, each named query returns its entry, plain NFD fails the ten letters. Result: pass. Node `AC3: the three loi du 2 decembre 2024 spellings ...`, `AC3: each query of the story's list ...`, `fold: the ten table letters ...`; browser `05-accent` (przeciwdzialaniu finds pl-unfair-practices-act).
4. All 1404 ids and titles are found within 8 rows with the true count. Result: pass. Node `AC4: every full id, then every full title ...`, printing `found_by_id=1404 found_by_title=1404 max_matches=5 outside_row_8=0` (the story's 2026-11-17 figures: 1404, 1404, 5, 0). Live corpus: 1404 entries, 226 places with entries.
5. Count text for 23, 8, 1, 0 and a blank box. Result: pass. Node `AC5: the count line for 23, 8, 1 and 0 matches, and a blank query`; browser `05-count-23`, `05-count-8`, `05-count-1`, `05-count-0`, `05-blank`.
6. Enter chooses row 1, Tab visits each row then the date field, Enter and Space on a row choose it, the list stays closed, zero results chooses nothing. Result: pass. Browser `05-enter`, `05-enter-quiet`, `05-closed-enter`, `05-reopen`, `05-tab`, `05-row-enter`, `05-row-space`, `05-row-click`, `05-nomatch-enter`, `05-nomatch-line`, `05-nomatch-no-hook`. The no-match answer itself is story 6's; here `GEL.showNoMatch` is a stub in the check file.
7. `csrd` typed fast changes the count line once, 500 ms after the last key; VoiceOver with Safari. Result: the timing half passes (`05-debounce`: written once, not before 500 ms, nothing after; `05-row-click` and `05-enter-quiet`: nothing announced after a choice). VoiceOver with Safari: not run, by hand later.
8. Lighthouse accessibility, and the 485-character title wraps at 320 px and at 200% text. Result: wrap passes (`05-long-title-320`, `05-long-title-200`); `wcag.py: ok`. Lighthouse: not run, by hand later (it needs a download).
9. An entry without `aliases` does not throw, and typing makes 0 requests. Result: pass. Node `AC9: an entry without aliases or with null citation does not throw ...`; browser `05-null-fields`, `05-no-requests`, and story 04's `AC8: the server log gained 0 requests at lookup time`.
10. `tests.yml` runs `node --test` and is green for both Python entries. Result: not checkable from here, nothing is pushed. The step is in the file (`Search module tests (node --test, the runner's own Node)`, prints `node --version` first) and the file parses as YAML. Node on this Mac is v26.10.0; the runner's version is unknown until the first run.

## Open

- Story 04's AC8 fails (raw lines above) because the page now links `find.css`. Fixing it means adding `/find.css` to `want` in `tests/web/check.mjs`, which one agent owns; the coordinator or that owner does it at merge. Every story that adds a stylesheet needs the same line.
- VoiceOver with Safari (criterion 7) and Lighthouse (criterion 8): not run, by hand later. NVDA and JAWS not tested.
- The green Actions run for both Python entries (criterion 10): after the first push.
- The count line is a third `role=status` element, against the story's "one region" (see above).

## What Varun must decide

Nothing blocks this story. If one status region matters, the count line, `#load-status` and `#answer-sentence` would have to share one element, which touches story 04's files.

## Changes to seams

- `GEL.choose(id)` now also closes the list (rows removed, count line emptied and hidden, pending timer cancelled). It still never draws the answer; the row click and Enter call `GEL.choose`, then focus `#law`, then `GEL.showAnswer(id, GEL.date)`.
- `web/index.html`: `readonly` removed from `#law`; `<link rel="stylesheet" href="find.css">` after `style.css`; `<script defer src="search.js">` before `find.js`.
- `GEL.search` (`MAX_ROWS`, `fold`, `buildIndex`, `query`, `countLine`) is available to later stories.
- Story 6 defines `GEL.showNoMatch(text, date)`. Enter with no rows calls it when it exists; the list line "No law matches. Browse by place below." stays. The integration run after the merge must cover: typing a no-match text, Enter, the real answer from story 6 shown while the line stays.
- `tests/web/check.mjs` needs `/find.css` in the AC8 `want` list (see Open).

## Report

Story 05 is built and verified here: 13 of 13 node tests pass and 32 of 32 browser checks of story 05 pass. The full run reads `check.mjs: 105 passed, 1 failed`; the failure is story 04's AC8, caused by the new stylesheet. `wcag.py: ok`, `check_corpus.py` 3360 records. Thirteen planted bugs were each caught. VoiceOver, Lighthouse and the green Actions run are still open.

## Next

- Add /find.css to the AC8 want list in tests/web/check.mjs at merge
- Run VoiceOver with Safari on csrd typed fast and a row chosen
- Run Lighthouse accessibility on the results and no-match states
- Push the branch when the GitHub hold lifts and read the Actions run
- Remove this report file before merging
