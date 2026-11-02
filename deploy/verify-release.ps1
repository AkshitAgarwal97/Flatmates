# Local production boot (Windows uses next start; Oracle Linux uses standalone).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path "node_modules")) { npm ci }
if ($env:SKIP_BUILD -ne "1") { npm run build }

$data = Join-Path $root "deploy\secrets\verify-data"
New-Item -ItemType Directory -Force -Path (Join-Path $data "images") | Out-Null
$env:NODE_ENV = "production"
$env:FLATMATES_DATA_DIR = $data
$env:JWT_SECRET = "verify-jwt-secret-please-change"
$env:CRON_SECRET = "verify-cron-secret"
$env:PORT = "3010"

$nextCmd = Join-Path $root "node_modules\.bin\next.cmd"
$p = Start-Process -FilePath $nextCmd -ArgumentList @("start", "-H", "127.0.0.1", "-p", "3010") -WorkingDirectory $root -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 6
try {
  $page = Invoke-WebRequest -Uri "http://127.0.0.1:3010/" -UseBasicParsing -TimeoutSec 30
  if ($page.StatusCode -ne 200) { throw "home $($page.StatusCode)" }

  $jpeg = [byte[]](0xFF, 0xD8, 0xFF, 0xE0) + ([byte[]]::new(64))
  $jpeg[-2] = 0xFF
  $jpeg[-1] = 0xD9
  [IO.File]::WriteAllBytes((Join-Path $data "images\verifyimg.jpg"), $jpeg)
  $img = Invoke-WebRequest -Uri "http://127.0.0.1:3010/api/media/verifyimg" -UseBasicParsing -TimeoutSec 20
  if ($img.StatusCode -ne 200) { throw "media $($img.StatusCode)" }
  if ($img.Headers["Content-Type"] -notmatch "image/jpeg") { throw "bad content-type" }

  Write-Host "local production health: $($page.StatusCode); disk photo: $($img.StatusCode)"
} finally {
  cmd /c "taskkill /T /F /PID $($p.Id)" | Out-Null
}
