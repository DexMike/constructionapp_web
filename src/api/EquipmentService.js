import AgentService from './AgentService';

const PATH = '/equipments';

class EquipmentService extends AgentService {
  static async getEquipments() {
    const response = await super.get(PATH);
    return (response);
  }

  static async createEquipment(equipment) {
    const response = await super.post(PATH, equipment);
    return (response);
  }

  static async updateEquipment(equipment) {
    const response = await this.put(PATH, equipment);
    return (response);
  }

  static async deleteEquipmentById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default EquipmentService;
