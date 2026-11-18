// Checks for GEL-34 batch 4 unit B: what the page shows when an address opens without an answer. tests/web/check.mjs imports
// this file after the 12 story 04 criteria. Tags start with "10b".
//
// The expected side never comes from web/*.js: ids, the snapshot and the read date come from expected.json; the sentences
// and the addresses are written out here from the brief.
//
// What it proves:
//   10b-rail      an unknown-law address, and a refused-date address, loaded over a shown CSRD answer leave the rail with no
//                 children, #answer-sentence empty, the panel hidden and without data-id, data-state, data-date and data-commit;
//                 the next answer then draws the rail afresh.
//   10b-address   after a refused-date address, choosing a law draws no answer and leaves no hash (path and query kept, no new
//                 history entry).
//   10b-note      with no answer showing (unknown law, refused date) the snapshot sentence reads "This page holds snapshot ...";
//                 with an answer showing (plain or interim) it still reads "The answer below is from snapshot ...".
// What it does NOT prove: Safari, Firefox or a screen reader announcing the emptied status text; by hand later.
import fs from "node:fs";

const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const SNAP = "55c8c2a9c";
const HINT = "Enter a date in the form 2025-06-01.";
const READY = `!!(window.GEL && GEL.data && !document.getElementById("example").disabled && !document.getElementById("date").disabled)`;

const READ = `(() => {
  const p = document.getElementById("answer-panel"), n = document.getElementById("load-status");
  return {
    rail: document.getElementById("rail").childNodes.length, sentence: document.getElementById("answer-sentence").textContent,
    hidden: p.hidden, shown: __chk.panel().shown, id: p.getAttribute("data-id"), state: p.getAttribute("data-state"),
    date: p.getAttribute("data-date"), commit: p.getAttribute("data-commit"),
    hash: location.hash, search: location.search, href: location.href, history: history.length, note: n.textContent,
    hint: __chk.hint(), law: document.getElementById("law").value, field: document.getElementById("date").value,
  };
})()`;

export async function run(h) {
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  const CUR = E.snapshot9;
  const addr = (law, date, snap) => `#law=${law}&date=${date}&snapshot=${snap}`;
  const held = `This page holds snapshot ${CUR}, read on ${E.read_on}.`;
  const below = `The answer below is from snapshot ${CUR}, read on ${E.read_on}.`;
  const unknownLaw = `This address names a law that is not in snapshot ${CUR}. Type its name in the law box.`;
  const section = async (tag, fn) => {
    try { await fn(); } catch (e) { h.check(tag, "check ran to the end", false, "threw: " + e.message); }
  };
  await h.open("ok");
  const ORIGIN = await h.evaluate("location.origin");
  const read = () => h.evaluate(READ);
  // A fresh page with the CSRD answer and its rail showing (the example button), read back as a precondition.
  const answered = async () => {
    await h.open("ok");
    await h.evaluate(`document.getElementById("example").click()`);
    await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain"`);
    const S = await read();
    return { S, problems: [
      ...(S.rail > 0 ? [] : ["precondition: the rail is empty after the CSRD answer"]), ...(S.sentence !== "" ? [] : ["precondition: #answer-sentence is empty"]),
      ...h.eqs([["precondition: answer shown", S.shown, true], ["precondition: data-id", S.id, CSRD.id]]),
    ] };
  };
  // No answer, no leftover of the last one.
  const cleared = (S, label) => h.eqs([
    [label + ": rail child nodes", S.rail, 0], [label + ": #answer-sentence", S.sentence, ""], [label + ": panel hidden", S.hidden, true],
    [label + ": data-id", S.id, null], [label + ": data-state", S.state, null], [label + ": data-date", S.date, null], [label + ": data-commit", S.commit, null],
  ]);
  const load = async (url) => { // a fresh load, through about:blank because a change of hash alone fires no load event
    await h.navigate("about:blank");
    await h.navigate(url);
    await h.waitFor(READY, 10000);
  };

  await section("10b-rail", async () => {
    const a = await answered();
    await h.evaluate(`location.hash = ${JSON.stringify(addr("xx-not-a-law", CSRD.date, SNAP))}`);
    await h.waitFor(`document.getElementById("load-status").textContent !== ""`, 3000);
    const U = await read();
    h.verdict("10b-rail", "an unknown-law address loaded over a shown CSRD answer empties the rail and the hidden sentence and hides the panel with no data attributes", [
      ...a.problems, ...cleared(U, "unknown law"),
    ]);
    await h.evaluate(`document.getElementById("example").click()`);
    await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain"`);
    const R = await read();
    h.verdict("10b-rail", "the next answer after the clearing draws the rail again", [
      ...(R.rail > 0 ? [] : ["the rail is empty after a new answer"]), ...h.eqs([["answer shown", R.shown, true], ["data-id", R.id, CSRD.id]]),
    ]);
    // a fresh answer, then an address whose date is refused (the note stays empty, so the page is watched through GEL.date)
    const b = await answered();
    await h.evaluate(`location.hash = ${JSON.stringify(addr(CSRD.id, "2025-02-30", SNAP))}`);
    await h.waitFor(`GEL.date === null`, 3000);
    const D = await read();
    h.verdict("10b-rail", "a refused-date address loaded over a shown CSRD answer empties the rail and the hidden sentence and hides the panel with no data attributes", [
      ...b.problems, ...cleared(D, "refused date"), ...h.eqs([["law box", D.law, E.example.title], ["message shown", D.hint.shown, true]]),
    ]);
  });

  await section("10b-address", async () => {
    await load(ORIGIN + "/?probe=1" + addr(CSRD.id, "2025-02-30", SNAP));
    const before = await read();
    await h.evaluate(`(() => { const l = document.getElementById("law"); l.value = "CSRD"; l.dispatchEvent(new Event("input", { bubbles: true })); document.querySelector(".match-row").click(); })()`);
    const S = await read();
    h.verdict("10b-address", "while an address's date is refused, choosing a law removes the hash (path and query kept, no new history entry) and draws no answer", [
      ...h.eqs([
        ["precondition: the address is in the bar", before.hash, addr(CSRD.id, "2025-02-30", SNAP)],
        ["location.hash", S.hash, ""], ["location.search", S.search, "?probe=1"], ["location.href", S.href, ORIGIN + "/?probe=1"],
        ["history.length", S.history, before.history], ["answer shown", S.shown, false], ["law box", S.law, E.example.title],
        ["message shown", S.hint.shown, true], ["message", S.hint.text, HINT],
      ]),
      ...cleared(S, "after the choice"),
    ]);
  });

  await section("10b-note", async () => {
    const note = async (hash) => {
      await load(ORIGIN + "/" + hash);
      return read();
    };
    const holds = (S, label) => [
      ...(S.note.includes(held) ? [] : [`${label}: the note lacks ${h.fmt(held)}: ${h.fmt(S.note)}`]),
      ...(S.note.includes("The answer below") ? [`${label}: the note says "The answer below" with no answer showing: ${h.fmt(S.note)}`] : []),
      ...h.eqs([[label + ": answer shown", S.shown, false]]),
    ];
    const says = (S, label) => [
      ...(S.note.includes(below) ? [] : [`${label}: the note lacks ${h.fmt(below)}: ${h.fmt(S.note)}`]),
      ...(S.note.includes("This page holds") ? [`${label}: the note says "This page holds" with an answer showing: ${h.fmt(S.note)}`] : []),
      ...h.eqs([[label + ": answer shown", S.shown, true]]),
    ];
    const unreadable = await note(addr("xx-not-a-law", CSRD.date, "latest"));
    h.verdict("10b-note", "an unknown law with an unreadable snapshot: the note holds \"This page holds snapshot\" and not \"The answer below\", and still names the law", [
      ...holds(unreadable, "unknown law, unreadable snapshot"), ...(unreadable.note.includes(unknownLaw) ? [] : ["the unknown-law sentence is missing"]),
      ...(unreadable.note.startsWith("The snapshot in this address could not be read. ") ? [] : ["the first sentence changed"]),
    ]);
    const notKept = await note(addr("xx-not-a-law", CSRD.date, "af3d6b47f"));
    h.verdict("10b-note", "an unknown law with a snapshot that is not kept: \"This page holds snapshot\" after the not-kept sentence", [
      ...holds(notKept, "unknown law, snapshot not kept"), ...(notKept.note.startsWith("Snapshot af3d6b47f is not kept. ") ? [] : ["the first sentence changed"]),
    ]);
    const refused = await note(addr(CSRD.id, "2025-02-30", "latest"));
    h.verdict("10b-note", "a known law with a refused date and an unreadable snapshot: \"This page holds snapshot\", no answer", holds(refused, "refused date, unreadable snapshot"));
    const plain = await note(addr(CSRD.id, CSRD.date, "af3d6b47f"));
    h.verdict("10b-note", "a known law, a good date and a snapshot that is not kept: the note still holds \"The answer below is from snapshot\"", [
      ...says(plain, "plain answer"), ...h.eqs([["state", plain.state, "plain"]]),
    ]);
    const early = await note(addr(CSRD.id, "1900-01-01", "latest"));
    h.verdict("10b-note", "a known law and a good date that has an interim answer (before the first version): the panel shows, so the note still says \"The answer below\"", [
      ...says(early, "interim answer"), ...h.eqs([["state", early.state, "interim"]]),
    ]);
  });
}
