import AgentService from './AgentService';

const PATH = '/users/notifications';

class UserNotificationsService extends AgentService {
  static async getUserNotifications(id) {
    const response = await this.get(`/users/${id}/notifications`);
    return (response);
  }

  static async updateUserNotification(notification) {
    const response = await this.put(`${PATH}`, notification);
    return (response);
  }

  static async updateUserNotificationSection(notifications) {
    const response = await super.post(`${PATH}/update`, notifications);
    return (response);
  }
}

export default UserNotificationsService;
