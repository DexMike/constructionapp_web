import React, {PureComponent} from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import {
  Card,
  CardBody,
  // Container,
  Col,
  Button,
  ButtonToolbar,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import SelectField from '../common/TSelect';
import LookupsService from '../../api/LookupsService';
import TDateTimePicker from '../common/TDateTimePicker';
import './jobs.css';
import TField from '../common/TField';
import TFieldNumber from '../common/TFieldNumber';
import AddressService from '../../api/AddressService';
import TSpinner from '../common/TSpinner';
import ProfileService from '../../api/ProfileService';
import GeoCodingService from '../../api/GeoCodingService';
import JobMaterialsService from '../../api/JobMaterialsService';

// import USstates from '../../utils/usStates';

class CreateJobFormOne extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      job: [],
      profile: [],
      userCompanyId: 0,
      // truck properties
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
      selectedRatedHourOrTon: '',
      tonnage: 0, // estimated amount of tonnage
      rateEstimate: 0,
      hourTrucksNumber: '',
      rateTab: 1,
      hourTon: '',
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

      reqHandlerRateType: {
        touched: false,
        error: ''
      },

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
      loaded: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleTruckTypeChange = this.handleTruckTypeChange.bind(this);
    this.handleMaterialsChange = this.handleMaterialsChange.bind(this);
    // this.handleTonnageDetails = this.handleTonnageDetails.bind(this);
    this.handleHourDetails = this.handleHourDetails.bind(this);
    this.handleStartAddressChange = this.handleStartAddressChange.bind(this);
    this.handleEndAddressChange = this.handleEndAddressChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.tabFirstPage = this.tabFirstPage.bind(this);
    this.tabSecondPage = this.tabSecondPage.bind(this);
    this.jobDateChange = this.jobDateChange.bind(this);
    this.goToSecondFromFirst = this.goToSecondFromFirst.bind(this);
    this.handleEndLocationChange = this.handleEndLocationChange.bind(this);
    this.handleStartLocationChange = this.handleStartLocationChange.bind(this);
    this.handleStartAddressIdChange = this.handleStartAddressIdChange.bind(this);
    this.handleEndAddressIdChange = this.handleEndAddressIdChange.bind(this);
    this.toggleNewStartAddress = this.toggleNewStartAddress.bind(this);
    this.toggleNewEndAddress = this.toggleNewEndAddress.bind(this);
    this.handleSameAddresses = this.handleSameAddresses.bind(this);
    this.handleRateChange = this.handleRateChange.bind(this);
    this.handleInputChangeTonHour = this.handleInputChangeTonHour.bind(this);
    this.getStartCoords = this.getStartCoords.bind(this);
    this.getEndCoords = this.getEndCoords.bind(this);
    this.saveJobDraft = this.saveJobDraft.bind(this);
    this.clearValidationLabels = this.clearValidationLabels.bind(this);
  }

  async componentDidMount() {
    const {firstTabData} = this.props;

    // should load all addresses even if already set
    const response = await AddressService.getAddresses();
    const profile = await ProfileService.getProfile();

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

    this.setState({allAddresses});

    // if we have preloaded info, let's set it
    if (Object.keys(firstTabData()).length > 0) {
      const p = firstTabData();
      if (p.status && p.status === 'Saved') { // 'Saved' job
        console.log(p);
        const materials = await JobMaterialsService.getJobMaterialsByJobId(p.id);
        let selectedMaterial = '';
        if (materials && materials.length > 0) {
          selectedMaterial = {
            label: materials[0].value,
            value: materials[0].value
          };
        }
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

        /* const jobDate = moment(p.startTime).tz(
          profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
        ); */
        /* let jobDate = moment(p.jobDate).format('YYYY-MM-DD HH:mm');
        jobDate = moment.tz(
          jobDate,
          profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
        ).utc().format();
        jobDate = new Date(jobDate);
        console.log(typeof jobDate);
        console.log(jobDate); */

        this.setState({
          // jobDate,
          allMaterials,
          allTruckTypes
        });
        this.setState({
          job: p,
          userCompanyId: p.userCompanyId,
          // truck properties
          truckType: p.equipmentType,
          // allTruckTypes: p.allTruckTypes,
          // capacity: p.capacity,
          // allMaterials: p.allMaterials,
          selectedMaterials: selectedMaterial,
          // rates
          rate: p.rate,
          ratebyBoth: p.ratebyBoth,
          tonnage: p.tonnage, // estimated amount of tonnage
          hourTrucksNumber: p.numEquipments || '',
          // rateTab: r.rateTab,
          // location
          selectedEndAddressId: p.endAddress,
          selectedStartAddressId: p.startAddress,
          // date
          jobDate: p.startTime,
          // job properties
          name: p.name,
          instructions: p.notes || '',

          // PUT back hour/ton
          selectedRatedHourOrTon: p.rateType.toLowerCase(),
          rateByTonValue: p.rate,
          rateByHourValue: p.rate,
          estimatedTons: p.rateEstimate,
          estimatedHours: p.rateEstimate
        });
      } else { // We are coming from the second tab
        // TODO -> There should be a way to map directly to state
        // this is not very nice
        p.jobDate = moment(p.jobDate).format('YYYY-MM-DD HH:mm');
        this.setState({
          userCompanyId: p.userCompanyId,
          // truck properties
          truckType: p.truckType,
          allTruckTypes: p.allTruckTypes,
          capacity: p.capacity,
          allMaterials: p.allMaterials,
          selectedMaterials: p.selectedMaterials,
          // rates
          rate: p.rate,
          ratebyBoth: p.ratebyBoth,
          tonnage: p.tonnage, // estimated amount of tonnage
          hourTrucksNumber: p.hourTrucksNumber,
          // rateTab: r.rateTab,
          // location
          selectedEndAddressId: p.selectedEndAddressId,
          endLocationAddress1: p.endLocationAddress1,
          endLocationAddress2: p.endLocationAddress2,
          endLocationCity: p.endLocationCity,
          endLocationState: p.endLocationState,
          endLocationZip: p.endLocationZip,
          endLocationLatitude: p.endLocationLatitude,
          endLocationLongitude: p.endLocationLongitude,
          startLocationLatitude: p.startLocationLatitude,
          startLocationLongitude: p.startLocationLongitude,
          selectedStartAddressId: p.selectedStartAddressId,
          startLocationAddress1: p.startLocationAddress1,
          startLocationAddress2: p.startLocationAddress2,
          startLocationCity: p.startLocationCity,
          startLocationState: p.startLocationState,
          startLocationZip: p.startLocationZip,
          startLocationAddressName: p.startLocationAddressName,
          endLocationAddressName: p.endLocationAddressName,
          // date
          jobDate: moment.tz(
            p.jobDate,
            profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
          ).utc().format(),

          // job properties
          name: p.name,
          instructions: p.instructions,

          // PUT back hour/ton
          selectedRatedHourOrTon: p.selectedRatedHourOrTon,
          rateByTonValue: p.rateByTonValue,
          rateByHourValue: p.rateByHourValue,
          estimatedTons: p.estimatedTons,
          estimatedHours: p.estimatedHours
        });
      }
    } else {
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

      /* const jobDate = moment().tz(
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).valueOf(); */

      this.setState({
        // jobDate,
        allMaterials,
        allTruckTypes
      });
    }

    // US states
    let states = await LookupsService.getLookupsByType('States');
    states = states.map(state => ({
      value: String(state.val1),
      label: state.val1
    }));

    this.setState({allUSstates: states, profile, loaded: true});
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.validateOnTabClick) {
      await this.goToSecondFromFirst();
    }
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
  }

  handleMaterialsChange(data) {
    const {reqHandlerMaterials} = this.state;
    this.setState({
      reqHandlerMaterials: {
        ...reqHandlerMaterials,
        touched: false
      }
    });
    this.setState({selectedMaterials: data});
  }

  handleTruckTypeChange(data) {
    const {reqHandlerTruckType} = this.state;
    this.setState({
      reqHandlerTruckType: {
        ...reqHandlerTruckType,
        touched: false
      }
    });
    this.setState({truckType: data});
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

  handleRateChange(e) {
    const {
      reqHandlerRateType
    } = this.state;
    let {
      selectedRatedHourOrTon,
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
    if (e) {
      selectedRatedHourOrTon = e.value;
    } else {
      selectedRatedHourOrTon = null;
    }
    this.setState({
      reqHandlerRateType: {
        ...reqHandlerRateType,
        touched: false
      },
      rateByHourValue,
      estimatedHours,
      rateByTonValue,
      estimatedTons,
      selectedRatedHourOrTon
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

  handleHourDetails(e) {
    // let reqHandler = '';
    // switch (e.target.name) {
    //   /*
    //   case 'rateEstimate':
    //     reqHandler = 'reqHandlerHoursEstimate';
    //     break;
    //   */
    //   case 'hourTrucksNumber':
    //     reqHandler = 'reqHandlerTrucksEstimate';
    //     break;
    //   default:
    // }
    // this.setState({
    //   [reqHandler]: {
    //     ...reqHandler,
    //     touched: false
    //   }
    // });
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

  async isFormValid() {
    this.clearValidationLabels();
    const job = this.state;
    const {rateTab} = this.state;
    const {
      // reqHandlerTonnage,
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
      reqHandlerRateType,
      reqHandlerDate,

      selectedRatedHourOrTon,
      rateByTonValue,
      rateByHourValue,
      estimatedTons,
      estimatedHours,
      reqHandlerTons,
      reqHandlerEstimatedTons,
      reqHandlerHours,
      reqHandlerEstimatedHours,
      reqHandlerStartAddressName,
      reqHandlerEndAddressName
    } = this.state;
    let isValid = true;
    if (!job.selectedMaterials || job.selectedMaterials.length === 0) {
      this.setState({
        reqHandlerMaterials: {
          ...reqHandlerMaterials,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
    }

    if (job.name === '' || job.name === null) {
      this.setState({
        reqHandlerJobName: {
          ...reqHandlerJobName,
          touched: true,
          error: 'Please enter a name for your job'
        }
      });
      isValid = false;
    }

    if (!job.truckType || job.truckType.length === 0) {
      this.setState({
        reqHandlerTruckType: {
          ...reqHandlerTruckType,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
    }

    const currDate = new Date();

    if (!job.jobDate) {
      this.setState({
        reqHandlerDate: {
          ...reqHandlerDate,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
    }
    if (job.jobDate && new Date(job.jobDate).getTime() < currDate.getTime()) {
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

    if (!job.selectedStartAddressId || job.selectedStartAddressId === 0) {
      /* if (job.startLocationAddressName.length === 0) { // Commenting out in the event that we need this back later
        this.setState({
          reqHandlerStartAddressName: {
            touched: true,
            error: 'Missing starting address name'
          }
        });
        isValid = false;
      } */

      if (job.startLocationAddress1.length === 0) {
        this.setState({
          reqHandlerStartAddress: {
            ...reqHandlerStartAddress,
            touched: true,
            error: 'Missing starting address field'
          }
        });
        isValid = false;
      }

      if (job.startLocationCity.length === 0) {
        this.setState({
          reqHandlerStartCity: {
            ...reqHandlerStartCity,
            touched: true,
            error: 'Missing starting city field'
          }
        });
        isValid = false;
      }

      if (job.startLocationZip.length === 0) {
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
      if (job.startLocationState.length === 0) {
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

    if (!job.selectedStartAddressId || job.selectedStartAddressId === 0) {
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

    if (job.selectedEndAddressId > 0 && job.selectedStartAddressId > 0
      && job.selectedStartAddressId === job.selectedEndAddressId) {
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

    if (!job.selectedEndAddressId || job.selectedEndAddressId === 0) {
      /* if (job.endLocationAddressName.length === 0) { // Commenting out in the event we need this later
        this.setState({
          reqHandlerEndAddressName: {
            touched: true,
            error: 'Missing ending address name'
          }
        });
        isValid = false;
      } */

      if (job.endLocationAddress1.length === 0) {
        this.setState({
          reqHandlerEndAddress: {
            ...reqHandlerEndAddress,
            touched: true,
            error: 'Missing ending address field'
          }
        });
        isValid = false;
      }

      if (job.endLocationCity.length === 0) {
        this.setState({
          reqHandlerEndCity: {
            ...reqHandlerEndCity,
            touched: true,
            error: 'Missing ending city field'
          }
        });
        isValid = false;
      }

      if (job.endLocationState.length === 0) {
        this.setState({
          reqHandlerEndState: {
            ...reqHandlerEndState,
            touched: true,
            error: 'Missing ending state field'
          }
        });
        isValid = false;
      }

      if (job.endLocationZip.length === 0) {
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

    if (!job.selectedEndAddressId || job.selectedEndAddressId === 0) {
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

    // if (job.hourTrucksNumber <= 0 && rateTab === 1) {
    //   this.setState({
    //     reqHandlerTrucksEstimate: {
    //       ...reqHandlerTrucksEstimate,
    //       touched: true,
    //       error: 'Required input'
    //     }
    //   });
    //   isValid = false;
    // }
    //
    // if (job.hourTrucksNumber <= 0 && rateTab === 1) {
    //   this.setState({
    //     reqHandlerTrucksEstimate: {
    //       ...reqHandlerTrucksEstimate,
    //       touched: true,
    //       error: 'Required input'
    //     }
    //   });
    //   isValid = false;
    // }

    // rates
    if (!selectedRatedHourOrTon || selectedRatedHourOrTon === '') {
      this.setState({
        reqHandlerRateType: {
          ...reqHandlerRateType,
          touched: true,
          error: 'Required input'
        }
      });
      isValid = false;
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

  clearValidationLabels() {
    const {
      reqHandlerEndAddressName,
      reqHandlerSameAddresses,
      reqHandlerJobName,
      reqHandlerDate,
      reqHandlerTruckType,
      reqHandlerMaterials,
      reqHandlerRateType,
      reqHandleTrucksEstimate,
      reqHandlerStartAddress,
      reqHandlerStartCity,
      reqHandlerStartZip,
      reqHandlerStartState,
      reqHandlerEndCity,
      reqHandlerEndZip,
      reqHandlerEndState,
      reqHandlerEndAddress,
      reqHandlerTons,
      reqHandlerEstimatedTons,
      reqHandlerHours,
      reqHandlerEstimatedHours,
      reqHandlerStartAddressName
    } = this.state;
    reqHandlerEndAddressName.touched = false;
    reqHandlerSameAddresses.touched = false;
    reqHandlerJobName.touched = false;
    reqHandlerDate.touched = false;
    reqHandlerTruckType.touched = false;
    reqHandlerMaterials.touched = false;
    reqHandlerRateType.touched = false;
    reqHandleTrucksEstimate.touched = false;
    reqHandlerStartAddress.touched = false;
    reqHandlerStartCity.touched = false;
    reqHandlerStartZip.touched = false;
    reqHandlerStartState.touched = false;
    reqHandlerEndCity.touched = false;
    reqHandlerEndZip.touched = false;
    reqHandlerEndState.touched = false;
    reqHandlerEndAddress.touched = false;
    reqHandlerTons.touched = false;
    reqHandlerEstimatedTons.touched = false;
    reqHandlerHours.touched = false;
    reqHandlerEstimatedHours.touched = false;
    reqHandlerStartAddressName.touched = false;
    this.setState({
      reqHandlerEndAddressName,
      reqHandlerSameAddresses,
      reqHandlerJobName,
      reqHandlerDate,
      reqHandlerTruckType,
      reqHandlerMaterials,
      reqHandlerRateType,
      reqHandleTrucksEstimate,
      reqHandlerStartAddress,
      reqHandlerStartCity,
      reqHandlerStartZip,
      reqHandlerStartState,
      reqHandlerEndCity,
      reqHandlerEndZip,
      reqHandlerEndState,
      reqHandlerEndAddress,
      reqHandlerTons,
      reqHandlerEstimatedTons,
      reqHandlerHours,
      reqHandlerEstimatedHours,
      reqHandlerStartAddressName
    });
  }

  async isDraftValid() {
    this.clearValidationLabels();
    const job = this.state;
    const {rateTab} = this.state;
    const {
      // reqHandlerTonnage,
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
      reqHandlerTrucksEstimate,
      reqHandlerDate,

      selectedRatedHourOrTon,
      rateByTonValue,
      rateByHourValue,
      estimatedTons,
      estimatedHours,
      reqHandlerTons,
      reqHandlerEstimatedTons,
      reqHandlerHours,
      reqHandlerEstimatedHours,
      reqHandlerStartAddressName,
      reqHandlerEndAddressName
    } = this.state;
    let isValid = true;

    const currDate = new Date();

    if (job.jobDate && (new Date(job.jobDate).getTime() < currDate.getTime())) {
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
    if ((!job.selectedStartAddressId || job.selectedStartAddressId === 0)
      && (job.startLocationAddressName.length > 0
        || job.startLocationAddress1.length > 0
        || job.startLocationCity.length > 0
        || job.startLocationZip.length > 0
        || job.startLocationState.length > 0)) {
      if (job.startLocationAddressName.length === 0) {
        this.setState({
          reqHandlerStartAddressName: {
            touched: true,
            error: 'Missing starting address name'
          }
        });
        isValid = false;
      }

      if (job.startLocationAddress1.length === 0) {
        this.setState({
          reqHandlerStartAddress: {
            ...reqHandlerStartAddress,
            touched: true,
            error: 'Missing starting address field'
          }
        });
        isValid = false;
      }

      if (job.startLocationCity.length === 0) {
        this.setState({
          reqHandlerStartCity: {
            ...reqHandlerStartCity,
            touched: true,
            error: 'Missing starting city field'
          }
        });
        isValid = false;
      }

      if (job.startLocationZip.length === 0) {
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
      if (job.startLocationState.length === 0) {
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

    if ((!job.selectedStartAddressId || job.selectedStartAddressId === 0)
    && (job.startLocationAddressName.length > 0
      || job.startLocationAddress1.length > 0
      || job.startLocationCity.length > 0
      || job.startLocationZip.length > 0
      || job.startLocationState.length > 0)) {
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

    if (job.selectedEndAddressId > 0 && job.selectedStartAddressId > 0
      && job.selectedStartAddressId === job.selectedEndAddressId) {
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
    if ((!job.selectedEndAddressId || job.selectedEndAddressId === 0)
    && (job.endLocationAddressName.length > 0
      || job.endLocationAddress1.length > 0
      || job.endLocationCity.length > 0
      || job.endLocationZip.length > 0
      || job.endLocationState.length > 0)) {
      if (job.endLocationAddressName.length === 0) {
        this.setState({
          reqHandlerEndAddressName: {
            touched: true,
            error: 'Missing ending address name'
          }
        });
        isValid = false;
      }

      if (job.endLocationAddress1.length === 0) {
        this.setState({
          reqHandlerEndAddress: {
            ...reqHandlerEndAddress,
            touched: true,
            error: 'Missing ending address field'
          }
        });
        isValid = false;
      }

      if (job.endLocationCity.length === 0) {
        this.setState({
          reqHandlerEndCity: {
            ...reqHandlerEndCity,
            touched: true,
            error: 'Missing ending city field'
          }
        });
        isValid = false;
      }

      if (job.endLocationState.length === 0) {
        this.setState({
          reqHandlerEndState: {
            ...reqHandlerEndState,
            touched: true,
            error: 'Missing ending state field'
          }
        });
        isValid = false;
      }

      if (job.endLocationZip.length === 0) {
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

    if ((!job.selectedEndAddressId || job.selectedEndAddressId === 0)
    && (job.endLocationAddressName.length > 0
      || job.endLocationAddress1.length > 0
      || job.endLocationCity.length > 0
      || job.endLocationZip.length > 0
      || job.endLocationState.length > 0)) {
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

  async handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({[`goTo${menuItem}`]: true});
    }
  }

  async saveTruck(e) {
    e.preventDefault();
    e.persist();
    const isValid = await this.isFormValid();
    if (!isValid) {
      // this.setState({ maxCapacityTouched: true });
      return;
    }
    this.saveTruckInfo(true);
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

  tabFirstPage() {
    // clear all data from tab 2
    this.setState({
      ratebyBoth: false,
      // rateByHour: true,
      // rateByTon: false,
      tonnage: 0,
      endLocationAddress1: '',
      endLocationAddress2: '',
      endLocationCity: '',
      endLocationState: '',
      endLocationZip: ''
    });
    this.setState({rateTab: 1});
  }

  tabSecondPage() {
    // clear all from tab 1
    this.setState({
      ratebyBoth: false,
      // rateByHour: false,
      // rateByTon: true,
      rateEstimate: 0,
      hourTrucksNumber: ''
    });
    this.setState({rateTab: 2});
  }

  async saveJobDraft() {
    this.setState({ btnSubmitting: true });
    const isValid = await this.isDraftValid();

    if (!isValid) {
      this.setState({ btnSubmitting: false });
      return;
    }
    const {saveJobDraft} = this.props;
    saveJobDraft(this.state);
  }

  async goToSecondFromFirst() {
    const {validateRes} = this.props;
    const isValid = await this.isFormValid();

    if (!isValid) {
      return;
    }
    validateRes(true);
    const {gotoSecond} = this.props;
    gotoSecond(this.state);
  }

  toggleNewStartAddress() {
    this.setState({selectedStartAddressId: 0});
  }

  toggleNewEndAddress() {
    this.setState({selectedEndAddressId: 0});
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
              meta={reqHandlerTons}
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
              meta={reqHandlerEstimatedTons}
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
            meta={reqHandlerHours}
          />
        </div>
        <div className="col-md-5 form__form-group">
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
    const {
      job,
      jobDate,
      profile,
      truckType,
      allTruckTypes,
      allMaterials,
      selectedMaterials,
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
      reqHandlerRateType,
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
      selectedRatedHourOrTon,
      startLocationAddressName,
      reqHandlerStartAddressName,
      endLocationAddressName,
      reqHandlerEndAddressName,
      loaded
    } = this.state;
    console.log(typeof jobDate);
    console.log(jobDate);
    const {onClose} = this.props;
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
                      onChange={this.jobDateChange}
                      dateFormat="yyyy-MM-dd hh:mm a"
                      showTime
                      meta={reqHandlerDate}
                      id="jobstartdatetime"
                      placeholder="Date and time of job"
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
                  <div className="col-md-4">
                    <span className="form__form-group-label">Truck Type</span>
                    <SelectField
                      input={
                        {
                          onChange: this.handleTruckTypeChange,
                          name: 'truckType',
                          value: truckType
                        }
                      }
                      meta={reqHandlerTruckType}
                      value={truckType}
                      options={allTruckTypes}
                      placeholder="Truck Type"
                    />
                  </div>
                  <div className="col-md-5 form__form-group">
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
                </Row>

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
                      meta={reqHandlerRateType}
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
                      placeholder="Rate"
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
                            onClick={onClose}
                    >
                      Cancel
                    </Button>
                  </ButtonToolbar>
                  <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                    <Button color="primary" type="button" disabled
                            className="previous"
                    >
                      Back
                    </Button>
                    {job.status !== 'Saved' && (
                      <Button
                        color="outline-primary"
                        className="next"
                        onClick={this.saveJobDraft}
                      >
                        Save Job
                      </Button>
                    )}
                    <Button
                      color="primary"
                      className="next"
                      onClick={this.goToSecondFromFirst}
                    >
                      Next
                    </Button>
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

CreateJobFormOne.propTypes = {
  // getJobFullInfo: PropTypes.func.isRequired,
  firstTabData: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  gotoSecond: PropTypes.func.isRequired,
  saveJobDraft: PropTypes.func.isRequired,
  validateOnTabClick: PropTypes.bool.isRequired,
  validateRes: PropTypes.func.isRequired
};

CreateJobFormOne.defaultProps = {};

export default CreateJobFormOne;
