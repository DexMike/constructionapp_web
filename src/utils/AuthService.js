import { Auth } from 'aws-amplify';

class AuthService {
  static async refreshSession() {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const currentSession = await Auth.currentSession();
      await cognitoUser.refreshSession(currentSession.refreshToken, (err, session) => {
        // console.log('session', err, session);
        // const { idToken, refreshToken, accessToken } = session;
        // do whatever you want to do now :)
      });
      return currentSession;
    } catch (e) {
      console.log('Unable to refresh Token', e);
    }
    return {};
  }

  static isNonAuthPath(path) {
    const nonAuthPaths = [
      '/','/auth', '/actuator', '/users/email', '/users/email', '/users/mobile', '/usermanagement/signin',
      '/appmeta', '/login/logs', '/users/email/company'
    ];
    nonAuthPaths.some(nonAuthPath => path.indexOf(nonAuthPath) > -1);
  }

  static async logOut() {
    try {
      localStorage.removeItem('filters');
      await Auth.signOut();
    } catch (err) {
      // POST https://cognito-idp.us-east-1.amazonaws.com/ 400
      // Uncaught (in promise) {code: "NotAuthorizedException",
      // name: "NotAuthorizedException", message: "Access Token has been revoked"}
      window.location = '/login';
    }
  }
}

export default AuthService;
