# Diario delle modifiche — GSGStatistiche

Che cosa è cambiato, quando, e **perché**: il motivo conta più dell'elenco,
perché fra una sagra e l'altra passano dodici mesi e la ragione di una scelta è
la prima cosa che si dimentica.

Il numero di **versione è unico per i tre programmi** (sta in
`Directory.Build.props`): GSGProxy, GSGDashboard e GSGStatistiche si installano
e si aggiornano insieme. Per questo le voci qui sotto sono raggruppate per
**data**, non per numero: dentro la 2.0.5 ci sta tutto quello che è successo
finora.

Le date sono quelle in cui la modifica è entrata nei sorgenti, non quelle del
rilascio del pacchetto pubblico (che si produce con
`strumenti\PRODUCI_RELEASE.ps1`).

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
- **La licenza non è più MIT**: GSG Dashboard è gratuito ma non è libero — si può
  usare
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
- La versione mostrata lì dentro la chiede al programma (`/auth/status`, l'unica rotta aperta prima
  della password), non se la inventa la pagina: le pagine vengono copiate accanto all'eseguibile e non
  sanno quale numero porta quello che le sta servendo.

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
