// sw.js — Versão otimizada para GitHub Pages
const CACHE_NAME = "reembolso-sf-github-v2";
const FILES_TO_CACHE = [
  "/reembolso_SF/",
  "/reembolso_SF/index.html",
  "/reembolso_SF/manifest.json",
  "/reembolso_SF/android-icon-192x192.png",
  "/reembolso_SF/android-icon-512x512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://i.imgur.com/dvzRyus.png"
];

// 📦 Instalação
self.addEventListener("install", event => {
  console.log("📦 Instalando Service Worker no GitHub Pages...");
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("📁 Adicionando arquivos ao cache");
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch(error => {
        console.error("❌ Erro durante instalação:", error);
      })
  );
});

// 🔄 Ativação
self.addEventListener("activate", event => {
  console.log("🔄 Service Worker ativado");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🗑️ Removendo cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 🌐 Estratégia de Cache (Cache First)
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retorna do cache se disponível
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Busca na rede
        return fetch(event.request)
          .then(networkResponse => {
            // Cache apenas recursos do mesmo origin
            if (networkResponse && 
                networkResponse.status === 200 &&
                event.request.url.startsWith(self.location.origin)) {
              
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('🌐 Rede offline, retornando cache');
            // Para páginas, retorna a página principal
            if (event.request.destination === 'document') {
              return caches.match('/reembolso_SF/index.html');
            }
          });
      })
  );
});

// 🔔 Atualização manual
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
