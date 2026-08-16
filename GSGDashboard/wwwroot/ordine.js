/* ===========================================================================
   ordine.js — il dettaglio di un ordine, dovunque compaia il suo numero.

   Sui monitor il numero d'ordine e' un riquadro con dentro una cifra e basta.
   Dice che l'ordine 214 esiste e aspetta, non dice che cosa c'e' dentro: per
   saperlo bisognava andare alla dashboard, ritrovare l'ordine nella tabella e
   aprirlo. Con qualcuno che aspetta al banco, non lo fa nessuno.

   Da qui in poi ogni numero d'ordine e' vivo:
     - passandoci sopra il mouse, dopo un attimo, compare un riquadro con il
       riepilogo (pietanze, tavolo, totale, stato dei reparti);
     - facendoci clic si apre il dettaglio completo in un cassetto laterale,
       lo stesso della dashboard.

   COME SI USA. La pagina non chiama niente: basta che disegni il numero con
   gli attributi che dicono di quale ordine si tratta.

       <span class="gsg-pill gsg-ordine" data-ordine-id="912"
             data-ordine-srv="0" data-ordine-n="214">214</span>

   `data-ordine-id` e' l'id dell'ordine nel database della cassa (NON il
   progressivo: quello si azzera a ogni serata e su due casse si ripete);
   `data-ordine-srv` e' l'indice della cassa, che serve all'hub per sapere a
   quale database chiedere; `data-ordine-n` e' il numero da mostrare mentre il
   dettaglio si carica, ed e' facoltativo.

   NIENTE AGGANCI DA RIFARE A OGNI DISEGNO. Gli ascoltatori stanno una volta
   sola sul documento e lavorano per delega. Queste pagine si ridisegnano da
   sole ogni pochi secondi: agganciare gli eventi elemento per elemento
   avrebbe voluto dire ricordarsi di richiamare una funzione dopo ogni
   innerHTML, e prima o poi ci si dimentica.

   Va incluso DOPO il corpo della pagina, oppure con defer.
   =========================================================================== */
(function () {
  'use strict';

  var ATTESA_HOVER = 250;      // ms prima che il riquadro compaia
  var VITA_CACHE = 15000;      // ms: quanto si riusa un dettaglio gia' chiesto

  var cache = {};              // "srv|id" -> { quando: ms, dati: ordine }
  var timerHover = null, ancora = null, pendente = null, guardia = null;
  var pop = null, cassetto = null, fondale = null, corpo = null;
  var richiestaAperta = 0;     // l'ultima apertura vince: vedi apri()

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function euro(n) {
    return '€ ' + Number(n || 0).toLocaleString('it-IT',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  var TINTA_STATO = { ordinato: 'bg-azure-lt', lavorazione: 'bg-yellow-lt', evaso: 'bg-green-lt' };
  function badgeStato(nome, valore) {
    return '<span class="badge ' + (TINTA_STATO[valore] || 'bg-secondary-lt') + '">' +
           esc(nome) + ': ' + esc(valore || '–') + '</span>';
  }

  /* ---------------------------------------------------------------- dati ---
     Una cassa sola risponde in pochi millisecondi, ma il mouse passa sopra
     dieci numeri mentre cerca quello giusto: senza cache sarebbero dieci
     richieste, e il monitor sta gia' chiedendo i suoi dati ogni tre secondi.
     Quindici secondi di validita' bastano a coprire il "passo sopra, leggo,
     ci clicco" e non abbastanza da mostrare uno stato vecchio.               */
  function chiediOrdine(srv, id) {
    var chiave = srv + '|' + id;
    var c = cache[chiave];
    if (c && (Date.now() - c.quando) < VITA_CACHE) return Promise.resolve(c.dati);
    return fetch('/hub/order?srv=' + encodeURIComponent(srv) + '&id=' + encodeURIComponent(id),
                 { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (o) {
        cache[chiave] = { quando: Date.now(), dati: o };
        return o;
      });
  }

  /* Le righe che contano per chi guarda: le pietanze, non gli sconti. */
  function righeArticolo(o) {
    return (o.righe || []).filter(function (r) { return r.type !== 'riga_sconto'; });
  }

  /* ------------------------------------------------------------ riquadro ---
     Il riquadro del passaggio del mouse e' un RIASSUNTO, non il dettaglio:
     chi ci passa sopra sta cercando l'ordine giusto, non leggendo la ricevuta.
     Poche righe di pietanze e via; per il resto c'e' il clic.                */
  var MAX_RIGHE_POP = 8;

  function creaPop() {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.className = 'gsg-ordine-pop';
    pop.setAttribute('role', 'tooltip');
    document.body.appendChild(pop);
    return pop;
  }

  function contenutoPop(o, etichettaCassa) {
    var righe = righeArticolo(o);
    var mostrate = righe.slice(0, MAX_RIGHE_POP);
    var restanti = righe.length - mostrate.length;
    return '' +
      '<div class="gsg-ordine-pop-testa">' +
        '<strong>Ordine #' + esc(o.progressivo) + '</strong>' +
        (etichettaCassa ? ' <span class="badge bg-secondary-lt">' + esc(etichettaCassa) + '</span>' : '') +
        '<div class="text-secondary">' + esc(String(o.ora || '').slice(0, 5)) +
          (o.tavolo ? ' · Tavolo ' + esc(o.tavolo) : '') +
          (o.coperti ? ' · ' + esc(o.coperti) + ' coperti' : '') +
          (o.cliente ? ' · ' + esc(o.cliente) : '') +
        '</div>' +
      '</div>' +
      '<div class="gsg-ordine-pop-righe">' +
        mostrate.map(function (r) {
          return '<div><span class="gsg-ordine-q">' + esc(r.quantita) + '×</span> ' +
                 esc(r.descrizione) +
                 (r.note ? '<div class="gsg-ordine-nota">Nota: ' + esc(r.note) + '</div>' : '') +
                 '</div>';
        }).join('') +
        (restanti > 0 ? '<div class="text-secondary">…e altre ' + restanti + ' righe</div>' : '') +
        (righe.length === 0 ? '<div class="text-secondary">Nessuna riga</div>' : '') +
      '</div>' +
      '<div class="gsg-ordine-pop-piede">' +
        '<div class="d-flex flex-wrap gap-1">' +
          badgeStato('Cucina', o.stato_cucina) + badgeStato('Bar', o.stato_bar) +
          badgeStato('Pizzeria', o.stato_pizzeria) + badgeStato('Rosticceria', o.stato_rosticceria) +
        '</div>' +
        '<div class="gsg-ordine-tot">Totale <strong>' + euro(o.totale) + '</strong></div>' +
      '</div>';
  }

  /* Il riquadro sta appeso al numero, ma non deve uscire dallo schermo: sopra
     se sotto non ci sta, e rientrato di lato quando il numero e' sul bordo.
     Si misura dopo averlo riempito, perche' l'altezza dipende da quante
     pietanze ha l'ordine.                                                    */
  function posiziona(el) {
    var r = el.getBoundingClientRect();
    var p = pop.getBoundingClientRect();
    var margine = 8;
    var top = r.bottom + margine;
    if (top + p.height > window.innerHeight - margine) {
      top = r.top - p.height - margine;
      if (top < margine) top = Math.max(margine, window.innerHeight - p.height - margine);
    }
    var left = r.left + r.width / 2 - p.width / 2;
    if (left < margine) left = margine;
    if (left + p.width > window.innerWidth - margine) left = window.innerWidth - p.width - margine;
    pop.style.top = Math.round(top) + 'px';
    pop.style.left = Math.round(left) + 'px';
  }

  /* Lo stesso numero d'ordine, nella pagina ridisegnata un attimo fa.
     Restituisce null se quell'ordine non c'e' davvero piu'. */
  function erede(el) {
    if (document.contains(el)) return el;
    var srv = el.getAttribute('data-ordine-srv');
    return document.querySelector('[data-ordine-id="' + el.getAttribute('data-ordine-id') + '"]' +
      (srv == null ? '' : '[data-ordine-srv="' + srv + '"]'));
  }

  function mostraPop(el) {
    var srv = el.getAttribute('data-ordine-srv') || 0;
    var id = el.getAttribute('data-ordine-id');
    if (!id) return;
    ancora = el;

    /* Il disegno arriva dopo la risposta dell'hub, e in quel frattempo la
       pagina puo' essersi ridisegnata da sola portandosi via il numero da
       sotto il mouse. Pretendere lo stesso identico elemento voleva dire, su
       un tabellone che si aggiorna ogni due secondi, un riquadro che a volte
       non compariva e nessuno capiva perche'. Si riparte quindi dall'ordine:
       si cerca il numero nuovo, e solo se non c'e' si lascia perdere. */
    function disegna(html) {
      var qui = (ancora === el) ? erede(el) : null;
      if (!qui) return;
      ancora = qui;
      creaPop();
      pop.innerHTML = html;
      pop.classList.add('aperto');
      posiziona(qui);
      avviaGuardia();
    }

    chiediOrdine(srv, id).then(function (o) {
      disegna(contenutoPop(o, el.getAttribute('data-ordine-cassa')));
    }).catch(function () {
      disegna('<div class="gsg-ordine-pop-testa"><strong>Ordine #' +
        esc(el.getAttribute('data-ordine-n') || '') + '</strong>' +
        '<div class="text-danger">Dettaglio non disponibile</div></div>');
    });
  }

  /* Questi monitor si ridisegnano da soli ogni due o tre secondi: il numero
     sotto il mouse sparisce e viene RIFATTO uguale, e il browser non manda
     nessun mouseout per un elemento che non c'e' piu'.

     Il riquadro non e' quindi appeso all'elemento ma all'ORDINE: quando
     l'elemento sparisce si cerca il numero nuovo con lo stesso id e ci si
     riaggancia. Legandolo all'elemento, il riquadro sarebbe sparito da solo
     ogni tre secondi mentre lo si stava leggendo, con il mouse fermo. Se
     l'ordine non c'e' piu' davvero — e' stato evaso, esce dal tabellone —
     allora il riquadro si chiude, che e' quello che deve fare. */
  function avviaGuardia() {
    fermaGuardia();
    guardia = setInterval(function () {
      if (!ancora) { nascondiPop(); return; }
      if (document.contains(ancora)) return;
      var nuovo = erede(ancora);
      if (!nuovo) { nascondiPop(); return; }
      ancora = nuovo;
      posiziona(ancora);
    }, 500);
  }
  function fermaGuardia() {
    if (guardia) { clearInterval(guardia); guardia = null; }
  }
  function nascondiPop() {
    if (timerHover) { clearTimeout(timerHover); timerHover = null; }
    fermaGuardia();
    ancora = null;
    pendente = null;
    if (pop) pop.classList.remove('aperto');
  }

  /* ------------------------------------------------------------- cassetto ---
     Il cassetto e' costruito qui e non nelle pagine: cosi' una pagina che
     mostra numeri d'ordine non deve aggiungere niente al proprio HTML. Gli id
     sono suoi (gsg-ordine-*) perche' quasi tutte queste pagine hanno gia' un
     cassetto loro, chiamato "drawer", per i filtri: due elementi con lo stesso
     id si sarebbero pestati i piedi.                                          */
  function creaCassetto() {
    if (cassetto) return;
    fondale = document.createElement('div');
    fondale.className = 'gsg-backdrop gsg-ordine-fondale';
    fondale.addEventListener('click', chiudi);
    document.body.appendChild(fondale);

    cassetto = document.createElement('aside');
    cassetto.className = 'gsg-drawer gsg-ordine-cassetto';
    cassetto.setAttribute('aria-label', 'Dettaglio ordine');
    corpo = document.createElement('div');
    cassetto.appendChild(corpo);
    document.body.appendChild(cassetto);
  }

  function apriCassetto(aperto) {
    creaCassetto();
    cassetto.classList.toggle('aperto', aperto);
    fondale.classList.toggle('aperto', aperto);
  }

  function chiudi() { apriCassetto(false); }

  function intestazione(titolo, sottotitolo) {
    return '<div class="card-header"><div>' +
      '<h3 class="card-title">' + titolo + '</h3>' +
      (sottotitolo ? '<p class="card-subtitle">' + sottotitolo + '</p>' : '') +
      '</div><button class="btn btn-sm ms-auto" data-ordine-chiudi>Chiudi</button></div>';
  }

  function contenutoCassetto(o, etichettaCassa) {
    var righe = righeArticolo(o);
    var sconti = (o.righe || []).filter(function (r) { return r.type === 'riga_sconto'; });
    return intestazione(
      'Ordine #' + esc(o.progressivo) +
        (etichettaCassa ? ' <span class="badge bg-secondary-lt">' + esc(etichettaCassa) + '</span>' : ''),
      esc(o.data) + ' · ' + esc(String(o.ora || '').slice(0, 8)) +
        ' · Tavolo ' + esc(o.tavolo || '—') + ' · ' + (o.coperti || 0) + ' coperti') +
      '<div class="card-body">' +
        '<div class="d-flex flex-wrap gap-1 mb-3">' +
          (o.cliente ? '<span class="badge bg-secondary-lt">Cliente: ' + esc(o.cliente) + '</span>' : '') +
          (o.cassiere ? '<span class="badge bg-secondary-lt">Cassiere: ' + esc(o.cassiere) + '</span>' : '') +
          (o.tipo_pagamento ? '<span class="badge bg-secondary-lt">' + esc(o.tipo_pagamento) + '</span>' : '') +
          (o.asporto ? '<span class="badge bg-secondary-lt">asporto</span>' : '') +
          (o.omaggio ? '<span class="badge bg-secondary-lt">omaggio</span>' : '') +
          (o.mobile ? '<span class="badge bg-secondary-lt">app</span>' : '') +
        '</div>' +
        '<div class="list-group list-group-flush mb-3">' +
          righe.map(function (r) {
            return '<div class="list-group-item d-flex gap-3 px-0">' +
              '<span class="fw-bold text-primary">' + esc(r.quantita) + '×</span>' +
              '<span class="flex-fill gsg-nome">' + esc(r.descrizione) +
                (r.note ? '<div class="text-secondary small">Nota: ' + esc(r.note) + '</div>' : '') +
                (r.desc_tipologia ? '<div class="text-secondary small">' + esc(r.desc_tipologia) + '</div>' : '') +
              '</span>' +
              '<span class="fw-bold font-monospace text-nowrap">' +
                (r.prezzo != null ? euro(r.prezzo * r.quantita) : '') + '</span>' +
            '</div>';
          }).join('') +
          sconti.map(function (r) {
            return '<div class="list-group-item d-flex gap-3 px-0">' +
              '<span class="fw-bold">–</span>' +
              '<span class="flex-fill">Sconto' +
                (r.numero_buono ? ' buono ' + esc(r.numero_buono) : '') + '</span>' +
              '<span class="fw-bold font-monospace text-nowrap">- ' + euro(r.sconto_valore) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="d-flex justify-content-between text-secondary">' +
          '<span title="Somma delle sole pietanze e bevande, senza il coperto">Pietanze</span>' +
          '<span class="font-monospace">' + euro(o.imponibile) + '</span></div>' +
        (o.totale_coperto ? '<div class="d-flex justify-content-between text-secondary"><span>Coperto</span>' +
          '<span class="font-monospace">' + euro(o.totale_coperto) + '</span></div>' : '') +
        (o.totale_asporto ? '<div class="d-flex justify-content-between text-secondary"><span>Asporto</span>' +
          '<span class="font-monospace">' + euro(o.totale_asporto) + '</span></div>' : '') +
        '<div class="d-flex justify-content-between h2 mt-2 pt-2 border-top"><span>Totale</span>' +
          '<span class="font-monospace">' + euro(o.totale) + '</span></div>' +
        '<div class="d-flex flex-wrap gap-1 mt-3">' +
          badgeStato('Cucina', o.stato_cucina) + badgeStato('Bar', o.stato_bar) +
          badgeStato('Pizzeria', o.stato_pizzeria) + badgeStato('Rosticceria', o.stato_rosticceria) +
          badgeStato('Cliente', o.stato_cliente) +
        '</div>' +
        (o.note ? '<p class="text-secondary mt-3">Nota: ' + esc(o.note) + '</p>' : '') +
      '</div>';
  }

  /* Due clic veloci su due numeri diversi: la prima risposta puo' arrivare
     dopo la seconda. Il contatore fa vincere l'ultima richiesta, cosi' il
     cassetto non mostra mai l'ordine che non e' stato chiesto per ultimo. */
  function apri(srv, id, numero, etichettaCassa) {
    nascondiPop();
    apriCassetto(true);
    var mia = ++richiestaAperta;
    corpo.innerHTML = intestazione('Ordine' + (numero ? ' #' + esc(numero) : ''), '') +
      '<div class="card-body text-secondary">Caricamento…</div>';
    chiediOrdine(srv, id).then(function (o) {
      if (mia !== richiestaAperta) return;
      corpo.innerHTML = contenutoCassetto(o, etichettaCassa);
    }).catch(function () {
      if (mia !== richiestaAperta) return;
      corpo.innerHTML = intestazione('Ordine' + (numero ? ' #' + esc(numero) : ''), '') +
        '<div class="card-body text-danger">Errore nel caricamento del dettaglio.</div>';
    });
  }

  function bersaglio(e) {
    var t = e.target;
    return (t && t.closest) ? t.closest('[data-ordine-id]') : null;
  }

  /* -------------------------------------------------------------- eventi --- */
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('[data-ordine-chiudi]')) { chiudi(); return; }
    var el = bersaglio(e);
    if (!el) return;
    apri(el.getAttribute('data-ordine-srv') || 0, el.getAttribute('data-ordine-id'),
         el.getAttribute('data-ordine-n'), el.getAttribute('data-ordine-cassa'));
  });

  /* Con la tastiera il numero si raggiunge con Tab e si apre con Invio o
     Spazio: sono riquadri, non <button>, e da soli non lo farebbero. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { nascondiPop(); chiudi(); return; }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = bersaglio(e);
    if (!el) return;
    e.preventDefault();
    apri(el.getAttribute('data-ordine-srv') || 0, el.getAttribute('data-ordine-id'),
         el.getAttribute('data-ordine-n'), el.getAttribute('data-ordine-cassa'));
  });

  document.addEventListener('mouseover', function (e) {
    // Muovendosi DENTRO lo stesso numero non si ricomincia da capo: il
    // riquadro non arriverebbe mai finche' il mouse si sposta di un pixel.
    var el = bersaglio(e);
    if (!el || el === ancora || el === pendente) return;
    nascondiPop();
    pendente = el;
    // Mezzo secondo di ritardo sarebbe troppo, zero farebbe lampeggiare il
    // riquadro mentre il mouse attraversa la griglia per arrivare altrove.
    timerHover = setTimeout(function () { mostraPop(el); }, ATTESA_HOVER);
  });
  document.addEventListener('mouseout', function (e) {
    var el = bersaglio(e);
    if (!el) return;
    var verso = e.relatedTarget;
    if (verso && verso.closest && verso.closest('[data-ordine-id]') === el) return;
    nascondiPop();
  });

  // Stessa finestra anche per chi arriva con la tastiera.
  document.addEventListener('focusin', function (e) {
    var el = bersaglio(e);
    if (el) mostraPop(el);
  });
  document.addEventListener('focusout', function (e) {
    if (bersaglio(e)) nascondiPop();
  });

  // Il riquadro e' agganciato a coordinate assolute: se la pagina scorre o la
  // finestra cambia misura resterebbe dov'era, staccato dal suo numero.
  window.addEventListener('scroll', nascondiPop, true);
  window.addEventListener('resize', nascondiPop);

  window.GsgOrdine = { apri: apri, chiudi: chiudi };
})();
