(function () {
  const GEL = (window.GEL = window.GEL || {});

  GEL.EXAMPLE = { id: "eu-csrd-2022-2464", date: "2025-06-01" };
  GEL.chosen = null;

  GEL.choose = function (id) {
    if (!Object.hasOwn(GEL.byId, id)) throw new Error(`Unknown law id: ${id}`);
    GEL.chosen = id;
    document.getElementById("law").value = GEL.byId[id].title;
  };

  GEL.pickExample = function () {
    GEL.choose(GEL.EXAMPLE.id);
    GEL.setDate(GEL.EXAMPLE.date);
  };
})();
