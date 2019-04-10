import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Container } from 'reactstrap';
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
import TDateTimePicker from '../common/TDateTimePicker';
import TField from '../common/TField';
import TwilioService from '../../api/TwilioService';
import MultiSelect from '../common/TMultiSelect';
import SelectField from '../common/TSelect';
import CompanyService from '../../api/CompanyService';

class JobCreateForm extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();
    // Note: not needed for creating a job
    delete job.endTime;
    // job.
    this.state = {
      loaded: false,
      job,
      states: [],
      startAddress: AddressService.getDefaultAddress(),
      endAddress: AddressService.getDefaultAddress(),
      bid: BidService.getDefaultBid(),
      booking: BookingService.getDefaultBooking(),
      bookingEquipment: BookingEquipmentService.getDefaultBookingEquipment(),
      materials: '',
      availableMaterials: [],
      reqHandlerName: {
        touched: false,
        error: ''
      },
      reqHandlerDate: {
        touched: false,
        error: ''
      },
      reqHandlerEstHours: {
        touched: false,
        error: ''
      },
      reqHandlerEstTons: {
        touched: false,
        error: ''
      },
      reqHandlerStartAddress: {
        touched: false,
        error: ''
      },
      reqHandlerSCity: {
        touched: false,
        error: ''
      },
      reqHandlerSState: {
        touched: false,
        error: ''
      },
      reqHandlerSZip: {
        touched: false,
        error: ''
      },
      reqHandlerEAddress: {
        touched: false,
        error: ''
      },
      reqHandlerECity: {
        touched: false,
        error: ''
      },
      reqHandlerEState: {
        touched: false,
        error: ''
      },
      reqHandlerEZip: {
        touched: false,
        error: ''
      }
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
  }

  async componentDidMount() {
    // debugger;
    const profile = await ProfileService.getProfile();
    const { job, startAddress, endAddress, bid, booking, bookingEquipment } = this.state;
    const { selectedEquipment, selectedMaterials } = this.props;
    job.companiesId = profile.companyId;
    // I commented the line below as I am not sure what it is used for
    // in the DB we have numEquipments
    // job.numberOfTrucks = 1;
    job.modifiedBy = profile.userId;
    job.createdBy = profile.userId;
    /* if (selectedEquipment.rateType !== 'All') {
      job.rateType = selectedEquipment.rateType;
    } */
    job.rateType = 'Hour';

    // why are we setting these fields to profile.??

    startAddress.companyId = profile.companyId;
    startAddress.modifiedBy = profile.userId;
    startAddress.createdBy = profile.userId;
    endAddress.companyId = profile.companyId;
    endAddress.modifiedBy = profile.userId;
    endAddress.createdBy = profile.userId;
    bid.hasCustomerAccepted = 1;

    // bid.userId should be the userid of the driver linked to that equipment
    if (!selectedEquipment.defaultDriverId) {
      bid.userId = profile.selectedEquipment.defaultDriverId;
    } else {
      bid.userId = profile.userId;
    }

    // The bid creator should be set to the selectedEquipment driverId
    // bids are supposed to get created by carriers
    bid.createdBy = selectedEquipment.driversId;
    bid.modifiedBy = selectedEquipment.driversId;

    // set booking information based on job and bid
    // createdBy and modifiedBy should be set to selectedEquipment.driversId
    booking.createdBy = selectedEquipment.driversId;
    booking.modifiedBy = selectedEquipment.driversId;
    booking.rateType = job.rateType;
    booking.startTime = job.startTime;
    booking.endTime = job.endTime;

    await this.fetchForeignValues();
    this.setState({
      job,
      startAddress,
      endAddress,
      bid,
      booking,
      bookingEquipment,
      availableMaterials: selectedMaterials()
    });
    this.setState({ loaded: true });
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
      materials: data
    });
  }

  selectChange(data) {
    // const { reqHandlerTruckType } = this.state;
    /* this.setState({
      reqHandlerTruckType: Object.assign({}, reqHandlerTruckType, {
        touched: false
      })
    }); */
    this.setState({ materials: data.value });
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

  async createJob(e) {
    e.preventDefault();
    const { closeModal, selectedEquipment } = this.props;
    const { startAddress, job, endAddress, bid, booking, bookingEquipment } = this.state;
    const newJob = CloneDeep(job);
    startAddress.name = `Job: ${newJob.name}`;
    endAddress.name = `Job: ${newJob.name}`;
    if (!this.isFormValid()) {
      // TODO display error message
      // console.error('didnt put all the required fields.');
      return;
    }
    startAddress.modifiedOn = moment()
      .unix() * 1000;
    startAddress.createdOn = moment()
      .unix() * 1000;
    const newStartAddress = await AddressService.createAddress(startAddress);
    newJob.startAddress = newStartAddress.id;
    if (newJob.rateType === 'Ton') {
      endAddress.modifiedOn = moment()
        .unix() * 1000;
      endAddress.createdOn = moment()
        .unix() * 1000;
      const newEndAddress = await AddressService.createAddress(endAddress);
      newJob.endAddress = newEndAddress.id;
      newJob.rate = selectedEquipment.tonRate;
    } else {
      delete newJob.endAddress;
      newJob.rate = selectedEquipment.hourRate;
    }
    newJob.modifiedOn = moment()
      .unix() * 1000;
    newJob.createdOn = moment()
      .unix() * 1000;
    // console.log('selectedEquipment type: ', selectedEquipment.type);
    // console.log('newJob: ', newJob);

    newJob.equipmentType = selectedEquipment.type;
    // In this scenario we are not letting a customer create a job with
    // more than 1 truck so here we set the numEquipments to 1
    // in the new job creation method we need to set it to the actual
    // number they set in the field
    newJob.numEquipments = 1;
    // console.log('selectedEquipment: ');
    // console.log(selectedEquipment);
    //
    // console.log('selectedEquipment.equipmentType: ', selectedEquipment.equipmentType);
    // console.log('equipmentType: ', newJob.equipmentType);
    const createdJob = await JobService.createJob(newJob);
    bid.jobId = createdJob.id;
    // bid.startAddress = createdJob.startAddress;
    // bid.endAddress = createdJob.endAddress;
    bid.companyCarrierId = selectedEquipment.companyId;
    bid.rate = createdJob.rate;
    bid.rateEstimate = createdJob.rateEstimate;
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
    booking.sourceAddressId = createdJob.startAddress;
    booking.startAddress = createdJob.startAddress;
    booking.endAddress = createdJob.endAddress;
    // console.log('createdBid ');
    // console.log(createdBid);
    // console.log('booking bidId is ', booking.bidId);
    // console.log('booking ');
    // console.log(booking);
    // console.log('createdBid.companyCarrierId is ', createdBid.companyCarrierId);

    const createdBooking = await BookingService.createBooking(booking);

    // now we need to create a BookingEquipment record
    // Since in this scenario we are only allowing 1 truck for one booking
    // we are going to create one BookingEquipment.  NOTE: the idea going forward is
    // to allow multiple trucks per booking
    bookingEquipment.bookingId = createdBooking.id;
    // console.log('bookingId ', createdBooking.id);
    // console.log('bookingEquipment');
    // console.log(bookingEquipment);

    const carrierCompany = await CompanyService.getCompanyById(createdBid.companyCarrierId);
    // console.log('carrierCompany ');
    // console.log(carrierCompany);
    // const carrierAdmin = await

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
    bookingEquipment.startAddress = createdBooking.startAddress;
    bookingEquipment.endAddress = createdBooking.endAddress;
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
    // We need to change later get the body from the lookups table
    // We need to get the phone number from the carrier co
    const notification = {
      to: '16129990787',
      body: 'You have a new job offer, please log in to https://www.mytrelar.com'
    };
    await TwilioService.createSms(notification);
    closeModal();
  }

  isFormValid() {
    const job = this.state;
    const {
      reqHandlerName,
      reqHandlerDate,
      reqHandlerEstHours,
      reqHandlerEstTons,
      reqHandlerStartAddress,
      reqHandlerSCity,
      reqHandlerSState,
      reqHandlerSZip,
      reqHandlerEAddress,
      reqHandlerECity,
      reqHandlerEState,
      reqHandlerEZip
    } = this.state;
    let isValid = true;

    if (job.job.name.length === 0) {
      this.setState({
        reqHandlerName: Object.assign({}, reqHandlerName, {
          touched: true,
          error: 'Please Enter a Name for this job'
        })
      });
      isValid = false;
    }

    if (job.job.startTime.length === 0) {
      this.setState({
        reqHandlerDate: Object.assign({}, reqHandlerDate, {
          touched: true,
          error: 'Please select a start date for this job'
        })
      });
      isValid = false;
    }

    if (job.job.rateEstimate.length === 0 || job.job.rateEstimate <= 0) {
      this.setState({
        reqHandlerEstHours: Object.assign({}, reqHandlerEstHours, {
          touched: true,
          error: 'Please enter an estimated number for this job'
        })
      });
      isValid = false;
    }

    if (job.job.rateEstimate.length === 0 || job.job.rateEstimate <= 0) {
      this.setState({
        reqHandlerEstTons: Object.assign({}, reqHandlerEstTons, {
          touched: true,
          error: 'Please enter an estimated number for this job'
        })
      });
      isValid = false;
    }

    if (job.startAddress.address1.length === 0) {
      this.setState({
        reqHandlerStartAddress: Object.assign({}, reqHandlerStartAddress, {
          touched: true,
          error: 'Please enter a starting address for this job'
        })
      });
      isValid = false;
    }

    if (job.startAddress.city.length === 0) {
      this.setState({
        reqHandlerSCity: Object.assign({}, reqHandlerSCity, {
          touched: true,
          error: 'This field is required'
        })
      });
      isValid = false;
    }

    if (job.startAddress.state.length === 0) {
      this.setState({
        reqHandlerSState: Object.assign({}, reqHandlerSState, {
          touched: true,
          error: 'This field is required'
        })
      });
      isValid = false;
    }

    if (job.startAddress.zipCode.length === 0) {
      this.setState({
        reqHandlerSZip: Object.assign({}, reqHandlerSZip, {
          touched: true,
          error: 'This field is required'
        })
      });
      isValid = false;
    }

    // if it's job per hour, do not validate endAddress
    if (job.job.rateType !== 'Hour') {
      if (job.endAddress.address1.length === 0) {
        this.setState({
          reqHandlerEAddress: Object.assign({}, reqHandlerEAddress, {
            touched: true,
            error: 'Please enter a destination or end address for this job'
          })
        });
        isValid = false;
      }

      if (job.endAddress.city.length === 0) {
        this.setState({
          reqHandlerECity: Object.assign({}, reqHandlerECity, {
            touched: true,
            error: 'This field is required'
          })
        });
        isValid = false;
      }

      if (job.endAddress.state.length === 0) {
        this.setState({
          reqHandlerEState: Object.assign({}, reqHandlerEState, {
            touched: true,
            error: 'This field is required'
          })
        });
        isValid = false;
      }

      if (job.endAddress.zipCode.length === 0) {
        this.setState({
          reqHandlerEZip: Object.assign({}, reqHandlerEZip, {
            touched: true,
            error: 'This field is required'
          })
        });
        isValid = false;
      }
    }

    return isValid;
  }

  renderSelectedEquipment() {
    const { job, materials } = this.state;
    console.log(materials);
    let { availableMaterials } = this.state;
    const { selectedEquipment, getAllMaterials } = this.props;

    // if ANY is selected, let's show all materials
    if (availableMaterials.length > 0) {
      for (const mat in availableMaterials) {
        if (availableMaterials[mat].value === 'Any') {
          availableMaterials = getAllMaterials()
            .map(rateType => ({
              name: 'rateType',
              value: rateType,
              label: rateType
            }));
        }
      }
    }

    return (
      <React.Fragment>
        <h3 className="subhead">{selectedEquipment.name}</h3>
        <div className="row">
          <div className="col-sm-3">
            <img width="100" height="85" src={`${window.location.origin}/${truckImage}`} alt=""
                 style={{ width: '100px' }}
            />
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <span className="form__form-group-label">Truck Type</span>
              <div className="form__form-group-field">
                <span>{selectedEquipment.type}</span>
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="">
              <span className="form__form-group-label">Capacity</span>
              <div className="form__form-group-field">
                <span>
                  <NumberFormat
                    value={selectedEquipment.maxCapacity}
                    displayType="text"
                    decimalSeparator="."
                    decimalScale={0}
                    fixedDecimalScale
                    thousandSeparator
                    prefix=" "
                    suffix=" Tons"
                  />
                </span>
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form__form-group">
              <span className="form__form-group-label">Materials</span>
              <div className="form__form-group-field">
                <SelectField
                  input={
                    {
                      onChange: this.selectChange,
                      name: 'materialType',
                      value: materials
                    }
                  }
                  meta={
                    {
                      touched: false,
                      error: 'Unable to select'
                    }
                  }
                  value={materials}
                  options={availableMaterials}
                  placeholder="Select material"
                />
              </div>
            </div>
          </div>
        </div>
        {!this.isRateTypeTon(job.rateType) && (
          <div style={{ marginTop: '5px' }}>
            <NumberFormat
              value={selectedEquipment.hourRate}
              displayType="text"
              decimalSeparator="."
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator
              prefix="$ "
              suffix=" per Hour"
            />
          </div>
        )}
        {this.isRateTypeTon(job.rateType) && (
          <div style={{ marginTop: '5px' }}>
            <NumberFormat
              value={selectedEquipment.tonRate}
              displayType="text"
              decimalSeparator="."
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator
              prefix="$ "
              suffix=" per Ton"
            />
          </div>
        )}
      </React.Fragment>
    );
  }

  renderJobTop() {
    const {
      job,
      reqHandlerName,
      reqHandlerDate,
      reqHandlerEstHours/* ,
      reqHandlerEstTons */
    } = this.state;
    const { selectedEquipment } = this.props;
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-4">
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
                      onChange: this.handleJobInputChange,
                      name: 'name',
                      value: job.name
                    }
                  }
                  placeholder="Job # 242423"
                  type="text"
                  meta={reqHandlerName}
                />
              </div>
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
                      value: job.startTime,
                      givenDate: new Date(job.startTime).getTime(),
                      dateFormat: 'MM-dd-yy'
                    }
                  }
                  onChange={this.handleStartTimeChange}
                  meta={reqHandlerDate}
                />
              </div>
            </div>
          </div>
          <div className="col-md-4 form--horizontal">
            <div className="form__form-group">
              <span className="form__form-group-label">Estimated {job.rateType}s</span>
              <div className="">
                { /* <input name="rateEstimate"
                      type="text"
                      value={job.rateEstimate}
                      onChange={this.handleJobInputChange}
                /> */}
                <TField
                  input={
                    {
                      onChange: this.handleJobInputChange,
                      name: 'rateEstimate',
                      value: job.rateEstimate
                    }
                  }
                  placeholder="0"
                  type="number"
                  meta={reqHandlerEstHours}
                />
              </div>
            </div>
          </div>
        </div>
        {selectedEquipment.rateType === 'Both' && (
          <div className="col-sm-4">
            <TButtonToggle isOtherToggled={this.isRateTypeTon(job.rateType)} buttonOne="Hour"
                           buttonTwo="Ton" onChange={this.toggleJobRateType}
            />
          </div>
        )}
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
      reqHandlerSZip
    } = this.state;
    return (
      <React.Fragment>
        <div className="col-md-6">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="subhead">Start Location</h3>
            </div>
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
                  placeholder="Address #1"
                  type="text"
                  meta={reqHandlerStartAddress}
                />
              </div>
            </div>
            <div className="col-sm-12">
              <div className="form__form-group">
                <input name="address2"
                       type="text"
                       placeholder="Address #2"
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
                <TField
                  input={
                    {
                      onChange: this.handleStartAddressInputChange,
                      name: 'zipCode',
                      value: startAddress.zipCode
                    }
                  }
                  placeholder="Zip Code"
                  type="number"
                  meta={reqHandlerSZip}
                />
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
      reqHandlerEZip
    } = this.state;
    return (
      <React.Fragment>
        <div className="col-md-6">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="subhead">End Location</h3>
            </div>
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
                <TField
                  input={
                    {
                      onChange: this.handleEndAddressInputChange,
                      name: 'zipCode',
                      value: endAddress.zipCode
                    }
                  }
                  placeholder="Zip Code"
                  type="number"
                  meta={reqHandlerEZip}
                />
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

    return (
      <div className="row float-right">
        <div className="row">
          <div className="col-sm-4">
            <button type="button" className="btn btn-secondary" onClick={() => closeModal()}>
              Cancel
            </button>
          </div>
          <div className="col-sm-8">
            <button type="submit" className="btn btn-primary">
              Accept Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { job, loaded } = this.state;
    if (loaded) {
      return (
        <form id="job-request" onSubmit={e => this.createJob(e)}>
          {this.renderSelectedEquipment()}
          <div className="cl-md-12">
            <hr></hr>
          </div>
          {this.renderJobTop()}
          <div className="row">
            {this.renderJobStartLocation()}
            {this.isRateTypeTon(job.rateType) && this.renderJobEndLocation()}
          </div>
          {this.renderJobBottom()}
          <div className="cl-md-12">
            <hr></hr>
          </div>
          {this.renderJobFormButtons()}
        </form>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

JobCreateForm.propTypes = {
  selectedEquipment: PropTypes.shape({
    id: PropTypes.number
  }).isRequired,
  getAllMaterials: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  selectedMaterials: PropTypes.func.isRequired
};

export default JobCreateForm;
