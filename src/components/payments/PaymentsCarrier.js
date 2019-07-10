import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import PaymentsService from '../../api/PaymentsService';
import PaymentsFilter from './PaymentsFilter';

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
      newPayment.id = payment.token;

      newPayment.amount = payment.amount;
      newPayment.amountF = TFormat.getValue(
        TFormat.asMoney(payment.amount)
      );

      newPayment.createdOn = TFormat.asDate(payment.createdOn);

      return newPayment;
    });

    this.setState({ payments });
  }

  renderGoTo() {
    const {goToPaymentDetails, id} = this.state;
    if (goToPaymentDetails) {
      return <Redirect push to={`/invoices/${id}`}/>;
    }
    return false;
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
    const title = 'Carrier Invoices';
    /* const payments = [{
      date: '05/24/2019', name: 'Fixed Job', load: '1235-A', amount: '$12,335.88'
    }]; */
    const { loaded, payments } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderGoTo()}
          <Row>
            <Col md={12}>
              <h3 className="page-title">{title}</h3>
            </Col>
          </Row>
          <PaymentsFilter />
          <Row>
            <Col md={12}>
              <h5>For detailed information on your payments, please log into your &nbsp;
                <a href="https://hyperwallet.com/" target="_blank" rel="noopener noreferrer">https://hyperwallet.com</a>&nbsp;account.
              </h5>
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
                          name: 'createdOn',
                          displayName: 'Date'
                        },
                        {
                          name: 'token',
                          displayName: 'ID'
                        },
                        {
                          name: 'amount',
                          displayName: 'Amount',
                          label: 'amountF'
                        }
                      ]
                    }
                    data={payments}
                    handleIdClick={this.handlePaymentId}
                    handlePageChange={() => {}}
                    handleRowsChange={() => {}}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container className="container">
        <Row>
          <Col md={12}>
            <h3 className="page-title">{title}</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default PaymentsCarrier;
