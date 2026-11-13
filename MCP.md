# Use the corpus from an AI assistant (MCP server)

`tools/mcp_server.py` is a small local server that lets an AI assistant ask this repository what was in force in a place on a date. It runs on your machine, reads the repository and its `history` branch, changes nothing and makes no network call. It needs Python 3.11 or later and git, and nothing else is installed.

MCP (Model Context Protocol) is the standard way an assistant such as Claude Code calls a tool. The server speaks stdio: the assistant starts it as a child process and exchanges one JSON message per line. It understands the 2026-07-28 revision of the protocol and the 2025-11-25 revision (the older one starts with an `initialize` message).

The answers come from the corpus as it stands. They are not legal advice, the official source named in each answer is the authority, and nothing here says whether any company complies with any law.

## Set it up

### Claude Code

Open the repository folder in Claude Code. The file `.mcp.json` at the repository root offers the server as a project server named `global-esg-law`. Claude Code asks you to approve it once. After you approve, it starts the server when needed and no other configuration is required.

### Any other MCP client

Add a stdio server that runs the script with an absolute path. The exact place to put this differs by client; the entry looks like this:

```json
{
  "mcpServers": {
    "global-esg-law": {
      "command": "python3",
      "args": ["/absolute/path/to/global-esg-law/tools/mcp_server.py"]
    }
  }
}
```

The server finds the repository from the location of the script, so the working directory does not matter.

### The history branch

Lookups read the `history` branch, which holds one commit per text version. A fresh clone has it as `origin/history`. The server uses a local `history` branch when there is one and `origin/history` otherwise, and every answer says which one it read.

## Every answer carries the same three labels

- `snapshot`: the history ref and commit that were read, and the commit of the checked-out working tree. The register and the scope files are read from the working tree, the texts from the history.
- `coverage`: whether the history matches the working tree. The value is `matches working tree`, `history trails working tree` (records exist on `main` that the history branch lacks) or `history differs from working tree`, with the number of missing and extra records.
- `notice`: not legal advice, the official source is the authority, no statement about any company's compliance.

An empty answer always says why. It never means that no law exists.

## Tools

A tool call that is cut off after 30 seconds returns an error that names the limit. A bad input comes back as a tool result with `isError: true` and a hint, for example the expected date format.

### list_places

Lists the places in the register, or one place with its instruments.

Input: `place` (optional; two capital letters, or `EU`). With no `place`, the answer is a compact table, one array per place and no instrument lists, so a client can show it (the whole reply line is about 29,000 characters for 250 places on 2026-11-13, the answer being sent in both `content` and `structuredContent`). With a `place`, the answer holds that place alone, with its instruments. A malformed code or a place that is not in the register is an input error.

Output with no `place`: the three labels, `place_count`, `columns`, `rows` and `how_to_read`. Each row is an array in the order of `columns`: `iso2`, `name`, `status` (`text stored`, `link only`, `empty scope file`, or `stored in working tree, absent from history snapshot`), `instrument_count`, `stored_count`, `link_only_count`, `missing_history_count` and `first_in_force` (the earliest date among the place's stored records, `null` if none).

Output with `place`: the three labels and `places`, a list of one object with the same eight fields as named keys, plus `instruments`: `id`, `title`, `status` and `first_in_force` (`null` for a link-only instrument).

Real example, no `place`, run on 2026-11-13 (`rows` cut to four of 250):

```json
{
  "snapshot": {"history_ref": "history", "history_commit": "745289cde13fcd1e28333922da235f3467441f1a", "working_tree_commit": "5150218f23ca04f551206a6f8f21733f8e929e0f"},
  "coverage": {"status": "matches working tree", "missing_records": 0, "extra_records": 0, "record_content_diff": false},
  "notice": "This is not legal advice. The official source is the authority. Nothing here says whether any company complies with any law.",
  "place_count": 250,
  "columns": ["iso2", "name", "status", "instrument_count", "stored_count", "link_only_count", "missing_history_count", "first_in_force"],
  "rows": [["AD", "Andorra", "text stored", 4, 4, 0, 0, "2013-08-10"], ["AE", "United Arab Emirates", "link only", 5, 0, 5, 0, null],
           ["AF", "Afghanistan", "link only", 4, 0, 4, 0, null], ["EU", "European Union", "text stored", 16, 16, 0, 0, "2019-12-29"]],
  "how_to_read": "Each row follows columns; call list_places with place to get one place with its instruments."
}
```

The number of places and instruments is in `COVERAGE.md` with its date, and `python3 tools/coverage.py` produces it again.

Real example with a place, `{"place": "AE"}`, run on 2026-11-13 (the `instruments` list is cut to one of five):

```json
{
  "snapshot": {"history_ref": "history", "history_commit": "745289cde13fcd1e28333922da235f3467441f1a", "working_tree_commit": "49fb2a99e13cb810aaf2945c06c36c8a6a01ccee"},
  "coverage": {"status": "matches working tree", "missing_records": 0, "extra_records": 0, "record_content_diff": false},
  "notice": "This is not legal advice. The official source is the authority. Nothing here says whether any company complies with any law.",
  "places": [{
    "iso2": "AE", "name": "United Arab Emirates", "status": "link only",
    "instrument_count": 5, "stored_count": 0, "link_only_count": 5, "missing_history_count": 0, "first_in_force": null,
    "instruments": [{"id": "ae-dl-11-2024-climate",
      "title": "Federal Decree-Law No. (11) of 2024 on the Reduction of Climate Change Effects",
      "status": "link only", "first_in_force": null}]
  }]
}
```

### law_in_force

Lists the instruments in force in one place on one date.

Input: `place` (two capital letters, or `EU`), `date` (a real date, `YYYY-MM-DD`), and optionally `lang` (two lowercase letters).

Output: the three labels, then `place`, `date`, `language_requested`, `case`, `message`, `first_record_date`, `in_force`, `not_yet_in_force` and `link_only`.

- `in_force`: each instrument with `id`, `title`, `in_force`, `kind`, `source_url`, `licence`, `commit`, `language`, `languages`, `official_url`, `law_family`, `duty_on`, `tier`, `verification`, `unverified`, `tier_label`, and `status_note` or `amends` where the scope file has one. A missing tier or verification reads `not available`. `tier_label` reads "A, unverified" for tier A when the official text was not seen. With `lang`, each item also has `fallback` and `language_note`.
- `not_yet_in_force`: instruments announced for a later date, with `id`, `title`, `in_force`.
- `link_only`: instruments of the place whose text is not stored, each with `stored: false`, `official_url` and the same labels. They are neither in force nor out of force in this answer.
- `case` and `message` are empty (`null`) when `in_force` has entries. Otherwise `case` is one of `place_not_in_register`, `links_only`, `registered_no_instruments`, `no_stored_text`, `before_record_starts` or `nothing_in_force`, and `message` says what that means. None of them says that no law exists.

The `in_force` list is the one `python3 tools/law.py <place> <date> --json` prints.

Real example, `{"place": "EE", "date": "2026-01-01"}`, 2026-11-13, cut to one entry in each list (the real answer has six in force and three not yet in force):

```json
{
  "place": "EE", "date": "2026-01-01", "language_requested": null, "case": null, "message": null,
  "first_record_date": "2003-01-01",
  "in_force": [{"id": "ee-ets-trading-order", "in_force": "2022-01-14", "kind": "consolidated", "language": "et",
    "source_url": "https://www.riigiteataja.ee/akt/111012022002?leiaKehtiv",
    "licence": "Not copyright-protected (EE AutÕS § 5 p 3); source named as Riigi Teataja (RTS § 12 lg 1); only the text published in Riigi Teataja is official",
    "law_family": "F3", "duty_on": "private_sector", "tier": "A", "verification": "official_text_seen",
    "unverified": false, "tier_label": "A"}],
  "not_yet_in_force": [{"id": "ee-aoks-ets", "in_force": "2026-03-28"}],
  "link_only": []
}
```

(The three labels, `title`, `commit`, `languages` and `official_url` are left out of this example to save space.) For `{"place": "AE", "date": "2026-01-01"}` the answer has `case` set to `links_only` and the five instruments under `link_only`.

### read_text

Returns the stored text of one instrument as it stood on a date, in parts.

Input: `instrument` (an id from `list_places`), `date` (`YYYY-MM-DD`), and optionally `lang` (two lowercase letters) and `offset` (an integer of 0 or more, the character position of the part).

Output: the three labels and `instrument`, then, for text that is returned: `source_url`, `licence`, `kind`, `language`, `in_force`, `commit`, `fallback`, `languages`, `source_id`, `ocr` (`true` or `false`), `text`, `offset`, `total_chars`, `next_offset` (`null` at the end), `fetched_url` and `fetched_sha256` where the record has them, and `how_to_continue` while more text remains. A part is 20,000 characters; pass `next_offset` as `offset` for the next one. The parts joined equal the stored text. The adopted CSRD text of 2023-01-05 is 267,926 characters, so it takes 14 calls.

When text is not returned, `text` is `null`, `official_url` is given, and `reason` says why: the instrument is link only, the date is before the record starts, no version is in force on that date, the licence verdict is not `pass`, or the record file could not be read.

The licence is checked at read time, against `sources.json` in the checked-out tree. Text is returned only when every `sources.json` row whose id matches the record's `source_id` has the verdict `pass`. A missing row, or rows that disagree, withhold the text.

For a record read from a scanned PDF, `ocr` is `true` and `ocr_warning` says the text is uncorrected and to check dates and article numbers against the original. If the record file cannot be read, `ocr` is `"unknown"`.

Real example, `{"instrument": "eu-csrd-2022-2464", "date": "2023-06-01"}`, 2026-11-13, with `text` cut to its first characters and the three labels and `languages` left out:

```json
{
  "instrument": "eu-csrd-2022-2464",
  "source_url": "https://eur-lex.europa.eu/eli/dir/2022/2464/oj",
  "licence": "Decision 2011/833/EU (EUR-Lex reuse policy); source acknowledged",
  "kind": "adopted", "language": "en", "in_force": "2023-01-05", "fallback": false,
  "source_id": "EU-EURLEX-ADOPTED", "ocr": false,
  "text": "16.12.2022\n\nEN\n\nOfficial Journal of the European Union\n\nL 322/15\n\nDIRECTIVE (EU)...",
  "offset": 0, "total_chars": 267926, "next_offset": 20000,
  "fetched_url": "https://publications.europa.eu/resource/celex/32022L2464",
  "fetched_sha256": "6ad8df8d05b75c4caf19c926db0afc86c725872bb3342c4d7cd2544dd6c29837",
  "how_to_continue": "Call read_text again with the same arguments and offset=20000 for the next part."
}
```

For `{"instrument": "ae-dl-11-2024-climate", "date": "2026-01-01"}` the answer is `text: null`, `official_url: "https://uaelegislation.gov.ae/en/legislations/2558"` and `reason: "The text of this instrument is not stored in the corpus (link only); read it at the official URL."`.

### instrument_history

Lists every stored version of one instrument, oldest first.

Input: `instrument` (an id from `list_places`). An id the corpus does not know is an input error.

Output: the three labels and `instrument`, `title`, `jurisdiction`, `stored`, `versions`, `excluded_after_repeal` and `official_url`. Each version has `in_force`, `kind`, `source_url`, `licence`, `commit` and `languages`, and a `note` when the date is a publication date because the commencement date is unknown. A repeal is a version of kind `repeal`, listed at its date. `excluded_after_repeal` lists dates of later records that are not shown as versions because they come after a repeal and are not flagged as re-enactments. A link-only instrument has `stored: false`, an empty `versions`, its `official_url` and a `reason`.

Real example, `{"instrument": "eu-csrd-2022-2464"}`, 2026-11-13, with the labels and `title` left out and `licence` shortened:

```json
{
  "instrument": "eu-csrd-2022-2464", "jurisdiction": "EU", "stored": true,
  "versions": [
    {"in_force": "2023-01-05", "kind": "adopted", "source_url": "https://eur-lex.europa.eu/eli/dir/2022/2464/oj", "licence": "Decision 2011/833/EU ...", "commit": "66c7579f589c16c7685ea2cc8093438fb5092b11", "languages": ["en"]},
    {"in_force": "2025-04-17", "kind": "consolidated", "source_url": "https://eur-lex.europa.eu/eli/dir/2022/2464/oj", "licence": "CC BY 4.0", "commit": "cae8b0d8cb3791fbcb33ca4a93909a95a7a31c9e", "languages": ["en"]},
    {"in_force": "2026-03-18", "kind": "consolidated", "source_url": "https://eur-lex.europa.eu/eli/dir/2022/2464/oj", "licence": "CC BY 4.0", "commit": "1e1959f636f8bce02f09cdad4cb8ce14edcca4b4", "languages": ["en"]}
  ],
  "excluded_after_repeal": [],
  "official_url": "https://eur-lex.europa.eu/eli/dir/2022/2464/oj"
}
```

## Limits

- Link only. Where the licence check did not pass, the repository holds a link to the official page and no text. A link-only instrument is neither in force nor out of force in these answers; it is not stored. The counts are in `COVERAGE.md` (dated), and `python3 tools/coverage.py` prints them again.
- Uncorrected OCR. Some texts were read from scanned PDFs and are not corrected. Arabic OCR in particular misreads digits, so check dates and article numbers against the original PDF named in the record. The README states how many records are OCR and when it was counted.
- The snapshot can trail `main`. The `history` branch is published separately. The `coverage` label says when it lacks records that `main` has.
- Not complete. A place with no stored text, or a date before its record starts, tells you what the repository holds. It does not tell you that no law applies.
- Not legal advice. Check the official source before relying on any text.
- No statement about any company. The server answers what the law said, not whether anyone complied with it.

## Check that it works from a fresh clone

`tools/acceptance_mcp.py` clones a repository with plain `git clone` into a new temporary folder, so `main` is checked out and only `origin/history` exists. It starts the server from that clone, runs a scripted client in both protocol revisions, calls every tool the server lists, and compares the answers with known records: a stored text, a link-only place, an OCR record, an instrument not yet in force and an input error. It prints one line per check and exits 1 on any failure.

```
python3 tools/acceptance_mcp.py https://github.com/GoCarbonTracker-Hq/global-esg-law
python3 tools/acceptance_mcp.py /path/to/local/checkout
python3 tools/acceptance_mcp.py . --only list_places
```

A tool that the server does not list is reported as not present and counts as a failure. The known records are in the `CHECKS` table at the top of the script. They are true of the corpus on 2026-11-13; if a record changes, the check names the record and the table is the place to correct.

## How this was tested

- Automated tests (`python3 -m pytest tests -q`) cover the query functions and the server over stdio, on fixture repositories and on the real corpus. On GitHub the tests run with the published `history` branch fetched, and a test skipped for a missing history ref fails the run.
- `tools/acceptance_mcp.py` runs the server from a fresh clone in both protocol revisions and checks the answers against known records (above).
- The GitHub `acceptance` job also calls the server with the official MCP Inspector (`@modelcontextprotocol/inspector`, in CLI mode), a client this project did not write: `tools/list` and one `law_in_force` call.
- <!-- REAL-CLIENT: orchestrator fills this in -->
