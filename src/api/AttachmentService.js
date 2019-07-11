import AgentService from './AgentService';

const PATH = '/attachment';

class CompanyService extends AgentService {
  static async getCompanyAttachments(id) {
    const response = await this.get(`/company/${id}/coiattachments`);
    return (response);
  }

  static async getAttachmentById(id) {
    const response = await this.get(`${PATH}/${id}/coiattachment`);
    return (response);
  }
}

export default CompanyService;