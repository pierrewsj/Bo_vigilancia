const CACHE_NAME = 'bo-digital-gsp-v11-install-select-modals';
const APP_FILES = [
  './',
  './index.html',
  './index.html?source=pwa',
  './styles.css?v=11',
  './app.js?v=11',
  './manifest.webmanifest?v=11',
  './assets/favicon-48.png?v=11',
  './assets/apple-touch-icon.png?v=11',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-192.png',
  './assets/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin.includes('script.google.com') || url.origin.includes('googleusercontent.com')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(response => response || caches.match('./index.html')))
  );
});
