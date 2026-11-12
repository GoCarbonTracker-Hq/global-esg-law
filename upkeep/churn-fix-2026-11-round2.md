# Page-hash churn fix, round 2 (GEL-28, 2026-11-11)

Stopped by the owner 2026-11-11; the proof run was done 2026-11-12 (section "Proof run" below). 30 of the 34 moved watchers pass; 4 still move on visible text and are left as a follow-up.

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

The terms text itself did not change on any of the 4. A `params.cut` for each block would fix them, but these are N5 (visible text moves), which is not approved, so no cut was added. They stay on `text_hash`, which moves only when that widget changes, where `page_hash` moved on nearly every fetch. The next watch run will raise a row on each.

## Not reached

- The 4 watchers above: a cut for each needs N5 approved.
- The 71 watchers with a stable page_hash and their open rows.
- README line, tests (no tools/ code was changed).

## Out of scope, looked at once (no decisions)

- text_hash, 10 new_version rows plus 2 terms_changed rows (terms-tl-parlamento-adopted, terms-tl-bctl-adopted): 8 `tw-*-moj-history-page` rows all raised 11-11 (look like one site change, unclear), ls-environment-act-2008-page (unclear), us-ca-sb253-carb-program-page (current signal differs from the stored one, then stable on two reads; may be a real edit).
- http_head, 36 new_version rows on 20 watchers: 11 `ie-si-*-isbc-directory` share one Last-Modified (09 Nov 12:22), a site-wide rebuild, look like churn; 3 `mg-*-cnlegis-pdf` moved 4 times in a week, look like re-uploads; 2 `sg-sgx-*-rulebook-head` share the rulebook URL; 2 `sc-*-gazette-acts` share one 2026 list URL; `mn-mse-disclosure-rules-pdf` one row; `us-ca-leginfo-pubinfo-2025` weekly zip. The count is 36, not the 27 in the brief.
