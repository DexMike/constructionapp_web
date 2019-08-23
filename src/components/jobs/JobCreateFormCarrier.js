import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  Col,
  Row,
  Button,
  ButtonToolbar
} from 'reactstrap';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import MultiSelect from '../common/TMultiSelect';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';
import BidService from '../../api/BidService';
import BookingService from '../../api/BookingService';
import UserService from '../../api/UserService';
import TwilioService from '../../api/TwilioService';
// import BookingEquipmentService from '../../api/BookingEquipmentService';
import TDateTimePicker from '../common/TDateTimePicker';
import TField from '../common/TField';
import TFieldNumber from '../common/TFieldNumber';
import SelectField from '../common/TSelect';
import JobMaterialsService from '../../api/JobMaterialsService';
import './jobs.css';
import TSubmitButton from '../common/TSubmitButton';
import TSpinner from '../common/TSpinner';
import GeoCodingService from '../../api/GeoCodingService';

class JobCreateFormCarrier extends Component {
  constructor(props) {
    super(props);
    const job = JobService.getDefaultJob();
    // Note: not needed for creating a job
    delete job.endTime;
    // job.
    this.state = {
      /*
      bid: BidService.getDefaultBid(),
      booking: BookingEquipmentService.getDefaultBooking(),
      bookingEquipment: BookingEquipmentService.getDefaultBookingEquipment(),
      material: '',
      availableMaterials: [],
      */
      profile: null,

      // truck properties
      selectedTrucks: '',
      truckType: '',
      allTruckTypes: [],
      capacity: 0,
      allMaterials: [],
      selectedMaterials: '',
      allUSstates: [],
      // addresses
      allAddresses: [],
      selectedStartAddressId: 0,
      selectedEndAddressId: 0,
      // rates
      rate: 0,
      ratebyBoth: false,
      rateByTonValue: 0,
      estimatedTons: 0,
      rateByHourValue: 0,
      estimatedHours: 0,
      isRatedHour: true,
      selectedRatedHourOrTon: 'ton',
      tonnage: 0, // estimated amount of tonnage
      rateEstimate: 0,
      hourTrucksNumber: '',
      rateTab: 1,
      hourTon: 'ton',
      // location
      startLocationAddressName: '',
      endLocationAddressName: '',
      endLocationAddress1: '',
      endLocationAddress2: '',
      endLocationCity: '',
      endLocationState: '',
      endLocationZip: '',
      endLocationLatitude: 0,
      endLocationLongitude: 0,
      startLocationAddress1: '',
      startLocationAddress2: '',
      startLocationCity: '',
      startLocationState: '',
      startLocationZip: '',
      startLocationLatitude: 0,
      startLocationLongitude: 0,
      // date
      jobDate: null,
      // job properties
      name: '',
      instructions: '',

      // jobOptions
      jobName: '',
      // jobStartDate
      jobStartDateTime: new Date(),
      jobTruckType: '',

      // Request Handlers
      reqHandlerSameAddresses: {
        touched: false,
        error: ''
      },
      reqHandlerJobName: {
        touched: false,
        error: ''
      },
      /*
      reqHandlerTonnage: {
        touched: false,
        error: ''
      },
      */
      reqHandlerDate: {
        touched: false,
        error: ''
      },
      reqHandlerTruckType: {
        touched: false,
        error: ''
      },
      reqHandlerMaterials: {
        touched: false,
        error: ''
      },
      /*
      reqHandlerHoursEstimate: {
        touched: false,
        error: ''
      },
      */
      reqHandleTrucksEstimate: {
        touched: false,
        error: ''
      },
      reqHandlerStartAddress: {
        touched: false,
        error: ''
      },
      reqHandlerStartCity: {
        touched: false,
        error: ''
      },
      reqHandlerStartZip: {
        touched: false,
        error: ''
      },
      reqHandlerStartState: {
        touched: false,
        error: ''
      },
      reqHandlerEndCity: {
        touched: false,
        error: ''
      },
      reqHandlerEndZip: {
        touched: false,
        error: ''
      },
      reqHandlerEndState: {
        touched: false,
        error: ''
      },
      reqHandlerEndAddress: {
        touched: false,
        error: ''
      },

      // extra fields
      reqHandlerTons: {
        touched: false,
        error: ''
      },
      reqHandlerEstimatedTons: {
        touched: false,
        error: ''
      },
      reqHandlerHours: {
        touched: false,
        error: ''
      },
      reqHandlerEstimatedHours: {
        touched: false,
        error: ''
      },
      reqHandlerStartAddressName: {
        touched: false,
        error: ''
      },
      reqHandlerEndAddressName: {
        touched: false,
        error: ''
      },
    };
    this.handleJobInputChange = this.handleJobInputChange.bind(this);
    this.handleStartAddressInputChange = this.handleStartAddressInputChange.bind(this);
    this.handleStartStateChange = this.handleStartStateChange.bind(this);
    this.handleEndAddressInputChange = this.handleEndAddressInputChange.bind(this);
    this.handleEndStateChange = this.handleEndStateChange.bind(this);
    this.toggleJobRateType = this.toggleJobRateType.bind(this);
    this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
    // this.createJob = this.createJob.bind(this);
    this.saveJob = this.saveJob.bind(this);
    this.isFormValid = this.isFormValid.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.jobDateChange = this.jobDateChange.bind(this);
    this.handleStartAddressChange = this.handleStartAddressChange.bind(this);
    this.handleEndAddressChange = this.handleEndAddressChange.bind(this);
    this.handleEndLocationChange = this.handleEndLocationChange.bind(this);
    this.handleStartLocationChange = this.handleStartLocationChange.bind(this);
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
    this.getStartCoords = this.getStartCoords.bind(this);
    this.getEndCoords = this.getEndCoords.bind(this);
  }

  async componentDidMount() {
    const { job } = this.props;
    const profile = await ProfileService.getProfile();
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
          value: String(itm.id)
        };
        allTruckTypes.push(inside);
      });

    // US states
    let states = await LookupsService.getLookupsByType('States');
    states = states.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));

    // should load all addresses even if already set
    const response = await AddressService.getAddressesByCompanyId(profile.companyId);

    const newItem = {
      id: 0,
      name: 'NEW ADDRESS',
      address1: '',
      city: '',
      zipCode: ''
    };

    response.data.unshift(newItem);
    const allAddresses = response.data.map(address => ({
      value: String(address.id),
      label: `${address.name} - ${address.address1} ${address.city} ${address.zipCode}`
    }));

    if (job) {
      // we map the selected truck types to the allTruckTypes array to get the Lookup value
      const selectedTruckTypes = await JobService.getMaterialsByJobId(job.id);
      const mapSelectedTruckTypes = [];
      Object.values(selectedTruckTypes)
        .forEach((itm) => {
          let inside = {};
          Object.keys(allTruckTypes).map((propKey) => {
            if (allTruckTypes[propKey].label === itm) {
              inside = {
                label: itm,
                value: allTruckTypes[propKey].value
              }
              return inside;
            }
            return null;
          });
          mapSelectedTruckTypes.push(inside);
        });
      this.setState({
        name: job.name,
        selectedStartAddressId: job.startAddress.id,
        selectedEndAddressId: job.endAddress.id,
        jobDate: new Date(moment(job.startTime).tz(
          profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
        ).format('YYYY-MM-DD HH:mm:ss')),
        truckType: job.truckType,
        selectedTrucks: mapSelectedTruckTypes,
        hourTrucksNumber: job.numEquipments,
        selectedRatedHourOrTon: job.rateType.toLowerCase(),
        rateByHourValue: job.rate,
        rateByTonValue: job.rate,
        estimatedTons: job.rateEstimate,
        estimatedHours: job.rateEstimate,
        selectedMaterials: job.materials,
        rateEstimate: job.rateEstimate,
        instructions: job.notes
      });
    }

    this.setState({
      allAddresses,
      allUSstates: states,
      allMaterials,
      allTruckTypes,
      profile,
      loaded: true
    });
  }

  async getStartCoords() {
    const {
      startLocationAddress1,
      startLocationCity,
      startLocationState,
      startLocationZip
    } = this.state;
    const startString = `${startLocationAddress1}, ${startLocationCity}, ${startLocationState}, ${startLocationZip}`;
    // TODO -> do this without MapBox
    try {
      const geoResponseStart = await GeoCodingService.getGeoCode(startString);
      return geoResponseStart;
    } catch (err) {
      // console.log(err);
      return null;
    }
  }

  async getEndCoords() {
    const {
      endLocationAddress1,
      endLocationCity,
      endLocationState,
      endLocationZip
    } = this.state;
    const endString = `${endLocationAddress1}, ${endLocationCity}, ${endLocationState}, ${endLocationZip}`;
    // TODO -> do this without MapBox
    try {
      const geoResponseEnd = await GeoCodingService.getGeoCode(endString);
      return geoResponseEnd;
    } catch (err) {
      // console.log(err);
      return null;
    }
    return null;
  }

  // let's create a list of truck types that we want to save
  async saveJobTrucks(jobId, trucks) {
    const allTrucks = [];
    for (const truck of trucks) {
      const equipmentMaterial = {
        jobId,
        equipmentTypeId: Number(truck.value)
      };
      allTrucks.push(equipmentMaterial);
    }
    // delete old set of equipment types
    await JobMaterialsService.deleteJobEquipmentsByJobId(jobId);
    // create a new set of equipment types
    await JobMaterialsService.createJobEquipments(jobId, allTrucks);
  }

  // save begins ///////////////////////////////////////////////////////
  async saveJob() {
    const { job } = this.props;
    this.setState({ btnSubmitting: true });

    const isValid = await this.isFormValid();
    if (!isValid) {
      this.setState({ btnSubmitting: false });
      return;
    }

    // consts
    const {
      profile,

      startLocationAddressName,
      startLocationAddress1,
      startLocationAddress2,
      startLocationCity,
      startLocationState,
      startLocationZip,
      startLocationLatitude,
      startLocationLongitude,

      // address 1
      endLocationAddressName,
      endLocationAddress1,
      endLocationAddress2,
      endLocationCity,
      endLocationState,
      endLocationZip,
      endLocationLatitude,
      endLocationLongitude,

      selectedStartAddressId,
      selectedEndAddressId,
      selectedRatedHourOrTon,
      rateByTonValue,
      rateByHourValue,
      rateEstimate,
      name,
      instructions,
      jobTruckType,
      selectedTrucks,
      truckType,
      hourTrucksNumber,
      selectedMaterials
    } = this.state;
    let { jobDate } = this.state;

    const { selectedCarrierId } = this.props;

    // start location
    let startAddress = {
      id: null
    };
    if (selectedStartAddressId === 0) {
      const address1 = {
        type: 'Delivery',
        name: startLocationAddressName,
        companyId: profile.companyId,
        address1: startLocationAddress1,
        address2: startLocationAddress2,
        latitude: startLocationLatitude,
        longitude: startLocationLongitude,
        city: startLocationCity,
        state: startLocationState,
        zipCode: startLocationZip,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
      startAddress = await AddressService.createAddress(address1);
    } else {
      startAddress.id = selectedStartAddressId;
    }

    // end location
    let endAddress = {
      id: null
    };
    if (selectedEndAddressId === 0) {
      const address2 = {
        type: 'Delivery',
        name: endLocationAddressName,
        companyId: profile.companyId,
        address1: endLocationAddress1,
        address2: endLocationAddress2,
        latitude: endLocationLatitude,
        longitude: endLocationLongitude,
        city: endLocationCity,
        state: endLocationState,
        zipCode: endLocationZip
      };
      endAddress = await AddressService.createAddress(address2);
    } else {
      endAddress.id = selectedEndAddressId;
    }
    /*
    let isFavorited = 0;
    if (showSendtoFavorites) {
      isFavorited = 1;
    }
    */

    let rateType = '';
    let rate = 0;
    if (selectedRatedHourOrTon === 'ton') {
      rateType = 'Ton';
      rate = Number(rateByTonValue);
    } else {
      rateType = 'Hour';
      rate = Number(rateByHourValue);
    }

    const calcTotal = rateEstimate * rate;
    const rateTotal = Math.round(calcTotal * 100) / 100;

    jobDate = moment(jobDate).format('YYYY-MM-DD HH:mm');

    let newJob = [];
    let createdJob = [];

    if (job) { // updating/editing Job from Job Detail Page
      newJob = CloneDeep(job);
      newJob.name = name;
      newJob.startAddress = startAddress.id;
      newJob.endAddress = endAddress.id;
      newJob.startTime = moment.tz(
        jobDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
      // newJob.equipmentType = truckType.value; // TODO: make this work with multiple truck types
      newJob.numEquipments = hourTrucksNumber;
      newJob.rateType = rateType;
      newJob.rate = rate;
      newJob.rateEstimate = rateEstimate;
      newJob.rateTotal = rateTotal;
      newJob.notes = instructions;
      newJob.modifiedBy = profile.userId;
      newJob.modifiedOn = moment.utc().format();
      createdJob = await JobService.updateJob(newJob);
      if (createdJob) {
        // save material
        this.saveJobMaterials(createdJob.id, selectedMaterials.value);
        // save job equipments
        if (Object.keys(selectedTrucks).length > 0) {
          this.saveJobTrucks(createdJob.id, selectedTrucks);
        }
      }
      const { closeModal, updateJobView } = this.props;
      this.setState({ btnSubmitting: false });
      updateJobView(createdJob);
      closeModal();
    } else { // new Job Request from Carrier Search
      newJob = {
        companiesId: profile.companyId,
        name,
        status: 'Published And Offered',
        isFavorited: false,
        startAddress: startAddress.id,
        endAddress: endAddress.id,
        startTime: moment.tz(
          jobDate,
          profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
        ).utc().format(),
        equipmentType: truckType.value,
        numEquipments: hourTrucksNumber,
        rateType,
        rate,
        rateEstimate,
        rateTotal,
        notes: instructions,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };

      createdJob = await JobService.createJob(newJob);
      // return false;

      // add materials
      if (createdJob) {
        /*
        if (d.selectedMaterials) { // check if there's materials to add
          this.saveJobMaterials(newJob.id, d.selectedMaterials.value);
        }
        */
        // one material only
        this.saveJobMaterials(createdJob.id, selectedMaterials.value);
        // save job equipments
        if (Object.keys(selectedTrucks).length > 0) {
          this.saveJobTrucks(createdJob.id, selectedTrucks);
        }
      }

      const bid = {};
      const booking = {};
      // const bookingEquipment = {};

      // final steps
      bid.jobId = createdJob.id;
      bid.userId = profile.userId;
      // bid.startAddress = createdJob.startAddress;
      // bid.endAddress = createdJob.endAddress;
      bid.companyCarrierId = selectedCarrierId;
      bid.rate = createdJob.rate;
      bid.rateType = rateType;
      bid.rateEstimate = createdJob.rateEstimate;
      bid.hasCustomerAccepted = 1;
      bid.hasSchedulerAccepted = 0;
      bid.status = 'Pending';
      bid.notes = createdJob.notes;
      bid.createdBy = profile.userId;
      bid.createdOn = moment.utc().format();
      bid.modifiedBy = profile.userId;
      bid.modifiedOn = moment.utc().format();
      const createdBid = await BidService.createBid(bid);

      // Now we need to create a Booking
      booking.bidId = createdBid.id;
      booking.schedulersCompanyId = selectedCarrierId.companyId;
      booking.rateType = createdJob.rateType;
      booking.schedulersCompanyId = selectedCarrierId;
      booking.startTime = createdJob.startTime;

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

      /*
      // now we need to create a BookingEquipment record
      // Since in this scenario we are only allowing 1 truck for one booking
      // we are going to create one BookingEquipment.  NOTE: the idea going forward is
      // to allow multiple trucks per booking
      bookingEquipment.bookingId = createdBooking.id;

      // const carrierCompany = await CompanyService.getCompanyById(createdBid.companyCarrierId);

      // this needs to be createdBid.carrierCompanyId.adminId
      bookingEquipment.schedulerId = createdBid.userId;
      // bookingEquipment.driverId = selectedCarrierId.driversId; // check out
      // bookingEquipment.equipmentId = selectedCarrierId.id; // check out
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
      bookingEquipment.createdBy = selectedCarrierId.driversId; // check out
      bookingEquipment.modifiedBy = selectedCarrierId.driversId; // check out
      bookingEquipment.modifiedOn = moment()
        .unix() * 1000;
      bookingEquipment.createdOn = moment()
        .unix() * 1000;
      await BookingEquipmentService.createBookingEquipments(bookingEquipment);
      */

      // Let's make a call to Twilio to send an SMS
      // We need to get the phone number from the carrier co
      // Sending SMS to Truck's company's admin
      const carrierAdmin = await UserService.getAdminByCompanyId(selectedCarrierId);
      if (carrierAdmin.length > 0) { // check if we get a result
        if (carrierAdmin[0].mobilePhone && this.checkPhoneFormat(carrierAdmin[0].mobilePhone)) {
          const notification = {
            to: this.phoneToNumberFormat(carrierAdmin[0].mobilePhone),
            body: 'You have a new job offer, please log in to https://www.mytrelar.com'
          };
          await TwilioService.createSms(notification);
        }
      }

      alert('Job Sent to carrier');
      const { closeModal } = this.props;
      this.setState({ btnSubmitting: false });
      closeModal();
    }
  }
  // save ends /////////////////////////////////////////////////////////

  handleTruckTypeChange(data) {
    const { reqHandlerTruckType } = this.state;
    this.setState({
      reqHandlerTruckType: {...reqHandlerTruckType, touched: false}
    });
    this.setState({selectedTrucks: data});
  }

  handleStartLocationChange(e) {
    this.setState({
      reqHandlerStartState: {touched: false}
    });
    this.setState({startLocationState: e.value});
  }

  handleEndLocationChange(e) {
    this.setState({
      reqHandlerEndState: {touched: false}
    });
    this.setState({endLocationState: e.value});
  }

  handleEndAddressChange(e) {
    this.handleSameAddresses();
    let reqHandler = '';
    switch (e.target.name) {
      case 'endLocationAddressName':
        reqHandler = 'reqHandlerEndAddressName';
        break;
      case 'endLocationAddress1':
        reqHandler = 'reqHandlerEndAddress';
        break;
      case 'endLocationCity':
        reqHandler = 'reqHandlerEndCity';
        break;
      /*
      case 'endLocationState':
        reqHandler = 'reqHandlerEndState';
        break;
      */
      case 'endLocationZip':
        reqHandler = 'reqHandlerEndZip';
        break;
      default:
    }
    this.setState({
      [reqHandler]: {
        ...reqHandler,
        touched: false
      }
    });
    this.setState({[e.target.name]: e.target.value});
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
    this.setState({ jobStartDateTime: e });
  }

  handleMultiChange(data) {
    this.setState({
      material: data
    });
  }

  selectChange(data) {
    const {reqHandlerTruckType} = this.state;
    this.setState({
      reqHandlerTruckType: {
        ...reqHandlerTruckType,
        touched: false
      }
    });
    this.setState({truckType: data.value});
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
    const { profile } = this.state;
    if (profile && material) {
      const newMaterial = {
        jobsId: jobId,
        value: material,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
      /* eslint-disable no-await-in-loop */
      await JobMaterialsService.createJobMaterials(newMaterial);
    }
  }

  handleHourDetails(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  handleStartAddressChange(e) {
    this.handleSameAddresses();
    let reqHandler = '';
    switch (e.target.name) {
      case 'startLocationAddressName':
        reqHandler = 'reqHandlerStartAddressName';
        break;
      case 'startLocationAddress1':
        reqHandler = 'reqHandlerStartAddress';
        break;
      case 'startLocationCity':
        reqHandler = 'reqHandlerStartCity';
        break;
      case 'startLocationState':
        reqHandler = 'reqHandlerStartState';
        break;
      case 'startLocationZip':
        reqHandler = 'reqHandlerStartZip';
        break;
      default:
    }
    this.setState({
      [reqHandler]: {
        ...reqHandler,
        touched: false
      }
    });
    this.setState({[e.target.name]: e.target.value});
  }

  // remove non numeric
  phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  handleRateChange(e) {
    const {
      selectedRatedHourOrTon
    } = this.state;
    let {
      rateByTonValue,
      estimatedTons,
      rateByHourValue,
      estimatedHours
    } = this.state;

    if (selectedRatedHourOrTon === 'ton') {
      rateByHourValue = 0;
      estimatedHours = 0;
    } else if (selectedRatedHourOrTon === 'hour') {
      rateByTonValue = 0;
      estimatedTons = 0;
    }
    this.setState({
      rateByHourValue,
      estimatedHours,
      rateByTonValue,
      estimatedTons,
      selectedRatedHourOrTon: e.value
    });
  }

  handleSameAddresses() {
    const {reqHandlerSameAddresses} = this.state;
    this.setState({
      reqHandlerSameAddresses: {
        ...reqHandlerSameAddresses,
        touched: false
      }
    });
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
    this.handleSameAddresses();
    if (Number(data.value) !== 0) {
      this.setState({
        startLocationAddress1: '',
        startLocationAddress2: '',
        startLocationCity: '',
        startLocationState: '',
        startLocationZip: '',
        selectedStartAddressId: data.value,
        reqHandlerStartAddress: {
          touched: false
        },
        reqHandlerStartCity: {
          touched: false
        },
        reqHandlerStartState: {
          touched: false
        },
        reqHandlerStartZip: {
          touched: false
        }
      });
    } else if (Number(data.value) === 0) {
      this.setState({
        selectedStartAddressId: Number(data.value),
        reqHandlerStartAddress: {
          touched: true
        },
        reqHandlerStartCity: {
          touched: true
        },
        reqHandlerStartState: {
          touched: true
        },
        reqHandlerStartZip: {
          touched: true
        }
      });
    }
  }

  handleEndAddressIdChange(data) {
    this.handleSameAddresses();
    if (Number(data.value) !== 0) {
      this.setState({
        endLocationAddress1: '',
        endLocationAddress2: '',
        endLocationCity: '',
        endLocationState: '',
        endLocationZip: '',
        selectedEndAddressId: data.value,
        reqHandlerEndAddress: {
          touched: false
        },
        reqHandlerEndCity: {
          touched: false
        },
        reqHandlerEndState: {
          touched: false
        },
        reqHandlerEndZip: {
          touched: false
        }
      });
    } else if (Number(data.value) === 0) {
      this.setState({
        selectedEndAddressId: Number(data.value),
        reqHandlerEndAddress: {
          touched: true
        },
        reqHandlerEndCity: {
          touched: true
        },
        reqHandlerEndState: {
          touched: true
        },
        reqHandlerEndZip: {
          touched: true
        }
      });
    }
  }

  toggleNewStartAddress() {
    this.setState({ selectedStartAddressId: 0 });
  }

  toggleNewEndAddress() {
    this.setState({ selectedEndAddressId: 0 });
  }

  handleInputChange(e) {
    if (e.target.name === 'name') {
      this.setState({
        name: e.target.value,
        reqHandlerJobName: {
          touched: true
        }
      });
    } else {
      const {value} = e.target;
      this.setState({[e.target.name]: value});
    }
  }

  handleInputChangeTonHour(e) {
    if (e.target.name === 'estimatedTons') {
      this.setState({
        rateEstimate: e.target.value,
        estimatedTons: e.target.value,
        reqHandlerEstimatedTons: {
          touched: true
        }
      });
    } else if (e.target.name === 'rateByHourValue') {
      this.setState({
        rateByHourValue: e.target.value,
        reqHandlerHours: {
          touched: true
        }
      });
    } else if (e.target.name === 'rateByTonValue') {
      this.setState({
        rateByTonValue: e.target.value,
        reqHandlerTons: {
          touched: true
        }
      });
    } else if (e.target.name === 'estimatedHours') {
      this.setState({
        rateEstimate: e.target.value,
        estimatedHours: e.target.value,
        reqHandlerEstimatedHours: {
          touched: true
        }
      });
    }
  }

  // Pull materials
  async fetchMaterials() {
    this.saveTruckInfo(false);
    // let's cache this info, in case we want to go back
  }

  handleImg(e) {
    return e;
  }

  jobDateChange(data) {
    const {reqHandlerDate} = this.state;
    this.setState({
      jobDate: data,
      reqHandlerDate: Object.assign({}, reqHandlerDate, {
        touched: false
      })
    });
  }

  async isFormValid() {
    // const job = this.state;
    const {
      startLocationAddress1,
      startLocationCity,
      startLocationState,
      startLocationZip,

      // address 1
      endLocationAddress1,
      endLocationCity,
      endLocationState,
      endLocationZip,

      selectedStartAddressId,
      selectedEndAddressId,
      selectedRatedHourOrTon,
      rateByTonValue,
      rateByHourValue,
      name,
      jobStartDateTime,
      selectedTrucks,
      selectedMaterials,
      startLocationAddressName,
      endLocationAddressName,
    } = this.state;
    const {
      reqHandlerJobName,
      reqHandlerEndAddress,
      reqHandlerEndState,
      reqHandlerEndCity,
      reqHandlerEndZip,
      reqHandlerSameAddresses,
      reqHandlerStartAddress,
      reqHandlerStartCity,
      reqHandlerStartState,
      reqHandlerStartZip,
      reqHandlerTruckType,
      reqHandlerMaterials,
      reqHandlerDate,

      estimatedHours,
      estimatedTons,
      reqHandlerTons,
      reqHandlerEstimatedTons,
      reqHandlerHours,
      reqHandlerEstimatedHours,
      reqHandlerStartAddressName,
      reqHandlerEndAddressName
    } = this.state;
    let { jobDate } = this.state;
    let isValid = true;

    if (!selectedMaterials || selectedMaterials.length === 0) {
      this.setState({
        reqHandlerMaterials: {
          ...reqHandlerMaterials,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
    }

    if (name === '' || name === null) {
      this.setState({
        reqHandlerJobName: {
          ...reqHandlerJobName,
          touched: true,
          error: 'Please enter a name for your job'
        }
      });
      isValid = false;
    }

    if (!selectedTrucks || selectedTrucks.length === 0) {
      this.setState({
        reqHandlerTruckType: {
          ...reqHandlerTruckType,
          touched: true,
          error: 'Please select type of truck'
        }
      });
      isValid = false;
    }

    const currDate = new Date();

    if (!jobDate) {
      this.setState({
        reqHandlerDate: {
          ...reqHandlerDate,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
    }

    jobDate = new Date(jobDate);
    if (jobDate && jobDate.getTime() < currDate.getTime()) {
      this.setState({
        reqHandlerDate: {
          ...reqHandlerDate,
          touched: true,
          error: 'The date of the job can not be set in the past or as the current date and time'
        }
      });
      isValid = false;
    }

    // START ADDRESS VALIDATION

    if (!selectedStartAddressId || selectedStartAddressId === 0) {
      /* if (startLocationAddressName.length === 0) { // Commenting out in case we need this later
        this.setState({
          reqHandlerStartAddressName: {
            touched: true,
            error: 'Missing starting address name'
          }
        });
        isValid = false;
      } */

      if (startLocationAddress1.length === 0) {
        this.setState({
          reqHandlerStartAddress: {
            ...reqHandlerStartAddress,
            touched: true,
            error: 'Missing starting address field'
          }
        });
        isValid = false;
      }

      if (startLocationCity.length === 0) {
        this.setState({
          reqHandlerStartCity: {
            ...reqHandlerStartCity,
            touched: true,
            error: 'Missing starting city field'
          }
        });
        isValid = false;
      }

      if (startLocationZip.length === 0) {
        this.setState({
          reqHandlerStartZip: {
            ...reqHandlerStartZip,
            touched: true,
            error: 'Missing starting zip code field'
          }
        });
        isValid = false;
      }

      // only work if tab is 1
      if (startLocationState.length === 0) {
        this.setState({
          reqHandlerStartState: {
            ...reqHandlerStartState,
            touched: true,
            error: 'Missing starting state field'
          }
        });
        isValid = false;
      }
    }

    if (!selectedStartAddressId || selectedStartAddressId === 0) {
      const geoResponseStart = await this.getStartCoords();
      if (!geoResponseStart || geoResponseStart.features.length < 1
        || geoResponseStart.features[0].relevance < 0.90) {
        this.setState({
          reqHandlerStartAddress: {
            ...reqHandlerStartAddress,
            touched: true,
            error: 'Start address not found.'
          }
        });
        isValid = false;
      }
      if (typeof geoResponseStart.features[0] !== 'undefined') {
        const coordinates = geoResponseStart.features[0].center;
        const startLocationLatitude = coordinates[1];
        const startLocationLongitude = coordinates[0];
        this.setState({
          startLocationLatitude,
          startLocationLongitude
        });
      }
    }

    if (selectedEndAddressId > 0 && selectedStartAddressId > 0
      && selectedStartAddressId === selectedEndAddressId) {
      this.setState({
        reqHandlerSameAddresses: {
          ...reqHandlerSameAddresses,
          touched: true,
          error: "Can't have same start and end locations"
        }
      });
      isValid = false;
    }

    // END ADDRESS VALIDATION

    if (!selectedEndAddressId || selectedEndAddressId === 0) {
      /* if (endLocationAddressName.length === 0) { // Commenting out in case we need later
        this.setState({
          reqHandlerEndAddressName: {
            touched: true,
            error: 'Missing ending address name'
          }
        });
        isValid = false;
      } */

      if (endLocationAddress1.length === 0) {
        this.setState({
          reqHandlerEndAddress: {
            ...reqHandlerEndAddress,
            touched: true,
            error: 'Missing ending address field'
          }
        });
        isValid = false;
      }

      if (endLocationCity.length === 0) {
        this.setState({
          reqHandlerEndCity: {
            ...reqHandlerEndCity,
            touched: true,
            error: 'Missing ending city field'
          }
        });
        isValid = false;
      }

      if (endLocationState.length === 0) {
        this.setState({
          reqHandlerEndState: {
            ...reqHandlerEndState,
            touched: true,
            error: 'Missing ending state field'
          }
        });
        isValid = false;
      }

      if (endLocationZip.length === 0) {
        this.setState({
          reqHandlerEndZip: {
            ...reqHandlerEndZip,
            touched: true,
            error: 'Missing ending zip field'
          }
        });
        isValid = false;
      }
    }

    if (!selectedEndAddressId || selectedEndAddressId === 0) {
      const geoResponseEnd = await this.getEndCoords();
      if (!geoResponseEnd || geoResponseEnd.features.length < 1
        || geoResponseEnd.features[0].relevance < 0.90) {
        this.setState({
          reqHandlerEndAddress: {
            ...reqHandlerEndAddress,
            touched: true,
            error: 'End address not found.'
          }
        });
        isValid = false;
      }
      if (typeof geoResponseEnd.features[0] !== 'undefined') {
        const coordinates = geoResponseEnd.features[0].center;
        const endLocationLatitude = coordinates[1];
        const endLocationLongitude = coordinates[0];
        this.setState({
          endLocationLatitude,
          endLocationLongitude
        });
      }
    }

    // rates
    if (selectedRatedHourOrTon === 'ton') {
      if (rateByTonValue <= 0) {
        this.setState({
          reqHandlerTons: {
            ...reqHandlerTons,
            touched: true,
            error: 'Required input'
          }
        });
        isValid = false;
      }
      if (estimatedTons <= 0) {
        this.setState({
          reqHandlerEstimatedTons: {
            ...reqHandlerEstimatedTons,
            touched: true,
            error: 'Required input'
          }
        });
        isValid = false;
      }
    } else if (selectedRatedHourOrTon === 'hour') {
      if (rateByHourValue <= 0) {
        this.setState({
          reqHandlerHours: {
            ...reqHandlerHours,
            touched: true,
            error: 'Required input'
          }
        });
        isValid = false;
      }
      if (estimatedHours <= 0) {
        this.setState({
          reqHandlerEstimatedHours: {
            ...reqHandlerEstimatedHours,
            touched: true,
            error: 'Required input'
          }
        });
        isValid = false;
      }
    }

    return isValid;
  }

  renderHourOrTon(hourTon) {
    const {
      rateByTonValue,
      rateByHourValue,
      estimatedTons,
      estimatedHours,
      reqHandlerTons,
      reqHandlerEstimatedTons,
      reqHandlerHours,
      reqHandlerEstimatedHours
    } = this.state;
    if (hourTon === 'ton') {
      return (
        <React.Fragment>
          <div className="col-md-3 form__form-group">
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
              meta={reqHandlerTons}
            />
          </div>
          <div className="col-md-3 form__form-group">
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
              meta={reqHandlerEstimatedTons}
            />
          </div>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <div className="col-md-3 form__form-group">
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
            meta={reqHandlerHours}
          />
        </div>
        <div className="col-md-3 form__form-group">
          <span className="form__form-group-label">Estimated Hours</span>
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
            meta={reqHandlerEstimatedHours}
          />
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { closeModal, job } = this.props;
    const {
      btnSubmitting,
      jobName,
      jobStartDateTime,
      jobTruckType,
      allTruckTypes,

      selectedRatedHourOrTon,

      // materials
      allMaterials,
      selectedMaterials,

      selectedTrucks,
      allUSstates,
      allAddresses,
      selectedStartAddressId,
      selectedEndAddressId,
      hourTrucksNumber,
      endLocationAddress1,
      endLocationAddress2,
      endLocationCity,
      endLocationState,
      endLocationZip,
      jobDate,
      startLocationAddress1,
      startLocationAddress2,
      startLocationCity,
      startLocationState,
      startLocationZip,
      name,
      instructions,
      reqHandlerJobName,
      reqHandlerTruckType,
      reqHandlerMaterials,
      reqHandlerTrucksEstimate,
      reqHandlerStartAddress,
      reqHandlerStartCity,
      reqHandlerStartZip,
      reqHandlerStartState,
      reqHandlerEndAddress,
      reqHandlerEndState,
      reqHandlerEndZip,
      reqHandlerEndCity,
      reqHandlerSameAddresses,
      reqHandlerDate,
      startLocationAddressName,
      reqHandlerStartAddressName,
      endLocationAddressName,
      reqHandlerEndAddressName,
      profile,
      loaded
    } = this.state;
    if (loaded) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              {/* this.handleSubmit  */}
              <form
                className="form form--horizontal addtruck__form"
                // onSubmit={e => this.saveJob(e)}
                autoComplete="off"
              >
                <Row className="col-md-12">
                  <div className="col-md-12 form__form-group">
                    <span className="form__form-group-label">Job Name</span>
                    {
                      /*
                      <input
                      name="name"
                      type="text"
                      value={name}
                      onChange={this.handleInputChange}
                      placeholder="Job Name"
                      meta={reqHandlerJobName}
                    />
                      */
                    }
                    <TField
                      input={
                        {
                          onChange: this.handleInputChange,
                          name: 'name',
                          value: name
                        }
                      }
                      placeholder="Job Name"
                      type="text"
                      meta={reqHandlerJobName}
                      id="jobname"
                    />
                  </div>
                  <div className="col-md-12 form__form-group">
                    <span className="form__form-group-label">Date of Job&nbsp;
                      <span className="form-small-label">Your current time zone is set to&nbsp;
                        {profile.timeZone
                          ? moment().tz(profile.timeZone).format('z')
                          : moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('z')
                        }. Your timezone can be changed in <Link to="/settings"><span>User Settings</span></Link>.
                      </span>
                    </span>
                    <TDateTimePicker
                      input={
                        {
                          onChange: this.jobDateChange,
                          name: 'jobDate',
                          value: jobDate,
                          givenDate: jobDate
                        }
                      }
                      placeholder="Date and time of job"
                      defaultDate={jobDate}
                      onChange={this.jobDateChange}
                      dateFormat="Y-m-d H:i"
                      showTime
                      meta={reqHandlerDate}
                      id="jobstartdatetime"
                      profileTimeZone={profile.timeZone}
                    />
                  </div>
                </Row>

                <Row className="col-md-12">
                  <div className="col-md-3 form__form-group">
                    <span className="form__form-group-label">
                      Number of trucks
                    </span>
                    <TFieldNumber
                      input={
                        {
                          onChange: this.handleHourDetails,
                          name: 'hourTrucksNumber',
                          value: hourTrucksNumber
                        }
                      }
                      placeholder="Any"
                      allowUndefined
                      // meta={reqHandlerTrucksEstimate}
                    />
                  </div>
                  <div className="col-md-9 multitop">
                    <span className="form__form-group-label">Truck Type</span>
                    <MultiSelect
                      input={
                        {
                          onChange: this.handleTruckTypeChange,
                          name: 'selectedTrucks',
                          value: selectedTrucks
                        }
                      }
                      // meta={reqHandlerMaterials}
                      options={allTruckTypes}
                      placeholder="Truck type"
                      meta={reqHandlerTruckType}
                    />
                  </div>

                </Row>
                <Row className="col-md-12">
                  <div className="col-md-3 form__form-group">
                    <span className="form__form-group-label">Material</span>
                    <SelectField
                      input={
                        {
                          onChange: this.handleMaterialsChange,
                          name: 'materialType',
                          value: selectedMaterials
                        }
                      }
                      meta={reqHandlerMaterials}
                      value={selectedMaterials}
                      options={allMaterials}
                      placeholder="Select material"
                    />
                  </div>

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

                <Row className="col-md-12">
                  <hr/>
                  {/* <hr className="bighr"/> */}
                </Row>

                <Row className="col-md-12 rateTab">
                  <div className="col-md-6">
                    <h3 className="subhead">
                      Start Location
                    </h3>
                    <small>
                      Select a starting address:
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
                        value={selectedStartAddressId}
                        options={allAddresses}
                        placeholder="Select a location"
                        meta={reqHandlerSameAddresses}
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
                      <div className="form__form-group">
                        <TField
                          input={
                            {
                              onChange: this.handleStartAddressChange,
                              name: 'startLocationAddressName',
                              value: startLocationAddressName
                            }
                          }
                          placeholder="Address Name"
                          type="text"
                          meta={reqHandlerStartAddressName}
                        />
                      </div>
                      <div className="form__form-group">
                        <TField
                          input={
                            {
                              onChange: this.handleStartAddressChange,
                              name: 'startLocationAddress1',
                              value: startLocationAddress1
                            }
                          }
                          placeholder="Address 1"
                          type="text"
                          meta={reqHandlerStartAddress}
                        />
                      </div>
                      <div className="form__form-group">
                        <input
                          name="startLocationAddress2"
                          type="text"
                          value={startLocationAddress2}
                          onChange={this.handleStartAddressChange}
                          placeholder="Address 2"
                        />
                      </div>
                      <div className="form__form-group">
                        <TField
                          input={
                            {
                              onChange: this.handleStartAddressChange,
                              name: 'startLocationCity',
                              value: startLocationCity
                            }
                          }
                          placeholder="City"
                          type="text"
                          meta={reqHandlerStartCity}
                        />
                      </div>
                      <div className="form__form-group">
                        <SelectField
                          input={
                            {
                              onChange: this.handleStartLocationChange,
                              name: 'startLocationState',
                              value: startLocationState
                            }
                          }
                          placeholder="State"
                          meta={reqHandlerStartState}
                          value={startLocationState}
                          options={allUSstates}
                        />
                      </div>
                      <div className="form__form-group">
                        <TField
                          input={
                            {
                              onChange: this.handleStartAddressChange,
                              name: 'startLocationZip',
                              value: startLocationZip
                            }
                          }
                          placeholder="Zip"
                          type="text"
                          meta={reqHandlerStartZip}
                        />
                      </div>
                    </div>
                  </div>

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
                        value={selectedEndAddressId}
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
                      <div className="form__form-group">
                        <TField
                          input={
                            {
                              onChange: this.handleEndAddressChange,
                              name: 'endLocationAddressName',
                              value: endLocationAddressName
                            }
                          }
                          placeholder="Address Name"
                          type="text"
                          meta={reqHandlerEndAddressName}
                        />
                      </div>
                      <div className="form__form-group">
                        <TField
                          input={
                            {
                              onChange: this.handleEndAddressChange,
                              name: 'endLocationAddress1',
                              value: endLocationAddress1
                            }
                          }
                          placeholder="Address 1"
                          type="text"
                          meta={reqHandlerEndAddress}
                        />
                      </div>

                      <div className="form__form-group">
                        <input
                          name="endLocationAddress2"
                          type="text"
                          value={endLocationAddress2}
                          onChange={this.handleEndAddressChange}
                          placeholder="Address 2"
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="form__form-group">
                        <TField
                          input={
                            {
                              onChange: this.handleEndAddressChange,
                              name: 'endLocationCity',
                              value: endLocationCity
                            }
                          }
                          placeholder="City"
                          type="text"
                          meta={reqHandlerEndCity}
                        />
                      </div>
                      <div className="form__form-group">
                        <SelectField
                          input={
                            {
                              onChange: this.handleEndLocationChange,
                              name: 'endLocationState',
                              value: endLocationState
                            }
                          }
                          placeholder="State"
                          meta={reqHandlerEndState}
                          value={endLocationState}
                          options={allUSstates}
                        />
                      </div>
                      <div className="form__form-group">
                        <TField
                          input={
                            {
                              onChange: this.handleEndAddressChange,
                              name: 'endLocationZip',
                              value: endLocationZip
                            }
                          }
                          placeholder="Zip"
                          type="text"
                          meta={reqHandlerEndZip}
                        />
                      </div>
                    </div>
                  </div>
                </Row>
                {/* onSubmit={onSubmit} */}
                <Row className="col-md-12">
                  <div className="col-md-12 form__form-group">
                    <h3 className="subhead">
                      Instructions
                    </h3>
                  </div>
                  <div className="col-md-12 form__form-group">
                    <textarea
                      name="instructions"
                      type="text"
                      value={instructions}
                      onChange={this.handleInputChange}
                      placeholder="instructions"
                      maxLength="255"
                    />
                  </div>
                </Row>
                <hr/>
                <Row className="col-md-12">
                  <ButtonToolbar className="col-md-6 wizard__toolbar">
                    <Button color="minimal" className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => closeModal()}
                    >
                      Cancel
                    </Button>
                  </ButtonToolbar>
                  <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                    { job && (
                      <TSubmitButton
                        onClick={this.saveJob}
                        className="primaryButton"
                        loading={btnSubmitting}
                        loaderSize={10}
                        bntText="Update Job"
                      />
                    )}
                    { !job && (
                      <TSubmitButton
                        onClick={this.saveJob}
                        className="primaryButton"
                        loading={btnSubmitting}
                        loaderSize={10}
                        bntText="Request Carrier"
                      />
                    )}
                  </ButtonToolbar>
                </Row>

              </form>
            </CardBody>
          </Card>
        </Col>
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
  selectedCarrierId: PropTypes.number,
  // getAllMaterials: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  job: PropTypes.object,
  updateJobView: PropTypes.func
  // selectedMaterials: PropTypes.func.isRequired
};

JobCreateFormCarrier.defaultProps = {
  selectedCarrierId: null,
  job: null,
  updateJobView: null
  // getAllMaterials: PropTypes.func,
  // closeModal: PropTypes.bool
};

export default JobCreateFormCarrier;
