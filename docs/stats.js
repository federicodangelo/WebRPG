var script = document.createElement("script");
var reqHandler = -1;

globalThis.statsPaused = true;
script.onload = function () {
  var stats = new Stats();

  function loop() {
    stats.update();
    reqHandler = requestAnimationFrame(loop);
  }

  globalThis.pauseStats = () => {
    if (!globalThis.statsPaused) {
      globalThis.statsPaused = true;
      document.body.removeChild(stats.dom);
      cancelAnimationFrame(reqHandler);
    }
  };
  globalThis.resumeStats = () => {
    if (globalThis.statsPaused) {
      globalThis.statsPaused = false;
      document.body.appendChild(stats.dom);
      reqHandler = requestAnimationFrame(loop);
    }
  };
};
script.src = "//mrdoob.github.io/stats.js/build/stats.min.js";
document.head.appendChild(script);
