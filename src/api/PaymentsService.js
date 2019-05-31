import AgentService from './AgentService';

const PATH = '/payments';

class PaymentsService extends AgentService {
  // Carrier
  static async getPayments() {
    const response = await super.get(`${PATH}${PATH}`);
    return (response);
  }

  // Customer
  static async searchTransactions(transactionSearchRequest) {
    const response = await super.post(`${PATH}/transactions/search`, transactionSearchRequest);
    return response;
  }
}

export default PaymentsService;
