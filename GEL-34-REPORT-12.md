# GEL-34 story 12 report: multi-target `amends_ids`

## Plan (written before any edit)

| Piece | Deliverable | Files | Check that proves it done |
|---|---|---|---|
| P1 move | 160 `"amends": "x"` lines become `"amends_ids": ["x"]`, text rewrite, one-off script not committed | `register/*/scope.json` (75 files) | `git diff --shortstat` 75 files, 160/160; per-entry equality loop; `git grep -c '"amends"'` empty |
| P2 rule | `check_amends(repo, iso2=None)` called at the top of `check` | `tools/check_corpus.py`, `tests/test_check_corpus.py`, `tests/test_iso2_gate.py` | parametrized pytest, link-only refusal, iso2 gate, 3360 records checked |
| P3 readers | `query.lookup` key list, `law.py` text line, test edits, pass-through test | `tools/query.py`, `tools/law.py`, `tests/test_outcomes.py`, `tests/test_law.py` | pytest; `law.py CZ 2026-06-01 --ref origin/history` unchanged |
| P4 fill | the two EU omnibus directives get their targets | `register/EU/scope.json` | `law.py EU 2026-11-17 --ref origin/history --json`; 162 entries |
| P5 gap pass | 28 entries each `filled` or `outside the register`, table for Varun | `register/*/scope.json`, this report | script prints `unresolved 0, filled F, outside the register M` |
| P6 docs | MCP.md line 100, MAINTAINING.md line 52, CHANGELOG.md | those three | diffs |
| Story 1 criterion | skipped: `tools/web_data.py` is absent on this branch | none | none |

P1 runs first (everything else reads the new key). P5 reading is delegated to a sonnet subagent that only reads and returns a proposal; I write the scope edits.
