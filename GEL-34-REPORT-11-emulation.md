STATUS: done

# GEL-34 story 11, unit 11-emulation: Chrome emulation, zoom and text-spacing rows

Branch `feat/gel-34-11-emulation`, BASE `4a2da624bf8c2228e944a53a4a8d49371597582f` (local `main`), corpus ref `origin/history` (55c8c2a9c, 3360 records), read on 2026-11-17. Browser: Google Chrome 157.0.8103.79, headless (`--headless=new`), clean profile. Run 2026-11-18. Ports 8510 and 9510. Safari, Firefox, Lighthouse and VoiceOver were not touched.

## Plan

This plan was written into the report after the file existed (the order of work was the order below). One new file, `tests/web/checks/11-emulation.mjs` (tags `11e-*`). Nothing else changed (`web/`, `check.mjs` and the other checks are untouched). One section per row, each with its own cleanup so the later extensions (`11-ring`, `11-whole-page`) run in the default window:

| Section | Rows | What it does | Check that proves it |
|---|---|---|---|
| r26 | R26 | real Tab to Copy citation and to the selected rail row, read the computed ring, save two screenshots each | `11e-r26-copy`, `11e-r26-row` |
| r29 | R29 | `Emulation.setEmulatedMedia forced-colors: active`; label, edge, borders and ring from computed styles; one screenshot | `11e-r29-label`, `-edge`, `-borders`, `-ring`, `-shot` |
| r30 | R30 | `prefers-reduced-motion: reduce`; computed transition and animation, running animations at the first frame, accessibility tree; a control run without the emulation | `11e-r30-control`, `-nofade`, `-none-anywhere`, `-announced` |
| r31 | R31 | `Emulation.setEmulatedVisionDeficiency` for each option the browser lists; cues that do not rely on colour; one screenshot per option | `11e-r31-list`, `-rail`, `-links`, `-states`, `-error`, `-repeatable`, `-<option>` |
| r32, r33a, r33b, r36 | R32, R33, R36 | the 21 states in a 640 px window (200% zoom), in a 1280 px window with text spacing, in a 640 px window with text spacing, and in a 320 px window (400% zoom): text clipped, spilling, overlapping or lost; sideways scroll; each control reached and used | `11e-r32-NN`, `11e-r33a-NN`, `11e-r33b-NN`, `11e-r36-NN` (NN = S01 to S21) and one `-field` verdict per sweep |

Expected values (the 21 states and their dates and wording, the 2 px ring, the 4 px edge, the WCAG 1.4.12 numbers 1.5, 0.12em, 0.16em, 2em) are written in the file from the story and the UX spec. The 21 states are copied from `11-whole-page.mjs` (I may not import from it: it exports only `run`).

## The change and why

`tests/web/checks/11-emulation.mjs`, 753 lines, 111 checks. Window sizes: the story's 1280 px window is taken as 1280 x 720; 200% zoom is 640 x 360 CSS px and 400% is 320 x 180 (`Emulation.setDeviceMetricsOverride`, device scale factor 1: layout in CSS px is what zoom changes; real Ctrl-plus is not driven).

What the page-side audit reads (per state, from boxes and computed styles only):
- `clipped`: an element with overflow other than visible that holds more than it shows (scrollWidth or scrollHeight over its box), the visually-hidden helper excluded.
- `spill`: a text line box (Range.getClientRects of every visible text node) outside the border box of its own element, or outside a clipping ancestor.
- `overlap`: two text line boxes that cover each other by more than 1 px across and 2 px down.
- `lost`: a text line box left of the page edge or right of the window; the page scrolling sideways is a separate line.
- `field`: the value of the one-line law box measured with the canvas text width against its content box (an input has no text node to read).
- controls, in each state: every control the state shows (`#law`, `#date`, `#example`, answer links and buttons, rail rows, "Show all N versions", Copy citation, match rows) must be inside the window across and not covered at its centre (`elementFromPoint`). Then one journey with real mouse and key events: click the law box, type CSRD, click its match row (focus returns to the law box), click the date field and type the digits of 2025-06-01 (the field's own order is tried: this Chrome takes day-month-year although `navigator.language` is en-US; its field shows 01.06.2025), see "In force since 2025-04-17", click the rail row 2023-01-05, click Copy citation and read "Copied". The no-match answer's "Browse by place" link is clicked and must scroll its heading into the window. S02 (load failure) has no data, so only reachability of the controls is read there.
- text spacing: one `<style>` injected after the state is reached: `*,*::before,*::after{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}` and `p{margin-bottom:2em!important}` (the usual 1.4.12 bookmarklet). The verdict also reads the body's computed letter, word and line spacing back, so it cannot pass on a page where the injection did not take.

## Findings

One Fail, in four places: **the law box is a one-line field and a title wider than its box is cut off.** Element `input#law`; measure: canvas text width minus the content box width (clipped at the content box: a screenshot shows the right padding stays empty).

| Run | States where the value is cut | Examples (state, cut, box) |
|---|---|---|
| R32, 640 px, no spacing | 12 of 21: S03 S04 S05 S06 S07 S09 S10 S12 S13 S14 S17 S18 | CSRD (S03) cut by 28 px in a 566 px box; EUDR (S07) by 911 px |
| R33 at 1280 px with spacing | 13 of 21 (those 12 plus S11) | CSRD by 426 px in a 336 px box; EUDR by 1587 px |
| R33 at 640 px with spacing | 13 of 21 | CSRD by 196 px in 566 px |
| R36, 320 px | 13 of 21 | CSRD by 348 px in a 246 px box; EUDR by 1231 px |
| reference, plain 1280 px, no spacing (not a row, printed as a note) | 13 of 21 | CSRD by 219 px in a 375 px box; EUDR by 1102 px |

So this is not caused by zoom or spacing: at the plain 1280 px window the law box is 375 px wide beside the title and already cuts the CSRD title (every 1100 px screenshot shows it, for example `r31-achromatopsia.png`: "...corporate sust"). The full title is in the answer heading under it. Everything else measured is clean in all 84 state runs: no clipped element, no text leaving its box, no overlap, no lost text, no sideways scroll, every control reachable and working (193 control checks per sweep).

Second observation, not a Fail: in forced colours the version in force keeps its label ("in force on 2025-06-01"), `aria-current="true"` and a solid 4 px left edge, but the edge is the same white line on every rail row (Chrome replaces the border colours with one system colour), so the edge no longer tells that row from its neighbours. The label and aria-current do. The tint is gone, as expected.

## Rows for the results table

R26 | Result: Not run (a person has not looked; the script half passed) | method: `11-emulation.mjs` `11e-r26-copy`, `11e-r26-row`: real Tab (6 presses to Copy citation, 8 to the selected rail row), :focus-visible matches, ring computed solid 2px rgb(31, 111, 74), two screenshots each saved (a close crop at 2x and the whole 1100x800 window) | Chrome 157.0.8103.79 headless | evidence: `~/.cache/gel34-chrome/11-emulation/shots/r26-copy-citation-ring.png` (307x152), `r26-selected-rail-row-ring.png` (544x190), `r26-copy-citation-ring-window.png`, `r26-selected-rail-row-ring-window.png` (1100x800). Not judged by the script: whether the ring reads clearly against the fill and the tint; that is the picture, for Varun (the geometry is R25).

R29 | Result: Pass for what a script measures; the looking and any other palette are not run | method: `11e-r29-label`, `-edge`, `-borders`, `-ring`, `-shot`: `Emulation.setEmulatedMedia forced-colors: active` (matches, Canvas rgb(0, 0, 0), text rgb(255, 255, 255)); the CSRD answer on 2025-06-01 and its rail | Chrome 157.0.8103.79 headless | evidence: the row in force says "in force on 2025-06-01" and has aria-current, no other row does; its edge is solid 4px rgb(255, 255, 255), 21:1 against Canvas; law box, date field, example button and Copy citation borders solid 1px, 21:1 against their own background; the rail dividers are visible; the ring on Copy citation and on the selected rail row is solid 2px rgba(0, 230, 255, 0.8), 8.7:1 against the element and against Canvas; picture `r29-forced-colors-csrd.png`. Finding above: the edge is the same on every row. Not run: a Windows high-contrast theme, other palettes (Chrome's one emulated palette only), a person looking at the picture.

R30 | Result: Pass for what a script measures; whether it is spoken is VoiceOver's (R28) | method: `11e-r30-control`, `-nofade`, `-none-anywhere`, `-announced`: `prefers-reduced-motion: reduce`; a MutationObserver reads the style at the first frame after the text appears | Chrome 157.0.8103.79 headless | evidence: with reduce, `#citation-status` transition-duration 0s, animation none, opacity 1 and no running animation at the first frame, and no element of the page has a transition or animation; without reduce the same read finds transition `opacity 0.2s`, opacity 0 at the first frame and a running CSSTransition (so it can see a fade); in Chrome's accessibility tree the element is a status region, live polite, atomic, not ignored, empty before the click and holding "Copied" after.

R31 | Result: Not run by a person (the script half passed) | method: `11e-r31-list`, `-rail`, `-links`, `-states`, `-error`, `-repeatable`, `-blurredVision`, `-reducedContrast`, `-achromatopsia`, `-deuteranopia`, `-protanopia`, `-tritanopia` (the six options are read from Chrome's own protocol enum, the ones DevTools lists) | Chrome 157.0.8103.79 headless | evidence: the three CSRD rail rows read differently and the one in force says "in force on 2025-06-01"; all 4 visible links are underlined; four answer states (in force, before the first version, repealed, not yet in force) open with different text; a bad date shows "Enter a date in the form 2025-06-01." and a 2px border against 1px; two unemulated screenshots are the same picture and each option's picture differs from it and from every other option. The emulation is a filter on painting, so computed styles read the same under every option by construction: the script shows the cues exist, not what a person sees. Pictures (1100x800, CSRD answer): `~/.cache/gel34-chrome/11-emulation/shots/r31-none.png`, `r31-blurredVision.png`, `r31-reducedContrast.png`, `r31-achromatopsia.png`, `r31-deuteranopia.png`, `r31-protanopia.png`, `r31-tritanopia.png`.

R32 | Result: Fail (one finding; every other measure clean) | method: `11e-r32-01` to `-21` and `11e-r32-field`: the 21 states in a 640 x 360 window | Chrome 157.0.8103.79 headless | evidence: 21 of 21 state verdicts Pass (26381 text boxes, no clip, spill, overlap or lost text, scrollWidth 640, 193 control checks); `11e-r32-field` Fail: the law box cuts its value in 12 states, CSRD by 28 px in a 566 px box, EUDR by 911 px. Not judged: a person at a real 200% zoom, Safari (R34).

R33 | Result: Fail (the same single finding; every other measure clean) | method: `11e-r33a-NN` (1280 x 720) and `11e-r33b-NN` (640 x 360) with the 1.4.12 values injected, and a `-field` verdict for each | Chrome 157.0.8103.79 headless | evidence: 42 of 42 state verdicts Pass (about 26500 text boxes per sweep, spacing read back on the body as 1.92px, 2.56px, 24px); `11e-r33a-field` Fail in 13 states (CSRD cut by 426 px in a 336 px box), `11e-r33b-field` Fail in 13 states (CSRD by 196 px in 566 px). Not judged: whether the spaced page still reads well, Safari (R34).

R36 | Result: Fail (the same single finding; every other measure clean) | method: `11e-r36-01` to `-21` and `11e-r36-field`: the 21 states in a 320 x 180 window | Chrome 157.0.8103.79 headless | evidence: 21 of 21 state verdicts Pass (scrollWidth 320 in every state, 26650 text boxes, 193 control checks); `11e-r36-field` Fail in 13 states (CSRD by 348 px in a 246 px box). How it differs from R35 (Pass): both are a 320 CSS px wide layout, so the sideways-scroll reading is the same number again (320) and adds nothing; R35 used a 900 px tall window with root text at 100% and 200%. R36 adds a 180 px tall window (a quarter of 720, as 400% zoom of the window gives), and what R35 never measured: text clipped, spilling, overlapping or lost, and the controls used in every state (law box, date field, match row, rail row, Copy citation, the Browse by place link). It does not drive Chrome's real zoom (device scale factor stays 1).

## What each verdict cannot judge

A script reads boxes, computed styles, the accessibility tree and the page's own answers. It cannot see colour as a person does, say whether a layout reads well, hear a screen reader, or feel a real zoom. No row above is a pass for the looking: R26 and R31 are "Not run by a person" for that reason; R29 and R30 are Pass only for the measured part.

## Proof each verdict can fail (scratch copies outside the repo)

Script `~/.cache/gel34-chrome/11-emulation/mut.py` copies `web/` and the harness to `~/.cache/gel34-chrome/11-emulation/mut/<name>/`, applies one edit (CSS appended to the last stylesheet, a one-line edit of a `web/` file, or a one-line edit of the copied check), runs only the named sections, and prints the failing tags. All 31 mutants ran on the first commit of the file. After the review fixes the eleven that exercise the changed code (nospacing, nolabel, noedge, noborder, noring, nodivider, spacingonly, fieldfits, clip, lostleft, and the new browsepad) ran again on the fixed file with the same outcome; the other mutants were not re-run after the fixes (their code path is unchanged, apart from the origin line in the sweep, which `clip` and `lostleft` exercise).

| Mutant | Edit | Verdicts that failed |
|---|---|---|
| clip | `#example` max-width 6rem, overflow hidden | all 21 `r32` state verdicts (clipped and spill); also all `r33a` and `r36` ones (`clip33`) |
| spill | `#browse-grid .cell` 0.5rem wide | 20 of 21 `r32` verdicts (S02 has no grid): 250 text boxes leave their box, 244 pairs overlap |
| overlap | `p { line-height: 0.5 }` | all 21 (overlap and spill) |
| lostleft | `header { position: relative; left: -400px }` | all 21 (text left of the page) |
| sideways | `body { min-width: 700px }` | all 21 (scrollWidth 700 in 640, text past the window) |
| covered | `.lookup::after` over the controls | all 21 `r32`, and all `r33a` and `r36` (`covered36`): "covered at its centre by div.lookup" |
| norailclick | `button.rail-row { pointer-events: none }` | 20 of 21 (S02 has no journey): rail row covered, date not changed |
| copyfails | `writeText` renamed | 20 of 21: confirmation reads "Copy failed" |
| spacingonly | `#date-echo { width: 10ch; overflow: hidden }` | `r32` state verdicts Pass, `r33b` all 21 Fail (clips only under spacing) |
| nospacing | injected CSS spoiled | all 21 `r33b`: "letter-spacing is normal, want 1.92px" |
| fieldfits | `#law { font-size: 0.3rem }` | none: the `r32-field` verdict Passes, so it is not always red |
| browsepad | `#browse-by-place { scroll-margin-top: 600px }` | `r32-08` and `r36-08` only: heading at 625 px in a window 360 and 180 px tall |
| nolabel | rail label of the row in force emptied | `r29-label`, `r31-rail` |
| noedge | `.rail-list li { border-left: 0 }` | `r29-edge` |
| noborder | `#law { border: 0 }` | `r29-borders` |
| nodivider | `.rail-list li { border-bottom: 0 }` | `r29-borders` |
| noring | `:focus-visible { outline: none }` | `r26-copy`, `r26-row`, `r29-ring` |
| ring3 | ring 3 px | `r26-copy`, `r26-row` |
| shotscale | screenshot scale 1 in the check copy | `r26-copy`, `r26-row` (picture width) |
| jpeg | screenshots as JPEG in the check copy | `r26-*`, `r29-shot`, `r31-*` (not a PNG) |
| fade | reduced-motion rule removed from `cite.css` | `r30-nofade`, `r30-none-anywhere` |
| notransition | page transition removed | `r30-control` (the read must see a fade) |
| animation | `#answer-panel { animation: ... }` | `r30-nofade`, `r30-none-anywhere` |
| notstatus | `role="status"` replaced by `aria-hidden` | `r30-announced` |
| nounderline | `a { text-decoration: none }` | `r31-links` |
| noerrborder | invalid date border 1 px | `r31-error` |
| samestates | the four states made the same, in the check copy | `r31-states` |
| flicker | `h1` animates | `r31-repeatable` |
| novision | the option is not applied, in the check copy | `r31-blurredVision` to `r31-tritanopia` |
| listextra | a fake option required, in the check copy | `r31-list` |

`11e-r32-field` and the three other `-field` verdicts fail on the real page today and pass in `fieldfits`. The `r31-states`, `r29-shot` and `r26` picture checks were proven with check-copy mutants (marked above), not with a page change.

## Code review

`code-review` at level `low` on this branch saw a one-file diff (`tests/web/checks/11-emulation.mjs`) and reviewed nothing: it treats a test file as out of scope. Run again at `medium`: ten findings. Fixed: the Browse link heading is judged against the emulated window height (not 720); the law box cut counts the right padding too (confirmed from a screenshot; the first numbers under-reported by 12 px); the spacing check reads the body's own font size and checks letter, word and line spacing; the origin is read once before each sweep (a failure in S01 no longer turns into fifteen); `firstElementChild` for the rail rows; translucent colours are laid over Canvas in the contrast reading; PNG width tolerance of 2 px. Not changed: scrollers count as clipping (a comment says so; the story says nothing scrolls sideways and none exists); the 150 duplicated lines from `11-whole-page.mjs` and `11-ring.mjs` (my brief owns this one file; a shared module is a later change); runtime (each sweep reloads the 21 states and runs the journey; the reference note re-walks them once).

## Recipe results (final run, branch tip)

```
check.mjs: 500 passed, 4 failed        (BASE: 393 passed, 0 failed; 111 new checks, 107 pass, 4 fail; all 393 old ones still pass)
FAIL 11e-r32-field, 11e-r33a-field, 11e-r33b-field, 11e-r36-field   (the law box finding)
wcag.py: ok
3360 records checked
pairs=37 failing=0
467 passed, 1 deselected in 523.50s    (CI=1 python3.13 -m pytest -q -k "not all_pairs"; run once, before the review fixes, which touch only the check file)
```
`check.mjs` took 1:43 to 2:56 across the runs (BASE 1:05). Story 04 AC5 did not flake in any run.

## Screenshots (none in the repo)

`~/.cache/gel34-chrome/11-emulation/shots/`: `r26-copy-citation-ring.png`, `r26-copy-citation-ring-window.png`, `r26-selected-rail-row-ring.png`, `r26-selected-rail-row-ring-window.png`, `r29-forced-colors-csrd.png`, `r31-none.png`, `r31-none-again.png`, `r31-blurredVision.png`, `r31-reducedContrast.png`, `r31-achromatopsia.png`, `r31-deuteranopia.png`, `r31-protanopia.png`, `r31-tritanopia.png`. (`GEL34_SHOTS` overrides the folder; the mutant runs used it.)

## What I did not run and why

- Safari, Firefox, Lighthouse, VoiceOver, NVDA, JAWS: not mine; Varun's by hand or not installed.
- A person looking at any picture (R26, R29, R31) and judging colour or layout.
- Chrome's real browser zoom (Ctrl-plus) and a real 1280 px window: emulated by device metrics at scale factor 1.
- A Windows high-contrast theme and palettes other than Chrome's emulated one.
- Whether a screen reader speaks the copy confirmation: only the accessibility tree was read.
- The temporary dev filter I used while building is not in the file (`grep GEL34_ONLY` finds nothing); the mutant script adds it to its own copy.

## What Varun must decide

1. The law box. A long title is cut by the one-line field in 13 of 21 states even in the plain 1280 px window (CSRD by 219 px in a 375 px box); at 200% zoom CSRD is cut by 28 px. The full title is in the answer heading. Options: let the field show the whole value (wrap or grow it), shorten what the box shows, or accept it and record R32, R33 and R36 as passed with this exception. It is a layout choice, so I did not touch `web/`.
2. Forced colours: only the label and aria-current mark the version in force; the edge is the same on every row. Accept, or give that row an edge in a system colour that differs (a layout choice).
3. Look at the R26 and R31 pictures (and R29 if wished); those rows stay Not run until someone has.
