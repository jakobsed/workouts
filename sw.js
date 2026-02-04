const CACHE_NAME = 'fitapp-v6';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './active-workout.html',
    './create-exercise.html',
    './create-workout-exercises.html',
    './create-workout.html',
    './edit-workout.html',
    './exercises.html',
    './settings.html',
    './workout-complete.html',
    './workout-preview.html',
    './manifest.json',
    './css/core/base.css',
    './css/core/reset.css',
    './css/core/variables.css',
    './css/components/add-sheet.css',
    './css/components/bottom-nav.css',
    './css/components/calendar.css',
    './css/components/header.css',
    './css/components/ios-list.css',
    './css/pages/active-workout.css',
    './css/pages/create-workout.css',
    './css/pages/workout.css',
    './js/core/pwa.js',
    './js/core/utils.js',
    './js/components/add-sheet.js',
    './js/components/calendar.js',
    './js/pages/active-workout.js',
    './js/pages/create-exercise.js',
    './js/pages/create-workout-exercises.js',
    './js/pages/create-workout.js',
    './js/pages/edit-workout.js',
    './js/pages/exercises.js',
    './js/pages/settings.js',
    './js/pages/workout-complete.js',
    './js/pages/workout-preview.js',
    './js/pages/workout.js'
];

// Install Event: Cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    // Force activation immediately
    self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Claim clients immediately so the first load is controlled
    self.clients.claim();
});

// Fetch Event: network-first for HTML, cache-first for assets, or stale-while-revalidate?
// For maximum speed "Cache First" is best, but updates are harder.
// Let's use Stale-While-Revalidate strategy for most things to ensure freshness but speed.

self.addEventListener('fetch', (event) => {
    // Ignore non-http requests (like data: or chrome-extension:)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response immediately if found
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Update cache with new version
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // Network failed? Return nothing (or offline page if we had one)
            });

            return cachedResponse || fetchPromise;
        })
    );
});
