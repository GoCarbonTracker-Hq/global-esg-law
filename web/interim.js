(function () {
  const GEL = (window.GEL = window.GEL || {});

  // The seven sentences and the later line. Page text, not data: they are written from EMPTY_CASES in tools/query.py.
  // The page applies no date rules: V2 and V4 are one state in the data, told apart by one text compare with read_on.
  const T = {
    v1: (d) => `The corpus stores no text of this law, only a link to it, so it cannot say which version applied on ${d}.`,
    v2: (f, d) => `The earliest stored version of this law starts on ${f}, after ${d}; the corpus has no record that early, and the law may still have been in force.`,
    v2p: (f, d) => `The earliest stored version of this law has a publication date of ${f}, after ${d}; the corpus does not record when it entered into force, and the law may still have been in force.`,
    v4: (f, d) => `This law was not yet in force on ${d}; its first stored version starts on ${f}.`,
    v5: (text) => `No law in the corpus matches "${text}"; this does not mean no such law exists.`,
    v6: (published) => `The corpus does not record when this version entered into force; ${published} is the date it was published, so it may have started later.`,
    later: (readOn) => `The corpus was read on ${readOn}. Later changes are not in it.`,
  };

  function part(tag, name, text) {
    const el = document.createElement(tag);
    el.setAttribute("data-part", name);
    el.textContent = text;
    return el;
  }

  function official(entry) {
    const link = part("a", "source", "Official source (opens in a new tab)");
    link.setAttribute("href", entry.official_url);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener");
    return link;
  }

  function offer(first) {
    const button = part("button", "offer", `Show ${first}`);
    button.setAttribute("type", "button");
    button.addEventListener("click", () => {
      GEL.setDate(first);
      document.getElementById("date").focus();
    });
    return button;
  }

  function browse() {
    const link = part("a", "browse", "Browse by place");
    link.setAttribute("href", "#browse-by-place");
    return link;
  }

  GEL.interim = {
    v6: T.v6,
    later: T.later,

    // Fills #answer-interim and returns the hidden sentence. The repealed status line is filled here too.
    render({ entry, date, reason, data, text }) {
      const nodes = [];
      let sentence;
      if (reason === "no-match") {
        sentence = T.v5(text);
        nodes.push(part("span", "text", sentence), browse());
      } else if (reason === "repealed") {
        const interval = GEL.coveringInterval(entry, date);
        const row = entry.versions.find((v) => v.commit === interval.commit);
        const status = `Repealed on ${interval.from}`;
        document.querySelector('[data-field="status"]').textContent = status;
        sentence = `${entry.title}: ${status}.`;
        if (row && row.message) {
          nodes.push(part("span", "message", row.message));
          sentence += ` ${row.message}`;
        }
        nodes.push(official(entry));
      } else {
        // link-only, and "other", which never occurs on real data and takes the link-only sentence
        const first = reason === "before-first" ? entry.intervals[0].from : null;
        const late = first !== null && first > data.snapshot.read_on;
        // V2 reads differently when the first stored row has only a publication date (date_basis).
        const dated = first !== null && entry.versions.find((v) => v.commit === entry.intervals[0].commit)?.date_basis;
        const line = first === null ? T.v1(date) : late ? T.v4(first, date) : (dated ? T.v2p : T.v2)(first, date);
        sentence = `${entry.title}: ${line}`;
        nodes.push(part("span", "text", line));
        if (first !== null) nodes.push(offer(first));
        nodes.push(official(entry));
      }
      document.getElementById("answer-interim").replaceChildren(...nodes);
      return sentence;
    },
  };
})();
