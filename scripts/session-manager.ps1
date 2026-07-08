param(
  [string]$Action = "menu"
)

$ErrorActionPreference = "Continue"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$RuntimeDir = Join-Path $ProjectRoot "runtime"
$LockFile = Join-Path $RuntimeDir "bot.lock"
$AuthDir = Join-Path $ProjectRoot "auth"

function Write-Title {
  Clear-Host
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor DarkCyan
  Write-Host "              GERENCIADOR DO BOT WHATSAPP" -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor DarkCyan
  Write-Host ("Projeto: " + $ProjectRoot) -ForegroundColor DarkGray
  Write-Host ""
}

function Write-Info($Text) { Write-Host $Text -ForegroundColor Cyan }
function Write-Ok($Text) { Write-Host $Text -ForegroundColor Green }
function Write-Warn($Text) { Write-Host $Text -ForegroundColor Yellow }
function Write-Bad($Text) { Write-Host $Text -ForegroundColor Red }

function Pause-Menu {
  Write-Host ""
  Read-Host "Pressione ENTER para continuar"
}

function Get-LockPid {
  if (-not (Test-Path -LiteralPath $LockFile)) { return $null }

  try {
    $data = Get-Content -Raw -LiteralPath $LockFile | ConvertFrom-Json
    if ($data.pid) { return [int]$data.pid }
  } catch {
    return $null
  }

  return $null
}

function Get-BotProcesses {
  $found = @()

  try {
    $found = @(
      Get-CimInstance Win32_Process -ErrorAction Stop |
        Where-Object {
          $_.Name -match '^node(\.exe)?$' -and
          $_.CommandLine -like '*src/index.js*' -and
          $_.CommandLine -like ('*' + $ProjectRoot + '*')
        } |
        ForEach-Object {
          [pscustomobject]@{
            ProcessId = [int]$_.ProcessId
            Source = "CommandLine"
            CommandLine = $_.CommandLine
          }
        }
    )
  } catch {
    Write-Warn "[WARN] O Windows bloqueou a busca detalhada por CommandLine. Usando lock como fallback."
  }

  $lockPid = Get-LockPid
  if ($lockPid -and -not ($found | Where-Object { $_.ProcessId -eq $lockPid })) {
    $process = Get-Process -Id $lockPid -ErrorAction SilentlyContinue
    if ($process) {
      $found += [pscustomobject]@{
        ProcessId = $lockPid
        Source = "runtime/bot.lock"
        CommandLine = "(processo encontrado pelo lock)"
      }
    }
  }

  return @($found | Sort-Object ProcessId -Unique)
}

function Show-Status {
  Write-Title
  Write-Info "[SCAN] Procurando sessoes ativas do bot..."

  $procs = Get-BotProcesses
  if (-not $procs -or $procs.Count -eq 0) {
    Write-Ok "[OK] Nenhum processo ativo encontrado."
  } else {
    Write-Warn ("[ATIVO] " + $procs.Count + " processo(s) encontrado(s):")
    foreach ($proc in $procs) {
      Write-Host ""
      Write-Host ("PID: " + $proc.ProcessId) -ForegroundColor Yellow
      Write-Host ("Origem: " + $proc.Source) -ForegroundColor Cyan
      Write-Host ("Linha: " + $proc.CommandLine) -ForegroundColor DarkGray
    }
  }

  Write-Host ""
  if (Test-Path -LiteralPath $LockFile) {
    Write-Warn "[LOCK] runtime/bot.lock existe."
    try {
      Get-Content -Raw -LiteralPath $LockFile | Write-Host -ForegroundColor DarkGray
    } catch {}
  } else {
    Write-Ok "[LOCK] Nenhum lock ativo."
  }

  if (Test-Path -LiteralPath $AuthDir) {
    $count = @(Get-ChildItem -LiteralPath $AuthDir -Force -ErrorAction SilentlyContinue).Count
    Write-Ok ("[ACESSO] Auth atual existe com " + $count + " arquivo(s)/pasta(s).")
  } else {
    Write-Warn "[ACESSO] Nao existe auth salvo. O proximo start deve gerar QR Code."
  }
}

function Stop-BotProcesses {
  param([switch]$Quiet)

  if (-not $Quiet) { Write-Title }
  Write-Info "[SCAN] Procurando processos para encerrar..."

  $procs = Get-BotProcesses
  if (-not $procs -or $procs.Count -eq 0) {
    Write-Ok "[OK] Nenhum processo ativo do bot foi encontrado."
  } else {
    foreach ($proc in $procs) {
      Write-Warn ("[KILL] Encerrando PID " + $proc.ProcessId + "...")
      try {
        Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
        Start-Sleep -Milliseconds 300
        Write-Ok ("[OK] PID " + $proc.ProcessId + " encerrado.")
      } catch {
        Write-Bad ("[ERRO] Nao foi possivel encerrar PID " + $proc.ProcessId + ": " + $_.Exception.Message)
      }
    }
  }

  if (Test-Path -LiteralPath $LockFile) {
    Write-Info "[CLEAN] Removendo runtime/bot.lock..."
    Remove-Item -LiteralPath $LockFile -Force -ErrorAction SilentlyContinue
  }

  Write-Ok "[DONE] Limpeza de processos concluida."
}

function Manage-Sessions {
  while ($true) {
    Write-Title
    $procs = Get-BotProcesses

    if (-not $procs -or $procs.Count -eq 0) {
      Write-Ok "[OK] Nenhuma sessao ativa para gerenciar."
      Pause-Menu
      return
    }

    Write-Host "Sessoes ativas:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $procs.Count; $i++) {
      Write-Host ("[" + ($i + 1) + "] PID " + $procs[$i].ProcessId + " - " + $procs[$i].Source) -ForegroundColor Yellow
    }
    Write-Host "[A] Encerrar todas" -ForegroundColor Red
    Write-Host "[0] Voltar" -ForegroundColor DarkGray
    Write-Host ""

    $choice = Read-Host "Escolha uma sessao para encerrar"
    if ($choice -eq "0") { return }
    if ($choice -match '^[Aa]$') {
      Stop-BotProcesses
      Pause-Menu
      return
    }
    if ($choice -match '^\d+$') {
      $index = [int]$choice - 1
      if ($index -ge 0 -and $index -lt $procs.Count) {
        $pid = $procs[$index].ProcessId
        Write-Warn ("Encerrando PID " + $pid + "...")
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        if ((Get-LockPid) -eq $pid -and (Test-Path -LiteralPath $LockFile)) {
          Remove-Item -LiteralPath $LockFile -Force -ErrorAction SilentlyContinue
        }
        Write-Ok "[OK] Operacao concluida."
        Pause-Menu
      }
    }
  }
}

function Clear-SessionsOnly {
  Write-Title
  Write-Warn "Isto encerra processos ativos e remove runtime/bot.lock."
  Write-Warn "Nao apaga auth, QR Code, dados do painel ou historico."
  Write-Host ""
  $confirm = Read-Host "Digite LIMPAR para confirmar"
  if ($confirm -ne "LIMPAR") {
    Write-Warn "[CANCELADO] Nada foi alterado."
    Pause-Menu
    return
  }

  Stop-BotProcesses -Quiet
  Pause-Menu
}

function Clear-CurrentAccess {
  Write-Title
  Write-Bad "ATENCAO: isto apaga a pasta auth."
  Write-Bad "O WhatsApp sera desconectado deste bot e sera necessario escanear QR Code novamente."
  Write-Host ""
  $confirm = Read-Host "Digite APAGAR ACESSO para confirmar"
  if ($confirm -ne "APAGAR ACESSO") {
    Write-Warn "[CANCELADO] Auth mantido."
    Pause-Menu
    return $false
  }

  Stop-BotProcesses -Quiet

  if (Test-Path -LiteralPath $AuthDir) {
    Write-Info "[CLEAN] Removendo pasta auth..."
    Remove-Item -LiteralPath $AuthDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Ok "[OK] Acesso atual apagado."
  } else {
    Write-Warn "[INFO] Pasta auth ja nao existe."
  }

  return $true
}

function Start-Bot {
  Write-Title
  Write-Info "[START] Iniciando o bot..."
  Write-Info "[INFO] Se nao houver acesso salvo, um QR Code sera gerado."
  Write-Host ""
  Push-Location $ProjectRoot
  try {
    npm start
  } finally {
    Pop-Location
  }
}

function Generate-NewAccess {
  $cleared = Clear-CurrentAccess
  if ($cleared) {
    Write-Host ""
    Write-Info "[QR] Iniciando bot para gerar novo acesso..."
    Start-Sleep -Seconds 1
    Start-Bot
  }
}

function Show-Menu {
  while ($true) {
    Write-Title
    Write-Host "[1] Procurar sessoes ativas" -ForegroundColor Cyan
    Write-Host "[2] Gerenciar sessoes ativas" -ForegroundColor Cyan
    Write-Host "[3] Apagar sessoes ativas/locks" -ForegroundColor Yellow
    Write-Host "[4] Apagar acesso atual (auth)" -ForegroundColor Red
    Write-Host "[5] Gerar novo acesso (apaga auth e abre QR)" -ForegroundColor Magenta
    Write-Host "[6] Ligar bot" -ForegroundColor Green
    Write-Host "[0] Sair" -ForegroundColor DarkGray
    Write-Host ""

    $choice = Read-Host "Escolha uma opcao"
    switch ($choice) {
      "1" { Show-Status; Pause-Menu }
      "2" { Manage-Sessions }
      "3" { Clear-SessionsOnly }
      "4" { [void](Clear-CurrentAccess); Pause-Menu }
      "5" { Generate-NewAccess; return }
      "6" { Start-Bot; return }
      "0" { return }
      default { Write-Warn "Opcao invalida."; Start-Sleep -Milliseconds 700 }
    }
  }
}

switch ($Action.ToLowerInvariant()) {
  "scan" { Show-Status }
  "stop" { Stop-BotProcesses -Quiet }
  "clear-sessions" { Clear-SessionsOnly }
  "clear-auth" { [void](Clear-CurrentAccess) }
  "new-access" { Generate-NewAccess }
  "start" { Start-Bot }
  default { Show-Menu }
}
