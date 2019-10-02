import AgentService from './AgentService';

const PATH = '/payments';

class PaymentsService extends AgentService {
  // Carrier
  // This is HW
  static async getPayments() {
    const response = await super.get(`${PATH}`);
    return (response);
  }

  // Customer
  // This is BT
  static async getClientToken() {
    const response = await super.getText(`${PATH}/clienttoken`);
    return (response);
  }

  static async storeInVault(vaultRequest) {
    const response = await super.post(`${PATH}/vault`, vaultRequest);
    return response;
  }

  static async searchTransactions(transactionSearchRequest) {
    const response = await super.post(`${PATH}/transactions/search`, transactionSearchRequest);
    return response;
  }

  static async getPayment(id) {
    const response = await super.get(`${PATH}/transaction/${id}`);
    return (response);
  }

  static async findCustomer(id) {
    const response = await this.get(`${PATH}/customers/${id}`);
    return (response);
  }
}

export default PaymentsService;
