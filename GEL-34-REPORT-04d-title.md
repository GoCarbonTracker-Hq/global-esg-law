STATUS: done

# GEL-34 batch 4, unit A: 04d-title (answer title line width at 320 px)

BASE: 051df4fc64164b199359c8456903628315aff4d3. Branch: feat/gel-34-04d-title.

## Plan

1. Write `tests/web/checks/04d-title.mjs` first and run it on BASE (stylesheet untouched) to see which assertions fail.
2. Change `#answer-panel { padding: 1.5rem }` to `padding: calc(var(--unit) * 2)` (1rem), and set `padding: 1.5rem` on `#answer-panel` inside the existing `@media (min-width: 48rem)` block. Nothing else in `web/style.css`.
3. Measure, with a throwaway script kept outside the repo, how many titles in `web/law-data.json` have a word split across lines at 320 px for three paddings (1.5rem, 1rem, 0.75rem) at 100% and 200% text.
4. Run the shared recipe, the code-review skill at level low, and fill in this report.

Which check proves what: `04d-width` proves the line is at least 240 px; `04d-words` is the brief's "no word split" on CSRD; `04d-wide-768` and `04d-wide-1280` prove the wide layout keeps 24px.
Step 1 found that the CSRD title has no word wider than the old 224 px line, so `04d-words` cannot fail on BASE. I added `04d-witness` for that (see "The change and why").

## The change and why

`web/style.css`, two lines:

- `#answer-panel { padding: calc(var(--unit) * 2); }` (1rem, was 1.5rem).
- `#answer-panel { padding: 1.5rem; }` added inside the existing `@media (min-width: 48rem)` block, so the wide layout keeps 24px. No new breakpoint, no font-size change, no `overflow-x`, body padding and `overflow-wrap` untouched.

Why: at 320 px the answer title's line was 224 px (320 minus 24 px body padding twice minus 24 px panel padding twice). `overflow-wrap: anywhere` splits only a word wider than the line, so a word between 224 and 240 px was cut mid-word and now fits. The line is now 240 px (title content width read in Chrome at 320 px, 100% text).

The check `tests/web/checks/04d-title.mjs` has five verdicts: `04d-width`, `04d-words`, `04d-witness`, `04d-wide-768`, `04d-wide-1280`.

`04d-witness` is an addition to the brief. The CSRD title ("Directive (EU) 2022/2464 as regards corporate sustainability reporting (CSRD)") has no word wider than 224 px (widest word, "sustainability", is 143 px), so the brief's "no word split" assertion on CSRD passes on BASE too (measured, below). To have a word-split assertion that does fail on BASE, `04d-witness` puts a one-word title into the same title element: a run of "n" grown in the page until it is just wider than 224 px (the old line). It then expects that word, no wider than 240 px, in one piece. It is built from the font in use, so it does not depend on a particular word or font; it fails with a message if the font cannot give a word in that window. It tests the stylesheet on the real panel, not a real law's title.

## Proof that the new narrow assertions fail on BASE

Run of the full `check.mjs` with the new check file and the BASE stylesheet (only the check file added), same command as the recipe:

```
FAIL 04d-width: 320px window, text 100%, CSRD answer: the title's content width is at least 240px | observed: title content width is 224px, want at least 240
PASS 04d-words: 320px window, text 100%, CSRD answer: no word of the title is split across lines
FAIL 04d-witness: 320px window, text 100%: a one-word title wider than 224px and no wider than 240px is not split | observed: the word 226.875px wide is split into 2 rects on a 224px line
PASS 04d-wide-768: 768px window: the answer panel's side padding is 24px on both sides
PASS 04d-wide-1280: 1280px window: the answer panel's side padding is 24px on both sides
check.mjs: 378 passed, 2 failed
```

So `04d-width` and `04d-witness` fail on BASE; `04d-words` passes on BASE (the brief's expectation that both narrow assertions fail on BASE does not hold for the CSRD title; `04d-witness` covers the word-split case). The 375 earlier checks all pass on BASE (378 passed = 375 + 3).

## Table: titles with a word split at 320 px, every title in `web/law-data.json`

Measured in Chrome (headless, 320 px window, panel showing CSRD on 2025-06-01, each of the 1404 entries' titles set into the real title element, throwaway script not committed). 1404 entries, 1401 distinct titles, 22319 words. The padding rows are inline overrides on the BASE stylesheet; a fourth run on the new stylesheet with no override gave the same numbers as the 1rem row (line 240 px, 233 titles, 78 titles with a wide word).

"Split" is the brief's definition: a Range over a whitespace-delimited word has more than one client rect. "Wider than the line" means the word's natural width (nowrap) is wider than the title's line, so it must split mid-word (the remainder that stays). The rest of the split words break at a legal break opportunity: a hyphen, a non-Latin script, or other.

100% text:

| panel padding | line | titles with a split word | titles with a word wider than the line | words wider than the line | split words in total |
|---|---|---|---|---|---|
| 1.5rem (BASE) | 224 px | 239 | 101 | 116 | 335 |
| 1rem (this change) | 240 px | 233 | 78 | 91 | 330 |
| 0.75rem | 248 px | 219 | 73 | 85 | 317 |

200% text (root font 32 px, so rem padding doubles and the title font is 48 px):

| panel padding | line | titles with a split word | titles with a word wider than the line | words wider than the line | split words in total |
|---|---|---|---|---|---|
| 1.5rem (BASE) | 128 px | 1404 | 1404 | 10701 | 10836 |
| 1rem (this change) | 160 px | 1402 | 1402 | 8536 | 8681 |
| 0.75rem | 176 px | 1384 | 1382 | 7304 | 7434 |

What the numbers say:

- At 100% text the change helps a little. Titles that must split a word mid-word fall from 101 to 78 (1.6 per cent of the 1404 titles); 0.75rem would reach 73. The remaining 78 titles have 91 words that are wider than 240 px; that remainder is accepted.
- Titles with any split word fall only from 239 to 233, because most of the other splits are breaks at a hyphen (102 words at 1.5rem, 124 at 1rem), in non-Latin script (93 and 92) or at other break points (23 and 22) and do not depend on the padding. A wider line even adds hyphen breaks where a long hyphenated word used to be cut mid-word.
- At 200% text the padding does not help: 1404 of 1404 titles still have a word wider than the line at BASE and 1402 at 1rem. The title font is 48 px there, and the line (128 or 160 px) holds about 9 to 11 characters. Only a smaller title font at large text sizes would change that; the brief rules a font-size change out, so I did not try one.
- Going from 1rem to 0.75rem buys 5 titles at 100% (78 to 73) and 20 at 200% (1402 to 1382); the 1rem choice sits where most of the 100% gain is already taken.

## Recipe results

Result lines as run on the branch (new check file and stylesheet change both in):

```
tools/web_data.py ... (ref origin/history, read-on 2026-11-17):  not plain: date-basis=1 not-yet-applying=2
tests/web/expected.py:       expected: pairs=625 plain=622 interim=3 instruments=216 places=47 csrd=8 date_table=103
tests/web/cite_expected.py:  cite_expected: cases=14 link_only=553 snapshot=55c8c2a9c
node tests/web/check.mjs ... --port 8470 --cdp 9470:   check.mjs: 380 passed, 0 failed   (exit 0, first run; story 04 AC5 did not fail, no rerun needed)
python3.13 tests/web/wcag.py:                  wcag.py: ok
python3.13 tools/check_corpus.py:              3360 records checked
python3.13 tests/test_web_contrast.py:         pairs=37 failing=0
CI=1 python3.13 -m pytest -q -k "not all_pairs":   464 passed, 1 deselected in 446.78s (0:07:26)
```

BASE for comparison: `check.mjs: 375 passed, 0 failed` (shared rules), now 380 = 375 + 5 new 04d verdicts. pytest matches the BASE figure (464 passed, 1 deselected).

The five 04d lines on the changed stylesheet:

```
PASS 04d-width: 320px window, text 100%, CSRD answer: the title's content width is at least 240px
PASS 04d-words: 320px window, text 100%, CSRD answer: no word of the title is split across lines
PASS 04d-witness: 320px window, text 100%: a one-word title wider than 224px and no wider than 240px is not split
PASS 04d-wide-768: 768px window: the answer panel's side padding is 24px on both sides
PASS 04d-wide-1280: 1280px window: the answer panel's side padding is 24px on both sides
```

Code review (`code-review` skill, level low, target `feat/gel-34-04d-title`): its third diff command, `git diff main...feat/gel-34-04d-title`, showed 2 files (`tests/web/checks/04d-title.mjs` 97 lines, `web/style.css` 3 lines) and it read the `web/style.css` hunk; result `(none)`. Its first two diff commands (`main...HEAD` from the main checkout) came back empty, so the non-empty diff was only seen on the third. At level low the skill skips test files, so `04d-title.mjs` was not reviewed by it; I re-read that file myself.

## What I did not run and why

- Safari, Firefox, Lighthouse and VoiceOver: Varun's by hand (shared rules).
- No check of widths between 320 and 768 px other than the two wide ones (768, 1280), and no 200% text check on the title: the table above shows the title still splits there, so there is nothing to pin.
- The throwaway measuring script lives in `~/.cache/gel34-chrome/04d-title/measure.mjs`, outside the repo, and is not committed.

## What Varun must decide

- Whether 1rem is the right padding. The table shows the gain is small (101 to 78 titles at 100% text, nothing at 200%). 0.75rem gains 5 more titles at 100% and would make the answer panel's text sit 12 px from its edge at 320 px; 1rem keeps 16 px.
- Whether to go further for 200% text. Only a smaller title font below 48rem (not in this brief) would stop long words splitting there.
- Whether to keep `04d-witness` (a synthetic one-word title in the real title element) or drop it and accept that `04d-words` on the CSRD title would also pass on the old padding.
