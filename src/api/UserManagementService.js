import AgentService from './AgentService';

const PATH = '/usermanagement';

class UserManagementService extends AgentService {
  static async findCognito(cognitoRequest) {
    const response = await this.post(`${PATH}/hascognito`, cognitoRequest);
    return (response);
  }

  static async signIn(signInRequest) {
    const response = await this.post(`${PATH}/signin`, signInRequest);
    return response;
  }
}

export default UserManagementService;
