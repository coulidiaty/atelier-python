/* Service worker : garde le site sur l'appareil pour qu'il marche hors ligne.
   - Les pages (navigation) : réseau d'abord, en revalidant toujours auprès du serveur (pas de copie de 10 minutes),
     copie locale si pas de réseau.
   - Les autres fichiers du site et les polices : copie locale tout de suite, mise à jour en arrière-plan.
     Les fichiers versionnés (?v=…) ne gardent que leur dernière version : le cache ne grossit pas à chaque mise à jour.
   - Les requêtes en « no-store » (la vérification de mise à jour, dans app.js) vont toujours au réseau.
   - Supabase (comptes, classement) n'est jamais mis en cache.
   Changer CACHE vide l'ancien cache de tous les appareils à la prochaine visite. */
const CACHE = 'atelier-v2';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Garde la réponse, et retire les anciennes versions du même fichier (même chemin, autre ?v=).
async function keep(req, res){
  const c = await caches.open(CACHE), url = new URL(req.url);
  if (url.origin === self.location.origin && url.searchParams.has('v')) {
    for (const old of await c.keys()) {
      const o = new URL(old.url);
      if (o.pathname === url.pathname && o.search !== url.search) await c.delete(old);
    }
  }
  await c.put(req, res);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.cache === 'no-store') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !fonts) return;
  if (sameOrigin && url.pathname.includes('/dev/')) return;
  if (req.mode === 'navigate') {
    // Une seule copie par page, sans les paramètres (?code=…, ?classe=…).
    const page = new Request(url.origin + url.pathname);
    // fetch(req, …) garde le mode de redirection de la navigation : une redirection du serveur reste gérée par le navigateur.
    e.respondWith(fetch(req, { cache:'no-cache' })
      .then(res => { if (res.ok) { const copy = res.clone(); e.waitUntil(keep(page, copy)); } return res; })
      .catch(() => caches.match(page).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); e.waitUntil(keep(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
