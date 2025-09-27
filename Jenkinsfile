pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'calculator-api'
        DOCKER_TAG = "${BUILD_NUMBER}"
        SONAR_TOKEN = credentials('sonar-token')
        SNYK_TOKEN = credentials('snyk-token')
        
        // For local development, you can leave this empty or use Docker Hub
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_NAMESPACE = 'njoy10'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = bat(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building the application...'
                bat 'npm install'
                bat 'npm run build'
                
                // Create build artifact
                bat 'powershell Compress-Archive -Path server.js,package.json,public -DestinationPath calculator-api-${BUILD_NUMBER}.zip -Force'
                archiveArtifacts artifacts: 'calculator-api-${BUILD_NUMBER}.zip', fingerprint: true
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                bat 'npm test'
                bat 'npm run test:coverage'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results.xml'
                    publishCoverage adapters: [
                        jacocoAdapter('coverage/lcov.info')
                    ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                }
            }
        }
        
        stage('Code Quality') {
            steps {
                echo 'Running SonarQube analysis...'
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        bat "${scannerHome}\\bin\\sonar-scanner.bat " +
                            "-Dsonar.projectKey=calculator-api " +
                            "-Dsonar.sources=. " +
                            "-Dsonar.exclusions=node_modules/**,coverage/**,tests/** " +
                            "-Dsonar.tests=tests " +
                            "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info " +
                            "-Dsonar.login=${SONAR_TOKEN}"
                    }
                }
            }
        }
        
        stage('Security') {
            steps {
                echo 'Running security analysis...'
                bat 'npm audit --audit-level moderate'
                bat 'npx snyk test --severity-threshold=high'
            }
        }
        
        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                bat 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
            }
        }
        
        stage('Deploy to Test') {
            steps {
                echo 'Deploying to test environment...'
                bat 'docker-compose -f docker-compose.test.yml down'
                bat 'docker-compose -f docker-compose.test.yml up -d'
                bat 'timeout /t 30 /nobreak'
                bat 'powershell -Command "try { Invoke-WebRequest -Uri http://localhost:5050/health -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }"'
            }
        }
        
        stage('Release to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Releasing to production...'
                bat 'docker-compose -f docker-compose.prod.yml down'
                bat 'docker-compose -f docker-compose.prod.yml up -d'
                bat 'timeout /t 30 /nobreak'
                bat 'powershell -Command "try { Invoke-WebRequest -Uri http://localhost/health -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }"'
            }
        }
        
        stage('Monitoring Setup') {
            steps {
                echo 'Setting up monitoring...'
                bat 'docker-compose up -d prometheus grafana sonarqube'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution completed'
            cleanWs()
        }
        
        success {
            echo 'Pipeline succeeded!'
            // Send success notification
            emailext (
                subject: "Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build ${env.BUILD_NUMBER} completed successfully.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        
        failure {
            echo 'Pipeline failed!'
            // Send failure notification
            emailext (
                subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build ${env.BUILD_NUMBER} failed. Please check the logs.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        
        unstable {
            echo 'Pipeline unstable!'
        }
    }
}
