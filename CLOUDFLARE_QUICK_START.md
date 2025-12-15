# Cloudflare Setup Quick Start Guide

## Overview
You now have everything configured for Backblaze B2 + Cloudflare CDN storage. This guide will help you complete the final setup steps.

## Step 1: Get Your Cloudflare Zone ID

**Using PowerShell (Windows):**
```powershell
.\cloudflare-helper.ps1 -Command GetZoneId
```

This will:
- Query your Cloudflare account for `xpandorax.com` zone ID
- Display the Zone ID
- Save it to `ZONE_ID.txt` for future commands

**Using cURL (any OS):**
```bash
curl -s "https://api.cloudflare.com/client/v4/zones?name=xpandorax.com" \
  -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" | jq '.result[0]'
```

**Expected Output:**
```json
{
  "id": "your-zone-id-here",
  "name": "xpandorax.com",
  "account": {...},
  ...
}
```

Save this Zone ID - you'll need it for other commands.

---

## Step 2: Add CNAME Record for CDN

Point `cdn.xpandorax.com` to your B2 bucket.

**Using PowerShell:**
```powershell
.\cloudflare-helper.ps1 -Command AddCNAME -Name "cdn" -Target "xpandorax-com.s3.us-east-005.backblazeb2.com"
```

**Using cURL (replace ZONE_ID):**
```bash
ZONE_ID="your-zone-id"
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns/records" \
  -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "cdn",
    "content": "xpandorax-com.s3.us-east-005.backblazeb2.com",
    "ttl": 1,
    "proxied": true
  }'
```

**Verify in Cloudflare UI:**
1. Go to https://dash.cloudflare.com
2. Select xpandorax.com
3. Go to DNS section
4. Confirm `cdn` CNAME record points to B2 bucket (status should be orange ☁️ Proxied)

---

## Step 3: Create Cache Rule for Static Content

Cache images and videos for maximum performance.

**Using PowerShell:**
```powershell
.\cloudflare-helper.ps1 -Command CreateCacheRule
```

**Using cURL (replace ZONE_ID):**
```bash
ZONE_ID="your-zone-id"
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache/rules" \
  -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" \
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

**Or in Cloudflare UI:**
1. Go to https://dash.cloudflare.com
2. Select xpandorax.com
3. Go to Caching → Cache Rules
4. Create new rule:
   - **Expression:** `(http.request.uri.path starts_with "/pictures/") or (http.request.uri.path starts_with "/videos/")`
   - **Cache Level:** Cache Everything
   - **Edge TTL:** 1 year (31536000 seconds)
   - **Browser TTL:** 1 year (31536000 seconds)

---

## Step 4: Verify Configuration

**Check DNS Records:**
```powershell
.\cloudflare-helper.ps1 -Command ListDNSRecords
```

Expected output should show:
```
Type   Name                 Content                                           Proxied
----   ----                 -------                                           -------
CNAME  cdn.xpandorax.com    xpandorax-com.s3.us-east-005.backblazeb2.com    True
```

**Check Cache Rules:**
```powershell
.\cloudflare-helper.ps1 -Command ListCacheRules
```

Should show the cache rule you created.

**Test CNAME Resolution:**
```powershell
nslookup cdn.xpandorax.com
# or
Resolve-DnsName cdn.xpandorax.com
```

Wait up to 5 minutes for DNS propagation if it fails.

---

## Step 5: Test Local Uploads

### Start Development Server
```bash
npm run dev
```

Server should be available at `http://localhost:5173`

### Upload Test Image via Sanity Studio
1. Open `http://localhost:5173` in browser
2. Navigate to Content → Images (or any collection with image upload)
3. Upload a test image
4. Check the upload response URL - should be in format:
   ```
   https://cdn.xpandorax.com/pictures/2024/12/test-image-1734567890-abc123.jpg
   ```

### Verify Image Delivery
```powershell
# Test CDN access
curl -I https://cdn.xpandorax.com/pictures/2024/12/test-image-1734567890-abc123.jpg

# Check for cache headers
# Should include: cf-cache-status: MISS/HIT, age: <seconds>
```

---

## Step 6: Deploy to Production

Once local testing is successful:

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy ./build/client --project-name xpandorax-com
```

Your secrets (B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_ID) are already set in Cloudflare Pages via:
```bash
wrangler secret put B2_KEY_ID
wrangler secret put B2_APPLICATION_KEY
wrangler secret put B2_BUCKET_ID
```

---

## Troubleshooting

### CNAME Not Resolving
- **Issue:** `nslookup cdn.xpandorax.com` returns nothing
- **Solution:** 
  1. Verify CNAME record was created in Cloudflare UI
  2. Wait 5-10 minutes for DNS propagation
  3. Flush local DNS cache: `ipconfig /flushdns` (Windows)

### 403 Forbidden from B2
- **Issue:** Images return 403 Forbidden
- **Solution:**
  1. Verify B2 bucket is marked **Private** (not Public)
  2. Check B2 credentials are correct in `.dev.vars`
  3. Verify CNAME points to correct B2 endpoint: `s3.us-east-005.backblazeb2.com`

### Cache Not Working
- **Issue:** `cf-cache-status: BYPASS` or `MISS`
- **Solution:**
  1. Verify cache rule was created: `.\cloudflare-helper.ps1 -Command ListCacheRules`
  2. Check rule expression matches request path
  3. Wait 2-3 minutes for rule to activate
  4. Purge cache: `.\cloudflare-helper.ps1 -Command PurgeAll`

### Upload Returns Wrong URL
- **Issue:** Upload URL doesn't contain `cdn.xpandorax.com`
- **Solution:**
  1. Check `CDN_URL` in `wrangler.toml` is `https://cdn.xpandorax.com`
  2. Check `CDN_URL` in `.dev.vars` is correct
  3. Restart dev server: `npm run dev`

---

## Available Commands

### PowerShell Helper
```powershell
# Get Zone ID
.\cloudflare-helper.ps1 -Command GetZoneId

# Create cache rule
.\cloudflare-helper.ps1 -Command CreateCacheRule

# List cache rules
.\cloudflare-helper.ps1 -Command ListCacheRules

# Add CNAME record
.\cloudflare-helper.ps1 -Command AddCNAME -Name "cdn" -Target "xpandorax-com.s3.us-east-005.backblazeb2.com"

# List DNS records
.\cloudflare-helper.ps1 -Command ListDNSRecords

# Purge all cache
.\cloudflare-helper.ps1 -Command PurgeAll

# Get zone info
.\cloudflare-helper.ps1 -Command GetZoneInfo
```

### Bash Helper
```bash
# Source the script (Linux/Mac)
source ./cloudflare-helper.sh

# Then run commands
get_zone_id
create_cache_rule
list_cache_rules
add_cname cdn xpandorax-com.s3.us-east-005.backblazeb2.com
list_dns_records
purge_all
get_zone_info
```

---

## Configuration Files

| File | Purpose | Contains |
|------|---------|----------|
| `.dev.vars` | Local dev secrets | B2 credentials |
| `wrangler.toml` | Cloudflare Pages config | B2 endpoints and bucket name |
| `.env.cloudflare` | Optional: CF API token | Cloudflare API credentials |
| `ZONE_ID.txt` | Stored zone ID (auto-created) | Your Cloudflare Zone ID |

---

## Important Notes

⚠️ **Never commit sensitive files:**
- `.dev.vars` - Contains B2 credentials
- `.env.cloudflare` - Contains Cloudflare API token
- `ZONE_ID.txt` - Add to .gitignore

✅ **Production credentials are set via:**
- Cloudflare Pages dashboard UI
- Or: `wrangler secret put B2_KEY_ID` etc.

🔒 **B2 bucket is Private:**
- Only accessible through Cloudflare CDN (CNAME)
- Or with signed URLs from your app

📊 **Bandwidth is free:**
- B2 → Cloudflare egress: Free (Bandwidth Alliance)
- Perfect for image/video delivery

---

## Next Steps

1. ✅ Run `Get-ZoneId` to fetch zone ID
2. ✅ Create CNAME record pointing to B2
3. ✅ Create cache rules for `/pictures/*` and `/videos/*`
4. ✅ Test local uploads
5. ✅ Deploy to production with `npm run build && wrangler pages deploy`

Questions? Check `CLOUDFLARE_AUTOMATION.md` for advanced API usage.
