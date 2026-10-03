# GSG Dashboard — Cruscotto per Gestione Stand Gastronomico

Monitor di cucina, tabellone degli ordini, statistiche, giacenze di magazzino e
lettore di codici a barre per **Gestione Stand Gastronomico**, il gestionale per sagre di
[gestionestandgastronomico.it](https://www.gestionestandgastronomico.it).

Questo repository contiene il **programma già compilato, pronto da copiare e
usare**: non serve installare niente, non serve compilare niente.

![Ordini della serata](docs/immagini/01-ordini-della-serata.png)

<p align="center">
  <img src="docs/immagini/04-monitor-cucina.png" width="49%" alt="Monitor di cucina">
  <img src="docs/immagini/07-statistiche-serate.png" width="49%" alt="Statistiche della serata">
</p>

<p align="center"><em>Tutte le schermate, una per una, stanno in
<a href="docs/SCHERMATE.md">docs/SCHERMATE.md</a>.</em></p>

| Cartella | Che cosa fa | Dove va |
|---|---|---|
| **`GSGProxy/`** | Legge il database (SQLite **o** PostgreSQL) e ne pubblica i dati | Su ogni PC di cassa, accanto al gestionale |
| **`GSGDashboard/`** | Pubblica il sito e somma i dati di tutte le casse: ordini della serata per tutti, statistiche dell'edizione dietro password | Su un PC solo, quello che fa da server |
| `strumenti/` | File `.bat` per avviare i programmi e aprire il firewall | Dove serve |

```
   Cassa 1                      Cassa 2
 ┌──────────────┐            ┌──────────────┐
 │  database    │            │  database    │
 │      ↓       │            │      ↓       │
 │  GSGProxy    │            │  GSGProxy    │      porta 8099
 └──────┬───────┘            └──────┬───────┘
        └───────────┬───────────────┘
              ┌──────┴──────┐  HTTP
              ↓             ↓
             ┌───────────────┐
             │ GSGDashboard  │                    porta 8080
             └───┬───────┬───┘
        ordini   │       │   statistiche
       (aperti)  ↓       ↓   (password)
   tablet · monitor cucina    ufficio
   · tabellone ordini         · a sagra finita
```

I monitor parlano **solo** con GSGDashboard, mai con le casse: gli indirizzi si
impostano una volta sola e valgono per tutti i dispositivi. Le due metà del
sito stanno sulla stessa porta: a dividere gli ordini dalle statistiche è la
password, non l'indirizzo.

---

## Le schermate

| Pagina | A cosa serve |
|---|---|
| `dashboard.html` | **La pagina che si apre all'indirizzo del server** (porta 8080). Incassi, ordini, dettaglio di ogni ordine; dalla sua barra si aprono tutte le altre schermate, e il pulsante **Statistiche** porta ai rendiconti |
| `statistiche.html` | **Protetta da password.** A sagra finita: confronto fra serate, ore di punta, andamento di un articolo negli anni, esportazione in CSV e stampa del rendiconto |
| `articoli.html` · `ingredienti.html` | **Protette da password.** Quanto ha reso ciascun piatto e quanta merce se n'è andata, in tutto il periodo: è la domanda di chi ordina per l'anno prossimo |
| `reparto.html` | Quante pietanze preparare in un reparto, con i minuti di attesa; si può filtrare per tipologia (primi, bibite…) e mostrare la giacenza di magazzino. Per un monitor appeso in cucina |
| `reparto_ingredienti.html` | Quanto di ciascun ingrediente preparare, sommato fra tutti i piatti che lo usano; con l'interruttore, anche la giacenza |
| `giacenze.html` | **Giacenze di magazzino**: si leggono e si correggono le scorte di articoli e ingredienti (**Imposta** o **Aggiungi**). Si apre dal pulsante **Giacenze**, dopo **Monitor** nella schermata iniziale. Scrive solo su PostgreSQL |
| `monitor_ordini.html` | Tabellone dei numeri d'ordine per reparto |
| `avanzamento.html` | Lettore di codici a barre: si passa l'ordine stampato e passa da `ordinato` a `evaso` |

Come sono fatte davvero: **[docs/SCHERMATE.md](docs/SCHERMATE.md)**, una
immagine per pagina con la spiegazione di cosa ci si guarda.

### Le statistiche chiedono una password, gli ordini no

I numeri di incasso non sono per tutti i monitor che restano aperti senza
sorveglianza su un tablet o uno schermo in cucina; gli ordini da preparare sì —
una password da battere a ogni riaccensione di un monitor finirebbe scritta su
un foglietto attaccato al monitor. Per questo la dashboard non ha (e non deve
avere) una password, e le tre pagine dei rendiconti sì: **al primo accesso** la
pagina chiede di sceglierne una (minimo 6 caratteri), e da quel momento la
chiede a ogni accesso, da qualunque dispositivo.

La password non è mai salvata in chiaro (`gsgdashboard.json` contiene solo un
hash PBKDF2-SHA256 con sale casuale). Persa? Fermare `GSGDashboard.exe`,
svuotare `auth.hash` e `auth.salt` nel file, riavviare: al prossimo accesso la
pagina torna a chiederne una nuova.

> **Fino alla versione 2.0.6 le statistiche erano un programma a parte**
> (`GSGStatistiche`, porta 8081). Chi aggiorna non deve reimpostare niente: al
> primo avvio GSGDashboard si prende la password dal vecchio
> `gsgstatistiche.json`, se lo trova accanto a sé o nella vecchia cartella
> `GSGStatistiche` di fianco alla propria. Il vecchio programma va fermato
> (icona nella tray → **Esci**) e non va più riavviato.

---

## Il database non viene modificato, salvo due casi

Tutte le interrogazioni sono di sola lettura, e non è solo una promessa:

- **SQLite** — il file viene aperto con `ReadOnly=True` e con `PRAGMA query_only=1`;
- **PostgreSQL** — la sessione parte con `SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY`.

Le scritture sono due, e **solo su PostgreSQL**: con SQLite sono rifiutate (403) e
il file resta aperto in sola lettura. Il controllo è triplo — la configurazione, il
database realmente in uso e la connessione in scrittura, che SQLite non apre —
così nessuno dei tre da solo basta ad aprire una scrittura su un database che non
sia PostgreSQL.

- **L'avanzamento di stato** dalla pagina `avanzamento.html`: tocca una sola
  colonna (`stato_<reparto>`) di un solo ordine. Vedi
  [docs/AVANZAMENTO.md](docs/AVANZAMENTO.md).
- **La correzione delle giacenze** dalla pagina `giacenze.html`: tocca una sola
  colonna (`scorta_iniziale` della tabella `giacenze`) di una sola voce. La pagina
  non chiede la password, come l'avanzamento.

Tutte e due si disattivano dalla configurazione, e ogni scrittura lascia una riga
nel registro di GSGProxy.

---

## Requisiti

- **Windows** con **.NET Framework 4.8** — già presente su Windows 10 (dalla
  versione 1903) e Windows 11. Su Windows 7 SP1 / 8.1 va installato a parte,
  cercando «.NET Framework 4.8 offline installer» sul sito Microsoft.
- Una installazione di **Gestione Stand Gastronomico** con il suo database, in
  SQLite o PostgreSQL.

Non serve né Visual Studio né il .NET SDK: i programmi sono già compilati.

---

## Installazione in breve

1. Scaricare il pacchetto: pulsante verde **Code → Download ZIP**, oppure la
   versione dalla sezione **Releases**.
2. Estrarre lo ZIP e copiare la cartella **`GSGProxy`** su ogni PC di cassa, per
   esempio in `C:\sagra\GSGProxy\`.
3. Copiare la cartella **`GSGDashboard`** sul PC che fa da server.
4. Su ogni cassa, doppio clic su `GSGProxy.exe`: al primo avvio crea
   `gsgproxy.json`. Chiuderlo, aprire quel file con il Blocco note e indicare
   dov'è il database.
5. Sul server, doppio clic su `GSGDashboard.exe` e aprire
   `http://localhost:8080/`: si apre la dashboard. Dal pulsante **Server** si
   inseriscono gli indirizzi delle casse.
6. Per le statistiche, premere **Statistiche** nella barra della dashboard: la
   prima volta la pagina chiede di scegliere una password.
7. Aprire le porte sul firewall: `strumenti\ABILITA_firewall.bat`, tasto destro
   → **Esegui come amministratore**, una volta per PC.

**Istruzioni complete passo passo: [docs/INSTALLAZIONE.md](docs/INSTALLAZIONE.md).**

Per una prova su un PC solo: `strumenti\AVVIA_TUTTO.bat` avvia i due programmi
e apre il browser.

> **Windows potrebbe avvisare che il programma non è riconosciuto.** Gli
> eseguibili non hanno una firma digitale: al primo avvio SmartScreen mostra
> «Windows ha protetto il PC» → *Ulteriori informazioni* → *Esegui comunque*.

---

## Configurazione

### GSGProxy — `gsgproxy.json`

Creato al primo avvio da `gsgproxy.example.json`, che nel pacchetto è
commentato riga per riga.

```jsonc
{
  "listen": { "host": "0.0.0.0", "port": 8099 },
  "database": {
    "provider": "sqlite",              // oppure "postgres"
    "sqlite":   { "path": "C:\\sagra\\database.db", "readOnly": true },
    "postgres": { "host": "192.168.1.10", "port": 5432,
                  "database": "sagra", "username": "sagra", "password": "…" }
  },
  "avanzamento": { "abilitato": true, "statoDa": "ordinato", "statoA": "evaso" },
  "giacenze":    { "abilitato": true }
}
```

Cambiare `provider` è l'unica cosa che serve per passare da un database
all'altro. Con PostgreSQL, i valori sono gli stessi che il gestionale ha nella
propria `database_url`.

Attenzione alle **barre doppie** nei percorsi: nel formato JSON `\` va scritto
`\\`.

### GSGDashboard — `gsgdashboard.json`

```jsonc
{
  "listen": { "host": "0.0.0.0", "port": 8080 },
  "casse": [
    { "label": "Cassa 1", "base": "http://192.168.1.50:8099" },
    { "label": "Cassa 2", "base": "http://192.168.1.51:8099" }
  ],
  "aggregate": true
}
```

Gli indirizzi si cambiano anche dal sito, senza toccare il file: dashboard →
pulsante **Server**.

Nello stesso file finisce anche `auth`, cioè la password delle statistiche.
**Non va compilato a mano**: resta vuoto finché non si apre la pagina e la si
imposta da lì, che poi lo riempie da sola.

> **I file `gsgproxy.json` e `gsgdashboard.json` contengono le password e i
> percorsi del vostro impianto: non vanno mai pubblicati.** Nel repository ci
> sono solo i `*.example.json`.

---

## Provare senza una cassa

`GSGDashboard.exe --demo` (oppure `strumenti\AVVIA_GSGDashboard_DEMO.bat`, sulla
porta 8081) mostra tutte le schermate con due casse finte e dati inventati, senza
database e senza toccare nessun file. Ogni pagina porta la targhetta **DEMO · dati
di prova**. Dettagli in [docs/INSTALLAZIONE.md](docs/INSTALLAZIONE.md).

---

## Filtrare i dati

Tutte le pagine accettano gli stessi filtri, combinabili, e li ricordano
nell'indirizzo: un monitor si configura una volta sola e si rimette a posto da
solo a ogni riavvio.

| Parametro | Esempio | Significato |
|---|---|---|
| `serata` | `2026-06-14` · `tutte` | Serata dell'evento. Se non indicato si usa l'ultima presente nel database |
| `since` | `19:30` | Ordini dopo quell'ora, **dentro** la serata selezionata |
| `from` | `2026-06-14 19:30` | Punto di partenza assoluto: tutti gli ordini da quell'istante, di qualsiasi giorno |
| `after` | `120` | Ordini con numero superiore a 120 |
| `stato` | `ordinato` | Stato di lavorazione |
| `reparto` / `reparti` | `cucina` · `cucina,bar` | Uno o più reparti |

`from` e `serata` si escludono a vicenda: quando si usa `from`, la serata viene
ignorata e le pagine lo segnalano.

> **Il numero d'ordine riparte da 1 a ogni serata.** Da solo non identifica un
> ordine: va sempre accompagnato dalla serata.

```
http://server:8080/reparto.html?reparto=cucina&refresh=5&auto=1
http://server:8080/dashboard.html?tab=reparti&serata=2026-06-14&since=19:30
http://server:8080/avanzamento.html?subito=1
```

---

## Personalizzare le pagine

Le pagine stanno in `GSGDashboard\wwwroot\` come normali file HTML: si possono
correggere con un editor di testo anche durante la sagra, senza riavviare il
programma. Basta ricaricare il browser.

Usano [Tabler](https://tabler.io), un tema basato su Bootstrap 5, incluso in
`wwwroot\vendor\` e non preso da un CDN, perché alla sagra spesso non c'è
internet.

Se le modificate, due regole: **niente colori scritti a mano** (si usano le
variabili `--tblr-*` e le classi `bg-*-lt`, che Tabler definisce sia per il tema
chiaro sia per quello scuro), e **niente emoji** — le pagine usano solo testo e
i componenti standard di Tabler.

---

## Compatibilità

GSG legge lo schema del database di **Gestione Stand Gastronomico** (tabelle
`ordini`, `righe`, `righe_articoli`, `righe_sconto`, `configurazione`, `stati`,
`tipologie`). È stato usato con le versioni 2.1–2.3.

I nomi delle colonne vengono letti dal database all'avvio, quindi differenze fra
installazioni non sono un problema. Se una colonna attesa manca, il programma lo
segnala all'avvio invece di fallire più tardi.

---

## Documentazione

| | |
|---|---|
| [docs/SCHERMATE.md](docs/SCHERMATE.md) | Le schermate una per una, in immagini |
| [docs/INSTALLAZIONE.md](docs/INSTALLAZIONE.md) | Installazione passo passo, e cosa fare quando qualcosa non va |
| [docs/AVANZAMENTO.md](docs/AVANZAMENTO.md) | Lettore di codici a barre: requisiti, come attivarlo, configurazione |

Gli eseguibili di questo pacchetto sono
protetti con [.NET Reactor](https://www.eziriz.com/dotnet_reactor.htm)
(offuscamento del codice, anti-tampering): questo repository distribuisce solo
il programma compilato e pronto all'uso, non i sorgenti.

---

## Licenza

GSG Dashboard è **gratuito ma non è libero**: si può usare quanto si vuole, non si può
vendere né spacciare per proprio. Il testo completo è in [LICENSE](LICENSE) e va
tenuto insieme al programma anche quando lo si passa a qualcun altro.

| Si può | Non si può |
|---|---|
| usarlo gratis, su quante macchine servono, per sempre | venderlo, noleggiarlo, includerlo in un prodotto a pagamento |
| passarlo a un'altra sagra, intero e senza chiedere soldi | decompilare gli eseguibili o aggirare le protezioni |
| ritoccare le pagine di `wwwroot` per la propria sagra | toglierne il nome dell'autore o presentarlo come proprio |

Questo repository pubblica il programma **compilato**. Le licenze dei componenti
di terzi inclusi nel pacchetto — Tabler, Npgsql, SQLite, NLog, librerie .NET —
sono riportate per intero in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) e
restano valide: la licenza di GSG Dashboard non le sostituisce.

Progetto **indipendente**, non affiliato né approvato dagli autori di Gestione
Stand Gastronomico, di cui non ridistribuisce nessuna parte.
