import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import JobService from '../../api/JobService';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { Modal, Container } from 'reactstrap';
import DashboardCarrierPage from './DashboardCarrierPage';
import DashboardCustomerPage from './DashboardCustomerPage';
import ProfileService from '../../api/ProfileService';
import EquipmentsService from '../../api/EquipmentService';
import AddTruckForm from '../add_truck/AddTruckForm';
import '../add_truck/AddTruck.css';

class DashboardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyType: null,
      companyId: 0,
      totalTrucks: 0,
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
    this.setState({
      modal: !modal
    });
  }

  // Pull trucks
  async fetchCompanyTrucks() {
    const profile = await ProfileService.getProfile();
    this.setState({ companyId: profile.companyId });
    const materials = await EquipmentsService.getEquipmentByCompanyIdAndType(
      profile.companyId,
      'Truck'
    );
    // DO NOT LAUNCH THE MODAL AT THIS TIME
    // this.toggleAddTruckModal();
    // console.log(materials.length);
    this.setState({
      totalTrucks: materials.length,
      loaded: true
    });
  }
  /**/

  renderDashboardFromCompanyType() {
    // console.log(56);
    const { companyType } = this.state;
    return (
      <React.Fragment>
        { companyType === 'Carrier' && <DashboardCarrierPage/>}
        { companyType === 'Customer' && <DashboardCustomerPage/>}
      </React.Fragment>
    );
  }

  renderModal() {
    // const { match } = this.props;
    const {
      totalTrucks,
      modal,
      companyId
    } = this.state;
    let tabShow = 1;
    if (totalTrucks > 0) {
      tabShow = 3;
    }
    const company = {
      name: '',
      id: companyId
    };
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleAddTruckModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__body" style={{ padding: '0px' }}>
          <AddTruckForm
            id={companyId}
            company={company}
            incomingPage={tabShow}
            handlePageClick={() => {}}
          />
        </div>
      </Modal>
    );
  }

  render() {
    const { companyType, loaded } = this.state;
    if (loaded) {
      return (
        <React.Fragment>
          { this.renderModal() }
          { !!companyType && this.renderDashboardFromCompanyType()}
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

export default DashboardPage;
