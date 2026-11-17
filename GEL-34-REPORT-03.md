# GEL-34 story 03 report

- Model: claude-sonnet-5-5
- Python: 3.13.18 (3.11 not run: no pytest there in earlier containers)
- BASE: 809333ffafe145c39dfde6b26ecc41061ad0b34c (story 01 tip f53d11a5 + story 12 merge)
- Refs: origin/main 0b93d75374ebf99749486a24ccf9fa217067a2b8; origin/history 55c8c2a9c1d8fdbb40fd2d5334ac397b743d76e7 (fetched, it was missing at start)

## Plan (written before any edit)

The pieces share one scope fixture and the same two test files, so I wrote them in sequence myself and used no subagents (a second writer per file would add hand-offs on files of about 30 lines each).

| Piece | Deliverable | Files | Check that proves it done |
|---|---|---|---|
| 1 | `check_aliases(repo, iso2)` called from `check`, beside `check_amends` | `tools/check_corpus.py` | parametrised refusals on a link-only entry with no record pass; no-key and `["CBAM","EU ETS"]` pass |
| 2 | One-off fill, run once from the scratchpad, edits text lines only | `register/*/scope.json` (45 entries) | `git diff --numstat BASE -- register` shows 0 deleted; `check_corpus.py` still 3360 |
| 3 | Hand list: CBAM, EU ETS, ECGT | `register/EU/scope.json` | real-data pytest on EU scope |
| 4 | Builder proof on a real `--ref origin/history` build | `tests/test_web_data.py` | pytest loads the written file |
| 5 | CHANGELOG line, this report | `CHANGELOG.md`, report | read back |

Deviation from the method: no subagents. Five small pieces on four files that share one fixture; hand-offs would have cost more than the writing.

## What I did

- `tools/check_corpus.py`: `check_aliases(repo, iso2=None)`, called in `check` after `check_amends`. It reads every `register/<iso2 or *>/scope.json` entry, so link-only entries are reached. Message form: `register/XX/scope.json: <id>: aliases ...`.
- Fill run once from the scratchpad (not committed), text insert of one `"aliases": [...]` line after each `"title"` line with its indent; no `json.dump`.
- Hand list on `register/EU/scope.json`, same text insert.
- Tests: 14 in `tests/test_check_corpus.py` (13 refusal cases on a link-only entry with no record, pass cases, shared form, `iso2`, real-data checks) and 1 in `tests/test_web_data.py` (real `--ref origin/history` build written to `--out`). One CHANGELOG line. `tools/query.py` unchanged.

## Fill rule (run once)

Round brackets in `title`: the content is one token, no whitespace, `/` or `.`, at least 2 uppercase letters, and not EU, UE, ΕΕ (Greek), EC or NI. Every matching bracket of a title counts (not the first one only; eu-csrd-2022-2464 has "(EU)" then "(CSRD)" and reads CSRD). Shared forms are held back from the script and decided by the hand split below.

Printed counts, live 2026-11-17:

```
matched entries: 60 stored: 42 link only: 18 other: 0
distinct short forms: 47 ; entries with 2+ forms: 0
shared short forms: 8 on 21 entries
```

Difference from the story: the story's "the script then writes 39" counts the 60 minus the 21 entries on shared forms. With the confirmed split (KSG 2, UWG 2, CSRD 1, EUDR 1 = 6 entries) the fill writes 45 entries. Total entries with `aliases`: 45 + 3 hand = 48; distinct forms 43 + 3 = 46.

## Shared short forms (8 of 47, 21 entries)

| Form | Entries carrying it in a title bracket | Written on |
|---|---|---|
| KSG | at-ksg, de-ksg | both |
| UWG | at-uwg-s1-2a, li-uwg | both |
| CSRD | eu-csrd-2022-2464, gr-law-5164-2024 | eu-csrd-2022-2464 only |
| EUDR | eu-eudr-2023-1115, sm-l-101-2025-eudr | eu-eudr-2023-1115 only |
| ESG | eu-esg-ratings-2024-3005, iq-cbi-esg-code, mw-mse-listings-requirements-7-42, ug-cma-esg-guidelines-2026, ug-ira-esg-guidelines-2026, uz-esg-resolution-221 | none |
| JFSC | je-jfsc-investment-business-code, je-jfsc-fund-services-business-code, je-jfsc-certified-funds-code-schedule-1 | none |
| CMF | cl-ncg-461, cl-ncg-519 | none |
| GHGs | ca-cepa-s46-ghg-notice-2023, ca-cepa-s46-ghg-notice-amend-2025 | none |

The written ids per form were printed from the register after the edit and match the "Written on" column (test `test_split_short_forms_sit_only_on_the_agreed_entries` asserts it).

## Hand aliases

| Entry | `official_url` | Alias | Matched before (title, id, citation, case and accents ignored) | After |
|---|---|---|---|---|
| eu-cbam-2023-956 | https://eur-lex.europa.eu/eli/reg/2023/956/oj | CBAM | 4 entries, the EU one only through its id | 4 entries; the alias value now exists on the EU entry |
| eu-ets-2003-87 | https://eur-lex.europa.eu/eli/dir/2003/87/oj | EU ETS | 7 other entries, not this one | 8, this one included |
| eu-empowering-consumers-2024-825 | https://eur-lex.europa.eu/eli/dir/2024/825/oj | ECGT | 1 (pl-ecgt-amendment-act-2026), not this one | 2, this one included |

CBAM left out on purpose: mt-cbam-implementing-regs (implementing rules), rs-cbam-tax-act and rs-cbam-tax-act-amend-2026 (a national import tax). Only eu-cbam-2023-956 holds CBAM (test asserts it).

What I saw at the official sources on 2026-11-17 (fetched from the container):
- CBAM: the EUR-Lex page for Regulation 2023/956 contains "CBAM" 378 times.
- EU ETS: the EUR-Lex page of Directive 2003/87/EC does not contain "EU ETS"; the Commission page https://climate.ec.europa.eu/eu-action/carbon-markets/eu-emissions-trading-system-eu-ets_en uses it 19 times.
- ECGT: no opened official page contains "ECGT". The Commission page for the unfair commercial practices directive names "Empowering Consumers for the Green Transition" in full. The acronym comes from the story's confirmed hand list; Varun checks it.

## Other candidates (not written)

Other candidates I did not probe: none. Mechanical hits worth a look because the bracket is an authority or a section, not a short name of the act: hk-taxonomy-sustainable-finance (HKMA, a regulator), so-esia-regulations-2024 (ESIA, a process), gq-cosumaf-reglamento-general (OVSD, a bond segment inside the rules). They are in the 45 as the rule dictates; Varun can drop them.

## Acceptance criteria

1. Refusals: `python3 -m pytest tests/test_check_corpus.py -k alias -q` passes the 13 parametrised refusals on a link-only entry with no record, plus `["CBAM","EU ETS"]` and no key. PASS.
2. Real corpus: `python3 tools/check_corpus.py` prints `3360 records checked`, exit 0 (same as before; `--iso2 EU` prints 105). `git diff --numstat 809333ff -- register`: 19 files, 48 added, 0 deleted. PASS.
3. Fill counts printed above (60, 39 by the script, 45 with the split, 8 shared forms on 21 entries). PASS, with the 39 vs 45 note.
4. Shared-form table above, checked against the printed ids. PASS.
5. Hand list: `test_hand_aliases_on_the_three_eu_entries` passes; table above. PASS, with the ECGT and EU ETS source notes for Varun.
6. Builder: `test_real_written_file_carries_aliases_on_exactly_the_scope_entries` builds from `origin/history`, writes `--out`, reloads: `aliases` on exactly the 48 scope entries, lists of strings, no key elsewhere; the fixture test `test_labels_and_scope_fields_pass_through` (story 01) covers the entry with no key. PASS.
7. Suite: `python3 -m pytest -q` gives 439 passed in 96.49s (Python 3.13.18); BASE gave 419 passed, so +20. `git diff --stat 809333ff -- tools/query.py` prints nothing. PASS.

## Counts re-read

All story counts that I relied on match live: 60 matched (42 stored, 18 link only), 47 forms, 8 shared on 21 entries, 3360 records, `origin/main` 0b93d7537, `origin/history` 55c8c2a9c. 439 vs 419 tests is the only new figure.

## Left out

- Python 3.11 not run; the code uses nothing newer than 3.11.
- The epic's 153-of-1404 figure not reproduced (story already says so).
- Brackets of more than one word and any further hand aliases.

## Varun decides

1. Whether HKMA, ESIA and OVSD stay as aliases.
2. ECGT: the acronym was not found on the official pages I opened.
3. Whether EU ETS should also match through a Commission page as its source, since the directive text lacks it.
