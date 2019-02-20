// consider using this type of file (independent from AgentService)
// in order to keep al files separated
import AgentService from './AgentService';

class JobsService extends AgentService {
  static async getJobs() {
    const response = await fetch(`${super.getEndpoint()}/jobs`);
    return response.json();
  }

  static async getJobById(id) {
    const response = await fetch(`${super.getEndpoint()}/jobs/${id}`);
    return response.json();
  }

  static async createJob(job) {
    const response = await fetch(`${super.getEndpoint()}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(job)
    });
    return response.json();
  }

  static async updateJob(job) {
    const response = await fetch(`${super.getEndpoint()}/jobs`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(job)
    });
    return response.json();
  }

  static async deleteJobById(id) {
    const response = await fetch(`${super.getEndpoint()}/jobs/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}

export default JobsService;
