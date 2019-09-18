import BrainTreeClient from './BrainTreeClient';

describe('Braintree client', () => {
  it('should add a customer with a payment method', async () => {
    const brainTreeClient = await new BrainTreeClient();
    const bankDetails = {
      accountNumber: '1000000000',
      routingNumber: '071000013',
      accountType: 'checking',
      ownershipType: 'business',
      businessName: 'Unit Test Company',
      billingAddress: {
        streetAddress: '7756 Northcross Dr',
        extendedAddress: '',
        locality: 'Austin',
        region: 'Texas',
        postalCode: '78757'
      }
    };
    await brainTreeClient.addCustomer(bankDetails, 1);
  }, 50000);
});
