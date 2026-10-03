$TaskName = 'HALO HOLA Auto Sync'
$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($task) {
  Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Host 'HALO HOLA Auto Sync removed from Windows startup.' -ForegroundColor Green
} else {
  Write-Host 'HALO HOLA Auto Sync task is not installed.'
}
