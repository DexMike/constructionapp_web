import AgentService from './AgentService';

const PATH = '/gpstrackings';

class GPSPointService extends AgentService {

  static async getGPSTrackings() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getGPSTrackingById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  // Todo: future refactor
  static async getGPSTrackingsByBookingId(bookingId) {
    const response = await this.get(`/bookings/${bookingId}${PATH}`);
    return (response);
  }

  // Todo: future refactor
  // static async getGPSTrackingsByBookingEquipmentId(bookingEquipmentId) {
  //   const response = await this.get(`/bookingequipment/${bookingEquipmentId}${PATH}`);
  //   return (response);
  // }

  static async createGPSTracking(gpsTracking) {
    const response = await super.post(PATH, gpsTracking);
    return (response);
  }

  static async updateGPSTracking(gpsTracking) {
    const response = await this.put(PATH, gpsTracking);
    return (response);
  }

  static async deleteGPSTrackingById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  // static async listGPSTrackings() {
  //   const response = await this.get(PATH);
  //   return (response);
  // }
}

export default GPSPointService;
