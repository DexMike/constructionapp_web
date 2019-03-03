import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobService from '../../api/JobService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
// import { Modal, Container } from 'reactstrap';
import UserCarrierListPage from './UserCarrierListPage';
import UserCustomerListPage from './UserCustomerListPage';
import ProfileService from '../../api/ProfileService';
import UserService from '../../api/UserService';
import '../addTruck/AddTruck.css';

class UserPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: null,
      companyId: 0
    };
  } // constructor

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({ companyType: profile.companyType });
    await this.fetchCompanyUsers();
  }

  async fetchCompanyUsers() {
    const profile = await ProfileService.getProfile();

    const users = await UserService.getUsersByCompanyIdAndType(
      profile.companyId,
      'All'
    );

    this.setState({
      companyId: profile.companyId,
      loaded: true
    });
  }

  render() {
    const { companyType, totalUsers } = this.state;
    return (
      <React.Fragment>
        {companyType === 'Carrier' && <UserCarrierListPage/>}
        {companyType === 'Customer' && <UserCustomerListPage/>}
      </React.Fragment>
    );
  }
}

export default UserPage;
