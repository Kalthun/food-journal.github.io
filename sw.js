// sw.js — v1
// Network-first strategy: always try to fetch fresh from network,
// fall back to cache only if offline.

const CACHE = 'food-journal-v1';

self.addEventListener('install', event => {
  // Activate immediately, don't wait for old SW to finish
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Take control of all open clients immediately
  event.waitUntil(clients.claim());
  // Clean up any old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Got a fresh response — clone it into cache and return it
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => {
        // Network failed (offline) — fall back to cache
        return caches.match(event.request);
      })
  );
});
