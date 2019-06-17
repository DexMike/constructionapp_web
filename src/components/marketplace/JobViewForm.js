import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Container, Card, CardBody, Col, Row } from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
// import NumberFormat from 'react-number-format';
import JobService from '../../api/JobService';
// import truckImage from '../../img/default_truck.png';
import AddressService from '../../api/AddressService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import ProfileService from '../../api/ProfileService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TFormat from '../common/TFormat';
import TwilioService from '../../api/TwilioService';
import CompanyService from '../../api/CompanyService';
import EquipmentService from '../../api/EquipmentService';
import UserService from '../../api/UserService';
import GroupListService from '../../api/GroupListService';
import TMapBoxOriginDestination
  from '../common/TMapBoxOriginDestination';
// import GPSTrackingService from '../../api/GPSTrackingService';
import TSubmitButton from '../common/TSubmitButton';
import TSpinner from '../common/TSpinner';

// const MAPBOX_MAX = 23;

class JobViewForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();

    this.state = {
      company: [],
      companyName: '',
      customerAccepted: 0,
      bidExists: false,
      currentBidCarrier: 0,
      booking: null,
      bookingEquipment: null,
      ...job,
      bid: null,
      loaded: false,
      favoriteCompany: [],
      profile: [],
      btnSubmitting: false
    };
    this.closeNow = this.closeNow.bind(this);
    this.saveJob = this.saveJob.bind(this);
  }

  async componentDidMount() {
    let {
      job,
      bid,
      company,
      companyName,
      bidExists,
      currentBidCarrier,
      booking,
      bookingEquipment,
      customerAccepted,
      profile,
      favoriteCompany
    } = this.state;
    const { jobId } = this.props;
    // const gps = [];
    profile = await ProfileService.getProfile();

    job = await JobService.getJobById(jobId);

    if (job) {
      company = await CompanyService.getCompanyById(job.companiesId);
      const startAddress = await AddressService.getAddressById(job.startAddress);
      let endAddress = null;
      if (job.endAddress) {
        endAddress = await AddressService.getAddressById(job.endAddress);
      }
      const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      const bids = await BidService.getBidsByJobId(job.id);

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

      if (bids.length) { // we have a bid record
        // we search for a bid that is assigned to the carrier (a favorite)
        bid = bids.filter((filteredBid) => {
          if (filteredBid.hasCustomerAccepted === 1
            // && filteredBid.hasSchedulerAccepted === 1
            && filteredBid.companyCarrierId === profile.companyId) {
            return filteredBid;
          }
          bid = bids[0];
          return bid;
        });
      }

      const bookings = await BookingService.getBookingsByJobId(job.id);
      if (bookings && bookings.length > 0) {
        booking = bookings[0];
        const bookingEquipments = await BookingEquipmentService.getBookingEquipments();
        bookingEquipment = bookingEquipments.find(
          bookEq => bookEq.bookingId === booking.id, booking
        );
      }

      // get overlay data
      // let gpsData = [];
      // if (bookings.length > 0) {
      //   gpsData = await GPSTrackingService.getGPSTrackingByBookingEquipmentId(
      //     bookings[0].id // booking.id
      //   );
      // }

      // prepare the waypoints in an appropiate format for MB (GEOJson point)
      // if (gpsData.length > 0) {
      //   for (const datum in gpsData) {
      //     if (gpsData[datum][0]) {
      //       const loc = {
      //         type: 'Feature',
      //         geometry: {
      //           type: 'Point',
      //           coordinates: [
      //             gpsData[datum][1],
      //             gpsData[datum][0]
      //           ]
      //         },
      //         properties: {
      //           title: 'Actual route',
      //           icon: 'car'
      //         }
      //       };
      //       // reduce the total of results to a maximum of 23
      //       // Mapbox's limit is 25 points plus an origin and destination
      //       const steps = Math.ceil(gpsData.length / MAPBOX_MAX);
      //       const reducer = datum / steps;
      //       const remainder = (reducer % 1);
      //       if (remainder === 0) {
      //         gps.push(loc);
      //       }
      //     }
      //   }
      // }
    }

    // Check if carrier is favorite for this job's customer
    favoriteCompany = await GroupListService.getGroupListByFavoriteAndCompanyId(
      profile.companyId
    );

    this.setState({
      job,
      company,
      companyName,
      bid,
      bidExists,
      currentBidCarrier,
      booking,
      bookingEquipment,
      customerAccepted,
      profile,
      favoriteCompany,
      loaded: true
    });

    // const { selectedJob, selectedMaterials } = this.props;

    // await this.fetchForeignValues();
  }

  // save after the user has checked the info
  async saveJob() {
    this.setState({ btnSubmitting: true });
    // console.log('saveJob ');
    // save new or update?
    const {
      job,
      favoriteCompany,
      profile
    } = this.state;
    let {
      bid,
      booking,
      bookingEquipment
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
      newJob.modifiedOn = moment()
        .unix() * 1000;
      delete newJob.materials;
      await JobService.updateJob(newJob);

      // Since the Job was sent to all favorites there's a bid, update existing bid
      const newBid = CloneDeep(bid[0]);
      newBid.companyCarrierId = profile.companyId;
      newBid.hasSchedulerAccepted = 1;
      newBid.status = 'Accepted';
      newBid.rateEstimate = newJob.rateEstimate;
      newBid.notes = newJob.notes;
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment()
        .unix() * 1000;
      bid = {};
      bid = await BidService.updateBid(newBid);

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
        booking.createdOn = moment().unix() * 1000;
        booking.modifiedOn = moment().unix() * 1000;
        booking.modifiedBy = profile.userId;
        booking = await BookingService.createBooking(booking);
      }

      // Create Booking Equipment
      // Check if we have a booking equipment first
      let bookingEquipments = await BookingEquipmentService.getBookingEquipments();
      bookingEquipments = bookingEquipments.filter((bookingEq) => {
        if (bookingEq.bookingId === booking.id) {
          return bookingEq;
        }
        return null;
      });
      if (!bookingEquipments || bookingEquipments.length <= 0) {
        const response = await EquipmentService.getEquipments();
        const equipments = response.data;
        if (equipments && equipments.length > 0) {
          const equipment = equipments[0]; // temporary for now.
          // Ideally this should be the carrier/driver's truck
          bookingEquipment = {};
          bookingEquipment.bookingId = booking.id;
          bookingEquipment.schedulerId = bid.userId;
          bookingEquipment.driverId = equipment.driversId;
          bookingEquipment.equipmentId = equipment.id;
          bookingEquipment.rateType = bid.rateType;
          bookingEquipment.rateActual = 0;
          bookingEquipment.startTime = booking.startTime;
          bookingEquipment.endTime = booking.endTime;
          bookingEquipment.startAddressId = booking.startAddressId;
          bookingEquipment.endAddressId = booking.endAddressId;
          bookingEquipment.notes = '';
          bookingEquipment.createdBy = equipment.driversId;
          bookingEquipment.modifiedBy = equipment.driversId;
          bookingEquipment.modifiedOn = moment().unix() * 1000;
          bookingEquipment.createdOn = moment().unix() * 1000;
          bookingEquipment = await BookingEquipmentService.createBookingEquipment(
            bookingEquipment
          );
        }
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
      newJob.modifiedOn = moment()
        .unix() * 1000;
      delete newJob.materials;
      await JobService.updateJob(newJob);

      // CREATING BID
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
      bid.modifiedBy = profile.userId;
      bid.modifiedOn = moment()
        .unix() * 1000;
      bid.createdOn = moment()
        .unix() * 1000;
      bid = await BidService.createBid(bid);

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
      companyName,
      favoriteCompany,
      btnSubmitting
    } = this.state;
    let showModalButton;
    let jobStatus;

    // A Carrier will see 'Published And Offered' as 'Published' in the Marketplace
    if (job.status === 'Published And Offered') {
      jobStatus = 'Published';
    } else {
      jobStatus = job.status;
    }

    // Job was 'Published' to the Marketplace, Carrier is a favorite
    if (jobStatus === 'Published' && favoriteCompany.length > 0) {
      showModalButton = (
        <TSubmitButton
          onClick={this.saveJob}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Accept Job"
        />
      );
    // Job was 'Published' to the Marketplace
    } else if (jobStatus === 'Published') {
      showModalButton = (
        <TSubmitButton
          onClick={this.saveJob}
          className="primaryButton float-right"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Request Job"
        />
      );
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

  renderMBMap(origin, destination) {
    return (
      <React.Fragment>
        <TMapBoxOriginDestination
          input={
            {
              origin,
              destination
            }
          }
        />
      </React.Fragment>
    );
  }

  renderJobAddresses(job) {
    let origin = '';
    let destination = '';
    if (!job.startAddress && job.endAddress) {
      origin = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
      destination = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
    }
    if (job.startAddress && !job.endAddress) {
      origin = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
      destination = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
    }
    if (job.startAddress && job.endAddress) {
      origin = `${job.startAddress.address1} ${job.startAddress.city} ${job.startAddress.state} ${job.startAddress.zipCode}`;
      destination = `${job.endAddress.address1} ${job.endAddress.city} ${job.endAddress.state} ${job.endAddress.zipCode}`;
    }
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
        <span className="col-md-12 mapbox-jobViewForm">
          {this.renderMBMap(origin, destination)}
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
              {job.equipmentType}
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

  /* renderSelectedJob() {
    const { job } = this.state;
    console.log(job);
    return (
      <React.Fragment>
        <h4 style={{
          borderBottom: '3px solid #ccc',
          marginBottom: '20px'
        }}
        >
          Customer Status: {job.status}
          &nbsp;-&nbsp;
          Job: {job.name}
        </h4>
        <Row>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Start Date</span>
              <div className="form__form-group-field">
                <span>
                  {moment(job.startTime)
                    .format('MM/DD/YY')}
                </span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Estimated Amount</span>
              <div className="form__form-group-field">
                <span>{job.rateEstimate} {job.rateType}(s)</span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Company Name</span>
              <div className="form__form-group-field">
                  <span>{ job.company.legalName }</span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Materials</span>
              <div className="form__form-group-field">
                <span>{ this.materialsAsString(job.materials) }</span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Rate</span>
              <div className="form__form-group-field">
                ${job.rate} / {job.rateType}
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Potential Cost</span>
              <div className="form__form-group-field">
                <span>{
                  TFormat.asMoneyByRate(job.rateType, job.rate, job.rateEstimate)
                }
                </span>
              </div>
            </div>
          </Col>
          <Col xl={3} lg={4} md={6} sm={12}>
            <div className="form__form-group">
              <span className="form__form-group-label">Created On</span>
              <div className="form__form-group-field">
                <span>
                  {moment(job.createdOn)
                    .format('MM/DD/YY')}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  } */

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
    const { job, loaded } = this.state;
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
