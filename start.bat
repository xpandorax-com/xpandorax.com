@echo off
echo ========================================
echo   XpandoraX Quick Start
echo ========================================
echo.

echo Checking if environment file exists...
if not exist .env.local (
    echo Creating .env.local from template...
    copy .env.local.example .env.local
    echo.
    echo IMPORTANT: Edit .env.local and add your Supabase credentials!
    echo.
    pause
)

echo Starting development server...
echo.
echo Your site will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
