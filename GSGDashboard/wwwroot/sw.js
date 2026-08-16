/* Service worker del sito Sagra (PWA).

   Tre comportamenti diversi, uno per tipo di richiesta:

   1. /hub/...        mai dalla cache. Sono i dati vivi della sagra: quantita'
                      da preparare, numeri d'ordine, incassi. Ora che l'API sta
                      sulla stessa origine delle pagine questo controllo e'
                      indispensabile, altrimenti il monitor mostra numeri vecchi.

   2. pagine e nostro codice (.html, .css, .js)
                      prima la rete, la cache solo se la rete non risponde.

   3. tutto il resto (icone, wwwroot/vendor/)
                      prima la cache: sono file che non cambiano mai, e Tabler
                      da solo pesa mezzo megabyte.

   PERCHE' LA RETE PER PRIMA SULLE PAGINE. Prima erano anche loro "prima la
   cache", e il risultato era questo: si correggeva una pagina, si ricaricava
   il monitor, e non cambiava niente — la correzione arrivava solo al secondo
   o terzo caricamento, o mai, se non ci si ricordava di alzare CACHE qui
   sotto. Durante una sagra, con qualcuno che aspetta, e' il modo migliore per
   perdere mezz'ora a cercare un errore che non c'e'.
   Il server e' a pochi metri sulla stessa LAN: chiedergli la pagina costa
   qualche millisecondo. La cache resta come rete di salvataggio per quando il
   server non risponde, che e' il caso per cui serviva davvero.  */

/* Alzando questo numero l'evento 'activate' cancella tutte le cache con nome
   diverso. Ora che le pagine vanno di rete non e' piu' necessario alzarlo a
   ogni modifica: serve solo cambiando l'elenco SHELL qui sotto. */
const CACHE = 'gsg-shell-v12';
const SHELL = [
  'dashboard.html',
  'reparto.html',
  'monitor_ordini.html',
  'avanzamento.html',
  'vendor/tabler.min.css',
  'sagra.css',
  'tema.js',
  'ordine.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon.svg'
];

/* Estensioni che vogliono "prima la rete": sono le nostre, cambiano spesso.
   Le richieste di navigazione ci finiscono comunque, anche senza estensione. */
const NOSTRI = /\.(html|css|js)$/i;

function primaLaRete(url, req) {
  if (req.mode === 'navigate') return true;
  if (url.pathname.startsWith('/vendor/')) return false;   // roba di terzi
  return NOSTRI.test(url.pathname) || url.pathname === '/';
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== location.origin) return;      // altre origini: alla rete
  if (url.pathname.startsWith('/hub')) return;     // dati vivi: mai dalla cache

  e.respondWith(
    primaLaRete(url, req) ? dallaRete(req) : dallaCache(req)
  );
});

/* Prima la rete. Se risponde, la copia in cache serve solo per quando il
   server sara' spento. */
async function dallaRete(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(req, copia));
    }
    return res;
  } catch (err) {
    const salvata = await caches.match(req);
    if (salvata) return salvata;
    // Non l'abbiamo mai vista e il server non risponde: meglio la home che
    // l'errore del browser, almeno si capisce cos'e' successo.
    return (await caches.match('dashboard.html')) || Response.error();
  }
}

/* Prima la cache, con aggiornamento in sottofondo. Va bene per le icone e per
   wwwroot/vendor/, che cambiano solo quando li aggiorniamo di proposito. */
async function dallaCache(req) {
  const salvata = await caches.match(req);
  if (salvata) {
    fetch(req).then(res => {
      if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
    }).catch(() => {});
    return salvata;
  }
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(req, copia));
    }
    return res;
  } catch (err) {
    return Response.error();
  }
}
