import React, { Component } from 'react';
import { Button, Card, CardBody, Col, Container, Modal, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import TSubmitButton from '../common/TSubmitButton';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import LoadService from '../../api/LoadService';
import TTable from '../common/TTable';
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
      drivers: [],
      equipments: [],
      selectableDrivers: [],
      selectableEquipments: [],
      selectedEquipment: null,
      selectedDriver: null,
      reqHandlerEquipment: { touched: false, error: '' },
      reqHandlerDriver: { touched: false, error: '' }
    };
    this.handleAllocateDrivers = this.handleAllocateDrivers.bind(this);
    this.unAllocateDriver = this.unAllocateDriver.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleSelectEquipment = this.handleSelectEquipment.bind(this);
    this.handleSelectDriver = this.handleSelectDriver.bind(this);
  }

  async componentDidMount() {
    const { booking, profile, t } = { ...this.props };
    let {
      bookingEquipments,
      equipments,
      drivers,
      selectableEquipments,
      selectableDrivers
    } = { ...this.state };
    const { driversWithLoads } = { ...this.state };
    const translate = t;
    if (booking) {
      try {
        bookingEquipments = await BookingEquipmentService
          .getBookingEquipmentsByBookingId(booking.id);
        // 999 since not able to page dropdown and trucks per company should be a small amount.
        equipments = await EquipmentService.getEquipmentByCompanyId(profile.companyId, 999, 0);
        equipments = equipments.data;
        selectableEquipments = equipments
          .filter(equipment => !bookingEquipments
            .some(bookingEquipment => bookingEquipment.equipmentId === equipment.id))
          .map(equipment => ({
            label: (equipment.externalEquipmentNumber
              ? equipment.externalEquipmentNumber
              : translate('Number not set')),
            value: equipment.id,
            defaultDriverId: equipment.defaultDriverId
          }));
        drivers = await EquipmentDetailService.getDefaultDriverList(profile.companyId);
        drivers = drivers.data.map(driver => ({
          ...driver,
          label: `${driver.firstName} ${driver.lastName}`
        }));
        selectableDrivers = drivers
          .filter(driver => !bookingEquipments
            .some(bookingEquipment => bookingEquipment.driverId === driver.driverId))
          .map(driver => ({
            label: driver.label,
            value: driver.driverId
          }));
        const driversResponse = await LoadService.getDriversWithLoadsByBookingId(booking.id);
        if (driversResponse && driversResponse.length > 0) {
          driversResponse.map(driver => (
            driversWithLoads.push(driver.driverId)
          ));
        }
      } catch (err) {
        console.error('Was not able to fetch booking equipments');
      }
    }
    this.setState({
      bookingEquipments,
      driversWithLoads,
      equipments,
      drivers,
      selectableDrivers,
      selectableEquipments
    });
  }

  async handleAllocateDrivers() {    
    const { booking, profile, job, t } = { ...this.props };
    const translate = t;
    const {
      bookingEquipments,
      selectedDriver,
      selectedEquipment,
      equipments,
      drivers
    } = { ...this.state };
    this.setState({ btnSubmitting: true });
    const isValid = this.isFormValid();
    if (!isValid) {
      this.setState({ btnSubmitting: false });
      return;
    }
    let newBookingEquipment = {
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

    const selectableEquipments = equipments
      .filter(equipment => !bookingEquipments
        .some(bookingEquipment => bookingEquipment.equipmentId === equipment.id))
      .map(equipment => ({
        label: (equipment.externalEquipmentNumber
          ? equipment.externalEquipmentNumber
          : translate('Number not set')),
        value: equipment.id,
        defaultDriverId: equipment.defaultDriverId
      }));
    const selectableDrivers = drivers
      .filter(driver => !bookingEquipments
        .some(bookingEquipment => bookingEquipment.driverId === driver.driverId))
      .map(driver => ({
        label: driver.label,
        value: driver.driverId
      }));

    this.toggleModal();
    this.setState({
      bookingEquipments,
      selectableDrivers,
      selectableEquipments,
      btnSubmitting: true
    });
  }

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
    const { equipments, drivers } = { ...this.state };
    let { bookingEquipments, selectableEquipments, selectableDrivers } = { ...this.state };
    if (isAlreadyDrivingMatch) {
      alert(translate('You cannot remove drivers that have already started a load'));
    } else {
      try {
        await BookingEquipmentService.deleteBookingEquipmentById(id);
      } catch (err) {
        console.log('Failed to remove the booking equipment');
      }
      // const deletedBookingEquipment = [...bookingEquipments]
      //   .find(bookingEquipment => bookingEquipment.id !== id);
      bookingEquipments = bookingEquipments.filter(bookingEquipment => bookingEquipment.id !== id);
      selectableEquipments = equipments
        .filter(equipment => !bookingEquipments
          .some(bookingEquipment => bookingEquipment.equipmentId === equipment.id))
        .map(equipment => ({
          label: (equipment.externalEquipmentNumber
            ? equipment.externalEquipmentNumber
            : translate('Number not set')),
          value: equipment.id,
          defaultDriverId: equipment.defaultDriverId
        }));
      selectableDrivers = drivers
        .filter(driver => !bookingEquipments
          .some(bookingEquipment => bookingEquipment.driverId === driver.driverId))
        .map(driver => ({
          label: driver.label,
          value: driver.driverId
        }));
      this.setState({ bookingEquipments, selectableEquipments, selectableDrivers });
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
    const { reqHandlerEquipment, selectableDrivers } = { ...this.state };
    reqHandlerEquipment.touched = false;
    const selectedDriver = selectableDrivers
      .find(driver => driver.value === data.defaultDriverId);
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

  renderAllocateDriversModal() {
    const {
      allocateDriversModal,
      selectedEquipment,
      selectedDriver,
      btnSubmitting,
      selectableEquipments,
      selectableDrivers,
      reqHandlerEquipment,
      reqHandlerDriver
    } = this.state;
    const { t } = { ...this.props };
    const translate = t;
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
                    options={selectableEquipments}
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
                    options={selectableDrivers}
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
    const {
      btnSubmitting,
      drivers,
      equipments,
      selectableDrivers,
      selectableEquipments
    } = { ...this.state };
    let { bookingEquipments } = { ...this.state };
    bookingEquipments = bookingEquipments.map((bookingEquipment) => {
      const driverMatch = drivers
        .find(driver => driver.driverId === bookingEquipment.driverId);
      const driverName = (driverMatch && driverMatch.label) ? driverMatch.label : '-';
      const equipmentMatch = equipments
        .find(equipment => equipment.id === bookingEquipment.equipmentId);
      const externalEquipmentNumber = (equipmentMatch && equipmentMatch.externalEquipmentNumber)
        ? equipmentMatch.externalEquipmentNumber : '-';
      return {
        ...bookingEquipment,
        createdOnFormatted: moment(bookingEquipment.createdOn).format(),
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
                  disabled={selectableDrivers.length <= 0 || selectableEquipments.length <= 0}
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
                          displayName: 'Allocated On',
                          name: 'createdOnFormatted'
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
