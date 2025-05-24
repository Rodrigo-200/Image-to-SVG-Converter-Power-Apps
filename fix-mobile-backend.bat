@echo off
title Fix Mobile Backend Access
echo ===============================================
echo 📱 Fixing Mobile Backend Access
echo ===============================================
echo.

echo 🔧 Step 1: Configuring Windows Firewall...
echo Adding firewall rules for ports 3001 and 5173...

REM Add firewall rules for backend server
netsh advfirewall firewall add rule name="SVG Converter Backend" dir=in action=allow protocol=TCP localport=3001 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend port 3001 firewall rule added
) else (
    echo ⚠️  Run as Administrator to add firewall rules automatically
    echo    Or manually add rule: Port 3001, TCP, Inbound, Allow
)

REM Add firewall rules for frontend server  
netsh advfirewall firewall add rule name="SVG Converter Frontend" dir=in action=allow protocol=TCP localport=5173 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Frontend port 5173 firewall rule added
) else (
    echo ⚠️  Firewall rule for port 5173 may need manual configuration
)

echo.
echo 🔄 Step 2: Stopping existing servers...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Stopped existing Node.js processes

echo.
echo 🚀 Step 3: Starting servers with mobile access...
echo Starting backend server...
start "Backend Server" cmd /k "npm run server"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 🌐 Step 4: Getting network information...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" ^| findstr /v "127.0.0.1"') do (
    set "ip=%%a"
    setlocal enabledelayedexpansion
    set "ip=!ip: =!"
    echo 📱 Mobile Access URLs:
    echo    Frontend: http://!ip!:5173
    echo    Backend:  http://!ip!:3001
    echo    Health:   http://!ip!:3001/health
    endlocal
)

echo.
echo 🧪 Step 5: Testing backend connectivity...
timeout /t 5 /nobreak >nul
echo Testing localhost backend...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend responds on localhost
) else (
    echo ❌ Backend not responding on localhost
)

echo.
echo 📋 Troubleshooting Tips:
echo 1. Ensure your phone is on the same WiFi network
echo 2. Try accessing http://YOUR_IP:3001/health from your phone browser
echo 3. If still not working, check router settings for device isolation
echo 4. Consider temporarily disabling Windows Firewall for testing
echo.
echo 🔧 Manual Firewall Configuration (if needed):
echo Windows Security → Firewall → Advanced → Inbound Rules → New Rule
echo Port → TCP → 3001,5173 → Allow → All profiles → Name: SVG Converter
echo.

pause
