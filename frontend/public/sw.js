const CACHE_NAME = 'swiftdl-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/logo.png',
    '/manifest.json'
];
const RUNTIME_CACHE = 'swiftdl-runtime-v2';

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SwiftDL: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((err) => {
                console.log('SwiftDL: Cache failed', err);
            })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('SwiftDL: Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and API calls
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }
    const url = new URL(event.request.url);
    const isSameOrigin = url.origin === self.location.origin;
    const isAsset = isSameOrigin && url.pathname.startsWith('/assets/');
    const isAppShell = isSameOrigin && urlsToCache.includes(url.pathname);

    if (isAsset) {
        event.respondWith(
            caches.open(RUNTIME_CACHE).then((cache) =>
                cache.match(event.request).then((cached) => {
                    if (cached) return cached;
                    return fetch(event.request).then((response) => {
                        if (response && response.status === 200) {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    });
                })
            )
        );
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put('/', responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match('/').then((response) => response || caches.match('/index.html'));
                })
        );
        return;
    }

    if (isAppShell) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((response) => {
                    const responseClone = response.clone();
                    if (response.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }
});
