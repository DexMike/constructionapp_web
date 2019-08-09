import AgentService from './AgentService';

const PATH = '/users';

class UserService extends AgentService {
  static async getUsers(pageSize, pageNumber) {
    let response;
    if (pageSize) {
      response = await super.get(`${PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}`);
    } else {
      response = await super.get(PATH);
    }
    return (response);
  }

  static async getUsersByCompanyId(companyId, pageSize, pageNumber) {
    let response;
    if (pageSize) {
      response = await this.get(`/companies/${companyId}${PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}`);
    } else {
      response = await this.get(`/companies/${companyId}${PATH}`);
    }
    return (response);
  }

  // static async getUserByEmail(email) {
  //   const response = await this.get(`${PATH}/email/${email}`);
  //   return (response);
  // }

  static async getUserByEmail(user) {
    const response = await this.post(`${PATH}/email`, user);
    return (response);
  }

  static async getDriverByUserId(id) {
    const response = await this.get(`/users/${id}/driver`);
    return (response);
  }

  static async getUsersByCompanyIdAndType(companyId, type) {
    const response = await this.get(`/company/${companyId}/type/${type}/users`);
    return (response);
  }

  static async getDriversWithUserInfoByCompanyId(companyId) {
    const response = await this.get(`/companies/${companyId}/drivers`);
    return (response);
  }

  static async getEnabledDriversWithUserInfoByCompanyId(companyId) {
    const response = await this.get(`/companies/${companyId}/drivers/enabled`);
    return (response);
  }

  static async getUserById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getUserByUsername(username) {
    const response = await this.post(`/username?email=${username}`);
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

  static async getAdminByCompanyId(id) {
    const response = await this.get(`/companies/${id}/admin${PATH}`);
    return (response);
  }

  static async getDriverByBookingId(bookingId) {
    const response = await this.get(`/booking_equipments/${bookingId}/drivers/users`);
    return (response);
  }

  static async getDriverByBookingEquipmentId(id) {
    const response = await this.get(`/booking_equipments/${id}/driver`);
    return (response);
  }
}

export default UserService;
