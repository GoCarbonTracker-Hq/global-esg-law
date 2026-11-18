(function () {
  const GEL = (window.GEL = window.GEL || {});
  const CAP = 5; // items a group shows before "and N more"
  const INTRO = "Laws in the register that amend this one, as of the date asked.";
  const NONE = "No amending law is recorded in the register for this law.";
  const GROUPS = [
    ["in-force", (date) => `In force on ${date}`],
    ["not-yet", (date) => `Not yet in force on ${date}`],
    ["link-only", () => "Link only, date not known"],
  ];
  let drawn = null; // what the slot holds now: {slot, root, groups: Map of key to {node, head, signature}}

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  // Target id to the entries that amend it, from each entry's amends_ids. An id with no entry, the entry's own id and a
  // repeat are skipped. Built once, on the first answer; tests wrap seam.build to count the builds.
  function build() {
    const index = new Map();
    for (const entry of GEL.data.entries) {
      const seen = new Set();
      for (const id of Array.isArray(entry.amends_ids) ? entry.amends_ids : []) {
        if (id === entry.id || seen.has(id) || !Object.hasOwn(GEL.byId, id)) continue;
        seen.add(id);
        if (!index.has(id)) index.set(id, []);
        index.get(id).push(entry);
      }
    }
    return index;
  }
  const seam = (GEL.amendedBy = { index: null, build });

  // Where one amender stands on the date, read as the main answer reads it: the covering interval, then its version row
  // by commit. `at` is the date it sorts on. Null for a repealed amender, which the line leaves out.
  function stand(amender, date) {
    if (!amender.intervals || !amender.intervals.length || !amender.versions.length) {
      const at = amender.register_date || "";
      return { key: "link-only", at, when: at ? `register date ${at}` : "link only" };
    }
    const interval = GEL.coveringInterval(amender, date);
    if (!interval) {
      const at = amender.intervals[0].from;
      return { key: "not-yet", at, when: `in force from ${at}` };
    }
    if (interval.state === "repealed") return null;
    const row = amender.versions.find((v) => v.commit === interval.commit);
    const at = row ? row.in_force : interval.from;
    return { key: "in-force", at, when: row && row.date_basis ? `published ${at}` : `in force since ${at}` };
  }

  // Newest date first, undated last (an empty text sorts below every date), the id breaking ties.
  const byNewest = (x, y) => (x.at < y.at ? 1 : x.at > y.at ? -1 : x.id < y.id ? -1 : x.id > y.id ? 1 : 0);

  function item(it) {
    const li = el("li");
    const name = el(it.url ? "a" : "span", null, it.name);
    if (it.url) name.setAttribute("href", it.url);
    li.append(name, " ", el("span", "amended-when", it.when));
    return li;
  }

  function list(items) {
    const ul = el("ul");
    ul.append(...items.map(item));
    return ul;
  }

  // The list of one group: the first CAP items, then the rest behind a details.
  function parts(items) {
    const out = [list(items.slice(0, CAP))];
    if (items.length > CAP) {
      const more = el("details", "amended-more");
      more.append(el("summary", null, `and ${items.length - CAP} more`), list(items.slice(CAP)));
      out.push(more);
    }
    return out;
  }

  function empty() {
    for (const id of ["slot-after-link", "slot-after-interim"]) document.getElementById(id).replaceChildren();
    drawn = null;
  }

  // Plain answers use the slot inside #answer-plain, every other answer the one after #answer-interim; the other is emptied.
  function show({ entry, date, state }) {
    const slot = document.getElementById(state === "plain" ? "slot-after-link" : "slot-after-interim");
    document.getElementById(state === "plain" ? "slot-after-interim" : "slot-after-link").replaceChildren();
    if (drawn && drawn.slot !== slot) drawn = null;
    if (!seam.index) seam.index = seam.build();
    if (!seam.index.size) return empty(); // no entry has amends_ids: the page answers as it did without the line

    const buckets = { "in-force": [], "not-yet": [], "link-only": [] };
    for (const amender of seam.index.get(entry.id) || []) {
      const at = stand(amender, date);
      if (at) buckets[at.key].push({ id: amender.id, name: amender.title || amender.id, url: amender.official_url, at: at.at, when: at.when });
    }
    const filled = GROUPS.filter(([key]) => buckets[key].length);
    if (!filled.length) {
      // None recorded: say so. Recorded but all repealed on this date: nothing at all.
      if (seam.index.has(entry.id)) return empty();
      slot.replaceChildren(el("p", "amended-none", NONE));
      drawn = null;
      return;
    }

    if (!drawn) {
      const root = el("div", "amended");
      root.append(el("h3", null, "Amended by"), el("p", null, INTRO));
      slot.replaceChildren(root);
      drawn = { slot, root, groups: new Map() };
    }
    // A group whose items are unchanged keeps its node, so a date change moves nothing that did not change.
    const nodes = [];
    for (const [key, heading] of filled) {
      const items = buckets[key].sort(byNewest);
      const signature = JSON.stringify(items);
      let group = drawn.groups.get(key);
      if (!group) drawn.groups.set(key, (group = { node: el("div", "amended-group"), head: el("h4"), signature: "" }));
      if (group.head.textContent !== heading(date)) group.head.textContent = heading(date);
      if (group.signature !== signature) {
        group.node.replaceChildren(group.head, ...parts(items));
        group.signature = signature;
      }
      nodes.push(group.node);
    }
    for (const key of [...drawn.groups.keys()]) if (!filled.some(([k]) => k === key)) drawn.groups.delete(key);
    const root = drawn.root;
    nodes.forEach((node, i) => {
      if (root.children[i + 2] !== node) root.insertBefore(node, root.children[i + 2] || null);
    });
    while (root.children.length > nodes.length + 2) root.lastElementChild.remove();
  }

  GEL.onAnswer(show);
  GEL.onNoMatch(empty);
  GEL.onClear(empty);
})();
