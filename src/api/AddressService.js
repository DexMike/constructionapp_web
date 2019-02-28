import AgentService from './AgentService';

const PATH = '/addresses';

class AddressService extends AgentService {
  static async getAddresses() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getAddressById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async createAddress(address) {
    const response = await super.post(PATH, address);
    return (response);
  }

  static async updateAddress(address) {
    const response = await this.put(PATH, address);
    return (response);
  }

  static async deleteAddressById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default AddressService;
