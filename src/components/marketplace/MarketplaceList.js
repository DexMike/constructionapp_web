import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobService from '../../api/JobService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { Container } from 'reactstrap';
import TrucksCarrierPage from './TrucksCarrierPage';
import TrucksCustomerPage from './TrucksCustomerPage';
import ProfileService from '../../api/ProfileService';
// import EquipmentsService from '../../api/EquipmentService';
// import AddTruckForm from '../addTruck/AddTruckForm';
import '../addTruck/AddTruck.css';

class MarketplaceList extends Component {
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

  renderTrucksFromCompanyType() {
    // console.log(56);
    const { companyType } = this.state;
    return (
      <React.Fragment>
        { companyType === 'Carrier' && <MarketplaceCarrierPage/>}
        { companyType === 'Customer' && <MarketplaceCustomerPage/>}
      </React.Fragment>
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
          { !!companyType && this.renderTrucksFromCompanyType()}
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

export default MarketplaceList;
