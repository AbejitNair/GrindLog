const CACHE_NAME = 'grindlog-v3';
const urlsToCache = [
  '/GrindLog/',
  '/GrindLog/index.html',
  '/GrindLog/manifest.json',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(name => { if(name !== CACHE_NAME) return caches.delete(name); })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.pathname === '/GrindLog/' || url.pathname === '/GrindLog/index.html') {
    event.respondWith(
      fetch(event.request)
        .then(res => { const clone=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(event.request,clone)); return res; })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(res => {
      if(res) return res;
      return fetch(event.request).then(netRes => {
        if(netRes && netRes.status===200){ const clone=netRes.clone(); caches.open(CACHE_NAME).then(c=>c.put(event.request,clone)); }
        return netRes;
      });
    })
  );
});
