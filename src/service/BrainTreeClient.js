import braintree from 'braintree-web';
import PaymentsService from '../api/PaymentsService';
import CompanyService from '../api/CompanyService';
import BTLogsService from '../api/BTLogsService';

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
      const btLog = {
        companyId,
        type: 'Add BT Customer',
        request: JSON.stringify(bankDetails),
        response: JSON.stringify(vaultResponse),
        status: 'Success'
      };
      await BTLogsService.createBTLog(btLog);
      // const { vaultToken } = { ...vaultResponse };
      const company = await CompanyService.getCompanyById(companyId);
      company.btCustomerId = vaultResponse.customerId;
      await CompanyService.updateCompany(company);
      return company.btCustomerId;
    } catch (err) {
      console.error(err);
      const btLog = {
        companyId,
        type: 'Add BT Customer',
        request: JSON.stringify(bankDetails),
        response: JSON.stringify(err),
        status: 'Fail'
      };
      await BTLogsService.createBTLog(btLog);
      if (err.details) {
        return {
          error: err.details
        };
      }
    }
    return null;
  }
}

export default BrainTreeClient;
