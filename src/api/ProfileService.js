import AgentService from './AgentService';

const PATH = '/profile';

class ProfileService extends AgentService {
  static async getProfile() {
    const response = await super.get(PATH);
    return (response);
  }
}

export default ProfileService;
