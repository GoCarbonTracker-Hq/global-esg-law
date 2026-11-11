# Page-hash churn fix (GEL-28-02, 2026-11-10)

Measurement report for the 153 watchers that GEL-28-01 classed `churn` (`upkeep/triage-2026-11.csv`, column `fix` added by this story). Method, numbers and the cases that did not work.

## The four measurement questions

1. **Written to.** Fixes go to `upkeep/watchers.json`; `seen.json` is written only by `python3 tools/watch.py --reseed <id>`; the triage csv gets the `fix` column. The measuring runs wrote nothing: they used the watcher's own `run_watcher` and compared against `seen.json` in memory (equal to `--dry-run` per watcher, without running the other watchers of each source).
2. **Read by.** The count of signals not in `seen.json` per watcher on each run, which is the rows `watch.py` would append.
3. **Before number (live, `main` code, 2026-11-10).** All 153 churn watchers fetched twice, 300 s apart, with `tools/triage.py` `double_fetch`: 146 of 153 gave a different signal on the second fetch (that is one new row per watcher per run); 4 were stable in that window and 3 failed a fetch. Among the 140 watchers under the approved noise rules: 134 differed.
4. **Disproof, and what mimics success.** A changed watcher raising a row on the second of two runs 5 minutes apart. Two mimics were found and are listed below: a stable hash of a page that holds no page text, and a cut that swallowed the link targets.

## Result

Of the 140 approved-rule watchers, 124 are fixed and stable; 16 are not and keep their rows open. The 13 held watchers are untouched (`review-held-2026-11.md`).

| Fix | Watchers | What |
|---|---|---|
| (a) `text_hash` | 91 | one-word change, no code |
| (b) `text_hash` + `params.cut` | 33 | a moving part cut from the visible text (counter, clock, support id) or from a link target (email-protection key, `jsessionid`, signed-URL query); 21 of the 33 carry a cut on link targets |
| (c) other kind | 0 | no stable URL or kind was found for any watcher |
| not fixable | 16 | listed below |

After number, final state (126 `text_hash` watchers, the 124 changed ones plus the two that existed before; `seen.json` reseeded with the final hash): two runs 300 s apart, each compared with the reseeded signal.

| Run | Watchers measured | Rows raised |
|---|---|---|
| 1 | 126 | 1 (`ky-cima-sic-climate-insurers-2022-page`) and 1 fetch failure (`terms-ws-mcil-adopted`, HTTP 503) |
| 2 | 126 | the same 1 row, the same 503 |

Both exceptions were then taken apart. `ky-cima-sic-climate-insurers-2022-page` carries `/cdn-cgi/l/email-protection#<key>` links with a new key per response, which the first stability check had missed by luck; it now has the `email-protection#[0-9a-f]+` cut, was reseeded, and gave stable signals on a 300 s double fetch and on two further reads. `terms-ws-mcil-adopted` was stable on three reads and a 300 s double fetch after the 503; the 503 was transient. After these two, no changed watcher raised a row on any run. Before to after on rows raised by the second run: 146 of 153 watchers to 0 of the 124 fixed ones. This is a 5-minute window: a page that changes by the day (see feed pages) is not tested by it.

Two earlier passes of the same measurement (136 and 129 watchers, 0 rows) were run with the first version of `text_hash`; they are superseded by the link-target round below and are not counted.

## Findings that changed the work

- **A stable hash of a page with no text is not a fix.** The first pass moved 136 watchers to `text_hash`. Seven of them were stable only because the fetched body holds no page text: three COSUMAF pages (visible text `COSUMAF`), `terms-rw-bnr-adopted` ("You need to enable JavaScript"), `gb-fca-esg-handbook-page` (JavaScript shell), `terms-eu-eurlex-translation` (Internet Archive toolbar), and `im-climate-change-act-2021-portal`, whose body is a WAF "Request Rejected" page (a support-id cut made it "stable"). All seven were reverted and keep their rows open.
- **`text_hash` first dropped link addresses** (Varun, 2026-11-10: a PDF swapped behind unchanged wording would go unnoticed). It now appends the `href` of every `<a>` and the `src`/`data` of `<iframe>`, `<embed>` and `<object>`. This moved 18 of the 131 `text_hash` watchers (email-protection keys on 13, a `jsessionid` on one, signed WIPO URLs on two, a changing printable-form id and a changing link list on two more) and was redone for every one.
- **A cut can hide the links.** The Paraguay (`bacn.gov.py`) watchers carried a visible-text cut `De interes.*$`; after links were added to the string, it removed every link target as well, and an edited PDF link did not move the signal. It now stops before the link section, and a second cut removes the links to other laws, latest laws and books while keeping the document's own `descarga/<id>/` link. After this, a changed link target moves the signal on every `text_hash` watcher whose fetch worked in that check (128 of 131, checked on the saved pages by editing one link target per watcher until one moved the signal; run before the last five reverts and the `ky-cima-sic-climate-insurers-2022-page` cut, none of which touches the link handling).

## Fixes that could not be made stable (16, rows left open)

| Watcher | Reason class | Detail |
|---|---|---|
| `cd-ordonnance-loi-26-016-page`, `eg-law-4-1994-environment-eeaa-laws-page`, `terms-eu-eurlex-consolidated` | c-unfixable-now | a fetch failed in the double fetch (timeout, TLS EOF); kind unchanged |
| `cu-res-106-2025-carbon-market-gaceta-page`, `rw-rse-esg-reporting-guidelines-page-hash` | c-unfixable-now (link round) | fetch timeouts in the new-hash check; back on `page_hash` |
| `gb-fca-esg-handbook-page`, `gq-cosumaf-reglamento-general-page-hash`, `terms-cg-cosumaf`, `terms-cm-cosumaf`, `terms-rw-bnr-adopted`, `terms-eu-eurlex-translation`, `im-climate-change-act-2021-portal` | c-blind | the body holds no page text (shell, toolbar, block page); for GEL-28-05's browser route |
| `lc-consumer-protection-act-agc-page` | c-unfixable | the portal returned a different act's page on one of two fetches |
| `ro-omf-85-2024-legislatie-page` | c-unfixable (link round) | the printable-form link carries a new id per fetch and is the document's own link; cutting it would blind the watcher; back on `page_hash` |
| `lv-par-piesarnojumu-likumi-page` | c-unfixable (link round) | the set of 1,123 link targets differs between fetches; back on `page_hash` |
| `terms-so-mof-adopted` | c-unfixable (link round) | one fetch returned a page with different navigation links; back on `page_hash` |

## Feed pages: fixed, but expect them to fire on a new item

Four fixed watchers sit on pages whose text is a news or edition feed. They are stable for 5 minutes and will raise a row when the publisher posts an item, which is a signal and not noise: `hk-taxonomy-sustainable-finance-page`, `ni-ley-647-lagaceta-ediciones`, `terms-tl-bctl-adopted`, `vn-terms-congbao-consolidated`. Other pages carry "latest" link lists (for example the Paraguay pages); these were cut where they moved in the window, and any that move over a day will show on the next run.

## Disproof: a real change still moves the signal

Saved pages from the 300 s double fetch, one edit each, signal computed by the watcher's own function with its final `params`.

Visible text (one text node of the page gets ` AMENDED` added):

```
ae-cma-governance-guide-art76-page (text_hash, no cut)
  old 43495b7b2d6b00c634ff319388fa5e19de4f48cb4b7ddfb08b190dfce596306b
  new f661716e7144dd87922990ac9f1aa0f2d00f6f654b80e297bf9caa5028f63afa
terms-bw-blackhall-consolidated (text_hash, clock cut)
  old 17a3f66834b338e5e921c13845df94b7741cf1c796b13e84dc73442fa3e892fe
  new d21ff21024e68d28c5c674f952436c9baf8ba8459f5ea716e37111a491486495
py-ley-294-1993-bacn-page (text_hash, counter, widget and other-law-link cuts)
  old f6c1ddf3abe7b970c82accab2c42a73303775eb01636b411c89705a7a7cf2563
  new d29f07a9f6441c7436d1aac61a2007643dcc62b9c291cbeffd5b2ef1bc19008c
```

Link target only (the visible text is untouched; one `<a href>` file name gets `-REPLACED` before `.pdf`). Two of the three are on instruments with stored text (`has_records` = yes in the triage csv):

```
py-ley-7190-2023-bacn-page (has_records yes)
  .../descarga/11986/LEY7190.pdf -> .../descarga/11986/LEY7190-REPLACED.pdf
  old fbb8e8c8a5f1bd8d6046abcd1109d8e0e6505540a85693180c47732b1ebf5d98
  new 8a3f2f6da66a6c11cbf42ae9780e05c9572341709891de9f4e0125ed0ddc2cd6
us-ca-sb253-carb-program-page (has_records yes)
  .../2026-09/2026_SB253_Reporting_Guidance.pdf -> .../2026_SB253_Reporting_Guidance-REPLACED.pdf
  old f67649c040770d59a7cea41a68016be3b868fe22e45536db8b7146ab41d7808c
  new ea0c1769a51db50a9a6f0cf70bec895c415129fd9d4b8326d41aa11a33ae6026
ni-ley-842-siboif-marco-juridico (has_records no)
  .../leyes/ley_1061.pdf -> .../leyes/ley_1061-REPLACED.pdf
  old 6888e8bad683ce09d57057a284a2c48ddc880a1c96644c8872c22ca24f5b277f
  new a85a27a399493cb373d516de7d49fa0623a8cd4818eebacb0fe10b502db4f28f
```

In all six, the unedited second fetch gave the old signal, so the move comes from the edit.

## What this does not show

- Churn shows that a page moves by itself, not that the law is unchanged. The 48 churn watchers on stored text stay on GEL-28-03's reading list and the churn terms watchers on GEL-28-04's.
- A cut is written from two fetches. A moving part that did not move in the window is not cut.
- `text_hash` of a page whose law text is loaded by script (a shell) sees no law text; the seven c-blind watchers are the ones found in this pass, and other shells may exist among the watchers that were not churn.

## Held watchers, follow-up (GEL-28-02b, 2026-11-11)

Varun ruled on 2026-11-11 that the ten watchers held in `review-held-2026-11.md` are churn and that the three Singapore watchers are route failures. Each of the ten was changed on a local branch and measured with the watcher's own `run_watcher`, on `main` code plus one option (below). Stability pair: two fetches at least 300 s apart (CY, TJ, TT, GW 00:35 and 00:41; MN and MY, after a first pair failed and the cuts were widened, 00:43 and 00:48), signals equal. Each page body was read: the source page in every case, not a block or challenge page. `seen.json` was reseeded for all ten with `--reseed`; no queue row was written or decided.

| Watcher | Fix | Stability pair (fetch 1 = fetch 2) | Edit on the saved page: moved or unchanged |
|---|---|---|---|
| `cy-ets-amendment-2-2025-gazette-page` | `text_hash` + cut on the file-size token | `c5e2e138ad8d` = `c5e2e138ad8d` | file size `(Μέγεθος Αρχείου: …Kb)` rewritten to `1.234,5Kb`: unchanged; `Νόμοι` to `Νόμοις`: moved; PDF link `$file/` to `$file/x`: moved |
| `cy-ets-amendment-2025-gazette-page` | same | `df1cdbe161f3` = `df1cdbe161f3` | file size `(Μέγεθος Αρχείου: …Kb)` rewritten to `1.234,5Kb`: unchanged; `Νόμοι` to `Νόμοις`: moved; PDF link `$file/` to `$file/x`: moved |
| `cy-transparency-amendment-2-2025-gazette-page` | same | `f3a85b53ff32` = `f3a85b53ff32` | file size `(Μέγεθος Αρχείου: …Kb)` rewritten to `1.234,5Kb`: unchanged; `Νόμοι` to `Νόμοις`: moved; PDF link `$file/` to `$file/x`: moved |
| `mn-corporate-governance-code-legalinfo-page` | `text_hash` + 2 cuts: the footer text and its link block, which flip between Mongolian and English per fetch (the captcha address is an `<img src>`, never hashed; the first plan "plain `text_hash`" failed the pair on this footer flip) | `221f7e4d22ca` = `221f7e4d22ca` | footer swapped between the two fetched pages: unchanged; one word of the act title: moved; `/mn/book` link target: moved |
| `my-cpa-1999-lom-home-page` | `text_hash` + cut on the `Terms & Condition (T&C) \|+ FAQS \|+ Contact Us` footer line and a cut on the "Top Hit" view counters (they tick up every few minutes; found by the first pair) | `482af6b1d160` = `482af6b1d160` | `\|`/`\|\|`/`\|\|\|` between the footer links: unchanged; a hit counter changed: unchanged; `Revised` to `Revisedd`: moved; an Act title in the feed: moved; `principal.php?type=reprint` link target: moved |
| `my-tda-2011-lom-home-page` | same (same URL, same signal) | `482af6b1d160` = `482af6b1d160` | same as above |
| `my-eqa-1974-lom-home-page` | same (same URL, same signal) | `482af6b1d160` = `482af6b1d160` | same as above |
| `tj-law-advertising-2003-adlia-page` | `date_list` + `params.verbatim`, regex `от (dd.mm.yyyy)` | 14 entries, identical set (a870e4fc8a6b) | version list reversed: unchanged; an added `от 05.05.2030` entry: moved |
| `tt-ema-2000-versions-page` | `date_list` + `params.verbatim`, regex over `LN. n/yyyy` and `as at <month> <day> <year>` | 270 entries, identical set (4219830f5557) | amendment entries reversed: unchanged; an added `LN. 77/2030`: moved; an added `as at December 31st 2030`: moved |
| `gw-amf-umoa-taxonomia-brvm-page` | `http_head` to `text_hash` (GET) + 2 cuts: the market ticker/clock block and the Top 5/Flop 5 block | `a534960a3470` = `a534960a3470` | clock and ticker prices changed: unchanged; circular title word: moved; circular date: moved; PDF link target: moved |

Findings that changed the plan:

- `tj-law-advertising-2003-adlia-page` and `tt-ema-2000-versions-page` needed code: `date_list` accepts only ISO dates, and the pages list `18.07.2017` and `LN. 129/2004`. `params.verbatim` (off unless set, `date_list` only) keeps the captured text as written; the set is compared, so a reorder never moves it, and a new entry does. Test: `test_date_list_verbatim_ignores_order_and_sees_a_new_entry`. TJ now watches the dates on the page (the version list and the document's own dates); a changed article text with unchanged dates is no longer seen. TT watches the 263 amendment numbers and the version dates.
- The first pair for `mn-corporate-governance-code-legalinfo-page` moved: the footer text and the footer links come back in Mongolian or English. The first pair for the three Malaysia watchers moved on the "Top Hit" view counters. Both were cut and measured again.
- The three Malaysia watchers share one URL and one signal. The page is the federal legislation home page, an index with no act text. It carries a daily "What's New" feed of P.U. notices and the newest Acts; the signal is stable over 5 minutes but will move on any day a notice or Act is posted. That is a signal of the page, not noise, and it is not specific to the Consumer Protection, Trade Descriptions or Environmental Quality Acts.
- `gw-amf-umoa-taxonomia-brvm-page`: the URL is an HTML news page of the BRVM, not a PDF. The body shows the circular, its date and the PDF link; the watcher no longer sends HEAD.
- The three Singapore watchers are unchanged. The body is the MAS "Maintenance" page (HTTP 200, `ref-id` differs per request). Their rows in `triage-2026-11.csv` are `route_failure`, for GEL-28-05.
- Left on `main`: none of the ten.
