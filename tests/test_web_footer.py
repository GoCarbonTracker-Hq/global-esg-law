"""The footer links of web/index.html (GEL-34 story 10): each href names a file in this repository and, when it has an
anchor, the GitHub slug of a `##` heading in that file. Standard library only."""
import re
import shutil
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
BLOB = "https://github.com/GoCarbonTracker-Hq/global-esg-law/blob/main/"
WANT = [BLOB + "README.md#quick-start", BLOB + "README.md#use-it-from-an-ai-assistant", BLOB + "MCP.md"]


def footer_hrefs(html):
    return re.findall(r'href="([^"]*)"', re.search(r"<footer\b.*?</footer>", html, re.S).group(0))


def slugs(markdown):
    """GitHub's anchors for the `##` headings, outside code fences; a repeated heading gets -1, -2 and so on."""
    found, seen, fenced = [], {}, False
    for line in markdown.splitlines():
        if line.lstrip().startswith(("```", "~~~")):
            fenced = not fenced
        match = None if fenced else re.match(r"##\s+(.+?)\s*#*\s*$", line)
        if match:
            slug = re.sub(r"[^\w\- ]", "", match.group(1).replace("`", "").lower()).replace(" ", "-")
            found.append(slug if slug not in seen else f"{slug}-{seen[slug]}")
            seen[slug] = seen.get(slug, 0) + 1
    return found


def problems(html, root):
    found = []
    for href in footer_hrefs(html):
        if not href.startswith(BLOB):
            found.append(f"{href}: not an address under {BLOB}")
            continue
        name, _, anchor = href[len(BLOB):].partition("#")
        path = root / name
        if not path.is_file():
            found.append(f"{href}: {name} is not a file in the repository")
        elif anchor and anchor not in slugs(path.read_text(encoding="utf-8")):
            found.append(f"{href}: no `##` heading in {name} has the slug {anchor}")
    return found


def test_footer_has_the_three_links_in_order():
    assert footer_hrefs((ROOT / "web" / "index.html").read_text(encoding="utf-8")) == WANT


def test_every_footer_href_names_a_file_and_a_heading():
    assert problems((ROOT / "web" / "index.html").read_text(encoding="utf-8"), ROOT) == []


@pytest.fixture
def copy(tmp_path):
    for name in ("README.md", "MCP.md"):
        shutil.copy(ROOT / name, tmp_path / name)
    return tmp_path


HTML = f'<body><footer>{"".join(f"<a href={chr(34)}{u}{chr(34)}>x</a>" for u in WANT)}</footer></body>'


def test_a_renamed_quick_start_heading_fails(copy):
    readme = copy / "README.md"
    text = readme.read_text(encoding="utf-8")
    assert "\n## Quick start\n" in text
    assert problems(HTML, copy) == []
    readme.write_text(text.replace("\n## Quick start\n", "\n## Getting started\n"), encoding="utf-8")
    assert [p for p in problems(HTML, copy) if "quick-start" in p]


def test_a_missing_file_fails(copy):
    (copy / "MCP.md").unlink()
    assert any("MCP.md is not a file" in p for p in problems(HTML, copy))


def test_a_foreign_address_fails():
    assert problems('<footer><a href="https://example.org/">x</a></footer>', ROOT)


def test_a_heading_inside_a_code_fence_is_no_anchor():
    assert slugs("## Real one\n```\n## Not a heading\n```\n## Real one\n") == ["real-one", "real-one-1"]
