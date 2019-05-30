import AgentService from './AgentService';

const PATH = '/payments';

class PaymentsService extends AgentService {
  static async getPayments() {
    const response = await super.get(`${PATH}${PATH}`);
    return (response);
  }
}

export default PaymentsService;
