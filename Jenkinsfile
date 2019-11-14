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
    "newqa":   "QA",
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
    "newqa":   "qa",
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
    /*
    AWS_REGION           = "us-east-1"
    GOOGLE_MAPS_API      = "AIzaSyDUwWVXa6msmVdA-oGjnvhFXtvTzkvw2Jg"
    MAPBOX_API           = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA"
    HERE_MAPS_APP_ID     = "FlTEFFbhzrFwU1InxRgH"
    HERE_MAPS_APP_CODE   = "gTgJkC9u0YWzXzvjMadDzQ"
    HERE_MAPS_API_KEY    = "7ObLMmc-zYDiOYIxaFFuuOZ0BSS0tC6qj5xV9yexR5A"
    APP_ENV              = app_env()
    API_ENDPOINT         = "api.${domain()}"
    AWS_USER_POOL_ID     = user_pool_id()
    AWS_IDENTITY_POOL_ID = pool_id()
    AWS_UPLOADS_BUCKET   = "uploads.${domain()}"
    AWS_UPLOADS_ENDPOINT = "https://uploads.${domain()}"
    CLOUDFRONT_ID        = cloudfront_id()

    AWS_USER_POOL_WEB_CLIENT_ID = app_client_id()
    */
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
      slackSend(baseUrl: 'https://trelarlogistics.slack.com/services/hooks/jenkins-ci/', botUser: true, channel: '#devops', color: 'RED', message: "Stargate ${ENVIRONMENT} deploy finished successfully", teamDomain: 'trelarlogistics.slack.com', token: 'bKwJFYhX22RgyoqU0wfwfHny')
    }
    failure {
      slackSend(baseUrl: 'https://trelarlogistics.slack.com/services/hooks/jenkins-ci/', botUser: true, channel: '#devops', color: 'RED', message: "Stargate ${ENVIRONMENT} deploy failed", teamDomain: 'trelarlogistics.slack.com', token: 'bKwJFYhX22RgyoqU0wfwfHny')
    }
  }
}
