// Service worker do PetroPrep - Fase 1 (resiliencia de rede).
// Objetivo: um F5 sem internet abre a ultima versao da pagina em vez de erro.
// Nao guarda simulado para estudo offline ainda (isso e a Fase 2, no IndexedDB).

const VERSION = "v2";
const APP_CACHE = `petroprep-app-${VERSION}`;
const STATIC_CACHE = `petroprep-static-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/",
  "/simulado",
  "/estudar-offline",
];

// Paginas atras de login: nao ficam no cache para nao vazar entre pessoas
// que usam o mesmo navegador.
const PRIVADAS = ["/minha-conta", "/admin"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      // ignora falha individual de precache para nao travar a instalacao
      .then((cache) =>
        Promise.all(
          PRECACHE.map((u) => cache.add(u).catch(() => undefined)),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter((c) => !c.endsWith(VERSION))
            .map((c) => caches.delete(c)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function ehEstatico(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/banner/") ||
    /\.(css|js|woff2?|png|jpe?g|svg|webp|ico|gif)$/.test(url.pathname)
  );
}

function ehPrivada(url) {
  return PRIVADAS.some(
    (p) => url.pathname === p || url.pathname.startsWith(`${p}/`),
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API e autenticacao: sempre rede, nunca cache.
  if (url.pathname.startsWith("/api/")) return;

  // Navegacao de pagina: tenta a rede, cai para o cache, cai para /offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((resposta) => {
          if (resposta.ok && !ehPrivada(url)) {
            const copia = resposta.clone();
            caches.open(APP_CACHE).then((c) => c.put(request, copia));
          }
          return resposta;
        })
        .catch(async () => {
          const exato = await caches.match(request);
          if (exato) return exato;
          const semQuery = await caches.match(request, { ignoreSearch: true });
          if (semQuery) return semQuery;
          return caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  // Estaticos: entrega do cache na hora e atualiza por baixo.
  if (ehEstatico(url)) {
    event.respondWith(
      caches.match(request).then((hit) => {
        const rede = fetch(request)
          .then((resposta) => {
            const copia = resposta.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copia));
            return resposta;
          })
          .catch(() => hit);
        return hit || rede;
      }),
    );
    return;
  }

  // Resto (ex.: payload RSC de navegacao suave): rede, com cache de reserva.
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
