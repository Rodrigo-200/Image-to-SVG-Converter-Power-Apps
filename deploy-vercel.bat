@echo off
rem Vercel Deployment Script for Image to SVG Converter Power Apps
rem This script handles both local development and Vercel production deployment

echo.
echo 🚀 Image to SVG Converter - Vercel Deployment Script
echo =================================================
echo.

:menu
echo Select an option:
echo 1) Install dependencies and build
echo 2) Test local development
echo 3) Deploy to Vercel (production)
echo 4) Full deployment (all steps)
echo 5) Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto install_and_build
if "%choice%"=="2" goto test_local
if "%choice%"=="3" goto deploy_vercel
if "%choice%"=="4" goto full_deployment
if "%choice%"=="5" goto exit
goto invalid_choice

:install_and_build
echo [INFO] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    goto menu
)
echo [SUCCESS] Dependencies installed successfully

echo [INFO] Building project for production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    goto menu
)
echo [SUCCESS] Project built successfully
pause
goto menu

:test_local
echo [INFO] Testing local development setup...
echo [INFO] Starting local backend server...
start /b npm run server
timeout /t 3 /nobreak >nul

echo [INFO] Testing health endpoint...
curl -s http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Local backend server failed to start
    taskkill /f /im node.exe >nul 2>&1
    pause
    goto menu
)
echo [SUCCESS] Local backend server is running
taskkill /f /im node.exe >nul 2>&1
echo [SUCCESS] Local test completed
pause
goto menu

:deploy_vercel
echo [INFO] Checking Vercel CLI...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Vercel CLI not found. Installing...
    call npm install -g vercel
    if errorlevel 1 (
        echo [ERROR] Failed to install Vercel CLI
        pause
        goto menu
    )
    echo [SUCCESS] Vercel CLI installed successfully
) else (
    echo [SUCCESS] Vercel CLI is already installed
)

echo [INFO] Deploying to Vercel...
call vercel --prod
if errorlevel 1 (
    echo [ERROR] Deployment failed
    pause
    goto menu
)
echo [SUCCESS] Deployment completed successfully!
echo [INFO] Your application is now live on Vercel
echo [INFO] The backend API endpoints are available at:
echo [INFO]   - /api/health (GET) - Health check
echo [INFO]   - /api/convert-to-svg (POST) - Image conversion
pause
goto menu

:full_deployment
echo [INFO] Starting full deployment process...
call :install_and_build
call :test_local
call :deploy_vercel
goto menu

:invalid_choice
echo [ERROR] Invalid option. Please choose 1-5.
pause
goto menu

:exit
echo [INFO] Goodbye!
pause
exit /b 0
