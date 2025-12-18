#!/usr/bin/env pwsh
$TOKEN = "5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL"
$ZONE_ID = "7a80fd2ecf89fe08f0dc6b9ddf1ce2cc"
$DOMAIN = "xpandorax.com"

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "Adding DNS records for $DOMAIN..." -ForegroundColor Cyan
Write-Host ""

# Test API connection
Write-Host "Testing API connection..." -ForegroundColor Yellow
try {
    $test = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID" `
        -Headers $headers `
        -Method Get
    Write-Host "Connection OK" -ForegroundColor Green
}
catch {
    Write-Host "Connection failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Add CNAME record
Write-Host "1. Adding CNAME record (cdn)..." -ForegroundColor Cyan
$cnameBody = @{
    type = "CNAME"
    name = "cdn"
    content = "xpandorax-com.s3.us-east-005.backblazeb2.com"
    ttl = 1
    proxied = $true
} | ConvertTo-Json

try {
    $cnameResp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns/records" `
        -Headers $headers `
        -Method Post `
        -Body $cnameBody
    Write-Host "   ADDED: $($cnameResp.result.id)" -ForegroundColor Green
}
catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Add MX record
Write-Host "2. Adding MX record (mail.protonmail.swiss)..." -ForegroundColor Cyan
$mxBody = @{
    type = "MX"
    name = "@"
    content = "mail.protonmail.swiss"
    ttl = 3600
    priority = 10
    proxied = $false
} | ConvertTo-Json

try {
    $mxResp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns/records" `
        -Headers $headers `
        -Method Post `
        -Body $mxBody
    Write-Host "   ADDED: $($mxResp.result.id)" -ForegroundColor Green
}
catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Complete!" -ForegroundColor Green
