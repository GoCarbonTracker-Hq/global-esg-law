// Checks for STORY-GEL-34-08 (copy a citation). tests/web/check.mjs imports this file after the 12 story 04 criteria.
// The tags 08-ac1 .. 08-ac9 follow the story's acceptance criteria in order.
//
// What it proves:
//   ac1  GEL.cite.build() on the real data gives, for every case of cite-expected.json (the Python probe built from tools/query.py),
//        the probe's line character for character; the two fixed lines of the story; the publication wording; the 9-character
//        snapshot id; the translation wording (on a synthetic detail); the real page draws that line for plain answers.
//   ac2  no line and no button after a non-plain answer that follows a CSRD answer, for each state and for all 553 link-only ids.
//   ac3  a data file whose coverage is "history trails working tree" and whose history commit differs: only the snapshot id moves.
//   ac4  native Invoker Commands path: a real mouse click copies exactly the line to the clipboard, once; status text,
//        role, place, timing, no-break space on a repeat; button never disabled.
//   ac5  with delete window.CommandEvent: the fallback path is the only one registered, one write, same text.
//   ac6  no navigator.clipboard: "Copy failed" in the live region that existed before, empty after 2 s, the line stays selectable.
//   ac7  the longest address at 320 px and ac9 the button and line at 390 px: no sideways scroll, button 44 px tall.
//   ac8  Tab reaches the button after the answer link, the 2 px ring, Enter and Space both copy.
// What it does NOT prove:
//   - The macOS pasteboard. The harness's Chrome is headless (--headless=new), which keeps its own clipboard: a copy shows
//     in navigator.clipboard.readText() but pbpaste keeps showing the sentinel. The checks read the copy back with
//     readText(), and require only that pbpaste holds the line or the untouched sentinel. The story's literal "pbpaste
//     equals the line" needs a headed Chrome, run by hand.
//   - Lighthouse on the button and VoiceOver in Safari (two copies in a row): by hand later (a note is printed, not a check).
//   - dz-lf-1992-art117 (date_basis rows) and eu-esrs-2023-2772 (not yet applying) are answered "interim" on the base this was
//     written against, so the page draws no line for them. Their line is checked through build() and through a stub that calls
//     GEL.cite.draw with state "plain" (and un-hides #answer-plain), until story 06 makes them plain; the real answer is
//     checked as it is: no line when interim, the probe's line when plain.
//   - A translation row is never shown by the real lookup on this snapshot; its wording is checked on a synthetic detail.
//   - NVDA, JAWS, Firefox, Safari: not run.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const LINK_ONLY = ["ae-dl-11-2024-climate", "ag-eccb-climate-risk-standard"];
const BEFORE_FIRST = { id: CSRD.id, date: "2022-12-31" };
const REPEALED = { id: "gn-arrete-2022-1646-evaluations-environnementales", date: "2023-05-05" };
const SENTINEL = "sentinel-before-copy";
const NBSP = String.fromCharCode(160);
const RING = "rgb(27, 77, 62)";

// ---------- helpers ----------
// Runs a function body in the page; a throw comes back as {error} so one failure does not stop the run.
const probe = (h, body) => h.evaluate(`(async () => { try { ${body} } catch (e) { return { error: String(e) }; } })()`);

// A throw inside one criterion becomes one failed check for it, and the later criteria still run.
async function section(h, tag, fn) {
  try { await fn(); } catch (e) { h.check(tag, "criterion ran to the end", false, `threw: ${e.message}`); }
}

const utf8 = { ...process.env, LANG: "en_US.UTF-8", LC_ALL: "en_US.UTF-8" };
const putOnPasteboard = (text) => spawnSync("pbcopy", { input: text, env: utf8 });
const readPasteboard = () => spawnSync("pbpaste", { encoding: "utf8", env: utf8 }).stdout;
// Headless Chrome (the harness starts it with --headless=new) keeps its own clipboard and never writes the macOS pasteboard
// (found 2026-11-18 on Chrome 157: after a copy that readText() returns, pbpaste still shows the sentinel). So a copy is read
// back from Chrome's clipboard with readText() (the clipboardReadWrite grant), and the pasteboard is held to a weaker rule:
// it may hold the line (a Chrome that writes it) or the untouched sentinel, never anything else.
const putOnClipboard = async (h, text) => {
  putOnPasteboard(text);
  await h.evaluate(`navigator.clipboard ? Clipboard.prototype.writeText.call(navigator.clipboard, ${JSON.stringify(text)}).then(() => true, () => false) : false`);
};
const readClipboard = (h) => h.evaluate(`navigator.clipboard ? navigator.clipboard.readText().catch((e) => "readText failed: " + e) : null`);
let noted = false;
function copiedProblems(h, r, line, who) {
  if (!noted && r.clip === line && r.pasted === SENTINEL) {
    noted = true;
    console.log("  note: pbpaste still shows the sentinel after a copy that readText() returns: headless Chrome keeps its own clipboard, so the copies are read back with readText()");
  }
  return [
    ...(r.armed === null || r.armed === SENTINEL ? [] : [`${who}: the sentinel did not reach Chrome's clipboard (readText gave ${h.fmt(r.armed)})`]),
    ...(r.clip === line ? [] : [`${who}: Chrome's clipboard (readText) differs from the line: ${diffAt(h, r.clip, line)}`]),
    ...(r.pasted === line || r.pasted === SENTINEL ? [] : [`${who}: pbpaste holds ${h.fmt(r.pasted)}, neither the line nor the sentinel`]),
  ];
}

// The harness reuses one tab: every script added here is removed again by the function this returns.
async function inject(h, sources) {
  const ids = [];
  const off = async () => {
    for (const identifier of ids.splice(0)) await h.send("Page.removeScriptToEvaluateOnNewDocument", { identifier }).catch(() => {});
  };
  try {
    for (const source of sources) ids.push((await h.send("Page.addScriptToEvaluateOnNewDocument", { source })).identifier);
  } catch (e) {
    await off();
    throw e;
  }
  return off;
}

// Records console.info calls (the page logs which copy path it registered) and still forwards them.
const RECORDER = `(() => { window.__log = []; const info = console.info.bind(console); console.info = (...a) => { window.__log.push(a.join(" ")); info(...a); }; })();`;
// Every writeText call is kept (the text) and forwarded; button.disabled is sampled every 20 ms.
const WRAP = `(() => {
  window.__writes = [];
  const clip = navigator.clipboard, write = clip.writeText.bind(clip);
  clip.writeText = (text) => { window.__writes.push(text); return write(text); };
  window.__dis = [];
  setInterval(() => window.__dis.push(document.getElementById("citation-copy")?.disabled ?? null), 20);
})()`;

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

// Opens the page with the injected scripts, runs fn, then always removes the scripts (and the permission grant).
async function withPage(h, scripts, { grant = false } = {}, fn) {
  const off = await inject(h, scripts);
  let granted = false;
  try {
    await h.open("ok");
    if (grant) { await grantClipboard(h); granted = true; }
    await fn();
  } finally {
    if (granted) await onBrowser(h, "Browser.resetPermissions", {}).catch(() => {});
    await off();
  }
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
const pressSpace = async (h) => {
  await h.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32, text: " " });
  await h.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
};

const statusText = (h) => h.evaluate(`document.getElementById("citation-status").textContent`);
const show = (h, c) => h.evaluate(`GEL.showAnswer(${JSON.stringify(c.id)}, ${JSON.stringify(c.date)})`);

// Waits until the status is empty, puts the sentinel on the pasteboard and in Chrome's clipboard, does the input,
// waits for a message, and returns what the status, the clipboards and the writeText log held at that moment.
async function copyAndRead(h, input) {
  await h.until(async () => (await statusText(h)) === "", 5000, "the status to be empty before the input");
  await putOnClipboard(h, SENTINEL);
  const armed = await readClipboard(h);
  await input();
  await h.until(async () => (await statusText(h)) !== "", 5000, "a status message after the input");
  const t0 = Date.now();
  return {
    t0,
    armed,
    message: await statusText(h),
    clip: await readClipboard(h),
    pasted: readPasteboard(),
    writes: await h.evaluate("(window.__writes || []).slice()"),
  };
}

// Copy for dz and not-yet-applying: the answer is interim on this base, so draw the line through a stub.
// The stub un-hides #answer-plain (hidden for an interim answer), where the slot lives. It returns the real data-state.
const STUB = (c) => `(() => {
  GEL.showAnswer(${JSON.stringify(c.id)}, ${JSON.stringify(c.date)});
  const state = document.getElementById("answer-panel").getAttribute("data-state");
  const entry = GEL.byId[${JSON.stringify(c.id)}], date = ${JSON.stringify(c.date)};
  const interval = GEL.coveringInterval(entry, date);
  const row = entry.versions.find((v) => v.commit === interval.commit);
  const panel = document.getElementById("answer-panel");
  document.getElementById("answer-plain").hidden = false;
  GEL.cite.draw({ entry, date, interval, row, panel, state: "plain", reason: null });
  return state;
})()`;

// Where the first difference is, for a message.
function diffAt(h, got, want) {
  if (typeof got !== "string") return `got ${h.fmt(got)}`;
  let i = 0;
  while (i < got.length && i < want.length && got[i] === want[i]) i++;
  const cut = (s) => s.slice(Math.max(0, i - 12), i + 28);
  return `first difference at index ${i} (lengths ${got.length}, ${want.length}): got ${h.fmt(cut(got))}, want ${h.fmt(cut(want))}`;
}

// Layout numbers for the line, the actions row and the button.
const FIT = `(() => {
  const d = document.documentElement, line = document.getElementById("citation-line");
  const actions = document.querySelector(".cite-actions"), button = document.getElementById("citation-copy");
  const r = button.getBoundingClientRect();
  return {
    innerWidth, doc: [d.scrollWidth, d.clientWidth], line: [line.scrollWidth, line.clientWidth],
    actions: [actions.scrollWidth, actions.clientWidth], buttonRight: r.right, buttonHeight: r.height, lineText: line.textContent,
  };
})()`;
const fitProblems = (f) => [
  ...(f.doc[0] <= f.doc[1] ? [] : [`the page scrolls sideways: scrollWidth ${f.doc[0]} > clientWidth ${f.doc[1]}`]),
  ...(f.line[0] <= f.line[1] ? [] : [`the line overflows: scrollWidth ${f.line[0]} > clientWidth ${f.line[1]}`]),
  ...(f.actions[0] <= f.actions[1] ? [] : [`the actions row overflows: scrollWidth ${f.actions[0]} > clientWidth ${f.actions[1]}`]),
];

// The viewport override can be lost by a navigation: set it before and again after the page opens.
async function atWidth(h, width, fn) {
  const set = () => h.send("Emulation.setDeviceMetricsOverride", { width, height: 800, deviceScaleFactor: 1, mobile: false });
  await set();
  try {
    await h.open("ok");
    if ((await h.evaluate("innerWidth")) !== width) await set();
    await fn();
  } finally {
    await h.send("Emulation.clearDeviceMetricsOverride").catch(() => {});
  }
}

// ---------- AC1: the lines ----------
async function ac1(h, E) {
  const T = "08-ac1";
  const cases = E.cases;
  const want = (label) => cases.find((c) => c.label === label);
  await h.open("ok");

  // The unit test on real data: the detail built the way answer.js builds it, state forced to plain.
  const built = await probe(h, `
    const out = [];
    for (const c of ${JSON.stringify(cases.map(({ id, date }) => ({ id, date })))}) {
      const o = {};
      try {
        const entry = GEL.byId[c.id];
        const interval = GEL.coveringInterval(entry, c.date);
        const row = entry.versions.find((v) => v.commit === interval.commit);
        const detail = { entry, date: c.date, interval, row, panel: document.getElementById("answer-panel"), state: "plain", reason: null };
        Object.assign(o, { built: GEL.cite.build(detail, GEL.data), commit: interval.commit, kind: row.kind, dateBasis: row.date_basis ?? null, inForce: row.in_force });
      } catch (e) { o.error = String(e); }
      out.push(o);
    }
    return out;`);
  if (!Array.isArray(built)) { h.check(T, "GEL.cite.build ran on the real data", false, built.error ?? h.fmt(built)); return; }
  const names = cases.map((c) => c.label).join(", ");

  h.verdict(T, `GEL.cite.build on the real data equals the probe's line, character for character, for all ${cases.length} cases (${names})`,
    cases.flatMap((c, i) => built[i].error ? [`${c.label}: ${built[i].error}`] : built[i].built === c.line ? [] : [`${c.label}: ${diffAt(h, built[i].built, c.line)}`]));

  h.verdict(T, `the row is the one of the interval's commit: interval.commit starts with the probe's commit, row.kind and row.date_basis match, for all ${cases.length} cases`,
    cases.flatMap((c, i) => {
      const b = built[i];
      if (b.error) return [`${c.label}: ${b.error}`];
      return [
        ...(h.sameCommit(b.commit, c.commit) ? [] : [`${c.label}: interval.commit ${h.fmt(b.commit)}, want one starting ${c.commit}`]),
        ...h.eqs([[`${c.label} row.kind`, b.kind, c.kind], [`${c.label} row.date_basis`, b.dateBasis, c.date_basis]]),
      ];
    }));

  h.verdict(T, "the two fixed lines of the story (csrd, dz), read from cite-expected.json, equal the probe's lines and the page's build, character for character",
    ["csrd", "dz"].flatMap((k) => {
      const c = want(k), b = built[cases.indexOf(c)].built;
      return [
        ...(E.fixed[k] === c.line ? [] : [`${k}: fixed line differs from the probe line: ${diffAt(h, E.fixed[k], c.line)}`]),
        ...(b === E.fixed[k] ? [] : [`${k}: page build differs from the fixed line: ${diffAt(h, b, E.fixed[k])}`]),
      ];
    }));

  const pub = cases.map((c, i) => [c, built[i]]).filter(([c]) => c.date_basis === "publication");
  h.verdict(T, `the ${pub.length} publication-dated cases read "in-force date not recorded (published <date>)" with the row's own date, and never "in force since" or "version since"`,
    pub.flatMap(([c, b]) => {
      const line = b.built ?? "";
      const phrase = `in-force date not recorded (published ${b.inForce})`;
      const probed = /in-force date not recorded \(published (\d{4}-\d\d-\d\d)\)/.exec(c.line)?.[1];
      return [
        ...(line.includes(phrase) ? [] : [`${c.label}: the page line lacks ${h.fmt(phrase)}`]),
        ...(probed === b.inForce ? [] : [`${c.label}: probe publication date ${h.fmt(probed)}, page row.in_force ${h.fmt(b.inForce)}`]),
        ...(/in force since| version since/.test(line) ? [`${c.label}: the page line says "since"`] : []),
      ];
    }));

  const lines = [...cases.map((c) => ["probe " + c.label, c.line]), ...cases.map((c, i) => ["page " + c.label, built[i].built ?? ""])];
  h.verdict(T, "no line (probe or page, any case) holds a newline or a carriage return",
    lines.filter(([, l]) => /[\r\n]/.test(l)).map(([n]) => `${n} has a line break`));
  h.verdict(T, `the snapshot id in every line is exactly the 9 characters ${E.snapshot9}, the first 9 of the history commit: not 8, not 40, not the stale c76381e2f`, [
    ...(E.history_commit.length === 40 && E.history_commit.slice(0, 9) === E.snapshot9 ? [] : [`cite-expected.json: snapshot9 ${E.snapshot9} is not the first 9 of history_commit ${E.history_commit}`]),
    ...lines.flatMap(([n, l]) => {
      const id = /\(snapshot ([^)]*)\)/.exec(l)?.[1];
      return id === E.snapshot9 && id.length === 9 && id !== "c76381e2f" ? [] : [`${n}: snapshot id ${h.fmt(id)}`];
    }),
  ]);

  // The real page answer: a plain answer draws the probe's line, an interim one draws nothing.
  const real = await probe(h, `
    const out = [];
    for (const c of ${JSON.stringify(cases.map(({ id, date }) => ({ id, date })))}) {
      GEL.showAnswer(c.id, c.date);
      const lines = document.querySelectorAll("#citation-line");
      out.push({ state: document.getElementById("answer-panel").getAttribute("data-state"), lines: lines.length, buttons: document.querySelectorAll("#citation-copy").length, text: lines.length ? lines[0].textContent : null });
    }
    return out;`);
  if (!Array.isArray(real)) { h.check(T, "the real answers ran", false, real.error ?? h.fmt(real)); }
  else {
    const plain = cases.filter((c, i) => real[i].state === "plain").map((c) => c.label);
    const interim = cases.filter((c, i) => real[i].state !== "plain").map((c) => c.label);
    h.verdict(T, `after the real GEL.showAnswer: the ${plain.length} plain answers (${plain.join(", ")}) draw #citation-line equal to the probe's line; the ${interim.length} interim ones (${interim.join(", ")}) draw no line and no button`,
      cases.flatMap((c, i) => {
        const r = real[i];
        if (r.state === "plain") return [...h.eqs([[`${c.label} lines`, r.lines, 1], [`${c.label} buttons`, r.buttons, 1]]), ...(r.text === c.line ? [] : [`${c.label}: ${diffAt(h, r.text, c.line)}`])];
        return h.eqs([[`${c.label} (data-state ${r.state}) lines`, r.lines, 0], [`${c.label} buttons`, r.buttons, 0]]);
      }));
  }

  // The stub: dz and not-yet-applying drawn as plain, until story 06 makes the real answer plain.
  const stubbed = [];
  for (const label of ["dz", "not-yet-applying"]) {
    const c = want(label);
    const state = await h.evaluate(STUB(c));
    const seen = await h.evaluate(`({ lines: document.querySelectorAll("#citation-line").length, text: document.getElementById("citation-line")?.textContent ?? null })`);
    stubbed.push({ c, state, seen });
  }
  h.verdict(T, `dz and not-yet-applying drawn through the stub (GEL.cite.draw with state plain; the real answers are ${stubbed.map((s) => s.state).join(" and ")} on this base): #citation-line holds the probe's line`,
    stubbed.flatMap(({ c, seen }) => [...h.eqs([[`${c.label} lines in the slot`, seen.lines, 1]]), ...(seen.text === c.line ? [] : [`${c.label}: ${diffAt(h, seen.text, c.line)}`])]));

  // The translation wording on a synthetic detail: the real lookup shows none on this snapshot.
  const data = JSON.parse(fs.readFileSync(h.data, "utf8"));
  const entry = data.entries.find((e) => e.versions.some((v) => v.kind === "translation" && !v.date_basis));
  const row = entry.versions.find((v) => v.kind === "translation" && !v.date_basis);
  const asked = "2026-11-01";
  const wantLine = `${entry.title}; in force on ${asked}, translation since ${row.in_force}; global-esg-law, corpus read ${E.read_on} (snapshot ${E.snapshot9}); ${row.source_url}`;
  const tr = await probe(h, `
    const entry = GEL.byId[${JSON.stringify(entry.id)}];
    const row = entry.versions.find((v) => v.kind === "translation" && !v.date_basis);
    const interval = { from: row.in_force, commit: row.commit, state: "in_force" };
    const detail = { entry, date: ${JSON.stringify(asked)}, interval, row, panel: document.getElementById("answer-panel"), state: "plain", reason: null };
    let shown = 0;
    for (const e of GEL.data.entries) for (const i of e.intervals || []) {
      const r = e.versions.find((v) => v.commit === i.commit);
      if (r && r.kind === "translation" && !r.date_basis) shown++;
    }
    return { built: GEL.cite.build(detail, GEL.data), shown };`);
  h.verdict(T, `translation wording on a synthetic detail (${entry.id}): "translation since <date>", not "translation version" (the real lookup never shows one: ${tr.shown} intervals point to a translation row, the probe says ${E.translation.shown_by_lookup})`, [
    ...(tr.error ? [tr.error] : []),
    ...(tr.error || tr.built === wantLine ? [] : [diffAt(h, tr.built, wantLine)]),
    ...(tr.error ? [] : h.eqs([["intervals pointing to a translation row", tr.shown, E.translation.shown_by_lookup]])),
  ]);
}

// ---------- AC2: no line, no button ----------
async function ac2(h, E) {
  const T = "08-ac2";
  const dz = E.cases.find((c) => c.label === "dz"), nya = E.cases.find((c) => c.label === "not-yet-applying");
  await h.open("ok");
  const states = [
    { name: `link only ${LINK_ONLY[0]}`, id: LINK_ONLY[0], date: E.read_on },
    { name: `link only ${LINK_ONLY[1]}`, id: LINK_ONLY[1], date: E.read_on },
    { name: `before the first version (${BEFORE_FIRST.id} on ${BEFORE_FIRST.date})`, ...BEFORE_FIRST },
    { name: `repealed (${REPEALED.id} on ${REPEALED.date})`, ...REPEALED },
    { name: `dz on ${dz.date} when interim`, id: dz.id, date: dz.date, optional: true },
    { name: `not-yet-applying ${nya.id} on ${nya.date} when interim`, id: nya.id, date: nya.date, optional: true },
  ];
  const R = await probe(h, `
    const csrd = ${JSON.stringify(CSRD)};
    const count = () => ({
      line: document.querySelectorAll("#citation-line").length, copy: document.querySelectorAll("#citation-copy").length,
      all: document.querySelectorAll("#citation-line, #citation-copy").length, kids: document.getElementById("slot-citation").children.length,
    });
    const out = [];
    for (const s of ${JSON.stringify(states)}) {
      GEL.showAnswer(csrd.id, csrd.date);
      const before = count();
      GEL.showAnswer(s.id, s.date);
      out.push({ before, after: count(), state: document.getElementById("answer-panel").getAttribute("data-state") });
    }
    return out;`);
  if (!Array.isArray(R)) { h.check(T, "the non-plain answers ran", false, R.error ?? h.fmt(R)); }
  else {
    const skipped = states.filter((s, i) => s.optional && R[i].state === "plain").map((s) => s.name);
    h.verdict(T, `after a real CSRD answer (one #citation-line, one #citation-copy), each non-plain answer leaves 0 of them and an empty #slot-citation: ${states.filter((s) => !skipped.includes(s.name)).map((s) => s.name).join("; ")}` + (skipped.length ? ` (not run, plain now: ${skipped.join("; ")})` : ""),
      states.flatMap((s, i) => {
        const r = R[i];
        if (s.optional && r.state === "plain") return [];
        return [
          ...h.eqs([[`${s.name}: lines after the CSRD answer`, r.before.line, 1], [`${s.name}: buttons after the CSRD answer`, r.before.copy, 1], [`${s.name}: data-state`, r.state, "interim"]]),
          ...h.eqs([[`${s.name}: #citation-line and #citation-copy left`, r.after.all, 0], [`${s.name}: children left in #slot-citation`, r.after.kids, 0]]),
        ];
      }));
  }

  const ids = E.link_only_ids;
  const L = await probe(h, `
    const ids = ${JSON.stringify(ids)}, csrd = ${JSON.stringify(CSRD)};
    const absent = [], hasIntervals = [], left = [];
    for (const id of ids) {
      const e = GEL.byId[id];
      if (!e) { absent.push(id); continue; }
      if (e.intervals && e.intervals.length) hasIntervals.push(id);
      GEL.showAnswer(csrd.id, csrd.date);
      GEL.showAnswer(id, ${JSON.stringify(E.read_on)});
      if (document.querySelectorAll("#citation-line, #citation-copy").length || document.getElementById("slot-citation").children.length) left.push(id);
    }
    const none = GEL.data.entries.filter((e) => !(e.intervals && e.intervals.length)).map((e) => e.id);
    return { absent, hasIntervals, left, pageCount: none.length, notListed: none.filter((id) => !ids.includes(id)) };`);
  h.verdict(T, `all ${ids.length} link-only ids of the probe (after a CSRD answer each): ${L.left ? L.left.length : "?"} leave a citation line or button, all exist in GEL.byId, none has intervals (recount in the page: ${L.pageCount} entries without intervals)`, L.error ? [L.error] : [
    ...h.eqs([["ids in the probe file", ids.length, E.link_only_count], ["distinct ids", new Set(ids).size, ids.length], ["ids missing from GEL.byId", L.absent.length, 0], ["ids that have intervals", L.hasIntervals.length, 0], ["ids that leave a line or button", L.left.length, 0], ["entries without intervals in the page", L.pageCount, ids.length], ["such entries not in the probe list", L.notListed.length, 0]]),
    ...(L.left.length ? [`first ids that left a line: ${h.fmt(L.left.slice(0, 5))}`] : []),
  ]);
}

// ---------- AC3: the coverage variant ----------
async function ac3(h, E) {
  const T = "08-ac3";
  const clone = structuredClone(JSON.parse(fs.readFileSync(h.data, "utf8")));
  const fake = "0123456789abcdef0123456789abcdef01234567";
  clone.coverage.status = "history trails working tree";
  clone.snapshot.history_commit = fake;
  h.addVariant("08-trails", clone);
  await h.open("08-trails");
  await show(h, CSRD);
  const got = await h.evaluate(`({ line: document.getElementById("citation-line")?.textContent ?? null, coverage: GEL.data.coverage.status, commit: GEL.data.snapshot.history_commit })`);
  const old = `(snapshot ${E.snapshot9})`;
  const wantLine = E.fixed.csrd.replace(old, `(snapshot ${fake.slice(0, 9)})`);
  h.verdict(T, `coverage.status "history trails working tree" with history commit ${fake.slice(0, 9)}...: the CSRD line is the fixed line with only (snapshot ${E.snapshot9}) replaced by (snapshot ${fake.slice(0, 9)})`, [
    ...(E.fixed.csrd.split(old).length === 2 ? [] : [`the fixed CSRD line holds ${h.fmt(old)} ${E.fixed.csrd.split(old).length - 1} times, not once`]),
    ...h.eqs([["data coverage.status the page loaded", got.coverage, "history trails working tree"], ["data history_commit the page loaded", got.commit, fake]]),
    ...(got.line === wantLine ? [] : [diffAt(h, got.line, wantLine)]),
  ]);
}

// ---------- AC4: the native path ----------
async function ac4(h, E) {
  const T = "08-ac4";
  await withPage(h, [RECORDER], { grant: true }, async () => {
    const env = await h.evaluate(`({ native: "CommandEvent" in window, log: window.__log.slice(), secure: isSecureContext })`);
    h.verdict(T, `Invoker Commands are native ("CommandEvent" in window is ${env.native}) and the page logged "cite: invoker path" once, not the fallback`, [
      ...h.eqs([["CommandEvent in window", env.native, true], ["isSecureContext", env.secure, true]]),
      ...(env.log.filter((l) => l === "cite: invoker path").length === 1 ? [] : [`page log ${h.fmt(env.log)}`]),
      ...(env.log.includes("cite: fallback path") ? ["the page also logged the fallback path"] : []),
    ]);

    await h.evaluate(WRAP);
    await show(h, CSRD);
    const line = await h.evaluate(`document.getElementById("citation-line").textContent`);
    const a = await copyAndRead(h, () => clickReal(h, "#citation-copy"));
    const box = await h.evaluate(`(() => {
      const b = document.getElementById("citation-copy"), s = document.getElementById("citation-status");
      return { role: s.getAttribute("role"), inside: b.contains(s), sameParent: s.parentElement === b.parentElement, display: getComputedStyle(s).display };
    })()`);
    await h.sleep(Math.max(0, 1000 - (Date.now() - a.t0)));
    const at1 = await statusText(h);
    await h.sleep(Math.max(0, 3000 - (Date.now() - a.t0)));
    const at3 = await statusText(h);
    const dis = await h.evaluate(`({ samples: window.__dis.length, anyTrue: window.__dis.includes(true), now: document.getElementById("citation-copy").disabled })`);

    h.verdict(T, "a real mouse click copies exactly the displayed line to the clipboard (no newline, no label; read back with readText, see the note on pbpaste), writeText ran once, with that text", [
      ...copiedProblems(h, a, line, "first copy"),
      ...(/[\r\n]/.test(a.clip ?? "") || (a.clip ?? "").includes("Copy citation") ? [`the clipboard holds a line break or the label: ${h.fmt(a.clip)}`] : []),
      ...h.eqs([["writeText calls", a.writes.length, 1]]),
      ...(a.writes[0] === line ? [] : [`writeText argument: ${diffAt(h, a.writes[0], line)}`]),
    ]);
    h.verdict(T, "the status is a role=status element beside the button (same parent), outside it, never display:none, and reads exactly Copied", [
      ...h.eqs([["status text", a.message, "Copied"], ["status role", box.role, "status"], ["button contains the status", box.inside, false], ["status shares the button's parent", box.sameParent, true]]),
      ...(box.display === "none" ? ["status display is none"] : []),
    ]);
    h.verdict(T, "the status is still there at about 1000 ms and empty (exactly) by 3000 ms", [
      ...h.eqs([["status at ~1000 ms", at1, "Copied"], ["status at ~3000 ms", at3, ""]]),
    ]);
    h.verdict(T, `button.disabled was false throughout (sampled every 20 ms: ${dis.samples} samples) and is false afterwards`, [
      ...(dis.samples >= 50 ? [] : [`only ${dis.samples} samples`]),
      ...h.eqs([["a sample with disabled true", dis.anyTrue, false], ["disabled afterwards", dis.now, false]]),
    ]);

    // A second copy right after the message has emptied: the same message gets a no-break space.
    const b = await copyAndRead(h, () => clickReal(h, "#citation-copy"));
    h.verdict(T, "second copy after the status emptied: the message is Copied plus one no-break space (char 160), not equal to the first, and writeText ran twice in all", [
      ...h.eqs([["second status text", b.message, "Copied" + NBSP], ["writeText calls in all", b.writes.length, 2]]),
      ...(b.message !== a.message ? [] : ["the second message equals the first"]),
      ...copiedProblems(h, b, line, "second copy"),
    ]);

    // The same click on the lines of dz (accents) and not-yet-applying, drawn through the stub on this base.
    const rows = [];
    for (const label of ["dz", "not-yet-applying"]) {
      const c = E.cases.find((x) => x.label === label);
      const state = await h.evaluate(STUB(c));
      const r = await copyAndRead(h, () => clickReal(h, "#citation-copy"));
      rows.push({ c, state, r });
    }
    h.verdict(T, `dz and not-yet-applying through the stub (real answers ${rows.map((x) => x.state).join(" and ")}): a real click puts the probe's line on the clipboard, one more writeText each, status Copied`,
      rows.flatMap(({ c, r }, i) => [
        ...copiedProblems(h, r, c.line, c.label),
        ...h.eqs([[`${c.label} writeText calls in all`, r.writes.length, 3 + i], [`${c.label} status`, r.message.trim(), "Copied"]]),
        ...(r.writes[r.writes.length - 1] === c.line ? [] : [`${c.label}: last writeText argument differs from the line`]),
      ]));
  });
}

// ---------- AC5: the fallback path ----------
async function ac5(h) {
  const T = "08-ac5";
  await withPage(h, [RECORDER, "delete window.CommandEvent;"], { grant: true }, async () => {
    const env = await h.evaluate(`({ native: "CommandEvent" in window, log: window.__log.slice() })`);
    h.verdict(T, `with delete window.CommandEvent injected at document start, "CommandEvent" in window is ${env.native}, and the page logged "cite: fallback path" once, not the invoker path`, [
      ...h.eqs([["CommandEvent in window", env.native, false]]),
      ...(env.log.filter((l) => l === "cite: fallback path").length === 1 ? [] : [`page log ${h.fmt(env.log)}`]),
      ...(env.log.includes("cite: invoker path") ? ["the page also logged the invoker path"] : []),
    ]);
    await h.evaluate(WRAP);
    await show(h, CSRD);
    const line = await h.evaluate(`document.getElementById("citation-line").textContent`);
    const a = await copyAndRead(h, () => clickReal(h, "#citation-copy"));
    await h.sleep(300); // a second, wrongly registered path would have written by now
    const writes = await h.evaluate("window.__writes.slice()");
    h.verdict(T, "fallback click: the clipboard holds the displayed line and writeText ran exactly once (one registered path), with that text", [
      ...copiedProblems(h, a, line, "fallback copy"),
      ...h.eqs([["writeText calls", writes.length, 1]]),
      ...(writes[0] === line ? [] : [`writeText argument: ${diffAt(h, writes[0], line)}`]),
    ]);
    h.verdict(T, "fallback click: the status reads Copied", h.eqs([["status text", a.message, "Copied"]]));
  });
}

// ---------- AC6: no clipboard ----------
async function ac6(h) {
  const T = "08-ac6";
  await withPage(h, [RECORDER, `Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });`], {}, async () => {
    await show(h, CSRD);
    await h.evaluate(`window.__status = document.getElementById("citation-status")`);
    const before = await h.evaluate(`({ clipboard: typeof navigator.clipboard, role: window.__status.getAttribute("role"), text: window.__status.textContent })`);
    const r = await copyAndRead(h, () => clickReal(h, "#citation-copy"));
    await h.sleep(Math.max(0, 3000 - (Date.now() - r.t0)));
    const after = await h.evaluate(`(() => {
      const s = document.getElementById("citation-status"), b = document.getElementById("citation-copy"), l = document.getElementById("citation-line");
      getSelection().selectAllChildren(l);
      const st = getComputedStyle(l);
      return { same: s === window.__status, connected: window.__status.isConnected, text: s.textContent, disabled: b.disabled, selected: getSelection().toString(), lineText: l.textContent, userSelect: st.userSelect ?? st.webkitUserSelect };
    })()`);
    h.verdict(T, `navigator.clipboard is ${before.clipboard}; a real click shows "Copy failed" in the same role=status element that existed before the click (so it is announced), the button stays enabled, and nothing reached the pasteboard (pbpaste still shows the sentinel)`, [
      ...h.eqs([["typeof navigator.clipboard", before.clipboard, "undefined"], ["status role before the click", before.role, "status"], ["status text before the click", before.text, ""], ["status text after the click", r.message, "Copy failed"], ["same status element after the click", after.same && after.connected, true], ["button disabled", after.disabled, false]]),
      ...(r.pasted === SENTINEL ? [] : [`the pasteboard changed: ${h.fmt(r.pasted)}`]),
    ]);
    h.verdict(T, "Copy failed is empty (exactly) 3000 ms after it appeared", h.eqs([["status text", after.text, ""]]));
    h.verdict(T, "selecting the line selects all its text: getSelection().toString() equals the line, and user-select is not none", [
      ...(after.selected === after.lineText ? [] : [`selection ${diffAt(h, after.selected, after.lineText)}`]),
      ...(after.userSelect === "none" ? ["user-select is none"] : []),
    ]);
  });
}

// ---------- AC7: the longest address at 320 px ----------
async function ac7(h, E) {
  const T = "08-ac7";
  const c = E.cases.find((x) => x.label === "longest");
  const url = c.line.slice(c.line.lastIndexOf("; ") + 2);
  await atWidth(h, 320, async () => {
    await show(h, c);
    const f = await h.evaluate(FIT);
    const page = await h.evaluate(`(() => { const e = GEL.byId[${JSON.stringify(c.id)}], i = GEL.coveringInterval(e, ${JSON.stringify(c.date)}); return e.versions.find((v) => v.commit === i.commit).source_url.length; })()`);
    h.verdict(T, `the longest address (${c.id}, ${url.length} characters by recount) is in the line at a 320 px window`, [
      ...h.eqs([["innerWidth", f.innerWidth, 320], ["address length in the probe line", url.length, E.longest.source_url_length], ["address length in the page row", page, 257]]),
      ...(f.lineText.includes(url) ? [] : ["the line does not hold the whole address"]),
    ]);
    h.verdict(T, `at 320 px no sideways scroll (document ${f.doc[0]}/${f.doc[1]}, line ${f.line[0]}/${f.line[1]}, actions ${f.actions[0]}/${f.actions[1]}) and the button's right edge is ${Math.round(f.buttonRight)} (at most 320)`, [
      ...fitProblems(f),
      ...(f.buttonRight <= 320 ? [] : [`the button's right edge is ${f.buttonRight}`]),
    ]);
  });
}

// ---------- AC8: the keyboard ----------
async function ac8(h) {
  const T = "08-ac8";
  await withPage(h, [RECORDER], { grant: true }, async () => {
    await h.evaluate(WRAP);
    await show(h, CSRD);
    const line = await h.evaluate(`document.getElementById("citation-line").textContent`);
    await h.evaluate(`document.querySelector('[data-field="link"]').focus()`);
    const order = await h.evaluate(`!!(document.querySelector('[data-field="link"]').compareDocumentPosition(document.getElementById("citation-copy")) & Node.DOCUMENT_POSITION_FOLLOWING)`);
    const stops = [];
    for (let i = 0; i < 4; i++) {
      await h.press("Tab");
      const s = await h.evaluate(`(() => { const a = document.activeElement; return { id: a.id, tag: a.tagName, inSlot: !!a.closest("#slot-after-link") }; })()`);
      stops.push(s);
      if (s.id === "citation-copy") break;
    }
    const reached = stops[stops.length - 1]?.id === "citation-copy";
    h.verdict(T, `Tab from the answer link reaches #citation-copy within 4 presses (stops: ${stops.map((s) => s.id || s.tag).join(" > ")}); the link comes before it in the document; every stop on the way is inside #slot-after-link`, [
      ...(reached ? [] : [`not reached: ${h.fmt(stops)}`]),
      ...(order ? [] : ["the answer link does not precede the button in document order"]),
      ...stops.slice(0, -1).filter((s) => !s.inSlot).map((s) => `a stop outside #slot-after-link: ${h.fmt(s)}`),
    ]);
    const ring = await h.evaluate(`(() => {
      const b = document.getElementById("citation-copy"), s = getComputedStyle(b);
      return { focused: document.activeElement === b, focusVisible: b.matches(":focus-visible"), width: s.outlineWidth, offset: s.outlineOffset, style: s.outlineStyle, color: s.outlineColor };
    })()`);
    h.verdict(T, `the focused button shows the ring: :focus-visible, 2px outline, offset 2px, colour ${RING}`, [
      ...h.eqs([["button focused", ring.focused, true], [":focus-visible", ring.focusVisible, true], ["outline-width", ring.width, "2px"], ["outline-offset", ring.offset, "2px"], ["outline-color", ring.color, RING]]),
      ...(ring.style === "none" ? ["outline-style is none"] : []),
    ]);

    const enter = await copyAndRead(h, () => h.press("Enter"));
    h.verdict(T, "Enter on the focused button copies: one writeText, the clipboard holds the line", [
      ...h.eqs([["writeText calls", enter.writes.length, 1], ["status", enter.message.trim(), "Copied"]]),
      ...copiedProblems(h, enter, line, "Enter"),
    ]);
    const space = await copyAndRead(h, () => pressSpace(h));
    h.verdict(T, "Space on the focused button copies: one more writeText (two in all), the clipboard holds the line", [
      ...h.eqs([["writeText calls in all", space.writes.length, 2], ["status", space.message.trim(), "Copied"]]),
      ...copiedProblems(h, space, line, "Space"),
    ]);
  });
  console.log("  note: Lighthouse: not run, by hand later; VoiceOver two copies in a row: not run, by hand later");
}

// ---------- AC9: 390 px ----------
async function ac9(h, E) {
  const T = "08-ac9";
  const c = E.cases.find((x) => x.label === "longest");
  await atWidth(h, 390, async () => {
    await show(h, CSRD);
    const f = await h.evaluate(FIT);
    h.verdict(T, `at 390 px the button is ${f.buttonHeight}px tall (at least 44) and the CSRD line and button fit: document ${f.doc[0]}/${f.doc[1]}, line ${f.line[0]}/${f.line[1]}, actions ${f.actions[0]}/${f.actions[1]}`, [
      ...(f.buttonHeight >= 43.99 ? [] : [`button height ${f.buttonHeight}`]),
      ...h.eqs([["innerWidth", f.innerWidth, 390]]),
      ...fitProblems(f),
    ]);
    await show(h, c);
    const g = await h.evaluate(FIT);
    h.verdict(T, `at 390 px the longest address answer also fits: document ${g.doc[0]}/${g.doc[1]}, line ${g.line[0]}/${g.line[1]}, actions ${g.actions[0]}/${g.actions[1]}, button ${g.buttonHeight}px tall`, [
      ...(g.buttonHeight >= 43.99 ? [] : [`button height ${g.buttonHeight}`]),
      ...fitProblems(g),
    ]);
  });
}

export async function run(h) {
  const file = path.join(path.dirname(h.expected), "cite-expected.json");
  if (!fs.existsSync(file)) {
    h.check("08", "cite-expected.json is next to expected.json", false, `missing ${file}; build it with: python3.13 tests/web/cite_expected.py --ref origin/history --read-on 2026-11-17 --out ${file} (about 2.5 minutes)`);
    return;
  }
  const E = JSON.parse(fs.readFileSync(file, "utf8"));
  try {
    await section(h, "08-ac1", () => ac1(h, E));
    await section(h, "08-ac2", () => ac2(h, E));
    await section(h, "08-ac3", () => ac3(h, E));
    await section(h, "08-ac4", () => ac4(h, E));
    await section(h, "08-ac5", () => ac5(h));
    await section(h, "08-ac6", () => ac6(h));
    await section(h, "08-ac7", () => ac7(h, E));
    await section(h, "08-ac8", () => ac8(h));
    await section(h, "08-ac9", () => ac9(h, E));
  } finally {
    await h.open("ok").catch(() => {});
  }
}
