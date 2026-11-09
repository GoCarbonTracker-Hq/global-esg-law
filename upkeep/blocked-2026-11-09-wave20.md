# Blocked list, GEL-04-11 after wave 20 (2026-11-09)

Lines copied from the `Blocked` heading of each wave 20 place report (seven Claude Sonnet Agent-tool subagents, `.dispatch/wave20-reports/` in go-carbon-insights, no PRs). Only lines that name a host or URL are kept; decision and gate lines under the same heading are left out. ER and IR have no scope entries because no state host answered; they are the places to try from Varun's browser.

| Wave | Place | Line |
|---|---|---|
| 20 | AF | https://acku.edu.af/ : HTTP 406 to curl, 226 bytes. |
| 20 | AF | https://neis.nepa.gov.af/public/{id} : 200 but a JavaScript shell, not the file. |
| 20 | ER | www.moi.gov.er, www.mlwe.gov.er, www.mfa.gov.er, www.moj.gov.er, www.bankoferitrea.gov.er: no answer (did not resolve) |
| 20 | ER | https://www.erieri.com: 403 |
| 20 | ER | https://www.loc.gov/item/eritrean-proc-179-2017/ and https://www.loc.gov/collections/gazette-of-eritrean-laws/: 403 to curl |
| 20 | IR | https://rrk.ir, https://www.rrk.ir, http://rrk.ir: timeout, no HTTP response |
| 20 | IR | https://rc.majlis.ir, /fa, http://: curl 35 connection reset |
| 20 | IR | https://doe.ir, https://www.doe.ir, /Portal/home/: timeout |
| 20 | IR | https://dotic.ir: 403, 10836 bytes, geo-block ("blocked from your IP or your location") |
| 20 | IR | https://www.cbi.ir: 200, 244 bytes, "The requested URL was rejected" (python urllib got 90444 bytes in the dry run, so a browser-like route may work) |
| 20 | IR | https://www.sec.ir: certificate error; -k gives 301 to a domain-sale page at one.ir (not the regulator, no row) |
| 20 | IR | https://www.tse.ir, https://www.majlis.ir: no response |
| 20 | IR | https://qavanin.ir: 200 but a script redirect page, no law text |
| 20 | LY | https://lsm.ly: no answer from the laptop address (curl HTTP 000). |
| 20 | LY | https://lsm.ly and the Law Society of Libya database were not used as sources (non-state or unreachable). |
| 20 | LY | eg.gov.ly, env.gov.ly, justice.gov.ly, moj.gov.ly: no answer (000), found by guessing hosts, not by link. |
| 20 | SD | https://dse.sd and http://dse.sd: no answer (curl 000) |
| 20 | SD | https://www.hcenr.gov.sd, https://www.mefpd.gov.sd, https://www.mofep.gov.sd, https://mti.gov.sd: no answer (000) |
| 20 | SD | No refusals with HTTP errors; moj.gov.sd, cbos.gov.sd, fma.gov.sd, wipo.int answered. |
| 20 | SO | https://www.centralbank.gov.so/ and https://centralbank.gov.so/: curl -sL -A "Mozilla/5.0": HTTP 403, 5384 bytes (Cloudflare browser check), not passed. |
| 20 | SO | https://www.wipo.int/wipolex/en/members/profile/SO with UA "Mozilla/5.0": HTTP 403; opened with a full Chrome UA. |
| 20 | SO | parliament.gov.so/legislation-4/ and mof.gov.so legislation pages answer 200 but serve no law links in the HTML (probably script-rendered); not browser-checked. |
| 20 | SO | Ask the ministry (moecc.gov.so) for written permission to reuse the Act and regulations text; without it Somalia stays link only. |
| 20 | SS | mojca.gov.ss: the laptop resolver does not resolve it (curl exit 6, 000); public resolvers return 198.177.125.177. Reached with --resolve. HTTPS cert expired ("SSL certificate problem: certificate has expired"), so -k was used for reads. |
| 20 | SS | www.moj.gov.ss, www.mocc.gov.ss, www.bank.gov.ss, www.mofnp.gov.ss: no DNS answer (000). |
| 20 | SS | https://mofp.gov.ss/laws/: 200 with Content-Length 0. |
| 20 | SS | https://unfccc.int/sites/default/files/resource/South-Sudan-First-NAP%20.pdf: 200, 212 bytes, Incapsula challenge. |
