const cacheId = "v2";
const cacheFetchs = false;
const validCacheNames = [cacheId];

const contentRoot = "";

const coreContent = [
  "index.html",
  "bundle.js",
  "worker.js",
];

const assetsContnet = [
  "res/assets.json",
  "res/female1.png",
  "res/female2.png",
  "res/font9x14.png",
  "res/font16x16.png",
  "res/npc1.png",
  "res/npc2.png",
  "res/shadows.png",
  "res/terrain.png",
];

self.addEventListener("install", function (e) {
  console.debug("[Service Worker] Install");
  const toCache = [];
  coreContent.forEach((c) => toCache.push(contentRoot + c));
  assetsContnet.forEach((c) => toCache.push(contentRoot + c));
  e.waitUntil(
    caches.open(cacheId)
      .then(function (cache) {
        console.debug(
          "[Service Worker] Caching all app shell and content",
          toCache,
        );
        return cache.addAll(toCache);
      }),
  );
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      console.debug("[Service Worker] Fetching resource: " + e.request.url);
      if (response !== undefined) {
        return response;
      } else {
        return fetch(e.request).then(function (response) {
          if (cacheFetchs) {
            // response may be used only once
            // we need to save clone to put one copy in cache
            // and serve second one
            let responseClone = response.clone();
            caches.open(cacheId).then(function (cache) {
              console.debug(
                "[Service Worker] Caching new resource: " + e.request.url,
              );
              cache.put(e.request, responseClone);
            });
          }
          return response;
        });
      }
    }),
  );
});

// Remove old caches on activate
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
          if (validCacheNames.indexOf(cacheName) < 0) {
            console.debug(
              "[Service Worker] Deleting old cache : " + cacheName,
            );
            return true;
          } else {
            return false;
          }
        }).map(function (cacheName) {
          return caches.delete(cacheName);
        }),
      );
    }),
  );
});
