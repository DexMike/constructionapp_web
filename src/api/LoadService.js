import AgentService from './AgentService';

const PATH = '/loads';

class LoadService extends AgentService {
  static async getLoadById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async updateLoad(load) {
    const response = await this.put(PATH, load);
    return (response);
  }

  static async getLoadsByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}`);
    return (response);
  }
}

export default LoadService;
