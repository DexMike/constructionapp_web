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
import TCalculator from "../../common/TCalculator";

class Summary extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      formIsValid: false,
      materialTabValidations: [],
      truckSpecsTabValidations: [],
      haulRateTabValidations: [],
      startAddressValidations: [],
      endAddressValidations: []
    };
    this.handleInstructionChange = this.handleInstructionChange.bind(this);
  }

  async componentDidMount() {
    const {validateForm} = {...this.props};
    let {
      formIsValid,
      materialTabValidations,
      truckSpecsTabValidations,
      haulRateTabValidations,
      startAddressValidations,
      endAddressValidations
    } = {...this.state};
    const validationResponse = validateForm();
    formIsValid = validationResponse.valid;
    materialTabValidations = validationResponse.materialTabValidations;
    truckSpecsTabValidations = validationResponse.truckSpecsTabValidations;
    haulRateTabValidations = validationResponse.haulRateTabValidations;
    startAddressValidations = validationResponse.startAddressValidations;
    endAddressValidations = validationResponse.endAddressValidations;

    this.setState({
      loaded: true,
      formIsValid,
      materialTabValidations,
      truckSpecsTabValidations,
      haulRateTabValidations,
      startAddressValidations,
      endAddressValidations
    });
  }

  async componentWillReceiveProps(nextProps) {
    const {data} = {...nextProps};

    const {validateForm} = {...this.props};
    let {
      formIsValid,
      materialTabValidations,
      truckSpecsTabValidations,
      haulRateTabValidations,
      startAddressValidations,
      endAddressValidations
    } = {...this.state};
    const validationResponse = validateForm();
    formIsValid = validationResponse.valid;
    materialTabValidations = validationResponse.materialTabValidations;
    truckSpecsTabValidations = validationResponse.truckSpecsTabValidations;
    haulRateTabValidations = validationResponse.haulRateTabValidations;
    startAddressValidations = validationResponse.startAddressValidations;
    endAddressValidations = validationResponse.endAddressValidations;

    this.setState({
      data: {...data},
      loaded: true,
      formIsValid,
      materialTabValidations,
      truckSpecsTabValidations,
      haulRateTabValidations,
      startAddressValidations,
      endAddressValidations
    });
  }

  handleInstructionChange(e) {
    const {data, handleInputChange} = {...this.props};
    const {value} = e.target;
    data.instructions = value;
    handleInputChange('tabSummary', data);
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
              {startAddressValidations.length > 0 ? this.renderValidationBox(startAddressValidations, 1) : this.renderStartAddress()}
            </div>
            <div className="col-md-6 form__form-group">
              {endAddressValidations.length > 0 ? this.renderValidationBox(endAddressValidations, 1) : this.renderEndAddress()}

            </div>
          </Row>
        </Row>
      </React.Fragment>
    );
  }

  renderHaul() {
    const {tabTruckSpecs, tabPickupDelivery, data} = {...this.props};
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
                      {tabPickupDelivery.avgDistanceEnroute}
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
                      {tabPickupDelivery.avgTimeEnroute}
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
              className="form__form-group-label">{tabMaterials.quantityType === 'Hour' ? 'Estimated Hours' : 'Estimated Tons'}</span>
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
          <div className="col-md-5 form__form-group">
            <span
              className="form__form-group-label" style={{fontWeight: 'bold'}}>$/{tabHaulRate.payType}</span>
          </div>
          <div className="col-md-7 form__form-group">
                    <span style={{
                      fontWeight: 'bold'
                    }}
                    >
                      $ {tabHaulRate.ratePerPayType}
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
              {materialTabValidations.length > 0 ? this.renderValidationBox(materialTabValidations, 2)
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
    const {tabHaulRate, tabMaterials, tabPickupDelivery} = {...this.props};

    const truckCapacity = 22;

    const haulCostPerTonHour = tabHaulRate.ratePerPayType;
    let oneWayCostPerTonHourPerMile = '0.00';
    let deliveredPricePerTon = '0.00';
    let deliveredPriceJob = '0.00';
    let estimatedCostForJob = '0.00';
    // const sufficientInfo = (parseFloat(tabHaulRate.avgTimeEnroute) + parseFloat(tabHaulRate.avgTimeReturn)) * parseFloat(tabHaulRate.ratePerPayType);
    if (haulCostPerTonHour > 0) {
      // haulCostPerTonHour = ((sufficientInfo) / parseFloat(data.rateCalculator.truckCapacity)).toFixed(2);
      // oneWayCostPerTonHourPerMile = data.avgDistanceEnroute > 0 ? (parseFloat(haulCostPerTonHour) / parseFloat(data.avgDistanceEnroute)).toFixed(2) : 0;
      if (tabHaulRate.payType === 'Ton') {
        oneWayCostPerTonHourPerMile = TCalculator.getOneWayCostByTonRate(haulCostPerTonHour, tabPickupDelivery.avgDistanceEnroute);
      } else {
        oneWayCostPerTonHourPerMile = TCalculator.getOneWayCostByHourRate(
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          parseFloat(tabPickupDelivery.avgTimeReturn),
          0.25,
          0.25,
          parseFloat(tabHaulRate.ratePerPayType),
          truckCapacity,
          tabPickupDelivery.avgDistanceEnroute
        );
      }
      if (tabHaulRate.payType === 'Ton') {
        deliveredPricePerTon = TCalculator.getDelPricePerTonByTonRate(
          parseFloat(tabMaterials.estMaterialPricing),
          parseFloat(haulCostPerTonHour)
        );
      } else if (tabHaulRate.payType === 'Hour' && tabMaterials.quantityType === 'Ton') {
        deliveredPricePerTon = TCalculator.getDelPricePerTonByHourRateByTonAmount(
          parseFloat(tabMaterials.estMaterialPricing),
          parseFloat(haulCostPerTonHour),
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          parseFloat(tabPickupDelivery.avgTimeReturn),
          0.25,
          0.25,
          tabMaterials.quantity,
          truckCapacity,
          parseFloat(haulCostPerTonHour),
          (tabHaulRate.roundType === 'up')
        );
      } else if (tabHaulRate.payType === 'Hour' && tabMaterials.quantityType === 'Hour') {
        deliveredPricePerTon = TCalculator.getDelPricePerTonByHourRateByHourAmount(
          parseFloat(tabMaterials.estMaterialPricing),
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          parseFloat(tabPickupDelivery.avgTimeReturn),
          0.25,
          0.25,
          tabMaterials.quantity,
          truckCapacity,
          parseFloat(haulCostPerTonHour),
          (tabHaulRate.roundType === 'up')
        );
      }
      if ((tabMaterials.quantityType === 'Ton' && tabHaulRate.payType === 'Ton')
        || (tabMaterials.quantityType === 'Hour' && tabHaulRate.payType === 'Hour')) {
        estimatedCostForJob = TCalculator.getJobCostSameRateAndAmount(
          parseFloat(haulCostPerTonHour),
          parseFloat(tabMaterials.quantity)
        );
      } else if (tabMaterials.quantityType === 'Ton' && tabHaulRate.payType === 'Hour') {
        estimatedCostForJob = TCalculator.getJobCostHourRateTonAmount(
          parseFloat(haulCostPerTonHour),
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          parseFloat(tabPickupDelivery.avgTimeReturn),
          0.25,
          0.25,
          parseFloat(tabMaterials.quantity),
          truckCapacity,
          (tabHaulRate.roundType === 'up')
        );
      } else if (tabMaterials.quantityType === 'Hour' && tabHaulRate.payType === 'Ton') {
        estimatedCostForJob = TCalculator.getJobCostTonRateHourAmount(
          parseFloat(haulCostPerTonHour),
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          parseFloat(tabPickupDelivery.avgTimeReturn),
          0.25,
          0.25,
          parseFloat(tabMaterials.quantity),
          truckCapacity,
          (tabHaulRate.roundType === 'up')
        );
      }

      if (tabMaterials.quantityType === 'Ton') {
        deliveredPriceJob = TCalculator.getDelPricePerJobByTonAmount(tabMaterials.quantity, deliveredPricePerTon);
      } else {
        deliveredPriceJob = TCalculator.getDelPricePerJobByHourAmount(
          parseFloat(tabPickupDelivery.avgTimeEnroute),
          parseFloat(tabPickupDelivery.avgTimeReturn),
          0.25,
          0.25,
          parseFloat(tabMaterials.quantity),
          truckCapacity,
          deliveredPricePerTon,
          (tabHaulRate.roundType === 'up')
        );
      }
    }

    return (
        <DeliveryCostsSummary
          estMaterialPricing={tabMaterials.estMaterialPricing}
          deliveredPricePerTon={deliveredPricePerTon}
          deliveredPriceJob={deliveredPriceJob}
          payType={tabHaulRate.payType}
          quantityType={tabMaterials.quantityType}
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


  render() {
    const {loaded, formIsValid} = {...this.state};
    const {data, goBack, saveJob, closeModal, jobRequest, jobEdit, validateTopForm, isLoading} = {...this.props};
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
                  {(!jobRequest && !jobEdit) &&
                  <Button
                    color="outline-primary"
                    className="next"
                    loading={isLoading}
                    loaderSize={10}
                    disabled={isLoading}
                    onClick={saveJob}
                  >
                    {
                      isLoading ? (
                        <TSpinner
                          color="#808080"
                          loaderSize={10}
                          loading
                        />
                      ) : 'Save Job & Close'
                    }
                  </Button>
                  }
                  <Button
                    color="primary"
                    className="next"
                    onClick={() => validateTopForm()}
                    disabled={!formIsValid}
                  >
                    {jobEdit ? 'Update job' : 'Next'}
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
  }),
  validateForm: PropTypes.func.isRequired
};

Summary.defaultProps = {
  tabHaulRate: null,
  tabMaterials: null,
  tabPickupDelivery: null,
  tabTruckSpecs: null,
  data: null
};

export default Summary;
