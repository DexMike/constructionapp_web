import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button,
  ButtonToolbar,
  Row
} from 'reactstrap';
import moment from 'moment';
import PropTypes from 'prop-types';
import MultiSelect from '../common/TMultiSelect';
// import DropZoneMultipleField from '../common/TDropZoneMultiple';
import SelectField from '../common/TSelect';
// import TField from '../common/TField';
import TCheckBox from '../common/TCheckBox';
import LookupsService from '../../api/LookupsService';
// import DriverService from '../../api/DriverService';
import './AddTruck.css';

// import validate from '../common/validate ';

class AddTruckFormOne extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // ...equipment,
      id: 0, // for use if we are editing
      driversId: 0, // for use if we are editing
      defaultDriverId: 0, // for use if we are editing
      selectedMaterials: [],
      allMaterials: [],
      truckTypes: [],
      maxCapacity: 15,
      // maxCapacityTouched: false,
      description: '',
      vin: '',
      licensePlate: '',
      ratesByBoth: false, // this only tracks the select
      ratesByHour: false,
      ratesByTon: false,
      ratesCostPerTon: 0,
      ratesCostPerHour: 0,
      minOperatingTime: 0,
      maxDistanceToPickup: 0,
      truckType: ''// ,
      // class: 'shown'
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    await this.fetchMaterials();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.equipment) {
      const { equipment } = nextProps;
      Object.keys(equipment)
        .map((key) => {
          if (equipment[key] === null) {
            equipment[key] = '';
          }
          return true;
        });
      this.setState({ ...equipment });
    }
  }

  handleMultiChange(data) {
    this.setState({ selectedMaterials: data });
  }

  selectChange(data) {
    this.setState({ truckType: data.value });
  }

  async handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  saveTruckInfo(redir) {
    const { company } = this.props;
    const {
      id,
      selectedMaterials,
      defaultDriverId,
      driversId,
      truckType,
      maxCapacity,
      description,
      vin,
      licensePlate,
      ratesByBoth,
      ratesByHour,
      ratesByTon,
      ratesCostPerHour,
      ratesCostPerTon,
      minOperatingTime,
      maxDistanceToPickup
    } = this.state;
    const { onTruckFullInfo } = this.props;
    // validation is pending

    // set states for checkboxes
    let chargeBy = '';
    if (ratesByBoth) {
      chargeBy = 'Both';
    } else {
      if (ratesByHour) {
        chargeBy = 'Hour';
      }
      if (ratesByTon) {
        chargeBy = 'Tons';
      }
    }

    // map the values with the ones on equipment
    const shortDesc = description.substring(0, 45);

    // TODO-> Ask which params are required
    const saveValues = {
      id,
      selectedMaterials,
      name: shortDesc, // unasigned
      type: truckType,
      styleId: 0, // unasigned
      maxCapacity, // This is a shorthand of (maxCapacity: maxCapacity)
      minCapacity: 0, // unasigned
      minHours: minOperatingTime,
      maxDistance: maxDistanceToPickup,
      description,
      licensePlate,
      vin,
      image: '', // unasigned
      currentAvailability: 1, // unasigned
      startAvailability: new Date(),
      endAvailability: new Date(),
      ratesByBoth, // keeping here in order to track it
      ratesByHour, // keeping here in order to track it
      ratesByTon, // keeping here in order to track it
      hourRate: ratesCostPerHour,
      tonRate: ratesCostPerTon,
      rateType: chargeBy, // PENDING
      companyId: company.id,
      defaultDriverId, // unasigned
      driverEquipmentsId: 0, // unasigned
      driversId, // THIS IS A FK
      equipmentAddressId: 3, // THIS IS A FK
      modelId: '', // unasigned
      makeId: '', // unasigned
      notes: '', // unasigned
      createdBy: 0,
      createdOn: moment()
        .unix() * 1000,
      modifiedBy: 0,
      modifiedOn: moment()
        .unix() * 1000,
      isArchived: 0,
      redir
    };

    // save info in the parent
    onTruckFullInfo(saveValues);
    this.handleSubmit('Truck');
  }

  isFormValid() {
    const { maxCapacity } = this.state;
    // console.log(maxCapacity);
    if (maxCapacity === 0) {
      return false;
    }
    return true;
    // return !!(maxCapacity.maxCapacity);
  }

  async saveTruck(e) {
    e.preventDefault();
    e.persist();
    /*
    if (!this.isFormValid()) {
      this.setState({ maxCapacityTouched: true });
      return;
    }
    */
    this.saveTruckInfo(true);
  }

  handleInputChange(e) {
    // // console.log(e);
    let { value } = e.target;
    // const { ratesByHour, ratesByTon } = this.state;
    if (e.target.name === 'ratesByBoth') {
      value = e.target.checked ? Number(1) : Number(0);
      if (e.target.checked) {
        this.setState({
          ratesByHour: 1,
          ratesByTon: 1
        });
      } else {
        this.setState({
          ratesByHour: 0,
          ratesByTon: 0
        });
      }
    }
    if (e.target.name === 'ratesByHour' && e.target.checked) {
      this.setState({ ratesByTon: 0 });
    }
    if (e.target.name === 'ratesByTon' && e.target.checked) {
      this.setState({ ratesByHour: 0 });
    }
    if (e.target.name === 'maxCapacity') {
      // this.RenderField('renderField', 'coman', 'number', 'Throw error');
    }
    this.setState({ [e.target.name]: value });
  }

  // Pull materials
  async fetchMaterials() {
    let materials = await LookupsService.getLookupsByType('MaterialType');
    const truckTypes = await LookupsService.getLookupsByType('EquipmentType');

    materials = materials.map(material => ({
      value: String(material.id),
      label: material.val1
    }));

    const allTruckTypes = [];
    Object.values(truckTypes).forEach((itm) => {
      const inside = {
        label: itm.val1,
        value: itm.val1
      };
      allTruckTypes.push(inside);
    });
    this.setState({
      allMaterials: materials,
      truckTypes: allTruckTypes
    });

    // check if there is preloaded info
    const { getTruckFullInfo, passedTruckFullInfo } = this.props;
    const preloaded = getTruckFullInfo();

    // load info from cached (if coming back from next tabs)
    if (Object.keys(preloaded).length > 0) {
      // // // console.log('>> Seems that there is cached information');
      this.setState({
        maxCapacity: preloaded.info.maxCapacity,
        description: preloaded.info.description,
        vin: preloaded.info.vin,
        licensePlate: preloaded.info.licensePlate,
        ratesByBoth: preloaded.info.ratesByBoth,
        ratesByHour: preloaded.info.ratesByHour,
        ratesByTon: preloaded.info.ratesByTon,
        minOperatingTime: preloaded.info.minHours,
        maxDistanceToPickup: preloaded.info.maxDistance,
        ratesCostPerTon: preloaded.info.tonRate,
        ratesCostPerHour: preloaded.info.hourRate,
        truckType: preloaded.info.type
      });
      // Materials Hauled is missing
    }

    // if this is loaded from the list instead
    if (Object.keys(passedTruckFullInfo).length > 0) {
      // there should be a better way of doign this

      this.setState({
        id: passedTruckFullInfo.id,
        driversId: passedTruckFullInfo.driversId,
        defaultDriverId: passedTruckFullInfo.defaultDriverId,
        maxCapacity: passedTruckFullInfo.maxCapacity,
        description: passedTruckFullInfo.description,
        vin: passedTruckFullInfo.vin,
        licensePlate: passedTruckFullInfo.licensePlate,
        minOperatingTime: passedTruckFullInfo.minHours,
        maxDistanceToPickup: passedTruckFullInfo.maxDistance,
        ratesCostPerTon: Number(passedTruckFullInfo.tonRate),
        ratesCostPerHour: passedTruckFullInfo.hourRate,
        truckType: passedTruckFullInfo.type
      });
      // set booleans
      if (passedTruckFullInfo.rateType === 'Both') {
        this.setState({ ratesByBoth: true });
      }
      if (passedTruckFullInfo.rateType === 'Tons') {
        this.setState({ ratesByTon: true });
      }
      if (passedTruckFullInfo.rateType === 'Hour') {
        this.setState({ ratesByHour: true });
      }
    }
    this.saveTruckInfo(false);
    // let's cache this info, in case we want to go back
  }

  handleImg(e) {
    // // console.log(e);
    return e;
  }

  render() {
    const {
      // multiInput,
      // multiMeta,
      id,
      defaultDriverId,
      driversId,
      selectedMaterials,
      allMaterials,
      truckType,
      maxCapacity,
      // maxCapacityTouched,
      description,
      // descriptionTouched,
      vin,
      licensePlate,
      ratesByBoth,
      ratesByHour,
      ratesCostPerHour,
      ratesByTon,
      ratesCostPerTon,
      minOperatingTime,
      maxDistanceToPickup,
      truckTypes
    } = this.state;
    const { p, onClose } = this.props;
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            <div className="card__title">
              <h5 className="bold-text">
                Welcome to Trelar, Lets add a truck so customers can find you
              </h5>
            </div>

            {/* this.handleSubmit  */}
            <form
              className="form form--horizontal addtruck__form"
              onSubmit={e => this.saveTruck(e)}
            >
              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <h3 className="subhead">
                    Tell us about your truck
                  </h3>
                </div>
                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">Truck description</span>
                  <input
                    name="description"
                    type="text"
                    value={description}
                    onChange={this.handleInputChange}
                  />
                  <input type="hidden" val={p} />
                  <input type="hidden" val={id} />
                  <input type="hidden" val={defaultDriverId} />
                  <input type="hidden" val={driversId} />
                </div>
                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">Truck Type</span>
                  <SelectField
                    input={
                      {
                        onChange: this.selectChange,
                        name: 'Truck Type',
                        value: truckType
                      }
                    }
                    meta={
                      {
                        touched: false,
                        error: 'Unable to select'
                      }
                    }
                    value={truckType}
                    options={truckTypes}
                    placeholder="Truck Type"
                  />
                </div>
              </Row>

              <Row className="col-md-12">
                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">
                    Materials Hauled
                  </span>
                  <MultiSelect
                    input={
                      {
                        onChange: this.handleMultiChange,
                        name: 'materials',
                        value: selectedMaterials
                      }
                    }
                    meta={
                      {
                        touched: false,
                        error: 'Unable to reach fields'
                      }
                    }
                    options={allMaterials}
                    placeholder="Materials"
                  />
                </div>
                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">Maximum Capacity (Tons)</span>
                  <input
                    name="maxCapacity"
                    type="number"
                    value={maxCapacity}
                    onChange={this.handleInputChange}
                  />
                  {/*
                  <TField
                    input={
                      {
                        onChange: this.handleJobInputChange,
                        name: 'maxCapacity',
                        value: maxCapacity
                      }
                    }
                    placeholder="prueba"
                    type="number"
                    meta={
                      {
                        touched: maxCapacityTouched,
                        error: 'Please set the Maximum Capacity'
                      }
                    }
                    value={maxCapacity}
                  />
                  */}
                </div>

                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">Vin #</span>
                  <input
                    name="vin"
                    type="text"
                    value={vin}
                    onChange={this.handleInputChange}
                  />
                </div>
                <div className="col-md-6 form__form-group">
                  <span className="form__form-group-label">License Plate</span>
                  <input
                    name="licensePlate"
                    type="text"
                    value={licensePlate}
                    onChange={this.handleInputChange}
                  />
                </div>
              </Row>

              <Row className="col-md-12">
                <hr className="bighr"/>
              </Row>

              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <h3 className="subhead">
                    Truck Rates
                  </h3>
                </div>

                {/* FIRST ROW */}
                <div className="col-md-4 form__form-group">
                  <div className="form__form-group">
                    <TCheckBox onChange={this.handleInputChange} name="ratesByBoth"
                               value={!!ratesByBoth} label="By Both"
                    />
                  </div>
                </div>
                <div className="col-md-8 form__form-group">
                  <i className="material-icons iconSet">local_shipping</i>
                  &nbsp;
                  <i className="material-icons iconSet">schedule</i>
                </div>

                {/* SECOND ROW */}
                <div className="col-md-4 form__form-group">
                  <TCheckBox onChange={this.handleInputChange} name="ratesByHour"
                             value={!!ratesByHour} label="By Hour"
                  />
                </div>
                <div className="col-md-1 ">
                  <i className="material-icons iconSet">schedule</i>
                </div>
                <div className="col-md-3 form__form-group">
                  Min Rate per Hour $
                </div>
                <div className="col-md-2 form__form-group">
                  <input
                    name="ratesCostPerHour"
                    type="number"
                    value={ratesCostPerHour}
                    onChange={this.handleInputChange}
                  />
                </div>
                <div className="col-md-2 form__form-group moveleft">
                  Hours
                </div>
              </Row>

              <Row className="col-md-12">
                <hr />
              </Row>

              <Row className="col-md-12">

                <div className="col-md-12 form__form-group">
                  <h4 className="subhead">
                    Do you have a Minimum:
                  </h4>
                </div>

                {/* THIRD ROW */}
                <div className="col-md-4 form__form-group">
                  Minimum Booking Time
                </div>
                <div className="col-md-2 form__form-group">
                  <input
                    name="minOperatingTime"
                    type="number"
                    value={minOperatingTime}
                    onChange={this.handleInputChange}
                  />
                </div>
                <div className="col-md-6 form__form-group">
                  Hours / Job
                </div>

                {/* FOURTH ROW */}
                <div className="col-md-4 form__form-group">
                  <TCheckBox onChange={this.handleInputChange} name="ratesByTon"
                             value={!!ratesByTon} label="By Ton"
                  />
                </div>
                <div className="col-md-1 ">
                  <i className="material-icons iconSet">local_shipping</i>
                </div>
                <div className="col-md-3 form__form-group">
                  Cost per Ton $
                </div>
                <div className="col-md-2 form__form-group">
                  <input
                    name="ratesCostPerTon"
                    type="number"
                    value={ratesCostPerTon}
                    onChange={this.handleInputChange}
                  />
                </div>
                <div className="col-md-2 form__form-group">
                  / Ton
                </div>
              </Row>

              <Row className="col-md-12">
                <hr />
              </Row>

              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  Max Distance to Pickup &nbsp;
                  <input
                    name="maxDistanceToPickup"
                    type="number"
                    value={maxDistanceToPickup}
                    onChange={this.handleInputChange}
                  />
                  (How far will you travel per job?)
                </div>

              </Row>

              <Row className="col-md-12">
                <hr />
              </Row>

              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <h4 className="subhead">
                    Upload a picture of your Truck (Optional)
                  </h4>
                </div>
                <div className="col-md-12 form__form-group">
                  <h3 className="subhead">
                    We&apos;ll show a picture of it when a customer searches for Trucks
                  </h3>
                </div>
                <div className="col-md-12 form__form-group">
                  <p>picture goes here</p>
                </div>
              </Row>

              <Row className="col-md-12">
                <hr className="bighr" />
              </Row>

              {/*
              <Row>
                <DropZoneMultipleField
                  input={
                    {
                      onChange: this.handleImg,
                      name: 'materials',
                      value: { maxDistanceToPickup }
                    }
                  }
                />
              </Row>
              */}

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
                  <Button color="primary" type="submit" className="next">Next</Button>
                </ButtonToolbar>
              </Row>

            </form>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

AddTruckFormOne.propTypes = {
  equipment: PropTypes.shape({
    id: PropTypes.number
  }),
  p: PropTypes.number,
  company: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.number
  }),
  getTruckFullInfo: PropTypes.func.isRequired,
  onTruckFullInfo: PropTypes.func.isRequired,
  passedTruckFullInfo: PropTypes.shape({
    info: PropTypes.object
  }),
  onClose: PropTypes.func.isRequired
};

AddTruckFormOne.defaultProps = {
  p: null,
  company: null,
  equipment: null,
  passedTruckFullInfo: null
};

export default AddTruckFormOne;
