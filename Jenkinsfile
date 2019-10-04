// All of these need to be dynamic and not hard coded.
def env_fullname() {
  def name = [

    "master":  "Production",
    "infra":   "Infrastructure",
    "dev":     "Dev",
    "demo":    "Demo",
    "qa":      "QA",
    "staging": "Staging"
  ]
  return name["${BRANCH_NAME}"]
}

def app_env() {
  def name = [

    "master":  "Prod",
    "infra":   "Infra",
    "dev":     "Dev",
    "demo":    "Demo",
    "qa":      "QA",
    "staging": "Staging"
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
    "staging": "staging"
  ]
  return name["${BRANCH_NAME}"]
}

def cloudfront_id() {
  def id_map = [

    "master":  "E1AHYHKY2WVINB",
    "infra":   "ELIUNX04399Z7",
    "dev":     "E1LAYT176RPT8J",
    "demo":    "E3VLWJXIOSHO30",
    "qa":      "E2W2Q6ROFYLZDI",
    "staging": "E3KJAHZFANQPXC"
  ]
  return id_map["${BRANCH_NAME}"]
}

def user_pool_id() {
  def id_map = [

    "master":  "us-east-1_K9gWgb955",
    "infra":   "us-east-1_zBOM7p33c",
    "dev":     "us-east-1_ztq1xhttu",
    "demo":    "us-east-1_32MZPld6o",
    "qa":      "us-east-1_Yrq15MnQf",
    "staging": "us-east-1_GkxSiARkF"
  ]
  return id_map["${BRANCH_NAME}"]
}

def app_client_id() {
  def id_map = [
    "master":  "7cqqgiu2booqasov3a5gc83lg8",
    "infra":   "48keajv6u26cccennps27qhs8",
    "dev":     "52tgalb82hnrv338ambff0korj",
    "demo":    "5p0qgf8n9ldmhaup4q0qba84j3",
    "qa":      "6tlhjedvj2k9e50l98t930i4gu",
    "staging": "3sahkf5trdejfrrfujb0rdt1t9"
  ]
  return id_map["${BRANCH_NAME}"]
}

def pool_id() {
  def id_map = [

    "master":  "us-east-1:4c25b22c-c79d-4d0c-9dfe-d76172741a33",
    "infra":   "us-east-1:d17c2c38-300b-40af-be60-986cf16e3a70",
    "dev":     "us-east-1:602b5b90-1686-47cd-aaa9-39cf385699bd",
    "demo":    "us-east-1:f96db308-49c5-4fc0-95b1-c3ff9513faa3",
    "qa":      "us-east-1:340c27b0-2315-48cf-9290-588039295b26",
    "staging": "us-east-1:2076fc41-91e6-4796-b306-ac52c6b24486"
  ]
  return id_map["${BRANCH_NAME}"]
}

def domain() {
  if ("${BRANCH_NAME}" == "master") {
    return "mytrelar.com"
  }
  else {
    return "${env_shortname()}.mytrelar.com"
  }
}

pipeline {
  options {
    disableConcurrentBuilds()
  }

  environment {
    ENVIRONMENT = env_fullname()
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
      steps {
       sh "aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths '/*'"
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
