STATUS: working

# GEL-34 story 08: copy a citation (report)

## Plan

Contract shared by the three pieces (fixed here so they can be written at the same time):

- `GEL.cite.build(detail, data)` returns the line (string) when `detail.state === "plain"`, else `null`. The row is the `detail.entry.versions` entry whose `commit` equals `detail.interval.commit`. `GEL.cite.draw(detail)` empties `#slot-citation` and, for a plain answer, draws the line and button; it is registered with `GEL.onAnswer`.
- DOM inside `#slot-citation`: `<p id="citation-line">`, `<button id="citation-copy" type="button" command="--copy" commandfor="citation-line">Copy citation</button>`, `<span id="citation-status" role="status">` beside the button, outside it. Nothing else.
- Path: one registration. `"CommandEvent" in window` decides at load: native (listener for the `command` event on the line, `event.command === "--copy"`) or fallback (click listener on the button). The page logs `console.info("cite: invoker path")` or `console.info("cite: fallback path")` once at load.

| Piece | Deliverable | Files (one writer each) | Check that proves it done |
|---|---|---|---|
| A | the line, the button, the copy function, the styles, two lines in index.html | web/cite.js, web/cite.css, web/index.html (my two lines only) | node --check; wcag.py ok; page checks (C) |
| B | the Python probe: the expected lines built from query.lookup | tests/web/cite_expected.py | runs on origin/history, exits 0, both fixed strings equal the story's |
| C | the browser checks for AC1 to AC9 | tests/web/checks/08-cite.mjs | node --check; the full check.mjs run |

Order: A, B and C start together. C cannot run Chrome until A exists, so C only syntax-checks; I run check.mjs, read the failures and fix (or send the piece back to its one writer). I commit per piece.

## What I did
(filled in as the work goes)
