import { Auth } from 'aws-amplify';

class AuthService {
  static async refreshSession() {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const currentSession = await Auth.currentSession();
      await cognitoUser.refreshSession(currentSession.refreshToken, (err, session) => {
        console.log('session', err, session);
        // const { idToken, refreshToken, accessToken } = session;
        // do whatever you want to do now :)
      });
      return currentSession;
    } catch (e) {
      console.log('Unable to refresh Token', e);
    }
    return {};
  }
}

export default AuthService;
