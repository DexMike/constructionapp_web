import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';

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
    // I am commenting this out as we will be getting the payment information from
    // finTrans table
    // let payments = await PaymentsService.getPayments();
    //
    // payments = payments.map((payment) => {
    //   const newPayment = payment;
    //   newPayment.id = payment.token;
    //
    //   newPayment.amount = payment.amount;
    //   newPayment.amountF = TFormat.getValue(
    //     TFormat.asMoney(payment.amount)
    //   );
    //
    //   newPayment.createdOn = TFormat.asDate(payment.createdOn);
    //
    //   return newPayment;
    // });
    //
    // this.setState({ payments });
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
    const title = 'Carrier Payments';
    /* const payments = [{
      date: '05/24/2019', name: 'Fixed Job', load: '1235-A', amount: '$12,335.88'
    }]; */
    const { loaded, payments } = this.state;
    const {t} = {...this.props};
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderGoTo()}
          <Row>
            <Col md={12}>
              <h3 className="page-title">{t(title)}</h3>
            </Col>
          </Row>
          <PaymentsFilter isCarrier />
          <Row>
            <Col md={12}>
              <h5>{t('For detailed information on your payments, please log into your hyperwallet account at')}&nbsp;&nbsp;
                <a href="https://trelar.hyperwallet.com/" target="_blank" rel="noopener noreferrer">https://trelar.hyperwallet.com</a>.
              </h5>
              <h5>&nbsp; </h5>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  <h5>&nbsp; </h5>
                  <h5>&nbsp; </h5>
                  <h5>{t('There are no payments to show at this time')}</h5>
                  <h5>&nbsp; </h5>
                  <h5>&nbsp; </h5>

                  {/*commenting this out until we have the payments done*/}

                  {/*<TTable*/}
                    {/*columns={*/}
                      {/*[*/}
                        {/*{*/}
                          {/*name: 'createdOn',*/}
                          {/*displayName: 'Date'*/}
                        {/*},*/}
                        {/*{*/}
                          {/*name: 'token',*/}
                          {/*displayName: 'ID'*/}
                        {/*},*/}
                        {/*{*/}
                          {/*name: 'amount',*/}
                          {/*displayName: 'Amount',*/}
                          {/*label: 'amountF'*/}
                        {/*}*/}
                      {/*]*/}
                    {/*}*/}
                    {/*data={payments}*/}
                    {/*handleIdClick={() => {}}*/}
                    {/*handlePageChange={() => {}}*/}
                    {/*handleRowsChange={() => {}}*/}
                  {/*/>*/}
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
            <h3 className="page-title">{t(title)}</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default withTranslation()(PaymentsCarrier);
