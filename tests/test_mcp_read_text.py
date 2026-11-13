import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build
import query
from test_mcp import modern, run_server
from test_query import make_repo

LONG = "".join(f"Article {n}. Text of the article.\n" for n in range(4000))


def fixture(tmp_path):
    repo = make_repo(tmp_path)
    act = repo / "records" / "XX" / "act"
    old, new = act / "2020-01-01-consolidated.json", act / "2023-06-01-consolidated.json"
    first = json.loads(old.read_text())
    first.update(text="scanned text", extraction="ocr")
    old.write_text(json.dumps(first))
    second = json.loads(new.read_text())
    second.update(text=LONG, fetched_url="https://example.invalid/act/2023", fetched_sha256="ab" * 32)
    new.write_text(json.dumps(second))
    new.rename(act / "2023-06-01-consolidated-en-final.json")
    build.build(repo, branch="history")
    return repo


def set_verdict(repo, verdict):
    rows = json.loads((repo / "sources.json").read_text())
    for row in rows:
        if row["id"] == "PASS":
            row["verdict"] = verdict
    (repo / "sources.json").write_text(json.dumps(rows))


def test_pass_source_returns_text_with_source_facts(tmp_path):
    repo = fixture(tmp_path)
    answer = query.read_text(repo, "act", "2024-01-01")
    assert answer["in_force"] == "2023-06-01" and answer["kind"] == "consolidated" and answer["language"] == "en"
    assert answer["source_url"] == "https://example.invalid/act" and answer["licence"] == "CC0"
    assert answer["fetched_url"] == "https://example.invalid/act/2023" and answer["fetched_sha256"] == "ab" * 32
    assert answer["ocr"] is False and answer["text"] and answer["notice"] and answer["snapshot"]
    assert query.read_text(repo, "act", "2021-01-01")["in_force"] == "2020-01-01"


def test_parts_joined_equal_the_stored_text(tmp_path):
    repo = fixture(tmp_path)
    assert query.PART_SIZE == 20000
    parts, offset = [], 0
    while offset is not None:
        answer = query.read_text(repo, "act", "2024-01-01", offset=offset)
        assert answer["total_chars"] == len(LONG)
        parts.append(answer["text"])
        offset = answer["next_offset"]
    assert len(parts) > 1 and "".join(parts) == LONG
    assert "offset" in query.read_text(repo, "act", "2024-01-01")["how_to_continue"]
    with pytest.raises(ValueError):
        query.read_text(repo, "act", "2024-01-01", offset=len(LONG) + 1)


@pytest.mark.parametrize("verdict", ["permission requested", "unknown", None])
def test_non_pass_verdict_withholds_text_and_gives_reason_and_url(tmp_path, verdict):
    repo = fixture(tmp_path)
    set_verdict(repo, verdict)
    answer = query.read_text(repo, "act", "2024-01-01")
    assert answer["text"] is None and "verdict" in answer["reason"]
    assert answer["official_url"] == "https://example.invalid/act"


def test_missing_or_duplicate_source_row_withholds_text(tmp_path):
    repo = fixture(tmp_path)
    rows = json.loads((repo / "sources.json").read_text())
    (repo / "sources.json").write_text("[]")
    missing = query.read_text(repo, "act", "2024-01-01")
    assert missing["text"] is None and "missing or ambiguous" in missing["reason"]
    (repo / "sources.json").write_text(json.dumps(rows + [rows[0]]))
    duplicate = query.read_text(repo, "act", "2024-01-01")
    assert duplicate["text"] is None and "missing or ambiguous" in duplicate["reason"]


def test_non_records_path_is_an_internal_error(tmp_path, monkeypatch):
    repo = fixture(tmp_path)
    real = query._git
    monkeypatch.setattr(query, "_git", lambda r, *a, **k: type("R", (), {"stdout": "elsewhere/x.json\n"})()
                        if a[0] == "diff-tree" else real(r, *a, **k))
    with pytest.raises(RuntimeError):
        query.read_text(repo, "act", "2024-01-01")


def test_real_ocr_record_is_flagged():
    if query._git(ROOT, "rev-parse", "--verify", "--quiet", "history^{commit}", check=False).returncode and \
            query._git(ROOT, "rev-parse", "--verify", "--quiet", "origin/history^{commit}", check=False).returncode:
        pytest.skip("no history or origin/history ref in this clone")
    answer = query.read_text(ROOT, "ye-consumer-protection-regulation-2010", "2010-05-12")
    assert answer["ocr"] is True and "original PDF" in answer["ocr_warning"]


def test_link_only_instrument_says_text_is_not_stored(tmp_path):
    answer = query.read_text(fixture(tmp_path), "rule", "2025-01-01")
    assert answer["text"] is None and "not stored" in answer["reason"]
    assert answer["official_url"] == "https://example.invalid/rule"


def test_ocr_record_is_flagged(tmp_path):
    answer = query.read_text(fixture(tmp_path), "act", "2021-01-01")
    assert answer["text"] == "scanned text" and answer["ocr"] is True
    assert "OCR" in answer["ocr_warning"] and "original PDF" in answer["ocr_warning"]


def test_unreadable_record_gives_unknown_ocr_status_and_no_text(tmp_path, monkeypatch):
    repo = fixture(tmp_path)
    monkeypatch.setattr(query, "_load_record", lambda *a: None)
    answer = query.read_text(repo, "act", "2021-01-01")
    assert answer["ocr"] == "unknown" and answer["text"] is None and "unknown" in answer["ocr_warning"]


def test_input_errors_and_dates_outside_the_record(tmp_path):
    repo = fixture(tmp_path)
    for bad in ({"instrument": "../../etc/passwd", "date": "2024-01-01"}, {"instrument": "nope", "date": "2024-01-01"},
                {"instrument": "act", "date": "2024-13-01"}, {"instrument": "act", "date": "2024-01-01", "lang": "english"},
                {"instrument": "act", "date": "2024-01-01", "offset": -1}):
        with pytest.raises(ValueError):
            query.read_text(repo, **bad)
    early = query.read_text(repo, "act", "2019-01-01")
    assert early["text"] is None and "2020-01-01" in early["reason"]


def test_read_text_over_stdio(tmp_path):
    repo = fixture(tmp_path)
    replies, _ = run_server(repo, [
        modern("tools/call", "c1", {"name": "read_text", "arguments": {"instrument": "act", "date": "2024-01-01", "offset": 0}}),
        modern("tools/call", "c2", {"name": "read_text", "arguments": {"instrument": "nope", "date": "2024-01-01"}}),
    ])
    assert replies[0]["result"]["isError"] is False and replies[0]["result"]["structuredContent"]["text"]
    assert replies[1]["result"]["isError"] is True


def test_real_csrd_adopted_text_is_267926_chars_and_parts_add_up():
    if query._git(ROOT, "rev-parse", "--verify", "--quiet", "history^{commit}", check=False).returncode and \
            query._git(ROOT, "rev-parse", "--verify", "--quiet", "origin/history^{commit}", check=False).returncode:
        pytest.skip("no history or origin/history ref in this clone")
    parts, offset = [], 0
    while offset is not None:
        answer = query.read_text(ROOT, "eu-csrd-2022-2464", "2023-01-05", offset=offset)
        parts.append(answer["text"])
        offset = answer["next_offset"]
    assert answer["total_chars"] == 267926 == len("".join(parts))
