# Cloudflare Manual cURL Commands

Use these commands directly in PowerShell/Terminal if the helper scripts don't work.

## Prerequisites

- Replace `YOUR_TOKEN` with your Cloudflare API token
- Replace `YOUR_ZONE_ID` with your Cloudflare Zone ID (32-character hex string)
- Domain: `xpandorax.com`
- B2 endpoint: `xpandorax-com.s3.us-east-005.backblazeb2.com`

---

## Step 1: Get Your Zone ID

Run this first to get your Zone ID:

```powershell
$token = "YOUR_TOKEN_HERE"
$domain = "xpandorax.com"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$response = Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones?name=$domain" `
    -Headers $headers -UseBasicParsing | ConvertFrom-Json

$zoneId = $response.result[0].id
Write-Host "Zone ID: $zoneId"
Write-Host "Save this value, you'll need it for other commands"
```

Or use Git Bash / WSL:
```bash
TOKEN="YOUR_TOKEN_HERE"
DOMAIN="xpandorax.com"

curl -s "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.result[0]'
```

---

## Step 2: Get Zone Info

Verify your zone is correctly configured:

```powershell
$token = "YOUR_TOKEN_HERE"
$zoneId = "YOUR_ZONE_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId" `
    -Headers $headers -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

---

## Step 3: Add CNAME Record

Create CNAME for `cdn.xpandorax.com` pointing to B2:

```powershell
$token = "YOUR_TOKEN_HERE"
$zoneId = "YOUR_ZONE_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    type = "CNAME"
    name = "cdn"
    content = "xpandorax-com.s3.us-east-005.backblazeb2.com"
    ttl = 1
    proxied = $true
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns/records" `
    -Headers $headers `
    -Body $body `
    -Method Post `
    -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

Or with cURL:
```bash
TOKEN="YOUR_TOKEN_HERE"
ZONE_ID="YOUR_ZONE_ID_HERE"

curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns/records" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "cdn",
    "content": "xpandorax-com.s3.us-east-005.backblazeb2.com",
    "ttl": 1,
    "proxied": true
  }'
```

---

## Step 4: List DNS Records

Check all your DNS records:

```powershell
$token = "YOUR_TOKEN_HERE"
$zoneId = "YOUR_ZONE_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns/records" `
    -Headers $headers -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

---

## Step 5: Create Cache Rule

Cache images and videos for 1 year:

```powershell
$token = "YOUR_TOKEN_HERE"
$zoneId = "YOUR_ZONE_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    expression = '(http.request.uri.path starts_with "/pictures/") or (http.request.uri.path starts_with "/videos/")'
    action = "set_cache_settings"
    action_parameters = @{
        cache = $true
        cache_level = "cache_everything"
        edge_ttl = 31536000
        browser_ttl = 31536000
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/cache/rules" `
    -Headers $headers `
    -Body $body `
    -Method Post `
    -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

Or with cURL:
```bash
TOKEN="YOUR_TOKEN_HERE"
ZONE_ID="YOUR_ZONE_ID_HERE"

curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache/rules" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expression": "(http.request.uri.path starts_with \"/pictures/\") or (http.request.uri.path starts_with \"/videos/\")",
    "action": "set_cache_settings",
    "action_parameters": {
      "cache": true,
      "cache_level": "cache_everything",
      "edge_ttl": 31536000,
      "browser_ttl": 31536000
    }
  }'
```

---

## Step 6: List Cache Rules

View all cache rules:

```powershell
$token = "YOUR_TOKEN_HERE"
$zoneId = "YOUR_ZONE_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/cache/rules" `
    -Headers $headers -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

---

## Step 7: Purge Cache

Clear all cached content:

```powershell
$token = "YOUR_TOKEN_HERE"
$zoneId = "YOUR_ZONE_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    purge_everything = $true
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/purge_cache" `
    -Headers $headers `
    -Body $body `
    -Method Post `
    -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

Or with cURL:
```bash
TOKEN="YOUR_TOKEN_HERE"
ZONE_ID="YOUR_ZONE_ID_HERE"

curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything": true}'
```

---

## Troubleshooting

### Error: "Invalid request headers"
- Verify token is correct (copy from https://dash.cloudflare.com/profile/api-tokens)
- Token may need to be recreated
- Ensure "Bearer " is before the token in Authorization header

### Error: "Unauthorized"
- Token may not have required permissions
- Go to https://dash.cloudflare.com/profile/api-tokens
- Click the token edit button
- Ensure it has: `Zone:DNS:Edit` and `Zone:Cache Rules:Edit`

### Error: "Forbidden"
- Token scope may not include xpandorax.com
- Edit the token
- Change scope from "All Zones" to specific zone "xpandorax.com"

### Error: "Not Found"
- Zone ID may be incorrect
- Double-check with Step 1 command

---

## PowerShell Tips

To save time, create a `.ps1` script:

```powershell
# save-to-file.ps1
$token = "YOUR_TOKEN_HERE"
$zoneId = "YOUR_ZONE_ID_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Now you can reuse $headers in commands below
```

Then source it:
```powershell
. .\save-to-file.ps1
```

And run commands:
```powershell
Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns/records" `
    -Headers $headers -UseBasicParsing
```

---

## Useful Utilities

### Pretty-print JSON in PowerShell:
```powershell
$response = ... # your curl/invoke-webrequest result
$response | ConvertTo-Json -Depth 10
```

### Extract single value with jq (Git Bash/WSL):
```bash
curl -s "..." | jq '.result[0].id'  # Get Zone ID
curl -s "..." | jq '.result | length'  # Count results
curl -s "..." | jq '.result[] | {name, content}'  # Select fields
```

### Test DNS propagation:
```powershell
# PowerShell
Resolve-DnsName cdn.xpandorax.com

# Or Command Prompt
nslookup cdn.xpandorax.com
```

---

## Complete Workflow

Save this as a PowerShell script and run once:

```powershell
# Fill in YOUR VALUES
$token = "YOUR_TOKEN_HERE"
$domain = "xpandorax.com"
$b2Endpoint = "xpandorax-com.s3.us-east-005.backblazeb2.com"

# Get Zone ID
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "1. Getting Zone ID..." -ForegroundColor Cyan
$zoneResponse = Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones?name=$domain" `
    -Headers $headers -UseBasicParsing | ConvertFrom-Json
$zoneId = $zoneResponse.result[0].id
Write-Host "✓ Zone ID: $zoneId" -ForegroundColor Green

# Add CNAME
Write-Host "`n2. Adding CNAME record..." -ForegroundColor Cyan
$cnameBody = @{
    type = "CNAME"
    name = "cdn"
    content = $b2Endpoint
    ttl = 1
    proxied = $true
} | ConvertTo-Json

$cnameResponse = Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns/records" `
    -Headers $headers -Body $cnameBody -Method Post -UseBasicParsing | ConvertFrom-Json
Write-Host "✓ CNAME added" -ForegroundColor Green

# Create Cache Rule
Write-Host "`n3. Creating cache rule..." -ForegroundColor Cyan
$ruleBody = @{
    expression = '(http.request.uri.path starts_with "/pictures/") or (http.request.uri.path starts_with "/videos/")'
    action = "set_cache_settings"
    action_parameters = @{
        cache = $true
        cache_level = "cache_everything"
        edge_ttl = 31536000
        browser_ttl = 31536000
    }
} | ConvertTo-Json

$ruleResponse = Invoke-WebRequest -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/cache/rules" `
    -Headers $headers -Body $ruleBody -Method Post -UseBasicParsing | ConvertFrom-Json
Write-Host "✓ Cache rule created" -ForegroundColor Green

Write-Host "`n✓ Setup complete! CNAME and cache rules configured." -ForegroundColor Green
Write-Host "Wait 5-10 minutes for DNS to propagate." -ForegroundColor Yellow
```

---

## API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/zones` | GET | List zones |
| `/zones/{id}` | GET | Get zone info |
| `/zones/{id}/dns/records` | GET | List DNS records |
| `/zones/{id}/dns/records` | POST | Create DNS record |
| `/zones/{id}/dns/records/{record_id}` | PUT | Update DNS record |
| `/zones/{id}/dns/records/{record_id}` | DELETE | Delete DNS record |
| `/zones/{id}/cache/rules` | GET | List cache rules |
| `/zones/{id}/cache/rules` | POST | Create cache rule |
| `/zones/{id}/cache/rules/{rule_id}` | PUT | Update cache rule |
| `/zones/{id}/cache/rules/{rule_id}` | DELETE | Delete cache rule |
| `/zones/{id}/purge_cache` | POST | Purge cache |
| `/zones/{id}/ssl/tls/settings` | GET | Get SSL/TLS settings |

---

## Next Steps

1. **Get Zone ID** with Step 1
2. **Add CNAME** with Step 3
3. **Create Cache Rule** with Step 5
4. **Wait** 5-10 minutes for DNS propagation
5. **Test:** `Resolve-DnsName cdn.xpandorax.com`
6. **Deploy:** `npm run build && wrangler pages deploy ./build/client`

