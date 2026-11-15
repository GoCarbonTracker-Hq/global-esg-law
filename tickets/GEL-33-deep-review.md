# GEL-33: deep review report

Run date: 2026-11-15. Commit: `e7951bd11` (`main`). `origin/history`: `745289cde` (3,240 commits; trails `main` by 7 records).

## Baseline

| Check | Claim (manual / CHANGELOG) | Observed (2026-11-15) | Notes |
|---|---|---|---|
| `python3 -V` | `>= 3.11` (3.15.2 local) | `Python 3.15.2` | `python3 -m pytest` failed (`No module named pytest` on 3.15); `/opt/homebrew/bin/pytest` ran on `3.14` |
| `python3 tools/law.py GB 2023-01-01 --ref origin/history` | 3+ lines | 3 lines (`gb-ca2006-s414a-414d`, `gb-ca2006-s414cb`, `gb-uksi-2022-31`), exit 0 | — |
| `pytest -q` | `260 passed` | `260 passed in 141.56s`, exit 0 | — |
| `python3 tools/check_corpus.py` | `3247 records checked` | `3247 records checked`, exit 0 | `MAINTAINING.md:43` still says `3240` |
| `python3 tools/publish_gate.py` | exit 0 | exit 0 | — |

---

## Findings (severity-ordered, new first)

### F2-2 · `check_corpus.py`, `publish_gate.py`, and `update.py` use last-row-wins dict lookup for duplicate `source_id`s
- **Severity:** S1
- **Where:** `tools/check_corpus.py:19` (`check`), `tools/publish_gate.py:14` (`gate`), `tools/update.py:259` (`update`), `tools/build.py:41` (`build`)
- **Claim:** All four build `rows = {r["id"]: r for r in json.loads(...)}`, silently overwriting earlier rows with the last row for any duplicate `id`. If a `source_id` has an earlier `fail` or `unknown` row and a later `pass` row, all gates pass and `update.py` stores records. (The live `sources.json` currently has 21 duplicate `id`s across 757 rows, all 21 pairs currently identical.)
- **Why it matters:** Combined with `licence_recheck.py` flipping only the first matching row in `sources/licence-table.csv` (`#17` T4, still live), a withdrawn licence still passes `check_corpus.py`, `publish_gate.py`, and `update.py`.
- **Reproduce:**
  ```sh
  python3 -c '
  import json, sys, tempfile
  from pathlib import Path
  sys.path.insert(0, "tools")
  import check_corpus, publish_gate
  with tempfile.TemporaryDirectory() as tmp:
      r = Path(tmp)
      (r / "register" / "XX").mkdir(parents=True)
      (r / "records" / "XX" / "act").mkdir(parents=True)
      (r / "sources.json").write_text(json.dumps([
          {"id": "S1", "verdict": "fail", "form": "adopted", "publisher": "Pub", "source_name": "Src"},
          {"id": "S1", "verdict": "pass", "form": "adopted", "publisher": "Pub", "source_name": "Src"},
      ]))
      (r / "register" / "XX" / "scope.json").write_text(json.dumps([{"id": "act", "title": "Act", "status": "stored", "source_row": "S1"}]))
      (r / "records" / "XX" / "act" / "2020-01-01-adopted-en.json").write_text(json.dumps({"source_id": "S1", "in_force": "2020-01-01", "kind": "adopted", "language": "en", "text": "law"}))
      print("F2-2 check_corpus:", check_corpus.check(r), "publish_gate:", publish_gate.gate(r)[1])
  '
  # Observed:
  # F2-2 check_corpus: 1 publish_gate: []
  ```
- **Known:** new (related to `#17` T3/T4 still live)
- **Confidence:** reproduced
- **Suggested fix:** Group `sources.json` rows by `id` in `check_corpus.py`, `publish_gate.py`, `update.py`, and `build.py`, and refuse any `id` used by a stored record that has more than one distinct row or any non-`pass` verdict.

### F2-3 · `acceptance_mcp.py` lacks a negative check for a licence-denied stored record and passes if `link only` `read_text` leaks `text`
- **Severity:** S1
- **Where:** `tools/acceptance_mcp.py:32-34` (`has`), `tools/acceptance_mcp.py:120-121` (`CHECKS["read_text"]`)
- **Claim:** The only non-serving `read_text` check in `acceptance_mcp.py` targets `AE_ID` (`link only`, no record in `history`) using `has(AE_URL, "not stored")`, which only checks substring presence in `json.dumps(answer).lower()` and never asserts `answer.get("text") is None`. There is no check at all for a stored record in `history` whose `sources.json` verdict is non-`pass` (`fail`, `unknown`, `permission requested`, or missing).
- **Why it matters:** A broken MCP server that leaks `text` alongside `"official_url"` and `"not stored"` in `reason`, or that serves text for a `fail`/`unknown` stored record, passes `acceptance_mcp.py`.
- **Reproduce:**
  ```sh
  python3 -c '
  import sys
  sys.path.insert(0, "tools")
  import acceptance_mcp
  leaked = {"text": "LEAKED PROPRIETARY TEXT", "official_url": acceptance_mcp.AE_URL, "reason": "not stored"}
  chk = [c for c in acceptance_mcp.CHECKS["read_text"] if c[0].startswith("link-only")][0][3]
  print("F2-3 problems:", chk(leaked))
  '
  # Observed:
  # F2-3 problems: []
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** Assert `answer.get("text") is None` in the `AE_ID` `read_text` check and add an acceptance case on a mutated temp clone where a stored record's `sources.json` verdict is non-`pass` and `read_text` must withhold `text`.

### F4-1 · `update.py` leaves `queue.csv` marked `stored` and 4 staged files on `main` when `git commit` fails
- **Severity:** S1
- **Where:** `tools/update.py:398-409` (`update`)
- **Claim:** If `git commit` fails after `records/...`, `register/<iso2>/scope.json`, `SOURCES.md`, and `upkeep/queue.csv` are staged on `upkeep/<iso2>-<instrument>-<in_force>`, the `finally:` block checks out `original` (`main`) with the 4 staged files still in the index and skips `queue_path.write_bytes(notes_in_tree)`. As a result, `upkeep/queue.csv` on `main` is marked `outcome="stored"` even though no commit occurred, an orphan branch remains, and subsequent `update.py` runs fail.
- **Why it matters:** A reviewer or operator sees `outcome="stored"` in `upkeep/queue.csv` on `main` when no commit exists on any branch, and `main`'s index is left dirty so all further `update.py` runs abort.
- **Reproduce:**
  ```sh
  /opt/homebrew/opt/python@3.14/bin/python3.14 -c '
  import tempfile, subprocess, sys
  from pathlib import Path
  sys.path.insert(0, "tests"); sys.path.insert(0, "tools")
  import test_update, update
  with tempfile.TemporaryDirectory() as d:
      repo = Path(d)
      test_update.make(repo)
      hook = repo / ".git" / "hooks" / "pre-commit"
      hook.write_text("#!/bin/sh\nexit 1\n")
      hook.chmod(0o755)
      try:
          update.update(repo, fetch=test_update.FakeFetch(), today=test_update.TODAY, row=test_update.EU_KEY)
      except subprocess.CalledProcessError as e:
          print("Case B commit failed:", e.returncode)
      print("Case B branch:", test_update.git(repo, "rev-parse", "--abbrev-ref", "HEAD"))
      print("Case B branches:", test_update.git(repo, "branch"))
      print("Case B status:\n" + test_update.git(repo, "status", "--short"))
      try:
          update.update(repo, fetch=test_update.FakeFetch(), today=test_update.TODAY, row=test_update.EU_KEY)
      except ValueError as e:
          print("Case B retry error:", str(e).splitlines()[0])
  '
  # Observed:
  # Case B commit failed: 1
  # Case B branch: main
  # Case B branches: * main
  #   upkeep/EU-eu-act-2027-01-01
  # Case B status:
  # M  SOURCES.md
  # A  records/EU/eu-act/2027-01-01-consolidated-en.json
  # M  register/EU/scope.json
  # M  upkeep/queue.csv
  # Case B retry error: no confirmed new_version row 'eu-cellar:2027-01-01' in upkeep/queue.csv (nor a confirmed repealed row)
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** On `git commit` failure inside `try/except`, reset the index/working tree for `paths`, delete the empty `branch`, and restore `notes_in_tree` on `original` before re-raising.

### F1-1 · `_version()` only prefers `consolidated` over `adopted` when both share the same language, and same-language `translation` overwrites `consolidated`
- **Severity:** S2
- **Where:** `tools/query.py:70-76` (`_version`)
- **Claim:** Documented rule: on the same date, `consolidated` takes precedence over `adopted`, and `translation` is never chosen as the official record when a non-translation exists. Instead, `_version()` relies on `by_lang[c.get("language")] = c` overwriting `adopted` with `consolidated` in commit order. If `adopted` and `consolidated` on the same date have different languages, both remain in `by_lang` and `official` picks `ordered[0]` (`adopted` if its language sorts earlier). If `consolidated` and `translation` share the same language, `translation` overwrites `consolidated` in `by_lang`.
- **Why it matters:** A multilingual jurisdiction with an `adopted` text in one official language and a `consolidated` text in another on the same date would return the `adopted` text; a same-language `translation` would replace `consolidated`. (0 collisions in the current 3,240-commit `history` branch.)
- **Reproduce:**
  ```sh
  python3 -c '
  import sys; sys.path.insert(0, "tools"); import query
  recs_a = [
      {"id": "x", "in_force": "2024-01-01", "kind": "adopted", "language": "de", "commit": "c1"},
      {"id": "x", "in_force": "2024-01-01", "kind": "consolidated", "language": "fr", "commit": "c2"},
  ]
  print("F1-1 diff-lang:", query._version(recs_a, None)[0]["kind"], query._version(recs_a, None)[0]["language"])
  recs_b = [
      {"id": "x", "in_force": "2024-01-01", "kind": "consolidated", "language": "en", "commit": "c1"},
      {"id": "x", "in_force": "2024-01-01", "kind": "translation", "language": "en", "commit": "c2"},
  ]
  print("F1-1 same-lang:", query._version(recs_b, None)[0]["kind"], query._version(recs_b, None)[0]["language"])
  '
  # Observed:
  # F1-1 diff-lang: adopted de
  # F1-1 same-lang: translation en
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** Sort `ordered` by kind priority (`consolidated` < `adopted` < `translation`) before selecting `official`, and prevent `translation` from overwriting non-translation records in `by_lang`.

### F1-2 · `lookup()` compares `on` as an unvalidated string, misordering unpadded dates and accepting invalid dates
- **Severity:** S2
- **Where:** `tools/query.py:88-100` (`lookup`)
- **Claim:** Dates should be real `YYYY-MM-DD` calendar dates. `lookup()` never validates or parses `on` and compares `c["in_force"] <= on` as raw strings. Unpadded `"2026-1-1"` sorts lexicographically after `"2026-09-30"` and before `"2026-10-01"`, invalid `"2023-02-29"` and `""` succeed silently, and `None` or `datetime` raises `TypeError`.
- **Why it matters:** Direct callers of `query.lookup()` or `query.in_force()` with `"2026-1-1"` receive laws commencing up to September 2026 instead of January 2026; invalid calendar dates like `"2023-02-29"` silently return results.
- **Reproduce:**
  ```sh
  python3 -c '
  import sys; from datetime import datetime; sys.path.insert(0, "tools"); import query
  for v in ["2024-02-29", "2023-02-29", "2026-1-1", "0001-01-01", "2026-12-31", "", None, datetime(2026, 1, 1)]:
      try:
          f, ny, first = query.lookup("EU", v)
          print(repr(v), "->", len(f), len(ny), first)
      except Exception as e:
          print(repr(v), "->", type(e).__name__, e)
  '
  # Observed:
  # '\''2024-02-29'\'' -> 10 12 2019-12-29
  # '\''2023-02-29'\'' -> 7 13 2019-12-29
  # '\''2026-1-1'\'' -> 15 1 2019-12-29
  # '\''0001-01-01'\'' -> 0 16 2019-12-29
  # '\''2026-12-31'\'' -> 16 0 2019-12-29
  # '\'''\'' -> 0 16 2019-12-29
  # None -> TypeError '\''<='\'' not supported between instances of '\''str'\'' and '\''NoneType'\''
  # datetime.datetime(2026, 1, 1, 0, 0) -> TypeError '\''<='\'' not supported between instances of '\''str'\'' and '\''datetime.datetime'\''
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** Validate `on` with `_valid_date(on)` at the start of `lookup()` and raise `ValueError` on invalid input.

### F2-4 · `query.py` (`b011a1b5b`) compares only `verdict` across duplicate `source_id` rows, suppressing ambiguity in licence URL, terms, or place
- **Severity:** S2
- **Where:** `tools/query.py:386-395` (`read_text`)
- **Claim:** Commit `b011a1b5b` states "identical pass rows for one source id are not ambiguous", but `read_text()` only checks `verdicts = {r.get("verdict") for r in matches}` and `verdicts != {"pass"}`. Two `pass` rows sharing a `source_id` that differ in `terms_url`, `terms_quote`, `statute_exception`, `verdict_basis`, `trailer_licence`, `jurisdiction`, or `form` are treated as unambiguous and `read_text()` serves the text.
- **Why it matters:** Conflicting licence terms, URLs, or jurisdictions under a shared `source_id` are silently served instead of withholding text as ambiguous.
- **Reproduce:**
  ```sh
  python3 -c '
  import json, subprocess, sys, tempfile
  from pathlib import Path
  sys.path.insert(0, "tools")
  import build, query
  with tempfile.TemporaryDirectory() as tmp:
      r = Path(tmp)
      (r / "register" / "XX").mkdir(parents=True)
      (r / "records" / "XX" / "act").mkdir(parents=True)
      (r / "sources.json").write_text(json.dumps([
          {"id": "S1", "verdict": "pass", "form": "adopted", "publisher": "Pub", "source_name": "Src", "jurisdiction": "XX", "terms_url": "https://a.example/terms", "terms_quote": "CC BY 4.0", "trailer_licence": "CC BY 4.0", "trailer_instrument": "Act", "trailer_source_url": "https://a.example/act"},
          {"id": "S1", "verdict": "pass", "form": "adopted", "publisher": "Pub", "source_name": "Src", "jurisdiction": "YY", "terms_url": "https://b.example/terms", "terms_quote": "All rights reserved", "trailer_licence": "Other", "trailer_instrument": "Act", "trailer_source_url": "https://b.example/act"},
      ]))
      (r / "register" / "XX" / "scope.json").write_text(json.dumps([{"id": "act", "title": "Act", "status": "stored", "source_row": "S1", "official_url": "https://a.example/act"}]))
      (r / "records" / "XX" / "act" / "2020-01-01-adopted-en.json").write_text(json.dumps({"source_id": "S1", "in_force": "2020-01-01", "kind": "adopted", "language": "en", "text": "SERVED TEXT"}))
      subprocess.run(["git", "init", "-q", str(r)], check=True)
      subprocess.run(["git", "-C", str(r), "config", "user.email", "t@t.invalid"], check=True)
      subprocess.run(["git", "-C", str(r), "config", "user.name", "t"], check=True)
      subprocess.run(["git", "-C", str(r), "add", "."], check=True)
      subprocess.run(["git", "-C", str(r), "commit", "-q", "-m", "init"], check=True)
      build.build(r, branch="history")
      ans = query.read_text(r, "act", "2020-01-01", ref="history")
      print("F2-4 text:", ans.get("text"), "reason:", ans.get("reason"))
  '
  # Observed:
  # F2-4 text: SERVED TEXT reason: None
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** Deduplicate `matches` by full row equality (e.g. `unique = {json.dumps(r, sort_keys=True) for r in matches}`) and withhold if `len(unique) != 1` or `matches[0].get("verdict") != "pass"`.

### F2-5 · `publish_gate.py` checks `scope.json` `source_row` instead of each record's `source_id`, and ignores orphan records
- **Severity:** S2
- **Where:** `tools/publish_gate.py:27-54` (`gate`)
- **Claim:** `gate()` only iterates `register/*/scope.json` and checks the verdict of `e.get("source_row")` without checking `record.get("source_id")` against `source_row` or `sources.json`. It also never walks `records/` directly, so orphan record files for instruments absent from `scope.json` are ignored.
- **Why it matters:** Run standalone, `publish_gate.py` exits 0 even when a record file carries a `fail` `source_id` under a `pass` `scope.json` entry, or when orphan record files sit in `records/`.
- **Reproduce:**
  ```sh
  python3 -c '
  import json, sys, tempfile
  from pathlib import Path
  sys.path.insert(0, "tools")
  import publish_gate, check_corpus
  with tempfile.TemporaryDirectory() as tmp:
      r = Path(tmp)
      (r / "register" / "XX").mkdir(parents=True)
      (r / "records" / "XX" / "act").mkdir(parents=True)
      (r / "records" / "XX" / "orphan").mkdir(parents=True)
      (r / "sources.json").write_text(json.dumps([
          {"id": "PASS", "verdict": "pass", "form": "adopted", "publisher": "Pub", "source_name": "Src"},
          {"id": "FAIL", "verdict": "fail", "form": "adopted", "publisher": "Pub", "source_name": "Src"},
      ]))
      (r / "register" / "XX" / "scope.json").write_text(json.dumps([{"id": "act", "title": "Act", "status": "stored", "source_row": "PASS"}]))
      (r / "records" / "XX" / "act" / "2020-01-01-adopted-en.json").write_text(json.dumps({"source_id": "FAIL", "in_force": "2020-01-01", "kind": "adopted", "language": "en", "text": "law"}))
      (r / "records" / "XX" / "orphan" / "2020-01-01-adopted-en.json").write_text(json.dumps({"source_id": "FAIL", "in_force": "2020-01-01", "kind": "adopted", "language": "en", "text": "law"}))
      print("F2-5 publish_gate:", publish_gate.gate(r)[1])
      try:
          check_corpus.check(r)
      except ValueError as e:
          print("F2-5 check_corpus:", e)
  '
  # Observed:
  # F2-5 publish_gate: []
  # F2-5 check_corpus: records/XX/act/2020-01-01-adopted-en.json: source FAIL verdict is 'fail', not 'pass'
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** Have `publish_gate.py` also check each record's `source_id` against `sources.json` and `scope.json` (or invoke `check_corpus.check()`).

### F3-1 · `tools/coverage.py` silently drops 152 `stored` scope entries from the `COVERAGE.md` grid due to `(iso2, title)` join mismatch
- **Severity:** S2
- **Where:** `tools/coverage.py:155-158` (`build`), `tools/coverage.py:176-177`
- **Claim:** `coverage.py` joins `register/register.csv` to `register/<ISO2>/scope.json` by exact `(iso2, title)` string equality (`scope_by_title.get((iso2, row["instrument_title"]))`). Across the corpus, 324 of 1,379 scope entries—including 152 with `status: "stored"`—do not match any row in `register.csv` by `(iso2, title)`, so `coverage.py` sets `facts = None` and renders those grid cells as `link only · unchecked` even when stored records exist on disk.
- **Why it matters:** Users reading the `COVERAGE.md` grid see stored jurisdictions (such as `AZ`, which has 7 stored scope entries) reported as `link only · unchecked`.
- **Reproduce:**
  ```sh
  python3 -c '
  import csv, json
  from pathlib import Path
  reg_titles = {(r["iso2"], r["instrument_title"]) for r in csv.DictReader(open("register/register.csv"))}
  stored_miss = []
  for p in sorted(Path("register").glob("*/scope.json")):
      iso2 = p.parent.name
      for e in json.loads(p.read_text()):
          if e.get("status") == "stored" and (iso2, e.get("title")) not in reg_titles:
              stored_miss.append((iso2, e.get("id")))
  print("F3-1 stored_miss:", len(stored_miss), "sample:", stored_miss[:3])
  ' && rg -n "\| AZ \|" COVERAGE.md
  # Observed:
  # F3-1 stored_miss: 152 sample: [('AO', 'ao-eia-licensing-regulation-2020'), ('AO', 'ao-single-use-plastics-regulation-2025'), ('AR', 'ar-ley-27520')]
  # 325:| AZ | Azerbaijan | A · official_text_seen · link only · unchecked | ...
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** Add a `scope_id` foreign key in `register/register.csv` or fall back to URL matching in `coverage.py` so `stored` entries are not silently dropped.

### F3-3 · `register/register.csv` has 7 duplicate `(iso2, instrument_title)` groups (19 rows across `BG`, `BW`, `LU`, `VE`)
- **Severity:** S2
- **Where:** `register/register.csv` (`BG`, `BW`, `LU`, `VE`)
- **Claim:** `(iso2, instrument_title)` is duplicated in `register.csv`: 7 duplicate groups spanning 19 rows (`BW` 4 titles × 3 rows, `BG` × 2, `LU` × 2 across `F1` and `F7`, and `VE` empty `instrument_title` × 3).
- **Why it matters:** Inflates register row counts and grid cell counts (`COVERAGE.md` counts 2,587 rows instead of 2,575 unique keys).
- **Reproduce:**
  ```sh
  python3 -c '
  import csv
  from collections import Counter
  rows = list(csv.DictReader(open("register/register.csv")))
  c = Counter((r["iso2"], r["instrument_title"]) for r in rows)
  dups = {k: v for k, v in c.items() if v > 1}
  print("F3-3 dup_groups:", len(dups), "total_rows_in_dups:", sum(dups.values()), "places:", sorted({k[0] for k in dups}))
  '
  # Observed:
  # F3-3 dup_groups: 7 total_rows_in_dups: 19 places: ['BG', 'BW', 'LU', 'VE']
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** Deduplicate the `BG` and `BW` rows and decide whether the `LU` draft belongs in `F1` only or both families.

### F4-2 · `update.py` aborts the entire batch on any mid-batch transport exception
- **Severity:** S2
- **Where:** `tools/update.py:106-118` (`default_fetch`), `tools/update.py:355` (`update`)
- **Claim:** `default_fetch` only catches `urllib.error.HTTPError`, and `update()` does not catch transport errors (`URLError`, `TimeoutError`, `IncompleteRead`, `OSError`) around `fetch(...)`. A single transient network error mid-batch aborts the loop immediately without printing the run summary; earlier rows remain committed on their branches, later rows are skipped, and retrying exits 1 because earlier rows still have `outcome="confirm"` on `main` and hit `branch ... already exists, left open`.
- **Why it matters:** A transient timeout on one source halts all remaining confirmed updates in a batch and leaves `update.py` exiting 1 on retry even after all remaining rows succeed.
- **Reproduce:**
  ```sh
  /opt/homebrew/opt/python@3.14/bin/python3.14 -c '
  import tempfile, sys, urllib.error
  from pathlib import Path
  sys.path.insert(0, "tests"); sys.path.insert(0, "tools")
  import test_update, update
  with tempfile.TemporaryDirectory() as d:
      repo = Path(d)
      test_update.make(repo)
      calls = []
      def flaky_fetch(url, headers):
          calls.append(url)
          if len(calls) == 2:
              raise urllib.error.URLError("timed out")
          return test_update.BODIES[url]
      orig = update.default_fetch
      update.default_fetch = flaky_fetch
      try:
          rc = update.main(["--repo", str(repo)])
      finally:
          update.default_fetch = orig
      print("First run exit code:", rc)
      update.default_fetch = lambda u, h: test_update.BODIES[u]
      try:
          rc2 = update.main(["--repo", str(repo)])
      finally:
          update.default_fetch = orig
      print("Retry exit code:", rc2)
  '
  # Observed:
  # <urlopen error timed out>
  # First run exit code: 1
  # ...
  # 8 rows: 3 stored, 2 refused, 3 left open (refusal notes are in upkeep/queue.csv, uncommitted)
  # Retry exit code: 1
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** Catch `(urllib.error.URLError, TimeoutError, OSError)` in `update()` per row, call `refuse(str(exc))`, and continue processing the remaining rows.

### F4-3 · `watch.py --reseed` can silently swallow a real law change
- **Severity:** S2
- **Where:** `tools/watch.py:348-370` (`reseed`)
- **Claim:** `reseed()` fetches the watcher's current signal(s) and overwrites `seen.json` without emitting any `queue.csv` row. Any real amendment or new consolidated date that appeared on the source between the previous `watch.py` run and `--reseed` is recorded as already seen and will never be flagged.
- **Why it matters:** Maintainers routinely run `--reseed` when changing a watcher's `kind` or `params.cut`; any genuine law change in that window is permanently missed.
- **Reproduce:**
  ```sh
  /opt/homebrew/opt/python@3.14/bin/python3.14 -c '
  import tempfile, json, sys
  from pathlib import Path
  sys.path.insert(0, "tests"); sys.path.insert(0, "tools")
  import test_watch, watch
  with tempfile.TemporaryDirectory() as d:
      repo = test_watch.make(Path(d))
      watch.watch(repo, test_watch.FakeFetch(), test_watch.TODAY)
      new_bodies = dict(test_watch.BODIES)
      new_bodies[test_watch.CELLAR] = (200, {}, test_watch.cellar_body(["2022-12-16", "2025-04-17", "2026-03-18", "2026-11-15"]))
      count = watch.reseed(repo, "w-cellar", fetch=test_watch.FakeFetch(new_bodies), today="2026-11-15")
      res = watch.watch(repo, test_watch.FakeFetch(new_bodies), today="2026-11-15")
      print("reseed count:", count, "subsequent watch candidates:", res["candidates"])
      print("seen w-cellar:", json.loads((repo / "upkeep/seen.json").read_text())["w-cellar"]["signals"])
  '
  # Observed:
  # reseed count: 4 subsequent watch candidates: 0
  # seen w-cellar: ['2022-12-16', '2025-04-17', '2026-03-18', '2026-11-15']
  ```
- **Known:** new
- **Confidence:** reproduced
- **Suggested fix:** For `ACCUMULATE` watchers (`date_list`, `version_list`), have `reseed()` diff against prior `signals` and emit `new_version` rows for unseen dates, or require `watch.py` to run immediately before `--reseed`.

### F4-5 · No concurrency control across `watch.py`, `queue.py`, and `update.py`
- **Severity:** S2
- **Where:** `tools/watch.py:298-343` (`watch`), `tools/queue.py:86-123` (`decide`), `tools/update.py:398-409` (`update`)
- **Claim:** None of the upkeep tools acquire any file lock (`fcntl.flock` or lockfile). `watch.py` holds `seen.json` in memory for its run and overwrites `seen.json` at the end, while `queue.py` reads `queue.csv` and rewrites it in place. Concurrent runs can silently drop queue rows, overwrite `reject` suppressions in `seen.json`, or collide on git branches/index.
- **Why it matters:** Concurrent human review and scheduled/manual `watch.py` or `update.py` runs can lose queue rows or corrupt git state.
- **Reproduce:** `grep -rn "flock\|\.lock\|fcntl" tools/ || echo "no locks found"` -> `no locks found`
- **Known:** new
- **Confidence:** read-only inference
- **Suggested fix:** Acquire an exclusive `fcntl.flock` on `upkeep/.lock` around `watch.py`, `queue.py`, and `update.py` state mutations.

---

### S3 Findings

- **F1-3 (S3)** · `tools/query.py:60-62,88,114` (`_scope`, `lookup`): `iso2` is not validated, allowing `../../` traversal outside `register/` for direct Python callers (`law.py` and `law_in_force()` validate it).
- **F1-4 (S3)** · `tools/query.py:422-427` (`instrument_history`): returns `jurisdiction: None` for link-only instruments instead of `p.parent.name`.
- **F2-6 (S3)** · `tools/check_corpus.py:47-54` (`check`): does not check `scope.json` `status`, allowing records under `link only` or `pending` entries (caught by `publish_gate.py`).
- **F2-7 (S3)** · `tools/licence_recheck.py:45-62` (`instruments_of`, `record_folders_of`): misses `record_folders_of()` matches when a record's `source_id` differs from `scope.json`, and misses `history`-only records.
- **F3-4 (S3)** · `tools/check_corpus.py:24-59`: 21 `repealed: true` record stubs omit `fetched_url` and `fetched_sha256`, and `check_corpus.py` does not validate either key on any record.
- **F3-5 (S3)** · `upkeep/watchers.json`, `upkeep/seen.json`, `upkeep/queue.csv`: 1 watcher (`ni-ley-1061-lagaceta-ediciones`) is missing from `seen.json`, and 6 watchers have never produced a `queue.csv` row.
- **F3-6 (S3)** · `register/*/scope.json`: 333 of 1,379 scope entries have `in_force: null` and 34 have empty `evidence`.
- **F5-1 (S3)** · `tools/mcp_server.py:222-230` vs `MCP.md:186`: pre-initialize request without `_meta` returns `-32602 "Missing required request metadata"` instead of `-32600 "Server is not initialized"`.
- **F5-2 (S3)** · `tools/mcp_server.py:134-145,216-229`: legacy `initialize` can be re-sent to reset `initialized`, and legacy requests silently ignore `_meta`.
- **F5-3 (S3)** · `tools/mcp_server.py:208`: fractional float request IDs (e.g. `1.5`) are accepted.
- **F5-4 (S3)** · `tools/mcp_server.py:201-202`: invalid `jsonrpc`/`method` request echoes unvalidated `id` type (e.g. `[1]`).
- **F5-5 (S3)** · `MAINTAINING.md:27,35,43`: stale counts (`3240` records vs `3247`, `259` tests vs `260`, `history` current with `main` vs `missing_records: 7`).
- **F5-6 (S3)** · `tests/test_mcp*.py`: `pytest` never runs `tools/mcp_server.py` over stdio against the real corpus (only `tools/acceptance_mcp.py` does).

### S4 Findings

- **F4-7 (S4)** · `.gitignore:1-5`: omits `.DS_Store`, leaving 3 untracked `.DS_Store` files in `.`, `records/`, and `register/`.

---

## Known issues checked (still live, one-line status)

- **#17 T1** (`tools/watch.py:319`): still live — writes `checked_on` into `seen.json` on `watch_failed`.
- **#17 T2** (`tools/watch.py:128-136`): still live — `date_list` matching 0 dates returns `[]` with `error=None`.
- **#17 T3 / T4** (`sources/licence-table.csv`, `tools/licence_recheck.py`): still live — 21 duplicate `source_id` rows in `sources.json`.
- **#17 T7 / F4-6** (`tools/watch.py:308-343`, `.github/workflows/watch.yml:18`): still live — 15-minute workflow timeout vs 42.7–58.0 min sequential runtime (12.98 h worst case), buffering all state until loop exit.
- **#17 T9 / F3-2** (`records/`): still live — 11 records have `"in_force": null`.
- **#17 T13** (`tools/update.py:79-82`): still live — `uk_consolidated` ignores `in_force`.
- **#17 T15** (`tools/queue.py:41-47`): still live — `write_queue` truncates `queue.csv` in place before `seen.json`.
- **#17 D3 / F3-7** (`README.md:153`): still live — cites `1557 watchers` for 2026-11-11 run while `watchers.json` holds `1558`.
- **#21 / GEL-32 / F2-8** (`tools/update.py:96-98`): still live — 5 fetch recipes for 271 unique `pass` `source_id`s (266 uncovered; 25 of 1,011 `pass` watchers covered); un-reciped `confirm` rows stay `open` and exit 1.
- **#16 / GEL-29 Part D**, **#18**: still live, untouched per ground rules.

---

## Coverage statement (what was deliberately not checked)

- **Records outside the 12-record live sample:** 3,235 of 3,247 records were not re-fetched or re-hashed against their live URLs (capped at 12 per manual §6; 10 matched, 2 dynamic IE HTML pages mismatched, 0 unreachable).
- **Live watcher runs:** All 1,558 watchers in `upkeep/watchers.json` were not fetched live (used `--dry-run` and `FakeFetch` stubs).
- **Places with no scope file:** 0 places in `register/register.csv` lack a `scope.json`; 110 of 250 places with scope files are link-only with 0 stored records.
- **Languages without text / licence verdicts:** Translation gaps and individual licence verdicts (`#18`) were not audited.
- **Other:** `tools/acceptance_mcp.py` end-to-end fresh-clone run, Windows `multiprocessing` timeout fallback in `tools/mcp_server.py:72-92`, and `tools/seed_register.py` were not run.

---

## Disputed (rejected by Judge pass)

- **F2-1 (proposed S1) · `publish_gate.py` only walks the working tree and never checks `history` or `origin/history` commits** — **Rejected (MISREAD):** `publish_gate.py` is a pre-publication check of the working tree, not a git-index validator (`tests/test_publish_gate.py` runs `gate()` on plain temp directories without git). `README.md:152` and `MAINTAINING.md:27` document that `history` is rebuilt by hand and trails `main`, while `query.py:read_text()` checks `sources.json` at query time. Requiring `records/` to match `HEAD` or `history` would break pre-commit runs and pull-request CI.
- **F4-4 (proposed S2) · `triage.py` `cause_of()` and `noise_rules()` suppress real amendments** — **Rejected (MISREAD):** `triage.py` decides no queue row (`triage.py:8,227` states no row is rejected until Varun approves each rule). `judge()` (`triage.py:119-124`) calls `cause_of()` only after two fetches of the same URL 300 seconds apart return different signals (`set(s1) != set(s2)`). `cause_of()` and `noise_rules()` only group already-flagged `churn` watchers for human review, and `"visible text moves"` is a diagnostic label, not an auto-reject rule.

---

## Advisory, out of scope

- No lint or type checker is configured in `.github/workflows/tests.yml` (deliberate under stdlib-only policy).
- `list_places` (no argument) is at 28,869 chars out of the 30,000-char target (`MCP.md:52`).
- Replacing sequential `urllib.request` in `tools/watch.py` with stdlib `concurrent.futures.ThreadPoolExecutor` and using `os.replace()` for `queue.csv`/`seen.json` writes would reduce runtime and crash risk without external dependencies.
