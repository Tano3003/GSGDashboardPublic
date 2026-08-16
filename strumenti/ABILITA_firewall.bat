@echo off
REM ============================================================
REM   Apre nel Firewall di Windows le porte usate da GSG, cosi'
REM   API e sito sono raggiungibili DALLA RETE.
REM
REM   >>> Eseguire come AMMINISTRATORE <<<
REM   (tasto destro sul file -> Esegui come amministratore)
REM
REM   Va lanciato una volta sola per PC:
REM     - sui PC di cassa serve la porta dell'API (8099)
REM     - sul PC server servono la porta del sito (8080) e, se si usa
REM       GSGStatistiche, quella delle statistiche (8081)
REM   Aprirle tutte ovunque non fa danno.
REM ============================================================
setlocal

REM --- porte: devono combaciare con gsgproxy.json, gsgdashboard.json e gsgstatistiche.json ---
set API_PORT=8099
set WEB_PORT=8080
set STATS_PORT=8081

REM --- verifica privilegi di amministratore ---
net session >nul 2>&1
if not "%errorlevel%"=="0" (
  echo.
  echo  [ERRORE] Questo file va eseguito COME AMMINISTRATORE.
  echo  Chiudi, fai click destro sul file e scegli "Esegui come amministratore".
  echo.
  pause
  exit /b 1
)

echo Aggiungo le regole del firewall...

REM rimuove eventuali regole omonime gia' presenti, per non duplicarle
netsh advfirewall firewall delete rule name="GSGProxy %API_PORT%" >nul 2>&1
netsh advfirewall firewall delete rule name="GSGDashboard %WEB_PORT%" >nul 2>&1
netsh advfirewall firewall delete rule name="GSGStatistiche %STATS_PORT%" >nul 2>&1

REM regole in ingresso, valide per tutti i profili di rete
netsh advfirewall firewall add rule name="GSGProxy %API_PORT%" dir=in action=allow protocol=TCP localport=%API_PORT% profile=any
netsh advfirewall firewall add rule name="GSGDashboard %WEB_PORT%" dir=in action=allow protocol=TCP localport=%WEB_PORT% profile=any
netsh advfirewall firewall add rule name="GSGStatistiche %STATS_PORT%" dir=in action=allow protocol=TCP localport=%STATS_PORT% profile=any

echo.
echo  Fatto. Porte %API_PORT%, %WEB_PORT% e %STATS_PORT% aperte in ingresso.
echo.
echo  Prova da un altro dispositivo della rete:
echo    http://IP_DI_QUESTO_PC:%API_PORT%/api/health     (GSGProxy)
echo    http://IP_DI_QUESTO_PC:%WEB_PORT%/               (sito)
echo    http://IP_DI_QUESTO_PC:%STATS_PORT%/             (statistiche, se usato)
echo.
echo  Per conoscere l'IP di questo PC lancia:  ipconfig
echo.
pause
