# Logo Setup Guide for XpandoraX

Your logo file `logo/xpandorax_logo.png` is already uploaded to Cloudflare R2. To display it on your website, you need to make it publicly accessible.

## Steps to Enable Your Logo

### Option 1: Enable Public R2.dev Subdomain (Recommended)

1. Go to your Cloudflare R2 dashboard: https://dash.cloudflare.com/24b757d490c705b47af6be2690a61933/r2/default/buckets/xpandorax-com

2. Click on **Settings** tab for your `xpandorax-com` bucket

3. Scroll down to **Public Access** section

4. Click **"Allow Access"** or **"Connect Custom Domain"** to enable public access

5. You'll get a public R2.dev subdomain like: `https://pub-XXXXXXXX.r2.dev`

6. Update your `.env.local` file with the public URL:
   ```env
   NEXT_PUBLIC_R2_URL=https://pub-XXXXXXXX.r2.dev
   NEXT_PUBLIC_LOGO_FILENAME=logo/xpandorax_logo.png
   ```

7. Restart your development server:
   ```bash
   npm run dev
   ```

### Option 2: Use Custom Domain

If you want to use a custom domain (e.g., `cdn.xpandorax.com`):

1. In your R2 bucket settings, click **"Connect Custom Domain"**

2. Follow the instructions to add a CNAME record in your DNS settings

3. Once configured, update your `.env.local`:
   ```env
   NEXT_PUBLIC_R2_URL=https://cdn.xpandorax.com
   NEXT_PUBLIC_LOGO_FILENAME=logo/xpandorax_logo.png
   ```

### Option 3: Use Direct URL

After enabling public access, you can use the direct URL:

```env
NEXT_PUBLIC_LOGO_URL=https://pub-XXXXXXXX.r2.dev/logo/xpandorax_logo.png
```

## Verify Your Logo

After updating your `.env.local` file and restarting the server:

1. Visit http://localhost:3000
2. Your logo should appear in the header
3. If you see "XpandoraX" text instead, the URL might not be correct or the bucket isn't public yet

## Current Configuration

Your code is already set up to:
- Load the logo from `config.js`
- Display it in the `Header.js` component
- Fall back to the site name text if the logo fails to load

The logo will appear as a 40x40 pixel image in the top-left corner of your website header.

## Troubleshooting

- **Logo not showing?** Check the browser console for CORS or 403 errors
- **CORS error?** Make sure public access is enabled in R2 settings
- **Wrong path?** Verify the file is at `logo/xpandorax_logo.png` in your bucket
- **404 error?** Double-check the public R2 URL is correct

## Security Note

Making your R2 bucket public means anyone can access files at known URLs. This is normal for public assets like logos. Keep sensitive files in private paths or separate buckets.
