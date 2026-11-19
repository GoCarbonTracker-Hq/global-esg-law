(function () {
  const GEL = (window.GEL = window.GEL || {});
  const load = GEL.load;
  const BACK = "#browse-by-place";

  function el(tag, text, attrs) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    for (const name of Object.keys(attrs || {})) node.setAttribute(name, attrs[name]);
    return node;
  }

  const external = (href, label) => el("a", `${label} (opens in a new tab)`, { href, target: "_blank", rel: "noopener" });

  // The short form of answer.js's sentence: "Consolidated version: the publisher's text ..." reads "Consolidated version".
  const kindText = (kind) => (kind === "repeal" ? "repeal record" : (GEL.KIND_TEXT[kind] || kind).split(":")[0]);

  function stateOn(entry, today) {
    if (!entry.intervals) return "link only";
    const interval = GEL.coveringInterval(entry, today);
    return !interval ? "not yet in force" : interval.state === "repealed" ? "repealed" : "in force";
  }

  function versionItem(v) {
    const parts = [
      el("span", v.date_basis ? `${v.in_force} (publication date)` : v.in_force),
      el("span", kindText(v.kind)),
      el("span", `Language: ${v.language}`),
      el("span", `Licence: ${v.licence}`),
      external(v.source_url, "Source"),
    ];
    if (v.copy === "archive") parts.push(el("span", "archive copy"));
    const item = el("li");
    parts.forEach((part, i) => item.append(...(i ? [" · ", part] : [part])));
    return item;
  }

  function lawRow(entry, today, labels) {
    const n = entry.versions.length;
    const row = el("tr", "", { "data-id": entry.id });
    const law = el("th", "", { scope: "row" });
    law.append(el("span", entry.title, { class: "law-title" }));
    if (entry.citation) law.append(el("span", entry.citation, { class: "law-citation" }));
    if (n) {
      const versions = el("details");
      const list = el("ul");
      list.append(...entry.versions.map(versionItem));
      versions.append(el("summary", n === 1 ? "1 version" : `${n} versions`), list);
      law.append(versions);
    }
    const stored = el("td", n ? "text stored" : "link only");
    if (!n && entry.register_date) stored.append(el("span", `register date ${entry.register_date}`, { class: "law-note" }));
    const official = el("td");
    if (entry.official_url) official.append(external(entry.official_url, "Official page"));
    else official.textContent = "no official link";
    const lookup = el("td");
    lookup.append(el("a", "Look up", { href: GEL.address.build(entry.id, today) }));
    const cells = [stored, el("td", stateOn(entry, today)), el("td", entry.law_family), el("td", entry.tier_label), el("td", entry.duty_on), el("td", entry.verification), official, lookup];
    cells.forEach((cell, i) => cell.setAttribute("data-label", labels[i + 1]));
    row.append(law, ...cells);
    return row;
  }

  function lawTable(name, entries, today) {
    const labels = ["Law", "Stored", `State on ${today}`, "Law family", "Tier", "Duty on", "Verification", "Official link", "Look up"];
    const head = el("tr");
    for (const label of labels) head.append(el("th", label, { scope: "col" }));
    const thead = el("thead");
    thead.append(head);
    const tbody = el("tbody");
    tbody.append(...entries.map((entry) => lawRow(entry, today, labels)));
    const table = el("table", "", { id: "place-table" });
    table.append(el("caption", `Laws the register holds for ${name}`), thead, tbody);
    const wrap = el("div", "", { id: "place-table-wrap" });
    wrap.append(table);
    return wrap;
  }

  function fill(section, code) {
    const data = GEL.data;
    const known = Object.hasOwn(data.places || {}, code);
    const name = known ? data.places[code] : "";
    const back = el("p");
    back.append(el("a", "Back to Browse by place", { href: BACK }));
    const heading = el("h2", known ? `${name} (${code})` : `No place ${code} in this snapshot.`, { id: "place-heading", tabindex: "-1" });
    section.replaceChildren(back, heading);
    if (!known) return heading;

    // localeCompare in one fixed locale, then id: the order does not depend on the visitor's browser, and two laws of one title keep a fixed order.
    const entries = data.entries.filter((e) => e.place === code).sort((a, b) => a.title.localeCompare(b.title, "en") || (a.id < b.id ? -1 : 1));
    if (!entries.length) {
      section.append(el("p", "No law is recorded in the register for this place."));
      return heading;
    }
    const stored = entries.filter((e) => e.versions.length).length;
    const snap = data.snapshot;
    section.append(
      el("p", `${entries.length} ${entries.length === 1 ? "law" : "laws"}: ${stored} text stored, ${entries.length - stored} link only`, { id: "place-totals" }),
      el("p", `Corpus read ${snap.read_on} · Snapshot ${snap.history_commit.slice(0, 9)}`, { id: "place-read" }),
      lawTable(name, entries, GEL.dates.today()),
    );
    return heading;
  }

  // opened: the hash changed to this view, so focus goes to its heading; a first load leaves focus alone.
  function show(opened) {
    const section = document.getElementById("place-view");
    // A law address wins: #law=...&place=XX opens the answer, as every law address does.
    const code = GEL.address.parse(location.hash) ? "" : (new URLSearchParams(location.hash.slice(1)).get("place") || "").toUpperCase();
    const wasOpen = document.body.hasAttribute("data-view");
    if (!code) {
      if (!wasOpen) return;
      document.body.removeAttribute("data-view");
      section.replaceChildren();
      // The page was hidden under the view, so the browser could not scroll to where it came from.
      if (GEL.address.parse(location.hash)) window.scrollTo(0, 0);
      else document.getElementById("browse-by-place").scrollIntoView();
      return;
    }
    const heading = fill(section, code);
    document.body.setAttribute("data-view", "place");
    if (opened) {
      window.scrollTo(0, 0);
      heading.focus();
    }
  }

  GEL.load = async function () {
    await load.apply(this, arguments);
    show(false);
  };
  window.addEventListener("hashchange", () => GEL.data && show(true));
})();
