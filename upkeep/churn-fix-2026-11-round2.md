# Page-hash churn fix, round 2 (GEL-28, 2026-11-11)

Stopped by the owner 2026-11-11; the proof run was done 2026-11-12 (section "Proof run" below). 30 of the 34 moved watchers passed; the other 4 moved on site widgets and got a `params.cut` once N5 was approved (section "N5 cuts").

Only what was measured is stated. The gate was run after the proof run, on the final head: `check_corpus.py` 3240 records checked, pytest 185 passed, `publish_gate.py` exit 0.

## Method

Candidates: the 122 watchers of kind `page_hash` with an open `new_version` or `terms_changed` row. Each was fetched with the watcher's own `run_watcher`, twice 300 s apart (all 122), and 118 of them a third time about 2 minutes later (4 failed fetches excluded). Bodies were kept in /tmp (not committed). For each watcher the `page_hash` signal and the `text_hash` string (visible text plus link targets) were compared across the reads, and the changed lines were classed with `tools/triage.py` `changed_lines` and `cause_of`.

## What the 122 watchers showed

| Result | Watchers | Detail |
|---|---|---|
| page_hash moved, text_hash stable on all reads | 34 | moved to `text_hash` (below) |
| page_hash same on all 3 reads | 71 | not decided: nothing to class in a 10-minute window, although each has 1 to 10 open rows from 11-05 to 11-11. Left on `page_hash`, rows open. A later read was started (6 rounds, 5 min apart) and stopped after round 0; its data was not analysed |
| no page text | 9 | gb-fca-esg-handbook-page (JavaScript shell); gq-cosumaf-reglamento-general-page-hash, terms-cg-cosumaf, terms-cm-cosumaf (visible text is only "COSUMAF"); terms-rw-bnr-adopted (enable JavaScript); sg-mas-erm-asset-managers/banks/insurers-mas-guideline-page (maintenance page with a support id); terms-mo-bo-dsaj (Aliyun WAF challenge). Left on `page_hash`, rows open. No `params.expect` tried |
| visible text moves, not fixed | 4 | cy-consumer-protection-amendment-3-2026-gazette-page (file size 1349.61Kb vs 1349,61Kb, N5), kp-air-pollution-control-act-naenara-page and kp-environmental-protection-law-naenara-page (rotating quotation, N5): N5 not approved. ro-omf-85-2024-legislatie-page: printable-form link id changes per fetch, as in GEL-28-02. Rows open |
| fetch failed | 4 | eg-law-4-1994-environment-eeaa-laws-page (SSL EOF), ph-ra-10174-elibrary-page, ph-ra-7394-ch6-advertising-elibrary-page, ph-ra-9729-elibrary-page (HTTP 403 twice). Rows open |

Before number, 5-minute window: page_hash differed between the first two reads for 40 of the 118 watchers whose fetches worked (29 text-stable, 11 not). A third read 2 minutes later moved 35 of 118 more or less overlapping; the 34 fixed include watchers that moved only on the third read.

## Edits made (commit 6bc65d4c5)

- `upkeep/watchers.json`: 34 watchers `page_hash` to `text_hash`. 31 plain; 3 with a new `params.cut`: `cd-ordonnance-loi-26-016-page` (`\d+ Views`), `pk-terms-pakistancode-consolidated` (`Active Visitors \d+ Today Visitors \d+ Total Visitors \d+`), `terms-mp-lrc-consolidated` (`email-protection#[0-9a-f]+`, existing cut). Cut proof on the saved pages: editing any single link target moved the signal (271 of 271, 23 of 23, 107 of 107).
- Causes of the 34: markup only 18, timestamp/date 7, nonce/token 6, view counter 1 (cd), visitor counter 1 (pk, class N7), email-protection key 1.
- `upkeep/seen.json`: each of the 34 reseeded with `watch.py --reseed` (twice: before and after the rejects); each holds 1 signal.
- `upkeep/queue.csv`: 114 rows rejected through `tools/queue.py`, reviewer moka: new_version 109 (N2 59, N1 27, N4 14, N7 9), terms_changed 5 on `pass` sources (N4 2, N2 3). A sixth, terms-cw-gobiernu-adopted 2026-11-11 (N4), was reopened on 2026-11-12 after the proof run showed its visible text moves (below); it is open again.
- 11 terms_changed rows on those watchers stay open: source verdict `permission requested` (10) or `fail` (1).

## Proof run (2026-11-12)

Each of the 34 watchers was fetched with `run_watcher` and its final config, twice 300 s apart, and each signal was compared with the reseeded one in `upkeep/seen.json`, as `watch()` would. Script and log in /tmp/gel28-proof (not committed).

| Result | Watchers |
|---|---|
| reseeded signal on both reads | 27 |
| one fetch failed (timeout, TLS handshake, HTTP 500), reseeded signal on two other reads at least 5 min apart | 3: cu-res-106-2025-carbon-market-gaceta-page, rw-rse-esg-reporting-guidelines-page-hash, bi-2000-presidence-lois |
| visible text moved since the reseed, not fixed | 4 (below) |

The 4 that still move, each read against the saved 2026-11-11 body:

- `za-companies-act-71-2008-govza-page`: a "Related Documents" sidebar of recent gov.za notices (new entry dated 23 Oct 2026, three `/ts/node/` links).
- `terms-jm-boj`: the "Recent Posts" list and Twitter feed beside the disclaimer (auction results, balance sheet).
- `terms-gg-gov-adopted`: the header weather forecast and bin-collection box.
- `terms-cw-gobiernu-adopted`: a share-widget label that reads "Comments" or "Facebook" between fetches; three text variants were seen in about 20 minutes.

The terms text itself did not change on any of the 4. These are N5 (visible text moves); the cuts were added after Varun approved N5 (below).

## N5 cuts (2026-11-12)

Varun approved N5 on 2026-11-12. Each of the 4 got a `params.cut` in `upkeep/watchers.json` and was reseeded:

| Watcher | Cut | Links in cut | Visible words in cut |
|---|---|---|---|
| za-companies-act-71-2008-govza-page | "Related Documents" sidebar up to the footer, and the `/ts/node/` links before `/speeches` | 3 of 80 | 66 of 868 |
| terms-jm-boj | "Recent Posts" and Twitter feed up to the copyright line, and their links between `/other-links/` and `/privacy-policy` | 55 of 364 (20 posts, 35 Twitter) | 226 of 1651 |
| terms-gg-gov-adopted | bin-collection and weather box between the site strapline and "Tide timetables" | 0 of 98 | 57 of 1693 |
| terms-cw-gobiernu-adopted | the newsletter form's honeypot field label (a random word: "Comments", "Facebook") | 0 of 75 | 1 of 385 |

Proof:
- Saved bodies (2026-11-11 from the round-2 reads, 2026-11-12 from the proof run, and for cw two label variants): one hash per watcher after the cut, and each reseeded signal equals that hash.
- Editing any one link target outside the cut moved the signal (80 of 80, 309 of 309, 98 of 98, 75 of 75); so did editing a word of the text outside the cut.
- Live: two reads 300 s apart with the final config, all 4 equal to the reseeded signal.

The terms-cw-gobiernu-adopted 2026-11-11 row, reopened earlier on 2026-11-12, is rejected under N5 (source verdict `pass`). The 11-11 terms rows on terms-jm-boj (`permission requested`) and terms-gg-gov-adopted (`fail`) stay open.

## N5 cuts, cy and kp (2026-11-12)

The 3 remaining N5 watchers moved from `page_hash` to `text_hash` with a `params.cut`, and were reseeded:

- `cy-consumer-protection-amendment-3-2026-gazette-page`: the cut removes the decimal mark in the file size ("1349.61Kb" or "1349,61Kb"), so the digits still count and a new file size still moves the signal. 33 of 33 links and all 160 words stay in the hash.
- `kp-air-pollution-control-act-naenara-page` and `kp-environmental-protection-law-naenara-page` both fetch the Naenara home page, which does not carry either law. No Naenara page names either law (politics, society, trade and history sections checked). Both are now manual checks, as their `params.note` says. The cut removes the leader news, the rotating quotation and the dated news lists (199 of 308 words), so the signal moves only on the page's fixed text or its 75 links. The news dates were the same on 2026-11-11 and 2026-11-12 05:00, so a news change has not been seen yet; the cut is a region, not the headlines.

Proof: the saved 2026-11-11 bodies and 2026-11-12 bodies give one hash per watcher after the cut, equal to the reseeded signal. Two live reads 300 s apart were the same on all 3.

Rejected under N5, reviewer moka: 14 new_version rows (cy 6, which are exactly the two saved 11-11 bodies; kp 4 each, home page only). The 6 kp `watch_failed` rows stay open.

## Not reached

- The 71 watchers with a stable page_hash and their open rows.
- README line, tests (no tools/ code was changed).

## Out of scope, looked at once (no decisions)

- text_hash, 10 new_version rows plus 2 terms_changed rows (terms-tl-parlamento-adopted, terms-tl-bctl-adopted): 8 `tw-*-moj-history-page` rows all raised 11-11 (look like one site change, unclear), ls-environment-act-2008-page (unclear), us-ca-sb253-carb-program-page (current signal differs from the stored one, then stable on two reads; may be a real edit).
- http_head, 36 new_version rows on 20 watchers: 11 `ie-si-*-isbc-directory` share one Last-Modified (09 Nov 12:22), a site-wide rebuild, look like churn; 3 `mg-*-cnlegis-pdf` moved 4 times in a week, look like re-uploads; 2 `sg-sgx-*-rulebook-head` share the rulebook URL; 2 `sc-*-gazette-acts` share one 2026 list URL; `mn-mse-disclosure-rules-pdf` one row; `us-ca-leginfo-pubinfo-2025` weekly zip. The count is 36, not the 27 in the brief.

## Three more page_hash watchers moved to text_hash (2026-11-14)

`gb-fca-esg-handbook-page`, `fr-amf-doc-2020-03-amf-page` and `gq-cosumaf-reglamento-general-page-hash` moved from `page_hash` to `text_hash` and were reseeded. Their 30 open rows (13, 10, 7) were rejected in the 2026-11-14 batch. No `params.cut`.

- `fr-amf-doc-2020-03-amf-page`: the page carries the doctrine text (about 44,900 characters of visible text, 380 links), so the watcher still shows an edit.
- `gb-fca-esg-handbook-page` and `gq-cosumaf-reglamento-general-page-hash` are now manual checks, as their `params.note` says. To a script the FCA page is a JavaScript shell (visible text is the "JavaScript is disabled" notice, no links) and the COSUMAF home page is a script-built app (visible text "COSUMAF", no links), so neither can show a change to the law.

Proof: the two bodies saved on 2026-11-14 morning give two page hashes and one text hash per watcher, equal to the reseeded signal. Two live reads 300 s apart (12:10 and 12:15 CET) were equal to the reseeded signal on all 3.
