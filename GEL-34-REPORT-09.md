STATUS: done

# GEL-34 story 09: browse coverage by place

Worktree `~/GTC/global-esg-law-wt/gel-34-09-browse`, branch `feat/gel-34-09-browse`, BASE 9053af5afaf06709681459c85b2d7d5e99858d4f.

## Plan

Recount first (live, from `web/law-data.json` built with `--ref origin/history --read-on 2026-11-17`): 250 places, 1404 entries, 851 with version rows, 553 without, places by state 140 / 86 / 24. Same as the story.

Guide `responsive-table` (modern-web-guidance) read from the plugin cache on disk (`skills/modern-web-guidance/guides/ui-atoms/responsive-table.md`, identical to the copy in `~/.npm/_npx`), because the brief forbids npx. Used: semantic table with caption, sticky column header, container query (not media query) for the stacked layout, labels injected with ::before from a data attribute. Not used: the scroll wrapper with `tabindex="0"` and `role="region"`, because AC6 asks for no tab stop inside the table and no sideways scroll, so the table never scrolls on its own.

| Piece | Deliverable | Files (one writer each) | Proof |
|---|---|---|---|
| A | draws the grid, legend, totals, table and runs the in-page check | `web/browse.js` | piece C against the real file and the fixtures |
| B | styles, the three grid tokens, the two lines in index.html | `web/browse.css`, three lines in the one `:root` of `web/style.css`, two lines in `web/index.html` | `wcag.py: ok`, reflow check in C |
| C | browser checks, fixtures through `h.addVariant` | `tests/web/checks/09-browse.mjs` | the run: 74 existing checks still pass plus these |

A, B and C start together from the DOM contract below; I integrate, run the checks and commit.

## DOM contract (A writes it, B styles it, C reads it)

```
section#browse-by-place [aria-labelledby=browse-heading] [data-check="ok"|"failed", set by A after drawing]
  h2#browse-heading                      existing, text "Browse by place", untouched
  p#browse-totals                        "<P> places, <L> laws: <S> text stored, <K> link only"   (counted from entries)
  p#browse-read                          "Corpus read <snapshot.read_on> · Snapshot <history_commit first 9 chars>"
  p#browse-check [hidden unless failed]  failure line, see below
  div#browse-grid-block
    div#browse-grid [role="img"] [aria-label=ALT]
      span.cell [data-place=CODE] [data-state="stored"|"link-only"|"none"]   text = CODE, one per key of places, sorted by code
    ul#browse-legend
      li > span.swatch[data-state=...] + text, three items, exact texts:
        "text stored: at least one law with stored text"
        "link only: links and no stored text"
        "no corpus: no law for this place"
  div#browse-table-wrap                  container-type: inline-size, no overflow, no tabindex, no role
    table#browse-table
      caption                            "Laws by place: how many are stored as text and how many are held as links only"
      thead > tr > th[scope=col] x4      "Place", "Instruments", "Text stored", "Link only"
      tbody > tr[data-place=CODE] x one per key of places, sorted by code:
        th[scope=row]                    "<name> (<CODE>)"   e.g. "Andorra (AD)", "US (US)"
        td[data-label="Instruments"]     integer text, equals the next two added
        td[data-label="Text stored"]     integer text: entries of that place with version rows
        td[data-label="Link only"]       integer text: entries of that place without version rows
```

ALT (grid text alternative): "<n> places have at least one law with stored text, <n> places hold links only, <n> places have no corpus. The table below lists every place with its figures."

State of a place, one function over the entries: text stored when some entry of the place has version rows, link only when it has entries and none has version rows, no corpus when it has no entry (draws grey). `data-state` values: `stored`, `link-only`, `none`.

In-page check (every load, after drawing). Inputs: `GEL.data` (places, entries) and the DOM it just drew, read back. Problems found, each a sentence:
1. an entry whose `place` is not a key of `places`: names the place and the entry id;
2. an entry whose scope status (`entry.status`: "stored" or "link only") disagrees with its version rows (stored needs at least one row, link only needs none; any other status value also fails): names the place and the entry id;
3. grid cells, table rows and keys of `places` are not all the same number: names the three numbers;
4. per state, grid cells (counted by `data-state`) differ from table rows classed from the numbers read from the table cells (stored cell above 0: text stored; stored 0 and link only above 0: link only; instruments 0: no corpus): names state and both numbers;
5. a row whose instruments cell differs from stored plus link only: names the place;
6. a column sum read from the table cells differs from the total counted from `entries`: names column and both numbers.
No problem: `data-check="ok"`, `#browse-check` hidden and empty. Otherwise `data-check="failed"`, `#browse-check` visible with "The place figures do not agree: " and the problems joined with "; " (first five, then "and N more"). If `places` is missing, one problem "the data file has no place list" and nothing is drawn but the line.

A wraps `GEL.load` (it cannot edit `app.js`): after the original load resolves it draws. A load failure leaves the section as the bare heading. A draw error is caught, logged with console.error and shown as data-check="failed".

No figure from the story is typed into `web/index.html` or `web/browse.js`. No colour literal outside `:root`, no `http` in `browse.css`.

## Execution log

Pieces A, B and C were built by the first run and committed as `51b67edc0` (section: `web/browse.js`, `web/browse.css`, three tokens in the one `:root` of `web/style.css`, the link and script lines in `web/index.html`) and `435ffc0a0` (`tests/web/checks/09-browse.mjs`). That run stopped when its window closed, before the gates and this report. This run (a second session, same worktree) re-read all five files against the DOM contract above, found them matching, ran the gate set once on the committed tree and wrote the results. No source file was edited in this run.

## Gate set (raw lines, run 2026-11-18 on the committed tree)

```
python3.13 tools/web_data.py --ref origin/history --read-on 2026-11-17 --out web/law-data.json      exit 0
expected: pairs=625 plain=622 interim=3 instruments=216 places=47 csrd=8 date_table=103
check.mjs: 101 passed, 1 failed
wcag.py: ok
3360 records checked
```

Run: 73 of the 74 BASE checks pass plus 28 new `09-*` checks pass (101); the one failure is the known story 04 AC8 line, listed under "What is left". No `09-*` check fails. The AC5 timing check passed at 39 ms ("slow: Loading the law list at 39 ms (limit 500)"), so no rerun was needed. `wcag.py` also printed `ok 'http' occurrences in css: 0` and `ok @import or url( in css: 0`. Pytest was not run (the brief for this run says not to; the story changes no Python file). Lighthouse was not run.

Recount against the story (live, `web/law-data.json`): 250 places, 24 with no entry, 1404 entries, 851 text stored, 553 link only, 140 / 86 / 24 by state. No difference from the story. `python3.13 -I` over the file: `len(places) 250 places with no entry 24`.

## Acceptance criteria

1. Real data file. PASS. `09-ac1` (8 lines). Read from the DOM: `250 cells (140 text stored, 86 link only, 24 no corpus), 250 rows summing to 1404 instruments, 851 text stored, 553 link only; data-check ok`. The one-liner printed `len(places) 250 places with no entry 24`.
2. Fixture XX / YY / ZZ. PASS. `09-ac2`: "XX (one stored law), YY (two link-only laws) and ZZ (no law) draw green, amber and grey" and "the table has three rows (XX 1, 1, 0; YY 2, 0, 2; ZZ 0, 0, 0) and data-check reads ok". Fixtures go through `h.addVariant`; the check serves them through its own server, not `python3 -m http.server`.
3. The check fails when it should. PASS, seen failing, five fixtures (the story asks for two):
   - `09-bad-status`: `The place figures do not agree: XX entry 09-bad-status-1 is marked "stored" but has 0 version rows`
   - `09-bad-place`: `The place figures do not agree: QQ is not a listed place (entry 09-bad-place-1); Instruments: the table adds up to 1 and the entries to 2; Link only: the table adds up to 0 and the entries to 1`
   - `09-link-with-rows`: `... XX entry 09-link-rows-1 is marked "link only" but has 1 version rows`
   - `09-odd-status`: `... XX entry 09-odd-1 is marked "empty" but has 1 version rows`
   - `09-no-places`: `The place figures do not agree: the data file has no place list`, no grid, no table.
4. No figure typed in. PASS. `09-ac4` and `grep -nE '250|1404|851|553|140|86|24|2026-11-17' web/index.html web/browse.js` exits 1 with no hit, so there is no hit to explain.
5. Read date, legend, text alternative. PASS. `09-ac5` (4 lines): "Corpus read", the read date and the 9-character snapshot id; the legend words and one swatch per state; `role="img"` with an `aria-label` that gives the three place counts and points to the table; a "changed" variant shows the line follows the file. The `role="img"` is the one ARIA use beyond UX spec line 989, as the story accepts.
6. Keyboard, 320 px, 200% text. PASS for what a script can read, with two parts not run. `09-ac6` (5 lines): 12 Tab presses never land inside the section and it holds no link, button, field or tabindex; at 1024 px the table is a table with its header row; at 320 px it stacks into one card per place with `::before` labels, the grid cells wrap, nothing reaches past the window, no scroll container; at 320 px and 200% text (root font 32 px) nothing from the section reaches past the window. Finding: at 320 px and 200% the whole page scrolls 541 px wide, with 0 elements of this section reaching past the window; the width comes from the story 04 lookup header (493 px), outside this story. Not run, by hand later: Lighthouse (spec item 1), and the forced colours, reduced motion and colour-vision emulations of item 4.
7. Click does not change the list; links land on the heading. PASS for the click, PARTLY run for the links. `09-ac7`: a click on a grid cell and a click on a table row leave the match list, law box, date and answer as they were. A stub link to `#browse-by-place` brings the heading into view above the grid and makes the section `:target`. The real "Browse by place" link of each answer variant and the no-match message (stories 05 and 06) are not on this base (`grep browse-by-place web/*.js web/index.html` finds only `browse.js` and the section id), so the integration run after the merge must follow each one.
8. Diff. PASS. `git diff --stat main..HEAD -- tools/coverage_grid.py assets/coverage-grid.svg README.md` prints nothing. The README grid reads 140 / 110 / 0 (text stored / link only / no corpus); this page reads 140 / 86 / 24, because the 24 places with an empty scope file draw grey here and amber in the README. Varun decided 2026-11-17 that the README is fixed separately.

## What is left

- Story 04 AC8 fails: `FAIL AC8: the load requested only index.html, the stylesheet, one request per script and the data file | observed: want / /answer.js /app.js /browse.js /data.js /dates.js /find.js /interim.js /law-data.json /style.css`, against `load requested: / /answer.js /app.js /browse.css /browse.js /data.js /dates.js /find.js /interim.js /law-data.json /style.css`. The only difference is `/browse.css`; it is known for any story that links its own stylesheet and was not fixed. The coordinator decides, at the merge, whether `check.mjs` lists the extra stylesheets.
- Integration run after the merge: follow the real "Browse by place" link of each answer variant and the no-match message (AC7).
- By hand later: Lighthouse on each page state, VoiceOver, forced colours, reduced motion, colour-vision emulation. All not run, boxes left unticked.
- `pytest` not run in this run.

## What Varun must decide

- Whether the grid keeps meaning by fill colour alone. Each cell carries its code and the table beside it holds the figures, so the state is readable there, but in forced colours the three fills are replaced and the grid cells look alike. Not changed here (the story fixes the colours).

## Changes to seams

- `web/browse.js` wraps `GEL.load` and draws after the original load resolves; another script that wraps `GEL.load` must call the previous one and await it, or the section is never drawn.
- `web/index.html` gains `<link rel="stylesheet" href="browse.css">` and `<script defer src="browse.js"></script>` above `app.js`; `web/style.css` gains `--grid-stored`, `--grid-link-only`, `--grid-none` in the one `:root`.
- `tests/web/check.mjs` story 04 AC8 expects no extra stylesheet, so it fails with `/browse.css` (see "What is left").
- The section keeps `id="browse-by-place"` and the heading `id="browse-heading"`, text "Browse by place", for story 06's link.

## Report

STATUS done. All eight criteria have a result. check.mjs 101 passed, 1 failed (known story 04 AC8 on `/browse.css`); wcag.py ok; corpus 3360 records checked. Seven criteria pass as written, AC6 passes for what a script reads, AC7's real links wait for the integration run. Lighthouse and by-hand audits not run.

## Next

- Merge this branch after the other four and rerun check.mjs on the merged tree.
- Decide how check.mjs story 04 AC8 treats stylesheets that other stories link.
- Follow the real "Browse by place" links of stories 05 and 06 once merged.
- Run Lighthouse, VoiceOver, forced colours and reduced motion on the section by hand.
