import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import PaymentsService from '../../api/PaymentsService';

class PaymentsCustomer extends Component {
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
    const response = await PaymentsService.searchTransactions({});
    const payments = response.data.map((payment) => {
      const newPayment = {};
      newPayment.id = payment.id;
      newPayment.amount = TFormat.asMoney(payment.amount);
      newPayment.type = payment.type;
      newPayment.status = payment.status;
      newPayment.createdAt = TFormat.asDate(payment.createdAt);
      newPayment.company = (payment.customer && payment.customer.company)
        ? payment.customer.company : '';
      newPayment.paymentMethod = (payment.usBankAccountDetails
        && payment.usBankAccountDetails.last4) ? payment.usBankAccountDetails.last4 : '';
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
              <h3 className="page-title">Customer Payments</h3>
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
                          name: 'id',
                          displayName: 'ID'
                        }, {
                          name: 'amount',
                          displayName: 'Amount'
                        }, {
                          name: 'createdAt',
                          displayName: 'Added'
                        }, {
                          name: 'type',
                          displayName: 'Type'
                        }, {
                          name: 'status',
                          displayName: 'Status'
                        }, {
                          name: 'company',
                          displayName: 'Customer'
                        }, {
                          name: 'paymentMethod',
                          displayName: 'Payment Method'
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
            <h3 className="page-title">Customer Payments</h3>
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

export default PaymentsCustomer;
