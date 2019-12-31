import AgentService from '../../../api/AgentService';

const PATH = '/companies';

class CompanyService extends AgentService {
  static async getCompanies(rows, page) {
    let response;
    if (rows) {
      response = await super.get(`${PATH}?rows=${rows}&page=${page}`);
    } else {
      response = await this.get(PATH);
    }
    return (response);
  }

  static async getCompanyById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getCompaniesByFilters(filters) {
    const response = await super.post(`/admin${PATH}/filters`, filters);
    return (response);
  }

  static async createCompany(company) {
    const response = await super.post(PATH, company);
    return (response);
  }

  static async updateCompany(company) {
    const response = await this.put(PATH, company);
    return (response);
  }

  static async deleteCompanyById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async approveCompany(id, sendNotifications) {
    const request = {
      sendNotifications
    };
    const response = await super.post(`${PATH}/${id}/approve`, request);
    return (response);
  }

  static async changeCompanyStatus(id, sendNotifications, newStatus) {
    const request = {
      sendNotifications,
      newStatus
    };
    const response = await super.post(`${PATH}/${id}/status/update`, request);
    return (response);
  }
}

export default CompanyService;
