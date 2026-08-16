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

title GSGProxy - NON CHIUDERE questa finestra
echo Avvio GSGProxy...
echo Per fermarlo: Ctrl+C, oppure chiudi questa finestra.
echo.
GSGProxy.exe

echo.
echo GSGProxy si e' fermato.
pause
