import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  Container,
  Card,
  CardBody,
  Col,
  Row,
  Modal,
  Button,
  ButtonToolbar
} from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import ProfileService from '../../api/ProfileService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TFormat from '../common/TFormat';
import TwilioService from '../../api/TwilioService';
import CompanyService from '../../api/CompanyService';
import UserService from '../../api/UserService';
import GroupListService from '../../api/GroupListService';
import TSubmitButton from '../common/TSubmitButton';
import TSpinner from '../common/TSpinner';
import TMap from '../common/TMap';

class JobViewForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();

    this.state = {
      company: [],
      companyCarrier: [],
      companyName: '',
      booking: null,
      ...job,
      bid: [],
      loaded: false,
      favoriteCompany: [],
      profile: [],
      btnSubmitting: false,
      selectedDrivers: [],
      accessForbidden: false,
      modalLiability: false
    };
    this.closeNow = this.closeNow.bind(this);
    this.saveJob = this.saveJob.bind(this);
    this.toggleLiabilityModal = this.toggleLiabilityModal.bind(this);
  }

  async componentDidMount() {
    let {
      job,
      company,
      companyName,
      companyCarrier,
      allTruckTypes,
      booking,
      profile,
      favoriteCompany,
      selectedDrivers
    } = this.state;
    const { jobId } = this.props;

    let startAddress = {};
    let endAddress = {};

    let bid = [];
    let bids = [];
    // const gps = [];
    profile = await ProfileService.getProfile();
    try {
      job = await JobService.getJobById(jobId);
    } catch (e) {
      if (e.message === 'Access Forbidden') {
        // access 403
        this.setState({accessForbidden: true});
        return;
      }
    }
    if (job) {
      if (profile.companyType === 'Carrier') {
        companyCarrier = await CompanyService.getCompanyById(profile.companyId);
      }
      company = await CompanyService.getCompanyById(job.companiesId);
      startAddress = await AddressService.getAddressById(job.startAddress);
      endAddress = null;
      if (job.endAddress) {
        endAddress = await AddressService.getAddressById(job.endAddress);
      }
      const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);

      if (company) {
        companyName = company.legalName;
      }

      if (startAddress) {
        job.startAddress = startAddress;
      }

      if (endAddress) {
        job.endAddress = endAddress;
      }

      if (materials) {
        job.materials = materials.map(material => material.value);
      }

      allTruckTypes = await JobService.getMaterialsByJobId(job.id);
      if (allTruckTypes.length > 0) {
        allTruckTypes = allTruckTypes.join(', ');
      }

      bids = await BidService.getBidsByJobId(job.id);
      if (bids.length) { // we have a bid record
        bids.filter((filteredBid) => {
          if (filteredBid.hasCustomerAccepted === 1
            && filteredBid.hasSchedulerAccepted === 0
            && filteredBid.companyCarrierId === profile.companyId) { // "Marketplace" bid
            bid = filteredBid;
          } else if (filteredBid.companyCarrierId === profile.companyId
            && filteredBid.hasSchedulerAccepted === 1
            && (filteredBid.status === 'Pending' || filteredBid.status === 'Declined')) { // "Requested" or "Declied" bid
            bid = filteredBid;
          }
          return bid;
        });
      }

      const bookings = await BookingService.getBookingsByJobId(job.id);
      if (bookings && bookings.length > 0) {
        [booking] = bookings;
        const bookingEquipments = await BookingEquipmentService
          .getBookingEquipmentsByBookingId(booking.id);
        selectedDrivers = bookingEquipments
          .map(bookingEquipmentItem => bookingEquipmentItem.driverId);
      }

      // Check if carrier is favorite for this job's customer
      if (profile.companyType === 'Carrier') {
        // check if Carrier Company [profile.companyId]
        // is Customer's Company favorite [job.companiesId]
        favoriteCompany = await GroupListService.getGroupListsByCompanyId(
          profile.companyId, job.companiesId
        );
      }
    }

    this.setState({
      job,
      company,
      companyName,
      companyCarrier,
      allTruckTypes,
      bid,
      booking,
      profile,
      favoriteCompany,
      selectedDrivers,
      loaded: true
    });
  }

  // save after the user has checked the info
  async saveJob() {
    this.setState({ btnSubmitting: true });
    const {
      job,
      favoriteCompany,
      profile
    } = this.state;
    let {
      bid,
      booking
    } = this.state;
    let notification;

    // Is the Carrier this Company's favorite? If so, accepting the job
    if (favoriteCompany.length > 0) {
      // console.log('accepting');
      const newJob = CloneDeep(job);

      // Updating the Job
      newJob.status = 'Booked';
      newJob.startAddress = newJob.startAddress.id;
      newJob.endAddress = newJob.endAddress.id;
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment.utc().format();
      delete newJob.materials;
      await JobService.updateJob(newJob);

      // If The Job was sent to both marketplace and favorites, update bid
      // If the Job was sent to marketplace but a favorite carrier is accepting it, create a bid
      if (bid && bid.length > 0) {
        const newBid = CloneDeep(bid);
        newBid.companyCarrierId = profile.companyId;
        newBid.hasSchedulerAccepted = 1;
        newBid.status = 'Accepted';
        newBid.rateEstimate = newJob.rateEstimate;
        newBid.notes = newJob.notes;
        newBid.modifiedBy = profile.userId;
        newBid.modifiedOn = moment.utc().format();
        bid = {};
        bid = await BidService.updateBid(newBid);
      } else {
        bid = {};
        bid.jobId = newJob.id;
        bid.userId = profile.userId;
        bid.companyCarrierId = profile.companyId;
        bid.hasCustomerAccepted = 1;
        bid.hasSchedulerAccepted = 1;
        bid.status = 'Accepted';
        bid.rateType = newJob.rateType;
        bid.rate = newJob.rate;
        bid.rateEstimate = newJob.rateEstimate;
        bid.notes = newJob.notes;
        bid.createdBy = profile.userId;
        bid.createdOn = moment.utc().format();
        bid.modifiedBy = profile.userId;
        bid.modifiedOn = moment.utc().format();
        bid = await BidService.createBid(bid);
      }

      // Create a Booking
      // Check if we have a booking first
      const bookings = await BookingService.getBookingsByJobId(newJob.id);
      if (!bookings || bookings.length <= 0) {
        booking = {};
        booking.rateType = bid.rateType;
        booking.startTime = job.startTime;
        booking.endTime = job.endTime;
        booking.startAddressId = job.startAddress.id;
        booking.endAddressId = job.endAddress.id;
        booking.fee = 0.0;
        booking.bookingStatus = 'New';
        booking.invoiceNumber = '';
        booking.orderNumber = '';
        booking.ticketNumber = '';
        booking.bidId = bid.id;
        booking.schedulersCompanyId = bid.companyCarrierId;
        booking.sourceAddressId = job.startAddress.id;
        booking.notes = '';
        booking.createdBy = profile.userId;
        booking.createdOn = moment.utc().format();
        booking.modifiedOn = moment.utc().format();
        booking.modifiedBy = profile.userId;
        booking = await BookingService.createBooking(booking);
      }

      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // We tell the customer that the job has been accepted
      const customerAdmin = await UserService.getAdminByCompanyId(job.companiesId);
      if (customerAdmin.length > 0) { // check if we get a result
        if (customerAdmin[0].mobilePhone && this.checkPhoneFormat(customerAdmin[0].mobilePhone)) {
          notification = {
            to: this.phoneToNumberFormat(customerAdmin[0].mobilePhone),
            body: 'Your job request has been accepted.'
          };
          await TwilioService.createSms(notification);
        }
      }
      // eslint-disable-next-line no-alert
      // alert('You have won this job! Congratulations.');
      this.closeNow();
    } else { // The Carrier is not this Company's favorite? requesting the job
      // console.log('carrier is not this company´s favorite, requesting');
      const newJob = CloneDeep(job);

      // Updating the Job
      // newJob.status = 'Requested';
      newJob.startAddress = newJob.startAddress.id;
      newJob.endAddress = newJob.endAddress.id;
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment.utc().format();
      delete newJob.materials;
      await JobService.updateJob(newJob);

      // CREATING BID
      if (bid && bid.length > 0) {
        const newBid = CloneDeep(bid);
        newBid.companyCarrierId = profile.companyId;
        bid.hasCustomerAccepted = 0;
        bid.hasSchedulerAccepted = 1;
        newBid.status = 'Pending';
        newBid.modifiedBy = profile.userId;
        newBid.modifiedOn = moment.utc().format();
        bid = await BidService.updateBid(newBid);
      } else {
        bid = {};
        bid.jobId = newJob.id;
        bid.userId = profile.userId;
        bid.companyCarrierId = profile.companyId;
        bid.hasCustomerAccepted = 0;
        bid.hasSchedulerAccepted = 1;
        bid.status = 'Pending';
        bid.rateType = newJob.rateType;
        bid.rate = newJob.rate;
        bid.rateEstimate = newJob.rateEstimate;
        bid.notes = newJob.notes;
        bid.createdBy = profile.userId;
        bid.createdOn = moment.utc().format();
        bid.modifiedBy = profile.userId;
        bid.modifiedOn = moment.utc().format();
        bid = await BidService.createBid(bid);
      }

      // Let's make a call to Twilio to send an SMS
      // Sending SMS to customer who created Job
      const customerAdmin = await UserService.getAdminByCompanyId(newJob.companiesId);
      if (customerAdmin.length > 0) { // check if we get a result
        if (customerAdmin[0].mobilePhone && this.checkPhoneFormat(customerAdmin[0].mobilePhone)) {
          notification = {
            to: this.phoneToNumberFormat(customerAdmin[0].mobilePhone),
            body: 'You have a new job request.'
          };
          await TwilioService.createSms(notification);
        }
      }

      // eslint-disable-next-line no-alert
      // alert('Your request has been sent.');
      this.closeNow();
    }
  }

  // remove non numeric
  phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  // check format ok
  checkPhoneFormat(phone) {
    const phoneNotParents = String(this.phoneToNumberFormat(phone));
    const areaCode3 = phoneNotParents.substring(0, 3);
    const areaCode4 = phoneNotParents.substring(0, 4);
    if (areaCode3.includes('555') || areaCode4.includes('1555')) {
      return false;
    }
    return true;
  }

  toggleLiabilityModal() {
    const {modalLiability} = this.state;
    this.setState({
      modalLiability: !modalLiability
    });
  }

  equipmentMaterialsAsString(materials) {
    let materialsString = '';
    if (materials) {
      let index = 0;
      for (const material of materials) {
        if (index !== materials.length - 1) {
          materialsString += `${material}, `;
        } else {
          materialsString += material;
        }
        index += 1;
      }
    }
    return materialsString;
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  renderJobTop(job) {
    const {
      bid,
      company,
      companyCarrier,
      companyName,
      favoriteCompany,
      profile,
      btnSubmitting
    } = this.state;
    const companyProducer = company;
    let showModalButton;
    let jobStatus;

    // A Carrier will see 'Published And Offered' as 'Published' in the Marketplace
    if (job.status === 'Published And Offered') {
      jobStatus = 'Published';
    } else {
      jobStatus = job.status;
    }

    let btnFunction;
    // If Carrier has not enough liability insurance, show confirmation modal
    if ((companyProducer.liabilityGeneral > 0.01 || companyProducer.liabilityAuto > 0.01)
    && ((companyCarrier.liabilityGeneral < companyProducer.liabilityGeneral) || (companyCarrier.liabilityAuto < companyProducer.liabilityAuto))) {
      btnFunction = () => this.toggleLiabilityModal();
    } else {
      btnFunction = this.saveJob;
    }

    // Job was 'Published' to the Marketplace,
    // Carrier is a favorite OR Customer has requested this particular Carrier
    if (jobStatus === 'Published' && (favoriteCompany.length > 0 || (bid && bid.hasCustomerAccepted === 1 && bid.status === 'Pending'))) {
      showModalButton = (
        <TSubmitButton
          onClick={btnFunction}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Accept Job"
        />
      );
    // Job was 'Published' to the Marketplace
    } else if (jobStatus === 'Published' && !bid && favoriteCompany.length === 0) {
      showModalButton = (
        <TSubmitButton
          onClick={btnFunction}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Request Job"
        />
      );
    // Job was 'Published And Offered', there's a bid
    } else if (jobStatus === 'Published' && (bid && (bid.status !== 'Pending' && bid.status !== 'Declined')) && favoriteCompany.length === 0) {
      showModalButton = (
        <TSubmitButton
          onClick={btnFunction}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Request Job"
        />
      );
    // Job "Requested" by the carrier
    } else if (jobStatus === 'Published' && (bid && bid.status === 'Pending')) {
      showModalButton = 'You have requested this job';
    // Job "Declined" by the customer
    } else if (jobStatus === 'Published' && (bid && bid.status === 'Declined' && bid.hasSchedulerAccepted === 1 && bid.hasCustomerAccepted === 0)) {
      showModalButton = 'Your request for this job has been declined.';
    // Job "Declined" by the carrier
    } else if (jobStatus === 'Published' && (bid && bid.status === 'Declined' && bid.hasSchedulerAccepted === 0 && bid.hasCustomerAccepted === 1)) {
      showModalButton = 'You have declined this offer.';
    }

    return (
      <React.Fragment>
        <Row>
          <Col md={8}>
            <h3 className="subhead">
              {companyName}
              &nbsp;/&nbsp;
              {job.name}
              <br/>
              {moment(job.startTime)
                .format('dddd, MMMM Do')}
            </h3>
            <p>
              Estimated Income: {TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)}
              <br/>
              Rate: ${job.rate} / {job.rateType}
              <br/>
              Estimated - {job.rateEstimate} {job.rateType}(s)
            </p>
          </Col>
          <Col md={4}>
            {showModalButton}
          </Col>
        </Row>
        <Row>
          <div className="col-md-12">
            <hr/>
          </div>
        </Row>
      </React.Fragment>
    );
  }

  renderLiabilityConfirmation() {
    const {
      modalLiability,
      btnSubmitting,
      company,
      companyCarrier,
      favoriteCompany,
      bid,
      job
    } = this.state;

    const companyProducer = company;

    let jobAction;
    if ((job.status === 'Published' || job.status === 'Published And Offered')
    && (favoriteCompany.length > 0 || (bid && bid.hasCustomerAccepted === 1 && bid.status === 'Pending'))) {
      jobAction = 'Accept';
    } else {
      jobAction = 'Request';
    }

    if (modalLiability) {
      return (
        <Modal
          isOpen={modalLiability}
          toggle={this.toggleLiabilityModal}
          className="modal-dialog--primary modal-dialog--header"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleLiabilityModal}
            />
            <div className="bold-text modal__title">Liability Insurance</div>
          </div>
          <div className="modal__body" style={{ padding: '10px 25px 0px 25px' }}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        <p>This job requires a minimum&nbsp;
                          {TFormat.asMoneyNoDecimals(companyProducer.liabilityGeneral)} of
                          General Liability Insurance and&nbsp;
                          {TFormat.asMoneyNoDecimals(companyProducer.liabilityAuto)} of Auto
                          Liability Insurance. Our records show that you have&nbsp;
                          {TFormat.asMoneyNoDecimals(companyCarrier.liabilityGeneral)} of General
                          Liability Insurance and&nbsp;
                          {TFormat.asMoneyNoDecimals(companyCarrier.liabilityAuto)}&nbsp;
                          of Auto Liability Insurance.
                        </p>

                        <p>You risk being rejected by {companyProducer.legalName} due to your
                        insurance levels. If you have updated your insurance levels please
                        contact <a href="mailto:csr@trelar.com">Trelar Support</a>.
                        </p>

                        <p>Are you sure you want to {jobAction.toLowerCase()} this job?</p>
                      </Row>
                      <hr/>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-4 wizard__toolbar">
                          <Button color="minimal" className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={this.toggleLiabilityModal}
                          >
                            Cancel
                          </Button>
                        </ButtonToolbar>
                        <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                          <TSubmitButton
                            onClick={this.saveJob}
                            className="primaryButton"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText={`${jobAction} Job`}
                          />
                        </ButtonToolbar>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </Modal>
      );
    }
    return null;
  }

  renderJobAddresses(job) {
    return (
      <Container>
        <Row>
          <span className="col-md-6">
            {this.renderAddress(job.startAddress, 'start')}
          </span>
          <span className="col-md-6">
            {this.renderAddress(job.endAddress, 'end')}
          </span>
        </Row>
        <span className="col-md-12">
          <TMap
            id={`job${job.id}`}
            width="100%"
            height="250px"
            startAddress={job.startAddress}
            endAddress={job.endAddress}
          />
        </span>
      </Container>
    );
  }

  renderAddress(address, type) {
    return (
      <Container>
        <Row>
          <div className="col-md-12">
            <h3 className="subhead">{type === 'start' ? 'Start Location' : 'End Location'}</h3>
          </div>
          <div className="col-md-12">{address.address1}</div>
          {address.address2 && (
            <div className="col-md-12">
              {address.address2}
            </div>
          )}
          {address.address3 && (
            <div className="col-md-12">
              {address.address3}
            </div>
          )}
          {address.address4 && (
            <div className="col-md-12">
              {address.address4}
            </div>
          )}
          <div className="col-md-12">
            {`${address.city}, `}
            {`${address.state}, `}
            {`${address.zipCode}`}
          </div>
        </Row>
      </Container>
    );
  }

  renderJobDetails(job) {
    const { allTruckTypes } = this.state;
    return (
      <React.Fragment>
        <Container>
          <Row>
            <div className="col-md-4">
              <h3 className="subhead">
                Job Details
              </h3>
            </div>
            <div className="col-md-4">
              <h3 className="subhead">
                Truck Details
              </h3>
              Number of Trucks: {job.numEquipments || 'Any'}<br/>
              {allTruckTypes}
            </div>
            <div className="col-md-4">
              <h3 className="subhead">
                Materials
              </h3>
              {this.equipmentMaterialsAsString(job.materials)}
            </div>
          </Row>
        </Container>
      </React.Fragment>
    );
  }

  renderJobBottom(job) {
    return (
      <React.Fragment>
        <h3 className="subhead">
          Instructions
        </h3>
        <Row>
          <Col md={12}>
            <div className="form__form-group">
              <div className="form__form-group-field">
                {job.notes}
              </div>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderJobFormButtons() {
    return (
      <div className="row">
        <div className="col-sm-5"/>
        <div className="col-sm-7">
          <div className="row">
            <div className="col-sm-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.closeNow}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { job, loaded, accessForbidden } = this.state;

    if (accessForbidden) {
      return (
        <Col md={12}>
          <Card style={{paddingBottom: 0}}>
            <CardBody>
              <Row className="col-md-12"><h1>Access Forbidden</h1></Row>
            </CardBody>
          </Card>
        </Col>
      );
    }

    if (loaded) {
      return (
        <React.Fragment>
          <Col md={12} lg={12}>
            <Card>
              <CardBody>
                {this.renderJobTop(job)}
                {this.renderJobAddresses(job)}
                {this.renderJobDetails(job)}
                {this.renderJobBottom(job)}
                {this.renderLiabilityConfirmation()}
                {/* {this.renderJobFormButtons()} */}
              </CardBody>
            </Card>
          </Col>
        </React.Fragment>
      );
    }
    return (
      <Col md={12}>
        <Card style={{paddingBottom: 0}}>
          <CardBody>
            <Row className="col-md-12"><TSpinner loading/></Row>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

JobViewForm.propTypes = {
  jobId: PropTypes.number,
  toggle: PropTypes.func.isRequired
};

JobViewForm.defaultProps = {
  jobId: null
};

export default JobViewForm;
