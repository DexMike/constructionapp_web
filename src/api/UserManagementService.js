import AgentService from './AgentService';

const PATH = '/usermanagement';

class UserManagementService extends AgentService {
  static async findCognito(cognitoRequest) {
    const response = await this.post(`${PATH}/hascognito`, cognitoRequest);
    return (response);
  }
}

export default UserManagementService;
