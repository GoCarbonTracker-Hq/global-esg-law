# Blocked list, GEL-04-11 after wave 25 (2026-11-10)

Lines copied from the blocked or could-not-read heading of each wave 25 place report (ten Claude Sonnet Agent-tool subagents, `.dispatch/wave25-reports/` in go-carbon-insights, no PRs). Only lines that name a host or URL.

| Wave | Place | Line |
|---|---|---|
| 25 | GF | https://www.legifrance.gouv.fr/loda/id/JORFTEXT000034328710 : curl -A Mozilla 403 (and the site root, per research). Not bypassed. |
| 25 | GP | legifrance.gouv.fr, including /jorf/id/JORFTEXT000041786378, 000024035211 and 000027770353 (RTG 2019, 2011, 2013): curl 403 (known; not bypassed). Titles taken from search results are not used as row titles. |
| 25 | GP | Python urllib fails TLS verification on regionguadeloupe.fr (`CERTIFICATE_VERIFY_FAILED`), curl answers 200: `tools/watch.py --dry-run --source GP-REGION-ADOPTED` reports watch_failed for that reason; the watcher carries a second_route note. |
| 25 | MQ | legifrance.gouv.fr, including /jorf/id/JORFTEXT000027915101 (RTM), 000027915158 (DPE-M), 000037470695 (PPE décret): curl 403 (known; not bypassed). |
| 25 | RE | https://www.cr-reunion.fr/ : curl -A Mozilla 530 (17 bytes, text/plain). |
| 25 | RE | https://www.regionreunion.com/ : curl -A Mozilla 403 (5952 bytes, text/html). |
| 25 | RE | legifrance.gouv.fr: curl 403 (known; not bypassed). |
| 25 | YT | legifrance.gouv.fr (including /jorf/id/JORFTEXT000000261649, /loda/id/JORFTEXT000025944185, /loda/id/JORFTEXT000034453591): curl 403 (known; not bypassed). |
| 25 | BL | https://www.legifrance.gouv.fr/ : curl 403 and a challenge page in headless Chrome (from the brief; not retried, not bypassed). |
| 25 | BL | https://www.comstbarth.fr/mentions-legales/ : renders "Page not found" in the app. |
| 25 | MF | https://www.legifrance.gouv.fr/ : curl 403 and a challenge page in headless Chrome (from the brief; not retried, not bypassed). |
| 25 | PM | https://www.legifrance.gouv.fr/ : curl 403 and a challenge page in headless Chrome (from the brief; not retried, not bypassed). |
| 25 | PM | https://jo-spm.fr/mentions-legales.php, /mentions.php, /cgu.php, /contact.php, /aide.php : HTTP 404. |
| 25 | TF | https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000699397: 403 to curl. Not bypassed. |
| 25 | TF | wp-json media endpoint on taaf.fr: 401 rest_not_logged_in. |
| 25 | BQ | Nothing refused. 404: https://www.overheid.nl/copyright and https://www.overheid.nl/en/copyright (no terms page, as the SX row records). Island government sites and the Rijksdienst Caribisch Nederland were not opened. |
| 25 | BQ | Bonaire motor vehicle tax (CVDR700672, https://lokaleregelgeving.overheid.nl/CVDR700672): tariff is by mass in kg, art. 4 lid 1 d exempts vehicles "op 3 of meer wielen zonder CO2 uitstoot". Kept as an F7 register row. If you want it as a narrower F3 scope entry, say so; the pass row would then store it (nl). |
| 25 | BV | https://www.regjeringen.no/en/ answered 403 (5407 bytes, HTML), not tried further. |
| 25 | SJ | https://www.regjeringen.no/ answered 403 for BV (same host, not retried for SJ). |
| 25 | CC | https://www.infrastructure.gov.au/ : curl exit 92 on HTTP/2, timeout on HTTP/1.1, no status; not read. |
| 25 | CX | https://www.infrastructure.gov.au/ : curl exit 92 on HTTP/2, timeout on HTTP/1.1, no status; not read. |
| 25 | CX | Keep the plastic bag local law as an F4 link-only scope entry, or move it to F7 as the research had it. If kept, the watcher and scope entry stay; if moved, drop `register/CX/scope.json` to `[]`, delete watcher `cx-plastic-bag-local-law-2018` and set the register row's family to F7. |
| 25 | HM | https://www.heardisland.aq/ : curl exit 60 (certificate verification failed); not read. |
| 25 | HM | https://www.infrastructure.gov.au/ : curl exit 92 on HTTP/2, timeout on HTTP/1.1, no status; not read. |
| 25 | GS | None. gov.gs /copyright/, /terms-and-conditions/, /privacy-policy/ answered 404 in the research (not re-fetched). Antarctic Regulations 1997 is a scan 7.4 MB, not read. |
| 25 | IO | https://bills.parliament.uk/bills/4004: curl `403` (5407 bytes); not bypassed. |
| 25 | UM | fws.gov and /refuge/ pages: 403 to curl (research; not retried, no law text needed). |
| 25 | UM | ecfr.gov/current and federalregister.gov/documents HTML: 200 with a "Request Access" body; APIs used. |
| 25 | UM | uscode.house.gov deep links: 404. |
| 25 | AQ | legislation.govt.nz (NZ Act 1994/119): HTTP 202, empty body (WAF challenge). |
| 25 | AQ | legifrance.gouv.fr (French loi 2003-347): HTTP 403 (Cloudflare challenge). |
| 25 | AQ | CCAMLR permission: only the Secretariat (ccamlr@ccamlr.org) can lift the hold. |
| 25 | EH | http://www.sahara.gov.ma/ and https://www.ammc.ma/fr/reglementations/circulaires and the AMMC circular PDF: curl timeout, exit 28. |
| 25 | EH | https://www.sgg.gov.ma/Portals/0/textesconsolides/11_03.pdf: HTTP 404 (ministry page https://www.environnement.gov.ma/fr/component/content/article/3469-loi-cadre?catid=107 lists dahir and BO number only). |
