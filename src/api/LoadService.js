import AgentService from './AgentService';

const PATH = '/loads';

class LoadService extends AgentService {
  static async getLoadById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async updateLoad(load) {
    const response = await this.put(PATH, load);
    return (response);
  }

  static async getLoadsByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}`);
    return (response);
  }

  static async getActiveDriversByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}/active_drivers`);
    return (response);
  }

  static async getDriversWithLoadsByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}/drivers_with_loads`);
    return (response);
  }

  static async getLatestGPSForLoads(loadIdList) {
    const url = `/gpstrackings${PATH}`;
    const response = await this.post(url, loadIdList);
    return (response);
  }

  static async getLastGPSForCompanyId(companyId) {
    const response = await this.get(`/company/${companyId}/gpstrackings${PATH}`);
    return (response);
  }

  static async getLastGPSForSchedulerCustomer(companyId) {
    const response = await this.get(`/scheduler/${companyId}/gpstrackings${PATH}`);
    return (response);
  }

  static async closeLoads(loadsFinish) {
    const url = `/status${PATH}`;
    const response = await this.put(url, loadsFinish);
    return (response);
  }

  static async approveJobSubmittedLoads(id) {
    const load = {
      jobId: id
    };
    const response = await this.post(`/job${PATH}/approve`, load);
    return (response);
  }
}

export default LoadService;
