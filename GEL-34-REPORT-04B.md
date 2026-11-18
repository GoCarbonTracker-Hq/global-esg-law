STATUS: done

# GEL-34 story 04b: two seams so stories 05 to 09 can build the page in parallel

BASE: 5c0c0a2b2f0ce5f1163b2e00d145314316736c42 (local main after story 04). Branch `feat/gel-34-04b-seams`. Data ref `origin/history` (55c8c2a9c, read-on 2026-11-17).

## Plan

WORK METHOD: plan first, then two independent pieces run through Sonnet subagents (one writer per file), then I integrate, run the checks and commit.

| Piece | Deliverable | Files (one writer) | Done when |
|---|---|---|---|
| Setup (me) | `web/law-data.json` and `expected.json` generated from `origin/history`; baseline run of the unchanged check | none committed | baseline prints `check.mjs: 66 passed, 0 failed` |
| P1, the hook (Sonnet) | After the 12 story 04 checks and before the summary, `check.mjs` imports every `tests/web/checks/*.mjs` (sorted by name) and awaits its `run(h)`; `h` carries the flags and the harness members; new member `addVariant`; an extension that throws, or exports no `run`, fails the run and names its file | `tests/web/check.mjs` | With no extension files: `check.mjs: 66 passed, 0 failed`, exit 0. With scratch extensions (pass, fail, throw, no run, addVariant): totals grow, a failing check exits 1, a throwing one is named |
| P2, the interval and its test (Sonnet) | `GEL.coveringInterval(entry, date)` used inside `classify`; hook detail `{entry, date, interval, row, panel, state, reason}`; `00-seams.mjs` asserts the four cases through `GEL.onAnswer` and opens `addVariant` fixtures | `web/answer.js`, `tests/web/checks/00-seams.mjs` | Static only (P2 did not run Chrome while P1 edited `check.mjs`): syntax check, greps `Date.parse`, `Temporal`, `toISOString` empty and `new Date` exactly one |
| Integrate (me) | Run the check with both pieces; red run of `00-seams.mjs` on the old `answer.js`, then green on the new one; `wcag.py`; pytest once | this report | commands and outputs below |

Commits: one for the hook, one for the interval and its test, one `DONE:` commit with this report.

## What I did

- Wrote the plan above before any edit, generated the data and expected files, and ran the unchanged check once: `check.mjs: 66 passed, 0 failed`.
- P1 (Sonnet subagent) edited `tests/web/check.mjs` and tested it in a scratch copy under `/tmp/gel34-04b-p1`, outside the worktree: no extensions (66 passed), passing extensions (79), a failing check (exit 1), a throwing extension, an extension with no `run`, a syntax error and a rejected promise (each named, later files still ran, exit 1). It also compared the old and new output with no extensions: identical.
- P2 (Sonnet subagent) edited `web/answer.js` and wrote `tests/web/checks/00-seams.mjs`. It ran only static checks and a Chrome-free dry run against a fake page, plus a sweep of 8100 entry and date pairs showing `classify` gives the same result on the old and the new `answer.js`.
- I read both diffs and the test, then ran everything in the worktree (below).

Changes beyond the literal brief, all in `check.mjs` and all needed so an extension fails by name instead of crashing the run:
- `check` prints a string tag as given (a number still prints `AC<n>`), so five stories do not all print `AC1`.
- `addVariant` throws when the name is already taken; `open` throws on an unknown variant name (before, it crashed the http handler and the run ended without a summary).

## Checks

All commands run in `~/GTC/global-esg-law-wt/gel-34-04b-seams`. `RUN` below is `node tests/web/check.mjs --data web/law-data.json --expected ~/.cache/gel34-chrome/story-04b/expected.json --profile ~/.cache/gel34-chrome/story-04b`.

| Check | Result |
|---|---|
| Baseline before any edit, RUN | `check.mjs: 66 passed, 0 failed` |
| S0: hook in place, old `answer.js`, `tests/web/checks/` moved away, RUN | exit 0, `check.mjs: 66 passed, 0 failed` (the story 04 output, line for line) |
| S1: hook committed, old `answer.js`, `00-seams.mjs` present, RUN (the red run) | exit 1, `check.mjs: 69 passed, 5 failed`. The five failures are the four detail checks and the `coveringInterval` check; the three `addVariant` checks pass |
| S2: new `answer.js`, RUN, first attempt | exit 1, `check.mjs: 73 passed, 1 failed`. The one failure was `FAIL AC5: slow: "Loading the law list" at 823 ms (limit 500)`, a story 04 timing check. Not a seam check |
| S2: same files, RUN, two reruns | both exit 0, `check.mjs: 74 passed, 0 failed` |
| Final RUN on the committed state | exit 0, `check.mjs: 74 passed, 0 failed` (66 story 04 checks plus 8 from `00-seams.mjs`) |
| `python3.13 tests/web/wcag.py` | `wcag.py: ok` |
| `rg -n "Date\.parse\|Temporal\|toISOString" web/*.js` | no output (exit 1, no match) |
| `rg -c "new Date" web/*.js` | `web/dates.js:1` |
| `CI=1 python3.13 -m pytest -q -k "not all_pairs"` | `450 passed, 1 deselected in 914.43s (0:15:14)` |

The extension lines of the final run:

```
PASS 04b: onAnswer detail: eu-csrd-2022-2464 on 2025-06-01 is plain with its interval
PASS 04b: onAnswer detail: gn-arrete-2022-1646-evaluations-environnementales on 2023-05-05 is interim (repealed) with its interval
PASS 04b: onAnswer detail: eu-csrd-2022-2464 on 2022-12-31 is interim (before-first) with its interval
PASS 04b: onAnswer detail: ae-dl-11-2024-climate on 2026-11-17 is interim (link-only) with its interval
PASS 04b: GEL.coveringInterval: a date equal to from counts, before the first and no intervals give null, a later date gives the last one
PASS 04b: addVariant given an object: the fixture law arrives and answers plain with its title
PASS 04b: addVariant given bytes: the fixture law arrives and answers plain with its title
PASS 04b: addVariant refuses a name that is already taken (ok)
check.mjs: 74 passed, 0 failed
```

What the red run printed for the repealed answer on the old `answer.js` (so the test does test the change): `detail keys: got ["date","entry","interval","panel","row"], want [... "reason","row","state"]; state: got null, want "interim"; reason: got null, want "repealed"; interval.from: got null, want "2023-...`.

## What is left

- The AC5 slow check (`tests/web/check.mjs`, story 04) failed once in four full runs with 823 ms against a 500 ms limit. It measures the time from `Page.navigate` to the first `evaluate`, so a busy machine can trip it. I did not touch it; it passed in the other three runs on this branch and in the baseline.
- `~/GTC/go-carbon-insights/.dispatch/gel-34/seams-04.md` still says the hook gets `fn({entry, date, interval, row, panel})` with `interval` and `row` null for interim. That is out of date after this branch; I do not own that file.
- Lighthouse (story 04 criterion 10) is still not run; unchanged.
- No push, no merge. The data file `web/law-data.json` is untracked and not committed.

## Extension interface

Stories 05 to 09 start here.

**Where and how to name your file.** One file per story in `tests/web/checks/`, named `<story number>-<short name>.mjs`, for example `05-find.mjs`. `check.mjs` takes every `*.mjs` directly in that folder (no subfolders), sorts the names with the default string sort (so `00-seams.mjs` runs first), imports each and awaits its export. Own your file and no other; do not edit `check.mjs`.

```js
export async function run(h) {
  await h.open("ok");
  // ... drive the page, then:
  h.verdict("05", "what this proves", problems); // problems is an array, empty means pass
}
```

`run` may be sync or async. Extensions run one after another in the same Chrome tab, after the 12 story 04 checks. After each one the check resets the timezone override, device metrics, script execution and network conditions (nothing else), so start with `h.open(...)`. Import `node:fs` and the rest yourself.

**The members of `h`** (a fresh object; exactly these):

| Member | What it is |
|---|---|
| `data` | path of the law data file (`--data`), a string |
| `expected` | path of `expected.json` (`--expected`), a string; read it with `fs` |
| `port`, `cdp` | the numbers actually in use (a busy port has moved to the next free one) |
| `profile`, `chrome`, `workdir` | strings, as parsed |
| `evaluate(expr)` | runs an expression in the page (`returnByValue`, awaits a promise); throws `page: ...` on a page exception |
| `navigate(url)` | loads a URL and waits for the load event |
| `waitFor(expr, ms = 5000)` | polls `evaluate(expr)` until it is truthy, or throws on timeout |
| `until(fn, ms, what)` | polls an async function until it returns a truthy value, or throws `timed out after ... waiting for what` |
| `sleep(ms)` | a delay |
| `press(name)` | a real key press through the DevTools protocol; only `"Tab"` and `"Enter"` exist |
| `open(variant, { ready = true })` | loads the page with that data variant at `/law-data.json`; with `ready` it waits (10 s) until `GEL.data` is loaded and `#example` and `#date` are enabled. Throws on an unknown variant name |
| `panel()` | the page-side summary of `#answer-panel` (state, id, date, commit, the printed fields, link, which parts are visible, the hidden sentence, the law box, the date field) |
| `send(method, params)` | any DevTools protocol command |
| `once(method, ms = 15000)` | waits for one DevTools protocol event |
| `check(tag, label, ok, observed)` | counts one check; `observed` is printed on a failure |
| `verdict(tag, label, problems)` | one check that passes when the `problems` array is empty and prints the problems otherwise |
| `eqs(rows)` | rows of `[name, got, want]` to an array of `"name: got X, want Y"` for the rows that differ (feed it to `verdict`) |
| `sameCommit(page, want)` | true when `page` is a 40-character commit that starts with `want` |
| `fmt(v)` | short JSON text for messages |
| `addVariant(name, jsonObjectOrBytes)` | see below |

Not on `h`: the base URL (use `h.evaluate("location.origin")`), the server's request log, and the parsed expected object. Every page also has `window.__chk` (`panel`, `run`, `setField`, `blur`, `hint`, `loadState`, `ring`, `sentenceBox`, `layout`, `sharedPairs`), reachable with `h.evaluate("__chk.panel()")`.

**Tags.** A number tag prints `AC<n>` and belongs to story 04. Use a string tag that starts with your story number (`"05"`, `"05-match"`); `00-seams.mjs` uses `"04b"`.

**`addVariant(name, jsonObjectOrBytes)`.** Registers one more file the server sends at `/law-data.json` (status 200, no delay) when you `h.open(name)`. An object is `JSON.stringify`d; a string, `Buffer` or typed array is sent as it is (so you can send broken JSON on purpose). It throws when the name is taken, and the built-in names are `ok`, `missing`, `cut`, `no-read-on`, `slow`, `fixture`, `changed`; prefix yours with your story number (`05-two-places`) so extensions do not collide. To build a fixture, read `h.data`, `structuredClone` it, change it, and pass the object. `00-seams.mjs` does this with one extra law entry.

**The answer hook.** `GEL.onAnswer(fn)` calls `fn({entry, date, interval, row, panel, state, reason})` after every answer: `interval` is the covering interval or null for every answer (so a repealed or before-first answer has one when an interval starts on or before the date), `row` is the version row for a plain answer and null for interim, `state` is `"plain"` or `"interim"`, `reason` is the interim reason or null. `GEL.coveringInterval(entry, date)` is the one date comparison in `web/*.js` (text compare, last interval whose `from` is on or before the date; null for none or no intervals). A hook cannot be removed, but a new `h.open` reloads the page and clears them.

**What the run prints.** One line per check: `PASS <tag>: <label>` or `FAIL <tag>: <label> | observed: <text>`. An extension that throws, rejects, has a syntax error or exports no `run` prints `FAIL checks/<file>: extension ran to the end | observed: threw: <message>`; the later extensions still run. The last line is `check.mjs: N passed, M failed`, and the exit code is 1 when M is above 0. Extension checks count in N and M. With no extension files the output is the story 04 output (66 passed, 0 failed); with `00-seams.mjs` alone it is 74 passed, 0 failed.

**Run it.**

```
python3.13 tools/web_data.py --ref origin/history --read-on 2026-11-17 --out web/law-data.json
python3.13 tests/web/expected.py --ref origin/history --read-on 2026-11-17 --out ~/.cache/gel34-chrome/<yours>/expected.json
node tests/web/check.mjs --data web/law-data.json --expected ~/.cache/gel34-chrome/<yours>/expected.json --profile ~/.cache/gel34-chrome/<yours> --port <free> --cdp <free>
```

Five windows at once need five different `--profile`, `--port` and `--cdp` values.

## Report

The two seams are in, on `feat/gel-34-04b-seams`, in two commits plus this report. The final check run prints `check.mjs: 74 passed, 0 failed` (66 story 04 checks and 8 new ones), `wcag.py: ok`, the greps are clean, and the pytest line is `450 passed, 1 deselected`. The new test failed on the old `answer.js` (5 failed) and passes on the new one. One story 04 timing check (AC5 slow, 823 ms against 500) failed once and passed on two reruns.

## Next

- Coordinator: merge this branch before the five story windows start, and remove `GEL-34-REPORT-04B.md` as planned.
- Coordinator: update `seams-04.md` for the new hook detail and `GEL.coveringInterval`, and point stories 05 to 09 at the Extension interface section above.
- Decide whether to widen the AC5 slow limit (500 ms) or leave it; it is a story 04 check and I left it alone.
