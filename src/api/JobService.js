// consider using this type of file (independent from AgentService)
// in order to keep al files separated
import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/jobs';

class JobService extends AgentService {
  static async getJobs() {
    const response = await super.get(PATH);
    return (response);
  }

  // static async getJobById(id) {
  //   const response = await this.get(`${PATH}/${id}`);
  //   return (response);
  // }

  static async getJobMaterialsByJobId(id) {
    const response = await this.get(`${PATH}/${id}/jobmaterials`);
    // /jobs/jobId/jobMaterials/
    return (response);
  }

  static async createJob(job) {
    const response = await super.post(PATH, job);
    return (response);
  }

  static async updateJob(job) {
    const response = await this.put(PATH, job);
    return (response);
  }

  static async deleteJobById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async getJobById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static getDefaultJob() {
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
      startTime: moment()
        .unix() * 1000,
      endTime: '',
      rate: 'Hour',
      notes: '',
      createdBy: 0,
      createdOn: moment()
        .unix() * 1000,
      modifiedBy: 0,
      modifiedOn: moment()
        .unix() * 1000,
      isArchived: 0
    };
  }
}

export default JobService;
