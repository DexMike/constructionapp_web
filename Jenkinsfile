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
}
