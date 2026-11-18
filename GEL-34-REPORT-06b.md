STATUS: done

# GEL-34 step 06b: four product decisions on the answer variants

Branch `feat/gel-34-06b-decisions`, BASE `5e0a654ea18486fd04696b26d1c8059ffc0b7a00`, code commit `fb8d6f29fcc02c1e24ecb90be228131976eb18dc`. Data ref `origin/history` (55c8c2a9c), `--read-on 2026-11-17`. Nothing pushed, nothing merged.

## What changed per decision

1. V2 seventh sentence. `web/interim.js`
   - Line 9: new `T.v2p`.
   - Lines 73 to 75: in the link-only / before-first branch, `dated` looks up the row of `entry.intervals[0].commit` in `entry.versions` and reads its `date_basis`; `line` uses `T.v2p` for V2 when it is set, `T.v2` otherwise. V4 and V1 are unchanged. The hidden sentence stays `${entry.title}: ${line}`.
   - Sentence as shipped (f = first interval date, d = date asked):
     `The earliest stored version of this law has a publication date of ${f}, after ${d}; the corpus does not record when it entered into force, and the law may still have been in force.`
   - Pinned law: `bj-environment-framework-act-1998`, date asked `1999-02-11` (first interval 1999-02-12, `date_basis: publication`). Sentence, hidden sentence and button text are pinned as literals. Nine more real laws have a first row with `date_basis` (bj-climate-change-act-2018, bj-consumer-protection-act-2007, bj-environment-act-2026, do-ley-358-05, do-ley-64-00, dz-lf-1992-art117, ni-ley-217, sv-lma-reglamento-general, ve-organic-environment-law); all ten are checked on the day before their first interval.
2. Later line on the in-force answer: no change.
3. V4 button. `web/interim.js` line 78: `if (first !== null) nodes.push(offer(first));` (was `&& !late`). The click handler is unchanged: `GEL.setDate(first)`, which for a V4 law is after `read_on`, so the answer that follows is the plain in-force answer with the later line.
4. Rail after V5.
   - `web/answer.js`: `GEL.onNoMatch(fn)` (line 22) beside `GEL.onAnswer`; a small `fire(list, detail)` (line 27) holds the try/catch loop that used to sit inline in `showAnswer`, and `showAnswer` and `showNoMatch` both use it; `showNoMatch` ends with `fire(noMatchHooks)` (line 184). Hooks get no detail. `GEL.chosen` is not touched.
   - `web/rail.js` lines 138 to 144: `GEL.onNoMatch` empties `#rail`, removes `aria-labelledby` and sets `drawn = null`, so the next `onAnswer` draws afresh. `drawn = null` matters: without it the next paint would run on lists that are no longer in the page and the rail would stay empty.

## Checks added or replaced

All in files I own; `tests/web/check.mjs` was not edited (its CSRD pins at lines 425 and 505 pass untouched).

`tests/web/checks/06-variants.mjs`
- `T.v2p` added (page text copied from the decision).
- `expectFor` (data side): V2 text uses `T.v2p` when `rowOf(e, e.intervals[0].commit)?.date_basis` is set, read from the data file; V4 now expects the `Show <first>` offer. This also moves the AC4 sweep, the AC6 "one day earlier is V2", AC7 and AC9 expectations.
- Replaced: AC2 "before the record starts" (BJ, 1999-02-11) now pins the literal new sentence, the hidden sentence and `Show 1999-02-12` (was the old V2 sentence).
- Added: AC2 "the day before the first interval: the 10 laws whose first row has date_basis read the publication-date sentence" (text, hidden sentence, offer for each; fails if BJ is not among them).
- Replaced: AC4 "announced law" (KG104, 2026-06-01) asserted `offer button: null`; it now asserts `Show 2027-01-01`, a BUTTON of type button.
- Added: AC4 "pressing Enter on the focused Show 2027-01-01 button of the V4 answer lands on the in-force answer for 2027-01-01 (commit 17c2c0302) with the later line" (state plain, date field, later line, hidden sentence ends with it, `GEL.chosen` kept).
- Added: AC4 "every one of the 5 announced laws: the V4 button on the day before its first interval opens the answer for that first date, later line shown".
- AC10 source grep: the new sentence's opening added to the fragment list.

`tests/web/checks/07-rail.mjs`
- Added `ac10` (tag `07-AC10`), two verdicts on `mt-climate-action-act-2015` (8 rows): the rail is empty before any law is chosen, draws for the law, is empty again after `GEL.showNoMatch` (same shape as the first state, V5 shown, `GEL.chosen` still the law); then `GEL.setDate("2018-06-01")` draws the data's 7-row window, the current row (`de1a2619a`) and "Show all 8 versions" again.

Mutation run: with the three `web/*.js` files put back to BASE and the new checks kept, `check.mjs: 254 passed, 13 failed` (V2 text, V4 offer, AC10 source grep, sweep, 07-AC10 first verdict, among others). The second 07-AC10 verdict passes on BASE by design: the rail redraws on a date change there too; the first verdict is the one that pins the clearing. The files were then restored from a copy and the final run below is on the committed code.

## Command output

- `python3.13 tools/web_data.py --ref origin/history --read-on 2026-11-17 --out web/law-data.json` (gitignored, not committed), `expected.py` (pairs=625 plain=622 interim=3 instruments=216), `cite_expected.py` (cases=14): all built in `~/.cache/gel34-chrome/story-06b`.
- `node tests/web/check.mjs --data web/law-data.json --expected $P/expected.json --profile $P/prof --port 8416 --cdp 9416`
  - on BASE (brief): 262 passed, 0 failed
  - after my change: `check.mjs: 267 passed, 0 failed` (+5: one new 06-ac2 verdict, two new 06-ac4, two new 07-AC10; the two replaced checks keep their count. My first run had 3 failures in my own new checks (the V4 click drew without choosing a law, and the rail count included the full hidden list); fixed before the commit)
  - AC5 "Loading the law list": passed, 45 ms (limit 500).
- `python3.13 tests/web/wcag.py`: `wcag.py: ok`
- `python3.13 tools/check_corpus.py`: `3360 records checked`
- `CI=1 python3.13 -m pytest -q -k "not all_pairs"`: `450 passed, 1 deselected in 296.06s (0:04:56)`
- Lighthouse and VoiceOver: not run, by hand later.
- My Chrome (9416) and server (8416) are stopped; `lsof` shows nothing on either port.

## What is left

Nothing from the four decisions. `GEL-34-REPORT-06b.md` is for the coordinator to remove before the merge.

## What the coordinator must know

- `fire()` replaced the inline hook loop in `showAnswer`; behaviour is the same (each hook in its own try/catch, errors to `console.error`).
- For a V4 law the date field and echo show the future date after the click (for example 2027-01-01). That is the decision as written; the later line tells the reader the corpus predates it.
- I did not check how the citation slot (`cite.js`) looks after V5. It only draws on `onAnswer` and sits in the plain answer, which V5 hides, so I expect no stale text, but I did not run that.

## Report

Four decisions shipped in `web/interim.js`, `web/answer.js` and `web/rail.js`. Checks went from 262 to 267 passing, none failing. Pytest 450 passed.

## Next

- Remove GEL-34-REPORT-06b.md, then merge feat/gel-34-06b-decisions into main.
- Re-run Lighthouse and VoiceOver by hand on the merged page.
- Tell Varun the V2 sentence for the ten publication-dated laws now reads as shipped above.
