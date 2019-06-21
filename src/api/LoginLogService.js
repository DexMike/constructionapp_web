const { API_ENDPOINT } = process.env;

class LoginLogService {
  static async createLoginLog(entity) {
    const input = `${API_ENDPOINT}/login/logs`;
    const init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    return response.json();
  }
}

export default LoginLogService;
