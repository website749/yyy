// public/sw.js
const CACHE_NAME = 'app-cache-v3'; // 👈 រាល់ពេល deploy ថ្មី ប្តូរ v3 → v4, v5...

self.addEventListener('install', (event) => {
  self.skipWaiting(); // បង្ខំឲ្យ SW ថ្មី activate ភ្លាម មិនរង់ចាំ tab ចាស់បិទ
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // លុប cache ចាស់ទាំងអស់ដែលមិនមែន version ថ្មី
      const names = await caches.keys();
      await Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
      await self.clients.claim(); // គ្រប់គ្រង tab ដែលបើករួចហើយភ្លាមៗ
    })()
  );
});

self.addEventListener('fetch', (event) => {
  // Network-First សម្រាប់ HTML: ទាញថ្មីជាដំបូង ប្រើ cache តែពេល offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  // ទំព័រផ្សេង (js, css, images) ប្រើ cache ប៉ុន្តែ update នៅពីក្រោយ
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});