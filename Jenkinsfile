
pipeline {
  options {
    disableConcurrentBuilds()
  }

  environment {
    ENVIRONMENT = env_fullname("${BRANCH_NAME}")
    AWS_REGION           = "us-east-1"
    GOOGLE_MAPS_APII     = "AIzaSyDUwWVXa6msmVdA-oGjnvhFXtvTzkvw2Jg"
    MAPBOX_API           = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA"
    HERE_MAPS_APP_ID     = "FlTEFFbhzrFwU1InxRgH"
    HERE_MAPS_APP_CODE   = "gTgJkC9u0YWzXzvjMadDzQ"
    HERE_MAPS_API_KEY    = "7ObLMmc-zYDiOYIxaFFuuOZ0BSS0tC6qj5xV9yexR5A"
    APP_ENV              = app_env("${BRANCH_NAME}")
    API_ENDPOINT         = api_endpoint()
    AWS_USER_POOL_ID     = user_pool_id("${BRANCH_NAME}")
    AWS_IDENTITY_POOL_ID = pool_id("${BRANCH_NAME}")
    AWS_UPLOADS_BUCKET   = uploads_bucket()
    AWS_UPLOADS_ENDPOINT = sprintf("https://%s", uploads_bucket())
    CLOUDFRONT_ID        = cloudfront_id("${BRANCH_NAME}")

    AWS_USER_POOL_WEB_CLIENT_ID = app_client_id("${BRANCH_NAME}")
  }
  agent {
    node {
      label 'master'
    }
  }
  stages {
    stage("Install NPM packages") {
      steps {
        sh 'echo foobar'
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

// All of these need to be dynamic and not hard coded.
def env_fullname(String lookup) {
  def name = [

    "master":  "Production",
    "infra":   "Infrastructure",
    "dev":     "Dev",
    "demo":    "Demo",
    "qa":      "QA",
    "staging": "Staging"
  ]
  return name["${lookup}"]
}
