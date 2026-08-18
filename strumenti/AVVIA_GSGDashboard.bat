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

echo Avvio GSGDashboard...
echo.
echo GSGDashboard parte nascosto: compare un'icona nella tray di Windows,
echo vicino all'orologio (anche fra le "icone nascoste", freccina ^^).
echo Da li': tasto destro - Mostra log per controllare che sia partito bene,
echo Esci per fermarlo.
echo.
start "" GSGDashboard.exe

REM apre il browser dopo un attimo, quando il server e' su
start "" /b cmd /c "timeout /t 3 >nul & start http://localhost:8080/"
