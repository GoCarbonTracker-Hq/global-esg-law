# GEL-34 story 01 report

## Plan (written before any edit)

The story is one module plus its tests, so the split has two pieces. Both share one fixture and the module's API, so I write them myself in sequence and skip subagents (a second writer on a 150-line file would add coordination cost and no speed).

| Piece | Deliverable | Files | Check that proves it done |
|---|---|---|---|
| 1 | `build(repo, ref, read_on)` and the CLI | `tools/web_data.py` | live run with `--ref origin/history` gives the counts in the story |
| 2 | Tests: temp-repo fixtures plus real-data checks | `tests/test_web_data.py` | `python3 -m pytest tests/test_web_data.py` passes with no skip |
| 3 | Live measurements: counts, size, side-by-side with `tools/law.py`, instrument and shared-date recount | this report | commands and outputs pasted below |

Refs read at start: see "Counts re-read".

## What I did

- Added `tools/web_data.py`: `build(repo, ref, read_on=None)` and a CLI (`--ref` and `--out` required, `--repo`, `--read-on` default today). Rules come from `query.envelope`, `_scope`, `_register_tiers`, `_labels`, `list_places`, `_load_record`. Output is compact JSON, keys sorted, entries sorted by place then id, written to the `--out` path only.
- Added `tests/test_web_data.py` (14 tests): 9 on a temporary repo, 2 real-data tests that skip with the shared `NO_HISTORY` reason (so they fail on CI if history is missing), 1 five-entry comparison with `tools/law.py`, plus CLI tests.
- The builder raises if an id sits in two scope files or a history row has an id in no scope file, so dropped rows cannot pass silently.
- Not done by subagents: one module and one test file, no independent pieces to split.

## Counts re-read (2026-11-17, `origin/history` = `55c8c2a9c1d8fdbb40fd2d5334ac397b743d76e7`, `origin/main` = `0b93d7537`, 3360 commits)

All match the story. No difference found.

| Count | Story | Live |
|---|---|---|
| scope files = `places` keys | 250 | 250 |
| entries, unique ids | 1404 | 1404 / 1404 |
| with versions / none | 851 / 553 | 851 / 553 |
| version rows | 3360 | 3360 |
| consolidated / adopted / translation / repeal | 2444 / 779 / 116 / 21 | 2444 / 779 / 116 / 21 |
| link only with `register_date` | 294 | 294 (0 on stored entries) |
| `date_basis: publication` rows | 11 | 11 |
| repeal rows with `message` | 19 of 21 | 19 of 21; the two without are `ie-si-490-2012`, `ie-si-755-2020` and carry no key |
| rows with `copy: "archive"` | 0 | 0 (`archive.org` appears 0 times in the file) |
| `envelope()` time | 4.17 s | the whole build took 4.19 s |

Tier join: `A` 1299, `B` 100, `C` 2, `tracker_pointer` 1, `not available` 2. So the register join works (a failed join would read "not available" for most). `tier_label` "A, unverified" on 158 entries.

## Acceptance criteria

1. **Real build.** `python3 tools/web_data.py --ref origin/history --out /tmp/gel34-data.json --read-on 2026-11-17`, exit 0. Snapshot: `history_commit` 55c8c2a9c1d8fdbb40fd2d5334ac397b743d76e7, `working_tree_commit` 0b93d75374ebf99749486a24ccf9fa217067a2b8, `read_on` 2026-11-17. `coverage.status` "matches working tree". Counts as in the table. PASS.
2. **History, not working tree.** `test_follows_history_not_working_tree`: an extra record in `records/` that history lacks leaves 2 version rows and `coverage.status` "history trails working tree". PASS.
3. **No `--ref`.** `test_cli_requires_ref`: non-zero exit (argparse code 2), stderr names `--ref`, no file written. Also confirmed by hand: `error: the following arguments are required: --ref`. PASS.
4. **Link only.** `test_link_only_entries_and_register_date` plus the live count: 553 with `versions: []`, 294 with `register_date`, 0 on stored entries. PASS.
5. **Message, copy, forbidden keys.** `test_repeal_message_archive_and_no_stray_keys` (fixture with message, without message, `web.archive.org` source) and `test_archive_host_rule_ignores_look_alikes`. Real file: 19 of 21 repeals have `message`, 0 non-repeal rows have it, 0 `copy` rows. `grep -c -E '"(text|evidence|notes|source_row)":'` on the real file prints 0. The archive rule is tested by fixture only because no live row matches. PASS.
6. **Byte-identical builds.** `cmp /tmp/gel34-data.json /tmp/gel34-data-b.json` prints nothing (identical); Python 3.11 output is also identical to 3.13 output. `read_on` is the `--read-on` date. PASS.
7. **Size.** `wc -c /tmp/gel34-data.json` = 1,926,669 bytes; `gzip -c /tmp/gel34-data.json | wc -c` = 308,891 bytes. Estimate: 1.85 MB and 303 KB. Ratio about 1.04 raw and 1.02 gzipped, far under the 2x line. PASS, no finding for Varun on size.
8. **Five entries against `tools/law.py`.** Test `test_real_five_entries_match_law_py`, and printed side by side here (date asked = the entry's last `in_force`):

| Case | Entry | File | law.py / `law_in_force` |
|---|---|---|---|
| stored | EU eu-csrd-2022-2464 | 3 rows, last 2026-03-18 consolidated d27225e8f, tier A | 2026-03-18 consolidated d27225e8f |
| link only | AG ag-eccb-climate-risk-standard | `versions` [], `register_date` 2024-03-01, tier A, `official_text_seen`, unverified false | same labels in `link_only` |
| repealed | AX ax-biodrivmedel-ghg-lag-2018-41 | consolidated 2018-10-01, repeal 2025-11-01 with message | not in force on 2025-11-01 |
| publication-dated | BJ bj-climate-change-act-2018 | adopted 2018-08-06 `date_basis: publication` | 2018-08-06 adopted 2fa688eee, `date_basis` publication |
| shared-date | AT at-ezg-2011 | adopted and consolidated both on 2011-12-13, 9 more rows | on 2026-01-01 480cbe4e6 matches the last row |

   PASS. I did not print `tools/law.py` output for the shared date itself (2011-12-13), so the same-day preference (consolidated over adopted) is covered only by `query._version`, which the builder does not touch: both same-day rows stay in `versions` and the page picks with Story 2's `intervals`.
9. **Recount.** Rule: an instrument is an entry with at least one version row; shared-date means two or more non-repeal rows on one `in_force` date.
   Command: a Python loop over `/tmp/gel34-data.json` entries (`Counter` of `in_force` per entry over `kind != "repeal"` rows, `any(n >= 2)`).
   Output: `instruments 851 shared-date 216`. Matches the story (851 and 216). The UX spec's 215 of 852 does not match: 851 is the live instrument count.

## Test run

- `python3 -m pytest -q` (Python 3.13.18): 407 passed in 74.25 s, no skips. `CI=1 python3 -m pytest tests/test_web_data.py -q -rs`: 14 passed.
- Python 3.11.18 has no pytest here, so the suite was not run on 3.11. I ran the CLI on 3.11 and compared the output with the 3.13 file: identical.

## Left out or unverified

- `amends` (160 scope entries today) is not carried. The story names `amends_ids` (Story 12) and `aliases` (Story 3), which no scope entry has yet; the code passes them through when they appear. `tools/law.py` prints `amends` today.
- `tests` workflow on 3.11 not seen to run (no pytest on that interpreter here).
- The AR5 archive rule has no live row to act on.
- Nothing is committed to hosting and no output file is committed.

## For Varun to decide

1. Whether the page needs `amends` before Story 12 renames it to `amends_ids`. Today it is dropped.
2. The UX spec says 215 of 852 instruments; live is 216 of 851. The spec figure needs a fix.
3. AR5 premise: 0 of 3360 rows are archive copies. Keep the rule or drop the requirement.
