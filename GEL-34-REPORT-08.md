STATUS: done

# GEL-34 story 08: copy a citation (report)

## Plan

Contract shared by the three pieces (fixed before any file was written):

- `GEL.cite.build(detail, data)` returns the line (string) when `detail.state === "plain"`, else `null`. The row is the `detail.entry.versions` entry whose `commit` equals `detail.interval.commit`. `GEL.cite.draw(detail)` empties `#slot-citation` and, for a plain answer, draws the line and button; it is registered with `GEL.onAnswer`.
- DOM inside `#slot-citation`: `<p id="citation-line">`, `<button id="citation-copy" type="button" command="--copy" commandfor="citation-line">Copy citation</button>`, `<span id="citation-status" role="status">` beside the button, outside it. Nothing else.
- Path: one registration. `"CommandEvent" in window` decides at load: native (listener for the `command` event on the line, `event.command === "--copy"`) or fallback (click listener on the button). The page logs `console.info("cite: invoker path")` or `console.info("cite: fallback path")` once at load.

| Piece | Deliverable | Files (one writer each) | Check that proves it done |
|---|---|---|---|
| A | the line, the button, the copy function, the styles, two lines in index.html | web/cite.js, web/cite.css, web/index.html (my two lines only) | node --check; wcag.py ok; page checks (C) |
| B | the Python probe: the expected lines built from query.lookup | tests/web/cite_expected.py | runs on origin/history, exits 0, both fixed strings equal the story's |
| C | the browser checks for AC1 to AC9 | tests/web/checks/08-cite.mjs | node --check; the full check.mjs run |

## What I did

The first run of this story stopped when its tuios window closed. Its five files were on disk and uncommitted. This run committed them first (`651ce5e37`, `wip: story 08 files from the stopped run`), read them against the story, then ran the gate set. No file needed a change: every check passed on the files as the first run left them, except the known story 04 AC8 line (see Open).

- `web/cite.js` (71 lines): `GEL.cite.build`, `GEL.cite.draw`, one `copy()`, one registration (native `command` listener on the line, or a click listener on the button), the two console lines.
- `web/cite.css` (33 lines): monospace line with `overflow-wrap: anywhere`, actions row, the green button from `--link` and `--page`, the status fading by opacity (never `display: none`), `prefers-reduced-motion` honoured. No colour literal, no `http`.
- `web/index.html`: one `<link rel="stylesheet" href="cite.css">` and one `<script defer src="cite.js">` above `app.js`. No other line.
- `tests/web/cite_expected.py`: the probe. It builds every line from `query.lookup` (`query.envelope`, `query._commits`, `query._scope`), never from `web/` or `web_data.py`.
- `tests/web/checks/08-cite.mjs`: the checks `08-ac1` to `08-ac9`, loaded by `check.mjs` through the extension hook. `check.mjs` was not touched.

Gate commands (all run from this worktree, 2026-11-18):

```
python3.13 tools/web_data.py --ref origin/history --read-on 2026-11-17 --out web/law-data.json
  not plain: date-basis=1 not-yet-applying=2
python3.13 tests/web/expected.py --ref origin/history --read-on 2026-11-17 --out ~/.cache/gel34-chrome/story-08/expected.json
  expected: pairs=625 plain=622 interim=3 instruments=216 places=47 csrd=8 date_table=103
python3.13 tests/web/cite_expected.py --ref origin/history --read-on 2026-11-17 --out ~/.cache/gel34-chrome/story-08/cite-expected.json
  cite_expected: cases=14 link_only=553 snapshot=55c8c2a9c
node tests/web/check.mjs --data web/law-data.json --expected ~/.cache/gel34-chrome/story-08/expected.json --port 8408 --cdp 9408 --profile ~/.cache/gel34-chrome/story-08
  check.mjs: 106 passed, 1 failed
python3.13 tests/web/wcag.py
  wcag.py: ok
python3.13 tools/check_corpus.py | tail -2
  3360 records checked        (exit 0)
```

The `check.mjs` run was made once; AC5 (Loading the law list) passed in it (`PASS AC5: slow: "Loading the law list" at 17 ms (limit 500)`), so no rerun was needed. 106 passed = 73 of the 74 BASE checks plus 33 of this story (`grep -c '^PASS 08-'` on the run output gives 33, no 08 check failed); the one failure is the known story 04 AC8 line. Pytest was not run (the probe is not a test; the coordinator runs pytest at the gate). The Chrome of port 9408 and the server of port 8408 are stopped (`pgrep` finds none).

## Acceptance criteria

1. Fixed lines for `eu-csrd-2022-2464` and `dz-lf-1992-art117`: done.
   - `PASS 08-ac1: GEL.cite.build on the real data equals the probe's line, character for character, for all 14 cases (csrd, dz, publication-1 ... publication-11, longest, not-yet-applying)`.
   - `PASS 08-ac1: the two fixed lines of the story (csrd, dz), read from cite-expected.json, equal the probe's lines and the page's build, character for character`. The probe itself exits 1 unless both lines equal the story's strings written out in `cite_expected.py`; it exited 0.
   - The row is picked by commit: `PASS 08-ac1: the row is the one of the interval's commit ... for all 14 cases`.
   - Publication wording: `PASS 08-ac1: the 11 publication-dated cases read "in-force date not recorded (published <date>)" ... and never "in force since" or "version since"`.
   - Snapshot id: `PASS 08-ac1: the snapshot id in every line is exactly the 9 characters 55c8c2a9c ... not the stale c76381e2f`.
   - dz and not-yet-applying through the stub: `PASS 08-ac1: dz and not-yet-applying drawn through the stub (... the real answers are interim and interim on this base): #citation-line holds the probe's line`. The real answers are still interim on this base, so the line for these two was proven through `build()` and the stub; see "Real runs the integration must repeat".
2. No line and no button for link only and every other non-plain state, and the previous line is gone: done.
   - `PASS 08-ac2: after a real CSRD answer (one #citation-line, one #citation-copy), each non-plain answer leaves 0 of them and an empty #slot-citation: link only ae-dl-11-2024-climate; link only ag-eccb-climate-risk-standard; before the first version (...); repealed (...)`, plus dz and not-yet-applying while interim.
   - `PASS 08-ac2: all 553 link-only ids of the probe (after a CSRD answer each): 0 leave a citation line or button ... (recount in the page: 553 entries without intervals)`.
3. A build with `coverage.status` "history trails working tree": done, with a limit on the fixture (see Open).
   - `PASS 08-ac3: coverage.status "history trails working tree" with history commit 012345678...: the CSRD line is the fixed line with only (snapshot 55c8c2a9c) replaced by (snapshot 012345678)`.
4. Native Invoker path, clipboard, once, "Copied", empty after 2 s, never disabled: done, with a limit on `pbpaste` (see Open).
   - `PASS 08-ac4: Invoker Commands are native ("CommandEvent" in window is true) and the page logged "cite: invoker path" once, not the fallback`.
   - `PASS 08-ac4: a real mouse click copies exactly the displayed line to the clipboard (no newline, no label; read back with readText ...), writeText ran once, with that text`.
   - `PASS 08-ac4: the status is a role=status element beside the button (same parent), outside it, never display:none, and reads exactly Copied`.
   - `PASS 08-ac4: the status is still there at about 1000 ms and empty (exactly) by 3000 ms`.
   - `PASS 08-ac4: button.disabled was false throughout (sampled every 20 ms: 152 samples) and is false afterwards`.
   - `PASS 08-ac4: second copy after the status emptied: the message is Copied plus one no-break space (char 160) ...`.
5. Fallback with `delete window.CommandEvent`: done.
   - `PASS 08-ac5: with delete window.CommandEvent injected at document start, "CommandEvent" in window is false, and the page logged "cite: fallback path" once, not the invoker path`.
   - `PASS 08-ac5: fallback click: the clipboard holds the displayed line and writeText ran exactly once (one registered path), with that text`.
6. `navigator.clipboard` undefined: done.
   - `PASS 08-ac6: navigator.clipboard is undefined; a real click shows "Copy failed" in the same role=status element that existed before the click (so it is announced), the button stays enabled, and nothing reached the pasteboard`.
   - `PASS 08-ac6: Copy failed is empty (exactly) 3000 ms after it appeared`.
   - `PASS 08-ac6: selecting the line selects all its text: getSelection().toString() equals the line, and user-select is not none`.
7. Longest address (257 characters) at 320 px, no sideways scroll: done.
   - `PASS 08-ac7: the longest address (kr-carbon-neutrality-act-decree, 257 characters by recount) is in the line at a 320 px window`.
   - `PASS 08-ac7: at 320 px no sideways scroll (document 320/320, line 224/224, actions 224/224) ...`.
8. Keyboard: Tab after the answer's links, Enter and Space copy, 2px ring: done for what a script can run.
   - `PASS 08-ac8: Tab from the answer link reaches #citation-copy within 4 presses (stops: citation-copy); the link comes before it in the document ...`.
   - `PASS 08-ac8: the focused button shows the ring: :focus-visible, 2px outline, offset 2px, colour rgb(31, 111, 74)`.
   - `PASS 08-ac8: Enter on the focused button copies: one writeText, the clipboard holds the line` and `PASS 08-ac8: Space on the focused button copies: one more writeText (two in all) ...`.
   - Lighthouse on the button: not run, by hand later. VoiceOver in Safari 27.2 announcing "Copied" on two copies in a row: not run, by hand later. NVDA and JAWS: untested, as the story says. These two boxes stay unticked.
9. 390 px: button at least 44 px tall, no sideways scroll: done.
   - `PASS 08-ac9: at 390 px the button is 44px tall (at least 44) and the CSRD line and button fit: document 390/390, line 294/294, actions 294/294`.
   - `PASS 08-ac9: at 390 px the longest address answer also fits ... button 44px tall`.

## Recounts and differences from the story

- Link-only entries: 553 (probe `link_only_count`, page recount of entries without intervals 553), equal to the story.
- `date_basis: publication` rows: 11 (the probe exits 1 on any other count), equal to the story.
- Records on `origin/history`: 3360 (`check_corpus.py`), snapshot `55c8c2a9c`, equal to the story.
- Longest `source_url`: 257 characters, `kr-carbon-neutrality-act-decree`, equal to the story. The probe uses its latest non-repeal date.
- Translation rows: the probe finds 0 intervals that `lookup` shows as a translation on this snapshot, so the "translation since <date>" wording (no "version") is checked on a synthetic detail built from a real translation row (`at-uwg-s1-2a`), not on a real answer. The code path for it is `build()` line 12.
- The story's AC4 says `pbpaste` equals the line. Headless Chrome keeps its own clipboard and never writes the macOS pasteboard (found on Chrome 157 in this run: after a copy that `readText()` returns, `pbpaste` still showed the sentinel). The check reads the copy back with `navigator.clipboard.readText()` and holds `pbpaste` to "the line or the untouched sentinel". That is weaker than the story's wording.

## Open

- Story 04 AC8, known: `FAIL AC8: the load requested only index.html, the stylesheet, one request per script and the data file | observed: want / /answer.js /app.js /cite.js /data.js /dates.js /find.js /interim.js /law-data.json /style.css`. The raw line of what was requested: `load requested: / /answer.js /app.js /cite.css /cite.js /data.js /dates.js /find.js /interim.js /law-data.json /style.css`, and the check's `want` has `/style.css` and the scripts but not `/cite.css`. Any story that links its own stylesheet fails it. Not fixed, as the brief says; the owner of `check.mjs` must let `want` include the stylesheet links of `index.html` once the five branches are merged.
- AC3 fixture: the check does not use Story 1's temporary-repository build. It clones the real data file and sets `coverage.status` to "history trails working tree" and `snapshot.history_commit` to the made-up `0123456789abcdef0123456789abcdef01234567` (`tests/web/checks/08-cite.mjs`, `ac3`). It proves the page reads the snapshot id from the data it loads and changes nothing else in the line; it does not prove `web_data.py` writes that status for a repository that trails. The commit review hook flagged this and the two other synthetic parts (the stub for dz and not-yet-applying, the synthetic detail for the translation wording). All three are named in the check file header and in this report.
- `pbpaste` equals the line (AC4 literal): needs a headed Chrome, by hand.
- Lighthouse on the button and VoiceOver (two copies in a row): not run, by hand later.
- Pytest: not run (no Python test added; the coordinator runs it at the gate).

## Real runs the integration must repeat after story 06 merges

After story 06 makes `dz-lf-1992-art117` on 2025-06-01 and the 17 not-yet-applying entries plain (in-force) answers, run `check.mjs` again. Then `08-ac1` "after the real GEL.showAnswer" should list dz and not-yet-applying among the plain answers and match the probe's line, and `08-ac2` skips them (it marks them "not run, plain now"). Run the click on the real dz answer by hand once in a headed Chrome.

## What Varun must decide

Nothing for this story. One item for the coordinator: whether AC3 should be rebuilt on Story 1's temporary-repository fixture in a later pass (it needs a Python helper outside this story's file list).

## Changes to seams

- `web/index.html`: one `<link rel="stylesheet" href="cite.css">` after `style.css` and one `<script defer src="cite.js">` after `find.js`, above `app.js`. The merge will need to keep every story's lines.
- `GEL.cite = { build, draw }` is new, registered through `GEL.onAnswer`. `#slot-citation` is emptied for every answer and filled only for `detail.state === "plain"`. `answer.js` and the other slots are untouched.
- `tests/web/check.mjs` AC8 `want` list lacks the stylesheet links of the other stories (see Open). The same change will be needed for every story that adds a `.css`.
- No new token in `style.css` was needed: `cite.css` uses `--link`, `--page`, `--mono`, `--unit`.

## Report

All nine acceptance criteria have a result. `check.mjs` gives 106 passed, 1 failed: the failure is story 04 AC8, caused by the extra `/cite.css` request, as the brief expects. `wcag.py: ok`, `3360 records checked`. Three parts of the checks use synthetic data (the dz and not-yet-applying stub, the translation detail, the AC3 clone); each is named above. Lighthouse, VoiceOver and the literal `pbpaste` check wait for a hand run.

## Next

- Merge this branch, then widen the `want` list of story 04 AC8 to include stylesheet links.
- After story 06 merges, rerun check.mjs and read the dz and not-yet-applying lines.
- Run Lighthouse and VoiceOver (two copies in a row) by hand on the merged page.
- Click Copy citation once in a headed Chrome and compare `pbpaste` with the line.
