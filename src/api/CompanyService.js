import AgentService from './AgentService';

const PATH = '/companies';

class CompanyService extends AgentService {
  static async getCompanies() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getCompanyById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getCarriersByFilters(filters) {
    const response = await super.post(`${PATH}/filters`, filters);
    return (response);
  }

  static async getCarriersTrucks(companyId) {
    const response = await super.get(`${PATH}/${companyId}/truck`);
    return (response);
  }

  static async getCarriersMaterials(companyId) {
    const response = await super.get(`${PATH}/${companyId}/materials`);
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

  static async getCompanySettings(id) {
    const response = await this.get(`${PATH}/${id}/settings`);
    return (response);
  }

  static async createCompanySettings(item) {
    const response = await super.post(`${PATH}/settings`, item);
    return (response);
  }

  static async updateCompanySettings(company) {
    const response = await this.put(`${PATH}/settings`, company);
    return (response);
  }

  static async deleteCompanySettingsItem(id) {
    const response = await this.delete(`${PATH}/settings`, id);
    return (response);
  }
}

export default CompanyService;
