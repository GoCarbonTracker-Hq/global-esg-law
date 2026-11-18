// Checks for STORY-GEL-34-11, row R22: UX journeys 1 and 2 driven with key events only, in Chrome. tests/web/check.mjs imports this file.
//
// Every step is a CDP key event (Tab, Shift+Tab, Enter, Space, ArrowUp/Down, Backspace, typed characters). No click, no focus() call, no
// value set. The expected tab order is the UX spec's list (law box, match rows, date field, example, the answer's links, Copy citation,
// rail rows, "Show all N versions", Browse by place, footer; spec "Keyboard" and step 13 item 2); the positions are read from the boxes.
//
// What a script measures: which element has focus after each key, that it matches :focus-visible and draws an outline of non-zero width
// and a style other than none, that it lies in the viewport, the role order of the stops against the spec list, the jump between
// consecutive stops (page coordinates), that no key press leaves focus where it was, that Shift+Tab walks the same stops back, and what
// focus and scroll do after the match list closes, Copy citation, a rail row and "Show all N versions".
// What it cannot judge: whether a ring is easy to see against its neighbours (11-ring.mjs and the contrast test cover two elements by
// number; the rest is a person looking), whether the calendar-picker stop inside the date field shows a ring (Chrome draws it and the
// page's :focus-visible does not match there; one screenshot is taken), whether the move from the answer to the rail on its left
// disorients (the story hands that to Varun; the numbers are printed), anything in Safari or Firefox, VoiceOver.
// A link that opens a new tab (Official text, Official source) is reached and measured, never activated.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SHOTS = path.join(os.homedir(), ".cache/gel34-chrome/11-keyboard/shots");
const CSRD = { id: "eu-csrd-2022-2464", versions: ["2026-03-18", "2025-04-17", "2023-01-05"] }; // newest first (story 7); STORY-GEL-34-11 "Context"
const KZ = { id: "kz-advertising-law", versions: 150 };
const RAIL_WINDOW = 7; // story 7: a window of 7 rows
const MATCH_MAX = 8; // UX spec "Match list": at most 8 rows
const FOOTER = 3; // story 10: three links, last in the tab order
const CASES = {
  link: { name: "ae-dl-11-2024-climate", id: "ae-dl-11-2024-climate", date: "2025-06-01" },
  before: { name: "eu-csrd-2022-2464", id: CSRD.id, date: "2022-12-31", first: "2023-01-05", commit: "8960295fa" },
  repealed: { name: "gn-arrete-2022-1646", id: "gn-arrete-2022-1646-evaluations-environnementales", date: "2024-01-01", status: "Repealed on 2023-05-05" },
  none: { name: "Sarbanes-Oxley" },
};
// "Browse by place" holds nothing to operate, so it has no stop to name; the count of its stops is printed.
const SPEC_ORDER = ["law", "match", "date", "example", "answer-link", "copy", "rail", "show-all", "footer"];

// ---------- key events ----------
const KEYS = {
  Tab: { key: "Tab", code: "Tab", vk: 9 },
  Enter: { key: "Enter", code: "Enter", vk: 13, text: "\r" },
  Space: { key: " ", code: "Space", vk: 32, text: " " },
  Backspace: { key: "Backspace", code: "Backspace", vk: 8 },
  ArrowUp: { key: "ArrowUp", code: "ArrowUp", vk: 38 },
  ArrowDown: { key: "ArrowDown", code: "ArrowDown", vk: 40 },
};
async function key(h, name, shift = false) {
  const k = KEYS[name], modifiers = shift ? 8 : 0;
  const base = { key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk, modifiers };
  await h.send("Input.dispatchKeyEvent", { type: k.text ? "keyDown" : "rawKeyDown", ...base, ...(k.text ? { text: k.text, unmodifiedText: k.text } : {}) });
  await h.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
}
async function typeText(h, text) {
  for (const ch of text) {
    const letter = /[a-zA-Z]/.test(ch), digit = /[0-9]/.test(ch);
    const vk = ch === "-" ? 189 : letter ? ch.toUpperCase().charCodeAt(0) : digit ? ch.charCodeAt(0) : 32;
    const base = {
      key: ch, code: ch === "-" ? "Minus" : letter ? "Key" + ch.toUpperCase() : digit ? "Digit" + ch : "Space",
      windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: ch >= "A" && ch <= "Z" ? 8 : 0,
    };
    await h.send("Input.dispatchKeyEvent", { type: "keyDown", ...base, text: ch, unmodifiedText: ch });
    await h.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
  }
}

// ---------- what the page shows ----------
const DESCRIBE = `(() => {
  const a = document.activeElement;
  if (!a || a === document.body || a === document.documentElement) return { role: "none", name: "body" };
  const s = getComputedStyle(a), r = a.getBoundingClientRect();
  const role = a.id === "law" ? "law" : a.classList.contains("match-row") ? "match" : a.id === "date" ? "date" : a.id === "example" ? "example"
    : a.id === "citation-copy" ? "copy" : a.closest("#answer-panel") ? (a.matches("[data-part=offer]") ? "offer" : a.matches("[data-part=browse]") ? "answer-browse" : "answer-link")
    : a.closest("#rail") ? (a.tagName === "SUMMARY" ? "show-all" : "rail") : a.closest("#browse-by-place") ? "browse" : a.closest("footer") ? "footer" : "other";
  return {
    role, name: a.tagName.toLowerCase() + (a.id ? "#" + a.id : "") + " " + JSON.stringify(a.textContent.trim().slice(0, 28)),
    fv: a.matches(":focus-visible"), style: s.outlineStyle, width: parseFloat(s.outlineWidth),
    l: r.left + scrollX, t: r.top + scrollY, vt: r.top, vb: r.bottom, vh: innerHeight, sy: scrollY, inAll: !!a.closest("#rail-all"),
  };
})()`;
const STATE = `(() => {
  const q = (s) => document.querySelector(s), p = q("#answer-panel"), at = p.getBoundingClientRect();
  return {
    law: q("#law").value, date: q("#date").value, echo: q("#date-echo").textContent, state: p.getAttribute("data-state"), commit: p.getAttribute("data-commit"),
    shown: !p.hidden, status: q('[data-field="status"]').textContent, since: q('[data-field="since"]').textContent, text: p.innerText,
    rows: document.querySelectorAll(".match-row").length, count: q("#match-count").textContent, countHidden: q("#match-count").hidden,
    first: (q(".match-row") || { dataset: {} }).dataset.id || null, sy: scrollY, hash: location.hash,
    cite: (q("#citation-status") || {}).textContent ?? null, line: (q("#citation-line") || {}).textContent ?? null,
    current: [...document.querySelectorAll("#rail li.rail-current")].map((li) => li.dataset.date), answerTop: at.top + scrollY,
  };
})()`;

// ---------- driver ----------
const near = (n) => Math.round(n * 10) / 10;
const same = (a, b) => a.name === b.name && a.l === b.l && a.t === b.t;
const view = (h, width, height) => h.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
const here = (h) => h.evaluate(DESCRIBE);
const state = (h) => h.evaluate(STATE);
async function tab(h, shift = false) { await key(h, "Tab", shift); return here(h); }
async function shot(h, name) {
  fs.mkdirSync(SHOTS, { recursive: true });
  const r = await h.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(SHOTS, name + ".png"), Buffer.from(r.data, "base64"));
}

// A journey: each step presses Tab or Shift+Tab, logs the element, and asserts the role it lands on.
function journey(h, tag, stops = []) {
  const problems = [];
  const take = (s, label, shift) => {
    console.log(`  trace ${tag}: ${shift ? "Shift+Tab" : "Tab"} -> ${s.role} ${s.name}${s.role !== "none" && !s.fv ? " (not :focus-visible)" : ""} | ${label}`);
    stops.push(s);
    return s;
  };
  return {
    problems, stops, take,
    async go(role, label, shift = false) {
      const s = take(await tab(h, shift), label, shift);
      if (s.role !== role) problems.push(`${label}: focus is on ${s.role} (${s.name}), want ${role}`);
      return s;
    },
    // Tab on while the focus stays inside `role` (the date field has several stops); the stop that left it.
    async through(role, label) {
      let s, n = 0;
      do s = take(await tab(h), label, false); while (s.role === role && ++n < 8);
      return s;
    },
    note: (m) => problems.push(m),
  };
}
const ringOk = (s) => s.role !== "none" && s.fv && s.style !== "none" && s.width > 0 && s.vt >= -1 && s.vb <= s.vh + 1;
const pickerStop = (s) => s.role === "date" && !s.fv; // Chrome's calendar icon: the input does not match :focus-visible there
const ringProblems = (stops, skip = () => false) => stops.filter((s) => !skip(s) && !ringOk(s)).map((s) => `${s.role} ${s.name}: :focus-visible ${s.fv}, outline ${s.style} ${s.width}px, top ${near(s.vt)} bottom ${near(s.vb)} in a ${s.vh}px window`);
const runs = (stops) => stops.map((s) => s.role).filter((r, i, all) => r !== all[i - 1]);
// Focus left where it was after a Tab (a date field's inner stops aside).
function trapProblems(stops) {
  const out = [];
  let inner = 1;
  stops.forEach((s, i) => {
    if (!i || !same(s, stops[i - 1])) return void (inner = 1);
    if (s.role !== "date" || ++inner > 6) out.push(`a key press left focus on ${s.name}`);
  });
  return out;
}
// Backward moves between consecutive stops, in page coordinates: the next element's top is above the last one's, or level and further left.
function jumps(stops) {
  const out = [];
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1], b = stops[i];
    if (same(a, b)) continue;
    const up = a.t - b.t, left = a.l - b.l;
    if (up > 2 || (Math.abs(up) <= 2 && left > 2)) out.push({ from: a.role, to: b.role, name: b.name, up: near(up), left: near(left) });
  }
  return out;
}
const jumpText = (j) => `${j.from} -> ${j.to} (${j.name}): ${j.up > 2 ? `up ${j.up}px` : "level"}, ${j.left > 0 ? `left ${j.left}px` : `right ${-j.left}px`}`;

// Types a date into the field the user has just tabbed into. The order of its segments is learned from the field: ArrowUp changes the
// first segment only, and ArrowDown puts it back.
async function typeDate(h, iso) {
  const val = () => h.evaluate(`document.getElementById("date").value`);
  const before = await val();
  await key(h, "ArrowUp");
  const up = await val();
  await key(h, "ArrowDown");
  const [y0, m0] = before.split("-"), [y1, m1] = up.split("-");
  const first = y1 !== y0 ? "y" : m1 !== m0 ? "m" : "d";
  const [y, m, d] = iso.split("-");
  await typeText(h, { y: y + m + d, m: m + d + y, d: d + m + y }[first]);
  return { order: { y: "year first", m: "month-day-year", d: "day-month-year" }[first], value: await val() };
}
// A wait that reports instead of throwing: a page that never shows the text is a verdict, not a crash.
const waitText = (h, expr, ms = 3000) => h.waitFor(expr, ms).then(() => true, () => false);
const COUNT = `document.getElementById("match-count").textContent !== ""`;
async function typeLaw(h, text) {
  await typeText(h, text);
  await waitText(h, COUNT);
}
async function grantClipboard(h) {
  const origin = await h.evaluate("location.origin");
  const params = { origin, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] };
  try { await h.send("Browser.grantPermissions", params); } catch {
    const version = await (await fetch(`http://127.0.0.1:${h.cdp}/json/version`)).json();
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((ok, bad) => { ws.onopen = ok; ws.onerror = () => bad(new Error("browser WebSocket failed")); });
    await new Promise((ok, bad) => { ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id === 1) m.error ? bad(new Error(m.error.message)) : ok(); }; ws.send(JSON.stringify({ id: 1, method: "Browser.grantPermissions", params })); });
    ws.close();
  }
}

// ---------- journey 1: the lead user's lookup ----------
async function journey1(h) {
  await view(h, 1280, 900);
  await h.open("ok");
  await grantClipboard(h);
  const j = journey(h, "j1");
  const start = await here(h), load = await state(h);
  h.verdict("11k-j1-load", "a fresh page has nothing focused (no autofocus, UX spec) and the answer panel is hidden", [
    ...(start.role === "none" ? [] : [`focus is on ${start.name}`]), ...(load.shown ? ["the answer panel shows before any law is chosen"] : []),
  ]);

  // Tab to the law box and type CSRD: the list opens.
  await j.go("law", "first Tab");
  await shot(h, "j1-law-focus");
  await typeLaw(h, "CSRD");
  const list = await state(h);
  h.verdict("11k-j1-list", `typing CSRD opens the list: ${list.rows} rows (at most ${MATCH_MAX}), the first is ${CSRD.id}, count line "${list.count}"`, [
    ...(list.rows >= 1 && list.rows <= MATCH_MAX ? [] : [`${list.rows} rows`]),
    ...(list.first === CSRD.id ? [] : [`the first row is ${list.first}`]),
    ...(/^\d+ laws? match/.test(list.count) ? [] : [`count line "${list.count}"`]),
  ]);
  // Tab down the rows to the date field, Shift+Tab back to the first row.
  const rows = [];
  for (let i = 1; i <= list.rows; i++) rows.push(await j.go("match", `Tab to match row ${i}`));
  await shot(h, "j1-match-row-focus");
  const toDate = await j.go("date", "Tab from the last match row");
  h.verdict("11k-j1-list-order", `the ${list.rows} match rows are reached top to bottom (tops ${rows.map((r) => near(r.t)).join(", ")})`, rows.slice(1).map((r, i) => (r.t > rows[i].t ? null : `row ${i + 2} is not below row ${i + 1}`)).filter(Boolean));
  console.log(`  note: last match row -> date field: ${jumps([rows[rows.length - 1], toDate]).map(jumpText).join("; ") || "forward and down"}`);
  for (let i = list.rows; i >= 1; i--) await j.go("match", `Shift+Tab to match row ${i}`, true);
  // Enter on the first row: the list closes, focus goes to the law box.
  await key(h, "Enter");
  const picked = await here(h), after = await state(h);
  j.stops.push(picked);
  const title = JSON.parse(fs.readFileSync(h.data, "utf8")).entries.find((e) => e.id === CSRD.id).title;
  h.verdict("11k-j1-pick", `Enter on the first match row closes the list and focus returns to the law box (${picked.name}); the law box holds the title and the answer shows`, [
    ...(picked.role === "law" && ringOk(picked) ? [] : [`focus is on ${picked.role} ${picked.name}, ring ${ringOk(picked)}`]),
    ...(after.rows === 0 && after.countHidden && after.count === "" ? [] : [`list still there: rows ${after.rows}, count "${after.count}"`]),
    ...h.eqs([["law box", after.law, title], ["answer state", after.state, "plain"], ["answer shown", after.shown, true]]),
  ]);
  // The date, typed.
  await j.go("date", "Tab from the law box");
  const typed = await typeDate(h, "2025-06-01");
  const dated = await state(h);
  h.verdict("11k-j1-date", `the date typed with the keys (field order ${typed.order}) reads 2025-06-01 and the answer follows, in force since 2025-04-17`, [
    ...h.eqs([["field value", typed.value, "2025-06-01"], ["echo", dated.echo, "2025-06-01"], ["answer state", dated.state, "plain"], ["status line", dated.status, "Version in force on 2025-06-01"]]),
    ...(dated.since.includes("2025-04-17") ? [] : [`since line "${dated.since}"`]),
  ]);
  const out = j.take(await tab(h), "Tab out of the year segment");
  await shot(h, "j1-date-picker-focus");
  const example = out.role === "date" ? await j.through("date", "leaving the date field") : out;
  if (example.role !== "example") j.note(`after the date field focus is on ${example.role} ${example.name}, want the example button`);
  // The answer's link, then Copy citation by Space.
  await j.go("answer-link", "Tab from the example");
  const copy = await j.go("copy", "Tab from the answer link");
  await shot(h, "j1-copy-focus");
  await key(h, "Space");
  await waitText(h, `document.getElementById("citation-status").textContent !== ""`);
  const copied = await state(h), onCopy = await here(h);
  const clip = await h.evaluate(`navigator.clipboard.readText().catch((e) => "readText failed: " + e)`);
  h.verdict("11k-j1-copy", `Space on Copy citation puts the displayed line on the clipboard, shows "${copied.cite}", and focus stays on the button (${onCopy.name})`, [
    ...(copied.cite === "Copied" ? [] : [`confirmation "${copied.cite}"`]),
    ...(clip === copied.line ? [] : [`clipboard ${h.fmt(clip)} differs from the line ${h.fmt(copied.line)}`]),
    ...(same(onCopy, copy) && onCopy.role === "copy" && ringOk(onCopy) ? [] : [`focus is on ${onCopy.role} ${onCopy.name}, ring ${ringOk(onCopy)}`]),
  ]);
  await h.sleep(2300);
  const later = await state(h), still = await here(h);
  h.verdict("11k-j1-copy", "after 2 s the confirmation is gone and focus is still on Copy citation", [
    ...(later.cite === "" ? [] : [`confirmation "${later.cite}" after 2.3 s`]), ...(same(still, copy) ? [] : [`focus moved to ${still.role} ${still.name}`]),
  ]);

  // The rail: Tab to its rows, Space on the second, Enter on the third.
  const pick = async (row, how, want) => {
    await h.evaluate(`document.activeElement.__kb = 1`);
    const pre = await state(h), top0 = await h.evaluate(`document.activeElement.getBoundingClientRect().top`);
    await key(h, how);
    const now = await here(h), post = await state(h), kept = await h.evaluate(`document.activeElement.__kb === 1`);
    const top1 = await h.evaluate(`document.activeElement.getBoundingClientRect().top`);
    console.log(`  note: rail row ${want} by ${how}: scrollY ${near(pre.sy)} -> ${near(post.sy)}, row top ${near(top0)} -> ${near(top1)}, answer top ${near(pre.answerTop)} -> ${near(post.answerTop)}; focus stays on the same button ${kept}`);
    h.verdict("11k-j1-rail-pick", `${how} on the rail row ${want}: the date becomes ${want}, the selected row moves to it, and focus stays on the same button node`, [
      ...h.eqs([["field value", post.date, want], ["echo", post.echo, want], ["selected row", post.current.join(","), want]]),
      ...(kept && now.l === row.l && now.t === row.t ? [] : [`the focused button was replaced or focus moved to ${now.role} ${now.name}`]),
      ...ringProblems([now]),
    ]);
  };
  const r1 = await j.go("rail", "Tab from Copy citation");
  const r2 = await j.go("rail", "Tab to the second rail row");
  const railDates = await h.evaluate(`[...document.querySelectorAll("#rail-window li")].map((li) => li.dataset.date)`);
  h.verdict("11k-j1-rail-order", `the rail rows come top to bottom, newest first (${railDates.join(", ")}), and lie to the left of the answer (rail left ${near(r1.l)}px, Copy citation left ${near(copy.l)}px)`, [
    ...(JSON.stringify(railDates) === JSON.stringify(CSRD.versions) ? [] : [`rows ${railDates.join(", ")}, want ${CSRD.versions.join(", ")}`]),
    ...(r1.t < r2.t ? [] : [`rail row tops ${near(r1.t)}, ${near(r2.t)} do not go down the page`]),
    ...(r1.l < copy.l ? [] : [`the rail is not to the left of the answer (${near(r1.l)}px against ${near(copy.l)}px)`]),
  ]);
  console.log(`  note: answer to rail: Copy citation (left ${near(copy.l)}, top ${near(copy.t)}) -> first rail row (left ${near(r1.l)}, top ${near(r1.t)}): ${jumps([copy, r1]).map(jumpText).join("; ") || "no backward move"}; scrollY ${near(copy.sy)} -> ${near(r1.sy)}. Whether that disorients is for Varun.`);
  await shot(h, "j1-rail-row-focus");
  await pick(r2, "Space", CSRD.versions[1]);
  const r3 = await j.go("rail", "Tab to the third rail row");
  await pick(r3, "Enter", CSRD.versions[2]);
  // The footer, then the Tab after the last link.
  const foot = [];
  for (let i = 1; i <= FOOTER; i++) foot.push(await j.go("footer", `Tab to footer link ${i}`));
  const end = j.take(await tab(h), "the Tab after the last footer link");
  h.verdict("11k-j1-footer", `after the rail come the ${FOOTER} footer links (Browse by place holds no stop) and the Tab after the last goes to ${end.role === "law" ? "the law box" : end.role}`, [
    ...(foot.every((s) => s.role === "footer") ? [] : [`the ${FOOTER} stops after the rail are ${foot.map((s) => s.role).join(", ")}`]),
    ...(end.role === "law" || end.role === "none" ? [] : [`it went to ${end.role} ${end.name}`]),
  ]);
  h.verdict("11k-j1-focus", `every stop of journey 1 (${j.stops.length}) shows an outline and lies in the window (the calendar-picker stop is judged by eye)`, [...ringProblems(j.stops, pickerStop), ...trapProblems(j.stops)]);
  h.verdict("11k-j1-steps", "journey 1 by keys lands on the role each step names (see the trace lines)", j.problems);
}

// Journey 1, the other branch: the example button.
async function journey1Example(h) {
  await view(h, 1280, 900);
  await h.open("ok");
  const j = journey(h, "j1e");
  await j.go("law", "first Tab");
  await j.go("date", "Tab to the date field");
  const example = await j.through("date", "leaving the date field");
  if (example.role !== "example") j.note(`after the date field focus is on ${example.role} ${example.name}`);
  await key(h, "Enter");
  const s = await state(h), on = await here(h);
  h.verdict("11k-j1-example", `Enter on the example fills the law box and the date and shows the answer; focus stays on the button (${on.name})`, [
    ...h.eqs([["date", s.date, "2025-06-01"], ["answer state", s.state, "plain"]]),
    ...(s.law.includes("(CSRD)") ? [] : [`law box "${s.law}"`]),
    ...(s.since.includes("2025-04-17") ? [] : [`since line "${s.since}"`]),
    ...(same(on, example) && ringOk(on) ? [] : [`focus is on ${on.role} ${on.name}, ring ${ringOk(on)}`]),
  ]);
  await j.go("answer-link", "Tab from the example");
  h.verdict("11k-j1-example", "from the example the next Tab reaches the answer's link with a ring", [...j.problems, ...ringProblems(j.stops.slice(-1))]);
}

// ---------- journey 2: the corpus cannot answer ----------
async function journey2(h) {
  const all = [];
  const asked = async (tag, c, withDate) => {
    await view(h, 1280, 900);
    await h.open("ok");
    const j = journey(h, tag, all);
    await j.go("law", "first Tab");
    await typeLaw(h, c.name);
    const first = (await state(h)).first;
    if (c.id && first !== c.id) j.note(`the first match row for "${c.name}" is ${first}, want ${c.id}`);
    await key(h, "Enter"); // in the law box: the first row, or the "no match" answer
    await j.go("date", "Tab from the law box");
    if (withDate) {
      const typed = await typeDate(h, c.date);
      if (typed.value !== c.date) j.note(`the date field holds ${typed.value} after typing ${c.date}`);
    }
    const next = await j.through("date", "leaving the date field");
    if (next.role !== "example") j.note(`after the date field focus is on ${next.role}`);
    return j;
  };

  let j = await asked("j2-link", CASES.link, true);
  const sl = await state(h);
  const link = await j.go("answer-link", "Tab from the example");
  const next = await tab(h);
  all.push(next);
  h.verdict("11k-j2-link", `link only (${CASES.link.id} on ${CASES.link.date}): the way on is one official link (${link.name}); after it Tab goes to ${next.role}`, [
    ...(sl.shown && sl.state !== "plain" ? [] : [`panel shown ${sl.shown}, state ${sl.state}`]),
    ...(sl.text.includes("Official source") ? [] : ["no Official source text in the panel"]),
    ...(next.role === "footer" ? [] : [`next stop is ${next.role} ${next.name}, want the first footer link (no copy button, no rail)`]), ...j.problems,
  ]);
  await shot(h, "j2-link-focus");

  j = await asked("j2-before", CASES.before, true);
  const sb = await state(h);
  const offer = await j.go("offer", "Tab from the example");
  const src = await j.go("answer-link", "Tab from the offer");
  await j.go("offer", "Shift+Tab back to the offer", true);
  await key(h, "Enter");
  const onDate = await here(h), sd = await state(h);
  all.push(onDate);
  h.verdict("11k-j2-before", `before the first version (${CASES.before.id} on ${CASES.before.date}): the offer comes before the official link, Enter on it sets ${CASES.before.first}, focus lands on the date field (${onDate.name}) and the answer is in force (commit ${sd.commit && sd.commit.slice(0, 9)})`, [
    ...(sb.shown && sb.state !== "plain" ? [] : [`panel shown ${sb.shown}, state ${sb.state}`]),
    ...(offer.name.includes(`Show ${CASES.before.first}`) ? [] : [`the offer reads ${offer.name}`]),
    ...(offer.t <= src.t ? [] : ["the offer lies below the official link on the page"]),
    ...h.eqs([["field value", sd.date, CASES.before.first], ["answer state", sd.state, "plain"], ["focused role", onDate.role, "date"]]),
    ...(sd.commit && sd.commit.startsWith(CASES.before.commit) ? [] : [`commit ${sd.commit}, want ${CASES.before.commit}...`]), ...j.problems,
  ]);

  j = await asked("j2-repealed", CASES.repealed, true);
  const sr = await state(h);
  await j.go("answer-link", "Tab from the example");
  h.verdict("11k-j2-repealed", `repealed (${CASES.repealed.id} on ${CASES.repealed.date}): status "${sr.status}" and the official link is the next stop`, [
    ...h.eqs([["status line", sr.status, CASES.repealed.status]]), ...j.problems,
  ]);

  j = await asked("j2-none", CASES.none, false);
  const sn = await state(h);
  await j.go("answer-browse", "Tab from the example");
  await shot(h, "j2-none-browse-link-focus");
  await key(h, "Enter");
  const landed = await here(h), sa = await state(h);
  const top = await h.evaluate(`document.getElementById("browse-by-place").getBoundingClientRect().top`);
  const after = await tab(h);
  all.push(landed, after);
  console.log(`  note: Enter on the Browse by place link: focus ${landed.name} (${landed.role}), scrollY ${near(sn.sy)} -> ${near(sa.sy)}, section top ${near(top)}px from the window top, next Tab goes to ${after.role} ${after.name}`);
  h.verdict("11k-j2-none", `no match ("${CASES.none.name}"): the panel says so, the Browse by place link is reachable by keys, and Enter takes the same tab to #browse-by-place (section ${near(top)}px from the window top, focus on ${landed.role}, the next Tab goes to ${after.role})`, [
    ...(sn.shown && sn.state !== "plain" ? [] : [`panel shown ${sn.shown}, state ${sn.state}`]),
    ...(sn.text.includes("No law in the corpus matches") ? [] : ["the panel does not say that no law matches"]),
    ...h.eqs([["location.hash", sa.hash, "#browse-by-place"], ["the stop after the link", after.role, "footer"]]),
    ...(top >= -1 && top < 900 ? [] : [`the section is ${near(top)}px from the top of a 900px window`]), ...j.problems,
  ]);
  h.verdict("11k-j2-focus", `every stop of the four journey 2 cases (${all.length}) shows an outline in the window, and no key press leaves focus where it was`, [
    ...ringProblems(all, (s) => pickerStop(s) || s === landed), ...trapProblems(all),
  ]);
}

// ---------- the whole page in order ----------
// From the focused element, Tab (or Shift+Tab) until focus reaches the law box again or leaves the page. `stopAt` ends the walk on a stop.
async function walk(h, { shift = false, max = 600, stopAt = null } = {}) {
  const stops = [];
  for (let i = 0; i < max; i++) {
    const s = await tab(h, shift);
    if (s.role === "none") return { stops, end: "focus left the page" };
    if (s.role === "law") return { stops: shift ? [...stops, s] : stops, end: shift ? "reached the law box" : "wrapped to the law box" };
    stops.push(s);
    if (stopAt && stopAt(s)) return { stops, end: "stopped" };
  }
  return { stops, end: `no end within ${max} presses` };
}
const keyOf = (s) => s.name + "@" + s.l + "," + s.t;

// The list open over an answer with a long rail (kz-advertising-law): the whole spec order at one width, rail expanded or not.
async function fullWalk(h, width, expand) {
  const tag = width > 768 ? "wide" : "narrow";
  await view(h, width, 900);
  await h.open("ok");
  const j = journey(h, "w-" + tag);
  await j.go("law", "first Tab");
  await typeLaw(h, KZ.id);
  await j.go("match", "Tab into the list");
  if ((await state(h)).first !== KZ.id) j.note(`the first match row for "${KZ.id}" is ${(await state(h)).first}`);
  await key(h, "Space"); // choose the law with Space
  const law = await here(h), picked = await state(h);
  h.verdict("11k-space-pick-" + tag, `${width}px: Space on a match row closes the list and returns focus to the law box (${law.name}); the answer for ${KZ.id} shows`, [
    ...(law.role === "law" && ringOk(law) ? [] : [`focus is on ${law.role} ${law.name}, ring ${ringOk(law)}`]),
    ...(picked.rows === 0 && picked.countHidden ? [] : [`list still there: rows ${picked.rows}`]), ...h.eqs([["answer state", picked.state, "plain"]]),
  ]);
  await key(h, "Backspace"); // one character off the title opens the list again, the answer stays
  await waitText(h, COUNT);
  const open = await state(h);
  if (!open.shown || open.state !== "plain" || !open.rows) j.note(`list not open over the answer: answer shown ${open.shown}, state ${open.state}, rows ${open.rows}`);

  const f1 = await walk(h, { stopAt: (s) => s.role === "show-all" });
  const forward = [...f1.stops];
  let end = f1.end;
  if (expand) {
    const sum = f1.stops[f1.stops.length - 1];
    if (!sum || sum.role !== "show-all") j.note(`no "Show all N versions" stop reached`);
    else {
      await shot(h, "w-summary-focus");
      await key(h, "Enter");
      await h.sleep(80); // the toggle event is queued, so a handler that moves focus has run by now
      const on = await here(h);
      const d = await h.evaluate(`({ open: document.querySelector("#rail details").open, rows: document.querySelectorAll("#rail-all li").length, buttons: document.querySelectorAll("#rail-all button.rail-row").length, label: document.querySelector("#rail summary").textContent })`);
      h.verdict("11k-expand", `Enter on "${d.label}" opens all ${d.rows} rows and focus stays on the summary (scrollY ${near(sum.sy)} -> ${near(on.sy)})`, [
        ...h.eqs([["summary label", d.label, `Show all ${KZ.versions} versions`], ["details open", d.open, true], ["rows in the full list", d.rows, KZ.versions]]),
        ...(same(on, sum) ? [] : [`focus is on ${on.role} ${on.name}, want the same summary`]), ...ringProblems([on]),
      ]);
      const f2 = await walk(h);
      forward.push(...f2.stops);
      end = f2.end;
      const reached = f2.stops.filter((s) => s.inAll).length;
      h.verdict("11k-expand", `after the expand Tab reaches each of the ${d.buttons} rows of the full list, then the ${FOOTER} footer links (${f2.end})`, [
        ...(reached === d.buttons ? [] : [`${reached} stops inside the full list, the page has ${d.buttons} buttons there`]),
        ...(f2.stops.filter((s) => s.role === "footer").length === FOOTER ? [] : [`${f2.stops.filter((s) => s.role === "footer").length} footer stops`]),
      ]);
      // Back by Shift+Tab to the summary; Space closes the list; on to the law box.
      const r1 = await walk(h, { shift: true, stopAt: (s) => s.role === "show-all" });
      const sum2 = r1.stops[r1.stops.length - 1];
      await key(h, "Space");
      await h.sleep(80);
      const closed = await here(h), isOpen = await h.evaluate(`document.querySelector("#rail details").open`);
      h.verdict("11k-expand", "Space on the summary closes the list and focus stays on it", [
        ...(sum2 && sum2.role === "show-all" ? [] : ["the reverse walk did not stop on the summary"]),
        ...(isOpen === false ? [] : ["the details are still open"]), ...(sum2 && same(closed, sum2) ? [] : [`focus is on ${closed.role} ${closed.name}`]),
      ]);
      const r2 = await walk(h, { shift: true });
      const back = [...r1.stops, ...r2.stops].map(keyOf), want = [...forward.map(keyOf).reverse(), keyOf(law)];
      h.verdict("11k-expand", `Shift+Tab from the law box goes back over the same ${want.length - 1} stops in reverse (${r2.end})`, [
        ...(back.length === want.length ? [] : [`${back.length} stops back, ${want.length} expected`]),
        ...want.map((w, i) => (back[i] === w ? null : `stop ${i}: back ${back[i]}, forward ${w}`)).filter(Boolean).slice(0, 3),
      ]);
    }
  } else {
    const rest = await walk(h);
    forward.push(...rest.stops);
    end = rest.end;
  }
  const stops = [law, ...forward];
  const count = (r) => stops.filter((s) => s.role === r).length;
  const rail = stops.filter((s) => s.role === "rail" && !s.inAll).length;
  const wantRuns = expand ? [...SPEC_ORDER.slice(0, 8), "rail", "footer"] : SPEC_ORDER;
  h.verdict("11k-order-" + tag, `${width}px: Tab order ${runs(stops).join(" > ")} (spec: ${wantRuns.join(" > ")}); ${count("match")} match rows, ${count("date")} date stops, ${rail} rail rows${expand ? `, ${stops.filter((s) => s.inAll).length} in the full list` : ""}, ${count("footer")} footer links, ${count("browse")} Browse by place stops; ends: ${end}`, [
    ...(JSON.stringify(runs(stops)) === JSON.stringify(wantRuns) ? [] : [`order ${runs(stops).join(" > ")}`]),
    ...(rail === RAIL_WINDOW ? [] : [`${rail} rail rows in the window, want ${RAIL_WINDOW}`]),
    ...(count("footer") === FOOTER ? [] : [`${count("footer")} footer stops`]),
    ...(count("match") >= 1 && count("match") <= MATCH_MAX ? [] : [`${count("match")} match stops`]), ...j.problems, ...trapProblems(stops),
  ]);
  h.verdict("11k-ring-" + tag, `${width}px: all ${stops.length} stops of the full walk show an outline and lie in the window (the calendar-picker stop is judged by eye)`, ringProblems(stops, pickerStop));
  const back = jumps(stops);
  const allowed = (x) => width > 768 && x.to === "rail" && (x.from === "copy" || x.from === "answer-link");
  h.verdict("11k-visual-" + tag, `${width}px: the Tab order moves forward and down the page, except the answer to rail move the spec accepts`, back.filter((x) => !allowed(x)).map((x) => "backward: " + jumpText(x)));
  console.log(`  note: ${width}px backward moves: ${back.length ? back.map(jumpText).join("; ") : "none"}`);
}

export async function run(h) {
  fs.mkdirSync(SHOTS, { recursive: true });
  const section = async (name, fn) => { try { await fn(); } catch (e) { h.check("11k-" + name, "section ran to the end", false, "threw: " + e.message); } };
  try {
    await section("j1", () => journey1(h));
    await section("j1-example", () => journey1Example(h));
    await section("j2", () => journey2(h));
    await section("walk-wide", () => fullWalk(h, 1280, true));
    await section("walk-narrow", () => fullWalk(h, 390, false));
  } finally {
    await h.send("Browser.resetPermissions", {}).catch(() => {});
  }
  console.log(`  note: Safari, Firefox, VoiceOver: not run, by hand. Screenshots: ${SHOTS}`);
}
