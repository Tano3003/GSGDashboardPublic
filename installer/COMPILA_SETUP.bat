@echo off
REM ============================================================
REM   Costruisce il programma di installazione di GSG.
REM
REM   Doppio clic su questo file. Serve UNA VOLTA SOLA aver
REM   installato Inno Setup 6 su QUESTO pc (e' gratuito):
REM   sui PC della sagra non serve niente.
REM
REM   Il risultato finisce in:  installer\output\
REM ============================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo  ====================================================
echo   GSG - costruzione del programma di installazione
echo  ====================================================
echo.

REM ------------------------------------------------ dov'e' ISCC.exe?
set "ISCC="

REM 1) e' gia' nel PATH?
for /f "delims=" %%I in ('where ISCC.exe 2^>nul') do if not defined ISCC set "ISCC=%%I"

REM 2) percorsi tipici
if not defined ISCC if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" set "ISCC=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
if not defined ISCC if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe"      set "ISCC=%ProgramFiles%\Inno Setup 6\ISCC.exe"
if not defined ISCC if exist "%LocalAppData%\Programs\Inno Setup 6\ISCC.exe" set "ISCC=%LocalAppData%\Programs\Inno Setup 6\ISCC.exe"

REM 3) registro di sistema, sia per tutti gli utenti sia solo per questo
REM    (winget installa Inno Setup per il singolo utente: finisce in HKCU)
if not defined ISCC (
  for /f "tokens=2,*" %%A in ('reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Inno Setup 6_is1" /v InstallLocation /reg:32 2^>nul ^| find "InstallLocation"') do (
    if exist "%%B\ISCC.exe" set "ISCC=%%B\ISCC.exe"
  )
)
if not defined ISCC (
  for /f "tokens=2,*" %%A in ('reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Inno Setup 6_is1" /v InstallLocation 2^>nul ^| find "InstallLocation"') do (
    if exist "%%B\ISCC.exe" set "ISCC=%%B\ISCC.exe"
  )
)

if not defined ISCC goto :manca_inno

echo  Compilatore .... %ISCC%
echo  Script ......... %CD%\GSG.iss
echo.

REM ------------------------------------------------ ci sono gli eseguibili?
if not exist "..\GSGProxy\GSGProxy.exe" goto :mancano_file
if not exist "..\GSGDashboard\GSGDashboard.exe" goto :mancano_file
if not exist "..\GSGDashboard\wwwroot\dashboard.html" goto :mancano_file

REM ------------------------------------------------ compila
if not exist "output" mkdir "output"

echo  Compilazione in corso...
echo.
"%ISCC%" "GSG.iss"
if errorlevel 1 goto :errore

echo.
echo  ====================================================
echo   Fatto. Il setup e' qui:
echo.
for %%F in ("output\GSG_Setup_*.exe") do echo     %CD%\output\%%~nxF
echo.
echo   E' l'unico file da portare sui PC della sagra:
echo   doppio clic e via.
echo  ====================================================
echo.

choice /c SN /n /m " Apro la cartella? [S/N] "
if errorlevel 2 goto :fine
start "" "%CD%\output"
goto :fine

REM ------------------------------------------------ errori
:manca_inno
echo  [!] Non trovo Inno Setup 6 su questo PC.
echo.
echo      Serve solo qui, per costruire il setup: sui PC della
echo      sagra non va installato niente.
echo.
echo      Modo piu' rapido (Windows 10/11):
echo         winget install -e --id JRSoftware.InnoSetup
echo.
echo      Oppure scaricalo da:
echo         https://jrsoftware.org/isdl.php
echo.
choice /c SN /n /m " Provo a installarlo adesso con winget? [S/N] "
if errorlevel 2 goto :fine
where winget >nul 2>nul || (
  echo.
  echo  [!] winget non e' disponibile su questo PC: scarica Inno Setup
  echo      dal sito indicato sopra e rilancia questo file.
  echo.
  goto :fine
)
echo.
winget install -e --id JRSoftware.InnoSetup
echo.
echo  Se l'installazione e' andata a buon fine, rilancia questo file.
echo.
goto :fine

:mancano_file
echo  [!] Non trovo i programmi da impacchettare.
echo.
echo      Questo file deve stare nella cartella "installer" dentro
echo      il pacchetto, con accanto le cartelle GSGProxy e
echo      GSGDashboard.
echo.
if not exist "..\GSGProxy\GSGProxy.exe"             echo         manca  ..\GSGProxy\GSGProxy.exe
if not exist "..\GSGDashboard\GSGDashboard.exe"     echo         manca  ..\GSGDashboard\GSGDashboard.exe
if not exist "..\GSGDashboard\wwwroot\dashboard.html" echo         manca  ..\GSGDashboard\wwwroot\
echo.
goto :fine

:errore
echo.
echo  [!] La compilazione si e' fermata con un errore.
echo      Il messaggio qui sopra dice quale riga di GSG.iss non va.
echo.

:fine
pause
endlocal
