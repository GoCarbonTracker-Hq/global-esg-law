// Checks for STORY-GEL-34-11, part 2: the focus ring on the selected rail row. tests/web/check.mjs imports this file.
//
// The finding (tests/test_web_contrast.py, report GEL-34-REPORT-11-contrast.md): the rail row is a button flush inside an li whose
// border-left is 4px and, on the selected row, the link colour. The global ring (2px, offset 2px, link colour) then lies exactly on
// that 4px edge: link on link. The test models it from CSS only; this file reads the real geometry in Chrome.
//
// What it proves, with the keyboard path (a real Tab, so :focus-visible matches):
//   - the focused selected rail row: the ring band on the left side does not overlap the li's 4px left-border strip, the ring is
//     a solid 2px line in the link colour, and no ancestor that clips (overflow other than visible) cuts it off;
//   - a plain (not selected) rail row and the Copy citation button still show a solid 2px ring.
// The expected side is two constants the story and the CSS comments state (a 4px edge, a 2px ring), never a value the page's own
// code chose. Safari, Firefox, Lighthouse and VoiceOver are not run here: by hand.
const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const EDGE = 4; // px: .rail-list li { border-left: 4px solid ... } (story 07)
const RING = 2; // px: :focus-visible { outline: 2px solid var(--link) } (UX spec)
const LINK = "rgb(31, 111, 74)"; // --link #1F6F4A, the same constant 08-cite.mjs uses

// Tab from the date field until `want(el)` is true for the focused element; the number of presses, or 0.
async function tabTo(h, want) {
  await h.evaluate(`document.getElementById("date").focus()`);
  for (let i = 1; i <= 60; i++) {
    await h.press("Tab");
    if (await h.evaluate(`(${want})(document.activeElement)`)) return i;
  }
  return 0;
}

// What the page draws round the focused element: the outline, its box and the li strip behind it, and every clipping ancestor.
const READ = `(() => {
  const el = document.activeElement, s = getComputedStyle(el), r = el.getBoundingClientRect();
  const li = el.closest("li"), lr = li && li.getBoundingClientRect(), ls = li && getComputedStyle(li);
  const rect = (x) => ({ l: x.left, r: x.right, t: x.top, b: x.bottom });
  const clips = [];
  for (let a = el.parentElement; a; a = a.parentElement) {
    const o = getComputedStyle(a);
    if ([o.overflowX, o.overflowY].some((v) => v !== "visible")) clips.push({ tag: a.tagName + (a.id ? "#" + a.id : ""), box: rect(a.getBoundingClientRect()) });
  }
  return {
    tag: el.tagName, cls: el.className, text: el.textContent.trim().slice(0, 30), focusVisible: el.matches(":focus-visible"),
    style: s.outlineStyle, width: parseFloat(s.outlineWidth), offset: parseFloat(s.outlineOffset), color: s.outlineColor,
    box: rect(r), current: !!li && li.classList.contains("rail-current"),
    strip: li ? { l: lr.left, r: lr.left + parseFloat(ls.borderLeftWidth), w: parseFloat(ls.borderLeftWidth), color: ls.borderLeftColor } : null,
    clips,
  };
})()`;

// Where the outline band lies on each side, from the border box of the element: it starts offset px out and is width px thick.
const band = (g) => ({
  l: [g.box.l - g.offset - g.width, g.box.l - g.offset],
  r: [g.box.r + g.offset, g.box.r + g.offset + g.width],
  t: [g.box.t - g.offset - g.width, g.box.t - g.offset],
  b: [g.box.b + g.offset, g.box.b + g.offset + g.width],
});
const outer = (g) => ({ l: g.box.l - g.offset - g.width, r: g.box.r + g.offset + g.width, t: g.box.t - g.offset - g.width, b: g.box.b + g.offset + g.width });

// The problems common to every ring: a real :focus-visible, a solid line of the stated width and colour.
const ringProblems = (g, name) => [
  ...(g.focusVisible ? [] : [name + ": the focused element does not match :focus-visible"]),
  ...(g.style === "solid" ? [] : [name + ": outline-style " + g.style + ", want solid"]),
  ...(g.width === RING ? [] : [name + ": outline-width " + g.width + "px, want " + RING + "px"]),
  ...(g.color === LINK ? [] : [name + ": outline-color " + g.color + ", want " + LINK]),
];

export async function run(h) {
  await h.open("ok");
  await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)});`);

  // The selected row: found by the keyboard, not by a focus() call.
  const cur = await tabTo(h, `(el) => el.classList.contains("rail-row") && !!el.closest("li.rail-current")`);
  const sel = cur ? await h.evaluate(READ) : null;
  h.verdict("11-ring", "Tab reaches the selected rail row (a button inside li.rail-current)", cur ? [] : ["no Tab in 60 reached a .rail-row inside li.rail-current"]);
  if (sel) {
    const strip = sel.strip, o = outer(sel), b = band(sel);
    const over = (x) => Math.min(b.l[1], strip.r) - Math.max(b.l[0], strip.l) > 0.01 ? [x] : [];
    h.verdict("11-ring", "the selected row: the li's left edge is " + EDGE + "px in the link colour and the ring band on the left side does not overlap it (ring " + RING + "px, offset " + sel.offset + "px)", [
      ...(sel.tag === "BUTTON" && sel.current ? [] : ["the focused element is " + sel.tag + ", inside li.rail-current: " + sel.current]),
      ...(strip.w === EDGE ? [] : ["li border-left-width " + strip.w + "px, want " + EDGE + "px"]),
      ...(strip.color === LINK ? [] : ["li border-left-color " + strip.color + ", want " + LINK]),
      ...over("ring band " + b.l.map((x) => Math.round(x * 10) / 10).join(" to ") + " lies on the edge strip " + strip.l + " to " + strip.r),
    ]);
    h.verdict("11-ring", "the selected row's ring is a solid " + RING + "px line in the link colour, and no clipping ancestor cuts it (" + (sel.clips.map((c) => c.tag).join(", ") || "none clip") + ")", [
      ...ringProblems(sel, "selected row"),
      ...sel.clips.filter((c) => o.l < c.box.l - 0.01 || o.r > c.box.r + 0.01 || o.t < c.box.t - 0.01 || o.b > c.box.b + 0.01).map((c) => "the ring box " + JSON.stringify(o) + " reaches outside the clipping " + c.tag + " " + JSON.stringify(c.box)),
    ]);
  }

  // A row that is not selected, and the Copy citation button: the ring is still there.
  const plain = await tabTo(h, `(el) => el.classList.contains("rail-row") && !el.closest("li.rail-current")`);
  const row = plain ? await h.evaluate(READ) : null;
  h.verdict("11-ring", "a rail row that is not selected shows a solid " + RING + "px ring in the link colour", plain ? ringProblems(row, "plain row") : ["no Tab in 60 reached a .rail-row outside li.rail-current"]);
  const copy = await tabTo(h, `(el) => el.id === "citation-copy"`);
  const btn = copy ? await h.evaluate(READ) : null;
  h.verdict("11-ring", "the Copy citation button shows a solid " + RING + "px ring in the link colour", copy ? ringProblems(btn, "Copy citation") : ["no Tab in 60 reached #citation-copy"]);
  console.log("  note: Safari, Firefox, Lighthouse and VoiceOver: not run, by hand");
}
