pipeline {
  agent any
  stages {
    stage('Initialize') {
      parallel {
        stage('Initialize dev') {
          when {
            branch 'dev'
          }
          steps {
            echo 'Starting Dev'
          }
        }
        stage('Initialize demo') {
          when {
            branch 'demo'
          }
          steps {
            echo 'Starting Demo'
          }
        }
      }
    }
    stage('Build / Package') {
      parallel {
        stage('Build / Package dev') {
          when {
            branch 'dev'
          }
          steps {
            sh '''npm install
npm run deployDev'''
          }
        }
        stage('Build / Package demo') {
          when {
            branch 'demo'
          }
          steps {
            sh '''npm install
npm run deployDemo'''
          }
        }
      }
    }
  }
  post {
    always {
      slackSend botUser: true, 
      channel: 'jenkins', 
      color: 'good', 
      message: '${env.JOB_NAME} completed ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)', 
      teamDomain: 'trelarlogistics', 
      tokenCredentialId: 'b2e400d0-bea2-4d00-946e-ba25ced0ff09'
    }
  }
}
