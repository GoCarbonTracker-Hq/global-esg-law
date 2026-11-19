// Story 09: browse coverage by place. The expected side comes from the data file (h.data), from
// expected.json and from the story, never from web/browse.js. Fixtures go through h.addVariant.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../web");
const RGB = { stored: "rgb(27, 94, 32)", "link-only": "rgb(255, 179, 0)", none: "rgb(224, 224, 224)" }; // #1b5e20, #ffb300, #e0e0e0 (UX spec lines 275 and 408)
const STORY = { places: 250, stored: 140, linkOnly: 86, none: 24, laws: 1404, textStored: 851, linkOnlyLaws: 553 }; // read 2026-11-17, origin/history 55c8c2a9c
const LEGEND = ["text stored: at least one law with stored text", "link only: links and no stored text", "no corpus: no law for this place"];
const HEADERS = ["Place", "Instruments", "Text stored", "Link only"];
const sum = (xs) => xs.reduce((t, x) => t + x, 0);

// Counts from the entries of a data file: one row per listed place, sorted by code.
function expectFrom(data) {
  const rows = new Map(Object.keys(data.places).sort().map((code) => [code, { code, name: data.places[code], stored: 0, link: 0 }]));
  for (const e of data.entries) if (rows.has(e.place)) rows.get(e.place)[e.versions.length ? "stored" : "link"] += 1;
  const list = [...rows.values()].map((r) => ({ ...r, state: r.stored ? "stored" : r.link ? "link-only" : "none" }));
  const n = (s) => list.filter((r) => r.state === s).length;
  return {
    rows: list,
    places: list.length,
    byState: { stored: n("stored"), "link-only": n("link-only"), none: n("none") },
    laws: data.entries.length,
    textStored: data.entries.filter((e) => e.versions.length).length,
    linkOnlyLaws: data.entries.filter((e) => !e.versions.length).length,
  };
}

// The three functions below run in the page (serialised with toString): they use nothing from this module.
// Everything the checks read from the section, in one call. A throw comes back as {error}.
function pageRead() {
  try {
    const s = document.getElementById("browse-by-place");
    const q = (sel) => s.querySelector(sel);
    const grid = q("#browse-grid"), note = q("#browse-check"), read = q("#browse-read"), totals = q("#browse-totals");
    const bg = (el) => getComputedStyle(el).backgroundColor;
    const text = (el) => (el ? el.textContent : null);
    return {
      check: s.getAttribute("data-check"),
      heading: text(q("h2#browse-heading")),
      labelledby: s.getAttribute("aria-labelledby"),
      totals: text(totals),
      read: text(read),
      note: note ? { text: note.textContent, hidden: note.hidden, shown: note.checkVisibility() } : null,
      gridRole: grid ? grid.getAttribute("role") : null,
      alt: grid ? grid.getAttribute("aria-label") : null,
      cells: grid ? [...grid.querySelectorAll(".cell")].map((c) => ({ region: c.closest(".region") && c.closest(".region").getAttribute("data-region"), code: c.textContent, place: c.getAttribute("data-place"), state: c.getAttribute("data-state"), colour: bg(c) })) : [],
      legend: [...s.querySelectorAll("#browse-legend li")].map((li) => {
        const sw = li.querySelector(".swatch");
        return { text: li.textContent, state: sw && sw.getAttribute("data-state"), colour: sw && bg(sw) };
      }),
      caption: text(q("#browse-table caption")),
      headers: [...s.querySelectorAll("#browse-table thead th")].map((th) => [th.textContent, th.getAttribute("scope")]),
      rows: [...s.querySelectorAll("#browse-table tbody tr[data-place]")].map((tr) => {
        const th = tr.querySelector("th");
        return {
          region: tr.closest("tbody").getAttribute("data-region"),
          place: tr.getAttribute("data-place"),
          head: text(th),
          scope: th && th.getAttribute("scope"),
          links: th ? [...th.querySelectorAll("a")].map((a) => [a.getAttribute("href"), a.textContent]) : [],
          labels: [...tr.querySelectorAll("td")].map((td) => td.getAttribute("data-label")),
          nums: [...tr.querySelectorAll("td")].map((td) => td.textContent),
        };
      }),
      children: [...s.children].map((c) => c.id),
      regionRows: [...s.querySelectorAll("#browse-table tbody tr.region-row th")].map((th) => [th.textContent, th.getAttribute("scope"), th.getAttribute("colspan")]),
    };
  } catch (e) {
    return { error: String(e) };
  }
}

// Overflow, scroll containers, tab stops and the stacked layout of the section, measured where it sits now.
function pageLayout() {
  try {
    const s = document.getElementById("browse-by-place");
    const vw = document.documentElement.clientWidth;
    const name = (el) => el.tagName + (el.id ? "#" + el.id : el.getAttribute("data-place") ? "[" + el.getAttribute("data-place") + "]" : "");
    const over = [], scrollers = [], tabStops = [];
    for (const el of s.querySelectorAll("*")) {
      const b = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (b.width && (b.right > vw + 0.5 || b.left < -0.5)) over.push(name(el));
      if (/(auto|scroll)/.test(cs.overflowX + " " + cs.overflowY) && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) scrollers.push(name(el));
      if (el.matches("a[href],button,input,select,textarea,summary,[tabindex],[contenteditable]")) tabStops.push(el.tagName + " " + (el.getAttribute("href") || ""));
    }
    const cells = [...document.querySelectorAll("#browse-grid .cell")];
    const table = document.getElementById("browse-table"), td = table.querySelector("tbody td");
    return {
      over: over.slice(0, 5), overN: over.length, scrollers: scrollers.slice(0, 5), tabStops,
      docScrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
      gridRows: new Set(cells.map((c) => Math.round(c.getBoundingClientRect().top))).size, cellN: cells.length,
      tableDisplay: getComputedStyle(table).display, theadDisplay: getComputedStyle(table.tHead).display,
      labelContent: getComputedStyle(td, "::before").content, firstLabel: td.getAttribute("data-label"),
      rootFont: getComputedStyle(document.documentElement).fontSize,
    };
  } catch (e) {
    return { error: String(e) };
  }
}

// What a click on the grid or the table must not change.
function pageSnap() {
  const p = document.getElementById("answer-panel");
  return {
    list: document.getElementById("match-list").innerHTML,
    law: document.getElementById("law").value,
    chosen: window.GEL.chosen === undefined ? null : window.GEL.chosen,
    panelHidden: p.hidden, panelId: p.getAttribute("data-id"), panelDate: p.getAttribute("data-date"), panelState: p.getAttribute("data-state"),
    sentence: document.getElementById("answer-sentence").textContent,
    date: document.getElementById("date").value,
    hash: location.hash,
  };
}

function pageCenter(selector) {
  const el = document.querySelector(selector);
  if (!el) return null;
  el.scrollIntoView({ block: "center" });
  const b = el.getBoundingClientRect();
  return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
}

function pageTabStop() {
  const a = document.activeElement;
  return { name: a.id || a.tagName, href: a.getAttribute("href"), inside: !!a.closest("#browse-by-place") };
}

function pageStubLink() {
  window.scrollTo(0, 0);
  const a = document.createElement("a");
  a.href = "#browse-by-place";
  a.textContent = "stub link, as story 06 writes it";
  document.body.prepend(a);
  a.click();
}

function pageLanded() {
  const hd = document.getElementById("browse-heading").getBoundingClientRect(), g = document.getElementById("browse-grid").getBoundingClientRect();
  const t = document.querySelector(":target");
  return { hash: location.hash, target: t && t.id, top: hd.top, gridTop: g.top, h: window.innerHeight };
}

const call = (fn, ...args) => "(" + fn + ")(" + args.map((a) => JSON.stringify(a)).join(",") + ")";

export async function run(h) {
  const real = JSON.parse(fs.readFileSync(h.data, "utf8"));
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  const want = expectFrom(real);
  const entriesWithoutPlace = Object.keys(real.places).filter((c) => !real.entries.some((e) => e.place === c)).sort();

  const readSection = async () => {
    const d = await h.evaluate(call(pageRead));
    if (d.error) throw new Error("reading the section: " + d.error);
    return d;
  };
  const measure = async (label) => {
    const L = await h.evaluate(call(pageLayout));
    if (L.error) throw new Error(label + ": " + L.error);
    return L;
  };
  const clickAt = async (selector) => {
    const at = await h.evaluate(call(pageCenter, selector));
    if (!at) throw new Error("no element for " + selector);
    for (const type of ["mousePressed", "mouseReleased"]) await h.send("Input.dispatchMouseEvent", { type, x: at.x, y: at.y, button: "left", clickCount: 1 });
  };

  // Figures in the DOM against the figures counted from the data file, place by place.
  function figureProblems(d) {
    const nums = (r) => r.nums.map(Number);
    const problems = h.eqs([
      ["grid cells", d.cells.length, want.places],
      ["table rows", d.rows.length, want.places],
      ["grid text stored", d.cells.filter((c) => c.state === "stored").length, want.byState.stored],
      ["grid link only", d.cells.filter((c) => c.state === "link-only").length, want.byState["link-only"]],
      ["grid no corpus", d.cells.filter((c) => c.state === "none").length, want.byState.none],
      ["table instruments sum", sum(d.rows.map((r) => nums(r)[0])), want.laws],
      ["table text stored sum", sum(d.rows.map((r) => nums(r)[1])), want.textStored],
      ["table link only sum", sum(d.rows.map((r) => nums(r)[2])), want.linkOnlyLaws],
    ]);
    for (let i = 0; i < want.rows.length && problems.length < 12; i++) {
      const w = want.rows[i], r = d.rows.find((x) => x.place === w.code), c = d.cells.find((x) => x.code === w.code);
      if (!r || !c) { problems.push("missing row or cell at position " + i + " (" + w.code + ")"); continue; }
      problems.push(...h.eqs([
        [w.code + " cell code", c.code, w.code], [w.code + " cell place", c.place, w.code], [w.code + " cell state", c.state, w.state],
        [w.code + " row place", r.place, w.code], [w.code + " row header", r.head, w.name + " (" + w.code + ")"], [w.code + " row header scope", r.scope, "row"],
        // Varun 2026-11-19, STORY-GEL-34-14: the row header holds one link to #place=<code> with the same text.
        [w.code + " row header links", JSON.stringify(r.links), JSON.stringify([["#place=" + w.code, w.name + " (" + w.code + ")"]])],
        [w.code + " row labels", r.labels.join("|"), "Instruments|Text stored|Link only"],
        [w.code + " row figures", nums(r).join(","), [w.stored + w.link, w.stored, w.link].join(",")],
      ]));
    }
    for (let i = 1; i < d.cells.length; i++) if (d.cells[i - 1].region === d.cells[i].region && !(d.cells[i - 1].code < d.cells[i].code)) { problems.push("cells not in ascending code order within a region at " + d.cells[i - 1].code + ", " + d.cells[i].code); break; }
    for (let i = 1; i < d.rows.length; i++) if (d.rows[i - 1].region === d.rows[i].region && !(d.rows[i - 1].place < d.rows[i].place)) { problems.push("rows not in ascending code order within a region at " + d.rows[i - 1].place + ", " + d.rows[i].place); break; }
    return problems;
  }

  // ---- AC1: the real data file ----
  await h.open("ok");
  const d = await readSection();
  h.verdict("09-ac1", "the data file holds the figures the story names (a recount: 250 places, 140 / 86 / 24 by state, 1404 / 851 / 553 laws)", h.eqs([
    ["places", want.places, STORY.places], ["text stored places", want.byState.stored, STORY.stored], ["link only places", want.byState["link-only"], STORY.linkOnly],
    ["no corpus places", want.byState.none, STORY.none], ["laws", want.laws, STORY.laws], ["text stored laws", want.textStored, STORY.textStored], ["link only laws", want.linkOnlyLaws, STORY.linkOnlyLaws],
  ]));
  h.verdict("09-ac1", "the page shows 250 cells (140 text stored, 86 link only, 24 no corpus) and 250 rows summing to 1404, 851 and 553, each place with its own figures, in code order", figureProblems(d));
  // Varun 2026-11-19: the grid is grouped by UN M49 region, in a fixed order; no real place falls to Other.
  h.verdict("09-ac1", "every cell sits under its region heading, regions in order, none under Other", h.eqs([
    ["region order", [...new Set(d.cells.map((c) => c.region))].join(" | "), "Africa | Americas | Asia | Europe | Oceania | Antarctica | Regional bodies"],
    ["places under Other", d.cells.filter((c) => c.region === "Other").map((c) => c.code).join(" "), ""],
    ["EU region", (d.cells.find((c) => c.code === "EU") || {}).region, "Regional bodies"],
    ["table rows in grid order", d.rows.map((r) => r.region + ":" + r.place).join(" "), d.cells.map((c) => c.region + ":" + c.code).join(" ")],
    ["table region rows", JSON.stringify(d.regionRows.map(([t, scope, span]) => [t.replace(/\d+ places?$/, ""), scope, span])), JSON.stringify([...new Set(d.cells.map((c) => c.region))].map((name) => [name, "rowgroup", "4"]))],
    ["moved to Europe", ["CY", "TR", "GE", "AM", "AZ"].map((code) => (d.cells.find((c) => c.code === code) || {}).region).join(" "), "Europe Europe Europe Europe Europe"],
    ["region note", await h.evaluate('(document.getElementById("browse-regions") || {}).textContent'), "Regions follow the UN M49 list, except Cyprus, Turkey, Georgia, Armenia and Azerbaijan, which are listed under Europe."],
  ]));
  const inState = (s) => d.cells.filter((c) => c.state === s).length, column = (i) => sum(d.rows.map((r) => Number(r.nums[i])));
  console.log("  09-ac1 read from the DOM: " + d.cells.length + " cells (" + inState("stored") + " text stored, " + inState("link-only") + " link only, " + inState("none") + " no corpus), " + d.rows.length + " rows summing to " + column(0) + " instruments, " + column(1) + " text stored, " + column(2) + " link only; data-check " + d.check);
  h.verdict("09-ac1", "data-check reads ok and the failure line is hidden and empty", h.eqs([
    ["data-check", d.check, "ok"], ["#browse-check present", d.note !== null, true], ["#browse-check hidden", d.note && d.note.hidden, true], ["#browse-check text", d.note && d.note.text, ""],
  ]));
  const greyCodes = d.cells.filter((c) => c.state === "none").map((c) => c.place).sort();
  h.verdict("09-ac1", "the grey cells are exactly the places that have a name and no entry, and each reads 0, 0, 0 in the table", [
    ...h.eqs([["grey cells", greyCodes.join(" "), entriesWithoutPlace.join(" ")]]),
    ...d.rows.filter((r) => greyCodes.includes(r.place) && r.nums.join(",") !== "0,0,0").map((r) => r.place + " reads " + r.nums.join(",")),
  ]);
  const us = d.rows.find((r) => r.place === "US");
  h.verdict("09-ac1", 'the place cell reads the name with the code after it ("US (US)" for the United States, as the register names it)', us ? h.eqs([["US row header", us.head, real.places.US + " (US)"], ["US row header, as the story says", us.head, "US (US)"]]) : ["no US row"]);
  const t = /^(\d+) places, (\d+) laws: (\d+) text stored, (\d+) link only$/.exec(d.totals || "");
  h.verdict("09-ac1", "the totals line gives places, laws, text stored and link only, counted from the entries", t ? h.eqs([["places", +t[1], want.places], ["laws", +t[2], want.laws], ["text stored", +t[3], want.textStored], ["link only", +t[4], want.linkOnlyLaws]]) : ["totals line is " + h.fmt(d.totals)]);
  h.verdict("09-ac1", 'the section keeps its id and its heading "Browse by place"', h.eqs([["heading", d.heading, "Browse by place"], ["aria-labelledby", d.labelledby, "browse-heading"], ["first child", d.children[0], "browse-heading"]]));
  h.verdict("09-ac1", "the table is a real table: a caption and four column headers with scope col", h.eqs([
    ["caption present", !!d.caption, true],
    ["headers", JSON.stringify(d.headers), JSON.stringify(HEADERS.map((n) => [n, "col"]))],
  ]));

  // ---- AC2: XX, YY, ZZ ----
  const storedLaw = real.entries.find((e) => e.versions.length > 0), linkLaw = real.entries.find((e) => e.versions.length === 0);
  const clone = (base, id, place) => ({ ...structuredClone(base), id, place, title: "Fixture law " + id });
  const variantOf = (places, entries) => ({ ...structuredClone(real), places, entries });
  h.addVariant("09-xx-yy-zz", variantOf({ XX: "Xland", YY: "Yland", ZZ: "Zland" }, [clone(storedLaw, "09-xx-1", "XX"), clone(linkLaw, "09-yy-1", "YY"), clone(linkLaw, "09-yy-2", "YY")]));
  await h.open("09-xx-yy-zz");
  const f = await readSection();
  h.verdict("09-ac2", "XX (one stored law), YY (two link-only laws) and ZZ (no law) draw green, amber and grey, in the colours the story names", h.eqs([
    ["cell codes", f.cells.map((c) => c.code).join(" "), "XX YY ZZ"],
    ["cell states", f.cells.map((c) => c.state).join(" "), "stored link-only none"],
    ["cell colours", f.cells.map((c) => c.colour).join(" | "), [RGB.stored, RGB["link-only"], RGB.none].join(" | ")],
    ["legend swatch states", f.legend.map((l) => l.state).join(" "), "stored link-only none"],
    ["legend swatch colours", f.legend.map((l) => l.colour).join(" | "), [RGB.stored, RGB["link-only"], RGB.none].join(" | ")],
  ]));
  h.verdict("09-ac2", "the table has three rows (XX 1, 1, 0; YY 2, 0, 2; ZZ 0, 0, 0) and data-check reads ok", h.eqs([
    ["rows", f.rows.map((r) => r.place + " " + r.head + " " + r.nums.join(",")).join(" / "), "XX Xland (XX) 1,1,0 / YY Yland (YY) 2,0,2 / ZZ Zland (ZZ) 0,0,0"],
    ["data-check", f.check, "ok"], ["failure line hidden", f.note && f.note.hidden, true],
  ]));

  // ---- AC3: fixtures that must fail, and what the page says ----
  const bad = [
    ["09-bad-status", 'an entry marked "stored" with no version rows', variantOf({ XX: "Xland", YY: "Yland" }, [{ ...clone(linkLaw, "09-bad-status-1", "XX"), status: "stored" }, clone(storedLaw, "09-ok-1", "YY")]), ["XX", "09-bad-status-1"]],
    ["09-bad-place", "an entry whose place is missing from places", variantOf({ XX: "Xland" }, [clone(storedLaw, "09-ok-2", "XX"), clone(linkLaw, "09-bad-place-1", "QQ")]), ["QQ", "09-bad-place-1"]],
    ["09-link-with-rows", 'an entry marked "link only" that has version rows', variantOf({ XX: "Xland" }, [{ ...clone(storedLaw, "09-link-rows-1", "XX"), status: "link only" }]), ["XX", "09-link-rows-1"]],
    ["09-odd-status", "an entry with a scope status that is neither stored nor link only", variantOf({ XX: "Xland" }, [{ ...clone(storedLaw, "09-odd-1", "XX"), status: "empty" }]), ["XX", "09-odd-1"]],
  ];
  for (const [name, what, data, mustName] of bad) {
    h.addVariant(name, data);
    await h.open(name);
    const x = await readSection();
    console.log("  " + name + " (" + what + "): data-check " + x.check + ", line: " + h.fmt(x.note && x.note.text));
    h.verdict("09-ac3", what + " makes data-check read failed, shows the line and names the place and the entry", [
      ...h.eqs([["data-check", x.check, "failed"], ["line visible", x.note && x.note.shown, true]]),
      ...(!x.note || !x.note.text.startsWith("The place figures do not agree: ") ? ["line is " + h.fmt(x.note && x.note.text)] : []),
      ...mustName.filter((n) => !(x.note && x.note.text.includes(n))).map((n) => "line does not name " + n),
    ]);
  }
  const noPlaces = structuredClone(real);
  delete noPlaces.places;
  h.addVariant("09-no-places", noPlaces);
  await h.open("09-no-places");
  const np = await readSection();
  console.log("  09-no-places (a data file without places): data-check " + np.check + ", line: " + h.fmt(np.note && np.note.text));
  h.verdict("09-ac3", "a data file without places makes data-check read failed, says so, and draws no grid or table", [
    ...h.eqs([["data-check", np.check, "failed"], ["line visible", np.note && np.note.shown, true], ["cells", np.cells.length, 0], ["rows", np.rows.length, 0]]),
    ...(np.note && /no place list/.test(np.note.text) ? [] : ["line is " + h.fmt(np.note && np.note.text)]),
  ]);

  // ---- AC4: no figure typed into the page source ----
  const typed = new RegExp("\\b(" + [STORY.places, STORY.laws, STORY.textStored, STORY.linkOnlyLaws, STORY.stored, STORY.linkOnly, STORY.none].join("|") + ")\\b|" + real.snapshot.read_on);
  const hits = [];
  for (const file of ["index.html", "browse.js"]) {
    fs.readFileSync(path.join(WEB, file), "utf8").split("\n").forEach((line, i) => { if (typed.test(line)) hits.push(file + ":" + (i + 1) + ": " + line.trim()); });
  }
  h.verdict("09-ac4", "web/index.html and web/browse.js hold none of 250, 1404, 851, 553, 140, 86, 24 or the read date", hits);

  // ---- AC5: read line, legend, text alternative ----
  await h.open("ok");
  const a = await readSection();
  const alt = /^(\d+) places have at least one law with stored text, (\d+) places hold links only, (\d+) places have no corpus\. (.*table.*)$/.exec(a.alt || "");
  h.verdict("09-ac5", 'the section shows "Corpus read", the read date and the 9-character snapshot id', h.eqs([["read line", a.read, "Corpus read " + E.read_on + " · Snapshot " + E.snapshot9]]));
  h.verdict("09-ac5", "the legend reads as the story words it, one swatch per state", h.eqs([
    ["legend texts", JSON.stringify(a.legend.map((l) => l.text)), JSON.stringify(LEGEND)], ["legend states", a.legend.map((l) => l.state).join(" "), "stored link-only none"],
  ]));
  h.verdict("09-ac5", "the grid has role img and a text alternative that gives the three place counts and points to the table", [
    ...h.eqs([["role", a.gridRole, "img"]]),
    // Varun 2026-11-19, STORY-GEL-34-14: the text alternative also tells the visitor to choose a place in the table.
    ...(alt && alt[4].endsWith(" Choose a place in the table below to see its laws.") ? [] : ["text alternative does not end with the sentence that points to the table: " + h.fmt(a.alt)]),
    ...(alt ? h.eqs([["stored places", +alt[1], want.byState.stored], ["link only places", +alt[2], want.byState["link-only"]], ["no corpus places", +alt[3], want.byState.none]]) : ["text alternative is " + h.fmt(a.alt)]),
  ]);
  await h.open("changed");
  const c = await readSection();
  h.verdict("09-ac5", 'with another read date and snapshot in the file ("changed" variant) the line follows the file', h.eqs([["read line", c.read, "Corpus read 2031-02-03 · Snapshot 123456789"]]));

  // ---- AC6: keyboard, 320 px, text at 200% ----
  // Varun 2026-11-19, STORY-GEL-34-14: story 09 held that the section has no tab stop; it now holds one per place, in code order, each a link to #place=<code>.
  await h.open("ok");
  const wide = await measure("wide");
  const wantStops = d.rows.map((r) => "A #place=" + r.place); // table order: by region, then code (checked in 09-ac1)
  const stopProblems = (got, label) => {
    const i = wantStops.findIndex((w, k) => got[k] !== w);
    return got.length === wantStops.length && i < 0 ? [] : [label + ": " + got.length + " tab stops, want " + wantStops.length + (i < 0 ? "" : "; stop " + i + " is " + h.fmt(got[i]) + ", want " + wantStops[i])];
  };
  await h.evaluate('location.hash = "#browse-by-place"'); // Tab goes on from the section the address names
  const stops = [];
  for (let i = 0; i <= want.places; i++) {
    await h.press("Tab");
    stops.push(await h.evaluate(call(pageTabStop)));
  }
  const walkBad = stops.slice(0, want.places).map((s, i) => (s.inside && s.href === "#place=" + d.rows[i].place ? null : "Tab " + (i + 1) + " landed on " + h.fmt(s.href || s.name) + ", want #place=" + d.rows[i].place)).filter(Boolean);
  h.verdict("09-ac6", "the section holds one tab stop per place, in table order, each a link to #place=<code>, and nothing else (no button, field or tabindex)", stopProblems(wide.tabStops, "section"));
  h.verdict("09-ac6", "Tab from the section's heading passes through the place links in table order, and the Tab after the last place link leaves the section", [
    ...walkBad.slice(0, 3), ...(walkBad.length > 3 ? ["and " + (walkBad.length - 3) + " more"] : []),
    ...(stops[want.places].inside ? ["the Tab after the last place link stays inside the section"] : []),
  ]);
  const reflow = async (label, width, bigText) => {
    await h.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await h.open("ok");
    if (bigText) await h.evaluate('document.documentElement.style.fontSize = "200%"');
    return measure(label);
  };
  const stackProblems = (L, label) => [
    ...(L.tableDisplay === "block" ? [] : [label + ": #browse-table display is " + L.tableDisplay + ", want block (stacked)"]),
    ...(L.theadDisplay === "none" ? [] : [label + ": the column header row is still shown (display " + L.theadDisplay + ")"]),
    ...(L.labelContent.includes(L.firstLabel) ? [] : [label + ": the text before a number is " + L.labelContent + ", want " + L.firstLabel]),
  ];
  const sideways = (L, label) => [
    ...(L.over.length ? [label + ": " + L.overN + " elements reach past the window: " + L.over.join(" ")] : []),
    ...(L.scrollers.length ? [label + ": scroll containers inside the section: " + L.scrollers.join(" ")] : []),
    ...stopProblems(L.tabStops, label),
    ...(L.gridRows >= 3 ? [] : [label + ": the grid has " + L.gridRows + " rows of cells for " + L.cellN + " cells, so it does not wrap"]),
  ];
  const w1024 = await reflow("1024px", 1024, false);
  h.verdict("09-ac6", "1024px: the table shows as a table with its header row, nothing reaches past the window, no scroll container", [
    ...(w1024.tableDisplay === "table" ? [] : ["#browse-table display is " + w1024.tableDisplay + ", want table"]),
    ...(w1024.theadDisplay !== "none" ? [] : ["the column header row is hidden"]),
    ...sideways(w1024, "1024px"),
  ]);
  const w320 = await reflow("320px", 320, false);
  h.verdict("09-ac6", "320px: the table stacks into one card per place with its labels, the grid cells wrap, nothing reaches past the window, no scroll container, one tab stop per place", [...stackProblems(w320, "320px"), ...sideways(w320, "320px")]);
  h.verdict("09-ac6", "320px: the page needs no sideways scroll", w320.docScrollW <= w320.innerW ? [] : ["scrollWidth " + w320.docScrollW + " > " + w320.innerW]);
  const big = await reflow("320px at 200% text", 320, true);
  h.verdict("09-ac6", "320px with text at 200% (root font 32px): same as above, nothing reaches past the window", [
    ...(big.rootFont === "32px" ? [] : ["root font is " + big.rootFont + ", want 32px"]), ...stackProblems(big, "320px 200%"), ...sideways(big, "320px 200%"),
  ]);
  // The lookup header of story 04 is 493px wide at 200% text in a 320px window; the section above is what this story owns.
  console.log("  note: 320px at 200% text, the whole page scrolls " + big.docScrollW + "px wide in a " + big.innerW + "px window; the section reaches past the window with " + big.overN + " elements");

  // ---- AC7: a click on a cell or a place link sets the place address and changes nothing else; a link to #browse-by-place lands on the heading ----
  // Varun 2026-11-19, STORY-GEL-34-14: story 09 held that a click leaves the hash unchanged; a cell click now sets #place=<code>, and the link in the row header does too.
  await h.send("Emulation.clearDeviceMetricsOverride");
  await h.open("ok");
  await h.evaluate('document.getElementById("example").click()');
  await h.waitFor('document.getElementById("answer-panel").getAttribute("data-state") === "plain"');
  const before = await h.evaluate(call(pageSnap));
  await clickAt("#browse-grid .cell");
  const afterCell = await h.evaluate(call(pageSnap));
  // The cell click opens the place view (story 14), which hides the table; close it before clicking a row link.
  await h.evaluate('location.hash = "#browse-by-place"');
  await h.waitFor('document.body.getAttribute("data-view") !== "place"');
  await clickAt("#browse-table tbody tr[data-place=" + d.rows[4].place + "] th a");
  const afterRow = await h.evaluate(call(pageSnap));
  const changed = (snap) => Object.keys(before).filter((k) => k !== "hash" && JSON.stringify(snap[k]) !== JSON.stringify(before[k])).map((k) => k + " changed: " + h.fmt(before[k]).slice(0, 80) + " -> " + h.fmt(snap[k]).slice(0, 80));
  h.verdict("09-ac7", "a click on a grid cell sets the hash to #place=<code> of that cell and leaves the match list, law box, date and answer as they were", [...h.eqs([["hash after the cell click", afterCell.hash, "#place=" + d.cells[0].code]]), ...changed(afterCell)]);
  h.verdict("09-ac7", "a click on the place link of a table row sets the hash to #place=<code> of that row and leaves the match list, law box, date and answer as they were", [...h.eqs([["hash after the link click", afterRow.hash, "#place=" + d.rows[4].place]]), ...changed(afterRow)]);
  await h.evaluate(call(pageStubLink));
  const landed = await h.until(async () => {
    const r = await h.evaluate(call(pageLanded));
    return r.top >= 0 && r.top < r.h && r.top < r.gridTop ? r : false;
  }, 3000, "the heading in view after the link").catch(() => null);
  h.verdict("09-ac7", "a link to #browse-by-place brings the section heading into view above the grid and makes the section the target (stub link; the links of stories 05 and 06 are for the integration run)", landed ? h.eqs([["hash", landed.hash, "#browse-by-place"], [":target", landed.target, "browse-by-place"]]) : ["the heading did not come into view"]);
}
