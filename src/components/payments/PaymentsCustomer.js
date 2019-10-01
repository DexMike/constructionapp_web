import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import PaymentsService from '../../api/PaymentsService';
import AddressService from '../../api/AddressService';
import PaymentsFilter from './PaymentsFilter';

class PaymentsCustomer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      id: 0,
      goToPaymentDetails: false,
      payments: [],
      page: 0,
      rows: 10,
      btCustomer: null,
      btTransactions: [],
      address: null
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handlePaymentId = this.handlePaymentId.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }

  async componentDidMount() {
    await this.fetchPayments();
    this.setState({ loaded: true });
  }

  async componentWillReceiveProps(nextProps) {
    let { btCustomer, btTransactions, address } = { ...this.state };
    try {
      if (!btCustomer && nextProps.company && nextProps.company.btCustomerId) {
        const response = await this.btAccountCreated(nextProps.company.btCustomerId);
        btCustomer = response.btCustomer;
        btTransactions = response.btTransactions;
      }
      if (!btCustomer && nextProps.company && nextProps.company.addressId) {
        address = await AddressService.getAddressById(nextProps.company.addressId);
      }
    } catch (err) {
      console.error(err.message);
    }
    this.setState({ btCustomer, btTransactions });
  }


  handlePaymentId(id) {
    this.setState({
      goToPaymentDetails: true,
      id
    });
  }

  handlePageChange(page) {
    this.setState({ page });
  }

  handleRowsPerPage(rows) {
    this.setState({ rows });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async fetchPayments(btCustomerId) {
    // const response = await PaymentsService.searchTransactions({});
    // const payments = response.data.map((payment) => {
    //   const newPayment = {};
    //   newPayment.id = payment.id;
    //
    //   newPayment.amount = payment.amount;
    //   newPayment.amountF = TFormat.getValue(
    //     TFormat.asMoney(payment.amount)
    //   );
    //
    //   newPayment.type = payment.type;
    //   newPayment.status = payment.status;
    //   newPayment.createdAt = TFormat.asDate(payment.createdAt);
    //   newPayment.company = (payment.customer && payment.customer.company)
    //     ? payment.customer.company : '';
    //   newPayment.paymentMethod = (payment.usBankAccountDetails
    //     && payment.usBankAccountDetails.last4) ? payment.usBankAccountDetails.last4 : '';
    //   return newPayment;
    // });

    // this.setState({ payments });

    let btTransactions = {};
    let btCustomer = {};
    console.log('Trying to get btCustomerId');
    try {
      btCustomer = await PaymentsService.findCustomer(btCustomerId);
      console.log('btCustomerId');
      console.log(btCustomerId);

      if (!btCustomerId) {
        btTransactions = (await PaymentsService.searchTransactions({
          customerId: btCustomerId
        })).data;
        console.log('btTransactions');
        console.log(btTransactions);      }
      btTransactions = (await PaymentsService.searchTransactions({
        customerId: btCustomerId
      })).data;
      console.log('btTransactions');
      console.log(btTransactions);
      // const btCustomer = await PaymentService.findCustomer(btCustomerId);
      // if (btCustomer && btCustomer.usBankAccounts && btCustomer.usBankAccounts.length > 0) {
      //   btCustomerInfo.accountHolderName = btCustomer.usBankAccounts[0].accountHolderName;
      //   btCustomerInfo.routingNumber = btCustomer.usBankAccounts[0].routingNumber;
      //   btCustomerInfo.last4 = btCustomer.usBankAccounts[0].last4;
      // }
    } catch (err) {
      console.error(err.message);
    }
    return { btCustomer, btTransactions };
  }

  renderGoTo() {
    const {goToPaymentDetails, id} = this.state;
    if (goToPaymentDetails) {
      return <Redirect push to={`/payments/${id}`}/>;
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
              <h3 className="page-title">Customer Charges</h3>
            </Col>
          </Row>
          <PaymentsFilter />
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  <TTable
                    columns={
                      [
                        // {
                        //   name: 'id',
                        //   displayName: 'ID'
                        // },
                        {
                          name: 'createdAt',
                          displayName: 'Date'
                        }, {
                          name: 'amount',
                          displayName: 'Amount',
                          label: 'amountF'
                        }, {
                          name: 'status',
                          displayName: 'Status'
                        }
                      ]
                    }
                    data={payments}
                    handleIdClick={this.handlePaymentId}
                    handlePageChange={this.handlePageChange}
                    handleRowsChange={this.handleRowsPerPage}
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
            <h3 className="page-title">Customer Payments</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default PaymentsCustomer;
