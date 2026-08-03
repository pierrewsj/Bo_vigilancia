const CACHE_VERSION = 'bo-digital-gsp-v15-busca';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './pwa.js',
  './app.js',
  './manifest.json',
  './icon-96.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './assets/app-mark.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.tipo === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    const update = fetch(request, { cache: 'no-store' })
      .then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put('./index.html', response.clone());
        }
        return response;
      });

    event.respondWith((async () => {
      const cached = (await caches.match(request)) || (await caches.match('./index.html'));
      if (cached) return cached;
      try { return await update; }
      catch { return Response.error(); }
    })());
    event.waitUntil(update.catch(() => null));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(request);
    const update = fetch(request, { cache: 'no-store' })
      .then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
      .catch(() => null);
    return cached || (await update) || Response.error();
  })());
});
