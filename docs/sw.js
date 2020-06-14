const cacheId = "v1";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(cacheId).then(function (cache) {
      return cache.addAll([
        "/WebRPG/index.html",
        "/WebRPG/bundle.js",
        "/WebRPG/worker.js",
        "/WebRPG/res/assets.json",
        "/WebRPG/res/female1.png",
        "/WebRPG/res/female2.png",
        "/WebRPG/res/font9x14.png",
        "/WebRPG/res/font16x16.png",
        "/WebRPG/res/npc1.png",
        "/WebRPG/res/npc2.png",
        "/WebRPG/res/shadows.png",
        "/WebRPG/res/terrain.png",
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

          caches.open(cacheId).then(function (cache) {
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
