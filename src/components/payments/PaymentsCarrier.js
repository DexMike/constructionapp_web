import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import PaymentsService from '../../api/PaymentsService';

class PaymentsCarrier extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      id: 0,
      goToPaymentDetails: false,
      payments: []
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handlePaymentId = this.handlePaymentId.bind(this);
  }

  async componentDidMount() {
    await this.fetchPayments();
    this.setState({ loaded: true });
  }

  handlePaymentId(id) {
    this.setState({
      goToPaymentDetails: true,
      id
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async fetchPayments() {
    let payments = await PaymentsService.getPayments();

    payments = payments.map((payment) => {
      const newPayment = payment;
      newPayment.id = payment.clientPaymentId;
      newPayment.amount = TFormat.asMoney(payment.amount);
      newPayment.createdOn = TFormat.asDate(payment.createdOn);
      return newPayment;
    });

    this.setState({ payments });
  }

  renderGoTo() {
    const {goToPaymentDetails, id} = this.state;
    if (goToPaymentDetails) {
      return <Redirect push to={`/payments/${id}`}/>;
    }
    return false;
  }

  render() {
    // const payments = [{ date: '05/24/2019', name: 'Fixed Job', load: '1235-A', amount: '$12,335.88' }];
    const { loaded, payments } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderGoTo()}
          <Row>
            <Col md={12}>
              <h3 className="page-title">Carrier Payments</h3>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  <TTable
                    columns={
                      [
                        {
                          name: 'notes',
                          displayName: 'Notes'
                        }, {
                          name: 'purpose',
                          displayName: 'Purpose'
                        }, {
                          name: 'amount',
                          displayName: 'Amount'
                        }, {
                          name: 'currency',
                          displayName: 'Currency'
                        }, {
                          name: 'memo',
                          displayName: 'Memo'
                        }
                      ]
                    }
                    data={payments}
                    handleIdClick={this.handlePaymentId}
                  />
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
            <h3 className="page-title">Carrier Payments</h3>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            Loading ...
          </Col>
        </Row>
      </Container>
    );
  }
}

export default PaymentsCarrier;
