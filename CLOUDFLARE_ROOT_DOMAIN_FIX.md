# Cloudflare Dashboard Fix for Root Domain

## Problem
The root domain (xpandorax.com) has a Workers-managed DNS record that's blocking CNAME creation via API.

## Solution - Use Cloudflare Dashboard

### Steps:

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Select domain: xpandorax.com

2. **Navigate to DNS Records**
   - Go to: DNS → Records
   - Look for any records at "xpandorax.com" (not subdomains)

3. **Check for Worker/Page Rules**
   - Go to: Workers & Pages → Routes
   - Delete any routes matching "xpandorax.com/*"
   
4. **Delete or Modify Root Domain Record**
   - Find the AAAA record (100::) at root
   - If you see an option to delete it, delete it
   - OR if there's a "Workers" label, check Workers & Pages to find and remove the associated route

5. **Create Root CNAME with CNAME Flattening**
   - Go back to DNS
   - Click "Add Record"
   - Type: CNAME
   - Name: @ (for root)
   - Target: 2059bde5.xpandorax-com.pages.dev
   - Proxy status: Proxied
   - TTL: Auto
   - Save

6. **Alternative: Use Bulk Redirects**
   - If step 5 doesn't work, go to: Rules → Bulk Redirects
   - Add redirect: xpandorax.com/* → https://www.xpandorax.com/$1 (301 Permanent)

## Working Solution (No Action Needed)
Your site is fully functional at:
- ✅ https://www.xpandorax.com (FULLY WORKING)
- ✅ https://2059bde5.xpandorax-com.pages.dev (deployment URL)

The root domain (xpandorax.com without www) can be accessed via the Dashboard fix above.

## Current Status
- Domain: xpandorax.com
- Zone ID: 7a80fd2ecf89fe08f0dc6b9ddf1ce2cc
- WWW CNAME: 2059bde5.xpandorax-com.pages.dev
- Root Domain: Needs manual Dashboard fix
