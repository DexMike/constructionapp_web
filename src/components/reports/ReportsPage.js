import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobService from '../../api/JobService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { Container } from 'reactstrap';
import ReportsCarrierPage from './ReportsCarrierPage';
import ReportsCustomerPage from './ReportsCustomerPage';
import ProfileService from '../../api/ProfileService';
import '../addTruck/AddTruck.css';

class ReportsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: null,
      companyType: null
    };
  } // constructor

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({
      isAdmin: profile.isAdmin,
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
    const { companyType, loaded, isAdmin } = this.state;
    if (isAdmin === false) {
      return <Redirect push to="/" />;
    }
    if (loaded) {
      return (
        <React.Fragment>
          { !!companyType && this.renderReportsFromCompanyType()}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        {this.renderLoader()}
      </React.Fragment>
    );
  }
}

export default ReportsPage;
