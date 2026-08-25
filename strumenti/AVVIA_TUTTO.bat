@echo off
REM ============================================================
REM   Avvia GSGProxy e GSGDashboard su questo PC e apre il sito.
REM
REM   Comodo quando una sola macchina fa sia da cassa sia da
REM   server: prove, sagre con una cassa sola, dimostrazioni.
REM   Con piu' casse, su ognuna va avviato solo GSGProxy
REM   (AVVIA_GSGProxy.bat) e il sito su un PC solo.
REM
REM   I programmi partono nascosti: si vedono come icone nella tray di
REM   Windows, vicino all'orologio. Per fermare tutto, tasto destro
REM   sull'icona -> Esci, per ognuna.
REM
REM   Le statistiche non sono piu' un programma a parte: sono
REM   pagine dello stesso sito, sulla stessa porta, dietro una
REM   password che si imposta al primo accesso dal browser
REM   (pulsante "Statistiche" nella barra della dashboard).
REM ============================================================
setlocal
cd /d "%~dp0"

REM --- porte: devono combaciare con gsgproxy.json e gsgdashboard.json ---
set PROXY_PORT=8099
set WEB_PORT=8080

echo.
echo  ====================================================
echo   GSG - avvio di GSGProxy e GSGDashboard
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
echo  [1/2] Avvio GSGProxy ^(lettura del database, porta %PROXY_PORT%^)...
start "GSGProxy" /D "%PROXY_DIR%" GSGProxy.exe
goto :attendi_proxy

:proxy_gia_attivo
echo  [1/2] GSGProxy risponde gia' sulla porta %PROXY_PORT%: non lo riavvio.
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
echo  [!] GSGProxy non risponde ancora. Guarda il suo log ^(icona nella tray,
echo      vicino all'orologio -^> Mostra log^): di solito il motivo e' il
echo      percorso del database sbagliato in gsgproxy.json. Il sito parte
echo      lo stesso e mostrera' la cassa in rosso.
echo.
goto :avvia_web

:proxy_pronto
echo        GSGProxy pronto.

REM ------------------------------------------------ 2) GSGDashboard
:avvia_web
if defined HAVE_CURL (
  curl -s -o nul --max-time 2 http://127.0.0.1:%WEB_PORT%/hub/health && goto :web_gia_attivo
)
echo  [2/2] Avvio GSGDashboard ^(sito, porta %WEB_PORT%^)...
start "GSGDashboard" /D "%WEB_DIR%" GSGDashboard.exe
goto :attendi_web

:web_gia_attivo
echo  [2/2] GSGDashboard risponde gia' sulla porta %WEB_PORT%: non lo riavvio.
goto :apri

:attendi_web
if not defined HAVE_CURL (
  timeout /t 4 /nobreak >nul
  goto :apri
)
set /a TENTATIVI=0
:ciclo_web
timeout /t 1 /nobreak >nul
curl -s -o nul --max-time 2 http://127.0.0.1:%WEB_PORT%/hub/health && goto :web_pronto
set /a TENTATIVI+=1
if %TENTATIVI% lss 15 goto :ciclo_web
echo.
echo  [!] GSGDashboard non risponde. Guarda il suo log ^(icona nella tray,
echo      vicino all'orologio -^> Mostra log^): se la porta %WEB_PORT% e'
echo      gia' occupata da un altro programma, cambiala in gsgdashboard.json.
echo.
goto :apri

:web_pronto
echo        GSGDashboard pronto.

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
echo   Statistiche ..... http://localhost:%WEB_PORT%/statistiche.html  ^(password al primo accesso^)
echo.
echo   Dagli altri dispositivi della rete usa l'indirizzo IP
echo   di questo PC al posto di "localhost". Per conoscerlo:
echo     ipconfig
echo   Se non si vede da fuori, lancia ABILITA_firewall.bat
echo   come amministratore.
echo.
echo   Per FERMARE tutto: icona nella tray, vicino all'orologio,
echo   tasto destro -^> Esci, per GSGProxy e per GSGDashboard.
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
