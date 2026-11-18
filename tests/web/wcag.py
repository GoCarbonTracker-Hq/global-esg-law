"""Stylesheet checks for the lookup page (GEL-34 story 04, UX8).

    python3 tests/web/wcag.py [--web web]

Reads every web/*.css, checks the colour tokens and prints the WCAG 2.x
contrast of the pairs the stylesheet uses beside the figures in the UX spec.
Standard library only; reads files and prints, changes nothing.
"""
import argparse
import re
import sys
from pathlib import Path

TOKENS = ["text", "secondary", "border", "link", "page", "panel", "divider"]

# (label, foreground token, background token, spec figure, minimum, use)
PAIRS = [
    ("text on page", "text", "page", 18.1, 4.5, "text"),
    ("text on panel", "text", "panel", 16.5, 4.5, "text"),
    ("secondary on page", "secondary", "page", 6.2, 4.5, "text"),
    ("secondary on panel", "secondary", "panel", 5.7, 4.5, "text"),
    ("link on page", "link", "page", 6.1, 4.5, "text"),
    ("link on panel", "link", "panel", 5.6, 4.5, "text"),
    ("page on link (white text on the green fill)", "page", "link", 6.1, 4.5, "text"),
    ("border (secondary) on page", "border", "page", 6.2, 3.0, "border"),
    ("border (secondary) on panel", "border", "panel", 5.7, 3.0, "border"),
    ("focus ring (link) on page", "link", "page", 6.1, 3.0, "ring"),
    ("focus ring (link) on panel", "link", "panel", 5.6, 3.0, "ring"),
]

NAMED = set("""aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue
blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson
cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta
darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray
darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick
floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey
honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon
lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink
lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow
lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple
mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue
mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum
powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen
seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal
thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen""".split())

COMMENT = re.compile(r"/\*.*?\*/", re.S)
ROOT_RULE = re.compile(r"[^{}]*:root[^{}]*\{([^}]*)\}")
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
COLOUR_FN = re.compile(r"\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(", re.I)


def luminance(hex6):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (int(hex6[i:i + 2], 16) for i in (1, 3, 5))
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def contrast(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def named_colours(css):
    """Named colours in declaration values (var() names and quoted strings left out)."""
    found = []
    for block in re.findall(r"\{([^{}]*)\}", css):
        for decl in block.split(";"):
            _, _, value = decl.partition(":")
            value = re.sub(r"var\([^)]*\)|(['\"]).*?\1", " ", value)
            found += [w for w in re.findall(r"[a-z]+", value.lower()) if w in NAMED]
    return found


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--web", default=str(Path(__file__).resolve().parents[2] / "web"))
    web = Path(ap.parse_args().web)

    fails = 0

    def report(ok, text):
        nonlocal fails
        fails += not ok
        print(("ok   " if ok else "FAIL ") + text)

    files = sorted(web.glob("*.css"))
    report(bool(files), f"stylesheets read: {', '.join(f.name for f in files) or 'none'}")
    raw = "".join(f.read_text() for f in files)
    css = COMMENT.sub("", raw)

    roots = ROOT_RULE.findall(css)
    report(len(roots) == 1, f"exactly one root rule across all css files (found {len(roots)})")
    decls = {}
    for body in roots:
        for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", body):
            decls.setdefault(name, []).append(value.strip())

    value = {}
    for t in TOKENS:
        got = decls.get(f"--{t}", [])
        ref = re.fullmatch(r"var\(--([\w-]+)\)", got[0]) if got else None
        if ref and len(decls.get(f"--{ref.group(1)}", [])) == 1:
            got_hex = decls[f"--{ref.group(1)}"][0]
        else:
            got_hex = got[0] if got else ""
        ok = len(got) == 1 and re.fullmatch(r"#[0-9a-fA-F]{6}", got_hex) is not None
        report(ok, f"token --{t} defined once: {got[0] if got else 'missing'}" + (f" = {got_hex}" if ref else ""))
        value[t] = got_hex

    print()
    for label, fg, bg, spec, minimum, use in PAIRS:
        if not (re.fullmatch(r"#[0-9a-fA-F]{6}", value[fg]) and re.fullmatch(r"#[0-9a-fA-F]{6}", value[bg])):
            report(False, f"{label}: token missing")
            continue
        r = contrast(value[fg], value[bg])
        ok = r >= minimum and round(r, 1) == spec
        report(ok, f"{label} [{use}]: {r:.2f} -> {r:.1f}, spec {spec}, minimum {minimum}")

    ring = contrast(value["link"], value["link"]) if value["link"] else 0
    report(f"{ring:.2f}" == "1.00", f"focus ring on a link-coloured fill: {ring:.2f}. The outline offset keeps"
           " the ring against the page and not the fill on a filled button")
    report(re.search(r"outline-offset\s*:", css) is not None, "stylesheet uses outline-offset")
    report(re.search(r"outline\s*:\s*(none|0)\b", css) is None, "no outline removed")

    print()
    outside = ROOT_RULE.sub("", css)
    hexes = HEX.findall(outside)
    fns = COLOUR_FN.findall(outside)
    names = named_colours(outside)
    report(not hexes, f"hex colour literals outside the root rule: {len(hexes)}")
    report(not fns, f"rgb/hsl/colour functions outside the root rule: {len(fns)}")
    report(not names, f"named colours outside the root rule: {len(names)}" + (f" {sorted(set(names))}" if names else ""))
    n_http = raw.lower().count("http")
    report(n_http == 0, f"'http' occurrences in css: {n_http}")
    bad = re.findall(r"@import|url\(", raw)
    report(not bad, f"@import or url( in css: {len(bad)}")

    print("wcag.py: ok" if not fails else f"wcag.py: {fails} failed")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
