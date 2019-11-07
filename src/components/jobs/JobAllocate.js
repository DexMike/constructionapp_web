import React, {Component} from 'react';
import { Button, Card, CardBody, Col, Container, Modal, Row } from 'reactstrap';
import TSubmitButton from '../common/TSubmitButton';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import LoadService from '../../api/LoadService';
import UserService from '../../api/UserService';
import TTable from '../common/TTable';
import CardTitle from 'reactstrap/es/CardTitle';

class JobAllocate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      btnSubmitting: false,
      driversWithLoads: [],
      bookingEquipments: [],
      selectedDrivers: [],
      drivers: []
    };
    this.handleAllocateDrivers = this.handleAllocateDrivers.bind(this);
    this.unallocateDriver = this.unallocateDriver.bind(this);
  }

  async componentDidMount() {
    const { booking } = { ...this.props };
    let { bookingEquipments, selectedDrivers } = { ...this.state };
    const { driversWithLoads } = { ...this.state };
    if (booking) {
      try {
        bookingEquipments = await BookingEquipmentService
          .getBookingEquipmentsByBookingId(booking.id);
        selectedDrivers = bookingEquipments
          .map(bookingEquipmentItem => bookingEquipmentItem.driverId);
        const driversResponse = await LoadService.getDriversWithLoadsByBookingId(booking.id);
        if (driversResponse && driversResponse.length > 0) {
          driversResponse.map(driver => (
            driversWithLoads.push(driver.id)
          ));
        }
      } catch (err) {
        console.error('Was not able to fetch booking equipments');
      }
    }
    this.setState({ bookingEquipments, selectedDrivers, driversWithLoads });
  }

  async handleAllocateDrivers() {
    try {
      // console.log('saving...');
      const { selectedDrivers } = { ...this.state };
      const { booking, profile, job } = { ...this.props };
      const newBookingEquipments = selectedDrivers.map(selectedDriver => ({
        bookingId: booking.id,
        schedulerId: profile.userId,
        driverId: selectedDriver,
        equipmentId: null, // NOTE: for now don't reference equipment
        rateType: booking.rateType, // This could be from equipment
        rateActual: 0,
        startTime: new Date(),
        endTime: new Date(),
        startAddressId: job.startAddress.id,
        endAddressId: job.endAddress.id,
        notes: '',
        createdBy: profile.userId,
        createdOn: new Date(),
        modifiedBy: profile.userId,
        modifiedOn: new Date()
      }));
      await BookingEquipmentService.allocateDrivers(newBookingEquipments, booking.id);
    } catch (err) {
      // console.error(err);
    }
    this.toggleAllocateDriversModal();
    this.toggleAllocateDriversModal = this.toggleAllocateDriversModal.bind(this);
  }

  async toggleAllocateDriversModal() {
    const {allocateDriversModal, driversWithLoads} = { ...this.state };
    const { booking, profile } = { ...this.props };
    const driversResponse = await LoadService.getDriversWithLoadsByBookingId(booking.id);
    if (driversResponse && driversResponse.length > 0) {
      driversResponse.map(driver => (
        driversWithLoads.push(driver.id)
      ));
    }
    this.setState({btnSubmitting: true});
    const bookingEquipments = await BookingEquipmentService
      .getBookingEquipmentsByBookingId(booking.id);
    const selectedDrivers = bookingEquipments
      .map(bookingEquipmentItem => bookingEquipmentItem.driverId);
    const drivers = await UserService.getDriversWithUserInfoByCompanyId(profile.companyId);
    let enabledDrivers = [];
    Object.values(drivers).forEach((itm) => {
      const newDriver = {...itm};
      if (newDriver.driverStatus === 'Enabled' || newDriver.userStatus === 'Driver Enabled' || newDriver.userStatus === 'Enabled') {
        newDriver.fullName = `${newDriver.firstName} ${newDriver.lastName}`;
        enabledDrivers.push(newDriver);
      }
    });
    // Setting id to driverId since is getting the userId and saving it as driverId
    enabledDrivers = enabledDrivers.map((driver) => {
      const newDriver = driver;
      newDriver.id = newDriver.driverId;
      if (driversWithLoads.includes(newDriver.driverId)) {
        newDriver.checkboxDisabled = true;
      }
      return newDriver;
    });
    this.setState({
      allocateDriversModal: !allocateDriversModal,
      selectedDrivers,
      drivers: enabledDrivers,
      btnSubmitting: false,
      driversWithLoads
    });
  }

  unallocateDriver(id) {
    let { bookingEquipments } = { ...this.state };
    bookingEquipments = bookingEquipments.filter(bookingEquipment => bookingEquipment.id !== id);
    this.setState({ bookingEquipments });
  }

  renderAllocateDriversModal() {
    const {
      allocateDriversModal,
      drivers,
      selectedDrivers,
      btnSubmitting,
      driversWithLoads
    } = this.state;
    const driverData = drivers;
    const driverColumns = [
      {
        displayName: 'Name',
        name: 'fullName'
      }, {
        displayName: 'Phone',
        name: 'mobilePhone'
      }
    ];
    return (
      <Modal
        isOpen={allocateDriversModal}
        toggle={this.toggleAllocateDriversModal}
        className="allocate-modal"
        backdrop="static"
      >
        <div className="modal__body" style={{padding: '0px'}}>
          <Container className="dashboard">
            <Row>
              <Col md={12} lg={12}>
                <Card style={{paddingBottom: 0}}>
                  <h1 style={{
                    marginTop: 20,
                    marginLeft: 20
                  }}
                  >
                    Allocate Drivers
                  </h1>

                  <div className="row">

                    <TTable
                      handleRowsChange={() => {}}
                      data={driverData}
                      columns={driverColumns}
                      handlePageChange={() => {}}
                      handleIdClick={() => {}}
                      isSelectable
                      onSelect={selected => this.setState({selectedDrivers: selected})}
                      selected={selectedDrivers}
                      omitFromSelect={driversWithLoads}
                    />
                    <div className="col-md-8"/>
                    <div className="col-md-4 text-right pr-4">
                      <Button type="button" className="tertiaryButton" onClick={() => {
                        this.toggleAllocateDriversModal();
                      }}
                      >
                        Cancel
                      </Button>
                      <TSubmitButton
                        onClick={this.handleAllocateDrivers}
                        className="primaryButton"
                        loading={btnSubmitting}
                        loaderSize={10}
                        bntText="Save"
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </Modal>
    );
  }

  renderBookingEquipmentActions(id) {
    return (
      <div onClick={() => this.unallocateDriver(id)}>
        <i className="material-icons iconSet">ic_highlight_off</i>
      </div>
    );
  }

  render() {
    const { btnSubmitting } = { ...this.state };
    let { bookingEquipments } = { ...this.state };
    bookingEquipments = bookingEquipments.map(bookingEquipment => ({
      ...bookingEquipment,
      actions: this.renderBookingEquipmentActions(bookingEquipment.id)
    }));
    return (
      <React.Fragment>
        { this.renderAllocateDriversModal() }
        <Container>
          <Card>
            <CardBody className="card-full-height">
              {/* <CardTitle>Allocate Drivers</CardTitle> */}
              <Row>
                <TSubmitButton
                  onClick={() => this.toggleAllocateDriversModal()}
                  className="primaryButton"
                  loading={btnSubmitting}
                  loaderSize={10}
                  bntText="Allocate Drivers"
                />
              </Row>
              <Row>
                {
                  bookingEquipments.length > 0
                  && (
                  <TTable
                    handleRowsChange={() => {
                    }}
                    columns={[
                      {
                        displayName: 'id',
                        name: 'id'
                      }, {
                        displayName: 'equipmentId',
                        name: 'equipmentId'
                      }, {
                        displayName: 'driverId',
                        name: 'driverId'
                      }, {
                        displayName: 'createdOn',
                        name: 'createdOn'
                      }, {
                        displayName: 'Actions',
                        name: 'actions'
                      }
                    ]}
                    handlePageChange={() => {
                    }}
                    data={bookingEquipments}
                    handleIdClick={() => {
                    }}
                  />
                  )
                }
                {
                  bookingEquipments.length <= 0
                  && (
                    <span>You have no allocated drivers.</span>
                  )
                }
              </Row>
            </CardBody>
          </Card>
        </Container>
      </React.Fragment>
    );
  }
}

export default JobAllocate;
