const CACHE_NAME = 'thamara-v1';
const RUNTIME_CACHE = 'thamara-runtime-v1';

const APP_SHELL = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    return;
  }

  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request.clone())
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            if (request.method === 'GET' && (
              url.pathname.startsWith('/_next/') ||
              url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?)$/) ||
              url.pathname === '/' ||
              url.pathname.startsWith('/map') ||
              url.pathname.startsWith('/exchange') ||
              url.pathname.startsWith('/water') ||
              url.pathname.startsWith('/crop-plan')
            )) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE)
                .then((cache) => cache.put(request, responseToCache));
            }

            return response;
          })
          .catch(() => {
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
