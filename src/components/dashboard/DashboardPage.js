import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobService from '../../api/JobService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import DashboardCarrierPage from './DashboardCarrierPage';
import DashboardCustomerPage from './DashboardCustomerPage';
import ProfileService from '../../api/ProfileService';

class DashboardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: null
    };
  } // constructor


  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({ companyType: profile.companyType });
  }

  renderDashboardFromCompanyType() {
    const { companyType } = this.state;
    return (
      <React.Fragment>
        { companyType === 'Carrier' && <DashboardCarrierPage/>}
        { companyType === 'Customer' && <DashboardCustomerPage/>}
      </React.Fragment>
    );
  }

  render() {
    const { companyType } = this.state;
    return (
      <React.Fragment>
        { !!companyType && this.renderDashboardFromCompanyType()}
      </React.Fragment>
    );
  }
}

export default DashboardPage;
