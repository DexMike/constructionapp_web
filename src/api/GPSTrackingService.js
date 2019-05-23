import AgentService from './AgentService';

const PATH = '/gpstrackings';

class GPSTrackingService extends AgentService {
  static async getGPSTrackingByBookingEquipmentId(bookingEquipmentId) {
    const url = `/equipment/${bookingEquipmentId}${PATH}`;
    const response = await super.get(url);
    return (response);
  }

  static async getGPSTrackingByLoadId(loadId) {
    const url = `/load/${loadId}${PATH}`;
    const response = await super.get(url);
    return (response);
  }
}

export default GPSTrackingService;
