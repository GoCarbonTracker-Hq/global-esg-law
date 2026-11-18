(function () {
  const GEL = (window.GEL = window.GEL || {});
  const hooks = [];
  const noMatchHooks = [];
  const clearHooks = [];

  // What each kind means: README line 52 names the kinds, COVERAGE.md line 288 says an adopted text is the act as
  // first printed with amendments stored as their own instruments, MAINTAINING.md line 7 says a translation is
  // stored beside the official-language texts.
  const KIND_TEXT = {
    consolidated: "Consolidated version: the publisher's text with later amendments merged in.",
    adopted: "Adopted version: the act as first published, with later amendments not merged in.",
    translation: "Translation: a translation of the official-language text.",
  };
  // Text fields of an in-force answer; each is emptied before any answer is drawn.
  const PLAIN_FIELDS = ["since", "applies", "applies-note", "kind", "language", "codes", "link", "source"];

  GEL.onAnswer = function (fn) {
    hooks.push(fn);
  };

  // Called when a no-match answer (V5) is drawn: no law is chosen, so the hook gets no detail.
  GEL.onNoMatch = function (fn) {
    noMatchHooks.push(fn);
  };

  // Called by clearAnswer: whatever a listener holds of the last answer goes.
  GEL.onClear = function (fn) {
    clearHooks.push(fn);
  };

  function fire(list, detail) {
    for (const fn of list) {
      try {
        fn(detail);
      } catch (error) {
        console.error(error);
      }
    }
  }

  // The only date comparison on the page: text compare `interval.from <= date`. Kinds are never ranked.
  // Null when no interval starts on or before the date, or when the entry has no intervals (link only).
  GEL.coveringInterval = function (entry, date) {
    let interval = null;
    for (const candidate of entry.intervals || []) if (candidate.from <= date) interval = candidate;
    return interval;
  };

  // Every in-force interval is plain: a version row with date_basis, an interval that is not yet applying and a row
  // with copy "archive" are drawn by showAnswer as the in-force panel with one more line or another label.
  GEL.classify = function (entry, date) {
    const interim = (reason) => ({ kind: "interim", reason });
    if (!entry.intervals || !entry.versions.length) return interim("link-only");
    const interval = GEL.coveringInterval(entry, date);
    if (!interval) return interim("before-first");
    if (interval.state === "repealed") return interim("repealed");
    const row = entry.versions.find((v) => v.commit === interval.commit);
    if (!row || !Object.hasOwn(KIND_TEXT, row.kind)) return interim("other");
    return { kind: "plain", interval, row };
  };

  const panelField = (panel, name) => panel.querySelector(`[data-field="${name}"]`);

  function externalLink(el, href, label) {
    el.setAttribute("href", href);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
    el.textContent = `${label} (opens in a new tab)`;
  }

  // Empties what a variant fills, so no earlier answer's text or link stays in the hidden markup.
  function reset(panel) {
    for (const name of PLAIN_FIELDS) panelField(panel, name).textContent = "";
    for (const name of ["link", "source"]) panelField(panel, name).removeAttribute("href");
    panelField(panel, "kind").removeAttribute("data-kind");
    for (const name of ["applies", "applies-note", "source-row", "later"]) panelField(panel, name).hidden = true;
    panelField(panel, "status").hidden = true;
    panelField(panel, "title").hidden = false;
    panel.removeAttribute("data-commit");
    document.getElementById("answer-interim").textContent = "";
  }

  // What every variant keeps: the pair of dates, the snapshot line and the notice from the file.
  function common(panel, date, data) {
    panelField(panel, "asked").textContent = `Date asked ${date}`;
    panelField(panel, "read").textContent = `Corpus read ${data.snapshot.read_on}`;
    panelField(panel, "snapshot").textContent = `Snapshot ${data.snapshot.history_commit.slice(0, 9)}, ${data.coverage.status}`;
    panelField(panel, "notice").textContent = data.notice;
  }

  function show(panel, plain, sentence) {
    document.getElementById("answer-plain").hidden = !plain;
    document.getElementById("answer-interim").hidden = plain;
    document.getElementById("answer-sentence").textContent = sentence;
    panel.hidden = false;
  }

  GEL.showAnswer = function (id, date) {
    if (!Object.hasOwn(GEL.byId, id)) throw new Error(`Unknown law id: ${id}`);
    const entry = GEL.byId[id];
    const data = GEL.data;
    const result = GEL.classify(entry, date);
    const plain = result.kind === "plain";
    const panel = document.getElementById("answer-panel");
    const field = (name) => panelField(panel, name);
    let sentence;

    reset(panel);
    panel.setAttribute("data-id", id);
    panel.setAttribute("data-date", date);
    field("title").textContent = entry.title;
    common(panel, date, data);

    if (plain) {
      const { row, interval } = result;
      const archive = row.copy === "archive";
      field("status").textContent = `Version in force on ${date}`;
      field("status").hidden = false;
      field("kind").textContent = KIND_TEXT[row.kind];
      field("kind").setAttribute("data-kind", row.kind);
      field("language").textContent = `Language: ${row.language}`;
      field("codes").textContent = `Law family ${entry.law_family} · Verification ${entry.verification}`;
      // Label rule: a stored version reads "Official text"; an archive copy says so and adds the official source.
      externalLink(field("link"), row.source_url, archive ? "Archive copy, not the official text" : "Official text");
      if (archive) {
        externalLink(field("source"), entry.official_url, "Official source");
        field("source-row").hidden = false;
      }
      panel.setAttribute("data-state", "plain");
      panel.setAttribute("data-commit", row.commit);
      const word = row.kind === "translation" ? "translation" : `${row.kind} version`;
      if (row.date_basis) {
        field("since").textContent = GEL.interim.v6(row.in_force);
        sentence = `${entry.title}, version in force on ${date}: ${word}. ${field("since").textContent}`;
      } else {
        field("since").textContent = `In force since ${row.in_force}`;
        sentence = `${entry.title}, version in force on ${date}: ${word}, in force since ${row.in_force}.`;
      }
      if (entry.applies_from) {
        const line = interval.not_yet_applying ? "Duties start to apply on" : "Duties apply from";
        field("applies").textContent = `${line} ${entry.applies_from}.`;
        field("applies").hidden = false;
        sentence += ` ${field("applies").textContent}`;
        if (entry.applies_note) {
          field("applies-note").textContent = entry.applies_note;
          field("applies-note").hidden = false;
          sentence += ` ${entry.applies_note}`;
        }
      }
    } else {
      panel.setAttribute("data-state", "interim");
      sentence = GEL.interim.render({ entry, date, reason: result.reason, data });
      field("status").hidden = result.reason !== "repealed";
    }

    // Text compare, like every date test on the page.
    if (date > data.snapshot.read_on) {
      field("later").textContent = GEL.interim.later(data.snapshot.read_on);
      field("later").hidden = false;
      sentence += ` ${field("later").textContent}`;
    }
    show(panel, plain, sentence);

    const detail = {
      entry,
      date,
      interval: GEL.coveringInterval(entry, date),
      row: plain ? result.row : null,
      panel,
      state: plain ? "plain" : "interim",
      reason: plain ? null : result.reason,
    };
    fire(hooks, detail);
  };

  // The no-match answer (V5). No law is chosen, so there is nothing for an onAnswer hook to read: none is called,
  // the onNoMatch hooks are. GEL.chosen is left alone: the next date change draws the chosen law again.
  GEL.showNoMatch = function (text, date) {
    const data = GEL.data;
    const panel = document.getElementById("answer-panel");
    reset(panel);
    panel.removeAttribute("data-id");
    panel.setAttribute("data-date", date);
    panel.setAttribute("data-state", "no-match");
    panelField(panel, "title").textContent = "";
    panelField(panel, "title").hidden = true;
    common(panel, date, data);
    show(panel, false, GEL.interim.render({ reason: "no-match", text }));
    fire(noMatchHooks);
  };

  // No answer shows and none is left behind: the panel is hidden and loses the id, state, date and commit of the last
  // answer, the hidden sentence is emptied, and the onClear hooks run.
  GEL.clearAnswer = function () {
    const panel = document.getElementById("answer-panel");
    panel.hidden = true;
    for (const name of ["data-id", "data-state", "data-date", "data-commit"]) panel.removeAttribute(name);
    document.getElementById("answer-sentence").textContent = "";
    fire(clearHooks);
  };
})();
