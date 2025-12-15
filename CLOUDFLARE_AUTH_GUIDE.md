# Cloudflare API Authentication Guide

## Important: API Token vs Global API Key

Cloudflare has two types of credentials:

### 1. **API Token** (Recommended - What we're using)
- Format: 39+ characters, alphanumeric with dashes
- Example: `5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL`
- Header: `Authorization: Bearer {token}`
- Supports granular permissions
- Can be scoped to specific zones

### 2. **Global API Key** (Legacy - Deprecated)
- Format: 32 hex characters
- Example: `abc123def456...` (32 chars)
- Header: `X-Auth-Key: {api_key}` + `X-Auth-Email: {email}`
- Full account access
- Less secure

---

## Verify Your Token

If you're getting **"Invalid request headers"** error, your token might be:

1. **Invalid/Expired** - Regenerate it
2. **Wrong Type** - You may have a Global API Key instead
3. **Not Yet Activated** - May take a few minutes after creation
4. **Insufficient Permissions** - Check token doesn't have zone editing permission

---

## How to Create/Find Your API Token

### Option 1: Create New API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit Zone DNS"** (or create custom)
4. **Permissions needed:**
   - `Zone:DNS:Edit` (for CNAME records)
   - `Zone:Cache Rules:Edit` (for cache rules)
   - `Account:Zone:Read` (for listing zones)
5. **Scope:** Select your zone or all zones in account
6. **TTL:** Set for 1 year or longer (or No expiration)
7. **Create and copy** the token immediately (only shown once!)

### Option 2: Use Global API Key (If Token doesn't work)
1. Go to https://dash.cloudflare.com/profile
2. Scroll to **"API Tokens"** section
3. Copy your **Global API Key**
4. Also copy your email address
5. Use different headers:
   ```
   X-Auth-Key: {global-api-key}
   X-Auth-Email: {your-email@example.com}
   ```

---

## Testing Your Credentials

### If Using API Token:
```bash
curl -X GET "https://api.cloudflare.com/client/v4/user" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected response if valid:
```json
{
  "success": true,
  "result": {
    "id": "...",
    "email": "your@email.com",
    ...
  }
}
```

### If Using Global API Key:
```bash
curl -X GET "https://api.cloudflare.com/client/v4/user" \
  -H "X-Auth-Key: YOUR_GLOBAL_API_KEY_HERE" \
  -H "X-Auth-Email: your@email.com" \
  -H "Content-Type: application/json"
```

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid request headers` | Wrong header format or invalid token | Verify token is correct, check header name |
| `Unauthorized` | Token lacks permission | Add `Zone:DNS:Edit` and `Zone:Cache Rules:Edit` permissions |
| `Forbidden` | Token scope doesn't include your zone | Change scope to include `xpandorax.com` |
| `Not Found` | Zone ID doesn't exist | Verify `xpandorax.com` is in your account |

---

## Python Helper Correction

**The issue:** Our `cloudflare-helper.py` is using API Token format. If that doesn't work, we need to know if you have:

- **A valid API Token** (39+ char string with dashes)
- **OR a Global API Key** (32 hex chars) + email address

### To Check Which You Have:

1. Go to https://dash.cloudflare.com/profile/api-tokens
   - Top section shows your **Global API Key** (32 hex chars)
   - Below shows your **API Tokens** (longer strings with dashes)

2. Share just the **format** (not the actual value):
   - `5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL` = API Token ✓
   - `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` = Global API Key ✗

---

## Next Steps

1. **Verify your token format** - Is it the longer string (API Token) or 32-char hex (Global API Key)?

2. **Test manually** with curl:
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/user" \
     -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" \
     -H "Content-Type: application/json"
   ```

3. **If it fails**, generate a new token:
   - https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit Zone DNS" template
   - Make sure it includes your domain

4. **Update the scripts** with the new token value

---

## Using cURL Directly (Reliable Alternative)

If our Python/PowerShell scripts don't work, you can use cURL commands directly:

**Get Zone ID:**
```bash
curl -s "https://api.cloudflare.com/client/v4/zones?name=xpandorax.com" \
  -H "Authorization: Bearer {YOUR_TOKEN}" | jq '.result[0].id'
```

**Create CNAME:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/dns/records" \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"cdn","content":"xpandorax-com.s3.us-east-005.backblazeb2.com","ttl":1,"proxied":true}'
```

**Create Cache Rule:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/cache/rules" \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"expression":"(http.request.uri.path starts_with \"/pictures/\") or (http.request.uri.path starts_with \"/videos/\")","action":"set_cache_settings","action_parameters":{"cache":true,"cache_level":"cache_everything","edge_ttl":31536000,"browser_ttl":31536000}}'
```

---

## Summary

Your current token: `5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL`
- ✓ Format looks correct for API Token
- ✗ But API is rejecting it with "Invalid request headers"

This likely means:
1. Token may not have full permissions
2. Token may have expired or been revoked
3. There's a network/header formatting issue

**Solution:** Create a new API Token with explicit Zone editing permissions following the steps above.

