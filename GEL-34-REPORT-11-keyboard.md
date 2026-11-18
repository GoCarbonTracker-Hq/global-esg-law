STATUS: done

# GEL-34 story 11, unit 11-keyboard: R22, the keyboard-only journeys in Chrome

Branch `feat/gel-34-11-keyboard`, BASE `4a2da624bf8c2228e944a53a4a8d49371597582f`, corpus `origin/history` (55c8c2a9c, 3360 records), read on 2026-11-17. Chrome 157.0.8103.79, headless (`--headless=new`), clean profile. Run 2026-11-18.

## Plan

One new file, `tests/web/checks/11-keyboard.mjs` (tags start with `11k`). It drives UX journeys 1 and 2 with CDP key events only (Tab, Shift+Tab, Enter, Space, ArrowUp/Down, Backspace, typed characters): no click, no `focus()` call, no value set. The expected order is the UX spec's list, not the page's own tab order read back. Proof it can fail: 28 mutants of a scratch copy of `web/` and the unchanged page (below). Update of 2026-11-18: Varun accepted the last-match-row-to-date-field move as a recorded trade-off, so `11k-visual-wide` now allows exactly that move and the spec's answer-to-rail move, and still fails on any other backward move or when the date field stops following the last match row.

## What the check does

Journey 1 (spec "1. The lead user's lookup"), typed route at 1280 x 900: Tab to the law box, type CSRD, Tab down the 8 match rows to the date field, Shift+Tab back to row 1, Enter on it, Tab to the date field, type 2025-06-01 (the order of the field's segments is learned from the field by ArrowUp/ArrowDown on the first segment: here day-month-year, because Chrome takes the Mac's region), Tab to the example, the answer's link, Copy citation (Space), the rail rows (Space on the second, Enter on the third), the three footer links, and the Tab after the last. Example route: Tab to the example, Enter.

Journey 2 (spec "2. The corpus cannot answer"), four fresh pages, each by keys: link only (`ae-dl-11-2024-climate`, 2025-06-01), before the first version (CSRD, 2022-12-31, then Enter on the "Show 2023-01-05" offer), repealed (`gn-arrete-2022-1646-evaluations-environnementales`, 2024-01-01), no match ("Sarbanes-Oxley", Enter in the law box, then Enter on the "Browse by place" link).

Whole-page order walk, at 1280 and at 390 px: the list open over an answer with a long rail (`kz-advertising-law`, chosen with Space, list reopened with Backspace), Tab from the law box to the end; at 1280 also Enter on "Show all 150 versions", Tab through all 150 rows to the footer, Shift+Tab all the way back, Space on the summary on the way.

Measured at each stop: which element has focus; `:focus-visible`; outline style not none and width above 0; the box lies in the window; the role order against the spec list; page-coordinate jump between consecutive stops; that no key press leaves focus where it was. Spec lines used: "Keyboard" (UX spec lines 938 to 946), step 13 item 2 (line 977), journeys 1 and 2 (lines 517 to 560), the rail trade-off (lines 945 to 949). Stories used: 06 (offer button, no-match link, V1 to V5 wording), 07 (rail window of 7, newest first), 10 (three footer links, last), 11 AC2.

## Results (run of the recipe)

Step 1 and 2 (data, expected files):
```
not plain: date-basis=1 not-yet-applying=2
expected: pairs=625 plain=622 interim=3 instruments=216 places=47 csrd=8 date_table=103
cite_expected: cases=14 link_only=553 snapshot=55c8c2a9c
```
Step 3, `node tests/web/check.mjs ... --port 8520 --cdp 9520`, run once after the change of 2026-11-18 (full output in `~/.cache/gel34-chrome/11-keyboard/check-full-2.txt`; the first run before the change, with the then-failing `11k-visual-wide`, is in `check-full-1.txt`: 424 passed, 1 failed):
```
check.mjs: 425 passed, 0 failed
```
That is the BASE 393 plus my 32 checks, all passing. The 32 check lines of my file and its notes, verbatim from that run (lines of other files left out):
```
PASS 11k-j1-load: a fresh page has nothing focused (no autofocus, UX spec) and the answer panel is hidden
PASS 11k-j1-list: typing CSRD opens the list: 8 rows (at most 8), the first is eu-csrd-2022-2464, count line "12 laws match, showing 8"
PASS 11k-j1-list-order: the 8 match rows are reached top to bottom (tops 133, 224, 338, 500, 638, 776, 890, 1004)
  note: last match row -> date field: match -> date (input#date ""): up 952px, right 416.7px
PASS 11k-j1-pick: Enter on the first match row closes the list and focus returns to the law box (input#law ""); the law box holds the title and the answer shows
PASS 11k-j1-date: the date typed with the keys (field order day-month-year) reads 2025-06-01 and the answer follows, in force since 2025-04-17
PASS 11k-j1-copy: Space on Copy citation puts the displayed line on the clipboard, shows "Copied", and focus stays on the button (button#citation-copy "Copy citation")
PASS 11k-j1-copy: after 2 s the confirmation is gone and focus is still on Copy citation
PASS 11k-j1-rail-order: the rail rows come top to bottom, newest first (2026-03-18, 2025-04-17, 2023-01-05), and lie to the left of the answer (rail left 172px, Copy citation left 464px)
  note: answer to rail: Copy citation (left 464, top 544) -> first rail row (left 172, top 242): copy -> rail (button "2026-03-18 consolidated late"): up 302px, left 292px; scrollY 0 -> 0. Whether that disorients is for Varun.
  note: rail row 2025-04-17 by Space: scrollY 0 -> 0, row top 305 -> 305, answer top 214 -> 214; focus stays on the same button true
PASS 11k-j1-rail-pick: Space on the rail row 2025-04-17: the date becomes 2025-04-17, the selected row moves to it, and focus stays on the same button node
  note: rail row 2023-01-05 by Enter: scrollY 0 -> 0, row top 368 -> 368, answer top 214 -> 214; focus stays on the same button true
PASS 11k-j1-rail-pick: Enter on the rail row 2023-01-05: the date becomes 2023-01-05, the selected row moves to it, and focus stays on the same button node
PASS 11k-j1-footer: after the rail come the 3 footer links (Browse by place holds no stop) and the Tab after the last goes to the law box
PASS 11k-j1-focus: every stop of journey 1 (31) shows an outline and lies in the window (the calendar-picker stop is judged by eye)
PASS 11k-j1-steps: journey 1 by keys lands on the role each step names (see the trace lines)
PASS 11k-j1-example: Enter on the example fills the law box and the date and shows the answer; focus stays on the button (button#example "Try the example: CSRD on 202")
PASS 11k-j1-example: from the example the next Tab reaches the answer's link with a ring
PASS 11k-j2-link: link only (ae-dl-11-2024-climate on 2025-06-01): the way on is one official link (a "Official source (opens in a "); after it Tab goes to footer
PASS 11k-j2-before: before the first version (eu-csrd-2022-2464 on 2022-12-31): the offer comes before the official link, Enter on it sets 2023-01-05, focus lands on the date field (input#date "") and the answer is in force (commit 8960295fa)
PASS 11k-j2-repealed: repealed (gn-arrete-2022-1646-evaluations-environnementales on 2024-01-01): status "Repealed on 2023-05-05" and the official link is the next stop
  note: Enter on the Browse by place link: focus body (none), scrollY 0 -> 512, section top 0px from the window top, next Tab goes to footer a "Run it on the command line"
PASS 11k-j2-none: no match ("Sarbanes-Oxley"): the panel says so, the Browse by place link is reachable by keys, and Enter takes the same tab to #browse-by-place (section 0px from the window top, focus on none, the next Tab goes to footer)
PASS 11k-j2-focus: every stop of the four journey 2 cases (28) shows an outline in the window, and no key press leaves focus where it was
PASS 11k-space-pick-wide: 1280px: Space on a match row closes the list and returns focus to the law box (input#law ""); the answer for kz-advertising-law shows
PASS 11k-expand: Enter on "Show all 150 versions" opens all 150 rows and focus stays on the summary (scrollY 24 -> 24)
PASS 11k-expand: after the expand Tab reaches each of the 150 rows of the full list, then the 3 footer links (focus left the page)
PASS 11k-expand: Space on the summary closes the list and focus stays on it
PASS 11k-expand: Shift+Tab from the law box goes back over the same 169 stops in reverse (reached the law box)
PASS 11k-order-wide: 1280px: Tab order law > match > date > example > answer-link > copy > rail > show-all > rail > footer (spec: law > match > date > example > answer-link > copy > rail > show-all > rail > footer); 1 match rows, 4 date stops, 7 rail rows, 150 in the full list, 3 footer links, 0 Browse by place stops; ends: focus left the page
PASS 11k-ring-wide: 1280px: all 170 stops of the full walk show an outline and lie in the window (the calendar-picker stop is judged by eye)
PASS 11k-visual-wide: 1280px: the Tab order moves forward and down the page except two moves the page keeps: the answer to the rail on its left (spec trade-off) and the last match row to the date field (accepted trade-off, Varun, 2026-11-18; spec order law box, match rows, date field); measured: match -> date (input#date ""): up 81px, right 416.7px; copy -> rail (button "2026-05-17 consolidated kk i"): up 353px, left 292px
  note: 1280px backward moves: match -> date (input#date ""): up 81px, right 416.7px; copy -> rail (button "2026-05-17 consolidated kk i"): up 353px, left 292px
PASS 11k-space-pick-narrow: 390px: Space on a match row closes the list and returns focus to the law box (input#law ""); the answer for kz-advertising-law shows
PASS 11k-order-narrow: 390px: Tab order law > match > date > example > answer-link > copy > rail > show-all > footer (spec: law > match > date > example > answer-link > copy > rail > show-all > footer); 1 match rows, 4 date stops, 7 rail rows, 3 footer links, 0 Browse by place stops; ends: wrapped to the law box
PASS 11k-ring-narrow: 390px: all 20 stops of the full walk show an outline and lie in the window (the calendar-picker stop is judged by eye)
PASS 11k-visual-narrow: 390px: the Tab order moves forward and down the page, with no backward move
  note: 390px backward moves: none
  note: Safari, Firefox, VoiceOver: not run, by hand. Screenshots: /Users/varunmoka/.cache/gel34-chrome/11-keyboard/shots
```

Step 4: `wcag.py: ok`; `3360 records checked`; `pairs=37 failing=0`.

Step 5: `CI=1 python3.13 -m pytest -q -k "not all_pairs"`, run on the first commit; not rerun after the change of 2026-11-18, because only `tests/web/checks/11-keyboard.mjs` changed and no Python file did:
```
467 passed, 1 deselected in 727.62s (0:12:07)
```

## Findings (numbers, from the run)

1. Accepted trade-off (Varun, 2026-11-18), measured by `11k-visual-wide`: with the match list open, Tab goes law box, match rows, then to the date field, which is to the right of the law box and above the rows. From the last match row to the date field the focus moves up 952 px and right 416.7 px with 8 rows (journey 1), up 81 px and right 416.7 px with one row (the full walk). The page keeps the spec's order (law box, match rows, date field); the spec names only the answer-to-rail move as a visual trade-off. At 390 px the page is one column and there is no backward move. The check passes when these two moves are the only backward ones in the walk, fails on any other backward move, and fails when the stop after the last match row is not the date field.
2. Answer to rail (the story's "rail-to-answer disorientation" question, half left for Varun): from Copy citation (left 464, top 544) to the first rail row (left 172, top 242) is up 302 px and left 292 px at 1280 x 900. Choosing a rail row by Enter or Space: the focused button is the same node, scrollY 0 to 0, the row's top 305 to 305 (Space) and 368 to 368 (Enter), the answer panel's top 214 to 214; the answer text changes to the right of the focused row. Nothing scrolls. Whether the move left disorients is a person's call. The CSRD page fits in the 900 px window, so this does not show what happens on a page that scrolls.
3. Browse by place holds no Tab stop (0 stops measured at 1280 and 390): the grid is `role="img"` and the table has no control. After the last rail row the next stop is the first footer link. The spec's order list names Browse by place; there is nothing in it to name.
4. After Enter on the "Browse by place" link in the no-match answer: location hash `#browse-by-place`, same tab, the section's top is 0 px from the window top, `document.activeElement` is the body (the target is not focusable), and the next Tab goes to the first footer link, the first focusable thing after the section (so Chrome continues from the section; that reading is inferred from where the Tab lands). The ring is gone until the next Tab.
5. The date field has four Tab stops in Chrome: three segments and the calendar icon. On the icon the input does not match `:focus-visible`, so the script cannot measure it; the screenshot `j1-date-picker-focus.png` shows Chrome's own blue ring on the icon. Seen in headless Chrome only.
6. The Tab after the last footer link wraps to the law box in journey 1 and in the narrow walk, and passes through the body first in the wide walk. No stop traps in any walk (Tab 150-row list, Shift+Tab back over 169 stops).
7. Arrow keys: the spec says the match list is not a combobox and has no arrow-key movement. Nothing here tests that; ArrowUp and ArrowDown are used only to learn the date field's segment order.

## Rows for the results table

| Row | Result | Method | Browser | Evidence |
|---|---|---|---|---|
| R22 (AC2, journeys 1 and 2, keyboard only, Chrome) | Pass, with the accepted trade-off noted | Script `tests/web/checks/11-keyboard.mjs`, key events only, headless, 1280 x 900 and 390 x 900 | Chrome 157.0.8103.79 | 32 of 32 checks pass (`check.mjs: 425 passed, 0 failed`). Accepted trade-off (Varun, 2026-11-18): with the match list open at 1280 px, Tab from the last match row to the date field moves focus up 952 px and right 416.7 px (8 rows; up 81 px with one row), the spec's order; the check allows only that move and the answer-to-rail move. Also passed: every step completes, every measured stop matches `:focus-visible`, draws an outline of non-zero width and lies in the window, spec order held (law > match > date > example > answer links > Copy citation > rail > Show all N > footer, Browse by place has 0 stops), chosen match row returns focus to the law box by Enter and by Space, Copy citation keeps focus and copies the displayed line, a chosen rail row keeps the same button, Show all 150 versions keeps focus on the summary, no trap, Shift+Tab mirrors Tab. |
| R22, rail-to-answer disorientation (half) | Not run (a person's judgement) | Numbers only | Chrome 157.0.8103.79 | Copy citation to first rail row: up 302 px, left 292 px; on choosing a rail row scrollY 0 to 0, row top and answer top unchanged. Left for Varun. |
| R22, ring against its neighbours, date-field calendar icon | Not run (by eye) | Screenshot `j1-date-picker-focus.png` | Chrome 157.0.8103.79 | Icon shows Chrome's own blue ring in headless; `:focus-visible` does not match the input there. |
| R49 (spec step 13 item 2, Chrome and Safari) | Chrome half: see R22; Safari Not run | The same script for Chrome | Chrome 157.0.8103.79; Safari 27.2 not run | Safari is Varun's, by hand, after he records the "Press Tab to highlight each item" setting. |

## What the scripts cannot judge, and did not run

- Whether any ring is easy to see against its neighbours (11-ring.mjs and the contrast test do two elements by number); whether the move from the answer to the rail on its left disorients; the date-field icon's ring; all of Safari, Firefox and VoiceOver. Headed Chrome was not run: the script is headless.
- A link that opens a new tab (Official text, Official source) is reached and measured and never activated. "Another date" and the arrow keys beyond the date segments are not exercised. The not-yet-in-force and date-not-recorded variants, the same-date rail rows and the capped-rail window around a middle date are not walked by keys.
- Only the CSRD (3 rows) rail was used for Space and Enter on a rail row; the 150-row rail was walked by Tab and expanded by Enter, not chosen from.
- Date typing: Chrome's order is day-month-year on this Mac (the script learns it). On another region the field takes the other order; the script reads it from the field.

## Proof each verdict can fail

The mutants edit a copy of `web/` in `/tmp/gel34-kb-mut/<name>/` (outside the repo); the runner is `/tmp/gel34-kb-mut/run.py`. Each mutant was run with my file against the copy, and the tags it turned red are listed (rerun in full after the change of 2026-11-18; `check.mjs` there runs only my file).

Unchanged page (M00, the same copy with no edit): `check.mjs: 32 passed, 0 failed`, and `11k-visual-wide` passes with the measured numbers in its label (match -> date up 81 px, right 416.7 px; copy -> rail up 353 px, left 292 px).

The two mutants the 2026-11-18 change needs: V01 adds a second backward move and `11k-visual-wide` fails with `backward: footer -> footer (a "Use it from an AI assistant"): level, left 220.9px; backward: footer -> footer (a "Set up the MCP server"): level, left 194.9px`. V02 takes the date field out of the Tab order and `11k-visual-wide` fails with `the stop after the last match row is example, want the date field (spec order)`. `11k-visual-narrow` still fails on M07 and M08 (no backward move is accepted at 390 px).

| Mutant (one edit) | Tags that failed |
|---|---|
| M01 `:focus-visible { outline: none }` | expand, j1-copy, j1-example, j1-focus, j1-pick, j1-rail-pick, j2-focus, ring-narrow, ring-wide, space-pick-narrow, space-pick-wide |
| M02 `law.focus()` removed after a match is chosen | expand, j1-focus, j1-pick, order-narrow, order-wide, ring-narrow, ring-wide, space-pick-narrow, space-pick-wide, visual-wide |
| M03 rail redrawn on every answer (focused row replaced) | expand, j1-footer, j1-rail-pick, j1-steps |
| M04 Copy citation blurs after copying | j1-copy |
| M04b copy writes "x" instead of the line | j1-copy |
| M05 `toggle` moves focus to the law box | expand, order-wide, visual-wide |
| M06 Tab blocked on the example button | j1-copy, j1-example, j1-focus, j1-footer, j1-rail-order, j1-rail-pick, j1-steps, j2-before, j2-focus, j2-link, j2-none, j2-repealed, order-narrow, order-wide |
| M07 positive `tabindex` on the first footer link | j1, j1-example, j1-list, j2, order-narrow, order-wide, space-pick-narrow, space-pick-wide, visual-narrow, visual-wide |
| M07b `tabindex=-1` on the example | j1, j1-copy, j1-example, j1-rail-order, j1-rail-pick, j2, j2-before, j2-link, j2-repealed, order-narrow, order-wide |
| M08 date field above the law box (column-reverse) | visual-narrow |
| M09 `autofocus` on the law box | j1, j1-example, j1-list, j1-load, j2, j2-link, order-narrow, order-wide, space-pick-narrow, space-pick-wide, visual-wide |
| M10 date input ignored | j1-date, j2-before, j2-focus |
| M11 summary label changed | expand |
| M12 offer button no longer focuses the date field | j2-before, j2-focus |
| M13 Browse by place link points to `#nowhere` | j2-focus, j2-none |
| M15 match rows in reverse order | expand, j1, j1-date, j1-list, j1-pick, j1-rail-order, j1-rail-pick |
| M16 match rows reversed by CSS only | j1-list-order |
| M17 rail rows oldest first | j1-rail-order, j1-rail-pick |
| M18 Tab blocked on the last footer link | expand, j1-focus, j1-footer, order-narrow, order-wide |
| M19 example no longer sets the date | j1-example |
| M20 "Official source" label changed | j2-link |
| M21 "Repealed on" changed | j2-repealed |
| M22 rail rows from before 2022 skipped by Tab | expand |
| M23 Shift+Tab blocked on Copy citation | expand |
| M24 closing the details moves focus to the law box | expand |
| M25 count line text changed | j1-list |
| V01 footer links in a reversed row (`flex-direction: row-reverse`): a second backward move | visual-wide |
| V02 `tabindex=-1` on the date field: the date field no longer follows the last match row | j1, j1-copy, j1-date, j1-example, j1-rail-order, j1-rail-pick, j2, j2-before, j2-link, j2-repealed, order-narrow, order-wide, visual-wide |

## Other

- Code review: the `code-review` skill at level `low` with `feat/gel-34-11-keyboard` read the diff and answered "Only a test file changed on this branch, which is excluded from review" with no findings. It reviewed no code. I read the file again by hand and fixed what I found (a label-based identity comparison on the rail row, a measurement taken after an extra Tab, throws instead of verdicts when a page never answers).
- Screenshots (outside the repo): `~/.cache/gel34-chrome/11-keyboard/shots/` holds `j1-law-focus.png`, `j1-match-row-focus.png`, `j1-date-picker-focus.png`, `j1-copy-focus.png`, `j1-rail-row-focus.png`, `j2-link-focus.png`, `j2-none-browse-link-focus.png`, `w-summary-focus.png`. Only `j1-date-picker-focus.png` was looked at.
- No file other than the check file was touched; `web/law-data.json` is gitignored and not committed.

## What Varun must decide

Decided 2026-11-18: the last match row to date field move is accepted (finding 1).

1. Whether the answer-to-rail move to the left disorients (the story's half left for him; numbers above), in headed Chrome and in Safari.
2. Whether "Browse by place" with no Tab stop satisfies AC2's "Browse by place" step in the order list.
