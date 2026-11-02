# Sources

Licence-reviewed official sources, and for each `pass` source one download request proven on 2026-11-01. Requests were run with `curl`. Sizes are bytes as returned. Rows that are not `pass` (India Code, SEBI, FCA Handbook, UK SRS) have no recipe: their instruments are link only.

## EU

Row `EU-EURLEX-ADOPTED`. The URL written in the licence table answers only with the right headers.

Adopted form, CSRD (CELEX 32022L2464):

```
curl -sS -L -o csrd_adopted.xhtml -H 'Accept: application/xhtml+xml' -H 'Accept-Language: eng' -w '%{http_code} %{size_download} %{content_type}\n' https://publications.europa.eu/resource/celex/32022L2464
```

Returned `200 625257 application/xhtml+xml;charset=UTF-8`, the full act text. The same headers also returned 200 for the other EU acts in `register/EU/scope.json`. Metadata (including the entry-into-force date) comes with `-H 'Accept: application/xml;notice=object'`, which returned 200, 1084774 bytes, `application/xml;notice=object`. Not working: `Accept: application/xml` or `text/html` (404), a `.ENG.xhtml` suffix (a 3151-byte RDF stub), and the `eur-lex.europa.eu` HTML pages (202, empty, bot challenge).

Row `EU-EURLEX-CONSOLIDATED`. Consolidated form, CSRD as of 2026-03-18 (the consolidation id starts with 0, and the date comes from the notice):

```
curl -sS -L -o csrd_cons_20260318.xhtml -H 'Accept: application/xhtml+xml' -H 'Accept-Language: eng' -w '%{http_code} %{size_download} %{content_type}\n' https://publications.europa.eu/resource/celex/02022L2464-20260318
```

Returned `200 295274 application/xhtml+xml;charset=UTF-8`. Without the `Accept` header the same URL returns a 25889-byte RDF stub.

Stored by GEL-01-03 (fetched 2026-11-01 with the two recipes above, `Accept: application/xhtml+xml`, `Accept-Language: eng`; each record carries `fetched_url` and `fetched_sha256`):

- `eu-csrd-2022-2464`: adopted text, in force 2023-01-05; consolidated texts 2025-04-17 (header `02022L2464 — EN — 17.04.2025 — 001.001`) and 2026-03-18 (header `18.03.2026 — 002.001`). Both consolidated files keep the EUR-Lex banner saying they are a documentation tool with no legal effect; the authentic text is the Official Journal act.
- `eu-esrs-2023-2772`: adopted text, in force 2023-12-25; consolidated texts `02023R2772-20231222` (header `22.12.2023 — 000.002`, stored by GEL-03-11 as `in_force` 2023-12-25 because the act entered into force then and the id date is the OJ publication day; the text differs from the adopted record, so it is kept: it has the EUR-Lex banner, no preamble, and the corrigenda applied) and `02023R2772-20250101` (header `01.01.2025 — 001.001`; its amendment table lists M1, Delegated Regulation (EU) 2025/1416, published 10.11.2025, so this text includes an amendment that entered into force 2025-11-13 and the id date 2025-01-01 is the date from which the amended text applies, not the date it took effect; stored with `in_force` 2025-01-01 as the Cellar id gives it). Both fetched 2026-11-02 with the recipe above, 200. Both keep the documentation-tool banner (no legal effect). Earlier guesses `02023R2772-20251113`, 20231225, 20231226, 20240101, 20251114, 20251231 and 20260101 returned 404 with the same headers; those 404s are not evidence that no consolidation exists. The Cellar watcher `eu-esrs-cellar-consolidations` lists exactly the two ids above; a later consolidation date is possible.
- `02022L2464-20230105` (CSRD consolidated at its own entry into force) returned 404.
- Not stored here: Taxonomy, SFDR, CSDDD, the two Omnibus directives and the two ESRS amendment acts (GEL-01-10, 11, 13); their scope entries are unchanged.

### GEL-01-11

Stored (fetched 2026-11-01 with the two EU recipes above, `Accept: application/xhtml+xml`, `Accept-Language: eng`):

- `eu-csddd-2024-1760`: adopted text (`32024L1760`), in force 2024-07-25; consolidated texts 2025-04-17 (`02024L1760-20250417`, header `17.04.2025 — 001.002`) and 2026-03-18 (`02024L1760-20260318`, header `18.03.2026 — 002.001`). Both consolidated files keep the EUR-Lex documentation-tool banner (no legal effect).
- `02024L1760-20240725` and `02024L1760-20260319` returned 404. The list of published consolidated dates could not be opened (bot challenge), so a consolidation at another date is possible.
- The two Omnibus acts are stored by GEL-01-13; their scope entries are unchanged.


### GEL-01-10 (EU Taxonomy and SFDR, fetched 2026-11-01)

Fetched with the two EU recipes above (`Accept: application/xhtml+xml`, `Accept-Language: eng`). Consolidated dates were listed with a SPARQL query against `https://publications.europa.eu/webapi/rdf/sparql` (work ids `0<celex>-<date>`), then each id was fetched and its header (`<celex> — EN — <date>`) checked against the id. In-force dates of the adopted acts are the OJ publication date plus 20 days (final article), matching the Cellar notice.

| Instrument | Adopted (in force) | Consolidated (date in id) |
|---|---|---|
| Taxonomy Regulation 2020/852 | 2020-07-12 | none found |
| SFDR 2019/2088 | 2019-12-29 | 2020-07-12, 2024-01-09, 2026-07-02 |
| Climate DA 2021/2139 | 2021-12-29 | 2023-01-01, 2024-01-01, 2025-01-01, 2025-01-08, 2026-01-01 |
| Disclosures DA 2021/2178 | 2021-12-30 | 2023-01-01, 2024-01-01, 2026-01-01 |
| Complementary Climate DA 2022/1214 | 2022-08-04 | none found |
| Environmental DA 2023/2486 | 2023-12-11 | 2026-01-01 |
| Amendment DA 2023/2485 | 2023-12-11 | none found |
| Simplification DA 2026/73 | 2026-01-28 | none found |
| SFDR RTS 2022/1288 | 2022-08-14 | 2023-02-20 |

Not found (HTTP 404 with the recipe headers, though the SPARQL list shows the id): `02020R0852-20200622`, `02021R2178-20211210`, `02023R2486-20231121`. `02020R0852-20200712`, `-20220101`, `-20230101`, `02021R2178-20211230`, `-20220101` and `02023R2486-20231211` also returned 404. The consolidated `02022R1288-20220725` (header `25.07.2022 — 000.002`) was fetched and then not stored: it is dated the OJ publication day, before the act entered into force on 2022-08-14, so it is not a version that took effect, and it duplicates the adopted text. Delegated Regulation (EU) 2024/3215 (corrects certain language versions of 2021/2139) and 2023/363 (amends 2022/1288) have no records of their own; 2023/363 shows in the consolidated 2022/1288 of 2023-02-20.

## India

All five instruments are link only, no records. Rows `IN-INDIACODE-ADOPTED` and `IN-SEBI-ADOPTED` are `permission requested` (no licence grant), so no recipe is proven. Permission requests were drafted on 2026-11-01 and not sent. Official pages were opened on 2026-11-01 only to verify dates.

| Instrument | Official URL | Why link only |
|---|---|---|
| Companies Act 2013 s.135 | https://www.indiacode.nic.in/show-data?actid=AC_CEN_22_29_00008_201318_1517807327856&orderno=139 | India Code row, permission requested. Page timed out and mca.gov.in answered 403 on 2026-11-01, so `in_force` stays null. |
| SEBI LODR reg 34(2)(f) | https://www.sebi.gov.in/sebi_data/attachdocs/jun-2026/1780915347745.pdf | SEBI row, permission requested. |
| SEBI BRSR circular 2021 | https://www.sebi.gov.in/legal/circulars/may-2021/business-responsibility-and-sustainability-reporting-by-listed-entities_50096.html | SEBI row, permission requested. Page and PDF opened (200); no commencement sentence, `in_force` stays null. |
| SEBI BRSR Core circular 2023 | https://www.sebi.gov.in/legal/circulars/jul-2023/brsr-core-framework-for-assurance-and-esg-disclosures-for-value-chain_73854.html | SEBI row, permission requested. Page and PDF opened (200); no commencement sentence, `in_force` stays null. |
| SEBI circular 2025/42 | https://www.sebi.gov.in/sebi_data/attachdocs/mar-2025/1743159419610.pdf | SEBI row, permission requested. |

## UK

Row `UK-LEGISLATION-ADOPTED`, Companies Act 2006 as enacted:

```
curl -sS -L -o enacted.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.legislation.gov.uk/ukpga/2006/46/enacted/data.xml
```

Returned `200 5239443 application/xml;charset=utf-8`. Secondary legislation as made, SI 2022/31, `https://www.legislation.gov.uk/uksi/2022/31/made/data.xml`: `200 35405 application/xml;charset=utf-8`.

Row `UK-LEGISLATION-CONSOLIDATED`, Companies Act 2006 as revised:

```
curl -sS -L -o revised.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.legislation.gov.uk/ukpga/2006/46/data.xml
```

Returned `200 15193495 application/xml;charset=utf-8`. A single section works too: `.../ukpga/2006/46/section/414CB/data.xml` returned `200 86613 application/xml;charset=utf-8`.

### Stored (GEL-01-05, fetched 2026-11-01)

Records are under `records/GB/`. `text` is the plain text of the fetched `data.xml`: tags stripped, block elements as line breaks, the file's own commentary included, explanatory note and metadata left out. Each record carries the exact request URL and the sha256 of the file as returned.

| Instrument | Row | Versions stored (`in_force`) |
|---|---|---|
| `gb-ca2006-s414cb` | `UK-LEGISLATION-CONSOLIDATED` | 2016-12-26, 2022-04-06 |
| `gb-ca2006-s414a-414d` (Part 15 Chapter 4A) | `UK-LEGISLATION-CONSOLIDATED` | 2013-10-01, 2015-04-06, 2016-12-26, 2018-01-01, 2019-01-01, 2020-12-31, 2022-04-06 |
| `gb-uksi-2022-31` | `UK-LEGISLATION-ADOPTED` | 2022-04-06 (as made) |

Version dates are the `dct:hasVersion` links in the file's own metadata (section: 2016-12-26, 2022-04-06; chapter: the seven above). The point-in-time URL for a version's own date does not return that version: `.../section/414CB/2016-12-26/data.xml` and `.../chapter/4A/2013-10-01/data.xml` return 404, and `.../section/414CB/2022-04-06/data.xml` returns the pre-amendment text. So each record is fetched with a date inside the version's window (section 2017-06-01 and 2022-06-01; chapter 2014-06-01, 2016-06-01, 2017-06-01, 2018-06-01, 2019-06-01, 2021-06-01, 2022-06-01) and `fetched_url` says which. The 2016 section text was checked against the inserted text in SI 2016/1245 (made).

Chapter 4A `in_force` 2013-10-01 comes from SI 2013/1970 reg 1(2), opened on the day.

### Link only

`gb-fca-esg-sdr` (row `UK-FCA-HANDBOOK`, `permission requested`: Handbook terms unread) and `gb-uk-srs-s1-s2` (row `UK-SRS-ADOPTED`, `permission requested`: IFRS Foundation copyright). The gov.uk UK SRS page (opened 2026-11-01, last updated 25 February 2026) states no effective date, so its `in_force` stays null.

## US

Row `US-ECFR-ADOPTED`, 40 CFR Part 98. The 406 seen earlier is not about `Accept`: the body says "This endpoint requires response compression". Sending `Accept-Encoding` fixes it, which `--compressed` does:

```
curl -sS -L --compressed -o part98.xml -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.ecfr.gov/api/versioner/v1/full/2026-10-01/title-40.xml?part=98'
```

Returned `200 521308 application/xml; charset=utf-8`. Without `--compressed`: 406, 171 bytes, text/plain.

Row `US-FEDREG-ADOPTED`, SEC climate rule (document 2024-05137):

```
curl -sS -L -o 2024-05137.json -w '%{http_code} %{size_download} %{content_type}\n' https://www.federalregister.gov/api/v1/documents/2024-05137.json
```

Returned `200 16622 application/json; charset=utf-8`. The JSON links the full text: `full_text_xml_url` returned `200 3377323 text/xml`. The 2009 EPA rule has document number `E9-23315`; `2009-23315` gives 404.

Stored by GEL-01-06 (2026-11-01):

- `us-epa-ghgrp-40cfr98` (row `US-ECFR-ADOPTED`, kind `consolidated`): all 28 version dates the versioner lists for part 98 (`/versions/title-40.json?part=98`, field `date`; 1131 rows, `meta.total_pages` 2, so the page-2 date 2019-09-19 needs `&page=2`; GEL-01-06 read page 1 only and stored 27, GEL-03-11 added 2019-09-19), 2017-01-01 to 2026-10-14, one record each, fetched with the recipe above at each date. The 2009 original is not on the versioner, so the scope entry keeps `in_force` 2009-12-29 and the earliest stored version is 2017-01-01. Text comes from the returned XML with tags stripped and block elements as line breaks; table cells are tab-separated.
- `us-sec-climate-disclosure-33-11275` (row `US-FEDREG-ADOPTED`, kind `adopted`, `in_force` 2024-05-28): text from `full_text_xml_url` of the JSON above. Legal status (stayed) is in the record `message` and the scope `status_note`, read from Federal Register documents 2024-07648 and 2026-11091 because sec.gov returns 403 to scripts and the Eighth Circuit docket was not opened.
- `us-ca-sb253`, `us-ca-sb261`: not touched here (GEL-01-12).

Row `US-CA-LEGINFO-ADOPTED`. The bill pages on `leginfo.legislature.ca.gov` return 403 to curl, so use the bulk downloads. SB 253 and SB 261 (2023-24 session) are in `pubinfo_2023.zip`; the 2025-26 session is `pubinfo_2025.zip`:

```
curl -sSI -L https://downloads.leginfo.legislature.ca.gov/pubinfo_2025.zip
```

Returned `200`, content length 1292052065 (about 1.2 GB), `application/zip`, `accept-ranges: bytes`. A range request `-r 0-3` returned 206 with 4 bytes. The full zip was not downloaded.

### GEL-01-12 (California, fetched 2026-11-01)

Row `US-CA-LEGINFO-ADOPTED`, kind `consolidated`. Fetched with `curl -L -O https://downloads.leginfo.legislature.ca.gov/pubinfo_2023.zip` (1261848876 bytes, archive dated 2024-11-25) into `/tmp`, never the repo. Layout: tab-separated `.dat` tables with backtick-quoted text fields, plus one `.lob` file per long text, named in the row. `LAW_SECTION_TBL.dat` holds codified sections (columns: id, law code, section, year, chapter, section of act, effective date, ..., history, lob file); `BILL_TBL.dat` and `BILL_VERSION_TBL.dat` hold bills and their versions. The `.lob` files are CAML XML; `text` is the element text with `<p>` as line breaks and `EnSpace` spans as one space. `fetched_sha256` is the hash of the zip as downloaded.

- `us-ca-sb253` (H&S 38532, row `HSC38532.20233822`, lob 123565) and `us-ca-sb261` (H&S 38533, row `HSC38533.20233832`, lob 123566): one record each, `in_force` 2024-01-01.
- `us-ca-sb219` (Stats. 2024, ch. 766, not ch. 1038 as the story says): chaptered act text from `BILL_VERSION_TBL_20214.lob`, `in_force` 2025-01-01 (no urgency clause). It is act text, not a codified section.
- The 2023 zip's section text predates SB 219's amendments (archive dated 2024-11-25). `pubinfo_2025.zip` (1292052065 bytes, dated 2026-10-26) was still downloading and was checked in GEL-01-08 below.
- CARB pages opened 2026-11-01 for `status_note`: the program page, the SB 261 Enforcement Advisory (2025-12-01) and the SB 253 Enforcement Notice (2024-12-05). Their URLs are in `register/US/scope.json`.

### GEL-01-08 (California 2025 check, 2026-11-01)

Row `US-CA-LEGINFO-ADOPTED`, kind `consolidated`. `pubinfo_2025.zip` (1292052065 bytes, archive dated 2026-10-26, sha256 `ec562b927cd7714905450feca5a8f0d887db4f4f9250192663481c6d7149a431`) was read from `/private/tmp/gel1201`, not downloaded again; only `LAW_SECTION_TBL.dat` and two lob files were unzipped, into `/tmp`. Same CAML-to-text recipe as GEL-01-12.

- `us-ca-sb253`: `LAW_SECTION_TBL.dat` row `HSC38532.20256091`, lob 50995, history line: "Amended by Stats. 2025, Ch. 609, Sec. 1.   (AB 154)   Effective October 11, 2025." New record `2025-10-11-consolidated.json`.
- `us-ca-sb261`: row `HSC38533.20256092`, lob 50996, history line: "Amended by Stats. 2025, Ch. 609, Sec. 2.   (AB 154)   Effective October 11, 2025." New record `2025-10-11-consolidated.json`.
- **Open item for Varun:** the sections as amended by SB 219 (effective 2025-01-01) are in neither zip. `pubinfo_2023.zip` (dated 2024-11-25) predates the amendment and `pubinfo_2025.zip` holds only the current AB 154 text. Only the SB 219 act text is stored (`us-ca-sb219`). A lookup for 38532 or 38533 on any date from 2025-01-01 to 2025-10-10 therefore returns the 2024-01-01 text. Whether to reconstruct the 2025-01-01 section text from the act is Varun's call.

### GEL-01-13 (EU Omnibus amendments, fetched 2026-11-01)

Four adopted-form records, row `EU-EURLEX-ADOPTED`, fetched with the CSRD adopted recipe above (`Accept: application/xhtml+xml`, `Accept-Language: eng`; all four returned 200). `in_force` is the Cellar notice field `RESOURCE_LEGAL_DATE_ENTRY-INTO-FORCE`, fetched with `Accept: application/xml;notice=object`, and matches the article quoted in each scope entry.

| Instrument | CELEX | `in_force` |
|---|---|---|
| `eu-omnibus-stop-the-clock-2025-794` | 32025L0794 | 2025-04-17 |
| `eu-omnibus-content-2026-470` | 32026L0470 | 2026-03-18 |
| `eu-esrs-amendment-2025-1416` | 32025R1416 | 2025-11-13 |
| `eu-esrs-amendment-2026-1563` | 32026R1563 | 2026-11-10 |

2026/1563 is published (OJ L, 21.9.2026) but not in force on 2026-11-01; its record `message` says so. `text` is the plain text of the returned XHTML, tags stripped, block elements as blank-line-separated lines. No consolidated version is stored: these are amending acts, and consolidation applies to the acts they amend. `02023R2772-20251113` and `02023R2772-20261110` (ESRS) return 404.

Further amending acts: a SPARQL query on `https://publications.europa.eu/webapi/rdf/sparql` for acts dated 2026-09-01 or later that amend 2022/2464, 2023/2772, 2024/1760 or 2013/34 returned no rows. The same query without the date bound returned these four, so it works. No new scope entry was added.

## Singapore

GEL-03-04, run 2026-11-02. No Singapore row is `pass`, so no fetch recipe is proven and no record is stored. All six scope entries are link only. The five rows (`SG-SSO-ADOPTED`, `SG-SSO-CONSOLIDATED`, `SG-SGX-CONSOLIDATED`, `SG-ACRA-ADOPTED`, `SG-MAS-ADOPTED`) are `permission requested`. No permission request was sent.

Blocked from the cloud address (read from the laptop):

- `https://sso.agc.gov.sg/Terms-of-Use` and `https://sso.agc.gov.sg/Acts-Supp/23-2018/Published/20181015?DocDate=20181015`: HTTP 403 "Request blocked" from CloudFront, to `curl -A 'Mozilla/5.0'` and to WebFetch. The Internet Archive copy reset the connection. The terms, the Acts and the in-force dates on SSO are unread.
- `https://www.mas.gov.sg/terms-of-use` and the MAS guideline pages: HTTP 200 with a maintenance page ("Sorry, this service is currently unavailable") to `curl -A 'Mozilla/5.0'`.
- `https://www.sgx.com/terms-use`: HTTP 200, 15329 bytes, a JavaScript browser-check shell with no terms text.

Opened and readable (plain `curl`, HTTP 200): `https://rulebook.sgx.com/rulebook/mainboard-rules` (2093399 bytes, text/html; holds rr 711A, 711B and Practice Note 7.6 with their amendment dates), `https://www.acra.gov.sg/terms-of-use/`, `https://www.acra.gov.sg/regulations/sustainability-reporting/requirements-timeline/`, `https://www.nea.gov.sg/our-services/climate-change-energy-efficiency/climate-change/carbon-tax`.

| Instrument | Why link only |
|---|---|
| `sg-sgx-lr-711a-711b`, `sg-sgx-pn-7-6` | `SG-SGX-CONSOLIDATED`: footer "© Singapore Exchange Limited. All Rights Reserved."; terms page unreadable. |
| `sg-cpa-2018`, `sg-cpa-mrv-regs-2018` | `SG-SSO-CONSOLIDATED`: SSO terms and pages blocked from the cloud address. |
| `sg-mas-erm-banks`, `-insurers`, `-asset-managers` | `SG-MAS-ADOPTED`: terms and pages show a maintenance page. |

ACRA (`SG-ACRA-ADOPTED`): terms say contents may not be reproduced "without the prior written permission of ACRA". The timeline page is guidance, and no enacted regulation for large non-listed companies was found, so ACRA has no scope entry. That page gives FY2030 for them, not FY2027. Not entered: the Singapore-Asia Taxonomy (no official page found or opened), the Energy Conservation Act 2012 and Resource Sustainability Act 2019 (F7, register rows only, URLs unopened).

## Japan

Fetched 2026-11-02 (GEL-03-03). Two rows are `pass`, `JP-EGOV-CONSOLIDATED` and `JP-FSA-ADOPTED`; `JP-SSBJ-ADOPTED` and `JP-JPX-ADOPTED` are `permission requested`. Nothing is stored from the FSA row.

Row `JP-EGOV-CONSOLIDATED`, e-Gov Law Search API v2. The law page `https://laws.e-gov.go.jp/law/<law_id>` is a script shell, so every request uses the API. List the point-in-time versions of a law (here the Act on Promotion of Global Warming Countermeasures, law ID `410AC0000000117`):

```
curl -sS -L -o gw_revs.json -w '%{http_code} %{size_download} %{content_type}\n' https://laws.e-gov.go.jp/api/2/law_revisions/410AC0000000117
```

Returned `200 11234 application/json`. Each entry has `law_revision_id`, `amendment_enforcement_date`, `amendment_promulgate_date`, `current_revision_status` (`CurrentEnforced`, `PreviousEnforced`, `UnEnforced`) and `amendment_scheduled_enforcement_date` (set when the date is an outer limit or tied to another act, empty when fixed). Fetch one version as the law XML file:

```
curl -sS -L -o gw_20260101.xml -w '%{http_code} %{size_download} %{content_type}\n' https://laws.e-gov.go.jp/api/2/law_file/xml/410AC0000000117_20260101_506AC0000000056
```

Returned `200 360533 application/octet-stream` (the body is XML). Its sha256 `68590c43cbc18f327bc63cfb7d84b4b065463464f6ffd9903744d47a44534fca` equals `fetched_sha256` in `records/JP/jp-gw-act/2026-01-01-consolidated.json`. Law search by title: `https://laws.e-gov.go.jp/api/2/laws?law_title=<title>` returned 200, `application/json`. A revision id guessed wrong returns 404 with a JSON error body (120 bytes). The old v1 host `elaws.e-gov.go.jp/api/1/` also answers; it was not used.

Text recipe: `text` is the plain text of the returned XML. Block elements (articles, titles, captions, paragraphs, items, tables) start a new line; `Sentence`, `Column`, `Line`, `Ruby`, `Sup` and `Sub` stay inline; the reading inside `Rt` is dropped; table cells are tab-separated; each line is trimmed and empty lines are dropped. Nothing is reworded. Because the XML splits `ArticleTitle`, `ParagraphNum` and the sentence into separate elements, an article number sits on its own line above its text. Figures (`Fig`) are PDF attachments and carry no text, so form PDFs in the Cabinet Office Order are not in `text`.

Rules used for the version set:

- All versions e-Gov lists for the instrument are stored, oldest to newest. e-Gov starts in 2016 or later: no older text, and no as-promulgated (adopted) form, is served, so every record has `kind` `consolidated`.
- Several revisions can share one enforcement date (different amending acts). One record per date: the revision of the amending act promulgated last. Dates where this applied: FIEA 2016-04-01, 2025-04-01; Cabinet Office Order 2019-07-01, 2024-04-01, 2025-04-01; reporting order 2023-04-01.
- A revision not yet in force is stored when its date is fixed (`amendment_scheduled_enforcement_date` empty), with the status in `message`: FIEA 2026-11-30, 2027-04-01, 2027-10-01. Revisions with a scheduled (outer-limit or linked) date are not stored: FIEA 2027-03-31, 2027-07-22, 2028-01-01, 2028-06-13 (two revisions).

| Instrument | Versions stored | First, last `in_force` |
|---|---|---|
| `jp-fiea` | 53 | 2016-04-01, 2027-10-01 |
| `jp-cao-disclosure-order` | 37 | 2017-04-01, 2026-10-05 |
| `jp-gw-act` | 12 | 2016-05-27, 2026-01-01 |
| `jp-gw-reporting-order` | 12 | 2017-04-01, 2026-07-01 |
| `jp-gx-act` | 7 | 2023-05-19, 2026-04-01 |
| `jp-gx-order` | 2 | 2024-02-16, 2026-04-01 |
| `jp-gx-regulation` | 2 | 2024-02-16, 2026-04-01 |

`jp-fiea` is about 2.4 MB per record; the seven instruments add about 153 MB under `records/JP`.

Row `JP-FSA-ADOPTED`, FSA Roadmap on Sustainability Disclosure and Assurance:

```
curl -sS -L -o roadmap.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.fsa.go.jp/en/news/2026/20260409/02.pdf
```

Returned `200 101942 application/pdf`. No record is stored: the roadmap is a policy paper, and plain-text extraction of a PDF has no stdlib path in this repository.

Terms pages, opened 2026-11-02: e-Gov `https://laws.e-gov.go.jp/terms/` (text read from the asset `/assets/terms-a5a45db6.js`, 200, 6343 bytes), PDL1.0 `https://www.digital.go.jp/resources/open_data/public_data_license_v1.0` (200), FSA `https://www.fsa.go.jp/rules/index.html` (200), SSBJ footer `https://www.ssb-j.jp/en/` (200), JPX `https://www.jpx.co.jp/english/term-of-use/index.html` (200).

### Link only

| Instrument | Why |
|---|---|
| `jp-ssbj-standards` | Row `JP-SSBJ-ADOPTED`, `permission requested`: "The use of any such material on any other website or networked computer environment is strictly prohibited unless prior written permission is granted." The host in the brief, `www.ssbj-j.jp`, does not resolve from the cloud address (`curl: (56) CONNECT tunnel failed, response 502`, also for `ssbj-j.jp` over http and https); the site is `www.ssb-j.jp`, which answered 200. Blocked from the cloud address: `https://www.ssbj-j.jp/`, for the orchestrator to read from the laptop. |
| `jp-tse-cg-code` | Row `JP-JPX-ADOPTED`, `permission requested`: JPX bars secondary use for commercial purposes without prior permission and modification without prior permission. |

The F7 Act on Rationalizing Energy Use and Shifting to Non-fossil Energy (e-Gov law ID `354AC0000000049`) has a `register.csv` row only. Japanese Law Translation pages are named in the `notes` of the scope entries that have one; no translation is stored. Not reached: the Cabinet Order enforcing the Global Warming Act (`411CO0000000143`), the aggregation order (`418M60001400004`), the form PDFs attached to the Cabinet Office Order on Disclosure of Corporate Affairs, and the Official Gazette (Kanpo) for as-promulgated texts and commencement orders.
