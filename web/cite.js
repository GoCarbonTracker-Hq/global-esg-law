(function () {
  const GEL = (window.GEL = window.GEL || {});
  const native = "CommandEvent" in window;
  let timer;
  let last = "";

  // The version row is the one whose commit is the covering interval's commit. Null unless the answer is plain.
  function build(detail, data) {
    if (detail.state !== "plain") return null;
    const { entry, date, interval } = detail;
    const row = entry.versions.find((v) => v.commit === interval.commit);
    const word = row.kind === "translation" ? "translation" : `${row.kind} version`;
    const when = row.date_basis
      ? `${word}, in-force date not recorded (published ${row.in_force})`
      : `${word} since ${row.in_force}`;
    const { read_on, history_commit } = data.snapshot;
    return `${entry.title}; in force on ${date}, ${when}; global-esg-law, corpus read ${read_on} (snapshot ${history_commit.slice(0, 9)}); ${row.source_url}`;
  }

  async function copy() {
    const status = document.getElementById("citation-status");
    let message = "Copied";
    try {
      await navigator.clipboard.writeText(document.getElementById("citation-line").textContent);
    } catch (error) {
      message = "Copy failed";
    }
    // A repeat of the last message gets a no-break space so a screen reader announces it again.
    if (message === last) message += "\xa0";
    last = message;
    status.textContent = message;
    clearTimeout(timer);
    timer = setTimeout(() => {
      status.textContent = "";
    }, 2000);
  }

  function draw(detail) {
    const slot = document.getElementById("slot-citation");
    slot.replaceChildren();
    const text = build(detail, GEL.data);
    if (text === null) return;
    const line = document.createElement("p");
    line.id = "citation-line";
    line.textContent = text;
    const button = document.createElement("button");
    button.id = "citation-copy";
    button.type = "button";
    button.setAttribute("command", "--copy");
    button.setAttribute("commandfor", "citation-line");
    button.textContent = "Copy citation";
    const status = document.createElement("span");
    status.id = "citation-status";
    status.setAttribute("role", "status");
    const actions = document.createElement("div");
    actions.className = "cite-actions";
    actions.append(button, status);
    slot.append(line, actions);
    if (native) {
      line.addEventListener("command", (event) => {
        if (event.command === "--copy") copy();
      });
    } else {
      button.addEventListener("click", copy);
    }
  }

  GEL.cite = { build, draw };
  GEL.onAnswer(draw);
  console.info(native ? "cite: invoker path" : "cite: fallback path");
})();
