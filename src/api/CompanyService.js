import AgentService from './AgentService';

const PATH = '/companies';

class CompanyService extends AgentService {
  static async getCompanies() {
    return (await super.get(PATH)).json();
  }

  static async createCompany(company) {
    return (await super.post(PATH, company)).json();
  }

  static async updateCompany(company) {
    return (await this.put(PATH, company)).json();
  }

  static async deleteCompanyById(id) {
    return (await this.delete(PATH, id)).json();
  }
}

export default CompanyService;
