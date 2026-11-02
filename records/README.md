# Records

Layout: `records/<ISO2>/<instrument>/<file>.json`. `<instrument>` equals the `id` of an entry in `register/<ISO2>/scope.json`. `tools/build.py` reads every `*.json` under `records/` and writes one dated commit per file.

Keys of a record file:

| Key | Meaning |
|---|---|
| `source_id` | An `id` in `sources.json`. Its verdict must be `pass`. |
| `in_force` | Date the text took effect, `YYYY-MM-DD`. Becomes the commit date and the `In-force` trailer. |
| `kind` | Form of the text, for example `adopted` or `consolidated`. Becomes the `Kind` trailer. Must be exactly `adopted`, `consolidated` or `translation`, and equal the `form` of its `sources.json` row; `tools/check_corpus.py` refuses anything else. |
| `text` | The law text. Empty only in a repeal record (`repealed` true); `tools/check_corpus.py` refuses empty text otherwise. |
| `message` | Optional commit subject. Default: `<Instrument> effective <in_force>`, or `<Instrument> repealed <in_force>` for a repeal. |
| `fetched_url` | The exact request URL the text was fetched from. |
| `fetched_sha256` | sha256 of the file as returned, before text extraction. |
| `repealed` | `true` marks a repeal: the instrument is out of force from `in_force`. The record has `kind` as the source row's form, empty `text`, no fetch keys. `tools/build.py` writes the commit with trailer `Kind: repeal`; `tools/law.py` stops listing the instrument from that date. Nothing earlier is edited, so earlier commit hashes do not move. |

`source_id` must equal the scope.json entry's `source_row`, or be one of its ids when `source_row` is a list.

An amendment is an ordinary new record: the consolidated text at the amendment's in-force date. When the amending act is itself an instrument in scope, its scope.json entry may carry `amends: <id>` naming the amended instrument; `tools/law.py` prints `amends <id>` beside it.

Trailers: `Instrument` and `Source-url` come from the scope.json entry (`title`, `official_url`). `Licence` comes from the `sources.json` row (`trailer_licence`).
