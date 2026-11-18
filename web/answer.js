(function () {
  const GEL = (window.GEL = window.GEL || {});
  const hooks = [];

  // What each kind means: README line 52 names the kinds, COVERAGE.md line 288 says an adopted text is the act as
  // first printed with amendments stored as their own instruments, MAINTAINING.md line 7 says a translation is
  // stored beside the official-language texts.
  const KIND_TEXT = {
    consolidated: "Consolidated version: the publisher's text with later amendments merged in.",
    adopted: "Adopted version: the act as first published, with later amendments not merged in.",
    translation: "Translation: a translation of the official-language text.",
  };
  const PLAIN_FIELDS = ["status", "since", "kind", "language", "codes", "link", "asked", "read", "snapshot"];

  GEL.onAnswer = function (fn) {
    hooks.push(fn);
  };

  // The only date comparison on the page: text compare `interval.from <= date`. Kinds are never ranked.
  GEL.classify = function (entry, date) {
    const interim = (reason) => ({ kind: "interim", reason });
    if (!entry.intervals || !entry.versions.length) return interim("link-only");
    let interval = null;
    for (const candidate of entry.intervals) if (candidate.from <= date) interval = candidate;
    if (!interval) return interim("before-first");
    if (interval.state === "repealed") return interim("repealed");
    if (interval.not_yet_applying) return interim("not-yet-applying");
    const row = entry.versions.find((v) => v.commit === interval.commit);
    if (!row) return interim("other");
    if (row.date_basis) return interim("date-basis");
    if (row.copy) return interim("archive-copy");
    if (!Object.hasOwn(KIND_TEXT, row.kind)) return interim("other");
    return { kind: "plain", interval, row };
  };

  GEL.showAnswer = function (id, date) {
    if (!Object.hasOwn(GEL.byId, id)) throw new Error(`Unknown law id: ${id}`);
    const entry = GEL.byId[id];
    const data = GEL.data;
    const result = GEL.classify(entry, date);
    const plain = result.kind === "plain";
    const panel = document.getElementById("answer-panel");
    const plainBox = document.getElementById("answer-plain");
    const interimBox = document.getElementById("answer-interim");
    const field = (name) => panel.querySelector(`[data-field="${name}"]`);
    let sentence;

    panel.setAttribute("data-id", id);
    panel.setAttribute("data-date", date);
    field("title").textContent = entry.title;
    field("notice").textContent = data.notice;

    if (plain) {
      const row = result.row;
      const link = field("link");
      field("status").textContent = `Version in force on ${date}`;
      field("since").textContent = `In force since ${row.in_force}`;
      field("kind").textContent = KIND_TEXT[row.kind];
      field("kind").setAttribute("data-kind", row.kind);
      field("language").textContent = `Language: ${row.language}`;
      field("codes").textContent = `Law family ${entry.law_family} · Verification ${entry.verification}`;
      link.setAttribute("href", row.source_url);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
      link.textContent = "Official text (opens in a new tab)";
      field("asked").textContent = `Date asked ${date}`;
      field("read").textContent = `Corpus read ${data.snapshot.read_on}`;
      field("snapshot").textContent = `Snapshot ${data.snapshot.history_commit.slice(0, 9)}, ${data.coverage.status}`;
      panel.setAttribute("data-state", "plain");
      panel.setAttribute("data-commit", row.commit);
      interimBox.textContent = "";
      const word = row.kind === "translation" ? "translation" : `${row.kind} version`;
      sentence = `${entry.title}, version in force on ${date}: ${word}, in force since ${row.in_force}.`;
    } else {
      // Empty the plain fields too, so no earlier answer's text or link stays in the hidden markup.
      for (const name of PLAIN_FIELDS) field(name).textContent = "";
      field("link").removeAttribute("href");
      field("kind").removeAttribute("data-kind");
      panel.setAttribute("data-state", "interim");
      panel.removeAttribute("data-commit");
      sentence = GEL.interim.render({ entry, date, reason: result.reason, data });
    }

    field("status").hidden = !plain;
    plainBox.hidden = !plain;
    interimBox.hidden = plain;
    document.getElementById("answer-sentence").textContent = sentence;
    panel.hidden = false;

    const detail = { entry, date, interval: plain ? result.interval : null, row: plain ? result.row : null, panel };
    for (const fn of hooks) {
      try {
        fn(detail);
      } catch (error) {
        console.error(error);
      }
    }
  };
})();
