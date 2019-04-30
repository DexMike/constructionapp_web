import AgentService from './AgentService';

const PATH = '/gpstracking';

class GPSTrackingService extends AgentService {
  static async getGPSTrackingByBookingEquipmentId(bookingEquipmentId) {
    const url = `/equipment/${bookingEquipmentId}${PATH}`;
    console.log(url);
    const response = await super.get(url);
    return (response);
  }
}

export default GPSTrackingService;