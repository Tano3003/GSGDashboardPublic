/* ============================================================================
   statistiche-comune.js — quello che le pagine dei rendiconti fanno allo
   stesso modo: la barriera della password, i filtri di periodo, la navigazione
   fra le pagine, l'esportazione in CSV e il raggruppamento dei nomi.

   Le pagine dei rendiconti stanno nello stesso sito degli ordini (una porta
   sola, un programma solo) ma dietro la password: da qui si torna agli ordini con
   l'ultima voce della barra, e dagli ordini si arriva qui con il pulsante
   "Statistiche" della dashboard.

   Sta in un file solo per la stessa ragione di info.js: la barriera della
   password scritta quattro volte diventa quattro barriere diverse dopo la
   prima correzione, e una delle quattro sarebbe quella che lascia entrare. Le
   pagine restano quasi soltanto disegno.

   Va incluso con <script src="statistiche-comune.js"></script> PRIMA dello
   script della pagina, che poi chiama GsgStat.avvia({...}).

   La pagina deve avere in HTML questi elementi, perche' sono quelli che
   questo file cerca per nome:
     #corpo #nav #sottotitolo #srvstat #selettoreTema #btnStampa #btnEsci
   e, se ha i filtri di periodo, anche questi:
     #fDa #fA #fAnno #btnApplica #btnTutte #fnote
   I filtri di periodo sono facoltativi perche' il confronto fra edizioni non
   ne ha: li' il periodo non e' uno, sono tanti — uno per edizione — e si
   scelgono in un altro modo. Il resto (password, tema, navigazione, elenco
   delle serate) vale per tutte le pagine allo stesso modo.

   La barriera della password se la costruisce da sola: non deve dipendere da
   quello che c'e' scritto nella pagina.
   ============================================================================ */
'use strict';
(function () {

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const euro = n => '€ ' + (Number(n || 0)).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = n => (Number(n || 0)).toLocaleString('it-IT');
const perc = n => (Number(n || 0)).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

async function hub(path) {
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

/* ============================================================================
   Le pagine dei rendiconti.

   Il periodo scelto viaggia nell'indirizzo (?da=&a=), cosi' passando da una
   pagina all'altra non si ricomincia da capo: chi guarda l'edizione di
   quest'anno nel confronto fra serate e poi apre gli articoli si aspetta di
   vedere gli articoli di quest'anno, non di tutto lo storico.
   ============================================================================ */
const PAGINE = [
  { file: 'statistiche.html', nome: 'Serate' },
  { file: 'articoli.html', nome: 'Articoli' },
  { file: 'ingredienti.html', nome: 'Ingredienti' },
  { file: 'confronto.html', nome: 'Edizioni' }
];

/* L'altra meta' del sito. Non e' un rendiconto e non deve sembrarlo: sta dopo
   uno stacco e piu' spenta delle altre (.gsg-nav-pagina), come le voci che
   portano fuori. Il periodo scelto non la segue — di la' i filtri sono altri,
   e la serata in corso e' quella che si guarda. */
const ORDINI = { file: 'dashboard.html', nome: 'Ordini della serata' };

const FILTRI = { da: '', a: '' };
let SERATE = [];          // elenco completo delle serate, per i menu
let PAGINA = '';          // file della pagina che ha chiamato avvia()

/** Querystring del periodo, con eventuali parametri in piu'. */
function qs(extra) {
  const p = new URLSearchParams();
  if (FILTRI.da) p.set('serata_da', FILTRI.da);
  if (FILTRI.a) p.set('serata_a', FILTRI.a);
  if (extra) for (const k in extra) p.set(k, extra[k]);
  return p.toString();
}

/** Lo stesso periodo scritto come lo leggono le pagine fra loro. */
function indirizzoPeriodo() {
  const p = new URLSearchParams();
  if (FILTRI.da) p.set('da', FILTRI.da);
  if (FILTRI.a) p.set('a', FILTRI.a);
  const s = p.toString();
  return s ? '?' + s : '';
}

function montaNav() {
  const host = $('#nav');
  if (!host) return;
  const q = indirizzoPeriodo();
  host.innerHTML = PAGINE.map(p => p.file === PAGINA
    ? `<span class="btn btn-primary active" aria-current="page">${esc(p.nome)}</span>`
    : `<a class="btn" href="${esc(p.file + q)}">${esc(p.nome)}</a>`).join('') +
    `<span class="gsg-nav-sep"></span>` +
    `<a class="btn gsg-nav-pagina" href="${esc(ORDINI.file)}" title="Torna agli ordini della serata, ai monitor e all'avanzamento">${esc(ORDINI.nome)}</a>`;
}

/* ---------- filtri di periodo ---------- */

function riempiFiltri() {
  // I due menu contengono soltanto serate esistenti: il vuoto significa
  // "senza limite". Assegnarci dentro una data inventata ("2024-01-01") non
  // selezionerebbe nulla e il filtro resterebbe vuoto senza dirlo.
  const conMenu = !!$('#fDa');
  if (conMenu) {
    const opzioni = '<option value="">—</option>' + SERATE.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('');
    $('#fDa').innerHTML = opzioni;
    $('#fA').innerHTML = opzioni;
    const anni = [...new Set(SERATE.map(s => String(s).slice(0, 4)))].sort().reverse();
    $('#fAnno').innerHTML = '<option value="">tutti gli anni</option>' +
      anni.map(a => `<option value="${esc(a)}">edizione ${esc(a)}</option>`).join('');
  }

  // Il periodo puo' arrivare dall'indirizzo, cioe' dalla pagina da cui si
  // viene. In quel caso comanda lui; se non c'e', si parte dall'edizione di
  // quest'anno come ha sempre fatto la pagina delle serate.
  //
  // Questo pezzo vale anche per la pagina del confronto, che i menu non li ha:
  // il periodo le passa in mezzo senza che lei lo usi, e riparte con le voci
  // della barra verso le altre. Chi guarda l'edizione di quest'anno, fa un
  // giro nel confronto fra edizioni e torna agli articoli, ritrova
  // quest'anno — non tutto lo storico.
  const url = new URLSearchParams(location.search);
  const da = url.get('da') || '';
  const a = url.get('a') || '';
  if (da || a) {
    FILTRI.da = SERATE.indexOf(da) >= 0 ? da : '';
    FILTRI.a = SERATE.indexOf(a) >= 0 ? a : '';
  } else {
    preselezionaAnnoCorrente();
  }
  if (conMenu) {
    $('#fDa').value = FILTRI.da;
    $('#fA').value = FILTRI.a;
    allineaAnno();
  }
}

// All'apertura non si parte da tutto lo storico ma dall'edizione dell'anno in
// corso: mentre la sagra e' aperta e' quella che si guarda, lo storico si tira
// su con "Tutte le serate". Si sceglie la prima serata VERA dell'anno, che
// filtra esattamente come farebbe il 1 gennaio ma esiste nel menu. Se
// quest'anno non si e' ancora fatta nessuna serata si lascia vuoto: meglio
// aprire su tutto lo storico che su una pagina senza dati.
function preselezionaAnnoCorrente() {
  const anno = String(new Date().getFullYear());
  const dellAnno = SERATE.filter(s => String(s).slice(0, 4) === anno).slice().sort();
  if (!dellAnno.length) return;
  FILTRI.da = dellAnno[0];
  FILTRI.a = '';
}

/** Accende la scorciatoia per anno quando il periodo scelto e' esattamente un'edizione. */
function allineaAnno() {
  if (!$('#fAnno')) return;
  const anni = [...new Set(SERATE.map(s => String(s).slice(0, 4)))];
  let scelto = '';
  for (const anno of anni) {
    const dellAnno = SERATE.filter(s => String(s).slice(0, 4) === anno).slice().sort();
    if (!dellAnno.length) continue;
    if (FILTRI.da === dellAnno[0] && FILTRI.a === dellAnno[dellAnno.length - 1]) { scelto = anno; break; }
  }
  $('#fAnno').value = scelto;
}

function applicaFiltri(carica) {
  FILTRI.da = $('#fDa').value;
  FILTRI.a = $('#fA').value;
  // L'indirizzo tiene il periodo senza ricaricare: serve alla navigazione fra
  // le pagine e a chi si salva il collegamento del rendiconto che sta
  // guardando.
  try { history.replaceState(null, '', location.pathname + indirizzoPeriodo()); } catch (e) { }
  montaNav();
  carica();
}

/* ---------- stato delle casse e filtri applicati ---------- */

function renderLeds(servers) {
  const host = $('#srvstat');
  if (!host) return;
  host.innerHTML = (servers || []).map(s =>
    `<span class="d-flex align-items-center gap-1"><span class="status-dot ${s.ok ? 'bg-green' : 'bg-red'}"></span>${esc(s.label || 'Cassa')}</span>`
  ).join('');
}

function renderNote(d, quanteSerate) {
  if (!$('#fnote')) return;
  const f = (d && d.filtri) || {}, note = (d && d.note) || [];
  const chips = [quanteSerate + (quanteSerate === 1 ? ' serata' : ' serate')];
  if (f.serata_da) chips.push('dalla ' + esc(f.serata_da));
  if (f.serata_a) chips.push('alla ' + esc(f.serata_a));
  if (!f.serata_da && !f.serata_a) chips.push('tutto lo storico');
  $('#fnote').innerHTML =
    chips.map(c => `<span class="badge bg-secondary-lt">${c}</span>`).join('') +
    note.map(n => `<span class="badge bg-yellow-lt">${esc(n)}</span>`).join('');
}

/* ============================================================================
   I nomi che il gestionale scrive con dentro il riempimento.

   Sui pulsanti della cassa i nomi vengono allineati a mano con trattini bassi
   e punti ("Patate Fritte   ________        ."), e gli ingredienti scelti
   portano davanti una freccia ("-->Salsiccia"). Fra un'edizione e l'altra il
   riempimento cambia, il piatto no: nel resoconto su piu' anni lo stesso
   articolo verrebbe fuori spezzato in due o tre righe, ognuna con una fetta
   dei suoi pezzi, e la classifica direbbe il falso.

   Per questo le pagine hanno l'interruttore "Unisci i nomi simili", acceso di
   suo. Il nome vero non viene mai toccato nei dati — le righe unite restano
   elencate nel dettaglio — e spegnendolo si torna a vedere esattamente quello
   che c'e' scritto nel gestionale.

   La normalizzazione tocca soltanto frecce, trattini bassi, punti, spazi
   doppi e maiuscole: due piatti che si chiamano davvero in modo diverso non
   finiscono mai insieme.
   ============================================================================ */
function nomePulito(s) {
  return String(s == null ? '' : s)
    .replace(/-+>/g, ' ')          // le frecce davanti agli ingredienti scelti
    .replace(/_+/g, ' ')           // il riempimento a trattini bassi
    .replace(/\.{2,}/g, ' ')       // i puntini di riempimento
    // Il punto isolato che chiude la riga se ne va; quello attaccato a una
    // parola resta, perche' li' e' un'abbreviazione vera: "Bott. Serprino" e
    // "Lat. Coca cola" non vanno storpiate per far pulizia.
    .replace(/(^|\s)\.+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
function chiaveNome(s) { return nomePulito(s).toLowerCase(); }

/**
 * Somma le righe che hanno la stessa chiave.
 *   opt.chiavi  campi che formano la chiave (default: solo opt.nome)
 *   opt.nome    campo del nome, l'unico che viene normalizzato
 *   opt.somme   campi numerici da sommare
 *   opt.minimi  campi testuali da unire con il minimo (prima serata)
 *   opt.massimi campi testuali da unire con il massimo (ultima serata)
 *   opt.primi   campi testuali che prende il primo che ce l'ha (tipologia)
 *   opt.unisci  false = si raggruppa per nome esatto, non normalizzato
 * Ogni riga risultante porta _varianti: i nomi veri che sono finiti dentro.
 */
function raggruppa(righe, opt) {
  const nome = opt.nome;
  const chiavi = opt.chiavi || [nome];
  const somme = opt.somme || [];
  const minimi = opt.minimi || [];
  const massimi = opt.massimi || [];
  const primi = opt.primi || [];
  const unisci = !!opt.unisci;
  const testo = v => String(v == null ? '' : v);

  const per = new Map();
  (righe || []).forEach(r => {
    // Separatore NUL fra i pezzi della chiave, come fa il server: con uno
    // spazio o un trattino la chiave si spezzerebbe nel punto sbagliato al
    // primo articolo che si chiama "Bigoli - anatra".
    const k = chiavi.map(c => c === nome
      ? (unisci ? chiaveNome(r[c]) : testo(r[c]))
      : testo(r[c])).join('\u0000');
    let a = per.get(k);
    if (!a) {
      a = { _varianti: [] };
      chiavi.forEach(c => a[c] = testo(r[c]));
      // L'etichetta e' il nome ripulito. Le righe arrivano gia' dalla piu'
      // venduta alla meno, quindi la prima variante incontrata e' anche la
      // piu' rappresentativa del gruppo.
      a[nome] = unisci ? nomePulito(r[nome]) : testo(r[nome]).trim();
      somme.forEach(c => a[c] = 0);
      minimi.concat(massimi).forEach(c => a[c] = null);
      primi.forEach(c => a[c] = '');
      per.set(k, a);
    }
    somme.forEach(c => a[c] += Number(r[c] || 0));
    minimi.forEach(c => { const v = testo(r[c]); if (v && (a[c] === null || v < a[c])) a[c] = v; });
    massimi.forEach(c => { const v = testo(r[c]); if (v && (a[c] === null || v > a[c])) a[c] = v; });
    primi.forEach(c => { if (!a[c] && r[c]) a[c] = testo(r[c]); });
    const grezzo = testo(r[nome]);
    if (grezzo && a._varianti.indexOf(grezzo) < 0) a._varianti.push(grezzo);
  });
  return [...per.values()];
}

/**
 * In quante serate diverse compare ogni voce. Si conta sul dettaglio gia'
 * raggruppato e mai sommando i numeri delle casse: due casse che lavorano la
 * stessa sera la conterebbero due volte.
 */
function contaSerate(voci, dettaglio, campo) {
  const per = new Map();
  (dettaglio || []).forEach(r => {
    const k = r[campo];
    if (!per.has(k)) per.set(k, new Set());
    per.get(k).add(r.serata);
  });
  voci.forEach(v => { const s = per.get(v[campo]); v.n_serate = s ? s.size : 0; });
}

/* ============================================================================
   Esportazione CSV.

   Punto e virgola come separatore e virgola per i decimali: e' quello che si
   aspetta Excel con le impostazioni italiane, ed e' li' che finisce il conto
   di fine sagra. Il BOM iniziale serve sempre a Excel, che senza legge i
   caratteri accentati come spazzatura.
   ============================================================================ */
function csv(nomeFile, intestazioni, righe) {
  const cella = v => {
    let s = String(v == null ? '' : v);
    if (typeof v === 'number') s = v.toLocaleString('it-IT', { useGrouping: false, maximumFractionDigits: 2 });
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const testo = [intestazioni.join(';')].concat(righe.map(r => r.map(cella).join(';'))).join('\r\n');
  const blob = new Blob(['﻿' + testo], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nomeFile;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

/** Nome del periodo da mettere nel nome del file esportato. */
function periodo() {
  return (FILTRI.da || 'inizio') + '_' + (FILTRI.a || 'oggi');
}

/* ============================================================================
   Barriera della password.

   /auth/status dice due cose: se una password e' gia' stata impostata
   (configured) e se QUESTO browser ha gia' una sessione valida
   (authenticated). Da qui in poi tre casi:
     - autenticato: si carica la pagina;
     - configurato ma non autenticato: si chiede la password;
     - non configurato: e' il primo accesso di sempre, si chiede di sceglierne
       una — e la si chiede due volte, perche' qui non c'e' modo di recuperarla
       se viene sbagliata battendola.

   Il modulo se lo costruisce questo file: se stesse nell'HTML sarebbe scritto
   quattro volte, e quattro barriere che divergono sono peggio di nessuna.
   ============================================================================ */
function costruisciGate() {
  const g = document.createElement('div');
  g.className = 'gsg-gate';
  g.id = 'gate';
  g.style.display = 'none';
  g.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div class="gsg-intestazione mb-3">
          <div class="gsg-occhiello">Dashboard Gestione stand gastronomico</div>
          <h2 class="gsg-titolo" id="gateTitolo">Statistiche</h2>
        </div>
        <p class="text-secondary" id="gateTesto"></p>
        <div class="mb-3" id="gateConfermaWrap" style="display:none">
          <label class="form-label" for="gatePwd2">Conferma password</label>
          <input type="password" class="form-control" id="gatePwd2" autocomplete="new-password">
        </div>
        <div class="mb-3">
          <label class="form-label" for="gatePwd" id="gateEtichettaPwd">Password</label>
          <input type="password" class="form-control" id="gatePwd" autocomplete="current-password">
        </div>
        <div class="alert alert-danger py-2" id="gateErrore" style="display:none"></div>
        <button class="btn btn-primary w-100" id="gateBtn">Entra</button>
      </div>
    </div>`;
  document.body.appendChild(g);
}

async function mostraGate(dopoAccesso) {
  let stato;
  try {
    const r = await fetch('/auth/status', { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    stato = await r.json();
  } catch (e) {
    document.body.innerHTML = '<div class="container-tight py-6"><div class="text-center text-danger">Impossibile contattare GSGDashboard.</div></div>';
    return;
  }

  if (stato.authenticated) { entra(dopoAccesso); return; }

  costruisciGate();
  const primaVolta = !stato.configured;
  $('#gate').style.display = 'flex';
  $('#gateTitolo').textContent = primaVolta ? 'Imposta la password' : 'Statistiche protette';
  $('#gateTesto').textContent = primaVolta
    ? 'Prima di tutto, scegli la password per accedere alle statistiche. Verrà salvata (cifrata) in gsgdashboard.json e richiesta a ogni accesso successivo.'
    : 'Inserisci la password per continuare.';
  $('#gateEtichettaPwd').textContent = primaVolta ? 'Nuova password' : 'Password';
  $('#gateConfermaWrap').style.display = primaVolta ? '' : 'none';
  $('#gateBtn').textContent = primaVolta ? 'Imposta ed entra' : 'Entra';
  $('#gateBtn').onclick = () => inviaGate(primaVolta, dopoAccesso);
  const invioConTasto = e => { if (e.key === 'Enter') inviaGate(primaVolta, dopoAccesso); };
  $('#gatePwd').onkeydown = invioConTasto;
  $('#gatePwd2').onkeydown = invioConTasto;
  $('#gatePwd').focus();
}

async function inviaGate(primaVolta, dopoAccesso) {
  const pwd = $('#gatePwd').value;
  const err = $('#gateErrore');
  err.style.display = 'none';

  if (primaVolta) {
    const pwd2 = $('#gatePwd2').value;
    if (pwd.length < 6) { err.textContent = 'La password deve avere almeno 6 caratteri.'; err.style.display = ''; return; }
    if (pwd !== pwd2) { err.textContent = 'Le due password non coincidono.'; err.style.display = ''; return; }
  } else if (!pwd) {
    err.textContent = 'Inserisci la password.'; err.style.display = ''; return;
  }

  $('#gateBtn').disabled = true;
  let r;
  try {
    r = await fetch(primaVolta ? '/auth/setup' : '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd })
    });
  } catch (e) {
    err.textContent = 'Servizio non raggiungibile.'; err.style.display = '';
    $('#gateBtn').disabled = false;
    return;
  }
  $('#gateBtn').disabled = false;

  if (!r.ok) {
    let messaggio = 'Non è stato possibile continuare.';
    try { const d = await r.json(); if (d && d.error) messaggio = d.error; } catch (e) { }
    err.textContent = messaggio; err.style.display = '';
    $('#gatePwd').value = '';
    $('#gatePwd').focus();
    return;
  }

  $('#gate').style.display = 'none';
  entra(dopoAccesso);
}

function entra(dopoAccesso) {
  $('#corpo').style.display = '';
  dopoAccesso();
}

/* ============================================================================
   Avvio della pagina.

   Si passa il nome del file (per sapere quale voce della navigazione accendere)
   e la funzione che carica e disegna i dati. Tutto il resto — password, tema,
   filtri, stampa, uscita — lo fa questo file.
   ============================================================================ */
function avvia(opzioni) {
  PAGINA = opzioni.pagina;
  const carica = opzioni.carica;

  mostraGate(async function () {
    GsgTema.montaSelettore('#selettoreTema');
    montaNav();
    $('#btnStampa').onclick = () => window.print();
    $('#btnEsci').onclick = async () => {
      try { await fetch('/auth/logout', { method: 'POST' }); } catch (e) { }
      location.reload();
    };
    // I comandi del periodo si collegano solo dove esistono: il confronto fra
    // edizioni non li ha (vedi il commento in cima al file).
    if ($('#btnApplica')) {
      $('#btnApplica').onclick = () => { allineaAnno(); applicaFiltri(carica); };
      $('#btnTutte').onclick = () => {
        $('#fDa').value = ''; $('#fA').value = ''; $('#fAnno').value = '';
        applicaFiltri(carica);
      };
      $('#fAnno').onchange = () => {
        const v = $('#fAnno').value;
        if (!v) { $('#fDa').value = ''; $('#fA').value = ''; }
        else {
          const dellAnno = SERATE.filter(s => String(s).slice(0, 4) === v).slice().sort();
          if (!dellAnno.length) return;
          $('#fDa').value = dellAnno[0];
          $('#fA').value = dellAnno[dellAnno.length - 1];
        }
        applicaFiltri(carica);
      };
    }

    try {
      const b = await hub('/hub/bootstrap');
      SERATE = b.serate || [];
      riempiFiltri();
      montaNav();
    } catch (e) { /* senza elenco serate i menu restano vuoti: il periodo e' "tutto" */ }

    if (opzioni.pronto) opzioni.pronto();
    await carica();
  });
}

window.GsgStat = {
  $: $, esc: esc, euro: euro, num: num, perc: perc,
  hub: hub, qs: qs, periodo: periodo, filtri: FILTRI,
  serate: () => SERATE,
  avvia: avvia, renderLeds: renderLeds, renderNote: renderNote,
  nomePulito: nomePulito, chiaveNome: chiaveNome,
  raggruppa: raggruppa, contaSerate: contaSerate,
  csv: csv
};

})();
