#!/usr/bin/env python3
"""Coverage grid: write assets/coverage-grid.svg, one square per place in the register.

Reads register/register.csv, register/<ISO2>/scope.json and records/. The date in the caption is
measured_on from upkeep/cadence.json when that file has one. Output is sorted and carries no run time,
so two runs on the same files give the same bytes. Writes assets/coverage-grid.svg and nothing else.
"""
import argparse
import csv
import json
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMMAND = "python3 tools/coverage_grid.py"
OUTPUT = Path("assets") / "coverage-grid.svg"
STATES = (  # key, legend label, fill, text colour
    ("stored", "text stored", "#1b5e20", "#ffffff"),
    ("link", "link only", "#ffb300", "#212121"),
    ("none", "no corpus", "#e0e0e0", "#424242"),
)
COLUMNS, CELL, GAP, MARGIN, TOP = 20, 36, 4, 16, 44


def classify(repo):
    """Return (as_of or None, {iso2: state}) for every place in the register."""
    repo = Path(repo)
    with (repo / "register" / "register.csv").open(encoding="utf-8", newline="") as handle:
        places = {row["iso2"] for row in csv.DictReader(handle)}
    scoped = {p.parent.name for p in (repo / "register").glob("*/scope.json")}
    stored = {p.parent.parent.name for p in (repo / "records").glob("*/*/*.json")}
    states = {iso2: "stored" if iso2 in stored else "link" if iso2 in scoped else "none" for iso2 in places}
    cadence = repo / "upkeep" / "cadence.json"
    as_of = json.loads(cadence.read_text(encoding="utf-8")).get("measured_on") if cadence.exists() else None
    return as_of, states


def render(as_of, states):
    codes = sorted(states)
    counts = {key: sum(1 for s in states.values() if s == key) for key, *_ in STATES}
    rows = -(-len(codes) // COLUMNS)
    width = MARGIN * 2 + COLUMNS * CELL + (COLUMNS - 1) * GAP
    legend_y = TOP + rows * (CELL + GAP) + 16
    height = legend_y + 52
    date = as_of or "no date in the data"
    caption = (f"As of {date}: {len(codes)} places. {counts['stored']} with text stored, "
               f"{counts['link']} link only, {counts['none']} with no corpus.")
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" '
           f'role="img" aria-labelledby="t d" font-family="monospace">',
           '<title id="t">Coverage grid of places in the register</title>',
           f'<desc id="d">{escape(caption)}</desc>',
           f'<rect width="{width}" height="{height}" fill="#ffffff"/>',
           f'<text x="{MARGIN}" y="26" font-size="16" fill="#212121">Coverage by place, sorted by two-letter code</text>']
    for i, code in enumerate(codes):
        x = MARGIN + (i % COLUMNS) * (CELL + GAP)
        y = TOP + (i // COLUMNS) * (CELL + GAP)
        state = states[code]
        fill, ink = next((f, t) for k, _, f, t in STATES if k == state)
        out.append(f'<rect x="{x}" y="{y}" width="{CELL}" height="{CELL}" rx="3" fill="{fill}"/>')
        out.append(f'<text x="{x + CELL // 2}" y="{y + CELL // 2 + 4}" font-size="12" text-anchor="middle" '
                   f'fill="{ink}">{escape(code)}</text>')
    x = MARGIN
    for key, label, fill, _ in STATES:
        out.append(f'<rect x="{x}" y="{legend_y}" width="16" height="16" rx="2" fill="{fill}"/>')
        out.append(f'<text x="{x + 22}" y="{legend_y + 13}" font-size="13" fill="#212121">{escape(label)} ({counts[key]})</text>')
        x += 190
    out.append(f'<text x="{MARGIN}" y="{legend_y + 42}" font-size="13" fill="#212121">{escape(caption)}</text>')
    out.append("</svg>")
    return "\n".join(out) + "\n"


def build(repo=ROOT):
    return render(*classify(repo))


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--repo", default=str(ROOT))
    args = ap.parse_args(argv)
    try:
        svg = build(args.repo)
    except (OSError, ValueError, KeyError) as exc:
        print(f"coverage grid: {exc}", file=sys.stderr)
        return 1
    target = Path(args.repo) / OUTPUT
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(svg.encode("utf-8"))
    print(f"wrote {OUTPUT} ({svg.count('<rect') - 4} places)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
