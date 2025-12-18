# Add DNS Records for xpandorax.com
# This script adds the necessary DNS records using the Cloudflare API

param(
    [ValidateSet("Test", "Apply")]
    [string]$Mode = "Test"
)

# Configuration
$TOKEN = "5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL"
$DOMAIN = "xpandorax.com"
$ZONE_ID = "7a80fd2ecf89fe08f0dc6b9ddf1ce2cc"
$API_BASE = "https://api.cloudflare.com/client/v4"

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# DNS Records to add
$dnsRecords = @(
    @{
        type = "CNAME"
        name = "cdn"
        content = "xpandorax-com.s3.us-east-005.backblazeb2.com"
        ttl = 1
        proxied = $true
        comment = "CDN for static assets"
    }
    @{
        type = "MX"
        name = "@"
        content = "mail.protonmail.swiss"
        ttl = 3600
        priority = 10
        proxied = $false
        comment = "ProtonMail MX record"
    }
    @{
        type = "TXT"
        name = "_acme-challenge"
        content = ""
        ttl = 3600
        proxied = $false
        comment = "ACME challenge for SSL renewal (placeholder)"
    }
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        Cloudflare DNS Records Manager                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Domain: $DOMAIN" -ForegroundColor Yellow
Write-Host "Zone ID: $ZONE_ID" -ForegroundColor Yellow
Write-Host "Mode: $Mode" -ForegroundColor Yellow
Write-Host ""

# First, let's check existing DNS records
Write-Host "Fetching existing DNS records..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/zones/$ZONE_ID/dns/records" `
        -Headers $headers `
        -Method Get
    
    if ($response.success) {
        Write-Host "✓ Current DNS Records:" -ForegroundColor Green
        $response.result | ForEach-Object {
            Write-Host "  • $($_.type) - $($_.name) -> $($_.content)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "⚠ Error fetching DNS records: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "DNS Records to add:" -ForegroundColor Cyan

# Display what will be added
foreach ($record in $dnsRecords) {
    Write-Host ""
    Write-Host "  Type: $($record.type)" -ForegroundColor White
    Write-Host "  Name: $($record.name)" -ForegroundColor White
    Write-Host "  Content: $($record.content)" -ForegroundColor White
    if ($record.priority) {
        Write-Host "  Priority: $($record.priority)" -ForegroundColor White
    }
    Write-Host "  TTL: $($record.ttl)" -ForegroundColor White
    Write-Host "  Proxied: $($record.proxied)" -ForegroundColor White
    Write-Host "  Comment: $($record.comment)" -ForegroundColor Gray
}

Write-Host ""

if ($Mode -eq "Test") {
    Write-Host "This is TEST mode. Run with -Mode Apply to actually add records." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Add each DNS record
Write-Host "Adding DNS records..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failureCount = 0

foreach ($record in $dnsRecords) {
    $body = @{
        type = $record.type
        name = $record.name
        content = $record.content
        ttl = $record.ttl
        proxied = $record.proxied
    } | ConvertTo-Json
    
    try {
        Write-Host "Adding $($record.type) record: $($record.name)..." -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri "$API_BASE/zones/$ZONE_ID/dns/records" `
            -Headers $headers `
            -Method Post `
            -Body $body
        
        if ($response.success) {
            Write-Host "  ✓ Added successfully (ID: $($response.result.id))" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ✗ Error: $($response.errors[0].message)" -ForegroundColor Red
            $failureCount++
        }
    } catch {
        Write-Host "  ✗ Exception: $($_.Exception.Message)" -ForegroundColor Red
        $failureCount++
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ Results" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║ Added: $successCount" -ForegroundColor Green
Write-Host "║ Failed: $failureCount" -ForegroundColor $(if ($failureCount -gt 0) { "Red" } else { "Green" })
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
