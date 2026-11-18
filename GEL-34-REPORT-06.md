STATUS: done

# GEL-34 story 06 report: show the answers where nothing is in force

Base 9053af5afaf06709681459c85b2d7d5e99858d4f, branch feat/gel-34-06-variants, ref origin/history 55c8c2a9c (3360 records), read-on 2026-11-17.

## Plan

Four pieces. One writer per file.

| Piece | Deliverable | Files | Done when |
|---|---|---|---|
| P1 page code (me, one coupled unit: contract, classification and panel cannot be split without a second contract) | six variants, V6 in the plain panel, application-date line, later-than-corpus line, label rule, `GEL.showNoMatch` | `web/interim.js`, `web/answer.js`, `web/variants.css`, `web/index.html` (one `<link>` line, markup inside `#answer-panel`) | the browser checks of P2 pass and `wcag.py` says ok |
| P2 browser checks (subagent, sonnet) | one extension file with one check per acceptance criterion plus a sweep over every entry and interval start | `tests/web/checks/06-variants.mjs` | `node --check` clean, runs against P1, every check prints PASS or an honest FAIL |
| P3 recounts (subagent, sonnet, read only) | the live value of every count the story gives, and `law_in_force` cases for AE, BJ, CSRD, KG, ESRS, EUDR printed beside the page cases | `~/.cache/gel34-chrome/story-06/recounts.md` (not committed) | numbers recorded with the command that printed each |
| P4 integration (me) | full check run, wcag, pytest, commits, this report | `GEL-34-REPORT-06.md` | all criteria below answered with output |


## Contract between P1 and P2

The contract (exact strings, DOM, which variant for which data) went to P2 as a file. P2 found no page bug against it. Where the check and the page agree on a text, the text came from the story, not from the page.

## What I did

P1 (me). Rewrote `web/interim.js` (the six sentences, the later line, the offer button, the two links) and the classification and panel parts of `web/answer.js`. Added `web/variants.css` (no colour, only tokens) and one `<link>` line plus markup inside `#answer-panel` in `web/index.html`. Commit 67b457694.

P2 (sonnet subagent). Wrote `tests/web/checks/06-variants.mjs`, 60 checks. Its expected side comes from the story strings, the data file and `expected.json`. It reports mutation-testing itself against a copy of the page in 12 ways (a later line that never hides, a changed V2 wording, a message set through innerHTML, a target on the browse link, a new Date in answer.js and others); each mutation failed the checks that should catch it. I did not repeat the mutations. I read its helpers and the cases up to AC4, and ran it myself. Commit c29caee7d.

P3 (sonnet subagent, read only). Recounted every number the story gives on the live data (below).

P4 (me). Ran the full check, the patched copy of check.mjs, wcag.py, pytest and a visual look at five panels in headless Chrome (V2, V3, V5, V6, ESRS on 2023-12-25; no layout fault).

How the page reads the data: `GEL.classify` now returns plain for every in-force interval. V6 (row has `date_basis`), the application line (entry has `applies_from`, line text from the interval's `not_yet_applying`) and the archive label (row has `copy: "archive"`) are drawn inside the plain panel. The interim reasons left are `link-only`, `before-first` (V2 and V4, told apart in `interim.js` by one text compare of `intervals[0].from` with `snapshot.read_on`), `repealed` and `other`. `other` never occurs on the real file and takes the V1 sentence, so there is no seventh string.

## Test results

```
node tests/web/check.mjs --data web/law-data.json --expected ~/.cache/gel34-chrome/story-06/expected.json --port 8406 --cdp 9406 --profile ~/.cache/gel34-chrome/story-06
check.mjs: 125 passed, 9 failed          (60 of the passes are 06-variants.mjs; no FAIL line comes from it)

python3.13 tests/web/wcag.py
wcag.py: ok

CI=1 python3.13 -m pytest -q -k "not all_pairs"
450 passed, 1 deselected in 406.52s (0:06:46)
```

The 9 failures are base checks of story 04. All nine test what this story replaces. I did not edit `check.mjs` (rule). The brief says the 74 base checks must still pass; they cannot, because the interim sentence they assert is the thing this story removes.

| Failing base check | Why it fails now |
|---|---|
| AC2 "8 CSRD dates", row 2022-12-31 | expects the old interim sentence; the page now shows V2 |
| AC3 "pairs=625 ... differ=3" | 3 pairs (dz-lf-1992-art117 on 1991-12-18, eu-batteries-2023-1542 on 2023-08-17, eu-esrs-2023-2772 on 2023-12-25) were interim; they are now plain (V6, not yet applying) |
| AC4 "before first version", "repealed", "link only" | expect the old sentence |
| AC4 "not yet applying", fixture "copy archive" | expect interim state; both are now plain by the brief's rule |
| AC8 "load requested only index.html, the stylesheet, ..." | the page now also requests `/variants.css`, which the check does not list |
| AC8 "offline: pairs=625 ..." | same 3 pairs as AC3 |

Proof that nothing else broke: a patched copy of `check.mjs` (diff below; the copy is kept at `~/.cache/gel34-chrome/story-06/check-06-patched.tmp.mjs`, not in the repo) runs the whole suite on the same page and data:

```
check.mjs: 134 passed, 0 failed          (74 base checks + the 60 of 06-variants.mjs)
```

AC5 of story 04 (loading list, 500 ms) passed on every run (26 ms). No rerun was needed.

Patch the coordinator can apply to `tests/web/check.mjs` after the merge (the AC4 hunk is in the copy, shown here in full):

```diff
--- tests/web/check.mjs	2026-11-18 03:25:16
+++ /Users/varunmoka/.cache/gel34-chrome/story-06/check-06-patched.tmp.mjs	2026-11-18 03:41:31
@@ -422,8 +422,8 @@
     if (p.date !== row.date) problems.push(`${row.date}: data-date ${fmt(p.date)}`);
     if (row.commit) {
       if (p.state !== "plain" || !sameCommit(p.commit, row.commit)) problems.push(`${row.date}: state ${p.state}, commit ${fmt(p.commit)}, want ${row.commit}`);
-    } else if (p.state !== "interim" || p.hasCommit || !p.shown || !p.show.interim || !(p.interim || "").includes(T.interim)) {
-      problems.push(`${row.date}: want interim panel with the interim sentence, got state ${p.state}, commit ${fmt(p.commit)}, text ${fmt(p.interim)}`);
+    } else if (p.state !== "interim" || p.hasCommit || !p.shown || !p.show.interim || !(p.interim || "").includes("The earliest stored version of this law starts on 2023-01-05")) {
+      problems.push(`${row.date}: want interim panel with the V2 sentence, got state ${p.state}, commit ${fmt(p.commit)}, text ${fmt(p.interim)}`);
     }
   }
   verdict(2, `${E.csrd.length} CSRD dates show the expected commit (2022-12-31 shows the interim panel)`, problems);
@@ -460,7 +460,7 @@
       else if (!sameCommit(o.commit, r.commit)) bad = `commit ${o.commit}, want ${r.commit}`;
       else if (o.kind !== r.kind) bad = `kind ${o.kind}, want ${r.kind}`;
       else if (o.lang !== r.language) bad = `language ${o.lang}, want ${r.language}`;
-    } else if (o.state !== "interim" || o.commit !== null) bad = `want interim without data-commit, got ${o.state} ${o.commit}`;
+    } else if (o.state !== "plain" || !o.commit) bad = `story 06: every pair is an in-force panel with a commit, got ${o.state} ${o.commit}`;
     if (bad) diffs.push(`${r.id} ${r.date}: ${bad}`);
   });
   return { pairs: E.pairs.length, plain, interim, differ: diffs.length, diffs };
@@ -482,7 +482,7 @@
 }
 
 // ---------- AC4: interim cases ----------
-async function interimProblems(id, date) {
+async function interimProblems(id, date, want) {
   // a plain answer first, so anything an interim answer fails to clear (data-commit, link, since) shows
   await evaluate(`GEL.showAnswer(${JSON.stringify(E.example.id)}, ${JSON.stringify(E.example.date)})`);
   await evaluate(`GEL.showAnswer(${JSON.stringify(id)}, ${JSON.stringify(date)})`);
@@ -490,21 +490,31 @@
   return [
     ...eqs([["state", p.state, "interim"], ["notice", p.notice, E.notice]]),
     ...(p.shown ? [] : ["panel not shown"]),
-    ...((p.interim || "").includes(T.interim) && p.show.interim ? [] : [`interim sentence not shown: ${fmt(p.interim)}`]),
+    ...((p.interim || "").includes(want) && p.show.interim ? [] : [`interim sentence not shown: ${fmt(p.interim)}`]),
     ...(p.show.notice ? [] : ["notice not visible"]),
     ...(p.show.since ? ["In force since is visible"] : []),
     ...(p.show.link ? ["a link is visible"] : []),
     ...(p.hasCommit ? [`data-commit present: ${p.commit}`] : []),
     ...(/in force since/i.test(p.text || "") ? ["panel text says in force since"] : []),
     ...(/\bno law\b/i.test(p.text || "") || /\bno law\b/i.test(p.sentence || "") ? ['text says "no law"'] : []),
-    ...((p.sentence || "").toLowerCase().includes(T.interim.toLowerCase()) ? [] : [`hidden sentence lacks the interim sentence: ${fmt(p.sentence)}`]),
+    ...((p.sentence || "").toLowerCase().includes(want.toLowerCase()) ? [] : [`hidden sentence lacks the interim sentence: ${fmt(p.sentence)}`]),
   ];
 }
 async function ac4() {
   await open("ok");
-  for (const c of E.interim_cases) verdict(4, `${c.label} (${c.id} on ${c.date}) shows the interim panel`, await interimProblems(c.id, c.date));
+  const V = { "before first version": "The earliest stored version of this law starts on 2023-01-05", repealed: "replaced 2023-05-05 by", "link only": "The corpus stores no text of this law, only a link to it" };
+  for (const c of E.interim_cases) {
+    if (V[c.label]) verdict(4, `${c.label} (${c.id} on ${c.date}) shows the interim panel`, await interimProblems(c.id, c.date, V[c.label]));
+    else {
+      await evaluate(`GEL.showAnswer(${JSON.stringify(c.id)}, ${JSON.stringify(c.date)})`);
+      const q = await panel();
+      verdict(4, `${c.label} (${c.id} on ${c.date}) is an in-force panel with the application line (story 06)`, [...eqs([["state", q.state, "plain"]]), ...((q.text || "").includes("Duties start to apply on 2024-01-01.") ? [] : [`no application line: ${fmt(q.text)}`])]);
+    }
+  }
   await open("fixture");
-  verdict(4, 'fixture row with copy "archive" (fixture-archive-copy on 2026-01-01) shows the interim panel', await interimProblems("fixture-archive-copy", "2026-01-01"));
+  await evaluate(`GEL.showAnswer("fixture-archive-copy", "2026-01-01")`);
+  const fq = await panel();
+  verdict(4, 'fixture row with copy "archive" (fixture-archive-copy on 2026-01-01) is an in-force panel with the archive label (story 06)', [...eqs([["state", fq.state, "plain"], ["link", fq.link && fq.link.text, "Archive copy, not the official text (opens in a new tab)"]])]);
 }
 
 // ---------- AC5: load failure and slow load ----------
@@ -643,7 +653,8 @@
   await open("ok");
   const html = fs.readFileSync(path.join(webDir, "index.html"), "utf8");
   const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((m) => new URL(m[1], base + "/").pathname);
-  const want = ["/", "/style.css", ...scripts, "/law-data.json"].sort();
+  const sheets = [...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+\.css)["']/gi)].map((m) => new URL(m[1], base + "/").pathname);
+  const want = ["/", ...sheets, ...scripts, "/law-data.json"].sort();
   const got = requests.slice(navFrom).filter((r) => r.path !== "/favicon.ico").map((r) => (r.path === "/index.html" ? "/" : r.path)).sort();
   console.log(`  load requested: ${got.join(" ")}`);
   verdict(8, "the load requested only index.html, the stylesheet, one request per script and the data file", got.join(" ") === want.join(" ") ? [] : [`want ${want.join(" ")}`]);```

## Acceptance criteria

Each result is a PASS line of `check.mjs` (run above) unless it says otherwise. A pass proves the checked case, nothing more.

1. Link only. PASS `06-ac1` for ae-dl-11-2024-climate and ag-eccb-climate-risk-standard on 2025-06-01: V1 and one "Official source (opens in a new tab)" link to `official_url`. The case printed beside it: `law_in_force(place="AE", date="2025-06-01", ref="origin/history")` gives case `links_only`. AG gives case None (a mixed place), which the story does not tie to `links_only`.
2. Before the first version. PASS `06-ac2`: CSRD on 2022-12-31 is V2 naming 2023-01-05; pressing Enter on the focused "Show 2023-01-05" button sets the date field, the panel reads in force with commit 8960295fa, `document.activeElement` is `#date`. BJ on 1999-02-11 is V2 naming 1999-02-12; `law_in_force("BJ", "1999-02-11")` gives `before_record_starts`, first record 1999-02-12. See the difference note on "publication date" below.
3. Repealed. PASS `06-ac3`: ax-biodrivmedel-ghg-lag-2018-41 shows "Repealed on 2025-11-01" and the message on 2025-11-01 and the in-force panel on 2025-10-31; gn-arrete-2022-1646-evaluations-environnementales shows its message with the quotes intact on 2023-05-05 and commit 326e95c44 on 2023-05-04; ie-si-490-2012 (and ie-si-755-2020) on 2024-09-19 show no message element and no "undefined"; fi-paastokauppalaki-2011 on 2024-01-01 shows the message of the row the repealed interval's commit names (61850073d, the Finnish row) and not its same-day sibling cc95dac5c, whose text differs. "In two builds" was not run: both builds are one page and one data file, so the check reads the two rows from the data and compares.
4. Not yet in force. PASS `06-ac4`: kg-climate-law-104 on 2026-06-01 is V4 naming 2027-01-01, on 2027-01-01 plain with commit 17c2c0302, on 2026-12-31 V4 with the later line. The data holds 5 entries whose first interval starts after 2026-11-17, the five the story names.
5. No match. PASS `06-ac5` with `GEL.showNoMatch("Sarbanes-Oxley", "2025-06-01")` called directly: the exact sentence, a "Browse by place" link with href `#browse-by-place` (the id exists on the page), no `target`, reached from `#example` with Tab, Enter leaves the hash in the same tab. 0 of 1404 entries match "sarbanes-oxley" in title, id, citation or alias. The Enter key in the law box is not covered: the box is read-only on this base. The integration run after the merge must cover it.
6. Date not recorded. PASS `06-ac6`: BJ on 2000-01-01 and on 1999-02-12 show V6 in place of "In force since"; on 1999-02-11 V2; CSRD on 2025-06-01 shows no V6. `law_in_force("BJ", "2000-01-01")` gives case None with the BJ act in force, `date_basis` "publication", 1999-02-12.
7. Later than the corpus. PASS `06-ac7`: with read_on 2026-11-17, 2026-11-18 shows the exact sentence in V1, V3, V4, V6 and the ordinary in-force answer; 2026-11-17 shows none; kg-ghg-emission-law-71 on 2027-06-01 shows "Repealed on 2027-01-01" with the line, and on 2027-01-01 too. The line is never shown in V5. V2 cannot show it (see differences). Grep over `web/*.js`: one `new Date`, in `web/dates.js`; no Date.parse, Temporal or toISOString (PASS `06-ac7` and the base AC6 grep).
8. Label rule. PASS `06-ac8` on the fixture: a row with `copy: "archive"` and a web.archive.org `source_url` reads "Archive copy, not the official text" with the row's URL plus "Official source" with the entry's `official_url`; CSRD (no `copy`) reads "Official text" and the source row stays hidden. A real run shows 0 such rows (recount below), so the rule is tested on the fixture only. This goes in the PR text.
9. All six variants. PASS `06-ac9`: each keeps the file's notice and the "Date asked" and "Corpus read" pair; every external link has target _blank, rel noopener and ends "(opens in a new tab)"; the hidden sentence changes with each draw; no red, no "!", no svg, img or role=alert in any panel; 9 resource entries before and 9 after drawing the six (no request). Not run, by hand later: Lighthouse accessibility on each of the six variants (needs a download), VoiceOver. Both boxes stay unticked. The Network panel was not opened; the resource-entry count and the base AC8 server-log check stand in for it.
10. The FR20 table and the six strings. PASS `06-ac10`: the page source holds the six strings plus the later line, and no sentence says a law does not exist without the qualifier (grep: the only "exist" is V5, which carries "this does not mean no such law exists"). The table is below.
11. Application line. PASS `06-ac11`: ESRS on 2023-12-25 plain with "Duties start to apply on 2024-01-01." and the note; on 2024-01-01 "Duties apply from 2024-01-01."; EUDR on 2026-11-17 "Duties start to apply on 2026-12-30." with its note in full, and on 2026-12-30 "Duties apply from"; CSRD none; eu-avr-2018-2067 (no note) shows the line and no note element; all 17 entries with `applies_from`, on each of their interval dates, match the data. `tools/law.py EU <date> --ref origin/history` prints the same wording beside it (below).

Also PASS `06-inject` (a message with quotes, `<b>` and `&` shows as written, no element made; typed V5 text the same) and `06-sweep`: 8081 (entry, date) pairs over 1404 entries (each interval start, the day before each, 1000-01-01 and 2099-12-31): V2 1692, plain 5219, V1 1106, V3 34, V6 20, V4 10; variant, visibility, text, links, commit, no "undefined".

### FR20 table (the paste for the PR)

| EMPTY_CASES key (per place) | Page variant (per law) | Example | Sentence |
|---|---|---|---|
| place_not_in_register | V5 no match | "Sarbanes-Oxley" on 2025-06-01 | No law in the corpus matches "Sarbanes-Oxley"; this does not mean no such law exists. |
| links_only | V1 link only | ae-dl-11-2024-climate on 2025-06-01 | The corpus stores no text of this law, only a link to it, so it cannot say which version applied on 2025-06-01. |
| before_record_starts | V2 before the first version | eu-csrd-2022-2464 on 2022-12-31 | The earliest stored version of this law starts on 2023-01-05, after 2022-12-31; the corpus has no record that early, and the law may still have been in force. |
| nothing_in_force | V3 repealed, V4 not yet in force (no live place and date reaches the key itself) | ax-biodrivmedel-ghg-lag-2018-41 on 2025-11-01; kg-climate-law-104 on 2026-06-01 | Repealed on 2025-11-01, then the record's message; This law was not yet in force on 2026-06-01; its first stored version starts on 2027-01-01. |
| registered_no_instruments | no sentence (no entry to find) | | |
| no_stored_text | no sentence (0 live entries) | | |

The sixth sentence, V6 (in-force date not recorded), is not an EMPTY_CASES key: BJ on 2000-01-01, "The corpus does not record when this version entered into force; 1999-02-12 is the date it was published, so it may have started later."

## Recounts

Live values on `origin/history` 55c8c2a9c, read-on 2026-11-17, from `python3.13 -I` probes of `web/law-data.json` and `tools/query.py` (full list with commands: `~/.cache/gel34-chrome/story-06/recounts.md`, not committed). No number differs from the story.

| Count | Story | Live |
|---|---|---|
| entries in the data file | 1404 | 1404 |
| instruments with a version row | 851 | 851 |
| link-only entries | 553 (86 places with 363, 81 mixed places with 190) | 553 (same split) |
| instruments starting after read_on | 5 | 5 (same ids, all adopted) |
| repeal rows, instruments, with message | 21, 17, 19 | 21, 17, 19 |
| repeals dated after read_on | 2 | 2 (kg-ghg-emission-law-71, br-bcb-res-139-2021) |
| rows with date_basis, instruments | 11, 10 | 11, 10, all "publication" |
| rows with copy archive, rows | 0, 3360 | 0, 3360 |
| entries with applies_from, without applies_note | 17, 4 | 17, 4 |
| entries matching "sarbanes-oxley" | 0 of 1404 | 0 of 1404 |

Two values the story does not give: 20 intervals carry `not_yet_applying`, on 15 entries; the application line wording of `tools/law.py` is on its lines 60 to 62, not 61 to 64.

`tools/law.py EU 2023-12-25 --ref origin/history` prints "note eu-esrs-2023-2772: in force on this date; duties not yet applying, they apply from 2024-01-01 (Applies to financial years starting on or after this date; phased by company size.)". On 2024-01-01 it prints "duties apply from 2024-01-01". On 2026-11-17 it prints EUDR "duties not yet applying, they apply from 2026-12-30". CSRD has no note line on any of those dates. The page matches each.

Without `--ref`, `query.py` and `law.py` read the local `history` branch (c76381e2f), which is stale. Every "printed beside it" check must pass `--ref origin/history`.

## Differences from the story

1. The later line cannot show in V2. V2 needs a date before the first interval, and a V2 law starts on or before read_on, so the date is before read_on. The story says V1 to V4; V2 is impossible by construction, and the check asserts that V2 (CSRD on 2022-12-31) shows no later line.
2. BJ on 1999-02-11: the story says V2 "naming 1999-02-12 as its publication date". The V2 sentence is one of the fixed six and says only that the earliest stored version starts on 1999-02-12. The V6 sentence on that date says it is the publication date. I kept the six strings as written.
3. The later line also shows on the ordinary in-force answer when the date is after read_on (UX spec: "This includes the default date, today"). The story lists V1 to V4 and V6 only.
4. The "Date asked" and "Corpus read" pair and the snapshot line moved out of `#answer-plain` to the panel level, because AC9 asks for the pair in all six variants including V5.
5. `web/law-data.json` was built once with `--read-on 2026-11-17`; every date test uses that read date, not the day the file was built.

## What is left

1. Enter in the law box with text that matches nothing (story 05 calls `GEL.showNoMatch`). Integration run after the merge.
2. Lighthouse accessibility on each of the six variants, VoiceOver: not run, by hand later.
3. Apply the `check.mjs` patch above (or an equivalent) so the 9 base checks agree with this story.
4. After the merge, run once with stories 07 and 08 in place: the rail after `GEL.showNoMatch` (no hook is called, so it keeps the last law's versions) and the citation on a V6 answer (state is plain, so story 08 will show it).

## What Varun must decide

1. Should the V2 sentence say "publication date" for a law like BJ whose first row has `date_basis`? It would be a seventh string. Today it does not.
2. Is the later line wanted on the ordinary in-force answer (I added it, per the UX spec)? Say no and it is one condition in `answer.js`.
3. Should V4 (not yet in force) offer a "Show 2027-01-01" button like V2 does? The story names the offer for V2 only.
4. Should the rail clear itself after V5? It needs a signal that `showNoMatch` does not send today.

## Changes to seams

- `GEL.showNoMatch(text, date)` is new (answer.js). It sets `#answer-panel` `data-state="no-match"`, removes `data-id` and `data-commit`, sets `data-date`, hides the title and status, shows `#answer-interim`, and updates the hidden sentence. It calls no `GEL.onAnswer` hook (there is no entry for one to read), and it does not touch `GEL.chosen` or the law box. Story 05: after Enter with no match, a later date change redraws the chosen law if `GEL.chosen` is still set; clear it if that is not wanted. Story 07: the rail gets no signal.
- `GEL.classify` no longer returns the reasons `not-yet-applying`, `date-basis` and `archive-copy`; those cases return `{kind: "plain", interval, row}`. Reasons left: `link-only`, `before-first` (V2 and V4), `repealed`, `other`. `detail.state` is "plain" for V6, the not-yet-applying case and the archive copy, with `detail.row` the version row. The detail keys are unchanged (the 04b check pins them); I added none.
- Story 08: the citation shows for V6 and the archive copy, since both are plain. `#slot-citation` and `#slot-after-link` stay in `#answer-plain`.
- `index.html`: `.dates` and `[data-field="snapshot"]` now sit in `#answer-panel` after `#answer-interim`, no longer inside `#answer-plain`. New fields: `applies`, `applies-note`, `source-row` with `source` (in `#answer-plain`), `later` (panel level). `#answer-interim` stays a `<p>`; its children carry `data-part` (text, message, offer, source, browse). One `<link rel="stylesheet" href="variants.css">` line is added after `style.css`.
- `[data-field="status"]` is visible for V3 ("Repealed on ...") as well as plain answers.
- `GEL.interim.render({entry, date, reason, data, text})`: `reason` may be "no-match" (uses `text`); it fills the V3 status line itself. `GEL.interim.v6(published)` and `GEL.interim.later(readOn)` are new helpers.
- Hidden sentence: unchanged for an ordinary answer. V6, the application line and the later line are appended after a space (exact forms are pinned in `06-variants.mjs`).
- `check.mjs`: the base AC8 request list names `/style.css` only. Every story that adds a stylesheet (this one, and any other with a `<feature>.css`) trips it; the patch above reads the `<link>` tags instead.
- New token needs: none. No colour is written in `variants.css`.

## Report

Story 06 is built and every criterion this Mac can run passes: 60 new browser checks all pass, `wcag.py` says ok and pytest gives 450 passed with 1 deselected. The run prints `check.mjs: 125 passed, 9 failed`. The 9 are story 04 checks that assert the interim sentence and the one-stylesheet request list, which this story replaces; with them patched in a copy the run is 134 passed, 0 failed. Left: the Enter path in the law box, Lighthouse on the six variants and VoiceOver, all for later.

## Next

Apply the check.mjs patch from this report in the merge commit.
Merge story 05 before running the Enter path with text that matches nothing.
Run Lighthouse on the six variants by hand and tick the box.
Decide the four questions under "What Varun must decide".
Run the full browser check once after all five branches are merged.
