import React, {PureComponent} from 'react';
import {
  Button, ButtonToolbar,
  Card,
  CardBody,
  Col,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import '../jobs.css';
import TSpinner from '../../common/TSpinner';
import DeliveryCostsSummary from './DeliveryCostsSummary';
import GeoUtils from "../../../utils/GeoUtils";
import ReactTooltip from 'react-tooltip'

class Summary extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      materialTabValidations: [],
      truckSpecsTabValidations: [],
      haulRateTabValidations: [],
      startAddressValidations: [],
      endAddressValidations: []

    };
    this.validateMaterialsTab = this.validateMaterialsTab.bind(this);
    this.validateTruckSpecsTab = this.validateTruckSpecsTab.bind(this);
    this.validateHaulRateTab = this.validateHaulRateTab.bind(this);
    this.validateStartAddress = this.validateStartAddress.bind(this);
    this.validateEndAddress = this.validateEndAddress.bind(this);
    this.handleInstructionChange = this.handleInstructionChange.bind(this);
    this.validateTopForm = this.validateTopForm.bind(this);
  }

  async componentDidMount() {
    const {data, tabPickupDelivery, handleInputChange} = {...this.props};
    // let {endGPS, startGPS, avgDistanceEnroute, avgTimeEnroute} = {...this.state};
    let {
      materialTabValidations,
      truckSpecsTabValidations,
      haulRateTabValidations,
      startAddressValidations,
      endAddressValidations
    } = {...this.state};
    let endString;
    if (tabPickupDelivery.selectedEndAddressId > 0) {
      const endAddress = tabPickupDelivery.allAddresses.find(item => item.value === tabPickupDelivery.selectedEndAddressId);
      endString = endAddress.label;
    } else {
      endString = `${tabPickupDelivery.endLocationAddress1} ${tabPickupDelivery.endLocationCity} ${tabPickupDelivery.endLocationState} ${tabPickupDelivery.endLocationZip}`;
    }
    try {
      data.endGPS = await GeoUtils.getCoordsFromAddress(endString);
    } catch (err) {
      console.error(err);
    }
    let startString;
    if (tabPickupDelivery.selectedStartAddressId > 0) {
      const startAddress = tabPickupDelivery.allAddresses.find(item => item.value === tabPickupDelivery.selectedStartAddressId);
      startString = startAddress.label;
    } else {
      startString = `${tabPickupDelivery.startLocationAddress1} ${tabPickupDelivery.startLocationCity} ${tabPickupDelivery.startLocationState} ${tabPickupDelivery.startLocationZip}`;
    }
    try {
      data.startGPS = await GeoUtils.getCoordsFromAddress(startString);
    } catch (err) {
      console.error(err);
    }
    if (data.endGPS.lat && data.startGPS.lat
      && data.endGPS.lng && data.startGPS.lng) {
      const waypoint0 = `${data.startGPS.lat},${data.startGPS.lng}`;
      const waypoint1 = `${data.endGPS.lat},${data.endGPS.lng}`;
      const travelInfoEnroute = await GeoUtils.getDistance(waypoint0, waypoint1);
      data.avgDistanceEnroute = (travelInfoEnroute.distance * 0.000621371192).toFixed(2);
      data.avgTimeEnroute = (parseInt(travelInfoEnroute.travelTime) / 3600).toFixed(2);
    }
    handleInputChange('tabSummary', data);
    materialTabValidations = this.validateMaterialsTab();
    truckSpecsTabValidations = this.validateTruckSpecsTab();
    haulRateTabValidations = this.validateHaulRateTab();
    startAddressValidations = this.validateStartAddress();
    endAddressValidations = this.validateEndAddress();
    this.setState({
      loaded: true,
      materialTabValidations,
      truckSpecsTabValidations,
      haulRateTabValidations,
      startAddressValidations,
      endAddressValidations
    });
  }

  async componentWillReceiveProps(nextProps) {
    const {data} = {...nextProps};
    this.setState({data: {...data}});
  }

  handleInstructionChange(e) {
    const {data, handleInputChange} = {...this.props};
    const {value} = e.target;
    data.instructions = value;
    handleInputChange('tabSummary', data);
  }

  validateMaterialsTab() {
    const {tabMaterials} = {...this.props};
    const val = [];
    if (!tabMaterials.selectedMaterial || tabMaterials.selectedMaterial.value === '') {
      val.push('Material Type');
    }
    if (!tabMaterials.quantity || tabMaterials.quantity <= 0) {
      if (tabMaterials.quantityType === 'hour') {
        val.push('Estimated Hours');
      } else {
        val.push('Estimated Tons');
      }
    }
    return val;
  }

  validateTruckSpecsTab() {
    const {tabTruckSpecs} = {...this.props};
    const val = [];
    if (!tabTruckSpecs.selectedTruckTypes || tabTruckSpecs.selectedTruckTypes.length === 0) {
      val.push('At least one truck type');
    }
    return val;
  }

  validateHaulRateTab() {
    const {tabHaulRate} = {...this.props};
    const val = [];
    if (!tabHaulRate.ratePerPayType || tabHaulRate.ratePerPayType <= 0) {
      val.push('Missing haul rate');
    }
    return val;
  }

  validateStartAddress() {
    const {tabPickupDelivery, data} = {...this.props};
    // const {startGPS} = {...this.state};
    const val = [];

    if (!tabPickupDelivery.selectedStartAddressId || tabPickupDelivery.selectedStartAddressId === 0) {
      if (!tabPickupDelivery.startLocationAddressName || tabPickupDelivery.startLocationAddressName === '') {
        val.push('Missing start address name');
      }

      if (tabPickupDelivery.selectedEndAddressId > 0 && tabPickupDelivery.selectedStartAddressId > 0
        && tabPickupDelivery.selectedStartAddressId === tabPickupDelivery.selectedEndAddressId) {
        val.push('Same start and end addresses');
      }
      if (tabPickupDelivery.startLocationAddress1.length === 0
        || tabPickupDelivery.startLocationCity.length === 0
        || tabPickupDelivery.startLocationZip.length === 0
        || tabPickupDelivery.startLocationState.length === 0) {
        val.push('Missing start address fields');
      }
    }

    if (val.length > 0) {
      return val;
    }

    if (!data.startGPS || !data.startGPS.lat
      || !data.startGPS.lng) {
      val.push('Invalid start address');
    }

    return val;
  }

  validateEndAddress() {
    const {tabPickupDelivery, data} = {...this.props};
    const val = [];
    // const {endGPS} = {...this.state};

    if (!tabPickupDelivery.selectedEndAddressId || tabPickupDelivery.selectedEndAddressId === 0) {

      if (!tabPickupDelivery.endLocationAddressName || tabPickupDelivery.endLocationAddressName === '') {
        val.push('Missing end address name');
      }

      if (tabPickupDelivery.endLocationAddress1.length === 0
        || tabPickupDelivery.endLocationCity.length === 0
        || tabPickupDelivery.endLocationZip.length === 0
        || tabPickupDelivery.endLocationState.length === 0) {
        val.push('Missing end address fields');
      }
    }

    if (val.length > 0) {
      return val;
    }

    if (!data.endGPS || !data.endGPS.lat
      || !data.endGPS.lng) {
      val.push('Invalid end address');
    }

    return val;
  }

  renderStartAddress() {
    const {tabPickupDelivery} = {...this.props};
    if (tabPickupDelivery.selectedStartAddressId > 0) {
      const startDestination = tabPickupDelivery.allAddresses.find(item => item.value === tabPickupDelivery.selectedStartAddressId);
      return (
        <React.Fragment>
          <Row className="col-md-12" style={{marginTop: -15}}>
            <div className="col-md-12 form__form-group">
              <span className="form__form-group-label">{startDestination.label}</span>
            </div>
          </Row>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Row className="col-md-12" style={{marginTop: -15}}>
          <div className="col-md-12 form__form-group">
            <span className="form__form-group-label">{tabPickupDelivery.startLocationAddress1}</span>
          </div>
        </Row>
        {tabPickupDelivery.startLocationAddress2 && tabPickupDelivery.startLocationAddress2.length > 0
        && <Row className="col-md-12">
          <div className="col-md-7 form__form-group">
            <span className="form__form-group-label">{tabPickupDelivery.startLocationAddress2}</span>
          </div>
        </Row>
        }
        <Row className="col-md-12">
          <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label">{tabPickupDelivery.startLocationCity} {' '}
                    {tabPickupDelivery.startLocationState} {tabPickupDelivery.startLocationZip}
                  </span>
          </div>
        </Row>
      </React.Fragment>
    );
  }

  renderEndAddress() {
    const {tabPickupDelivery} = {...this.props};
    if (tabPickupDelivery.selectedEndAddressId > 0) {
      const endDestination = tabPickupDelivery.allAddresses.find(item => item.value === tabPickupDelivery.selectedEndAddressId);
      return (
        <Row className="col-md-12" style={{marginTop: -15}}>
          <div className="col-md-12 form__form-group">
            <span className="form__form-group-label">{endDestination.label}</span>
          </div>
        </Row>
      );
    }
    return (
      <React.Fragment>
        <Row className="col-md-12" style={{marginTop: -15}}>
          <div className="col-md-12 form__form-group">
            <span className="form__form-group-label">{tabPickupDelivery.endLocationAddress1}</span>
          </div>
        </Row>
        {tabPickupDelivery.endLocationAddress2 && tabPickupDelivery.endLocationAddress2.length > 0
        && <Row className="col-md-12">
          <div className="col-md-7 form__form-group">
            <span className="form__form-group-label">{tabPickupDelivery.endLocationAddress2}</span>
          </div>
        </Row>
        }
        <Row className="col-md-12">
          <div className="col-md-7 form__form-group">
                  <span className="form__form-group-label">{tabPickupDelivery.endLocationCity} {' '}
                    {tabPickupDelivery.endLocationState} {tabPickupDelivery.endLocationZip}
                  </span>
          </div>
        </Row>
      </React.Fragment>
    );
  }

  renderAddresses() {
    const {startAddressValidations, endAddressValidations} = {...this.state};

    // const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
    //   + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
    //
    // const oneWayHaul = data.avgDistanceEnroute;

    // const oneWayCost = ((oneLoad * rateCalculator.ratePerHour) / rateCalculator.truckCapacity / oneWayHaul).toFixed(2);
    // const deliveryCostTon = (oneWayHaul * oneWayCost).toFixed(2);

    return (
      <React.Fragment>
        <Row className="col-md-12">
          <Row className="col-md-12">
            <div className="col-md-6 form__form-group">
              <Row className="col-md-12 " style={{paddingTop: 20}}>
                <span className="form__form-group-label"
                      style={startAddressValidations.length > 0 ? {color: 'rgb(140, 25, 25)'} : {}}>Pickup Address</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
            <div className="col-md-6 form__form-group">
              <Row className="col-md-12 " style={{paddingTop: 20}}>
                <span className="form__form-group-label"
                      style={endAddressValidations.length > 0 ? {color: 'rgb(140, 25, 25)'} : {}}>Delivery Address</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
          </Row>
          <Row className="col-md-12">
            <div className="col-md-6 form__form-group">
              {startAddressValidations.length > 0 ? this.renderValidationBox(startAddressValidations, 2) : this.renderStartAddress()}
            </div>
            <div className="col-md-6 form__form-group">
              {endAddressValidations.length > 0 ? this.renderValidationBox(endAddressValidations, 2) : this.renderEndAddress()}

            </div>
          </Row>
        </Row>
      </React.Fragment>
    );
  }

  renderHaul() {
    const {tabTruckSpecs, data} = {...this.props};
    // const {avgTimeEnroute, avgDistanceEnroute} = {...this.state};

    const selectedTruckTypesName = [];
    for (const id of tabTruckSpecs.selectedTruckTypes) {
      const truckTypeObj = tabTruckSpecs.allTruckTypes.find(x => x.value === id);
      selectedTruckTypesName.push(truckTypeObj.label);
    }
    return (
      <React.Fragment>
        <Row className="col-md-12" style={{marginTop: -15}}>
          <div className="col-md-7 form__form-group">
            <span className="form__form-group-label"># Trucks</span>
          </div>
          <div className="col-md-5 form__form-group">
                    <span style={{}}
                    >
                      {tabTruckSpecs.truckQuantity === '' ? 'Any' : tabTruckSpecs.truckQuantity}
                    </span>
          </div>
        </Row>
        <Row className="col-md-12">
          <div className="col-md-7 form__form-group">
            <span className="form__form-group-label">Truck Type</span>
          </div>
          <div className="col-md-5 form__form-group">
            <span style={{}}
            >
            <a data-tip data-for='truckTypes' style={{color: 'rgb(62, 110, 85)'}}> View </a>
            </span>
            <div className="customTooltip">
              <ReactTooltip id='truckTypes' effect='solid'>
                {selectedTruckTypesName.map(name =>
                  <p style={{color: 'white'}}> {name} </p>)}
              </ReactTooltip>
            </div>
          </div>
        </Row>
        <Row className="col-md-12">
          <div className="col-md-7 form__form-group">
            <span className="form__form-group-label">Miles one way</span>
          </div>
          <div className="col-md-5 form__form-group">
                    <span style={{}}
                    >
                      {data.avgDistanceEnroute}
                    </span>
          </div>
        </Row>
        <Row className="col-md-12">
          <div className="col-md-7 form__form-group">
            <span className="form__form-group-label">Hours one way</span>
          </div>
          <div className="col-md-5 form__form-group">
                    <span style={{}}
                    >
                      {data.avgTimeEnroute}
                    </span>
          </div>
        </Row>
      </React.Fragment>
    );
  }

  renderMaterials() {
    const {tabMaterials} = {...this.props};
    return (
      <React.Fragment>
        <Row className="col-md-12" style={{marginTop: -15}}>
          <div className="col-md-8 form__form-group">
            <span
              className="form__form-group-label">Material Type</span>
          </div>
          <div className="col-md-4 form__form-group">
                    <span style={{}}
                    >
                      {tabMaterials.selectedMaterial.value}
                    </span>
          </div>
        </Row>
        <Row className="col-md-12">
          <div className="col-md-8 form__form-group">
            <span
              className="form__form-group-label">{tabMaterials.quantityType === 'hour' ? 'Estimated Hours' : 'Estimated Tons'}</span>
          </div>
          <div className="col-md-4 form__form-group">
                    <span style={{}}
                    >
                      {tabMaterials.quantity}
                    </span>
          </div>
        </Row>
      </React.Fragment>

    );
  }

  renderHaulRate() {
    const {tabHaulRate} = {...this.props};
    return (
      <React.Fragment>
        <Row className="col-md-12" style={{marginTop: -15}}>
          <div className="col-md-7 form__form-group">
            <span
              className="form__form-group-label" style={{fontWeight: 'bold'}}>Rate per {tabHaulRate.payType}</span>
          </div>
          <div className="col-md-5 form__form-group">
                    <span style={{
                      fontWeight: 'bold'
                    }}
                    >
                      {tabHaulRate.ratePerPayType}
                    </span>
          </div>
        </Row>
      </React.Fragment>
    );
  }

  renderMaterialHaulRate() {
    const {materialTabValidations, truckSpecsTabValidations, haulRateTabValidations} = {...this.state};
    return (
      <React.Fragment>
        <Row className="col-md-12">
          <Row className="col-md-12">
            <div className="col-md-4 form__form-group">
              <Row className="col-md-12 " style={{paddingTop: 20}}>
                <span className="form__form-group-label"
                      style={materialTabValidations.length > 0 ? {color: 'rgb(140, 25, 25)'} : {}}>Materials</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
            <div className="col-md-4">
              <Row className="col-md-12 " style={{paddingTop: 20}}>
                <span className="form__form-group-label"
                      style={truckSpecsTabValidations.length > 0 ? {color: 'rgb(140, 25, 25)'} : {}}>Haul</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
            <div className="col-md-4">
              <Row className="col-md-12 " style={{paddingTop: 20}}>
                <span className="form__form-group-label"
                      style={haulRateTabValidations.length > 0 ? {color: 'rgb(140, 25, 25)'} : {}}>Haul Rate</span>
              </Row>
              <Row className="col-md-12" style={{marginTop: -20}}>
                <hr/>
              </Row>
            </div>
          </Row>
          <Row className="col-md-12">
            <div className="col-md-4">
              {materialTabValidations.length > 0 ? this.renderValidationBox(materialTabValidations, 1)
                : this.renderMaterials()}
            </div>
            <div className="col-md-4">
              {truckSpecsTabValidations.length > 0 ? this.renderValidationBox(truckSpecsTabValidations, 3)
                : this.renderHaul()}
            </div>
            <div className="col-md-4">
              {haulRateTabValidations.length > 0 ? this.renderValidationBox(haulRateTabValidations, 4)
                : this.renderHaulRate()}
            </div>
          </Row>
        </Row>
      </React.Fragment>
    );
  }

  renderDeliveryCosts() {
    const {tabHaulRate, tabMaterials} = {...this.props};
    const {rateCalculator} = {...tabHaulRate};


    const haulCostPerTonHour = tabHaulRate.ratePerPayType;
    let oneWayCostPerTonHourPerMile = 0;
    let deliveredPricePerTon = 0;
    let deliveredPriceJob = 0;
    let estimatedCostForJob = 0;
    // const sufficientInfo = (parseFloat(tabHaulRate.avgTimeEnroute) + parseFloat(tabHaulRate.avgTimeReturn)) * parseFloat(tabHaulRate.ratePerPayType);
    if (haulCostPerTonHour > 0) {
      // haulCostPerTonHour = ((sufficientInfo) / parseFloat(tabHaulRate.rateCalculator.truckCapacity)).toFixed(2);
      oneWayCostPerTonHourPerMile = tabHaulRate.avgDistanceEnroute > 0 ? (parseFloat(haulCostPerTonHour) / parseFloat(tabHaulRate.avgDistanceEnroute)).toFixed(2) : 0;
      deliveredPricePerTon = (parseFloat(tabMaterials.estMaterialPricing) + parseFloat(haulCostPerTonHour)).toFixed(2);
      estimatedCostForJob = (parseFloat(haulCostPerTonHour) * parseFloat(tabMaterials.quantity)).toFixed(2);
      if (tabMaterials.quantityType === 'ton') {
        deliveredPriceJob = (parseFloat(deliveredPricePerTon) * parseFloat(tabMaterials.quantity)).toFixed(2);
      } else {
        const oneLoad = parseFloat(rateCalculator.loadTime) + parseFloat(rateCalculator.unloadTime)
          + parseFloat(rateCalculator.travelTimeReturn) + parseFloat(rateCalculator.travelTimeEnroute);
        const numTrips = Math.floor(parseFloat(tabMaterials.quantity) / oneLoad);
        const estimatedTons = (numTrips * parseFloat(tabHaulRate.rateCalculator.truckCapacity)).toFixed(2);
        deliveredPriceJob = (deliveredPricePerTon * estimatedTons).toFixed(2);
      }
    }

    return (
        <DeliveryCostsSummary
          estMaterialPricing={tabMaterials.estMaterialPricing}
          deliveredPricePerTon={deliveredPricePerTon}
          deliveredPriceJob={deliveredPriceJob}
          payType={tabMaterials.payType}
          oneWayCostPerTonHourPerMile={oneWayCostPerTonHourPerMile}
          haulCostPerTonHour={haulCostPerTonHour}
          estimatedCostForJob={estimatedCostForJob}
        />
    );
  }

  renderValidationBox(missingFields, pageNumber) {
    const {setPageNumber} = {...this.props};
    return (
      <Row className="col-md-12" onClick={() => setPageNumber(pageNumber)} style={{paddingBottom: 15, marginTop: -15}}>
        <div className="col-md-12 form__form-group">
            <span
              className="form__form-group-label" style={{color: 'rgb(140, 25, 25)'}}>Missing {missingFields.map(name =>
              <li key={name}> {name} </li>)}
              Click here to correct
            </span>
        </div>
      </Row>
    );
  }

  async validateTopForm() {
    const {validateSend, goToSend} = {...this.props};
    const isValid = await validateSend();
    if (isValid) {
      goToSend();
    }
  }

  render() {
    const {loaded} = {...this.state};
    const {data, goBack, saveJob, closeModal} = {...this.props};
    const {
      materialTabValidations,
      truckSpecsTabValidations,
      haulRateTabValidations,
      startAddressValidations,
      endAddressValidations
    } = {...this.state};
    const sendIsDisabled = materialTabValidations.length > 0
      || truckSpecsTabValidations.length > 0
      || haulRateTabValidations.length > 0
      || startAddressValidations.length > 0
      || endAddressValidations.length > 0;
    if (loaded) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <form
                className="form form--horizontal addtruck__form"
                // onSubmit={e => this.saveTruck(e)}
                autoComplete="off"
              >
                {this.renderAddresses()}
                <Row className="col-md-12" style={{marginTop: 15}}>
                  <hr/>
                </Row>
                {this.renderMaterialHaulRate()}
                <Row className="col-md-12" style={{marginTop: 15}}>
                  <hr/>
                </Row>
                {this.renderDeliveryCosts()}
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
                      value={data.instructions}
                      onChange={this.handleInstructionChange}
                      placeholder="Instructions"
                      maxLength="255"
                    />
                  </div>
                </Row>
              </form>
              <Row className="col-md-12" style={{paddingTop: 20}}>
                <hr/>
              </Row>
              <Row className="col-md-12">
                <ButtonToolbar className="col-md-6 wizard__toolbar">
                  <Button color="minimal" className="btn btn-outline-secondary"
                          type="button"
                          onClick={closeModal}
                  >
                    Cancel
                  </Button>
                </ButtonToolbar>
                <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                  <Button color="primary" type="button"
                          className="previous"
                          onClick={goBack}
                  >
                    Back
                  </Button>
                  <Button
                    color="outline-primary"
                    className="next"
                    onClick={saveJob}
                  >
                    Save Job & Close
                  </Button>
                  <Button
                    color="primary"
                    className="next"
                    onClick={this.validateTopForm}
                    disabled={sendIsDisabled}
                  >
                    Send
                  </Button>
                </ButtonToolbar>
              </Row>
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

Summary.propTypes = {
  tabHaulRate: PropTypes.shape({
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
  data: PropTypes.shape({
    instructions: PropTypes.string,
    startGPS: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }),
    endGPS: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    }),
    avgDistanceEnroute: PropTypes.number,
    avgTimeEnroute: PropTypes.number
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
  }),
  tabTruckSpecs: PropTypes.shape({
    truckQuantity: PropTypes.number,
    selectedTruckTypes: PropTypes.array,
    allTruckTypes: PropTypes.array,
    reqHandlerTruckType: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    })
  })
};

Summary.defaultProps = {
  tabHaulRate: null,
  tabMaterials: null,
  tabPickupDelivery: null,
  tabTruckSpecs: null,
  data: null
};

export default Summary;
