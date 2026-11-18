STATUS: done
gate not passed: Fail rows: none; Not run rows: R01 to R23, R26 to R34, R36 to R37, R39 to R40, R43 to R45, R48 to R53 (45 of 53): the 21 Lighthouse rows, the keyboard, screen reader, emulation, zoom, text spacing and Safari and Firefox rows, the place table container row, and the three recorded gaps

# GEL-34 story 11, part 3: whole-page rows Chrome can run, and the results table

Run 2026-11-18 on branch `feat/gel-34-11-gate` from base `d2fa14fde25d89926b811c75fcce717618f94bd9`, corpus ref `origin/history` (55c8c2a9c, 3360 records), read on 2026-11-17. Browser: Chrome 157.0.8103.79 (from `Browser.getVersion`), headless (`--headless=new`), clean profile. Safari 27.2 is installed (`defaults read`, 2026-11-18); Firefox and Lighthouse are not. Nothing below was run in Safari, Firefox, Lighthouse or VoiceOver.

## Results table

| # | check | state | browser and version | how reached | who ran it | result | note |
|---|---|---|---|---|---|---|---|
| R01 | AC1 Lighthouse Accessibility, no failed audit | S01 first screen | Chrome 157.0.8103.79 DevTools Lighthouse | open the page with no hash: `http://127.0.0.1:8000/` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R02 | AC1 Lighthouse Accessibility, no failed audit | S02 load failure | Chrome 157.0.8103.79 DevTools Lighthouse | serve the page from a folder with no law-data.json; DevTools Navigation mode: `scratch folder without the data file` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R03 | AC1 Lighthouse Accessibility, no failed audit | S03 in-force answer | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=eu-csrd-2022-2464&date=2025-06-01&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R04 | AC1 Lighthouse Accessibility, no failed audit | S04 link only | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=ae-dl-11-2024-climate&date=2026-11-17&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R05 | AC1 Lighthouse Accessibility, no failed audit | S05 before the first version | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=eu-csrd-2022-2464&date=2022-12-31&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R06 | AC1 Lighthouse Accessibility, no failed audit | S06 repealed | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=gn-arrete-2022-1646-evaluations-environnementales&date=2024-01-01&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R07 | AC1 Lighthouse Accessibility, no failed audit | S07 not yet in force | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=eu-eudr-2023-1115&date=2025-06-01&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R08 | AC1 Lighthouse Accessibility, no failed audit | S08 no match answer | Chrome 157.0.8103.79 DevTools Lighthouse | by hand: set a date, type Sarbanes-Oxley, press Enter (Story 6): `no address reaches it` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R09 | AC1 Lighthouse Accessibility, no failed audit | S09 in-force date not recorded | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=dz-lf-1992-art117&date=1995-01-01&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R10 | AC1 Lighthouse Accessibility, no failed audit | S10 later than the corpus | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=eu-csrd-2022-2464&date=2026-11-18&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R11 | AC1 Lighthouse Accessibility, no failed audit | S11 one-version rail | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=gt-ley-proteccion-mejoramiento-medio-ambiente&date=2026-11-17&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R12 | AC1 Lighthouse Accessibility, no failed audit | S12 capped rail | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=kz-advertising-law&date=2026-11-17&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R13 | AC1 Lighthouse Accessibility, no failed audit | S13 same-date rows | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=at-uwg-s1-2a&date=2022-07-20&snapshot=55c8c2a9c` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R14 | AC1 Lighthouse Accessibility, no failed audit | S14 reopened address, snapshot other than the file's | Chrome 157.0.8103.79 DevTools Lighthouse | address: `#law=eu-csrd-2022-2464&date=2025-06-01&snapshot=af3d6b47f` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R15 | AC1 Lighthouse Accessibility, no failed audit | S15 match list open | Chrome 157.0.8103.79 DevTools Lighthouse | by hand, Snapshot mode: type CSRD in the law box: `no address reaches it` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R16 | AC1 Lighthouse Accessibility, no failed audit | S16 match list with no match | Chrome 157.0.8103.79 DevTools Lighthouse | by hand, Snapshot mode: type zzzzqqqq, wait for the count line: `no address reaches it` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R17 | AC1 Lighthouse Accessibility, no failed audit | S17 date message | Chrome 157.0.8103.79 DevTools Lighthouse | by hand, Snapshot mode: pick CSRD, type a five-digit year such as 12345-01-01, leave the field: `no address reaches it` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R18 | AC1 Lighthouse Accessibility, no failed audit | S18 rail expanded | Chrome 157.0.8103.79 DevTools Lighthouse | by hand, Snapshot mode: kz-advertising-law address, open Show all 150 versions: `#law=kz-advertising-law&date=2026-11-17&snapshot=55c8c2a9c, then the control` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R19 | AC1 Lighthouse Accessibility, no failed audit | S19 copy confirmation while it shows | Chrome 157.0.8103.79 DevTools Lighthouse | by hand, Snapshot mode: CSRD address, press Copy citation, audit within 3 s: `#law=eu-csrd-2022-2464&date=2025-06-01&snapshot=55c8c2a9c, then the button` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R20 | AC1 Lighthouse Accessibility, no failed audit | S20 Browse by place, grid | Chrome 157.0.8103.79 DevTools Lighthouse | by hand, Snapshot mode: scroll to the grid: `#browse-by-place` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R21 | AC1 Lighthouse Accessibility, no failed audit | S21 Browse by place, table | Chrome 157.0.8103.79 DevTools Lighthouse | by hand, Snapshot mode: scroll to the table: `#browse-by-place` | Varun (not run yet) | Not run | Lighthouse is not on PATH and not a global npm package (checked 2026-11-18); a scripted run is not approved; DevTools by hand |
| R22 | AC2 keyboard-only journeys 1 and 2 | all steps, focus visible, order, focus return, rail-to-answer disorientation | Chrome 157.0.8103.79 | by hand | Varun (not run yet) | Not run | not scripted beyond the Tab check on the place table and the ring checks; no pass claimed |
| R23 | AC2 keyboard-only journeys 1 and 2 | same, Safari | Safari 27.2 | by hand; record the Tab preference first | Varun (not run yet) | Not run | Safari is not scripted here |
| R24 | AC3 ring against the fill and the tint, contrast | every ring pair in the stylesheets | none (stylesheet arithmetic) | python3.13 tests/test_web_contrast.py | agent (Sonnet, scripted) | Pass | pairs=37 failing=0, includes ring against the page, panel, tint and edges |
| R25 | AC3 ring geometry, Copy citation button and rail rows | computed outline, edge strip, clipping ancestors | Chrome 157.0.8103.79 headless | tests/web/checks/11-ring.mjs, real Tab | agent (Sonnet, scripted) | Pass | 5 checks, all pass in the final check.mjs run; solid 2px, link colour, inset on the selected row |
| R26 | AC3 ring seen on screen | Copy citation button and selected rail row | Chrome 157.0.8103.79 | by hand | Varun (not run yet) | Not run | no one looked at the pixels |
| R27 | AC3 ring seen on screen | same, Safari | Safari 27.2 | by hand | Varun (not run yet) | Not run |  |
| R28 | AC4 VoiceOver with Safari, journey 1 and the repealed variant | spoken text | Safari 27.2 with VoiceOver | by hand; paste the spoken text | Varun (not run yet) | Not run | switching VoiceOver on changes the system; Varun's own run |
| R29 | AC5 DevTools emulation | forced colours: version in force keeps label and edge, borders and ring visible | Chrome 157.0.8103.79 | by hand on CSRD answer, rail, copy confirmation | Varun (not run yet) | Not run | not scripted |
| R30 | AC5 DevTools emulation | reduced motion: confirmation shows with no fade and is announced | Chrome 157.0.8103.79 | by hand | Varun (not run yet) | Not run | not scripted |
| R31 | AC5 DevTools emulation | each colour-vision option the panel lists | Chrome 157.0.8103.79 | by hand | Varun (not run yet) | Not run | not scripted |
| R32 | AC6 200% zoom on a 1280 px window | no text clipped, every control works | Chrome 157.0.8103.79 | by hand | Varun (not run yet) | Not run | not scripted; the 200% text rows under AC7 are a 320 px window with root font 32 px, a different test |
| R33 | AC6 WCAG 1.4.12 text spacing | line height, letter and word spacing at the 1.4.12 values | Chrome 157.0.8103.79 | by hand | Varun (not run yet) | Not run | not scripted |
| R34 | AC6 200% zoom and 1.4.12 text spacing | same two, Safari | Safari 27.2 | by hand | Varun (not run yet) | Not run |  |
| R35 | AC7 320 CSS px window, scrollWidth per state | S01 to S21, each at 100% and at 200% text (root 32 px): 42 measures | Chrome 157.0.8103.79 headless | tests/web/checks/11-whole-page.mjs P1; widths below | agent (Sonnet, scripted) | Pass | every state reads scrollWidth 320, limit 320; no element reaches past 320 either |
| R36 | AC7 400% zoom on a 1280 px window | each state | Chrome 157.0.8103.79 | by hand | Varun (not run yet) | Not run | not scripted |
| R37 | AC7 place table container reached by keyboard | Browse by place table | Chrome 157.0.8103.79 headless | tests/web/checks/11-whole-page.mjs P1, container check | agent (Sonnet, scripted) | Not run | no scroll container exists: #browse-table-wrap has overflow-x visible and no tabindex, the table stacks into cards at 320 px (and at 200% text), so there is nothing to reach by keyboard; the AC wording needs Varun's decision |
| R38 | AC8 answers read the same as tools/law.py | CSRD example, link-only answer, rail, Browse by place, Copy citation line | Chrome 157.0.8103.79 headless | tests/web/checks/11-whole-page.mjs P4 (law.py CLI, query.py, cite-expected.json) | agent (Sonnet, scripted) | Pass | CSRD 2025-06-01: consolidated 2025-04-17; rail 3 versions; 250 place rows; citation line equal |
| R39 | AC8 same, Safari | same five items | Safari 27.2 | by hand | Varun (not run yet) | Not run |  |
| R40 | AC8 same, Firefox | same five items | Firefox (not installed on this Mac) | by hand after installing | Varun (not run yet) | Not run | Firefox is not in /Applications or ~/Applications (checked 2026-11-18) |
| R41 | AC9 Invoker Commands forced off | Copy citation on CSRD 2025-06-01: clipboard equals the line, confirmation shows | Chrome 157.0.8103.79 headless | tests/web/checks/11-whole-page.mjs P3: CommandEvent deleted at document start, real click, clipboard read with readText() | agent (Sonnet, scripted) | Pass | scripted, not by hand as the AC words it; macOS pasteboard not read (headless keeps its own clipboard) |
| R42 | AC10 contrast test on the finished stylesheet | tests/test_web_contrast.py | none | python3.13 tests/test_web_contrast.py; CI=1 python3.13 -m pytest -q tests/test_web_contrast.py | agent (Sonnet, scripted) | Pass | pairs=37 failing=0; 8 passed (includes the fixture with one failing pair that fails) |
| R43 | AC11 NVDA | not tested | none | Windows tool, not available on this Mac | Varun (not run yet) | Not run | recorded gap in the UX spec; nothing here claims it |
| R44 | AC11 JAWS | not tested | none | Windows tool, not available on this Mac | Varun (not run yet) | Not run | recorded gap in the UX spec; nothing here claims it |
| R45 | AC11 disabled users | no disabled users involved; the lead user is a stand-in | none | none | Varun (not run yet) | Not run | recorded gap in the UX spec |
| R46 | AC12 each spec step 13 item has a row; gate line | this table | none | read the table | agent (Sonnet, scripted) | Pass | six item rows below; the gate line below lists every Fail and Not run row |
| R47 | AC13 requests after journey 1, a variant, a copy and a date change | page, stylesheets, scripts, data file, nothing after a lookup | Chrome 157.0.8103.79 headless | tests/web/checks/11-whole-page.mjs P2: resource timing list and server request log | agent (Sonnet, scripted) | Pass | 18 requests, equal at load and at the end, no favicon; the Network panel itself is not scripted |
| R48 | Spec step 13 item 1 Automated: Lighthouse on each state | see AC1 rows | Chrome 157.0.8103.79 | by hand | Varun (not run yet) | Not run | 21 states not audited |
| R49 | Spec step 13 item 2 Keyboard only | see AC2 rows | Chrome 157.0.8103.79, Safari 27.2 | by hand | Varun (not run yet) | Not run |  |
| R50 | Spec step 13 item 3 Screen reader | see AC4 row | Safari 27.2 with VoiceOver | by hand | Varun (not run yet) | Not run |  |
| R51 | Spec step 13 item 4 Emulation in Chrome | forced colours, reduced motion, colour-vision, text size at 200%, 320 px window | Chrome 157.0.8103.79 | 320 px window scripted; the rest by hand | agent (Sonnet, scripted) for 320 px; Varun (not run yet) for the rest | Not run | 320 px window: Pass (AC7 row); the other four are not run (AC5, AC6 rows) |
| R52 | Spec step 13 item 5 Browsers and Invoker Commands off | Chrome, Safari, Firefox; fallback listener | Chrome 157.0.8103.79; Safari 27.2; Firefox none | Chrome scripted; Safari and Firefox by hand | agent (Sonnet, scripted) for Chrome; Varun (not run yet) for the others | Not run | Chrome and the fallback: Pass (AC8 and AC9 rows); Safari and Firefox not run |
| R53 | Spec step 13 item 6 Recorded gaps | NVDA, JAWS, no disabled users | none | see the three AC11 rows | Varun (not run yet) | Not run | named, never claimed |

The story says 20 states and 12 acceptance criteria. Its Context list names 21 states (14 by address, the load failure among them, and 7 by hand) and the story holds 13 acceptance criteria, so this table has 21 Lighthouse rows and AC1 to AC13.

## Plan

One file, `tests/web/checks/11-whole-page.mjs`, four pieces, one commit each. The expected side comes from constants the story states or from Python (`tools/law.py`, `tools/query.py`, `cite-expected.json`), never from `web/*.js`.

- P1 reads `document.documentElement.scrollWidth` in a 320 px window in the 21 states, at 100% text and at 200% text (root 32 px), and lists any element that reaches past 320 px. The place table container is tested separately.
- P2 compares the requests after a journey with the list `web/index.html` names, from two readings: the page's resource timing list and the harness server's request log.
- P3 deletes `CommandEvent` at document start, presses Copy citation with a real click and reads the clipboard back.
- P4 compares the page with `tools/law.py` and `tools/query.py` for the CSRD answer, the link-only law, the CSRD rail, all Browse by place rows and the citation line.

## What each piece does and its printed lines

### P1: the measured width per state (scrollWidth, limit 320, window 320)

Each verdict also proves the window is 320 px, the root font is 16 or 32 px, and the page is in the state it names (the wording is the story's). A page that hides overflow with `overflow-x: hidden` would still fail: the check lists every element whose right edge passes 320 even when scrollWidth reads 320. None did.

| state | scrollWidth at 100% text | scrollWidth at 200% text |
|---|---|---|
| S01 first screen | 320 | 320 |
| S02 load failure | 320 | 320 |
| S03 in-force answer | 320 | 320 |
| S04 link only | 320 | 320 |
| S05 before the first version | 320 | 320 |
| S06 repealed | 320 | 320 |
| S07 not yet in force | 320 | 320 |
| S08 no match answer | 320 | 320 |
| S09 in-force date not recorded | 320 | 320 |
| S10 later than the corpus | 320 | 320 |
| S11 one-version rail | 320 | 320 |
| S12 capped rail | 320 | 320 |
| S13 same-date rows | 320 | 320 |
| S14 reopened address, snapshot other than the file's | 320 | 320 |
| S15 match list open | 320 | 320 |
| S16 match list with no match | 320 | 320 |
| S17 date message | 320 | 320 |
| S18 rail expanded | 320 | 320 |
| S19 copy confirmation while it shows | 320 | 320 |
| S20 Browse by place, grid | 320 | 320 |
| S21 Browse by place, table | 320 | 320 |

Place table container (S21): at 320 px the table is displayed as `block` (stacked cards): 272 px wide in a 272 px container at 100% text, 224 px in 224 px at 200% text. `#browse-table-wrap` has `overflow-x: visible` and no `tabindex`, so no container scrolls and none can be reached by Tab. The verdict passes because the table is not wider than its container and the page is at most 320; the keyboard half of the AC has nothing to run on and is the Not run row above. This matches `09-browse.mjs` AC6, which already requires no scroll container and no tab stop at 320 px.

### P2: the network list

Source: two readings, since the DevTools Network panel itself is not scripted: (1) `performance.getEntriesByType("navigation" and "resource")` in the page, (2) the harness server's `server.log`, one JSON line per request, written before the server answers. The expected list is parsed from `web/index.html`: the page, six `<link rel="stylesheet">`, ten `<script src>`, and `/law-data.json` (18). `<link rel="icon" href="data:,">` is not a request. Journey: type CSRD, click the CSRD row, set the date field to 2025-06-01 the way typing does; one variant (the repealed law, 2024-01-01); one copy (real click on Copy citation, clipboard granted, status Copied); one date change in the field (2026-03-18).

The list at the end of the journey (page resource timing, sorted), equal to the list at load:

```
/
/answer.js
/app.js
/browse.css
/browse.js
/cite.css
/cite.js
/data.js
/dates.js
/find.css
/find.js
/interim.js
/law-data.json
/rail.css
/rail.js
/search.js
/style.css
/variants.css
```

The server saw, in order: `GET / GET /style.css GET /variants.css GET /find.css GET /cite.css GET /browse.css GET /rail.css GET /data.js GET /dates.js GET /answer.js GET /interim.js GET /rail.js GET /search.js GET /find.js GET /cite.js GET /browse.js GET /app.js GET /law-data.json`. No favicon request, no request after load.

### P3: Invoker Commands forced off

Method: Chrome/157.0.8103.79 headless, CommandEvent deleted at document start, real mouse click, clipboard read back with navigator.clipboard.readText(); the macOS pasteboard was not read. The page logged `cite: fallback path` once and not the invoker path. The clipboard was set to a sentinel first, then read after the click: it equals the displayed line, which equals the line `tools/query.py` gives (`cite-expected.json`), no line break; the status reads `Copied`. The check is `11-p3-path`, `11-p3-copy`, `11-p3-status`.

### P4: answers against tools/law.py and tools/query.py

Law id to place call: the id starts with the place's ISO2 code in lower case (`eu-csrd-2022-2464` is EU, `ae-dl-11-2024-climate` is AE). The check does not assume it: `query.list_places(place)` must list the id among that place's instruments (`11-p4-mapping`). Printed lines:

```
P4 law.py EU 2025-06-01: eu-csrd-2022-2464, in force 2025-04-17, consolidated, en, commit 8d07f20cf; the page prints title "Directive (EU) 2022/2464 as regards corporate sustainability reporting (CSRD)", "In force since 2025-04-17", kind consolidated, language en, commit 8d07f20cf
P4 query.instrument_history eu-csrd-2022-2464: 2023-01-05 adopted, 2025-04-17 consolidated, 2026-03-18 consolidated; the rail prints 2026-03-18 consolidated, 2025-04-17 consolidated, 2023-01-05 adopted; marked: 2025-04-17
P4 citation line (query.py, cite-expected.json): Directive (EU) 2022/2464 as regards corporate sustainability reporting (CSRD); in force on 2025-06-01, consolidated version since 2025-04-17; global-esg-law, corpus read 2026-11-17 (snapshot 55c8c2a9c); https://eur-lex.europa.eu/eli/dir/2022/2464/oj
P4 query.law_in_force AE 2026-11-17: ae-dl-11-2024-climate is in link_only with https://uaelegislation.gov.ae/en/legislations/2558 and not in in_force or not_yet_in_force; the page shows state interim, link https://uaelegislation.gov.ae/en/legislations/2558
P4 Browse by place, EU: query.list_places European Union 32 instruments, 32 text stored, 0 link only; the page row prints {"code":"EU","head":"European Union (EU)","nums":["32","32","0"]}
```

## Prove the checks can fail (scratch copies, not committed)

Scratch copies live in `~/.cache/gel34-chrome/story-11-gate/scratch/`, a copy of `check.mjs` with the twelve story 04 criteria removed (so a run takes seconds) and the check file changed by one edit.

- P1: `const LIMIT = 320` changed to 200 (the window stays 320). Result: `check.mjs: 0 passed, 44 failed`; every FAIL names its state, for example `FAIL 11-p1-03-100: S03 in-force answer (address), 320px window, text 100%: scrollWidth 320, at most 200 | observed: document scrollWidth 320 > 200 ...`. Log: `p1-proof-limit200.log`.
- P2: one `fetch("/zz-extra.json")` added at the end of the journey. Result: `FAIL 11-p2-server: ... | observed: server log against index.html: extra /zz-extra.json; 1 requests reached the server after load: GET /zz-extra.json`. The page's resource timing list did not show it (the fetch body was never read, so Chrome had not yet added an entry); the server log did. That is why two readings are used. Log: `p2-proof-extra.log`.
- P3: the clipboard overwritten with `altered line` plus a newline after the click. Result: `FAIL 11-p3-copy: ... | observed: the clipboard differs from the displayed line at index 0: clipboard "altered line\n"; the clipboard text holds a line break`. Log: `p3-proof-altered.log`.
- P4: `tools/law.py` asked for 2023-06-01 instead of 2025-06-01. Result: three FAILs (`11-p4-answer` kind and commit, `11-p4-rail` marked row, `11-p4-citation` in-force date). Log: `p4-proof-wrongdate.log`.

## Result lines

```
check.mjs (baseline on BASE per the brief: 319 passed, 0 failed; this branch adds 56 checks):
check.mjs: 375 passed, 0 failed
python3.13 tests/web/wcag.py            -> wcag.py: ok
python3.13 tools/check_corpus.py        -> 3360 records checked
python3.13 tests/test_web_contrast.py   -> pairs=37 failing=0
CI=1 python3.13 -m pytest -q tests/test_web_contrast.py -> pairs=37 failing=0, 8 passed in 0.04s
CI=1 python3.13 -m pytest -q -k "not all_pairs" -> 464 passed, 1 deselected in 368.04s (0:06:08)
```

The story 04 timing check (AC5, 500 ms) did not fail on the final run, so no rerun was needed.

## What was not run and why

- Lighthouse: not installed; a scripted run is not approved. All 21 states are Varun's, by hand in DevTools; the addresses are in the table.
- VoiceOver with Safari, the Safari keyboard pass, Safari and Firefox side by side: Safari is Varun's by hand; Firefox is not installed.
- Forced colours, reduced motion, colour-vision emulation: not scripted.
- 200% zoom of a 1280 px window, 400% zoom, WCAG 1.4.12 text spacing: not scripted.
- The keyboard journeys in Chrome: not scripted, beyond the Tab checks of `11-ring.mjs` and the place table.
- NVDA, JAWS, disabled users: recorded gaps, never in reach.
- The macOS pasteboard after Copy citation: headless Chrome keeps its own clipboard (`08-cite.mjs` found this); the clipboard was read with `navigator.clipboard.readText()`.
- Code review: the `/code-review` skill at level low, run on the branch (diff against main: one new file), first reported that it is a test file and reviewed nothing. Sent again to review the test logic, it returned four findings: (1) P1 left the 320 px window on for P2 to P4, fixed by clearing it when P1 ends; (2) the place table container verdict never checked the window and root font and ran outside a guard, fixed, and its label now says it does not show a keyboard-reachable container; (3) P4 read the page before the render had settled, fixed with a wait; (4) the clipboard grant of P2 was not reset on a throw, fixed in `run`. Left as it is: the Browser fallback socket copied from `08-cite.mjs` can wait for ever if the browser never answers (low). It found no verdict whose problems list is always empty.

## What Varun must decide

1. The place table has no scroll container. At 320 px it stacks into cards, so the AC "the container reached by keyboard" cannot be run. Either the AC is reworded to "the table stacks and nothing scrolls sideways" (then that row becomes Pass), or the table is given a labelled scroll container (a page change, not mine to make here).
2. The story counts 20 states and 12 criteria; its own lists hold 21 and 13. This table follows the lists. The story text should be corrected.
3. Whether the 21 Lighthouse runs and the Safari, VoiceOver and emulation rows are to be done before the merge or recorded as Not run in the pull request (the gate line stays "not passed" until they are).
4. Firefox is not installed (Varun approved installing it on 2026-11-17).
