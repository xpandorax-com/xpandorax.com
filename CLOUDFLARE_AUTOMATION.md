# Cloudflare Automation Setup & Usage Guide

## ✅ Configuration Complete

Your Cloudflare API token is now configured:
- **File:** `.env.cloudflare`
- **Token:** `5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL`
- **Domain:** `xpandorax.com`
- **Scope:** Full zone editing access (Cache, DNS, WAF, SSL/TLS, etc.)

---

## 📚 API Automation Methods

You now have two ways to manage your Cloudflare zone:

### Option 1: Use the CLI Tool (Coming Soon)
```bash
node cloudflare-cli.js cache-rule create --path "/pictures/" --ttl 31536000
node cloudflare-cli.js dns add-cname --name cdn --target xpandorax-com.s3.us-east-005.backblazeb2.com
node cloudflare-cli.js purge --everything
```

### Option 2: Direct REST API Calls (Immediate)
Use `curl` or your preferred HTTP client with the token.

**Base URL:** `https://api.cloudflare.com/client/v4`

**Headers Required:**
```
Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL
Content-Type: application/json
```

---

## 🛠️ Common Operations

### 1. Create a Cache Rule

**Goal:** Cache `/pictures/*` and `/videos/*` for 1 year

First, get your Zone ID:
```bash
curl -s https://api.cloudflare.com/client/v4/zones?name=xpandorax.com \
  -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" | jq '.result[0].id'
```

Copy the Zone ID. Then create the rule:
```bash
ZONE_ID="YOUR_ZONE_ID"

curl -X POST https://api.cloudflare.com/client/v4/zones/$ZONE_ID/cache/rules \
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

**Response:** Will return the created rule with an ID.

---

### 2. Add/Update a DNS Record

**Add CNAME for CDN:**
```bash
ZONE_ID="YOUR_ZONE_ID"

curl -X POST https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns/records \
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

**List DNS records:**
```bash
ZONE_ID="YOUR_ZONE_ID"

curl -s https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns/records \
  -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" | jq
```

---

### 3. Purge Cache

**Purge all cache:**
```bash
ZONE_ID="YOUR_ZONE_ID"

curl -X POST https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache \
  -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything": true}'
```

**Purge specific files:**
```bash
curl -X POST https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache \
  -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      "https://cdn.xpandorax.com/pictures/test.jpg",
      "https://cdn.xpandorax.com/videos/video1.mp4"
    ]
  }'
```

---

### 4. Get Zone Info

```bash
ZONE_ID="YOUR_ZONE_ID"

curl -s https://api.cloudflare.com/client/v4/zones/$ZONE_ID \
  -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" | jq
```

---

### 5. Set SSL/TLS Mode

```bash
ZONE_ID="YOUR_ZONE_ID"

# Set to Full (Recommended)
curl -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/ssl/settings \
  -H "Authorization: Bearer 5f7lyZU3GRZn-1XrYgGNbJM09AvGyYztGdWWBeL" \
  -H "Content-Type: application/json" \
  -d '{"value": "full"}'
```

**Options:** `flexible`, `full`, `full_strict`

---

## 📝 Files Created

1. **`.env.cloudflare`** — Stores your API token and domain (keep secret!)
2. **`cloudflare-api.js`** — ES module API wrapper for Node.js/Remix
3. **`cloudflare-cli.js`** — Command-line tool for common operations
4. **`CLOUDFLARE_AUTOMATION.md`** — This documentation

---

## 🔐 Security Notes

- **Keep `.env.cloudflare` in `.gitignore`** — Never commit API tokens
- **Token scope:** Limited to your xpandorax.com zone only
- **Expiration:** Check Cloudflare dashboard if you need to rotate the token
- **API calls:** All use HTTPS and Bearer token authentication

---

## 🚀 Future: CLI Tool

The `cloudflare-cli.js` tool will support:
```bash
# Cache Rules
node cloudflare-cli.js cache-rule create --path "/pictures/" --ttl 31536000
node cloudflare-cli.js cache-rule list
node cloudflare-cli.js cache-rule delete --id RULE_ID

# DNS
node cloudflare-cli.js dns add-cname --name cdn --target b2-endpoint.com
node cloudflare-cli.js dns list --type CNAME
node cloudflare-cli.js dns update --id RECORD_ID --proxied true

# Cache Purge
node cloudflare-cli.js purge --everything
node cloudflare-cli.js purge --file https://cdn.example.com/image.jpg

# SSL/TLS
node cloudflare-cli.js ssl set-mode --mode full
node cloudflare-cli.js ssl info
```

**Status:** Currently uses REST API directly via curl (more reliable). CLI wrapper in development.

---

## 📖 References

- [Cloudflare API Docs](https://developers.cloudflare.com/api/)
- [API Token Management](https://dash.cloudflare.com/profile/api-tokens)
- [Cache Rules](https://developers.cloudflare.com/cache/cache-rules/)
- [DNS Records API](https://developers.cloudflare.com/api/operations/dns-records-list-dns-records)

---

## ✅ Next Steps

1. **Get your Zone ID** — Run the curl command above
2. **Test a DNS operation** — List your current DNS records
3. **Create a cache rule** — For `/pictures/*` and `/videos/*`
4. **Monitor cache** — Check `cf-cache-status` headers after uploads
5. **Integrate into CI/CD** — Use API calls in deployment scripts

---

**Your setup is complete!** You now have full programmatic control over Cloudflare.
