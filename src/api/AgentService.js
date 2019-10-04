import AuthService from '../utils/AuthService';
// TODO use .env for developer's local config
// const API_ENDPOINT = 'http://localhost:8080';
// const API_ENDPOINT = 'https://dev.api.mytrelar.com';
// const API_ENDPOINT = 'https://demo.api.mytrelar.com';
const { API_ENDPOINT } = process.env;

class AgentService {
  static async getHeaders() {
    try {
      const currentSession = await AuthService.refreshSession();
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentSession.accessToken.jwtToken}`,
        'Id-Token': currentSession.idToken.jwtToken
      };
    } catch (err) {
      return {
        'Content-Type': 'application/json'
      };
    }
  }

  static async get(path) {
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'GET',
      headers
    };
    const response = await fetch(input, init);
    if (response.status === 403) {
      throw new Error('Access Forbidden');
    }
    return response.json();
  }

  static async getText(path) {
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'GET',
      headers
    };
    const response = await fetch(input, init);
    return response.text();
  }

  static async post(path, entity) {
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'POST',
      headers,
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async put(path, entity) {
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'PUT',
      headers,
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async delete(path, id) {
    const input = `${API_ENDPOINT}${path}/${id}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'DELETE',
      headers
    };
    const response = await fetch(input, init);
    return response.json();
  }
}

export default AgentService;
