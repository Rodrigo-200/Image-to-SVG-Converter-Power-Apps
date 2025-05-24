@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 📱 Mobile Access Setup for SVG Converter
echo ========================================
echo.

echo 🔍 Finding your computer's IP address...
echo.

:: Get the IPv4 address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    echo 📍 Your IP Address: !ip!
    echo.
    echo 📱 Access from your phone:
    echo    Frontend: http://!ip!:5173
    echo    Backend:  http://!ip!:3001
    echo.
)

echo 🚀 Starting development servers...
echo.
echo ⚠️  Make sure your phone is on the same WiFi network!
echo.

:: Start backend server in background
echo 🔧 Starting backend server...
start /b "SVG Backend" cmd /c "npm run server"

:: Wait a moment for backend to start
timeout /t 3 >nul

:: Start frontend server
echo 🎨 Starting frontend server...
npm run dev

pause
