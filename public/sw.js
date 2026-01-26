// Thamara Service Worker - Full Offline Support
const CACHE_VERSION = 'v1';
const CACHE_NAME = `thamara-${CACHE_VERSION}`;
const RUNTIME_CACHE = `thamara-runtime-${CACHE_VERSION}`;
const MAP_TILES_CACHE = `thamara-map-tiles-${CACHE_VERSION}`;

// Critical app shell - pre-cached on install
const APP_SHELL = [
  '/',
  '/map',
  '/exchange',
  '/water',
  '/crop-plan',
  '/log-plot',
  '/assessment',
  '/welcome',
  '/manifest.json'
];

// Static assets - pre-cached on install
const STATIC_ASSETS = [
  '/thamara_logo.svg',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/window.svg',
  '/vercel.svg',
  '/agro-packs/demo-v1/manifest.json',
  '/agro-packs/demo-v1/plantability.geojson'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(APP_SHELL).catch(err => {
          console.warn('[SW] Failed to cache some app shell resources:', err);
        });
      }),
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Failed to cache some static assets:', err);
        });
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  const validCaches = [CACHE_NAME, RUNTIME_CACHE, MAP_TILES_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle OpenStreetMap tiles - cache as you browse
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(MAP_TILES_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // Return transparent tile for offline
            return new Response('', { status: 503, statusText: 'Offline' });
          });
        });
      })
    );
    return;
  }

  // Handle cross-origin requests (like external APIs)
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // Handle same-origin requests - cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        // Refresh cache in background for navigation requests
        if (request.mode === 'navigate') {
          event.waitUntil(
            fetch(request).then(response => {
              if (response && response.status === 200) {
                caches.open(RUNTIME_CACHE).then(cache => cache.put(request, response));
              }
            }).catch(() => {})
          );
        }
        return cachedResponse;
      }

      // Fetch from network and cache
      return fetch(request).then((response) => {
        // Only cache successful GET requests
        if (!response || response.status !== 200 || request.method !== 'GET') {
          return response;
        }

        // Determine which cache to use
        let targetCache = RUNTIME_CACHE;

        // Cache Next.js bundles and static assets
        if (
          url.pathname.startsWith('/_next/') ||
          url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/)
        ) {
          targetCache = CACHE_NAME;
        }

        // Cache images and media
        if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
          targetCache = CACHE_NAME;
        }

        // Cache app pages and routes
        if (
          url.pathname === '/' ||
          url.pathname.startsWith('/map') ||
          url.pathname.startsWith('/exchange') ||
          url.pathname.startsWith('/water') ||
          url.pathname.startsWith('/crop-plan') ||
          url.pathname.startsWith('/log-plot') ||
          url.pathname.startsWith('/assessment') ||
          url.pathname.startsWith('/welcome') ||
          url.pathname.startsWith('/rainready') ||
          url.pathname.startsWith('/drops')
        ) {
          targetCache = RUNTIME_CACHE;
        }

        // Clone and cache the response
        const responseToCache = response.clone();
        event.waitUntil(
          caches.open(targetCache).then((cache) => {
            cache.put(request, responseToCache);
          })
        );

        return response;
      }).catch(() => {
        // Offline fallback
        // Try to return the main page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/').then(fallback => {
            return fallback || new Response(
              '<html><body><h1>Offline</h1><p>Thamara is offline. Please check your connection.</p></body></html>',
              { status: 503, headers: { 'Content-Type': 'text/html' } }
            );
          });
        }

        // For other requests, return a generic offline response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map(name => caches.delete(name)));
      })
    );
  }
});

// Background sync for future implementation
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  // Future: Sync plot data, exchange listings, etc.
});
