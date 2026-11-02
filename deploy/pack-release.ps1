# Pack source for the Oracle VM (the ARM box runs `npm run build` itself).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$out = Join-Path $root "deploy\secrets\src.tgz"
if (Test-Path $out) { Remove-Item $out -Force }

tar -czf $out `
  --exclude=node_modules `
  --exclude=.next `
  --exclude=data `
  --exclude=recordings `
  --exclude=deploy/secrets `
  --exclude=.git `
  --exclude=playwright-report `
  --exclude=test-results `
  --exclude=coverage `
  --exclude=auth.json `
  --exclude=cookies.txt `
  .

if (-not (Test-Path $out)) { throw "Failed to write $out" }
Write-Host "Source archive: $out"
