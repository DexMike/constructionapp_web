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

  static async getCarriersByFiltersV2(filters) {
    const response = await super.post('/carriers/search', filters);
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

  static async getFavoritesNonFavoritesCompaniesByUserId(userId, filters) {
    const url = `/companies/user/${userId}/favoritesnonfavorites`;
    const response = await this.post(url, filters);
    return (response);
  }

  static async getFavoritesByUserId(userId, filters) {
    const url = `/companies/user/${userId}/favorites`;
    const response = await this.post(url, filters);
    return (response);
  }

  static async getNonFavoritesByUserId(userId, filters) {
    const url = `/companies/user/${userId}/nonfavorites`;
    const response = await this.post(url, filters);
    return (response);
  }
}

export default CompanyService;
