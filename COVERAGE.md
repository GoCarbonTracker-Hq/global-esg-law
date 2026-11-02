# Coverage and currency

Generated on 2026-11-02 by `python3 tools/coverage.py` from `register/register.csv`, `register/<ISO2>/scope.json`, `records/`, `sources.json`, `upkeep/watchers.json`, `upkeep/seen.json` and `upkeep/cadence.json`. Nothing in this file is typed by hand; edit the inputs and rerun the command.

This is a map of what the repository holds and when it was last checked. It is not a claim that the law of any place is covered completely, and it says nothing about whether any company complies with any law. The law families are the `law_family` codes of the register: F1, F2, F3, F4, F5, F6, F7.

## Counts

| Count | Value | As of | Command |
|---|---|---|---|
| Places in the register | 250 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows | 431 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with an instrument and a law family (shown in the grid) | 330 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with an instrument but no law family (not in the grid) | 45 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with a law family outside F1 to F7 | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with no instrument (place listed, nothing found) | 56 | 2026-11-02 | `python3 tools/coverage.py` |
| Pilot places with a scope file | 14 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments in scope files | 133 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments with stored text | 90 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments link only | 43 | 2026-11-02 | `python3 tools/coverage.py` |
| Record files (text versions) | 637 | 2026-11-02 | `python3 tools/coverage.py` |
| Watchers in upkeep/watchers.json | 146 | 2026-11-02 | `python3 tools/coverage.py` |
| Watchers with a checked_on in upkeep/seen.json | 146 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments whose last check is older than its cadence (stale) | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Grid cells marked stale | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Places with no watcher | 236 | 2026-11-02 | `python3 tools/coverage.py` |
| Places with instruments but no stored text (link only) | 183 | 2026-11-02 | `python3 tools/coverage.py` |

## Not covered

Counts as of 2026-11-02, from `python3 tools/coverage.py`.

- Places with no watcher (236): AD, AE, AF, AG, AI, AL, AM, AO, AQ, AR, AS, AT, AW, AX, AZ, BA, BB, BD, BE, BF, BG, BH, BI, BJ, BL, BM, BN, BO, BQ, BS, BT, BV, BW, BY, BZ, CC, CD, CF, CG, CI, CK, CL, CM, CN, CO, CR, CU, CV, CW, CX, CY, CZ, DE, DJ, DK, DM, DO, DZ, EC, EE, EG, EH, ER, ES, ET, FI, FJ, FK, FM, FO, FR, GA, GD, GE, GF, GG, GH, GI, GL, GM, GN, GP, GQ, GR, GS, GT, GU, GW, GY, HM, HN, HR, HT, HU, ID, IE, IL, IM, IO, IQ, IR, IS, IT, JE, JM, JO, KE, KG, KH, KI, KM, KN, KP, KW, KY, KZ, LA, LB, LC, LI, LK, LR, LS, LT, LU, LV, LY, MA, MC, MD, ME, MF, MG, MH, MK, ML, MM, MN, MO, MP, MQ, MR, MS, MT, MU, MV, MW, MX, MY, MZ, NA, NC, NE, NF, NG, NI, NL, NO, NP, NR, NU, OM, PA, PE, PF, PG, PH, PK, PL, PM, PN, PR, PS, PT, PW, PY, QA, RE, RO, RS, RU, RW, SA, SB, SC, SD, SE, SH, SI, SJ, SK, SL, SM, SN, SO, SR, SS, ST, SV, SX, SY, SZ, TC, TD, TF, TG, TH, TJ, TK, TL, TM, TN, TO, TR, TT, TV, TW, TZ, UA, UG, UM, UY, UZ, VA, VC, VE, VG, VI, VN, VU, WF, WS, YE, YT, ZM, ZW.
- Families with no instrument anywhere in the register (0): none.
- Families with no stored text in any place (1): F7.
- AU: families with no instrument (2): F4, F6.
- BR: families with no instrument (1): F4.
- CA: families with no instrument (3): F1, F4, F7.
- CH: families with no instrument (2): F4, F7.
- EU: families with no instrument (4): F2, F3, F4, F7.
- GB: families with no instrument (5): F2, F3, F4, F5, F7.
- HK: families with no instrument (4): F2, F3, F4, F5.
- IN: families with no instrument (5): F2, F3, F5, F6, F7.
- JP: families with no instrument (4): F2, F4, F5, F6.
- KR: families with no instrument (2): F5, F6.
- NZ: families with no instrument (4): F4, F5, F6, F7.
- SG: families with no instrument (3): F2, F4, F5.
- US: families with no instrument (5): F2, F4, F5, F6, F7.
- ZA: families with no instrument (2): F5, F7.
- Places with instruments but no stored text, link only (183): AD, AE, AG, AL, AM, AO, AR, AT, AZ, BA, BB, BD, BE, BF, BG, BH, BI, BJ, BN, BO, BS, BT, BW, BY, BZ, CD, CF, CG, CI, CL, CN, CO, CR, CU, CV, CY, CZ, DE, DJ, DK, DM, DO, DZ, EC, EE, EG, EH, ER, ES, ET, FI, FJ, FM, FR, GA, GD, GE, GH, GM, GN, GQ, GR, GT, GW, GY, HK, HN, HT, HU, ID, IE, IL, IN, IQ, IR, IS, IT, JM, JO, KE, KG, KH, KI, KM, KN, KP, KW, KZ, LA, LB, LC, LI, LK, LR, LS, LT, LU, LV, LY, MA, MC, MD, ME, MG, MH, MK, ML, MM, MN, MR, MT, MU, MV, MW, MX, MY, MZ, NA, NE, NG, NI, NL, NO, NP, NR, OM, PA, PE, PG, PH, PK, PL, PS, PW, PY, QA, RO, RS, RU, RW, SA, SB, SC, SD, SE, SG, SI, SK, SL, SN, SO, SR, SS, ST, SV, SY, SZ, TD, TG, TH, TJ, TL, TM, TN, TO, TR, TT, TV, TW, TZ, UA, UG, UY, UZ, VA, VC, VE, VN, VU, WS, YE, ZM, ZW.
- Places listed with no instrument found (56): AF, AI, AQ, AS, AW, AX, BL, BM, BQ, BV, CC, CK, CM, CW, CX, FK, FO, GF, GG, GI, GL, GP, GS, GU, HM, HR, IM, IO, JE, KY, MF, MO, MP, MQ, MS, NC, NF, NU, PF, PM, PN, PR, PT, RE, SH, SJ, SM, SX, TC, TF, TK, UM, VG, VI, WF, YT.
- Register rows with an instrument but no law family (45), not shown in the grid: AL, BD, BH, BN, CL, CN, CO, CV, DO, EC, EG, ET, GE, GT, HN, ID, IL, IQ, IS, JO, JP, KR, LI, MA, MV, MX, MZ, NG, NO, OM, PE, RS, RU, TR, TW, TZ, UZ, ZW.
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
| AT | Austria | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| AU | Australia | A · official_text_seen · text 3, link only 4 · checked 2026-11-02 · changed 2025-12-05 | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2025-02-20 | A · official_text_seen · text 76 · checked 2026-11-02 · changed 2026-07-01 |  | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2024-11-07 |  | A · official_page_seen · link only · unchecked |
| AW | Aruba |  |  |  |  |  |  |  |
| AX | Åland Islands |  |  |  |  |  |  |  |
| AZ | Azerbaijan |  |  | A · tracker_only · no link · unchecked |  |  | B · official_page_seen · link only · unchecked |  |
| BA | Bosnia |  |  |  |  |  | A/B · official_page_seen/official_text_seen · link only · unchecked |  |
| BB | Barbados |  |  |  |  |  | B · official_text_seen · link only · unchecked |  |
| BD | Bangladesh |  |  |  |  |  |  |  |
| BE | Belgium | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| BF | Burkina Faso |  |  |  |  |  | B · tracker_only · no link · unchecked |  |
| BG | Bulgaria | A · tracker_only · link only · unchecked |  |  |  |  |  |  |
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
| CN | China |  |  |  |  |  |  |  |
| CO | Colombia |  |  |  |  |  |  |  |
| CR | Costa Rica | B · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| CU | Cuba |  |  | A · tracker_only · no link · unchecked |  |  |  |  |
| CV | Cape Verde |  |  |  |  |  |  |  |
| CW | Curaçao |  |  |  |  |  |  |  |
| CX | Christmas Island |  |  |  |  |  |  |  |
| CY | Cyprus | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| CZ | Czechia | A/B · official_page_seen/official_text_seen · link only · unchecked |  |  |  |  |  |  |
| DE | Germany | A · official_text_seen · link only · unchecked |  |  |  | A · official_text_seen · link only · unchecked |  |  |
| DJ | Djibouti |  |  | B · tracker_only · no link · unchecked |  |  |  |  |
| DK | Denmark | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| DM | Dominica |  | B · tracker_only · no link · unchecked |  |  |  |  |  |
| DO | Dominican Republic |  |  |  |  |  |  |  |
| DZ | Algeria | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| EC | Ecuador |  |  |  |  |  |  |  |
| EE | Estonia | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| EG | Egypt |  |  |  |  |  |  |  |
| EH | Western Sahara |  |  |  |  |  |  | B · official_text_seen · no link · unchecked |
| ER | Eritrea |  |  |  |  |  |  | B · official_text_seen · no link · unchecked |
| ES | Spain | B · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| ET | Ethiopia |  |  |  |  |  |  |  |
| EU | European Union | A · official_text_seen · text 10 · checked 2026-11-02 · changed 2026-11-10 |  |  |  | A · official_text_seen · text 3 · checked 2026-11-02 · changed 2026-03-18 | A · official_text_seen · text 22 · checked 2026-11-02 · changed 2026-07-02 |  |
| FI | Finland | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| FJ | Fiji |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| FK | Falkland Islands |  |  |  |  |  |  |  |
| FM | Micronesia |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| FO | Faroe Islands |  |  |  |  |  |  |  |
| FR | France | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
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
| GR | Greece | A · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| GS | South Georgia & South Sandwich Islands |  |  |  |  |  |  |  |
| GT | Guatemala |  |  |  |  |  |  |  |
| GU | Guam |  |  |  |  |  |  |  |
| GW | Guinea-Bissau |  |  |  |  |  | B · official_text_seen/tracker_only · link only, no link 1 · unchecked |  |
| GY | Guyana |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| HK | Hong Kong | A · official_page_seen/official_text_seen · link only · checked 2026-11-02 |  |  |  |  | A · official_page_seen · link only · checked 2026-11-02 | A · official_text_seen · link only · unchecked |
| HM | Heard & McDonald Islands |  |  |  |  |  |  |  |
| HN | Honduras |  |  |  |  |  |  |  |
| HR | Croatia |  |  |  |  |  |  |  |
| HT | Haiti |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| HU | Hungary | A · official_text_seen · link only · unchecked |  |  |  | A · official_text_seen · link only · unchecked |  |  |
| ID | Indonesia |  |  |  |  |  |  |  |
| IE | Ireland | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| IL | Israel |  |  |  |  |  |  |  |
| IM | Isle of Man |  |  |  |  |  |  |  |
| IN | India | A · official_text_seen · link only · checked 2026-11-02 |  |  | A · tracker_only · link only · checked 2026-11-02 |  |  |  |
| IO | British Indian Ocean Territory |  |  |  |  |  |  |  |
| IQ | Iraq |  |  |  |  |  |  |  |
| IR | Iran |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| IS | Iceland |  |  |  |  |  |  |  |
| IT | Italy | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
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
| LT | Lithuania | A · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| LU | Luxembourg | B · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| LV | Latvia | A · official_page_seen · link only · unchecked |  |  |  |  |  |  |
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
| MX | Mexico |  |  |  |  |  |  |  |
| MY | Malaysia | A · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| MZ | Mozambique |  |  |  |  |  |  |  |
| NA | Namibia | B · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| NC | New Caledonia |  |  |  |  |  |  |  |
| NE | Niger |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| NF | Norfolk Island |  |  |  |  |  |  |  |
| NG | Nigeria |  |  |  |  |  |  |  |
| NI | Nicaragua |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| NL | Netherlands | B · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| NO | Norway |  |  |  |  |  |  |  |
| NP | Nepal | B · not_checked · no link · unchecked |  | B · official_page_seen · link only · unchecked |  |  |  |  |
| NR | Nauru |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| NU | Niue |  |  |  |  |  |  |  |
| NZ | New Zealand | A · official_page_seen/official_text_seen · text 4, link only 3 · checked 2026-11-02 · changed 2024-10-27 | A · official_text_seen · text 35 · checked 2026-11-02 · changed 2026-09-04 | A · official_page_seen/official_text_seen · text 25, link only 3 · checked 2026-11-02 · changed 2026-07-09 |  |  |  |  |
| OM | Oman |  |  |  |  |  |  |  |
| PA | Panama | A · official_text_seen · link only · unchecked |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| PE | Peru |  |  |  |  |  |  |  |
| PF | French Polynesia |  |  |  |  |  |  |  |
| PG | Papua New Guinea |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| PH | Philippines | A · official_text_seen · link only · unchecked |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| PK | Pakistan | B · official_page_seen · link only · unchecked |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| PL | Poland | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| PM | St. Pierre & Miquelon |  |  |  |  |  |  |  |
| PN | Pitcairn |  |  |  |  |  |  |  |
| PR | Puerto Rico |  |  |  |  |  |  |  |
| PS | Palestine |  |  |  |  |  | A · official_page_seen · link only · unchecked |  |
| PT | Portugal |  |  |  |  |  |  |  |
| PW | Palau |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| PY | Paraguay |  |  | A · official_text_seen · link only · unchecked |  |  | B · official_page_seen · link only · unchecked |  |
| QA | Qatar | A/B · official_page_seen/official_text_seen · link only · unchecked |  |  |  |  |  |  |
| RE | Réunion |  |  |  |  |  |  |  |
| RO | Romania | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| RS | Serbia |  |  |  |  |  |  |  |
| RU | Russia |  |  |  |  |  |  |  |
| RW | Rwanda | A · official_page_seen · link only · unchecked |  |  |  |  |  |  |
| SA | Saudi Arabia | B · official_text_seen · link only · unchecked |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| SB | Solomon Islands |  | B · official_page_seen · link only · unchecked | B · official_page_seen · link only · unchecked |  |  |  |  |
| SC | Seychelles | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| SD | Sudan |  |  |  |  |  | A · official_text_seen · link only · unchecked |  |
| SE | Sweden | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| SG | Singapore | A · official_page_seen · link only · checked 2026-11-02 |  | A · official_page_seen · link only · checked 2026-11-02 |  |  | A · tracker_only · link only · checked 2026-11-02 | A · tracker_only · link only · unchecked |
| SH | St. Helena |  |  |  |  |  |  |  |
| SI | Slovenia | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| SJ | Svalbard & Jan Mayen |  |  |  |  |  |  |  |
| SK | Slovakia | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
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
| TH | Thailand | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| TJ | Tajikistan |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| TK | Tokelau |  |  |  |  |  |  |  |
| TL | Timor-Leste |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| TM | Turkmenistan |  | B · official_page_seen · link only · unchecked |  |  |  |  | B · official_text_seen · link only · unchecked |
| TN | Tunisia | B · official_page_seen · link only · unchecked |  |  | A · official_text_seen · link only · unchecked |  |  |  |
| TO | Tonga |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| TR | Türkiye |  |  |  |  |  |  |  |
| TT | Trinidad & Tobago |  |  |  |  |  | B · official_text_seen · link only · unchecked |  |
| TV | Tuvalu |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| TW | Taiwan |  |  |  |  |  |  |  |
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

### GB (UK)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| gb-ca2006-s414cb | F1 | text 2 | 2 | 2026-11-02 | watcher | consolidation_site | 2022-04-06 | current |
| gb-ca2006-s414a-414d | F1 | text 7 | 7 | 2026-11-02 | watcher | consolidation_site | 2022-04-06 | current |
| gb-uksi-2022-31 | F1 | text 1 | 1 | 2026-11-02 | watcher | consolidation_site | 2022-04-06 | current |
| gb-fca-esg-sdr | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| gb-uk-srs-s1-s2 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### HK (Hong Kong)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| hk-hkex-esg-code-part-d | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| hk-cap622-sch5 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| hk-hkfrs-s1-s2 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| hk-hkma-spm-gs1 | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| hk-taxonomy-sustainable-finance | F6 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

### IN (India)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| in-companies-act-2013-s135 | F4 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| in-sebi-lodr-reg-34-2-f | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| in-sebi-brsr-circular-2021 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| in-sebi-brsr-core-circular-2023 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |
| in-sebi-brsr-assessment-circular-2025 | F1 | link only | 0 | 2026-11-02 | watcher | regulator_page |  | current |

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
