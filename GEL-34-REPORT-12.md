# GEL-34 story 12 report: multi-target `amends_ids`

## Plan (written before any edit)

| Piece | Deliverable | Files | Check that proves it done |
|---|---|---|---|
| P1 move | 160 `"amends": "x"` lines become `"amends_ids": ["x"]`, text rewrite, one-off script not committed | `register/*/scope.json` (75 files) | `git diff --shortstat` 75 files, 160/160; per-entry equality loop; `git grep -c '"amends"'` empty |
| P2 rule | `check_amends(repo, iso2=None)` called at the top of `check` | `tools/check_corpus.py`, `tests/test_check_corpus.py`, `tests/test_iso2_gate.py` | parametrized pytest, link-only refusal, iso2 gate, 3360 records checked |
| P3 readers | `query.lookup` key list, `law.py` text line, test edits, pass-through test | `tools/query.py`, `tools/law.py`, `tests/test_outcomes.py`, `tests/test_law.py` | pytest; `law.py CZ 2026-06-01 --ref origin/history` unchanged |
| P4 fill | the two EU omnibus directives get their targets | `register/EU/scope.json` | `law.py EU 2026-11-17 --ref origin/history --json`; 162 entries |
| P5 gap pass | 28 entries each `filled` or `outside the register`, table for Varun | `register/*/scope.json`, this report | script prints `unresolved 0, filled F, outside the register M` |
| P6 docs | MCP.md line 100, MAINTAINING.md line 52, CHANGELOG.md | those three | diffs |
| Story 1 criterion | skipped: `tools/web_data.py` is absent on this branch | none | none |

P1 runs first (everything else reads the new key). P5 reading is delegated to a sonnet subagent that only reads and returns a proposal; I write the scope edits.

## What I did

Five commits on the session branch: plan, the 160-line move, `check_amends` with readers and tests, the two EU omnibus fills, the gap-pass fills with docs. The one-off scripts (move, gap pass) are in the session scratchpad and not committed.

## Acceptance criteria

1. Move: `git diff --shortstat` after the script read `75 files changed, 160 insertions(+), 160 deletions(-)`. The per-entry loop over `git show HEAD:<file>` reported `mismatch 0` (every entry equal to its old self with `amends` replaced by `amends_ids: [old]`, key order kept). `git grep -c '"amends"' -- 'register/*/scope.json'` printed nothing after the move. PASS.
2. Rule refuses bad values: `tests/test_check_corpus.py` parametrized (string, `[]`, non-string item, empty string, an id that is no entry, duplicate, own id) plus the old `amends` key; a two-id list passes. PASS.
3. Link-only: `test_amends_ids_on_link_only_entry_is_checked` passes. Scratch copy with `AF/af-air-pollution-regulation-amendment` (link only) set to `["no-such-entry"]`: `python3 tools/check_corpus.py <scratch>` printed `register/AF/scope.json: entry 'af-air-pollution-regulation-amendment' amends_ids 'no-such-entry' is not the id of any scope entry`, exit 1. PASS.
4. iso2: `test_check_amends_iso2_ignores_other_place` in `tests/test_iso2_gate.py`: AA bad, BB clean and pointing at an AA id; `check(iso2="BB")` passes, `check(iso2="AA")` and the full check refuse. PASS.
5. Records: `python3 tools/check_corpus.py` on the branch ends `3360 records checked`; the same command on a worktree of `origin/main` ends `3360 records checked`. PASS.
6. Readers: `tools/query.py` copies `amends_ids`, `tools/law.py` prints `amends a, b`. `tests/test_outcomes.py` edited (fixture has two targets, asserts list, no `amends`, text line `amends old-act, new-act`, `--json` list); `test_amends_ids_passthrough` added beside `test_status_note_passthrough`. `python3 tools/law.py CZ 2026-06-01 --ref origin/history` prints `cz-act-316-2025 ... amends cz-accounting-act-sustainability-reporting`, the same text as before. PASS.
7. EU fill: `python3 tools/law.py EU 2026-11-17 --ref origin/history --json` shows `eu-omnibus-stop-the-clock-2025-794` with `['eu-csrd-2022-2464', 'eu-csddd-2024-1760']` and `eu-omnibus-content-2026-470` with `['eu-accounting-directive-2013-34', 'eu-csrd-2022-2464', 'eu-csddd-2024-1760']`, neither with `amends`. Entries carrying `amends_ids` after the EU fill: 162, 44 of them link only. PASS. Directive 2006/43/EC is not an entry and is not listed (a stated gap).
8. Story 1 builder: SKIPPED. `tools/web_data.py` is absent on this branch. When it merges, its scope key list must name `amends_ids`.
9. Docs: `MCP.md` line 100 names `amends_ids` as a list of entry ids; `MAINTAINING.md` has a paragraph on the rule before `publish_gate.py` (the story says line 52; the paragraph sits after the `check_corpus.py` paragraph on line 51); `CHANGELOG.md` has a Changed entry (old key, new key, 160 values, MCP output change) and an Added entry for the fills. PASS (diffs are in the branch).
10. Gap pass: re-counted on `origin/main` first: 60 notes contain "Amended by", 28 are named by no entry. Script output on the branch: `unresolved 0, filled 10, outside the register 18`. `python3 tools/check_corpus.py` stays `3360 records checked`; `publish_gate.py` exit 0; coverage diff clean. PASS.

Final gate on the branch: `python3 -m pytest -q` gives `405 passed` (Python 3.13.18; 3.11 not available in the container). 393 passed on main per the changelog; 12 new tests.

## Counts re-read (2026-11-17, live) and differences from the story

No difference. 1404 entries, 160 with `amends` (all strings), 75 files with one, 250 scope files, 133 distinct targets, 3360 records, 60 "Amended by" entries, 28 unnamed. `origin/main` is `0b93d7537`; `origin/history` is `55c8c2a9c`. After the branch: 171 entries carry `amends_ids` (162 after the EU fill, plus 9 entries that gained one in the gap pass; `se-sfs-2024-347` already had one and gained a second target).

One tally correction: my subagent reported 11 filled and 17 outside; the live recount is 10 filled and 18 outside (the 11 included a miscount). The table below is from the live data.

## Fill table for Varun's check

"Quoted note" is the sentence on the target entry. A pairing of one amender and several targets lists one row per target.

### A. Fills (the AMENDING entry gains the target id; X amends Y)

| Amender entry | Gains target | Quoted note on the target | Amender title | Target title |
|---|---|---|---|---|
| eu-omnibus-stop-the-clock-2025-794 | eu-csrd-2022-2464 | story-named; amender title lists it | Directive (EU) 2025/794 amending Directives (EU) 2022/2464 and (EU) 2024/1760 as regards the dates from which Member States are to apply certain corporate sustainability reporting and due diligence requirements | Directive (EU) 2022/2464 as regards corporate sustainability reporting (CSRD) |
| eu-omnibus-stop-the-clock-2025-794 | eu-csddd-2024-1760 | story-named; amender title lists it | Directive (EU) 2025/794 amending Directives (EU) 2022/2464 and (EU) 2024/1760 as regards the dates from which Member States are to apply certain corporate sustainability reporting and due diligence requirements | Directive (EU) 2024/1760 on corporate sustainability due diligence (CSDDD) |
| eu-omnibus-content-2026-470 | eu-accounting-directive-2013-34 | story-named; amender title lists it | Directive (EU) 2026/470 amending Directives 2006/43/EC, 2013/34/EU, (EU) 2022/2464 and (EU) 2024/1760 as regards certain corporate sustainability reporting requirements and certain corporate sustainability due diligence requirements | Directive 2013/34/EU on the annual financial statements, consolidated financial statements and related reports of certain types of undertakings (Accounting Directive) |
| eu-omnibus-content-2026-470 | eu-csrd-2022-2464 | story-named; amender title lists it | Directive (EU) 2026/470 amending Directives 2006/43/EC, 2013/34/EU, (EU) 2022/2464 and (EU) 2024/1760 as regards certain corporate sustainability reporting requirements and certain corporate sustainability due diligence requirements | Directive (EU) 2022/2464 as regards corporate sustainability reporting (CSRD) |
| eu-omnibus-content-2026-470 | eu-csddd-2024-1760 | story-named; amender title lists it | Directive (EU) 2026/470 amending Directives 2006/43/EC, 2013/34/EU, (EU) 2022/2464 and (EU) 2024/1760 as regards certain corporate sustainability reporting requirements and certain corporate sustainability due diligence requirements | Directive (EU) 2024/1760 on corporate sustainability due diligence (CSDDD) |
| eu-taxonomy-complementary-climate-da-2022-1214 | eu-taxonomy-climate-da-2021-2139 | Amended by Delegated Regulations (EU) 2022/1214, 2023/2485 and 2026/73; 2024/3215 corrects certain language versions only. | Commission Delegated Regulation (EU) 2022/1214 amending Delegated Regulations (EU) 2021/2139 and (EU) 2021/2178 as regards economic activities in certain energy sectors (Complementary Climate Delegated Act) | Commission Delegated Regulation (EU) 2021/2139 establishing technical screening criteria for climate change mitigation and adaptation under the Taxonomy Regulation (Climate Delegated Act) |
| eu-taxonomy-complementary-climate-da-2022-1214 | eu-taxonomy-disclosures-da-2021-2178 | Amended by Delegated Regulations (EU) 2022/1214, 2023/2486 and 2026/73. | Commission Delegated Regulation (EU) 2022/1214 amending Delegated Regulations (EU) 2021/2139 and (EU) 2021/2178 as regards economic activities in certain energy sectors (Complementary Climate Delegated Act) | Commission Delegated Regulation (EU) 2021/2178 specifying the content and presentation of Taxonomy disclosures by undertakings subject to Articles 19a or 29a of Directive 2013/34/EU (Disclosures Delegated Act) |
| eu-taxonomy-climate-amendment-da-2023-2485 | eu-taxonomy-climate-da-2021-2139 | Amended by Delegated Regulations (EU) 2022/1214, 2023/2485 and 2026/73; 2024/3215 corrects certain language versions only. | Commission Delegated Regulation (EU) 2023/2485 amending Delegated Regulation (EU) 2021/2139 with additional technical screening criteria for certain economic activities | Commission Delegated Regulation (EU) 2021/2139 establishing technical screening criteria for climate change mitigation and adaptation under the Taxonomy Regulation (Climate Delegated Act) |
| eu-taxonomy-simplification-da-2026-73 | eu-taxonomy-disclosures-da-2021-2178 | Amended by Delegated Regulations (EU) 2022/1214, 2023/2486 and 2026/73. | Commission Delegated Regulation (EU) 2026/73 amending Delegated Regulations (EU) 2021/2178, 2021/2139 and 2023/2486 as regards simplification of Taxonomy disclosures and of certain technical screening criteria | Commission Delegated Regulation (EU) 2021/2178 specifying the content and presentation of Taxonomy disclosures by undertakings subject to Articles 19a or 29a of Directive 2013/34/EU (Disclosures Delegated Act) |
| eu-taxonomy-simplification-da-2026-73 | eu-taxonomy-climate-da-2021-2139 | Amended by Delegated Regulations (EU) 2022/1214, 2023/2485 and 2026/73; 2024/3215 corrects certain language versions only. | Commission Delegated Regulation (EU) 2026/73 amending Delegated Regulations (EU) 2021/2178, 2021/2139 and 2023/2486 as regards simplification of Taxonomy disclosures and of certain technical screening criteria | Commission Delegated Regulation (EU) 2021/2139 establishing technical screening criteria for climate change mitigation and adaptation under the Taxonomy Regulation (Climate Delegated Act) |
| eu-taxonomy-simplification-da-2026-73 | eu-taxonomy-environmental-da-2023-2486 | Amended by Delegated Regulation (EU) 2026/73. | Commission Delegated Regulation (EU) 2026/73 amending Delegated Regulations (EU) 2021/2178, 2021/2139 and 2023/2486 as regards simplification of Taxonomy disclosures and of certain technical screening criteria | Commission Delegated Regulation (EU) 2023/2486 establishing technical screening criteria for water, circular economy, pollution prevention and biodiversity under the Taxonomy Regulation (Environmental Delegated Act) |
| eu-taxonomy-environmental-da-2023-2486 | eu-taxonomy-disclosures-da-2021-2178 | Amended by Delegated Regulations (EU) 2022/1214, 2023/2486 and 2026/73. | Commission Delegated Regulation (EU) 2023/2486 establishing technical screening criteria for water, circular economy, pollution prevention and biodiversity under the Taxonomy Regulation (Environmental Delegated Act) | Commission Delegated Regulation (EU) 2021/2178 specifying the content and presentation of Taxonomy disclosures by undertakings subject to Articles 19a or 29a of Directive 2013/34/EU (Disclosures Delegated Act) |
| eu-empowering-consumers-2024-825 | eu-ucpd-2005-29 | Amended by Directives (EU) 2019/2161 (consolidated 2022-05-28) and (EU) 2024/825 (consolidated 2026-09-27). | Directive (EU) 2024/825 amending Directives 2005/29/EC and 2011/83/EU as regards empowering consumers for the green transition through better protection against unfair practices and through better information | Directive 2005/29/EC concerning unfair business-to-consumer commercial practices in the internal market (Unfair Commercial Practices Directive) |
| eu-csrd-2022-2464 | eu-accounting-directive-2013-34 | Amended by Directives 2014/95/EU, 2014/102/EU, (EU) 2021/2101, (EU) 2022/2464, (EU) 2023/2864, (EU) 2023/2775, (EU) 2024/1306, (EU) 2025/2 and (EU) 2026/470. | Directive (EU) 2022/2464 as regards corporate sustainability reporting (CSRD) | Directive 2013/34/EU on the annual financial statements, consolidated financial statements and related reports of certain types of undertakings (Accounting Directive) |
| fm-climate-change-act | fm-epa-title25 | Amended by fm-climate-change-act, which adds a Chapter 8 that the LIS copy does not carry yet. | Federated States of Micronesia Climate Change Act (Public Law 18-34), Title 25 FSM Code Chapter 8 | FSM Environmental Protection Act, Title 25 FSM Code, Chapters 1 to 3 (as revised by Public Law 17-57) |
| is-ets-log | is-loftslagslog | Amended by lög nr. | Lög um viðskiptakerfi ESB með losunarheimildir nr. 96/2023 | Lög um loftslagsmál nr. 70/2012 |
| se-sfs-2024-347 | se-arl-ch7-s31 | Amended by se-sfs-2024-347. | Act (2024:347) amending the Annual Accounts Act (Lag 2024:347 om ändring i årsredovisningslagen 1995:1554), as adopted | Annual Accounts Act (Årsredovisningslag 1995:1554), 7 kap. 31 a to 31 g §§: group sustainability report |
| us-ca-sb219 | us-ca-sb253 | Amended by SB 219 (Stats. | California SB 219 (amends Health and Safety Code 38532 and 38533) | California Climate Corporate Data Accountability Act (SB 253), Health and Safety Code 38532 |

### B. Outside the register (no entry changed)

| Entry | Quoted note | Reason |
|---|---|---|
| bd-bsec-cg-code-2018 | Amended by BSEC notifications of 2023-11-28 (https://sec.gov.bd/storage/laws/Notification_28.11.2023.pdf) and 2024-05-26 (female independent director; not ESG-specific); the amendments are not separate entries. | Notes state the amending notifications are not separate entries; BD scope has only this BSEC code. |
| bn-cpfto-2011 | Amended by the Consumer Protection (Fair Trading) (Amendment) Order, 2015 (S 52/2015). | No BN entry for the 2015 amendment Order. |
| bo-asfi-rmv-green-bonds | Amended by Resolución ASFI/928/2023 of 21 August 2023 (Circular ASFI/789/2023: CBI added as certifier, art. 9 on loss of status), by Resolución ASFI/586/2026 of 7 July 2026 (adds the Fondo de Inversión Sostenible, see bo-asfi-fondo-inversio | Only a doubtful sibling (bo-asfi-fondo-inversion-sostenible, same resolution 586/2026 but a different regulation) exists; 928/2023 and 855/2026 absent. |
| bo-asfi-revision-externa | Amended by Resolución ASFI/928/2023 and Resolución ASFI/586/2026 (extends scope to the Fondo de Inversión Sostenible). | Only a doubtful sibling for 586/2026 (different regulation); 928/2023 absent. |
| eu-sfdr-rts-2022-1288 | Amended by Delegated Regulation (EU) 2023/363 (in force 2023-02-20). | No register entry for Delegated Regulation (EU) 2023/363. |
| eu-eudr-2023-1115 | Amended by Regulation (EU) 2024/3234 (consolidated 2024-12-26), Regulation (EU) 2025/2650 (consolidated 2025-12-26) and Commission Delegated Regulation (EU) 2026/2102 (consolidated 2026-09-18). | None of the three amenders is an entry (EU scope has 32 entries; checked all files). |
| eu-conflict-minerals-2017-821 | Amended by Commission Delegated Regulation (EU) 2020/1588. | No register entry. |
| eu-batteries-2023-1542 | Amended by Regulations (EU) 2024/1781, (EU) 2025/1561 and (EU) 2026/1738. | None of the three is an entry. |
| eu-climate-law-2021-1119 | Amended by Regulation (EU) 2026/667 (consolidated 02021R1119-20260407). | No register entry. |
| eu-green-bond-2023-2631 | Amended by Regulation (EU) 2023/2869 (consolidated 02023R2631-20240109). | No register entry. |
| eu-ets-2003-87 | Amended by Directive 2004/101/EC, Directive 2008/101/EC, Directive 2009/29/EC, Decision (EU) 2015/1814, Regulation (EU) 2017/2392, Directive (EU) 2018/410, Delegated Decision (EU) 2020/1071, Delegated Regulation (EU) 2021/1416, Decision (EU | None of the 13 amenders is an EU entry. |
| eu-mrr-2018-2066 | Amended by Implementing Regulations (EU) 2020/2085, 2022/388, 2022/1371, 2023/2122, 2024/2493 and 2025/842. | None is an entry. |
| eu-avr-2018-2067 | Amended by Implementing Regulations (EU) 2020/2084, 2024/1321 and 2025/1192. | None is an entry. |
| gi-climate-action-fund-regs-2026 | Amended by the Climate Action Fund (Amendment) Regulations 2026 (LN 2026/250, in force 23.7.2026 for the listed provisions). | No GI entry for LN 2026/250. |
| in-companies-act-2013-s135 | Amended by the Companies (Amendment) Acts 2019 and 2020 (a secondary source says from 2021-01-22) and the CSR Rules amended 2021. | Only the base section 135 entry exists for India. |
| is-ets-log | Amended by lög nr. 106/2025 (signed 2025-12-24, published 2025-12-29, in force 'þegar'); the amending act is not a separate entry. | Notes state it is not a separate entry; verified. |
| md-hg-1277-2018 | Amended by a Government Decision published in Monitorul Oficial 309-312 of 17 December 2021 (art. 714) and by Government Decision No. 208/2024 published in Monitorul Oficial 89-92 of 5 March 2024 (art. 208); those two amending acts are not  | Notes state both are not in scope; verified. |
| pl-emissions-management-act | Amended by Dz. U. 2025 poz. 1863 (in force 2026-01-13). | Only a same-number different-year item exists. |

## What is left

- Story 1 builder criterion, when `tools/web_data.py` exists.
- The 18 outside entries stay without an "Amended by" line until their amenders become entries.

## What Varun must decide

- `bo-asfi-fondo-inversion-sostenible` cites Resolución ASFI/586/2026, which both Bolivian green-bond entries name as an amender. That entry is the SAFI fund regulation, not the resolution, and its title does not say it amends either target. I left both Bolivian entries as outside the register. Link them, or leave them?
- Three fills rest on a note rather than the amender's title: `eu-taxonomy-environmental-da-2023-2486` to `eu-taxonomy-disclosures-da-2021-2178` ("Also amends Delegated Regulation (EU) 2021/2178"), `is-ets-log` to `is-loftslagslog` (35. gr. of lög nr. 96/2023, from the target's note), and `se-sfs-2024-347` to `se-arl-ch7-s31` (the entry's own notes say its changes sit in both chapters).
- `eu-accounting-directive-2013-34` lists `eu-csrd-2022-2464` as an amender; the CSRD title carries no "amending" wording, so the link rests on the CELEX identity and the target's own note.
