const CACHE_NAME = 'app-cache-v4'; // 👈 ប្តូរ version! (ពី v3 → v4)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // ✅ ត្រឹមត្រូវ GET ប៉ុណ្ណោះ — កែ error "POST is unsupported"
  if (req.method !== 'GET') return;

  // ✅ HTML: Network-First ទាញថ្មីជាដំបូង cache តែពេល offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // ✅ Assets (js/css/images): cache-first ប៉ុន្តែ update នៅពីក្រោយ
  event.respondWith(
    caches.match(req).then(cached => {
      const fetched = fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});