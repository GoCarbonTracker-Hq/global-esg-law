STATUS: done

# GEL-34 story 07: the versions rail

## Plan

Two pieces, independent once the contract below is fixed. One writer per file.

| Piece | Deliverable | Files | Done when |
|---|---|---|---|
| A | The rail: draws into #rail from GEL.onAnswer, updates in place, window rule, labels | web/rail.js, web/rail.css, one <script defer> line and one <link> line in web/index.html | node --check passes; python3.13 tests/web/wcag.py prints "wcag.py: ok"; page loads with no console error; piece B's checks pass against it |
| B | The browser checks for the nine acceptance criteria and their fixtures | tests/web/checks/07-rail.mjs | node --check passes; check.mjs runs it with every check passing against piece A |

Integration, recounts, the full check.mjs run, wcag.py, pytest and the report are mine (not split).
Subagents: model sonnet, started together. They write files only; I run the checks and commit.

## Recounts (data file built from origin/history 55c8c2a9c, --read-on 2026-11-17, 2026-11-18)

851 instruments with rows, 3360 rows, 493 with one row, 358 with two or more, 553 link-only, 81 with more than 7 rows,
216 with a shared date, 635 without, 2139 (instrument, row date) pairs for the 358, 21 repeal rows in 17 instruments,
11 rows with date_basis, kz-advertising-law 150 rows, mt-climate-action-act-2015 8, ch-klg 7, fi-paastokauppalaki-2011 20.
All equal the story. One thing the story does not say: in 14 EU instruments an interval's from is later than the in_force
of the row it names (the not_yet_applying pairs: one interval from the row's own date with not_yet_applying, a second from
applies_from naming the same commit). The rail takes the anchor date from the named row's in_force, never from interval.from.

## Contract (both pieces)

### Page API (web/rail.js, one IIFE, starts with const GEL = (window.GEL = window.GEL || {});)
- GEL.rail.order(entry, commit) -> new array of the entry's version rows, newest first (stable sort on in_force as TEXT, descending); on a shared date the row whose commit equals `commit` comes first, the rest keep data-file order. `commit` may be null.
- GEL.rail.window(rows, commit) -> [start, end) (end exclusive, 7 rows) over the array order() returned. rows.length <= 7: [0, rows.length]. Else: anchor group = the rows sharing the in_force of the row whose commit equals `commit`; with no such row, the group of the last (oldest) row. a = index of its first row, k = its size, N = rows.length, start = min(max(a - floor((7 - k) / 2), 0), N - 7), return [start, start + 7].
- Registers one GEL.onAnswer hook. No other global.

### DOM drawn into the existing <aside id="rail"> (never touch anything else in index.html)
- No versions on the entry (link only): #rail is emptied, nothing drawn.
- Exactly one row: #rail holds one <p class="rail-only">Only stored version: DATE, KIND</p>, KIND followed by ", in-force date not recorded" when that row has date_basis. No heading, no <ol>, no aria-labelledby on #rail.
- Two or more rows: #rail gets aria-labelledby="rail-heading" and holds
  <h2 id="rail-heading">Versions of this law</h2>
  <ol class="rail-list" id="rail-window"> li ... </ol>      (all N rows when N <= 7, else the 7 of window())
  and when N > 7 also
  <details class="rail-all"><summary>Show all N versions</summary><ol class="rail-list" id="rail-all"> N li </ol></details>
  N is the number of rows (never of dates). The details is closed when a law is first drawn and its open state is not touched afterwards.
- Each li: data-commit (the full 40 characters), data-date (the row's in_force), class "rail-current" on the current row (in both lists), and one control child with class "rail-row": a <button type="button"> for a row that has an in_force date, a <span> for a row with date_basis (plain text, no button). The control holds these spans in this order, with a single space text node between neighbours: .rail-date (the in_force text, monospace), .rail-kind (the kind word: adopted, consolidated, translation or repeal), .rail-lang (the language code, present only when two or more rows of the entry share this row's in_force), .rail-label (the label text, element present always, attribute hidden set and textContent "" when there is no label).
- aria-current="true" sits on the <button> of the current row in #rail-window (or in the only list when N <= 7), and nowhere else, so document.querySelectorAll("#rail [aria-current]").length is 0 or 1 at all times, details open or closed. The current row in #rail-all has class rail-current and its label but no aria-current. A date_basis row never gets aria-current, rail-current or a button.
- Choosing a row (click, or Enter on the focused button): GEL.setDate(row.in_force). Nothing else; the page redraws through the hook.

### Which row is current
current = the row whose commit equals the covering interval's commit (detail.interval.commit from GEL.onAnswer). Never a date comparison. No interval, or no row with that commit: no current row.
A date_basis row can be the named row (dz-lf-1992-art117) but is never marked current: it gets the label below and no aria-current / rail-current.

### Labels (exact strings), D = the date asked (detail.date), X = row.in_force, "shared" = two or more rows of the entry have X
Work through the ordered rows (newest first). a, k = anchor group start and size when a named row exists (the named row = the row with the interval's commit; the group = rows with the same in_force). Rows with index < a are newer than the named row; rows in [a, a+k) share its date; rows with index >= a+k are older. With no named row every row counts as newer.
1. date_basis row: "in-force date not recorded", plus ", shown" when it is the named row and shared, ", not shown" when it is not the named row and shared. Never "in force". (This rule wins over the others.)
2. Named row, interval.state "repealed": "repealed on X", plus ", shown" when shared.
3. Named row otherwise: "in force on D", plus ", shown" when shared.
4. Newer than the named row (index < a) and X > D (text compare of YYYY-MM-DD): "later than the date asked".
5. Newer than the named row and not later (no live case, fixtures only): "not shown".
6. Same date as the named row, not the named row: "same date, not shown".
7. Older than the named row: no label.
Which rows are current for aria-current: the named row of rules 2 and 3 only.

### Updating in place
- The rail is rebuilt (replaceChildren on #rail) only when the entry changes (compare the entry object) or its row count class changes (none / one / many). For the same entry every answer repaints the existing li nodes: class, aria-current, label text, and the order of the li within each list.
- A node is never removed and re-created for a row that stays in the list, so a focused button keeps focus when the user chooses it. When the order inside a list must change (the named row moves first inside its date group, or the window shifts), move only the nodes that must move, with parent.moveBefore(node, ref) when it exists and the node is already a child of that parent, else parent.insertBefore. Remove the nodes that leave the window, add the nodes that enter it; the window list builds its li nodes once per row and entry (a Map keyed by commit), and so does the all-list.
- The page applies no date rules and creates no Date object: the only date comparisons are the text sort and the text X > D, and the page already has GEL.coveringInterval for the interval. No Date.parse, Temporal, toISOString, no "new Date" anywhere in web/rail.js, not even in a comment.

### Styles (web/rail.css)
Custom properties of style.css only (--link, --panel, --divider, --page, --text, --secondary, --mono, --unit). No colour literal, no named colour, no "transparent", no "http", no :root. The ol has no bullets. Row min-height 2.75rem. The current li has a 4px solid border-left in var(--link) and background var(--panel); other li have a 4px solid border-left in var(--page). Dividers 1px solid var(--divider) under each li. The button fills the row (border 0, background none, left aligned, text colour inherited), shows a hover background in var(--panel), and keeps the global focus ring. The date is in var(--mono). The label sits on its own line below the date and kind line, in var(--secondary) at 0.875rem; it must still read in forced colours (no colour-only meaning). The summary has min-height 2.75rem and a pointer cursor. A date_basis row is plain text with the same padding.

### index.html
Add <script defer src="rail.js"></script> between the answer.js and find.js lines (so it sits above app.js and does not touch the line other windows add just above app.js) and <link rel="stylesheet" href="rail.css"> on a new line directly after the <link rel="icon"> line. No other edit.

## What I did

The first run (stopped when its window closed) wrote web/rail.js, web/rail.css, tests/web/checks/07-rail.mjs and the two lines in web/index.html. This run found them on disk, committed them unchanged as `397ff48b8` ("wip: story 07 files from the stopped run"), then only ran the gates. I changed no file of the story: the checks passed on the files as found. The integration was a single task (no independent pieces left), so I did it in my own session and started no subagent.

Mutation check (not committed): I changed the current-row test in rail.js from `i === named` to a date comparison, ran check.mjs, and got `check.mjs: 99 passed, 10 failed` with 07-AC2, AC3 (differ=627), AC4, AC5 and AC8 failing. So the checks do catch the by-date bug the story warns about. rail.js was restored with `git checkout` and the final run below is on the restored file.

Fixtures: the commit hook flagged the three invented entries in 07-rail.mjs (07-fixture-unnamed, 07-fixture-mixed, 07-fixture-move; made-up commits and dates, injected into copies of the data file with h.addVariant, the same pattern 00-seams.mjs uses). I kept them. The story asks for them by name (AC4: "a fixture row unnamed on its own date", AC6: "a fixture mixing a publication-dated row with dated rows") and counts 0 live cases for both, so no real instrument can stand in. Real-instrument cases are used everywhere a live one exists.

## Gate output (raw lines, 2026-11-18)

- `python3.13 tools/web_data.py --ref origin/history --read-on 2026-11-17 --out web/law-data.json` exit 0 (file is gitignored, not committed).
- `python3.13 tests/web/expected.py ...`: `expected: pairs=625 plain=622 interim=3 instruments=216 places=47 csrd=8 date_table=103`
- `node tests/web/check.mjs ...` run 1: `check.mjs: 108 passed, 1 failed`; final run on the restored tree: `check.mjs: 108 passed, 1 failed`. 109 checks = 74 on BASE + 35 of story 07. All 35 `07-AC*` lines PASS.
- `python3.13 tests/web/wcag.py`: `wcag.py: ok`
- `python3.13 tools/check_corpus.py | tail -2`: `3360 records checked`
- AC5 timing of story 04, both runs: `PASS AC5: slow: "Loading the law list" at 91 ms (limit 500)` and `... at 34 ms (limit 500)`. No rerun needed.
- pytest: not run, as the dispatch said (no Python file changed).
- Chrome and the server on ports 9407 and 8407 are stopped (no process left).

The one failing line, known and not fixed (the story 04 check lists only index.html, style.css, the scripts and the data file, and rail.js brings its own rail.css):
`load requested: / /answer.js /app.js /data.js /dates.js /find.js /interim.js /law-data.json /rail.css /rail.js /style.css`
`FAIL AC8: the load requested only index.html, the stylesheet, one request per script and the data file | observed: want / /answer.js /app.js /data.js /dates.js /find.js /interim.js /law-data.json /rail.js /style.css`

## Acceptance criteria

1. AC1, counts. PASS 07-AC1 x3: ch-klg 7 rows, 7 li, no details; mt-climate-action-act-2015 8 rows, 7 li, "Show all 8 versions", 8 li once opened; kz-advertising-law 150 rows, 7 li, "Show all 150 versions", 150 li once opened. Plus `PASS 07-AC1: all 81 instruments with more than 7 rows: summary reads Show all <rows> versions, <rows> li in #rail-all, newest first by in_force text`.
2. AC2, window. PASS 07-AC2: `GEL.rail.order and GEL.rail.window on fi-paastokauppalaki-2011 (20 rows): the four windows are the literal lists on 2018-06-01, 2024-06-01, 2010-01-01 and 2016-01-01` (rows 12 to 18, 0 to 6, 13 to 19, 13 to 19), a unit run on made-up rows (edge cases), and the same four dates read in Chrome (four `rendered #rail-window on <date> shows the same seven rows` lines).
3. AC3, one aria-current per pair. PASS 07-AC3 file order: `pairs=2139 differ=0; expected.json shared-date pairs 622 differ=0; ch-klg on 2025-06-01 marks consolidated de, six rows same date, not shown`; PASS 07-AC3 reversed: `pairs=2139 differ=0` with the same trailing text. The mutation run printed `differ=627`, so the sweep can fail.
4. AC4, partners. PASS 07-AC4 for br-cvm-res-59-2021 on 2023-01-02, bt-environmental-assessment-act-2000 on 2000-07-14, at-uwg-s1-2a on 2022-08-01 (shown row, partners "same date, not shown" with language codes), and two fixture lines for 07-fixture-unnamed: "not shown" on 2026-11-17 and "later than the date asked" on 2026-06-01.
5. AC5, not yet / repealed. PASS 07-AC5 x3: fi-paastokauppalaki-2011 on 2010-01-01 (no aria-current, all 20 rows "later than the date asked"); kg-ghg-emission-law-71 on 2026-11-17 (repeal row "later than the date asked", consolidated ky "in force on 2026-11-17, shown"); fi-paastokauppalaki-2011 on 2024-06-01 (named repeal row "repealed on 2024-01-01, shown", pair "same date, not shown", no "in force on").
6. AC6, publication-dated rows. PASS 07-AC6 x4: dz-lf-1992-art117 (both rows text, no button, "in-force date not recorded, shown" / ", not shown", no aria-current), the same entry on 1990-01-01 (no named row, both ", not shown"), ni-ley-217 (`Only stored version: 1996-06-06, adopted, in-force date not recorded`, no ol), fixture 07-fixture-mixed (the publication-dated row sits at its date as text).
7. AC7, one row and none. PASS 07-AC7 x5: cg-decret-2022-1923 `Only stored version: 2023-01-05, adopted` and no ol (asked on 2026-11-17 and on 2022-01-01); ae-dl-11-2024-climate has an empty #rail; bt-environmental-assessment-act-2000 an ol with 2 li; ch-klg an ol with 7 li.
8. AC8, choosing a row. PASS 07-AC8: `activeElement same=true, aria-current 1->1` for a Tab then Enter, a mouse click, Enter on a row inside the opened details, a "same date, not shown" partner, and a node move (fixture 07-fixture-move: the named row moves ahead of its partner without being re-created); the date field, echo and answer take the row's in_force.
9. AC9, NFR1 and UX8. PASS 07-AC9 x5: rail is an ol (no ul); every li at least 40px tall on ch-klg, kz-advertising-law (details open), fi-paastokauppalaki-2011 and dz-lf-1992-art117; forced-colours emulation keeps the solid left border and the text label on the current row; tab order on kz-advertising-law is first row button, six Tabs to the 7th, one more to the "Show all 150 versions" summary; greps over web/ find no hex colour outside the one :root block, none in rail.css or rail.js, no http in rail.css, `new Date` once (dates.js), no Date.parse, Temporal or toISOString. Lighthouse accessibility audit on a 1-row, a 7-row and a 150-row state: not run, by hand later. VoiceOver: not run, by hand later.

## Recounts and differences from the story

See the recounts block above (read 2026-11-18, all equal the story). Differences:
- 14 EU instruments have an interval whose `from` is later than the `in_force` of the row it names (the not_yet_applying pairs). The rail takes its anchor from the named row's in_force, never from `interval.from`; 8 of the 14 have two or more rows, so they are in the 2139-pair sweep (differ=0); the other 6 have one row and get the one-row line.
- The story names a Lighthouse audit and VoiceOver; neither can run here (Lighthouse needs a download). Left unticked.
- pytest is not run: the dispatch for this finishing run said so, and no Python file changed. The original brief asked for one `-k "not all_pairs"` run; the coordinator's full suite covers it.

## What is left

- Lighthouse accessibility on a 1-row, a 7-row and a 150-row state, and a VoiceOver pass: Varun, by hand later.
- After the five branches merge: rerun check.mjs once. The interim wording for "in-force date not recorded" and "not yet applying" answers belongs to story 06; the rail reads only `interval` and `row.commit`, so the 07-AC5 and 07-AC6 lines must still pass with story 06 on the base.

## What Varun must decide

- Publication-dated rows are placed by date (the story's flagged question: by date or at the end). Implemented by date. No live entry mixes such a row with dated ones, so the live page cannot show the difference.

## Changes to seams

- New global: `GEL.rail = { order, window }` (used by the check). One `GEL.onAnswer` hook. No other global.
- web/index.html: `<link rel="stylesheet" href="rail.css">` directly after the icon link; `<script defer src="rail.js"></script>` between answer.js and find.js.
- Story 04 AC8 (check.mjs line 646) allows only `/style.css`; any story that adds a stylesheet fails it (this one: `/rail.css`). The owner of check.mjs should build `want` from the `<link rel="stylesheet">` lines of index.html, as it already does for scripts. I did not edit check.mjs.
- The rail never reads `state` or `reason` of the answer, only `interval`, so story 06 can change the answer wording freely.

## Report

Story 07 is done: 35 new browser checks pass, 108 of 109 checks pass in all, the one failure is the known AC8 stylesheet line, wcag.py reads ok and the corpus has 3360 records. The files from the stopped run needed no change. Mutation run (current row by date) fails 10 checks, so the checks do catch that bug.

## Next

- Run check.mjs once after the five branches merge and read the 07-AC5 and AC6 lines.
- Make story 04 AC8 build its stylesheet list from index.html.
- Run Lighthouse on a 1-row, a 7-row and a 150-row state by hand.
- Run a VoiceOver pass on the rail by hand.
- Decide whether date-basis rows stay placed by date.
