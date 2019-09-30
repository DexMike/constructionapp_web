import AgentService from './AgentService';

const PATH = '/btlogs';

class BTLogsService extends AgentService {
  static async createBTLog(btLog) {
    const response = await this.post(PATH, btLog);
    return response;
  }
}

export default BTLogsService;
