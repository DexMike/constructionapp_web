import React, {Component} from 'react';
import {Link, Redirect} from 'react-router-dom';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody, ButtonToolbar, Button
} from 'reactstrap';
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
import GeoCodingService from "../../api/GeoCodingService";
import SendJob from "./JobWizardTabs/SendJob";
import BidService from "../../api/BidService";
import TwilioService from "../../api/TwilioService";
import CompanyService from '../../api/CompanyService';
import UserUtils from "../../api/UtilsService";
import BookingService from "../../api/BookingService";
import UserService from "../../api/UserService";

class JobWizard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      jobStartDate: null,
      jobEndDate: null,
      poNumber: '',
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
        quantityType: 'ton',
        estMaterialPricing: 0,
        quantity: 0,
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
        instructions: '',
        startGPS: null,
        endGPS: null,
        avgDistanceEnroute: 0,
        avgTimeEnroute: 0,

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
        avgDistanceEnroute: 0,
        avgDistanceReturn: 0,
        avgTimeEnroute: 0,
        avgTimeReturn: 0,
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
        payType: 'ton',
        ratePerPayType: 0,
        rateCalcOpen: false,
        avgDistanceEnroute: 0,
        avgDistanceReturn: 0,
        avgTimeEnroute: 0,
        avgTimeReturn: 0,
        rateCalculator: {
          estimateTypeRadio: 'ton',
          rateTypeRadio: 'ton',
          estimatedTons: 0,
          estimatedHours: 10,
          ratePerTon: 0,
          ratePerHour: 0,
          invalidAddress: false,
          truckCapacity: 22,
          travelTimeEnroute: 0,
          travelTimeReturn: 0,
          loadTime: 0,
          unloadTime: 0
        }
      },
      page: 1,
      job: [],
      loaded: false,
      profile: [],
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
    // this.updateJobView = this.updateJobView.bind(this);
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
  }

  async componentDidMount() {
    const {tabMaterials, tabPickupDelivery, tabTruckSpecs} = this.state;
    const profile = await ProfileService.getProfile();

    // MATERIAL TAB DATA
    let allMaterials = await LookupsService.getLookupsByType('MaterialType');
    allMaterials = allMaterials.map(material => ({
      value: material.val1,
      label: material.val1
    }));

    tabMaterials.allMaterials = allMaterials;

    // PICKUP AND DELIVERY TAB DATA
    // addresses
    const addressesResponse = await AddressService.getAddressesByCompanyId(profile.companyId);
    const allAddresses = addressesResponse.data.map(address => ({
      value: String(address.id),
      label: `${address.name} - ${address.address1} ${address.city} ${address.zipCode}`
    }));

    tabPickupDelivery.allAddresses = allAddresses;
    // US states
    let states = await LookupsService.getLookupsByType('States');
    states = states.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));

    tabPickupDelivery.allUSstates = states;

    // TRUCK SPECS TAB DATA

    const allTruckTypes = await this.getTruckTypes();
    // we map the selected truck types to the allTruckTypes array to get the Lookup value
    // const selectedTruckTypes = await JobService.getMaterialsByJobId(p.id);
    const selectedTruckTypes = [];
    const mapSelectedTruckTypes = [];
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

    tabTruckSpecs.allTruckTypes = allTruckTypes;
    tabTruckSpecs.selectedTruckTypes = selectedTruckTypes;

    this.setState({profile, loaded: true, tabMaterials, tabPickupDelivery, tabTruckSpecs});
  }

  async getTruckTypes() {
    const truckTypes = await LookupsService.getLookupsByType('EquipmentType');
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

  jobStartDateChange(data) {
    // return false;
    const {reqHandlerStartDate} = this.state;
    this.setState({
      jobStartDate: data,
      reqHandlerStartDate: Object.assign({}, reqHandlerStartDate, {
        touched: false
      })
    });
  }

  jobEndDateChange(data) {
    // return false;
    const {reqHandlerEndDate} = this.state;
    this.setState({
      jobEndDate: data,
      reqHandlerEndDate: Object.assign({}, reqHandlerEndDate, {
        touched: false
      })
    });
  }

  validateMaterialsPage() {
    this.clearValidationMaterialsPage();
    const {tabMaterials} = {...this.state};
    let isValid = true;
    if (!tabMaterials.selectedMaterial || tabMaterials.selectedMaterial.length === 0) {
      tabMaterials.reqHandlerMaterials = {
        ...tabMaterials.reqHandlerMaterials,
        touched: true,
        error: 'Required input'
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
        error: 'Required input'
      };
      this.setState({
        tabMaterials
      });
      isValid = false;
    }

    return isValid;
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

  // updateJobView(newJob) {
  //   const {updateJobView, updateCopiedJob} = this.props;
  //   if (newJob.copiedJob) {
  //     updateCopiedJob(newJob);
  //   }
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
      await JobMaterialsService.createJobMaterials(newMaterial);
    }
  }

  async validateAndSaveJobDraft() {
    this.setState({btnSubmitting: true});
    let isValid = false;
    if (!await this.isDraftValid()) {
      this.setState({btnSubmitting: false});
      return;
    } else {
      isValid = true;
    }
    // const {saveJobDraft} = this.props;
    if (isValid) {
      await this.saveJobDraft();
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
    this.clearValidationLabels();
    const {
      name,
      jobStartDate,
      reqHandlerJobName,
      reqHandlerStartDate,
      jobEndDate,
      reqHandlerEndDate,
    } = {...this.state};
    let isValid = true;
    if (!name || name === '') {
      this.setState({
        reqHandlerJobName: {
          ...reqHandlerJobName,
          touched: true,
          error: 'Please enter a name for your job'
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
          error: 'Required input'
        }
      });
      isValid = false;
    }
    if (jobStartDate && (new Date(jobStartDate).getTime() < currDate.getTime())) {
      this.setState({
        reqHandlerStartDate: {
          ...reqHandlerStartDate,
          touched: true,
          error: 'The start date of the job can not be set in the past or as the current date and time'
        }
      });
      isValid = false;
    }

    if (!jobEndDate) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
    }

    if (jobEndDate && (new Date(jobEndDate).getTime() <= currDate.getTime())) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'The end date of the job can not be set in the past or equivalent to the current date and time'
        }
      });
      isValid = false;
    }

    if (jobEndDate && (new Date(jobEndDate).getTime() <= new Date(jobStartDate).getTime())) {
      this.setState({
        reqHandlerEndDate: {
          ...reqHandlerEndDate,
          touched: true,
          error: 'The end date of the job can not be set in the past of or equivalent to the start date'
        }
      });
      isValid = false;
    }

    return isValid;
  }

  async isDraftValid() {
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
      reqHandlerStartDate,
    } = {...this.state};
    let isValid = true;
    if (!name || name === '') {
      this.setState({
        reqHandlerJobName: {
          ...reqHandlerJobName,
          touched: true,
          error: 'Please enter a name for your job'
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
          error: 'Required input'
        }
      });
      isValid = false;
    }
    if (jobStartDate && (new Date(jobStartDate).getTime() < currDate.getTime())) {
      this.setState({
        reqHandlerStartDate: {
          ...reqHandlerStartDate,
          touched: true,
          error: 'The start date of the job can not be set in the past or as the current date and time'
        }
      });
      isValid = false;
    }
    let goToAddressTab = false;

    // START ADDRESS VALIDATION
    if ((!tabPickupDelivery.selectedStartAddressId || tabPickupDelivery.selectedStartAddressId === 0)
      && (tabPickupDelivery.startLocationAddressName.length > 0
        || tabPickupDelivery.startLocationAddress1.length > 0
        || tabPickupDelivery.startLocationCity.length > 0
        || tabPickupDelivery.startLocationZip.length > 0
        || tabPickupDelivery.startLocationState.length > 0)) {
      if (tabPickupDelivery.startLocationAddressName.length === 0) {
        tabPickupDelivery.reqHandlerStartAddressName = {
          ...reqHandlerStartAddressName,
          touched: true,
          error: 'Missing starting address name'
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.startLocationAddress1.length === 0) {
        tabPickupDelivery.reqHandlerStartAddress = {
          ...reqHandlerStartAddress,
          touched: true,
          error: 'Missing starting address field'
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.startLocationCity.length === 0) {
        tabPickupDelivery.reqHandlerStartCity = {
          ...reqHandlerStartCity,
          touched: true,
          error: 'Missing starting city field'
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.startLocationZip.length === 0) {
        tabPickupDelivery.reqHandlerStartZip = {
          ...reqHandlerStartZip,
          touched: true,
          error: 'Missing starting zip code field'
        };
        isValid = false;
        goToAddressTab = true;
      }

      // only work if tab is 1
      if (tabPickupDelivery.startLocationState.length === 0) {
        tabPickupDelivery.reqHandlerStartState = {
          ...reqHandlerStartState,
          touched: true,
          error: 'Missing starting state field'
        };
        isValid = false;
        goToAddressTab = true;
      }
      this.setState({tabPickupDelivery});
    }

    if ((!tabPickupDelivery.selectedStartAddressId || tabPickupDelivery.selectedStartAddressId === 0)
      && (tabPickupDelivery.startLocationAddressName.length > 0
        || tabPickupDelivery.startLocationAddress1.length > 0
        || tabPickupDelivery.startLocationCity.length > 0
        || tabPickupDelivery.startLocationZip.length > 0
        || tabPickupDelivery.startLocationState.length > 0)) {
      const geoResponseStart = await this.getStartCoords();
      if (!geoResponseStart || geoResponseStart.features.length < 1
        || geoResponseStart.features[0].relevance < 0.90) {
        tabPickupDelivery.reqHandlerStartAddress = {
          ...reqHandlerStartAddress,
          touched: true,
          error: 'Start address not found.'
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
        error: "Can't have same start and end locations"
      };
      isValid = false;
      goToAddressTab = true;
      this.setState({
        tabPickupDelivery
      });
    }

    // END ADDRESS VALIDATION
    if ((!tabPickupDelivery.selectedEndAddressId || tabPickupDelivery.selectedEndAddressId === 0)
      && (tabPickupDelivery.endLocationAddressName.length > 0
        || tabPickupDelivery.endLocationAddress1.length > 0
        || tabPickupDelivery.endLocationCity.length > 0
        || tabPickupDelivery.endLocationZip.length > 0
        || tabPickupDelivery.endLocationState.length > 0)) {
      if (tabPickupDelivery.endLocationAddressName.length === 0) {
        tabPickupDelivery.reqHandlerEndAddressName = {
          ...reqHandlerEndAddressName,
          touched: true,
          error: 'Missing ending address name'
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.endLocationAddress1.length === 0) {
        tabPickupDelivery.reqHandlerEndAddress = {
          ...reqHandlerEndAddress,
          touched: true,
          error: 'Missing ending address field'
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.endLocationCity.length === 0) {
        tabPickupDelivery.reqHandlerEndCity = {
          ...reqHandlerEndCity,
          touched: true,
          error: 'Missing ending city field'
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.endLocationState.length === 0) {
        tabPickupDelivery.reqHandlerEndState = {
          ...reqHandlerEndState,
          touched: true,
          error: 'Missing ending state field'
        };
        isValid = false;
        goToAddressTab = true;
      }

      if (tabPickupDelivery.endLocationZip.length === 0) {
        tabPickupDelivery.reqHandlerEndZip = {
          ...reqHandlerEndZip,
          touched: true,
          error: 'Missing ending zip field'
        };
        isValid = false;
        goToAddressTab = true;
      }
      this.setState({
        tabPickupDelivery
      });
    }

    if ((!tabPickupDelivery.selectedEndAddressId || tabPickupDelivery.selectedEndAddressId === 0)
      && (tabPickupDelivery.endLocationAddressName.length > 0
        || tabPickupDelivery.endLocationAddress1.length > 0
        || tabPickupDelivery.endLocationCity.length > 0
        || tabPickupDelivery.endLocationZip.length > 0
        || tabPickupDelivery.endLocationState.length > 0)) {
      const geoResponseEnd = await this.getEndCoords();
      if (!geoResponseEnd || geoResponseEnd.features.length < 1
        || geoResponseEnd.features[0].relevance < 0.90) {
        tabPickupDelivery.reqHandlerEndAddress = {
          ...reqHandlerEndAddress,
          touched: true,
          error: 'End address not found.'
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
    await JobMaterialsService.deleteJobEquipmentsByJobId(jobId);
    await JobMaterialsService.createJobEquipments(jobId, allTrucks);
  }

  checkPhoneFormat(phone) {
    const phoneNotParents = String(UserUtils.phoneToNumberFormat(phone));
    const areaCode3 = phoneNotParents.substring(0, 3);
    const areaCode4 = phoneNotParents.substring(0, 4);
    return !(areaCode3.includes('555') || areaCode4.includes('1555'));
  }


  async saveJob() {
    const {jobRequest, selectedCarrierId} = this.props;
    this.setState({btnSubmitting: true});
    // All validations happen by the summary page

    // if (!this.isFormValid()) {
    //   this.setState({btnSubmitting: false});
    //   return;
    // }
    // const {firstTabData, copyJob} = this.props;
    const {
      profile,
      tabSend,
      tabPickupDelivery,
      tabHaulRate,
      tabMaterials,
      name,
      jobEndDate,
      tabSummary,
      tabTruckSpecs
    } = this.state;

    let {jobStartDate} = this.state;

    let status = 'Published';

    // start location
    let startAddress = {
      id: null
    };
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
    } else {
      startAddress.id = tabPickupDelivery.selectedStartAddressId;
    }
    // end location
    let endAddress = {
      id: null
    };
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
    } else {
      endAddress.id = tabPickupDelivery.selectedEndAddressId;
    }

    // job p
    let isFavorited = 0;
    if (tabSend.showSendtoFavorites) {
      isFavorited = 1;
    }

    // let rateType = '';
    // let rate = 0;
    // if (d.selectedRatedHourOrTon === 'ton') {
    //   rateType = 'Ton';
    //   rate = Number(d.rateByTonValue);
    //   d.rateEstimate = d.rateEstimate;
    // } else {
    //   rateType = 'Hour';
    //   rate = Number(d.rateByHourValue);
    //   d.rateEstimate = d.rateEstimate;
    // }

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
      && (tabSend.sendToFavorites === true || tabSend.sendToFavorites === 1)) { // sending to All Favorites only
      status = 'On Offer';
    } else { // default
      status = 'Published';
    }

    // const calcTotal = d.rateEstimate * rate;
    // const rateTotal = Math.round(calcTotal * 100) / 100;

    jobStartDate = moment(jobStartDate).format('YYYY-MM-DD HH:mm');

    const job = {
      companiesId: profile.companyId,
      name,
      status,
      isFavorited,
      startAddress: startAddress.id,
      endAddress: endAddress.id,
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
      rate,
      amountType,
      rateEstimate,
      estMaterialPricing: tabMaterials.estMaterialPricing,
      notes: tabSummary.instructions,
      createdBy: profile.userId,
      createdOn: moment.utc().format(),
      modifiedBy: profile.userId,
      modifiedOn: moment.utc().format()
    };



    let newJob;
    try {
      newJob = await JobService.createJob(job); // creating new saved job
    } catch (err) {
      console.error(err);
    }
    // }

    // return false;

    // add materials
    if (newJob) {
      if (Object.keys(tabMaterials.selectedMaterial).length > 0) { // check if there's materials to add
        await this.saveJobMaterials(newJob.id, tabMaterials.selectedMaterial.value);
      }
      if (Object.keys(tabTruckSpecs.selectedTruckTypes).length > 0) {
        await this.saveJobTrucks(newJob.id, tabTruckSpecs.selectedTruckTypes);
      }
    }

    if (jobRequest) {
      const bid = {};
      const booking = {};
      // const bookingEquipment = {};

      // final steps
      bid.jobId = newJob.id;
      bid.userId = profile.userId;
      // bid.startAddress = createdJob.startAddress;
      // bid.endAddress = createdJob.endAddress;
      bid.companyCarrierId = selectedCarrierId;
      bid.rate = rate;
      bid.rateType = rateType;
      bid.rateEstimate = rateEstimate;
      bid.hasCustomerAccepted = 1;
      bid.hasSchedulerAccepted = 0;
      bid.status = 'Pending';
      bid.notes = tabSummary.instructions;
      bid.createdBy = profile.userId;
      bid.createdOn = moment.utc().format();
      bid.modifiedBy = profile.userId;
      bid.modifiedOn = moment.utc().format();
      const createdBid = await BidService.createBid(bid);

      // Now we need to create a Booking
      booking.bidId = createdBid.id;
      booking.schedulersCompanyId = selectedCarrierId.companyId;
      booking.rateType = newJob.rateType;
      booking.schedulersCompanyId = selectedCarrierId;
      booking.startTime = newJob.startTime;

      // if the startaddress is the actual ID
      if (Number.isInteger(newJob.startAddress)) {
        booking.sourceAddressId = newJob.startAddress;
        booking.startAddressId = newJob.startAddress;
      } else {
        booking.sourceAddressId = newJob.startAddress.id;
        booking.startAddressId = newJob.startAddress.id;
      }

      if (Number.isInteger(newJob.endAddress)) {
        booking.endAddressId = newJob.endAddress;
      } else {
        booking.endAddressId = newJob.endAddress.id;
      }


      // const createdBooking = await BookingService.createBooking(booking);

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
    } else {
      // create bids if this user has favorites:
      if (tabSend.showSendtoFavorites && tabSend.sendToFavorites && newJob) {
        const results = [];
        for (const favCompany of tabSend.favoriteCompanies) {
          // bid
          const bid = {
            jobId: newJob.id,
            userId: profile.userId,
            companyCarrierId: favCompany.id,
            hasCustomerAccepted: 1,
            hasSchedulerAccepted: 0,
            status: 'New',
            rateType,
            rate: 0,
            rateEstimate,
            notes: tabSummary.instructions,
            createdBy: profile.userId,
            createdOn: moment.utc().format(),
            modifiedBy: profile.userId,
            modifiedOn: moment.utc().format()
          };
          results.push(BidService.createBid(bid));
        }
        await Promise.all(results);

        // now let's send them an SMS to all favorites
        const allSms = [];
        for (const adminIdTel of tabSend.favoriteAdminTels) {
          if (adminIdTel && this.checkPhoneFormat(adminIdTel)) {
            // console.log('>>Sending SMS to Jake...');
            const notification = {
              to: this.phoneToNumberFormat(adminIdTel),
              body: '🚚 You have a new Trelar Job Offer available. Log into your Trelar account to review and accept. www.trelar.com'
            };
            allSms.push(TwilioService.createSms(notification));
          }
        }
        await Promise.all(allSms);
      }

      // if sending to mktplace, let's send SMS to everybody
      if (tabSend.sendToMkt) {
        const allBiddersSms = [];
        let nonFavoriteAdminTels = [];

        // Get non-favorites carriers admin phone numbers based on each
        // carrier company_settings.operatingRange setting.
        // startAddressId is used to calculate distance between carrier address and job start address.
        // If distance <= operatingRange then we sent the SMS
        const filters = {
          material: tabMaterials.selectedMaterial.value,
          startAddressId: startAddress.id
        };
        const nonFavoriteCarriers = await CompanyService.getNonFavoritesByUserId(
          profile.userId,
          filters
        );
        if (nonFavoriteCarriers.length > 0) {
          // get the phone numbers from the admins
          nonFavoriteAdminTels = nonFavoriteCarriers.map(x => (x.adminPhone ? x.adminPhone : null));
          // remove null values
          Object.keys(nonFavoriteAdminTels).forEach(
            key => (nonFavoriteAdminTels[key] === null) && delete nonFavoriteAdminTels[key]
          );
        }

        for (const bidderTel of nonFavoriteAdminTels) {
          if (bidderTel && this.checkPhoneFormat(bidderTel)) {
            const notification = {
              to: this.phoneToNumberFormat(bidderTel),
              body: '👷 A new Trelar Job is posted in your area. Log into your account to review and apply. www.trelar.com'
            };
            allBiddersSms.push(TwilioService.createSms(notification));
          }
        }
      }

      // const {onClose} = this.props;
      // if (savedJob) { // we have to update the view
      //   updateJobView(newJob);
      // }
      //
      // if (copyJob) { // we're making a duplicate of a job we have to update the view
      //   newJob.copiedJob = true;
      //   updateJobView(newJob);
      // }
    }
    this.setState({ btnSubmitting: false });

    this.closeNow();
  }

  // Used to either store a Copied or 'Saved' job to the database
  async saveJobDraft() {
    const {profile, tabPickupDelivery, tabHaulRate, tabMaterials, name, tabTruckSpecs, tabSummary} = this.state;
    let {jobStartDate, jobEndDate} = this.state;
    // start location
    let startAddress = {
      id: null
    };
    if (tabPickupDelivery.selectedStartAddressId > 0) {
      startAddress.id = tabPickupDelivery.selectedStartAddressId;
    }
    if (tabPickupDelivery.selectedStartAddressId === 0 && tabPickupDelivery.startLocationAddressName.length > 0) {
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
    if (tabPickupDelivery.selectedEndAddressId === 0 && tabPickupDelivery.endLocationAddressName.length > 0) {
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
    //   if (tabHaulRate.payType === 'ton') {
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

    if (jobStartDate && Object.prototype.toString.call(jobStartDate) === '[object Date]') {
      jobStartDate = moment(jobStartDate).format('YYYY-MM-DD HH:mm');
      jobStartDate = moment.tz(
        jobStartDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
    } else {
      jobStartDate = '';
    }

    if (jobEndDate && Object.prototype.toString.call(jobStartDate) === '[object Date]') {
      jobEndDate = moment(jobEndDate).format('YYYY-MM-DD HH:mm');
      jobEndDate = moment.tz(
        jobEndDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
    } else {
      jobEndDate = '';
    }

    const job = {
      companiesId: profile.companyId,
      name,
      status: 'Saved',
      startAddress: startAddress.id,
      endAddress: endAddress.id,
      startTime: jobStartDate,
      endTime: jobEndDate,
      numEquipments: tabTruckSpecs.truckQuantity,
      estMaterialPricing: tabMaterials.estMaterialPricing,
      rateType,
      rate,
      amountType,
      rateEstimate,
      notes: tabSummary.instructions,
      createdBy: profile.userId,
      createdOn: moment.utc().format(),
      modifiedBy: profile.userId,
      modifiedOn: moment.utc().format()
    };

    // let newJob = [];
    // if (d.job.id) { // UPDATING 'Saved' JOB
    //   newJob = CloneDeep(job);
    //   newJob.id = d.job.id;
    //   delete newJob.createdBy;
    //   delete newJob.createdOn;
    //   await JobService.updateJob(newJob);
    // } else { // CREATING NEW 'Saved' JOB
    //   newJob = await JobService.createJob(job);
    // }
    let newJob;
    try {
      newJob = await JobService.createJob(job); // creating new saved job
    } catch (err) {
      console.error(err);
    }

    // add material
    if (newJob) {
      if (Object.keys(tabMaterials.selectedMaterial).length > 0) { // check if there's materials to add
        await this.saveJobMaterials(newJob.id, tabMaterials.selectedMaterial.value);
      }
      if (Object.keys(tabTruckSpecs.selectedTruckTypes).length > 0) {
        await this.saveJobTrucks(newJob.id, tabTruckSpecs.selectedTruckTypes);
      }
    }

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
    //   if (copyJob) { // user clicked on Copy Job, then tried to Save a new Job, reload the view with new data
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

  goBack() {
    const {page} = this.state
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

  sixthPage() {
    this.setState({page: 6});
  }

  nextPage() {
    const {page} = this.state;
    // just checking if the state changeo
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
    const {
      page,
      loaded
    } = this.state;
    if (loaded) {
      return (
        <div className="wizard__steps">
          {/* onClick={this.gotoPage(1)} */}
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.firstPage}
            className={`wizard__step${page === 1 ? ' wizard__step--active' : ''}`}
          >
            <p>Materials</p>
          </div>
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.secondPage}
            className={`wizard__step${page === 2 ? ' wizard__step--active' : ''}`}
          >
            <p>Pickup / Delivery</p>
          </div>
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.thirdPage}
            className={`wizard__step${page === 3 ? ' wizard__step--active' : ''}`}
          >
            <p>Truck Specs</p>
          </div>
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.fourthPage}
            className={`wizard__step${page === 4 ? ' wizard__step--active' : ''}`}
          >
            <p>Haul Rate</p>
          </div>
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.fifthPage}
            className={`wizard__step${page === 5 ? ' wizard__step--active' : ''}`}
          >
            <p>Summary</p>
          </div>
          <div
            role="link"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            // onClick={this.sixthPage}
            className={`wizard__step${page === 6 ? ' wizard__step--active' : ''}`}
          >
            <p>Send</p>
          </div>
        </div>
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

  renderJobDetails() {
    const {
      jobStartDate,
      jobEndDate,
      profile,
      poNumber,
      name,
      reqHandlerJobName,
      reqHandlerStartDate,
      reqHandlerEndDate,
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
                // onSubmit={e => this.saveTruck(e)}
                autoComplete="off"
              >
                <Row className="col-md-12">
                  <div className="col-md-12 form__form-group">
                    <span className="form__form-group-label">Job Name
                    <span
                      style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}> ( required ) </span>
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
                      placeholder="Job Name"
                      type="text"
                      meta={reqHandlerJobName}
                      id="jobname"
                    />
                  </div>
                </Row>
                <Row className="col-md-12">
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">Start Date / Time&nbsp;
                      <span
                        style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}> ( required ) </span>
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
                      placeholder="Date and time of job"
                      defaultDate={jobStartDate}
                      onChange={this.jobStartDateChange}
                      dateFormat="m/d/Y h:i K"
                      showTime
                      meta={reqHandlerStartDate}
                      id="jobstartdatetime"
                      profileTimeZone={profile.timeZone}
                    />
                  </div>
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">End Date / Time&nbsp;
                      <span
                        style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}> ( required ) </span>
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
                      placeholder="Date and time of job"
                      defaultDate={jobEndDate}
                      onChange={this.jobEndDateChange}
                      dateFormat="m/d/Y h:i K"
                      showTime
                      meta={reqHandlerEndDate}
                      id="jobenddatetime"
                      profileTimeZone={profile.timeZone}
                    />
                  </div>
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">PO Number</span>
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
                      placeholder="PO Number"
                      type="text"
                      // meta={reqHandlerJobName}
                      id="poNumber"
                    />
                  </div>
                </Row>
                <Row className="col-md-12">
                  <div className="col-md-8 form__form-group">
                    <span className="form__form-group-label">
                    <span className="form-small-label">Your current time zone is set to&nbsp;
                      {profile.timeZone
                        ? moment().tz(profile.timeZone).format('z')
                        : moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('z')
                      }. Your timezone can be changed in <Link to="/settings"><span>User Settings</span></Link>.
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
    const {jobRequest} = this.props;
    const {
      page,
      loaded,
      tabMaterials,
      tabPickupDelivery,
      tabTruckSpecs,
      tabHaulRate,
      tabSummary,
      tabSend
    } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="dashboard dashboard__job-create" style={{width: 900}}>
            {/*{this.renderGoTo()}*/}
            <Row>
              {/* <h1>TEST</h1> */}
              <Col md={12} lg={12}>
                <Card style={{paddingBottom: 0}}>
                  <div className="wizard">
                    <div className="wizard__steps">
                      {/* onClick={this.gotoPage(1)} */}
                      <div
                        className="wizard__step wizard__step--active"
                      >
                        <p>{jobRequest ? 'Request' : 'Create'} Job</p>
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
                          && <JobMaterials
                            data={tabMaterials}
                            handleInputChange={this.handleChildInputChange}
                          />}
                          {page === 2
                          && <PickupAndDelivery
                            data={tabPickupDelivery}
                            handleInputChange={this.handleChildInputChange}
                          />}
                          {page === 3
                          && <TruckSpecs
                            data={tabTruckSpecs}
                            handleInputChange={this.handleChildInputChange}
                          />}
                          {page === 4
                          && <HaulRate
                            data={tabHaulRate}
                            tabMaterials={tabMaterials}
                            tabPickupDelivery={tabPickupDelivery}
                            handleInputChange={this.handleChildInputChange}
                          />}
                          {page === 5
                          && <Summary
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
                          />}
                          {page === 6
                          && <SendJob
                            data={tabSend}
                            handleInputChange={this.handleChildInputChange}
                            tabMaterials={tabMaterials}
                            saveJob={this.validateAndSaveJobDraft}
                            goBack={this.goBack}
                            sendJob={this.saveJob}
                            onClose={this.closeNow}
                            jobRequest={jobRequest}
                          />}
                        </div>
                      </div>
                      {page < 5 &&
                      <React.Fragment>
                        <Row className="col-md-12">
                          <hr/>
                        </Row>
                        <Row className="col-md-12">
                          <ButtonToolbar className="col-md-6 wizard__toolbar">
                            <Button color="minimal" className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={this.closeNow}
                            >
                              Cancel
                            </Button>
                          </ButtonToolbar>
                          <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                            {!jobRequest &&
                            <Button
                              color="outline-primary"
                              className="next"
                              onClick={this.validateAndSaveJobDraft}
                            >
                              Save Job & Close
                            </Button>
                            }
                            {page !== 1 &&
                            <Button color="outline-primary" type="button"
                                    className="previous"
                                    onClick={this.goBack}
                            >
                              Back
                            </Button>
                            }
                            <Button
                              color="primary"
                              className="next"
                              onClick={this.nextPage}
                            >
                              Next
                            </Button>
                          </ButtonToolbar>
                        </Row>
                      </React.Fragment>
                      }

                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
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
  jobRequest: PropTypes.bool
};

JobWizard.defaultProps = {
  selectedCarrierId: null,
  jobRequest: false
};


export default JobWizard;
