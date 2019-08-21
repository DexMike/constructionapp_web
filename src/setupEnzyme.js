import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import mockGlobals from '../mockGlobals';
import * as path from 'path';
import dotenv from 'dotenv';
import Amplify from 'aws-amplify';
import { Response, Request, Headers, fetch } from 'whatwg-fetch';

global.Response = Response;
global.Request = Request;
global.Headers = Headers;
global.fetch = fetch;

dotenv.config({
  path: path.resolve(__dirname + './../.env.local')
});

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: process.env.AWS_REGION,
    userPoolId: process.env.AWS_USER_POOL_ID,
    identityPoolId: process.env.AWS_IDENTITY_POOL_ID,
    userPoolWebClientId: process.env.AWS_USER_POOL_WEB_CLIENT_ID
  },
  Storage: {
    AWSS3: {
      bucket: process.env.AWS_UPLOADS_BUCKET,
      region: process.env.AWS_REGION
    }
  }
});

configure({ adapter: new Adapter() });

// mockGlobals();
