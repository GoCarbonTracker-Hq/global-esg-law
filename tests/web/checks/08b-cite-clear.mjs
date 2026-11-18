// Checks for GEL-34 batch 4 unit D: the citation line and the Copy citation button leave the page with the answer.
// tests/web/check.mjs imports this file after the 12 story 04 criteria. Tags start with "08b".
//
// The expected side never comes from web/*.js: the law, its title, in-force date, source link, the snapshot and the read date
// come from expected.json; the citation line is written out here from the story's format (08, AC1).
//
// What it proves:
//   08b-clear     CSRD on 2025-06-01 fills #slot-citation with the line and the button; an unknown-law address loaded over it
//                 leaves the slot with no children and no text; showing CSRD again draws the same line again.
//   08b-nomatch   the same after a no-match answer (GEL.showNoMatch, called directly as 06-variants.mjs does, the law box
//                 being read-only): the slot is empty, the no-match answer shows, and CSRD again draws the same line again.
// What it does NOT prove: a screen reader announcing the emptied slot; Safari, Firefox; by hand later.
import fs from "node:fs";

const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const q = JSON.stringify;

const READ = `(() => {
  const s = document.getElementById("slot-citation"), l = document.getElementById("citation-line"), b = document.getElementById("citation-copy");
  return {
    children: s.childNodes.length, text: s.textContent, line: l ? l.textContent : null, button: b ? b.textContent : null,
    state: document.getElementById("answer-panel").getAttribute("data-state"),
  };
})()`;

export async function run(h) {
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  const X = E.example;
  const want = `${X.title}; in force on ${CSRD.date}, ${X.kind} version since ${X.in_force}; global-esg-law, corpus read ${E.read_on} (snapshot ${E.snapshot9}); ${X.source_url}`;
  const read = () => h.evaluate(READ);
  const section = async (tag, fn) => {
    try { await fn(); } catch (e) { h.check(tag, "check ran to the end", false, "threw: " + e.message); }
  };
  const showCsrd = () => h.evaluate(`GEL.showAnswer(${q(CSRD.id)}, ${q(CSRD.date)})`);
  // CSRD shown and its line and button read back as a precondition.
  const shown = async (label) => {
    await showCsrd();
    const S = await read();
    return { S, problems: h.eqs([[label + ": the line", S.line, want], [label + ": the button", S.button, "Copy citation"]]) };
  };
  // No answer, no leftover of the last one.
  const empty = (S, label) => h.eqs([[label + ": #slot-citation child nodes", S.children, 0], [label + ": #slot-citation text", S.text, ""]]);
  // The next answer draws the line again, as before.
  const again = async (first, label) => {
    const S = (await showCsrd(), await read());
    return h.eqs([[label + ": the line", S.line, first.line], [label + ": the button", S.button, "Copy citation"]]);
  };

  await section("08b-clear", async () => {
    await h.open("ok");
    const a = await shown("CSRD on " + CSRD.date);
    await h.evaluate(`location.hash = ${q(`#law=xx-not-a-law&date=${CSRD.date}&snapshot=${E.snapshot9}`)}`);
    await h.waitFor(`document.getElementById("load-status").textContent !== ""`, 3000);
    const U = await read();
    h.verdict("08b-clear", "an unknown-law address loaded over a shown CSRD answer empties #slot-citation: no children, no text", [
      ...a.problems, ...empty(U, "unknown law"),
    ]);
    h.verdict("08b-clear", "CSRD on " + CSRD.date + " shown again after the clearing draws the same line and the button again", await again(a.S, "after the clearing"));
  });

  await section("08b-nomatch", async () => {
    await h.open("ok");
    const a = await shown("CSRD on " + CSRD.date);
    await h.evaluate(`GEL.showNoMatch("Sarbanes-Oxley", ${q(CSRD.date)})`);
    const N = await read();
    h.verdict("08b-nomatch", "a no-match answer shown over a CSRD answer empties #slot-citation: no children, no text", [
      ...a.problems, ...h.eqs([["panel state", N.state, "no-match"]]), ...empty(N, "no-match"),
    ]);
    h.verdict("08b-nomatch", "CSRD on " + CSRD.date + " shown again after the no-match answer draws the same line and the button again", await again(a.S, "after the no-match answer"));
  });
}
