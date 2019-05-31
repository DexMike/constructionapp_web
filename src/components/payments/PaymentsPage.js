import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import PaymentsCarrier from './PaymentsCarrier';
import PaymentsCustomer from './PaymentsCustomer';
import ProfileService from '../../api/ProfileService';

class PaymentsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: ''
    };
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const { companyType } = profile;
    this.setState({ companyType });
  }

  render() {
    const { companyType } = this.state;
    return (
      <Container className="dashboard">
        {
          companyType === 'Customer'
            ? <PaymentsCustomer/>
            : null
        }
        {
          companyType === 'Carrier'
            ? <PaymentsCarrier/>
            : null
        }
      </Container>
    );
  }
}

export default PaymentsPage;
