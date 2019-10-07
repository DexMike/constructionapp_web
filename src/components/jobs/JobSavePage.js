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
import CloneDeep from 'lodash.clonedeep';
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
import BookingEquipmentService from '../../api/BookingEquipmentService';
import EquipmentService from '../../api/EquipmentService';
import UserService from '../../api/UserService';
import LoadService from '../../api/LoadService';
import TwilioService from '../../api/TwilioService';
import GroupListService from '../../api/GroupListService';
import TSubmitButton from '../common/TSubmitButton';
import JobForm from './JobForm';
import TTable from '../common/TTable';
import BidsTable from './BidsTable';
import JobCreatePopup from './JobCreatePopup';
import EmailService from '../../api/EmailService';
import JobClosePopup from './JobClosePopup';
import JobDeletePopup from './JobDeletePopup';
import UserUtils from '../../api/UtilsService';
import JobWizard from "./JobWizard";

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
      allocateDriversModal: false,
      drivers: [],
      selectedDrivers: [],
      accessForbidden: false,
      modalAddJob: false,
      modalEditJob: false,
      modalLiability: false,
      modalCancelRequest: false,
      modalCancel1: false,
      modalCancel2: false,
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
      deleteModal: false
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleConfirmRequest = this.handleConfirmRequest.bind(this);
    this.handleConfirmRequestCarrier = this.handleConfirmRequestCarrier.bind(this);
    this.toggleAllocateDriversModal = this.toggleAllocateDriversModal.bind(this);
    this.handleAllocateDrivers = this.handleAllocateDrivers.bind(this);
    this.updateJobView = this.updateJobView.bind(this);
    this.updateCopiedJob = this.updateCopiedJob.bind(this);
    this.toggleNewJobModal = this.toggleNewJobModal.bind(this);
    this.toggleEditExistingJobModal = this.toggleEditExistingJobModal.bind(this);
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
    this.notifyAdminViaSms = this.notifyAdminViaSms.bind(this);
    this.handleSelectCancelReason = this.handleSelectCancelReason.bind(this);
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
    let driversWithLoads = [];
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
          let startAddress = null;
          if (job.startAddress) {
            job.startAddress = await AddressService.getAddressById(job.startAddress);
          }
          // end address
          let endAddress = null;
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

          // Check if a carrier is late when cancelling a job (after 3pm one day before job.startTime)
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
            const bookingEquipments = await BookingEquipmentService
              .getBookingEquipmentsByBookingId(booking.id);
            selectedDrivers = bookingEquipments
              .map(bookingEquipmentItem => bookingEquipmentItem.driverId);
            // bookingEquipment = bookingEquipments.find(
            //   bookingEq => bookingEq.bookingId === booking.id,
            //   booking
            // );
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

          // let drivers = await UserService.getDriversWithUserInfoByCompanyId(profile.companyId);
          // console.log(207, drivers);
          // drivers = drivers.map((driver) => {
          //   if (driver.userStatus !== 'Driver Created' && driver.userStatus !== 'Enabled') {
          //     const newDriver = driver;
          //     newDriver.checkboxDisabled = true;
          //     return newDriver;
          //   }
          //   return driver;
          // });
          const drivers = await UserService.getDriversWithUserInfoByCompanyId(profile.companyId);
          let enabledDrivers = [];
          Object.values(drivers).forEach((itm) => {
            const newDriver = {...itm};
            if (newDriver.driverStatus === 'Enabled' || newDriver.userStatus === 'Driver Enabled') {
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
            showLateCancelNotice
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
    const latestMaterial = materials[0];
    job.materials = latestMaterial.value;
    job.company = company;
    job.startAddress = startAddress;
    job.endAddress = endAddress;
    this.setState({job, companyCarrier});
  }

  async handleCancelJob() {
    const {
      job,
      companyCarrierData,
      approveCancelReason,
      reqHandlerCancelReason,
      profile
    } = this.state;
    let newJob = [];
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} - `;

    if (approveCancelReason === '') {
      this.setState({
        reqHandlerCancelReason: {
          ...reqHandlerCancelReason,
          touched: true,
          error: 'You must provide the reason for the cancellation of the job'
        }
      });
    } else {
      this.setState({btnSubmitting: true});

      // updating job
      newJob = CloneDeep(job);
      delete newJob.company;
      newJob.startAddress = newJob.startAddress.id;
      newJob.endAddress = newJob.endAddress.id;
      newJob.status = 'Cancelled';
      newJob.cancelReason = `[Cancelled by ${profile.companyType}] ${approveCancelReason}`;;
      newJob.dateCancelled = moment.utc().format();
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment.utc().format();
      newJob = await JobService.updateJob(newJob);

      const cancelledSms = `${envString}Your booked job ${newJob.name} for ${TFormat.asDateTime(newJob.startTime)} has been cancelled by ${job.company.legalName}.
      The reason for cancellation is: ${newJob.cancelReason}.`; // TODO: do we need to check for this field's length?

      // Notify Carrier about cancelled job
      try {
        await this.notifyAdminViaSms(cancelledSms, companyCarrierData.id);
      } catch (err) {
        console.error(err);
      }

      // get allocated drivers for this job, and send sms to those drivers
      const allocatedDrivers = await JobService.getAllocatedDriversInfoByJobId(job.id);
      let allocatedDriversNames = '';
      if (allocatedDrivers.length > 0) {
        allocatedDriversNames = allocatedDrivers.map(driver => `${driver.firstName} ${driver.lastName}`);
        allocatedDriversNames = `Drivers affected: ${allocatedDriversNames.join(', ')}`;

        const cancelledDriversSms = [];
        for (const driver of allocatedDrivers) {
          if (this.checkPhoneFormat(driver.mobilePhone)) {
            const notification = {
              to: UserUtils.phoneToNumberFormat(driver.mobilePhone),
              body: cancelledSms
            };
            cancelledDriversSms.push(TwilioService.createSms(notification));
          }
        }
        await Promise.all(cancelledDriversSms);
      }

      // sending an email to CSR
      const cancelJobEmail = {
        toEmail: 'csr@trelar.com',
        toName: 'Trelar CSR',
        subject: `${envString}Trelar Job Cancelled`,
        isHTML: true,
        body: 'A producer cancelled a job on Trelar.<br><br>'
          + `Producer Company Name: ${job.company.legalName}<br>`
          + `Cancel Reason: ${newJob.cancelReason}<br>`
          + `Job Name: ${newJob.name}<br>`
          // TODO: since this is going to Trelar CSR where do we set the timezone for HQ?
          + `Start Date of Job: ${TFormat.asDateTime(newJob.startTime)}<br>`
          + `Time of Job Cancellation: ${TFormat.asDateTime(newJob.dateCancelled)}<br>`
          + `Carrier(s) Affected: ${companyCarrierData.legalName}<br>`
          + `${allocatedDriversNames}`,
        recipients: [
          {name: 'CSR', email: 'csr@trelar.com'}
        ],
        attachments: []
      };
      await EmailService.sendEmail(cancelJobEmail);

      this.updateJobView(newJob);
      this.setState({btnSubmitting: false});
      this.toggleCancelModal2();
    }
  }

  async handleCarrierCancelJob() {
    const {
      job,
      customerAdmin,
      showOtherReasonInput,
      approveCancelReason,
      reqHandlerCancel,
      reqHandlerCancelReason,
      companyCarrierData,
      profile
    } = this.state;
    let {cancelReason} = this.state;
    let newJob = [];
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} - `;

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

    this.setState({btnSubmitting: true});

    // updating job
    newJob = CloneDeep(job);
    delete newJob.company;
    newJob.startAddress = newJob.startAddress.id;
    newJob.endAddress = newJob.endAddress.id;
    newJob.status = 'Cancelled';
    newJob.cancelReason = `[Cancelled by ${profile.companyType}] ${cancelReason}`;
    newJob.dateCancelled = moment.utc().format();
    newJob.modifiedBy = profile.userId;
    newJob.modifiedOn = moment.utc().format();
    try {
      newJob = await JobService.updateJob(newJob);
    } catch (err) {
      console.error(err);
    }

    const cancelledSms = `${envString}The carrier ${companyCarrierData.legalName} has cancelled working on job `
      + `${job.company.legalName} for ${TFormat.asDateTime(newJob.startTime)}.`
      + `The reason for cancellation is: ${cancelReason}.`; // TODO: do we need to check for this field's length?

    // Notify Producer about cancelled job
    await this.notifyAdminViaSms(cancelledSms, job.company.id);

    // sending an email to CSR
    const cancelJobEmail = {
      toEmail: 'csr@trelar.com',
      toName: 'Trelar CSR',
      subject: `${envString}Trelar Job Cancelled`,
      isHTML: true,
      body: 'A carrier cancelled a job on Trelar.<br><br>'
        + `Carrier Company Name: ${companyCarrierData.legalName}<br>`
        + `Producer Company Name: ${job.company.legalName}<br>`
        + `Cancel Reason: ${cancelReason}<br>`
        + `Job Name: ${newJob.name}<br>`
        // TODO: since this is going to Trelar CSR where do we set the timezone for HQ?
        + `Start Date of Job: ${TFormat.asDateTime(newJob.startTime)}<br>`
        + `Time of Job Cancellation: ${TFormat.asDateTime(newJob.dateCancelled)}`,
      recipients: [
        {name: 'CSR', email: 'csr@trelar.com'}
      ],
      attachments: []
    };
    try {
      await EmailService.sendEmail(cancelJobEmail);
    } catch (err) {
      console.error(err);
    }    

    // sending an email to Producer
    const cancelJobEmailProducer = {
      toEmail: customerAdmin.email,
      toName: `${customerAdmin.firstName} ${customerAdmin.lastName}`,
      subject: `${envString}Trelar Job Cancelled`,
      isHTML: true,
      body: `The carrier ${companyCarrierData.legalName} has cancelled working `
      + `on job ${newJob.name} for ${TFormat.asDateTime(newJob.startTime)}. `
      + 'Log onto Trelar to find a different carrier for this job: https://app.mytrelar.com.<br><br>'
      + `The reason for cancellation is: ${cancelReason}.<br><br>`
      + 'If you need any assistance, please contact <a href="mailto:csr@trelar.com">csr@trelar.com</a>.<br><br>'
      + 'Thanks,<br>The Trelar Team',
      recipients: [
        {name: `${customerAdmin.firstName} ${customerAdmin.lastName}`, email: customerAdmin.email}
      ],
      attachments: []
    };
    try {
      await EmailService.sendEmail(cancelJobEmailProducer);
    } catch (err) {
      console.error(err);
    }    

    this.updateJobView(newJob);
    this.setState({btnSubmitting: false});
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

  async toggleAllocateDriversModal() {
    const {allocateDriversModal, booking, profile, driversWithLoads} = this.state;
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
      if (newDriver.driverStatus === 'Enabled' || newDriver.userStatus === 'Driver Enabled') {
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

  async handleConfirmRequest(action) { // Customer 'Accepts' or 'Rejects' Job request
    this.setState({btnSubmitting: true});
    const {
      job,
      bid,
      profile
    } = this.state;
    let {booking, bookingEquipment} = this.state;

    if (action === 'Approve') { // Customer is accepting the job request
      // console.log('accepting');
      const newJob = CloneDeep(job);
      const newBid = CloneDeep(bid);

      // UPDATING JOB
      newJob.status = 'Booked';
      newJob.startAddress = newJob.startAddress.id;
      newJob.endAddress = newJob.endAddress.id;
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment.utc().format();
      delete newJob.materials;
      await JobService.updateJob(newJob);

      // UPDATING BID
      newBid.hasCustomerAccepted = 1;
      newBid.hasSchedulerAccepted = 1;
      newBid.status = 'Accepted';
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment.utc().format();
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
        booking.createdOn = moment.utc().format();
        booking.modifiedOn = moment.utc().format();
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
          bookingEquipment.modifiedOn = moment.utc().format();
          bookingEquipment.createdOn = moment.utc().format();
          bookingEquipment = await BookingEquipmentService.createBookingEquipment(
            bookingEquipment
          );
        }
      }

      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // Sending SMS to Truck's company
      try {
        await this.notifyAdminViaSms('Your request for the job has been rejected', newBid.companyCarrierId);
      } catch (error) {
        // console.log('Unable to notify user.');
      }

      job.status = 'Booked';
      this.setState({job, companyCarrier: newBid.companyCarrierId});
    } else { // Customer is rejecting the job request
      const newBid = CloneDeep(bid);

      // UPDATING BID
      newBid.hasCustomerAccepted = 0;
      newBid.hasSchedulerAccepted = 1;
      newBid.status = 'Declined';
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment.utc().format();
      await BidService.updateBid(newBid);

      // Let's make a call to Twilio to send an SMS
      // We need to change later get the body from the lookups table
      // Sending SMS to Truck's company
      try {
        await this.notifyAdminViaSms('Your request for the job has been rejected', job.id);
      } catch (error) {
        // console.log('Unable to notify user.');
      }

      // eslint-disable-next-line no-alert
      // alert('You have accepted this job request! Congratulations.');
    }
  }

  async notifyAdminViaSms(message, companyId) {
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} - `;
    // Sending SMS to customer's Admin from the company who created the Job
    const customerAdmin = await UserService.getAdminByCompanyId(companyId);
    let notification = '';
    if (customerAdmin.length > 0) { // check if we get a result
      if (customerAdmin[0].mobilePhone && this.checkPhoneFormat(customerAdmin[0].mobilePhone)) {
        notification = {
          to: UserUtils.phoneToNumberFormat(customerAdmin[0].mobilePhone),
          body: `${envString} ${message}`
        };
        await TwilioService.createSms(notification);
      }
    }
  }

  // Carrier clicks on 'Accept Job' or 'Request Job'
  async handleConfirmRequestCarrier(action) {
    this.setState({btnSubmitting: true});

    const {
      job,
      customerAdmin,
      profile
    } = this.state;
    let {bid} = this.state;
    let {booking} = this.state;
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
      newJob.modifiedOn = moment.utc().format();
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
      newBid.modifiedOn = moment.utc().format();
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
        booking.createdOn = moment.utc().format();
        booking.modifiedOn = moment.utc().format();
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
            to: UserUtils.phoneToNumberFormat(carrierAdmin[0].mobilePhone),
            body: 'Your request for the job has been accepted.'
          };
          await TwilioService.createSms(notification);
        }
      }

      // eslint-disable-next-line no-alert
      // alert('You have accepted this job request! Congratulations.');

      job.status = 'Booked';
      this.setState({job, booking});
    } else if (action === 'Request') { // A non-favorite Carrier "requests" the job
      // console.log('requesting');
      const newJob = CloneDeep(job);
      // Updating the Job
      // newJob.status = 'Requested';
      newJob.startAddress = newJob.startAddress.id;
      newJob.endAddress = newJob.endAddress.id;
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment.utc().format();
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
      bid.modifiedOn = moment.utc().format();
      bid.createdOn = moment.utc().format();
      await BidService.createBid(bid);

      // Sending SMS to customer's Admin from the company who created the Job
      if (customerAdmin && customerAdmin.length > 0) { // check if we get a result
        if (customerAdmin[0].mobilePhone && this.checkPhoneFormat(customerAdmin[0].mobilePhone)) {
          notification = {
            to: UserUtils.phoneToNumberFormat(customerAdmin[0].mobilePhone),
            body: 'You have a new job request.'
          };
          await TwilioService.createSms(notification);
        }
      }

      // eslint-disable-next-line no-alert
      // alert('Your request has been sent.');
      job.status = newJob.status;
      this.setState({job, bid});
    } else if (action === 'Decline') { // A Carrier "declines" a job request
      // Update existing bid
      const newBid = CloneDeep(bid);
      newBid.companyCarrierId = profile.companyId;
      newBid.hasCustomerAccepted = 1;
      newBid.hasSchedulerAccepted = 0;
      newBid.status = 'Declined';
      newBid.modifiedBy = profile.userId;
      newBid.modifiedOn = moment.utc().format();
      bid = {};
      bid = await BidService.updateBid(newBid);

      // Sending SMS to customer's Admin from the company who created the Job
      if (customerAdmin && customerAdmin.length > 0) { // check if we get a result
        if (customerAdmin[0].mobilePhone && this.checkPhoneFormat(customerAdmin[0].mobilePhone)) {
          notification = {
            to: UserUtils.phoneToNumberFormat(customerAdmin[0].mobilePhone),
            body: 'Your job request has been declined.'
          };
          await TwilioService.createSms(notification);
        }
      }
      this.setState({bid});

      // eslint-disable-next-line no-alert
      // alert('Your request has been sent.');
    } else if (action === 'Cancel Request') {
      try {
        await BidService.deleteBidbById(bid.id);
        this.setState({bid: null});
        // return <Redirect push to="/marketplace"/>;
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

  async handleAllocateDrivers() {
    try {
      // console.log('saving...');
      const {selectedDrivers, booking, job, profile} = this.state;
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
    const {profile, company, bids} = this.state;
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
            && ((companyCarrier.liabilityGeneral < companyProducer.liabilityGeneral) || (companyCarrier.liabilityAuto < companyProducer.liabilityAuto))
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
              || ((companyCarrier.liabilityGeneral > companyProducer.liabilityGeneral) && (companyCarrier.liabilityAuto > companyProducer.liabilityAuto)))
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
      // the carrier is not a favorite (We're not showing this button here, only through the Marketplace)
      /* if (bid === null || (bid && (bid.status !== 'Pending' && bid.status !== 'Declined'))) {
        return (
          <TSubmitButton
            onClick={() => this.handleConfirmRequestCarrier('Request')}
            className="primaryButton"
            loading={btnSubmitting}
            loaderSize={10}
            bntText="Request Job"
          />
        );
      } */

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
    if ((job.status === 'Booked' || job.status === 'Allocated' || job.status === 'In Progress')
      && companyType === 'Carrier' && profile.isAdmin) {
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
          onClick={() => this.toggleNewJobModal()}
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
    const {job, profile, btnSubmitting} = this.state;
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

  renderCloseButton() {
    const {job} = this.state;
    if (job.status === 'In Progress') {
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

  renderCloseJobModal() {
    const {closeModal, job} = this.state;
    return (
      <Modal
        isOpen={closeModal}
        toggle={this.toggleCloseModal}
        className="status-modal"
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
    const {
      job,
      modalAddJob
    } = this.state;
    return (
      <Modal
        isOpen={modalAddJob}
        toggle={this.toggleNewJobModal}
        className="modal-dialog--primary modal-dialog--header"
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

  renderCopyJobModal() {
    const {
      job,
      modalCopyJob
    } = this.state;
    const copyJob = true;
    return (
      <Modal
        isOpen={modalCopyJob}
        toggle={this.toggleCopyJobModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <JobCreatePopup
          toggle={this.toggleCopyJobModal}
          jobId={job.id}
          copyJob={copyJob}
          updateCopiedJob={this.updateCopiedJob}
        />
      </Modal>
    );
  }

  renderAllocateDriversModal() {
    const {allocateDriversModal, drivers, selectedDrivers, btnSubmitting, driversWithLoads} = this.state;
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
                      handleRowsChange={() => {
                      }}
                      data={driverData}
                      columns={driverColumns}
                      handlePageChange={() => {
                      }}
                      handleIdClick={() => {
                      }}
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
      showLateCancelNotice
    } = this.state;

    if (modalCarrierCancel) {
      return (
        <Modal
          isOpen={modalCarrierCancel}
          toggle={this.toggleCarrierCancelModal}
          className="modal-dialog--primary modal-dialog--header"
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
                          options={
                            [
                              { value: 'Mechanical Issues', label: 'Mechanical Issues' },
                              { value: 'Scheduling Conflict', label: 'Scheduling Conflict' },
                              { value: 'Found a Higher Paying Load', label: 'Found a Higher Paying Load' },
                              { value: 'Other', label: 'Other' }
                            ]
                          }
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
                        Are you sure you want to cancel this job&nbsp;<span
                        style={{fontWeight: 'bold'}}>{job.name}</span>?
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
            {this.renderAllocateDriversModal(profile)}
            {this.renderCancelRequestConfirmation()}
            {this.renderLiabilityConfirmation()}
            {this.renderCancelCarrierModal()}
            {this.renderCancelModal1()}
            {this.renderCancelModal2()}
            {this.renderCloseJobModal()}
            {this.renderDeleteJobModal()}
            <div className="row">
              <div className="col-md-6">
                {this.renderActionButtons(job, companyType, favoriteCompany, btnSubmitting, bid)}
              </div>
              <div className="col-md-6 text-right">
                {companyType !== 'Carrier' && this.renderCopyButton()}
                {companyType === 'Customer' && this.renderCloseButton()}
                {companyType === 'Customer' && this.renderDeleteButton()}
                {this.renderCancelButton()}
              </div>
            </div>
            {
              job.status && (
                job.status === 'In Progress'
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
