"""GEL_ISO2=<ISO2> restricts the tests that read the real repo to one place. Unset means the whole repo."""
import os

ISO2 = os.environ.get("GEL_ISO2") or None


def real_scope_paths(root):
    """Sorted register/<place>/scope.json paths of the real repo, limited to GEL_ISO2 when set."""
    return sorted(root.glob(f"register/{ISO2 or '*'}/scope.json"))
