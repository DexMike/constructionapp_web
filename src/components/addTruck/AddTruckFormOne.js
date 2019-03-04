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
import SelectField from '../common/TSelect';
import TCheckBox from '../common/TCheckBox';
import LookupsService from '../../api/LookupsService';
// import DriverService from '../../api/DriverService';
import './AddTruck.css';

// import validate from '../common/validate';

class AddTruckFormOne extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // ...equipment,
      selectedMaterials: [],
      allMaterials: [],
      truckTypes: [],
      maxCapacity: 0,
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
      truckType: ''
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    // // console.log(props);
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
    const { selectedMaterials } = this.state;
    // TODO -> this works well for adding but not for deleting
    const newWord = data.pop().value;
    const index = selectedMaterials.indexOf(newWord);
    if (index !== -1) {
      selectedMaterials.splice(index, 1);
    } else {
      selectedMaterials.push(newWord);
    }
    this.setState({ selectedMaterials });
  }

  selectChange(data) {
    this.setState({ truckType: data.value });
  }

  isFormValid() {
    const company = this.state;
    return !!(company.maxCapacity);
  }

  async handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async saveTruck(e) {
    e.preventDefault();
    e.persist();

    /*
    if (!this.isFormValid()) {
      return;
    }
    */
    const { company } = this.props;
    // // console.log(company);
    const {
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

    /*
    Rate Type is being set to 0, it should be set to:
    Both if they clicked Both;
    Ton if they pick By Tons;
    Hour if they pick By Hour
    */
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
    // TODO-> Ask which params are required
    const shortDesc = description.substring(0, 45);

    const saveValues = {
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
      ratesByBoth, // keeping here in order to track it
      ratesByHour, // keeping here in order to track it
      ratesByTon, // keeping here in order to track it
      hourRate: ratesCostPerHour,
      tonRate: ratesCostPerTon,
      rateType: chargeBy, // PENDING
      companyId: company.id,
      defaultDriverId: 0, // unasigned
      driverEquipmentsId: 0, // unasigned
      driversId: 1, // THIS IS A FK
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
      isArchived: 0
    };

    // save info in the parent
    onTruckFullInfo(saveValues);
    this.handleSubmit('Truck');
  }

  handleInputChange(e) {
    let { value } = e.target;
    // const { ratesByHour, ratesByTon } = this.state;
    if (e.target.name === 'ratesByBoth') {
      // // // // console.log(133);
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
      // // // console.log(217);
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
      // console.log('>> Seems that there is cached information');
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

    // load info from page list
    if (Object.keys(passedTruckFullInfo).length > 0) {
      // there should be a better way of doign this
      console.log(passedTruckFullInfo);
      this.setState({
        maxCapacity: passedTruckFullInfo.maxCapacity,
        description: passedTruckFullInfo.description,
        vin: passedTruckFullInfo.vin,
        licensePlate: passedTruckFullInfo.licensePlate,
        // ratesByBoth: preloaded.info.ratesByBoth,
        // ratesByHour: preloaded.info.ratesByHour,
        // ratesByTon: preloaded.info.ratesByTon,
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

    console.log(passedTruckFullInfo);
  }

  render() {
    const {
      // multiInput,
      // multiMeta,
      selectedMaterials,
      allMaterials,
      truckType,
      maxCapacity,
      description,
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
    const { p } = this.props;
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            <div className="card__title">
              <h5 className="bold-text">
                Welcome to Trelar, Lets add a truck so customers can find you (
                {p}
                )
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
                  <span className="form__form-group-label">Materials Hauled</span>
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
                  <span className="form__form-group-label">Maximum Capacity</span>
                  <input
                    name="maxCapacity"
                    type="number"
                    placeholder="Tons"
                    value={maxCapacity}
                    onChange={this.handleInputChange}
                  />
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
                  <h4 className="subhead">
                    Truck Rates
                  </h4>
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
                  / hour
                </div>

                <div className="col-md-9 form__form-group">
                  <hr/>
                </div>

                <div className="col-md-12 form__form-group">
                  <h4 className="subhead">
                    Do you have a Minumum:
                  </h4>
                </div>

                {/* THIRD ROW */}
                <div className="col-md-4 form__form-group">
                  Min Operating Time
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

                <div className="col-md-12 form__form-group">
                  <h4 className="subhead">
                    Do you have a Minumum:
                  </h4>
                </div>

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

              <div className="col-md-9 form__form-group">
                <hr/>
              </div>

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
                <div className="col-md-12 form__form-group">
                  <ButtonToolbar className="form__button-toolbar wizard__toolbar">
                    <Button color="primary" type="button" disabled
                            className="previous"
                    >
                      Back
                    </Button>
                    <Button color="primary" type="submit" className="next">Next</Button>
                  </ButtonToolbar>
                </div>
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
  })
};

AddTruckFormOne.defaultProps = {
  p: null,
  company: null,
  equipment: null,
  passedTruckFullInfo: null
};

export default AddTruckFormOne;
