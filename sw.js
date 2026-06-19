/* Service Worker — Dulcini Portal de Checklists
   Portal abre offline (app shell pré-cacheado). Demais recursos cacheados em
   tempo de execução na 1ª vez online. */
const CACHE = 'dulcini-menu-v1';
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './assets/dulcini-logo.png',
  './assets/dulcini-industria.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((resp) => { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {}); return resp; })
        .catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cacheado) => cacheado || fetch(req).then((resp) => {
      const copia = resp.clone();
      caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
      return resp;
    }).catch(() => cacheado))
  );
});
