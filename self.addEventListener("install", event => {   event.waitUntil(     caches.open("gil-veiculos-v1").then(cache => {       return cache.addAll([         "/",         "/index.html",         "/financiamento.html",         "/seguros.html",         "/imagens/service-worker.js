self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("gil-veiculos-v1").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/financiamento.html",
        "/seguros.html",
        "/imagens/01.jpg"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
