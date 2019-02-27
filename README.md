# Stargate
## Architecture
![aws web architecture](/design/aws-web-architecture.png)


## Running the App locally
npm i 

if it is the first time running or some new libraries got added, doesn't hurt to just always run it

Grab config variables:
Copy .env.example to .env.local in your project root directory

npm start

It runs on port 8082 by default, you can change the port in the webpack.config.babel.js under dev server

## Linter
linter style guide https://github.com/airbnb/javascript/tree/master/react

To run the linter for your project 'npm run lint'

Please use it as a guide before committing code.  It is based off of airbnb's 
javascript style guide https://github.com/airbnb/javascript

You can integrate the linting rules with your fav IDE or text editor so when you code it will let you know if there 
are any errors/warnings

For Webstorm: Go to Preferences -> Language & Frameworks -> JavaScript ->
Code Quality Tools -> ESLint

.eslintrc is the file for the linter config.

For VS Code there is a guide over here https://travishorn.com/setting-up-eslint-on-vs-code-with-airbnb-javascript-style-guide-6eb78a535ba6

NOTE: If you are on Windows you might get this error [eslint] Expected linebreaks to be 'LF' but found 'CRLF' [linebreak-style] ...

You can fix by running 'npm run lint -- --fix' https://github.com/diegohaz/arc/issues/171

## Deploying the app

npm run deploy

NOTE: currently script does not clear the cache on AWS CloudFront, if you don't want to wait for the cache to clear to see the new change you can manually clear the cache by going into the AWS console for CloudFront and invalidate the cache.

## Environment

Currently there is nothing in place for switching out the environments, need to start using dotenv.  For now the only config is the Backend API URL which is located in AgentService.js.  You need to manually alter this file to point to different environments currently.

NOTE: DO NOT DEPLOY unless pointing to the correct backend endpoint which in this case is the dev one not the localhost.
Do not commit the AgentService.js file if it is pointing to localhost.

## Formatting

There is a .editorconfig file for telling the editor how to auto 
format the code.

## Unit Tests

TODO

## Integration Tests

TODO

## CICD 

TODO
