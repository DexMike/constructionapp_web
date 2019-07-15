import React, { Component } from 'react';
import { Card, CardBody, Col, Container, Row, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import TFormat from '../common/TFormat';


import PaymentsService from '../../api/PaymentsService';

class PaymentDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      payment: []
    };
  }

  async componentDidMount() {
    await this.fetchPayments();
    this.setState({ loaded: true });
  }

  async fetchPayments() {
    const { match } = this.props;
    let { payment } = this.state;
    if (match.params.id) {
      payment = await PaymentsService.getPayment(match.params.id);
    }
    this.setState({ payment, loaded: true });
  }

  renderLoader() {
    return (
      <div className="load loaded inside-page">
        <div className="load__icon-wrap">
          <svg className="load__icon">
            <path fill="rgb(0, 111, 83)" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </div>
      </div>
    );
  }

  renderPaymentDetail(usBankAccountDetails) {
    if (usBankAccountDetails !== null) {
      return (
        <React.Fragment>
          <div className="row">
            <div className="col-4"><strong>Bank</strong></div>
            <div className="col-8">{usBankAccountDetails.bankName}</div>
          </div>
          <div className="row">
            <div className="col-4"><strong>Account type</strong></div>
            <div className="col-8">{usBankAccountDetails.accountType}</div>
          </div>
          <div className="row">
            <div className="col-4"><strong>Routing number</strong></div>
            <div className="col-8">{usBankAccountDetails.routingNumber}</div>
          </div>
        </React.Fragment>
      );
    }
    return false;
  }

  render() {
    const { loaded, payment } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <h3 className="page-title">Payment Details</h3>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody style={{ padding: 32 }}>
                  <br />
                  <div style={{ fontSize: 16 }}>
                    <div className="row">
                      <div className="col-4"><strong>Id</strong></div>
                      <div className="col-8">{payment.id}</div>
                    </div>
                    <div className="row">
                      <div className="col-4"><strong>Date</strong></div>
                      <div className="col-8">{TFormat.asDate(payment.createdAt)}</div>
                    </div>
                    <div className="row">
                      <div className="col-4"><strong>Amount</strong></div>
                      <div className="col-8">{TFormat.asMoney(payment.amount)}</div>
                    </div>
                    <div className="row">
                      <div className="col-4"><strong>Currency</strong></div>
                      <div className="col-8">{payment.currencyIsoCode}</div>
                    </div>
                    <div className="row">
                      <div className="col-4"><strong>Processor response text</strong></div>
                      <div className="col-8">{payment.processorResponseText}</div>
                    </div>
                    <div className="row">
                      <div className="col-4"><strong>Status</strong></div>
                      <div className="col-8">{payment.status}</div>
                    </div>
                    <div className="row">
                      <div className="col-4"><strong>Type</strong></div>
                      <div className="col-8">{payment.type}</div>
                    </div>
                    {this.renderPaymentDetail(payment.usBankAccountDetails)}
                  </div>
                  <br/>
                  <div className="row">
                    <div className="col-12 text-right">
                      <Link to="/payments">
                        <Button>
                        Back
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <h3 className="page-title">Payments Details</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

PaymentDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

PaymentDetails.defaultProps = {
  match: {
    params: {
      id: null
    }
  }
};

export default PaymentDetails;
