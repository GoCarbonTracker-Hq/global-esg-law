// Tests of web/search.js through its exported API only. The expected side is written here, never read
// from search.js: the story's 12 CSRD ids and query table, a plain-NFD control, and a brute-force
// count that uses a fold of its own (character loop, not the contract's string chain).
// Data: LAW_DATA, else web/law-data.json, else built with tools/web_data.py into a temp folder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const search = createRequire(import.meta.url)("../../web/search.js");

function loadData() {
  let file = process.env.LAW_DATA || path.join(repoRoot, "web/law-data.json");
  if (!process.env.LAW_DATA && !fs.existsSync(file)) {
    file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "gel34-search-")), "law-data.json");
    const cmd = process.env.PYTHON || "python3";
    const argv = ["tools/web_data.py", "--ref", "origin/history", "--read-on", "2026-11-17", "--out", file];
    const run = spawnSync(cmd, argv, { cwd: repoRoot, encoding: "utf8" });
    if (run.status !== 0) {
      throw new Error(cmd + " " + argv.join(" ") + " failed (status " + run.status + "):\n" + run.stdout + run.stderr);
    }
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const data = loadData();
const entries = data.entries;
let realIndex = null;
const real = () => (realIndex = realIndex || search.buildIndex(entries, data.places));

const ids = (list) => list.map((e) => e.id);
const same = (got, want, label) => {
  const added = got.filter((id) => !want.includes(id));
  const dropped = want.filter((id) => !got.includes(id));
  assert.ok(
    got.join(" ") === want.join(" "),
    label + "\n  added:   " + (added.join(" ") || "none") + "\n  dropped: " + (dropped.join(" ") || "none") +
      "\n  want:    " + want.join(" ") + "\n  got:     " + got.join(" "),
  );
};

// The test's own fold. One character at a time, marks skipped by property, specials from a map.
const SPECIAL = new Map([
  ["\u0142", "l"], ["\u00f8", "o"], ["\u0111", "d"], ["\u00f0", "d"], ["\u0131", "i"], ["\u00df", "ss"],
  ["\u00e6", "ae"], ["\u0153", "oe"], ["\u00fe", "th"], ["\u0259", "e"],
  ["\u2018", "'"], ["\u2019", "'"], ["\u2013", "-"], ["\u2014", "-"],
]);
function slowFold(text) {
  let out = "";
  for (const ch of String(text).toLowerCase().normalize("NFD")) {
    if (/^\p{M}$/u.test(ch)) continue;
    out += SPECIAL.has(ch) ? SPECIAL.get(ch) : ch;
  }
  return out;
}
const plainNfd = (text) => String(text).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

const searchable = (e) => [e.title, e.id, e.citation, ...(e.aliases || [])].filter((s) => typeof s === "string");
const bruteHay = entries.map((e) => searchable(e).map(slowFold));
const bruteIds = (q) => entries.filter((_, i) => bruteHay[i].some((h) => h.includes(q))).map((e) => e.id);

const CSRD_IDS = [
  "eu-csrd-2022-2464", "gr-law-5164-2024", "be-loi-2024-12-02-csrd", "bg-znfo-zid-2024", "bg-zschet-zid-2024",
  "cy-companies-amendment-3-2025", "dk-lov-480-2024", "fi-laki-1249-2023", "it-dlgs-125-2024",
  "li-pgr-art-1096b-k", "pl-csrd-act-2024", "pl-csrd-act-2025",
];

test("the module exports exactly the contract names, and MAX_ROWS is 8", () => {
  assert.deepEqual(Object.keys(search).sort(), ["MAX_ROWS", "buildIndex", "countLine", "fold", "query"]);
  assert.equal(search.MAX_ROWS, 8);
});

test("fold: the ten table letters, two quote marks and two dashes, one character at a time", () => {
  // Pairs are small then capital: l-stroke, o-stroke, d-stroke, eth, dotless i and dotted I, sharp s, ae, oe, thorn, schwa.
  const cases = [
    ["\u0142", "l"], ["\u0141", "l"],
    ["\u00f8", "o"], ["\u00d8", "o"],
    ["\u0111", "d"], ["\u0110", "d"],
    ["\u00f0", "d"], ["\u00d0", "d"],
    ["\u0131", "i"], ["\u0130", "i"],
    ["\u00df", "ss"], ["\u1e9e", "ss"],
    ["\u00e6", "ae"], ["\u00c6", "ae"],
    ["\u0153", "oe"], ["\u0152", "oe"],
    ["\u00fe", "th"], ["\u00de", "th"],
    ["\u0259", "e"], ["\u018f", "e"],
    ["\u2018", "'"], ["\u2019", "'"], // left and right single quote
    ["\u2013", "-"], ["\u2014", "-"], // en dash, em dash
    ["\u00e9", "e"], ["\u00fc", "u"], ["\u00e4", "a"], ["\u00f1", "n"], // accented e, u, a, n: marks only, no transliteration
    ["A", "a"], ["z", "z"], ["7", "7"], [" ", " "], ["'", "'"], ["-", "-"],
  ];
  const bad = cases
    .filter(([from, want]) => search.fold(from) !== want)
    .map(([from, want]) => "U+" + from.codePointAt(0).toString(16).padStart(4, "0") + " gave " + JSON.stringify(search.fold(from)) + ", want " + JSON.stringify(want));
  assert.deepEqual(bad, []);
  assert.equal(search.fold("  Ab  C \u00e9 "), "  ab  c e ", "fold does not trim or collapse spaces");
  assert.equal(search.fold("\u65e5\u672c"), "\u65e5\u672c", "letters of other scripts pass through");
});

test("AC1: CSRD on the real file gives the story's 12 ids in order and the 8-row line", () => {
  const r = search.query(real(), "CSRD");
  same(ids(r.entries), CSRD_IDS, "CSRD matches differ from the story's list; if aliases added or dropped a match, the PR states it");
  assert.equal(r.blank, false);
  assert.equal(r.total, 12);
  assert.equal(r.rows[0].id, "eu-csrd-2022-2464", "row 1 is the EU directive");
  same(ids(r.rows), CSRD_IDS.slice(0, 8), "the 8 rows are the first 8 ids");
  assert.equal(r.line, "12 laws match, showing 8");
});

test("AC2: CBAM on the real file puts eu-cbam-2023-956 first and lists every entry whose aliases hold CBAM", () => {
  const withAlias = entries.filter((e) => (e.aliases || []).some((a) => slowFold(a).includes("cbam"))).map((e) => e.id);
  assert.ok(withAlias.includes("eu-cbam-2023-956"), "the data file has no CBAM alias on eu-cbam-2023-956 (Story 3)");
  const r = search.query(real(), "CBAM");
  assert.equal(r.rows[0].id, "eu-cbam-2023-956");
  const got = ids(r.entries);
  assert.deepEqual(withAlias.filter((id) => !got.includes(id)), [], "entries with a CBAM alias missing from the result");
  assert.deepEqual([...got].sort(), bruteIds("cbam").sort(), "result differs from the brute-force matches");
});

test("AC2: an entry found only through its alias, and an exact non-EU alias outranks an EU id-only match", () => {
  const places = { EU: "European Union", DE: "Germany" };
  const alias = { id: "xx-law-1", place: "DE", title: "Zollgesetz", citation: "BGBl 1", aliases: ["CBAM"] };
  const control = { id: "xx-law-2", place: "DE", title: "Other act", citation: "BGBl 2", aliases: ["KSG"] };
  for (const text of ["cbam", "CBAM", " Cbam "]) {
    same(ids(search.query(search.buildIndex([alias, control], places), text).entries), ["xx-law-1"], "alias-only fixture, query " + JSON.stringify(text));
  }
  assert.equal(search.query(search.buildIndex([{ ...alias, aliases: [] }], places), "cbam").total, 0, "without the alias the fixture is not found");

  const eu = { id: "eu-cbam-2023-956", place: "EU", title: "Carbon border levy", citation: "Regulation 2023/956" };
  const de = { id: "de-zoll-1", place: "DE", title: "Zollgesetz", citation: "BGBl 1", aliases: ["CBAM"] };
  same(ids(search.query(search.buildIndex([eu, de], places), "cbam").rows), ["de-zoll-1", "eu-cbam-2023-956"], "EU first in input");
  same(ids(search.query(search.buildIndex([de, eu], places), "cbam").rows), ["de-zoll-1", "eu-cbam-2023-956"], "EU last in input");
});

test("order: group A by bracket and exact alias, EU first, place name by plain <, id by plain <", () => {
  // KA and KB names differ only by ' against -: plain < puts ' first, localeCompare puts - first.
  // The ids zz-a-b and zz-a_b differ the same way. ZZ sorts after AA by code and before it by name.
  const places = { EU: "European Union", AA: "Zeta Land", ZZ: "Alpha Land", KA: "Ko'land", KB: "Ko-land" };
  const fixture = [
    { id: "eu-b", place: "EU", title: "Rule about zed", citation: "c" },
    { id: "eu-a", place: "EU", title: "Rule (ZED)", citation: "c" },
    { id: "aa-law", place: "AA", title: "Law (zed)", citation: "c" },
    { id: "zz-a_b", place: "ZZ", title: "Law (Zed)", citation: "c" },
    { id: "zz-a-b", place: "ZZ", title: "Other (zed)", citation: "c" },
    { id: "aa-alias", place: "AA", title: "Plain title", citation: "c", aliases: ["  ZED "] },
    { id: "zz-partial", place: "ZZ", title: "Plain title two", citation: "c", aliases: ["zedx"] },
    { id: "zz-longer", place: "ZZ", title: "Law (zed act)", citation: "c" },
    { id: "ka-nested", place: "KA", title: "Law (a (zed))", citation: "c" },
    { id: "kb-spaced", place: "KB", title: "Law ( Z\u00e9d )", citation: "c" },
    { id: "ka-b", place: "KA", title: "Zed in text", citation: "c" },
    { id: "kb-b", place: "KB", title: "Zed text", citation: "c" },
  ];
  const want = [
    // group A: EU, then place names alpha land, ko'land, ko-land, zeta land; then ids
    "eu-a", "zz-a-b", "zz-a_b", "ka-nested", "kb-spaced", "aa-alias", "aa-law",
    // group B, same rule
    "eu-b", "zz-longer", "zz-partial", "ka-b", "kb-b",
  ];
  const orders = {
    "as written": fixture,
    reversed: [...fixture].reverse(),
    rotated: [...fixture.slice(5), ...fixture.slice(0, 5)],
  };
  for (const [name, list] of Object.entries(orders)) {
    const r = search.query(search.buildIndex(list, places), "zed");
    same(ids(r.entries), want, "order, input " + name);
    assert.equal(r.total, 12);
    same(ids(r.rows), want.slice(0, 8), "rows, input " + name);
    assert.equal(r.line, "12 laws match, showing 8");
  }
});

test("an entry whose place has no name sorts by the folded place code", () => {
  const places = { AA: "Zeta Land" };
  const list = [
    { id: "aa-one", place: "AA", title: "Needle", citation: "c" },
    { id: "qq-one", place: "QQ", title: "Needle", citation: "c" },
  ];
  same(ids(search.query(search.buildIndex(list, places), "needle").entries), ["qq-one", "aa-one"], "qq before zeta land");
});

test("match covers title, id, citation and aliases, folded on both sides, and not the place name", () => {
  const places = { NL: "Needleland", AA: "Aland" };
  const list = [
    { id: "f-title", place: "AA", title: "A needle title", citation: "x1" },
    { id: "needle-id", place: "AA", title: "Plain", citation: "x2" },
    { id: "f-cit", place: "AA", title: "Plain two", citation: "see Needle 5" },
    { id: "f-alias", place: "AA", title: "Plain three", citation: "x3", aliases: ["Hay", "NEEDLE"] },
    { id: "f-none", place: "NL", title: "No match", citation: "x4", aliases: ["hay"] },
  ];
  const r = search.query(search.buildIndex(list, places), "  NEEDLE ");
  assert.deepEqual(ids(r.entries).sort(), ["f-alias", "f-cit", "f-title", "needle-id"]);
  assert.ok(r.entries.every((e) => list.includes(e)), "entries are the original objects");
  assert.deepEqual(r.rows, r.entries.slice(0, 8));

  const marks = [
    { id: "m-1", place: "AA", title: "D\u00e9cembre Gesetz", citation: "c" },
    { id: "m-2", place: "AA", title: "Decembre law", citation: "c" },
    { id: "m-3", place: "AA", title: "Rock\u2019n\u2013roll act", citation: "c" },
    { id: "m-4", place: "AA", title: "Rock'n-roll rule", citation: "c" },
  ];
  const index = search.buildIndex(marks, places);
  for (const text of ["decembre", "D\u00c9CEMBRE", "d\u00e9cembre"]) {
    same(ids(search.query(index, text).entries), ["m-1", "m-2"], "accent on either side, query " + text);
  }
  for (const text of ["rock'n-roll", "rock\u2019n\u2013roll", "rock\u2018n\u2014roll"]) {
    same(ids(search.query(index, text).entries), ["m-3", "m-4"], "quote and dash on either side, query " + text);
  }
});

test("AC3: the three loi du 2 decembre 2024 spellings return exactly be-loi-2024-12-02-csrd", () => {
  for (const text of ["loi du 2 decembre 2024", "LOI DU 2 DECEMBRE 2024", "Loi du 2 d\u00e9cembre 2024"]) {
    const r = search.query(real(), text);
    same(ids(r.entries), ["be-loi-2024-12-02-csrd"], "query " + text);
    assert.equal(r.total, 1);
  }
});

test("AC3: each query of the story's list returns its named entry, and plain NFD fails the ten table letters", () => {
  const table = [
    ["\u0142", "przeciwdzialaniu", "pl-unfair-practices-act"],
    ["\u00df", "massnahmen", "de-becv"],
    ["\u0131", "istehlakcilarin", "az-consumer-rights-law"],
    ["\u0259", "muhafizesi", "az-environmental-protection-law"],
    ["\u00f8", "redegorelse", "dk-arl-99a"],
    ["\u00e6", "baeredygtighedsrapportering", "dk-lov-52-2025"],
    ["\u00f0", "marknadarforing", "fo-marketing-act"],
    ["\u00fe", "fjarmalathjonustu", "is-sjalfbaernilog-fjarmal"],
    ["\u0153", "mise en oeuvre", "lu-sfdr-law-2022"],
    ["\u0111", "08/2022/nd-cp", "vn-nd-08-2022"],
  ];
  const others = [
    ["apostrophe", "documents d'informations cles", "lu-sfdr-law-2022"],
    ["capital I with dot", "iklim kanunu", "tr-iklim-kanunu"],
  ];
  const byId = new Map(entries.map((e) => [e.id, e]));
  const control = (entry, query) => searchable(entry).some((s) => plainNfd(s).includes(plainNfd(query)));
  const problems = [];
  for (const [, query, id] of [...table, ...others]) {
    const r = search.query(real(), query);
    if (!ids(r.rows).includes(id)) problems.push(JSON.stringify(query) + " did not list " + id + " in its rows (total " + r.total + ")");
  }
  for (const [letter, query, id] of table) {
    assert.ok(byId.has(id), id + " is not in the data file");
    if (control(byId.get(id), query)) problems.push("plain NFD control found " + id + " for " + JSON.stringify(query) + ": the table letter " + letter + " is not what blocks it");
    if (search.fold(letter) === plainNfd(letter)) problems.push("fold of " + letter + " equals plain NFD");
  }
  assert.deepEqual(problems, []);
});

test("AC4: every full id, then every full title, lists its entry within 8 rows with the true count", () => {
  const found = { id: 0, title: 0 };
  const most = { id: 0, title: 0 };
  const outside = [];
  const wrong = [];
  const index = real();
  for (const kind of ["id", "title"]) {
    for (const entry of entries) {
      const q = slowFold(entry[kind]).trim();
      const want = bruteIds(q);
      const r = search.query(index, entry[kind]);
      const label = kind + " " + entry.id;
      if (!want.includes(entry.id)) wrong.push(label + ": the test's own brute force does not contain the entry");
      if (r.total !== want.length) wrong.push(label + ": total " + r.total + ", brute force " + want.length);
      else if ([...ids(r.entries)].sort().join(" ") !== [...want].sort().join(" ")) wrong.push(label + ": same count, different entries");
      if (r.rows.length !== Math.min(r.total, 8)) wrong.push(label + ": " + r.rows.length + " rows for total " + r.total);
      if (ids(r.rows).includes(entry.id)) found[kind] += 1;
      else outside.push(label);
      most[kind] = Math.max(most[kind], r.total);
    }
  }
  console.log(
    "found_by_id=" + found.id + " found_by_title=" + found.title + " max_matches=" + Math.max(most.id, most.title) +
      " (id " + most.id + ", title " + most.title + ") outside_row_8=" + outside.length + " entries=" + entries.length + " node=" + process.version,
  );
  assert.deepEqual(outside, [], "entries outside the first 8 rows: " + outside.join(", "));
  assert.deepEqual(wrong, []);
  assert.equal(found.id, entries.length);
  assert.equal(found.title, entries.length);
});

test("AC5: the count line for 23, 8, 1 and 0 matches, and a blank query", () => {
  const lines = [
    [23, "23 laws match, showing 8"], [9, "9 laws match, showing 8"], [8, "8 laws match"],
    [2, "2 laws match"], [1, "1 law matches"], [0, "No law matches. Browse by place below."],
  ];
  for (const [n, line] of lines) assert.equal(search.countLine(n), line, "countLine(" + n + ")");

  const places = { AA: "Aland" };
  for (const [n, line] of lines) {
    const list = [{ id: "z-other", place: "AA", title: "Beta", citation: "c" }];
    for (let i = 1; i <= n; i += 1) list.push({ id: "law-" + String(i).padStart(2, "0"), place: "AA", title: "Alpha " + i, citation: "c" });
    const r = search.query(search.buildIndex(list, places), "alpha");
    assert.equal(r.blank, false);
    assert.equal(r.total, n);
    assert.equal(r.rows.length, Math.min(n, 8));
    assert.equal(r.line, line);
    if (n >= 8) same(ids(r.rows), ["law-01", "law-02", "law-03", "law-04", "law-05", "law-06", "law-07", "law-08"], "first 8 of " + n);
  }
  for (const text of ["", "   ", "\t"]) {
    const r = search.query(search.buildIndex([{ id: "a", place: "AA", title: "Alpha", citation: "c" }], places), text);
    assert.deepEqual({ blank: r.blank, total: r.total, entries: r.entries, rows: r.rows, line: r.line }, { blank: true, total: 0, entries: [], rows: [], line: "" });
  }
});

test("AC9: an entry without aliases or with null citation does not throw, and counts as none", () => {
  const places = { AA: "Aland" };
  const list = [
    { id: "a-1", place: "AA", title: "Needle one", citation: "c" },
    { id: "a-2", place: "AA", title: "Needle two", citation: null, aliases: null },
    { id: "a-3", place: "AA", title: "Needle three", aliases: [] },
    { id: "a-4", place: "QQ", title: "Needle four", citation: null },
  ];
  const index = search.buildIndex(list, places);
  const r = search.query(index, "needle");
  same(ids(r.entries), ["a-1", "a-2", "a-3", "a-4"], "all four found; QQ has no name, its code qq sorts after aland");
  for (const text of ["null", "undefined", "zzzz"]) assert.equal(search.query(index, text).total, 0, "query " + text);
  assert.doesNotThrow(() => search.query(real(), "csrd"));
  assert.ok(entries.some((e) => !e.aliases), "the real file has entries without aliases");
});
