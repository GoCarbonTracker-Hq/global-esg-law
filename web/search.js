(function () {
  const MAX_ROWS = 8;

  // Ten letters NFD leaves alone (l o d d i ss ae oe th e), curly quotes, and the en and em dash.
  const LETTERS = {
    "\u{142}": "l",
    "\xf8": "o",
    "\u{111}": "d",
    "\xf0": "d",
    "\u{131}": "i",
    "\xdf": "ss",
    "\xe6": "ae",
    "\u{153}": "oe",
    "\xfe": "th",
    "\u{259}": "e",
    "\u{2018}": "'",
    "\u{2019}": "'",
    "\u{2013}": "-",
    "\u{2014}": "-",
  };
  const LETTERS_RE = new RegExp(`[${Object.keys(LETTERS).join("")}]`, "g");
  const BRACKETS = /\(([^()]*)\)/g;
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  function fold(text) {
    return String(text).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(LETTERS_RE, (c) => LETTERS[c]);
  }

  // One record per entry, already in display order, so a query is a single filtering pass.
  // hay: strings the query is looked for in. exact: strings that put the entry in group A when the query equals one.
  function buildIndex(entries, places = {}) {
    const records = entries.map((entry) => {
      const title = fold(entry.title);
      const aliases = (entry.aliases || []).map((alias) => fold(alias).trim());
      const name = places[entry.place];
      const brackets = [...title.matchAll(BRACKETS)].map((m) => m[1].trim());
      return {
        entry,
        hay: [title, fold(entry.id), entry.citation == null ? "" : fold(entry.citation), ...aliases],
        exact: [...brackets, ...aliases],
        eu: entry.place === "EU" ? 0 : 1,
        place: fold(typeof name === "string" && name !== "" ? name : entry.place),
      };
    });
    return records.sort((a, b) => a.eu - b.eu || cmp(a.place, b.place) || cmp(a.entry.id, b.entry.id));
  }

  function countLine(total) {
    if (total === 0) return "No law matches. Browse by place below.";
    if (total === 1) return "1 law matches";
    if (total <= MAX_ROWS) return `${total} laws match`;
    return `${total} laws match, showing ${MAX_ROWS}`;
  }

  function query(index, text) {
    const q = fold(text).trim();
    if (q === "") return { blank: true, total: 0, entries: [], rows: [], line: "" };
    const first = [];
    const rest = [];
    for (const record of index) {
      if (!record.hay.some((s) => s.includes(q))) continue;
      (record.exact.includes(q) ? first : rest).push(record.entry);
    }
    const entries = first.concat(rest);
    return { blank: false, total: entries.length, entries, rows: entries.slice(0, MAX_ROWS), line: countLine(entries.length) };
  }

  const api = { MAX_ROWS, fold, buildIndex, query, countLine };
  if (typeof window !== "undefined") (window.GEL = window.GEL || {}).search = api;
  if (typeof module !== "undefined") module.exports = api;
})();
