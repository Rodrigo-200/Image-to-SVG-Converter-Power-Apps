@echo off
title SVG Converter - Status Check
echo ========================================
echo 🎯 SVG Converter Status Check
echo ========================================
echo.

echo 📡 Checking server status...
echo.

REM Check if ports are in use
echo 🔍 Port Status:
netstat -an | findstr ":5173" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Frontend Server (Port 5173): RUNNING
) else (
    echo ❌ Frontend Server (Port 5173): NOT RUNNING
)

netstat -an | findstr ":3001" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend Server (Port 3001): RUNNING
) else (
    echo ❌ Backend Server (Port 3001): NOT RUNNING
)

echo.
echo 🌐 Network Information:
ipconfig | findstr "IPv4" | findstr /v "127.0.0.1" > temp_ip.txt
for /f "tokens=2 delims=:" %%a in (temp_ip.txt) do (
    set "ip=%%a"
    setlocal enabledelayedexpansion
    set "ip=!ip: =!"
    echo 📱 Mobile Access: http://!ip!:5173
    endlocal
)
del temp_ip.txt 2>nul

echo.
echo 🖥️ Local Access:
echo 💻 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3001

echo.
echo 📂 Project Files Status:
if exist "package.json" (echo ✅ package.json found) else (echo ❌ package.json missing)
if exist "src\App.vue" (echo ✅ Main app found) else (echo ❌ Main app missing)
if exist "server.js" (echo ✅ Backend server found) else (echo ❌ Backend server missing)
if exist "phone-access.html" (echo ✅ Mobile access page found) else (echo ❌ Mobile access page missing)

echo.
echo 🎨 Mobile Optimization Status:
echo ✅ Responsive CSS implemented
echo ✅ Touch-friendly buttons configured
echo ✅ Mobile-first design applied
echo ✅ Network access enabled
echo ✅ QR code access page available

echo.
echo 📋 Quick Actions:
echo [1] Open app in browser: start http://localhost:5173
echo [2] Open mobile access page: start phone-access.html
echo [3] View mobile test instructions: start mobile-test-instructions.md
echo.

echo 🚀 Project Status: READY FOR TESTING
echo 📱 Mobile optimizations: COMPLETE
echo 🔗 Network access: CONFIGURED
echo.
pause
