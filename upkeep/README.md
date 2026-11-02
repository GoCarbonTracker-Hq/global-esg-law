# Upkeep

Tools that notice when an official source changes, so a person can decide whether a new version belongs in `records/`. Nothing here fetches or stores law text. The watcher reads version lists, response headers and page hashes, and writes only under `upkeep/`.

## Run

```
python3 tools/watch.py [--source <sources.json id>] [--dry-run]
```

Each watcher in `watchers.json` is fetched once (a `HEAD` request for `http_head`, a `GET` otherwise, 30 s timeout), its signal is compared with `seen.json`, candidate rows are appended to `queue.csv`, and `seen.json` is updated. The run prints `N watchers run, M candidates, K failures` and exits 1 when K > 0. `--source` runs only the watchers of one licence-table row. `--dry-run` fetches and compares, prints the rows it would append, and writes nothing.

A contributor's run ends in a pull request from a fork, never a push to main.

## watchers.json

One entry per watcher. A watcher may point at a `sources.json` row whose verdict is not `pass`; it still runs, because no watcher ever fetches law text.

| Key | Meaning |
|---|---|
| `id` | Unique name of the watcher, used in `seen.json` and `queue.csv`. |
| `source_id` | An `id` in `sources.json`. |
| `iso2` | Jurisdiction code, matching `register/<ISO2>/`. |
| `instrument` | An `id` in `register/<ISO2>/scope.json`, or `*` for a watcher that covers the source as a whole. |
| `kind` | One of the four kinds below. |
| `url` | What is fetched. Never a URL whose body is law text. |
| `params.regex` | `date_list` only: a regular expression with exactly one group that captures a date as `YYYY-MM-DD` or `YYYYMMDD`. |
| `params.second_route` | Optional: where a person can check by hand when the fetch fails. Copied into the `notes` of a `watch_failed` row. |
| `change` | Optional, default `new_version`. Set `terms_changed` on a watcher that points at a licence or terms page, such as a `page_hash` of a `sources.json` row's `terms_url`. |

### Kinds

| Kind | Signal | New when |
|---|---|---|
| `date_list` | Every date captured by `params.regex` (the Cellar SPARQL list and the legislation.gov.uk `hasVersion` links are both this kind with different regexes). | A date is not in `seen.json`. |
| `version_list` | Every `content_versions[].date` in eCFR versioner JSON. The versioner paginates at 1000 entries; the watcher follows `meta.total_pages`. | A date is not in `seen.json`. |
| `http_head` | `Last-Modified` of a `HEAD` request, or `Content-Length` when there is no `Last-Modified`. | The value differs from `seen.json`. |
| `page_hash` | sha256 of the body. | The hash differs from `seen.json`. |

## seen.json

One entry per watcher id: `signals` (the dates or the current value; `null` until the first successful fetch), `failure` (the text of the last failure, or `null`) and `checked_on`. A watcher with no entry records every current signal and gets one `baseline` row, so a source with many stored versions does not flood the queue on its first run. The file is written by the watcher and is not edited by hand.

## queue.csv

Appended, never rewritten; rows end in CRLF. A signal already in `seen.json` produces no row. A fetch failure (status not 200, empty body, timeout, parser error) produces one `watch_failed` row; the same failure on the next run produces no second row. A failure never counts as no change.

| Column | Meaning |
|---|---|
| `detected_on` | Date of the run, `YYYY-MM-DD`. |
| `watcher_id` | The `id` in `watchers.json`. |
| `iso2` | Jurisdiction code of the watcher. |
| `source_id` | The `sources.json` row of the watcher. |
| `instrument` | The scope entry id, or `*`. |
| `change` | `baseline` (first run, `signal` is the number of signals recorded), `new_version` (a date or value not seen before), `terms_changed` (same, for a watcher marked `change: terms_changed`) or `watch_failed`. |
| `signal` | The new date, the new header value or hash, the count for a baseline, or the status or exception text for a failure. |
| `evidence_url` | The URL the signal was read from. |
| `reviewer` | Filled by a person: who reviewed the row. |
| `outcome` | Filled by a person: `confirm` (a new version exists and should be stored or listed), `reject` (not a change that matters) or `needs_evidence` (the source must be opened by hand before deciding). |
| `outcome_on` | Filled by a person: date of the decision. |
| `notes` | For `watch_failed`, the watcher's `second_route` or `none listed`. Otherwise free text for the reviewer. |

Review of the queue is the next story (GEL-02-02). Storing a confirmed version still goes through `tools/check_corpus.py` and the licence table; the watcher has no say in that.

## Pilot watchers (GEL-02-07)

One watcher per instrument in the four scope files, using only the four kinds above. The Cellar watchers come in two shapes: a `date_list` of consolidated work ids (the CSRD example with the CELEX swapped) for every instrument whose `source_row` names `EU-EURLEX-CONSOLIDATED`, and a `date_list` of the document dates of every act that amends or corrects a target act (SPARQL over `cdm:resource_legal_amends_resource_legal` and `cdm:resource_legal_corrects_resource_legal`) for the adopted-only instruments. The amending acts watch the acts they amend; the two Omnibus directives split their targets so that no two watchers run the same query, and Delegated Regulation 2026/1563 watches its own corrigenda because the 2025/1416 watcher already covers acts amending 2023/2772.

| id | kind | what it watches |
|---|---|---|
| `eu-csrd-cellar-consolidations` | `date_list` | Cellar: consolidated versions of CSRD 2022/2464 |
| `eu-esrs-cellar-consolidations` | `date_list` | Cellar: consolidated versions of ESRS 2023/2772 |
| `eu-sfdr-cellar-consolidations` | `date_list` | Cellar: consolidated versions of SFDR 2019/2088 |
| `eu-csddd-cellar-consolidations` | `date_list` | Cellar: consolidated versions of CSDDD 2024/1760 |
| `eu-taxonomy-climate-da-cellar-consolidations` | `date_list` | Cellar: consolidated versions of Climate DA 2021/2139 |
| `eu-taxonomy-disclosures-da-cellar-consolidations` | `date_list` | Cellar: consolidated versions of Disclosures DA 2021/2178 |
| `eu-taxonomy-environmental-da-cellar-consolidations` | `date_list` | Cellar: consolidated versions of Environmental DA 2023/2486 |
| `eu-sfdr-rts-cellar-consolidations` | `date_list` | Cellar: consolidated versions of SFDR RTS 2022/1288 |
| `eu-taxonomy-cellar-amendments` | `date_list` | Cellar: acts amending or correcting Taxonomy Regulation 2020/852 |
| `eu-omnibus-stop-the-clock-cellar-amendments` | `date_list` | Cellar: acts amending or correcting CSRD 2022/2464 or CSDDD 2024/1760 |
| `eu-omnibus-content-cellar-amendments` | `date_list` | Cellar: acts amending or correcting Accounting Directive 2013/34 or Audit Directive 2006/43 |
| `eu-esrs-amendment-2025-1416-cellar-amendments` | `date_list` | Cellar: acts amending or correcting ESRS 2023/2772 |
| `eu-esrs-amendment-2026-1563-cellar-amendments` | `date_list` | Cellar: acts amending or correcting Delegated Regulation 2026/1563 itself |
| `eu-taxonomy-complementary-climate-da-cellar-amendments` | `date_list` | Cellar: acts amending or correcting Delegated Regulation 2022/1214 |
| `eu-taxonomy-climate-amendment-da-cellar-amendments` | `date_list` | Cellar: acts amending or correcting Delegated Regulation 2023/2485 |
| `eu-taxonomy-simplification-da-cellar-amendments` | `date_list` | Cellar: acts amending or correcting Delegated Regulation 2026/73 |
| `gb-ca2006-s414cb-versions` | `date_list` | legislation.gov.uk `hasVersion` dates of Companies Act 2006 s.414CB |
| `gb-ca2006-ch4a-versions` | `date_list` | legislation.gov.uk `hasVersion` dates of Companies Act 2006 Part 15 Chapter 4A |
| `gb-uksi-2022-31-contents-page` | `page_hash` | legislation.gov.uk contents page of SI 2022/31 |
| `gb-fca-esg-handbook-page` | `page_hash` | FCA Handbook ESG sourcebook page |
| `gb-uk-srs-govuk-page` | `page_hash` | gov.uk publication page for UK SRS S1 and S2 |
| `us-ecfr-40cfr98-versions` | `version_list` | eCFR versioner dates of 40 CFR Part 98 |
| `us-sec-climate-fedreg-citations` | `date_list` | Federal Register API: publication dates of documents citing SEC Release 33-11275 |
| `us-ca-leginfo-pubinfo-2025` | `http_head` | `Last-Modified` of the California 2025-26 session bulk file |
| `us-ca-sb219-leginfo-pubinfo-2023` | `http_head` | `Last-Modified` of the California 2023-24 session bulk file (SB 219 chaptered text) |
| `us-ca-sb253-carb-program-page` | `page_hash` | CARB corporate GHG reporting and climate risk program page (SB 253) |
| `us-ca-sb261-carb-financial-risk-page` | `page_hash` | CARB Climate-Related Financial Risk page (SB 261) |
| `in-companies-act-2013-indiacode-page` | `page_hash` | India Code page for the Companies Act 2013 |
| `in-sebi-lodr-regulations-page` | `page_hash` | SEBI page for the LODR Regulations 2015 (as last amended) |
| `in-sebi-brsr-circular-2021-page` | `page_hash` | SEBI page for the BRSR circular of 2021 |
| `in-sebi-brsr-core-circular-2023-page` | `page_hash` | SEBI page for the BRSR Core circular of 2023 |
| `in-sebi-circular-2025-42-page` | `page_hash` | SEBI page for circular 2025/42 |

The India, FCA and UK SRS watchers only ever produce queue rows because their licence rows are not `pass`; nothing from those sources is stored. The India and CARB pages answer scripts with HTTP 403 or 419 (and sebi.gov.in resets connections after a few requests), so their rows are `watch_failed` with `second_route` naming a browser read or an Internet Archive snapshot. The FCA Handbook page is a JavaScript shell into which Cloudflare writes a per-request nonce, so its hash differs on every run and each run adds one `new_version` row for it until a stable FCA signal is found.
