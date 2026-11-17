# Changelog

What changed in the corpus, the tools and the documentation, newest first. Each entry starts with a status word:

- **Added:** new in the repository.
- **Changed:** works or reads differently from before.
- **Fixed:** was wrong, now corrected.
- **Open:** found and reported, not yet fixed.

The log starts on 2026-11-10. Earlier work is in the git history and in the dated notes under `upkeep/`.

## 2026-11-17
- **Added:** nine UK instruments from legislation.gov.uk, 50 record files, each with a scope entry, register rows and a watcher with a baseline row: SECR (SI 2018/1155), SI 2008/410 Schedule 7 Part 7, the UK ETS Order 2020 and the Climate Change Act 2008 Part 1 (PR #90), then SI 2022/46, Modern Slavery Act 2015 s.54, the Digital Markets, Competition and Consumers Act 2024 Part 4 Chapter 1, the ESOS Regulations 2014 and SI 2021/839 (PR #91). Issue #16 Part B; Parts C to E are not started.
- **Added:** `tools/update.py` takes a text file fetched by hand (`--file`, `--url`, `--plain`, `--language`) and a reviewer's in-force date (`--in-force`). The record gets `supplied_by_hand: true` and the commit, and the `history` commit, a `Supplied-by: hand` trailer (PR #89, issue #21 R1 and part of R3).
- **Changed:** Namibia (`NA-BON-ADOPTED`) and Sudan (`SD-MOJ-CONSOLIDATED`) are `permission requested`. Their 8 stored records (1 Namibian, 7 Sudanese) are removed and the entries are link only (PR #88, issue #18 R1).
- **Changed:** `IS-STJORNARTIDINDI-ADOPTED` passes on article 9 of the Icelandic Copyright Act, and `is-ets-regulation-606-2021` is stored; the other five Icelandic entries stay link only. Article 9 was read in a Wayback copy (2026-10-17) of the Althingi page, because althingi.is refuses automated fetches. Amending regulations after 2021 are not folded in (PR #87, issue #18 R3).
- **Changed:** 17 statute passes whose publisher terms forbid copying start their `notes` with `TERMS-CONFLICT:` in `sources/licence-table.csv`, and a test keeps the marker on statute rows only (PR #85, issue #18 R2).
- **Changed:** 23 stored scope entries now say in `notes` why `in_force` is null (no commencement clause or date in the stored text); `in_force` is unchanged. `pe-cnc-res-001-2026-ef30` and `tn-loi-2015-36` were left out because their text does carry a date (PR #86, issue #58).
- **Changed:** gate on `main` `9db1a6a91`, as of 2026-11-17: `3360 records checked`, `publish_gate` exit 0, `393 passed` (Python 3.13).
- **Open:** issue #21 R3 also asks for `--evidence TEXT` and new queue columns on the confirm step; neither is built, so a reviewer's date has no recorded evidence. R2 and steps U4 and U6 of that issue are not built either.
- **Open:** the `history` branch is not rebuilt. Lookups still serve the 8 Namibian and Sudanese texts and do not serve the Iceland and GB records.
- **Open:** `watch.py --dry-run --source UK-LEGISLATION-ADOPTED` reports `terms_changed` for `terms-uk-legislation-adopted`: the Open Government Licence page hash differs from the 2026-11-11 baseline. The licence row needs a re-read before the next release.
- **Open:** issues #16, #18, #21 and #58 stay open. 72 stored scope entries still have `in_force: null`.
- **Fixed:** the GEL-33 findings listed under 2026-11-15, in PRs #72 to #81, each with a regression test that fails on the old code. Gate on `main` `15cfff633`, as of 2026-11-17: `3317 records checked`, `publish_gate` exit 0, `373 passed` (Python 3.13), acceptance from a fresh clone `53 passed, 0 failed` (was 46). No record file changed, so the published `history` stays at `c76381e2f`.
- **Fixed:** `check_corpus.py` requires scope status `stored`, a real `in_force` date, and a `fetched_url` and 64-hex `fetched_sha256` on every record that is not a `repealed: true` stub. It is strict by default, and `update.py` and `build.py` use it. `check_corpus.py` and `publish_gate.py` reject an `--iso2` that is not two capital letters with a `register/XX/scope.json` (PR #77, issue #53).
- **Fixed:** `watch.py` no longer updates `checked_on` after a failed check, and `ni-ley-1061-lagaceta-ediciones` is seeded in `upkeep/seen.json` (PR #73, issue #57). `queue.py` writes `queue.csv` through a temp file (PR #74).
- **Fixed:** the 22 watchers that had no `queue.csv` row (5 `terms-*`, `ni-ley-1061-lagaceta-ediciones`, 16 `eu-*-cellar-*`, all seeded with `--reseed`) now have a `baseline` row, decided `reject` under rule N0 like the other baseline rows. `watch.py --reseed` writes a baseline row when a watcher has none, and a test checks that every watcher in `upkeep/watchers.json` has a row (related to issue #57).
- **Changed:** `MAINTAINING.md` and `MCP.md` match the code; the hardcoded test and record counts are gone (PR #79, issue #52).
- **Changed:** `dk-transport-ghg` has `in_force` 2009-07-01 and `tw-annual-report-regs` 1989-01-01 in `scope.json`, and three Argentine entries now say in their evidence why `in_force` stays null (PR #81, issue #58).
- **Open:** 72 stored scope entries still have `in_force: null`, and the 259 link-only entries are untouched (issue #58).
- **Open:** owner decisions: scope expansion (issue #16), licence table verdicts (issue #18), the update path for most sources (issue #21), and the items of issue #17 not listed above.
- **Open:** found while fixing, not fixed: 156 `seen.json` entries carry a `checked_on` written by a failed run; 24 list watchers hold empty signals; `tools/triage.py` still builds a last-row-wins dict; `update.py` `save_queue()` overwrites in place; `default_fetch` can raise on a corrupt gzip body; `reseed()` skips the empty-list check; `records/CM/test-dir/test.txt` is a tracked non-JSON file no gate refuses.

## 2026-11-16
- **Added:** optional `applies_from` and `applies_note` fields on scope entries, shown by `tools/law.py` and the MCP server with a `not_yet_applying` flag, because an instrument can enter into force years before its duties apply (Forced Labour Regulation: in force 2024-12-13, main prohibition from 2027-12-14). Set for 17 EU entries from dates read in the acts or their scope notes. Entries without the field have no recorded application date; CSRD is one of them. `check_corpus.py` refuses a malformed `applies_from`.
- **Added:** 16 EU-level instruments on EUR-Lex, with adopted and consolidated English texts (70 new record files), scope entries, register rows and Cellar watchers: emissions trading and carbon pricing (ETS Directive 2003/87/EC, Regulations (EU) 2018/2066 and 2018/2067, CBAM 2023/956), green claims and deforestation (Directives 2024/825 and 2005/29/EC, Regulation 2023/1115), reporting and due diligence (Directive 2013/34/EU, Regulations 2017/821, 2024/3015 and 2023/1542), climate framework and sustainable finance (Regulations 2021/1119, 2023/2631, 2024/3005, 2019/2089 and 2016/1011). In `in_force`, the date of entry into force is used; where an act applies later the application date is in the scope entry's notes.
- **Changed:** the published `history` branch was rebuilt and replaced (commit `c76381e2`, 3,317 commits; the build before it was `82181f25`). It holds the 70 records above. Two builds gave the same head. Commit ids on `history` changed for all but the first 131 commits, so anyone who fetched the old branch needs to fetch it again. The Cite line, `CITATION.cff` and `MAINTAINING.md` name the new build.

## 2026-11-15
- **Added:** deep review report in `tickets/GEL-33-deep-review.md`.
- **Fixed:** `check_corpus.py`, `publish_gate.py`, `update.py`, and `build.py` use last-row-wins dict lookup for duplicate `source_id`s in `sources.json` (`F2-2`, S1). Now one `load_sources()` in `tools/make_sources.py` groups rows by id and raises on conflicting duplicates; the four tools and `queue.py` use it (PR #72, PR #74).
- **Fixed:** `acceptance_mcp.py` lacks a negative check for a licence-denied stored record and passes if `link only` `read_text` leaks `text` (`F2-3`, S1). Now it asserts `text` is null on the link-only answer and refuses a stored record whose source fails the licence check (PR #78).
- **Fixed:** `update.py` leaves `queue.csv` marked `stored` and 4 staged files on `main` when `git commit` fails (`F4-1`, S1). Now a failed `git add` or `git commit` resets the index, deletes the branch, restores the files and writes `queue.csv` back as it was (PR #74).
- **Fixed:** `query.py` `_version()` only prefers `consolidated` over `adopted` when both share the same language, and same-language `translation` overwrites `consolidated` (`F1-1`, S2). Now consolidated ranks above adopted and adopted above translation, across languages (PR #76).
- **Fixed:** `query.py` `lookup()` compares `on` as an unvalidated string (`F1-2`, S2). Now it raises `ValueError` for a date that is not a real `YYYY-MM-DD` (PR #76).
- **Fixed:** `query.py` `read_text()` compares only `verdict` across duplicate `source_id` rows, suppressing ambiguity in licence URL, terms, or place (`F2-4`, S2). Now it compares whole rows, so duplicates that differ in any field withhold the text (PR #76).
- **Fixed:** `publish_gate.py` checks `scope.json` `source_row` instead of each record's `source_id`, and ignores orphan records (`F2-5`, S2). Now it checks each record's `source_id` against the scope entry and refuses record folders no scope entry references (PR #77).
- **Fixed:** `coverage.py` drops 152 `stored` scope entries from the `COVERAGE.md` grid due to `(iso2, title)` join mismatch (`F3-1`, S2). Now scope entries match register rows by `scope_id`, exact title, or a URL that only one row and one entry share (PR #80): stored entries missing from the grid fell from 152 to 6, and 23 entries of any status still have no grid row.
- **Fixed:** `register/register.csv` has 7 duplicate `(iso2, instrument_title)` groups across 19 rows (`F3-3`, S2). Now nine rows are removed (PR #80); the two LU bill 8370 rows stay, because their law family differs and the choice is a policy call.
- **Fixed:** `update.py` aborts the entire batch on any mid-batch transport exception (`F4-2`, S2). Now a transport error refuses that row, with the reason in its notes, and the batch continues (PR #74).
- **Fixed:** `watch.py --reseed` can silently swallow a real law change (`F4-3`, S2). Now `--reseed` writes a `new_version` row for each unseen signal of a list watcher (PR #73).
- **Fixed:** no concurrency control across `watch.py`, `queue.py`, and `update.py` (`F4-5`, S2). Now `flock` on `upkeep/.lock` guards the read-modify-write of `seen.json` and `queue.csv` (PR #75).

- **Changed:** the published `history` branch was rebuilt and replaced (commit `82181f25`, 3,247 commits; the build before it was `745289cd`). It now holds the seven records added on 2026-11-15. Commit ids on `history` changed, so anyone who fetched the old branch needs to fetch it again. The Cite line, `CITATION.cff` and `MAINTAINING.md` name the new build.

## 2026-11-13
- **Changed:** the README says how to start the assistant server and names its four tools.
- **Added:** the MCP tool `instrument_history`: every stored version of one instrument in in-force order, with kind, languages, source, licence and any repeal; a link-only instrument answers that it is not stored and gives its official URL.

- **Changed:** the published `history` branch was rebuilt and replaced (commit `745289cd`, 3,240 commits; the build before it was `7b5ed3a7`). Lookups on it now carry the fixes below. Five instruments show their consolidated text where they showed the adopted one (four Belgian instruments and `tr-iklim-kanunu`), records dated by publication carry a note, and the Christmas Island plastic bag local law is included. Commit ids on `history` changed, so anyone who fetched the old branch needs to fetch it again. The Cite line and `CITATION.cff` name the new build.
- **Added:** the `read_text` tool of the MCP server: the text of one instrument as in force on a date, in parts, returned only when the licence verdict of its source row in `sources.json` is `pass`, with an OCR flag.
- **Added:** `MCP.md` (setup, tools, limits), a README section that links to it, and `tools/acceptance_mcp.py`, which tests the MCP server from a fresh clone.
- **Added:** a read-only query layer and local stdio MCP server with `list_places` (no argument: a compact table of columns and rows, one reply line under 30,000 characters; with `place`: one place and its instruments), supporting MCP 2026-07-28 and 2025-11-25.
- **Added:** the MCP tool `law_in_force(place, date, lang?)`, which lists the instruments in force in a place on a date (same list as `tools/law.py`), link-only instruments apart, tier and verification where the scope file gives them, and a named reason when the answer is empty.
- **Fixed:** lookups choose consolidated text over adopted text on the same date, mark publication dates when commencement is unknown, keep repealed instruments out of force unless a later record is flagged `re_enactment`, retain the earlier official text when a later version has only translations, and list future versions or repeals for active instruments. The publish gate rejects unflagged records dated on or after repeal. The `history` branch was rebuilt locally as `history-gel-32-01`; the published `history` branch was not changed.
- **Fixed:** two stale figures in the README and `MAINTAINING.md`, both reported in [#17](https://github.com/GoCarbonTracker-Hq/global-esg-law/issues/17). OCR records are 106, not 104, and the last full watcher run on record is the one of 2026-11-11 (158 failures across 1557 watchers), not the run of 2026-11-10.
- **Fixed:** the law family table in the README. The version published on 2026-11-12 described F4, F6 and F7 wrongly (it was inferred from register topics). The table now follows the project's scope definition: F4 is mandatory CSR and social duties, F6 is sustainable finance, and F7 is environmental core law listed as candidates only.
- **Added:** this changelog and a pull request template.
- **Added:** a `tests` workflow that runs the tests, the corpus check and the publish gate on every pull request and on `main`, on Python 3.11 and 3.13 (pull request #19). This closes the "no continuous integration" part of [#17](https://github.com/GoCarbonTracker-Hq/global-esg-law/issues/17).
- **Changed:** the README is shorter. The list of places with links only is read from `COVERAGE.md`, and the record format moved to `MAINTAINING.md`.

## 2026-11-12

- **Changed:** the README was rewritten for visitors. It opens with what is stored (140 places, 831 of 1378 instruments), defines the law families F1 to F7, says how the text and the licence verdicts were produced, and has a hero image and a how-it-works figure.
- **Added:** `MAINTAINING.md`, `CONTRIBUTING.md`, `CITATION.cff` and an issue form for wrong or missing law.
- **Fixed:** `LICENSE` is the verbatim CC0 1.0 text again, so GitHub recognises it. The note that law texts are not covered is in the README.
- **Changed:** the repository moved to the GoCarbonTracker-Hq organization. The old address redirects.
- **Changed:** watchers that fired on page furniture, not on the law text, were moved from a page hash to a text hash, and queue rows that were not real changes were rejected (pull requests #8 to #13).
- **Open:** scope gaps in carbon pricing, green claims and supply chain due diligence ([#16](https://github.com/GoCarbonTracker-Hq/global-esg-law/issues/16)).
- **Open:** tool defects found by a code review ([#17](https://github.com/GoCarbonTracker-Hq/global-esg-law/issues/17)).
- **Open:** two `pass` licence verdicts in doubt after an audit of a sample of the licence table ([#18](https://github.com/GoCarbonTracker-Hq/global-esg-law/issues/18)).

## 2026-11-10

- **Changed:** every place in the register has a scope file, and `COVERAGE.md` and the coverage grid were regenerated.
