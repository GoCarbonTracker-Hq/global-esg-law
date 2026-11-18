// Checks for STORY-GEL-34-10 (reopen a copied address and find the command line). tests/web/check.mjs imports this file
// after the 12 story 04 criteria. Tags 10-ac1 .. 10-ac12 follow the story's acceptance criteria in order; 10-ac4b, 10-ac4c,
// 10-ac5b, 10-ac8b and 10-ac8c are the cases the story leaves to the page and this file pins.
//
// The expected side never comes from web/*.js: ids, titles, commits and the snapshot come from expected.json and the data
// file (h.data); the sentences, the addresses and the footer URLs are written out here from the story.
//
// What it proves:
//   ac1  four spellings of the current snapshot reopen the CSRD answer with no note.
//   ac2  af3d6b47f, c76381e2f and deadbeef0 give the exact "is not kept" sentence and the current answer, with no wording that
//        says the answers differ or agree.
//   ac3  no snapshot gives no note; latest, 55c8c2 and zzzzzzzzz give the "could not be read" sentence, never echoed.
//   ac4  five dates (2025-6-1, 2025-02-30, 10000-01-01, 2025-13-45, empty) from an address and typed: law filled, no answer,
//        the date message.
//   ac5  an unknown law, two notes at once (snapshot first), and a law and a snapshot written as markup: no element, no script.
//   ac6  build and parse over all ids of the data file; a real write for the longest id.
//   ac7  an opened address is not rewritten and moves no focus; three date changes rewrite it, clear the note, add no history.
//   ac8  a new hash in the same tab changes the note and the answer with no reload.
//   ac9  the resource list of every address page equals the list of the page with no address.
//   ac10 the footer: three links in order, 24 px targets, same tab, focus ring, last in the tab order.
//   ac11 is the pytest (tests/test_web_footer.py) and a curl -sI by hand; ac12's Lighthouse is by hand; the colour is read here.
// What it does NOT prove:
//   - Lighthouse (no failed audit on both note states) and VoiceOver: not run, by hand later.
//   - That a footer URL answers 200 today: tests/test_web_footer.py reads files, a curl -sI by hand reads the network.
//   - 1404 real replaceState calls: Chrome throttles replaceState (about 200 calls in 10 s), so every id goes through the
//     page's address builder and parser and the real write is read back for three ids.
import fs from "node:fs";

const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const SNAP = "55c8c2a9c"; // story: current snapshot on origin/history, also compared with expected.json
const HINT = "Enter a date in the form 2025-06-01.";
const REPO = "https://github.com/GoCarbonTracker-Hq/global-esg-law/blob/main/";
const FOOTER = [REPO + "README.md#quick-start", REPO + "README.md#use-it-from-an-ai-assistant", REPO + "MCP.md"];
const FULL = "55c8c2a9c1d8fdbb40fd2d5334ac397b743d76e7"; // story: the 40 characters
const RING = "rgb(31, 111, 74)"; // --link #1F6F4A
const TEXT = "rgb(20, 22, 26)"; // --text #14161A
const READY = `!!(window.GEL && GEL.data && !document.getElementById("example").disabled && !document.getElementById("date").disabled)`;
const FORBIDDEN = /\b(same|differ\w*|different|agree\w*|identical)\b/i;

// Everything a check reads, in one call.
const READ = `(() => {
  const p = __chk.panel(), note = document.getElementById("load-status"), a = document.activeElement;
  const strip = (u) => u.replace(location.origin, "").split("#")[0];
  return {
    shown: p.shown, state: p.state, id: p.id, date: p.date, commit: p.commit, since: p.since, snapshot: p.snapshot, read: p.read,
    title: p.title, law: p.law, field: p.dateValue, echo: p.echo, text: p.text, hint: __chk.hint(),
    note: note.textContent, noteKids: note.children.length, hash: location.hash, history: history.length,
    active: a === document.body ? "body" : a.id || a.tagName,
    elements: document.getElementsByTagName("*").length,
    net: [strip(performance.getEntriesByType("navigation")[0].name), ...performance.getEntriesByType("resource").map((r) => strip(r.name))].sort(),
  };
})()`;

export async function run(h) {
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  const data = JSON.parse(fs.readFileSync(h.data, "utf8"));
  const csrdCommit = (date) => E.csrd.find((r) => r.date === date)?.commit;
  const CUR = E.snapshot9;
  const tail = `The answer below is from snapshot ${CUR}, read on ${E.read_on}. The page cannot say whether it matches the citation this address came from.`;
  const notKept = (id) => `Snapshot ${id} is not kept. ${tail}`;
  const unreadable = `The snapshot in this address could not be read. ${tail}`;
  // With no answer showing (unknown law or refused date) the sentence cannot say "below": the page still names its own snapshot.
  const held = (first) => `${first} This page holds snapshot ${CUR}, read on ${E.read_on}. The page cannot say whether it matches the citation this address came from.`;
  const unreadableHeld = held("The snapshot in this address could not be read.");
  const unknownLaw = `This address names a law that is not in snapshot ${CUR}. Type its name in the law box.`;
  const addr = (law, date, snap) => `#law=${law}${date === null ? "" : "&date=" + date}${snap === null ? "" : "&snapshot=" + snap}`;
  const section = async (tag, fn) => {
    try { await fn(); } catch (e) { h.check(tag, "check ran to the end", false, "threw: " + e.message); }
  };

  await h.open("ok");
  const ORIGIN = await h.evaluate("location.origin");
  const seen = []; // {hash, S} for every page loaded, for the network comparison
  // A fresh page load at the address: a hop through about:blank, because a change of hash alone fires no load event.
  const load = async (hash) => {
    await h.navigate("about:blank");
    await h.navigate(ORIGIN + "/" + hash);
    await h.waitFor(READY, 10000);
    const S = await h.evaluate(READ);
    seen.push({ hash, S });
    return S;
  };
  const read = () => h.evaluate(READ);
  const csrdAnswer = (S, date, label) => [
    ...h.eqs([
      [label + " answer shown", S.shown, true], [label + " state", S.state, "plain"], [label + " id", S.id, CSRD.id],
      [label + " data-date", S.date, date], [label + " law box", S.law, E.example.title], [label + " date field", S.field, date],
      [label + " read line", S.read, `Corpus read ${E.read_on}`], [label + " snapshot line", S.snapshot, E.snapshot_line],
    ]),
    ...(h.sameCommit(S.commit, csrdCommit(date)) ? [] : [`${label} commit ${h.fmt(S.commit)}, want ${csrdCommit(date)}`]),
  ];
  const noMessage = (S, label) => (S.hint.shown ? [`${label}: the date message is showing`] : []);

  await section("10-ac1", async () => {
    h.verdict("10-ac1", "the story's snapshot, the one in expected.json and the 40-character commit agree", h.eqs([
      ["story snapshot", SNAP, CUR], ["history_commit start", E.history_commit.slice(0, 9), SNAP], ["history_commit", E.history_commit, FULL],
    ]));
    const base = await load("");
    h.verdict("10-ac1", "no address: no answer, no note, the date message not showing", h.eqs([
      ["answer shown", base.shown, false], ["note", base.note, ""], ["hash", base.hash, ""],
    ]).concat(noMessage(base, "no address")));
    for (const snap of [SNAP, SNAP.slice(0, 7), SNAP.toUpperCase(), FULL]) {
      const hash = addr(CSRD.id, CSRD.date, snap);
      const S = await load(hash);
      h.verdict("10-ac1", `${hash} reopens the CSRD answer in force since ${E.example.in_force}, names ${SNAP} in the read line, shows no note`, [
        ...csrdAnswer(S, CSRD.date, "address"), ...h.eqs([["note", S.note, ""], ["since", S.since, E.example.since]]), ...noMessage(S, "address"),
      ]);
    }
  });

  await section("10-ac2", async () => {
    for (const snap of ["af3d6b47f", "c76381e2f", "deadbeef0"]) {
      const S = await load(addr(CSRD.id, CSRD.date, snap));
      h.verdict("10-ac2", `snapshot=${snap}: the exact not-kept sentence, the current CSRD answer with its read date, no wording of agreement or difference`, [
        ...csrdAnswer(S, CSRD.date, snap), ...h.eqs([["note", S.note, notKept(snap)], ["note child elements", S.noteKids, 0]]),
        ...(FORBIDDEN.test(S.note) ? [`the note says ${h.fmt(S.note.match(FORBIDDEN)[0])}`] : []),
        ...(FORBIDDEN.test(S.text ?? "") ? [`the answer says ${h.fmt(S.text.match(FORBIDDEN)[0])}`] : []),
      ]);
    }
  });

  await section("10-ac3", async () => {
    const none = await load(addr(CSRD.id, CSRD.date, null));
    h.verdict("10-ac3", "no snapshot: the answer shows with no note", [...csrdAnswer(none, CSRD.date, "no snapshot"), ...h.eqs([["note", none.note, ""]])]);
    for (const snap of ["latest", "55c8c2", "zzzzzzzzz"]) {
      const S = await load(addr(CSRD.id, CSRD.date, snap));
      const body = await h.evaluate("document.body.innerText + document.body.innerHTML");
      h.verdict("10-ac3", `snapshot=${snap}: the could-not-be-read sentence, the answer shown, the value not echoed`, [
        ...csrdAnswer(S, CSRD.date, snap), ...h.eqs([["note", S.note, unreadable]]),
        ...(snap === "55c8c2" || !body.includes(snap) ? [] : [`the page text holds ${h.fmt(snap)}`]),
      ]);
    }
  });

  await section("10-ac4", async () => {
    const dates = ["2025-6-1", "2025-02-30", "10000-01-01", "2025-13-45", ""];
    const refused = (S, label) => [
      ...h.eqs([
        [label + " law box", S.law, E.example.title], [label + " answer shown", S.shown, false],
        [label + " message shown", S.hint.shown, true], [label + " message", S.hint.text, HINT], [label + " aria-invalid", S.hint.invalid, "true"],
      ]),
    ];
    for (const d of dates) {
      const S = await load(addr(CSRD.id, d, SNAP));
      h.verdict("10-ac4", `address date=${h.fmt(d)}: law filled, date field empty, no answer, the date message at once, no hash rewrite`, [
        ...refused(S, "address"), ...h.eqs([["date field", S.field, ""], ["echo", S.echo, ""], ["note", S.note, ""], ["hash", S.hash, addr(CSRD.id, d, SNAP)]]),
      ]);
    }
    for (const d of dates) {
      await load("");
      await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)})`);
      await h.evaluate(`__chk.setField(${JSON.stringify(d)})`); // what typing does: set the value, fire input and change
      await h.evaluate(`GEL.setDate(${JSON.stringify(d)})`); // and the text itself, for the values the field refuses to hold
      await h.evaluate("__chk.blur()");
      const S = await read();
      h.verdict("10-ac4", `typed date ${h.fmt(d)}: law filled, no answer, the date message`, refused(S, "typed"));
    }
  });

  await section("10-ac4b", async () => {
    await load(addr(CSRD.id, "2025-02-30", SNAP));
    await h.evaluate(`__chk.setField(${JSON.stringify(CSRD.date)})`);
    const S = await read();
    h.verdict("10-ac4b", "a valid date typed after a refused address date draws the answer, clears the message and writes the address", [
      ...csrdAnswer(S, CSRD.date, "typed after address"), ...noMessage(S, "typed after address"),
      ...h.eqs([["aria-invalid", S.hint.invalid, "false"], ["hash", S.hash, addr(CSRD.id, CSRD.date, CUR)]]),
    ]);
  });

  await section("10-ac4c", async () => {
    await load(addr(CSRD.id, "2025-02-30", SNAP));
    await h.evaluate(`(() => { const l = document.getElementById("law"); l.value = "CSRD"; l.dispatchEvent(new Event("input", { bubbles: true })); document.querySelector(".match-row").click(); })()`);
    const picked = await read();
    await h.evaluate(`(() => { const l = document.getElementById("law"); l.focus(); l.value = "zzzzqqqq"; l.dispatchEvent(new Event("input", { bubbles: true })); })()`);
    await h.press("Enter");
    const empty = await read();
    h.verdict("10-ac4c", "while the date is refused, choosing a law or pressing Enter on no match draws no answer and the message stays", [
      ...h.eqs([["after a chosen row: answer shown", picked.shown, false], ["after a chosen row: message", picked.hint.shown, true],
        ["after Enter: answer shown", empty.shown, false], ["after Enter: message", empty.hint.shown, true],
        ["after a chosen row: location.hash", picked.hash, ""], ["after Enter: location.hash", empty.hash, ""]]),
    ]);
  });

  await section("10-ac5", async () => {
    const S = await load(addr("xx-not-a-law", CSRD.date, SNAP));
    h.verdict("10-ac5", "law=xx-not-a-law: the unknown-law sentence, no answer, the law box empty, the date field filled", h.eqs([
      ["note", S.note, unknownLaw], ["answer shown", S.shown, false], ["law box", S.law, ""], ["date field", S.field, CSRD.date], ["message", S.hint.shown, false],
    ]));
    const xss = "#law=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&date=2025-06-01&snapshot=%3Cb%3E";
    const plain = await load("");
    // the stub goes in before the page's own scripts run, so an alert from the load itself is seen
    const stub = await h.send("Page.addScriptToEvaluateOnNewDocument", { source: "window.alert = () => { window.__alerted = true; };" });
    const X = await load(xss);
    const dirty = await h.evaluate(`({ imgs: document.getElementsByTagName("img").length, bold: document.getElementsByTagName("b").length, alerted: !!window.__alerted,
      html: document.body.innerHTML.includes("onerror") || document.body.innerHTML.includes("&lt;img"), text: document.body.innerText.includes("onerror") || document.body.innerText.includes("<b>") })`);
    await h.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: stub.identifier });
    h.verdict("10-ac5", "law and snapshot written as markup: only the two sentences show, no element is created, no script runs, neither value is in the page", [
      ...h.eqs([["note", X.note, `${unreadableHeld} ${unknownLaw}`], ["elements, same page with no address", X.elements, plain.elements],
        ["img elements", dirty.imgs, 0], ["b elements", dirty.bold, 0], ["alert called", dirty.alerted, false], ["markup in the page html", dirty.html, false], ["markup in the page text", dirty.text, false]]),
    ]);
    // the same address pasted into a page that is already open
    await load("");
    await h.evaluate(`window.__alerted = false; window.alert = () => { window.__alerted = true; }; window.__n = document.getElementsByTagName("*").length; location.hash = ${JSON.stringify(xss)}; 0`);
    await h.waitFor(`document.getElementById("load-status").textContent !== ""`, 3000);
    const P = await h.evaluate(`({ note: document.getElementById("load-status").textContent, grew: document.getElementsByTagName("*").length - window.__n, alerted: window.__alerted })`);
    h.verdict("10-ac5", "the markup address pasted into an open page: the same two sentences, the element count unchanged, no script", h.eqs([["note", P.note, `${unreadableHeld} ${unknownLaw}`], ["elements added", P.grew, 0], ["alert called", P.alerted, false]]));
  });

  await section("10-ac5b", async () => {
    const S = await load(addr("xx-not-a-law", CSRD.date, "af3d6b47f"));
    h.verdict("10-ac5b", "an unknown law and a snapshot that is not kept: both sentences in one status text, the snapshot sentence first", h.eqs([["note", S.note, `${held("Snapshot af3d6b47f is not kept.")} ${unknownLaw}`]]));
  });

  await section("10-ac6", async () => {
    const ids = data.entries.map((e) => e.id);
    const longest = ids.reduce((a, b) => (b.length > a.length ? b : a));
    const loop = await h.evaluate(`(() => {
      const re = /^#law=[a-z0-9-]{1,64}&date=\\d{4}-\\d{2}-\\d{2}&snapshot=[0-9a-f]{9}$/;
      let mismatches = 0; const bad = [];
      for (const e of GEL.data.entries) {
        const a = GEL.address.build(e.id, "2025-06-01"), back = GEL.address.parse(a);
        if (!re.test(a) || !back || back.law !== e.id || back.date !== "2025-06-01") { mismatches++; if (bad.length < 5) bad.push(e.id); }
      }
      return { ids: GEL.data.entries.length, mismatches, bad };
    })()`);
    console.log(`  ids=${loop.ids} mismatches=${loop.mismatches}`);
    h.verdict("10-ac6", "build and parse over every entry: ids=1404 mismatches=0, each address matches the story's pattern", [
      ...h.eqs([["ids in the page", loop.ids, 1404], ["ids in the data file", ids.length, 1404], ["distinct ids", new Set(ids).size, 1404], ["mismatches", loop.mismatches, 0]]),
      ...(loop.bad.length ? [`first mismatches ${h.fmt(loop.bad)}`] : []),
    ]);
    const written = [];
    for (const id of [longest, ids[0], ids[ids.length - 1]]) {
      await load("");
      await h.evaluate(`GEL.showAnswer(${JSON.stringify(id)}, ${JSON.stringify(CSRD.date)})`);
      written.push(...h.eqs([[`hash after a write for ${id}`, await h.evaluate("location.hash"), addr(id, CSRD.date, CUR)]]));
    }
    h.verdict("10-ac6", `a real write reads back for the longest id (${longest.length} characters), the first and the last`, [
      ...written, ...(longest.length === 64 ? [] : [`longest id has ${longest.length} characters, the story says 64`]),
      ...(addr(longest, CSRD.date, CUR).length === 104 ? [] : ["the longest address is not 104 characters"]),
    ]);
  });

  await section("10-ac7", async () => {
    const hash = addr(CSRD.id, CSRD.date, "af3d6b47f");
    const S = await load(hash);
    h.verdict("10-ac7", "the af3d6b47f address opened: location.hash is unchanged and no element has focus", h.eqs([["hash", S.hash, hash], ["focus", S.active, "body"]]));
    const problems = [];
    for (const d of ["2025-06-02", "2025-06-03", "2025-06-04"]) {
      await h.evaluate(`__chk.setField(${JSON.stringify(d)})`);
      const T = await read();
      problems.push(...h.eqs([[`${d} hash`, T.hash, addr(CSRD.id, d, CUR)], [`${d} note`, T.note, ""], [`${d} history.length`, T.history, S.history]]));
    }
    h.verdict("10-ac7", "three date changes: the hash carries the current snapshot, the note is gone, history.length is unchanged", problems);
    const keep = addr(CSRD.id, CSRD.date, FULL.toUpperCase());
    const U = await load(keep);
    h.verdict("10-ac7", "an address with the snapshot in capitals is kept as written", h.eqs([["hash", U.hash, keep]]));
  });

  await section("10-ac8", async () => {
    await load("");
    await h.evaluate(`document.getElementById("example").click()`);
    await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain"`);
    const before = await read();
    await h.evaluate(`window.__mark = 1`);
    const navs = await h.evaluate(`performance.getEntriesByType("navigation").length`);
    const pasted = addr(CSRD.id, "2023-01-05", "af3d6b47f");
    await h.evaluate(`location.hash = ${JSON.stringify(pasted)}`);
    await h.waitFor(`document.getElementById("load-status").textContent !== ""`, 3000);
    const S = await read();
    h.verdict("10-ac8", "a new hash in the same tab changes the note and the answer with no reload", [
      ...csrdAnswer(S, "2023-01-05", "pasted"),
      ...h.eqs([["note", S.note, notKept("af3d6b47f")], ["hash", S.hash, pasted], ["page marker", await h.evaluate("window.__mark"), 1],
        ["navigation entries", await h.evaluate(`performance.getEntriesByType("navigation").length`), navs], ["history.length", S.history, before.history],
        ["resource list", JSON.stringify(S.net), JSON.stringify(before.net)]]),
      ...(h.sameCommit(before.commit, csrdCommit(CSRD.date)) && !h.sameCommit(S.commit, before.commit) ? [] : ["the answer did not change, so the check proves nothing"]),
    ]);
    await section("10-ac8c", async () => {
      await h.evaluate(`location.hash = "#browse-by-place"`);
      await h.sleep(150);
      const T = await read();
      h.verdict("10-ac8c", "a hash that is not an address (#browse-by-place) changes neither the note nor the answer", [
        ...csrdAnswer(T, "2023-01-05", "after #browse-by-place"), ...h.eqs([["note", T.note, notKept("af3d6b47f")], ["hash", T.hash, "#browse-by-place"]]),
      ]);
    });
    await section("10-ac8b", async () => {
      await h.evaluate(`location.hash = ${JSON.stringify(addr("xx-not-a-law", CSRD.date, SNAP))}`);
      await h.waitFor(`document.getElementById("load-status").textContent !== ""`, 3000);
      const T = await read();
      h.verdict("10-ac8b", "an unknown law pasted over an answer takes the answer away, empties the law box and says so", h.eqs([
        ["note", T.note, unknownLaw], ["answer shown", T.shown, false], ["law box", T.law, ""], ["date field", T.field, CSRD.date],
      ]));
    });
  });

  await section("10-ac9", async () => {
    const base = seen.find((s) => s.hash === "");
    const bad = seen.filter((s) => JSON.stringify(s.S.net) !== JSON.stringify(base.S.net)).map((s) => `${s.hash || "(none)"}: ${h.fmt(s.S.net)}`);
    console.log(`  resource list with no address: ${base.S.net.join(" ")}`);
    h.verdict("10-ac9", `the resource list of all ${seen.length} address pages equals the list of the page with no address (index, stylesheets, scripts, the data file)`, [
      ...(base.S.net.some((n) => n.endsWith("law-data.json")) ? [] : ["the baseline list has no law-data.json"]),
      ...(base.S.net.length > 5 ? [] : [`the baseline list is short: ${h.fmt(base.S.net)}`]), ...bad,
    ]);
  });

  await section("10-ac10", async () => {
    await load("");
    await h.evaluate(`document.getElementById("example").click()`);
    await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain"`);
    const F = await h.evaluate(`(() => {
      const links = [...document.querySelectorAll("footer a")];
      const tabbable = [...document.querySelectorAll("a[href], button, input, select, textarea, summary, [tabindex]")].filter((e) => !e.disabled && e.tabIndex >= 0 && e.checkVisibility());
      return {
        footers: document.querySelectorAll("footer").length,
        links: links.map((a) => { const r = a.getBoundingClientRect(); return { href: a.getAttribute("href"), w: r.width, h: r.height, target: a.getAttribute("target"), text: a.textContent }; }),
        lastThree: tabbable.slice(-3).map((e) => e.getAttribute("href")), positive: [...document.querySelectorAll("[tabindex]")].filter((e) => e.tabIndex > 0).length,
      };
    })()`);
    h.verdict("10-ac10", "the footer holds the three links in order, each at least 24 by 24 CSS px, same tab, and they are the last three tab stops", [
      ...h.eqs([["footers", F.footers, 1], ["hrefs", JSON.stringify(F.links.map((l) => l.href)), JSON.stringify(FOOTER)], ["last three tab stops", JSON.stringify(F.lastThree), JSON.stringify(FOOTER)], ["tabindex above 0", F.positive, 0]]),
      ...F.links.filter((l) => l.w < 23.99 || l.h < 23.99).map((l) => `${l.href} is ${l.w} by ${l.h}`), ...F.links.filter((l) => l.target !== null).map((l) => `${l.href} has target ${l.target}`),
      ...F.links.filter((l) => !l.text.trim()).map((l) => `${l.href} has no text`),
    ]);
    // a keyboard pass: from the last stop before the footer, three Tab presses reach the links in order, a fourth leaves them
    await h.evaluate(`(() => { const t = [...document.querySelectorAll("a[href], button, input, summary")].filter((e) => !e.disabled && !e.closest("footer") && e.checkVisibility()); t[t.length - 1].focus(); })()`);
    const problems = [];
    for (const [i, want] of FOOTER.entries()) {
      await h.press("Tab");
      const A = await h.evaluate(`(() => { const a = document.activeElement, c = getComputedStyle(a); return { href: a.getAttribute("href"), visible: a.matches(":focus-visible"), style: c.outlineStyle, width: c.outlineWidth, color: c.outlineColor }; })()`);
      problems.push(...h.eqs([[`Tab ${i + 1} href`, A.href, want], [`Tab ${i + 1} :focus-visible`, A.visible, true], [`Tab ${i + 1} outline`, `${A.style} ${A.width} ${A.color}`, `solid 2px ${RING}`]]));
    }
    await h.press("Tab");
    const after = await h.evaluate(`(() => { const a = document.activeElement; return a === document.body ? "body" : a.id || a.tagName; })()`);
    h.verdict("10-ac10", "Tab from the last stop before the footer reaches the three links with a 2 px ring; the next Tab leaves them (the page start or the body)", [
      ...problems, ...(after === "body" || after === "law" ? [] : [`after the third link focus is ${h.fmt(after)}`]),
    ]);
  });

  await section("10-ac12", async () => {
    const S = await load(addr(CSRD.id, CSRD.date, "af3d6b47f"));
    const C = await h.evaluate(`(() => { const n = document.getElementById("load-status"), c = getComputedStyle(n); return { color: c.color, page: getComputedStyle(document.body).backgroundColor, live: n.getAttribute("aria-live"), role: n.getAttribute("role") }; })()`);
    h.verdict("10-ac12", "the note is plain text in the page's polite status region, #14161A on white", [
      ...h.eqs([["note kept", S.note, notKept("af3d6b47f")], ["child elements", S.noteKids, 0], ["colour", C.color, TEXT], ["page", C.page, "rgb(255, 255, 255)"], ["role", C.role, "status"], ["aria-live", C.live, "polite"]]),
    ]);
    console.log("NOT RUN 10-ac12 lighthouse (both note states) and VoiceOver: not run, by hand later");
  });
}
