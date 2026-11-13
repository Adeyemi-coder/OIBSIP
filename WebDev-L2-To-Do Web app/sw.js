/* TaskPulse service worker: offline app shell.
   Bump VERSION whenever you change any app file so everyone gets the update. */
const VERSION = "v3";
const SHELL = `taskpulse-shell-${VERSION}`;
const FONTS = "taskpulse-fonts";

const ASSETS = [
  "./", "./index.html", "./manifest.json",
  "./style.css", "./upgrade.css", "./extras.css", "./pwa.css",
  "./store.js", "./app.js", "./upgrade.js", "./extras.js", "./pwa.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // One missing file must not break the whole install.
    await Promise.allSettled(ASSETS.map((url) => cache.add(new Request(url, { cache: "reload" }))));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith("taskpulse-shell-") && n !== SHELL).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

async function pageResponse(request) {
  const cache = await caches.open(SHELL);
  try {
    const res = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(reject, 4000)),
    ]);
    if (res && res.ok) cache.put("./index.html", res.clone());
    return res;
  } catch {
    return (await cache.match("./index.html", { ignoreSearch: true }))
      || (await cache.match("./", { ignoreSearch: true }))
      || Response.error();
  }
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request, { ignoreSearch: cacheName === SHELL });
  const network = fetch(event.request)
    .then((res) => {
      if (res && (res.ok || res.type === "opaque")) cache.put(event.request, res.clone());
      return res;
    })
    .catch(() => null);
  event.waitUntil(network);
  return hit || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") { event.respondWith(pageResponse(request)); return; }
  if (url.origin === self.location.origin) { event.respondWith(staleWhileRevalidate(event, SHELL)); return; }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(event, FONTS));
  }
});