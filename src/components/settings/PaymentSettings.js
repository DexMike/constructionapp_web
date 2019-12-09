import React, { Component } from 'react';
import {
  Col,
  Container,
  Row,
  Button
} from 'reactstrap';
import {withTranslation} from 'react-i18next';
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
      isSavingAccount: false,
      formError: '',
      successMessage: '',
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
    let isSavingAccount = true;
    let isValid = true;
    if (!/^[0-9]{7,14}$/.test(account)) {
      reqHandlerAccount = {
        touched: true,
        error: 'Account number is not valid'
      };
      isValid = false;
    }
    if (account === null || account.length === 0) {
      reqHandlerAccount = {
        touched: true,
        error: 'Please enter account number'
      };
      isValid = false;
    }
    if (!/^[0-9]{9}$/.test(routing)) {
      reqHandlerRouting = {
        touched: true,
        error: 'Routing number is not valid'
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

    if (isValid === false) {
      isSavingAccount = false;
    }

    this.setState({
      reqHandlerAccount,
      reqHandlerRouting,
      isSavingAccount
    });
    return isValid;
  }

  async saveAccount() {
    const { company, t } = {...this.props};
    const translate = t;
    const { address } = {...this.state};
    let { formError, account, routing, reqHandlerAccount, reqHandlerRouting } = { ...this.state };
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
        const response = await brainTreeClient.addCustomer(bankDetails, company.id);
        if (response.error) {
          // set error message
          // const e = response.error;
          // if (e.originalError && e.originalError.details && e.originalError.details.originalError
          //   && e.originalError.details.originalError.error
          //   && e.originalError.details.originalError.error.details
          //   && e.originalError.details.originalError.error.details.length > 0
          //   && e.originalError.details.originalError.error.details[0]
          //   && e.originalError.details.originalError.error.details[0].code === 'unknown_value'
          //   && e.originalError.details.originalError.error.details[0].at === '/routing_number') {
          //   formError = 'Unknown routing number.';
          // } else {
          formError = translate('We were unable to verify your account information, please update with'
              + ' the correct banking info or contact Trelar support');
          account = '';
          routing = '';
          reqHandlerAccount = {
            touched: false,
            error: ''
          };
          reqHandlerRouting = {
            touched: false,
            error: ''
          };
          // }
        } else {
          const result = await this.btAccountCreated(response);
          this.setState({
            successMessage: translate('Congrats! Your account was approved for ACH debits. '
              + 'You can start using Trelar now.'),
            hasPaymentMethod: result.hasPaymentMethod,
            btCustomerInfo: result.btCustomerInfo
          });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
    this.setState({
      isSavingAccount: false,
      formError,
      account,
      routing,
      reqHandlerRouting,
      reqHandlerAccount
    });
  }

  renderSummary() {
    const { btCustomerInfo, successMessage } = { ...this.state };
    const { t } = { ...this.props };
    const translate = t;
    return (
      <Row>
        <Col md={12}>
          { successMessage && <p>{successMessage}</p> }
          <strong>{translate('Account Holder Name')}</strong><br/>
          <span>{btCustomerInfo.accountHolderName}</span><br/>
          <br />
          <strong>{translate('Routing Number')}</strong><br/>
          <span>{btCustomerInfo.routingNumber}</span><br/>
          <br />
          <strong>{translate('Account Number')} ({translate('Last 4')})</strong><br/>
          <span>{btCustomerInfo.last4}</span><br />
          <br/>
          <strong>{translate('Need to change your Payment Method?')}</strong><br/>
          <span>{translate('Contact our team to get help')}.</span><br/>
          <a href="mailto:support@trelar.com" target="_top">support@trelar.com</a>
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
      isSavingAccount,
      formError
    } = this.state;
    const { t } = { ...this.props };
    const translate = t;
    return (
      <React.Fragment>
        <Row>
          <Col md={12} className="text-center mt-4">
            <h3>
              {translate('Welcome to Trelar! To start ordering materials for deliver,'
               + ' please set up your bank account for ACH withdrawls')}.
            </h3>
            <p>
              {translate('Nothing will post from your account until load deliveries with attached'
              + ' invoices are approved by your company')}.
            </p>
          </Col>
        </Row>
        <br/>
        <Row>
          <Col md={5} className="account-card mx-auto mt-4" style={{paddingBottom: 10}}>
            <span className="form__form-group-error">{formError}</span>
            <br />
            <h3>{translate('Enter your company bank information')}:</h3>
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
                    * {reqHandlerRouting.error}
                  </span>
                )
                : null
            }
            <br />
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
                    * {reqHandlerAccount.error}
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
                { translate('By clicking "Save", I authorize Braintree, a service of PayPal, on behalf of'
                + ' Trelar (i) to verify my bank account information using bank information and consumer'
                + ' reports and (ii) to debit my bank account')}
              </Col>
              <Col md={3} className="text-right">
                { !isSavingAccount
                && (
                  <Button
                  color="primary"
                  disabled={!termsAgreed}
                  onClick={this.saveAccount}
                  >
                    {translate('Save')}
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
            <a href="mailto:support@trelar.com">
              {translate('Having problems signing up? Please contact our team to get help')}.
            </a>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  render() {
    const { hasPaymentMethod } = this.state;
    const { t } = { ...this.props };
    const translate = t;
    return (
      <Container style={{padding: 0}}>
        <Row className="tab-content-header">
          <Col md={12}>
            <span style={{fontWeight: 'bold', fontSize: 20}}>
              {translate('Payment Method')}
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

export default withTranslation()(PaymentSettings);
