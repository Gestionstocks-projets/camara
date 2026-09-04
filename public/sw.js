const CACHE_VERSION = "v1";
const STATIC_CACHE = `camara-static-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("camara-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages : réseau d'abord (données toujours à jour), page hors-ligne en
  // secours si aucune connexion — jamais de cache pour le HTML lui-même
  // (évite de servir une session/rôle périmés).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  // Fichiers statiques buildés (JS/CSS content-hashés) : cache d'abord,
  // sûr car immuables — accélère les rechargements et le mode hors-ligne.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Tout le reste (API, Supabase, données) : réseau direct, jamais mis en
  // cache — ce sont des données métier qui doivent toujours être fraîches.
});
