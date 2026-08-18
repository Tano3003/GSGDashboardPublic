@echo off
REM ============================================================
REM   Avvia GSGProxy, il servizio che legge il database.
REM   Va sul PC di cassa, accanto al gestionale.
REM
REM   Funziona sia lanciato da questa cartella "strumenti",
REM   sia copiato dentro la cartella GSGProxy accanto all'exe.
REM ============================================================
setlocal
cd /d "%~dp0"

if not exist "GSGProxy.exe" (
  if exist "..\GSGProxy\GSGProxy.exe" (
    cd /d "..\GSGProxy"
  ) else (
    echo.
    echo  [ERRORE] GSGProxy.exe non trovato.
    echo.
    echo  Copia questo file dentro la cartella GSGProxy, accanto
    echo  a GSGProxy.exe, oppure lancialo dalla cartella strumenti
    echo  tenendo la struttura originale del pacchetto.
    echo.
    pause
    exit /b 1
  )
)

echo Avvio GSGProxy...
echo.
echo GSGProxy parte nascosto: compare un'icona nella tray di Windows,
echo vicino all'orologio (anche fra le "icone nascoste", freccina ^^).
echo Da li': tasto destro - Mostra log per controllare che sia partito bene,
echo Esci per fermarlo.
echo.
start "" GSGProxy.exe

timeout /t 3 /nobreak >nul
