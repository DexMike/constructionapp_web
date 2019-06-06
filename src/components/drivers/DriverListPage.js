import React, { Component } from 'react';
// import TTableOld from "../common/TTableOld";
// import UserSavePage from "./UserSavePage";
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal
} from 'reactstrap';
// import ExampleCard from "../ExampleCard";
import TTable from '../common/TTable';
import UserService from '../../api/UserService';
import AddTruckForm from '../addTruck/AddTruckForm';

// import moment from "moment";

class DriverListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      drivers: [],
      activeTab: '3',
      goToDashboard: false,
      goToAddDriver: false,
      goToUpdateDriver: false,
      driverId: 0,
      userId: 0,
      equipmentId: 0,
      companyId: 0,
      modal: false,
      selectedItemData: {}
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.toggle = this.toggle.bind(this);
    this.handleDriverEdit = this.handleDriverEdit.bind(this);
    this.toggleAddTruckModal = this.toggleAddTruckModal.bind(this);
    this.toggleAddTruckModalClear = this.toggleAddTruckModalClear.bind(this);
  }

  async componentDidMount() {
    await this.fetchDrivers();
    this.setState({ loaded: true });
  }

  async fetchDrivers() {
    const drivers = await UserService.getDriversWithUserInfo();
    let driversWithInfo = [];

    if (drivers) {
      driversWithInfo = drivers.map((driver) => {
        try {
          const newDriver = {
            id: driver.driverId,
            firstName: driver.firstName,
            lastName: driver.lastName,
            mobilePhone: driver.mobilePhone,
            email: driver.email,
            userId: driver.id
          };
          return newDriver;
        } catch (error) {
          const newDriver = driver;
          return newDriver;
        }
      });
    }
    this.setState({ drivers: driversWithInfo });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleDriverEdit(id) {
    this.setState({
      goToUpdateDriver: true,
      userId: id
    });
  }

  toggle(tab) {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  async toggleAddTruckModal() {
    const { modal } = this.state;
    this.setState({ modal: !modal });
    await this.fetchDrivers();
  }

  async toggleAddTruckModalClear(id) {
    const { modal } = this.state;
    this.setState({
      equipmentId: 0, // reset equipmentID, not companyID
      selectedItemData: {},
      modal: !modal,
      driverId: id
    });
  }

  renderGoTo() {
    const { goToDashboard, goToAddDriver, goToUpdateDriver, userId } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToAddDriver) {
      return <Redirect push to="/drivers/save"/>;
    }
    if (goToUpdateDriver) {
      return <Redirect push to={`/drivers/save/${userId}`}/>;
      // return <Redirect push to={`/drivers/save/${userId}`}/>;
    }
    return true;
  }

  renderModal() {
    const {
      totalTrucks,
      modal,
      selectedItemData,
      equipmentId,
      companyId,
      driverId
    } = this.state;
    let tabShow = 3;
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
            editDriverId={driverId}
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
    const { drivers, loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderGoTo()}
          <Row>
            <Col md={12}>
              <h3 className="page-title">Drivers</h3>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  <TTable
                    columns={[
                      /* {
                        name: 'id',
                        displayName: 'ID'
                      }, */
                      {
                        name: 'firstName',
                        displayName: 'First Name'
                      },
                      {
                        name: 'lastName',
                        displayName: 'Last Name'
                      },
                      {
                        name: 'mobilePhone',
                        displayName: 'Mobile Phone'
                      },
                      {
                        name: 'email',
                        displayName: 'Email'
                      }
                    ]}
                    data={drivers}
                    // handleIdClick={this.toggleAddTruckModalClear}
                    handleIdClick={this.handleDriverEdit}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <h3 className="page-title">Drivers</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default DriverListPage;
