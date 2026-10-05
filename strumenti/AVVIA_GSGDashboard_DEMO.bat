@echo off
REM ============================================================
REM   Avvia GSGDashboard in MODALITA' DEMO: due casse finte con
REM   dati inventati, per vedere le pagine in presentazione senza
REM   un database aggiornato. Non legge e non scrive nessun file
REM   di configurazione.
REM
REM   Usa la porta 8081, cosi' si puo' tenere acceso anche il
REM   GSGDashboard vero (porta 8080). Password dei rendiconti:
REM   demo1234
REM ============================================================
setlocal
cd /d "%~dp0"

if not exist "GSGDashboard.exe" (
  if exist "..\GSGDashboard\GSGDashboard.exe" (
    cd /d "..\GSGDashboard"
  ) else if exist "..\GSGDashboard\bin\Debug\net48\GSGDashboard.exe" (
    cd /d "..\GSGDashboard\bin\Debug\net48"
  ) else (
    echo.
    echo  [ERRORE] GSGDashboard.exe non trovato.
    echo  Compila la soluzione con:  dotnet build GSG.sln -c Release
    echo  oppure copia questo file accanto a GSGDashboard.exe
    echo.
    pause
    exit /b 1
  )
)

echo Avvio GSGDashboard in modalita' DEMO sulla porta 8081...
echo Password dei rendiconti: demo1234
echo Per fermarlo: icona nella tray di Windows - Esci.
echo.
start "" GSGDashboard.exe --demo --port 8081

start "" /b cmd /c "timeout /t 3 >nul & start http://localhost:8081/"
