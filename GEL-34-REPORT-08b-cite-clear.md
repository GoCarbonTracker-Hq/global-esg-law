STATUS: done

# GEL-34 batch 4, unit D: 08b-cite-clear

## Plan

- `web/cite.js`: one function `empty()` that empties `#slot-citation`, registered on `GEL.onNoMatch` and `GEL.onClear`, the way `web/rail.js` registers its `empty`. Nothing else in `cite.js` holds the last answer: `last` and `timer` belong to the copy status message (and `draw` already leaves them alone on every redraw), and the status span is removed with the slot, so they are left as they are.
- `tests/web/checks/08b-cite-clear.mjs` (tags `08b-clear`, `08b-nomatch`): CSRD on 2025-06-01 shows the line and the button; an unknown-law address over it leaves the slot with no children and no text; CSRD again draws the same line; the same through `GEL.showNoMatch` called directly as `06-variants.mjs` does. The line is written out in the check from `expected.json` (title, in-force date, kind, source link, read date, snapshot) and the story's format, not read from the page.
- Proof it fails on BASE: swap `web/cite.js` for its BASE copy (`git show 23e47d77188aa67f3054c3b707157be3b80faa69:web/cite.js`), run the full `check.mjs`, restore.

## The change and why

Before: `GEL.clearAnswer()` and `GEL.showNoMatch()` left the last answer's citation line and Copy citation button in `#slot-citation` (hidden, but the previous answer's text still in the page). Now both empty the slot. The next `GEL.onAnswer` draw rebuilds it as before.

Commit `8c41eae6c`: `web/cite.js` +7 lines, `tests/web/checks/08b-cite-clear.mjs` new. `check.mjs`, the other checks and every other file are untouched.

## Results

On BASE with the new check, `web/cite.js` as BASE (2 expected failures, the two "empty" verdicts; the two "draws again" verdicts pass on BASE, as they should):

```
FAIL 08b-clear: an unknown-law address loaded over a shown CSRD answer empties #slot-citation: no children, no text | observed: unknown law: #slot-citation child nodes: got 2, want 0; unknown law: #slot-citation text: got "Directive (EU) 2022/2464 as regards ...
PASS 08b-clear: CSRD on 2025-06-01 shown again after the clearing draws the same line and the button again
FAIL 08b-nomatch: a no-match answer shown over a CSRD answer empties #slot-citation: no children, no text | observed: no-match: #slot-citation child nodes: got 2, want 0; no-match: #slot-citation text: got "Directive (EU) 2022/2464 as regards ...
PASS 08b-nomatch: CSRD on 2025-06-01 shown again after the no-match answer draws the same line and the button again
check.mjs: 391 passed, 2 failed
```

With the change (BASE baseline was 389 passed, 0 failed; the four new checks make 393):

```
PASS 08b-clear: an unknown-law address loaded over a shown CSRD answer empties #slot-citation: no children, no text
PASS 08b-clear: CSRD on 2025-06-01 shown again after the clearing draws the same line and the button again
PASS 08b-nomatch: a no-match answer shown over a CSRD answer empties #slot-citation: no children, no text
PASS 08b-nomatch: CSRD on 2025-06-01 shown again after the no-match answer draws the same line and the button again
check.mjs: 393 passed, 0 failed
```

The story 04 AC5 "Loading the law list" check passed on the first run, so no rerun was needed.

```
wcag.py: ok
3360 records checked
pairs=37 failing=0
467 passed, 1 deselected in 401.70s (0:06:41)   # CI=1 python3.13 -m pytest -q -k "not all_pairs"; same as the baseline
```

Code review (`code-review` skill, level `low`, target `feat/gel-34-08b-cite-clear`): the skill ran as its own forked reviewer. It diffed the branch (2 files, 78 insertions: `web/cite.js` and the new check) and returned no findings, so nothing was changed after it.

## Not run

- Safari, Firefox, VoiceOver and a screen reader's announcement of the emptied slot: Varun's by hand.
- A real click on Copy citation after a redraw: story 08's own checks (`08-ac4` to `08-ac8`) cover the button and still pass in the same run.

## Varun must decide

Nothing. One note: `cite.js` keeps `last` (the previous copy status message, used to add a no-break space on a repeat) across a clear. It is not part of the answer and `draw` already keeps it across answers, so it was left alone. Say so if it should be reset on clear too.
