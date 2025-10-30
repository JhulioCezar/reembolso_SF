// sw.js — Versão aprimorada para "Solicitação de Reembolso - Sem Fronteiras"

const CACHE_NAME = "reembolso-sf-v2";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./script.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instala o Service Worker e faz cache dos arquivos principais
self.addEventListener("install", event => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("✅ Arquivos adicionados ao cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativa o SW e limpa versões antigas do cache
self.addEventListener("activate", event => {
  console.log("🔄 Ativando nova versão do SW...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições — estratégia Cache First com fallback para rede
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // Armazena no cache a nova versão do arquivo
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      }).catch(() => caches.match("./index.html"));
    })
  );
});

// Atualiza automaticamente quando há nova versão
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
