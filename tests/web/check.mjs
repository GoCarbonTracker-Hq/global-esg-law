#!/usr/bin/env node
// Browser check for STORY-GEL-34-04 (the lookup page). It serves web/, maps /law-data.json to one
// variant per run, drives headless Chrome over the DevTools protocol, and compares the DOM with
// expected.json (written by expected.py from tools/query.py, never from the data file).
//   node tests/web/check.mjs --data PATH --expected PATH [--port 8404] [--cdp 9404]
//        [--profile ~/.cache/gel34-chrome/story-04] [--chrome PATH] [--workdir PATH]
// Data variants served at /law-data.json: ok, missing, cut, no-read-on, slow, fixture, changed.
// The 12 criteria are numbered in the story's bullet order. Prints PASS/FAIL per check, then
// "check.mjs: N passed, M failed"; exit 1 when M > 0. Lighthouse is printed as NOT RUN.
// Every tests/web/checks/*.mjs (sorted by name) is imported after the 12 criteria and its exported
// run(h) awaited. h is the harness: the flags (data, expected, port, cdp, profile, chrome, workdir),
// the helpers below, and addVariant(name, object or bytes) to serve more data files. Its checks count.
import http from "node:http";
import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const webDir = path.join(repoRoot, "web");

// ---------- command line ----------
const args = {
  port: 8404,
  cdp: 9404,
  profile: path.join(os.homedir(), ".cache/gel34-chrome/story-04"),
  chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
};
const FLAGS = ["data", "expected", "port", "cdp", "profile", "chrome", "workdir"];
for (let i = 2; i < process.argv.length; i += 2) {
  const k = (process.argv[i] || "").replace(/^--/, "");
  if (!process.argv[i].startsWith("--") || !FLAGS.includes(k) || process.argv[i + 1] === undefined) usage();
  args[k] = process.argv[i + 1];
}
if (!args.data || !args.expected) usage();
args.port = Number(args.port);
args.cdp = Number(args.cdp);
args.workdir ??= path.join(args.profile, "work");
function usage() {
  console.error("usage: node tests/web/check.mjs --data PATH --expected PATH [--port 8404] [--cdp 9404] [--profile DIR] [--chrome PATH] [--workdir DIR]");
  process.exit(2);
}

// ---------- texts the page prints (the Contract in GEL-34-REPORT-04.md) ----------
const T = {
  interim: "This build answers only the plain in-force case. For this date use the command line (see the README).",
  loadFail: "The law list did not load. Reload the page, or use the commands in the README.",
  loading: "Loading the law list",
  hint: "Enter a date in the form 2025-06-01.",
  noscript: "This page needs JavaScript to look up laws. The same lookup runs on the command line; see the README.",
  consolidated: "Consolidated version: the publisher's text with later amendments merged in.",
  linkText: "Official text (opens in a new tab)",
  repo: "https://github.com/GoCarbonTracker-Hq/global-esg-law",
};

const E = JSON.parse(fs.readFileSync(args.expected, "utf8"));
const dataBytes = fs.readFileSync(args.data);
const dataObj = JSON.parse(dataBytes);
fs.mkdirSync(args.workdir, { recursive: true });
const logFile = path.join(args.workdir, "server.log");
fs.writeFileSync(logFile, "");

// ---------- the data file variants the server can send ----------
const FIX_COMMIT = "abcdef0123456789abcdef0123456789abcdef01";
const fixtureObj = structuredClone(dataObj);
{
  const entry = structuredClone(fixtureObj.entries.find((e) => e.id === "eu-csrd-2022-2464") ?? fixtureObj.entries[0]);
  delete entry.aliases;
  delete entry.amends_ids;
  Object.assign(entry, {
    id: "fixture-archive-copy",
    place: "EU",
    title: "Fixture: a law whose only stored copy is an archive copy",
    intervals: [{ from: "2000-01-01", state: "in_force", commit: FIX_COMMIT }],
    versions: [{
      in_force: "2000-01-01", kind: "consolidated", language: "en",
      source_url: "https://web.archive.org/web/2020/https://example.org/", commit: FIX_COMMIT, copy: "archive",
    }],
  });
  fixtureObj.entries.push(entry);
  fs.writeFileSync(path.join(args.workdir, "fixture-law-data.json"), JSON.stringify(fixtureObj));
}
const noReadOn = structuredClone(dataObj);
delete noReadOn.snapshot.read_on;
const changed = structuredClone(dataObj); // the three printed values differ from the real ones, so typed-in text cannot pass
Object.assign(changed.snapshot, { history_commit: "123456789abcdef0123456789abcdef012345678", read_on: "2031-02-03" });
changed.notice = "Notice changed by check.mjs.";
changed.coverage = { ...changed.coverage, status: "changed by check.mjs" };
const VARIANTS = {
  ok: { body: dataBytes },
  missing: { status: 404, body: "not found" },
  cut: { body: dataBytes.subarray(0, dataBytes.length >> 1) },
  "no-read-on": { body: JSON.stringify(noReadOn) },
  slow: { body: dataBytes, delay: 2000 },
  fixture: { body: JSON.stringify(fixtureObj) },
  changed: { body: JSON.stringify(changed) },
};
let variant = "ok";
function addVariant(name, body) { // for the checks in tests/web/checks: never replaces a variant
  if (Object.hasOwn(VARIANTS, name)) throw new Error(`data variant ${fmt(name)} already exists`);
  VARIANTS[name] = { body: typeof body === "string" || ArrayBuffer.isView(body) ? body : JSON.stringify(body) };
}

// ---------- server ----------
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};
const requests = []; // {t, method, path}, the proof that nothing is requested at lookup time
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const rec = { t: Date.now(), method: req.method, path: url.pathname };
  requests.push(rec);
  fs.appendFileSync(logFile, JSON.stringify(rec) + "\n");
  // no-store, so the log sees every request and the offline run cannot be served from cache
  const send = (status, type, body) => { res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" }); res.end(body); };
  if (url.pathname === "/law-data.json") {
    const v = VARIANTS[variant];
    return void setTimeout(() => send(v.status ?? 200, "application/json", v.body), v.delay ?? 0);
  }
  const file = path.join(webDir, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
  if (!file.startsWith(webDir + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(404, "text/plain", "not found");
  send(200, TYPES[path.extname(file)] ?? "application/octet-stream", fs.readFileSync(file));
});

async function freePort(start, listenOn) {
  for (let p = start; p < start + 30; p++) {
    const s = listenOn ?? net.createServer();
    try {
      await new Promise((ok, bad) => { s.once("error", bad); s.listen(p, "127.0.0.1", ok); });
      if (!listenOn) s.close();
      if (p !== start) console.log(`note: port ${start} busy, using ${p}`);
      return p;
    } catch (e) {
      if (e.code !== "EADDRINUSE") throw e;
    }
  }
  throw new Error(`no free port from ${start}`);
}

// ---------- Chrome and the DevTools protocol ----------
let chrome, ws, nextId = 0, base;
const pending = new Map();
const waiters = [];
const pageErrors = new Set();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function until(fn, ms, what) {
  const end = Date.now() + ms;
  for (;;) {
    try { const v = await fn(); if (v) return v; } catch (e) { if (e.fatal) throw e; }
    if (Date.now() > end) throw new Error(`timed out after ${ms} ms waiting for ${what}`);
    await sleep(25);
  }
}

async function startChrome() {
  fs.mkdirSync(args.profile, { recursive: true });
  chrome = spawn(args.chrome, [
    "--headless=new", `--remote-debugging-port=${args.cdp}`, `--user-data-dir=${args.profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-extensions", "about:blank",
  ], { stdio: "ignore", detached: true });
  let died = null;
  chrome.on("exit", (code, sig) => { died = `exit ${code ?? sig}`; });
  const jsonUrl = (p) => `http://127.0.0.1:${args.cdp}/json/${p}`;
  const guard = () => { if (died) throw Object.assign(new Error("Chrome exited early (" + died + "); is another Chrome using the profile?"), { fatal: true }); };
  await until(async () => { guard(); return (await fetch(jsonUrl("version"))).ok; }, 20000, "Chrome debugging port");
  const target = await until(async () => { guard(); return (await (await fetch(jsonUrl("list"))).json()).find((t) => t.type === "page"); }, 10000, "a page target");
  ws = new WebSocket(target.webSocketDebuggerUrl);
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      return m.error ? p.reject(new Error(`${p.method}: ${m.error.message}`)) : p.resolve(m.result);
    }
    if (m.method === "Runtime.exceptionThrown") {
      const d = m.params.exceptionDetails;
      pageErrors.add(d.exception?.description ?? d.text);
    }
    for (const w of waiters.filter((w) => w.method === m.method)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(m.params); }
  };
  ws.onclose = () => { for (const p of pending.values()) p.reject(new Error("DevTools connection closed")); pending.clear(); };
  await new Promise((ok, bad) => { ws.onopen = ok; ws.onerror = () => bad(new Error("DevTools WebSocket failed")); });
  for (const d of ["Page", "Runtime", "Network"]) await send(`${d}.enable`);
  await send("Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => {}); // so Tab and Enter reach the page
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `(${installHelpers})()` });
}

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject, method });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
function once(method, ms = 15000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => { waiters.splice(waiters.indexOf(w), 1); reject(new Error(`timed out waiting for ${method}`)); }, ms);
    const w = { method, resolve: (p) => { clearTimeout(t); resolve(p); } };
    waiters.push(w);
  });
}
async function evaluate(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error("page: " + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text));
  return r.result.value;
}
async function navigate(url) {
  const loaded = once("Page.loadEventFired");
  const r = await send("Page.navigate", { url });
  if (r.errorText) throw new Error("navigate: " + r.errorText);
  await loaded;
}
const waitFor = (expr, ms = 5000) => until(() => evaluate(expr), ms, expr.length > 90 ? expr.slice(0, 90) + "..." : expr);

const KEYS = {
  Tab: { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 },
  Enter: { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" },
};
async function press(name) {
  await send("Input.dispatchKeyEvent", KEYS[name]);
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: KEYS[name].key, code: KEYS[name].code, windowsVirtualKeyCode: KEYS[name].windowsVirtualKeyCode });
}

const READY = `!!(window.GEL && GEL.data && !document.getElementById("example").disabled && !document.getElementById("date").disabled)`;
let navFrom = 0; // index in `requests` of the first request of the latest navigation
async function open(v, { ready = true } = {}) {
  if (!Object.hasOwn(VARIANTS, v)) throw new Error(`unknown data variant ${fmt(v)}`);
  variant = v;
  navFrom = requests.length;
  await navigate(base + "/");
  if (ready) await waitFor(READY, 10000);
}
const clickExample = async () => {
  await evaluate(`document.getElementById("example").click()`);
  await waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain"`);
};
const panel = () => evaluate("__chk.panel()");
const resetEmulation = async () => {
  await send("Emulation.setTimezoneOverride", { timezoneId: "" });
  await send("Emulation.clearDeviceMetricsOverride");
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  await send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
};

// ---------- page-side helpers (stringified into every new document: nothing from this module is visible there) ----------
function installHelpers() {
  const $ = (s) => document.querySelector(s);
  const norm = (s) => (s == null ? null : s.replace(/\s+/g, " ").replace(/’/g, "'").trim());
  const vis = (el) => !!el && el.checkVisibility();
  const field = (n) => $('#answer-panel [data-field="' + n + '"]');
  const text = (n) => norm(field(n) && field(n).textContent);
  window.__chk = {
    panel() {
      const p = $("#answer-panel"), k = field("kind"), l = field("link");
      const lang = /^Language: (\S+)$/.exec(text("language") || "");
      return {
        shown: vis(p), state: p.getAttribute("data-state"), id: p.getAttribute("data-id"), date: p.getAttribute("data-date"),
        commit: p.getAttribute("data-commit"), hasCommit: p.hasAttribute("data-commit"),
        status: text("status"), title: text("title"), since: text("since"), kind: text("kind"), kindAttr: k && k.getAttribute("data-kind"),
        language: text("language"), lang: lang && lang[1], codes: text("codes"), asked: text("asked"), read: text("read"),
        snapshot: text("snapshot"), notice: text("notice"),
        link: l && { text: norm(l.textContent), href: l.getAttribute("href"), target: l.getAttribute("target"), rel: l.getAttribute("rel") },
        show: { status: vis(field("status")), since: vis(field("since")), link: vis(l), notice: vis(field("notice")), plain: vis($("#answer-plain")), interim: vis($("#answer-interim")) },
        interim: norm($("#answer-interim") && $("#answer-interim").textContent),
        text: vis(p) ? norm(p.innerText) : null,
        coreText: vis(p) ? norm((() => { const c = p.cloneNode(true); c.querySelectorAll("#slot-after-link, #slot-after-interim").forEach((el) => el.remove()); return c.textContent; })()) : null,
        sentence: norm($("#answer-sentence").textContent),
        law: $("#law").value, dateValue: $("#date").value, echo: norm($("#date-echo").textContent),
      };
    },
    run(rows) {
      return rows.map(({ id, date }) => {
        let err = null;
        try { GEL.showAnswer(id, date); } catch (e) { err = String(e); }
        const p = $("#answer-panel"), k = field("kind"), m = /^Language: (\S+)$/.exec(text("language") || "");
        return { err, state: p.getAttribute("data-state"), commit: p.getAttribute("data-commit"), kind: k && k.getAttribute("data-kind"), lang: m && m[1] };
      });
    },
    sharedPairs() { // pairs counted from the page's own copy of the file
      let n = 0;
      for (const e of GEL.data.entries) {
        const g = {};
        for (const v of e.versions || []) if (v.kind !== "repeal") g[v.in_force] = (g[v.in_force] || 0) + 1;
        for (const k in g) if (g[k] >= 2) n++;
      }
      return n;
    },
    setField(v) { // what a typed date does: set the value, fire input and change
      const d = $("#date");
      d.value = v;
      d.dispatchEvent(new Event("input", { bubbles: true }));
      d.dispatchEvent(new Event("change", { bubbles: true }));
      return d.value;
    },
    blur() { $("#date").dispatchEvent(new Event("blur")); },
    hint() {
      const h = $("#date-hint"), d = $("#date");
      return { text: norm(h.textContent), shown: vis(h) && norm(h.textContent) !== "", invalid: d.getAttribute("aria-invalid"), describedby: d.getAttribute("aria-describedby") };
    },
    loadState() {
      const s = $("#load-status");
      return {
        text: norm(s.textContent), role: s.getAttribute("role"),
        links: [...s.querySelectorAll("a")].map((a) => ({ text: norm(a.textContent), href: a.href })),
        exampleDisabled: $("#example").disabled, dateDisabled: $("#date").disabled,
        panelShown: vis($("#answer-panel")), body: document.body.innerText, hasData: !!(window.GEL && GEL.data),
      };
    },
    ring() {
      const e = $("#example"), c = getComputedStyle(e);
      return { focused: document.activeElement === e, focusVisible: e.matches(":focus-visible"), style: c.outlineStyle, width: c.outlineWidth, offset: c.outlineOffset, color: c.outlineColor };
    },
    sentenceBox() {
      const s = $("#answer-sentence"), r = s.getBoundingClientRect(), c = getComputedStyle(s);
      return { role: s.getAttribute("role"), display: c.display, visibility: c.visibility, ariaHidden: s.closest("[aria-hidden='true']") !== null, w: r.width, h: r.height };
    },
    layout() {
      const rect = {};
      for (const id of ["title", "law", "date", "date-echo", "example", "answer", "rail", "browse-by-place"]) {
        const e = document.getElementById(id), r = e && e.getBoundingClientRect();
        rect[id] = r && { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
      }
      let bar = document.getElementById("law");
      while (bar && bar.parentElement && bar.parentElement.tagName !== "HEADER") bar = bar.parentElement;
      const br = bar && bar.getBoundingClientRect();
      rect.bar = br && { top: br.top, bottom: br.bottom, left: br.left, right: br.right, width: br.width, height: br.height };
      const prose = [...document.querySelectorAll("p")].filter((p) => !p.closest("noscript") && !["load-status", "date-echo", "date-hint", "answer-sentence"].includes(p.id) && vis(p) && p.textContent.trim().length > 20).map((p) => {
        const s = document.createElement("span");
        s.style.cssText = "display:inline-block;width:70ch;visibility:hidden;position:absolute";
        p.appendChild(s);
        const cap = s.getBoundingClientRect().width;
        s.remove();
        const c = getComputedStyle(p);
        return { text: p.textContent.trim().slice(0, 30), width: p.clientWidth - parseFloat(c.paddingLeft) - parseFloat(c.paddingRight), cap };
      });
      const fixed = [...document.querySelectorAll("*")].filter((e) => ["sticky", "fixed"].includes(getComputedStyle(e).position)).map((e) => e.tagName + (e.id ? "#" + e.id : ""));
      const dark = [];
      const walk = (rules) => {
        for (const r of rules) {
          if (r.media && /prefers-color-scheme/.test(r.media.mediaText)) dark.push("@media " + r.media.mediaText);
          if (r.style && /dark/.test(r.style.getPropertyValue("color-scheme"))) dark.push(r.cssText.slice(0, 80));
          if (r.cssRules) walk(r.cssRules);
        }
      };
      for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch (e) { dark.push("unreadable " + sheet.href); } }
      const meta = $('meta[name="color-scheme"]');
      if (meta && /dark/.test(meta.content)) dark.push("meta color-scheme " + meta.content);
      const a = document.querySelector("a[href]:not(#browse-by-place a)"), ae = document.activeElement; // Varun 2026-11-19, STORY-GEL-34-14: the place links of Browse by place are not a skip link
      return { rect, prose, fixed, dark, firstAnchor: a && a.getAttribute("href"), active: ae === document.body ? "body" : ae.id || ae.tagName, scrollW: document.documentElement.scrollWidth, innerW: innerWidth };
    },
  };
}

// ---------- reporting ----------
let passed = 0, failed = 0;
const fmt = (v) => { const s = JSON.stringify(v) ?? String(v); return s.length > 260 ? s.slice(0, 260) + "..." : s; };
function check(ac, label, ok, observed) {
  const tag = typeof ac === "string" ? ac : ac ? `AC${ac}` : "setup";
  if (ok) { passed++; console.log(`PASS ${tag}: ${label}`); }
  else { failed++; console.log(`FAIL ${tag}: ${label}${observed === undefined ? "" : " | observed: " + (typeof observed === "string" ? observed : fmt(observed))}`); }
}
const verdict = (ac, label, problems) => check(ac, label, problems.length === 0, problems.join("; "));
const eqs = (rows) => rows.filter(([, got, want]) => got !== want).map(([n, got, want]) => `${n}: got ${fmt(got)}, want ${fmt(want)}`);
const sameCommit = (page, want) => typeof page === "string" && page.length === 40 && typeof want === "string" && page.startsWith(want);

// ---------- AC1: the example ----------
async function ac1() {
  await open("ok");
  const html = await (await fetch(base + "/")).text();
  verdict(1, "index.html holds no notice, snapshot id or read date (the page takes them from the file)",
    [E.notice, E.snapshot9, E.read_on, E.history_commit].filter((s) => html.includes(s)).map((s) => `index.html contains ${fmt(s)}`));
  let p = await panel();
  verdict(1, "no answer panel is visible on first load", p.shown ? ["panel is visible"] : []);
  await clickExample();
  p = await panel();
  const x = E.example, since = x.since.startsWith("In force since") ? x.since : `In force since ${x.since}`;
  verdict(1, "example fills the law box, the date field and its echo", [
    ...eqs([["box", p.law, x.title], ["date field", p.dateValue, x.date], ["GEL.chosen", await evaluate("GEL.chosen"), x.id]]),
    ...(p.echo && p.echo.includes(x.date) ? [] : [`echo ${fmt(p.echo)} does not contain ${x.date}`]),
    ...(p.shown ? [] : ["panel not shown"]),
  ]);
  verdict(1, "panel prints status, title, since, kind, language and the stored codes", [
    ...eqs([
      ["state", p.state, "plain"], ["status", p.status, `Version in force on ${x.date}`], ["title", p.title, x.title], ["since", p.since, since],
      ["kind attr", p.kindAttr, x.kind], ["language", p.language, `Language: ${x.language}`],
      ["codes", p.codes, `Law family ${x.law_family} · Verification ${x.verification}`],
    ]),
    ...(x.kind === "consolidated" ? eqs([["kind text", p.kind, T.consolidated]]) : []),
    ...(p.show.interim ? ["interim box visible on a plain answer"] : []),
  ]);
  verdict(1, "official link: text, href is the row's source_url, target _blank, rel noopener", [
    ...eqs([["link text", p.link?.text, T.linkText], ["href", p.link?.href, x.source_url], ["target", p.link?.target, "_blank"]]),
    ...((p.link?.rel || "").split(/\s+/).includes("noopener") ? [] : [`rel ${fmt(p.link?.rel)} lacks noopener`]),
  ]);
  verdict(1, "date asked, corpus read, snapshot line and notice, from the file", eqs([
    ["asked", p.asked, `Date asked ${x.date}`], ["read", p.read, `Corpus read ${E.read_on}`],
    ["snapshot", p.snapshot, E.snapshot_line], ["notice", p.notice, E.notice],
  ]).concat(p.show.notice ? [] : ["notice not visible"]));
  verdict(1, "data-commit is the full 40-character commit of the expected row",
    [...eqs([["data-commit", p.commit, x.commit]]), ...(x.commit.length === 40 ? [] : ["expected commit is not 40 characters"])]);
  await open("changed");
  await clickExample();
  p = await panel();
  verdict(1, "corpus read, snapshot line and notice follow a changed data file (none is typed into the page)", eqs([
    ["read", p.read, "Corpus read 2031-02-03"], ["snapshot", p.snapshot, "Snapshot 123456789, changed by check.mjs"], ["notice", p.notice, "Notice changed by check.mjs."],
  ]));
}

// ---------- AC2: the CSRD dates ----------
async function ac2() {
  await open("ok");
  await clickExample();
  const problems = [];
  for (const row of E.csrd) {
    const ret = await evaluate(`GEL.setDate(${JSON.stringify(row.date)})`);
    const p = await panel();
    if (ret !== true) problems.push(`${row.date}: GEL.setDate returned ${fmt(ret)}`);
    if (p.date !== row.date) problems.push(`${row.date}: data-date ${fmt(p.date)}`);
    if (row.commit) {
      if (p.state !== "plain" || !sameCommit(p.commit, row.commit)) problems.push(`${row.date}: state ${p.state}, commit ${fmt(p.commit)}, want ${row.commit}`);
    } else if (p.state !== "interim" || p.hasCommit || !p.shown || !p.show.interim || !(p.interim || "").includes("The earliest stored version of this law starts on 2023-01-05")) {
      problems.push(`${row.date}: want interim panel with the V2 sentence, got state ${p.state}, commit ${fmt(p.commit)}, text ${fmt(p.interim)}`);
    }
  }
  verdict(2, `${E.csrd.length} CSRD dates show the expected commit (2022-12-31 shows the interim panel)`, problems);
  // the real field path: one typed date
  await evaluate(`GEL.setDate("2023-01-05")`);
  const want = E.csrd.find((r) => r.date === "2025-06-01")?.commit;
  const kept = await evaluate(`__chk.setField("2025-06-01")`);
  await waitFor(`document.getElementById("answer-panel").getAttribute("data-date") === "2025-06-01"`);
  const p = await panel();
  verdict(2, "a date set on the real field (input event) gives the same commit", [
    ...eqs([["field value", kept, "2025-06-01"]]), ...(sameCommit(p.commit, want) ? [] : [`commit ${fmt(p.commit)}, want ${want}`]),
  ]);
  const fixed = E.csrd_fixed ?? [];
  const bad = fixed.filter((f) => {
    const c = E.csrd.find((r) => r.date === f.date)?.commit ?? null;
    return f.commit_prefix == null ? c !== null : !(c && c.startsWith(f.commit_prefix));
  });
  verdict(2, "expected.json carries the story's fixed list (compared with query.lookup by expected.py) and it agrees with the dates driven",
    [...(fixed.length ? [] : ["csrd_fixed is missing or empty"]), ...bad.map((f) => `fixed ${f.date} ${f.commit_prefix} disagrees with csrd`)]);
}

// ---------- AC3 and AC8 share this: every shared-date pair through GEL.showAnswer, one evaluate ----------
async function runPairs() {
  const out = await evaluate(`__chk.run(${JSON.stringify(E.pairs.map(({ id, date }) => ({ id, date })))})`);
  let plain = 0, interim = 0;
  const diffs = [];
  E.pairs.forEach((r, i) => {
    const o = out[i];
    r.plain ? plain++ : interim++;
    let bad = null;
    if (o.err) bad = "threw " + o.err;
    else if (r.plain) {
      if (o.state !== "plain") bad = `state ${o.state}`;
      else if (!sameCommit(o.commit, r.commit)) bad = `commit ${o.commit}, want ${r.commit}`;
      else if (o.kind !== r.kind) bad = `kind ${o.kind}, want ${r.kind}`;
      else if (o.lang !== r.language) bad = `language ${o.lang}, want ${r.language}`;
    } else if (o.state !== "plain" || !o.commit) bad = `story 06: every pair is an in-force panel with a commit, got ${o.state} ${o.commit}`;
    if (bad) diffs.push(`${r.id} ${r.date}: ${bad}`);
  });
  return { pairs: E.pairs.length, plain, interim, differ: diffs.length, diffs };
}
const pairsLine = (r) => `pairs=${r.pairs} plain=${r.plain} interim=${r.interim} differ=${r.differ}`;

async function ac3() {
  await open("ok");
  const r = await runPairs();
  const fromFile = await evaluate("__chk.sharedPairs()");
  const c = E.pair_counts;
  verdict(3, pairsLine(r), [
    ...(r.pairs === 0 ? ["pairs=0"] : []),
    ...(r.differ ? [`${r.differ} rows differ, first: ${r.diffs.slice(0, 5).join(" | ")}`] : []),
    ...(fromFile !== c.pairs ? [`page's own versions give ${fromFile} shared-date pairs, expected.pair_counts.pairs is ${c.pairs}`] : []),
    ...(r.pairs !== c.pairs ? [`drove ${r.pairs} rows, expected.pair_counts.pairs is ${c.pairs}`] : []),
    ...(r.plain !== c.plain || r.interim !== c.interim ? [`plain/interim ${r.plain}/${r.interim}, pair_counts ${c.plain}/${c.interim}`] : []),
  ]);
}

// ---------- AC4: interim cases ----------
async function interimProblems(id, date, want) {
  // a plain answer first, so anything an interim answer fails to clear (data-commit, link, since) shows
  await evaluate(`GEL.showAnswer(${JSON.stringify(E.example.id)}, ${JSON.stringify(E.example.date)})`);
  await evaluate(`GEL.showAnswer(${JSON.stringify(id)}, ${JSON.stringify(date)})`);
  const p = await panel();
  return [
    ...eqs([["state", p.state, "interim"], ["notice", p.notice, E.notice]]),
    ...(p.shown ? [] : ["panel not shown"]),
    ...((p.interim || "").includes(want) && p.show.interim ? [] : [`interim sentence not shown: ${fmt(p.interim)}`]),
    ...(p.show.notice ? [] : ["notice not visible"]),
    ...(p.show.since ? ["In force since is visible"] : []),
    ...(p.show.link ? ["a link is visible"] : []),
    ...(p.hasCommit ? [`data-commit present: ${p.commit}`] : []),
    ...(/in force since/i.test(p.coreText || "") ? ["panel text says in force since"] : []),
    ...(/\bno law\b/i.test(p.text || "") || /\bno law\b/i.test(p.sentence || "") ? ['text says "no law"'] : []),
    ...((p.sentence || "").toLowerCase().includes(want.toLowerCase()) ? [] : [`hidden sentence lacks the interim sentence: ${fmt(p.sentence)}`]),
  ];
}
async function ac4() {
  await open("ok");
  const V = { "before first version": "The earliest stored version of this law starts on 2023-01-05", repealed: "replaced 2023-05-05 by", "link only": "The corpus stores no text of this law, only a link to it" };
  for (const c of E.interim_cases) {
    if (V[c.label]) verdict(4, `${c.label} (${c.id} on ${c.date}) shows the interim panel`, await interimProblems(c.id, c.date, V[c.label]));
    else {
      await evaluate(`GEL.showAnswer(${JSON.stringify(c.id)}, ${JSON.stringify(c.date)})`);
      const q = await panel();
      verdict(4, `${c.label} (${c.id} on ${c.date}) is an in-force panel with the application line (story 06)`, [...eqs([["state", q.state, "plain"]]), ...((q.text || "").includes("Duties start to apply on 2024-01-01.") ? [] : [`no application line: ${fmt(q.text)}`])]);
    }
  }
  await open("fixture");
  await evaluate(`GEL.showAnswer("fixture-archive-copy", "2026-01-01")`);
  const fq = await panel();
  verdict(4, 'fixture row with copy "archive" (fixture-archive-copy on 2026-01-01) is an in-force panel with the archive label (story 06)', [...eqs([["state", fq.state, "plain"], ["link", fq.link && fq.link.text, "Archive copy, not the official text (opens in a new tab)"]])]);
}

// ---------- AC5: load failure and slow load ----------
async function ac5() {
  for (const v of ["missing", "cut", "no-read-on"]) {
    await open(v, { ready: false });
    const arrived = await waitFor(`document.getElementById("load-status").textContent.trim().startsWith(${JSON.stringify(T.loadFail)})`, 8000).catch(() => false);
    const s = await evaluate("__chk.loadState()");
    const readme = s.links.find((l) => l.href.replace(/\/$/, "") === T.repo);
    verdict(5, `${v}: failure sentence, Reload and README links, disabled controls, no panel, notice or "Corpus read"`, [
      ...(arrived ? [] : [`status never started with the failure sentence: ${fmt(s.text)}`]),
      ...(s.role === "status" ? [] : [`#load-status role ${fmt(s.role)}`]),
      ...(s.links.some((l) => l.text === "Reload") ? [] : [`no Reload link: ${fmt(s.links)}`]),
      ...(readme ? [] : [`no link to ${T.repo}: ${fmt(s.links)}`]),
      ...(s.exampleDisabled && s.dateDisabled ? [] : [`example disabled ${s.exampleDisabled}, date disabled ${s.dateDisabled}`]),
      ...(s.panelShown ? ["answer panel visible"] : []),
      ...(/Corpus read/.test(s.body) ? ['page text has "Corpus read"'] : []),
      ...(s.body.includes(E.notice) ? ["page text has the notice"] : []),
      ...(/undefined|Invalid Date|\bNaN\b/.test(s.body) ? [`page text has a broken value: ${fmt(s.body.match(/.{0,20}(undefined|Invalid Date|\bNaN\b).{0,20}/)?.[0])}`] : []),
    ]);
  }
  // slow: the file arrives after 2 seconds
  variant = "slow";
  navFrom = requests.length;
  const t0 = performance.now();
  await navigate(base + "/");
  const early = await evaluate("__chk.loadState()");
  const tEarly = performance.now() - t0;
  await sleep(Math.max(0, 1000 - (performance.now() - t0)));
  const mid = await evaluate("__chk.loadState()");
  const tMid = performance.now() - t0;
  const arrived = await waitFor(READY, 8000).then(() => true, () => false);
  const late = await evaluate("__chk.loadState()");
  verdict(5, `slow: "${T.loading}" at ${Math.round(tEarly)} ms (limit 500)`,
    [...(early.text.startsWith(T.loading) ? [] : [`status ${fmt(early.text)}`]), ...(tEarly < 500 ? [] : [`read at ${Math.round(tEarly)} ms`]), ...(early.role === "status" ? [] : [`role ${fmt(early.role)}`])]);
  verdict(5, `slow: still loading at ${Math.round(tMid)} ms, controls disabled, no data`,
    [...(mid.text.startsWith(T.loading) ? [] : [`status ${fmt(mid.text)}`]), ...(mid.exampleDisabled && mid.dateDisabled && !mid.hasData ? [] : [`controls/data: ${fmt({ ex: mid.exampleDisabled, date: mid.dateDisabled, data: mid.hasData })}`])]);
  verdict(5, "slow: after the file arrives the status is empty and the controls are enabled",
    [...(arrived ? [] : ["never became ready"]), ...(late.text === "" ? [] : [`status ${fmt(late.text)}`]), ...(late.exampleDisabled || late.dateDisabled ? ["controls still disabled"] : [])]);
}

// ---------- AC6: date values ----------
async function ac6() {
  await open("ok");
  await clickExample();
  const attrs = await evaluate(`(() => { const d = document.getElementById("date"); return {type: d.type, min: d.min, max: d.max, label: !!document.querySelector('label[for="date"]')}; })()`);
  verdict(6, "date field is a native date input with min, max and a label",
    eqs([["type", attrs.type, "date"], ["min", attrs.min, "1000-01-01"], ["max", attrs.max, "9999-12-31"], ["label", attrs.label, true]]));
  const start = async () => { // a known earlier answer, with the hint state cleared
    await evaluate(`GEL.setDate("2023-01-05")`);
    await evaluate("__chk.blur()");
    return panel();
  };
  const csrd = (d) => E.csrd.find((r) => r.date === d)?.commit;
  let before = await start();
  const kept = await evaluate(`__chk.setField("2025-06-01")`);
  let p = await panel();
  const ret = await evaluate(`GEL.setDate("2025-06-01")`);
  verdict(6, '"2025-06-01" is accepted: GEL.setDate true, field and echo follow, the answer moves to the 2025-04-17 version', [
    ...eqs([["GEL.setDate", ret, true], ["field value", kept, "2025-06-01"], ["data-date", p.date, "2025-06-01"]]),
    ...(sameCommit(p.commit, csrd("2025-06-01")) ? [] : [`commit ${fmt(p.commit)}, want ${csrd("2025-06-01")}`]),
    ...(p.echo.includes("2025-06-01") ? [] : [`echo ${fmt(p.echo)}`]),
    ...(before.commit === p.commit ? ["the previous answer was already the same commit, so the move proves nothing"] : []),
  ]);
  const refused = [
    { v: "10000-01-01", field: true }, { v: "275760-09-13", field: true },
    { v: "2025-6-1" }, { v: "2025-06-01 " }, { v: "" },
  ];
  for (const { v, field } of refused) {
    before = await start();
    const problems = [];
    if (field) { // Chrome keeps these in .value; fire the events a typed date fires
      const held = await evaluate(`__chk.setField(${JSON.stringify(v)})`);
      if (held !== v) problems.push(`the date field kept ${fmt(held)}, not ${fmt(v)}, so the field path is not what it was meant to be`);
    }
    const ret = await evaluate(`GEL.setDate(${JSON.stringify(v)})`);
    if (ret !== false) problems.push(`GEL.setDate returned ${fmt(ret)}`);
    let q = await panel();
    let h = await evaluate("__chk.hint()");
    problems.push(...eqs([["data-commit", q.commit, before.commit], ["data-date", q.date, before.date], ["echo", q.echo, before.echo], ["state", q.state, before.state]]));
    if (h.shown) problems.push("hint shown before the field was left");
    if ((h.invalid ?? "false") !== "false") problems.push(`aria-invalid ${fmt(h.invalid)} before blur`);
    await evaluate("__chk.blur()");
    h = await evaluate("__chk.hint()");
    if (!h.shown || h.text !== T.hint) problems.push(`after blur the hint is ${fmt(h.text)}, shown ${h.shown}`);
    if (h.invalid !== "true") problems.push(`aria-invalid ${fmt(h.invalid)} after blur`);
    if (!(h.describedby || "").includes("date-hint")) problems.push(`aria-describedby ${fmt(h.describedby)}`);
    const ok = await evaluate(`GEL.setDate("2025-06-01")`);
    q = await panel();
    h = await evaluate("__chk.hint()");
    if (ok !== true || h.shown || !sameCommit(q.commit, csrd("2025-06-01"))) problems.push(`next accepted date: returned ${fmt(ok)}, hint shown ${h.shown}, commit ${fmt(q.commit)}`);
    await evaluate("__chk.blur()");
    h = await evaluate("__chk.hint()");
    if (h.invalid !== "false") problems.push(`aria-invalid ${fmt(h.invalid)} after the accepted date and blur`);
    verdict(6, `${fmt(v)} is refused${field ? " (typed into the field)" : " (GEL.setDate)"}: answer and echo kept, hint only after blur, cleared by an accepted date`, problems);
  }
  // grep over web/*.js
  const files = fs.readdirSync(webDir).filter((f) => f.endsWith(".js")).sort();
  const rules = { "Date.parse": /\bDate\.parse\b/, Temporal: /\bTemporal\b/, toISOString: /toISOString/, "new Date": /new Date\b/ };
  const hits = Object.fromEntries(Object.keys(rules).map((k) => [k, 0]));
  const lines = [];
  for (const f of files) {
    fs.readFileSync(path.join(webDir, f), "utf8").split("\n").forEach((line, i) => {
      for (const [k, re] of Object.entries(rules)) if (re.test(line)) { hits[k]++; lines.push(`  grep ${k}: web/${f}:${i + 1}: ${line.trim().slice(0, 100)}`); }
    });
  }
  lines.forEach((l) => console.log(l));
  verdict(6, `grep over ${files.length} web/*.js files: Date.parse ${hits["Date.parse"]}, Temporal ${hits.Temporal}, toISOString ${hits.toISOString}, new Date ${hits["new Date"]} (want 0, 0, 0, 1)`, [
    ...(files.length ? [] : ["no web/*.js files"]),
    ...(hits["Date.parse"] || hits.Temporal || hits.toISOString ? ["forbidden call found"] : []),
    ...(hits["new Date"] === 1 ? [] : [`new Date appears ${hits["new Date"]} times`]),
  ]);
}

// ---------- AC7: the default date in two time zones ----------
async function ac7() {
  const seen = {};
  for (const zone of ["Pacific/Kiritimati", "Pacific/Pago_Pago"]) {
    await send("Emulation.setTimezoneOverride", { timezoneId: zone });
    await open("ok");
    const r = await evaluate(`({value: document.getElementById("date").value, sv: new Date().toLocaleDateString("sv-SE"), zone: Intl.DateTimeFormat().resolvedOptions().timeZone})`);
    const node = new Date().toLocaleDateString("sv-SE", { timeZone: zone });
    seen[zone] = r.value;
    verdict(7, `${zone}: default date ${r.value} equals the page's toLocaleDateString("sv-SE") ${r.sv} and Node's ${node}`,
      eqs([["page zone", r.zone, zone], ["default date vs in-page sv-SE", r.value, r.sv], ["default date vs Node sv-SE for the zone", r.value, node]]));
  }
  const utc = new Date().toISOString().slice(0, 10);
  const [kiri, pago] = [seen["Pacific/Kiritimati"], seen["Pacific/Pago_Pago"]];
  console.log(`  note: UTC date now ${utc}, Kiritimati ${kiri}, Pago_Pago ${pago}${kiri === utc ? " (Kiritimati equals UTC at this instant)" : ""}${pago === utc ? " (Pago_Pago equals UTC at this instant)" : ""}`);
  verdict(7, "the two zones give different dates, and at least one differs from UTC (a UTC-based default would fail)",
    [...(kiri !== pago ? [] : [`both ${kiri}`]), ...(kiri !== utc || pago !== utc ? [] : [`both equal UTC ${utc}`])]);
}

// ---------- AC8: offline ----------
async function ac8() {
  await open("ok");
  const html = fs.readFileSync(path.join(webDir, "index.html"), "utf8");
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((m) => new URL(m[1], base + "/").pathname);
  const sheets = [...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+\.css)["']/gi)].map((m) => new URL(m[1], base + "/").pathname);
  const want = ["/", ...sheets, ...scripts, "/law-data.json"].sort();
  const got = requests.slice(navFrom).filter((r) => r.path !== "/favicon.ico").map((r) => (r.path === "/index.html" ? "/" : r.path)).sort();
  console.log(`  load requested: ${got.join(" ")}`);
  verdict(8, "the load requested only index.html, the stylesheet, one request per script and the data file", got.join(" ") === want.join(" ") ? [] : [`want ${want.join(" ")}`]);
  const isOffline = async () => {
    await send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    return evaluate(`fetch("law-data.json").then(() => "online", () => "offline")`);
  };
  const mark = requests.filter((r) => r.path !== "/favicon.ico").length;
  const offlineFetch = await isOffline();
  await clickExample();
  const p = await panel();
  const r = await runPairs();
  verdict(8, "offline: the browser is offline, the example still answers", [...eqs([["fetch while offline", offlineFetch, "offline"], ["data-commit", p.commit, E.example.commit]])]);
  verdict(8, `offline: ${pairsLine(r)}`, [...(r.pairs === 0 ? ["pairs=0"] : []), ...(r.differ ? [`first: ${r.diffs.slice(0, 5).join(" | ")}`] : [])]);
  const gained = requests.filter((q) => q.path !== "/favicon.ico").slice(mark);
  verdict(8, "the server log gained 0 requests at lookup time", gained.length ? [`${gained.length} requests: ${fmt(gained.slice(0, 5))}`] : []);
}

// ---------- AC9: tokens, wcag.py, stylesheet greps ----------
function rootBlocks(css) {
  const blocks = [];
  let rest = css;
  for (let i = rest.indexOf(":root"); i >= 0; i = rest.indexOf(":root")) {
    const brace = rest.indexOf("{", i);
    let depth = 0, j = brace;
    for (; j < rest.length; j++) { if (rest[j] === "{") depth++; else if (rest[j] === "}" && --depth === 0) break; }
    blocks.push(rest.slice(brace, j + 1));
    rest = rest.slice(0, i) + rest.slice(j + 1);
  }
  return { blocks, rest };
}
async function ac9() {
  const w = spawnSync("python3", [path.join(repoRoot, "tests/web/wcag.py")], { cwd: repoRoot, encoding: "utf8", timeout: 60000 });
  const out = ((w.stdout || "") + (w.stderr || "")).trim().split("\n");
  verdict(9, `python3 tests/web/wcag.py exits 0 (${out.pop() || "no output"})`, w.status === 0 ? [] : [`exit ${w.status ?? w.error?.message}: ${[...out, ""].slice(-4).join(" / ")}`]);
  const css = fs.readFileSync(path.join(webDir, "style.css"), "utf8");
  const { blocks, rest } = rootBlocks(css);
  const tokens = ["#14161A", "#5B616B", "#1B4D3E", "#FFFFFF", "#F7F4EC", "#D9D4C5"];
  verdict(9, "each of the six colour tokens exists once, inside the single :root rule", [
    ...(blocks.length === 1 ? [] : [`${blocks.length} :root rules`]),
    ...tokens.map((t) => [t, css.match(new RegExp(t, "gi"))?.length ?? 0, (blocks[0] || "").match(new RegExp(t, "gi"))?.length ?? 0])
      .filter(([, all, inRoot]) => all !== 1 || inRoot !== 1).map(([t, all, inRoot]) => `${t}: ${all} in the file, ${inRoot} in :root`),
  ]);
  const lineHits = (re, text) => text.split("\n").map((l, i) => [i + 1, l]).filter(([, l]) => re.test(l)).map(([n, l]) => `style.css:${n}: ${l.trim().slice(0, 80)}`);
  const colours = lineHits(/#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\(/, rest);
  colours.forEach((l) => console.log("  colour outside :root " + l));
  verdict(9, "no hex, rgb or hsl colour literal outside :root", colours.length ? [`${colours.length} lines`] : []);
  const urls = lineHits(/http/i, css);
  urls.forEach((l) => console.log("  http in stylesheet " + l));
  verdict(9, "no http in the stylesheet", urls.length ? [`${urls.length} lines`] : []);
  const others = fs.readdirSync(webDir).filter((f) => /\.(html|js)$/.test(f) && fs.readFileSync(path.join(webDir, f), "utf8").includes(":root"));
  verdict(9, "style.css is the only file with :root", others.map((f) => `${f} has :root`));
}

// ---------- AC10: region, hidden sentence, noscript, keyboard (Lighthouse is by hand) ----------
async function ac10() {
  await open("ok");
  const meta = await evaluate(`({lang: document.documentElement.getAttribute("lang"), load: document.getElementById("load-status").getAttribute("role"), body: document.body.innerText})`);
  verdict(10, 'html lang="en", #load-status has role="status", the noscript text is not shown with scripts on', [
    ...eqs([["lang", meta.lang, "en"], ["#load-status role", meta.load, "status"]]), ...(meta.body.includes(T.noscript) ? ["noscript text visible with scripts on"] : []),
  ]);
  const first = await evaluate(`document.activeElement === document.body`);
  const trail = [];
  await press("Tab");
  trail.push(await evaluate(`document.activeElement.id || document.activeElement.tagName`));
  for (let n = 1; n < 12 && trail.at(-1) !== "example"; n++) {
    await press("Tab");
    trail.push(await evaluate(`document.activeElement.id || document.activeElement.tagName`));
  }
  verdict(10, `Tab order: nothing focused on load, first Tab on #law, #example reached within 12 presses (${trail.join(" > ")})`, [
    ...(first ? [] : ["something was focused on load"]), ...(trail[0] === "law" ? [] : [`first Tab landed on ${fmt(trail[0])}`]),
    ...(trail.at(-1) === "example" ? [] : ["#example not reached"]),
  ]);
  await press("Enter");
  await waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain"`).catch(() => {});
  const p = await panel(), ring = await evaluate("__chk.ring()"), sb = await evaluate("__chk.sentenceBox()");
  verdict(10, "Enter on the focused example gives the CSRD answer", eqs([["state", p.state, "plain"], ["data-commit", p.commit, E.example.commit]]));
  verdict(10, "focus ring on #example matched :focus-visible: outline 2px, offset 2px, rgb(27, 77, 62)", [
    ...eqs([["focused", ring.focused, true], [":focus-visible", ring.focusVisible, true], ["width", ring.width, "2px"], ["offset", ring.offset, "2px"], ["colour", ring.color, "rgb(27, 77, 62)"]]),
    ...(ring.style === "none" ? ["outline-style none"] : []),
  ]);
  verdict(10, "#answer-sentence is a polite status region with the hidden sentence, in the accessibility tree and out of sight", [
    ...eqs([["role", sb.role, "status"], ["sentence", p.sentence, E.example.sentence]]),
    ...(sb.display === "none" || sb.visibility === "hidden" || sb.ariaHidden ? [`not exposed: ${fmt(sb)}`] : []),
    ...(sb.w * sb.h > 4 ? [`box ${sb.w}x${sb.h}px is not visually hidden`] : []),
  ]);
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await open("ok", { ready: false });
  const ns = await evaluate(`document.body.innerText`);
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  verdict(10, "with scripts off the noscript line shows", ns.includes(T.noscript) ? [] : [`body text ${fmt(ns.slice(0, 200))}`]);
  console.log("NOT RUN AC10 lighthouse: not run, by hand later");
}

// ---------- AC11: calendar dates ----------
async function ac11() {
  await open("ok");
  await clickExample();
  const bad = await evaluate(`${JSON.stringify(E.date_table)}.filter((r) => GEL.dates.isDate(r.value) !== r.valid).map((r) => r.value)`);
  verdict(11, `GEL.dates.isDate agrees with query._valid_date on all ${E.date_table.length} table rows`, [...(E.date_table.length ? [] : ["empty table"]), ...(bad.length ? [`differs on ${fmt(bad)}`] : [])]);
  const story = { refused: ["2025-02-30", "2025-13-45", "2025-04-31", "2100-02-29", "0000-01-01", "2025-6-1", "10000-01-01"], passing: ["2024-02-29", "0001-01-01", "9999-12-31"] };
  const tbl = new Map(E.date_table.map((r) => [r.value, r.valid]));
  verdict(11, "the table holds the ten story dates with the story's verdicts", [
    ...story.refused.filter((v) => tbl.get(v) !== false).map((v) => `${v} is not false in the table`),
    ...story.passing.filter((v) => tbl.get(v) !== true).map((v) => `${v} is not true in the table`),
  ]);
  const before = await panel();
  const problems = [];
  for (const v of story.refused) {
    const ret = await evaluate(`GEL.setDate(${JSON.stringify(v)})`);
    await evaluate("__chk.blur()");
    const q = await panel(), h = await evaluate("__chk.hint()");
    problems.push(...eqs([["GEL.setDate", ret, false], ["data-commit", q.commit, before.commit], ["data-date", q.date, before.date], ["echo", q.echo, before.echo]]).map((s) => `${v}: ${s}`));
    if (!h.shown || h.text !== T.hint) problems.push(`${v}: hint ${fmt(h.text)} shown ${h.shown}`);
    await evaluate(`GEL.setDate(${JSON.stringify(before.date)})`);
  }
  verdict(11, "each of the seven refused dates shows the date message and no new answer", problems);
  const pass = await evaluate(`${JSON.stringify(story.passing)}.map((v) => GEL.dates.isDate(v))`);
  verdict(11, "2024-02-29, 0001-01-01 and 9999-12-31 pass the date check", pass.every(Boolean) ? [] : [fmt(pass)]);
}

// ---------- AC12: layout, tab stop, no skip link, no sticky bar, no dark theme ----------
const ov = (a, b) => a.top < b.bottom && b.top < a.bottom;
async function layoutAt(width) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await open("ok");
  return evaluate("__chk.layout()");
}
const common = (ac, w, L) => {
  const problems = [
    ...(L.fixed.length ? [`sticky or fixed: ${L.fixed.join(" ")}`] : []),
    ...(L.prose.length ? [] : ["no visible paragraph of prose found"]),
    ...L.prose.filter((p) => p.width > p.cap + 1).map((p) => `paragraph ${fmt(p.text)} is ${Math.round(p.width)}px wide, 70ch is ${Math.round(p.cap)}px`),
  ];
  verdict(ac, `${w}px: prose lines within 70ch, no sticky or fixed element`, problems);
};
async function ac12() {
  const missing = (L) => ["title", "law", "date", "date-echo", "example", "answer", "rail", "browse-by-place"].filter((k) => !L.rect[k]);
  // 768: two columns, title and lookup bar share the top bar
  let L = await layoutAt(768), r = L.rect;
  if (missing(L).length) check(12, "768px: layout ids present", false, `missing ${missing(L).join(", ")}`);
  else {
    verdict(12, "768px: title and the lookup bar share the top bar (their boxes overlap vertically)", ov(r.title, r.bar) ? [] : [`title ${fmt(r.title)} lookup bar ${fmt(r.bar)}`]);
    verdict(12, "768px: #rail (15rem = 240px) sits left of #answer", [
      ...(r.rail.right <= r.answer.left + 1 ? [] : [`rail right ${r.rail.right}, answer left ${r.answer.left}`]),
      ...(r.rail.top <= r.answer.bottom + 1 ? [] : [`rail top ${r.rail.top} is below the answer bottom ${r.answer.bottom}`]),
      ...(Math.abs(r.rail.width - 240) <= 1.5 ? [] : [`rail width ${r.rail.width}`]),
    ]);
    const span = Math.max(...Object.values(r).map((b) => b.right)) - Math.min(...Object.values(r).map((b) => b.left));
    verdict(12, "768px: the page is no wider than 62rem (992px)", span <= 992.5 ? [] : [`content spans ${span}px`]);
  }
  common(12, 768, L);
  // 1400: the 62rem cap is only testable on a wide window
  L = await layoutAt(1400); r = L.rect;
  const span = Math.max(...Object.values(r).filter(Boolean).map((b) => b.right)) - Math.min(...Object.values(r).filter(Boolean).map((b) => b.left));
  verdict(12, "1400px: content still spans no more than 62rem (992px), rail still left of the answer",
    [...(span <= 992.5 ? [] : [`content spans ${span}px`]), ...(r.rail && r.answer && r.rail.right <= r.answer.left + 1 ? [] : ["rail not left of answer"])]);
  common(12, 1400, L);
  // 767: one column in source order
  L = await layoutAt(767); r = L.rect;
  if (missing(L).length) check(12, "767px: layout ids present", false, `missing ${missing(L).join(", ")}`);
  else {
    const chain = ["title", "law", "date", "example", "answer", "rail", "browse-by-place"];
    verdict(12, "767px: one column in the order title, law box, date field, example, answer, rail, Browse by place",
      chain.slice(1).filter((k, i) => r[k].top < r[chain[i]].bottom - 1).map((k, i) => `${k} starts at ${r[k].top}, above the bottom of the one before`)
        .concat(r["date-echo"].top < r.date.top - 1 || r["date-echo"].top > r.example.top ? [`echo at ${r["date-echo"].top} is not between date and example`] : [])
        .concat(Math.abs(r.rail.left - r.answer.left) > 2 ? [`rail left ${r.rail.left}, answer left ${r.answer.left}`] : []));
    verdict(12, "767px: the date field is at least 44px tall", r.date.height >= 43.99 ? [] : [`${r.date.height}px`]);
    verdict(12, "767px: no sideways scroll", L.scrollW <= L.innerW ? [] : [`scrollWidth ${L.scrollW} > ${L.innerW}`]);
  }
  common(12, 767, L);
  verdict(12, "no skip link: the first link on the page does not point at an in-page anchor", L.firstAnchor && L.firstAnchor.startsWith("#") ? [`first link ${L.firstAnchor}`] : []);
  verdict(12, "no dark theme: no prefers-color-scheme rule, no dark color-scheme", L.dark.length ? [fmt(L.dark)] : []);
  const loadFocus = L.active;
  await press("Tab");
  const tab1 = await evaluate(`document.activeElement.id || document.activeElement.tagName`);
  verdict(12, "no autofocus on load, and the law box is the first tab stop", eqs([["activeElement on load", loadFocus, "body"], ["activeElement after one Tab", tab1, "law"]]));
}

// ---------- run ----------
const ACS = [ac1, ac2, ac3, ac4, ac5, ac6, ac7, ac8, ac9, ac10, ac11, ac12];
async function cleanup() {
  try { ws?.close(); } catch {}
  if (chrome?.pid && chrome.exitCode === null && chrome.signalCode === null) {
    try { process.kill(-chrome.pid, "SIGTERM"); } catch {}
    await Promise.race([new Promise((ok) => chrome.once("exit", ok)), sleep(3000)]);
    try { process.kill(-chrome.pid, "SIGKILL"); } catch {} // helper processes of the same group
  }
  server.closeAllConnections?.();
  server.close();
}
process.on("SIGINT", async () => { await cleanup(); process.exit(130); });

try {
  args.port = await freePort(args.port, server);
  base = `http://127.0.0.1:${args.port}`;
  args.cdp = await freePort(args.cdp);
  console.log(`check.mjs: server ${base}, Chrome debugging port ${args.cdp}, profile ${args.profile}, workdir ${args.workdir}`);
  if (!fs.existsSync(args.chrome)) throw new Error(`Chrome not found at ${args.chrome}`);
  await startChrome();
  for (const [i, fn] of ACS.entries()) {
    try { await fn(); } catch (e) { check(i + 1, "criterion ran to the end", false, `threw: ${e.message}`); }
    await resetEmulation().catch(() => {});
  }
  const h = { ...args, evaluate, navigate, waitFor, until, sleep, press, open, panel, send, once, check, verdict, eqs, sameCommit, fmt, addVariant };
  const extDir = path.join(here, "checks");
  const extensions = fs.existsSync(extDir) ? fs.readdirSync(extDir).filter((f) => f.endsWith(".mjs")).sort() : [];
  for (const file of extensions) {
    try {
      const { run } = await import(pathToFileURL(path.join(extDir, file)).href);
      if (typeof run !== "function") throw new Error("no exported run(h)");
      await run(h);
    } catch (e) { check(`checks/${file}`, "extension ran to the end", false, `threw: ${e.message}`); }
    await resetEmulation().catch(() => {});
  }
  const fav = requests.filter((r) => r.path === "/favicon.ico").length;
  if (fav) console.log(`  note: ${fav} /favicon.ico requests (Chrome's own) were left out of the request counts`);
  for (const e of pageErrors) console.log(`  note: page error: ${String(e).split("\n")[0]}`);
} catch (e) {
  check(0, "setup", false, e.message);
} finally {
  await cleanup();
}
console.log(`check.mjs: ${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
setTimeout(() => process.exit(), 300); // let a piped stdout drain
