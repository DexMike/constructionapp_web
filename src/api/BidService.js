// consider using this type of file (independent from AgentService)
// in order to keep al files separated
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
      jobId: '',
      hasCustomerAccepted: '',
      hasSchedulerAccepted: '',
      status: '0',
      userId: '',
      rateType: '0',
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
