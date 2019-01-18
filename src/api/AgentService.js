
class AgentService {

  static async getAddresses() {
    const response = await fetch("https://dev.api.mytrelar.com/service");
    const json = await response.json();
    return json;
  }
}

export default AgentService;
