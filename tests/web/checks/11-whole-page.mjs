// Checks for STORY-GEL-34-11, part 3: the whole-page rows that Chrome can run. tests/web/check.mjs imports this file.
//
//   P1  a 320 CSS px window: document.documentElement.scrollWidth is at most 320 in every one of the story's states, at 100% text
//       and at 200% text (root font 32 px); the place table's keyboard-reachable scroll container (if the table is wider than it).
//   (P2 to P4 are added by the commits that follow: network list, Invoker Commands off, answers against tools/law.py.)
//
// The window width 320, the limit 320 and every state's id, date and wording are constants written here from the story (STORY-GEL-34-11, "Context"), never
// read from the page's code. Each verdict also proves the window really is 320 px, the root font really is 16 or 32 px and the page
// really is in the state it names, so it cannot pass on an empty page.
// What it does NOT prove: Lighthouse, Safari, Firefox, VoiceOver, forced colours, reduced motion, colour-vision emulation, 200% zoom
// of a 1280 px window, WCAG 1.4.12 text spacing, or the keyboard journeys (only the Tab check on the place table below).
import fs from "node:fs";

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
      if (s.n === 21) await container(h, text);
    }
  }
}

// The place table: if it is wider than its container, the container must scroll sideways and Tab must reach it. If it is not wider
// (the table stacks into cards at this width), no scroll container is needed; the verdict says which, and the report names the finding.
async function container(h, text) {
  const C = await h.evaluate(`(() => {
    const w = document.getElementById("browse-table-wrap"), t = document.getElementById("browse-table"), cs = getComputedStyle(w);
    return { overflowX: cs.overflowX, tabindex: w.getAttribute("tabindex"), wrapClient: w.clientWidth, wrapScroll: w.scrollWidth, tableW: Math.round(t.getBoundingClientRect().width), tableDisplay: getComputedStyle(t).display, doc: document.documentElement.scrollWidth };
  })()`);
  const wider = Math.max(C.wrapScroll, C.tableW) > C.wrapClient + 1;
  const problems = [];
  let said = "the table (display " + C.tableDisplay + ", " + C.tableW + "px) is not wider than its container (" + C.wrapClient + "px): nothing scrolls sideways, so no scroll container is needed";
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
  if (!wider) console.log("  finding: no scroll container exists (#browse-table-wrap overflow-x " + C.overflowX + ", tabindex " + C.tabindex + "); the table stacks into cards at 320px, so the story's keyboard-reachable container has nothing to reach");
}

export async function run(h) {
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  await section(h, "11-p1", () => p1(h, E));
  await h.open("ok").catch(() => {});
}
