/* ===========================================================================
   tema.js — chiaro, scuro, o come dice il sistema operativo.

   Tre stati e non due, di proposito: la scelta e' del singolo monitor, non
   della sagra. Il tablet in cassa sta in mano a qualcuno sotto il tendone e
   vuole il chiaro; lo schermo appeso in cucina vuole lo scuro sempre, anche
   di giorno. "Automatico" e' il terzo stato per chi non vuole decidere.

   La scelta sta in localStorage, che e' per-dispositivo: e' esattamente la
   granularita' giusta. Un monitor si configura una volta e se la ricorda.

   Va incluso nel <head> con uno <script src> normale (non async, non defer):
   deve girare PRIMA che la pagina venga disegnata, altrimenti si vede un
   lampo di tema sbagliato a ogni caricamento. Su un monitor che si ricarica
   da solo ogni pochi secondi sarebbe insopportabile.
   =========================================================================== */
(function () {
  'use strict';

  var CHIAVE = 'gsg-tema';                 // 'auto' | 'chiaro' | 'scuro'
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  // Il fondo pagina di Tabler nei due temi. Serve per la barra del browser
  // su Android: se resta fissa scura sopra una pagina chiara si vede.
  var COLORE_BARRA = { scuro: '#111827', chiaro: '#f9fafb' };

  function scelta() {
    // localStorage puo' lanciare eccezione (navigazione in incognito con i
    // cookie bloccati). In quel caso si ripiega su "auto" senza rompere nulla.
    try { return localStorage.getItem(CHIAVE) || 'auto'; } catch (e) { return 'auto'; }
  }

  function scuroAdesso() {
    var s = scelta();
    return s === 'scuro' || (s === 'auto' && mq.matches);
  }

  function applica() {
    var scuro = scuroAdesso();
    var html = document.documentElement;
    html.setAttribute('data-bs-theme', scuro ? 'dark' : 'light');
    html.setAttribute('data-tema', scelta());     // per le nostre regole
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', scuro ? COLORE_BARRA.scuro : COLORE_BARRA.chiaro);
    aggiornaSelettore();
  }

  function imposta(s) {
    try { localStorage.setItem(CHIAVE, s); } catch (e) { /* pazienza */ }
    applica();
  }

  /* --- il selettore, disegnato una volta sola qui invece che in ogni pagina --- */

  var ICONE = {
    auto:   '<path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"/><path d="M7 20h10"/><path d="M9 16v4"/><path d="M15 16v4"/>',
    chiaro: '<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>',
    scuro:  '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>'
  };
  var ETICHETTE = { auto: 'Come il sistema', chiaro: 'Chiaro', scuro: 'Scuro' };

  function icona(nome) {
    return '<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" ' +
           'viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" ' +
           'stroke-linecap="round" stroke-linejoin="round">' + ICONE[nome] + '</svg>';
  }

  function montaSelettore(contenitore) {
    var el = typeof contenitore === 'string' ? document.querySelector(contenitore) : contenitore;
    if (!el) return;
    el.className = 'btn-group gsg-tema';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Tema della pagina');
    el.innerHTML = ['auto', 'chiaro', 'scuro'].map(function (s) {
      return '<button type="button" class="btn btn-icon" data-tema-scelta="' + s + '" ' +
             'title="' + ETICHETTE[s] + '" aria-label="' + ETICHETTE[s] + '">' + icona(s) + '</button>';
    }).join('');
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-tema-scelta]');
      if (b) imposta(b.getAttribute('data-tema-scelta'));
    });
    aggiornaSelettore();
  }

  function aggiornaSelettore() {
    var s = scelta();
    document.querySelectorAll('.gsg-tema [data-tema-scelta]').forEach(function (b) {
      var attivo = b.getAttribute('data-tema-scelta') === s;
      b.classList.toggle('active', attivo);
      b.setAttribute('aria-pressed', attivo ? 'true' : 'false');
    });
  }

  applica();

  // In "auto" il tema deve seguire il sistema anche mentre la pagina e' aperta:
  // un monitor resta acceso giorni e nessuno lo ricarica a mano.
  if (mq.addEventListener) mq.addEventListener('change', applica);
  else if (mq.addListener) mq.addListener(applica);   // Safari vecchi

  // Se lo stesso monitor ha due schede aperte, la scelta si propaga.
  window.addEventListener('storage', function (e) { if (e.key === CHIAVE) applica(); });

  window.GsgTema = { scelta: scelta, imposta: imposta, applica: applica, montaSelettore: montaSelettore };
})();
