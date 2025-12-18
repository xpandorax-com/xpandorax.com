param(
    [ValidateSet("Test", "Apply")]
    [string]$Mode = "Test"
)

$TOKEN = "5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL"
$DOMAIN = "xpandorax.com"
$ZONE_ID = "7a80fd2ecf89fe08f0dc6b9ddf1ce2cc"
$API_BASE = "https://api.cloudflare.com/client/v4"

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$dnsRecords = @(
    @{
        type = "CNAME"
        name = "cdn"
        content = "xpandorax-com.s3.us-east-005.backblazeb2.com"
        ttl = 1
        proxied = $true
        comment = "CDN for static assets"
    },
    @{
        type = "MX"
        name = "@"
        content = "mail.protonmail.swiss"
        ttl = 3600
        priority = 10
        proxied = $false
        comment = "ProtonMail MX record"
    }
)

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        Cloudflare DNS Records Manager                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "Domain: $DOMAIN" -ForegroundColor Yellow
Write-Host "Zone ID: $ZONE_ID" -ForegroundColor Yellow
Write-Host "Mode: $Mode`n" -ForegroundColor Yellow

Write-Host "Fetching existing DNS records..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/zones/$ZONE_ID/dns/records" `
        -Headers $headers `
        -Method Get
    
    if ($response.success) {
        Write-Host "Current DNS Records:`n" -ForegroundColor Green
        $response.result | ForEach-Object {
            Write-Host "  • $($_.type) - $($_.name) -> $($_.content)" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "Error fetching DNS records: $($_.Exception.Message)`n" -ForegroundColor Yellow
}

Write-Host "DNS Records to add:`n" -ForegroundColor Cyan

foreach ($record in $dnsRecords) {
    Write-Host "  Type: $($record.type)" -ForegroundColor White
    Write-Host "  Name: $($record.name)" -ForegroundColor White
    Write-Host "  Content: $($record.content)" -ForegroundColor White
    if ($record.priority) {
        Write-Host "  Priority: $($record.priority)" -ForegroundColor White
    }
    Write-Host "  TTL: $($record.ttl)" -ForegroundColor White
    Write-Host "  Proxied: $($record.proxied)" -ForegroundColor White
    Write-Host ""
}

if ($Mode -eq "Test") {
    Write-Host "TEST mode - no changes made. Run with -Mode Apply to add these records." -ForegroundColor Yellow
    exit 0
}

Write-Host "Adding DNS records...`n" -ForegroundColor Cyan

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
    
    Write-Host "Adding $($record.type) record: $($record.name)..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/zones/$ZONE_ID/dns/records" `
            -Headers $headers `
            -Method Post `
            -Body $body
        
        if ($response.success) {
            Write-Host "  OK - ID: $($response.result.id)" -ForegroundColor Green
            $successCount++
        }
        else {
            Write-Host "  ERROR: $($response.errors[0].message)" -ForegroundColor Red
            $failureCount++
        }
    }
    catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $failureCount++
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ Results" -ForegroundColor Cyan
Write-Host "║ Added: $successCount" -ForegroundColor Green
Write-Host "║ Failed: $failureCount" -ForegroundColor $(if ($failureCount -gt 0) { "Red" } else { "Green" })
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
