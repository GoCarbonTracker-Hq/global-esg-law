(function () {
  const GEL = (window.GEL = window.GEL || {});
  GEL.DATA_PATH = "law-data.json";

  const FAILED = "The law list did not load. Reload the page, or use the commands in the README.";
  const README = "https://github.com/GoCarbonTracker-Hq/global-esg-law";
  const text = (v) => typeof v === "string" && v !== "";

  function say(...nodes) {
    const el = document.getElementById("load-status");
    if (el) el.replaceChildren(...nodes);
  }

  function showFailure() {
    const reload = document.createElement("a");
    reload.id = "reload";
    reload.setAttribute("href", "");
    reload.textContent = "Reload";
    reload.addEventListener("click", (e) => {
      e.preventDefault();
      location.reload();
    });
    const readme = document.createElement("a");
    readme.setAttribute("href", README);
    readme.textContent = "README";
    say(FAILED, " ", reload, " ", readme);
  }

  function check(d) {
    const s = d && d.snapshot;
    if (!s || !text(s.history_commit) || !text(s.read_on) || !text(d.notice) || !Array.isArray(d.entries)) {
      throw new Error("law-data.json is missing snapshot.history_commit, snapshot.read_on, notice or entries");
    }
  }

  // Nothing reaches GEL.data or GEL.byId until the whole file has passed.
  GEL.load = async function () {
    say("Loading the law list");
    try {
      const res = await fetch(GEL.DATA_PATH);
      if (res.status !== 200) throw new Error(`${GEL.DATA_PATH} returned status ${res.status}`);
      const data = await res.json();
      check(data);
      const byId = Object.create(null);
      for (const entry of data.entries) byId[entry.id] = entry;
      GEL.data = data;
      GEL.byId = byId;
      say();
    } catch (err) {
      delete GEL.data;
      delete GEL.byId;
      showFailure();
      throw err;
    }
  };

  GEL.loadFailed = function () {
    for (const id of ["example", "date"]) {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    }
    const panel = document.getElementById("answer-panel");
    if (panel) panel.hidden = true;
  };
})();
