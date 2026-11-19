// Safari rows of STORY-GEL-34-11, run through safaridriver (WebDriver over HTTP, node's fetch, nothing installed).
//   node tests/web/safari_check.mjs --data PATH --expected PATH [--port 8530] [--driver 4530] [--shots DIR] [--web DIR]
// Start the driver first: /usr/bin/safaridriver -p 4530. Safari must allow remote automation (Settings, Developer, "Allow remote
// automation"); this script never changes that setting. Without it the session is refused, the script prints BLOCKED and exits 3.
// tests/web/check.mjs drives Chrome over CDP and cannot drive Safari, so this is a separate, small runner. It serves web/ itself and
// maps /law-data.json to --data. Prints PASS or FAIL per check, NOT RUN where a script cannot judge, and ends
// "safari_check.mjs: N passed, M failed".
//   R39  the CSRD example, a link-only answer, the CSRD rail, Browse by place and the Copy citation line read as tools/law.py and
//        tools/query.py give them (expected values from Python and cite-expected.json, as 11-whole-page.mjs P4 does).
//   R23  keyboard-only journeys 1 and 2: focus order, visible focus, focus return. WebDriver keys are synthetic. Safari's "Press Tab
//        to highlight each item" setting decides whether Tab reaches buttons and links: the script observes it and, if plain Tab
//        skips them, repeats with Option+Tab (WebKit inverts that setting on Alt). The real keyboard is Varun's.
//   R27  screenshots of the ring on Copy citation and on the selected rail row, and the computed outline. The picture is for Varun.
//   R34  (text spacing only) the WCAG 1.4.12 values on every element, then no clipped or overlapping text on the in-force answer, a
//        link-only answer and Browse by place. 200% zoom in Safari is Varun's, by hand.
// What a script cannot judge: whether a ring is seen against its fill, whether focus moving answer to rail disorients, whether
// spaced text looks right, what VoiceOver says. Every NOT RUN line says what is left.
import fs from "node:fs";
import os from "node:os";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = { port: 8530, driver: 4530, shots: path.join(os.homedir(), ".cache/gel34-chrome/11-safari/shots"), web: path.resolve(HERE, "../../web") };
for (let i = 2; i < process.argv.length; i += 2) {
  const k = (process.argv[i] || "").replace(/^--/, "");
  if (!process.argv[i].startsWith("--") || !["data", "expected", "port", "driver", "shots", "web"].includes(k) || process.argv[i + 1] === undefined) usage();
  args[k] = process.argv[i + 1];
}
if (!args.data || !args.expected) usage();
function usage() {
  console.error("usage: node tests/web/safari_check.mjs --data PATH --expected PATH [--port 8530] [--driver 4530] [--shots DIR] [--web DIR]");
  process.exit(2);
}
const E = JSON.parse(fs.readFileSync(args.expected, "utf8"));
const CITE = JSON.parse(fs.readFileSync(path.join(path.dirname(args.expected), "cite-expected.json"), "utf8"));
fs.mkdirSync(args.shots, { recursive: true });

// What the story and the CSS comments state, never read from the page's own code.
const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const LINK_ONLY = "ae-dl-11-2024-climate";
const KZ = { id: "kz-advertising-law", date: "2026-11-17" };
const RING = 2; // px, :focus-visible { outline: 2px solid var(--link) }
const EDGE = 4; // px, .rail-list li { border-left: 4px solid ... }
const LINK = "rgb(31, 111, 74)"; // --link #1F6F4A
const WIDTH = 1280; // the story's AC6 window

// ---------- results ----------
let passed = 0, failed = 0, notRun = 0;
const line = (s) => console.log(s);
const trim = (s) => (s.length > 220 ? s.slice(0, 220) + "..." : s);
function verdict(id, text, problems) {
  if (problems.length) { failed++; line(`FAIL ${id} ${text}: ${trim(problems.join("; "))}`); } else { passed++; line(`PASS ${id} ${text}`); }
}
const skip = (id, why) => { notRun++; line(`NOT RUN ${id}: ${why}`); };
const info = (s) => line("  " + s);
const eqs = (rows) => rows.filter(([, a, b]) => a !== b).map(([n, a, b]) => `${n}: page ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- the server: web/ and the data file ----------
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = new URL(req.url, "http://x").pathname;
  const send = (code, type, body) => { res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" }); res.end(body); };
  if (p === "/law-data.json") return send(200, "application/json", fs.readFileSync(args.data));
  const file = path.join(args.web, p === "/" ? "index.html" : decodeURIComponent(p));
  if (!file.startsWith(args.web + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(404, "text/plain", "not found");
  send(200, TYPES[path.extname(file)] ?? "application/octet-stream", fs.readFileSync(file));
});
const origin = `http://127.0.0.1:${args.port}`;

// ---------- WebDriver over HTTP ----------
let sid;
async function wd(method, p, body) {
  const r = await fetch(`http://127.0.0.1:${args.driver}${p}`, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60000) }); // a command that never answers is an error, not a hang
  const j = await r.json();
  if (j.value && j.value.error) throw new Error(`${j.value.error}: ${j.value.message}`);
  return j.value;
}
const S = (method, p, body) => wd(method, `/session/${sid}${p}`, body);
const ev = (expr) => S("POST", "/execute/sync", { script: `return (${expr});`, args: [] });
async function until(fn, ms, what) {
  for (const end = Date.now() + ms; ; await sleep(100)) {
    if (await fn()) return true;
    if (Date.now() > end) throw new Error("timed out waiting for " + what);
  }
}
const waitFor = (expr, ms = 5000) => until(() => ev(expr), ms, expr.length > 80 ? expr.slice(0, 80) + "..." : expr);
const READY = `!!(window.GEL && GEL.data && !document.getElementById("example").disabled && !document.getElementById("date").disabled)`;
const SNAP = E.snapshot9;
async function load(hash = "") {
  await S("POST", "/url", { url: "about:blank" }); // a fresh load, so the load event fires and the address is read
  await S("POST", "/url", { url: origin + "/" + hash });
  await waitFor(READY, 10000);
}
const address = (id, date) => `#law=${id}&date=${date}&snapshot=${SNAP}`;
async function click(selector) {
  const el = await S("POST", "/element", { using: "css selector", value: selector });
  await S("POST", `/element/${Object.values(el)[0]}/click`, {});
}
const K = { Tab: "", Enter: "", Shift: "", Alt: "", Meta: "" };
async function act(seq) { // key actions, then release
  await S("POST", "/actions", { actions: [{ type: "key", id: "kbd", actions: seq }] });
  await S("DELETE", "/actions");
}
const press = (key, ...mods) => act([...mods.map((value) => ({ type: "keyDown", value })), { type: "keyDown", value: key }, { type: "keyUp", value: key }, ...[...mods].reverse().map((value) => ({ type: "keyUp", value }))]);
const type = (text) => act([...text].flatMap((value) => [{ type: "keyDown", value }, { type: "keyUp", value }]));
let tabMods = []; // [Alt] when plain Tab skips buttons and links (Safari's "Press Tab to highlight each item" is off)
const tab = (back) => press(K.Tab, ...(back ? [K.Shift] : []), ...tabMods);
async function shot(name) {
  const file = path.join(args.shots, name + ".png");
  fs.writeFileSync(file, Buffer.from(await S("GET", "/screenshot"), "base64"));
  info("screenshot " + file);
}

// ---------- page-side readers (strings) ----------
const PANEL = `(() => {
  const norm = (s) => (s == null ? null : s.replace(/\\s+/g, " ").replace(/\\u2019/g, "'").trim());
  const p = document.getElementById("answer-panel"), f = (n) => p.querySelector('[data-field="' + n + '"]');
  const lang = /^Language: (\\S+)$/.exec(norm(f("language").textContent) || "");
  const l = document.getElementById("citation-line");
  return {
    state: p.getAttribute("data-state"), id: p.getAttribute("data-id"), date: p.getAttribute("data-date"), commit: p.getAttribute("data-commit"), shown: p.checkVisibility(),
    title: norm(f("title").textContent), since: norm(f("since").textContent), kind: f("kind").getAttribute("data-kind"), lang: lang && lang[1], href: f("link").getAttribute("href"),
    text: p.checkVisibility() ? norm(p.innerText) : null,
    rail: [...document.querySelectorAll("#rail-window > li")].map((li) => ({ date: li.dataset.date, commit: li.dataset.commit, kind: li.querySelector(".rail-kind").textContent, current: li.classList.contains("rail-current") })),
    line: l && l.textContent,
  };
})()`;
// The focused element: what it is (a category named by the story's focus order), whether the page draws a ring, whether it is on screen.
const STOP = `(() => {
  const e = document.activeElement, s = getComputedStyle(e), r = e.getBoundingClientRect(), t = (q) => e.matches(q);
  const cat = e === document.body ? "none" : t("#law") ? "law" : t(".match-row") ? "match" : t("#date") ? "date" : t("#example") ? "example" : t("#answer-panel a") ? "answer-link"
    : t("#citation-copy") ? "copy" : t(".rail-row") ? "rail-row" : t("#rail summary") ? "show-all" : e.closest("#browse-by-place") ? "browse" : e.closest("footer") ? "footer" : "other";
  const li = e.closest("li"), ls = li && getComputedStyle(li), lr = li && li.getBoundingClientRect();
  return {
    cat, name: e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\\s+/).join(".") : ""), text: e.textContent.trim().slice(0, 30),
    last: !!e.closest("footer li:last-child"), fv: t(":focus-visible"), ring: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0,
    style: s.outlineStyle, width: parseFloat(s.outlineWidth), offset: parseFloat(s.outlineOffset), color: s.outlineColor,
    inView: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth, box: { l: r.left, r: r.right, t: r.top, b: r.bottom },
    current: !!li && li.classList.contains("rail-current"), liDate: li && li.dataset.date || null,
    strip: li ? { l: lr.left, r: lr.left + parseFloat(ls.borderLeftWidth), w: parseFloat(ls.borderLeftWidth), color: ls.borderLeftColor } : null,
  };
})()`;
const stop = () => ev(STOP);
async function tabTo(want, max = 60) { // Tab until stop satisfies want(stop); the stop, or null
  for (let i = 0; i < max; i++) { await tab(); const s = await stop(); if (want(s)) return s; }
  return null;
}

// ---------- R39 ----------
async function r39() {
  const repo = path.resolve(HERE, "../.."), ref = E.ref; // the Python side always reads this checkout, whatever --web serves
  const lawCli = JSON.parse(spawnSync("python3.13", ["tools/law.py", "EU", CSRD.date, "--json", "--ref", ref, "--repo", repo], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 28 }).stdout || "null");
  const py = spawnSync("python3.13", ["-I", "-c", `
import json, sys
repo, ref = sys.argv[1], sys.argv[2]
sys.path.insert(0, repo + "/tools")
import query
ae = query.law_in_force(repo, "AE", "2026-11-17", None, ref)
places = query.list_places(repo, ref)
print(json.dumps({
  "history": query.instrument_history(repo, "${CSRD.id}", ref)["versions"],
  "link_only": next((x for x in ae["link_only"] if x["id"] == "${LINK_ONLY}"), None),
  "in_force_ids": [i["id"] for i in ae["in_force"]] + [i["id"] for i in ae["not_yet_in_force"]],
  "place_count": places["place_count"],
  "places": [dict(zip(places["columns"], row)) for row in places["rows"]]}))`, repo, ref], { cwd: repo, encoding: "utf8", maxBuffer: 1 << 28 });
  const item = lawCli && lawCli.in_force.find((i) => i.id === CSRD.id);
  if (py.status !== 0 || !item) return verdict("R39", "tools/law.py and tools/query.py gave the expected side", [(py.stderr || "").trim().split("\n").pop() || "law.py lists no " + CSRD.id + " in force on " + CSRD.date]);
  const Q = JSON.parse(py.stdout), want = CITE.fixed.csrd, norm = (s) => s.replace(/’/g, "'");

  // 1 the CSRD example, by a real click on "Try the example"
  await load();
  await click("#example");
  await waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain" && document.getElementById("answer-panel").getAttribute("data-date") === "${CSRD.date}"`);
  const P = await ev(PANEL);
  info(`law.py EU ${CSRD.date}: ${item.id}, in force ${item.in_force}, ${item.kind}, ${item.language}, commit ${item.commit.slice(0, 9)}; Safari prints ${JSON.stringify(P.title)}, ${JSON.stringify(P.since)}, kind ${P.kind}, language ${P.lang}, commit ${(P.commit || "").slice(0, 9)}`);
  verdict("R39-answer", `the CSRD example on ${CSRD.date}: title, in-force date, kind, language, link and commit are those law.py gives (${item.kind} ${item.in_force})`, [
    ...eqs([["title", P.title, norm(item.title)], ["id", P.id, item.id], ["date asked", P.date, CSRD.date], ["kind", P.kind, item.kind], ["language", P.lang, item.language], ["link", P.href, item.source_url], ["commit", P.commit, item.commit]]),
    ...(P.since && P.since.includes(item.in_force) ? [] : [`the since line ${JSON.stringify(P.since)} does not hold ${item.in_force}`]),
  ]);

  // 2 the rail
  const versions = [...Q.history].reverse(); // instrument_history is oldest first, the rail is newest first
  const current = P.rail.filter((r) => r.current);
  info(`query.instrument_history: ${Q.history.map((v) => v.in_force + " " + v.kind).join(", ")}; the rail prints ${P.rail.map((r) => r.date + " " + r.kind).join(", ")}`);
  verdict("R39-rail", `the CSRD rail lists the ${versions.length} versions instrument_history gives (newest first, kind and commit) and marks the one law.py names in force`, [
    ...eqs([["rows", P.rail.length, versions.length]]),
    ...versions.flatMap((v, i) => (P.rail[i] ? eqs([[`row ${i + 1} date`, P.rail[i].date, v.in_force], [`row ${i + 1} kind`, P.rail[i].kind, v.kind], [`row ${i + 1} commit`, P.rail[i].commit, v.commit]]) : [])),
    ...(current.length === 1 && current[0].commit === item.commit && current[0].date === item.in_force ? [] : [`marked rows ${JSON.stringify(current)}, want one row, ${item.in_force} ${item.commit}`]),
  ]);

  // 3 the citation line, and Copy citation: the displayed line, then the clipboard
  verdict("R39-citation", "the displayed citation line is the line tools/query.py gives (cite-expected.json) and holds law.py's title, in-force date and link", [
    ...(P.line === want ? [] : [`page ${JSON.stringify(P.line)}, python ${JSON.stringify(want)}`]),
    ...[item.title, item.in_force, item.source_url, "in force on " + CSRD.date].filter((x) => !(P.line || "").includes(x)).map((x) => `the line does not hold ${JSON.stringify(x)}`),
  ]);
  await copyCheck(P.line);

  // 4 a link-only answer
  await load(address(LINK_ONLY, "2026-11-17"));
  const L = await ev(`(() => { const p = document.getElementById("answer-panel"), s = document.querySelector('#answer-interim [data-part="source"]'), t = p.querySelector('[data-field="title"]'); return { state: p.getAttribute("data-state"), text: p.innerText, title: t.textContent.replace(/\\s+/g, " ").trim(), href: s && s.getAttribute("href") }; })()`);
  verdict("R39-linkonly", `${LINK_ONLY}: law.py's AE answer does not list it in force, query.py lists it link only with its official URL, and Safari shows the interim answer with that title and URL`, [
    ...(Q.link_only ? eqs([["title", L.title, norm(Q.link_only.title)], ["official link", L.href, Q.link_only.official_url]]) : ["law_in_force lists no link_only item for the id"]),
    ...(Q.in_force_ids.includes(LINK_ONLY) ? ["the id is in law_in_force's in_force or not_yet_in_force"] : []),
    ...(L.state === "interim" && L.text.includes("only a link") ? [] : [`state ${L.state}, text ${JSON.stringify(L.text.slice(0, 80))}, want interim and "only a link"`]),
  ]);

  // 5 Browse by place
  const rows = await ev(`[...document.querySelectorAll("#browse-table tbody tr")].map((tr) => ({ code: tr.getAttribute("data-place"), head: tr.querySelector("th").textContent, nums: [...tr.querySelectorAll("td")].map((td) => td.textContent) }))`);
  const byCode = new Map(rows.map((r) => [r.code, r]));
  const bad = Q.places.flatMap((x) => {
    const r = byCode.get(x.iso2);
    return r ? eqs([[x.iso2 + " place cell", r.head, `${x.name} (${x.iso2})`], [x.iso2 + " instruments, text stored, link only", r.nums.join(" "), [x.instrument_count, x.stored_count, x.link_only_count].join(" ")]]) : [x.iso2 + " has no row in the table"];
  });
  verdict("R39-browse", `Browse by place: all ${Q.place_count} rows (place, instruments, text stored, link only) are those query.list_places gives`, [
    ...(rows.length === Q.place_count ? [] : [`the table has ${rows.length} rows, list_places has ${Q.place_count}`]), ...bad.slice(0, 8), ...(bad.length > 8 ? [`and ${bad.length - 8} more`] : []),
  ]);
}

// Copy citation by a real WebDriver click. The confirmation is read from the page. The clipboard is read two ways and the result of each is
// printed: navigator.clipboard.readText() (Safari may refuse it without a person's paste), then Cmd+V into a scratch textarea.
const SENTINEL = "sentinel-before-copy";
async function copyCheck(shown) {
  const native = await ev(`"CommandEvent" in window`);
  const paste = async () => { // what the macOS pasteboard holds, as a Cmd+V into a scratch textarea says
    await ev(`(() => { let t = document.getElementById("scratch-paste"); if (!t) { t = document.createElement("textarea"); t.id = "scratch-paste"; document.body.append(t); } t.value = ""; t.focus(); return true; })()`);
    await press("v", K.Meta);
    await sleep(300);
    return ev(`document.getElementById("scratch-paste").value`);
  };
  spawnSync("pbcopy", { input: SENTINEL }); // so an old clipboard cannot pass (macOS)
  const before = await paste();
  await click("#citation-copy");
  await until(() => ev(`document.getElementById("citation-status").textContent !== ""`), 5000, "the copy confirmation");
  const status = await ev(`document.getElementById("citation-status").textContent`);
  verdict("R39-copy-status", `Copy citation (${native ? "Invoker Commands present" : "click fallback"}): the confirmation reads Copied`, status.trim() === "Copied" ? [] : [`it reads ${JSON.stringify(status)}`]);
  const after = await paste();
  const read = await S("POST", "/execute/async", { script: `const done = arguments[arguments.length - 1]; const t = setTimeout(() => done("readText timed out"), 3000); navigator.clipboard.readText().then((v) => { clearTimeout(t); done(v); }, (e) => { clearTimeout(t); done("readText refused: " + e.name); });`, args: [] });
  info(`clipboard before the click (paste): ${JSON.stringify(before)}; after (paste): ${JSON.stringify(after)}; navigator.clipboard.readText(): ${JSON.stringify(read)}`);
  if (before === SENTINEL) verdict("R39-clipboard", "the clipboard held a sentinel before the click and holds the displayed citation line, with no line break, after it", [...(after === shown ? [] : [`a paste after the click gives ${JSON.stringify(after.slice(0, 80))}`]), ...(/[\r\n]/.test(after) ? ["the clipboard text holds a line break"] : [])]);
  else if (read === shown) verdict("R39-clipboard", "navigator.clipboard.readText() gives the displayed citation line after the click (the Cmd+V paste did not work, so no sentinel was proven)", []);
  else skip("R39-clipboard", `a Cmd+V paste into a textarea did not give back the sentinel (it gave ${JSON.stringify(before)}) and readText gave no line; the displayed line is checked above, the clipboard half is not shown`);
  await ev(`document.getElementById("scratch-paste") && document.getElementById("scratch-paste").remove()`);
}

// ---------- R23 ----------
const ok = (x) => x.fv && x.ring && x.inView;
const bad = (x) => `${x.name} "${x.text}" focus-visible ${x.fv}, outline ${x.style} ${x.width}px, on screen ${x.inView}`;
// The walk: Tab from the date field to the last footer link, recording every stop. Copy citation and the first rail row are pressed with Enter.
async function walk(label, expect, { act: acts = false } = {}) {
  await ev(`document.getElementById("date").focus()`); // the start of the walk; everything after it is the keyboard
  let s = await stop();
  const stops = [s], did = {};
  for (let i = 0; i < 400 && !s.last; i++) { // 400: 250 place links sit between the rail and the footer (Varun 2026-11-19, STORY-GEL-34-14)
    await tab();
    s = await stop();
    stops.push(s);
    if (acts && s.cat === "copy" && !did.copy) {
      did.copy = true;
      await press(K.Enter);
      await until(() => ev(`document.getElementById("citation-status").textContent !== ""`), 5000, "the copy confirmation");
      did.copyAfter = { status: await ev(`document.getElementById("citation-status").textContent`), focus: (await stop()).cat };
    }
    if (acts && s.cat === "rail-row" && !did.rail) {
      did.rail = true;
      await press(K.Enter);
      await sleep(300);
      const a = await stop(), p = await ev(PANEL);
      did.railAfter = { want: s.liDate, focus: a.cat, liDate: a.liDate, current: a.current, panelDate: p.date };
    }
  }
  const seq = stops.map((x) => x.cat).filter((c, i, all) => c !== all[i - 1]);
  const order = seq.filter((c) => c !== "browse"); // Browse by place holds one link per place (Varun 2026-11-19, STORY-GEL-34-14); the order below leaves them out, 11-keyboard.mjs checks them
  info(`${label} focus order: ${seq.join(" > ")}; stops: ${stops.length}`);
  const seen = new Set();
  const keyed = stops.slice(1).filter((x) => x.cat !== "date"); // stop 0 is the script's own start point, not a key arrival; the native date field has its own check, R23-j1-date
  const noRing = keyed.filter((x) => !ok(x) && !seen.has(x.name) && seen.add(x.name)).map(bad);
  verdict(`R23-${label}-order`, `${label}: Tab from the date field goes ${expect.join(", ")}, ending on the last footer link`, [
    ...(s.last ? [] : ["the last footer link was not reached in 400 presses"]),
    ...(JSON.stringify(order) === JSON.stringify(expect) ? [] : [`focus order was ${order.join(", ")}`]),
  ]);
  verdict(`R23-${label}-ring`, `${label}: each of the ${keyed.length} stops after the date field matches :focus-visible, has an outline and is on screen`, noRing);
  return did;
}

async function typeDate(iso) { // the segment order is the system's, so it is read from the page
  const order = await ev(`new Intl.DateTimeFormat(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(2000, 0, 1)).filter((p) => p.type !== "literal").map((p) => p.type)`);
  const [year, month, day] = iso.split("-");
  for (const [i, k] of order.entries()) { // Safari's date field does not advance by itself: Tab moves between its three parts
    if (i) await press(K.Tab);
    await type({ year, month, day }[k]);
  }
  try { await waitFor(`document.getElementById("date").value === "${iso}" && document.getElementById("answer-panel").getAttribute("data-date") === "${iso}"`, 3000); return true; } catch { return false; }
}

async function pickByKeys(text) { // from the law box: type, Tab to the first match row, Enter. The row's id and where focus lands.
  await ev(`(() => { const l = document.getElementById("law"); l.focus(); l.select(); })()`);
  await type(text);
  await waitFor(`document.querySelectorAll("#match-rows > li").length > 0`);
  const row = await tabTo((s) => s.cat === "match", 3);
  const id = row ? await ev(`document.activeElement.dataset.id`) : null;
  if (row) await press(K.Enter);
  await sleep(200);
  return { row, id, focus: (await stop()).cat, law: await ev(`document.getElementById("law").value`) };
}

async function r23() {
  // Does Tab reach the buttons? Observed, not assumed.
  await load();
  const probe = async () => { const seq = []; for (let i = 0; i < 10; i++) { await tab(); seq.push((await stop()).cat); } return seq; };
  let seq = await probe();
  let plain = seq.includes("example");
  info(`first ten ${tabMods.length ? "Option+Tab" : "Tab"} presses from a fresh page reach: ${seq.join(" > ")}`);
  if (!plain) {
    tabMods = [K.Alt];
    await load();
    seq = await probe();
    info(`first ten Option+Tab presses reach: ${seq.join(" > ")}`);
    if (!seq.includes("example")) return skip("R23", "neither Tab nor Option+Tab reached Try the example in ten presses; no keyboard journey was run");
  }
  info(`OBSERVED: plain Tab ${plain ? "reaches" : "does not reach"} buttons in Safari under WebDriver; the journeys below ran with ${plain ? "Tab" : "Option+Tab"}. Safari's "Press Tab to highlight each item" setting is not read by this script.`);

  // Journey 1 (UX spec): type a law name, pick it, set a date, read the answer, copy, change the version, follow the order to the footer
  await load();
  await tab();
  const first = await stop();
  verdict("R23-j1-law", "journey 1: the first Tab from a fresh page lands on the law box, with a ring", [...(first.cat === "law" ? [] : [`it landed on ${first.name}`]), ...(ok(first) ? [] : [bad(first)])]);
  const pick = await pickByKeys("CSRD");
  verdict("R23-j1-pick", "journey 1: typing CSRD, Tab to the first match row and Enter chooses a law and returns focus to the law box", [
    ...(pick.row ? (ok(pick.row) ? [] : [bad(pick.row)]) : ["Tab did not reach a match row"]),
    ...(pick.focus === "law" ? [] : [`focus is on ${pick.focus}, want law`]),
    ...(pick.row && pick.law ? [] : ["the law box is empty"]),
    ...(await ev(`document.getElementById("answer-panel").checkVisibility()`) ? [] : ["no answer is shown"]),
  ]);
  await tab();
  const date = await stop();
  await shot("r23-date-focused"); // a native control: what Safari draws on it is for Varun
  verdict("R23-j1-date", "journey 1: after the pick, Tab goes from the law box to the date field, with a ring", [...(date.cat === "date" ? [] : [`it went to ${date.name}`]), ...(ok(date) ? [] : [bad(date)])]);
  if (await typeDate(CSRD.date)) info(`typing the digits into the native date field set ${CSRD.date}`);
  else {
    skip("R23-j1-date-typed", `typing ${CSRD.date} into Safari's date field did not set it (field value ${JSON.stringify(await ev(`document.getElementById("date").value`))}); the date is set by GEL.setDate instead, which is not keyboard input`);
    await ev(`(GEL.choose(${JSON.stringify(CSRD.id)}), GEL.setDate(${JSON.stringify(CSRD.date)}))`);
  }
  const did = await walk("j1", ["date", "example", "answer-link", "copy", "rail-row", "footer"], { act: true });
  verdict("R23-j1-copy", "journey 1: Enter on Copy citation shows Copied and focus stays on the button", did.copyAfter && did.copyAfter.status.trim() === "Copied" && did.copyAfter.focus === "copy" ? [] : [did.copyAfter ? JSON.stringify(did.copyAfter) : "Tab never reached Copy citation"]);
  const r = did.railAfter;
  verdict("R23-j1-rail", "journey 1: Enter on a rail row selects that version and the focus stays on that row", r && r.focus === "rail-row" && r.current && r.liDate === r.want && r.panelDate === r.want ? [] : [r ? JSON.stringify(r) : "Tab never reached a rail row"]);
  await load(address(KZ.id, KZ.date));
  await walk("j1-capped", ["date", "example", "answer-link", "copy", "rail-row", "show-all", "footer"]);

  // Journey 2: a law and a date the corpus cannot answer in full
  const CASES = [
    { name: "no match", text: "Sarbanes-Oxley", enter: true, state: "no-match", words: ["Sarbanes-Oxley"] },
    { name: "link only", text: LINK_ONLY, id: LINK_ONLY, date: "2026-11-17", state: "interim", words: ["only a link"] },
    { name: "before the first version", text: CSRD.id, id: CSRD.id, date: "2022-12-31", state: "interim", words: ["2023-01-05"] },
    { name: "repealed", text: "gn-arrete-2022-1646-evaluations-environnementales", id: "gn-arrete-2022-1646-evaluations-environnementales", date: "2024-01-01", state: "interim", words: ["Repealed on 2023-05-05"] },
  ];
  for (const c of CASES) {
    await load();
    const problems = [];
    if (c.enter) {
      await ev(`(() => { const l = document.getElementById("law"); l.focus(); l.select(); })()`);
      await type(c.text);
      await waitFor(`document.getElementById("match-count").textContent !== ""`);
      await press(K.Enter);
      await sleep(300);
    } else {
      const p = await pickByKeys(c.text);
      if (p.id !== c.id) problems.push(`the first match row is ${p.id}, want ${c.id}`);
      if (p.focus !== "law") problems.push(`after the pick focus is on ${p.focus}, want law`);
      await tab();
      if ((await stop()).cat !== "date") problems.push("Tab after the pick did not reach the date field");
      if (!(await typeDate(c.date))) problems.push(`typing ${c.date} did not set the field (value ${JSON.stringify(await ev(`document.getElementById("date").value`))}): not a keyboard result`);
    }
    const P = await ev(PANEL);
    problems.push(...(P.shown && P.state === c.state ? [] : [`the panel is shown ${P.shown} in state ${P.state}, want ${c.state}`]), ...c.words.filter((w) => !(P.text || "").includes(w)).map((w) => `the panel does not say ${JSON.stringify(w)}`));
    if (!c.enter) { // the next step is a link reached by Tab from the date field
      await ev(`document.getElementById("date").focus()`);
      problems.push(...((await tabTo((s) => s.cat === "answer-link", 6)) ? [] : ["no answer link within six presses of Tab from the date field"]));
    }
    verdict(`R23-j2-${c.name.replace(/ /g, "-")}`, `journey 2, ${c.name}: ${c.enter ? "typed, Enter in the law box" : "typed, Tab and Enter on the match row, date typed, Tab to the answer link"}; the answer says what the case is`, problems);
  }
  info("NOT JUDGED by script: whether focus moving from the answer to the rail on its left disoriented (the focus orders above are the evidence); the real keyboard; Safari's Tab setting");
}

// ---------- R27 ----------
async function r27() {
  await load(address(CSRD.id, CSRD.date));
  const ring = (s, name) => [
    ...(s.fv ? [] : [`${name}: not :focus-visible`]), ...(s.style === "solid" ? [] : [`${name}: outline-style ${s.style}, want solid`]),
    ...(s.width === RING ? [] : [`${name}: outline-width ${s.width}px, want ${RING}px`]), ...(s.color === LINK ? [] : [`${name}: outline-color ${s.color}, want ${LINK}`]),
  ];
  const center = (sel) => ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({ block: "center" })`);
  await ev(`document.getElementById("date").focus()`);
  const btn = await tabTo((s) => s.cat === "copy");
  if (!btn) skip("R27-copy", "no Tab reached #citation-copy in 60 presses");
  else {
    await center("#citation-copy");
    await shot("r27-copy-citation");
    verdict("R27-copy", `Copy citation focused by keyboard: computed outline ${btn.style} ${btn.width}px ${btn.color}, offset ${btn.offset}px (the picture is for Varun)`, ring(btn, "Copy citation"));
  }
  const sel = await tabTo((s) => s.cat === "rail-row" && s.current);
  if (!sel) skip("R27-rail", "no Tab reached the selected rail row in 60 presses");
  else {
    await center("li.rail-current .rail-row");
    await shot("r27-rail-selected");
    const band = [sel.box.l - sel.offset - sel.width, sel.box.l - sel.offset]; // the ring's left band, from the border box
    verdict("R27-rail", `selected rail row focused by keyboard: computed outline ${sel.style} ${sel.width}px ${sel.color}, offset ${sel.offset}px, left band ${band.map((x) => Math.round(x * 10) / 10).join(" to ")}, li edge ${sel.strip.l} to ${sel.strip.r} (the picture is for Varun)`, [
      ...ring(sel, "selected row"),
      ...(sel.strip.w === EDGE ? [] : [`li border-left-width ${sel.strip.w}px, want ${EDGE}px`]), ...(sel.strip.color === LINK ? [] : [`li border-left-color ${sel.strip.color}, want ${LINK}`]),
      ...(Math.min(band[1], sel.strip.r) - Math.max(band[0], sel.strip.l) > 0.01 ? ["the ring band lies on the 4px edge strip"] : []),
    ]);
  }
  info("NOT JUDGED by script: whether the ring is seen against the button fill and the rail tint; look at the two screenshots");
}

// ---------- R34, text spacing ----------
const SPACING = "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }"; // WCAG 1.4.12
const MEASURE = `(() => {
  const name = (e) => e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\\s+/).join(".") : "");
  const box = (r) => Math.round(r.left) + "," + Math.round(r.top) + " " + Math.round(r.width) + "x" + Math.round(r.height);
  const items = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode()); ) {
    const e = n.parentElement, b = e.getBoundingClientRect();
    if (!n.nodeValue.trim() || !e.checkVisibility() || b.width <= 1 || b.height <= 1 || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(e.tagName)) continue; // 1px boxes are the visually hidden sentence
    const r = document.createRange(); r.selectNodeContents(n);
    items.push({ e, text: n.nodeValue.trim().slice(0, 24), rects: [...r.getClientRects()].filter((x) => x.width > 0 && x.height > 0) });
  }
  const clipped = [], overlap = [];
  for (const it of items) {
    if (getComputedStyle(it.e).textOverflow === "ellipsis" && it.e.scrollWidth > it.e.clientWidth + 1) clipped.push(name(it.e) + " ellipsis: content " + it.e.scrollWidth + "px in " + it.e.clientWidth + "px");
    for (let a = it.e; a && a !== document.documentElement; a = a.parentElement) {
      const o = getComputedStyle(a);
      if (!/hidden|clip/.test(o.overflowX + o.overflowY)) continue;
      const ab = a.getBoundingClientRect(), out = it.rects.find((r) => r.right > ab.right + 1 || r.bottom > ab.bottom + 1 || r.left < ab.left - 1 || r.top < ab.top - 1);
      if (out) clipped.push(JSON.stringify(it.text) + " in " + name(it.e) + " (" + box(out) + ") leaves " + name(a) + " (" + box(ab) + ")");
    }
  }
  const R = items.flatMap((it, i) => it.rects.map((r) => ({ i, it, r })));
  for (let a = 0; a < R.length; a++) for (let b = a + 1; b < R.length; b++) {
    if (R[a].i === R[b].i) continue;
    const x = Math.min(R[a].r.right, R[b].r.right) - Math.max(R[a].r.left, R[b].r.left), y = Math.min(R[a].r.bottom, R[b].r.bottom) - Math.max(R[a].r.top, R[b].r.top);
    if (x > 1 && y > 1) overlap.push(JSON.stringify(R[a].it.text) + " (" + box(R[a].r) + ") over " + JSON.stringify(R[b].it.text) + " (" + box(R[b].r) + ")");
  }
  const d = document.documentElement;
  return { texts: items.length, rects: R.length, nClipped: clipped.length, clipped: clipped.slice(0, 6), nOverlap: overlap.length, overlap: overlap.slice(0, 6), scrollW: d.scrollWidth, innerW: window.innerWidth, innerH: window.innerHeight };
})()`;
const APPLIED = `(() => { const s = getComputedStyle(document.querySelector(".lede")), f = parseFloat(s.fontSize); return { f, ls: parseFloat(s.letterSpacing) / f, ws: parseFloat(s.wordSpacing) / f, lh: parseFloat(s.lineHeight) / f, mb: parseFloat(s.marginBottom) / f }; })()`;

async function r34() {
  const STATES = [
    { name: "in-force answer", hash: address(CSRD.id, CSRD.date), ok: (p) => (p.state === "plain" && p.text.includes("In force since 2025-04-17") ? [] : [`state ${p.state}, want plain with "In force since 2025-04-17"`]) },
    { name: "link-only answer", hash: address(LINK_ONLY, "2026-11-17"), ok: (p) => (p.state === "interim" && p.text.includes("only a link") ? [] : [`state ${p.state}, want interim with "only a link"`]) },
    { name: "Browse by place", hash: "", scroll: "browse-grid", ok: () => [] },
  ];
  for (const s of STATES) {
    await load(s.hash);
    if (s.scroll) await ev(`document.getElementById("${s.scroll}").scrollIntoView()`);
    const p = await ev(PANEL).catch(() => ({ state: null, text: "" }));
    const rows = await ev(`document.querySelectorAll("#browse-table tbody tr").length`);
    const before = await ev(MEASURE);
    await ev(`(() => { const s = document.createElement("style"); s.id = "wcag-1412"; s.textContent = ${JSON.stringify(SPACING)}; document.head.append(s); return true; })()`);
    const a = await ev(APPLIED), after = await ev(MEASURE);
    await shot("r34-" + s.name.replace(/ /g, "-").toLowerCase());
    const near = (x, y) => Math.abs(x - y) < 0.02;
    verdict(`R34-spacing-${s.name.replace(/ /g, "-").toLowerCase()}`, `${s.name}, window ${after.innerW}x${after.innerH}, 1.4.12 spacing on every element: no clipped text and no overlapping text (${after.texts} text nodes, ${after.rects} lines; without spacing ${before.nClipped} clipped, ${before.nOverlap} overlapping)`, [
      ...(near(a.ls, 0.12) && near(a.ws, 0.16) && near(a.lh, 1.5) && near(a.mb, 2) ? [] : [`the spacing did not apply: letter ${a.ls}em, word ${a.ws}em, line ${a.lh}, paragraph ${a.mb}em`]),
      ...(s.scroll ? (rows > 0 ? [] : ["Browse by place holds no table rows"]) : s.ok(p)),
      ...after.clipped.map((x) => "clipped: " + x), ...(after.nClipped > after.clipped.length ? [`and ${after.nClipped - after.clipped.length} more clipped`] : []),
      ...after.overlap.map((x) => "overlap: " + x), ...(after.nOverlap > after.overlap.length ? [`and ${after.nOverlap - after.overlap.length} more overlapping`] : []),
    ]);
    if (after.innerW !== WIDTH) info(`the window is ${after.innerW} px wide, not ${WIDTH}`);
    if (after.scrollW > after.innerW) info(`${s.name}: the page scrolls sideways with the spacing (scrollWidth ${after.scrollW}, window ${after.innerW}); not a 1.4.12 failure by itself`);
  }
  skip("R34-zoom", "200% zoom of a 1280 px window in Safari is Varun's, by hand; WebDriver has no page zoom");
  info("NOT JUDGED by script: whether spaced text looks right, only whether a box clips it or two lines of text cross; see the three r34 screenshots");
}

// ---------- main ----------
await new Promise((ok) => server.listen(Number(args.port), "127.0.0.1", ok));
try {
  let created;
  try {
    created = await wd("POST", "/session", { capabilities: { alwaysMatch: { browserName: "safari" } } });
  } catch (e) {
    line(`BLOCKED: no Safari session: ${e.message}`);
    line("safari_check.mjs: 0 passed, 0 failed");
    process.exitCode = 3;
    throw e;
  }
  sid = created.sessionId;
  const c = created.capabilities;
  line(`Safari ${c.browserVersion} (${c.browserName}, ${c.platformName}), safaridriver on port ${args.driver}, page ${origin}/, data ${args.data}`);
  try { await S("POST", "/window/rect", { width: WIDTH, height: 900 }); } catch (e) { info("window size not set: " + e.message); }
  await load();
  info("window " + (await ev(`innerWidth + "x" + innerHeight`)) + ", document.hasFocus() " + (await ev(`document.hasFocus()`)));
  for (const [name, fn] of [["R39", r39], ["R23", r23], ["R27", r27], ["R34", r34]]) {
    // A window that is not frontmost gets no clicks or keys and matches no :focus-visible: those would be false FAILs (seen 2026-11-18).
    if (!(await ev(`document.hasFocus()`).catch(() => false))) { skip(name, "the Safari window does not have focus (document.hasFocus() is false); leave Safari in front and untouched while the script runs, then rerun"); continue; }
    try { await fn(); } catch (e) { verdict(name, "section ran to the end", ["threw: " + e.message]); }
  }
  line(`${notRun} not run, screenshots in ${args.shots}`);
  line(`safari_check.mjs: ${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
} catch (e) {
  if (process.exitCode !== 3) { console.error(e); process.exitCode = 1; }
} finally {
  if (sid) await S("DELETE", "").catch(() => {});
  server.close();
}
