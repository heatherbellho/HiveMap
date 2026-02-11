const cacheName = 'hive-map-cache-v2.2.1';

const filesToCache = [
  './',
  './index.html',
  './manifest.json',

  // Icons (must match manifest)
  './icons/192_hive-map.png',
  './icons/512_hive-map.png',

  // Core app files
  './app.js',
  './storage.js',
  './utils.js',
  './toolbar.js',
  './canvas.js',
  './notes.js',
  './apiaries.js',
  './hives.js',
  './modals.js',
  './status.js',
  './notes.js',
  './export.js',
  './stats.js',
  './version.js',
  './css/app.css',

  // External libs
  'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js'
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

