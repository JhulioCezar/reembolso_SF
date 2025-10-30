const CACHE_NAME = 'reembolso-sf-cache-v2';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://i.imgur.com/dvzRyus.png'
];

// Instalação — pré-cache dos arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache aberto');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => console.error('[Service Worker] Erro ao adicionar arquivos ao cache:', err))
  );
  self.skipWaiting(); // ativa imediatamente
});

// Ativação — limpa caches antigos e assume o controle
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Excluindo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  clients.claim(); // assume controle das páginas ativas
});

// Fetch — aplica estratégia mista (Network First para páginas, Cache First para assets)
self.addEventListener('fetch', event => {
  // Estratégia Network First para navegação
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Caso falhe, busca a versão em cache
          return caches.match(event.request)
            .then(cached => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Estratégia Cache First para outros recursos
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request)
          .then(networkResponse => {
            // Armazena a nova resposta em cache
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // Caso queira adicionar uma página offline personalizada:
            // return caches.match('offline.html');
          });
      })
  );
});
