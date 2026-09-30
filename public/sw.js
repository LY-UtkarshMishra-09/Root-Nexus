const CACHE_NAME = 'rootnexus-v1';
const PRECACHE_ASSETS = [
  '/',
  '/schedule',
  '/attendance',
  '/food',
  '/notes',
  '/todos',
  '/marks',
  '/calendar',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching partial assets in development:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stale-while-revalidate / Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET or cross-origin requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // API calls bypass service worker cache
  if (request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback to cache when offline (e.g. inside Lecture Theatre basements)
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

