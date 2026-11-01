import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build


def fixture(repo):
    (repo / "records" / "EU" / "law").mkdir(parents=True)
    rows = [
        {"id": "old", "verdict": "pass", "trailer_instrument": "Old Act", "trailer_source_url": "https://example.org/old", "trailer_licence": "CC0"},
        {"id": "new", "verdict": "pass", "trailer_instrument": "New Act", "trailer_source_url": "https://example.org/new", "trailer_licence": "OGL"},
    ]
    (repo / "sources.json").write_text(json.dumps(rows))
    for name, source, effective in [("old", "old", "1965-01-02"), ("new", "new", "2020-03-04")]:
        (repo / "records" / "EU" / "law" / f"{name}.json").write_text(json.dumps({"source_id": source, "in_force": effective, "kind": "adopted", "text": name}))
    subprocess.run(["git", "init", "-q", str(repo)], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.name", "Test"], check=True)
    subprocess.run(["git", "-C", str(repo), "config", "user.email", "test@example.org"], check=True)


def test_build_trailers_order_and_rebuild(tmp_path):
    histories = []
    for name in ("one", "two"):
        repo = tmp_path / name
        repo.mkdir()
        fixture(repo)
        assert build.build(repo) == [("1965-01-02", "Old Act"), ("2020-03-04", "New Act")]
        commits = subprocess.check_output(["git", "-C", str(repo), "log", "--reverse", "--format=%H"], text=True).splitlines()
        history = []
        for commit in commits:
            body = subprocess.check_output(["git", "-C", str(repo), "show", "-s", "--format=%B", commit], text=True)
            trailers = dict(line.split(": ", 1) for line in body.splitlines() if ": " in line)
            assert {"Instrument", "Source-url", "In-force", "Kind", "Licence"} <= trailers.keys()
            history.append((trailers["In-force"], trailers["Instrument"]))
        assert history == [("1965-01-02", "Old Act"), ("2020-03-04", "New Act")]
        histories.append(history)
    assert histories[0] == histories[1]


def test_build_refuses_nonpass_row(tmp_path):
    repo = tmp_path / "blocked"
    repo.mkdir()
    fixture(repo)
    rows = json.loads((repo / "sources.json").read_text())
    rows[0]["verdict"] = "unknown"
    (repo / "sources.json").write_text(json.dumps(rows))
    try:
        build.build(repo)
    except ValueError as exc:
        assert "old" in str(exc)
    else:
        raise AssertionError("non-pass source row was accepted")
