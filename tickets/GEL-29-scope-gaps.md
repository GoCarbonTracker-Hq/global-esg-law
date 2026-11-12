# GEL-29: close the scope gaps found by the instruments audit

Status: open. Raised 2026-11-12. Owner decisions are marked "Owner decides".

The ticket number GEL-29 is assumed to be the next free one after GEL-28. Renumber if it is taken.

## Why

An audit of 13 places on 2026-11-12 compared the scope files against the ESG law an emissions analyst would expect. The corpus is strong on corporate reporting and national emissions reporting. It is thin on carbon pricing at EU and UK level, on green claims, and on supply chain due diligence. Three findings were confirmed against the repo the same day:

- `register/EU/scope.json` has 16 entries and none of them is the ETS Directive, CBAM, the Deforestation Regulation or the Empowering Consumers Directive. `register/register.csv` already cites these acts in 20 member-state rows (for example the Malta ETS regulations and the Croatian EUDR act), so national laws in the corpus point at parent acts the corpus does not hold.
- `register/GB/scope.json` has 5 entries and no carbon pricing, climate framework or company emissions disclosure (SECR) entry.
- IN, SG and HK have 5, 7 and 5 scope entries and 0 records. Every source row for them has the verdict `permission requested`.

## Rules that apply to every part

1. The lists below were written from memory by the audit session. They are candidates. Confirm each instrument on its official source before adding it: title, citation, official URL and in-force date. Drop any that cannot be confirmed and say so in the pull request.
2. Text is stored only under a source row whose verdict is `pass`. Everything else is a link-only scope entry. `tools/publish_gate.py` enforces this.
3. Follow the existing entries as the pattern. `register/EU/scope.json` shows the entry fields (`id`, `title`, `official_url`, `citation`, `in_force`, `evidence`, `law_family`, `duty_on`, `source_row`, `status`, `verification`, `notes`). The `evidence` field quotes the commencement clause that gives the in-force date.
4. One pull request per part. Do not mix parts.

## Steps for each instrument

1. Add or reuse a row in `register/register.csv`.
2. Add the entry to `register/<ISO2>/scope.json`.
3. For a `pass` source: store one record file per text version under `records/<ISO2>/<instrument-id>/`, with `source_id`, `in_force`, `kind`, `language`, `text`, `fetched_url` and `fetched_sha256`. Store the adopted text and every consolidated version the source publishes.
4. Add a watcher to `upkeep/watchers.json` (fields in `upkeep/README.md`, section "watchers.json"). The existing `eu-csrd-cellar-consolidations` watcher is the pattern for EUR-Lex.
5. Add the instrument to `SOURCES.md` in the place's section.
6. Run the release checks in `README.md`, section "Release checks". All must pass.

## Part A: EU instruments on EUR-Lex (do first)

No licence work is needed. `EU-EURLEX-ADOPTED`, `EU-EURLEX-CONSOLIDATED` and `EU-EURLEX-TRANSLATION` are all `pass`.

| Priority | Instrument | CELEX (confirm) | Family area |
|---|---|---|---|
| 1 | ETS Directive 2003/87/EC | 32003L0087 | Emissions trading |
| 1 | Monitoring and Reporting Regulation (EU) 2018/2066 | 32018R2066 | Emissions trading |
| 1 | Accreditation and Verification Regulation (EU) 2018/2067 | 32018R2067 | Emissions trading |
| 1 | CBAM Regulation (EU) 2023/956 | 32023R0956 | Carbon pricing |
| 1 | Empowering Consumers Directive (EU) 2024/825 | 32024L0825 | Green claims |
| 1 | Unfair Commercial Practices Directive 2005/29/EC | 32005L0029 | Green claims |
| 1 | Deforestation Regulation (EU) 2023/1115 | 32023R1115 | Due diligence |
| 2 | Accounting Directive 2013/34/EU, consolidated | 32013L0034 | Reporting |
| 2 | Conflict Minerals Regulation (EU) 2017/821 | 32017R0821 | Due diligence |
| 2 | Forced Labour Regulation (EU) 2024/3015 | 32024R3015 | Due diligence |
| 2 | Batteries Regulation (EU) 2023/1542 | 32023R1542 | Due diligence |
| 2 | European Climate Law (EU) 2021/1119 | 32021R1119 | Climate framework |
| 3 | Green Bond Regulation (EU) 2023/2631 | 32023R2631 | Sustainable finance |
| 3 | ESG Ratings Regulation (EU) 2024/3005 | 32024R3005 | Sustainable finance |
| 3 | Climate Benchmarks Regulation (EU) 2019/2089 | 32019R2089 | Sustainable finance |

Notes:

- Use the `law_family` codes already used for the same subject in member-state rows of `register/register.csv` (emissions trading rows carry F3, green claims F6, due diligence F5).
- CBAM, EUDR and the ETS Directive have amending and delaying acts. Store the consolidated versions so a date lookup returns the text in force on that date.
- After the entries exist, add a note to the member-state scope entries that implement them, naming the EU instrument id.

Done when: `python3 tools/law.py EU 2026-01-01` (after a history rebuild) lists the priority 1 instruments, and the gate and tests pass.

## Part B: GB instruments on legislation.gov.uk

No licence work is needed. `UK-LEGISLATION-ADOPTED` and `UK-LEGISLATION-CONSOLIDATED` are `pass`.

| Priority | Instrument | Citation (confirm) |
|---|---|---|
| 1 | Companies (Directors' Report) and LLP (Energy and Carbon Report) Regulations 2018 (SECR) | SI 2018/1155 |
| 1 | Large and Medium-sized Companies and Groups (Accounts and Reports) Regulations 2008, Schedule 7 Part 7 | SI 2008/410 |
| 1 | Greenhouse Gas Emissions Trading Scheme Order 2020 (UK ETS) | SI 2020/1265 |
| 1 | Climate Change Act 2008 | 2008 c. 27 |
| 2 | LLP (Climate-related Financial Disclosure) Regulations 2022 | SI 2022/46 |
| 2 | Modern Slavery Act 2015, section 54 | 2015 c. 30 |
| 2 | Digital Markets, Competition and Consumers Act 2024, unfair commercial practices provisions | 2024 c. 13 |
| 3 | Energy Savings Opportunity Scheme Regulations 2014 | SI 2014/1643 |
| 3 | Occupational Pension Schemes (Climate Change Governance and Reporting) Regulations 2021 | SI 2021/839 |

Store the scoped sections only, as the existing `gb-ca2006-s414cb` entry does, not whole acts.

Done when: `python3 tools/law.py GB 2026-01-01` lists the priority 1 instruments.

## Part C: licence rows for IN, SG and HK (review, no text yet)

All three places are link only because every source row is `permission requested`. This part is a review. It stores nothing.

Rows to re-read: `IN-INDIACODE-ADOPTED`, `IN-SEBI-ADOPTED`, `SG-SSO-ADOPTED`, `SG-SSO-CONSOLIDATED`, `HK-ELEGISLATION-CONSOLIDATED`.

For each row, open `terms_url`, check that `terms_quote` still appears, and check whether a statute exception applies to legislation in that place (the licence table already has 235 rows with `verdict_basis` of `statute`, so the pattern exists). Write up the sentence relied on and a proposed verdict.

Owner decides: whether any row moves to `pass`. The developer proposes and does not change a verdict.

If a row moves to `pass`, a follow-up ticket stores the text for its existing scope entries, starting with `sg-cpa-2018`, `sg-cpa-mrv-regs-2018` and `hk-cap622-sch5`.

Scope entries to add as link only now, whatever the verdicts (confirm each first): India Carbon Credit Trading Scheme 2023, Energy Conservation Act 2001 as amended 2022, CCPA Guidelines on Greenwashing 2024.

## Part D: defects found in passing

1. `records/JP/jp-fiea/` holds 55 files and two of them have identical text. Find the pair and say which file is wrong: a duplicate fetch, or a version dated on a day the text did not change.
2. The same folder stores the whole act for every version (763,455 to 2,234,192 characters) while the scope entry covers article 24. Count how many of the 55 versions differ within the scoped articles. Owner decides: keep whole-act versions, or re-cut to the scoped articles. Do not re-cut before that decision.
3. `records/ZA/za-companies-act-71-2008/` has the same whole-act issue for section 72(4), with one record. Report it with item 2.
4. The ZA Carbon Tax Act is stored as adopted in 2019 only. The act is amended most years, so a lookup does not show current rates. Check whether the source publishes consolidated versions under a `pass` row and store them if so.

## Part E: second wave, other places (after A and B merge)

Confirm and add, as stored where the source row is `pass` and link only otherwise:

- US: FTC Green Guides (16 CFR Part 260), California AB 1305, Uyghur Forced Labor Prevention Act, SEC Rule 13p-1 (conflict minerals), California SB 657.
- AU: Australian Consumer Law sections 18 and 29, ASIC Act sections 12DA and 12DB, NGER (Measurement) Determination 2008, Carbon Credits (Carbon Farming Initiative) Act 2011.
- FR: Code de la consommation L.121-2, Code de l'environnement L.541-9-1.
- DE: UWG sections 5 and 5a, the CSRD transposition act once promulgated (the stored HGB text is dated 2017-04-19).
- CN: Voluntary GHG Emission Reduction Trading Measures 2023, Green Bond Endorsed Projects Catalogue.
- ZA: Carbon Offsets Regulations 2019.
- JP: Act against Unjustifiable Premiums and Misleading Representations.
- BR: Código de Defesa do Consumidor article 37, CVM resolutions 217 and 218.

## Out of scope

- Any change to `tools/`.
- Instruments the audit marked unsure (UK CBAM statute, EU Green Claims Directive proposal, India taxonomy, Singapore non-listed company reporting vehicle and others). Raise them separately once confirmed.
- Purely social instruments (pay gap, employment equity) and sub-national law beyond the items named above.

## Acceptance for the whole ticket

1. Parts A and B merged, each with the six release checks passing.
2. `README.md` Status table and per-place record counts updated from live commands.
3. `COVERAGE.md` and `assets/coverage-grid.svg` regenerated.
4. `history` branch rebuilt with `python3 tools/build.py --branch history`, and the Cite line in `README.md` updated to the new head.
5. Part C delivered as a written review with a proposed verdict per row.
6. Part D items 1 to 3 delivered as a report, item 4 as records or a stated reason.
7. Each pull request lists the instruments that could not be confirmed and were dropped.

## What is not verified in this ticket

- The instrument lists, citations and CELEX numbers come from the audit session's memory and were not checked against official sources.
- Whether each EUR-Lex and legislation.gov.uk instrument has consolidated versions available was not checked.
- The licence position for IN, SG and HK was not re-read; Part C exists to do that.
