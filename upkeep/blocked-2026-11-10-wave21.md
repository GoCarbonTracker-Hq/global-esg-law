# Blocked list, GEL-04-11 after wave 21 (2026-11-10)

Lines copied from the `Blocked` heading of each wave 21 place report (seven Claude Sonnet Agent-tool subagents, `.dispatch/wave21-reports/` in go-carbon-insights, no PRs). Only lines that name a host or URL are kept; decision and gate lines under the same heading are left out. The Guernsey and Isle of Man portals are the places to try from Varun's browser: both places are link only and neither copyright statute was read on an official copy.

| Wave | Place | Line |
|---|---|---|
| 21 | GG | https://www.guernseylegalresources.gg/ : 403, Cloudflare challenge, 5281 bytes |
| 21 | GG | https://www.guernseylegalresources.gg/terms-and-conditions : 403, 5362 bytes |
| 21 | GG | https://guernseylegalresources.gg/CHttpHandler.ashx?documentid=84806 : 403, 5415 bytes |
| 21 | GG | https://web.archive.org/web/2025/https://guernseylegalresources.gg/copyright-notice/ : the capture itself is a 403 page; the 20250704105946 capture opens |
| 21 | GG | https://www.wipo.int/wipolex/en/members/profile/GG : 404 |
| 21 | JE | https://statesassembly.je/open-licence: 403 Cloudflare challenge (5411 bytes) to curl with a browser user agent. |
| 21 | IM | https://legislation.gov.im/ : HTTP 200, 269-byte "Request Rejected" page; /cms/ HTTP 202 captcha (per research note); www host `000` connection reset |
| 21 | IM | https://www.gov.im/about-this-site/terms-and-conditions/ (also /about-the-government/terms-of-use/, /copyright): 269-byte "Request Rejected" to curl, 266 bytes to headless Chrome |
| 21 | IM | https://www.tynwald.org.im/ : HTTP 403 |
| 21 | IM | Headless Chrome on https://www.legislation.gov.im/ : empty DOM |
| 21 | GI | https://www.gfsc.gi/ answered 301 to https://www.fsc.gi/, which answered 403 to curl. Not read. |
