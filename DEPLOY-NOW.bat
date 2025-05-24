@echo off
rem Final Vercel Deployment - Image to SVG Converter Power Apps
echo.
echo 🚀 DEPLOYING TO VERCEL - Image to SVG Converter Power Apps
echo ========================================================
echo.

echo [INFO] Checking prerequisites...

rem Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [SUCCESS] Node.js is available

rem Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] npm is available

rem Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
) else (
    echo [SUCCESS] Dependencies already installed
)

rem Build the project
echo [INFO] Building project for production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [SUCCESS] Project built successfully

rem Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing Vercel CLI...
    call npm install -g vercel
    if errorlevel 1 (
        echo [ERROR] Failed to install Vercel CLI
        pause
        exit /b 1
    )
    echo [SUCCESS] Vercel CLI installed
) else (
    echo [SUCCESS] Vercel CLI is available
)

rem Deploy to Vercel
echo.
echo [INFO] 🚀 Starting deployment to Vercel...
echo [INFO] Using modern Vercel configuration (no build conflicts)
echo [INFO] This will deploy your app to production
echo.
pause

call vercel --prod
if errorlevel 1 (
    echo.
    echo [ERROR] ❌ Deployment failed
    echo [INFO] Please check the error messages above
    pause
    exit /b 1
)

echo.
echo [SUCCESS] ✅ Deployment completed successfully!
echo.
echo 🎉 Your Image to SVG Converter Power Apps is now live!
echo.
echo 📱 To test mobile connectivity:
echo    1. Open your Vercel app URL on your mobile device
echo    2. Navigate to: [your-vercel-url]/vercel-mobile-test.html
echo    3. Run all three connectivity tests
echo.
echo 🔗 Important URLs:
echo    • Frontend: https://[your-app].vercel.app
echo    • Health Check: https://[your-app].vercel.app/api/health
echo    • Mobile Test: https://[your-app].vercel.app/vercel-mobile-test.html
echo.
echo 📋 Next Steps:
echo    1. Test the app on your mobile device
echo    2. Verify image conversion works properly
echo    3. Share your app with users!
echo.
pause
