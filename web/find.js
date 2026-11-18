(function () {
  const GEL = (window.GEL = window.GEL || {});
  const COUNT_DELAY = 500;
  const law = document.getElementById("law");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Both exist from load, so the status line is in the page before it is first filled.
  const count = el("p");
  count.id = "match-count";
  count.setAttribute("role", "status");
  count.hidden = true;
  const rows = el("ul");
  rows.id = "match-rows";
  document.getElementById("match-list").append(count, rows);

  let index = null;
  let shown = null; // the result drawn now; null while the list is closed
  let timer = 0;

  function close() {
    clearTimeout(timer);
    shown = null;
    rows.replaceChildren();
    count.textContent = "";
    count.hidden = true;
  }

  function row(entry) {
    const meta = el("span", "match-meta");
    meta.append(el("span", "match-place", GEL.data.places[entry.place] || entry.place), " ", el("span", "match-id", entry.id));
    const button = el("button", "match-row");
    button.type = "button";
    button.dataset.id = entry.id;
    button.append(el("span", "match-title", entry.title), meta);
    const item = el("li");
    item.append(button);
    return item;
  }

  function pick(id) {
    GEL.choose(id);
    law.focus();
    if (GEL.date !== null) GEL.showAnswer(id, GEL.date); // null: an address's date was refused, its message is showing
  }

  GEL.EXAMPLE = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
  GEL.chosen = null;

  GEL.choose = function (id) {
    if (!Object.hasOwn(GEL.byId, id)) throw new Error(`Unknown law id: ${id}`);
    GEL.chosen = id;
    law.value = GEL.byId[id].title;
    close();
  };

  GEL.pickExample = function () {
    GEL.choose(GEL.EXAMPLE.id);
    GEL.setDate(GEL.EXAMPLE.date);
  };

  law.addEventListener("input", () => {
    if (!GEL.byId) return;
    index = index || GEL.search.buildIndex(GEL.data.entries, GEL.data.places);
    const result = GEL.search.query(index, law.value);
    if (result.blank) {
      close();
      return;
    }
    shown = result;
    rows.replaceChildren(...result.rows.map(row));
    count.hidden = false; // shown empty at once, so the line filling in later does not push the rows down
    clearTimeout(timer);
    timer = setTimeout(() => {
      count.textContent = result.line;
    }, COUNT_DELAY);
  });

  rows.addEventListener("click", (event) => {
    const button = event.target.closest(".match-row");
    if (button) pick(button.dataset.id);
  });

  law.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !shown) return;
    event.preventDefault();
    if (shown.rows.length) pick(shown.rows[0].id);
    else if (typeof GEL.showNoMatch === "function" && GEL.date !== null) GEL.showNoMatch(law.value.trim(), GEL.date);
  });

  // The address: #law=<entry id>&date=<YYYY-MM-DD>&snapshot=<9 hex>. Read on load and on hashchange, written with
  // replaceState (which fires neither) after the visitor changes the law or the date. Opening one rewrites nothing.
  const status = document.getElementById("load-status"); // the page's one polite status region
  const panel = document.getElementById("answer-panel");
  let opening = false; // the answer an address draws must not rewrite it

  GEL.address = {
    build: (id, date) => "#" + new URLSearchParams({ law: id, date, snapshot: GEL.data.snapshot.history_commit.slice(0, 9) }),
    // Null unless the hash names a law (#browse-by-place and the like are not addresses).
    parse(hash) {
      const params = new URLSearchParams(hash.slice(1));
      return params.has("law") ? { law: params.get("law"), date: params.get("date") ?? "", snapshot: params.get("snapshot") } : null;
    },
  };

  GEL.openAddress = function () {
    const address = GEL.address.parse(location.hash);
    if (!address) return;
    const { history_commit, read_on } = GEL.data.snapshot;
    const current = history_commit.slice(0, 9);
    const known = Object.hasOwn(GEL.byId, address.law);
    const notes = [];

    // Never "the same" or "different": the page holds one snapshot and cannot compare.
    if (address.snapshot !== null) {
      const given = address.snapshot.toLowerCase();
      const readable = /^[0-9a-f]{7,40}$/.test(given);
      const first = !readable ? "The snapshot in this address could not be read." : history_commit.startsWith(given) ? "" : `Snapshot ${given} is not kept.`;
      if (first) notes.push(`${first} The answer below is from snapshot ${current}, read on ${read_on}. The page cannot say whether it matches the citation this address came from.`);
    }
    if (!known) notes.push(`This address names a law that is not in snapshot ${current}. Type its name in the law box.`);

    opening = true;
    try {
      if (known) GEL.choose(address.law);
      else {
        close();
        GEL.chosen = null;
        law.value = "";
      }
      const dated = GEL.setDate(address.date); // the one date check, the same as a typed date
      if (!dated) GEL.rejectDate();
      if (!(known && dated)) panel.hidden = true;
    } finally {
      opening = false;
    }
    status.textContent = notes.join(" ");
  };

  GEL.onAnswer(({ entry, date }) => {
    if (opening) return;
    status.textContent = "";
    history.replaceState(null, "", GEL.address.build(entry.id, date));
  });
})();
