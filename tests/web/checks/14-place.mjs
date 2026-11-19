// Checks for STORY-GEL-34-14 (unit U1, the place view): #place=XX opens a page for one place inside index.html.
// tests/web/check.mjs imports this file after the story 04 criteria. Tags start with "14".
//
// The expected side never comes from web/*.js: names, counts, sort order, cells, version rows and states are written here from the data
// file read in Node (h.data), and the words ("laws", "text stored", "No law is recorded ...") from the story. "Today" is the page's own
// GEL.dates.today() read once per page (the one clock the page has, so the State column and the Look up addresses can be computed).
// The row links of Browse by place (the other half of the story) are not checked here.
//
// What it proves (acceptance criteria 1 to 6 of the story, bar the Browse links):
//   14-eu-*        AC1  #place=EU on a first load: heading, back link, totals, read line, caption, headers, one row per entry, each cell equal to
//                       the entry's field, sorted by title; header, main and Browse by place hidden, footer shown; focus not moved
//   14-hr-*        AC2  #place=HR by hashchange: focus on the heading; every stored law's details summary and, opened, its version rows; State
//   14-link-only   AC3  the first place holding link-only laws only: every row link only in Stored and State, no details
//   14-register    AC3  a place with link-only laws with and without register_date: "register date {date}" only where the file has one
//   14-empty       AC3  every place with no law shows the sentence and no table; 14-unknown #place=QQ; 14-lower #place=eu
//   14-sweep       AC1  every place, by hashchange: the row ids in sorted order, the heading, the sentence of an empty place; rows add up to the file
//   14-back, 14-lookup, 14-history, 14-law-address, 14-browse-address   AC4  the links out of the view and the addresses around it
//   14-fixture-*   AC5  a data variant: archive copy, publication date, "1 version", repealed, not yet in force, no official link, tie on title
//   14-stack, 14-320   AC6  table at 1280 px, cards at 320 px; no sideways scroll at 320 px at 100% and 200% text, EU and LU (485-character title)
//   14-hygiene     AC6  nothing on console.error or uncaught, no request after the data file, one "new Date" in web/*.js, no hex colour in place.css
// What it does NOT prove: Lighthouse, screen readers, Safari and Firefox (by hand later).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../web");
const q = JSON.stringify;
const call = (fn, ...args) => "(" + fn + ")(" + args.map((a) => JSON.stringify(a)).join(",") + ")";
const NO_LAW = "No law is recorded in the register for this place.";
const KIND = { consolidated: "Consolidated version", adopted: "Adopted version", translation: "Translation", repeal: "repeal record" };
const NEW_TAB = " (opens in a new tab)";
const BAD_WORDS = /\b(undefined|null|NaN)\b/;

// ---------- expected side, from the data file ----------
const byTitle = (a, b) => a.title.localeCompare(b.title, "en") || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const entriesOf = (data, code) => data.entries.filter((e) => e.place === code).sort(byTitle);

function stateOn(e, today) {
  if (!e.intervals) return "link only";
  let best = null;
  for (const iv of e.intervals) if (iv.from <= today && (!best || iv.from >= best.from)) best = iv;
  return !best ? "not yet in force" : best.state === "repealed" ? "repealed" : "in force";
}

const headersOn = (today) => ["Law", "Stored", "State on " + today, "Law family", "Tier", "Duty on", "Verification", "Official link", "Look up"];
const ext = (href, text) => ({ text: text + NEW_TAB, href, target: "_blank", rel: "noopener" });

function wantRow(e, today, snap9) {
  const n = e.versions.length;
  return {
    title: e.title,
    citation: e.citation || "",
    summary: n ? (n === 1 ? "1 version" : n + " versions") : "",
    versions: e.versions.map((v) => ({
      spans: [v.date_basis ? v.in_force + " (publication date)" : v.in_force, KIND[v.kind] ?? v.kind, "Language: " + v.language, "Licence: " + v.licence, ...(v.copy === "archive" ? ["archive copy"] : [])],
      link: ext(v.source_url, "Source"),
    })),
    cells: [
      { own: n ? "text stored" : "link only", spans: !n && e.register_date ? ["register date " + e.register_date] : [], links: [] },
      { own: stateOn(e, today), spans: [], links: [] },
      { own: e.law_family, spans: [], links: [] },
      { own: e.tier_label, spans: [], links: [] },
      { own: e.duty_on, spans: [], links: [] },
      { own: e.verification, spans: [], links: [] },
      e.official_url ? { own: "", spans: [], links: [ext(e.official_url, "Official page")] } : { own: "no official link", spans: [], links: [] },
      { own: "", spans: [], links: [{ text: "Look up", href: "#" + new URLSearchParams({ law: e.id, date: today, snapshot: snap9 }), target: null, rel: null }] },
    ],
  };
}

const totalsLine = (list) => {
  const stored = list.filter((e) => e.versions.length).length;
  return list.length + " " + (list.length === 1 ? "law" : "laws") + ": " + stored + " text stored, " + (list.length - stored) + " link only";
};

// ---------- the page side (serialised with toString: nothing from this module is visible there) ----------
function pageRead() {
  try {
    const s = document.getElementById("place-view");
    const vis = (e) => !!e && e.checkVisibility();
    const text = (e) => (e ? e.textContent : null);
    const link = (a) => a && { text: a.textContent, href: a.getAttribute("href"), target: a.getAttribute("target"), rel: a.getAttribute("rel") };
    const spansOf = (node) => [...node.children].filter((c) => c.tagName === "SPAN");
    const table = s.querySelector("table");
    const h2 = s.querySelector("h2");
    return {
      view: document.body.getAttribute("data-view"),
      shown: { header: vis(document.querySelector("header")), main: vis(document.querySelector("main")), browse: vis(document.getElementById("browse-by-place")), footer: vis(document.querySelector("footer")), view: vis(s) },
      children: s.children.length,
      back: link(s.querySelector('a[href="#browse-by-place"]')),
      heading: text(h2),
      headingTabindex: h2 && h2.getAttribute("tabindex"),
      blocks: [...s.querySelectorAll("h2, p")].map((n) => n.textContent),
      paragraphs: [...s.querySelectorAll(":scope > p")].filter((n) => !n.querySelector("a")).map((n) => n.textContent),
      focus: document.activeElement === document.body ? "body" : document.activeElement === h2 ? "heading" : document.activeElement.tagName,
      caption: text(s.querySelector("caption")),
      table: !!table,
      headers: [...s.querySelectorAll("thead th")].map((th) => [th.textContent, th.getAttribute("scope")]),
      rows: [...s.querySelectorAll("tbody tr")].map((tr) => {
        const th = tr.querySelector("th");
        const lead = spansOf(th);
        const det = th.querySelector("details");
        const href = tr.querySelector("td:last-child a").getAttribute("href");
        return {
          id: new URLSearchParams(href.slice(1)).get("law"),
          scope: th.getAttribute("scope"),
          title: text(lead[0]),
          citation: lead[1] ? lead[1].textContent : "",
          summary: det ? text(det.querySelector("summary")) : "",
          details: det ? det.querySelectorAll(":scope > summary").length : 0,
          open: det ? det.open : null,
          versions: det ? [...det.querySelectorAll("li")].map((li) => ({ spans: spansOf(li).map((x) => x.textContent), link: link(li.querySelector("a")) })) : [],
          cells: [...tr.querySelectorAll("td")].map((td) => ({
            label: td.getAttribute("data-label"),
            own: [...td.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(""),
            spans: spansOf(td).map((x) => x.textContent),
            links: [...td.querySelectorAll("a")].map(link),
          })),
        };
      }),
    };
  } catch (e) {
    return { error: String(e) };
  }
}

// Every place by hashchange, with what the view holds for each. The throttle of Chrome on navigations is the reason for the pause.
async function pageSweep(codes, pause) {
  const out = {};
  for (const code of codes) {
    const changed = new Promise((ok) => addEventListener("hashchange", ok, { once: true }));
    location.hash = "#place=" + code;
    await changed;
    const s = document.getElementById("place-view");
    out[code] = {
      heading: s.querySelector("h2") && s.querySelector("h2").textContent,
      paragraphs: [...s.querySelectorAll(":scope > p")].filter((p) => !p.querySelector("a")).map((p) => p.textContent),
      ids: [...s.querySelectorAll("tbody tr")].map((tr) => new URLSearchParams(tr.querySelector("td:last-child a").getAttribute("href").slice(1)).get("law")),
      tables: s.querySelectorAll("table").length,
    };
    await new Promise((ok) => setTimeout(ok, pause));
  }
  return out;
}

function pageMeasure(width) {
  const d = document.documentElement, over = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if ((r.width || r.height) && r.right > width + 0.5) over.push(el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + " right " + Math.round(r.right));
  }
  const table = document.getElementById("place-table");
  const head = table && table.querySelector("thead");
  return {
    innerW: window.innerWidth, scrollW: d.scrollWidth, root: getComputedStyle(d).fontSize, over: over.slice(0, 6),
    table: table && getComputedStyle(table).display, thead: head && getComputedStyle(head).display,
  };
}

const RECORDER = "(() => {" +
  " window.__errs = [];" +
  " const original = console.error;" +
  " console.error = (...args) => { window.__errs.push(args.map(String).join(' ')); original.apply(console, args); };" +
  " window.addEventListener('error', (e) => window.__errs.push('uncaught: ' + e.message));" +
  " window.addEventListener('unhandledrejection', (e) => window.__errs.push('unhandled rejection: ' + e.reason));" +
  "})()";

const READY = '!!(window.GEL && GEL.data && !document.getElementById("example").disabled && !document.getElementById("date").disabled)';

export async function run(h) {
  const real = JSON.parse(fs.readFileSync(h.data, "utf8"));
  const snap9 = real.snapshot.history_commit.slice(0, 9);
  const base = "http://127.0.0.1:" + h.port;
  const recorder = await h.send("Page.addScriptToEvaluateOnNewDocument", { source: RECORDER });

  const section = async (tag, fn) => {
    try { await fn(); } catch (e) { h.check(tag, "check ran to the end", false, "threw: " + e.message); }
  };
  const read = async () => {
    const d = await h.evaluate(call(pageRead));
    if (d.error) throw new Error("reading the view: " + d.error);
    return d;
  };
  const errors = async (label) => ((await h.evaluate("window.__errs")) || []).map((e) => label + ": " + e);
  const today = () => h.evaluate("GEL.dates.today()");
  // A first load at an address: a new document, so the page draws from the address and moves no focus.
  const fresh = async (hash = "", variant = "ok") => {
    await h.open(variant);
    await h.navigate("about:blank");
    await h.navigate(base + "/" + hash);
    await h.waitFor(READY, 10000);
  };
  // A hashchange, as a click on a link does it.
  const go = async (hash, until) => {
    await h.evaluate("location.hash = " + q(hash));
    await h.waitFor(until);
  };
  const viewIs = (heading) => "document.body.getAttribute('data-view') === 'place' && (document.querySelector('#place-view h2') || {}).textContent === " + q(heading);
  const closed = "!document.body.hasAttribute('data-view')";

  // Compares what the page holds for a place with what the data file says. Returns the problems.
  function viewProblems(d, code, name, list, day) {
    const problems = [];
    const stored = list.filter((e) => e.versions.length).length;
    if (d.view !== "place") problems.push("body data-view is " + q(d.view));
    problems.push(...h.eqs([["heading", d.heading, name + " (" + code + ")"], ["back link", q(d.back), q({ text: "Back to Browse by place", href: "#browse-by-place", target: null, rel: null })]]));
    if (!list.length) {
      problems.push(...h.eqs([["paragraphs", q(d.paragraphs), q([NO_LAW])], ["tables", d.table, false]]));
      return problems;
    }
    problems.push(...h.eqs([
      ["totals line", d.paragraphs[0], totalsLine(list)],
      ["read line", d.paragraphs[1], "Corpus read " + real.snapshot.read_on + " · Snapshot " + snap9],
      ["table", d.table, true], ["rows", d.rows.length, list.length], ["stored count used", stored >= 0, true],
    ]));
    if (!(d.caption || "").includes(name)) problems.push("caption " + q(d.caption) + " does not hold the place name " + q(name));
    problems.push(...h.eqs([["column headers", q(d.headers), q(headersOn(day).map((t) => [t, "col"]))]]));
    for (let i = 0; i < list.length && problems.length < 8; i++) {
      const w = wantRow(list[i], day, snap9), g = d.rows[i];
      if (!g) { problems.push("row " + i + " is missing (" + list[i].id + ")"); continue; }
      const label = code + " row " + (i + 1) + " " + list[i].id;
      problems.push(...h.eqs([
        [label + " id", g.id, list[i].id], [label + " row header scope", g.scope, "row"], [label + " title", g.title, w.title], [label + " citation", g.citation, w.citation],
        [label + " details summary", g.summary, w.summary], [label + " details count", g.details, w.versions.length ? 1 : 0],
        [label + " version rows", q(g.versions), q(w.versions)],
        [label + " cell labels", g.cells.map((c) => c.label).join("|"), headersOn(day).slice(1).join("|")],
        [label + " cells", q(g.cells.map(({ own, spans, links }) => ({ own, spans, links }))), q(w.cells)],
      ]));
    }
    const words = d.rows.flatMap((r) => [r.summary, ...r.cells.flatMap((c) => [c.own, ...c.spans]), ...r.versions.flatMap((v) => v.spans.slice(0, 3))]).join(" | ");
    if (BAD_WORDS.test(words)) problems.push("a cell or version row holds undefined, null or NaN");
    return problems;
  }

  try {
    // ---- AC1: a first load at #place=EU ----
    await section("14-eu", async () => {
      await fresh("#place=EU");
      const day = await today();
      const d = await read();
      const list = entriesOf(real, "EU");
      const problems = viewProblems(d, "EU", real.places.EU, list, day);
      problems.push(...(list.length > 0 ? [] : ["the data file holds no EU entry"]));
      h.verdict("14-eu-view", "a first load at #place=EU: the heading, back link, totals line, read line, caption, headers and one row per EU entry (" + list.length + "), each cell equal to the entry's field, sorted by title (localeCompare, then id)", problems);
      h.verdict("14-eu-hidden", "with the view open the header, main and Browse by place are not displayed, the footer and the view are", h.eqs([
        ["header shown", d.shown.header, false], ["main shown", d.shown.main, false], ["browse shown", d.shown.browse, false], ["footer shown", d.shown.footer, true], ["view shown", d.shown.view, true],
      ]));
      h.verdict("14-eu-focus", "a first load moves no focus (the heading carries tabindex -1 and is not focused)", h.eqs([["focus", d.focus, "body"], ["heading tabindex", d.headingTabindex, "-1"]]));
      h.verdict("14-eu-errors", "the first load at #place=EU puts nothing on console.error and throws nothing", await errors("eu"));
    });

    // ---- AC2: HR by hashchange ----
    await section("14-hr", async () => {
      await fresh("");
      await go("#place=HR", viewIs(real.places.HR + " (HR)"));
      const day = await today();
      const d = await read();
      const list = entriesOf(real, "HR");
      const problems = viewProblems(d, "HR", real.places.HR, list, day);
      const stored = list.filter((e) => e.versions.length).length;
      problems.push(...(stored > 0 ? [] : ["HR holds no stored law in the data file"]));
      h.verdict("14-hr-rows", "#place=HR by hashchange: every row equals the entry (summary " + q("n versions") + ", every version row with date, kind, language, licence and source link, State from intervals for " + day + ")", problems);
      h.verdict("14-hr-focus", "a view opened by a hashchange puts focus on its heading", h.eqs([["focus", d.focus, "heading"]]));
      const states = new Set(list.map((e) => stateOn(e, day)));
      h.verdict("14-hr-states", "HR reads at least two different States for " + day + " (a column that says one thing for every law proves nothing)", states.size >= 2 ? [] : ["only " + q([...states])]);
      // a closed details hides its rows, an open one shows them
      const open = await h.evaluate("(() => { const d = document.querySelector('#place-view details'); const items = [...d.querySelectorAll('li')]; const before = items.map((li) => li.checkVisibility()); d.open = true; return { before, after: items.map((li) => li.checkVisibility()), n: items.length }; })()");
      h.verdict("14-hr-details", "a details of stored versions hides its rows until opened and then shows all of them", [
        ...(open.n > 0 ? [] : ["no version row"]), ...(open.before.some(Boolean) ? ["a version row shows while closed"] : []), ...(open.after.every(Boolean) ? [] : ["a version row stays hidden once opened"]),
      ]);
      h.verdict("14-hr-errors", "opening HR puts nothing on console.error", await errors("hr"));
    });

    // ---- AC3: a place holding link-only laws only, one holding both kinds of link-only law, and the places with no law ----
    await section("14-link-only", async () => {
      const codes = Object.keys(real.places).sort();
      const only = codes.find((c) => { const l = entriesOf(real, c); return l.length && l.every((e) => !e.versions.length); });
      await fresh("");
      await go("#place=" + only, viewIs(real.places[only] + " (" + only + ")"));
      const day = await today();
      const d = await read();
      const problems = viewProblems(d, only, real.places[only], entriesOf(real, only), day);
      for (const r of d.rows) {
        problems.push(...h.eqs([[r.id + " Stored", r.cells[0].own, "link only"], [r.id + " State", r.cells[1].own, "link only"], [r.id + " details", r.details, 0]]));
      }
      h.verdict("14-link-only", "the first place holding link-only laws only (" + only + ", " + d.rows.length + " rows): every row reads link only in Stored and State and has no details", [...problems, ...(d.rows.length ? [] : ["no row"])]);
    });
    await section("14-register", async () => {
      const codes = Object.keys(real.places).sort();
      const both = codes.find((c) => { const l = entriesOf(real, c).filter((e) => !e.versions.length); return l.some((e) => e.register_date) && l.some((e) => !e.register_date); });
      await fresh("");
      await go("#place=" + both, viewIs(real.places[both] + " (" + both + ")"));
      const d = await read();
      const problems = viewProblems(d, both, real.places[both], entriesOf(real, both), await today());
      const dated = d.rows.filter((r) => r.cells[0].spans.length), plain = d.rows.filter((r) => !r.cells[0].spans.length && r.cells[0].own === "link only");
      problems.push(...(dated.length && plain.length ? [] : ["the place does not hold both a dated and an undated link-only law"]));
      for (const r of plain) if (r.cells[0].own + r.cells[0].spans.join("") !== "link only") problems.push(r.id + " shows more than 'link only'");
      h.verdict("14-register", "in " + both + " a link-only law with register_date reads 'register date {date}' (" + dated.length + " rows) and one without shows no date and no 'undefined' (" + plain.length + " rows)", problems);
    });
    await section("14-empty", async () => {
      const none = Object.keys(real.places).sort().filter((c) => !entriesOf(real, c).length);
      await fresh("");
      const problems = [];
      for (const code of none) {
        await go("#place=" + code, viewIs(real.places[code] + " (" + code + ")"));
        problems.push(...viewProblems(await read(), code, real.places[code], [], await today()));
      }
      problems.push(...(none.length ? [] : ["every place holds a law in the data file; nothing to check"]));
      h.verdict("14-empty", "each of the " + none.length + " places with no law (" + none.slice(0, 3).join(", ") + "...) shows its heading, the sentence " + q(NO_LAW) + " and the back link, and no table", problems);
    });
    await section("14-unknown", async () => {
      await fresh("#place=QQ");
      const d = await read();
      h.verdict("14-unknown", "#place=QQ on a first load: 'No place QQ in this snapshot.' and the back link, no table", [
        ...h.eqs([["view", d.view, "place"], ["table", d.table, false], ["back link", q(d.back), q({ text: "Back to Browse by place", href: "#browse-by-place", target: null, rel: null })]]),
        ...(d.blocks.includes("No place QQ in this snapshot.") ? [] : ["blocks " + q(d.blocks)]),
        ...(await errors("unknown")),
      ]);
      await fresh("");
      await go("#place=eu", viewIs(real.places.EU + " (EU)"));
      const e = await read();
      h.verdict("14-lower", "#place=eu opens the EU view (the code is upper-cased)", viewProblems(e, "EU", real.places.EU, entriesOf(real, "EU"), await today()));
    });

    // ---- AC1 for every place ----
    await section("14-sweep", async () => {
      await fresh("");
      const codes = Object.keys(real.places).sort();
      const got = await h.evaluate(call(pageSweep, codes, 70));
      const problems = [];
      let rows = 0;
      for (const code of codes) {
        const list = entriesOf(real, code), g = got[code];
        rows += g.ids.length;
        if (g.ids.join("|") !== list.map((e) => e.id).join("|")) problems.push(code + ": rows " + g.ids.length + ", want " + list.length + " (or the order differs)");
        if (g.heading !== real.places[code] + " (" + code + ")") problems.push(code + ": heading " + q(g.heading));
        if (!list.length && (g.paragraphs.join("|") !== NO_LAW || g.tables)) problems.push(code + ": empty place shows " + q(g.paragraphs) + " and " + g.tables + " tables");
        if (list.length && g.tables !== 1) problems.push(code + ": " + g.tables + " tables");
      }
      h.verdict("14-sweep", "all " + codes.length + " places by hashchange: the row ids in sorted order equal the data file's, " + rows + " rows in all against " + real.entries.length + " entries", [
        ...problems.slice(0, 8), ...(rows === real.entries.length ? [] : ["rows add up to " + rows + ", the file holds " + real.entries.length]), ...(await errors("sweep")),
      ]);
    });

    // ---- AC4: the links out of the view and the addresses around it ----
    const inViewport = "(() => { const r = document.getElementById(%ID%).getBoundingClientRect(); return { top: Math.round(r.top), height: innerHeight }; })()";
    await section("14-back", async () => {
      await fresh("");
      await go("#place=EU", viewIs(real.places.EU + " (EU)"));
      await h.evaluate("document.querySelector('#place-view a[href=\"#browse-by-place\"]').click()");
      await h.waitFor(closed);
      const d = await read();
      const at = await h.evaluate(inViewport.replace("%ID%", q("browse-heading")));
      h.verdict("14-back", "following 'Back to Browse by place' closes the view, shows the page and lands on the Browse by place heading (top " + at.top + " px of a " + at.height + " px window)", [
        ...h.eqs([["data-view", d.view, null], ["view children", d.children, 0], ["header", d.shown.header, true], ["main", d.shown.main, true], ["browse", d.shown.browse, true], ["hash", await h.evaluate("location.hash"), "#browse-by-place"]]),
        ...(at.top >= 0 && at.top < 120 ? [] : ["the heading is " + at.top + " px from the top"]),
      ]);
    });
    await section("14-lookup", async () => {
      await fresh("");
      await h.evaluate("window.__res = performance.getEntriesByType('resource').length");
      await go("#place=HR", viewIs(real.places.HR + " (HR)"));
      const day = await today();
      const last = entriesOf(real, "HR").at(-1);
      await h.evaluate("(() => { const a = [...document.querySelectorAll('#place-view tbody tr')].at(-1).querySelector('td:last-child a'); a.scrollIntoView(); window.scrollBy(0, 200); a.click(); })()");
      await h.waitFor("document.getElementById('answer-panel').getAttribute('data-id') === " + q(last.id));
      const p = await h.panel();
      const d = await read();
      const at = await h.evaluate(inViewport.replace("%ID%", q("answer-panel")));
      const res = await h.evaluate("performance.getEntriesByType('resource').length - window.__res");
      h.verdict("14-lookup", "'Look up' on the last HR row (" + last.id + ") closes the view and shows that law's answer for " + day + " near the top of the page, with no request", [
        ...h.eqs([["panel id", p.id, last.id], ["panel date", p.date, day], ["panel shown", p.shown, true], ["data-view", d.view, null], ["hash", (await h.evaluate("location.hash")).startsWith("#law=" + last.id), true], ["requests after the load", res, 0]]),
        ...(at.top >= 0 && at.top < at.height ? [] : ["the answer is " + at.top + " px from the top of a " + at.height + " px window"]),
        ...(await errors("lookup")),
      ]);
    });
    await section("14-history", async () => {
      await fresh("");
      await h.evaluate("document.getElementById('browse-heading').scrollIntoView()");
      await go("#place=EU", viewIs(real.places.EU + " (EU)"));
      await h.evaluate("history.back()");
      await h.waitFor(closed);
      const at = await h.evaluate(inViewport.replace("%ID%", q("browse-heading")));
      const d = await read();
      h.verdict("14-history", "browser Back from a view opened by a hash change returns to Browse by place (heading " + at.top + " px from the top)", [
        ...h.eqs([["hash", await h.evaluate("location.hash"), ""], ["data-view", d.view, null], ["browse shown", d.shown.browse, true]]), ...(at.top >= 0 && at.top < 120 ? [] : ["the heading is " + at.top + " px from the top"]),
      ]);
    });
    await section("14-close-lands", async () => {
      await fresh("#place=EU"); // no earlier entry and no anchor to scroll to: the page has to put the visitor at Browse by place itself
      await go("#", closed);
      const at = await h.evaluate(inViewport.replace("%ID%", q("browse-heading")));
      h.verdict("14-close-lands", "an address that leaves the view for none (#) lands on the Browse by place heading (" + at.top + " px from the top)", at.top >= 0 && at.top < 120 ? [] : ["the heading is " + at.top + " px from the top"]);
    });
    await section("14-law-address", async () => {
      const id = "eu-csrd-2022-2464";
      await fresh("#law=" + id + "&date=2025-06-01");
      const p = await h.panel();
      const d = await read();
      h.verdict("14-law-address", "#law=" + id + "&date=2025-06-01 on a first load still opens its answer and no place view", [...h.eqs([["panel id", p.id, id], ["panel date", p.date, "2025-06-01"], ["data-view", d.view, null], ["view children", d.children, 0]]), ...(await errors("law"))]);
      await go("#place=EU", viewIs(real.places.EU + " (EU)"));
      await go("#law=" + id + "&date=2024-01-01", closed);
      await h.waitFor("document.getElementById('answer-panel').getAttribute('data-date') === '2024-01-01'");
      h.verdict("14-law-hash", "a law address typed over an open place view closes the view and opens that answer", h.eqs([["panel id", (await h.panel()).id, id], ["data-view", (await read()).view, null]]));
      await fresh("#place=EU&law=" + id + "&date=2023-03-03");
      const both = await read();
      h.verdict("14-law-wins", "an address naming both a place and a law opens the law's answer and no place view", [...h.eqs([["panel id", (await h.panel()).id, id], ["panel date", (await h.panel()).date, "2023-03-03"], ["data-view", both.view, null], ["view children", both.children, 0]]), ...(await errors("both"))]);
    });
    await section("14-browse-address", async () => {
      await fresh("#browse-by-place");
      const d = await read();
      h.verdict("14-browse-address", "#browse-by-place on a first load opens no place view, and the same by hashchange", [
        ...h.eqs([["data-view", d.view, null], ["view children", d.children, 0], ["main shown", d.shown.main, true]]),
        ...(await (async () => { await go("#place=EU", viewIs(real.places.EU + " (EU)")); await go("#browse-by-place", closed); const e = await read(); return h.eqs([["after, data-view", e.view, null], ["after, children", e.children, 0]]); })()),
      ]);
    });

    // ---- AC5: a data variant with the shapes the real file lacks ----
    await section("14-fixture", async () => {
      const stored = structuredClone(real.entries.find((e) => e.id === "eu-csrd-2022-2464"));
      const link = structuredClone(real.entries.find((e) => !e.versions.length));
      const c1 = "1".repeat(40), c2 = "2".repeat(40), c3 = "3".repeat(40);
      const row = (extra) => ({ commit: c1, in_force: "2001-02-03", kind: "adopted", language: "en", licence: "Fixture licence", source_url: "https://example.org/v", ...extra });
      const mk = (proto, id, title, extra) => Object.assign(structuredClone(proto), { id, place: "ZZ", title }, extra);
      const entries = [
        mk(stored, "z-archive", "B archive and publication date", {
          versions: [row({ date_basis: "publication", source_url: "https://example.org/a" }), row({ commit: c2, in_force: "2010-01-01", kind: "consolidated", copy: "archive", source_url: "https://web.archive.org/a" })],
          intervals: [{ from: "2001-02-03", state: "in_force", commit: c1 }, { from: "2010-01-01", state: "in_force", commit: c2 }],
        }),
        mk(stored, "z-single", "A single version", { versions: [row({ kind: "translation", language: "fr" })], intervals: [{ from: "2001-02-03", state: "in_force", commit: c1 }] }),
        mk(stored, "z-repealed", "C repealed", {
          versions: [row(), row({ commit: c2, in_force: "2005-05-05", kind: "repeal", message: "Repealed." })],
          intervals: [{ from: "2001-02-03", state: "in_force", commit: c1 }, { from: "2005-05-05", state: "repealed", commit: c2 }],
        }),
        mk(stored, "z-future", "D not yet in force", { versions: [row({ commit: c3, in_force: "2999-01-01" })], intervals: [{ from: "2999-01-01", state: "in_force", commit: c3 }] }),
        mk(link, "z-link-reg", "E link only with a register date", { register_date: "2024-03-01" }),
        mk(link, "z-link-plain", "F link only without a date", { register_date: undefined }),
        mk(link, "z-no-url", "G no official link", { register_date: undefined, official_url: undefined }),
        mk(link, "z-tie-b", "Same title", {}),
        mk(link, "z-tie-a", "Same title", {}),
      ].map((e) => JSON.parse(JSON.stringify(e)));
      const data = structuredClone(real);
      data.places.ZZ = "Zland";
      data.entries.push(...entries);
      h.addVariant("14-zland", data);
      await fresh("#place=ZZ", "14-zland");
      const day = await today();
      const d = await read();
      const list = entriesOf(data, "ZZ");
      const problems = viewProblems(d, "ZZ", "Zland", list, day);
      const by = Object.fromEntries(d.rows.map((r) => [r.id, r]));
      const arch = by["z-archive"];
      problems.push(...h.eqs([
        ["row order", d.rows.map((r) => r.id).join("|"), "z-single|z-archive|z-repealed|z-future|z-link-reg|z-link-plain|z-no-url|z-tie-a|z-tie-b"],
        ["z-archive summary", arch.summary, "2 versions"], ["z-single summary", by["z-single"].summary, "1 version"],
        ["z-archive version 1 date", arch.versions[0].spans[0], "2001-02-03 (publication date)"], ["z-archive version 2 date", arch.versions[1].spans[0], "2010-01-01"],
        ["z-archive version 2 last label", arch.versions[1].spans.at(-1), "archive copy"], ["z-archive version 1 labels", arch.versions[0].spans.length, 4],
        ["z-repealed kind", by["z-repealed"].versions[1].spans[1], "repeal record"], ["z-single kind", by["z-single"].versions[0].spans[1], "Translation"],
        ["z-repealed State", by["z-repealed"].cells[1].own, "repealed"], ["z-future State", by["z-future"].cells[1].own, "not yet in force"], ["z-archive State", arch.cells[1].own, "in force"],
        ["z-no-url Official link", by["z-no-url"].cells[6].own + by["z-no-url"].cells[6].links.length, "no official link0"],
        ["z-link-reg Stored", by["z-link-reg"].cells[0].own + "|" + by["z-link-reg"].cells[0].spans.join(), "link only|register date 2024-03-01"], ["z-link-plain Stored", by["z-link-plain"].cells[0].own + "|" + by["z-link-plain"].cells[0].spans.join(), "link only|"],
      ]));
      h.verdict("14-fixture", "a data variant: archive copy and publication date in the version list, '1 version', 'repeal record', repealed, not yet in force, no official link, a link-only row with and without a register date, a tie on title ordered by id", [...problems, ...(await errors("fixture"))]);
    });

    // ---- AC6: layout ----
    const metrics = (width) => h.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await section("14-stack", async () => {
      await metrics(1280);
      await fresh("#place=EU");
      const wide = await h.evaluate(call(pageMeasure, 1280));
      await metrics(320);
      await fresh("#place=EU");
      const narrow = await h.evaluate(call(pageMeasure, 320));
      h.verdict("14-stack", "the table is a table at 1280 px and stacks into cards at 320 px (thead hidden)", [
        ...h.eqs([["1280 table", wide.table, "table"], ["1280 thead", wide.thead, "table-header-group"], ["320 table", narrow.table, "block"], ["320 thead", narrow.thead, "none"]]),
        ...(wide.scrollW > 1280 ? ["sideways scroll at 1280 px: " + wide.scrollW + " " + wide.over.join("; ")] : []),
      ]);
    });
    await section("14-320", async () => {
      const LU = "lu-sfdr-law-2022";
      const long = real.entries.find((e) => e.id === LU);
      for (const [code, label] of [["EU", "EU"], [long.place, "the " + long.title.length + "-character title of " + LU]]) {
        for (const [text, root] of [["100%", "16px"], ["200%", "32px"]]) {
          await metrics(320);
          await fresh("#place=" + code);
          if (text === "200%") await h.evaluate("document.documentElement.style.fontSize = '200%'");
          const m = await h.evaluate(call(pageMeasure, 320));
          const d = await read();
          h.verdict("14-320", "320 px window, text " + text + ", " + code + " (" + label + "): the view shows " + d.rows.length + " rows and the page needs no sideways scroll", [
            ...h.eqs([["window", m.innerW, 320], ["root font", m.root, root], ["rows", d.rows.length, entriesOf(real, code).length]]),
            ...(m.scrollW > 320 ? ["document scrollWidth " + m.scrollW + " > 320; reach past 320: " + m.over.join("; ")] : []),
            ...(code === long.place && !d.rows.some((r) => r.title === long.title) ? ["the long title is not in the view"] : []),
          ]);
        }
      }
    });

    // ---- AC6: hygiene ----
    await section("14-hygiene", async () => {
      const files = fs.readdirSync(WEB).filter((f) => f.endsWith(".js"));
      const dates = files.reduce((n, f) => n + (fs.readFileSync(path.join(WEB, f), "utf8").match(/new Date\b/g) || []).length, 0);
      const hex = fs.readFileSync(path.join(WEB, "place.css"), "utf8").match(/#[0-9a-fA-F]{3,8}\b/g) || [];
      h.verdict("14-hygiene", "web/*.js holds one 'new Date' across " + files.length + " files, place.css writes no hex colour, and place.js is in index.html once", [
        ...h.eqs([["new Date", dates, 1], ["hex colours in place.css", q(hex), "[]"], ["place.js tags", (fs.readFileSync(path.join(WEB, "index.html"), "utf8").match(/src="place\.js"/g) || []).length, 1]]),
      ]);
    });
  } finally {
    await h.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: recorder.identifier }).catch(() => {});
  }
}
