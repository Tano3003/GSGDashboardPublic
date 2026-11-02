# Il programma di installazione

Questa cartella non serve a chi usa GSG: serve a **costruire il file
`GSG_Setup.exe`** da consegnare ai PC della sagra.

Chi installa vede un solo file e fa doppio clic. Niente cartelle da copiare,
niente file da spostare, niente JSON da scrivere a mano.

| File | Che cos'è |
|---|---|
| `COMPILA_SETUP.bat` | **Doppio clic qui.** Costruisce il setup |
| `GSG.iss` | Lo script: cosa installare, dove, con quali domande |
| `DOPO_INSTALLAZIONE.txt` | La schermata finale del setup |
| `gsg.ico` | L'icona, ricavata da `wwwroot/icons/icon-512.png` |
| `output/` | Il setup costruito. In git entrano solo i `GSG_Setup_*.exe`, il resto (log, ecc.) no |

---

## Costruire il setup

Doppio clic su **`COMPILA_SETUP.bat`**. Il risultato compare in
`installer\output\GSG_Setup_<versione>.exe`.

La prima volta serve **Inno Setup 6** su questo PC (gratuito, si installa una
volta sola). Se manca, il `.bat` lo dice e si offre di installarlo:

```
winget install -e --id JRSoftware.InnoSetup
```

oppure a mano da <https://jrsoftware.org/isdl.php>.

> Sui PC della sagra Inno Setup **non** serve: lì arriva solo il `setup.exe`.

Il numero di versione non va scritto da nessuna parte: lo script lo legge da
`GSGDashboard.exe`. Ricompilando dopo un aggiornamento degli eseguibili, il
nome del file segue da solo.

---

## Che cosa fa il setup, sul PC di destinazione

1. **Controlla .NET Framework 4.8.** Se manca, offre di aprire la pagina
   Microsoft: è il motivo numero uno per cui i programmi «si aprono e si
   chiudono subito».

2. **Chiede che PC è questo:** cassa (`GSGProxy`), server (`GSGDashboard`),
   oppure tutti e due su una macchina sola.

3. **Copia tutto in `C:\sagra\`**, con le sottocartelle `x86`/`x64` e
   `wwwroot` al posto giusto — le due cose che, copiando a mano, si dimenticano
   più spesso.

4. **Fa le domande sulla configurazione** e scrive lui i file JSON:
   - per la cassa: SQLite (con selezione del file `.db`) oppure PostgreSQL
     (indirizzo, porta, database, utente, password);
   - per il server: gli indirizzi delle casse, fino a quattro.

   Le barre rovesce dei percorsi vengono raddoppiate come vuole il formato
   JSON, così non si sbaglia.

5. **Apre le porte 8099 e 8080 nel firewall** — solo quelle dei componenti
   installati davvero.

6. **Mette i programmi in avvio automatico** e crea il gruppo «GSG» nel menu
   Start, con i collegamenti per avviare, per aprire il sito e le statistiche e
   per modificare la configurazione col Blocco note. I collegamenti sul Desktop
   sono facoltativi (casella non spuntata di default).

7. **Si disinstalla** da «App installate», togliendo anche le regole del
   firewall. I file `gsgproxy.json` e `gsgdashboard.json` restano: contengono il
   database e la password.

---

## Aggiornamenti: la configurazione non si perde

Se `gsgproxy.json` o `gsgdashboard.json` esistono già, il setup **non li tocca
e non fa le domande relative**: sono i file che contengono il percorso del
database e la password. Nella pagina di riepilogo si legge
«configurazione già presente: la lascio com'è».

Per rifare la configurazione da capo, si cancella il file `.json` e si rilancia
il setup.

L'`AppId` in cima a `GSG.iss` è ciò che lega una versione all'altra:
**non va mai cambiato**, altrimenti Windows tratta l'aggiornamento come un
secondo programma separato.

---

## Installazione senza domande, su molte casse

Utile quando le postazioni sono parecchie e sono tutte uguali:

```bat
GSG_Setup_<versione>.exe /VERYSILENT /SUPPRESSMSGBOXES /COMPONENTS="proxy"
```

Va lanciato da un prompt **come amministratore**. Non comparendo nessuna
domanda, i file JSON vengono scritti con i valori predefiniti
(SQLite in `C:\sagra\database.db`, una cassa su `127.0.0.1`): il percorso del
database va poi corretto su ogni PC, oppure si copia sopra un `gsgproxy.json`
già pronto **prima** di lanciare il setup — in quel caso il setup lo rispetta e
lo lascia intatto.

Opzioni utili: `/COMPONENTS="proxy,dashboard"`, `/DIR="D:\sagra"`,
`/TASKS="firewall,avvioauto"`, `/LOG="setup.log"`.

---

## Note tecniche

- Il setup richiede i **diritti di amministratore**: servono per le regole del
  firewall, per l'avvio automatico valido per tutti gli utenti e per scrivere
  in `C:\`. Windows mostrerà il solito avviso UAC.
- Gli eseguibili **non hanno una firma digitale**, quindi al primo avvio
  SmartScreen dice «Windows ha protetto il PC» → *Ulteriori informazioni* →
  *Esegui comunque*. Per toglierlo servirebbe un certificato di firma del
  codice a pagamento.
- Se i programmi sono in esecuzione durante un aggiornamento, Windows li chiude
  da solo (Restart Manager) e il setup prosegue.
