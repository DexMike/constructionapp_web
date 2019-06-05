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
import '../addTruck/AddTruck.css';

class EquipmentListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      activeTab: '1',
      equipments: [],
      // goToDashboard: false,
      // goToAddEquipment: false,
      // goToUpdateEquipment: false,
      equipmentId: 0,
      companyId: 0,
      modal: false,
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
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({ companyId: profile.companyId });
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
      companyId
    } = this.state;
    let tabShow = 1;
    if (totalTrucks > 0) {
      tabShow = 3;
    }
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleAddTruckModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__body" style={{ padding: '0px' }}>
          <AddTruckForm
            equipmentId={equipmentId}
            companyId={companyId}
            incomingPage={tabShow}
            handlePageClick={() => {}}
            toggle={this.toggleAddTruckModal}
            passedInfo={selectedItemData}
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

      newEquipment.newMaxCapacity = TFormat.asTons(newEquipment.maxCapacity);
      newEquipment.newHourRate = TFormat.asMoneyByHour(newEquipment.hourRate);
      newEquipment.newTonRate = TFormat.asMoneyByTons(newEquipment.tonRate);

      return newEquipment;
    });

    if (loaded) {
      return (
        <React.Fragment>
          { this.renderModal() }
          <Container className="dashboard">
            <Row>
              <Col md={12}>
                <h3 className="page-title">Trucks</h3>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Button
                  onClick={this.toggleAddTruckModalClear}
                  type="button"
                  className="primaryButton"
                >
                  Add a Truck
                </Button>
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
                                displayName: 'Capacity'
                              },
                              {
                                name: 'newHourRate',
                                displayName: 'Rate per Hour'
                              },
                              {
                                name: 'newTonRate',
                                displayName: 'Rate per Ton'
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
