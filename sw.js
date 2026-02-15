const cacheName = 'hive-map-cache-v2.2.4';

const filesToCache = [
  'index.html',
  'manifest-v2.json',

  // Icons
  'icons/192-hive-map.png',
  'icons/512-hive-map.png',

  // Core app files
  'js/app.js',
  'js/storage.js',
  'js/utils.js',
  'js/toolbar.js',
  'js/canvas.js',
  'js/apiaries.js',
  'js/hives.js',
  'js/modals.js',
  'js/status.js',
  'js/export.js',
  'js/stats.js',
  'js/version.js',
  'css/app.css'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== cacheName && caches.delete(key)))
    )
  );
  clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

