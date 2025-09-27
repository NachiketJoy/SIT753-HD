pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'calculator-api'
        DOCKER_TAG = "${BUILD_NUMBER}"
        SONAR_TOKEN = credentials('sonar-token')
        SNYK_TOKEN = credentials('snyk-token')

        DOCKER_REGISTRY = 'docker.io'
        DOCKER_NAMESPACE = 'njoy10'

        NOTIFICATION_EMAIL = 'njoyekurun@gmail.com'
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

        stage('Install & Build') {
            steps {
                echo 'Installing dependencies...'
                bat 'npm ci'
                echo 'Building the application...'
                bat 'npm run build'

                script {
                    def artifactName = "calculator-api-${BUILD_NUMBER}.zip"
                    bat "powershell Compress-Archive -Path server.js,package.json,public -DestinationPath ${artifactName} -Force"
                    archiveArtifacts artifacts: artifactName, fingerprint: true
                }
            }
        }

        stage('Lint') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'node_modules\\.bin\\eslint .'
                }
                // bat 'npx eslint .'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // bat 'npm test'
                bat 'node_modules\\.bin\\jest --ci --reporters=default --reporters=jest-junit'
                bat 'npm run test:coverage'
            }
            post {
                always {
                    // Requires jest-junit for XML output
                    junit 'test-results.xml'
                    publishCoverage adapters: [
                        lcovAdapter('coverage/lcov.info')
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
                bat "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
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
            script {
                def emailTo = env.CHANGE_AUTHOR_EMAIL ?: env.NOTIFICATION_EMAIL
                emailext (
                    subject: "Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                    body: "Build ${env.BUILD_NUMBER} completed successfully.",
                    to: emailTo
                )
            }
        }

        failure {
            echo 'Pipeline failed!'
            script {
                def emailTo = env.CHANGE_AUTHOR_EMAIL ?: env.NOTIFICATION_EMAIL
                emailext (
                    subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                    body: "Build ${env.BUILD_NUMBER} failed. Please check the logs.",
                    to: emailTo
                )
            }
        }

        unstable {
            echo 'Pipeline unstable!'
        }
    }
}
