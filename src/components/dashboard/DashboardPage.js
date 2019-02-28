import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobsService from '../../api/JobsService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { Auth } from 'aws-amplify';
import DashboardCarrierPage from './DashboardCarrierPage';
import DashboardCustomerPage from './DashboardCustomerPage';
import ProfileService from '../../api/ProfileService';
import EquipmentsService from '../../api/EquipmentService';

class DashboardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: null,
      loaded: false,
      totalTrucks: 0,
      modal: false
    };
    // this.toggleAddTruckModal = this.toggleAddTruckModal.bind(this);
  } // constructor


  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    console.log(profile);
    // await this.fetchCompanyTrucks();
    this.setState({ companyType: profile.companyType });
  }

  // Pull trucks
  /*
  async fetchCompanyTrucks() {
    const { match } = this.props;
    const materials = await EquipmentsService.getEquipmentByCompanyIdAndType(
      match.params.id,
      'Truck'
    );
    // console.log(materials);
    this.toggleAddTruckModal();
    this.setState({
      totalTrucks: materials.length,
      loaded: true
    });
  }
  */

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
