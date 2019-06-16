import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  Col,
  Row
} from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import NumberFormat from 'react-number-format';
import JobService from '../../api/JobService';
import truckImage from '../../img/default_truck.png';
import AddressService from '../../api/AddressService';
import LookupsService from '../../api/LookupsService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import BookingEquipmentService from '../../api/BookingEquipmentService';
import ProfileService from '../../api/ProfileService';
import TDateTimePicker from '../common/TDateTimePicker';
import TField from '../common/TField';
import TFieldNumber from '../common/TFieldNumber';
import TwilioService from '../../api/TwilioService';
import SelectField from '../common/TSelect';
import JobMaterialsService from '../../api/JobMaterialsService';
import './jobs.css';
import UserService from '../../api/UserService';
import TSubmitButton from '../common/TSubmitButton';
import TSpinner from '../common/TSpinner';

class JobCreateFormCarrier extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();
    // Note: not needed for creating a job
    delete job.endTime;
    // job.
    this.state = {
      loaded: false,
      btnSubmitting: false,
      job,
      states: [],
      startAddress: AddressService.getDefaultAddress(),
      endAddress: AddressService.getDefaultAddress(),
      bid: BidService.getDefaultBid(),
      booking: BookingService.getDefaultBooking(),
      bookingEquipment: BookingEquipmentService.getDefaultBookingEquipment(),
      material: '',
      availableMaterials: [],

      // jobOptions
      jobName: '',
      // jobStartDate
      jobStartDateTime: new Date(),
      jobTruckType: '',
      jobTrucksNeeded: '',
      // PUT back hour/ton
      selectedRatedHourOrTon: 'ton',
      rateByTonValue: 0,
      rateByHourValue: 0,
      estimatedTons: 0,
      estimatedHours: 0,
      rateEstimate: 0,

      // addresses
      allAddresses: [],
      selectedStartAddressId: 0,
      selectedEndAddressId: 0,

      // address 1
      startLocationAddress1: '',
      startLocationAddress2: '',
      startLocationCity: '',
      startLocationState: '',
      startLocationZip: '',

      // address 1
      endLocationAddress1: '',
      endLocationAddress2: '',
      endLocationCity: '',
      endLocationState: '',
      endLocationZip: ''
    };
    this.handleJobInputChange = this.handleJobInputChange.bind(this);
    this.handleStartAddressInputChange = this.handleStartAddressInputChange.bind(this);
    this.handleStartStateChange = this.handleStartStateChange.bind(this);
    this.handleEndAddressInputChange = this.handleEndAddressInputChange.bind(this);
    this.handleEndStateChange = this.handleEndStateChange.bind(this);
    this.toggleJobRateType = this.toggleJobRateType.bind(this);
    this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
    this.createJob = this.createJob.bind(this);
    this.isFormValid = this.isFormValid.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleStartAddressIdChange = this.handleStartAddressIdChange.bind(this);
    this.handleEndAddressIdChange = this.handleEndAddressIdChange.bind(this);
    this.toggleNewStartAddress = this.toggleNewStartAddress.bind(this);
    this.toggleNewEndAddress = this.toggleNewEndAddress.bind(this);
    this.handleMaterialsChange = this.handleMaterialsChange.bind(this);
    this.handleInputChangeTonHour = this.handleInputChangeTonHour.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleTruckTypeChange = this.handleTruckTypeChange.bind(this);
    this.handleRateChange = this.handleRateChange.bind(this);
    this.handleHourDetails = this.handleHourDetails.bind(this);
  }

  async componentDidMount() {
    // we don't have preloaded info, let's hit the server
    let allMaterials = await LookupsService.getLookupsByType('MaterialType');
    const truckTypes = await LookupsService.getLookupsByType('EquipmentType');
    const allTruckTypes = [];

    allMaterials = allMaterials.map(material => ({
      value: material.val1,
      label: material.val1
    }));
    Object.values(truckTypes)
      .forEach((itm) => {
        const inside = {
          label: itm.val1,
          value: itm.val1
        };
        allTruckTypes.push(inside);
      });
    this.setState({
      allMaterials,
      allTruckTypes
    });

    // should load all addresses even if already set
    const response = await AddressService.getAddresses();
    const allAddresses = response.data.map(address => ({
      value: String(address.id),
      label: `${address.name} - ${address.address1} ${address.city} ${address.zipCode}`
    }));
    this.setState({
      allAddresses
    });

    this.setState({ loaded: true });
  }

  // save begins ///////////////////////////////////////////////////////
  async saveJob() {
    this.setState({ btnSubmitting: true });

    if (!this.isFormValid()) {
      this.setState({ btnSubmitting: false });
      return;
    }

    // consts
    const {
      startLocationAddress1,
      startLocationAddress2,
      startLocationCity,
      startLocationState,
      startLocationZip,

      // address 1
      endLocationAddress1,
      endLocationAddress2,
      endLocationCity,
      endLocationState,
      endLocationZip,

      selectedStartAddressId,
      selectedEndAddressId
    } = this.state;

    //AQUI ME QUEDO, HAY QUE GUARDAR EL TRABAJO

    // start location
    let startAddress = {
      id: null
    };
    if (selectedStartAddressId === 0) {
      const address1 = {
        type: 'Delivery',
        name: 'Delivery Start Location',
        companyId: profile.companyId,
        address1: d.startLocationAddress1,
        address2: d.startLocationAddress2,
        city: d.startLocationCity,
        state: d.startLocationState,
        zipCode: d.startLocationZip,
        createdBy: profile.userId,
        createdOn: moment()
          .unix() * 1000,
        modifiedBy: profile.userId,
        modifiedOn: moment()
          .unix() * 1000
      };
      startAddress = await AddressService.createAddress(address1);
    } else {
      startAddress.id = d.selectedStartAddressId;
    }

    // end location
    let endAddress = {
      id: null
    };
    if (d.selectedEndAddressId === 0) {
      const address2 = {
        type: 'Delivery',
        name: 'Delivery End Location',
        companyId: profile.companyId,
        address1: d.endLocationAddress1,
        address2: d.endLocationAddress2,
        city: d.endLocationCity,
        state: d.endLocationState,
        zipCode: d.endLocationZip
      };
      endAddress = await AddressService.createAddress(address2);
    } else {
      endAddress.id = d.selectedEndAddressId;
    }

    // job p
    let isFavorited = 0;
    if (showSendtoFavorites) {
      isFavorited = 1;
    }

    let rateType = '';
    let rate = 0;
    if (d.selectedRatedHourOrTon === 'ton') {
      rateType = 'Ton';
      rate = Number(d.rateByTonValue);
    } else {
      rateType = 'Hour';
      rate = Number(d.rateByHourValue);
    }

    // if both checks (Send to Mkt and Send to All Favorites) are selected
    if (
      (sendToMkt === true || sendToMkt === 1)
      && (sendToFavorites === true || sendToFavorites === 1)
    ) {
      status = 'Published And Offered';
    } else if (sendToFavorites === true || sendToFavorites === 1) { // sending to All Favorites only
      status = 'On Offer';
    } else { // default
      status = 'Published';
    }

    const calcTotal = d.rateEstimate * rate;
    const rateTotal = Math.round(calcTotal * 100) / 100;

    const job = {
      companiesId: profile.companyId,
      name: d.name,
      status,
      isFavorited,
      startAddress: startAddress.id,
      endAddress: endAddress.id,
      startTime: new Date(d.jobDate),
      equipmentType: d.truckType.value,
      numEquipments: d.hourTrucksNumber,
      rateType,
      rate,
      rateEstimate: d.rateEstimate,
      rateTotal,
      notes: d.instructions,
      createdBy: profile.userId,
      createdOn: moment()
        .unix() * 1000,
      modifiedBy: profile.userId,
      modifiedOn: moment()
        .unix() * 1000
    };
    const newJob = await JobService.createJob(job);
    // return false;

    // add materials
    if (newJob) {
      if (d.selectedMaterials) { // check if there's materials to add
        this.saveJobMaterials(newJob.id, d.selectedMaterials.value);
      }
    }

    // create bids if this user has favorites:
    if (showSendtoFavorites && sendToFavorites && newJob) {
      const results = [];
      for (const companyId of favoriteCompanies) {
        // bid
        const bid = {
          jobId: newJob.id,
          userId: profile.userId,
          companyCarrierId: companyId,
          hasCustomerAccepted: 1,
          hasSchedulerAccepted: 0,
          status: 'New',
          rateType,
          rate: 0,
          rateEstimate: d.rateEstimate,
          notes: d.instructions,
          createdBy: profile.userId,
          createdOn: moment()
            .unix() * 1000,
          modifiedBy: profile.userId,
          modifiedOn: moment()
            .unix() * 1000
        };
        results.push(BidService.createBid(bid));
      }
      await Promise.all(results);

      // now let's send them an SMS to all favorites
      const allSms = [];
      for (const adminIdTel of favoriteAdminTels) {
        if (this.checkPhoneFormat(adminIdTel)) {
          // console.log('>>Sending SMS to Jake...');
          const notification = {
            to: this.phoneToNumberFormat(adminIdTel),
            body: '🚚 You have a new Trelar Job Offer available. Log into your Trelar account to review and accept. www.trelar.net'
          };
          allSms.push(TwilioService.createSms(notification));
        }
      }
      await Promise.all(allSms);
    }

    // if sending to mktplace, let's send SMS to everybody
    if (sendToMkt) {
      const allBiddersSms = [];
      for (const bidderTel of nonFavoriteAdminTels) {
        if (this.checkPhoneFormat(bidderTel)) {
          const notification = {
            to: this.phoneToNumberFormat(bidderTel),
            body: '👷 You have a new Trelar Job Offer available. Log into your Trelar account to review and apply. www.trelar.net'
          };
          allBiddersSms.push(TwilioService.createSms(notification));
        }
      }
    }

    const { onClose } = this.props;
    onClose();
  }
  // save ends /////////////////////////////////////////////////////////

  handleTruckTypeChange(data) {
    this.setState({jobTruckType: data});
  }

  handleMaterialsChange(data) {
    this.setState({selectedMaterials: data});
  }

  async fetchForeignValues() {
    const lookups = await LookupsService.getLookups();
    let states = [];
    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'States') states.push(itm);
      });
    states = states.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));
    this.setState({ states });
  }

  handleJobInputChange(e) {
    const { job } = this.state;
    let reqHandler = '';
    job[e.target.name] = e.target.value;

    if (e.target.name === 'name') {
      reqHandler = 'reqHandlerName';
    } else if (e.target.name === 'startTime') {
      reqHandler = 'reqHandlerDate';
    } else if (e.target.name === 'rateEstimate') {
      reqHandler = 'reqHandlerEstHours';
    }
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ job });
  }

  handleStartAddressInputChange(e) {
    const { startAddress } = this.state;
    let reqHandler = '';
    startAddress[e.target.name] = e.target.value;
    if (e.target.name === 'address1') {
      reqHandler = 'reqHandlerStartAddress';
    } else if (e.target.name === 'city') {
      reqHandler = 'reqHandlerSCity';
    } else if (e.target.name === 'state') {
      reqHandler = 'reqHandlerSState';
    } else if (e.target.name === 'zipCode') {
      reqHandler = 'reqHandlerSZip';
    }
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ startAddress });
  }

  handleStartStateChange(e) {
    const { startAddress } = this.state;
    const reqHandler = '';
    startAddress.state = e.value;

    this.setState({
      reqHandlerSState: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ startAddress });
  }

  handleEndAddressInputChange(e) {
    const { endAddress } = this.state;
    let reqHandler = '';
    endAddress[e.target.name] = e.target.value;

    if (e.target.name === 'address1') {
      reqHandler = 'reqHandlerEAddress';
    } else if (e.target.name === 'city') {
      reqHandler = 'reqHandlerECity';
    } else if (e.target.name === 'state') {
      reqHandler = 'reqHandlerEState';
    } else if (e.target.name === 'zipCode') {
      reqHandler = 'reqHandlerEZip';
    }
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ endAddress });
  }

  handleEndStateChange(e) {
    const { endAddress } = this.state;
    const reqHandler = '';
    endAddress.state = e.value;

    this.setState({
      reqHandlerEState: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ endAddress });
  }

  handleStartTimeChange(e) {
    const { job } = this.state;
    job.startTime = e;
    this.setState({ job });
  }

  handleMultiChange(data) {
    this.setState({
      material: data
    });
  }

  selectChange(data) {
    // const { reqHandlerTruckType } = this.state;
    /* this.setState({
      reqHandlerTruckType: Object.assign({}, reqHandlerTruckType, {
        touched: false
      })
    }); */
    this.setState({ material: data.value });
  }

  toggleJobRateType() {
    const { job } = this.state;
    if (job.rateType === 'Hour') {
      job.rateType = 'Ton';
    } else {
      job.rateType = 'Hour';
    }
    this.setState({ job });
  }

  isRateTypeTon(rateType) {
    return rateType !== 'Hour';
  }

  async saveJobMaterials(jobId, material) {
    const profile = await ProfileService.getProfile();
    if (profile && material) {
      const newMaterial = {
        jobsId: jobId,
        value: material,
        createdBy: profile.userId,
        createdOn: moment()
          .unix() * 1000,
        modifiedBy: profile.userId,
        modifiedOn: moment()
          .unix() * 1000
      };
      /* eslint-disable no-await-in-loop */
      await JobMaterialsService.createJobMaterials(newMaterial);
    }
  }

  async createJob() {
    this.setState({ btnSubmitting: true });

    const { closeModal, selectedEquipment } = this.props;
    const {
      startAddress,
      job,
      endAddress,
      bid,
      booking,
      bookingEquipment,
      material,
      selectedStartAddressId,
      selectedEndAddressId
    } = this.state;

    const newJob = CloneDeep(job);

    startAddress.name = `Job: ${newJob.name}`;
    endAddress.name = `Job: ${newJob.name}`;
    if (!this.isFormValid()) {
      // TODO display error message
      // console.error('didnt put all the required fields.');
      this.setState({ btnSubmitting: false });
      return;
    }
    startAddress.modifiedOn = moment()
      .unix() * 1000;
    startAddress.createdOn = moment()
      .unix() * 1000;

    // start address
    let newStartAddress;

    if (selectedStartAddressId === 0) {
      newStartAddress = await AddressService.createAddress(startAddress);
      newJob.startAddress = newStartAddress.id;
    } else {
      newJob.startAddress = selectedStartAddressId;
    }

    // newJob.startAddress = newStartAddress.id;
    newJob.status = 'On Offer';

    endAddress.modifiedOn = moment()
      .unix() * 1000;
    endAddress.createdOn = moment()
      .unix() * 1000;

    // end address
    let newEndAddress;
    if (selectedEndAddressId === 0) {
      newEndAddress = await AddressService.createAddress(endAddress);
      newJob.endAddress = newEndAddress.id;
    } else {
      newJob.endAddress = selectedEndAddressId;
    }

    newJob.rate = selectedEquipment.hourRate;
    newJob.modifiedOn = moment()
      .unix() * 1000;
    newJob.createdOn = moment()
      .unix() * 1000;
    newJob.equipmentType = selectedEquipment.type;
    // In this scenario we are not letting a customer create a job with
    // more than 1 truck so here we set the numEquipments to 1
    // in the new job creation method we need to set it to the actual
    // number they set in the field
    newJob.numEquipments = 1;
    const createdJob = await JobService.createJob(newJob);

    // add material to new job
    if (createdJob) {
      if (material) { // check if there's material to add
        this.saveJobMaterials(createdJob.id, material);
      }
    }

    bid.jobId = createdJob.id;
    // bid.startAddress = createdJob.startAddress;
    // bid.endAddress = createdJob.endAddress;
    bid.companyCarrierId = selectedEquipment.companyId;
    bid.rate = createdJob.rate;
    bid.rateEstimate = createdJob.rateEstimate;
    bid.hasCustomerAccepted = 1;
    bid.status = 'Pending';
    bid.modifiedOn = moment()
      .unix() * 1000;
    bid.createdOn = moment()
      .unix() * 1000;
    booking.modifiedOn = moment()
      .unix() * 1000;
    booking.createdOn = moment()
      .unix() * 1000;
    const createdBid = await BidService.createBid(bid);

    // Now we need to create a Booking
    booking.bidId = createdBid.id;
    booking.schedulersCompanyId = selectedEquipment.companyId;

    // if the startaddress is the actual ID
    if (Number.isInteger(createdJob.startAddress)) {
      booking.sourceAddressId = createdJob.startAddress;
      booking.startAddressId = createdJob.startAddress;
    } else {
      booking.sourceAddressId = createdJob.startAddress.id;
      booking.startAddressId = createdJob.startAddress.id;
    }

    if (Number.isInteger(createdJob.endAddress)) {
      booking.endAddressId = createdJob.endAddress;
    } else {
      booking.endAddressId = createdJob.endAddress.id;
    }

    const createdBooking = await BookingService.createBooking(booking);

    // now we need to create a BookingEquipment record
    // Since in this scenario we are only allowing 1 truck for one booking
    // we are going to create one BookingEquipment.  NOTE: the idea going forward is
    // to allow multiple trucks per booking
    bookingEquipment.bookingId = createdBooking.id;

    // const carrierCompany = await CompanyService.getCompanyById(createdBid.companyCarrierId);

    // this needs to be createdBid.carrierCompanyId.adminId
    bookingEquipment.schedulerId = createdBid.userId;
    bookingEquipment.driverId = selectedEquipment.driversId;
    bookingEquipment.equipmentId = selectedEquipment.id;
    bookingEquipment.rateType = createdBid.rateType;
    // At this point we do not know what rateActual is, this will get set upon completion
    // of the job
    bookingEquipment.rateActual = 0;
    // Lets copy the bid info
    bookingEquipment.startTime = createdBooking.startTime;
    bookingEquipment.endTime = createdBooking.endTime;
    bookingEquipment.startAddressId = createdBooking.startAddressId;
    bookingEquipment.endAddressId = createdBooking.endAddressId;

    // Since this is booking method 1, we do not have any notes as this is getting created
    // automatically and not by a user
    bookingEquipment.notes = '';

    // this needs to be createdBid.carrierCompanyId.adminId
    bookingEquipment.createdBy = selectedEquipment.driversId;
    bookingEquipment.modifiedBy = selectedEquipment.driversId;
    bookingEquipment.modifiedOn = moment()
      .unix() * 1000;
    bookingEquipment.createdOn = moment()
      .unix() * 1000;
    await BookingEquipmentService.createBookingEquipments(bookingEquipment);

    // Let's make a call to Twilio to send an SMS
    // We need to get the phone number from the carrier co
    // Sending SMS to Truck's company's admin
    const carrierAdmin = await UserService.getAdminByCompanyId(createdBid.companyCarrierId);
    if (carrierAdmin.length > 0) { // check if we get a result
      if (carrierAdmin[0].mobilePhone && this.checkPhoneFormat(carrierAdmin[0].mobilePhone)) {
        const notification = {
          to: this.phoneToNumberFormat(carrierAdmin[0].mobilePhone),
          body: 'You have a new job offer, please log in to https://www.mytrelar.com'
        };
        await TwilioService.createSms(notification);
      }
    }
    closeModal();
  }

  handleHourDetails(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  // remove non numeric
  phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  handleRateChange(e) {
    this.setState({ selectedRatedHourOrTon: e.value });
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

  handleStartAddressIdChange(data) {
    this.setState({
      // startAddress: [],
      selectedStartAddressId: data.value
    });
  }

  handleEndAddressIdChange(data) {
    this.setState({
      // endAddress: [],
      selectedEndAddressId: data.value
    });
  }

  toggleNewStartAddress() {
    this.setState({ selectedStartAddressId: 0 });
  }

  toggleNewEndAddress() {
    this.setState({ selectedEndAddressId: 0 });
  }

  handleInputChange(e) {
    const {value} = e.target;
    this.setState({[e.target.name]: value});
  }

  handleInputChangeTonHour(e) {
    if (e.target.name === 'rateByTonValue') {
      this.setState({ rateByTonValue: e.target.value });
    } else if (e.target.name === 'estimatedTons') {
      this.setState({
        rateEstimate: e.target.value,
        estimatedTons: e.target.value
      });
    } else if (e.target.name === 'rateByHourValue') {
      this.setState({ rateByHourValue: e.target.value });
    } else if (e.target.name === 'estimatedHours') {
      this.setState({
        rateEstimate: e.target.value,
        estimatedHours: e.target.value
      });
    }
  }

  isFormValid() {
    return true;
  }

  renderJobTop() {
    const {
      jobName,
      reqHandlerName,
      reqHandlerDate,
      reqHandlerEstHours/* ,
      reqHandlerEstTons */
    } = this.state;
    const today = new Date();
    const currentDate = today.getTime();
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-3">
            <div className="form__form-group">
              <div className="">
                { /* <input name="name"
                      style={{ width: '100%' }}
                      type="text"
                      placeholder="Job # 242423"
                      onChange={this.handleJobInputChange}
                /> */}
                <span className="form__form-group-label">Job Name</span>
                <TField
                  input={
                    {
                      onChange: this.handleInputChange,
                      name: 'jobName',
                      value: jobName
                    }
                  }
                  placeholder="Job # 242423"
                  type="text"
                  // meta={reqHandlerName}
                />
              </div>
            </div>
          </div>
          <div className="col-md-6 form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Start Date</span>
              <div className="">
                <TDateTimePicker
                  input={
                    {
                      onChange: this.handleStartTimeChange,
                      name: 'startTime',
                      value: job.startTime,
                      givenDate: currentDate
                    }
                  }
                  onChange={this.handleStartTimeChange}
                  dateFormat="MMMM-dd-yyyy h:mm aa"
                  showTime
                  meta={reqHandlerDate}
                />
              </div>
            </div>
          </div>
          <div className="col-md-3 form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Estimated {job.rateType}s</span>
              <div className="">
                { /* <input name="rateEstimate"
                      type="text"
                      value={job.rateEstimate}
                      onChange={this.handleJobInputChange}
                /> */}
                <TFieldNumber
                  input={
                    {
                      onChange: this.handleJobInputChange,
                      name: 'rateEstimate',
                      value: job.rateEstimate
                    }
                  }
                  placeholder="0"
                  decimal
                  meta={reqHandlerEstHours}
                />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }


  // /////////////////////////////////////////////////
  renderOptions() {
    const {
      jobName,
      jobStartDateTime,
      jobTruckType,
      allTruckTypes,
      jobTrucksNeeded,

      selectedRatedHourOrTon,

      // materials
      allMaterials,
      selectedMaterials
    } = this.state;
    const today = new Date();
    const currentDate = today.getTime();
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-4">
            <div className="form__form-group">
              <span className="form__form-group-label">Job Name</span>
              <input
                name="jobName"
                type="text"
                value={jobName}
                onChange={this.handleInputChange}
                placeholder="Job Name"
              />
            </div>
          </div>
          <div className="col-md-4 form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Start Date</span>
              <div className="">
                <TDateTimePicker
                  input={
                    {
                      onChange: this.handleStartTimeChange,
                      name: 'startTime',
                      value: jobStartDateTime,
                      givenDate: currentDate
                    }
                  }
                  onChange={this.handleStartTimeChange}
                  dateFormat="MMMM-dd-yyyy h:mm aa"
                  showTime
                  // meta={reqHandlerDate}
                />
              </div>
            </div>
          </div>
          <div className="col-md-4 form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Truck Type</span>
              <SelectField
                input={
                  {
                    onChange: this.handleTruckTypeChange,
                    name: 'jobTruckType',
                    value: jobTruckType
                  }
                }
                // meta={reqHandlerTruckType}
                value={jobTruckType}
                options={allTruckTypes}
                placeholder="Truck Type"
              />
            </div>
          </div>
        </div>

        {/* second row */}
        <div className="row">
          <div className="col-md-4">
            <div className="form__form-group">
              <span className="form__form-group-label">Material</span>
              <SelectField
                input={
                  {
                    onChange: this.handleMaterialsChange,
                    name: 'materialType',
                    value: selectedMaterials
                  }
                }
                // meta={reqHandlerMaterials}
                value={selectedMaterials}
                options={allMaterials}
                placeholder="Select material"
              />
            </div>
          </div>
          <div className="col-md-6 form--horizontal">
            <Row className="col-md-12">
              <div className="col-md-3 form__form-group">
                <span className="form__form-group-label">Rate</span>
                <SelectField
                  input={
                    {
                      onChange: this.handleRateChange,
                      name: 'materialType',
                      value: selectedRatedHourOrTon
                    }
                  }
                  // meta={reqHandlerMaterials}
                  value={selectedRatedHourOrTon}
                  options={
                    [
                      {
                        value: 'hour',
                        label: 'Hour'
                      },
                      {
                        value: 'ton',
                        label: 'Ton'
                      }
                    ]
                  }
                />
              </div>
              {this.renderHourOrTon(selectedRatedHourOrTon)}
            </Row>
          </div>
          <div className="col-md-2 form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">
                # of trucks
              </span>
              <TFieldNumber
                input={
                  {
                    onChange: this.handleHourDetails,
                    name: 'jobTrucksNeeded',
                    value: jobTrucksNeeded
                  }
                }
                // meta={reqHandlerTrucksEstimate}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
  // /////////////////////////////////////////////////

  renderHourOrTon(hourTon) {
    const {
      rateByTonValue,
      rateByHourValue,
      estimatedTons,
      estimatedHours
    } = this.state;
    if (hourTon === 'ton') {
      return (
        <React.Fragment>
          <div className="col-md-4 form__form-group">
            <span className="form__form-group-label">Rate / Ton</span>
            <TFieldNumber
              input={
                {
                  onChange: this.handleInputChangeTonHour,
                  name: 'rateByTonValue',
                  value: rateByTonValue
                }
              }
              placeholder="0"
              decimal
              // meta={}
            />
          </div>
          <div className="col-md-5 form__form-group">
            <span className="form__form-group-label">Estimated Tons</span>
            <TFieldNumber
              input={
                {
                  onChange: this.handleInputChangeTonHour,
                  name: 'estimatedTons',
                  value: estimatedTons
                }
              }
              placeholder="0"
              decimal
              // meta={}
            />
          </div>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <div className="col-md-4 form__form-group">
          <span className="form__form-group-label">Rate / Hour</span>
          <TFieldNumber
            input={
              {
                onChange: this.handleInputChangeTonHour,
                name: 'rateByHourValue',
                value: rateByHourValue
              }
            }
            placeholder="0"
            decimal
            // meta={}
          />
        </div>
        <div className="col-md-5 form__form-group">
          <span className="form__form-group-label">Estimated hrs.</span>
          <TFieldNumber
            input={
              {
                onChange: this.handleInputChangeTonHour,
                name: 'estimatedHours',
                value: estimatedHours
              }
            }
            placeholder="0"
            decimal
            // meta={}
          />
        </div>
      </React.Fragment>
    );
  }

  renderJobStartLocation() {
    const {
      states,
      startAddress,
      reqHandlerStartAddress,
      reqHandlerSCity,
      reqHandlerSState,
      reqHandlerSZip,
      allAddresses,
      selectedStartAddressId
    } = this.state;
    return (
      <React.Fragment>
        <div className="col-md-6">

          <h3 className="subhead">
            Starting Location
          </h3>
          <small>
            Select a starting address
          </small>
          <div
            id="starting_id"
          >
            <SelectField
              input={
                {
                  onChange: this.handleStartAddressIdChange,
                  name: 'selectedStartAddress',
                  value: selectedStartAddressId
                }
              }
              // meta={reqHandlerMaterials}
              // value={selectedStartAddressId}
              options={allAddresses}
              placeholder="Select a location"
            />
          </div>
          <div>
            &nbsp;
          </div>
          <small>
            Or create a new one:
          </small>

          <div
            id="starting"
            className={`${selectedStartAddressId === 0 ? 'shown' : 'fifty'}`}
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.toggleNewStartAddress}
          >
            <div className="row">
              <div className="col-sm-12">
                <div className="form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleStartAddressInputChange,
                        name: 'address1',
                        value: startAddress.address1
                      }
                    }
                    placeholder="Address 1"
                    type="text"
                    meta={reqHandlerStartAddress}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form__form-group">
                  <input name="address2"
                        type="text"
                        placeholder="Address 2"
                        value={startAddress.address2}
                        onChange={this.handleStartAddressInputChange}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleStartAddressInputChange,
                        name: 'city',
                        value: startAddress.city
                      }
                    }
                    placeholder="City"
                    type="text"
                    meta={reqHandlerSCity}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form__form-group">
                  <SelectField
                    input={
                      {
                        onChange: this.handleStartStateChange,
                        name: 'state',
                        value: startAddress.state
                      }
                    }
                    meta={reqHandlerSState}
                    value={startAddress.state}
                    options={states}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form__form-group">
                  <TFieldNumber
                    input={
                      {
                        onChange: this.handleStartAddressInputChange,
                        name: 'zipCode',
                        value: startAddress.zipCode
                      }
                    }
                    placeholder="Zip Code"
                    meta={reqHandlerSZip}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </React.Fragment>
    );
  }

  renderJobEndLocation() {
    const {
      states,
      endAddress,
      reqHandlerEAddress,
      reqHandlerECity,
      reqHandlerEState,
      reqHandlerEZip,
      selectedEndAddressId,
      allAddresses
    } = this.state;
    return (
      <React.Fragment>
        <div className="col-md-6">

          <h3 className="subhead">
            End Location
          </h3>
          <small>
            Select a ending address:
          </small>
          <div
            id="ending_id"
          >
            <SelectField
              input={
                {
                  onChange: this.handleEndAddressIdChange,
                  name: 'selectedEndAddress',
                  value: selectedEndAddressId
                }
              }
              // meta={reqHandlerMaterials}
              // value={selectedEndAddressId}
              options={allAddresses}
              placeholder="Select a location"
            />
          </div>
          <div>
            &nbsp;
          </div>
          <small>
            Or create a new one:
          </small>

          <div
            id="ending"
            className={`${selectedEndAddressId === 0 ? 'shown' : 'fifty'}`}
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.toggleNewEndAddress}
          >
            <div className="row">
              <div className="col-sm-12">
                <div className="form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleEndAddressInputChange,
                        name: 'address1',
                        value: endAddress.address1
                      }
                    }
                    placeholder="Address #1"
                    type="text"
                    meta={reqHandlerEAddress}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form__form-group">
                  <input name="address2"
                        type="text"
                        placeholder="Address #2"
                        value={endAddress.address2}
                        onChange={this.handleEndAddressInputChange}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleEndAddressInputChange,
                        name: 'city',
                        value: endAddress.city
                      }
                    }
                    placeholder="City"
                    type="text"
                    meta={reqHandlerECity}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form__form-group">
                  <SelectField
                    input={
                      {
                        onChange: this.handleEndStateChange,
                        name: 'state',
                        value: endAddress.state
                      }
                    }
                    meta={reqHandlerEState}
                    value={endAddress.state}
                    options={states}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form__form-group">
                  <TFieldNumber
                    input={
                      {
                        onChange: this.handleEndAddressInputChange,
                        name: 'zipCode',
                        value: endAddress.zipCode
                      }
                    }
                    placeholder="Zip Code"
                    meta={reqHandlerEZip}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderJobBottom() {
    const { job } = this.state;
    return (
      <div className="">
        <div className="form__form-group">
          <h3 className="subhead">Comments</h3>
          <div className="">
            <textarea name="notes" value={job.notes} onChange={this.handleJobInputChange}/>
          </div>
        </div>
      </div>
    );
  }

  renderJobFormButtons() {
    const { closeModal } = this.props;
    const { btnSubmitting } = this.state;

    return (
      <div className="row float-right">
        <div className="row">
          <div className="col-sm-4">
            <button type="button" className="btn btn-secondary" onClick={() => closeModal()}>
              Cancel
            </button>
          </div>
          <div className="col-sm-8">
            <TSubmitButton
              onClick={this.createJob}
              className="primaryButton"
              loading={btnSubmitting}
              loaderSize={10}
              bntText="Request Truck"
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <form id="job-request">
          {this.renderOptions()}
          <div className="cl-md-12">
            <hr />
          </div>
          {/* this.renderJobTop() */}
          TOPP
          <div className="row">
            {this.renderJobStartLocation()}
            {/* this.isRateTypeTon(job.rateType) && this.renderJobEndLocation() */}
            {this.renderJobEndLocation()}
          </div>
          {this.renderJobBottom()}
          <div className="cl-md-12">
            <hr />
          </div>
          {this.renderJobFormButtons()}
        </form>
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

JobCreateFormCarrier.propTypes = {
  selectedEquipment: PropTypes.shape({
    id: PropTypes.number
  }).isRequired,
  getAllMaterials: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  // selectedMaterials: PropTypes.func.isRequired
};

export default JobCreateFormCarrier;
