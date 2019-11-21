import React, {Component} from 'react';
import {
  Col,
  Row,
  Container,
  Modal,
  Card,
  Button,
  CardBody,
  ButtonToolbar
} from 'reactstrap';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import {Link, Redirect} from 'react-router-dom';
import TFormat from '../common/TFormat';
import TField from '../common/TField';
import TSelect from '../common/TSelect';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';
import CompanyService from '../../api/CompanyService';
import ProfileService from '../../api/ProfileService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import UserService from '../../api/UserService';
import LoadService from '../../api/LoadService';
import GroupListService from '../../api/GroupListService';
import TSubmitButton from '../common/TSubmitButton';
import JobForm from './JobForm';
import BidsTable from './BidsTable';
import JobCreatePopup from './JobCreatePopup';
import JobClosePopup from './JobClosePopup';
import JobDeletePopup from './JobDeletePopup';
import JobWizard from './JobWizard';
import LookupsService from '../../api/LookupsService';
import JobResumePopup from './JobResumePopup';
import JobPausePopup from './JobPausePopup';
import JobAllocate from './JobAllocate';

class JobSavePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      goToDashboard: false,
      goToJob: false,
      goToRefreshJob: false,
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
      company: null,
      bid: null,
      bids: [],
      booking: null,
      favoriteCompany: [],
      profile: {},
      customerAdmin: null,
      companyCarrier: null,
      companyCarrierData: null,
      // moved companyType to the first level
      // for some reason I couldn't set it when nested
      companyType: null,
      btnSubmitting: false,
      selectedDrivers: [],
      accessForbidden: false,
      modalAddJob: false,
      modalEditJob: false,
      modalEditSavedJob: false,
      modalLiability: false,
      modalCancelRequest: false,
      modalCancel1: false,
      modalCancel2: false,
      modalResumeJob: false,
      modalPauseJob: false,
      driversWithLoads: [],
      approveCancel: '',
      cancelReason: '',
      approveCancelReason: '',
      showOtherReasonInput: false,
      showLateCancelNotice: false,
      reqHandlerCarrierCancel: {
        touched: false,
        error: ''
      },
      reqHandlerCancel: {
        touched: false,
        error: ''
      },
      reqHandlerCancelReason: {
        touched: false,
        error: ''
      },
      closeModal: false,
      deleteModal: false,
      carrierCancelReasons: []
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleConfirmRequestCarrier = this.handleConfirmRequestCarrier.bind(this);
    // this.toggleAllocateDriversModal = this.toggleAllocateDriversModal.bind(this);
    // this.handleAllocateDrivers = this.handleAllocateDrivers.bind(this);
    this.updateJobView = this.updateJobView.bind(this);
    this.updateCopiedJob = this.updateCopiedJob.bind(this);
    this.toggleNewJobModal = this.toggleNewJobModal.bind(this);
    this.toggleEditExistingJobModal = this.toggleEditExistingJobModal.bind(this);
    this.toggleEditSavedJobModal = this.toggleEditSavedJobModal.bind(this);
    this.toggleCopyJobModal = this.toggleCopyJobModal.bind(this);
    this.toggleLiabilityModal = this.toggleLiabilityModal.bind(this);
    this.toggleCancelRequest = this.toggleCancelRequest.bind(this);
    this.toggleCarrierCancelModal = this.toggleCarrierCancelModal.bind(this);
    this.toggleCancelModal1 = this.toggleCancelModal1.bind(this);
    this.toggleCancelModal2 = this.toggleCancelModal2.bind(this);
    this.loadSavePage = this.loadSavePage.bind(this);
    this.handleCancelJob = this.handleCancelJob.bind(this);
    this.handleCarrierCancelJob = this.handleCarrierCancelJob.bind(this);
    this.handleCancelInputChange = this.handleCancelInputChange.bind(this);
    this.handleCancelReasonInputChange = this.handleCancelReasonInputChange.bind(this);
    this.toggleCloseModal = this.toggleCloseModal.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.closeJobModal = this.closeJobModal.bind(this);
    this.deleteJobModal = this.deleteJobModal.bind(this);
    this.handleSelectCancelReason = this.handleSelectCancelReason.bind(this);
    this.toggleResumeJobModal = this.toggleResumeJobModal.bind(this);
    this.togglePauseJobModal = this.togglePauseJobModal.bind(this);
  }

  async componentDidMount() {
    await this.loadSavePage();
  }

  async componentWillReceiveProps(nextProps) {
    const {job} = this.state;
    if (parseInt(nextProps.match.params.id, 10) !== parseInt(job.id, 10)) {
      this.setState({goToRefreshJob: false});
      await this.loadSavePage(parseInt(nextProps.match.params.id, 10));
    }
  }

  async loadSavePage(jobId) {
    const {match} = this.props;
    let {
      job,
      company,
      bid,
      booking,
      profile,
      favoriteCompany,
      selectedDrivers,
      companyCarrier,
      companyCarrierData,
      customerAdmin,
      showLateCancelNotice
    } = this.state;
    const {carrierCancelReasons} = this.state;
    const driversWithLoads = [];
    try {
      profile = await ProfileService.getProfile();

      if (match.params.id) {
        try {
          if (jobId) { // we are updating the view
            job = await JobService.getJobById(jobId);
          } else { // we are loading the view
            job = await JobService.getJobById(match.params.id);
          }
          company = await CompanyService.getCompanyById(profile.companyId);
        } catch (e) {
          if (e.message === 'Access Forbidden') {
            // access 403
            this.setState({accessForbidden: true});
            return;
          }
        }

        if (job) {
          // company
          job.company = await CompanyService.getCompanyById(job.companiesId);
          customerAdmin = await UserService.getAdminByCompanyId(job.companiesId);
          // start address
          // let startAddress = null;
          if (job.startAddress) {
            job.startAddress = await AddressService.getAddressById(job.startAddress);
          }
          // end address
          // let endAddress = null;
          if (job.endAddress) {
            job.endAddress = await AddressService.getAddressById(job.endAddress);
          }

          // materials
          const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
          if (materials && materials.length > 0) {
            const latestMaterial = materials[0];
            job.materials = latestMaterial.value;
          }

          // job.company = company;
          // job.startAddress = startAddress;
          // job.endAddress = endAddress;

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
                } else if (filteredBid.hasCustomerAccepted === 0
                  && filteredBid.hasSchedulerAccepted === 1
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
          }

          if (companyCarrier) {
            try {
              companyCarrierData = await CompanyService.getCompanyById(companyCarrier);
            } catch (err) {
              console.error(err);
            }
          }

          // Check if a carrier is late when cancelling a job
          // (after 3pm one day before job.startTime)
          if (profile.companyType === 'Carrier'
          && (job.status === 'Booked' || job.status === 'Allocated')) {
            // dayBeforeJobDate is a day before job.startTime
            const dayBeforeJobDate = moment(job.startTime).tz(
              profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
            ).subtract(1, 'days').format('MM/DD/YYYY HH:mm:ss');
            // console.log('1 day before job date: ', dayBeforeJobDate);

            // cancelDueDate is a day before at 15:00:00
            const cancelDueDate = `${moment().tz(
              profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
            ).subtract(1, 'days').format('MM/DD/YYYY')} 15:00:00`;
            // console.log('cancel due date: ', cancelDueDate);

            const timeFormat = 'MM/DD/YYYY hh:mm:ss';

            // Check if dayBeforeJobDate is after cancelDueDate with moment's isAfter().
            // If true, a carrier will see a late cancelling warning notice when trying to cancel
            showLateCancelNotice = moment(dayBeforeJobDate, timeFormat).tz(
              profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
            ).isBefore(moment(cancelDueDate, timeFormat).tz(
              profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
            ));

            try {
              const lookups = await LookupsService.getLookupsCarrierCancelReasons();
              if (Object.keys(lookups).length > 0) {
                Object.values(lookups).forEach((itm) => {
                  carrierCancelReasons.push({
                    value: itm.val1,
                    label: itm.val1
                  });
                });
              }
            } catch (err) {
              console.error(err);
            }
            carrierCancelReasons.push({
              value: 'Other',
              label: 'Other'
            });
          }

          // bookings
          let bookings = [];
          try {
            bookings = await BookingService.getBookingsByJobId(job.id);
          } catch (error) {
            // console.log('Unable to obtain bookings');
          }
          if (bookings && bookings.length > 0) {
            [booking] = bookings;

            const driversResponse = await LoadService.getDriversWithLoadsByBookingId(booking.id);
            if (driversResponse && driversResponse.length > 0) {
              driversResponse.map(driver => (
                driversWithLoads.push(driver.id)
              ));
            }
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
            job,
            company,
            bid,
            bids,
            companyCarrier,
            companyCarrierData,
            booking,
            profile,
            companyType: profile.companyType,
            favoriteCompany,
            customerAdmin,
            drivers: enabledDrivers,
            showLateCancelNotice,
            carrierCancelReasons
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
      // console.error(err);
    }
  }

  toggleResumeJobModal() {
    const {modalResumeJob} = this.state;
    this.setState({
      modalResumeJob: !modalResumeJob
    });
  }

  togglePauseJobModal() {
    const {modalPauseJob} = this.state;
    this.setState({
      modalPauseJob: !modalPauseJob
    });
  }

  toggleNewJobModal() {
    const {modalAddJob} = this.state;
    this.setState({
      modalAddJob: !modalAddJob
    });
  }

  toggleEditExistingJobModal() {
    const {modalEditJob} = this.state;
    this.setState({
      modalEditJob: !modalEditJob
    });
  }

  toggleEditSavedJobModal() {
    const {modalEditSavedJob} = this.state;
    this.setState({
      modalEditSavedJob: !modalEditSavedJob
    });
  }

  toggleCopyJobModal() {
    const {modalCopyJob} = this.state;
    this.setState({
      modalCopyJob: !modalCopyJob
    });
  }

  toggleCloseModal() {
    const {closeModal} = this.state;
    this.setState({
      closeModal: !closeModal
    });
  }

  toggleDeleteModal() {
    const {deleteModal} = this.state;
    this.setState({
      deleteModal: !deleteModal
    });
  }

  toggleLiabilityModal() {
    const {modalLiability} = this.state;
    this.setState({
      modalLiability: !modalLiability
    });
  }

  toggleCancelRequest() {
    const {modalCancelRequest} = this.state;
    this.setState({
      modalCancelRequest: !modalCancelRequest
    });
  }

  toggleCarrierCancelModal() {
    const {modalCarrierCancel, reqHandlerCarrierCancel} = this.state;
    reqHandlerCarrierCancel.touched = false;
    this.setState({
      modalCarrierCancel: !modalCarrierCancel,
      reqHandlerCarrierCancel
    });
  }

  toggleCancelModal1() {
    const {modalCancel1, reqHandlerCancel} = this.state;
    reqHandlerCancel.touched = false;
    this.setState({
      modalCancel1: !modalCancel1,
      reqHandlerCancel
    });
  }

  toggleCancelModal2() {
    const {modalCancel2, reqHandlerCancelReason} = this.state;
    reqHandlerCancelReason.touched = false;
    this.setState({
      modalCancel2: !modalCancel2,
      reqHandlerCancelReason
    });
  }

  updateCopiedJob(newJob) {
    const {job} = this.state;
    job.newId = newJob.id;
    this.setState({
      job,
      companyCarrier: null,
      goToRefreshJob: true
    });
  }

  async updateJobView(newJob, companyCarrier) { // updating the job view
    const job = newJob;
    const company = await CompanyService.getCompanyById(job.companiesId);
    const startAddress = await AddressService.getAddressById(job.startAddress);
    let endAddress = null;
    if (job.endAddress) {
      endAddress = await AddressService.getAddressById(job.endAddress);
    }
    const materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
    if (materials.length > 0) {
      const latestMaterial = materials[0];
      job.materials = latestMaterial.value;
    }
    job.company = company;
    job.startAddress = startAddress;
    job.endAddress = endAddress;
    this.setState({job, companyCarrier});
  }

  async handleCancelJob() {
    const {
      job,
      approveCancelReason,
      reqHandlerCancelReason,
      profile
    } = this.state;
    let newJob = [];

    if (approveCancelReason === '') {
      this.setState({
        reqHandlerCancelReason: {
          ...reqHandlerCancelReason,
          touched: true,
          error: 'You must provide the reason for the cancellation of the job'
        }
      });
    } else {
      this.setState({
        btnSubmitting: true
      });


      const cancelReason = `[Cancelled by ${profile.companyType}] ${approveCancelReason}`;
      try {
        await JobService.cancelJobAsProducer(job.id, cancelReason);
        newJob = await JobService.getJobById(job.id);
      } catch (e) {
        // console.log(e);
      }

      this.updateJobView(newJob);
      this.setState({
        btnSubmitting: false
      });
      this.toggleCancelModal2();
    }
  }

  async handleCarrierCancelJob() {
    const {
      job,
      showOtherReasonInput,
      approveCancelReason,
      reqHandlerCancel,
      reqHandlerCancelReason
    } = this.state;
    let {cancelReason} = this.state;
    let newJob = [];

    reqHandlerCancel.touched = false;
    reqHandlerCancelReason.touched = false;

    if (cancelReason === '') {
      this.setState({
        reqHandlerCancel: {
          ...reqHandlerCancel,
          touched: true,
          error: 'You must provide the reason for the cancellation of the job'
        }
      });
      return;
    }

    if (showOtherReasonInput && approveCancelReason === '') {
      this.setState({
        reqHandlerCancelReason: {
          ...reqHandlerCancelReason,
          touched: true,
          error: 'You must provide the reason for the cancellation of the job'
        }
      });
      return;
    }

    if (cancelReason === 'Other') {
      cancelReason = approveCancelReason;
    }

    this.setState({
      btnSubmitting: true
    });

    try {
      await JobService.cancelJobAsCarrier(job.id, cancelReason);
      newJob = await JobService.getJobById(job.id);
    } catch (e) {
      // console.log(e);
    }

    this.updateJobView(newJob);
    this.setState({
      btnSubmitting: false
    });
    this.toggleCarrierCancelModal();
  }

  handleCancelInputChange(e) {
    const {reqHandlerCancel} = this.state;
    reqHandlerCancel.touched = false;
    this.setState({
      approveCancel: e.target.value.toUpperCase(),
      reqHandlerCancel
    });
  }

  handleCancelReasonInputChange(e) {
    const {reqHandlerCancelReason} = this.state;
    reqHandlerCancelReason.touched = false;
    this.setState({
      approveCancelReason: e.target.value,
      reqHandlerCancelReason
    });
  }

  async handleSelectCancelReason(option) {
    const {value} = option;
    const {reqHandlerCancel} = this.state;
    let {cancelReason, showOtherReasonInput} = this.state;
    reqHandlerCancel.touched = false;
    cancelReason = value;
    if (cancelReason === 'Other') {
      showOtherReasonInput = true;
    } else {
      showOtherReasonInput = false;
    }
    this.setState({cancelReason, showOtherReasonInput, reqHandlerCancel});
  }

  goToSecondCancelJobModal() {
    const {approveCancel, reqHandlerCancel} = this.state;
    if (approveCancel !== 'CANCEL') {
      this.setState({
        reqHandlerCancel: {
          ...reqHandlerCancel,
          touched: true,
          error: 'You must type CANCEL in this box in order to proceed'
        }
      });
    } else {
      this.toggleCancelModal1();
      this.toggleCancelModal2();
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({[`goTo${menuItem}`]: true});
    }
  }

  async handleDelete() {
    const {match} = this.props;
    const {id} = match.params;
    await JobService.deleteJobById(id);
    this.handlePageClick('Job');
  }

  // Carrier clicks on 'Accept Job' or 'Request Job'
  async handleConfirmRequestCarrier(action) {
    this.setState({
      btnSubmitting: true
    });

    const {job, bid} = this.state;
    // A favorite Carrier "accepts" the job
    if (action === 'Accept') {
      try {
        await BidService.acceptBid(job.id, bid.id);
      } catch (e) {
        // console.log(e);
      }
    } else if (action === 'Decline') { // A Carrier "declines" a job request
      try {
        await BidService.declineBid(job.id, bid.id);
      } catch (e) {
        // console.log(e);
      }
    } else if (action === 'Cancel Request') {
      try {
        await BidService.deleteBidbById(bid.id);
        this.setState({bid: null});
      } catch (err) {
        console.error(err);
      }
      this.toggleCancelRequest();
    }

    this.setState({btnSubmitting: false});
  }

  // check format ok
  checkPhoneFormat(phone) {
    const phoneNotParents = String(UserUtils.phoneToNumberFormat(phone));
    const areaCode3 = phoneNotParents.substring(0, 3);
    const areaCode4 = phoneNotParents.substring(0, 4);
    if (areaCode3.includes('555') || areaCode4.includes('1555')) {
      return false;
    }
    return true;
  }

  async closeJobModal() {
    const {job} = this.state;

    // Notify Admin
    try {
      await this.notifyAdminViaSms(`${job.name} has ended. Do not pickup any more material.`, job.id);
    } catch (error) {
      // console.log('Unable to notify admin');
    }

    await this.loadSavePage();
    // TODO -> Graciously notify the user that we ended the job.
  }

  async deleteJobModal() {
    await this.loadSavePage();
    // TODO -> Graciously notify the user that we deleted the job.
  }

  renderGoTo() {
    const {goToDashboard, goToJob, goToRefreshJob, job} = this.state;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToJob) {
      return <Redirect push to="/jobs"/>;
    }
    if (goToRefreshJob) {
      return <Redirect to={`/jobs/save/${job.newId}`}/>;
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

  renderJobForm(companyType, job) {
    const {companyCarrier, bid} = this.state;
    return (
      <JobForm
        job={job}
        bid={bid}
        companyCarrier={companyCarrier}
        handlePageClick={this.handlePageClick}
      />
    );
  }

  renderBidsTable() {
    const {job, companyType} = this.state;
    if (companyType === 'Customer' && job.status !== 'Job Deleted') {
      return (
        <BidsTable
          job={job}
          updateJobView={this.updateJobView}
        />
      );
    }
    return '';
  }

  renderActionButtons(job, companyType, favoriteCompany, btnSubmitting, bid) {
    const {profile, company, bids, booking} = this.state;
    const companyProducer = job.company;
    const companyCarrier = company;
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
            {(companyProducer.liabilityGeneral > 0.01 || companyProducer.liabilityAuto > 0.01)
            && ((companyCarrier.liabilityGeneral < companyProducer.liabilityGeneral)
              || (companyCarrier.liabilityAuto < companyProducer.liabilityAuto))
            && ( // Carrier has not enough liability insurance, show confirmation modal
              <TSubmitButton
                onClick={() => this.toggleLiabilityModal()}
                className="primaryButton"
                loading={btnSubmitting}
                loaderSize={10}
                bntText="Accept Job"
              />
            )}
            {(((!companyProducer.liabilityGeneral || companyProducer.liabilityGeneral === 0)
              && (!companyProducer.liabilityAuto || companyProducer.liabilityAuto === 0))
              || ((companyCarrier.liabilityGeneral > companyProducer.liabilityGeneral)
                && (companyCarrier.liabilityAuto > companyProducer.liabilityAuto)))
            && ( // Carrier has enough liability insurance OR Producer has not set up Insurance
              <TSubmitButton
                onClick={() => this.handleConfirmRequestCarrier('Accept')}
                className="primaryButton"
                loading={btnSubmitting}
                loaderSize={10}
                bntText="Accept Job"
              />
            )}
          </div>
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
      if (bid && bid.status === 'Pending') {
        return (
          <TSubmitButton
            onClick={() => this.toggleCancelRequest()}
            className="primaryButton"
            loading={btnSubmitting}
            loaderSize={10}
            bntText="Cancel Request"
          />
        );
      }
    }
    // If a Customer is 'Offering' a Job, the Carrier can Accept or Decline it
    if ((job.status === 'On Offer' || job.status === 'Published And Offered')
      && companyType === 'Carrier'
      && (bid && bid.status !== 'Declined')
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

    const requestedBids = bids.filter((filteredBid) => {
      if (filteredBid.status !== 'New') {
        return filteredBid;
      }
      return null;
    });
    if ((companyType === 'Customer') // 'Edit' button: show only to customers
      // For Saved jobs
      && ((job.status === 'Saved')
        // Or Jobs offers that do not have requests yet
        || ((job.status === 'Published' || job.status === 'Published And Offered' || job.status === 'On Offer')
          && ((requestedBids.length === 0)))
      )
    ) {
      if (job.status === 'Published' || job.status === 'Published And Offered' || job.status === 'On Offer') {
        // this is to edit an already 'published' job
        return (
          <TSubmitButton
            onClick={() => this.toggleEditExistingJobModal()}
            className="secondaryButton"
            loading={btnSubmitting}
            loaderSize={10}
            bntText="Edit"
          />
        );
      }
      // this is to edit a 'saved' job
      return (
        <TSubmitButton
          onClick={() => this.toggleEditSavedJobModal()}
          className="secondaryButton"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Edit"
        />
      );
    }
    return (<React.Fragment/>);
  }

  renderCopyButton() {
    const {btnSubmitting} = this.state;
    return (
      <TSubmitButton
        onClick={() => this.toggleCopyJobModal()}
        className="secondaryButton"
        loading={btnSubmitting}
        loaderSize={10}
        bntText="Copy Job"
      />
    );
  }

  renderResumeButton() {
    const {job} = this.state;
    if (job.status === 'Paused') {
      return (
        <Button
          onClick={() => this.toggleResumeJobModal()}
          type="button"
          className="primaryButton"
          id="pausedJobsButton"
        >
          Resume Job
        </Button>
      );
    }
    return false;
  }

  renderCloseButton() {
    const {job} = this.state;
    if (job.status === 'In Progress' || job.status === 'Paused') {
      return (
        <TSubmitButton
          onClick={() => this.toggleCloseModal()}
          className="secondaryButton"
          loading={false}
          loaderSize={10}
          bntText="End Job"
        />
      );
    }
    return false;
  }

  renderDeleteButton() {
    const {job} = this.state;
    if (job.status === 'Published'
    || job.status === 'Published And Offered'
    || job.status === 'On Offer'
    || job.status === 'Saved') {
      return (
        <TSubmitButton
          onClick={() => this.toggleDeleteModal()}
          className="secondaryButton"
          loading={false}
          loaderSize={10}
          bntText="Delete Job"
        />
      );
    }
    return false;
  }

  renderCancelButton() {
    const {job, profile, btnSubmitting} = this.state;
    if ((job.status === 'Booked' || job.status === 'Allocated') && profile.isAdmin) {
      return (
        <TSubmitButton
          onClick={profile.companyType === 'Carrier' ? () => this.toggleCarrierCancelModal() : () => this.toggleCancelModal1()}
          className="secondaryButton"
          loading={btnSubmitting}
          loaderSize={10}
          bntText="Cancel Job"
        />
      );
    }
    return false;
  }

  renderPauseButton() {
    const {job, profile, btnSubmitting} = this.state;
    if (job.status === 'In Progress') {
      return (
        <Button
          onClick={() => this.togglePauseJobModal()}
          type="button"
          className="primaryButton"
          id="pausedJobsButton"
        >
          Pause Job
        </Button>
      );
    }
    return false;
  }

  renderResumeJobModal() {
    const {
      modalResumeJob,
      job,
      profile
    } = this.state;
    return (
      <Modal
        isOpen={modalResumeJob}
        toggle={this.toggleResumeJobModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobResumePopup
          jobId={job.id}
          profile={profile}
          updateResumedJob={this.updateJobView}
          toggle={this.toggleResumeJobModal}
        />
      </Modal>
    );
  }

  renderPauseJobModal() {
    const {
      modalPauseJob,
      job,
      profile
    } = this.state;
    return (
      <Modal
        isOpen={modalPauseJob}
        toggle={this.togglePauseJobModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobPausePopup
          job={job}
          profile={profile}
          updatePausedJob={this.updateJobView}
          toggle={this.togglePauseJobModal}
        />
      </Modal>
    );
  }

  renderCloseJobModal() {
    const {closeModal, job} = this.state;
    return (
      <Modal
        isOpen={closeModal}
        toggle={this.toggleCloseModal}
        className="status-modal"
        backdrop="static"
      >
        <JobClosePopup
          toggle={this.toggleCloseModal}
          closeJobModalPopup={this.closeJobModal}
          jobName={job.name}
          jobId={job.id}
        />
      </Modal>
    );
  }

  renderDeleteJobModal() {
    const {deleteModal, job} = this.state;
    return (
      <Modal
        isOpen={deleteModal}
        toggle={this.toggleDeleteModal}
        className="status-modal"
        backdrop="static"
      >
        <JobDeletePopup
          toggle={this.toggleDeleteModal}
          deleteJobModalPopup={this.deleteJobModal}
          jobName={job.name}
          jobId={job.id}
        />
      </Modal>
    );
  }

  renderNewJobModal() {
    // this is for editing a job
    const {
      job,
      modalAddJob
    } = this.state;
    return (
      <Modal
        isOpen={modalAddJob}
        toggle={this.toggleNewJobModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobCreatePopup
          toggle={this.toggleNewJobModal}
          jobId={job.id}
          updateJobView={this.updateJobView}
        />
      </Modal>
    );
  }

  renderEditExistingJobModal() {
    const {
      job,
      modalEditJob
    } = this.state;
    return (
      <Modal
        isOpen={modalEditJob}
        toggle={this.toggleEditExistingJobModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobWizard
          toggle={this.toggleEditExistingJobModal}
          updateJobView={this.updateJobView}
          jobEdit
          job={job}
        />
      </Modal>
    );
  }

  renderEditSavedJobModal() {
    const {
      job,
      modalEditSavedJob
    } = this.state;
    return (
      <Modal
        isOpen={modalEditSavedJob}
        toggle={this.toggleEditSavedJobModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobWizard
          toggle={this.toggleEditSavedJobModal}
          updateJobView={this.updateJobView}
          jobEditSaved
          job={job}
        />
      </Modal>
    );
  }

  renderCopyJobModal() {
    const {
      job,
      modalCopyJob
    } = this.state;
    return (
      <Modal
        isOpen={modalCopyJob}
        toggle={this.toggleCopyJobModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobWizard
          toggle={this.toggleCopyJobModal}
          updateCopiedJob={this.updateCopiedJob}
          copyJob
          job={job}
        />
      </Modal>
    );
  }

  renderCancelRequestConfirmation() {
    const {
      modalCancelRequest,
      btnSubmitting
    } = this.state;

    if (modalCancelRequest) {
      return (
        <Modal
          isOpen={modalCancelRequest}
          toggle={this.toggleCancelRequest}
          className="modal-dialog--primary modal-dialog--header"
          backdrop="static"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleCancelRequest}
            />
            <div className="bold-text modal__title">Request Cancellation</div>
          </div>
          <div className="modal__body" style={{padding: '10px 25px 0px 25px'}}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        <p>Are you sure you want to cancel your request for this job?</p>
                      </Row>
                      <hr/>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-4 wizard__toolbar">
                          <Button color="minimal" className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={this.toggleCancelRequest}
                          >
                            Cancel
                          </Button>
                        </ButtonToolbar>
                        <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                          <Link to="/marketplace">
                            <TSubmitButton
                              onClick={() => this.handleConfirmRequestCarrier('Cancel Request')}
                              className="primaryButton"
                              loading={btnSubmitting}
                              loaderSize={10}
                              bntText="Cancel Request"
                            />
                          </Link>
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

  renderLiabilityConfirmation() {
    const {
      modalLiability,
      btnSubmitting,
      job,
      company
    } = this.state;

    const companyProducer = job.company;
    const companyCarrier = company;

    if (modalLiability) {
      return (
        <Modal
          isOpen={modalLiability}
          toggle={this.toggleLiabilityModal}
          className="modal-dialog--primary modal-dialog--header"
          backdrop="static"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleLiabilityModal}
            />
            <div className="bold-text modal__title">Liability Insurance</div>
          </div>
          <div className="modal__body" style={{padding: '10px 25px 0px 25px'}}>
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

                        <p>Are you sure you want to accept this job?</p>
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
                            onClick={() => this.handleConfirmRequestCarrier('Accept')}
                            className="primaryButton"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Accept Job"
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

  renderCancelCarrierModal() {
    const {
      modalCarrierCancel,
      btnSubmitting,
      job,
      reqHandlerCancelReason,
      reqHandlerCancel,
      cancelReason,
      approveCancelReason,
      showOtherReasonInput,
      showLateCancelNotice,
      carrierCancelReasons
    } = this.state;

    if (modalCarrierCancel) {
      return (
        <Modal
          isOpen={modalCarrierCancel}
          toggle={this.toggleCarrierCancelModal}
          className="modal-dialog--primary modal-dialog--header"
          backdrop="static"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleCarrierCancelModal}
            />
            <div className="bold-text modal__title">Cancel Job</div>
          </div>
          <div className="modal__body" style={{padding: '10px 25px 0px 25px'}}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        Are you sure you want to cancel this job&nbsp;
                        <span style={{fontWeight: 'bold'}}>{job.name}</span>?
                      </Row>
                      <Row className="col-md-12" style={{display: showLateCancelNotice ? null : 'none', color: 'red'}}>
                        You are canceling this job after 3pm the previous day of a job.
                        If you cancel short notice too many times on a posting that is posted
                        before 3pm the day before a job, you may face suspension from
                        the platform and a Trelar CSR will be in contact with you.
                      </Row>
                      <Row className="col-md-12" style={{paddingTop: 15, paddingBottom: 15}}>
                        <span className="form__form-group-label">
                          Reason for cancelling&nbsp;
                          <span className="form-small-label">This will be shared with the producer {job.company.legalName} who posted this job.</span>
                        </span>
                        <TSelect
                          input={
                            {
                              onChange: this.handleSelectCancelReason,
                              name: 'cancelReason',
                              value: cancelReason
                            }
                          }
                          meta={reqHandlerCancel}
                          value={cancelReason}
                          options={carrierCancelReasons}
                          placeholder="Please select your reason for cancelling this job"
                        />
                      </Row>
                      <Row className="col-md-12 form__form-group" style={{paddingBottom: 15, display: showOtherReasonInput ? 'flex' : 'none'}} display="none">
                        <span className="form__form-group-label">
                          Please type in the reason of your cancellation
                        </span>
                        <TField
                          input={
                            {
                              onChange: this.handleCancelReasonInputChange,
                              name: 'approveCancelReason',
                              value: approveCancelReason
                            }
                          }
                          type="text"
                          meta={reqHandlerCancelReason}
                        />
                      </Row>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-12 wizard__toolbar right-buttons">
                          <TSubmitButton
                            onClick={this.toggleCarrierCancelModal}
                            className="secondaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="No"
                          />
                          <TSubmitButton
                            onClick={() => this.handleCarrierCancelJob()}
                            className="primaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Yes"
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

  renderCancelModal1() {
    const {
      modalCancel1,
      btnSubmitting,
      job,
      approveCancel,
      reqHandlerCancel
    } = this.state;

    if (modalCancel1) {
      return (
        <Modal
          isOpen={modalCancel1}
          toggle={this.toggleCancelModal1}
          className="modal-dialog--primary modal-dialog--header"
          backdrop="static"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleCancelModal1}
            />
            <div className="bold-text modal__title">Cancel Job (step 1 of 2)</div>
          </div>
          <div className="modal__body" style={{padding: '10px 25px 0px 25px'}}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        Are you sure you want to cancel this job&nbsp;
                        <span style={{fontWeight: 'bold'}}>{job.name}</span>?
                      </Row>
                      <hr/>
                      <Row className="col-md-12" style={{paddingBottom: 50}}>
                        <Row className="col-md-12">
                          To cancel this job,
                          you must type CANCEL in this box:
                          <Row className="col-md-12" style={{paddingTop: 15}}>
                            <div className="form__form-group-field">
                              <TField
                                input={
                                  {
                                    onChange: this.handleCancelInputChange,
                                    name: 'approveCancel',
                                    value: approveCancel
                                  }
                                }
                                type="text"
                                meta={reqHandlerCancel}
                              />
                            </div>
                          </Row>
                        </Row>
                      </Row>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-12 wizard__toolbar right-buttons">
                          <TSubmitButton
                            onClick={this.toggleCancelModal1}
                            className="secondaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="No"
                          />
                          <TSubmitButton
                            onClick={() => this.goToSecondCancelJobModal()}
                            className="primaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Yes"
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

  renderCancelModal2() {
    const {
      modalCancel2,
      btnSubmitting,
      job,
      approveCancelReason,
      reqHandlerCancelReason
    } = this.state;

    if (modalCancel2) {
      return (
        <Modal
          isOpen={modalCancel2}
          toggle={this.toggleCancelModal2}
          className="modal-dialog--primary modal-dialog--header"
          backdrop="static"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleCancelModal2}
            />
            <div className="bold-text modal__title">Cancel Job (step 2 of 2)</div>
          </div>
          <div className="modal__body" style={{padding: '10px 25px 0px 25px'}}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12" style={{paddingBottom: 50}}>
                        <Row className="col-md-12">
                          To avoid a fee and finalize the cancellation of {job.name},
                          include a reason for cancelling this job. This reason will be shared
                          with the booked carrier:
                          <Row className="col-md-12" style={{paddingTop: 15}}>
                            <div className="form__form-group-field">
                              <TField
                                input={
                                  {
                                    onChange: this.handleCancelReasonInputChange,
                                    name: 'approveCancelReason',
                                    value: approveCancelReason
                                  }
                                }
                                type="text"
                                meta={reqHandlerCancelReason}
                              />
                            </div>
                          </Row>
                        </Row>
                      </Row>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-12 wizard__toolbar right-buttons">
                          <TSubmitButton
                            onClick={this.toggleCancelModal2}
                            className="secondaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Keep Job"
                          />
                          <TSubmitButton
                            onClick={() => this.handleCancelJob()}
                            className="primaryButton float-right"
                            loading={btnSubmitting}
                            loaderSize={10}
                            bntText="Cancel Job"
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

  renderJobAllocate() {
    const { job, profile, booking } = { ...this.state };
    if ((job.status === 'Booked' || job.status === 'Allocated' || job.status === 'In Progress')
      && profile.companyType === 'Carrier' && profile.isAdmin) {
      return (
        <JobAllocate booking={booking} profile={profile} job={job} />
      );
    }
  }

  render() {
    const {
      job,
      bid,
      companyType,
      favoriteCompany,
      loaded,
      btnSubmitting,
      profile,
      accessForbidden
    } = this.state;
    // console.log('>>>CO:', companyType);
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
            {this.renderGoTo()}
            {this.renderNewJobModal()}
            {this.renderCopyJobModal()}
            {this.renderEditExistingJobModal()}
            {this.renderEditSavedJobModal()}
            {/*{this.renderAllocateDriversModal(profile)}*/}
            {this.renderCancelRequestConfirmation()}
            {this.renderLiabilityConfirmation()}
            {this.renderCancelCarrierModal()}
            {this.renderCancelModal1()}
            {this.renderCancelModal2()}
            {this.renderCloseJobModal()}
            {this.renderDeleteJobModal()}
            {this.renderResumeJobModal()}
            {this.renderPauseJobModal()}
            <div className="row">
              <div className="col-md-6">
                {this.renderActionButtons(job, companyType, favoriteCompany, btnSubmitting, bid)}
              </div>
              <div className="col-md-6 text-right">
                {companyType === 'Customer' && profile.isAdmin && (
                  <React.Fragment>
                    {this.renderCopyButton()}
                    {this.renderCloseButton()}
                    {this.renderDeleteButton()}
                    {this.renderResumeButton()}
                    {this.renderPauseButton()}
                  </React.Fragment>
                )}
                {this.renderCancelButton()}
              </div>
            </div>
            { this.renderJobAllocate() }
            {
              job.status && (
                job.status === 'In Progress'
                || job.status === 'Paused'
                || job.status === 'Job Completed'
                || job.status === 'Allocated'
                || job.status === 'Booked'
                || job.status === 'Job Ended'
                || job.status === 'Cancelled'
              ) ? (
                <React.Fragment>
                  {this.renderJobForm(companyType, job)}
                  {this.renderBidsTable()}
                </React.Fragment>
                ) : (
                  <React.Fragment>
                    {this.renderBidsTable()}
                    {this.renderJobForm(companyType, job)}
                  </React.Fragment>
                )
            }
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
