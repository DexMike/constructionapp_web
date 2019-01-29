// TODO use .env for developer's local config
// const API_ENDPOINT = "http://localhost:8080";
const API_ENDPOINT = "https://dev.api.mytrelar.com";

class AgentService {

  static async getCompanies() {
    const response = await fetch(API_ENDPOINT + '/companies');
    return await response.json();
  }

  static async getCompanyById(id) {
    const response = await fetch(API_ENDPOINT + '/companies/' + id);
    return await response.json();
  }

  static async createCompany(company) {
    const response = await fetch(API_ENDPOINT + '/companies', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(company)
    });
    return await response.json();
  }

  static async updateCompany(company) {
    const response = await fetch(API_ENDPOINT + '/companies', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(company)
    });
    return await response.json();
  }

  static async deleteCompanyById(id) {
    const response = await fetch(API_ENDPOINT + '/companies/' + id, {
      method: 'DELETE'
    });
    return await response.json();
  }

  static async getAddresses() {
    const response = await fetch(API_ENDPOINT + '/addresses');
    return await response.json();
  }

  static async getAddressById(id) {
    const response = await fetch(API_ENDPOINT + '/addresses/' + id);
    return await response.json();
  }

  static async createAddress(address) {
    const response = await fetch(API_ENDPOINT + '/addresses', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(address)
    });
    return await response.json();
  }

  static async updateAddress(address) {
    const response = await fetch(API_ENDPOINT + '/addresses', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(address)
    });
    return await response.json();
  }

  static async deleteAddressById(id) {
    const response = await fetch(API_ENDPOINT + '/addresses/' + id, {
      method: 'DELETE'
    });
    return await response.json();
  }
}

export default AgentService;
