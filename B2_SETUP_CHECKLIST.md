# Complete B2 + Cloudflare CDN Setup Checklist

Your development environment is ready! Here's what to do next:

## ✅ Completed
- [x] B2 bucket created: `xpandorax-com`
- [x] Application Key generated
- [x] Project configuration updated with B2 credentials
- [x] Local environment variables set in `.dev.vars`
- [x] Development server running at `http://localhost:5173`

## 📋 TODO - Manual Steps Required

### 1️⃣ Set Cloudflare Pages Secrets (5 minutes)

Copy and run these commands **one at a time**:

```bash
wrangler pages secret put B2_KEY_ID
# Paste when prompted: 005eaf89f218f5300000001
```

```bash
wrangler pages secret put B2_APPLICATION_KEY
# Paste when prompted: K005hTeSKlGbaFja5KCc7lQaHYMG7w
```

```bash
wrangler pages secret put B2_BUCKET_ID
# Paste when prompted: 5e9a7f08c93f220198bf0513
```

✓ **Credentials saved to Cloudflare Pages production environment**

---

### 2️⃣ Configure Cloudflare DNS (3 minutes)

1. Go to **Cloudflare Dashboard** → Your Domain → **DNS**
2. Click **Add Record**
3. Fill in:
   - **Type:** CNAME
   - **Name:** `cdn`
   - **Target:** `xpandorax-com.s3.us-east-005.backblazeb2.com`
   - **Proxy Status:** **Enabled** (orange cloud) ← IMPORTANT
   - **TTL:** Auto
4. Click **Save**

✓ **CDN DNS configured - this routes cdn.xpandorax.com to Backblaze B2 via Cloudflare**

---

### 3️⃣ Cloudflare Cache Rules (3 minutes)

1. Go to **Cloudflare Dashboard** → **Rules** → **Cache Rules**
2. Click **Create Rule**
3. Fill in:

**When incoming requests match:**
```
(cf.request.uri.path matches "^/pictures/") OR (cf.request.uri.path matches "^/videos/")
```

**Then:**
- Cache Level: **Cache Everything**
- Edge Cache TTL: **1 year** (31536000 seconds)
- Browser Cache TTL: **1 year** (31536000 seconds)

4. Click **Deploy**

✓ **Cache configured - images/videos will be cached globally on Cloudflare**

---

### 4️⃣ Test Locally (5 minutes)

**Dev server is already running at:**
```
http://localhost:5173
```

**To test image upload:**

1. Open http://localhost:5173 in your browser
2. Navigate to Sanity Studio (or use `/admin` path if available)
3. Go to **Pictures** section
4. Upload a test image
5. Check the response:
   - Should return a URL like: `https://cdn.xpandorax.com/pictures/2024/12/image-name-123456-abc.jpg`
   - Confirms upload went to B2 ✓
   - URL is served through Cloudflare CDN ✓

**If it fails:**
- Check `.dev.vars` has correct credentials
- Check browser console for errors
- Check terminal output for upload errors
- Verify B2 bucket is set to **Private** (as configured)

---

### 5️⃣ Deploy to Production (1 minute)

Once testing is complete:

```bash
npm run build
wrangler pages deploy ./build/client
```

The production deployment will use the Cloudflare Pages secrets you set in step 1.

---

## 📊 Architecture Summary

```
                      ┌─────────────────────┐
                      │   Sanity Studio     │
                      │   (Upload Images)   │
                      └──────────┬──────────┘
                                 │
                    ┌────────────▼───────────┐
                    │  api/upload-picture    │
                    │  (Node.js API Route)   │
                    └────────────┬───────────┘
                                 │
                ┌────────────────▼──────────────────┐
                │   Backblaze B2 S3-compatible API  │
                │   (Storage Backend)               │
                │   Endpoint: s3.us-east-005...     │
                └────────────────┬──────────────────┘
                                 │
                    ┌────────────▼───────────┐
                    │  Cloudflare CDN        │
                    │  (Caching Layer)       │
                    │  cdn.xpandorax.com     │
                    └────────────┬───────────┘
                                 │
                          ┌──────▼──────┐
                          │   Browser   │
                          │   (User)    │
                          └─────────────┘

File Structure in B2:
xpandorax-com/
├── pictures/2024/12/image-123.jpg
├── videos/premium-video-1.mp4
└── ...
```

---

## 🔐 Security Notes

- **B2 Bucket:** Set to **Private** ✓
- **Presigned URLs:** Used for premium video access (server signs them)
- **Application Key:** Scoped to single bucket ✓
- **Credentials:** Stored as Cloudflare Pages secrets (not in git) ✓
- **CORS:** Configured by Cloudflare (no need to set in B2)

---

## 📝 Files Modified

- `.dev.vars` - Local development environment variables
- `wrangler.toml` - Cloudflare Pages configuration
- `app/lib/b2-storage.server.ts` - B2 storage library (NEW)
- `app/routes/api.upload-picture.tsx` - Updated for B2
- `app/types/env.d.ts` - Updated environment types
- `studio/components/R2ImageInput.tsx` - Updated UI text
- `studio/components/R2ImageArrayInput.tsx` - Updated UI text
- `studio/schemas/picture.ts` - Updated schema description

---

## 🚀 Next Steps After Setup

1. ✅ Complete all manual steps above
2. Test uploads locally
3. Deploy to production
4. Monitor B2 usage in Backblaze dashboard
5. Monitor Cloudflare cache hits in Analytics

**Estimated setup time: 15-20 minutes**

---

## ❓ Troubleshooting

### Upload returns "Storage not configured"
- Check `.dev.vars` has all B2 variables filled in
- Verify `B2_KEY_ID` and `B2_APPLICATION_KEY` are correct

### Upload fails with 403/401
- Check Application Key hasn't expired
- Verify key has `readFiles`, `writeFiles`, `deleteFiles` capabilities
- Ensure bucket is not in restricted IP list

### Images not loading from CDN
- Check CNAME record is correctly pointing to B2
- Verify Cloudflare proxy is **Enabled** (orange cloud)
- Allow 5-10 minutes for DNS propagation

### S3 endpoint error
- Confirm endpoint is `s3.us-east-005.backblazeb2.com` (not other regions)
- Verify region in `.dev.vars` matches endpoint

---

**Questions?** Check [docs/B2-CLOUDFLARE-CDN-SETUP.md](../docs/B2-CLOUDFLARE-CDN-SETUP.md) for detailed documentation.
