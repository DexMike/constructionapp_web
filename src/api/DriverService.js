import AgentService from './AgentService';

const PATH = '/drivers';

class DriverService extends AgentService {
  static async getDrivers() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getDriverById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async createDriver(equipment) {
    const response = await super.post(PATH, equipment);
    return (response);
  }

  static async updateDriver(equipment) {
    const response = await this.put(PATH, equipment);
    return (response);
  }

  static async deleteDriverById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default DriverService;