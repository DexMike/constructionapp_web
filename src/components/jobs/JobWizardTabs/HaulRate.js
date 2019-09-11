import React, {PureComponent} from 'react';
import {
  Button,
  Card,
  CardBody,
  // Container,
  Col,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import '../jobs.css';
import TField from '../../common/TField';
import TSpinner from '../../common/TSpinner';
import GeoUtils from '../../../utils/GeoUtils';
import ReactTooltip from 'react-tooltip';


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
    const startString = `${tabPickupDelivery.startLocationAddress1} ${tabPickupDelivery.startLocationCity} ${tabPickupDelivery.startLocationState} ${tabPickupDelivery.startLocationZip}`;
    const endString = `${tabPickupDelivery.endLocationAddress1} ${tabPickupDelivery.endLocationCity} ${tabPickupDelivery.endLocationState} ${tabPickupDelivery.endLocationZip}`;
    const startCoordinates = await GeoUtils.getCoordsFromAddress(startString);
    const endCoordinates = await GeoUtils.getCoordsFromAddress(endString);
    if (!endCoordinates.lat || !startCoordinates.lat
      || !endCoordinates.lng || !startCoordinates.lng) {
      data.rateCalculator.invalidAddress = true;
      if (tabMaterials.quantityType === 'ton') {
        // data.rateCalculator.estimatedTons = tabMaterials.quantity;
        // above has to be calculated with hours
      } else if (tabMaterials.quantityType === 'hour') {
        data.rateCalculator.estimatedHours = tabMaterials.quantity;
      }
      handleInputChange('tabHaulRate', data);
    } else {
      const waypoint0 = `${startCoordinates.lat},${startCoordinates.lng}`;
      const waypoint1 = `${endCoordinates.lat},${endCoordinates.lng}`;
      const travelInfoEnroute = await GeoUtils.getDistance(waypoint0, waypoint1);
      const travelInfoReturn = await GeoUtils.getDistance(waypoint1, waypoint0);
      data.rateCalculator.travelTimeEnroute =
        (parseInt(travelInfoEnroute.travelTime) / 3600).toFixed(2);
      data.rateCalculator.travelTimeReturn =
        (parseInt(travelInfoReturn.travelTime) / 3600).toFixed(2);
      data.rateCalculator.loadTime = 0.25;
      data.rateCalculator.unloadTime = 0.25;
      const oneLoad = parseFloat(data.rateCalculator.loadTime) + parseFloat(data.rateCalculator.unloadTime)
        + parseFloat(data.rateCalculator.travelTimeReturn) + parseFloat(data.rateCalculator.travelTimeEnroute);
      debugger;
      if (tabMaterials.quantityType === 'hour') {
        data.rateCalculator.estimatedHours = tabMaterials.quantity;
        const numTrips = Math.floor(data.rateCalculator.estimatedHours / oneLoad);
        data.rateCalculator.estimatedTons = numTrips * data.rateCalculator.truckCapacity;
      } else if (tabMaterials.quantityType === 'ton') {
        data.rateCalculator.estimatedTons = tabMaterials.quantity;
        const numTrips = Math.ceil(data.rateCalculator.estimatedTons / data.rateCalculator.truckCapacity);
        data.rateCalculator.estimatedHours = numTrips * oneLoad
        debugger;
      }
      handleInputChange('tabHaulRate', data);


    }
    this.setState({loaded: true});
  }

  componentWillReceiveProps(nextProps) {
    const {data} = {...nextProps};
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
    data.rateCalculator.estimatedTons = value;
    handleInputChange('tabHaulRate', data);
  }

  handleRateTonsChange(rateTon) {
    const {data, handleInputChange} = {...this.props};
    let {value} = rateTon.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    data.rateCalculator.ratePerTon = value;
    handleInputChange('tabHaulRate', data);
  }

  handleRateHoursChange(rateHour) {
    const {data, handleInputChange} = {...this.props};
    let {value} = rateHour.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    data.rateCalculator.ratePerHour = value;
    handleInputChange('tabHaulRate', data);
  }

  handleEstimatedHoursChange(estHours) {
    const {data, handleInputChange} = {...this.props};
    let {value} = estHours.target;
    value = value.replace(/\D/g, '');
    data.rateCalculator.estimatedHours = value;
    handleInputChange('tabHaulRate', data);
  }

  handleRatePerPayType(ratePerPayType) {
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    let {value} = ratePerPayType.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    data.ratePerPayType = value;
    if (data.payType === 'ton') {
      rateCalculator.ratePerTon = value;
    } else if (data.payType === 'hour') {
      rateCalculator.ratePerHour = value;
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
    handleInputChange('tabHaulRate', data);
    debugger;
  }

  handleUnloadTimeChange(unloadTime) {
    let {value} = unloadTime.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.unloadTime = value;
    handleInputChange('tabHaulRate', data);
  }

  handleEnrouteTravelTimeChange(travelTimeEnroute) {
    let {value} = travelTimeEnroute.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.travelTimeEnroute = value;
    handleInputChange('tabHaulRate', data);
  }

  handleReturnTravelTimeChange(travelTimeReturn) {
    let {value} = travelTimeReturn.target;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.travelTimeReturn = value;
    handleInputChange('tabHaulRate', data);
  }

  handleTruckCapacityChange(truckCapacity) {
    let {value} = truckCapacity.target;
    value = value.replace(/\D/g, '');
    const {data, handleInputChange} = {...this.props};
    const {rateCalculator} = {...data};
    rateCalculator.truckCapacity = value;
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


  renderRateCalc() {
    const {data, tabMaterials} = {...this.props};
    const {rateCalculator} = {...data};
    let estimatedTotalPrice = 0;
    if (rateCalculator.estimateTypeRadio === 'ton' && rateCalculator.rateTypeRadio === 'ton') {
      estimatedTotalPrice = rateCalculator.estimatedTons * rateCalculator.ratePerTon;
    } else if ((rateCalculator.estimateTypeRadio === 'hour' && rateCalculator.rateTypeRadio === 'hour')
      || (rateCalculator.estimateTypeRadio === 'ton' && rateCalculator.rateTypeRadio === 'hour')) {
      estimatedTotalPrice = rateCalculator.estimatedHours * rateCalculator.ratePerHour;
    }

    return (
      <React.Fragment>
        <Row className="col-md-12">
          <div className="dashboard dashboard__job-create-section-title">
              <span style={{fontStyle: 'italic'}}>Use this calculator to help estimate what a tonnage rate is equal to in an hourly rate.
                This does not affect the actual haul rate you decide on above.</span>
          </div>
        </Row>
        <Row className="col-md-12">
          <div className="col-md-4 form__form-group">
            <span className="form__form-group-label">Estimated Tons</span>
          </div>
          <div className="col-md-4 form__form-group">
            <span className="form__form-group-label">Rate per Ton</span>
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
            <input type="radio" style={{marginTop: rateCalculator.estimateTypeRadio === 'ton' ? 2 : 0}}
                   checked={rateCalculator.estimateTypeRadio === 'ton'}
                   onClick={() => this.handleSetEstimateType('ton')}/>
            <span style={{
              marginTop: rateCalculator.estimateTypeRadio === 'ton' ? 0 : 6,
              marginLeft: 40,
              position: 'absolute'
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
          <div className="col-md-4 form__form-group">
            <input type="radio" disabled={rateCalculator.estimateTypeRadio === 'hour'}
                   style={{marginTop: rateCalculator.rateTypeRadio === 'ton' ? 2 : 0}}
                   checked={rateCalculator.rateTypeRadio === 'ton'} onClick={() => this.handleSetRateType('ton')}/>
            <span style={{
              marginTop: rateCalculator.rateTypeRadio === 'ton' ? 0 : 6,
              marginLeft: 40,
              position: 'absolute'
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
          {rateCalculator.rateTypeRadio === 'ton'
          && (
            <div className="col-md-4 form__form-group">
              <input type="radio" disabled={rateCalculator.estimateTypeRadio === 'hour'}
                     style={{marginTop: rateCalculator.rateTypeRadio === 'ton' ? 2 : 0}}
                     checked={rateCalculator.rateTypeRadio === 'ton'} onClick={() => this.handleSetRateType('ton')}/>
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
        <Row className="col-md-12">
          <div className="col-md-4 form__form-group">

            <span className="form__form-group-label">Estimated Hours</span>
          </div>
          <div className="col-md-4 form__form-group">
            <span className="form__form-group-label">Rate per Hour</span>
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
            <input type="radio" style={{marginTop: rateCalculator.estimateTypeRadio === 'hour' ? 2 : 0}}
                   checked={rateCalculator.estimateTypeRadio === 'hour'}
                   onClick={() => this.handleSetEstimateType('hour')}/>
            <span style={{
              marginTop: rateCalculator.estimateTypeRadio === 'hour' ? 0 : 6,
              marginLeft: 40,
              position: 'absolute'
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
          <div className="col-md-4 form__form-group">
            <input type="radio" style={{marginTop: rateCalculator.rateTypeRadio === 'hour' ? 2 : 0}}
                   checked={rateCalculator.rateTypeRadio === 'hour'} onClick={() => this.handleSetRateType('hour')}/>
            <span style={{
              marginTop: rateCalculator.rateTypeRadio === 'hour' ? 0 : 6,
              marginLeft: 40,
              position: 'absolute'
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
          {rateCalculator.rateTypeRadio === 'hour'
          && (
            <div className="col-md-4 form__form-group">
              <input type="radio" disabled={rateCalculator.estimateTypeRadio === 'hour'}
                     style={{marginTop: rateCalculator.rateTypeRadio === 'ton' ? 2 : 0}}
                     checked={rateCalculator.rateTypeRadio === 'ton'} onClick={() => this.handleSetRateType('ton')}/>
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
                      This is default time. Click here to input a valid address for calculation.
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
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                <span className="form__form-group-label">Load Time (hrs)</span>
              </div>
              <div className="col-md-5 form__form-group" style={{marginTop: 8}}>
                <TField
                  input={
                    {
                      onChange: this.handleLoadTimeChange,
                      name: 'loadTime',
                      value: rateCalculator.loadTime
                    }
                  }
                  placeholder=""
                  type="text"
                  id="loadTime"
                />
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                <span className="form__form-group-label">Unload Time (hrs)</span>
              </div>
              <div className="col-md-5 form__form-group" style={{marginTop: 8}}>
                <TField
                  input={
                    {
                      onChange: this.handleUnloadTimeChange,
                      name: 'unloadTime',
                      value: rateCalculator.unloadTime
                    }
                  }
                  placeholder=""
                  type="text"
                  id="unloadTime"
                />
              </div>
            </Row>
          </div>
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                <span className="form__form-group-label" style={{fontSize: 12}}>Enroute (hrs)</span>
              </div>
              <div className="col-md-5 form__form-group">
                <TField
                  input={
                    {
                      onChange: this.handleEnrouteTravelTimeChange,
                      name: 'travelTimeEnroute',
                      value: rateCalculator.travelTimeEnroute
                    }
                  }
                  placeholder=""
                  type="text"
                  id="travelTimeEnroute"
                />
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group" style={{marginLeft: -20}}>
                <span className="form__form-group-label">Return Trip Home (hrs)</span>
              </div>
              <div className="col-md-5 form__form-group">
                <TField
                  input={
                    {
                      onChange: this.handleReturnTravelTimeChange,
                      name: 'travelTimeReturn',
                      value: rateCalculator.travelTimeReturn
                    }
                  }
                  placeholder=""
                  type="text"
                  id="travelTimeReturn"
                />
              </div>
            </Row>
          </div>
          <div className="col-md-4 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-6 form__form-group" style={{marginLeft: -20}}>
                <span className="form__form-group-label">Truck Capacity</span>
              </div>
              <div className="col-md-6 form__form-group">
                <TField
                  input={
                    {
                      onChange: this.handleTruckCapacityChange,
                      name: 'truckCapacity',
                      value: rateCalculator.truckCapacity
                    }
                  }
                  placeholder=""
                  type="text"
                  id="truckCapacity"
                />
              </div>
            </Row>
            <Row className="col-md-12">
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
              {/* this.handleSubmit  */}
              <div className="dashboard dashboard__job-create-section-title">
                <span>Select a Material Type</span>
              </div>
              <form
                className="form form--horizontal addtruck__form"
                // onSubmit={e => this.saveTruck(e)}
                autoComplete="off"
              >
                <Row className="col-md-12">
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">What is the quantity for this job?</span>
                    <Button
                      color="primary"
                      className={data.payType === 'hour' ? 'toggle__button' : 'toggle__button-active'}
                      onClick={() => this.handlePayTypeChange('ton')}

                    >
                      <p>tons</p>
                    </Button>
                    <Button
                      color="primary"
                      className={data.payType === 'ton' ? 'toggle__button' : 'toggle__button-active'}
                      onClick={() => this.handlePayTypeChange('hour')}

                    >
                      <p>hours</p>
                    </Button>
                  </div>
                  <div className="col-md-4 form__form-group">
                    <span
                      className="form__form-group-label">Rate ($ / {data.payType.charAt(0).toUpperCase()
                    + data.payType.slice(1)})
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
                {rateCalculator.rateCalcOpen && this.renderRateCalc()}
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
    rateCalculator: PropTypes.shape({
      estimateTypeRadio: PropTypes.string,
      rateTypeRadio: PropTypes.string,
      estimatedTons: PropTypes.string,
      travelTimeEnroute: PropTypes.number,
      travelTimeReturn: PropTypes.number,
      loadTime: PropTypes.number,
      unloadTime: PropTypes.number,
      ratePerTon: PropTypes.string,
      ratePerHour: PropTypes.string,
      invalidAddress: PropTypes.bool,
      truckCapacity: PropTypes.number,
      travelTime: PropTypes.number,
      distance: PropTypes.number
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
    estimatedMaterialPricing: PropTypes.string,
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
