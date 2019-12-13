import React, {Component} from 'react';
import {withTranslation} from 'react-i18next';
import {Link, Redirect} from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody, ButtonToolbar, Button
} from 'reactstrap';
import CloneDeep from 'lodash.clonedeep';
import JobMaterials from './JobWizardTabs/JobMaterials';
import PickupAndDelivery from './JobWizardTabs/PickupAndDelivery';
import TruckSpecs from './JobWizardTabs/TruckSpecs';
import HaulRate from './JobWizardTabs/HaulRate';
import Summary from './JobWizardTabs/Summary';
import ProfileService from '../../api/ProfileService';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';
import TField from '../common/TField';
import TDateTimePicker from '../common/TDateTimePicker';
import TSpinner from '../common/TSpinner';
import LookupsService from '../../api/LookupsService';
import GeoCodingService from '../../api/GeoCodingService';
import SendJob from './JobWizardTabs/SendJob';
import UserUtils from '../../api/UtilsService';
import GeoUtils from '../../utils/GeoUtils';

class JobWizard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      jobStartDate: null,
      jobEndDate: null,
      poNumber: '',
      minDate: null,
      topFormRef: React.createRef(),
      reqHandlerJobName: {
        touched: false,
        error: ''
      },
      reqHandlerStartDate: {
        touched: false,
        error: ''
      },
      reqHandlerEndDate: {
        touched: false,
        error: ''
      },
      tabMaterials: {
        quantityType: 'Ton',
        estMaterialPricing: '0.00',
        quantity: '0',
        allMaterials: [],
        selectedMaterial: {
          value: '',
          label: ''
        },
        selectedSubMaterial: {
          value: '',
          label: ''
        },
        reqHandlerMaterials: {
          touched: false,
          error: ''
        },
        reqHandlerQuantity: {
          touched: false,
          error: ''
        }
      },
      tabSend: {
        sendToMkt: true,
        sendToFavorites: true,
        showSendtoFavorites: false,
        favoriteCompanies: [],
        favoriteAdminTels: []
      },
      tabSummary: {
        instructions: ''
      },
      tabPickupDelivery: {
        allUSstates: [],
        allAddresses: [],
        selectedStartAddressId: 0,
        selectedEndAddressId: 0,
        startLocationAddressName: '',
        endLocationAddressName: '',
        endLocationAddress1: '',
        endLocationAddress2: '',
        endLocationCity: '',
        endLocationState: '',
        endLocationZip: '',
        endLocationLatitude: null,
        endLocationLongitude: null,
        startLocationAddress1: '',
        startLocationAddress2: '',
        startLocationCity: '',
        startLocationState: '',
        startLocationZip: '',
        startLocationLatitude: null,
        startLocationLongitude: null,
        avgDistanceEnroute: 0.00,
        avgDistanceReturn: 0.00,
        avgTimeEnroute: 0.00,
        avgTimeReturn: 0.00,
        startGPS: null,
        endGPS: null,
        reqHandlerSameAddresses: {
          touched: false,
          error: ''
        },
        reqHandlerStartAddressName: {
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
        reqHandlerStartState: {
          touched: false,
          error: ''
        },
        reqHandlerStartZip: {
          touched: false,
          error: ''
        },
        reqHandlerEndAddressName: {
          touched: false,
          error: ''
        },
        reqHandlerEndAddress: {
          touched: false,
          error: ''
        },
        reqHandlerEndCity: {
          touched: false,
          error: ''
        },
        reqHandlerEndState: {
          touched: false,
          error: ''
        },
        reqHandlerEndZip: {
          touched: false,
          error: ''
        }
      },
      tabTruckSpecs: {
        truckQuantity: '',
        allTruckTypes: [],
        selectedTruckTypes: [],
        reqHandlerTruckType: {
          touched: false,
          error: ''
        }
      },
      tabHaulRate: {
        payType: 'Ton',
        tripType: 'twoWay',
        roundType: 'down',
        ratePerPayType: '0.00',
        rateCalcVisibleDisabled: false,
        avgDistanceEnroute: 0.00,
        avgDistanceReturn: 0.00,
        avgTimeEnroute: 0.00,
        avgTimeReturn: 0.00,
        rateCalculator: {
          rateCalcOpen: false,
          estimateTypeRadio: 'ton',
          tripType: 'twoWay',
          roundType: 'down',
          numberOfLoads: 0,
          rateTypeRadio: 'ton',
          estimatedTons: 0,
          estimatedHours: 10,
          ratePerTon: '0.00',
          ratePerHour: '0.00',
          invalidAddress: false,
          truckCapacity: 22,
          travelTimeEnroute: '0.00',
          travelTimeReturn: '0.00',
          loadTime: '0.00',
          unloadTime: '0.00',
          oneWayCostTonMile: '0.00',
          twoWayCostMile: '0.00'
        }
      },
      page: 1,
      job: [],
      loaded: false,
      profile: []
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.gotoPage.bind(this);
    this.setPageNumber = this.setPageNumber.bind(this);
    this.goBack = this.goBack.bind(this);
    this.firstPage = this.firstPage.bind(this);
    this.secondPage = this.secondPage.bind(this);
    this.thirdPage = this.thirdPage.bind(this);
    this.fourthPage = this.fourthPage.bind(this);
    this.fifthPage = this.fifthPage.bind(this);
    this.sixthPage = this.sixthPage.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.validateAndSaveJobDraft = this.validateAndSaveJobDraft.bind(this);
    this.validateSend = this.validateSend.bind(this);
    this.handleChildInputChange = this.handleChildInputChange.bind(this);
    this.closeNow = this.closeNow.bind(this);
    this.getTruckTypes = this.getTruckTypes.bind(this);
    this.saveJobDraft = this.saveJobDraft.bind(this);
    this.saveJob = this.saveJob.bind(this);
    this.updateJobView = this.updateJobView.bind(this);
    this.validateMaterialsPage = this.validateMaterialsPage.bind(this);
    this.clearValidationMaterialsPage = this.clearValidationMaterialsPage.bind(this);
    this.jobStartDateChange = this.jobStartDateChange.bind(this);
    this.jobEndDateChange = this.jobEndDateChange.bind(this);
    this.isDraftValid = this.isDraftValid.bind(this);
    this.getStartCoords = this.getStartCoords.bind(this);
    this.getEndCoords = this.getEndCoords.bind(this);
    this.clearValidationLabels = this.clearValidationLabels.bind(this);
    this.checkPhoneFormat = this.checkPhoneFormat.bind(this);
    this.phoneToNumberFormat = this.phoneToNumberFormat.bind(this);
    this.validateMaterialsTab = this.validateMaterialsTab.bind(this);
    this.validateTruckSpecsTab = this.validateTruckSpecsTab.bind(this);
    this.validateHaulRateTab = this.validateHaulRateTab.bind(this);
    this.validateStartAddress = this.validateStartAddress.bind(this);
    this.validateEndAddress = this.validateEndAddress.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.validateTopForm = this.validateTopForm.bind(this);
    this.scrollToTopForm = this.scrollToTopForm.bind(this);
  }

  async componentDidMount() {
    const {tabMaterials, tabPickupDelivery, tabTruckSpecs, tabHaulRate, tabSummary} = this.state;
    let {name, jobStartDate, jobEndDate, poNumber} = this.state;
    const {jobEdit, jobEditSaved, copyJob, copiedJob} = this.props;

    let truckTypes;
    try {
      truckTypes = await LookupsService.getLookupsByType('EquipmentType');
    } catch (err) {
      console.error(err);
    }
    const allTruckTypes = [];
    Object.values(truckTypes)
      .forEach((itm) => {
        const inside = {
          label: itm.val1,
          value: String(itm.id)
        };
        allTruckTypes.push(inside);
      });
    tabTruckSpecs.allTruckTypes = allTruckTypes.filter(it => it.label !== 'Other');

    let profile;
    try {
      profile = await ProfileService.getProfile();
    } catch (err) {
      console.error(err);
    }

    // PICKUP AND DELIVERY TAB DATA
    // addresses
    let addressesResponse;
    try {
      addressesResponse = await AddressService.getAddressesByCompanyId(profile.companyId);
    } catch (err) {
      console.error(err);
    }
    const allAddresses = addressesResponse.data.map(address => ({
      value: String(address.id),
      label: `${address.name} - ${address.address1} ${address.city} ${address.zipCode}`
    }));
    tabPickupDelivery.allAddresses = allAddresses;
    // US states
    let states;
    try {
      states = await LookupsService.getLookupsByType('States');
    } catch (err) {
      console.error(err);
    }
    states = states.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));

    tabPickupDelivery.allUSstates = states;

    if (jobEdit || jobEditSaved || copyJob) {
      const {job} = this.props;
      // populate form with job data
      if (job) {
        // populate top part of job create
        name = job.name;
        jobStartDate = job.startTime;
        jobEndDate = job.endTime;
        poNumber = job.poNumber;
        // populate tabMaterials
        let materials;
        try {
          materials = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        } catch (err) {
          console.error(err);
        }
        if (materials && materials.length > 0) {
          tabMaterials.selectedMaterial = {value: materials[0].value, label: materials[0].value};
        }

        tabSummary.instructions = !job.notes ? '' : job.notes;

        tabMaterials.estMaterialPricing = !job.estMaterialPricing ? '0.00' : job.estMaterialPricing;
        tabMaterials.quantityType = job.amountType;
        tabMaterials.quantity = !job.rateEstimate ? '0.00' : job.rateEstimate;

        // populate pickup/delivery tab
        tabPickupDelivery.selectedStartAddressId = job.startAddress.id.toString();
        tabPickupDelivery.selectedEndAddressId = job.endAddress.id.toString();

        const startAddress = tabPickupDelivery.allAddresses.find(item => item.value === tabPickupDelivery.selectedStartAddressId);
        const startString = startAddress.label;

        const endAddress = tabPickupDelivery.allAddresses.find(item => item.value === tabPickupDelivery.selectedEndAddressId);
        const endString = endAddress.label;

        let startCoordinates;
        let endCoordinates;
        try {
          startCoordinates = await GeoUtils.getCoordsFromAddress(startString);
          endCoordinates = await GeoUtils.getCoordsFromAddress(endString);
        } catch (err) {
          console.error(err);
        }

        if (startCoordinates) {
          tabPickupDelivery.startGPS = startCoordinates;
          tabPickupDelivery.startLocationLatitude = startCoordinates.lat;
          tabPickupDelivery.startLocationLongitude = startCoordinates.lng;
        }

        if (endCoordinates) {
          tabPickupDelivery.endGPS = endCoordinates;
          tabPickupDelivery.endLocationLatitude = endCoordinates.lat;
          tabPickupDelivery.endLocationLongitude = endCoordinates.lng;
        }

        if (tabPickupDelivery.startLocationLatitude && tabPickupDelivery.startLocationLongitude
          && tabPickupDelivery.endLocationLatitude && tabPickupDelivery.endLocationLongitude) {
          const waypoint0 = `${tabPickupDelivery.startLocationLatitude},${tabPickupDelivery.startLocationLongitude}`;
          const waypoint1 = `${tabPickupDelivery.endLocationLatitude},${tabPickupDelivery.endLocationLongitude}`;
          const travelInfoEnroute = await GeoUtils.getDistance(waypoint0, waypoint1);
          const travelInfoReturn = await GeoUtils.getDistance(waypoint1, waypoint0);
          tabPickupDelivery.avgDistanceEnroute = (travelInfoEnroute.distance * 0.000621371192).toFixed(2);
          tabPickupDelivery.avgDistanceReturn = (travelInfoReturn.distance * 0.000621371192).toFixed(2);
          tabPickupDelivery.avgTimeEnroute = (parseInt(travelInfoEnroute.travelTime) / 3600).toFixed(2);
          tabPickupDelivery.avgTimeReturn = (parseInt(travelInfoReturn.travelTime) / 3600).toFixed(2);
        }

        // populate truck specs
        tabTruckSpecs.truckQuantity = job.numEquipments;
        let selectedTruckTypes;
        try {
          selectedTruckTypes = await JobService.getMaterialsByJobId(job.id);
        } catch (err) {
          console.error(err);
        }
        const mapSelectedTruckTypes = [];
        Object.values(selectedTruckTypes)
          .forEach((itm) => {
            Object.keys(allTruckTypes).map((propKey) => {
              if (allTruckTypes[propKey].label === itm) {
                mapSelectedTruckTypes.push(allTruckTypes[propKey].value);
              }
              return null;
            });
          });
        tabTruckSpecs.selectedTruckTypes = mapSelectedTruckTypes;

        // populate haul rate tab
        tabHaulRate.payType = job.rateType;
        tabHaulRate.ratePerPayType = !job.rate ? '0.00' : job.rate;
      }
    }

    // MATERIAL TAB DATA
    let allMaterials;
    try {
      allMaterials = await LookupsService.getLookupsByType('MaterialType');
    } catch (err) {
      console.error(err);
    }
    allMaterials = allMaterials.map(material => ({
      value: material.val1,
      label: material.val1
    }));

    tabMaterials.allMaterials = allMaterials;

    // TRUCK SPECS TAB DATA

    // we map the selected truck types to the allTruckTypes array to get the Lookup value
    // const selectedTruckTypes = await JobService.getMaterialsByJobId(p.id);
    // Object.values(selectedTruckTypes)
    //   .forEach((itm) => {
    //     let inside = {};
    //     Object.keys(allTruckTypes).map((propKey) => {
    //       if (allTruckTypes[propKey].label === itm) {
    //         inside = {
    //           label: itm,
    //           value: allTruckTypes[propKey].value
    //         };
    //         return inside;
    //       }
    //       return null;
    //     });
    //     mapSelectedTruckTypes.push(inside);
    //   });

    this.setState({
      profile,
      loaded: true,
      tabMaterials,
      tabPickupDelivery,
      tabTruckSpecs,
      name,
      jobStartDate,
      jobEndDate,
      poNumber,
      tabHaulRate,
      minDate: moment().format('MM/DD/YYYY')
    });
  }

  async getTruckTypes() {
    let truckTypes;
    try {
      truckTypes = await LookupsService.getLookupsByType('EquipmentType');
    } catch (err) {
      console.error(err);
    }
    const allTruckTypes = [];
    Object.values(truckTypes).forEach((itm) => {
      const inside = {
        label: itm.val1,
        value: String(itm.id)
      };
      allTruckTypes.push(inside);
    });
    // console.log('>>>GOT TRUCK TYPES', allTruckTypes);
    return allTruckTypes;
  }

  jobEndDateChange(data) {
    // return false;
    const { t } = { ...this.props };
    const translate = t;
    const {reqHandlerEndDate, jobStartDate, reqHandlerStartDate} = this.state;
    const currDate = new Date();

    if (data && (new Date(data).getTime() <= currDate.getTime())) {
      this.setState({
        jobEndDate: data,
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: translate('The end date of the job can not be set in the past or equivalent to the current date and time')
        }
      });
      return;
    }

    if (jobStartDate && (new Date(jobStartDate).getTime() >= new Date(data).getTime())) {
      this.setState({
        jobEndDate: data,
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: translate('The end date of the job can not be set in the past of or equivalent to the start date')
        }
      });
      return;
    }

    if (jobStartDate && (new Date(jobStartDate).getTime() >= currDate.getTime())) {
      this.setState({
        jobEndDate: data,
        reqHandlerEndDate: Object.assign({}, reqHandlerEndDate, {
          touched: false
        }),
        reqHandlerStartDate: Object.assign({}, reqHandlerStartDate, {
          touched: false
        })
      });
      return;
    }

    this.setState({
      jobEndDate: data,
      reqHandlerEndDate: Object.assign({}, reqHandlerEndDate, {
        touched: false
      })
    });
  }

  async validateTopForm() {
    const isValid = await this.validateSend();
    if (isValid) {
      await this.sixthPage();
    } else {
      this.scrollToTopForm();
    }
  }

  scrollToTopForm() {
    const {topFormRef} = this.state;
    topFormRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  validateMaterialsPage() {
    this.clearValidationMaterialsPage();
    const { t } = { ...this.props };
    const translate = t;
    const {tabMaterials} = {...this.state};
    let isValid = true;
    if (!tabMaterials.selectedMaterial || tabMaterials.selectedMaterial.length === 0) {
      tabMaterials.reqHandlerMaterials = {
        ...tabMaterials.reqHandlerMaterials,
        touched: true,
        error: translate('Required input')
      };
      this.setState({
        tabMaterials
      });
      isValid = false;
    }

    if (!tabMaterials.quantity || tabMaterials.quantity.length === 0) {
      tabMaterials.reqHandlerQuantity = {
        ...tabMaterials.reqHandlerQuantity,
        touched: true,
        error: translate('Required input')
      };
      this.setState({
        tabMaterials
      });
      isValid = false;
    }

    return isValid;
  }

  validateMaterialsTab() {
    const { t } = { ...this.props };
    const translate = t;
    const {tabMaterials} = {...this.state};
    const val = [];
    if (!tabMaterials.selectedMaterial || tabMaterials.selectedMaterial.value === '') {
      val.push(translate('Material Type'));
    }
    if (!tabMaterials.quantity || tabMaterials.quantity <= 0) {
      if (tabMaterials.quantityType === 'Hour') {
        val.push(translate('Estimated Hours'));
      } else {
        val.push(translate('Estimated Tons'));
      }
    }
    return val;
  }

  validateTruckSpecsTab() {
    const { t } = { ...this.props };
    const translate = t;
    const {tabTruckSpecs} = {...this.state};
    const val = [];
    if (!tabTruckSpecs.selectedTruckTypes || tabTruckSpecs.selectedTruckTypes.length === 0) {
      val.push(translate('At least one truck type'));
    }
    return val;
  }

  validateHaulRateTab() {
    const { t } = { ...this.props };
    const translate = t;
    const {tabHaulRate} = {...this.state};
    const val = [];
    if (!tabHaulRate.ratePerPayType || tabHaulRate.ratePerPayType <= 0) {
      val.push(translate('Missing haul rate'));
    }
    return val;
  }

  validateStartAddress() {
    const { t } = { ...this.props };
    const translate = t;
    const {tabPickupDelivery} = {...this.state};
    // const {startGPS} = {...this.state};
    const val = [];
    if ((!tabPickupDelivery.selectedStartAddressId || tabPickupDelivery.selectedStartAddressId === 0)
      && (tabPickupDelivery.startLocationAddress1.length === 0
        || tabPickupDelivery.startLocationCity.length === 0
        || tabPickupDelivery.startLocationZip.length === 0
        || tabPickupDelivery.startLocationState.length === 0)) {
      val.push(translate('Missing start address fields'));
    }

    if (tabPickupDelivery.selectedEndAddressId > 0 && tabPickupDelivery.selectedStartAddressId > 0
      && tabPickupDelivery.selectedStartAddressId === tabPickupDelivery.selectedEndAddressId) {
      val.push(translate('Same start and end addresses'));
    }

    if (val.length > 0) {
      return val;
    }

    if (!tabPickupDelivery.startGPS || !tabPickupDelivery.startGPS.lat
      || !tabPickupDelivery.startGPS.lng) {
      val.push(translate('Invalid start address'));
    }
    return val;
  }

  validateEndAddress() {
    const { t } = { ...this.props };
    const translate = t;
    const {tabPickupDelivery} = {...this.state};
    const val = [];
    // const {endGPS} = {...this.state};

    if ((!tabPickupDelivery.selectedEndAddressId || tabPickupDelivery.selectedEndAddressId === 0)
      && (tabPickupDelivery.endLocationAddress1.length === 0
        || tabPickupDelivery.endLocationCity.length === 0
        || tabPickupDelivery.endLocationZip.length === 0
        || tabPickupDelivery.endLocationState.length === 0)) {
      val.push(translate('Missing end address fields'));
    }

    if (val.length > 0) {
      return val;
    }

    if (!tabPickupDelivery.endGPS || !tabPickupDelivery.endGPS.lat
      || !tabPickupDelivery.endGPS.lng) {
      val.push(translate('Invalid end address'));
    }

    return val;
  }

  clearValidationMaterialsPage() {
    const {
      tabMaterials
    } = {...this.state};
    tabMaterials.reqHandlerMaterials.touched = false;
    tabMaterials.reqHandlerQuantity.touched = false;
    this.setState({
      tabMaterials
    });
  }

  updateJobView(newJob) {
    const {updateJobView, updateCopiedJob} = this.props;
    const {copiedJob, jobEditSaved, jobRequest} = this.state;
    
    console.log('creating?', jobRequest, newJob);
    if (copiedJob === true) {
      updateCopiedJob(newJob);
    }
    if (jobEditSaved === true) {
      updateJobView(newJob, null);
    }
    
    if (jobRequest === true) {
      console.log('created?');
      console.log('update?', updateJobView);
      updateJobView(newJob, null);
    }
    
  }

  //
  // updateJobView(newJob) {
  //   const {updateJobView} = this.props;
  //   if (updateJobView) {
  //     updateJobView(newJob, null);
  //   }
  // }

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

  handleChildInputChange(key, val) {
    this.setState({[key]: val});
  }

  async saveJobMaterials(jobId, material) {
    // const profile = await ProfileService.getProfile();
    const {profile} = this.state;
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
      try {
        await JobMaterialsService.createJobMaterials(newMaterial);
      } catch (err) {
        console.error(err);
      }
    }
  }

  async validateAndSaveJobDraft() {
    this.setState({btnSubmitting: true});
    let isValid = false;
    if (!await this.isDraftValid()) {
      this.setState({btnSubmitting: false});
    }
    isValid = true;
    // const {saveJobDraft} = this.props;
    if (isValid) {
      await this.saveJobDraft();
      this.setState({btnSubmitting: false});
      // this.closeNow();
    }
  }

  async getStartCoords() {
    const {
      tabPickupDelivery
    } = this.state;
    const startString = `${tabPickupDelivery.startLocationAddress1}, ${tabPickupDelivery.startLocationCity}, ${tabPickupDelivery.startLocationState}, ${tabPickupDelivery.startLocationZip}`;
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
      tabPickupDelivery
    } = this.state;
    const endString = `${tabPickupDelivery.endLocationAddress1}, ${tabPickupDelivery.endLocationCity}, ${tabPickupDelivery.endLocationState}, ${tabPickupDelivery.endLocationZip}`;
    // TODO -> do this without MapBox
    try {
      const geoResponseEnd = await GeoCodingService.getGeoCode(endString);
      return geoResponseEnd;
    } catch (err) {
      // console.log(err);
      return null;
    }
  }

  phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  clearValidationLabels() {
    const {
      tabPickupDelivery,
      reqHandlerJobName,
      reqHandlerStartDate,
      reqHandlerEndDate
    } = this.state;
    tabPickupDelivery.reqHandlerEndAddressName.touched = false;
    tabPickupDelivery.reqHandlerSameAddresses.touched = false;
    reqHandlerJobName.touched = false;
    reqHandlerStartDate.touched = false;
    reqHandlerEndDate.touched = false;
    tabPickupDelivery.reqHandlerStartAddress.touched = false;
    tabPickupDelivery.reqHandlerStartCity.touched = false;
    tabPickupDelivery.reqHandlerStartZip.touched = false;
    tabPickupDelivery.reqHandlerStartState.touched = false;
    tabPickupDelivery.reqHandlerEndCity.touched = false;
    tabPickupDelivery.reqHandlerEndZip.touched = false;
    tabPickupDelivery.reqHandlerEndState.touched = false;
    tabPickupDelivery.reqHandlerEndAddress.touched = false;
    tabPickupDelivery.reqHandlerStartAddressName.touched = false;
    this.setState({
      reqHandlerJobName,
      reqHandlerStartDate,
      reqHandlerEndDate,
      tabPickupDelivery
    });
  }

  async validateSend() {
    const { t } = { ...this.props };
    const translate = t;
    this.clearValidationLabels();
    const {
      name,
      jobStartDate,
      reqHandlerJobName,
      reqHandlerStartDate,
      jobEndDate,
      reqHandlerEndDate
    } = {...this.state};
    let isValid = true;
    if (!name || name === '') {
      this.setState({
        reqHandlerJobName: {
          ...reqHandlerJobName,
          touched: true,
          error: translate('Please enter a name for your job')
        }
      });
      isValid = false;
    }

    const currDate = new Date();
    if (!jobStartDate) {
      this.setState({
        reqHandlerStartDate: {
          ...reqHandlerStartDate,
          touched: true,
          error: translate('Required input')
        }
      });
      isValid = false;
    }
    if (jobStartDate && (new Date(jobStartDate).getTime() < currDate.getTime())) {
      this.setState({
        reqHandlerStartDate: {
          ...reqHandlerStartDate,
          touched: true,
          error: translate('The start date of the job can not be set in the past or as the current date and time')
        }
      });
      isValid = false;
    }

    if (!jobEndDate) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: translate('Required input')
        }
      });
      isValid = false;
    }

    if (jobEndDate && (new Date(jobEndDate).getTime() <= currDate.getTime())) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: translate('The end date of the job can not be set in the past or equivalent to the current date and time')
        }
      });
      isValid = false;
    }

    if (jobEndDate && (new Date(jobEndDate).getTime() <= new Date(jobStartDate).getTime())) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: translate('The end date of the job can not be set in the past of or equivalent to the start date')
        }
      });
      isValid = false;
    }

    return isValid;
  }

  async isDraftValid() {
    const { t } = { ...this.props };
    const translate = t;
    this.clearValidationLabels();
    const {
      name,
      jobStartDate,
      // reqHandlerTonnage,
      tabPickupDelivery,
      reqHandlerJobName,
      reqHandlerEndAddress,
      reqHandlerEndState,
      reqHandlerEndCity,
      reqHandlerEndZip,
      reqHandlerSameAddresses,
      reqHandlerStartAddressName,
      reqHandlerEndAddressName,
      reqHandlerStartAddress,
      reqHandlerStartCity,
      reqHandlerStartState,
      reqHandlerStartZip,
      reqHandlerStartDate
    } = {...this.state};
    let isValid = true;
    if (!name || name === '') {
      this.setState({
        reqHandlerJobName: {
          ...reqHandlerJobName,
          touched: true,
          error: translate('Please enter a name for your job')
        }
      });
      isValid = false;
    }

    const currDate = new Date();
    if (!jobStartDate) {
      this.setState({
        reqHandlerStartDate: {
          ...reqHandlerStartDate,
          touched: true,
          error: translate('Required input')
        }
      });
      isValid = false;
    }
    if (jobStartDate && (new Date(jobStartDate).getTime() < currDate.getTime())) {
      this.setState({
        reqHandlerStartDate: {
          ...reqHandlerStartDate,
          touched: true,
          error: translate('The start date of the job can not be set in the past or as the current date and time')
        }
      });
      isValid = false;
    }
    let goToAddressTab = false;

    // START ADDRESS VALIDATION
    if ((!tabPickupDelivery.selectedStartAddressId
      || tabPickupDelivery.selectedStartAddressId === 0)
      && (tabPickupDelivery.startLocationAddress1.length > 0
        || tabPickupDelivery.startLocationCity.length > 0
        || tabPickupDelivery.startLocationZip.length > 0
        || tabPickupDelivery.startLocationState.length > 0)) {
      if (tabPickupDelivery.startLocationAddress1.length === 0) {
        tabPickupDelivery.reqHandlerStartAddress = {
          ...reqHandlerStartAddress,
          touched: true,
          error: translate('Missing starting address field')
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.startLocationCity.length === 0) {
        tabPickupDelivery.reqHandlerStartCity = {
          ...reqHandlerStartCity,
          touched: true,
          error: translate('Missing starting city field')
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.startLocationZip.length === 0) {
        tabPickupDelivery.reqHandlerStartZip = {
          ...reqHandlerStartZip,
          touched: true,
          error: translate('Missing starting zip code field')
        };
        isValid = false;
        goToAddressTab = true;
      }

      // only work if tab is 1
      if (tabPickupDelivery.startLocationState.length === 0) {
        tabPickupDelivery.reqHandlerStartState = {
          ...reqHandlerStartState,
          touched: true,
          error: translate('Missing starting state field')
        };
        isValid = false;
        goToAddressTab = true;
      }
      this.setState({tabPickupDelivery});
    }

    if ((!tabPickupDelivery.selectedStartAddressId || tabPickupDelivery.selectedStartAddressId === 0)
      && (tabPickupDelivery.startLocationAddress1.length > 0
        || tabPickupDelivery.startLocationCity.length > 0
        || tabPickupDelivery.startLocationZip.length > 0
        || tabPickupDelivery.startLocationState.length > 0)) {
      const geoResponseStart = await this.getStartCoords();
      if (!geoResponseStart || geoResponseStart.features.length < 1
        || geoResponseStart.features[0].relevance < 0.90) {
        tabPickupDelivery.reqHandlerStartAddress = {
          ...reqHandlerStartAddress,
          touched: true,
          error: translate('Start address not found')
        };
        isValid = false;
        goToAddressTab = true;
        this.setState({tabPickupDelivery});
      }
      if (typeof geoResponseStart.features[0] !== 'undefined') {
        const coordinates = geoResponseStart.features[0].center;
        tabPickupDelivery.startLocationLatitude = coordinates[1];
        tabPickupDelivery.startLocationLongitude = coordinates[0];
        this.setState({
          tabPickupDelivery
        });
      }
    }

    if (tabPickupDelivery.selectedEndAddressId > 0 && tabPickupDelivery.selectedStartAddressId > 0
      && tabPickupDelivery.selectedStartAddressId === tabPickupDelivery.selectedEndAddressId) {
      tabPickupDelivery.reqHandlerSameAddresses = {
        ...reqHandlerSameAddresses,
        touched: true,
        error: translate("Can't have same start and end locations")
      };
      isValid = false;
      goToAddressTab = true;
      this.setState({
        tabPickupDelivery
      });
    }

    // END ADDRESS VALIDATION
    if ((!tabPickupDelivery.selectedEndAddressId || tabPickupDelivery.selectedEndAddressId === 0)
      && (tabPickupDelivery.endLocationAddress1.length > 0
        || tabPickupDelivery.endLocationCity.length > 0
        || tabPickupDelivery.endLocationZip.length > 0
        || tabPickupDelivery.endLocationState.length > 0)) {
      if (tabPickupDelivery.endLocationAddress1.length === 0) {
        tabPickupDelivery.reqHandlerEndAddress = {
          ...reqHandlerEndAddress,
          touched: true,
          error: translate('Missing ending address field')
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.endLocationCity.length === 0) {
        tabPickupDelivery.reqHandlerEndCity = {
          ...reqHandlerEndCity,
          touched: true,
          error: translate('Missing ending city field')
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.endLocationState.length === 0) {
        tabPickupDelivery.reqHandlerEndState = {
          ...reqHandlerEndState,
          touched: true,
          error: translate('Missing ending state field')
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.endLocationZip.length === 0) {
        tabPickupDelivery.reqHandlerEndZip = {
          ...reqHandlerEndZip,
          touched: true,
          error: translate('Missing ending zip field')
        };
        isValid = false;
        goToAddressTab = true;
      }
      this.setState({
        tabPickupDelivery
      });
    }

    if ((!tabPickupDelivery.selectedEndAddressId || tabPickupDelivery.selectedEndAddressId === 0)
      && (tabPickupDelivery.endLocationAddress1.length > 0
        || tabPickupDelivery.endLocationCity.length > 0
        || tabPickupDelivery.endLocationZip.length > 0
        || tabPickupDelivery.endLocationState.length > 0)) {
      const geoResponseEnd = await this.getEndCoords();
      if (!geoResponseEnd || geoResponseEnd.features.length < 1
        || geoResponseEnd.features[0].relevance < 0.90) {
        tabPickupDelivery.reqHandlerEndAddress = {
          ...reqHandlerEndAddress,
          touched: true,
          error: translate('End address not found')
        };
        isValid = false;
        goToAddressTab = true;
        this.setState({
          tabPickupDelivery
        });
      }
      if (typeof geoResponseEnd.features[0] !== 'undefined') {
        const coordinates = geoResponseEnd.features[0].center;
        tabPickupDelivery.endLocationLatitude = coordinates[1];
        tabPickupDelivery.endLocationLongitude = coordinates[0];
        this.setState({
          tabPickupDelivery
        });
      }
    }
    if (goToAddressTab) {
      this.secondPage();
    }

    return isValid;
  }


  // let's create a list of truck types that we want to save
  async saveJobTrucks(jobId, trucks) {
    const allTrucks = [];
    for (const truck of trucks) {
      const equipmentMaterial = {
        jobId,
        equipmentTypeId: Number(truck)
      };
      allTrucks.push(equipmentMaterial);
    }
    try {
      await JobMaterialsService.deleteJobEquipmentsByJobId(jobId);
      await JobMaterialsService.createJobEquipments(jobId, allTrucks);
    } catch (err) {
      console.error(err);
    }
  }

  checkPhoneFormat(phone) {
    const phoneNotParents = String(UserUtils.phoneToNumberFormat(phone));
    const areaCode3 = phoneNotParents.substring(0, 3);
    const areaCode4 = phoneNotParents.substring(0, 4);
    return !(areaCode3.includes('555') || areaCode4.includes('1555'));
  }


  async saveJob() {
    const {jobRequest, jobEdit, selectedCarrierId, job, copyJob} = this.props;
    this.setState({btnSubmitting: true});
    
    const {
      profile,
      tabSend,
      tabPickupDelivery,
      tabHaulRate,
      tabMaterials,
      name,
      jobEndDate,
      tabSummary,
      tabTruckSpecs,
      poNumber
    } = this.state;

    // Object to create a new Job
    const jobRequestObject = {
      job: {},
      address1: {},
      address2: {},
      requestedCarrierId: null,
      material: '',
      trucksIds: [],
      favoriteCarriersIds: [],
      sendToMkt: false
    };

    let {jobStartDate} = this.state;
    let status = 'Published';

    // start location
    let address1 = {
      id: null
    };
    if (tabPickupDelivery.selectedStartAddressId === 0) {
      address1 = {
        type: 'Delivery',
        name: tabPickupDelivery.startLocationAddressName,
        companyId: profile.companyId,
        address1: tabPickupDelivery.startLocationAddress1,
        address2: tabPickupDelivery.startLocationAddress2,
        city: tabPickupDelivery.startLocationCity,
        state: tabPickupDelivery.startLocationState,
        zipCode: tabPickupDelivery.startLocationZip,
        latitude: tabPickupDelivery.startLocationLatitude,
        longitude: tabPickupDelivery.startLocationLongitude,
        country: 'US',
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
    } else {
      address1.id = tabPickupDelivery.selectedStartAddressId;
    }
    // end location
    let address2 = {
      id: null
    };
    if (tabPickupDelivery.selectedEndAddressId === 0) {
      address2 = {
        type: 'Delivery',
        name: tabPickupDelivery.endLocationAddressName,
        companyId: profile.companyId,
        address1: tabPickupDelivery.endLocationAddress1,
        address2: tabPickupDelivery.endLocationAddress2,
        city: tabPickupDelivery.endLocationCity,
        state: tabPickupDelivery.endLocationState,
        zipCode: tabPickupDelivery.endLocationZip,
        latitude: tabPickupDelivery.endLocationLatitude,
        longitude: tabPickupDelivery.endLocationLongitude,
        country: 'US',
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
    } else {
      address2.id = tabPickupDelivery.selectedEndAddressId;
    }

    jobRequestObject.address1 = address1;
    jobRequestObject.address2 = address2;

    // job p
    let isFavorited = 0;
    if (tabSend.showSendtoFavorites) {
      isFavorited = 1;
    }

    const rateType = tabHaulRate.payType;
    const rate = tabHaulRate.ratePerPayType;
    const amountType = tabMaterials.quantityType;
    const rateEstimate = tabMaterials.quantity;

    // if both checks (Send to Mkt and Send to All Favorites) are selected
    if ((tabSend.showSendtoFavorites
      && (tabSend.sendToMkt === true || tabSend.sendToMkt === 1)
      && (tabSend.sendToFavorites === true || tabSend.sendToFavorites === 1))
      || jobRequest
    ) {
      status = 'Published And Offered';
    } else if (tabSend.showSendtoFavorites
      && (tabSend.sendToFavorites === true || tabSend.sendToFavorites === 1)) {
      // sending to All Favorites only
      status = 'On Offer';
    } else { // default
      status = 'Published';
    }

    if (selectedCarrierId && selectedCarrierId > 0) {
      status = 'On Offer';
    }

    let avgDistance = tabPickupDelivery.avgDistanceEnroute;
    // let's try and figure out the distance now, if it's not already calcutlated
    if (avgDistance !== 0) {
      if (address1.id !== 0 || address1.id !== null) {
        address1 = await AddressService.getAddressById(address1.id);
      }

      if (address2.id !== 0 || address2.id !== null) {
        address2 = await AddressService.getAddressById(address2.id);
      }

      try {
        const startAddressCoords = await GeoUtils.getCoordsFromAddress(
          `${address1.address1}, ${address1.city} ${address1.state} ${address1.zipCode}`
        );
        const endAddressCoords = await GeoUtils.getCoordsFromAddress(
          `${address2.address1}, ${address2.city} ${address2.state} ${address2.zipCode}`
        );
        const waypoint0 = `${startAddressCoords.lat},${startAddressCoords.lng}`;
        const waypoint1 = `${endAddressCoords.lat},${endAddressCoords.lng}`;
        const newDistance = await GeoUtils.getDistance(
          waypoint0, waypoint1
        );
        // convert to miles
        avgDistance = (newDistance.distance / 1609);
      } catch (e) {
        console.log("Error: Unable to obtain job's distance, avgDistance will be ignored", e);
      }
    }

    jobStartDate = moment(jobStartDate).format('YYYY-MM-DD HH:mm');
    const jobCreate = {
      companiesId: profile.companyId,
      name,
      status,
      isFavorited,
      startAddress: address1.id,
      endAddress: address2.id,
      avgDistance,
      startTime: moment.tz(
        jobStartDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format(),
      endTime: moment.tz(
        jobEndDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format(),
      numEquipments: tabTruckSpecs.truckQuantity,
      rateType,
      rate: rate.toString().replace(/,/g, ''),
      amountType,
      rateEstimate: rateEstimate.toString().replace(/,/g, ''),
      poNumber,
      estMaterialPricing: tabMaterials.estMaterialPricing.toString().replace(/,/g, ''),
      notes: tabSummary.instructions,
      createdBy: profile.userId,
      createdOn: moment.utc().format(),
      modifiedBy: profile.userId,
      modifiedOn: moment.utc().format()
    };

    jobRequestObject.job = jobCreate;
    jobRequestObject.material = tabMaterials.selectedMaterial.value;
    const equipments = [];
    for (const id of tabTruckSpecs.selectedTruckTypes) {
      equipments.push(Number(id));
    }
    jobRequestObject.trucksIds = equipments;
    
    console.log('new job', newJob);
    

    let newJob;

    newJob = await JobService.createNewJob(jobRequestObject);
    this.state.jobRequest = true;

    console.log('new', newJob);
    try {
      if (jobEdit) {
        console.log('to edit');
        jobCreate.id = job.id;
        this.state.jobEditSaved = true;
        newJob = await JobService.updateJob(jobCreate); // updating job
        if (newJob) {
          if (Object.keys(tabMaterials.selectedMaterial).length > 0) {
            // check if there's materials to add
            await this.saveJobMaterials(newJob.id, tabMaterials.selectedMaterial.value);
          }
          if (Object.keys(tabTruckSpecs.selectedTruckTypes).length > 0) {
            await this.saveJobTrucks(newJob.id, tabTruckSpecs.selectedTruckTypes);
          }
        }
        this.setState({ btnSubmitting: false });
        this.updateJobView(newJob, null);
        this.closeNow();
        return;
      }
    } catch (err) {
      console.error(err);
    }

    const favoriteCarriersIds = [];
    if (jobRequest) {
      jobRequestObject.requestedCarrierId = selectedCarrierId;
    } else {
      if (tabSend.showSendtoFavorites && tabSend.sendToFavorites) {
        for (const favCompany of tabSend.favoriteCompanies) {
          favoriteCarriersIds.push(favCompany.id);
        }
        jobRequestObject.favoriteCarriersIds = favoriteCarriersIds;
      }
      if (tabSend.sendToMkt) {
        jobRequestObject.sendToMkt = true;
      }
    }
    
    if (job && job.id) {
      jobCreate.id = job.id;
      console.log('jobCreate id', jobCreate.id);
    }

    try {
      // Checking if there's a saved job to update instead of creating a new one
      
      
      
      if (copyJob) {
        console.log('to copy');
        this.state.copiedJob = true;
        jobCreate.id = null;
        console.log('new job copied', newJob);
        newJob = await JobService.createNewJob(jobRequestObject);
        
        /*
        this.setState({ btnSubmitting: false });
        this.updateJobView(newJob);
        this.closeNow();
        return;
        */
      }
    } catch (e) {
      console.error(e);
    }
    
    this.setState({
      btnSubmitting: false
    });
    this.updateJobView(newJob);
    this.closeNow();
  }

  // Used to either store a Copied or 'Saved' job to the database
  async saveJobDraft() {
    const {jobEdit, jobEditSaved, job} = this.props;
    const {
      profile,
      tabPickupDelivery,
      tabHaulRate,
      tabMaterials,
      name,
      tabTruckSpecs,
      tabSummary
    } = this.state;
    let {jobStartDate, jobEndDate} = this.state;
    // start location
    let startAddress = {
      id: null
    };
    if (tabPickupDelivery.selectedStartAddressId > 0) {
      startAddress.id = tabPickupDelivery.selectedStartAddressId;
    }
    if (tabPickupDelivery.selectedStartAddressId === 0) {
      const address1 = {
        type: 'Delivery',
        name: tabPickupDelivery.startLocationAddressName,
        companyId: profile.companyId,
        address1: tabPickupDelivery.startLocationAddress1,
        address2: tabPickupDelivery.startLocationAddress2,
        city: tabPickupDelivery.startLocationCity,
        state: tabPickupDelivery.startLocationState,
        zipCode: tabPickupDelivery.startLocationZip,
        latitude: tabPickupDelivery.startLocationLatitude,
        longitude: tabPickupDelivery.startLocationLongitude,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
      try {
        startAddress = await AddressService.createAddress(address1);
      } catch (err) {
        console.error(err);
      }
    }
    // end location
    let endAddress = {
      id: null
    };
    if (tabPickupDelivery.selectedEndAddressId > 0) {
      endAddress.id = tabPickupDelivery.selectedEndAddressId;
    }
    if (tabPickupDelivery.selectedEndAddressId === 0) {
      const address2 = {
        type: 'Delivery',
        name: tabPickupDelivery.endLocationAddressName,
        companyId: profile.companyId,
        address1: tabPickupDelivery.endLocationAddress1,
        address2: tabPickupDelivery.endLocationAddress2,
        city: tabPickupDelivery.endLocationCity,
        state: tabPickupDelivery.endLocationState,
        zipCode: tabPickupDelivery.endLocationZip,
        latitude: tabPickupDelivery.endLocationLatitude,
        longitude: tabPickupDelivery.endLocationLongitude
      };
      try {
        endAddress = await AddressService.createAddress(address2);
      } catch (err) {
        console.error(err);
      }
    }

    // let rateType = '';
    // let rate = 0;
    // if (tabHaulRate.payType && tabHaulRate.payType.length > 0) {
    //   if (tabHaulRate.payType === 'Ton') {
    //     rateType = 'Ton';
    //     rate = Number(tabHaulRate.ratePerPayType);
    //     // d.rateEstimate = d.rateEstimate;
    //   } else {
    //     rateType = 'Hour';
    //     rate = Number(d.rateByHourValue);
    //     // d.rateEstimate = d.estimatedHours;
    //   }
    // }

    const rateType = tabHaulRate.payType;
    const rate = tabHaulRate.ratePerPayType;
    const amountType = tabMaterials.quantityType;
    const rateEstimate = tabMaterials.quantity;


    // const calcTotal = d.rateEstimate * rate;
    // const rateTotal = Math.round(calcTotal * 100) / 100;
    let jobStartDateForm = null;
    if (jobStartDate) {
      jobStartDateForm = new Date(jobStartDate);
    }

    let jobEndDateForm = null;
    if (jobEndDate) {
      jobEndDateForm = new Date(jobEndDate);
    }

    if (jobStartDate && jobStartDateForm && Date.parse(jobStartDateForm)) {
      jobStartDate = moment(jobStartDate).format('YYYY-MM-DD HH:mm');
      jobStartDate = moment.tz(
        jobStartDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
    } else {
      jobStartDate = '';
    }

    if (jobEndDate && jobEndDateForm && Date.parse(jobEndDateForm)) {
      jobEndDate = moment(jobEndDate).format('YYYY-MM-DD HH:mm');
      jobEndDate = moment.tz(
        jobEndDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
    } else {
      jobEndDate = '';
    }

    const jobDraft = {
      companiesId: profile.companyId,
      name,
      status: 'Saved',
      startAddress: startAddress.id,
      endAddress: endAddress.id,
      startTime: jobStartDate,
      endTime: jobEndDate,
      numEquipments: tabTruckSpecs.truckQuantity,
      estMaterialPricing: tabMaterials.estMaterialPricing.toString().replace(/,/g, ''),
      rateType,
      rate: rate.toString().replace(/,/g, ''),
      amountType,
      rateEstimate: rateEstimate.toString().replace(/,/g, ''),
      notes: tabSummary.instructions,
      createdBy: profile.userId,
      createdOn: moment.utc().format(),
      modifiedBy: profile.userId,
      modifiedOn: moment.utc().format()
    };

    let newJob = [];
    if (jobEdit || jobEditSaved) { // UPDATING 'Saved' JOB
      newJob = CloneDeep(jobDraft);
      newJob.id = job.id;
      delete newJob.createdBy;
      delete newJob.createdOn;
      newJob = await JobService.updateJob(newJob);
    } else { // CREATING NEW 'Saved' JOB
      try {
        newJob = await JobService.createJob(jobDraft); // creating new saved job
      } catch (err) {
        console.error(err);
      }
    }


    // add material
    if (newJob) {
      if (Object.keys(tabMaterials.selectedMaterial).length > 0) {
        // check if there's materials to add
        await this.saveJobMaterials(newJob.id, tabMaterials.selectedMaterial.value);
      }
      if (Object.keys(tabTruckSpecs.selectedTruckTypes).length > 0) {
        await this.saveJobTrucks(newJob.id, tabTruckSpecs.selectedTruckTypes);
      }
    }

    this.updateJobView(newJob);
    this.closeNow();

    // GO TO NEW JOB
    // this.setState({
    //   job: newJob,
    //   goToJobDetail: true
    // });

    // if (d.job.id) { // we're updating a Saved job, reload the view with new data
    //   this.updateJobView(newJob);
    //   this.closeNow();
    // } else {
    //   if (copyJob) {
    // user clicked on Copy Job, then tried to Save a new Job, reload the view with new data
    //     newJob.copiedJob = true;
    //     this.updateJobView(newJob);
    //     this.closeNow();
    //   } else { // user clicked on Save Job, go to new Job's Detail page
    //     this.setState({
    //       job: newJob,
    //       goToJobDetail: true
    //     });
    //   }
    // }
  }

  closeNow() {
    const {toggle} = this.props;
    
    toggle();
  }

  setPageNumber(page) {
    this.setState({page});
  }

  jobStartDateChange(data) {
    // return false;
    const { t } = { ...this.props };
    const translate = t;
    const {reqHandlerStartDate, reqHandlerEndDate, jobEndDate} = this.state;
    const currDate = new Date();

    if (data && (new Date(data).getTime() < currDate.getTime())) {
      this.setState({
        jobStartDate: data,
        reqHandlerStartDate: {
          ...reqHandlerStartDate,
          touched: true,
          error: translate('The start date of the job can not be set in the past or as the current date and time')
        }
      });
      return;
    }

    if (jobEndDate && (new Date(jobEndDate).getTime() <= new Date(data).getTime())) {
      this.setState({
        jobStartDate: data,
        reqHandlerStartDate: {
          ...reqHandlerStartDate,
          touched: true,
          error: translate('The start date of the job can not be set in the future of or equivalent to the end date')
        }
      });
      return;
    }

    if (jobEndDate && (new Date(jobEndDate).getTime() >= currDate.getTime())) {
      this.setState({
        jobStartDate: data,
        reqHandlerStartDate: Object.assign({}, reqHandlerStartDate, {
          touched: false
        }),
        reqHandlerEndDate: Object.assign({}, reqHandlerEndDate, {
          touched: false
        })
      });
      return;
    }

    this.setState({
      jobStartDate: data,
      reqHandlerStartDate: Object.assign({}, reqHandlerStartDate, {
        touched: false
      })
    });
  }

  validateForm() {
    const materialTabValidations = this.validateMaterialsTab();
    const truckSpecsTabValidations = this.validateTruckSpecsTab();
    const haulRateTabValidations = this.validateHaulRateTab();
    const startAddressValidations = this.validateStartAddress();
    const endAddressValidations = this.validateEndAddress();
    const valid = materialTabValidations.length === 0
      && truckSpecsTabValidations.length === 0
      && haulRateTabValidations.length === 0
      && startAddressValidations.length === 0
      && endAddressValidations.length === 0;
    const validationResponse = {
      valid,
      materialTabValidations,
      truckSpecsTabValidations,
      haulRateTabValidations,
      startAddressValidations,
      endAddressValidations
    };
    return validationResponse;
  }

  goBack() {
    const {page} = this.state;
    this.setState({page: page - 1});
  }

  firstPage() {
    this.setState({page: 1});
  }

  secondPage() {
    this.setState({page: 2});
  }

  thirdPage() {
    this.setState({page: 3});
  }

  fourthPage() {
    this.setState({page: 4});
  }

  fifthPage() {
    this.setState({page: 5});
  }

  async sixthPage() {
    const {jobEdit} = this.props;
    if (jobEdit) {
      await this.saveJob();
      return;
    }
    this.setState({page: 6});
  }

  nextPage() {
    const {page} = this.state;
    // just checking if the state changed
    this.setState({page: page + 1});
  }

  previousPage() {
    const {page} = this.state;
    this.setState({page: page - 1});
  }

  gotoPage(pageNumber) {
    this.setState({page: pageNumber});
  }

  renderTabs() {
    const { t } = { ...this.props };
    const translate = t;
    const {jobEdit} = this.props;
    const {
      page,
      loaded,
      tabHaulRate
    } = this.state;
    const validateResponse = this.validateForm();
    if (loaded) {
      return (
        <div className="wizard__steps">
          {/* onClick={this.gotoPage(1)} */}
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={!tabHaulRate.rateCalculator.rateCalcOpen ? this.firstPage : null}
            className={`wizard__step${(tabHaulRate.rateCalculator.rateCalcOpen) ? ' wizard__step--disabled' : ''}${page === 1 ? ' wizard__step--active' : ''}`}
          >
            <p>{translate('Pickup / Delivery')}</p>
          </div>
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={!tabHaulRate.rateCalculator.rateCalcOpen ? this.secondPage : null}
            className={`wizard__step${(tabHaulRate.rateCalculator.rateCalcOpen) ? ' wizard__step--disabled' : ''}${page === 2 ? ' wizard__step--active' : ''}`}
          >
            <p>{translate('Materials')}</p>
          </div>
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={!tabHaulRate.rateCalculator.rateCalcOpen ? this.thirdPage : null}
            className={`wizard__step${(tabHaulRate.rateCalculator.rateCalcOpen) ? ' wizard__step--disabled' : ''}${page === 3 ? ' wizard__step--active' : ''}`}
          >
            <p>{translate('Truck Specs')}</p>
          </div>
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.fourthPage}
            className={`wizard__step${page === 4 ? ' wizard__step--active' : ''}`}
          >
            <p>{translate('Haul Rate')}</p>
          </div>
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={!tabHaulRate.rateCalculator.rateCalcOpen ? this.fifthPage : null}
            className={`wizard__step${(tabHaulRate.rateCalculator.rateCalcOpen) ? ' wizard__step--disabled' : ''}${page === 5 ? ' wizard__step--active' : ''}`}
          >
            <p>{translate('Summary')}</p>
          </div>
          {!jobEdit && (
            <div
              role="link"
              tabIndex="0"
              onKeyPress={this.handleKeyPress}
              onClick={(validateResponse.valid && !tabHaulRate.rateCalculator.rateCalcOpen) ? this.validateTopForm : null}
              className={`wizard__step${(!validateResponse.valid || tabHaulRate.rateCalculator.rateCalcOpen) ? ' wizard__step--disabled' : ''}${page === 6 ? ' wizard__step--active ' : ''}`}
            >
              <p>{translate('Send')}</p>
            </div>
          )
          }
        </div>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>{translate('Loading')}...</Card>
          </Col>
        </Row>
      </Container>
    );
  }

  renderJobDetails() {
    const { t } = { ...this.props };
    const translate = t;
    const {
      jobStartDate,
      jobEndDate,
      profile,
      poNumber,
      name,
      reqHandlerJobName,
      reqHandlerStartDate,
      reqHandlerEndDate,
      loaded,
      minDate
    } = this.state;
    if (loaded) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              {/* this.handleSubmit  */}
              <form
                className="form form--horizontal addtruck__form"
                // onSubmit={e => this.saveTruck(e)}
                autoComplete="off"
              >
                <Row className="col-md-12">
                  <div className="col-md-12 form__form-group">
                    <span className="form__form-group-label">{translate('Job Name')}&nbsp;
                      <span style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}>
                        ( {translate('required')} )
                      </span>
                    </span>
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
                      placeholder={translate('Job Name')}
                      type="text"
                      meta={reqHandlerJobName}
                      id="jobname"
                    />
                  </div>
                </Row>
                <Row className="col-md-12">
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">{translate('Start Date / Time')}&nbsp;
                      <span style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}>
                        ( {translate('required')} )
                      </span>
                    </span>
                    <TDateTimePicker
                      input={
                        {
                          onChange: this.jobStartDateChange,
                          name: 'jobStartDate',
                          value: jobStartDate,
                          givenDate: jobStartDate
                        }
                      }
                      placeholder={translate('Date and time of job')}
                      defaultDate={jobStartDate}
                      minDate={minDate}
                      onChange={this.jobStartDateChange}
                      dateFormat="m/d/Y h:i K"
                      showTime
                      meta={reqHandlerStartDate}
                      id="jobstartdatetime"
                      profileTimeZone={profile.timeZone}
                    />
                  </div>
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">{translate('End Date / Time')}&nbsp;
                      <span style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}>
                        ( {translate('required')} )
                      </span>
                    </span>
                    <TDateTimePicker
                      input={
                        {
                          onChange: this.jobEndDateChange,
                          name: 'jobEndDate',
                          value: jobEndDate,
                          givenDate: jobEndDate
                        }
                      }
                      placeholder={translate('Date and time of job')}
                      defaultDate={jobEndDate}
                      minDate={minDate}
                      onChange={this.jobEndDateChange}
                      dateFormat="m/d/Y h:i K"
                      showTime
                      meta={reqHandlerEndDate}
                      id="jobenddatetime"
                      profileTimeZone={profile.timeZone}
                    />
                  </div>
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">{translate('PO Number')}</span>
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
                          name: 'poNumber',
                          value: poNumber
                        }
                      }
                      placeholder={translate('PO Number')}
                      type="text"
                      // meta={reqHandlerJobName}
                      id="poNumber"
                    />
                  </div>
                </Row>
                <Row className="col-md-12">
                  <div className="col-md-8 form__form-group">
                    <span className="form__form-group-label">
                      <span className="form-small-label">{translate('Your current time zone is set to')}&nbsp;
                        {profile.timeZone
                          ? moment().tz(profile.timeZone).format('z')
                          : moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('z')
                        }. {translate('Your timezone can be changed in')} <Link to="/settings"><span>{translate('User Settings')}</span></Link>.
                      </span>
                    </span>
                  </div>
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

  render() {
    const { t } = { ...this.props };
    const translate = t;
    const {jobRequest, jobEdit} = this.props;
    const {
      page,
      loaded,
      tabMaterials,
      tabPickupDelivery,
      tabTruckSpecs,
      tabHaulRate,
      tabSummary,
      tabSend,
      btnSubmitting,
      topFormRef
    } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="dashboard dashboard__job-create" style={{width: 900}}>
            {/* {this.renderGoTo()} */}
            <Card style={{paddingBottom: 0}}>
              <div className="wizard">
                <div className="wizard__steps">
                  {/* onClick={this.gotoPage(1)} */}
                  <div
                    className="wizard__step wizard__step--active"
                    ref={topFormRef}
                  >
                    <p>{jobRequest
                      ? `${translate('REQUEST_JOB')}`
                      : jobEdit
                        ? `${translate('EDIT_JOB')}`
                        : `${translate('CREATE_JOB')}`
                      }
                    </p>
                  </div>
                </div>
                <div className="wizard__form-wrapper">
                  <div className="dashboard dashboard__job-create-section">
                    {this.renderJobDetails()}
                  </div>
                </div>
                <div className="dashboard dashboard__job-create-section">
                  <div className="wizard">
                    {this.renderTabs()}
                    <div className="wizard__form-wrapper">
                      {page === 1
                      && (
                        <PickupAndDelivery
                          data={tabPickupDelivery}
                          handleInputChange={this.handleChildInputChange}
                        />
                      )}
                      {page === 2
                      && (
                      <JobMaterials
                        data={tabMaterials}
                        handleInputChange={this.handleChildInputChange}
                      />
                      )}
                      {page === 3
                      && (
                      <TruckSpecs
                        data={tabTruckSpecs}
                        handleInputChange={this.handleChildInputChange}
                      />
                      )}
                      {page === 4
                      && (
                      <HaulRate
                        closeModal={this.closeNow}
                        jobRequest={jobRequest}
                        jobEdit={jobEdit}
                        btnSubmitting={btnSubmitting}
                        goBack={this.goBack}
                        saveJob={this.validateAndSaveJobDraft}
                        nextPage={this.nextPage}
                        data={tabHaulRate}
                        tabMaterials={tabMaterials}
                        tabPickupDelivery={tabPickupDelivery}
                        handleInputChange={this.handleChildInputChange}
                        scrollToTopForm={this.scrollToTopForm}
                      />
                      )}
                      {page === 5
                      && (
                      <Summary
                        tabHaulRate={tabHaulRate}
                        tabMaterials={tabMaterials}
                        tabPickupDelivery={tabPickupDelivery}
                        tabTruckSpecs={tabTruckSpecs}
                        data={tabSummary}
                        closeModal={this.closeNow}
                        saveJob={this.validateAndSaveJobDraft}
                        goBack={this.goBack}
                        goToSend={this.sixthPage}
                        setPageNumber={this.setPageNumber}
                        handleInputChange={this.handleChildInputChange}
                        validateSend={this.validateSend}
                        jobRequest={jobRequest}
                        jobEdit={jobEdit}
                        validateMaterialsTab={this.validateMaterialsTab}
                        validateTruckSpecsTab={this.validateTruckSpecsTab}
                        validateHaulRateTab={this.validateHaulRateTab}
                        validateStartAddress={this.validateStartAddress}
                        validateEndAddress={this.validateEndAddress}
                        validateForm={this.validateForm}
                        validateTopForm={this.validateTopForm}
                      />
                      )}
                      {(page === 6 && !jobEdit)
                      && (
                      <SendJob
                        data={tabSend}
                        handleInputChange={this.handleChildInputChange}
                        tabMaterials={tabMaterials}
                        saveJob={this.validateAndSaveJobDraft}
                        goBack={this.goBack}
                        sendJob={this.saveJob}
                        onClose={this.closeNow}
                        jobRequest={jobRequest}
                      />
                      )}
                    </div>
                  </div>
                  {page < 4 && (
                  <React.Fragment>
                    <Row className="col-md-12">
                      <hr/>
                    </Row>
                    <Row className="col-md-12">
                      <ButtonToolbar className="col-md-4 wizard__toolbar">
                        <Button color="minimal" className="btn btn-outline-secondary"
                                type="button"
                                onClick={this.closeNow}
                        >
                          {translate('Cancel')}
                        </Button>
                      </ButtonToolbar>
                      <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                        {(!jobRequest && !jobEdit) && (
                        <Button
                          color="outline-primary"
                          className="next"
                          onClick={this.validateAndSaveJobDraft}
                          loading={btnSubmitting}
                          loaderSize={10}
                          disabled={btnSubmitting}
                        >
                          {
                            btnSubmitting ? (
                              <TSpinner
                                color="#808080"
                                loaderSize={10}
                                loading
                              />
                            ) : `${translate('Save Job & Close')}`
                          }
                        </Button>
                        )}
                        {page !== 1 && (
                        <Button color="outline-primary" type="button"
                                className="previous"
                                onClick={this.goBack}
                        >
                          {translate('Back')}
                        </Button>
                        )}
                        <Button
                          color="primary"
                          className="next"
                          onClick={this.nextPage}
                        >
                          {translate('Next')}
                        </Button>
                      </ButtonToolbar>
                    </Row>
                  </React.Fragment>
                  )}

                </div>
              </div>
            </Card>
          </div>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>Loading...</Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

JobWizard.propTypes = {
  toggle: PropTypes.func.isRequired,
  selectedCarrierId: PropTypes.number,
  jobRequest: PropTypes.bool,
  jobEdit: PropTypes.bool,
  jobEditSaved: PropTypes.bool,
  copyJob: PropTypes.bool,
  copiedJob: PropTypes.bool,
  job: PropTypes.object.isRequired,
  updateJobView: PropTypes.func,
  updateCopiedJob: PropTypes.func
  
};

JobWizard.defaultProps = {
  selectedCarrierId: null,
  jobRequest: false,
  jobEdit: false,
  jobEditSaved: false,
  copyJob: false,
  copiedJob: false,
  updateJobView: PropTypes.func,
  updateCopiedJob: false
};

export default withTranslation()(JobWizard);
