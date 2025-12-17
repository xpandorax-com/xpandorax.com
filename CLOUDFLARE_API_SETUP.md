# Cloudflare API Connection - Fresh Setup Guide

## 🚀 Step 1: Generate a New API Token

Your current token appears to be invalid. Let's create a fresh one:

### How to Generate a Valid Cloudflare API Token

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com/
   - Log in with your account

2. **Navigate to API Tokens:**
   - Go to: **Profile** (top right corner) → **API Tokens**
   - Or directly: https://dash.cloudflare.com/profile/api-tokens

3. **Create a New Token:**
   - Click **"Create Token"**
   - Select **"Edit zone DNS"** (or scroll to find a template)
   - Or choose **"Create Custom Token"** with these permissions:
     
     **Permissions needed:**
     - Zone > Cache Purge > Purge
     - Zone > DNS > Edit
     - Zone > Cache Rules > Edit
     - Zone > Firewall Services > Edit
     - Account > Cloudflare Pages > Edit
     
4. **Set Zone Resources:**
   - Select: **Include > Specific zone > xpandorax.com**

5. **TTL & Summary:**
   - Set TTL (Time To Live): 12 months recommended
   - Review and click **"Create Token"**

6. **Copy Your Token:**
   - **IMPORTANT:** Copy the token immediately - you won't see it again!
   - Format: `xxx-xxxxxxxxxxxxx-xxxxxxxxxx` (about 86 characters)

---

## 📝 Step 2: Save Your Credentials

### Update `.env.cloudflare`

Replace your token with the new one:

```dotenv
# Cloudflare API Automation Configuration
CLOUDFLARE_API_TOKEN=YOUR_NEW_TOKEN_HERE
CLOUDFLARE_DOMAIN=xpandorax.com
CLOUDFLARE_ACCOUNT_ID=2bb5dac6bb0b6db1c0b08b61f2ac0ef6
```

### Update `ZONE_ID.txt`

Get your Zone ID:

1. Go to your domain dashboard: https://dash.cloudflare.com/
2. Click on **xpandorax.com**
3. In the right sidebar, find **Zone ID**
4. Copy it and save to `ZONE_ID.txt`:

```
CLOUDFLARE_ZONE_ID=your-zone-id-here
CLOUDFLARE_API_TOKEN=your-new-token-here
```

---

## ✅ Step 3: Verify Connection

Run this PowerShell command to test:

```powershell
$token = "YOUR_NEW_TOKEN_HERE"
$zoneId = "YOUR_ZONE_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest `
        -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Successfully connected to Cloudflare!" -ForegroundColor Green
    Write-Host "Zone: $($data.result.name)" -ForegroundColor Cyan
    Write-Host "Zone ID: $($data.result.id)" -ForegroundColor Cyan
    Write-Host "Status: $($data.result.status)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Connection failed: $($_.Exception.Message)" -ForegroundColor Red
}
```

---

## 🔧 Step 4: Common API Operations

Once connected, you can use these operations:

### Get DNS Records
```powershell
$token = "YOUR_TOKEN"
$zoneId = "YOUR_ZONE_ID"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$response = Invoke-WebRequest `
    -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns/records" `
    -Method GET `
    -Headers $headers

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Create CNAME Record
```powershell
$body = @{
    type = "CNAME"
    name = "cdn"
    content = "xpandorax-com.s3.us-east-005.backblazeb2.com"
    ttl = 1
    proxied = $true
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns/records" `
    -Method POST `
    -Headers $headers `
    -Body $body

$response.Content | ConvertFrom-Json
```

### Purge Cache
```powershell
$body = @{
    files = @("https://xpandorax.com/*")
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/purge_cache" `
    -Method POST `
    -Headers $headers `
    -Body $body

$response.Content | ConvertFrom-Json
```

### Create Cache Rule
```powershell
$body = @{
    expression = "(http.request.uri.path starts_with `"/pictures/`") or (http.request.uri.path starts_with `"/videos/`")"
    action = "set_cache_settings"
    action_parameters = @{
        cache = $true
        cache_level = "cache_everything"
        edge_ttl = 31536000
        browser_ttl = 31536000
    }
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest `
    -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/cache/rules" `
    -Method POST `
    -Headers $headers `
    -Body $body

$response.Content | ConvertFrom-Json
```

---

## 🐍 Python Integration (Optional)

For your Python scripts, use this:

```python
import os
import requests

CLOUDFLARE_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
CLOUDFLARE_ZONE_ID = os.getenv("CLOUDFLARE_ZONE_ID")

headers = {
    "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
    "Content-Type": "application/json"
}

# Get zone info
response = requests.get(
    f"https://api.cloudflare.com/client/v4/zones/{CLOUDFLARE_ZONE_ID}",
    headers=headers
)

if response.status_code == 200:
    print("✅ Connected to Cloudflare!")
    print(response.json()["result"]["name"])
else:
    print(f"❌ Error: {response.status_code}")
    print(response.json())
```

---

## 📋 Troubleshooting

| Error | Solution |
|-------|----------|
| `(400) Bad Request` | Token or Zone ID is invalid. Re-check credentials |
| `(403) Forbidden` | Token doesn't have required permissions. Create a new one with proper scopes |
| `(401) Unauthorized` | Token format is wrong. Ensure it's copied exactly |
| `(404) Not Found` | Zone ID doesn't exist. Verify your domain in Cloudflare |

---

## 🎯 Next Steps

1. Generate a new token from https://dash.cloudflare.com/profile/api-tokens
2. Update `.env.cloudflare` and `ZONE_ID.txt`
3. Run the verification command
4. Start using the API operations!

Need help? Refer to the [Cloudflare API Documentation](https://developers.cloudflare.com/api/).
