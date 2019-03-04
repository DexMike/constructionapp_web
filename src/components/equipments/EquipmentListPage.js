import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal,
  Button
} from 'reactstrap';
import moment from 'moment';
import EquipmentService from '../../api/EquipmentService';
import TTable from '../common/TTable';
import AddTruckForm from '../addTruck/AddTruckForm';
import '../addTruck/AddTruck.css';
import ProfileService from '../../api/ProfileService';

class EquipmentListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyId: 0,
      activeTab: '1',
      equipments: [],
      goToDashboard: false,
      goToAddEquipment: false,
      goToUpdateEquipment: false,
      equipmentId: 0,
      modal: false,
      selectedItemData: {}
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleEquipmentEdit = this.handleEquipmentEdit.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleAddTruckModal = this.toggleAddTruckModal.bind(this);
  }

  componentDidMount() {
    this.loadEquipments();
  }

  async loadEquipments() {
    const { modal } = this.state;
    // load only if the modal is not present
    if (!modal) {
      await this.fetchEquipments();
      this.setState({ loaded: true });
      const equipments = await this.fetchEquipments();
      this.setState({ equipments });
    }
  }

  toggle(tab) {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  toggleAddTruckModal() {
    const { modal } = this.state;
    this.setState({
      modal: !modal
    }, this.loadEquipments);
  }

  async fetchEquipments() {
    const profile = await ProfileService.getProfile();
    this.setState({
      companyId: profile.companyId
    });

    let equipments = await EquipmentService.getEquipments();
    equipments = equipments.map((equipment) => {
      const newEquipment = equipment;
      newEquipment.modifiedOn = moment(equipment.modifiedOn)
        .format();
      newEquipment.createdOn = moment(equipment.createdOn)
        .format();
      return newEquipment;
    });
    return equipments;
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  returnItemData(id) {
    const { equipments } = this.state;
    if (id !== 0) {
      const obj = equipments.find(obj => obj.id === id);
      this.setState({ selectedItemData: obj });
    }
    return false;
  }

  handleEquipmentEdit(id) {
    console.log(id);
    this.returnItemData(id);
    /*
    this.setState({
      goToUpdateEquipment: true,
      equipmentId: id
    });
    */
    // instead of going to the edit, let's call up the modal
    this.toggleAddTruckModal();
  }

  renderGoTo() {
    const { goToDashboard, goToAddEquipment, goToUpdateEquipment, equipmentId } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/" />;
    }
    if (goToAddEquipment) {
      return <Redirect push to="/trucks/save" />;
    }
    if (goToUpdateEquipment) {
      return <Redirect push to={`/trucks/save/${equipmentId}`} />;
    }
    return true;
  }

  renderModal() {
    // const { match } = this.props;
    const {
      totalTrucks,
      modal,
      companyId,
      selectedItemData
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
            toggle={this.toggleAddTruckModal}
            passedInfo={selectedItemData}
          />
        </div>
      </Modal>
    );
  }

  render() {
    let { equipments } = this.state;
    const { loaded } = this.state;
    equipments = equipments.map((equipment) => {
      const newEquipment = equipment;
      newEquipment.hourRate = `$${newEquipment.hourRate}`;
      newEquipment.tonRate = `$${newEquipment.tonRate}`;
      return newEquipment;
    });
    if (loaded) {
      return (
        <React.Fragment>
          { this.renderModal() }
          <Container className="dashboard">
            {this.renderGoTo()}
            <button type="button" className="app-link"
              onClick={() => this.handlePageClick('Dashboard')}
            >
              Dashboard
            </button>
            &nbsp;&#62; Trucks
            <Row>
              <Col md={12}>
                <h3 className="page-title">Equipment</h3>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Button color="secondary" onClick={this.toggleAddTruckModal} type="button">
                  Add a Truck
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md={12} lg={12}>
                <Card>
                  <CardBody className="products-list">
                    <div className="tabs tabs--bordered-bottom">
                      <div className="tabs__wrap">
                        <TTable
                          columns={
                            [
                              {
                                name: 'id',
                                displayName: 'ID'
                              },
                              {
                                name: 'image',
                                displayName: 'Truck Image'
                              },
                              {
                                name: 'name',
                                displayName: 'Name'
                              },
                              {
                                name: 'type',
                                displayName: 'Type'
                              },
                              {
                                name: 'maxCapacity',
                                displayName: 'Capacity'
                              },
                              {
                                name: 'hourRate',
                                displayName: 'Rate per Hour'
                              },
                              {
                                name: 'tonRate',
                                displayName: 'Rate per Ton'
                              }
                            ]
                          }
                              data={equipments}
                              handleIdClick={this.handleEquipmentEdit}
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
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

export default EquipmentListPage;
