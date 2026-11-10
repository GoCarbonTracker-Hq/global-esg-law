# Blocked list, GEL-04-11 after wave 23 (2026-11-10)

Lines copied from the `Blocked` heading of each wave 23 place report (nine Claude Sonnet Agent-tool subagents, `.dispatch/wave23-reports/` in go-carbon-insights, no PRs). Only lines that name a host or URL.

| Wave | Place | Line |
|---|---|---|
| 23 | AS | https://www.osas.as/terms, /copyright, https://www.asepa.gov/terms, https://www.americansamoa.gov/terms: 404. |
| 23 | AS | https://asbar.org/*: 403 to curl (not retried this session; not a source row). |
| 23 | GU | https://guamlegislature.gov/terms-of-use/ and /disclaimer/: 404. |
| 23 | GU | No connection (guesses, not links from an official page): dbi.guam.gov, revtax.guam.gov, dist.guam.gov, dribanking.guam.gov, dnrt.guam.gov, dric.guam.gov, gpuc.guam.gov, guamstockexchange.com (from the research of 2026-11-10; not retried). |
| 23 | MP | https://cnmilaw.gov/terms, /privacy, /disclaimer, /copyright: HTTP 404 |
| 23 | MP | https://cnmileg.net/ (Legislature): no answer (curl 000 at 15, 30, 60 s), bill texts not opened (research 2026-11-10) |
| 23 | MP | https://www.cnmicommerce.com/, https://commerce.gov.mp/, https://governor.cnmi.gov/: HTTP 403 (research 2026-11-10) |
| 23 | PR | https://www.drna.pr.gov/, https://drna.pr.gov/, https://jca.pr.gov/, drna.pr.gov PDFs: curl, no HTTP answer (code 000, timeout) |
| 23 | PR | https://bvirtualogp.pr.gov/ root: 404 |
| 23 | PR | https://www.estado.pr.gov/terminos-y-condiciones, /terminos-de-uso, /politica-de-privacidad; https://www.ocif.pr.gov/avisos-publicos: 404 |
| 23 | PR | http://app.estado.gobierno.pr/reglamentosonline/ directory: 403 |
| 23 | PR | https://aqcheckin.s3.amazonaws.com/static/documents/2019/33.pdf (guessed): 403 XML |
| 23 | VI | https://www.legvi.org/ and /vi-code/, /vicode, /terms, /disclaimer, /robots.txt: 403 Cloudflare block page, not bypassed. |
| 23 | CK | Not re-tested this run, taken from the research file: www.legislation.gov.ck, legislation.gov.ck, www.cookislands.gov.ck, www.cicc.gov.ck, www.cira.gov.ck, www.cara.gov.ck (curl 000); parliament.gov.ck /terms-and-conditions/, /privacy-policy/, /disclaimer/ (404). Nothing was refused to curl on the portal. No browser-fetched records (headless Chrome was used only to read the home page date and footer). |
| 23 | NU | https://www.legislation.govt.nz/act/public/1994/143/en/latest/ (and /whole.html): 202, empty body, WAF challenge; not bypassed |
| 23 | NU | https://www.paclii.org/nu/ and https://www.nzlii.org: 403 (not official) |
| 23 | NU | environment.gov.nu, climatechange.gov.nu, crownlaw.gov.nu: no HTTP answer |
| 23 | NU | https://www.gov.nu/robots.txt: 404 |
| 23 | NU | gov.nu Acts 382 and 386 PDFs: no text layer (OCR would be needed, not done, nothing storable anyway) |
| 23 | TK | https://paclii.org/tk/legis/ : 403 Cloudflare (curl; per research also headless Chrome) |
| 23 | TK | https://legislation.govt.nz/act/public/1948/24/en/latest/ : 202, empty body, WAF challenge |
| 23 | TK | pacliirms.paclii.org, www.nzlii.org/nz/legis/consol_act/ta194899, library.sprep.org SPREP review: 403 (research); pacliirms.austlii.edu.au: no connection (research) |
| 23 | NF | https://www.nirc.gov.au/ : curl 403 in research (council, not needed). |
| 23 | NF | https://www.infrastructure.gov.au/ : no answer in 40 s, twice, in research (not needed). |
