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
- `eu-esrs-2023-2772`: adopted text, in force 2023-12-25; consolidated texts `02023R2772-20231222` (header `22.12.2023 — 000.002`, stored by GEL-03-11 as `in_force` 2023-12-25 because the act entered into force then and the id date is the OJ publication day; the text differs from the adopted record, so it is kept: it has the EUR-Lex banner, no preamble, and the corrigenda applied) and `02023R2772-20250101` (header `01.01.2025 — 001.001`; its amendment table lists M1, Delegated Regulation (EU) 2025/1416, published 10.11.2025, so this text includes an amendment that entered into force 2025-11-13 and the id date 2025-01-01 is the date from which the amended text applies, not the date it took effect; first stored with `in_force` 2025-01-01 as the Cellar id gives it; on 2026-11-02 Varun decided the record takes the date the amendment entered into force, so it is now `2025-11-13-consolidated-en.json` with `in_force` 2025-11-13 and its `message` names the Cellar id `02023R2772-20250101`). Both fetched 2026-11-02 with the recipe above, 200. Both keep the documentation-tool banner (no legal effect). Earlier guesses `02023R2772-20251113`, 20231225, 20231226, 20240101, 20251114, 20251231 and 20260101 returned 404 with the same headers; those 404s are not evidence that no consolidation exists. The Cellar watcher `eu-esrs-cellar-consolidations` lists exactly the two ids above; a later consolidation date is possible.
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

## South Korea

Row `KR-LAWGOKR-CONSOLIDATED` (Korea Law Information Center, law.go.kr; verdict `pass` on Copyright Act art. 7). The public Open API (`/DRF/lawService.do`) needs a registered key and server IP, so it is not used; the web page's own body request is. The site resets about one connection in three; every request below was retried until it answered. Run on 2026-11-02.

Version list for one instrument (Framework Act on Carbon Neutrality, `lsId` 014152; the page lists every history version, including ones not yet in force, as `lsViewLsHst2('<lsiSeq>', '<promulgation date>', '<act no.>', '<effective date>', '<current Y/N>', ...)`):

```
curl -sS -L -o hist.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.law.go.kr/LSW/lsHstListR.do?lsId=014152&lsiSeq=285267'
```

Returned `200 14899 text/html;charset=UTF-8`.

One version, the Framework Act as in force on 2022-03-25 (`lsiSeq` 235581, effective date `efYd` 20220325):

```
curl -sS -L -o act_20220325.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.law.go.kr/LSW/lsInfoR.do?lsiSeq=235581&efYd=20220325&efYn=Y&chrClsCd=010202&netPrivateYn=N'
```

Returned `200 211537 text/html;charset=UTF-8`, sha256 `6a0a061197235f549bd4552da4f4191a9c01bf78a7a30a3eec4c51780c866353` (the same value as `fetched_sha256` in `records/KR/kr-carbon-neutrality-act/2022-03-25-consolidated.json`; a second fetch of the Decree on 2025-02-07 gave the same hash twice). All four parameters after `lsiSeq` are needed: without `efYd` and `efYn` the server answers an HTML page that only shows the alert "기본정보 조회 실패". `lsiSeq` and `lsId` come from the page `https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=<n>`, whose hidden inputs hold them (a browser load of `https://www.law.go.kr/법령/<name>` redirects to it).

Text recipe: take the HTML after `id="conScroll"`, keep the contents of every `<div class="pgroup">` except the `<ul class="lawico01">` icon lists, start a new line at each `<p>`, `<br>`, `<tr>` and `<div>` boundary, collapse runs of whitespace inside a line, and put the `<h2>` title and the `<div class="ct_sub">` line (`[시행 ...] [법률 제...호, ..., 제정/일부개정]`) first. Nothing is reworded. Amendment marks such as `<개정 2022. 3. 25.>` and the addenda (`부칙`) are law text and stay. Annex tables (`별표`, `서식`) are served as HWP/PDF downloads, not in the page, so they are not in `text`. The contact lines of the responsible ministry above the articles are left out.

Rules applied when storing:

- One record per distinct effective date in the version list. Where the list names two promulgations for the same effective date (Framework Act 2025-10-23 and 2026-05-12, its Decree 2022-09-25), the later promulgation (higher promulgation date, then higher `lsiSeq`) is stored; whether it carries the earlier amendment's changes was not compared.
- The first version of each instrument is the enactment text and is stored with kind `consolidated`, because law.go.kr serves it in the same format as every later version. No `adopted` row exists: the Official Gazette (관보) text was not fetched.
- The same promulgation can appear under several effective dates (staggered commencement). law.go.kr serves a page for each, and each is stored. The Framework Act list also shows 2026-11-12 (Act 21122) after 2026-10-08 (Act 21527); these are the publisher's version pages as served, not a merged timeline. Versions dated after 2026-11-02 are published amendments not yet in force, stored as ordinary records dated their in-force date.
- law.go.kr states that its copy has no legal effect and the Official Gazette governs.

Stored by GEL-03-09 (fetched 2026-11-02 with the two requests above, scripted over every row of each version list):

| Instrument | Versions stored | First in force |
|---|---|---|
| `kr-carbon-neutrality-act` (`lsId` 014152) | 20 | 2022-03-25 |
| `kr-carbon-neutrality-act-decree` (`lsId` 014255) | 24 | 2022-03-25 |
| `kr-ets-act` (`lsId` 011612) | 15 | 2012-11-15 |
| `kr-ets-act-decree` (`lsId` 011712) | 23 | 2012-11-15 |
| `kr-sapa` (`lsId` 013993) | 1 | 2022-01-27 |
| `kr-sapa-decree` (`lsId` 014159) | 5 | 2022-01-27 |

Link only:

| Instrument | Why |
|---|---|
| `kr-kssb-ksds` | Row `KR-KASB-ADOPTED`, permission requested: the KASB site's only rights statement is "Copyright ©KAI all rights reserved". Not enacted law. |
| `kr-krx-governance-report` | Row `KR-KRX-ADOPTED`, permission requested. https://www.krx.co.kr/main/main.jsp redirected to a notice, "KRX 서비스 이용이 일시 제한되었습니다" (the service is restricted for abnormal traffic): blocked from the cloud address. KRX terms and the rule text at https://law.krx.co.kr/ were not read; the orchestrator should open both from the laptop. |

Not in scope and why: the Korean Green Taxonomy (K-Taxonomy) is a Ministry of Environment guideline, not an enacted instrument, and no official page for it was opened; the FSC roadmap (fsc.go.kr/eng/pr010101/87276) is a plan and keeps its register row; row `KR-FSC-ADOPTED` is permission requested (profit-making use needs prior consent). The Act on the Promotion of Saving and Recycling of Resources (F7) has a register row only. The Ministry of Environment notices on the emissions trading and target management schemes (administrative rules on law.go.kr, which Copyright Act art. 7 item 2 also covers) were not fetched; their page type uses a different request, which was not tried. English translations by KLRI (https://elaw.klri.re.kr/eng_service/main.do) are named in each scope entry's `notes` only.

### Languages

GEL-03-13b, run on 2026-11-02. Korea has one official language (Korean), so the question was English only. Both candidate publishers are `permission requested`, so no English record is stored. Terms read the same day:

| Row | Terms page (HTTP status, size, type) | Sentence that decides |
|---|---|---|
| `KR-KLRI-TRANSLATION` | https://elaw.klri.re.kr/eng_service/askCopyright.do (200, 31852, text/html; charset=UTF-8) | "No person is permitted, without authorization, to reproduce or distribute any material provided by KLRI through its web services." |
| `KR-LAWGOKR-TRANSLATION` | https://www.law.go.kr/LSW/lawPetitionForm.do?menuId=13&subMenuId=79&query= (200, 90890, text/html;charset=UTF-8) | "※ 단, ... 저작권법 및 그 밖의 다른 법령에서 보호하고 있는 제3자의 권리가 포함된 것으로 해당 법령에 따른 정당한 이용허락을 받지 아니한 정보는 제공대상에서 제외됩니다." The English pages name KLRI as the maker. |

Copyright Act art. 7 item 4 (translations made by the State are not protected) was read (lsiSeq 285693, efYd 20261029) and not relied on: KLRI is a research institute that claims the copyright. Left to Varun.

Fetch recipes proven (no text kept; the session proved only that the pages can be read). The sites reset some connections; every request was retried until it answered.

KLRI, the Serious Accidents Punishment Act (`hseq` 59952). The search form (`/eng_service/lawTotalSearch.do`, POST) answered HTTP 500 to the cloud address on every try, so the `hseq` came from a web search result:

```
curl -sS -L -A 'Mozilla/5.0' -o klri_59952.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://elaw.klri.re.kr/eng_service/lawViewContent.do?hseq=59952'
```

Returned `200 53431 text/html; charset=UTF-8`, sha256 `e1ec33ac2a62606199b4b5561ac2c76be166076bdb00a02a5c270e1e5992adcf`. The page header reads "Act No. 17907, Jan. 26, 2021". `lawView.do?hseq=59952&lang=ENG` is the shell page (200, 18272) and holds no text.

law.go.kr English, the Serious Accidents Punishment Act (`lsiSeq` 228817, the same number as the Korean history version):

```
curl -sS -L -A 'Mozilla/5.0' -o law_en_228817.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.law.go.kr/LSW/eng/engLsInfoR.do?lsiSeq=228817'
```

Returned `200 30231 text/html;charset=UTF-8`, sha256 `a20e9fee3719c192016ecf84d59d75f73e5448026705766601076137f05c8555`. Header: "[Enforcement Date 27. Jan, 2022.] [Act No.17907, 26. Jan, 2021., New Enactment]", preceded by "This English translation of the legislation is provided by the Korea Legislation Research Institute ...". English pages exist for the enactment versions of all six instruments; the English pages for later amendments that were opened (`lsiSeq` 289887, 289285, 289967, 278597) are 2 KB header-only stubs. The English search page (`/engLsSc.do`, 200) opens; its list request `engLsScListR.do` returned law.go.kr's overload error page.

| Instrument | Languages stored | English found, not stored |
|---|---|---|
| `kr-carbon-neutrality-act` | ko | Act No. 18469 (2021-09-24), matches the 2022-03-25 version; no English text for later versions |
| `kr-carbon-neutrality-act-decree` | ko | Decree No. 32557 (2022-03-25), matches 2022-03-25 |
| `kr-ets-act` | ko | Act No. 11419 (2012-05-14), matches 2012-11-15; KLRI also has Acts No. 11690, 20172, 21065, not compared |
| `kr-ets-act-decree` | ko | Decree No. 24180 (2012-11-15), matches 2012-11-15; KLRI also has amended versions to No. 28562 |
| `kr-sapa` | ko | Act No. 17907 (2021-01-26), matches 2022-01-27 |
| `kr-sapa-decree` | ko | Decree No. 32020 (2021-10-05), matches 2022-01-27; 2025-10-01 English is a stub |

The gap in every row is the licence: both rows are `permission requested`.

## Australia

Fetched 2026-11-02 (GEL-03-01). Nothing was blocked from the cloud address: legislation.gov.au, api.prod.legislation.gov.au, asic.gov.au, aasb.gov.au and auasb.gov.au all answered 200.

Rows `AU-LEGISLATION-ADOPTED` and `AU-LEGISLATION-CONSOLIDATED` (Federal Register of Legislation, CC BY 4.0). The Register's web pages are a JavaScript app and hold no text in the HTML, so the text comes from its public OData API, `https://api.prod.legislation.gov.au/v1/`, as EPUB (a zip whose `OEBPS/document.opf` spine lists the XHTML files). Titles are addressed by Register id (`C...` Acts, `F...` legislative instruments); versions are listed by `/versions`. The EPUB is generated on request, so its bytes and sha256 differ between fetches; the extracted text does not (re-fetched and compared on the day).

As made, Climate Change Act 2022 (`C2022A00037`):

```
curl -sS -L -o cc_asmade.epub -w '%{http_code} %{size_download} %{content_type}\n' "https://api.prod.legislation.gov.au/v1/documents/find(titleId='C2022A00037',asAtSpecification='AsMade',type='Primary',format='Epub',uniqueTypeNumber=0,volumeNumber=0,rectificationVersionNumber=0)"
```

Returned `200 46469 application/epub+zip`.

Point-in-time compilation, same Act at 2023-04-12 (compilation 1; row `AU-LEGISLATION-CONSOLIDATED`):

```
curl -sS -L -o cc_20230412.epub -w '%{http_code} %{size_download} %{content_type}\n' "https://api.prod.legislation.gov.au/v1/documents/find(titleId='C2022A00037',asAt=2023-04-12T00:00:00Z,type='Primary',format='Epub',uniqueTypeNumber=0,volumeNumber=0,rectificationVersionNumber=0)"
```

Returned `200 34586 application/epub+zip`. The text starts "Act No. 37 of 2022 as amended / Compilation No. 1 / Compilation date: 12 April 2023", and the compilation number and date printed in each stored file match the `/versions` entry it was fetched for (checked for every compilation that prints them; the oldest NGER Act and Regulations compilations print only "prepared on <later date>"). Version list:

```
curl -sS -L -o versions.json -w '%{http_code} %{size_download} %{content_type}\n' "https://api.prod.legislation.gov.au/v1/versions?\$filter=titleId%20eq%20'C2022A00037'&\$orderby=start"
```

Returned `200 2227 application/json; odata.metadata=minimal; odata.streaming=true; charset=utf-8`. Each version has `start`, `registerId`, `compilationNumber`; versions with `registerId` null (future-dated) have no published text and were skipped. Not working: `registerId='...'` in `find(...)` returned 404; `asAt` without a time or `asAtSpecification='<date>'` returned 400 (`Unhandled version expression combination`). `asAt` at a version's own start date returns that version (`asAt=2022-09-13` returns the as-made file, 46469 bytes). The same call with `format='Pdf'` returned `200 795288 application/pdf`; only the PDF is flagged `isAuthorised` in the `/documents` listing.

Text: all XHTML files in spine order, tags stripped, block elements as line breaks, cells tab-separated, non-breaking spaces left as returned. Compilations carry their own endnotes and amendment history; they are part of `text`.

In-force dates. A compilation record takes the `start` of its Register version. An as-made record takes the commencement date read from the Act or instrument itself, which can differ from the Register's first `start` (Royal Assent or registration date): Climate Change Act 2022-09-14 (Register 2022-09-13), Modern Slavery Act 2019-01-01 (Register 2018-12-10), NGER Act 2007-09-29 (Register 2007-09-28), NGER Regulations 2008-07-01 (Register 2008-06-26), Safeguard Mechanism Rule 2016-07-01 (Register 2015-10-08), Treasury Laws Amendment (FMIOM) Act 2024 Schedule 4 2024-09-18 (Register 2024-09-17), Safeguard Mechanism (Crediting) Amendment Act 2023 Schedules 1 to 3 2023-04-12 (Register 2023-04-11). Each sentence is in the scope entry's `evidence`.

Stored (record counts include the as-made record):

| Instrument | Row | Records | Consolidated dates stored |
|---|---|---|---|
| `au-tlaa-2024-87` | adopted | 1 | none (an amending Act has no compilation) |
| `au-safeguard-crediting-act-2023` | adopted | 1 | none |
| `au-climate-change-act-2022` | both | 3 | 2023-04-12, 2025-02-20 |
| `au-modern-slavery-act-2018` | both | 3 | 2024-10-14, 2024-11-07 |
| `au-nger-act-2007` | both | 27 | 26 compilations, 2008-09-16 to 2025-11-03 (the Register lists no compilation 1) |
| `au-nger-regulations-2008` | both | 34 | 33 compilations, 2009-03-15 to 2026-07-01 |
| `au-nger-safeguard-rule-2015` | both | 14 | 13 compilations, 2019-03-07 to 2024-08-31 |
| `au-corporations-act-2001-pt2m3` | consolidated | 2 | 2024-09-18, 2025-12-05 |

`au-corporations-act-2001-pt2m3` is an extract. A full compilation of the Corporations Act 2001 is about 6.6 million characters of text (2.3 to 2.6 MB as EPUB), so each record keeps three blocks from the compilation unchanged: ss 292A, 296A to 296E, and Part 10.77 (application and transitional provisions for Schedule 4 of Act No. 87 of 2024). `fetched_sha256` is the hash of the whole EPUB. Compilations 135 to 149 (2024-09-18 to 2026-09-19) were all fetched. Compilation 135 (C2024C00372, 2024-09-18) is the first with s 292A. Its extract equals those of compilations 136 to 143 (2024-09-24, 2024-10-14, 2024-12-11, 2024-12-24, 2025-02-21, 2025-03-17, 2025-07-01, 2025-07-09), so those eight have no record. Compilation 144 (C2025C00696, 2025-12-05) changes the extract (adds ss 1707DA and 1707DB, after Act No. 72 of 2025, Schedule 4 Part 1, commencing 2025-12-05) and compilations 145 to 149 (2025-12-19, 2026-06-30, 2026-07-01, 2026-08-27, 2026-09-19) match it. A compilation that changes only other parts of the Act is therefore not a record. Future-dated Corporations Act versions (2026-12-01, 2026-12-04, 2027-04-08, 2027-07-01) have no published text.

Compilations of the NGER Act, Regulations and Rule with identical text to the previous version: none (every compilation changed the text).

### Link only

| Instrument | Row | Why |
|---|---|---|
| `au-aasb-s2` (F2024L01472) | `AU-AASB-ADOPTED`, permission requested | The standard states IFRS Foundation copyright, "No rights granted to third parties", reproduction only for Professional Use or private study, no derivative works. The AASB copyright notice allows "unaltered form only ... personal, non-commercial use". The Register text was opened (200, EPUB 85761 bytes) but not stored. |
| `au-aasb-s2025-1` (F2025L01594) | `AU-AASB-ADOPTED`, permission requested | Same notice. Commences 2026-12-31, not yet in force on 2026-11-02. |
| `au-assa-5010` (F2025L00109) | `AU-AUASB-ADOPTED`, permission requested | AUASB notice: "unaltered form (retaining this notice) is permitted for personal and non-commercial use". |
| `au-assa-2025-10` (F2025L01654) | `AU-AUASB-ADOPTED`, permission requested | Same notice. |

Row `AU-ASIC-ADOPTED` (ASIC regulatory guides, for example RG 280 Sustainability reporting) is `permission requested`: ASIC's grant covers verbatim reproduction of regulatory guides under CC BY 4.0, and a tag-stripped extraction is not verbatim. Guides are not enacted law, so no scope entry uses the row; no recipe was proven. ASIC-made legislative instruments (class orders) are on the Federal Register and fall under the `AU-LEGISLATION` rows.

Not in scope: the Treasury Laws Amendment (Strengthening Financial Systems and Other Measures) Act 2025 (C2025A00072, Schedule 4 Part 1 Division 2 amends the Corporations Act sustainability provisions from 2025-12-05) is an omnibus of unrelated amendments and has no entry of its own; its effect is in the 2025-12-05 Corporations Act record. The Environment Protection and Biodiversity Conservation Act 1999 (C2004A00485) is an F7 register row only.


## Switzerland

Rows `CH-FEDLEX-CONSOLIDATED` and `CH-FEDLEX-ADOPTED`, both `pass` on the statute basis (Copyright Act Art. 5; reuse conditions in Publication Ordinance Art. 49 are recorded in the row notes). The www.fedlex.admin.ch pages are a JavaScript application, so texts come from the Fedlex data API (`fedlex.data.admin.ch`), which answered from the cloud address on 2026-11-02. Language: German only. Run on 2026-11-02 for the Ordinance on Climate Disclosures (ELI `cc/2022/747`, SR 221.434).

Step 1, list the file URL of a consolidation (the file name ends in a version counter, so it cannot be guessed):

```
curl -sS -L -G -H 'Accept: text/csv' --data-urlencode 'query=PREFIX j: <http://data.legilux.public.lu/resource/ontology/jolux#> SELECT DISTINCT ?z WHERE { <https://fedlex.data.admin.ch/eli/cc/2022/747/20240101> j:isRealizedBy ?x . ?x j:language <http://publications.europa.eu/resource/authority/language/DEU> . ?x j:isEmbodiedBy ?y . ?y j:isExemplifiedBy ?z . FILTER(CONTAINS(STR(?z),"/xml/")) }' -o q.csv -w '%{http_code} %{size_download} %{content_type}\n' https://fedlex.data.admin.ch/sparqlendpoint
```

Returned `200 157 text/csv;charset=UTF-8`. The dates of all consolidations of a work come from `SELECT DISTINCT ?c ?d WHERE { ?c j:isMemberOf <WORK> . ?c a j:Consolidation . ?c j:dateApplicability ?d }` (always `DISTINCT`: the endpoint repeats rows otherwise). The as-adopted file comes from the work `eli/oc/...`, found with `<WORK> j:basicAct ?b`, then the same query on `?b`.

Step 2, row `CH-FEDLEX-CONSOLIDATED`, consolidated text as of 2024-01-01:

```
curl -sS -L -o vbk_20240101.xml -w '%{http_code} %{size_download} %{content_type}\n' https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2022/747/20240101/de/xml/fedlex-data-admin-ch-eli-cc-2022-747-20240101-de-xml-2.xml
```

Returned `200 10815 application/xml` (Akoma Ntoso).

Row `CH-FEDLEX-ADOPTED`, as adopted in the Official Compilation:

```
curl -sS -L -o vbk_adopted.xml -w '%{http_code} %{size_download} %{content_type}\n' https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/oc/2022/747/de/xml/fedlex-data-admin-ch-eli-oc-2022-747-de-xml.xml
```

Returned `200 10638 application/xml`. Without a `User-Agent` and with the default curl one both answered the same. The `Accept: application/sparql-results+json` header also works (`200 305 application/sparql-results+json`).

Text extraction: the `act` element without `meta`; block elements (preface lines, headings, articles, paragraphs, list items) as line breaks, article and paragraph numbers on the line of their text, footnotes (`authorialNote`) as their own `[Fussnote] ...` lines after the block that carries them. Nothing reworded. Each record's `fetched_sha256` is that of the whole file as returned. For the Code of Obligations (about 2 MB a version) the record text is one chapter (the Sixth Division for Art. 964a to 964c, the Eighth for Art. 964j to 964l), cut out of the fetched file by its heading.

Stored (fetched 2026-11-02): a consolidation is stored only when its text differs from the previous stored version, so the dates below are the dates the text changed. For an act with an as-adopted record, the first consolidation is stored only if its body (footnotes and the "Stand am" line ignored) differs.

| Instrument | Row | Versions stored (`in_force`) |
|---|---|---|
| `ch-co-art964a-c` | consolidated | 2022-01-01 (unchanged in the 11 consolidations from 2022-01-01 to 2027-07-01) |
| `ch-co-art964j-l` | consolidated | 2022-01-01 (same) |
| `ch-vsotr` | consolidated | 2022-01-01, 2024-01-01 |
| `ch-climate-disclosure-ordinance` | adopted, consolidated | 2024-01-01 (both) |
| `ch-klg` | adopted, consolidated | 2025-01-01 (both) |
| `ch-klv` | adopted, consolidated | 2025-01-01 (both), 2026-01-01, 2026-11-01 |
| `ch-co2-act` | consolidated | 2021-01-01, 2022-01-01, 2025-01-01, 2027-01-01 (published amendment, not yet in force) |
| `ch-co2-ordinance` | consolidated | 14 versions, 2021-01-01 to 2026-01-01 |

Not served as XML or HTML (so not stored, no recipe): the as-adopted VSoTr (DOCX and PDF only), the as-adopted CO2 Act and CO2 Ordinance (DOC and PDF only), the CO2 Act consolidations of 2013-01-01, 2018-01-01 and 2020-01-01 (PDF only), CO2 Ordinance consolidations before 2021 and of 2020-01-01 and 2020-11-01 (PDF or DOC only), and the CO2 Ordinance consolidation of 2027-01-01 (no German file listed yet). Code of Obligations consolidations before 2022-01-01 are not stored because Art. 964a to 964c and 964j to 964l did not exist in this form before then.

### Link only

- `ch-finma-circ-2026-1`: row `CH-FINMA-ADOPTED`, `permission requested` (finma.ch terms: "Any reproduction requires the prior written consent of the copyright holder."). The PDF at `https://www.finma.ch/en/~/media/finma/dokumente/dokumentencenter/myfinma/rundschreiben/finma-rs-2026-01.pdf` was opened (200, 259729 bytes, `application/pdf`); no text is stored.
- Not in scope: Swiss Climate Scores (SIF, 2022, updated 2023, applicable from 2025-01-01). The SIF pages describe it as a voluntary standard, not an enacted instrument, so it has no scope entry and no register row. SIX Exchange Regulation (`ser-ag.com`, disclaimer item 10 requires prior written consent): no instrument in scope, so no row.
- No site was blocked from the cloud address: fedlex.admin.ch, fedlex.data.admin.ch, finma.ch, sif.admin.ch, admin.ch and ser-ag.com all answered.

### Languages

Run on 2026-11-02 (GEL-03-13b). Wave 1 stored German only. French and Italian are official languages, served by Fedlex from the same ELI version and the same data API, so they are stored under the existing rows `CH-FEDLEX-CONSOLIDATED` and `CH-FEDLEX-ADOPTED` (Copyright Act Art. 5 para. 1): no new row. English is a translation the Federal Chancellery publishes for information, so it has its own row, `CH-FEDLEX-TRANSLATION` (`translation`, `pass` on Copyright Act Art. 5 para. 2; the reading that rests on is in the row notes and in the PR). Nothing is stored under a row that is not `pass`. No site was blocked from the cloud address: fedlex.admin.ch and fedlex.data.admin.ch answered every request below.

Request 1, row `CH-FEDLEX-TRANSLATION`: list the English file of a consolidation (language `ENG`; for French use `FRA`, for Italian `ITA`, nothing else changes). Run for the Climate Protection Act (KlG, ELI `cc/2023/655`), consolidation 2025-01-01:

```
curl -sS -L -G -H 'Accept: text/csv' --data-urlencode 'query=PREFIX j: <http://data.legilux.public.lu/resource/ontology/jolux#> SELECT DISTINCT ?z WHERE { <https://fedlex.data.admin.ch/eli/cc/2023/655/20250101> j:isRealizedBy ?x . ?x j:language <http://publications.europa.eu/resource/authority/language/ENG> . ?x j:isEmbodiedBy ?y . ?y j:isExemplifiedBy ?z . FILTER(CONTAINS(STR(?z),"/xml/")) }' -o q.csv -w '%{http_code} %{size_download} %{content_type}\n' https://fedlex.data.admin.ch/sparqlendpoint
```

Returned `200 155 text/csv;charset=UTF-8` (`FRA` and `ITA`: `200 157 text/csv;charset=UTF-8`). An empty answer is the header line `"z"` alone (4 bytes): that is how a consolidation without an English expression answers.

Request 2, row `CH-FEDLEX-TRANSLATION`, the English file itself (same instrument, same day):

```
curl -sS -L -o klg_20250101_en.xml -w '%{http_code} %{size_download} %{content_type}\n' https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2023/655/20250101/en/xml/fedlex-data-admin-ch-eli-cc-2023-655-20250101-en-xml.xml
```

Returned `200 29018 application/xml`, sha256 `15464ee08722c9dc7bd027b96aab6c28cd5826ba34670d09df013fdff7485564`. The file's first paragraph reads "English is not an official language of the Swiss Confederation. This translation is provided for information purposes only and has no legal force." and its header line states the amendment state ("of 30 September 2022 (Last amended on 1 January 2025)"). The English legal notice, `curl -sS -L -o li.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.fedlex.admin.ch/en/legal-information`, returned `200 77151 text/html;charset=UTF-8`; like the German page it is a JavaScript shell, so the terms were read with Playwright chromium (fingerprint recipe in the row).

Requests 3 and 4, the existing rows serving the other official languages (same instrument and consolidation; the file name carries the version counter the SPARQL answer gave):

```
curl -sS -L -o klg_20250101_fr.xml -w '%{http_code} %{size_download} %{content_type}\n' https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2023/655/20250101/fr/xml/fedlex-data-admin-ch-eli-cc-2023-655-20250101-fr-xml-3.xml
curl -sS -L -o klg_20250101_it.xml -w '%{http_code} %{size_download} %{content_type}\n' https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2023/655/20250101/it/xml/fedlex-data-admin-ch-eli-cc-2023-655-20250101-it-xml-3.xml
```

Returned `200 30785 application/xml` and `200 30119 application/xml`. The as-adopted files follow the German pattern with `fr` or `it` in place of `de` (for example `.../eli/oc/2023/655/fr/xml/fedlex-data-admin-ch-eli-oc-2023-655-fr-xml.xml`).

Text extraction is the one of the German records, run on the fr, it and en files, with the same line layout. The footnote marker stays `[Fussnote]` in every language: it is a marker the extraction adds, not law text. Checked on the day: the extraction rebuilds all 30 stored German texts byte for byte from the German files, and for the 80 downloaded French, Italian and English files (the Code of Obligations ones as their Division cut) the non-space characters of the extracted text equal those of the XML body (nothing dropped, nothing added except the marker). For the two Code of Obligations entries the same Division is cut out of the French, Italian and English Code by its element id (`part_4/tit_32/chap_6`, Sixth Division; `part_4/tit_32/chap_8`, Eighth Division), which is identical in every language. An English file is stored only when its own header states an amendment state equal to the `in_force` of the version, and when it carries no provision that the German text of that version shows repealed.

Stored on 2026-11-02, per instrument (fr and it are one per stored German record; en is a translation record):

| Instrument | de | fr | it | en | English gaps and why |
|---|---|---|---|---|---|
| `ch-co-art964a-c` | 1 | 1 | 1 | 1 | none (Sixth Division of the English Code, "Status as of 1 January 2022") |
| `ch-co-art964j-l` | 1 | 1 | 1 | 1 | none (Eighth Division of the English Code, same state) |
| `ch-vsotr` | 2 | 2 | 2 | 2 | none; the as-adopted text is not stored in any language (DOCX and PDF only) |
| `ch-climate-disclosure-ordinance` | 2 | 2 | 2 | 0 | no English expression for the as-adopted work (`eli/oc/2022/747`) or the 2024-01-01 consolidation; the Fedlex page lists DE FR IT |
| `ch-klg` | 2 | 2 | 2 | 1 | consolidation 2025-01-01 only; the as-adopted work (`eli/oc/2023/655`) has no English expression |
| `ch-klv` | 4 | 4 | 4 | 0 | no English expression for `eli/oc/2024/772` or any of its three consolidations; the Fedlex page lists DE FR IT |
| `ch-co2-act` | 4 | 4 | 4 | 3 | 2027-01-01 (published amendment) has no English expression |
| `ch-co2-ordinance` | 14 | 14 | 14 | 11 | 2021-01-01 and 2025-05-01 have no English expression; 2025-01-01 is served but not stored (below) |

The `ch-co2-ordinance` English of 2025-01-01 reads "Status as of 1 January 2025" but is the text from before the Ordinance of 2 April 2025 (AS 2025 248, in force from 1 January 2025), which the stored German text already contains: it still has Art. 70, 71, 74a and 74b as live text where the German text shows them repealed, and 28 article element ids of the German text (two of them the repealed ranges Art. 70-71 and 74a-74b) have no English counterpart. It matches no stored version, so it is not stored. Two stored English texts are incomplete against the German: 2022-01-01 stops at Art. 146k and omits Art. 146l to 146t, and the English texts from 2021-02-10 to 2023-11-10 leave out the repealed-article line "Art. 55b-55d". These are recorded in `register/CH/scope.json`.

The `source_row` of the six entries that now hold English records (`ch-co-art964a-c`, `ch-co-art964j-l`, `ch-vsotr`, `ch-klg`, `ch-co2-act`, `ch-co2-ordinance`) lists `CH-FEDLEX-TRANSLATION` as well, because `tools/check_corpus.py` refuses a record whose `source_id` is not in the entry's `source_row`.

## Brazil

Run on 2026-11-02 (GEL-03-07). Six rows pass: `BR-CAMARA-ADOPTED`, `BR-CAMARA-CONSOLIDATED` (terms: Câmara portal item 29, public domain with source citation), `BR-CVM-ADOPTED`, `BR-CVM-CONSOLIDATED`, `BR-BCB-ADOPTED`, `BR-BCB-CONSOLIDATED` (statute: Lei 9.610/1998 art. 8 IV). The CVM and BCB rows pass on the statute although gov.br general terms carry a Creative Commons no-derivatives notice (see the row notes); Varun to confirm. Text extraction: Câmara and CVM `.htm` files are tag-stripped HTML (headings and paragraphs as line breaks); CVM PDFs go through `pdftotext -layout` with runs of spaces collapsed and blank lines dropped, so their line breaks are the PDF's line wraps; BCB text is the `Texto` field of the JSON, tag-stripped.

Row `BR-CAMARA-ADOPTED`, Lei 15.042/2024 as published (the number after `publicacaooriginal-` is read from the `-norma-pl.html` page of the same law):

```
curl -sS -L -o lei15042_adopted.html -w '%{http_code} %{size_download} %{content_type}\n' https://www2.camara.leg.br/legin/fed/lei/2024/lei-15042-11-dezembro-2024-796690-publicacaooriginal-173745-pl.html
```

Returned `200 139536 text/html; charset=UTF-8`. Row `BR-CAMARA-CONSOLIDATED`, same law, current text (`.../lei-15042-11-dezembro-2024-796690-normaatualizada-pl.html`): `200 162344 text/html; charset=UTF-8`. Decrees use `/legin/fed/decret/<year>/decreto-<n>-<date>-<id>-publicacaooriginal-<n>-pe.html`. The URL parts come from the `-norma-pl.html` / `-norma-pe.html` page, or from a LexML lookup (`https://www.lexml.gov.br/urn/urn:lex:br:federal:lei:2009-12-29;12187`, which lists the Câmara links for older laws).

Row `BR-CVM-ADOPTED`, Resolução CVM 193 as published:

```
curl -sS -L -o res193.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://conteudo.cvm.gov.br/export/sites/cvm/legislacao/resolucoes/anexos/100/resol193.pdf
```

Returned `200 198491 application/pdf`. Resolução CVM 244: `curl -sS -L -o res244.htm -w '%{http_code} %{size_download} %{content_type}\n' https://conteudo.cvm.gov.br/legislacao/resolucoes/anexos/200/resol244.htm` returned `200 10321 text/html;charset=UTF-8`. The `anexos/NNN` band is read from the links on `https://conteudo.cvm.gov.br/legislacao/resolucoes/resol193.html`; guessed bands and the `.htm`/`.html` suffix often return 410 with a 16981-byte "page not found" body.

Row `BR-CVM-CONSOLIDATED`, Resolução CVM 193 consolidated: `curl -sS -L -o res193_consolid.pdf ... https://conteudo.cvm.gov.br/export/sites/cvm/legislacao/resolucoes/anexos/100/resol193consolid.pdf` returned `200 380912 application/pdf`. CVM serves one current consolidated file per resolution, so no earlier consolidation is stored.

Rows `BR-BCB-ADOPTED` and `BR-BCB-CONSOLIDATED`, Resolução CMN 4.943:

```
curl -sS -L -G -o cmn4943.json --data-urlencode 'p1=Resolução CMN' --data-urlencode 'p2=4943' -w '%{http_code} %{size_download} %{content_type}\n' https://www.bcb.gov.br/api/conteudo/app/normativos/exibenormativo
```

Returned `200 50416 application/json; charset=utf-8`. The JSON holds `Titulo`, `DOU`, `Atualizacoes` (list of amendments, with "a partir de" dates when given) and `Texto` (HTML). `normativos.bcb.gov.br` attachment PDFs returned 404 or a connection reset for the guesses tried (`Attachments/<Id>/Res_4945_v1_O.pdf`, `_v2_P.pdf`, `_v2_L.pdf`), so the original wording of an amended BCB norm is not available; those instruments carry one dated record each (see scope notes).

Blocked from the cloud address: `https://www.planalto.gov.br/` (all paths tried, including `/ccivil_03/leis/l9610.htm` and `/ccivil_03/_ato2023-2026/2024/lei/L15042.htm`) answered with an empty reply or an 814-byte "Acesso Negado! Esta requisição foi bloqueada" page. Row `BR-PLANALTO-CONSOLIDATED` is `permission requested` for that reason; the orchestrator can open it from the laptop. Câmara copies were used instead. `https://www.in.gov.br` opened (home page 200) but no DOU act page was needed: publication dates come from the Câmara norma pages, the CVM pages and the BCB `DOU` field.

Link-only instruments:

| Instrument | Official URL | Why link only |
|---|---|---|
| Portaria Interministerial MTE/MDHC/MIR 18/2024 | https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/portaria-interministerial-mte-mdhc-mir-n-18-2024.pdf | Row `BR-MTE-ADOPTED` is permission requested: the PDF (200, 384528 bytes, application/pdf) was opened to read the date, but no text fetch was proven for storage. |
| Lei 12.305/2010 (F7) | http://www2.camara.gov.br/legin/fed/lei/2010/lei-12305-2-agosto-2010-607598-norma-pl.html | F7: register row only, no scope entry. |

Stored by GEL-03-07: `br-lei-15042-2024` (adopted 2024-12-12, consolidated 2024-12-27), `br-lei-12187-2009` (adopted 2009-12-29, consolidated 2026-09-23), `br-decreto-12677-2025`, `br-decreto-12768-2025`, `br-cvm-res-193-2023` (adopted 2023-11-01, consolidated 2026-06-01), `br-cvm-res-219-2024`, `br-cvm-res-227-2025`, `br-cvm-res-244-2026`, `br-cvm-res-59-2021` (adopted and consolidated, both 2023-01-02), `br-cmn-res-4943-2021`, `br-cmn-res-4944-2021`, `br-cmn-res-4945-2021` (2025-01-01), `br-bcb-res-139-2021` (2026-09-04 plus a repeal record 2027-01-01), `br-bcb-res-140-2021`, `br-bcb-res-586-2026` (2027-01-01).
### Languages

Run on 2026-11-02 (GEL-03-13b). Brazil has one official language, Portuguese, so the Wave 1 records already hold every official language. English was looked for once per publisher. One government translation exists (CVM, Resolução 193); its row `BR-CVM-TRANSLATION` is `permission requested`, so nothing is stored. No other row was added.

Row `BR-CVM-TRANSLATION`, Resolução CVM 193 (English free translation, translation date 24 October 2023):

```
curl -sS -L -o ResolutionCVM193.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.gov.br/cvm/en/foreign-investors/regulation-files/ResolutionCVM193.pdf
```

Returned `200 601317 application/pdf`. The index page `curl -sS -L -o roi.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.gov.br/cvm/en/foreign-investors/regulation-of-interest` returned `200 88322 text/html;charset=utf-8`; its footer says content is under Creative Commons Attribution-NoDerivs 3.0 Unported, and the page and the PDF both call the text a free translation, not legally binding. A no-derivatives licence does not allow storing a modified text and Lei 9.610/1998 art. 8 IV covers official acts, not a translation, hence `permission requested`. Of the CVM resolutions in scope only 193 is listed on that page.

Other places looked at: `https://www.gov.br/cvm/en` (200, 82808, text/html;charset=utf-8); `https://www.gov.br/mma/en` (200, 61952) and `https://www.gov.br/fazenda/en` (200, 51167), with no regulation links; the Câmara norma page for Lei 15.042 (200, 43749), Portuguese only; `https://www.bcb.gov.br/en` (200, 2871, text/html), a script-rendered shell with no list a plain request can read. `https://www.cvm.gov.br/en` returned 410 (16981 bytes, the old "page not found" body). Planalto stays blocked from the cloud address (see above).

| Instrument | Languages stored | Gap and reason |
|---|---|---|
| br-lei-15042-2024, br-lei-12187-2009, br-decreto-12677-2025, br-decreto-12768-2025 | pt | No English from the Câmara, MMA or MF pages; Planalto blocked from the cloud address. |
| br-cvm-res-193-2023 | pt | English exists (translation date 2023-10-24, original text); not stored, row permission requested. It matches the 2023-11-01 adopted version only, not the 2026-06-01 consolidated one. |
| br-cvm-res-219-2024, br-cvm-res-227-2025, br-cvm-res-244-2026, br-cvm-res-59-2021 | pt | Not listed on the CVM English page. |
| br-cmn-res-4943-2021, br-cmn-res-4944-2021, br-cmn-res-4945-2021, br-bcb-res-139-2021, br-bcb-res-140-2021, br-bcb-res-586-2026 | pt | No English version found on the BCB English portal or the normativos API. |

## Canada

Row `CA-JUSTICE-CONSOLIDATED` (Justice Laws Website, terms: Reproduction of Federal Law Order SI/97-5). Every dated version of an Act or regulation is one HTML page. The list of version dates is `PITIndex.html`; each link on it has the form `<date as YYYYMMDD>/P1TT3xt3.html`. Canadian Net-Zero Emissions Accountability Act (C-19.3), run 2026-11-02, no special headers needed:

```
curl -sS -L -o pit.html -w '%{http_code} %{size_download} %{content_type}\n' https://laws-lois.justice.gc.ca/eng/acts/C-19.3/PITIndex.html
curl -sS -L -o cneaa_20230331.html -w '%{http_code} %{size_download} %{content_type}\n' https://laws-lois.justice.gc.ca/eng/acts/C-19.3/20230331/P1TT3xt3.html
```

Returned `200 13717 text/html` and `200 61552 text/html`. Regulations use `regulations/SOR-2019-266` in place of `acts/C-19.3`; the largest page fetched was the Greenhouse Gas Pollution Pricing Act, 927352 bytes. The page for a date is the version that starts on that date (the version line in the page, "Version of document from X to Y", matched the date in every fetch). The current version of an instrument is also served as XML (`https://laws-lois.justice.gc.ca/eng/XML/SOR-2019-266.xml` returned `200 633292 text/xml`), but only the HTML pages cover every dated version. One transient failure: the Competition Act page for 2024-06-20 returned an empty reply (curl exit 52) once and succeeded on retry.

Stored by GEL-03-02 (fetched 2026-11-02; each record has `fetched_url` and the sha256 of the page as returned, and the sha256 of `cneaa_20230331.html` above equals the record's). `text` is the content block of the page (`<div id="wb-cont" class="docContents">` up to `<!-- MAIN CONT DIV END -->`), tags stripped, block elements as line breaks, table cells tab-separated, the "Version of document" line left out. The page's own marginal notes, footnotes and amendment source lines are kept.

| Instrument | Versions stored (`in_force` = version start) |
|---|---|
| `ca-ggppa` (G-11.55) | 24, 2018-06-21 to 2026-03-26 |
| `ca-obps-regs` (SOR-2019-266) | 12, 2019-06-28 to 2025-04-01 |
| `ca-cneaa` (C-19.3) | 2021-06-29, 2023-03-31 |
| `ca-competition-act-s74-01` (C-34, whole Act) | 2024-06-20, 2024-12-15, 2025-06-20, 2026-03-26 |
| `ca-faflcsca` (F-10.6) | 2023-05-11, 2024-01-01 |
| `ca-clean-fuel-regs` (SOR-2022-140) | 2022-06-21, 2024-09-30 |
| `ca-methane-regs` (SOR-2018-66) | 2018-04-04, 2020-01-01, 2023-01-01, 2025-12-12 |
| `ca-offset-credit-regs` (SOR-2022-111) | 2022-05-20 |
| `ca-fsda` (F-8.6) | 2008-06-26, 2010-12-15, 2013-06-26, 2020-12-01, 2026-02-13 |

Notes on the dates. Justice Laws serves no separate as-enacted text: the first version of each instrument is the first consolidation. For the OBPS and the methane regulations that first version starts at registration, before the in-force date in the regulations (deemed 2019-01-01 and 2020-01-01), so the first record predates the in-force date in the scope entry; its `message` says so. The Competition Act has 26 versions; the four stored are the ones that contain s.74.01(1)(b.1) and (b.2) (in the 2023-12-15 version, which was fetched, s.74.01(1) has paragraphs (a) to (c) only). The Clean Fuel Regulations incorporate a standard by reference (s.2 names ISO 14064-3:2019); only the regulation's own text is stored.

### Link only

- `ca-cepa-s46-ghg-notice-2023` and `ca-cepa-s46-ghg-notice-amend-2025` (row `CA-GAZETTE-ADOPTED`, `permission requested`). The pages open: `curl -sS -L -o n.html -w '%{http_code} %{size_download} %{content_type}\n' https://gazette.gc.ca/rp-pr/p1/2023/2023-12-09/html/sup1-eng.html` returned `200 161371 text/html; charset=UTF-8`, and the 2025-12-06 notice (`.../p1/2025/2025-12-06/html/notice-avis-eng.html`) returned 200 with 113288 bytes. They stay link only because the Reproduction of Federal Law Order covers enactments and consolidations, a section 46 notice is not shown to be one, and the Gazette terms page linked from its footer (`https://www.canada.ca/en/transparency/terms.html`) gave an empty reply from the cloud address on three tries. The Gazette's own "About" page says the PDF is the official version and the HTML is unofficial.
- `ca-osfi-b15` (row `CA-OSFI-ADOPTED`, `permission requested`). `https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/climate-risk-management` returned `200 145939 text/html; charset=UTF-8`. The terms page (`/en/terms-conditions`) allows non-commercial reproduction and requires written permission for commercial redistribution.
- CSSB CSDS 1 and CSDS 2 (row `CA-CSSB-ADOPTED`, `permission requested`; no scope entry). Blocked from the cloud address: `https://www.frascanada.ca/` returned `403 5375 text/html; charset=UTF-8` with a Cloudflare challenge (`cf-mitigated: challenge`); `/en/sustainability`, `/en/sustainability/standards`, `/en/terms-of-use`, `/en/copyright` and `/en/legal` also returned 403, and an Internet Archive copy reset the connection. The orchestrator can read the terms from the laptop.
- Not reachable from the cloud address either: `https://www.canada.ca/en/transparency/terms.html` and the canada.ca GHG reporting program page (empty reply or HTTP/2 stream error).

## Hong Kong

GEL-03-05, run 2026-11-02. No Hong Kong row is `pass`, so no recipe is proven for storing text and `records/HK/` is empty. All five instruments are link only.

Not usable for a recipe, kept so the next run does not repeat it:

- `https://www.elegislation.gov.hk/` and every page under it (`/hk/cap622`, `/hk/copyright`) answer `302` to `/checkconfig/checkClientConfig.jsp?applicationId=RA001`, a JavaScript browser check that POSTs a CSRF-protected form. Replaying the form with a cookie jar, the CSRF token, Referer and Origin returned `400 Bad Request`. Terms on the site itself could therefore not be read from the cloud address; read them from the laptop browser.
- `https://en-rules.hkex.com.hk/` fails TLS verification from the cloud address (`curl: (60) SSL certificate problem: unable to get local issuer certificate`). Blocked from the cloud address; certificate check not bypassed.

The open-data route to e-Legislation works. This request was run for the Caps. 601 onwards English file (it holds Cap. 622); it is the file read for dates, not stored text:

```
curl -sS -L -o hkel_c_leg_cap_601_cap_end_en.zip -w '%{http_code} %{size_download} %{content_type}\n' https://resource.data.one.gov.hk/doj/data/hkel_c_leg_cap_601_cap_end_en.zip
```

Returned `200 129334645 application/zip`. Caps. 301 to 600 (`hkel_c_leg_cap_301_cap_600_en.zip`, holds Cap. 311; Cap. 603 is in the 601 file) returned `200 560521008 application/zip`. Each zip holds one XML per cap (`cap_622_en_c\cap_622_20250523000000_en_c.xml`, version date in the name); the current-version dataset serves one version per cap. The dataset page is `https://data.gov.hk/en-data/dataset/hk-doj-hkel-legislation-current`. Past versions are a separate dataset (`hk-doj-hkel-legislation-past`), not fetched.

### Link only

| Instrument | Row | Reason |
|---|---|---|
| `hk-cap622-sch5` | `HK-ELEGISLATION-CONSOLIDATED`, permission requested | DATA.GOV.HK terms v1.2 allow commercial reproduction with attribution and an indemnity but say nothing on modification; site's own copyright notice unreadable from the cloud address |
| `hk-hkex-esg-code-part-d` | `HK-HKEX-ADOPTED`, permission requested | HKEX Terms of Use bar copying, modifying and scripted access without written permission; rulebook host blocked from the cloud address |
| `hk-hkfrs-s1-s2` | `HK-HKICPA-ADOPTED`, permission requested | HKICPA terms: non-commercial use, no modification |
| `hk-hkma-spm-gs1` | `HK-HKMA-ADOPTED`, permission requested | HKMA terms: non-commercial, unmodified reproduction only |
| `hk-taxonomy-sustainable-finance` | `HK-HKMA-ADOPTED`, permission requested | same HKMA terms |

`HK-SFC-ADOPTED` is permission requested (prior written consent for third-party reproduction) and backs no scope entry. Air Pollution Control Ordinance (Cap. 311) and Product Eco-responsibility Ordinance (Cap. 603) are F7 and appear in `register/register.csv` only; their dates come from the commencement line in the bulk files above.
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

### Languages

Fetched 2026-11-02 (GEL-03-13b). Japan has one official language, so only English is added, from the new row `JP-JLT-TRANSLATION` (Ministry of Justice, Japanese Law Translation, `pass`, basis terms). The decisive sentence on https://www.japaneselawtranslation.go.jp/en/index/terms: "Information published on this site (referred to below as "content") is subject to the "Public Data License (Version 1.0)" (PDL1.0) unless stated otherwise. In addition, the copyright belongs to the Ministry of Justice of Japan unless stated otherwise." The Government of Japan Standard Terms of Use are not named on that page; PDL1.0 is, and PDL1.0 says it is compatible with CC BY 4.0, allows modification and commercial use, and that users already under the Government of Japan Standard Terms of Use stay under them. Only the site logo and character are taken out. The same page says the translations "are not official texts", so every English record is an unofficial translation of the Japanese record it is stored beside. This paragraph replaces the sentence above that no translation is stored. Every request below was answered from the cloud address; none is blocked.

Proven requests, for the Act on Promotion of Global Warming Countermeasures (`jp-gw-act`, JLT view id 4479):

```
curl -sS -L -o terms.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.japaneselawtranslation.go.jp/en/index/terms
```

Returned `200 12127 text/html; charset=UTF-8`. The page embeds a per-request `_csrfToken`, so the fingerprint in the licence row drops that line: `curl -sL https://www.japaneselawtranslation.go.jp/en/index/terms | grep -v _csrfToken | shasum -a 256` gave `2390c75a267e066642bccff9eacc51b36e788e6bc160b0767ab2dfdd9a010ff9` twice.

Search is a POST that needs the CSRF cookie and token from the search page. Step 1 fetches the form, step 2 searches by Japanese title with older versions (`ha=02`) and untranslated titles (`la=01`) included:

```
curl -sS -c jar.txt -o laws.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.japaneselawtranslation.go.jp/en/laws
curl -sS -b jar.txt -c jar.txt -o result.html -w '%{http_code} %{size_download} %{content_type}\n' -X POST https://www.japaneselawtranslation.go.jp/en/laws/result/ --data-urlencode "_csrfToken=<value of the hidden input _csrfToken in laws.html>" --data-urlencode 'yo=地球温暖化対策の推進に関する法律' -d amb=on -d ha=02 -d la=01 -d ia=03 -d ja=04
```

Returned `200 44458 text/html; charset=UTF-8` and `200 61416 text/html; charset=UTF-8`. Each hit is an `<li>` with the view id, English title, `Law Number:` and `Translated Date:`. Hits: view 4479 and view 3796 (older edition) and an outline (4725). The search matches title words only: the law number as a keyword returns nothing. One search POST (keyword `No. 2 of 2006`) was reset (`curl: (56) Recv failure: Connection reset by peer`) and was not repeated; the other searches answered 200.

```
curl -sS -L -o view4479.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.japaneselawtranslation.go.jp/en/laws/view/4479
curl -sS -H 'X-Requested-With: XMLHttpRequest' -o history4479.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.japaneselawtranslation.go.jp/en/laws/history/4479
curl -sS -L -o gw.txt -w '%{http_code} %{size_download} %{content_type}\n' https://www.japaneselawtranslation.go.jp/en/laws/download/4479/13/h10Aa001170304je15.0_r4A68.txt
```

Returned `200 504791 text/html; charset=UTF-8`, `200 881 text/html; charset=UTF-8` and `200 293803 text/plain; charset=UTF-8`. The view page shows `Last Version: Act No. 68 of 2022` (the law number of the latest amending act the translation reflects) and no enforcement date. The history request lists the other editions with their own view links. The sha256 of `gw.txt`, `e6b9593e267273d369d7ee88b4658813e6b31b0737bb1b2e236ae6b417c5bdaf`, equals `fetched_sha256` in `records/JP/jp-gw-act/2022-07-01-translation-en.json`. The download links are on the view page (`/en/laws/download/<view id>/13/<file name>.txt`); the ones fetched for the other records are in each record's `fetched_url`.

Text recipe: the file is UTF-8 with a byte order mark and CRLF line ends. Lines alternate one Japanese line, then one English line, from the first line to the last. Each file was checked: even number of lines, every odd-position line contains Japanese, no even-position line is empty. `text` is the English lines in order, each trimmed, joined with a newline. Nothing is reworded; English lines that quote a Japanese term keep it.

Date recipe: the view page names an amending act but no date, and two stored e-Gov versions can carry the same amending act. So the record is stored under the e-Gov version whose Japanese text the translation's Japanese lines match. Method: remove all white space from both texts; for each stored version count the translation's Japanese lines found verbatim in it and the share of the translation's 10-character runs that occur in it. Storing rule, set before the last results were read and applied to every translation found: (1) if a stored version named by the page's last amending act is among the equally best fits, the translation is stored under it; (2) otherwise it is stored only when the act's stored versions fit within 0.5 points of the best and one best version can be named (the earliest of a tie, since a later tied version carries an amendment promulgated after the translation was made), or when the best version leads the next by at least 0.5 points; (3) otherwise it is not stored. Results (shares rounded to two places; view 3384 is 98.996% and ties with 2018-01-26 at the top):

| JLT view | Page says | Stored under | Share of runs, lines not found | Others |
|---|---|---|---|---|
| 4633 `jp-fiea` | Act No. 68 of 2022 | 2023-06-01 | 99.26%, 182 of 6825 | rule 2: 2023-06-14 and 2023-11-29 tie; version named by the act (2022-06-17) 98.97%, within 0.5 points; earliest tie taken |
| 3631 `jp-fiea` | Act No. 28 of 2019 | 2020-05-01 | 99.09%, 206 of 6647 | 2020-06-12 and 2020-12-01 tie; the act names 2020-05-01 |
| 5206 `jp-cao-disclosure-order` | Cabinet Office Order No. 53 of 2024 | 2024-08-01 | 99.92%, 3 of 1475 | 2024-04-01 and 2025-01-31 tie; the order names 2024-08-01 |
| 3384 `jp-cao-disclosure-order` | Cabinet Office Order No. 40 of 2017 | 2017-07-14 | 99.00%, 31 of 1415 | 2018-01-26 ties; the order names 2017-07-14 |
| 4479 `jp-gw-act` | Act No. 68 of 2022 | 2022-07-01 | 99.61%, 7 of 652 | rule 2, leads next (2023-04-01) by 0.9 points; the two versions the act names, 2022-06-17 and 2025-06-01, 72.78% and 96.58% |

Deviation: the brief maps by the amending act the page names. For view 4479 and view 4633 that act names stored versions that fit worse than the one stored. The key alone would have put the Global Warming Act translation on 2022-06-17, whose text has no chapter VI (Japan Green Investment Corp.) although the translation has it.

Not stored, with the reason:

| JLT view | Reason |
|---|---|
| 4405 `jp-fiea` | Earlier edition of the same state as view 4633 (99.26% against 2023-06-01); one file name per date, the newer edition is stored |
| 3429 `jp-fiea` | Act No. 46 of 2017; six stored versions tie at 99.29% (2018-04-01, 2018-06-01, 2019-06-07, 2019-06-14, 2019-09-14, 2019-12-11) and the version the act names, 2017-12-01, reaches 97.12%: rule 3 |
| 2355, 1911 `jp-fiea` | Best 97.09% and 93.47%; state of 2010 and 2006, before the first stored version 2016-04-01 |
| 4965 `jp-cao-disclosure-order` | Labelled Cabinet Office Order No. 11 of 2023, but the download (sha256 `830a48fd5bfe25a502bb1138546047266a3c019d605c45da2891cb9787288867`) is byte-identical to the download of view 3384 (No. 40 of 2017); its text does not carry the amendment it names |
| 2688, 2341 `jp-cao-disclosure-order` | Best 98.64% and 89.62%; state of 2014 and 2008, before the first stored version 2017-04-01 |
| 3796 `jp-gw-act` | Act No. 57 of 2006; best 79.10%, before the first stored version 2016-05-27 |
| outlines 4725, 4971, 4732 | Outlines of bills, not translations of the law text |

Languages per instrument (record counts from `ls records/JP/<id>` on 2026-11-02):

| Instrument | Japanese (official) | English (`JP-JLT-TRANSLATION`) | Gap and reason |
|---|---|---|---|
| `jp-fiea` | 53 | 2: 2020-05-01, 2023-06-01 | JLT serves one state per edition; the other 51 versions have no English |
| `jp-cao-disclosure-order` | 37 | 2: 2017-07-14, 2024-08-01 | Same; view 4965 not stored (table above) |
| `jp-gw-act` | 12 | 1: 2022-07-01 | Same |
| `jp-gw-reporting-order` | 12 | 0 | No JLT page. Searched by title 温室効果ガス算定排出量等の報告等に関する命令, `Order on Reporting` and `Greenhouse`; all returned 200 with no hit for this order |
| `jp-gx-act` | 7 | 0 | No JLT page for the Act. Searched 脱炭素成長型経済構造への円滑な移行の推進に関する法律 and `Decarbonized Growth`; hits are outlines only (4971, 4732) |
| `jp-gx-order` | 2 | 0 | No JLT page. Searched the title with 施行令 and `Decarbonized Growth` |
| `jp-gx-regulation` | 2 | 0 | No JLT page. Searched the title with 施行規則 and `Decarbonized Growth` |

The scope entries `jp-ssbj-standards` and `jp-tse-cg-code` are `link only` and unchanged.

## South Africa

Fetched and read 2026-11-02 (GEL-03-08). One `pass` row, `ZA-GOVZA-ADOPTED` (basis: Copyright Act 98 of 1978 s.12(8)(a), no copyright in official texts of a legislative, administrative or legal nature; the gov.za terms page alone would not pass, it allows non-commercial use only). Rows `ZA-RESBANK-ADOPTED` and `ZA-JSE-ADOPTED` are `permission requested`. No row for GPW (gpwonline.co.za): its Terms of Use page opened but carried no terms text, and nothing was fetched from it; every gazette PDF used is served by gov.za. FSCA was not needed (no FSCA instrument in scope).

Row `ZA-GOVZA-ADOPTED`, Climate Change Act 22 of 2024 (English and Tshivenda interleaved in one gazette PDF):

```
curl -sS -L -m 60 -A 'Mozilla/5.0' -o cca.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.gov.za/sites/default/files/gcis_document/202407/50966climatechangeact222024.pdf
```

Returned `200 575512 application/pdf`, sha256 `731eba0336de20b8c983c6e2dc994d5b7697ea407b2258eefe6b749e996695d5`. gov.za resets connections from the cloud address at random (`curl: (35) Recv failure: Connection reset by peer`); every fetch here succeeded within 1 to 6 retries at 5 to 6 s apart. The PDF link on each instrument's page under `https://www.gov.za/documents/...` has the same shape (`/sites/default/files/gcis_document/<YYYYMM>/<file>.pdf`).

Text extraction. The repository has no stdlib PDF reader, so the text was made with poppler `pdftotext` (not stdlib; `tools/update.py` cannot refresh these records): `pdftotext -layout file.pdf -`, then each line stripped and runs of spaces or tabs collapsed to one space, form feeds turned into line breaks, three or more line breaks reduced to two. For the two bilingual gazettes (Climate Change Act, Carbon Tax Act) only page 1 and the even pages were extracted (`pdftotext -layout -f P -l P`): odd pages from 3 on are the Tshivenda or Afrikaans text. Page headers and footers stay in the text. No OCR was run; the text is the PDF's own text layer.

Stored (every record is `adopted`; gov.za serves only the text as published, and later amendments are separate notices, so there is no consolidation to store):

| Instrument | File fetched (under `https://www.gov.za/sites/default/files/gcis_document/`) | `in_force` | Bytes |
|---|---|---|---|
| `za-climate-change-act-22-2024` | `202407/50966climatechangeact222024.pdf` | 2025-03-17 | 575512 |
| `za-carbon-tax-act-15-2019` | `201905/4248323-5act15of2019carbontaxact.pdf` | 2019-06-01 | 337643 |
| `za-nger-regs-2017` | `201704/40762gen275.pdf` | 2017-04-03 | 469122 |
| `za-nger-regs-amendment-2020` | `202009/43712rg11174gon994.pdf` | 2020-09-11 | 571069 |
| `za-companies-act-71-2008` | `201409/321214210.pdf` (197 pages) | 2011-05-01 | 788897 |
| `za-pfa-reg-28` | `201409/34070rg9485gon183.pdf` (70 pages) | 2011-07-01 | 16248111 |

Not stored, with the reason:

| Instrument | Why |
|---|---|
| `za-companies-regs-2011` | Link only. The PDF (`201409/34239rg9526gon351.pdf`, 20040167 bytes, 303 pages) downloaded and its text layer is good, but no official page opened states the regulations' commencement date, so no dated record can be made. |
| `za-bbbee-act-53-2003` | Link only. `201409/a53-030.pdf` (346271 bytes, 6 pages) is an old OCR layer with words run together; storing it would put corrupt text under a law record. |
| `za-pa-g3-2025-banks`, `za-pa-gn3-2025-insurers` | Link only. Row `ZA-RESBANK-ADOPTED` is `permission requested`: resbank.co.za HTML pages answer a 243-byte rejection to the cloud address, so the terms were not read. The two PDFs opened with a plain `curl` (`200 435853 application/pdf` and `200 441500 application/pdf`) and were read for the issue date only. |
| `za-jse-listings-8-63` | Link only. Blocked from the cloud address: `https://www.jse.co.za/terms-and-conditions`, `/legal`, `/disclaimer`, `/` and the listings PDFs return `403` (a 5 KB rejection page). Row `ZA-JSE-ADOPTED` is `permission requested`. Read from a laptop. |

The JSE Sustainability and Climate Disclosure Guidance (June 2022) is voluntary guidance with a `register.csv` row and no scope entry. The Internet Archive (`web.archive.org`) reset every connection from the cloud address, so no archived terms pages were read. Terms page read: `https://www.gov.za/terms-and-conditions-use-0` (200, 45674 bytes).

## New Zealand

Rows `NZ-LEGISLATION-ADOPTED` and `NZ-LEGISLATION-CONSOLIDATED` (`pass`, statute: Copyright Act 1994 s 27) and `NZ-XRB-ADOPTED` (`permission requested`). Run on 2026-11-02.

legislation.govt.nz is blocked from the cloud address for `curl`: every page, including the copyright page, answers with an AWS WAF challenge.

```
curl -sS -L -o stat.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.legislation.govt.nz/secondary-legislation/pco-drafted/2009/285/en/2009-09-28/
```

Returned `202 0 text/html; charset=UTF-8` (empty body). Blocked from the cloud address: https://www.legislation.govt.nz/ . The orchestrator can try the same command from the laptop. What did work is headless Chromium, which passes the challenge; the file is then fetched with the browser's own cookies (Playwright as pre-installed in the session; `fetch_one.js`):

```
node fetch_one.js https://www.legislation.govt.nz/secondary-legislation/pco-drafted/2009/285/en/2009-09-28/ stat.html
```

with `fetch_one.js`:

```
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext();const p=await c.newPage();await p.goto('https://www.legislation.govt.nz/',{timeout:60000});await p.waitForTimeout(4000);const r=await c.request.get(process.argv[2],{timeout:120000});const body=await r.body();require('fs').writeFileSync(process.argv[3],body);console.log(r.status(),body.length,r.headers()['content-type']);await b.close()})()
```

Returned `200 450434 text/html; charset=utf-8`, Climate Change (Stationary Energy and Industrial Processes) Regulations 2009 as made. Two runs of this URL gave 450428 and 450434 bytes: the HTML carries a per-request token, so `fetched_sha256` in the records does not reproduce. The extracted text was identical in both runs.

Dated URLs: `/act/public/<year>/<number>/en/<date>/` and `/secondary-legislation/pco-drafted/<year>/<number>/en/<date>/`, with `<date>` a version date; `<date>/versions/?per_page=100` lists the versions (the newest is not in the list; it is the date in the `.pdf` link of the `latest/` page). The as-enacted text of an Act is the version dated its assent date. `text` is the contents of `<div id="legislation">` (whole instrument) or of the `<div class="part" id=...>` for a Part, with the contents table removed, block elements as line breaks, history notes kept. Parts are stored only when the text of the Part differs from the previous version; the record carries the date of the first version with that text.

The site rate-limits: about 20 requests in a few minutes brought a human-verification page (HTTP 405) for about three minutes, and a later slow run (one request per 25 seconds) ran into the 202 challenge again after about 30 requests.

### Stored (fetched 2026-11-02)

| Instrument | Row | Records |
|---|---|---|
| `nz-fmc-act-2013-part-7a` (Part 7A) | consolidated | 2022-10-27, 2024-10-27 |
| `nz-fsca-2021-39` | adopted | 2021-10-28 (as enacted, assent 2021-10-27) |
| `nz-fmc-climate-regs-2023-222` | adopted | 2023-10-02 (as made 2023-08-28) |
| `nz-ccra-zero-carbon-2019-61` | adopted | 2019-11-14 (as enacted, assent 2019-11-13) |
| `nz-ccra-2002-part-1b` | consolidated | 7 records, 2019-11-14 to 2025-12-17 |
| `nz-ccra-2002-part-4` | consolidated | 27 records, 2008-09-26 to 2026-09-04 |
| `nz-ets-stationary-energy-regs-2009-285` | adopted, consolidated | 25 records, 2009-09-28 (as made) to 2026-07-09 |

### Link only

- `nz-nzcs-1`, `nz-nzcs-2`, `nz-nzcs-3`: row `NZ-XRB-ADOPTED`, permission requested (the standards' own notice limits reuse to personal and non-commercial use; the XRB copyright page says there is no copyright in secondary legislation; the two conflict).
- `nz-ets-liquid-fossil-fuels-regs-2008-356`: row passes; the fetch got 4 of 11 versions before the WAF challenge returned (2008-09-29, 2010-01-01, 2010-10-01, 2011-12-05), so none stored.
- `nz-ets-waste-regs-2010-338` and `nz-ets-forestry-regs-2022-266`: row passes; the WAF challenge returned before any version was fetched.
- Not used: fma.govt.nz answers 403 with a Cloudflare challenge from the cloud address (blocked from the cloud address: https://www.fma.govt.nz/ ). legislation.govt.nz API (https://api.legislation.govt.nz) answers 401 "API key is required"; no key was requested.

## Saudi Arabia

GEL-07-10, run 2026-11-02. No row passes, so no recipe is proven and no text is stored: all three scope instruments are link only. Rows added: `SA-BOE-CONSOLIDATED`, `SA-UQN-ADOPTED`, `SA-CMA-ADOPTED`, `SA-SAUDIEXCHANGE-ADOPTED`, all `permission requested`.

Pass rows with a proven fetch: none. Link-only instruments and why:

- `sa-environment-law`, `sa-air-quality-regulation`, `sa-anti-commercial-fraud-law`: the Bureau of Experts site (`laws.boe.gov.sa`) refused the cloud address, and the Umm Al-Qura gazette terms bar scripted copying (below). Commencement dates were not read from an official page, so `in_force` is null.

Blocked from the cloud address (for the orchestrator to read from the laptop):

```
curl -sS -m 25 -A 'Mozilla/5.0' -o /dev/null -w '%{http_code}\n' https://laws.boe.gov.sa/
curl: (35) Recv failure: Connection reset by peer
```

Same answer for `https://laws.boe.gov.sa/BoeLaws/Laws/` and `https://www.boe.gov.sa/`. Chromium (Playwright `page.goto(url, {waitUntil: 'networkidle'})`) got HTTP 502 for all three. The agent proxy log showed `ws_closed_mid_exchange` for `laws.boe.gov.sa:443`. No request that works was found, so there is no browser recipe either. `https://www.saudiexchange.sa/`, the ESG guidelines page and the terms path answer HTTP 403 "Access Denied" (Akamai) to curl and to Chromium.

Umm Al-Qura gazette, `https://www.uqn.gov.sa/` (301 to www, then `200 text/html`, about 790 KB per page; plain `curl -L -A 'Mozilla/5.0'` works): the page `/terms-and-conditions` allows only personal non-commercial use and bars automated copying or extraction without prior written consent, so the row is `permission requested`. Only the terms page and the home page were fetched with a script; no decision page was read. Row `SA-UQN-ADOPTED` fingerprint method is in the row notes.

Capital Market Authority, `https://cma.gov.sa/`: pages are SharePoint pages, read with Playwright chromium after `networkidle` plus 2 s (curl returns a 1.2 KB shell for the terms path). `https://cma.gov.sa/en/Pages/terms.aspx` says the CMA owns the copyright and allows copying only for personal use or use within the user's organisation: `permission requested`. The green debt guideline PDF answers to curl (`200 7538737 application/pdf` at `https://cma.gov.sa/en/RulesRegulations/Regulations/Documents/Green_Social_Sustainability_Sustainability_Guidelines.en.pdf`) but is not stored.

### Languages

Arabic is the official language of the Saudi texts. English: the Bureau of Experts is the place a government translation would be served; it could not be opened, so whether it calls its English an official translation (statute basis) is unknown and no translation row exists. No English text from a law firm, exchange or news site is used.
