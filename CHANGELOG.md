# Changelog

What changed in the corpus, the tools and the documentation, newest first. Each entry starts with a status word:

- **Added:** new in the repository.
- **Changed:** works or reads differently from before.
- **Fixed:** was wrong, now corrected.
- **Open:** found and reported, not yet fixed.

The log starts on 2026-11-10. Earlier work is in the git history and in the dated notes under `upkeep/`.

## 2026-11-13

- **Added:** this changelog and a pull request template.
- **Changed:** the README is shorter. The list of places with links only is read from `COVERAGE.md`, and the record format moved to `MAINTAINING.md`.

## 2026-11-12

- **Changed:** the README was rewritten for visitors. It opens with what is stored (140 places, 831 of 1378 instruments), defines the law families F1 to F7, says how the text and the licence verdicts were produced, and has a hero image and a how-it-works figure.
- **Added:** `MAINTAINING.md`, `CONTRIBUTING.md`, `CITATION.cff` and an issue form for wrong or missing law.
- **Fixed:** `LICENSE` is the verbatim CC0 1.0 text again, so GitHub recognises it. The note that law texts are not covered is in the README.
- **Changed:** the repository moved to the GoCarbonTracker-Hq organization. The old address redirects.
- **Changed:** watchers that fired on page furniture, not on the law text, were moved from a page hash to a text hash, and queue rows that were not real changes were rejected (pull requests #8 to #13).
- **Open:** scope gaps in carbon pricing, green claims and supply chain due diligence ([#16](https://github.com/GoCarbonTracker-Hq/global-esg-law/issues/16)).
- **Open:** tool defects found by a code review, and no continuous integration ([#17](https://github.com/GoCarbonTracker-Hq/global-esg-law/issues/17)).
- **Open:** two `pass` licence verdicts in doubt after an audit of a sample of the licence table ([#18](https://github.com/GoCarbonTracker-Hq/global-esg-law/issues/18)).

## 2026-11-10

- **Changed:** every place in the register has a scope file, and `COVERAGE.md` and the coverage grid were regenerated.
