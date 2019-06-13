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
      hasPaymentMethod: null
    };

    this.handleInputChange = this.handleInputChange.bind(this);
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
    this.setState({
      [e.target.name]: value
    });
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
    const { termsAgreed } = this.state;
    return (
      <Row className="w100">
        <Col md={5} className="account-card">
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
                name: 'a1',
                value: ''
              }
            }
          />
          <br/>
          <span >
            Account #
          </span>
          <br/>
          <TField
            input={
              {
                onChange: this.handleInputChange,
                name: 'a2',
                value: ''
              }
            }
          />
          <br/>
          <span >
            Routing #
          </span>
          <TField
            input={
              {
                onChange: this.handleInputChange,
                name: 'a3',
                value: ''
              }
            }
          />
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
              >
                Save
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
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
    btCustomerId: PropTypes.number
  })
};

PaymentSettings.defaultProps = {
  company: {
    id: 0,
    btCustomerId: 0
  }
};

export default PaymentSettings;
