import AgentService from './AgentService';

const PATH = '/equipments';

class EquipmentService extends AgentService {
  static async getEquipments() {
    const response = await super.get(PATH);
    return (response);
  }
}

export default EquipmentService;
