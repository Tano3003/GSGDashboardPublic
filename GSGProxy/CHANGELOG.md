# Diario delle modifiche — GSGProxy

Che cosa è cambiato, quando, e **perché**: il motivo conta più dell'elenco,
perché fra una sagra e l'altra passano dodici mesi e la ragione di una scelta è
la prima cosa che si dimentica.

Il numero di **versione è unico per i due programmi** (sta in
`Directory.Build.props`): GSGProxy e GSGDashboard si installano e si aggiornano
insieme, e una cassa con un GSGProxy vecchio accanto a una dashboard nuova è
esattamente il tipo di guaio che una versione sola evita. Per
questo le voci qui sotto sono raggruppate per **data**, non per numero: dentro
la 2.0.8 ci sta tutto quello che è successo finora.

Le date sono quelle in cui la modifica è entrata nei sorgenti, non quelle del
rilascio del pacchetto pubblico (che si produce con
`strumenti\PRODUCI_RELEASE.ps1`).

---

## 2026-09-16

### Aggiunto

- **`GET /api/monitor/ordini`: adesso il dettaglio porta anche `asporto`.**
  Come già fa `/api/orders`. Serve alla dashboard per mettere gli ordini da
  asporto in testa all'elenco «ancora da evadere» e segnarli con una "A" sui
  quadrati dei reparti di produzione — cosa che prima poteva fare solo per
  "cliente", l'unico reparto che passava da `/api/orders`.

## 2026-08-25

### Aggiunto

- **`GET /api/stats/articoli`**: una riga per articolo venduto nel periodo —
  pezzi, incasso, categoria, in quanti ordini è comparso, prima e ultima serata
  — più il dettaglio per serata di **tutti** gli articoli, non solo di quelli
  chiesti per nome. Finora l'unico modo di sapere quanto avesse reso un piatto
  era sommare a mano le serate: c'era la classifica delle quantità e c'era
  l'incasso della serata, ma i due numeri non si incontravano da nessuna parte.

- **`GET /api/stats/ingredienti`**: la stessa cosa dal lato degli ingredienti —
  quanta salsiccia, quanto pane, quante patate se ne sono andate — con il
  dettaglio per serata e quello **per piatto**, che è metà della risposta:
  sapere che sono uscite 242 salsicce serve a poco senza sapere che 212 stavano
  nei panini e 30 nel piatto con le patate. Il conto degli ingredienti la
  dashboard lo faceva già, ma solo per la serata in corso e reparto per
  reparto (`/api/reparti`); qui è su tutto il periodo e senza reparto.

- Tutte e due stanno in `src\Api\StatsArticoli.cs`, altra metà della classe
  `ApiEndpoints`, e accettano gli stessi filtri di `/api/stats/serate`
  (`serata_da`, `serata_a`, `from`, `to`…). Senza filtri prendono **tutte** le
  serate, come fa `/api/stats/serate` e a differenza di tutti gli altri
  endpoint: qui l'ultima serata da sola servirebbe a poco.

### Note

- **Si raggruppa per `descrizionebase`, non per `descrizione`.** Il testo di
  riga si porta dentro gli ingredienti scelti («Panino Salsiccia con
  -->Formaggio, -->Ketchup»): raggruppando per quello, lo stesso panino
  uscirebbe spezzato in una riga per ogni combinazione. È la stessa scelta
  della classifica di `/api/stats/serate`, ed è anche il motivo per cui i due
  totali coincidono al centesimo.

- **Si usa `WhereSenzaStato`.** Questo è il totale di quanto è stato *venduto*
  nel periodo, non «cosa c'è ancora da preparare»: un filtro di stato lo farebbe
  scendere sotto il venduto reale. Vale anche per il dettaglio per serata, che
  deve sommare esattamente al totale della riga.

- **Gli ingredienti non portano soldi, ed è voluto.** In `righe_ingredienti`
  una colonna `prezzo` c'è, ma il totale dell'ordine non la usa: un panino con
  dentro un ingrediente da un euro resta al prezzo del panino (`Imponibile()`
  somma solo `righe_articoli`). Una colonna «incassato» per gli ingredienti
  sarebbe un numero che non torna con nessun altro del sito, quindi la risposta
  ha solo quantità.

- **Il dettaglio è completo, senza `LIMIT`, apposta.** È quello che permette a
  chi somma più casse di sommare esatto: «i primi N di ogni cassa» sarebbero
  insiemi diversi, e il totale verrebbe fuori con i numeri di una cassa sola.
  Stesso ragionamento dell'andamento in `/api/stats/serate`. Su questo database
  (2951 ordini, 65 serate, 190 articoli) tutto lo storico sono 154 KB e un
  decimo di secondo; il periodo che si guarda di solito è un'edizione, cioè un
  ventesimo di quello.

- Se `righe_ingredienti` non c'è — installazioni che gli ingredienti non li
  usano — `/api/stats/ingredienti` risponde `disponibile: false` con le liste
  vuote, non un errore.

---

## 2026-08-23

### Aggiunto

- **`to` (alias `al`, `fino`): l'altro estremo del periodo**, compreso. Prima
  c'era solo `from` e si poteva dire da quando, non fino a quando; adesso i due
  insieme chiudono un intervallo, e `to` da solo vale «tutto quello che c'è
  stato fino a lì». Come `from`, quando c'è il filtro è assoluto: senza serata
  indicata abbraccia tutte le serate.
- Il confronto sull'ora arriva fino al secondo 59 del minuto scritto: l'ora del
  gestionale ha i secondi, il campo del sito no. Con un taglio netto al minuto,
  un ordine delle 23:30:40 resterebbe fuori da un periodo che finisce alle
  23:30 e nessuno capirebbe perché.

---

## 2026-08-22

### Cambiato

- **«Pagato» e «incassato» sono quello che resta in cassa**, cioè
  `totalePagato` meno il `resto`. Il gestionale scrive in `totalePagato` la
  cifra che il cliente ha consegnato, resto compreso: chi pagava un ordine da
  18 € con una banconota da 50 faceva sembrare la serata più ricca di 32 €.
  Il conto sta in un punto solo (`Incassato()`) e vale per `/api/orders`,
  `/api/orders/{id}`, `/api/stats` e `/api/stats/serate`.
- **Le colonne grezze `totalePagato` e `resto` non escono più dall'API**: al
  loro posto c'è il solo campo `pagato`, già netto. Erano due numeri che, letti
  separatamente, si prestavano soltanto a essere sommati per sbaglio.
- Le `COALESCE` stanno su ciascuna colonna e non intorno alla `SUM`: con un
  `resto` a NULL la sottrazione darebbe NULL e la somma salterebbe l'ordine
  intero, perdendo anche il suo pagato. Dove la colonna `resto` non esiste
  proprio (gestionali più vecchi) si usa il solo `totalePagato`.
- **Il numero di versione lo dice l'assembly**, cioè `<Version>` in
  `Directory.Build.props`, invece di una costante scritta a mano nel codice.
  Quella costante era rimasta indietro senza che nessuno se ne accorgesse: il
  programma diceva 2.0.0 con il pacchetto già alla 2.0.4. Una versione
  sbagliata è peggio di nessuna versione, perché chi la chiede lo fa per
  capire un guaio.
- **La licenza non è più MIT**: GSG Dashboard è gratuito ma non è libero — si
  può usare
  quanto si vuole, passarlo ad altre sagre intero e gratis, ritoccare le pagine
  di `wwwroot` per la propria; non si può venderlo, decompilarlo o presentarlo
  come proprio. La MIT diceva il contrario di quello che il pacchetto fa già:
  si pubblicano soltanto i binari protetti con .NET Reactor. Testo intero nel
  file `LICENSE`, riassunto nella schermata di informazioni delle
  pagine web (GSGProxy non ne ha: non pubblica pagine).

### Aggiunto

- **`/api/stats/serate` dice anche i totali per tipo di pagamento**, nella
  stessa forma che `/api/stats` usa già per la serata singola (`{tipo, n,
  tot}`): chi somma le casse tratta le due risposte allo stesso modo. Il totale
  è lo stesso `Incassato()` del campo «incassato», cioè il pagato meno il
  resto — le due cifre devono tornare, altrimenti a fine sagra si passa la sera
  a cercare la differenza.
- Gli ordini **senza** tipo di pagamento finiscono sotto una voce esplicita,
  «(non impostato)», invece di sparire: sono soldi entrati, e una colonna che
  non somma al totale sarebbe peggio di una voce brutta da vedere. Dove la
  colonna non esiste proprio, l'elenco torna vuoto e il resto della risposta
  non cambia.

---

## 2026-08-17

### Cambiato

- **Parte nascosto, con un'icona nella tray di Windows** invece che con una
  finestra nera da tenere aperta per tutta la serata: da lì (tasto destro)
  si trova **Mostra log** e **Esci**. Il testo del setup non si chiama più
  "GSG - Gestione Stand Gastronomico" — nome identico al gestionale vero,
  facile da confondere con quello — ma **"GSG Dashboard"**, con il gestionale
  citato come sottotitolo.
- **Log giornaliero con NLog**, sette giorni di storia (poi si cancellano da
  soli): prima non c'era nessun file di log, solo la console. Il file di oggi
  è quello che apre "Mostra log" dalla tray.

---

## 2026-08-15

### Aggiunto

- **`/api/reparti`: ogni articolo porta `posizione`**, cioè
  `articoli.posizione` del gestionale — l'ordine in cui i pulsanti stanno sullo
  schermo della cassa. Serve alla schermata di produzione per disporre le
  pietanze come sono in cassa invece che in ordine alfabetico: chi produce e chi
  batte l'ordine guardano così la stessa sequenza.

  Il legame si fa **per nome** e non per id, perché nelle righe d'ordine il
  gestionale l'id dell'articolo non lo salva: ci sono solo le descrizioni
  (`descrizione`, `descrizionebase` e `aggregato`, che sui database visti sono
  sempre la stessa stringa). È lo stesso legame che le statistiche già usano per
  la classifica degli articoli.

  Vale `null` per le pietanze che a listino non ci sono più — edizioni passate,
  o rinominate dopo. Chi legge le mette in fondo, non in cima. Se la tabella
  `articoli` manca del tutto (installazione che non usa il listino), il campo
  arriva `null` per tutti e nient'altro cambia.

- **`POST /api/avanzamento/avanza` accetta `"verso"`**: `"avanti"` (il valore di
  serie, com'era prima) porta lo stato da `statoDa` a `statoA`, `"indietro"` fa
  il contrario. Un ordine evaso per sbaglio — la copia sbagliata passata sotto
  il lettore, un clic di troppo — restava evaso per sempre, e l'unico rimedio
  era aprire il gestionale a mano nel mezzo della serata.

  Non cambia niente di quello che l'endpoint può toccare: sempre e solo la
  colonna `stato_<reparto>` dell'ordine indicato, sempre e solo su PostgreSQL,
  sempre con lo stato di partenza scritto dentro l'`UPDATE` — che tornando
  indietro è `statoA`, così due postazioni che ci provano insieme non si
  sovrascrivono a vicenda. Gli stati restano quelli del `gsgproxy.json` della
  cassa: da fuori si sceglie il verso, non il valore.

  Tornando indietro si azzera anche `evaso_<reparto>`, nella stessa istruzione.
  Un ordine di nuovo «da fare» che si tiene l'ora in cui era stato evaso è un
  tempo di evasione inventato dentro `/api/performance`, e nessuno andrebbe mai
  a cercarlo lì.

---

## 2026-08-13

### Aggiunto

- **`GET /api/ordine/barcode`** — l'ordine intero dietro a un codice a barre,
  con lo stato di tutti i reparti. È quello che serve per rispondere a «a che
  punto è questo ordine» passando lo scontrino sotto il lettore.
- **`GET /api/performance`** — tempi di evasione per reparto: minimo, massimo,
  media, mediana, più la **somma** dei minuti e il conteggio. La somma non è un
  di più: serve a chi aggrega più casse, perché la media delle medie è sbagliata
  appena le casse hanno numeri di ordini diversi.
- **Colonne `evaso_<reparto>` create da GSGProxy** all'avvio
  (`src\Data\Migrazioni.cs`), una per reparto, sulla tabella `ordini`. Nel
  gestionale non esistono: lui tiene solo lo stato testuale, che dice dove sta
  l'ordine **adesso** ma non quando ci è arrivato. Senza queste colonne i tempi
  di evasione non sono ricostruibili. Nascono vuote e nessun dato del gestionale
  viene toccato; se la tabella è occupata da una transazione si riprova più
  tardi invece di bloccarla.
- **`avanzamento.tracciaTempi`** in `gsgproxy.json` per spegnere quanto sopra:
  con `false` lo schema non viene modificato per niente, al prezzo di non avere
  i tempi.
- **Reparti generici `reparto1`, `reparto2`, `reparto3`** accanto a cucina, bar,
  pizzeria e rosticceria: non tutte le sagre hanno gli stessi banchi.
- **Filtro `stato_cliente`** e, dentro `Filters`, un `Where` **senza** le
  condizioni su stato e reparto. I report che contano tutto il periodo — la
  classifica degli articoli venduti — con un filtro di stato applicato
  escluderebbero pezzi davvero venduti dal totale.

## 2026-08-10

### Cambiato

- **Rinominato da SGSProxy a GSGProxy**, con il file di configurazione
  (`gsgproxy.json`) e l'eseguibile. Le sigle in giro per il progetto erano due
  per la stessa cosa.

## 2026-07-31

### Aggiunto

- **Prima versione in C#** (.NET Framework 4.8), al posto degli script Python
  che c'erano prima: un solo `.exe` da copiare, niente interprete da installare
  sui PC di cassa.
- API REST di **sola lettura** sul database del gestionale, con lo stesso
  comportamento su **SQLite e PostgreSQL** — le differenze di dialetto stanno
  tutte in `src\Data\SqlDialect.cs`, e i nomi veri delle colonne (il gestionale
  ne crea in camelCase) si leggono dal database all'avvio invece di indovinarli.
- **Avanzamento di stato da codice a barre**: l'unica scrittura del programma, e
  tocca solo la colonna `stato_<reparto>` dell'ordine letto. Funziona solo con
  PostgreSQL; con SQLite il file resta aperto in sola lettura.
- Filtri comuni a tutti gli endpoint (serata, ora, momento assoluto, numero
  d'ordine), con `filtri` e `note` riportati in ogni risposta: la risposta dice
  sempre che cosa è stato applicato davvero.

### Corretto

- **Ascolto a doppia pila** (`Shared\MiniHttp.cs`, condiviso con gli altri due
  programmi): `http://localhost` non rispondeva quando il nome si risolveva in
  IPv6 e il programma ascoltava solo in IPv4.
