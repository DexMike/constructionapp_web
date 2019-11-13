import React, { Component } from 'react';
import { Button, Card, CardBody, Col, Container, Modal, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import TSubmitButton from '../common/TSubmitButton';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import LoadService from '../../api/LoadService';
// import UserService from '../../api/UserService';
import TTable from '../common/TTable';
// import CardTitle from 'reactstrap/es/CardTitle';
import SelectField from '../common/TSelect';
import EquipmentService from '../../api/EquipmentService';
import EquipmentDetailService from '../../api/EquipmentDetailService';

class JobAllocate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      btnSubmitting: false,
      driversWithLoads: [],
      bookingEquipments: [],
      // selectedDrivers: [],
      drivers: [],
      equipments: [],
      selectedEquipment: null,
      selectedDriver: null,
      reqHandlerEquipment: { touched: false, error: '' },
      reqHandlerDriver: { touched: false, error: '' }
    };
    this.handleAllocateDrivers = this.handleAllocateDrivers.bind(this);
    this.unAllocateDriver = this.unAllocateDriver.bind(this);
    // this.toggleAllocateDriversModal = this.toggleAllocateDriversModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleSelectEquipment = this.handleSelectEquipment.bind(this);
    this.handleSelectDriver = this.handleSelectDriver.bind(this);
  }

  async componentDidMount() {
    const { booking, profile, t } = { ...this.props };
    let { bookingEquipments, equipments, drivers } = { ...this.state };
    const { driversWithLoads } = { ...this.state };
    const translate = t;
    if (booking) {
      try {
        // 999 since not able to page dropdown and trucks per company should be a small amount.
        equipments = await EquipmentService.getEquipmentByCompanyId(profile.companyId, 999, 0);
        equipments = equipments.data.map(equipment => ({
          label: (equipment.externalEquipmentNumber
            ? equipment.externalEquipmentNumber
            : translate('Number not set')),
          value: equipment.id,
          defaultDriverId: equipment.defaultDriverId
        }));
        drivers = await EquipmentDetailService.getDefaultDriverList(profile.companyId);
        drivers = drivers.data.map(driver => ({
          label: `${driver.firstName} ${driver.lastName}`,
          value: driver.driverId
        }));
        bookingEquipments = await BookingEquipmentService
          .getBookingEquipmentsByBookingId(booking.id);
        // selectedDrivers = bookingEquipments
        //   .map(bookingEquipmentItem => bookingEquipmentItem.driverId);
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
    this.setState({
      bookingEquipments,
      // selectedDrivers,
      driversWithLoads,
      equipments,
      drivers
    });
  }

  async handleAllocateDrivers() {
    const { booking, profile, job } = { ...this.props };
    const { bookingEquipments, selectedDriver, selectedEquipment } = { ...this.state };
    const isValid = this.isFormValid();
    if (!isValid) {
      return;
    }
    let newBookingEquipment = {
      // id: bookingEquipments.length + 1,
      bookingId: booking.id,
      schedulerId: profile.userId,
      driverId: selectedDriver.value,
      equipmentId: selectedEquipment.value,
      rateType: booking.rateType, // This could be from equipment
      rateActual: 0,
      startTime: moment().utc().format(),
      endTime: moment().utc().format(),
      startAddressId: job.startAddress.id,
      endAddressId: job.endAddress.id,
      notes: '',
      createdBy: profile.userId,
      createdOn: moment().utc().format(),
      modifiedBy: profile.userId,
      modifiedOn: moment().utc().format()
    };
    try {
      [newBookingEquipment] = await BookingEquipmentService
        .allocateDrivers([newBookingEquipment], booking.id);
    } catch (err) {
      console.log('Failed to save the booking equipment.');
    }
    bookingEquipments.push(newBookingEquipment);
    this.toggleModal();
    this.setState({
      bookingEquipments
    });
    // try {
    //   // console.log('saving...');
    //   const { selectedDrivers } = { ...this.state };
    //   const { booking, profile, job } = { ...this.props };
    //   const newBookingEquipments = selectedDrivers.map(selectedDriver => ({
    //     bookingId: booking.id,
    //     schedulerId: profile.userId,
    //     driverId: selectedDriver,
    //     equipmentId: null, // NOTE: for now don't reference equipment
    //     rateType: booking.rateType, // This could be from equipment
    //     rateActual: 0,
    //     startTime: new Date(),
    //     endTime: new Date(),
    //     startAddressId: job.startAddress.id,
    //     endAddressId: job.endAddress.id,
    //     notes: '',
    //     createdBy: profile.userId,
    //     createdOn: new Date(),
    //     modifiedBy: profile.userId,
    //     modifiedOn: new Date()
    //   }));
    //   await BookingEquipmentService.allocateDrivers(newBookingEquipments, booking.id);
    // } catch (err) {
    //   // console.error(err);
    // }
    //
    // this.toggleAllocateDriversModal();
  }

  // async toggleAllocateDriversModal() {
  //   const { allocateDriversModal, driversWithLoads } = { ...this.state };
  //   const { booking, profile } = { ...this.props };
  //   const driversResponse = await LoadService.getDriversWithLoadsByBookingId(booking.id);
  //   if (driversResponse && driversResponse.length > 0) {
  //     driversResponse.map(driver => (
  //       driversWithLoads.push(driver.id)
  //     ));
  //   }
  //   this.setState({ btnSubmitting: true });
  //   const bookingEquipments = await BookingEquipmentService
  //     .getBookingEquipmentsByBookingId(booking.id);
  //   const selectedDrivers = bookingEquipments
  //     .map(bookingEquipmentItem => bookingEquipmentItem.driverId);
  //   const drivers = await UserService.getDriversWithUserInfoByCompanyId(profile.companyId);
  //   let enabledDrivers = [];
  //   Object.values(drivers).forEach((itm) => {
  //     const newDriver = { ...itm };
  //     if (newDriver.driverStatus === 'Enabled' || newDriver.userStatus === 'Driver Enabled'
  //     || newDriver.userStatus === 'Enabled') {
  //       newDriver.fullName = `${newDriver.firstName} ${newDriver.lastName}`;
  //       enabledDrivers.push(newDriver);
  //     }
  //   });
  //   // Setting id to driverId since is getting the userId and saving it as driverId
  //   enabledDrivers = enabledDrivers.map((driver) => {
  //     const newDriver = driver;
  //     newDriver.id = newDriver.driverId;
  //     if (driversWithLoads.includes(newDriver.driverId)) {
  //       newDriver.checkboxDisabled = true;
  //     }
  //     return newDriver;
  //   });
  //   this.setState({
  //     allocateDriversModal: !allocateDriversModal,
  //     selectedDrivers,
  //     drivers: enabledDrivers,
  //     btnSubmitting: false,
  //     driversWithLoads
  //   });
  // }

  toggleModal() {
    const { allocateDriversModal } = { ...this.state };
    this.setState({
      allocateDriversModal: !allocateDriversModal,
      selectedEquipment: null,
      selectedDriver: null,
      reqHandlerEquipment: { touched: false, error: '' },
      reqHandlerDriver: { touched: false, error: '' }
    });
  }

  async unAllocateDriver(id, isAlreadyDrivingMatch) {
    const { t } = { ...this.props };
    const translate = t;
    let { bookingEquipments } = { ...this.state };
    if (isAlreadyDrivingMatch) {
      alert(translate('You cannot remove drivers that have already started a load'));
    } else {
      try {
        await BookingEquipmentService.deleteBookingEquipmentById(id);
      } catch (err) {
        console.log('Failed to remove the booking equipment');
      }
      bookingEquipments = bookingEquipments.filter(bookingEquipment => bookingEquipment.id !== id);
      this.setState({ bookingEquipments });
    }
  }

  handleSelectDriver(data) {
    const { reqHandlerDriver } = { ...this.state };
    reqHandlerDriver.touched = false;
    this.setState({
      selectedDriver: data,
      reqHandlerDriver
    });
  }

  handleSelectEquipment(data) {
    const { reqHandlerEquipment, drivers } = { ...this.state };
    reqHandlerEquipment.touched = false;
    // TODO set default driver
    const selectedDriver = drivers.find(driver => driver.value === data.defaultDriverId);
    this.setState({
      selectedDriver,
      selectedEquipment: data,
      reqHandlerEquipment
    });
  }

  isFormValid() {
    const { t } = { ...this.props };
    const translate = t;
    const { selectedEquipment, selectedDriver } = { ...this.state };
    let isValid = true;
    let reqHandlerEquipment = { touched: false };
    let reqHandlerDriver = { touched: false };

    if (selectedEquipment === null) {
      reqHandlerEquipment = {
        touched: true,
        error: translate('Please select the truck')
      };
      isValid = false;
    }

    if (selectedDriver === null) {
      reqHandlerDriver = {
        touched: true,
        error: translate('Please select the driver')
      };
      isValid = false;
    }

    this.setState({
      reqHandlerEquipment,
      reqHandlerDriver
    });
    return isValid;
  }

  // renderAllocateDriversModalOld() {
  //   const {
  //     allocateDriversModal,
  //     drivers,
  //     selectedDrivers,
  //     btnSubmitting,
  //     driversWithLoads
  //   } = this.state;
  //   const driverData = drivers;
  //   const driverColumns = [
  //     {
  //       displayName: 'Name',
  //       name: 'fullName'
  //     }, {
  //       displayName: 'Phone',
  //       name: 'mobilePhone'
  //     }
  //   ];
  //   return (
  //     <Modal
  //       isOpen={allocateDriversModal}
  //       toggle={this.toggleModal}
  //       className="allocate-modal"
  //       backdrop="static"
  //     >
  //       <div className="modal__body" style={{ padding: '0px' }}>
  //         <Container className="dashboard">
  //           <Row>
  //             <Col md={12} lg={12}>
  //               <Card style={{ paddingBottom: 0 }}>
  //                 <h1 style={{
  //                   marginTop: 20,
  //                   marginLeft: 20
  //                 }}
  //                 >
  //                   Allocate Drivers
  //                 </h1>
  //
  //                 <div className="row">
  //
  //                   <TTable
  //                     handleRowsChange={() => {
  //                     }}
  //                     data={driverData}
  //                     columns={driverColumns}
  //                     handlePageChange={() => {
  //                     }}
  //                     handleIdClick={() => {
  //                     }}
  //                     isSelectable
  //                     onSelect={selected => this.setState({ selectedDrivers: selected })}
  //                     selected={selectedDrivers}
  //                     omitFromSelect={driversWithLoads}
  //                   />
  //                   <div className="col-md-8"/>
  //                   <div className="col-md-4 text-right pr-4">
  //                     <Button
  //                       type="button"
  //                       className="tertiaryButton"
  //                       onClick={this.toggleModal}
  //                     >
  //                       Cancel
  //                     </Button>
  //                     <TSubmitButton
  //                       onClick={this.handleAllocateDrivers}
  //                       className="primaryButton"
  //                       loading={btnSubmitting}
  //                       loaderSize={10}
  //                       bntText="Save"
  //                     />
  //                   </div>
  //                 </div>
  //               </Card>
  //             </Col>
  //           </Row>
  //         </Container>
  //       </div>
  //     </Modal>
  //   );
  // }

  renderAllocateDriversModal() {
    const {
      allocateDriversModal,
      equipments,
      selectedEquipment,
      drivers,
      selectedDriver,
      btnSubmitting,
      reqHandlerEquipment,
      reqHandlerDriver
    } = this.state;
    const { t } = { ...this.props };
    const translate = t;
    // const driverData = drivers;
    // const driverColumns = [
    //   {
    //     displayName: 'Name',
    //     name: 'fullName'
    //   }, {
    //     displayName: 'Phone',
    //     name: 'mobilePhone'
    //   }
    // ];
    return (
      <Modal
        isOpen={allocateDriversModal}
        toggle={this.toggleModal}
        className="allocate-modal"
        backdrop="static"
      >
        <div className="modal__body" style={{
          paddingLeft: '30px',
          paddingRight: '30px'
        }}
        >
          <Container className="dashboard">
            <Card style={{ paddingBottom: 0 }}>
              <Row>
                <h1 style={{
                  marginTop: 20,
                  marginLeft: 20
                }}
                >
                  {translate('Allocate Drivers')}
                </h1>
              </Row>
              <Row>
                <Col md={4}>
                  <span>{translate('Truck Number')}</span>
                  <SelectField
                    input={
                      {
                        onChange: this.handleSelectEquipment,
                        name: 'selectedEquipment',
                        value: selectedEquipment
                      }
                    }
                    meta={reqHandlerEquipment}
                    value={selectedEquipment}
                    options={equipments}
                    placeholder={t('Truck')}
                  />
                </Col>
                <Col md={4}>
                  <span>{translate('Driver')}</span>
                  <SelectField
                    input={
                      {
                        onChange: this.handleSelectDriver,
                        name: 'selectedDriver',
                        value: selectedDriver
                      }
                    }
                    meta={reqHandlerDriver}
                    value={selectedDriver}
                    options={drivers}
                    placeholder={t('Driver')}
                  />
                </Col>
              </Row>
              <div className="row">
                <div className="col-md-8"/>
                <div className="col-md-4 text-right pr-4">
                  <Button type="button" className="tertiaryButton" onClick={this.toggleModal}>
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
          </Container>
        </div>
      </Modal>
    );
  }

  renderBookingEquipmentActions(bookingEquipment) {
    const { driversWithLoads } = { ...this.state };
    const isAlreadyDrivingMatch = driversWithLoads
      .find(driverWithLoads => driverWithLoads === bookingEquipment.driverId);
    return (
      <div
        onClick={() => this.unAllocateDriver(bookingEquipment.id, isAlreadyDrivingMatch)}
        aria-hidden="true"
        // role="button"
        // tabIndex="0"
      >
        <i
          className="material-icons iconSet"
          style={{color: isAlreadyDrivingMatch ? 'grey' : 'red'}}
        >
          ic_highlight_off
        </i>
      </div>
    );
  }

  render() {
    const { t } = { ...this.props };
    const translate = t;
    const { btnSubmitting, drivers, equipments } = { ...this.state };
    let { bookingEquipments } = { ...this.state };
    bookingEquipments = bookingEquipments.map((bookingEquipment) => {
      const driverMatch = drivers
        .find(driver => driver.value === bookingEquipment.driverId);
      const driverName = (driverMatch && driverMatch.label) ? driverMatch.label : '-';
      const equipmentMatch = equipments
        .find(equipment => equipment.value === bookingEquipment.equipmentId);
      const externalEquipmentNumber = (equipmentMatch && equipmentMatch.label)
        ? equipmentMatch.label : '-';
      return {
        ...bookingEquipment,
        driverName,
        externalEquipmentNumber,
        actions: this.renderBookingEquipmentActions(bookingEquipment)
      };
    });
    return (
      <React.Fragment>
        {this.renderAllocateDriversModal()}
        <Container>
          <Card>
            <CardBody className="card-full-height">
              {/* <CardTitle>Allocate Drivers</CardTitle> */}
              <Row>
                <TSubmitButton
                  onClick={this.toggleModal}
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
                          displayName: 'Truck',
                          name: 'externalEquipmentNumber'
                        }, {
                          displayName: 'Driver',
                          name: 'driverName'
                        }, {
                          displayName: 'Created On',
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
                    <span>{translate('You have no allocated drivers')}</span>
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

export default withTranslation()(JobAllocate);
