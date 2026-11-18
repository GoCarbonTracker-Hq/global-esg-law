// Checks for GEL-34 step 04c (the lookup header scrolled the page sideways at 320 px). tests/web/check.mjs imports this file
// after the 12 story 04 criteria. Tags 04c-<state>-<text size>.
//
// What it proves: in a 320 CSS px window, at 100% text and at 200% text (root font 32 px), the page does not scroll sideways
// in three states: the first screen, one in-force answer (CSRD on 2025-06-01), and the rail opened on kz-advertising-law
// ("Show all 150 versions"). The limit 320 is written here, never read from the page. Each verdict also checks that the window
// really is 320 px, the root font really is 16 or 32 px, and the state really is the one it names, so it cannot pass on an
// empty page. When it fails it lists the elements that reach past 320 px or whose own content does.
// What it does NOT prove: widths other than 320, the place table inside its own scroll container (story 09 owns that), any
// browser but this Chrome.

const LIMIT = 320;
const CSRD = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
const KZ = { id: "kz-advertising-law", date: "2026-11-17", versions: 150 };

// One page-side call: widths of the page, and the elements that reach past the limit.
const MEASURE = `((limit) => {
  const d = document.documentElement;
  const name = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.classList.length ? "." + [...el.classList].join(".") : "");
  const reach = [], content = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (r.right > limit + 0.5) reach.push(name(el) + " " + Math.round(r.width) + "px wide, right edge " + Math.round(r.right));
    else if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === "visible" && r.left + el.scrollWidth > limit + 0.5)
      content.push(name(el) + " box " + Math.round(r.width) + "px, content " + el.scrollWidth + "px");
  }
  return {
    innerW: window.innerWidth, clientW: d.clientWidth, scrollW: d.scrollWidth, bodyScrollW: document.body.scrollWidth,
    root: getComputedStyle(d).fontSize,
    state: document.getElementById("answer-panel").getAttribute("data-state"),
    shown: !document.getElementById("answer-panel").hidden,
    id: document.getElementById("law").value,
    railRows: document.querySelectorAll("#rail-all > li").length,
    railOpen: !!document.querySelector("#rail details")?.open,
    reachN: reach.length, reach: reach.slice(0, 12), contentN: content.length, content: content.slice(0, 8),
  };
})(${LIMIT})`;

const STATES = [
  {
    key: "first", label: "first screen",
    setup: async () => {},
    problems: (m) => (m.shown ? ["the answer panel is shown, want the first screen"] : []),
  },
  {
    key: "answer", label: "one in-force answer (" + CSRD.id + " on " + CSRD.date + ")",
    setup: async (h) => {
      await h.evaluate(`GEL.choose(${JSON.stringify(CSRD.id)}); if (!GEL.setDate(${JSON.stringify(CSRD.date)})) throw new Error("date refused")`);
      await h.waitFor(`document.getElementById("answer-panel").getAttribute("data-state") === "plain"`);
    },
    problems: (m) => (m.state === "plain" && m.shown ? [] : ["answer state is " + m.state + ", shown " + m.shown + ", want plain and shown"]),
  },
  {
    key: "rail", label: "rail opened on " + KZ.id + " (Show all " + KZ.versions + " versions)",
    setup: async (h) => {
      await h.evaluate(`GEL.choose(${JSON.stringify(KZ.id)}); if (!GEL.setDate(${JSON.stringify(KZ.date)})) throw new Error("date refused")`);
      await h.waitFor(`document.querySelector("#rail details") && document.querySelectorAll("#rail-all > li").length > 0`);
      await h.evaluate(`document.querySelector("#rail details").open = true`);
    },
    problems: (m) => [
      ...(m.railRows === KZ.versions ? [] : ["#rail-all holds " + m.railRows + " rows, want " + KZ.versions]),
      ...(m.railOpen ? [] : ["the rail details is closed"]),
    ],
  },
];

export async function run(h) {
  for (const s of STATES) {
    for (const [text, root] of [["100%", "16px"], ["200%", "32px"]]) {
      await h.send("Emulation.setDeviceMetricsOverride", { width: LIMIT, height: 900, deviceScaleFactor: 1, mobile: false });
      await h.open("ok");
      if (text === "200%") await h.evaluate(`document.documentElement.style.fontSize = "200%"`);
      await s.setup(h);
      const m = await h.evaluate(MEASURE);
      const problems = [
        ...(m.innerW === LIMIT ? [] : ["window is " + m.innerW + "px wide, want " + LIMIT]),
        ...(m.root === root ? [] : ["root font is " + m.root + ", want " + root]),
        ...s.problems(m),
      ];
      if (m.scrollW > LIMIT) {
        problems.push("document scrollWidth " + m.scrollW + " > " + LIMIT + " (clientWidth " + m.clientW + ", body scrollWidth " + m.bodyScrollW + ")");
        if (m.reachN) problems.push(m.reachN + " elements reach past " + LIMIT + "px: " + m.reach.join("; "));
        if (m.contentN) problems.push(m.contentN + " elements whose content reaches past " + LIMIT + "px: " + m.content.join("; "));
      }
      h.verdict("04c-" + s.key + "-" + text.replace("%", ""), "320px window, text " + text + ", " + s.label + ": the page needs no sideways scroll (scrollWidth at most " + LIMIT + ")", problems);
    }
  }
}
