(function () {
  const GEL = (window.GEL = window.GEL || {});
  const SENTENCE = "This build answers only the plain in-force case. For this date use the command line (see the README).";

  // Story 06 replaces this file. One job: fill #answer-interim, return the hidden sentence.
  GEL.interim = {
    render(ctx) {
      document.getElementById("answer-interim").textContent = SENTENCE;
      return `${ctx.entry.title}: ${SENTENCE}`;
    },
  };
})();
