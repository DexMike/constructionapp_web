import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/bids';

class BidService extends AgentService {
  static async getBids() {
    const response = await super.get(PATH);
    return (response);
  }

  static async createBid(bid) {
    const response = await super.post(PATH, bid);
    return (response);
  }

  static async updateBid(bid) {
    const response = await this.put(PATH, bid);
    return (response);
  }

  static async deleteBidbById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async getBidById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static getDefaultBid() {
    return {
      jobId: 0,
      hasCustomerAccepted: 0,
      hasSchedulerAccepted: 0,
      status: 'New',
      userId: 0,
      rateType: 'Hour',
      rate: '',
      rateEstimate: '',
      notes: '',
      createdBy: [],
      createdOn: moment()
        .unix() * 1000,
      modifiedBy: [],
      modifiedOn: moment()
        .unix() * 1000,
      isArchived: 0
    };
  }
}

export default BidService;
