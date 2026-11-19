// Checks for STORY-GEL-34-11, the Chrome emulation, zoom and text-spacing rows (R26, R29 to R33, R36). tests/web/check.mjs imports this file.
//
//   R26  the keyboard ring on Copy citation and on the selected rail row: a real Tab, the computed ring, and two screenshots saved for a person
//   R29  forced colours (Emulation.setEmulatedMedia forced-colors: active): the version in force keeps its label and edge, borders and ring stay visible
//   R30  reduced motion (prefers-reduced-motion: reduce): the copy confirmation appears with no transition or animation and sits in a live region
//   R31  colour-vision options (Emulation.setEmulatedVisionDeficiency, the list is read from the browser): what a script can measure, and one screenshot each
//   R32  a 640 CSS px window (200% zoom of a 1280 px window), on each of the 21 states of the story: text clipped, overlapping, lost; the controls
//   R33  WCAG 1.4.12 text spacing (line-height 1.5, paragraph spacing 2em, letter-spacing 0.12em, word-spacing 0.16em), the same measures, at 1280 and 640
//   R36  a 320 CSS px window (400% zoom of a 1280 px window), the same measures
//
// A script can read boxes and computed styles. It cannot see colour as a person does, judge whether a layout reads well, or hear a screen reader.
// Each verdict says what it measured; "Pass" never covers the looking. Expected values (the 21 states, the dates, the wording, the 2 px ring,
// the 4 px edge, the WCAG 1.4.12 numbers) are written here from the story and the UX spec, never read from web/*.js.
// Screenshots go to ~/.cache/gel34-chrome/11-emulation/shots/ (GEL34_SHOTS overrides it, for the scratch copies that prove the checks can fail).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const SHOTS = process.env.GEL34_SHOTS || path.join(os.homedir(), ".cache/gel34-chrome/11-emulation/shots");
const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const KZ = { id: "kz-advertising-law", date: "2026-11-17", versions: 150 };
const READ_ON = "2026-11-17";
const NO_MATCH_LINE = "No law matches. Browse by place below.";
const HINT = "Enter a date in the form 2025-06-01.";
const LOAD_FAIL = "The law list did not load.";
const EDGE = 4; // px: the rail's left edge (story 07)
const RING = 2; // px: the focus ring (UX spec)
const LINK = "rgb(27, 77, 62)"; // --link #1B4D3E
const BASE_W = 1280, BASE_H = 720; // the window the story names; 200% zoom is half of it in CSS px, 400% is a quarter
const READY = `!!(window.GEL && GEL.data && !document.getElementById("example").disabled && !document.getElementById("date").disabled)`;
const SPACING = "*,*::before,*::after{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}";

// ---------- the browser, as 11-whole-page.mjs drives it ----------
async function section(h, tag, fn) {
  try { await fn(); } catch (e) { h.check(tag, "section ran to the end", false, "threw: " + e.message); }
}
async function onBrowser(h, method, params) {
  try {
    return await h.send(method, params);
  } catch (pageError) {
    const version = await (await fetch(`http://127.0.0.1:${h.cdp}/json/version`)).json();
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((ok, bad) => { ws.onopen = ok; ws.onerror = () => bad(new Error("browser WebSocket failed")); });
    try {
      return await new Promise((ok, bad) => {
        ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id === 1) m.error ? bad(new Error(`${method}: ${m.error.message}`)) : ok(m.result); };
        ws.send(JSON.stringify({ id: 1, method, params }));
      });
    } finally { ws.close(); }
  }
}
async function grantClipboard(h) {
  const origin = await h.evaluate("location.origin");
  await onBrowser(h, "Browser.grantPermissions", { origin, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] });
}
async function clickReal(h, selector) {
  const c = await h.evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    el.scrollIntoView({ block: "center", behavior: "instant" });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  await h.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: c.x, y: c.y });
  await h.send("Input.dispatchMouseEvent", { type: "mousePressed", x: c.x, y: c.y, button: "left", clickCount: 1 });
  await h.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: c.x, y: c.y, button: "left", clickCount: 1 });
}
async function typeLaw(h, text) {
  await h.evaluate(`(() => { const l = document.getElementById("law"); l.focus(); l.select(); })()`);
  await h.send("Input.insertText", { text });
}
async function tabTo(h, want) {
  await h.evaluate(`document.getElementById("date").focus()`);
  for (let i = 1; i <= 60; i++) {
    await h.press("Tab");
    if (await h.evaluate(`(${want})(document.activeElement)`)) return i;
  }
  return 0;
}
const metrics = (h, w, ht) => h.send("Emulation.setDeviceMetricsOverride", { width: w, height: ht, deviceScaleFactor: 1, mobile: false });
// Everything an emulation here can leave behind, undone (the harness resets only the timezone, the metrics, scripts and the network).
async function reset(h) {
  await h.send("Emulation.setEmulatedMedia", { features: [] }).catch(() => {});
  await h.send("Emulation.setEmulatedVisionDeficiency", { type: "none" }).catch(() => {});
  await h.send("Emulation.clearDeviceMetricsOverride").catch(() => {});
  await h.send("Accessibility.disable").catch(() => {});
  await onBrowser(h, "Browser.resetPermissions", {}).catch(() => {});
}

// A screenshot saved for a person; the bytes, the size read from the PNG header, and a hash.
async function shot(h, name, clip) {
  fs.mkdirSync(SHOTS, { recursive: true });
  const r = await h.send("Page.captureScreenshot", { format: "png", ...(clip ? { clip: { ...clip, scale: 2 } } : {}) });
  const buf = Buffer.from(r.data, "base64");
  const file = path.join(SHOTS, name);
  fs.writeFileSync(file, buf);
  const png = buf.length > 24 && buf.subarray(1, 4).toString() === "PNG";
  return { file, png, w: png ? buf.readUInt32BE(16) : 0, h: png ? buf.readUInt32BE(20) : 0, bytes: buf.length, sha: crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12) };
}
const around = (r, pad) => ({ x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: r.w + 2 * pad, height: r.h + 2 * pad });

// ---------- colours: WCAG relative luminance and contrast, to read a computed rgb()/rgba() ----------
const rgba = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
const lum = ({ r, g, b }) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((t, v, i) => t + v * [0.2126, 0.7152, 0.0722][i], 0);
function contrast(fgText, bgText, canvasText = "rgb(0, 0, 0)") {
  // a translucent colour is laid over what is behind it: the background over the canvas, the foreground over that
  const bg = rgba(bgText), fg = rgba(fgText), base = rgba(canvasText);
  if (!bg || !fg || !base) return null;
  const b = over(bg, base), f = over(fg, b);
  const [hi, lo] = [lum(f), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
const round1 = (x) => Math.round(x * 10) / 10;

// ---------- the 21 states of the story's "Context" list (as 11-whole-page.mjs; the story says 20, its list has 21) ----------
const byAddress = (id, date, snap) => async (c) => {
  await c.h.open("ok");
  await c.h.navigate("about:blank");
  await c.h.navigate(c.origin + "/#law=" + id + "&date=" + date + "&snapshot=" + (snap ?? c.snap));
  await c.h.waitFor(READY, 10000);
};
const shows = (m, state, ...words) => [
  ...(m.shown && m.state === state ? [] : ["the answer panel is shown " + m.shown + " in state " + m.state + ", want shown in state " + state]),
  ...words.filter((w) => !(m.text || "").includes(w)).map((w) => "the panel does not say " + JSON.stringify(w)),
];
const STATES = [
  { n: 1, name: "first screen", reach: async (c) => { await c.h.open("ok"); }, expect: (m) => (m.shown ? ["the answer panel is shown"] : []) },
  {
    n: 2, name: "load failure", noData: true,
    reach: async (c) => { await c.h.open("missing", { ready: false }); await c.h.waitFor(`document.getElementById("load-status").textContent.trim() !== ""`, 10000); },
    expect: (m) => (m.loadStatus && m.loadStatus.includes(LOAD_FAIL) ? [] : ["the load line is " + JSON.stringify(m.loadStatus) + ", want " + JSON.stringify(LOAD_FAIL)]),
  },
  { n: 3, name: "in-force answer", id: CSRD.id, date: CSRD.date, expect: (m) => shows(m, "plain", "In force since 2025-04-17") },
  { n: 4, name: "link only", id: "ae-dl-11-2024-climate", date: READ_ON, expect: (m) => shows(m, "interim", "only a link") },
  { n: 5, name: "before the first version", id: CSRD.id, date: "2022-12-31", expect: (m) => shows(m, "interim", "2023-01-05") },
  { n: 6, name: "repealed", id: "gn-arrete-2022-1646-evaluations-environnementales", date: "2024-01-01", expect: (m) => shows(m, "interim", "Repealed on 2023-05-05") },
  { n: 7, name: "not yet in force", id: "eu-eudr-2023-1115", date: CSRD.date, expect: (m) => shows(m, "plain", "2026-12-30") },
  {
    n: 8, name: "no match answer",
    reach: async (c) => {
      await c.h.open("ok");
      await c.h.evaluate(`GEL.setDate(${JSON.stringify(CSRD.date)})`);
      await typeLaw(c.h, "Sarbanes-Oxley");
      await c.h.press("Enter");
      await c.h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "no-match"`, 5000);
    },
    expect: (m) => shows(m, "no-match", "Sarbanes-Oxley"),
  },
  { n: 9, name: "in-force date not recorded", id: "dz-lf-1992-art117", date: "1995-01-01", expect: (m) => shows(m, "plain", "does not record when this version entered into force") },
  { n: 10, name: "later than the corpus", id: CSRD.id, date: "2026-11-18", expect: (m) => shows(m, "plain", "The corpus was read on " + READ_ON) },
  {
    n: 11, name: "one-version rail", id: "gt-ley-proteccion-mejoramiento-medio-ambiente", date: READ_ON,
    expect: (m) => [...shows(m, "plain"), ...((m.railText || "").startsWith("Only stored version: 1986-12-27, adopted") ? [] : ["the rail reads " + JSON.stringify(m.railText)])],
  },
  {
    n: 12, name: "capped rail", id: KZ.id, date: KZ.date,
    expect: (m) => [...shows(m, "plain"), ...(m.railWindow === 7 && m.railSummary === "Show all " + KZ.versions + " versions" && !m.railOpen ? [] : ["rail window " + m.railWindow + ", summary " + JSON.stringify(m.railSummary) + ", open " + m.railOpen])],
  },
  { n: 13, name: "same-date rows", id: "at-uwg-s1-2a", date: "2022-07-20", expect: (m) => [...shows(m, "plain"), ...((m.railText || "").includes("same date, not shown") ? [] : ["the rail has no \"same date, not shown\" row"])] },
  { n: 14, name: "reopened address, other snapshot", id: CSRD.id, date: CSRD.date, snap: "af3d6b47f", expect: (m) => [...shows(m, "plain"), ...((m.loadStatus || "").startsWith("Snapshot af3d6b47f is not kept.") ? [] : ["the load line is " + JSON.stringify(m.loadStatus)])] },
  {
    n: 15, name: "match list open",
    reach: async (c) => { await c.h.open("ok"); await typeLaw(c.h, "CSRD"); await c.h.waitFor(`document.querySelectorAll("#match-rows > li").length > 0`, 5000); },
    expect: (m) => (m.matchRows >= 1 ? [] : ["the match list holds " + m.matchRows + " rows"]),
  },
  {
    n: 16, name: "match list with no match",
    reach: async (c) => { await c.h.open("ok"); await typeLaw(c.h, "zzzzqqqq"); await c.h.waitFor(`document.getElementById("match-count").textContent.trim() !== ""`, 5000); },
    expect: (m) => (m.matchCount === NO_MATCH_LINE ? [] : ["the count line is " + JSON.stringify(m.matchCount) + ", want " + JSON.stringify(NO_MATCH_LINE)]),
  },
  {
    n: 17, name: "date message",
    reach: async (c) => {
      await c.h.open("ok");
      await c.h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)})`);
      await c.h.evaluate(`__chk.setField("12345-01-01")`);
      await c.h.evaluate(`GEL.setDate("12345-01-01")`);
      await c.h.evaluate(`__chk.blur()`);
    },
    expect: (m) => (m.hint === HINT ? [] : ["the date message is " + JSON.stringify(m.hint) + ", want " + JSON.stringify(HINT)]),
  },
  {
    n: 18, name: "rail expanded",
    reach: async (c) => {
      await c.h.open("ok");
      await c.h.evaluate(`GEL.choose(${JSON.stringify(KZ.id)}); if (!GEL.setDate(${JSON.stringify(KZ.date)})) throw new Error("date refused")`);
      await c.h.waitFor(`document.querySelector("#rail details") && document.querySelectorAll("#rail-all > li").length > 0`);
      await c.h.evaluate(`document.querySelector("#rail details").open = true`);
    },
    expect: (m) => (m.railAll === KZ.versions && m.railOpen ? [] : ["#rail-all holds " + m.railAll + " rows, open " + m.railOpen + ", want " + KZ.versions + " and open"]),
  },
  {
    n: 19, name: "copy confirmation while it shows",
    reach: async (c) => {
      await c.h.open("ok");
      await grantClipboard(c.h);
      await c.h.evaluate(`GEL.showAnswer(${JSON.stringify(CSRD.id)}, ${JSON.stringify(CSRD.date)})`);
      await clickReal(c.h, "#citation-copy");
      await c.h.until(async () => (await c.h.evaluate(`document.getElementById("citation-status").textContent`)) !== "", 5000, "the copy confirmation");
    },
    expect: (m) => (m.copyStatus === "Copied" ? [] : ["the confirmation reads " + JSON.stringify(m.copyStatus) + ", want \"Copied\""]),
  },
  {
    n: 20, name: "Browse by place, grid",
    reach: async (c) => { await c.h.open("ok"); await c.h.evaluate(`document.getElementById("browse-grid").scrollIntoView()`); },
    expect: (m) => (m.cells > 0 ? [] : ["the grid holds no cells"]),
  },
  {
    n: 21, name: "Browse by place, table",
    reach: async (c) => { await c.h.open("ok"); await c.h.evaluate(`document.getElementById("browse-table").scrollIntoView()`); },
    expect: (m) => (m.tableRows > 0 ? [] : ["the table holds no rows"]),
  },
];

// ---------- the page-side audit (stringified into the page: nothing from this module is visible there) ----------
// Reads boxes and computed styles only. text boxes = the line boxes of every visible text node (Range.getClientRects).
//   clipped   an element that clips (overflow other than visible; a scroller counts too, the story says nothing scrolls sideways) and holds more than it shows
//   spill     a text box that leaves the border box of the element it sits in (fixed-size boxes, unbreakable strings) or the one that clips it
//   overlap   two text boxes that cover each other by more than 1 px across and 2 px down
//   lost      a text box left of the page edge, or right of the window (the page would have to scroll sideways to show it)
function audit(opts) {
  if (opts.spacing) {
    const style = document.createElement("style");
    style.id = "wcag-1412";
    style.textContent = opts.spacing;
    document.head.append(style);
  }
  const d = document.documentElement, $ = (s) => document.querySelector(s);
  const vis = (el) => !!el && el.checkVisibility({ checkVisibilityCSS: true });
  const txt = (s) => { const e = $(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null; };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.classList.length ? "." + [...el.classList].join(".") : "");
  const f = (r) => Math.round(r.left) + "," + Math.round(r.top) + "," + Math.round(r.right) + "," + Math.round(r.bottom);
  const clipped = [], spill = [], overlap = [], lost = [], fieldCut = [], clips = new Set();
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest(".visually-hidden") || !vis(el)) continue;
    const c = getComputedStyle(el);
    if (el.tagName === "INPUT" && el.type === "text" && el.value) {
      // the value of a one-line field: it starts at the left padding and is clipped at the content box (seen in a screenshot: the right padding stays empty)
      const g = document.createElement("canvas").getContext("2d");
      g.font = c.font;
      g.letterSpacing = c.letterSpacing === "normal" ? "0px" : c.letterSpacing;
      g.wordSpacing = c.wordSpacing === "normal" ? "0px" : c.wordSpacing;
      const cut = g.measureText(el.value).width - (el.clientWidth - parseFloat(c.paddingLeft) - parseFloat(c.paddingRight));
      if (cut > 0.5) fieldCut.push(name(el) + " value " + JSON.stringify(el.value.slice(0, 18) + "..." + el.value.slice(-8)) + " is cut by " + Math.ceil(cut) + "px (box " + el.clientWidth + "px)");
    }
    if (c.overflowX === "visible" && c.overflowY === "visible") continue;
    clips.add(el);
    if (el.tagName === "INPUT" && el.type === "text") continue; // counted above, from the text width
    if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
      clipped.push(name(el) + " holds " + el.scrollWidth + "x" + el.scrollHeight + " in a box of " + el.clientWidth + "x" + el.clientHeight + " (overflow " + c.overflowX + "/" + c.overflowY + ")");
  }
  const boxes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!n.nodeValue.trim() || !el || el.closest(".visually-hidden") || !vis(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) if (r.width > 0.5 && r.height > 0.5) boxes.push({ el, r, t: n.nodeValue.trim().slice(0, 24) });
  }
  const clientW = d.clientWidth;
  for (const b of boxes) {
    const { r, el } = b;
    const own = el.getBoundingClientRect();
    if (r.left < own.left - 1 || r.right > own.right + 1 || r.top < own.top - 2 || r.bottom > own.bottom + 2)
      spill.push(name(el) + " " + JSON.stringify(b.t) + " text " + f(r) + " leaves its box " + f(own));
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      if (!clips.has(a)) continue;
      const ab = a.getBoundingClientRect();
      if (r.left < ab.left - 1 || r.right > ab.right + 1 || r.top < ab.top - 2 || r.bottom > ab.bottom + 2)
        spill.push(name(el) + " " + JSON.stringify(b.t) + " text " + f(r) + " reaches outside the clipping " + name(a) + " " + f(ab));
    }
    if (r.left < -1) lost.push(name(el) + " " + JSON.stringify(b.t) + " starts " + Math.round(r.left) + "px left of the page");
    else if (r.right > clientW + 1) lost.push(name(el) + " " + JSON.stringify(b.t) + " ends " + Math.round(r.right) + "px, window " + clientW + "px");
  }
  boxes.sort((x, y) => x.r.top - y.r.top);
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length && boxes[j].r.top < boxes[i].r.bottom - 2; j++) {
      const a = boxes[i].r, b = boxes[j].r;
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), ht = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w > 1 && ht > 2) overlap.push(name(boxes[i].el) + " " + JSON.stringify(boxes[i].t) + " " + f(a) + " and " + name(boxes[j].el) + " " + JSON.stringify(boxes[j].t) + " " + f(b));
    }
  }
  const p = $("#answer-panel"), hint = $("#date-hint"), det = $("#rail details");
  const right = (s) => { const e = $(s); return e ? Math.round(e.getBoundingClientRect().right) : null; };
  const cap = (a) => ({ n: a.length, first: a.slice(0, 6) });
  return {
    innerW: window.innerWidth, innerH: window.innerHeight, clientW, scrollW: d.scrollWidth, root: getComputedStyle(d).fontSize, nBoxes: boxes.length,
    spacingApplied: opts.spacing ? (() => { const b = getComputedStyle(document.body); return { fs: parseFloat(b.fontSize), ls: b.letterSpacing, ws: b.wordSpacing, lh: b.lineHeight }; })() : null,
    clipped: cap(clipped), fieldCut: cap(fieldCut), spill: cap(spill), overlap: cap(overlap), lost: cap(lost),
    shown: vis(p), state: p.getAttribute("data-state"), id: p.getAttribute("data-id"), date: p.getAttribute("data-date"),
    text: vis(p) ? p.innerText.replace(/\s+/g, " ").trim() : null,
    loadStatus: txt("#load-status"), matchRows: document.querySelectorAll("#match-rows > li").length, matchCount: txt("#match-count"),
    hint: vis(hint) && hint.textContent.trim() ? hint.textContent.trim() : null, copyStatus: txt("#citation-status"),
    railWindow: document.querySelectorAll("#rail-window > li").length, railAll: document.querySelectorAll("#rail-all > li").length,
    railOpen: !!det && det.open, railSummary: det ? det.querySelector("summary").textContent.trim() : null, railText: txt("#rail"),
    cells: document.querySelectorAll("#browse-grid .cell").length, tableRows: document.querySelectorAll("#browse-table tbody tr").length,
    gridRight: right("#browse-grid"), tableRight: right("#browse-table"),
  };
}

// Is the control inside the window across, not covered by anything else at its centre? (after scrolling it to the middle)
function hitTest(sel) {
  const all = [...document.querySelectorAll(sel)];
  const el = all.find((e) => e.checkVisibility()) || all[0]; // the first one the page shows
  if (!el) return { missing: true };
  el.scrollIntoView({ block: "center", behavior: "instant" });
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const top = document.elementFromPoint(cx, cy);
  const nm = (e) => (e ? e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.classList.length ? "." + [...e.classList].join(".") : "") : "nothing");
  return { shown: el.checkVisibility(), w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), inside: r.left >= -0.5 && r.right <= window.innerWidth + 0.5, hit: top === el || el.contains(top), by: nm(top) };
}

// ---------- the controls: each one in the state, then the one journey that uses them ----------
// "Reachable" is read from boxes: inside the window across, visible, nothing else at its centre. "Works" is a real mouse click or key press and the page's answer.
const LOOK = ["#law", "#date", "#example", "#answer-panel a[href]", "#answer-panel button", "#rail button.rail-row", "#rail summary", "#citation-copy", ".match-row", "#browse-by-place a"];
async function typeDate(h, iso) {
  // The date field takes its day, month and year in an order that is the browser's own (here it is not the one navigator.language names),
  // so try day-month-year, month-day-year and year-month-day until the field holds the date.
  const [y, m, d] = iso.split("-");
  const tried = [];
  for (const digits of [d + m + y, m + d + y, y + m + d]) {
    await h.evaluate(`document.getElementById("date").blur(); document.getElementById("date").focus()`);
    for (const ch of digits) {
      await h.send("Input.dispatchKeyEvent", { type: "keyDown", key: ch, code: "Digit" + ch, text: ch, unmodifiedText: ch, windowsVirtualKeyCode: ch.charCodeAt(0) });
      await h.send("Input.dispatchKeyEvent", { type: "keyUp", key: ch, code: "Digit" + ch, windowsVirtualKeyCode: ch.charCodeAt(0) });
    }
    const got = await h.evaluate(`document.getElementById("date").value`);
    if (got === iso) return;
    tried.push(digits + " gave " + JSON.stringify(got));
  }
  throw new Error("typing the digits of " + iso + " in three orders never gave it: " + tried.join(", "));
}

async function controls(h, noData) {
  const problems = [], did = [];
  const fail = (m) => problems.push(m);
  const hit = async (sel, what) => {
    const t = await h.evaluate(`(${hitTest})(${JSON.stringify(sel)})`);
    if (t.missing) return null;
    if (!t.shown || !t.w || !t.h) fail(what + " is not visible (" + t.w + "x" + t.h + ")");
    else if (!t.inside) fail(what + " is not inside the window across: " + t.left + " to " + t.right);
    else if (!t.hit) fail(what + " is covered at its centre by " + t.by);
    return t;
  };
  const step = async (what, fn) => { try { await fn(); } catch (e) { fail(what + ": " + e.message); } };

  // 1. what the state shows: every control present is reachable
  for (const sel of LOOK) {
    const count = await h.evaluate(`[...document.querySelectorAll(${JSON.stringify(sel)})].filter((e) => e.checkVisibility()).length`);
    if (!count) continue;
    await step(sel, async () => { if (await hit(sel, sel)) did.push(sel); });
  }
  // the Browse by place link of the no-match answer: a real click scrolls to the section
  if (await h.evaluate(`!!document.querySelector('#answer-panel a[data-part="browse"]')`)) {
    await step("Browse by place link", async () => {
      await clickReal(h, '#answer-panel a[data-part="browse"]');
      await h.waitFor(`location.hash === "#browse-by-place"`, 3000);
      const { top, inner } = await h.evaluate(`({ top: Math.round(document.getElementById("browse-heading").getBoundingClientRect().top), inner: window.innerHeight })`);
      if (top < -1 || top > inner - 20) fail("after the Browse by place link the heading is at " + top + "px in a window " + inner + "px tall");
      did.push("browse link");
    });
  }
  if (noData) return { problems, did }; // no data file: the controls are shown, the lookup has nothing to look up
  // 2. the journey: law box, a match row, the date field, a rail row, Copy citation
  await step("law box", async () => {
    await hit("#law", "law box");
    await clickReal(h, "#law");
    if (!(await h.evaluate(`document.activeElement.id === "law"`))) fail("a click on the law box does not focus it");
    await typeLaw(h, "CSRD");
    await h.waitFor(`!!document.querySelector('.match-row[data-id="${CSRD.id}"]')`, 3000);
    await hit(`.match-row[data-id="${CSRD.id}"]`, "the CSRD match row");
    await clickReal(h, `.match-row[data-id="${CSRD.id}"]`);
    await h.waitFor(`GEL.chosen === ${JSON.stringify(CSRD.id)}`, 3000);
    if (!(await h.evaluate(`document.activeElement.id === "law"`))) fail("a chosen match row does not return focus to the law box");
    did.push("law box");
  });
  await step("date field", async () => {
    await hit("#date", "date field");
    await clickReal(h, "#date");
    if (!(await h.evaluate(`document.activeElement.id === "date"`))) fail("a click on the date field does not focus it");
    await typeDate(h, CSRD.date);
    await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-id") === ${JSON.stringify(CSRD.id)} && document.getElementById("answer-panel").getAttribute("data-date") === ${JSON.stringify(CSRD.date)}`, 3000);
    const text = await h.evaluate(`document.getElementById("answer-panel").innerText`);
    if (!text.includes("In force since 2025-04-17")) fail("the answer for CSRD on " + CSRD.date + " does not say 'In force since 2025-04-17'");
    did.push("date field");
  });
  await step("rail row", async () => {
    const row = `#rail-window li[data-date="2023-01-05"] button.rail-row`;
    await hit(row, "the rail row 2023-01-05");
    await clickReal(h, row);
    await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-date") === "2023-01-05"`, 3000);
    did.push("rail row");
  });
  await step("Copy citation", async () => {
    await grantClipboard(h);
    await hit("#citation-copy", "Copy citation");
    await clickReal(h, "#citation-copy");
    await h.until(async () => (await h.evaluate(`document.getElementById("citation-status").textContent.trim()`)) !== "", 3000, "any confirmation").catch(() => {});
    const said = await h.evaluate(`document.getElementById("citation-status") ? document.getElementById("citation-status").textContent.trim() : "(no status element)"`);
    if (said !== "Copied") fail("after a click on Copy citation the confirmation reads " + JSON.stringify(said) + ", want \"Copied\"");
    did.push("Copy citation");
  });
  return { problems, did };
}

// WCAG 1.4.12 on the body: letter-spacing 0.12em, word-spacing 0.16em, line-height 1.5 of its own font size (the check that the injection took).
const spacingProblems = (b) => [["letter-spacing", b.ls, 0.12 * b.fs], ["word-spacing", b.ws, 0.16 * b.fs], ["line-height", b.lh, 1.5 * b.fs]].filter(([, got, want]) => !(Math.abs(parseFloat(got) - want) < 0.05)).map(([n, got, want]) => "text spacing not in force on the body: " + n + " is " + got + ", want " + Math.round(want * 100) / 100 + "px (body font " + b.fs + "px)");

// Accepted finding (Varun, 2026-11-18): the one-line law box cuts a long chosen title in these states (numbers of S01 to S21, as the run of
// 2026-11-18 reports them). The page is not changed; the full title shows in the answer panel. A `-field` verdict fails when a state outside
// its set is cut, or a state in its set is no longer cut, so the finding cannot move unseen.
const FIELD_CUT = {
  r32: [3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 17, 18],
  r33a: [3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 17, 18],
  r33b: [3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 17, 18],
  r36: [3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 17, 18],
};

// ---------- the sweep: the 21 states in one window, with or without text spacing ----------
async function sweep(h, E, { row, w, spacing, note }) {
  await h.open("ok");
  const ctx = { h, origin: await h.evaluate("location.origin"), snap: E.snapshot9 };
  const totals = { boxes: 0, controls: 0 }, cut = {};
  for (const s of STATES) {
    await metrics(h, w, Math.round(BASE_H * w / BASE_W));
    const reach = s.reach ?? byAddress(s.id, s.date, s.snap);
    let m, problems = [], c = { did: [] };
    try {
      await reach(ctx);
      ctx.origin = await h.evaluate("location.origin");
      m = await h.evaluate(`(${audit})(${JSON.stringify({ spacing: spacing ? SPACING : null })})`);
    } catch (e) {
      problems.push("could not reach the state: " + e.message);
    }
    if (m) {
      const A = (k, what) => (m[k].n ? [m[k].n + " " + what + ": " + m[k].first.join("; ")] : []);
      problems = [
        ...(m.innerW === w ? [] : ["window is " + m.innerW + "px wide, want " + w]),
        ...(m.root === "16px" ? [] : ["root font is " + m.root + ", want 16px"]),
        ...(spacing ? spacingProblems(m.spacingApplied) : []),
        ...(m.nBoxes > 0 ? [] : ["no text boxes were measured"]),
        ...s.expect(m),
        ...(m.scrollW <= w ? [] : ["the page scrolls sideways: scrollWidth " + m.scrollW + " in a window of " + w]),
        ...A("clipped", "elements clip content"), ...A("spill", "text boxes leave their box"), ...A("overlap", "pairs of text boxes overlap"), ...A("lost", "text boxes are lost"),
      ];
      totals.boxes += m.nBoxes;
      if (m.fieldCut.n) cut[s.n] = m.fieldCut.first.join("; ");
      try {
        c = await controls(h, s.noData);
        problems.push(...c.problems);
      } catch (e) {
        problems.push("controls: " + e.message);
      }
      totals.controls += c.did.length;
    }
    h.verdict(`11e-${row}-${String(s.n).padStart(2, "0")}`,
      `S${String(s.n).padStart(2, "0")} ${s.name}, window ${w} CSS px${spacing ? ", text spacing 1.4.12" : ""}: ${m ? m.nBoxes + " text boxes, scrollWidth " + m.scrollW : "not measured"}; clipped, spill, overlapping and lost text: 0 each; controls reached or used: ${c.did.join(", ") || "none"}`,
      problems);
  }
  // the law box is a one-line field: a title wider than the box is cut by it, whatever else fits. Kept apart so the finding reads on its own.
  const want = FIELD_CUT[row], S = (n) => "S" + String(n).padStart(2, "0");
  h.verdict(`11e-${row}-field`, `window ${w} CSS px${spacing ? ", text spacing 1.4.12" : ""}: accepted finding (Varun 2026-11-18), the one-line law box cuts the chosen title in exactly the recorded states ${want.map(S).join(" ")} and in no other (the answer panel shows the full title)`, [
    ...Object.keys(cut).map(Number).filter((n) => !want.includes(n)).map((n) => S(n) + " is cut but is not in the recorded set: " + cut[n]),
    ...want.filter((n) => !cut[n]).map((n) => S(n) + " is in the recorded set but the law box does not cut its title now"),
  ]);
  console.log(`  ${row}: ${note}; ${totals.boxes} text boxes and ${totals.controls} control checks over 21 states`);
}

// The same field measure in the plain 1280 px window with no text spacing: not a row of the story, printed so the R32 and R33 findings can be read against it.
async function refField(h, E) {
  await h.open("ok");
  const ctx = { h, origin: await h.evaluate("location.origin"), snap: E.snapshot9 };
  const cut = [];
  for (const s of STATES) {
    await metrics(h, BASE_W, BASE_H);
    await (s.reach ?? byAddress(s.id, s.date, s.snap))(ctx);
    ctx.origin = await h.evaluate("location.origin");
    const m = await h.evaluate(`(${audit})(${JSON.stringify({ spacing: null })})`);
    cut.push(...m.fieldCut.first.map((x) => "S" + String(s.n).padStart(2, "0") + " " + x.replace(/^input#law value /, "")));
  }
  console.log("  reference (not a row): plain 1280 px window, no text spacing: the law box cuts its value in " + cut.length + " of 21 states" + (cut.length ? ": " + cut.join("; ") : ""));
}

// ---------- R26: the ring on screen ----------
async function r26(h) {
  try {
    await metrics(h, 1100, 800);
    await h.open("ok");
    await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)})`);
    const READ = `(() => { const el = document.activeElement, s = getComputedStyle(el), r = el.getBoundingClientRect(); return { id: el.id, cls: el.className, fv: el.matches(":focus-visible"), style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: s.outlineColor, x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; })()`;
    for (const [key, label, want, file, area] of [
      ["copy", "the Copy citation button", `(el) => el.id === "citation-copy"`, "r26-copy-citation-ring", `document.getElementById("citation-copy")`],
      ["row", "the selected rail row", `(el) => el.classList.contains("rail-row") && !!el.closest("li.rail-current")`, "r26-selected-rail-row-ring", `document.querySelector("li.rail-current")`],
    ]) {
      const n = await tabTo(h, want);
      const g = n ? await h.evaluate(READ) : null;
      let s1 = null, s2 = null, clip = null;
      if (g) {
        // the picture: the control with its neighbours (the whole row for a rail row), and the whole window
        const box = await h.evaluate(`(() => { const r = ${area}.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; })()`);
        clip = around(box, 16);
        s1 = await shot(h, file + ".png", clip);
        s2 = await shot(h, file + "-window.png");
      }
      h.verdict("11e-r26-" + key, `${label}: reached by a real Tab, :focus-visible matches, the ring is a solid ${RING}px line in the link colour, and two screenshots are saved (${g ? "Tab " + n + "; " + s1.file : "not reached"})`, !g ? ["no Tab in 60 reached " + label] : [
        ...(g.fv ? [] : ["the focused element does not match :focus-visible"]),
        ...(g.style === "solid" ? [] : ["outline-style " + g.style]),
        ...(g.width === RING ? [] : ["outline-width " + g.width + "px, want " + RING]),
        ...(g.color === LINK ? [] : ["outline-color " + g.color + ", want " + LINK]),
        ...[s1, s2].flatMap((s) => (s.png && s.bytes > 1500 ? [] : ["screenshot " + s.file + " is not a PNG of a real size (" + s.bytes + " bytes)"])),
        ...(Math.abs(s1.w - clip.width * 2) <= 2 ? [] : ["the clip picture is " + s1.w + "px wide, want about " + Math.round(clip.width * 2)]),
      ]);
      if (g) console.log("  r26 screenshots: " + s1.file + " (" + s1.w + "x" + s1.h + ", " + s1.sha + "), " + s2.file + " (" + s2.w + "x" + s2.h + ", " + s2.sha + ")");
    }
  } finally {
    await reset(h);
  }
}

// ---------- R29: forced colours ----------
// Emulation.setEmulatedMedia forced-colors: active makes Chrome replace the page's colours with its system colours (Canvas, CanvasText, ButtonBorder, Highlight...).
// Judged by label text and computed border and outline styles, not by the tint: the tint (--panel) is not kept in forced colours and is not required.
function readForced() {
  const cs = (el) => getComputedStyle(el);
  const sys = (name, prop) => { const d = document.createElement("div"); d.style[prop] = name; document.body.append(d); const c = cs(d)[prop]; d.remove(); return c; };
  const canvas = sys("Canvas", "backgroundColor");
  const side = (el, s) => ({ style: cs(el)[s + "Style"], width: parseFloat(cs(el)[s + "Width"]), color: cs(el)[s + "Color"] });
  const back = (el) => { for (let e = el; e; e = e.parentElement) { const c = cs(e).backgroundColor; if (!/rgba\(.*, 0\)$/.test(c) && c !== "transparent") return c; } return canvas; };
  const rows = [...document.querySelectorAll("#rail-window > li")].map((li) => ({
    text: li.textContent.replace(/\s+/g, " ").trim(), current: li.classList.contains("rail-current"), aria: li.firstElementChild.getAttribute("aria-current"),
    edge: side(li, "borderLeft"), bottom: side(li, "borderBottom"),
  }));
  const ctl = (sel) => { const el = document.querySelector(sel); return { sel, border: side(el, "borderTop"), bg: back(el) }; };
  return { active: matchMedia("(forced-colors: active)").matches, canvas, bodyBg: cs(document.body).backgroundColor, bodyColor: cs(document.body).color, rows, controls: ["#law", "#date", "#example", "#citation-copy"].map(ctl) };
}

async function r29(h) {
  try {
    await metrics(h, 1100, 800);
    await h.send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] });
    await h.open("ok");
    await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)})`);
    await h.waitFor(`!!document.querySelector("li.rail-current") && !!document.getElementById("citation-copy")`, 3000);
    const F = await h.evaluate(`(${readForced})()`);
    const cur = F.rows.filter((r) => r.current), others = F.rows.filter((r) => !r.current);
    const label = "in force on " + CSRD.date;
    h.verdict("11e-r29-label", `forced colours active (body ${F.bodyColor} on ${F.bodyBg}): the version in force keeps its text label "${label}" and aria-current, and no other rail row says it`, [
      ...(F.active ? [] : ["(forced-colors: active) does not match"]),
      ...(cur.length === 1 ? [] : [cur.length + " rows are marked as the version in force"]),
      ...(cur[0] && cur[0].text.includes(label) ? [] : ["the marked row reads " + h.fmt(cur[0] && cur[0].text) + ", want it to hold " + h.fmt(label)]),
      ...(cur[0] && cur[0].aria === "true" ? [] : ["the marked row has aria-current " + h.fmt(cur[0] && cur[0].aria)]),
      ...others.filter((r) => r.text.includes("in force on") || r.aria).map((r) => "another row says it is in force or has aria-current: " + h.fmt(r.text)),
      ...(F.rows.length === 3 ? [] : ["the CSRD rail holds " + F.rows.length + " rows, want 3 (2023-01-05, 2025-04-17, 2026-03-18)"]),
    ]);
    const e = cur[0] && cur[0].edge, edgeContrast = e && contrast(e.color, F.canvas, F.canvas);
    h.verdict("11e-r29-edge", `forced colours: the version in force keeps its left edge: a solid ${EDGE}px line, opaque, at least 3:1 against Canvas (${e ? e.style + " " + e.width + "px " + e.color + ", " + (edgeContrast ? round1(edgeContrast) : "?") + ":1" : "no row"})`, !e ? ["no version in force"] : [
      ...(e.style === "solid" ? [] : ["border-left-style " + e.style]),
      ...(e.width === EDGE ? [] : ["border-left-width " + e.width + "px, want " + EDGE]),
      ...(rgba(e.color) && rgba(e.color).a === 1 ? [] : ["border-left-color " + e.color + " is not opaque"]),
      ...(edgeContrast >= 3 ? [] : ["border-left-color " + e.color + " against Canvas " + F.canvas + " is " + (edgeContrast ? round1(edgeContrast) : "?") + ":1, want 3 or more"]),
    ]);
    const same = e && others.every((r) => r.edge.color === e.color && r.edge.width === e.width && r.edge.style === e.style);
    console.log("  r29 finding: " + (same ? "the left edge is the same line on every row (" + e.style + " " + e.width + "px " + e.color + "), so in forced colours the edge no longer tells the version in force from the others; the label and aria-current do (the check above requires them)" : "the version in force has an edge the other rows do not have"));
    const bp = F.controls.map((c) => ({ ...c, k: contrast(c.border.color, c.bg, F.canvas) }));
    h.verdict("11e-r29-borders", "forced colours: the law box, date field, example button and Copy citation keep a solid border of 1px or more, opaque, at least 3:1 against their own background; the rail row dividers stay visible (" + bp.map((c) => c.sel + " " + (c.k ? round1(c.k) : "?") + ":1").join(", ") + ")", [
      ...bp.flatMap((c) => [
        ...(c.border.style !== "none" && c.border.width >= 1 ? [] : [c.sel + " border " + c.border.style + " " + c.border.width + "px"]),
        ...(rgba(c.border.color) && rgba(c.border.color).a === 1 ? [] : [c.sel + " border colour " + c.border.color + " is not opaque"]),
        ...(c.k >= 3 ? [] : [c.sel + " border " + c.border.color + " on " + c.bg + " is " + (c.k ? round1(c.k) : "?") + ":1, want 3 or more"]),
      ]),
      ...F.rows.filter((r) => r.bottom.style === "none" || r.bottom.width < 1 || !(contrast(r.bottom.color, F.canvas, F.canvas) >= 3)).map((r) => "rail row " + h.fmt(r.text.slice(0, 20)) + ": divider " + r.bottom.style + " " + r.bottom.width + "px " + r.bottom.color),
    ]);
    const rings = [];
    for (const [label2, want] of [["Copy citation", `(el) => el.id === "citation-copy"`], ["the selected rail row", `(el) => el.classList.contains("rail-row") && !!el.closest("li.rail-current")`]]) {
      const n = await tabTo(h, want);
      const g = n ? await h.evaluate(`(() => { const el = document.activeElement, s = getComputedStyle(el); const bg = (() => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\\(.*, 0\\)$/.test(c)) return c; } return ${JSON.stringify(F.canvas)}; })(); return { fv: el.matches(":focus-visible"), style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: s.outlineColor, bg }; })()`) : null;
      rings.push({ label2, n, g, vsBg: g && contrast(g.color, g.bg, F.canvas), vsCanvas: g && contrast(g.color, F.canvas, F.canvas) });
    }
    h.verdict("11e-r29-ring", "forced colours: the keyboard ring on Copy citation and on the selected rail row is a solid line of 2px or more, and at least 3:1 against the element's background and against Canvas (" + rings.map((r) => r.label2 + " " + (r.g ? r.g.color + " " + (r.vsBg ? round1(r.vsBg) : "?") + ":1" : "not reached")).join("; ") + ")", rings.flatMap((r) => !r.g ? [r.label2 + ": not reached by Tab"] : [
      ...(r.g.fv ? [] : [r.label2 + ": not :focus-visible"]),
      ...(r.g.style === "solid" && r.g.width >= RING ? [] : [r.label2 + ": outline " + r.g.style + " " + r.g.width + "px"]),
      ...(r.vsBg >= 3 ? [] : [r.label2 + ": ring " + r.g.color + " on " + r.g.bg + " is " + (r.vsBg ? round1(r.vsBg) : "?") + ":1"]),
      ...(r.vsCanvas >= 3 ? [] : [r.label2 + ": ring " + r.g.color + " on Canvas " + F.canvas + " is " + (r.vsCanvas ? round1(r.vsCanvas) : "?") + ":1"]),
    ]));
    await h.evaluate(`document.activeElement.blur()`);
    const s = await shot(h, "r29-forced-colors-csrd.png");
    h.verdict("11e-r29-shot", "a screenshot of the CSRD answer in forced colours is saved for a person (" + s.file + ")", s.png && s.bytes > 1500 ? [] : ["not a PNG of a real size: " + s.bytes + " bytes"]);
    console.log("  r29: Chrome's own emulated palette only (Canvas " + F.canvas + ", text " + F.bodyColor + "); a Windows high-contrast theme, or another palette, is not run. The picture " + s.file + " (" + s.w + "x" + s.h + ", " + s.sha + ") is for a person to look at");
  } finally {
    await reset(h);
  }
}

// ---------- R30: reduced motion ----------
// The page has one transition: #citation-status fades in over 0.2s (cite.css), switched off in prefers-reduced-motion: reduce.
// Read at the moment the text appears (a MutationObserver), from computed style and the page's running animations, and from the accessibility tree.
const WATCH = `(() => {
  window.__seen = null;
  const status = document.getElementById("citation-status");
  new MutationObserver(() => {
    if (window.__seen || !status.textContent.trim()) return;
    const s = getComputedStyle(status);
    window.__seen = { text: status.textContent.trim(), opacity: s.opacity, transition: s.transitionProperty + " " + s.transitionDuration, animation: s.animationName + " " + s.animationDuration, running: document.getAnimations().map((a) => a.constructor.name + " " + (a.transitionProperty || a.animationName)) };
  }).observe(status, { childList: true, characterData: true, subtree: true });
  return { transition: getComputedStyle(status).transitionDuration, animation: getComputedStyle(status).animationName };
})()`;
const MOTION_ANYWHERE = `[...document.querySelectorAll("body, body *")].flatMap((el) => { const s = getComputedStyle(el); const t = s.transitionDuration.split(",").some((d) => parseFloat(d) > 0), a = s.animationName !== "none" && s.animationName !== ""; return t || a ? [el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + " transition " + s.transitionProperty + " " + s.transitionDuration + " animation " + s.animationName] : []; })`;

async function liveRegion(h, selector) {
  await h.send("Accessibility.enable");
  const doc = await h.send("DOM.getDocument", { depth: 0 });
  const { nodeId } = await h.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector });
  const { node } = await h.send("DOM.describeNode", { nodeId });
  const tree = await h.send("Accessibility.getFullAXTree");
  const byId = new Map(tree.nodes.map((n) => [n.nodeId, n]));
  const ax = tree.nodes.find((n) => n.backendDOMNodeId === node.backendNodeId);
  if (!ax) return null;
  const prop = (k) => ((ax.properties || []).find((q) => q.name === k) || { value: {} }).value.value;
  // the spoken text is the StaticText leaves under the region (their own inline boxes repeat it)
  const words = (n) => (n.role && n.role.value === "StaticText" ? [n.name && n.name.value] : (n.childIds || []).flatMap((id) => words(byId.get(id)))).filter(Boolean);
  const own = ax.name && ax.name.value; // a status region may carry its text as its name or only as children
  return { role: ax.role && ax.role.value, ignored: !!ax.ignored, live: prop("live"), atomic: prop("atomic"), text: (own || words(ax).join("")).trim() };
}

async function copyOnce(h) {
  await h.open("ok");
  await grantClipboard(h);
  await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)})`);
  await h.waitFor(`!!document.getElementById("citation-copy")`, 3000);
  const before = await h.evaluate(WATCH);
  const regionBefore = await liveRegion(h, "#citation-status");
  const everywhere = await h.evaluate(MOTION_ANYWHERE);
  await clickReal(h, "#citation-copy");
  await h.waitFor(`window.__seen !== null`, 3000);
  await h.sleep(60);
  const seen = await h.evaluate(`window.__seen`);
  const regionAfter = await liveRegion(h, "#citation-status");
  return { before, regionBefore, everywhere, seen, regionAfter };
}

async function r30(h) {
  try {
    // the control: without reduced motion the same read finds the fade, so the read can see one
    const plain = await copyOnce(h);
    h.verdict("11e-r30-control", "without reduced motion the same read finds the 0.2s fade (transition opacity 0.2s, opacity " + (plain.seen && plain.seen.opacity) + " at the first frame, a running CSSTransition), so it can see one", [
      ...(plain.seen && /opacity 0\.2s/.test(plain.seen.transition) ? [] : ["transition " + h.fmt(plain.seen && plain.seen.transition) + ", want opacity 0.2s"]),
      ...(plain.seen && plain.seen.running.some((r) => r.includes("CSSTransition")) ? [] : ["no running CSSTransition: " + h.fmt(plain.seen && plain.seen.running)]),
    ]);
    await h.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const R = await copyOnce(h);
    const mq = await h.evaluate(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
    h.verdict("11e-r30-nofade", "reduced motion emulated: the confirmation has no transition or animation (computed durations 0s, animation none), no animation runs when the text appears, and its opacity is 1 at the first frame", [
      ...(mq ? [] : ["(prefers-reduced-motion: reduce) does not match"]),
      ...(R.before.transition.split(",").every((d) => parseFloat(d) === 0) ? [] : ["#citation-status transition-duration " + R.before.transition]),
      ...(R.before.animation === "none" ? [] : ["#citation-status animation-name " + R.before.animation]),
      ...(R.seen && R.seen.text === "Copied" ? [] : ["the confirmation reads " + h.fmt(R.seen && R.seen.text) + ", want \"Copied\""]),
      ...(R.seen && R.seen.opacity === "1" ? [] : ["opacity at the first frame is " + h.fmt(R.seen && R.seen.opacity) + ", want 1 (a fade would start at 0)"]),
      ...(R.seen && R.seen.running.length === 0 ? [] : ["running animations when the text appeared: " + h.fmt(R.seen && R.seen.running)]),
    ]);
    h.verdict("11e-r30-none-anywhere", "reduced motion emulated: no element of the CSRD answer page has a transition or an animation", R.everywhere);
    h.verdict("11e-r30-announced", "the confirmation is a live region in the accessibility tree before the text appears (role status, polite, not ignored) and holds the text \"Copied\" after", [
      ...(R.regionBefore ? [] : ["#citation-status is not in the accessibility tree before the click"]),
      ...(R.regionBefore && R.regionBefore.role === "status" && R.regionBefore.live === "polite" && !R.regionBefore.ignored ? [] : ["before the click: " + h.fmt(R.regionBefore)]),
      ...(R.regionAfter && R.regionAfter.text === "Copied" && R.regionAfter.live === "polite" && !R.regionAfter.ignored ? [] : ["after the click: " + h.fmt(R.regionAfter)]),
    ]);
    console.log("  r30: Chrome's accessibility tree says polite live region; whether a screen reader speaks it is VoiceOver's, by hand (R28)");
  } finally {
    await reset(h);
  }
}

// ---------- R31: colour-vision options ----------
// The options are read from the browser's own protocol (Emulation.setEmulatedVisionDeficiency); they are the ones DevTools lists. The emulation
// is a filter on what is painted, so computed styles and the DOM read the same under every option: what a script can show is the cues that do not
// rely on colour (text, underline, a heavier border), and that each option changes the picture. What the picture looks like is for a person.
async function r31(h) {
  try {
    const proto = await (await fetch(`http://127.0.0.1:${h.cdp}/json/protocol`)).json();
    const options = proto.domains.find((d) => d.domain === "Emulation").commands.find((c) => c.name === "setEmulatedVisionDeficiency").parameters[0].enum.filter((t) => t !== "none");
    h.verdict("11e-r31-list", "the browser lists the vision options DevTools shows: blurred vision, reduced contrast, achromatopsia, deuteranopia, protanopia, tritanopia (read " + options.join(", ") + ")", ["blurredVision", "reducedContrast", "achromatopsia", "deuteranopia", "protanopia", "tritanopia"].filter((o) => !options.includes(o)).map((o) => "missing " + o));

    // cues that do not rely on colour
    await h.open("ok");
    await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)})`);
    const T = await h.evaluate(`(() => {
      const rows = [...document.querySelectorAll("#rail-window > li")].map((li) => ({ text: li.textContent.replace(/\\s+/g, " ").trim(), current: li.classList.contains("rail-current") }));
      const links = [...document.querySelectorAll("a[href]")].filter((a) => a.checkVisibility()).map((a) => ({ text: a.textContent.trim().slice(0, 30), line: getComputedStyle(a).textDecorationLine, w: getComputedStyle(a).textDecorationThickness }));
      return { rows, links };
    })()`);
    const label = "in force on " + CSRD.date;
    h.verdict("11e-r31-rail", "colour-vision: the three rail rows of the CSRD answer are told apart by their text (three different labels), and the one in force says \"" + label + "\"", [
      ...(T.rows.length === 3 ? [] : [T.rows.length + " rail rows, want 3"]),
      ...(new Set(T.rows.map((r) => r.text)).size === T.rows.length ? [] : ["two rows read the same: " + h.fmt(T.rows.map((r) => r.text))]),
      ...(T.rows.filter((r) => r.current).length === 1 && T.rows.find((r) => r.current).text.includes(label) ? [] : ["the row in force does not say " + h.fmt(label)]),
      ...T.rows.filter((r) => !r.current && r.text.includes("in force on")).map((r) => "a row that is not in force says so: " + h.fmt(r.text)),
    ]);
    h.verdict("11e-r31-links", "colour-vision: every visible link is underlined (computed text-decoration), so links do not rely on colour (" + T.links.length + " links)", [
      ...(T.links.length ? [] : ["no visible links were found"]),
      ...T.links.filter((l) => !l.line.includes("underline")).map((l) => "link " + h.fmt(l.text) + " has text-decoration-line " + l.line),
    ]);
    // the panel states, told apart by text
    const heads = [];
    for (const [id, date, want] of [[CSRD.id, CSRD.date, "plain"], [CSRD.id, "2022-12-31", "interim"], ["gn-arrete-2022-1646-evaluations-environnementales", "2024-01-01", "interim"], ["eu-eudr-2023-1115", CSRD.date, "plain"]]) {
      await h.evaluate(`GEL.choose(${JSON.stringify(id)}); GEL.setDate(${JSON.stringify(date)})`);
      await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === ${JSON.stringify(want)} && document.getElementById("answer-panel").getAttribute("data-id") === ${JSON.stringify(id)} && document.getElementById("answer-panel").getAttribute("data-date") === ${JSON.stringify(date)}`, 3000);
      heads.push(await h.evaluate(`document.getElementById("answer-panel").innerText.replace(/\\s+/g, " ").trim().slice(0, 90)`));
    }
    h.verdict("11e-r31-states", "colour-vision: four answer states (in force, before the first version, repealed, not yet in force) are told apart by the text of the panel, not by colour", [
      ...(new Set(heads).size === heads.length ? [] : ["two states open with the same text: " + h.fmt(heads)]),
      ...heads.filter((t) => t.length < 20).map((t) => "a state has almost no text: " + h.fmt(t)),
    ]);
    // an error: the date message and a heavier border
    await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)})`);
    const okW = await h.evaluate(`parseFloat(getComputedStyle(document.getElementById("date")).borderTopWidth)`);
    await h.evaluate(`__chk.setField("12345-01-01"); GEL.setDate("12345-01-01"); __chk.blur()`);
    const bad = await h.evaluate(`(() => { const d = document.getElementById("date"), s = getComputedStyle(d), hint = document.getElementById("date-hint"); return { invalid: d.getAttribute("aria-invalid"), w: parseFloat(s.borderTopWidth), hint: hint.checkVisibility() ? hint.textContent.trim() : null }; })()`);
    h.verdict("11e-r31-error", "colour-vision: a date error is marked by text (\"" + HINT + "\") and by a heavier border on the date field (" + bad.w + "px against " + okW + "px), not by colour alone", [
      ...(bad.invalid === "true" ? [] : ["aria-invalid is " + h.fmt(bad.invalid)]),
      ...(bad.hint === HINT ? [] : ["the message is " + h.fmt(bad.hint)]),
      ...(bad.w > okW ? [] : ["the border is " + bad.w + "px with the error and " + okW + "px without"]),
    ]);

    // the pictures: one screenshot of the CSRD answer for each option, and two without any, to show a repeat is the same picture
    await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)}); document.activeElement.blur(); scrollTo(0, 0)`);
    await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-date") === ${JSON.stringify(CSRD.date)} && !!document.getElementById("citation-copy")`, 3000);
    await metrics(h, 1100, 800);
    const none1 = await shot(h, "r31-none.png");
    const none2 = await shot(h, "r31-none-again.png");
    const shots = [];
    for (const type of options) {
      await h.send("Emulation.setEmulatedVisionDeficiency", { type });
      shots.push({ type, ...(await shot(h, "r31-" + type + ".png")) });
    }
    await h.send("Emulation.setEmulatedVisionDeficiency", { type: "none" });
    h.verdict("11e-r31-repeatable", "two screenshots of the unemulated answer are the same picture (" + none1.sha + "), so a different picture under an option is the option", none1.sha === none2.sha && none1.png ? [] : ["the two pictures differ: " + none1.sha + " and " + none2.sha]);
    for (const s of shots) {
      h.verdict("11e-r31-" + s.type, "colour-vision " + s.type + ": the picture of the CSRD answer differs from the unemulated one and from every other option, and is saved for a person (" + s.file + ", " + s.w + "x" + s.h + ", " + s.sha + ")", [
        ...(s.png && s.bytes > 1500 ? [] : ["not a PNG of a real size: " + s.bytes + " bytes"]),
        ...(s.sha !== none1.sha ? [] : ["the picture is the same as the unemulated one"]),
        ...shots.filter((o) => o !== s && o.sha === s.sha).map((o) => "the picture is the same as " + o.type),
      ]);
    }
    console.log("  r31: the pictures are in " + SHOTS + " (r31-none.png and one per option); what they look like to a person with that deficiency is for Varun to look at");
  } finally {
    await reset(h);
  }
}

export async function run(h) {
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  try {
    await section(h, "11e-r26", () => r26(h));
    await section(h, "11e-r29", () => r29(h));
    await section(h, "11e-r30", () => r30(h));
    await section(h, "11e-r31", () => r31(h));
    await section(h, "11e-ref", async () => { try { await refField(h, E); } finally { await reset(h); } });
    await section(h, "11e-r32", async () => { try { await sweep(h, E, { row: "r32", w: 640, note: "a 640 CSS px window is 200% zoom of a 1280 px window" }); } finally { await reset(h); } });
    await section(h, "11e-r33a", async () => { try { await sweep(h, E, { row: "r33a", w: BASE_W, spacing: true, note: "text spacing 1.4.12 in the 1280 px window" }); } finally { await reset(h); } });
    await section(h, "11e-r33b", async () => { try { await sweep(h, E, { row: "r33b", w: 640, spacing: true, note: "text spacing 1.4.12 in the 640 px window (200% zoom)" }); } finally { await reset(h); } });
    await section(h, "11e-r36", async () => { try { await sweep(h, E, { row: "r36", w: 320, note: "a 320 CSS px window is 400% zoom of a 1280 px window" }); } finally { await reset(h); } });
  } finally {
    await reset(h);
    await h.open("ok").catch(() => {});
  }
}
