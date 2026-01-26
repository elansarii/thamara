const CACHE_NAME = 'thamara-v1';
const RUNTIME_CACHE = 'thamara-runtime-v1';
const MAP_TILES_CACHE = 'thamara-map-tiles-v1';
const AGRO_PACK_CACHE = 'thamara-agro-packs-v1';

const APP_SHELL = [
  '/',
  '/manifest.json'
];

const AGRO_PACK_FILES = [
  '/agro-packs/demo-v1/manifest.json',
  '/agro-packs/demo-v1/plantability.geojson'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(AGRO_PACK_CACHE).then((cache) =>
        cache.addAll(AGRO_PACK_FILES).catch(err => console.log('Agro pack pre-cache failed:', err))
      )
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_NAME, RUNTIME_CACHE, MAP_TILES_CACHE, AGRO_PACK_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle OpenStreetMap tiles
  if (url.hostname.includes('openstreetmap.org') && url.pathname.includes('.png')) {
    event.respondWith(
      caches.open(MAP_TILES_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // Return a placeholder or last cached tile
            return new Response('', { status: 503 });
          });
        });
      })
    );
    return;
  }

  // Handle agro-pack resources
  if (url.origin === location.origin && url.pathname.includes('/agro-packs/')) {
    event.respondWith(
      caches.open(AGRO_PACK_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle same-origin requests
  if (url.origin !== location.origin) {
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
              url.pathname.startsWith('/crop-plan') ||
              url.pathname.startsWith('/log-plot') ||
              url.pathname.startsWith('/assessment') ||
              url.pathname.startsWith('/welcome')
            )) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE)
                .then((cache) => cache.put(request, responseToCache));
            }

            return response;
          })
          .catch(() => {
            // Return cached page if available, otherwise show offline message
            return caches.match('/').then(fallback => fallback || new Response(
              '<html><body><h1>Offline</h1><p>This page is not cached yet.</p></body></html>',
              { status: 503, headers: { 'Content-Type': 'text/html' } }
            ));
          });
      })
  );
});
