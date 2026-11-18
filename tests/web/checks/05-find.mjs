// Story 05 browser check: type in the law box, read the list, pick a law.
// Expected values come from the story text, or from the data file read with fs and counted here. None come from web/*.js.
import fs from "node:fs";

const CSRD = "eu-csrd-2022-2464";
// The 12 matches of "csrd" in the order story 05 gives them: rows 1 to 8, then the four that only a longer list would show.
const STORY_CSRD = [
  CSRD, "gr-law-5164-2024", "be-loi-2024-12-02-csrd", "bg-znfo-zid-2024", "bg-zschet-zid-2024", "cy-companies-amendment-3-2025", "dk-lov-480-2024", "fi-laki-1249-2023",
  "it-dlgs-125-2024", "li-pgr-art-1096b-k", "pl-csrd-act-2024", "pl-csrd-act-2025",
];
const DATE = "2025-06-01";
const NO_MATCH = "No law matches. Browse by place below.";
const MARKUP_TITLE = "Zzfx <b>bold</b> & <i>it</i> law <img src=x onerror=\"window.__xss=1\">";

// The count line as the story words it (written out here, not read from web/search.js).
const line = (n) => (n === 0 ? NO_MATCH : n === 1 ? "1 law matches" : n <= 8 ? n + " laws match" : n + " laws match, showing 8");

// My own fold and brute-force count, from the story's definition.
const LETTERS = { "ł": "l", "ø": "o", "đ": "d", "ð": "d", "ı": "i", "ß": "ss", "æ": "ae", "œ": "oe", "þ": "th", "ə": "e" };
const fold = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/[łøđðıßæœþə]/g, (c) => LETTERS[c])
    .replace(/[\u{2018}\u{2019}]/gu, "'")
    .replace(/[\u{2013}\u{2014}]/gu, "-");
const haystacks = (e) => [e.id, e.title, e.citation, ...(Array.isArray(e.aliases) ? e.aliases : [])].filter((s) => typeof s === "string").map(fold);
const matching = (entries, q) => {
  const f = fold(q).trim();
  return f === "" ? [] : entries.filter((e) => haystacks(e).some((s) => s.includes(f)));
};

// Page-side snippets are plain functions sent as text: they see nothing from this module and take their inputs as arguments.
const installHooks = () => {
  window.__f = { errs: [], answers: [], noMatch: [], lastInput: 0 };
  addEventListener("error", (e) => window.__f.errs.push(String(e.message)));
  addEventListener("unhandledrejection", (e) => window.__f.errs.push(String(e.reason)));
  GEL.onAnswer((d) => window.__f.answers.push({ id: d.entry.id, date: d.date }));
  GEL.showNoMatch = (text, date) => { window.__f.noMatch.push({ text, date }); };
  document.getElementById("law").addEventListener("input", () => { window.__f.lastInput = performance.now(); });
};

const readState = () => {
  const $ = (s) => document.querySelector(s);
  const c = $("#match-count"), p = $("#answer-panel"), a = document.activeElement;
  return {
    rows: [...document.querySelectorAll("#match-rows > li")].map((li) => {
      const b = li.querySelector("button.match-row");
      const t = (s) => { const e = li.querySelector(s); return e ? e.textContent : null; };
      const title = li.querySelector(".match-title");
      return { id: b && b.getAttribute("data-id"), type: b && b.getAttribute("type"), title: t(".match-title"), place: t(".match-place"), idText: t(".match-id"), h: b ? b.getBoundingClientRect().height : 0, top: b ? b.getBoundingClientRect().top : 0, titleKids: title ? title.children.length : -1 };
    }),
    rowButtons: document.querySelectorAll(".match-row").length,
    count: c ? { text: c.textContent, hidden: c.hidden, shown: c.checkVisibility() } : { text: null, hidden: null, shown: null },
    box: $("#law").value,
    active: a === document.body ? "body" : a.classList.contains("match-row") ? "row:" + a.getAttribute("data-id") : a.id || a.tagName,
    chosen: GEL.chosen,
    panel: { id: p.getAttribute("data-id"), date: p.getAttribute("data-date"), shown: !p.hidden },
    answers: window.__f.answers.length,
    lastAnswer: window.__f.answers[window.__f.answers.length - 1] || null,
    noMatch: window.__f.noMatch.slice(),
    errs: window.__f.errs.slice(),
    xss: typeof window.__xss,
    sinceInput: performance.now() - window.__f.lastInput,
    rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
  };
};

const readRoles = () => {
  const law = document.getElementById("law");
  const aria = (e) => e.getAttributeNames().filter((n) => n === "role" || n.startsWith("aria-")).map((n) => e.tagName + "[" + n + "]");
  return {
    readonlyAttr: law.hasAttribute("readonly"),
    readOnly: law.readOnly,
    auto: law.getAttribute("autocomplete"),
    bad: [...document.querySelectorAll('[role="combobox"],[role="listbox"],[role="option"]')].map((e) => e.tagName + "#" + e.id),
    rowAria: [...document.querySelectorAll("#match-rows, #match-rows *")].flatMap(aria),
    boxAria: ["role", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-autocomplete", "aria-haspopup"].filter((n) => law.hasAttribute(n)),
  };
};

// Is the whole title of one row inside the boxes that hold it, and how many lines did it wrap to?
const measureRow = (id) => {
  const b = document.querySelector('.match-row[data-id="' + id + '"]');
  const base = { scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth };
  if (!b) return { found: false, ...base };
  const t = b.querySelector(".match-title");
  const range = document.createRange();
  range.selectNodeContents(t);
  const rects = [...range.getClientRects()].filter((r) => r.width > 0);
  const bottom = Math.max(...rects.map((r) => r.bottom)), right = Math.max(...rects.map((r) => r.right));
  const clipped = [];
  for (let e = t; e && e !== document.documentElement; e = e.parentElement) {
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    if ((s.overflowX !== "visible" || s.overflowY !== "visible") && (bottom > r.bottom + 1 || right > r.right + 1)) clipped.push(e.tagName + "#" + e.id + "." + e.className);
  }
  return {
    found: true, text: t.textContent, lines: new Set(rects.map((r) => Math.round(r.top))).size, clipped,
    lineClamp: getComputedStyle(t).webkitLineClamp, textBottom: bottom, titleBottom: t.getBoundingClientRect().bottom, rowBottom: b.getBoundingClientRect().bottom, ...base,
  };
};

const SPACE = { key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32, text: " ", unmodifiedText: " " };
const ARROW_DOWN = { key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40, nativeVirtualKeyCode: 40 };

export async function run(h) {
  const data = JSON.parse(fs.readFileSync(h.data, "utf8"));
  const byId = new Map(data.entries.map((e) => [e.id, e]));
  const placeName = (e) => data.places[e.place] ?? e.place;

  // Fixture laws: clones of the CSRD entry, so choosing one can draw an answer. Queries are tokens no real law contains.
  const fixture = (id, title, extra = {}) => {
    const e = structuredClone(byId.get(CSRD));
    delete e.aliases;
    return Object.assign(e, { id, title, citation: "Zzfix citation" }, extra);
  };
  const two = (i) => String(i).padStart(2, "0");
  const fx = {
    a: Array.from({ length: 23 }, (_, i) => fixture("zzfa-" + two(i + 1), "Zzfa fixture law " + two(i + 1))),
    b: Array.from({ length: 8 }, (_, i) => fixture("zzfb-" + (i + 1), "Zzfb fixture law " + (i + 1))),
    c: [fixture("zzfc-1", "Zzfc fixture law 1")],
    alias: fixture("aa-alias-only-fixture", "Alias only fixture law", { aliases: ["CBAM"] }),
    noCitation: fixture("zzfnull-1", "Zzfnull law without citation", { citation: null }),
    nullAliases: fixture("zzfnull-2", "Zzfnull law with null aliases", { aliases: null }),
    markup: fixture("zzfx-markup", MARKUP_TITLE),
  };
  const withFixtures = { ...data, entries: [...data.entries, ...fx.a, ...fx.b, ...fx.c, fx.alias, fx.noCitation, fx.nullAliases, fx.markup] };
  h.addVariant("05-fixtures", withFixtures);

  const page = (fn, ...args) => h.evaluate("(" + fn + ")(" + args.map((a) => JSON.stringify(a)).join(", ") + ")");
  const read = () => page(readState);
  const rowIds = (S) => S.rows.map((r) => r.id);
  const errs = (S) => (S.errs.length ? ["page errors: " + h.fmt(S.errs)] : []);
  const closed = (S, when) => h.eqs([
    [when + ": rows in the list", S.rows.length, 0],
    [when + ": list buttons anywhere", S.rowButtons, 0],
    [when + ": count line text", S.count.text, ""],
    [when + ": count line hidden", S.count.hidden, true],
  ]);
  const section = async (tag, fn) => {
    try { await fn(); } catch (e) { h.check(tag, "check ran to the end", false, "threw: " + e.message); }
  };
  const open = async (variant) => {
    await h.open(variant);
    await page(installHooks);
    await h.evaluate("__chk.setField(" + JSON.stringify(DATE) + ")");
  };
  const key = async (spec) => {
    await h.send("Input.dispatchKeyEvent", { type: spec.text ? "keyDown" : "rawKeyDown", ...spec });
    await h.send("Input.dispatchKeyEvent", { type: "keyUp", key: spec.key, code: spec.code, windowsVirtualKeyCode: spec.windowsVirtualKeyCode });
  };
  // Short letters-and-digits text goes in as key presses, so each character is one input event; anything else is one insert.
  const type = async (text, replace = false) => {
    await page((all) => { const l = document.getElementById("law"); l.focus(); if (all) l.select(); }, replace);
    if (!/^[a-z0-9 ]{1,24}$/i.test(text)) return h.send("Input.insertText", { text });
    for (const ch of text) {
      const up = ch.toUpperCase();
      await key({ key: ch, code: ch === " " ? "Space" : /[a-z]/i.test(ch) ? "Key" + up : "Digit" + ch, windowsVirtualKeyCode: ch === " " ? 32 : up.charCodeAt(0), text: ch, unmodifiedText: ch });
    }
  };
  // What a cleared or edited box fires: an input event with the new value.
  const setBox = (value) => page((v) => { const l = document.getElementById("law"); l.focus(); l.value = v; l.dispatchEvent(new Event("input", { bubbles: true })); }, value);
  const focusBox = () => page(() => document.getElementById("law").focus());
  // Resolves to null when the count line reads want within 3 s, else to the message to put in the verdict.
  const countIs = (want) => h.until(async () => (await h.evaluate("(document.getElementById('match-count') || {}).textContent")) === want, 3000, "the count line to read " + h.fmt(want)).then(() => null, (e) => e.message);
  const chosenIs = (want) => h.until(async () => (await h.evaluate("GEL.chosen")) === want, 2000, "GEL.chosen to be " + want).catch(() => {});
  const choseProblems = (S, id, when) => [
    ...h.eqs([
      [when + ": law box text", S.box, byId.get(id).title], [when + ": GEL.chosen", S.chosen, id], [when + ": answer panel data-id", S.panel.id, id],
      [when + ": answer panel data-date", S.panel.date, DATE], [when + ": focus", S.active, "law"], [when + ": answers drawn", S.answers, 1],
    ]),
    ...closed(S, when), ...errs(S),
  ];

  await section("05-csrd-data", async () => {
    const got = matching(data.entries, "csrd").map((e) => e.id).sort();
    const want = [...STORY_CSRD].sort();
    h.verdict("05-csrd-data", "the data file's matches for csrd, counted here with my own fold, are the story's 12 ids (so the page checks below can be compared with the story)", [
      ...want.filter((id) => !got.includes(id)).map((id) => "missing " + id),
      ...got.filter((id) => !want.includes(id)).map((id) => "extra " + id),
    ]);
  });

  await section("05-load", async () => {
    await h.open("ok");
    const L = await page(() => {
      const list = document.getElementById("match-list"), c = document.getElementById("match-count"), u = document.getElementById("match-rows");
      return { kids: list ? [...list.children].map((k) => k.tagName + "#" + k.id).join(" ") : null, role: c && c.getAttribute("role"), hidden: c && c.hidden, text: c && c.textContent, rows: u && u.children.length };
    });
    h.verdict("05-load", "at load #match-list holds the hidden, empty status line #match-count and the empty list #match-rows, so the live region exists before it is filled", h.eqs([
      ["#match-list children", L.kids, "P#match-count UL#match-rows"], ["#match-count role", L.role, "status"], ["#match-count hidden", L.hidden, true],
      ["#match-count text", L.text, ""], ["#match-rows children", L.rows, 0],
    ]));
  });

  await section("05-csrd", async () => {
    await open("ok");
    await type("CSRD");
    const S = await read();
    const first8 = STORY_CSRD.slice(0, 8);
    h.verdict("05-csrd", "typing CSRD once lists 8 rows: the first 8 of the story's 12 ids in order, the EU directive in row 1, no page error (most laws have no aliases key)", [
      ...h.eqs([["row ids", rowIds(S).join(" "), first8.join(" ")], ["row 1 place name", S.rows[0] && S.rows[0].place, placeName(byId.get(CSRD))]]),
      ...errs(S),
    ]);
    const problems = S.rows.length ? [] : ["no rows"];
    S.rows.forEach((r, i) => {
      const n = "row " + (i + 1), e = byId.get(r.id);
      if (!e) { problems.push(n + " has data-id " + h.fmt(r.id) + ", which is not in the data file"); return; }
      problems.push(...h.eqs([[n + " title", r.title, e.title], [n + " place name", r.place, placeName(e)], [n + " id text", r.idText, e.id], [n + " button type", r.type, "button"]]));
      if (r.h < 2.5 * S.rem - 0.5) problems.push(n + " is " + r.h + "px high, 2.5rem is " + 2.5 * S.rem + "px");
    });
    h.verdict("05-csrd-rows", "each row is a button holding the law's title, its place name and its id as in the data file, and is at least 2.5rem high", problems);

    // Too slow a machine would put this reading past the debounce, so it is skipped when more than 400 ms went by.
    const early = S.sinceInput < 400 ? h.eqs([["count line text before the debounce", S.count.text, ""]]) : [];
    const late = await countIs(line(STORY_CSRD.length));
    const S2 = await read();
    h.verdict("05-csrd-count", "the rows are drawn at once while the count line is still empty, then it reads '12 laws match, showing 8', is visible, and row 1 has not moved", [
      ...early, ...(late ? [late] : []),
      ...h.eqs([["count line text", S2.count.text, line(STORY_CSRD.length)], ["count line hidden", S2.count.hidden, false], ["count line visible", S2.count.shown, true], ["row 1 top before and after the count text fills", S2.rows[0] && S.rows[0] && S2.rows[0].top, S.rows[0] && S.rows[0].top]]),
    ]);

    const R = await page(readRoles);
    await key(ARROW_DOWN);
    const after = await read();
    h.verdict("05-roles", "#law is not readonly and has autocomplete off; no combobox or listbox role, no combobox attributes, no ARIA on the list or rows; ArrowDown does not move focus", h.eqs([
      ["#law readonly attribute", R.readonlyAttr, false], ["#law readOnly", R.readOnly, false], ["#law autocomplete", R.auto, "off"],
      ["combobox, listbox or option roles", R.bad.join(" "), ""], ["ARIA on the list and its rows", R.rowAria.join(" "), ""], ["combobox attributes on #law", R.boxAria.join(" "), ""],
      ["focus after ArrowDown", after.active, "law"], ["rows after ArrowDown", after.rows.length, 8],
    ]));
  });

  await section("05-enter", async () => {
    await open("ok");
    await focusBox();
    await h.press("Enter");
    const S0 = await read();
    await type("csrd");
    await h.press("Enter");
    await chosenIs(CSRD);
    const S1 = await read();
    h.verdict("05-enter", "Enter in the box with rows chooses row 1: its title in the box, its answer drawn once, the list closed, focus on #law, count line empty", [
      ...choseProblems(S1, CSRD, "after Enter"), ...h.eqs([["no-match hook calls", S1.noMatch.length, 0]]),
    ]);
    await h.sleep(700); // the debounce is under test: an announcement or a reopened list would arrive within this wait
    const S2 = await read();
    h.verdict("05-enter-quiet", "700 ms after the choice the list is still closed and nothing was announced", [
      ...closed(S2, "700 ms later"), ...h.eqs([["law box text", S2.box, byId.get(CSRD).title], ["GEL.chosen", S2.chosen, CSRD]]),
    ]);
    await h.press("Enter");
    const S3 = await read();
    h.verdict("05-closed-enter", "Enter does nothing while the list is closed: a blank box, and the box right after a choice", [
      ...h.eqs([
        ["blank box: answers drawn", S0.answers, 0], ["blank box: GEL.chosen", S0.chosen, null], ["blank box: answer panel shown", S0.panel.shown, false], ["blank box: no-match hook calls", S0.noMatch.length, 0],
        ["after a choice: answers drawn", S3.answers, 1], ["after a choice: no-match hook calls", S3.noMatch.length, 0], ["after a choice: GEL.chosen", S3.chosen, CSRD],
      ]),
      ...closed(S3, "after a choice and another Enter"), ...errs(S3),
    ]);

    // Edit the box after the choice: the list reopens from the new text and the answer stays until another law is chosen.
    const cbam = matching(data.entries, "cbam").map((e) => e.id);
    await type("cbam", true);
    const S4 = await read();
    const cbamLate = await countIs(line(cbam.length));
    const S4b = await read();
    await h.press("Enter");
    await chosenIs(S4.rows.length ? S4.rows[0].id : null);
    const S5 = await read();
    h.verdict("05-reopen", "editing the box after a choice reopens the list from the new text; the answer stays until Enter chooses another law", [
      ...h.eqs([
        ["reopened row ids (sorted)", [...rowIds(S4)].sort().join(" "), [...cbam].sort().join(" ")], ["before the second choice: GEL.chosen", S4.chosen, CSRD],
        ["before the second choice: answer panel data-id", S4.panel.id, CSRD], ["before the second choice: answers drawn", S4.answers, 1],
        ["second choice: GEL.chosen", S5.chosen, S4.rows[0] && S4.rows[0].id], ["second choice: answer panel data-id", S5.panel.id, S4.rows[0] && S4.rows[0].id],
        ["second choice: answers drawn", S5.answers, 2], ["second choice: focus", S5.active, "law"],
      ]),
      ...closed(S5, "after the second choice"), ...errs(S5),
    ]);
    h.verdict("05-cbam", "cbam on the real file: eu-cbam-2023-956 is row 1 and the count line reads the real number of matches", [
      ...(cbamLate ? [cbamLate] : []),
      ...h.eqs([["row 1", S4.rows[0] && S4.rows[0].id, "eu-cbam-2023-956"], ["count line text", S4b.count.text, line(cbam.length)]]),
    ]);
  });

  await section("05-tab", async () => {
    await open("ok");
    await type("csrd");
    const trail = [];
    for (let i = 0; i < 9; i++) {
      await h.press("Tab");
      const S = await read();
      const at = S.rows.findIndex((r) => S.active === "row:" + r.id);
      trail.push(at >= 0 ? "row" + (at + 1) : S.active);
    }
    h.verdict("05-tab", "from the box, Tab visits each of the 8 rows in list order, then the date field", h.eqs([["focus trail", trail.join(" "), "row1 row2 row3 row4 row5 row6 row7 row8 date"]]));
  });

  const viaRow = async (tag, label, pos, press) => {
    await open("ok");
    await type("csrd");
    for (let i = 0; i < pos; i++) await h.press("Tab");
    const id = STORY_CSRD[pos - 1];
    const S0 = await read();
    await press();
    await chosenIs(id);
    const S = await read();
    h.verdict(tag, label, [...h.eqs([["focus before the key", S0.active, "row:" + id]]), ...choseProblems(S, id, "after the key")]);
  };
  await section("05-row-enter", () => viaRow("05-row-enter", "Enter on the focused row 2 chooses it: title in the box, answer drawn, list closed, focus back on #law", 2, () => h.press("Enter")));
  await section("05-row-space", () => viaRow("05-row-space", "Space on the focused row 3 chooses it: title in the box, answer drawn, list closed, focus back on #law", 3, () => key(SPACE)));

  await section("05-row-click", async () => {
    await open("ok");
    await type("csrd");
    const late = await countIs(line(12));
    const pt = await page(() => {
      const b = document.querySelectorAll(".match-row")[2];
      b.scrollIntoView({ block: "center" });
      const r = b.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    for (const [type, extra] of [["mouseMoved", {}], ["mousePressed", { button: "left", clickCount: 1 }], ["mouseReleased", { button: "left", clickCount: 1 }]]) {
      await h.send("Input.dispatchMouseEvent", { type, x: pt.x, y: pt.y, ...extra });
    }
    await chosenIs(STORY_CSRD[2]);
    const S1 = await read();
    await h.sleep(700); // the debounce is under test: nothing may be announced after the click
    const S2 = await read();
    h.verdict("05-row-click", "a mouse click on row 3 after the count line appeared chooses it, closes the list, empties and hides the count line, and nothing is announced 700 ms later", [
      ...(late ? [late] : []), ...choseProblems(S1, STORY_CSRD[2], "after the click"), ...closed(S2, "700 ms after the click"),
    ]);
  });

  await section("05-debounce", async () => {
    await open("ok");
    await page(() => {
      const c = document.getElementById("match-count");
      window.__muts = [];
      new MutationObserver((list) => {
        for (const m of list) {
          const text = m.type === "childList" ? [...m.addedNodes].map((n) => n.textContent).join("") : m.type === "characterData" ? m.target.data : c.textContent;
          window.__muts.push({ t: performance.now(), type: m.type, text });
        }
      }).observe(c, { childList: true, characterData: true, subtree: true, attributes: true });
    });
    await type("csrd");
    const wrote = await countIs(line(12));
    await h.sleep(700); // the debounce is under test: a second write would arrive within this wait
    const R = await page(() => ({ muts: window.__muts, last: window.__f.lastInput }));
    const writes = R.muts.filter((m) => m.type !== "attributes" && m.text !== "");
    const delay = writes.length ? writes[0].t - R.last : null;
    h.verdict("05-debounce", "csrd typed fast writes the count line once, 500 ms after the last key and not before, and nothing follows in the next 700 ms", [
      ...(wrote ? [wrote] : []),
      ...h.eqs([["writes of count text", writes.length, 1]]),
      ...(delay !== null && (delay < 480 || delay > 1500) ? ["first write came " + Math.round(delay) + " ms after the last key, want about 500"] : []),
      ...(writes.length > 1 ? ["texts written: " + h.fmt(writes.map((m) => m.text))] : []),
    ]);
  });

  await section("05-nomatch", async () => {
    const typed = "  zzqqx  ";
    await open("ok");
    await type(typed);
    await h.press("Enter");
    const S1 = await read();
    const late = await countIs(NO_MATCH);
    const S2 = await read();
    h.verdict("05-nomatch-enter", "Enter with no rows chooses nothing and calls GEL.showNoMatch once with the trimmed text and GEL.date", [
      ...(matching(data.entries, typed).length === 0 ? [] : ["fixture is wrong: " + typed.trim() + " matches a real law"]),
      ...h.eqs([
        ["rows", S1.rows.length, 0], ["GEL.chosen", S1.chosen, null], ["law box text", S1.box, typed], ["answers drawn", S1.answers, 0], ["answer panel shown", S1.panel.shown, false],
        ["no-match hook calls", JSON.stringify(S1.noMatch), JSON.stringify([{ text: typed.trim(), date: DATE }])],
      ]),
      ...errs(S1),
    ]);
    h.verdict("05-nomatch-line", "with no rows the count line gets the no-match sentence 500 ms after the last key, and it stays after Enter", [
      ...(late ? [late] : []),
      ...h.eqs([["count line text", S2.count.text, NO_MATCH], ["count line visible", S2.count.shown, true], ["rows", S2.rows.length, 0], ["no-match hook calls", S2.noMatch.length, 1], ["GEL.chosen", S2.chosen, null]]),
    ]);
    await page(() => { delete GEL.showNoMatch; });
    await h.press("Enter");
    const S3 = await read();
    h.verdict("05-nomatch-no-hook", "with no GEL.showNoMatch defined, Enter on zero results throws nothing and chooses nothing", [
      ...h.eqs([["GEL.chosen", S3.chosen, null], ["answers drawn", S3.answers, 0], ["no-match hook calls", S3.noMatch.length, 1], ["count line text", S3.count.text, NO_MATCH]]), ...errs(S3),
    ]);
  });

  await section("05-counts", async () => {
    await open("05-fixtures");
    const cases = [
      ["zzfa", 23, fx.a, "a query with 23 matches shows 8 rows, the first 8 by id, and '23 laws match, showing 8'"],
      ["zzfb", 8, fx.b, "a query with 8 matches shows 8 rows and '8 laws match'"],
      ["zzfc", 1, fx.c, "a query with 1 match shows 1 row and '1 law matches'"],
      ["zzfd", 0, [], "a query with no match shows no row and the sentence 'No law matches. Browse by place below.' as the count line"],
    ];
    for (const [q, n, list, label] of cases) {
      const own = matching(withFixtures.entries, q).length;
      await type(q, true);
      const late = await countIs(line(n));
      const S = await read();
      h.verdict("05-count-" + n, label, [
        ...(own === n ? [] : ["fixture is wrong: my own count of " + q + " is " + own + ", wanted " + n]),
        ...(late ? [late] : []),
        ...h.eqs([["row ids", rowIds(S).join(" "), list.map((e) => e.id).sort().slice(0, 8).join(" ")], ["count line text", S.count.text, line(n)], ["count line hidden", S.count.hidden, false]]),
        ...errs(S),
      ]);
    }

    const blank = [];
    await setBox("");
    blank.push(...closed(await read(), "cleared after the no-match sentence"));
    await type("zzfd", true);
    await setBox("");
    await h.sleep(700); // the debounce is under test: the cleared box must not get a sentence 500 ms later
    blank.push(...closed(await read(), "cleared inside the 500 ms window, read 700 ms later"));
    await type("zzfa", true);
    await countIs(line(23));
    await setBox("   ");
    blank.push(...closed(await read(), "spaces only after a count"));
    await h.sleep(700); // same reason
    blank.push(...closed(await read(), "spaces only, read 700 ms later"));
    h.verdict("05-blank", "a blank box, or one with only spaces, shows neither rows nor a count line, at once and 700 ms later", blank);

    await type("cbam", true);
    const own = matching(withFixtures.entries, "cbam").length;
    const aliasLate = await countIs(line(own));
    const SA = await read();
    h.verdict("05-alias", "a law whose id, title and citation lack cbam but whose aliases hold CBAM is found, and listed first as an exact alias match", [
      ...(aliasLate ? [aliasLate] : []),
      ...h.eqs([
        ["fixture has cbam outside its aliases", [fx.alias.id, fx.alias.title, fx.alias.citation].some((s) => /cbam/i.test(s)), false],
        ["row 1", rowIds(SA)[0], fx.alias.id], ["row 2", rowIds(SA)[1], "eu-cbam-2023-956"], ["count line text", SA.count.text, line(own)],
      ]),
      ...errs(SA),
    ]);

    await type("zzfnull", true);
    const nullLate = await countIs(line(2));
    const SN = await read();
    h.verdict("05-null-fields", "laws with no aliases key, a null citation or null aliases do not throw and are still found by title", [
      ...(nullLate ? [nullLate] : []),
      ...h.eqs([["row ids", rowIds(SN).join(" "), fx.noCitation.id + " " + fx.nullAliases.id], ["count line text", SN.count.text, line(2)]]),
      ...errs(SN),
    ]);

    await type("zzfx", true);
    const SM = await read();
    h.verdict("05-textcontent", "markup in a law title is shown as text in its row: no element inside the title, nothing executed", h.eqs([
      ["row title text", SM.rows[0] && SM.rows[0].title, MARKUP_TITLE], ["elements inside the row title", SM.rows[0] && SM.rows[0].titleKids, 0], ["typeof window.__xss", SM.xss, "undefined"], ["rows", SM.rows.length, 1],
    ]));
  });

  await section("05-accent", async () => {
    const q = "przeciwdzialaniu", id = "pl-unfair-practices-act", e = byId.get(id);
    const total = matching(data.entries, q).length;
    await open("ok");
    const names = () => page(() => performance.getEntriesByType("resource").map((r) => r.name));
    const before = await names();
    await type(q);
    const late = await countIs(line(total));
    const S = await read();
    const row = S.rows.find((r) => r.id === id);
    h.verdict("05-accent", "the ASCII query przeciwdzialaniu finds pl-unfair-practices-act, whose title carries an accented letter, and the row shows the original title", [
      ...(e && /[^\x00-\x7f]/.test(e.title) ? [] : ["fixture is wrong: " + id + " is missing or has an ASCII title"]),
      ...(late ? [late] : []),
      ...h.eqs([["row ids", rowIds(S).includes(id), true], ["row title", row && row.title, e && e.title], ["count line text", S.count.text, line(total)]]),
      ...errs(S),
    ]);
    await h.press("Enter");
    await setBox("");
    await type("csrd");
    await h.sleep(700); // the debounce timer is the last thing that could send something
    const added = (await names()).filter((n) => !before.includes(n));
    h.verdict("05-no-requests", "typing, choosing and clearing add no resource entry, so the page makes 0 requests while the box is used", added.length ? ["new resource entries: " + h.fmt(added)] : []);
  });

  await section("05-eccb", async () => {
    const groups = new Map();
    for (const e of data.entries) groups.set(e.title.toLowerCase(), [...(groups.get(e.title.toLowerCase()) ?? []), e]);
    const same = [...groups.values()].filter((g) => g.length >= 5);
    if (same.length !== 1) { h.check("05-eccb", "the five laws with one title are found in the data file", false, same.length + " titles are shared by 5 or more laws"); return; }
    const five = same[0], typed = five[0].title, total = matching(data.entries, typed).length;
    await open("ok");
    await type(typed);
    const late = await countIs(line(total));
    const S = await read();
    const places = five.map((e) => (S.rows.find((r) => r.id === e.id) || {}).place);
    h.verdict("05-eccb", "the " + five.length + " laws that share one title (case aside) list as separate rows, each showing its own place name from the data file", [
      ...(late ? [late] : []),
      ...five.flatMap((e) => h.eqs([["row for " + e.id, rowIds(S).includes(e.id), true], ["place name of " + e.id, (S.rows.find((r) => r.id === e.id) || {}).place, placeName(e)]])),
      ...(new Set(places).size === five.length ? [] : ["place names not all different: " + h.fmt(places)]),
    ]);
  });

  await section("05-long-title", async () => {
    const lu = byId.get("lu-sfdr-law-2022");
    try {
      for (const [tag, label, width, zoom] of [
        ["05-long-title-320", "the 485 character title of lu-sfdr-law-2022 wraps in full at 320 px wide: nothing clipped, no line clamp, no sideways scroll", 320, false],
        ["05-long-title-200", "the same title wraps in full at 200% text: nothing clipped, no line clamp, no sideways scroll", 1280, true],
      ]) {
        await h.send("Emulation.setDeviceMetricsOverride", { width, height: 800, deviceScaleFactor: 1, mobile: false });
        await open("ok");
        if (zoom) await h.evaluate("document.documentElement.style.fontSize = '200%'");
        const base = await page(measureRow, "none");
        await type(lu.id);
        const F = await page(measureRow, lu.id);
        const S = await read();
        h.verdict(tag, label, F.found ? [
          ...h.eqs([["title text", F.text, lu.title], ["line clamp", F.lineClamp, "none"]]),
          ...(F.lines >= 3 ? [] : ["title took " + F.lines + " lines, expected it to wrap to 3 or more"]),
          ...(F.textBottom > F.titleBottom + 1 ? ["text ends at " + Math.round(F.textBottom) + "px, below its title box at " + Math.round(F.titleBottom) + "px"] : []),
          ...(F.textBottom > F.rowBottom + 1 ? ["text ends at " + Math.round(F.textBottom) + "px, below its row at " + Math.round(F.rowBottom) + "px"] : []),
          ...(F.clipped.length ? ["clipping boxes: " + F.clipped.join(" ")] : []),
          ...(F.scrollW > Math.max(F.innerW, base.scrollW) + 1 ? ["page scrolls sideways: scrollWidth " + F.scrollW + ", window " + F.innerW + ", before typing " + base.scrollW] : []),
        ] : ["no row for " + lu.id + "; rows: " + rowIds(S).join(" ")]);
      }
    } finally {
      await h.send("Emulation.clearDeviceMetricsOverride");
    }
  });
}
