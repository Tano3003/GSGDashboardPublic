# Avanzamento di stato con il lettore di codici a barre

Si passa l'ordine stampato sotto un lettore di codici a barre e quell'ordine
passa da `ordinato` a `evaso`, per il **solo reparto** della copia che è stata
letta. La pagina è `avanzamento.html`.

È l'**unica funzione che scrive** sul database del gestionale: tocca una sola
colonna (`stato_<reparto>` della tabella `ordini`) di un solo ordine.

> **Fonte.** Il formato del codice a barre, i codici dei reparti e i nomi delle
> variabili di stampa descritti qui sotto sono documentati nel *Manuale d'uso di
> Gestione stand gastronomico* (v. 2.3.4),
> <https://www.gestionestandgastronomico.it>, distribuito con licenza
> [Creative Commons Attribuzione - Non opere derivate 3.0 Italia](https://creativecommons.org/licenses/by-nd/3.0/it/).
> Se ne riportano le sole informazioni funzionali necessarie a far interoperare
> i due programmi. Il manuale non è incluso in questo pacchetto: va richiesto
> agli autori del gestionale.

---

## Requisiti

1. **Il database deve essere PostgreSQL.** Con SQLite la pagina si apre ma resta
   spenta e lo dichiara; il file resta aperto in sola lettura.
2. **`avanzamento.abilitato` a `true`** in `gsgproxy.json` (è il valore
   predefinito).
3. **Gli ordini devono essere stampati con il codice a barre**, che va aggiunto
   ai modelli di stampa del gestionale.

---

## Il codice a barre

Il gestionale stampa su ogni copia dell'ordine un EAN-13 di tredici cifre:

```
   1 1   0 0 0 0 0 0 0 0 0 1   3
   ↑     ↑                     ↑
   |     |                     carattere di controllo
   |     numero d'ordine, riempito di zeri a sinistra (10 cifre)
   indicatore del reparto (2 cifre)
```

| Codice | Copia | Colonna scritta |
|---|---|---|
| 11 | cliente | `stato_cliente` |
| 12 | cucina | `stato_cucina` |
| 13 | pizzeria | `stato_pizzeria` |
| 14 | bar | `stato_bar` |
| 15 | rosticceria | `stato_rosticceria` |
| 16 · 17 · 18 | reparto1 · reparto2 · reparto3 | `stato_reparto1` … |

Si può anche **digitare a mano**, come nella finestra del gestionale, senza zeri
e senza carattere di controllo: `121` è l'ordine 1 della cucina.

Il carattere di controllo viene calcolato e mostrato, ma un codice che non torna
viene accettato lo stesso: i lettori lo verificano già prima di mandare i
caratteri.

---

## Attivarlo nel gestionale

Nel modello HTML della stampa, prima di `</body>`, va aggiunta la riga del
reparto che quella copia riguarda:

```html
<img src="{{ordine.recupera_barcode_cucina()}}" /><br>
```

| Reparto | Variabile |
|---|---|
| Cliente | `{{ordine.recupera_barcode_cliente()}}` |
| Cucina | `{{ordine.recupera_barcode_cucina()}}` |
| Bar | `{{ordine.recupera_barcode_bar()}}` |
| Pizzeria | `{{ordine.recupera_barcode_pizzeria()}}` |
| Rosticceria | `{{ordine.recupera_barcode_rosticceria()}}` |
| Reparto 1 · 2 · 3 | `{{ordine.recupera_barcode_reparto1()}}` … |

Il codice a barre compare **solo sugli ordini stampati dopo questa modifica**:
ristampando un ordine vecchio esce un'icona di errore al suo posto.

---

## Configurazione

In `gsgproxy.json`, su ogni cassa:

```jsonc
"avanzamento": {
  "abilitato": true,
  "statoDa": "ordinato",
  "statoA": "evaso"
}
```

| Campo | |
|---|---|
| `abilitato` | `false` spegne la funzione anche su PostgreSQL, per le casse che non devono poter evadere niente |
| `statoDa` | Stato che l'ordine deve avere perché la lettura abbia effetto. Se è già oltre, non viene toccato |
| `statoA` | Stato in cui viene messo. **Deve esistere nella tabella `stati`** del gestionale, scritto uguale e senza spazi |

Gli stati si vedono nel gestionale in **File → Configurazione → Server web**. Se
`statoA` non esiste, la scrittura viene rifiutata con un messaggio esplicito
invece di far sparire l'ordine da tutti i monitor.

All'avvio, `GSGProxy.exe` dichiara lo stato della funzione:

```
Avanzamento stato ordini: ATTIVO ("ordinato" -> "evaso").
```

---

## Leggere con la fotocamera

Dove il lettore fisico non c'è — o serve una lettura al volo da telefono — il
pulsante **Usa la fotocamera** apre l'obiettivo e legge il codice inquadrandolo.
Non usa nessuna libreria esterna: si appoggia al riconoscitore già dentro al
browser.

Compare **solo dove può davvero funzionare**, e servono due condizioni insieme:

| | |
|---|---|
| Il browser deve saper leggere i codici a barre | C'è su **Android**, **iPhone (iOS 17+)**, **Mac** e ChromeOS. Su **Chrome per Windows no**: sul PC di cassa il pulsante non compare |
| La pagina deve essere in un contesto sicuro | I browser danno la fotocamera solo a `https://` o a `localhost`. Alla sagra il sito gira su `http://192.168.x.x:8080`, che **non lo è** |

Quando manca una delle due, il pulsante resta nascosto e il motivo si legge
nelle impostazioni della pagina: meglio nessun pulsante che un pulsante che non
fa niente.

**Per usarla sul telefono in LAN** bisogna dichiarare l'indirizzo del server
fra le origini fidate del browser: in Chrome, `chrome://flags` → *Insecure
origins treated as secure* → aggiungere `http://192.168.x.x:8080`. Si fa una
volta per dispositivo.

Una volta aperta: si inquadra il codice dentro la cornice, la lettura parte da
sola. Lo stesso ordine non viene riletto finché resta sotto l'obiettivo — per
rileggerlo si toglie e si rimette. La fotocamera resta spenta finché non la si
apre, e si chiude col suo pulsante: tenerla accesa tutta la sera scalda il
telefono per niente.

Il lettore fisico resta comunque più rapido, e continua a funzionare sempre.

---

## Uso

L'ordine viene mostrato **per intero prima di essere toccato**: righe, totale,
tavolo, asporto, stato di tutti i reparti, con in evidenza le righe che
riguardano il reparto letto. Solo dopo si conferma.

Per una postazione dedicata al banco si può saltare la conferma, e ogni lettura
evade sul colpo:

| | |
|---|---|
| `avanzamento.html?subito=1` | Vale per quel collegamento. È il modo giusto per un monitor fisso: lo dice l'indirizzo, e gli altri monitor non se lo portano dietro |
| Impostazioni → *Chiedi conferma* | Vale per quel monitor, e resta dopo un riavvio |

Con la conferma spenta compare in alto il riquadro arancione **evasione
immediata**.

Dalle impostazioni della pagina si spegne anche il segnale acustico e si sceglie
in quale serata cercare.

---

## Note sul funzionamento

**La ricerca è sempre dentro una serata.** Il numero d'ordine riparte da 1 a
ogni serata, quindi da solo non identifica un ordine: se non se ne indica una,
si cerca nell'ultima presente nel database, che durante la sagra è quella in
corso.

**Due postazioni non si sovrascrivono.** Il cambio di stato viaggia insieme allo
stato di partenza: se qualcun altro ha già evaso quell'ordine, la seconda
lettura lo dice invece di riscrivere.

**Più casse sullo stesso PostgreSQL** — la sistemazione normale — fanno comparire
l'ordine **una volta sola**: le copie vengono riconosciute dal database di
provenienza, non dalla cassa che ha risposto.

**Ogni avanzamento riuscito lascia una riga** nella finestra di `GSGProxy.exe`:

```
21:14:07 [avanzamento] ordine 42 (cucina): ordinato → evaso  (da 192.168.1.60)
```

---

## Se qualcosa non va

**«Avanzamento non disponibile»** — la cassa usa SQLite oppure ha
`abilitato: false`. L'avviso in cima alla pagina elenca le casse e il motivo di
ciascuna.

**Il lettore legge ma non succede niente** — il fuoco è finito su un altro
campo: cliccare una volta dentro il riquadro grande.

**«Ordine non trovato»** — controllare la serata nelle impostazioni della
pagina.

**«lo stato "…" non esiste nella tabella stati»** — `statoA` in `gsgproxy.json`
non corrisponde a nessuno stato del gestionale. Controllare in File →
Configurazione → Server web, e ricordare che gli stati non devono avere spazi.

**Al posto del codice a barre si stampa un'icona di errore** — è un ordine fatto
prima che il codice a barre fosse attivato: il gestionale non lo sa generare a
posteriori.
