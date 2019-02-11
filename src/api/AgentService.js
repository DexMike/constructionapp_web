// TODO use .env for developer's local config
// const API_ENDPOINT = 'http://localhost:8080';
const API_ENDPOINT = 'https://dev.api.mytrelar.com';

class AgentService {
  // Companies begins
  static async getCompanies() {
    const response = await fetch(`${API_ENDPOINT}/companies`);
    return response.json();
  }

  static async getCompanyById(id) {
    const response = await fetch(`${API_ENDPOINT}/companies/${id}`);
    return response.json();
  }

  static async createCompany(company) {
    const endpoint = `${API_ENDPOINT}/companies`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(company)
    });
    return response.json();
  }

  static async updateCompany(company) {
    const response = await fetch(`${API_ENDPOINT}/companies`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(company)
    });
    return response.json();
  }

  static async deleteCompanyById(id) {
    const response = await fetch(`${API_ENDPOINT}/companies/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
  // Companies end

  // Users begins
  static async getUsers() {
    const response = await fetch(`${API_ENDPOINT}/users`);
    return response.json();
  }

  static async getUserById(id) {
    const response = await fetch(`${API_ENDPOINT}/users/${id}`);
    return response.json();
  }

  static async createUser(user) {
    const response = await fetch(`${API_ENDPOINT}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    return response.json();
  }

  static async updateUser(user) {
    const response = await fetch(`${API_ENDPOINT}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    return response.json();
  }

  static async deleteUserById(id) {
    const response = await fetch(`${API_ENDPOINT}/users/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
  // Users end

  // Addresses begins
  static async getAddresses() {
    const response = await fetch(`${API_ENDPOINT}/addresses`);
    return response.json();
  }

  static async getAddressById(id) {
    const response = await fetch(`${API_ENDPOINT}/addresses/${id}`);
    return response.json();
  }

  static async createAddress(address) {
    const response = await fetch(`${API_ENDPOINT}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(address)
    });
    return response.json();
  }

  static async updateAddress(address) {
    const response = await fetch(`${API_ENDPOINT}/addresses`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(address)
    });
    return response.json();
  }

  static async deleteAddressById(id) {
    const response = await fetch(`${API_ENDPOINT}/addresses/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
  // Addresses ends
}

export default AgentService;
