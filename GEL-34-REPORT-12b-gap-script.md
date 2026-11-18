STATUS: done

# GEL-34 batch 4, unit C (12b-gap-script): story 12's gap script, committed

## Plan (written before any edit)

| Piece | Deliverable | Files | Check that proves it done |
|---|---|---|---|
| C1 script | `amends_gap.py`: reads `register/*/scope.json`, sorts each "Amended by" entry as named, outside the register or unresolved, prints one line, exits 1 on any unresolved or stale exception | `tools/amends_gap.py` | live run prints `unresolved 0, named 42, outside the register 18` and exits 0 |
| C2 excuse list | `amends_outside.json`: entry id to reason, the 18 rows of table B in `git show 71d2e96ed:GEL-34-REPORT-12.md` | `tools/amends_outside.json` | 18 keys, built by parsing the table rows, not typed |
| C3 test | fixture register in `tmp_path` (one of each kind), stale exception, real register | `tests/test_amends_gap.py` | 3 tests pass; each fails when the logic it covers is broken (below) |

Touched nothing else, no register file.

## The change and why

Story 13 starts on story 12's `unresolved 0`. The gap script behind that line was a scratch file in a cloud session and was never committed, so the line could not be reproduced. `tools/amends_gap.py` rebuilds it, standard library only.

- An entry whose `notes` contain "Amended by" is `named` when some entry lists its id in `amends_ids`, `outside the register` when its id is a key in `tools/amends_outside.json`, and `unresolved` otherwise.
- Output: `unresolved N, named F, outside the register M`, then one `unresolved: <id>` line each. Exit 1 when N is above 0.
- Stale exceptions (a key in `amends_outside.json` that is not an entry with an "Amended by" note, or that some entry now names) print `stale exception: <id> ...` on stderr and exit 1, so a fixed gap cannot stay hidden behind an old excuse.
- `--register <dir>` (default `register` under the repo root, so it runs from any directory). I also added `--outside <file>` (default `tools/amends_outside.json`). The brief names only `--register`, but the fixture test needs its own excuse list; without the option it would have to monkeypatch a module constant.

Live counts match the brief: 60 "Amended by" notes, 18 outside, 42 named, 0 unresolved.

## Results, pasted

Script on the branch:
```
$ python3.13 tools/amends_gap.py
unresolved 0, named 42, outside the register 18
```

Test, three new tests:
```
$ ~/.cache/gel34-py311/bin/python -m pytest -q tests/test_amends_gap.py
...                                                                      [100%]
3 passed in 0.11s
```

Each test fails when its logic breaks (by hand, file restored after each):
- `return 1 if unresolved or stale` changed to `return 1 if unresolved`: `test_stale_exception_fails` fails (1 failed, 2 passed).
- changed to `return 1 if stale`: `test_unresolved_fails_then_passes_once_listed` fails (1 failed, 2 passed).
- Real register with `is-ets-log` removed from a copy of the JSON: `unresolved 1, named 42, outside the register 17`, `unresolved: is-ets-log`, exit 1.
- Real register with a made-up id added to a copy of the JSON: `stale exception: ghost-id in outg.json is not an entry with an 'Amended by' note`, exit 1.

Recipe step 4:
```
wcag.py: ok
3360 records checked
pairs=37 failing=0
```

Recipe step 5:
```
$ CI=1 python3.13 -m pytest -q -k "not all_pairs"
467 passed, 1 deselected in 459.52s (0:07:39)
```
That is BASE's 464 plus the 3 new tests. The first attempt hit the 120 s tool limit and ran in the background. Another worker's Chrome check (unit 04d-title) was running at the same time, which may be why it took 7.6 minutes; I did not time it alone.

Code review: the `code-review` skill at level `low`, target `feat/gel-34-12b-gap-script`. It read a non-empty diff (`git diff main...feat/gel-34-12b-gap-script`, the three new files; local `main` is BASE) and answered `(none)`. At this level it skips test hunks, so `tests/test_amends_gap.py` was not reviewed by it. The skill runs as a forked agent; I started no subagent myself.

## What I did not run and why

- Recipe steps 1 to 3 (web data build, expected files, `check.mjs`): the brief says unit C runs steps 4 and 5 only. No browser, no ports.
- No new browser check, so no BASE-copy failure proof for one; the failure proofs for the script are the mutations above.

## What Varun must decide

- The two Bolivian entries (`bo-asfi-rmv-green-bonds`, `bo-asfi-revision-externa`) sit in `amends_outside.json` with story 12's reason, which still carries the open question from story 12's report ("link them, or leave them?" to `bo-asfi-fondo-inversion-sostenible`). The script does not settle it: if they get linked, the script will report both ids as a stale exception until their JSON rows are removed.
- Keep `--outside`, or drop it and have the test patch the constant? I kept it because it is one line and keeps the test off module internals.
