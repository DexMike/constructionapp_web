// consider using this type of file (independent from AgentService)
// in order to keep al files separated
import AgentService from './AgentService';

const PATH = '/jobs';

class JobsService extends AgentService {
  static async getJobs() {
    const response = await super.get(PATH);
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
}

export default JobsService;
