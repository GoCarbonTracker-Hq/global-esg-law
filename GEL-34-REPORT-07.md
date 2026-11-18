STATUS: working

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
(filled in below)
