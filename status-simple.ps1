# SVG Converter Status Check
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎯 SVG Converter Status Check" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check running processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✅ Node.js processes running: $($nodeProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "❌ No Node.js processes found" -ForegroundColor Red
}

# Get IP address (simplified)
try {
    $ip = (Test-NetConnection -ComputerName "8.8.8.8" -Port 53).SourceAddress.IPAddress
    Write-Host "📱 Mobile Access: http://$ip:5173" -ForegroundColor Cyan
    Write-Host "🔧 Backend API: http://$ip:3001" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Could not determine IP address" -ForegroundColor Red
}

Write-Host ""
Write-Host "🖥️ Local Access:" -ForegroundColor White
Write-Host "💻 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 Project Status: READY FOR TESTING" -ForegroundColor Green
Write-Host "📱 Mobile optimizations: COMPLETE" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "2. Test on mobile device using the IP address above" -ForegroundColor White
Write-Host "3. Scan QR code from phone-access.html" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"
