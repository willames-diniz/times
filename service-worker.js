// Nome do "cofre" onde vamos guardar os arquivos offline.
// Mudar esse número força o navegador a atualizar o cache quando você editar o app.
const CACHE_NOME = 'racha-v2';

// Lista de arquivos essenciais pro app funcionar sem internet.
const ARQUIVOS_ESSENCIAIS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Evento "install": roda uma vez, quando o Service Worker é registrado pela primeira vez.
self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(CACHE_NOME).then(function (cache) {
      return cache.addAll(ARQUIVOS_ESSENCIAIS);
    })
  );
});

// Evento "fetch": roda TODA VEZ que o app pede um arquivo (HTML, CSS, JS, imagem...).
self.addEventListener('fetch', function (evento) {
  evento.respondWith(
    caches.match(evento.request).then(function (respostaEmCache) {
      // Se o arquivo já está salvo no cache, usa ele (funciona offline).
      // Senão, busca da internet normalmente.
      return respostaEmCache || fetch(evento.request);
    })
  );
});
