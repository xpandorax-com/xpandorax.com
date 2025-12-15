# Backblaze B2 + Cloudflare CDN Setup Guide

This guide explains how to set up Backblaze B2 storage with Cloudflare CDN for the XpandoraX platform.

## Architecture Overview

```
Upload Flow:
[User/Sanity Studio] → [API Endpoint] → [Backblaze B2 Storage]

Delivery Flow:
[Browser] → [Cloudflare CDN] → [Backblaze B2 Origin]
```

## Benefits

1. **Cost-effective**: Backblaze B2 is significantly cheaper than most cloud storage providers
2. **Free egress**: Bandwidth from B2 to Cloudflare is free (Bandwidth Alliance)
3. **Global CDN**: Cloudflare's global network provides fast delivery worldwide
4. **S3-compatible**: Uses standard S3 API, easy to integrate

## Setup Steps

### 1. Create Backblaze B2 Account & Bucket

1. Sign up at [backblaze.com](https://www.backblaze.com/b2/cloud-storage.html)
2. Create a new bucket:
   - Name: `xpandorax-media`
   - File Lifecycle: Keep all versions
   - Encryption: Disabled (Cloudflare handles SSL)
   - **Bucket Settings**: Set to **Public** (required for CDN access)

3. Note your bucket details:
   - Bucket Name: `xpandorax-media`
   - Bucket ID: (shown in bucket settings)
   - Endpoint: `s3.{region}.backblazeb2.com` (e.g., `s3.us-west-004.backblazeb2.com`)

### 2. Create Application Key

1. Go to App Keys in B2 dashboard
2. Create a new application key:
   - Name: `xpandorax-upload`
   - Bucket: Select `xpandorax-media`
   - Capabilities: Select all (read, write, delete, list)
3. **Save the credentials immediately** (shown only once):
   - `keyID`: This is your `B2_KEY_ID`
   - `applicationKey`: This is your `B2_APPLICATION_KEY`

### 3. Configure Cloudflare CDN

1. In Cloudflare dashboard, go to your domain's DNS settings
2. Add a CNAME record:
   - Name: `cdn` (or your preferred subdomain)
   - Target: `{bucket-name}.s3.{region}.backblazeb2.com`
   - Proxy: **Enabled** (orange cloud ON)

3. Configure Page Rules or Cache Rules:
   ```
   URL: cdn.xpandorax.com/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 year
   - Browser Cache TTL: 1 year
   ```

4. Enable CORS in Cloudflare:
   - Go to Transform Rules > Response Headers
   - Add rule for `cdn.xpandorax.com`:
     - `Access-Control-Allow-Origin: *`
     - `Access-Control-Allow-Methods: GET, HEAD, OPTIONS`

### 4. Set Environment Variables

#### For Cloudflare Pages/Workers (Production)

Set these as secrets in your Cloudflare Pages project:

```bash
# Using Wrangler CLI
wrangler pages secret put B2_KEY_ID
wrangler pages secret put B2_APPLICATION_KEY
wrangler pages secret put B2_BUCKET_ID
```

Or via Cloudflare Dashboard:
1. Go to Pages > Your Project > Settings > Environment Variables
2. Add these production secrets:
   - `B2_KEY_ID`: Your application key ID
   - `B2_APPLICATION_KEY`: Your application key
   - `B2_BUCKET_ID`: Your bucket ID

The following are set in `wrangler.toml`:
- `B2_BUCKET_NAME`: `xpandorax-media`
- `B2_REGION`: `us-west-004` (adjust to your region)
- `B2_ENDPOINT`: `s3.us-west-004.backblazeb2.com`
- `CDN_URL`: `https://cdn.xpandorax.com`

#### For Local Development

Create a `.dev.vars` file:

```bash
B2_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_BUCKET_NAME=xpandorax-media
B2_BUCKET_ID=your-bucket-id
B2_REGION=us-west-004
B2_ENDPOINT=s3.us-west-004.backblazeb2.com
CDN_URL=https://cdn.xpandorax.com
```

### 5. File Structure in B2

Files are organized as follows:

```
xpandorax-media/
├── pictures/
│   └── 2024/
│       └── 12/
│           └── image-name-123456-abc123.jpg
├── videos/
│   └── video-name.mp4
└── thumbnails/
    └── thumb-123.jpg
```

### 6. Premium Video Hosting

For premium videos (ad-free for subscribers):

1. Upload videos directly to B2:
   - Path: `videos/video-name.mp4`
   - Set proper content-type headers

2. In Sanity Studio:
   - Add the CDN URL to "Main Server URL (No Ads - Premium)" field
   - Example: `https://cdn.xpandorax.com/videos/video-name.mp4`

3. The video player will show this as "Main Server (No Ads)" for premium users

## Testing

Test the upload API:

```bash
curl -X POST \
  -F "file=@/path/to/image.jpg" \
  https://xpandorax.com/api/upload-picture
```

Expected response:
```json
{
  "success": true,
  "url": "https://cdn.xpandorax.com/pictures/2024/12/image-name-123456-abc123.jpg",
  "key": "pictures/2024/12/image-name-123456-abc123.jpg",
  "filename": "image.jpg",
  "size": 123456,
  "contentType": "image/jpeg"
}
```

## Troubleshooting

### Upload fails with "Storage not configured"
- Check that B2 credentials are set correctly
- Verify environment variables are available in the runtime

### Images not loading
- Verify Cloudflare DNS is configured correctly
- Check that the bucket is set to public
- Ensure CORS headers are configured

### Slow image loading
- Verify Cloudflare proxy is enabled (orange cloud)
- Check cache rules are configured
- Consider enabling Polish (image optimization) in Cloudflare

## Cost Estimation

- **Storage**: $0.006 per GB/month
- **Downloads**: Free to Cloudflare (Bandwidth Alliance)
- **Class B transactions**: $0.004 per 10,000
- **Class C transactions**: $0.004 per 10,000

For 100GB storage + 1TB monthly delivery: ~$0.60/month (vs ~$15+ on other providers)
