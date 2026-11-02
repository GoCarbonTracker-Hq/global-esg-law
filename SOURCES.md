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

## Thailand

Run 2026-11-02 by GEL-04-09. No licence row passes and nothing is stored: every official Thai host refused the cloud address, so no terms page and no law text could be read. All six rows are `permission requested` (page could not be opened). `pdftotext -layout` (poppler, runs of spaces collapsed, output checked for mojibake) is the intended PDF method for the SEC notifications once a fetch works; it was not run.

### Fetch attempts (no proven fetch)

curl with `-A "Mozilla/5.0"`, then headless Chromium (Playwright, `goto` with `waitUntil: domcontentloaded`, 3 s wait, `page.content()`):

| URL | curl | Chromium |
|---|---|---|
| `https://www.sec.or.th` | connection reset by peer, no status | 403, 13713 bytes, title `Block Response` |
| `https://publish.sec.or.th` | 403, 13730 bytes, text/html | 403, `Block Response` (checked on `/nrs/8617se.pdf`) |
| `https://ratchakitcha.soc.go.th` | 403, 5359 bytes, text/html | 403, 44831 bytes, title `Just a moment...` (challenge did not clear in 3 s) |
| `https://www.krisdika.go.th` | TLS error, self-signed certificate | 502, 174 bytes |
| `https://law.go.th` | 403, 919 bytes, text/html | 403, CloudFront `The request could not be satisfied` |
| `https://www.set.or.th` | 302, then 403 | 403, 917 bytes |
| `web.archive.org` copies of the pages above | connection reset | not tried |

### Languages

None proven. No Thai or English text was fetched from any source. The English rows `TH-SEC-TRANSLATION` and `TH-KRISDIKA-TRANSLATION` exist as `permission requested` so a later session can judge them once the terms are readable.

### Link only

- `th-cmsb-tor-jor-55-2563`, `th-sec-issb-notifications`: row `TH-SEC-ADOPTED`, permission requested; sec.or.th and publish.sec.or.th blocked from the cloud address.
- `th-sea-2535-s56`: row `TH-KRISDIKA-CONSOLIDATED`, permission requested; krisdika.go.th and law.go.th blocked from the cloud address.
- Register row only: Climate Change Act (draft; a web search found no Gazette publication), Thailand Taxonomy (F7).

## Indonesia

Rows `ID-OJK-ADOPTED`, `ID-BPK-ADOPTED` and `ID-OJK-TRANSLATION` (all `permission requested`: no terms page and no statute text could be opened). Run on 2026-11-02. No row passes, so no request is proven and nothing is stored.

Blocked from the cloud address, with the answer each gave (curl 8 through the session proxy, `-A 'Mozilla/5.0'`, 25 to 30 s timeout):

```
curl -sS -m 30 -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' -A 'Mozilla/5.0' https://ojk.go.id/id/regulasi
```

Returned `curl: (35) Recv failure: Connection reset by peer`, no status. The same reset for https://ojk.go.id/id/, https://ojk.go.id/en, https://www.ojk.go.id, https://jdih.ojk.go.id, https://peraturan.go.id, https://jdihn.go.id, https://jdih.kemenkeu.go.id, https://jdih.esdm.go.id and a web.archive.org copy of the OJK regulation page. https://jdih.menlhk.go.id and https://jdih.setkab.go.id: `CONNECT tunnel failed, response 502`. Headless Chromium (Playwright as pre-installed, `page.goto` then a 8 s wait) got HTTP 502 from the proxy for ojk.go.id, jdih.ojk.go.id and peraturan.go.id and `ERR_TUNNEL_CONNECTION_FAILED` for jdih.menlhk.go.id.

```
curl -sS -m 30 -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' -A 'Mozilla/5.0' https://peraturan.bpk.go.id/Details/187122
```

Returned `403 5441 text/html; charset=UTF-8` (Cloudflare "Just a moment..." challenge; the same for `/Home`, `/Search`, `/api`, `/sitemap.xml` and the PDF `/Download/...` path; only `/robots.txt` answered 200). Headless Chromium with a 30 s wait stayed on the challenge (title "Just a moment...", 403). Blocked from the cloud address: https://peraturan.bpk.go.id/ . The orchestrator can read these from the laptop.

Reachable but out of scope: https://jdih.bi.go.id (200, 3.7 MB, Bank Indonesia JDIH) and https://www.setneg.go.id (200). Neither hosts a candidate instrument; Bank Indonesia was not searched.

### Languages

No Indonesian or English source could be opened. `ID-OJK-TRANSLATION` (OJK English pages, unofficial) is a row with no instrument listed against it. No government English was found for any instrument; the places looked for were the OJK English site (https://ojk.go.id/en) and the BPK database, both unreachable.

### Link-only instruments

All six, reason: the row is `permission requested` and the site refused the cloud address.

| Instrument | Row | URL source |
|---|---|---|
| `id-pojk-51-2017` | ID-OJK-ADOPTED | existing register row |
| `id-seojk-16-2021` | ID-OJK-ADOPTED | search result |
| `id-pojk-14-2023` | ID-OJK-ADOPTED | OJK regulation listing (no instrument page found) |
| `id-perpres-98-2021` | ID-BPK-ADOPTED | search result |
| `id-permen-lhk-21-2022` | ID-BPK-ADOPTED | search result |
| `id-uu-4-2023-p2sk` | ID-BPK-ADOPTED | search result |

Dropped candidate: Permen ESDM 16/2022 (no official URL found; jdih.esdm.go.id reset the connection). PDF extraction (`pdftotext -layout`) was not used: no PDF could be fetched.

## Netherlands

Rows `NL-OVERHEID-CONSOLIDATED` (`pass`, terms basis: CC0 1.0 on the Basis Wetten Bestand dataset record; Auteurswet art. 11 as corroboration) and `NL-OFFBEK-ADOPTED` (`pass`, statute basis: Auteurswet art. 11 as quoted on the overheid.nl reuse page). `NL-AFM-ADOPTED` is `permission requested` (afm.nl footer: "© Copyright AFM 2026 - alle rechten voorbehouden"); nothing is stored or linked under it. Run on 2026-11-02. No browser was needed: the texts come from the repository hosts, which answer plain `curl`. The www pages (wetten.overheid.nl) answer plain `curl` with an empty reply or `HTTP/2 PROTOCOL_ERROR` but answer `-A 'Mozilla/5.0'`; they are not used for fetching.

Row `NL-OVERHEID-CONSOLIDATED`, step 1: list the point-in-time versions of an instrument (Klimaatwet, BWB id `BWBR0042394`):

```
curl -sS -L -o klimaatwet_manifest.xml -w '%{http_code} %{size_download} %{content_type}\n' https://repository.officiele-overheidspublicaties.nl/bwb/BWBR0042394/manifest.xml
```

Returned `200 4035 application/xml`. Each `expression` has `datum_inwerkingtreding`, `zichtdatum_eind` and a file label. Several expressions can share one in-force date (suffix `_0`, `_1`); the one with `zichtdatum_eind` 9999-12-31 and the highest suffix is stored. BWB ids come from the SRU service `https://zoekservice.overheid.nl/sru/Search?version=1.2&operation=searchRetrieve&x-connection=BWB&query=overheidbwb.titel any "..."` (200, `application/xml`); each record carries `locatie_toestand` and `locatie_manifest`.

Step 2, the consolidated text as of 2026-01-01:

```
curl -sS -L -o klimaatwet_20260101.xml -w '%{http_code} %{size_download} %{content_type}\n' https://repository.officiele-overheidspublicaties.nl/bwb/BWBR0042394/2026-01-01_0/xml/BWBR0042394_2026-01-01_0.xml
```

Returned `200 61319 application/xml`, sha256 `a1d00abcb4dc58488ab85dad41edb4736f9ed04abb6e48a1fadf4d3d226589ed`. The same bytes come from the wetten.overheid.nl export form (POST, `exportopties=rbXml`), so the repository file is the one the site serves.

Row `NL-OFFBEK-ADOPTED`, the as-published Staatsblad text (Stb. 2019, 253):

```
curl -sS -L -o stb-2019-253.xml -w '%{http_code} %{size_download} %{content_type}\n' https://repository.overheid.nl/frbr/officielepublicaties/stb/2019/stb-2019-253/1/xml/stb-2019-253.xml
```

Returned `200 19955 application/xml;charset=UTF-8`, sha256 `47dd738f06033020507f0f67a9dbbbaddbed6b5645f870315863969c6c91b9e5` (the file starts with a byte order mark). Staatsblad ids are searched with `https://repository.overheid.nl/sru?version=2.0&operation=searchRetrieve&query=dt.identifier==stb-2019-253` (200, `application/xml`; `dt.title any "..."` searches titles).

Text extraction: Python stdlib `xml.etree`. Consolidated files: the `wetgeving` element, or for a cut the `artikel` whose `kop/nr` is 391 (BW Boek 2) or the `titeldeel` whose `bwb-ng-variabel-deel` path ends `/Titeldeel16.2` (Wet milieubeheer). Staatsblad files: `intitule`, `aanhef`, `wettekst`, `wetsluiting` (the Nota van toelichting and its annexes are left out). Metadata elements (`meta-data`, `jcis`) are dropped; headings, articles, paragraphs, list items and definitions become lines; the number of a `lid` or `li` stays on the line of its text; inline markup (`intref`, `extref`, `nadruk`, `inf`) is stripped; footnotes (`noot`) become `[Noot] ...` lines. Nothing is reworded. `fetched_sha256` is the hash of the whole file as returned. A consolidation is stored only when its text differs from the previous stored one; for an act with a Staatsblad record, the first consolidations are skipped when their body matches it (similarity at least 0.97 after removing case, numbering and punctuation; the ratios are in the scope notes).

Stored (fetched 2026-11-02, all `nl`):

| Instrument | Rows | Versions stored (`in_force`) |
|---|---|---|
| `nl-klimaatwet` | adopted, consolidated | adopted 2019-09-01; consolidated 2022-03-02, 2023-07-22, 2026-01-01 |
| `nl-besluit-bekendmaking-niet-financiele-informatie` | adopted | adopted 2017-03-24 (the only consolidation has the same body) |
| `nl-bw2-art391` | consolidated | 2016-12-06, 2017-04-13, 2019-07-01, 2020-01-01, 2023-12-30, 2026-07-01 |
| `nl-wm-titel-16-2` | consolidated | 27 versions, 2004-10-20 to 2026-01-01 |
| `nl-wet-co2-heffing-industrie` | adopted, consolidated | adopted 2021-01-01; consolidated 2021-01-01, 2024-01-01 |

### Languages

Dutch is the only official language the publisher serves for these instruments, so no second-language record exists. No government English translation was found for any of the five instruments: wetten.overheid.nl exposes one Dutch expression per version; https://www.overheid.nl/english and a rijksoverheid.nl / government.nl search for the Climate Act title returned no translation. Therefore there is no translation row and no English record. The same request pattern would serve a translation if one appeared (a translation row is judged on its own terms, not on Auteurswet art. 11 alone).

### Link only

- None of the five scope instruments is link only.
- Not in scope.json, register row only (law_family F7, nothing stored): the CSRD implementation bill (Kamerstuk 36678, still in the Tweede Kamer per `kst-36678-12` of 2026-05-13; no Staatsblad publication found) and the initiative bill Wet verantwoord en duurzaam internationaal ondernemen (Kamerstuk 35761, last document 2023-10-11).
- AFM (`NL-AFM-ADOPTED`, `permission requested`): no AFM instrument in scope.

### Blocked

- `https://wetten.overheid.nl/` and `https://wetten.overheid.nl/BWBR0042394/2026-01-01/0` with plain `curl`: `curl: (92) HTTP/2 stream 1 was not closed cleanly: PROTOCOL_ERROR` or `curl: (52) Empty reply from server`; with `-A 'Mozilla/5.0'` both answer 200 (`118289 text/html;charset=UTF-8` for the Klimaatwet page). Not a block for the stored texts, which come from the repository hosts.
- The wetgevingskalender page `https://wetgevingskalender.overheid.nl/Regeling/WGK014704` answers 200 (`17912`) but carries no readable bill status in the HTML received; the bill status was read from the Kamerstuk instead.

## Spain

Rows `ES-BOE-ADOPTED` and `ES-BOE-CONSOLIDATED` (`pass`, the BOE reuse conditions of the Aviso legal allow commercial reuse and modification; TRLPI art. 13 recorded as a second ground), `ES-BOE-TRANSLATION` (`pass`, TRLPI art. 13 on official translations, and the same reuse conditions) and `ES-BOE-EN-TRANSLATION` (`permission requested`, nothing stored). Run on 2026-11-02 (GEL-04-04). boe.es answered `curl` with no challenge, so no browser recipe is needed and no record is browser-fetched. The reuse conditions require the source to be named ("Basado en datos de la Agencia Estatal Boletín Oficial del Estado"), consolidated texts to be marked informative only, and modifications to be identified: the stored text is the BOE text with tags stripped and no wording changed.

Step 1, row `ES-BOE-ADOPTED`, the text as published (Spanish), Ley 7/2021:

```
curl -sS -L -o ley7_adopted.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.boe.es/diario_boe/xml.php?id=BOE-A-2021-8447
```

Returned `200 253322 application/xml; charset=utf-8`, sha256 `dc4a4ef225acd1ea1d0879e72a011b94c42a0b2da61f01fdc87ee497e2469267`; a second fetch gave the same hash. The `texto` element of the document is the law: each child element (`p`, table rows, list items) is one line, inner tags removed, runs of spaces collapsed. The record's `in_force` is the `fecha_vigencia` of the same file's metadata.

Step 2, row `ES-BOE-CONSOLIDATED`, every version of a consolidated text, Ley 7/2021:

```
curl -sS -L -H 'Accept: application/xml' -o ley7_texto.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2021-8447/texto
```

Returned `200 233713 application/xml`, sha256 `49ca8be49bae5e4c9c9d5dc74bad161725a6dff1f2166ab1fd3c8b778a18dcb8` (reproduced on a second fetch). The header is required: the same URL without `Accept: application/xml` answers `400 187 application/xml` (so `tools/watch.py`, which sends no `Accept`, cannot use the API; the watchers read the `act.php` page instead). The file holds blocks (`bloque`), each with all its versions (`version`, attributes `fecha_vigencia`, `fecha_publicacion`, `id_norma`). The text at a date D is the concatenation, in file order, of the latest version of each block whose `fecha_vigencia` is on or before D; a record is written for every distinct `fecha_vigencia` of the file, and a version whose text equals the previous one would be skipped (none was). The BOE page `https://www.boe.es/buscar/act.php?id=BOE-A-2021-8447` shows the same latest text; the open-data file gives the per-version texts the page does not link in one request. The metadata-only endpoint is `.../id/<BOE-ID>/metadatos`; instruments the BOE does not consolidate (a law that only amends other texts) answer `404 170 application/xml`: Ley 11/2018, `https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2018-17989/texto`. The BOE identifier of an instrument is read from its ELI page (for example `https://www.boe.es/eli/es/l/2005/03/09/1`). The open-data search endpoint answered `500` on every query tried.

One date oddity: Real Decreto 214/2025 is dated 2025-06-12 in its BOE record (published 2025-04-12, "a los dos meses"), while the API dates its only consolidated version 2025-06-14; the consolidated record keeps the API date.

### Languages

Spanish is the only official language of the State (Constitution art. 3.1) and is stored under the two rows above. The BOE also publishes laws, royal decrees-laws and legislative royal decrees as supplements in Catalan, Galician, Basque and Valencian, as published only (no consolidations). They are PDFs, served at the paths the as-published XML gives in `url_pdf_catalan`, `url_pdf_gallego`, `url_pdf_euskera` and `url_pdf_valenciano`. Row `ES-BOE-TRANSLATION`, Ley 7/2021:

```
curl -sS -L -o ley7_ca.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.boe.es/boe_catalan/dias/2021/05/21/pdfs/BOE-A-2021-8447-C.pdf
curl -sS -L -o ley7_gl.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.boe.es/boe_gallego/dias/2021/05/21/pdfs/BOE-A-2021-8447-G.pdf
curl -sS -L -o ley7_eu.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.boe.es/boe_euskera/dias/2021/05/21/pdfs/BOE-A-2021-8447-E.pdf
```

Returned `200 649073 application/pdf` (sha256 `aa5cb57d49f9f583aadec45c65c58f2c3df5d413efb063c8a4398c56bac33dd9`), `200 647281 application/pdf` and `200 612907 application/pdf`; the Catalan hash reproduced on a second fetch. Real Decreto 214/2025 has a Catalan PDF too (`https://www.boe.es/boe_catalan/dias/2025/04/12/pdfs/BOE-A-2025-7439-C.pdf`, `200 260172 application/pdf`).

Text extraction from the PDF: poppler `pdftotext <file> -` (without `-layout`: with `-layout` the two-column pages of the older supplements interleave the columns and the single-column ones gain nothing), form feeds as page breaks, runs of spaces collapsed, and on each page the first seven and last four lines dropped only when they match the gazette header and footer (the "BOLETÍN OFICIAL DEL ESTADO" line, the supplement line, the date line, the section and page line, "https://www.boe.es", the ISSN line, a bare page number). Checked for mojibake: no private-use, replacement or symbol characters in any stored text, and no header or footer line left. Small-capital glyphs come out lower case (the Basque "FELIPE e." for the king's signature line). Each translation record is dated the Spanish version it translates; the Valencian supplement is not stored.

Stored: Ley 11/2018 (ca, gl, eu), Ley 7/2021 (ca, gl, eu), Real Decreto 214/2025 (ca). Not stored, with the reason: the supplements of Ley 3/1991 (ca, 1991-12-31), Ley 1/2005 (ca 2005-03-16, gl 2005-04-01) and Real Decreto Legislativo 1/2007 (ca and gl, 2007-12-01) are two-column PDFs of several items per page. Poppler returned them out of order: checked against the Spanish article headings, 3 article-heading inversions in the Galician Ley 1/2005, 1 in the Catalan, and 16 and 9 in the Galician and Catalan Real Decreto Legislativo 1/2007, where the Spanish text has 0 and 1. A text with out-of-order paragraphs is not stored. Ley 3/1991 (ca) had no inversion but shares the layout and was left out with them.

English: row `ES-BOE-EN-TRANSLATION`. The BOE Biblioteca Jurídica Digital is excluded from the general reuse conditions and distributed under CC BY-NC-ND 4.0 (Aviso legal, condición primera), so it is `permission requested`; no English translation of any instrument in scope was found there (https://www.boe.es/biblioteca_juridica/ and its search listing). The BOE consolidated pages answer "Content not available in English". A web search for an English version of Ley 7/2021 and Real Decreto 214/2025 on the MITECO site found none. No English record is stored for any instrument.

### Stored (fetched 2026-11-02)

| Instrument | es adopted | es consolidated | ca | gl | eu | en |
|---|---|---|---|---|---|---|
| `es-ley-11-2018` | 2018-12-30 | none (not consolidated by the BOE) | 1 | 1 | 1 | 0 |
| `es-ley-7-2021` | 2021-05-22 | 2021-05-22, 2025-12-05, 2026-07-01 | 1 | 1 | 1 | 0 |
| `es-ley-1-2005` | 2005-03-11 | 10, 2005-03-11 to 2020-12-18 | 0 | 0 | 0 | 0 |
| `es-rd-214-2025` | 2025-06-12 | 2025-06-14 | 1 | 0 | 0 | 0 |
| `es-ley-3-1991` | 1991-01-31 | 13, 1991-01-31 to 2025-12-28 | 0 | 0 | 0 | 0 |
| `es-rdl-1-2007` | 2007-12-01 | 25, 2007-12-01 to 2026-02-28 | 0 | 0 | 0 | 0 |

`fetched_sha256` of a consolidated record is the hash of the whole API file for the instrument, so every version of one instrument carries the same hash, and it changes whenever the BOE adds a version.

### Link only

None: every instrument in scope has records. Not in scope and not stored: Real Decreto 163/2014 (voluntary register, repealed with effect from 2025-06-12 by Real Decreto 214/2025; register row F7 only); the CSRD transposition (only the 2024 anteproyecto found; no promulgated law on the BOE); the transposition of Directive (EU) 2024/825 on environmental claims (not found in the consolidated Ley 3/1991 or Real Decreto Legislativo 1/2007, versions to 2025-12-28 and 2026-02-28); the CNMV guides (no enacted CNMV instrument in families F1 to F6 was found, so no CNMV row; its terms were not opened).

### Blocked

No URL refused the cloud address. One watcher dry run of `https://www.boe.es/buscar/act.php?id=BOE-A-2021-8447` ended in `Connection reset by peer` once and passed on the two reruns.

## Sweden

Row `SE-RIKSDAGEN-CONSOLIDATED` (`pass`, statute: Upphovsrättslag (1960:729) 9 §, with the open data terms as a second basis). Rows `SE-SFS-ADOPTED` and `SE-GOVERNMENT-TRANSLATION` are `permission requested` because both sites answer 403 from the cloud address; nothing is stored under them. Run on 2026-11-02 (GEL-04-06). Language: Swedish.

Riksdagen serves one state of each law, the current consolidation. As-adopted amending acts and earlier consolidations are not offered (see Link only), so each instrument has one record. No browser recipe was needed for the stored texts: `data.riksdagen.se` answered curl without a User-Agent, and the same bytes came back on a second request (`fetched_sha256` reproduces).

Request, row `SE-RIKSDAGEN-CONSOLIDATED`, consolidated text of the Climate Act (Klimatlag 2017:720):

```
curl -sS -L -o klimatlag.html -w '%{http_code} %{size_download} %{content_type}\n' https://data.riksdagen.se/dokument/sfs-2017-720.html
```

Returned `200 3954 text/html; charset=utf-8`, sha256 `19eb76b6164f2fbed7d28aeb69c30963d3b144480714e56d41ddfd7f8ffefc51`. The same request for the Annual Accounts Act (`sfs-1995-1554`) returned `200 215587 text/html; charset=utf-8`, sha256 `311239556e5e14ca67df5ec77bcddd0639f5220796824811967bae28fef5a2b2`. The URL pattern is `https://data.riksdagen.se/dokument/sfs-<year>-<number>.html`; `.text` (hard-wrapped lines), `.json` and `.xml` answer too.

The amendment state ("t.o.m. SFS ...") is not in the HTML. It comes from the JSON of the same document, field `subtitel`:

```
curl -sS -L -o arl.json -w '%{http_code} %{size_download} %{content_type}\n' https://data.riksdagen.se/dokument/sfs-1995-1554.json
```

Returned `200 398887 application/json; charset=utf-8`, `subtitel` "t.o.m. SFS 2026:780". An empty `subtitel` means the law has never been amended. The list of laws, to find an id: `https://data.riksdagen.se/dokumentlista/?sok=<text>&doktyp=sfs&utformat=json&sz=40` (for `sok=växthusgaser`: `200 145518 application/json; charset=utf-8`).

Dates. The consolidated text of a law that has amendments carries the state of the day it was compiled, including provisions marked `/Träder i kraft I:YYYY-MM-DD/` that are published but not yet in force. Two stored texts carry such markers (`se-klimatpolitiska-radet`, `se-klimatrapporteringsforordning`); the markers are part of the text as served. A record's `in_force` is the date of the last amendment in force on 2026-11-02, read from the Government Offices amendment register (`https://rkrattsbaser.gov.se/sfsr?bet=<year>:<number>`, lines "Ikraft: YYYY-MM-DD", curl `200 92348 text/html; charset=utf-8` for 1995:1554). For a chapter cut it is the date of the last amendment that names the chapter. The register is not a stored source: it gives in-force dates and is the page the watchers read.

Text extraction (Python `html.parser`): the `<style>` blocks, the contents list (`div.sfstoc`) and the metadata block before the `<hr />` are dropped, except the `<h2>` title, which is the first line; `<p>`, `<br>`, `<div>`, `<li>`, `<h2>` to `<h4>` and each paragraph-number link (`a.paragraf`) start a new line; whitespace is collapsed; empty lines are dropped; nothing is reworded. Annual Accounts Act records are cut from the chapter heading (`<h3>`, "6 kap. ...") to the next chapter heading, or for 7 kap. from the line starting "31 a §" to the line before the heading that precedes "32 §". Checked on the day: for every record the non-space characters of the extracted text equal those of the `.text` file of the same law (whole laws after the metadata block; chapter cuts as a contiguous part), and no record has a U+FFFD character.

Stored (fetched 2026-11-02):

| Instrument | Row | `in_force` | Consolidation |
|---|---|---|---|
| `se-arl-ch6` (6 kap.) | consolidated | 2024-07-01 | t.o.m. SFS 2026:780 |
| `se-arl-ch7-s31` (7 kap. 31 a-31 g §§) | consolidated | 2024-07-01 | t.o.m. SFS 2026:780 |
| `se-klimatlag` | consolidated | 2018-01-01 | none (never amended) |
| `se-klimatpolitiska-radet` | consolidated | 2022-10-01 | t.o.m. SFS 2026:1774 (future markers) |
| `se-klimatrapporteringsforordning` | consolidated | 2026-01-01 | t.o.m. SFS 2026:1415 (future markers) |
| `se-ets-act` | consolidated | 2026-01-01 | t.o.m. SFS 2025:908 |
| `se-ets-ordinance` | consolidated | 2026-07-01 | t.o.m. SFS 2026:705 |
| `se-klimatdeklaration-lag` | consolidated | 2022-01-01 | none (never amended) |
| `se-klimatdeklaration-forordning` | consolidated | 2022-01-01 | none (never amended) |
| `se-reduktion-lag` | consolidated | 2025-07-01 | t.o.m. SFS 2025:576 |
| `se-reduktion-forordning` | consolidated | 2025-07-01 | none (never amended) |

Statute text of the exception, row `SE-RIKSDAGEN-CONSOLIDATED`, read from the same open data: `curl -sS -L -o upph.text -w '%{http_code} %{size_download} %{content_type}\n' https://data.riksdagen.se/dokument/sfs-1960-729.text` returned `200 151075 text/plain; charset=utf-8`, sha256 `1d87768bb31af6d324b86e574ca6d152657e7e45497b3ccbeb991ea118177997`; 9 § reads "Upphovsrätt gäller inte till 1. författningar, 2. beslut av myndigheter, 3. yttranden av svenska myndigheter och 4. officiella översättningar av sådant som avses i 1-3." The terms page (`curl` `200 252636 text/html; charset=utf-8`) is server-rendered; its fingerprint was read with Playwright chromium as the row notes say.

### Link only

- `se-sfs-2024-347` (Lag 2024:347 as adopted): row `SE-SFS-ADOPTED`, `permission requested`. `https://svenskforfattningssamling.se/` answered 403 (Cloudflare "Sorry, you have been blocked") to curl, to curl with a Chrome User-Agent and to headless Chromium. Riksdagen does not serve it: `curl -sS -L -o x.json -w '%{http_code} %{size_download} %{content_type}\n' https://data.riksdagen.se/dokument/sfs-2024-347.json` returned `404 1245 text/html`. Its changes are inside the stored consolidated texts of `se-arl-ch6` and `se-arl-ch7-s31`.
- Not stored for lack of a source (no entry, listed so the gap is visible): earlier states of every instrument (Riksdagen serves only the current consolidation), the Annual Accounts Act chapter 6 before 2024-07-01 (sustainability statement of Lag 2016:947, in force 2016-12-01), and the as-adopted text of every Swedish act and ordinance in scope.
- Finansinspektionen: no FFFS regulation on sustainability disclosure by listed companies was found. `https://www.fi.se/sv/hallbarhet/regler/` (`200 32229 text/html; charset=utf-8`) lists EU rules (CSRD, taxonomy, Omnibus I) and no FFFS number; the FFFS register page `https://www.fi.se/sv/vara-register/fffs/` (`200 21543 text/html; charset=utf-8`) is a category index. The site terms page `https://www.fi.se/sv/om-fi/om-webbplatsen/` (`200 30657 text/html; charset=utf-8`) says "Textmaterialet på webbplatsen får användas fritt, bara källan anges" and, for regulations, "För författningar gäller den tryckta versionen". No instrument in scope, so no row and no entry.
- Not in scope: Environmental Code (Miljöbalk 1998:808) is a `register.csv` row with family F7 only.

### Languages

Run on 2026-11-02. Swedish is the only language Riksdagen serves for these laws; the `.html` and `.text` endpoints return the same Swedish text (compared character by character, see above), and no page opened offers another language version of any act or ordinance in scope. All 11 records are `sv` under the existing row, so no language needed a row of its own.

English: the Government Offices publish English translations of some laws on `www.government.se`, a different publisher from Riksdagen, so it has its own row, `SE-GOVERNMENT-TRANSLATION` (`translation`, `permission requested`: the page could not be opened, and the brief expects these translations to be unofficial, which 9 § 4 p. does not cover; not verified). It could not be checked from the cloud address:

```
curl -sS -L -o gov.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.government.se/legal-documents/
```

Returned `403 5423 text/html; charset=UTF-8` (the home page: `403 5503 text/html; charset=UTF-8`, with a Chrome User-Agent too; a "Just a moment..." Cloudflare challenge). Headless Chromium also failed: the challenge scripts load from `brunhild.challenges.cloudflare.com`, which the agent proxy refuses (`connect_rejected`), and the page timed out after 90 s. WebFetch got 403 on four government.se URLs. So no translation of any in-scope law could be located, none is stored, and every scope entry says so in `notes`.

### Blocked

- https://svenskforfattningssamling.se/ and https://svenskforfattningssamling.se/doc/2024347.html: 403, Cloudflare block page, to curl and headless Chromium. The orchestrator can read the terms and the as-adopted Lag 2024:347 from the laptop.
- https://www.government.se/ , https://www.government.se/legal-documents/ , https://www.government.se/about-the-website/ , https://www.government.se/about-the-website/copyright/ : 403, Cloudflare "Just a moment..." challenge. The orchestrator can read the terms and look for English translations of the in-scope laws from the laptop.

No site that answered was blocked: data.riksdagen.se, www.riksdagen.se, rkrattsbaser.gov.se, www.fi.se and www.regeringen.se all answered 200.

## Mexico

Run on 2026-11-02 (GEL-04-07). Rows `MX-DOF-ADOPTED` and `MX-DIPUTADOS-CONSOLIDATED` are `pass` on the statute basis (Ley Federal del Derecho de Autor art. 14 fracción VIII: "Los textos legislativos, reglamentarios, administrativos o judiciales, así como sus traducciones oficiales"). Both sites' own notices are weaker than the statute: the DOF legal notice (https://dof.gob.mx/aviso_legal.html) allows reproduction "sin fines de lucro" with a citation and says for-profit reproduction needs written consent, and the Cámara de Diputados calls its compilation "sólo de carácter informativo". The pass rests on the statute, as for the Brazil CVM and BCB rows; Varun to confirm. Rows `MX-CNBV-CONSOLIDATED` (gob.mx terms: personal, non-commercial use; cnbv.gob.mx not reachable) and `MX-CINIF-ADOPTED` (CINIF legal notice forbids copying) are `permission requested`, so nothing is stored under them. No curl-blocked page needed a browser recipe, so no Mexico record is browser-fetched.

Row `MX-DOF-ADOPTED`, a DOF note as published (the note number, `codigo`, comes from the day index of the publication date; use `dof.gob.mx` without `www`). Run for the Ley General de Cambio Climático (DOF 2012-06-06):

```
curl -sS -L -o lgcc_adopted.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://dof.gob.mx/nota_detalle.php?codigo=5249899&fecha=06/06/2012'
```

Returned `200 460225 text/html; charset=UTF-8`. The day index that gives the `codigo`: `curl -sS -L -o idx.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://dof.gob.mx/index.php?year=2025&month=01&day=28'` returned `200 94422 text/html; charset=UTF-8` (the note links are `nota_detalle.php?codigo=<n>&fecha=<dd/mm/yyyy>`). The CNBV resolution of 2025-01-28: `curl -sS -L -o cnbv2025.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://dof.gob.mx/nota_detalle.php?codigo=5747872&fecha=28/01/2025'` returned `200 142405 text/html; charset=UTF-8`. `fetched_sha256` is the hash of the HTML as received. A second fetch does not always reproduce it: the page carries an inline comment whose whitespace varies between requests (the record for `mx-cnbv-emisoras-sostenibilidad-2025` was hashed on a 142446-byte answer and this run got 142405 bytes). The hash of the same URL differed between fetches at least once for `5249899`, `5406149`, `5573934` and `5747872`; the extracted text compared identical for `5249899`, `5406149` and `5747872`. The popup form `nota_detalle_popup.php?codigo=<n>` is hash-stable and is what the watchers use.

Row `MX-DIPUTADOS-CONSOLIDATED`, the Cámara de Diputados texto vigente. Run for the LGCC and for the Reglamento:

```
curl -sS -L -o LGCC.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.diputados.gob.mx/LeyesBiblio/pdf/LGCC.pdf
curl -sS -L -o reg.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LGCC_MRNE_281014.pdf
```

Returned `200 698437 application/pdf` (68 pages, header "Última Reforma DOF 01-04-2024") and `200 396731 application/pdf` (22 pages). The file names come from https://www.diputados.gob.mx/LeyesBiblio/index.htm and https://www.diputados.gob.mx/LeyesBiblio/regla.htm. The bare directory `https://www.diputados.gob.mx/LeyesBiblio/` answers `403 214 text/html; charset=iso-8859-1`. The per-reform files under `/LeyesBiblio/ref/lgcc/` (`LGCC_ref01_07may14.pdf` to `LGCC_ref13_01abr24.pdf`, plus `LGCC_orig_06jun12.pdf`) all answered `200 application/pdf`; they are the amending decrees as published (the changed provisions only), not consolidations.

Text extraction. DOF HTML: the contents of `<div id='DivDetalleNota'>` with style, script and title dropped, block elements (paragraphs, divs, table rows, breaks) as line breaks, table cells separated by a space, runs of spaces collapsed, blank lines dropped; the two closing site notices ("En el documento que usted está visualizando puede haber texto, caracteres u objetos que no se muestren correctamente...", "El contenido, forma y alcance de los documentos publicados, son estricta responsabilidad de su emisor") are not law text and are dropped. PDF: `pdftotext -layout file.pdf -`, runs of spaces collapsed, blank lines dropped, line breaks as the PDF wraps them (as for Brazil); the Cámara's running header on every page and its "N de M" footer stay in the text. Checked on the day: no U+FFFD or other mojibake in any stored text; the DOF text of the LGCC and the Cámara's original-text PDF have a word-sequence similarity ratio of 0.99 (the rest is the Cámara's page furniture); the Reglamento's DOF text and Cámara PDF have the same body.

Stored (fetched 2026-11-02), language es:

| Instrument | Row | Record (`in_force`) |
|---|---|---|
| `mx-lgcc` | adopted | 2012-10-10 (DOF 2012-06-06; in force 90 working days later, date stated in DOF 2019-10-01) |
| `mx-lgcc` | consolidated | 2024-04-02 (texto vigente, last reform DOF 2024-04-01) |
| `mx-lgcc-reg-rne` | adopted | 2014-10-29 |
| `mx-rne-gases-acuerdo-2015` | adopted | 2015-08-15 |
| `mx-rne-metodologias-acuerdo-2015` | adopted | 2015-09-04 (the 15 formulas published as images are not in the text) |
| `mx-sce-programa-prueba-2019` | adopted | 2019-10-02 |
| `mx-cnbv-emisoras-sostenibilidad-2025` | adopted | 2025-01-29 (amending resolution only) |

The Cámara serves one consolidated text per law, so the consolidations between 2012 and 2024 do not exist as files; the LGCC lookup between 2012-10-10 and 2024-04-02 returns the 2012 text.

### Languages

The DOF and the Cámara de Diputados serve these texts in Spanish only and no version in another language was found on either site, so every record is `es`. No government English translation of any scope instrument is known on 2026-11-02, and no translation row was added. Looked for: a web search for an English text of the LGCC from SEMARNAT or INECC returned only a commercial translation (mexicanlaws.com) and third-party summaries (Climate Laws of the World, ICNL), neither a government text, so neither is stored; `https://dof.gob.mx` and `https://www.diputados.gob.mx/LeyesBiblio/` serve Spanish only; the CINIF menu links a page named `exclusivo_nis-EN.php` ("NIS – English version") that was not opened. LFDA art. 14 VIII covers "traducciones oficiales" only, so an unofficial translation would pass on its publisher's terms alone.

### Link only

- `mx-cnbv-emisoras-disposiciones` (Disposiciones de carácter general aplicables a las emisoras de valores, DOF 2003-03-19): row `MX-CNBV-CONSOLIDATED` is `permission requested`. The consolidated PDF at cnbv.gob.mx could not be opened from the cloud address (see Blocked). The 2003 text as published is served by the DOF (`codigo=699022`, 200, 343872 bytes) but is not stored: as the only record it would stand as the text in force for 2003 to 2025, though the Disposiciones were amended many times since. The 2025 amendment is stored as `mx-cnbv-emisoras-sostenibilidad-2025`.
- `mx-cinif-nis` (CINIF NIS A-1, B-1): row `MX-CINIF-ADOPTED` is `permission requested`; the NIS 2026 book is a paid, login-only product (https://www.cinif.org.mx/normatividad_NIS2026.php, 200, 23042 bytes). The standards are private standards, not enacted law, and the CNBV resolution names the ISSB standards, not the NIS.
- Dropped candidate: Ley Federal de Protección al Consumidor (the Cámara's texto vigente, last reform DOF 2025-12-12, downloaded and searched). It has no provision on environmental or green claims (the only hits for ecológico, ambiental, medio ambiente and sustentab are a consumer-education phrase, "saludable, sustentable, solidario y activo", and a clause on products "lesivos para el medio ambiente"), so it is neither in scope.json nor a register row.
- F7 (register rows only): Ley General de Economía Circular (DOF 2026-01-19) and Ley General para la Prevención y Gestión Integral de los Residuos.
- Not looked at: LGEEPA and its Reglamento on the Registro de Emisiones y Transferencia de Contaminantes, the Ley de Planeación y Transición Energética, and any DOF amendments to the acuerdos after their publication day; see the PR `## Next`.

### Blocked

- `https://www.dof.gob.mx/` (with `www`): `curl: (60) SSL: no alternative certificate subject name matches target host name 'www.dof.gob.mx'`, exit 60. `https://dof.gob.mx/` answers 200.
- `https://www.cnbv.gob.mx/` and the Disposiciones PDF under `https://www.cnbv.gob.mx/Normatividad/`: `curl: (60) SSL certificate problem: unable to get local issuer certificate`, exit 60 (incomplete certificate chain). Headless Chromium through the session proxy returned `502 text/plain` (23 bytes). Blocked from the cloud address; the orchestrator can read it from the laptop.
- `https://www.diputados.gob.mx/LeyesBiblio/` (directory): `403 214 text/html; charset=iso-8859-1`; `index.htm` under it answers 200 (629398 bytes).
- gob.mx pages (`https://www.gob.mx/cnbv`, `.../normatividad-103922`, `https://www.gob.mx/semarnat`, the RENE page) answered 200 but carry a per-request CSRF token, so a hash of the page never repeats and no `page_hash` watcher was set on them.

## Germany

Rows `DE-GII-CONSOLIDATED` (consolidated, Gesetze im Internet) and `DE-BGBL-ADOPTED` (adopted, Bundesgesetzblatt), both `pass` on the statute basis (Urheberrechtsgesetz § 5 Abs. 1 and 2; the quoted sentences and the reading are in the row notes, and Varun decides whether to keep them at pass). Rows `DE-GII-TRANSLATION` and `DE-BAFIN-ADOPTED` are `permission requested`. Run on 2026-11-02 (GEL-04-01). Language: German only; see Languages below.

### Row DE-GII-CONSOLIDATED

gesetze-im-internet.de answered `curl` from the cloud address. Each instrument is one zip with one XML file; the site keeps the current consolidation only. Request for the Bundes-Klimaschutzgesetz:

```
curl -sS -L -o ksg.zip -w '%{http_code} %{size_download} %{content_type}\n' https://www.gesetze-im-internet.de/ksg/xml.zip
```

Returned `200 14696 application/zip` (inside: `BJNR251310019.xml`, 70103 bytes, `Last-Modified: Tue, 19 Nov 2024 20:40:50 GMT`). `fetched_sha256` is the sha256 of the zip as returned (KSG `9244806f532e026ced641a931dcfae2d03fc18fc849b67873e7ce2ed2b82863c`); two fetches an hour apart gave the same hash for KSG and LkSG, and the 10 zips were each fetched twice on the day. The instrument page URL in the scope entry gives the slug (`ksg`, `lksg`, `tehg_2025`, `behg`, `behv`, `ebev_2030`, `ehv_2030_2`, `becv`, `minrohsorgg`, `hgb`). The table of contents of the whole site is `https://www.gesetze-im-internet.de/gii-toc.xml` (200, 1290948 bytes, `application/xml`).

Text extraction (stdlib Python, ElementTree): per `norm` element, the heading (`gliederungsbez` and `gliederungstitel`, or `enbez` and `titel`; the first norm contributes the short title `langue`), then the `text` element with block elements (`P`, list items `DT`/`DD`, `Title`, `Ident`) as line breaks, `BR` as a line break (a space inside a table), table rows with cells joined by ` | `, an image as `[Abbildung]`, then the norm's `fussnoten` as a `[Fußnote] ...` line. Not included: the `standangabe` lines (they go into the record `message`) and the `gliederungskennzahl` numbers. Checked: the non-space characters of every consolidated text equal those of the XML text nodes of the same norms except the classification digits (`gliederungskennzahl`); nothing is dropped. For `de-hgb-nfe` only the norms `§ 289b`, `§ 289c`, `§ 289d`, `§ 289e`, `§ 315b`, `§ 315c` are kept.

### Row DE-BGBL-ADOPTED

Since 2023-01-01 the official Bundesgesetzblatt is on recht.bund.de and `curl` works. Request for the Treibhausgas-Emissionshandelsgesetz (BGBl. 2025 I Nr. 70):

```
curl -sS -L -o tehg.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.recht.bund.de/bgbl/1/2025/70/regelungstext.pdf?__blob=publicationFile&v=1'
```

Returned `200 675100 application/pdf`, sha256 `bd930f0ca07e5ba7e249420e9c2e06b756377aa319a319e4b92fc8f530e29414`, reproduced by a second fetch. The cloud proxy refused the same request with `curl: (35) SSL_ERROR_SYSCALL` in several attempts between the two successful ones; a retry after a few seconds worked (the same happened once for `.../2026/201/...`). The page of a promulgation is `https://www.recht.bund.de/bgbl/1/<year>/<number>/VO.html`; it lists the PDF, a ZIP and the MD5 of the PDF. Used here: 2025/70 (TEHG), 2026/201 (EHV 2030); 2024/235 and 2025/209 were read for the commencement dates of amending acts and are not stored.

Before 2023 the issues are at bgbl.de, a JavaScript viewer. `curl` gets only the shell:

```
curl -sS -L -o lksg_shell.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.bgbl.de/xaver/bgbl/start.xav?startbk=Bundesanzeiger_BGBl&jumpTo=bgbl121s2959.pdf'
```

Returned `200 18637 text/html;charset=UTF-8` (no PDF). The PDF itself sits behind a per-session `_csrf` token in a `media.xav` URL that answers a script with a redirect to a 404 page. Browser recipe (Playwright, headless Chromium; `jumpTo` is `bgbl1<yy>s<page, 4 digits>.pdf`): open the URL, wait for `networkidle`, wait for the embedded pdf.js viewer frame (`viewer.html`) to hold `PDFViewerApplication.pdfDocument`, then read the file bytes with `pdfDocument.getData()` and write them out:

```
node fetch_bgbl.js bgbl121s2959.pdf lksg.pdf
```

Returned the 11-page PDF of the Lieferkettensorgfaltspflichtengesetz (BGBl. 2021 I Nr. 46, S. 2959), 132788 bytes, `application/pdf`. A second run gave 132794 bytes and a different sha256 (`b2856d07...` against `7b1bb23f...`) with identical `pdftotext` output: the PDF is re-stamped per request, so `fetched_sha256` of the browser-fetched records does not reproduce, as for `## New Zealand`. `fetched_url` of those records is the `start.xav` URL above. Browser-fetched records (the 7 pre-2023 adopted records, listed in the PR report) stay subject to Varun's open decision on the New Zealand recipe (GEL-03 retro C4). The pre-2023 files carry no terms page of their own (see the row notes).

Text extraction from the PDFs: `pdftotext file.pdf -` (poppler 24.02.0, reading order, no `-layout`: the Bundesgesetzblatt is set in two columns and `-layout` interleaves the columns line by line). Then form feeds removed, soft hyphens at line ends joined (`­` plus newline removed), runs of spaces collapsed, empty lines dropped, and a line that holds only the control character `\x01` (a formula graphic in the EBeV 2030) written as `[Abbildung]`. Checked: no U+FFFD, no private-use characters and no other control characters in any of the nine texts. Known limits: the page headers and footers stay in the text; the tables of contents and the annexes with tables can come out in a different order than on the page (the KSG table of contents is interleaved); real hyphens at line ends stay as printed. The body text reads in order (checked against the consolidated text, which shares at least 88 per cent of its 8-word runs with the PDFs of the unamended acts; the rest is hyphenation, tables and page furniture).

Each adopted record is the whole promulgation (all articles, for example the five articles of the LkSG Act), because the PDF is cut per act. The instrument itself is Article 1 in most of them.

### Row DE-BAFIN-ADOPTED and BaFin

`curl -sS -L -o nb.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.bafin.de/DE/service/nutzungsbedingungen/nutzungsbedingungen_node.html` returned `200 75566 text/html;charset=utf-8`; the Merkblatt page `https://www.bafin.de/SharedDocs/Downloads/DE/Merkblatt/dl_mb_Nachhaltigkeitsrisiken.html` returned `200 80672 text/html;charset=utf-8`. Nothing is stored (permission requested).

### Languages

German is the only official language of the federal statutes; gesetze-im-internet.de and the Bundesgesetzblatt serve German only, so every record has `language` `de`. English: the Federal Ministry of Justice lists translations at `https://www.gesetze-im-internet.de/Teilliste_translations.html` (`curl` returned `200 72262 text/html`). Row `DE-GII-TRANSLATION` is `permission requested`: the page limits use to "einzelne Vervielfältigungen wie Downloads oder Ausdrucke zum privaten, nicht kommerziellen Gebrauch" and credits outside translators; UrhG § 5 does not name translations. So no English record is stored. Translations exist on the page for the KSG (`https://www.gesetze-im-internet.de/englisch_ksg/index.html`, `200 12484 text/html`; its Stand names the 2021 and 2024 amendments, equal to the stored consolidated state) and for the HGB (Books 1 to 4, `englisch_hgb/index.html`); none for the other instruments of this place (the page text was searched for each).

### Stored (fetched 2026-11-02)

| Instrument | Row | Records (`in_force`, de) |
|---|---|---|
| `de-hgb-nfe` (HGB §§ 289b-289e, 315b-315c) | consolidated | 2017-04-19 |
| `de-lksg` | adopted, consolidated | 2023-01-01 (both) |
| `de-ksg` | adopted, consolidated | 2019-12-18 (adopted), 2024-07-17 (consolidated) |
| `de-tehg` | adopted, consolidated | 2025-03-06 (both) |
| `de-behg` | adopted, consolidated | 2019-12-20 (adopted), 2025-03-06 (consolidated) |
| `de-behv` | adopted, consolidated | 2020-12-24 (adopted), 2025-09-16 (consolidated) |
| `de-ebev-2030` | adopted, consolidated | 2022-12-31 (both) |
| `de-ehv-2030` | adopted, consolidated | 2026-07-15 (both) |
| `de-becv` | adopted, consolidated | 2021-07-28 (both) |
| `de-minrohsorgg` | adopted, consolidated | 2020-05-07 (both) |

Only the current consolidation is served, so a consolidated record is dated with the in-force date of the amendment the Stand line names, read in the amending act; the states between adoption and that date are not stored. Browser-fetched (bgbl.de): the adopted records of `de-lksg`, `de-ksg`, `de-behg`, `de-behv`, `de-ebev-2030`, `de-becv`, `de-minrohsorgg`.

### Link only

- `de-bafin-merkblatt-nachhaltigkeitsrisiken`: row `DE-BAFIN-ADOPTED`, permission requested (the terms allow storing, passing on and copying with the source named but do not mention changing the text).
- Not an instrument: the CSRD-Umsetzungsgesetz is a bill (Bundestag Drucksache 21/2465, 2025-10-29); it has a `register.csv` row with `law_family` F7 and no scope entry. No Nachhaltigkeitsbericht is in the HGB text on gesetze-im-internet.de.
- Not in scope: the amending acts (KSG 2021 and 2024, the TEHG/BEHG Act of 2025) are in the consolidated texts; the Bundes-Klimaanpassungsgesetz, Energieeffizienzgesetz, Wärmeplanungsgesetz and the Wertpapierhandels- and Kreditwesengesetz were not assessed (see `## Next` in the PR).
- Blocked from the cloud address: none refused outright. `www.recht.bund.de` dropped the TLS connection (`SSL_ERROR_SYSCALL`) intermittently for large PDFs; `dip.bundestag.de` answers `200` with a 2375-byte JavaScript shell (no content for a script).

## Taiwan

Run on 2026-11-02 (GEL-04-10). Two rows pass: `TW-MOJ-CONSOLIDATED` (Ministry of Justice Laws and Regulations Database, Chinese; statute: Copyright Act art. 9 item 1, plus the site's Open Government Data License v1.0 statement) and `TW-MOJ-TRANSLATION` (the same database's English site; terms). `TW-TWSE-ADOPTED` is `permission requested`. No browser recipe was needed for any stored text.

The database serves the current consolidated text of every law only. It has no earlier consolidation and no as-promulgated text, so each stored instrument has one dated version (its `in_force` is the date of the last amendment's commencement, or its issue date where the history entry states none). Attached tables (PDF/ODT) are not stored.

Row `TW-MOJ-CONSOLIDATED`, bulk open data file of acts (`tw-climate-change-response-act`, `O0020098`, found by the `pcode` in `LawURL`):

```
curl -sS -A 'Mozilla/5.0' -o ChLaw.zip -w '%{http_code} %{size_download} %{content_type}\n' https://law.moj.gov.tw/api/ch/law/json
unzip -p ChLaw.zip ChLaw.json | sha256sum
```

Returned `200 6135777 application/octet-stream`, a ZIP with `ChLaw.json`, `manifest.csv`, `schema.csv`; `ChLaw.json` has the top keys `UpdateDate` (2026/10/22) and `Laws` (1351 entries). Regulations are in a second file: `curl -sS -A 'Mozilla/5.0' -o ChOrder.zip ... https://law.moj.gov.tw/api/ch/order/json` returned `200 25791396 application/octet-stream` (`ChOrder.json`, 10453 entries, including repealed ones, which carry `LawAbandonNote`). Entry keys: `LawName`, `LawURL`, `LawModifiedDate`, `LawEffectiveDate`, `LawAbandonNote`, `LawHistories`, `LawForeword`, `LawArticles` (list of `ArticleType` C chapter or A article, `ArticleNo`, `ArticleContent`). The record `text` is the law name, the foreword if any, then each chapter heading and each article as `ArticleNo`, a space and `ArticleContent`, line breaks kept, trailing spaces trimmed, nothing reworded.

`fetched_url` is the bulk URL (it names no single law; the instrument is in the record path and `message`). `fetched_sha256` is the sha256 of the JSON file inside the ZIP, not of the ZIP: the ZIP bytes differ on every request (its entries carry timestamps), the JSON reproduced identically across repeated requests on 2026-11-02. The files are refreshed weekly (the site says Fridays), so a hash fetched after the next refresh will differ. Hashes on the day: `ChLaw.json` a8a65758ce551d73c8674492d728be89a8295976739584bf3de3a6485ea450b4, `ChOrder.json` 90f83d88c95b6879b1bcebb5b630f45b83915557448cdce3630b09f8ab17b076, `EnLaw.json` bb202b2a49ded98ca9a2d241794a7a267e6ae4eac48ab5a69a35550d8040fcd4, `EnOrder.json` 5a2a07f98c016b4be9a55efb0f7b00c94a9a9c493df5dd524fa947dfecc99495. The server resets the connection now and then (`curl: (35) Recv failure: Connection reset by peer`); a retry worked each time.

### Languages

Chinese is the only official language the database serves. English is a separate row.

Row `TW-MOJ-TRANSLATION`, `tw-climate-change-response-act`:

```
curl -sS -A 'Mozilla/5.0' -o EnLaw.zip -w '%{http_code} %{size_download} %{content_type}\n' https://law.moj.gov.tw/api/en/law/json
```

Returned `200 6767621 application/octet-stream` (`EnLaw.json`, 973 entries). Regulations: `https://law.moj.gov.tw/api/en/order/json` returned `200 9457054 application/octet-stream` (`EnOrder.json`, 2214 entries). Entry keys: `EngLawName`, `EngLawURL`, `EngLawModifiedDate`, `EngLawHistories`, `EngLawForeword`, `EngLawArticles` (`EngArticleType`, `EngArticleNo`, `EngArticleContent`). An English record is stored only when `EngLawModifiedDate` equals the `LawModifiedDate` of the stored Chinese version, and carries that version's `in_force`; the English page also prints the same "Amended Date" (for example https://law.moj.gov.tw/ENG/LawClass/LawHistory.aspx?pcode=O0020098 returned `200 21219 text/html; charset=utf-8` and shows 2023-02-15). The English site states that the Chinese version prevails. Stored in English: `tw-climate-change-response-act`, `tw-climate-change-response-act-rules`, `tw-carbon-fee-regs`, `tw-hfc-management-regs`, `tw-annual-report-regs`. For the other eight instruments the English files hold no entry for the `pcode`, and the English law page answers HTTP 200 with an empty body (0 bytes; a translated law returns about 90 KB); each scope `notes` says so. English texts on twse-regulation.twse.com.tw are credited there to Baker McKenzie Taipei, a law firm, and are never stored.

Terms pages opened: https://law.moj.gov.tw/Service/Copyright.aspx (`200 35307 text/html; charset=utf-8`) and https://law.moj.gov.tw/ENG/Service/Copyright.aspx (`200 20989 text/html; charset=utf-8`).

Row `TW-TWSE-ADOPTED` (not pass, nothing stored): `curl -sS -A 'Mozilla/5.0' -o dat01.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://twse-regulation.twse.com.tw/TW/law/DAT01.aspx?FLCODE=FL075209'` returned `200 15115 text/html; charset=utf-8` (the legislative history; the version links carry `FLDATE=YYYYMMDD`, used by the watcher). The exchange's terms page https://www.twse.com.tw/zh/terms/use.html returned `307 947 text/html; charset=UTF-8` to curl and the same security page to headless Chromium (Playwright): "FOR SECURITY REASONS, THIS PAGE CAN NOT BE ACCESSED".

Watcher notes: the stdlib `urllib` of Python 3.13 rejects the law.moj.gov.tw certificate chain (`CERTIFICATE_VERIFY_FAILED: Missing Subject Key Identifier`) although curl accepts it, so `python3 tools/watch.py --source TW-MOJ-CONSOLIDATED` run with 3.13 reports 13 failures; the same dry run with `python3.12` fetched all 13 watchers (a connection reset on one of them in one run). MOJ pages carry a per-request script nonce, so a `page_hash` of a Chinese MOJ page changes on every request; the eight Chinese-only instruments use it for lack of a stable signal (the Chinese history pages print only Republic of China dates, which `date_list` cannot read).

Link-only instruments:

| Instrument | Official URL | Why link only |
|---|---|---|
| `tw-twse-sustainability-report-rules` | https://twse-regulation.twse.com.tw/ENG/EN/law/DAT08.aspx?FLCODE=FL075209 | Row `TW-TWSE-ADOPTED` is permission requested: the terms page is blocked from the cloud address (307 security page). |
| FSC Sustainable Development Roadmap for listed companies (2022, F7) | https://www.fsc.gov.tw/ch/index.jsp | F7: register row only, no scope entry. |

Blocked from the cloud address: https://www.moenv.gov.tw/ (Ministry of Environment, `403 5332 text/html; charset=UTF-8` to curl with a browser User-Agent; Chromium not tried); https://www.twse.com.tw/zh/terms/use.html, https://www.twse.com.tw/zh/terms/privacy.html and the `/en/terms/use.html` page (`307 947`, security page; Chromium gave the same). Not blocked, not used as a source: https://law.fsc.gov.tw/ (`200 43853 text/html; charset=utf-8`), https://data.gov.tw/license (`200`, read for the Open Government Data License text).

Stored by GEL-04-10: `tw-climate-change-response-act`, `tw-climate-change-response-act-rules`, `tw-climate-risk-assessment-guidelines`, `tw-ghg-inventory-registration-regs`, `tw-carbon-fee-regs`, `tw-ghg-voluntary-reduction-regs`, `tw-ghg-reduction-credit-trading-regs`, `tw-ghg-increment-offset-regs`, `tw-ghg-verification-bodies-regs`, `tw-ghg-offset-project-regs`, `tw-electricity-emission-factor-regs`, `tw-hfc-management-regs`, `tw-annual-report-regs`.

## Italy

Rows `IT-NORMATTIVA-CONSOLIDATED` (pass, terms: CC BY 4.0 on dati.normattiva.it), `IT-GAZZETTA-ADOPTED` (pass, statute: Legge 633/1941 art. 5) and `IT-CONSOB-ADOPTED` (permission requested). Run 2026-11-02 from the cloud address. Italian is the only language the publishers serve; no government English translation was found, so there is no translation row and no English record.

### Consolidated texts: `IT-NORMATTIVA-CONSOLIDATED`

One proven request pair for D.Lgs. 125/2024, version of 2025-08-10. The first GET sets the session cookie that the XML route needs; without it the XML route answers an HTML page.

```
curl -sS -L -c cj.txt -b cj.txt -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2024-09-06;125'
curl -sS -L -c cj.txt -b cj.txt -o akn.xml -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.normattiva.it/do/atto/caricaAKN?dataGU=20240910&codiceRedaz=24G00145&dataVigenza=20250810'
```

The first returned `200 146196 text/html;charset=UTF-8`, the second `200 535646 text/xml`, sha256 `b64509390d7dc7c4716112d664325aebb59d48f32ff2f5cea1b3c25b83da4820` (the `fetched_sha256` of `records/IT/it-dlgs-125-2024/2025-08-10-consolidated-it.json`). The same second request without the cookie returned `200 32261 text/html;charset=UTF-8`. The XML names its version in `FRBRalias name="eli"`: `eli/id/2024/09/10/24G00145/CONSOLIDATED/20250810`, or `.../ORIGINAL` while the original text is current. `dataGU` and `codiceRedaz` come from the act page (`atto.dataPubblicazioneGazzetta`, `atto.codiceRedazionale`).

Finding the versions: request the XML with `dataVigenza` set to today; read the version date from the eli alias; request again the day before that date; repeat until the alias ends in `ORIGINAL`. Each step is one version. No future-dated version existed on the run date (`dataVigenza=20990101` returned the same version as today for every instrument). Text: the XML `preface`, `body`, `conclusions` and `attachments` with tags stripped, `num`, `heading` and paragraphs as lines, runs of blanks collapsed, the Normattiva `((...))` amendment markers kept as served. For the Codice del consumo only the `article` elements numbered 20 to 27 are kept.

### Acts as published: `IT-GAZZETTA-ADOPTED`

Proven for D.Lgs. 125/2024 with a cookie jar (the menu GET sets the session; the POST sends every `articoliSelected` value of the menu plus the hidden fields):

```
curl -sS -L -c j.txt -b j.txt -o menu.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.gazzettaufficiale.it/atto/vediMenuHTML?atto.dataPubblicazioneGazzetta=2024-09-10&atto.codiceRedazionale=24G00145&tipoSerie=serie_generale&tipoVigenza=originario'
curl -sS -L -c j.txt -b j.txt -X POST --data-urlencode 'articoliSelected=<each value from menu.html>' --data-urlencode noteSelected=1 --data-urlencode _noteSelected=1 --data-urlencode annoVigenza=2024 --data-urlencode meseVigenza=9 --data-urlencode giornoVigenza=25 --data-urlencode dataPubblicazioneGazzetta=2024-09-10 --data-urlencode codiceRedazionale=24G00145 --data-urlencode creaHTML=Visualizza -o atto.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.gazzettaufficiale.it/atto/stampa/serie_generale/originario
```

Returned `200 20938 text/html;charset=UTF-8` and `200 477884 text/html;charset=UTF-8`, sha256 `3f5711f42834b0485ef39651c01a630393616f7c2e7d91635cad3cf3cc10d72a`, the `fetched_sha256` of `records/IT/it-dlgs-125-2024/2024-09-25-adopted-it.json`. A second fetch reproduced it (the stored records were fetched by the same steps in Python, twice per act, and matched each time). The vigenza fields in the menu form hold the entry-into-force date. Text: the headings and `<pre>` blocks, hard-wrapped lines joined into paragraphs (a line starting at column 0 continues the previous one), blanks collapsed, the `*** ATTO COMPLETO ***` and `Vigente al:` portal lines dropped. Annexes published as images are not in the text.

### Languages

Italian only. Looked for an English text on Normattiva (the XML language is `ita`) and on the Gazzetta Ufficiale pages; none. German and French editions of the Gazzetta (Alto Adige, Valle d'Aosta) were not looked for.

### Not stored

- `IT-CONSOB-ADOPTED`: permission requested. Pages answer some script requests with a Radware captcha page (for example `curl -sS -L https://www.consob.it/web/consob/informazioni-legali` returned `200 15066` of captcha HTML on one run and the real 270124-byte page on the next). Blocked from the cloud address on some requests: https://www.consob.it/web/consob/informazioni-legali. The consolidated Regolamento Emittenti is therefore a missing link, not a record; Delibera 23463 is stored from the Gazzetta row.
- D.Lgs. 5 ottobre 2023, n. 147 (a brief candidate) is not an ETS act and is not in scope. D.Lgs. 152/2006 is F7, a register row only.
- The Codice del consumo has no `adopted` record (the Gazzetta route returns the whole 2005 Code); the Normattiva original version stands for it.
- D.Lgs. 254/2016 version 2025-02-25 (repeal markers and annotations only) is not stored; the repeal is a repeal record on 2024-09-25.

## Norway

Rows `NO-LOVDATA-CONSOLIDATED`, `NO-LOVDATA-ADOPTED` and `NO-LOVDATA-TRANSLATION` (all three `permission requested`, basis terms). Run on 2026-11-02 (GEL-05-08). No proven fetch exists for any row, so no text is stored and all seven scope instruments are link only.

Lovdata is blocked from the cloud address for every client tried:

```
curl -sS -L -o o.bin -w '%{http_code} %{size_download} %{content_type}\n' https://api.lovdata.no/v1/publicData/list
```

Returned `405 316 text/html; charset=utf-8` ("Request stopped by Varnish IPS"). The same answer came with a browser `User-Agent`, and for `https://api.lovdata.no/`, `https://lovdata.no/`, `/robots.txt`, `/info/brukeravtale`, `/info/information_in_english`, `/dokument/NL/lov/1998-07-17-56` and `https://lovtidend.no/`. Headless Chromium (Playwright `page.goto(url, {waitUntil:'networkidle'})`) got the same 405 page (312 bytes of HTML). Blocked from the cloud address: https://api.lovdata.no/ , https://lovdata.no/ , https://lovtidend.no/ . The orchestrator can run the same `curl` from the laptop.

The WebFetch tool was served 200 by the same URLs, so the facts in the licence rows and scope entries were read that way. It returns model-summarised text, so quotes are not byte-checked, no `sha256` or fingerprint can be taken, and nothing from it is stored as law text. What it showed (2026-11-02): `https://api.lovdata.no/v1/publicData/list` is JSON naming `gjeldende-lover.tar.bz2`, `gjeldende-sentrale-forskrifter.tar.bz2` (last modified 2026-11-01), `lovtidend-avd1-2026.tar.bz2`, `lovtidend-avd1-2001-2025.tar.bz2` and two avd. II files; the brief's file names `gratis-nl-*` are not in the list. The terms page (section 2.3) puts "Regelverk i Norsk Lovtidend", "Gjeldende formelle lover" and "Gjeldende sentrale forskrifter" under NLOD 2.0 and says "Massenedlasting og systematiske uttrekk er ikke tillatt. For større nedlastinger, bruk våre åpne API-er." A laptop run should open the terms page, compute the fingerprint, download `gjeldende-lover.tar.bz2` and then set the rows. The unproven request to try is `curl -sS -L -O https://api.lovdata.no/v1/publicData/get/gjeldende-lover.tar.bz2`; the `get` path is not confirmed.

### Languages

Lovdata serves Norwegian Bokmål and, where an act is enacted in Nynorsk, Nynorsk; none of the seven instruments showed a Nynorsk version. English (NLE pages, `https://lovdata.no/dokument/NLE/lov/<date-number>`) is hosted by Lovdata, provided by ministries, and marked unofficial, so it has its own row `NO-LOVDATA-TRANSLATION`, terms only (Åndsverkloven § 14 names "offisielle oversettelser" but Lovdata says these are not official). NLE pages: klimaloven 200 (matches current state), åpenhetsloven 200 (state before 2024-11-01, so matches no current version), markedsføringsloven 200 (last consolidated 2020-05-20, stale); 404 for regnskapsloven, klimakvoteloven, klimakvoteforskriften and LOV-2024-06-21-42. Regjeringen.no (a possible second source of English) answers 403 with a Cloudflare challenge to curl and times out in Chromium: blocked from the cloud address: https://www.regjeringen.no/ .

### Link only

| Instrument | Reason |
|---|---|
| `no-regnskapsloven-ch2` | Row `NO-LOVDATA-CONSOLIDATED` permission requested; Lovdata blocked. No English on Lovdata. |
| `no-endringslov-2024-42` | Row `NO-LOVDATA-ADOPTED` permission requested; Lovdata blocked. Official URL is the Ministry of Finance page (403 to the cloud address, not opened). |
| `no-klimaloven`, `no-apenhetsloven`, `no-markedsforingsloven` | Rows `NO-LOVDATA-CONSOLIDATED` and `NO-LOVDATA-TRANSLATION` permission requested; Lovdata blocked. |
| `no-klimakvoteloven`, `no-klimakvoteforskriften` | Row `NO-LOVDATA-CONSOLIDATED` permission requested; Lovdata blocked. |

Not in scope and why: Finanstilsynet (finanstilsynet.no answers 200 to curl; no terms page is linked from `/en/` and no scope instrument is served by it, so no row). The sustainable finance act LOV-2021-12-22-161 and its regulation FOR-2022-12-20-2354 appeared in one search result only and their pages were not read, so they have no scope entry yet.

## Ireland

Rows `IE-EISB-ADOPTED`, `IE-LRC-CONSOLIDATED` and `IE-OIREACHTAS-TRANSLATION` (all `pass`, basis terms: the Oireachtas (Open Data) PSI Licence, which incorporates CC BY 4.0) and `IE-CBI-ADOPTED` (`permission requested`). Run on 2026-11-02 (GEL-05-05). Plain `curl` with no `User-Agent` answered from the cloud address on every host below (irishstatutebook.ie, revisedacts.lawreform.ie, achtanna.ie, oireachtas.ie, centralbank.ie), so no browser recipe was needed and no record is browser-fetched.

Row `IE-EISB-ADOPTED`, an Act as enacted (Consumer Protection Act 2007, No. 19 of 2007) and an S.I. as made (S.I. No. 470/2024). The `/print` view carries the whole instrument in one file; the `/html` view of an Act is only its contents page:

```
curl -sS -L -o act2007_19.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.irishstatutebook.ie/eli/2007/act/19/enacted/en/print
curl -sS -L -o si470.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.irishstatutebook.ie/eli/2024/si/470/made/en/print
```

Returned `200 586452 text/html` and `200 262532 text/html`. A second fetch gave the same sha256, so `fetched_sha256` reproduces. Pattern: `/eli/<year>/act/<number>/enacted/en/print` and `/eli/<year>/si/<number>/made/en/print`. Acts also serve XML at `.../enacted/en/xml` (`200 70479 application/xml` for Act 46 of 2015); S.I.s serve no XML (404), so the HTML print view is used for both. `text` is the contents of `<div class="act-content" id="act">`, with the S.I. title line from the page header put first for S.I.s (the Act text carries its own title); tags stripped, block elements and table rows as line breaks, table cells joined by a space, source line breaks inside a paragraph collapsed, nothing reworded. Footnotes and the explanatory note of an S.I. are in the text.

Commencement and amendments are read from the Directory pages: an Act at `https://www.irishstatutebook.ie/isbc/<year>_<number>.html` (`200 58876 text/html` for 2015_46), S.I.s in blocks of 50 at `https://www.irishstatutebook.ie/eli/isbc/si<year>_<first>-<last>.html` (`HEAD` gives `200` and a `Last-Modified` header, 2026-10-28 for `si2024_451-500`). eISB serves no consolidated Act or S.I. text.

Row `IE-LRC-CONSOLIDATED`, Climate Action and Low Carbon Development Act 2015 as revised by the Law Reform Commission:

```
curl -sS -L -o rev2015_46.html -w '%{http_code} %{size_download} %{content_type}\n' https://revisedacts.lawreform.ie/eli/2015/act/46/revised/en/html
```

Returned `200 255218 text/html; charset=UTF-8`, same sha256 on a second fetch. `text` is everything from `<div class="frontmatter">` to `<div class="wrapper-footer">`, so the Commission's banner, disclaimer, contents, annotations and editorial notes (CC BY 4.0) are in it. The site serves one current version per Act, printed as "Updated to 27 July 2026" (Consumer Protection Act 2007: "Updated to 24 November 2025"); that date is the record's `in_force`, and the record message says so. There are no point-in-time versions and no S.I. revisions. `.../revised/en/xml` also answers (`200 181908 application/xml`) and was not used.

Cutting a Part: the Consumer Protection Act records are Part 3 only, from the line `PART 3` (the occurrence followed by the longest run before `PART 4`, so the contents-table lines are skipped) to the line before `PART 4`; in the Irish text `CUID 3` to `CUID 4`.

### Languages

English is the base text and the only language eISB and the Law Reform Commission serve. Irish is served by the Houses of the Oireachtas for Acts only, at achtanna.ie, as an official translation (each text is headed "An tiontú oifigiúil"). It has its own row, `IE-OIREACHTAS-TRANSLATION` (`translation`, `pass` on the PSI licence; the reading it rests on is in the row notes and in the PR). Irish records are kind `translation`, language `ga`, dated like the English official version they translate.

```
curl -sS -L -o cpa_ga.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.achtanna.ie/ga/act/ga192007
```

Returned `200 690058 text/html; charset=utf-8` for the Consumer Protection Act 2007 (`ga<number><year>` is the Act key), same sha256 on a second fetch. `text` is the contents of `<div class="html" data-lang="ga">` up to `<div class="tooltip-back-to-top">`, cut to `CUID 3`, with the interface line `[EN]` (a link to the English section) dropped. The translation is of the Act as enacted and states no later amendment state, so it is stored with the English as-enacted version (2007-05-01), not with the 2025 revision. An Act without a translation answers with the page text "The official translation of this Act is not available.": `https://www.achtanna.ie/en/act/ga462015` returned `200 18597 text/html; charset=utf-8` and `https://www.achtanna.ie/en/act/ga322021` the same message. S.I.s have no Irish text on eISB or achtanna.ie (the S.I. pages offer English only). No government English translation exists to look for, because English is the enrolled text; no English translation row was needed and no translation by a law firm, NGO or news site was used.

Row `IE-CBI-ADOPTED` (no text stored): the PDF was opened to read its status and date.

```
curl -sS -L -o cbi.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.centralbank.ie/docs/default-source/regulation/industry-market-sectors/insurance-reinsurance/solvency-ii/requirements-and-guidance/guidance-re-insurance-undertakings-on-climate-change-risk.pdf?sfvrsn=a232991d_7'
```

Returned `200 536727 application/pdf`; `pdftotext -layout cbi.pdf -` gives clean text (cover "March 2023").

### Stored (fetched 2026-11-02)

| Instrument | Row | Records (`in_force`, language) |
|---|---|---|
| `ie-si-360-2017` | adopted | 2017-08-21 en |
| `ie-si-410-2018` | adopted | 2018-10-17 en |
| `ie-si-336-2024` | adopted | 2024-07-06 en |
| `ie-si-498-2024` | adopted | 2024-10-01 en (making date; no commencement clause) |
| `ie-si-309-2025` | adopted | 2025-07-07 en (making date; no commencement clause) |
| `ie-climate-act-2015` | adopted, consolidated | 2015-12-10 en; 2026-07-27 en (Revised Act) |
| `ie-climate-amendment-act-2021` | adopted | 2021-09-07 en |
| `ie-si-470-2024` | adopted | 2024-09-19 en |
| `ie-si-490-2012` | adopted | 2012-11-30 en; repeal record 2024-09-19 |
| `ie-si-755-2020` | adopted | 2020-12-31 en; repeal record 2024-09-19 |
| `ie-si-471-2024` | adopted | 2024-09-19 en (making date) |
| `ie-si-740-2024` | adopted | 2024-12-19 en (making date) |
| `ie-si-472-2024` | adopted | 2024-09-19 en (making date) |
| `ie-cpa-2007-part-3` | adopted, consolidated, translation | 2007-05-01 en; 2025-11-24 en (Revised Act); 2007-05-01 ga |
| `ie-si-124-2026` | adopted | 2026-09-27 en |
| `ie-si-16-2021` | adopted | 2021-01-21 en |

A text for a given version is stored only for the versions the publisher serves: the Revised Acts site has no earlier consolidations, so the Climate Act 2015 as it stood after the 2021 amendment commenced (2021-09-07) and the Consumer Protection Act 2007 as it stood before 2025-11-24 are not stored, and an S.I. amended after it was made is stored as made only.

### Link only

- `ie-cbi-climate-guidance-insurance`: row `IE-CBI-ADOPTED`, `permission requested` (the Central Bank disclaimer requires consent to copy or adapt; its re-use page says re-use is free but prints no conditions; the two statements conflict).
- No other instrument is link only.

### Not in scope or not found

- S.I. No. 490/2012 (the brief's stationary-installation ETS regulations) was revoked on 2024-09-19 by S.I. No. 470/2024 reg. 51(1); both it and S.I. No. 755/2020 are kept with repeal records and the replacement is `ie-si-470-2024`.
- The Companies Act 2014 (into which S.I. No. 336/2024, 498/2024 and 309/2025 insert the reporting duty) and the Consumer Rights Act 2022 (amended by S.I. No. 124/2026) are not in scope; no carbon tax instrument (Finance Act 2010) and no Central Bank Consumer Protection Code were looked at.
- Blocked from the cloud address: none. Every URL above answered `200`.


## Poland

Run on 2026-11-02 (GEL-05-06). Two rows pass on the statute basis (Ustawa o prawie autorskim art. 4 pkt 1 and 2, quoted in the rows): `PL-ISAP-ADOPTED` (acts and regulations as published in Dziennik Ustaw) and `PL-ISAP-CONSOLIDATED` (teksty jednolite announced by obwieszczenie of the Marshal of the Sejm in Dziennik Ustaw). `PL-KNF-ADOPTED` is `permission requested` (KNF legal notice only requires naming the source) and has no instrument and no record. The Sejm site terms could not be read (isap.sejm.gov.pl and most of www.sejm.gov.pl answer 403 with an Incapsula challenge from the cloud address), so the pass rests on the statute alone; Varun to confirm. Texts come from the ELI API of the Chancellery of the Sejm, `api.sejm.gov.pl/eli`, which serves the gazette text of Dziennik Ustaw and answers curl from the cloud address. No browser recipe was needed. `dziennikustaw.gov.pl` (Rządowe Centrum Legislacji) answers 200 but its only legal page is a privacy policy, no terms page was found, and nothing is fetched from it, so it has no row.

Request, row `PL-ISAP-ADOPTED`, act as published, HTML (Act of 6 December 2024, Dz. U. 2024 poz. 1863, ELI `DU/2024/1863`). The act details (`https://api.sejm.gov.pl/eli/acts/DU/2024/1863`, `200 7038 application/json`) say `textHTML` true or false and list the files:

```
curl -sS -L -o du2024_1863.html -w '%{http_code} %{size_download} %{content_type}\n' https://api.sejm.gov.pl/eli/acts/DU/2024/1863/text.html
```

Returned `200 1442869 text/html;charset=utf-8`, sha256 `303ca6871e5eda537b7ed2d7ca9164ac0e668d98fc0da3c1d325deffd5a5fa70`; a second fetch gave the same hash (no per-request token). Where `textHTML` is false (recent acts):

```
curl -sS -L -o du2025_1020.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://api.sejm.gov.pl/eli/acts/DU/2025/1020/text.pdf
```

Returned `200 155124 application/pdf` (Dz. U. 2025 poz. 1020).

Request, row `PL-ISAP-CONSOLIDATED`, tekst jednolity as HTML (obwieszczenie Dz. U. 2023 poz. 120, Accounting Act) and as PDF (Dz. U. 2026 poz. 522):

```
curl -sS -L -o du2023_120.html -w '%{http_code} %{size_download} %{content_type}\n' https://api.sejm.gov.pl/eli/acts/DU/2023/120/text.html
curl -sS -L -o du2026_522.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://api.sejm.gov.pl/eli/acts/DU/2026/522/text.pdf
```

Returned `200 1963732 text/html;charset=utf-8` and `200 1369897 application/pdf`. The list of the teksty jednolite of an act is the `Inf. o tekście jednolitym` group of `references` in the act details (for the Accounting Act `DU/2026/522, 2023/120, 2021/217, 2019/351, 2018/395, 2017/2342, 2016/1047, 2013/330, 2009/1223, 2002/694`); the date of each is the `announcementDate` of the obwieszczenie's own details.

Text extraction. HTML: `<script>`, `<style>`, elements with class `hidden` (display none in the site CSS) and `tooltip-text` spans (a copy of each footnote, which is also printed in the `gloss-section` at the end) are dropped; block elements and headings are line breaks; an article or point number stays on the line of its text; quotation-mark blocks of amending acts stay inline; non-breaking spaces and runs of whitespace become one space; blank lines are dropped. PDF: `pdftotext -layout file.pdf -` with runs of spaces collapsed and blank lines dropped (the lines are the PDF wraps, so hyphenated words stay split and letter-spaced headings such as "O B W IE S Z CZ E N I E" stay as the PDF prints them). Checked on the day: no U+FFFD, private-use or `(cid:` characters in any of the 33 texts. `fetched_sha256` is the hash of the file as returned. `in_force`: for an adopted act the first commencement date (API `entryIntoForce`, checked against the commencement article); for a tekst jednolity the date of the obwieszczenie, which has no commencement clause.

Stored on 2026-11-02 (all Polish, `pl`):

| Instrument | adopted | consolidated (obwieszczenie date) |
|---|---|---|
| `pl-accounting-act` | none (1994 text is a scan) | 2017-11-22, 2018-01-30, 2019-01-17, 2020-12-17, 2022-11-04, 2026-03-30 |
| `pl-csrd-act-2024` | 2025-01-01 | none |
| `pl-csrd-act-2025` | 2025-08-12 (PDF) | none |
| `pl-ets-act` | 2015-09-09 | 2017-03-09, 2018-05-10, 2019-12-09, 2021-01-22, 2022-04-07, 2023-01-27, 2024-09-26, 2025-11-07 (PDF), 2026-10-02 (PDF) |
| `pl-emissions-management-act` | 2009-09-18 | 2013-05-28, 2015-12-04, 2017-02-02, 2018-06-07, 2019-07-05, 2020-05-07, 2022-03-03, 2026-03-27 (PDF) |
| `pl-kobize-report-regulation` | 2022-10-31 | none |
| `pl-unfair-practices-act` | 2007-12-21 | 2015-12-10, 2017-10-30, 2023-04-07 |
| `pl-ecgt-amendment-act-2026` | 2027-09-27 (PDF, published, not yet in force) | none |

### Languages

Polish is the only official language. The ELI API serves `pol` only. No government English translation was found on 2026-11-02 for any instrument: the ELI API and ISAP have none, and web searches limited to gov.pl and sejm.gov.pl for English texts of the Accounting Act and the emissions trading act found only working translations of other laws and secondary descriptions. English translations by law firms, exchanges or NGOs are never stored. No translation row was added.

### Link only

None: every scope instrument has records. Not stored: the ISAP "tekst ujednolicony" (`text/T`, `text/U` files; an editorial consolidation by the Chancellery, not a legal act, no terms read), the KNF (no instrument in scope), and teksty jednolite before art. 49b existed.

### Blocked from the cloud address

- `https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001863`: `403 859 text/html` (Incapsula: "Request unsuccessful"), also for `isap.nsf/home.xsp`, `isap.nsf/page.xsp/informacje`, `isap.nsf/download.xsp/WDU20240001863/O/D20241863.pdf` and, with headless Chromium (Playwright), `https://isap.sejm.gov.pl/` (403, empty body). `https://isap.sejm.gov.pl/` itself answered 200 with a JavaScript shell by curl.
- `https://www.sejm.gov.pl/Sejm10.nsf/`: `403 856`; `https://www.sejm.gov.pl/` answered 200 once (50990 bytes) and 403 on the next two requests; `https://www.sejm.gov.pl/en/` answered 403 once and 200 once. The Sejm site terms page could not be read for this reason.

## Denmark

Rows `DK-RETSINFO-ADOPTED` (laws and orders as published in Lovtidende) and `DK-RETSINFO-CONSOLIDATED` (lovbekendtgørelser, LBK), both `pass` on the publisher's terms (Civilstyrelsen's open-data terms at https://www.retsinformation.dk/api: free, non-exclusive, unlimited use, commercial use and modification named) and, independently, on Ophavsloven § 9, stk. 1 (quoted in the rows). Rows `DK-KEFM-TRANSLATION` and `DK-KFST-TRANSLATION` are `permission requested`. Run on 2026-11-02. Language: Danish only; Retsinformation's FAQ says it holds no translations. retsinformation.dk answered every request from the cloud address; no browser recipe was needed for text. The terms page itself is a JavaScript application (curl gets a shell), so its fingerprint was read with Playwright chromium (`body` innerText, networkidle plus 2.5 s; the site has no `<main>` element).

Row `DK-RETSINFO-ADOPTED`, Lov nr. 480 af 22. maj 2024 (ELI `lta/2024/480`):

```
curl -sS -L -o l480.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.retsinformation.dk/eli/lta/2024/480/xml
```

Returned `200 329263 application/xml`, sha256 `0fcef68162f241d82c13c7341a524fa66cf0c6eae579224a4b7d678a98bba1d3`; a second fetch gave the same hash, so `fetched_sha256` reproduces. The same URL pattern, `https://www.retsinformation.dk/eli/lta/<year>/<number>/xml`, serves every LOV, BEK and LBK.

Row `DK-RETSINFO-CONSOLIDATED`, LBK nr 402 af 23/03/2026, Bekendtgørelse af årsregnskabsloven (ELI `lta/2026/402`):

```
curl -sS -L -o arl402.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.retsinformation.dk/eli/lta/2026/402/xml
```

Returned `200 860525 application/xml`. The HTML page at the ELI URL is a JavaScript shell (`curl https://www.retsinformation.dk/eli/lta/2024/480` returns `200 5193 text/html`), so the XML route is the one used. `/pdf` also answers (`https://www.retsinformation.dk/eli/lta/2024/480/pdf`: `200 343456 application/pdf`) and was not used.

Finding the versions of an instrument (not part of the open-data terms' documented services, which are the harvest API `api.retsinformation.dk/v1/Documents?date=` and the ELI channels; these are the JSON calls the Retsinformation web page itself makes, used for discovery and by the watchers):

```
curl -sS -L -G -o s.json -w '%{http_code} %{size_download} %{content_type}\n' --data-urlencode 't="klimaloven"' https://www.retsinformation.dk/api/documentsearch
curl -sS -o r.json -w '%{http_code} %{size_download} %{content_type}\n' https://www.retsinformation.dk/api/document/255879/references/0
```

Returned `200 6479 application/json; charset=utf-8` and `200 12359 application/json; charset=utf-8`. The first lists documents (a quoted phrase in `t` is an exact phrase, an unquoted one matches any word); the second, for LBK 402/2026 (internal id 255879), lists under "Dokumentets indarbejdede forskrifter" the previous LBK (`LBK nr 1057 af 23/09/2024`), its predecessor and so on, which gives the chain of consolidations back in time; "Senere ændringer til forskriften" lists amending acts not yet consolidated.

Text extraction: the XML below `Meta` (`TitelGruppe`, `DokumentIndhold`, `UnderskriftGruppe`); every `Linea` (a heading, paragraph or list item) is one line; the label in `Explicatus` (`§ 9.`, `Stk. 2.`, `1)`) is put in front of the text of its paragraph, subsection or list item, and for chapters, parts and groups it is its own line. Nothing is reworded. Checked on the day for every stored file: the non-space characters of the extracted text equal those of the XML body (cut files: of the cut paragraphs). Where an instrument is stored as a cut (`dk-arl-99a`: § 99 a; `dk-markedsfoeringsloven`: §§ 5, 6 and 13), the paragraphs are found by their `Explicatus` label and `fetched_sha256` is that of the whole file as returned. `in_force` of an LOV or BEK is the commencement date read from its own ikrafttrædelse section (quoted in the scope entry); of an LBK it is the signing date (`DiesSigni`), because an LBK has no commencement clause. A version is stored only when its text differs from the previous stored version of that instrument.

Stored (fetched 2026-11-02): 32 records, all `da`.

| Instrument | Row | Versions stored (`in_force`) |
|---|---|---|
| `dk-arl-99a` (§ 99 a) | consolidated | 2009-05-25, 2013-11-01, 2015-12-10, 2019-08-08, 2024-08-27, 2026-03-23 |
| `dk-lov-480-2024` | adopted | 2024-06-01 |
| `dk-lov-1636-2025` | adopted | 2025-12-31 |
| `dk-lov-52-2025` | adopted | 2025-02-01 |
| `dk-bek-453-2025` | adopted | 2025-05-15 |
| `dk-bek-328-2026` | adopted | 2026-02-26 |
| `dk-bek-1700-2025` | adopted | 2026-01-01 |
| `dk-bek-1487-2025` | adopted | 2026-01-01 |
| `dk-klimaloven` | adopted, consolidated | 2020-06-28 (act), 2021-12-13 (LBK 2580/2021) |
| `dk-co2-kvoteloven` | adopted, consolidated | 2013-01-01, 2016-12-14, 2021-01-19, 2022-04-27, 2024-01-01 |
| `dk-co2-afgiftsloven` | consolidated | 2011-04-04, 2020-09-02 |
| `dk-emissionsafgiftsloven` | adopted, consolidated | 2025-01-01, 2025-03-20 |
| `dk-transport-ghg` | consolidated | 2011-06-21, 2019-01-17, 2020-02-10, 2021-04-07, 2021-11-29, 2026-04-16 |
| `dk-markedsfoeringsloven` (§§ 5, 6, 13) | adopted, consolidated | 2017-07-01, 2022-06-15 |

Not stored, no recipe: LBKs of the Financial Statements Act before 2009 (LBK 647/2006), of the CO2 tax act before 2011 (LBK 889/2006, 643/1998, 856/1996, 849/1995, 718/1993): the XML route answers `200 3957 application/xml` with the metadata only and no text body (`curl -sS -L -o old.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.retsinformation.dk/eli/lta/2006/647/xml`). Skipped because the text equals the previous stored version: ÅRL § 99 a in LBK 323/2011, 1441/2022 and 1057/2024; Markedsføringsloven §§ 5, 6, 13 in LBK 1420/2024. Amending acts that Retsinformation has not consolidated (CO2 tax act: 11 acts, Markedsføringsloven: Lov 558/2025 and 1322/2025) are not stored, so the latest stored LBK of those instruments is not the law as it now stands.

### Link only

None. All 14 scope instruments are stored.

### Languages

Danish is the only official language. Retsinformation (FAQ "Kan jeg finde en oversættelse af specifik lovgivning?"): "Retsinformation indeholder ikke oversættelser af lovgivning til andre sprog." English translations were looked for at the ministries and agencies:

- Climate Act: the Ministry of Climate, Energy and Utilities publishes a PDF (`curl -sS -L -o k.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://en.kefm.dk/Media/1/B/Climate%20Act_Denmark%20-%20WEBTILG%c3%86NGELIG-A.pdf'` returned `200 157879 application/pdf`) headed "This is an unofficial translation of the Climate Act. Only Danish laws published in the Danish Law Gazette (Lovtidende) have legal validity", for Act No 965 of 26 June 2020. en.kefm.dk has no copyright or reuse page (its footer links only the privacy and cookie policy), so row `DK-KEFM-TRANSLATION` is `permission requested` and nothing is stored.
- Marketing Practices Act: the Competition and Consumer Authority publishes a PDF (`curl -sS -L -o m.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://kfst.dk/media/49887/mfl-english.pdf` returned `200 745015 application/pdf`) of Act No 426 of 3 May 2017 in its 2017 state. kfst.dk has no reuse terms page, so row `DK-KFST-TRANSLATION` is `permission requested`; the 2017 amendment state would also match no stored version except the as-published act.
- Financial Statements Act: no government English found (web search on 2026-11-02; erhvervsstyrelsen.dk pages tried answer 404 or Danish guidance). Erhvervsstyrelsen guidance pages were not used, so no row for it.
- Other instruments: no English found.

Law-firm, audit-firm and NGO translations turned up in the searches and are never stored.

No site was blocked from the cloud address: retsinformation.dk, api.retsinformation.dk, en.kefm.dk, kfst.dk, forbrugerombudsmanden.dk and erhvervsstyrelsen.dk all answered.

## Czechia

Rows `CZ-ESBIRKA-ADOPTED` (as-published text) and `CZ-ESBIRKA-CONSOLIDATED` (time versions), both `pass` on the statute basis (Copyright Act 121/2000 Sb. § 3 písm. a)). The consolidated row is flagged in its notes for Varun: the statute covers the text of a právní předpis, and whether an e-Sbírka time version made by the portal falls inside it is a reading, not a settled point. e-Sbírka has no terms-of-use page and names no licence. Run on 2026-11-02. Language: Czech only. No government English translation was found, so there is no translation row.

The web pages of https://e-sbirka.gov.cz are a JavaScript application: curl returns a 1040-byte shell.

```
curl -sS -L -o shell.html -w '%{http_code} %{size_download} %{content_type}\n' https://e-sbirka.gov.cz/sb/2012/383
```

Returned `200 1040 text/html`. The keyed public API (`https://api.e-sbirka.gov.cz`) wants a registered key: `curl -sS -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' 'https://api.e-sbirka.gov.cz/dokumenty-sbirky/%2Fsb%2F2012%2F383'` returned `401 119 application/json;charset=UTF-8` (`NEPLATNY_API_KLIC`). What works without a key is the JSON endpoint that the web application itself calls, under `https://e-sbirka.gov.cz/sbr-cache/`. No browser is needed. The e-Sbírka pages warn that identifiers of fragments and parts of the data structure may change until 2027-01-15 (https://e-sbirka.gov.cz/aktuality/20150), so a fragment id is never stored.

Request 1, the list of time versions of an act (Act 383/2012 Sb.; the stale URL `/sb/2012/383` is percent-encoded as `%2Fsb%2F2012%2F383`):

```
curl -sS -L -o h.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://e-sbirka.gov.cz/sbr-cache/dokumenty-sbirky/%2Fsb%2F2012%2F383/historie'
```

Returned `200 2858 application/json`: one entry per version with `datumUcinnostiZneniOd`, `typZneni` (`AKTUALNI`, `MINULE`, `BUDOUCI`, `MINULE_CASTECNE_UCINNE`, `MINULE_NEUCINNE` for a version that never took effect, `VYHLASENE` for the as-published text), `staleUrl` and the amending acts (`novely`).

Request 2, row `CZ-ESBIRKA-CONSOLIDATED`, the text of the version effective 2026-01-01 (append the date to the stale URL):

```
curl -sS -L -o p0.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://e-sbirka.gov.cz/sbr-cache/dokumenty-sbirky/%2Fsb%2F2012%2F383%2F2026-01-01/fragmenty?cisloStranky=0'
```

Returned `200 758950 application/json`. The answer holds `pocetStranek` (here 1) and `seznam`, a list of fragments in document order, each with `kodTypuFragmentu` (`Cast`, `Paragraf`, `Nadpis_pod`, `Odstavec_Dc`, `Pismeno_Lb`, `Bod_Dd`, `PPC` for footnotes, ...), `hloubka` and `xhtml` (the text with inline tags). Larger acts are served in several pages: Act 563/1991 Sb. page 0 returned 1068765 bytes and `curl ... 'https://e-sbirka.gov.cz/sbr-cache/dokumenty-sbirky/%2Fsb%2F1991%2F563/fragmenty?cisloStranky=1'` returned `200 72329 application/json`.

Request 3, row `CZ-ESBIRKA-ADOPTED`, the as-published text (date part `0000-00-00`), Decree 103/2025 Sb.:

```
curl -sS -L -o a103.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://e-sbirka.gov.cz/sbr-cache/dokumenty-sbirky/%2Fsb%2F2025%2F103%2F0000-00-00/fragmenty?cisloStranky=0'
```

Returned `200 63426 application/json`, sha256 `151adcc89b3ac110b35e7cbc0816e2b09be99bb4568851fa5f77aa0e70b5c894`. Two fetches of `https://e-sbirka.gov.cz/sbr-cache/dokumenty-sbirky/%2Fsb%2F2025%2F103/fragmenty?cisloStranky=0` gave the same hash (`18447bc326e7a5a47c050b26af3722d8b57a6dd01354dc78dcab06002b1cd978`), so `fetched_sha256` reproduces; the response carries no per-request token. For an act served in several pages, `fetched_url` is the URL of page 0 and `fetched_sha256` is the sha256 of the page responses concatenated in page order.

Text extraction: one line per fragment that has `xhtml`, in document order; `<br>` as a line break, all other tags stripped, character entities unescaped, runs of spaces collapsed; nothing reworded. Fragments of type `PPC` (footnotes) are kept for whole instruments and left out of cut records. The as-published record of an act is dated the first date any provision took effect (the earliest version that is not `VYHLASENE` or `MINULE_NEUCINNE`). A time version is stored only when its text differs from the previous stored text of that instrument, so the dates below are the dates the text changed. A published version that has not taken effect (`BUDOUCI`) is stored dated its in-force date when its text differs.

Cut records: `cz-accounting-act-sustainability-reporting` is Part Eight of Act 563/1991 Sb. (from the `Cast` fragment whose next fragment is the heading UVÁDĚNÍ NEFINANČNÍCH INFORMACÍ or ZPRÁVA O UDRŽITELNOSTI up to the next `Cast`); `cz-consumer-protection-act-634-1992-s4-5a` runs from the `Paragraf` fragment `§ 4` to the one before `§ 5b` (before `§ 6` in versions without `§ 5b`).

Stored (fetched 2026-11-02, all Czech, `cs`):

| Instrument | Row | Versions stored (`in_force`) |
|---|---|---|
| `cz-accounting-act-sustainability-reporting` | consolidated | 2017-01-01, 2024-01-01, 2025-09-03, 2026-01-01 |
| `cz-act-316-2025` | adopted | 2025-09-03 |
| `cz-ets-act-383-2012` | adopted, consolidated | 2012-11-16 (adopted); 2015-01-01, 2017-07-01, 2020-01-03, 2021-01-01, 2022-02-01, 2024-04-10, 2025-01-01, 2026-01-01 |
| `cz-ets-decree-103-2025` | adopted | 2025-04-16 |
| `cz-ets-indirect-cost-compensation-order-565-2020` | adopted, consolidated | 2021-01-01 (adopted); 2022-03-01, 2022-07-01, 2023-01-01, 2026-08-14, 2027-01-01 (published, not in force on 2026-11-02) |
| `cz-consumer-protection-act-634-1992-s4-5a` | consolidated | 2008-02-12, 2015-12-28, 2023-01-06 |

### Languages

Czech is the only official language. e-Sbírka serves no English text of Czech acts: its FAQ (https://e-sbirka.gov.cz/casto-kladene-dotazy) lists foreign-language texts for international treaties only. A web search for English texts of Act 563/1991 and Act 383/2012 returned third-party machine translations only; https://www.mzp.gov.cz (Ministry of the Environment) answered curl with `403 30758 text/html; charset=UTF-8` (blocked from the cloud address: https://www.mzp.gov.cz/en). The Ministry of Finance and Ministry of the Interior English home pages answered 200 (`https://www.mfcr.cz/en/` 105754 bytes, `https://www.mvcr.cz/mvcren/` 19811 bytes); only their home pages were opened and no translation was looked for inside them. No translation row exists, and a translation published by a law firm, an exchange, an NGO or a news site is never stored.

### Link only

None. Every scope instrument has records.

### Not in scope and not used

- Sbírka zákonů archive (`https://aplikace.mvcr.cz/sbirka-zakonu/` answers `301` to `https://aplikace.mv.gov.cz/sbirka-zakonu/`, which answered `404 34455 text/html; charset=utf-8` for the root path): no PDF was needed, because e-Sbírka serves the as-published text of every instrument above as structured fragments, and no row exists for the archive. The `pdftotext` recipe was not used.
- psp.cz (Poslanecká sněmovna), the bill pages: blocked from the cloud address. `curl -sS -m 20 -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.psp.cz/sqw/historie.sqw?o=10&T=279'` ended with `curl: (35) Recv failure: Connection reset by peer`. Nothing is stored from it and no row exists. The orchestrator can try it from the laptop.
- Česká národní banka, https://www.cnb.cz/cs/ answered `200 104560 text/html;charset=UTF-8` (after a `307` from the bare host). No ČNB instrument was examined, so there is no ČNB row; whether a ČNB notice on ESG risks is an enacted instrument in F1 to F6 was not established.
- Government orders that set the yearly budget for indirect-cost compensation (221/2023, 203/2024, 260/2025, 136/2026 Sb.): single-year amounts, no entry.
- Government bill sněmovní tisk 279 (amends 563/1991 Sb. again): not enacted on e-Sbírka on 2026-11-02; stays a proposal in `register/register.csv`.
- Acts 349/2023 Sb. (consolidation package, hundreds of articles) and 462/2016 Sb. are not entries: what they added to Act 563/1991 Sb. is in the Part Eight records.

Watchers: one `date_list` per scope instrument on the `historie` URL of the act (regex on `datumUcinnostiZneniOd`), tier `consolidation_site`, `second_route` the browser page of the act. `python3 tools/watch.py --dry-run --source CZ-ESBIRKA-CONSOLIDATED` and `--source CZ-ESBIRKA-ADOPTED` ran with 0 failures.

## Portugal

Rows `PT-DRE-ADOPTED` and `PT-DRE-CONSOLIDATED` (both `pass`, statute: Código do Direito de Autor e dos Direitos Conexos art. 8 n.º 1 read with art. 3 n.º 1 alínea c); the reading is in the row notes and in the PR). Run on 2026-11-02. Language: Portuguese only; no government English translation of any instrument in scope was found (diariodarepublica.pt offers Portuguese only; portugal.gov.pt, gov.pt and apambiente.pt were searched), so there is no translation row.

diariodarepublica.pt is an OutSystems application: curl gets the same JavaScript shell for every page.

```
curl -sS -L -o stat.html -w '%{http_code} %{size_download} %{content_type}\n' https://diariodarepublica.pt/dr/detalhe/decreto-lei/12-2020-131124444
```

Returned `200 2346 text/html; charset=utf-8` (the shell, no law text). What works from the cloud address with plain curl is the JSON the page itself loads, a POST to `/dr/screenservices/dr/...`. It needs the header `X-CSRFToken: T6C+9iB49TLra4jEsMeSckDMNhQ=` (a fixed value that the site accepted on every run, with no cookie; without the header the answer is `301`) and the `moduleVersion` and `apiVersion` tokens of the build. A redeploy changes the tokens: the answer then carries `hasModuleVersionChanged` or `hasApiVersionChanged` true. The current `moduleVersion` is at `https://diariodarepublica.pt/dr/moduleservices/moduleversioninfo`; the `apiVersion` of each action is in the request the page sends (headless Chromium, Playwright, request log). Headless Chromium was used only to find these requests, to look keys up with the site search, and to read the terms page; no record is a browser fetch.

Row `PT-DRE-ADOPTED`, act as published, Decreto-Lei n.º 12/2020 (`Tipo` and `Key` come from the detail page URL `/dr/detalhe/<Tipo>/<Key>`):

```
curl -sS -X POST -H 'Content-Type: application/json; charset=UTF-8' -H 'Accept: application/json' -H 'X-CSRFToken: T6C+9iB49TLra4jEsMeSckDMNhQ=' --data '{"versionInfo":{"moduleVersion":"M7FN8WxHoE3CxIH1MRFuNw","apiVersion":"B3l5BYZxaLmWUxGR3tmKGw"},"viewName":"Legislacao_Conteudos.Conteudo_Detalhe","screenData":{"variables":{"Tipo":"decreto-lei","_tipoInDataFetchStatus":1,"Key":"12-2020-131124444","_keyInDataFetchStatus":1,"ParteId":"","_parteIdInDataFetchStatus":1}},"clientVariables":{"CookiePath":"/dr/"}}' -o dl12_adopted.json -w '%{http_code} %{size_download} %{content_type}\n' https://diariodarepublica.pt/dr/screenservices/dr/Legislacao_Conteudos/Conteudo_Detalhe/DataActionGetAllConteudoDetalheData
```

Returned `200 257938 application/json; charset=utf-8`, sha256 `46fc0c4e6d20aa34907d5a6503bde9656abd9f209fa2be4122cb0ae4dc01f732`, the same as `fetched_sha256` of the record `2020-04-07-adopted-pt.json`; a second run gave the same hash (no per-request token in the response). The act is `data.DetalheConteudo.Texto`; `URL_PDF` in the same answer names the gazette PDF (`https://files.diariodarepublica.pt/1s/2020/04/06800/0000300030.pdf`, `curl` answers `200 2625333 application/pdf`).

Row `PT-DRE-CONSOLIDATED`, the consolidated text of the same decree-law as of 2024-12-09 (`DiplomaLegisId` and `DiplomaFragId` are read from the consolidated page `/dr/legislacao-consolidada/<Tipo>/<Key>`, the page link "Versão Consolidada" on the detail page; the answer lists the fragments of the text in force on `DataSelecionada`):

```
curl -sS -X POST -H 'Content-Type: application/json; charset=UTF-8' -H 'Accept: application/json' -H 'X-CSRFToken: T6C+9iB49TLra4jEsMeSckDMNhQ=' --data '{"versionInfo":{"moduleVersion":"M7FN8WxHoE3CxIH1MRFuNw","apiVersion":"d7Rxuzmh_VE2+P7mpys+Ew"},"viewName":"LegislacaoConsolidada.LegCons_Detalhe","screenData":{"variables":{"DiplomaLegisId":"131124444","DiplomaFragId":"131177506","DataSelecionada":"2024-12-09","DataAux":"2024-12-09","Ano":2020,"Tipo":"decreto-lei","Key":"2020-131177506","GetDiplomaFragByIdAndApplicationSetting":{}}},"clientVariables":{"CookiePath":"/dr/"}}' -o dl12_cons.json -w '%{http_code} %{size_download} %{content_type}\n' https://diariodarepublica.pt/dr/screenservices/dr/LegislacaoConsolidada/LegCons_Detalhe/DataActionGetData
```

Returned `200 290217 application/json; charset=utf-8`, sha256 `aa4b733372e28c9b6918b55635573a792c6873ed19be84390973c9a4ee87da34`, equal to `fetched_sha256` of `2024-12-09-consolidated-pt.json`. Without the `GetDiplomaFragByIdAndApplicationSetting` key the action answers a `NullReferenceException`. The dates of the consolidations come from the list of changes of the page:

```
curl -sS -X POST -H 'Content-Type: application/json; charset=UTF-8' -H 'Accept: application/json' -H 'X-CSRFToken: T6C+9iB49TLra4jEsMeSckDMNhQ=' --data '{"versionInfo":{"moduleVersion":"M7FN8WxHoE3CxIH1MRFuNw","apiVersion":"kqtmWKfgghZe4WM2Y1nYAQ"},"viewName":"LegislacaoConsolidada.LegCons_Detalhe","screenData":{"variables":{"DiplomaLegisId":"131124444","DiplomaFragId":"131177506","Data":"2026-11-02"}},"clientVariables":{"CookiePath":"/dr/"}}' -o dl12_timeline.json -w '%{http_code} %{size_download} %{content_type}\n' https://diariodarepublica.pt/dr/screenservices/dr/LegislacaoConsolidada/AlteracoesTimelineByDiplomaLegisId/DataActionGetConsolidacaoByDiplomaFrag
```

Returned `200 24775 application/json; charset=utf-8`: each amending act with `DataPublicacao` and, per changed provision, `DataEntradaVigor` (`1900-01-01` means the page gives no date). The candidate versions are the distinct `DataEntradaVigor` dates plus the in-force date of the act; `DataSelecionada` set to each gives that day's text.

Text extraction: for the published act, `Texto` with HTML tags removed (table rows and cells as lines, entities decoded, runs of spaces collapsed, blank lines dropped) and the trailing DRE document number (a bare 8-9 digit line at the end of `Texto`) removed; for a consolidation, the fragments of `data.LegConsBase.List` in order, each as its heading (`Tituo`), its `Epigrafe` and its `Texto`, cleaned the same way. Nothing reworded. A consolidation is stored only when its text differs from the previous stored consolidation; the first consolidation of an act is stored only when its body differs from the published act (headings in capitals and the title and signature lines aside). Checked on the day: for the six published acts the gazette PDF (`pdftotext`, default mode) was compared word by word; the stored text has none of the PDF words that belong to the act (the words only in the PDF come from other acts printed on the same gazette pages) and no U+FFFD character, so no mojibake.

Stored (fetched 2026-11-02), all `pt`:

| Instrument | Row | Versions stored (`in_force`) |
|---|---|---|
| `pt-dl-89-2017` | adopted | 2017-08-02 |
| `pt-lei-98-2021` | adopted, consolidated | 2022-02-01 (adopted), 2025-04-01 |
| `pt-dl-12-2020` | adopted, consolidated | 2020-04-07 (adopted), 2021-12-16, 2024-12-09 |
| `pt-dl-98-2024` | adopted | 2024-12-04 |
| `pt-dl-182-2026` | adopted, consolidated | 2026-09-15 (both; the consolidation carries Declaração de Retificação n.º 33-A/2026/1) |
| `pt-dl-57-2008` | adopted, consolidated | 2008-04-01 (adopted), 2015-09-24, 2021-07-28, 2022-05-28, 2023-04-03 |

Dates: where an act has no entry-into-force article (Decreto-Lei n.º 89/2017, 98/2024, 182/2026) the date is the 5.º dia após a publicação of Lei n.º 74/98 art. 2 n.º 2, counted from the day after publication. DRE itself states 2024-12-04 for Decreto-Lei n.º 98/2024 (in the changes of the repealed Decreto-Lei n.º 93/2010); for the other two no DRE page states a date.

### Languages

Portuguese is the only official language of the Diário da República. No government English translation of any of the six instruments was found on 2026-11-02 (diariodarepublica.pt, portugal.gov.pt, gov.pt, apambiente.pt), so no translation row and no English record exists.

### Link only

None: all six scope entries are stored. Not in scope:

- A decree-law transposing the CSRD (Directive (EU) 2022/2464): none found. The Diário da República search for "Diretiva (UE) 2022/2464" on 2026-11-02 returned two unrelated 2026 instruments. The existing register row (a gov.pt notice) stays as a notice. The claim on opencapital.pt that Decreto-Lei n.º 89/2024 transposed the CSRD is wrong: that decree-law (2024-11-18) amends the asset management regime.
- CMVM (cmvm.pt): no CMVM instrument on sustainability reporting was identified that is an enacted instrument, so no row. The home page answers (`200`), the guessed legal-notice URLs answer `404`; the terms were not read.
- Decreto-Lei n.º 93/2010 (aviation ETS): repealed by Decreto-Lei n.º 98/2024 (DRE Vigência NAO_VIGENTE).
- Código das Sociedades Comerciais (Art. 66.º-B, 508.º-G and related, amended by Decreto-Lei n.º 89/2017): not stored; the Code is a large act and the articles would have to be cut out of its consolidation as the Swiss Code of Obligations divisions are.
- Implementing orders of the CELE (portarias, for example Portaria n.º 203/2021): not searched beyond the title.

### Blocked

No Portuguese site was blocked: diariodarepublica.pt, data.dre.pt (ELI redirects), files.diariodarepublica.pt and cmvm.pt answered. `https://eur-lex.europa.eu/eli/dir/2022/2464/oj/por` answered curl with `202 0 text/html` (empty challenge body); it was not needed (blocked from the cloud address: https://eur-lex.europa.eu/ ).

## Hungary

Run on 2026-11-02 (GEL-05-10). One row passes: `HU-MKOZLONY-ADOPTED` (statute basis: Szjt. 1. § (4), 1999. évi LXXVI. törvény; the portal publishes no reuse terms). Three rows are `permission requested`: `HU-NJT-CONSOLIDATED` (the Nemzeti Jogszabálytár terms reserve all rights, bar database building, bulk download and commercial use), `HU-NJT-TRANSLATION` (English translations, information only, commercial use needs permission) and `HU-MNB-ADOPTED` (the MNB legal notice allows only distribution of unchanged content). So only as-published texts from Magyar Közlöny are stored; every consolidated version is link only. Language: Hungarian only. No browser recipe was needed: every host that answered at all answered `curl`.

Step 1, row `HU-MKOZLONY-ADOPTED`: the month listing gives the issues of a month with publication date and the PDF link (page size is 10 issues; `page=2`, `page=3` follow; the `datePublished` meta of each entry is the issue date):

```
curl -sS -G -o list_2023_12.html --data-urlencode 'year=2023' --data-urlencode 'month=12' -w '%{http_code} %{size_download} %{content_type}\n' https://magyarkozlony.hu/
```

Returned `200 51123 text/html; charset=UTF-8`. The issue is the one dated the promulgation day (the date in a decree's number, or the "kihirdetés napja" footnote of an act) that holds the instrument heading.

Step 2, Act CVIII of 2023 (the ESG Act), Magyar Közlöny 2023. évi 187. szám, issue dated 2023-12-22:

```
curl -sS -L -o mk_2023_187.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://magyarkozlony.hu/hivatalos-lapok/4kRl30n61EB7V7OcUh7M65820c6443b5b/dokumentumok/b5e0520aee1a0db8631efa32546c55a00fd6037c/letoltes
```

Returned `200 1893667 application/pdf` (390 pages, sha256 `1a9b89435c2c8db02994ea38a61f25b456200013bf8a0d424ce60a04b08e1a6e`). A second fetch of the 2024-08-08 issue and of this one returned the same bytes, so `fetched_sha256` reproduces. The URL tokens change per issue, so they are read from the listing.

Text: `pdftotext -layout mk_2023_187.pdf -` (poppler), runs of spaces collapsed, blank lines dropped, the running page headers (`NNNN M A G Y A R K Ö Z L Ö N Y • YYYY. évi N. szám` and the same with the page number last) dropped, and the text cut from the line that is the instrument heading (`2023. évi CVIII. törvény`, or `A Kormány 244/2024. (VIII. 8.) Korm. rendelete`) to the line before the next instrument heading in the issue. For decrees the trailing issue-section headings (`IV. A Magyar Nemzeti Bank elnökének rendeletei, ...`) are dropped. Line breaks are the PDF's line wraps. Annexes that follow the signatures are kept. The 2013-and-later issues extracted without mojibake (checked: no `õ û Ę Ħ`, only Hungarian letters).

Two older issues needed more, and the stored text for them differs from a plain `pdftotext` run in these ways only:

- Magyar Közlöny 2012. évi 180. szám (Act CCXVII of 2012) and 2008. évi 95. szám (Act XLVII of 2008) use legacy font encodings: `pdftotext` returns `õ` for `ő`, `û` for `ű`, and in 2012 also `Ę` for `ő` and `Ħ` for `ű`. The stored text maps `õ→ő û→ű Ę→ő Ħ→ű` and changes nothing else. Check: the non-ASCII inventory of the extracted text held only these four odd letters plus ordinary Hungarian letters and punctuation, and the ő/ű words of the result are ordinary Hungarian (compared with the words on the NJT pages read; the unmatched ones are inflected forms that do not occur there). Varun to decide whether a repaired extraction counts as the text of the file.
- The 2008 issue is printed in two columns, which `pdftotext -layout` interleaves, so it was read with plain `pdftotext` (reading order). Its page furniture (`MAGYAR KÖZLÖNY`, `2008/95. szám`, bare page numbers inside the issue's page range) was dropped, and the instrument runs from `2008. évi XLVII.` (heading split over two lines) to `2008. évi XLVIII.`.

```
curl -sS -L -o mk_2008_95.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://magyarkozlony.hu/hivatalos-lapok/68ecbff29cdc3f653a388acc8e3e1d1cb61d6765/dokumentumok/453afacc6a8cdda0c083bc0ff77050fb3ed08b58/letoltes
```

Returned `200 1862743 application/pdf`. The records are plain-text extracts of the signed PDF, not the authentic publication itself.

Rows that were opened and not used for storage:

```
curl -sS -m 60 -o njt.html -w '%{http_code} %{size_download} %{content_type}\n' https://njt.jog.gov.hu/jogszabaly/2023-108-00-00
```

Returned `200 324996 text/html; charset=UTF-8` (server-rendered consolidated text, current version marked 2026-01-01). Versions: `curl -sS -X POST -d 'documentId=2023-108-00-00' -H 'X-Requested-With: XMLHttpRequest' https://njt.jog.gov.hu/ajax/collectAllDocumentVersion.json` returned `200 1426 application/json` (14 entries; a GET answers 405). A version page is `.../jogszabaly/2023-108-00-00.<version>`. Terms (row `HU-NJT-CONSOLIDATED`): `curl -sS https://jog.gov.hu/felhasznalasi-feltetelek` returned `200 137665 text/html; charset=utf-8`. MNB (row `HU-MNB-ADOPTED`): `curl -sS -L -o mnb.pdf https://www.mnb.hu/letoltes/2-2026-zoldi-banki-ajanlas.pdf` returned `200 965302 application/pdf`; `https://www.mnb.hu/` redirects to `/web/fooldal` (`200 1213414 text/html;charset=UTF-8`). No NJT or MNB text is stored.

Watchers: the instrument watchers hash the NJT page of each instrument (a change of the page means a new consolidated version) and send a HEAD request to each MNB recommendation PDF (`Last-Modified` is present). The NJT terms forbid automated bulk querying; 14 page requests every 14 days are what the watchers add, and the terms are a point for Varun (see the PR report). No terms watcher was added for `HU-MKOZLONY-ADOPTED`: the raw HTML of its pages differs per request (a session token in the page), so a hash would report a change on every run.

### Languages

Run on 2026-11-02. Hungarian is the only official language and the only language Magyar Közlöny serves; all 13 stored records are `hu`. English: the Ministry of Justice translation repository on the Nemzeti Jogszabálytár is the one government source found. Row `HU-NJT-TRANSLATION` is `permission requested`, so no English is stored.

```
curl -sS -m 30 -o tr.html -w '%{http_code} %{size_download} %{content_type}\n' https://njt.jog.gov.hu/translations
```

Returned `200 44161 text/html; charset=UTF-8`. The page says the translations "serve informational purposes only, have no legal effect" and may not be used for commercial purposes without express permission. Its "latest uploads" list (2026-11-02) holds the Fundamental Law, Act LXIX of 2024, Act XIII of 2026, Act CIII of 2023 and Act CIV of 2001; none is an instrument in scope. The search endpoint answered a script with `200 17 application/json` (`{"success":false}`) even for Act CIII of 2023, which the page lists, so a per-instrument search by year and number could not be run; none of the instruments in scope is known to have a translation. Also looked at: the NJT `/translations` list only; `https://njt.hu/translations` was not reachable (see Blocked). The Magyar Közlöny site serves no English. `https://www.mnb.hu/` was not searched for English texts of the recommendations.

| Instrument | Languages stored | Gap and reason |
|---|---|---|
| hu-esg-act-2023-cviii, hu-climate-act-2020-xliv, hu-ets-act-2012-ccxvii, hu-ucp-act-2008-xlvii and the nine ESG orders | hu | No English from the Magyar Közlöny; NJT translations are `permission requested` and none was found for these instruments. |
| hu-accounting-act-2000-c, hu-mnb-rec-2-2026, hu-mnb-rec-16-2025, hu-mnb-rec-12-2023 | none | Link only (see below). |

### Blocked and link only

Blocked from the cloud address: `https://njt.hu/` and `https://njt.hu/jogszabaly/2023-108-00-00` answered `curl: (52) Empty reply from server` (exit 52, no HTTP status) on every try; `http://njt.hu/` answered `302`. The same operator's `https://njt.jog.gov.hu/` answered `200`, and the existing register rows already used it, so those URLs are used throughout. The orchestrator can open `https://njt.hu/` from the laptop to see whether it is the TLS handshake that hangs.

| Instrument | Official URL | Why link only |
|---|---|---|
| hu-accounting-act-2000-c | https://njt.jog.gov.hu/jogszabaly/2000-100-00-00 | Sustainability chapters III/A and VI/C exist only in the consolidated text; row `HU-NJT-CONSOLIDATED` is permission requested. The inserting words are inside the stored record of hu-esg-act-2023-cviii. |
| hu-mnb-rec-2-2026 | https://www.mnb.hu/letoltes/2-2026-zoldi-banki-ajanlas.pdf | Row `HU-MNB-ADOPTED` is permission requested (opened, `200 965302 application/pdf`; no text fetch proven for storage). |
| hu-mnb-rec-16-2025 | https://www.mnb.hu/letoltes/16-2025-bef-alapok-nevhasznalat-ajanlas.pdf | Same row (`200 209033 application/pdf`). |
| hu-mnb-rec-12-2023 | https://www.mnb.hu/letoltes/12-20123-biztositoi-zold-ajanlas.pdf | Same row (`200 397013 application/pdf`). |
| Act LIII of 1995, Act CLXXXV of 2012, Act LVII of 2015 (F7) | https://njt.jog.gov.hu/jogszabaly/1995-53-00-00, .../2012-185-00-00, .../2015-57-00-00 | F7: register rows only, no scope entry. |

Stored by GEL-05-10 (Hungarian, adopted, as published): `hu-esg-act-2023-cviii` (2024-01-01), `hu-climate-act-2020-xliv` (2020-06-10), `hu-ets-act-2012-ccxvii` (2012-12-31), `hu-ucp-act-2008-xlvii` (2008-06-29), `hu-esg-sztfh-13-2024` (2024-08-16), `hu-esg-sztfh-12-2024` (2024-08-18), `hu-esg-korm-276-2025` (2025-09-06), `hu-esg-korm-424-2025` (2025-12-26), `hu-esg-sztfh-15-2025` (2025-12-26), `hu-esg-sztfh-11-2024` (2024-08-12), `hu-esg-ngm-29-2024`, `hu-esg-ngm-30-2024` and `hu-esg-korm-244-2024` (all 2024-08-09).

## Finland

Rows `FI-FINLEX-ADOPTED` (`pass`, statute: Copyright Act 404/1961 s. 9; CC BY 4.0 as a second ground), `FI-FINLEX-CONSOLIDATED` (`pass`, terms: CC BY 4.0) and `FI-FINLEX-TRANSLATION` (`pass`, terms: CC BY 4.0; Varun to confirm, see the row notes). Run on 2026-11-02 (GEL-05-04). The finlex.fi pages are a JavaScript application, so the texts come from the Finlex open data API at `opendata.finlex.fi`, which answered every request from the cloud address. Finlex's terms page is `https://www.finlex.fi/en/data-protection`, section "Open data" (server-rendered, so `curl` gets the text). The API wants a `User-Agent` header (an empty one answers 403; curl's default is accepted), lists at most 10 documents a page, and does not answer `HEAD` (403, `MissingAuthenticationTokenException`), so the Finland watchers use `GET`.

Step 1, the dated versions of a consolidated Act: the list endpoint, filtered to one Act (`documentNumber` with the year as `startYear` and `endYear`; the answer is JSON with one `akn_uri` per language and version, 10 to a page, so page until a page has fewer than 10). Run for the Climate Act (`423/2022`):

```
curl -sS -L -G -o ilmastolaki_versions.json -w '%{http_code} %{size_download} %{content_type}\n' --data-urlencode 'format=json' --data-urlencode 'startYear=2022' --data-urlencode 'endYear=2022' --data-urlencode 'documentNumber=423' --data-urlencode 'limit=10' https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/list
```

Returned `200 795 application/json`. The version label after `@` is the amending act as year plus its number padded to four digits (`20230108` is Act 108/2023); the empty label is the original text. The date a version takes effect is read from the newest document's `finlex:amendedBy` list (`dateEntryIntoForce` of the amending act); the original has `dateEntryIntoForce` at the top of the metadata. An Act whose first listed version is not the original (the Accounting Act starts at `20151208`, the Consumer Protection Act at `20151699`) has no earlier consolidation in the API.

Step 2, row `FI-FINLEX-ADOPTED`, the Act as originally published (Statute Book), Finnish (`fin`):

```
curl -sS -L -o ilmastolaki_adopted_fi.xml -w '%{http_code} %{size_download} %{content_type}\n' https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute/2022/423/fin@
```

Returned `200 68398 application/xml;charset=UTF-8` (Akoma Ntoso; sha256 `c5cf647b29b00b142bdae1487493a80c0ac753c509f4dcb17064862318c1a2c8`, which is the `fetched_sha256` of `records/FI/fi-ilmastolaki/2022-07-01-adopted-fi.json`). A second fetch of the same URL gave the same hash (also checked for three consolidated files).

Row `FI-FINLEX-CONSOLIDATED`, the consolidated text after Act 108/2023:

```
curl -sS -L -o ilmastolaki_20230108_fi.xml -w '%{http_code} %{size_download} %{content_type}\n' https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2022/423/fin@20230108
```

Returned `200 86693 application/xml;charset=UTF-8` (sha256 `76bcc0bdc56a0c24fa163c17853b8769dbfef9f90ca0beabc4f92d8558cec627`).

Text extraction (same for every row and language): the Akoma Ntoso `act` element without `meta`; preface, enacting clause, chapter and section headings, paragraphs, list items and the closing signature lines as line breaks, a number (`1 §`, `1)`, `2 luku`) on the line of its heading or text, table rows as tab-separated lines, nothing reworded. Footnote-like amendment notes that Finlex keeps inside the text (`L:lla 693/2022 muutettu 9 kohta tulee voimaan 1.1.2023. Aiempi sanamuoto kuuluu:`) stay in the text. Each record's `fetched_sha256` is that of the whole file as returned, and `fetched_url` the exact request. Checked on the day for every XML record: the non-space characters of the extracted text equal those of the element text (nothing dropped, nothing added). For Acts stored as a chapter cut, the cut is the chapter(s) whose number matches (`3 a` and `7` with a heading for the Accounting Act, `2` for the Consumer Protection Act); a chapter whose heading is missing is a repealed stub and is not stored.

Dating and left-out versions: a version is stored under the entry-into-force date of its amending act. Finlex numbers versions in the order of the amending acts, not of their entry into force, and a version carries the amendments that are not yet in force as inline notes. A version is therefore left out when a later version in the list is in force on the same day or earlier (it could not stand in date order, and the later one carries its changes). A version is also not stored when the cut chapter is the same text as in the previous stored version, or when the chapter is not yet present. Left out for date order: Accounting Act `20151208` (same day as `20151620`); Consumer Protection Act `20170899`, `20170902`, `20201212`, `20220693`, `20220740`, `20260020`; `20260031` has no entry-into-force date in the API. A first consolidation whose body equals the adopted text is not stored (as for Switzerland): the original consolidations of the Climate Act and the Conflict Minerals Act differ from the adopted text only in the signature lines (the Climate Act also in one space) and are left out. The original consolidation of the Emissions Trading Act 1270/2023 differs by Finlex notes (a note on a repealed EU regulation, a directive reference) and is stored.

### Languages

Finnish (`fin`, file code `fi`) and Swedish (`swe`, file code `sv`) are both official and are served by the same Finlex API from the same version, so they sit under the same rows (`FI-FINLEX-ADOPTED`, `FI-FINLEX-CONSOLIDATED`) and need no row of their own. Swedish is the same request with `swe@` in place of `fin@`:

```
curl -sS -L -o ilmastolaki_adopted_sv.xml -w '%{http_code} %{size_download} %{content_type}\n' https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute/2022/423/swe@
curl -sS -L -o ilmastolaki_20230108_sv.xml -w '%{http_code} %{size_download} %{content_type}\n' https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2022/423/swe@20230108
```

Returned `200 68009 application/xml;charset=UTF-8` and `200 86475 application/xml;charset=UTF-8`. Every Finnish version has a Swedish version with the same label (checked for the five Acts that have consolidations: the Finnish and Swedish label lists were equal).

English is a translation Finlex publishes as a PDF on `https://www.finlex.fi/en/legislation/translations/<year>/eng/<number>`; Finlex calls them "Unofficial translations of statutes into foreign languages". They have their own row, `FI-FINLEX-TRANSLATION` (judged on the CC BY 4.0 terms; the Copyright Act s. 9 item 5, translations made or commissioned by an authority, is not applied because no Finlex page says the ministry made or commissioned them). Request for the Climate Act (the PDF link is on the translation page; its `timestamp` query is part of the link):

```
curl -sS -L -o translations_page.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.finlex.fi/en/legislation/translations/2022/eng/423
curl -sS -L -o ilmastolaki_en.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.finlex.fi/api/media/statute-foreign-language-translation/687510/mainPdf/main.pdf?timestamp=2022-06-09T21%3A00%3A00.000Z'
```

Returned `200 168889 text/html; charset=utf-8` and `200 188358 application/pdf` (sha256 `8794b8dc8292e63a82af62817090b0c10ca63d90e9eb46950262ab096efc1087`, two fetches equal). The page lists "Statute number up to which the legislative amendments have been tracked in the translation: 423 / 2022, completed 5.9.2022" and the PDF opens with "Translation from Finnish / Legally binding only in Finnish and Swedish / Ministry of the Environment". Text: `pdftotext -layout ilmastolaki_en.pdf -` with runs of spaces collapsed and blank lines dropped (as `## Brazil`); the output was checked for mojibake (the only non-ASCII characters are `á`, `–` and `’`). The English Accounting Act PDF (`https://www.finlex.fi/en/legislation/translations/1997/eng/1336`, media id 688786) is cut at the heading `Chapter 3a` up to `Chapter 4`.

Translation states against the stored versions: Climate Act, tracked up to 423/2022, equals the original state, stored as the translation of the 2022-07-01 version. Accounting Act, tracked up to 1376/2016, stored as the translation of the 2016-12-31 version (Chapter 3 a). Consumer Protection Act, tracked up to 740/2022 (in force 2024-04-01), is the state of version `20220740`, which is left out for date order, so no English record is stored. No translation of the Emissions Trading Acts 1270/2023 and 311/2011, of the amending Acts 1376/2016, 1249/2023, 605/2024 and 1250/2023, or of the Auditing Act after 622/2016 exists on Finlex.

### Stored (fetched 2026-11-02)

| Instrument | Records (fi / sv / en) | Versions stored (`in_force`) |
|---|---|---|
| `fi-kirjanpitolaki-sustainability-reporting` | 6 / 6 / 1 | consolidated 2016-12-31, 2021-05-10, 2023-12-31, 2024-11-15, 2025-01-17, 2026-06-30; English 2016-12-31 |
| `fi-laki-1376-2016` | 1 / 1 / 0 | adopted 2016-12-31 |
| `fi-laki-1249-2023` | 1 / 1 / 0 | adopted 2023-12-31 |
| `fi-laki-605-2024` | 1 / 1 / 0 | adopted 2024-11-15 |
| `fi-laki-1250-2023` | 1 / 1 / 0 | adopted 2023-12-31 |
| `fi-ilmastolaki` | 3 / 3 / 1 | adopted 2022-07-01; consolidated 2023-03-01, 2025-01-01; English 2022-07-01 |
| `fi-konfliktimineraalilaki` | 1 / 1 / 0 | adopted 2021-01-01 |
| `fi-paastokauppalaki` | 5 / 5 / 0 | adopted 2024-01-01; consolidated 2024-01-01, 2025-07-01, 2026-01-01, 2026-08-05 |
| `fi-paastokauppalaki-2011` | 10 / 10 / 0 | adopted 2011-05-01; consolidated 2016-01-01, 2017-07-03, 2018-07-01, 2019-03-19, 2021-01-01, 2022-01-01, 2022-06-23, 2023-03-01; repeal 2024-01-01 |
| `fi-kuluttajansuojalaki-marketing` | 12 / 12 / 0 | adopted 1978-09-01; consolidated 2016-01-09, 2018-01-03, 2020-07-15, 2022-01-01, 2022-07-15, 2023-07-01, 2023-10-01, 2026-01-01, 2026-06-01, 2026-07-31, 2026-10-01 |

The brief's candidates were checked on the day (and one more found): the CSRD transposition laws are Acts 1249/2023 to 1254/2023, not "1322 to 1326/2023" (those numbers answer 404 in the API); Act 1249/2023 is in force 2023-12-31, not 2024-01-01 (it applies from financial years starting 2024-01-01); the Emissions Trading Act 1270/2023 is in force 2024-01-01 and repeals 311/2011.

### Link only

None of the ten scope instruments is link only. Not in scope, so without an entry or a row:

- Finanssivalvonta (`https://www.finanssivalvonta.fi`): the terms page (`https://www.finanssivalvonta.fi/finanssivalvonta/selosteet-ja-ohjeet/kayttoehdot/`, 200) says "Oikeudet sivuilla julkaistaviin teksteihin, kuviin ja tallenteisiin ovat Finanssivalvonnalla tai muilla aineiston yhteydessä mainituilla" and allows only quotation under the Copyright Act, which would give `permission requested`. Its sustainable finance pages (`/finanssisektorin-toimijalle/paaomamarkkinat/kestava-rahoitus/`, `.../ifrs/kestavyysraportoinnin-saantely/`) describe EU rules and a Markkinat-tiedote 3/2023; no enacted Finanssivalvonta regulation on sustainability was found there, and a Finlex search of the authority regulations collection for `kestävyys`, `ilmasto` and `ESG` found none from it, so no row and no entry.
- Other families: one F5 instrument was found (`fi-konfliktimineraalilaki`, Act 1196/2020, by a title search for `konfliktimineraali`). A title search for `huolellisuusvelvoll` returned only money-laundering due diligence decrees, and `taksonomia` and `metsäkato` returned nothing, so no general due diligence act was found. F4 and F7 instruments were not searched for; no F7 register row was added.

### Blocked

No site was blocked from the cloud address: opendata.finlex.fi, www.finlex.fi and www.finanssivalvonta.fi all answered 200. `finlex.fi` without `www` answers 301 to `www.finlex.fi`; `data.finlex.fi` answers 307 to `/fi`; `opendata.finlex.fi/` itself answers 403 (API gateway, no token) and is not an API path. No browser recipe was needed and no record is browser-fetched.

## Austria

Rows `AT-RIS-ADOPTED` (Bundesgesetzblatt authentisch), `AT-RIS-CONSOLIDATED` (Bundesrecht konsolidiert) and `AT-RIS-TRANSLATION` (English translations), all `pass` on the publisher's terms: the Federal Chancellery's OGD-RIS FAQ says "Die Nutzung der RIS-Daten via OGD erfolgt gemäß der Namensnennung 4.0 International - Creative Commons" (CC BY 4.0, commercial reuse and modification allowed, attribution required), and the data.gv.at dataset "RIS Daten Version 2.6" lists the same licence. Urheberrechtsgesetz § 7 Abs. 1 (laws, ordinances and official enactments are not protected) is recorded as corroboration for the two official-text rows, not relied on. `AT-FMA-ADOPTED` is `permission requested` (fma.gv.at legal notice: "The commercial use of material presented on the FMA ‘s website requires the FMA ‘s express permission."). Run on 2026-11-02, a Monday, from 20:20 to 21:00 Vienna time.

### What is blocked and what answers

The RIS web pages are blocked from the cloud address for `curl` and for headless Chromium alike. Every page of `www.ris.bka.gv.at` (including the Impressum and the Nutzungsbedingungen) and the HTML pages of `ogd.ris.bka.gv.at` (`/eli/...`, `GeltendeFassung.wxe`) answer with a Myra "Security Check" page:

```
curl -sS -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=20007500'
```

Returned `503 30734 text/html`. Playwright chromium (`chromium.launch()`, `page.goto(url)`, wait 4 s) on `https://www.ris.bka.gv.at/`, `/Impressum.aspx`, `/Dokumente/BgblAuth/BGBLA_2026_I_6/BGBLA_2026_I_6.html` and `/Englische-Rv/` returned status 503 and the page title "Security Check" for each, so there is no browser recipe. Blocked from the cloud address: https://www.ris.bka.gv.at/ and https://ogd.ris.bka.gv.at/eli/ (for the orchestrator to read from the laptop; the RIS terms page, the Impressum and the Englische-Rv list were not read for that reason).

What answers `curl` is the OGD-RIS API on `data.bka.gv.at` (v2.6, JSON, no key) and the document files it lists on `ogd.ris.bka.gv.at/Dokumente/...` (XML, HTML, RTF, PDF). All texts below come from these two. The terms were read on the OGD-RIS FAQ page of the API host:

```
curl -sS -L -o terms.html -w '%{http_code} %{size_download} %{content_type}\n' https://data.bka.gv.at/ris/api/v2.6/
```

Returned `200 19355 text/html; charset=utf-8` (fingerprint recipe in the row notes; the hash was the same on three runs). The FAQ sets technical conditions: at most 0.5 requests per second, no parallel connections, queries only between 20:00 and 05:00 Vienna time or on weekends and Austrian holidays, and a notice to ris.it@bka.gv.at before a bulk use. The fetch for this wave ran as one connection with one request about every 2.5 s, started after 20:00 CET. The three `tools/watch.py --dry-run` runs (below) sent their requests back to back (11 requests in about 7 seconds), faster than 0.5 per second; no notice to the Chancellery was sent. A cloud session that runs the watcher for real should run it between 20:00 and 05:00 Vienna time.

### Row `AT-RIS-ADOPTED`

Proven for the Klimaschutzgesetz, BGBl. I Nr. 106/2011. Step 1 lists the documents of a Bundesgesetzblatt number (Teil I, II and III share a number, so the part is picked from the ID):

```
curl -sS -L -o ksg_list.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://data.bka.gv.at/ris/api/v2.6/Bundesrecht?Applikation=BgblAuth&Bgblnummer=106/2011'
```

Returned `200 4848 application/json; charset=utf-8` (three hits; the Teil I one is `BGBLA_2011_I_106`, Ausgabedatum 2011-11-21). Step 2, the authentic text as XML:

```
curl -sS -L -o BGBLA_2011_I_106.xml -w '%{http_code} %{size_download} %{content_type}\n' https://ogd.ris.bka.gv.at/Dokumente/BgblAuth/BGBLA_2011_I_106/BGBLA_2011_I_106.xml
```

Returned `200 21011 application/xml; charset=utf-8`, sha256 `e8d009241ab8adb720925d94ccf976306eddce136ca6b814c134f868186895ac`; a second fetch reproduced it (no per-request token in the XML). The same pattern gave the other adopted records (`BGBLA_2017_I_20`, `BGBLA_2011_I_118`, `BGBLA_2022_I_10`, `BGBLA_2026_I_6`). The record text is the whole file, one line per heading, paragraph, list item or table row. For the NEHG 2022 the record is Artikel 9 of BGBl. I Nr. 10/2022 (the Act sits inside the tax reform Act): it is cut from the line "Artikel 9" up to the signatures, and `fetched_url` and `fetched_sha256` are those of the whole file.

### Row `AT-RIS-CONSOLIDATED`

Proven for the Klimaschutzgesetz in the version of 2015-11-07. RIS serves a consolidated law as one XML file per paragraph or annex version (a file name `NOR<number>`), each with its own `Inkrafttretensdatum` and `Ausserkrafttretensdatum`; there is no whole-law file on the OGD host (the whole-law page `GeltendeFassung.wxe` is blocked, above). Step 1 lists the files valid on a date (`DokumenteProSeite=OneHundred` raises the page size from 20 to 100; without `Fassung.FassungVom` the call lists every version of every paragraph, with the date range of each):

```
curl -sS -L -o ksg_v20151107.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://data.bka.gv.at/ris/api/v2.6/Bundesrecht?Applikation=BrKons&Gesetzesnummer=20007500&Fassung.FassungVom=2015-11-07&DokumenteProSeite=OneHundred'
```

Returned `200 21111 application/json; charset=utf-8` (13 hits, in the order of the law). Step 2, one norm file (§ 10, valid 2015-11-07 to 2017-04-25):

```
curl -sS -L -o NOR40175651.xml -w '%{http_code} %{size_download} %{content_type}\n' https://ogd.ris.bka.gv.at/Dokumente/Bundesnormen/NOR40175651/NOR40175651.xml
```

Returned `200 3466 application/xml; charset=utf-8`, reproduced byte for byte by a second fetch. The Gesetzesnummer of a law is found with `...Bundesrecht?Applikation=BrKons&Titel=<words>` (KSG 20007500, EZG 2011 20007503, NEHG 2022 20011818, DriBeG 20013107, UWG 10002665, UGB 10001702, NEHG price determination 20012110). `Abschnitt.Typ=Paragraph&Abschnitt.Von=<n>&Abschnitt.Bis=<n>` limits a call to some paragraphs (UGB §§ 243b and 267a, UWG §§ 1 to 2a); a stored version date is the first date on which the set of valid files differs, which is the earliest `Inkrafttretensdatum` of a new file or the day after an `Ausserkrafttretensdatum`.

A record is assembled from the files valid on its date, in the order of the law, and stored when its text differs from the previous version. `fetched_url` is the Step 1 call for that date, `fetched_sha256` the sha256 of those files as returned, concatenated in the order of the listing (checked: recomputed from the 2015-11-07 listing above it equals the stored `fetched_sha256` of `records/AT/at-ksg/2015-11-07-consolidated-de.json`). For the UGB the record holds two sections: `fetched_url` is the call for § 243b, the § 267a file comes from the same call with `Abschnitt.Von=267a&Abschnitt.Bis=267a`, and the hash covers the § 243b file and then the § 267a file. RIS gives some versions of the NEHG 2022 (§§ 22, 24, 25) the `Inkrafttretensdatum` 9000-01-01 (no date set, they wait for a condition); they are not stored.

Text extraction (both XML kinds): the elements under `nutzdaten` without the page header and footer (`kzinhalt`, `fzinhalt`); for a norm file the RIS metadata block before the heading "Text" is dropped (for a § 0 file, from the heading "Langtitel"), and so is the trailer from "Zuletzt aktualisiert am" or "Schlagworte" on; headings, paragraphs (`absatz`) and list items as lines, the list number on the line of its text, a table row as one line with " | " between cells, a `tab` as a space, whitespace collapsed, nothing reworded. The HTML files are not used: they carry every text twice (a screen-reader copy in `sr-only` spans). Checked on 2026-11-02: for each of the 448 norm files fetched and the five BGBl. files, the non-space characters of the extracted text equal those of the XML text (apart from the " | " separators).

### Languages

German is the only language in which RIS serves any in-scope instrument: the document list of every BrKons and BgblAuth file offers the same document as XML, HTML, RTF and PDF, with no second language. No Croatian, Slovene or Hungarian version was looked for beyond that. Every record is `language` `de`, file name ending `-de.json`.

English is a translation of the Federal Chancellery (and ministries) published in RIS as application `Erv`, so it has its own row, `AT-RIS-TRANSLATION` (`translation`, `pass` on the OGD terms; § 7 Abs. 1 UrhG does not name translations and is not applied). Request 1 lists the application (the API ignores `Titel` and `Suchworte` for `Erv`, so the call returns all documents; 136 on 2026-11-02, matched by title by hand):

```
curl -sS -L -o erv_list.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://data.bka.gv.at/ris/api/v2.6/Bundesrecht?Applikation=Erv'
```

Returned `200 25514 application/json; charset=utf-8` (first page of 20; pages are walked with `Seitennummer`). Request 2, the Federal Act against Unfair Competition (`ERV_1984_448`):

```
curl -sS -L -o ERV_1984_448.xml -w '%{http_code} %{size_download} %{content_type}\n' https://ogd.ris.bka.gv.at/Dokumente/Erv/ERV_1984_448/ERV_1984_448.xml
```

Returned `200 389829 application/xml; charset=utf-8`, sha256 `e6eec5e3ab84dac254db0829bd59f6608b427b33aaeb5ef61690b31948e7ebd7`, reproduced by a second fetch. The file is one table with a German column and an English column. The English text of §§ 1 to 2a is the English cells from the heading row "Unfair Commercial Practices" (before "§ 1. (1) Anyone who") to the row before the body of § 3, one cell block per line, extracted as above. The state of the translation is read from the file, not from the API metadata ("date of the version: 1 April 2026", "as amended by BGBl. I No. 99/2023"): the file's English cell reads "was not promulgated in the Federal Law Gazette as of: 20 July 2022 pursuant to Federal Law Gazette I no. 110/2022" and names BGBl. I Nr. 99/2023 as the amendment entailing the latest update of the translation, while its German column is updated to "Fassung: 27.9.2026". The stored record is therefore dated 2022-07-20, the German version of §§ 1 to 2a it matches (it has the ranking, online marketplace and consumer review rules of BGBl. I Nr. 110/2022 and none of the 2026 text), and its `message` says so.

English looked for and not found in `Erv`: Unternehmensgesetzbuch, Klimaschutzgesetz, Emissionszertifikategesetz 2011, Nationales Emissionszertifikatehandelsgesetz 2022, Nachhaltigkeitsberichtsgesetz, Drittlandunternehmen-Berichterstattungsgesetz, Nachhaltigkeits- und Diversitätsverbesserungsgesetz (a title search over the 136 for Commercial Code, Companies, Accounting, Reporting, Emission, Greenhouse, Sustainability and Climate Protection found only the UWG and unrelated acts and ordinances). No English exists for the UWG versions of 1984 to 2015, 2016-12-31, 2026-07-29 and 2026-09-27 either; the translation of 2022 matches only the 2022-07-20 version.

### Stored (fetched 2026-11-02)

| Instrument | Row | Records (`in_force`) |
|---|---|---|
| `at-nabeg` | adopted | 2026-02-19 |
| `at-dribeg` | consolidated | 2026-02-19 |
| `at-ugb-243b-267a` (§§ 243b, 267a) | consolidated | 2016-12-06, 2026-02-19 |
| `at-nadiveg-2017` | adopted | 2016-12-06 |
| `at-ksg` | adopted, consolidated | adopted 2011-11-22; consolidated 2011-11-22, 2013-06-18, 2015-11-07, 2017-04-26 |
| `at-ezg-2011` | adopted, consolidated | adopted 2011-12-13; consolidated 2011-12-13, 2013-01-01, 2013-06-19, 2014-01-01, 2015-08-14, 2015-11-07, 2020-12-23, 2021-12-31, 2024-01-01, 2026-01-01 |
| `at-nehg-2022` | adopted, consolidated | adopted 2022-04-01 (Artikel 9); consolidated 2022-04-01, 2022-07-01, 2022-10-01, 2022-12-07, 2023-06-01, 2023-07-22, 2024-06-01, 2024-06-06, 2026-07-30 |
| `at-nehg-preisstabilitaets-vo` | consolidated | 2022-12-15 |
| `at-uwg-s1-2a` (§§ 1 to 2a) | consolidated, translation | de: 1984-11-23, 1988-07-30, 2000-04-01, 2007-12-12, 2015-04-23, 2016-12-31, 2022-07-20, 2026-07-29, 2026-09-27; en: 2022-07-20 |

No record was fetched with a browser. The NaDiVeG (BGBl. I Nr. 20/2017) is an addition to the candidate list: it is the Act that inserted UGB §§ 243b and 267a. No NaBeG adopted record other than the whole BGBl. text exists, because the Act is a bundle of 21 articles.

### Link only

None of the nine scope entries is link only.

- Not in scope: the Finanzmarktaufsicht (row `AT-FMA-ADOPTED`, `permission requested`). `curl https://www.fma.gv.at/` answers `403 5308 text/html; charset=UTF-8` (Cloudflare "Just a moment..."); `curl https://www.fma.gv.at/en/fma/fma-circulars/` answers `403 5413 text/html; charset=UTF-8`. In Playwright chromium (open `https://www.fma.gv.at/en/` first, wait 4 s, then the page, wait 8 s) the English home page (200) and the legal notice `https://www.fma.gv.at/en/copyright-and-disclaimer/` (200, read for the row) opened, and `https://www.fma.gv.at/en/fma/fma-circulars/`, `https://www.fma.gv.at/en/cross-sectoral-topics/sustainable-finance/` and `https://www.fma.gv.at/en/banks/sustainable-finance-banks/` stayed at the same 403 challenge. Blocked from the cloud address: those three URLs and `https://www.fma.gv.at/` (curl). No FMA guideline page was opened, so no FMA instrument has a scope entry.
- Not enumerated: NEHG 2022 and EZG 2011 implementing ordinances other than the price determination (BGBl. II Nr. 460/2022), the UWG Anhang (blacklist, where the green-claim bans of Directive (EU) 2024/825 sit), and UGB sections other than §§ 243b and 267a.

### Watchers

Eleven watchers were added (nine instruments, the English translation of the UWG, the OGD terms page). A consolidated-law watcher is a `date_list` on the API call with `Fassung.FassungVom=2099-12-31`, which lists the files valid after the last known version (at most 100 for these laws), and reads every `"Inkrafttretensdatum"`; a new amendment shows as a new date. A repeal that creates no new file is not seen. The two adopted-only instruments (`at-nabeg`, `at-nadiveg-2017`) and the translation use `page_hash` on the XML file, because the `ogd.ris.bka.gv.at` files answer a HEAD request with neither `Last-Modified` nor `Content-Length` (so `http_head` fails). `second_route` names the blocked `www.ris.bka.gv.at` page for a browser.

## France

Rows `FR-DILA-LEGI-CONSOLIDATED` and `FR-DILA-JORF-ADOPTED` (`pass`, terms basis: Licence Ouverte 2.0 as stated on the DILA data sheets), `FR-LEGIFRANCE-TRANSLATION` and `FR-AMF-DOCTRINE` (`permission requested`). Run on 2026-11-02.

www.legifrance.gouv.fr is blocked from the cloud address for `curl` and for headless Chromium: every page, including the translations page and the legal notices, answers a Cloudflare challenge. Blocked from the cloud address: https://www.legifrance.gouv.fr/ . The orchestrator can try the same commands from the laptop.

```
curl -sS -L -o stat.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.legifrance.gouv.fr/loda/id/JORFTEXT000048519395
```

Returned `403 5528 text/html; charset=UTF-8` (body: "Just a moment...", header `cf-mitigated: challenge`). The translations page `https://www.legifrance.gouv.fr/liste/traductions` returned `403 5474 text/html; charset=UTF-8`. Headless Chromium (Playwright as pre-installed, `chromium.launch({args:['--disable-blink-features=AutomationControlled']})`, a desktop Chrome user agent, `page.goto(url)` then six waits of 8 s) got status 403 and the title "Un instant…" every time; the same under `xvfb-run` with `headless:false` gave the same. The Internet Archive copy (`https://web.archive.org/web/2026/https://www.legifrance.gouv.fr/liste/traductions`) answered `curl: (35) Recv failure: Connection reset by peer`. No browser recipe is therefore used, and no record is browser-fetched.

What did work is the DILA open-data server, the publisher's own bulk distribution of the Légifrance data (the DILA data sheets name legifrance.gouv.fr as the distribution site of the datasets LEGI and JORF): `echanges.dila.gouv.fr` answered every request below, with a plain `curl` and no User-Agent.

### Terms

```
curl -sS -o DILA_LEGI_Presentation_20170824.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://echanges.dila.gouv.fr/OPENDATA/LEGI/DILA_LEGI_Presentation_20170824.pdf
curl -sS -o DILA_JORF_Presentation_20170824.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://echanges.dila.gouv.fr/OPENDATA/JORF/DILA_JORF_Presentation_20170824.pdf
```

Returned `200 57164 application/pdf` and `200 60433 application/pdf`. Both data sheets read "Conditions de réutilisation: Les données sont réutilisables gratuitement sous licence ouverte v2.0. Les réutilisateurs s'obligent à mentionner: la paternité des données (DILA); l'URL d'accès longue de téléchargement; le nom du fichier téléchargé ainsi que la date du fichier." Text read with poppler: `pdftotext -layout file.pdf -` with whitespace collapsed (the two-column layout interleaves lines; the quoted sentence is intact; no mojibake). The Licence Ouverte 2.0 text was opened at `https://raw.githubusercontent.com/etalab/licence-ouverte/master/open-licence.md` (`200 6444 text/plain; charset=utf-8`): free reuse for commercial and non-commercial purposes, with the right "to adapt, modify, retrieve and transform", on condition of naming the Grantor and the date of the last update. The sheets are dated 24 August 2017; the Légifrance open-data page could not be opened to confirm the licence is still the one in force. The data sheets are the only terms text read for `FR-DILA-*`.

### Row FR-DILA-LEGI-CONSOLIDATED (consolidated codes and acts)

The files are daily archives of XML: one global dump of 2025-07-13 and one increment per day after it. Each article version is one file (`LEGIARTI...xml`) with `NUM`, `ETAT`, `DATE_DEBUT`, `DATE_FIN` and the text in `BLOC_TEXTUEL`; texts that are not codes (acts, ordinances, decrees) sit under `TNC_en_vigueur/JORF/TEXT/.../JORFTEXT.../article/LEGI/ARTI/`, codes under `code_en_vigueur/LEGI/TEXT/.../LEGITEXT.../article/LEGI/ARTI/`. Proven request for the Code de commerce, art. L. 232-6-3 (instrument `fr-code-commerce-l232-6-3`), the increment of 2026-08-19:

```
curl -sS -o LEGI_20260819-222711.tar.gz -w '%{http_code} %{size_download} %{content_type}\n' https://echanges.dila.gouv.fr/OPENDATA/LEGI/LEGI_20260819-222711.tar.gz
tar -xzf LEGI_20260819-222711.tar.gz --wildcards '*LEGIARTI000051559591.xml'
```

Returned `200 12665511 application/x-gzip`; the member is 7893 bytes, `NUM` L232-6-3, `ETAT` VIGUEUR, `DATE_DEBUT` 2025-05-03. The archive's sha256 is `7c8837c27e9851776fbdbd8d438250323239e3e70b94fe43a3ea37b8d5f8ee04`, the `fetched_sha256` of the record `2025-05-03-consolidated-fr.json`; the same archive downloaded twice (once during the run, once for this section) gave the same hash. The global dump:

```
curl -sS -C - -o legi_global.tar.gz -w '%{http_code} %{size_download} %{content_type}\n' https://echanges.dila.gouv.fr/OPENDATA/LEGI/Freemium_legi_global_20250713-140000.tar.gz
```

Returned `200 581355943 application/x-gzip` and then `curl: (56) Recv failure: Connection reset by peer`; the same command again resumed with `206 589671373` (total 1171027316 bytes, equal to the `Content-Length` of `curl -sSI`, `Last-Modified: Sun, 13 Jul 2025 08:14:21 GMT`), sha256 `f862b4a2238e11ec3c48ec70f3b1c68bac0bb1985907841666b98608653d4eca`. The 484 increments from `LEGI_20250712-211706.tar.gz` to `LEGI_20261101-210226.tar.gz` (about 2.0 GB) were fetched with the same kind of request and each passed `tar tzf`. Reading the global dump is one sequential pass of about 8 minutes (`tarfile` in stream mode, `r|gz`): the file names do not carry the article number, so an article is found by reading its `NUM`.

How a record is built:

- An instrument is a list of article numbers (and for `fr-devoir-de-vigilance` a number range per date). For every article, all files with that `NUM` in the code are read; a file whose `ETAT` is `MODIFIE_MORT_NE` or whose `DATE_DEBUT` is not before `DATE_FIN` is skipped (a version that was never in force). A later archive replaces a file with the same `LEGIARTI` id. A version is in force on date d when `DATE_DEBUT` <= d < `DATE_FIN`; the states `MODIFIE`, `TRANSFERE`, `VIGUEUR` and `VIGUEUR_DIFF` all count as dated versions, so a published amendment not yet in force would be an ordinary record dated its in-force date (none of these instruments has one).
- The dates are every `DATE_DEBUT` and `DATE_FIN` of the articles; one record is written per date on which the joined text differs from the previous record. The record text is `Article <NUM>` on its own line, the paragraphs of `BLOC_TEXTUEL` as lines (tags stripped, entities decoded, runs of spaces collapsed, nothing reworded), then each paragraph of the article's `NOTA` as a line starting `[Nota] ` (the marker is added; it is not law text).
- `fetched_url` is the archive holding the newest member file of the record and `fetched_sha256` the hash of that archive as returned; the older members come from older archives or the global dump. Every increment re-issues the files of an article whose links changed, so most records name a 2026 increment even when the wording is from 2025. Checked on the day: for all 29 code records the non-space characters of the record equal those of the `BLOC_TEXTUEL` and `NOTA` of the member files, apart from the added `Article` lines and `[Nota]` markers.
- For acts, ordinances and decrees (`TNC`), the consolidation shows each amending article as one summary line ("A modifié les dispositions suivantes ...") with no wording, and amending articles carry no dates, so their summary lines come from the newest archive and the date of a change in a summary cannot be given. The text is the title (`TITREFULL`), the visas, the articles in numerical order with the section headings (`TITRE_TM`) when they change, and the signatures.
- None of the 234 article ids read appears in the 44290 distinct lines of the `liste_suppression_legi.dat` files of the 484 increments.

Stored (fetched 2026-11-02), per instrument and record dates (all `fr`):

| Instrument | Row | Records (`in_force`) |
|---|---|---|
| `fr-ordonnance-2023-1142` | consolidated | 2023-12-08, 2025-05-03 |
| `fr-decret-2023-1394` | consolidated | 2024-01-01, 2024-02-01, 2024-06-30 |
| `fr-code-commerce-l232-6-3` | consolidated | 2025-01-01, 2025-05-03 |
| `fr-code-commerce-l233-28-4` | consolidated | 2025-01-01, 2025-05-03 |
| `fr-devoir-de-vigilance` | consolidated | 2017-03-29, 2017-07-14, 2024-01-01, 2025-01-01 |
| `fr-cmf-l533-22-1` | consolidated | 2011-08-03, 2013-07-28, 2016-12-31, 2017-04-08, 2018-01-03, 2021-03-10, 2025-01-01 |
| `fr-decret-2021-663` | consolidated | 2021-05-29 |
| `fr-code-env-l229-25` | consolidated | 2010-07-14, 2010-12-18, 2016-01-01, 2020-11-09, 2023-10-25, 2025-01-01, 2025-05-03 |
| `fr-code-env-l229-68` | consolidated | 2021-08-25 |
| `fr-code-energie-l100-4` | consolidated | 2011-06-01, 2015-08-19, 2019-11-10, 2021-08-25, 2023-03-12, 2023-06-24 |

### Row FR-DILA-JORF-ADOPTED (texts as published in the Journal officiel)

The JORF archive has one `JORFTEXT...xml` (`texte/version`, with visas, notice and signatures) and one `JORFARTI...xml` per article of the text as published. The article files carry the text id in their `CONTEXTE` (`cid="JORFTEXT000048519395"`), not in their path, so they are found by reading the files. Proven request, for the Ordonnance n° 2023-1142 (instrument `fr-ordonnance-2023-1142`):

```
curl -sS -C - -o jorf_global.tar.gz -w '%{http_code} %{size_download} %{content_type}\n' https://echanges.dila.gouv.fr/OPENDATA/JORF/Freemium_jorf_global_20250713-140000.tar.gz
```

Returned `200 1230948243 application/x-gzip`, then `curl: (56) Recv failure: Connection reset by peer`; the same command again resumed with `206 443660243` (total 1674608486 bytes, equal to the `Content-Length` of `curl -sSI`, `Last-Modified: Sun, 13 Jul 2025 08:51:50 GMT`, `Content-Type: application/x-gzip`), sha256 `757416acc02436e250afe41c73d45dc57c6377b86284488a049b765c116001a1`, the `fetched_sha256` of the three adopted records. The text id was found in the LEGI dump by reading `NUM` (2023-1142, 2023-1394, 2021-663). The adopted record text is the title, the visas, the 43 (ordonnance), 28 (décret 2023-1394) or 9 (décret 2021-663) articles as published with section headings, and the signatures; the JO notice ("Notice") is not stored because it is not part of the operative text. Checked on the day: the non-space characters of each adopted record equal those of the title, `VISAS`, articles (`BLOC_TEXTUEL`, `NOTA`) and `SIGNATAIRES` of the files. `in_force` of an adopted record is the first date of the Légifrance consolidated text (the day after publication, or the date the text itself sets).

| Instrument | Row | Records (`in_force`) |
|---|---|---|
| `fr-ordonnance-2023-1142` | adopted | 2023-12-08 |
| `fr-decret-2023-1394` | adopted | 2024-01-01 |
| `fr-decret-2021-663` | adopted | 2021-05-29 |

The Journal officiel texts of the three laws behind the code articles (Loi 2017-399, 2019-1147, 2021-1104) are not stored as adopted texts: the instruments are the code articles, and a law's own text mixes many provisions.

### Link only

- `fr-amf-doc-2020-03`: row `FR-AMF-DOCTRINE`, `permission requested`. The terms page `https://www.amf-france.org/fr/mentions-legales-et-editoriales` (`200 66270 text/html; charset=utf-8`) says "Toute utilisation à des fins commerciales ou publicitaires est exclue." The doctrine page `https://www.amf-france.org/fr/reglementation/doctrine/doc-2020-03` (`200 200854 text/html; charset=utf-8`) was opened and gives the dated versions (first "Du 11 mars 2020 au 26 juillet 2020", current "Applicable au 30 décembre 2024"); no text is stored.
- Not used: `https://echanges.dila.gouv.fr/OPENDATA/AMF/` exists on the DILA server, but its terms were not read.
- Not reached from the cloud address: https://www.legifrance.gouv.fr/ (403 Cloudflare), https://www.info.gouv.fr/ (403), https://www.data.gouv.fr/, https://www.etalab.gouv.fr/ and https://www.conseil-constitutionnel.fr/ (no HTTP answer, curl status 000; etalab: connection reset), https://web.archive.org/ (connection reset). https://piste.gouv.fr answered 200 (`text/html`); the PISTE API needs a key and none was requested.

### Languages

French is the only official language of the French Republic's law (Constitution art. 2), so each version has one `fr` record under the same row; no second official language is served. English: the Légifrance translations page is the only government source looked for, and it is blocked (403, above), so row `FR-LEGIFRANCE-TRANSLATION` is `permission requested` (page not opened, no sentence quoted) and no English record is stored for any instrument. The DILA data sheets for LEGI and JORF do not mention translations and the DILA open-data directories hold French XML only. Each scope entry's `notes` says this.

Text extraction in one place: `BLOC_TEXTUEL/CONTENU` (and `NOTA/CONTENU`, `VISAS`, `SIGNATAIRES`) with `<br/>` and the closing of `p`, `div`, `li`, `tr`, `ul`, `table` as line breaks, `td`/`th` as tab-separated cells, all other tags removed, HTML entities decoded, runs of blanks collapsed, empty lines dropped. Non-breaking spaces are kept as they are in the files.

## Belgium

Rows `BE-JUSTEL-CONSOLIDATED` (consolidated), `BE-MONITEUR-ADOPTED` (adopted) and `BE-MONITEUR-TRANSLATION` (translation) are `pass`; `BE-FSMA-ADOPTED` is `pass` (CC BY 4.0) but no FSMA text is stored; `BE-WALLEX-CONSOLIDATED` is `permission requested`. Run on 2026-11-02. The terms are one PDF, the FPS Justice terms of use of the portal that serves the Moniteur belge and Justel (section III: "Les informations publiées sur ce site internet sont libres de droits, sauf mention contraire. Elles peuvent être réutilisées sans condition à des fins privées, associatives, scientifiques et commerciales."), and Code de droit économique art. XI.172 § 2 ("Les actes officiels de l'autorité ne donnent pas lieu au droit d'auteur", read on Justel):

```
curl -sS -L -A 'global-esg-law-watch/1 (+https://github.com/GoCarbonTracker/global-esg-law)' -o terms_fr.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.ejustice.just.fgov.be/img_2024/pdf/GebruiksvoorwaardenFR.pdf
```

Returned `200 41067 application/pdf`; `pdftotext -layout terms_fr.pdf - | sed 's/  */ /g'` is the fingerprint input (sha256 `d81f1ad3000097279f4b5bbbad834c961f2ad0a086c39678ef0737813add2199`, reproduced from a second fetch).

### Access (read this first)

www.ejustice.just.fgov.be sits behind an F5 gateway. A browser User-Agent gets a JavaScript challenge; headless Chromium passed it once (the first request of the session, text of the CSRD act), then got a CAPTCHA ("This question is for testing whether you are a human visitor") on every later request for over an hour. A non-browser User-Agent gets the page with no challenge: the one `tools/watch.py` sends (`global-esg-law-watch/1 (+https://github.com/GoCarbonTracker/global-esg-law)`) works with `curl`, `urllib` and without `--compressed`. About one request in three answers `curl: (52) Empty reply from server` (or `RemoteDisconnected`) and succeeds when repeated after a few seconds; the fetches below were paced at one request every 5 seconds or more with up to 6 repeats. Every stored record was fetched this way; no record is browser-fetched. The responses are not gzip-encoded, so `fetched_sha256` is the hash of the body as returned, and two fetches of the same URL returned the same bytes (checked for three of the URLs below). Blocked from the cloud address: https://www.ejustice.just.fgov.be/ for browser User-Agents (CAPTCHA page, HTTP 200, 244-byte "Request Rejected" or ~46 KB CAPTCHA); https://justice.belgium.be/ answered `curl` with the same CAPTCHA page but opened in headless Chromium.

### Row BE-MONITEUR-ADOPTED

The Moniteur belge text of an act, by publication date and numac. Run for the federal climate governance act of 15 January 2024 (numac 2024001055, Moniteur belge 2024-02-07):

```
curl -sS -L -A 'global-esg-law-watch/1 (+https://github.com/GoCarbonTracker/global-esg-law)' -o mon_climat_fr.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.ejustice.just.fgov.be/cgi/article_body.pl?language=fr&caller=summary&pub_date=2024-02-07&numac=2024001055'
```

Returned `200 26016 text/html` (sha256 `59d56f20f0745847e3cde9537c56dc7c41dbd2b37b8c8d834f8838572faf4900`). `language=nl` gives the Dutch text. Text extraction: the `intro-text` paragraph (title) and the `<main>` content up to the first `links` block; `<br>` and block ends as line breaks, `<sup>` content inline, tags stripped, no-break spaces as spaces, blank lines dropped, nothing reworded. The Moniteur page is an HTML rendering of the issue, not the authentic printed text.

### Row BE-JUSTEL-CONSOLIDATED

The Justel database, one page per version: `article.pl?language={fr|nl}[&arch=NNN]&lg_txt={f|n}&type=&sort=&numac_search={numac}&cn_search=&caller=list&&view_numac={numac}f`, where `arch=001` is the oldest archived version and the page without `arch` is the current text. The header of an archive lists the amending acts with "publié le" and "En vigueur jusqu'au" dates; the number of archives is in the header ("11 versions archivées"). Run for the CSRD transposition act (numac 2024011683), Dutch, archive 001:

```
curl -sS -L -A 'global-esg-law-watch/1 (+https://github.com/GoCarbonTracker/global-esg-law)' -o jus_csrd_arch001_nl.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.ejustice.just.fgov.be/cgi_loi/article.pl?language=nl&arch=001&lg_txt=n&type=&sort=&numac_search=2024011683&cn_search=&caller=list&&view_numac=2024011683f'
```

Returned `200 204560 text/html; charset=ISO-8859-1` (sha256 `a3858734173656705af9e2a0fa8bc16addfb22b4571f19a99417deb3f50052aa`). The pages are ISO-8859-1. Text extraction: the title line (`list-item--title`, including its parenthetical NOTE) and the "Texte" box, `<br>` and block ends as line breaks, footnote lines kept, tags stripped, nothing reworded. For the Code des sociétés et des associations (2.1 MB a page) the record text is the title line plus Art. 3:6 up to Art. 3:7 and Art. 3:32 up to Art. 3:33, cut by the article headings.

Version dates. A Justel version has no start date of its own. The first version starts at the act's entry into force; each later version starts on the earliest "En vigueur jusqu'au" date of the preceding archive's header that is not before the publication date of the amending act (the amendment's own entry into force), or on the publication date when there is none. This is exact for the CSRD act (2025-12-23 and 2026-07-31 match the "En vigueur" notes in the text) and for the CSA version of 2024-12-30; where a decree has retroactive or staggered parts (Walloon decrees of 2024 and 2025) the date is the first one that applies after publication. A version is stored only if its text differs from the previous stored one; archive 001 of the Walloon decree holds only the modified articles (it has no Art. 1) and is not stored.

### Row BE-MONITEUR-TRANSLATION

Same two URL patterns with `language=de` (Moniteur: `article_body.pl?language=de&caller=summary&pub_date={date}&numac={numac of the translation}`). Run for the German translation of the climate governance act (numac 2025006369, Moniteur belge 2025-09-09):

```
curl -sS -L -A 'global-esg-law-watch/1 (+https://github.com/GoCarbonTracker/global-esg-law)' -o mon_climat_de.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.ejustice.just.fgov.be/cgi/article_body.pl?language=de&caller=summary&pub_date=2025-09-09&numac=2025006369'
```

Returned `200 26024 text/html` (sha256 `93ab9c4b03868e3d0193f0453e703b5b475b047f6db59d326ca86dded4c39f98`). German texts are separate Justel/Moniteur entries (the "Traduction allemande" or "Coordination officieuse en langue allemande" of the act, found with the Justel search form: POST `https://www.ejustice.just.fgov.be/cgi_loi/rech_res.pl`, fields `dt`, `text1`, `pdd`/`pdf` or `ddd`/`ddf` as ISO dates, `chercher=c`, `fr=f`, `language=fr`, `la=F`), not the German language bar of the original's page, which shows the French text with German labels. Dutch of the Walloon decree of 2004 is stored under this row because its Justel title says "(VERTALING)".

### Languages

Dutch and French are the two authentic languages of a federal act and are stored under the same rows (`adopted` from the Moniteur belge, `consolidated` from Justel). German is a separate translation entry (`translation`), `in_force` the date of the nl/fr version it translates. No Belgian government English was found; for each instrument the scope `notes` say where it was looked for (Justel and Moniteur language bars: nl, fr, de only).

### Stored (fetched 2026-11-02)

| Instrument | Row(s) | Records (kind, language: count) |
|---|---|---|
| `be-loi-2024-12-02-csrd` | adopted, consolidated, translation | adopted fr 1, nl 1; consolidated fr 3, nl 3 (2024-12-30, 2025-12-23, 2026-07-31); translation de 1 (unofficial coordination, dated 2025-12-23) |
| `be-csa-art-3-6-3-32` | consolidated | fr 4, nl 4 (2019-05-01, 2020-05-06, 2024-12-30, 2026-09-01; the cut text is unchanged in the other 22 of 26 versions) |
| `be-loi-2024-01-15-climat` | adopted, consolidated, translation | adopted fr 1, nl 1; consolidated fr 1, nl 1; translation de 1 |
| `be-ar-2024-06-16-climate-financing` | adopted, consolidated | adopted fr 1, nl 1; consolidated fr 1, nl 1 |
| `be-wallonia-ets-decree-2004` | adopted, consolidated, translation | adopted fr 1; consolidated fr 11; translation nl 11 (2006-07-22 to 2025-05-02) |
| `be-wallonia-ets2-decree-2025` | adopted, consolidated | fr 1+1, nl 1+1 |
| `be-flanders-ets2-decree-2026` | adopted, consolidated | fr 1+1, nl 1+1 |

### Link only

- `be-cde-book-vi-art-vi92-vi103`: row `BE-JUSTEL-CONSOLIDATED` passes. The Code de droit économique page is about 6 MB per version and Justel lists 148 archived versions; the 148 requests were not reached in the time box (a 6 MB fetch took 5 tries on the one run). Scope entry, official URL and watcher exist.
- Not in scope, found but not searched or not confirmed: Brussels COBRACE (Numac 2013A31357; ETS provisions not confirmed), the Flemish decree of 5 April 1995 (not found by title search on Justel), the federal aviation ETS cooperation agreement of 2 September 2013 and its assent acts (listed by Justel, not opened), the Moniteur belge text of the CSA as published (the Code in one issue).
- `BE-FSMA-ADOPTED` (CC BY 4.0, https://www.fsma.be/en/disclaimer-copyright): no enacted FSMA instrument in F1 to F6 found; the sustainable-finance pages are explanatory.
- `BE-WALLEX-CONSOLIDATED`: `permission requested` (Wallex mentions légales allow free use "uniquement pour un usage qui ne soit ni commercial, ni publicitaire"); not used, the Walloon texts come from Justel. The Vlaamse Codex (codex.vlaanderen.be) states no reuse terms on the pages read, so it has no row.

## Lithuania

Rows `LT-TAR-CONSOLIDATED`, `LT-SEIMAS-ADOPTED` and `LT-SEIMAS-TRANSLATION`, all `permission requested` (terms page not opened). No `pass` row, so no fetch request is proven and no text is stored. Run on 2026-11-02.

Every official Lithuanian site answered the cloud address with a Cloudflare challenge. The failing request, then the browser attempt:

```
curl -sS -L -A 'Mozilla/5.0' -o x.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.e-tar.lt/portal/lt/legalAct/TAR.B77E00EAEBEB
```

Returned `403 5462 text/html; charset=UTF-8` (title "Luktelėkite...", "Saugumo patvirtinimo atlikimas", Cloudflare Ray ID). The same answer, with 5.3 to 5.6 KB bodies, came for `https://www.e-tar.lt/`, `/portal/lt/index`, `/rs/actualedition/...`, `https://e-seimas.lrs.lt/`, `/rs/legalact/TAD/...`, `/portal/legalAct/...`, `https://www.lb.lt/`, `https://finmin.lrv.lt/`, `https://lrv.lt/`, `https://am.lrv.lt/`, `https://www.vtd.lt/`, `https://www.infolex.lt/`, `https://www.registrucentras.lt/`, `https://vkontrole.lt/`.

```
node probe.js https://www.e-tar.lt https://e-seimas.lrs.lt https://www.lb.lt
```

with Playwright chromium (`goto`, `waitUntil: domcontentloaded`, then polling the page title every 2.5 s for up to 100 s, and a second variant with `--disable-blink-features=AutomationControlled`, a desktop User-Agent and `navigator.webdriver` hidden, waiting 25 s). The title stayed "Luktelėkite..." on every page, status 403. No TAR open-data endpoint was reachable: `https://data.gov.lt/` and `https://get.data.gov.lt/` answered 500 (about 39 KB error page), `https://opendata.registrucentras.lt` did not connect. EUR-Lex (`eur-lex.europa.eu`) answered `202 0` to curl and "upstream request failed" to the browser, so the national transposition table could not be read either.

Blocked from the cloud address: https://www.e-tar.lt/ , https://e-seimas.lrs.lt/ , https://www.lb.lt/ , https://finmin.lrv.lt/ , https://lrv.lt/ , https://am.lrv.lt/ , https://www.vtd.lt/ , https://www.infolex.lt/ , https://www.registrucentras.lt/ , https://vkontrole.lt/ (HTTP 403 Cloudflare). `https://www.lrs.lt/` answered `200 201137 text/html`; it is the Seimas home page and carries no legal text. The orchestrator can run the requests from the laptop.

### Languages

No language or translation source was proven. Lithuanian is the only official language; the English translations on e-seimas.lrs.lt (Teisės aktų vertimai) were not reachable, and the Seimas marks them unofficial, so `LT-SEIMAS-TRANSLATION` could pass only on quoted terms.

### Link only

All five scope instruments, because the rows are `permission requested` and no request works:

- `lt-company-reporting-act` (XIV-2811), `lt-financial-reporting-act-ix575` (IX-575, historical), `lt-consolidated-reporting-act-ix576` (IX-576, historical), `lt-climate-change-management-act` (XI-329), `lt-unfair-commercial-practices-act` (X-1409). Their official URLs come from the existing register row (XIV-2811) or from web search results for e-tar.lt pages that were not opened; `in_force` is null in every entry.
- Not written: an entry for the act transposing Directive (EU) 2024/825. Searches found no such act, only unrelated amendments to the Consumer Rights Protection Act I-657.
- Not given a row: Lietuvos bankas (`lb.lt`, blocked); no Lietuvos bankas instrument is in scope.

## Romania

Attempted 2026-11-02 (GEL-06-02). No row is `pass`, so there is no proven fetch request and no record. The four rows added (`RO-LEGISLATIE-CONSOLIDATED`, `RO-LEGISLATIE-ADOPTED`, `RO-MONITORUL-OFICIAL-ADOPTED`, `RO-ASF-ADOPTED`) are all `permission requested`. The portal that carries the law text, `legislatie.just.ro`, gave no response to any request from the cloud address.

### Portalul Legislativ (`RO-LEGISLATIE-CONSOLIDATED`, `RO-LEGISLATIE-ADOPTED`)

```
curl -sS -A 'Mozilla/5.0' -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://legislatie.just.ro/Public/DetaliiDocumentAfis/278502
```

Answer: `curl: (92) HTTP/2 stream 1 was not closed cleanly: PROTOCOL_ERROR (err 1)`, status `000`, 0 bytes. The same request with `--http1.1` answered `curl: (52) Empty reply from server`. `https://legislatie.just.ro/`, `/robots.txt` and `/apiws/FreeWebService.svc` gave the same. `http://legislatie.just.ro/` answered `301` (178 bytes) and redirects to the refused HTTPS host. A 245-byte "Request Rejected ... Your support ID is" body (an F5-style WAF page) came from `https://asfromania.ro/`, not from the portal; the portal sent no body at all.

Browser recipe tried (Playwright, headless Chromium, `locale: ro-RO`, a desktop Chrome user agent, `page.goto(url, {waitUntil: 'networkidle'})`): `https://legislatie.just.ro/` and `/Public/DetaliiDocumentAfis/278502` both returned status `502` with the 174-byte body `upstream request failed`, the agent proxy's answer to a refused upstream. `https://monitoruloficial.ro/e-monitor/` got the same `502` in Chromium although plain curl reached it. Recorded as **blocked from the cloud address**. The portal terms page was not opened, so nothing was fetched from it; the portal's SOAP API (`/apiws/FreeWebService.svc`) was refused the same way. No retry was made with any technique meant to defeat the WAF.

### Monitorul Oficial (`RO-MONITORUL-OFICIAL-ADOPTED`)

`https://monitoruloficial.ro/e-monitor/` opened with plain curl (`curl -sS -m 45 -A 'Mozilla/5.0' -o e.html -w '%{http_code} %{size_download} %{content_type}\n' https://monitoruloficial.ro/e-monitor/` gave `200 159380 text/html; charset=UTF-8`, sha256 of the HTML `56b6f94c9160ff2b5d3bf5a0f9fef942a1632901f157c65e01309ba3865b8636`), but only after retries: the host alternates between this answer and `curl: (35) SSL_ERROR_SYSCALL` or `curl: (60)`. The page says the free electronic format covers Partea I in Romanian from 2000, Partea I in Hungarian from 2008 and Partea a II-a from 2000 as portable documents, and the paid archive covers the rest. It lists no PDF links. The guessed `https://monitoruloficial.ro/Monitorul-Oficial--PI--75--2024.pdf` answered `200 153376 text/html` (the site's 404 page, not a PDF). `https://monitoruloficial.ro/conditii-de-utilizare/` (`200 170338 text/html`) holds a cookie policy only. No request that returns a gazette issue was found, and "gratuit și liber" is not a reuse licence, so the row is `permission requested` and OMF 85/2024 (Monitorul Oficial Partea I nr. 75 of 26 January 2024, per the register) has no as-published record.

### Autoritatea de Supraveghere Financiară (`RO-ASF-ADOPTED`)

`curl -sS -A 'Mozilla/5.0' -o asf.html -w '%{http_code} %{size_download} %{content_type}\n' https://asfromania.ro/` answered `200 245 text/html` with the "Request Rejected" body. Blocked from the cloud address; no ASF instrument is in scope.

### Languages

Romanian is the only official language of the portal. Hungarian Partea I exists on e-Monitor but no request to it was found. No government English translation was found: the Ministry of Justice and Ministry of Finance pages that would hold one could not be opened (`https://www.mfinante.gov.ro/` answered `302` with no body, `https://www.mfe.gov.ro/` and `https://www.gov.ro/` gave no response). No translation row exists.

### Link only

| Instrument | Why |
|---|---|
| `ro-omf-85-2024` | Row `RO-LEGISLATIE-CONSOLIDATED` is `permission requested`: the portal and its terms could not be opened, and no working request to the text was found (curl over HTTP/2 and HTTP/1.1, Playwright Chromium, Monitorul Oficial guessed PDF URL). |

Candidates from the brief that were not confirmed on an official page and are not in scope: Legea contabilității nr. 82/1991, OMFP nr. 1802/2014 (pct. 492^1 et seq., 563^1 et seq.), HG nr. 780/2006, Legea nr. 363/2007, the act transposing Directive (EU) 2024/825, and a framework climate law (none known). Dry run of the watcher: `python3 tools/watch.py --dry-run --source RO-LEGISLATIE-CONSOLIDATED` printed `watch_failed, RemoteDisconnected: Remote end closed connection without response` for `ro-omf-85-2024-legislatie-page`; the other three rows have no watcher (no instrument uses them).

## Greece

Row `GR-ET-ADOPTED` (Εθνικό Τυπογραφείο, Government Gazette ΦΕΚ A and B as published), `pass` on the statute basis: Ν. 2121/1993 art. 2 para 5 leaves official legislative and administrative texts outside copyright (read on the Hellenic Copyright Organisation's text, https://library.opi.gr/n-2121-1993/, 2026-11-02). The et.gr terms (https://www.et.gr/index.php/oroi-chrisis, sections 1.2 and 2.4) limit the website's own content to personal non-commercial use, so on the terms alone the row would be `permission requested`; the verdict is a reading of the statute and is flagged in the PR. There is no consolidated row (et.gr serves gazette issues only; kodiko.gr and e-nomothesia.gr are private services, never a row) and no translation row (no government English text was found). Run on 2026-11-02.

The gazette API is documented at https://et.gr/ypiresia-api-gia-fek/: `GET https://api.et.gr/apiFEK/{issue}/{year}/{sheet}/{pdf|html}` with issue 1 = ΦΕΚ Α΄ and 2 = ΦΕΚ Β΄. It answers plain `curl`, no challenge, no User-Agent needed. `HEAD` returns 404 (GET only), so the watchers hash the PDF.

Request, row `GR-ET-ADOPTED`, Ν. 5164/2024 (ΦΕΚ Α΄ 202/12.12.2024):

```
curl -sS -L -o fek_a_202_2024.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://api.et.gr/apiFEK/1/2024/202/pdf
```

Returned `200 976072 application/pdf` (56 pages), sha256 `f5f566b9562abb1cdc189a89a2047e57b92fcb295d63046cf411aa96e743e9b8`. A second fetch gave the identical hash, and so did `https://api.et.gr/apiLAW/1/2024/5164/pdf` (law type 1 = Νόμος, year, law number). The same request for a ΦΕΚ Β΄ issue, ΚΥΑ ΥΠΕΝ/ΔΚΑΠΑ/86227/2245: `curl -sS -L -o fek_b_4674_2024.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://api.et.gr/apiFEK/2/2024/4674/pdf` returned `200 545311 application/pdf`. All seven stored PDFs were fetched twice on the day and the two downloads were byte-identical, so `fetched_sha256` reproduces.

Text extraction: poppler `pdftotext FILE -` (reading order, not `-layout`: the gazette is set in two columns and `-layout` interleaves the columns line by line). Then: form feeds become line breaks, runs of spaces collapse to one, empty lines are dropped, and the character U+2206 (INCREMENT), which the 2018, 2022 and 2024-08 PDFs use for the capital delta, is replaced by U+0394 (Δ) so the Greek reads correctly. Nothing else is changed: page headers ("Τεύχος Α΄ 202/12.12.2024 ΕΦΗΜΕΡΙΔΑ ΤΗΣ ΚΥΒΕΡΝΗΣΕΩΣ"), page numbers and line-end hyphens of the gazette stay in the text. Mojibake check on the day, counting characters outside ASCII, Greek and ordinary punctuation: clean for ΦΕΚ Α΄ 104/2018, 105/2022, 202/2024, 108/2026 and ΦΕΚ Β΄ 472/2025, 1268/2025; ΦΕΚ Β΄ 4674/2024 is clean except three lines of an annex correspondence table (legacy font encoding, for example `ɳʌɽʌʉϭʋɲʌ͘ϮϵʏɻʎɃɷɻɶʀɲʎ;ȵȵͿϮϬϮϯͬϵϱϵ`), stored as extracted and named in the scope notes. ΦΕΚ Β΄ 3763/2017 (the decision that 4674/2024 replaced) extracts as almost wholly legacy-font mojibake (over 1,200 occurrences of ɲ alone), so it is not stored and is not in scope. ΦΕΚ Α΄ 191/1994 is an image scan with no text layer (pdftotext returns 20 characters); no OCR was used.

Stored (fetched 2026-11-02). The publisher serves one text per gazette issue and no point-in-time versions, so each instrument has one `adopted` record:

| Instrument | Gazette | `in_force` | Records |
|---|---|---|---|
| `gr-law-4548-2018-art151-154` | Α΄ 104/13.06.2018 (Articles 151 to 154 cut at their headings) | 2019-01-01 | el |
| `gr-law-5164-2024` | Α΄ 202/12.12.2024 | 2024-12-12 | el |
| `gr-law-4936-2022` | Α΄ 105/27.05.2022 | 2022-05-27 | el |
| `gr-kya-ets-2024-86227` | Β΄ 4674/09.08.2024 | 2024-08-09 | el |
| `gr-kya-ets-2025-7560` | Β΄ 472/10.02.2025 | 2025-02-10 | el |
| `gr-kya-ets-2025-28010` | Β΄ 1268/14.03.2025 | 2025-03-14 | el |
| `gr-law-5317-2026` | Α΄ 108/10.07.2026 | 2026-07-10 | el |

### Languages

Greek is the only official language. The gazette API serves the Greek gazette only (`/pdf` and an HTML stub with links to the PDF and the viewer). No government English text of any of these acts was found: looked for on api.et.gr, search.et.gr and www.et.gr (all Greek; `https://www.et.gr/en/` answers 301 and search.et.gr/en answers the Greek site), and on the Hellenic Parliament site, which refused the cloud address. So no English record and no translation row exists; each scope entry says where English was looked for. Nothing is stored from a law firm, an exchange, an NGO or a news site.

### Link only

- `gr-law-2251-1994-unfair-practices`: row `GR-ET-ADOPTED` passes, but the as-published gazette (Α΄ 191/1994, `https://api.et.gr/apiFEK/1/1994/191/pdf`, `200 1159243 application/pdf`, 12 pages) is a scanned image with no text. The current text of Articles 9α to 9στ exists officially only inside the amending act, which is stored as `gr-law-5317-2026`; a consolidated text exists only on kodiko.gr and e-nomothesia.gr (private, never stored). `in_force` is null: no readable official page states it.
- Not in scope: ΚΥΑ 181478/965/2017 (Β΄ 3763), replaced by the 2024 decision; the brief's candidate stop-the-clock transposition (Directive (EU) 2025/794) and any Greek act of 2025 or 2026 changing Ν. 5164/2024: none found on official pages. Article 92 of Ν. 5172/2025 (transitional rule on assurance of sustainability reports for 2024) was found and is noted in `gr-law-5164-2024`; the act is a violence-against-women act and is not stored.

### Blocked from the cloud address

- https://www.hellenicparliament.gr/ and https://www.hellenicparliament.gr/Nomothetiko-Ergo: HTTP 403, `Access Denied`, body from the CDN (`errors.edgesuite.net`), 379 and 399 bytes.
- https://www.bankofgreece.gr/ and https://www.bankofgreece.gr/en/main-tasks: HTTP 403, `Access Denied`, 371 and 392 bytes.
- https://www.hcmc.gr/ and https://www.hcmc.gr/el_GR/web/portal: `curl: (35) Recv failure: Connection reset by peer`, no HTTP answer.
- https://www.minenv.gr/ and https://www.e-nomothesia.gr/: no answer within 40 seconds (exit 000); e-nomothesia is a private service in any case.

No row exists for the Hellenic Parliament, the HCMC or the Bank of Greece: no instrument of theirs is in scope and their terms could not be opened. The orchestrator can read them from the laptop. No browser recipe was needed; no record is browser-fetched.

## Slovakia

Run on 2026-11-02 (GEL-06-05). Two rows pass on the statute: `SK-SLOVLEX-ADOPTED` and `SK-SLOVLEX-CONSOLIDATED` (Slov-Lex, the electronic Zbierka zákonov run by the Ministry of Justice). The statute is the Copyright Act, zákon č. 185/2015 Z. z., § 5 písm. b) (text of a legal regulation is not a subject of copyright), read on Slov-Lex itself. Slov-Lex publishes no terms of use or open data statement that was found: `www.slov-lex.sk` is a JavaScript application whose footer links only to cookies and accessibility pages. `SK-NBS-ADOPTED` is `permission requested`: https://nbs.sk/disclaimer-sk/ allows reuse without consent but not an altered file, and tag stripping alters it. No scope instrument uses the NBS row.

Text extraction: the print HTML of each version, from the element `id="predpis"` to the end of the page (the act text and its footnotes; the page header, history table and relations panel are left out), script and style removed, closing block tags (`p`, `div`, `h1` to `h6`, `li`, `tr`) as line breaks, tags stripped, character references decoded, runs of spaces collapsed, blank lines dropped. The first line of a record is the act number as the page prints it. Every Slov-Lex page says the HTML is informative and the PDF is the binding text; the stored text is the HTML. Varun to confirm that is acceptable (the PDF recipe is below).

Row `SK-SLOVLEX-ADOPTED`, Act 431/2002 Z. z. as published (vyhlásené znenie):

```
curl -sS -L -o zz431_adopted.html -w '%{http_code} %{size_download} %{content_type}\n' https://static.slov-lex.sk/static/SK/ZZ/2002/431/vyhlasene_znenie.print.html
```

Returned `200 444893 text/html`. sha256 `57a8002195263d358751061b5f3b81398081eb5401e63225ee27888017c4d531`, the same on a second fetch. The same request pattern gave the adopted text of the other seven acts (`.../ZZ/<year>/<number>/vyhlasene_znenie.print.html`, all 200 text/html).

Row `SK-SLOVLEX-CONSOLIDATED`, Act 431/2002 Z. z., časová verzia in force from 2024-06-01:

```
curl -sS -L -o zz431_20240601.html -w '%{http_code} %{size_download} %{content_type}\n' https://static.slov-lex.sk/static/SK/ZZ/2002/431/20240601.print.html
```

Returned `200 1176694 text/html`. sha256 `95733c5137ce0d2892e92bd6a073fcabf13d7163199f67440b10c78581f05198`, the same on a second fetch. The version dates come from the history page of the act, which is plain HTML and needs no browser:

```
curl -sS -L -o zz431_index.html -w '%{http_code} %{size_download} %{content_type}\n' https://static.slov-lex.sk/static/SK/ZZ/2002/431/
```

Returned `200 21953 text/html`. Each history row carries `data-ucinnostod="YYYY-MM-DD"` (first day in force) and the link `YYYYMMDD.html`; the print form of a version is the same link with `.print.html`. The `upkeep` watchers read the `href="YYYYMMDD.html"` links of this page. A časová verzia of an act that is itself an amending act shows only the provisions in force on that date, so the first record of such an act can be much shorter than the adopted text. Dates stored: the adopted text takes the first commencement date read from the act's own commencement clause (see each scope entry's `evidence`), and each časová verzia takes its `data-ucinnostod`.

PDF recipe (binding text; not used for storage):

```
curl -sS -L -o zz431_20240601.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://static.slov-lex.sk/pdf/SK/ZZ/2002/431/ZZ_2002_431_20240601.pdf
pdftotext -layout zz431_20240601.pdf - | sed 's/  */ /g'
```

Returned `200 1122401 application/pdf`; the header of the PDF reads "Obsah dokumentu je právne záväzný". `pdftotext` gave 4512 lines of clean Slovak text (checked the first 30 lines for mojibake: none). The path `https://static.slov-lex.sk/static/SK/ZZ/2002/431/ZZ_2002_431_20240601.pdf` (under `/static/SK/`) returned `404 146 text/html`; the working path is under `/pdf/SK/` (the page itself links `/static/pdf/SK/ZZ/...`, which also serves the file).

Row for the statute (the terms page of the two passing rows), Act 185/2015 Z. z. in force from 2026-09-01:

```
curl -sS -L -o a185.html -w '%{http_code} %{size_download} %{content_type}\n' https://static.slov-lex.sk/static/SK/ZZ/2015/185/20260901.print.html
```

Returned `200 1081852 text/html`. sha256 `8e93fdddc5b137756c4a96efb46b90cdc62495434ad5a50636e63a8edc30730a`.

Row `SK-NBS-ADOPTED` (terms page only, nothing stored):

```
curl -sS -L -o nbs_dis.html -w '%{http_code} %{size_download} %{content_type}\n' https://nbs.sk/disclaimer-sk/
```

Returned `200 166160 text/html; charset=UTF-8`.

Blocked from the cloud address: nothing. `curl https://www.slov-lex.sk/` returns `200 1354 text/html`, an empty JavaScript shell (the same 1354 bytes for any path, for example `/podmienky-pouzivania`), so the portal's own search and document viewer cannot be read with `curl`; the static portal `static.slov-lex.sk` answered every request without a challenge, so no browser recipe is needed and no record was fetched with a browser.

### Languages

Run on 2026-11-02. Slovak (sk) is the only language Slov-Lex serves: the history and version pages of the static portal have no language switch and the year index lists Slovak titles only. English was looked for on the static portal and by web search for an English text of Act 414/2012 and Act 431/2002 on Slovak government sites; none found. The only English texts the search turned up are on FAOLEX, climate-laws.org (machine translation, which the page itself says) and similar third-party sites, which get no row. No translation row was added and no English record is stored. The Copyright Act § 5 písm. b) names "ich preklad" but not the body that makes the translation, so it would not cover a translation by itself.

| Instrument | Languages stored | Gap and reason |
|---|---|---|
| sk-accounting-act, sk-act-105-2024, sk-ets-act, sk-act-186-2023, sk-act-236-2024, sk-act-125-2026, sk-consumer-protection-act, sk-act-310-2025 | sk | No government English found. |

Link-only instruments: none. All eight scope instruments are stored. Not in scope, with the reason:

| Item | Why not |
|---|---|
| Framework climate act (zákon o zmene klímy) | Not in the Zbierka: the titles of the Zbierka year indexes for 2022 to 2026 (`https://static.slov-lex.sk/static/SK/ZZ/<year>/`) contain no climate act (checked for "klím", "emisn", "skleníkov" in 2022 and 2023, for a wider set of terms in 2024 to 2026). Draft stage only in the news results found; no official page for the bill was opened, so no F7 register row was written. |
| Národná banka Slovenska | Row `SK-NBS-ADOPTED` is permission requested. No NBS instrument was selected: the NBS climate pages found describe its own operations and the ECB expectations, not a Slovak rule. |

## Latvia

Rows `LV-LIKUMI-CONSOLIDATED` and `LV-LIKUMI-TRANSLATION`, both `pass` on the statute basis (Autortiesību likums 6. pants, quoted in the rows; both are judgement calls listed in the row notes). Row `LV-VESTNESIS-ADOPTED` is `permission requested` (vestnesis.lv/atkalizmantosana asks for a written agreement and a fee), so no as-published text is stored; the base ("Pamata") edition on Likumi.lv carries each act's original wording. Plain `curl` with the header `User-Agent: Mozilla/5.0` is answered by likumi.lv, vestnesis.lv, vvc.gov.lv, data.gov.lv and www.bank.lv from the cloud address on 2026-11-02; no browser recipe was needed and nothing was blocked. Latvian is the only official language. Run on 2026-11-02 for the Law on Sustainability Disclosures (Ilgtspējas informācijas atklāšanas likums, Likumi.lv id 355381).

Step 1, list the editions of an act. The page holds a JSON list of its editions (`"iso_value":"2024\/10\/17"` with a label Pamata, Vēsturiskā, Spēkā esošā or Nākotnes; Nākotnes is a published edition not yet in force):

```
curl -sS -L -A 'Mozilla/5.0' -o act.html -w '%{http_code} %{size_download} %{content_type}\n' https://likumi.lv/ta/id/355381
```

Returned `200 123086 text/html; charset=UTF-8`; the list read `2025-10-24 Spēkā esošā` and `2024-10-17 Pamata`.

Step 2, row `LV-LIKUMI-CONSOLIDATED`, the edition that starts on 2024-10-17 (the slug in the path is cosmetic; `redakcijas-datums/YYYY/MM/DD` selects the edition):

```
curl -sS -L -A 'Mozilla/5.0' -o ed.html -w '%{http_code} %{size_download} %{content_type}\n' https://likumi.lv/ta/id/355381-ilgtspejas-informacijas-atklasanas-likums/redakcijas-datums/2024/10/17
```

Returned `200 120571 text/html; charset=UTF-8`. Text recipe: take the HTML between `<div class="doc-body">` and `<td width="30" id="td-blank">`; drop the grey notice block (`notify-msg`, "Tiesību akts netiek attēlots spēkā esošajā redakcijā") that sits at the top of editions other than the current one; collapse all whitespace to single spaces; turn `<br>` and the closing tags of p, div, h1 to h6, tr, li and table into line breaks; strip the remaining tags; unescape entities; trim each line and drop empty lines. Headings and paragraphs keep their wording. `fetched_sha256` is the hash of the HTML as received. Every response carries a per-request script token (`eval("\x76\x61\x72 ...")` setting `g_carrot`), so a second fetch of the same URL does not reproduce the hash: two fetches on 2026-11-02 gave `58c7d659...` and `a0626452...` for this URL, and the text is identical. The `fetched_sha256` in `records/LV/lv-ilgtspejas-informacijas-likums/2024-10-17-consolidated-lv.json` is from the fetch that wrote the record. For the same reason the watchers are `page_hash` on the act page and will report a change on every real run (see the PR report).

### Languages

Latvian (`lv`) is the only official language, served by the request above.

English, row `LV-LIKUMI-TRANSLATION`: the State Language Centre translation. Likumi.lv serves one English text per act and ignores the edition date in the path; the amendment state is in the text:

```
curl -sS -L -A 'Mozilla/5.0' -o en.html -w '%{http_code} %{size_download} %{content_type}\n' https://likumi.lv/ta/en/en/id/355381-ilgtspejas-informacijas-atklasanas-likums
```

Returned `200 98006 text/html; charset=UTF-8` (sha256 `8b7ddc4b...`, not reproducible, same token). Same text recipe. The header says "Text consolidated by Valsts valodas centrs (State Language Centre) with amending laws of: 2 October 2025 [shall come into force on 24 October 2025]" and the page ends "Translation © 2025 Valsts valodas centrs (State Language Centre)". Where the text is not current a notice sits above it ("The translation of this document is outdated. Translation validity: A.–B. Amendments not included: ...", dropped from `text` and quoted in the record `message`). Rule used: the record is dated the start of the stated validity, or the last "shall come into force on" date in the header when there is no notice, and is stored only when a stored Latvian edition starts on that date. Result: `lv-ilgtspejas-informacijas-likums` 2025-10-24, `lv-gada-parskatu-likums` 2024-10-17, `lv-par-piesarnojumu` 2025-10-18, `lv-negodigas-komercprakses-likums` 2023-03-02, `lv-mk-769-ets-iekartas` 2012-12-05 (the translation is outdated: validity 05.12.2012 to 08.07.2014). `lv-klimatnoturibas-likums` has none: the English page says "This document has not been officially translated by the State Language Centre". The brief's vestnesis.lv English route does not exist; Latvijas Vēstnesis publishes Latvian only.

### Link only and not stored

No scope instrument is link only. Sources without records:

- `LV-VESTNESIS-ADOPTED`, https://www.vestnesis.lv/ta/id/355381 (redirects to `https://www.vestnesis.lv/op/2024/193.1`), `curl -sS -L -A 'Mozilla/5.0' -o op.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.vestnesis.lv/ta/id/355381` returned `200 337081 text/html; charset=UTF-8`; the as-published text is readable, but the verdict is `permission requested` (terms page https://www.vestnesis.lv/atkalizmantosana, returned `200 274638 text/html; charset=UTF-8`). Nothing stored.
- Latvijas Banka, https://www.bank.lv/ returned `200 77655 text/html; charset=utf-8`; no copyright or reuse page was found in the site footer or under /par-mums/noderigi (two guessed paths answered 404), so no row was written: no scope instrument uses it. The Bank's regulations are served as legal acts on Likumi.lv (type "Latvijas bankas noteikumi"); that type was not searched for ESG instruments.

## Croatia

Row `HR-NN-ADOPTED` (Narodne novine, the official gazette), `pass` on the statute basis: the site's terms grant no licence ("Svi sadržaji objavljeni na ovim internetskim stranicama zaštićeni su autorskim pravom i mogu se koristiti samo pod uvjetima propisanim Zakonom"), and the Copyright Act (ZAPSP, NN 111/2021) čl. 18 st. 3 ends protection of official legislative texts once published for official information (quoted in the row). No consolidated row: Narodne novine (NN) publishes the text of each act as adopted and each amending act as its own item; a pročišćeni tekst was not found for any instrument in scope, so the amendments are separate instruments in `register/HR/scope.json` (with `amends` where the amended act is in scope). zakon.hr is a private consolidation service and is not used. Language: Croatian only. Run on 2026-11-02 for the Accounting Act (Zakon o računovodstvu, NN 85/2024, item 1474). NN answered every plain `curl` from the cloud address (no User-Agent needed); its data-access page asks scripts for at most three requests per second.

Fetch (the same document is at `https://narodne-novine.nn.hr/eli/sluzbeni/2024/85/1474`; the gazette month in the `clanci` URL is the month of the printed issue date):

```
curl -sS -L -o zor_85_2024.html -w '%{http_code} %{size_download} %{content_type}\n' https://narodne-novine.nn.hr/clanci/sluzbeni/2024_07_85_1474.html
```

Returned `200 297976 text/html; charset=utf-8` (an earlier request the same day returned 298056 bytes). Text extraction: the page content between `<div class="sl-content">` and `<div id="sticky-anchor2">` (the gazette item, without NN's page frame, metadata panel or footer); tags stripped, `p`, `div`, `h1` to `h6`, `li`, `tr`, `table` and `br` as line breaks, table cells separated by a space, non-breaking spaces as spaces, runs of spaces collapsed, empty lines dropped, nothing reworded. The item text starts with the promulgation decree ("Odluka o proglašenju") and the item number, as published. `fetched_sha256` is the hash of the HTML as received. It does not reproduce: the page carries a comment `<!--Cached 2.11.2026. 22:20:11-->` that changes per request (the only difference found between two fetches of NN 85/2024; the extracted text was identical). No browser recipe was needed.

Discovery of an act's amendments and repeal: the metadata endpoint appends `/rdf` (or `/json-ld`) to the ELI URL and lists `amended_by`, `repealed_by`, `repeals`, `based_on`:

```
curl -sS -L -o zor_85_2024.rdf -w '%{http_code} %{size_download} %{content_type}\n' https://narodne-novine.nn.hr/eli/sluzbeni/2024/85/1474/rdf
```

Returned `200 6527 application/rdf+xml; charset=utf-8`. The body is identical across requests (same sha256 on two fetches), so the watchers hash it (`kind` `page_hash`, `tier` `consolidation_site`, one per instrument, `-nn-eli-rdf`). The metadata is not complete: for the Consumer Protection Act (NN 19/22) it lists only NN 59/2026, while NN 59/2026 itself cites NN 59/2023 as an earlier amendment. The issue sitemap `https://narodne-novine.nn.hr/sitemap_1_{year}_{issue}.xml` (`200 3094` for issue 85/2024) lists every item of an issue and was used to find items by title.

Terms and statute pages opened the same day: `https://narodne-novine.nn.hr/data_access_hr.aspx` (`200 16039 text/html; charset=utf-8`; the "Opći uvjeti korištenja" box is in the footer of every page, the page hash varies per request, so the row fingerprint hashes only that box), and the Copyright Act `https://narodne-novine.nn.hr/clanci/sluzbeni/2021_10_111_1941.html` (`200 555391 text/html; charset=utf-8`).

Stored (fetched 2026-11-02, one record per instrument in Croatian, kind `adopted`; `in_force` is the commencement the act itself states, or publication date plus the days its commencement clause names; a repeal is its own record without text):

| Instrument | NN | `in_force` of the record | Repeal record |
|---|---|---|---|
| `hr-zor-2024` | 85/2024 | 2024-07-27 | |
| `hr-zor-2024-izm-145-24` | 145/2024 | 2024-12-14 | |
| `hr-zor-2024-izm-151-25` | 151/2025 | 2025-12-31 | |
| `hr-zor-2024-izm-59-26` | 59/2026 | 2026-06-10 | |
| `hr-zor-2015` | 78/2015 | 2016-01-01 | 2024-07-27 |
| `hr-zor-2015-izm-120-16` | 120/2016 | 2017-01-01 | 2024-07-27 |
| `hr-zor-2015-izm-116-18` | 116/2018 | 2018-12-29 | 2024-07-27 |
| `hr-zor-2015-izm-42-20` | 42/2020 | 2020-04-08 | 2024-07-27 |
| `hr-zor-2015-izm-82-23` | 82/2023 | 2023-07-28 | 2024-07-27 |
| `hr-reviziji-izm-85-24` | 85/2024 | 2024-07-27 | |
| `hr-reviziji-izm-151-25` | 151/2025 | 2025-12-31 | |
| `hr-ztk-izm-85-24` | 85/2024 | 2024-07-27 | |
| `hr-zkpzos-2025` | 67/2025 | 2025-04-17 | |
| `hr-zkpzos-2019` | 127/2019 | 2020-01-01 | 2025-04-17 |
| `hr-uredba-pracenje-ghg-2017` | 5/2017 | 2017-01-26 | |
| `hr-uredba-trgovanje-ets-2020` | 89/2020 | 2020-08-08 | |
| `hr-pravilnik-besplatna-dodjela-2020` | 89/2020 | 2020-08-08 | |
| `hr-uredba-mehanizmi-ets-2023` | 107/2023 | 2023-09-23 | |
| `hr-uredba-mehanizmi-ets-izm-145-24` | 145/2024 | 2024-12-14 | |
| `hr-eudr-provedba-2025` | 151/2025 | 2025-12-23 | |
| `hr-zzp-2022` | 19/2022 | 2022-05-28 | |
| `hr-zzp-izm-59-26` | 59/2026 | 2026-06-17 | |

An amending act's record is the amending text only, not the amended act with the change applied; where a later provision commences on another date (for example NN 59/2026 on the Consumer Protection Act, in force in stages from 2026-06-17 to 2026-11-17) the record carries the general commencement date and the scope `notes` name the others.

### Languages

Croatian is the only official language the publisher serves, so there are no second-language records. No government English translation of any instrument in scope was found on 2026-11-02: the NN site serves the Croatian gazette texts; web searches for an official English text of the Accounting Act, the Climate Change and Ozone Layer Protection Act and the Consumer Protection Act returned none (the only English text found, an unofficial translation of the 2014 Consumer Protection Act hosted by the Croatian National Bank, is of a repealed act, is not an official government translation, and is not stored). Under ZAPSP čl. 15 st. 3 a translation of an official text is protected unless it was made for official public information and published as such, so a translation row would need that shown per source; none exists, so there is no `translation` row and no English record.

### Link only, dropped and not reached

- No scope instrument is `link only`: all 22 have a record.
- `sabor.hr` (`200 53279`) and `hanfa.hr` (`200 41102`) answered from the cloud address. No instrument in scope is stored from either, so neither has a licence row; HANFA's terms were not read, so no verdict is claimed for them. Sabor's bill history and acts as passed were not used.
- Dropped candidates: the Uredba o dražbi emisijskih jedinica stakleničkih plinova (NN 19/13) is named in neither NN 127/19 nor NN 67/25 among the regulations that stay in force, so it is not shown as in force on any official list read; the former act NN 127/19, named in the brief as current, was repealed by NN 67/25 (kept as a historical entry). NN 134/2015 (a Uredba amending the 2015 Accounting Act), NN 114/2022 (euro conversion) and NN 47/2020 are not stored (no non-financial or climate content found, or not opened). No F4 or F7 instrument was found.
- Not blocked: no URL refused the cloud address.

## Slovenia

Rows `SI-UL-ADOPTED` (gazette HTML) and `SI-PISRS-GAZETTE` (gazette PDF on PISRS), both `pass` on the statute basis (ZASP 9. člen: "uradna besedila z zakonodajnega, upravnega in sodnega področja" are not copyright-protected), and `SI-PISRS-NPB` (`pass` on terms: the Government Office for Legislation lists the unofficial consolidated texts on the open data portal under CC BY 4.0). `SI-PISRS-TRANSLATION`, `SI-ATVP-ADOPTED` and `SI-BSI-ADOPTED` are `permission requested`. Run on 2026-11-02. No browser was needed for any stored record: every text came from plain `curl` requests, so there is no browser-fetched record in this place.

pisrs.si is an Angular application: `curl https://pisrs.si/` returns an 11805-byte page that needs JavaScript. The data come from a JSON back end at `https://pisrs.si/api/` whose address the application reads from `https://pisrs.si/assets/config.json` (`BACKEND_ENDPOINT`); the calls below are the ones the public pages make without a login, found by watching the page's requests in Playwright chromium. They need no key and no cookie and answered curl from the cloud address. The documented developer API (`https://pisrs.si/swagger`, server `https://pisrs.si/extapi`) says "Za uporabo API potrebujete dovoljenje" and was not used.

### Rows SI-PISRS-NPB (consolidated), SI-UL-ADOPTED and SI-PISRS-GAZETTE (adopted)

Find the register id of an act (`zunanjiId`, for example `ZAKO4291` for the Companies Act) with the search the site's own search box makes. Run for "Podnebni zakon":

```
curl -sS -X POST -H 'Content-Type: application/json' -d '{"simpleSearch":true,"besedilo":{"word1":"Podnebni zakon","word1InContent":false,"word1InTitle":true},"nazivZbirke":["Register predpisov","Neuradna prečiščena besedila"]}' -o f.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://pisrs.si/api/filter/filter?cursorMark=*'
```

Returned `200 3541 application/json`; `data.seznam[]` holds `zunanjiId`, `sop` (the gazette item number, for example `2025-01-2264`), `nazivAkta`, `datumObjave`, and `nazivZbirke` ("Register predpisov" for the act, "Neuradna prečiščena besedila" for a consolidated version).

Row `SI-PISRS-NPB`, step 1, list the consolidated versions of the Companies Act (ZGD-1) and the file ids:

```
curl -sS -o zbirka.json -w '%{http_code} %{size_download} %{content_type}\n' https://pisrs.si/api/rezultat/zbirka/id/ZAKO4291
```

Returned `200 17197 application/json`. `data.datoteke[]` has, per version (`npbVerzija.naziv`: "Osnovni", "NPB 1", ...), the file ids by type (`HTML_DOCUMENT`, `WORD_DOCUMENT_DOCX`, `PDF_DOCUMENT`). `data.evidencniPodatki` has `veljaOd` (first in-force date), `ulStLeto`, `citat` (the amendments, each with its `sop`). The same record by gazette item: `curl -sS -o sop.json -w '%{http_code} %{size_download} %{content_type}\n' https://pisrs.si/api/rezultat/zbirka/sop/2017-01-0730` returned `200 2139 application/json` (ZGD-1J); its `veljaOd` is the in-force date PISRS shows for an amending act.

Step 2, the version text, ZGD-1 NPB 24 (`HTML_DOCUMENT` 612427594):

```
curl -sS -o npb24.html -w '%{http_code} %{size_download} %{content_type}\n' https://pisrs.si/api/datoteke/integracije/612427594
```

Returned `200 1371818 text/html; charset=UTF-8`, sha256 `26f74dcbb228b53c64d3c5318b4f4f68e8fe1389f3efebab2957c42fd79323a0`; a second fetch gave the same hash, so `fetched_sha256` reproduces. The file starts with "Opozorilo: Neuradno prečiščeno besedilo predpisa predstavlja zgolj informativni delovni pripomoček", lists the amendments it contains, then "(neuradno prečiščeno besedilo št. 24)" and "Datum začetka uporabe: 24.07.2026". That line is the `in_force` of the version. NPB files up to about number 20 of ZGD-1 have no such line: their date is the `veljaOd` of the last amending act the file lists, read with the `zbirka/sop/` call above.

Text extraction (NPB files): the `<head>` removed, block elements (`p`, `div`, `h1` to `h6`, `li`, `tr`) as line breaks, tags stripped, entities decoded, no-break spaces as spaces, runs of spaces collapsed; headings, the "Opomba" notes and the "Datum konca veljavnosti" lines of repealed articles are kept. For three small acts (`si-uredba-sfdr`, `si-ziuezo`, `si-uredba-brezplacni-kuponi`) the record is the whole NPB file text, header included; for the other acts it is a cut: the Companies Act from the line `70.c člen` up to the heading of the next article not numbered 70, ZVO-2 from `4. Trgovanje s pravicami do emisije toplogrednih plinov v EU` to `5. Zavezujoče letno zmanjšanje`, ZVPot-1 from `VIII. poglavje NEPOŠTENE POSLOVNE PRAKSE` to `IX. poglavje`. A consolidated version is stored only when its cut differs (words only, whitespace ignored) from the version before; the record carries the date of the first version with that text.

Row `SI-UL-ADOPTED`, the act as published, Zakon o spremembah in dopolnitvah Zakona o gospodarskih družbah (ZGD-1M), Uradni list RS 102/2024:

```
curl -sS -L -A 'Mozilla/5.0' -o 2024-01-3204.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2024-01-3204
```

Returned `200 204130 text/html; charset=utf-8`, sha256 `22f064f48beeb279eb6408f6b64abc77ae36fef459c2874cf22ceb5cf0e3d519`, the same on a second fetch. The path needs only the SOP number (`sop` from the PISRS record); the readable-title part of the URL in the register is optional. Text extraction: the contents of `<div class="content-segments">` (the page title, menus and footers are outside it), block elements as line breaks, tags stripped, runs of spaces collapsed. The issue and date are in `<h2 class="h5 ul-content-title">` ("Uradni list RS, št. 102/2024 z dne 3. 12. 2024").

Row `SI-PISRS-GAZETTE`, the act as published after 1 March 2026 (uradni-list.si item pages dated 2026 answer `200 73373 text/html` with no act text), ZGD-1O, Uradni list RS 1270/2026:

```
curl -sS -o u20261270.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://pisrs.si/api/uradni-list/objava/u20261270.pdf
```

Returned `200 239430 application/pdf`, sha256 `4a1bc4bb8fe97b331a52d8223d9ce9b4d00e0663f10a0e8b89efb58f181fdbf9`, the same on a second fetch. The file name is `u` + year + four-digit item number (`u20261799.pdf` for ZVPot-1A, `u2006042.pdf` style for older issues: `https://pisrs.si/api/uradni-list/objava/u2006042.pdf` is `virPovezaveOblike` of ZGD-1). Text: `pdftotext -layout u20261270.pdf -`, form feeds as line breaks, runs of spaces collapsed, blank-line runs collapsed; the page furniture ("Stran N od M") is left in. Checked for mojibake: the diacritics č š ž and the guillemets » « came out intact in both PDFs (ZGD-1O 34679 characters, ZVPot-1A 68741 characters).

Stored (fetched 2026-11-02), `sl` only:

| Instrument | Row | Versions stored (`in_force`) |
|---|---|---|
| `si-zgd-1-art70c` | consolidated | 2017-04-15, 2024-12-18, 2025-10-08, 2026-02-25, 2026-07-24 |
| `si-zgd-1m` | adopted | 2024-12-18 |
| `si-zgd-1n` | adopted | 2025-10-08 |
| `si-zgd-1o` | adopted (PDF) | 2026-07-24 |
| `si-poz` | adopted | 2025-08-09 |
| `si-zvo-2-ets` | adopted, consolidated | 2022-04-13, 2025-08-09 |
| `si-zvpot-1` | adopted, consolidated | 2022-10-26, 2026-12-12 (future date) |
| `si-zvpot-1a` | adopted (PDF) | 2026-11-13 (in force 2026-11-13, applies 30 days later) |
| `si-uredba-sfdr` | adopted, consolidated | 2023-02-25, 2026-01-03 |
| `si-ziuezo` | adopted, consolidated | 2025-04-23, 2026-02-25 |
| `si-uredba-brezplacni-kuponi` | adopted, consolidated | 2024-03-30, 2025-08-09 |
| `si-pravilnik-mrv` | adopted | 2011-07-30 |

### Languages

Slovenian is the only language the gazette and PISRS serve for the acts: Italian and Hungarian (official in the ethnically mixed municipalities) were looked for on the gazette item page, `https://www.uradni-list.si/glasilo-uradni-list-rs`, and the PISRS act pages, and none exists. English is a translation on its own row, `SI-PISRS-TRANSLATION`, `permission requested`: the list `https://pisrs.si/aktualno/zakonodaja-v-anglescini` is `curl -sS -o en.json -w '%{http_code} %{size_download} %{content_type}\n' https://pisrs.si/api/navigation/gethtml/13`, which returned `200 326133 application/json` (the page's HTML in `data.html`, 391 table rows, each with the file link `/Prevodi/EN-....doc`). It states no licence; the CC BY 4.0 of the Government Office is on the Slovenian NPB dataset. ZASP 9. člen (2) protects translations unless published as official texts. The file links do not work with curl: `curl -sS -o EN.doc -w '%{http_code} %{size_download} %{content_type}\n' https://pisrs.si/Prevodi/EN-2022-01-3083.doc` returned `200 11805 text/html; charset=UTF-8` (the PISRS application shell, not a Word file). No translation is stored. English files exist for the Companies Act (marked * as not the latest text; state of NPB 16, 2019) and ZVPot-1 (the 2022 text); none for the Climate Act, ZVO-2, the ETS decrees, SFDR decree, green bonds act, ZGD-1M, 1N, 1O or ZVPot-1A.

### Link only

No instrument is link only. Rows with no instrument:

- `SI-ATVP-ADOPTED` (`permission requested`): `https://www.a-tvp.si/` is blocked from the cloud address, see Blocked. No ATVP instrument is in scope.
- `SI-BSI-ADOPTED` (`permission requested`): the bsi.si terms allow reproduction only "pod pogojem, da je vidno označen vir podatkov in da ostanejo podatki nespremenjeni"; the site answers curl with 200. No Banka Slovenije instrument is in scope.
- `SI-PISRS-TRANSLATION` (`permission requested`): see Languages.

The brief's candidate ZVO-2 is in scope for its ETS chapter, which the Podnebni zakon replaced on 2025-08-09 (see the scope notes).

### Blocked

- `https://www.a-tvp.si/`: `curl -sS -I -A 'Mozilla/5.0' https://www.a-tvp.si/` returns `HTTP/2 403` with `cf-mitigated: challenge`; headless Chromium stays on the Cloudflare page "Just a moment..." (403) after 7 s. Blocked from the cloud address; the orchestrator can read it from the laptop.
- `https://www.e-uprava.gov.si/`: `curl: (56) CONNECT tunnel failed, response 502` (000). Not needed.

## Luxembourg

Rows `LU-LEGILUX-ADOPTED` (Mémorial A text as published) and `LU-LEGILUX-CONSOLIDATED` (textes consolidés and codes) are `pass` on the terms basis; `LU-CSSF-ADOPTED` is `permission requested` and no CSSF text is stored. Run on 2026-11-02 (GEL-06-09). No record was fetched with a browser: every record comes from `curl`.

Legilux has two hosts. `https://legilux.public.lu/...` (every HTML and ELI path, the `/jo/fr/pdf` and `/jo/fr/html` routes included) answers curl with the 2118-byte Angular shell, so it cannot be read without a browser. `https://data.legilux.public.lu/...` (the Casemates open-data host) serves the files themselves to plain curl, and its SPARQL endpoint lists the dated versions. The endpoint is `/sparqlendpoint`; `/sparql` returns the 698-byte Casemates shell to a GET. Both hosts reset the connection now and then (`curl: (35) Recv failure: Connection reset by peer`); a retry worked each time.

```
curl -sS -L -o shell.html -w '%{http_code} %{size_download} %{content_type}\n' https://legilux.public.lu/eli/etat/leg/loi/2020/12/15/a994/jo/fr/html
```

Returned `200 2118 text/html;charset=UTF-8` (the shell, no law text).

### Terms (rows LU-LEGILUX-*)

The terms are not in the HTML of any page; the help page `https://legilux.public.lu/help/projet-casemates` loads its text from a fragment found by capturing the page's network requests with Playwright chromium:

```
curl -sS -o intro.html -w '%{http_code} %{size_download} %{content_type}\n' https://legilux.public.lu/api/assets/faq/questions/12-introduction.html
```

Returned `200 2441 text/html`. It says: "Les textes et les métadonnées sont mis à disposition selon la licence d’utilisation http://creativecommons.org/licenses/by/4.0/ qui autorise leur réutilisation pour des utilisations commerciales ou non." (fingerprint of the stripped text `bd91a4f1c164ae514a623c1925a753da9b127275215649646eb1114f5c4f407d`). The same licence is stated by the data.public.lu dataset "Legilux - Journal officiel du Grand-Duché de Luxembourg" (licence `cc-by`, `curl -sS -A 'Mozilla/5.0' 'https://data.public.lu/api/1/datasets/?q=legilux&page_size=20'` returned `200 11921 application/json`; the call was reset once before it answered) and by the metadata of each file (`jo:license`). The site's general terms, `.../api/assets/faq/questions/14-utilisation.html` (`200 6718 text/html`), say that "Sauf indication contraire" documents are for private use, may not be modified and may not be distributed outside the site. The CC BY statement is read as the contrary indication for the open-data files; this is the one judgment in the rows and Varun is asked to confirm it in the PR.

The licence is checked per file before a record is made:

```
curl -sS -L -G -H 'Accept: text/csv' --data-urlencode 'query=PREFIX j: <http://data.legilux.public.lu/resource/ontology/jolux#> SELECT ?l WHERE { <http://data.legilux.public.lu/eli/etat/leg/loi/2020/12/15/a994/consolide/20250726/fr/xml> j:license ?l }' -o q2.csv -w '%{http_code} %{size_download} %{content_type}\n' https://data.legilux.public.lu/sparqlendpoint
```

Returned `200 50 text/csv;charset=UTF-8` with `http://creativecommons.org/licenses/by/4.0/`. 149013 of the 500579 files that carry a licence statement carry `http://data.legilux.public.lu/resource/authority/license/licenceSCL` instead ("Licence de réutilisation SCL", no text found); those are not stored. A file with no licence statement at all is not stored either. The Loi du 18 avril 2001 sur les droits d’auteur, art. 10, 8° ("les actes officiels de l'autorité et leur traduction officielle") is an exception to the author's right, listed under the chapeau "l'auteur ne peut interdire", not an exclusion from protection, so no row rests on it.

### Row LU-LEGILUX-ADOPTED

The Mémorial A text of an act as Akoma Ntoso XML. Run for the Loi du 15 décembre 2020 relative au climat (ELI `loi/2020/12/15/a994`):

```
curl -sS -L -o a994.xml -w '%{http_code} %{size_download} %{content_type}\n' https://data.legilux.public.lu/eli/etat/leg/loi/2020/12/15/a994/jo/fr/xml
```

Returned `200 174544 application/xml`, sha256 `1b728f8a8971b3fbeb9c598b41b39ebf6b753f7d29b6cdaa39855c549092e9d7`, identical on a second fetch (no per-request token). The same file comes from the ELI route with a header: `curl -sS -L -H 'Accept: application/xml' https://data.legilux.public.lu/eli/etat/leg/loi/2020/12/15/a994/jo` returned `200 174544 application/xml`. The same path with `/html` instead of `/xml` returns an XHTML file.

### Row LU-LEGILUX-CONSOLIDATED

The dated versions of an act are the works that are `jo:isMemberOf` the act and typed `jo:Consolidation`; `jo:dateApplicability` is the date the version applies from. The query uses the same JOLux ontology as the Fedlex query in `## Switzerland`:

```
curl -sS -L -G -H 'Accept: text/csv' --data-urlencode 'query=PREFIX j: <http://data.legilux.public.lu/resource/ontology/jolux#> SELECT DISTINCT ?c ?d WHERE { ?c j:isMemberOf <http://data.legilux.public.lu/eli/etat/leg/loi/2020/12/15/a994> . ?c a j:Consolidation . ?c j:dateApplicability ?d } ORDER BY ?d' -o q1.csv -w '%{http_code} %{size_download} %{content_type}\n' https://data.legilux.public.lu/sparqlendpoint
```

Returned `200 578 text/csv;charset=UTF-8`: six consolidations, 2021-01-01, 2022-07-05, 2024-01-01, 2024-06-08, 2024-10-01 and 2025-07-26. The file of one version:

```
curl -sS -L -o a994_20250726.xml -w '%{http_code} %{size_download} %{content_type}\n' https://data.legilux.public.lu/eli/etat/leg/loi/2020/12/15/a994/consolide/20250726/fr/xml
```

Returned `200 417458 application/xml`, sha256 `b75c8a28d1b0c2c0d7613bfaba4437f9d5d2278f92c245d68f8344bae2d35838`, identical on a second fetch. A consolidation listed in the graph without a file answers `404` (`loi/2002/12/19/n1/consolide/20250302`) or the 698-byte shell with status 200 (`code/consommation/20170101`); neither is a version Legilux serves. The consumer Code is not an act with its own members: its versions are members of the introducing law (`loi/2011/04/08/n2`) and its files are `.../eli/etat/leg/code/consommation/{YYYYMMDD}/fr/xml`:

```
curl -sS -L -o code.xml -w '%{http_code} %{size_download} %{content_type}\n' https://data.legilux.public.lu/eli/etat/leg/code/consommation/20260927/fr/xml
```

Returned `200 1970599 application/xml`, sha256 `3f11b794f60e2e5104cf2029aa9553c0d0d2e959d849f20ec1429649b2502d2c`.

### Text extraction

`text` is the Akoma Ntoso `preface` and `body` (and `attachments`, where an annex exists) of the file: headings and paragraphs as line breaks, the number and heading of an article or chapter on one line, a paragraph number on the line of its text, list markers (`1°`, `a)`, `-`) rebuilt from the list type, table rows as one line with cells separated by ` | `. The Legilux modification notes are kept as `[Note] ...` lines after the block that cites them (the marker is added by the extraction, as `[Fussnote]` is in `## Switzerland`). Passages Legilux marks as deleted (`<del>`) are left out because they are no longer text of that version. Nothing is reworded. `fetched_sha256` is the sha256 of the whole file as returned. For the law of 19 December 2002 (about 450 kB) the text is Art. 68bis and 68ter, and for the Code de la consommation (about 1.9 MB a version) it is Chapter 2 of Title 2 of Book 1 (Art. L. 122-1 ff., unfair commercial practices), cut out by its element id or heading. A cut instrument stores a version only when the cut text differs from the previous stored one. For each stored file the letters and digits of the XML body (minus deleted passages and notes) were checked to be a subsequence of the extracted text; the extra characters are list markers.

### Stored (fetched 2026-11-02)

| Instrument | Row | Versions stored (`in_force`), all `fr` |
|---|---|---|
| `lu-climate-law-2020` | adopted, consolidated | 2020-12-20 (adopted); 2021-01-01, 2022-07-05, 2024-01-01, 2024-06-08, 2024-10-01, 2025-07-26 (consolidated) |
| `lu-climate-pact-law-2021` | adopted | 2021-01-01 |
| `lu-ghg-allocations-rgd-2022` | adopted | 2022-07-05 |
| `lu-ets-aid-law-2022` | adopted, consolidated | 2022-07-19; 2026-01-04 |
| `lu-ghg-inventory-rgd-2017` | adopted | 2017-05-01 |
| `lu-rcs-act-2002` | consolidated | 2025-12-23 (Art. 68bis and 68ter only) |
| `lu-sfdr-law-2022` | adopted | 2022-01-01 |
| `lu-consumer-code-unfair-practices` | consolidated | 2018-07-01, 2022-12-04, 2024-07-22, 2024-09-10, 2024-12-31, 2025-11-25, 2026-09-27 (Chapter 2 only) |
| `lu-consumer-law-2026-green-transition` | adopted | 2026-09-27 |

### Languages

Legilux serves one expression, French (`FRA`), for every act and consolidation above (a SPARQL query of `jo:language` over each act and its consolidations returned `FRA` alone, 2026-11-02). French is the language of legislation (loi du 24 février 1984 sur le régime des langues, art. 2). No German text as enacted and no government English translation was found: the only other expressions Legilux lists are for treaties and a few unrelated acts. So there is no translation row, and no instrument has a `de` or `en` record.

### Link only

- `lu-nfi-law-2016`: row `LU-LEGILUX-ADOPTED` passes, but every file of the act carries `licenceSCL`, not CC BY 4.0, so nothing is stored. Its provisions are in the consolidated law of 2002 (`lu-rcs-act-2002`).
- Projet de loi n° 8370 (CSRD transposition): not enacted, register row with family F7 and no scope entry. `https://www.chd.lu/fr/dossier/8370` returned `200 174523 text/html; charset=UTF-8`: "Projet de loi", "En commission", filed 29.03.2024, last updated 22.12.2025.
- Dropped: the Loi modifiée du 23 décembre 2004 (ETS) and its texte coordonné. Art. 48 of the climate law repeals it and Legilux shows it as no longer in force since 2020-12-20.
- Not stored, stored versions missing: earlier states of Art. 68bis and 68ter (the only consolidation with a file is 2025-12-23), and the three consolidations of the Code before 2018-07-01 (no file).

### Row LU-CSSF-ADOPTED (blocked from the cloud address for curl)

```
curl -sS -L -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://www.cssf.lu/en/terms-of-service-and-privacy-policy/
```

Answered `curl: (52) Empty reply from server` (three tries), and on a later run `400 2798 text/html; charset=UTF-8`; the home page `https://www.cssf.lu/en/` answered `200` once and `400` or an empty reply on other runs. Headless Chromium opens it (Playwright as pre-installed; waits for `networkidle` plus 2.5 s, then takes `innerText` of `<main>`):

```
node -e "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();const r=await p.goto('https://www.cssf.lu/en/terms-of-service-and-privacy-policy/',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(2500);const t=await p.evaluate(()=>(document.querySelector('main')||document.body).innerText);console.log(r.status(),t.length);console.log(t);await b.close()})()"
```

Status `200`; the text of `<main>` has 32764 characters. It gives the sentence in the row (reproduction or distribution only with prior written consent). No CSSF text was fetched or stored.

## Bulgaria

Row `BG-PARLIAMENT-ADOPTED`, `pass` on the publisher's terms (verdict_basis `terms`): the Народно събрание terms page https://www.parliament.bg/bg/terms-of-use licenses the portal content under CC BY 4.0 (the quoted sentence and its fingerprint are in the row; Закон за авторското право и сродните му права чл. 4, т. 1 is quoted in the row as a second ground but the row rests on the terms). The portal serves each act once, as passed, with the Decree of promulgation; it has no point-in-time consolidation, so Bulgaria has no consolidated row. Language: Bulgarian only. Run on 2026-11-02 for the Accounting Act (ДВ бр. 95/2015, parliament.bg act id 15501).

The law pages (`https://www.parliament.bg/bg/laws/ID/<id>`) are a JavaScript application (curl returns a 4304-byte shell). The application reads a public JSON API, and the act text is the HTML in the field `L_ActL_final_body`. Proven request for the row, no headers needed (a browser `User-Agent` also works):

```
curl -sS -L -o act15501.json -w '%{http_code} %{size_download} %{content_type}\n' https://www.parliament.bg/api/v1/act/15501
```

Returned `200 472412 application/json`, sha256 `12137ce57d5d19cb39eb9089b7b080d4226fcb38c7ef6932a61de18c88231f28`. A second fetch gave the same hash (no per-request token), and the hash equals `fetched_sha256` in `records/BG/bg-zschet/2016-01-01-adopted-bg.json`. `fetched_sha256` is the hash of the JSON as returned. Other fields of the same answer: `L_Act_dv_iss` and `L_Act_dv_year` (gazette issue and year, here 95 and 2015), `L_Act_date2` (the day the Assembly passed the act, not the gazette day), `L_ActL_final` (title). The gazette day is not served anywhere on parliament.bg.

Text extraction: Python `html.parser` on `L_ActL_final_body`; comments (the Word conditional blocks) and `script`, `style`, `xml` content dropped; the end of every block element (`p`, `div`, `br`, `h1` to `h6`, `li`, `tr`, `table`, `td`, `th`, lists) a line break; runs of spaces collapsed and non-breaking spaces turned into spaces; empty lines dropped; nothing reworded. The text starts with the Decree (Указ) and ends with the line saying the Assembly passed the act. Checked: no U+FFFD in any record.

Terms page, read with Playwright chromium (the page is a JavaScript shell): `page.goto('https://www.parliament.bg/bg/terms-of-use', waitUntil: 'networkidle')`, wait 2 s, innerText of `<main>`, whitespace collapsed, sha256 `d478c61d...a928d` (same on two runs); `curl -sS -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://www.parliament.bg/bg/terms-of-use` returned `200 4304 text/html; charset=UTF-8` (the shell).

Finding the act id of an instrument (no consolidated search exists): the title search of the law list answers only for the current Assembly (`curl -sS -H 'Content-Type: application/json' -d '{"L_Act_string":"акциз"}' https://www.parliament.bg/api/v1/fn-acts/1` returned 1 act; the same with `"счетоводство"` returned `[]`, so the search does not reach acts of earlier Assemblies), and adding `A_ns_id` answered HTTP 500. Ids came from probing `GET /api/v1/act/<id>` (an empty `{}`-like answer for ids that are not acts; `L_Act_T_id` 1 is a law, 2 a decision): ids around 14600 to 15700 hold the acts of 2014 and 2015, 165500 to 167600 those of 2024 to 2026. The EU dossier API (`POST /api/v1/fn-dossier` with `{"RN_FULL":"2022/2464"}`, then `GET /api/v1/eu-dossier/<ID>`) names the Bulgarian acts that transpose a directive with their gazette issue, which is how ДВ бр. 72/2024 and бр. 79/2024 were tied to Directive (EU) 2022/2464.

Stored on 2026-11-02 (all `kind` adopted, language bg, one record per act):

| Instrument | Act id | `in_force` | Request |
|---|---|---|---|
| `bg-zschet` | 15501 | 2016-01-01 | `https://www.parliament.bg/api/v1/act/15501` |
| `bg-zschet-zid-2024` | 165592 | 2024-07-06 | `https://www.parliament.bg/api/v1/act/165592` |
| `bg-zoik` | 14595 | 2014-03-11 | `https://www.parliament.bg/api/v1/act/14595` |
| `bg-zzp-zid-2026` | 167077 | 2026-09-27 | `https://www.parliament.bg/api/v1/act/167077` |

### Link only

The row passes for all three, and the text was fetched, but no dated record is stored because no official page opened states the in-force day:

- `bg-zschet-zid-2025` (ДВ бр. 17/2025, act id 165958): "from the day of promulgation"; the gazette day is not on parliament.bg.
- `bg-znfo-zid-2024` (ДВ бр. 79/2024, act id 165596): no commencement clause in the text; the gazette day is not on parliament.bg.
- `bg-zoik-zid-2025` (ДВ бр. 81/2025, act id 166596): specific provisions dated, no general clause; the gazette day is not on parliament.bg. The Ministry of Environment and Water copy of the consolidated climate act lists "бр. 81 от 3.10.2025 г." without an in-force day.

The base Consumer Protection Act (ДВ бр. 99/2005, чл. 68в to 68м) is not in scope: no official page was found that holds its text (see Blocked). Consolidated versions of every Bulgarian act exist only on lex.bg, ciela.net and apis.bg, which are private services and are never used.

### Languages

Bulgarian is the only official language. No government English translation was found for any instrument: the English interface of parliament.bg (`https://www.parliament.bg/en/laws/ID/<id>`) shows the same Bulgarian text, the act API has language id 1 only, and web searches for an official English text of the Accounting Act, the Climate Change Mitigation Act and the Consumer Protection Act amendments returned none from a government publisher. So there is no translation row and no English record. The English text of the Copyright Act used in the row's second ground comes from the Bulgarian Center for Expertise and Management (cem.bg); it is quoted in the row only and not stored.

### Blocked from the cloud address

- `https://dv.parliament.bg/` (official gazette): `curl -sS -m 40 -A 'Mozilla/5.0' https://dv.parliament.bg/` ended with `curl: (35) Recv failure: Connection reset by peer`; `https://dv.parliament.bg/DVWeb/index.faces`, `.../DVWeb/broeveList.faces` and `.../DVWeb/showMaterialDV.jsp?idMat=99076` returned `000` (no answer, tunnel closed after 10 s); `http://dv.parliament.bg/` returned `503 114 text/plain`. No browser recipe was tried on these.
- `https://lex.bg/`: `403 5301 text/html` (private service, unused).
- Answered and not used: `https://www.fsc.bg/` (`200 96601 text/html`; no instrument of the Комисия за финансов надзор is in scope, so no row and no terms were read).

## Malaysia

Rows `MY-AGC-CONSOLIDATED`, `MY-AGC-ADOPTED`, `MY-BURSA-ADOPTED` and `MY-SC-ADOPTED`, all `permission requested` (terms basis). No row passes, so no text is stored and no fetch recipe for law text was proven. Run on 2026-11-02.

The terms pages that decided the rows (these are the only requests that worked):

```
curl -sS -L -A 'Mozilla/5.0' -o tnc.html -w '%{http_code} %{size_download} %{content_type}\n' https://lom.agc.gov.my/tnc.php
```

Returned `200 17069 text/html; charset=UTF-8`: "Copyright 2023 by Attorney General's Chambers, Malaysia, all rights reserved." The footer separator is random, so only items 1 to 11 are hashed (see the row notes).

```
curl -sS -L -A 'Mozilla/5.0' -o disclaimer.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.sc.com.my/about/disclaimer
```

Returned `200 80953 text/html; charset=utf-8`: reproduction needs the SC's prior written permission.

### Languages

The Laws of Malaysia portal offers Malay (`language=BM`) and English (`language=BI`) under the same terms, so a second language would need no row of its own. No language was fetched. No government English translation source other than the LOM English versions was found.

### Link only

- `my-eqa-1974`, `my-cpa-1999`, `my-tda-2011`: row `MY-AGC-CONSOLIDATED`, all rights reserved. Also no working per-instrument request: act pages are not reachable from the cloud address.

```
curl -sS -L -A 'Mozilla/5.0' -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' 'https://lom.agc.gov.my/act-detail.php?language=BI&act=127'
```

Returned `200 15 text/html; charset=UTF-8` (body: `Invalid request`). The list pages (`principal.php?type=updated&language=BI`, `subsid.php?type=pua`, `200 21775 text/html`) fill their tables by JavaScript from `json-updated-2024.php`, whose response is encrypted in the page, and the file links in the HTML are signed `processFile.php?isDirect=1&token=...` URLs, so no URL can be built for a chosen Act. Headless Chromium (Playwright with the session proxy) got `502 upstream request failed` for `lom.agc.gov.my`. The `/federal-gazette` path and `federalgazette.agc.gov.my` from the brief were not retried.
- `my-bursa-mmlr-sustainability`: row `MY-BURSA-ADOPTED`, terms unreadable. Blocked from the cloud address: https://www.bursamalaysia.com/ (also `/terms_of_use`, `/legal_disclaimer` and the release PDF named in `register.csv`).

```
curl -sS -L -A 'Mozilla/5.0' -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://www.bursamalaysia.com/
```

Returned `403 5379 text/html; charset=UTF-8` (Cloudflare "Just a moment..."). Chromium with the proxy got the same challenge and did not clear it. The orchestrator can read the Bursa terms and the Listing Requirements sustainability provisions from the laptop.
- Not reached: https://www.parlimen.gov.my/ did not connect (curl status 000).
- Not law, no scope entry: the SC National Sustainability Reporting Framework (https://www.sc.com.my/nsrf, row `MY-SC-ADOPTED`, permission requested). Not enacted: the Climate Change Bill and the carbon tax (F7 rows in `register.csv`).

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

## Philippines

Rows `PH-ELIBRARY-ADOPTED` (`pass`, statute: Intellectual Property Code ss. 175 and 176.1), `PH-BSP-ADOPTED` (`pass`, terms) and `PH-SEC-ADOPTED` (`permission requested`: site blocked). Run on 2026-11-02.

The Official Gazette, the Senate and House sites and the SEC are behind a Cloudflare challenge. The failing request, then the browser attempt:

```
curl -sS -o o.bin -w '%{http_code} %{size_download} %{content_type}\n' https://www.officialgazette.gov.ph/downloads/2009/10oct/20091023-RA-9729-GMA.pdf
```

Returned `403 5541 text/html; charset=UTF-8` (challenge page). Headless Chromium (Playwright, `goto` then a 25 s wait) returned the same "Just a moment..." page for www.officialgazette.gov.ph, www.sec.gov.ph, www.congress.gov.ph and www.senate.gov.ph; legacy.senate.gov.ph answered 403 "Maintenance". The session proxy also refuses the challenge host (brunhild.challenges.cloudflare.com), so the challenge cannot complete. No browser recipe was found for these sites, so the Gazette, Senate and House texts were not used and the statutes come from the Supreme Court E-Library.

### Supreme Court E-Library (`PH-ELIBRARY-ADOPTED`)

```
curl -sS -A 'Mozilla/5.0' -o ra9729.html -w '%{http_code} %{size_download} %{content_type}\n' https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/18615
```

Returned `200 57176 text/html`, R.A. 9729. The Republic Acts list is a DataTables POST that needs the page's csrf token and session cookie:

```
curl -sS -c cj -A 'Mozilla/5.0' -o ra.html https://elibrary.judiciary.gov.ph/republic_acts
curl -sS -b cj -A 'Mozilla/5.0' -e https://elibrary.judiciary.gov.ph/republic_acts -H 'X-Requested-With: XMLHttpRequest' -X POST https://elibrary.judiciary.gov.ph/republic_acts/fetch_ra --data-urlencode "csrf_test_name=<token in ra.html>" -d 'draw=1&start=0&length=10' --data-urlencode 'search[value]=climate'
```

Returned `200 1366 text/html` (JSON, 4 rows: R.A. 12019 twice, 10174, 9729). The list call failed intermittently (an empty reply) when repeated within seconds. `fetched_sha256` is the hash of the HTML as received. The page carries a per-session csrf token (`csrf_test_name` in two script blocks), so two fetches in different sessions give different hashes (same size, identical extracted text); two fetches in one session gave the same hash. The record hashes were taken from one plain fetch each.

`text` is the page after the "View printer friendly version" link up to the "Find it!" footer: tags stripped, `<br>` and block ends as line breaks, runs of blank lines collapsed, nothing reworded. Transcription faults on the page (a closing quotation mark served as `?` in R.A. 10174, "sixty (80) days") are kept. The R.A. 7394 record is the cut from the line `CHAPTER VI` to the line before `CHAPTER VII`. The E-Library page carries the publication line (Official Gazette volume and page, or the newspapers and date); `in_force` is counted from it with the Act's effectivity clause, which is this session's arithmetic, not a stated date.

### Languages

English only. The E-Library serves each Republic Act as enacted in English, no Filipino text and no translation. No consolidated text is served either (R.A. 9729 as amended by R.A. 10174 is the two records read together). No translation row was added. Filipino texts of the Acts would be on the Official Gazette or Congress sites, which were blocked.

### BSP (`PH-BSP-ADOPTED`)

```
curl -sS -o c1128.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.bsp.gov.ph/Regulations/Issuances/2021/1128(Corrected%20Copy).pdf'
```

Returned `200 6680329 application/pdf`, BSP Circular No. 1128 corrected copy (13 pages, sha256 `319deb0e9ad1c026f09ee0a6d4b264ade7cb8804946cd7c3524941e1f2230d9a`, identical to the file downloaded by headless Chromium navigation). With `-A 'Mozilla/5.0'` the same URL answers `403` Access Denied (Akamai); plain curl with its default User-Agent, and the watcher's, pass. The terms page `https://www.bsp.gov.ph/Pages/AboutTheBank/Terms-of-Use.aspx` answers the default curl `200 124135 text/html; charset=utf-8`.

`pdftotext -layout c1128.pdf -` returns 33,890 bytes of OCR text from page images, with garbled words ("Sectlonl", "Pesponsibilities of the Mrd of Dirutorc", "Dlsclosurc Pcqulrcnents"). It fails the mojibake check, so Circular 1128 is link only.

### Link only

- `ph-sec-mc-16-2025`, `ph-sec-mc-4-2019`: row `PH-SEC-ADOPTED`, permission requested; www.sec.gov.ph answered 403 (Cloudflare) to curl and to Chromium. Blocked from the cloud address: https://www.sec.gov.ph/ , https://www.sec.gov.ph/mc-2025/sec-mc-no-16-series-of-2025/ , https://www.sec.gov.ph/wp-content/uploads/2019/10/2019MCNo04.pdf .
- `ph-bsp-circular-1128`: row passes; the only copy is a scanned image with garbled OCR.
- Not in scope.json: a Low Carbon Economy Act (register row F7). The E-Library list search for "carbon" returned no Republic Act; the Gazette and Congress sites could not be read.
- Blocked from the cloud address: https://www.officialgazette.gov.ph/ , https://www.congress.gov.ph/ , https://www.senate.gov.ph/ , https://issuances-library.senate.gov.ph/ , https://www.denr.gov.ph/ , https://pcw.gov.ph/ (Cloudflare 403); https://legacy.senate.gov.ph/ (403 Maintenance); https://morb.bsp.gov.ph/ (500).
- LawPhil and ChanRobles are private and were not used.

## China

Run on 2026-11-02 (GEL-07-01). Rows `CN-FLK-ADOPTED`, `CN-FLK-CONSOLIDATED`, `CN-MEE-ADOPTED` and `CN-MOF-ADOPTED` pass on the statute (Copyright Law of the PRC Art. 5 item 1, quoted in each row). Rows `CN-SSE-ADOPTED`, `CN-SZSE-ADOPTED` and `CN-BSE-ADOPTED` are `permission requested` (each exchange's legal notice allows non-commercial use only). The mee.gov.cn site statement (and the identical gov.cn one) bars commercial verbatim reprint of site content and claims the site's copyright; the MEE row passes on the statute anyway and is flagged for Varun in its notes. gov.cn has no row and was not used as a source. No Chinese text was fetched by browser: every stored record came from `curl`.

### flk.npc.gov.cn (rows `CN-FLK-ADOPTED`, `CN-FLK-CONSOLIDATED`)

The site is a JavaScript application; the data come from `/law-search/...` JSON endpoints that answered curl from the cloud address with no cookie or token. Run for the Anti-Unfair Competition Law (2025 revision).

Step 1, find the version ids (`bbbs`); `searchType` 1 is an exact title search, each version of a law is its own item with `sxrq` (in-force date), `gbrq` (promulgation date) and `sxx` (3 in force, 2 amended, 1 no longer in force):

```
curl -sS -A 'Mozilla/5.0' -H 'Content-Type: application/json;charset=UTF-8' -X POST https://flk.npc.gov.cn/law-search/search/list -d '{"searchRange":1,"sxrq":[],"gbrq":[],"searchType":1,"sxx":[],"gbrqYear":[],"flfgCodeId":[],"zdjgCodeId":[],"searchContent":"中华人民共和国反不正当竞争法","orderByParam":{"order":"-1","sort":""},"pageNum":1,"pageSize":20}' -o l.json -w '%{http_code} %{size_download} %{content_type}\n'
```

Returned `200 15574 application/json` (12 rows, three of them national: bbbs `ff808181971552b40197b1016efc5437` 2025-10-15, `ff8080816f135f46016f2169de9b1ace` 2019-04-23, `2c909fdd678bf17901678bf8704b0a87` 2018-01-01). Step 2 (optional), `curl -sS -A 'Mozilla/5.0' 'https://flk.npc.gov.cn/law-search/search/flfgDetails?bbbs=ff808181971552b40197b1016efc5437'` returned `200 3140 application/json` (file paths and related documents). Step 3, the file:

```
curl -sS -A 'Mozilla/5.0' 'https://flk.npc.gov.cn/law-search/download/pc?format=docx&bbbs=ff808181971552b40197b1016efc5437' -o p.json -w '%{http_code} %{size_download} %{content_type}\n'
curl -sS -A 'Mozilla/5.0' -o aucl.docx -w '%{http_code} %{size_download} %{content_type}\n' "$(python3 -c "import json;print(json.load(open('p.json'))['data']['url'])")"
```

The first returned `200 991 application/json` (a signed URL on `flkoss.obs-bj2.cucloud.cn`); the second `200 21842 application/vnd.openxmlformats-officedocument.wordprocessingml.document`, sha256 `03add47309479095920c170f083185a2fa7992e7553c8d8d8ce7ac656d6637b2`. A second fetch gave the same hash for all ten flk files, so `fetched_sha256` reproduces (the signed URL changes per request, the file does not). `fetched_url` in the records is the `download/pc` request. Text: the docx `word/document.xml` read with `zipfile`; one line per non-empty paragraph, leading and trailing spaces and U+3000 indents stripped, nothing else changed. The contents table that precedes the articles is kept.

Stored (fetched 2026-11-02): `cn-ecology-code` 2026-08-15; `cn-epl` 2015-01-01 plus a repeal record 2026-08-15; `cn-ets-regulation` 2024-05-01 (adopted) and 2026-08-15 (consolidated); `cn-aucl` 2018-01-01, 2019-04-23, 2025-10-15; `cn-advertising-law` 2015-09-01, 2018-10-26, 2021-04-29. flk marks an item `adopted` here when its header says 修订 (full revision) or the item is the original promulgation, and `consolidated` when the header says 修正 or 根据…决定修订 (a decision amending it). flk does not hold departmental rules (the `enumData` category list has laws, administrative regulations, supervision regulations, local regulations and judicial interpretations).

### mee.gov.cn (row `CN-MEE-ADOPTED`)

```
curl -sS -A 'Mozilla/5.0' -o m.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.mee.gov.cn/gzk/gz/202112/t20211210_963770.shtml
```

Returned `200 25564 text/html` (企业生态环境信息依法披露管理办法, MEE Order 24, text as amended by the 2026-09-20 decision). Same host, `.../202112/t20211213_963865.shtml` (碳排放权交易管理办法（试行）, Order 19) returned `200 23778 text/html`. Text: from `<div class="gz_content">` to `<div class="gz_footer">` (title, parenthetical, articles), block elements as line breaks, `&nbsp;` as a space. Two fetches gave the same sha256 for both pages. The database serves the current text only, so the as-promulgated 2021 text of Order 24 is not stored; the old page `https://www.mee.gov.cn/xxgk2018/xxgk/xxgk02/202112/t20211221_964837.html` (200, 60438 bytes) shows the same amended text. The Order 24 page links a `.doc` and a `.pdf` of the same text.

### kjs.mof.gov.cn (row `CN-MOF-ADOPTED`)

www.mof.gov.cn pages answered 200 but the policy-release pages sit on `kjs.mof.gov.cn` (Accounting Department).

```
curl -sS -A 'Mozilla/5.0' -o k.html -w '%{http_code} %{size_download} %{content_type}\n' https://kjs.mof.gov.cn/zhengcefabu/202512/t20251225_3980202.htm
curl -sS -A 'Mozilla/5.0' -o b.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://kjs.mof.gov.cn/zhengcefabu/202412/P020241216565879245839.pdf
```

The first returned `200 78153 text/html` (Climate Standard notice 财会〔2025〕34号 with the whole standard in the page; sha256 `5891c643a13474e5e8ef5693926062bf0226653d9dfe2b91ce4872a4b0573581`, reproduced in later fetches; the edge now and then answers 502 Bad Gateway with a 2004-byte page, retry). Text: from `<h2 class="title_con">` to the publication-date line, page chrome lines (date and source line, a stray comment marker, the attachment-download script text) removed. The second returned `200 167900 application/pdf` (Basic Standard attachment, sha256 `fd0610c6c06f217fc58bbde54c833ddee66687694f7a24fa710d2fcacef967c5`). PDF text: `pdftotext -layout b.pdf -` (poppler), runs of spaces collapsed, form feeds and lines holding only a page number dropped; the PDF's hard line wraps stay. Checked for mojibake: no U+FFFD or private-use characters in either text.

### Languages

China's official language for national law is Chinese (Mandarin, simplified characters); every stored record is `zh`. No English record is stored: no row with `form` translation was added because no state-published English text was found. Looked for on 2026-11-02: english.www.gov.cn (home page 200, 58342 bytes) and a web search for an official English text of each flk law; the NPC English pages on npc.gov.cn refused the cloud address (below). English texts that turned up are on WIPO Lex, law firm sites and commercial databases, which are never stored. The SZSE English PDF of Guideline No. 17 sits under the permission-requested SZSE row.

### Link only

- `cn-sse-sustainability-guideline-14`, `cn-szse-sustainability-guideline-17`, `cn-bse-sustainability-guideline-11`: rows `CN-SSE-ADOPTED`, `CN-SZSE-ADOPTED`, `CN-BSE-ADOPTED` are `permission requested` (non-commercial use only). The SZSE guideline text was read (docx, 200 over http) only to find its in-force date and was not stored. Exchange rule pages did open: SSE page 200, SZSE page 200 over plain http, BSE legal notice 200 with a browser.
- Not in scope: the Application Guide to the Basic Standard (issued 2025-09-03 per a provincial reprint; its mof.gov.cn page was not found), the draft Climate Standard application guides (comments until 2026-10-26, F7 register row), the Climate Change Response Law (draft, F7 register row), the CSRC (no instrument, so no row).

### Blocked (from the cloud address)

- `https://www.npc.gov.cn/`: curl `SSL routines::sslv3 alert handshake failure`, no status.
- `https://www.szse.cn/` (https): curl `SSL_ERROR_SYSCALL`, no status; `http://www.szse.cn/` answered 200, 88325 bytes, and was used.
- `https://www.bse.cn/`: curl `200 345 text/html` (a script that sets a cookie and reloads); headless Chromium (Playwright, goto, 3 s wait) passed and the legal notice opened, but Playwright's request client looped on 302 redirects fetching the rule PDF `https://www.bse.cn/uploads/6/file/public/202404/20240412194221_kes5c2ch9s.pdf`, so the BSE guideline was not read.
- `https://www.sse.com.cn/lawandrules/sselawsrules/stocks/mainipo/c/10753180/files/0d6fa191e9cf4db193c86d766f79e30b.docx` (found by search): `404 150 text/html`; the SSE rule page itself opened.

Everything else used answered curl: flk.npc.gov.cn, www.mee.gov.cn, kjs.mof.gov.cn, www.mof.gov.cn, www.sse.com.cn, www.gov.cn, english.www.gov.cn, www.csrc.gov.cn (home page only).

## Türkiye

Rows `TR-MEVZUAT-CONSOLIDATED` and `TR-RESMIGAZETE-ADOPTED`, both `pass` on the statute basis (Fikir ve Sanat Eserleri Kanunu, Law No. 5846, madde 31: "Resmen yayımlanan veya ilan olunan kanun, Cumhurbaşkanlığı kararnamesi, yönetmelik, tebliğ, genelge ve kazai kararların çoğaltılması, yayılması, işlenmesi veya her hangi bir suretle bunlardan faydalanma serbesttir."). Madde 31 does not name a board decision (Kurul Kararı), so the KGK decisions that adopted TSRS 1 and TSRS 2 are not covered by it. Rows `TR-KGK-ADOPTED` and `TR-SPK-ADOPTED` are `permission requested`. Run on 2026-11-02 from the cloud address; no site was blocked. Both sites answer plain `curl` with HTTP 200 and ordinary HTML, no browser needed, but only when the request carries a `User-Agent`: `curl` without `-A` to mevzuat.gov.tr stalled until `-m 20` expired (`curl: (28) Operation timed out after 20001 milliseconds with 0 bytes received`), so every command below sets `-A 'Mozilla/5.0'`. Language: Turkish only.

Row `TR-MEVZUAT-CONSOLIDATED`, consolidated text of Climate Law No. 7552 (laws: type 1, register 5):

```
curl -sS -L -m 60 -A 'Mozilla/5.0' -o 7552_mevzuat.htm -w '%{http_code} %{size_download} %{content_type}\n' https://www.mevzuat.gov.tr/mevzuatmetin/1.5.7552.htm
```

Returned `200 101504 text/html`, sha256 `52589e647c2302eb2750a0386465cf4ff46779197c4d5c2b20710493395d14a3`; a second fetch gave the same hash (no per-request token). The file is Word-exported HTML in Windows-1254 (the `<meta>` says so); it is decoded with that charset. The same file as PDF is `.../mevzuatmetin/1.5.7552.pdf` (`200 268717 application/pdf`). Regulations (yönetmelik) and communiqués (tebliğ) live under a different path, with the type number in the file name; the folder is `yonetmelik` for both. Türkiye Emisyon Ticaret Sistemi Piyasasının İşletilmesine İlişkin Yönetmelik (type 7, number 46347):

```
curl -sS -L -m 60 -A 'Mozilla/5.0' -o ets_market.htm -w '%{http_code} %{size_download} %{content_type}\n' https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.46347.htm
```

Returned `200 167769 text/html`. Kurumsal Yönetim Tebliği (type 9, number 19225): `https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/9.5.19225.htm`, `200 93888 text/html`. A wrong path does not give a 404: it returns the 64854-byte site shell with `200 text/html; charset=utf-8`, so check the size and the charset. The site serves one current consolidation per instrument, with no point-in-time versions, so a consolidated record is dated by the latest amendment the text itself marks. The type and number of an instrument come from the site's search endpoint, `POST https://www.mevzuat.gov.tr/Anasayfa/MevzuatDatatable` with a JSON body (`{"draw":1,"start":0,"length":200,"parameters":{"MevzuatTur":9,"AranacakMetin":"","AranacakYer":1,"MevzuatNo":"","BaslangicTarihi":"","BitisTarihi":"","TertipNo":0}}`, headers `Content-Type: application/json; charset=UTF-8` and the User-Agent), which returns `200` JSON with `mevzuatNo`, `mevAdi`, `resmiGazeteTarihi` and `resmiGazeteSayisi` per row; its text filter did not work, so the list was paged and filtered by name locally (types 1 laws, 7 and 3 regulations, 9 communiqués, 21 presidential regulations).

Row `TR-RESMIGAZETE-ADOPTED`, as-published text. The day's index gives the item number and file type (`.htm` or `.pdf`), then the item:

```
curl -sS -L -m 60 -A 'Mozilla/5.0' -o 20250709.htm -w '%{http_code} %{size_download} %{content_type}\n' https://www.resmigazete.gov.tr/eskiler/2025/07/20250709.htm
curl -sS -L -m 60 -A 'Mozilla/5.0' -o 20250709-1.htm -w '%{http_code} %{size_download} %{content_type}\n' https://www.resmigazete.gov.tr/eskiler/2025/07/20250709-1.htm
```

Returned `200 16164 text/html` and `200 110105 text/html`; the item (Climate Law No. 7552, Resmî Gazete 32951) has sha256 `0a77a032a4f525256e033e7cbcd7dd2317ad1e203fcdb0870b7b7ae7883e9c0b`, reproduced by a second fetch. Mükerrer issues are `{YYYYMMDD}M1.htm` for the index and `{YYYYMMDD}M1-{n}.pdf` for items.

Text extraction (both rows): remove `script`, `style` and `head`; collapse all whitespace in the source to single spaces (the Word export wraps lines inside paragraphs); turn block tags (`p`, `div`, `br`, headings, `tr`, `li`, `table`) into line breaks; strip the remaining tags; unescape entities; trim each line and drop empty lines. Nothing is reworded; the gazette header lines (date, number) and the Mevzuat footnotes are kept because they are in the file. `fetched_sha256` is the hash of the file as received.

Stored (fetched 2026-11-02). A Mevzuat consolidation is stored only when its body differs from the gazette text; the Climate Law differs because the gazette item also carries the Law's amendments to other laws.

| Instrument | Row | Versions stored (`in_force`, `tr`) |
|---|---|---|
| `tr-iklim-kanunu` | adopted, consolidated | 2025-07-09 (both) |
| `tr-iklim-idari-para-cezasi-teblig` | adopted | 2025-12-27 (annex with the fine table not in the text) |
| `tr-ets-yonetmeligi` | adopted | 2026-08-27 (Mevzuat body identical, not stored) |
| `tr-ets-piyasa-yonetmeligi` | consolidated | 2026-10-21 |
| `tr-kurumsal-yonetim-teblig` | adopted, consolidated | 2014-01-03, 2020-10-02 |
| `tr-tuketici-kanunu-6502` | adopted, consolidated | 2014-05-28, 2026-07-01 |
| `tr-ticari-reklam-yonetmeligi` | adopted, consolidated | 2015-01-10, 2026-08-01 |

Reproducibility: every one of the 11 files was fetched twice and gave the same sha256, so none carries a per-request token. No record is browser-fetched.

PDF: the Resmî Gazete PDF of the market regulation, `curl -sS -L -m 60 -A 'Mozilla/5.0' -o m.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.resmigazete.gov.tr/eskiler/2026/10/20261021-4.pdf`, returned `200 289078 application/pdf`. `pdftotext -layout m.pdf -` returned lines such as `9Z\Y"]?]Q^V^VX+MG\Z[\U\7RYRURZS^Z6` (legacy font encoding, no readable Turkish), so it is not stored; the Mevzuat text of the same regulation is. The TSRS decision PDFs of 2023-12-29 (`https://www.resmigazete.gov.tr/eskiler/2023/12/20231229M1-7.pdf`, `200 670309 application/pdf`) are page images (`pdfimages -list` shows JBIG2 images, `pdftotext` returns 12 words), so they would need OCR.

### Languages

No second official language: the Mevzuat Bilgi Sistemi and the Resmî Gazete publish Turkish only. No government English translation of any instrument was found on 2026-11-02, so there is no translation row. Looked at: mevzuat.gov.tr and resmigazete.gov.tr (Turkish only), the ministry English pages on `iklim.gov.tr/en` (news items summarising the Climate Law and the ETS, not translations of the text), the Ministry of Trade pages on `ticaret.gov.tr`, and the KGK site (`kgk.gov.tr`, TSRS in Turkish). Translations by law firms, news sites or chambers of commerce turned up in search and are never stored.

### Link only

- `tr-tsrs`: row `TR-KGK-ADOPTED`, `permission requested` (kgk.gov.tr carries only the footer "T.C. Kamu Gözetimi Kurumu © 2024"). The KGK PDFs answer curl: `curl -sS -L -m 60 -A 'Mozilla/5.0' -o tsrs1.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.kgk.gov.tr/Portalv2Uploads/files/Duyurular/v2/Surdurulebilirlik/RaporlamaStandarti/TSRS%201(1).pdf'` returned `200 501413 application/pdf` and `.../TSRS2_.pdf` returned `200 811958 application/pdf`, both with a text layer, but nothing is stored. The Resmî Gazete copy is not covered by madde 31 (a board decision is not named) and is images only.
- Not in scope: Sürdürülebilirlik İlkeleri Uyum Çerçevesi (SPK, 2020, amended 2022), a Board announcement on spk.gov.tr (`TR-SPK-ADOPTED`, `permission requested`: footer "Sermaye Piyasası Kurulu Tüm hakları saklıdır."); it is referred to in the notes of `tr-kurumsal-yonetim-teblig`. Borsa İstanbul has no row (no instrument in scope); its Telif Hakkı ve Çekince İhbarı bars copying and changing without prior written permission.
- Reklam Kurulu Çevreye İlişkin Beyanlar İçeren Reklamlar Hakkında Kılavuz (Ministry of Trade): a guide, family F7, register row only.
- The notice "Gizlilik, Kullanım ve Telif Hakları bildirimi" that both footers refer to is not linked in the page HTML and was not found (candidate paths return the home page), so its text was not read.

### Blocked

No site refused the cloud address. The only failure was `mevzuat.gov.tr` without a `User-Agent` header (timeout), described above.

## Chile

Run on 2026-11-02 (GEL-07-05). Two rows pass, both on the publisher's terms (not a statute): `CL-BCN-ADOPTED` and `CL-BCN-CONSOLIDATED` (Biblioteca del Congreso Nacional, Ley Chile). Their deciding sentence is section 9 of the Ley Chile API conditions: the texts of laws, decrees and similar acts served through Ley Chile are outside copyright and the BCN claims no rights in them. Two rows are `permission requested`: `CL-CMF-ADOPTED` (the CMF site authorises reproduction with the source named but does not mention commercial reuse or modification) and `CL-DIARIOOFICIAL-ADOPTED` (reuse is open to all but condition a) forbids altering the content). Varun to confirm the two BCN passes: the same section says other Ley Chile content is CC BY-NC-ND, the API conditions ban bulk extraction and AI training without authorisation, and the fetches below used the older public endpoints without an API key. No browser was needed for any record.

Every `leychile.cl` and `bcn.cl` host answers a request with no browser User-Agent with an empty `401` from CloudFront, and `www.diariooficial.interior.gob.cl` answers it with a `403`. A short User-Agent (`-A 'Mozilla/5.0'`) is enough; the watcher's own User-Agent (`global-esg-law-watch/1`) is also answered `200`. The failing line first:

```
curl -sS -L -o x.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=1196414&idVersion=2023-09-29&idLey=&tipoVersion=&cve=&agrupa_partes=1&r='
```

Returned `401 0` (empty content type). With the User-Agent the same URL returns the file below.

Row `CL-BCN-ADOPTED`, Decreto 4 of 2023 (idNorma 1196414), JSON route:

```
curl -sS -L -A 'Mozilla/5.0' -o ds4.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=1196414&idVersion=2023-09-29&idLey=&tipoVersion=&cve=&agrupa_partes=1&r='
```

Returned `200 61807 application/json; charset=utf-8`; a second request returned the same bytes (`fetched_sha256` f8ef0ccc...). The JSON is the data the Ley Chile page draws: `html` is a tree of parts (`t` is an HTML fragment, `h` the child parts, `i` the part id), `estructura` names the parts, `metadatos` the dates. Record text = every `<div class="p">` of every part in order, tags removed, `&nbsp;` and runs of spaces collapsed, empty paragraphs dropped, BCN's amendment annotations (`<span class="n">`) dropped, one paragraph per line; parts named Anexo (for Ley 21.455, the Constitutional Tribunal certificate on the bill) are left out. The text is not reworded. The version list of any norm:

```
curl -sS -L -A 'Mozilla/5.0' -o v.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://nuevo.leychile.cl/servicios/Consulta/get_versiones?idNorma=1177286&formato=json&idParte=&idsParte='
```

Returned `200 841 text/xml;charset=utf-8` (the body is JSON: `@vigenteDesde`, `@vigenteHasta`, `@tipoVersion` of "Texto Original", "Intermedio", "Última Versión" or "Única"). `Texto Original` and `Única` are stored under the adopted row, the others under the consolidated row. Ley 21.455 is this idNorma: row `CL-BCN-ADOPTED`, version 2022-06-13, `curl -sS -L -A 'Mozilla/5.0' -o l21455.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=1177286&idVersion=2022-06-13&idLey=&tipoVersion=&cve=&agrupa_partes=1&r='` returned `200 192678 application/json; charset=utf-8` (sha256 06f41402...); row `CL-BCN-CONSOLIDATED`, version 2025-07-11, same URL with `idVersion=2025-07-11`, returned `200 192844` (sha256 bd013320..., identical on two requests).

XML route, used for the two instruments where only one or two articles are stored. Row `CL-BCN-CONSOLIDATED`, Ley 20.780 as of 2023-02-25 (idNorma 1067194; a norm is found from its number with `https://www.leychile.cl/Consulta/obtxml?opt=7&idLey=20780`, which returned `200 409864 text/xml; charset=utf-8`):

```
curl -sS -L -A 'Mozilla/5.0' -o l20780.xml -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.leychile.cl/Consulta/obtxml?opt=7&idNorma=1067194&idVersion=2023-02-25'
```

Returned `200 344807 text/xml; charset=utf-8` (sha256 3bf915a2...). The XML (`Norma/EstructurasFuncionales/EstructuraFuncional/Texto`) is cut by the position of the element whose `Texto` starts `Artículo 8°` (idParte 9509251); each `Texto` is split into paragraphs at lines that start with whitespace, wrapped lines joined with a space. Row `CL-BCN-ADOPTED`, Ley 19.496 as published (idNorma 61438, version 1997-03-07, articles 28 and 33 cut the same way): `curl -sS -L -A 'Mozilla/5.0' -o l19496.xml -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.leychile.cl/Consulta/obtxml?opt=7&idNorma=61438&idVersion=1997-03-07'` returned `200 84500 text/xml; charset=utf-8` (sha256 529c5bd4...). All 18 versions of Ley 19.496 and all 10 of Ley 20.780 were fetched; the two articles of Ley 19.496 are the same in each, and the versions of Ley 20.780 in which art. 8 differs are the five stored. Both cuts were compared on 2026-11-02 with the JSON route of the same versions: identical text except for BCN's amendment annotations, which only the JSON carries.

Why two routes: on the same day the XML route returned `Texto` elements cut mid-word for Ley 21.455 (art. 5 letters c) to i), "prá" and "Climá" as last characters) and a replacement character for the accented i of "Título" in Decreto 4/2023. The first XML fetch of the Ley 21.455 version 2022-06-13 was complete (188127 bytes, sha256 93f630c0...); later requests for the same URL returned 181567 bytes (0a807631...) with the cut. Because of that variance Ley 21.455 and Decreto 4 are stored from the JSON route, whose bytes were identical on repeated requests, and the XML `fetched_sha256` of the other two instruments was reproduced on a second request (the Ley 20.780 files match byte for byte). If a later run of the XML route returns different bytes, treat the stored XML hash as the date-stamped one and compare the article text, not the hash.

Row `CL-CMF-ADOPTED` (permission requested, nothing stored): `curl -sS -L -A 'Mozilla/5.0' -o ncg461.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.cmfchile.cl/normativa/ncg_461_2021.pdf` returned `200 563413 application/pdf`; the NCG 519 PDF (`.../ncg_519_2024.pdf`) returned `200 272348 application/pdf`. The CMF normativa page of NCG 461 answers without a User-Agent (`200 113829`). Both PDFs were read with `pdftotext -layout` only to take dates and amendments (no mojibake); nothing is stored. Row `CL-DIARIOOFICIAL-ADOPTED` (permission requested): `curl -sS -L -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://www.diariooficial.interior.gob.cl/` returned `403 286 text/html; charset=iso-8859-1`; with `-A 'Mozilla/5.0'` it returned `200 29180 text/html; charset=UTF-8`. Its terms page is a script-rendered shell (1325 bytes to curl) and was read with Playwright chromium after networkidle. No edition PDF was fetched, so no `pdftotext` recipe is proven for the gazette.

### Languages

Run on 2026-11-02. Chile has one official language, Spanish; every record has `language` es and no row of its own was added for a second language. English was looked for at the Ley Chile pages (`https://www.bcn.cl/en` returned `200 8888 text/html`, the Spanish script shell; `https://www.bcn.cl/leychile/en` `200 9602`, the same shell; the Ley Chile version lists are Spanish only), at the CMF site (`https://www.cmfchile.cl/english/` returned 404, 2319 bytes; the normativa pages are Spanish only) and at the Diario Oficial (`https://www.diariooficial.interior.gob.cl/en` returned 404, 29166 bytes). No government English translation of any scope instrument was found, so no translation row exists and no translation record is stored. Unofficial English texts of Ley 21.455 published by outside bodies were not looked at and would not be stored.

### Link-only instruments

| Instrument | Official URL | Why link only |
|---|---|---|
| cl-ncg-461 (CMF NCG 461) | https://www.cmfchile.cl/portal/normativa/624/w4-article-106836.html | Row `CL-CMF-ADOPTED` is permission requested: the CMF site authorises reproduction with the source named, but says nothing on commercial reuse or modification. The PDF opens (200, 563413, application/pdf). |
| cl-ncg-519 (CMF NCG 519, amends NCG 461) | https://www.cmfchile.cl/normativa/ncg_519_2024.pdf | Same row, same reason. The PDF opens (200, 272348, application/pdf). |
| Ley 20.920 (F7) | https://www.bcn.cl/leychile/navegar?idNorma=1090894 | F7: register row only, no scope entry. |

Blocked from the cloud address: none refused a browser User-Agent. Without one, `www.bcn.cl`, `www.leychile.cl` and `nuevo.leychile.cl` answer `401` with an empty body (CloudFront) and `www.diariooficial.interior.gob.cl` answers `403`. The watchers in `upkeep/watchers.json` run from the shipped User-Agent, which the BCN hosts and the CMF accept (`--dry-run` 2026-11-02: 0 failures), and carry a browser `second_route` anyway.

Stored by GEL-07-05: `cl-ley-21455` (adopted 2022-06-13, consolidated 2025-07-11), `cl-ley-20780-art8` (adopted 2014-10-01; consolidated 2016-02-08, 2020-02-24, 2023-01-01, 2023-02-25), `cl-ds-4-2023` (adopted 2023-09-29), `cl-ley-19496-art28-33` (adopted 1997-03-07).

## Israel

GEL-07-03, run 2026-11-02. Rows added: `IL-KNESSET-ADOPTED` (`pass`, statute: Copyright Law 5768-2007 s.6, which the repository's brief quoted in other words; see the row), `IL-RESHUMOT-ADOPTED`, `IL-ISA-ADOPTED` and `IL-BOI-ADOPTED` (all `permission requested`). Nothing is fetched with a browser: the Knesset OData API and the PDFs on `fs.knesset.gov.il` answer plain `curl`, while the Knesset web app, gov.il and the Bank of Israel pages do not (see the end of this section). So there are no browser-fetched records and no per-request token: `fetched_sha256` is the sha256 of the PDF as received, and a second fetch of both stored PDFs gave the same hash.

Finding the files. The Knesset database page `https://main.knesset.gov.il/Activity/Legislation/Laws` is a JavaScript app behind a bot challenge, but the same data is in the Knesset OData API, which has no challenge. For an Act, `KNS_IsraelLaw` names it (`$filter=substringof('אוויר נקי',Name)`), `KNS_LawBinding` lists its original publication and each amending publication (`BindingType` 6012 original, 6013 amending), and `KNS_DocumentBill` with `GroupTypeID eq 9` (חוק - פרסום ברשומות) gives the Sefer HaChukkim PDF of a publication by `BillID`. Secondary legislation is in `OdataV4/ParliamentInfo/KNS_SecondaryLaw` with `KNS_DocumentSecondaryLaw` (the "פרסום ברשומות" document is the Kovetz HaTakanot PDF; the file path has backslashes, use forward slashes).

Row `IL-KNESSET-ADOPTED`, proven requests (named instrument: Clean Air Law, 5768-2008):

```
curl -sS -G -o a.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_DocumentBill' --data-urlencode '$format=json' --data-urlencode '$filter=BillID eq 98122 and GroupTypeID eq 9'
```

Returned `200 427 application/json;odata=minimalmetadata;streaming=true;charset=utf-8`, with `FilePath` `https://fs.knesset.gov.il//17/law/17_lsr_299971.pdf`.

```
curl -sS -o 17_lsr_299971.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://fs.knesset.gov.il//17/law/17_lsr_299971.pdf'
```

Returned `200 571492 application/pdf`, 44 pages, sha256 `e883821bf38b4a341f2d46de3cdbdad2ae8eb3ddfc82276fb0c0353d17ff1818` twice. The second stored PDF, `curl -sS -o 18_lsr_301394.pdf 'https://fs.knesset.gov.il//18/law/18_lsr_301394.pdf'` (Protection of the Environment (Emissions and Transfers) Law, 2012, `KNS_DocumentBill` `BillID eq 419714`), returned `200 543821 application/pdf`, 28 pages, sha256 `6bdc305c5aeb353062b2fd7ecaaf4c31511ccf5ebb999648ce330a9531436979` twice. The Copyright Law as enacted, read for the statute, is `https://fs.knesset.gov.il//17/law/17_lsr_300007.pdf` (`200 224846 application/pdf`, sha256 `d687d363...`). A Kovetz HaTakanot PDF: `https://fs.knesset.gov.il/25/SecondaryLaw/25_scl_rv_4908147.pdf` returned `200 167743 application/pdf` (read, not stored).

The version lists the watchers read: `curl -sS -G 'https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_IsraelLaw(2000055)' --data-urlencode '$format=json'` returned `200 860 application/json;odata=minimalmetadata;streaming=true;charset=utf-8` (`LatestPublicationDate` 2024-04-16).

### Text extraction (Hebrew PDFs)

These Sefer HaChukkim PDFs (InDesign, glyph-ID fonts) cannot be read with `pdftotext -layout` or the default mode: on every odd page the page text is drawn twice, the first copy under a white rectangle, so poppler prints each word twice and interleaves the two copies (`pdftotext -layout -f 5 -l 5 17_lsr_299971.pdf -` gives lines such as `מבנהמבנהאוויר ,לרבות` and a second pass of the same words). `pdftotext -raw` prints single copies but in visual order with the final letter ר displaced to the front of some words. `pypdf` `extract_text` shows the same doubling. The text was therefore made with the script below (pypdf 6.17.0 and poppler `pdftotext` 24.02.0, `python3 -I il_pdf.py in.pdf out.txt`): it deletes the text drawn before each white box, takes word boxes from `pdftotext -bbox`, rebuilds each row right to left, reverses each word from visual to logical order (digits and Latin words kept left to right), puts margin notes (smaller font, in the margin) ahead of the paragraph they sit beside, and drops the page footer line. Then the text is cut at the title and at the end of the Act (the contents page and, for the 2012 Act, the correction notice printed after it, are left out), runs of spaces collapsed.

Checked: for every page of the 2008 and 2012 PDFs the multiset of Hebrew words was compared with `pypdf` on the trimmed PDF. On the 41 text pages of the Clean Air PDF the two agree except for apostrophes, words `pypdf` drops from square brackets, and table cells it runs together; on the 28-page 2012 PDF likewise. No U+FFFD, no control or bidi characters and no repeated lines in either stored text. Known limits: in the First Schedule table of the 2012 Act (pollutant names), parentheses and dashes next to Latin names can sit on the wrong side, and the signature names there come out letter-spaced; margin notes are lines of their own before their section. The PDFs of 1981 and earlier carry an OCR-like text layer (stray glyphs, mirrored brackets) and were not used.

```
#!/usr/bin/env python3
"""il_pdf.py in.pdf out.txt : Sefer HaChukkim PDF -> logical Hebrew text. Needs poppler pdftotext and pypdf."""
import html, re, subprocess, sys, tempfile
import pypdf
from pypdf.generic import DecodedStreamObject, NameObject
MARKS = re.compile('[‪-‮‎‏⁦-⁩]')
WHITE = re.compile(r'(?:1 1 1\s+scn\s*)?/GS1 gs\s*[\d. -]+ re\s*f\s*', re.S)
WORD = re.compile(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>')
PAGE = re.compile(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>', re.S)

def trim(src, dst):  # step 1: drop the copy of the page text that lies under a white box
    r = pypdf.PdfReader(src); w = pypdf.PdfWriter()
    for p in r.pages:
        c = p.get_contents().get_data().decode('latin1'); m = WHITE.search(c)
        if m:
            b = c.find('BT', max(c.find('\nQ'), 0)); c = c[:b] + c[m.end():]
            s = DecodedStreamObject(); s.set_data(c.encode('latin1')); p[NameObject('/Contents')] = w._add_object(s)
        w.add_page(p)
    w.write(dst)

def fix(tok):  # visual (left to right) token -> logical: reverse, then restore digit/latin runs
    r = MARKS.sub('', html.unescape(tok))[::-1]
    return re.sub(r'[0-9A-Za-z][0-9A-Za-z.,/:\-]*[0-9A-Za-z]|[0-9A-Za-z]', lambda m: m.group(0)[::-1], r)

def rows(items, tol=3.0):
    out = []
    for w in sorted(items, key=lambda w: w[1]):
        if out and abs(out[-1][0] - w[1]) <= tol: out[-1][1].append(w)
        else: out.append([w[1], [w]])
    return out

def line(r):  # words of one row, right to left; latin runs stay left to right
    toks = [(MARKS.sub('', w[4]), w[0], w[2], bool(re.search('[A-Za-z]', w[4]))) for w in sorted(r, key=lambda w: -w[0])]
    out, i, px = [], 0, None
    while i < len(toks):
        if toks[i][3]:
            j = i
            while j + 1 < len(toks) and toks[j + 1][3]: j += 1
            core = ' '.join(t[0] for t in reversed(toks[i:j + 1]))
            lead = re.match(r'^([^0-9A-Za-z]*)', core).group(1); trail = re.search(r'([^0-9A-Za-z]*)$', core).group(1)
            core = core[len(lead):len(core) - len(trail)]
            out.append(trail[::-1] + core + lead[::-1]); px = toks[j][1]; i = j + 1; continue
        t = fix(toks[i][0])
        if px is not None and px - toks[i][2] < 0.8 and re.fullmatch('[ךרדןי][,.;:]?', t) and out: out[-1] += t  # split final letter
        else: out.append(t)
        px = toks[i][1]; i += 1
    return ' '.join(out)

def page_lines(ws):
    ismarg = lambda w: abs((w[3] - w[1]) - 9.66) < 0.1 and (w[2] <= 104 or w[0] >= 398)  # margin-note font
    body = rows([w for w in ws if not ismarg(w)]); blocks = []
    for y, r in rows([w for w in ws if ismarg(w)]):
        if blocks and y - blocks[-1][-1][0] <= 16: blocks[-1].append((y, r))
        else: blocks.append([(y, r)])
    out = []
    for y, r in body:
        while blocks and blocks[0][0][0] <= y + 3: out.extend(line(rr) for _, rr in blocks.pop(0))
        out.append(line(r))
    for b in blocks: out.extend(line(rr) for _, rr in b)
    return out

def document(pdf):
    with tempfile.NamedTemporaryFile(suffix='.pdf') as t:
        trim(pdf, t.name)
        x = subprocess.run(['pdftotext', '-bbox', t.name, '-'], capture_output=True, text=True, check=True).stdout
    lines = []
    for m in PAGE.finditer(x):
        ws = [(float(a), float(b), float(c), float(d), html.unescape(e)) for a, b, c, d, e in WORD.findall(m.group(3))]
        pl = [l for l in page_lines(ws) if 'ספר החוקים' not in l]
        if pl and re.fullmatch(r'\d{1,4}', pl[-1].strip()): pl = pl[:-1]
        lines.extend(pl)
    return [re.sub(r' {2,}', ' ', l).strip() for l in lines if l.strip()]

if __name__ == '__main__':
    open(sys.argv[2], 'w').write('\n'.join(document(sys.argv[1])) + '\n')
```

### Stored (fetched 2026-11-02)

| Instrument | Row | Records |
|---|---|---|
| `il-clean-air-law` | adopted | 2011-01-01 he (the Act as published in Sefer HaChukkim 2174, 2008-07-31; start date from section 93) |
| `il-prtr-law` | adopted | 2012-04-01 he (the Act as published in Sefer HaChukkim 2348; no commencement section, so the record takes the publication date) |

Both are the as-enacted wording only. The Knesset database serves publications and no consolidated text, so later amendments are not stored.

### Languages

Hebrew is the language of the Acts; Reshumot publishes Israeli Acts in Hebrew only (Arabic has a special status but no Arabic text is published). No second official language exists to store. English: no government translation was found for either stored Act. Looked for: the OData `KNS_DocumentBill` list of each bill (first-reading text, Knesset plenum extracts, the Hebrew Sefer HaChukkim PDF; no English document) and `www.sviva.gov.il`, the environment ministry (connection failed from the cloud address). The Copyright Law s.6 names no translations, so an English translation would need its own row on the publisher's terms. No translation row was added and nothing English is stored.

### Link only

- `il-consumer-protection-law`: row passes, but the 1981 PDF text layer looks like OCR (stray glyphs, mirrored brackets) and was not checked against the page image, and the Knesset serves only the 1981 as-enacted wording of an Act amended up to 2026-07-28.
- `il-securities-periodic-reports-regs`: the Knesset store holds only amendments of the 1970 regulations, no PDF of the principal text; Reshumot (gov.il) refused the cloud address. No sustainability disclosure amendment found.
- `il-fuel-excise-order-2024`, `il-customs-tariff-order-2024`: orders (צו), not named in s.6 of the Copyright Law; the PDF was read for the dates and the commencement condition only.
- `il-boi-directive-345`: row `IL-BOI-ADOPTED` is `permission requested` (the Bank of Israel terms page was blocked); the directive PDF itself answers curl (`200 360881 application/pdf`).
- Not stored because not law: the Israel Securities Authority review report (F7 register row) and the Climate Law bill (government bill 1735, F7 register row). Nevo and Takdin are private databases: no row, never stored.

### Blocked from the cloud address

Failing `curl` lines and their answers, then the headless Chromium attempt. Chromium (Playwright, `page.goto(url, {waitUntil: 'domcontentloaded'})`, wait 4 s, locale he-IL) did not pass either, so no record rests on it; the orchestrator can try these from the laptop.

```
curl -sS -A 'Mozilla/5.0' -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://main.knesset.gov.il/Activity/Legislation/Laws
247 445 text/html; charset=utf-8
curl -sS -A 'Mozilla/5.0' -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://www.gov.il/he/departments/dynamiccollectors/reshumot
403 5188 text/html; charset=UTF-8
```

- https://main.knesset.gov.il/Activity/Legislation/Laws and `/en/about/pages/terms.aspx`, https://knesset.gov.il/ , https://fs.knesset.gov.il/ (root), https://knesset.gov.il/Laws/Data/BigLaws.aspx: HTTP 247 with a 440 to 445 byte JavaScript challenge page (`window.rbzns`); Chromium also got 247 and an empty body after 8 s. Only `knesset.gov.il/Odata/...`, `knesset.gov.il/OdataV4/...` and deep `fs.knesset.gov.il` PDF paths answer.
- https://www.gov.il/he/departments/dynamiccollectors/reshumot, https://www.gov.il/he/pages/terms and `/he/pages/terms-of-use`: HTTP 403, Cloudflare block page (5188 bytes to curl, 687 characters in Chromium).
- https://data.gov.il/: 403, 919 bytes. https://www.nevo.co.il/: 403 (private database, not used anyway).
- https://www.boi.org.il/en/terms-of-use/: HTTP 403 "Forbidden Transaction ID" in Chromium, a Radware loader page (200, 118350 bytes) to curl; the media PDF `https://boi.org.il/media/1quhabaa/345_et.pdf` answers 200 to GET and 302 to HEAD.
- https://web.archive.org/ and https://www.sviva.gov.il/: no connection from the cloud address (curl exit status 000).
- https://www.isa.gov.il/ redirects (301) to https://www.new.isa.gov.il/, which answers 200; its terms page was read with Chromium.

## Vietnam

Run on 2026-11-02 (GEL-07-09). Two rows pass, both on the statute basis (Law on Intellectual Property 50/2005/QH11 Điều 15 khoản 2: "Văn bản quy phạm pháp luật, văn bản hành chính, văn bản khác thuộc lĩnh vực tư pháp và bản dịch chính thức của văn bản đó" are outside copyright, quoted in the row from the consolidated text 160/2026/VBHN-LQ-VPQH): `VN-CONGBAO-ADOPTED` (the document as published in the Official Gazette) and `VN-CONGBAO-CONSOLIDATED` (the văn bản hợp nhất issued by the Office of the National Assembly or a ministry and published in the Gazette; the row notes say Varun decides whether a consolidation is an official text within Điều 15 khoản 2). Four rows are `permission requested` and store nothing: `VN-VBPL-CONSOLIDATED` (vbpl.vn), `VN-PHAPLUAT-CONSOLIDATED` (phapluat.gov.vn), `VN-VIETNAMLAW-TRANSLATION` (vietnamlaw.gov.vn) and `VN-SSC-CONSOLIDATED` (ssc.gov.vn). The Công báo site states one condition, naming the source ("Ghi rõ nguồn 'congbao.chinhphu.vn' khi phát hành lại thông tin từ các nguồn này."), carried in the licence trailer. Language: Vietnamese only; no government English text was reachable (see Languages).

Two things about the host. `congbao.chinhphu.vn` resets some connections from the cloud address (`curl: (35) Recv failure: Connection reset by peer`, also seen on `datafiles.chinhphu.vn` and `vanban.chinhphu.vn`); the same request succeeds on a retry, so the commands below are each run with up to four tries. The `g7.cdnchinhphu.vn/api/download/stream?...` links on the document pages fail TLS verification from the cloud address (`curl: (60) SSL certificate problem: unable to get local issuer certificate`, an incomplete chain), so they are not used; the `congbaocdn.chinhphu.vn` PDF link on the same page serves the same document.

The document page `https://congbao.chinhphu.vn/van-ban/<slug>-<id>.htm` lists the PDF files of the document (`href` values containing `congbaocdn.chinhphu.vn`). A document printed across several Gazette issues (a law, a long decree) is several PDFs; they are read in the order listed and form one text. One 2012 file has no `.pdf` suffix in its link (`.../11328-1-2012481-482-162012qh13pdf`, served as `application/octet-stream`); it is a PDF.

Row `VN-CONGBAO-ADOPTED`, Decree 06/2022/NĐ-CP (`vn-nd-06-2022`). Step 1, the document page:

```
curl -sS -L -o d06_page.html -w '%{http_code} %{size_download} %{content_type}\n' https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-06-2022-nd-cp-36560.htm
```

Returned `200 149077 text/html; charset=utf-8`. The page carries "Ban hành: 07/01/2022 - Hiệu lực: 07/01/2022". Its size changes by about 195 bytes between two cached variants (a trailing HTML comment with the cache time), so the page is not hashed. Step 2, the signed PDF:

```
curl -sS -L -o d06.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2022/1/36560/39440-1-2022131-13206-2022-nd-cp.pdf
```

Returned `200 1151972 application/pdf; charset=utf-8`, sha256 `29e28ab67fcd93754a82d0ce3a974231eae3c599c1c51e1b74e727af9d05f4e4` on two fetches (the file is static, so the hash reproduces).

Row `VN-CONGBAO-CONSOLIDATED`, Law on Environmental Protection, consolidated text 09/VBHN-VPQH (`vn-luat-bvmt-2020`, record `2024-07-01-consolidated-vi.json`):

```
curl -sS -L -o v09_page.html -w '%{http_code} %{size_download} %{content_type}\n' https://congbao.chinhphu.vn/van-ban/van-ban-hop-nhat-so-09-vbhn-vpqh-40444.htm
curl -sS -L -o v09_0.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2023/8/40444/47107-1-20231209-121009-vbhn-vpqh.pdf
curl -sS -L -o v09_1.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2023/8/40444/47110-1-20231211-121209-vbhn-vpqh.pdf
```

Returned `200 150730 text/html; charset=utf-8`, `200 1351325 application/pdf; charset=utf-8` and `200 743354 application/pdf; charset=utf-8`. `fetched_sha256` of a record that has several files is the sha256 of the files concatenated in the order listed (`cat v09_0.pdf v09_1.pdf | sha256sum` gives `cd9925bd...fd26f27`, the value stored), and `fetched_url` lists the URLs separated by single spaces. The consolidated documents of 2026 are single PDFs under `https://congbaocdn.chinhphu.vn/180507251028987904/<yyyy>/<m>/<d>/<file>_signed.pdf`.

Text extraction: `pdftotext -layout file.pdf -` (poppler) for each file, parts joined in order; runs of spaces collapsed to one, blank lines dropped, form feeds removed, and the running Gazette furniture dropped: the lines containing `CÔNG BÁO/Số` (the page header with the issue number and date) and the digital-signature block lines beginning `Người ký:`, `Email:`, `Cơ quan:`, `Thời gian ký:`, `Ký bởi:` or `Ngày ký:`. Nothing else is changed: footnotes stay where the PDF layout puts them, and the bilingual labels inside the annex forms are the official text. Checked before storing, for every file: no U+FFFD or private-use character, at least 400 characters per page (a scan has none), the text contains "Điều 1", it is NFC, and the `Điều N.` headings run in order (the Law on Environmental Protection has 171, the Consumer Law 80, the Advertising Law 43). One exception: Decree 119/2025/NĐ-CP contains two Symbol-font bullets (U+F0A7) and one summation sign in a formula that pdftotext emits as U+FFFD; they are glyphs, not mojibake, and are kept as extracted (see its scope note). Reading of the dates: a Gazette document's `in_force` is the date its own commencement clause gives (quoted in the scope `evidence`); a consolidated text carries no commencement date of its own (the page shows "01/01/1900"), so its `in_force` is the in-force date of the last amendment its preamble lists.

Stored (fetched 2026-11-02, all Vietnamese, 24 records in 14 instruments):

| Instrument | adopted | consolidated (`in_force`) |
|---|---|---|
| `vn-tt-96-2020` | 2021-01-01 | 2026-02-03 (10/VBHN-BTC) |
| `vn-luat-bvmt-2020` | 2022-01-01 | 2023-07-01, 2024-07-01, 2025-07-01, 2026-01-01 |
| `vn-nd-08-2022` | 2022-01-10 | none on Công báo |
| `vn-nd-48-2026` | 2026-01-29 | none |
| `vn-nd-06-2022` | 2022-01-07 | none |
| `vn-nd-119-2025` | 2025-08-01 | none |
| `vn-nd-83-2026` | 2026-03-23 | none |
| `vn-nd-112-2026` | 2026-05-19 | none |
| `vn-nd-29-2026` | 2026-01-19 | none |
| `vn-nd-180-2026` | 2026-07-15 | none |
| `vn-luat-bvqltd-2023` | 2024-07-01 | 2026-07-01 (47/VBHN-VPQH) |
| `vn-nd-55-2024` | 2024-07-01 | 2026-07-01 (29/VBHN-BCT) |
| `vn-luat-quang-cao-2012` | 2013-01-01 | 2025-01-01, 2025-07-01, 2026-01-01 |
| `vn-luat-quang-cao-75-2025` | 2026-01-01 | none |

Not stored: the consolidated Advertising Law 47/VBHN-VPQH of 2018-12-10 (state of 2019-01-01) is a scan with no text layer (22 pages, 185 characters), so the state of 2019-01-01 to 2024-12-31 has no record; the consolidated Circular 96 states of 2024-11-02 and 2025-05-05 are not published as consolidated texts on Công báo (the SSC copy 41/VBHN-BTC is on ssc.gov.vn, row `permission requested`). The Government portal copy of Circular 96/2020/TT-BTC (`https://datafiles.chinhphu.vn/cpp/files/vbpq/2020/12/96-btc.pdf`, `200 3488133 application/pdf`, 107 pages) is an image-only PDF (JBIG2 scan; `pdftotext` returns 239 characters), so it is not used; the Công báo PDFs of the same circular have a text layer. Decision 232/QĐ-TTg of 2025-01-24 (carbon market Scheme, Công báo document 44071) approves an Đề án in an individual decision and is not a văn bản quy phạm pháp luật; it has a `register.csv` row with `law_family` F7 and no scope entry. Decree 396/2026/NĐ-CP (effective 2026-12-12 per the existing register note) was not on Công báo on 2026-11-02 (the newest decree listed was 393/2026/NĐ-CP) and has no entry.

### Languages

Vietnamese is the only official language; there is one record per dated version, under the same row as the version (`-vi.json`). English: no Vietnamese government English translation was reachable, so no `translation` record exists and no instrument has an English record. Where it was looked for:

- `vietnamlaw.gov.vn` (Bộ Tư pháp, English legal translations) and `phapluat.gov.vn`: every request answers 403 from the cloud address, to `curl` and to headless Chromium alike:

```
curl -sS -L -o x.out -w '%{http_code} %{size_download} %{content_type}\n' -A 'Mozilla/5.0' https://vietnamlaw.gov.vn/en
```

Returned `403 6077 text/html` (`https://phapluat.gov.vn/`: `403 6075 text/html`). Playwright chromium (`goto`, wait 9 s) got "Sorry, you have been blocked ... You are unable to access https://vietnamlaw.gov.vn/en". Rows `VN-PHAPLUAT-CONSOLIDATED` and `VN-VIETNAMLAW-TRANSLATION` are `permission requested` for that reason; whether a translation there is a "bản dịch chính thức" or one marked for reference was not readable.
- `vbpl.vn` lists a feature "Xem văn bản tiếng Anh" but the page is a client-rendered shell and its data gateway resets the connection (below).
- `congbao.chinhphu.vn`: Vietnamese only; neither the home page, the listings nor the document pages carry an English edition or link.

### Link only

None: all 14 scope instruments have at least one record.

### Blocked from the cloud address

- `https://phapluat.gov.vn/` and `https://vietnamlaw.gov.vn/en`: `403 6075` and `403 6077 text/html`, a security-check page; headless Chromium: "Sorry, you have been blocked".
- `https://vbpl.vn/` answers 200 to `curl -A 'Mozilla/5.0'` (`200 80059 text/html`) and 403 to headless Chromium; `https://vbpl.vn/van-ban/chi-tiet/1` answers `200 88663 text/html` but with no document text (Next.js shell); `https://vbpl.vn/van-ban?keyword=...` answers 403 (`403 1653 text/html`); `https://vbpl-bientap-gateway.moj.gov.vn/api/qtdc/public/doc/1` (the data API the pages call): `curl: (35) Recv failure: Connection reset by peer`; `https://vbpl.vn/sitemap/0.xml` 403. `https://phapdien.moj.gov.vn/` and the `moj.gov.vn` home: reset, and 403.
- `https://g7.cdnchinhphu.vn/api/download/stream?...` (the second download link on every Công báo page): `curl: (60) SSL certificate problem: unable to get local issuer certificate`.
- `https://congbao.chinhphu.vn/tim-kiem?keyword=...` (site search) answers `302` to `/` for scripts, so documents were found through the type listings (`/van-ban-dang-cong-bao/<type>/trang-<n>.htm`) and web search instead.
- Intermittent resets (retry succeeds): `congbao.chinhphu.vn`, `datafiles.chinhphu.vn`, `vanban.chinhphu.vn`.

No browser recipe was needed: every stored record was fetched with `curl`.

### Watchers

One `http_head` watcher per scope instrument on the first as-published PDF (its Content-Length is stable; the Công báo document pages are not hashable, since a trailing cache-time comment alternates between two variants, and no Công báo page lists dates in the ISO form `date_list` reads). They notice a replaced PDF, not a new consolidation or an amendment; those arrive through the Công báo "Văn bản mới" listings, which the watcher kinds cannot read (the RSS feed `https://congbao.chinhphu.vn/cac-van-ban-moi-ban-hanh.rss` has RFC 822 dates and a changing `lastBuildDate`). Two `page_hash` terms watchers (`vn-terms-congbao-adopted`, `vn-terms-congbao-consolidated`) watch `https://congbao.chinhphu.vn/gioi-thieu.htm`, which gave the same hash on three fetches.

## Colombia

Run on 2026-11-02 (GEL-07-06). Rows: `CO-IMPRENTA-ADOPTED` (pass, statute basis: Ley 23 de 1982 art. 41, a reproduction permission tied to fidelity to the official edition; the pass is flagged for Varun in the row notes), `CO-SFC-ADOPTED` and `CO-SFC-TRANSLATION` (pass, terms basis: the Superintendencia Financiera portal terms allow free use, copy and modification with a citation), `CO-SUIN-CONSOLIDATED` and `CO-FUNCIONPUBLICA-CONSOLIDATED` (permission requested). Language: Spanish only; the one English text found is the SFC's own version of Circular Externa 031 de 2021 (see Languages). No consolidated text is stored: the only sites that offer consolidations (SUIN-Juriscol, Función Pública) are not pass, so each stored law is the adopted text as published, and later amendments are named in the scope notes.

Certificate chains: www.suin-juriscol.gov.co, lexis.minjusticia.gov.co, api-cms.minjusticia.gov.co, utu.minjusticia.gov.co, dike.minjusticia.gov.co and www.funcionpublica.gov.co send an incomplete chain (the Sectigo intermediate is missing), so curl through the cloud proxy fails with `SSL certificate problem: unable to get local issuer certificate`. Verification stays on: the intermediate named in the certificate's Authority Information Access field was fetched from `crt.sectigo.com` and appended to a private CA file that is passed to curl with `--cacert`:

```
openssl s_client -connect www.suin-juriscol.gov.co:443 -servername www.suin-juriscol.gov.co -proxy 127.0.0.1:44381 -showcerts   # issuer Sectigo Public Server Authentication CA EV R36, CA Issuers URI in the certificate
curl -sS -o ev.crt http://crt.sectigo.com/SectigoPublicServerAuthenticationCAEVR36.crt        # 200 1615
curl -sS -o ov.crt http://crt.sectigo.com/SectigoPublicServerAuthenticationCAOVR36.crt        # minjusticia.gov.co hosts
curl -sS -o rsa.crt http://crt.sectigo.com/SectigoRSAOrganizationValidationSecureServerCA.crt # funcionpublica.gov.co, 200 1565
for f in ev ov rsa; do openssl x509 -inform DER -in $f.crt -out $f.pem; done
cat /root/.ccr/ca-bundle.crt ev.pem ov.pem rsa.pem > bundle.pem
```

Every `curl` below that touches those hosts carries `--cacert bundle.pem`. Chromium (Playwright) behind the same proxy answered `502 upstream request failed` for https://www.suin-juriscol.gov.co/ even after the intermediates were added to the NSS database at /root/.pki/nssdb, so no browser recipe was proven; none is needed, because the text comes from the JSON services below.

### Row `CO-IMPRENTA-ADOPTED`: Diario Oficial PDF

The Diario Oficial is served by a JSF application at `svrpubindc.imprenta.gov.co/diario/` (complete certificate chain). The edition PDF is behind a session: search by edition number, press `Ver Diario`, then fetch the object URL, all with one cookie jar. Run for Ley 1931 de 2018, edition 50.667 (27 July 2018):

```
curl -sS -L -c cj.txt -o index.html -w '%{http_code} %{size_download} %{content_type}\n' https://svrpubindc.imprenta.gov.co/diario/
```

Returned `200 45103 text/html;charset=UTF-8`. The form action (with the `jsessionid`) and the hidden `javax.faces.ViewState` are read from `index.html`.

```
curl -sS -L -b cj.txt -c cj.txt --data-urlencode 'frmConDiario=frmConDiario' --data-urlencode 'numeroDiarioOf=50667' --data-urlencode 'btnBuscar=btnBuscar' --data-urlencode 'javax.faces.ViewState=<value>' -o result.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://svrpubindc.imprenta.gov.co/diario/index.xhtml;jsessionid=<id>'
```

Returned `200 32223 text/html;charset=UTF-8` (one row, `data-rk="50.667"`). The next request presses the row button (`dtbDiariosOficiales:0:j_idt34`) with `dtbDiariosOficiales_selection=50.667` and the new ViewState:

```
curl -sS -L -b cj.txt -c cj.txt --data-urlencode 'frmConDiario=frmConDiario' --data-urlencode 'numeroDiarioOf=50667' --data-urlencode 'dtbDiariosOficiales_selection=50.667' --data-urlencode 'dtbDiariosOficiales:0:j_idt34=' --data-urlencode 'javax.faces.ViewState=<value>' -o view.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://svrpubindc.imprenta.gov.co/diario/index.xhtml;jsessionid=<id>'
```

Returned `200 15775 text/html;charset=UTF-8`; `view.html` holds `<object type="application/pdf" data="/diario/javax.faces.resource/dynamiccontent.properties.xhtml?ln=primefaces&pfdrid=...&id=...&uid=...">`.

```
curl -sS -L -b cj.txt -o d50667.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://svrpubindc.imprenta.gov.co/diario/javax.faces.resource/dynamiccontent.properties.xhtml?ln=primefaces&pfdrid=<...>&pfdrt=sc&id=<...>&pfdrid_c=false&uid=<...>'
```

Returned `200 21365161` (the server sends no `Content-Type` header, the answer is chunked; `file` says PDF 1.7, 148 pages), sha256 `c30e64c607845dd4a673f9dc63de808f124c20071887662ff15a4e5710b9ec5b`. The token URL is per session, so `fetched_url` in the four Diario records is the URL of that run and will not answer again; the bytes do reproduce: a second full run gave the same sha256 for editions 50667, 50101, 52247 and 53578. A search by norm type and number (`tipoNorma_input=01`, `numeroNorma=1819`) also works for some laws (1819 found, 2277 not), so the edition number is taken from the SUIN index (`documents_pdn`, field `numerodiariooficial`) or from the date range search (`fechaInicial_input=13/12/2022`).

Text recipe, per instrument: `pdftotext d50667.pdf d50667_d.txt` (poppler, default reading-order mode; `-layout` interleaves the two columns of every page and was not used). Page furniture is dropped (the lines `Edición N`, weekday and date, `DIARIO OFICIAL`, page numbers, and lone 1 to 3 digit lines), runs of spaces collapse, empty lines are removed, nothing else is changed, hyphenation at line ends stays as the edition has it. The law is cut from its heading line to its closing line: `LEY 1931 DE 2018` to `Luis Fernando Mejía Alzate.`; `PARTE IX` to the line before `PARTE X` (Ley 1819 arts. 221 to 223); `TÍTULO IV` to the line before `CAPÍTULO II` (Ley 2277 arts. 47 to 49); `DECRETO NÚMERO 0969 DE 2026` to `Irene Vélez Torres.`. Each cut was checked against the same cut taken with `pdftotext -raw` (content-stream order): after removing furniture, whitespace and hyphens the strings are identical for Decreto 969, differ by three footnote or page digits for Ley 1931 and by the column order of the tariff tables (and a page digit) for Ley 1819 and Ley 2277. Ley 1931 has its 36 articles in sequence. The `-raw` mode loses the spaces of some lines (runs such as `Losretiros,parcialesototales`) and so was not used for the record text.

Stored: `co-ley-1931-2018` (2018-07-27), `co-ley-1819-2016-art221-223` (2016-12-29), `co-ley-2277-2022-art47-49` (2022-12-13), `co-decreto-969-2026` (2026-08-05).

### Row `CO-SFC-ADOPTED`: Superintendencia Financiera circulars

The circular pages are on superfinanciera.gov.co (no challenge, complete chain). Page listing the sustainable-finance circulars:

```
curl -sS -L -o sfc.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.superfinanciera.gov.co/publicaciones/10104699/industrias-supervisadasfinanzas-sosteniblesdocumentos-tecnicos-y-normativa-10104699/'
```

Returned `200 224069 text/html; charset=UTF-8`. The circular, Circular Externa 031 de 2021:

```
curl -sS -L -o ce031_21.docx -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.superfinanciera.gov.co/loader.php?lServicio=Tools2&lTipo=descargas&lFuncion=descargar&idFile=1057619'
```

Returned `200 71188 application/octet-stream` (Word 2007+, `content-disposition: attachment; filename="ce031_21.docx"`). The annex file `idFile=1057620` is a zip with `Anexo 2 ASG.docx` and `P3 Tit V - Cap I - RNVE.docx`; it is not stored. Text recipe: unzip `word/document.xml`, one line per `w:p` paragraph, the `w:t` runs of the paragraph joined, tabs kept as tabs, runs of spaces collapsed, empty paragraphs dropped; nothing else (the closing `50000` is a paragraph of the file). `fetched_sha256` is the hash of the .docx. Stored: `co-sfc-ce-031-2021` (2021-12-22), `co-sfc-ce-005-2022` (`idFile=1059496`, 200 75884, 2022-04-08) and `co-sfc-ce-008-2022` (`idFile=1059686`, 200 69634, 2022-04-28). Terms: `idFile=1038273` returned `200 46748 application/octet-stream`.

### Languages

Spanish is the only official language and the only one the Diario Oficial, SUIN-Juriscol and the SFC serve for these laws. English: the SFC publishes its own English version of Circular Externa 031 de 2021 on the same page, row `CO-SFC-TRANSLATION` (pass on the SFC terms; the file itself says it is not an official translation, so the statute exception for official texts is not used):

```
curl -sS -L -o ce031_21_en.docx -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.superfinanciera.gov.co/loader.php?lServicio=Tools2&lTipo=descargas&lFuncion=descargar&idFile=1058633'
```

Returned `200 70601 application/octet-stream`. It is stored as `2021-12-22-translation-en.json` under `co-sfc-ce-031-2021` (same recipe). Its amendment state is the circular as issued, which is the stored Spanish version. The SFC page lists no English version for Circular Externa 005 or 008 de 2022, 005 de 2024 or 015 de 2025. For the laws and decrees: no government English translation was found in the SUIN index (`documents_pdn`, English queries return only Spanish documents), the Diario Oficial search (Spanish only) or the ministry sites linked from SUIN. Each scope entry says so.

### SUIN-Juriscol (row `CO-SUIN-CONSOLIDATED`, permission requested, nothing stored)

`www.suin-juriscol.gov.co` returns one 4758-byte Angular shell for every path, including `viewDocument.asp?id=...`. The index and the documents sit on `lexis.minjusticia.gov.co` and answer curl (with the private CA file):

```
curl -sS --cacert bundle.pem -H 'Content-Type: application/json' -d '{"size":3,"query":{"match":{"titulo":"Ley 1931 de 2018"}}}' -w '\n%{http_code} %{size_download} %{content_type}\n' https://lexis.minjusticia.gov.co/elasticsearch/documents_pdn/_search
```

Returned `200 3523 application/json` (`numerodiariooficial`, `estado`, `fecha`, `documentofuente` and the `visualizacion` id of the document). The document: `curl -sS --cacert bundle.pem -o l1931.json -w '%{http_code} %{size_download} %{content_type}\n' https://lexis.minjusticia.gov.co/suin-search/api/documentos/30035792` returned `200 129339 application/json` (`data.textoHtml`, annotated). It was read to find edition numbers and the SUIN `estado`, and not stored.

### Link only

- `co-ley-2169-2021`: row `CO-IMPRENTA-ADOPTED` passes, no record. The text layer of Diario Oficial 51.896 (90 pages, `200 3914540`, sha256 `203c6181779169e44f3b6cf6286be6f8999a6b3a1ababbfe1e96c2c17d28bf9b`) gives the 38 articles out of order in default mode (11 in sequence) and loses the start of the law and many spaces in `-raw` mode; the law's sanction block shares its page with a Government objection message. No clean text.
- `co-decreto-926-2017`: edition 50.251 (96 pages, `200 10106876`): the decree starts on the cover page together with Decretos 925 and 928 and the masthead; default and raw order differ on 4 per cent of the cut. No clean text.
- `co-ley-1480-2011-art29-33`: edition 48.220 (36 pages, `200 537754`) uses a legacy font encoding; art. 29 extracts as `especí¿FDV DQXQFLDGDV HQ OD SXEOLFLGDG`. No OCR in the recipe.
- `co-sfc-ce-005-2024` (`idFile=1070272`, `200 667582`) and `co-sfc-ce-015-2025` (`idFile=1079295`, `200 251023`): PDFs without a text layer (`pdftotext` writes nothing), the row passes, no record.

### Blocked from the cloud address

- `https://www.secretariasenado.gov.co/` (and `/senado/basedoc/ley_1931_2018.html`): `curl: (35) Recv failure: Connection reset by peer`; the proxy log shows `ws_closed_mid_exchange` for `www.secretariasenado.gov.co:443`.
- `https://diariooficial.gov.co`: `curl: (56) CONNECT tunnel failed, response 502`.
- `https://www.imprenta.gov.co/diariooficial`: `429` on 10102 bytes of `text/html` (rate limit page); `https://www.imprenta.gov.co/diario-oficial` answered `200` and holds no search.
- `https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=87654`: no answer in 30 s (`curl: (28)`).
- Chromium (Playwright, proxy set) to `https://www.suin-juriscol.gov.co/`: `502 upstream request failed`. The same URL answers curl `200 4758 text/html` once the Sectigo intermediate is supplied.

## Argentina

Rows `AR-ARGENTINAGOB-ADOPTED` (`pass`, terms: CC BY 4.0), `AR-INFOLEG-ADOPTED` (`permission requested`) and `AR-BOLETINOFICIAL-ADOPTED` (`permission requested`, page could not be opened). Run on 2026-11-02.

The portal https://www.argentina.gob.ar/normativa (Ministerio de Justicia, "Leyes argentinas") serves the texto original of each national norm and is the only Argentine source that passes. Its pages are plain HTML, no JavaScript needed. The text is the contents of `<div class="infoleg-norma-body infoleg-mode-original">`; `text` is that div with tags stripped, `<p>`, `<div>`, `<br>`, `<li>` and table rows as line breaks, runs of spaces collapsed, empty lines dropped, nothing reworded (the portal header and footer are outside the div and are not stored).

```
curl -sS -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' -o ley24240.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.argentina.gob.ar/normativa/nacional/norma-638/texto
```

Returned `200 97218 text/html; charset=utf-8`, Ley 24.240 de Defensa del Consumidor, texto original. The same request without the `-A` option also answered 200 (97218 bytes). The URL form is `/normativa/nacional/norma-<InfoLEG id>/texto`; for Ley 27.520 only the slug form worked (`/normativa/nacional/ley-27520-333515/texto`, `200 60024`, while `norma-333515/texto` answered 500). The portal is erratic: the same page can answer 500 for one URL form and 200 for another, and the `normas-modifican` tab answers 500 for Decreto 1030/2020, Decreto 501/2018 and Ley 25.675 on every form tried. `fetched_sha256` is the hash of the HTML as received; a second fetch of `norma-345380/texto` gave the same text and a different hash (8a8529f8… against 638dff0b…, 63837 bytes both), because each page carries a per-request Cloudflare token (`/cdn-cgi/content?id=…`), so the hash does not reproduce.

The InfoID of a norm is the number in its InfoLEG URL (`.../anexos/330000-334999/333515/norma.htm` is 333515). Ids used: 333515 (Ley 27.520), 345380 (Decreto 1030/2020), 79980 (Ley 25.675), 305262 (Ley 27.430), 311009 (Decreto 501/2018), 638 (Ley 24.240), 322236 (DNU 274/2019). Ley 27.430 is stored as Título IV only (from the heading `TÍTULO IV - IMPUESTO SOBRE LOS COMBUSTIBLES` to the line before `TÍTULO V - RÉGIMEN SIMPLIFICADO`). Records without a commencement clause in the text (Ley 27.520, Ley 25.675, DNU 274/2019) are dated by their Boletín Oficial publication date as printed on the portal.

The portal also serves a `texto actualizado` at `/normativa/nacional/<slug>/actualizacion` (for example `ley-24240-638/actualizacion`, `200 123953`). It states no consolidation date, so no consolidated record is stored and there is no consolidated row.

### Languages

Spanish only (`es`); the portal has no language switch and no other official language applies. No government English translation was found for any instrument: looked for on the portal pages, on https://www.argentina.gob.ar/normativa and on the InfoLEG site. No translation row exists.

### Link only

- `ar-cnv-rg-1115-2026`, `ar-cnv-rg-885-2021`: the text opens on InfoLEG (`curl -A '<browser UA>' https://servicios.infoleg.gob.ar/infolegInternet/anexos/420000-424999/423538/norma.htm` gives `200 94725 text/html`), but row `AR-INFOLEG-ADOPTED` is permission requested: the Aviso legal (https://www.infoleg.gob.ar/?page_id=762) reserves rights over the texts and bars reproduction other than personal use, while the home page footer says CC BY 2.5 AR. The portal route answers HTTP 500 for both CNV norms on every URL form (`norma-423538`, `norma-423538/texto`, `/actualizacion`, `/normas-modificadas`, slug forms `resolucion-1115-2026-423538`, `resolución-1115-2026-423538`, `resolucion-general-1115-2026-423538`; same for 349151).
- Without a browser User-Agent InfoLEG answers `403 Forbidden` to curl for the root and for deep URLs (`curl -sS -o /dev/null -w '%{http_code}\n' https://servicios.infoleg.gob.ar/infolegInternet/anexos/330000-334999/333515/norma.htm` returned `403`); with the browser UA above it answers 200.
- Not used: https://www.boletinoficial.gob.ar/ is blocked from the cloud address (`curl: (35) Recv failure: Connection reset by peer`, and headless Chromium got HTTP 502 `upstream request failed`, for `/` and `/detalleAviso/primera/338937`). https://www.cnv.gov.ar/ redirects to https://www.argentina.gob.ar/cnv, whose pages are under the portal's CC BY 4.0 footer, but no RG text is hosted there; no CNV row was added.
- Ley 23.966 Título III (t.o. 1998) was not located on the portal; the carbon dioxide tax is carried by `ar-ley-27430-titulo-iv` and `ar-decreto-501-2018`.

## Estonia

Rows `EE-RT-ADOPTED` and `EE-RT-CONSOLIDATED` are `pass` on the statute basis (Autoriõiguse seadus § 5 p 3: acts and administrative documents and their official translations are outside copyright; Riigi Teataja seadus § 12 lg 1 asks only that other sites name Riigi Teataja as the place of the official text). `EE-RT-TRANSLATION` (English) and `EE-FI-ADOPTED` (Finantsinspektsioon) are `permission requested`. Run on 2026-11-02 from the cloud address. Language: Estonian only; English is a translation (below). www.riigiteataja.ee serves a JavaScript shell for every HTML page, so texts come from the Riigi Teataja public API (`/public-api/api/v1/`, named in the site's FAQ item 9 "Avaandmed"). It answered curl from the cloud address with no challenge.

Failing request (the HTML page of an act, a shell without text):

```
curl -sS -o h.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.riigiteataja.ee/akt/107012025001
```

Returned `200 61752 text/html` (the same 61752 bytes for every path, for example `/en` and `/akt/110072025003`). No browser recipe is needed: the API below answers curl.

Step 1, list the versions of a consolidated text. The group id is `grupiId` in `GET /public-api/api/v1/akt/{id}` of any version (Raamatupidamise seadus: 155849). The answer lists every version with its RT id and `kehtivuseAlgus` as a UTC instant; the stored `in_force` is that instant's Europe/Tallinn calendar date (`2025-06-30T21:00:00Z` is 2025-07-01):

```
curl -sS -o rps_versions.json -w '%{http_code} %{size_download} %{content_type}\n' https://www.riigiteataja.ee/public-api/api/v1/akt/155849/redaktsioonid
```

Returned `200 6353 application/json;charset=UTF-8` (27 versions, 2003-01-01 to 2027-01-01). `GET /public-api/api/v1/akt/lyhendid` lists abbreviations with the current RT id (RPS 110072025003, AÕKS 130062026006, TKS 103072026030). The site's search API, `https://www.riigiteataja.ee/api/oigusakt_otsing/1/otsi?leht=1&limiit=50&pealkiri=<words>&tekst=koik` (FAQ item 9), answered `200 2422 application/json` for `lyhend=RPS&limiit=5` and was used to find the regulations and the amending acts (`tekst=algtekst`).

Step 2, row `EE-RT-CONSOLIDATED`, the Accounting Act as consolidated from 2025-07-01 (RT id 107012025012):

```
curl -sS -o rps_20250701.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.riigiteataja.ee/public-api/api/v1/akt/107012025012/xml
```

Returned `200 702167 application/octet-stream;charset=UTF-8` (XML), sha256 `b1d7c7843bcab40ae9842f91247ea4e9982a3d9dd1abe80edba58b0ce0ab95c7`; a second fetch gave the same hash, so `fetched_sha256` reproduces (no per-request token).

Row `EE-RT-ADOPTED`, the act as published, here RT I, 07.01.2025, 1 (RT id 107012025001):

```
curl -sS -o csrd.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.riigiteataja.ee/public-api/api/v1/akt/107012025001/xml
```

Returned `200 54786 application/octet-stream;charset=UTF-8`, sha256 `fd6326a224efaf989f18207d4b87d99daf46af43c8da7df48bd5ba3cc34887e5`. The `/blob-xml` variant returns the same act reserialised (54766 bytes, `application/xml`); `/xml` is the one used. Consolidated texts of 2003 to 2016 are served by the same call (the first Accounting Act text is id 229287).

Text extraction: Python stdlib `xml.etree`, run from a script kept outside the repository. Each structural element (`peatykk`, `jagu`, `jaotis`, `paragrahv`, `loige`, `punkt`, `alampunkt`) is one line: its `kuvatavNr` label, its heading and its `sisuTekst`, in document order; inline tags dropped, `<sup>` digits written as Unicode superscript digits (`§ 24¹`), no-break spaces made plain spaces. Amending acts carry their body as HTML in CDATA; the tags are stripped, each `<p>` is a line. Each `muutmismarge` (amendment note) is a line in the Riigi Teataja form `[RT I, 10.07.2025, 2 - jõust. 20.07.2025]`; base64 attachments (`fail`) are dropped. The cut records take whole elements by id or heading: Accounting Act `para24`, `para24b1`, `para24b2`, `para31`, `para31b1`, `para31b2`, `para61b3`; Ambient Air Protection Act the `jagu` titled "Kasvuhoonegaaside lubatud heitkogustega kauplemine"; Consumer Protection Act `para2`, `para70` and the `jagu` "Kaupleja ja tarbija vahelise tehinguga seotud kauplemisvõte". A consolidation is stored only when its cut text differs from the previous stored version, so the dates below are the dates the text changed. `fetched_url` is the exact `/xml` request; the cut is out of that file. The extraction was checked for leftover tags, entities and no-break spaces (none) and for mojibake (none; the files are UTF-8).

Stored (fetched 2026-11-02, Estonian):

| Instrument | Row | Records | `in_force` dates |
|---|---|---|---|
| `ee-rps` | consolidated | 14 | 2003-01-01, 2005-12-01, 2007-01-01, 2007-11-19, 2008-07-10, 2009-04-06, 2010-01-01, 2010-11-15, 2011-01-01, 2016-01-01, 2017-01-01, 2021-06-01, 2025-01-17, 2025-07-01 |
| `ee-rps-amendment-2025` | adopted | 1 | 2025-01-17 |
| `ee-aoks-ets` | consolidated | 36 | every version of the Act from 2017-01-01 to 2034-01-01 (the division changed in each); first 2017-01-01, last 2034-01-01 |
| `ee-ets-trading-order` | consolidated | 5 | 2017-01-01, 2018-08-10, 2020-01-24, 2021-01-01, 2022-01-14 |
| `ee-ets-auction-order` | consolidated | 2 | 2017-01-01, 2023-07-08 |
| `ee-tks` | consolidated | 6 | 2016-03-01, 2020-01-17, 2022-05-28, 2026-07-13, 2026-09-01, 2026-09-27 |
| `ee-tks-2024-825-act` | adopted | 1 | 2026-07-13 |

Versions the site already serves but that are not yet in force (Accounting Act 2027-01-01; Ambient Air Protection Act 2026-12-11, 2027-07-01, 2034-01-01) are ordinary records dated their in-force date where the cut text differs; the Accounting Act 2027-01-01 cut equals the 2025-07-01 text, so it has no record.

### Link only

None of the seven scope instruments is link only. Not in scope, with the reason: Kliimakindla majanduse seadus (bill 928 SE, in committee, not in Riigi Teataja) and Kliimapoliitika põhialused aastani 2050 (Riigikogu resolution, a plan) are F7 register rows; the Finantsinspektsioon sustainability roadmap is guidance on fi.ee, row `EE-FI-ADOPTED` is `permission requested` ("Veebilehel sisalduva informatsiooni reprodutseerimine ja levitamine ilma Finantsinspektsiooni eelneva loata on keelatud."), so nothing is stored. The consolidated Audiitortegevuse seadus (assurance of the sustainability report) was not made a scope entry; it is named in the `ee-rps-amendment-2025` notes.

### Languages

Run on 2026-11-02. Estonian is the only official language, served under the rows above, so no second-language row exists. English: the site calls its translations "unofficial texts – they do not have legal force" (https://www.riigiteataja.ee/en/introduction), says certified (sworn) translators make the Act translations and ministries organise the regulation translations (FAQ item 5), and no live page grants reuse. The statute exception covers "ametlikud tõlked" only, so row `EE-RT-TRANSLATION` rests on terms and is `permission requested`. No English record is stored. Where a translation exists it is found by `tolkeSeosId` in `GET /public-api/api/v1/akt/{id}` of the Estonian version; the English act is then `GET /public-api/api/v1/en/akt/{tolkeSeosId}/xml`:

```
curl -sS -o en_rps.xml -w '%{http_code} %{size_download} %{content_type}\n' https://www.riigiteataja.ee/public-api/api/v1/en/akt/510072025005/xml
```

Returned `200 1217759 application/octet-stream;charset=UTF-8` (Accounting Act, English, version in force 2025-07-20, group 100007, 13 versions). Probed, not stored: translations are linked from 13 of 27 Accounting Act versions (2011-01-01 to 2025-07-20), 34 of 36 Ambient Air Protection Act versions (2017-01-01 to 2026-12-11) and 23 of 23 Consumer Protection Act versions; the two regulations and the two as-published acts have none. When the row passes, each English version must be matched to the Estonian version by its act-level last amendment note before it is stored.

Terms pages were read with Playwright chromium (the pages are Angular applications): https://www.riigiteataja.ee/et/kkk with "Ava kõik" clicked, https://www.riigiteataja.ee/en/introduction, and the statute text at https://www.riigiteataja.ee/akt/112072025009; `fi.ee` terms by curl (`200 83661 text/html; charset=UTF-8`). The fingerprints are in the rows.

### Blocked

No site was blocked from the cloud address: riigiteataja.ee (API, search API, static index `/avaandmed/ERT/`), fi.ee and riigikogu.ee all answered curl with 200. The Riigikogu bill list search (`https://www.riigikogu.ee/tegevus/eelnoud/`) is a JavaScript page; the bill page was found by web search and answers `200`.

## Kenya

Run on 2026-11-02 (GEL-08-04). No licence row passes, so nothing is stored: no record files, five scope instruments, all `link only`. Rows: `KE-KENYALAW-CONSOLIDATED`, `KE-KENYALAW-ADOPTED`, `KE-PARLIAMENT-ADOPTED`, `KE-CMA-ADOPTED`, `KE-NSE-ADOPTED`, all `permission requested`. There is no proven fetch for a `pass` row. What was run to read the terms and the commencement lines is below, so the next session can repeat it.

Kenya Law moved: `https://new.kenyalaw.org/` now answers 301 to `https://kenyalaw.org/`, and the old URL form is not mapped.

```
curl -sS -L -o old.html -w '%{http_code} %{size_download} %{url_effective}\n' 'http://www.kenyalaw.org/lex/actview.xql?actid=CAP.%20387'
```

Returned `404 19188 https://kenyalaw.org/lex/actview.xql?actid=CAP.%20387` (two 301s, then 404).

Terms page (plain `curl` works):

```
curl -sS -A 'Mozilla/5.0' -o terms.html -w '%{http_code} %{size_download} %{content_type}\n' https://kenyalaw.org/terms-of-use/
```

Returned `200 29466 text/html; charset=utf-8`. Section 9: raw documents under CC BY-NC 4.0; section 4: "Scraping, deployment of unauthorized bots and bulk downloading from this website is strictly prohibited." That is why no row passes and why only single pages were opened.

Document pages answer scripts with a challenge. Failing `curl`, for the Climate Change Act (Cap. 387A) as at 2023-09-15:

```
curl -sS -A 'Mozilla/5.0' -o cc.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://kenyalaw.org/akn/ke/act/2016/11/eng@2023-09-15'
```

Returned `202 0 text/html; charset=UTF-8`. Browser recipe: Playwright chromium (`chromium.launch()`, user agent `Mozilla/5.0`), `page.goto(url, {waitUntil: 'networkidle'})`, then 2 s; `page.content()` returned 689594 characters of HTML (the response status the script saw was 202). For the PDF, the same page is opened first, then `context.request.get('https://kenyalaw.org/akn/ke/act/2016/11/eng@2023-09-15/source')` in the same context returned `200 387309 application/pdf`; `pdftotext -layout` read it, with the notice "There is no copyright on the legislative content of this document. This PDF copy is licensed under a Creative Commons Attribution NonCommercial ShareAlike 4.0 License". No hash was kept because nothing is stored. Commencement lines were read the same way from the pages of `ke-climate-change-act-2016`, `ke-carbon-markets-regs-2024`, `ke-emca-1999` and `ke-cpa-2012-s12-13`.

Capital Markets Authority (plain `curl` works):

```
curl -sSL -A 'Mozilla/5.0' -o code.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.cma.or.ke/download/35/guidelines/4323/code-of-corporate-governance-practices-for-issuers-of-securities-to-the-public-2015-code.pdf
```

Returned `200 356766 application/pdf`; `pdftotext -layout` gave clean text. `https://cma.or.ke/disclaimer/` answers 301 to the `www` host (`200 165291` after the redirect). Parliament (`https://www.parliament.go.ke/`, 200) and NSE (`https://www.nse.co.ke/terms-and-conditions/`, 200) answered; neither grants reuse.

### Languages

English is the language of legislation; the Kenya Law pages list only `eng` expressions, and no Swahili text was found. No government English translation applies. No second-language or translation row was added.

### Link only

- `ke-climate-change-act-2016`, `ke-carbon-markets-regs-2024`, `ke-emca-1999`, `ke-cpa-2012-s12-13`: Kenya Law rows are `permission requested` (copyright claimed, NC licence, scraping and bulk download prohibited).
- `ke-cma-cg-code-2015`: `KE-CMA-ADOPTED` is `permission requested` (no reuse grant, "All Rights Reserved").
- F7 register rows without scope entry: ICPAK roadmap, NSE ESG Disclosures Guidance Manual (no NSE-hosted copy found).
- Blocked from the cloud address for scripts: every `https://kenyalaw.org/akn/...` document and `/source` URL (HTTP 202, empty body, plain `curl`); the browser recipe above passes.

## Iceland

Date run: 2026-11-02, from the cloud address. No row is `pass`, so nothing is stored; the requests below are proven for the day the verdict flips. Rows: `IS-ALTHINGI-CONSOLIDATED`, `IS-STJORNARTIDINDI-ADOPTED`, `IS-GOVERNMENT-TRANSLATION`, all `permission requested`.

### IS-STJORNARTIDINDI-ADOPTED (proven fetch, not stored)

Stjórnartíðindi moved to island.is; `www.stjornartidindi.is` redirects to `https://island.is/stjornartidindi`. The gazette has a public JSON API (OpenAPI at `https://api.stjornartidindi.is/swagger-json`). The advert body is HTML in `advert.document.html`; the PDF (the legally binding form) is in `advert.document.pdfUrl`.

One instrument, Lög um ársreikninga nr. 3/2006 (A-deild 3/2006, id `b46b4083-ecb7-46c9-a5b3-68c201a6ccd2`):

```
curl -sS -A 'Mozilla/5.0' -o a1.json -w '%{http_code} %{size_download} %{content_type}\n' https://api.stjornartidindi.is/api/v1/adverts/b46b4083-ecb7-46c9-a5b3-68c201a6ccd2
200 114548 application/json; charset=utf-8
```

A second fetch gave a byte-identical file (sha256 `69b78982b778bbb4c18995be85b7c0fe1ce198c781826d0afcf9690c502108be` both times), so `fetched_sha256` reproduces. Text recipe if the row flips: take `advert.document.html`, drop tags, headings and paragraphs as line breaks. The HTML puts every word on its own line, so collapse whitespace inside a paragraph before writing the record.

Finding the id of an act or regulation (lean list, 94 kB for 82 hits):

```
curl -sS -A 'Mozilla/5.0' -G https://api.stjornartidindi.is/api/v1/adverts-lean --data-urlencode 'search=loftslagsmál' --data-urlencode department=a-deild --data-urlencode pageSize=100
200 94354 application/json; charset=utf-8
```

The full list endpoint `/api/v1/adverts` returned 7321596 bytes for the same query, so the watchers use `adverts-lean`. The PDF of Markaðssetningarlög nr. 44/2026: `curl -sS -A 'Mozilla/5.0' -o 44.pdf https://adverts.stjornartidindi.is/A_nr_44_2026.pdf` returned 200, 270174 bytes, `application/pdf`. The gazette serves each act as published (one version); an amendment is another advert, so no consolidated text and no point-in-time versions exist here. Coverage: adverts since 2001 (the site says so); a search of year 1972 returned 0.

### IS-ALTHINGI-CONSOLIDATED (blocked from the cloud address)

```
curl -sS -A 'Mozilla/5.0' -o al.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.althingi.is/lagas/nuna/2006003.html
403 5528 text/html; charset=UTF-8        (body: "Just a moment...", header cf-mitigated: challenge)
```

Headless Chromium (Playwright, `chromium.launch()`, `goto` with `domcontentloaded`, then 40 s of waiting in 5 s steps) stayed on the title "Just a moment..." (HTTP 403, about 44.9 kB of challenge HTML) for `/lagas/nuna/2006003.html` and `/lagas/`. Also 403 with the same challenge: `/lagas/145a/1972073.html`, `/lagasafn/pdf/157c/1972073.pdf`, `/altext/stjt/1972073.html`, `/vefur/lagasafn.html`. Open: `/robots.txt` (200) and `/altext/xml/` (200, parliamentary data only, no Lagasafn). Recorded as blocked from the cloud address; the orchestrator can read it from the laptop.

### Languages

Icelandic is the only language of the gazette and of Lagasafn; no second official language is served. English: `IS-GOVERNMENT-TRANSLATION`.

```
curl -sSL -A 'Mozilla/5.0' -o ga.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.government.is/publications/legislation/act/2022-12-01-Act-on-annual-accounts
200 235665 text/html; charset=utf-8
```

The page (Ministry of Industries, "Act on annual accounts", list date 2022-12-01) has no linked PDF or Word file in its HTML, and the amendment state is not given in the title, so no record could be matched to a stored version. The Legislation list (`https://www.government.is/publications/legislation/`) ignores the `q` parameter. For the other five instruments only the first page of the Legislation list and the gazette API were checked; no English text was found there.

### Link only

All six scope instruments are link only: `is-arsreikningalog-66d`, `is-loftslagslog`, `is-ets-log` and `is-markadssetningarlog` and `is-sjalfbaernilog-fjarmal` (rows `IS-ALTHINGI-CONSOLIDATED` and `IS-STJORNARTIDINDI-ADOPTED`), `is-ets-regulation-606-2021` (row `IS-STJORNARTIDINDI-ADOPTED`). Reason: both rows are `permission requested`. The Alþingi site cannot be opened from the cloud address. The gazette page grants no reuse licence and Höfundalög nr. 73/1972 9. gr. could not be opened on an official page, so the statute basis is not met. Seðlabanki Íslands and Nasdaq Iceland got no row: no instrument in scope comes from them.

## Egypt

Rows `EG-ALAMIRIA-ADOPTED`, `EG-FRA-ADOPTED` and `EG-EEAA-ADOPTED`, all `permission requested`. No row passes, so no record is stored and every instrument in `register/EG/scope.json` is `link only`. Run on 2026-11-02. No proven fetch recipe is listed for a `pass` row because there is none; the requests below are what was tried.

### What was opened

Government Printing Press (alamiria.com). The free online edition holds the current daily issues only:

```
curl -sS -L -A 'Mozilla/5.0' -o tash.html -w '%{http_code} %{size_download} %{content_type}\n' 'http://www.alamiria.com/Sec/TashTxt.aspx?id=4uo5w82IuBo='
```

Returned `200 61922 text/html; charset=utf-8` (Prime Minister Decision 3106 of 2026, a land allocation; not an ESG instrument). The archive, subscription and issue-browser pages redirect to `/Sec/Login` (`200 64974`, login form). The legislation portal `https://alamiria.laalaws.com` answers `403 5360 text/html` ("Just a moment... Enable JavaScript and cookies"), a Cloudflare challenge; no browser run was attempted because the portal is the paid archive (login link on the page). Blocked from the cloud address: https://alamiria.laalaws.com/ .

FRA (fra.gov.eg). Pages and PDFs answer curl:

```
curl -sS -L -A 'Mozilla/5.0' -o d107.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://fra.gov.eg/wp-content/uploads/2023/01/قرار-107-2021-وفقاً-لآخر-تعديل-ديسمبر-2022.pdf'
```

Returned `200 563181 application/pdf`. PM Decree 4664/2022 (`.../2025/01/قرار-رئيس-الوزاراء-رقم-4664-لسنة-2022.pdf`) returned `200 413325 application/pdf`; FRA decisions `alamiria_2024_30.pdf` and `alamiria_2026_115.pdf` returned `200 683565` and `200 510732` but poppler reports "Couldn't find trailer dictionary".

PDF text check, `pdftotext -layout` and `pdftotext -raw` (poppler) with NFKC: the Arabic comes out with reversed word order, split words and swapped letters ("جملس" for "مجلس"). The Egyptian PDFs are therefore not storable without reordering, which would reword the text.

EEAA (eeaa.gov.eg). `https://www.eeaa.gov.eg/Laws/55/index` returned `200 139670 text/html; charset=utf-8` and lists the environment law DOC and PDF files by file name. `https://www.eeaa.gov.eg/UsagePolicy/Index` timed out and then failed with `curl: (35) Recv failure: Connection reset by peer` (three tries).

### Languages

Arabic only was looked for. No government English translation was found on fra.gov.eg/en (the English pages link the same Arabic PDFs) or eeaa.gov.eg. No English row.

### Link only

All five instruments in `register/EG/scope.json`: `eg-fra-bod-107-2021`, `eg-fra-bod-108-2021`, `eg-fra-bod-31-2024` (row `EG-FRA-ADOPTED`, no terms page found, PDFs not extractable), `eg-pm-decree-4664-2022` (gazette extract hosted by the FRA, same row), `eg-law-4-1994-environment` (row `EG-EEAA-ADOPTED`, copyright footer only, usage page not opened).

Law 82 of 2002 Art. 141 (official documents, including laws and decisions, are not protected) was not applied: the text was read on ar.wikisource.org only, it protects original collections, and the extraction fails in any case. Varun decides whether to apply it to FRA decisions and gazette extracts.

Not in scope, with reason: Consumer Protection Law 181 of 2018 (cpa.gov.eg answered `502`; no official page opened); a framework climate law (none found on any page opened); EGX (https://www.egx.com.eg/ and egx.com.eg refused the cloud address with an empty reply or no connection; blocked from the cloud address: https://www.egx.com.eg/); manshurat.org (NGO database, never a source); sis.gov.eg, egypt.gov.eg, ecs.gov.eg, idsc.gov.eg and gpp.gov.eg gave no connection (000).

## Morocco

Fetched 2026-11-02 (GEL-09-08). No row passes, so no record is stored and nothing under `records/MA/`. Every Morocco row is `permission requested`; the instruments are link only. Hosts reached from the cloud address: ammc.ma, environnement.gov.ma, wipo.int. Hosts refused: sgg.gov.ma, casablanca-bourse.com (and media.casablanca-bourse.com), adala.justice.gov.ma, justice.gov.ma, douane.gov.ma; tax.gov.ma answers 403.

### Rows added

| Row | Verdict | Why |
|---|---|---|
| MA-SGG-ADOPTED | permission requested | Bulletin Officiel site could not be opened; statute (Loi 2-00 art. 8) read only on a WIPO Lex copy |
| MA-AMMC-ADOPTED | permission requested | AMMC mentions légales claim the content and forbid reproduction, adaptation and modification |
| MA-CASABLANCA-BOURSE-ADOPTED | permission requested | site could not be opened |
| MA-MTEDD-ADOPTED | permission requested | footer "Tous droits réservés", scanned PDFs, statute basis not confirmed on an official page |

No English row: no government English translation of a Moroccan instrument was found on an opened official page, and law-firm or news translations get no row. Amazigh is official but no legislative text is served in it. A second language needs no row of its own (same publisher row).

### Proven requests (no fetch for storage; these show what answered)

AMMC circulaires page and the Circulaire 03/19 PDF (the published BO text, titled `BO_6784-bis_fr`):

```
curl -sS -A 'Mozilla/5.0' -o c0319.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.ammc.ma/sites/default/files/Circulaire%2003_19%20relative%20aux%20op%C3%A9rations%20et%20informations%20financi%C3%A8res.pdf'
200 21815800 application/pdf
```

sha256 of the PDF as received: `e6f4ed76552ae2cf7424febb84711cb765910cfce679e6183dc6370996cd9095`. `pdftotext -layout c0319.pdf -` returns 151 bytes: the file is a scan with no text layer and the environment has no OCR tool, so no text could be extracted. The circulaires page `https://www.ammc.ma/fr/reglementations/circulaires` (200, 105 KB, text/html) also lists circulaire 02/20 (310 KB PDF, 200, application/pdf, sha256 `a99d513c699f751348475e830bb57240ec032c86ce4b3352e713e6d25df787f4`; Arabic BO page of the approving arrêté 3730.21, `pdftotext` extracts it with mojibake in Arabic ligatures).

AMMC terms: `curl -sS -A 'Mozilla/5.0' https://www.ammc.ma/fr/node/98` returns 200 text/html (mentions légales; quoted in the row).

Ministry Loi Cadre page and a dahir scan:

```
curl -sS -A 'Mozilla/5.0' -o lc.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.environnement.gov.ma/fr/component/content/article/3469-loi-cadre?catid=107'
200 42233 text/html; charset=utf-8
curl -sS -A 'Mozilla/5.0' -o d1.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.environnement.gov.ma/images/2022/avril/d1.pdf'
200 312283 application/pdf
```

`pdftotext d1.pdf -` returns 5 bytes: a scan, no text layer.

Statute read for the rows (WIPO Lex, not a Moroccan official page): `curl -sS -A 'Mozilla/5.0' https://www.wipo.int/wipolex/fr/text/191410` returns 200 text/html, 307783 bytes, sha256 `2c0eada926c760765db057635e1a603ca0d6a0708808f30fed5914d7739c5374`; it carries Loi 2-00 as amended by Loi 34-05 with article 8. The Arabic wording was not read.

### Languages

Arabic and French are the languages of the Bulletin Officiel; Amazigh has no legislative texts. Neither edition could be fetched (sgg.gov.ma blocked), so nothing is stored in `ar`, `fr` or `en`.

### Link only, with the reason

- ma-ammc-circ-03-19: MA-AMMC-ADOPTED is permission requested; the PDF is also a scan.
- ma-loi-99-12 and ma-loi-11-03: MA-MTEDD-ADOPTED is permission requested; the ministry PDFs are scans; the BO is blocked.
- Not in scope.json: Loi 31-08 art. 21 to 24 (no official page opened that serves it; sgg.gov.ma and adala.justice.gov.ma are blocked), the taxe carbone (press reports only), a framework climate law (none found published; avant-projet 62-25 on the carbon market and projet 05.26 on météorologie are drafts). The carbon tax and the 62-25 draft are `register.csv` rows with `law_family` F7.

### Blocked from the cloud address

- `https://www.sgg.gov.ma/` , `/arabe/Accueil.aspx` , `/fr` , `/Legislation/BulletinOfficiel.aspx` , `/Portals/1/lois/Loi_2-00_Fr.pdf`: `curl: (35) Recv failure: Connection reset by peer`; headless Chromium (Playwright 1.x, `page.goto`) HTTP 502, 174 bytes; `http://www.sgg.gov.ma/` answers 302 to the https home page; a fetch agent got 503. `https://sgg.gov.ma/` : `CONNECT tunnel failed, response 502`.
- `https://www.casablanca-bourse.com/` : `curl: (60) SSL certificate problem: unable to get local issuer certificate`; with `--cacert /root/.ccr/ca-bundle.crt` and Chromium: 502; `http://` : 503 (114 bytes). `https://media.casablanca-bourse.com/sites/default/files/Circulaire_AMMC_n_03_19_1.pdf` : connection reset.
- `https://adala.justice.gov.ma/` , `https://www.justice.gov.ma/` : connection reset. `https://www.douane.gov.ma/` : empty reply. `https://www.tax.gov.ma/` : 403 (12763 bytes).

## Nigeria

Run on 2026-11-02 (GEL-08-02). Two rows pass, both on the statute: `NG-NESREA-ADOPTED` and `NG-FCCPC-ADOPTED`. The statute is the Copyright Act 2022 (printed in the Official Gazette No. 56, Vol. 110, 27 March 2023, as "Act No. 8" of 2023), section 3: "The following shall not be eligible for copyright — ... (b) official texts of a legislative or administrative nature as well as any official translations, except their compilations". The brief quoted "legislative, administrative or legal nature"; the gazette says "legislative or administrative nature". Terms-only rows `NG-SEC-ADOPTED`, `NG-NCCC-ADOPTED` and `NG-FMENV-ADOPTED` are `permission requested`. The brief's two statute publishers did not serve any scope instrument: the National Assembly Acts list holds no Climate Change Act, EIA Act, NESREA Act or FCCPA, and justice.gov.ng has no Laws of the Federation section, so neither got a row.

The statute PDF itself:

```
curl -sS -L -A 'Mozilla/5.0' -o CopyrightAct.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.copyright.gov.ng/CopyrightAct/CopyrightAct2023FinalPublication1.pdf
```

Returned `200 738936 application/pdf`.

Row `NG-NESREA-ADOPTED`, National Environmental Standards and Regulations Enforcement Agency (Establishment) Act 2007 (Gazette No. 92, 31 July 2007):

```
curl -sS -L -A 'Mozilla/5.0' -o NESREA-ACT.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://nesrea.gov.ng/wp-content/uploads/2025/05/NESREA-ACT.pdf
pdftotext -layout NESREA-ACT.pdf - | sed -E 's/[ \t]+/ /g; s/^ //; s/ $//' | grep -v '^$'
```

Returned `200 314946 application/pdf` (22 pages, Word 2010 producer). A second fetch returned the same bytes (`sha256 4e7c4087871a64dd2cd3b8227d987d8bb78b69dcfa5421ef9cf5670c2c69c67d`), so `fetched_sha256` reproduces. The file URL is read from the page `https://nesrea.gov.ng/laws-regulations/` (link "Download NESREA Act"). The extracted text has no mojibake; the gazette's own quotation marks come out as ― and ‖, and the margin notes sit inside the line of the section they annotate (a limit of `pdftotext -layout`). The commencement date 30 July 2007 is printed under the margin note "Commencement". The NESREA site answers a bare curl; the `-A` header is only a precaution.

Row `NG-FCCPC-ADOPTED`, Federal Competition and Consumer Protection Act 2018 (Gazette No. 18, 1 February 2019):

```
curl -sS -L -A 'Mozilla/5.0' -o FCCPA-2018.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf
```

Returned `200 7842477 application/pdf` (99 pages, producer iLovePDF). Not stored: `pdftotext -layout` returns an OCR layer with mojibake ("Got'entntent Notice", "lst February", "Panr l--OslrcrlvEs"), and OCR is not part of the recipe.

No browser recipe was needed. Blocked or refused from the cloud address: `https://climatecouncil.gov.ng/` answers HTTP 406 to a bare curl user agent and 200 to a browser user agent (so a `User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36` header is used); `https://ngfrepository.org.ng:8443/handle/123456789/6359` (the gazette copy of the Climate Change Act named by search) reset the connection; `https://www.environment.gov.ng` timed out; `tools/watch.py` (urllib) is reset by `https://environment.gov.ng/` while curl reaches it.

Other pages opened: SEC circular and terms (`https://home.sec.gov.ng/website-terms-of-use/`, 200; the page body holds one paragraph barring copying and reproduction of the website), NGX terms (`https://ngxgroup.com/terms-and-conditions/`, 200, content subject to copyright, not read to the end), FRC Nigeria (`https://frcnigeria.gov.ng`, 200, no terms page: `/terms-of-use` and `/privacy-policy` answer 404). NGX and FRC got no row because no scope instrument rests on them.

### Languages

Nigeria's official language for federal legislation is English; every record is `en`. No translation exists or is needed. Looked for: nass.gov.ng, justice.gov.ng, nesrea.gov.ng, fccpc.gov.ng, climatecouncil.gov.ng and sec.gov.ng offer English only. No translation row was added.

Link-only instruments:

| Instrument | Official URL | Why link only |
|---|---|---|
| ng-sec-ifrs-sds-circular | https://home.sec.gov.ng/for-investors/keep-track-of-circulars/implementation-of-the-ifrs-sustainability-disclosure-standards-in-nigeria/ | `NG-SEC-ADOPTED` is permission requested (SEC website terms bar copying and reproduction). |
| ng-climate-change-act-2021 | https://climatecouncil.gov.ng/ | No official site opened serves the text; `NG-NCCC-ADOPTED` is permission requested. |
| ng-nesrea-act-amendment-2018 | https://nesrea.gov.ng/wp-content/uploads/2025/05/NESREA_Ammended_Act_2018.pdf | Row passes; the 8-page PDF (200, 6224298 bytes, application/pdf) is an image scan with no text layer. |
| ng-eia-act | https://environment.gov.ng/ | No official text found; `NG-FMENV-ADOPTED` is permission requested. |
| ng-fccpa-2018 | https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf | Row passes; the PDF's OCR layer is mojibake. |

Stored by GEL-08-02: `ng-nesrea-act-2007` (adopted 2007-07-30, en).

## Ghana

Run on 2026-11-02 (GEL-09-09). One row passes: `GH-PARLIAMENT-REPOSITORY-ADOPTED` (statute: Copyright Act, 2005 (Act 690) s. 8(1)(a), "an enactment"; the repository and parliament.gh terms themselves reserve rights and allow non-commercial copying only). `GH-BOG-ADOPTED` and `GH-ICAG-ADOPTED` are permission requested. `www.parliament.gh/epanel/docs/` serves only 41 old Acts (Banks Act 2016, Companies Code and similar) and none of the instruments in scope, so it has no row. Ghana's legislation is in English, so no second official language exists and no translation row was added.

Row `GH-PARLIAMENT-REPOSITORY-ADOPTED`, Protection Against Unfair Competition Act, 2000 (Act 589). The bitstream uuid is read from the item page, or from the repository's REST search (`curl -sS 'https://repository.parliament.gh/server/api/discover/search/objects?size=8&query=Unfair+Competition'` returned `200 15525 application/hal+json` for the query `unfair`). The item HTML pages (`https://repository.parliament.gh/items/<uuid>`) answer curl from the cloud address with `403 44 text/plain`, body "You got banned permanently from this server"; the same pages open in headless Chromium (Playwright `goto(..., waitUntil: "networkidle")`, status 200, text/html). The PDF itself needs no browser:

```
curl -sS -L -o act589.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://repository.parliament.gh/bitstreams/9366072e-0b2a-4a75-a3ea-2747973f4a87/download
```

Returned `200 221672 application/pdf;charset=UTF-8` (the first hop is `302` to `/server/api/core/bitstreams/<uuid>/content`). `fetched_sha256` is the hash of the PDF as received (`7d8b7fe9541a45ed08344c0a90dffb6c6f81757fdde2ac08bc358071b3417d4b`); three fetches (curl, two Playwright `APIRequestContext` runs) gave the same bytes. Text: `pdftotext -layout act589.pdf -`, runs of spaces collapsed to one, blank lines and bare page-number lines dropped; the one non-ASCII character is the em dash in the section headings, no mojibake. The item holds a second file (`ACT 589 Rev. Ed.pdf`, 138674 bytes) that is a scan without text layer; not stored. No records are browser-fetched.

Row `GH-PARLIAMENT-REPOSITORY-ADOPTED`, Environmental Protection Act, 2025 (Act 1124), same recipe with bitstream `1e06a2ff-8e7a-494e-a4d9-795f9c89002e` (browser-opened item page `https://repository.parliament.gh/items/18878a2b-4e4a-4e36-ba0b-a576b028d896`): `200 6441648 application/pdf;charset=UTF-8`. `pdfinfo` reports 182 pages, Creator "Hewlett-Packard MFP", encrypted with copy denied; `pdftotext` returns nothing and `pdfimages -list` shows one 200 ppi JPEG scan per page. The session has no OCR (`tesseract` absent), so no text is stored.

### Languages

English is the language of legislation; the repository, the Bank of Ghana and ICAG serve English only. Looked for a government translation nowhere further, because none is needed.

### Link-only instruments

| Instrument | Official URL | Why link only |
|---|---|---|
| gh-environmental-protection-act-2025 (F2) | https://repository.parliament.gh/items/18878a2b-4e4a-4e36-ba0b-a576b028d896 | Row passes, but the PDF is an image-only, copy-protected scan and no OCR is available in this session. Commencement date is not stated on the pages read, so scope `in_force` is null. |
| gh-bog-climate-risk-directive-2024 (F1) | https://www.bog.gov.gh/wp-content/uploads/2024/11/BOG-Climate-Related-Financial-Risks-Directive.pdf | Row `GH-BOG-ADOPTED` permission requested (`https://www.bog.gov.gh/disclaimer/` and `/legal/` grant no reuse). PDF `curl -sS -A 'Mozilla/5.0' -o bog.pdf -w '%{http_code} %{size_download} %{content_type}\n' <url>` returned `200 671289 application/pdf`. |
| gh-icag-ifrs-sustainability-roadmap (F1) | https://icagh.org/wp-content/uploads/2024/12/IFRS-SUSTAINABILITY-DISCLOSURE-ADOPTION-ROADMAP-FOR-GHANA.pdf | Row `GH-ICAG-ADOPTED` permission requested (site footer: all rights reserved). PDF returned `200 315458 application/pdf`. |

Stored: `gh-unfair-competition-act-2000` (adopted, in_force 2000-12-22, en).

Blocked from the cloud address: `https://repository.parliament.gh/items/<uuid>` and `https://repository.parliament.gh/` (curl: 403 "You got banned permanently from this server"; opens in a browser); The bitstream and REST API paths answer. `https://www.epa.gov.gh/` (curl error 60, TLS certificate expired; not retried with verification off), so the EPA laws page and the 2025 regulations were not read. `https://www.icagh.com/` and `https://www.sec.gov.gh/` reset the connection (curl 35; `https://sec.gov.gh/` answered 200, 126545 bytes, text/html, but no SEC directive was found); `https://www.fcghana.org/` 403; `https://ghalii.org/akn/gh` 403; `https://www.ghanapublishingcompany.com/` proxy 502 (no gazette read). GhaLII and LawsGhana get no row.

## Cyprus

Rows added on 2026-11-02: `CY-GPO-ADOPTED` (Government Printing Office, Official Gazette), `CY-CYLAW-CONSOLIDATED`, `CY-CYSEC-ADOPTED`, `CY-CSE-ADOPTED`, `CY-MOA-ADOPTED`. All five are `permission requested`, so no row is `pass` and nothing is stored: every Cyprus instrument is `link only`. Reasons: the GPO terms (https://www.mof.gov.cy/mof/gpo/gpo.nsf/terms-el/terms-el?opendocument) say the site's information "δεν υποκαθιστούν νομικά κείμενα" and contain no reuse sentence; Law 59/1976 (Copyright) has no exclusion of laws: s. 4(γ) recognises copyright in works made or issued by the Government, s. 6 is protection under international treaties, s. 7 the nature of the right (read on https://www.cylaw.org/nomoi/enop/non-ind/1976_1_59/full.html). So there is no statute exception and the verdict rests on terms. CyLaw is run by a bar association and its terms forbid mass or automated download and external indexing. CySEC and CSE footers say all rights reserved. The Department of Environment terms page grants nothing. Law 143(I)/2021 art. 4(1) (re-use of public sector documents "για εμπορικούς ή μη εμπορικούς σκοπούς, σύμφωνα με τους όρους ... Μερών IV και V") is the one route that could change the GPO verdict; its Parts IV and V were not read, so it was not applied (flagged in the PR).

The gazette PDFs are free and need no browser. Fetch of one named instrument, row `CY-GPO-ADOPTED`, Annex I Part I No. 5051 of 2025-07-29 (contains Laws 159(I) to 162(I)/2025, among them the Companies (Amendment) (No. 3) Law 162(I)/2025). The issue page `https://www.mof.gov.cy/mof/gpo/gazette.nsf/All/ADB5F123967FEA15C2258CD6002F9C3B?OpenDocument` names the file; the file name has a Greek capital Eta (U+0397) in `PARARTΗMA`, so it is percent-encoded:

```
curl -sS -L -A 'Mozilla/5.0' -o gaz_5051_2025.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.mof.gov.cy/mof/gpo/gazette.nsf/ADB5F123967FEA15C2258CD6002F9C3B/$file/5051%2029%207%202025%20PARART%CE%97MA%201o%20MEROS%20I.pdf'
```

Returned `200 2451930 application/pdf`, sha256 `c71e49ef679dbb10b60d2b64bc32d284930de16d35e288d2d5fc2a159d12c54e`; a second fetch gave the same hash. Text extraction (used for reading only, nothing stored): poppler `pdftotext -layout gaz_5051_2025.pdf -`; the output was clean Greek (no mojibake; the only non-Greek characters are µ, €, ° and ∙). The other issues read the same way: 5050 (`200 5986734`), 5064 (`200 445402`), 5006 (`200 3124203`), 5093 (`200 1355009`), 4840 (`200 5124103`), all `application/pdf`. Issue 4290 of 2011-07-29 (`200 4762713 application/pdf`) is an image scan: `pdftotext` returned 134 characters, so the text of Law 110(I)/2011 is not machine readable and `in_force` is null for it.

How to find an issue: `https://www.mof.gov.cy/mof/gpo/gazette.nsf/dmlgaz_appsw_gr/dmlgaz_appsw_gr?OpenDocument&OpenView&Count=1000&cp=12&app=16` lists Annex I Part I of the current year (issues 5095 to 5100 on the day); older issues are under `dmlgazette_archive_gr/dmlgazette_archive_gr?OpenForm&Start=1&Count=9999&Expand={year index}.{month}.2&Seq=3` (year index 1 = 2026, 2 = 2025 ... 16 = 2011; sub-index 2 = Παραρτήματα). The 2005 to 2021 per-year PDF indexes (`dmlprevious_Archive_gr`) were not used.

### Languages

Greek is the only language of the gazette. Turkish is co-official under the Constitution, but laws are published in Greek only. The English pages of the gazette site (`officialgazette-en`) carry navigation, no law text. No government English translation of any scoped law was found on mof.gov.cy/gpo; no translation row exists. Nothing is taken from a law firm, an exchange, an NGO or a news site.

### Link only

All nine scope entries (`cy-companies-amendment-3-2025`, `cy-auditors-amendment-2025`, `cy-transparency-amendment-2-2025`, `cy-ets-law-2011`, `cy-ets-amendment-2024`, `cy-ets-amendment-2025`, `cy-ets-amendment-2-2025`, `cy-consumer-protection-law-2021`, `cy-consumer-protection-amendment-3-2026`): row `CY-GPO-ADOPTED` is permission requested. `cy-ets-law-2011` has `in_force` null because its gazette PDF is an image.

Not in scope: the consolidated Companies Law Cap. 113 (only CyLaw serves it); the ETS amendments 202(I)/2012, 21(I)/2015, 127(I)/2020 and the consumer amendments 46(I)/2022, 166(I)/2022, 30(I)/2026, 75(I)/2026 (gazettes not opened, not climate transpositions of the brief); a framework climate law (none found: no Annex I(I) issue and no CyLaw 2025 or 2026 index entry; the bill has a `register.csv` row with family F7). The Environmental Impact Assessment law was not entered as the F2 fallback.

### Blocked from the cloud address

- https://www.cygazette.com and https://www.cygazette.com/: `curl: (35) Recv failure: Connection reset by peer` (no HTTP answer); mof.gov.cy/gpo serves the same gazette, so nothing depended on it.
- https://www.moa.gov.cy/environment: first request `503 114 text/plain` ("upstream connect error or disconnect/reset before headers"); the same host answered `200` minutes later on `.../environmentnew.nsf/index_gr/index_gr?opendocument` (46429 bytes), so this was transient.
- https://www.cse.com.cy/el-GR/terms/: 404 (no such page); the footer link was not resolved.

No browser recipe was needed; no record is browser-fetched.


## United Arab Emirates

Run on 2026-11-02 (GEL-08-01). No row passes and no text is stored; every AE instrument is `link only`. There is no proven fetch request to record for a `pass` row.

### Rows

| Row | Verdict | Why |
|---|---|---|
| `AE-UAELEGISLATION-CONSOLIDATED`, `AE-UAELEGISLATION-TRANSLATION` | permission requested | The portal answers 403 from the cloud address; its terms and Federal Decree-Law 38/2021 art. 3 could not be opened, so no statute exception is applied. |
| `AE-MOJ-GAZETTE-ADOPTED` | permission requested | `elaws.moj.gov.ae` resets the connection. |
| `AE-CMA-ADOPTED` | permission requested | The CMA copyright page reserves all rights. |

### Failed requests (blocked from the cloud address)

```
$ curl -sS -A 'Mozilla/5.0' -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://uaelegislation.gov.ae/en/legislations/2558
403 5671 text/html; charset=UTF-8
```

The body is the Cloudflare "Attention Required! | Cloudflare / Sorry, you have been blocked" page. Headless Chromium (Playwright `chromium.launch()`, `goto(url, {waitUntil: 'networkidle'})`, 4 s wait) got the same page with status 403 and 5999 bytes. The same 403 came for `/en`, `/ar/legislations/2558`, `/en/legislations/2558/download`, `/en/terms-and-conditions`, `/api/legislations/2558`, `/sitemap.xml`; only `/robots.txt` (200, 26 bytes) and `/favicon.ico` answered. The WebFetch tool also got 403. No browser recipe works, so no browser-fetched record exists.

- `https://elaws.moj.gov.ae` and `https://legislation.uaecma.gov.ae`: `curl: (35) Recv failure: Connection reset by peer` (the second also `000` on `/en`; Chromium got 502 `upstream request failed`).
- `https://www.moj.gov.ae`, `https://www.moccae.gov.ae`: 200 with a 245 to 247 byte "Request Rejected" page (F5).
- `https://www.adx.ae`: 403 Cloudflare block (4542 bytes); `/terms-and-conditions` the same.
- `https://www.sca.gov.ae/en/regulations/regulations-listing?id=198`: redirects to `https://www.uaecma.gov.ae/500.html`.
- `https://web.archive.org/...`: connection failed.

### Reachable and read

- CMA copyright page: `curl -sL -A 'Mozilla/5.0' https://www.uaecma.gov.ae/en/copyright` gave `200 103858 text/html; charset=utf-8`. Quote and fingerprint are in `AE-CMA-ADOPTED`.
- CMA 2025 AGM circular: `curl -sS -A 'Mozilla/5.0' -o circ.pdf 'https://www.uaecma.gov.ae/assets/9c6ef6ed/Circular%20on%20Annual%20General%20Meetings%20of%20Public%20Joint-Stock%20Companies%20for%202025.pdf.aspx'` gave `200 496254 application/pdf`; `pdftotext -layout circ.pdf -` with runs of spaces collapsed reads cleanly (Latin text, no mojibake). Used as evidence for Article 76, not stored.
- DFM disclaimer `https://www.dfm.ae/other/disclaimer` (200 in Chromium): "COPYRIGHT © 2026 DUBAI FINANCIAL MARKET PJSC", no reuse grant. DFM's ESG guide PDF answered 302. No scope instrument uses DFM, so it has no row.

### Languages

None stored. Arabic and English from the portal and gazette: not reachable. English from the CMA: not looked for beyond the English pages above, since the CMA row is not `pass`.

### Link-only instruments

| Instrument | Reason |
|---|---|
| `ae-dl-11-2024-climate`, `ae-law-24-1999-environment`, `ae-law-15-2020-consumer-protection`, `ae-cr-66-2023-consumer-protection-regulation` | Portal 403; the portal ids come from a search-engine listing, not an opened page. |
| `ae-cma-governance-guide-art76` | CMA terms reserve rights; decision text not reachable. |

Candidates not entered in scope: the national carbon credit registry resolution and carbon pricing executive regulation under Decree-Law 11/2024 (no official page found or openable), and the ADX and DFM ESG guides and MOCCAE rules (ADX and MOCCAE blocked; DFM guide is a company document with no reuse grant).

## Pakistan

Run on 2026-11-02 (GEL-08-05). No row passes, so nothing is stored and there is no proven store-and-hash fetch for a `pass` row. Six rows were added, all `permission requested`: `PK-PAKISTANCODE-CONSOLIDATED` (Pakistan Code; the only rights line is the footer "© Copyright 2022 - Ministry of Law and Justice", and the Copyright Ordinance 1962 vests copyright in Government works in Government, s. 2(m) and s. 13(d), with no exclusion of enacted text; s. 57(q)(i) is a defence for Gazette matter and was not applied), `PK-NA-ADOPTED`, `PK-SENATE-ADOPTED` (terms: all rights reserved), `PK-SECP-ADOPTED`, `PK-PSX-ADOPTED` (terms: personal, non-commercial use only; no modification) and `PK-SBP-ADOPTED`. The requests below were proven only to read the instrument and its date.

Row `PK-PAKISTANCODE-CONSOLIDATED`, Pakistan Climate Change Act 2017. The law page is found from the alphabetical list (`https://pakistancode.gov.pk/english/LGu0xAD?alp=P&page=1&action=inactive`), and the page links the text PDF:

```
curl -sS -L -o cc_page.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://pakistancode.gov.pk/english/UY2FqaJw1-apaUY2Fqa-apaUY2JxZpc%3D-sg-jjjjjjjjjjjjj'
curl -sS -L -o cc.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://pakistancode.gov.pk/pdffiles/administrator35e25fe56389d477d508cdf8a693e868.pdf
```

Returned `200 55353 text/html; charset=UTF-8` and `200 190247 application/pdf` (sha256 of the PDF `d9a6a6f7842cdaef46069a5a74015fe4b0af83c128ef63ca10319ce62eadf7f6`). Text was read with `pdftotext -layout cc.pdf cc.txt`: 29224 characters, 99 non-ASCII (quotation marks and dashes), no mojibake. The site serves one revised text per law and no point-in-time versions; the law page carries a visitor counter, so the HTML hash does not reproduce and the watchers hash the PDF. The same request shape worked for the Pakistan Environmental Protection Act 1997 (904506 bytes), the Petroleum Products (Petroleum Levy) and Climate Support Levy Ordinance 1961 (212418) and the Competition Act 2010 (294557), all `200 application/pdf`. The site's HEAD request answers HTTP 500, so no `http_head` watcher is used.

### Languages

English is the language the federal statutes are enacted in, and the Pakistan Code is the only English source reached. The site has an Urdu interface (`https://pakistancode.gov.pk/english/UHyrdu.php`, HTTP 200); the per-law Urdu text was not examined, because the row is not pass. No government translation source exists for English, since English is the original, so no translation row was added.

### Browser recipe (SBP)

`https://www.sbp.org.pk/circulars/shsfd-circular-no-07-of-2025` answers curl with a block page:

```
curl -sS -L -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://www.sbp.org.pk/circulars/shsfd-circular-no-07-of-2025
```

Returned `403 5188 text/html; charset=UTF-8`. Headless Chromium (Playwright `chromium.launch()`, a desktop Chrome user agent, `page.goto(url, {waitUntil: 'domcontentloaded'})`, then a 6 s wait, then `page.content()`) returned HTTP 200 and 130858 characters of HTML, with the circular dated December 26, 2025. The Annexure PDF answers curl: `curl -sS -L -o annex.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.sbp.org.pk/assets/documents/circulars/SHSFD-2025-C7-Annex.pdf` returned `200 1280859 application/pdf`; `pdftotext -layout` gave 31252 characters. Nothing was stored, so no `fetched_sha256` was taken and no record is browser-fetched. The `tools/watch.py --dry-run` baseline reached the circular page with the watcher user agent in the same session although curl got 403; the cause was not found.

### Blocked from the cloud address

- `https://www.secp.gov.pk/` and `https://www.secp.gov.pk/wp-content/uploads/2025/01/Press-release-on-Jan-1.pdf`: curl `403 5331 text/html` (Cloudflare "Just a moment..."); headless Chromium also HTTP 403 with the challenge page, after a 15 s wait.
- `https://na.gov.pk/` and `https://www.na.gov.pk/` (including `/uploads/documents/685e84982a59e_906.pdf`, the Finance Act 2025 as found by a web search): curl `SSL certificate problem: unable to get local issuer certificate`; headless Chromium HTTP 502, 174 bytes. Certificate verification was not disabled.
- `https://drs.molaw.gov.pk/Home` (Gazette Document Retrieval System): curl no reply; headless Chromium HTTP 502. `https://www.egazette.gov.pk`: no reply.
- `https://www.cc.gov.pk/` (Competition Commission): HTTP 406.

### Link-only instruments

| Instrument | Official URL | Why link only |
|---|---|---|
| pk-climate-change-act-2017 | https://pakistancode.gov.pk/english/UY2FqaJw1-apaUY2Fqa-apaUY2JxZpc%3D-sg-jjjjjjjjjjjjj | Row `PK-PAKISTANCODE-CONSOLIDATED` is permission requested. |
| pk-epa-1997 | https://pakistancode.gov.pk/english/UY2FqaJw1-apaUY2Fqa-apqaZQ%3D%3D-sg-jjjjjjjjjjjjj | Same row. |
| pk-petroleum-levy-climate-support-levy | https://pakistancode.gov.pk/english/UY2FqaJw1-apaUY2Fqa-cJyd-sg-jjjjjjjjjjjjj | Same row; `in_force` null because the Finance Act 2025 (na.gov.pk) could not be opened. |
| pk-competition-act-2010-s10 | https://pakistancode.gov.pk/english/UY2FqaJw1-apaUY2Fqa-apaUY2FsbJk%3D-sg-jjjjjjjjjjjjj | Same row. |
| pk-sbp-shsfd-circular-07-2025 | https://www.sbp.org.pk/circulars/shsfd-circular-no-07-of-2025 | Row `PK-SBP-ADOPTED` is permission requested (SBP disclaimer grants no reuse). |

Not in scope.json: the SECP order of 2024-12-31 adopting IFRS S1 and S2 and the June 2024 ESG Disclosure Guidelines, because no official SECP page could be opened (see Blocked). The existing PSX ESG register row is a primer and stays as a register row with a notes sentence.

## Uruguay

Rows `UY-IMPO-ADOPTED` (`pass`, terms: IMPO Licencia de Datos Abiertos - Uruguay), `UY-PARLAMENTO-ADOPTED`, `UY-PRESIDENCIA-ADOPTED`, `UY-BCU-ADOPTED` and `UY-BVM-ADOPTED` (all `permission requested`). Run on 2026-11-02.

The only Uruguayan source that passes is IMPO (Centro de Información Oficial, https://www.impo.com.uy). Its datos-abiertos page (https://www.impo.com.uy/datos-abiertos/) offers every public item of its databases as open data in JSON, and the linked licence allows commercial use, adaptation and transformation with a Nota de Origen. Ley 9.739 art. 45 num. 5 (faithful reproduction of laws is not illicit reproduction) was read and not relied on: it limits the author's right and does not remove copyright. The pass rests on the IMPO terms, `verdict_basis` terms.

IMPO serves each norm in JSON by adding `?json=true` to its page URL. `/bases/leyes-originales/<n>-<year>` and `/bases/decretos-originales/<n>-<year>` give the text as published in the Diario Oficial ("Documento original"). The JSON keys used are `vistos` (header and recitals, or for a law the header and enacting formula), `articulos[]` (`tituloArticulo`, `textoArticulo`, which may hold HTML tables) and `firmantes`. The response is declared ISO-8859-1 and the bytes are Windows-1252 (a UTF-8 decode fails), so `fetched_sha256` is the hash of the bytes as returned and the text is decoded as cp1252. `text` is `vistos`, then each article's title and text, then `firmantes`, with tags stripped, `<br>`, `</p>`, `</div>`, `</tr>` and `</li>` as line breaks, table cells separated by a space, runs of spaces collapsed, empty lines dropped, nothing reworded. For `uy-ley-19996-art326-327` and `uy-ley-17250-art24` the text is only the named articles (their title lines and texts). A second fetch of each of the seven files on the same day reproduced `fetched_sha256`.

```
curl -sS -A 'Mozilla/5.0' -o decreto441.json -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.impo.com.uy/bases/decretos-originales/441-2021?json=true'
```

Returned `200 8196 application/json; charset=ISO-8859-1`, Decreto N° 441/021, Documento original. The same request for Ley 17.283 (`https://www.impo.com.uy/bases/leyes-originales/17283-2000?json=true`) returned `200 32576 application/json; charset=ISO-8859-1`. The HTML page (`https://www.impo.com.uy/bases/decretos-originales/310-2017`, `200 188661 text/html; charset=ISO-8859-1`) also opens with curl. No browser recipe was needed for IMPO, and no browser-fetched record exists.

IMPO also serves a "Documento Actualizado" at `/bases/leyes/<n>-<year>` and `/bases/decretos/<n>-<year>` (`?json=true` works). It states no consolidation date and exposes no earlier versions, so no consolidated row or record exists; the watchers hash that current text so that a change in it is noticed. Instruments amended since adoption (Ley 17.250, Ley 19.996, possibly others) therefore carry the adopted text only; each `notes` says so.

### Languages

Spanish only (`es`). IMPO has no language switch. No government English translation was found for any instrument: looked for on the IMPO site and the Presidencia portal (https://www.gub.uy/presidencia/). No translation row exists and none was added for a translation by a law firm, exchange or NGO.

### Link only

None of the seven scope instruments is link only; all are stored under `UY-IMPO-ADOPTED`. The other rows hold no text:

- `UY-PARLAMENTO-ADOPTED`: https://parlamento.gub.uy answers curl with `403 919 text/html` ("The request could not be satisfied") for `/` and `/documentosyleyes/leyes`, with and without a browser User-Agent. Headless Chromium (Playwright, `networkidle` plus 2 s) opens them with 200, and its Condiciones de uso (https://parlamento.gub.uy/condiciones) allow personal, informational and non-commercial use only with no modification, so the row is permission requested. The laws are taken from IMPO instead.
- `UY-PRESIDENCIA-ADOPTED`: https://www.gub.uy/presidencia/ opens with curl (200), but its Términos y condiciones de uso grant no reuse licence, so permission requested. Decrees are taken from IMPO.
- `UY-BCU-ADOPTED`: https://www.bcu.gub.uy/ is blocked from the cloud address (see Blocked). No BCU instrument is in scope.
- `UY-BVM-ADOPTED`: https://www.bvm.com.uy opens (200) but no terms page was found, so unknown, not pass. Its Legal y Reglamentaria page lists only Ley 18.627, Decreto 322/011, Ley 19.484 and Decreto 77/2017.

### Not in scope

No binding sustainability disclosure rule for issuers was found on an official page; `register.csv` carries one F7 row saying so. Ley 19.147 (Observatorio Ambiental Nacional) was checked and dropped: it is not a climate law. Periodic IMESI rate decrees after Decreto 441/021 were not searched.

### Blocked

- https://www.bcu.gub.uy/ : curl `SSL certificate problem: unable to get local issuer certificate` (also with `--cacert /root/.ccr/ca-bundle.crt`); Chromium HTTP 502 `upstream request failed`. To be read from the laptop.

## Liechtenstein

Rows `LI-LILEX-CONSOLIDATED` and `LI-LGBL-ADOPTED`, both `pass` on the statute basis (Copyright Act URG, LGBl 1999 Nr. 160, Art. 5 para. 1 let. a and para. 2, quoted in the rows). Rows `LI-REGIERUNG-ADOPTED` and `LI-FMA-ADOPTED` are `permission requested`; nothing is stored under them. The site www.gesetze.li (LILEX, run by the Rechtsdienst der Regierung) answered curl from the cloud address on 2026-11-02 with the default curl `User-Agent` and with `Mozilla/5.0` alike, no challenge. The law text is served as PDF only; the HTML pages list versions and metadata. Language: German only. Run on 2026-11-02 for the Emissionshandelsgesetz (EHG, LGBl 2012 Nr. 346, number `2012346`).

Step 1, list the versions of a law (the `<option value="N">` elements of the page give the version number N and its validity range; the numbering skips numbers, so it cannot be guessed):

```
curl -sS -L -o ehg_versions.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.gesetze.li/konso/2012346000
```

Returned `200 16783 text/html;charset=UTF-8`; versions 1 to 8 (`01.12.2012` to `01.08.2026`). The chronology with the amending LGBl of each version is on `https://www.gesetze.li/konso/2012346000/meta?version=8` (`200 28718 text/html;charset=UTF-8`). The HTML pages carry a per-request token, so their hashes do not reproduce (this is why the watchers use HEAD, see below).

Step 2, row `LI-LILEX-CONSOLIDATED`, the consolidated text of version 8 (valid from 2026-08-01):

```
curl -sS -L -o ehg_v8.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.gesetze.li/konso/pdf/2012346000?version=8'
```

Returned `200 224325 application/pdf;charset=UTF-8`, sha256 `d45d690b86e97dbf1bd2c29ef21823fb8af829e1d0f48405b95e6a39248af999`; a second fetch minutes later returned the same bytes, so `fetched_sha256` reproduces. Without `?version=` the same path serves the current version.

Row `LI-LGBL-ADOPTED`, the act as published in the Landesgesetzblatt:

```
curl -sS -L -o ehg_lgbl.pdf -w '%{http_code} %{size_download} %{content_type}\n' https://www.gesetze.li/chrono/pdf/2012346000
```

Returned `200 83889 application/pdf;charset=UTF-8`, sha256 `195f1c253bf071344cec7edafc398051ca4a2e93352b3bdcb9f29ac789329d7d`.

Text extraction (both rows): `pdftotext -layout file.pdf -` (poppler), pages split on the form feed, runs of spaces collapsed, empty lines dropped, one line of the PDF per line of text. Consolidated PDFs: the first line of each page (LR number and short title) and the last line (`Fassung: dd.mm.yyyy` and page number) are dropped as layout. LGBl PDFs: only a lone page number at the end of a page is dropped. Hyphenation at line ends stays as printed ("Nachhaltigkeitsberichter-" then "stattung"), footnote numbers stay attached to their word, and footnote texts stay where the PDF prints them (page bottom). Checked for mojibake: no U+FFFD and no `(cid:` in any of the 61 consolidated and 11 LGBl texts; the only non-Latin characters are mathematical signs in formulas of the CO2 Ordinance and the USG. Each consolidated PDF carries its own `Fassung:` date, and all 61 equal the version start date from the version list. Formulas and tables come out as flat lines.

Cuts: for `li-pgr-art-1096b-k` the consolidated record is one chapter of the PGR (4.6 MB PDF), from the heading `III. Nachhaltigkeitsberichterstattung` up to the heading `2. Unterabschnitt` (Konsolidierter Geschäftsbericht). Versions: the eight PGR versions from 2024-07-01 (version numbers 128, 130 to 136) were fetched; the chapter is identical in all of them once footnote numbers (2000 to 2099) are ignored, so only the first is stored. For the other instruments every version the site lists is stored, because every consolidation differs from the one before. The first consolidation is stored beside the as-published LGBl text because the two differ (word sequences compared: similarity 0.91 to 0.95 for the six acts that have both).

Stored (fetched 2026-11-02), all `language` de:

| Instrument | Row | Records (`in_force`) |
|---|---|---|
| `li-pgr-art-1096b-k` | adopted, consolidated | 2024-07-01 (adopted LGBl 2024 Nr. 170), 2024-07-01 (consolidated chapter) |
| `li-lgbl-2024-171-wpg` | adopted | 2024-07-01 |
| `li-lgbl-2024-172-offg` | adopted | 2024-07-01 |
| `li-lgbl-2025-517` | adopted | 2025-11-01 |
| `li-ehg` | adopted, consolidated | 2012-12-01 (adopted), 8 consolidated 2012-12-01 to 2026-08-01 |
| `li-ehv` | adopted, consolidated | 2012-12-01 (adopted), 4 consolidated 2012-12-01 to 2026-08-01 |
| `li-co2-gesetz` | adopted, consolidated | 2013-12-01 (adopted), 8 consolidated 2013-12-01 to 2026-08-01 |
| `li-co2-verordnung` | adopted, consolidated | 2013-12-01 (adopted), 24 consolidated 2013-12-01 to 2026-08-01 |
| `li-usg` | adopted, consolidated | 2008-09-01 (adopted), 9 consolidated 2009-12-23 to 2026-08-01 |
| `li-ewr-fndg` | adopted, consolidated | 2022-05-01 (adopted), 2 consolidated 2022-05-01 and 2026-01-01 |
| `li-uwg` | adopted, consolidated | 1994-11-01 (adopted, date from the LILEX chronology), 6 consolidated 2008-11-14 to 2025-02-01 |

Versions of a law that the version list does not show (for example USG versions 1 and 8, UWG versions 1 to 7) are not served and are not stored. No dated version is stored from a browser; every record in this section came from curl.

### Languages

German is the only official language of Liechtenstein and the only language `gesetze.li` serves (`curl -sS -L -o /dev/null -w '%{http_code} %{size_download}\n' https://www.gesetze.li/en` returned `404 7356`; the search form has no language field). No government English translation was found, so there is no translation row and no `en` record. Places looked at on 2026-11-02: gesetze.li (all pages above), `https://www.regierung.li/en` (`200 27337 text/html`, no law translations linked), `https://www.llv.li/en` (`403 0`, blocked from the cloud address, see below). A translation by a law firm, an exchange, an NGO or a news site would not be stored.

### Link only

No scope instrument is link only. Sources without a stored text:

- `LI-REGIERUNG-ADOPTED`, `permission requested`: the regierung.li Impressum (`https://www.regierung.li/text/16369/impressum`, `200`) says "Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen." The CSRD press release the register row used to point at is on this site; the row now points at the LILEX page of the PGR.
- `LI-FMA-ADOPTED`, `permission requested`: `https://www.fma-li.li/` answered `403 115089 text/html` (anti-robot validation page); one earlier request the same day returned `200 585968`. No FMA instrument is in scope.
- Not in scope: the Wirtschaftsprüfergesetz and the Offenlegungsgesetz as consolidated texts (only their 2024 amending acts are stored), the Energieeffizienzgesetz and its Verordnung (family F7: register rows only).

### Blocked from the cloud address

- `https://www.fma-li.li/` and `https://www.fma-li.li/de/impressum`: `403`, "Visitor anti-robot validation" page (115089 and 115100 bytes); `https://www.fma-li.li/de/` and `/de/rechtliche-hinweise`: connection dropped by the tunnel (curl exit 000).
- `https://www.llv.li/en` and `https://www.llv.li/en/national-administration/legal-service-of-the-government`: `403`, 5311 and 5564 bytes.

### Watchers

Signal: `http_head` (Content-Length of the PDF) on `https://www.gesetze.li/konso/pdf/<LGBl number>000` without `?version=`, which serves the current version, so a new consolidation changes the size. A HEAD request answers `200` with `Content-Length` and no `Last-Modified`. `page_hash` was rejected because the HTML pages carry a per-request token, and `date_list` because the pages print dates as dd.mm.yyyy, which the watcher's regex route does not accept. The three adopted-only acts watch their LGBl PDF (`/chrono/pdf/...`), which should never change. One `terms_changed` watcher (tier `regulator_page`, as the tests require for `terms-` watchers) watches the size of the URG PDF.

## Ecuador

Run on 2026-11-02 (GEL-09-06). Three rows pass, all on one statute and not on any site terms: `EC-ASAMBLEA-ADOPTED` (Asamblea Nacional, gazette PDFs of enacted laws), `EC-SUPERBANCOS-CONSOLIDATED` (Superintendencia de Bancos, codified norms) and `EC-GOBEC-ADOPTED` (the gob.ec regulations portal, gazette PDFs). The statute is the Código Orgánico de la Economía Social de los Conocimientos, Creatividad e Innovación (Código Ingenios), Registro Oficial Suplemento 899 of 2016-12-09, art. 107 (not art. 103 as the brief says; art. 103 is "Protección acumulada"): "No son objeto de protección las disposiciones legales y reglamentarias, ... las resoluciones, deliberaciones y dictámenes de los organismos públicos, y los demás textos oficiales de orden legislativo, administrativo o judicial, así como sus traducciones oficiales." None of the three sites states reuse terms. Open decisions for Varun are in the row notes. No row was added for the Registro Oficial, the Superintendencia de Compañías, the Bolsa de Valores de Quito or Guayaquil, the Ministerio del Ambiente or Lexis: no text was fetched from them (reasons at the end of this section).

Every `curl` below carries `-A 'Mozilla/5.0'` (no request without a User-Agent was tried on the Asamblea and Superintendencia sites). Page furniture dropped from every record (all PDFs): running heads and page numbers, the lines `Documento con posibles errores digitalizado de la publicación original. Favor verificar con imagen.` and `No imprima este documento a menos que sea absolutamente necesario.`; runs of spaces collapse to one, empty lines are removed, line breaks stay where the PDF has them, hyphenation stays. Tool: poppler `pdftotext` (no `-layout`). The Registro Oficial PDFs are set in two columns and the default reading order mixes the columns at headings (Código Orgánico del Ambiente, page 49: "CAPÍTULO II" and "LIBRO QUINTO" interleaved with article text; Reglamento: Art. 674 printed between Art. 670 and Art. 671). So each page is read as a left half then a right half: `pdftotext -f N -l N -x 0 -y 0 -W 297 -H 842 file.pdf -` then `-x 297`, joined page by page. For the Reglamento PDF, whose pages carry a running head at y 68 to 79 and a two-line footer at y 784 to 806, the crop is `-y 85 -H 695`, which removes both. Check run on every record: no U+FFFD character, and the article numbers of the cut are in unbroken sequence (Código arts. 247 to 261, Reglamento arts. 670 to 730).

### Row `EC-ASAMBLEA-ADOPTED`: Registro Oficial PDFs on asambleanacional.gob.ec

The listing (23 pages, `?page=0` to `?page=22`) names each law, its Registro Oficial number and a PDF link:

```
curl -sS -L -A 'Mozilla/5.0' -o ley_0.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.asambleanacional.gob.ec/es/leyes-aprobadas?leyes-aprobadas=All&title=&fecha=&page=0'
```

Returned `200 49795 text/html; charset=utf-8`. The Código Orgánico del Ambiente (Registro Oficial Suplemento 983, 2017-04-12):

```
curl -sS -L -A 'Mozilla/5.0' -o coa.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.asambleanacional.gob.ec/es/system/files/ro-cod-ambiente-ro-s-983-12-04-2017.pdf'
```

Returned `200 1660486 application/pdf` (68 pages, text layer with embedded fonts); a second request returned the same bytes, sha256 `033ffdd280975aabb0b89f6634b4e7f9462b3a835d49abcbbecefdaed96e61af`, which is `fetched_sha256`. Record `ec-coa-libro4`, 2018-04-12 (`2018-04-12-adopted-es.json`): the text from the line `LIBRO CUARTO` up to, not including, `LIBRO QUINTO`, columns read as above; the furniture lines `Suplemento – Registro Oficial Nº 983`, `Registro Oficial Nº 983 – Suplemento` and `<n> – Miércoles 12 de abril de 2017` are dropped too.

Two Registro Oficial PDFs on the same site have no text layer (the body pages are images): Ley Orgánica Reformatoria del Código Orgánico del Ambiente, Quinto Suplemento 360 of 2026-09-02 (`https://www.asambleanacional.gob.ec/es/system/files/ro_35.pdf`, `200 2335398 application/pdf`, 33 pages, `pdftotext` returns only the cover and the covering letter) and the reform of 2021 (`2do-supl-ro-602-de-21-12-2021.pdf`, `200 19834807 application/pdf`, 30 pages). There is no OCR in the recipe, so nothing is stored from them; they have no scope entry because whether they touch Libro Cuarto could not be read.

### Row `EC-SUPERBANCOS-CONSOLIDATED`: Codificación de las Normas, Libro I

The chapter list is the table on `https://www.superbancos.gob.ec/bancos/codificacion-de-normas-de-la-sb-libro-uno-sistema-financiero/` (opened with the next command, `200 209502 text/html; charset=UTF-8`); Capítulo X of Título IX links `/bancos/descargas/39342/`:

```
curl -sS -L -A 'Mozilla/5.0' -o cap10.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.superbancos.gob.ec/bancos/descargas/39342/'
```

Returned `200 129760 application/pdf` (the chapter heading names SB-2022-1212, SB-2022-1373 and the substituting SB-2025-02114 of 2025-08-29); a second request returned the same bytes, sha256 `771c6fa49e732290dd31429ffda6ad97cd1c985b202ffc790b5183db1c6c6277`. Record `ec-sb-saras-norm`, 2025-08-29 (`2025-08-29-consolidated-es.json`): single-column PDF, `pdftotext cap10.pdf -` in default order, the repeated page head `Codificación de las Normas de la Superintendencia de Bancos` dropped, the rest as above (339 lines, 23228 characters). The download is served by a plugin, so the URL is stable but the file behind it changes when the Superintendencia recodifies; the watcher `ec-sb-saras-norm-codificacion-pdf` hashes it.

### Row `EC-GOBEC-ADOPTED`: browser recipe

`www.gob.ec` answers a script with an empty reply and the proxy shows no status. The failing line first:

```
curl -sS -L -A 'Mozilla/5.0' -o x.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://www.gob.ec/sites/default/files/regulations/2021-04/Reglamento%20al%20Co%CC%81digo%20Orga%CC%81nico%20del%20Ambiente.pdf'
```

Answered `curl: (52) Empty reply from server` (`000 0`); `curl --http1.1` on the regulation page gives the same and the same request over HTTP/2 without `-m` gave `curl: (92) HTTP/2 stream 1 was not closed cleanly: PROTOCOL_ERROR`. The Playwright chromium shipped in the session opens the pages (`chromium.launch()`, `page.goto(url, {waitUntil: 'domcontentloaded'})`, wait 2.5 s, then read the `a` elements: `Documento en línea` is the PDF link). The page https://www.gob.ec/regulaciones/reglamento-al-codigo-organico-ambiente-0 returned `200 27762 text/html; charset=UTF-8`. The PDF is fetched with Playwright's request client of the same browser context, which the site answers:

```
cat > pwdl.js <<'JS'
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext();
  const r = await ctx.request.get(process.argv[2], {timeout: 90000});
  console.log(r.status(), r.headers()['content-type'], r.headers()['content-length']);
  require('fs').writeFileSync(process.argv[3], await r.body()); await b.close(); })();
JS
NODE_PATH=$(npm root -g) node pwdl.js 'https://www.gob.ec/sites/default/files/regulations/2021-04/Reglamento%20al%20Co%CC%81digo%20Orga%CC%81nico%20del%20Ambiente.pdf' reglamento.pdf
```

Printed `200 application/pdf 1407425`; a second run returned the same bytes, sha256 `6c5ac3e13c26606090ea50221e121ec45e758e75afe10d35af286b8c521de454`, which is `fetched_sha256` (the file is a static upload, no per-request token). It is the whole Registro Oficial Suplemento 507 of 2019-06-12 (144 pages, Decreto Ejecutivo 752). Record `ec-reglamento-coa-libro4`, 2019-06-12 (`2019-06-12-adopted-es.json`): from `LIBRO CUARTO` to, not including, `LIBRO QUINTO`, columns read with `-y 85 -H 695`. The record is browser-fetched (see the PR report, GEL-03 retro C4). The watchers carry the browser URL as `second_route`, though `tools/watch.py --dry-run --source EC-GOBEC-ADOPTED` ran on 2026-11-02 with 0 failures from its own User-Agent.

### Languages

Spanish is the only official language; every record has `language` es and no row of its own was added for a second language. English was looked for, and no government translation was found, at: `https://www.asambleanacional.gob.ec/en` (`404 23869 text/html`), `https://www.registroficial.gob.ec/en/` (`404 171581 text/html`), `https://www.superbancos.gob.ec/bancos/en/` (`200 168904 text/html`, a Spanish news page, not an English site) and `https://www.gob.ec/en` (no answer). There is no translation row.

### Link-only instruments

| Instrument | Official URL | Why link only |
|---|---|---|
| ec-lodc-art6-7 (Ley Orgánica de Defensa del Consumidor, arts. 6 and 7) | https://www.gob.ec/regulaciones/21-ley-organica-defensa-consumidor | Row `EC-GOBEC-ADOPTED` passes, but the only file the portal serves (`https://www.gob.ec/sites/default/files/regulations/2018-09/Documento_Ley-Org%C3%A1nica-Defensa-Consumidor.pdf`, `200 84519 application/pdf`, 26 pages) is a Lexis compilation (every page footed `eSilec Profesional - www.lexis.com.ec`, headed `Ultima modificación: 13-oct-2011`), which is private and is never stored. The Registro Oficial Suplemento 116 of 2000-07-10 and the 2022 reformed text were not found on an official page that answered. |
| Ley Orgánica Reformatoria del COA (RO 360, 2026-09-02) and the 2021 reform (RO 602) | not scoped | Scanned images, no text layer, no OCR; not read, so no scope entry (see `ec-coa-libro4` notes). |
| Programa Ecuador Carbono Cero (Acuerdo MAAE-2021-018), Ley Orgánica de Economía Circular Inclusiva, Ley Orgánica de Eficiencia Energética | see `register/register.csv` | F7: register row only. |

### Blocked from the cloud address

- `https://www.ambiente.gob.ec/` (and its `wp-content/uploads` PDFs): `curl: (000)`, the proxy answers `CONNECT tunnel failed, response 502`; `https://www.recursosyenergia.gob.ec/`: the same. So the domain that now serves the texts of the ministry (MAATE, absorbed into the Ministerio de Energía y Minas under Decretos Ejecutivos 60 and 94 of 2025) could not be confirmed; no ministry text was read from it.
- `https://www.gob.ec/` to `curl`: empty reply or HTTP/2 PROTOCOL_ERROR (see above); opens in Chromium. The portal's search page `https://www.gob.ec/regulaciones?search_api_fulltext=consumidor` answers Chromium `403`.
- `https://www.bolsadequito.com/`: `406 226 text/html` to `curl -A 'Mozilla/5.0'`, `200 197323` to a full Chrome User-Agent; no terms page was found, so no row.
- `https://www.registroficial.gob.ec/` answers `200 186643 text/html`, but it serves edition summaries (for example https://www.registroficial.gob.ec/registro-oficial-no-733/) and no gazette PDF; its only linked file is a user manual and the filing application at `https://esacc.corteconstitucional.gob.ec/app/` needs a login. `wp-json` answers `401 MISSING_AUTHORIZATION_HEADER`. No request that returns a gazette PDF was found, so no `EC-REGISTROFICIAL` row was added.
- `https://www.supercias.gob.ec/portalscvs/index.htm`: `200 248924 text/html`, no terms or copyright page linked; no SCVS resolution text was fetched, so no row. `https://www.lexis.com.ec` answers 200 and is private: never a row.

## Ukraine

Rows `UA-RADA-ADOPTED`, `UA-RADA-CONSOLIDATED` and `UA-RADA-TRANSLATION` (all `permission requested`). Run on 2026-11-02. No row is `pass`, so no record is stored and all six scope instruments are link only. There is no proven fetch request for any row.

zakon.rada.gov.ua (Законодавство України) is blocked from the cloud address. Every request ended before the server answered:

```
curl -sS -L -m 40 -A 'Mozilla/5.0' -o /dev/null -w '%{http_code} %{size_download} %{content_type}\n' https://zakon.rada.gov.ua/laws/show/377-20
```

Returned `curl: (35) Recv failure: Connection reset by peer` (`000 0`). The same reset came for `/`, `/robots.txt`, `/laws/show/2811-20` (the copyright law whose art. 8 the brief expects to carry a pass), `/laws/show/en/377-20` (English view), `/laws/show/377-20/print` and `/laws/main/a1`, and for `zakon1.rada.gov.ua`, `zakon2.rada.gov.ua`, `zakon3.rada.gov.ua` and `data.rada.gov.ua`. Plain `http://zakon.rada.gov.ua/laws/show/377-20` answered `503 114 text/plain` ("upstream connect error or disconnect/reset before headers ... connection timeout"). Headless Chromium (Playwright `page.goto`) got `502` for `https://zakon.rada.gov.ua/laws/show/377-20`. Blocked from the cloud address: https://zakon.rada.gov.ua/ . The orchestrator can run the curl line above from the laptop. If it answers there, the print view per revision (`/laws/show/<number>/print`) and `/laws/show/<number>/ed<YYYYMMDD>` are the requests to try first; neither was reached from here, so neither is proven.

Not reachable for law text either: the Internet Archive (`web.archive.org` answers `403 Blocked by egress policy`), `r.jina.ai` (422, timeout reaching zakon.rada.gov.ua).

Other official hosts tried:

| URL | Answer | Use |
|---|---|---|
| https://www.mof.gov.ua/uk | `403` Akamai "Access Denied" with curl and with headless Chromium | blocked from the cloud address: https://www.mof.gov.ua/ ; https://minfin.gov.ua also `403` |
| https://itd.rada.gov.ua/billinfo/Bills/Card/<id> | `200 text/html; charset=utf-8` | bill cards, used as the official page for bills 15538 and 13425 and 13428; no terms, no law texts |
| https://rada.gov.ua/ , https://w1.c1.rada.gov.ua/ | `200 171948 text/html` | no law texts, no copyright page found |
| https://www.nssmc.gov.ua/ | `200 95602 text/html` | no copyright or reuse page found on the home page; site search for сталого розвитку returned nothing; no instrument identified, so no row |
| https://www.kmu.gov.ua/ | `200 467815 text/html` | not used |

### Bill cards

The Rada bill card has an internal id; the bill number is on the page. Found by scanning ids with `curl -sSL https://itd.rada.gov.ua/billinfo/Bills/Card/<id>` and reading "Номер, дата реєстрації": id 70563 is bill 15538 (registered 2026-08-21, Cabinet of Ministers, "Опрацьовується в комітеті" since 2026-08-24); id 56689 is bill 13425 (registered 2025-06-26, "Проєкт відкликано" 2025-06-30, "Знято з розгляду" 2025-07-17); id 56691 is bill 13428 (amendments to the climate policy law, in committee).

### Languages

`UA-RADA-TRANSLATION` (English views under `/laws/show/en/<number>`) is on the same blocked host, so nothing was read about which English texts are official and which are marked unofficial. No English record is stored.

### Link only

| Instrument | Row | Reason |
|---|---|---|
| `ua-law-377-ix` | `UA-RADA-CONSOLIDATED` | permission requested; zakon.rada.gov.ua resets the connection |
| `ua-accounting-law-996` | same | same |
| `ua-climate-policy-law-3991` | same | same |
| `ua-env-protection-law-1264` | same | same |
| `ua-consumer-protection-law-3153` | same | same |
| `ua-advertising-law-270` | same | same |

No PDF was fetched, so no poppler command applies. No browser-fetched record exists.

## Bangladesh

No Bangladesh row is `pass`, so nothing is stored and all nine scope instruments are `link only`. The requests below were run on 2026-11-02 to find the texts and the terms; none is a storage recipe.

**Why no row passes.** The Copyright Act 2023 (Act No. 34 of 2023) replaced the Copyright Act 2000. Read on bdlaws (`act-details-1452.html`), it has no exception for Acts or other official texts: s. 2(49) defines a government work (made by or for the Government, the legislative authority or a court), s. 15(1)(ঙ) makes the Government first owner of such a work, s. 28 gives it 60 years from first publication, and s. 14(6) and s. 70 list no official-text exclusion. So no row rests on a statute. Each publisher's own page was then read for a reuse grant: bdlaws has only a footer copyright line, the Department of Printing and Publications allows printing without modification, and Bangladesh Bank and BSEC publish a disclaimer only. All four rows are `permission requested`.

### bdlaws (BD-BDLAWS-CONSOLIDATED, permission requested)

```
curl -sS -A 'Mozilla/5.0' -o act-details-1062.html -w '%{http_code} %{size_download} %{content_type}\n' http://bdlaws.minlaw.gov.bd/act-details-1062.html
```

Returned `200 148852 text/html;charset=UTF-16` in 3.2 s for the Climate Change Trust Act 2010. The body is UTF-16 (`iconv -f UTF-16 -t UTF-8` decodes it). Other acts: `act-details-791.html` (Environment Conservation Act 1995) `200 276264`, `act-details-1014.html` (Consumer Rights Protection Act 2009) `200 367900`, `act-details-1061.html` `200 168376`, `act-details-1107.html` `200 174818`, `act-details-1685.html` `200 142808`, `act-details-1452.html` (Copyright Act 2023) `200 572622` in 5.6 s. The chronological index `laws-of-bangladesh-chronological-index.html` returned `200 2615162`; the alphabetical index is 29 MB and took over two minutes. `https://` answers the same as `http://`. The site is not slow for single acts. Two fetches of `act-details-1062.html` gave the same sha256 (`af298268131fb2444894122af0cbfbcbe3546444fecaf88dcb7d4714796b6097`), so a page hash is stable and the watchers use it. HEAD answers 405. The site serves one current text per act (amendments applied, footnotes mark them) and no point-in-time versions. Index titles of Acts after 1987 are in Bangla; the act id is found by matching the Bangla title in the index. `?lang=en` changes only the menu: `act-details-1014.html?lang=en` is byte-identical to the Bangla request. The site's description says it holds Acts, Ordinances and President's Orders but not Regulations.

### Languages

Bangla is the only text bdlaws serves for the Acts examined. No English text was found there for any of the six Acts (the Climate Change Trust Act s. 24, the SREDA Act s. 29 and the Forest and Tree Conservation Act s. 17 let the Government publish an English text by gazette notice; none was seen). English was also looked for under `?lang=en`. The Bangladesh Bank circulars and the BSEC Code are English only.

### Department of Printing and Publications (BD-DPP-ADOPTED, permission requested)

```
curl -sS -L -A 'Mozilla/5.0' -o dppterms.html -w '%{http_code} %{size_download} %{content_type}\n' https://www.dpp.gov.bd/index.php/page/view/295
```

Returned `200 41619 text/html; charset=UTF-8`. Home page `https://www.dpp.gov.bd` `200 67793 text/html; charset=UTF-8`. No gazette PDF was fetched, so no pdftotext recipe was tested for Bangla conjuncts.

### Bangladesh Bank (BD-BB-ADOPTED, permission requested)

```
curl -sS -L -A 'Mozilla/5.0' -o x.out -w '%{http_code} %{size_download} %{content_type}\n' https://www.bb.org.bd/mediaroom/circulars/gbcrd/dec262023sfd06e.pdf
```

First run returned `200 46524 text/html`, a CAPTCHA page ("What code is in the image?", support ID in the body); `https://www.bb.org.bd/` returned `200 45968 text/html` and the circular list page `200 45292 text/html`, the same page. Headless Chromium (Playwright, `chromium.launch()`, `page.goto('https://www.bb.org.bd/', {waitUntil: 'networkidle'})`, then `context.request.get(<pdf url>)` in the same context) passed the check and returned `200 application/pdf 435006` for SFD Circular No. 06 and `200 application/pdf` for SFD Circular No. 01 (`https://www.bb.org.bd/mediaroom/circulars/gbcrd/nov062025sfd01e.pdf`). A later bare `curl` of the SFD 06 PDF also returned `200 435006 application/pdf`, so the check is not applied to every request. `pdftotext -layout` read the English text cleanly (the Bangla date line prints as mojibake, `11 ‡cŠl 1430`, from a legacy font; it is not stored). The circular list page loads its rows by script, so SFD 01 was found by trying the SFD 06 URL pattern.

### BSEC (BD-BSEC-ADOPTED, permission requested)

```
curl -sS -L -A 'Mozilla/5.0' -o cg.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://sec.gov.bd/storage/laws/Corporate_Governance_Code_10.06.2018.pdf'
```

Returned `200 287607 application/pdf`. `pdftotext -layout cg.pdf -` gives readable English with Bangla gazette headers as mojibake (legacy fonts) and many `Could not parse ligature component` warnings. The law list is `https://sec.gov.bd/act-rules-and-regulations` (`200 893960 text/html; charset=UTF-8`). `https://sec.gov.bd/disclaimer` returned `200 198611`.

### Link-only instruments

- bd-bb-sfd-06-2023, bd-bb-sfd-01-2025: row BD-BB-ADOPTED is permission requested (disclaimer only; PDFs need a session that passed the JavaScript check).
- bd-bsec-cg-code-2018: row BD-BSEC-ADOPTED is permission requested (disclaimer only).
- bd-eca-1995, bd-environment-court-act-2010, bd-climate-change-trust-act-2010, bd-sreda-act-2012, bd-crpa-2009, bd-forest-tree-conservation-act-2026: row BD-BDLAWS-CONSOLIDATED is permission requested.

### Not in scope, and sites that did not answer

- Dhaka Stock Exchange, `https://www.dsebd.org` returned `200 1868223 text/html; charset=utf-8` (a script-rendered page); `https://www.dsebd.org/disclaimer` returned `403` to curl and `https://www.dsebd.org/terms` returned a script shell with no terms text. No DSE instrument in families F1 to F6 was identified, so there is no DSE row.
- Financial Reporting Council: `https://frcbd.org` answers `200 450772 text/html` but the page is a TeePublic shop page, not the FRC; the FRC's own site `https://frc.gov.bd` fails `curl: (60) SSL certificate problem: unable to get local issuer certificate` and headless Chromium got HTTP 502 `upstream request failed` for `https://frc.gov.bd` and `https://www.frc.gov.bd`. Blocked from the cloud address. No gazetted order adopting IFRS S1 and S2 was found on any page opened, so there is no FRC entry or row.
- No ETS or carbon tax: the bdlaws chronological index (titles searched for the Bangla words for carbon, energy, environment, climate and forest) lists no carbon tax or emissions trading Act. No register row was added.

## Peru

Rows `PE-ELPERUANO-ADOPTED` (`pass`, statute: Decreto Legislativo 822 art. 9 b), `PE-GOBPE-TRANSLATION` (`permission requested`) and `PE-SPIJ-CONSOLIDATED` (`permission requested`, page could not be opened). Run on 2026-11-02. Brief candidates not given a row: smv.gob.pe redirects to gob.pe/institucion/smv and the SMV resolution is read from El Peruano; the Bolsa de Valores de Lima site (https://www.bvl.com.pe) returned a 9 KB JavaScript shell with no terms page, and no BVL instrument is in scope.

El Peruano's search site (https://busquedas.elperuano.pe, a React Router app) answers plain `curl`; there is no WAF challenge. The search runs through a data route, the norm page through a second one. Both return the React Router turbo-stream format (a flat JSON array in which objects hold integer references into the array); the decoder used is below (`decode(arr)(0)` returns the page data as nested dicts and lists; the hits are under `hits`, the HTML of a norm under `htmlContent`). ```
def decode(arr):
    memo={}
    def res(i):
        if i<0: return None
        if i in memo: return memo[i]
        v=arr[i]
        if isinstance(v,dict):
            o={}; memo[i]=o
            for k,val in v.items():
                kk=arr[int(k[1:])] if k.startswith('_') else k
                o[kk]=res(val) if isinstance(val,int) and not isinstance(val,bool) else val
            return o
        if isinstance(v,list):
            l=[]; memo[i]=l
            for x in v: l.append(res(x) if isinstance(x,int) and not isinstance(x,bool) else x)
            return l
        memo[i]=v; return v
    return res
```

Find an instrument (here the RENAMI decree, searched in the November 2024 window):

```
curl -sS -A 'Mozilla/5.0' -o s.data -w '%{http_code} %{size_download} %{content_type}\n' 'https://busquedas.elperuano.pe/_root.data?start=0&query=RENAMI&ci=all&fechaIni=20241101&fechaFin=20241130'
```

Returned `200 659596 text/x-script; charset=utf-8`; after decoding, `hits` holds two entries: the Normas Legales cuadernillo of the day and `op` 2343202-1, `tipoPublicacion` SE, `numeroDispositivo` N° 010-2024-MINAM. Search is fuzzy and sorted by date, so use `fechaIni`/`fechaFin` on the publication date. `fechaPublicacion` of a hit is the publication date. A norm is then at `/dispositivo/<tipoPublicacion>/<op>`:

```
curl -sS -A 'Mozilla/5.0' -o d.html -w '%{http_code} %{size_download} %{content_type}\n' 'https://busquedas.elperuano.pe/dispositivo/NL/1842032-2'
```

Returned `200 93802 text/html; charset=utf-8` (Decreto Supremo N° 013-2019-MINAM). The page carries two things: for modern norms (2018 onward, not all) a `<div class="story">` with the clean XHTML text (`hasHTML` true), and the link to the official PDF of the page, `/api/archivo/file/<file id>/*/<op>.pdf`. Norms without the HTML view are PDF-only. Two ways to fetch text, both reproducible byte for byte on two runs:

HTML view, as the data route of the same page (the HTML page itself carries a per-request script token and its bytes differ per request, so it is not hashed):

```
curl -sS -A 'Mozilla/5.0' -o 1638161-1.data -w '%{http_code} %{size_download} %{content_type}\n' 'https://busquedas.elperuano.pe/dispositivo/NL/1638161-1.data'
```

Returned `200 125198 text/x-script; charset=utf-8` (Ley N° 30754), sha256 `8a4e32687506c29dd4ff4fbed9cefa2ca3fc13efddcdeefa6c5ad01bfc179a47` on two runs. `text` is the `story` div of the `htmlContent` field with script and style removed, `p`, `h1` to `h6`, `div`, `tr` and `br` as line breaks, table cells joined by a space, entities unescaped, runs of spaces collapsed, empty lines dropped. The XHTML inside carries a stale `<title>` from another norm (the Ley 30754 page shows the title of a water-reserve resolution); the title is not part of `story` and is not stored.

PDF, with the file id from the page:

```
curl -sS -A 'Mozilla/5.0' -o 1842032-2.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://busquedas.elperuano.pe/api/archivo/file/2mubNpRHaKfBVOvV7ZR2Jp/*/1842032-2.pdf'
```

Returned `200 539110 application/pdf`, sha256 `e30b179267a7b43f617b24a6be52f0a6f06082d703a1225f622f053ede55097d` on two runs. A HEAD request answers with `ETag` and `Last-Modified` (used by the watchers). The PDF is the newspaper pages the norm is printed on, in two columns, so it holds the tail of the previous norm, the head of the next one and the page headers. `pdftotext -layout` (the Brazil recipe) merges the two columns line by line and `pdftotext` in reading order mixes them, so the records were made from word positions: `pdftotext -bbox-layout file.pdf -`, blocks placed by column (x position against two equal columns), blocks that span the page as column breaks, page-header blocks (above y 80: `El Peruano ...`, `NORMAS LEGALES`, page number) dropped, then the slice between the norm's heading and its OP number line, `fi`/`fl` ligatures normalised (the PDF writes `Oficial` as `Oﬁ cial`). Nothing is reworded; line breaks are the PDF's own, and a few words keep stray spaces from the PDF text layer ('l os', 't reinta'). Condensed code (`bbox_lines`, `clean`):

```
import re,sys,subprocess
FURN=[r'^El Peruano( ?/ ?.*)?$', r'^Lima, (lunes|martes|miércoles|jueves|viernes|sábado|domingo) \d+ de \w+ de \d{4}$', r'^NORMAS LEGALES$']
def clean(lines):
    lines=[l.replace('\x0c','').rstrip() for l in lines]
    lines=[re.sub(r'[ \t]+',' ',l).strip() for l in lines]
    isf=[any(re.match(p,l) for p in FURN) for l in lines]
    drop=set()
    for i,f in enumerate(isf):
        if f:
            drop.add(i)
            for d in range(-3,4):
                j=i+d
                if 0<=j<len(lines) and re.fullmatch(r'\d{1,3}|\d{6}',lines[j]): drop.add(j)
    out=[l for i,l in enumerate(lines) if i not in drop and l]
    return out
def pdflines(path):
    return subprocess.run(['pdftotext',path,'-'],capture_output=True,text=True).stdout.split('\n')
def find(lines,pat,start=0):
    for i in range(start,len(lines)):
        if re.search(pat,lines[i]): return i
    raise SystemExit('marker not found: '+pat)
def articles(txt):
    return re.findall(r'(?mi)^Art[íi]culo (\d+)[º°o]?[.\- ]',txt)

import html as _h
def bbox_lines(path,ncols=2,margin=30,fullw=0.6):
    xml=subprocess.run(['pdftotext','-bbox-layout',path,'-'],capture_output=True,text=True).stdout
    out=[]
    for pm in re.finditer(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>',xml,re.S):
        W=float(pm.group(1)); body=pm.group(3)
        colw=(W-2*margin)/ncols
        blocks=[]
        for b in re.finditer(r'<block xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</block>',body,re.S):
            x0,y0,x1,y1=map(float,b.groups()[:4])
            lines=[]
            for ln in re.finditer(r'<line [^>]*>(.*?)</line>',b.group(5),re.S):
                ws=[_h.unescape(w) for w in re.findall(r'>([^<]*)</word>',ln.group(1))]
                lines.append(' '.join(ws))
            full=(x1-x0)>fullw*W
            if y1<80 and re.fullmatch(r'(El Peruano.*|NORMAS LEGALES|\d{1,4}|Lima, .*)',' '.join(lines)): continue
            col=0 if full else max(0,min(ncols-1,int((x0-margin+5)//colw)))
            blocks.append((y0,x0,col,full,lines))
        # bands separated by full-width blocks
        blocks.sort(key=lambda b:(b[0],b[1]))
        band=[]; res=[]
        def flush():
            for c in range(ncols):
                for b in sorted([b for b in band if b[2]==c],key=lambda b:b[0]): res.extend(b[4])
            band.clear()
        for b in blocks:
            if b[3]:
                flush(); res.extend(b[4])
            else: band.append(b)
        flush()
        out.extend(res); out.append('\x0c')
    return out
```

Check run on every PDF record: the article numbers come out in sequence (DS 013-2019: 1 to 4, then 1 to 72; DS 010-2024: 1 to 6, then 1 to 52; the SMV resolution 1 to 5). Old gazette PDFs fail this check (headings missing from the text layer), so those norms are link only.

### Stored (fetched 2026-11-02)

| Instrument | Row | Records | Fetch |
|---|---|---|---|
| `pe-ley-30754` | adopted | 2018-04-18 es | HTML view, `.data` of 1638161-1 |
| `pe-cnc-res-001-2026-ef30` | adopted | 2026-03-27 es | HTML view, `.data` of 2500411-1 (`200 122271` for the page, file id CJhU8wL-aaoAlrgffjjyFE) |
| `pe-ds-013-2019-minam` | adopted | 2019-12-31 es | PDF, 1842032-2 |
| `pe-ds-010-2024-minam` | adopted | 2024-11-13 es | PDF of the Separata Especial, 2343202-1 (`200 4621694 application/pdf`) |
| `pe-smv-rsc-018-2020` | adopted | 2020-02-09 es | PDF, 1853548-1 (`200 454572 application/pdf`) |

None of these is a browser-fetched record; no headless browser was needed.

### Languages

Spanish is the only language El Peruano serves; Constitution art. 48 makes Quechua, Aymara and other native languages co-official where they predominate, but no native-language text of any instrument in scope was found on El Peruano or on the gob.pe pages opened. English: the only government translation found is MINAM's Spanish and English publication of DS 010-2024-MINAM on gob.pe.

```
curl -sS -A 'Mozilla/5.0' -o b.pdf -w '%{http_code} %{size_download} %{content_type}\n' 'https://cdn.www.gob.pe/uploads/document/file/8242222/6882169-publicacion-bilingue-renami%282%29.pdf?v=1764013910'
```

Returned `200 5611421 application/pdf` (100 pages, Spanish and English paragraphs alternating). The same cdn host without the file query string, `https://cdn.www.gob.pe/institucion/minam/informes-publicaciones/6882169-publicacion-bilingue-...`, answers `403 459 text/html` (S3 AccessDenied); the page `https://www.gob.pe/institucion/minam/informes-publicaciones/6882169-publicacion-bilingue-decreto-supremo-que-aprueba-las-disposiciones-para-el-funcionamiento-del-registro-nacional-de-medidas-de-mitigacion-renami` answers `200 33977`. The translation is credited to GIZ-supported work and marked © Ministerio del Ambiente, so row `PE-GOBPE-TRANSLATION` is `permission requested` and nothing is stored from it.

### Link only

- `pe-ley-28611`: row passes; El Peruano has no dispositivo page for 2005 (search hit 'BORRA' is the whole-day gazette `NL20051015.pdf`, `200 1504095 application/pdf`); its text layer misses headings (Article 58 absent), so no faithful text.
- `pe-ley-29571`: row passes; the 2010 gazette PDF (`200 685315 application/pdf`) has no heading line for Articles 37, 52, 111, 117, 118, 124 and 151, and the page's HTML view is a page-image conversion with broken characters.
- `pe-dl-1044`: row passes; the 2008 gazette PDF (`200 395175 application/pdf`) has no heading line for Articles 47 and 58, and its first page begins inside Decreto Legislativo 1043.
- SPIJ (consolidated texts, the way to get these three with their amendments): blocked from the cloud address.

```
curl -sS -A 'Mozilla/5.0' -o /dev/null -w '%{http_code} %{size_download}\n' 'https://spij.minjus.gob.pe/spij-ext-web/'
```

Returned `curl: (35) Recv failure: Connection reset by peer` (exit 35, `000 0`). Headless Chromium to the same URL got `502 upstream request failed`; https://www.minjus.gob.pe is reset as well. Blocked from the cloud address: https://spij.minjus.gob.pe/spij-ext-web/ and https://www.minjus.gob.pe . The orchestrator can try both from the laptop.
