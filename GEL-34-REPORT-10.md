STATUS: done

# GEL-34 story 10: reopen a copied address and the footer links

Branch `feat/gel-34-10-reopen`, base `171b765d710c3c9ce14bb5e409ac3091fd97f32e`, ref `origin/history` (55c8c2a9c, 3360 records). Every browser check ran on the `ok` data variant built from `origin/history` with `--read-on 2026-11-17`.

## Result lines

```
check.mjs: 308 passed, 0 failed          (267 before my check file, +41 checks tagged 10-*)
wcag.py: ok
3360 records checked                      (tools/check_corpus.py)
456 passed, 1 deselected in 320.01s       (CI=1 python3.13 -m pytest -q -k "not all_pairs"; baseline 450, +6 footer tests)
6 passed in 0.01s                         (~/.cache/gel34-py311/bin/python -m pytest -q tests/test_web_footer.py)
```

The 500 ms "Loading the law list" check (story 04 AC5) passed in the three clean runs; no rerun was needed. The 267 figure was run with my web changes in place and before the new check file, so every old check passes against the new page. I did not run the pristine BASE myself; 267 is the brief's baseline and the same number.

## Plan (written before the code)

One worker, no subagents. Each piece has one deliverable, its own files and a check.

| # | Deliverable | Files | Check |
|---|---|---|---|
| 1 | A date refused from an address empties the field, clears `GEL.date`, shows the shared message at once | `web/dates.js` | `10-address.mjs` date arms (five addresses, five typed) |
| 2 | Address read on load and on `hashchange` (law, date, snapshot, the two notes), written with `replaceState` after a law or date change, nothing rewritten on open | `web/find.js`, `web/app.js` | `10-address.mjs` AC1 to AC8 |
| 3 | Footer with three links, 24 px targets, last in the tab order | `web/index.html`, `web/style.css` | `10-address.mjs` AC10, `wcag.py` |
| 4 | Footer hrefs name an existing file and a GitHub heading slug; fixture that renames `## Quick start` fails | `tests/test_web_footer.py` | pytest on both interpreters |
| 5 | Browser checks tagged `10-ac1` .. `10-ac12` | `tests/web/checks/10-address.mjs` | `check.mjs` count rises, no old check changes |
| 6 | `code-review` low on the diff, E2E recipe, this report | | result lines above |

## What changed per file

Commits: `8cdcae654` (page), `65a4666e6` (footer test), `cd58f32b3` (browser checks), `dec1406f9` (alert stub fix in my check), then the `DONE:` commit with this report.

- `web/dates.js`: new `GEL.rejectDate()`: sets `GEL.date = null`, empties the date field and the echo, shows the shared message at once (`refused = true; hint(true)`). `isDate` and `setDate` are untouched, so typed and address dates go through the one function the story 04 pins already test against `_valid_date` (103 table rows, check 11).
- `web/find.js`: `GEL.address.build(id, date)` and `.parse(hash)` (URLSearchParams both ways, ids need no encoding); `GEL.openAddress()` (law, date, the two notes, the status text); one `GEL.onAnswer` hook that, unless an address is being opened, clears the note and calls `history.replaceState(null, "", address)`. Two guards for `GEL.date === null` (a row pick draws no answer, Enter on no match draws no V5 answer), because `showAnswer(id, null)` would print "Date asked null".
- `web/app.js`: `GEL.openAddress()` after the load resolves, and a `hashchange` listener that calls it once the data is in.
- `web/index.html`: `<footer>` with a list of the three links, after Browse by place. No change for the note: it goes into the existing `#load-status` (role status, aria-live polite), the page's one polite region (spec, Form Patterns).
- `web/style.css`: footer rules only (divider, flex list, `footer a` inline-block with `min-height: 1.5rem`), colours through the existing custom properties.
- `tests/test_web_footer.py`: 6 tests, standard library plus pytest: the three hrefs in order; every href names an existing file and a GitHub slug of a `##` heading (code fences skipped, repeated headings get -1); a fixture copy of README.md with `## Quick start` renamed fails; a missing MCP.md fails; a foreign host fails; the slug function.
- `tests/web/checks/10-address.mjs`: 41 checks, expected values from `expected.json`, the data file and constants written out from the story.

## Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| 1 reopen, four spellings | pass | `10-ac1`: `55c8c2a9c`, `55c8c2a` (7), `55C8C2A9C`, the 40 characters each show the CSRD title, date field 2025-06-01, answer commit `8d07f20c...` since 2025-04-17, read line `Snapshot 55c8c2a9c, matches working tree`, empty status text. Four PASS lines. |
| 2 not kept, three ids | pass | `10-ac2`: `af3d6b47f`, `c76381e2f`, `deadbeef0`: status text equals the story sentence string for string, answer is the current CSRD answer with `Corpus read 2026-11-17`; regex for same, differ, different, agree, identical finds nothing in the note or the answer text. Three PASS lines. |
| 3 no snapshot and unreadable | pass | `10-ac3`: no snapshot gives no note; `latest`, `55c8c2`, `zzzzzzzzz` give the "could not be read" sentence; `latest` and `zzzzzzzzz` are absent from the page text and html (`55c8c2` is a prefix of the current id the sentence prints, so echo is not testable for it by substring; the note equals the exact sentence, which holds no variable part but the current id). Four PASS lines. |
| 4 dates, ten runs | pass | `10-ac4`: five addresses (`2025-6-1`, `2025-02-30`, `10000-01-01`, `2025-13-45`, empty): law box shows the CSRD title, date field and echo empty, panel hidden, message "Enter a date in the form 2025-06-01." shown, `aria-invalid` true, hash not rewritten. Five typed (field path and `GEL.setDate`, then blur): law filled, no answer, message. Ten PASS lines. Also `10-ac4b` (a valid typed date afterwards draws the answer, clears the message, writes the address) and `10-ac4c` (a chosen row or Enter on no match draws nothing while the date is refused). |
| 5 unknown law and markup | pass | `10-ac5`: `xx-not-a-law` gives `This address names a law that is not in snapshot 55c8c2a9c. Type its name in the law box.`; the markup law and snapshot give the two sentences, 0 `img`, 0 `b`, no alert (stub installed before the page's scripts), no `onerror` or `<b>` in the html or text, element count equal to the page with no address; the same address pasted into an open page adds 0 elements. `10-ac5b`: both sentences in one status text, snapshot first. |
| 6 all ids | pass | `  ids=1404 mismatches=0` printed by `10-ac6` (every entry through `GEL.address.build` and `.parse`, regex of the story). A real `replaceState` write read back for the longest id (64 characters, address 104 characters), the first and the last id. |
| 7 not rewritten, no focus | pass | `10-ac7`: after opening `af3d6b47f` `location.hash` equals the pasted hash and focus is on body; three date changes: hash carries `55c8c2a9c`, note empty, `history.length` unchanged. A capitalised snapshot is kept as written. |
| 8 hashchange | pass | `10-ac8`: with the example answer on screen, `location.hash = ...date=2023-01-05&snapshot=af3d6b47f` changes the note and the answer (commit `8960295f...`), hash kept, `window.__mark` still 1, navigation entries and `history.length` unchanged. `10-ac8c`: `#browse-by-place` changes neither. `10-ac8b`: an unknown law pasted over an answer hides the answer. |
| 9 Network lists | pass, with a difference | `10-ac9`: Resource Timing list of all 35 page loads this file makes (every address above, plus the plain page) equals the list of the page with no address: `/ /answer.js /app.js /browse.css /browse.js /cite.css /cite.js /data.js /dates.js /find.css /find.js /interim.js /law-data.json /rail.css /rail.js /search.js /style.css /variants.css`. The harness hands extensions no server request log, so the list is the page's own `performance` entries, not the server's. |
| 10 footer | pass | `10-ac10`: three hrefs in the story order, each at least 24 by 24 CSS px, no `target`, the last three tab stops, no tabindex above 0; real Tab presses from the last stop before the footer reach the three links in order with `:focus-visible` and `solid 2px rgb(31, 111, 74)`; the next Tab leaves them. This was run through the DevTools key events, not VoiceOver. |
| 11 hrefs and curl | pass | pytest `6 passed` on python3.13 and on `~/.cache/gel34-py311/bin/python`. `curl -sI` on the three URLs: `HTTP/2 200` three times (2026-11-18). |
| 12 Lighthouse and note colour | Lighthouse not run, by hand later; colour read | Box left unticked. `10-ac12` reads the note: plain text, no child element, colour `rgb(20, 22, 26)` (#14161A) on `rgb(255, 255, 255)`, role status, aria-live polite. `wcag.py` prints the 18.1 for text on page. |

Do the checks fail when the page is wrong? Five one-line mutations, each reverted with `git checkout web/`: `startsWith` to `===` (10 failures, all in the checks that carry a current snapshot); the `opening` guard removed (3 failures: hash rewritten on open); the `hashchange` listener removed (2 failures, timeouts in AC5 and AC8); the footer link rule removed (1 failure, the 24 px measure); the message not shown at once (6 failures). Each broke the check meant for it.

## Recounts and differences from the story and the brief

- Recounted 2026-11-18 from the data file built on `origin/history`: 1404 entries, 1404 distinct ids, all `[a-z0-9-]+`, longest 64 characters, longest address 104 characters. Same as the story.
- `origin/history` is `55c8c2a9c1d8fdbb40fd2d5334ac397b743d76e7`, read on 2026-11-17. Same.
- README.md in this checkout equals `origin/main` (`0b93d7537`); MCP.md differs by one line (a later change on local `main`). All three headings exist in `origin/main` and in this checkout, so the story's "equal to origin/main" holds for README only today.
- The story says to serve with `python3 -m http.server -d web`. The harness serves `web/` itself and maps `/law-data.json` to the variant, so no `http.server` ran. The files are the same.
- The note sits in `#load-status`, not in a new element. The brief mentions "the status note" under index.html; nothing needed adding there.
- The snapshot sentence is copied from the story and says "The answer below is from snapshot ..." even when no answer shows (unknown law, refused date). See decisions.
- A typed refused date over an answer already on screen keeps that answer (story 04 pins this in AC6 and AC11). The story's "no answer shows" holds for an address and for a typed date before any answer exists, which is what the ten runs test.
- The 1404-id loop does not write 1404 times: Chrome throttles `replaceState` (about 200 calls in 10 s). Every id goes through the page's builder and parser; three go through a real write.
- The typed arm chooses the law with `GEL.choose` (the page's own function), because a search-and-pick would draw an answer for today's date first.
- `code-review` at `low`: the first launch (args `low`) ran from the session's working directory (another worktree, on `main`), saw an empty diff and reviewed nothing. The second launch with the target `feat/gel-34-10-reopen` read `git diff main...feat/gel-34-10-reopen` without test paths (the low level skips tests) and returned `(none)`. My own read found one weakness in my check (the alert stub was installed after the page had loaded, so a load-time alert would have gone unseen); fixed in `dec1406f9` by installing it with `Page.addScriptToEvaluateOnNewDocument`.

## What I did not run, and why

- Lighthouse on both note states and VoiceOver: by hand later (brief).
- Anything on a hosted copy, a Firefox or Safari page, or a `file:` URL: out of scope.
- No pbpaste or clipboard check: the story has no copy button for the address.
- The full `all_pairs` pytest, deselected as the brief says.

## Changes to seams (what another story must know)

- Every answer now rewrites `location.hash` with `history.replaceState`, including `GEL.showAnswer` calls made straight from code or a check. The old checks do this and still pass. `replaceState` fires no `hashchange`, so there is no loop.
- `GEL.date` can be `null` after an address date was refused. Any new code that draws with `GEL.date` must test for it (`find.js` does). A valid date accepted later sets it again.
- New: `GEL.rejectDate()` (dates.js), `GEL.address.build/parse`, `GEL.openAddress()` (find.js). Only a hash with a `law` key counts as an address; `#browse-by-place` and other hashes are ignored by `openAddress` (a Browse click replaces the address in the bar until the next law or date change writes it again).
- `#load-status` now also carries the address note. `data.js` `say()` still replaces its children during a load, which is before the address is read.
- Open: when an address names an unknown law or a refused date over an answer already on screen, the page hides `#answer-panel` and clears `GEL.chosen` as needed, but `#rail` keeps the old law's versions. `rail.js` clears only through its `onNoMatch` hook and `answer.js` exposes no way to fire it. A two-line `GEL.clearAnswer` in `answer.js` (hide the panel, fire the no-match hooks) would close it; I did not touch answer.js or rail.js. I did not empty `#rail` from find.js either: `rail.js` keeps its own drawn state and would repaint into detached lists.

## What Varun must decide

1. The snapshot sentence says "The answer below" when there is no answer (unknown law, refused date). The story's exact text is kept; say whether it should drop that clause when no answer shows.
2. The stale rail after an unknown-law or refused-date address pasted over an answer (above): add `GEL.clearAnswer` to `answer.js` in this PR, or accept it.
3. A law chosen while the date is refused draws no answer and the address bar keeps the old address (the new one would have no date). Accept, or write an address with an empty date.
4. A hash with `date` or `snapshot` but no `law` is ignored. Accept, or give it a meaning.
5. Footer wording is mine: "Run it on the command line", "Use it from an AI assistant", "Set up the MCP server". The MCP link has no anchor, as the story gives the plain URL although `## Set it up` exists.
