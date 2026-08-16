# Diario delle modifiche — GSGProxy

Che cosa è cambiato, quando, e **perché**: il motivo conta più dell'elenco,
perché fra una sagra e l'altra passano dodici mesi e la ragione di una scelta è
la prima cosa che si dimentica.

Il numero di **versione è unico per i tre programmi** (sta in
`Directory.Build.props`): GSGProxy, GSGDashboard e GSGStatistiche si installano
e si aggiornano insieme, e una cassa con un GSGProxy vecchio accanto a una
dashboard nuova è esattamente il tipo di guaio che una versione sola evita. Per
questo le voci qui sotto sono raggruppate per **data**, non per numero: dentro
la 2.0.0 ci sta tutto quello che è successo finora.

Le date sono quelle in cui la modifica è entrata nei sorgenti, non quelle del
rilascio del pacchetto pubblico (che si produce con
`strumenti\PRODUCI_RELEASE.ps1`).

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
