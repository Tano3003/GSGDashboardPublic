@echo off
REM ============================================================
REM   Avvia GSGDashboard: pubblica il sito e somma le casse.
REM   Da lanciare su UN SOLO PC, quello che fa da server.
REM
REM   Funziona sia lanciato da questa cartella "strumenti",
REM   sia copiato dentro la cartella GSGDashboard accanto all'exe.
REM ============================================================
setlocal
cd /d "%~dp0"

if not exist "GSGDashboard.exe" (
  if exist "..\GSGDashboard\GSGDashboard.exe" (
    cd /d "..\GSGDashboard"
  ) else (
    echo.
    echo  [ERRORE] GSGDashboard.exe non trovato.
    echo.
    echo  Copia questo file dentro la cartella GSGDashboard, accanto
    echo  a GSGDashboard.exe, oppure lancialo dalla cartella strumenti
    echo  tenendo la struttura originale del pacchetto.
    echo.
    pause
    exit /b 1
  )
)

title GSGDashboard - NON CHIUDERE questa finestra
echo Avvio GSGDashboard...
echo.

REM apre il browser dopo un attimo, quando il server e' su
start "" /b cmd /c "timeout /t 3 >nul & start http://localhost:8080/"

GSGDashboard.exe

echo.
echo GSGDashboard si e' fermato.
pause
