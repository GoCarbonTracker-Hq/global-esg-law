STATUS: done

# GEL-34 step 04c: the lookup header scrolls the page sideways at 320 px

Branch `feat/gel-34-04c-overflow`, BASE `6590b108d070002d9e2a9228845a4638ee11bfda`. Data: `origin/history` (55c8c2a9c, 3360 records), read-on 2026-11-17. Chrome 157 headless, window 320 px (`Emulation.setDeviceMetricsOverride`, `mobile: false`, as `09-ac6` does), 200% text = `document.documentElement.style.fontSize = "200%"` (root 32 px, asserted in the check).

## Result in one paragraph

Fixed in two rounds, both in `web/style.css`. Round 1 (commit 97303a911): the lookup header was the cause on the first screen. Round 2 (commit d1b6351e8, after the coordinator widened OWNS to the answer panel rules): the answer panel title was the next cause, and `overflow-wrap: anywhere` on `#answer-panel` closes it. `scrollWidth` at 320 px is now 320 at 100% and at 200% text in all three states, for all 1404 laws, and `check.mjs` passes every check including my six. Layout at 768 px and wider is unchanged (0 differences). At 200% text the answer title now breaks inside words (see "What Varun must decide").

## Plan (written before the change)

1. Check first: `tests/web/checks/04c-overflow.mjs`, six verdicts (first screen, CSRD answer, rail opened on kz-advertising-law; each at 100% and 200% text, 320 px window). Limit 320 is a constant in the file. Each verdict also asserts window width, root font and the state, and lists the elements that reach past 320 px when it fails.
2. Measure BASE with it, name the cause from the numbers.
3. Change only the lookup header rules in `web/style.css`; re-measure; measure the law box, date field and example button at 1280, 1024, 800 and 768 px before and after.
4. Run the full recipe, the code review, write this report.
5. Round 2, after the coordinator widened OWNS to the answer panel rules: add `overflow-wrap: anywhere` to `#answer-panel`, re-run the loop over all 1404 laws, the 13-element rect comparison, the full recipe and the code review.

## Measurements before (BASE, check file only)

`document.documentElement.scrollWidth` in a 320 px window:

| State | 100% text | 200% text |
|---|---|---|
| first screen | 320 | 541 |
| CSRD on 2025-06-01 (in force) | 320 | 541 |
| kz-advertising-law, rail opened ("Show all 150 versions") | 320 | 541 |

At 200% text, the same 16 elements reach past 320 px in all three states (selector, width, right edge): `h1#title` 493 / 541; `p.lede` 493 / 541; `div.lookup` 493 / 541; `div.fields` 493 / 541; `div.field` (law) 493 / 541; `label` 493 / 541; `input#law` 493 / 541; `div#match-list` 493 / 541; `ul#match-rows` 493 / 541; `div.field` (date) 493 / 541; `label` 493 / 541; `div.date-row` 493 / 541; `input#date` 276 / 324; `span#date-echo` 193 / 541; `button#example` 493 / 541; `p#load-status` 493 / 541. The header box itself is 224 px (320 minus 2 x 48 px body padding at 32 px root) with content 493 px.

Hidden behind that 541 px, the answer panel already overflowed its box at 200%: `h2[data-field="title"]` box 128 px, content 285 px (CSRD; right edge about 381); 255 px for kz-advertising-law (right edge about 351). The first value is the story 09 worker's 541 px reproduced on this BASE (stories 05 to 08, 06b and 10 did not change it).

## The cause

Found by setting `width: min-content` on each header element at 200%: `.date-row` is 493 px, which is `input#date` 276 + gap 24 + `#date-echo` 193 (`min-width: 10ch` at 32 px). `header`, `.lookup` and `.fields` are `display: grid` with no column template, so their one track is `auto`, and an auto track is at least as wide as its widest item's min-content. That made the track 493 px inside a 224 px box, every grid item stretched to 493, and the page scrolled to 48 + 493 = 541. `#date { min-width: 0 }` did not help because it lets the input shrink but does not lower the min-content size the row reports to the grid. At 100% text the same row needs 255 px and fits in 272.

## The change (only `web/style.css`; no colour, no new breakpoint, no other file)

Round 1, lookup header (commit 97303a911):

1. `header, .lookup, .fields` get `grid-template-columns: minmax(0, 1fr)` (a track that may be narrower than its content). The 48rem block already overrides `header` and `.fields` with their own templates, so 48rem and wider are untouched; `.lookup` keeps one track that is as wide as its column, as before.
2. `.date-row` gets `flex-wrap: wrap`: without it the date input would shrink to about 7 px at 200% (224 - 24 - 193; computed, not measured). With it the date field takes its own line and the echo sits under it.
3. The 48rem block gets `.date-row { flex-wrap: nowrap; }`. Measured with the wrap rule forced on at 1280 and 768 px: the date input goes from 147 to 192 px wide, `#date-echo` wraps under it and `.lookup` grows from 148 to 184 px tall (the row's box is sized from intrinsic widths, 255.33 px, but the date input's flex basis is 12rem). Restoring `nowrap` keeps the 48rem rules as they were.

Round 2, answer panel (commit d1b6351e8):

4. `#answer-panel` gets `overflow-wrap: anywhere`. The title, the codes line and the interim spans inherit it; no further declaration was needed (after it, 0 of 1404 laws are over 320 px, so no rule was added for the codes line or the interim spans).

No `overflow-x: hidden`, no smaller type.

Other files: `tests/web/checks/04c-overflow.mjs` (new, six verdicts) and this report. No `.js`, no other check, no `rail.css`.

## Measurements after

`document.documentElement.scrollWidth` in a 320 px window, at the final commit:

| State | 100% text | 200% text |
|---|---|---|
| first screen | 320 | 320 |
| CSRD on 2025-06-01 | 320 | 320 |
| kz-advertising-law, rail opened | 320 | 320 |

Between the two rounds (header fixed, answer panel not yet): 320 / 320 on the first screen, CSRD 320 / 381, kz 320 / 351 at 100% / 200%. The 381 and 351 were the `h2` title (box 128 px, content 285 and 255 px).

Also read (not in the check, header fix only): at 100% and 200% text, window widths 360, 414, 600 and 767 px, first screen and rail opened on kz-advertising-law: `scrollWidth` equals the window width in all 16 cases.

### Every law, at the final commit

`GEL.showAnswer(id, date)` for each of the 1404 ids in a 320 px window, `scrollWidth` read after each (a scratch probe in /tmp, not committed). Over 320 px:

| Text | Date | Plain / interim answers | Over 320 px |
|---|---|---|---|
| 100% (root 16 px) | 2026-11-17 | 831 / 573 | 0 |
| 200% (root 32 px) | 2026-11-17 | 831 / 573 | 0 |
| 200% | 2000-01-01 | 36 / 1368 | 0 |
| 200% | 2023-05-05 | 510 / 894 | 0 |
| 200% | 2025-06-01 | 679 / 725 | 0 |

Before round 2 (header fixed only) 1240 of 1404 were over 320 at 200% on 2026-11-17: the title `h2`, `p[data-field="codes"]` and, for interim answers, the spans in `#answer-interim` (the hidden `#answer-sentence` shows up in the raw list but is clipped to 1 px and adds nothing). With only the title given the rule, 13 remained (codes and interim spans); on `#answer-panel` it is 0.

## 1280 px and 768 px equality

Rectangles `[left, top, width, height]` of 13 elements (`#title`, `.lede`, `.lookup`, `#law`, `#date`, `.date-row`, `#date-echo`, `#example`, `#load-status`, both `.field`, `#answer-panel`, `#rail`), first screen and CSRD answer, at 1280, 1024, 800 and 768 px, 100% text, before the change and after it: 8 windows x 13 elements, 0 differences (script was a scratch file in /tmp, not committed). The three the brief names:

| Window | `#law` | `#date` | `#example` |
|---|---|---|---|
| 1280 | 440, 52, 400.67, 44 | 856.67, 52, 147, 44 | 440, 112, 308.09, 44 |
| 768 | 296, 52, 176.67, 44 | 488.67, 52, 147, 44 | 296, 112, 308.09, 44 |

Equal before and after.

Round 2 repeated it: the same 13 elements, 4 windows, 2 states, final commit against BASE and against the round 1 commit: 104 element rectangles each, 0 differences in both comparisons (including `#answer-panel`: 440, 214, 672, 517 at 1280 and 296, 214, 448, 634 at 768, first screen unchanged). Below 48rem the layout changes on purpose. At 320 px and 100% text: `#date` 164 to 192 px wide, `#date-echo` moves from beside the date field to under it, `.lookup` 258 to 294 px tall (+36). At 200%: `.lookup` is 224 px wide and 730 px tall instead of 493 wide and 514 tall.

## Result lines

Run from the worktree root with `--ref origin/history --read-on 2026-11-17`, port 8440, CDP 9440.

BASE plus my check file only (commit acdd60e98, before any fix):

```
FAIL 04c-first-200 ... observed: document scrollWidth 541 > 320 (clientWidth 320, body scrollWidth 541); 16 elements reach past 320px: h1#title 493px wide, right edge 541; p.lede 493px wide ...
FAIL 04c-answer-200 ... observed: document scrollWidth 541 > 320 ...
FAIL 04c-rail-200 ... observed: document scrollWidth 541 > 320 ...
check.mjs: 311 passed, 3 failed
```

After round 1, header only (commit 97303a911):

```
FAIL 04c-answer-200 ... observed: document scrollWidth 381 > 320 ... h2 box 128px, content 285px
FAIL 04c-rail-200 ... observed: document scrollWidth 351 > 320 ... h2 box 128px, content 255px
check.mjs: 312 passed, 2 failed
```

Final, after round 2 (commit d1b6351e8; the style.css content of the DONE commit is the same):

```
PASS 04c-first-100 / PASS 04c-first-200 / PASS 04c-answer-100 / PASS 04c-answer-200 / PASS 04c-rail-100 / PASS 04c-rail-200
check.mjs: 314 passed, 0 failed
wcag.py: ok
3360 records checked
CI=1 python3.13 -m pytest -q -k "not all_pairs"
456 passed, 1 deselected in 317.61s (0:05:17)
```

314 = 308 old + 6 mine. Story 04 AC5 did not fail in any run, so no rerun.

Code review (`code-review` skill, level low, target `feat/gel-34-04c-overflow`), run again on the full branch after round 2: it read a non-empty diff that included the new `overflow-wrap: anywhere` hunk and the earlier `web/style.css` hunks (its path filter leaves out `tests/`, so the check file was not in it) and reported no findings. The review agent started in the wrong directory and located the branch itself; its output shows the right diff. I read the check file once more myself: no change.

## What I did not run, and why

- `check.mjs` on BASE without my file: not run on its own; 308 is 314 minus my 6.
- Safari, Firefox, Lighthouse, VoiceOver: Varun's by hand.
- A real browser text-size setting (default font 32 px) instead of an inline `font-size` on `html`: the page's media query is in rem, and a 48rem window under a changed default font size takes the one-column layout; I tested only the inline way `09-ac6` uses.
- Widths other than 320, 360, 414, 600, 767 (below 48rem; 360 to 767 were read after round 1 only, not again after round 2) and 768, 800, 1024, 1280 (rects).
- The place table's own scroll container: story 09's.

## What Varun must decide

1. The date echo under the date field at 320 px and 100% text. It was beside the field before; wrapping was needed for 200% text. Accepted for now (coordinator, 2026-11-18); kept here until he confirms.
2. How the answer title reads at 320 px and 200% text. `overflow-wrap: anywhere` stops the sideways scroll but breaks the title inside words ("Direc / tive (EU) 2022 / /246 / 4 as regar / ds ..."), because the panel's 1.5rem side padding takes 96 px of the 224 px box and leaves 128 px for a 48 px serif title. Seen on a screenshot of the CSRD answer. A smaller panel padding or smaller title type below 48rem would keep whole words on a line; not tested, since it changes the look and the check does not need it.

STATUS: done
