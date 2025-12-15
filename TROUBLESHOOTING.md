# 🔧 Troubleshooting Quick Reference

## Common Issues & Fixes

### 1. "Invalid request headers" from Cloudflare API

**Symptoms:**
- Python helper returns: `Error from Cloudflare API: Invalid request headers`
- API returns 400 Bad Request error
- Authorization header rejected

**Root Cause:**
- API token may be invalid or expired
- Token may lack required permissions
- Token may need time to activate (15 minutes after creation)

**Solutions:**

**Option A: Create New Token (Recommended)**
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Choose "Edit Zone DNS" template
4. Add additional permission: "Cache Rules:Edit"
5. Select zone: "xpandorax.com"
6. Click "Create Token"
7. Copy token immediately (only shown once!)
8. Update token in your helper scripts

**Option B: Check Existing Token**
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Check if your token exists and isn't marked as "Revoked"
3. Click the token to edit
4. Verify permissions include:
   - Zone:DNS:Edit ✓
   - Zone:Cache Rules:Edit ✓
   - Account:Zone:Read ✓
5. Check scope includes "xpandorax.com"
6. If all good, try again (wait 15 minutes if just created)

**Test Your Token:**
```bash
# Python test
python -c "
import requests
token = 'YOUR_TOKEN_HERE'
response = requests.get(
    'https://api.cloudflare.com/client/v4/user',
    headers={'Authorization': f'Bearer {token}'}
)
print('Status:', response.status_code)
print('Response:', response.json())
"

# PowerShell test
$token = 'YOUR_TOKEN_HERE'
$headers = @{'Authorization' = "Bearer $token"}
Invoke-WebRequest -Uri 'https://api.cloudflare.com/client/v4/user' -Headers $headers -UseBasicParsing
```

Expected: Status code 200 (success)
If 400: Token is invalid → create new one

---

### 2. Zone ID Not Found

**Symptoms:**
- `Could not fetch Zone ID`
- Empty result from API
- Helper says zone doesn't exist

**Root Cause:**
- Domain may not be in your Cloudflare account
- Nameservers not pointed to Cloudflare
- Typo in domain name

**Solutions:**

1. **Verify domain is in account:**
   - Go to https://dash.cloudflare.com
   - Look for "xpandorax.com" in sidebar
   - If not there, add domain first

2. **Check nameservers:**
   - Go to domain registrar
   - Verify nameservers point to Cloudflare:
     - `ns1.cloudflare.com`
     - `ns2.cloudflare.com`
     - (or other Cloudflare nameservers)

3. **Get Zone ID manually:**
   - Go to https://dash.cloudflare.com
   - Click "xpandorax.com"
   - Go to "Overview" tab
   - Look for "Zone ID" (top right corner)
   - Copy it and save to `ZONE_ID.txt`

4. **Retry helper:**
   ```bash
   python cloudflare-helper.py get-zone-id
   ```
   - Wait 5 minutes if you just changed nameservers

---

### 3. CNAME Record Creation Fails

**Symptoms:**
- "Forbidden" or "Unauthorized" error
- "Invalid name" error
- CNAME created but shows errors in dashboard

**Root Cause:**
- Token lacks DNS:Edit permission
- Invalid CNAME format
- Name conflicts with existing records
- Target domain syntax error

**Solutions:**

1. **Check token permissions:**
   ```bash
   # Test with manual curl
   TOKEN="YOUR_TOKEN"
   ZONE_ID="YOUR_ZONE_ID"
   curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns/records" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type":"CNAME","name":"test","content":"example.com","ttl":1,"proxied":true}'
   ```
   - If 403: Token needs DNS:Edit permission
   - If 400: Check format of request body

2. **Verify CNAME syntax:**
   - Name: `cdn` (just the subdomain, not full FQDN)
   - Content: `xpandorax-com.s3.us-east-005.backblazeb2.com` (must end with .com)
   - TTL: `1` (auto)
   - Proxied: `true` (enable orange cloud)

3. **Create manually in UI:**
   - https://dash.cloudflare.com
   - Select domain
   - DNS → Records
   - Create CNAME:
     - Type: CNAME
     - Name: cdn
     - Content: xpandorax-com.s3.us-east-005.backblazeb2.com
     - TTL: Auto
     - Proxied: Enabled
   - Save

---

### 4. CNAME Won't Resolve

**Symptoms:**
- `nslookup cdn.xpandorax.com` returns nothing
- Browser can't reach cdn.xpandorax.com
- "Cannot connect to server" errors

**Root Cause:**
- DNS changes take 5-10 minutes to propagate
- CNAME wasn't actually created
- Typo in domain name
- Local DNS cache

**Solutions:**

1. **Wait for propagation:**
   - CNAME changes can take 5-10 minutes (sometimes up to 24 hours)
   - Test after 10 minutes
   - Global propagation takes longer

2. **Check if CNAME was created:**
   ```bash
   # PowerShell
   Resolve-DnsName cdn.xpandorax.com
   
   # Or
   nslookup cdn.xpandorax.com
   ```
   - Should show: `xpandorax-com.s3.us-east-005.backblazeb2.com`

3. **Flush local DNS cache:**
   ```bash
   # Windows
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemctl restart nscd
   ```

4. **Use different DNS resolver:**
   ```bash
   # Test with Google DNS
   nslookup cdn.xpandorax.com 8.8.8.8
   
   # Or Cloudflare DNS
   nslookup cdn.xpandorax.com 1.1.1.1
   ```

5. **Verify in Cloudflare UI:**
   - Dashboard → DNS → Records
   - Find cdn CNAME record
   - Status should be orange ☁️ (proxied)

---

### 5. Images Return 403 Forbidden

**Symptoms:**
- Uploaded images return HTTP 403
- Browser shows "Forbidden" when trying to access image
- CDN shows 403 errors in logs

**Root Cause:**
- B2 bucket is public instead of private
- B2 credentials missing or invalid
- CORS configuration issue
- Access token expired

**Solutions:**

1. **Check B2 Bucket Settings:**
   - Go to https://secure.backblaze.com
   - Select bucket "xpandorax-com"
   - Check "Bucket Type" is "Private" (not Public)
   - If Public, click "Edit" and change to Private

2. **Verify B2 Credentials:**
   - Check `.dev.vars` file:
     ```
     B2_KEY_ID=005eaf89f218f5300000001
     B2_APPLICATION_KEY=K005hTeSKlGbaFja5KCc7lQaHYMG7w
     B2_BUCKET_NAME=xpandorax-com
     B2_BUCKET_ID=5e9a7f08c93f220198bf0513
     ```
   - If wrong, regenerate in Backblaze dashboard

3. **Check CNAME Pointing:**
   - Verify CNAME points to correct B2 endpoint:
     - `xpandorax-com.s3.us-east-005.backblazeb2.com`
   - Must be to Backblaze B2, not other storage

4. **Check File Actually Exists:**
   - Go to Backblaze dashboard
   - Browse bucket files
   - Verify uploaded file is there
   - Check file path matches request

5. **Restart Dev Server:**
   - CNAME changes need server restart
   - ```bash
     npm run dev
     ```

---

### 6. Cache Rule Not Working

**Symptoms:**
- Images not cached (`cf-cache-status: MISS`)
- Cache headers missing
- `age` header always 0
- Cache purge doesn't work

**Root Cause:**
- Cache rule not created or has wrong expression
- Rule hasn't activated yet (2-3 minutes)
- Cache header TTL set to 0
- Bypass cache is enabled

**Solutions:**

1. **Verify Cache Rule Exists:**
   ```bash
   python cloudflare-helper.py list-cache-rules
   ```
   - Should show rule with expression:
     ```
     (http.request.uri.path starts_with "/pictures/") or (http.request.uri.path starts_with "/videos/")
     ```

2. **Check Rule Settings:**
   - Dashboard → Caching → Cache Rules
   - Find the rule
   - Verify:
     - Expression is correct
     - Cache Level: Cache Everything
     - Edge TTL: 31536000 (1 year)
     - Browser TTL: 31536000

3. **Wait for Activation:**
   - New rules take 2-3 minutes to deploy
   - Wait and try again

4. **Clear Cache:**
   ```bash
   python cloudflare-helper.py purge-all
   ```
   - Then request image again
   - Should be MISS first time, HIT on reload

5. **Check Response Headers:**
   ```bash
   curl -I https://cdn.xpandorax.com/pictures/test.jpg
   ```
   - Should include:
     ```
     cache-control: public, max-age=31536000
     cf-cache-status: HIT (or MISS on first request)
     age: <seconds>
     ```

---

### 7. Upload Image to B2 Fails

**Symptoms:**
- Image upload returns error
- "Access Denied" or "Unauthorized"
- File doesn't appear in B2 dashboard

**Root Cause:**
- B2 credentials invalid
- App key revoked or expired
- Missing bucket permissions
- Endpoint URL wrong

**Solutions:**

1. **Check B2 Credentials in `.dev.vars`:**
   ```env
   B2_KEY_ID=005eaf89f218f5300000001
   B2_APPLICATION_KEY=K005hTeSKlGbaFja5KCc7lQaHYMG7w
   ```
   - Verify both are exact matches
   - No spaces or extra characters

2. **Regenerate B2 App Key:**
   - Go to https://secure.backblaze.com
   - Account → App Keys
   - Find key with ID `005eaf89f218f5300000001`
   - Check "Active" status
   - If revoked, delete and create new one
   - Update `.dev.vars` with new key

3. **Verify Bucket ID:**
   - Get from: https://secure.backblaze.com
   - Your bucket → Info
   - Copy Bucket ID: `5e9a7f08c93f220198bf0513`

4. **Check Endpoint URL:**
   ```
   B2_ENDPOINT=s3.us-east-005.backblazeb2.com
   ```
   - Verify region matches bucket region (us-east-005)
   - Endpoint should start with `s3.`

5. **Restart Dev Server:**
   ```bash
   npm run dev
   ```
   - Environment variables load on startup

---

### 8. npm run dev Fails

**Symptoms:**
- Dev server won't start
- "Module not found" errors
- TypeScript errors

**Root Cause:**
- Dependencies not installed
- Build cache corrupted
- Port 5173 in use

**Solutions:**

1. **Reinstall dependencies:**
   ```bash
   npm install
   npm run build
   npm run dev
   ```

2. **Clear build cache:**
   ```bash
   rm -r node_modules
   npm install
   ```

3. **Kill process on port 5173:**
   ```powershell
   # Windows
   netstat -ano | findstr 5173
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5173 | xargs kill -9
   ```

4. **Use different port:**
   ```bash
   npm run dev -- --port 3000
   ```

---

### 9. wrangler Deploy Fails

**Symptoms:**
- "Unauthorized" error
- "Invalid token"
- "Not authenticated"
- Build fails

**Root Cause:**
- Not logged into Cloudflare
- Account doesn't have access to Pages project
- Secrets not set
- Wrangler out of date

**Solutions:**

1. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```
   - Browser opens
   - Authorize wrangler
   - Verify in terminal

2. **Check Authentication:**
   ```bash
   wrangler whoami
   ```
   - Should show your Cloudflare account

3. **Set Required Secrets:**
   ```bash
   wrangler secret put B2_KEY_ID
   # Paste: 005eaf89f218f5300000001
   
   wrangler secret put B2_APPLICATION_KEY
   # Paste: K005hTeSKlGbaFja5KCc7lQaHYMG7w
   
   wrangler secret put B2_BUCKET_ID
   # Paste: 5e9a7f08c93f220198bf0513
   ```

4. **Update Wrangler:**
   ```bash
   npm install -g wrangler@latest
   ```

5. **Deploy with verbose output:**
   ```bash
   wrangler pages deploy ./build/client --project-name xpandorax-com --verbose
   ```

---

## Quick Diagnostic Commands

```bash
# Test B2 credentials
python -c "
import os
print('B2_KEY_ID:', os.getenv('B2_KEY_ID'))
print('B2_APPLICATION_KEY:', os.getenv('B2_APPLICATION_KEY'))
print('B2_BUCKET_NAME:', os.getenv('B2_BUCKET_NAME'))
"

# Test Cloudflare API token
curl -I https://api.cloudflare.com/client/v4/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test DNS resolution
nslookup cdn.xpandorax.com

# Test HTTP access
curl -I https://cdn.xpandorax.com

# Check dev server
curl -I http://localhost:5173
```

---

## Support Resources

| Issue | File | Command |
|-------|------|---------|
| API Token | CLOUDFLARE_AUTH_GUIDE.md | See guide |
| DNS/CNAME | CLOUDFLARE_QUICK_START.md | See step 2 |
| Cache Rules | CLOUDFLARE_QUICK_START.md | See step 3 |
| Manual Commands | CLOUDFLARE_MANUAL_CURL.md | See guide |
| All Issues | README_SETUP.md | See index |

---

## When Nothing Works

1. **Read error message carefully** - Usually tells you exact issue
2. **Check README_SETUP.md** - Master guide with all solutions
3. **Try manual commands** - Bypass scripts with direct curl
4. **Check Cloudflare UI** - Verify DNS and cache rules manually
5. **Restart everything** - Dev server, clear cache, regenerate tokens

---

**Last Updated:** 2025-12-15
**Coverage:** 9 common issues + 20+ solutions + diagnostic commands

