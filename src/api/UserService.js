import AgentService from './AgentService';

const PATH = '/users';

class UserService extends AgentService {
  static async getUsers() {
    const response = await super.get(PATH);
    return (response);
  }

  // getUsersByCompanyIdAndType
  // input
  //    companyID: id of company
  //    type: of user from Lookups; use All to get everything
  //    TODO: NOTE: type is being ignored right now
  // Usage:
  // const equipments = await UserService.getUsersByCompanyIdAndType(
  //   profile.companyId,
  //   'All'
  // );
  static async getUsersByCompanyIdAndType(companyId, type) {
    const response = await this.get(`/company/${companyId}/type/${type}/users`);
    return (response);
  }

  static async getDriversWithUserInfo() {
    const response = await this.get('/driversinfo');
    return (response);
  }

  static async getUserById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async createUser(user) {
    const response = await super.post(PATH, user);
    return (response);
  }

  static async updateUser(user) {
    const response = await this.put(PATH, user);
    return (response);
  }

  static async deleteUserById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default UserService;
