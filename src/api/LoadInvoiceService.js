import AgentService from './AgentService';

const PATH = '/loadinvoices';

class LoadInvoiceService extends AgentService {
  static async getLoadInvoices() {
    const response = await super.get(PATH);
    return (response);
  }


  static async createLoadInvoices(loadInvoices) {
    const response = await super.post(`${PATH}/list`, loadInvoices);
    return (response);
  }

  static async getLoadInvoicesByLoad(id) {
    const response = await this.get(`/load/${id}${PATH}`, id);
    return (response);
  }

  // static async getLoadInvoicesByLoadId(loadId) {
  //   const response = await this.get(`/loads/${loadId}${PATH}`);
  //   return response;
  // }
}

export default LoadInvoiceService;
