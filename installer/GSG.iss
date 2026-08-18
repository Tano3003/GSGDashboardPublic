; ============================================================================
;  GSG Dashboard - Cruscotto per Gestione Stand Gastronomico
;  Script di installazione per Inno Setup 6.
;
;  ATTENZIONE al nome: "Gestione Stand Gastronomico" e' il gestionale VERO,
;  di gestionestandgastronomico.it, con il suo database. Questo installer
;  NON installa quel programma: installa un cruscotto/companion (sito,
;  monitor cucina, statistiche) che gli gira accanto e ne legge il database
;  in sola lettura. Per questo il titolo che il wizard mostra e' "GSG
;  Dashboard", non il nome del gestionale.
;
;  Per costruire il setup.exe: doppio clic su COMPILA_SETUP.bat
;  (oppure aprire questo file con Inno Setup Compiler e premere F9).
;
;  Il risultato finisce in  installer\output\GSG_Setup_<versione>.exe
;  ed e' l'UNICO file da portare sui PC della sagra.
; ============================================================================

#define NomeApp        "GSG Dashboard"
#define Sottotitolo    "Cruscotto per Gestione Stand Gastronomico"
#define NomeBreve      "GSG"
#define Editore        "Sagra"
#define SitoWeb        "https://github.com/Tano3003/SGSDashboardPublic"
#define Radice         ".."
#define Versione       GetVersionNumbersString(Radice + "\GSGDashboard\GSGDashboard.exe")
#define PortaProxy     "8099"
#define PortaWeb       "8080"
#define PortaStats     "8081"

[Setup]
; AppId identifica il programma per l'aggiornamento e la disinstallazione:
; NON va mai cambiato fra una versione e l'altra.
AppId={{7C4F2E10-9B3A-4D26-8F51-1A6E5C0B7D34}
AppName={#NomeApp}
AppVersion={#Versione}
AppVerName={#NomeBreve} {#Versione}
AppPublisher={#Editore}
AppPublisherURL={#SitoWeb}
AppSupportURL={#SitoWeb}
AppUpdatesURL={#SitoWeb}/releases
VersionInfoVersion={#Versione}
VersionInfoDescription=Installazione di {#NomeApp} - {#Sottotitolo}

; C:\sagra come da guida: percorso corto, senza spazi e senza accenti.
DefaultDirName={sd}\sagra
DefaultGroupName={#NomeBreve}
AllowNoIcons=yes
LicenseFile={#Radice}\LICENSE
InfoAfterFile=DOPO_INSTALLAZIONE.txt

OutputDir=output
OutputBaseFilename=GSG_Setup_{#Versione}
SetupIconFile=gsg.ico
UninstallDisplayIcon={app}\gsg.ico
UninstallDisplayName={#NomeApp}

Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
DisableWelcomePage=no
ShowLanguageDialog=no

; Servono i diritti di amministratore per il firewall, per l'avvio automatico
; e per scrivere in C:\
PrivilegesRequired=admin
MinVersion=6.1sp1

; Se i programmi sono in esecuzione, Windows li chiude prima di sostituirli.
CloseApplications=yes
CloseApplicationsFilter=*.exe,*.dll
RestartApplications=no

[Languages]
Name: "it"; MessagesFile: "compiler:Languages\Italian.isl"

; ---------------------------------------------------------------------------
;  Che cosa installare: dipende dal ruolo del PC
; ---------------------------------------------------------------------------
[Types]
Name: "cassa";  Description: "PC di cassa - legge il database (GSGProxy)"
Name: "server"; Description: "PC server - pubblica il sito (GSGDashboard)"
Name: "tutto";  Description: "Una macchina sola per tutto (cassa + server)"
Name: "scelta"; Description: "Scelta personalizzata"; Flags: iscustom

[Components]
Name: "proxy";      Description: "GSGProxy - legge il database del gestionale (porta {#PortaProxy})"; \
                    Types: cassa tutto scelta
Name: "dashboard";  Description: "GSGDashboard - sito, monitor e ordini (porta {#PortaWeb})"; \
                    Types: server tutto scelta
Name: "statistiche"; Description: "GSGStatistiche - confronto fra serate, protetto da password (porta {#PortaStats})"; \
                    Types: server tutto scelta

[Tasks]
Name: "firewall";    Description: "Apri le porte nel Firewall di Windows (serve per vedere il sito dagli altri dispositivi)"
Name: "avvioauto";   Description: "Avvia i programmi all'accensione del PC"
Name: "desktopicon"; Description: "Crea i collegamenti sul Desktop"; Flags: unchecked

; ---------------------------------------------------------------------------
;  I file
; ---------------------------------------------------------------------------
[Files]
; GSGProxy: exe, dll e le sottocartelle x86/x64 (senza, non parte).
; La configurazione reale NON viene copiata: la scrive il setup, e in caso di
; aggiornamento quella gia' presente resta intatta.
Source: "{#Radice}\GSGProxy\*"; DestDir: "{app}\GSGProxy"; Components: proxy; \
        Excludes: "gsgproxy.json"; Flags: ignoreversion recursesubdirs createallsubdirs

; GSGDashboard: exe piu' la cartella wwwroot con le pagine del sito.
Source: "{#Radice}\GSGDashboard\*"; DestDir: "{app}\GSGDashboard"; Components: dashboard; \
        Excludes: "gsgdashboard.json"; Flags: ignoreversion recursesubdirs createallsubdirs

; GSGStatistiche: sito a parte, protetto da password (impostata al primo
; accesso dal browser, non da questo installer).
Source: "{#Radice}\GSGStatistiche\*"; DestDir: "{app}\GSGStatistiche"; Components: statistiche; \
        Excludes: "gsgstatistiche.json"; Flags: ignoreversion recursesubdirs createallsubdirs

; Utilita' e documentazione: sempre.
Source: "{#Radice}\strumenti\*"; DestDir: "{app}\strumenti"; Flags: ignoreversion
Source: "{#Radice}\docs\*";      DestDir: "{app}\docs";      Flags: ignoreversion recursesubdirs
Source: "{#Radice}\README.md";                DestDir: "{app}"; Flags: ignoreversion
Source: "{#Radice}\LICENSE";                  DestDir: "{app}"; Flags: ignoreversion
Source: "{#Radice}\THIRD-PARTY-NOTICES.md";   DestDir: "{app}"; Flags: ignoreversion
Source: "gsg.ico";                            DestDir: "{app}"; Flags: ignoreversion

; ---------------------------------------------------------------------------
;  Collegamenti
; ---------------------------------------------------------------------------
[Icons]
; --- menu Start ---
Name: "{group}\Avvia GSG (sito + cassa)"; Filename: "{app}\strumenti\AVVIA_TUTTO.bat"; \
      WorkingDir: "{app}\strumenti"; IconFilename: "{app}\gsg.ico"; Check: TuttoInUno

Name: "{group}\Avvia GSGProxy (cassa)"; Filename: "{app}\GSGProxy\GSGProxy.exe"; \
      WorkingDir: "{app}\GSGProxy"; Components: proxy
Name: "{group}\Avvia GSGDashboard (sito)"; Filename: "{app}\GSGDashboard\GSGDashboard.exe"; \
      WorkingDir: "{app}\GSGDashboard"; Components: dashboard
Name: "{group}\Apri il sito"; Filename: "http://localhost:{#PortaWeb}/"; Components: dashboard

Name: "{group}\Avvia GSGStatistiche"; Filename: "{app}\GSGStatistiche\GSGStatistiche.exe"; \
      WorkingDir: "{app}\GSGStatistiche"; Components: statistiche
Name: "{group}\Apri le statistiche"; Filename: "http://localhost:{#PortaStats}/"; Components: statistiche

Name: "{group}\Configurazione\Configurazione GSGProxy (gsgproxy.json)"; Filename: "notepad.exe"; \
      Parameters: """{app}\GSGProxy\gsgproxy.json"""; Components: proxy
Name: "{group}\Configurazione\Configurazione GSGDashboard (gsgdashboard.json)"; Filename: "notepad.exe"; \
      Parameters: """{app}\GSGDashboard\gsgdashboard.json"""; Components: dashboard
Name: "{group}\Configurazione\Configurazione GSGStatistiche (gsgstatistiche.json)"; Filename: "notepad.exe"; \
      Parameters: """{app}\GSGStatistiche\gsgstatistiche.json"""; Components: statistiche
Name: "{group}\Configurazione\Apri le porte nel firewall"; Filename: "{app}\strumenti\ABILITA_firewall.bat"; \
      WorkingDir: "{app}\strumenti"
Name: "{group}\Configurazione\Cartella di installazione"; Filename: "{app}"

Name: "{group}\Guida all'installazione"; Filename: "notepad.exe"; \
      Parameters: """{app}\docs\INSTALLAZIONE.md"""
Name: "{group}\{cm:UninstallProgram,{#NomeBreve}}"; Filename: "{uninstallexe}"

; --- Desktop (facoltativo) ---
Name: "{autodesktop}\GSG - avvia tutto"; Filename: "{app}\strumenti\AVVIA_TUTTO.bat"; \
      WorkingDir: "{app}\strumenti"; IconFilename: "{app}\gsg.ico"; \
      Tasks: desktopicon; Check: TuttoInUno
Name: "{autodesktop}\GSGProxy (cassa)"; Filename: "{app}\GSGProxy\GSGProxy.exe"; \
      WorkingDir: "{app}\GSGProxy"; Tasks: desktopicon; Components: proxy; Check: not TuttoInUno
Name: "{autodesktop}\GSGDashboard (sito)"; Filename: "{app}\GSGDashboard\GSGDashboard.exe"; \
      WorkingDir: "{app}\GSGDashboard"; Tasks: desktopicon; Components: dashboard; Check: not TuttoInUno
Name: "{autodesktop}\GSG - sito sagra"; Filename: "http://localhost:{#PortaWeb}/"; \
      Tasks: desktopicon; Components: dashboard
Name: "{autodesktop}\GSGStatistiche"; Filename: "{app}\GSGStatistiche\GSGStatistiche.exe"; \
      WorkingDir: "{app}\GSGStatistiche"; Tasks: desktopicon; Components: statistiche

; --- Esecuzione automatica all'accensione ---
Name: "{commonstartup}\GSGProxy"; Filename: "{app}\GSGProxy\GSGProxy.exe"; \
      WorkingDir: "{app}\GSGProxy"; Tasks: avvioauto; Components: proxy
Name: "{commonstartup}\GSGDashboard"; Filename: "{app}\GSGDashboard\GSGDashboard.exe"; \
      WorkingDir: "{app}\GSGDashboard"; Tasks: avvioauto; Components: dashboard
Name: "{commonstartup}\GSGStatistiche"; Filename: "{app}\GSGStatistiche\GSGStatistiche.exe"; \
      WorkingDir: "{app}\GSGStatistiche"; Tasks: avvioauto; Components: statistiche

; ---------------------------------------------------------------------------
;  Firewall e avvio finale
; ---------------------------------------------------------------------------
[Run]
; Le regole vengono prima rimosse e poi riaggiunte, per non duplicarle a ogni
; reinstallazione.
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""GSGProxy {#PortaProxy}"""; \
      Flags: runhidden; Tasks: firewall; Components: proxy
Filename: "{sys}\netsh.exe"; \
      Parameters: "advfirewall firewall add rule name=""GSGProxy {#PortaProxy}"" dir=in action=allow protocol=TCP localport={#PortaProxy} profile=any"; \
      StatusMsg: "Apro la porta {#PortaProxy} nel firewall..."; Flags: runhidden; Tasks: firewall; Components: proxy

Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""GSGDashboard {#PortaWeb}"""; \
      Flags: runhidden; Tasks: firewall; Components: dashboard
Filename: "{sys}\netsh.exe"; \
      Parameters: "advfirewall firewall add rule name=""GSGDashboard {#PortaWeb}"" dir=in action=allow protocol=TCP localport={#PortaWeb} profile=any"; \
      StatusMsg: "Apro la porta {#PortaWeb} nel firewall..."; Flags: runhidden; Tasks: firewall; Components: dashboard

Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""GSGStatistiche {#PortaStats}"""; \
      Flags: runhidden; Tasks: firewall; Components: statistiche
Filename: "{sys}\netsh.exe"; \
      Parameters: "advfirewall firewall add rule name=""GSGStatistiche {#PortaStats}"" dir=in action=allow protocol=TCP localport={#PortaStats} profile=any"; \
      StatusMsg: "Apro la porta {#PortaStats} nel firewall..."; Flags: runhidden; Tasks: firewall; Components: statistiche

; Avvio a fine installazione.
Filename: "{app}\strumenti\AVVIA_TUTTO.bat"; WorkingDir: "{app}\strumenti"; \
      Description: "Avvia GSG adesso e apri il sito nel browser"; \
      Flags: postinstall shellexec skipifsilent nowait; Check: TuttoInUno
Filename: "{app}\GSGProxy\GSGProxy.exe"; WorkingDir: "{app}\GSGProxy"; \
      Description: "Avvia GSGProxy adesso"; \
      Flags: postinstall skipifsilent nowait; Components: proxy; Check: not TuttoInUno
Filename: "{app}\GSGDashboard\GSGDashboard.exe"; WorkingDir: "{app}\GSGDashboard"; \
      Description: "Avvia GSGDashboard adesso"; \
      Flags: postinstall skipifsilent nowait; Components: dashboard; Check: not TuttoInUno
Filename: "{app}\GSGStatistiche\GSGStatistiche.exe"; WorkingDir: "{app}\GSGStatistiche"; \
      Description: "Avvia GSGStatistiche adesso"; \
      Flags: postinstall skipifsilent nowait; Components: statistiche; Check: not TuttoInUno
Filename: "notepad.exe"; Parameters: """{app}\docs\INSTALLAZIONE.md"""; \
      Description: "Apri la guida all'installazione"; \
      Flags: postinstall skipifsilent nowait unchecked

[UninstallRun]
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""GSGProxy {#PortaProxy}"""; \
      Flags: runhidden; RunOnceId: "GsgFwProxy"
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""GSGDashboard {#PortaWeb}"""; \
      Flags: runhidden; RunOnceId: "GsgFwWeb"
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""GSGStatistiche {#PortaStats}"""; \
      Flags: runhidden; RunOnceId: "GsgFwStats"

[UninstallDelete]
; La configurazione (gsgproxy.json / gsgdashboard.json / gsgstatistiche.json)
; NON viene cancellata: contiene i dati del database (e, per le statistiche,
; la password gia' impostata) e va conservata. Vengono tolte solo le cartelle
; se restano vuote.
Type: dirifempty; Name: "{app}\GSGProxy"
Type: dirifempty; Name: "{app}\GSGDashboard"
Type: dirifempty; Name: "{app}\GSGStatistiche"
Type: dirifempty; Name: "{app}"

; ===========================================================================
;  Configurazione guidata
; ===========================================================================
[Code]

const
  NET48_RELEASE   = 528040;
  URL_NET48       = 'https://dotnet.microsoft.com/download/dotnet-framework/net48';
  TIPO_SQLITE     = 0;
  TIPO_POSTGRES   = 1;
  TIPO_DOPO       = 2;
  N_CASSE         = 4;

var
  PagTipoDb:   TInputOptionWizardPage;
  PagSqlite:   TInputFileWizardPage;
  PagPostgres: TInputQueryWizardPage;
  PagCasse:    TInputQueryWizardPage;
  CfgProxyEsiste, CfgWebEsiste, CfgStatsEsiste: Boolean;

{ ---------- funzioni di comodo, usate anche dalle sezioni qui sopra ------- }

function TuttoInUno: Boolean;
begin
  Result := IsComponentSelected('proxy') and IsComponentSelected('dashboard');
end;

{ ---------- requisito: .NET Framework 4.8 -------------------------------- }

function DotNet48Presente: Boolean;
var
  Release: Cardinal;
  Chiave: String;
begin
  Chiave := 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full';
  Release := 0;
  if IsWin64 then
  begin
    if not RegQueryDWordValue(HKEY_LOCAL_MACHINE_64, Chiave, 'Release', Release) then
      RegQueryDWordValue(HKEY_LOCAL_MACHINE_32, Chiave, 'Release', Release);
  end
  else
    RegQueryDWordValue(HKEY_LOCAL_MACHINE, Chiave, 'Release', Release);

  Result := Release >= NET48_RELEASE;
end;

function InitializeSetup(): Boolean;
var
  Risposta: Integer;
  Dummy: Integer;
begin
  Result := True;
  if DotNet48Presente then
    Exit;

  { SuppressibleMsgBox e non MsgBox: cosi' una installazione silenziosa
    (/VERYSILENT /SUPPRESSMSGBOXES) non resta bloccata su una finestra. }
  Risposta := SuppressibleMsgBox(
    'Su questo PC non risulta installato .NET Framework 4.8.' + #13#10#13#10 +
    'Senza di lui i programmi GSG si aprono e si chiudono subito.' + #13#10 +
    'E'' gia'' presente su Windows 10 (dalla versione 1903) e su Windows 11;' + #13#10 +
    'su Windows 7 SP1 e 8.1 va installato una volta sola.' + #13#10#13#10 +
    'Vuoi aprire adesso la pagina Microsoft per scaricarlo?' + #13#10 +
    'Rispondendo NO l''installazione prosegue lo stesso.',
    mbConfirmation, MB_YESNO, IDNO);

  if Risposta = IDYES then
  begin
    ShellExec('open', URL_NET48, '', '', SW_SHOWNORMAL, ewNoWait, Dummy);
    Result := False;   { l'utente installa .NET e poi rilancia il setup }
  end;
end;

{ ---------- pagine della configurazione guidata --------------------------- }

procedure InitializeWizard();
var
  i: Integer;
begin
  PagTipoDb := CreateInputOptionPage(wpSelectTasks,
    'Il database del gestionale',
    'Dove GSGProxy deve andare a leggere gli ordini.',
    'Sono gli stessi dati che Gestione Stand Gastronomico usa per se'' stesso.' + #13#10 +
    'Il database viene aperto in sola lettura.',
    True, False);
  PagTipoDb.Add('SQLite - un file .db su questo PC (il caso piu'' comune)');
  PagTipoDb.Add('PostgreSQL - database in rete, condiviso fra piu'' casse');
  PagTipoDb.Add('Non adesso: compilo gsgproxy.json a mano piu'' tardi');
  PagTipoDb.SelectedValueIndex := TIPO_SQLITE;

  PagSqlite := CreateInputFilePage(PagTipoDb.ID,
    'Il file del database',
    'Indica il file .db del gestionale.',
    'Di solito si chiama database.db e sta nella cartella del gestionale.' + #13#10 +
    'Se non lo trovi adesso, puoi correggere il percorso piu'' tardi in gsgproxy.json.');
  PagSqlite.Add('File del database:',
    'Database SQLite|*.db;*.sqlite;*.sqlite3|Tutti i file|*.*', '.db');
  PagSqlite.Values[0] := ExpandConstant('{sd}\sagra\database.db');

  PagPostgres := CreateInputQueryPage(PagSqlite.ID,
    'Il database PostgreSQL',
    'I dati di collegamento al database condiviso.',
    'Sono gli stessi valori che il gestionale ha nella propria riga' + #13#10 +
    'database_url = postgresql://utente:password@indirizzo:5432/database');
  PagPostgres.Add('Indirizzo del server (host):', False);
  PagPostgres.Add('Porta:', False);
  PagPostgres.Add('Nome del database:', False);
  PagPostgres.Add('Utente:', False);
  PagPostgres.Add('Password:', True);
  PagPostgres.Values[0] := '127.0.0.1';
  PagPostgres.Values[1] := '5432';
  PagPostgres.Values[2] := 'sagra';
  PagPostgres.Values[3] := 'sagra';
  PagPostgres.Values[4] := '';

  PagCasse := CreateInputQueryPage(PagPostgres.ID,
    'Le casse da interrogare',
    'Gli indirizzi dei PC di cassa su cui gira GSGProxy.',
    'Uno per riga, nella forma http://indirizzo-ip:{#PortaProxy}' + #13#10 +
    'Valgono sia per GSGDashboard sia per GSGStatistiche, se installato:' + #13#10 +
    'i due siti tengono un elenco proprio ma partono con lo stesso.' + #13#10 +
    'Lascia vuote le righe che non servono: si possono aggiungere anche dopo,' + #13#10 +
    'dal pulsante Server della dashboard.');
  for i := 1 to N_CASSE do
    PagCasse.Add('Cassa ' + IntToStr(i) + ':', False);
  PagCasse.Values[0] := 'http://127.0.0.1:{#PortaProxy}';
end;

procedure AggiornaEsistenzaConfig;
begin
  CfgProxyEsiste := FileExists(ExpandConstant('{app}\GSGProxy\gsgproxy.json'));
  CfgWebEsiste   := FileExists(ExpandConstant('{app}\GSGDashboard\gsgdashboard.json'));
  CfgStatsEsiste := FileExists(ExpandConstant('{app}\GSGStatistiche\gsgstatistiche.json'));
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;
  if (PageID = PagTipoDb.ID) or (PageID = PagSqlite.ID) or
     (PageID = PagPostgres.ID) or (PageID = PagCasse.ID) then
    AggiornaEsistenzaConfig;

  { Se la configurazione c'e' gia' (aggiornamento) non la tocchiamo. }
  if (PageID = PagTipoDb.ID) then
    Result := (not IsComponentSelected('proxy')) or CfgProxyEsiste
  else if (PageID = PagSqlite.ID) then
    Result := (not IsComponentSelected('proxy')) or CfgProxyEsiste or
              (PagTipoDb.SelectedValueIndex <> TIPO_SQLITE)
  else if (PageID = PagPostgres.ID) then
    Result := (not IsComponentSelected('proxy')) or CfgProxyEsiste or
              (PagTipoDb.SelectedValueIndex <> TIPO_POSTGRES)
  else if (PageID = PagCasse.ID) then
    { La pagina serve a due file di configurazione: si salta solo se nessuno
      dei due componenti che la usano ne ha ancora bisogno. }
    Result := ((not IsComponentSelected('dashboard')) or CfgWebEsiste) and
              ((not IsComponentSelected('statistiche')) or CfgStatsEsiste);
end;

function NextButtonClick(PageID: Integer): Boolean;
var
  i, Porta, Riempite: Integer;
  V: String;
begin
  Result := True;

  { In installazione silenziosa non c'e' nessuno che possa rispondere:
    si prendono i valori predefiniti e si va avanti. }
  if WizardSilent then
    Exit;

  if PageID = PagSqlite.ID then
  begin
    V := Trim(PagSqlite.Values[0]);
    if V = '' then
    begin
      MsgBox('Indica il file del database, oppure torna indietro e scegli' + #13#10 +
             '"Non adesso" per configurarlo a mano piu'' tardi.', mbError, MB_OK);
      Result := False;
    end
    else if not FileExists(V) then
      Result := MsgBox('Il file' + #13#10#13#10 + V + #13#10#13#10 +
                       'non esiste ancora. Vado avanti lo stesso?' + #13#10 +
                       '(il percorso si corregge poi in gsgproxy.json)',
                       mbConfirmation, MB_YESNO) = IDYES;
  end

  else if PageID = PagPostgres.ID then
  begin
    if Trim(PagPostgres.Values[0]) = '' then
    begin
      MsgBox('Manca l''indirizzo del server PostgreSQL.', mbError, MB_OK); Result := False; Exit;
    end;
    Porta := StrToIntDef(Trim(PagPostgres.Values[1]), -1);
    if (Porta < 1) or (Porta > 65535) then
    begin
      MsgBox('La porta deve essere un numero (di solito 5432).', mbError, MB_OK); Result := False; Exit;
    end;
    if Trim(PagPostgres.Values[2]) = '' then
    begin
      MsgBox('Manca il nome del database.', mbError, MB_OK); Result := False; Exit;
    end;
    if Trim(PagPostgres.Values[3]) = '' then
    begin
      MsgBox('Manca il nome utente.', mbError, MB_OK); Result := False; Exit;
    end;
  end

  else if PageID = PagCasse.ID then
  begin
    Riempite := 0;
    for i := 0 to N_CASSE - 1 do
    begin
      V := Trim(PagCasse.Values[i]);
      if V <> '' then
      begin
        Riempite := Riempite + 1;
        if (Pos('http://', LowerCase(V)) <> 1) and (Pos('https://', LowerCase(V)) <> 1) then
        begin
          MsgBox('L''indirizzo della cassa ' + IntToStr(i + 1) + ' deve iniziare con http://' + #13#10#13#10 +
                 'Esempio:  http://192.168.1.50:{#PortaProxy}', mbError, MB_OK);
          Result := False;
          Exit;
        end;
      end;
    end;
    if Riempite = 0 then
      Result := MsgBox('Non hai indicato nessuna cassa: il sito partira'' senza dati.' + #13#10#13#10 +
                       'Gli indirizzi si possono aggiungere anche dopo, dal pulsante' + #13#10 +
                       'Server della dashboard. Vado avanti?', mbConfirmation, MB_YESNO) = IDYES;
  end;
end;

{ ---------- riepilogo nella pagina "Pronto per l'installazione" ----------- }

function UpdateReadyMemo(Space, NewLine, MemoUserInfoInfo, MemoDirInfo, MemoTypeInfo,
  MemoComponentsInfo, MemoGroupInfo, MemoTasksInfo: String): String;
var
  S: String;
  i: Integer;
begin
  S := MemoDirInfo + NewLine + NewLine + MemoTypeInfo + NewLine + NewLine +
       MemoComponentsInfo + NewLine + NewLine + MemoGroupInfo + NewLine + NewLine +
       MemoTasksInfo + NewLine + NewLine;

  AggiornaEsistenzaConfig;

  if IsComponentSelected('proxy') then
  begin
    S := S + 'Database:' + NewLine;
    if CfgProxyEsiste then
      S := S + Space + 'configurazione gia'' presente: la lascio com''e''' + NewLine
    else if PagTipoDb.SelectedValueIndex = TIPO_SQLITE then
      S := S + Space + 'SQLite - ' + Trim(PagSqlite.Values[0]) + NewLine
    else if PagTipoDb.SelectedValueIndex = TIPO_POSTGRES then
      S := S + Space + 'PostgreSQL - ' + Trim(PagPostgres.Values[2]) + ' su ' +
               Trim(PagPostgres.Values[0]) + ':' + Trim(PagPostgres.Values[1]) + NewLine
    else
      S := S + Space + 'da configurare a mano in gsgproxy.json' + NewLine;
    S := S + NewLine;
  end;

  if IsComponentSelected('dashboard') then
  begin
    S := S + 'Casse collegate al sito:' + NewLine;
    if CfgWebEsiste then
      S := S + Space + 'configurazione gia'' presente: la lascio com''e''' + NewLine
    else
      for i := 0 to N_CASSE - 1 do
        if Trim(PagCasse.Values[i]) <> '' then
          S := S + Space + 'Cassa ' + IntToStr(i + 1) + ' - ' + Trim(PagCasse.Values[i]) + NewLine;
    S := S + NewLine;
  end;

  if IsComponentSelected('statistiche') then
  begin
    S := S + 'GSGStatistiche:' + NewLine;
    if CfgStatsEsiste then
      S := S + Space + 'configurazione gia'' presente: la lascio com''e''' + NewLine
    else
      S := S + Space + 'stesse casse di GSGDashboard qui sopra; la password si sceglie' + NewLine +
               Space + 'al primo accesso da http://localhost:{#PortaStats}/' + NewLine;
  end;

  Result := S;
end;

{ ---------- scrittura dei file di configurazione -------------------------- }

function TestoJson(S: String): String;
begin
  { in JSON la barra rovescia va raddoppiata e le virgolette vanno protette }
  StringChangeEx(S, '\', '\\', True);
  StringChangeEx(S, '"', '\"', True);
  Result := S;
end;

procedure ScriviConfigProxy;
var
  S, Provider, PercorsoDb, PgHost, PgPorta, PgDb, PgUtente, PgPassword: String;
begin
  if PagTipoDb.SelectedValueIndex = TIPO_DOPO then
  begin
    { nessuna scelta fatta: lasciamo all'utente il file di esempio }
    FileCopy(ExpandConstant('{app}\GSGProxy\gsgproxy.example.json'),
             ExpandConstant('{app}\GSGProxy\gsgproxy.json'), True);
    Exit;
  end;

  if PagTipoDb.SelectedValueIndex = TIPO_POSTGRES then
    Provider := 'postgres'
  else
    Provider := 'sqlite';

  PercorsoDb := Trim(PagSqlite.Values[0]);
  if PercorsoDb = '' then
    PercorsoDb := ExpandConstant('{sd}\sagra\database.db');

  PgHost     := Trim(PagPostgres.Values[0]);
  PgPorta    := Trim(PagPostgres.Values[1]);
  PgDb       := Trim(PagPostgres.Values[2]);
  PgUtente   := Trim(PagPostgres.Values[3]);
  PgPassword := PagPostgres.Values[4];

  S :=
    '{' + #13#10 +
    '  "_commento": "Scritto dal programma di installazione di GSG. Si puo'' modificare col Blocco note: dopo la modifica va riavviato GSGProxy.exe. Spiegazioni in docs\\INSTALLAZIONE.md e nel file gsgproxy.example.json.",' + #13#10 +
    '' + #13#10 +
    '  "listen": {' + #13#10 +
    '    "host": "0.0.0.0",' + #13#10 +
    '    "port": {#PortaProxy}' + #13#10 +
    '  },' + #13#10 +
    '' + #13#10 +
    '  "database": {' + #13#10 +
    '    "provider": "' + Provider + '",' + #13#10 +
    '' + #13#10 +
    '    "sqlite": {' + #13#10 +
    '      "path": "' + TestoJson(PercorsoDb) + '",' + #13#10 +
    '      "readOnly": true,' + #13#10 +
    '      "busyTimeoutMs": 3000' + #13#10 +
    '    },' + #13#10 +
    '' + #13#10 +
    '    "postgres": {' + #13#10 +
    '      "host": "' + TestoJson(PgHost) + '",' + #13#10 +
    '      "port": ' + PgPorta + ',' + #13#10 +
    '      "database": "' + TestoJson(PgDb) + '",' + #13#10 +
    '      "username": "' + TestoJson(PgUtente) + '",' + #13#10 +
    '      "password": "' + TestoJson(PgPassword) + '",' + #13#10 +
    '      "schema": "public",' + #13#10 +
    '      "timeoutSeconds": 15,' + #13#10 +
    '      "connectionString": ""' + #13#10 +
    '    }' + #13#10 +
    '  },' + #13#10 +
    '' + #13#10 +
    '  "api": {' + #13#10 +
    '    "defaultLimit": 500,' + #13#10 +
    '    "maxLimit": 5000,' + #13#10 +
    '    "corsOrigin": "*"' + #13#10 +
    '  },' + #13#10 +
    '' + #13#10 +
    '  "_avanzamento": "Lettura del codice a barre stampato sull''ordine. Funziona solo con provider postgres; con sqlite resta spento.",' + #13#10 +
    '  "avanzamento": {' + #13#10 +
    '    "abilitato": true,' + #13#10 +
    '    "statoDa": "ordinato",' + #13#10 +
    '    "statoA": "evaso"' + #13#10 +
    '  },' + #13#10 +
    '' + #13#10 +
    '  "log": {' + #13#10 +
    '    "requests": false' + #13#10 +
    '  }' + #13#10 +
    '}' + #13#10;

  if not SaveStringToFile(ExpandConstant('{app}\GSGProxy\gsgproxy.json'), S, False) then
    SuppressibleMsgBox('Non sono riuscito a scrivere gsgproxy.json.' + #13#10 +
           'Copia a mano gsgproxy.example.json in gsgproxy.json e modificalo.',
           mbError, MB_OK, IDOK);
end;

procedure ScriviConfigWeb;
var
  S, Righe, V: String;
  i, Quante: Integer;
begin
  Righe := '';
  Quante := 0;
  for i := 0 to N_CASSE - 1 do
  begin
    V := Trim(PagCasse.Values[i]);
    if V <> '' then
    begin
      if Quante > 0 then
        Righe := Righe + ',' + #13#10;
      Righe := Righe + '    { "label": "Cassa ' + IntToStr(i + 1) + '", "base": "' + TestoJson(V) + '" }';
      Quante := Quante + 1;
    end;
  end;
  if Quante = 0 then
    Righe := '    { "label": "Cassa 1", "base": "" }';

  S :=
    '{' + #13#10 +
    '  "_commento": "Scritto dal programma di installazione di GSG. Le casse si possono cambiare anche dal pulsante Server della dashboard, senza toccare questo file.",' + #13#10 +
    '' + #13#10 +
    '  "listen": {' + #13#10 +
    '    "host": "0.0.0.0",' + #13#10 +
    '    "port": {#PortaWeb}' + #13#10 +
    '  },' + #13#10 +
    '' + #13#10 +
    '  "wwwroot": "wwwroot",' + #13#10 +
    '' + #13#10 +
    '  "casse": [' + #13#10 +
    Righe + #13#10 +
    '  ],' + #13#10 +
    '' + #13#10 +
    '  "aggregate": true,' + #13#10 +
    '  "timeoutMs": 6000,' + #13#10 +
    '' + #13#10 +
    '  "log": {' + #13#10 +
    '    "requests": false' + #13#10 +
    '  }' + #13#10 +
    '}' + #13#10;

  if not SaveStringToFile(ExpandConstant('{app}\GSGDashboard\gsgdashboard.json'), S, False) then
    SuppressibleMsgBox('Non sono riuscito a scrivere gsgdashboard.json.' + #13#10 +
           'Copia a mano gsgdashboard.example.json in gsgdashboard.json e modificalo.',
           mbError, MB_OK, IDOK);
end;

{ Stesso elenco di casse di ScriviConfigWeb: i due siti mostrano gli stessi
  dati, ma tengono un file ciascuno, cosi' si possono spegnere indipendenti.
  Niente password qui: la sceglie chi apre per la prima volta il sito, non
  questo installer. }
procedure ScriviConfigStats;
var
  S, Righe, V: String;
  i, Quante: Integer;
begin
  Righe := '';
  Quante := 0;
  for i := 0 to N_CASSE - 1 do
  begin
    V := Trim(PagCasse.Values[i]);
    if V <> '' then
    begin
      if Quante > 0 then
        Righe := Righe + ',' + #13#10;
      Righe := Righe + '    { "label": "Cassa ' + IntToStr(i + 1) + '", "base": "' + TestoJson(V) + '" }';
      Quante := Quante + 1;
    end;
  end;
  if Quante = 0 then
    Righe := '    { "label": "Cassa 1", "base": "" }';

  S :=
    '{' + #13#10 +
    '  "_commento": "Scritto dal programma di installazione di GSG. La password si imposta dalla pagina, al primo accesso: non va scritta qui.",' + #13#10 +
    '' + #13#10 +
    '  "listen": {' + #13#10 +
    '    "host": "0.0.0.0",' + #13#10 +
    '    "port": {#PortaStats}' + #13#10 +
    '  },' + #13#10 +
    '' + #13#10 +
    '  "wwwroot": "wwwroot",' + #13#10 +
    '' + #13#10 +
    '  "casse": [' + #13#10 +
    Righe + #13#10 +
    '  ],' + #13#10 +
    '' + #13#10 +
    '  "aggregate": true,' + #13#10 +
    '  "timeoutMs": 6000,' + #13#10 +
    '' + #13#10 +
    '  "auth": {' + #13#10 +
    '    "hash": "",' + #13#10 +
    '    "salt": "",' + #13#10 +
    '    "iterazioni": 0' + #13#10 +
    '  },' + #13#10 +
    '' + #13#10 +
    '  "log": {' + #13#10 +
    '    "requests": false' + #13#10 +
    '  }' + #13#10 +
    '}' + #13#10;

  if not SaveStringToFile(ExpandConstant('{app}\GSGStatistiche\gsgstatistiche.json'), S, False) then
    SuppressibleMsgBox('Non sono riuscito a scrivere gsgstatistiche.json.' + #13#10 +
           'Copia a mano gsgstatistiche.example.json in gsgstatistiche.json e modificalo.',
           mbError, MB_OK, IDOK);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  { ssInstall arriva PRIMA della copia dei file: qui sappiamo ancora se una
    configurazione precedente c'era davvero. }
  if CurStep = ssInstall then
    AggiornaEsistenzaConfig;

  if CurStep = ssPostInstall then
  begin
    if IsComponentSelected('proxy') and (not CfgProxyEsiste) then
      ScriviConfigProxy;
    if IsComponentSelected('dashboard') and (not CfgWebEsiste) then
      ScriviConfigWeb;
    if IsComponentSelected('statistiche') and (not CfgStatsEsiste) then
      ScriviConfigStats;
  end;
end;
