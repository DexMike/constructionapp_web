import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import MultiSelect from '../common/TMultiSelect';
import SelectField from '../common/TSelect';
import LookupsService from '../../api/LookupsService';
import TDateTimePicker from '../common/TDateTimePicker';
import './jobs.css';
import TField from '../common/TField';

class CreateJobFormOne extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userCompanyId: 0,
      // truck properties
      truckType: '',
      allTruckTypes: [],
      capacity: 0,
      allMaterials: [],
      selectedMaterials: [],
      // rates
      ratebyBoth: false,
      rateByTon: true,
      rateByHour: false,
      tonnage: 0, // estimated amount of tonnage
      hourEstimatedHours: 0,
      hourTrucksNumber: 0,
      rateTab: 2,
      // location
      endLocationAddress1: '',
      endLocationAddress2: '',
      endLocationCity: '',
      endLocationState: '',
      endLocationZip: '',
      // date
      jobDate: new Date(),
      startLocationAddress1: '',
      startLocationAddress2: '',
      startLocationCity: '',
      startLocationState: '',
      startLocationZip: '',
      // job properties
      name: '',
      instructions: '',
      // Request Handlers
      reqHandlerTonnage: { touched: false, error: '' },
      reqHandlerDate: { touched: false, error: '' },
      reqHandlerTruckType: { touched: false, error: '' },
      reqHandlerMaterials: { touched: false, error: '' },
      reqHandlerHoursEstimate: { touched: false, error: '' },
      reqHandleTrucksEstimate: { touched: false, error: '' },
      reqHandlerStartAddress: { touched: false, error: '' },
      reqHandlerStartCity: { touched: false, error: '' },
      reqHandlerStartZip: { touched: false, error: '' },
      reqHandlerStartState: { touched: false, error: '' },
      reqHandlerEndCity: { touched: false, error: '' },
      reqHandlerEndZip: { touched: false, error: '' },
      reqHandlerEndState: { touched: false, error: '' },
      reqHandlerEndAddress: { touched: false, error: '' }
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleTruckTypeChange = this.handleTruckTypeChange.bind(this);
    this.handleMaterialsChange = this.handleMaterialsChange.bind(this);
    this.handleTonnageDetails = this.handleTonnageDetails.bind(this);
    this.handleHourDetails = this.handleHourDetails.bind(this);
    this.handleStartAddressChange = this.handleStartAddressChange.bind(this);
    this.handleEndAddressChange = this.handleEndAddressChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.firstPage = this.firstPage.bind(this);
    this.secondPage = this.secondPage.bind(this);
    this.jobDateChange = this.jobDateChange.bind(this);
    this.goToSecondFromFirst = this.goToSecondFromFirst.bind(this);
  }

  async componentDidMount() {
    const {firstTabData} = this.props;
    // if we have preloaded info, let's set it
    if (Object.keys(firstTabData()).length > 0) {
      const p = firstTabData();

      // TODO -> There should be a way to map directly to state
      // this is not very nice
      this.setState({
        userCompanyId: p.userCompanyId,
        // truck properties
        truckType: p.truckType,
        allTruckTypes: p.allTruckTypes,
        capacity: p.capacity,
        allMaterials: p.allMaterials,
        selectedMaterials: p.selectedMaterials,
        // rates
        ratebyBoth: p.ratebyBoth,
        rateByTon: p.rateByTon,
        rateByHour: p.rateByHour,
        tonnage: p.tonnage, // estimated amount of tonnage
        hourEstimatedHours: p.hourEstimatedHours,
        hourTrucksNumber: p.hourTrucksNumber,
        rateTab: 1,
        // location
        endLocationAddress1: p.endLocationAddress1,
        endLocationAddress2: p.endLocationAddress2,
        endLocationCity: p.endLocationCity,
        endLocationState: p.endLocationState,
        endLocationZip: p.endLocationZip,
        // date
        jobDate: p.jobDate,
        startLocationAddress1: p.startLocationAddress1,
        startLocationAddress2: p.startLocationAddress2,
        startLocationCity: p.startLocationCity,
        startLocationState: p.startLocationState,
        startLocationZip: p.startLocationZip,
        // job properties
        name: p.name,
        instructions: p.instructions
      });
    } else {
      // we don't have preloaded info, let's hit the server
      let allMaterials = await LookupsService.getLookupsByType('MaterialType');
      const truckTypes = await LookupsService.getLookupsByType('EquipmentType');
      const allTruckTypes = [];
      allMaterials = allMaterials.map(material => ({
        value: String(material.id),
        label: material.val1
      }));
      Object.values(truckTypes).forEach((itm) => {
        const inside = {
          label: itm.val1,
          value: itm.val1
        };
        allTruckTypes.push(inside);
      });
      this.setState({
        allMaterials,
        allTruckTypes
      });
    }
  }


  componentWillReceiveProps(nextProps, nextContext) {
    // console.log(nextProps.validateOnTabClick);
    if (nextProps.validateOnTabClick) {
      this.goToSecondFromFirst();
    }
  }

  handleMaterialsChange(data) {
    const {reqHandlerMaterials} = this.state;
    this.setState({
      reqHandlerMaterials: {...reqHandlerMaterials, touched: false}
    });
    this.setState({selectedMaterials: data});
  }

  handleTruckTypeChange(data) {
    const {reqHandlerTruckType} = this.state;
    this.setState({
      reqHandlerTruckType: {...reqHandlerTruckType, touched: false}
    });
    this.setState({truckType: data});
  }

  handleEndAddressChange(e) {
    let reqHandler = '';
    switch (e.target.name) {
      case 'endLocationAddress1':
        reqHandler = 'reqHandlerEndAddress';
        break;
      case 'endLocationCity':
        reqHandler = 'reqHandlerEndCity';
        break;
      case 'endLocationState':
        reqHandler = 'reqHandlerEndState';
        break;
      case 'endLocationZip':
        reqHandler = 'reqHandlerEndZip';
        break;
      default:
    }
    this.setState({
      [reqHandler]: {...reqHandler, touched: false}
    });
    this.setState({[e.target.name]: e.target.value});
  }

  handleTonnageDetails(e) {
    const {reqHandlerTonnage} = this.state;
    this.setState({
      reqHandlerTonnage: {...reqHandlerTonnage, touched: false}
    });
    this.setState({[e.target.name]: e.target.value});
  }

  handleHourDetails(e) {
    let reqHandler = '';
    switch (e.target.name) {
      case 'hourEstimatedHours':
        reqHandler = 'reqHandlerHoursEstimate';
        break;
      case 'hourTrucksNumber':
        reqHandler = 'reqHandlerTrucksEstimate';
        break;
      default:
    }
    this.setState({
      [reqHandler]: {...reqHandler, touched: false}
    });
    this.setState({[e.target.name]: e.target.value});
  }

  handleStartAddressChange(e) {
    let reqHandler = '';
    switch (e.target.name) {
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
      [reqHandler]: {...reqHandler, touched: false}
    });
    this.setState({[e.target.name]: e.target.value});
  }


  selectChange(data) {
    const {reqHandlerTruckType} = this.state;
    this.setState({
      reqHandlerTruckType: {...reqHandlerTruckType, touched: false}
    });
    this.setState({truckType: data.value});
  }

  isFormValid() {
    const job = this.state;
    const {
      reqHandlerTonnage,
      reqHandlerEndAddress,
      reqHandlerEndState,
      reqHandlerEndCity,
      reqHandlerEndZip,
      reqHandlerStartAddress,
      reqHandlerStartCity,
      reqHandlerStartState,
      reqHandlerStartZip,
      reqHandlerTruckType,
      reqHandlerMaterials,
      reqHandlerHoursEstimate,
      reqHandlerTrucksEstimate,
      reqHandlerDate
    } = this.state;
    let isValid = true;

    if (job.selectedMaterials.length === 0) {
      this.setState({
        reqHandlerMaterials: {...reqHandlerMaterials, touched: true, error: 'Required input'}
      });
      isValid = false;
    }

    if (job.truckType.length === 0) {
      this.setState({
        reqHandlerTruckType: {...reqHandlerTruckType, touched: true, error: 'Required input'}
      });
      isValid = false;
    }

    const currDate = new Date();

    if (job.jobDate) {
      currDate.setHours(0, 0, 0, 0);
      job.jobDate.setHours(0, 0, 0, 0);
    }

    if (!job.jobDate || job.jobDate.getTime() < currDate.getTime()) {
      this.setState({
        reqHandlerDate: {...reqHandlerDate, touched: true, error: 'Required input'}
      });
      isValid = false;
    }

    if (job.startLocationAddress1.length === 0) {
      this.setState({
        reqHandlerStartAddress: {...reqHandlerStartAddress, touched: true, error: 'Missing starting address field'}
      });
      isValid = false;
    }

    if (job.startLocationCity.length === 0) {
      this.setState({
        reqHandlerStartCity: {...reqHandlerStartCity, touched: true, error: 'Missing starting city field'}
      });
      isValid = false;
    }

    if (job.startLocationZip.length === 0) {
      this.setState({
        reqHandlerStartZip: {...reqHandlerStartZip, touched: true, error: 'Missing starting zip code field'}
      });
      isValid = false;
    }

    if (job.startLocationState.length === 0) {
      this.setState({
        reqHandlerStartState: {...reqHandlerStartState, touched: true, error: 'Missing starting state field'}
      });
      isValid = false;
    }

    if (job.rateTab === 2) {
      if (job.tonnage <= 0) {
        this.setState({
          reqHandlerTonnage: {...reqHandlerTonnage, touched: true, error: 'A value for number of tons must be set'}
        });
        isValid = false;
      }

      if (job.endLocationAddress1.length === 0) {
        this.setState({
          reqHandlerEndAddress: {...reqHandlerEndAddress, touched: true, error: 'Missing ending address field'}
        });
        isValid = false;
      }

      if (job.endLocationCity.length === 0) {
        this.setState({
          reqHandlerEndCity: {...reqHandlerEndCity, touched: true, error: 'Missing ending city field'}
        });
        isValid = false;
      }

      if (job.endLocationState.length === 0) {
        this.setState({
          reqHandlerEndState: {...reqHandlerEndState, touched: true, error: 'Missing ending state field'}
        });
        isValid = false;
      }

      if (job.endLocationZip.length === 0) {
        this.setState({
          reqHandlerEndZip: {...reqHandlerEndZip, touched: true, error: 'Missing ending zip field'}
        });
        isValid = false;
      }
    }

    if (job.rateTab === 1) {
      if (job.hourEstimatedHours <= 0) {
        this.setState({
          reqHandlerHoursEstimate: {...reqHandlerHoursEstimate, touched: true, error: 'Required input'}
        });
        isValid = false;
      }
      if (job.hourTrucksNumber <= 0) {
        this.setState({
          reqHandlerTrucksEstimate: {...reqHandlerTrucksEstimate, touched: true, error: 'Required input'}
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
    if (!this.isFormValid()) {
      // this.setState({ maxCapacityTouched: true });
      return;
    }
    this.saveTruckInfo(true);
  }

  handleInputChange(e) {
    const {value} = e.target;
    this.setState({[e.target.name]: value});
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
      reqHandlerDate: Object.assign({}, reqHandlerDate, {
        touched: false
      })
    });
    this.setState({jobDate: data});
  }

  firstPage() {
    this.setState({rateTab: 1});
  }

  secondPage() {
    this.setState({rateTab: 2});
  }

  goToSecondFromFirst() {
    const {validateRes} = this.props;
    if (!this.isFormValid()) {
      validateRes(false);
      // TODO display error message
      // console.error('didnt put all the required fields.');
      return;
    }
    validateRes(true);
    const {gotoSecond} = this.props;
    gotoSecond(this.state);
  }

  render() {
    const {
      truckType,
      allTruckTypes,
      capacity,
      allMaterials,
      selectedMaterials,
      /*
      ratebyBoth,
      rateByTon,
      rateByHour,
      */
      rateTab,
      tonnage,
      hourEstimatedHours,
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
      reqHandlerTonnage,
      reqHandlerTruckType,
      reqHandlerMaterials,
      reqHandlerTrucksEstimate,
      reqHandlerHoursEstimate,
      reqHandlerStartAddress,
      reqHandlerStartCity,
      reqHandlerStartZip,
      reqHandlerStartState,
      reqHandlerEndAddress,
      reqHandlerEndState,
      reqHandlerEndZip,
      reqHandlerEndCity,
      reqHandlerDate
    } = this.state;
    const today = new Date();
    const currentDate = today.getTime();
    const {onClose} = this.props;
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            {/* this.handleSubmit  */}
            <form
              className="form form--horizontal addtruck__form"
              onSubmit={e => this.saveTruck(e)}
            >
              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <input
                    name="name"
                    type="text"
                    value={name}
                    onChange={this.handleInputChange}
                    placeholder="Job Name"
                  />
                  {/*
                  <input type="hidden" val={p} />
                  <input type="hidden" val={id} />
                  <input type="hidden" val={defaultDriverId} />
                  <input type="hidden" val={driversId} />
                  */}
                </div>
                <div className="col-md-6 form__form-group">
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
                <div className="col-md-6 form__form-group calign">
                  <span className="form__form-group-label">Capacity</span>
                  <input
                    name="capacity"
                    type="number"
                    value={capacity}
                    onChange={this.handleInputChange}
                    placeholder="Capacity"
                  />
                </div>
              </Row>

              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <span className="form__form-group-label">Materials</span>
                  <MultiSelect
                    input={
                      {
                        onChange: this.handleMaterialsChange,
                        name: 'selectedMaterials',
                        value: selectedMaterials
                      }
                    }
                    // meta={reqHandlerMaterials}
                    options={allMaterials}
                    placeholder="Materials"
                    meta={reqHandlerMaterials}
                  />
                </div>
              </Row>

              <Row className="col-md-12">
                <hr/>
                {/* <hr className="bighr"/> */}
              </Row>

              {/* RATES */}
              <Row className="col-md-12 rateTab">
                <Col>
                  <Card>
                    <div className="wizard">
                      <div className="col-md-6 wizard__steps">
                        {/* onClick={this.gotoPage(1)} */}
                        <div
                          role="link"
                          tabIndex="0"
                          onKeyPress={this.handleKeyPress}
                          onClick={this.firstPage}
                          className={`wizard__step${rateTab === 1 ? ' wizard__step--active' : ''}`}
                        >
                          <p>Hour</p>
                        </div>
                        <div
                          role="link"
                          tabIndex="0"
                          onKeyPress={this.handleKeyPress}
                          onClick={this.secondPage}
                          className={`wizard__step${rateTab === 2 ? ' wizard__step--active' : ''}`}
                        >
                          <p>Ton</p>
                        </div>
                      </div>

                      <div className="wizard__form-wrapper">
                        {/* onSubmit={this.nextPage} */}
                        {rateTab === 2
                        && (
                          <Row className="col-md-12">
                            {/* FIRST ROW */}
                            <div className="col-md-5 form__form-group">
                              Estimated Amount of Tonnage
                            </div>
                            <div className="col-md-3 form__form-group">
                              <TField
                                input={
                                  {
                                    onChange: this.handleTonnageDetails,
                                    name: 'tonnage',
                                    value: tonnage
                                  }
                                }
                                placeholder="Capacity"
                                type="number"
                                meta={reqHandlerTonnage}
                              />
                            </div>
                            <div className="col-md-4 form__form-group">
                              &nbsp;
                            </div>
                            {/* END LOCATION */}
                            <div className="col-md-12 form__form-group">
                              <h3 className="subhead">
                                End Location
                              </h3>
                            </div>
                            <div className="col-md-12 form__form-group">
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
                            <div className="col-md-12 form__form-group">
                              <input
                                name="endLocationAddress2"
                                type="text"
                                value={endLocationAddress2}
                                onChange={this.handleEndAddressChange}
                                placeholder="Address 2"
                              />
                            </div>
                            <div className="col-md-7 form__form-group">
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
                            <div className="col-md-3 form__form-group">
                              <TField
                                input={
                                  {
                                    onChange: this.handleEndAddressChange,
                                    name: 'endLocationState',
                                    value: endLocationState
                                  }
                                }
                                placeholder="State"
                                type="text"
                                meta={reqHandlerEndState}
                              />
                            </div>
                            <div className="col-md-2 form__form-group">
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
                          </Row>
                        )}
                        {rateTab === 1
                        && (
                          <Row className="col-md-12">
                            {/* FIRST ROW */}
                            <div className="col-md-7 form__form-group">
                              How many hours do you estimate for this job?
                            </div>
                            <div className="col-md-3 form__form-group">
                              <TField
                                input={
                                  {
                                    onChange: this.handleHourDetails,
                                    name: 'hourEstimatedHours',
                                    value: hourEstimatedHours
                                  }
                                }
                                type="number"
                                meta={reqHandlerHoursEstimate}
                              />
                            </div>
                            <div className="col-md-2 form__form-group">
                              &nbsp;
                            </div>
                            {/* SECOND ROW */}
                            <div className="col-md-7 form__form-group">
                              How many trucks will you require for this job?
                            </div>
                            <div className="col-md-3 form__form-group">
                              <TField
                                input={
                                  {
                                    onChange: this.handleHourDetails,
                                    name: 'hourTrucksNumber',
                                    value: hourTrucksNumber
                                  }
                                }
                                type="number"
                                meta={reqHandlerTrucksEstimate}
                              />
                            </div>
                            <div className="col-md-2 form__form-group">
                              &nbsp;
                            </div>
                          </Row>
                        )}
                        {/* onSubmit={onSubmit} */}
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Row className="col-md-12">
                <hr/>
              </Row>

              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <h3 className="subhead">
                    Select Date of Job
                  </h3>
                </div>
                <div className="col-md-12 form__form-group">
                  <TDateTimePicker
                    input={
                      {
                        onChange: this.jobDateChange,
                        name: 'jobDate',
                        value: {jobDate},
                        givenDate: currentDate
                      }
                    }
                    onChange={this.jobDateChange}
                    dateFormat="MMMM-dd-yyyy"
                    meta={reqHandlerDate}
                  />
                </div>
              </Row>

              <Row className="col-md-12">
                <hr/>
              </Row>

              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <h3 className="subhead">
                    Starting Location
                  </h3>
                </div>
                <div className="col-md-12 form__form-group">
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
                <div className="col-md-12 form__form-group">
                  <input
                    name="startLocationAddress2"
                    type="text"
                    value={startLocationAddress2}
                    onChange={this.handleStartAddressChange}
                    placeholder="Address 2"
                  />
                </div>
                <div className="col-md-7 form__form-group">
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
                <div className="col-md-3 form__form-group">
                  <TField
                    input={
                      {
                        onChange: this.handleStartAddressChange,
                        name: 'startLocationState',
                        value: startLocationState
                      }
                    }
                    placeholder="State"
                    type="text"
                    meta={reqHandlerStartState}
                  />
                </div>
                <div className="col-md-2 form__form-group">
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
              </Row>

              <Row className="col-md-12">
                <hr/>
              </Row>

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

              <Row className="col-md-12">
                <ButtonToolbar className="col-md-6 wizard__toolbar">
                  <Button color="minimal" className="btn btn-outline-secondary" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                </ButtonToolbar>
                <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                  <Button color="primary" type="button" disabled
                          className="previous"
                  >
                    Back
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
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
}

CreateJobFormOne.propTypes = {
  // getJobFullInfo: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  gotoSecond: PropTypes.func.isRequired,
  firstTabData: PropTypes.func.isRequired
};

CreateJobFormOne.defaultProps = {
  //
};

export default CreateJobFormOne;
