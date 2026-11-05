# Blocked list, GEL-04-11 after wave 17 (2026-11-05)

Lines copied from the `Blocked` heading of each wave 17 place report (ten agy subagent reports on Gemini 3.8 Flash in the orchestrator's `.dispatch/wave17-reports/`, no PRs this wave). Nothing was fetched for this list. Runs were from a laptop address.

| Place | Line |
|---|---|
| KN | https://ipo.gov.kn: HTTP/2 502 Bad Gateway from Sucuri Cloudproxy. |
| KN | https://eccb-centralbank.org: HTTP/2 502 Bad Gateway from server. |
| LC | `https://www.sustainabilitydevelopment.gov.lc` : answered HTTP 502 Bad Gateway to curl from outside. |
| LC | `https://eccb-centralbank.org` : answered HTTP 502 Bad Gateway to curl from outside. |
| VC | https://eccb-centralbank.org: HTTP/2 502 Bad Gateway from server. |
| WS | `https://www.samoalaw.ws`: connection timed out after 5000 ms with 0 bytes received (curl error 28). |
| WS | `https://palemene.ws`: returned HTTP 406 to curl with User-Agent `Mozilla/5.0`. Bare curl returned HTTP 200. Act downloads link to `palemene.sharepoint.com`. SharePoint redirects to client-side Single Page App views. |
| WS | `https://www.ag.gov.ws`: returned HTTP 200 to curl. The site contains division overviews but no direct Act downloads. |
| WS | Browser-fetched records: none. |
| TL | https://www.jornal.gov.tl : HTTP 502 Bad Gateway. |
| TL | The Ministry of Justice hosts the active gazette site at https://mj.gov.tl/jornal/. |
| TL | Browser-fetched records: none. |
| SZ | `https://www.gov.sz/`: TLS handshake completes, but HTTP/2 GET times out with 0 bytes received (`curl: (28) Operation timed out after 10004 milliseconds with 0 bytes received`). |
| LS | `https://www.centralbank.org.ls/`: HTTP/1.1 502 Bad Gateway from Cloudflare edge server. |
| LS | `https://lesotholii.org/`: HTTP/1.1 403 Forbidden to automated scripts without browser headers. |
| CM | `https://minepded.gov.cm`: Returns HTTP 502 Bad Gateway to all requests from the laptop address on 2026-11-05. |
| CM | `https://www.imprimerienationale.cm`: Connection timed out after 30 seconds with 0 bytes returned. |
| CM | `https://www.cosumaf.org`: Returns HTTP 403 Forbidden with Cloudflare challenge page (`cf-mitigated: challenge`). |
| CG | `https://www.cosumaf.org`: Cloudflare challenge returned HTTP 403 on automated requests. |
| AO | `https://diariodarepublica.gov.ao`: Historical searches and gazette downloads before August 2026 require an authenticated JURISNET subscription account. |
