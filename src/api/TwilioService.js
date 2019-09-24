import AgentService from './AgentService';

const PATH = '/notifications';

class TwilioService extends AgentService {
  static async createSms(notification) {
    const response = await super.post(PATH, notification);
    return (response);
  }

  static async createInviteSms(notification) {
    const response = await super.post(`${PATH}/invite`, notification);
    return (response);
  }

  static async smsBatchSending(notification) {
    const response = await super.post(`${PATH}/smsbatchsending`, notification);
    return (response);
  }
}

export default TwilioService;
