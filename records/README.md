# Records

Layout: `records/<ISO2>/<instrument>/<file>.json`. `<instrument>` equals the `id` of an entry in `register/<ISO2>/scope.json`. `tools/build.py` reads every `*.json` under `records/` and writes one dated commit per file.

Keys of a record file:

| Key | Meaning |
|---|---|
| `source_id` | An `id` in `sources.json`. Its verdict must be `pass`. |
| `in_force` | Date the text took effect, `YYYY-MM-DD`. Becomes the commit date and the `In-force` trailer. |
| `kind` | Form of the text, for example `adopted` or `consolidated`. Becomes the `Kind` trailer. Must be exactly `adopted`, `consolidated` or `translation`, and equal the `form` of its `sources.json` row; `tools/check_corpus.py` refuses anything else. |
| `text` | The law text. |
| `message` | Optional commit subject. Default: `<Instrument> effective <in_force>`. |

Trailers: `Instrument` and `Source-url` come from the scope.json entry (`title`, `official_url`). `Licence` comes from the `sources.json` row (`trailer_licence`).
