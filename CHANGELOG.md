# Changelog

What changed in the corpus, the tools and the documentation, newest first. Each entry starts with a status word:

- **Added:** new in the repository.
- **Changed:** works or reads differently from before.
- **Fixed:** was wrong, now corrected.
- **Open:** found and reported, not yet fixed.

The log starts on 2026-11-10. Earlier work is in the git history and in the dated notes under `upkeep/`.

## 2026-11-13

- **Changed:** the published `history` branch was rebuilt and replaced (commit `745289cd`, 3,240 commits; the build before it was `7b5ed3a7`). Lookups on it now carry the fixes below. Five instruments show their consolidated text where they showed the adopted one (four Belgian instruments and `tr-iklim-kanunu`), records dated by publication carry a note, and the Christmas Island plastic bag local law is included. Commit ids on `history` changed, so anyone who fetched the old branch needs to fetch it again. The Cite line and `CITATION.cff` name the new build.
- **Added:** a read-only query layer and local stdio MCP server with `list_places`, supporting MCP 2026-07-28 and 2025-11-25.
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
