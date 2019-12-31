import React, {PureComponent} from 'react';
import {
  Button,
  Card,
  CardBody,
  // Container,
  Col,
  Row,
  Input, ButtonToolbar
} from 'reactstrap';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import '../jobs.css';
import ReactTooltip from 'react-tooltip';
import TField from '../../common/TField';
import TSpinner from '../../common/TSpinner';
import DeliveryCostsSummary from './DeliveryCostsSummary';
import TFormat from '../../common/TFormat';
import TCalculator from '../../common/TCalculator';
import ToggleButton from '../../common/ToggleButton';


// import USstates from '../../utils/usStates';

class HaulRate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
    this.handlePayTypeChange = this.handlePayTypeChange.bind(this);
    this.handleTripTypeChange = this.handleTripTypeChange.bind(this);
    this.handleRoundTypeChange = this.handleRoundTypeChange.bind(this);
    this.handleRatePerPayType = this.handleRatePerPayType.bind(this);
    this.toggleRateCalc = this.toggleRateCalc.bind(this);
    this.handleLoadTimeChange = this.handleLoadTimeChange.bind(this);
    this.handleUnloadTimeChange = this.handleUnloadTimeChange.bind(this);
    this.handleEnrouteTravelTimeChange = this.handleEnrouteTravelTimeChange.bind(this);
    this.handleTruckCapacityChange = this.handleTruckCapacityChange.bind(this);
    this.handleReturnTravelTimeChange = this.handleReturnTravelTimeChange.bind(this);
    this.handleSetEstimateType = this.handleSetEstimateType.bind(this);
    this.handleSetRateType = this.handleSetRateType.bind(this);
    this.handleRateHoursChange = this.handleRateHoursChange.bind(this);
    this.handleRateTonsChange = this.handleRateTonsChange.bind(this);
    this.handleEstimatedTonsChange = this.handleEstimatedTonsChange.bind(this);
    this.handleEstimatedHoursChange = this.handleEstimatedHoursChange.bind(this);
    this.handleOffClick = this.handleOffClick.bind(this);
    this.handleOneWayCostChange = this.handleOneWayCostChange.bind(this);
    this.handleTwoWayCostChange = this.handleTwoWayCostChange.bind(this);
    this.handleUpdateRates = this.handleUpdateRates.bind(this);
    this.applyCalculations = this.applyCalculations.bind(this);
  }

  async componentDidMount() {
    const {data, tabPickupDelivery, tabMaterials} = {...this.props};
    if (!tabPickupDelivery.startLocationLatitude || !tabPickupDelivery.startLocationLongitude
      || !tabPickupDelivery.endLocationLatitude || !tabPickupDelivery.endLocationLongitude) {
      data.rateCalculator.invalidAddress = true;
      if (tabMaterials.quantityType === 'Ton') {
        data.rateCalculator.estimatedTons = tabMaterials.quantity;
      } else if (tabMaterials.quantityType === 'Hour') {
        data.rateCalculator.estimatedHours = tabMaterials.quantity;
      }
    } else {
      data.rateCalculator.invalidAddress = false;
      data.rateCalculator.travelTimeEnroute = tabPickupDelivery.avgTimeEnroute;
      data.rateCalculator.travelTimeReturn = tabPickupDelivery.avgTimeReturn;
      data.rateCalculator.loadTime = 0.25;
      data.rateCalculator.unloadTime = 0.25;
      const oneLoad = data.rateCalculator.tripType === 'oneWay'
        ? TCalculator.getOneWayTripTime(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime)
        )
        : TCalculator.getRoundTripTime(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.travelTimeReturn),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime)
        );
      if (tabMaterials.quantityType === 'Hour') {
        data.rateCalculator.estimatedHours = tabMaterials.quantity;
        const numTrips = Math.floor(data.rateCalculator.estimatedHours / oneLoad);
        data.rateCalculator.estimatedTons = (numTrips * data.rateCalculator.truckCapacity).toFixed(2);
      } else if (tabMaterials.quantityType === 'Ton') {
        data.rateCalculator.estimatedTons = tabMaterials.quantity;
        const numTrips = Math.ceil(data.rateCalculator.estimatedTons / data.rateCalculator.truckCapacity);
        data.rateCalculator.estimatedHours = (numTrips * oneLoad).toFixed(2);
      }
      if (data.rateCalculator.estimateTypeRadio === 'ton') {
        data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByTons(
          parseFloat(data.rateCalculator.estimatedTons),
          parseFloat(data.rateCalculator.truckCapacity),
          (data.roundType === 'up')
        );
      }
      if (data.rateCalculator.estimateTypeRadio === 'hour') {
        data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByHours(
          parseFloat(data.rateCalculator.estimatedHours),
          parseFloat(oneLoad),
          (data.roundType === 'up')
        );
      }
    }
    this.handleUpdateRates(data);
    // handleInputChange('tabHaulRate', data);
    this.setState({loaded: true});
  }

  componentWillReceiveProps(nextProps) {
    const {data, tabPickupDelivery, tabMaterials} = {...nextProps};
    if (tabPickupDelivery.startLocationLatitude && tabPickupDelivery.startLocationLongitude
      && tabPickupDelivery.endLocationLatitude && tabPickupDelivery.endLocationLongitude) {
      if (tabPickupDelivery.avgTimeEnroute !== data.rateCalculator.travelTimeEnroute
        || tabPickupDelivery.avgTimeEnroute !== data.rateCalculator.travelTimeReturn) {
        data.rateCalculator.invalidAddress = false;
        data.rateCalculator.travelTimeEnroute = tabPickupDelivery.avgTimeEnroute;
        data.rateCalculator.travelTimeReturn = tabPickupDelivery.avgTimeEnroute;
        data.rateCalculator.loadTime = 0.25;
        data.rateCalculator.unloadTime = 0.25;
        const oneLoad = data.rateCalculator.tripType === 'oneWay'
          ? TCalculator.getOneWayTripTime(
            parseFloat(data.rateCalculator.travelTimeEnroute),
            parseFloat(data.rateCalculator.loadTime),
            parseFloat(data.rateCalculator.unloadTime)
          )
          : TCalculator.getRoundTripTime(
            parseFloat(data.rateCalculator.travelTimeEnroute),
            parseFloat(data.rateCalculator.travelTimeReturn),
            parseFloat(data.rateCalculator.loadTime),
            parseFloat(data.rateCalculator.unloadTime)
          );
        const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);

        if (data.rateCalculator.estimateTypeRadio === 'hour') {
          data.rateCalculator.estimatedHours = tabMaterials.quantity;
          data.rateCalculator.estimatedTons = TCalculator.getTonsByHourAmount(
            parseFloat(data.rateCalculator.travelTimeEnroute),
            timeReturn,
            parseFloat(data.rateCalculator.loadTime),
            parseFloat(data.rateCalculator.unloadTime),
            parseFloat(data.rateCalculator.estimatedHours), // this is the value change by user
            parseInt(data.rateCalculator.truckCapacity, 10),
            (data.rateCalculator.roundType === 'up')
          );
          data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByHours(
            parseFloat(data.rateCalculator.estimatedHours),
            parseFloat(oneLoad),
            (data.roundType === 'up')
          );
        } else if (data.rateCalculator.estimateTypeRadio === 'ton') {
          data.rateCalculator.estimatedTons = tabMaterials.quantity;
          data.rateCalculator.estimatedHours = TCalculator.getHoursByTonAmount(
            parseFloat(data.rateCalculator.travelTimeEnroute),
            timeReturn,
            parseFloat(data.rateCalculator.loadTime),
            parseFloat(data.rateCalculator.unloadTime),
            parseFloat(data.rateCalculator.estimatedTons), // this is the value change by user
            parseInt(data.rateCalculator.truckCapacity, 10),
            (data.rateCalculator.roundType === 'up')
          );
          data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByTons(
            parseFloat(data.rateCalculator.estimatedTons),
            parseFloat(data.rateCalculator.truckCapacity),
            (data.roundType === 'up')
          );
        }

        this.handleUpdateRates(data);
        // handleInputChange('tabHaulRate', data);
        this.setState({data: {...data}});
      }
    }
    this.setState({data: {...data}});
  }

  toggleRateCalc() {
    const {data, handleInputChange} = {...this.props};
    data.rateCalculator.rateCalcOpen = !data.rateCalculator.rateCalcOpen;
    data.rateCalcVisibleDisabled = false;
    handleInputChange('tabHaulRate', data);
  }

  handleOneWayCostChange(oneWay) {
    const {data} = {...this.props};
    let {value} = oneWay.target;
    value = TFormat.asFloatOneLeadingZero(value.toString(), true);
    data.rateCalculator.oneWayCostTonMile = value;
    this.handleUpdateRates(data);
  }

  handleTwoWayCostChange(oneWay) {
    const {data} = {...this.props};
    let {value} = oneWay.target;
    value = TFormat.asFloatOneLeadingZero(value.toString(), true);
    data.rateCalculator.twoWayCostMile = value;
    this.handleUpdateRates(data);
  }

  handleUpdateRates(currData) {
    const {tabPickupDelivery, handleInputChange} = {...this.props};
    const data = currData;
    const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
    const oneLoad = data.rateCalculator.tripType === 'oneWay'
      ? TCalculator.getOneWayTripTime(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime)
      )
      : TCalculator.getRoundTripTime(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        parseFloat(data.rateCalculator.travelTimeReturn),
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime)
      );
    // update unselected rates

    // if tonnage is selected
    switch (data.rateCalculator.rateTypeRadio) {
      case 'ton':
        // update hour rate
        data.rateCalculator.ratePerHour = TCalculator.getHourRateByTonRate(
          // parseFloat(data.rateCalculator.estimatedHours),
          // parseFloat(data.rateCalculator.estimatedTons),
          TCalculator.getTotalHourAmountByLoads(data.rateCalculator.numberOfLoads,
            oneLoad),
          TCalculator.getTotalTonAmountByLoads(data.rateCalculator.numberOfLoads,
            data.rateCalculator.truckCapacity),
          parseFloat(data.rateCalculator.ratePerTon)
        );
        // update one way cost
        data.rateCalculator.oneWayCostTonMile = TCalculator.getOneWayCostByTonRate(
          parseFloat(data.rateCalculator.ratePerTon),
          parseFloat(tabPickupDelivery.avgDistanceEnroute)
        );
        // update two way cost
        data.rateCalculator.twoWayCostMile = TCalculator.getTwoWayCostByTonRate(
          parseFloat(data.rateCalculator.ratePerTon),
          parseFloat(data.rateCalculator.truckCapacity),
          parseFloat(tabPickupDelivery.avgDistanceEnroute),
          parseFloat(tabPickupDelivery.avgDistanceReturn)
        );
        break;
      case 'hour': // if hourly rate is selected
        // update ton rate
        data.rateCalculator.ratePerTon = TCalculator.getTonRateByHourRate(
          // parseFloat(data.rateCalculator.estimatedHours),
          // parseFloat(data.rateCalculator.estimatedTons),
          TCalculator.getTotalHourAmountByLoads(data.rateCalculator.numberOfLoads,
            oneLoad),
          TCalculator.getTotalTonAmountByLoads(data.rateCalculator.numberOfLoads,
            data.rateCalculator.truckCapacity),
          parseFloat(data.rateCalculator.ratePerHour)
        );
        // update one way cost
        data.rateCalculator.oneWayCostTonMile = TCalculator.getOneWayCostByHourRate(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime),
          parseFloat(data.rateCalculator.ratePerHour), // this is the value change by user
          parseInt(data.rateCalculator.truckCapacity, 10),
          parseFloat(tabPickupDelivery.avgDistanceEnroute)
        );
        // update two way cost
        data.rateCalculator.twoWayCostMile = TCalculator.getTwoWayCostByHourRate(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.travelTimeReturn),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime),
          parseFloat(data.rateCalculator.ratePerHour), // this is the value change by user
          parseFloat(tabPickupDelivery.avgDistanceEnroute),
          parseFloat(tabPickupDelivery.avgDistanceReturn)
        );
        break;
      case 'oneWay':
        // update hour rate
        data.rateCalculator.ratePerHour = TCalculator.getHourRateByOneWayCost(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          timeReturn,
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime),
          parseFloat(data.rateCalculator.oneWayCostTonMile),
          parseInt(data.rateCalculator.truckCapacity, 10),
          parseFloat(tabPickupDelivery.avgDistanceEnroute)
        );
        // update ton rate
        data.rateCalculator.ratePerTon = TCalculator.getTonRateByOneWayCost(
          parseFloat(data.rateCalculator.oneWayCostTonMile),
          parseFloat(tabPickupDelivery.avgDistanceEnroute)
        );
        // update two way cost
        data.rateCalculator.twoWayCostMile = TCalculator.getTwoWayCostByOneWayCost(
          parseFloat(data.rateCalculator.oneWayCostTonMile),
          parseInt(data.rateCalculator.truckCapacity, 10),
          parseFloat(tabPickupDelivery.avgDistanceEnroute),
          parseFloat(tabPickupDelivery.avgDistanceReturn)
        );
        break;
      case 'twoWay':
        // update hour rate
        data.rateCalculator.ratePerHour = TCalculator.getHourRateByTwoWayCost(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          timeReturn,
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime),
          parseFloat(data.rateCalculator.twoWayCostMile),
          parseInt(data.rateCalculator.truckCapacity, 10),
          parseFloat(tabPickupDelivery.avgDistanceEnroute),
          parseFloat(tabPickupDelivery.avgDistanceReturn)
        );
        // update ton rate
        data.rateCalculator.ratePerTon = TCalculator.getTonRateByTwoWayCost(
          parseFloat(data.rateCalculator.twoWayCostMile),
          parseInt(data.rateCalculator.truckCapacity, 10),
          parseFloat(tabPickupDelivery.avgDistanceEnroute),
          parseFloat(tabPickupDelivery.avgDistanceReturn)
        );
        // update one way cost
        data.rateCalculator.oneWayCostTonMile = TCalculator.getOneWayCostByTwoWayCost(
          parseFloat(data.rateCalculator.twoWayCostMile),
          parseInt(data.rateCalculator.truckCapacity, 10),
          parseFloat(tabPickupDelivery.avgDistanceEnroute),
          parseFloat(tabPickupDelivery.avgDistanceReturn)
        );
        break;
      default:
    }
    handleInputChange('tabHaulRate', data);
  }

  handleEstimatedTonsChange(estTons) {
    const {data, handleInputChange} = {...this.props};
    let {value} = estTons.target;
    if (value === '') {
      data.rateCalculator.estimatedTons = value;
      handleInputChange('tabHaulRate', data);
      return;
    }
    value = TFormat.asIntegerNoLeadingZeros(value.toString(), true);
    data.rateCalculator.estimatedTons = value;
    data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByTons(
      parseFloat(data.rateCalculator.estimatedTons),
      parseFloat(data.rateCalculator.truckCapacity),
      (data.roundType === 'up')
    );
    const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
    data.rateCalculator.estimatedHours = TCalculator.getHoursByTonAmount(
      parseFloat(data.rateCalculator.travelTimeEnroute),
      timeReturn,
      parseFloat(data.rateCalculator.loadTime),
      parseFloat(data.rateCalculator.unloadTime),
      parseFloat(data.rateCalculator.estimatedTons), // this is the value change by user
      parseInt(data.rateCalculator.truckCapacity, 10),
      (data.rateCalculator.roundType === 'up')
    );

    // update unselected rates
    this.handleUpdateRates(data);
  }

  handleRateTonsChange(rateTon) {
    const {data} = {...this.props};
    let {value} = rateTon.target;
    value = TFormat.asFloatOneLeadingZero(value.toString(), true);
    data.rateCalculator.ratePerTon = value;
    this.handleUpdateRates(data);
  }

  handleRateHoursChange(rateHour) {
    const {data} = {...this.props};
    let {value} = rateHour.target;
    value = TFormat.asFloatOneLeadingZero(value.toString(), true);
    data.rateCalculator.ratePerHour = value;
    this.handleUpdateRates(data);
  }

  handleEstimatedHoursChange(estHours) {
    const {data, handleInputChange} = {...this.props};
    let {value} = estHours.target;
    if (value === '') {
      data.rateCalculator.estimatedHours = value;
      handleInputChange('tabHaulRate', data);
      return;
    }
    value = TFormat.asIntegerNoLeadingZeros(value.toString(), true);

    data.rateCalculator.estimatedHours = value;

    const oneLoad = data.rateCalculator.tripType === 'oneWay'
      ? TCalculator.getOneWayTripTime(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime)
      )
      : TCalculator.getRoundTripTime(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        parseFloat(data.rateCalculator.travelTimeReturn),
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime)
      );
    data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByHours(
      parseFloat(data.rateCalculator.estimatedHours),
      parseFloat(oneLoad),
      (data.roundType === 'up')
    );

    const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
    data.rateCalculator.estimatedTons = TCalculator.getTonsByHourAmount(
      parseFloat(data.rateCalculator.travelTimeEnroute),
      timeReturn,
      parseFloat(data.rateCalculator.loadTime),
      parseFloat(data.rateCalculator.unloadTime),
      parseFloat(data.rateCalculator.estimatedHours), // this is the value change by user
      parseInt(data.rateCalculator.truckCapacity, 10),
      (data.rateCalculator.roundType === 'up')
    );
    this.handleUpdateRates(data);
  }

  handleRatePerPayType(ratePerPayType) {
    const {data} = {...this.props};
    const {rateCalculator} = {...data};
    let {value} = ratePerPayType.target;
    value = TFormat.asFloatOneLeadingZero(value.toString(), true);
    data.ratePerPayType = value;
    if (data.payType === 'Ton') {
      rateCalculator.ratePerTon = value;
    } else if (data.payType === 'Hour') {
      rateCalculator.ratePerHour = value;
    }
    this.handleUpdateRates(data);
  }

  handlePayTypeChange(payType) {
    const {data, handleInputChange} = {...this.props};
    data.payType = payType;
    handleInputChange('tabHaulRate', data);
  }

  handleTripTypeChange(tripType) {
    const {data, handleInputChange} = {...this.props};
    if (data.rateCalculator.rateCalcOpen) {
      data.rateCalculator.tripType = tripType;
      if (data.rateCalculator.estimateTypeRadio === 'ton') {
        const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
        data.rateCalculator.estimatedHours = TCalculator.getHoursByTonAmount(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          timeReturn,
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime),
          parseFloat(data.rateCalculator.estimatedTons), // this is the value change by user
          parseInt(data.rateCalculator.truckCapacity, 10),
          (data.rateCalculator.roundType === 'up')
        );
      } else if (data.rateCalculator.estimateTypeRadio === 'hour') {
        const oneLoad = data.rateCalculator.tripType === 'oneWay'
          ? TCalculator.getOneWayTripTime(
            parseFloat(data.rateCalculator.travelTimeEnroute),
            parseFloat(data.rateCalculator.loadTime),
            parseFloat(data.rateCalculator.unloadTime)
          )
          : TCalculator.getRoundTripTime(
            parseFloat(data.rateCalculator.travelTimeEnroute),
            parseFloat(data.rateCalculator.travelTimeReturn),
            parseFloat(data.rateCalculator.loadTime),
            parseFloat(data.rateCalculator.unloadTime)
          );
        data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByHours(
          parseFloat(data.rateCalculator.estimatedHours),
          parseFloat(oneLoad),
          (data.roundType === 'up')
        );
        const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
        data.rateCalculator.estimatedTons = TCalculator.getTonsByHourAmount(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          timeReturn,
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime),
          parseFloat(data.rateCalculator.estimatedHours), // this is the value change by user
          parseInt(data.rateCalculator.truckCapacity, 10),
          (data.rateCalculator.roundType === 'up')
        );
      }
      this.handleUpdateRates(data);
    } else {
      data.tripType = tripType;
      handleInputChange('tabHaulRate', data);
    }
  }

  handleRoundTypeChange(roundType) {
    const {data, handleInputChange} = {...this.props};
    if (data.rateCalculator.rateCalcOpen) {
      const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
      data.rateCalculator.roundType = roundType;
      if (data.rateCalculator.estimateTypeRadio === 'ton') {
        data.rateCalculator.estimatedHours = TCalculator.getHoursByTonAmount(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          timeReturn,
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime),
          parseFloat(data.rateCalculator.estimatedTons), // this is the value change by user
          parseInt(data.rateCalculator.truckCapacity, 10),
          (data.rateCalculator.roundType === 'up')
        );

        data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByTons(
          parseFloat(data.rateCalculator.estimatedTons),
          parseFloat(data.rateCalculator.truckCapacity),
          (data.rateCalculator.roundType === 'up')
        );
        this.handleUpdateRates(data);
      }
      if (data.rateCalculator.estimateTypeRadio === 'hour') {
        data.rateCalculator.estimatedTons = TCalculator.getTonsByHourAmount(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          timeReturn,
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime),
          parseFloat(data.rateCalculator.estimatedHours), // this is the value change by user
          parseInt(data.rateCalculator.truckCapacity, 10),
          (data.rateCalculator.roundType === 'up')
        );

        const oneLoad = data.rateCalculator.tripType === 'oneWay'
          ? TCalculator.getOneWayTripTime(
            parseFloat(data.rateCalculator.travelTimeEnroute),
            parseFloat(data.rateCalculator.loadTime),
            parseFloat(data.rateCalculator.unloadTime)
          )
          : TCalculator.getRoundTripTime(
            parseFloat(data.rateCalculator.travelTimeEnroute),
            parseFloat(data.rateCalculator.travelTimeReturn),
            parseFloat(data.rateCalculator.loadTime),
            parseFloat(data.rateCalculator.unloadTime)
          );
        data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByHours(
          parseFloat(data.rateCalculator.estimatedHours),
          parseFloat(oneLoad),
          (data.rateCalculator.roundType === 'up')
        );
      }
      this.handleUpdateRates(data);
    } else {
      data.roundType = roundType;
    }
    handleInputChange('tabHaulRate', data);
  }

  handleLoadTimeChange(loadTime) {
    let {value} = loadTime.target;
    // value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    value = TFormat.asIntegerNoLeadingZeros(value.toString(), true);
    const {data} = {...this.props};
    // const {rateCalculator} = {...data};
    data.rateCalculator.loadTime = value / 60;

    const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
    if (data.rateCalculator.estimateTypeRadio === 'hour') {
      const oneLoad = data.rateCalculator.tripType === 'oneWay'
        ? TCalculator.getOneWayTripTime(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime)
        )
        : TCalculator.getRoundTripTime(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.travelTimeReturn),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime)
        );
      data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByHours(
        parseFloat(data.rateCalculator.estimatedHours),
        parseFloat(oneLoad),
        (data.roundType === 'up')
      );
      data.rateCalculator.estimatedTons = TCalculator.getTonsByHourAmount(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        timeReturn,
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime),
        parseFloat(data.rateCalculator.estimatedHours), // this is the value change by user
        parseInt(data.rateCalculator.truckCapacity, 10),
        (data.rateCalculator.roundType === 'up')
      );
    } else if (data.rateCalculator.estimateTypeRadio === 'ton') {
      data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByTons(
        parseFloat(data.rateCalculator.estimatedTons),
        parseFloat(data.rateCalculator.truckCapacity),
        (data.roundType === 'up')
      );
      data.rateCalculator.estimatedHours = TCalculator.getHoursByTonAmount(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        timeReturn,
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime),
        parseFloat(data.rateCalculator.estimatedTons), // this is the value change by user
        parseInt(data.rateCalculator.truckCapacity, 10),
        (data.rateCalculator.roundType === 'up')
      );
    }

    // need to update estimated hours too -> make a Tcalc function for that

    this.handleUpdateRates(data);
    // handleInputChange('tabHaulRate', data);
  }

  handleUnloadTimeChange(unloadTime) {
    let {value} = unloadTime.target;
    // value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    value = TFormat.asIntegerNoLeadingZeros(value.toString(), true);
    const {data} = {...this.props};
    // const {rateCalculator} = {...data};
    data.rateCalculator.unloadTime = value / 60;
    const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
    if (data.rateCalculator.estimateTypeRadio === 'hour') {
      const oneLoad = data.rateCalculator.tripType === 'oneWay'
        ? TCalculator.getOneWayTripTime(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime)
        )
        : TCalculator.getRoundTripTime(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.travelTimeReturn),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime)
        );
      data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByHours(
        parseFloat(data.rateCalculator.estimatedHours),
        parseFloat(oneLoad),
        (data.roundType === 'up')
      );
      data.rateCalculator.estimatedTons = TCalculator.getTonsByHourAmount(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        timeReturn,
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime),
        parseFloat(data.rateCalculator.estimatedHours), // this is the value change by user
        parseInt(data.rateCalculator.truckCapacity, 10),
        (data.rateCalculator.roundType === 'up')
      );
    } else if (data.rateCalculator.estimateTypeRadio === 'ton') {
      data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByTons(
        parseFloat(data.rateCalculator.estimatedTons),
        parseFloat(data.rateCalculator.truckCapacity),
        (data.roundType === 'up')
      );
      data.rateCalculator.estimatedHours = TCalculator.getHoursByTonAmount(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        timeReturn,
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime),
        parseFloat(data.rateCalculator.estimatedTons), // this is the value change by user
        parseInt(data.rateCalculator.truckCapacity, 10),
        (data.rateCalculator.roundType === 'up')
      );
    }
    // need to update estimated hours too -> make a Tcalc function for that
    this.handleUpdateRates(data);

    // handleInputChange('tabHaulRate', data);
  }

  // due to new requirements these fields are no longer editable but keeping methods for the future
  handleEnrouteTravelTimeChange(travelTimeEnroute) {
    let {value} = travelTimeEnroute.target;
    // value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    value = TFormat.asFloatOneLeadingZero(value.toString(), true);
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.travelTimeEnroute = value;
    const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
    rateCalculator.estimatedTons = TCalculator.getTonsByHourAmount(
      parseFloat(data.rateCalculator.travelTimeEnroute),
      timeReturn,
      parseFloat(data.rateCalculator.loadTime),
      parseFloat(data.rateCalculator.unloadTime),
      parseFloat(data.rateCalculator.estimatedHours), // this is the value change by user
      parseInt(data.rateCalculator.truckCapacity, 10),
      (data.rateCalculator.roundType === 'up')
    );
    handleInputChange('tabHaulRate', data);
  }

  // due to new requirements these fields are no longer editable but keeping methods for the future
  handleReturnTravelTimeChange(travelTimeReturn) {
    let {value} = travelTimeReturn.target;
    // value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    value = TFormat.asFloatOneLeadingZero(value.toString(), true);
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.travelTimeReturn = value;
    const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
    rateCalculator.estimatedTons = TCalculator.getTonsByHourAmount(
      parseFloat(data.rateCalculator.travelTimeEnroute),
      timeReturn,
      parseFloat(data.rateCalculator.loadTime),
      parseFloat(data.rateCalculator.unloadTime),
      parseFloat(data.rateCalculator.estimatedHours), // this is the value change by user
      parseInt(data.rateCalculator.truckCapacity, 10),
      (data.rateCalculator.roundType === 'up')
    );
    handleInputChange('tabHaulRate', data);
  }

  handleTruckCapacityChange(truckCapacity) {
    let {value} = truckCapacity.target;
    // value = value.replace(/\D/g, '');
    value = TFormat.asIntegerNoLeadingZeros(value.toString(), true);
    const {data} = {...this.props};
    const timeReturn = data.rateCalculator.tripType === 'oneWay' ? null : parseFloat(data.rateCalculator.travelTimeReturn);
    data.rateCalculator.truckCapacity = value;
    if (data.rateCalculator.estimateTypeRadio === 'hour') {
      const oneLoad = data.rateCalculator.tripType === 'oneWay'
        ? TCalculator.getOneWayTripTime(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime)
        )
        : TCalculator.getRoundTripTime(
          parseFloat(data.rateCalculator.travelTimeEnroute),
          parseFloat(data.rateCalculator.travelTimeReturn),
          parseFloat(data.rateCalculator.loadTime),
          parseFloat(data.rateCalculator.unloadTime)
        );
      data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByHours(
        parseFloat(data.rateCalculator.estimatedHours),
        parseFloat(oneLoad),
        (data.roundType === 'up')
      );

      data.rateCalculator.estimatedTons = data.rateCalculator.truckCapacity === ''
        ? 0
        : TCalculator
          .getTonsByHourAmount(
            parseFloat(data.rateCalculator.travelTimeEnroute),
            timeReturn,
            parseFloat(data.rateCalculator.loadTime),
            parseFloat(data.rateCalculator.unloadTime),
            parseFloat(data.rateCalculator.estimatedHours), // this is the value change by user
            parseInt(data.rateCalculator.truckCapacity, 10),
            (data.rateCalculator.roundType === 'up')
          );
    } else if (data.rateCalculator.estimateTypeRadio === 'ton') {
      data.rateCalculator.numberOfLoads = TCalculator.getNumTripsByTons(
        parseFloat(data.rateCalculator.estimatedTons),
        parseFloat(data.rateCalculator.truckCapacity),
        (data.rateCalculator.roundType === 'up')
      );
      data.rateCalculator.estimatedHours = TCalculator.getHoursByTonAmount(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        timeReturn,
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime),
        parseFloat(data.rateCalculator.estimatedTons), // this is the value change by user
        parseInt(data.rateCalculator.truckCapacity, 10),
        (data.rateCalculator.roundType === 'up')
      );
    }
    this.handleUpdateRates(data);
  }

  handleSetEstimateType(e) {
    const {data, handleInputChange} = {...this.props};
    data.rateCalculator.estimateTypeRadio = e;
    if (e === 'hour') {
      this.handleSetRateType('hour');
    }
    handleInputChange('tabHaulRate', data);
  }

  applyCalculations() {
    const {data, handleInputChange, scrollToTopForm} = {...this.props};
    if (!data.rateCalcVisibleDisabled) {
      scrollToTopForm();
      if (data.payType === 'Ton') {
        data.ratePerPayType = data.rateCalculator.ratePerTon;
      } else if (data.payType === 'Hour') {
        data.ratePerPayType = data.rateCalculator.ratePerHour;
      }
      data.rateCalcVisibleDisabled = true;
      data.rateCalculator.rateCalcOpen = false;
      handleInputChange('tabHaulRate', data);
    }
  }

  handleSetRateType(e) {
    const {data, handleInputChange} = {...this.props};
    data.rateCalculator.rateTypeRadio = e;
    handleInputChange('tabHaulRate', data);
  }

  handleOffClick(e) {
    const {data, handleInputChange} = {...this.props};
    if (e === 'ratePerPayType') {
      data.ratePerPayType = TFormat
        .asFloatTwoDecimals(data.ratePerPayType);
      handleInputChange('tabHaulRate', data);
    } else if (e === 'ratePerTon') {
      data.rateCalculator.ratePerTon = TFormat
        .asFloatTwoDecimals(data.rateCalculator.ratePerTon);
      handleInputChange('tabHaulRate', data);
    } else if (e === 'ratePerHour') {
      data.rateCalculator.ratePerHour = TFormat
        .asFloatTwoDecimals(data.rateCalculator.ratePerHour);
      handleInputChange('tabHaulRate', data);
    } else if (e === 'travelTimeEnroute') {
      data.rateCalculator.travelTimeEnroute = TFormat
        .asFloatTwoDecimals(data.rateCalculator.travelTimeEnroute);
      handleInputChange('tabHaulRate', data);
    } else if (e === 'travelTimeReturn') {
      data.rateCalculator.travelTimeReturn = TFormat
        .asFloatTwoDecimals(data.rateCalculator.travelTimeReturn);
      handleInputChange('tabHaulRate', data);
    } else if (e === 'loadTime') {
      data.rateCalculator.loadTime = TFormat
        .asFloatTwoDecimals(data.rateCalculator.loadTime);
      handleInputChange('tabHaulRate', data);
    } else if (e === 'unloadTime') {
      data.rateCalculator.unloadTime = TFormat
        .asFloatTwoDecimals(data.rateCalculator.unloadTime);
      handleInputChange('tabHaulRate', data);
    } else if (e === 'oneWay') {
      data.rateCalculator.oneWayCostTonMile = TFormat
        .asFloatTwoDecimals(data.rateCalculator.oneWayCostTonMile);
      handleInputChange('tabHaulRate', data);
    } else if (e === 'twoWay') {
      data.rateCalculator.twoWayCostMile = TFormat
        .asFloatTwoDecimals(data.rateCalculator.twoWayCostMile);
      handleInputChange('tabHaulRate', data);
    }
  }

  renderDeliveryCosts() {
    const {data, tabMaterials, tabPickupDelivery} = {...this.props};
    const {rateCalculator} = {...data};
    const truckCapacity = 22;
    const haulCostPerTonHour = data.ratePerPayType;
    let oneWayCostPerTonHourPerMile = '0.00';
    let deliveredPricePerTon = '0.00';
    let deliveredPriceJob = '0.00';
    let estimatedCostForJob = '0.00';
    // const sufficientInfo = (parseFloat(data.avgTimeEnroute) + parseFloat(data.avgTimeReturn)) * parseFloat(data.ratePerPayType);
    if (haulCostPerTonHour > 0) {
      // haulCostPerTonHour = ((sufficientInfo) / parseFloat(data.rateCalculator.truckCapacity)).toFixed(2);
      // oneWayCostPerTonHourPerMile = data.avgDistanceEnroute > 0 ? (parseFloat(haulCostPerTonHour) / parseFloat(data.avgDistanceEnroute)).toFixed(2) : 0;
      if (data.payType === 'Ton') {
        oneWayCostPerTonHourPerMile = TCalculator.getOneWayCostByTonRate(haulCostPerTonHour, tabPickupDelivery.avgDistanceEnroute);
      } else {
        oneWayCostPerTonHourPerMile = TCalculator.getOneWayCostByHourRate(
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          0.25,
          0.25,
          parseFloat(data.ratePerPayType),
          truckCapacity,
          tabPickupDelivery.avgDistanceEnroute
        );
      }
      if (data.payType === 'Ton') {
        deliveredPricePerTon = TCalculator.getDelPricePerTonByTonRate(
          parseFloat(tabMaterials.estMaterialPricing),
          parseFloat(haulCostPerTonHour)
        );
      } else if (data.payType === 'Hour' && tabMaterials.quantityType === 'Ton') {
        const timeReturn = data.tripType === 'oneWay' ? null : parseFloat(tabPickupDelivery.avgTimeReturn);
        deliveredPricePerTon = TCalculator.getDelPricePerTonByHourRateByTonAmount(
          parseFloat(tabMaterials.estMaterialPricing),
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          timeReturn,
          0.25,
          0.25,
          tabMaterials.quantity,
          truckCapacity,
          parseFloat(haulCostPerTonHour),
          (data.roundType === 'up')
        );
      } else if (data.payType === 'Hour' && tabMaterials.quantityType === 'Hour') {
        const timeReturn = data.tripType === 'oneWay' ? null : parseFloat(tabPickupDelivery.avgTimeReturn);
        deliveredPricePerTon = TCalculator.getDelPricePerTonByHourRateByHourAmount(
          parseFloat(tabMaterials.estMaterialPricing),
          parseFloat(haulCostPerTonHour),
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          timeReturn,
          0.25,
          0.25,
          tabMaterials.quantity,
          truckCapacity,
          parseFloat(haulCostPerTonHour),
          (data.roundType === 'up')
        );
      }
      if ((tabMaterials.quantityType === 'Ton' && data.payType === 'Ton')
      || (tabMaterials.quantityType === 'Hour' && data.payType === 'Hour')) {
        estimatedCostForJob = TCalculator.getJobCostSameRateAndAmount(
          parseFloat(haulCostPerTonHour),
          parseFloat(tabMaterials.quantity)
        );
      } else if (tabMaterials.quantityType === 'Ton' && data.payType === 'Hour') {
        const timeReturn = data.tripType === 'oneWay' ? null : parseFloat(tabPickupDelivery.avgTimeReturn);
        estimatedCostForJob = TCalculator.getJobCostHourRateTonAmount(
          parseFloat(haulCostPerTonHour),
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          timeReturn,
          0.25,
          0.25,
          parseFloat(tabMaterials.quantity),
          truckCapacity,
          (data.roundType === 'up')
        );
      } else if (tabMaterials.quantityType === 'Hour' && data.payType === 'Ton') {
        const timeReturn = data.tripType === 'oneWay' ? null : parseFloat(tabPickupDelivery.avgTimeReturn);
        estimatedCostForJob = TCalculator.getJobCostTonRateHourAmount(
          parseFloat(haulCostPerTonHour),
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          timeReturn,
          0.25,
          0.25,
          parseFloat(tabMaterials.quantity),
          truckCapacity,
          (data.roundType === 'up')
        );
      }

      if (tabMaterials.quantityType === 'Ton') {
        deliveredPriceJob = TCalculator.getDelPricePerJobByTonAmount(tabMaterials.quantity, deliveredPricePerTon);
      } else {
        const timeReturn = data.tripType === 'oneWay' ? null : parseFloat(tabPickupDelivery.avgTimeReturn);
        deliveredPriceJob = TCalculator.getDelPricePerJobByHourAmount(
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          timeReturn,
          0.25,
          0.25,
          parseFloat(tabMaterials.quantity),
          truckCapacity,
          deliveredPricePerTon,
          (data.roundType === 'up')
        );
      }
    }
    return (
      <DeliveryCostsSummary
        estMaterialPricing={tabMaterials.estMaterialPricing}
        deliveredPricePerTon={deliveredPricePerTon}
        deliveredPriceJob={deliveredPriceJob}
        payType={data.payType}
        quantityType={tabMaterials.quantityType}
        oneWayCostPerTonHourPerMile={oneWayCostPerTonHourPerMile}
        haulCostPerTonHour={haulCostPerTonHour}
        estimatedCostForJob={estimatedCostForJob}
        disabled={rateCalculator.rateCalcOpen}
      />
    );
  }


  renderRateCalc() {
    const {t, data, tabMaterials, tabPickupDelivery} = {...this.props};
    const translate = t;
    const {rateCalculator} = {...data};
    // let estimatedTotalPrice = 0;
    // if (rateCalculator.estimateTypeRadio === 'ton' && rateCalculator.rateTypeRadio === 'ton') {
    //   estimatedTotalPrice = (rateCalculator.estimatedTons * rateCalculator.ratePerTon).toFixed(2);
    // } else if (rateCalculator.estimateTypeRadio === 'hour' && rateCalculator.rateTypeRadio === 'hour') {
    //   estimatedTotalPrice = (rateCalculator.estimatedHours * rateCalculator.ratePerHour).toFixed(2);
    // } else if (rateCalculator.estimateTypeRadio === 'ton' && rateCalculator.rateTypeRadio === 'hour') {
    //   const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
    //     + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
    //   const numTrips = Math.ceil(rateCalculator.estimatedTons / rateCalculator.truckCapacity);
    //   const estHours = numTrips * oneLoad;
    //   estimatedTotalPrice = (estHours * rateCalculator.ratePerHour).toFixed(2);
    // }

    const loadTimeMin = Math.ceil(rateCalculator.loadTime * 60);
    const unloadTimeMin = Math.ceil(rateCalculator.unloadTime * 60);

    const oneLoad = data.rateCalculator.tripType === 'oneWay'
      ? TCalculator.getOneWayTripTime(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime)
      )
      : TCalculator.getRoundTripTime(
        parseFloat(data.rateCalculator.travelTimeEnroute),
        parseFloat(data.rateCalculator.travelTimeReturn),
        parseFloat(data.rateCalculator.loadTime),
        parseFloat(data.rateCalculator.unloadTime)
      );
    let totalAmount;
    if (rateCalculator.estimateTypeRadio === 'ton') {
      totalAmount = TCalculator.getTotalTonAmountByLoads(rateCalculator.numberOfLoads, rateCalculator.truckCapacity);
    }
    if (rateCalculator.estimateTypeRadio === 'hour') {
      totalAmount = TCalculator.getTotalHourAmountByLoads(rateCalculator.numberOfLoads, oneLoad);

    }
    const estimatedTonsInfo = tabMaterials.quantityType === 'Ton' ?
      'Any changes in tonnage to take final affect must be modified on the Materials ( tab ).' :
      'This number is calculated by Trelar using mapping data from your pickup and delivery addresses, and your other inputted values.';


    const estimatedHoursInfo = tabMaterials.quantityType === 'Hour' ?
      'Any changes in hours to take final affect must be modified on the Materials ( tab ).' :
      'This number is calculated by Trelar using mapping data from your pickup and delivery addresses, and your other inputted values.';

    const ratePerTonInfo = data.payType === 'Ton' ?
      'Any changes in rate per ton to take final affect must be modified above.' :
      'This number is calculated by Trelar using mapping data from your pickup and delivery addresses, and your other inputted values.';


    const ratePerHourInfo = data.payType === 'Hour' ?
      'Any changes in rate per hour to take final affect must be modified above.' :
      'This number is calculated by Trelar using mapping data from your pickup and delivery addresses, and your other inputted values.';

    const milesIsNan = isNaN(parseFloat(tabPickupDelivery.avgDistanceEnroute));
    const travelTimeEnrouteIsNan = isNaN(parseFloat(rateCalculator.travelTimeEnroute));
    const travelTimeReturnIsNan = isNaN(parseFloat(rateCalculator.travelTimeReturn));

    return (
      <React.Fragment>
        <Row className="col-md-12">
          <hr/>
        </Row>

        <Row className="col-md-12">
          <div className="col-md-6 form__form-group">
            <span className="form__form-group-label input-title"
                  style={{color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'}}
            >
              Trip
            </span>
            <Row className="col-md-12 no-gutters" style={{marginLeft: -15}}>
              <div className="col-md-6 form__form-group">
                <Button
                  color="primary"
                  block
                  disabled={data.rateCalcVisibleDisabled}
                  className={data.rateCalculator.tripType === 'oneWay' ? 'toggle__button' : 'toggle__button-active'}
                  onClick={() => this.handleTripTypeChange('twoWay')}

                >
                  <p>Two - Way</p>
                </Button>
              </div>
              <div className="col-md-6 form__form-group">
                <Button
                  block
                  disabled={data.rateCalcVisibleDisabled}
                  color="primary"
                  className={data.rateCalculator.tripType === 'twoWay' ? 'toggle__button' : 'toggle__button-active'}
                  onClick={() => this.handleTripTypeChange('oneWay')}

                >
                  <p>One - Way</p>
                </Button>
              </div>
            </Row>
          </div>
          <div className="col-md-6 form__form-group">
            <span className="form__form-group-label input-title"
                  style={{color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'}}
            >
              Round Down or Round Up?
            </span>
            <Row className="col-md-12 no-gutters" style={{marginLeft: -15}}>
              <div className="col-md-6 form__form-group">
                <Button
                  color="primary"
                  block
                  disabled={data.rateCalcVisibleDisabled}
                  className={data.rateCalculator.roundType === 'up' ? 'toggle__button' : 'toggle__button-active'}
                  onClick={() => this.handleRoundTypeChange('down')}

                >
                  <p>Round Down</p>
                </Button>
              </div>
              <div className="col-md-6 form__form-group">
                <Button
                  block
                  disabled={data.rateCalcVisibleDisabled}
                  color="primary"
                  className={data.rateCalculator.roundType === 'down' ? 'toggle__button' : 'toggle__button-active'}
                  onClick={() => this.handleRoundTypeChange('up')}

                >
                  <p>Round Up</p>
                </Button>
              </div>
            </Row>
          </div>
        </Row>

        <Row className="col-md-12">
          <div className="col-md-6 form__form-group">
            <span className="form__form-group-label input-title"
                  style={{color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'}}
            >
              # of Loads
            </span>
            <TField
              input={
                {
                  onChange: null,
                  name: 'numberOfLoads',
                  value: rateCalculator.numberOfLoads
                }
              }
              placeholder=""
              disabled
              tertiaryDisabled={data.rateCalcVisibleDisabled}
              type="text"
              id="numberOfLoads"
            />
          </div>
          <div className="col-md-6 form__form-group">
            <span className="form__form-group-label input-title"
                  style={{color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'}}
            >
              {rateCalculator.estimateTypeRadio === 'ton' ? 'Tonnage' : 'Hours'}
            </span>
            <TField
              input={
                {
                  onChange: null,
                  name: 'totalAmount',
                  value: totalAmount
                }
              }
              placeholder=""
              tertiaryDisabled={data.rateCalcVisibleDisabled}
              disabled
              type="text"
              id="totalAmount"
            />
          </div>
        </Row>

        <Row className="col-md-12">
          <hr/>
        </Row>
        <Row className="col-md-12">
          <div className="col-md-12 dashboard dashboard__job-create-section-title">
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 'bold',
                color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'}}
            >
              QUANTITIES
            </span>
          </div>
        </Row>
        <Row className="col-md-12" style={{paddingTop: 15}}>
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label"
                      style={{color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'}}
                >
                  Estimated Tons
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className={data.rateCalcVisibleDisabled ? 'infoCircleDisabled' : 'infoCircle'}>
                    <span style={{padding: 6, color: 'white'}} data-tip data-for="estimatedTonsInfo">i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          {!data.rateCalcVisibleDisabled
            && (
              <div className="customTooltip">
                <ReactTooltip id="estimatedTonsInfo" effect="solid">
                  <p style={{color: 'white'}}>{estimatedTonsInfo}</p>
                </ReactTooltip>
              </div>
            )
          }
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label"
                      style={{color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'}}
                >
                  Estimated Hours
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className={data.rateCalcVisibleDisabled ? 'infoCircleDisabled' : 'infoCircle'}>
                      <span style={{padding: 6, color: 'white'}} data-tip data-for="estimatedHoursInfo">i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          {!data.rateCalcVisibleDisabled
          && (
          <div className="customTooltip">
            <ReactTooltip id="estimatedHoursInfo" effect="solid">
              <p style={{color: 'white'}}>{estimatedHoursInfo}</p>
            </ReactTooltip>
          </div>
          )}
          {/*{rateCalculator.rateTypeRadio === 'ton'*/}
          {/*&& (*/}
          {/*  <div className="col-md-4 form__form-group">*/}
          {/*    <span className="form__form-group-label">Estimated Total Price</span>*/}
          {/*  </div>*/}
          {/*)*/}
          {/*}*/}
        </Row>
        <Row className="col-md-12">
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio"
                       style={{marginTop: 9, width: 25, height: 18, marginLeft: 5, color: 'orange'}}
                       disabled={data.rateCalcVisibleDisabled}
                       checked={rateCalculator.estimateTypeRadio === 'ton'}
                       onClick={() => this.handleSetEstimateType('ton')}
                />
              </div>
              <div className="col-md-10 form__form-group">
                <span style={{
                  marginLeft: 15,
                  marginTop: rateCalculator.estimateTypeRadio === 'hour' ? 9 : 0,
                  color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                }}
                >
                  {rateCalculator.estimateTypeRadio === 'hour' ? TFormat.asNumber(rateCalculator.estimatedTons)
                    : (
                      <TField
                        input={
                          {
                            onChange: this.handleEstimatedTonsChange,
                            name: 'estimatedTons',
                            value: rateCalculator.estimatedTons
                          }
                        }
                        disabled={data.rateCalcVisibleDisabled}
                        tertiaryDisabled={data.rateCalcVisibleDisabled}
                        placeholder=""
                        type="text"
                        id="estimateTypeRadioTon"
                      />
                    )
                  }
                </span>
              </div>
            </Row>
          </div>
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio"
                       style={{marginTop: 9, width: 25, height: 18, marginLeft: 5}}
                       checked={rateCalculator.estimateTypeRadio === 'hour'}
                       disabled={data.rateCalcVisibleDisabled}
                       onClick={() => this.handleSetEstimateType('hour')}/>
              </div>
              <div className="col-md-10 form__form-group">

            <span style={{
              marginLeft: 15,
              marginTop: rateCalculator.estimateTypeRadio === 'ton' ? 9 : 0,
              color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
            }}
            >
              {rateCalculator.estimateTypeRadio === 'ton' ? TFormat.asNumber(rateCalculator.estimatedHours)
                : (
                  <TField
                    input={
                      {
                        onChange: this.handleEstimatedHoursChange,
                        name: 'estimatedHours',
                        value: rateCalculator.estimatedHours
                      }
                    }
                    disabled={data.rateCalcVisibleDisabled}
                    placeholder=""
                    type="text"
                    id="estimateTypeRadioHour"
                  />
                )
              }
            </span>
              </div>
            </Row>
          </div>
          {/*{rateCalculator.rateTypeRadio === 'ton'*/}
          {/*&& (*/}
          {/*  <div className="col-md-4 form__form-group">*/}
          {/*    <span style={{*/}
          {/*      marginTop: rateCalculator.rateTypeRadio === 'ton' ? 0 : 6,*/}
          {/*      marginLeft: 40,*/}
          {/*      position: 'absolute'*/}
          {/*    }}*/}
          {/*    >*/}
          {/*    $ {estimatedTotalPrice}*/}
          {/*  </span>*/}
          {/*  </div>*/}
          {/*)}*/}
        </Row>

        <Row className="col-md-12" style={{paddingTop: 20}}>
          <div className="col-md-12 dashboard dashboard__job-create-section-title">
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 'bold',
                color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
              }}
            >
              RATES
            </span>
          </div>
        </Row>
        <Row className="col-md-12" style={{paddingTop: 15}}>
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label"
                      style={{
                        color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                      }}
                >
                  Rate per ton
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className={data.rateCalcVisibleDisabled ? 'infoCircleDisabled' : 'infoCircle'}>
                    <span style={{padding: 6, color: 'white'}} data-tip data-for="ratePerTonInfo">i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          {!data.rateCalcVisibleDisabled
          && (
            <div className="customTooltip">
              <ReactTooltip id="ratePerTonInfo" effect="solid">
                <p style={{color: 'white'}}>{ratePerTonInfo}</p>
              </ReactTooltip>
            </div>
          )
          }
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label"
                      style={{
                        color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                      }}
                >
                  One way cost / ton / mile
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className={data.rateCalcVisibleDisabled ? 'infoCircleDisabled' : 'infoCircle'}>
                    <span style={{padding: 6, color: 'white'}} data-tip data-for="oneWayCostInfo">i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          {!data.rateCalcVisibleDisabled
          && (
            <div className="customTooltip">
              <ReactTooltip id="oneWayCostInfo" effect="solid">
                <p style={{color: 'white'}}>
                  This value is calculated based on distances chosen in pickup / delivery
                  tab.
                </p>
              </ReactTooltip>
            </div>
          )
          }
        </Row>
        <Row className="col-md-12">
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio" disabled={rateCalculator.estimateTypeRadio === 'hour' || data.rateCalcVisibleDisabled}
                       style={{marginTop: 9, width: 18, height: 18, marginLeft: 5}}
                       checked={rateCalculator.rateTypeRadio === 'ton'} onClick={() => this.handleSetRateType('ton')}
                />
              </div>
              <div className="col-md-10 form__form-group">
            <span style={{
              marginLeft: 15,
              marginTop: rateCalculator.rateTypeRadio !== 'ton' ? 9 : 0,
              color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
            }}
            >
              {rateCalculator.rateTypeRadio !== 'ton' ? TFormat.asNumber(rateCalculator.ratePerTon)
                : (
                  <TField
                    input={
                      {
                        onChange: this.handleRateTonsChange,
                        name: 'ratePerTon',
                        value: rateCalculator.ratePerTon
                      }
                    }
                    disabled={data.rateCalcVisibleDisabled}
                    tertiaryDisabled={data.rateCalcVisibleDisabled}
                    placeholder=""
                    type="text"
                    id="rateTypeRadio"
                    offClick={this.handleOffClick}
                  />
                )
              }
            </span>
              </div>
            </Row>
          </div>
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio"
                       style={{marginTop: 9, width: 18, height: 18, marginLeft: 5}}
                       disabled={data.rateCalcVisibleDisabled}
                       checked={rateCalculator.rateTypeRadio === 'oneWay'} onClick={() => this.handleSetRateType('oneWay')}
                />
              </div>
              <div className="col-md-10 form__form-group">
            <span style={{
              marginLeft: 15,
              marginTop: rateCalculator.rateTypeRadio !== 'oneWay' ? 9 : 0,
              color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
            }}
            >
              {rateCalculator.rateTypeRadio !== 'oneWay' ? TFormat.asNumber(rateCalculator.oneWayCostTonMile)
                : (
                  <TField
                    input={
                      {
                        onChange: this.handleOneWayCostChange,
                        name: 'oneWay',
                        value: rateCalculator.oneWayCostTonMile
                      }
                    }
                    disabled={data.rateCalcVisibleDisabled}
                    tertiaryDisabled={data.rateCalcVisibleDisabled}
                    placeholder=""
                    type="text"
                    id="rateTypeRadio"
                    offClick={this.handleOffClick}
                  />
                )
              }
            </span>
              </div>
            </Row>
          </div>
        </Row>



        <Row className="col-md-12" style={{paddingTop: 15}}>
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label"
                      style={{color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'}}
                >
                  Rate per hour
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className={data.rateCalcVisibleDisabled ? 'infoCircleDisabled' : 'infoCircle'}>
                    <span style={{padding: 6, color: 'white'}} data-tip data-for="ratePerHourInfo">i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          {!data.rateCalcVisibleDisabled
          && (
            <div className="customTooltip">
              <ReactTooltip id="ratePerHourInfo" effect="solid">
                <p style={{color: 'white'}}>{ratePerHourInfo}</p>
              </ReactTooltip>
            </div>
          )
          }
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label"
                      style={{color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'}}
                >
                  Two way cost / mile
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className={data.rateCalcVisibleDisabled ? 'infoCircleDisabled' : 'infoCircle'}>
                      <span style={{padding: 6, color: 'white'}} data-tip data-for='twoWayCostInfo'>i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          {!data.rateCalcVisibleDisabled
          && (
            <div className="customTooltip">
              <ReactTooltip id='twoWayCostInfo' effect='solid'>
                <p style={{color: 'white'}}>This value is calculated based on distances chosen in pickup / delivery
                  tab.</p>
              </ReactTooltip>
            </div>
          )
          }
        </Row>
        <Row className="col-md-12">
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio"
                       style={{marginTop: 9, width: 18, height: 18, marginLeft: 5}}
                       disabled={data.rateCalcVisibleDisabled}
                       checked={rateCalculator.rateTypeRadio === 'hour'}
                       onClick={() => this.handleSetRateType('hour')}
                />
              </div>
              <div className="col-md-10 form__form-group">
                <span style={{
                  marginLeft: 15,
                  marginTop: rateCalculator.rateTypeRadio !== 'hour' ? 9 : 0,
                  color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                }}
                >
                  {rateCalculator.rateTypeRadio !== 'hour' ? TFormat.asNumber(rateCalculator.ratePerHour)
                    : (
                      <TField
                        input={
                          {
                            onChange: this.handleRateHoursChange,
                            name: 'ratePerHour',
                            value: rateCalculator.ratePerHour
                          }
                        }
                        disabled={data.rateCalcVisibleDisabled}
                        tertiaryDisabled={data.rateCalcVisibleDisabled}
                        placeholder=""
                        type="text"
                        id="rateTypeRadio"
                        offClick={this.handleOffClick}
                      />
                    )
                  }
                </span>
              </div>
            </Row>
          </div>
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio"
                       style={{marginTop: 9, width: 18, height: 18, marginLeft: 5}}
                       checked={rateCalculator.rateTypeRadio === 'twoWay'}
                       disabled={data.rateCalcVisibleDisabled}
                       onClick={() => this.handleSetRateType('twoWay')}
                />
              </div>
              <div className="col-md-10 form__form-group">
                <span style={{
                  marginLeft: 15,
                  marginTop: rateCalculator.rateTypeRadio !== 'twoWay' ? 9 : 0,
                  color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                }}
                >
                  {rateCalculator.rateTypeRadio !== 'twoWay' ? TFormat.asNumber(rateCalculator.twoWayCostMile)
                    : (
                      <TField
                        input={
                          {
                            onChange: this.handleTwoWayCostChange,
                            name: 'twoWay',
                            value: rateCalculator.twoWayCostMile
                          }
                        }
                        disabled={data.rateCalcVisibleDisabled}
                        tertiaryDisabled={data.rateCalcVisibleDisabled}
                        placeholder=""
                        type="text"
                        id="rateTypeRadio"
                        offClick={this.handleOffClick}
                      />
                    )
                  }
                </span>
              </div>
            </Row>
          </div>
        </Row>
        {rateCalculator.invalidAddress &&
        <Row className="col-md-12">
          <div className="col-md-8 form__form-group">
            <span className="form__form-group-label">
              <span className="form-small-label">
                Input a valid address on Pickup & Delivery tab for an accurate calculation.
              </span>
            </span>
          </div>
        </Row>
        }
        <Row className="col-md-12">
          <hr/>
        </Row>
        <Row className="col-md-12">
          <Row className="col-md-12">
            <div className="col-md-4 form__form-group">
              <Row className="col-md-12">
                <span className="form__form-group-label"
                      style={{
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                      }}
                >
                  Load / Unload / Delivery
                </span>
              </Row>
            </div>
            <div className="col-md-4 form__form-group">
              <Row className="col-md-12">
                <div className="col-md-8 form__form-group">
                  <span className="form__form-group-label"
                        style={{fontStyle: 'italic',
                          fontWeight: 'bold',
                          color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                        }}
                  >
                    Travel Time
                  </span>
                </div>
                <div className="col-md-4 form__form-group">
                  <span className="form__form-group-label">
                    <span className={data.rateCalcVisibleDisabled ? 'infoCircleDisabled' : 'infoCircle'}>
                      <span style={{padding: 6, color: 'white'}} data-tip data-for="travelTimeInfo">i</span>
                    </span>
                  </span>
                </div>
                {!data.rateCalcVisibleDisabled
                && (
                <div className="customTooltip">
                  <ReactTooltip id="travelTimeInfo" effect="solid">
                    <p style={{color: 'white'}}>
                      This number is calculated by Trelar using
                      mapping data from your pickup and delivery addresses.
                    </p>
                  </ReactTooltip>
                </div>
                )
                }
              </Row>
            </div>
            <div className="col-md-4 form__form-group">
              <Row className="col-md-12">
                <span className="form__form-group-label"
                      style={{
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                      }}
                >
                  Truck Capacity
                </span>
              </Row>
            </div>
          </Row>
          <Row className="col-md-12">
            <div className="col-md-4">
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label"
                        style={{
                          color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                        }}
                  >
                    Load Time (min)
                  </span>
                </div>
                <div className="col-md-5 form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleLoadTimeChange,
                        name: 'loadTime',
                        value: loadTimeMin,
                        // disabled: rateCalculator.estimateTypeRadio === 'hour'
                      }
                    }
                    disabled={data.rateCalcVisibleDisabled}
                    tertiaryDisabled={data.rateCalcVisibleDisabled}
                    placeholder=""
                    type="text"
                    id="loadTime"
                    // offClick={this.handleOffClick}
                  />
                </div>
              </Row>
              <Row className="col-md-12" style={{paddingTop: 20}}>
                <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label"
                        style={{
                          color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                        }}
                  >
                    Unload Time (min)
                  </span>
                </div>
                <div className="col-md-5 form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleUnloadTimeChange,
                        name: 'unloadTime',
                        value: unloadTimeMin,
                        // disabled: rateCalculator.estimateTypeRadio === 'hour'

                      }
                    }
                    disabled={data.rateCalcVisibleDisabled}
                    tertiaryDisabled={data.rateCalcVisibleDisabled}
                    placeholder=""
                    type="text"
                    id="unloadTime"
                    // offClick={this.handleOffClick}
                  />
                </div>
              </Row>
            </div>
            <div className="col-md-4">
              <Row className="col-md-12">
                <div className="col-md-8 form__form-group">
                  <span className="form__form-group-label"
                        style={{
                          color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                        }}
                  >
                    Miles one way
                  </span>
                </div>
                <div className="col-md-4 form__form-group">
                  <span style={{
                    position: 'absolute',
                    color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                  }}
                  >
                    {milesIsNan
                      ? TFormat.asNumber(0.00)
                      : TFormat.asNumber(tabPickupDelivery.avgDistanceEnroute)}
                  </span>
                </div>
              </Row>
              <Row className="col-md-12" style={{paddingTop: 20}}>
                <div className="col-md-8 form__form-group">
                  <span className="form__form-group-label"
                        style={{
                          color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                        }}
                  >
                    Enroute (hrs)
                  </span>
                </div>
                <div className="col-md-4 form__form-group">
                  <span style={{
                    position: 'absolute',
                    color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                  }}
                  >
                    {travelTimeEnrouteIsNan
                      ? TFormat.asNumber(0.00)
                      : TFormat.asNumber(rateCalculator.travelTimeEnroute)}
                  </span>
                </div>
                {/*<div className="col-md-5 form__form-group">*/}
                {/*  <TField*/}
                {/*    input={*/}
                {/*      {*/}
                {/*        onChange: this.handleEnrouteTravelTimeChange,*/}
                {/*        name: 'travelTimeEnroute',*/}
                {/*        value: rateCalculator.travelTimeEnroute,*/}
                {/*        disabled: rateCalculator.estimateTypeRadio === 'hour'*/}
                {/*      }*/}
                {/*    }*/}
                {/*    placeholder=""*/}
                {/*    type="text"*/}
                {/*    id="travelTimeEnroute"*/}
                {/*    offClick={this.handleOffClick}*/}
                {/*  />*/}
                {/*</div>*/}
              </Row>
              <Row className="col-md-12" style={{paddingTop: 20}}>
                <div className="col-md-8 form__form-group">
                  <span className="form__form-group-label"
                        style={{
                          color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                        }}
                  >
                    Return Trip Home (hrs)
                  </span>
                </div>
                <div className="col-md-4 form__form-group">
                  <span style={{
                    position: 'absolute',
                    color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'

                  }}
                  >
                    {travelTimeReturnIsNan
                      ? TFormat.asNumber(0.00)
                      : TFormat.asNumber(rateCalculator.travelTimeReturn)}
                  </span>
                </div>
                {/*<div className="col-md-5 form__form-group">*/}
                {/*  <TField*/}
                {/*    input={*/}
                {/*      {*/}
                {/*        onChange: this.handleReturnTravelTimeChange,*/}
                {/*        name: 'travelTimeReturn',*/}
                {/*        value: rateCalculator.travelTimeReturn,*/}
                {/*        disabled: rateCalculator.estimateTypeRadio === 'hour'*/}
                {/*      }*/}
                {/*    }*/}
                {/*    placeholder=""*/}
                {/*    type="text"*/}
                {/*    id="travelTimeReturn"*/}
                {/*    offClick={this.handleOffClick}*/}
                {/*  />*/}
                {/*</div>*/}
              </Row>
            </div>
            <div className="col-md-4">
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label"
                        style={{
                          color: data.rateCalcVisibleDisabled ? '#C8C8C8' : '#282828'
                        }}
                  >
                    Truck Capacity
                  </span>
                </div>
                <div className="col-md-5 form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleTruckCapacityChange,
                        name: 'truckCapacity',
                        value: rateCalculator.truckCapacity,
                        // disabled: rateCalculator.estimateTypeRadio === 'hour'
                      }
                    }
                    disabled={data.rateCalcVisibleDisabled}
                    tertiaryDisabled={data.rateCalcVisibleDisabled}
                    placeholder=""
                    type="text"
                    id="truckCapacity"
                  />
                </div>
              </Row>
            </div>
          </Row>
        </Row>
        <Row className="col-md-12">
          <hr/>
        </Row>
        <Row className="col-md-12">
          <ButtonToolbar className="col-md-8 wizard__toolbar">
          </ButtonToolbar>
          <ButtonToolbar className="col-md-4 wizard__toolbar right-buttons">
          <Button
            color="primary"
            className="applyCalc"
            onClick={this.applyCalculations}
            style={{
              backgroundColor: data.rateCalcVisibleDisabled ? 'rgb(244, 244, 244)' : null,
              borderColor: data.rateCalcVisibleDisabled ? 'rgb(204, 204, 204)' : null,
              color: data.rateCalcVisibleDisabled ? 'rgb(204, 204, 204)' : null
            }}
          >
            {translate('Apply Calculations Above')}
          </Button>
          </ButtonToolbar>
          </Row>
      </React.Fragment>
    );
  }

  render() {
    const { t, jobRequest, jobEdit, btnSubmitting, closeModal, saveJob, goBack, nextPage } = { ...this.props };

    const translate = t;
    const {loaded} = {...this.state};
    const {data, tabMaterials} = {...this.props};
    const {rateCalculator} = {...data};
    if (loaded && data) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <form
                className="form form--horizontal addtruck__form"
                // onSubmit={e => this.saveTruck(e)}
                autoComplete="off"
              >
                <Row className="col-md-12">
                  <div className="col-md-4 form__form-group" style={{display: !rateCalculator.rateCalcOpen ? 'block' : 'none'}}>
                    <span style={{fontSize: 18, paddingTop: 20, paddingBottom: 20, color: '#47495C'}}>Enter Haul Rate</span>
                  </div>
                  <Col md={12}>
                    <Card style={{display: rateCalculator.rateCalcOpen ? 'block' : 'none'}}>
                      <CardBody className="" style={{backgroundColor: '#FEA7A7'}}>
                        <Row className="justify-content-md-left" style={{paddingTop: 6}}>
                          <Col md="auto">
                            <i className="material-icons iconSet" style={{color: '#B50000', paddingLeft: 15, marginRight: -10, paddingTop: 3}}>ic_report_problem</i>
                          </Col>
                          <Col md="auto" style={{paddingTop: 3}}>
                            <p style={{color: '#B50000', fontSize: 12}}>
                             DISABLED: You cannot edit fields while in calculator mode.
                              You will lose calculations that are not applied.
                            </p>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row className="col-md-12">
                  <div className="col-md-6 form__form-group">
                    <span className="form__form-group-label input-title"
                          style={{color: rateCalculator.rateCalcOpen ? '#C8C8C8' : '#282828'}}
                    >
                      Pay Type
                    </span>
                    <Row className="col-md-12 no-gutters" style={{marginLeft: -15}}>
                      <div className="col-md-6 form__form-group">
                        <Button
                          color="primary"
                          block
                          disabled={rateCalculator.rateCalcOpen}
                          className={data.payType === 'Hour' ? 'toggle__button' : 'toggle__button-active'}
                          onClick={() => this.handlePayTypeChange('Ton')}

                        >
                          <p>Tons</p>
                        </Button>
                      </div>
                      <div className="col-md-6 form__form-group">
                        <Button
                          block
                          color="primary"
                          disabled={rateCalculator.rateCalcOpen}
                          className={data.payType === 'Ton' ? 'toggle__button' : 'toggle__button-active'}
                          onClick={() => this.handlePayTypeChange('Hour')}

                        >
                          <p>Hours</p>
                        </Button>
                      </div>
                    </Row>
                  </div>
                  <div className="col-md-6 form__form-group" style={{marginLeft: -15}}>
                    <Row className="col-md-12">
                      <div className="col-md-8 form__form-group">
                        <span
                          className="form__form-group-label input-title"
                          style={{color: rateCalculator.rateCalcOpen ? '#C8C8C8' : '#282828'}}
                        >
                          Rate ($ / {data.payType.charAt(0).toUpperCase()
                        + data.payType.slice(1)})
                          <span
                            style={{
                              fontSize: 12,
                              color: rateCalculator.rateCalcOpen ? '#C8C8C8' : 'rgb(101, 104, 119)'
                            }}
                          > ( required )
                          </span>
                        </span>
                        <TField
                          input={
                            {
                              onChange: this.handleRatePerPayType,
                              name: 'ratePerPayType',
                              value: data.ratePerPayType
                            }
                          }
                          placeholder=""
                          secondaryDisabled={rateCalculator.rateCalcOpen}
                          disabled={rateCalculator.rateCalcOpen}
                          type="text"
                          id="ratePerPayType"
                          offClick={this.handleOffClick}
                        />
                      </div>
                      <div className="col-md-4 form__form-group">
                        <span
                          className="form__form-group-label input-title"
                          style={{color: rateCalculator.rateCalcOpen ? '#C8C8C8' : '#282828'}}
                        >
                          {tabMaterials.quantityType}s
                        </span>
                        <ReactTooltip id='quantity' effect='solid'>
                          <span>This is the quantity you defined in the Materials ( tab ).</span>
                        </ReactTooltip>
                        <TField
                          input={
                            {
                              onChange: null,
                              name: 'quanityTabMaterials',
                              value: tabMaterials.quantity
                            }
                          }
                          placeholder=""
                          disabled
                          // secondaryDisabled={rateCalculator.rateCalcOpen}
                          type="text"
                          id="quanityTabMaterials"
                        />
                      </div>
                    </Row>
                  </div>
                </Row>




                <Row className="col-md-12">
                  <div className="col-md-6 form__form-group">
                    <span className="form__form-group-label input-title"
                          style={{color: rateCalculator.rateCalcOpen ? '#C8C8C8' : '#282828'}}
                    >
                      Trip
                    </span>
                    <Row className="col-md-12 no-gutters" style={{marginLeft: -15}}>
                      <div className="col-md-6 form__form-group">
                        <Button
                          color="primary"
                          block
                          disabled={rateCalculator.rateCalcOpen}
                          className={data.tripType === 'oneWay' ? 'toggle__button' : 'toggle__button-active'}
                          onClick={() => this.handleTripTypeChange('twoWay')}

                        >
                          <p>Two - Way</p>
                        </Button>
                      </div>
                      <div className="col-md-6 form__form-group">
                        <Button
                          block
                          disabled={rateCalculator.rateCalcOpen}
                          color="primary"
                          className={data.tripType === 'twoWay' ? 'toggle__button' : 'toggle__button-active'}
                          onClick={() => this.handleTripTypeChange('oneWay')}

                        >
                          <p>One - Way</p>
                        </Button>
                      </div>
                    </Row>
                  </div>
                  <div className="col-md-6 form__form-group">
                    <span className="form__form-group-label input-title"
                          style={{color: rateCalculator.rateCalcOpen ? '#C8C8C8' : '#282828'}}
                    >
                      Round Down or Round Up?
                    </span>
                    <Row className="col-md-12 no-gutters" style={{marginLeft: -15}}>
                      <div className="col-md-6 form__form-group">
                        <Button
                          color="primary"
                          block
                          disabled={rateCalculator.rateCalcOpen}
                          className={data.roundType === 'up' ? 'toggle__button' : 'toggle__button-active'}
                          onClick={() => this.handleRoundTypeChange('down')}

                        >
                          <p>Round Down</p>
                        </Button>
                      </div>
                      <div className="col-md-6 form__form-group">
                        <Button
                          block
                          disabled={rateCalculator.rateCalcOpen}
                          color="primary"
                          className={data.roundType === 'down' ? 'toggle__button' : 'toggle__button-active'}
                          onClick={() => this.handleRoundTypeChange('up')}

                        >
                          <p>Round Up</p>
                        </Button>
                      </div>
                    </Row>
                  </div>
                </Row>



                <Row className="col-md-12">
                  <hr/>
                </Row>
                {this.renderDeliveryCosts()}
                <Row className="col-md-12">
                  <hr/>
                </Row>
                <Row className="col-md-12">
                  <ButtonToolbar className="col-md-4 wizard__toolbar">
                    <Button color="minimal" className="btn btn-outline-secondary"
                            type="button"
                            disabled={data.rateCalculator.rateCalcOpen}
                            onClick={() => closeModal()}
                    >
                      {translate('Cancel')}
                    </Button>
                  </ButtonToolbar>
                  <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                    {(!jobRequest && !jobEdit) && (
                      <Button
                        color="outline-primary"
                        className="next"
                        onClick={() => saveJob()}
                        loading={btnSubmitting}
                        loaderSize={10}
                        disabled={btnSubmitting || data.rateCalculator.rateCalcOpen}
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
                    <Button color="outline-primary" type="button"
                            className="previous"
                            disabled={data.rateCalculator.rateCalcOpen}
                            onClick={() => goBack()}
                    >
                      {translate('Back')}
                    </Button>
                    <Button
                      color="primary"
                      className="next"
                      disabled={data.rateCalculator.rateCalcOpen}
                      onClick={() => nextPage()}
                    >
                      {translate('Next')}
                    </Button>
                  </ButtonToolbar>
                </Row>
                <Row className="col-md-12">
                  <hr/>
                </Row>
                <Row className="col-md-12" style={{paddingTop: 15}}>
                {/*<Row className="col-md-12" style={{paddingTop: 15}} onClick={this.toggleRateCalc}>*/}
                  {/*<div className="col-md-6 form__form-group">*/}
                  {/*  <span className={rateCalculator.rateCalcOpen ? 'triangle-down' : 'triangle-right'}*/}
                  {/*        style={{marginTop: 3}}*/}
                  {/*  />*/}
                  {/*</div>*/}
                  <div className="col-md-1 form__form-group dashboard">
                    <ToggleButton
                      input={
                        {
                          onChange: this.toggleRateCalc,
                          name: 'rateCalcToggle',
                          value: data.rateCalculator.rateCalcOpen
                        }
                      }
                    />
                  </div>
                  <div className="col-md-11 form__form-group dashboard">
                    <Row className="col-md-12">
                      <span style={{fontSize: 18, paddingLeft: 10, color: '#47495C'}}>
                        Rate Calculator
                      </span>
                    </Row>
                    <Row className="col-md-12">
                      <div className="dashboard dashboard__job-create-section-title">
                        <span style={{color: '#282828', fontSize: 14}}>
                          Use this calculator
                            to help estimate what a tonnage rate is equal to in an hourly rate.
                            This does not affect the actual haul rate you decide on above.
                        </span>
                      </div>
                    </Row>
                  </div>
                </Row>
                <Row className="col-md-12" style={{paddingTop: 20}}/>
                {(rateCalculator.rateCalcOpen || data.rateCalcVisibleDisabled) && this.renderRateCalc()}
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

HaulRate.propTypes = {
  closeModal: PropTypes.func.isRequired,
  saveJob: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  jobRequest: PropTypes.bool.isRequired,
  jobEdit: PropTypes.bool.isRequired,
  btnSubmitting: PropTypes.bool.isRequired,
  scrollToTopForm: PropTypes.bool.isRequired,


  data: PropTypes.shape({
    payType: PropTypes.string,
    ratePerPayType: PropTypes.string,
    rateCalcOpen: PropTypes.bool,
    avgDistanceEnroute: 0,
    avgDistanceReturn: 0,
    avgTimeEnroute: 0,
    avgTimeReturn: 0,
    rateCalculator: PropTypes.shape({
      estimateTypeRadio: PropTypes.string,
      rateTypeRadio: PropTypes.string,
      estimatedTons: PropTypes.number,
      estimatedHours: PropTypes.number,
      travelTimeEnroute: PropTypes.number,
      travelTimeReturn: PropTypes.number,
      loadTime: PropTypes.number,
      unloadTime: PropTypes.number,
      ratePerTon: PropTypes.number,
      ratePerHour: PropTypes.number,
      invalidAddress: PropTypes.bool,
      truckCapacity: PropTypes.number,
      travelTime: PropTypes.number
    })
  }),
  tabPickupDelivery: PropTypes.shape({
    selectedStartAddressId: PropTypes.number,
    selectedEndAddressId: PropTypes.number,
    endLocationLatitude: PropTypes.number,
    endLocationLongitude: PropTypes.number,
    startLocationLatitude: PropTypes.number,
    startLocationLongitude: PropTypes.number,
    allUSstates: PropTypes.array,
    allAddresses: PropTypes.array,
    startLocationAddressName: PropTypes.string,
    endLocationAddressName: PropTypes.string,
    endLocationAddress1: PropTypes.string,
    endLocationAddress2: PropTypes.string,
    endLocationCity: PropTypes.string,
    endLocationState: PropTypes.string,
    endLocationZip: PropTypes.string,
    startLocationAddress1: PropTypes.string,
    startLocationAddress2: PropTypes.string,
    startLocationCity: PropTypes.string,
    startLocationState: PropTypes.string,
    startLocationZip: PropTypes.string
  }),
  tabMaterials: PropTypes.shape({
    materialType: PropTypes.string,
    quantityType: PropTypes.string,
    quantity: PropTypes.string,
    allMaterials: PropTypes.array,
    selectedMaterial: PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    }),
    estMaterialPricing: PropTypes.string,
    reqHandlerMaterials: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerQuantity: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    })
  })
};

HaulRate.defaultProps = {
  data: null,
  tabMaterials: null,
  tabPickupDelivery: null
};

export default withTranslation()(HaulRate);
