const SW_VERSION = "2026-03-16-cache-v5";
const STATIC_CACHE = `tfabian-static-${SW_VERSION}`;
const RUNTIME_CACHE = `tfabian-runtime-${SW_VERSION}`;
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/logo-tacos-fabian.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];
const RUNTIME_CACHE_LIMIT = 40;

async function trimRuntimeCache() {
  const cache = await caches.open(RUNTIME_CACHE);
  const requests = await cache.keys();
  const overflow = requests.length - RUNTIME_CACHE_LIMIT;
  if (overflow <= 0) return;

  await Promise.all(requests.slice(0, overflow).map((request) => cache.delete(request)));
}

function canBeCached(request, response) {
  if (!response || !response.ok) return false;
  if (request.method !== "GET") return false;
  if (response.type === "error") return false;
  const cacheControl = response.headers.get("cache-control") || "";
  if (/no-store|private/i.test(cacheControl)) return false;
  return true;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key)));
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
      await trimRuntimeCache();
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (request.headers.has("range")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (/\.(mp4|webm|mov|mp3|wav)$/i.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            if (canBeCached(request, preloadResponse)) {
              const cache = await caches.open(RUNTIME_CACHE);
              await cache.put(request, preloadResponse.clone());
            }
            return preloadResponse;
          }

          const response = await fetch(request, { cache: "no-store" });
          if (canBeCached(request, response)) {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put(request, response.clone());
            void trimRuntimeCache();
          }
          return response;
        } catch {
          return (await caches.match(request)) || caches.match("/");
        }
      })()
    );
    return;
  }

  const isStaticAsset = /\.(css|js|json|ico|svg|png|jpg|jpeg|webp|avif|woff2?)$/i.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);

        const networkFetch = fetch(request, { cache: "no-store" })
          .then(async (response) => {
            if (canBeCached(request, response)) {
              const cache = await caches.open(RUNTIME_CACHE);
              await cache.put(request, response.clone());
              void trimRuntimeCache();
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })()
    );
    return;
  }

  event.respondWith(
    fetch(request, { cache: "no-store" })
      .then(async (response) => {
        if (canBeCached(request, response)) {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(request, response.clone());
          void trimRuntimeCache();
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
