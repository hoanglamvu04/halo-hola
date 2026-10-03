$TaskName = 'HALO HOLA Auto Sync'
$StartupDir = [Environment]::GetFolderPath('Startup')
$StartupFile = Join-Path $StartupDir 'HALO-HOLA-Auto-Sync.cmd'

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($task) {
  Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
}

if (Test-Path $StartupFile) {
  Remove-Item $StartupFile -Force -ErrorAction SilentlyContinue
}

Write-Host 'HALO HOLA Auto Sync removed from Windows startup.' -ForegroundColor Green