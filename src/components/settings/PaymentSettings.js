import React, { Component } from 'react';
import {
  Col,
  Container,
  Row,
  Button
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import TField from '../common/TField';

class PaymentSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      termsAgreed: false,
      hasPaymentMethod: null,
      accountName: '',
      account: '',
      routing: '',
      reqHandlerAccountName: {
        touched: false,
        error: ''
      },
      reqHandlerAccount: {
        touched: false,
        error: ''
      },
      reqHandlerRouting: {
        touched: false,
        error: ''
      }
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveAccount = this.saveAccount.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    const { company } = this.props;
    if (company.btCustomerId) {
      const hasPaymentMethod = true;
      this.setState({ hasPaymentMethod });
    }
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  handleInputChange(e) {
    const { value } = e.target;
    let reqHandler = '';

    if (e.target.name === 'accountName') {
      reqHandler = 'reqHandlerAccountName';
    }
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
      accountName,
      account,
      routing
    } = this.state;
    let {
      reqHandlerAccountName,
      reqHandlerAccount,
      reqHandlerRouting
    } = this.state;
    let isValid = true;
    if (accountName === null || accountName.length === 0) {
      reqHandlerAccountName = {
        touched: true,
        error: 'Please enter account name'
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

    if (routing === null || routing.length === 0) {
      reqHandlerRouting = {
        touched: true,
        error: 'Please enter routing number'
      };
      isValid = false;
    }

    this.setState({
      reqHandlerAccountName,
      reqHandlerAccount,
      reqHandlerRouting
    });
    if (isValid) {
      return true;
    }

    return false;
  }

  async saveAccount() {
    if (!this.isFormValid()) {
      return;
    }
    // console.log(124);
  }


  renderSummary() {
    const { company } = this.props;
    return (
      <Row>
        <Col md={12}>
          <strong>Account Name</strong><br/>
          <span>{company.legalName}</span><br/>
          <br />
          <strong>Routing Number</strong><br/>
          <span>Number</span><br/>
          <br />
          <strong>Account Number</strong><br/>
          <span>Number</span><br />
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
      accountName,
      routing,
      reqHandlerAccount,
      reqHandlerAccountName,
      reqHandlerRouting
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
          <Col md={5} className="account-card mx-auto mt-4">
            <br />
            <h3>Enter your company bank information:</h3>
            <br/>
            <span>
              Account Name
            </span>
            <TField
              input={
                {
                  onChange: this.handleInputChange,
                  name: 'accountName',
                  value: accountName
                }
              }
              // meta={reqHandlerAccountName} Had a bug with the error label position
            />
            {
              reqHandlerAccountName.touched
                ? (
                  <span style={{color: '#D32F2F'}}>
                    * Please enter account name
                  </span>
                )
                : null
            }
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
              I agree to let Trelar withdraw from my account
              </Col>
              <Col md={3} className="text-right">
                <Button
                  color="primary"
                  disabled={!termsAgreed}
                  onClick={this.saveAccount}
                >
                  Save
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <br />
        <Row>
          <Col md={5} className="mx-auto text-center mb-4">
            <a href="mailto:support@trelar.net">
              Having problems getting signing up? Please contact our team to get help.
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
