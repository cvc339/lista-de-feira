var CACHE = 'lista-feira-v2';
var CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.map(function (n) {
        if (n !== CACHE) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    // navegação: tenta a rede (para pegar atualizações), cai no cache se offline
    e.respondWith(
      fetch(e.request).then(function (resp) {
        var copia = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
        return resp;
      }).catch(function () {
        return caches.match(e.request).then(function (r) {
          return r || caches.match('./');
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (r) {
      return r || fetch(e.request).then(function (resp) {
        var copia = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
        return resp;
      });
    })
  );
});
