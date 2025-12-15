@echo off
REM Backblaze B2 + Cloudflare CDN Setup Script for Windows
REM Run this batch file to set up secrets

echo.
echo ==========================================
echo Step 1: Set Cloudflare Pages Secrets
echo ==========================================
echo.
echo Run these commands (one at a time):
echo.

echo wrangler pages secret put B2_KEY_ID
echo.
pause

echo wrangler pages secret put B2_APPLICATION_KEY
echo.
pause

echo wrangler pages secret put B2_BUCKET_ID
echo.
pause

echo.
echo ==========================================
echo Step 2: Cloudflare DNS Configuration
echo ==========================================
echo.
echo Go to: Cloudflare Dashboard ^> Your Domain ^> DNS
echo.
echo Add this CNAME record:
echo   Name: cdn
echo   Target: xpandorax-com.s3.us-east-005.backblazeb2.com
echo   Proxy: Enabled (Orange Cloud)
echo.
pause

echo.
echo ==========================================
echo Step 3: Cloudflare Cache Rules
echo ==========================================
echo.
echo Go to: Cloudflare Dashboard ^> Rules ^> Cache Rules
echo.
echo Create a rule:
echo   If: (cf.request.uri.path matches "^/pictures/") OR (cf.request.uri.path matches "^/videos/")
echo   Then:
echo     - Cache Level: Cache Everything
echo     - Edge Cache TTL: 1 year
echo     - Browser Cache TTL: 1 year
echo.
pause

echo.
echo ==========================================
echo Step 4: Test Locally
echo ==========================================
echo.
echo Dev server is running at: http://localhost:5173/
echo.
echo To test upload:
echo 1. Open http://localhost:5173 in browser
echo 2. Go to Sanity Studio
echo 3. Upload an image through the Pictures section
echo 4. Check that it saves to B2 and returns CDN URL
echo.
echo Done!
pause
