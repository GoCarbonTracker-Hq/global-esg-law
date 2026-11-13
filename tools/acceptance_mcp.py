#!/usr/bin/env python3
"""Fresh-clone acceptance run for the MCP server.

    python3 tools/acceptance_mcp.py <repository URL or path> [--only TOOL]

Clones the repository with a plain `git clone` into a new temporary folder (so `main` is checked
out and only `origin/history` exists), starts that clone's tools/mcp_server.py, runs the same
scripted client in both protocol eras, prints one line per check and exits 1 on any failure.
"""
import argparse
import json
import select
import subprocess
import sys
import tempfile
from pathlib import Path

REPLY_TIMEOUT = 60  # seconds to wait for one reply
MODERN, LEGACY = "2026-07-28", "2025-11-25"
META = "io.modelcontextprotocol/"
CSRD = "eu-csrd-2022-2464"
AE_ID = "ae-dl-11-2024-climate"
CSRD_URL = "https://eur-lex.europa.eu/eli/dir/2022/2464/oj"
AE_URL = "https://uaelegislation.gov.ae/en/legislations/2558"
OCR_PLACE, OCR_ID, OCR_FIRST = "YE", "ye-consumer-protection-regulation-2010", "2010-05-12"  # record has "extraction": "ocr"


def blob(answer):
    return json.dumps(answer, ensure_ascii=False).lower()


def has(*needles):
    """Pass when every needle appears in the answer (case-insensitive); field names stay loose."""
    return lambda answer: [f"missing {n!r}" for n in needles if n.lower() not in blob(answer)]


def in_order(*needles):
    def check(answer):
        text = blob(answer)
        spots = [text.find(n.lower()) for n in needles]
        return [] if -1 not in spots and spots == sorted(spots) else [f"not all present in order: {needles}"]
    return check


def place(answer, iso2):
    if "rows" in answer:
        return next((dict(zip(answer["columns"], r)) for r in answer["rows"] if r[0] == iso2), {})
    return next((p for p in answer.get("places", []) if p["iso2"] == iso2), {})


def instrument(answer, iso2, instrument_id):
    return next((i for i in place(answer, iso2).get("instruments", []) if i["id"] == instrument_id), {})


def list_places_envelope(answer):
    errors = []
    if answer.get("snapshot", {}).get("history_ref") != "origin/history":
        errors.append(f"history_ref is {answer.get('snapshot', {}).get('history_ref')!r}, expected 'origin/history'")
    if "status" not in answer.get("coverage", {}):
        errors.append("no coverage status")
    if "not legal advice" not in answer.get("notice", "").lower():
        errors.append("notice missing")
    return errors


def list_places_summary(answer):
    errors = []
    if answer.get("place_count", 0) < 100 or answer.get("place_count") != len(answer.get("rows", [])):
        errors.append(f"place_count {answer.get('place_count')}, {len(answer.get('rows', []))} rows")
    if "places" in answer or any(len(r) != len(answer["columns"]) for r in answer.get("rows", [])):
        errors.append("table is not columns plus rows")
    size = len(json.dumps(answer, separators=(",", ":")))
    if size > 15000:
        errors.append(f"answer is {size} characters, over 15000")
    ae = place(answer, "AE")
    if (ae.get("status"), ae.get("stored_count"), ae.get("link_only_count", 0) > 0) != ("link only", 0, True):
        errors.append(f"AE is {ae.get('status')!r}, stored {ae.get('stored_count')}")
    return errors


def one_place(iso2, instrument_id, status, first):
    def check(answer):
        if [p["iso2"] for p in answer.get("places", [])] != [iso2]:
            return [f"expected only {iso2}"]
        found = instrument(answer, iso2, instrument_id)
        return [] if (found.get("status"), found.get("first_in_force")) == (status, first) else [f"{iso2} instrument is {found}"]
    return check


# One table, one list per tool. A check is (label, arguments, expect_error, test).
# test(answer) returns a list of problems. `answer` is structuredContent, or the error text when
# expect_error is true.
CHECKS = {
    "list_places": [
        ("envelope reads origin/history in a fresh clone", {}, False, list_places_envelope),
        ("compact table (columns and rows), under 15000 characters, AE is link only", {}, False, list_places_summary),
        ("EU CSRD is text stored from 2023-01-05", {"place": "EU"}, False, one_place("EU", CSRD, "text stored", "2023-01-05")),
        ("AE instrument is link only", {"place": "AE"}, False, one_place("AE", AE_ID, "link only", None)),
        (f"{OCR_PLACE} OCR instrument is text stored from {OCR_FIRST}", {"place": OCR_PLACE}, False,
         one_place(OCR_PLACE, OCR_ID, "text stored", OCR_FIRST)),
        ("input error: malformed place", {"place": "xx"}, True, has("two capital letters")),
        ("input error: unknown place", {"place": "ZZ"}, True, has("unknown place")),
        ("unknown argument is a protocol error", {"colour": "red"}, "protocol", lambda a: []),
    ],
    "law_in_force": [
        ("stored text: EU 2025-06-01 lists the CSRD", {"place": "EU", "date": "2025-06-01"}, False, has(CSRD)),
        ("not yet in force: EE 2026-01-01 has ee-aoks-ets dated 2026-03-28 apart from the six in force",
         {"place": "EE", "date": "2026-01-01"}, False, has("ee-aoks-ets", "2026-03-28", "ee-tks-2024-825-act", "2026-07-13")),
        ("link-only place: AE lists its instrument as not stored with the official URL",
         {"place": "AE", "date": "2026-01-01"}, False, has(AE_ID, AE_URL, "not stored")),
        ("input error: impossible date", {"place": "EU", "date": "2026-13-45"}, True, has("yyyy-mm-dd")),
    ],
    "read_text": [
        ("stored text: CSRD adopted text of 2023-01-05 in parts (total_chars 267926, next_offset 20000)",
         {"instrument": CSRD, "date": "2023-06-01"}, False, has("2023-01-05", CSRD_URL, '"total_chars": 267926', '"next_offset": 20000')),
        ("stored text: CSRD version of 2025-04-17 with source URL",
         {"instrument": CSRD, "date": "2025-06-01"}, False, has("2025-04-17", CSRD_URL, "02022L2464")),
        ("OCR record is flagged as uncorrected OCR",
         {"instrument": OCR_ID, "date": "2026-01-01"}, False, has('"ocr": true', "uncorrected ocr")),
        ("link-only instrument: no text, official URL",
         {"instrument": AE_ID, "date": "2026-01-01"}, False, has(AE_URL, "not stored")),
        ("input error: path-like instrument id", {"instrument": "../../etc/passwd", "date": "2026-01-01"}, True, has("instrument")),
    ],
    "instrument_history": [
        ("CSRD has its three versions in order",
         {"instrument": CSRD}, False, in_order("2023-01-05", "2025-04-17", "2026-03-18")),
        ("link-only instrument: not stored, official URL",
         {"instrument": AE_ID}, False, has("not stored", AE_URL)),
        ("input error: unknown id", {"instrument": "no-such-instrument"}, True, has("instrument")),
    ],
}


class Client:
    def __init__(self, root, era):
        self.era, self.next_id = era, 0
        self.proc = subprocess.Popen([sys.executable, str(Path(root) / "tools" / "mcp_server.py")], cwd=root,
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if era == LEGACY:
            try:
                self.request("initialize", {"protocolVersion": LEGACY, "capabilities": {},
                                            "clientInfo": {"name": "acceptance", "version": "1"}})
                self.send({"jsonrpc": "2.0", "method": "notifications/initialized"})
            except BaseException:
                self.proc.kill()
                raise

    def send(self, message):
        self.proc.stdin.write(json.dumps(message) + "\n")
        self.proc.stdin.flush()

    def request(self, method, params=None):
        self.next_id += 1
        params = dict(params or {})
        if self.era == MODERN:
            params["_meta"] = {META + "protocolVersion": MODERN, META + "clientCapabilities": {},
                               META + "clientInfo": {"name": "acceptance", "version": "1"}}
        self.send({"jsonrpc": "2.0", "id": self.next_id, "method": method, "params": params})
        if not select.select([self.proc.stdout], [], [], REPLY_TIMEOUT)[0]:
            raise TimeoutError(f"no reply to {method} within {REPLY_TIMEOUT} seconds")
        line = self.proc.stdout.readline()
        if not line:
            raise RuntimeError("server closed stdout: " + self.proc.stderr.read()[-300:])
        return json.loads(line)

    def close(self):
        self.proc.stdin.close()
        try:
            self.proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            self.proc.kill()
            self.proc.wait()
        return self.proc.stderr.read()


def judge(reply, expect_error, test):
    """The list of problems for one reply; a malformed reply is a problem, not an exception."""
    try:
        if expect_error == "protocol":
            return [] if "error" in reply else ["expected a protocol error"]
        if "error" in reply:
            return ["protocol error " + json.dumps(reply["error"])]
        result = reply["result"]
        if result.get("isError") != bool(expect_error):
            return [f"isError is {result.get('isError')}, expected {bool(expect_error)}"]
        answer = result["content"][0]["text"] if expect_error else result.get("structuredContent")
        return ["no structuredContent"] if answer is None else test(answer)
    except (KeyError, IndexError, TypeError, AttributeError) as error:
        return [f"malformed reply: {error!r}"]


def run_checks(root, era, checks=CHECKS, only=None):
    """Return a list of (ok, line) for one era."""
    out, tag = [], f"[{era}]"
    try:
        client = Client(root, era)
    except Exception as error:
        return [(False, f"{tag} server did not start: {error}")]
    try:
        if era == MODERN:
            found = client.request("server/discover").get("result", {}).get("supportedVersions")
            out.append((found == [MODERN, LEGACY], f"{tag} server/discover lists {found}"))
        listed = {t["name"]: t for t in client.request("tools/list")["result"]["tools"]}
        out.append((all("inputSchema" in t for t in listed.values()), f"{tag} tools listed: {sorted(listed)}"))
        for tool in ([only] if only else list(checks)):
            if tool not in listed:
                out.append((False, f"{tag} {tool}: not present on the server"))
                continue
            for label, args, expect_error, test in checks.get(tool, []):
                problems = judge(client.request("tools/call", {"name": tool, "arguments": args}), expect_error, test)
                out.append((not problems, f"{tag} {tool}: {label}" + ("" if not problems else " -> " + "; ".join(problems))))
        if not only:
            for tool in listed.keys() - checks.keys():
                out.append((False, f"{tag} {tool}: listed by the server, no checks written"))
    except Exception as error:  # a hung or dead server or a reply that is not JSON: stop this era, keep the lines so far
        out.append((False, f"{tag} run stopped: {error!r}"))
    finally:
        stderr = client.close()
    out.append((stderr == "", f"{tag} nothing written to stderr" + ("" if stderr == "" else ": " + stderr[:200])))
    return out


def clone(source, destination):
    subprocess.run(["git", "clone", "--quiet", source, str(destination)], check=True)
    git = lambda *a: subprocess.run(["git", "-C", str(destination), *a], capture_output=True, text=True)
    local = git("rev-parse", "--verify", "--quiet", "refs/heads/history").returncode == 0
    remote = git("rev-parse", "--verify", "--quiet", "refs/remotes/origin/history").returncode == 0
    return [(not local and remote, f"clone: no local history branch, origin/history present (local={local}, origin={remote})")]


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("source", help="repository URL or path to clone")
    parser.add_argument("--only", choices=list(CHECKS), help="check one tool only")
    args = parser.parse_args(argv)
    with tempfile.TemporaryDirectory(prefix="gel-acceptance-") as tmp:
        root = Path(tmp) / "clone"
        lines = clone(args.source, root)
        for era in (MODERN, LEGACY):
            lines += run_checks(root, era, only=args.only)
    for ok, line in lines:
        print(("PASS " if ok else "FAIL ") + line)
    failed = sum(not ok for ok, _ in lines)
    print(f"{len(lines) - failed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
