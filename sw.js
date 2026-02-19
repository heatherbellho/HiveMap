/* ------------------------------------------------------------
   HiveMap Instant-Update Service Worker (Option A)
   - Always loads fresh JS (no stale code)
   - Updates immediately on deploy
   - Keeps offline support for static assets
------------------------------------------------------------ */

const CACHE_NAME = 'hivemap-static-v1';

// Only cache static, non-JS assets
const STATIC_ASSETS = [
  'index.html',
  'manifest-v2.json',

  // Icons
  'icons/192-hive-map.png',
  'icons/512-hive-map.png',

  // CSS
  'css/app.css'
];

// Install: cache static assets
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate: take control immediately and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always fetch JS fresh (never cache)
  if (url.pathname.endsWith('.js')) {
    return event.respondWith(fetch(event.request));
  }

  // Network-first for everything else, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache static assets
        if (STATIC_ASSETS.includes(url.pathname)) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
