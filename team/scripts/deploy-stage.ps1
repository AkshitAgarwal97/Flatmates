#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Flatmates Staging Deployment Script — Used by Deployment_1.
    Validates environment, builds Docker images, and starts all services
    for the staging/local environment.
.USAGE
    .\team\scripts\deploy-stage.ps1
    .\team\scripts\deploy-stage.ps1 -SkipBuild   # Skip Docker rebuild (faster)
    .\team\scripts\deploy-stage.ps1 -Production   # Full production deploy checklist
#>
param(
    [switch]$SkipBuild,
    [switch]$Production
)

$ErrorActionPreference = "Stop"
$rootDir = Resolve-Path "$PSScriptRoot\..\.."

function Write-Step($step, $msg) {
    Write-Host ""
    Write-Host "[$step] $msg" -ForegroundColor Cyan
}

function Write-OK($msg)   { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "  ❌ $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
if ($Production) {
    Write-Host " 🔴 FLATMATES PRODUCTION DEPLOYMENT" -ForegroundColor Red
    Write-Host "    ⚠️  This deploys to LIVE users!" -ForegroundColor Yellow
} else {
    Write-Host " 🟡 FLATMATES STAGING DEPLOYMENT" -ForegroundColor Yellow
}
Write-Host "    Date: $(Get-Date -Format 'dd MMM yyyy HH:mm')"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

# ── 1. Pre-flight checks ──────────────────────────────────────
Write-Step "1" "Pre-Flight Checks"

# Check Docker is running
try {
    $null = docker info 2>&1
    Write-OK "Docker is running"
} catch {
    Write-Fail "Docker is not running. Start Docker Desktop first."
    exit 1
}

# Check .env file exists
$envFile = "$rootDir\.env"
if (Test-Path $envFile) {
    Write-OK ".env file found"
} else {
    Write-Fail ".env file not found at project root. Create it from DEPLOYMENT_1.md guide."
    exit 1
}

# Check required env vars
$envContent = Get-Content $envFile -Raw
$requiredVars = @("MONGO_URI", "JWT_SECRET")
foreach ($var in $requiredVars) {
    if ($envContent -match "$var=.+") {
        Write-OK "$var is set"
    } else {
        Write-Fail "$var is missing from .env"
        exit 1
    }
}

# ── 2. Production Gate (extra checks) ────────────────────────
if ($Production) {
    Write-Step "2" "Production Gate Checks"
    Write-Warn "Production deployment requires sign-offs:"
    Write-Host ""
    Write-Host "  Have the following been completed?" -ForegroundColor White
    Write-Host "  1. Tester_1 sign-off (check team/TEST_REPORT_*.md)" -ForegroundColor Gray
    Write-Host "  2. SCO_1 audit passed (check team/SEO_AUDIT_*.md)" -ForegroundColor Gray
    Write-Host "  3. CEO/Architect approval given" -ForegroundColor Gray
    Write-Host ""
    $confirm = Read-Host "  Type 'DEPLOY' to confirm all sign-offs are complete"
    if ($confirm -ne "DEPLOY") {
        Write-Host ""
        Write-Fail "Production deployment cancelled."
        exit 1
    }
    Write-OK "Production gate cleared"
}

# ── 3. TypeScript build ───────────────────────────────────────
Write-Step "3" "Building Backend TypeScript"
Push-Location "$rootDir\backend"
try {
    npm run build
    Write-OK "Backend TypeScript compiled successfully"
} catch {
    Write-Fail "Backend build failed. Fix TypeScript errors before deploying."
    Pop-Location
    exit 1
}
Pop-Location

# ── 4. Docker build & start ───────────────────────────────────
Write-Step "4" "Docker Services"
Push-Location $rootDir

if (-not $SkipBuild) {
    Write-Host "  🔧 Stopping existing containers..." -ForegroundColor Gray
    docker-compose down 2>&1 | Out-Null

    Write-Host "  🔧 Building images (this may take a few minutes)..." -ForegroundColor Gray
    docker-compose build --no-cache

    Write-OK "Docker images built"
}

Write-Host "  🚀 Starting containers..." -ForegroundColor Gray
docker-compose up -d

# Wait for containers to start
Start-Sleep -Seconds 5

Pop-Location

# ── 5. Health Check ──────────────────────────────────────────
Write-Step "5" "Health Checks"

# Check containers are running
$containers = docker ps --format "{{.Names}}"
$expectedContainers = @("flatmates-backend", "flatmates-frontend", "flatmates-gateway")
foreach ($c in $expectedContainers) {
    if ($containers -match $c) {
        Write-OK "Container '$c' is running"
    } else {
        Write-Warn "Container '$c' not found — may use a different name"
    }
}

# Check backend API health
Write-Host "  🌐 Checking API health..." -ForegroundColor Gray
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/properties" `
        -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-OK "Backend API responding at http://localhost:5000"
    }
} catch {
    Write-Warn "Backend API health check failed. Check: docker logs flatmates-backend"
}

# ── 6. Summary ───────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor White
if ($Production) {
    Write-Host " 🚀 PRODUCTION DEPLOYMENT COMPLETE" -ForegroundColor Green
    Write-Host "    URL: https://flatmates.co.in"
} else {
    Write-Host " 🟢 STAGING DEPLOYMENT COMPLETE" -ForegroundColor Green
    Write-Host "    Frontend: http://localhost:3000"
    Write-Host "    Backend:  http://localhost:5000"
    Write-Host "    API:      http://localhost:5000/api"
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:"
Write-Host "  1. Notify Tester_1 to begin smoke test session"
Write-Host "  2. Notify SCO_1 to verify SEO elements on staging"
Write-Host "  3. Monitor logs: docker logs -f flatmates-backend"
Write-Host ""
