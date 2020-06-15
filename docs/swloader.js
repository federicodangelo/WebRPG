if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js", { scope: "./" })
    .then((reg) => {
      console.debug(
        "Service worker registration succeeded. Scope is " + reg.scope,
      );
    }).catch((error) => {
      console.debug("Service worker registration failed with " + error);
    });
}
