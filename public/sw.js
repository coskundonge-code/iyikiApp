// Service Worker for iyi ki - Progressive Web App
const CACHE_NAME = 'iyi-ki-v1';
const RUNTIME_CACHE = 'iyi-ki-runtime-v1';
const OFFLINE_PAGE = '/offline.html';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/home',
  '/offline.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network-first for API routes and dynamic content
  if (url.pathname.startsWith('/api/') || url.pathname.includes('?')) {
    return event.respondWith(networkFirst(request));
  }

  // Cache-first for static assets
  if (isStaticAsset(url.pathname)) {
    return event.respondWith(cacheFirst(request));
  }

  // Network-first for pages
  event.respondWith(networkFirst(request));
});

/**
 * Network-first strategy: try network, fall back to cache, then offline page
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[Service Worker] Network request failed, checking cache:', request.url);

    // Try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_PAGE) || new Response('Offline', { status: 503 });
    }

    // Return error response
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Cache-first strategy: use cache, fall back to network
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[Service Worker] Failed to fetch:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp'];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Handle messages from clients (for manual cache updates, skip waiting, etc.)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE).then(() => {
      console.log('[Service Worker] Runtime cache cleared');
    });
  }
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-gifts') {
    event.waitUntil(syncOfflineGifts());
  }

  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

/**
 * Sync offline gift actions
 */
async function syncOfflineGifts() {
  try {
    console.log('[Service Worker] Syncing offline gifts...');
    // Implementation would fetch pending gifts from IndexedDB and sync with server
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

/**
 * Sync notifications
 */
async function syncNotifications() {
  try {
    console.log('[Service Worker] Syncing notifications...');
    // Implementation would fetch notifications from server
  } catch (error) {
    console.error('[Service Worker] Notification sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'iyi-ki-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Aç',
        },
        {
          action: 'close',
          title: 'Kapat',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification('iyi ki', options));
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in clien