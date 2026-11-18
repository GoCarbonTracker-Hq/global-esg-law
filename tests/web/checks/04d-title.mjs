// Checks for GEL-34 step 04d (the answer title had too short a line at 320 px, so long words in it split mid-word).
// tests/web/check.mjs imports this file after the 12 story 04 criteria. Tags start with "04d".
//
// What it proves, in a 320 CSS px window at 100% text with CSRD on 2025-06-01 showing:
//   04d-width    the title's content width is at least 240 px (the panel's side padding is 1rem, not 1.5rem);
//   04d-words    no word of the CSRD title is split across lines (a Range over each word has one client rect);
//   04d-witness  a one-word title that is wider than the old 224 px line and no wider than 240 px is not split. The CSRD
//                title has no word that long, so 04d-words alone passes on the old padding; this one fails there. The word
//                is built in the page from "n" until it is just wider than 224 px, so it does not depend on one font;
//   04d-wide     at 768 px and at 1280 px the panel's side padding is still 24px.
// The numbers come from the story text: 320 px window, 24 px body padding each side, 24 px (old) or 16 px (new) panel padding,
// so the old line was 224 px and the new one is 240 px. They are written here, never read from the page's stylesheet.
// What it does NOT prove: other widths below 768 px, 200% text (words wider than the line still split there), any browser but Chrome.

import fs from "node:fs";

const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const WINDOW = 320, OLD_LINE = 224, NEW_LINE = 240;

async function showCsrd(h, width) {
  await h.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await h.open("ok");
  await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); if (!GEL.setDate(${JSON.stringify(CSRD.date)})) throw new Error("date refused")`);
  await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain"`);
}

// Page side: the title's content width, how many client rects each word of its text has, and the panel's side padding.
const MEASURE = `(() => {
  const panel = document.getElementById("answer-panel");
  const t = panel.querySelector('[data-field="title"]');
  const node = t.firstChild, text = t.textContent, words = [];
  const re = /\\S+/g;
  for (let m; (m = re.exec(text)); ) {
    const r = document.createRange();
    r.setStart(node, m.index); r.setEnd(node, m.index + m[0].length);
    words.push([m[0], r.getClientRects().length]);
  }
  const s = getComputedStyle(panel);
  return {
    innerW: window.innerWidth, root: getComputedStyle(document.documentElement).fontSize, shown: !panel.hidden,
    text, width: t.getBoundingClientRect().width, words, padL: s.paddingLeft, padR: s.paddingRight,
  };
})()`;

// Page side: put a one-word title in the same element, a run of "n" just wider than the old line; report its natural width and rects.
const WITNESS = `((oldLine) => {
  const t = document.querySelector('#answer-panel [data-field="title"]');
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;white-space:nowrap;visibility:hidden";
  t.replaceChildren(probe);
  let word = "n";
  for (; word.length < 200; word += "n") { probe.textContent = word; if (probe.getBoundingClientRect().width > oldLine) break; }
  probe.textContent = word;
  const natural = probe.getBoundingClientRect().width;
  t.replaceChildren(word);
  const r = document.createRange();
  r.selectNodeContents(t.firstChild);
  return { natural, rects: r.getClientRects().length, line: t.getBoundingClientRect().width };
})(${OLD_LINE})`;

export async function run(h) {
  const entry = JSON.parse(fs.readFileSync(h.data, "utf8")).entries.find((e) => e.id === CSRD.id);

  await showCsrd(h, WINDOW);
  const m = await h.evaluate(MEASURE);
  const setup = [
    ...(m.innerW === WINDOW ? [] : ["window is " + m.innerW + "px wide, want " + WINDOW]),
    ...(m.root === "16px" ? [] : ["root font is " + m.root + ", want 16px"]),
    ...(m.shown && m.text === entry.title ? [] : ["panel shown " + m.shown + ", title " + h.fmt(m.text) + ", want " + h.fmt(entry.title)]),
  ];
  h.verdict("04d-width", "320px window, text 100%, CSRD answer: the title's content width is at least " + NEW_LINE + "px", [
    ...setup,
    ...(m.width >= NEW_LINE ? [] : ["title content width is " + m.width + "px, want at least " + NEW_LINE]),
  ]);
  const split = m.words.filter(([, rects]) => rects !== 1).map(([w, rects]) => w + " (" + rects + " rects)");
  h.verdict("04d-words", "320px window, text 100%, CSRD answer: no word of the title is split across lines", [
    ...setup,
    ...(m.words.length === entry.title.split(/\s+/).length ? [] : ["measured " + m.words.length + " words, the data file's title has " + entry.title.split(/\s+/).length]),
    ...(split.length ? ["split words: " + split.join("; ")] : []),
  ]);

  const w = await h.evaluate(WITNESS);
  h.verdict("04d-witness", "320px window, text 100%: a one-word title wider than " + OLD_LINE + "px and no wider than " + NEW_LINE + "px is not split", [
    ...(w.natural > OLD_LINE && w.natural <= NEW_LINE ? [] : ["the test word is " + w.natural + "px wide, want over " + OLD_LINE + " and at most " + NEW_LINE + " (this font cannot build one)"]),
    ...(w.rects === 1 ? [] : ["the word " + w.natural + "px wide is split into " + w.rects + " rects on a " + w.line + "px line"]),
  ]);

  for (const width of [768, 1280]) {
    await showCsrd(h, width);
    const p = await h.evaluate(MEASURE);
    h.verdict("04d-wide-" + width, width + "px window: the answer panel's side padding is 24px on both sides", [
      ...(p.innerW === width ? [] : ["window is " + p.innerW + "px wide, want " + width]),
      ...(p.shown ? [] : ["the answer panel is not shown"]),
      ...(p.padL === "24px" && p.padR === "24px" ? [] : ["padding is " + p.padL + " left and " + p.padR + " right, want 24px both"]),
    ]);
  }
}
