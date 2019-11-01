import AgentService from './AgentService';

const PATH = '/equipment-details';

class EquipmentDetailService extends AgentService {
  static async getDefaultDriverList(id) {
    const response = await this.get(`${PATH}/companies/${id}/default-drivers`);
    return (response);
  }

  static async getMostRecentEnabledDriverByCompany(id) {
    const response = await this.get(`${PATH}/companies/${id}/most-recent-driver-enabled`);
    return (response);
  }
}

export default EquipmentDetailService;
