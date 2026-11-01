// Offline support for the installed app. Built by tools/build.js: do not edit by hand.
const CACHE = 'wdmmg-70f8f3daf01f';
const MINE = /^wdmmg-[0-9a-f]{12}$/;
const FILES = ["./","index.html","fonts.css","manifest.webmanifest","fonts/DMMono-400-latin-ext.woff2","fonts/DMMono-400-latin.woff2","fonts/DMMono-500-latin-ext.woff2","fonts/DMMono-500-latin.woff2","fonts/Doto-600-latin-ext.woff2","fonts/Doto-600-latin.woff2","fonts/Manrope-400-latin-ext.woff2","fonts/Manrope-400-latin.woff2","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => MINE.test(k) && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// The page itself: the newest copy when online (so updates arrive), the saved copy when offline or slow.
// Everything else (fonts, icons): the saved copy first.
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const net = fetch(r).then((res) => { if (res.ok) c.put('index.html', res.clone()); return res; });
      net.catch(() => {});
      const slow = new Promise((ok) => setTimeout(ok, 4000));
      try { const res = await Promise.race([net, slow]); if (res) return res; } catch (err) {}
      return (await c.match('index.html')) || net;
    })());
    return;
  }
  e.respondWith(caches.match(r, { cacheName: CACHE }).then((hit) => hit || fetch(r)));
});
