# Upload source to the VM, build standalone there, start systemd/nginx.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$instance = Join-Path $root "deploy\secrets\instance.env"
$appEnv = Join-Path $root "deploy\secrets\app.env"
$key = Join-Path $root "deploy\secrets\id_ed25519"
if (-not (Test-Path $instance)) { throw "Run deploy/provision.ps1 first ($instance missing)." }
if (-not (Test-Path $appEnv)) { throw "Missing $appEnv" }

Get-Content $instance | ForEach-Object {
  if ($_ -match "^([^#=]+)=(.*)$") { Set-Item -Path "Env:$($matches[1])" -Value $matches[2] }
}

& (Join-Path $root "deploy\pack-release.ps1")
$tarball = Join-Path $root "deploy\secrets\src.tgz"
$ip = $env:PUBLIC_IP
$user = if ($env:SSH_USER) { $env:SSH_USER } else { "ubuntu" }
$ssh = @("-i", $key, "-o", "StrictHostKeyChecking=accept-new", "${user}@${ip}")

Write-Host "Waiting for SSH on ${ip}..."
$ok = $false
for ($i = 0; $i -lt 36; $i++) {
  ssh @ssh "echo ready" | Out-Null
  if ($LASTEXITCODE -eq 0) { $ok = $true; break }
  Start-Sleep -Seconds 10
}
if (-not $ok) { throw "SSH to $ip failed. Check security list and instance state." }

scp -i $key -o StrictHostKeyChecking=accept-new $tarball "${user}@${ip}:/tmp/src.tgz"
scp -i $key -o StrictHostKeyChecking=accept-new $appEnv "${user}@${ip}:/tmp/flatmates.env"
scp -i $key -o StrictHostKeyChecking=accept-new (Join-Path $root "deploy\bootstrap.sh") "${user}@${ip}:/tmp/bootstrap.sh"

$tls = if ($env:ENABLE_TLS -eq "0") { "0" } else { "1" }
ssh @ssh "sudo ENABLE_TLS=$tls CERTBOT_EMAIL=support@flatmates.co.in bash /tmp/bootstrap.sh"

Write-Host "Health check..."
ssh @ssh "curl -fsS -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/"
Write-Host ""
Write-Host "DNS: A @ and www -> $ip"
Write-Host "Then: ssh -i $key ${user}@${ip} 'sudo certbot --nginx -d www.flatmates.co.in -d flatmates.co.in'"
Write-Host "Reboot test: ssh -i $key ${user}@${ip} 'sudo reboot'"
