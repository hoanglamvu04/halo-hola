$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Watcher = Join-Path $Root 'scripts\auto-dev.ps1'
$TaskName = 'HALO HOLA Auto Sync'
$StartupDir = [Environment]::GetFolderPath('Startup')
$StartupFile = Join-Path $StartupDir 'HALO-HOLA-Auto-Sync.cmd'

if (-not (Test-Path $Watcher)) {
  throw "Watcher not found: $Watcher"
}

function Start-AutoSyncNow {
  $args = '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $Watcher + '"'
  Start-Process powershell.exe -ArgumentList $args -WorkingDirectory $Root -WindowStyle Hidden
}

function Install-StartupFallback {
  $cmd = '@echo off' + [Environment]::NewLine +
         'cd /d "' + $Root + '"' + [Environment]::NewLine +
         'start "" powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $Watcher + '"'
  Set-Content -Path $StartupFile -Value $cmd -Encoding ASCII
  Write-Host ''
  Write-Host 'Installed via Windows Startup folder (no Administrator required).' -ForegroundColor Green
  Write-Host "Startup file: $StartupFile"
}

$installedByTask = $false

try {
  $psArgs = '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $Watcher + '"'
  $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $psArgs -WorkingDirectory $Root
  $trigger = New-ScheduledTaskTrigger -AtLogOn
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description 'Automatically pulls HALO HOLA main, installs changed dependencies, applies DB schema and keeps dev server running.' -Force | Out-Null
  Start-ScheduledTask -TaskName $TaskName
  $installedByTask = $true

  if (Test-Path $StartupFile) {
    Remove-Item $StartupFile -Force -ErrorAction SilentlyContinue
  }

  Write-Host ''
  Write-Host 'HALO HOLA Auto Sync installed as Windows Scheduled Task.' -ForegroundColor Green
} catch {
  Write-Host ''
  Write-Host 'Scheduled Task needs higher Windows permission. Falling back automatically...' -ForegroundColor Yellow
  Install-StartupFallback
  Start-AutoSyncNow
}

Write-Host ''
Write-Host 'HALO HOLA Auto Sync is ready.' -ForegroundColor Green
Write-Host 'It will pull origin/main, install changed packages, run db:migrate and restart the app automatically.'
Write-Host ('Log: ' + (Join-Path $Root 'auto-sync.log'))
Write-Host ('Server log: ' + (Join-Path $Root 'dev-server.log'))

if (-not $installedByTask) {
  Write-Host 'Mode: Startup folder fallback (works without Administrator).'
}