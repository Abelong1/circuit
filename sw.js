// Circuit service worker. App code is network-first so updates show immediately;
// the saved copy is only used offline. Never caches Supabase data.
const V = 'circuit-v28';
const SHELL = ['/', '/logo.js?v=21', '/pages.js?v=3', '/manifest.webmanifest', '/icon-192.png',
  '/icon-maskable-192.png', '/apple-touch-icon.png', '/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim()));
});

function fresh(req, key) {
  return fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(V).then(c => c.put(key || req, copy)).catch(() => {}); }
    return r;
  }).catch(() => caches.match(key || req));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co')) return;

  if (req.mode === 'navigate') { e.respondWith(fresh(req, '/')); return; }

  // our own scripts, styles and manifest: always try the network first
  if (url.origin === location.origin && /\.(js|css|webmanifest)$/.test(url.pathname)) {
    e.respondWith(fresh(req)); return;
  }

  // images and fonts: cache first
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok && (url.origin === location.origin || r.type === 'cors')) {
        const copy = r.clone();
        caches.open(V).then(c => c.put(req, copy)).catch(() => {});
      }
      return r;
    }).catch(() => hit)));
});
