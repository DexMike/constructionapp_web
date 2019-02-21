import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobsService from '../../api/JobsService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import DashboardCarrierPage from './DashboardCarrierPage';
import DashboardCustomerPage from './DashboardCustomerPage';

class DashboardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // todo set companyType to Customer | Carrier to show appropriate page
      companyType: 'Customer'
      // companyType: 'Carrier'
    };
  } // constructor

  render() {
    const { companyType } = this.state;
    return (
      <React.Fragment>
        <div>
          Hello
        </div>
        { companyType === 'Carrier' && <DashboardCarrierPage/>}
        { companyType === 'Customer' && <DashboardCustomerPage/>}
      </React.Fragment>
    );
  }
}

export default DashboardPage;
