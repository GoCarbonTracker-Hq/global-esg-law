STATUS: done

# GEL-34 batch 4, unit B (10b-clear): address states that show no answer

Branch `feat/gel-34-10b-clear`, BASE `051df4fc64164b199359c8456903628315aff4d3`. Ref `origin/history` (55c8c2a9c), read-on 2026-11-17.

## Plan

| Finding | Change | Check that proves it |
|---|---|---|
| 6a snapshot sentence | `openAddress` in `web/find.js` builds the snapshot sentence after the date and law are handled and says "This page holds snapshot {id}, read on {date}." when no answer shows, "The answer below is from snapshot ..." when one does | `10b-note` (five verdicts), plus the expected strings of `10-ac5` and `10-ac5b` |
| 6b stale rail | `GEL.clearAnswer()` in `web/answer.js` hides the panel, removes `data-id`, `data-state`, `data-date` (and `data-commit`), empties `#answer-sentence`, fires the new `GEL.onClear` hooks. `web/rail.js` has one `empty()` function registered for `onNoMatch` and `onClear`. `openAddress` calls `GEL.clearAnswer()` where it set `panel.hidden = true` | `10b-rail` (three verdicts) |
| 6c stale address | `pick` in `web/find.js`: when `GEL.date` is null, `history.replaceState(null, "", location.pathname + location.search)` | `10b-address`, and `location.hash` assertions in `10-ac4c` |

## The change and why

- `web/answer.js`: `clearHooks`, `GEL.onClear(fn)`, `GEL.clearAnswer()`. The hook has the same shape as `onNoMatch` (a list, `fire`, no detail argument).
- `web/rail.js`: the body of the old `onNoMatch` handler became the function `empty`; it is registered twice, so nothing is copied. It still sets `drawn = null`, which matters: without it the next answer for the same law skips the draw and the rail stays empty (proven by mutation, below).
- `web/find.js`: the snapshot note is assembled after the `try` block, when `answered = known && dated` is known; the unknown-law note keeps its place after it (snapshot sentence first, as `10-ac5b` pins). The `panel` constant in `find.js` had no other use and is deleted.
- `data-commit` is removed too, which the brief did not list: it is the same leftover (the commit of the last answer on a hidden panel), and `showNoMatch` already removes it through `reset`.
- Interim answers (before the first version, repealed) still show a panel, so for them the sentence keeps "The answer below".
- Other holders of the last answer: `web/cite.js` keeps the last citation line and Copy button in `#slot-citation` (inside the hidden panel) after `clearAnswer`, and already did after a no-match answer. It is not in OWNS, so it is OPEN below. `web/browse.js` has no answer listener. `GEL.chosen` is deliberately kept when the date is refused (the next accepted date draws that law) and is null for an unknown law.

## Checks

New file `tests/web/checks/10b-clear.mjs`, nine verdicts, tags start with `10b`. Expected values come from `expected.json` (`snapshot9`, `read_on`, the example title) and the sentences written out in the file. `10-address.mjs`: `10-ac5` (two verdicts) and `10-ac5b` now expect "This page holds snapshot" (a `held()` helper), and `10-ac4c` gained two `location.hash` assertions. No assertion was removed or loosened.

Proof that each fails on BASE: a BASE copy (`git archive 051df4fc6 web tests/web` into `~/.cache/gel34-chrome/10b-clear/base`, plus `law-data.json`) was run with the new `10b-clear.mjs` and the edited `10-address.mjs`. Result `check.mjs: 368 passed, 11 failed`. The failures:

- `10-ac4c`, `10-ac5` (both verdicts), `10-ac5b`: fail on BASE (hash still the old address; note says "The answer below" with no answer).
- `10b-rail` unknown law and refused date: fail (rail 2 child nodes, sentence still holds the CSRD text).
- `10b-address`: fails (hash and href still carry the address).
- `10b-note` unknown law unreadable, unknown law not kept, refused date unreadable: fail (note says "The answer below is from snapshot").
- `11-p4: tools/law.py and tools/query.py ran` fails with `No module named 'query'` only because the BASE copy has no `tools/`; it is a copy artifact, not a result.

Two verdicts pass on BASE by design, because they pin wording and behaviour that must not change: `10b-rail` "the next answer after the clearing draws the rail again", and the two `10b-note` verdicts for a shown answer (plain, interim). To prove they can fail, a mutant copy of my branch was run with (a) `drawn = null` removed from `empty` and (b) the sentence always "This page holds". Result `check.mjs: 365 passed, 14 failed`: `10b-rail` "draws the rail again" failed ("the rail is empty after a new answer"), both shown-answer `10b-note` verdicts failed, and existing checks `07-AC10`, `10-ac2`, `10-ac3`, `10-ac8`, `10-ac8c`, `10-ac12` failed too.

Code review: `/code-review low feat/gel-34-10b-clear` ran in the background. It read `git diff main...feat/gel-34-10b-clear -- web/` (non-empty), confirmed no leftover use of the removed `panel` constant and returned no findings. It did not read the test files.

## Recipe results

```
check.mjs: 384 passed, 0 failed
wcag.py: ok
3360 records checked
pairs=37 failing=0
464 passed, 1 deselected   (CI=1 python3.13 -m pytest -q -k "not all_pairs", 451 s)
```

384 is BASE 375 plus the nine new verdicts. I did not run an untouched BASE to see 375 myself.

## What I did not run and why

- An untouched BASE for the recipe's 375 line: the BASE copy was used for the fail-on-BASE proof instead, and it lacks `tools/`.
- Safari, Firefox, Lighthouse and VoiceOver (Varun's by hand). In particular whether a screen reader announces the emptied `#answer-sentence` status text.
- The story 04 AC5 500 ms check did not fail in the full run, so no rerun was needed.

## What Varun must decide

1. Observed, not changed: a typed date that is refused (2025-02-30) over a shown CSRD answer keeps the answer (panel still CSRD at 2025-06-01, date field empty, hint showing, address unchanged). Choosing another law then (Climate Action Fund Regulations 2026) draws that law at the last accepted date 2025-06-01 while the field is empty and the hint is still showing, and the address bar is rewritten to the new law and 2025-06-01. This follows story 04 AC6 ("keep the previous answer"). The story's other date criterion, about `2025-02-30` and its neighbours, says "the date message and no answer". The two wordings agree only when no answer is showing yet. Decision: keep the previous answer (as now), or hide it as soon as a typed date is refused, as an address's refused date does.
2. `web/cite.js` holds the last citation line (and Copy citation button) in the hidden `#slot-citation` after `clearAnswer` and after a no-match answer (seen in the browser; not visible, not read out, since the panel or `#answer-plain` is hidden). A two-line fix in `cite.js` (clear the slot on `GEL.onClear` and `GEL.onNoMatch`) needs a unit that owns that file.

## Open

- `web/cite.js` stale citation in hidden markup (see decision 2).
