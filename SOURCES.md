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
