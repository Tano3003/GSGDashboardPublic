# Diario delle modifiche — GSGDashboard

Che cosa è cambiato, quando, e **perché**: il motivo conta più dell'elenco,
perché fra una sagra e l'altra passano dodici mesi e la ragione di una scelta è
la prima cosa che si dimentica.

Il numero di **versione è unico per i tre programmi** (sta in
`Directory.Build.props`): GSGProxy, GSGDashboard e GSGStatistiche si installano
e si aggiornano insieme. Per questo le voci qui sotto sono raggruppate per
**data**, non per numero: dentro una stessa versione ci sta tutto quello che è
successo fra un pacchetto e il successivo.

Le date sono quelle in cui la modifica è entrata nei sorgenti, non quelle del
rilascio del pacchetto pubblico (che si produce con
`strumenti\PRODUCI_RELEASE.ps1`).

> **Le pagine si aggiornano da sole, la cache no.** Le pagine di `wwwroot\`
> viaggiano con l'eseguibile e vengono copiate accanto a lui a ogni build. Il
> service worker (`sw.js`) le prende «prima dalla rete», quindi basta
> ricaricare; ma quando cambia l'elenco `SHELL` dentro `sw.js` il numero di
> cache va alzato, e sui monitor già aperti serve un ricaricamento forzato.

---

## 2026-08-16

### Aggiunto

- **`avanzamento_mobile.html`: l'avanzamento immediato fatto per un telefono.**
  La schermata di prima è pensata per una postazione ferma con un monitor
  davanti; chi gira fra i tavoli con il telefono in una mano e lo scontrino
  nell'altra usava la stessa pagina, e su uno schermo da sei pollici metà di
  quello che c'era sopra era roba da spostare col dito prima di arrivare al
  campo di lettura.

  Resta il campo di lettura e resta il registro delle letture, uno sopra
  l'altro e alti quanto lo schermo — il registro scorre dentro di sé, il campo
  non si muove. Prima, con la pagina lunga, il campo scappava in alto appena il
  registro si riempiva: e succedeva proprio mentre il lettore ci stava
  scrivendo dentro.

  **Via la barra in cima** — tema, impostazioni, schermo intero. Sono tre
  comandi che si usano una volta sola nella vita del dispositivo, e su un
  telefono in mano sono soprattutto tre comandi che si premono per sbaglio. Il
  tema scelto resta comunque quello (`tema.js` lo legge lo stesso); lo schermo
  intero su un telefono non vuol dire niente. Quel poco che era configurabile
  sta nell'indirizzo, dove per un collegamento salvato è anche il posto giusto:
  `?serata=` e `?suono=0`.

  **Niente conferma, di proposito**: si legge e l'ordine avanza. È il senso
  della schermata, e per questo non c'è nemmeno l'anteprima dell'ordine, che
  senza una conferma da dare sarebbe solo roba che scorre via. La copia cliente
  continua a evadere tutti i reparti dell'ordine, con un POST per reparto come
  nell'altra pagina. Il caso dei due ordini con lo stesso numero su database
  diversi qui non si risolve: sceglierne uno al posto di chi legge sarebbe
  peggio che non fare niente, quindi lo si dice e si rimanda alla schermata con
  la conferma.

- **Due suoni che non si possono confondere**, sulla schermata mobile. Chi legge
  non guarda lo schermo: guarda lo scontrino successivo. Non basta quindi che i
  due segnali siano diversi — devono esserlo in mezzo al rumore di una sagra, e
  a memoria, perché nessuno si ricorda «era una nota o due?» fra due suoni
  simili. Andata bene: due note pulite che **salgono**, sinusoidali, corte.
  Andata male: due note basse che **scendono**, onda quadra, lunghe il doppio.
  La direzione e il timbro bastano da soli, anche senza sentire l'altezza.

  Insieme al suono ci sono una **vibrazione** (diversa nei due casi: è l'unico
  segnale che arriva con il telefono in tasca) e un **lampo di colore** sulla
  scheda della lettura, verde o rosso. Tre segnali per la stessa cosa perché
  ognuno dei tre, da solo, in qualche situazione non arriva.

  Il contesto audio si sblocca al primo tocco o al primo tasto — compreso
  l'Invio del lettore — perché Android e iOS non fanno suonare niente prima.
  Senza, la prima lettura della serata sarebbe muta proprio mentre si sta
  verificando che il suono funzioni.

- **Finestra «manca la rete»**, sempre sulla schermata mobile: quando il server
  smette di rispondere copre tutto, il campo si spegne e le letture si fermano.
  Con un telefono che cammina la copertura wi-fi va e viene, e la cosa peggiore
  che possa succedere è continuare a passare scontrini credendo che stiano
  avanzando: venti ordini persi senza accorgersene. Sparisce da sola quando la
  rete torna, senza ricaricare niente.

  Un guasto di rete e un «no» del server sono due cose diverse e restano
  distinte: il primo apre la finestra, il secondo è una riga nel registro
  (`fetch` lancia un `TypeError` solo quando non arriva da nessuna parte). Il
  controllo è la stessa chiamata che chiede la configurazione delle casse
  — ogni venti secondi quando va, ogni quattro quando non va: una richiesta in
  più solo per chiedere «ci sei?» sarebbe traffico per sapere una cosa che già
  si sa. Anche gli eventi `online`/`offline` del browser vengono ascoltati, ma
  «torna online» non chiude la finestra da solo: che il *server* risponda resta
  da verificare.

### Cambiato

- **«Ordini ancora da evadere» adesso sono quadrati, non più una tabella**, in
  `avanzamento.html`. Sono gli stessi del tabellone ordini: il numero e basta,
  grande, con la tinta che distingue la cassa quando le casse sono due.

  La tabella aveva dieci colonne — ora, tavolo, cliente, coperti e lo stato di
  ogni reparto — dentro mezza pagina, e la domanda a cui si risponde da lì è
  una sola: «il 14 è ancora da fare?». Per rispondere bisognava scorrere le
  righe una per una. Con i quadrati la si legge a colpo d'occhio, che è
  esattamente il motivo per cui il tabellone è fatto così.

  Quale reparto si stia guardando lo dice già lo specchietto dei codici qui
  sopra, che è lo stesso filtro di prima e continua a valere: le colonne degli
  stati ripetevano quella scelta dieci volte per riga. Ora, tavolo e stati
  degli altri reparti non sono spariti — stanno nel dettaglio dell'ordine, che
  si apre passando il mouse su un quadrato o cliccandolo, come sul tabellone.

  I quadrati sono in **ordine di numero crescente**, mentre la tabella partiva
  dal più recente: in mezzo a cinquanta numeri se ne trova uno solo se
  crescono.

- **Nello specchietto dei codici compaiono solo i reparti che hanno ancora
  qualcosa da evadere**, oltre a «Tutti», e ognuno porta scritto sopra quanti
  ne mancano. Un reparto a zero era un pulsante che portava a una schermata
  vuota; sparendo dice anche una cosa che prima non si vedeva da nessuna
  parte — chi ha finito.

- **Le schede dei reparti si accendono e si spengono una per una**, invece di
  sceglierne una sola. Non si sceglie *un* reparto: si sceglie quali guardare
  insieme. Chi tiene due banchi vicini — cucina e rosticceria sotto lo stesso
  tendone — doveva prima passare dall'uno all'altro, e nel frattempo la metà
  che non stava guardando non esisteva. «Tutti» riaccende tutto in un colpo.

  Nell'indirizzo: `?reparti=cucina,pizzeria`. `?reparto=` al singolare vale
  ancora, così i collegamenti già salvati continuano a funzionare, e vale come
  «solo questo acceso». Come la conferma e il suono, quello che arriva
  dall'indirizzo **non** si salva sul monitor: un collegamento nei preferiti
  resta quello che dice di essere. Toccando una scheda, invece, la scelta resta.

  Sotto sotto si salva **chi è spento**, non chi è acceso. Sembra la stessa
  cosa detta al contrario e non lo è: un reparto che stasera non ha ancora
  ordini non è a video, e un elenco di accesi lo lascerebbe fuori per sempre —
  il primo fritto arriva alle nove e la rosticceria comparirebbe già spenta
  senza che nessuno l'abbia spenta.

- **I quadrati hanno il colore del reparto**, gli stessi dello specchietto,
  della produzione e della dashboard. Un quadrato non dice più «l'ordine 14
  manca», dice «l'ordine 14 manca **alla cucina**»: con più reparti accesi la
  prima non basta, perché il 14 può essere finito in cucina e non in pizzeria.
  Un ordine che manca a due reparti accesi compare quindi **due volte**, una
  per reparto.

  Restano in ordine di numero crescente, e a parità di numero nell'ordine delle
  schede (11 cliente, 12 cucina, 13 pizzeria, …): i quadrati dello stesso
  ordine stanno appaiati, e due «14» vicini — uno arancione e uno rosso —
  dicono cucina e pizzeria senza che ci sia scritto niente. Raggruppare per
  reparto avrebbe rimesso a video gli elenchi separati che si volevano unire.

  **«Cliente» è passato a indaco.** Prendeva il blu di serie del tema, che
  andava bene finché il colore stava solo sulle schede, una alla volta; sui
  quadrati finiva accanto al bar, azzurro, e i due erano indistinguibili.
  Indaco è l'unica tinta libera che non somiglia alle altre e che non vuol già
  dire qualcosa: il verde qui è lo stato «evaso», e un quadrato verde avrebbe
  detto il contrario di quello che è.

  Con due casse il colore è ormai occupato dal reparto e non può dire anche da
  dove viene l'ordine: quello lo dice il **contorno**, che sulla prima cassa
  non c'è. Serve perché i numeri d'ordine si ripetono fra una cassa e l'altra.

  In fondo all'elenco ci sono due numeri e non più uno: quanti quadrati e su
  quanti ordini. Sono due domande diverse — «quanti pezzi di lavoro restano» e
  «quanta gente sta ancora aspettando».

  **Il conteggio è quello del tabellone, non quello delle colonne di stato.**
  È una differenza che si vede: il gestionale lascia `ordinato` anche le
  colonne dei reparti che con quell'ordine non c'entrano niente, e nessuno le
  fa mai avanzare — la copia di quel reparto non viene nemmeno stampata, e la
  copia cliente salta apposta i reparti che non producono. Contando le colonne,
  la rosticceria di una serata senza fritti sarebbe rimasta a quattro ordini
  fino a domani mattina e la sua scheda non sarebbe sparita mai. Adesso i
  reparti di produzione si contano con la stessa domanda del tabellone
  (`/hub/monitor/ordini`: in stato di partenza **e** con almeno una riga di
  quel reparto), e le due schermate dicono finalmente lo stesso numero — prima
  ne dicevano due diversi per lo stesso reparto. «Cliente» non è un reparto di
  produzione e resta contato sulla sua colonna `stato_cliente`; stessa strada
  per un database senza le colonne `copia_*`, che il tabellone salterebbe.
  «Tutti» è l'unione dei due, senza doppioni.

- **Anche le due schermate di produzione mostrano solo i reparti che hanno
  qualcosa da preparare** (`reparto.html` e `reparto_ingredienti.html`). Una
  sagra ne usa tre o quattro: gli altri esistono nel database e basta, e
  stavano nella fila delle schede a occupare mezza riga per portare a una
  schermata vuota. Il reparto che si sta guardando resta sempre, anche a zero:
  è la pagina in cui si è, e togliergli la scheda vorrebbe dire non sapere più
  dove si è finiti.

  I conteggi arrivano da `/hub/monitor/ordini`, la stessa domanda del tabellone
  e dell'avanzamento, così tutte e quattro le schermate dicono lo stesso numero.
  La domanda parte in parallelo a quella dei dati: se va storta, la pagina si
  carica lo stesso e le schede restano quelle di prima. Se non sa rispondere —
  un database senza le colonne `copia_*` non produce nessun blocco — si tornano
  a vedere tutte, perché lì nascondere tutto sarebbe peggio che non nascondere
  niente.

- **Via il tema e le impostazioni da tutte le schermate tranne «Ordini della
  serata»** (la dashboard). Sono comandi che si usano una volta nella vita di
  un monitor e che sulle schermate di lavoro si premono soprattutto per
  sbaglio: la pagina di avanzamento ha un campo che deve tenersi il fuoco per
  il lettore di codici a barre, e ogni pulsante in più è una lettura persa.

  Il **tema** si sceglie ora soltanto dalla configurazione della dashboard.
  Non si perde niente: la scelta sta in `localStorage`, che è per-dispositivo,
  e le altre pagine la applicano lo stesso (`tema.js`) — anche quelle già
  aperte in un'altra scheda, che si adeguano da sole.

  Sono spariti i cassetti delle impostazioni di `avanzamento.html` e
  `stato_ordine.html`. Quello che contenevano si scrive nell'indirizzo, che per
  un collegamento salvato è anche il posto giusto — è il collegamento a dire
  cosa fa, e il monitor accanto non se lo porta dietro:
  `?subito=1`, `?conferma=0`, `?suono=0`, `?serata=`, `?elenco=1`, `?reparto=`
  sull'avanzamento; `?serata=` e `?auto=1` sul dettaglio ordine. `?suono=0` è
  nuovo, gli altri c'erano già. Il perché la fotocamera non sia disponibile,
  che si leggeva nel cassetto, finisce nella console del browser: è una domanda
  che ci si fa una volta per dispositivo.

  I pulsanti **Filtri** delle schermate di produzione e del tabellone restano
  dove sono: quelli non configurano il monitor, scelgono cosa guardare.

- **Via la spiegazione della copia cliente** sotto i codici dei reparti, in
  `avanzamento.html`: due righe che si leggevano il primo giorno e poi
  restavano lì. La stessa cosa la dice il suggerimento della scheda «Cliente»,
  e la dice l'avviso che compare quando una copia cliente passa davvero sotto
  il lettore, cioè nel momento in cui serve saperlo.

- `sw.js` alla cache **v13**: l'elenco `SHELL` adesso contiene anche la pagina
  nuova. Sui dispositivi già aperti serve un ricaricamento forzato.

---

## 2026-08-15

### Aggiunto

- **Tasto destro su uno stato per invertirlo**, nella tabella degli ordini e nel
  cassetto del dettaglio. Un ordine evaso per sbaglio — la copia sbagliata sotto
  il lettore, un clic di troppo — restava evaso, e per rimetterlo a posto
  bisognava aprire il gestionale mentre la serata andava avanti. Adesso il tasto
  destro sul badge lo riporta dall'altra parte, nei due sensi, e un avviso in
  fondo allo schermo dice che cosa è appena successo. Il nuovo stato compare
  **subito** su tutti i badge che parlano di quell'ordine e di quel reparto —
  quello nella tabella e quello nel cassetto del dettaglio, che spesso sono
  aperti tutti e due — con il valore che ha risposto la cassa e non con una
  previsione: aspettare il giro di aggiornamento vorrebbe dire mezzo secondo in
  cui lo schermo dice il contrario di quello che è appena successo, e nel
  cassetto, che nessuno ridisegna, quel mezzo secondo non finirebbe mai.

  Il tasto **destro** e non il sinistro perché il sinistro sulla riga apre già il
  dettaglio dell'ordine, ed è il gesto che si fa cento volte in una sera:
  scrivere sul gestionale non deve poter capitare per uno di quelli. Su tablet e
  telefono il posto del tasto destro lo prende il dito tenuto premuto, che il
  browser traduce nello stesso evento.

  Niente finestrella di conferma, di proposito: l'operazione è simmetrica, e il
  modo più veloce per rimediare a un'inversione sbagliata è rifarla. Un «sei
  sicuro?» costerebbe un clic a tutte le volte buone per risparmiarne uno alle
  rare volte sbagliate.

  I due stati non li sceglie la dashboard: sono quelli che la cassa dichiara in
  `/hub/avanzamento` (di serie `ordinato` e `evaso`), letti per cassa, perché due
  casse su database diversi possono essere configurate in modo diverso. Uno stato
  che non è nessuno dei due — per esempio `lavorazione` — non ha un contrario, e
  allora non si tocca niente e lo si dice. Richiede **GSGProxy della stessa
  versione**: è lui che ha imparato ad andare all'indietro (`"verso"`).

- **Elenco degli ordini ancora da evadere** in fondo alle due schermate di
  avanzamento, chiuso finché non lo si apre. La schermata sapeva dire benissimo
  che cosa era appena passato sotto il lettore e niente di quello che non ci era
  ancora passato; chi sta al banco la domanda se la fa lo stesso — «quanti ne
  mancano?», «il 14 è già uscito?» — e per rispondere doveva aprire un'altra
  pagina.

  È la **stessa tabella della schermata Ordini**, riga per riga: numero, ora,
  tavolo, cliente, coperti e lo stato di ogni reparto. Niente totale né forma di
  pagamento: qui si guarda che cosa manca da preparare, e i soldi non c'entrano
  (erano anche le due colonne più larghe). I
  numeri sono vivi (`ordine.js`): passandoci sopra si vede l'ordine, cliccandoli
  si apre per intero. Si aggiorna da solo ogni quindici secondi **e subito dopo
  ogni evasione**, altrimenti diventerebbe la cosa a video di cui non ci si fida
  più.

- **La schermata di avanzamento è stata rimessa in ordine su due colonne**, una
  per parte: a **sinistra** si lavora — lettura del codice, codici dei reparti,
  elenco di quello che manca — a **destra** compare quello che succede: l'ordine
  appena letto e, sotto, il registro delle letture di prima. Prima l'ordine
  letto stava sotto al campo di lettura e a ogni scansione spingeva in basso
  tutto il resto: la pagina ballava ogni volta che qualcuno passava uno
  scontrino sotto il lettore, e le cose ferme non stavano mai nello stesso
  posto.

- **Lo specchietto «Codici dei reparti» è diventato il filtro** di quell'elenco:
  le stesse schede affiancate della schermata di produzione — codice sopra, nome
  del reparto sotto, tinta del reparto — più un «Tutti» in testa, e il conteggio
  sulla scheda scelta. Era una legenda che si leggeva una volta il primo giorno
  e poi restava lì: nove righe una sull'altra che mangiavano mezza pagina in
  altezza per scrivere nove parole corte, con tutto lo spazio a destra vuoto.
  Adesso stanno in due file, la stessa parola serve a due cose, e il filtro non
  ha avuto bisogno di comandi nuovi da nessun'altra parte. Il reparto scelto si
  riconosce anche nella tabella: la sua colonna di stato è in grassetto.

  L'elenco legge da `/hub/orders` con lo stesso filtro che usa la dashboard
  (`?reparto=…&stato=…`); senza reparto, `stato=ordinato` prende gli ordini che
  hanno almeno un reparto ancora da fare — che è esattamente «tutti». Lo stato
  cercato non è scritto nella pagina ma è quello di partenza dichiarato dalla
  cassa. Una postazione fissa può aprire tutto già impostato con
  `avanzamento.html?elenco=1&reparto=pizzeria`, e la scelta non si porta dietro
  sugli altri monitor.

  I comandi sono pulsanti e non interruttori: il lettore di codici a barre scrive
  dove c'è il fuoco, e un `<input>` che se lo tiene si mangerebbe la lettura
  successiva.

- **Il dettaglio dietro a ogni numero d'ordine** (`wwwroot\ordine.js`, nuovo).
  Sui monitor il numero d'ordine era un riquadro con dentro una cifra e basta:
  diceva che l'ordine 214 esiste e aspetta, non che cosa c'è dentro. Per saperlo
  bisognava andare alla dashboard, ritrovare l'ordine nella tabella e aprirlo —
  con qualcuno che aspetta al banco non lo fa nessuno.

  Adesso, passando sopra il numero con il mouse, compare un riquadro con il
  riepilogo (ora, tavolo, coperti, cliente, le pietanze, lo stato dei reparti,
  il totale); facendoci clic si apre l'ordine per intero in un cassetto
  laterale, lo stesso della dashboard. Vale sul **tabellone ordini** e negli
  elenchi «Vedi i N ordini» in fondo alle due schermate di **produzione**.
  Funziona anche con la tastiera (Tab, Invio, Esc).

  Le pagine non chiamano niente: disegnano il numero con `data-ordine-id` e
  `data-ordine-srv`, e gli eventi stanno una volta sola sul documento. Queste
  pagine si ridisegnano da sole ogni pochi secondi, e agganciare gli eventi
  elemento per elemento avrebbe voluto dire ricordarsi di richiamare una
  funzione dopo ogni disegno.

  Due cose imparate provandolo su un tabellone che si aggiorna ogni due
  secondi, ed entrambe fanno sparire il riquadro se non si sta attenti: il
  numero sotto il mouse viene **sostituito** da uno nuovo identico e il browser
  non manda nessun `mouseout`; e se il ridisegno capita fra il passaggio del
  mouse e l'arrivo dei dati, il riquadro non compare proprio. Per questo il
  riquadro è agganciato **all'ordine** e non all'elemento: quando il numero
  viene rifatto si riaggancia a quello nuovo, e si chiude solo se quell'ordine
  esce davvero dal tabellone.

### Cambiato

- **Produzione: le pietanze seguono il listino della cassa.** L'elenco di
  `reparto.html` è ordinato per `articoli.posizione` del gestionale — lo stesso
  ordine dei pulsanti in cassa — invece che alfabeticamente. Resta stabile come
  prima (le schede non si spostano a ogni aggiornamento), ma in più è la stessa
  sequenza che ha sotto gli occhi chi batte l'ordine. Le pietanze non più a
  listino finiscono in fondo, mai in cima: non è roba che si sta preparando
  adesso.

  Nel pannello dei filtri l'opzione «per nome della pietanza» è stata
  **sostituita** da «come nel listino della cassa» (`?ordina=pos`); resta «per
  quantità». Qualunque valore salvato che non sia `qta` — compreso il vecchio
  `nome`, che era il predefinito di tutti — viene letto come ordine del listino:
  aggiungendo una terza voce, nessuno avrebbe visto la modifica.

- **Scheda Monitor: via le due file di pulsanti** «Produzione:» e «Produzione
  ingredienti:», una per reparto. Erano otto collegamenti alle stesse due pagine
  che si aprono dalla barra in alto, dove il reparto poi si sceglie a video.

- **Un solo pulsante «Configurazione»** in testata, al posto dei tre comandi
  sparsi che c'erano prima: l'interruttore «Somma server», i tre bottoncini del
  tema e il pulsante «Server». Sono tre cose che si impostano una volta a
  inizio sagra e non si toccano più, ma stavano in prima fila a ogni ricarica,
  su ogni schermo, rubando spazio ai pallini delle casse e all'ora
  dell'ultimo aggiornamento — che invece si guardano di continuo. Su un tablet
  la testata andava a capo due volte solo per farci stare comandi che nessuno
  premeva.

  Adesso aprono tutti lo stesso cassetto laterale, diviso in quattro parti con
  scritto sopra **per chi vale** ciascuna: casse e somma stanno sull'hub e
  valgono per tutti; tema e installazione stanno nel browser e valgono solo per
  quel dispositivo. Era una differenza che non si indovinava, e chi cambiava il
  tema credendo di cambiarlo a tutti i monitor restava male. La somma continua
  ad applicarsi subito, gli indirizzi delle casse continuano a volere **Salva**.

- **Produzione: le schede dei reparti prendono tutta la riga.** Si ammucchiavano
  a sinistra alla larghezza delle parole, e con sette reparti su un monitor largo
  restava mezzo schermo vuoto a destra: spazio buttato, e bersagli più piccoli
  del necessario proprio dove lo spazio non mancava. Adesso si dividono la riga.
  Chi ha tre o quattro reparti se li ritrova larghi il triplo, che su uno schermo
  appeso in cucina è esattamente quello che serve. Sul telefono restano le due
  colonne di prima.

- **«Stato ordine» si chiama «Dettaglio ordine»** (`stato_ordine.html`, indirizzo
  invariato). Il nome vecchio si confondeva con le colonne «stato» della tabella
  ordini e con gli stati dei reparti, che sono un'altra cosa: quella pagina non
  mostra uno stato, mostra l'ordine intero con dentro anche gli stati.

- **La barra delle schede: due comandi al posto di nove voci.** Ordini,
  Reparti e Monitor sono un selettore a segmenti — tre bersagli larghi uguali,
  a tutta pagina sul telefono — e le sei schermate che si aprono in una scheda
  nuova (performance, stato ordine, le due di produzione, i due avanzamenti)
  stanno in un menu' **Altre schermate**, raggruppate per Controllo, Produzione
  e Avanzamento.

  Prima erano nove voci in fila con lo stesso aspetto: le tre che cambiano
  scheda restando nella pagina si perdevano fra le sei che portano altrove, e
  su un telefono la riga andava a capo due volte lasciando bersagli alti mezzo
  dito. In più il *perché* di ogni schermata era scritto in un suggerimento del
  mouse, che sul telefono non compare mai: adesso è una riga sotto il titolo,
  che si legge sempre.

  Il menu' è un `<details>`, non un dropdown di Bootstrap: qui c'è solo il CSS
  di Tabler, e il dropdown vorrebbe il JavaScript del framework. Le tre righe
  aggiunte servono a chiuderlo quando si guarda altrove (clic fuori, Esc, o
  scelta di una voce).

### Rimosso

- **Il collegamento «Statistiche ↗»** dalla testata della dashboard.
  GSGStatistiche è un sito a parte, con la sua porta e la sua password, e serve
  proprio a far vedere gli incassi a chi non deve entrare nella dashboard
  operativa: metterne il collegamento su ogni monitor aperto sotto il tendone
  andava nella direzione opposta. Il sito non cambia e resta raggiungibile
  digitando `http://<pc-server>:8081/`, come dice `docs\INSTALLAZIONE.md`.

## 2026-08-13

### Aggiunto

- **`performance.html`** — quanto ci mette ogni reparto a evadere un ordine.
  Legge i tempi dalle colonne `evaso_*` che GSGProxy si crea da solo. Con più
  casse la **media** viene rifatta sulle somme e non è la media delle medie
  (sarebbe sbagliata appena le casse hanno numeri di ordini diversi), e la
  **mediana** non viene mostrata affatto invece di essere mostrata sbagliata:
  non è ricombinabile a partire dai riassunti.
- **`stato_ordine.html`** — si passa un ordine sotto il lettore e si vede a che
  punto sono tutti i reparti.
- **`reparto_ingredienti.html`** — quanto di ciascun ingrediente preparare,
  sommato fra tutti i piatti che lo usano. Su un «tris libero» il nome del
  piatto non dice niente a chi sta alla griglia: gli serve sapere che in coda ci
  sono cinque salsicce e due costine.
- **`avanzamento.html` rifatta**, con la modalità «avanzamento immediato»
  (`?subito=1`): ogni lettura evade sul colpo, e la pagina lo dichiara con un
  riquadro in alto perché è una modalità che non chiede conferma.
- Endpoint `/hub/performance` e `/hub/ordine/barcode`, con la relativa
  aggregazione fra casse in `Merge.cs`.

## 2026-08-10

### Cambiato

- **Rinominato da SGSDashboard a GSGDashboard**, configurazione ed eseguibile
  compresi.
- **Le statistiche non vivono più qui.** `statistiche.html` è diventata
  **GSGStatistiche**, un sito a parte con la sua porta e una password: i numeri
  di incasso non devono essere leggibili da chiunque passi davanti a un tablet
  lasciato aperto, mentre la dashboard è fatta apposta per restare accesa e
  visibile.

## 2026-07-31

### Aggiunto

- **Prima versione in C#** (.NET Framework 4.8) al posto degli script Python: un
  solo `.exe`, con dentro il sito e l'aggregatore delle casse.
- **Le pagine parlano solo con l'hub**, sulla loro stessa origine: gli indirizzi
  delle casse si configurano **una volta sola** dal pulsante Server della
  dashboard, e i monitor non hanno niente da configurare. Prima ogni schermata
  andava impostata sul suo monitor.
- Somma di più casse su ordini, statistiche e riepiloghi di reparto, con le
  chiavi di aggregazione sempre testuali: due ordini con lo stesso progressivo
  su casse diverse sono ordini diversi.
- `dashboard.html` (ordini, reparti, monitor), `reparto.html`,
  `monitor_ordini.html`, `avanzamento.html`, e il service worker per tenere in
  cache le pagine ma **mai** le chiamate a `/hub`.

### Corretto

- **Filtri, schermata di reparto e ricarica pagina**: lo stato finisce
  nell'indirizzo, così F5 non riporta alla scheda di partenza e un monitor si
  può aggiungere ai preferiti già configurato.
- **Ascolto a doppia pila** (`Shared\MiniHttp.cs`): `http://localhost` non
  rispondeva quando il nome si risolveva in IPv6.
