// consider using this type of file (independent from AgentService)
// in order to keep al files separated
import AgentService from './AgentService';

const PATH = '/lookups';

class LookupsService extends AgentService {
  static async getLookups() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getLookupsById(id) {
    const response = await super.get(PATH, id);
    return (response);
  }

  static async getLookupsByType(type) {
    // const response = await fetch(`${super.getEndpoint()}/lookups/type/${type}`);
    const response = await super.get(`${PATH}/type/${type}`);
    console.log(`${PATH}/type/${type}`);
    return response;
  }

  static async createLookup(lookup) {
    const response = await super.post(PATH, lookup);
    return (response);
  }

  static async updateLookup(lookup) {
    const response = await this.put(PATH, lookup);
    return (response);
  }

  static async deleteLookupById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default LookupsService;
