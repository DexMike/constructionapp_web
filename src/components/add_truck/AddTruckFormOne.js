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
import MultiSelect from '../common/MultiSelect';
import SelectField from '../common/Select';
import TCheckBox from '../common/TCheckBox';
import LookupsService from '../../api/LookupsService';
import EquipmentsService from '../../api/EquipmentsService';
import './AddTruck.css';
// import validate from '../common/validate';

class AddTruckFormOne extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // ...equipment,
      selectedMaterials: [],
      allMaterials: [],
      maxCapacity: 0,
      description: '',
      vin: '',
      licensePlate: '',
      ratesByBoth: false,
      ratesByHour: false,
      ratesCostPerHour: 0,
      ratesByTon: false,
      ratesCostPerTon: 0,
      minOperatingTime: 0,
      maxDistanceToPickup: 0,
      truckType: ''
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
    // const { truckType } = this.state;
    this.setState({ truckType: data.value });
  }

  isFormValid() {
    const company = this.state;
    return !!(company.maxCapacity);
  }

  handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async saveTruck(e) {
    e.preventDefault();
    /*
    if (!this.isFormValid()) {
      return;
    }
    */
    const { match } = this.props;
    const {
      /*
      multiInput,
      multiMeta,
      allMaterials,
      selectInput,
      selectMeta,
      */
      truckType,
      maxCapacity,
      description,
      vin,
      licensePlate,
      ratesByBoth,
      // ratesByHour,
      ratesCostPerHour,
      // ratesByTon,
      ratesCostPerTon,
      minOperatingTime,
      maxDistanceToPickup,
      handleSubmit } = this.state;
    // validation is pending

    const chargeBy = ratesByBoth === true ? 1 : 0;
    // map the values with the ones on equipment
    // TODO-> Ask which params are required
    const saveValues = {
      name: '', // unasigned
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
      currentAvailability: 0, // unasigned
      hourRate: ratesCostPerHour,
      tonRate: ratesCostPerTon,
      rateType: chargeBy, // PENDING
      companyId: match.params.id,
      defaultDriverId: 0, // unasigned
      driverEquipmentsId: 0, // unasigned
      driversId: 0, // unasigned
      equipmentAddressId: 0, // unasigned
      modelId: '', // unasigned
      makeId: '', // unasigned
      notes: '', // unasigned
      createdBy: 0,
      createdOn: moment().unix() * 1000,
      modifiedBy: 0,
      modifiedOn: moment().unix() * 1000,
      isArchived: 0
    };
    await EquipmentsService.createEquipment(saveValues);
    handleSubmit('Equipment');
  }

  handleInputChange(e) {
    let { value } = e.target;
    // const { ratesByHour, ratesByTon } = this.state;
    if (e.target.name === 'ratesByBoth') {
      // // console.log(133);
      value = e.target.checked ? Number(1) : Number(0);
      if (e.target.checked) {
        this.setState({ ratesByHour: 1, ratesByTon: 1 });
      } else {
        this.setState({ ratesByHour: 0, ratesByTon: 0 });
      }
    }
    if (e.target.name === 'ratesByHour' && e.target.checked) {
      this.setState({ ratesByTon: 0 });
    }
    if (e.target.name === 'ratesByTon' && e.target.checked) {
      this.setState({ ratesByHour: 0 });
    }
    if (e.target.name === 'maxCapacity') {
      // console.log(217);
      // this.RenderField('renderField', 'coman', 'number', 'Throw error');
    }
    this.setState({ [e.target.name]: value });
  }

  // Pull materials
  async fetchMaterials() {
    let materials = await LookupsService.getLookupsByType('MaterialType');
    materials = materials.map((lookup) => {
      const newLookup = lookup;
      newLookup.modifiedOn = moment(lookup.modifiedOn).format();
      newLookup.createdOn = moment(lookup.createdOn).format();
      return newLookup;
    });
    const simpleMaterials = [];
    for (const material of materials) {
      const simple = {
        value: String(material.id),
        label: material.val1
      };
      simpleMaterials.push(simple);
    }
    this.setState({ allMaterials: simpleMaterials });
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
      maxDistanceToPickup
    } = this.state;
    const { handleSubmit, p } = this.props;
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

            {/* onSubmit={e => this.saveCompany(e)} */}
            <form
              className="form form--horizontal addtruck__form"
              onSubmit={handleSubmit}
            >
              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <h4 className="subhead">
                  Tell us a bout your truck
                  </h4>
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
                    options={[
                      { value: 'Side Dump', label: 'Side Dump' },
                      { value: 'Dump Belly', label: 'Dump Belly' },
                      { value: 'Bottom Dump', label: 'Bottom Dump' },
                      { value: 'Rear Dump', label: 'Rear Dump' }
                    ]}
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
                <hr className="bighr" />
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
                  <i className="material-icons">shopping_basket</i>
                   &nbsp;
                  <i className="material-icons">schedule</i>
                </div>

                {/* SECOND ROW */}
                <div className="col-md-4 form__form-group">
                  <TCheckBox onChange={this.handleInputChange} name="ratesByHour"
                    value={!!ratesByHour} label="By Hour"
                  />
                </div>
                <div className="col-md-1 ">
                  <i className="material-icons">schedule</i>
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
                  <hr />
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
                    type="text"
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
                  <i className="material-icons">shopping_basket</i>
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
                <hr />
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
                    <Button color="primary" type="button" disabled className="previous">Back</Button>
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  p: PropTypes.number,
  // form: 'horizontal_form_validation_two', // a unique identifier for this form
  // validate,
  handleSubmit: PropTypes.func.isRequired
};

AddTruckFormOne.defaultProps = {
  p: null,
  equipment: null,
  match: {
    params: {}
  }
};

export default AddTruckFormOne;
