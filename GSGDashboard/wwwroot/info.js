/* ===========================================================================
   info.js — la schermata "chi l'ha fatto e com'e' fatto".

   Si apre da "Informazioni", in fondo alla pagina dopo l'indirizzo di posta:
   un comando a se', scritto per esteso. La barra in cima resta libera, che e'
   il posto dei comandi che si usano durante la serata, non di quello che si
   apre una volta all'anno per sapere che licenza ha il programma.

   Sta in un file solo, incluso da tutte le pagine, per la ragione di sempre:
   licenze e componenti cambiano ogni tanto, e la stessa cosa scritta in otto
   pagine diventa otto cose diverse dopo la prima correzione.

   Il pannello viene costruito alla prima apertura, non al caricamento: sui
   monitor appesi in cucina, che nessuno tocca mai, quella parte costa solo il
   suo scaricamento.

   La versione invece si chiede subito, non alla prima apertura: va nel nome
   in fondo alla pagina (accanto a "Alessandro Bernardin"), che si legge senza
   aprire niente — e' li' che la cerca chi segnala un problema. Costa una
   chiamata a /hub/health per pagina, anche su un monitor che nessuno tocca:
   il prezzo di farla vedere senza doverla andare a cercare.

   Va incluso con <script src="info.js" defer></script>: deve trovare il
   footer gia' disegnato, e non c'e' nessuna fretta che giri prima.
   =========================================================================== */
(function () {
  'use strict';

  var PAYPAL = 'https://paypal.me/tano3003';
  var EMAIL = 'alessandro@bernardin.it';

  /* --- il contenuto ---
     Testo, non dati: si legge e si corregge qui, in un punto solo. */

  var COMPONENTI = [
    ['Tabler 1.4.0',
     'L&rsquo;aspetto delle pagine: temi chiaro e scuro, schede, tabelle. Sta dentro al pacchetto invece di essere preso da internet perch&eacute; alla sagra la rete spesso non c&rsquo;&egrave;.',
     'MIT'],
    ['Bootstrap',
     'Le fondamenta di Tabler, griglia e componenti. Solo il CSS, senza il suo JavaScript.',
     'MIT'],
    ['Npgsql 4.0.17',
     'Il collegamento al database quando la cassa usa PostgreSQL.',
     'PostgreSQL License'],
    ['System.Data.SQLite 1.0.118 e SQLite',
     'Il collegamento al database quando la cassa usa il file SQLite del gestionale.',
     'Pubblico dominio'],
    ['NLog 5.3.4',
     'Il registro giornaliero dei tre programmi, sette giorni di storia.',
     'BSD a 3 clausole'],
    ['Librerie .NET di Microsoft',
     'System.Buffers, System.Memory e le altre: sono richieste da Npgsql.',
     'MIT']
  ];

  var SEZIONI = [

    { titolo: 'Che cos&rsquo;&egrave;',
      html:
        '<p><strong>GSG Dashboard</strong> mette in rete quello che sta nel database del ' +
        'gestionale <strong>Gestione Stand Gastronomico</strong>: gli ordini appena battuti, le ' +
        'quantit&agrave; da preparare in ogni reparto, il tabellone degli ordini pronti, ' +
        'l&rsquo;andamento della serata. Si guarda dal tablet in cassa, dai monitor appesi ' +
        'in cucina, dal telefono di chi gira fra i tavoli.</p>' +
        '<p class="mb-0">Il gestionale <strong>non viene toccato</strong>: GSG Dashboard ' +
        'legge e basta. L&rsquo;unica cosa che scrive, e solo sulle casse con PostgreSQL, ' +
        '&egrave; ' +
        'l&rsquo;avanzamento di stato di un ordine letto col lettore di codici a barre &mdash; ' +
        'una colonna sola, di un ordine solo, quando qualcuno preme il pulsante.</p>' },

    { titolo: 'Com&rsquo;&egrave; fatto',
      html:
        '<p>Due programmi separati, cos&igrave; se si ferma il server le casse ' +
        'continuano a lavorare:</p>' +
        '<ul class="mb-2">' +
        '<li><strong>GSGProxy</strong> &mdash; sta su ogni PC di cassa, accanto al ' +
        'gestionale, ed &egrave; l&rsquo;unico che tocca il database, in sola lettura.</li>' +
        '<li><strong>GSGDashboard</strong> &mdash; sta sul PC che fa da server: somma i ' +
        'dati di tutte le casse e pubblica le pagine che state guardando, ordini e ' +
        'rendiconti. I rendiconti &mdash; il confronto fra le serate e i numeri degli ' +
        'incassi &mdash; sono protetti da password: non tutti quelli che aprono la ' +
        'dashboard devono vederli.</li>' +
        '</ul>' +
        '<p class="mb-0 text-secondary">Sono scritti in C# su .NET Framework 4.8 e girano ' +
        'su Windows senza bisogno di installare un server web o un database.</p>' },

    { titolo: 'Licenza',
      html:
        '<p>GSG Dashboard &egrave; <strong>gratuito ma non &egrave; libero</strong>: si ' +
        'pu&ograve; usare quanto si vuole, non si pu&ograve; vendere n&eacute; spacciare ' +
        'per proprio.</p>' +
        '<div class="row g-2 mb-3">' +
        '<div class="col-md-6"><div class="gsg-info-riquadro">' +
        '<div class="gsg-info-riquadro-titolo text-green">Si pu&ograve;</div>' +
        '<ul class="mb-0">' +
        '<li>usarlo gratis, su quante macchine servono, per sempre;</li>' +
        '<li>passarlo a un&rsquo;altra sagra, intero e senza chiedere soldi;</li>' +
        '<li>ritoccare le pagine di <code>wwwroot</code> per la propria sagra.</li>' +
        '</ul></div></div>' +
        '<div class="col-md-6"><div class="gsg-info-riquadro">' +
        '<div class="gsg-info-riquadro-titolo text-red">Non si pu&ograve;</div>' +
        '<ul class="mb-0">' +
        '<li>venderlo o metterlo dentro un prodotto a pagamento;</li>' +
        '<li>decompilare gli eseguibili o aggirare le protezioni;</li>' +
        '<li>togliergli il nome dell&rsquo;autore o presentarlo come proprio.</li>' +
        '</ul></div></div>' +
        '</div>' +
        '<p class="mb-0 text-secondary">Il testo completo sta nel file <code>LICENSE</code>, ' +
        'nella cartella dove il programma &egrave; installato. Nessuna garanzia: i numeri ' +
        'che vedete sono una lettura del vostro database, prima di farci un rendiconto ' +
        'verificateli col gestionale.</p>' },

    { titolo: 'Componenti di altri',
      html:
        '<p>Dentro al pacchetto ci sono pezzi scritti da altri, ognuno con la sua licenza. ' +
        'Quelle restano valide: la licenza di GSG Dashboard non le sostituisce.</p>' +
        '<div class="table-responsive"><table class="table table-sm gsg-info-tabella">' +
        '<thead><tr><th>Componente</th><th>A che serve</th><th>Licenza</th></tr></thead>' +
        '<tbody>' +
        COMPONENTI.map(function (c) {
          return '<tr><td><strong>' + c[0] + '</strong></td>' +
                 '<td class="text-secondary">' + c[1] + '</td>' +
                 '<td class="text-nowrap">' + c[2] + '</td></tr>';
        }).join('') +
        '</tbody></table></div>' +
        '<p class="mb-0 text-secondary">Le licenze per intero stanno nel file ' +
        '<code>THIRD-PARTY-NOTICES.md</code>, accanto ai programmi.</p>' },

    { titolo: 'Il gestionale non c&rsquo;entra',
      html:
        '<p class="mb-0">GSG Dashboard legge il database e le API di <em>Gestione Stand ' +
        'Gastronomico</em>, ma &egrave; un progetto <strong>indipendente</strong>: non ' +
        '&egrave; affiliato ai suoi autori, non &egrave; da loro approvato e non ne ' +
        'contiene nessuna parte. Per usarlo serve una vostra installazione del ' +
        'gestionale.</p>' }
  ];

  /* --- il pannello --- */

  var pannello = null;      // costruito alla prima apertura
  var chiTeneva = null;     // a chi ridare il fuoco quando si chiude
  var versionePromise = null;   // una sola richiesta per pagina, condivisa da firma e pannello

  function sezione(s) {
    return '<section class="gsg-info-sezione">' +
           '<h4 class="gsg-info-titolo">' + s.titolo + '</h4>' + s.html +
           '</section>';
  }

  function costruisci() {
    var el = document.createElement('div');
    el.className = 'gsg-info';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'gsgInfoTitolo');
    el.innerHTML =
      '<div class="gsg-info-scheda card">' +
        '<div class="card-header">' +
          '<div>' +
            '<h3 class="card-title mb-0" id="gsgInfoTitolo">GSG Dashboard</h3>' +
            '<div class="text-secondary gsg-info-versione">Cruscotto per Gestione Stand ' +
            'Gastronomico &middot; di Alessandro Bernardin</div>' +
          '</div>' +
          '<button type="button" class="btn btn-sm ms-auto" data-info-chiudi>Chiudi</button>' +
        '</div>' +
        '<div class="card-body gsg-info-corpo">' +
          SEZIONI.map(sezione).join('') +
          '<section class="gsg-info-sezione">' +
            '<h4 class="gsg-info-titolo">Un caff&egrave;</h4>' +
            '<p>Il programma nasce per una sagra sola e viene tenuto in piedi nel tempo ' +
            'libero: &egrave; gratis e resta gratis. Se vi ha risparmiato una serata di ' +
            'conti a mano e volete offrire un caff&egrave;, fa piacere &mdash; ma non ' +
            'cambia niente di quello che avete gi&agrave; in mano.</p>' +
            '<div class="d-flex flex-wrap gap-2 align-items-center">' +
              '<a class="btn btn-primary" href="' + PAYPAL + '" target="_blank" rel="noopener noreferrer">' +
                'Offrimi un caff&egrave; su PayPal</a>' +
              '<a class="btn" href="mailto:' + EMAIL + '">Scrivimi</a>' +
              '<span class="text-secondary">PayPal e posta: <code>' + EMAIL + '</code></span>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>';

    // Si chiude premendo fuori, sul fondo scuro, oltre che col bottone: e' un
    // pannello di sola lettura, non c'e' niente da confermare o da perdere.
    el.addEventListener('click', function (ev) {
      if (ev.target === el || (ev.target.closest && ev.target.closest('[data-info-chiudi]'))) chiudi();
    });
    document.body.appendChild(el);
    chiediVersione().then(function (v) {
      el.querySelector('.gsg-info-versione').textContent =
        'Cruscotto per Gestione Stand Gastronomico · versione ' + v + ' · di Alessandro Bernardin';
    }).catch(function () { /* pazienza: resta il solo nome */ });
    return el;
  }

  /* La versione la sa il programma, non la pagina: le pagine vengono copiate
     accanto all'eseguibile e non sanno quale numero porta quello che le sta
     servendo. La dice /hub/health; dalle pagine dei rendiconti, dove la
     schermata si apre anche prima di aver messo la password, la dice
     /auth/status, che e' l'unica rotta aperta. Se non risponde nessuna delle
     due chi la voleva resta com'era: meglio nessun numero che un numero
     sbagliato.

     UNA RICHIESTA SOLA PER PAGINA. La versione serve in due posti — il nome
     in fondo alla pagina, che la mostra subito, e il pannello "Informazioni",
     che la mostra se e quando si apre — e i due non devono chiedersela due
     volte ognuno per conto suo. */
  function chiediVersione() {
    if (versionePromise) return versionePromise;
    if (!window.fetch) return (versionePromise = Promise.reject(new Error('fetch non disponibile')));

    function prova(url) {
      return fetch(url, { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error(url)); })
        .then(function (j) {
          if (!j || !j.versione) throw new Error(url);
          return j.versione;
        });
    }

    versionePromise = prova('/hub/health').catch(function () { return prova('/auth/status'); });
    return versionePromise;
  }

  /* Il nome in fondo alla pagina porta anche il numero di versione, senza
     dover aprire "Informazioni": chi segnala un problema lo legge li' e lo
     scrive nel messaggio. Il segnaposto e' gia' nell'HTML di ogni pagina
     (`<span data-versione>`, dentro gsg-firma): qui si riempie, e se la
     richiesta fallisce resta vuoto — sparisce anche il separatore, perche'
     un "·" seguito dal niente sarebbe peggio di niente. */
  function applicaFirma() {
    var spans = document.querySelectorAll('[data-versione]');
    if (!spans.length) return;
    chiediVersione().then(function (v) {
      for (var i = 0; i < spans.length; i++) spans[i].textContent = '· versione ' + v + ' ';
    }).catch(function () { /* pazienza: il nome resta senza numero */ });
  }
  applicaFirma();

  function apri() {
    chiTeneva = document.activeElement;
    if (!pannello) pannello = costruisci();
    pannello.classList.add('aperto');
    document.body.classList.add('gsg-info-aperto');
    // Sempre dall'inizio: il pannello si costruisce una volta sola e senza
    // questo, alla seconda apertura, ricompare fermo dove lo si era lasciato
    // — di solito in fondo, sul pulsante di PayPal, che e' l'ultima cosa che
    // uno vuole vedersi mettere davanti quando chiede "che roba e' questa".
    var corpo = pannello.querySelector('.gsg-info-corpo');
    if (corpo) corpo.scrollTop = 0;
    var chiudiBtn = pannello.querySelector('[data-info-chiudi]');
    if (chiudiBtn) chiudiBtn.focus();
  }

  function chiudi() {
    if (!pannello) return;
    pannello.classList.remove('aperto');
    document.body.classList.remove('gsg-info-aperto');
    if (chiTeneva && chiTeneva.focus) chiTeneva.focus();
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && pannello && pannello.classList.contains('aperto')) chiudi();
  });

  // Un ascoltatore solo, sul documento: le pagine devono soltanto mettere
  // data-info sul nome in fondo, senza chiamare niente.
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-info]') : null;
    if (!b) return;
    ev.preventDefault();
    apri();
  });

  window.GsgInfo = { apri: apri, chiudi: chiudi };
})();
