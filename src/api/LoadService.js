import AgentService from './AgentService';

const PATH = '/loads';

class LoadService extends AgentService {

  static async getLoadById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async updateLoad(id, load) {
    const response = await this.put(`${PATH}/${id}`, load);
    return (response);
  }

  static async getLoadsByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}`);
    return (response);
  }

  static async getLoadsByBookingEquipmentId(id) {
    const response = await this.get(`/bookingequipments/${id}${PATH}`);
    return (response);
  }
}

export default LoadService;
