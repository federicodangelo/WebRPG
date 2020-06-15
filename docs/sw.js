const cacheId = "v3";
const cacheFetchs = false;
const allowNetwork = true;
const workerDebug = true;

const validCacheNames = [cacheId];

const contentRoot = "";

const coreContent = [
  "",
  "index.html",
  "bundle.js",
  "worker.js",
];

const assetsContentRoot = "res/";

const assetsContent = [
  "assets.json",
  "female1.png",
  "female2.png",
  "font9x14.png",
  "font16x16.png",
  "npc1.png",
  "npc2.png",
  "shadows.png",
  "terrain.png",
];

const externalContent = [
  "https://mrdoob.github.io/stats.js/build/stats.min.js",
];

function log(message, ...args) {
  if (workerDebug) console.debug("[Service Worker] " + message, ...args);
}

const cacheResources = async () => {
  const toCache = [];
  coreContent.forEach((c) => toCache.push(contentRoot + c));
  assetsContent.forEach((c) => toCache.push(assetsContentRoot + c));
  toCache.push(...externalContent);

  const cache = await caches.open(cacheId);
  log("Caching all app shell and content", toCache);
  return cache.addAll(toCache);
};

self.addEventListener("install", (event) => {
  log("Install");
  event.waitUntil(cacheResources());
});

const fetchFromCache = async (request) => {
  const cacheResponse = await caches.match(request);
  if (cacheResponse !== undefined) {
    log("Using cache entry for " + request.url);
    return cacheResponse;
  }
  if (!allowNetwork) {
    throw Error(
      "No cache entry for " + request.url +
        " and allowNetwork is false, request has failed",
    );
  }

  log(
    "No cache entry for " + request.url + ", will try to fetch from internet",
  );
  try {
    const onlineResponse = await fetch(request);
    log("Resource " + request.url + " fetched from the internet");
    if (cacheFetchs) {
      // response may be used only once
      // we need to save clone to put one copy in cache
      // and serve second one
      let responseClone = onlineResponse.clone();
      const cache = await caches.open(cacheId);
      log("Resource " + request.url + " cached");
      cache.put(request, responseClone);
    }
    return onlineResponse;
  } catch (error) {
    log(
      "Resource " + request.url +
        " failed to fetch from the internet, request has failed",
    );
    throw error;
  }
};

self.addEventListener("fetch", function (e) {
  log("Fetch " + e.request.url);
  e.respondWith(fetchFromCache(e.request));
});

// Remove old caches on activate
self.addEventListener("activate", function (event) {
  log("Activate");
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
          if (validCacheNames.indexOf(cacheName) < 0) {
            log("Deleting old cache : " + cacheName);
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
