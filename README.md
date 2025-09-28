# Calculator API - DevOps Pipeline Project

## Overview
A Node.js calculator API with a complete DevOps pipeline including Jenkins CI/CD, testing, code quality analysis, security scanning, monitoring, and deployment automation.

## Features
- **RESTful API** with exponentiation and modulo operations
- **Interactive Frontend** with modern UI
- **Comprehensive Testing** with Jest
- **Code Quality Analysis** with SonarQube
- **Security Scanning** with Snyk and Trivy
- **Monitoring & Alerting** with Prometheus and Grafana
- **Containerized Deployment** with Docker
- **CI/CD Pipeline** with Jenkins

## API Endpoints

### Core Endpoints
- `GET /` - Welcome message
- `GET /health` - Health check with uptime and timestamp
- `GET /metrics` - Prometheus metrics endpoint
- `GET /index.html` - Frontend interface

### Calculator Endpoints
- `POST /exponentiate` - Calculate base^exponent
- `POST /modulo` - Calculate dividend % divisor
- `POST /` - Generic operation handler

### Example Usage
```bash
# Exponentiation
curl -X POST http://localhost:5050/exponentiate \
  -H "Content-Type: application/json" \
  -d '{"num1": 2, "num2": 3}'
# Response: {"operation": "exponentiation", "num1": 2, "num2": 3, "result": 8}

# Modulo
curl -X POST http://localhost:5050/modulo \
  -H "Content-Type: application/json" \
  -d '{"num1": 10, "num2": 3}'
# Response: {"operation": "modulo", "num1": 10, "num2": 3, "result": 1}
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Jenkins (for CI/CD pipeline)

### Local Development
```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Access application
open http://localhost:3000
```

### Docker Deployment

```cmd
# Using batch script
setup.bat

# Or manually
docker-compose up -d
```

#### Access Services
- **Application**: http://localhost:5050
- **Frontend**: http://localhost:5050/index.html
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **SonarQube**: http://localhost:9000

## DevOps Pipeline

### Jenkins Pipeline Stages
1. **Checkout** - Source code retrieval
2. **Build** - Application build and artifact creation
3. **Test** - Unit and integration tests with coverage
4. **Code Quality** - SonarQube analysis
5. **Security** - Snyk and Trivy vulnerability scanning
6. **Docker Build** - Container image creation
7. **Deploy to Test** - Test environment deployment
8. **Release to Production** - Production deployment
9. **Monitoring Setup** - Monitoring stack deployment

### Tools Integration
- **Testing**: Jest with coverage reporting
- **Code Quality**: SonarQube with quality gates
- **Security**: Snyk (dependencies) + Trivy (Docker images)
- **Monitoring**: Prometheus + Grafana
- **Deployment**: Docker Compose for multi-environment

## Project Structure
```
├── public/
│   └── index.html          # Frontend interface
├── tests/
│   └── server.test.js      # Test suite
├── grafana/
│   └── dashboards/         # Grafana dashboards
├── server.js               # Main application
├── package.json            # Dependencies and scripts
├── Dockerfile              # Container definition
├── docker-compose.yml      # Development environment
├── docker-compose.test.yml # Test environment
├── docker-compose.prod.yml # Production environment
├── Jenkinsfile             # CI/CD pipeline
├── prometheus.yml          # Monitoring configuration
├── sonar-project.properties # SonarQube configuration
└── .snyk                   # Security policy
```

## Monitoring & Observability

### Metrics Collected
- HTTP request count and errors
- Calculation operations performed
- Memory usage and uptime
- System metrics (CPU, disk, network)

### Dashboards
- Application performance metrics
- System resource utilization
- Error rates and response times


## Security Features
- Dependency vulnerability scanning
- Docker image security analysis
- Code quality and security rules

## Environment Configuration

#### Development
```cmd
docker-compose up -d
```

#### Testing
```cmd
docker-compose -f docker-compose.test.yml up -d
```

#### Production
```cmd
docker-compose -f docker-compose.prod.yml up -d
```
