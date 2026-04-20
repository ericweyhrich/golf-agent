const CACHE_NAME = 'golf-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/golf-icon.jpg'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/index.html');
      })
  );
});

// Listen for sync events (background sync when connection restored)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-rounds') {
    event.waitUntil(syncRounds());
  }
});

// Background sync - send pending round data to cloud
async function syncRounds() {
  try {
    const pendingRounds = await getPendingRounds();

    for (const round of pendingRounds) {
      await uploadRound(round);
    }
  } catch (error) {
    console.error('Sync failed:', error);
    throw error; // Retry sync
  }
}

async function getPendingRounds() {
  // This will be called from the app to get rounds waiting to sync
  return [];
}

async function uploadRound(round) {
  // This will be implemented in the app to upload to cloud
  return fetch('/api/sync-round', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(round)
  });
}
