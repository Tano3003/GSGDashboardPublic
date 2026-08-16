@echo off
REM ============================================================
REM   Avvia GSGStatistiche: confronto fra serate, protetto da
REM   password. Sito a parte, indipendente da GSGDashboard.
REM   Facoltativo: da lanciare sul PC server, se lo si usa.
REM
REM   Funziona sia lanciato da questa cartella "strumenti",
REM   sia copiato dentro la cartella GSGStatistiche accanto
REM   all'exe.
REM ============================================================
setlocal
cd /d "%~dp0"

if not exist "GSGStatistiche.exe" (
  if exist "..\GSGStatistiche\GSGStatistiche.exe" (
    cd /d "..\GSGStatistiche"
  ) else (
    echo.
    echo  [ERRORE] GSGStatistiche.exe non trovato.
    echo.
    echo  Copia questo file dentro la cartella GSGStatistiche, accanto
    echo  a GSGStatistiche.exe, oppure lancialo dalla cartella strumenti
    echo  tenendo la struttura originale del pacchetto.
    echo.
    pause
    exit /b 1
  )
)

title GSGStatistiche - NON CHIUDERE questa finestra
echo Avvio GSGStatistiche...
echo.

REM apre il browser dopo un attimo, quando il server e' su
start "" /b cmd /c "timeout /t 3 >nul & start http://localhost:8081/"

GSGStatistiche.exe

echo.
echo GSGStatistiche si e' fermato.
pause
