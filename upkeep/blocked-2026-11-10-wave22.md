# Blocked list, GEL-04-11 after wave 22 (2026-11-10)

Lines copied from the `Blocked` heading of each wave 22 place report (six Claude Sonnet Agent-tool subagents, `.dispatch/wave22-reports/` in go-carbon-insights, no PRs). Only lines that name a host or URL.

| Wave | Place | Line |
|---|---|---|
| 22 | AI | https://www.eccb-centralbank.org/ : HTTP 403, 118 bytes (403 Forbidden page), curl with Mozilla UA. |
| 22 | KY | https://www.gazettes.gov.ky/ : no HTTP response within 40 s (curl status 000). |
| 22 | KY | https://www.cima.ky/general-disclaimer : HTTP 404 (also /terms-and-conditions, /legal, /disclaimer). This also makes the staged watcher terms-ky-cima-adopted report `watch_failed HTTP 404` on every dry run, by design: a change from 404 to a page is the signal. |
| 22 | MS | https://www.eccb-centralbank.org/, /enforced, /disclaimer-policy: HTTP 403 to `curl -A 'Mozilla/5.0'`; 200 to a Chrome-style User-Agent. The watcher `terms-ms-eccb-adopted` fails 403 in dry run (same as AG's), second_route listed. The cdn PDF answers 200 to both. |
| 22 | MS | https://www.fscmontserrat.org/ and /legislations/: HTTP 406 to `Mozilla/5.0`; 200 to a Chrome-style User-Agent. No row (supervisory guidance is AML only). |
| 22 | MS | https://www.ecsrc.com/: HTTP 500 to both. No row. |
| 22 | MS | https://www.gov.ms/ and /terms-and-conditions/, /disclaimer/, /privacy-policy/, /terms-of-use/, /website-terms/, /accessibility/: HTTP 500. |
| 22 | VG | https://www.bvifsc.vg/ and /terms-use: `403 5657 text/html`, Cloudflare "Just a moment..." challenge. Not bypassed. Its PDFs answer 200 and were used to read the Copyright Act and the Order. |
| 22 | VG | https://www.bvistockexchange.com/: `403 5558`, same challenge. |
| 22 | VG | https://www.bvihouseofassembly.vg/: no answer (000). |
| 22 | VG | https://www.bvi.gov.vg/: `200` with an empty body. |
| 22 | VG | laws.gov.vg `/terms`, `/copyright`, `/disclaimer`, `/about`: 404 (no terms page exists). |
| 22 | PN | https://www.government.pn/copyright, /terms, /legal, /disclaimer, /privacy: HTTP 404. |
| 22 | PN | https://www.pitcairn.pn/ and https://www.gov.pn: no connection (curl 000, from the brief; not retried). |
| 22 | PN | https://www.legislation.gov.uk/ukpga/Geo5/1-2/46/section/18/data.xml: HTTP 404. |
