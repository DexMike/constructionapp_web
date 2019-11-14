import AgentService from './AgentService';

const PATH = '/profile';

class ProfileService extends AgentService {
  static async getProfile() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getProfilePreLogin(accessToken, idToken) {
    const response = await super.getPreLogin(PATH, accessToken, idToken);
    return (response);
  }

  static getDefaultProfile() {
    return {
      companyType: 'Customer',
      companyId: 0,
      userId: 0,
      driverId: 0,
      isAdmin: 0
    };
  }
}

export default ProfileService;
