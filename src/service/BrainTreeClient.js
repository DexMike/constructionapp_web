import braintree from 'braintree-web';
import PaymentsService from '../api/PaymentsService';
import CompanyService from '../api/CompanyService';

class BrainTreeClient {
  constructor() {
    return (async () => {
      this.clientToken = await PaymentsService.getClientToken();
      this.client = await braintree.client.create({ authorization: this.clientToken });
      this.usBankAccount = await braintree.usBankAccount.create({ client: this.client });
      return this;
    })();
  }

  async addCustomer(bankDetails, companyId) {
    let tokenizeEtokenizedPayload;
    try {
      // Collect bankDetails or bankLogin.
      tokenizeEtokenizedPayload = await this.usBankAccount.tokenize({
        bankDetails, // or bankLogin: bankLogin
        mandateText: 'By clicking "Save", I authorize Braintree, a service of PayPal, on behalf of Trelar (i) to verify my bank account information using bank information and consumer reports and (ii) to debit my bank account.'
      });
      const vaultResponse = await PaymentsService.storeInVault({
        businessName: bankDetails.businessName,
        nonceToken: tokenizeEtokenizedPayload.nonce
      });
      // const { vaultToken } = { ...vaultResponse };
      const company = await CompanyService.getCompanyById(companyId);
      company.btCustomerId = vaultResponse.customerId;
      await CompanyService.updateCompany(company);
      return company.btCustomerId;
    } catch (err) {
      console.error(err);
    }
    return null;
  }
}

export default BrainTreeClient;
