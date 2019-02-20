import React, { Component } from 'react';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import DashboardCarrierPage from './DashboardCarrierPage';
import DashboardCustomerPage from './DashboardCustomerPage';

class DashboardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // todo set companyType to Customer | Carrier to show appropriate page
      companyType: 'Customer'
    };
  } // constructor

  render() {
    return (
      <React.Fragment>
        <div>
          Made it to DashboardPage
        </div>
        { this.state.companyType === 'Carrier' && <DashboardCarrierPage/>}
        { this.state.companyType === 'Customer' && <DashboardCustomerPage/>}
      </React.Fragment>
    );
  }
}

export default DashboardPage;
