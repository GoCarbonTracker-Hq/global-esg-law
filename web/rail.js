(function () {
  const GEL = (window.GEL = window.GEL || {});
  const SHOWN = 7;
  let drawn = null; // what #rail holds now: {entry, cls, size, lists}

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  // How many rows share each in_force text.
  function sizes(rows) {
    const size = new Map();
    for (const row of rows) size.set(row.in_force, (size.get(row.in_force) || 0) + 1);
    return size;
  }

  // Newest first by in_force as text. On a shared date the row for commit goes first; the sort is stable,
  // so the rest keep data-file order.
  function order(entry, commit) {
    return entry.versions.slice().sort((x, y) =>
      x.in_force === y.in_force ? (y.commit === commit) - (x.commit === commit) : x.in_force < y.in_force ? 1 : -1,
    );
  }

  // [start, end) over the ordered rows: the whole list up to 7 rows, else 7 rows around the anchor date group.
  function windowOf(rows, commit) {
    const n = rows.length;
    if (n <= SHOWN) return [0, n];
    const named = rows.findIndex((r) => r.commit === commit);
    const date = rows[named < 0 ? n - 1 : named].in_force;
    const a = rows.findIndex((r) => r.in_force === date);
    const start = Math.min(Math.max(a - Math.floor((SHOWN - sizes(rows).get(date)) / 2), 0), n - SHOWN);
    return [start, start + SHOWN];
  }

  // [label, current] for each ordered row. The named row is the one whose commit the covering interval names.
  function marks(rows, interval, date) {
    const size = sizes(rows);
    const named = interval ? rows.findIndex((r) => r.commit === interval.commit) : -1;
    const a = named < 0 ? rows.length : rows.findIndex((r) => r.in_force === rows[named].in_force);
    const end = named < 0 ? a : a + size.get(rows[named].in_force);
    return rows.map((row, i) => {
      const tail = size.get(row.in_force) > 1 ? (i === named ? ", shown" : ", not shown") : "";
      if (row.date_basis) return ["in-force date not recorded" + tail, false];
      if (i === named) {
        return [(interval.state === "repealed" ? "repealed on " + row.in_force : "in force on " + date) + tail, true];
      }
      if (i < a) return [row.in_force > date ? "later than the date asked" : "not shown", false];
      return [i < end ? "same date, not shown" : "", false];
    });
  }

  function item(row, shared) {
    const li = el("li");
    li.dataset.commit = row.commit;
    li.dataset.date = row.in_force;
    const control = el(row.date_basis ? "span" : "button", "rail-row");
    if (!row.date_basis) {
      control.type = "button";
      control.addEventListener("click", () => GEL.setDate(row.in_force));
    }
    const parts = [el("span", "rail-date", row.in_force), el("span", "rail-kind", row.kind)];
    if (shared) parts.push(el("span", "rail-lang", row.language));
    parts.push(el("span", "rail-label"));
    control.append(...parts.flatMap((part, i) => (i ? [" ", part] : [part])));
    li.append(control);
    return li;
  }

  function draw(entry, cls) {
    const box = document.getElementById("rail");
    const rows = entry.versions;
    drawn = { entry, cls, size: sizes(rows), lists: [] };
    box.removeAttribute("aria-labelledby");
    if (cls === 0) return box.replaceChildren();
    if (cls === 1) {
      const only = rows[0];
      const basis = only.date_basis ? ", in-force date not recorded" : "";
      return box.replaceChildren(el("p", "rail-only", "Only stored version: " + only.in_force + ", " + only.kind + basis));
    }
    box.setAttribute("aria-labelledby", "rail-heading");
    const heading = el("h2", "", "Versions of this law");
    heading.id = "rail-heading";
    const list = (id, all) => {
      const ol = el("ol", "rail-list");
      ol.id = id;
      drawn.lists.push({ ol, all, items: new Map() });
      return ol;
    };
    const parts = [heading, list("rail-window", false)];
    if (rows.length > SHOWN) {
      const details = el("details", "rail-all");
      details.append(el("summary", "", "Show all " + rows.length + " versions"), list("rail-all", true));
      parts.push(details);
    }
    box.replaceChildren(...parts);
  }

  // Repaint the lists already drawn: classes, aria-current, labels, and the order and membership of the li.
  // A row that stays in a list keeps its node, so a focused button keeps focus.
  function paint(date, interval) {
    const commit = interval ? interval.commit : null;
    const rows = order(drawn.entry, commit);
    const mark = marks(rows, interval, date);
    const span = windowOf(rows, commit);
    for (const list of drawn.lists) {
      const [from, to] = list.all ? [0, rows.length] : span;
      const want = [];
      for (let i = from; i < to; i++) {
        const row = rows[i];
        let li = list.items.get(row.commit);
        if (!li) list.items.set(row.commit, (li = item(row, drawn.size.get(row.in_force) > 1)));
        const [label, current] = mark[i];
        const control = li.firstChild;
        li.classList.toggle("rail-current", current);
        if (current && !list.all) control.setAttribute("aria-current", "true");
        else control.removeAttribute("aria-current");
        control.lastChild.textContent = label;
        control.lastChild.hidden = label === "";
        want.push(li);
      }
      const keep = new Set(want);
      for (const li of [...list.ol.children]) if (!keep.has(li)) li.remove();
      let ref = list.ol.firstChild;
      for (const li of want) {
        if (li === ref) ref = ref.nextSibling;
        else if (li.parentNode === list.ol && list.ol.moveBefore) list.ol.moveBefore(li, ref);
        else list.ol.insertBefore(li, ref);
      }
    }
  }

  GEL.rail = { order, window: windowOf };

  // After a no-match answer, or when the page clears the answer, the rail is back to what it was before any law was
  // chosen: empty, and drawn is forgotten so the next answer draws it afresh.
  function empty() {
    drawn = null;
    const box = document.getElementById("rail");
    box.removeAttribute("aria-labelledby");
    box.replaceChildren();
  }
  GEL.onNoMatch(empty);
  GEL.onClear(empty);

  GEL.onAnswer(({ entry, date, interval }) => {
    const n = entry.versions.length;
    const cls = n === 0 ? 0 : n === 1 ? 1 : 2;
    if (!drawn || drawn.entry !== entry || drawn.cls !== cls) draw(entry, cls);
    if (cls === 2) paint(date, interval);
  });
})();
