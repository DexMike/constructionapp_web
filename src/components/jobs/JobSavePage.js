import React, { Component } from 'react';
import {
  Col,
  Row,
  Container, Modal, Card, Button
} from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import * as PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
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
import JobForm from './JobForm';
import TTable from '../common/TTable';
import BidsTable from './BidsTable';

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
      favoriteCompany: [],
      profile: {},
      companyCarrier: null,
      // moved companyType to the first level
      // for some reason I couldn't set it when nested
      companyType: null,
      btnSubmitting: false,
      allocateDriversModal: false,
      drivers: [],
      selectedDrivers: [],
      accessForbidden: false
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleConfirmRequest = this.handleConfirmRequest.bind(this);
    this.handleConfirmRequestCarrier = this.handleConfirmRequestCarrier.bind(this);
    this.toggleAllocateDriversModal = this.toggleAllocateDriversModal.bind(this);
    this.handleAllocateDrivers = this.handleAllocateDrivers.bind(this);
    this.updateJob = this.updateJob.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    let {
      job,
      bid,
      booking,
      profile,
      favoriteCompany,
      selectedDrivers,
      companyCarrier
    } = this.state;

    try {
      profile = await ProfileService.getProfile();

      if (match.params.id) {
        try {
          job = await JobService.getJobById(match.params.id);
        } catch (e) {
          if (e.message === 'Access Forbidden') {
            // access 403
            this.setState({ accessForbidden: true });
            return;
          }
        }

        if (job) {
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

          // bids
          const bids = await BidService.getBidsByJobId(job.id);
          if (bids && bids.length > 0) { // check if there's a bid
            // If there's more than one bid
            // if (bids.length > 1) {
            // For the Carrier, we search for a bid that has hasCustomerAccepted flag on
            // and is assigned to the carrier (a favorite)
            bids.filter((filteredBid) => {
              if (profile.companyType === 'Carrier') {
                if (filteredBid.hasCustomerAccepted === 1
                  // && filteredBid.hasSchedulerAccepted === 1
                  && filteredBid.companyCarrierId === profile.companyId) {
                  bid = filteredBid;
                  companyCarrier = bid.companyCarrierId;
                }
                // [bid] = bids;
                // For the Customer, we search for the 'winning' bid (if there's already one)
              } else if (filteredBid.hasSchedulerAccepted === 1
                && filteredBid.hasCustomerAccepted === 1) {
                bid = filteredBid;
                companyCarrier = bid.companyCarrierId;
              }
              // [bid] = bids;
              return bid;
            });
            // companyCarrier = bid.companyCarrierId;
            /* } else { // There is just one bid
              [bid] = bids;
            } */
          }

          // bookings
          const bookings = await BookingService.getBookingsByJobId(job.id);
          if (bookings && bookings.length > 0) {
            [booking] = bookings;
            const bookingEquipments = await BookingEquipmentService
              .getBookingEquipmentsByBookingId(booking.id);
            selectedDrivers = bookingEquipments
              .map(bookingEquipmentItem => bookingEquipmentItem.driverId);
            // bookingEquipment = bookingEquipments.find(
            //   bookingEq => bookingEq.bookingId === booking.id,
            //   booking
            // );
          }

          // Check if carrier is favorite for this job's customer
          if (profile.companyType === 'Carrier') {
            // check if Carrier Company [profile.companyId]
            // is Customer's Company favorite [job.companiesId]
            favoriteCompany = await GroupListService.getGroupListsByCompanyId(
              profile.companyId, job.companiesId
            );
          }

          const drivers = await UserService.getDriversWithUserInfoByCompanyId(profile.companyId);
          const enabledDrivers = [];
          Object.values(drivers).forEach((itm) => {
            if (itm.driverStatus === 'Enabled' || itm.userStatus === 'Enabled') {
              enabledDrivers.push(itm);
            }
          });
          this.setState({
            job,
            bid,
            companyCarrier,
            booking,
            profile,
            companyType: profile.companyType,
            favoriteCompany,
            drivers: enabledDrivers
          });
        }
      }

      // moved the loader to the mount function
      this.setState({
        companyType: profile.companyType,
        loaded: true,
        selectedDrivers
      });
    } catch (err) {
      console.error(err);
    }
  }

  async updateJob(newJob) {
    const job = newJob;
    const company = await CompanyService.getCompanyById(job.companiesId);
    const startAddress = await AddressService.getAddressById(job.startAddress);
    let endAddress = null;
    if (job.endAddress) {
      endAddress = await AddressService.getAddressById(job.endAddress);
    }
    const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
    job.company = company;
    job.startAddress = startAddress;
    job.endAddress = endAddress;
    job.materials = materials.map(material => material.value);
    this.setState({ job });
  }

  toggleAllocateDriversModal() {
    const { allocateDriversModal } = this.state;
    this.setState({ allocateDriversModal: !allocateDriversModal });
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
        booking.bidId = newBid.id;
        booking.rateType = newBid.rateType;
        booking.startTime = newJob.startTime;
        booking.schedulersCompanyId = newBid.companyCarrierId;
        booking.sourceAddressId = newJob.startAddress.id;
        booking.startAddressId = newJob.startAddress.id;
        booking.endAddressId = newJob.endAddress.id;
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
          bookingEquipment.schedulerId = newBid.userId;
          bookingEquipment.driverId = equipment.driversId;
          bookingEquipment.equipmentId = equipment.id;
          bookingEquipment.rateType = newBid.rateType;
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
      // Sending SMS to Truck's company
      const carrierAdmin = await UserService.getAdminByCompanyId(newBid.companyCarrierId);
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
      const carrierAdmin = await UserService.getAdminByCompanyId(newBid.companyCarrierId);
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
    let { booking } = this.state;
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
      newBid.hasCustomerAccepted = 1;
      newBid.status = 'Accepted';
      newBid.rateEstimate = newJob.rateEstimate;
      newBid.notes = newJob.notes;
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment()
        .unix() * 1000;
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
      /* let bookingEquipments = await BookingEquipmentService.getBookingEquipments();
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
      } */

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
      // newJob.status = 'Requested';
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
      this.setState({ bid });

      // eslint-disable-next-line no-alert
      // alert('Your request has been sent.');
    }

    this.setState({ btnSubmitting: false });
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

  async handleAllocateDrivers() {
    try {
      // console.log('saving...');
      const { selectedDrivers, booking, profile } = this.state;
      const bookingEquipments = selectedDrivers.map(selectedDriver => ({
        bookingId: booking.id,
        schedulerId: profile.userId,
        driverId: selectedDriver,
        equipmentId: null, // NOTE: for now don't reference equipment
        rateType: booking.rateType, // This could be from equipment
        rateActual: 0,
        startTime: new Date(),
        endTime: new Date(),
        startAddressId: 0,
        endAddressId: 0,
        notes: '',
        createdBy: profile.userId,
        createdOn: new Date(),
        modifiedBy: profile.userId,
        modifiedOn: new Date()
      }));
      await BookingEquipmentService.allocateDrivers(bookingEquipments, booking.id);
    } catch (err) {
      console.error(err);
    }
    this.toggleAllocateDriversModal();
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

  renderJobForm(companyType, companyCarrier, job) {
    return (
      <JobForm
        job={job}
        companyCarrier={companyCarrier}
        handlePageClick={this.handlePageClick}
      />
    );
  }

  renderBidsTable() {
    const { job, companyType } = this.state;
    if (companyType === 'Customer') {
      return (
        <BidsTable
          job={job}
          updateJob={this.updateJob}
        />
      );
    }
    return '';
  }

  renderActionButtons(job, companyType, favoriteCompany, btnSubmitting, bid) {
    const { profile } = this.state;
    // If a Customer 'Published' a Job to the Marketplace, the Carrier can Accept or Request it
    if ((job.status === 'Published' || job.status === 'Published And Offered') && companyType === 'Carrier') {
      // If the carrier is a favorite OR the Customer has requested this particular Carrier
      if ((favoriteCompany.length > 0 && (bid && (/* bid.status !== 'Pending' && */bid.status !== 'Declined')))
      || (bid && bid.hasCustomerAccepted === 1 && bid.status !== 'Declined')) {
        return (
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
      // the carrier is not a favorite
      if (bid === null || (bid && (bid.status !== 'Pending' && bid.status !== 'Declined'))) {
        return (
          <TSubmitButton
            onClick={() => this.handleConfirmRequestCarrier('Request')}
            className="primaryButton"
            loading={btnSubmitting}
            loaderSize={10}
            bntText="Request Job"
          />
        );
      }

      // the carrier is not a favorite
      if (bid && bid.status === 'Declined') {
        return (
          <h3 style={{
            marginTop: 20,
            marginLeft: 15,
            marginBottom: 20
          }}
          >You have declined this job.
          </h3>
        );
      }

      return (
        <h3 style={{
          marginTop: 20,
          marginLeft: 15,
          marginBottom: 20
        }}
        >You have requested this job.
        </h3>
      );
    }
    // If a Customer is 'Offering' a Job, the Carrier can Accept or Decline it
    if ((job.status === 'On Offer' || job.status === 'Published And Offered')
      && companyType === 'Carrier'
      && bid.status !== 'Declined'
      // Check if the carrier is a favorite OR the Customer is 'Requesting' this particular Carrier
      && (favoriteCompany.length > 0 || (bid.status === 'Pending' && bid.companyCarrierId === profile.companyId))
    ) {
      return (
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
    /* if (companyType === 'Customer'
      && (bid.hasSchedulerAccepted && !bid.hasCustomerAccepted)
      && bid.status !== 'Declined') {
      // console.log('We are a customer and we have a Carrier's job request');
      return (
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
    } */
    if ((job.status === 'Booked' || job.status === 'Allocated' || job.status === 'In Progress') && companyType === 'Carrier') {
      return (
        <TSubmitButton
          onClick={() => this.toggleAllocateDriversModal()}
          className="primaryButton"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Allocate Drivers"
        />
      );
    }
    return (<React.Fragment/>);
  }

  renderAllocateDriversModal() {
    const { allocateDriversModal, drivers, selectedDrivers, btnSubmitting } = this.state;
    const driverData = drivers;    
    const driverColumns = [
      {
        displayName: 'First Name',
        name: 'firstName'
      }, {
        displayName: 'Last Name',
        name: 'lastName'
      }, {
        displayName: 'Email',
        name: 'email'
      }, {
        displayName: 'Phone',
        name: 'mobilePhone'
      }, {
        displayName: 'Status',
        name: 'userStatus'
      }
    ];
    return (
      <Modal
        isOpen={allocateDriversModal}
        toggle={this.toggleAllocateDriversModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__body" style={{ padding: '0px' }}>
          <Container className="dashboard">
            <Row>
              <Col md={12} lg={12}>
                <Card style={{ paddingBottom: 0 }}>
                  <h1 style={{
                    marginTop: 20,
                    marginLeft: 20
                  }}
                  >
                    Allocate Drivers
                  </h1>

                  <div className="row">

                    <TTable
                      handleRowsChange={() => {
                      }}
                      data={driverData}
                      columns={driverColumns}
                      handlePageChange={() => {
                      }}
                      handleIdClick={() => {
                      }}
                      isSelectable
                      onSelect={selected => this.setState({ selectedDrivers: selected })}
                      selected={selectedDrivers}
                    />
                    <div className="col-md-8"/>
                    <div className="col-md-4">
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

  render() {
    const {
      job,
      bid,
      companyType,
      favoriteCompany,
      loaded,
      btnSubmitting,
      companyCarrier,
      profile,
      accessForbidden
    } = this.state;
    if (accessForbidden) {
      return (
        <Container className="container">
          <Row>
            <Col md={12}>
              <h3 className="page-title">Job Details</h3>
            </Col>
          </Row>
          <h1>Access Forbidden</h1>
        </Container>
      );
    }

    if (loaded) {
      if (companyType !== null && job !== null) {
        return (
          <div className="container">
            {this.renderAllocateDriversModal(profile)}
            <div className="row">
              <div className="col-md-3">
                {this.renderActionButtons(job, companyType, favoriteCompany, btnSubmitting, bid)}
              </div>
            </div>
            {this.renderBidsTable()}
            {this.renderJobForm(companyType, companyCarrier, job)}
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
