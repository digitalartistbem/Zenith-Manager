const CACHE_NAME = 'zenith-life-manager-v3'; // Bump version to force update

// All the files that make up the app shell
const APP_SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './vite.svg',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './services/geminiService.ts',
  './hooks/useAppData.tsx',
  './components/Budget.tsx',
  './components/CalendarView.tsx',
  './components/Contacts.tsx',
  './components/Dashboard.tsx',
  './components/Icons.tsx',
  './components/Journals.tsx',
  './components/Projects.tsx',
  './components/Sidebar.tsx',
  './components/Wellbeing.tsx'
];

self.addEventListener('install', event => {
  // skipWaiting() forces the waiting service worker to become the
  // active service worker.
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        // It's important to cache the app shell on install
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

self.addEventListener('activate', event => {
  // clients.claim() tells the active service worker to take immediate
  // control of all of the clients under its scope.
  event.waitUntil(clients.claim());

  // Clean up old caches
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy: For local TS/TSX files, go network-first to get updates,
  // but fix the MIME type. Fall back to cache if network fails.
  if (url.origin === self.location.origin && (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx'))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response.ok) {
            // If the network request fails, fall back to the cache.
            return caches.match(request).then(cachedResponse => {
              if (cachedResponse) return cachedResponse;
              // If not in cache either, return the original failed response
              return response; 
            });
          }

          // Create a clone of the response to modify headers
          const newHeaders = new Headers(response.headers);
          // This is the key fix: serve TS/TSX files as JavaScript
          newHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
          
          const newResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
          });

          // Cache the modified response for offline use
          const responseToCache = newResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });

          return newResponse;
        })
        .catch(() => {
          // If network fails completely (e.g., offline), try to serve from cache.
          return caches.match(request);
        })
    );
    return;
  }

  // Strategy: For all other requests (HTML, CSS, external scripts),
  // use a cache-first approach.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Return from cache if found
      if (cachedResponse) {
        return cachedResponse;
      }
      // Otherwise, fetch from network and cache for next time
      return fetch(request).then(networkResponse => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});