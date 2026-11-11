# Failing watchers, fix step (GEL-28-05), 2026-11-11

Input: `upkeep/review-failures-2026-11.csv` (365 watchers; 225 `client_change`, 133 `keep_failing`, 6 `second_route`, 1 `new_url`). The file's probe was curl from this laptop. Counts below are live runs of the real client, not the file.

## Answer

Of the 225 `client_change` watchers, 65 failed with the old client when run live on 2026-11-11 (160 already read: the file's failures were mostly transient or fixed since). After the change 8 fail. Recovered 57, still failing 8, newly failing 0. Of the 57, 52 are due to the change (42 certificate, 8 HTTP 403, 2 truncated reads); 5 read again with no code involved (two Estonian name-lookup errors, a connection reset each from SZSE and the Lao gazette, a 502 from kjs.mof.gov.cn).

| Failure class (file) | Watchers | Failed before | Fail after | Recovered | Newly failing |
|---|---|---|---|---|---|
| certificate | 45 | 42 | 0 | 42 | 0 |
| blocked_403 | 36 | 10 | 2 | 8 | 0 |
| truncated | 9 | 2 | 0 | 2 | 0 |
| dns | 5 | 2 | 0 | 2 | 0 |
| other | 78 | 8 | 5 | 3 | 0 |
| timeout | 52 | 1 | 1 | 0 | 0 |
| total | 225 | 65 | 8 | 57 | 0 |

The first pass after the change failed 11: the 8 above plus three one-off network failures (dof.gob.mx reset, kjs.mof.gov.cn, riigiteataja.ee) that read on the immediate rerun. A threaded run from one laptop is noisy; the table uses the rerun.

All 365 watchers: 226 read now (217 of the 225, 5 `keep_failing` watchers the 403 retry recovered, 4 whose URL moved), 139 still fail. Nothing was removed and nothing is `retire`.

## Diagnosis per class

| Class | What Python needed | Count that mattered |
|---|---|---|
| certificate | The server sends its own certificate without the intermediate (checked with `openssl s_client` on www.nepa.gov.jm and pakistancode.gov.pk: "unable to get local issuer certificate"). Python's `ssl` does not fetch a missing intermediate; macOS `curl` does. No header, user agent or bundle fixes it: the Homebrew bundle and `/etc/ssl/cert.pem` both fail, and `/etc/ssl/cert.pem` is older and breaks hosts that work. Stdlib cannot do it, so the system `curl` is the fallback. | 42 |
| blocked_403 | A script agent gets 403, a browser agent gets the page (eccb-centralbank.org, cbben.thomsonreuters.com, sso.agc.gov.sg in the sample). The bare agent must stay first: lexpol.cloud.pf only answers it. So the browser agent is a second request after a 403. | 8 |
| truncated | lexpol.cloud.pf cuts the body short when the request carries `Connection: close`, which urllib always sends. Without that header (http.client, keep-alive) the page arrives whole, with or without gzip. The retry now omits it. | 2 |
| dns, timeout, other | Not reproducible: the old client reads them. Their hosts were slow or the laptop's lookups failed during the probe. | 0 |
| other (Knesset, 5) | HTTP 474 access denied from the Knesset firewall to this laptop, for Python and curl alike, any agent. | n/a |

## The change (`tools/watch.py`, stdlib only)

`default_fetch` sends the same request as before. Only after a failure does it do one more thing: HTTP 403 gives one request with a browser user agent plus `Accept` and `Accept-Language`; a truncated read retries without `Connection: close`; a certificate verification error runs the system `curl` (verification on, never `-k`; if curl fails the original certificate error is reported). Because the first request is unchanged, a healthy watcher cannot change its signal.

## Measurement

```
python3.13 /tmp/gel2805/measure.py <out.json> <ids.txt>   # run_watcher with default_fetch per watcher, threaded by host,
                                                          # same fetch and parse as tools/watch.py --source <id> --dry-run, plus the compare with seen.json
```

The harness is used because `--dry-run` prints a row only when a failure text is new, so it hides a failure already recorded in `seen.json`. Before: `WATCH_DIR` = the HEAD version of `tools/watch.py`. After: the changed file.

Healthy sample: 75 watchers over 27 sources (up to six watchers each from EU-EURLEX-CONSOLIDATED and -ADOPTED, UK-LEGISLATION-CONSOLIDATED and -ADOPTED, UK-FCA-HANDBOOK, UK-SRS-ADOPTED, US-ECFR-ADOPTED, the three PF-LEXPOL watchers, and 19 more sources picked at random). Old client 75 read, new client 75 read. Healthy watchers whose signal moves because of the new headers: 0. Nine watchers of the sample would raise a row against `seen.json` under the old client and the same nine under the new one (churn that was there already: `gb-fca-esg-handbook-page`, `terms-fm-cfsm-adopted`, `terms-mp-lrc-consolidated`, `terms-sx-cvdr-consolidated`, `kh-consumer-protection-law-ccf-laws-page`, `terms-aq-ccamlr-adopted`, `km-loi-94-018-justice-page`, `km-loi-95-007-justice-page`, `km-decret-01-052-justice-page`). `gb-fca-esg-handbook-page` and `terms-mp-lrc-consolidated` give a different hash on every fetch, with either client.

Block-page check: for 21 hosts across certificate, 403, truncated, dns and other, the first visible text or file magic was read. All show the source (ECCB, Gambia ministry, Guadeloupe legal notice, SZSE and MOF notices, Colombia decree JSON, Lexpol, Pakistan National Assembly, Saint Vincent Ministry of Legal Affairs, `%PDF` for the PDF watchers). The 11 `http_head` hosts were also fetched with GET and show `%PDF` or page text. Mimics found among the 225: 0. Among the `keep_failing` watchers the new client reads three Jordan LOB pages (`jo-*-lob-page`) with a 200 that is an Angular shell with no page text; those count as failing and carry a note.

## Data changes

| Watcher | Change |
|---|---|
| `terms-ls-cbl-adopted` | URL `www.centralbank.org.ls` (certificate does not match the name) to `https://centralbank.org.ls/`, reseeded. No register `official_source_url` pointed at the old address; the `sources.json` licence row keeps its URLs. |
| `terms-eu-eurlex-adopted`, `-consolidated`, `-translation` | web.archive.org snapshot (HTTP 202, empty body) to the live `https://eur-lex.europa.eu/content/legal-notice/legal-notice.html`, kind `page_hash` to `text_hash` (the live page hash moves on every fetch, the text hash was stable on two fetches), reseeded. |
| `terms-ky-cima-adopted` | Stays failing (Varun, 2026-11-11). The move to the home page `https://www.cima.ky/` was taken back: the watcher read again but no longer watched a terms text. URL and kind are as before (`/general-disclaimer`, 404), with a note. |
| `ve-organic-environment-law-pdf-head`, `ve-penal-environment-law-pdf-head` | Stay failing. The official list (`/leyes/vigentes`) loads its links by script; the new PDF addresses need a browser. No second-route code was needed for any watcher: no general mechanism was built. |

`params.note` was added to the 139 watchers that stay failing (133 `keep_failing` minus 5 that now read, plus 8 unrecovered `client_change`, plus the 2 Venezuela PDFs, plus `terms-ky-cima-adopted`). The 5 `keep_failing` watchers that now read with the 403 retry (`ph-bsp-circular-1128-head`, `se-sfs-2024-347-sfs-head`, `terms-se-sfs-adopted`, `th-cmsb-tor-jor-55-2563-sec-page`, `za-jse-listings-8-63-pdf-head`) carry no note and were not reseeded.

## Still failing, by reason (139, with `terms-ky-cima-adopted`: HTTP 404, put back after the table below was written)

| Reason | Watchers |
|---|---|
| Cloudflare or other bot challenge, block page, 202 with empty body: browser only | most of the 128 `keep_failing`, plus 2 SSO (`sg-cpa-*`) |
| Connect, name lookup, TLS handshake or timeout from this laptop | the `re-checked 2026-11-11` rows of the file, plus `mn-corporate-governance-code-legalinfo-page` |
| Knesset firewall (HTTP 474) | 5 |
| Intermittent 403 (browser retry reads some runs): `id-permen-lhk-21-2022-page`, `id-perpres-98-2021-page`, `id-uu-4-2023-p2sk-page`, `vu-price-monitoring-consumer-affairs-act-paclii-ha` | 4 |
| 200 but an empty script shell: the three `jo-*-lob-page` | 3 |
| PDF address 404, new address needs a browser | 2 |

The reason text for each watcher is in its `params.note`.

## Healthy watchers whose signal would move

None attributable to this change. The nine above move with or without it.
