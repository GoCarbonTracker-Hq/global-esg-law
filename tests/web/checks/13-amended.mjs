// Checks for GEL-34 story 13: the "Amended by" line in the answer panel. tests/web/check.mjs imports this file after the 12
// story 04 criteria. Tags start with "13". Needs amended-expected.json beside expected.json (python3.13 tests/web/amended_expected.py).
//
// The expected side never comes from web/*.js: the pairs come from register/*/scope.json, the group of each amender on each date
// from one tools/query.py lookup (both written to amended-expected.json by amended_expected.py), and the sentences, headings,
// slot names and fixture shapes are written out here from the story.
//
// What it proves (acceptance criteria 1 to 8 and 10 of the story; 9 is tests/test_web_amended.py):
//   13-index      AC1  after the first answer the page's index holds, for each target, the amenders the scope files name, and the pair count
//   13-sweep      AC2, 3, 4, 5  every target on eight dates, and every other law on one, draws the groups lookup gives, in the right slot
//   13-csrd       AC2  the three CSRD dates by name
//   13-zor        AC3  hr-zor-2015 on five dates, the order within a group, no line on 2025-06-01, a date change with focus unchanged
//   13-pl, 13-lksg, 13-cy, 13-af   AC4, AC5  the named laws, no "None", no "undefined"
//   13-fix-*      AC6  one fixture load per case: six in force, another place, self, dangling, repeated, mutual, no url, repealed,
//                      no amends_ids, publication date; each with nothing thrown and nothing on console.error
//   13-once       AC7  three laws and date changes: one index build, an unchanged group keeps its nodes, no request after the load
//   13-a11y-*     AC8  the Chrome-scriptable parts: keyboard order and focus ring, 320 px at 100% and 200% text, forced colours, the
//                      309-character title, the hidden sentence
//   13-clear-*    AC10 both slots emptied by an unknown-law address and a no-match answer, the line moves between slots, draws again
// What it does NOT prove: Lighthouse, VoiceOver with Safari, NVDA, JAWS, Safari and Firefox (by hand later).
import fs from "node:fs";
import path from "node:path";

const q = JSON.stringify;
const CSRD = "eu-csrd-2022-2464";
const ZOR = "hr-zor-2015";
const NONE = "No amending law is recorded in the register for this law.";
const INTRO = "Laws in the register that amend this one, as of the date asked.";
const SLOTS = { plain: "slot-after-link", other: "slot-after-interim" };
const HEAD = { "in-force": (d) => `In force on ${d}`, "not-yet": (d) => `Not yet in force on ${d}`, "link-only": () => "Link only, date not known" };
const ORDER = ["in-force", "not-yet", "link-only"];
const CAP = 5;

// The page-side reader: what the line holds now, by structure (h3, h4, ul, details), not by class name.
const READER = `window.__amendedRead = () => {
  const link = document.getElementById("slot-after-link"), interim = document.getElementById("slot-after-interim");
  const holder = link && link.childNodes.length ? link : interim && interim.childNodes.length ? interim : null;
  const out = {
    link: link ? { children: link.childNodes.length, text: link.textContent } : null,
    interim: interim ? { children: interim.childNodes.length, text: interim.textContent } : null,
    state: document.getElementById("answer-panel").getAttribute("data-state"),
    where: holder ? holder.id : null, label: null, intro: null, groups: [], none: null, h3: 0, h4: 0,
  };
  if (!holder) return out;
  const items = (ul) => [...ul.children].map((li) => {
    const first = li.firstElementChild;
    return { tag: first.tagName, name: first.textContent, href: first.getAttribute("href"), when: li.textContent.slice(first.textContent.length).trim() };
  });
  const h3 = holder.querySelector("h3");
  out.h3 = holder.querySelectorAll("h3").length;
  out.h4 = holder.querySelectorAll("h4").length;
  if (!h3) { out.none = holder.textContent; return out; }
  out.label = h3.textContent;
  out.intro = h3.nextElementSibling ? h3.nextElementSibling.textContent : null;
  for (const h4 of holder.querySelectorAll("h4")) {
    const box = h4.parentElement, lists = box.querySelectorAll(":scope > ul"), more = box.querySelector(":scope > details");
    out.groups.push({
      head: h4.textContent, list: lists.length ? items(lists[0]) : [], lists: lists.length,
      summary: more ? more.querySelector("summary").textContent : null, rest: more ? items(more.querySelector("ul")) : [], open: more ? more.open : null,
    });
  }
  return out;
}`;

// Recorder for what the harness does not count: console.error and uncaught errors.
const RECORDER = `(() => {
  window.__errs = [];
  const original = console.error;
  console.error = (...args) => { window.__errs.push(args.map(String).join(" ")); original.apply(console, args); };
  window.addEventListener("error", (e) => window.__errs.push("uncaught: " + e.message));
  window.addEventListener("unhandledrejection", (e) => window.__errs.push("unhandled rejection: " + e.reason));
})()`;

const empty = (S, label) => [
  ...(S.link.children === 0 && S.link.text === "" ? [] : [`${label}: #slot-after-link holds ${S.link.children} nodes, text ${q(S.link.text.slice(0, 60))}`]),
  ...(S.interim.children === 0 && S.interim.text === "" ? [] : [`${label}: #slot-after-interim holds ${S.interim.children} nodes, text ${q(S.interim.text.slice(0, 60))}`]),
];

// What one group should show: the first 5 in the list, the rest behind a details "and N more".
const shownItems = (items) => items.slice(0, CAP);
const wantItem = (i) => ({ tag: i.url ? "A" : "SPAN", name: i.title || i.id, href: i.url || null, when: i.when });
const itemProblems = (got, want, label) => {
  const problems = [];
  if (got.length !== want.length) problems.push(`${label}: ${got.length} items ${q(got.map((g) => g.name))}, want ${want.length} ${q(want.map((w) => w.name))}`);
  for (let k = 0; k < Math.min(got.length, want.length); k++) {
    const g = got[k], w = want[k];
    if (g.tag !== w.tag || g.name !== w.name || g.href !== w.href || g.when !== w.when) {
      problems.push(`${label} item ${k + 1}: got ${q(g)}, want ${q(w)}`);
      break;
    }
  }
  return problems;
};

// Compares what the page holds with the expected groups (an object of the three lists), the date and the state the answer is in.
// `recorded` is true when some entry names this law. Returns the problems.
function lineProblems(label, S, groups, recorded, date, plain) {
  const here = plain ? SLOTS.plain : SLOTS.other;
  const filled = ORDER.filter((k) => groups[k].length);
  const problems = [];
  if (S.link === null || S.interim === null) return [`${label}: a slot is missing from the page`];
  if (!filled.length) {
    if (recorded) return [...empty(S, label)]; // every recorded amender is repealed that day: no line, no sentence
    if (S.where !== here || S.none !== NONE || S.h3 !== 0) problems.push(`${label}: want the sentence ${q(NONE)} in #${here}, got slot ${S.where}, text ${q(S.none)}, ${S.h3} h3`);
    const other = plain ? S.interim : S.link;
    if (other.children || other.text) problems.push(`${label}: the other slot is not empty: ${q(other.text.slice(0, 60))}`);
    return problems;
  }
  if (S.where !== here) problems.push(`${label}: the line is in ${S.where}, want ${here}`);
  const other = plain ? S.interim : S.link;
  if (other.children || other.text) problems.push(`${label}: the other slot is not empty: ${q(other.text.slice(0, 60))}`);
  if (S.label !== "Amended by" || S.h3 !== 1) problems.push(`${label}: label ${q(S.label)} (${S.h3} h3), want one "Amended by"`);
  if (S.intro !== INTRO) problems.push(`${label}: sentence ${q(S.intro)}, want ${q(INTRO)}`);
  if (S.groups.length !== filled.length) {
    problems.push(`${label}: headings ${q(S.groups.map((g) => g.head))}, want ${q(filled.map((k) => HEAD[k](date)))}`);
    return problems;
  }
  filled.forEach((key, n) => {
    const g = S.groups[n], items = groups[key];
    if (g.head !== HEAD[key](date)) problems.push(`${label}: heading ${n + 1} is ${q(g.head)}, want ${q(HEAD[key](date))}`);
    problems.push(...itemProblems(g.list, shownItems(items).map(wantItem), `${label}, ${key}`));
    if (items.length > CAP) {
      if (g.summary !== `and ${items.length - CAP} more`) problems.push(`${label}, ${key}: summary ${q(g.summary)}, want ${q(`and ${items.length - CAP} more`)}`);
      problems.push(...itemProblems(g.rest, items.slice(CAP).map(wantItem), `${label}, ${key} (more)`));
    } else if (g.summary !== null || g.rest.length) problems.push(`${label}, ${key}: a details shows with ${items.length} items`);
  });
  const words = S.groups.flatMap((g) => [g.head, g.summary || "", ...[...g.list, ...g.rest].map((i) => i.when)]).join(" | "); // titles are the law's own words, left out
  if (/\b(None|undefined|null|NaN)\b/.test(words)) problems.push(`${label}: the headings or dates hold None, undefined, null or NaN: ${q(words)}`);
  return problems;
}

export async function run(h) {
  const A = JSON.parse(fs.readFileSync(path.join(path.dirname(h.expected), "amended-expected.json"), "utf8"));
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  const baseData = JSON.parse(fs.readFileSync(h.data, "utf8"));
  const table = (id, date) => A.table[id][date];
  const section = async (tag, fn) => {
    try { await fn(); } catch (e) { h.check(tag, "check ran to the end", false, "threw: " + e.message); }
  };
  const fresh = async (variant = "ok") => {
    await h.open(variant);
    await h.evaluate(READER);
    await h.evaluate(RECORDER);
  };
  const show = (id, date) => h.evaluate(`(GEL.showAnswer(${q(id)}, ${q(date)}), __amendedRead())`);
  const errors = async () => (await h.evaluate("window.__errs")) || [];
  const noErrors = async (label) => (await errors()).map((e) => `${label}: ${e}`);
  const recorded = (id) => Object.hasOwn(A.inverse, id);

  await section("13-index", async () => {
    await fresh();
    const before = await h.evaluate("GEL.amendedBy.index");
    await h.evaluate(`GEL.showAnswer(${q(CSRD)}, "2026-11-17")`);
    const got = await h.evaluate(`Object.fromEntries([...GEL.amendedBy.index].map(([target, list]) => [target, list.map((e) => e.id).sort()]))`);
    const problems = [...(before === null ? [] : ["the index was built before the first answer"])];
    const wantTargets = Object.keys(A.inverse).sort();
    const gotTargets = Object.keys(got).sort();
    if (gotTargets.join("|") !== wantTargets.join("|")) problems.push(`targets: page ${gotTargets.length}, scope files ${wantTargets.length}`);
    let pairs = 0;
    for (const t of wantTargets) {
      pairs += (got[t] || []).length;
      if ((got[t] || []).join("|") !== A.inverse[t].join("|")) problems.push(`${t}: page ${q(got[t])}, scope files ${q(A.inverse[t])}`);
    }
    if (pairs !== A.pairs) problems.push(`pairs: page ${pairs}, scope files ${A.pairs}`);
    console.log(`  13-index: pairs ${pairs}, targets ${gotTargets.length} (scope files: ${A.pairs} pairs, ${A.targets} targets, ${A.amenders} amending entries, ${A.stored} stored, ${A.link_only} link only, ${A.link_only_dated} of them with a register date, skipped ${q(A.skipped)})`);
    problems.push(...(A.targets > 0 && A.pairs > 0 ? [] : ["the expected file holds no pair"]));
    problems.push(...(await noErrors("index")));
    h.verdict("13-index", "the page's index equals the inverse of amends_ids read straight from register/*/scope.json: same targets, same amenders, same pair count", problems);
  });

  await section("13-sweep", async () => {
    await fresh();
    await h.evaluate(`history.replaceState = () => {}`); // 1000 answers in a second would trip Chrome's navigation throttle
    for (const date of A.dates) {
      const ids = Object.keys(A.inverse);
      const out = await h.evaluate(`(() => { const out = {}; for (const id of ${q(ids)}) { GEL.showAnswer(id, ${q(date)}); out[id] = __amendedRead(); } return out; })()`);
      const problems = [];
      for (const id of ids) problems.push(...lineProblems(`${id} on ${date}`, out[id], table(id, date), true, date, out[id].state === "plain"));
      const slots = new Set(ids.map((id) => out[id].where));
      h.verdict("13-sweep", `${ids.length} laws that something amends, on ${date}: each shows the groups, dates in words and order lookup gives, in #slot-after-link for a plain answer and #slot-after-interim for the others (slots seen: ${[...slots].join(", ")})`, problems.slice(0, 6).concat(problems.length > 6 ? [`... ${problems.length} problems in all`] : []));
    }
    const others = await h.evaluate(`(() => { const out = {}; for (const e of GEL.data.entries) if (!GEL.amendedBy.index.has(e.id)) { GEL.showAnswer(e.id, "2026-11-17"); out[e.id] = __amendedRead(); } return out; })()`);
    const problems = [];
    const none = Object.keys(others);
    for (const id of none) problems.push(...lineProblems(`${id} on 2026-11-17`, others[id], { "in-force": [], "not-yet": [], "link-only": [] }, false, "2026-11-17", others[id].state === "plain"));
    if (none.length + Object.keys(A.inverse).length !== A.entries) problems.push(`${none.length} laws without an amender plus ${Object.keys(A.inverse).length} with one is not the ${A.entries} entries in the scope files`);
    h.verdict("13-sweep", `the other ${none.length} laws on 2026-11-17 show the one sentence ${q(NONE)} and no label, in the slot of their variant`, [...problems.slice(0, 6), ...(await noErrors("sweep"))]);
  });

  await section("13-csrd", async () => {
    await fresh();
    const a794 = table(CSRD, "2025-06-01")["in-force"][0], a470 = table(CSRD, "2025-06-01")["not-yet"][0];
    const probes = [
      ["2025-04-16", [], [a470.id, a794.id]],
      ["2025-06-01", [a794.id], [a470.id]],
      ["2026-11-17", [a470.id, a794.id], []],
    ];
    for (const [date, inForce, notYet] of probes) {
      const S = await show(CSRD, date);
      const problems = [
        ...h.eqs([
          ["state", S.state, "plain"], ["headings", S.groups.map((g) => g.head).join("|"), [inForce.length ? HEAD["in-force"](date) : null, notYet.length ? HEAD["not-yet"](date) : null].filter(Boolean).join("|")],
        ]),
      ];
      const byHead = (head) => (S.groups.find((g) => g.head === head) || { list: [] }).list.map((i) => i.href);
      const url = (id) => [a794, a470].find((i) => i.id === id).url;
      problems.push(...h.eqs([
        ["in-force links", byHead(HEAD["in-force"](date)).join(" "), inForce.map(url).join(" ")],
        ["not-yet links", byHead(HEAD["not-yet"](date)).join(" "), notYet.map(url).join(" ")],
      ]));
      const whens = S.groups.flatMap((g) => g.list.map((i) => i.when));
      const wantWhens = date === "2025-06-01" ? ["in force since 2025-04-17", "in force from 2026-03-18"] : date === "2026-11-17" ? ["in force since 2026-03-18", "in force since 2025-04-17"] : ["in force from 2026-03-18", "in force from 2025-04-17"];
      problems.push(...h.eqs([["dates in words", whens.join("|"), wantWhens.join("|")], ["where", S.where, SLOTS.plain]]));
      problems.push(...lineProblems("CSRD on " + date, S, table(CSRD, date), true, date, true));
      h.verdict("13-csrd", `CSRD on ${date}: ${date === "2025-04-16" ? "both directives under Not yet in force and no In force group" : date === "2025-06-01" ? "2025/794 in force since 2025-04-17, 2026/470 not yet (from 2026-03-18)" : "both directives in force"}`, problems);
    }
  });

  await section("13-zor", async () => {
    await fresh();
    const order = ["hr-zor-2015-izm-82-23", "hr-zor-2015-izm-42-20", "hr-zor-2015-izm-116-18", "hr-zor-2015-izm-120-16"];
    const names = (date, key) => table(ZOR, date)[key].map((i) => i.id);
    const probes = [
      ["2016-06-01", { "not-yet": order }], ["2018-01-01", { "in-force": [order[3]], "not-yet": order.slice(0, 3) }],
      ["2021-01-01", { "in-force": order.slice(1), "not-yet": [order[0]] }], ["2024-01-01", { "in-force": order }], ["2025-06-01", {}],
    ];
    for (const [date, want] of probes) {
      const S = await show(ZOR, date);
      const problems = [];
      for (const key of ORDER) problems.push(...h.eqs([[`${key} ids on ${date}`, names(date, key).join(" "), (want[key] || []).join(" ")]]));
      problems.push(...lineProblems("hr-zor-2015 on " + date, S, table(ZOR, date), true, date, S.state === "plain"));
      if (date === "2025-06-01") problems.push(...empty(S, "2025-06-01 (all four repealed)"), ...(S.groups.length ? ["groups shown on 2025-06-01"] : []));
      h.verdict("13-zor", `hr-zor-2015 on ${date}: ${date === "2025-06-01" ? "all four amenders repealed, so no line, no None and not the no-amender sentence" : "the groups and the order within a group the story names"}`, problems);
    }
    // a date change redraws with focus unchanged
    await h.evaluate(`GEL.choose(${q(ZOR)}); GEL.setDate("2024-01-01"); document.getElementById("date").focus()`);
    const before = await h.evaluate(`({ id: document.activeElement.id, tag: document.activeElement.tagName })`);
    const first = await h.evaluate("__amendedRead()");
    await h.evaluate(`GEL.setDate("2018-01-01")`);
    const after = await h.evaluate(`({ id: document.activeElement.id, tag: document.activeElement.tagName, read: __amendedRead() })`);
    h.verdict("13-zor", "changing the date from 2024-01-01 to 2018-01-01 redraws the groups (four in force, then one in force and three not yet) and focus stays on the date field", [
      ...h.eqs([["focus before", before.id, "date"], ["focus after", after.id, "date"], ["groups before", first.groups.map((g) => g.list.length).join(","), "4"],
        ["groups after", after.read.groups.map((g) => g.list.length).join(","), "1,3"]]),
      ...lineProblems("2018-01-01 after the change", after.read, table(ZOR, "2018-01-01"), true, "2018-01-01", true),
    ]);
  });

  await section("13-pl", async () => {
    await fresh();
    for (const [date, word] of [["2025-06-01", "not-yet"], ["2025-09-01", "in-force"]]) {
      const S = await show("pl-csrd-act-2024", date);
      const item = (S.groups[0] || { list: [] }).list[0] || {};
      h.verdict("13-pl", `pl-csrd-act-2024 on ${date}: pl-csrd-act-2025 is ${word === "not-yet" ? "not yet in force, from 2025-08-12" : "in force since 2025-08-12"}`, [
        ...h.eqs([["groups", S.groups.length, 1], ["heading", S.groups[0] && S.groups[0].head, HEAD[word](date)], ["words", item.when, word === "not-yet" ? "in force from 2025-08-12" : "in force since 2025-08-12"]]),
        ...lineProblems("pl on " + date, S, table("pl-csrd-act-2024", date), true, date, S.state === "plain"),
      ]);
    }
  });

  await section("13-lksg", async () => {
    await fresh();
    const S = await show("de-lksg", "2026-11-17");
    const text = S.link.text + S.interim.text;
    h.verdict("13-lksg", "de-lksg (stored, named by no entry): no label, no list, no None, and the sentence \"No amending law is recorded in the register for this law.\" where the line would be", [
      ...h.eqs([["state", S.state, "plain"], ["slot", S.where, SLOTS.plain], ["sentence", S.none, NONE], ["h3", S.h3, 0], ["h4", S.h4, 0], ["slot text", text, NONE]]),
      ...(/None/.test(text) ? ["the slot holds None"] : []), ...(await noErrors("de-lksg")),
    ]);
  });

  await section("13-cy", async () => {
    await fresh();
    const S = await show("cy-ets-law-2011", "2026-11-17");
    const names = (S.groups[0] || { list: [] }).list;
    h.verdict("13-cy", "cy-ets-law-2011 (link only): its three amenders are under \"Link only, date not known\", newest register date first, each with its register date", [
      ...h.eqs([["state", S.state, "interim"], ["slot", S.where, SLOTS.other], ["groups", S.groups.length, 1], ["heading", S.groups[0] && S.groups[0].head, "Link only, date not known"],
        ["words", names.map((i) => i.when).join("|"), "register date 2025-12-09|register date 2025-07-25|register date 2024-07-26"]]),
      ...lineProblems("cy-ets-law-2011", S, table("cy-ets-law-2011", "2026-11-17"), true, "2026-11-17", false),
      ...h.eqs([["amender titles in order", names.map((i) => i.name).join("|"), ["cy-ets-amendment-2-2025", "cy-ets-amendment-2025", "cy-ets-amendment-2024"].map((id) => baseData.entries.find((e) => e.id === id).title).join("|")]]),
    ]);
  });

  await section("13-af", async () => {
    await fresh();
    const S = await show("af-air-pollution-regulation", "2026-11-17");
    const item = (S.groups[0] || { list: [] }).list[0] || {};
    h.verdict("13-af", "af-air-pollution-regulation: its amender reads \"link only\" with no date and no \"undefined\"", [
      ...h.eqs([["state", S.state, "interim"], ["words", item.when, "link only"], ["heading", S.groups[0] && S.groups[0].head, "Link only, date not known"], ["link", item.tag, "A"]]),
      ...(/undefined/.test(JSON.stringify(S)) ? ["the line holds undefined"] : []),
    ]);
  });

  // ---- AC6: one fixture load per case ----
  const stored = (id) => structuredClone(baseData.entries.find((e) => e.id === id));
  const live = stored("eu-omnibus-stop-the-clock-2025-794"); // a stored amender in force since 2025-04-17
  const gone = stored("hr-zor-2015-izm-82-23"); // in force 2023-07-28, repealed 2024-07-27
  const amender = (base, id, over = {}) => {
    const e = structuredClone(base);
    delete e.aliases;
    return Object.assign(e, { id, title: `Fixture amender ${id}`, official_url: `https://example.org/${id}`, amends_ids: [], ...over });
  };
  const since = (e, date) => { e.versions[0].in_force = date; e.intervals[0].from = date; return e; };
  const fixture = (name, edit) => {
    const data = structuredClone(baseData);
    edit(data.entries, (id) => data.entries.find((e) => e.id === id));
    h.addVariant("13-" + name, data);
  };
  const want = (e, when) => ({ id: e.id, title: e.title, url: e.official_url, when });

  await section("13-fix-six", async () => {
    fixture("six", (entries) => {
      for (let n = 1; n <= 6; n++) entries.push(since(amender(live, `fx-six-${n}`, { amends_ids: ["de-lksg"] }), `2020-0${n}-01`));
    });
    await fresh("13-six");
    const items = [6, 5, 4, 3, 2, 1].map((n) => want({ id: `fx-six-${n}`, title: `Fixture amender fx-six-${n}`, official_url: `https://example.org/fx-six-${n}` }, `in force since 2020-0${n}-01`));
    const S = await show("de-lksg", "2026-11-17");
    const problems = lineProblems("six in force", S, { "in-force": items, "not-yet": [], "link-only": [] }, true, "2026-11-17", true);
    const g = S.groups[0] || { list: [], rest: [] };
    problems.push(...h.eqs([["items in the list", g.list.length, 5], ["items behind the details", g.rest.length, 1], ["details open at first", g.open, false], ["summary", g.summary, "and 1 more"]]));
    // by keyboard: focus the summary, Enter opens it, Tab reaches the sixth link
    await h.evaluate(`document.querySelector("#slot-after-link summary").focus()`);
    await h.press("Enter");
    const opened = await h.evaluate(`({ open: document.querySelector("#slot-after-link details").open, visible: document.querySelector("#slot-after-link details a").checkVisibility() })`);
    await h.press("Tab");
    const focus = await h.evaluate(`({ text: document.activeElement.textContent, href: document.activeElement.getAttribute("href") })`);
    problems.push(...h.eqs([["details opened by Enter", opened.open, true], ["sixth link visible", opened.visible, true], ["Tab from the summary lands on", focus.href, "https://example.org/fx-six-1"]]));
    h.verdict("13-fix-six", "six amenders in force: five show, \"and 1 more\" opens by keyboard to the sixth, newest first", [...problems, ...(await noErrors("six"))]);
  });

  await section("13-fix-cases", async () => {
    const cases = [
      ["other-place", (entries) => entries.push(since(amender(live, "fx-fr", { place: "FR", amends_ids: [CSRD] }), "2025-05-01")),
        async () => {
          const S = await show(CSRD, "2026-11-17");
          const a = table(CSRD, "2026-11-17")["in-force"];
          const fx = { id: "fx-fr", title: "Fixture amender fx-fr", url: "https://example.org/fx-fr", when: "in force since 2025-05-01" };
          return lineProblems("an amender in another place", S, { "in-force": [a[0], fx, a[1]], "not-yet": [], "link-only": [] }, true, "2026-11-17", true);
        }, "an amender in another place is listed like any other, in its place in the date order"],
      ["self", (entries, byId) => { byId("de-lksg").amends_ids = ["de-lksg"]; },
        async () => {
          const S = await show("de-lksg", "2026-11-17");
          const has = await h.evaluate(`GEL.amendedBy.index.has("de-lksg")`);
          return [...lineProblems("a self-amender", S, { "in-force": [], "not-yet": [], "link-only": [] }, false, "2026-11-17", true), ...(has ? ["the index holds the self id"] : [])];
        }, "an entry that names itself is skipped: the law shows the no-amender sentence and the index has no key for it"],
      ["dangling", (entries) => entries.push(since(amender(live, "fx-dangling", { amends_ids: ["no-such-law", "de-lksg"] }), "2025-05-01")),
        async () => {
          const S = await show("de-lksg", "2026-11-17");
          const keys = await h.evaluate(`[...GEL.amendedBy.index.keys()].includes("no-such-law")`);
          const fx = { id: "fx-dangling", title: "Fixture amender fx-dangling", url: "https://example.org/fx-dangling", when: "in force since 2025-05-01" };
          return [...lineProblems("a dangling id", S, { "in-force": [fx], "not-yet": [], "link-only": [] }, true, "2026-11-17", true), ...(keys ? ["the index holds the dangling id"] : [])];
        }, "an id with no entry is skipped and the valid id beside it still lists the amender"],
      ["repeated", (entries) => entries.push(since(amender(live, "fx-repeat", { amends_ids: ["de-lksg", "de-lksg"] }), "2025-05-01")),
        async () => {
          const S = await show("de-lksg", "2026-11-17");
          const fx = { id: "fx-repeat", title: "Fixture amender fx-repeat", url: "https://example.org/fx-repeat", when: "in force since 2025-05-01" };
          return lineProblems("a repeated id", S, { "in-force": [fx], "not-yet": [], "link-only": [] }, true, "2026-11-17", true);
        }, "an id listed twice by one entry lists that amender once"],
      ["mutual", (entries) => entries.push(since(amender(live, "fx-mut-a", { amends_ids: ["fx-mut-b"] }), "2025-05-01"), since(amender(live, "fx-mut-b", { amends_ids: ["fx-mut-a"] }), "2025-06-01")),
        async () => {
          const a = await show("fx-mut-a", "2026-11-17");
          const b = await show("fx-mut-b", "2026-11-17");
          const item = (id, date) => ({ id, title: `Fixture amender ${id}`, url: `https://example.org/${id}`, when: `in force since ${date}` });
          return [...lineProblems("mutual pair, a", a, { "in-force": [item("fx-mut-b", "2025-06-01")], "not-yet": [], "link-only": [] }, true, "2026-11-17", true),
            ...lineProblems("mutual pair, b", b, { "in-force": [item("fx-mut-a", "2025-05-01")], "not-yet": [], "link-only": [] }, true, "2026-11-17", true)];
        }, "in a mutual pair each law lists the other"],
      ["no-url", (entries) => {
        const x = since(amender(live, "fx-nourl", { amends_ids: ["de-lksg"] }), "2025-05-01"); delete x.official_url;
        entries.push(x, since(amender(live, "fx-emptyurl", { amends_ids: ["de-lksg"], official_url: "" }), "2025-04-01"));
      },
        async () => {
          const S = await show("de-lksg", "2026-11-17");
          const items = [{ id: "fx-nourl", title: "Fixture amender fx-nourl", url: "", when: "in force since 2025-05-01" }, { id: "fx-emptyurl", title: "Fixture amender fx-emptyurl", url: "", when: "in force since 2025-04-01" }];
          return [...lineProblems("no official_url", S, { "in-force": items, "not-yet": [], "link-only": [] }, true, "2026-11-17", true),
            ...h.eqs([["links in the line", await h.evaluate(`document.querySelectorAll("#slot-after-link a").length`), 0]])];
        }, "an amender with a missing or empty official_url shows its title as plain text, not a link"],
      ["repealed", (entries) => entries.push(amender(gone, "fx-repealed", { amends_ids: ["de-lksg"] }), since(amender(live, "fx-live", { amends_ids: ["de-lksg"] }), "2025-05-01")),
        async () => {
          const live1 = { id: "fx-live", title: "Fixture amender fx-live", url: "https://example.org/fx-live", when: "in force since 2025-05-01" };
          const waiting = { ...live1, when: "in force from 2025-05-01" }; // on 2024-01-01 it is not yet in force
          const rep = { id: "fx-repealed", title: "Fixture amender fx-repealed", url: "https://example.org/fx-repealed", when: "in force since 2023-07-28" };
          const early = await show("de-lksg", "2024-01-01");
          const late = await show("de-lksg", "2025-06-01");
          return [...lineProblems("repealed amender, before the repeal", early, { "in-force": [rep], "not-yet": [waiting], "link-only": [] }, true, "2024-01-01", true),
            ...lineProblems("repealed amender, after the repeal", late, { "in-force": [live1], "not-yet": [], "link-only": [] }, true, "2025-06-01", true)];
        }, "a repealed amender is listed while in force and left out after its repeal"],
      ["publication", (entries) => { const x = since(amender(live, "fx-pub", { amends_ids: ["de-lksg"] }), "2025-05-01"); x.versions[0].date_basis = "publication"; entries.push(x); },
        async () => {
          const S = await show("de-lksg", "2026-11-17");
          return lineProblems("publication date", S, { "in-force": [{ id: "fx-pub", title: "Fixture amender fx-pub", url: "https://example.org/fx-pub", when: "published 2025-05-01" }], "not-yet": [], "link-only": [] }, true, "2026-11-17", true);
        }, "an amender whose version row has only a publication date reads \"published\", never \"in force since\""],
      ["no-amends", (entries) => { for (const e of entries) delete e.amends_ids; },
        async () => {
          const problems = [];
          for (const [id, date] of [[CSRD, "2025-06-01"], ["de-lksg", "2026-11-17"], ["cy-ets-law-2011", "2026-11-17"], [ZOR, "2024-01-01"]]) {
            const S = await show(id, date);
            problems.push(...empty(S, `${id} with no amends_ids anywhere`), ...(S.state ? [] : ["no answer shown"]));
          }
          return problems;
        }, "a data file with no amends_ids anywhere draws nothing, not even the no-amender sentence, in any variant"],
    ];
    for (const [name, edit, probe, label] of cases) {
      try {
        fixture(name, edit);
        await fresh("13-" + name);
        const problems = [...(await probe()), ...(await noErrors(name))];
        h.verdict("13-fix-" + name, label, problems);
      } catch (e) { h.check("13-fix-" + name, "check ran to the end", false, "threw: " + e.message); }
    }
  });

  await section("13-once", async () => {
    await fresh();
    await h.evaluate(`(() => { window.__builds = 0; const b = GEL.amendedBy.build; GEL.amendedBy.build = function () { window.__builds++; return b.apply(this, arguments); }; window.__resources = performance.getEntriesByType("resource").length; })()`);
    const lazy = await h.evaluate(`GEL.amendedBy.index`);
    for (const [id, date] of [[CSRD, "2026-11-17"], [ZOR, "2024-01-01"], ["cy-ets-law-2011", "2026-11-17"]]) await h.evaluate(`GEL.choose(${q(id)}); GEL.setDate(${q(date)})`);
    for (const date of ["2018-01-01", "2021-01-01", "2025-06-01"]) await h.evaluate(`GEL.setDate(${q(date)})`);
    const builds = await h.evaluate("window.__builds");
    // an unchanged group keeps its nodes across a date change; a changed group does not keep its list
    await h.evaluate(`GEL.choose(${q(CSRD)}); GEL.setDate("2026-11-17")`);
    await h.evaluate(`window.__box = document.querySelector("#slot-after-link h4").parentElement; window.__list = window.__box.querySelector("ul"); window.__root = document.querySelector("#slot-after-link h3").parentElement`);
    await h.evaluate(`GEL.setDate("2026-11-18")`);
    const same = await h.evaluate(`({ box: document.querySelector("#slot-after-link h4").parentElement === window.__box, list: window.__box.querySelector("ul") === window.__list,
      root: document.querySelector("#slot-after-link h3").parentElement === window.__root, head: document.querySelector("#slot-after-link h4").textContent })`);
    await h.evaluate(`GEL.setDate("2025-06-01")`);
    const changed = await h.evaluate(`({ list: document.querySelector("#slot-after-link h4").parentElement.querySelector("ul") !== window.__list, count: document.querySelectorAll("#slot-after-link li").length })`);
    const requests = await h.evaluate(`performance.getEntriesByType("resource").length - window.__resources`);
    h.verdict("13-once", "three laws looked up and the date changed six times: the index was built once (and not before the first answer), an unchanged group keeps its box, list and root, a changed group gets a new list, and no request follows the file load", [
      ...h.eqs([["index before the first answer", lazy, null], ["index builds", builds, 1], ["unchanged group keeps its box", same.box, true], ["unchanged group keeps its list", same.list, true],
        ["the line keeps its root", same.root, true], ["heading follows the date", same.head, "In force on 2026-11-18"], ["a changed group gets a new list", changed.list, true],
        ["items on 2025-06-01", changed.count, 2], ["requests after the load", requests, 0]]),
      ...(await noErrors("once")),
    ]);
  });

  // ---- AC8: the Chrome-scriptable parts ----
  const LU = "lu-consumer-code-unfair-practices";
  await section("13-a11y-keys", async () => {
    await fresh();
    await h.evaluate(`GEL.choose(${q(ZOR)}); GEL.setDate("2024-01-01"); document.querySelector('[data-field="link"]').focus()`);
    const ring = `(() => { const el = document.activeElement, s = getComputedStyle(el); return { tag: el.tagName, id: el.id, field: el.getAttribute("data-field"), href: el.getAttribute("href"), text: el.textContent,
      ring: s.outlineStyle + " " + s.outlineWidth + " " + s.outlineColor }; })()`;
    const seen = [await h.evaluate(ring)];
    const items = table(ZOR, "2024-01-01")["in-force"];
    for (let n = 0; n < items.length + 1; n++) { await h.press("Tab"); seen.push(await h.evaluate(ring)); }
    const problems = [...h.eqs([["first stop", seen[0].field, "link"]])];
    items.forEach((item, n) => problems.push(...h.eqs([[`stop ${n + 2} href`, seen[n + 1].href, item.url], [`stop ${n + 2} ring`, seen[n + 1].ring, "solid 2px rgb(31, 111, 74)"]])));
    problems.push(...h.eqs([["last stop", seen[items.length + 1].id, "citation-copy"], ["last stop ring", seen[items.length + 1].ring, "solid 2px rgb(31, 111, 74)"]]));
    h.verdict("13-a11y-keys", "hr-zor-2015 on 2024-01-01: Tab goes from the official link through the four amender links, in list order, to Copy citation, each stop with the 2px link-colour ring", problems);
  });

  const MEASURE = `(() => {
    const d = document.documentElement, over = [];
    for (const el of document.body.querySelectorAll("*")) { const r = el.getBoundingClientRect(); if ((r.width || r.height) && r.right > 320.5) over.push(el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + " right " + Math.round(r.right)); }
    return { innerW: window.innerWidth, scrollW: d.scrollWidth, root: getComputedStyle(d).fontSize, over: over.slice(0, 6) };
  })()`;
  await section("13-a11y-320", async () => {
    const states = [[ZOR, "2024-01-01", "hr-zor-2015, four in force"], ["cy-ets-law-2011", "2026-11-17", "cy-ets-law-2011, link only"], [LU, "2026-11-17", "the 309-character amender title"]];
    for (const [id, date, label] of states) {
      for (const [text, root] of [["100%", "16px"], ["200%", "32px"]]) {
        await h.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 900, deviceScaleFactor: 1, mobile: false });
        await fresh();
        if (text === "200%") await h.evaluate(`document.documentElement.style.fontSize = "200%"`);
        const S = await show(id, date);
        const m = await h.evaluate(MEASURE);
        const long = id === LU ? await h.evaluate(`document.querySelector("#slot-after-link a").textContent.length`) : null;
        h.verdict("13-a11y-320", `320px window, text ${text}, ${label}: the line shows and the page needs no sideways scroll`, [
          ...h.eqs([["window", m.innerW, 320], ["root font", m.root, root]]), ...(m.scrollW > 320 ? [`document scrollWidth ${m.scrollW} > 320; reach past 320: ${m.over.join("; ")}`] : []),
          ...(S.groups.length ? [] : ["the line is not showing"]), ...(id === LU ? h.eqs([["title length in the link", long, 309]]) : []),
        ]);
      }
    }
  });

  await section("13-a11y-forced", async () => {
    await fresh();
    try {
      await h.send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] });
      const forced = await h.evaluate(`matchMedia("(forced-colors: active)").matches`);
      const S = await show(ZOR, "2018-01-01");
      const facts = await h.evaluate(`[...document.querySelectorAll("#slot-after-link h3, #slot-after-link h4, #slot-after-link li")].map((el) => ({ text: el.textContent, shown: el.getBoundingClientRect().height > 0 }))`);
      const links = await h.evaluate(`[...document.querySelectorAll("#slot-after-link a")].map((a) => getComputedStyle(a).textDecorationLine)`);
      h.verdict("13-a11y-forced", "forced colours: every fact of the line (label, headings, amender, date in words) is text on screen and every amender link is underlined", [
        ...h.eqs([["forced-colors active", forced, true], ["links", links.length, 4]]),
        ...links.filter((l) => !l.includes("underline")).map((l) => "a link without underline: " + l),
        ...facts.filter((f) => !f.shown || !f.text.trim()).map((f) => "a fact not shown: " + q(f.text)),
        ...(S.groups.map((g) => g.head).join("|") === "In force on 2018-01-01|Not yet in force on 2018-01-01" ? [] : ["headings: " + q(S.groups.map((g) => g.head))]),
        ...(S.groups.flatMap((g) => g.list).every((i) => /^(in force since|in force from) \d{4}-\d{2}-\d{2}$/.test(i.when)) ? [] : ["a date is not in words"]),
      ]);
    } finally {
      await h.send("Emulation.setEmulatedMedia", { features: [] });
    }
  });

  await section("13-a11y-sentence", async () => {
    await fresh();
    await show(CSRD, E.example.date);
    const plain = await h.evaluate(`document.getElementById("answer-sentence").textContent`);
    await show(ZOR, "2024-01-01");
    const zor = await h.evaluate(`document.getElementById("answer-sentence").textContent`);
    const titles = table(ZOR, "2024-01-01")["in-force"].map((i) => i.title);
    h.verdict("13-a11y-sentence", "the hidden status sentence is the one the answer had before this story (CSRD on 2025-06-01 equals the expected sentence) and lists no amender", [
      ...h.eqs([["CSRD sentence", plain, E.example.sentence]]),
      ...(/Amended by/.test(zor) || titles.some((t) => zor.includes(t)) ? ["the sentence names amenders or the label: " + q(zor)] : []),
    ]);
  });

  // ---- AC10: the line goes with the answer ----
  await section("13-clear-address", async () => {
    await fresh();
    const a = await show(CSRD, "2025-06-01");
    const problems = [...lineProblems("CSRD shown", a, table(CSRD, "2025-06-01"), true, "2025-06-01", true)];
    await h.evaluate(`location.hash = ${q(`#law=xx-not-a-law&date=2025-06-01&snapshot=${E.snapshot9}`)}`);
    await h.waitFor(`document.getElementById("load-status").textContent !== ""`, 3000);
    const U = await h.evaluate("__amendedRead()");
    problems.push(...empty(U, "unknown-law address"));
    h.verdict("13-clear-address", "an unknown-law address loaded over a shown CSRD answer leaves both slots with no children and no text", problems);
    const again = await show(CSRD, "2025-06-01");
    h.verdict("13-clear-address", "CSRD on 2025-06-01 shown again after the clearing draws the same line again", [...lineProblems("after the clearing", again, table(CSRD, "2025-06-01"), true, "2025-06-01", true), ...(await noErrors("clear"))]);
  });

  await section("13-clear-nomatch", async () => {
    await fresh();
    const a = await show(CSRD, "2025-06-01");
    await h.evaluate(`GEL.showNoMatch("Sarbanes-Oxley", "2025-06-01")`);
    const N = await h.evaluate("__amendedRead()");
    h.verdict("13-clear-nomatch", "a no-match answer shown over a CSRD answer leaves both slots with no children and no text", [
      ...lineProblems("CSRD shown", a, table(CSRD, "2025-06-01"), true, "2025-06-01", true), ...h.eqs([["panel state", N.state, "no-match"]]), ...empty(N, "no-match"),
    ]);
    const again = await show(CSRD, "2025-06-01");
    h.verdict("13-clear-nomatch", "CSRD on 2025-06-01 shown again after the no-match answer draws the same line again", lineProblems("after the no-match answer", again, table(CSRD, "2025-06-01"), true, "2025-06-01", true));
  });

  await section("13-clear-slots", async () => {
    await fresh();
    const a = await show(CSRD, "2025-06-01");
    const b = await show("cy-ets-law-2011", "2026-11-17");
    const c = await show(CSRD, "2025-06-01");
    const d = await show(ZOR, "2025-06-01"); // repealed, every amender repealed: nothing in either slot
    const e = await show("de-lksg", "2026-11-17");
    const f = await show("de-lksg", "1900-01-01"); // before the first version: interim, the sentence moves with it
    h.verdict("13-clear-slots", "a link-only law after a stored one puts the line in #slot-after-interim and empties #slot-after-link, and the reverse; a law whose amenders are all repealed empties both; the sentence follows its variant", [
      ...lineProblems("CSRD plain", a, table(CSRD, "2025-06-01"), true, "2025-06-01", true),
      ...lineProblems("cy-ets-law-2011 after CSRD", b, table("cy-ets-law-2011", "2026-11-17"), true, "2026-11-17", false),
      ...lineProblems("CSRD again after the link-only law", c, table(CSRD, "2025-06-01"), true, "2025-06-01", true),
      ...empty(d, "hr-zor-2015 on 2025-06-01"),
      ...lineProblems("de-lksg plain", e, { "in-force": [], "not-yet": [], "link-only": [] }, false, "2026-11-17", true),
      ...lineProblems("de-lksg before its first version", f, { "in-force": [], "not-yet": [], "link-only": [] }, false, "1900-01-01", false),
      ...h.eqs([["state of the 1900 answer", f.state, "interim"]]),
    ]);
  });
}
