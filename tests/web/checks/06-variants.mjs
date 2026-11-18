// Browser checks for STORY-GEL-34-06: the answers where nothing is in force (variants V1 to V6, the later line,
// the application line, the label rule). Every expected value comes from the story and contract texts written
// below, from the data file (h.data) or from expected.json (h.expected); none is read back from the page's code.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../web");

// The page texts, copied from the story and contract.md (straight quotes, no trailing space).
const T = {
  v1: (d) => "The corpus stores no text of this law, only a link to it, so it cannot say which version applied on " + d + ".",
  v2: (f, d) => "The earliest stored version of this law starts on " + f + ", after " + d + "; the corpus has no record that early, and the law may still have been in force.",
  v2p: (f, d) => "The earliest stored version of this law has a publication date of " + f + ", after " + d + "; the corpus does not record when it entered into force, and the law may still have been in force.",
  v4: (f, d) => "This law was not yet in force on " + d + "; its first stored version starts on " + f + ".",
  v5: (t) => 'No law in the corpus matches "' + t + '"; this does not mean no such law exists.',
  v6: (p) => "The corpus does not record when this version entered into force; " + p + " is the date it was published, so it may have started later.",
  later: (r) => "The corpus was read on " + r + ". Later changes are not in it.",
};
const OFFICIAL_TEXT = "Official text (opens in a new tab)";
const OFFICIAL_SOURCE = "Official source (opens in a new tab)";
const ARCHIVE_COPY = "Archive copy, not the official text (opens in a new tab)";
const ARCHIVE_URL = "https://web.archive.org/web/2020/https://example.org/"; // the source_url of the fixture row in check.mjs
const FIX_COMMIT = "abcdef0123456789abcdef0123456789abcdef01";
const FIX_TITLE = "Fixture: a law whose only stored copy is an archive copy";

const CSRD = "eu-csrd-2022-2464", BJ = "bj-environment-framework-act-1998", AE = "ae-dl-11-2024-climate", AG = "ag-eccb-climate-risk-standard";
const AX = "ax-biodrivmedel-ghg-lag-2018-41", GN = "gn-arrete-2022-1646-evaluations-environnementales", IE = "ie-si-490-2012", IE2 = "ie-si-755-2020";
const FI = "fi-paastokauppalaki-2011", KG104 = "kg-climate-law-104", KG71 = "kg-ghg-emission-law-71";
const ESRS = "eu-esrs-2023-2772", EUDR = "eu-eudr-2023-1115", AVR = "eu-avr-2018-2067";
const STORY_LATE = ["br-bcb-res-586-2026", "ge-corsia-order-amendment-2026", "hn-juntec-res-006-01-2025", "kg-climate-law-104", "pl-ecgt-amendment-act-2026"];
const EVIL = 'Replaced by "X" <b>bold</b> & more';

const n = (t) => t.replace(/\s+/g, " ").trim();
const q = JSON.stringify;
const dayBefore = (s) => { // UTC arithmetic in the check, never in the page
  const [y, m, d] = s.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  t.setUTCDate(t.getUTCDate() - 1);
  return t.toISOString().slice(0, 10);
};

// ---------- page side: sent to the page as text, so they use nothing from this module ----------
// What the panel shows right now. deep adds the whole-panel checks (red, "!", icons) that the sweep skips.
function snap(deep) {
  const P = document.getElementById("answer-panel");
  const norm = (t) => t.replace(/\s+/g, " ").trim();
  const vis = (el) => !!el && el.checkVisibility();
  const shown = (el) => (vis(el) ? norm(el.textContent) : null);
  const f = (name) => P.querySelector('[data-field="' + name + '"]');
  const part = (name) => P.querySelector('#answer-interim [data-part="' + name + '"]');
  const s = {
    state: P.getAttribute("data-state"), id: P.getAttribute("data-id"), date: P.getAttribute("data-date"), commit: P.getAttribute("data-commit"),
    plain: vis(document.getElementById("answer-plain")), interim: vis(document.getElementById("answer-interim")),
    title: shown(f("title")), fields: {}, parts: {},
    sentence: document.getElementById("answer-sentence").textContent,
    links: [...P.querySelectorAll("a[href]")].filter((a) => vis(a) && !a.getAttribute("href").startsWith("#") && !a.closest("#slot-after-link, #slot-after-interim")).map((a) => (
      { text: norm(a.textContent), href: a.getAttribute("href"), target: a.getAttribute("target"), rel: a.getAttribute("rel") })),
    all: P.textContent,
    active: document.activeElement.id || document.activeElement.tagName,
    dateValue: document.getElementById("date").value,
  };
  for (const name of ["status", "since", "applies", "applies-note", "later", "asked", "read", "snapshot", "notice", "source-row"]) s.fields[name] = shown(f(name));
  for (const name of ["text", "message", "offer", "browse"]) s.parts[name] = shown(part(name));
  const browse = part("browse"), offer = part("offer");
  s.browse = browse && { href: browse.getAttribute("href"), target: browse.getAttribute("target"), hasTarget: browse.hasAttribute("target") };
  s.offerType = offer && offer.getAttribute("type");
  s.offerTag = offer && offer.tagName;
  s.interimTags = [...P.querySelectorAll("#answer-interim *")].map((e) => e.tagName);
  if (deep) {
    s.text = norm(P.innerText);
    s.svg = P.querySelectorAll("svg").length;
    s.img = P.querySelectorAll("img").length;
    s.alert = P.querySelectorAll('[role="alert"]').length;
    s.bang = P.textContent.includes("!");
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    s.red = [];
    for (const el of [P, ...P.querySelectorAll("*")]) {
      const cs = getComputedStyle(el);
      for (const prop of ["color", "backgroundColor"]) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000000";
        ctx.fillStyle = cs[prop];
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        if (a > 0 && r > 150 && g < 100 && b < 100) s.red.push(el.tagName + "[" + (el.getAttribute("data-field") || el.getAttribute("data-part") || el.id) + "] " + prop + " " + cs[prop]);
      }
    }
  }
  return s;
}

// Everything the expectation x says about what the panel s shows. Pure, so it also runs inside the page for the sweep.
function compare(x, s) {
  const bad = [];
  const eq = (name, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(name + ": got " + JSON.stringify(got) + ", want " + JSON.stringify(want)); };
  eq("page error", s.error, null);
  eq("data-state", s.state, x.state);
  eq("data-id", s.id, x.id);
  eq("data-date", s.date, x.date);
  eq("data-commit", s.commit, x.commit);
  eq("#answer-plain visible", s.plain, x.state === "plain");
  eq("#answer-interim visible", s.interim, x.state !== "plain");
  eq("title", s.title, x.title);
  for (const name of Object.keys(x.fields)) eq("field " + name, s.fields[name], x.fields[name]);
  for (const name of Object.keys(x.parts)) eq("part " + name, s.parts[name], x.parts[name]);
  eq("hidden sentence", s.sentence, x.sentence);
  eq("link texts", s.links.map((l) => l.text), x.linkTexts);
  eq("link hrefs", s.links.map((l) => l.href), x.hrefs);
  for (const l of s.links) {
    if (l.target !== "_blank" || !(l.rel || "").split(/\s+/).includes("noopener") || !l.text.endsWith(" (opens in a new tab)")) bad.push("link without _blank, noopener or the new-tab text: " + JSON.stringify(l));
  }
  if (/\bundefined\b|\bnull\b|\[object|\bNaN\b/.test(s.all + " " + s.sentence)) bad.push("panel or sentence holds undefined, null, [object or NaN");
  return bad;
}

// The sweep: draws each item and returns the mismatches.
function sweepPage(items) {
  const out = [];
  for (const { id, date, x } of items) {
    let error = null;
    try { GEL.showAnswer(id, date); } catch (e) { error = String(e); }
    const s = snap(false);
    s.error = error;
    const bad = compare(x, s);
    if (bad.length) out.push(id + " on " + date + " (" + x.v + "): " + bad.join("; "));
  }
  return out;
}

// Runs the statements in pre (a throw comes back as error), then reports the panel.
const look = (h, pre, deep = true) => h.evaluate("(() => { const snap = " + snap + "; let error = null; try { " + pre + " } catch (e) { error = String(e); } return { ...snap(" + deep + "), error }; })()");
const draw = (h, id, date) => look(h, "GEL.showAnswer(" + q(id) + ", " + q(date) + ");");
const drawNoMatch = (h, text, date) => look(h, "GEL.showNoMatch(" + q(text) + ", " + q(date) + ");");

export async function run(h) {
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  const D = JSON.parse(fs.readFileSync(h.data, "utf8"));
  const R = E.read_on;
  const byId = Object.fromEntries(D.entries.map((e) => [e.id, e]));
  const withIntervals = D.entries.filter((e) => e.versions?.length && e.intervals?.length);
  const rowOf = (e, commit) => e.versions.find((v) => v.commit === commit);

  // ---------- the expected answer for one entry and date, from the data only (text compares of YYYY-MM-DD) ----------
  const base = (d) => ({
    status: null, since: null, applies: null, "applies-note": null, "source-row": null, later: d > R ? T.later(R) : null,
    asked: "Date asked " + d, read: "Corpus read " + R, snapshot: E.snapshot_line, notice: E.notice,
  });
  function expectFor(e, d) {
    const x = {
      v: "", state: "interim", id: e.id, date: d, commit: null, title: n(e.title), fields: base(d),
      parts: { text: null, message: null, offer: null, browse: null }, linkTexts: [OFFICIAL_SOURCE], hrefs: [e.official_url], sentence: "",
    };
    const tail = d > R ? " " + T.later(R) : "";
    if (!e.versions?.length || !e.intervals?.length) {
      x.v = "V1";
      x.parts.text = T.v1(d);
      x.sentence = e.title + ": " + x.parts.text + tail;
      return x;
    }
    let cov = null;
    for (const i of e.intervals) if (i.from <= d) cov = i;
    if (!cov) {
      const first = e.intervals[0].from;
      x.v = first > R ? "V4" : "V2";
      // V2 uses the publication-date sentence when the row of the first interval has date_basis (read from the data file).
      x.parts.text = x.v === "V4" ? T.v4(first, d) : rowOf(e, e.intervals[0].commit)?.date_basis ? T.v2p(first, d) : T.v2(first, d);
      x.parts.offer = "Show " + first;
      x.sentence = e.title + ": " + x.parts.text + tail;
      return x;
    }
    const row = rowOf(e, cov.commit);
    if (cov.state === "repealed") {
      x.v = "V3";
      x.fields.status = "Repealed on " + cov.from;
      x.parts.message = row.message ? n(row.message) : null;
      x.sentence = e.title + ": Repealed on " + cov.from + "." + (row.message ? " " + row.message : "") + tail;
      return x;
    }
    const word = row.kind === "translation" ? "translation" : row.kind + " version";
    const archive = row.copy === "archive";
    x.v = row.date_basis ? "V6" : "plain";
    x.state = "plain";
    x.commit = cov.commit;
    x.fields.status = "Version in force on " + d;
    x.linkTexts = archive ? [ARCHIVE_COPY, OFFICIAL_SOURCE] : [OFFICIAL_TEXT];
    x.hrefs = archive ? [row.source_url, e.official_url] : [row.source_url];
    if (archive) x.fields["source-row"] = OFFICIAL_SOURCE;
    if (row.date_basis) {
      x.fields.since = T.v6(row.in_force);
      x.sentence = e.title + ", version in force on " + d + ": " + word + ". " + x.fields.since;
    } else {
      x.fields.since = "In force since " + row.in_force;
      x.sentence = e.title + ", version in force on " + d + ": " + word + ", in force since " + row.in_force + ".";
    }
    if (e.applies_from) {
      x.fields.applies = (cov.not_yet_applying ? "Duties start to apply on " : "Duties apply from ") + e.applies_from + ".";
      x.sentence += " " + x.fields.applies;
      if (e.applies_note) {
        x.fields["applies-note"] = n(e.applies_note);
        x.sentence += " " + e.applies_note;
      }
    }
    x.sentence += tail;
    return x;
  }
  function expectNoMatch(text, d) {
    const x = {
      v: "V5", state: "no-match", id: null, date: d, commit: null, title: null, fields: base(d),
      parts: { text: T.v5(text), message: null, offer: null, browse: "Browse by place" }, linkTexts: [], hrefs: [], sentence: T.v5(text),
    };
    x.fields.later = null;
    return x;
  }

  // Draws one law on one date and holds the whole panel against the expectation; extra returns more problems.
  async function answer(tag, label, id, date, want, extra = () => []) {
    const x = expectFor(byId[id], date);
    const s = await draw(h, id, date);
    h.verdict(tag, label + ": " + id + " on " + date + " is " + want, [
      ...(x.v === want ? [] : ["the data gives " + x.v + ", the story says " + want]),
      ...compare(x, s),
      ...extra(s, x),
    ]);
    return s;
  }

  // ---------- setup: the data file matches expected.json, and the intervals can be read ----------
  {
    const problems = h.eqs([["data read_on", D.snapshot.read_on, R], ["data notice", D.notice, E.notice]]);
    for (const e of withIntervals) {
      for (const i of e.intervals) {
        const row = rowOf(e, i.commit);
        if (!row) problems.push(e.id + ": interval " + i.from + " names no row");
        else if (!["adopted", "consolidated", "translation", "repeal"].includes(row.kind)) problems.push(e.id + ": row kind " + row.kind);
        else if ((i.state === "repealed") !== (row.kind === "repeal")) problems.push(e.id + ": interval " + i.from + " is " + i.state + " on a " + row.kind + " row");
      }
    }
    h.verdict("06-data", "the data file agrees with expected.json (read_on " + R + ") and every interval names a row of the right kind", problems.slice(0, 10));
  }

  // ---------- AC1: link only ----------
  await h.open("ok");
  for (const id of [AE, AG]) await answer("06-ac1", "link only shows V1 and one Official source link", id, "2025-06-01", "V1");

  // ---------- AC2: before the first version ----------
  await h.open("ok");
  let s = await look(h, "GEL.choose(" + q(CSRD) + "); GEL.setDate('2022-12-31');");
  {
    const x = expectFor(byId[CSRD], "2022-12-31");
    h.verdict("06-ac2", "CSRD on 2022-12-31 (chosen with GEL.choose, then GEL.setDate) is V2 naming 2023-01-05 with the Show 2023-01-05 button", [
      ...compare(x, s),
      ...h.eqs([["variant", x.v, "V2"], ["V2 sentence", s.parts.text, T.v2("2023-01-05", "2022-12-31")], ["offer text", s.parts.offer, "Show 2023-01-05"], ["offer tag", s.offerTag, "BUTTON"], ["offer type", s.offerType, "button"]]),
    ]);
  }
  const focused = await h.evaluate("(() => { const b = document.querySelector('#answer-interim button[data-part=\"offer\"]'); if (!b) return false; b.focus(); return document.activeElement === b; })()");
  await h.press("Enter");
  await h.waitFor("document.getElementById('date').value === '2023-01-05'", 3000).catch(() => {});
  s = await look(h, "");
  {
    const x = expectFor(byId[CSRD], "2023-01-05");
    h.verdict("06-ac2", "pressing Enter on the focused Show 2023-01-05 button: the date field holds 2023-01-05, the panel is plain with commit 8960295fa, focus is on #date", [
      ...(focused ? [] : ["the offer button could not be focused"]),
      ...compare(x, s),
      ...h.eqs([["date field", s.dateValue, "2023-01-05"], ["document.activeElement", s.active, "date"], ["state", s.state, "plain"], ["GEL.chosen", await h.evaluate("GEL.chosen"), CSRD]]),
      ...(h.sameCommit(s.commit, "8960295fa") ? [] : ["data-commit " + h.fmt(s.commit) + " does not start 8960295fa"]),
      ...(h.sameCommit(s.commit, E.csrd.find((r) => r.date === "2023-01-05").commit) ? [] : ["data-commit differs from expected.json for 2023-01-05"]),
    ]);
  }
  await h.open("ok");
  await answer("06-ac2", "before the record starts, the first row has only a publication date", BJ, "1999-02-11", "V2", (s) => h.eqs([
    ["V2 publication-date sentence, literal", s.parts.text, "The earliest stored version of this law has a publication date of 1999-02-12, after 1999-02-11; the corpus does not record when it entered into force, and the law may still have been in force."],
    ["hidden sentence", s.sentence, byId[BJ].title + ": " + T.v2p("1999-02-12", "1999-02-11")], ["offer", s.parts.offer, "Show 1999-02-12"],
  ]));
  {
    // Every real law whose first interval's row has date_basis: the day before its first interval reads the publication-date sentence.
    // (CSRD above and the AC4 sweep pin the current V2 sentence for every other law.)
    const dated = withIntervals.filter((e) => rowOf(e, e.intervals[0].commit)?.date_basis && e.intervals[0].from <= R);
    const bad = [];
    for (const e of dated) {
      const first = e.intervals[0].from, d = dayBefore(first);
      const s = await draw(h, e.id, d);
      bad.push(...h.eqs([[e.id + " V2 sentence", s.parts.text, T.v2p(first, d)], [e.id + " hidden sentence", s.sentence, e.title + ": " + T.v2p(first, d)], [e.id + " offer", s.parts.offer, "Show " + first]]));
    }
    h.verdict("06-ac2", "the day before the first interval: the " + dated.length + " laws whose first row has date_basis read the publication-date sentence", [
      ...(dated.some((e) => e.id === BJ) ? [] : ["data: " + BJ + " is not among the laws with a date_basis first row"]), ...bad.slice(0, 10),
    ]);
  }

  // ---------- AC3: repealed ----------
  await h.open("ok");
  await answer("06-ac3", "repealed on its date", AX, "2025-11-01", "V3", (s) => h.eqs([
    ["status", s.fields.status, "Repealed on 2025-11-01"],
    ["message", s.parts.message, "Landskapslag (2018:41) repealed 2025-11-01 by landskapslag (2025:71)"],
  ]));
  await answer("06-ac3", "the day before the repeal", AX, "2025-10-31", "plain");
  await answer("06-ac3", "message with quotes intact", GN, "2023-05-05", "V3", (s) => h.eqs([
    ["message", s.parts.message, 'Arrêté A/2022/1646/MEDD/CAB/SGG replaced 2023-05-05 by Arrêté A/2023/1595/MEDD/CAB/SGG (the SGG instrument index lists A/2022/1646 as "Abrogé par" A/2023/1595)'],
  ]));
  await answer("06-ac3", "the day before, commit 326e95c44", GN, "2023-05-04", "plain", (s) => (h.sameCommit(s.commit, "326e95c44") ? [] : ["data-commit " + h.fmt(s.commit) + " does not start 326e95c44"]));
  for (const id of [IE, IE2]) {
    await answer("06-ac3", "a repeal row without a message shows no message element and no undefined", id, "2024-09-19", "V3", (s, x) => h.eqs([
      ["message element", s.parts.message, null], ["interim children", s.interimTags.join(","), "A"], ["status", s.fields.status, "Repealed on 2024-09-19"], ["sentence", s.sentence, x.sentence],
    ]));
  }
  {
    const e = byId[FI];
    const cov = e.intervals.at(-1);
    const named = rowOf(e, cov.commit);
    const others = e.versions.filter((v) => v.kind === "repeal" && v.in_force === cov.from && v.commit !== cov.commit);
    await answer("06-ac3", "the message is the row the repealed interval's commit names, not its same-day sibling", FI, "2024-01-01", "V3", (s) => [
      ...(others.length === 1 && others[0].message !== named.message ? [] : ["data: expected one same-day repeal row with a different message"]),
      ...h.eqs([["message", s.parts.message, n(named.message)]]),
      ...(others.some((o) => s.parts.message === n(o.message)) ? ["the sibling row's message is shown"] : []),
    ]);
  }

  // ---------- AC4: not yet in force ----------
  await h.open("ok");
  await answer("06-ac4", "announced law", KG104, "2026-06-01", "V4", (s) => h.eqs([["V4 naming 2027-01-01", s.parts.text, T.v4("2027-01-01", "2026-06-01")], ["offer button", s.parts.offer, "Show 2027-01-01"], ["offer tag", s.offerTag, "BUTTON"], ["offer type", s.offerType, "button"]]));
  {
    // The button sets the date to the first stored version's date, which is after the read date: a plain answer with the later line.
    // As on the page, the law is chosen (GEL.chosen) before the date is set, so the date change redraws it.
    await look(h, "GEL.choose(" + q(KG104) + "); GEL.setDate('2026-06-01');");
    const focusedV4 = await h.evaluate("(() => { const b = document.querySelector('#answer-interim button[data-part=\"offer\"]'); if (!b) return false; b.focus(); return document.activeElement === b; })()");
    await h.press("Enter");
    await h.waitFor("document.getElementById('date').value === '2027-01-01'", 3000).catch(() => {});
    const t = await look(h, "");
    const x = expectFor(byId[KG104], "2027-01-01");
    h.verdict("06-ac4", "pressing Enter on the focused Show 2027-01-01 button of the V4 answer lands on the in-force answer for 2027-01-01 (commit 17c2c0302) with the later line", [
      ...(focusedV4 ? [] : ["the offer button could not be focused"]), ...compare(x, t),
      ...h.eqs([["variant", x.v, "plain"], ["date field", t.dateValue, "2027-01-01"], ["state", t.state, "plain"], ["later line", t.fields.later, T.later(R)], ["GEL.chosen", await h.evaluate("GEL.chosen"), KG104]]),
      ...(h.sameCommit(t.commit, "17c2c0302") ? [] : ["data-commit " + h.fmt(t.commit) + " does not start 17c2c0302"]),
      ...(t.sentence.endsWith(" " + T.later(R)) ? [] : ["the hidden sentence does not end with the later line"]),
    ]);
    const bad = [];
    for (const id of STORY_LATE) {
      const first = byId[id].intervals[0].from, before = dayBefore(first);
      const u = await look(h, "GEL.choose(" + q(id) + "); GEL.setDate(" + q(before) + "); document.querySelector('#answer-interim button[data-part=\"offer\"]').click();");
      bad.push(...compare(expectFor(byId[id], first), u).map((p) => id + ": " + p), ...h.eqs([[id + " date field", u.dateValue, first], [id + " later line", u.fields.later, T.later(R)]]));
    }
    h.verdict("06-ac4", "every one of the " + STORY_LATE.length + " announced laws: the V4 button on the day before its first interval opens the answer for that first date, later line shown", bad.slice(0, 10));
  }
  await answer("06-ac4", "on its first day", KG104, "2027-01-01", "plain", (s) => (h.sameCommit(s.commit, "17c2c0302") ? [] : ["data-commit " + h.fmt(s.commit) + " does not start 17c2c0302"]));
  await answer("06-ac4", "V4 and the later line together", KG104, "2026-12-31", "V4", (s) => h.eqs([["later line", s.fields.later, T.later("2026-11-17")], ["V4", s.parts.text, T.v4("2027-01-01", "2026-12-31")]]));
  {
    const late = withIntervals.filter((e) => e.intervals[0].from > R).map((e) => e.id).sort();
    h.verdict("06-ac4", "the data holds " + late.length + " entries whose first interval starts after read_on " + R + " (want 5)", late.length === 5 ? [] : ["live count " + late.length + ": " + late.join(", ")]);
    h.verdict("06-ac4", "those entries are the five the story names", h.eqs([["ids", late.join(","), STORY_LATE.join(",")]]));
    const pairs = withIntervals.map((e) => [e.id, dayBefore(e.intervals[0].from)]);
    const items = pairs.map(([id, d]) => ({ id, date: d, x: expectFor(byId[id], d) }));
    const bad = await h.evaluate("(() => { const snap = " + snap + ", compare = " + compare + "; return (" + sweepPage + ")(" + q(items) + "); })()");
    const v4 = items.filter((i) => i.x.v === "V4").length, v2 = items.filter((i) => i.x.v === "V2").length;
    h.verdict("06-ac4", "the day before the first interval: " + v4 + " entries are V4 and every other (" + v2 + ") is V2, each with its sentence", [
      ...(v4 + v2 === withIntervals.length ? [] : ["some before-first answers are neither V2 nor V4"]), ...bad.slice(0, 10),
    ]);
  }

  // ---------- AC5: no match (V5) ----------
  // The law box is read-only on this build, so Enter in the box cannot be driven: GEL.showNoMatch is called directly.
  await h.open("ok");
  s = await drawNoMatch(h, "Sarbanes-Oxley", "2025-06-01");
  h.verdict("06-ac5", "V5 for Sarbanes-Oxley on 2025-06-01 (GEL.showNoMatch called directly, the law box being read-only): the exact sentence and the Browse by place link", [
    ...compare(expectNoMatch("Sarbanes-Oxley", "2025-06-01"), s),
    ...h.eqs([["V5 sentence", s.parts.text, 'No law in the corpus matches "Sarbanes-Oxley"; this does not mean no such law exists.'], ["href", s.browse?.href, "#browse-by-place"], ["has target attribute", s.browse?.hasTarget, false]]),
  ]);
  {
    const targetId = (s.browse?.href ?? "").slice(1);
    const exists = await h.evaluate("!!document.getElementById(" + q(targetId) + ")");
    h.verdict("06-ac5", "the Browse by place target id exists in the page", exists && targetId === "browse-by-place" ? [] : ["no element with id " + h.fmt(targetId)]);
  }
  {
    await h.evaluate("document.getElementById('example').focus()");
    let presses = 0, reached = false;
    while (!reached && presses < 12) {
      await h.press("Tab");
      presses++;
      reached = await h.evaluate("document.activeElement.matches('#answer-interim a[data-part=\"browse\"]')");
    }
    h.verdict("06-ac5", "the Browse by place link is reached from #example with Tab in at most 12 presses", reached ? [] : ["not reached after " + presses + " presses; active element " + (await h.evaluate("document.activeElement.id || document.activeElement.tagName"))]);
    const pages = async () => (await (await fetch("http://127.0.0.1:" + h.cdp + "/json/list")).json()).filter((t) => t.type === "page").length;
    const origin = await h.evaluate("location.origin"), tabsBefore = await pages();
    await h.press("Enter");
    await h.waitFor("location.hash === '#browse-by-place'", 2000).catch(() => {});
    h.verdict("06-ac5", "Enter on the link leaves location.hash #browse-by-place in the same tab", h.eqs([
      ["hash", await h.evaluate("location.hash"), "#browse-by-place"], ["origin", await h.evaluate("location.origin"), origin], ["page targets", await pages(), tabsBefore],
    ]));
  }
  {
    const needle = "sarbanes-oxley";
    const hits = D.entries.filter((e) => [e.title, e.id, e.citation].some((t) => typeof t === "string" && t.toLowerCase().includes(needle)));
    h.verdict("06-ac5", needle + " matches " + hits.length + " of " + D.entries.length + " entries in title, id or citation (want 0)", hits.length === 0 ? [] : hits.map((e) => e.id));
  }

  // ---------- AC6: in-force date not recorded (V6) ----------
  await h.open("ok");
  const bjV6 = "The corpus does not record when this version entered into force; 1999-02-12 is the date it was published, so it may have started later.";
  for (const d of ["2000-01-01", "1999-02-12"]) {
    await answer("06-ac6", "V6 in place of In force since", BJ, d, "V6", (s) => [
      ...h.eqs([["V6 text", s.fields.since, bjV6], ["status", s.fields.status, "Version in force on " + d]]),
      ...(s.text.includes("In force since") ? ["the visible panel text holds In force since"] : []),
    ]);
  }
  await answer("06-ac6", "one day earlier is V2", BJ, "1999-02-11", "V2");
  await answer("06-ac6", "an ordinary version shows no V6", CSRD, "2025-06-01", "plain", (s) => [
    ...(s.text.includes("does not record when") ? ["V6 text is visible"] : []),
    ...h.eqs([["since", s.fields.since, "In force since 2025-04-17"]]),
  ]);

  // ---------- AC7: the later line ----------
  await h.open("ok");
  const later = "The corpus was read on 2026-11-17. Later changes are not in it.";
  const laterCases = [
    ["V1", AE, "2026-11-18", true], ["V1", AE, "2026-11-17", false],
    ["V2", CSRD, "2022-12-31", false], // V2 needs a date before the first interval, which starts on or before read_on, so it is never later than read_on
    ["V3", KG71, "2027-06-01", true], ["V3", KG71, "2027-01-01", true], ["plain", KG71, "2026-11-17", false],
    ["V4", KG104, "2026-12-31", true], ["V6", BJ, "2026-11-18", true], ["V6", BJ, "2026-11-17", false],
    ["plain", CSRD, "2026-11-18", true], ["plain", CSRD, "2026-11-17", false],
  ];
  for (const [v, id, d, shown] of laterCases) {
    await answer("06-ac7", "the later line is " + (shown ? "shown" : "absent"), id, d, v, (s) => [
      ...h.eqs([["later line", s.fields.later, shown ? later : null]]),
      ...(shown === s.sentence.endsWith(" " + later) ? [] : ["the hidden sentence " + (shown ? "does not end with" : "ends with") + " the later line"]),
      ...(id === KG71 && d === "2027-06-01" ? h.eqs([["status", s.fields.status, "Repealed on 2027-01-01"]]) : []),
    ]);
  }
  s = await drawNoMatch(h, "Sarbanes-Oxley", "2026-11-18");
  h.verdict("06-ac7", "V5 never shows the later line, even for a date after read_on", [...h.eqs([["later line", s.fields.later, null]]), ...(s.sentence.includes("Later changes") ? ["the sentence holds the later line"] : [])]);
  {
    const sources = fs.readdirSync(webDir).filter((f) => f.endsWith(".js")).map((f) => [f, fs.readFileSync(path.join(webDir, f), "utf8")]);
    const count = (text, needle) => text.split(needle).length - 1;
    const problems = [];
    for (const [f, text] of sources) {
      const dates = count(text, "new Date");
      if (dates > (f === "dates.js" ? 1 : 0)) problems.push(f + ": " + dates + " x new Date");
      for (const w of ["Date.parse", "Temporal", "toISOString"]) if (count(text, w)) problems.push(f + ": " + w);
    }
    h.verdict("06-ac7", "web/*.js (" + sources.length + " files): no new Date except the one in dates.js, no Date.parse, Temporal or toISOString", problems);
  }

  // ---------- AC8: the label rule, on the fixture ----------
  await h.open("fixture");
  {
    const fixture = {
      id: "fixture-archive-copy", title: FIX_TITLE, official_url: byId[CSRD].official_url,
      intervals: [{ from: "2000-01-01", state: "in_force", commit: FIX_COMMIT }],
      versions: [{ in_force: "2000-01-01", kind: "consolidated", language: "en", source_url: ARCHIVE_URL, commit: FIX_COMMIT, copy: "archive" }],
    };
    const x = expectFor(fixture, "2025-06-01");
    s = await draw(h, fixture.id, "2025-06-01");
    h.verdict("06-ac8", "a row with copy archive reads Archive copy, not the official text, with its source_url, plus Official source with the entry's official_url", [
      ...compare(x, s),
      ...h.eqs([["link texts", s.links.map((l) => l.text).join(" | "), [ARCHIVE_COPY, OFFICIAL_SOURCE].join(" | ")], ["hrefs", s.links.map((l) => l.href).join(" | "), [ARCHIVE_URL, byId[CSRD].official_url].join(" | ")], ["commit", s.commit, FIX_COMMIT]]),
    ]);
    const realCopies = D.entries.reduce((k, e) => k + (e.versions ?? []).filter((v) => v.copy).length, 0);
    await answer("06-ac8", "a row without copy reads Official text and hides the source row (the real data holds " + realCopies + " rows with copy)", CSRD, "2025-06-01", "plain", (s) => h.eqs([
      ["link texts", s.links.map((l) => l.text).join(" | "), OFFICIAL_TEXT], ["source row", s.fields["source-row"], null],
    ]));
  }

  // ---------- AC9: what every one of the six variants keeps ----------
  await h.open("ok");
  const resources = () => h.evaluate("performance.getEntriesByType('resource').length");
  const resBefore = await resources();
  const six = [
    { v: "V1", id: AE, date: "2025-06-01" }, { v: "V2", id: CSRD, date: "2022-12-31" }, { v: "V3", id: AX, date: "2025-11-01" },
    { v: "V4", id: KG104, date: "2026-06-01" }, { v: "V5", text: "Sarbanes-Oxley", date: "2025-06-01" }, { v: "V6", id: BJ, date: "2000-01-01" },
  ];
  const seen = [];
  let previous = await h.evaluate("document.getElementById('answer-sentence').textContent");
  for (const c of six) {
    const x = c.id ? expectFor(byId[c.id], c.date) : expectNoMatch(c.text, c.date);
    const s = c.id ? await draw(h, c.id, c.date) : await drawNoMatch(h, c.text, c.date);
    seen.push({ c, x, s, problems: [...(x.v === c.v ? [] : ["the data gives " + x.v]), ...compare(x, s)], changed: s.sentence !== "" && s.sentence !== previous });
    previous = s.sentence;
  }
  const resAfter = await resources();
  const each = (f) => seen.flatMap(({ c, s, x, problems, changed }) => f({ c, s, x, problems, changed }).map((p) => c.v + ": " + p));
  h.verdict("06-ac9", "all six variants (V1 to V6) match the expectation from the data", each(({ problems }) => problems));
  h.verdict("06-ac9", "all six keep the file's notice, Date asked and Corpus read, visible", each(({ c, s }) => h.eqs([
    ["notice", s.fields.notice, E.notice], ["asked", s.fields.asked, "Date asked " + c.date], ["read", s.fields.read, "Corpus read " + R],
  ])));
  h.verdict("06-ac9", "every official link opens in a new tab with noopener and ends (opens in a new tab); V5 has none and its link has no target", [
    ...each(({ s }) => s.links.flatMap((l) => [
      ...(l.target === "_blank" ? [] : ["target " + h.fmt(l.target)]), ...((l.rel ?? "").split(/\s+/).includes("noopener") ? [] : ["rel " + h.fmt(l.rel)]),
      ...(l.text.endsWith("(opens in a new tab)") ? [] : ["text " + h.fmt(l.text)]),
    ])),
    ...(seen[4].s.links.length === 0 && seen[4].s.browse?.hasTarget === false ? [] : ["V5 has external links or a target"]),
  ]);
  h.verdict("06-ac9", "#answer-sentence is non-empty and different from the previous variant's after each draw", each(({ changed }) => (changed ? [] : ["unchanged or empty"])));
  h.verdict("06-ac9", "no red, no ! , no svg, img or role=alert in the panel of any variant", each(({ s }) => [
    ...s.red.map((r) => "red " + r), ...(s.bang ? ['"!" in the panel text'] : []),
    ...(s.svg + s.img + s.alert ? ["svg " + s.svg + ", img " + s.img + ", alert " + s.alert] : []),
  ]));
  h.verdict("06-ac9", "no resource request while drawing the six variants (" + resBefore + " resource entries before, " + resAfter + " after)", resBefore === resAfter ? [] : ["resource entries went from " + resBefore + " to " + resAfter]);

  // ---------- AC10: the page source holds the six strings and no unqualified "does not exist" ----------
  {
    const files = fs.readdirSync(webDir).filter((f) => /\.(js|html)$/.test(f));
    const text = files.map((f) => fs.readFileSync(path.join(webDir, f), "utf8")).join("\n");
    const fragments = [
      "The corpus stores no text of this law, only a link to it, so it cannot say which version applied on ", "The earliest stored version of this law starts on ",
      "The earliest stored version of this law has a publication date of ",
      "This law was not yet in force on ", "No law in the corpus matches", "The corpus does not record when this version entered into force; ", "Repealed on ", "The corpus was read on ",
    ];
    const bareClaims = text.split("\n").filter((l) => /does not exist|doesn't exist|no such law|no law exists|not found/i.test(l) && !l.includes("this does not mean no such law exists"));
    h.verdict("06-ac10", "the page source (" + files.length + " files) holds the six strings and the later line, and no sentence says a law does not exist without the qualifier", [
      ...fragments.filter((f) => !text.includes(f)).map((f) => "missing: " + f),
      ...bareClaims.map((l) => "unqualified: " + l.trim()),
      ...["registered_no_instruments", "no_stored_text"].filter((k) => text.includes(k)).map((k) => "a sentence for " + k),
    ]);
  }

  // ---------- AC11: the application line ----------
  await h.open("ok");
  const esrsNote = "Applies to financial years starting on or after this date; phased by company size.";
  await answer("06-ac11", "not yet applying", ESRS, "2023-12-25", "plain", (s) => h.eqs([["applies", s.fields.applies, "Duties start to apply on 2024-01-01."], ["note", s.fields["applies-note"], esrsNote]]));
  await answer("06-ac11", "applying", ESRS, "2024-01-01", "plain", (s) => h.eqs([["applies", s.fields.applies, "Duties apply from 2024-01-01."], ["note", s.fields["applies-note"], esrsNote]]));
  await answer("06-ac11", "EUDR before its application date, the note in full", EUDR, "2026-11-17", "plain", (s) => h.eqs([
    ["applies", s.fields.applies, "Duties start to apply on 2026-12-30."], ["note", s.fields["applies-note"], n(byId[EUDR].applies_note)],
  ]));
  await answer("06-ac11", "EUDR on its application date", EUDR, "2026-12-30", "plain", (s) => h.eqs([["applies", s.fields.applies, "Duties apply from 2026-12-30."]]));
  await answer("06-ac11", "CSRD shows no application line", CSRD, "2025-06-01", "plain", (s) => [
    ...h.eqs([["applies", s.fields.applies, null], ["note", s.fields["applies-note"], null]]), ...(s.text.includes("Duties") ? ["the visible text holds Duties"] : []),
  ]);
  await answer("06-ac11", "an entry with applies_from and no applies_note shows the line and no note element", AVR, "2025-06-22", "plain", (s) => [
    ...h.eqs([["applies", s.fields.applies, "Duties apply from 2019-01-01."], ["note", s.fields["applies-note"], null]]), ...(byId[AVR].applies_note ? ["data: the entry has a note"] : []),
  ]);
  {
    const withFrom = D.entries.filter((e) => e.applies_from && e.intervals?.length);
    const problems = [];
    for (const e of withFrom) {
      for (const i of e.intervals) {
        if (i.state === "repealed") continue;
        const d = i.from, x = expectFor(e, d);
        const t = await draw(h, e.id, d);
        problems.push(...compare(x, t).map((p) => e.id + " on " + d + ": " + p));
      }
    }
    h.verdict("06-ac11", "every entry with applies_from (" + withFrom.length + "), on each of its interval dates: the line and note match the data", problems.slice(0, 10));
  }

  // ---------- injection safety and the missing message ----------
  {
    const evil = structuredClone(D);
    const e = evil.entries.find((x) => x.id === AX);
    rowOf(e, e.intervals.at(-1).commit).message = EVIL;
    h.addVariant("06-injection", evil);
    await h.open("06-injection");
    const s = await draw(h, AX, "2025-11-01");
    h.verdict("06-inject", "a repeal message with quotes, <b> and & is shown as written, with no <b> element", [
      ...h.eqs([["message", s.parts.message, n(EVIL)], ["interim tags", s.interimTags.join(","), "SPAN,A"], ["hidden sentence", s.sentence, e.title + ": Repealed on 2025-11-01. " + EVIL]]),
    ]);
    await h.open("06-injection");
    const t = await drawNoMatch(h, 'a "<i>b</i>" & c', "2025-06-01");
    h.verdict("06-inject", "the typed text in V5 is shown as written, with no <i> element", [
      ...h.eqs([["V5 sentence", t.parts.text, T.v5('a "<i>b</i>" & c')], ["interim tags", t.interimTags.join(","), "SPAN,A"]]),
    ]);
  }

  // ---------- the sweep: every entry on each interval's from, the day before, and two far dates ----------
  await h.open("ok");
  {
    const pairs = [];
    for (const e of D.entries) {
      const dates = new Set(["1000-01-01", "2099-12-31"]);
      for (const i of e.intervals ?? []) { dates.add(i.from); dates.add(dayBefore(i.from)); }
      for (const d of dates) pairs.push([e.id, d]);
    }
    const bad = [], seenV = {};
    for (let i = 0; i < pairs.length; i += 600) {
      const items = pairs.slice(i, i + 600).map(([id, d]) => ({ id, date: d, x: expectFor(byId[id], d) }));
      for (const it of items) seenV[it.x.v] = (seenV[it.x.v] ?? 0) + 1;
      bad.push(...(await h.evaluate("(() => { const snap = " + snap + ", compare = " + compare + "; return (" + sweepPage + ")(" + q(items) + "); })()")));
    }
    h.verdict("06-sweep", "sweep of " + pairs.length + " (entry, date) pairs over " + D.entries.length + " entries (" + Object.entries(seenV).map(([v, k]) => v + " " + k).join(", ") + "): variant, visibility, text, links, commit and no undefined", [
      ...bad.slice(0, 10), ...(bad.length > 10 ? ["... and " + (bad.length - 10) + " more (" + bad.length + " mismatches in all)"] : []),
    ]);
  }
}
