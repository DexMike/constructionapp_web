import React, { Component } from 'react';
import {
  Col,
  Row,
  Container
} from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import JobCarrierForm from './JobCarrierForm';
import JobCustomerForm from './JobCustomerForm';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';
import CompanyService from '../../api/CompanyService';
import ProfileService from '../../api/ProfileService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import EquipmentService from '../../api/EquipmentService';
import UserService from '../../api/UserService';
import TwilioService from '../../api/TwilioService';
import GroupListService from '../../api/GroupListService';
import TSubmitButton from '../common/TSubmitButton';

class JobSavePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      goToDashboard: false,
      goToJob: false,
      job: {
        company: {
          legalName: '',
          phone: ''
        },
        startAddress: {
          address1: ''
        },
        endAddress: {
          address1: ''
        },
        status: null
      },
      bid: null,
      booking: null,
      bookingEquipment: null,
      favoriteCompany: [],
      profile: [],
      companyCarrier: 0,
      // moved companyType to the first level
      // for some reason I couldn't set it when nested
      companyType: null,
      btnSubmitting: false
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleConfirmRequest = this.handleConfirmRequest.bind(this);
    this.handleConfirmRequestCarrier = this.handleConfirmRequestCarrier.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    let {
      bid,
      booking,
      bookingEquipment,
      profile,
      favoriteCompany
    } = this.state;

    profile = await ProfileService.getProfile();

    if (match.params.id) {
      const job = await JobService.getJobById(match.params.id);
      console.log(79, job);
      // company
      const company = await CompanyService.getCompanyById(job.companiesId);
      // start address
      const startAddress = await AddressService.getAddressById(job.startAddress);
      // end address
      let endAddress = null;
      if (job.endAddress) {
        endAddress = await AddressService.getAddressById(job.endAddress);
      }
      // materials
      const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      job.company = company;
      job.startAddress = startAddress;
      job.endAddress = endAddress;
      job.materials = materials.map(material => material.value);

      const bids = await BidService.getBidsByJobId(job.id);
      if (bids && bids.length > 0) { // check if there's a bid
        // If there's more than one bid
        if (bids.length > 1) {
          // For the Carrier, we search for a bid that has hasCustomerAccepted flag on
          // and is assigned to the carrier (a favorite)
          bid = bids.filter((filteredBid) => {
            if (profile.companyType === 'Carrier') {
              if (filteredBid.hasCustomerAccepted === 1
                // && filteredBid.hasSchedulerAccepted === 1
                && filteredBid.companyCarrierId === profile.companyId) {
                return filteredBid;
              }
              bid = bids[0];
            // For the Customer, we search for a bid that has hasSchedulerAccepted flag on
            } else if (filteredBid.hasSchedulerAccepted === 1) {
              return filteredBid;
            }
            bid = bids[0];
            return bid;
          });
        } else { // There is just one bid
          bid = bids[0];
        }
      }

      const bookings = await BookingService.getBookingsByJobId(job.id);
      if (bookings && bookings.length > 0) {
        booking = bookings[0];
        const bookingEquipments = await BookingEquipmentService.getBookingEquipments();
        bookingEquipment = bookingEquipments.find(
          bookingEq => bookingEq.bookingId === booking.id,
          booking
        );
      }

      // If the customer is Carrier, check if it's a favorite
      if (profile.companyType === 'Carrier') {
        favoriteCompany = await GroupListService.getGroupListByFavoriteAndCompanyId(
          profile.companyId
        );
      }

      const companyCarrier = bid.companyCarrierId;

      this.setState({
        job,
        bid,
        companyCarrier,
        booking,
        bookingEquipment,
        profile,
        profileCompanyId: profile.companyId,
        companyType: profile.companyType,
        favoriteCompany
      });
      this.setState({ job });
    }

    // moved the loader to the mount function
    this.setState({
      profileCompanyId: profile.companyId,
      companyType: profile.companyType,
      loaded: true
    },
    () => {
      // console.log('setState completed', this.state);
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async handleDelete() {
    const { match } = this.props;
    const { id } = match.params;
    await JobService.deleteJobById(id);
    this.handlePageClick('Job');
  }

  async handleConfirmRequest(action) { // Customer 'Accepts' or 'Rejects' Job request
    this.setState({ btnSubmitting: true });
    const {
      job,
      bid,
      profile
    } = this.state;
    let { booking, bookingEquipment } = this.state;

    if (action === 'Approve') { // Customer is accepting the job request
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
      newBid.hasCustomerAccepted = 1;
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
          bookingEquipment = await BookingEquipmentService.createBookingEquipments(
            bookingEquipment
          );
        }
      }

      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // Sending SMS to Truck's company
      const carrierAdmin = await UserService.getAdminByCompanyId(bid.companyCarrierId);
      if (carrierAdmin.length > 0) { // check if we get a result
        if (carrierAdmin[0].mobilePhone && this.checkPhoneFormat(carrierAdmin[0].mobilePhone)) {
          const notification = {
            to: this.phoneToNumberFormat(carrierAdmin[0].mobilePhone),
            body: 'Your request for the job has been accepted!'
          };
          await TwilioService.createSms(notification);
        }
      }

      // eslint-disable-next-line no-alert
      // alert('You have accepted this job request! Congratulations.');

      job.status = 'Booked';
      this.setState({ job });
    } else { // Customer is rejecting the job request
      const newBid = CloneDeep(bid);

      // UPDATING BID
      newBid.hasCustomerAccepted = 0;
      newBid.hasSchedulerAccepted = 1;
      newBid.status = 'Declined';
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment()
        .unix() * 1000;
      await BidService.updateBid(newBid);

      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // Sending SMS to Truck's company
      const carrierAdmin = await UserService.getAdminByCompanyId(bid.companyCarrierId);
      if (carrierAdmin.length > 0) { // check if we get a result
        if (carrierAdmin[0].mobilePhone && this.checkPhoneFormat(carrierAdmin[0].mobilePhone)) {
          const notification = {
            to: this.phoneToNumberFormat(carrierAdmin[0].mobilePhone),
            body: 'Your request for the job has been rejected'
          };
          await TwilioService.createSms(notification);
        }
      }

      // eslint-disable-next-line no-alert
      // alert('You have accepted this job request! Congratulations.');
    }
  }

  // Carrier clicks on 'Accept Job' or 'Request Job'
  async handleConfirmRequestCarrier(action) {
    this.setState({ btnSubmitting: true });

    const {
      job,
      profile
    } = this.state;
    let { bid } = this.state;
    let { booking, bookingEquipment } = this.state;
    let notification;

    // A favorite Carrier "accepts" the job
    if (action === 'Accept') {
      // console.log('accepting');
      // console.log(bid);
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
      const newBid = CloneDeep(bid);
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
      const bookings = await BookingService.getBookingsByJobId(job.id);
      if (!bookings || bookings.length <= 0) {
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
          bookingEquipment = await BookingEquipmentService.createBookingEquipments(
            bookingEquipment
          );
        }
      }

      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // Sending SMS to Truck's company
      const carrierAdmin = await UserService.getAdminByCompanyId(bid.companyCarrierId);
      if (carrierAdmin.length > 0) { // check if we get a result
        if (carrierAdmin[0].mobilePhone && this.checkPhoneFormat(carrierAdmin[0].mobilePhone)) {
          notification = {
            to: this.phoneToNumberFormat(carrierAdmin[0].mobilePhone),
            body: 'Your request for the job has been accepted.'
          };
          await TwilioService.createSms(notification);
        }
      }

      // eslint-disable-next-line no-alert
      // alert('You have accepted this job request! Congratulations.');

      job.status = 'Booked';
      this.setState({ job });
    } else if (action === 'Request') { // A non-favorite Carrier "requests" the job
      // console.log('requesting');
      const newJob = CloneDeep(job);

      // Updating the Job
      newJob.status = 'Requested';
      newJob.startAddress = newJob.startAddress.id;
      newJob.endAddress = newJob.endAddress.id;
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment()
        .unix() * 1000;
      delete newJob.materials;
      await JobService.updateJob(newJob);

      // Creating a bid
      bid = {};
      bid.jobId = job.id;
      bid.userId = profile.userId;
      bid.companyCarrierId = profile.companyId;
      bid.hasCustomerAccepted = 0;
      bid.hasSchedulerAccepted = 1;
      bid.status = 'Pending';
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

      // Sending SMS to customer's Admin from the company who created the Job
      const customerAdmin = await UserService.getAdminByCompanyId(job.companiesId);
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
      job.status = newJob.status;
      this.setState({ job });
    } else if (action === 'Decline') { // A Carrier "declines" a job request
      // Update existing bid
      const newBid = CloneDeep(bid);
      newBid.companyCarrierId = profile.companyId;
      newBid.hasCustomerAccepted = 1;
      newBid.hasSchedulerAccepted = 0;
      newBid.status = 'Declined';
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment()
        .unix() * 1000;
      bid = {};
      bid = await BidService.updateBid(newBid);

      // Sending SMS to customer's Admin from the company who created the Job
      const customerAdmin = await UserService.getAdminByCompanyId(job.companiesId);
      if (customerAdmin.length > 0) { // check if we get a result
        if (customerAdmin[0].mobilePhone && this.checkPhoneFormat(customerAdmin[0].mobilePhone)) {
          notification = {
            to: this.phoneToNumberFormat(customerAdmin[0].mobilePhone),
            body: 'Your job request has been declined.'
          };
          await TwilioService.createSms(notification);
        }
      }

      // eslint-disable-next-line no-alert
      // alert('Your request has been sent.');
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

  renderGoTo() {
    const { goToDashboard, goToJob } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToJob) {
      return <Redirect push to="/jobs"/>;
    }
    return false;
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
    const {
      job,
      bid,
      companyType,
      favoriteCompany,
      loaded,
      btnSubmitting,
      companyCarrier
    } = this.state;
    let buttonText;
    if (loaded) {
      // waiting for jobs and type to be available
      if (companyType !== null && job !== null) {
        let type = '';
        // A Carrier will see 'Published And Offered' as 'On Offer' in the Dashboard
        if (job.status === 'Published And Offered' && companyType === 'Carrier') job.status = 'On Offer';

        if (companyType === 'Carrier') {
          type = (<JobCarrierForm job={job} handlePageClick={this.handlePageClick}/>);
        } else {
          type = (<JobCustomerForm job={job} companyCarrier={companyCarrier} handlePageClick={this.handlePageClick}/>);
        }

        // If a Customer 'Published' a Job to the Marketplace, the Carrier can Accept or Request it
        if (job.status === 'Published' && companyType === 'Carrier') {
          // If the carrier is a favorite
          if (favoriteCompany.length > 0) {
            // console.log('We are a carrier and we are a favorite');
            buttonText = (
              <TSubmitButton
                onClick={() => this.handleConfirmRequestCarrier('Accept')}
                className="primaryButton"
                loading={btnSubmitting}
                loaderSize={10}
                bntText="Accept Job"
              />
            );
          } else { // the carrier is not a favorite
            buttonText = (
              <TSubmitButton
                onClick={() => this.handleConfirmRequestCarrier('Request')}
                className="primaryButton"
                loading={btnSubmitting}
                loaderSize={10}
                bntText="Request Job"
              />
            );
          }
        }

        // If a Customer is 'Offering' a Job, the Carrier can Accept or Decline it
        if ((job.status === 'On Offer') && companyType === 'Carrier' && bid.status !== 'Declined') {
          buttonText = (
            <div>
              <TSubmitButton
                onClick={() => this.handleConfirmRequestCarrier('Decline')}
                className="secondaryButton"
                loading={btnSubmitting}
                loaderSize={10}
                bntText="Decline Job"
              />

              <TSubmitButton
                onClick={() => this.handleConfirmRequestCarrier('Accept')}
                className="primaryButton"
                loading={btnSubmitting}
                loaderSize={10}
                bntText="Accept Job"
              />
            </div>
          );
        }

        // If a Carrier is 'Requesting' a Job, the Customer can approve or reject it
        if ((job.status === 'Requested' && companyType === 'Customer')
        && (bid.hasSchedulerAccepted && !bid.hasCustomerAccepted)
        && bid.status !== 'Declined') {
          // console.log('We are a customer and we have a Carrier's job request');
          buttonText = (
            <div>
              <TSubmitButton
                onClick={() => this.handleConfirmRequest('Reject')}
                className="secondaryButton"
                loading={btnSubmitting}
                loaderSize={10}
                bntText="Reject Job Request"
              />

              <TSubmitButton
                onClick={() => this.handleConfirmRequest('Approve')}
                className="primaryButton"
                loading={btnSubmitting}
                loaderSize={10}
                bntText="Approve Job Request"
              />
            </div>
          );
        }

        return (
          <div className="container">
            <div className="row">
              <div className="col-md-9">
                <h3 className="page-title">Job Details</h3>
              </div>
              <div className="col-md-3">
                {buttonText}
              </div>
            </div>
            {/* <JobForm job={job} handlePageClick={this.handlePageClick} /> */}
            {/* this.carrierOrCustomerForm(job) */}
            {type}
          </div>
        );
      }
    }
    return (
      <Container className="container">
        <Row>
          <Col md={12}>
            <h3 className="page-title">Job Details</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

JobSavePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

JobSavePage.defaultProps = {
  match: {
    params: {}
  }
};

export default JobSavePage;
