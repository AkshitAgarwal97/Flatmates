# Deploy to AWS Script
# Usage: .\deploy_to_aws.ps1

$ErrorActionPreference = "Stop"

# --- Configuration ---
$ServerIP = "3.111.39.210"
$KeyPath = ".\flatmates-key.pem"
$RemoteDir = "~/flatmates-v2"
$PackageName = "deploy_update.tar.gz"

Write-Host "🚀 Starting Deployment to $ServerIP..." -ForegroundColor Cyan

# 1. Build Frontend
Write-Host "`n📦 Building Frontend..." -ForegroundColor Yellow
Push-Location frontend
try {
    npm run build
}
catch {
    Write-Error "Frontend build failed!"
}
Pop-Location

# 2. Package Files
Write-Host "`n👜 Packaging Application..." -ForegroundColor Yellow
if (Test-Path ".\pkg_temp") { Remove-Item -Recurse -Force ".\pkg_temp" }
New-Item -ItemType Directory -Force -Path ".\pkg_temp" | Out-Null

# Copy Sources (Excluding node_modules)
Write-Host "   Copying Backend..."
robocopy backend pkg_temp\backend /E /XD node_modules /NFL /NDL /NJH /NJS
Write-Host "   Copying Frontend Build..."
robocopy frontend\build pkg_temp\frontend\build /E /NFL /NDL /NJH /NJS
Write-Host "   Copying Nginx Gateway..."
robocopy nginx-gateway pkg_temp\nginx-gateway /E /NFL /NDL /NJH /NJS

# Copy Configs
Copy-Item frontend\nginx.conf pkg_temp\frontend\
Copy-Item frontend\Dockerfile pkg_temp\frontend\
Copy-Item .env pkg_temp\

# IMPORTANT: Using the simplified docker-compose that works on AWS
Write-Host "   Using production docker-compose config..."
Copy-Item docker-compose.simple.yml pkg_temp\docker-compose.yml

# Compress
Write-Host "   Compressing..."
Push-Location pkg_temp
tar -czf ..\$PackageName .
Pop-Location

# Cleanup Temp
Remove-Item -Recurse -Force ".\pkg_temp"

# 3. Upload
Write-Host "`n📤 Uploading to Server..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no -i $KeyPath $PackageName ubuntu@${ServerIP}:${RemoteDir}/

# 4. Remote Restart
Write-Host "`n🔄 Restarting Remote Services..." -ForegroundColor Yellow
$RemoteScript = "cd $RemoteDir; tar -xzf $PackageName; sudo docker-compose down --remove-orphans; sudo docker-compose up -d --build --remove-orphans; rm $PackageName"

ssh -o StrictHostKeyChecking=no -i $KeyPath ubuntu@${ServerIP} $RemoteScript

# Cleanup Local
Remove-Item -Force $PackageName

Write-Host "Deployment Finished! Site is live at https://flatmates.co.in" -ForegroundColor Green
