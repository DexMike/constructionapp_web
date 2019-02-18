import AgentService from './AgentService';

const PATH = '/profile';

class ProfileService extends AgentService {
  static async getProfile() {
    return await super.get(PATH);
  }
}

export default ProfileService;
