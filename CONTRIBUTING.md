# Contributing

Reports are the most useful contribution. If a text here is wrong, out of date or missing, or you think a source's licence verdict is wrong, open an issue with the "Wrong or missing law" form. It asks for the place, the instrument, the official URL, and what the record shows against what the source shows.

## Pull requests

Small fixes to the tools, tests and documentation are welcome as pull requests. Before you open one, run the checks in [`MAINTAINING.md`](MAINTAINING.md) and paste the last line of the test run into the description.

New or changed law text needs more care, so please open an issue first. A record is accepted only when:

- its source has a row in `sources/licence-table.csv` with the verdict `pass`,
- the record names the official URL it was fetched from and the sha256 of what was fetched,
- `python3 tools/check_corpus.py` and `python3 tools/publish_gate.py` both pass.

Text from a source whose verdict is not `pass` is not stored. Such an instrument can still be listed with a link to its official page.

## Licence of contributions

Tools, tests, the register and the documentation are CC0 1.0, and contributions to them are accepted under the same dedication. Law texts keep the licence of their source.
