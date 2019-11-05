import React, { Component } from 'react';
// import TTableOld from "../common/TTableOld";
// import UserSavePage from "./UserSavePage";
import { Redirect } from 'react-router-dom';
import {
  Button,
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
import ProfileService from '../../api/ProfileService';
import AddTruckForm from '../addTruck/AddTruckForm';
import DriverForm from './DriverForm';
// import moment from "moment";
import TFormat from '../common/TFormat';
import './Driver.css';
import { withTranslation } from 'react-i18next';

class DriverListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      isAdmin: null,
      drivers: [],
      currentUser: {},
      goToDashboard: false,
      goToAddDriver: false,
      goToUpdateDriver: false,
      driverId: 0,
      companyId: 0,
      modal: false,
      page: 0,
      rows: 10,
      totalCount: 10
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleDriverEdit = this.handleDriverEdit.bind(this);
    this.toggleAddDriverModal = this.toggleAddDriverModal.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
  }

  async componentDidMount() {
    let { drivers, totalCount } = { ...this.state };
    const profile = await ProfileService.getProfile();
    const currentUser = await UserService.getUserById(profile.userId);
    if (profile.isAdmin) {
      this.setState({ companyId: profile.companyId });
      ({ drivers, totalCount} = await this.fetchDrivers());
    }
    this.setState({
      isAdmin: profile.isAdmin,
      currentUser,
      drivers,
      totalCount,
      loaded: true
    });
  }

  async fetchDrivers() {
    const { companyId, page, rows } = this.state;
    const { t } = { ...this.props };
    const translate = t;
    let { totalCount } = this.state;
    let drivers;
    try {
      const response = await UserService.getCompanyDrivers(companyId, page, rows);
      drivers = response.data;
      totalCount = response.metadata.totalCount;
    } catch (e) {
      // console.log(e);
    }

    if (drivers && drivers.length > 0) {
      drivers = drivers.map((driver) => {
        try {
          const newDriver = {
            id: driver.driverId,
            firstName: driver.firstName,
            lastName: driver.lastName,
            mobilePhone: TFormat.mobileAmericanNumber(driver.mobilePhone),
            userStatus: driver.userStatus,
            driverStatus: driver.driverStatus,
            email: driver.email,
            userId: driver.id,
            defaultEquipment: driver.defaultEquipment ? driver.defaultEquipment : translate('Unassigned')
          };
          return newDriver;
        } catch (error) {
          const newDriver = driver;
          return newDriver;
        }
      });
    }
    return {
      drivers,
      totalCount
    };
  }

  handlePageChange(page) {
    this.setState({ page },
      function wait() {
        this.fetchDrivers();
      });
  }

  handleRowsPerPage(rows) {
    this.setState({ rows },
      function wait() {
        this.fetchDrivers();
      });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleDriverEdit(id) {
    /*
      this.setState({
        modal: true,
        driverId: id
      });
    */
  }

  toggleAddDriverModal() {
    const { modal } = this.state;
    if (modal === true) {
      this.fetchDrivers();
    }
    this.setState({ modal: !modal });
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
    const { modal, driverId, currentUser } = this.state;
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleAddDriverModal}
        className="driver-modal modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <div className="modal__body" style={{ padding: '0px' }}>
          <DriverForm
            toggle={this.toggleAddDriverModal}
            driverId={driverId}
            currentUser={currentUser}
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
    const { drivers, loaded, isAdmin, totalCount } = this.state;
    const { t } = { ...this.props };
    const translate = t;
    if (isAdmin === false) {
      return <Redirect push to="/" />;
    }
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderGoTo()}
          <Row>
            <Col md={12}>
              <h3 className="page-title">Drivers</h3>
              <Button
                className="mt-4"
                color="primary"
                onClick={() => this.setState({ modal: true, driverId: 0 })}
              >
                Add a Driver
              </Button>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  <div className="ml-4 mt-4">
                    Displaying {drivers.length} out of {totalCount} drivers
                  </div>
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
                        name: 'driverStatus',
                        displayName: 'Driver Status'
                      },
                      {
                        name: 'defaultEquipment',
                        displayName: translate('Default Truck')
                      },
                      {
                        name: 'email',
                        displayName: 'Email'
                      }
                    ]}
                    data={drivers}
                    handleIdClick={this.handleDriverEdit}
                    handleRowsChange={this.handleRowsPerPage}
                    handlePageChange={this.handlePageChange}
                    totalCount={totalCount}
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

export default withTranslation()(DriverListPage);
