import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import { Card, CardBody, Row, Container, Col, Modal, ButtonToolbar, Button } from 'reactstrap';
import './jobs.css';
import CloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import TFormat from '../common/TFormat';
import CompanyService from '../../api/CompanyService';
import BidService from '../../api/BidService';
import TTable from '../common/TTable';
import TSubmitButton from '../common/TSubmitButton';
import JobService from '../../api/JobService';
import UserService from '../../api/UserService';
import TwilioService from '../../api/TwilioService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import EquipmentService from '../../api/EquipmentService';
import GroupService from '../../api/GroupService';
import ProfileService from '../../api/ProfileService';

class BidsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newJob: [],
      profile: [],
      bids: [],
      booking: null,
      bookingEquipment: null,
      selectedBid: [],
      selectedBidCompany: [],
      totalBids: 0,
      page: 0,
      rows: 10,
      modalAcceptBid: false,
      loaded: false,
      btnSubmitting: false
    };

    // this.handleJobEdit = this.handleJobEdit.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.toggleBidModal = this.toggleBidModal.bind(this);
    // this.closeNow = this.closeNow.bind(this);
  }

  async componentDidMount() {
    const { job } = this.props;
    let { totalBids, profile } = this.state;
    profile = await ProfileService.getProfile();
    let bids = await BidService.getBidsInfoByJobId(job.id);

    bids = bids.map((bid) => {
      const newBid = bid;

      newBid.date = bid.createdOn;
      newBid.dateF = TFormat.asDate(bid.createdOn);

      if (newBid.status === 'Pending') {
        newBid.status = 'Requested';
      }

      return newBid;
    });

    totalBids = bids.length;

    this.setState({ newJob: job, bids, totalBids, profile, loaded: true });
  }

  async toggleBidModal(bidId) {
    let {modalAcceptBid} = this.state;
    let { selectedBid, selectedBidCompany } = this.state;

    if (typeof bidId === 'number') {
      selectedBid = await BidService.getBidById(bidId);
      selectedBidCompany = await CompanyService.getCompanyById(selectedBid.companyCarrierId);

      if (selectedBid.status === 'Declined'
        || selectedBid.status === 'Ignored'
        || selectedBid.status === 'Accepted'
        || selectedBid.status === 'New') {
        modalAcceptBid = true; // this prevents the modal from opening
      }
    }
    this.setState({
      selectedBid,
      selectedBidCompany,
      modalAcceptBid: !modalAcceptBid
    });
  }

  handlePageChange(page) {
    this.setState({ page });
  }

  handleRowsPerPage(rows) {
    this.setState({ rows });
  }

  async saveBid(action) {
    const { updateJob } = this.props;
    const {
      selectedBid, profile
    } = this.state;
    let { newJob, bids, booking, bookingEquipment } = this.state;
    let newBid = [];
    let ignoredBids = [];
    let allBids = [];
    const ignoredCompanies = [];
    this.setState({ btnSubmitting: true });

    const job = await JobService.getJobById(selectedBid.jobId);

    if (action === 'accept') {
      // Updating Job
      newJob = CloneDeep(job);
      newJob.status = 'Booked';
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment()
        .unix() * 1000;
      await JobService.updateJob(newJob);

      // For all of the Bids that are going to be 'Ignored'
      bids = await BidService.getBidsInfoByJobId(selectedBid.jobId);
      ignoredBids = bids.filter(bid => ((bid.id !== selectedBid.id)));
      if (ignoredBids.length > 0) {
        const ignoredBidsList = [];
        let originalIgnoredBids = [];

        // Get the data from all ignored bids
        for (let i = 0; i < ignoredBids.length; i += 1) {
          originalIgnoredBids.push(BidService.getBidById(ignoredBids[i].id));
        }
        originalIgnoredBids = await Promise.all(originalIgnoredBids);

        // Get the Ids from those bids' companies
        for (let i = 0; i < originalIgnoredBids.length; i += 1) {
          ignoredCompanies.push(originalIgnoredBids[i].companyCarrierId);
        }

        // Update Ingored Bids data
        for (let i = 0; i < originalIgnoredBids.length; i += 1) {
          // console.log(originalIgnoredBids[i]);
          const ignoredBid = CloneDeep(originalIgnoredBids[i]);
          ignoredBid.hasSchedulerAccepted = 1;
          ignoredBid.hasCustomerAccepted = 0;
          ignoredBid.status = 'Ignored';
          ignoredBid.rateEstimate = newJob.rateEstimate;
          ignoredBid.rateType = newJob.rateType;
          ignoredBid.rate = newJob.rate;
          ignoredBid.notes = newJob.notes;
          ignoredBid.modifiedBy = profile.userId;
          ignoredBid.modifiedOn = moment()
            .unix() * 1000;
          // console.log(ignoredBid);
          ignoredBidsList.push(BidService.updateBid(ignoredBid));
        }

        // then we get those companies' admin phone numbers
        const ignoredAdminTels = await GroupService.getGroupAdminsTels(ignoredCompanies);

        // Send a notification SMS to the admins
        const allIgnoreSms = [];
        for (const adminTel of ignoredAdminTels) {
          if (this.checkPhoneFormat(adminTel)) {
            const notification = {
              to: this.phoneToNumberFormat(adminTel),
              body: `We're sorry, the job [${job.name}] is no longer available. Please log in to Trelar to look for more jobs.`
            };
            allIgnoreSms.push(TwilioService.createSms(notification));
          }
        }

        // console.log(ignoredBidsList);
        await Promise.all(ignoredBidsList);
        await Promise.all(allIgnoreSms);
      }

      // Updating 'winner' Bid
      newBid = await BidService.getBidById(selectedBid.id);
      newBid = CloneDeep(newBid);
      newBid.hasSchedulerAccepted = 1;
      newBid.hasCustomerAccepted = 1;
      newBid.status = 'Accepted';
      newBid.rateEstimate = newJob.rateEstimate;
      newBid.notes = newJob.notes;
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment()
        .unix() * 1000;
      newBid = await BidService.updateBid(newBid);

      // Create a Booking
      booking = {};
      booking.bidId = newBid.id;
      booking.rateType = newBid.rateType;
      booking.startTime = newJob.startTime;
      booking.schedulersCompanyId = newBid.companyCarrierId;
      booking.sourceAddressId = newJob.startAddress;
      booking.startAddressId = newJob.startAddress;
      booking.endAddressId = newJob.endAddress;
      booking.bookingStatus = 'New';
      booking.createdBy = profile.userId;
      booking.createdOn = moment().unix() * 1000;
      booking.modifiedOn = moment().unix() * 1000;
      booking.modifiedBy = profile.userId;
      booking = await BookingService.createBooking(booking);

      // Create Booking Equipment
      /* const response = await EquipmentService.getEquipments();
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
        bookingEquipment = await BookingEquipmentService.createBookingEquipments(
          bookingEquipment
        );
      } */
      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // We tell the customer that the job has been accepted
      const customerAdmin = await UserService.getAdminByCompanyId(job.companiesId);
      if (customerAdmin.length > 0) { // check if we get a result
        if (customerAdmin[0].mobilePhone && this.checkPhoneFormat(customerAdmin[0].mobilePhone)) {
          const notification = {
            to: this.phoneToNumberFormat(customerAdmin[0].mobilePhone),
            body: 'Your job request has been accepted.'
          };
          await TwilioService.createSms(notification);
        }
      }

      // updating parent component JobSavePage
      updateJob(newJob, newBid.companyCarrierId);
    } else {
      // Decline Bid
      newBid = CloneDeep(selectedBid);
      newBid.status = 'Declined';
      newBid.hasCustomerAccepted = 0;
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment()
        .unix() * 1000;
      newBid = await BidService.updateBid(newBid);

      // Notify Carrier company's admin that the job request was declined
      /* console.log(`We're sorry, your request for the Job [${job.name}] was not accepted.
      Please log in to Trelar to look for more jobs.`); */
      const carrierAdmin = await UserService.getAdminByCompanyId(selectedBid.companyCarrierId);
      if (carrierAdmin.length > 0) { // check if we get a result
        if (carrierAdmin[0].mobilePhone && this.checkPhoneFormat(carrierAdmin[0].mobilePhone)) {
          const notification = {
            to: this.phoneToNumberFormat(carrierAdmin[0].mobilePhone),
            body: `We're sorry, your request for the Job [${job.name}] was not accepted.
              Please log in to Trelar to look for more jobs.`
          };
          await TwilioService.createSms(notification);
        }
      }

      // updating parent component JobSavePage
      updateJob(newJob);
    }

    allBids = await BidService.getBidsInfoByJobId(selectedBid.jobId);
    allBids.map((bid) => {
      newBid = bid;
      newBid.date = bid.createdOn;
      newBid.dateF = TFormat.asDate(bid.createdOn);
      return newBid;
    });

    this.setState({ newJob, bids: allBids, btnSubmitting: false });
    this.toggleBidModal();
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

  renderTitle() {
    const { newJob } = this.state;
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">{newJob.status === 'Published' || newJob.status === 'Published And Offered' ? 'Open Requests' : 'Requests History' }</h3>
        </Col>
      </Row>
    );
  }

  renderTableLegend() {
    const { totalBids } = this.state;
    return (
      <div className="ml-4 mt-4">
        Total number of offers: {totalBids}
      </div>
    );
  }

  renderBidsTable() {
    const { bids } = this.state;
    return (
      <Container>
        <Card>
          <CardBody>
            {this.renderTableLegend()}
            <TTable
              columns={
                [
                  {
                    name: 'carrierName',
                    displayName: 'Carrier Name'
                  },
                  {
                    name: 'contactName',
                    displayName: 'Contact'
                  },
                  {
                    name: 'status',
                    displayName: 'Status'
                  },
                  /* { // TODO v2
                    name: 'acceptanceRate',
                    displayName: 'Acceptance Rate'
                  }, */
                  {
                    name: 'loadsNumber',
                    displayName: 'Loads Completed'
                  },
                  {
                    name: 'dateF',
                    displayName: 'Date Requested',
                    // label: 'dateF'
                  }
                ]
              }
              data={bids}
              handleIdClick={this.toggleBidModal}
              handleRowsChange={this.handleRowsPerPage}
              handlePageChange={this.handlePageChange}
              // totalCount={totalCount}
            />
          </CardBody>
        </Card>
      </Container>
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

  renderBidModal() {
    const {
      modalAcceptBid,
      btnSubmitting,
      selectedBidCompany
    } = this.state;

    if (modalAcceptBid) {
      return (
        <Modal
          isOpen={modalAcceptBid}
          toggle={this.toggleBidModal}
          className="modal-dialog--primary modal-dialog--header"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleViewJobModal}
            />
            <div className="bold-text modal__title">Carrier Request</div>
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
                        Do you want to assign {selectedBidCompany.legalName} to this job?
                      </Row>
                      <hr/>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-6 wizard__toolbar">
                          <Button color="minimal" className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={this.toggleBidModal}
                          >
                            Cancel
                          </Button>
                        </ButtonToolbar>
                        <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                          <TSubmitButton
                            onClick={() => this.saveBid('decline')}
                            className="secondaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Decline Request"
                          />
                          <TSubmitButton
                            onClick={() => this.saveBid('accept')}
                            className="primaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Accept Request"
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

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderBidModal()}
          {this.renderTitle()}
          {this.renderBidsTable()}
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        {this.renderLoader()}
      </Container>
    );
  }
}

BidsTable.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number
  }),
  updateJob: PropTypes.func.isRequired
};

BidsTable.defaultProps = {
  job: null
};

export default BidsTable;
