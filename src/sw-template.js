/* DOSUS Neuro — cache offline.
   Páginas: rede primeiro (pega a versão nova quando há internet), cache se offline.
   Demais arquivos (JS, CSS, PDFs, imagens): cache primeiro, atualizado em segundo plano. */
/* lista preenchida no build (vite.config.js) com todos os arquivos do app */
const CACHE = "dosus-__VERSAO__";
const PRECACHE = __PRECACHE__; // eslint-disable-line no-undef

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // fora do app (Google, Firebase) e rotas internas do Firebase Hosting (/__/auth) não passam pelo cache
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/__/")) return;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; })
        .catch(() => caches.match(req).then((r) => r || caches.match("/index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return r; });
      return hit || net;
    })
  );
});
