import AgentService from './AgentService';

const PATH = '/notifications';

class TwilioService extends AgentService {
  static async createSms(notification) {
    const response = await super.post(PATH, notification);
    return (response);
  }
}

export default TwilioService;
