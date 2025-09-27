@echo off
echo Calculator API - DevOps Pipeline Setup
echo =====================================

echo Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies
    pause
    exit /b 1
)

echo Building Docker images...
call docker-compose build
if %errorlevel% neq 0 (
    echo Error building Docker images
    pause
    exit /b 1
)

echo Starting development environment...
call docker-compose up -d
if %errorlevel% neq 0 (
    echo Error starting services
    pause
    exit /b 1
)

echo Waiting for services to start...
timeout /t 30 /nobreak

echo Checking service health...

echo Testing Calculator API...
powershell -Command "try { Invoke-WebRequest -Uri http://localhost:5050/health -UseBasicParsing | Out-Null; echo 'Calculator API is running at http://localhost:5050' } catch { echo 'Calculator API is not responding' }"

echo Testing Prometheus...
powershell -Command "try { Invoke-WebRequest -Uri http://localhost:9090 -UseBasicParsing | Out-Null; echo 'Prometheus is running at http://localhost:9090' } catch { echo 'Prometheus is not responding' }"

echo Testing Grafana...
powershell -Command "try { Invoke-WebRequest -Uri http://localhost:3001 -UseBasicParsing | Out-Null; echo 'Grafana is running at http://localhost:3001 (admin/admin)' } catch { echo 'Grafana is not responding' }"

echo Testing SonarQube...
powershell -Command "try { Invoke-WebRequest -Uri http://localhost:9000 -UseBasicParsing | Out-Null; echo 'SonarQube is running at http://localhost:9000' } catch { echo 'SonarQube is not responding (may take a few minutes to start)' }"

echo.
echo Setup completed!
echo.
echo Access URLs:
echo   Application: http://localhost:5050
echo   Frontend: http://localhost:5050/index.html
echo   Health Check: http://localhost:5050/health
echo   Metrics: http://localhost:5050/metrics
echo   Prometheus: http://localhost:9090
echo   Grafana: http://localhost:3001 (admin/admin)
echo   SonarQube: http://localhost:9000
echo.
echo Run tests: npm test
echo.
pause
