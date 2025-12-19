# Deploy to AWS Script
# Usage: .\deploy_to_aws.ps1

$ErrorActionPreference = "Stop"

# --- Configuration ---
$ServerIP = "3.111.39.210"
$KeyPath = ".\flatmates-key.pem"
$RemoteDir = "~/flatmates-v2"
$PackageName = "deploy_update.tar.gz"

Write-Host "Starting Deployment to $ServerIP..."

# Check for SSH Key
if (-not (Test-Path $KeyPath)) {
    Write-Error "SSH Key not found at $KeyPath!"
}

# 1. Build Frontend
Write-Host "Building Frontend..."
Push-Location frontend
try {
    npm run build
}
finally {
    Pop-Location
}

# 2. Package Files
Write-Host "Packaging Application..."
if (Test-Path ".\pkg_temp") { Remove-Item -Recurse -Force ".\pkg_temp" }
New-Item -ItemType Directory -Force -Path ".\pkg_temp" | Out-Null

# Copy Sources (Excluding node_modules)
Write-Host "   Copying Backend..."
# Use simple robocopy and handle exit code manually
robocopy backend pkg_temp/backend /E /XD node_modules /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { throw "Robocopy backend failed" }

Write-Host "   Copying Frontend Build..."
robocopy frontend/build pkg_temp/frontend/build /E /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { throw "Robocopy frontend failed" }

Write-Host "   Copying Nginx Gateway..."
robocopy nginx-gateway pkg_temp/nginx-gateway /E /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { throw "Robocopy nginx failed" }

# Copy Configs
Copy-Item frontend/nginx.conf pkg_temp/frontend/
Copy-Item frontend/Dockerfile pkg_temp/frontend/
Copy-Item .env pkg_temp/

# IMPORTANT: Using the simplified docker-compose that works on AWS
Write-Host "   Using production docker-compose config..."
Copy-Item docker-compose.simple.yml pkg_temp/docker-compose.yml

# Compress
Write-Host "   Compressing..."
Push-Location pkg_temp
try {
    tar -czf ../$PackageName .
}
finally {
    Pop-Location
}

# Cleanup Temp
Remove-Item -Recurse -Force ".\pkg_temp"

# 3. Upload
Write-Host "Uploading to Server..."
scp -o StrictHostKeyChecking=no -i $KeyPath $PackageName ubuntu@${ServerIP}:${RemoteDir}/

# 4. Remote Restart
Write-Host "Restarting Remote Services..."
$cmd1 = "cd $RemoteDir"
$cmd2 = "tar -xzf $PackageName"
$cmd3 = "sudo docker-compose down --remove-orphans"
$cmd4 = "sudo docker-compose up -d --build --remove-orphans"
$cmd5 = "rm $PackageName"
$RemoteScript = "$cmd1; $cmd2; $cmd3; $cmd4; $cmd5"

ssh -o StrictHostKeyChecking=no -i $KeyPath ubuntu@${ServerIP} $RemoteScript

# Cleanup Local
if (Test-Path $PackageName) {
    Remove-Item -Force $PackageName
}

Write-Host "Deployment Finished! Site is live at https://flatmates.co.in"
