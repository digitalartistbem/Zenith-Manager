const CACHE_NAME = 'zenith-life-manager-v3';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.json',

  // Scripts - Caching all source files for offline availability
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/hooks/useAppData.tsx',
  '/components/Icons.tsx',
  '/components/Sidebar.tsx',
  '/components/Dashboard.tsx',
  '/components/Budget.tsx',
  '/components/Projects.tsx',
  '/components/CalendarView.tsx',
  '/components/Contacts.tsx',
  '/components/Wellbeing.tsx',
  '/components/Journals.tsx',

  // External Resources
  'https://cdn.tailwindcss.com',
  'https://rsms.me/inter/inter.css'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching all app files.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache first strategy
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
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