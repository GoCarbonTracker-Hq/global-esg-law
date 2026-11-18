(function () {
  const GEL = (window.GEL = window.GEL || {});
  const load = GEL.load;

  const LEGEND = [
    ["stored", "text stored: at least one law with stored text"],
    ["link-only", "link only: links and no stored text"],
    ["none", "no corpus: no law for this place"],
  ];
  const COLUMNS = ["Instruments", "Text stored", "Link only"];
  const CAPTION = "Laws by place: how many are stored as text and how many are held as links only";

  function el(tag, text, attrs) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    for (const name of Object.keys(attrs || {})) node.setAttribute(name, attrs[name]);
    return node;
  }

  const stateOf = (row) => (row.stored ? "stored" : row.link ? "link-only" : "none");

  // One row per listed place, counted from the entries. An entry of an unlisted place is named by the check.
  function tally(data) {
    const rows = {};
    for (const code of Object.keys(data.places)) rows[code] = { code, name: data.places[code], stored: 0, link: 0 };
    for (const entry of data.entries) {
      if (Object.hasOwn(rows, entry.place)) rows[entry.place][entry.versions.length ? "stored" : "link"] += 1;
    }
    return Object.keys(rows).sort().map((code) => rows[code]);
  }

  // Reads back the grid and the table that draw() made and compares them with the entries and the place list.
  function problems(data, grid, tbody) {
    const found = [];
    const entries = data.entries;
    const cells = Array.from(grid.children);
    const rows = Array.from(tbody.children).map((tr) => {
      const num = (label) => parseInt(Array.from(tr.children).find((td) => td.getAttribute("data-label") === label).textContent, 10);
      return { code: tr.getAttribute("data-place"), v: COLUMNS.map(num) };
    });

    for (const entry of entries) {
      if (!Object.hasOwn(data.places, entry.place)) found.push(`${entry.place} is not a listed place (entry ${entry.id})`);
      const n = entry.versions.length;
      if (!(entry.status === "stored" ? n > 0 : entry.status === "link only" && n === 0)) {
        found.push(`${entry.place} entry ${entry.id} is marked "${entry.status}" but has ${n} version rows`);
      }
    }

    const listed = Object.keys(data.places).length;
    if (cells.length !== rows.length || rows.length !== listed) {
      found.push(`the grid has ${cells.length} cells, the table ${rows.length} rows and the place list ${listed} places`);
    }

    const classed = (r) => (r.v[1] > 0 ? "stored" : r.v[2] > 0 ? "link-only" : r.v[0] === 0 ? "none" : "");
    for (const [state] of LEGEND) {
      const inGrid = cells.filter((c) => c.getAttribute("data-state") === state).length;
      const inTable = rows.filter((r) => classed(r) === state).length;
      if (inGrid !== inTable) found.push(`${state}: the grid has ${inGrid} places and the table ${inTable}`);
    }

    for (const r of rows) {
      if (r.v[0] !== r.v[1] + r.v[2]) found.push(`${r.code}: instruments are not text stored plus link only`);
    }

    const total = [entries.length, entries.filter((e) => e.versions.length > 0).length, entries.filter((e) => e.versions.length === 0).length];
    COLUMNS.forEach((label, i) => {
      const sum = rows.reduce((t, r) => t + r.v[i], 0);
      if (sum !== total[i]) found.push(`${label}: the table adds up to ${sum} and the entries to ${total[i]}`);
    });
    return found;
  }

  function draw(section, data, note) {
    const heading = document.getElementById("browse-heading");
    if (!data.places) {
      section.replaceChildren(heading, note);
      return ["the data file has no place list"];
    }
    const rows = tally(data);
    const inState = (state) => rows.filter((r) => stateOf(r) === state).length;
    const stored = data.entries.filter((e) => e.versions.length > 0).length;
    const snap = data.snapshot;

    const totals = el("p", `${rows.length} places, ${data.entries.length} laws: ${stored} text stored, ${data.entries.length - stored} link only`, { id: "browse-totals" });
    const read = el("p", `Corpus read ${snap.read_on} · Snapshot ${snap.history_commit.slice(0, 9)}`, { id: "browse-read" });

    const grid = el("div", "", {
      id: "browse-grid",
      role: "img",
      "aria-label": `${inState("stored")} places have at least one law with stored text, ${inState("link-only")} places hold links only, ${inState("none")} places have no corpus. The table below lists every place with its figures.`,
    });
    for (const r of rows) grid.append(el("span", r.code, { class: "cell", "data-place": r.code, "data-state": stateOf(r) }));
    const legend = el("ul", "", { id: "browse-legend" });
    for (const [state, text] of LEGEND) {
      const item = el("li");
      item.append(el("span", "", { class: "swatch", "data-state": state }), text);
      legend.append(item);
    }
    const block = el("div", "", { id: "browse-grid-block" });
    block.append(grid, legend);

    const head = el("tr");
    for (const name of ["Place", ...COLUMNS]) head.append(el("th", name, { scope: "col" }));
    const thead = el("thead");
    thead.append(head);
    const tbody = el("tbody");
    for (const r of rows) {
      const tr = el("tr", "", { "data-place": r.code });
      tr.append(el("th", `${r.name} (${r.code})`, { scope: "row" }));
      [r.stored + r.link, r.stored, r.link].forEach((n, i) => tr.append(el("td", String(n), { "data-label": COLUMNS[i] })));
      tbody.append(tr);
    }
    const table = el("table", "", { id: "browse-table" });
    table.append(el("caption", CAPTION), thead, tbody);
    const wrap = el("div", "", { id: "browse-table-wrap" });
    wrap.append(table);

    section.replaceChildren(heading, totals, read, note, block, wrap);
    return problems(data, grid, tbody);
  }

  GEL.load = async function () {
    await load.apply(this, arguments);
    const section = document.getElementById("browse-by-place");
    const note = el("p", "", { id: "browse-check", hidden: "" });
    let found;
    try {
      found = draw(section, GEL.data, note);
    } catch (error) {
      console.error(error);
      section.replaceChildren(document.getElementById("browse-heading"), note);
      found = ["the place figures could not be drawn"];
    }
    const shown = found.length > 5 ? [...found.slice(0, 5), `and ${found.length - 5} more`] : found;
    note.textContent = found.length ? `The place figures do not agree: ${shown.join("; ")}` : "";
    note.hidden = found.length === 0;
    section.setAttribute("data-check", found.length ? "failed" : "ok");
  };
})();
