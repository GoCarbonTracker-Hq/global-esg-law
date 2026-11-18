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
    GEL.showAnswer(id, GEL.date);
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
    else if (typeof GEL.showNoMatch === "function") GEL.showNoMatch(law.value.trim(), GEL.date);
  });
})();
