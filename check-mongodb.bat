@echo off
echo ================================================
echo XpandoraX MongoDB Connection Quick Start
echo ================================================
echo.

REM Check if MongoDB service is running (for local installation)
echo [1/4] Checking if MongoDB service is installed locally...
sc query "MongoDB" >nul 2>&1
if %errorlevel% equ 0 (
    echo MongoDB service found!
    echo.
    echo [2/4] Checking MongoDB service status...
    sc query "MongoDB" | find "RUNNING" >nul
    if %errorlevel% equ 0 (
        echo ✓ MongoDB is running locally on port 27017
        echo.
    ) else (
        echo ⚠ MongoDB service exists but is not running!
        echo.
        echo Starting MongoDB service...
        net start MongoDB
        if %errorlevel% equ 0 (
            echo ✓ MongoDB started successfully!
        ) else (
            echo ✗ Failed to start MongoDB. You may need administrator privileges.
            echo   Run PowerShell as Administrator and execute: Start-Service MongoDB
        )
        echo.
    )
) else (
    echo MongoDB service not found locally.
    echo.
    echo This is OK if you're using MongoDB Atlas (cloud).
    echo If you want to use local MongoDB, please install it first.
    echo See MONGODB_SETUP_GUIDE.md for instructions.
    echo.
)

echo [3/4] Checking environment variables...
if exist .env.local (
    echo ✓ .env.local file found
    findstr /C:"MONGODB_URI" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✓ MONGODB_URI is configured
    ) else (
        echo ✗ MONGODB_URI not found in .env.local
    )
    
    findstr /C:"PAYLOAD_SECRET" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✓ PAYLOAD_SECRET is configured
    ) else (
        echo ✗ PAYLOAD_SECRET not found in .env.local
    )
) else (
    echo ✗ .env.local file not found!
    echo   Please create it with MongoDB credentials.
    echo   See MONGODB_SETUP_GUIDE.md for details.
)
echo.

echo [4/4] Ready to start development server!
echo.
echo ================================================
echo Next Steps:
echo ================================================
echo.
echo 1. Make sure MongoDB is running (locally or Atlas)
echo 2. Check .env.local has correct MONGODB_URI
echo 3. Run: npm run dev
echo 4. Open: http://localhost:3000/admin
echo 5. Create your first admin user
echo.
echo For detailed setup instructions, see:
echo   MONGODB_SETUP_GUIDE.md
echo.
pause
