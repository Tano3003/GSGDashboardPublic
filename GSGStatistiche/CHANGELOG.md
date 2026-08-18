# Diario delle modifiche — GSGStatistiche

Che cosa è cambiato, quando, e **perché**: il motivo conta più dell'elenco,
perché fra una sagra e l'altra passano dodici mesi e la ragione di una scelta è
la prima cosa che si dimentica.

Il numero di **versione è unico per i tre programmi** (sta in
`Directory.Build.props`): GSGProxy, GSGDashboard e GSGStatistiche si installano
e si aggiornano insieme. Per questo le voci qui sotto sono raggruppate per
**data**, non per numero: dentro la 2.0.3 ci sta tutto quello che è successo
finora.

Le date sono quelle in cui la modifica è entrata nei sorgenti, non quelle del
rilascio del pacchetto pubblico (che si produce con
`strumenti\PRODUCI_RELEASE.ps1`).

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
