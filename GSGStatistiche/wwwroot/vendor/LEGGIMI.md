# Codice di terzi

Roba non nostra. Non va modificata a mano: al primo aggiornamento le modifiche
sparirebbero senza lasciare traccia. Se serve cambiare qualcosa si scrive una
regola in `../sagra.css`, che viene caricato dopo e quindi vince.

## tabler.min.css

| | |
|---|---|
| Progetto | [Tabler](https://tabler.io) — tema di interfaccia basato su Bootstrap 5 |
| Versione | **1.4.0** |
| Licenza | MIT |
| Scaricato da | `https://cdn.jsdelivr.net/npm/@tabler/core@1.4.0/dist/css/tabler.min.css` |
| Dimensione | 536 KB |

Per aggiornarlo basta riscaricare il file cambiando il numero di versione
nell'indirizzo, e poi **alzare `CACHE` in `../sw.js`**, altrimenti i monitor
già accesi continuano a usare quello vecchio preso dalla cache.

**Perché il file sta qui e non su un CDN.** Alla sagra non c'è internet. La
rete è una LAN chiusa con il PC server e i monitor: un `<link>` a jsdelivr
darebbe pagine senza stile proprio la sera in cui servono.

**È stato verificato che funzioni offline**: il file non contiene nessun
riferimento `http://` o `https://`, nessun `@font-face` e nessuna immagine
esterna — le poche icone che usa sono `data:` in linea. L'unica dipendenza
esterna sarebbe il carattere *Inter*, che però non viene scaricato: se non è
installato sul PC, Tabler ripiega su Segoe UI, che su Windows c'è sempre.

Del pacchetto Tabler serve **solo il CSS**. Il suo JavaScript (`tabler.min.js`,
che è poi quello di Bootstrap) non è stato preso: serve per menù a tendina,
finestre modali e suggerimenti, che qui non si usano. Se un domani servisse un
componente che lo richiede, va aggiunto qui e messo in `SHELL` dentro `sw.js`.
