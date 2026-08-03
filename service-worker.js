const CACHE_NAME = 'bo-digital-gsp-v7-fix-icones';
const APP_FILES = [
  './',
  './index.html',
  './index.html?v=7',
  './styles.css',
  './styles.css?v=7',
  './app.js',
  './app.js?v=7',
  './manifest.webmanifest',
  './manifest.webmanifest?v=7',
  './assets/app-mark.svg',
  './assets/app-mark.svg?v=7',
  './assets/icon-192.png',
  './assets/icon-192.png?v=7',
  './assets/icon-512.png',
  './assets/icon-512.png?v=7'
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
