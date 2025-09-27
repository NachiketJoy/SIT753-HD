Write-Host "Calculator API - DevOps Pipeline Setup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Building Docker images..." -ForegroundColor Yellow
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building Docker images" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting development environment..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error starting services" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "Checking service health..." -ForegroundColor Yellow

Write-Host "Testing Calculator API..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "http://localhost:5050/health" -UseBasicParsing | Out-Null
    Write-Host "✅ Calculator API is running at http://localhost:5050" -ForegroundColor Green
} catch {
    Write-Host "❌ Calculator API is not responding" -ForegroundColor Red
}

Write-Host "Testing Prometheus..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "http://localhost:9090" -UseBasicParsing | Out-Null
    Write-Host "✅ Prometheus is running at http://localhost:9090" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Prometheus is not responding" -ForegroundColor Yellow
}

Write-Host "Testing Grafana..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing | Out-Null
    Write-Host "✅ Grafana is running at http://localhost:3001 (admin/admin)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Grafana is not responding" -ForegroundColor Yellow
}

Write-Host "Testing SonarQube..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "http://localhost:9000" -UseBasicParsing | Out-Null
    Write-Host "✅ SonarQube is running at http://localhost:9000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  SonarQube is not responding (may take a few minutes to start)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Cyan
Write-Host "   • Application: http://localhost:5050" -ForegroundColor White
Write-Host "   • Frontend: http://localhost:5050/index.html" -ForegroundColor White
Write-Host "   • Health Check: http://localhost:5050/health" -ForegroundColor White
Write-Host "   • Metrics: http://localhost:5050/metrics" -ForegroundColor White
Write-Host "   • Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "   • Grafana: http://localhost:3001 (admin/admin)" -ForegroundColor White
Write-Host "   • SonarQube: http://localhost:9000" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Run tests: npm test" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
Read-Host "Press Enter to exit"
