"""GEL_ISO2=<ISO2> restricts the tests that read the real repo to one place. Unset means the whole repo."""
import os

ISO2 = os.environ.get("GEL_ISO2") or None


def real_scope_paths(root):
    """Sorted register/<place>/scope.json paths of the real repo, limited to GEL_ISO2 when set."""
    return sorted(root.glob(f"register/{ISO2 or '*'}/scope.json"))


NO_HISTORY = "real history ref missing: neither history nor origin/history exists in this clone"
_history_skips = []


def pytest_runtest_logreport(report):
    """On CI (CI set to a true value) a test skipped with exactly NO_HISTORY is a failure."""
    if os.environ.get("CI", "").lower() not in ("", "0", "false") and report.skipped:
        reason = report.longrepr[-1] if isinstance(report.longrepr, tuple) else str(report.longrepr)
        if reason.removeprefix("Skipped: ") == NO_HISTORY:
            _history_skips.append(report.nodeid)


def pytest_sessionfinish(session, exitstatus):
    if _history_skips:
        print(f"\nFAILED: {len(_history_skips)} tests were skipped for a missing history ref on CI: {_history_skips}")
        session.exitstatus = 1
