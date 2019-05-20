import AgentService from './AgentService';

const PATH = '/loads';

class LoadService extends AgentService {
  static async getLoads() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getLoadById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async createLoad(load) {
    const response = await this.post(PATH, load);
    return (response);
  }

  static async endLoad(load) {
    const response = await this.put(PATH, load);
    return (response);
  }

  static async updateLoad(load) {
    const response = await this.put('/update/load', load);
    return (response);
  }

  static async getLoadsByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}`);
    return (response);
  }

  static async getLatestLoadByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}`);
    return (response);
  }

  static async getLoadsByBookingId(id) {
    const response = await this.get(`/bookings/${id}/allloads`);
    return (response);
  }
  // static async getLatestLoadByJobId(id) {
  //   const response = await this.get(`/jobs/${id}${PATH}`);
  //   return (response);
  // }

  /*static getDefaultJob() {
    return {
      companiesId: 0,
      status: 'New',
      startAddress: 0,
      endAddress: 0,
      name: '',
      rateEstimate: 0,
      rateTotal: 0,
      startGeoFence: '',
      endGeoFence: '',
      numberOfTrucks: 0,
      startTime: new Date(),
      endTime: new Date(),
      rateType: 'Hour',
      rate: 0,
      notes: '',
      createdBy: 0,
      createdOn: moment()
        .unix() * 1000,
      modifiedBy: 0,
      modifiedOn: moment()
        .unix() * 1000,
      isArchived: 0
    };
  }*/
}

export default LoadService;
