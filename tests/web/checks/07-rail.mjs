// Story 07: the versions rail. One or more verdicts for each of the nine acceptance criteria (tags 07-AC1 to 07-AC9).
// The expected side is never taken from web/rail.js or from the page's labels: it is a literal written here, the data file
// (h.data), or expected.json (h.expected). Where a rule runs over many (instrument, date) pairs it is written again below,
// straight from the data file: the covering interval is the last interval whose from is on or before the date (text compare),
// and the current row is the row whose commit equals that interval's commit.
// Lighthouse (AC9) is not run here: it needs a download; the report lists it as "not run, by hand later".
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../web");
const DAY = "2026-11-17";
const J = JSON.stringify;
function same(a, b) { return J(a) === J(b); }

// ---------- the data file, read again here (never the page's copy) ----------
const covering = (e, date) => {
  let hit = null;
  for (const i of e.intervals || []) if (i.from <= date) hit = i;
  return hit;
};
// Newest first by in_force as text; on a shared date the row with this commit first, the rest in file order.
const orderRows = (rows, commit) =>
  rows
    .map((v, i) => [v, i])
    .sort((x, y) =>
      x[0].in_force < y[0].in_force ? 1 : x[0].in_force > y[0].in_force ? -1 : ((y[0].commit === commit) - (x[0].commit === commit)) || x[1] - y[1])
    .map((x) => x[0]);
// [start, end) of the 7-row window over orderRows(...) output.
const windowOf = (rows, commit) => {
  const n = rows.length;
  if (n <= 7) return [0, n];
  const named = rows.find((v) => v.commit === commit);
  const date = named ? named.in_force : rows[n - 1].in_force;
  const a = rows.findIndex((v) => v.in_force === date);
  const k = rows.filter((v) => v.in_force === date).length;
  const start = Math.min(Math.max(a - Math.floor((7 - k) / 2), 0), n - 7);
  return [start, start + 7];
};
// The label of ordered row i when date D was asked and interval covers it (the contract's seven rules).
const labelFor = (ordered, i, interval, D) => {
  const v = ordered[i];
  const named = interval ? ordered.find((r) => r.commit === interval.commit) : null;
  const shared = ordered.filter((r) => r.in_force === v.in_force).length >= 2;
  const isNamed = named === v;
  if (v.date_basis) return "in-force date not recorded" + (shared ? (isNamed ? ", shown" : ", not shown") : "");
  if (isNamed) return (interval.state === "repealed" ? "repealed on " + v.in_force : "in force on " + D) + (shared ? ", shown" : "");
  const a = named ? ordered.findIndex((r) => r.in_force === named.in_force) : ordered.length;
  const k = named ? ordered.filter((r) => r.in_force === named.in_force).length : 0;
  if (i < a) return v.in_force > D ? "later than the date asked" : "not shown";
  return i < a + k ? "same date, not shown" : "";
};
// One entry per (instrument with 2+ rows, distinct row date): what the page must show after GEL.showAnswer(id, date).
const sweepPairs = (data) => {
  const out = [];
  for (const e of data.entries) {
    if ((e.versions || []).length < 2) continue;
    for (const date of new Set(e.versions.map((v) => v.in_force))) {
      const iv = covering(e, date);
      const commit = iv ? iv.commit : null;
      const ord = orderRows(e.versions, commit);
      const named = iv ? ord.find((v) => v.commit === iv.commit) : null;
      const want = named && !named.date_basis ? named.commit : "";
      const [s, t] = windowOf(ord, commit);
      const win = ord.slice(s, t).map((v, j) => v.commit.slice(0, 8) + "|" + labelFor(ord, s + j, iv, date)).join(",");
      out.push([e.id, date, want, win, want ? (ord.length > 7 ? 2 : 1) : 0]);
    }
  }
  return out;
};
// Each date's rows reversed inside the file, the intervals kept.
const reversedRuns = (data) => {
  const d = structuredClone(data);
  for (const e of d.entries) {
    const groups = new Map();
    for (const v of e.versions || []) groups.set(v.in_force, [v, ...(groups.get(v.in_force) || [])]);
    e.versions = [...groups.values()].flat();
  }
  return d;
};
const fake = (tag) => tag.padEnd(40, "0");

// ---------- the page: every read goes through pg(), so a contract mismatch is a fix in PRE or in one body ----------
const PRE = `
const $$ = (s) => [...document.querySelectorAll(s)];
const ask = (id, date) => { GEL.choose(id); if (!GEL.setDate(date)) throw new Error("date refused: " + date); };
const rows = (sel) => $$(sel + " > li").map((li) => {
  const q = (s) => li.querySelector(s);
  const ctl = q(".rail-row");
  const mark = li.querySelector("[aria-current]");
  return {
    commit: li.getAttribute("data-commit"), date: li.getAttribute("data-date"),
    dateText: q(".rail-date") && q(".rail-date").textContent,
    kind: q(".rail-kind") && q(".rail-kind").textContent,
    lang: q(".rail-lang") && q(".rail-lang").textContent,
    label: q(".rail-label") && q(".rail-label").textContent,
    labelHidden: q(".rail-label") && q(".rail-label").hidden,
    ctl: ctl && ctl.tagName, buttons: li.querySelectorAll("button").length,
    cur: li.classList.contains("rail-current"),
    aria: mark && mark.tagName + ":" + mark.getAttribute("aria-current"),
  };
});
const info = () => {
  const r = document.getElementById("rail");
  const h = r.querySelector("h2");
  return {
    text: r.textContent, kids: r.childNodes.length, ol: r.querySelectorAll("ol").length, ul: r.querySelectorAll("ul").length,
    p: r.querySelectorAll("p").length, only: r.querySelectorAll("p.rail-only").length, li: r.querySelectorAll("li").length,
    details: r.querySelectorAll("details").length, labelledby: r.getAttribute("aria-labelledby"),
    heading: h && h.id + "|" + h.textContent, aria: r.querySelectorAll("[aria-current]").length,
  };
};
const state = () => {
  const p = document.getElementById("answer-panel"), a = document.activeElement, mark = document.querySelector("#rail [aria-current]");
  const det = document.querySelector("#rail details");
  return {
    same: !!window.__f && a === window.__f, focusTag: a && a.tagName,
    focusCommit: a && a.closest("li") ? a.closest("li").getAttribute("data-commit") : null,
    winIndex: $$("#rail-window button").indexOf(a),
    aria: $$("#rail [aria-current]").length, cur: mark ? mark.closest("li").getAttribute("data-commit") : null,
    date: document.getElementById("date").value, echo: document.getElementById("date-echo").textContent,
    panelDate: p.getAttribute("data-date"), commit: p.getAttribute("data-commit"),
    order: $$("#rail-window > li").map((li) => li.getAttribute("data-commit").slice(0, 9)).join(","),
    open: det ? det.open : null,
  };
};
`;
const pg = async (h, body) => {
  const r = await h.evaluate("(() => { try { " + PRE + "\n" + body + "\n } catch (e) { return { __error: String((e && e.stack) || e) }; } })()");
  if (r && r.__error) throw new Error("page: " + r.__error.split("\n").slice(0, 2).join(" "));
  return r;
};
const ask = (id, date) => `ask(${J(id)}, ${J(date)});`;

// ---------- small readers of what pg() returned ----------
const line = (r) => r.dateText + " " + r.kind + (r.lang ? " " + r.lang : "") + (r.label ? " | " + r.label : "");
const listDiff = (name, got, want) => {
  const out = [];
  if (got.length !== want.length) out.push(name + ": " + got.length + " rows, want " + want.length);
  for (let i = 0; i < Math.min(got.length, want.length); i++) if (got[i] !== want[i]) out.push(name + "[" + i + "]: got " + J(got[i]) + ", want " + J(want[i]));
  return out;
};
// rail-current on exactly row curIndex (none when null), aria-current on that row's button only, with that commit.
const markProblems = (name, rows, curIndex, curPrefix, h) => {
  const out = [];
  const cur = rows.map((r, i) => (r.cur ? i : -1)).filter((i) => i >= 0);
  const aria = rows.map((r, i) => (r.aria ? i : -1)).filter((i) => i >= 0);
  const want = curIndex === null ? [] : [curIndex];
  if (!same(cur, want)) out.push(name + ": rail-current on rows " + J(cur) + ", want " + J(want));
  if (!same(aria, want)) out.push(name + ": aria-current on rows " + J(aria) + ", want " + J(want));
  if (curIndex !== null && rows[curIndex]) {
    if (rows[curIndex].aria !== "BUTTON:true") out.push(name + ": aria-current is " + J(rows[curIndex].aria) + ", want BUTTON:true");
    if (!h.sameCommit(rows[curIndex].commit, curPrefix)) out.push(name + ": current commit " + J(rows[curIndex].commit) + ", want one starting " + curPrefix);
  }
  return out;
};
const more = (list, n = 4) => (list.length > n ? [...list.slice(0, n), "... and " + (list.length - n) + " more"] : list);

// ---------- AC1: row counts and the "Show all N versions" control ----------
async function ac1(h, X) {
  await h.open("ok");
  const laws = [
    { id: "ch-klg", rows: 7, summary: null },
    { id: "mt-climate-action-act-2015", rows: 8, summary: "Show all 8 versions" },
    { id: "kz-advertising-law", rows: 150, summary: "Show all 150 versions" },
  ];
  for (const law of laws) {
    const r = await pg(h, ask(law.id, DAY) + `
      const d = document.querySelector("#rail details");
      const s = d && d.querySelector("summary");
      const before = { window: $$("#rail-window > li").length, details: $$("#rail details").length, open: d ? d.open : null, summary: s ? s.textContent : null, ol: $$("#rail ol").length };
      if (d) d.open = true;
      return { ...before, all: $$("#rail-all > li").length };`);
    const many = law.rows > 7;
    h.verdict("07-AC1", law.id + " on " + DAY + " (" + law.rows + " rows): 7 li in the window, " + (many ? J(law.summary) + ", " + law.rows + " li once opened" : "no details"), h.eqs([
      ["rows in the data file", X.byId[law.id].versions.length, law.rows],
      ["li in #rail-window", r.window, 7],
      ["details elements", r.details, many ? 1 : 0],
      ["summary text", r.summary, law.summary],
      ["details open when first drawn", r.open, many ? false : null],
      ["ol elements in #rail", r.ol, many ? 2 : 1],
      ["li in #rail-all once opened", r.all, many ? law.rows : 0],
    ]));
  }
  const many = X.real.entries.filter((e) => e.versions.length > 7);
  const list = many.map((e) => {
    const iv = covering(e, DAY);
    return [e.id, e.versions.length, orderRows(e.versions, iv ? iv.commit : null).map((v) => v.commit.slice(0, 8)).join(",")];
  });
  const bad = await pg(h, `
    const out = [];
    for (const [id, n, want] of ${J(list)}) {
      ask(id, ${J(DAY)});
      const s = document.querySelector("#rail details > summary");
      const all = rows("#rail-all");
      const dates = all.map((x) => x.date);
      const bad = [];
      if (!s || s.textContent !== "Show all " + n + " versions") bad.push("summary " + JSON.stringify(s && s.textContent));
      if (all.length !== n) bad.push(all.length + " li in #rail-all");
      if ($$("#rail-window > li").length !== 7) bad.push($$("#rail-window > li").length + " li in #rail-window");
      if (!dates.every((d, i) => i === 0 || dates[i - 1] >= d)) bad.push("not newest first by in_force");
      if (all.map((x) => x.commit.slice(0, 8)).join(",") !== want) bad.push("row order differs from the expected order");
      if (bad.length) out.push(id + ": " + bad.join(", "));
    }
    return out;`);
  h.verdict("07-AC1", "all " + list.length + " instruments with more than 7 rows: summary reads Show all <rows> versions, <rows> li in #rail-all, newest first by in_force text", [
    ...(list.length === 81 ? [] : ["instruments with more than 7 rows in the data file: " + list.length + ", want 81"]),
    ...more(bad),
  ]);
}

// ---------- AC2: the window rule, as a function and as drawn ----------
async function ac2(h, X) {
  const id = "fi-paastokauppalaki-2011";
  const e = X.byId[id];
  const W2018 = ["2018-07-01 fi", "2018-07-01 sv", "2017-07-03 fi", "2017-07-03 sv", "2016-01-01 fi", "2016-01-01 sv", "2011-05-01 fi"];
  const W2024 = ["2024-01-01 fi", "2024-01-01 sv", "2023-03-01 fi", "2023-03-01 sv", "2022-06-23 fi", "2022-06-23 sv", "2022-01-01 fi"];
  const WEND = ["2018-07-01 sv", "2017-07-03 fi", "2017-07-03 sv", "2016-01-01 fi", "2016-01-01 sv", "2011-05-01 fi", "2011-05-01 sv"];
  const cases = [
    { date: "2018-06-01", want: W2018, span: [12, 19] },
    { date: "2024-06-01", want: W2024, span: [0, 7] },
    { date: "2010-01-01", want: WEND, span: [13, 20] },
    { date: "2016-01-01", want: WEND, span: [13, 20] },
  ];
  const mk = (n) => String(n).padStart(40, "0");
  const yr = (y) => ({ commit: mk(y), in_force: y + "-01-01", kind: "consolidated", language: "en" });
  const years = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => yr(a + i));
  const on = (date, from, to) => Array.from({ length: to - from + 1 }, (_, i) => ({ commit: mk(from + i), in_force: date, kind: "consolidated", language: "en" }));
  const made = [
    ["8 rows, anchor on the newest", years(2001, 2008), mk(2008), [0, 7]],
    ["8 rows, anchor on the oldest", years(2001, 2008), mk(2001), [1, 8]],
    ["8 rows, anchor 4 from the newest", years(2001, 2008), mk(2005), [0, 7]],
    ["8 rows, anchor 5 from the newest", years(2001, 2008), mk(2004), [1, 8]],
    ["8 rows, no commit: the oldest group", years(2001, 2008), null, [1, 8]],
    ["8 rows, a commit that names no row: the oldest group", years(2001, 2008), mk(9999), [1, 8]],
    ["8 rows, a group of 7 on the newest date, anchor in it", [...on("2020-01-01", 1, 7), ...on("2010-01-01", 8, 8)], mk(3), [0, 7]],
    ["8 rows, a group of 7 on the newest date, anchor on the older row", [...on("2020-01-01", 1, 7), ...on("2010-01-01", 8, 8)], mk(8), [1, 8]],
    ["8 rows, a group of 7 on the older date, anchor in it", [...on("2020-01-01", 1, 1), ...on("2010-01-01", 2, 8)], mk(5), [1, 8]],
    ["8 rows, a group of 7 on the older date, no commit", [...on("2020-01-01", 1, 1), ...on("2010-01-01", 2, 8)], null, [1, 8]],
    ["7 rows", years(2001, 2007), mk(2004), [0, 7]],
    ["3 rows, no commit", years(2001, 2003), null, [0, 3]],
    ["20 rows, anchor in the middle (10 from the newest)", years(2001, 2020), mk(2010), [7, 14]],
    ["20 rows, anchor on the newest", years(2001, 2020), mk(2020), [0, 7]],
    ["20 rows, anchor on the oldest", years(2001, 2020), mk(2001), [13, 20]],
    ["20 rows, no commit", years(2001, 2020), null, [13, 20]],
  ];
  const svCommit = e.versions.find((v) => v.in_force === "2017-07-03" && v.language === "sv").commit;
  const four = [{ y: 2000, c: "a" }, { y: 2010, c: "b" }, { y: 2010, c: "c" }, { y: 2020, c: "d" }].map((r, i) => ({ commit: mk(i + 1), in_force: r.y + "-01-01", kind: "consolidated", language: r.c }));
  await h.open("ok");
  const u = await pg(h, `
    const e = GEL.byId[${J(id)}];
    const before = e.versions.map((v) => v.commit).join();
    const real = ${J(cases.map((c) => [c.date, (covering(e, c.date) || { commit: null }).commit]))}.map(([date, commit]) => {
      const o = GEL.rail.order(e, commit);
      const w = GEL.rail.window(o, commit);
      return { date, n: o.length, span: [w[0], w[1]], rows: o.slice(w[0], w[1]).map((v) => v.in_force + " " + v.language) };
    });
    const sv = GEL.rail.order(e, ${J(svCommit)});
    const made = ${J(made.map((m) => [m[1], m[2]]))}.map(([rows, commit]) => {
      const o = GEL.rail.order({ versions: rows }, commit);
      const w = GEL.rail.window(o, commit);
      return [w[0], w[1]];
    });
    const four = ${J(four)};
    const letters = (commit) => GEL.rail.order({ versions: four }, commit).map((v) => v.language).join("");
    return {
      real, made, sv: [sv[14].language, sv[15].language], letters3: letters(${J(four[2].commit)}), lettersNull: letters(null),
      fresh: GEL.rail.order(e, null) !== e.versions, untouched: e.versions.map((v) => v.commit).join() === before,
    };`);
  const unit = [];
  for (const [i, c] of cases.entries()) {
    unit.push(...listDiff("window on " + c.date, u.real[i].rows, c.want), ...h.eqs([["span on " + c.date, J(u.real[i].span), J(c.span)], ["rows in the ordered list on " + c.date, u.real[i].n, 20]]));
  }
  h.verdict("07-AC2", "GEL.rail.order and GEL.rail.window on " + id + " (20 rows): the four windows are the literal lists on 2018-06-01, 2024-06-01, 2010-01-01 and 2016-01-01", [
    ...unit,
    ...h.eqs([
      ["order() returns a new array", u.fresh, true],
      ["order() leaves entry.versions as it was", u.untouched, true],
      ["order() with the sv row named: rows 14 and 15 of 2017-07-03", J(u.sv), J(["sv", "fi"])],
      ["order() on made-up rows, named row c: letters", u.letters3, "dcba"],
      ["order() on made-up rows, no commit: file order inside a date", u.lettersNull, "dbca"],
    ]),
  ]);
  h.verdict("07-AC2", "GEL.rail.window on made-up rows: anchor at the newest end, a group of 7 in 8 rows, no named row uses the oldest group, 3, 7 and 20 rows", made.flatMap((m, i) => h.eqs([[m[0], J(u.made[i]), J(m[3])]])));
  for (const c of cases) {
    const r = await pg(h, ask(id, c.date) + `return { rows: rows("#rail-window"), all: rows("#rail-all").length, details: $$("#rail details > summary").map((s) => s.textContent) };`);
    const problems = [
      ...listDiff("rendered window on " + c.date, r.rows.map((x) => x.dateText + " " + x.lang), c.want),
      ...h.eqs([["li in #rail-all", r.all, 20], ["summary", J(r.details), J(["Show all 20 versions"])]]),
      ...r.rows.flatMap((x, i) => (x.labelHidden === (x.label === "") ? [] : ["row " + i + ": label " + J(x.label) + " with hidden=" + x.labelHidden])),
    ];
    if (c.date === "2018-06-01") {
      problems.push(...listDiff("labels on 2018-06-01", r.rows.map((x) => x.label), ["later than the date asked", "later than the date asked", "in force on 2018-06-01, shown", "same date, not shown", "", "", ""]));
    }
    h.verdict("07-AC2", "rendered #rail-window on " + c.date + " shows the same seven rows (date and language of each li)", problems);
  }
}

// ---------- AC3: aria-current is the interval's commit, never a date; every pair, then with each date's rows reversed ----------
async function sweep(h, X, variant, data, what) {
  await h.open(variant);
  const pairs = sweepPairs(data);
  const failed = [];
  for (let i = 0; i < pairs.length; i += 500) {
    const r = await pg(h, `
      const out = [];
      for (const [id, date, want, win, marked] of ${J(pairs.slice(i, i + 500))}) {
        GEL.showAnswer(id, date);
        const cur = $$("#rail [aria-current]");
        const got = cur.length ? cur[0].closest("li").getAttribute("data-commit") : "";
        const gotWin = $$("#rail-window > li").map((li) => li.getAttribute("data-commit").slice(0, 8) + "|" + li.querySelector(".rail-label").textContent).join(",");
        const m = $$("#rail li.rail-current").length;
        if (cur.length !== (want ? 1 : 0) || got !== want || gotWin !== win || m !== marked) {
          out.push(id + " " + date + ": aria-current " + cur.length + " on " + got.slice(0, 9) + " (want " + want.slice(0, 9) + "), rail-current " + m + " (want " + marked + ")" + (gotWin !== win ? ", window " + gotWin + " (want " + win + ")" : ""));
        }
      }
      return out;`);
    failed.push(...r);
  }
  const plain = X.E.pairs.filter((p) => p.plain);
  const badShared = await pg(h, `
    const out = [];
    for (const [id, date, want] of ${J(plain.map((p) => [p.id, p.date, p.commit]))}) {
      GEL.showAnswer(id, date);
      const cur = $$("#rail [aria-current]");
      const got = cur.length === 1 ? cur[0].closest("li").getAttribute("data-commit") : "aria-current x" + cur.length;
      if (got.length !== 40 || !got.startsWith(want)) out.push(id + " " + date + ": got " + got.slice(0, 9) + ", want " + want.slice(0, 9));
    }
    return out;`);
  const klg = await pg(h, ask("ch-klg", "2025-06-01") + `return rows("#rail-window");`);
  const problems = [
    ...(pairs.length === 2139 ? [] : ["pairs in the data file: " + pairs.length + ", want 2139"]),
    ...more(failed),
    ...more(badShared.map((s) => "expected.json pair " + s)),
    ...markProblems("ch-klg on 2025-06-01", klg, 0, "a0a634605", h),
    ...listDiff("ch-klg on 2025-06-01 labels", klg.map((r) => r.label), ["in force on 2025-06-01, shown", ...Array(6).fill("same date, not shown")]),
  ];
  h.verdict("07-AC3", what + ": pairs=" + pairs.length + " differ=" + failed.length + "; expected.json shared-date pairs " + plain.length + " differ=" + badShared.length + "; ch-klg on 2025-06-01 marks consolidated de, six rows same date, not shown", problems);
}
async function ac3(h, X) {
  await sweep(h, X, "ok", X.real, "every row date of every instrument with 2+ rows, file order");
  await sweep(h, X, "07-reversed", X.reversed, "the same with each date's rows reversed in the file");
}

// ---------- AC4: shown rows, partners with their language codes, a row nobody names ----------
async function ac4(h, X) {
  await h.open("ok");
  const real = [
    { id: "br-cvm-res-59-2021", date: "2023-01-02", cur: 0, prefix: "2cf4e9a11", lines: ["2023-01-02 consolidated pt | in force on 2023-01-02, shown", "2023-01-02 adopted pt | same date, not shown"] },
    { id: "bt-environmental-assessment-act-2000", date: "2000-07-14", cur: 0, prefix: "5335a284e", lines: ["2000-07-14 adopted dz | in force on 2000-07-14, shown", "2000-07-14 adopted en | same date, not shown"] },
    {
      id: "at-uwg-s1-2a", date: "2022-08-01", cur: 2, prefix: "8452f3068",
      lines: [
        "2026-09-27 consolidated | later than the date asked", "2026-07-29 consolidated | later than the date asked",
        "2022-07-20 consolidated de | in force on 2022-08-01, shown", "2022-07-20 translation en | same date, not shown",
        "2016-12-31 consolidated", "2015-04-23 consolidated", "2007-12-12 consolidated",
      ],
    },
  ];
  for (const c of real) {
    const r = await pg(h, ask(c.id, c.date) + `return rows("#rail-window");`);
    h.verdict("07-AC4", c.id + " on " + c.date + ": the shown row, its partners and their language codes", [
      ...listDiff("rows", r.map(line), c.lines),
      ...markProblems("rows", r, c.cur, c.prefix, h),
      ...r.flatMap((x, i) => (x.ctl === "BUTTON" && x.buttons === 1 ? [] : ["row " + i + ": control " + x.ctl + " with " + x.buttons + " buttons"])),
    ]);
  }
  const fx = X.unnamed;
  const asks = [
    { date: "2026-11-17", lines: ["2026-09-01 translation | not shown", "2026-03-18 consolidated | in force on 2026-11-17", "2025-04-17 consolidated", "2023-01-05 adopted"] },
    { date: "2026-06-01", lines: ["2026-09-01 translation | later than the date asked", "2026-03-18 consolidated | in force on 2026-06-01", "2025-04-17 consolidated", "2023-01-05 adopted"] },
  ];
  await h.open("07-fixture-unnamed");
  for (const a of asks) {
    const r = await pg(h, ask(fx.id, a.date) + `return rows("#rail-window");`);
    h.verdict("07-AC4", "fixture 07-fixture-unnamed, a row dated after the latest named row that no interval names, asked on " + a.date + ": it reads " + J(a.lines[0].split(" | ")[1]), [
      ...listDiff("rows", r.map(line), a.lines),
      ...markProblems("rows", r, 1, "d27225e8f", h),
    ]);
  }
}

// ---------- AC5: dates before the first row, repeal rows ----------
async function ac5(h, X) {
  await h.open("ok");
  const early = await pg(h, ask("fi-paastokauppalaki-2011", "2010-01-01") + `return { win: rows("#rail-window"), all: rows("#rail-all"), aria: $$("#rail [aria-current]").length, cur: $$("#rail li.rail-current").length };`);
  h.verdict("07-AC5", "fi-paastokauppalaki-2011 on 2010-01-01: no aria-current, no current row, all 20 rows read later than the date asked", [
    ...h.eqs([["aria-current", early.aria, 0], ["rail-current", early.cur, 0], ["rows in #rail-window", early.win.length, 7], ["rows in #rail-all", early.all.length, 20]]),
    ...listDiff("labels", [...early.win, ...early.all].map((r) => r.label), Array(27).fill("later than the date asked")),
  ]);
  const kg = await pg(h, ask("kg-ghg-emission-law-71", DAY) + `return rows("#rail-window");`);
  h.verdict("07-AC5", "kg-ghg-emission-law-71 on " + DAY + ": the repeal row (2027-01-01) reads later than the date asked, consolidated ky (2016-07-06) reads in force on " + DAY + ", shown", [
    ...listDiff("rows", kg.map(line), [
      "2027-01-01 repeal | later than the date asked", "2016-07-06 consolidated ky | in force on 2026-11-17, shown", "2016-07-06 consolidated ru | same date, not shown",
      "2007-05-25 adopted ky", "2007-05-25 adopted ru",
    ]),
    ...markProblems("rows", kg, 1, "8c2a5346c", h),
  ]);
  const fi = await pg(h, ask("fi-paastokauppalaki-2011", "2024-06-01") + `return { win: rows("#rail-window"), all: rows("#rail-all") };`);
  h.verdict("07-AC5", "fi-paastokauppalaki-2011 on 2024-06-01: the named repeal row reads repealed on 2024-01-01, shown, its pair same date, not shown, and no row reads in force on", [
    ...listDiff("rows", fi.win.map(line), [
      "2024-01-01 repeal fi | repealed on 2024-01-01, shown", "2024-01-01 repeal sv | same date, not shown",
      "2023-03-01 consolidated fi", "2023-03-01 consolidated sv", "2022-06-23 consolidated fi", "2022-06-23 consolidated sv", "2022-01-01 consolidated fi",
    ]),
    ...markProblems("rows", fi.win, 0, "61850073d", h),
    ...fi.all.filter((r) => r.label.startsWith("in force on")).map((r) => "all-list row " + r.date + " reads " + J(r.label)),
    ...listDiff("all-list labels", fi.all.map((r) => r.label), ["repealed on 2024-01-01, shown", "same date, not shown", ...Array(18).fill("")]),
  ]);
}

// ---------- AC6: rows without an in-force date ----------
async function ac6(h, X) {
  await h.open("ok");
  const dz = await pg(h, ask("dz-lf-1992-art117", DAY) + `return { rows: rows("#rail-window"), aria: $$("#rail [aria-current]").length };`);
  h.verdict("07-AC6", "dz-lf-1992-art117: both rows are text without a button, no aria-current, adopted ar reads in-force date not recorded, shown and translation fr ..., not shown", [
    ...listDiff("rows", dz.rows.map(line), ["1991-12-18 adopted ar | in-force date not recorded, shown", "1991-12-18 translation fr | in-force date not recorded, not shown"]),
    ...dz.rows.flatMap((r, i) => h.eqs([["row " + i + " control", r.ctl, "SPAN"], ["row " + i + " buttons", r.buttons, 0], ["row " + i + " rail-current", r.cur, false]])),
    ...h.eqs([["aria-current", dz.aria, 0]]),
  ]);
  const early = await pg(h, ask("dz-lf-1992-art117", "1990-01-01") + `return rows("#rail-window");`);
  h.verdict("07-AC6", "dz-lf-1992-art117 on 1990-01-01 (no named row): both rows read in-force date not recorded, not shown", [
    ...listDiff("rows", early.map(line), ["1991-12-18 adopted ar | in-force date not recorded, not shown", "1991-12-18 translation fr | in-force date not recorded, not shown"]),
    ...early.flatMap((r, i) => h.eqs([["row " + i + " control", r.ctl, "SPAN"], ["row " + i + " aria-current", r.aria, null]])),
  ]);
  const ni = await pg(h, ask("ni-ley-217", DAY) + "return info();");
  h.verdict("07-AC6", "ni-ley-217: #rail holds exactly the line Only stored version: 1996-06-06, adopted, in-force date not recorded and no ol", h.eqs([
    ["rail text", ni.text, "Only stored version: 1996-06-06, adopted, in-force date not recorded"],
    ["children of #rail", ni.kids, 1], ["p.rail-only", ni.only, 1], ["ol", ni.ol, 0], ["li", ni.li, 0], ["aria-labelledby", ni.labelledby, null],
  ]));
  await h.open("07-fixture-mixed");
  const mx = await pg(h, ask(X.mixed.id, "2015-01-01") + `return rows("#rail-window");`);
  h.verdict("07-AC6", "fixture 07-fixture-mixed asked 2015-01-01: the publication-dated row sits between the other two as text, no aria-current, label in-force date not recorded; the 2000-01-01 row is current", [
    ...listDiff("rows", mx.map(line), ["2020-01-01 consolidated | later than the date asked", "2010-01-01 consolidated | in-force date not recorded", "2000-01-01 adopted | in force on 2015-01-01"]),
    ...markProblems("rows", mx, 2, X.mixed.versions[0].commit.slice(0, 9), h),
    ...h.eqs([["publication row control", mx[1] && mx[1].ctl, "SPAN"], ["publication row buttons", mx[1] && mx[1].buttons, 0], ["other rows are buttons", J(mx.filter((r, i) => i !== 1).map((r) => r.ctl)), J(["BUTTON", "BUTTON"])]]),
  ]);
}

// ---------- AC7: one version is a line, none is nothing ----------
async function ac7(h, X) {
  await h.open("ok");
  const LINE = "Only stored version: 2023-01-05, adopted";
  const seq = [
    { id: "ch-klg", date: DAY, rows: 7, kind: "rail" },
    { id: "cg-decret-2022-1923", date: DAY, rows: 1, kind: "line" },
    { id: "ae-dl-11-2024-climate", date: DAY, rows: 0, kind: "none" },
    { id: "bt-environmental-assessment-act-2000", date: DAY, rows: 2, kind: "rail" },
    { id: "cg-decret-2022-1923", date: "2022-01-01", rows: 1, kind: "line" },
  ];
  for (const c of seq) {
    const r = await pg(h, ask(c.id, c.date) + "return info();");
    const want = {
      rail: [["ol", 1], ["li", c.rows], ["only", 0], ["p", 0], ["labelledby", "rail-heading"], ["heading", "rail-heading|Versions of this law"]],
      line: [["text", LINE], ["kids", 1], ["only", 1], ["p", 1], ["ol", 0], ["ul", 0], ["li", 0], ["details", 0], ["labelledby", null], ["heading", null]],
      none: [["text", ""], ["kids", 0], ["ol", 0], ["ul", 0], ["p", 0], ["li", 0], ["labelledby", null]],
    }[c.kind];
    const label = { rail: "the rail (an ol with " + c.rows + " li)", line: "the line " + J(LINE) + " and no ol", none: "an empty #rail: no children, no ol, no p" }[c.kind];
    h.verdict("07-AC7", c.id + " on " + c.date + ": " + label, h.eqs([["rows in the data file", X.byId[c.id].versions.length, c.rows], ...want.map(([k, v]) => [k, r[k], v])]));
  }
}

// ---------- AC8: choosing a row by key or mouse keeps the focused node ----------
async function click(h) {
  const [x, y] = await pg(h, "const b = window.__f; b.scrollIntoView({ block: \"center\" }); const r = b.getBoundingClientRect(); return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)];");
  await h.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await h.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await h.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}
async function focusCase(h, X, c) {
  await h.open(c.variant || "ok");
  await pg(h, ask(c.id, c.date) + c.prep);
  for (let i = 0; i < (c.tabs || 0); i++) await h.press("Tab");
  const pre = await pg(h, "window.__f = document.activeElement; return state();");
  await c.act(h);
  await h.sleep(80);
  const post = await pg(h, "return state();");
  const e = c.entry || X.byId[c.id];
  const row = e.versions.find((v) => v.commit === pre.focusCommit);
  if (!row) return { trail: c.name + ": focus was on " + J(pre.focusTag) + " in no rail row", problems: [c.name + ": focused element is not a rail row button: " + J(pre)] };
  const iv = covering(e, row.in_force);
  const problems = h.eqs([
    [c.name + ": focus before the act is a button", pre.focusTag, "BUTTON"],
    [c.name + ": date asked before", pre.panelDate, c.date],
    [c.name + ": aria-current before", pre.aria, 1],
    [c.name + ": same node is still document.activeElement", post.same, true],
    [c.name + ": aria-current after", post.aria, 1],
    [c.name + ": #date value", post.date, row.in_force],
    [c.name + ": #date-echo text", post.echo, row.in_force],
    [c.name + ": #answer-panel data-date", post.panelDate, row.in_force],
    [c.name + ": #answer-panel data-commit", post.commit, iv ? iv.commit : null],
    [c.name + ": the row holding aria-current", post.cur, iv ? iv.commit : null],
  ]);
  problems.push(...(c.extra ? c.extra(pre, post, row) : []));
  return { trail: c.name + ": activeElement same=" + post.same + ", aria-current " + pre.aria + "->" + post.aria, problems };
}
async function ac8(h, X) {
  const fi = X.byId["fi-paastokauppalaki-2011"];
  const kz = X.byId["kz-advertising-law"];
  const svRow = fi.versions.find((v) => v.in_force === "2017-07-03" && v.language === "sv");
  const winButton = (n) => `$$("#rail-window button")[${n}].focus();`;
  const [r0, r1, r2] = X.move.versions;
  const cases = [
    { name: "a Tab then Enter", id: fi.id, date: "2018-06-01", prep: winButton(0), tabs: 1, act: (h) => h.press("Enter"), extra: (pre) => h.eqs([["a: Tab moved to the second row button", pre.winIndex, 1]]) },
    { name: "b mouse click", id: fi.id, date: "2018-06-01", prep: winButton(4), act: click },
    {
      name: "c Enter on a row of the opened details", id: kz.id, date: DAY,
      prep: `
        document.querySelector("#rail details").open = true;
        const inWindow = new Set($$("#rail-window > li").map((li) => li.getAttribute("data-commit")));
        $$("#rail-all > li").reverse().find((li) => !inWindow.has(li.getAttribute("data-commit"))).querySelector("button").focus();`,
      act: (h) => h.press("Enter"), extra: (pre, post) => h.eqs([["c: details still open", post.open, true]]),
    },
    {
      name: "d same date, not shown partner", id: fi.id, date: "2018-06-01",
      prep: `document.querySelector('#rail-window li[data-commit="${svRow.commit}"] button').focus();`,
      act: (h) => h.press("Enter"),
      extra: (pre, post) => h.eqs([["d: focused row is the sv partner", pre.focusCommit, svRow.commit], ["d: answer stays on the named row", post.commit, pre.commit]]),
    },
    {
      name: "e node move: r2 jumps ahead of r1", id: X.move.id, date: "2005-01-01", variant: "07-fixture-move", entry: X.move,
      prep: `document.querySelector('#rail-window li[data-commit="${r2.commit}"] button').focus();`,
      act: (h) => h.press("Enter"),
      extra: (pre, post) => h.eqs([
        ["e: order before (r1, r2, r0)", pre.order, [r1, r2, r0].map((r) => r.commit.slice(0, 9)).join()],
        ["e: order after (r2 first in its group)", post.order, [r2, r1, r0].map((r) => r.commit.slice(0, 9)).join()],
      ]),
    },
  ];
  const trail = [];
  const problems = [];
  for (const c of cases) {
    const r = await focusCase(h, X, c);
    trail.push(r.trail);
    problems.push(...r.problems);
  }
  if (problems.length) problems.push("console print: " + trail.join("; "));
  h.verdict("07-AC8", "keyboard and mouse: the chosen row keeps focus (same activeElement node) and one aria-current, the date field, echo and answer take its in_force [" + trail.join("; ") + "]", problems);
}

// ---------- AC9: ol, forced colours, row height, tab order, the greps over web/ ----------
async function ac9(h, X) {
  await h.open("ok");
  const ol = await pg(h, ask("kz-advertising-law", DAY) + "return { window: document.getElementById(\"rail-window\").tagName, all: document.getElementById(\"rail-all\").tagName, ul: $$(\"#rail ul\").length };");
  h.verdict("07-AC9", "the rail is an ol: #rail-window and #rail-all are OL elements and #rail holds no ul", h.eqs([["#rail-window", ol.window, "OL"], ["#rail-all", ol.all, "OL"], ["ul in #rail", ol.ul, 0]]));

  const heights = [];
  const sets = [["ch-klg", DAY, false], ["kz-advertising-law", DAY, true], ["fi-paastokauppalaki-2011", "2018-06-01", true], ["dz-lf-1992-art117", DAY, false]];
  for (const [id, date, open] of sets) {
    const r = await pg(h, ask(id, date) + (open ? "document.querySelector(\"#rail details\").open = true;" : "") + "return $$(\"#rail li\").map((li) => Math.round(li.getBoundingClientRect().height * 10) / 10);");
    heights.push([id + (open ? " (details open)" : ""), r]);
  }
  h.verdict("07-AC9", "every li of ch-klg, kz-advertising-law (details open), fi-paastokauppalaki-2011 (details open, labels) and dz-lf-1992-art117 is at least 40px tall", heights.flatMap(([name, hs]) => [
    ...(hs.length ? [] : [name + ": no li"]),
    ...(hs.every((x) => x >= 40) ? [] : [name + ": shortest li is " + Math.min(...hs) + "px of " + hs.length]),
  ]));

  let forced;
  try {
    await h.send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] });
    forced = await pg(h, ask("fi-paastokauppalaki-2011", "2018-06-01") + `
      const li = document.querySelector("#rail-window li.rail-current");
      const cs = li && getComputedStyle(li);
      return { on: matchMedia("(forced-colors: active)").matches, found: !!li, width: cs && cs.borderLeftWidth, style: cs && cs.borderLeftStyle, label: li && li.querySelector(".rail-label").textContent };`);
  } finally {
    await h.send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "none" }] });
  }
  h.verdict("07-AC9", "forced-colours emulation: the current row keeps a solid left border and its text label", [
    ...h.eqs([["forced-colors active", forced.on, true], ["current row found", forced.found, true], ["border-left-style", forced.style, "solid"]]),
    ...(parseFloat(forced.width) > 0 ? [] : ["border-left-width " + J(forced.width) + ", want more than 0"]),
    ...(forced.label ? [] : ["the current row's .rail-label is empty"]),
  ]);

  await h.open("ok");
  await pg(h, ask("kz-advertising-law", DAY) + "$$(\"#rail-window button\")[0].focus();");
  for (let i = 0; i < 6; i++) await h.press("Tab");
  const seventh = await pg(h, "const b = $$(\"#rail-window button\"); return { n: b.length, at: b.indexOf(document.activeElement) };");
  await h.press("Tab");
  const next = await pg(h, "return { tag: document.activeElement.tagName, text: document.activeElement.textContent };");
  h.verdict("07-AC9", "tab order on kz-advertising-law: first row button, six Tabs reach the 7th, one more reaches the Show all 150 versions summary", [
    ...h.eqs([["buttons in #rail-window", seventh.n, 7], ["index of the focused button after 6 Tabs", seventh.at, 6], ["element after the 7th Tab", next.tag, "SUMMARY"], ["its text", next.text, "Show all 150 versions"]]),
  ]);

  const read = (f) => fs.readFileSync(path.join(WEB, f), "utf8");
  const files = fs.readdirSync(WEB);
  const css = files.filter((f) => f.endsWith(".css"));
  const js = files.filter((f) => f.endsWith(".js"));
  const HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/;
  const ROOT = /:root\s*\{[^}]*\}/g;
  const problems = [];
  if (!css.includes("rail.css")) problems.push("web/rail.css is missing");
  if (!js.includes("rail.js")) problems.push("web/rail.js is missing");
  let roots = 0;
  for (const f of css) {
    const text = read(f);
    roots += (text.match(ROOT) || []).length;
    if (HEX.test(text.replace(ROOT, ""))) problems.push("web/" + f + ": hex colour outside the :root block");
  }
  if (roots !== 1) problems.push("web/*.css: " + roots + " :root blocks, want 1");
  if (css.includes("rail.css") && (HEX.test(read("rail.css")) || /:root/.test(read("rail.css")))) problems.push("web/rail.css: hex colour or :root");
  if (css.includes("rail.css") && /http/.test(read("rail.css"))) problems.push("web/rail.css: contains http");
  if (js.includes("rail.js") && HEX.test(read("rail.js"))) problems.push("web/rail.js: hex colour");
  const dates = js.filter((f) => /new Date/.test(read(f))).map((f) => f + " x" + (read(f).split("new Date").length - 1));
  const total = js.reduce((n, f) => n + read(f).split("new Date").length - 1, 0);
  if (total !== 1 || !/new Date/.test(read("dates.js"))) problems.push("new Date appears " + total + " times in web/*.js (" + dates.join(", ") + "), want once, in dates.js");
  for (const f of js) if (/Date\.parse|Temporal|toISOString/.test(read(f))) problems.push("web/" + f + ": Date.parse, Temporal or toISOString");
  h.verdict("07-AC9", "greps over web/: no hex colour outside the one :root block, none in rail.css or rail.js, no http in rail.css, new Date once (dates.js), no Date.parse, Temporal or toISOString", problems);
}

// ---------- the run: fixtures first, then each criterion on its own so one failure stops no other ----------
export async function run(h) {
  const text = fs.readFileSync(h.data, "utf8");
  const real = JSON.parse(text);
  const byId = Object.fromEntries(real.entries.map((e) => [e.id, e]));
  const csrd = byId["eu-csrd-2022-2464"];
  const entry = (id, versions, intervals) => ({ ...structuredClone(csrd), id, title: "Rail fixture " + id, versions, intervals });
  const row = (tag, in_force, kind, language, extra = {}) => ({ ...structuredClone(csrd.versions[0]), commit: fake(tag), in_force, kind, language, ...extra });
  const interval = (r, from) => ({ commit: r.commit, from, state: "in_force" });
  const variant = (name, e) => {
    const d = JSON.parse(text);
    d.entries.push(e);
    h.addVariant(name, d);
  };
  // 07-fixture-unnamed: CSRD plus a translation dated after the latest named row; no interval names it.
  const unnamed = entry("fixture-unnamed", [...structuredClone(csrd.versions), row("fa", "2026-09-01", "translation", "fr")], structuredClone(csrd.intervals));
  variant("07-fixture-unnamed", unnamed);
  // 07-fixture-mixed: a publication-dated row between two dated rows; the intervals name the 2000 and the 2020 rows.
  const m = [row("b0", "2000-01-01", "adopted", "en"), row("b1", "2010-01-01", "consolidated", "en", { date_basis: "publication" }), row("b2", "2020-01-01", "consolidated", "en")];
  const mixed = entry("fixture-mixed", m, [interval(m[0], "2000-01-01"), interval(m[2], "2020-01-01")]);
  variant("07-fixture-mixed", mixed);
  // 07-fixture-move: two rows on 2010-01-01 in file order r1, r2; the interval names r2.
  const v = [row("c0", "2000-01-01", "consolidated", "en"), row("c1", "2010-01-01", "adopted", "fr"), row("c2", "2010-01-01", "consolidated", "fr")];
  const move = entry("fixture-move", v, [interval(v[0], "2000-01-01"), interval(v[2], "2010-01-01")]);
  variant("07-fixture-move", move);
  const reversed = reversedRuns(real);
  h.addVariant("07-reversed", reversed);
  const X = { real, byId, E: JSON.parse(fs.readFileSync(h.expected, "utf8")), reversed, unnamed, mixed, move };

  for (const [name, fn] of [["AC1", ac1], ["AC2", ac2], ["AC3", ac3], ["AC4", ac4], ["AC5", ac5], ["AC6", ac6], ["AC7", ac7], ["AC8", ac8], ["AC9", ac9]]) {
    try {
      await fn(h, X);
    } catch (e) {
      h.check("07-" + name, "check ran to the end", false, "threw: " + e.message);
    }
  }
}
