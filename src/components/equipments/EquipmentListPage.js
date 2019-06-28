import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal,
  Button
} from 'reactstrap';
// import moment from 'moment';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import EquipmentService from '../../api/EquipmentService';
// import EquipmentMaterialsService from '../../api/EquipmentMaterialsService';
import ProfileService from '../../api/ProfileService';
import AddTruckForm from '../addTruck/AddTruckForm';
import EquipmentDetails from './EquipmentDetails';
import MultiEquipmentsForm from './MultiEquipmentsForm';
import '../addTruck/AddTruck.css';
import './Equipment.css';

class EquipmentListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      activeTab: '1',
      equipments: [],
      equipmentId: 0,
      companyId: 0,
      modal: false,
      equipmentsModal: false,
      selectedItemData: {},
      page: 0,
      rows: 10,
      totalCount: 10
    };

    // this.renderGoTo = this.renderGoTo.bind(this);
    this.handleEquipmentEdit = this.handleEquipmentEdit.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleAddTruckModal = this.toggleAddTruckModal.bind(this);
    this.toggleAddTruckModalClear = this.toggleAddTruckModalClear.bind(this);
    this.toggleAddMultiTrucksModal = this.toggleAddMultiTrucksModal.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({
      companyId: profile.companyId,
      userId: profile.userId
    });
    this.loadEquipments();
  }

  async loadEquipments() {
    const { modal } = this.state;
    // load only if the modal is not present
    if (!modal) {
      const response = await this.fetchEquipments();
      const equipments = response.data;
      const { totalCount } = response.metadata;
      this.setState({
        equipments,
        totalCount,
        loaded: true
      });
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

  toggleAddTruckModalClear() {
    const { modal } = this.state;
    this.setState({
      equipmentId: 0, // reset equipmentID, not companyID
      selectedItemData: {},
      modal: !modal
    }, this.loadEquipments);
  }

  toggleAddMultiTrucksModal() {
    const { equipmentsModal } = this.state;
    this.setState({
      equipmentsModal: !equipmentsModal
    }, this.loadEquipments);
  }

  async fetchEquipments() {
    const { companyId, rows, page } = this.state;
    return EquipmentService.getEquipmentByCompanyId(companyId, rows, page);
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  returnItemData(id) {
    const { equipments } = this.state;
    if (id !== 0) {
      for (const equipment of equipments) {
        if (equipment.id === id) {
          this.setState({ selectedItemData: equipment });
        }
      }
    }
    return false;
  }

  handleEquipmentEdit(id) {
    this.returnItemData(id);
    /**/
    this.setState({
      equipmentId: id
    }, function launchModal() {
      this.toggleAddTruckModal();
    });
  }

  handlePageChange(page) {
    this.setState({ page },
      function wait() {
        this.loadEquipments();
      });
  }

  handleRowsPerPage(rows) {
    this.setState({ rows },
      function wait() {
        this.loadEquipments();
      });
  }


  renderModal() {
    const {
      totalTrucks,
      modal,
      selectedItemData,
      equipmentId,
      companyId,
      userId
    } = this.state;
    let tabShow = 1;
    if (totalTrucks > 0) {
      tabShow = 3;
    }
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleAddTruckModal}
        className="equipments-modal modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__body">
          {/* Replaced AddTruckForm for EquipmentDetails */}
          <EquipmentDetails
            equipmentId={equipmentId}
            companyId={companyId}
            userId={userId}
            toggle={this.toggleAddTruckModal}
            // incomingPage={tabShow}
            // handlePageClick={() => {}}
            // passedInfo={selectedItemData}
          />
        </div>
      </Modal>
    );
  }

  renderEquipmentsModal() {
    const { equipmentsModal, userId, companyId } = this.state;
    return (
      <Modal
        isOpen={equipmentsModal}
        toggle={this.toggleAddMultiTrucksModal}
        className="equipments-modal modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__body">
          <MultiEquipmentsForm
            userId={userId}
            companyId={companyId}
            toggle={this.toggleAddMultiTrucksModal}
          />
        </div>
      </Modal>
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
    let { equipments } = this.state;
    const { loaded, totalCount } = this.state;
    equipments = equipments.map((equipment) => {
      const newEquipment = equipment;
      // const tempHourRate = newEquipment.hourRate;
      // const tempTonRate = newEquipment.tonRate;

      newEquipment.newMaxCapacity = newEquipment.maxCapacity;
      newEquipment.newMaxCapacityF = TFormat.getValue(
        TFormat.asTons(newEquipment.maxCapacity)
      );

      newEquipment.newHourRate = newEquipment.hourRate;
      newEquipment.newHourRateF = TFormat.getValue(
        TFormat.asMoneyByHour(newEquipment.hourRate)
      );

      if (newEquipment.tonRate === null) {
        newEquipment.tonRate = 0;
      }
      newEquipment.newTonRate = newEquipment.tonRate;
      newEquipment.newTonRateF = TFormat.getValue(
        TFormat.asMoneyByTons(newEquipment.tonRate)
      );

      return newEquipment;
    });

    if (loaded) {
      return (
        <React.Fragment>
          { this.renderModal() }
          { this.renderEquipmentsModal() }
          <Container className="dashboard">
            <Row>
              <Col md={12}>
                <h3 className="page-title">Trucks</h3>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Button
                  // onClick={this.toggleAddTruckModalClear}
                  onClick={this.toggleAddMultiTrucksModal}
                  type="button"
                  className="primaryButton"
                >
                  {/* Add a Truck */}
                  Add Trucks
                </Button>
                {
                  /*
                  <Button
                    onClick={this.toggleAddTruckModalClear}
                    type="button"
                    className="primaryButton"
                  >
                    Add a Truck and Driver
                  </Button>
                  */
                }
              </Col>
            </Row>
            <Row>
              <Col md={12} lg={12}>
                <Card>
                  <CardBody className="products-list">
                    <div className="ml-4 mt-4">
                      Displaying {equipments.length} out of {totalCount} Trucks
                    </div>
                    <div className="tabs tabs--bordered-bottom">
                      <div className="tabs__wrap">
                        <TTable
                          columns={
                            [
                              /* {
                                name: 'id',
                                displayName: 'ID'
                              }, */
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
                                name: 'newMaxCapacity',
                                displayName: 'Capacity',
                                label: 'newMaxCapacityF'
                              },
                              {
                                name: 'newHourRate',
                                displayName: 'Rate per Hour',
                                label: 'newHourRateF'
                              },
                              {
                                name: 'newTonRate',
                                displayName: 'Rate per Ton',
                                label: 'newTonRateF'
                              },
                              {
                                name: 'materials',
                                displayName: 'Materials'
                              }
                            ]
                          }
                          data={equipments}
                          handleIdClick={this.handleEquipmentEdit}
                          handleRowsChange={this.handleRowsPerPage}
                          handlePageChange={this.handlePageChange}
                          totalCount={totalCount}
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
        <Row>
          <Col md={12}>
            <h3 className="page-title">Trucks</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default EquipmentListPage;
