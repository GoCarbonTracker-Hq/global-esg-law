// The seams the later stories build on: the full GEL.onAnswer detail, GEL.coveringInterval, and addVariant.
import fs from "node:fs";

const TAG = "04b";
const DETAIL_KEYS = ["date", "entry", "interval", "panel", "reason", "row", "state"];
const CSRD = "eu-csrd-2022-2464";
const LINK_ONLY = "ae-dl-11-2024-climate";
const REPEALED = "gn-arrete-2022-1646-evaluations-environnementales";

// Runs a function body in the page; a throw comes back as {error} so one failure does not stop the run.
const probe = (h, body) => h.evaluate(`(() => { try { ${body} } catch (e) { return { error: String(e) }; } })()`);

const HOOK = `(() => {
  const n = (v) => (v === undefined ? null : v);
  window.__seam = [];
  GEL.onAnswer((d) => window.__seam.push({
    keys: Object.keys(d),
    id: n(d.entry && d.entry.id),
    date: n(d.date),
    interval: d.interval ? { ...d.interval } : null,
    commit: d.row ? d.row.commit : null,
    rowNull: d.row === null,
    isPanel: d.panel === document.getElementById("answer-panel"),
    state: n(d.state),
    reason: n(d.reason),
  }));
})()`;

export async function run(h) {
  const E = JSON.parse(fs.readFileSync(h.expected, "utf8"));
  const csrdCommit = E.csrd.find((r) => r.date === "2025-06-01")?.commit;

  await h.open("ok");
  await h.evaluate(HOOK);

  const cases = [
    { id: CSRD, date: "2025-06-01", state: "plain", reason: null, from: "2025-04-17", intervalState: "in_force" },
    { id: REPEALED, date: "2023-05-05", state: "interim", reason: "repealed", from: "2023-05-05", intervalState: "repealed" },
    { id: CSRD, date: "2022-12-31", state: "interim", reason: "before-first", from: null, intervalState: null },
    { id: LINK_ONLY, date: "2026-11-17", state: "interim", reason: "link-only", from: null, intervalState: null },
  ];
  for (const c of cases) {
    const r = await probe(h, `
      window.__seam.length = 0;
      GEL.showAnswer(${JSON.stringify(c.id)}, ${JSON.stringify(c.date)});
      return {
        calls: window.__seam.length,
        last: window.__seam[window.__seam.length - 1] ?? {},
        panelState: document.getElementById("answer-panel").getAttribute("data-state"),
      };`);
    const s = r.last ?? {};
    const problems = h.eqs([
      ["page error", r.error ?? null, null],
      ["hook calls", r.calls, 1],
      ["detail keys", JSON.stringify([...(s.keys ?? [])].sort()), JSON.stringify(DETAIL_KEYS)],
      ["entry.id", s.id, c.id],
      ["date", s.date, c.date],
      ["panel is #answer-panel", s.isPanel, true],
      ["panel data-state", r.panelState, c.state],
      ["state", s.state, c.state],
      ["reason", s.reason, c.reason],
      ["interval.from", s.interval?.from ?? null, c.from],
      ["interval.state", s.interval?.state ?? null, c.intervalState],
      ["row is null", s.rowNull, c.state === "interim"],
    ]);
    if (c.state === "plain") {
      if (!h.sameCommit(s.interval?.commit, csrdCommit)) problems.push(`interval.commit ${h.fmt(s.interval?.commit)}, want one starting ${csrdCommit}`);
      problems.push(...h.eqs([["row.commit", s.commit, s.interval?.commit]]));
    }
    h.verdict(TAG, `onAnswer detail: ${c.id} on ${c.date} is ${c.state}${c.reason ? " (" + c.reason + ")" : ""} with its interval`, problems);
  }

  const cov = await probe(h, `
    const idx = (e, d) => { const i = GEL.coveringInterval(e, d); return i === null ? null : e.intervals.indexOf(i); };
    const csrd = GEL.byId[${JSON.stringify(CSRD)}];
    return {
      equalToFrom: idx(csrd, "2023-01-05"),
      beforeFirst: idx(csrd, "2022-12-31"),
      third: idx(csrd, "2026-03-18"),
      noIntervals: idx(GEL.byId[${JSON.stringify(LINK_ONLY)}], "2026-11-17"),
      emptyList: idx({ intervals: [] }, "2026-11-17"),
    };`);
  h.verdict(TAG, "GEL.coveringInterval: a date equal to from counts, before the first and no intervals give null, a later date gives the last one", h.eqs([
    ["page error", cov.error ?? null, null],
    ["CSRD on 2023-01-05 (index)", cov.equalToFrom, 0],
    ["CSRD on 2022-12-31", cov.beforeFirst, null],
    ["CSRD on 2026-03-18 (index)", cov.third, 2],
    ["entry without intervals", cov.noIntervals, null],
    ["intervals: []", cov.emptyList, null],
  ]));

  const real = JSON.parse(fs.readFileSync(h.data, "utf8"));
  const fixture = structuredClone(real.entries.find((e) => e.id === CSRD));
  fixture.id = "seam-fixture-law";
  fixture.title = "Seam fixture law (00-seams.mjs)";
  real.entries.push(fixture);
  h.addVariant("seams-fixture-object", real);
  h.addVariant("seams-fixture-bytes", Buffer.from(JSON.stringify(real)));
  for (const [name, how] of [["seams-fixture-object", "an object"], ["seams-fixture-bytes", "bytes"]]) {
    await h.open(name);
    const r = await probe(h, `
      const entry = GEL.byId["seam-fixture-law"];
      GEL.showAnswer("seam-fixture-law", "2025-06-01");
      const panel = document.getElementById("answer-panel");
      return {
        arrived: entry ? entry.title : null,
        state: panel.getAttribute("data-state"),
        shown: panel.querySelector('[data-field="title"]').textContent,
      };`);
    h.verdict(TAG, `addVariant given ${how}: the fixture law arrives and answers plain with its title`, h.eqs([
      ["page error", r.error ?? null, null],
      ["GEL.byId title", r.arrived, fixture.title],
      ["panel data-state", r.state, "plain"],
      ["panel title text", r.shown, fixture.title],
    ]));
  }

  let thrown = null;
  try { h.addVariant("ok", {}); } catch (e) { thrown = e; }
  h.check(TAG, "addVariant refuses a name that is already taken (ok)", thrown !== null, "did not throw");
}
