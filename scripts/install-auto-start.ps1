$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Watcher = Join-Path $Root 'scripts\auto-dev.ps1'
$TaskName = 'HALO HOLA Auto Sync'

if (-not (Test-Path $Watcher)) {
  throw "Watcher not found: $Watcher"
}

$psArgs = '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $Watcher + '"'
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $psArgs -WorkingDirectory $Root
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

try {
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description 'Automatically pulls HALO HOLA main, installs changed dependencies, applies DB schema and keeps dev server running.' -Force | Out-Null
  Start-ScheduledTask -TaskName $TaskName
  Write-Host ''
  Write-Host 'HALO HOLA Auto Sync installed and started.' -ForegroundColor Green
  Write-Host 'From now on Windows login will start it automatically.'
  Write-Host ("Log: " + (Join-Path $Root 'auto-sync.log'))
  Write-Host ("Server log: " + (Join-Path $Root 'dev-server.log'))
} catch {
  Write-Host ''
  Write-Host 'Could not register the Windows task.' -ForegroundColor Red
  Write-Host 'Run PowerShell/VS Code as Administrator once, then run: npm run auto:install'
  throw
}
