// All of these need to be dynamic and not hard coded.
def env_fullname() {
  def name = [

    "master":  "Production",
    "infra":   "Infrastructure",
    "dev":     "Dev",
    "demo":    "Demo",
    "qa":      "QA",
    "staging": "Staging",
    "cat":     "CAT",
  ]
  return name["${BRANCH_NAME}"]
}

def env_shortname() {
  def name = [

    "master":  "prod",
    "infra":   "infra",
    "dev":     "dev",
    "demo":    "demo",
    "qa":      "qa",
    "staging": "staging",
    "cat":     "cat",
  ]
  return name["${BRANCH_NAME}"]
}

def domain() {
  if ("${BRANCH_NAME}" == "master") {
    return "mytrelar.com"
  }
  else {
    return "${env_shortname()}.mytrelar.com"
  }
}

def cloudfront_id() {
  def id_map = [

    "master":  "E1AHYHKY2WVINB",
    "infra":   "E1EGZGUUXJ1IES",
    "demo":    "E3VLWJXIOSHO30",
    "qa":      "E2W2Q6ROFYLZDI",
    "cat":     "E1XUS55INHEOEY",
    "staging": "E3KJAHZFANQPXC"
  ]
  return id_map["${BRANCH_NAME}"]
}

pipeline {
  options {
    disableConcurrentBuilds()
  }

  environment {
    ENVIRONMENT = env_fullname()
  }
  agent {
    node {
      label 'master'
    }
  }
  stages {
    stage("Install NPM packages") {
      steps {
        sh 'npm install'
      }
    }
    stage("Clean dist") {
      steps {
        dir('dist') {
          deleteDir()
        }
        sh 'mkdir dist'
      }
    }
    stage ("Build HTML") {
      steps {
        sh 'npx babel-node tools/buildHtml.js'
      }
    }
    stage("Build Bundle") {
      steps {
        slackSend(baseUrl: 'https://trelarlogistics.slack.com/services/hooks/jenkins-ci/', botUser: true, channel: env_shortname() , color: 'RED', message: "Stargate ${ENVIRONMENT} bundle started", teamDomain: 'trelarlogistics.slack.com', token: 'bKwJFYhX22RgyoqU0wfwfHny')
        sh 'npx babel-node --max_old_space_size=4096 tools/build.js'
      }
    }
    stage("Sync to S3") {
      steps {
        sh "aws s3 sync dist/ s3://app.${domain()}"
      }
    }
    stage("Invalidate cloudfront") {
      when {
        expression { cloudfront_id() }
      }
      steps {
       sh "aws cloudfront create-invalidation --distribution-id ${cloudfront_id()} --paths '/*'"
     }
    }
    stage('Clean up') {
      steps {
        cleanWs cleanWhenAborted: false, cleanWhenFailure: false, cleanWhenNotBuilt: false, cleanWhenUnstable: false, deleteDirs: true
      }
    }
  }
  post {
    success {
      slackSend(baseUrl: 'https://trelarlogistics.slack.com/services/hooks/jenkins-ci/', botUser: true, channel: env_shortname() , color: 'RED', message: "Stargate ${ENVIRONMENT} deploy successful", teamDomain: 'trelarlogistics.slack.com', token: 'bKwJFYhX22RgyoqU0wfwfHny')
    }
    failure {
      slackSend(baseUrl: 'https://trelarlogistics.slack.com/services/hooks/jenkins-ci/', botUser: true, channel: env_shortname() , color: 'RED', message: "Stargate ${ENVIRONMENT} deploy failed", teamDomain: 'trelarlogistics.slack.com', token: 'bKwJFYhX22RgyoqU0wfwfHny')
    }
  }
}
