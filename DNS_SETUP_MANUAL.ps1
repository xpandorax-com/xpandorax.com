# Manual DNS Setup Guide for xpandorax.com
# Since API automation requires authentication, please follow these steps manually

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Manual DNS Record Setup for xpandorax.com             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "You have a CNAME record pending in Cloudflare Dashboard:`n" -ForegroundColor Yellow
Write-Host "  Type: CNAME" -ForegroundColor White
Write-Host "  Name: (root)" -ForegroundColor White
Write-Host "  Content: xpandorax-com.pages.dev" -ForegroundColor White
Write-Host "  TTL: Auto" -ForegroundColor White
Write-Host ""

Write-Host "Click 'Activate domain' in your Cloudflare dashboard to confirm this CNAME record." -ForegroundColor Green
Write-Host ""

Write-Host "Additional DNS Records to Add (if not auto-added):`n" -ForegroundColor Cyan

Write-Host "Option 1: CDN CNAME (for static assets on Backblaze B2)" -ForegroundColor White
Write-Host "  Type: CNAME" -ForegroundColor Gray
Write-Host "  Name: cdn" -ForegroundColor Gray
Write-Host "  Content: xpandorax-com.s3.us-east-005.backblazeb2.com" -ForegroundColor Gray
Write-Host "  TTL: 1 (Auto)" -ForegroundColor Gray
Write-Host "  Proxied: Yes" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Mail Records (if using ProtonMail)" -ForegroundColor White
Write-Host "  Type: MX" -ForegroundColor Gray
Write-Host "  Name: (root)" -ForegroundColor Gray
Write-Host "  Content: mail.protonmail.swiss" -ForegroundColor Gray
Write-Host "  Priority: 10" -ForegroundColor Gray
Write-Host "  TTL: 3600" -ForegroundColor Gray
Write-Host ""

Write-Host "Steps to Add Records Manually:" -ForegroundColor Cyan
Write-Host "1. Go to: https://dash.cloudflare.com/" -ForegroundColor White
Write-Host "2. Select xpandorax.com domain" -ForegroundColor White
Write-Host "3. Go to DNS tab" -ForegroundColor White
Write-Host "4. Click 'Add record'" -ForegroundColor White
Write-Host "5. Fill in Type, Name, Content, TTL" -ForegroundColor White
Write-Host "6. Click 'Save'" -ForegroundColor White
Write-Host ""

Write-Host "Need API Access?" -ForegroundColor Yellow
Write-Host "1. Get a valid API token from https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor White
Write-Host "2. Create a token with 'Edit Zone DNS' permissions" -ForegroundColor White
Write-Host "3. Update add-dns.ps1 with the new token" -ForegroundColor White
Write-Host "4. Run the script again" -ForegroundColor White
Write-Host ""
