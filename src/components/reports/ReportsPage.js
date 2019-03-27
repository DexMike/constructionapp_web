import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobService from '../../api/JobService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { Container } from 'reactstrap';
import ReportsCarrierPage from './ReportsCarrierPage';
import ReportsCustomerPage from './ReportsCustomerPage';
import ProfileService from '../../api/ProfileService';
import '../addTruck/AddTruck.css';

class ReportsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: null
    };
  } // constructor

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({
      companyType: profile.companyType,
      loaded: true
    });
  }

  renderReportsFromCompanyType() {
    // console.log(56);
    const { companyType } = this.state;
    return (
      <React.Fragment>
        { companyType === 'Carrier' && <ReportsCarrierPage/>}
        { companyType === 'Customer' && <ReportsCustomerPage/>}
      </React.Fragment>
    );
  }

  render() {
    const { companyType, loaded } = this.state;
    if (loaded) {
      return (
        <React.Fragment>
          { !!companyType && this.renderReportsFromCompanyType()}
        </React.Fragment>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

export default ReportsPage;
