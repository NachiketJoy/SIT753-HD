#!/bin/bash

# Calculator API - DevOps Pipeline Setup Script
echo "🚀 Setting up Calculator API DevOps Pipeline..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Some features may not work."
fi

print_status "Installing Node.js dependencies..."
if command -v npm &> /dev/null; then
    npm install
    print_status "Dependencies installed successfully!"
else
    print_warning "npm not found. Skipping dependency installation."
fi

print_status "Building Docker images..."
docker-compose build

print_status "Starting development environment..."
docker-compose up -d

print_status "Waiting for services to start..."
sleep 30

# Check if services are running
print_status "Checking service health..."

# Check main application
if curl -f http://localhost:5050/health &> /dev/null; then
    print_status "✅ Calculator API is running at http://localhost:5050"
else
    print_error "❌ Calculator API is not responding"
fi

# Check Prometheus
if curl -f http://localhost:9090 &> /dev/null; then
    print_status "✅ Prometheus is running at http://localhost:9090"
else
    print_warning "⚠️  Prometheus is not responding"
fi

# Check Grafana
if curl -f http://localhost:3001 &> /dev/null; then
    print_status "✅ Grafana is running at http://localhost:3001 (admin/admin)"
else
    print_warning "⚠️  Grafana is not responding"
fi

# Check SonarQube
if curl -f http://localhost:9000 &> /dev/null; then
    print_status "✅ SonarQube is running at http://localhost:9000"
else
    print_warning "⚠️  SonarQube is not responding (may take a few minutes to start)"
fi

print_status "🎉 Setup completed!"
echo ""
echo "📋 Access URLs:"
echo "   • Application: http://localhost:5050"
echo "   • Frontend: http://localhost:5050/index.html"
echo "   • Health Check: http://localhost:5050/health"
echo "   • Metrics: http://localhost:5050/metrics"
echo "   • Prometheus: http://localhost:9090"
echo "   • Grafana: http://localhost:3001 (admin/admin)"
echo "   • SonarQube: http://localhost:9000"
echo ""
echo "🧪 Run tests:"
echo "   • npm test"
echo "   • npm run test:coverage"
echo ""
echo "🔧 Development commands:"
echo "   • npm run dev (development server)"
echo "   • npm run lint (code linting)"
echo "   • npm run security:audit (security audit)"
echo ""
echo "🐳 Docker commands:"
echo "   • docker-compose up -d (start all services)"
echo "   • docker-compose down (stop all services)"
echo "   • docker-compose logs -f web (view application logs)"
echo ""
print_status "Happy coding! 🚀"
