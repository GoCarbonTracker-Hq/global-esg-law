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

Lists every place in the register with what is stored for it.

Input: none.

Output: the three labels above, and `places`. Each place has `iso2`, `name`, `status` (`text stored`, `link only`, `empty scope file`, or `stored in working tree, absent from history snapshot`), `instrument_count`, `stored_count`, `link_only_count`, `missing_history_count` and `instruments`. Each instrument has `id`, `title`, `status` and `first_in_force`, the date its stored record starts (`null` for a link-only instrument).

The number of places and instruments is in `COVERAGE.md` with its date, and `python3 tools/coverage.py` produces it again.

Real example, from a checkout on 2026-11-13, cut down to one place and one instrument (the full answer has 250 places):

```json
{
  "snapshot": {
    "history_ref": "history",
    "history_commit": "745289cde13fcd1e28333922da235f3467441f1a",
    "working_tree_commit": "2706b594cd430e21bb8a77e03630ca353e2553c1"
  },
  "coverage": {"status": "matches working tree", "missing_records": 0, "extra_records": 0, "record_content_diff": false},
  "notice": "This is not legal advice. The official source is the authority. Nothing here says whether any company complies with any law.",
  "places": [{
    "iso2": "AE", "name": "United Arab Emirates", "status": "link only",
    "instrument_count": 5, "stored_count": 0, "link_only_count": 5, "missing_history_count": 0,
    "instruments": [{"id": "ae-dl-11-2024-climate",
      "title": "Federal Decree-Law No. (11) of 2024 on the Reduction of Climate Change Effects",
      "status": "link only", "first_in_force": null}]
  }]
}
```

On the full corpus the call took about 3.6 seconds on 2026-11-13 (a laptop, local `history` branch).

<!-- VERIFY against merged code: story 03 -->
### law_in_force

Lists the instruments in force in one place on one date.

Input: `place` (two capital letters, or `EU`), `date` (`YYYY-MM-DD`, a real date), and optionally `lang` (two letters).

Output: the three labels, then the instruments in force (id, title, in-force date, kind, language, official source URL, licence, any status note, and the tier and verification level where the scope file gives them), the instruments announced but not yet in force with their dates, and the link-only instruments of the place, listed apart and marked as not stored. The list of instruments in force is the one `python3 tools/law.py <place> <date> --json` prints. If the requested language is missing, the official-language text is shown with a note. When the list is empty the answer says which case applies: the place is not in the register, the place has links only, the date is before the record starts, or nothing in scope was in force on that date.

Example request: `{"place": "EE", "date": "2026-01-01"}`. On 2026-11-13 `python3 tools/law.py EE 2026-01-01` prints six instruments in force, and `ee-aoks-ets` dated 2026-03-28 among those not yet in force.

<!-- VERIFY against merged code: story 04 -->
### read_text

Returns the stored text of one instrument as it stood on a date, in parts.

Input: `instrument` (an id from `list_places`), `date` (`YYYY-MM-DD`), and optionally `lang` (two letters) and `offset` (a character position, to ask for the next part).

Output: the three labels, then `text`, `offset`, `next_offset` (`null` at the end), `total_chars`, the source URL, licence, kind, language and in-force date, and the fetched URL and sha256 where the record has them. A part is 20,000 characters, so the adopted CSRD text of 2023-01-05, which is 267,926 characters, takes 14 calls. The parts joined equal the stored text.

The licence is checked again at read time. If the source's verdict in `sources.json` is not `pass`, no text is returned and the answer gives the official URL and the reason. A link-only instrument returns no text, its official URL and the statement that the text is not stored. A record read from OCR is flagged as uncorrected OCR; if the server cannot tell, it says the status is unknown.

Example request: `{"instrument": "eu-csrd-2022-2464", "date": "2023-06-01"}`.

<!-- VERIFY against merged code: story 05 -->
### instrument_history

Lists every stored version of one instrument, oldest first.

Input: `instrument` (an id from `list_places`).

Output: the three labels, then the versions in in-force order with date, kind (adopted, consolidated, translation, repeal) and the languages stored. A repeal is the last entry with its date. A version with an unknown commencement date carries a note that its date is a publication date. A link-only instrument returns the statement that it is not stored and its official URL.

Example request: `{"instrument": "eu-csrd-2022-2464"}`. As stored on 2026-11-13 it has versions dated 2023-01-05 (adopted), 2025-04-17 (consolidated) and 2026-03-18 (consolidated).

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
