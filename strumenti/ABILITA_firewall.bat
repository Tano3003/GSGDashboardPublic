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
REM     - sul PC server serve la porta del sito (8080), che pubblica
REM       anche le statistiche
REM   Aprirle tutte e due ovunque non fa danno.
REM ============================================================
setlocal

REM --- porte: devono combaciare con gsgproxy.json e gsgdashboard.json ---
set API_PORT=8099
set WEB_PORT=8080

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
REM la 8081 non serve piu': GSGStatistiche e' diventato una parte di
REM GSGDashboard. La regola vecchia si toglie, se e' rimasta.
netsh advfirewall firewall delete rule name="GSGStatistiche 8081" >nul 2>&1

REM regole in ingresso, valide per tutti i profili di rete
netsh advfirewall firewall add rule name="GSGProxy %API_PORT%" dir=in action=allow protocol=TCP localport=%API_PORT% profile=any
netsh advfirewall firewall add rule name="GSGDashboard %WEB_PORT%" dir=in action=allow protocol=TCP localport=%WEB_PORT% profile=any

echo.
echo  Fatto. Porte %API_PORT% e %WEB_PORT% aperte in ingresso.
echo.
echo  Prova da un altro dispositivo della rete:
echo    http://IP_DI_QUESTO_PC:%API_PORT%/api/health     (GSGProxy)
echo    http://IP_DI_QUESTO_PC:%WEB_PORT%/               (sito e statistiche)
echo.
echo  Per conoscere l'IP di questo PC lancia:  ipconfig
echo.
pause
