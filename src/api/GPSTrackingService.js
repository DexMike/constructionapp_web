import AgentService from './AgentService';

const PATH = '/gpstrackings';

class GPSTrackingService extends AgentService {
  static async getGPSTrackingByLoadId(loadId) {
    const url = `/loads/${loadId}${PATH}`;
    const response = await super.get(url);
    return (response);
  }
}

export default GPSTrackingService;
