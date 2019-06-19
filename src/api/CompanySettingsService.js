import AgentService from './AgentService';

const PATH = '/company_settings';

class CompanySettingsService extends AgentService {
  static async getCompanySettings(id) {
    const response = await this.get(`/companies/${id}/settings`);
    return (response);
  }

  static async updateCompanySettings(companySettings, companyId) {
    const params = {
      companySettings,
      companyId
    };
    const response = await super.post(`${PATH}/update`, params);
    return (response);
  }
}

export default CompanySettingsService;
