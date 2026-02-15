const CACHE_NAME = 'levelup-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/logo.png',
    '/levelup-withtext.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first for Navigation/API, cache-first for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 0. Ignore non-GET requests (POST, PUT, DELETE, etc.)
    if (request.method !== 'GET') return;

    // 1. Navigation (HTML) & API -> Network First
    // Ensures we always get the latest index.html (with new asset hashes)
    if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html' || url.pathname.startsWith('/api')) {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
        return;
    }

    // 2. Static Assets (JS, CSS, Images) -> Cache First
    // (We rely on unique hashes in filenames for invalidation)
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                // Only cache successful responses
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});
