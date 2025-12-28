# Phase 1 Security Test Script (PowerShell)
# Tests the security implementation

$BASE_URL = if ($env:BACKEND_URL) { $env:BACKEND_URL } else { "http://localhost:5000/api" }
$TEST_EMAIL = "test@example.com"
$TEST_PASSWORD = "testPassword123"

Write-Host "`n=== Phase 1 Security Tests ===" -ForegroundColor Cyan
Write-Host "Testing: $BASE_URL`n" -ForegroundColor Cyan

# Test 1: Login endpoint structure
Write-Host "=== Testing Login Response Structure ===" -ForegroundColor Yellow
try {
    $body = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.accessToken) {
            Write-Host "✅ accessToken returned" -ForegroundColor Green
        } else {
            Write-Host "❌ accessToken missing" -ForegroundColor Red
        }
        
        if ($data.user) {
            Write-Host "✅ user object returned" -ForegroundColor Green
            if ($data.user.password) {
                Write-Host "❌ CRITICAL: password in user object!" -ForegroundColor Red
            } else {
                Write-Host "✅ password NOT in user object" -ForegroundColor Green
            }
        }
        
        # Check for password in response
        if ($response.Content -match $TEST_PASSWORD) {
            Write-Host "❌ CRITICAL: password found in response!" -ForegroundColor Red
        } else {
            Write-Host "✅ password NOT in response" -ForegroundColor Green
        }
        
        # Check cookies
        $cookies = $response.Headers['Set-Cookie']
        if ($cookies) {
            Write-Host "✅ Cookies set" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  Login returned status: $($response.StatusCode)" -ForegroundColor Yellow
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Login test failed (user may not exist): $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Create test user first: POST $BASE_URL/auth/register" -ForegroundColor Gray
}

# Test 2: Rate Limiting
Write-Host "`n=== Testing Rate Limiting ===" -ForegroundColor Yellow
Write-Host "Sending 6 rapid requests..." -ForegroundColor Gray
$rateLimited = $false
for ($i = 1; $i -le 6; $i++) {
    try {
        $body = @{
            email = "wrong@example.com"
            password = "wrongpassword"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$BASE_URL/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 429) {
            $rateLimited = $true
            Write-Host "✅ Rate limiting triggered (429)" -ForegroundColor Green
            break
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            $rateLimited = $true
            Write-Host "✅ Rate limiting triggered (429)" -ForegroundColor Green
            break
        }
    }
    Start-Sleep -Milliseconds 100
}

if (-not $rateLimited) {
    Write-Host "⚠️  Rate limiting may not be active (no 429 responses)" -ForegroundColor Yellow
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Review output above for security checks" -ForegroundColor Gray
Write-Host "✅ = Pass | ❌ = Fail | ⚠️  = Warning" -ForegroundColor Gray

