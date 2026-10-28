"use strict";

const CACHE = "verdant-v2"; 
const FILES = [
  "./", "index.html", "style.css", "formulas.js", "script.js", "tools.js",
  "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"
];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
const NETWORK_TIMEOUT = 3500;               // on a bad connection, fall back to the saved copy after 3.5 seconds

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // One missing file must not stop the install, so each file is added on its own
      return Promise.all(FILES.map(function (file) { return cache.add(file).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (name) { return name.indexOf("verdant-") === 0 && name !== CACHE; })
        .map(function (name) { return caches.delete(name); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function networkFirst(request, isPage) {
  return caches.open(CACHE).then(function (cache) {
    const network = fetch(request).then(function (response) {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    });
    const timeout = new Promise(function (resolve) { setTimeout(function () { resolve(null); }, NETWORK_TIMEOUT); });
    return Promise.race([network.catch(function () { return null; }), timeout]).then(function (first) {
      if (first) return first;
      return cache.match(request, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (isPage) return cache.match("index.html").then(function (page) { return page || cache.match("./"); }).then(function (page) { return page || network; });
        return network;
      });
    });
  });
}

function cacheFirst(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (response) {
        if (response && (response.ok || response.type === "opaque")) cache.put(request, response.clone());
        return response;
      });
    });
  });
}

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, request.mode === "navigate"));
  } else if (FONT_HOSTS.indexOf(url.hostname) !== -1) {
    event.respondWith(cacheFirst(request));
  }
});