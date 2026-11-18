(function () {
  const GEL = (window.GEL = window.GEL || {});
  const HINT = "Enter a date in the form 2025-06-01.";
  const $ = (id) => document.getElementById(id);
  let refused = false;

  // Text and integer arithmetic only: the date field's own value is never trusted.
  function isDate(text) {
    if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
    const y = +text.slice(0, 4);
    const m = +text.slice(5, 7);
    const d = +text.slice(8, 10);
    if (y < 1 || m < 1 || m > 12 || d < 1) return false;
    const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    const days = m === 2 ? (leap ? 29 : 28) : m === 4 || m === 6 || m === 9 || m === 11 ? 30 : 31;
    return d <= days;
  }

  function today() {
    const t = new Date();
    const pad = (n, width) => String(n).padStart(width, "0");
    return `${pad(t.getFullYear(), 4)}-${pad(t.getMonth() + 1, 2)}-${pad(t.getDate(), 2)}`;
  }

  function hint(show) {
    const note = $("date-hint");
    const field = $("date");
    note.textContent = show ? HINT : "";
    note.hidden = !show;
    field.setAttribute("aria-invalid", show ? "true" : "false");
    field.setAttribute("aria-describedby", show ? "date-echo date-hint" : "date-echo");
  }

  GEL.dates = { isDate, today };
  GEL.date = null;

  GEL.setDate = function (text) {
    if (!isDate(text)) {
      refused = true;
      return false;
    }
    refused = false;
    GEL.date = text;
    const field = $("date");
    if (field.value !== text) field.value = text;
    $("date-echo").textContent = text;
    hint(false);
    if (GEL.chosen) GEL.showAnswer(GEL.chosen, text);
    return true;
  };

  // A date an address carried was refused (setDate returned false): the field is emptied and the message shows at once,
  // not after the field is left. GEL.date is null until a date is accepted; callers that draw an answer check for it.
  GEL.rejectDate = function () {
    refused = true;
    GEL.date = null;
    $("date").value = "";
    $("date-echo").textContent = "";
    hint(true);
  };

  GEL.dateLeft = function () {
    hint(refused);
  };

  GEL.initDate = function () {
    GEL.setDate(GEL.dates.today());
  };
})();
