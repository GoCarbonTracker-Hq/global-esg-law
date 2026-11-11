# Held watchers, per-watcher look (GEL-28-02, 2026-11-10)

The 13 watchers GEL-28-01 held under noise rules N5 (visible text moves, 12) and N9 (`Last-Modified` moves, 1). None of their queue rows is rejected and none of their watchers is changed. The proposed class is for Varun's ruling.

Method: each watcher was fetched twice, 300 s apart, with `tools/triage.py`'s `double_fetch` (the watcher's own fetch and signal functions); the two bodies were compared as text. Every watcher has a `permission requested` licence verdict, so nothing from these sources is stored and the rows decide link-only register entries only.

| Watcher | What moves | Body is | Proposed class |
|---|---|---|---|
| `cy-ets-amendment-2-2025-gazette-page` | A file size in the page flips decimal separator between fetches (`443.63Kb` and `443,63Kb`). The gazette entry text is the same. | The source page (Cyprus Government Printing Office entry) | `churn`, fix (b): `text_hash` with `params.cut` on `Μέγεθος Αρχείου: [\d.,]+Kb` |
| `cy-ets-amendment-2025-gazette-page` | Same file-size separator flip (`5962,88Kb` and `5962.88Kb`). | The source page | `churn`, same fix (b) |
| `cy-transparency-amendment-2-2025-gazette-page` | Same file-size separator flip (`2442,16Kb` and `2442.16Kb`). | The source page | `churn`, same fix (b) |
| `gw-amf-umoa-taxonomia-brvm-page` | `http_head`: the server returns the current time as `Last-Modified`, so the value differs on every request (`Tue, 10 Nov 2026 20:56:57 GMT`, then `21:02:18 GMT`). No body is read. | HEAD only, no body | `churn` with no cheap fix: `Last-Modified` carries no information on this host. Needs a GET kind (`text_hash` on the page) after a look at what the page holds; otherwise retire the watcher in GEL-28-05 |
| `mn-corporate-governance-code-legalinfo-page` | Only markup: the captcha image URL carries a timestamp (`api/captcha?x=1794344276203016`). Visible text is identical on both fetches and `text_hash` matches. The N5 label came from the keyword matcher, not from moving text. | The source page (about 41,000 characters of text) | `churn`, fix (a): `text_hash` |
| `my-cpa-1999-lom-home-page` | A menu separator flips between `\|` and `\|\|` (`Terms & Condition (T&C) \| FAQS` and `\|\| FAQS \|\|`). | The Malaysia federal legislation home page (an index page, no act text) | `churn`, fix (b): `text_hash` with `params.cut` on `\|+` |
| `my-eqa-1974-lom-home-page` | Nothing between these two fetches (both hashes equal, 10 open rows from earlier runs). Same page template as the two above, so the same separator flip is the likely cause. | The same home page | `churn`, same fix (b); stability not shown on the day, so prove it with a second pair before applying |
| `my-tda-2011-lom-home-page` | Same menu separator flip. | The same home page | `churn`, same fix (b) |
| `sg-mas-erm-asset-managers-mas-guideline-page` | The page says "Sorry, this service is currently unavailable" and prints a per-request `ID number 0.4b0d7b5c.<timestamp>.<hex>`. The ID is what moves. | A maintenance block page, not the guideline | `route_failure` (GEL-28-05: a second route for the MAS guideline) |
| `sg-mas-erm-banks-mas-guideline-page` | Same maintenance page and moving ID. | A maintenance block page | `route_failure` |
| `sg-mas-erm-insurers-mas-guideline-page` | Same maintenance page and moving ID. | A maintenance block page | `route_failure` |
| `tj-law-advertising-2003-adlia-page` | The list of version dates (`от 01.08.2003 от 06.10.2008 ...`) comes back in a different order; the two fetches hold the same words (checked as a multiset). | The source page (a document view with its version list) | `churn`, no fix with the existing options: neither `text_hash` nor a cut survives a reorder. Options: a new order-insensitive option, or a `date_list` over the version dates (regex on `\d\d\.\d\d\.\d{4}`) |
| `tt-ema-2000-versions-page` | The list of revision entries (`Legal Notice LN. 129/2004` and others) comes back in a different order; same words in both fetches (multiset checked). | The source page (laws.gov.tt revision list) | `churn`, same options as `tj-law-advertising-2003-adlia-page`; here a `date_list` over the legal-notice numbers is the closer fit |

Counts: 12 N5 watchers and 1 N9. By proposed class: `churn` with a fix on the existing options 7 (cy x3, mn, my x3), `churn` that needs a new option or kind 3 (gw, tj, tt), `route_failure` 3 (sg x3). `real_change_candidate`: none. The N5 label was wrong for `mn-corporate-governance-code-legalinfo-page` (markup only) and probably for `my-eqa-1974-lom-home-page`.
