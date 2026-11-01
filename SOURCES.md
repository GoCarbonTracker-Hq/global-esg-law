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
- `eu-esrs-2023-2772`: adopted text, in force 2023-12-25. No consolidated version: `02023R2772-20251113` returned 404 with the same headers, and so did 20231225, 20231226, 20240101, 20251114, 20251231 and 20260101. The list of published consolidated dates on eur-lex.europa.eu could not be opened (bot challenge), so a later consolidation date that this guess missed is possible.
- `02022L2464-20230105` (CSRD consolidated at its own entry into force) returned 404.
- Not stored here: Taxonomy, SFDR, CSDDD, the two Omnibus directives and the two ESRS amendment acts (GEL-01-10, 11, 13); their scope entries are unchanged.


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

- `us-epa-ghgrp-40cfr98` (row `US-ECFR-ADOPTED`, kind `consolidated`): all 27 version dates the versioner lists for part 98, 2017-01-01 to 2026-10-14, one record each, fetched with the recipe above at each date. The 2009 original is not on the versioner, so the scope entry keeps `in_force` 2009-12-29 and the earliest stored version is 2017-01-01. Text comes from the returned XML with tags stripped and block elements as line breaks; table cells are tab-separated.
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
- The 2023 zip's section text predates SB 219's amendments (archive dated 2024-11-25). `pubinfo_2025.zip` (1292052065 bytes, dated 2026-10-26) was still downloading and has not been checked for later amendments to 38532 and 38533.
- CARB pages opened 2026-11-01 for `status_note`: the program page, the SB 261 Enforcement Advisory (2025-12-01) and the SB 253 Enforcement Notice (2024-12-05). Their URLs are in `register/US/scope.json`.
