(function () {
  const GEL = (window.GEL = window.GEL || {});
  const date = document.getElementById("date");
  const example = document.getElementById("example");

  GEL.initDate();
  const set = (event) => GEL.setDate(event.target.value);
  date.addEventListener("input", set);
  date.addEventListener("change", set);
  date.addEventListener("blur", () => GEL.dateLeft());
  example.addEventListener("click", () => GEL.pickExample());

  GEL.load().then(() => {
    example.disabled = false;
    date.disabled = false;
  }, GEL.loadFailed);
})();
