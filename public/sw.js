const CACHE_NAME = "wortkarte-shell-v10";
const APP_SHELL = [
  "/",
  "/index.html",
  "/logo.png",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/ocr/worker.min.js",
  "/ocr/tesseract-core-simd-lstm.wasm.js",
  "/ocr/tesseract-core-simd-lstm.wasm",
  "/ocr/deu.traineddata",
  "/ocr/eng.traineddata",
  "/ocr/vie.traineddata"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(async () => {
        const cache = await caches.open(CACHE_NAME);
        const index = await cache.match("/index.html");
        const html = await index.text();
        const assets = [...html.matchAll(/(?:src|href)=["']([^"']*\/assets\/[^"']+)["']/g)]
          .map(([, path]) => path);
        if (assets.length) await cache.addAll(assets);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("wortkarte-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put("/index.html", response.clone());
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/index.html")))
    );
    return;
  }

  // Logo/favicon/manifest luôn lấy bản mới khi có mạng, để bấm "Cập nhật" là đổi theo ngay.
  const isBrandAsset =
    url.pathname === "/logo.png" ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.startsWith("/icons/");
  if (isBrandAsset) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
            );
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/ocr/") ||
    APP_SHELL.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            // Clone ngay trước khi trả response: clone trong callback có thể bị
            // "Response body is already used" khi trình duyệt đã đọc body.
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
            );
          }
          return response;
        });
      })
    );
  }
});
