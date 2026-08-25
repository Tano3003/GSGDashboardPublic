# Componenti di terzi

Questo pacchetto ridistribuisce, **in forma compilata**, il software elencato
qui sotto. Le licenze originali restano valide e sono riportate per intero.

| File nel pacchetto | Componente | Licenza |
|---|---|---|
| `GSGDashboard/wwwroot/vendor/tabler.min.css` | Tabler 1.4.0 | MIT |
| `GSGProxy/Npgsql.dll` | Npgsql 4.0.17 | PostgreSQL License |
| `GSGProxy/System.Data.SQLite.dll` | System.Data.SQLite 1.0.118 | Pubblico dominio |
| `GSGProxy/x86/SQLite.Interop.dll` · `x64/SQLite.Interop.dll` | SQLite | Pubblico dominio |
| `GSGProxy/NLog.dll` · `GSGDashboard/NLog.dll` | NLog 5.3.4 | BSD 3-Clause |
| `GSGProxy/System.Buffers.dll` e altre `System.*.dll` | Librerie .NET Microsoft | MIT |

---

## Tabler

Tema di interfaccia basato su Bootstrap 5, usato dalle pagine web di
GSGDashboard. È incluso invece di essere preso da un CDN perché alla sagra
spesso non c'è connessione a internet.

Sito: <https://tabler.io> · Sorgenti: <https://github.com/tabler/tabler>

```
MIT License

Copyright (c) 2018-2025 The Tabler Authors
Copyright (c) 2018-2025 codecalm.net Paweł Kuna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Tabler include a sua volta [Bootstrap](https://getbootstrap.com) (MIT,
Copyright 2011-2025 The Bootstrap Authors).

---

## Npgsql

Driver PostgreSQL per .NET. Serve a GSGProxy quando il gestionale usa
PostgreSQL.

Sito: <https://www.npgsql.org> · Sorgenti: <https://github.com/npgsql/npgsql>

```
PostgreSQL License

Copyright (c) 2002-2024, Npgsql

Permission to use, copy, modify, and distribute this software and its
documentation for any purpose, without fee, and without a written agreement is
hereby granted, provided that the above copyright notice and this paragraph and
the following two paragraphs appear in all copies.

IN NO EVENT SHALL NPGSQL BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT, SPECIAL,
INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, ARISING OUT OF THE
USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF NPGSQL HAS BEEN ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.

NPGSQL SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE
SOFTWARE PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND NPGSQL HAS NO
OBLIGATIONS TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR
MODIFICATIONS.
```

---

## System.Data.SQLite e SQLite

Driver SQLite per .NET (`System.Data.SQLite.dll`) e la libreria nativa SQLite
(`x86/SQLite.Interop.dll`, `x64/SQLite.Interop.dll`). Servono a GSGProxy quando
il gestionale usa il database SQLite.

Sito: <https://system.data.sqlite.org> · <https://www.sqlite.org>

Entrambi sono rilasciati nel **pubblico dominio**. Dal sito di SQLite:

```
All of the code and documentation in SQLite has been dedicated to the public
domain by the authors. All code authors, and representatives of the companies
they work for, have signed affidavits dedicating their contributions to the
public domain and originals of those signed affidavits are stored in a firesafe
at the main offices of Hwaci. Anyone is free to copy, modify, publish, use,
compile, sell, or distribute the original SQLite code, either in source code
form or as a compiled binary, for any purpose, commercial or non-commercial,
and by any means.

The previous paragraph applies to the deliverable code and documentation in
SQLite - those parts of the SQLite library that you actually bundle and ship
with a larger application.
```

---

## NLog

Registro su file dei tre programmi: un file al giorno, sette giorni di storia.
È quello che apre «Mostra log» dall'icona nella tray di Windows.

Sito: <https://nlog-project.org> · Sorgenti: <https://github.com/NLog/NLog>

```
BSD 3-Clause License

Copyright (c) 2004-2024 Jaroslaw Kowalski <jaak@jkowalski.net>,
Kim Christensen, Julian Verdurmen
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Jaroslaw Kowalski nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
```

---

## Librerie .NET di Microsoft

`System.Buffers.dll`, `System.Memory.dll`, `System.Numerics.Vectors.dll`,
`System.Runtime.CompilerServices.Unsafe.dll`,
`System.Threading.Tasks.Extensions.dll`, `System.ValueTuple.dll`.

Sono dipendenze di Npgsql, distribuite da Microsoft con licenza MIT.

Sorgenti: <https://github.com/dotnet/runtime>

```
The MIT License (MIT)

Copyright (c) .NET Foundation and Contributors

All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Gestione Stand Gastronomico — nessuna parte inclusa

GSG legge il database e le API del gestionale **Gestione Stand Gastronomico**
(<https://www.gestionestandgastronomico.it>), ma **non ne ridistribuisce nessuna
parte**: né programma, né manuale, né database di esempio.

È un progetto indipendente, non affiliato né approvato dai suoi autori. Per
usarlo serve una vostra installazione del gestionale.

### Documentazione del formato dei dati

Alcune informazioni tecniche necessarie a far interoperare i due programmi — il
formato del codice a barre degli ordini, i codici dei reparti, i nomi delle
variabili di stampa — sono documentate nel:

| | |
|---|---|
| Opera | *Gestione stand gastronomico — Manuale d'uso*, v. 2.3.4 |
| Fonte | <https://www.gestionestandgastronomico.it> |
| Licenza | [CC BY-ND 3.0 IT](https://creativecommons.org/licenses/by-nd/3.0/it/) — Attribuzione, Non opere derivate |

Nella nostra documentazione ([`docs/AVANZAMENTO.md`](docs/AVANZAMENTO.md)) se ne
riportano le sole **informazioni funzionali**: nomi di campi, codici numerici e
formato dei dati, cioè quanto serve perché i due programmi si parlino. Il
manuale in sé non è incluso in questo pacchetto e va richiesto agli autori del
gestionale.

### Sul rapporto con la licenza del gestionale

La clausola *Non opere derivate* riguarda la distribuzione di versioni
modificate o adattate dell'opera. GSG **non modifica il gestionale e non ne
distribuisce alcuna parte**: è un programma autonomo che ne legge il database e
ne chiama le API, come farebbe qualunque altro client.

Restano ferme due regole, per chi dovesse riprendere questo progetto:

1. **non impacchettare mai** file del gestionale (eseguibili, manuale, database
   di esempio) insieme a GSG;
2. **non distribuire versioni modificate** del gestionale.

Questo è il nostro inquadramento, non un parere legale.
