import ast
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from test_query import make_repo

SERVER = ROOT / "tools" / "mcp_server.py"
META_KEY = "io.modelcontextprotocol/protocolVersion"
CLIENT_INFO = "io.modelcontextprotocol/clientInfo"
CLIENT_CAPS = "io.modelcontextprotocol/clientCapabilities"


def slow_work():
    time.sleep(2)


def failed_work(_repo):
    raise ValueError("query failure")


def modern(method, request_id, params=None, version="2026-07-28"):
    params = dict(params or {})
    params["_meta"] = {META_KEY: version, CLIENT_INFO: {"name": "test", "version": "1"}, CLIENT_CAPS: {}}
    return {"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}


def server_copy(repo):
    tools = repo / "tools"
    tools.mkdir(exist_ok=True)
    shutil.copy2(ROOT / "tools" / "query.py", tools / "query.py")
    shutil.copy2(SERVER, tools / "mcp_server.py")
    return tools / "mcp_server.py"


def run_server(repo, messages):
    process = subprocess.run([sys.executable, str(server_copy(repo))], cwd=repo,
                              input="".join(json.dumps(message) + "\n" for message in messages),
                              text=True, capture_output=True, timeout=20, check=True)
    assert process.stderr == ""
    return [json.loads(line) for line in process.stdout.splitlines()], process.stdout.splitlines()


def test_modern_stdio_session_lists_tools_and_calls_list_places(tmp_path):
    repo = make_repo(tmp_path)
    replies, raw = run_server(repo, [
        modern("server/discover", "d1"),
        modern("tools/list", "l1"),
        modern("tools/call", "c1", {"name": "list_places", "arguments": {}}),
    ])

    assert replies[0]["result"]["supportedVersions"] == ["2026-07-28", "2025-11-25"]
    tool = replies[1]["result"]["tools"][0]
    assert tool["name"] == "list_places" and tool["inputSchema"]["type"] == "object"
    result = replies[2]["result"]
    assert result["resultType"] == "complete"
    assert result["structuredContent"]["places"]
    assert {"snapshot", "coverage", "notice"} <= result["structuredContent"].keys()
    assert len(raw) == 3


def test_legacy_stdio_session_initializes_lists_tools_and_calls_list_places(tmp_path):
    repo = make_repo(tmp_path)
    replies, raw = run_server(repo, [
        {"jsonrpc": "2.0", "id": "i1", "method": "initialize", "params": {
            "protocolVersion": "2025-11-25", "capabilities": {}, "clientInfo": {"name": "test", "version": "1"}}},
        {"jsonrpc": "2.0", "method": "notifications/initialized"},
        {"jsonrpc": "2.0", "id": "l1", "method": "tools/list", "params": {}},
        {"jsonrpc": "2.0", "id": "c1", "method": "tools/call", "params": {"name": "list_places", "arguments": {}}},
    ])

    assert replies[0]["result"]["protocolVersion"] == "2025-11-25"
    tool = replies[1]["result"]["tools"][0]
    assert tool["name"] == "list_places" and tool["inputSchema"]["type"] == "object"
    answer = replies[2]["result"]["structuredContent"]
    assert answer["places"] and {"snapshot", "coverage", "notice"} <= answer.keys()
    assert len(raw) == 3


def test_server_uses_origin_history_when_local_history_is_absent(tmp_path):
    repo = make_repo(tmp_path)
    head = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "history"], text=True).strip()
    subprocess.run(["git", "-C", str(repo), "update-ref", "refs/remotes/origin/history", head], check=True)
    subprocess.run(["git", "-C", str(repo), "update-ref", "-d", "refs/heads/history"], check=True)
    replies, _ = run_server(repo, [
        modern("tools/call", "c1", {"name": "list_places", "arguments": {}}),
    ])

    assert replies[0]["result"]["structuredContent"]["snapshot"]["history_ref"] == "origin/history"


def test_server_run_does_not_change_worktree_refs_or_records(tmp_path):
    repo = make_repo(tmp_path)
    server_copy(repo)
    subprocess.run(["git", "-C", str(repo), "add", "tools"], check=True)
    subprocess.run(["git", "-C", str(repo), "commit", "-qm", "add test server"], check=True)

    def git(*args):
        return subprocess.check_output(["git", "-C", str(repo), *args], text=True)

    before_status = git("status", "--porcelain")
    before_refs = git("for-each-ref", "--format=%(refname) %(objectname)")
    before_records = tuple((path.relative_to(repo), path.read_bytes()) for path in sorted((repo / "records").rglob("*.json")))
    run_server(repo, [modern("tools/call", "c1", {"name": "list_places", "arguments": {}})])

    assert git("status", "--porcelain") == before_status
    assert git("for-each-ref", "--format=%(refname) %(objectname)") == before_refs
    assert tuple((path.relative_to(repo), path.read_bytes()) for path in sorted((repo / "records").rglob("*.json"))) == before_records


def test_protocol_errors_do_not_stop_the_stdio_server(tmp_path):
    repo = make_repo(tmp_path)
    messages = [
        modern("server/discover", "d1"),
        modern("tools/list", "bad-version", version="1900-01-01"),
        modern("tools/call", "bad-args", {"name": "list_places", "arguments": []}),
        modern("tools/call", "unknown", {"name": "missing", "arguments": {}}),
        "not-json",
        modern("tools/list", "after-errors"),
    ]
    input_lines = "".join((message if isinstance(message, str) else json.dumps(message)) + "\n" for message in messages)
    process = subprocess.run([sys.executable, str(server_copy(repo))], cwd=repo, input=input_lines,
                             text=True, capture_output=True, timeout=20, check=True)
    replies = [json.loads(line) for line in process.stdout.splitlines()]
    assert replies[1]["error"]["code"] == -32022
    assert replies[1]["error"]["data"]["supported"] == ["2026-07-28", "2025-11-25"]
    assert replies[2]["error"]["code"] == -32602
    assert replies[3]["error"]["code"] == -32602
    assert replies[4]["error"]["code"] == -32700
    assert replies[5]["id"] == "after-errors"
    assert process.stderr == ""


def test_registry_entry_uses_shared_argument_validation(monkeypatch, tmp_path):
    import mcp_server

    calls = []
    def fake_query(repo, label):
        calls.append((repo, label))
        return {"label": label}

    monkeypatch.setitem(mcp_server.TOOLS, "fake", {
        "description": "Fake tool", "inputSchema": {
            "type": "object", "properties": {"label": {"type": "string"}},
            "required": ["label"], "additionalProperties": False,
        }, "function": fake_query,
    })
    assert [tool["name"] for tool in mcp_server._tools_list("list", False)["result"]["tools"]] == [
        "list_places", "law_in_force", "fake"]
    reply = mcp_server._call("valid", {"name": "fake", "arguments": {"label": "ok"}}, tmp_path, False)
    assert reply["result"]["structuredContent"] == {"label": "ok"}
    assert calls == [(tmp_path, "ok")]

    for arguments in ({}, {"label": 1}, {"label": "ok", "extra": "no"}, []):
        with pytest.raises(mcp_server.ProtocolError):
            mcp_server._call("invalid", {"name": "fake", "arguments": arguments}, tmp_path, False)


def test_registry_query_value_error_becomes_tool_error(monkeypatch, tmp_path):
    import mcp_server

    def rejected(_repo, value):
        raise ValueError(f"rejected {value}")

    monkeypatch.setitem(mcp_server.TOOLS, "reject", {
        "description": "Reject value", "inputSchema": {
            "type": "object", "properties": {"value": {"type": "string"}},
            "required": ["value"], "additionalProperties": False,
        }, "function": rejected,
    })
    reply = mcp_server._call("reject", {"name": "reject", "arguments": {"value": "bad"}}, tmp_path, False)
    assert reply["result"]["isError"] is True
    assert reply["result"]["content"][0]["text"] == "rejected bad"


def test_server_and_query_use_only_standard_library_and_no_network_modules():
    for path in (SERVER, ROOT / "tools" / "query.py"):
        tree = ast.parse(path.read_text(encoding="utf-8"))
        imports = {node.names[0].name.split(".")[0] for node in ast.walk(tree) if isinstance(node, ast.Import)}
        imports |= {node.module.split(".")[0] for node in ast.walk(tree)
                    if isinstance(node, ast.ImportFrom) and node.module}
        assert imports <= sys.stdlib_module_names | {"query"}
        assert not imports & {"socket", "ssl", "urllib", "http"}


def test_timeout_names_budget_and_leaves_server_loop_available(monkeypatch):
    import mcp_server

    monkeypatch.setattr(mcp_server, "CALL_BUDGET_SECONDS", 0.01)
    monkeypatch.setitem(mcp_server.TOOLS["list_places"], "function", lambda _repo: time.sleep(0.1))
    request = modern("tools/call", "slow", {"name": "list_places", "arguments": {}})
    reply, era, initialized = mcp_server.handle(request)
    assert era == "modern" and not initialized
    assert reply["result"]["isError"] is True
    assert "0.01 second time budget" in reply["result"]["content"][0]["text"]
    reply, _, _ = mcp_server.handle(modern("tools/list", "fast"), era, initialized)
    assert reply["result"]["tools"]


def test_process_timeout_fallback(monkeypatch):
    import mcp_server

    monkeypatch.delattr(mcp_server.signal, "setitimer")
    monkeypatch.setattr(mcp_server, "CALL_BUDGET_SECONDS", 0.25)
    with pytest.raises(TimeoutError, match="0.25 second time budget"):
        mcp_server._within_budget(slow_work)


def test_process_query_value_error_becomes_tool_error_and_keeps_server_running(monkeypatch):
    import mcp_server

    monkeypatch.delattr(mcp_server.signal, "setitimer")
    monkeypatch.setattr(mcp_server, "CALL_BUDGET_SECONDS", 5)
    monkeypatch.setitem(mcp_server.TOOLS["list_places"], "function", failed_work)
    request = modern("tools/call", "error", {"name": "list_places", "arguments": {}})
    reply, era, initialized = mcp_server.handle(request)
    assert reply["result"]["isError"] is True
    assert reply["result"]["content"][0]["text"] == "query failure"
    reply, _, _ = mcp_server.handle(modern("tools/list", "after-error"), era, initialized)
    assert reply["result"]["tools"]


def test_claude_project_config_offers_local_stdio_server():
    config = json.loads((ROOT / ".mcp.json").read_text(encoding="utf-8"))
    server = config["mcpServers"]["global-esg-law"]
    assert server["command"] == "python3"
    assert server["args"] == ["${CLAUDE_PROJECT_DIR:-.}/tools/mcp_server.py"]
