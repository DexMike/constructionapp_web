import AgentService from './AgentService';

const PATH = '/companies';

class CompanyService extends AgentService {
  static async getCompanies() {
    return await super.get(PATH);
  }

  static async createCompany(company) {
    return await super.post(PATH, company);
  }

  static async updateCompany(company) {
    return await this.put(PATH, company);
  }

  static async deleteCompanyById(id) {
    return await this.delete(PATH, id);
  }
}

export default CompanyService;
