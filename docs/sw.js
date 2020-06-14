self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("v1").then(function (cache) {
      return cache.addAll([
        "/",
        "/index.html",
        "/bundle.js",
        "/worker.js",
        "/res/assets.json",
        "/res/female1.png",
        "/res/female2.png",
        "/res/font9x14.png",
        "/res/font16x16.png",
        "/res/npc1.png",
        "/res/npc2.png",
        "/res/shadows.png",
        "/res/terrain.png",
      ]);
    }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // caches.match() always resolves
      // but in case of success response will have value
      if (response !== undefined) {
        return response;
      } else {
        return fetch(event.request).then(function (response) {
          // response may be used only once
          // we need to save clone to put one copy in cache
          // and serve second one
          let responseClone = response.clone();

          caches.open("v1").then(function (cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        });
        //.catch(function () {
        //  return caches.match("/sw-test/gallery/myLittleVader.jpg");
        //});
      }
    }),
  );
});
