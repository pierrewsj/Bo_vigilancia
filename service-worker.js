const CACHE_NAME = 'bo-digital-gsp-v9-menu-login-google-sheets';
const APP_FILES = [
  './',
  './index.html',
  './index.html?v=9',
  './styles.css',
  './styles.css?v=9',
  './app.js',
  './app.js?v=9',
  './manifest.webmanifest',
  './manifest.webmanifest?v=9',
  './assets/app-mark.svg',
  './assets/app-mark.svg?v=9',
  './assets/icon-192.png',
  './assets/icon-192.png?v=9',
  './assets/icon-512.png',
  './assets/icon-512.png?v=9'
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
