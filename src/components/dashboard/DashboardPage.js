import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobService from '../../api/JobService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { Container } from 'reactstrap';
import DashboardCarrierPage from './DashboardCarrierPage';
import DashboardDriverPage from './DashboardDriverPage';
import DashboardCustomerPage from './DashboardCustomerPage';
import ProfileService from '../../api/ProfileService';
// import EquipmentsService from '../../api/EquipmentService';
// import AddTruckForm from '../addTruck/AddTruckForm';
import '../addTruck/AddTruck.css';

class DashboardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: null,
      // companyId: 0,
      // totalTrucks: 0,
      modal: false
    };
    this.toggleAddTruckModal = this.toggleAddTruckModal.bind(this);
  } // constructor


  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({ companyType: profile.companyType });
    await this.fetchCompanyTrucks();
  }

  toggleAddTruckModal() {
    const { modal } = this.state;
    this.setState({ modal: !modal });
  }

  // Pull trucks
  async fetchCompanyTrucks() {
    // const profile = await ProfileService.getProfile();
    /*
    const equipments = await EquipmentsService.getEquipmentByCompanyIdAndType(
      profile.companyId,
      'Truck'
    );
    */
    // DO NOT LAUNCH THE MODAL AT THIS TIME
    // this.toggleAddTruckModal();
    // console.log(materials.length);
    this.setState({
      // companyId: profile.companyId,
      // totalTrucks: equipments.length,
      loaded: true
    });
  }
  /**/

  renderDashboardFromCompanyType() {
    // console.log(56);
    const { companyType } = this.state;
    return (
      <React.Fragment>
        {/* companyType === 'Carrier' && <DashboardDriverPage/> */}
        { companyType === 'Carrier' && <DashboardCarrierPage/>}
        { companyType === 'Customer' && <DashboardCustomerPage/>}
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
    const { companyType, loaded } = this.state;
    if (loaded) {
      return (
        <React.Fragment>
          {/*
            !!companyType && companyType === 'Carrier' && totalTrucks >= 0 && this.renderModal()
          */}
          { !!companyType && this.renderDashboardFromCompanyType()}
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

export default DashboardPage;
