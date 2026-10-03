param(
  [int]$IntervalSeconds = 20
)

$ErrorActionPreference = 'Continue'
$Root = Split-Path -Parent $PSScriptRoot
$LogFile = Join-Path $Root 'auto-sync.log'
$DevLog = Join-Path $Root 'dev-server.log'
$PidFile = Join-Path $Root '.halo-auto-sync.pid'
$script:DevProcess = $null

function Write-Log([string]$Message) {
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
  Write-Host $line
  Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

function Test-Command([string]$Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Invoke-Cmd([string]$Command) {
  & cmd.exe /d /s /c $Command
  return $LASTEXITCODE
}

function Stop-DevServer {
  if ($script:DevProcess -and -not $script:DevProcess.HasExited) {
    Write-Log "Stopping dev server process tree (PID $($script:DevProcess.Id))..."
    & taskkill.exe /PID $script:DevProcess.Id /T /F *> $null
    Start-Sleep -Milliseconds 600
  }
  $script:DevProcess = $null
}

function Start-DevServer {
  Write-Log 'Starting HALO HOLA frontend + backend...'
  Add-Content -Path $DevLog -Value ([Environment]::NewLine + "===== START " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + " =====") -Encoding UTF8
  $command = 'npm run dev >> "' + $DevLog + '" 2>&1'
  $script:DevProcess = Start-Process -FilePath 'cmd.exe' -ArgumentList '/d','/s','/c',$command -WorkingDirectory $Root -WindowStyle Hidden -PassThru
  Write-Log "Dev server started (PID $($script:DevProcess.Id)). Logs: $DevLog"
}

function Ensure-Dependencies {
  $missing = @(
    (Join-Path $Root 'node_modules'),
    (Join-Path $Root 'frontend\node_modules'),
    (Join-Path $Root 'backend\node_modules')
  ) | Where-Object { -not (Test-Path $_) }

  if ($missing.Count -gt 0) {
    Write-Log 'Dependencies missing. Installing automatically...'
    Invoke-Cmd 'npm install' | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Log 'WARNING: root npm install failed.' }
    Invoke-Cmd 'npm run install:all' | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Log 'WARNING: npm run install:all failed.' }
  }
}

function Apply-DatabaseSchema {
  Write-Log 'Applying database schema (safe/idempotent)...'
  Invoke-Cmd 'npm run db:migrate' | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Log 'WARNING: db:migrate failed. App will still start; check PostgreSQL/backend .env.'
  }
}

function Ensure-MainBranch {
  $branch = (& git rev-parse --abbrev-ref HEAD 2>$null).Trim()
  if ($branch -eq 'main') { return $true }

  $dirty = (& git status --porcelain 2>$null)
  if ($dirty) {
    Write-Log "Local changes detected on branch '$branch'. Auto-switch/pull paused to protect your work."
    return $false
  }

  Write-Log "Switching dedicated machine to main branch (current: $branch)..."
  & git switch main
  if ($LASTEXITCODE -ne 0) {
    Write-Log 'WARNING: cannot switch to main.'
    return $false
  }
  return $true
}

function Sync-Latest {
  if (-not (Ensure-MainBranch)) { return $false }

  & git fetch origin main --prune *> $null
  if ($LASTEXITCODE -ne 0) {
    Write-Log 'Git fetch failed (network/auth). Will retry automatically.'
    return $false
  }

  $local = (& git rev-parse HEAD).Trim()
  $remote = (& git rev-parse origin/main).Trim()
  if (-not $local -or -not $remote -or $local -eq $remote) {
    return $false
  }

  $dirty = (& git status --porcelain)
  if ($dirty) {
    Write-Log 'New Git version found, but local files have uncommitted changes. Pull paused to avoid overwriting them.'
    return $false
  }

  Write-Log "New version found: $($local.Substring(0,7)) -> $($remote.Substring(0,7)). Updating automatically..."
  Stop-DevServer

  $before = $local
  & git pull --ff-only origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Log 'WARNING: git pull failed. Keeping current files and retrying later.'
    Start-DevServer
    return $false
  }

  $changed = @(& git diff --name-only $before HEAD)
  $dependencyChanged = $changed | Where-Object { $_ -match '(^|/)(package|package-lock)\.json$' }

  if ($dependencyChanged) {
    Write-Log 'Package files changed. Installing dependencies automatically...'
    Invoke-Cmd 'npm install' | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Log 'WARNING: root npm install failed.' }
    Invoke-Cmd 'npm run install:all' | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Log 'WARNING: install:all failed.' }
  }

  Apply-DatabaseSchema
  Start-DevServer
  Write-Log 'Update complete. HALO HOLA is now running the latest main branch.'
  return $true
}

if (-not (Test-Command 'git')) {
  Write-Host 'Git is not installed or not in PATH.'
  exit 1
}
if (-not (Test-Command 'npm')) {
  Write-Host 'Node/npm is not installed or not in PATH.'
  exit 1
}

Set-Location $Root

if (Test-Path $PidFile) {
  $existingPid = 0
  [void][int]::TryParse((Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1), [ref]$existingPid)
  if ($existingPid -gt 0 -and (Get-Process -Id $existingPid -ErrorAction SilentlyContinue)) {
    Write-Host "HALO HOLA Auto Sync is already running (PID $existingPid)."
    exit 0
  }
}
Set-Content -Path $PidFile -Value $PID -Encoding ASCII

try {
  Write-Log "HALO HOLA Auto Sync started. Checking Git every $IntervalSeconds seconds."
  Write-Log 'Rule: main is auto-updated only when the local working tree is clean.'

  [void](Sync-Latest)
  Ensure-Dependencies
  Apply-DatabaseSchema

  if (-not $script:DevProcess -or $script:DevProcess.HasExited) {
    Start-DevServer
  }

  while ($true) {
    Start-Sleep -Seconds $IntervalSeconds

    try {
      [void](Sync-Latest)

      if (-not $script:DevProcess -or $script:DevProcess.HasExited) {
        Write-Log 'Dev server stopped unexpectedly. Restarting automatically...'
        Start-DevServer
      }
    } catch {
      Write-Log "Watcher error: $($_.Exception.Message). Retrying automatically."
    }
  }
}
finally {
  Stop-DevServer
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  Write-Log 'HALO HOLA Auto Sync stopped.'
}
