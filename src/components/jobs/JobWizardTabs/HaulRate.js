import React, {PureComponent} from 'react';
import {
  Button,
  Card,
  CardBody,
  // Container,
  Col,
  Row,
  Input
} from 'reactstrap';
import PropTypes from 'prop-types';
import '../jobs.css';
import ReactTooltip from 'react-tooltip';
import TField from '../../common/TField';
import TSpinner from '../../common/TSpinner';
import GeoUtils from '../../../utils/GeoUtils';
import DeliveryCostsSummary from './DeliveryCostsSummary';


// import USstates from '../../utils/usStates';

class HaulRate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
    this.handlePayTypeChange = this.handlePayTypeChange.bind(this);
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
  }

  async componentDidMount() {
    const {data, tabPickupDelivery, tabMaterials, handleInputChange} = {...this.props};
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
      data.rateCalculator.travelTimeReturn = tabPickupDelivery.avgTimeEnroute;
      data.rateCalculator.loadTime = 0.25;
      data.rateCalculator.unloadTime = 0.25;
      const oneLoad = parseFloat(data.rateCalculator.loadTime) + parseFloat(data.rateCalculator.unloadTime)
        + parseFloat(data.rateCalculator.travelTimeReturn) + parseFloat(data.rateCalculator.travelTimeEnroute);
      if (tabMaterials.quantityType === 'Hour') {
        data.rateCalculator.estimatedHours = tabMaterials.quantity;
        const numTrips = Math.floor(data.rateCalculator.estimatedHours / oneLoad);
        data.rateCalculator.estimatedTons = (numTrips * data.rateCalculator.truckCapacity).toFixed(2);
      } else if (tabMaterials.quantityType === 'Ton') {
        data.rateCalculator.estimatedTons = tabMaterials.quantity;
        const numTrips = Math.ceil(data.rateCalculator.estimatedTons / data.rateCalculator.truckCapacity);
        data.rateCalculator.estimatedHours = (numTrips * oneLoad).toFixed(2);
      }
    }
    handleInputChange('tabHaulRate', data);
    this.setState({loaded: true});
  }

  componentWillReceiveProps(nextProps) {
    const {data, tabPickupDelivery, tabMaterials, handleInputChange} = {...nextProps};
    if (tabPickupDelivery.startLocationLatitude && tabPickupDelivery.startLocationLongitude
      && tabPickupDelivery.endLocationLatitude && tabPickupDelivery.endLocationLongitude) {
      if (tabPickupDelivery.avgTimeEnroute !== data.rateCalculator.travelTimeEnroute
        || tabPickupDelivery.avgTimeEnroute !== data.rateCalculator.travelTimeReturn) {
        data.rateCalculator.invalidAddress = false;
        data.rateCalculator.travelTimeEnroute = tabPickupDelivery.avgTimeEnroute;
        data.rateCalculator.travelTimeReturn = tabPickupDelivery.avgTimeEnroute;
        data.rateCalculator.loadTime = 0.25;
        data.rateCalculator.unloadTime = 0.25;
        const oneLoad = parseFloat(data.rateCalculator.loadTime) + parseFloat(data.rateCalculator.unloadTime)
          + parseFloat(data.rateCalculator.travelTimeReturn) + parseFloat(data.rateCalculator.travelTimeEnroute);
        if (tabMaterials.quantityType === 'Hour') {
          data.rateCalculator.estimatedHours = tabMaterials.quantity;
          const numTrips = Math.floor(data.rateCalculator.estimatedHours / oneLoad);
          data.rateCalculator.estimatedTons = (numTrips * data.rateCalculator.truckCapacity).toFixed(2);
        } else if (tabMaterials.quantityType === 'Ton') {
          data.rateCalculator.estimatedTons = tabMaterials.quantity;
          const numTrips = Math.ceil(data.rateCalculator.estimatedTons / data.rateCalculator.truckCapacity);
          data.rateCalculator.estimatedHours = (numTrips * oneLoad).toFixed(2);
        }
        handleInputChange('tabHaulRate', data);
        this.setState({data: {...data}});
      }
    }
    this.setState({data: {...data}});
  }

  toggleRateCalc() {
    const {data, handleInputChange} = {...this.props};
    data.rateCalculator.rateCalcOpen = !data.rateCalculator.rateCalcOpen;
    handleInputChange('tabHaulRate', data);
  }

  handleEstimatedTonsChange(estTons) {
    const {data, handleInputChange} = {...this.props};
    let {value} = estTons.target;
    value = value.replace(/\D/g, '');
    const oneLoad = parseFloat(data.rateCalculator.loadTime) + parseFloat(data.rateCalculator.unloadTime)
      + parseFloat(data.rateCalculator.travelTimeReturn) + parseFloat(data.rateCalculator.travelTimeEnroute);
    data.rateCalculator.estimatedTons = value;
    const numTrips = Math.ceil(data.rateCalculator.estimatedTons / data.rateCalculator.truckCapacity);
    data.rateCalculator.estimatedHours = (numTrips * oneLoad).toFixed(2);

    // update unselected rate
    if (data.rateCalculator.rateTypeRadio === 'ton') {
      const estimatedTotalPrice = (data.rateCalculator.estimatedTons * data.rateCalculator.ratePerTon).toFixed(2);
      data.rateCalculator.ratePerHour = data.rateCalculator.estimatedHours > 0
        ? (estimatedTotalPrice / data.rateCalculator.estimatedHours).toFixed(2)
        : 0;
    } else if (data.rateCalculator.rateTypeRadio === 'hour') {
      const estimatedTotalPrice = (data.rateCalculator.estimatedHours * data.rateCalculator.ratePerHour).toFixed(2);
      data.rateCalculator.ratePerTon = data.rateCalculator.estimatedTons > 0
        ? (estimatedTotalPrice / data.rateCalculator.estimatedTons).toFixed(2)
        : 0;
    }
    handleInputChange('tabHaulRate', data);
  }

  handleRateTonsChange(rateTon) {
    const {data, handleInputChange} = {...this.props};
    let {value} = rateTon.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    data.rateCalculator.ratePerTon = value;
    data.rateCalculator.ratePerHour =
      ((data.rateCalculator.ratePerTon * data.rateCalculator.estimatedTons) / data.rateCalculator.estimatedHours).toFixed(2);
    handleInputChange('tabHaulRate', data);
  }

  handleRateHoursChange(rateHour) {
    const {data, handleInputChange} = {...this.props};
    let {value} = rateHour.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    data.rateCalculator.ratePerHour = value;
    data.rateCalculator.ratePerTon =
      ((data.rateCalculator.ratePerHour * data.rateCalculator.estimatedHours) / data.rateCalculator.estimatedTons).toFixed(2);
    handleInputChange('tabHaulRate', data);
  }

  handleEstimatedHoursChange(estHours) {
    const {data, handleInputChange} = {...this.props};
    const oneLoad = parseFloat(data.rateCalculator.loadTime) + parseFloat(data.rateCalculator.unloadTime)
      + parseFloat(data.rateCalculator.travelTimeReturn) + parseFloat(data.rateCalculator.travelTimeEnroute);
    let {value} = estHours.target;
    value = value.replace(/\D/g, '');
    data.rateCalculator.estimatedHours = value;
    const numTrips = Math.floor(data.rateCalculator.estimatedHours / oneLoad);
    data.rateCalculator.estimatedTons = (numTrips * data.rateCalculator.truckCapacity).toFixed(2);

    // update unselected rate
    if (data.rateCalculator.rateTypeRadio === 'hour') {
      const estimatedTotalPrice = (data.rateCalculator.estimatedHours * data.rateCalculator.ratePerHour).toFixed(2);
      data.rateCalculator.ratePerTon = data.rateCalculator.estimatedTons > 0
        ? (estimatedTotalPrice / data.rateCalculator.estimatedTons).toFixed(2)
        : 0;
    }

    handleInputChange('tabHaulRate', data);
  }

  handleRatePerPayType(ratePerPayType) {
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    let {value} = ratePerPayType.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    data.ratePerPayType = value;
    if (data.payType === 'Ton') {
      rateCalculator.ratePerTon = value;
      rateCalculator.ratePerHour =
        ((rateCalculator.ratePerTon * rateCalculator.estimatedTons) / rateCalculator.estimatedHours).toFixed(2);
    } else if (data.payType === 'Hour') {
      rateCalculator.ratePerHour = value;
      rateCalculator.ratePerTon =
        ((rateCalculator.ratePerHour * rateCalculator.estimatedHours) / rateCalculator.estimatedTons).toFixed(2);

    }
    handleInputChange('tabHaulRate', data);
  }

  handlePayTypeChange(quantityType) {
    const {data, handleInputChange} = {...this.props};
    data.payType = quantityType;
    handleInputChange('tabHaulRate', data);
  }

  handleLoadTimeChange(loadTime) {
    let {value} = loadTime.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.loadTime = value;
    const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
      + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
    const numTrips = Math.floor(rateCalculator.estimatedHours / oneLoad);
    rateCalculator.estimatedTons = numTrips * rateCalculator.truckCapacity;
    handleInputChange('tabHaulRate', data);
  }

  handleUnloadTimeChange(unloadTime) {
    let {value} = unloadTime.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.unloadTime = value;
    const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
      + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
    const numTrips = Math.floor(rateCalculator.estimatedHours / oneLoad);
    rateCalculator.estimatedTons = numTrips * rateCalculator.truckCapacity;
    handleInputChange('tabHaulRate', data);
  }

  handleEnrouteTravelTimeChange(travelTimeEnroute) {
    let {value} = travelTimeEnroute.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.travelTimeEnroute = value;
    const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
      + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
    const numTrips = Math.floor(rateCalculator.estimatedHours / oneLoad);
    rateCalculator.estimatedTons = numTrips * rateCalculator.truckCapacity;
    handleInputChange('tabHaulRate', data);
  }

  handleReturnTravelTimeChange(travelTimeReturn) {
    let {value} = travelTimeReturn.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.travelTimeReturn = value;
    const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
      + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
    const numTrips = Math.floor(rateCalculator.estimatedHours / oneLoad);
    rateCalculator.estimatedTons = numTrips * rateCalculator.truckCapacity;
    handleInputChange('tabHaulRate', data);
  }

  handleTruckCapacityChange(truckCapacity) {
    let {value} = truckCapacity.target;
    value = value.replace(/\D/g, '');
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.truckCapacity = value;
    const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
      + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
    const numTrips = Math.floor(rateCalculator.estimatedHours / oneLoad);
    rateCalculator.estimatedTons = numTrips * rateCalculator.truckCapacity;
    handleInputChange('tabHaulRate', data);
  }

  handleSetEstimateType(e) {
    const {data, handleInputChange} = {...this.props};
    data.rateCalculator.estimateTypeRadio = e;
    if (e === 'hour') {
      this.handleSetRateType('hour');
    }
    handleInputChange('tabHaulRate', data);
  }

  handleSetRateType(e) {
    const {data, handleInputChange} = {...this.props};
    data.rateCalculator.rateTypeRadio = e;
    handleInputChange('tabHaulRate', data);
  }

  renderDeliveryCosts() {
    const {data, tabMaterials, tabPickupDelivery} = {...this.props};

    const truckCapacity = 22;

    const haulCostPerTonHour = data.ratePerPayType;
    let oneWayCostPerTonHourPerMile = 0;
    let deliveredPricePerTon = 0;
    let deliveredPriceJob = 0;
    let estimatedCostForJob = 0;
    // const sufficientInfo = (parseFloat(data.avgTimeEnroute) + parseFloat(data.avgTimeReturn)) * parseFloat(data.ratePerPayType);
    if (haulCostPerTonHour > 0) {
      // haulCostPerTonHour = ((sufficientInfo) / parseFloat(data.rateCalculator.truckCapacity)).toFixed(2);
      // oneWayCostPerTonHourPerMile = data.avgDistanceEnroute > 0 ? (parseFloat(haulCostPerTonHour) / parseFloat(data.avgDistanceEnroute)).toFixed(2) : 0;
      if (data.payType === 'Ton') {
        oneWayCostPerTonHourPerMile = tabPickupDelivery.avgDistanceEnroute > 0 ? (parseFloat(haulCostPerTonHour) / parseFloat(tabPickupDelivery.avgDistanceEnroute)).toFixed(2) : 0;
      } else {
        const oneLoad = 0.5 + parseFloat(tabPickupDelivery.avgTimeReturn) + parseFloat(tabPickupDelivery.avgTimeEnroute);
        oneWayCostPerTonHourPerMile = (oneLoad * (parseFloat(data.ratePerPayType)) / truckCapacity / (parseFloat(tabPickupDelivery.avgDistanceEnroute))).toFixed(2);
      }
      deliveredPricePerTon = (parseFloat(tabMaterials.estMaterialPricing) + parseFloat(haulCostPerTonHour)).toFixed(2);
      estimatedCostForJob = (parseFloat(haulCostPerTonHour) * parseFloat(tabMaterials.quantity)).toFixed(2);
      if (tabMaterials.quantityType === 'Ton') {
        deliveredPriceJob = (parseFloat(deliveredPricePerTon) * parseFloat(tabMaterials.quantity)).toFixed(2);
      } else {
        const oneLoad = 0.5 + parseFloat(tabPickupDelivery.avgTimeReturn) + parseFloat(tabPickupDelivery.avgTimeEnroute);
        const numTrips = Math.floor(parseFloat(tabMaterials.quantity) / oneLoad);
        const estimatedTons = (numTrips * truckCapacity).toFixed(2);
        deliveredPriceJob = (parseFloat(deliveredPricePerTon) * estimatedTons).toFixed(2);
      }
    }

    return (
      <DeliveryCostsSummary
        estMaterialPricing={tabMaterials.estMaterialPricing}
        deliveredPricePerTon={deliveredPricePerTon}
        deliveredPriceJob={deliveredPriceJob}
        payType={data.payType}
        oneWayCostPerTonHourPerMile={oneWayCostPerTonHourPerMile}
        haulCostPerTonHour={haulCostPerTonHour}
        estimatedCostForJob={estimatedCostForJob}
      />
    );
  }


  renderRateCalc() {
    const {data, tabMaterials} = {...this.props};
    const {rateCalculator} = {...data};
    let estimatedTotalPrice = 0;
    if (rateCalculator.estimateTypeRadio === 'ton' && rateCalculator.rateTypeRadio === 'ton') {
      estimatedTotalPrice = (rateCalculator.estimatedTons * rateCalculator.ratePerTon).toFixed(2);
    } else if (rateCalculator.estimateTypeRadio === 'hour' && rateCalculator.rateTypeRadio === 'hour') {
      estimatedTotalPrice = (rateCalculator.estimatedHours * rateCalculator.ratePerHour).toFixed(2);
    } else if (rateCalculator.estimateTypeRadio === 'ton' && rateCalculator.rateTypeRadio === 'hour') {
      const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
        + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
      const numTrips = Math.ceil(rateCalculator.estimatedTons / rateCalculator.truckCapacity);
      const estHours = numTrips * oneLoad;
      estimatedTotalPrice = (estHours * rateCalculator.ratePerHour).toFixed(2);
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

    return (
      <React.Fragment>
        <Row className="col-md-12">
          <div className="dashboard dashboard__job-create-section-title">
              <span style={{fontStyle: 'italic'}}>Use this calculator to help estimate what a tonnage rate is equal to in an hourly rate.
                This does not affect the actual haul rate you decide on above.</span>
          </div>
        </Row>
        <Row className="col-md-12" style={{paddingTop: 15}}>
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label">Estimated Tons
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className="infoCircle">
                      <span style={{padding: 6, color: 'white'}} data-tip data-for='estimatedTonsInfo'>i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          <div className="customTooltip">
            <ReactTooltip id='estimatedTonsInfo' effect='solid'>
              <p style={{color: 'white'}}>{estimatedTonsInfo}</p>
            </ReactTooltip>
          </div>
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label">Rate per ton
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className="infoCircle">
                      <span style={{padding: 6, color: 'white'}} data-tip data-for='ratePerTonInfo'>i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          <div className="customTooltip">
            <ReactTooltip id='ratePerTonInfo' effect='solid'>
              <p style={{color: 'white'}}>{ratePerTonInfo}</p>
            </ReactTooltip>
          </div>
          {rateCalculator.rateTypeRadio === 'ton'
          && (
            <div className="col-md-4 form__form-group">
              <span className="form__form-group-label">Estimated Total Price</span>
            </div>
          )
          }
        </Row>
        <Row className="col-md-12">
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio"
                       style={{marginTop: 9, width: 18, height: 18, marginLeft: 5}}
                       checked={rateCalculator.estimateTypeRadio === 'ton'}
                       onClick={() => this.handleSetEstimateType('ton')}/>
              </div>
              <div className="col-md-10 form__form-group">
            <span style={{
              marginLeft: 15,
              marginTop: rateCalculator.estimateTypeRadio === 'hour' ? 9 : 0
            }}
            >
              {rateCalculator.estimateTypeRadio === 'hour' ? rateCalculator.estimatedTons
                : (
                  <TField
                    input={
                      {
                        onChange: this.handleEstimatedTonsChange,
                        name: 'estimatedTons',
                        value: rateCalculator.estimatedTons
                      }
                    }
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
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio" disabled={rateCalculator.estimateTypeRadio === 'hour'}
                       style={{marginTop: 9, width: 18, height: 18, marginLeft: 5}}
                       checked={rateCalculator.rateTypeRadio === 'ton'} onClick={() => this.handleSetRateType('ton')}/>
              </div>
              <div className="col-md-10 form__form-group">
            <span style={{
              marginLeft: 15,
              marginTop: rateCalculator.rateTypeRadio === 'hour' ? 9 : 0
            }}
            >
              {rateCalculator.rateTypeRadio === 'hour' ? rateCalculator.ratePerTon
                : (
                  <TField
                    input={
                      {
                        onChange: this.handleRateTonsChange,
                        name: 'ratePerTon',
                        value: rateCalculator.ratePerTon
                      }
                    }
                    placeholder=""
                    type="text"
                    id="rateTypeRadio"
                  />
                )
              }
            </span>
              </div>
            </Row>
          </div>
          {rateCalculator.rateTypeRadio === 'ton'
          && (
            <div className="col-md-4 form__form-group">
              <span style={{
                marginTop: rateCalculator.rateTypeRadio === 'ton' ? 0 : 6,
                marginLeft: 40,
                position: 'absolute'
              }}
              >
              $ {estimatedTotalPrice}
            </span>
            </div>
          )}
        </Row>
        <Row className="col-md-12" style={{paddingTop: 15}}>
        <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label">Estimated Hours
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className="infoCircle">
                      <span style={{padding: 6, color: 'white'}} data-tip data-for='estimatedHoursInfo'>i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          <div className="customTooltip">
            <ReactTooltip id='estimatedHoursInfo' effect='solid'>
              <p style={{color: 'white'}}>{estimatedHoursInfo}</p>
            </ReactTooltip>
          </div>
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-8 form__form-group">
                <span className="form__form-group-label">Rate per hour
                </span>
              </div>
              <div className="col-md-4 form__form-group">
                <span className="form__form-group-label">
                  <span className="infoCircle">
                      <span style={{padding: 6, color: 'white'}} data-tip data-for='ratePerHourInfo'>i</span>
                  </span>
                </span>
              </div>
            </Row>
          </div>
          <div className="customTooltip">
            <ReactTooltip id='ratePerHourInfo' effect='solid'>
              <p style={{color: 'white'}}>{ratePerHourInfo}</p>
            </ReactTooltip>
          </div>
          {rateCalculator.rateTypeRadio === 'hour'
          && (
            <div className="col-md-4 form__form-group">
              <span className="form__form-group-label">Estimated Total Price</span>
            </div>
          )
          }
        </Row>
        <Row className="col-md-12">
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio"
                       style={{marginTop: 9, width: 18, height: 18, marginLeft: 5}}
                       checked={rateCalculator.estimateTypeRadio === 'hour'}
                       onClick={() => this.handleSetEstimateType('hour')}/>
              </div>
              <div className="col-md-10 form__form-group">

            <span style={{
              marginLeft: 15,
              marginTop: rateCalculator.estimateTypeRadio === 'ton' ? 9 : 0
            }}
            >
              {rateCalculator.estimateTypeRadio === 'ton' ? rateCalculator.estimatedHours
                : (
                  <TField
                    input={
                      {
                        onChange: this.handleEstimatedHoursChange,
                        name: 'estimatedHours',
                        value: rateCalculator.estimatedHours
                      }
                    }
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
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-2 form__form-group">
                <Input type="radio"
                       style={{marginTop: 9, width: 18, height: 18, marginLeft: 5}}
                       checked={rateCalculator.rateTypeRadio === 'hour'}
                       onClick={() => this.handleSetRateType('hour')}/>
              </div>
              <div className="col-md-10 form__form-group">
                <span style={{
                  marginLeft: 15,
                  marginTop: rateCalculator.rateTypeRadio === 'ton' ? 9 : 0
                }}
                >
                  {rateCalculator.rateTypeRadio === 'ton' ? rateCalculator.ratePerHour
                    : (
                      <TField
                        input={
                          {
                            onChange: this.handleRateHoursChange,
                            name: 'ratePerHour',
                            value: rateCalculator.ratePerHour
                          }
                        }
                        placeholder=""
                        type="text"
                        id="rateTypeRadio"
                      />
                    )
                  }
                </span>
              </div>
            </Row>
          </div>
          {rateCalculator.rateTypeRadio === 'hour'
          && (
            <div className="col-md-4 form__form-group">
              <span style={{
                marginTop: rateCalculator.rateTypeRadio === 'ton' ? 0 : 6,
                marginLeft: 40,
                position: 'absolute'
              }}
              >
              $ {estimatedTotalPrice}
            </span>
            </div>
          )}
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
              <Row className="col-md-12 ">
                <span className="form__form-group-label">Load / Unload / Delivery</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
            <div className="col-md-4 form__form-group">
              <Row className="col-md-12 ">
                <span className="form__form-group-label">Travel Time</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
            <div className="col-md-4 form__form-group">
              <Row className="col-md-12 ">
                <span className="form__form-group-label">Truck Capacity</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
          </Row>
          <Row className="col-md-12">
            <div className="col-md-4">
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label">Load Time (hrs)</span>
                </div>
                <div className="col-md-5 form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleLoadTimeChange,
                        name: 'loadTime',
                        value: rateCalculator.loadTime,
                        disabled: rateCalculator.estimateTypeRadio === 'hour'
                      }
                    }
                    placeholder=""
                    type="text"
                    id="loadTime"
                  />
                </div>
              </Row>
              <Row className="col-md-12" style={{paddingTop: 20}}>
                <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label">Unload Time (hrs)</span>
                </div>
                <div className="col-md-5 form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleUnloadTimeChange,
                        name: 'unloadTime',
                        value: rateCalculator.unloadTime,
                        disabled: rateCalculator.estimateTypeRadio === 'hour'

                      }
                    }
                    placeholder=""
                    type="text"
                    id="unloadTime"
                  />
                </div>
              </Row>
            </div>
            <div className="col-md-4">
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label">Enroute (hrs)</span>
                </div>
                <div className="col-md-5 form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleEnrouteTravelTimeChange,
                        name: 'travelTimeEnroute',
                        value: rateCalculator.travelTimeEnroute,
                        disabled: rateCalculator.estimateTypeRadio === 'hour'
                      }
                    }
                    placeholder=""
                    type="text"
                    id="travelTimeEnroute"
                  />
                </div>
              </Row>
              <Row className="col-md-12" style={{paddingTop: 20}}>
                <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label">Return Trip Home (hrs)</span>
                </div>
                <div className="col-md-5 form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleReturnTravelTimeChange,
                        name: 'travelTimeReturn',
                        value: rateCalculator.travelTimeReturn,
                        disabled: rateCalculator.estimateTypeRadio === 'hour'
                      }
                    }
                    placeholder=""
                    type="text"
                    id="travelTimeReturn"
                  />
                </div>
              </Row>
            </div>
            <div className="col-md-4">
              <Row className="col-md-12">
                <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label">Truck Capacity</span>
                </div>
                <div className="col-md-5 form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleTruckCapacityChange,
                        name: 'truckCapacity',
                        value: rateCalculator.truckCapacity,
                        disabled: rateCalculator.estimateTypeRadio === 'hour'
                      }
                    }
                    placeholder=""
                    type="text"
                    id="truckCapacity"
                  />
                </div>
              </Row>
            </div>
          </Row>
        </Row>
      </React.Fragment>
    );
  }

  render() {
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
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">Pay Type</span>
                    <Button
                      color="primary"
                      className={data.payType === 'Hour' ? 'toggle__button' : 'toggle__button-active'}
                      onClick={() => this.handlePayTypeChange('Ton')}

                    >
                      <p>tons</p>
                    </Button>
                    <Button
                      color="primary"
                      className={data.payType === 'Ton' ? 'toggle__button' : 'toggle__button-active'}
                      onClick={() => this.handlePayTypeChange('Hour')}

                    >
                      <p>hours</p>
                    </Button>
                  </div>
                  <div className="col-md-4 form__form-group">
                    <span
                      className="form__form-group-label">Rate ($ / {data.payType.charAt(0).toUpperCase()
                    + data.payType.slice(1)})
                      <span
                        style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}> ( required ) </span>
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
                      type="text"
                      id="ratePerPayType"
                    />
                  </div>
                  <div className="col-md-4 form__form-group">
                    <span
                      className="form__form-group-label">{tabMaterials.quantityType}s
                    </span>
                    <ReactTooltip id='quantity' effect='solid'>
                      <span>This is the quantity you defined in the Materials ( tab ).</span>
                    </ReactTooltip>

                    <span
                      className="form__form-group-label">{tabMaterials.quantity}
                    </span>
                  </div>
                </Row>
                <Row className="col-md-12">
                  <hr/>
                </Row>
                <Row className="col-md-12" style={{paddingTop: 15}} onClick={this.toggleRateCalc}>
                <span className={rateCalculator.rateCalcOpen ? 'triangle-down' : 'triangle-right'}
          style={{marginTop: 3}}/>
                  <div className="dashboard">
                    <span style={{fontSize: 16, paddingLeft: 10, color: 'rgb(102, 102, 102)'}}>Rate Calculator</span>
                  </div>
                </Row>
                <Row className="col-md-12">
                  <hr/>
                </Row>
                {rateCalculator.rateCalcOpen && this.renderRateCalc()}
                <Row className="col-md-12" style={{paddingTop: 20}}>
                </Row>
                {this.renderDeliveryCosts()}
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

export default HaulRate;
