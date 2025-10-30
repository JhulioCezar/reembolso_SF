// sw.js — Versão otimizada PWA para "Solicitação de Reembolso - Sem Fronteiras"

const CACHE_NAME = "reembolso-sf-v3"; // Aumente o número sempre que atualizar
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192x192.png",
  "./icon-512x512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://i.imgur.com/dvzRyus.png"
];

// Instalação: faz cache inicial
self.addEventListener("install", event => {
  console.log("📦 Instalando nova versão do Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("✅ Arquivos adicionados ao cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener("activate", event => {
  console.log("🔄 Ativando nova versão...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removendo cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Estratégia: Network First para HTML / Cache First para o resto
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse || caches.match("./index.html"));

      if (event.request.destination === "document") {
        return fetchPromise;
      }

      return cachedResponse || fetchPromise;
    })
  );
});

// 🔔 Atualização automática: notifica o usuário quando há nova versão
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", () => {
  self.skipWaiting();
});
