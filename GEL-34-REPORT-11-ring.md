STATUS: done

# GEL-34 story 11 part 2: the focus ring on the selected rail row

Branch `feat/gel-34-11-ring`, BASE `45c676f40190edb4453db43bf4b719ac09c76fc5` (local `main` 171b765d7 plus the part 1 contrast test). Data ref `origin/history` (55c8c2a9c, 3360 records) in every call.

## Result in one line

The inset ring works: one CSS rule, `pairs=37 failing=0` (BASE `pairs=39 failing=1`), `check.mjs: 272 passed, 0 failed` (BASE plus the new checks: `271 passed, 1 failed`, the one failure being the new ring check). One thing to look at by eye: on the selected row the ring's left side now touches the 4px edge from the inside, so the left reads as one 6px bar and the other three sides as a 2px frame (see "What Varun must decide").

## Plan (written before the code)

1. Browser check first (`tests/web/checks/11-ring.mjs`), run on the unmodified `web/rail.css` (BASE) to see it fail: it focuses the selected rail button by real Tab presses and reads the ring band and the li's 4px left-border strip.
2. The fix: `.rail-row:focus-visible { outline-offset: -2px; }` in `web/rail.css`. An inset ring sits inside the button over the row's own background, never over the li border, and no ancestor can clip it.
3. Re-run the check (must pass) and `tests/test_web_contrast.py`. The contrast test is expected to need one change, because it drops a rule that holds only `outline-offset` (the rule has no colour) and so cannot see the new offset.
4. wcag.py, check_corpus.py, full pytest, `code-review` at low on the branch.

## The rule and why

```css
/* web/rail.css, after button.rail-row:hover */
.rail-row:focus-visible { outline-offset: -2px; }
```

The rail row is a `<button class="rail-row">` flush inside an `<li>` whose `border-left` is 4px, and `li.rail-current` colours that border `--link`. The global ring (`web/style.css:56`, 2px, offset 2px, `--link`) starts 2px out and is 2px wide, so on the left it covered the strip from 2 to 4px: `--link` on `--link`. With offset -2px the band lies from the button's own edge 0 to 2px inward. The selector `.rail-row:focus-visible` (0,2,0) beats the global `:focus-visible` (0,1,0), so the computed offset on every rail row is -2px; the global rule is untouched, so the Copy citation button, links, the date field and the rest keep offset 2px. No colour literal, no second `:root`, no removed outline (`wcag.py: ok`).

I used the recommended inset ring, not the outside-offset fallback. The outside fallback (offset 4px) would put the ring band against the outer side of the strip, which is as merged as the inset ring is on the inside, and its top and bottom sides would reach into the neighbouring rows (the rows sit flush, li min-height 44px).

## Ring geometry read in Chrome (numbers)

Same page, same row (`eu-csrd-2022-2464`, 2025-06-01, the row "2025-04-17 consolidated"), focused by Tab, `:focus-visible` true, viewport 1280 wide (a separate throwaway script, not committed; the harness check reads the same numbers at its own viewport, where BASE failed with "ring band 24 to 26 lies on the edge strip 24 to 28"):

| | button box left | li strip (4px border-left, `--link`) | outline-offset | ring band on the left | overlaps the strip |
|---|---|---|---|---|---|
| BASE | 172 | 168 to 172 | 2px | 168 to 170 | yes, the whole band |
| fixed | 172 | 168 to 172 | -2px | 172 to 174 | no, it is inside the button |

Outline width 2px, style solid, colour rgb(31, 111, 74) in both. Zoomed screenshots (4x) were looked at by eye: BASE shows the ring merged into the edge on the left and a frame on the other three sides; fixed shows the 4px edge with a 2px frame inside the button, touching the edge. They are in `~/.cache/gel34-chrome/story-11-ring/ring-base.png` and `ring-fix.png`, not committed.

No ancestor of the row clips (`overflow` is visible all the way up), so nothing cuts the ring.

## The check, and the proof it fails on BASE

`tests/web/checks/11-ring.mjs` (5 verdicts, tag `11-ring`). It opens the `ok` variant, chooses CSRD (`eu-csrd-2022-2464`) and 2025-06-01, focuses the date field and presses Tab (a real DevTools key press, so `:focus-visible` matches) until the focused element is the selected rail button; then reads `getComputedStyle` and `getBoundingClientRect`. The expected side is two constants the story and the CSS comments state, a 4px edge and a 2px ring, plus the link colour constant `rgb(31, 111, 74)` that `08-cite.mjs` already uses. It checks:

1. Tab reaches a `.rail-row` inside `li.rail-current`.
2. The li's left edge is 4px and `--link`, and the ring band on the left (button left minus offset minus width, to button left minus offset) does not overlap the strip.
3. The ring is solid, 2px, link colour, and no clipping ancestor cuts the ring box.
4. A rail row outside `li.rail-current` (reached by Tab) shows a solid 2px link-colour ring with `:focus-visible`.
5. The Copy citation button (`#citation-copy`, reached by Tab) shows the same.

Proof on BASE: the check was written and run before the rule existed, so `web/rail.css` was the BASE file (commit `aef043cb8`, the check alone, on top of BASE). Result in `base-run.txt`:

```
FAIL 11-ring: the selected row: the li's left edge is 4px in the link colour and the ring band on the left side does not overlap it (ring 2px, offset 2px) | observed: ring band 24 to 26 lies on the edge strip 24 to 28
PASS 11-ring: (the other four)
check.mjs: 271 passed, 1 failed
```

After the rule (commit `07893ca3a`): the same five PASS, offset in the label now `-2px`, `check.mjs: 272 passed, 0 failed`.

## The contrast test needed one change

The test dropped a rule that holds only `outline-offset` (it keeps a rule only if it has a colour, a fill, an edge, a ring or an opacity), so with the new rule it still printed `pairs=39 failing=1`. It also tests the ring against a border by `offset < border width`, which is wrong for a negative offset. Changes in `tests/test_web_contrast.py`, nothing else, no threshold loosened, no pair dropped by hand, no exception:

- `Rule` gets `ringw` (the `outline` shorthand's width; none given means 3px, CSS "medium"); an offset-only rule is now kept.
- The ring-on-edge test is `offset < border width and offset + ring width > 0` (the band from offset out to offset + width reaches into the border's 0 to width). For the old offsets this is the same as before.
- CSS alone cannot say which control sits flush inside which border, so an offset-only focus rule speaks for the edges of its own stylesheet (`rail.css` for the rail's edges): the global ring's offset is replaced by the largest such offset in that file. Stated in the docstring.
- One new unit test pins it: with `:focus-visible{outline:2px ...;outline-offset:2px}` and a 4px link edge, no override fails (ratio 1.0); an override of -2px clears it; -1px does not (the band 1px wide still reaches into the strip); and a -2px override in another stylesheet does not.

`pairs` fell from 39 to 37: the two pairs that existed only because the ring lay on the 4px edge (ring on the page-coloured placeholder strip, ring on the link-coloured strip) are gone with it. Every other pair is unchanged (the ring against page and panel 6.12 and 5.57, against the selected tint 5.57; the two ring-gap lines for the Copy citation button and the coverage cells are still listed).

I did not run the contrast test against a copy of `rail.css` with a -1px rule (a temporary copy needed a delete the sandbox refused); the -1px case is pinned by the unit test above instead.

## Results (pasted)

```
python3.13 tests/test_web_contrast.py            -> pairs=37 failing=0
~/.cache/gel34-py311/bin/python tests/test_web_contrast.py -> pairs=37 failing=0
~/.cache/gel34-py311/bin/python -m pytest -q tests/test_web_contrast.py -> 8 passed in 0.04s
python3.13 tests/web/wcag.py                      -> wcag.py: ok
python3.13 tools/check_corpus.py                  -> 3360 records checked
node tests/web/check.mjs (BASE + new check)       -> check.mjs: 271 passed, 1 failed   (the ring check)
node tests/web/check.mjs (with the rule)          -> check.mjs: 272 passed, 0 failed
CI=1 python3.13 -m pytest -q -k "not all_pairs"   -> 458 passed, 1 deselected in 323.19s (0:05:23)
```

Story 04 AC5 (500 ms) did not fail in either run, so there was no rerun. BASE for the pytest line was `1 failed, 456 passed, 1 deselected`; the goal was `457 passed, 1 deselected`, plus the one unit test added here makes 458, which is what ran: nothing failed, nothing skipped.

## Code review (low) on the branch

Ran `/code-review low feat/gel-34-11-ring`. It read a non-empty diff (`git diff main...feat/gel-34-11-ring`: 4 files, 634 insertions; BASE is not `main`, so part 1's test and report are in it) and answered `(none)`. At level low it skips test files, so it looked at `web/rail.css` and not at `tests/test_web_contrast.py` or the new check; I re-read those two myself and found nothing to change.

## What I did not run, and why

- Safari, Firefox, Lighthouse, VoiceOver, NVDA: no other browser here and nothing to install; Varun's, by hand.
- A pixel-level read of the ring colour on the selected row (the check reads the computed outline and the geometry; the colour pairs are the contrast test's). I looked at the 4x screenshots by eye instead.
- Forced-colours mode with the new ring: `07-AC9` (forced colours, left border kept) passes, but it reads only the border, not the outline; the ring in forced colours was not read.

## What Varun must decide

- The look on the selected row: the inset ring touches the 4px `--link` edge from inside, so the left side reads as a 6px green bar and the top, right and bottom as a 2px frame. It meets every pair in the test and changes the unfocused/focused state clearly, but it is the one visible change of this story. If it should not touch the edge, the row needs a gap (for example 2px of `margin-left` on `.rail-row`, a layout change on part of the rail), which is more than one CSS line; say if you want it.
- The contrast test's same-stylesheet rule for an offset-only override is a model decision (CSS alone cannot say which control sits inside which border). It is in the docstring; say if you want it stricter, for example only for the selector the override names.

STATUS: done
