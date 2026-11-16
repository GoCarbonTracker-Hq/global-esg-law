# Changelog

What changed in the corpus, the tools and the documentation, newest first. Each entry starts with a status word:

- **Added:** new in the repository.
- **Changed:** works or reads differently from before.
- **Fixed:** was wrong, now corrected.
- **Open:** found and reported, not yet fixed.

The log starts on 2026-11-10. Earlier work is in the git history and in the dated notes under `upkeep/`.

## 2026-11-16
- **Added:** 16 EU-level instruments on EUR-Lex, with adopted and consolidated English texts (70 new record files), scope entries, register rows and Cellar watchers: emissions trading and carbon pricing (ETS Directive 2003/87/EC, Regulations (EU) 2018/2066 and 2018/2067, CBAM 2023/956), green claims and deforestation (Directives 2024/825 and 2005/29/EC, Regulation 2023/1115), reporting and due diligence (Directive 2013/34/EU, Regulations 2017/821, 2024/3015 and 2023/1542), climate framework and sustainable finance (Regulations 2021/1119, 2023/2631, 2024/3005, 2019/2089 and 2016/1011). In `in_force`, the date of entry into force is used; where an act applies later the application date is in the scope entry's notes.
- **Open:** the `history` branch has not been rebuilt for these records.

## 2026-11-15
- **Added:** deep review report in `tickets/GEL-33-deep-review.md`.
- **Open:** `check_corpus.py`, `publish_gate.py`, `update.py`, and `build.py` use last-row-wins dict lookup for duplicate `source_id`s in `sources.json` (`F2-2`, S1).
- **Open:** `acceptance_mcp.py` lacks a negative check for a licence-denied stored record and passes if `link only` `read_text` leaks `text` (`F2-3`, S1).
- **Open:** `update.py` leaves `queue.csv` marked `stored` and 4 staged files on `main` when `git commit` fails (`F4-1`, S1).
- **Open:** `query.py` `_version()` only prefers `consolidated` over `adopted` when both share the same language, and same-language `translation` overwrites `consolidated` (`F1-1`, S2).
- **Open:** `query.py` `lookup()` compares `on` as an unvalidated string (`F1-2`, S2).
- **Open:** `query.py` `read_text()` compares only `verdict` across duplicate `source_id` rows, suppressing ambiguity in licence URL, terms, or place (`F2-4`, S2).
- **Open:** `publish_gate.py` checks `scope.json` `source_row` instead of each record's `source_id`, and ignores orphan records (`F2-5`, S2).
- **Open:** `coverage.py` drops 152 `stored` scope entries from the `COVERAGE.md` grid due to `(iso2, title)` join mismatch (`F3-1`, S2).
- **Open:** `register/register.csv` has 7 duplicate `(iso2, instrument_title)` groups across 19 rows (`F3-3`, S2).
- **Open:** `update.py` aborts the entire batch on any mid-batch transport exception (`F4-2`, S2).
- **Open:** `watch.py --reseed` can silently swallow a real law change (`F4-3`, S2).
- **Open:** no concurrency control across `watch.py`, `queue.py`, and `update.py` (`F4-5`, S2).

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
