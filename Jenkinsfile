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
        stage('Initialize qa') {
          when {
            branch 'qa'
          }
          steps {
            echo 'Starting qa'
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
            slackSend botUser: true, 
              channel: 'jenkins', 
              color: 'good', 
              message: 'Stargate dev deploy finished successfully', 
              teamDomain: 'trelarlogistics', 
              tokenCredentialId: 'b2e400d0-bea2-4d00-946e-ba25ced0ff09'
          }
        }
        stage('Build / Package demo') {
          when {
            branch 'demo'
          }
          steps {
            sh '''npm install
npm run deployDemo'''
            slackSend botUser: true, 
              channel: 'jenkins', 
              color: 'good', 
              message: 'Stargate demo deploy finished successfully', 
              teamDomain: 'trelarlogistics', 
              tokenCredentialId: 'b2e400d0-bea2-4d00-946e-ba25ced0ff09'
          }
        }
        stage('Build / Package demo') {
          when {
            branch 'qa'
          }
          steps {
            sh '''npm install
npm run deployQa'''
            slackSend botUser: true, 
              channel: 'jenkins', 
              color: 'good', 
              message: 'Stargate qa deploy finished successfully', 
              teamDomain: 'trelarlogistics', 
              tokenCredentialId: 'b2e400d0-bea2-4d00-946e-ba25ced0ff09'
          }
        }
      }
    }
  }
}
