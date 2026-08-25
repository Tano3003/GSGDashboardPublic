# Installazione

Guida passo passo, pensata per essere seguita anche da chi non fa questo di
mestiere. Tempo richiesto: una ventina di minuti la prima volta.

Non c'è niente da installare e niente da compilare: si copiano le cartelle e si
fa doppio clic.

## Che cosa va dove

| PC | Cartella da copiare | Porta |
|---|---|---|
| Ogni PC di **cassa** (dove c'è il gestionale e il suo database) | `GSGProxy` | 8099 |
| **Un** PC che fa da server (può essere anche una delle casse) | `GSGDashboard` — ordini *e* statistiche protette da password | 8080 |
| Tablet, monitor di cucina, telefoni | niente: basta il browser | — |

> **Requisito**: .NET Framework 4.8. È già presente su Windows 10 (dalla
> versione 1903) e su Windows 11. Su Windows 7 SP1 e 8.1 va installato una
> volta: cercare «.NET Framework 4.8 offline installer» sul sito Microsoft.

---

## 1. Scaricare

Pulsante verde **Code → Download ZIP**, oppure il pacchetto dalla sezione
**Releases**.

Estrarre lo ZIP in una cartella qualsiasi. Dentro ci sono `GSGProxy`,
`GSGDashboard` e `strumenti`.

> **Windows potrebbe bloccare i file scaricati da internet.** Se all'avvio non
> succede niente: tasto destro sul file `.exe` → *Proprietà* → in fondo, se c'è
> la casella **Annulla blocco** (*Unblock*), spuntarla e dare OK.

---

## 2. Su ogni cassa: GSGProxy

1. Copiare la cartella `GSGProxy` sul PC di cassa, per esempio in
   `C:\sagra\GSGProxy\`. Va copiata **intera**: l'eseguibile da solo non
   funziona, gli servono le `.dll` e le sottocartelle `x86` e `x64`.

2. Doppio clic su `GSGProxy.exe`. Al primo avvio crea `gsgproxy.json`.

   Se Windows mostra «Windows ha protetto il PC»: *Ulteriori informazioni* →
   *Esegui comunque*. Succede perché il programma non ha una firma digitale.

3. Chiudere il programma e aprire `gsgproxy.json` con il Blocco note.

4. Indicare il database.

   **Con SQLite** (predefinito, un PC solo):

   ```jsonc
   "provider": "sqlite",
   "sqlite": { "path": "C:\\sagra\\database.db", "readOnly": true }
   ```

   Attenzione alle **barre doppie**: nel formato JSON `\` va scritto `\\`.

   **Con PostgreSQL** (più casse in rete):

   ```jsonc
   "provider": "postgres",
   "postgres": {
     "host": "192.168.1.10", "port": 5432,
     "database": "sagra", "username": "sagra", "password": "…"
   }
   ```

   Sono gli stessi valori che il gestionale ha nella propria
   `database_url = postgresql://utente:password@host:5432/database`.

5. Riavviare `GSGProxy.exe`. L'icona ricompare nella tray; tasto destro →
   **Mostra log** apre il file di log di oggi, dove deve comparire:

   ```
   Database       : SQLite C:\sagra\database.db (sola lettura)
   In ascolto su  : http://0.0.0.0:8099
   ```

6. Verificare dal browser dello stesso PC:
   `http://127.0.0.1:8099/api/health` → deve rispondere `{"ok":true,...}`.

7. Aprire il firewall: tasto destro su `strumenti\ABILITA_firewall.bat` →
   **Esegui come amministratore**. Una volta sola per PC.

8. Annotare l'indirizzo IP del PC (`ipconfig` dal Prompt dei comandi, voce
   «Indirizzo IPv4»). Serve al passo successivo.

### Lasciarlo sempre acceso

`GSGProxy` va tenuto aperto per tutta la serata: se lo si chiude dall'icona
nella tray (vicino all'orologio, voce **Esci**), i monitor si spengono. Parte
nascosto, senza finestra: per controllare che sia partito bene, tasto destro
sull'icona → **Mostra log**. Per farlo partire da solo all'accensione del PC,
copiare un collegamento a `GSGProxy.exe` dentro `shell:startup` (si apre da
Windows+R).

---

## 3. Sul PC server: GSGDashboard

1. Copiare la cartella `GSGDashboard` intera, per esempio in
   `C:\sagra\GSGDashboard\`. Dentro c'è `wwwroot` con le pagine del sito: senza
   quella cartella il sito non c'è.

2. Doppio clic su `GSGDashboard.exe`. Crea `gsgdashboard.json`.

3. Aprire `http://localhost:8080/` nel browser: si apre la dashboard.

4. Cliccare il pulsante **Server** in alto a destra.

5. Inserire etichetta e indirizzo di ogni cassa, usando gli IP annotati prima:

   ```
   Cassa 1    http://192.168.1.50:8099
   Cassa 2    http://192.168.1.51:8099
   ```

   Se c'è una sola cassa, lasciare vuoto il secondo campo.

6. **Salva**. I pallini in alto devono diventare verdi.

7. Aprire il firewall anche qui (`ABILITA_firewall.bat` come amministratore).

---

## 3-bis. La password delle statistiche

Le statistiche — confronto fra serate, resoconto per articolo e per ingrediente
— sono pagine dello stesso sito, sulla stessa porta, protette da una password.
Non c'è niente da copiare in più: fino alla versione 2.0.6 erano un programma a
parte (`GSGStatistiche`, porta 8081), adesso no.

1. Aprire il sito e premere **Statistiche**, nella barra della dashboard.

2. La prima volta compare un modulo che chiede di scegliere una password
   (minimo 6 caratteri, richiesta due volte): è la prima e unica volta che si
   può impostare senza già conoscerla. Da qui in poi ogni accesso, anche da un
   altro dispositivo, la richiede.

3. Non c'è niente da scrivere a mano in `gsgdashboard.json`: la password ci
   finisce dentro da sola, cifrata.

Gli **ordini**, i monitor di reparto e l'avanzamento restano senza password:
stanno su schermi appesi in cucina, e una password da battere a ogni
riaccensione finirebbe scritta su un foglietto attaccato al monitor.

**Chi aggiorna da una versione precedente** non deve reimpostarla: al primo
avvio GSGDashboard se la prende dal vecchio `gsgstatistiche.json`, se lo trova
accanto a sé o nella vecchia cartella `GSGStatistiche` di fianco alla propria.
Il vecchio `GSGStatistiche.exe` va fermato (icona nella tray → **Esci**) e non
va più riavviato; la sua cartella si può cancellare **dopo** il primo avvio
della versione nuova. La porta 8081 si può richiudere sul firewall:
`ABILITA_firewall.bat` toglie da solo la regola vecchia.

**Password persa?** Fermare `GSGDashboard.exe`, aprire `gsgdashboard.json`,
svuotare `auth.hash` e `auth.salt`, riavviare: al prossimo accesso la pagina
torna a chiedere di impostarne una nuova.

### Una sola macchina per tutto

Per prove, dimostrazioni o sagre con una cassa sola: lanciare
`strumenti\AVVIA_TUTTO.bat`. Avvia i due programmi uno dopo l'altro, aspetta
che rispondano e apre il browser. Partono nascosti: si vedono come icone nella
tray di Windows, vicino all'orologio, una per programma. Da lì, tasto destro →
**Mostra log** per controllare che siano partiti bene, **Esci** per fermarli.

Con più casse invece si torna alla regola normale: su ogni cassa solo
`AVVIA_GSGProxy.bat`, e sul PC server `AVVIA_GSGDashboard.bat`.

---

## 4. I monitor di reparto

Su ogni monitor appeso, aprire il browser a schermo intero (tasto **F11**) e
puntarlo alla pagina giusta:

```
http://IP-DEL-SERVER:8080/reparto.html?reparto=cucina&stato=ordinato&refresh=5
http://IP-DEL-SERVER:8080/reparto.html?reparto=pizzeria&stato=ordinato&refresh=5
http://IP-DEL-SERVER:8080/monitor_ordini.html?reparti=cucina,bar&stato=ordinato
```

Il modo più semplice per costruire questi indirizzi: aprire
`http://IP-DEL-SERVER:8080/` — si apre la dashboard — e usare la scheda
**Monitor**, oppure le voci **Produzione** e **Avanzamento** nella barra in
alto: aprono la pagina in una scheda nuova, da cui si copia l'indirizzo già
impostato.

Ogni pagina si ricorda i filtri nell'indirizzo: se il monitor si riavvia, torna
esattamente com'era. Conviene metterla nei preferiti o come pagina iniziale del
browser.

---

## 5. La postazione con il lettore di codici a barre (facoltativo)

Serve a far avanzare gli ordini: si passa l'ordine stampato sotto il lettore e
quell'ordine passa da `ordinato` a `evaso`.

**Richiede PostgreSQL.** Con SQLite la pagina si apre ma resta spenta, e lo
dice. Dettagli e configurazione in [AVANZAMENTO.md](AVANZAMENTO.md).

In breve:

1. In `gsgproxy.json` deve esserci
   `"avanzamento": { "abilitato": true, "statoDa": "ordinato", "statoA": "evaso" }`.
   All'avvio, il file di log di oggi (icona nella tray → **Mostra log**) deve
   dire `Avanzamento stato ordini: ATTIVO`.

2. Nel gestionale, aggiungere il codice a barre ai modelli di stampa.

3. Aprire `http://IP-DEL-SERVER:8080/avanzamento.html` sul PC della postazione e
   collegare il lettore. Non serve configurarlo: i lettori si comportano come
   una tastiera.

Per una postazione dedicata al banco, `?subito=1` evade a ogni lettura senza
chiedere conferma.

---

## Problemi frequenti

**«Windows ha protetto il PC» all'avvio**
Gli eseguibili non hanno una firma digitale. *Ulteriori informazioni* → *Esegui
comunque*. Se il file era dentro uno ZIP scaricato: tasto destro → *Proprietà* →
*Annulla blocco*.

**GSGProxy non fa comparire l'icona nella tray**
Manca .NET Framework 4.8, oppure la cartella è stata copiata a metà. Va copiata
intera, con le `.dll` e le sottocartelle `x86` e `x64`. Se manca .NET,
compare un messaggio d'errore all'avvio; controllare anche il file di log del
giorno nella cartella `logs` accanto all'eseguibile.

**«Servizio non raggiungibile» su tutte le pagine**
`GSGDashboard.exe` non è in esecuzione sul PC server. Controllare che la sua
icona sia presente nella tray, vicino all'orologio (anche fra le "icone
nascoste", freccina ^).

**Un pallino resta rosso con «connessione rifiutata»**
Su quella cassa `GSGProxy.exe` non è avviato, oppure il firewall blocca la
porta 8099. Provare dal PC server ad aprire
`http://IP-DELLA-CASSA:8099/api/health`.

**«database non trovato» all'avvio di GSGProxy**
Il percorso in `gsgproxy.json` è sbagliato. Ricordare le barre doppie:
`C:\\sagra\\database.db`.

**Il sito si apre ma è tutto senza grafica**
Manca la cartella `wwwroot\vendor\`. Ricopiare `GSGDashboard` intera.

**I numeri sembrano vecchi**
Chiudere e riaprire la scheda del browser. Se il problema resta, svuotare la
cache (Ctrl+Maiusc+R).

**Il sito si vede solo sul PC server**
Manca la regola del firewall, oppure si sta usando `localhost` invece
dell'indirizzo IP. Dagli altri dispositivi va usato `http://IP-DEL-SERVER:8080/`.

**La pagina di avanzamento dice «non disponibile»**
Quella cassa usa SQLite, oppure ha `avanzamento.abilitato: false` in
`gsgproxy.json`. L'avviso in cima alla pagina elenca le casse e il motivo di
ciascuna.

**Gli orari di attesa sono sbagliati**
Gli orologi dei PC non sono allineati. Sincronizzarli: Impostazioni → Data e ora
→ Sincronizza ora.

**Le statistiche chiedono sempre la password e non l'ho mai impostata**
Vuol dire che `gsgdashboard.json` ha già un `auth.hash` scritto: qualcuno l'ha
già impostata (magari per errore, la prima volta che si è aperta la pagina),
oppure è stata recuperata da una vecchia installazione di `GSGStatistiche`.
Chiedere a chi gestisce l'impianto, oppure svuotare `auth.hash` e `auth.salt`
nel file e riavviare per sceglierne una nuova.

---

## Aggiornare a una versione nuova

1. Fermare i programmi (icona nella tray → **Esci**, per ognuno).
2. Sostituire i file, **tenendo da parte** `gsgproxy.json` e
   `gsgdashboard.json`: contengono la vostra configurazione e la password
   delle statistiche, e non vanno sovrascritti. Se sul PC c'era anche
   `GSGStatistiche`, lasciare la sua cartella dov'è fino al primo avvio della
   versione nuova: è da lì che si recupera la password già impostata.
3. Riavviare.

Per correzioni alla sola grafica basta sostituire i file dentro
`GSGDashboard\wwwroot\` e ricaricare il browser: non serve nemmeno riavviare il
programma.
