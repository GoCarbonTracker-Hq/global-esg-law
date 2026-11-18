STATUS: blocked

# GEL-34 step 04c: the lookup header scrolls the page sideways at 320 px

Branch `feat/gel-34-04c-overflow`, BASE `6590b108d070002d9e2a9228845a4638ee11bfda`. Data: `origin/history` (55c8c2a9c, 3360 records), read-on 2026-11-17. Chrome 157 headless, window 320 px (`Emulation.setDeviceMetricsOverride`, `mobile: false`, as `09-ac6` does), 200% text = `document.documentElement.style.fontSize = "200%"` (root 32 px, asserted in the check).

## Result in one paragraph

The lookup header was the cause on the first screen and is fixed: `scrollWidth` at 320 px is 320 at 100% and at 200% text. It was not the only cause. Once the header stops widening the page, the answer panel title (`h2[data-field="title"]` inside `#answer-panel`) is next: at 200% text it reaches 381 px (CSRD) and 351 px (kz-advertising-law with the rail open). That rule is not a lookup header rule, so it is outside OWNS. I stopped there. Two of my six checks therefore still fail (`04c-answer-200`, `04c-rail-200`); a one-line rule tested at run time removes it for all 1404 laws (see "Open").

## Plan (written before the change)

1. Check first: `tests/web/checks/04c-overflow.mjs`, six verdicts (first screen, CSRD answer, rail opened on kz-advertising-law; each at 100% and 200% text, 320 px window). Limit 320 is a constant in the file. Each verdict also asserts window width, root font and the state, and lists the elements that reach past 320 px when it fails.
2. Measure BASE with it, name the cause from the numbers.
3. Change only the lookup header rules in `web/style.css`; re-measure; measure the law box, date field and example button at 1280, 1024, 800 and 768 px before and after.
4. Run the full recipe, the code review, write this report.

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

## The change (`web/style.css`, three hunks, no colour, no new breakpoint, no other file)

1. `header, .lookup, .fields` get `grid-template-columns: minmax(0, 1fr)` (a track that may be narrower than its content). The 48rem block already overrides `header` and `.fields` with their own templates, so 48rem and wider are untouched; `.lookup` keeps one track that is as wide as its column, as before.
2. `.date-row` gets `flex-wrap: wrap`: without it the date input would shrink to about 7 px at 200% (224 - 24 - 193; computed, not measured). With it the date field takes its own line and the echo sits under it.
3. The 48rem block gets `.date-row { flex-wrap: nowrap; }`. Measured with the wrap rule forced on at 1280 and 768 px: the date input goes from 147 to 192 px wide, `#date-echo` wraps under it and `.lookup` grows from 148 to 184 px tall (the row's box is sized from intrinsic widths, 255.33 px, but the date input's flex basis is 12rem). Restoring `nowrap` keeps the 48rem rules as they were.

No `overflow-x: hidden`, no smaller type.

## Measurements after

| State | 100% text | 200% text |
|---|---|---|
| first screen | 320 | 320 |
| CSRD on 2025-06-01 | 320 | 381 (h2 title, see Open) |
| kz-advertising-law, rail opened | 320 | 351 (h2 title, see Open) |

No element's box reaches past 320 px any more in any state; what is left is the content of the answer panel's `h2` (CSRD: box 128 px, content 285 px; kz: box 128 px, content 255 px).

Also read (not in the check): at 100% and 200% text, window widths 360, 414, 600 and 767 px, first screen and rail opened on kz-advertising-law: `scrollWidth` equals the window width in all 16 cases, so there is no sideways scroll at those widths.

### The remaining cause, measured over every law

With the header fixed, 320 px and 200% text, `GEL.showAnswer(id, "2026-11-17")` for every one of the 1404 ids: 1240 have `scrollWidth` above 320. The elements whose content passes 320 are the answer panel title (`h2`), `p[data-field="codes"]` and, for interim answers, the spans inside `#answer-interim` (the hidden `#answer-sentence` shows up in the raw list but is clipped to 1 px and does not add to the scroll width). Injecting `#answer-panel { overflow-wrap: anywhere }` as a style tag at run time (not committed) brings it to 0 of 1404. Only `[data-field="title"]` gets it to 13 of 1404 (codes and interim spans remain).

## 1280 px and 768 px equality

Rectangles `[left, top, width, height]` of 13 elements (`#title`, `.lede`, `.lookup`, `#law`, `#date`, `.date-row`, `#date-echo`, `#example`, `#load-status`, both `.field`, `#answer-panel`, `#rail`), first screen and CSRD answer, at 1280, 1024, 800 and 768 px, 100% text, before the change and after it: 8 windows x 13 elements, 0 differences (script was a scratch file in /tmp, not committed). The three the brief names:

| Window | `#law` | `#date` | `#example` |
|---|---|---|---|
| 1280 | 440, 52, 400.67, 44 | 856.67, 52, 147, 44 | 440, 112, 308.09, 44 |
| 768 | 296, 52, 176.67, 44 | 488.67, 52, 147, 44 | 296, 112, 308.09, 44 |

Equal before and after. Below 48rem the layout changes on purpose. At 320 px and 100% text: `#date` 164 to 192 px wide, `#date-echo` moves from beside the date field to under it, `.lookup` 258 to 294 px tall (+36). At 200%: `.lookup` is 224 px wide and 730 px tall instead of 493 wide and 514 tall.

## Result lines

BASE plus my check file only (commit acdd60e98, before the fix):

```
FAIL 04c-first-200 ... observed: document scrollWidth 541 > 320 (clientWidth 320, body scrollWidth 541); 16 elements reach past 320px: h1#title 493px wide, right edge 541; p.lede 493px wide ...
FAIL 04c-answer-200 ... observed: document scrollWidth 541 > 320 ...
FAIL 04c-rail-200 ... observed: document scrollWidth 541 > 320 ...
check.mjs: 311 passed, 3 failed
```

After the fix (commit 97303a911):

```
PASS 04c-first-100 / PASS 04c-first-200 / PASS 04c-answer-100 / PASS 04c-rail-100
FAIL 04c-answer-200 ... observed: document scrollWidth 381 > 320 ... h2 box 128px, content 285px
FAIL 04c-rail-200 ... observed: document scrollWidth 351 > 320 ... h2 box 128px, content 255px
check.mjs: 312 passed, 2 failed
```

314 checks in both runs = 308 old + 6 mine; every old check passes in both runs (the only FAIL lines are mine). Story 04 AC5 did not fail, so no rerun.

```
wcag.py: ok
3360 records checked
CI=1 python3.13 -m pytest -q -k "not all_pairs"
456 passed, 1 deselected in 311.84s (0:05:11)
```

Code review (`code-review` skill, level low, target `feat/gel-34-04c-overflow`): it read a non-empty diff (the three `web/style.css` hunks; its path filter left out the check file under `tests/`) and reported no findings. I read the check file once more myself: no change.

## What I did not run, and why

- `check.mjs` on BASE without my file: not run on its own; 308 is 314 minus my 6.
- Safari, Firefox, Lighthouse, VoiceOver: Varun's by hand.
- A real browser text-size setting (default font 32 px) instead of an inline `font-size` on `html`: the page's media query is in rem, and a 48rem window under a changed default font size takes the one-column layout; I tested only the inline way `09-ac6` uses.
- Widths other than 320, 360, 414, 600, 767 (below 48rem) and 768, 800, 1024, 1280 (rects).
- The place table's own scroll container: story 09's.

## What Varun must decide

1. The answer panel title at 200% text (outside my OWNS). Smallest rule I tested: `#answer-panel { overflow-wrap: anywhere; }` in `web/style.css`, which takes all 1404 laws to `scrollWidth` 320 at 320 px and 200%. A design choice sits next to it: the panel's 1.5rem side padding takes 96 px of the 224 px box at 200% and leaves 128 px for the title; a smaller padding below 48rem would also help (not tested). Until one of these lands, `04c-answer-200` and `04c-rail-200` fail, and so does the story 11 AC for 320 px.
2. Whether the date echo under the date field at 320 px and 100% text is acceptable (it was beside it before; wrapping was needed for 200%).

STATUS: blocked
