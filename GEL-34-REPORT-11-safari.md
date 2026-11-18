STATUS: done

# GEL-34 story 11, unit 11-safari: the Safari rows by script

Branch `feat/gel-34-11-safari`, BASE `4a2da624bf8c2228e944a53a4a8d49371597582f`. One new file, `tests/web/safari_check.mjs`. Corpus `origin/history` (55c8c2a9c), `--read-on 2026-11-17`. Safari 27.2 (safaridriver 20625.2.8.18.4), macOS. Nothing pushed; no `gh`; no subagents; nothing installed or downloaded.

## Plan

One standalone runner speaks WebDriver to `safaridriver` over node's `fetch`, serves `web/` itself (port 8530, `--data` mapped to `/law-data.json`), opens one session for all rows and closes it at the end. Checks: R39, R23, R27 and the text-spacing half of R34. Each verdict prints `PASS`/`FAIL`; what a script cannot judge prints `NOT RUN` or a `NOT JUDGED` note. Usage: `node tests/web/safari_check.mjs --data PATH --expected PATH [--port 8530] [--driver 4530] [--shots DIR] [--web DIR]`. `--web` exists so a mutated scratch copy of `web/` outside the repo can be served.

## Preflight

The first session attempt was refused with the exact text: `session not created: Could not create a session: You must enable 'Allow remote automation' in the Developer section of Safari Settings to control Safari via WebDriver.` I changed nothing. Minutes later the same call created a session (the pasteboard held `! sudo safaridriver --enable`, so Varun had enabled it), and I went on. Sessions I opened in total: about nine (runs, mutant runs, one debug script). The coordinator then stopped all further Safari runs; `safaridriver` is stopped and no session is open.

## What was run, and how far each result can be trusted

Only some runs are valid evidence:

- Run A (a full run, window focused, `document.hasFocus()` true): `safari_check.mjs: 22 passed, 3 failed`. Code before the later edits below. The 3 fails were the date-field ring (see R23).
- Run B (a full run, window focused): `safari_check.mjs: 23 passed, 2 failed`. Same code as the committed file except for the edits listed below; served a scratch copy with ONE mutant (`cite.js`, "in force on" changed to "in force at"). Its 2 fails: `R39-citation` (the mutant, wanted) and `R23-j1-date` (the real finding). Everything else it shows is the unmutated page.
- Run C (full run, output only grepped for the date row): made `r23-date-focused.png`.
- Runs D and E: INVALID. In D the first WebDriver call failed (`fetch failed`) and then every `:focus-visible` read false; in E the window did not have focus (`document.hasFocus() false`), R39 timed out and every ring check failed. Cause: Safari was not frontmost. Their numbers are not page findings and are not used below. After E I added a guard: a section is Not run when `document.hasFocus()` is false. That guard was not run in Safari.

Edits made after runs A and B, not run in a full Safari session: a 60 s timeout on each WebDriver request, clearer failure text when Tab never reaches Copy citation or a rail row, and the focus guard above. `node --check` passes. No complete Safari run of the committed file exists.

## Rows for the results table

Browser: Safari 27.2, by script through `safaridriver`, run 2026-11-18, window 1280x848 inner. A script ran these, not a person.

| Row | Result | Method | Evidence |
|---|---|---|---|
| R39 | Pass (scripted) | CSRD example by a real click on "Try the example", link-only by address, rail, Browse by place, citation line, all read from the DOM and compared with `tools/law.py` and `tools/query.py` output (as `11-whole-page.mjs` P4 does) and `cite-expected.json` | Run A: `PASS R39-answer`, `R39-rail` (3 versions, 2025-04-17 consolidated marked), `R39-citation`, `R39-copy-status` (Copied), `R39-clipboard`, `R39-linkonly`, `R39-browse` (250 rows). Clipboard: a `pbcopy` sentinel, then Copy citation, then Cmd+V into a scratch textarea read back the line; `navigator.clipboard.readText()` was refused (`NotAllowedError`). Not judged by a script: how anything looks. |
| R23 | Fail on one scripted check; real-keyboard half Not run | WebDriver key actions, synthetic. Observed: plain Tab under WebDriver reaches law box, date field (3 segments), then NOT the buttons or links (`law > date > date > date > law ...`); Option+Tab reaches Try the example and the footer links. The journeys ran with Option+Tab. | Run B: PASS `R23-j1-law`, `-pick` (match row Enter returns focus to the law box), `-order` (date, example, answer-link, copy, rail-row, footer), `-ring` (9 stops), `-copy`, `-rail` (Enter on a rail row keeps focus on that row, which becomes current), `-capped-order` (adds show-all before footer), `-capped-ring`, journey 2 (no match, link only, before first version, repealed: the answer says the case, a link is reached by Tab). FAIL `R23-j1-date`: the native date field reached by Tab does not match `:focus-visible` and the page's 2px outline is not drawn (`outline none`). Safari draws its own blue highlight on the month segment (`shots/r23-date-focused.png`); whether that counts as visible focus is Varun's call. Not judged: Safari's "Press Tab to highlight each item" setting (not read), the real keyboard, whether focus moving from the answer to the rail on its left disorients. Browse by place has no focus stop (grid cells are spans, the table is not focusable), so the focus order has nothing between the rail and the footer there. |
| R27 | Not run (the picture is Varun's); computed outline Pass | Real keyboard-path focus, computed style, viewport screenshots | Run A and B: `PASS R27-copy` (solid 2px rgb(31, 111, 74), offset 2px), `PASS R27-rail` (same colour, offset -2px, ring inside the box, left band 172 to 174 against the li edge 168 to 172: no overlap). Screenshots below. Not judged: whether the ring is seen against the button fill and the rail tint. |
| R34, text spacing | Pass (scripted) for three states; zoom Not run | The 1.4.12 CSS (line-height 1.5, letter 0.12em, word 0.16em, paragraphs 2em, `!important` on `*`) injected, then clipped text (a text line leaving a `hidden`/`clip` ancestor, or an ellipsis cutting it) and overlapping text lines counted | Run A and B: in-force answer 1292 text nodes, link-only 1277, Browse by place 1270, each 0 clipped and 0 overlapping, with and without spacing; spacing confirmed applied (0.12, 0.16, 1.5, 2.0). 200% zoom of a 1280 px window in Safari: Not run, Varun's by hand (WebDriver has no page zoom). Not judged: whether spaced text looks right. |

## Can each verdict fail

Proved, in Safari: `R39-citation` (run B, mutant: the page line differs from the Python line).

Proved in headless Chrome 157, not in Safari: `R34`. The runner's own page-side code (SPACING, APPLIED, MEASURE, read from the file) ran against `web/` and three scratch mutants outside the repo (`/tmp/gel34-11-safari-scratch/`). Unmutated: 0 clipped, 0 overlapping, text-node counts 1292, 1277, 1270, the same as Safari. `#answer-panel p { height:1.2em; overflow:hidden }`: 11 clipped (in-force), 6 (link-only), 0 on Browse (no answer there, as expected). `#answer-panel p { margin-bottom:0 !important; height:0.5em }`: 20 and 8 overlapping, 0 on Browse. `#browse-table-wrap { overflow:hidden; height:3em }`: 1004 clipped in all three states, reached by scrolling or not. So the check detects both kinds. It does not prove Safari lays text out the same way.

Seen failing for another cause: the ring checks (`R23-j1-law`, `-pick`, `-ring`, `-capped-ring`, `R27-copy`, `R27-rail`) printed FAIL with the problem text in the invalid runs D and E, when the window was not focused. That shows the branch fails; it is not a page mutant. `R23-j1-date` failed in valid runs.

Not proved: `R39-answer`, `-rail`, `-linkonly`, `-browse`, `-copy-status`, `-clipboard`; `R23-j1-order`, `-copy`, `-rail`, `-pick` (return of focus), `-capped-order`, journey 2. The mutants for these (broken rail text, browse count, official URL, `law.focus()` removed, rail node recreated, `tabIndex = -1` on Copy citation, clipboard text changed) were written and are in `/tmp/gel34-11-safari-scratch/mut.py`, but the coordinator stopped further Safari runs before they ran. Logic only: each pushes a problem string when its comparison differs.

## Screenshots (not in the repo)

`/Users/varunmoka/.cache/gel34-chrome/11-safari/shots/`: `r27-copy-citation.png`, `r27-rail-selected.png`, `r23-date-focused.png`, `r34-in-force-answer.png`, `r34-link-only-answer.png`, `r34-browse-by-place.png`. These six are from run B, the last focused full run (the unfocused run E had overwritten them; I replaced them from the scratch copy `shots-cite-line`). Because run B served the one mutant, the citation line in the pictures reads "in force at" instead of "in force on"; nothing else differs. I looked at `r27-rail-selected.png` from this set (ring drawn inside the selected row, green on the tint, clear of the 4px edge). I looked at `r27-copy-citation.png` (ring round the green button, with a gap) and `r23-date-focused.png` (blue month segment, no page ring) from the earlier focused runs A and C, not from this set; they match the computed values. Retake after a clean full run if the "at" matters.

## Recipe results

- `node tests/web/check.mjs --data web/law-data.json --expected ~/.cache/gel34-chrome/11-safari/expected.json --profile .../prof --port 8530 --cdp 9530`: `check.mjs: 393 passed, 0 failed`. The runner is not part of it.
- `python3.13 tests/web/wcag.py`: `wcag.py: ok`
- `python3.13 tools/check_corpus.py`: `3360 records checked`
- `python3.13 tests/test_web_contrast.py`: `pairs=37 failing=0`
- `CI=1 python3.13 -m pytest -q -k "not all_pairs"`: `467 passed, 1 deselected in 579.96s (0:09:39)`

## Not done

- The `code-review` skill: not run. The dispatch said start no subagents and the skill starts reviewers. I read the file through once myself instead.
- Plain-Tab Safari journeys: not run (Tab does not reach buttons under WebDriver). Option+Tab ran instead.
- Invoker Commands forced off in Safari (story AC9): not covered. Safari 27.2 has Invoker Commands (`"CommandEvent" in window` is true, so the Enter-on-button copy went through the invoker path).
- The clipboard check overwrites Varun's pasteboard (it ends holding a citation line or the sentinel).
- VoiceOver, Firefox, Lighthouse, 200% zoom: not run.

## What Varun must decide

1. Is Safari's own blue segment highlight enough as visible focus on the date field, or does the date field need a ring of its own (a layout and CSS decision; `web/` was not touched)?
2. Browse by place has no keyboard stop. The spec's focus order lists it between the rail and the footer; either the spec line or the page changes.
3. Plain Tab not reaching buttons is Safari's setting, not the page. The real-keyboard run with "Press Tab to highlight each item" noted is his.
4. Whether to allow a full Safari run of the final file (one session, Safari kept frontmost and untouched) and the mutant proofs, which stopped on the coordinator's instruction.
