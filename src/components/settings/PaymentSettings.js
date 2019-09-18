import React, { Component } from 'react';
import {
  Col,
  Container,
  Row,
  Button
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import TField from '../common/TField';
import BrainTreeClient from '../../service/BrainTreeClient';
import PaymentsService from '../../api/PaymentsService';
import AddressService from '../../api/AddressService';
import TSpinner from '../common/TSpinner';

class PaymentSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      termsAgreed: false,
      hasPaymentMethod: null,
      account: '',
      routing: '',
      reqHandlerAccount: {
        touched: false,
        error: ''
      },
      reqHandlerRouting: {
        touched: false,
        error: ''
      },
      btCustomerInfo: {
        accountHolderName: '',
        routingNumber: '',
        last4: ''
      },
      address: null,
      isSavingAccount: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveAccount = this.saveAccount.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    const { company } = this.props;
    const { btCustomerInfo, hasPaymentMethod } = {...this.state};
    let { address } = {...this.state};
    let result = {
      btCustomerInfo,
      hasPaymentMethod
    };
    try {
      address = await AddressService.getAddressById(company.addressId);
    } catch (err) {
      console.error(err.message);
    }
    if (company.btCustomerId) {
      result = await this.btAccountCreated(company.btCustomerId);
    }
    this.setState({
      hasPaymentMethod: result.hasPaymentMethod,
      btCustomerInfo: result.btCustomerInfo,
      address
    });
  }

  async btAccountCreated(btCustomerId) {
    const hasPaymentMethod = true;
    const btCustomerInfo = {};
    try {
      const btCustomer = await PaymentsService.findCustomer(btCustomerId);
      if (btCustomer && btCustomer.usBankAccounts && btCustomer.usBankAccounts.length > 0) {
        btCustomerInfo.accountHolderName = btCustomer.usBankAccounts[0].accountHolderName;
        btCustomerInfo.routingNumber = btCustomer.usBankAccounts[0].routingNumber;
        btCustomerInfo.last4 = btCustomer.usBankAccounts[0].last4;
      }
    } catch (err) {
      console.error(err.message);
    }
    return { hasPaymentMethod, btCustomerInfo };
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  handleInputChange(e) {
    const { value } = e.target;
    let reqHandler = '';

    if (e.target.name === 'account') {
      reqHandler = 'reqHandlerAccount';
    }
    if (e.target.name === 'routing') {
      reqHandler = 'reqHandlerRouting';
    }

    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      [e.target.name]: value
    });
  }

  isFormValid() {
    const {
      account,
      routing
    } = this.state;
    let {
      reqHandlerAccount,
      reqHandlerRouting
    } = this.state;
    let isValid = true;

    if (account === null || account.length === 0) {
      reqHandlerAccount = {
        touched: true,
        error: 'Please enter account number'
      };
      isValid = false;
    }

    if (routing === null || routing.length === 0) {
      reqHandlerRouting = {
        touched: true,
        error: 'Please enter routing number'
      };
      isValid = false;
    }

    this.setState({
      reqHandlerAccount,
      reqHandlerRouting
    });
    if (isValid) {
      return true;
    }

    return false;
  }

  async saveAccount() {
    const { company } = {...this.props};
    const { account, routing, address } = {...this.state};
    this.setState({ isSavingAccount: true });
    if (!this.isFormValid()) {
      return;
    }
    try {
      const brainTreeClient = await new BrainTreeClient();
      if (company && address) {
        const bankDetails = {
          accountNumber: account,
          routingNumber: routing,
          accountType: 'checking',
          ownershipType: 'business',
          businessName: company.legalName,
          billingAddress: {
            streetAddress: address.address1,
            extendedAddress: address.address2,
            locality: address.city,
            region: address.state,
            postalCode: address.zipCode
          }
        };
        const btCustomerId = await brainTreeClient.addCustomer(bankDetails, company.id);
        const result = await this.btAccountCreated(btCustomerId);
        this.setState({
          hasPaymentMethod: result.hasPaymentMethod,
          btCustomerInfo: result.btCustomerInfo
        });
      }
    } catch (err) {
      console.error(err.messsage);
    }
    this.setState({ isSavingAccount: false });
  }

  renderSummary() {
    const { btCustomerInfo } = { ...this.state };
    return (
      <Row>
        <Col md={12}>
          <strong>Account Holder Name</strong><br/>
          <span>{btCustomerInfo.accountHolderName}</span><br/>
          <br />
          <strong>Routing Number</strong><br/>
          <span>{btCustomerInfo.routingNumber}</span><br/>
          <br />
          <strong>Account Number (Last 4)</strong><br/>
          <span>{btCustomerInfo.last4}</span><br />
          <br/>
          <strong>Need to change your Payment Method?</strong><br/>
          <span>Contact our team to get help.</span><br/>
          <a href="mailto:support@trelar.net" target="_top">support@trelar.net</a>
        </Col>
      </Row>
    );
  }

  renderForm() {
    const {
      termsAgreed,
      account,
      routing,
      reqHandlerAccount,
      reqHandlerRouting,
      isSavingAccount
    } = this.state;
    return (
      <React.Fragment>
        <Row>
          <Col md={12} className="text-center mt-4">
            <h3>Welcome to Trelar! To start ordering materials for deliver,
              please set up your bank account for ACH withdrawls.
            </h3>
            <p>
              Nothing will post from your account until load deliveries with attached
              invoices are approved by your company.
            </p>
          </Col>
        </Row>
        <br/>
        <Row>
          <Col md={5} className="account-card mx-auto mt-4" style={{paddingBottom: 10}}>
            <br />
            <h3>Enter your company bank information:</h3>
            <br/>
            <span>
              Account #
            </span>
            <br/>
            <TField
              input={
                {
                  onChange: this.handleInputChange,
                  name: 'account',
                  value: account
                }
              }
            />
            {
              reqHandlerAccount.touched
                ? (
                  <span style={{color: '#D32F2F'}}>
                    * Please enter account number
                  </span>
                )
                : null
            }
            <br/>
            <span>
              Routing #
            </span>
            <TField
              input={
                {
                  onChange: this.handleInputChange,
                  name: 'routing',
                  value: routing
                }
              }
            />
            {
              reqHandlerRouting.touched
                ? (
                  <span style={{color: '#D32F2F'}}>
                    * Please enter routing number
                  </span>
                )
                : null
            }
            <Row style={{paddingTop: 32}}>
              <Col md={1}>
                <label className="checkbox-container" htmlFor="terms">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAgreed}
                    onChange={() => this.setState({ termsAgreed: !termsAgreed})}
                  />
                  <span className="checkmark centered" />
                </label>
              </Col>
              <Col md={8}>
                { `By clicking "Save", I authorize Braintree, a service of PayPal, on behalf of 
Trelar (i) to verify my bank account information using bank information and consumer reports and 
(ii) to debit my bank account.`}
              </Col>
              <Col md={3} className="text-right">
                { !isSavingAccount
                && (
                  <Button
                  color="primary"
                  disabled={!termsAgreed}
                  onClick={this.saveAccount}
                  >
                  Save
                  </Button>
                )}
                { isSavingAccount
                && (
                  <TSpinner />
                )}
              </Col>
            </Row>
          </Col>
        </Row>
        <br />
        <Row>
          <Col md={5} className="mx-auto text-center mb-4">
            <a href="mailto:support@trelar.net">
              Having problems signing up? Please contact our team to get help.
            </a>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  render() {
    const { hasPaymentMethod } = this.state;
    return (
      <Container style={{padding: 0}}>
        <Row className="tab-content-header">
          <Col md={12}>
            <span style={{fontWeight: 'bold', fontSize: 20}}>
              Payment Method
            </span>
          </Col>
        </Row>
        <br/>
        {
          hasPaymentMethod ? this.renderSummary()
            : this.renderForm()
        }
        <br/>
      </Container>
    );
  }
}

PaymentSettings.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number,
    btCustomerId: PropTypes.string
  })
};

PaymentSettings.defaultProps = {
  company: {
    id: 0,
    btCustomerId: ''
  }
};

export default PaymentSettings;
