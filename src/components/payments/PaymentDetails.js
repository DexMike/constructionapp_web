import React, { Component } from 'react';
import { Card, CardBody, Col, Container, Row, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
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
    let payments = await PaymentsService.getPayments();

    payments = payments.map((payment) => {
      const newPayment = payment;
      newPayment.amount = TFormat.asMoney(payment.amount);
      newPayment.createdOn = TFormat.asDate(payment.createdOn);
      return newPayment;
    });

    const payment = payments[0];

    this.setState({ payment });
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
                  <h3>Payment Description</h3>
                  <br />
                  <div style={{fontSize: 16}}>
                    <div className="row">
                      <div className="col-2"><strong>Id</strong></div>
                      <div className="col-10">{payment.id}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Token</strong></div>
                      <div className="col-10">{payment.token}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Date</strong></div>
                      <div className="col-10">{payment.createdOn}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Token</strong></div>
                      <div className="col-10">{payment.token}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Amount</strong></div>
                      <div className="col-10">{payment.amount}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Currency</strong></div>
                      <div className="col-10">{payment.currency}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Notes</strong></div>
                      <div className="col-10">{payment.notes}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Memo</strong></div>
                      <div className="col-10">{payment.memo}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Purpose</strong></div>
                      <div className="col-10">{payment.purpose}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Release</strong></div>
                      <div className="col-10">{payment.releaseOn}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Destination Token</strong></div>
                      <div className="col-10">{payment.destinationToken}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Program Token</strong></div>
                      <div className="col-10">{payment.programToken}</div>
                    </div>
                    <div className="row">
                      <div className="col-2"><strong>Client Payment Id</strong></div>
                      <div className="col-10">{payment.clientPaymentId}</div>
                    </div>
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

export default PaymentDetails;
