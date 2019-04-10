import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobService from '../../api/JobService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { Container } from 'reactstrap';
import MarketplaceCarrierPage from './MarketplaceCarrierPage';
import MarketplaceCustomerPage from './MarketplaceCustomerPage';
import ProfileService from '../../api/ProfileService';
import '../addTruck/AddTruck.css';

class MarketplaceList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: null,
      // companyId: 0,
      // totalTrucks: 0,
      modal: false,
      byTonByHour: 'Hour' // default to byTon
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

  renderMarketplaceFromCompanyType() {
    const {
      companyType,
      byTonByHour
    } = this.state;

    return (
      <React.Fragment>
        { companyType === 'Carrier' && <MarketplaceCarrierPage/>}
        {/* { companyType === 'Customer' && <MarketplaceCustomerPage/>} */}
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
          { !!companyType && this.renderMarketplaceFromCompanyType()}
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
