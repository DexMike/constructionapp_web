import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Container, Card, CardBody, Col, Row } from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import NumberFormat from 'react-number-format';
import JobService from '../../api/JobService';
import truckImage from '../../img/default_truck.png';
import TButtonToggle from '../common/TButtonToggle';
import AddressService from '../../api/AddressService';
import LookupsService from '../../api/LookupsService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import ProfileService from '../../api/ProfileService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TDateTimePicker from '../common/TDateTimePicker';
import TField from '../common/TField';
import TFormat from '../common/TFormat';
import TMap from '../common/TMapOriginDestination';
import TwilioService from '../../api/TwilioService';
import MultiSelect from '../common/TMultiSelect';
import SelectField from '../common/TSelect';
import CompanyService from '../../api/CompanyService';
import EquipmentService from '../../api/EquipmentService';
import Table from 'reactstrap/es/Table';

class JobViewForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();

    this.state = {
      company: [],
      companyName: '',
      customerAccepted: 0,
      bidId: 0,
      bidExists: false,
      booking: null,
      bookingEquipment: null,
      ...job,
      loaded: false,
      profile: []
    };
    this.closeNow = this.closeNow.bind(this);
    this.saveJob = this.saveJob.bind(this);
  }

  async componentDidMount() {
    let {
      job,
      company,
      companyName,
      bidId,
      bidExists,
      booking,
      bookingEquipment,
      customerAccepted,
      profile
    } = this.state;
    const { jobId } = this.props;
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
        bidExists = true;
        bidId = bids[0].id;
        customerAccepted = bids[0].hasCustomerAccepted; // has customer accepted?
      }    

      const bookings = await BookingService.getBookingsByJobId(job.id);
      if (bookings && bookings.length > 0) {
        booking = bookings[0];
        const bookingEquipments = await BookingEquipmentService.getBookingEquipments();
        bookingEquipment = bookingEquipments.find(bookingEquipment => {
          return bookingEquipment.bookingId === booking.id;
        }, booking);
      }
    }

    this.setState({
      job,
      company,
      companyName,
      bidId,
      bidExists,
      booking,
      bookingEquipment,
      customerAccepted,
      profile,
      loaded: true
    });

    // const { selectedJob, selectedMaterials } = this.props;

    // await this.fetchForeignValues();
  }

  // save after the user has checked the info
  async saveJob() {
    // save new or update?
    const {
      job,
      bidId,
      company,
      profile
    } = this.state;
    let { booking, bookingEquipment } = this.state;
    let notification;

    let bid;
    try {
      bid = await BidService.getBidById(bidId);
    } catch (e) {
      // console.log('there is no Bid record');
    }

    if (bid) { // we have a bid record, we are accepting the job
      // console.log('accepting');
      const newJob = CloneDeep(job);
      const newBid = CloneDeep(bid);

      // UPDATING JOB
      newJob.status = 'Booked';
      newJob.startAddress = newJob.startAddress.id;
      newJob.endAddress = newJob.endAddress.id;
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment()
        .unix() * 1000;
      delete newJob.materials;
      await JobService.updateJob(newJob);

      // UPDATING BID
      newBid.hasSchedulerAccepted = 1;
      newBid.status = 'Accepted';
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment()
        .unix() * 1000;
      await BidService.updateBid(newBid);

      // CREATING BOOKING
      // see if we have a booking first
      const bookings = await BookingService.getBookingsByJobId(job.id);
      if (!bookings || bookings.length <= 0) {
        // TODO create a booking
        booking = {};
        booking.bidId = bid.id;
        booking.rateType = bid.rateType;
        booking.startTime = job.startTime;
        booking.schedulersCompanyId = bid.companyCarrierId;
        booking.sourceAddressId = job.startAddress.id;
        booking.startAddressId = job.startAddress.id;
        booking.endAddressId = job.endAddress.id;
        booking.bookingStatus = 'New';
        booking.createdBy = profile.userId;
        booking.createdOn = moment().unix() * 1000;
        booking.modifiedOn = moment().unix() * 1000;
        booking.modifiedBy = profile.userId;
        booking = await BookingService.createBooking(booking);
      }

      // CREATING BOOKING EQUIPMENT
      // see if we have a booking equipment first
      let bookingEquipments = await BookingEquipmentService.getBookingEquipments();
      bookingEquipments = bookingEquipments.filter(bookingEq => {
        if(bookingEq.bookingId === booking.id) {
          return bookingEq;
        }
      });
      if (!bookingEquipments || bookingEquipments.length <= 0) {
        const equipments = await EquipmentService.getEquipments();
        if (equipments && equipments.length > 0) {
          const equipment = equipments[0]; // temporary for now. Ideally this should be the carrier/driver's truck
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
          bookingEquipment = await BookingEquipmentService.createBookingEquipments(
            bookingEquipment
          );
        }
      }

      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // We tell the customer that the job has been accepted
      const customerCompany = await CompanyService.getCompanyById(job.companiesId);
      if (customerCompany.phone && this.checkPhoneFormat(customerCompany.phone)) {
        notification = {
          to: this.phoneToNumberFormat(customerCompany.phone),
          body: 'Your job request has been accepted.'
        };
        await TwilioService.createSms(notification);
      }
      // eslint-disable-next-line no-alert
      alert('You have won this job! Congratulations.');
      this.closeNow();
    } else { // no bid record, request a job
      // console.log('requesting');
      bid = {};
      bid.jobId = job.id;
      bid.userId = profile.userId;
      bid.companyCarrierId = job.companiesId;
      bid.hasCustomerAccepted = 0;
      bid.hasSchedulerAccepted = 1;
      bid.status = 'New';
      bid.rateType = job.rateType;
      bid.rate = job.rate;
      bid.rateEstimate = job.rateEstimate;
      bid.notes = job.notes;
      bid.createdBy = profile.userId;
      bid.modifiedBy = profile.userId;
      bid.modifiedOn = moment()
        .unix() * 1000;
      bid.createdOn = moment()
        .unix() * 1000;
      await BidService.createBid(bid);

      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // Sending SMS to carrier
      /* if (company.phone && this.checkPhoneFormat(company.phone)) {
        notification = {
          to: this.phoneToNumberFormat(company.phone),
          body: 'Your request has been sent.'
        };
        await TwilioService.createSms(notification);
      } */

      // Sending SMS to customer who created Job
      if (job.company.phone && this.checkPhoneFormat(job.company.phone)) {
        notification = {
          to: this.phoneToNumberFormat(job.company.phone),
          body: 'You have a new job request.'
        };
        await TwilioService.createSms(notification);
      }

      // eslint-disable-next-line no-alert
      alert('Your request has been sent.');
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
      bidExists,
      customerAccepted
    } = this.state;
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
            <button
              type="submit"
              className="btn btn-primary float-right"
              onClick={this.saveJob}
            >
              {bidExists && customerAccepted === 1 ? 'Accept Job' : 'Request Job'}
            </button>
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
        <span className="col-md-12">
          <TMap
            input={
              {
                origin,
                destination
              }
            }
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
                {/*{this.renderJobFormButtons()}*/}
              </CardBody>
            </Card>
          </Col>
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

JobViewForm.propTypes = {
  jobId: PropTypes.number,
  toggle: PropTypes.func.isRequired
};

JobViewForm.defaultProps = {
  jobId: null
};

export default JobViewForm;
