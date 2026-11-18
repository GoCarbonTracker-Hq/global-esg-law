"""STORY-GEL-34-11: the contrast of every colour pair the stylesheets use.

    python3 tests/test_web_contrast.py [--web web] [--table]

Prints one line, `pairs=<n> failing=<n>` (details go to stderr when something fails, or to stdout
with --table). Standard library only. Reads web/*.css as they are; no pair list is written here.

How a pair is found
- Tokens: the one `:root` rule. Every `var(--x)` is resolved through it. A hex colour anywhere else
  is a failure; rgb(), hsl() and named colours are reported as findings only (wcag.py fails them).
- A rule is read as (subject, state): the last compound of its selector, with :hover, :focus(-visible),
  :disabled, ::selection, a selected class or aria-current, and aria-invalid taken out as the state.
  The CSS cascade is approximated per subject: a rule applies to a subject when its simple selectors are
  a subset of the subject's, the more specific (then the later, in the order index.html links the files)
  wins. Ancestors in a selector are ignored.
- text (>= 4.5): the colour of a subject against its background. With no background of its own the
  nearest ancestor background is unknowable from CSS alone, so the colour is checked against both
  surfaces the design has: the page (body) and the panel (--panel: the answer panel and the tint behind
  the version in force). A background with no colour of its own (--panel on a hover, a row, a cell)
  gets the body colour. A fill that is not a surface and has no text colour (the legend swatches) is
  listed as a mark: its border is what must show.
- edge (>= 3): every border colour against the page and the panel, unless it is the --divider colour
  (decorative: the rows say it, nothing depends on it) or a surface-coloured placeholder that another
  state recolours (spacer: the rail row's border-left reserves 4px so the current row does not shift).
- ring (>= 3): the outline colour against the page and the panel (the offset gap and the outside show
  the surface), against the selected tint, and against any border wider than outline-offset (the ring
  then lies on it) or any fill when the offset is 0. A fill that the offset keeps apart (the Copy citation
  button, same colour as the ring) is listed as ring-gap, not counted. CSS alone cannot say which control
  sits flush inside which border, so a focus rule that sets only outline-offset (the rail row's inset ring)
  speaks for the edges of its own stylesheet: the ring then lies on such an edge only when the ring's band,
  from `offset` out to `offset + width`, reaches into the border's 0 to `width`.
- disabled: a control's text pair blended with the :disabled opacity over each surface (>= 4.5).
- A colour in any property not read above fails: the finder must not have blind spots.
- Floor: fewer than FLOOR pairs fails. The UX spec lists 12 pairs; a finder that reads fewer has lost sight
  of the stylesheet, and `pairs=0 failing=0` can never pass.
"""
import importlib.util
import re
import sys
from collections import namedtuple
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
FLOOR = 12
MIN = {"text": 4.5, "edge": 3.0, "ring": 3.0}  # other classes are listed, never failing

_spec = importlib.util.spec_from_file_location("wcag", ROOT / "tests" / "web" / "wcag.py")
wcag = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(wcag)

CONTROLS = {"input", "button", "select", "textarea"}
INHERIT, CLEAR = "inherit", "clear"
STATES = [("selection", r"::selection"), ("focus", r":focus(?:-visible)?\b"), ("disabled", r":disabled|\[disabled\]"),
          ("hover", r":hover"),
          ("selected", r"\.[\w-]*(?:current|selected|active)\b|\[aria-(?:current|selected)[^\]]*\]|:checked"),
          ("invalid", r"\[aria-invalid[^\]]*\]")]
USE = re.compile(r"var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)|#[0-9a-fA-F]{3,8}\b")
EDGE = re.compile(r"border(?:-(top|right|bottom|left))?(?:-color)?$")
Rule = namedtuple("Rule", "file line sel parts anc state spec order ink bg edges ring ringw offset opacity")


def norm(h):
    h = h.upper()
    h = "#" + "".join(c * 2 for c in h[1:]) if len(h) == 4 else h
    return h if len(h) == 7 else None


def colour(value, tokens, depth=0):
    """(hex, label) of the first colour in a declaration value, resolved through var(); None if there is none."""
    for m in USE.finditer(value):
        if m.group(1):
            got = colour(tokens.get(m.group(1), ""), tokens, depth + 1) if depth < 8 else None
            if got:
                return got[0], m.group(1)
        elif norm(m.group(0)):
            return norm(m.group(0)), m.group(0)
    return None


def px(value):
    m = re.search(r"(-?\d*\.?\d+)px", value)
    return float(m.group(1)) if m else (0.0 if value.strip() == "0" else None)


def scan(css, off=0):
    """(selector text, body, offset) of every style rule, looking inside @media, @container and @supports."""
    i = 0
    while (j := css.find("{", i)) >= 0:
        depth, k = 1, j + 1
        while depth and k < len(css):
            depth += (css[k] == "{") - (css[k] == "}")
            k += 1
        pre = css[i:j].rsplit(";", 1)[-1]
        if pre.lstrip().startswith("@"):
            yield from scan(css[j + 1:k - 1], off + j + 1)
        else:
            yield pre.strip(), css[j + 1:k - 1], off + j - len(pre.lstrip())
        i = k


def simple(compound):
    return frozenset(re.findall(r"#[\w-]+|\.[\w-]+|\[[^\]]*\]|^[a-z][\w-]*", re.sub(r":[\w-]+(?:\([^)]*\))?", "", compound)))


def subject(sel):
    """(simple selectors, ancestors' simple selectors, state, specificity) of one selector's last compound."""
    s = re.sub(r":not\([^)]*\)|::?(?:before|after)", "", sel).strip()
    *above, last = re.split(r"\s*[>+~]\s*|\s+", s)
    found = [n for n, rx in STATES if re.search(rx, last)]
    for _, rx in STATES:
        last = re.sub(rx, "", last)
    anc = frozenset().union(*map(simple, above))
    spec = (len(re.findall(r"#[\w-]+", s)), len(re.findall(r"\.[\w-]+|\[[^\]]*\]|(?<!:):[\w-]+", s)),
            len(re.findall(r"(?:^|[\s>+~])[a-z][\w-]*", s)))
    return simple(last), anc, found[0] if found else "base", spec


def parse(files):
    """(rules, tokens, problems, findings) for [(file name, css text)] in the order the page links them."""
    problems, findings, raw, roots = [], [], [], []
    for name, text in files:
        css = wcag.COMMENT.sub(lambda m: re.sub(r"[^\n]", " ", m.group()), text)
        for sel, body, at in scan(css):
            decls = []
            for d in body.split(";"):
                prop, _, val = d.partition(":")
                if val.strip():
                    decls.append((prop.strip().lower(), re.sub(r"\s*!important", "", val).strip()))
            raw.append((name, css.count("\n", 0, at) + 1, sel, decls))
            if sel == ":root":
                roots.append(raw[-1])
    if len(roots) != 1:
        problems.append(f"expected one :root rule, found {len(roots)}")
    tokens = {p: v for _, _, _, ds in roots[:1] for p, v in ds if p.startswith("--")}
    for p, v in tokens.items():
        if USE.search(v) and not colour(v, tokens) and not v.startswith("var("):
            problems.append(f"token {p}: {v} is not a #RGB or #RRGGBB colour")
    rules = []
    for name, line, sel, decls in raw:
        bodies = "{%s}" % ";".join(f"{p}:{v}" for p, v in decls)
        findings += [m + ")" for m in wcag.COLOUR_FN.findall(bodies)] + sorted(set(wcag.named_colours(bodies)))
        if (name, line, sel, decls) in roots[:1]:
            continue
        for p, v in decls:
            for h in wcag.HEX.findall(re.sub(r"(['\"]).*?\1", "", v)):
                problems.append(f"{name}:{line} {sel}: hex colour {h} outside :root")
        ink = bg = ring = ringw = offset = opacity = None
        edges = []
        for p, v in decls:
            c = colour(v, tokens)
            if p == "color":
                ink = c or INHERIT
            elif p in ("background", "background-color"):
                bg = c or CLEAR
            elif EDGE.match(p):
                if c:
                    edges.append((EDGE.match(p).group(1) or "all", c, px(v)))
            elif p in ("outline", "outline-color"):
                ring = c or ring
                ringw = px(v) if p == "outline" else ringw
            elif p == "outline-offset":
                offset = px(v)
            elif p == "opacity":
                opacity = float(v) if re.fullmatch(r"[\d.]+", v) else None
            elif c:
                problems.append(f"{name}:{line} {sel}: colour {c[1]} in `{p}`, a property this test does not pair")
        if not (ink or bg or edges or ring or offset is not None or opacity is not None):
            continue
        for one in re.split(r",(?![^()\[\]]*[)\]])", sel):
            parts, anc, state, spec = subject(one)
            rules.append(Rule(name, line, one.strip(), parts, anc, state, spec, len(rules), ink, bg, edges, ring, ringw, offset, opacity))
    return rules, tokens, problems, findings


def pick(rules, key, attr):
    """The rule that wins `attr` for a (simple selectors, ancestors, state) key."""
    parts, anc, state = key
    best = None
    for r in rules:
        if getattr(r, attr) is not None and r.parts <= parts and r.anc <= anc and r.state in ("base", state):
            if best is None or (r.spec, r.order) > (best.spec, best.order):
                best = r
    return best


def blend(c, under, a):
    mix = (round(a * int(c[0][i:i + 2], 16) + (1 - a) * int(under[0][i:i + 2], 16)) for i in (1, 3, 5))
    return "#%02X%02X%02X" % tuple(mix), f"{c[1]}@{a:g}"


def check(files, floor=FLOOR):
    """(rows, problems, findings). A row is a dict; one is failing when `min` is set and the ratio is under it."""
    rules, tokens, problems, findings = parse(files)
    rows = {}

    def src(r):
        return f"{r.file}:{r.line} {r.sel}"

    def add(kind, state, fg, bg, cls, where):
        row = rows.setdefault((kind, state, fg[0], bg[0], cls), dict(
            kind=kind, state=state, fg=fg, bg=bg, cls=cls, min=MIN.get(cls),
            ratio=wcag.contrast(fg[0], bg[0]), src=[]))
        if where not in row["src"]:
            row["src"].append(where)

    def val(r, attr):
        v = getattr(r, attr) if r else None
        return v if isinstance(v, tuple) else None

    body = (frozenset({"body"}), frozenset(), "base")
    body_bg = val(pick(rules, body, "bg"), "bg")
    body_ink_rule = pick(rules, body, "ink")
    panel = colour("var(--panel)", tokens)
    ambient = [c for c in (body_bg, panel) if c]
    if not body_bg or not val(body_ink_rule, "ink"):
        problems.append("body sets no colour or no background: the page surface is unknown")
    surfaces = {c[0] for c in ambient}
    divider = (colour("var(--divider)", tokens) or (None,))[0]
    controls = []

    for key in dict.fromkeys((r.parts, r.anc, r.state) for r in rules if r.ink or r.bg):
        parts, state = key[0], key[2]
        ri, rb = pick(rules, key, "ink"), pick(rules, key, "bg")
        ink, bg = val(ri, "ink"), val(rb, "bg")
        if ink and bg:
            add("text", state, ink, bg, "text", f"{src(ri)} on {src(rb)}")
        elif ink:
            for s in ambient:
                add("text", state, ink, s, "text", src(ri))
        elif bg and (bg[0] in surfaces or (ri and ri.ink == INHERIT)) and val(body_ink_rule, "ink"):
            add("text", state, val(body_ink_rule, "ink"), bg, "text", f"{src(rb)} (colour from body)")
        elif bg and ambient:
            add("fill", state, bg, ambient[0], "mark", f"{src(rb)} (no text colour; its border carries the edge)")
        if state == "base" and parts & CONTROLS and ink:
            controls.append((ink, bg, src(ri)))

    for r in rules:
        if r.state == "disabled" and r.opacity is not None:
            for ink, bg, where in controls:
                for s in ambient:
                    add("text", "disabled", blend(ink, s, r.opacity), blend(bg or s, s, r.opacity), "text",
                        f"{where} with {src(r)}, over {s[1]}")

    def spacer(r, side, c):
        return c[0] in surfaces and any(
            o.parts == r.parts and o.anc == r.anc and o.state != "base" and any(
                c2[0] not in surfaces and ("all" in (s2, side) or s2 == side) for s2, c2, _ in o.edges) for o in rules)

    def width(o, side, w):
        for r in sorted((r for r in rules if r.parts <= o.parts and r.anc <= o.anc), key=lambda r: (r.spec, r.order), reverse=True):
            for s2, _, w2 in r.edges:
                if w2 is not None and ("all" in (s2, side) or s2 == side):
                    return w2
        return w if w is not None else 1.0

    for r in rules:
        for side, c, w in r.edges:
            cls = "decorative" if c[0] == divider else "spacer" if spacer(r, side, c) else "edge"
            for s in ([s for s in ambient if s[0] == c[0]] if cls == "spacer" else ambient):
                add("edge", r.state, c, s, cls, src(r))
        if r.ring:
            c, off, rw = r.ring, r.offset or 0.0, r.ringw or 3.0  # no width given: outline-width "medium"
            for s in ambient:
                add("ring", r.state, c, s, "ring", f"{src(r)} (offset {off:g}px: the gap and the outside show the surface)")
            for o in rules:
                if o.state == "selected" and val(o, "bg"):
                    add("ring", "selected", c, o.bg, "ring", f"{src(r)} vs the tint {src(o)}")
                own = [x.offset for x in rules if x.file == o.file and x.state == "focus" and x.ring is None and x.offset is not None]
                here = max(own, default=off)  # the offset the edge's own stylesheet sets for its controls
                for side, ec, w in o.edges:
                    if here < width(o, side, w) and here + rw > 0:
                        add("ring", o.state, c, ec, "ring", f"{src(r)} lies on the {width(o, side, w):g}px edge {src(o)}")
                if val(o, "bg") and o.state in ("base", "selected"):
                    ratio = wcag.contrast(c[0], o.bg[0])
                    if off <= 0:
                        add("ring", o.state, c, o.bg, "ring", f"{src(r)} touches the fill {src(o)}")
                    elif ratio < MIN["ring"]:
                        add("ring", o.state, c, o.bg, "ring-gap", f"{src(r)} is {off:g}px from the fill {src(o)}")

    out = list(rows.values())
    if len(out) < floor:
        problems.append(f"only {len(out)} pairs read, the floor is {floor}: the finder or the stylesheets are missing")
    return out, problems, findings


def failing(rows):
    return [r for r in rows if r["min"] is not None and r["ratio"] < r["min"]]


def summary(rows, problems):
    return f"pairs={len(rows)} failing={len(failing(rows)) + len(problems)}"


def load(web=WEB):
    web = Path(web)
    index = web / "index.html"
    linked = re.findall(r'<link[^>]*href="([^"/]+\.css)"', index.read_text(encoding="utf-8")) if index.exists() else []
    names = [n for n in dict.fromkeys(linked) if (web / n).exists()]
    names += sorted(p.name for p in web.glob("*.css") if p.name not in names)
    return [(n, (web / n).read_text(encoding="utf-8")) for n in names]


def label(c):
    return f"{c[1]} {c[0]}"


def table(rows, problems, findings):
    lines = [f"{'class':<10} {'state':<9} {'ratio':>5} {'min':>4}  pair  [rule]"]
    for r in sorted(rows, key=lambda r: (r["cls"], r["kind"], r["state"], r["fg"][0], r["bg"][0])):
        low = " FAIL" if r in failing(rows) else ""
        lines.append(f"{r['cls']:<10} {r['state']:<9} {r['ratio']:5.2f} {r['min'] or '-':>4}  "
                     f"{label(r['fg'])} on {label(r['bg'])}{low}  [{'; '.join(r['src'])}]")
    return "\n".join(lines + [f"PROBLEM {p}" for p in problems] + [f"FINDING (not failing) {f}" for f in sorted(set(findings))])


def main(argv=None):
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--web", default=str(WEB))
    ap.add_argument("--table", action="store_true")
    args = ap.parse_args(argv)
    rows, problems, findings = check(load(args.web))
    bad = failing(rows) or problems
    if args.table:
        print(table(rows, problems, findings))
    elif bad:
        print(table([r for r in rows if r in failing(rows)], problems, []), file=sys.stderr)
    print(summary(rows, problems))
    return 1 if bad else 0


# --- fixtures: the same check() the real run uses ---
TOKENS = ":root{--text:#14161A;--secondary:#5B616B;--link:#1F6F4A;--page:#FFFFFF;--panel:#F7F4EC;--divider:#D9D4C5}\n"
BODY = "body{color:var(--text);background:var(--page)}\n"


def test_real_stylesheets_have_no_failing_pair(capsys):
    rows, problems, _ = check(load())
    line = summary(rows, problems)
    with capsys.disabled():
        print("\n" + line)
    assert len(rows) >= FLOOR, line
    assert not failing(rows) and not problems, table([r for r in rows if r in failing(rows)], problems, [])


def test_fixture_with_one_failing_pair_fails():
    rows, problems, _ = check([("f.css", TOKENS + BODY + ".weak{color:var(--secondary);background:var(--divider)}")], floor=0)
    assert [(r["fg"][1], r["bg"][1]) for r in failing(rows)] == [("--secondary", "--divider")] and not problems
    assert summary(rows, problems) == "pairs=2 failing=1"


def test_fixture_with_a_hex_outside_root_fails():
    rows, problems, _ = check([("f.css", TOKENS + BODY + ".x{color:#14161A}")], floor=0)
    assert not failing(rows) and len(problems) == 1 and "#14161A outside :root" in problems[0]
    assert summary(rows, problems) == "pairs=2 failing=1"


def test_fixture_that_is_clean_passes_with_its_pairs_counted():
    rows, problems, _ = check([("f.css", TOKENS + BODY + "a{color:var(--link)}")], floor=0)
    assert summary(rows, problems) == "pairs=3 failing=0"


def test_a_hover_and_a_ring_are_paired_and_a_ring_on_its_own_edge_fails():
    css = (TOKENS + BODY + "button{color:var(--text);background:var(--page)}\nbutton:hover{background:var(--divider)}\n"
           ":focus-visible{outline:2px solid var(--link);outline-offset:0}\n.cur{border-left:4px solid var(--link)}")
    rows, problems, _ = check([("f.css", css)], floor=0)
    pairs = {(r["cls"], r["state"], r["fg"][1], r["bg"][1]) for r in rows}
    assert ("text", "hover", "--text", "--divider") in pairs
    assert ("ring", "base", "--link", "--link") in pairs and [r["ratio"] for r in failing(rows)] == [1.0]


def test_an_inset_offset_in_the_edges_own_stylesheet_clears_the_ring_only_when_it_is_deep_enough():
    css = (TOKENS + BODY + ":focus-visible{outline:2px solid var(--link);outline-offset:2px}\n.cur{border-left:4px solid var(--link)}\n")
    ring = lambda extra, other="f.css": [r["ratio"] for r in failing(check([("f.css", css), (other, extra)], floor=0)[0])]
    assert ring("") == [1.0]
    assert ring(".row:focus-visible{outline-offset:-2px}") == []
    assert ring(".row:focus-visible{outline-offset:-1px}") == [1.0]
    assert ring(".row:focus-visible{outline-offset:-2px}", other="g.css") == [1.0]


def test_a_colour_in_an_unread_property_fails_and_rgb_is_only_a_finding():
    rows, problems, findings = check([("f.css", TOKENS + BODY + ".x{box-shadow:0 0 0 1px var(--link)}.y{border:1px solid rgb(0,0,0)}")], floor=0)
    assert len(problems) == 1 and "`box-shadow`" in problems[0] and findings == ["rgb()"]


def test_an_empty_stylesheet_never_reads_as_a_pass():
    rows, problems, _ = check([], floor=FLOOR)
    assert rows == [] and summary(rows, problems) != "pairs=0 failing=0"


if __name__ == "__main__":
    sys.exit(main())
