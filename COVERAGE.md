# Coverage and currency

Generated on 2026-11-02 by `python3 tools/coverage.py` from `register/register.csv`, `register/<ISO2>/scope.json`, `records/`, `sources.json`, `upkeep/watchers.json`, `upkeep/seen.json` and `upkeep/cadence.json`. Nothing in this file is typed by hand; edit the inputs and rerun the command.

This is a map of what the repository holds and when it was last checked. It is not a claim that the law of any place is covered completely, and it says nothing about whether any company complies with any law. The law families are the `law_family` codes of the register: F1, F2, F3, F4, F5, F6, F7.

The cadence values in `upkeep/cadence.json` are placeholders pending GEL-02-06; no cadence has been measured yet, so `stale` marks a cell against an assumed rhythm, not an observed one.

`upkeep/seen.json` does not exist yet, so no watcher has run; every last checked date below comes from the `checked_on` of a licence row in `sources.json`.

## Counts

| Count | Value | As of | Command |
|---|---|---|---|
| Places in the register | 250 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows | 330 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with an instrument and a law family (shown in the grid) | 222 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with an instrument but no law family (not in the grid) | 52 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with a law family outside F1 to F7 | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Register rows with no instrument (place listed, nothing found) | 56 | 2026-11-02 | `python3 tools/coverage.py` |
| Pilot places with a scope file | 4 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments in scope files | 31 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments with stored text | 24 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments link only | 7 | 2026-11-02 | `python3 tools/coverage.py` |
| Record files (text versions) | 76 | 2026-11-02 | `python3 tools/coverage.py` |
| Watchers in upkeep/watchers.json | 4 | 2026-11-02 | `python3 tools/coverage.py` |
| Watchers with a checked_on in upkeep/seen.json | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Instruments whose last check is older than its cadence (stale) | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Grid cells marked stale | 0 | 2026-11-02 | `python3 tools/coverage.py` |
| Places with no watcher | 247 | 2026-11-02 | `python3 tools/coverage.py` |
| Places with instruments but no stored text (link only) | 191 | 2026-11-02 | `python3 tools/coverage.py` |

## Not covered

Counts as of 2026-11-02, from `python3 tools/coverage.py`.

- Places with no watcher (247): AD, AE, AF, AG, AI, AL, AM, AO, AQ, AR, AS, AT, AU, AW, AX, AZ, BA, BB, BD, BE, BF, BG, BH, BI, BJ, BL, BM, BN, BO, BQ, BR, BS, BT, BV, BW, BY, BZ, CA, CC, CD, CF, CG, CH, CI, CK, CL, CM, CN, CO, CR, CU, CV, CW, CX, CY, CZ, DE, DJ, DK, DM, DO, DZ, EC, EE, EG, EH, ER, ES, ET, FI, FJ, FK, FM, FO, FR, GA, GD, GE, GF, GG, GH, GI, GL, GM, GN, GP, GQ, GR, GS, GT, GU, GW, GY, HK, HM, HN, HR, HT, HU, ID, IE, IL, IM, IN, IO, IQ, IR, IS, IT, JE, JM, JO, JP, KE, KG, KH, KI, KM, KN, KP, KR, KW, KY, KZ, LA, LB, LC, LI, LK, LR, LS, LT, LU, LV, LY, MA, MC, MD, ME, MF, MG, MH, MK, ML, MM, MN, MO, MP, MQ, MR, MS, MT, MU, MV, MW, MX, MY, MZ, NA, NC, NE, NF, NG, NI, NL, NO, NP, NR, NU, NZ, OM, PA, PE, PF, PG, PH, PK, PL, PM, PN, PR, PS, PT, PW, PY, QA, RE, RO, RS, RU, RW, SA, SB, SC, SD, SE, SG, SH, SI, SJ, SK, SL, SM, SN, SO, SR, SS, ST, SV, SX, SY, SZ, TC, TD, TF, TG, TH, TJ, TK, TL, TM, TN, TO, TR, TT, TV, TW, TZ, UA, UG, UM, UY, UZ, VA, VC, VE, VG, VI, VN, VU, WF, WS, YE, YT, ZA, ZM, ZW.
- Families with no instrument anywhere in the register (0): none.
- Families with no stored text in any place (3): F2, F4, F7.
- EU: families with no instrument (4): F2, F3, F4, F7.
- GB: families with no instrument (5): F2, F3, F4, F5, F7.
- IN: families with no instrument (5): F2, F3, F5, F6, F7.
- US: families with no instrument (5): F2, F4, F5, F6, F7.
- Places with instruments but no stored text, link only (191): AD, AE, AG, AL, AM, AO, AR, AT, AU, AZ, BA, BB, BD, BE, BF, BG, BH, BI, BJ, BN, BO, BR, BS, BT, BW, BY, BZ, CA, CD, CF, CG, CH, CI, CL, CN, CO, CR, CU, CV, CY, CZ, DE, DJ, DK, DM, DO, DZ, EC, EE, EG, EH, ER, ES, ET, FI, FJ, FM, FR, GA, GD, GE, GH, GM, GN, GQ, GR, GT, GW, GY, HK, HN, HT, HU, ID, IE, IL, IN, IQ, IR, IS, IT, JM, JO, JP, KE, KG, KH, KI, KM, KN, KP, KR, KW, KZ, LA, LB, LC, LI, LK, LR, LS, LT, LU, LV, LY, MA, MC, MD, ME, MG, MH, MK, ML, MM, MN, MR, MT, MU, MV, MW, MX, MY, MZ, NA, NE, NG, NI, NL, NO, NP, NR, NZ, OM, PA, PE, PG, PH, PK, PL, PS, PW, PY, QA, RO, RS, RU, RW, SA, SB, SC, SD, SE, SG, SI, SK, SL, SN, SO, SR, SS, ST, SV, SY, SZ, TD, TG, TH, TJ, TL, TM, TN, TO, TR, TT, TV, TW, TZ, UA, UG, UY, UZ, VA, VC, VE, VN, VU, WS, YE, ZA, ZM, ZW.
- Places listed with no instrument found (56): AF, AI, AQ, AS, AW, AX, BL, BM, BQ, BV, CC, CK, CM, CW, CX, FK, FO, GF, GG, GI, GL, GP, GS, GU, HM, HR, IM, IO, JE, KY, MF, MO, MP, MQ, MS, NC, NF, NU, PF, PM, PN, PR, PT, RE, SH, SJ, SM, SX, TC, TF, TK, UM, VG, VI, WF, YT.
- Register rows with an instrument but no law family (52), not shown in the grid: AL, AU, BD, BH, BN, CH, CL, CN, CO, CV, DO, EC, EG, ET, GE, GT, HK, HN, ID, IL, IQ, IS, JO, JP, KR, LI, MA, MV, MX, MZ, NG, NO, NZ, OM, PE, RS, RU, SG, TR, TW, TZ, UZ, ZA, ZW.
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
| AU | Australia |  |  |  |  |  |  |  |
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
| BR | Brazil | B · official_text_seen · link only · unchecked |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| BS | Bahamas |  | B · official_text_seen · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| BT | Bhutan |  | B · official_page_seen · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| BV | Bouvet Island |  |  |  |  |  |  |  |
| BW | Botswana | B · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| BY | Belarus |  |  | A · official_page_seen · link only · unchecked |  |  |  |  |
| BZ | Belize |  |  | A · official_page_seen · link only · unchecked |  |  |  |  |
| CA | Canada |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| CC | Cocos Islands |  |  |  |  |  |  |  |
| CD | Congo - Kinshasa |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| CF | Central African Republic |  |  | B · tracker_only · no link · unchecked |  |  |  |  |
| CG | Congo - Brazzaville |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| CH | Switzerland |  |  |  |  |  |  |  |
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
| EU | European Union | A · official_text_seen · text 8 · checked 2026-11-01 · changed 2026-11-10 |  |  |  | A · official_text_seen · text 3 · checked 2026-11-01 · changed 2026-03-18 | A · official_text_seen · text 22 · checked 2026-11-01 · changed 2026-07-02 |  |
| FI | Finland | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| FJ | Fiji |  |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| FK | Falkland Islands |  |  |  |  |  |  |  |
| FM | Micronesia |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| FO | Faroe Islands |  |  |  |  |  |  |  |
| FR | France | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| GA | Gabon |  | B · tracker_only · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| GB | UK | A · official_page_seen/official_text_seen · text 10, link only 1 · checked 2026-11-01 · changed 2022-04-06 |  |  |  |  | A · official_text_seen · link only · checked 2026-11-01 |  |
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
| HK | Hong Kong |  |  |  |  |  |  |  |
| HM | Heard & McDonald Islands |  |  |  |  |  |  |  |
| HN | Honduras |  |  |  |  |  |  |  |
| HR | Croatia |  |  |  |  |  |  |  |
| HT | Haiti |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| HU | Hungary | A · official_text_seen · link only · unchecked |  |  |  | A · official_text_seen · link only · unchecked |  |  |
| ID | Indonesia |  |  |  |  |  |  |  |
| IE | Ireland | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| IL | Israel |  |  |  |  |  |  |  |
| IM | Isle of Man |  |  |  |  |  |  |  |
| IN | India | A · official_text_seen · link only · checked 2026-11-01 |  |  | A · tracker_only · link only · checked 2026-11-01 |  |  |  |
| IO | British Indian Ocean Territory |  |  |  |  |  |  |  |
| IQ | Iraq |  |  |  |  |  |  |  |
| IR | Iran |  | B · tracker_only · link only · unchecked |  |  |  |  |  |
| IS | Iceland |  |  |  |  |  |  |  |
| IT | Italy | A · official_text_seen · link only · unchecked |  |  |  |  |  |  |
| JE | Jersey |  |  |  |  |  |  |  |
| JM | Jamaica |  | B · official_text_seen · link only · unchecked |  |  |  |  |  |
| JO | Jordan |  |  |  |  |  |  |  |
| JP | Japan |  |  |  |  |  |  |  |
| KE | Kenya | A · official_page_seen · link only · unchecked |  | A · official_text_seen · link only · unchecked |  |  |  |  |
| KG | Kyrgyzstan |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| KH | Cambodia | A · tracker_only · no link · unchecked |  |  |  |  |  |  |
| KI | Kiribati |  | B · tracker_only · no link · unchecked |  |  |  |  |  |
| KM | Comoros |  |  |  |  |  |  | B · official_text_seen · link only · unchecked |
| KN | St. Kitts & Nevis |  | B · official_page_seen · link only · unchecked |  |  |  |  |  |
| KP | North Korea |  |  |  |  |  |  | B · official_page_seen · link only · unchecked |
| KR | South Korea |  |  |  |  |  |  |  |
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
| NZ | New Zealand |  |  |  |  |  |  |  |
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
| SG | Singapore |  |  |  |  |  |  |  |
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
| US | US | A · official_text_seen · text 6 · checked 2026-11-01 · changed 2025-10-11 |  | A · official_text_seen · text 27 · checked 2026-11-01 · changed 2026-10-14 |  |  |  |  |
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
| ZA | South Africa |  |  |  |  |  |  |  |
| ZM | Zambia |  | B · official_page_seen · link only · unchecked | A · official_text_seen · link only · unchecked |  |  |  |  |
| ZW | Zimbabwe |  |  |  |  |  |  |  |

## Pilot places by instrument

As of 2026-11-02. `versions` is the number of record files; `checked from` says whether the date came from a watcher or from the licence row.

### EU (European Union)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| eu-csrd-2022-2464 | F1 | text 3 | 3 | 2026-11-01 | licence row | gazette_feed | 2026-03-18 | current |
| eu-esrs-2023-2772 | F1 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2023-12-25 | current |
| eu-taxonomy-2020-852 | F6 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2020-07-12 | current |
| eu-sfdr-2019-2088 | F6 | text 4 | 4 | 2026-11-01 | licence row | gazette_feed | 2026-07-02 | current |
| eu-csddd-2024-1760 | F5 | text 3 | 3 | 2026-11-01 | licence row | gazette_feed | 2026-03-18 | current |
| eu-omnibus-stop-the-clock-2025-794 | F1 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2025-04-17 | current |
| eu-omnibus-content-2026-470 | F1 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2026-03-18 | current |
| eu-esrs-amendment-2025-1416 | F1 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2025-11-13 | current |
| eu-esrs-amendment-2026-1563 | F1 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2026-11-10 | current |
| eu-taxonomy-climate-da-2021-2139 | F6 | text 6 | 6 | 2026-11-01 | licence row | gazette_feed | 2026-01-01 | current |
| eu-taxonomy-disclosures-da-2021-2178 | F6 | text 4 | 4 | 2026-11-01 | licence row | gazette_feed | 2026-01-01 | current |
| eu-taxonomy-complementary-climate-da-2022-1214 | F6 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2022-08-04 | current |
| eu-taxonomy-environmental-da-2023-2486 | F6 | text 2 | 2 | 2026-11-01 | licence row | gazette_feed | 2026-01-01 | current |
| eu-taxonomy-climate-amendment-da-2023-2485 | F6 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2023-12-11 | current |
| eu-taxonomy-simplification-da-2026-73 | F6 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2026-01-28 | current |
| eu-sfdr-rts-2022-1288 | F6 | text 2 | 2 | 2026-11-01 | licence row | gazette_feed | 2023-02-20 | current |

### GB (UK)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| gb-ca2006-s414cb | F1 | text 2 | 2 | 2026-11-01 | licence row | consolidation_site | 2022-04-06 | current |
| gb-ca2006-s414a-414d | F1 | text 7 | 7 | 2026-11-01 | licence row | consolidation_site | 2022-04-06 | current |
| gb-uksi-2022-31 | F1 | text 1 | 1 | 2026-11-01 | licence row | consolidation_site | 2022-04-06 | current |
| gb-fca-esg-sdr | F6 | link only | 0 | 2026-11-01 | licence row | regulator_page |  | current |
| gb-uk-srs-s1-s2 | F1 | link only | 0 | 2026-11-01 | licence row | regulator_page |  | current |

### IN (India)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| in-companies-act-2013-s135 | F4 | link only | 0 | 2026-11-01 | licence row | regulator_page |  | current |
| in-sebi-lodr-reg-34-2-f | F1 | link only | 0 | 2026-11-01 | licence row | regulator_page |  | current |
| in-sebi-brsr-circular-2021 | F1 | link only | 0 | 2026-11-01 | licence row | regulator_page |  | current |
| in-sebi-brsr-core-circular-2023 | F1 | link only | 0 | 2026-11-01 | licence row | regulator_page |  | current |
| in-sebi-brsr-assessment-circular-2025 | F1 | link only | 0 | 2026-11-01 | licence row | regulator_page |  | current |

### US (US)

| Instrument | Family | Form | Versions stored | Last checked | Checked from | Tier | Last change | Stale |
|---|---|---|---|---|---|---|---|---|
| us-sec-climate-disclosure-33-11275 | F1 | text 1 | 1 | 2026-11-01 | licence row | gazette_feed | 2024-05-28 | current |
| us-epa-ghgrp-40cfr98 | F3 | text 27 | 27 | 2026-11-01 | licence row | consolidation_site | 2026-10-14 | current |
| us-ca-sb253 | F1 | text 2 | 2 | 2026-11-01 | licence row | regulator_page | 2025-10-11 | current |
| us-ca-sb261 | F1 | text 2 | 2 | 2026-11-01 | licence row | regulator_page | 2025-10-11 | current |
| us-ca-sb219 | F1 | text 1 | 1 | 2026-11-01 | licence row | regulator_page | 2025-01-01 | current |
