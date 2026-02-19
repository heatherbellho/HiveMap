/* ------------------------------------------------------------
   Safe Service Worker for HiveMap
   - No skipWaiting()
   - No clients.claim()
   - No destructive activation
   - Stable updates
   - Offline caching
------------------------------------------------------------ */

const CACHE_NAME = 'hive-map-cache-v2.2.6';

const FILES_TO_CACHE = [
  'index.html',
  'manifest-v2.json',

  // Icons
  'icons/192-hive-map.png',
  'icons/512-hive-map.png',

  // Core app files
  'js/app.js',
  'js/storage.js',
  'js/helpContent.js',
  'js/subscription.js',
  'js/reports.js',
  'js/utils.js',
  'js/toolbar.js',
  'js/canvas.js',
  'js/apiaries.js',
  'js/hives.js',
  'js/modals.js',
  'js/status.js',
  'js/export.js',
  'js/version.js',
  'css/app.css'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// Activate: remove old caches (safe)
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
});

// Fetch: network-first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
