# GEL-34 story 02 report

- Model: claude-sonnet-5-5
- Python: 3.13.18 (3.11 has no pytest in this container; the builder was also run on 3.11, see below)
- BASE: f53d11a5351230c5369a78fc4040fd4d2c90c2ae (story 01 branch tip, fast-forward)
- Refs at start: `origin/main` 0b93d75374ebf99749486a24ccf9fa217067a2b8, `origin/history` 55c8c2a9c1d8fdbb40fd2d5334ac397b743d76e7 (matches the dispatch).

## Plan (written before any edit)

| Piece | Deliverable | Files | Check that proves it done |
|---|---|---|---|
| 1 | `intervals` per entry with version rows, built from `query.lookup` at each change date | `tools/web_data.py` | live build; fixture tests; counts below |
| 2 | Seven named fixture tests plus file-shape test | `tests/test_web_data_intervals.py` | each passes; each fails once when its rule is broken on purpose (mutations listed below) |
| 3 | All-pairs test against `law_in_force`, reading the written file | `tests/test_web_data_intervals.py` | `pairs=<n> differ=<n>` printed, n greater than 0 asserted |
| 4 | Measurements: size delta, run time, interval count, suite run, `CI=1` run | this report | commands and outputs below |

Subagents: pieces 1 to 3 share one rule (what an interval is) and the test file has one writer, so I wrote them in sequence myself. No independent piece to split.

## What I did

- `tools/web_data.py`: added `_intervals(repo, ref, iso2, entries)` and one call to it at the end of `build`. For each place, the change dates are the version `in_force` dates and the `applies_from` of entries with version rows (all 17 `applies_from` values are real calendar dates; a bad one raises). `query.lookup(iso2, d, repo, ref)` runs at each date. Per entry with version rows:
  - in `found`: `in_force`, commit from `lookup`, `not_yet_applying` when `lookup` sets it;
  - not in `found`, and a repeal row on or before the date: `repealed`, commit of the latest such repeal row (first in the entry's sorted rows when two share a day, which is language then commit, so `fi` before `sv`);
  - not in `found`, no repeal row: it must be in `not_yet` (the leading "not yet", no interval), else the build raises.
  - An interval equal to the previous one (same state, commit, flag) is dropped; the same state with a different commit or flag is kept.
- One change from the story's wording: the story says "in `not_yet` only is the leading not yet". An instrument repealed with a later record pending (the "repeal blocks a later unflagged record" case) is also in `not_yet` only, and leaving it out would make the page read "in force" after the repeal. I use the repeal row on or before the date to tell the two apart. The fixture `test_fixture_repeal_blocks_a_later_unflagged_record` covers it.
- `tests/test_web_data_intervals.py` (12 tests): 7 named rule fixtures, a same-day repeal determinism test, a link-only plus file-equals-`build` test, a test that the comparison itself fails on a wrong interval, and 2 real-data tests (file shape plus the three real instruments; the all-pairs run). The test writes the file with the builder's command line (`--out` path) and reads it back from disk. The only builder import is `from web_data import build`, used once for the file-equals-build check. Expected answers come from `query.law_in_force`.
- The expected answer separates "not yet" from "repealed" using only `law_in_force`: not in `in_force` and listed in `not_yet_in_force` and never in force at an earlier probe of the place = not yet; anything else not in force = repealed. A repealed answer must also name a repeal row on or before the date, the latest one. So a dropped instrument cannot pass as repealed.
- Not done by subagents: no independent piece (see the plan).

## Acceptance criteria

1. **File shape.** `check_file_shape` on the written real file and on every fixture: sorted by `from`, no duplicate `from`, each `commit` one of the entry's version rows, a repealed `from` equals its repeal row's `in_force`, first `from` equals the entry's first version date, no `intervals` on entries without version rows. `test_real_file_shape_and_known_instruments`: 851 entries with intervals. PASS.
   Real instruments: `eu-csrd-2022-2464` froms 2023-01-05, 2025-04-17, 2026-03-18; `gn-arrete-2022-1646-evaluations-environnementales` last interval repealed from 2023-05-05; `fi-paastokauppalaki-2011` last interval repealed from 2024-01-01 on repeal row `61850073` (language `fi`, the other repeal row is `cc95dac5` `sv`). The build is byte-identical on 3.13 twice and on 3.11.
2. **All pairs.** Test output (Python 3.13.18, `CI=1`, inside the full suite):
   `intervals=2646 places_with_versions=140 pairs=6802 instrument_pairs=59492 differ=0 seconds=212`
   `pairs` counts (place, date) probes: 6692 for the 140 places with version rows (change dates, day before, day after, `9999-12-31`) plus 110 places with no version rows, one probe each, where `law_in_force` returned an empty in-force list. `instrument_pairs` is every instrument with version rows at every probe. The in-force id sets are compared at every probe. The test asserts `places_with_versions` equals the places in the history (independent of the file) and is over 100, and `pairs` and `instrument_pairs` are over zero, so an empty loop cannot pass. PASS.
3. **Fixtures.** One named test per item, each run once with the rule broken on purpose in `tools/web_data.py` (file restored afterwards, `git diff` shows only the intended change):

| Rule | Test | Mutation | Result |
|---|---|---|---|
| repeal | `test_fixture_repeal` | repealed state never emitted | fails (and 4 others) |
| repeal blocks later unflagged record | `test_fixture_repeal_blocks_a_later_unflagged_record` | a later unflagged row after a repeal starts an in-force interval | fails (only this one) |
| flagged re-enactment | `test_fixture_flagged_reenactment_reads_in_force_repealed_in_force` | no in-force interval after a repealed one | fails (only this one) |
| consolidated and adopted, one date | `test_fixture_consolidated_and_adopted_on_one_date` | commit taken from the first row of the date, not from `lookup` | fails (only this one) |
| translation-only later date | `test_fixture_translation_only_later_date` | commit taken from the latest non-repeal row | fails (only this one) |
| publication-dated row | `test_fixture_publication_dated_row` | publication-dated rows not probed | fails (only this one) |
| `applies_from` after the date asked | `test_fixture_applies_from_after_the_date_asked` | `applies_from` not a change date | fails (only this one) |
| (extra) different commits not merged | `test_fixture_repeal` and 2 more | dedupe on state only | fails |
| (extra) same-day repeal rows | `test_fixture_two_repeal_rows_on_one_day_pick_the_same_one_every_build` | pick the last row | fails (only this one) |

   The flagged re-enactment fixture checks that `re_enactment` reached the file's version rows, so it ran with a re-enactment in the data (0 live rows carry the flag). PASS.
4. **Expected answers from `law_in_force` only.** The test imports `query` (for `law_in_force`, `envelope`, `_commits`) and `build` from `web_data`, nothing else from the builder. PASS.
5. **Real run numbers.** Below.

## Real run numbers

| Item | Value |
|---|---|
| Builder run time, `--ref origin/history` | 10.7 s on 3.11, about 11 s on 3.13 (story 01 alone: 4.2 s) |
| All-pairs test run time | 212 s (209 s in the first run), under 5 minutes, so it stays in the normal suite |
| Interval count | 2646 (2629 in force, 17 repealed; 20 carry `not_yet_applying`) |
| Entries with intervals | 851 (all entries with version rows); 553 without |
| `wc -c` before / after | 1,926,669 / 2,185,141 bytes, delta +258,472 (0.26 MB) |
| gzip, default | 308,887 / 335,989, delta +27,102 |
| gzip -9 | 302,987 / 331,041, delta +28,054 |

- Size: the story's estimate was 0.09 MB raw and 32 KB gzipped. The raw delta is about 2.9 times that (each interval carries a 40-character commit). The gzipped delta is slightly under the estimate. The frozen before-number for gzip, 302,851, is 136 bytes under my `gzip -9` figure of 302,987 (the 308,887 figure is plain `gzip`); the raw size matches exactly.
- Fewer lookups than the prototype: the prototype probed every date; the builder calls `lookup` once per change date, about 3,000 calls.

## Counts re-read (2026-11-17, `origin/history` 55c8c2a9c, 3360 records)

| Count | Story | Live |
|---|---|---|
| places with version rows | 140 | 140 |
| (place, probe date) pairs, rows-bearing places | 6692 | 6692 (6802 with the 110 places without rows) |
| instrument-date pairs | 59,492 | 59,492 |
| differ | 0 | 0 |
| intervals | 2,646 | 2,646 |
| entries with `applies_from` | 17 | 17 |
| `date_basis: publication` rows, translation rows | 11, 116 | 11, 116 (story 01 counts, unchanged) |
| rows with `re_enactment` | 0 | 0 |
| `law_in_force` per call, envelope replaced | 0.092 s | 0.031 s average (212 s over 6802 calls) |

No count differs from the story. The `law_in_force` cost per call is lower than the story's 0.092 s, so the full run is about 3.5 minutes, not 10.

## Tests

- BASE, `python3 -m pytest -q`, Python 3.13.18: 407 passed in 103.6 s.
- Branch, `CI=1 python3 -m pytest -q -rs -s`, Python 3.13.18: 419 passed in 339.4 s (407 plus 12 new), no skips.
- Python 3.11.18 has no pytest here, so the suite was not run on 3.11. The builder CLI output on 3.11 is byte-identical to 3.13.

## What is left

- Python 3.11 test run is not done (no pytest on that interpreter here).
- Language choice is not covered: intervals are built with no language set, as the story says.
- A repeal that comes before any in-force record, with later records pending, is read as repealed by the builder. `law_in_force` would list that instrument as not yet in force. 0 live entries hit it (the all-pairs test finds 0 differ); the test would report it as a difference if one appeared.
- The suite is now 339 s with `CI=1`, of which 212 s is the all-pairs test.

## What Varun must decide

1. Whether the all-pairs test (212 s, under the 5 minute line) stays in every normal run, or moves to a separate slower job. It fits the line today and a change of place count would raise it, since cost scales with places times change dates.
2. Whether the 0.26 MB raw growth (not 0.09 MB) is acceptable for the page. Gzipped it is 27 KB.
