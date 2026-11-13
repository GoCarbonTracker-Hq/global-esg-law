#!/usr/bin/env python3
"""Local read-only MCP stdio server for global-esg-law."""
import json
import multiprocessing
import signal
import sys
from pathlib import Path

sys.dont_write_bytecode = True

from query import list_places

ROOT = Path(__file__).resolve().parents[1]
MODERN = "2026-07-28"
LEGACY = "2025-11-25"
SUPPORTED = [MODERN, LEGACY]
PROTOCOL_VERSION = "io.modelcontextprotocol/protocolVersion"
CLIENT_CAPABILITIES = "io.modelcontextprotocol/clientCapabilities"
SERVER_INFO = "io.modelcontextprotocol/serverInfo"
SERVER = {"name": "global-esg-law", "version": "1.0.0"}
CALL_BUDGET_SECONDS = 30
TOOL = {"name": "list_places", "description": "List places and the instruments held in the corpus.",
        "inputSchema": {"type": "object", "properties": {}, "additionalProperties": False}}


class ProtocolError(Exception):
    def __init__(self, code, message, data=None):
        self.code, self.message, self.data = code, message, data


def _run_worker(connection, function, args):
    try:
        connection.send((True, function(*args)))
    except Exception as error:
        connection.send((False, str(error)))
    finally:
        connection.close()


def _within_budget(function, *args):
    if not hasattr(signal, "setitimer"):
        receiver, sender = multiprocessing.Pipe(duplex=False)
        process = multiprocessing.Process(target=_run_worker, args=(sender, function, args))
        process.start()
        sender.close()
        try:
            if not receiver.poll(CALL_BUDGET_SECONDS):
                process.terminate()
                raise TimeoutError(f"Tool call exceeded the {CALL_BUDGET_SECONDS} second time budget")
            success, result = receiver.recv()
            process.join()
            if not success:
                raise RuntimeError(result)
            return result
        finally:
            receiver.close()
            if process.is_alive():
                process.terminate()
            process.join()
    previous_handler = signal.getsignal(signal.SIGALRM)
    previous_timer = signal.getitimer(signal.ITIMER_REAL)

    def expired(_signum, _frame):
        raise TimeoutError(f"Tool call exceeded the {CALL_BUDGET_SECONDS} second time budget")

    signal.signal(signal.SIGALRM, expired)
    signal.setitimer(signal.ITIMER_REAL, CALL_BUDGET_SECONDS)
    try:
        return function(*args)
    finally:
        signal.setitimer(signal.ITIMER_REAL, *previous_timer)
        signal.signal(signal.SIGALRM, previous_handler)


def _error(request_id, code, message, data=None):
    error = {"code": code, "message": message}
    if data is not None:
        error["data"] = data
    return {"jsonrpc": "2.0", "id": request_id, "error": error}


def _result(request_id, result, modern):
    if modern:
        result["_meta"] = {SERVER_INFO: SERVER}
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def _check_modern_meta(params):
    meta = params.get("_meta")
    if not isinstance(meta, dict) or not isinstance(meta.get(PROTOCOL_VERSION), str) \
            or not isinstance(meta.get(CLIENT_CAPABILITIES), dict):
        raise ProtocolError(-32602, "Missing required request metadata")
    version = meta[PROTOCOL_VERSION]
    if version not in SUPPORTED:
        raise ProtocolError(-32022, "Unsupported protocol version",
                            {"supported": SUPPORTED, "requested": version})
    if version != MODERN:
        raise ProtocolError(-32602, "Legacy requests must use initialize")


def _initialize(request_id, params):
    version = params.get("protocolVersion")
    if not isinstance(version, str):
        raise ProtocolError(-32602, "Invalid initialize protocol version")
    if version != LEGACY:
        raise ProtocolError(-32602, "Unsupported protocol version",
                            {"supported": [LEGACY], "requested": version})
    if not isinstance(params.get("capabilities"), dict) or not isinstance(params.get("clientInfo"), dict):
        raise ProtocolError(-32602, "Invalid initialize parameters")
    result = {"protocolVersion": LEGACY, "capabilities": {"tools": {"listChanged": False}},
              "serverInfo": SERVER}
    return _result(request_id, result, False), "legacy", False


def _tools_list(request_id, modern):
    result = {"tools": [TOOL]}
    if modern:
        result.update(resultType="complete", ttlMs=300000, cacheScope="public")
    return _result(request_id, result, modern)


def _call(request_id, params, repo, modern):
    name = params.get("name")
    if name != "list_places":
        raise ProtocolError(-32602, f"Unknown tool: {name}")
    arguments = params.get("arguments", {})
    if not isinstance(arguments, dict) or arguments:
        raise ProtocolError(-32602, "list_places accepts no arguments")
    answer = _within_budget(list_places, repo)
    result = {"content": [{"type": "text", "text": json.dumps(answer, ensure_ascii=False)}],
              "structuredContent": answer, "isError": False}
    if modern:
        result["resultType"] = "complete"
    return _result(request_id, result, modern)


def handle(request, repo=ROOT, era=None, initialized=False):
    """Return (reply, era, initialized); notifications have no reply."""
    if not isinstance(request, dict) or request.get("jsonrpc") != "2.0" or not isinstance(request.get("method"), str):
        return _error(request.get("id") if isinstance(request, dict) else None, -32600, "Invalid Request"), era, initialized
    request_id = request.get("id")
    if "id" not in request:
        if request["method"] == "notifications/initialized" and era == "legacy":
            return None, era, True
        return None, era, initialized
    if request_id is None or isinstance(request_id, bool) or not isinstance(request_id, (str, int, float)):
        return _error(None, -32600, "Invalid Request"), era, initialized
    params = request.get("params", {})
    if not isinstance(params, dict):
        return _error(request_id, -32602, "Invalid params"), era, initialized
    method = request["method"]
    if method == "initialize":
        try:
            if era not in (None, "legacy"):
                raise ProtocolError(-32600, "Cannot initialize a modern connection")
            reply, era, initialized = _initialize(request_id, params)
            return reply, era, initialized
        except ProtocolError as error:
            return _error(request_id, error.code, error.message, error.data), era, initialized
    modern = era != "legacy"
    if modern:
        try:
            _check_modern_meta(params)
        except ProtocolError as error:
            return _error(request_id, error.code, error.message, error.data), era, initialized
        era = "modern"
    elif not initialized:
        return _error(request_id, -32600, "Server is not initialized"), era, initialized
    if method == "server/discover" and modern:
        return _result(request_id, {"resultType": "complete", "supportedVersions": SUPPORTED,
                                    "capabilities": {"tools": {"listChanged": False}},
                                    "ttlMs": 300000, "cacheScope": "public"}, True), era, initialized
    if method == "tools/list":
        return _tools_list(request_id, modern), era, initialized
    if method == "tools/call":
        try:
            return _call(request_id, params, repo, modern), era, initialized
        except ProtocolError as error:
            return _error(request_id, error.code, error.message, error.data), era, initialized
        except TimeoutError as error:
            result = {"content": [{"type": "text", "text": str(error)}], "isError": True}
            if modern:
                result["resultType"] = "complete"
            return _result(request_id, result, modern), era, initialized
        except Exception as error:
            return _error(request_id, -32603, str(error)), era, initialized
    return _error(request_id, -32601, "Method not found"), era, initialized


def main():
    era, initialized = None, False
    for line in sys.stdin:
        try:
            request = json.loads(line)
        except json.JSONDecodeError:
            reply = {"jsonrpc": "2.0", "id": None,
                     "error": {"code": -32700, "message": "Parse error: Invalid JSON"}}
        else:
            reply, era, initialized = handle(request, ROOT, era, initialized)
        if reply is not None:
            sys.stdout.write(json.dumps(reply, ensure_ascii=False, separators=(",", ":")) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
