// Checks for STORY-GEL-34-11, part 3: the whole-page rows that Chrome can run. tests/web/check.mjs imports this file.
//
//   P1  a 320 CSS px window: document.documentElement.scrollWidth is at most 320 in every one of the story's states, at 100% text
//       and at 200% text (root font 32 px); the place table's keyboard-reachable scroll container (if the table is wider than it).
//   P2  after journey 1, one variant, one copy and one date change, the requests the page made are the page, its stylesheets, its
//       scripts and the data file (the list read from index.html), and none follows a lookup (FR6).
//   P3  Invoker Commands forced off (CommandEvent deleted at document start): Copy citation on the CSRD answer (2025-06-01) puts the
//       displayed line on the clipboard, no newline, and the confirmation shows. Method as 08-cite.mjs.
//   P4  Chrome only: what the page prints for the CSRD answer (2025-06-01), the link-only law ae-dl-11-2024-climate, the CSRD rail, every
//       Browse by place row and the citation line equals what tools/law.py and tools/query.py give for the same place, id and date.
//
// The window width 320, the limit 320 and every state's id, date and wording are constants written here from the story (STORY-GEL-34-11, "Context"), never
// read from the page's code. Each verdict also proves the window really is 320 px, the root font really is 16 or 32 px and the page
// really is in the state it names, so it cannot pass on an empty page.
// What it does NOT prove: Lighthouse, Safari, Firefox, VoiceOver, forced colours, reduced motion, colour-vision emulation, 200% zoom
// of a 1280 px window, WCAG 1.4.12 text spacing, or the keyboard journeys (only the Tab check on the place table below).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../web");

const WIDTH = 320; // CSS px: the window the story names
const LIMIT = 320; // CSS px: the most scrollWidth may be there
const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const KZ = { id: "kz-advertising-law", date: "2026-11-17", versions: 150 };
const READ_ON = "2026-11-17"; // --read-on of the recipe; the story's "later than the corpus" example is asked 2026-11-18
const NO_MATCH_LINE = "No law matches. Browse by place below.";
const HINT = "Enter a date in the form 2025-06-01.";
const LOAD_FAIL = "The law list did not load.";
const READY = `!!(window.GEL && GEL.data && !document.getElementById("example").disabled && !document.getElementById("date").disabled)`;

// ---------- the browser, as 08-cite.mjs drives it ----------
async function section(h, tag, fn) {
  try { await fn(); } catch (e) { h.check(tag, "section ran to the end", false, "threw: " + e.message); }
}

// Browser.* commands: the page session first, the browser target when the page session refuses.
async function onBrowser(h, method, params) {
  try {
    return await h.send(method, params);
  } catch (pageError) {
    const version = await (await fetch(`http://127.0.0.1:${h.cdp}/json/version`)).json();
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((ok, bad) => { ws.onopen = ok; ws.onerror = () => bad(new Error("browser WebSocket failed")); });
    try {
      return await new Promise((ok, bad) => {
        ws.onmessage = (ev) => {
          const m = JSON.parse(ev.data);
          if (m.id === 1) m.error ? bad(new Error(`${method}: ${m.error.message}`)) : ok(m.result);
        };
        ws.send(JSON.stringify({ id: 1, method, params }));
      });
    } finally {
      ws.close();
    }
  }
}
async function grantClipboard(h) {
  const origin = await h.evaluate("location.origin");
  await onBrowser(h, "Browser.grantPermissions", { origin, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] });
}

// A real mouse click: move, press, release at the centre of the element.
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

// Types into the law box: the box gets focus, the text goes in as one input event.
async function typeLaw(h, text) {
  await h.evaluate(`(() => { const l = document.getElementById("law"); l.focus(); l.select(); })()`);
  await h.send("Input.insertText", { text });
}

// ---------- P1: a 320 CSS px window ----------
// One page-side call: the widths, what the page says it is showing, and the elements that reach past the limit.
const MEASURE = `((limit) => {
  const d = document.documentElement, $ = (s) => document.querySelector(s);
  const vis = (el) => !!el && el.checkVisibility();
  const txt = (s) => { const e = $(s); return e ? e.textContent.replace(/\\s+/g, " ").trim() : null; };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.classList.length ? "." + [...el.classList].join(".") : "");
  const reach = [], content = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (r.right > limit + 0.5) reach.push(name(el) + " " + Math.round(r.width) + "px wide, right edge " + Math.round(r.right));
    else if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === "visible" && r.left + el.scrollWidth > limit + 0.5)
      content.push(name(el) + " box " + Math.round(r.width) + "px, content " + el.scrollWidth + "px");
  }
  const p = $("#answer-panel"), hint = $("#date-hint"), det = $("#rail details"), right = (s) => { const e = $(s); return e ? Math.round(e.getBoundingClientRect().right) : null; };
  return {
    innerW: window.innerWidth, clientW: d.clientWidth, scrollW: d.scrollWidth, bodyScrollW: document.body.scrollWidth, root: getComputedStyle(d).fontSize,
    shown: vis(p), state: p.getAttribute("data-state"), id: p.getAttribute("data-id"), date: p.getAttribute("data-date"),
    text: vis(p) ? p.innerText.replace(/\\s+/g, " ").trim() : null,
    loadStatus: txt("#load-status"), matchRows: document.querySelectorAll("#match-rows > li").length, matchCount: txt("#match-count"),
    hint: vis(hint) && hint.textContent.trim() ? hint.textContent.trim() : null, copyStatus: txt("#citation-status"),
    railWindow: document.querySelectorAll("#rail-window > li").length, railAll: document.querySelectorAll("#rail-all > li").length,
    railOpen: !!det && det.open, railSummary: det ? det.querySelector("summary").textContent.trim() : null, railText: txt("#rail"),
    cells: document.querySelectorAll("#browse-grid .cell").length, tableRows: document.querySelectorAll("#browse-table tbody tr").length,
    gridRight: right("#browse-grid"), tableRight: right("#browse-table"),
    reachN: reach.length, reach: reach.slice(0, 12), contentN: content.length, content: content.slice(0, 8),
  };
})(${LIMIT})`;

// The 21 states of the story's "Context" list (the story says 20; its list names 14 by address, one of them the load failure, and 7 by hand).
// reach(c) leaves the page in the state; expect(m) returns the problems when the page is not in it. The wording is the story's (Story 6 for
// the sentences, Story 4 for the load failure), the dates and ids are the story's, none comes from web/*.js.
const byAddress = (id, date, snap) => async (c) => {
  await c.h.open("ok"); // sets the data variant; then a fresh load at the address, through about:blank so the load event fires
  await c.h.navigate("about:blank");
  await c.h.navigate(c.origin + "/#law=" + id + "&date=" + date + "&snapshot=" + (snap ?? c.snap));
  await c.h.waitFor(READY, 10000);
};
const shows = (m, state, ...words) => [
  ...(m.shown && m.state === state ? [] : ["the answer panel is shown " + m.shown + " in state " + m.state + ", want shown in state " + state]),
  ...words.filter((w) => !(m.text || "").includes(w)).map((w) => "the panel does not say " + JSON.stringify(w)),
];
const STATES = [
  { n: 1, name: "first screen", how: "address, no hash", reach: async (c) => { await c.h.open("ok"); }, expect: (m) => (m.shown ? ["the answer panel is shown"] : []) },
  {
    n: 2, name: "load failure", how: "data file answers 404 (h.open missing)",
    reach: async (c) => { await c.h.open("missing", { ready: false }); await c.h.waitFor(`document.getElementById("load-status").textContent.trim() !== ""`, 10000); },
    expect: (m) => (m.loadStatus && m.loadStatus.includes(LOAD_FAIL) ? [] : ["the load line is " + JSON.stringify(m.loadStatus) + ", want " + JSON.stringify(LOAD_FAIL)]),
  },
  { n: 3, name: "in-force answer", id: CSRD.id, date: CSRD.date, how: "address", expect: (m) => shows(m, "plain", "In force since 2025-04-17") },
  { n: 4, name: "link only", id: "ae-dl-11-2024-climate", date: READ_ON, how: "address", expect: (m) => shows(m, "interim", "only a link") },
  { n: 5, name: "before the first version", id: CSRD.id, date: "2022-12-31", how: "address", expect: (m) => shows(m, "interim", "2023-01-05") },
  { n: 6, name: "repealed", id: "gn-arrete-2022-1646-evaluations-environnementales", date: "2024-01-01", how: "address", expect: (m) => shows(m, "interim", "Repealed on 2023-05-05") },
  { n: 7, name: "not yet in force", id: "eu-eudr-2023-1115", date: CSRD.date, how: "address", expect: (m) => shows(m, "plain", "2026-12-30") },
  {
    n: 8, name: "no match answer", how: "typed text, Enter (Story 6: \"Sarbanes-Oxley\")",
    reach: async (c) => {
      await c.h.open("ok");
      await c.h.evaluate(`GEL.setDate(${JSON.stringify(CSRD.date)})`);
      await typeLaw(c.h, "Sarbanes-Oxley");
      await c.h.press("Enter");
      await c.h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "no-match"`, 5000);
    },
    expect: (m) => shows(m, "no-match", "Sarbanes-Oxley"),
  },
  { n: 9, name: "in-force date not recorded", id: "dz-lf-1992-art117", date: "1995-01-01", how: "address", expect: (m) => shows(m, "plain", "does not record when this version entered into force") },
  { n: 10, name: "later than the corpus", id: CSRD.id, date: "2026-11-18", how: "address", expect: (m) => shows(m, "plain", "The corpus was read on " + READ_ON) },
  {
    n: 11, name: "one-version rail", id: "gt-ley-proteccion-mejoramiento-medio-ambiente", date: READ_ON, how: "address",
    expect: (m) => [...shows(m, "plain"), ...((m.railText || "").startsWith("Only stored version: 1986-12-27, adopted") ? [] : ["the rail reads " + JSON.stringify(m.railText) + ", want the one line \"Only stored version: 1986-12-27, adopted\" (the data file holds one row)"])],
  },
  {
    n: 12, name: "capped rail", id: KZ.id, date: KZ.date, how: "address",
    expect: (m) => [...shows(m, "plain"), ...(m.railWindow === 7 && m.railSummary === "Show all " + KZ.versions + " versions" && !m.railOpen ? [] : ["rail window " + m.railWindow + ", summary " + JSON.stringify(m.railSummary) + ", open " + m.railOpen + ", want 7, \"Show all 150 versions\", closed"])],
  },
  { n: 13, name: "same-date rows", id: "at-uwg-s1-2a", date: "2022-07-20", how: "address", expect: (m) => [...shows(m, "plain"), ...((m.railText || "").includes("same date, not shown") ? [] : ["the rail has no \"same date, not shown\" row"])] },
  { n: 14, name: "reopened address, snapshot other than the file's", id: CSRD.id, date: CSRD.date, snap: "af3d6b47f", how: "address, snapshot=af3d6b47f", expect: (m) => [...shows(m, "plain"), ...((m.loadStatus || "").startsWith("Snapshot af3d6b47f is not kept.") ? [] : ["the load line is " + JSON.stringify(m.loadStatus)])] },
  {
    n: 15, name: "match list open", how: "typed CSRD",
    reach: async (c) => { await c.h.open("ok"); await typeLaw(c.h, "CSRD"); await c.h.waitFor(`document.querySelectorAll("#match-rows > li").length > 0`, 5000); },
    expect: (m) => (m.matchRows >= 1 ? [] : ["the match list holds " + m.matchRows + " rows"]),
  },
  {
    n: 16, name: "match list with no match", how: "typed zzzzqqqq",
    reach: async (c) => { await c.h.open("ok"); await typeLaw(c.h, "zzzzqqqq"); await c.h.waitFor(`document.getElementById("match-count").textContent.trim() !== ""`, 5000); },
    expect: (m) => (m.matchCount === NO_MATCH_LINE ? [] : ["the count line is " + JSON.stringify(m.matchCount) + ", want " + JSON.stringify(NO_MATCH_LINE)]),
  },
  {
    n: 17, name: "date message", how: "typed five-digit year 12345-01-01",
    reach: async (c) => {
      await c.h.open("ok");
      await c.h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)})`);
      await c.h.evaluate(`__chk.setField("12345-01-01")`); // what typing does: set the value, fire input and change
      await c.h.evaluate(`GEL.setDate("12345-01-01")`); // and the text itself, for a value the field refuses to hold
      await c.h.evaluate(`__chk.blur()`);
    },
    expect: (m) => (m.hint === HINT ? [] : ["the date message is " + JSON.stringify(m.hint) + ", want " + JSON.stringify(HINT)]),
  },
  {
    n: 18, name: "rail expanded", how: "Show all 150 versions on kz-advertising-law",
    reach: async (c) => {
      await c.h.open("ok");
      await c.h.evaluate(`GEL.choose(${JSON.stringify(KZ.id)}); if (!GEL.setDate(${JSON.stringify(KZ.date)})) throw new Error("date refused")`);
      await c.h.waitFor(`document.querySelector("#rail details") && document.querySelectorAll("#rail-all > li").length > 0`);
      await c.h.evaluate(`document.querySelector("#rail details").open = true`);
    },
    expect: (m) => (m.railAll === KZ.versions && m.railOpen ? [] : ["#rail-all holds " + m.railAll + " rows, open " + m.railOpen + ", want " + KZ.versions + " and open"]),
  },
  {
    n: 19, name: "copy confirmation while it shows", how: "real click on Copy citation, clipboard granted",
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
    n: 20, name: "Browse by place, grid", how: "scrolled to #browse-grid",
    reach: async (c) => { await c.h.open("ok"); await c.h.evaluate(`document.getElementById("browse-grid").scrollIntoView()`); },
    expect: (m) => [...(m.cells > 0 ? [] : ["the grid holds no cells"]), ...(m.gridRight !== null && m.gridRight <= LIMIT ? [] : ["the grid's right edge is " + m.gridRight])],
  },
  {
    n: 21, name: "Browse by place, table", how: "scrolled to #browse-table",
    reach: async (c) => { await c.h.open("ok"); await c.h.evaluate(`document.getElementById("browse-table").scrollIntoView()`); },
    expect: (m) => [...(m.tableRows > 0 ? [] : ["the table holds no rows"]), ...(m.tableRight !== null && m.tableRight <= LIMIT ? [] : ["the table's right edge is " + m.tableRight])],
  },
];

async function p1(h, E) {
  const ctx = { h, origin: null, snap: E.snapshot9 };
  try {
    await p1States(h, ctx);
  } finally {
    await h.send("Emulation.clearDeviceMetricsOverride").catch(() => {}); // so P2 to P4 run in the default window
  }
}

async function p1States(h, ctx) {
  for (const [text, root] of [["100%", "16px"], ["200%", "32px"]]) {
    for (const s of STATES) {
      await h.send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: false });
      const reach = s.reach ?? byAddress(s.id, s.date, s.snap);
      let m, problems = [];
      try {
        await reach(ctx);
        ctx.origin = await h.evaluate("location.origin");
        // the size and the measure in one call, so a message that lasts 3 s is still showing
        m = await h.evaluate(`(() => { ${text === "200%" ? 'document.documentElement.style.fontSize = "200%";' : ""} return ${MEASURE}; })()`);
      } catch (e) {
        problems.push("could not reach the state: " + e.message);
      }
      if (m) {
        problems = [
          ...(m.innerW === WIDTH ? [] : ["window is " + m.innerW + "px wide, want " + WIDTH]),
          ...(m.root === root ? [] : ["root font is " + m.root + ", want " + root]),
          ...s.expect(m),
        ];
        if (m.scrollW > LIMIT) {
          problems.push("document scrollWidth " + m.scrollW + " > " + LIMIT + " (clientWidth " + m.clientW + ", body scrollWidth " + m.bodyScrollW + ")");
          if (m.reachN) problems.push(m.reachN + " elements reach past " + LIMIT + "px: " + m.reach.join("; "));
          if (m.contentN) problems.push(m.contentN + " elements whose content reaches past " + LIMIT + "px: " + m.content.join("; "));
        } else if (m.reachN) {
          // the page says it fits, but a box reaches past the window: something may be clipping the overflow (overflow hidden on html or body)
          problems.push("scrollWidth is " + m.scrollW + " but " + m.reachN + " elements reach past " + LIMIT + "px: " + m.reach.join("; "));
        }
      }
      const name = "S" + String(s.n).padStart(2, "0") + " " + s.name;
      h.verdict("11-p1-" + String(s.n).padStart(2, "0") + "-" + text.replace("%", ""), `${name} (${s.how}), 320px window, text ${text}: scrollWidth ${m ? m.scrollW : "not measured"}, at most ${LIMIT}`, problems);
      if (s.n === 21) {
        try {
          if (!m) throw new Error("S21 was not reached");
          await container(h, text, root);
        } catch (e) {
          h.check("11-p1-container-" + text.replace("%", ""), "place table container check ran to the end", false, "threw: " + e.message);
        }
      }
    }
  }
}

// The place table: if it is wider than its container, the container must scroll sideways and Tab must reach it. If it is not wider
// (the table stacks into cards at this width), no scroll container is needed; the verdict says which, and the report names the finding.
async function container(h, text, root) {
  const C = await h.evaluate(`(() => {
    const w = document.getElementById("browse-table-wrap"), t = document.getElementById("browse-table"), cs = getComputedStyle(w);
    return { overflowX: cs.overflowX, tabindex: w.getAttribute("tabindex"), wrapClient: w.clientWidth, wrapScroll: w.scrollWidth, tableW: Math.round(t.getBoundingClientRect().width), tableDisplay: getComputedStyle(t).display, doc: document.documentElement.scrollWidth, innerW: window.innerWidth, root: getComputedStyle(document.documentElement).fontSize };
  })()`);
  const wider = Math.max(C.wrapScroll, C.tableW) > C.wrapClient + 1;
  const problems = [
    ...(C.innerW === WIDTH ? [] : ["window is " + C.innerW + "px wide, want " + WIDTH]),
    ...(C.root === root ? [] : ["root font is " + C.root + ", want " + root]),
  ];
  let said = "the table (display " + C.tableDisplay + ", " + C.tableW + "px) is not wider than its container (" + C.wrapClient + "px), so nothing needs to scroll sideways (this does not show a keyboard-reachable scroll container: none exists)";
  if (wider) {
    said = "the table is " + Math.max(C.wrapScroll, C.tableW) + "px in a container " + C.wrapClient + "px wide: the container must scroll and Tab must reach it";
    if (!/^(auto|scroll)$/.test(C.overflowX)) problems.push("container overflow-x is " + C.overflowX + ", want auto or scroll");
    await h.evaluate(`document.getElementById("law").focus()`);
    let reached = false;
    for (let i = 0; i < 80 && !reached; i++) {
      await h.press("Tab");
      reached = await h.evaluate(`document.activeElement === document.getElementById("browse-table-wrap")`);
    }
    if (!reached) problems.push("80 presses of Tab never landed on #browse-table-wrap");
  }
  h.verdict("11-p1-container-" + text.replace("%", ""), `place table, 320px window, text ${text}: ${said}`, [...problems, ...(C.doc <= LIMIT ? [] : ["the page itself scrolls " + C.doc + "px wide"])]);
  if (!wider) console.log("  finding: no scroll container exists (#browse-table-wrap overflow-x " + C.overflowX + ", tabindex " + C.tabindex + "); the table stacks into cards at 320px, so the story's keyboard-reachable container has nothing to reach. NOT RUN: Tab reaching a scroll container");
}

// ---------- P2: the network list ----------
// The expected list is read from web/index.html: the page, every <link rel="stylesheet">, every <script src>, and the data file.
// <link rel="icon" href="data:,"> is not a request. Two independent readings of what was requested:
//   - the page's own resource timing list (performance.getEntriesByType), which also lists any off-origin request, and
//   - the harness server's request log (<workdir>/server.log, one JSON line per request that reached it, written before it answers),
//     which also lists a request the page's timing list would not (Chrome's own, such as /favicon.ico).
// The DevTools Network panel itself is not scripted; both readings are what it would list for this origin.
function expectedRequests() {
  const html = fs.readFileSync(path.join(WEB, "index.html"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const sheets = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)].map((x) => /href="([^"]+)"/.exec(x[0])[1]);
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((x) => x[1]);
  return ["/", ...sheets.map((f) => "/" + f), ...scripts.map((f) => "/" + f), "/law-data.json"].sort();
}
const TIMING = `[...performance.getEntriesByType("navigation").map((e) => e.name), ...performance.getEntriesByType("resource").map((e) => e.name)].map((u) => u.replace(location.origin, "").split("#")[0]).sort()`;
const serverLines = (h) => fs.readFileSync(path.join(h.workdir, "server.log"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const diff = (got, want) => [
  ...want.filter((x) => !got.includes(x)).map((x) => "missing " + x),
  ...got.filter((x, i) => got.indexOf(x) !== i || !want.includes(x)).map((x) => "extra " + x),
];

async function p2(h) {
  const want = expectedRequests();
  const logFrom = serverLines(h).length;
  await h.open("ok");
  const atLoad = { timing: await h.evaluate(TIMING), server: serverLines(h).slice(logFrom) };
  // journey 1: type a law name, pick the law, set a date
  await typeLaw(h, "CSRD");
  await h.waitFor(`document.querySelectorAll("#match-rows > li").length > 0`, 5000);
  await clickReal(h, `.match-row[data-id="${CSRD.id}"]`);
  await h.evaluate(`__chk.setField(${JSON.stringify(CSRD.date)})`);
  await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain" && document.getElementById("answer-panel").getAttribute("data-date") === ${JSON.stringify(CSRD.date)}`, 5000);
  // one variant: a repealed law
  await h.evaluate(`GEL.choose("gn-arrete-2022-1646-evaluations-environnementales"); GEL.setDate("2024-01-01")`);
  await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "interim"`, 5000);
  // one copy: the CSRD answer again, Copy citation with the clipboard granted
  await grantClipboard(h);
  await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)})`);
  await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain"`, 5000);
  await clickReal(h, "#citation-copy");
  await h.until(async () => (await h.evaluate(`document.getElementById("citation-status").textContent`)) === "Copied", 5000, "the copy confirmation");
  // one date change, typed
  await h.evaluate(`__chk.setField("2026-03-18")`);
  await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-date") === "2026-03-18"`, 5000);
  // end of the journey
  await h.sleep(500); // a request that follows a lookup would have been made by now
  const end = { timing: await h.evaluate(TIMING), server: serverLines(h).slice(logFrom) };
  console.log("  network list at the end of the journey (page resource timing): " + end.timing.join(" "));
  console.log("  server request log since the page was opened: " + end.server.map((r) => r.method + " " + r.path).join(" "));
  h.verdict("11-p2-load", `at load the page's own list is the ${want.length} requests index.html names: the page, ${want.length - 2} stylesheets and scripts, the data file`, diff(atLoad.timing, want));
  h.verdict("11-p2-timing", "after journey 1, a variant, a copy and a date change the page's resource timing list is the one it had at load, and the one index.html names", [
    ...diff(end.timing, atLoad.timing).map((x) => "against load: " + x),
    ...diff(end.timing, want).map((x) => "against index.html: " + x),
  ]);
  h.verdict("11-p2-server", "the server saw the same requests (GET only) after the journey as at load: none follows a lookup, and nothing the timing list would not show (a favicon, say)", [
    ...diff(end.server.map((r) => r.path).sort(), want).map((x) => "server log against index.html: " + x),
    ...(end.server.length === atLoad.server.length ? [] : [`${end.server.length - atLoad.server.length} requests reached the server after load: ${end.server.slice(atLoad.server.length).map((r) => r.method + " " + r.path).join(" ")}`]),
    ...end.server.filter((r) => r.method !== "GET").map((r) => "non-GET request: " + r.method + " " + r.path),
  ]);
}

// ---------- P3: Invoker Commands forced off ----------
// Method (08-cite.mjs, ac5): Page.addScriptToEvaluateOnNewDocument runs "delete window.CommandEvent" before any page script, so the page
// finds no Invoker Commands and registers its fallback click listener. A real mouse click (Input.dispatchMouseEvent) presses the
// button; the clipboard is read back from Chrome's own clipboard with navigator.clipboard.readText() (headless Chrome keeps its own
// clipboard and never writes the macOS pasteboard, found by 08-cite.mjs on Chrome 157). The expected line is the one tools/query.py gives,
// read from cite-expected.json (tests/web/cite_expected.py), never from the page.
const RECORDER = `(() => { window.__log = []; const info = console.info.bind(console); console.info = (...a) => { window.__log.push(a.join(" ")); info(...a); }; })();`;

async function p3(h) {
  const file = path.join(path.dirname(h.expected), "cite-expected.json");
  if (!fs.existsSync(file)) return h.check("11-p3", "cite-expected.json is next to expected.json", false, "missing " + file + "; build it with tests/web/cite_expected.py");
  const want = JSON.parse(fs.readFileSync(file, "utf8")).fixed.csrd;
  const ids = [];
  try {
    for (const source of [RECORDER, "delete window.CommandEvent;"]) ids.push((await h.send("Page.addScriptToEvaluateOnNewDocument", { source })).identifier);
    await h.open("ok");
    await grantClipboard(h);
    const env = await h.evaluate(`({ native: "CommandEvent" in window, log: window.__log.slice() })`);
    h.verdict("11-p3-path", `with delete window.CommandEvent at document start, "CommandEvent" in window is ${env.native}, and the page logged "cite: fallback path" once and not the invoker path`, [
      ...(env.native === false ? [] : ["CommandEvent is still in window"]),
      ...(env.log.filter((l) => l === "cite: fallback path").length === 1 ? [] : ["page log " + h.fmt(env.log)]),
      ...(env.log.includes("cite: invoker path") ? ["the page also logged the invoker path"] : []),
    ]);
    await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)})`);
    await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain" && !!document.getElementById("citation-copy")`, 5000);
    const shown = await h.evaluate(`document.getElementById("citation-line").textContent`);
    await h.evaluate(`Clipboard.prototype.writeText.call(navigator.clipboard, "sentinel-before-copy")`); // so an old clipboard cannot pass
    await clickReal(h, "#citation-copy");
    await h.until(async () => (await h.evaluate(`document.getElementById("citation-status").textContent`)) !== "", 5000, "the copy confirmation");
    const status = await h.evaluate(`document.getElementById("citation-status").textContent`);
    // read back
    const clip = await h.evaluate(`navigator.clipboard.readText().catch((e) => "readText failed: " + e)`);
    const first = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };
    h.verdict("11-p3-copy", "fallback click on Copy citation (CSRD, 2025-06-01): the clipboard holds the displayed line, which is the line tools/query.py gives, with no newline", [
      ...(shown === want ? [] : ["the displayed line differs from the Python line at index " + first(shown, want) + ": page " + h.fmt(shown.slice(0, 120)) + ", python " + h.fmt(want.slice(0, 120))]),
      ...(clip === shown ? [] : ["the clipboard differs from the displayed line at index " + first(String(clip), shown) + ": clipboard " + h.fmt(String(clip).slice(0, 120))]),
      ...(/[\r\n]/.test(String(clip)) ? ["the clipboard text holds a line break"] : []),
    ]);
    h.verdict("11-p3-status", "the confirmation shows after the fallback copy", status.trim() === "Copied" ? [] : ["the confirmation reads " + h.fmt(status)]);
    const v = await onBrowser(h, "Browser.getVersion", {});
    console.log("  P3 method: " + v.product + (v.userAgent.includes("Headless") ? " headless" : " headed") + ", CommandEvent deleted at document start, real mouse click, clipboard read back with navigator.clipboard.readText(); the macOS pasteboard was not read");
  } finally {
    for (const identifier of ids) await h.send("Page.removeScriptToEvaluateOnNewDocument", { identifier }).catch(() => {});
    await onBrowser(h, "Browser.resetPermissions", {}).catch(() => {});
  }
}

// ---------- P4: the answers read the same as tools/law.py ----------
// Chrome only: this check drives Chrome, and a browser other than Chrome is Not run (the report says so). The expected side is Python output:
//   - python3.13 tools/law.py <ISO2> <date> --json --ref <ref>     the in-force item for a stored law (title, in_force, kind, language, source_url, commit)
//   - tools/query.py, called as a module (python3.13 -I)           law_in_force (link_only list), instrument_history (versions), list_places (rows, scope)
//   - cite-expected.json, which tests/web/cite_expected.py builds from tools/query.py   the citation line
// How a law id maps to the place call: the id starts with the place's ISO2 code in lower case (eu-csrd-2022-2464 is EU, ae-dl-11-2024-climate is AE).
// The Python side checks that map instead of assuming it: list_places(place) must list the id among that place's instruments.
const REPO_PY = `
import json, sys
repo, ref = sys.argv[1], sys.argv[2]
sys.path.insert(0, repo + "/tools")
import query
out = {"mapping": {}}
for law_id in ("eu-csrd-2022-2464", "ae-dl-11-2024-climate"):
    place = law_id.split("-")[0].upper()
    listed = {i["id"]: i for i in query.list_places(repo, ref, place)["places"][0]["instruments"]}
    out["mapping"][law_id] = {"place": place, "status": listed[law_id]["status"] if law_id in listed else None}
out["history"] = query.instrument_history(repo, "eu-csrd-2022-2464", ref)["versions"]
ae = query.law_in_force(repo, "AE", "2026-11-17", None, ref)
out["ae_in_force_ids"] = [i["id"] for i in ae["in_force"]] + [i["id"] for i in ae["not_yet_in_force"]]
out["link_only"] = next((x for x in ae["link_only"] if x["id"] == "ae-dl-11-2024-climate"), None)
places = query.list_places(repo, ref)
out["place_count"] = places["place_count"]
out["places"] = [dict(zip(places["columns"], row)) for row in places["rows"]]
print(json.dumps(out))
`;

async function p4(h, E) {
  const repo = path.dirname(fs.realpathSync(WEB));
  const ref = E.ref;
  const lawCli = JSON.parse(spawnSync("python3.13", ["tools/law.py", "EU", CSRD.date, "--json", "--ref", ref, "--repo", repo], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 28 }).stdout || "null");
  const py = spawnSync("python3.13", ["-I", "-c", REPO_PY, repo, ref], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 28 });
  if (py.status !== 0 || !lawCli) return h.check("11-p4", "tools/law.py and tools/query.py ran", false, (py.stderr || "").trim().split("\n").pop() || "law.py printed no JSON");
  const Q = JSON.parse(py.stdout);
  const item = lawCli.in_force.find((i) => i.id === CSRD.id);
  const citeFile = path.join(path.dirname(h.expected), "cite-expected.json");
  const line = fs.existsSync(citeFile) ? JSON.parse(fs.readFileSync(citeFile, "utf8")).fixed.csrd : null;
  if (!item) return h.check("11-p4", "law.py lists " + CSRD.id + " in force on " + CSRD.date, false, "not in its in_force list");

  h.verdict("11-p4-mapping", "a law id maps to its place call by the ISO2 prefix of the id: list_places(place) lists " + Object.keys(Q.mapping).join(" and ") + " among that place's instruments", Object.entries(Q.mapping).flatMap(([id, m]) => (m.status ? [] : [id + " is not listed under " + m.place])));

  await h.open("ok");
  await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); GEL.setDate(${JSON.stringify(CSRD.date)})`);
  await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain" && document.getElementById("answer-panel").getAttribute("data-date") === ${JSON.stringify(CSRD.date)}`, 5000);
  const P = await h.evaluate(`(() => {
    const p = __chk.panel();
    return {
      title: p.title, since: p.since, kind: p.kindAttr, lang: p.lang, href: p.link && p.link.href, commit: p.commit, id: p.id, date: p.date,
      rail: [...document.querySelectorAll("#rail-window > li")].map((li) => ({ date: li.dataset.date, commit: li.dataset.commit, kind: li.querySelector(".rail-kind").textContent, current: li.classList.contains("rail-current") })),
      line: document.getElementById("citation-line").textContent,
    };
  })()`);
  console.log("  P4 law.py EU " + CSRD.date + ": " + item.id + ", in force " + item.in_force + ", " + item.kind + ", " + item.language + ", commit " + item.commit.slice(0, 9) + "; the page prints title " + h.fmt(P.title) + ", " + h.fmt(P.since) + ", kind " + P.kind + ", language " + P.lang + ", commit " + (P.commit || "").slice(0, 9));
  h.verdict("11-p4-answer", "CSRD on " + CSRD.date + ": the page's title, in-force date, kind, language, link and commit are those law.py gives (" + item.kind + " " + item.in_force + ")", [
    ...h.eqs([["title", P.title, item.title], ["id", P.id, item.id], ["date asked", P.date, CSRD.date], ["kind", P.kind, item.kind], ["language", P.lang, item.language], ["link", P.href, item.source_url], ["commit", P.commit, item.commit]]),
    ...(P.since && P.since.includes(item.in_force) ? [] : ["the since line " + h.fmt(P.since) + " does not hold " + item.in_force]),
  ]);

  const versions = [...Q.history].reverse(); // instrument_history is oldest first, the rail is newest first
  const current = P.rail.filter((r) => r.current);
  console.log("  P4 query.instrument_history " + CSRD.id + ": " + Q.history.map((v) => v.in_force + " " + v.kind).join(", ") + "; the rail prints " + P.rail.map((r) => r.date + " " + r.kind).join(", ") + "; marked: " + current.map((r) => r.date).join(","));
  h.verdict("11-p4-rail", "the CSRD rail lists the versions instrument_history gives (" + versions.length + ", newest first, with kind and commit) and marks the one law.py names in force", [
    ...h.eqs([["rows", P.rail.length, versions.length]]),
    ...versions.flatMap((v, i) => (P.rail[i] ? h.eqs([[`row ${i + 1} date`, P.rail[i].date, v.in_force], [`row ${i + 1} kind`, P.rail[i].kind, v.kind], [`row ${i + 1} commit`, P.rail[i].commit, v.commit]]) : [])),
    ...(current.length === 1 && current[0].commit === item.commit && current[0].date === item.in_force ? [] : ["marked rows: " + h.fmt(current) + ", want one row, " + item.in_force + " " + item.commit]),
  ]);

  console.log("  P4 citation line (query.py, cite-expected.json): " + line);
  h.verdict("11-p4-citation", "the citation line is the line tools/query.py gives (cite-expected.json), and holds law.py's title, in-force date and link", line === null ? ["cite-expected.json is missing"] : [
    ...(P.line === line ? [] : ["the page's line differs from the Python line: page " + h.fmt(P.line) + ", python " + h.fmt(line)]),
    ...[item.title, item.in_force, item.source_url, "in force on " + CSRD.date].filter((x) => !P.line.includes(x)).map((x) => "the line does not hold " + h.fmt(x)),
  ]);

  await h.evaluate(`GEL.choose("ae-dl-11-2024-climate"); GEL.setDate("2026-11-17")`);
  await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "interim" && document.getElementById("answer-panel").getAttribute("data-id") === "ae-dl-11-2024-climate"`, 5000);
  const L = await h.evaluate(`(() => { const p = __chk.panel(), s = document.querySelector('#answer-interim [data-part="source"]'); return { state: p.state, title: p.title, href: s && s.getAttribute("href") }; })()`);
  console.log("  P4 query.law_in_force AE 2026-11-17: ae-dl-11-2024-climate is " + (Q.link_only ? "in link_only with " + Q.link_only.official_url : "not in link_only") + " and " + (Q.ae_in_force_ids.includes("ae-dl-11-2024-climate") ? "in" : "not in") + " in_force or not_yet_in_force; the page shows state " + L.state + ", link " + L.href);
  h.verdict("11-p4-linkonly", "ae-dl-11-2024-climate: law.py's AE answer does not list it in force, query.py lists it link only with its official URL, and the page shows the interim answer with that title and URL", [
    ...(Q.link_only ? h.eqs([["page title", L.title, Q.link_only.title], ["page official link", L.href, Q.link_only.official_url]]) : ["law_in_force lists no link_only item for the id"]),
    ...(Q.ae_in_force_ids.includes("ae-dl-11-2024-climate") ? ["the id is in law_in_force's in_force or not_yet_in_force"] : []),
    ...(L.state === "interim" ? [] : ["the page's state is " + L.state + ", want interim"]),
  ]);

  const rows = await h.evaluate(`[...document.querySelectorAll("#browse-table tbody tr[data-place]")].map((tr) => ({ code: tr.getAttribute("data-place"), head: tr.querySelector("th").textContent, nums: [...tr.querySelectorAll("td")].map((td) => td.textContent) }))`);
  const byCode = new Map(rows.map((r) => [r.code, r]));
  const eu = Q.places.find((x) => x.iso2 === "EU"), euRow = byCode.get("EU");
  console.log("  P4 Browse by place, EU: query.list_places " + eu.name + " " + eu.instrument_count + " instruments, " + eu.stored_count + " text stored, " + eu.link_only_count + " link only; the page row prints " + h.fmt(euRow));
  const rowProblems = Q.places.flatMap((x) => {
    const r = byCode.get(x.iso2);
    return r ? h.eqs([[x.iso2 + " place cell", r.head, `${x.name} (${x.iso2})`], [x.iso2 + " instruments, text stored, link only", r.nums.join(" "), [x.instrument_count, x.stored_count, x.link_only_count].join(" ")]]) : [x.iso2 + " has no row in the table"];
  });
  h.verdict("11-p4-browse", `Browse by place: all ${Q.place_count} rows (place, instruments, text stored, link only) are those query.list_places gives`, [
    ...(rows.length === Q.place_count ? [] : [`the table has ${rows.length} rows, list_places has ${Q.place_count}`]),
    ...rowProblems.slice(0, 12), ...(rowProblems.length > 12 ? [`and ${rowProblems.length - 12} more`] : []),
  ]);
}

export async function run(h) {
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  try {
    await section(h, "11-p1", () => p1(h, E));
    await section(h, "11-p2", () => p2(h));
    await section(h, "11-p3", () => p3(h));
    await section(h, "11-p4", () => p4(h, E));
  } finally {
    await onBrowser(h, "Browser.resetPermissions", {}).catch(() => {}); // the clipboard grant of P2 and P3
    await h.open("ok").catch(() => {});
  }
}
