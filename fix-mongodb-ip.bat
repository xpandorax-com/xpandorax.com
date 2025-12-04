@echo off
echo.
echo ============================================
echo    MongoDB Atlas IP Whitelist Quick Fix
echo ============================================
echo.
echo Your Current Public IP Address:
powershell -Command "(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content"
echo.
echo ============================================
echo.
echo To fix the MongoDB connection error, you need to:
echo.
echo 1. Go to MongoDB Atlas: https://cloud.mongodb.com/
echo 2. Sign in to your account
echo 3. Click on your cluster "xpandorax-com"
echo 4. Go to "Network Access" in the left menu
echo 5. Click "Add IP Address"
echo 6. Either:
echo    a) Click "Add Current IP Address" (recommended for development)
echo    b) Enter 0.0.0.0/0 for "Allow from Anywhere" (less secure)
echo 7. Click "Confirm"
echo 8. Wait 1-2 minutes for changes to take effect
echo 9. Run: npm run test-mongodb
echo.
echo ============================================
echo.
pause
