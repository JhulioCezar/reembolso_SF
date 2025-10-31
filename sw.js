// sw.js — Versão corrigida para GitHub Pages
const CACHE_NAME = "reembolso-sf-final-v3";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json", 
  "./android-icon-192x192.png",
  "./android-icon-512x512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://i.imgur.com/dvzRyus.png"
];

// 📦 Instalação
self.addEventListener("install", event => {
  console.log("📦 Instalando Service Worker...");
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .catch(error => console.error("❌ Erro cache:", error))
  );
});

// 🔄 Ativação
self.addEventListener("activate", event => {
  console.log("🔄 Service Worker ativado");
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// 🌐 Fetch
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then(cache => 
            cache.put(event.request, response.clone())
          );
        }
        return response;
      }).catch(() => cached);
    })
  );
});

// 🔔 Atualização
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
