import AgentService from './AgentService';

const PATH = '/user_notifications';

class UserNotificationsService extends AgentService {
  static async getUserNotifications(id) {
    const response = await this.get(`/users/${id}/user_notifications/get`);
    return (response);
  }

  static async updateUserNotification(notification) {
    const response = await this.put(`${PATH}/settings`, notification);
    return (response);
  }

  static async updateUserNotificationSection(notifications) {
    const response = await super.post(`${PATH}/update`, notifications);
    return (response);
  }
}

export default UserNotificationsService;
