# Diario delle modifiche — GSGDashboard

Che cosa è cambiato, quando, e **perché**: il motivo conta più dell'elenco,
perché fra una sagra e l'altra passano dodici mesi e la ragione di una scelta è
la prima cosa che si dimentica.

Il numero di **versione è unico per i due programmi** (sta in
`Directory.Build.props`): GSGProxy e GSGDashboard si installano e si aggiornano
insieme. Per questo le voci qui sotto sono raggruppate per **data**, non per
numero: dentro una stessa versione ci sta tutto quello che è successo fra un
pacchetto e il successivo.

Le date sono quelle in cui la modifica è entrata nei sorgenti, non quelle del
rilascio del pacchetto pubblico (che si produce con
`strumenti\PRODUCI_RELEASE.ps1`).

> **Le pagine si aggiornano da sole, la cache no.** Le pagine di `wwwroot\`
> viaggiano con l'eseguibile e vengono copiate accanto a lui a ogni build. Il
> service worker (`sw.js`) le prende «prima dalla rete», quindi basta
> ricaricare; ma quando cambia l'elenco `SHELL` dentro `sw.js` il numero di
> cache va alzato, e sui monitor già aperti serve un ricaricamento forzato.

---

## 2026-10-03

### Aggiunto

- **`--demo`: il sito con dati di prova.** `GSGDashboard.exe --demo` (o
  `strumenti\AVVIA_GSGDashboard_DEMO.bat`) sostituisce le casse vere con due
  casse finte in memoria, che rispondono con la stessa forma di GSGProxy:
  serate passate per i rendiconti, una serata di oggi che si muove da sola per
  monitor e tabellone, avanzamento di stato funzionante. Dettagli nel README,
  sezione «Modalità demo».

  **Perché.** Per vedere tutte le pagine serviva un database aggiornato, cioè
  una cassa vera con ordini veri: fuori stagione non c'è, e con una serata
  spenta i monitor sono vuoti e non si capisce se una modifica funziona. La
  finta sta *dentro* `Upstream` e non nelle pagine, così le pagine vengono
  provate esattamente come girano alla sagra.

  **Cosa non fa, apposta.** Non legge né scrive `gsgdashboard.json` — nemmeno
  la password — e rifiuta il salvataggio delle casse: lanciare la prova non può
  sporcare la configurazione vera. Le pagine mostrano una targhetta «DEMO» in
  basso a sinistra, perché una schermata di prova non si scambi per la serata.

- **Produzione per reparto: filtro per tipologia.** Sotto i pulsanti dei
  reparti compare una seconda riga con le tipologie degli articoli (primi,
  contorni, bibite...), a scelta multipla; senza nessuna scelta si vedono tutte.
  La scelta sta anche nell'indirizzo (`&tipologie=Primi|Dolci`, separate da `|`
  perché i nomi possono avere virgole) e viene ricordata dal monitor.

  **Perché.** Il reparto dice dove si prepara, non che cosa: la cucina fa primi,
  contorni e dolci, e chi sta ai primi non vuole i dolci in mezzo.

  **Cose da sapere.** I pezzi si ricalcolano sull'elenco filtrato, gli ordini
  no: il server li conta per reparto e non dice quali articoli contiene
  ciascuno, quindi con il filtro attivo il riquadro mostra un trattino invece di
  un numero che non c'entra con quello che si vede. Le tipologie scelte restano
  a video anche se in quel reparto non ce n'è più nessuna, altrimenti il
  filtro si spegnerebbe da solo e tornerebbe tutto l'elenco. Serve GSGProxy
  aggiornato (`/api/reparti` manda ora `tipologia` su ogni articolo): con una
  cassa non aggiornata la riga non compare.

- **Giacenza di magazzino su pietanze e ingredienti, con un interruttore.**
  Nei filtri di «Produzione per reparto» e di «Produzione ingredienti» c'è
  «Mostra la giacenza di magazzino (dove c'è)» (indirizzo: `&magazzino=1`). Acceso,
  il numerone di ogni scheda che ha una giacenza nel gestionale diventa
  «ordinato / netto», per esempio **12 / 26**, dove netto è **giacenza meno
  ordinato**: molto più piccolo del numero da preparare, verde se resta
  qualcosa e rosso a zero o sotto. Sotto la riga dell'orario resta «Magazzino:
  N», la giacenza di adesso così com'è nel gestionale. Le voci senza giacenza
  restano com'erano, e se nessuna ce l'ha lo dice una targhetta in alto invece
  di sembrare rotto.

  **Attenzione al doppio conteggio.** Se il gestionale scala la giacenza già
  quando si batte l'ordine, l'ordinato è già dentro la giacenza e il netto lo
  sottrae una seconda volta. Il calcolo è quello richiesto; va tenuto presente
  leggendo il numero.

  **Perché un interruttore e non sempre.** Il proxy fa due letture in più a ogni
  giro e i monitor si ricaricano ogni tre secondi; chi non tiene il magazzino non
  deve pagarle. Spento, la richiesta non le chiede nemmeno.

  **Cosa è il numero.** È la giacenza registrata nel gestionale (tabella
  `giacenze`, quella che `/api/listino` chiama già `giacenza`), non un conto
  fatto qui. Non è sommata fra le casse: due GSGProxy sullo stesso PostgreSQL
  leggono la stessa scorta e sommarla la raddoppierebbe, quindi vale il primo
  valore che arriva. Serve GSGProxy aggiornato. In demo quasi tutte le voci
  hanno una giacenza (poche no, apposta) che scende da sola man mano che arrivano
  gli ordini, come fa il gestionale: scorta di inizio serata meno tutto quello
  che risulta ordinato stasera, anche se già evaso.

- **Schermata «Giacenze»: le scorte si vedono e si correggono.** Un pulsante
  **Giacenze**, subito dopo **Monitor** nella schermata iniziale, apre
  `giacenze.html`: articoli (raggruppati per tipologia) e ingredienti con la
  loro giacenza, la ricerca, e per ogni voce una casella con due pulsanti:
  **Imposta** scrive quel numero, **Aggiungi** lo somma (con il segno meno lo
  toglie) alla giacenza di quel momento. La pagina dice subito dopo
  «prima → dopo».

  **Perché due pulsanti.** Il gestionale scala la giacenza a ogni ordine, quindi
  fra il momento in cui si legge il numero e quello in cui se ne scrive un altro
  qualche ordine è già passato: «Imposta» lo cancella, «Aggiungi» no, perché
  è un'unica istruzione per il database (scorta = scorta + N). Servono tutti e
  due: «Imposta» dopo un conteggio, «Aggiungi» quando arriva merce.

  **Scrive solo su PostgreSQL, sempre.** Come l'avanzamento di stato, e con la
  stessa cura: con SQLite il file resta aperto in sola lettura e la pagina
  mostra «Sola lettura». Il controllo è triplo (configurazione, database
  realmente in uso, connessione in scrittura che SQLite non apre) e vale anche
  per l'avanzamento, che prima guardava solo la configurazione. Si può
  spegnere anche su PostgreSQL con `"giacenze": { "abilitato": false }` in
  `gsgproxy.json`.

  **Senza password.** Come l'avanzamento di stato, la pagina e la scrittura non
  chiedono la password: chi apre la pagina può correggere le scorte. (Una prima
  versione la chiedeva, la stessa dei rendiconti; è stata tolta su richiesta.) A
  tenere le scritture fuori dal database sbagliato non è la password ma il
  proxy, che scrive solo su PostgreSQL.

  **Cosa non fa.** Non crea la giacenza di una voce che non ne ha (risponde
  «non gestito a magazzino»): decidere di gestirla è una scelta da fare nel
  gestionale. Non somma le giacenze fra casse: con database separati ci sono due
  magazzini e la pagina offre una scheda per ciascuno; con più casse sullo stesso
  PostgreSQL ce n'è uno solo e si vede una volta. Ogni correzione lascia una riga
  nel registro di GSGProxy. Serve GSGProxy aggiornato. In demo funziona in
  memoria e le correzioni si vedono anche sulle schermate di produzione.

- **Giacenze di prova mai negative, e niente più icona sul pulsante.** Nella
  demo la giacenza si ferma a zero quando la scorta è finita (prima poteva
  scendere sotto, e un magazzino negativo non ha senso). Impostare la giacenza a
  un numero negativo è rifiutato, nella demo e nel proxy: quasi certamente è un
  segno battuto per sbaglio, e per toglierne c'è «Aggiungi» con un numero
  negativo. Il pulsante **Giacenze** nella schermata iniziale è solo testo.

- **«Applica» non perde più il ricaricamento.** Se si premeva «Applica» mentre
  era in corso un aggiornamento, quello nuovo veniva saltato; con
  l'aggiornamento automatico spento i filtri appena scelti (per esempio la
  giacenza) non comparivano finché non si ricaricava la pagina. Ora il
  ricaricamento viene ripetuto appena finisce quello in corso. Vale per le
  pagine «Produzione per reparto» e «Produzione ingredienti».

---

## 2026-09-16

### Aggiunto

- **La versione nel nome in fondo alla pagina.** Il nome del programma, in
  fondo a ogni pagina accanto ad "Alessandro Bernardin", porta adesso anche il
  numero di versione — senza dover aprire "Informazioni". Vale per tutte le
  undici pagine che hanno quella firma.

  **Perché.** Chi segnala un problema lo scrive nel messaggio, e prima
  bisognava andare a cercarlo aprendo il pannello.

  **Una sola richiesta per pagina.** `info.js` chiedeva la versione a
  `/hub/health` (o `/auth/status` sui rendiconti) solo alla prima apertura del
  pannello; adesso la chiede sempre, appena la pagina è pronta, perché il nome
  in fondo va riempito subito e non alla prima apertura. Il pannello, quando
  si apre, riusa la stessa risposta invece di chiederla una seconda volta.

- **Avanzamento ordini: l'asporto in testa all'elenco.** Nell'elenco «ordini
  ancora da evadere» (avanzamento.html), un nuovo pulsante accanto a "Dividi
  per reparto" — "Metti in testa l'asporto" — mette gli ordini da asporto
  davanti agli altri, in ogni vista (in fila o a colonne). Dentro ogni gruppo
  resta l'ordine di numero di prima. Si può anche aprire già così, con
  `?ordina=asporto` nel collegamento.

  **Perché.** Chi porta via il pacchetto non si siede: vederlo prima
  nell'elenco vuol dire poterlo preparare per primo, senza dover leggere ogni
  quadrato per capire quali sono da asporto.

  I quadrati stessi distinguono l'asporto con un puntino discreto in un
  angolo, nel colore del reparto (CSS `.gsg-pill-asporto` in `sagra.css`): il
  fondo del quadrato dice già il reparto (`bg-*-lt`), quindi l'asporto non
  poteva avere anche lui un colore o una lettera vistosa senza confondere le
  due domande. Il titolo, al passaggio del mouse, dice "asporto" per esteso.

  **Un campo che prima non arrivava fin qui.** I quadrati dei reparti di
  produzione (cucina, pizzeria, ...) vengono da `/api/monitor/ordini`, che
  prima non selezionava la colonna `esportazione`: la "A" e l'ordinamento per
  asporto valgono anche lì solo perché quella colonna è stata aggiunta alla
  query lato GSGProxy (`ApiEndpoints.MonitorOrdini`), col nome `asporto` come
  già fa `/api/orders`.

## 2026-08-25

### Aggiunto

- **`confronto.html`: le edizioni una accanto all'altra.** Quarta pagina dei
  rendiconti, dietro la stessa password delle altre tre. Confronta fino a
  quattro edizioni **sui totali** — incassato, ordini, scontrino medio, coperti,
  asporti, omaggi e come hanno pagato — oppure **serata per serata**, con la
  misura da scegliere e l'interruttore dei valori cumulati. Ogni cifra porta
  accanto lo scarto rispetto all'edizione di riferimento, che di suo è quella
  precedente alla più recente: la domanda che ci si fa a sagra finita è
  «rispetto all'anno scorso».

  **Perché la data di partenza si indica edizione per edizione.** Le sagre
  durano lo stesso numero di giorni e cominciano lo stesso giorno della
  settimana, ma non lo stesso giorno del mese: il venerdì d'apertura è il 25
  luglio un anno e il 24 quello dopo. Allineare per data di calendario
  metterebbe il venerdì di quest'anno accanto al sabato di quello scorso, e il
  sabato di una sagra non somiglia a nessun venerdì. Quindi si dice dove
  comincia ogni edizione e da lì le serate si affiancano per posizione.

  **Perché per scostamento di giorni e non per ordine di arrivo.** La seconda
  serata è quella del giorno dopo l'inizio, non «la seconda che compare nei
  dati»: se un anno si è saltata una sera si sposterebbe tutto il resto
  dell'edizione di un giorno, e da lì in poi il confronto sarebbe fra sere
  sbagliate. Con lo scostamento la sera saltata resta un buco al posto giusto.

  **La partenza però se la propone da sola**, e non è «la prima serata
  dell'anno»: nel database, accanto alle serate della sagra, ci sono le prove e
  le feste minori (nel 2023 compaiono il 3 luglio e il 1° agosto). Si cerca il
  blocco di serate consecutive più lungo dell'anno, tollerando un giorno di
  pausa — le sagre sono file di sere attaccate, le serate sparse no.

  **Quattro edizioni al massimo, ed è una scelta.** Le edizioni sono in ordine,
  quindi non prendono quattro colori diversi ma un colore solo a intensità
  crescente: più è carica, più l'edizione è recente. Si legge senza guardare la
  legenda e funziona anche per chi i colori non li distingue — ma dalla quinta
  gradazione due tinte vicine non si distinguono più, e un grafico illeggibile
  è peggio di un limite dichiarato.

  **Sul server non è cambiato niente.** La pagina chiama `/hub/stats/serate`,
  quello della pagina delle serate, una volta per edizione con `serata_da` e
  `serata_a` calcolati sulla finestra. Una richiesta per edizione e non una sola
  su tutto lo storico perché le finestre non sono contigue.

### Cambiato

- **I filtri di periodo di `statistiche-comune.js` sono diventati
  facoltativi.** Erano obbligatori — la pagina doveva avere `#fDa`, `#fA`,
  `#fAnno`, `#btnApplica`, `#btnTutte`, `#fnote` — e il confronto fra edizioni
  non ne ha nessuno: lì il periodo non è uno, sono tanti. Password, tema,
  navigazione ed elenco delle serate continuano a valere per tutte le pagine
  allo stesso modo. Il periodo scelto altrove **passa attraverso** il confronto
  senza che lui lo usi, così chi ci fa un giro e torna agli articoli ritrova
  quello che stava guardando.

- **Il numero di cache del service worker è passato a `gsg-shell-v17`**, perché
  l'elenco `SHELL` adesso comprende `confronto.html`. Sui monitor già aperti
  serve un ricaricamento forzato.

- **GSGStatistiche non è più un programma a parte: è entrato qui dentro.** Un
  eseguibile solo, una porta sola (8080), un'icona sola nella tray, un file di
  configurazione solo. Le tre pagine dei rendiconti — `statistiche.html`,
  `articoli.html`, `ingredienti.html` — sono adesso pagine di questo sito, e
  rispondono sulla stessa porta di tutte le altre.

  **Perché.** I due programmi facevano lo stesso mestiere sugli stessi dati e
  ne pagavano il conto due volte: due elenchi di casse da tenere allineati a
  mano (`gsgdashboard.json` e `gsgstatistiche.json`), e bastava cambiare
  l'indirizzo di una cassa in un file solo per ritrovarsi due siti che dicevano
  numeri diversi senza che si capisse il perché. Sotto c'era la stessa cosa
  scritta due volte: `Upstream.cs` era una copia ridotta, `Merge.cs` un'altra
  copia con dentro gli stessi aiuti — e due copie, dopo la prima correzione
  fatta da una parte sola, cominciano a rispondere in modo diverso.

- **La password resta, e protegge esattamente quello che proteggeva prima.**
  Non è la porta a tenere fuori chi non deve vedere gli incassi, è la password:
  `/hub/stats/serate`, `/hub/stats/articoli` e `/hub/stats/ingredienti`
  rispondono solo con una sessione valida (`src\Hub\AuthEndpoints.cs`), tutto
  il resto — ordini, reparti, monitor, avanzamento — resta aperto come è sempre
  stato, perché sta su schermi appesi in cucina.

  `/hub/stats` **senza** barra non è fra le rotte protette, ed è voluto: sono i
  totali della serata in corso che la dashboard mostra in cima, sugli stessi
  monitor aperti a tutti, ed erano pubblici anche prima. Quello che si protegge
  è lo storico, cioè quanto ha reso l'edizione.

- **La password non va reimpostata dopo l'aggiornamento.** Al primo avvio, se
  in `gsgdashboard.json` non ce n'è ancora una, il programma la prende dal
  vecchio `gsgstatistiche.json` rimasto accanto all'eseguibile e se la scrive
  (`DashboardConfig.MigraDaStatistiche`). Senza, il sito avrebbe chiesto di
  sceglierne una nuova come al primo accesso di sempre — e chi fosse arrivato
  per primo sulla pagina se la sarebbe presa. Il vecchio file non viene
  toccato.

### Aggiunto

- **Un pulsante per andare dall'una all'altra metà.** Nella barra della
  dashboard, accanto ad «Altre schermate», c'è **Statistiche**; nella barra dei
  rendiconti, dopo uno stacco, c'è **Ordini della serata**. Prima l'unico modo
  di passare da una parte all'altra era sapersi a memoria l'indirizzo con la
  porta giusta (`:8081`), scritto solo in `docs\INSTALLAZIONE.md`.

### Note

- **`/auth/status` non va mai in cache** (`sw.js`, cache alzata a `v16`): dice
  se questo browser è già entrato, e una risposta vecchia mostrerebbe il modulo
  della password a chi è già dentro — o, peggio, il contrario. Le tre pagine
  dei rendiconti sono entrate nell'elenco `SHELL`.

- **Il diario di GSGStatistiche è in fondo a questo file**, dal titolo in poi:
  il programma non c'è più, ma il perché di quello che faceva serve ancora, ed
  è la sola ragione per cui questi diari esistono.

---

## 2026-08-23

### Aggiunto

- **Ingredienti preferiti nella produzione ingredienti**
  (`reparto_ingredienti.html`). Ogni scheda ha una stella: quelle accese
  stanno **sempre in cima all'elenco**, prima di tutte le altre, e dentro ai
  due gruppi resta l'ordine scelto (per nome o per quantità). Chi sta alla
  griglia prepara sempre le stesse quattro o cinque cose e le altre le guarda
  una volta ogni tanto: così le sue stanno dove le cerca, sopra, invece di
  spostarsi ogni volta che cambia il menu della serata.
- **Pulsante «Solo preferiti» nella barra**: nasconde tutto il resto e lascia
  la schermata con le sole schede con la stella. Agisce subito, senza passare
  da «Applica», e **compare solo quando serve** — finché nessun ingrediente ha
  la stella non c'è niente da filtrare e la barra resta com'era. Resta visibile
  anche a lista vuota quando è acceso, se no non ci sarebbe più modo di
  spegnerlo: con il filtro acceso le schede spariscono, e la stella per
  rimetterle sta proprio su quelle schede.
- I preferiti si salvano come le altre impostazioni della pagina e finiscono
  **anche nell'indirizzo** (`?pref=salsiccia&pref=costine&solopref=1`), come
  tutto il resto dello stato di questa schermata: un monitor si imposta una
  volta e si ripristina identico a ogni riavvio. Un parametro ripetuto per
  ciascuno invece di una lista separata da virgole, perché i nomi che arrivano
  dal gestionale le virgole ce le possono avere («pane, tipo 0»).
- La chiave di un preferito è il **nome dell'ingrediente**, ripulito dagli
  spazi e dalle maiuscole: gli ingredienti un codice non ce l'hanno, l'API li
  raggruppa per descrizione e basta. Un ingrediente rinominato davvero perde la
  stella, ed è giusto così: è un altro ingrediente. La lista è unica per tutti
  i reparti, perché un preferito si vede comunque solo dove quell'ingrediente
  c'è davvero.
- Nel cassetto dei filtri una sezione **Preferiti** spiega a che cosa serve la
  stella — se no resta un disegno senza nome — e ha la scorciatoia **«Svuota i
  preferiti (n)»**, che a fine stagione o dopo un cambio di menu è l'unica cosa
  che serve. Svuotare spegne anche il filtro. Anche **«Azzera i filtri»** lo
  spegne: è un filtro a tutti gli effetti e può lasciare lo schermo vuoto. La
  lista invece resta, perché non è un filtro ma la scelta di chi lavora a quel
  banco.
- Lo **schermo vuoto adesso dice perché**: con «Solo preferiti» acceso e niente
  in coda spiega qual è il filtro che sta nascondendo tutto e dove si spegne.
  «Niente da produrre» a coda piena sembra un guasto, e chi legge non ha nessun
  modo di sapere che a farlo sparire è stato un pulsante premuto mezz'ora prima.

### Cambiato

- **I filtri sono un periodo solo: «Dal … Al …»**, tutti e due gli estremi
  facoltativi (vuoto a sinistra = dall'inizio dell'archivio, vuoto a destra =
  fino ad adesso). Prima erano tre comandi che si contendevano lo stesso
  lavoro — Serata, Dalla ora, Dal momento — con la precedenza scritta soltanto
  nei suggerimenti del mouse. L'inizio resta preimpostato con la regola delle
  8:00 (`serata.js`).
- **La serata non è più un filtro concorrente ma una scorciatoia**: sceglierne
  una scrive dalle 8:00 di quel giorno alle 8:00 del giorno dopo, cioè la
  serata dell'evento, mezzanotte compresa. «Tutto lo storico» svuota il
  periodo. Il menu mostra la serata solo quando il periodo è davvero il suo:
  se è stato scritto a mano resta su «scegli…» invece di indicarne una a caso.
- **«Dalla ora» non c'è più**: faceva quello che adesso fanno i due estremi, ma
  solo dentro la serata scelta. I vecchi collegamenti con `?serata=` continuano
  a funzionare: all'apertura vengono tradotti nel periodo corrispondente.
- Un periodo al contrario (fine prima dell'inizio) si vede: il campo «Al» si
  colora e dice perché non esce nessun ordine.
- **Nella scheda Monitor i due pulsanti non aprono più una scheda nuova**:
  cambiano l'anteprima lì dentro. Passare da «da preparare» a «evasi» è un
  confronto, e con due schede del browser aperte si perde il filo di quale sia
  quale. Per il monitor appeso resta **«Apri a schermo intero»**, che è l'unico
  collegamento che apre davvero una pagina a sé.
- I due pulsanti si chiamano ora **«Ordinati»** e **«Evasi»** — sono due stati,
  non due schermate — e portano i colori che lo stato ha in tutto il resto del
  sito: **azzurro** ordinato, **verde** evaso, le stesse tinte delle pastiglie
  nelle liste.
- **L'anteprima non ripete più i comandi che ha già sopra**: incorporata
  (`?barra=0`) il tabellone nasconde il proprio nome e i propri pulsanti di
  stato. Premendo «Evasi» comparivano due volte, uno sotto l'altro, e non si
  capiva quale dei due comandasse. A schermo intero la barra resta tutta.
- Sotto **«Dopo il n° ordine»** c'è la riga che dice che il numero riparte da 1
  ogni serata: serviva a dirlo, e intanto rimette il campo in riga con gli
  altri tre, che una riga di spiegazione sotto ce l'avevano già.
- **Il tabellone si tinge dello stato che sta mostrando**: con «Evasi» i numeri
  d'ordine e i tasti dei reparti diventano verdi, con «Ordinati» tornano
  azzurri. Restano due sfumature per famiglia (azzurro/viola, verde/verde
  acqua) perché la seconda serve a distinguere le casse: la famiglia dice lo
  stato, la sfumatura dice da dove viene l'ordine. Un tabellone tutto verde si
  riconosce da tre metri senza leggere la riga del totale.
- Sotto lo **«Stato»** della scheda Reparti c'è la riga «Quali entrano nei
  totali»: dice una cosa utile e rimette il campo in riga con gli altri
  quattro, che la riga di spiegazione ce l'avevano già.
- **Via i richiami alla configurazione delle casse** dall'anteprima del Monitor
  e dai cassetti dei filtri di tabellone, produzione e ingredienti: ripetevano
  in quattro punti una cosa che si fa una volta sola, il primo giorno.
- L'anteprima riceve il periodo dei filtri, e la barra dei filtri ora si vede
  anche sul Monitor: prima era nascosta lì, e le tre schede sembravano contarsi
  addosso proprio perché il periodo comandava senza farsi vedere.
- **Nella scheda Monitor la firma in fondo non compare più due volte.**
  L'anteprima è il tabellone vero dentro una cornice, e disegnava anche la
  propria firma: nome, email e «Informazioni» finivano una sopra l'altra a
  distanza di due centimetri, come un errore di montaggio. Adesso dentro
  l'anteprima sparisce, insieme alla barra e al nome della pagina che già si
  toglievano da lì. A schermo intero il tabellone la tiene: è l'unica firma che
  ha, e «Informazioni» è l'unica strada per licenza e componenti.
- **Il pulsante «Configurazione» è diventato i tre puntini in colonna**, in
  alto a destra nella dashboard (è l'unica pagina che ce l'ha: le altre hanno
  «Filtri», che è un'altra cosa). I tre puntini sono il segno che tutti
  conoscono per «altro sta qui dentro» e non hanno bisogno di una parola
  accanto — il nome resta nel suggerimento del mouse, nel testo per i lettori
  di schermo e in cima al pannello che si apre. I due messaggi che rimandavano
  «al pulsante Configurazione» adesso dicono «il pulsante con i tre puntini, in
  alto a destra»: una scritta che non c'è più non si può cercare.
- **«Applica», «Azzera» e l'interruttore «auto 5s» tornano in riga con i
  campi.** La riga dei filtri allinea in basso, e ogni campo si porta dietro
  una riga di spiegazione sotto: i tre comandi, che quella riga non ce
  l'avevano, finivano venticinque pixel più giù, a filo delle scritte piccole
  invece che dei campi. Si vedeva soprattutto sulle schede Reparti e Monitor,
  dove i filtri stanno tutti su una riga sola. Adesso stanno in una colonna
  sola con sotto una riga di spiegazione vuota, alta esattamente quanto le
  altre.

---

## 2026-08-22

### Cambiato

- **La pagina si apre su quello che sta entrando adesso**, non sull'ultima
  serata per intero: il filtro «Dal momento» parte da **oggi alle 8:00**. Le 8
  e non la mezzanotte perché la serata finisce dopo le 24 — gli ordini battuti
  all'una di notte appartengono alla sera prima, e partire dalla mezzanotte se
  li porterebbe dentro; alle 8 del mattino la cassa è ferma di sicuro. Anche
  **Azzera** torna lì, non al vuoto.
- Il default vale **solo per la schermata iniziale**: se l'indirizzo porta già
  dei filtri suoi vincono quelli, altrimenti un link salvato si aprirebbe su un
  altro periodo. Dopo il primo aggiornamento i filtri finiscono nella barra
  degli indirizzi, quindi un F5 ripropone quelli che si stavano guardando.
- **Il dettaglio dell'ordine mostra un «Pagato» solo, già al netto del resto**,
  al posto della coppia «Pagato»/«Resto» che invitava a leggere come incasso
  quello che il cliente aveva consegnato in mano. Il valore arriva così
  dall'API (vedi il diario di GSGProxy).
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
  file `LICENSE`, riassunto nella schermata di informazioni.

- **Tutte le schermate partono dalle 8:00**, non più dall'ultima serata in
  archivio: il tabellone ordini, i due monitor di reparto (pietanze e
  ingredienti), Performance e l'elenco «da evadere» dell'avanzamento, oltre
  alle schede Ordini e Reparti della dashboard che già lo facevano. Prima, in
  una pagina sola, i tre riquadri contavano tre cose diverse — le prime due
  vuote fuori stagione, il Monitor pieno degli ordini dell'ultima sagra fatta.
  Vale finché nessuno ha scelto: un `?serata=`, un `?from=` o le impostazioni
  salvate su quello schermo comandano loro, e «tutte le serate» resta com'era.
- **La ricerca di un ordine resta a serata** — nell'avanzamento e in «stato
  ordine» — e non può essere altrimenti: il numero stampato sullo scontrino
  riparte da 1 a ogni sera, e senza una serata non identifica niente. Cambia
  l'elenco di quello che manca, non il modo di ritrovare un ordine.
- La regola sta ora in `wwwroot\serata.js`, in un punto solo: due schermi
  affiancati che partissero da due istanti diversi darebbero numeri diversi, e
  chi li guarda penserebbe che uno dei due sbaglia.
- **Prima delle 8 del mattino si torna indietro di un giorno.** Alle 00:30
  «oggi alle 8» è un istante nel futuro: com'era scritto stamattina, la
  dashboard si sarebbe svuotata di colpo dopo mezzanotte, cioè nel momento di
  punta. La serata in corso, fino alle 8, è ancora quella di ieri.
- L'istante calcolato **non** finisce nelle impostazioni salvate del monitor né
  nel suo indirizzo: sarebbe una serata congelata, ferma su questa sera anche
  fra un anno, e coprirebbe perfino un `?serata=` scritto a mano. Si ricalcola
  a ogni caricamento, e non entra nemmeno nell'indirizzo della pagina. Nei menu
  la voce vuota non si chiama più «ultima serata» ma «serata in corso (dalle
  8:00)», e sotto «Dal momento» c'è scritto da dove si parte lasciandolo vuoto.

### Aggiunto

- **Schermata di informazioni**, che si apre da **«Informazioni»** in fondo
  alla pagina, dopo l'indirizzo di posta: che cos'è il programma, com'è fatto,
  che licenza ha, quali componenti di altri contiene e con quali licenze, e un
  modo per offrire un caffè. È un comando a sé e non il nome dell'autore reso
  cliccabile: un nome che si preme non dice dove porta. La barra in cima resta
  libera, che è il posto dei comandi della serata.
- Sta tutta in `wwwroot\info.js`, un file solo incluso da tutte le pagine — le
  licenze cambiano ogni tanto, e la stessa cosa scritta in otto pagine diventa
  otto cose diverse dopo la prima correzione. Il pannello viene costruito alla
  prima apertura: sui monitor appesi in cucina, che nessuno tocca mai, questo
  file costa il suo scaricamento e nient'altro.
- La versione mostrata lì dentro la chiede al programma (`/hub/health`), non se
  la inventa la pagina: le pagine vengono copiate accanto all'eseguibile e non
  sanno quale numero porta quello che le sta servendo.

---

## 2026-08-17

### Cambiato

- **I tre programmi partono nascosti, con un'icona nella tray di Windows**
  invece che con una finestra nera da tenere aperta: da lì (tasto destro)
  si trova **Mostra log** e **Esci**. Il testo del setup non si chiama più
  "GSG - Gestione Stand Gastronomico" — nome identico al gestionale vero,
  facile da confondere con quello — ma **"GSG Dashboard"**, con il gestionale
  citato come sottotitolo.
- **Log giornaliero con NLog**, sette giorni di storia (poi si cancellano da
  soli): prima non c'era nessun file di log, solo la console. Il file di oggi
  è quello che apre "Mostra log" dalla tray.

### Aggiunto

- **`avanzamento.html`: gli ordini da evadere anche divisi in una colonna per
  reparto.** La fila unica di quadrati risponde bene a una domanda —
  «il 14 è uscito?» — perché i numeri crescono da sinistra a destra e quello che
  si cerca si trova senza leggere il resto. Alla domanda opposta — «come stanno
  i banchi?» — su quella fila si risponde contando quadrati arancioni in mezzo
  ai rossi, e con quattro reparti accesi non si risponde affatto.

  Il pulsante **Dividi per reparto**, nella testata dell'elenco, mette gli
  stessi quadrati in una colonna per reparto: la lunghezza della colonna è la
  coda di quel banco, e due colonne affiancate si confrontano a occhio senza
  leggere un numero. Premuto di nuovo — l'etichetta diventa *Rimetti tutto in
  fila* — si torna alla disposizione di prima.

  Le colonne sono quelle dei **reparti accesi che hanno ordini**, nell'ordine
  dello specchietto (11 cliente, 12 cucina, 13 pizzeria, …): la colonna sta
  dov'è il pulsante che l'accende, e un reparto a zero non fa colonna come già
  non fa scheda. Si dividono lo spazio in parti uguali, quindi con due reparti
  accesi ogni colonna è larga e i numeri stanno in righe da quattro; con sette
  sono strette e i numeri scendono in fila. I quadrati restano del colore del
  reparto anche se la testata lo dice già: due monitor accanto, uno per vista,
  devono mostrare lo stesso ordine dello stesso colore.

  **Un pulsante e non un interruttore**, come quello dell'elenco accanto: una
  casella di spunta tiene il fuoco, e il lettore di codici a barre scrive dove
  c'è il fuoco — la lettura successiva finirebbe dentro la casella. Compare solo
  a elenco aperto, perché a elenco chiuso cambierebbe la disposizione di
  quadrati che non si vedono.

  La scelta si ricorda sul monitor (`localStorage`) e si può fissare
  nell'indirizzo, che per un collegamento salvato è il posto giusto:
  `?elenco=1&vista=colonne` (`?vista=fila` per l'altra). Come le altre scelte
  che arrivano dall'indirizzo, quella non si salva: un collegamento nei
  preferiti resta quello che dice di essere.

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


---

# Diario di GSGStatistiche, fino alla fusione del 2026-08-25

Quello che segue è il diario del programma separato, riportato qui tale e quale
il giorno in cui è diventato una parte di GSGDashboard. Le voci parlano di
«questo servizio», di `gsgstatistiche.json` e della porta 8081: erano vere
allora, e vanno lette con quella data davanti. Il **perché** delle scelte —
come si sommano le casse, perché si raggruppa per `descrizionebase`, perché gli
ingredienti non portano soldi — è invece ancora quello di adesso.

## 2026-08-25

### Aggiunto

- **Due pagine nuove: «Resoconto per articolo» (`articoli.html`) e «Resoconto
  ingredienti» (`ingredienti.html`)**, con una barra in cima per passare da una
  all'altra. Finora la domanda che si poteva fare era «com'è andata quella
  sera»; queste due la girano dall'altra parte — quanto ha reso quel piatto,
  quanta salsiccia se n'è andata — che è quello che si guarda a sagra chiusa,
  quando si decide il listino e la merce dell'anno prossimo.

- **Resoconto per articolo**: una riga per piatto con pezzi, incasso, prezzo
  medio, in quanti ordini è comparso, in quante serate, media a serata, prima e
  ultima volta che è stato venduto. Le intestazioni si premono per riordinare;
  premendo una riga si apre com'è andata sera per sera, con le serate a zero
  che restano in elenco — una serata mancante sembra un buco nei dati, uno zero
  dice che quella sera non è uscito. In cima il riepilogo **per categoria** di
  listino: dice da dove sono arrivati i soldi prima ancora di guardare i
  singoli piatti.

  I totali coincidono al centesimo con la pagina delle serate: l'incasso con
  «Pietanze», le quantità con «Quanto si è venduto». Non è un caso, è lo stesso
  raggruppamento — vedi il diario di GSGProxy.

- **Resoconto ingredienti**: quanto se n'è consumato in tutto il periodo, da
  quali piatti arriva e sera per sera. Il conto la dashboard lo fa già per la
  serata in corso, reparto per reparto (`reparto_ingredienti.html`); qui è su
  tutto il periodo e senza reparto, perché la domanda è un'altra: non «quante
  salsicce metto sulla griglia adesso» ma «quante ne ordino per l'anno
  prossimo».

  **Niente soldi, ed è voluto.** Un ingrediente scelto dentro un piatto non
  cambia il prezzo del piatto: una colonna «incassato» qui sarebbe un numero
  che non torna con nessun altro del sito.

- **«Unisci i nomi simili»**, un interruttore acceso di suo su tutte e due le
  pagine. Sui pulsanti della cassa i nomi vengono allineati a mano con trattini
  bassi e punti (`Patate Fritte   ________        .`) e gli ingredienti scelti
  portano davanti una freccia (`-->Salsiccia`); fra un'edizione e l'altra il
  riempimento cambia, il piatto no. Su tutto lo storico di questo database sono
  190 righe di articoli che diventano 156, e 31 di ingredienti che diventano
  11: senza, lo stesso piatto esce spezzato in due o tre righe, ognuna con una
  fetta dei suoi pezzi, e la classifica dice il falso.

  Il nome vero non viene mai toccato: la riga porta un'etichetta con quanti
  nomi ci sono dentro, il dettaglio li elenca tutti **fra virgolette** — così
  si vedono anche gli spazi finali — e spegnendo l'interruttore si torna a
  vedere esattamente quello che c'è scritto nel gestionale. Il punto attaccato
  a una parola resta, perché lì è un'abbreviazione vera: «Bott. Serprino» non
  va storpiata per far pulizia.

- **Il periodo scelto viaggia nell'indirizzo** (`?da=&a=`). Chi guarda
  l'edizione di quest'anno nel confronto fra serate e poi apre gli articoli si
  aspetta gli articoli di quest'anno, non tutto lo storico. In più il
  collegamento al rendiconto che si sta guardando si può salvare o mandare a
  qualcun altro.

### Cambiato

- **Barriera della password, filtri di periodo, navigazione ed esportazione CSV
  stanno in `wwwroot\statistiche-comune.js`**, un file solo incluso da tutte e
  tre le pagine, e la barriera se la costruisce da sola invece di stare
  nell'HTML. Stessa ragione di `info.js`: la stessa cosa scritta in tre pagine
  diventa tre cose diverse dopo la prima correzione, e qui una delle tre
  sarebbe quella che lascia entrare. `statistiche.html` fa esattamente quello
  che faceva prima, con dentro solo il disegno della sua pagina.

- **Il sottotitolo di una scheda va sotto al titolo**, non attaccato di fianco:
  `.card-header` di Tabler è una riga flex, e «Come hanno pagato» e la frase
  che lo spiega finivano incollati in una parola sola. I comandi a destra
  restano dove sono.

- Il titolo della prima pagina è **«Statistiche · serate»**: adesso che ce ne
  sono tre, «Statistiche» da solo non dice più quale.

---

## 2026-08-22

### Cambiato

- **All'apertura si vede l'edizione di quest'anno**, non tutto lo storico: il
  «Da» parte dalla prima serata dell'anno in corso. Mentre la sagra è aperta è
  quella che si guarda; lo storico si tira su con «Tutte le serate», che è
  rimasto lì.
- Il menu contiene soltanto serate esistenti, quindi non ci si può scrivere
  dentro un 1° gennaio finto: non selezionerebbe nulla e il filtro resterebbe
  vuoto senza dirlo. Si sceglie la prima serata vera dell'anno, che filtra
  esattamente come farebbe quella data. Se quest'anno non si è ancora fatta
  nessuna serata si lascia vuoto: meglio aprire su tutto lo storico che su una
  pagina senza dati.
- **«Incassato» è quello che resta in cassa**, cioè il pagato meno il resto:
  prima le banconote grosse gonfiavano il totale della serata. Il conto è
  cambiato in GSGProxy — vedi il suo diario — quindi anche i numeri delle
  serate passate ora sono quelli veri.
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
  file `LICENSE`, riassunto nella schermata di informazioni.

### Aggiunto

- **Schermata di informazioni**, che si apre da **«Informazioni»** in fondo
  alla pagina, dopo l'indirizzo di posta: che cos'è il programma, com'è fatto,
  che licenza ha, quali componenti di altri contiene e con quali licenze, e un
  modo per offrire un caffè. È un comando a sé e non il nome dell'autore reso
  cliccabile: un nome che si preme non dice dove porta. La barra in cima resta
  libera, che è il posto dei comandi della serata.
- Sta tutta in `wwwroot\info.js`, un file solo incluso da tutte le pagine — le
  licenze cambiano ogni tanto, e la stessa cosa scritta in otto pagine diventa
  otto cose diverse dopo la prima correzione. Il pannello viene costruito alla
  prima apertura: sui monitor appesi in cucina, che nessuno tocca mai, questo
  file costa il suo scaricamento e nient'altro.
- La versione mostrata lì dentro la chiede al programma (`/auth/status`,
  l'unica rotta aperta prima della password), non se la inventa la pagina: le
  pagine vengono copiate accanto all'eseguibile e non sanno quale numero porta
  quello che le sta servendo.
- **Scheda «Come hanno pagato»**, sotto i riquadri dei totali: per ogni forma
  di pagamento gli ordini, l'incassato, lo scontrino medio e la quota sul
  periodo scelto, con esportazione in CSV come le altre tabelle. Sta lì perché
  sono gli stessi soldi dei riquadri qui sopra, e la riga in fondo lo dice: se
  il totale non coincide con l'incassato del periodo, invece di «pari
  all'incassato» compare quanto manca. Due somme diverse degli stessi ordini
  che non tornano sono un guaio da vedere subito, non a rendiconto stampato.
- I totali per pagamento arrivano da `/hub/stats/serate` e vengono **sommati
  fra le casse** per tipo: due casse che incassano in contanti fanno una riga
  sola. L'ordine è dal più grosso al più piccolo e, a parità, per nome, così
  non balla fra un aggiornamento e l'altro.

---

## 2026-08-17

### Cambiato

- **Parte nascosto, con un'icona nella tray di Windows** invece che con una
  finestra nera da tenere aperta: da lì (tasto destro) si trova **Mostra log**
  e **Esci**. Il testo del setup non si chiama più "GSG - Gestione Stand
  Gastronomico" — nome identico al gestionale vero, facile da confondere con
  quello — ma **"GSG Dashboard"**, con il gestionale citato come sottotitolo.
- **Log giornaliero con NLog**, sette giorni di storia (poi si cancellano da
  soli): prima non c'era nessun file di log, solo la console. Il file di oggi
  è quello che apre "Mostra log" dalla tray.

---

## 2026-08-15

Niente: in questo giro non è stato toccato. Le modifiche riguardano GSGProxy e
GSGDashboard — vedi i rispettivi diari. Il programma viene rilasciato lo stesso,
perché la versione è unica per tutti e tre e si installano insieme.

---

## 2026-08-10

### Aggiunto

- **Nasce GSGStatistiche**, sito a parte con la sua porta (8081) e un processo
  suo, estraendo `statistiche.html` da GSGDashboard.

  **Perché non è rimasta una scheda della dashboard.** I numeri di incasso non
  sono per tutti i monitor: la dashboard sta aperta su tablet e schermi appesi
  in cucina, senza password, ed è pensata per restare visibile. Le statistiche
  di fine sagra sono un'altra cosa. In più il sito **non dipende da
  GSGDashboard** — parla direttamente con GSGProxy, quindi se uno dei due è
  spento l'altro funziona lo stesso — e cambiargli password o porta non tocca i
  monitor operativi.

- **Password, impostata al primo accesso.** Nessun account predefinito: finché
  `auth.hash` è vuoto la pagina chiede di sceglierne una, e da lì in poi la
  chiede a ogni accesso, anche da un altro dispositivo. La password non finisce
  mai in chiaro nel file di configurazione: PBKDF2-HMACSHA256, 100.000
  iterazioni, sale casuale di 16 byte, e il confronto in fase di accesso è a
  tempo costante per non far trapelare dal tempo di risposta quanti byte
  dell'hash sono giusti.

  Le sessioni vivono **solo in memoria** (cookie `HttpOnly`, 12 ore): un riavvio
  disconnette tutti, ed è voluto per un programma che si tiene acceso una serata
  alla volta. Otto tentativi sbagliati dallo stesso indirizzo lo bloccano per 5
  minuti — non è un vero anti-bruteforce, il servizio sta su una LAN chiusa, ma
  costa poco. Cambiare la password chiude **tutte** le sessioni aperte, non solo
  quella di chi la sta cambiando.

- **Confronto fra serate, ore di punta, andamento di un articolo nel tempo,
  classifica, totali del periodo, esportazione in CSV e resa stampabile**: le
  domande che ci si fa a sagra finita.

- Endpoint `/auth/*` e `/hub/bootstrap`, `/hub/stats/serate`. Tutti quelli sotto
  `/hub` rispondono `401` senza una sessione valida.

### Note

- L'aggregazione fra casse è la stessa di `GSGDashboard/src/Hub/Merge.cs`,
  copiata e ridotta alle sole cose che questa pagina usa. Le chiavi restano
  testuali (serata, nome dell'articolo) e mai il numero d'ordine, che si azzera
  a ogni serata: su più serate conterebbe male.
- L'andamento di un articolo si chiede **per nome**, non come «i primi N»: se
  ogni cassa scegliesse da sé i propri primi N, due casse potrebbero sceglierne
  insiemi diversi e il grafico sembrerebbe giusto pur avendo i numeri di una
  cassa sola. I nomi **non** vanno ripuliti degli spazi: nel gestionale gli spazi
  finali sono veri, e toglierli significa non trovare più l'articolo.
- Restano da fare, e sono scritte nel README: il pannello per modificare le
  casse dal sito (oggi `casse` va scritto a mano in `gsgstatistiche.json` e
  tenuto allineato con `gsgdashboard.json`) e il service worker.
