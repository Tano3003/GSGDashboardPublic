/* ===========================================================================
   serata.js — quando comincia la serata che si sta guardando.

   Una riga di regola, ma sta in un file suo perche' la usano piu' pagine (la
   dashboard e il tabellone dei monitor) e devono usarla uguale: se la
   dashboard dice "da stamattina alle 8" e il tabellone accanto dice "l'ultima
   serata in archivio", i due schermi mostrano numeri diversi e chi li guarda
   pensa che uno dei due sbagli.

   LE OTTO E NON LA MEZZANOTTE. La serata finisce dopo le 24: gli ordini
   battuti all'una di notte appartengono alla sera prima. Partendo dalla
   mezzanotte se li porterebbe dentro spezzando la serata in due; alle 8 del
   mattino la cassa e' ferma di sicuro, e nessuna serata sconfina fin li'.

   E DOPO MEZZANOTTE SI TORNA INDIETRO DI UN GIORNO. Alle 00:30 "oggi alle 8"
   sarebbe un istante nel futuro, e ogni schermo si svuoterebbe di colpo nel
   momento di punta. Prima delle 8 la serata in corso e' ancora quella di
   ieri, quindi si parte dalle 8 di ieri.

   Il formato e' quello dei campi <input type="datetime-local">
   (AAAA-MM-GGThh:mm): le pagine ce lo scrivono dentro cosi' com'e', e da li'
   finisce nel parametro "from" dell'API.
   =========================================================================== */
(function () {
  'use strict';

  var ORA_INIZIO = 8;

  function inizio() {
    var d = new Date();
    if (d.getHours() < ORA_INIZIO) d.setDate(d.getDate() - 1);
    var due = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + due(d.getMonth() + 1) + '-' + due(d.getDate()) +
           'T' + due(ORA_INIZIO) + ':00';
  }

  window.GsgSerata = { inizio: inizio, ORA_INIZIO: ORA_INIZIO };
})();
