@echo off
REM ============================================================
REM   Avvia GSGProxy, GSGDashboard e GSGStatistiche su questo PC
REM   e apre il sito.
REM
REM   Comodo quando una sola macchina fa sia da cassa sia da
REM   server: prove, sagre con una cassa sola, dimostrazioni.
REM   Con piu' casse, su ognuna va avviato solo GSGProxy
REM   (AVVIA_GSGProxy.bat) e il sito su un PC solo.
REM
REM   Si aprono fino a tre finestre nere: sono i programmi.
REM   Vanno lasciate aperte. Per fermare tutto, chiudile.
REM
REM   GSGStatistiche e' facoltativo: se non e' stato installato,
REM   lo si salta senza fermare gli altri due. Al primo accesso
REM   dal browser chiede di impostare una password.
REM ============================================================
setlocal
cd /d "%~dp0"

REM --- porte: devono combaciare con gsgproxy.json, gsgdashboard.json e gsgstatistiche.json ---
set PROXY_PORT=8099
set WEB_PORT=8080
set STATS_PORT=8081

echo.
echo  ====================================================
echo   GSG - avvio di GSGProxy, GSGDashboard e GSGStatistiche
echo  ====================================================
echo.

REM ------------------------------------------------ dove sono gli eseguibili
REM Il file funziona sia copiato accanto agli exe, sia lasciato nella
REM cartella strumenti del pacchetto.
set PROXY_DIR=
if exist "GSGProxy.exe"                                 set "PROXY_DIR=%CD%"
if not defined PROXY_DIR if exist "..\GSGProxy\GSGProxy.exe" set "PROXY_DIR=%CD%\..\GSGProxy"

set WEB_DIR=
if exist "GSGDashboard.exe"                             set "WEB_DIR=%CD%"
if not defined WEB_DIR if exist "..\GSGDashboard\GSGDashboard.exe" set "WEB_DIR=%CD%\..\GSGDashboard"

set STATS_DIR=
if exist "GSGStatistiche.exe"                             set "STATS_DIR=%CD%"
if not defined STATS_DIR if exist "..\GSGStatistiche\GSGStatistiche.exe" set "STATS_DIR=%CD%\..\GSGStatistiche"

if not defined PROXY_DIR goto :mancano
if not defined WEB_DIR   goto :mancano

REM ------------------------------------------------ curl c'e'?
REM Serve solo per capire quando i programmi sono pronti. Windows 10 e 11
REM lo hanno di serie; se manca si aspetta un tempo fisso.
set HAVE_CURL=
where curl >nul 2>nul && set HAVE_CURL=1

REM ------------------------------------------------ 1) GSGProxy
if defined HAVE_CURL (
  curl -s -o nul --max-time 2 http://127.0.0.1:%PROXY_PORT%/api/health && goto :proxy_gia_attivo
)
echo  [1/3] Avvio GSGProxy ^(lettura del database, porta %PROXY_PORT%^)...
start "GSGProxy - NON CHIUDERE" /D "%PROXY_DIR%" GSGProxy.exe
goto :attendi_proxy

:proxy_gia_attivo
echo  [1/3] GSGProxy risponde gia' sulla porta %PROXY_PORT%: non lo riavvio.
goto :avvia_web

:attendi_proxy
if not defined HAVE_CURL (
  timeout /t 4 /nobreak >nul
  goto :avvia_web
)
set /a TENTATIVI=0
:ciclo_proxy
timeout /t 1 /nobreak >nul
curl -s -o nul --max-time 2 http://127.0.0.1:%PROXY_PORT%/api/health && goto :proxy_pronto
set /a TENTATIVI+=1
if %TENTATIVI% lss 15 goto :ciclo_proxy
echo.
echo  [!] GSGProxy non risponde ancora. Guarda la sua finestra: di solito
echo      il motivo e' il percorso del database sbagliato in gsgproxy.json.
echo      Il sito parte lo stesso e mostrera' la cassa in rosso.
echo.
goto :avvia_web

:proxy_pronto
echo        GSGProxy pronto.

REM ------------------------------------------------ 2) GSGDashboard
:avvia_web
if defined HAVE_CURL (
  curl -s -o nul --max-time 2 http://127.0.0.1:%WEB_PORT%/hub/health && goto :web_gia_attivo
)
echo  [2/3] Avvio GSGDashboard ^(sito, porta %WEB_PORT%^)...
start "GSGDashboard - NON CHIUDERE" /D "%WEB_DIR%" GSGDashboard.exe
goto :attendi_web

:web_gia_attivo
echo  [2/3] GSGDashboard risponde gia' sulla porta %WEB_PORT%: non lo riavvio.
goto :avvia_stats

:attendi_web
if not defined HAVE_CURL (
  timeout /t 4 /nobreak >nul
  goto :avvia_stats
)
set /a TENTATIVI=0
:ciclo_web
timeout /t 1 /nobreak >nul
curl -s -o nul --max-time 2 http://127.0.0.1:%WEB_PORT%/hub/health && goto :web_pronto
set /a TENTATIVI+=1
if %TENTATIVI% lss 15 goto :ciclo_web
echo.
echo  [!] GSGDashboard non risponde. Guarda la sua finestra: se la porta
echo      %WEB_PORT% e' gia' occupata da un altro programma, cambiala in
echo      gsgdashboard.json.
echo.
goto :avvia_stats

:web_pronto
echo        GSGDashboard pronto.

REM ------------------------------------------------ 3) GSGStatistiche (facoltativo)
:avvia_stats
if not defined STATS_DIR (
  echo  [3/3] GSGStatistiche non installato: lo salto ^(non e' obbligatorio^).
  goto :apri
)
if defined HAVE_CURL (
  curl -s -o nul --max-time 2 http://127.0.0.1:%STATS_PORT%/auth/status && goto :apri
)
echo  [3/3] Avvio GSGStatistiche ^(statistiche, porta %STATS_PORT%^)...
start "GSGStatistiche - NON CHIUDERE" /D "%STATS_DIR%" GSGStatistiche.exe
timeout /t 2 /nobreak >nul

REM ------------------------------------------------ apri il browser
:apri
echo.
echo  Apro il sito nel browser...
start "" "http://localhost:%WEB_PORT%/"

echo.
echo  ====================================================
echo   Tutto avviato.
echo.
echo   Sito ............ http://localhost:%WEB_PORT%/
echo   API database .... http://localhost:%PROXY_PORT%/api/health
if defined STATS_DIR (
echo   Statistiche ..... http://localhost:%STATS_PORT%/  ^(password al primo accesso^)
)
echo.
echo   Dagli altri dispositivi della rete usa l'indirizzo IP
echo   di questo PC al posto di "localhost". Per conoscerlo:
echo     ipconfig
echo   Se non si vede da fuori, lancia ABILITA_firewall.bat
echo   come amministratore.
echo.
echo   Per FERMARE tutto: chiudi le finestre nere
echo   "GSGProxy", "GSGDashboard" e "GSGStatistiche".
echo  ====================================================
echo.
goto :fine

:mancano
echo.
echo  [ERRORE] Non trovo gli eseguibili.
echo.
if not defined PROXY_DIR echo    manca GSGProxy.exe
if not defined WEB_DIR   echo    manca GSGDashboard.exe
echo.
echo  Tieni la struttura del pacchetto (le cartelle GSGProxy e
echo  GSGDashboard accanto a strumenti), oppure copia questo file
echo  nella cartella dove stanno gli .exe
echo.

:fine
pause
endlocal
