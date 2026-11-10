# Blocked list, GEL-04-11 after wave 24 (2026-11-10)

Lines copied from the `Blocked` heading of each wave 24 place report (ten Claude Sonnet Agent-tool subagents, `.dispatch/wave24-reports/` in go-carbon-insights, no PRs). Only lines that name a host or URL.

| Wave | Place | Line |
|---|---|---|
| 24 | FO | fsa.fo, vinnumalaraduneyti.fo, fme.fo, felagid.fo: no connection (curl HTTP 000), from the research on 2026-11-10; I did not retry them because no scope entry needed them. |
| 24 | GL | https://nalunaarutit.gl/copyright, /cookies: 404. https://naalakkersuisut.gl/Ophavsret, /Copyright, /Cookies, /Privatlivspolitik, /Love-og-regler: 404. https://naalakkersuisut.gl/en: 500; /?sc_lang=en: 500 "Layout Not Found". nalunaarutit.gl `?sc_lang=en`: 200 but page frame only, no law text. |
| 24 | GL | Not retried from the brief: finanstilsynet.gl (no connection), ft.dk (403), the Nalunaarutit search API (500). |
| 24 | AW | https://wetten.overheid.aw/ , https://www.arubaoverheid.aw , https://www.cba.aw , https://www.dcsx.com : curl 000 (no answer), from the brief, not retried. |
| 24 | AW | https://www.sim-cdn.nl/ : 000 (root only; the PDF host cuatro.sim-cdn.nl answers 200). |
| 24 | AW | https://sedeco.aw/nl/consumentenzaken/misleidende-reclame/ : 403 (consumer office page), not retried. |
| 24 | AW | https://www.gobierno.aw/en/official-gazettes-2026 , /nl/afkondigingsbladen-2026 : HTTP 404 (the 2026 list does not exist on the site). |
| 24 | CW | https://www.centralbank.cw/ : curl HTTP 403; headless Chrome bot challenge ("Just a moment..."), not bypassed (from research, not retried). |
| 24 | CW | No connection (curl HTTP 000, from research): www.overheid.cw, lokaleregelgeving.overheid.cw, decentrale.regeringen.cw, www.rijksoverheid.cw, www.officielebekendmakingen.cw, www.curacao-gov.cw. |
| 24 | CW | Server was slow once (a 10-page curl loop ran past two minutes); no refusals from gobiernu.cw. |
| 24 | SX | https://www.centralbank.cw/ : curl 403, 5355 bytes (Cloudflare challenge, not bypassed). CBCS rules not read. |
| 24 | SX | https://www.dcsx.com/ : curl HTTP 000, timeout. DCSX rules not read. |
| 24 | SX | https://www.sintmaartengov.org/Pages/Terms.aspx and /Pages/Disclaimer.aspx : 404. |
| 24 | SX | https://www.overheid.nl/copyright and /over-deze-site/copyright : 404. (https://www.overheid.nl/informatie-hergebruiken answers 200 and describes the SRU web service only; no licence stated.) |
| 24 | NC | https://www.legifrance.gouv.fr/ and /liste/jonc: HTTP 403, 5.4 KB challenge page to `curl -sL -A "Mozilla/5.0"` (brief, not retried or worked around). |
| 24 | NC | https://leginova.gouv.nc/api/code/{id}, /api/code/{id}/pdf, /api/texte-consolide/{id}/pdf: HTTP 404 (guessed paths; no per-code JSON or consolidated PDF found). |
| 24 | NC | https://leginova.gouv.nc/api/jonc/10917/pdf (35 MB+) and /api/jonc/10690/pdf: transfers too slow, stopped; not refusals. |
| 24 | PF | https://www.legifrance.gouv.fr/ : curl 403, Cloudflare challenge; not tried again, not bypassed. |
| 24 | PF | service-public.pf /sgg/, /rec/mentions-legales/, /sio/mentions-legales/, /dgae/?p=2308 : HTTP 503 (from the brief; not retried). |
| 24 | PF | The watcher's own User-Agent ("global-esg-law-watch/1 (+https://github.com/mokagtc/global-esg-law)"): lexpol.cloud.pf drops the connection (curl code 000, RemoteDisconnected); `-A "global-esg-law-watch/1"` or `Mozilla/5.0` answers 200. `tools/watch.py --dry-run --source PF-LEXPOL-CONSOLIDATED` therefore reports 3 watch_failed (one per watcher). I left `tools/` alone; the second_route on each watcher says so. Tool bug for Moka: the "+https://" part of the User-Agent is what the host refuses. |
| 24 | WF | `https://www.legifrance.gouv.fr/` and its mentions légales page: curl 403 (research). Headless Chrome returned a "Just a moment..." challenge. I did not retry or bypass it. |
| 24 | WF | `https://www.wallis-et-futuna.pref.gouv.fr/`: no host (curl 000, research). |
| 24 | MO | None refused the laptop address. bo.io.gov.mo and www.io.gov.mo timed out per the brief (not retried). Not opened: amcm.gov.mo (JavaScript shell), al.gov.mo, dspa.gov.mo. |
