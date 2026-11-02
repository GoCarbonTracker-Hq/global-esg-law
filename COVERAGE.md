# Coverage and currency

Generated on 2026-11-02 by `python3 tools/coverage.py` from `register/register.csv`, `register/<ISO2>/scope.json`, `records/`, `sources.json`, `upkeep/watchers.json`, `upkeep/seen.json` and `upkeep/cadence.json`. Nothing in this file is typed by hand; edit the inputs and rerun the command.

This is a map of what the repository holds and when it was last checked. It is not a claim that the law of any place is covered completely, and it says nothing about whether any company complies with any law. The law families are the `law_family` codes of the register: F1, F2, F3, F4, F5, F6, F7.

## Counts

| Count | Value | As of | Command |
|---|---|---|---|
| Places in the register | 250 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows | 715 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with an instrument and a law family (shown in the grid) | 619 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with an instrument but no law family (not in the grid) | 40 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with a law family outside F1 to F7 | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with no instrument (place listed, nothing found) | 56 | 2026-11-02 | `python3 tools/coverage.py` |
| Pilot places with a scope file | 47 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments in scope files | 424 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments with stored text | 329 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments link only | 95 | 2026-11-02 | `python3 tools/coverage.py` |
| Record files (text versions) | 1492 | 2026-11-02 | `python3 tools/coverage.py` |
| Watchers in upkeep/watchers.json | 447 | 2026-11-02 | `python3 tools/coverage.py` |
| Watchers with a checked_on in upkeep/seen.json | 146 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments whose last check is older than its cadence (stale) | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Grid cells marked stale | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Places with no watcher | 203 | 2026-11-02 | `python3 tools/coverage.py` |
| Places with instruments but no stored text (link only) | 159 | 2026-11-02 | `python3 tools/coverage.py` |
| Places with stored text but no consolidated text (as published only) | 6 | 2026-11-02 | `python3 tools/coverage.py` |

## Not covered

Counts as of 2026-11-02, from `python3 tools/coverage.py`.

- Places with no watcher (203): AD, AE, AF, AG, AI, AL, AM, AO, AQ, AR, AS, AW, AX, AZ, BA, BB, BD, BF, BH, BI, BJ, BL, BM, BN, BO, BQ, BS, BT, BV, BW, BY, BZ, CC, CD, CF, CG, CI, CK, CL, CM, CO, CR, CU, CV, CW, CX, CY, DJ, DM, DO, DZ, EC, EE, EG, EH, ER, ET, FJ, FK, FM, FO, GA, GD, GE, GF, GG, GH, GI, GL, GM, GN, GP, GQ, GS, GT, GU, GW, GY, HM, HN, HT, IL, IM, IO, IQ, IR, IS, JE, JM, JO, KE, KG, KH, KI, KM, KN, KP, KW, KY, KZ, LA, LB, LC, LI, LK, LR, LS, LY, MA, MC, MD, ME, MF, MG, MH, MK, ML, MM, MN, MO, MP, MQ, MR, MS, MT, MU, MV, MW, MZ, NA, NC, NE, NF, NG, NI, NP, NR, NU, OM, PA, PE, PF, PG, PK, PM, PN, PR, PS, PW, PY, QA, RE, RS, RU, RW, SB, SC, SD, SH, SJ, SL, SM, SN, SO, SR, SS, ST, SV, SX, SY, SZ, TC, TD, TF, TG, TJ, TK, TL, TM, TN, TO, TR, TT, TV, TZ, UA, UG, UM, UY, UZ, VA, VC, VE, VG, VI, VN, VU, WF, WS, YE, YT, ZM, ZW.
- Families with no instrument anywhere in the register (0): none.
- Families with no stored text in any place (1): F7.
- AT: families with no instrument (3): F4, F5, F7.
- AU: families with no instrument (2): F4, F6.
- BE: families with no instrument (3): F4, F5, F7.
- BG: families with no instrument (4): F3, F4, F5, F7.
- BR: families with no instrument (1): F4.
- CA: families with no instrument (3): F1, F4, F7.
- CH: families with no instrument (2): F4, F7.
- CN: families with no instrument (2): F4, F5.
- CZ: families with no instrument (4): F2, F4, F5, F7.
- DE: families with no instrument (1): F4.
- DK: families with no instrument (2): F4, F5.
- ES: families with no instrument (2): F4, F5.
- EU: families with no instrument (4): F2, F3, F4, F7.
- FI: families with no instrument (2): F4, F7.
- FR: families with no instrument (2): F4, F7.
- GB: families with no instrument (5): F2, F3, F4, F5, F7.
- GR: families with no instrument (3): F4, F5, F7.
- HK: families with no instrument (4): F2, F3, F4, F5.
- HR: families with no instrument (2): F4, F7.
- HU: families with no instrument (1): F4.
- ID: families with no instrument (4): F2, F4, F5, F7.
- IE: families with no instrument (1): F7.
- IN: families with no instrument (5): F2, F3, F5, F6, F7.
- IT: families with no instrument (2): F4, F5.
- JP: families with no instrument (4): F2, F4, F5, F6.
- KR: families with no instrument (2): F5, F6.
- LT: families with no instrument (4): F3, F4, F5, F7.
- LU: families with no instrument (2): F4, F5.
- LV: families with no instrument (3): F4, F5, F7.
- MX: families with no instrument (3): F4, F5, F6.
- MY: families with no instrument (3): F3, F4, F5.
- NL: families with no instrument (3): F4, F5, F6.
- NO: families with no instrument (2): F4, F7.
- NZ: families with no instrument (4): F4, F5, F6, F7.
- PH: families with no instrument (3): F3, F4, F5.
- PL: families with no instrument (4): F2, F4, F5, F7.
- PT: families with no instrument (3): F4, F5, F7.
- RO: families with no instrument (6): F2, F3, F4, F5, F6, F7.
- SA: families with no instrument (4): F1, F3, F4, F5.
- SE: families with no instrument (3): F4, F5, F6.
- SG: families with no instrument (3): F2, F4, F5.
- SI: families with no instrument (3): F4, F5, F7.
- SK: families with no instrument (4): F2, F4, F5, F7.
- TH: families with no instrument (5): F2, F3, F4, F5, F6.
- TW: families with no instrument (3): F4, F5, F6.
- US: families with no instrument (5): F2, F4, F5, F6, F7.
- ZA: families with no instrument (2): F5, F7.
- Places with instruments but no stored text, link only (159): AD, AE, AG, AL, AM, AO, AR, AZ, BA, BB, BD, BF, BH, BI, BJ, BN, BO, BS, BT, BW, BY, BZ, CD, CF, CG, CI, CL, CO, CR, CU, CV, CY, DJ, DM, DO, DZ, EC, EE, EG, EH, ER, ET, FJ, FM, GA, GD, GE, GH, GM, GN, GQ, GT, GW, GY, HK, HN, HT, ID, IL, IN, IQ, IR, IS, JM, JO, KE, KG, KH, KI, KM, KN, KP, KW, KZ, LA, LB, LC, LI, LK, LR, LS, LT, LY, MA, MC, MD, ME, MG, MH, MK, ML, MM, MN, MR, MT, MU, MV, MW, MY, MZ, NA, NE, NG, NI, NO, NP, NR, OM, PA, PE, PG, PK, PS, PW, PY, QA, RO, RS, RU, RW, SA, SB, SC, SD, SG, SL, SN, SO, SR, SS, ST, SV, SY, SZ, TD, TG, TH, TJ, TL, TM, TN, TO, TR, TT, TV, TZ, UA, UG, UY, UZ, VA, VC, VE, VN, VU, WS, YE, ZM, ZW.
- Places whose stored texts are the acts as published, no consolidated text (6): BG, GR, HR, HU, PH, ZA. A date lookup for these places returns the act as first printed and the amending acts stored as their own instruments; the amendments are not folded in.
- Places listed with no instrument found (54): AF, AI, AQ, AS, AW, AX, BL, BM, BQ, BV, CC, CK, CM, CW, CX, FK, FO, GF, GG, GI, GL, GP, GS, GU, HM, IM, IO, JE, KY, MF, MO, MP, MQ, MS, NC, NF, NU, PF, PM, PN, PR, RE, SH, SJ, SM, SX, TC, TF, TK, UM, VG, VI, WF, YT.
- Register rows with an instrument but no law family (40), not shown in the grid: AL, BD, BH, BN, CL, CO, CV, DO, EC, EG, ET, GE, GT, HN, IL, IQ, IS, JO, JP, KR, LI, MA, MV, MZ, NG, OM, PE, RS, RU, TR, TZ, UZ, ZW.
- Register rows with no scope entry have no check date in the files; their cells read `unchecked` and are not counted as stale, although their cadence tier is `tracker_pointer`.

## How to read a cell

Each cell is `tier · verification · form · checked · changed · stale`, in this order:

- tier: `tier_hint` of the register row (several rows in one cell are joined with `/`).
- verification: `verification` of the register row, joined the same way.
- form: `text N` where N is the number of record files under `records/` for the instruments in the cell; `link only` when the register lists the instrument with an official URL and no text is stored; `no link` when the register row has neither text nor a URL. A cell with both forms lists them with counts. Blank when the register has no instrument for that place and family.
- checked: the oldest last checked date among the cell's instruments. For an instrument with a watcher in `upkeep/watchers.json` whose `instrument` is its id, the date is that watcher's `checked_on` in `upkeep/seen.json`; otherwise it is the `checked_on` of the licence row in `sources.json`. `unchecked` when no instrument in the cell has a date (every register row without a scope entry).
- changed: the newest `in_force` among the cell's record files; absent when nothing is stored.
- stale: present when any instrument's last checked date is older than the cadence of its source tier. Tiers: rows fetched from Cellar or the Federal Register are `gazette_feed`; legislation.gov.uk and eCFR are `consolidation_site`; every other licence row is `regulator_page`; a register row with no scope entry is `tracker_pointer`. Cadence in days: gazette_feed 7, consolidation_site 14, regulator_page 30, tracker_pointer 90.

## Grid

One row per place in the register, one column per law family, as of 2026-11-02.

| Place | Name | F1 | F2 | F3 | F4 | F5 | F6 | F7 |
|---|---|---|---|---|---|---|---|---|
| AD | Andorra |  | B · tracker_only · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| AE | United Arab Emirates | A · official_page_seen · link only · unchecked |  | A · official_page_seen · link only · unchecked |  |  |  |  |
| AF | Afghanistan |  |  |  |  |  |  |  |
| AG | Antigua & Barbuda |  |  |  |  |  | B · official_text_seen · link only · unchecked |  |
| AI | Anguilla |  |  |  |  |  |  |  |
| AL | Albania |  |  |  |  |  |  |  |
| AM | Armenia |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| AO | Angola |  |  | B · tracker_only · no link · unchecked |  |  |  |  |
| AQ | Antarctica |  |  |  |  |  |  |  |
| AR | Argentina | A · official_text_seen · link only · unchecked | B · official_text_seen · link only · unchecked |  |  |  | B · official_page_seen · link only · unchecked |  |
| AS | American Samoa |  |  |  |  |  |  |  |
| AT | Austria | A · official_text_seen · text 5 · checked 2026-11-02 · changed 2026-02-19 | A · official_text_seen · text 5 · checked 2026-11-02 · changed 2017-04-26 | A · official_text_seen · text 22 · checked 2026-11-02 · changed 2026-07-30 |  |  | A · official_text_seen · text 10 · checked 2026-11-02 · changed 2026-09-27 |  |
| AU | Australia | A · official_text_seen · text 3, link only 4 · checked 2026-11-02 · changed 2025-12-05 | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2025-02-20 | A · official_text_seen · text 76 · checked 2026-11-02 · changed 2026-07-01 |  | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2024-11-07 |  | A · official_page_seen · link only · unchecked |
| AW | Aruba |  |  |  |  |  |  |  |
| AX | Åland Islands |  |  |  |  |  |  |  |
| AZ | Azerbaijan |  |  | A · tracker_only · no link · unchecked |  |  | B · official_page_seen · link only · unchecked |  |
| BA | Bosnia |  |  |  |  |  | A/B · official_page_seen/official_text_seen · link only · unchecked |  |
| BB | Barbados |  |  |  |  |  | B · official_text_seen · link only · unchecked |  |
| BD | Bangladesh |  |  |  |  |  |  |  |
| BE | Belgium | A · official_text_seen · text 17 · checked 2026-11-02 · changed 2026-09-01 | A · official_text_seen · text 9 · checked 2026-11-02 · changed 2024-07-29 | A · official_text_seen · text 31 · checked 2026-11-02 · changed 2026-05-10 |  |  | A · official_text_seen · link only · checked 2026-11-02 |  |
| BF | Burkina Faso |  |  |  |  |  | B · tracker_only · no link · unchecked |  |
| BG | Bulgaria | A · official_text_seen/tracker_only · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  | A · official_text_seen · link only · unchecked |  |
| BH | Bahrain |  |  |  |  |  |  |  |
| BI | Burundi |  |  |  |  |  |  | B · tracker_only · no link · unchecked |
| BJ | Benin |  |  | A · official_text_seen · link only · unchecked |  |  | B · tracker_only · no link · unchecked |  |
| BL | St. Barthélemy |  |  |  |  |  |  |  |
| BM | Bermuda |  |  |  |  |  |  |  |
| BN | Brunei |  |  |  |  |  |  |  |
| BO | Bolivia |  |  |  | A · official_page_seen · link only · unchecked |  |  |  |
| BQ | Caribbean Netherlands |  |  |  |  |  |  |  |
| BR | Brazil | A/B · official_text_seen · text 7 · checked 2026-11-02 · changed 2026-06-01 | A · official_text_seen · text 2 · checked 2026-11-02 · changed 2026-09-23 | A · official_text_seen · text 4 · checked 2026-11-02 · changed 2025-12-08 |  | A · official_text_seen · link only · checked 2026-11-02 | A · official_text_seen · text 7 · checked 2026-11-02 · changed 2027-01-01 | B · official_page_seen · link only · unchecked |
| BS | Bahamas |  | B · official_text_seen · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| BT | Bhutan |  | B · official_page_seen · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| BV | Bouvet Island |  |  |  |  |  |  |  |
| BW | Botswana | B · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| BY | Belarus |  |  | A · official_page_seen · link only · unchecked |  |  |  |  |
| BZ | Belize |  |  | A · official_page_seen · link only · unchecked |  |  |  |  |
| CA | Canada |  | A · official_text_seen · text 7 · checked 2026-11-02 · changed 2026-02-13 | A · official_text_seen · text 43, link only 2 · checked 2026-11-02 · changed 2026-03-26 |  | A · official_text_seen · text 2 · checked 2026-11-02 · changed 2024-01-01 | A · official_text_seen · text 4, link only 1 · checked 2026-11-02 · changed 2026-03-26 |  |
| CC | Cocos Islands |  |  |  |  |  |  |  |
| CD | Congo - Kinshasa |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| CF | Central African Republic |  |  | B · tracker_only · no link · unchecked |  |  |  |  |
| CG | Congo - Brazzaville |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| CH | Switzerland | A · official_text_seen · text 10 · checked 2026-11-02 · changed 2024-01-01 | A · official_text_seen · text 19 · checked 2026-11-02 · changed 2026-11-01 | A · official_text_seen · text 68 · checked 2026-11-02 · changed 2027-01-01 |  | A · official_text_seen · text 12 · checked 2026-11-02 · changed 2024-01-01 | A · official_text_seen · link only · checked 2026-11-02 |  |
| CI | Côte d’Ivoire |  |  | A · official_page_seen · link only · unchecked |  |  | B · official_text_seen · link only · unchecked |  |
| CK | Cook Islands |  |  |  |  |  |  |  |
| CL | Chile |  |  |  |  |  |  |  |
| CM | Cameroon |  |  |  |  |  |  |  |
| CN | China | A · official_page_seen/official_text_seen · text 3, link only 3 · checked 2026-11-02 (1 unchecked) · changed 2026-09-20 | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2026-08-15 | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2026-08-15 |  |  | A · official_text_seen · text 6 · checked 2026-11-02 · changed 2025-10-15 | A/B · official_page_seen/tracker_only · link only · unchecked |
| CO | Colombia |  |  |  |  |  |  |  |
| CR | Costa Rica | B · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| CU | Cuba |  |  | A · tracker_only · no link · unchecked |  |  |  |  |
| CV | Cape Verde |  |  |  |  |  |  |  |
| CW | Curaçao |  |  |  |  |  |  |  |
| CX | Christmas Island |  |  |  |  |  |  |  |
| CY | Cyprus | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| CZ | Czechia | A/B · official_text_seen · text 5, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2026-01-01 |  | A · official_text_seen · text 16 · checked 2026-11-02 · changed 2027-01-01 |  |  | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2023-01-06 |  |
| DE | Germany | A · official_text_seen · link only · unchecked | A · official_text_seen · text 2 · checked 2026-11-02 · changed 2024-07-17 | A · official_text_seen · text 6, link only 3 · checked 2026-11-02 (3 unchecked) · changed 2025-03-06 |  | A · official_text_seen · text 2, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2023-01-01 | A · official_page_seen · link only · checked 2026-11-02 | A · official_page_seen · link only · unchecked |
| DJ | Djibouti |  |  | B · tracker_only · no link · unchecked |  |  |  |  |
| DK | Denmark | A · official_text_seen · text 11, link only 2 · checked 2026-11-02 (2 unchecked) · changed 2026-03-23 | A · official_text_seen · text 2 · checked 2026-11-02 · changed 2021-12-13 | A · official_text_seen · text 15 · checked 2026-11-02 · changed 2026-04-16 |  |  | A · official_text_seen · text 2 · checked 2026-11-02 · changed 2022-06-15 | A · official_page_seen · link only · unchecked |
| DM | Dominica |  | B · tracker_only · no link · unchecked |  |  |  |  |  |
| DO | Dominican Republic |  |  |  |  |  |  |  |
| DZ | Algeria | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| EC | Ecuador |  |  |  |  |  |  |  |
| EE | Estonia | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| EG | Egypt |  |  |  |  |  |  |  |
| EH | Western Sahara |  |  |  |  |  |  | B · official_text_seen · no link · unchecked |
| ER | Eritrea |  |  |  |  |  |  | B · official_text_seen · no link · unchecked |
| ES | Spain | A/B · official_page_seen/official_text_seen · text 4, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2018-12-30 | A · official_text_seen · text 7 · checked 2026-11-02 · changed 2026-07-01 | A · official_text_seen · text 14 · checked 2026-11-02 · changed 2025-06-14 |  |  | A · official_text_seen · text 40 · checked 2026-11-02 · changed 2026-02-28 | A · official_text_seen · link only · unchecked |
| ET | Ethiopia |  |  |  |  |  |  |  |
| EU | European Union | A · official_text_seen · text 10 · checked 2026-11-02 · changed 2026-11-10 |  |  |  | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2026-03-18 | A · official_text_seen · text 22 · checked 2026-11-02 · changed 2026-07-02 |  |
| FI | Finland | A · official_text_seen · text 19, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2026-06-30 | A · official_text_seen · text 7 · checked 2026-11-02 · changed 2025-01-01 | A · official_text_seen · text 30 · checked 2026-11-02 · changed 2026-08-05 |  | A · official_text_seen · text 2 · checked 2026-11-02 · changed 2021-01-01 | A · official_text_seen · text 24 · checked 2026-11-02 · changed 2026-10-01 |  |
| FJ | Fiji |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| FK | Falkland Islands |  |  |  |  |  |  |  |
| FM | Micronesia |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| FO | Faroe Islands |  |  |  |  |  |  |  |
| FR | France | A · official_text_seen · text 11 · checked 2026-11-02 · changed 2025-05-03 | A · official_text_seen · text 6 · checked 2026-11-02 · changed 2023-06-24 | A · official_text_seen · text 8 · checked 2026-11-02 · changed 2025-05-03 |  | A · official_text_seen · text 4 · checked 2026-11-02 · changed 2025-01-01 | A · official_page_seen/official_text_seen · text 9, link only 1 · checked 2026-11-02 · changed 2025-01-01 |  |
| GA | Gabon |  | B · tracker_only · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| GB | UK | A · official_page_seen/official_text_seen · text 10, link only 1 · checked 2026-11-02 · changed 2022-04-06 |  |  |  |  | A · official_text_seen · link only · checked 2026-11-02 |  |
| GD | Grenada |  |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| GE | Georgia |  |  |  |  |  |  |  |
| GF | French Guiana |  |  |  |  |  |  |  |
| GG | Guernsey |  |  |  |  |  |  |  |
| GH | Ghana |  |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| GI | Gibraltar |  |  |  |  |  |  |  |
| GL | Greenland |  |  |  |  |  |  |  |
| GM | Gambia |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| GN | Guinea |  | B · tracker_only · link only · unchecked |  | A · official_text_seen · link only · unchecked |  |  |  |
| GP | Guadeloupe |  |  |  |  |  |  |  |
| GQ | Equatorial Guinea |  |  |  |  |  | B · tracker_only · no link · unchecked |  |
| GR | Greece | A · official_text_seen · text 1, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2019-01-01 | A · official_text_seen · text 1 · checked 2026-11-02 · changed 2022-05-27 | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2025-03-14 |  |  | A · official_page_seen/official_text_seen · text 1, link only 1 · checked 2026-11-02 · changed 2026-07-10 |  |
| GS | South Georgia & South Sandwich Islands |  |  |  |  |  |  |  |
| GT | Guatemala |  |  |  |  |  |  |  |
| GU | Guam |  |  |  |  |  |  |  |
| GW | Guinea-Bissau |  |  |  |  |  | B · official_text_seen/tracker_only · link only, no link 1 · unchecked |  |
| GY | Guyana |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| HK | Hong Kong | A · official_page_seen/official_text_seen · link only · checked 2026-11-02 |  |  |  |  | A · official_page_seen · link only · checked 2026-11-02 | A · official_text_seen · link only · unchecked |
| HM | Heard & McDonald Islands |  |  |  |  |  |  |  |
| HN | Honduras |  |  |  |  |  |  |  |
| HR | Croatia | A · official_text_seen · text 17 · checked 2026-11-02 · changed 2026-06-10 | A · official_text_seen · text 4 · checked 2026-11-02 · changed 2025-04-17 | A · official_text_seen · text 4 · checked 2026-11-02 · changed 2024-12-14 |  | A · official_text_seen · text 1 · checked 2026-11-02 · changed 2025-12-23 | A · official_text_seen · text 2 · checked 2026-11-02 · changed 2026-06-17 |  |
| HT | Haiti |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| HU | Hungary | A · official_text_seen · text 9, link only 1 · checked 2026-11-02 · changed 2025-12-26 | A · official_text_seen · text 1 · checked 2026-11-02 · changed 2020-06-10 | A · official_text_seen · text 1 · checked 2026-11-02 · changed 2012-12-31 |  | A · official_text_seen · text 1 · checked 2026-11-02 · changed 2024-08-16 | A · official_text_seen · text 1, link only 3 · checked 2026-11-02 · changed 2008-06-29 | A · official_page_seen · link only · unchecked |
| ID | Indonesia | A · tracker_only · link only · checked 2026-11-02 (1 unchecked) |  | A · tracker_only · link only · unchecked |  |  | A · tracker_only · link only · unchecked |  |
| IE | Ireland | A · official_text_seen · text 4, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2025-07-07 | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2026-07-27 | A · official_text_seen · text 8 · checked 2026-11-02 · changed 2024-12-19 | A · official_text_seen · link only · checked 2026-11-02 | A · official_text_seen · text 1 · checked 2026-11-02 · changed 2021-01-21 | A · official_text_seen · text 4 · checked 2026-11-02 · changed 2026-09-27 |  |
| IL | Israel |  |  |  |  |  |  |  |
| IM | Isle of Man |  |  |  |  |  |  |  |
| IN | India | A · official_text_seen · link only · checked 2026-11-02 |  |  | A · tracker_only · link only · checked 2026-11-02 |  |  |  |
| IO | British Indian Ocean Territory |  |  |  |  |  |  |  |
| IQ | Iraq |  |  |  |  |  |  |  |
| IR | Iran |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| IS | Iceland |  |  |  |  |  |  |  |
| IT | Italy | A · official_text_seen · text 8 · checked 2026-11-02 · changed 2025-08-10 | A · official_text_seen · text 15 · checked 2026-11-02 · changed 2025-05-14 | A · official_text_seen · text 29 · checked 2026-11-02 · changed 2026-05-23 |  |  | A · official_text_seen · text 28 · checked 2026-11-02 · changed 2026-10-22 | A · official_page_seen · link only · unchecked |
| JE | Jersey |  |  |  |  |  |  |  |
| JM | Jamaica |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| JO | Jordan |  |  |  |  |  |  |  |
| JP | Japan | A · official_page_seen/official_text_seen · text 94, link only 2 · checked 2026-11-02 · changed 2027-10-01 |  | A · official_text_seen · text 36 · checked 2026-11-02 · changed 2026-07-01 |  |  |  | A · official_page_seen · link only · unchecked |
| KE | Kenya | A · official_page_seen · link only · unchecked |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| KG | Kyrgyzstan |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| KH | Cambodia | A · tracker_only · no link · unchecked |  |  |  |  |  |  |
| KI | Kiribati |  | B · tracker_only · no link · unchecked |  |  |  |  |  |
| KM | Comoros |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| KN | St. Kitts & Nevis |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| KP | North Korea |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| KR | South Korea | B · official_page_seen/tracker_only · link only · checked 2026-11-02 | A · official_text_seen · text 44 · checked 2026-11-02 · changed 2027-09-23 | A · official_text_seen · text 38 · checked 2026-11-02 · changed 2027-03-09 | A · official_text_seen · text 6 · checked 2026-11-02 · changed 2025-10-01 |  |  | C · official_page_seen · link only · unchecked |
| KW | Kuwait | A/B · official_page_seen/tracker_only · link only, no link 1 · unchecked |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| KY | Cayman Islands |  |  |  |  |  |  |  |
| KZ | Kazakhstan |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| LA | Laos |  | B · official_page_seen · link only · unchecked | A · official_page_seen · link only · unchecked |  |  |  |  |
| LB | Lebanon |  |  | A/B · official_page_seen · link only · unchecked |  |  |  |  |
| LC | St. Lucia |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| LI | Liechtenstein |  |  |  |  |  |  |  |
| LK | Sri Lanka | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| LR | Liberia |  |  | B · official_page_seen · link only · unchecked |  |  |  |  |
| LS | Lesotho |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| LT | Lithuania | A · official_page_seen/tracker_only · link only · checked 2026-11-02 | A · tracker_only · link only · checked 2026-11-02 |  |  |  | A · tracker_only · link only · checked 2026-11-02 |  |
| LU | Luxembourg | A/B · official_page_seen/official_text_seen · text 1, link only 2 · checked 2026-11-02 (1 unchecked) · changed 2025-12-23 | A · official_text_seen · text 8 · checked 2026-11-02 · changed 2025-07-26 | A · official_text_seen · text 4 · checked 2026-11-02 · changed 2026-01-04 |  |  | A · official_text_seen · text 9 · checked 2026-11-02 · changed 2026-09-27 | B · official_page_seen · link only · unchecked |
| LV | Latvia | A · official_text_seen · text 9 · checked 2026-11-02 · changed 2025-10-24 | A · official_text_seen · text 2 · checked 2026-11-02 · changed 2027-01-01 | A · official_text_seen · text 49 · checked 2026-11-02 · changed 2031-01-01 |  |  | A · official_text_seen · text 8 · checked 2026-11-02 · changed 2027-01-01 |  |
| LY | Libya | B · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| MA | Morocco |  |  |  |  |  |  |  |
| MC | Monaco |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| MD | Moldova |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| ME | Montenegro |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| MF | St. Martin |  |  |  |  |  |  |  |
| MG | Madagascar | B · official_text_seen · link only · unchecked |  |  |  | A · official_text_seen · link only · unchecked |  |  |
| MH | Marshall Islands |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| MK | North Macedonia | A · official_text_seen · link only · unchecked |  | B · official_page_seen · link only · unchecked |  |  |  |  |
| ML | Mali |  | B · tracker_only · link only · unchecked |  | A · official_text_seen · link only · unchecked |  |  |  |
| MM | Myanmar | A · official_text_seen · link only · unchecked | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| MN | Mongolia | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| MO | Macao |  |  |  |  |  |  |  |
| MP | Northern Mariana Islands |  |  |  |  |  |  |  |
| MQ | Martinique |  |  |  |  |  |  |  |
| MR | Mauritania |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| MS | Montserrat |  |  |  |  |  |  |  |
| MT | Malta | B · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| MU | Mauritius | B · official_text_seen · link only · unchecked |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| MV | Maldives |  |  |  |  |  |  |  |
| MW | Malawi |  |  |  |  |  | B · not_checked · link only · unchecked |  |
| MX | Mexico | A/B · official_page_seen/official_text_seen · link only · unchecked | A · official_text_seen · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  | B · official_page_seen · link only · unchecked |
| MY | Malaysia | A · official_page_seen · link only · unchecked | A · tracker_only · link only · checked 2026-11-02 |  |  |  | A · tracker_only · link only · checked 2026-11-02 (1 unchecked) | B · tracker_only · no link · unchecked |
| MZ | Mozambique |  |  |  |  |  |  |  |
| NA | Namibia | B · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| NC | New Caledonia |  |  |  |  |  |  |  |
| NE | Niger |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| NF | Norfolk Island |  |  |  |  |  |  |  |
| NG | Nigeria |  |  |  |  |  |  |  |
| NI | Nicaragua |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| NL | Netherlands | A · official_text_seen · link only · unchecked | A · official_text_seen · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  | B · official_page_seen · link only · unchecked |
| NO | Norway | A · official_page_seen · link only · checked 2026-11-02 (1 unchecked) | A · official_page_seen · link only · checked 2026-11-02 | A · official_page_seen · link only · checked 2026-11-02 |  | A · official_page_seen · link only · checked 2026-11-02 | A · official_page_seen · link only · checked 2026-11-02 |  |
| NP | Nepal | B · not_checked · no link · unchecked |  | B · official_page_seen · link only · unchecked |  |  |  |  |
| NR | Nauru |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| NU | Niue |  |  |  |  |  |  |  |
| NZ | New Zealand | A · official_page_seen/official_text_seen · text 4, link only 3 · checked 2026-11-02 · changed 2024-10-27 | A · official_text_seen · text 35 · checked 2026-11-02 · changed 2026-09-04 | A · official_page_seen/official_text_seen · text 25, link only 3 · checked 2026-11-02 · changed 2026-07-09 |  |  |  |  |
| OM | Oman |  |  |  |  |  |  |  |
| PA | Panama | A · official_text_seen · link only · unchecked |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| PE | Peru |  |  |  |  |  |  |  |
| PF | French Polynesia |  |  |  |  |  |  |  |
| PG | Papua New Guinea |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| PH | Philippines | A · official_text_seen/tracker_only · link only · unchecked | A · official_text_seen · text 1, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2009-11-25 |  |  |  | A · official_text_seen · link only · unchecked | A · tracker_only · no link · unchecked |
| PK | Pakistan | B · official_page_seen · link only · unchecked |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| PL | Poland | A · official_text_seen · text 7, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2026-03-30 |  | A · official_text_seen · text 20 · checked 2026-11-02 · changed 2026-10-02 |  |  | A · official_text_seen · text 5 · checked 2026-11-02 · changed 2027-09-27 |  |
| PM | St. Pierre & Miquelon |  |  |  |  |  |  |  |
| PN | Pitcairn |  |  |  |  |  |  |  |
| PR | Puerto Rico |  |  |  |  |  |  |  |
| PS | Palestine |  |  |  |  |  | A · official_page_seen · link only · unchecked |  |
| PT | Portugal | A · official_text_seen · link only · unchecked | A · official_text_seen · link only · unchecked | A · official_text_seen · link only · unchecked |  |  | A · official_text_seen · link only · unchecked |  |
| PW | Palau |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| PY | Paraguay |  |  | A · official_text_seen · link only · unchecked |  |  | B · official_page_seen · link only · unchecked |  |
| QA | Qatar | A/B · official_page_seen/official_text_seen · link only · unchecked |  |  |  |  |  |  |
| RE | Réunion |  |  |  |  |  |  |  |
| RO | Romania | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| RS | Serbia |  |  |  |  |  |  |  |
| RU | Russia |  |  |  |  |  |  |  |
| RW | Rwanda | A · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| SA | Saudi Arabia |  | A · official_page_seen · link only · unchecked |  |  |  | A · tracker_only · link only · unchecked | A/B/C · official_text_seen/tracker_only · link only, no link 1 · unchecked |
| SB | Solomon Islands |  | B · official_page_seen · link only · unchecked | B · official_page_seen · link only · unchecked |  |  |  |  |
| SC | Seychelles | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| SD | Sudan |  |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| SE | Sweden | A · official_page_seen/official_text_seen · text 4, link only 1 · checked 2026-11-02 · changed 2024-07-01 | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2026-01-01 | A · official_text_seen · text 4 · checked 2026-11-02 · changed 2026-07-01 |  |  |  | A · official_page_seen · link only · unchecked |
| SG | Singapore | A · official_page_seen · link only · checked 2026-11-02 |  | A · official_page_seen · link only · checked 2026-11-02 |  |  | A · tracker_only · link only · checked 2026-11-02 | A · tracker_only · link only · unchecked |
| SH | St. Helena |  |  |  |  |  |  |  |
| SI | Slovenia | A · official_text_seen · text 11, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2026-07-24 | A · official_text_seen · text 1 · checked 2026-11-02 · changed 2025-08-09 | A · official_text_seen · text 5 · checked 2026-11-02 · changed 2025-08-09 |  |  | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2026-12-12 |  |
| SJ | Svalbard & Jan Mayen |  |  |  |  |  |  |  |
| SK | Slovakia | A · official_text_seen · text 46 · checked 2026-11-02 · changed 2027-01-01 |  | A · official_text_seen · text 32 · checked 2026-11-02 · changed 2026-07-15 |  |  | A · official_text_seen · text 10 · checked 2026-11-02 · changed 2026-09-27 |  |
| SL | Sierra Leone |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| SM | San Marino |  |  |  |  |  |  |  |
| SN | Senegal |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| SO | Somalia |  | B · tracker_only · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| SR | Suriname |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| SS | South Sudan |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| ST | São Tomé & Príncipe |  |  |  |  |  | B · not_checked · no link · unchecked |  |
| SV | El Salvador |  |  |  |  |  | A · official_page_seen · link only · unchecked |  |
| SX | Sint Maarten |  |  |  |  |  |  |  |
| SY | Syria |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| SZ | Eswatini |  |  |  |  |  | B · official_page_seen · link only · unchecked |  |
| TC | Turks & Caicos Islands |  |  |  |  |  |  |  |
| TD | Chad |  |  |  |  |  |  | B · not_checked · no link · unchecked |
| TF | French Southern Territories |  |  |  |  |  |  |  |
| TG | Togo |  | B · official_text_seen · link only · unchecked | A · official_page_seen · link only · unchecked |  |  |  |  |
| TH | Thailand | A/B · official_text_seen/tracker_only · link only · unchecked |  |  |  |  |  | B · tracker_only · link only · unchecked |
| TJ | Tajikistan |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| TK | Tokelau |  |  |  |  |  |  |  |
| TL | Timor-Leste |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| TM | Turkmenistan |  | B · official_page_seen · link only · unchecked |  |  |  |  | B · official_text_seen · link only · unchecked |
| TN | Tunisia | B · official_page_seen · link only · unchecked |  |  | A · official_text_seen · link only · unchecked |  |  |  |
| TO | Tonga |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| TR | Türkiye |  |  |  |  |  |  |  |
| TT | Trinidad & Tobago |  |  |  |  |  | B · official_text_seen · link only · unchecked |  |
| TV | Tuvalu |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| TW | Taiwan | A · official_text_seen · text 2, link only 1 · checked 2026-11-02 (1 unchecked) · changed 2025-12-19 | A · official_text_seen · text 5 · checked 2026-11-02 · changed 2025-07-16 | A · official_text_seen · text 11 · checked 2026-11-02 · changed 2026-09-01 |  |  |  | B · tracker_only · link only · unchecked |
| TZ | Tanzania |  |  |  |  |  |  |  |
| UA | Ukraine | B · official_page_seen · link only · unchecked |  | A · official_page_seen · link only · unchecked |  |  |  |  |
| UG | Uganda | B · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| UM | U.S. Outlying Islands |  |  |  |  |  |  |  |
| US | US | A · official_text_seen · text 6 · checked 2026-11-02 · changed 2025-10-11 |  | A · official_text_seen · text 28 · checked 2026-11-02 · changed 2026-10-14 |  |  |  |  |
| UY | Uruguay |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| UZ | Uzbekistan |  |  |  |  |  |  |  |
| VA | Vatican City |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| VC | St. Vincent & Grenadines |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| VE | Venezuela |  | B · tracker_only · no link · unchecked |  |  |  |  |  |
| VG | British Virgin Islands |  |  |  |  |  |  |  |
| VI | U.S. Virgin Islands |  |  |  |  |  |  |  |
| VN | Vietnam | A · official_page_seen · link only · unchecked |  | A · official_page_seen · link only · unchecked |  |  |  |  |
| VU | Vanuatu |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| WF | Wallis & Futuna |  |  |  |  |  |  |  |
| WS | Samoa |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| YE | Yemen |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| YT | Mayotte |  |  |  |  |  |  |  |
| ZA | South Africa | A/B · tracker_only · link only · checked 2026-11-02 (1 unchecked) | A · official_text_seen · text 1 · checked 2026-11-02 · changed 2025-03-17 | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2020-09-11 | A · official_page_seen/official_text_seen · text 1, link only 2 · checked 2026-11-02 · changed 2011-05-01 |  | A · official_text_seen · text 1, link only 2 · checked 2026-11-02 · changed 2011-07-01 |  |
| ZM | Zambia |  | B · official_page_seen · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| ZW | Zimbabwe |  |  |  |  |  |  |  |

## Pilot places by instrument

As of 2026-11-02. `versions` is the number of record files; `checked from` says whether the date came from a watcher or from the licence row.

### AT (Austria)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| at-nabeg | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-02-19 | current |
| at-dribeg | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-02-19 | current |
| at-ugb-243b-267a | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-02-19 | current |
| at-nadiveg-2017 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2016-12-06 | current |
| at-ksg | F2 | text 5 | 5 | 2026-11-02 | licence row | regulator_page | 2017-04-26 | current |
| at-ezg-2011 | F3 | text 11 | 11 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| at-nehg-2022 | F3 | text 10 | 10 | 2026-11-02 | licence row | regulator_page | 2026-07-30 | current |
| at-nehg-preisstabilitaets-vo | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2022-12-15 | current |
| at-uwg-s1-2a | F6 | text 10 | 10 | 2026-11-02 | licence row | regulator_page | 2026-09-27 | current |

### AU (Australia)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| au-tlaa-2024-87 | F1 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2024-09-18 | current |
| au-corporations-act-2001-pt2m3 | F1 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2025-12-05 | current |
| au-aasb-s2 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| au-aasb-s2025-1 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| au-assa-5010 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| au-assa-2025-10 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| au-nger-act-2007 | F3 | text 27 | 27 | 2026-11-02 | watcher | regulator_page | 2025-11-03 | current |
| au-nger-regulations-2008 | F3 | text 34 | 34 | 2026-11-02 | watcher | regulator_page | 2026-07-01 | current |
| au-nger-safeguard-rule-2015 | F3 | text 14 | 14 | 2026-11-02 | watcher | regulator_page | 2024-08-31 | current |
| au-safeguard-crediting-act-2023 | F3 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2023-04-12 | current |
| au-climate-change-act-2022 | F2 | text 3 | 3 | 2026-11-02 | watcher | regulator_page | 2025-02-20 | current |
| au-modern-slavery-act-2018 | F5 | text 3 | 3 | 2026-11-02 | watcher | regulator_page | 2024-11-07 | current |

### BE (Belgium)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| be-loi-2024-12-02-csrd | F1 | text 9 | 9 | 2026-11-02 | licence row | regulator_page | 2026-07-31 | current |
| be-csa-art-3-6-3-32 | F1 | text 8 | 8 | 2026-11-02 | licence row | regulator_page | 2026-09-01 | current |
| be-loi-2024-01-15-climat | F2 | text 5 | 5 | 2026-11-02 | licence row | regulator_page | 2024-02-17 | current |
| be-ar-2024-06-16-climate-financing | F2 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2024-07-29 | current |
| be-wallonia-ets-decree-2004 | F3 | text 23 | 23 | 2026-11-02 | licence row | regulator_page | 2025-05-02 | current |
| be-wallonia-ets2-decree-2025 | F3 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2023-12-31 | current |
| be-flanders-ets2-decree-2026 | F3 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2026-05-10 | current |
| be-cde-book-vi-art-vi92-vi103 | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### BG (Bulgaria)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| bg-zschet | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2016-01-01 | current |
| bg-zschet-zid-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-07-06 | current |
| bg-zschet-zid-2025 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| bg-znfo-zid-2024 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| bg-zoik | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2014-03-11 | current |
| bg-zoik-zid-2025 | F2 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| bg-zzp-zid-2026 | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-09-27 | current |

### BR (Brazil)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| br-lei-15042-2024 | F3 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2024-12-27 | current |
| br-decreto-12677-2025 | F3 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2025-11-06 | current |
| br-decreto-12768-2025 | F3 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2025-12-08 | current |
| br-lei-12187-2009 | F2 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2026-09-23 | current |
| br-cvm-res-193-2023 | F1 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2026-06-01 | current |
| br-cvm-res-219-2024 | F1 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2024-11-01 | current |
| br-cvm-res-227-2025 | F1 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2025-04-01 | current |
| br-cvm-res-244-2026 | F1 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2026-06-01 | current |
| br-cvm-res-59-2021 | F1 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2023-01-02 | current |
| br-cmn-res-4943-2021 | F6 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2022-07-01 | current |
| br-cmn-res-4944-2021 | F6 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2022-12-01 | current |
| br-cmn-res-4945-2021 | F6 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2025-01-01 | current |
| br-bcb-res-139-2021 | F6 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2027-01-01 | current |
| br-bcb-res-140-2021 | F6 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2021-10-01 | current |
| br-bcb-res-586-2026 | F6 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2027-01-01 | current |
| br-mte-portaria-18-2024 | F5 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### CA (Canada)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| ca-ggppa | F3 | text 24 | 24 | 2026-11-02 | watcher | regulator_page | 2026-03-26 | current |
| ca-obps-regs | F3 | text 12 | 12 | 2026-11-02 | watcher | regulator_page | 2025-04-01 | current |
| ca-cneaa | F2 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2023-03-31 | current |
| ca-competition-act-s74-01 | F6 | text 4 | 4 | 2026-11-02 | watcher | regulator_page | 2026-03-26 | current |
| ca-faflcsca | F5 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2024-01-01 | current |
| ca-clean-fuel-regs | F3 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2024-09-30 | current |
| ca-methane-regs | F3 | text 4 | 4 | 2026-11-02 | watcher | regulator_page | 2025-12-12 | current |
| ca-offset-credit-regs | F3 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2022-05-20 | current |
| ca-fsda | F2 | text 5 | 5 | 2026-11-02 | watcher | regulator_page | 2026-02-13 | current |
| ca-cepa-s46-ghg-notice-2023 | F3 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| ca-cepa-s46-ghg-notice-amend-2025 | F3 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| ca-osfi-b15 | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### CH (Switzerland)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| ch-co-art964a-c | F1 | text 4 | 4 | 2026-11-02 | watcher | regulator_page | 2022-01-01 | current |
| ch-co-art964j-l | F5 | text 4 | 4 | 2026-11-02 | watcher | regulator_page | 2022-01-01 | current |
| ch-vsotr | F5 | text 8 | 8 | 2026-11-02 | watcher | regulator_page | 2024-01-01 | current |
| ch-climate-disclosure-ordinance | F1 | text 6 | 6 | 2026-11-02 | watcher | regulator_page | 2024-01-01 | current |
| ch-klg | F2 | text 7 | 7 | 2026-11-02 | watcher | regulator_page | 2025-01-01 | current |
| ch-klv | F2 | text 12 | 12 | 2026-11-02 | watcher | regulator_page | 2026-11-01 | current |
| ch-co2-act | F3 | text 15 | 15 | 2026-11-02 | watcher | regulator_page | 2027-01-01 | current |
| ch-co2-ordinance | F3 | text 53 | 53 | 2026-11-02 | watcher | regulator_page | 2026-01-01 | current |
| ch-finma-circ-2026-1 | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### CN (China)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| cn-ecology-code | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-08-15 | current |
| cn-epl | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-08-15 | current |
| cn-ets-regulation | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-08-15 | current |
| cn-ets-measures | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2021-02-01 | current |
| cn-env-disclosure-measures | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-09-20 | current |
| cn-sustainability-basic-standard | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-11-20 | current |
| cn-climate-standard-1 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-12-19 | current |
| cn-sse-sustainability-guideline-14 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| cn-szse-sustainability-guideline-17 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| cn-bse-sustainability-guideline-11 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| cn-aucl | F6 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2025-10-15 | current |
| cn-advertising-law | F6 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2021-04-29 | current |

### CZ (Czechia)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| cz-accounting-act-sustainability-reporting | F1 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| cz-act-316-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-09-03 | current |
| cz-ets-act-383-2012 | F3 | text 9 | 9 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| cz-ets-decree-103-2025 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-04-16 | current |
| cz-ets-indirect-cost-compensation-order-565-2020 | F3 | text 6 | 6 | 2026-11-02 | licence row | regulator_page | 2027-01-01 | current |
| cz-consumer-protection-act-634-1992-s4-5a | F6 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2023-01-06 | current |

### DE (Germany)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| de-hgb-nfe | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2017-04-19 | current |
| de-lksg | F5 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2023-01-01 | current |
| de-ksg | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-07-17 | current |
| de-tehg | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-03-06 | current |
| de-behg | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-03-06 | current |
| de-behv | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-09-16 | current |
| de-ebev-2030 | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2022-12-31 | current |
| de-ehv-2030 | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-07-15 | current |
| de-becv | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2021-07-28 | current |
| de-minrohsorgg | F5 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2020-05-07 | current |
| de-bafin-merkblatt-nachhaltigkeitsrisiken | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### DK (Denmark)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| dk-arl-99a | F1 | text 6 | 6 | 2026-11-02 | licence row | regulator_page | 2026-03-23 | current |
| dk-lov-480-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-06-01 | current |
| dk-lov-1636-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-12-31 | current |
| dk-lov-52-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-02-01 | current |
| dk-bek-453-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-05-15 | current |
| dk-bek-328-2026 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-02-26 | current |
| dk-bek-1700-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| dk-bek-1487-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| dk-klimaloven | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2021-12-13 | current |
| dk-co2-kvoteloven | F3 | text 5 | 5 | 2026-11-02 | licence row | regulator_page | 2024-01-01 | current |
| dk-co2-afgiftsloven | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2020-09-02 | current |
| dk-emissionsafgiftsloven | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-03-20 | current |
| dk-transport-ghg | F3 | text 6 | 6 | 2026-11-02 | licence row | regulator_page | 2026-04-16 | current |
| dk-markedsfoeringsloven | F6 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2022-06-15 | current |

### ES (Spain)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| es-ley-11-2018 | F1 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2018-12-30 | current |
| es-ley-7-2021 | F2 | text 7 | 7 | 2026-11-02 | licence row | regulator_page | 2026-07-01 | current |
| es-ley-1-2005 | F3 | text 11 | 11 | 2026-11-02 | licence row | regulator_page | 2020-12-18 | current |
| es-rd-214-2025 | F3 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2025-06-14 | current |
| es-ley-3-1991 | F6 | text 14 | 14 | 2026-11-02 | licence row | regulator_page | 2025-12-28 | current |
| es-rdl-1-2007 | F6 | text 26 | 26 | 2026-11-02 | licence row | regulator_page | 2026-02-28 | current |

### EU (European Union)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| eu-csrd-2022-2464 | F1 | text 3 | 3 | 2026-11-02 | watcher | gazette_feed | 2026-03-18 | current |
| eu-esrs-2023-2772 | F1 | text 3 | 3 | 2026-11-02 | watcher | gazette_feed | 2025-11-13 | current |
| eu-taxonomy-2020-852 | F6 | text 1 | 1 | 2026-11-02 | watcher | gazette_feed | 2020-07-12 | current |
| eu-sfdr-2019-2088 | F6 | text 4 | 4 | 2026-11-02 | watcher | gazette_feed | 2026-07-02 | current |
| eu-csddd-2024-1760 | F5 | text 3 | 3 | 2026-11-02 | watcher | gazette_feed | 2026-03-18 | current |
| eu-omnibus-stop-the-clock-2025-794 | F1 | text 1 | 1 | 2026-11-02 | watcher | gazette_feed | 2025-04-17 | current |
| eu-omnibus-content-2026-470 | F1 | text 1 | 1 | 2026-11-02 | watcher | gazette_feed | 2026-03-18 | current |
| eu-esrs-amendment-2025-1416 | F1 | text 1 | 1 | 2026-11-02 | watcher | gazette_feed | 2025-11-13 | current |
| eu-esrs-amendment-2026-1563 | F1 | text 1 | 1 | 2026-11-02 | watcher | gazette_feed | 2026-11-10 | current |
| eu-taxonomy-climate-da-2021-2139 | F6 | text 6 | 6 | 2026-11-02 | watcher | gazette_feed | 2026-01-01 | current |
| eu-taxonomy-disclosures-da-2021-2178 | F6 | text 4 | 4 | 2026-11-02 | watcher | gazette_feed | 2026-01-01 | current |
| eu-taxonomy-complementary-climate-da-2022-1214 | F6 | text 1 | 1 | 2026-11-02 | watcher | gazette_feed | 2022-08-04 | current |
| eu-taxonomy-environmental-da-2023-2486 | F6 | text 2 | 2 | 2026-11-02 | watcher | gazette_feed | 2026-01-01 | current |
| eu-taxonomy-climate-amendment-da-2023-2485 | F6 | text 1 | 1 | 2026-11-02 | watcher | gazette_feed | 2023-12-11 | current |
| eu-taxonomy-simplification-da-2026-73 | F6 | text 1 | 1 | 2026-11-02 | watcher | gazette_feed | 2026-01-28 | current |
| eu-sfdr-rts-2022-1288 | F6 | text 2 | 2 | 2026-11-02 | watcher | gazette_feed | 2023-02-20 | current |

### FI (Finland)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| fi-kirjanpitolaki-sustainability-reporting | F1 | text 13 | 13 | 2026-11-02 | licence row | regulator_page | 2026-06-30 | current |
| fi-laki-1376-2016 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2016-12-31 | current |
| fi-laki-1249-2023 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2023-12-31 | current |
| fi-laki-605-2024 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-11-15 | current |
| fi-laki-1250-2023 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2023-12-31 | current |
| fi-ilmastolaki | F2 | text 7 | 7 | 2026-11-02 | licence row | regulator_page | 2025-01-01 | current |
| fi-paastokauppalaki | F3 | text 10 | 10 | 2026-11-02 | licence row | regulator_page | 2026-08-05 | current |
| fi-paastokauppalaki-2011 | F3 | text 20 | 20 | 2026-11-02 | licence row | regulator_page | 2024-01-01 | current |
| fi-kuluttajansuojalaki-marketing | F6 | text 24 | 24 | 2026-11-02 | licence row | regulator_page | 2026-10-01 | current |
| fi-konfliktimineraalilaki | F5 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2021-01-01 | current |

### FR (France)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| fr-ordonnance-2023-1142 | F1 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2025-05-03 | current |
| fr-decret-2023-1394 | F1 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2024-06-30 | current |
| fr-code-commerce-l232-6-3 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-05-03 | current |
| fr-code-commerce-l233-28-4 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-05-03 | current |
| fr-devoir-de-vigilance | F5 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2025-01-01 | current |
| fr-cmf-l533-22-1 | F6 | text 7 | 7 | 2026-11-02 | licence row | regulator_page | 2025-01-01 | current |
| fr-decret-2021-663 | F6 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2021-05-29 | current |
| fr-code-env-l229-25 | F3 | text 7 | 7 | 2026-11-02 | licence row | regulator_page | 2025-05-03 | current |
| fr-code-env-l229-68 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2021-08-25 | current |
| fr-code-energie-l100-4 | F2 | text 6 | 6 | 2026-11-02 | licence row | regulator_page | 2023-06-24 | current |
| fr-amf-doc-2020-03 | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### GB (UK)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| gb-ca2006-s414cb | F1 | text 2 | 2 | 2026-11-02 | watcher | consolidation_site | 2022-04-06 | current |
| gb-ca2006-s414a-414d | F1 | text 7 | 7 | 2026-11-02 | watcher | consolidation_site | 2022-04-06 | current |
| gb-uksi-2022-31 | F1 | text 1 | 1 | 2026-11-02 | watcher | consolidation_site | 2022-04-06 | current |
| gb-fca-esg-sdr | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| gb-uk-srs-s1-s2 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### GR (Greece)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| gr-law-4548-2018-art151-154 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2019-01-01 | current |
| gr-law-5164-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-12-12 | current |
| gr-law-4936-2022 | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2022-05-27 | current |
| gr-kya-ets-2024-86227 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-08-09 | current |
| gr-kya-ets-2025-7560 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-02-10 | current |
| gr-kya-ets-2025-28010 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-03-14 | current |
| gr-law-5317-2026 | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-07-10 | current |
| gr-law-2251-1994-unfair-practices | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### HK (Hong Kong)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| hk-hkex-esg-code-part-d | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| hk-cap622-sch5 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| hk-hkfrs-s1-s2 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| hk-hkma-spm-gs1 | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| hk-taxonomy-sustainable-finance | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### HR (Croatia)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| hr-zor-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-07-27 | current |
| hr-zor-2024-izm-145-24 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-12-14 | current |
| hr-zor-2024-izm-151-25 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-12-31 | current |
| hr-zor-2024-izm-59-26 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-06-10 | current |
| hr-zor-2015 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-07-27 | current |
| hr-zor-2015-izm-120-16 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-07-27 | current |
| hr-zor-2015-izm-116-18 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-07-27 | current |
| hr-zor-2015-izm-42-20 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-07-27 | current |
| hr-zor-2015-izm-82-23 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-07-27 | current |
| hr-reviziji-izm-85-24 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-07-27 | current |
| hr-reviziji-izm-151-25 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-12-31 | current |
| hr-ztk-izm-85-24 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-07-27 | current |
| hr-zkpzos-2025 | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-04-17 | current |
| hr-zkpzos-2019 | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-04-17 | current |
| hr-uredba-pracenje-ghg-2017 | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2017-01-26 | current |
| hr-uredba-trgovanje-ets-2020 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2020-08-08 | current |
| hr-pravilnik-besplatna-dodjela-2020 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2020-08-08 | current |
| hr-uredba-mehanizmi-ets-2023 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2023-09-23 | current |
| hr-uredba-mehanizmi-ets-izm-145-24 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-12-14 | current |
| hr-eudr-provedba-2025 | F5 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-12-23 | current |
| hr-zzp-2022 | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2022-05-28 | current |
| hr-zzp-izm-59-26 | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-06-17 | current |

### HU (Hungary)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| hu-esg-act-2023-cviii | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-01-01 | current |
| hu-accounting-act-2000-c | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| hu-climate-act-2020-xliv | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2020-06-10 | current |
| hu-ets-act-2012-ccxvii | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2012-12-31 | current |
| hu-ucp-act-2008-xlvii | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2008-06-29 | current |
| hu-esg-sztfh-13-2024 | F5 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-08-16 | current |
| hu-esg-sztfh-12-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-08-18 | current |
| hu-esg-korm-276-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-09-06 | current |
| hu-esg-korm-424-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-12-26 | current |
| hu-esg-sztfh-15-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-12-26 | current |
| hu-esg-sztfh-11-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-08-12 | current |
| hu-esg-ngm-29-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-08-09 | current |
| hu-esg-ngm-30-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-08-09 | current |
| hu-esg-korm-244-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-08-09 | current |
| hu-mnb-rec-2-2026 | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| hu-mnb-rec-16-2025 | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| hu-mnb-rec-12-2023 | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### ID (Indonesia)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| id-pojk-51-2017 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| id-seojk-16-2021 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| id-perpres-98-2021 | F3 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| id-permen-lhk-21-2022 | F3 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| id-pojk-14-2023 | F3 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| id-uu-4-2023-p2sk | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### IE (Ireland)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| ie-si-360-2017 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2017-08-21 | current |
| ie-si-410-2018 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2018-10-17 | current |
| ie-si-336-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-07-06 | current |
| ie-si-498-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-10-01 | current |
| ie-si-309-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-07-07 | current |
| ie-climate-act-2015 | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-07-27 | current |
| ie-climate-amendment-act-2021 | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2021-09-07 | current |
| ie-si-470-2024 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-09-19 | current |
| ie-si-490-2012 | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-09-19 | current |
| ie-si-755-2020 | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-09-19 | current |
| ie-si-471-2024 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-09-19 | current |
| ie-si-740-2024 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-12-19 | current |
| ie-si-472-2024 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-09-19 | current |
| ie-cpa-2007-part-3 | F6 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2025-11-24 | current |
| ie-si-124-2026 | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-09-27 | current |
| ie-si-16-2021 | F5 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2021-01-21 | current |
| ie-cbi-climate-guidance-insurance | F4 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### IN (India)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| in-companies-act-2013-s135 | F4 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| in-sebi-lodr-reg-34-2-f | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| in-sebi-brsr-circular-2021 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| in-sebi-brsr-core-circular-2023 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| in-sebi-brsr-assessment-circular-2025 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### IT (Italy)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| it-dlgs-125-2024 | F1 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2025-08-10 | current |
| it-dlgs-254-2016 | F1 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2024-09-25 | current |
| it-dlgs-30-2013 | F3 | text 10 | 10 | 2026-11-02 | licence row | regulator_page | 2020-06-25 | current |
| it-dlgs-47-2020 | F3 | text 19 | 19 | 2026-11-02 | licence row | regulator_page | 2026-05-23 | current |
| it-dl-111-2019 | F2 | text 13 | 13 | 2026-11-02 | licence row | regulator_page | 2025-05-14 | current |
| it-l-141-2019 | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2019-12-14 | current |
| it-dlgs-30-2026 | F6 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-03-24 | current |
| it-codice-consumo-arts-20-27 | F6 | text 26 | 26 | 2026-11-02 | licence row | regulator_page | 2026-10-22 | current |
| it-consob-23463 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-03-22 | current |

### JP (Japan)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| jp-fiea | F1 | text 55 | 55 | 2026-11-02 | watcher | regulator_page | 2027-10-01 | current |
| jp-cao-disclosure-order | F1 | text 39 | 39 | 2026-11-02 | watcher | regulator_page | 2026-10-05 | current |
| jp-gw-act | F3 | text 13 | 13 | 2026-11-02 | watcher | regulator_page | 2026-01-01 | current |
| jp-gw-reporting-order | F3 | text 12 | 12 | 2026-11-02 | watcher | regulator_page | 2026-07-01 | current |
| jp-gx-act | F3 | text 7 | 7 | 2026-11-02 | watcher | regulator_page | 2026-04-01 | current |
| jp-gx-order | F3 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2026-04-01 | current |
| jp-gx-regulation | F3 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2026-04-01 | current |
| jp-ssbj-standards | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| jp-tse-cg-code | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### KR (South Korea)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| kr-carbon-neutrality-act | F2 | text 20 | 20 | 2026-11-02 | watcher | regulator_page | 2027-09-23 | current |
| kr-carbon-neutrality-act-decree | F2 | text 24 | 24 | 2026-11-02 | watcher | regulator_page | 2026-11-12 | current |
| kr-ets-act | F3 | text 15 | 15 | 2026-11-02 | watcher | regulator_page | 2027-03-09 | current |
| kr-ets-act-decree | F3 | text 23 | 23 | 2026-11-02 | watcher | regulator_page | 2026-10-08 | current |
| kr-sapa | F4 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2022-01-27 | current |
| kr-sapa-decree | F4 | text 5 | 5 | 2026-11-02 | watcher | regulator_page | 2025-10-01 | current |
| kr-kssb-ksds | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| kr-krx-governance-report | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### LT (Lithuania)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| lt-company-reporting-act | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| lt-financial-reporting-act-ix575 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| lt-consolidated-reporting-act-ix576 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| lt-climate-change-management-act | F2 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| lt-unfair-commercial-practices-act | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### LU (Luxembourg)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| lu-climate-law-2020 | F2 | text 7 | 7 | 2026-11-02 | licence row | regulator_page | 2025-07-26 | current |
| lu-climate-pact-law-2021 | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2021-01-01 | current |
| lu-ghg-allocations-rgd-2022 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2022-07-05 | current |
| lu-ets-aid-law-2022 | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-01-04 | current |
| lu-ghg-inventory-rgd-2017 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2017-05-01 | current |
| lu-rcs-act-2002 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-12-23 | current |
| lu-nfi-law-2016 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| lu-sfdr-law-2022 | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2022-01-01 | current |
| lu-consumer-code-unfair-practices | F6 | text 7 | 7 | 2026-11-02 | licence row | regulator_page | 2026-09-27 | current |
| lu-consumer-law-2026-green-transition | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-09-27 | current |

### LV (Latvia)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| lv-ilgtspejas-informacijas-likums | F1 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2025-10-24 | current |
| lv-gada-parskatu-likums | F1 | text 6 | 6 | 2026-11-02 | licence row | regulator_page | 2024-10-17 | current |
| lv-klimatnoturibas-likums | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2027-01-01 | current |
| lv-par-piesarnojumu | F3 | text 42 | 42 | 2026-11-02 | licence row | regulator_page | 2031-01-01 | current |
| lv-mk-769-ets-iekartas | F3 | text 7 | 7 | 2026-11-02 | licence row | regulator_page | 2021-04-08 | current |
| lv-negodigas-komercprakses-likums | F6 | text 8 | 8 | 2026-11-02 | licence row | regulator_page | 2027-01-01 | current |

### MX (Mexico)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| mx-lgcc | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-04-02 | current |
| mx-lgcc-reg-rne | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2014-10-29 | current |
| mx-rne-gases-acuerdo-2015 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2015-08-15 | current |
| mx-rne-metodologias-acuerdo-2015 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2015-09-04 | current |
| mx-sce-programa-prueba-2019 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2019-10-02 | current |
| mx-cnbv-emisoras-disposiciones | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| mx-cnbv-emisoras-sostenibilidad-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-01-29 | current |
| mx-cinif-nis | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### MY (Malaysia)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| my-bursa-mmlr-sustainability | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| my-eqa-1974 | F2 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| my-cpa-1999 | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| my-tda-2011 | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### NL (Netherlands)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| nl-klimaatwet | F2 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| nl-besluit-bekendmaking-niet-financiele-informatie | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2017-03-24 | current |
| nl-bw2-art391 | F1 | text 6 | 6 | 2026-11-02 | licence row | regulator_page | 2026-07-01 | current |
| nl-wm-titel-16-2 | F3 | text 27 | 27 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| nl-wet-co2-heffing-industrie | F3 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2024-01-01 | current |

### NO (Norway)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| no-regnskapsloven-ch2 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| no-endringslov-2024-42 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| no-klimaloven | F2 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| no-klimakvoteloven | F3 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| no-klimakvoteforskriften | F3 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| no-apenhetsloven | F5 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| no-markedsforingsloven | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### NZ (New Zealand)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| nz-fmc-act-2013-part-7a | F1 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2024-10-27 | current |
| nz-fsca-2021-39 | F1 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2021-10-28 | current |
| nz-fmc-climate-regs-2023-222 | F1 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2023-10-02 | current |
| nz-nzcs-1 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| nz-nzcs-2 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| nz-nzcs-3 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| nz-ccra-zero-carbon-2019-61 | F2 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2019-11-14 | current |
| nz-ccra-2002-part-1b | F2 | text 7 | 7 | 2026-11-02 | watcher | regulator_page | 2025-12-17 | current |
| nz-ccra-2002-part-4 | F2 | text 27 | 27 | 2026-11-02 | watcher | regulator_page | 2026-09-04 | current |
| nz-ets-stationary-energy-regs-2009-285 | F3 | text 25 | 25 | 2026-11-02 | watcher | regulator_page | 2026-07-09 | current |
| nz-ets-liquid-fossil-fuels-regs-2008-356 | F3 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| nz-ets-waste-regs-2010-338 | F3 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| nz-ets-forestry-regs-2022-266 | F3 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### PH (Philippines)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| ph-sec-mc-16-2025 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| ph-sec-mc-4-2019 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| ph-ra-9729 | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2009-11-25 | current |
| ph-ra-10174 | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2012-09-08 | current |
| ph-ra-7394-ch6-advertising | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 1992-07-15 | current |
| ph-bsp-circular-1128 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### PL (Poland)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| pl-accounting-act | F1 | text 6 | 6 | 2026-11-02 | licence row | regulator_page | 2026-03-30 | current |
| pl-csrd-act-2024 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-01-01 | current |
| pl-csrd-act-2025 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-08-12 | current |
| pl-ets-act | F3 | text 10 | 10 | 2026-11-02 | licence row | regulator_page | 2026-10-02 | current |
| pl-emissions-management-act | F3 | text 9 | 9 | 2026-11-02 | licence row | regulator_page | 2026-03-27 | current |
| pl-kobize-report-regulation | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2022-10-31 | current |
| pl-unfair-practices-act | F6 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2023-04-07 | current |
| pl-ecgt-amendment-act-2026 | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2027-09-27 | current |

### PT (Portugal)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| pt-dl-89-2017 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2017-08-02 | current |
| pt-lei-98-2021 | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-04-01 | current |
| pt-dl-12-2020 | F3 | text 3 | 3 | 2026-11-02 | licence row | regulator_page | 2024-12-09 | current |
| pt-dl-98-2024 | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-12-04 | current |
| pt-dl-182-2026 | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-09-15 | current |
| pt-dl-57-2008 | F6 | text 5 | 5 | 2026-11-02 | licence row | regulator_page | 2023-04-03 | current |

### RO (Romania)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| ro-omf-85-2024 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### SA (Saudi Arabia)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| sa-environment-law | F2 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| sa-air-quality-regulation | F2 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| sa-anti-commercial-fraud-law | F6 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### SE (Sweden)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| se-arl-ch6 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-07-01 | current |
| se-arl-ch7-s31 | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-07-01 | current |
| se-sfs-2024-347 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| se-klimatlag | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2018-01-01 | current |
| se-klimatpolitiska-radet | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2022-10-01 | current |
| se-klimatrapporteringsforordning | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| se-ets-act | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| se-ets-ordinance | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-07-01 | current |
| se-klimatdeklaration-lag | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2022-01-01 | current |
| se-klimatdeklaration-forordning | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2022-01-01 | current |
| se-reduktion-lag | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-07-01 | current |
| se-reduktion-forordning | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-07-01 | current |

### SG (Singapore)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| sg-sgx-lr-711a-711b | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| sg-sgx-pn-7-6 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| sg-cpa-2018 | F3 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| sg-cpa-mrv-regs-2018 | F3 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| sg-mas-erm-banks | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| sg-mas-erm-insurers | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| sg-mas-erm-asset-managers | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### SI (Slovenia)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| si-zgd-1-art70c | F1 | text 5 | 5 | 2026-11-02 | licence row | regulator_page | 2026-07-24 | current |
| si-zgd-1m | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-12-18 | current |
| si-zgd-1n | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-10-08 | current |
| si-zgd-1o | F1 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-07-24 | current |
| si-poz | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-08-09 | current |
| si-zvo-2-ets | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-08-09 | current |
| si-zvpot-1 | F6 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-12-12 | current |
| si-zvpot-1a | F6 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2026-11-13 | current |
| si-uredba-sfdr | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-01-03 | current |
| si-ziuezo | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-02-25 | current |
| si-uredba-brezplacni-kuponi | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-08-09 | current |
| si-pravilnik-mrv | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2011-07-30 | current |

### SK (Slovakia)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| sk-accounting-act | F1 | text 44 | 44 | 2026-11-02 | licence row | regulator_page | 2027-01-01 | current |
| sk-act-105-2024 | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2024-06-01 | current |
| sk-ets-act | F3 | text 22 | 22 | 2026-11-02 | licence row | regulator_page | 2026-07-15 | current |
| sk-act-186-2023 | F3 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2025-01-01 | current |
| sk-act-236-2024 | F3 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2026-01-01 | current |
| sk-act-125-2026 | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-07-15 | current |
| sk-consumer-protection-act | F6 | text 6 | 6 | 2026-11-02 | licence row | regulator_page | 2026-09-27 | current |
| sk-act-310-2025 | F6 | text 4 | 4 | 2026-11-02 | licence row | regulator_page | 2026-09-27 | current |

### TH (Thailand)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| th-cmsb-tor-jor-55-2563 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| th-sec-issb-notifications | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |
| th-sea-2535-s56 | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### TW (Taiwan)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| tw-climate-change-response-act | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2023-02-15 | current |
| tw-climate-change-response-act-rules | F2 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2023-12-29 | current |
| tw-climate-risk-assessment-guidelines | F2 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-07-16 | current |
| tw-ghg-inventory-registration-regs | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-12-19 | current |
| tw-carbon-fee-regs | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2026-09-01 | current |
| tw-ghg-voluntary-reduction-regs | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2023-10-12 | current |
| tw-ghg-reduction-credit-trading-regs | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2024-08-15 | current |
| tw-ghg-increment-offset-regs | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2023-10-12 | current |
| tw-ghg-verification-bodies-regs | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2025-03-19 | current |
| tw-ghg-offset-project-regs | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2018-12-27 | current |
| tw-electricity-emission-factor-regs | F3 | text 1 | 1 | 2026-11-02 | licence row | regulator_page | 2020-11-11 | current |
| tw-hfc-management-regs | F3 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-02-25 | current |
| tw-annual-report-regs | F1 | text 2 | 2 | 2026-11-02 | licence row | regulator_page | 2025-12-19 | current |
| tw-twse-sustainability-report-rules | F1 | link only | 0 | 2026-11-02 | licence row | regulator_page |  | current |

### US (US)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| us-sec-climate-disclosure-33-11275 | F1 | text 1 | 1 | 2026-11-02 | watcher | gazette_feed | 2024-05-28 | current |
| us-epa-ghgrp-40cfr98 | F3 | text 28 | 28 | 2026-11-02 | watcher | consolidation_site | 2026-10-14 | current |
| us-ca-sb253 | F1 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2025-10-11 | current |
| us-ca-sb261 | F1 | text 2 | 2 | 2026-11-02 | watcher | regulator_page | 2025-10-11 | current |
| us-ca-sb219 | F1 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2025-01-01 | current |

### ZA (South Africa)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| za-climate-change-act-22-2024 | F2 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2025-03-17 | current |
| za-carbon-tax-act-15-2019 | F3 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2019-06-01 | current |
| za-nger-regs-2017 | F3 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2017-04-03 | current |
| za-nger-regs-amendment-2020 | F3 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2020-09-11 | current |
| za-companies-act-71-2008 | F4 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2011-05-01 | current |
| za-companies-regs-2011 | F4 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| za-bbbee-act-53-2003 | F4 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| za-pfa-reg-28 | F6 | text 1 | 1 | 2026-11-02 | watcher | regulator_page | 2011-07-01 | current |
| za-pa-g3-2025-banks | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| za-pa-gn3-2025-insurers | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| za-jse-listings-8-63 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
