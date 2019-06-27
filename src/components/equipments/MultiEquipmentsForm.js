import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col,
  Button,
  Row
} from 'reactstrap';
import moment from 'moment';
import * as PropTypes from 'prop-types';
import MultiSelect from '../common/TMultiSelect';
import SelectField from '../common/TSelect';
import TCheckBox from '../common/TCheckBox';
import TFieldNumber from '../common/TFieldNumber';
import LookupsService from '../../api/LookupsService';
import TSpinner from '../common/TSpinner';
import EquipmentService from '../../api/EquipmentService';

class MultiEquipmentsForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedMaterials: [],
      allMaterials: [],
      truckTypes: [],
      maxCapacity: '',
      numberOfTrucks: 1,
      ratesCostPerTon: '',
      ratesCostPerHour: '',
      minOperatingTime: '',
      minTons: '',
      maxDistanceToPickup: '',
      truckType: '',
      isRatedHour: true,
      isRatedTon: false,
      reqHandlerTruckType: { touched: false, error: '' },
      reqHandlerMaterials: { touched: false, error: '' },
      loaded: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    await this.fetchMaterials();
    this.setState({loaded: true});
  }

  handleMultiChange(data) {
    const { reqHandlerMaterials } = this.state;
    this.setState({
      reqHandlerMaterials: Object.assign({}, reqHandlerMaterials, {
        touched: false
      })
    });
    this.setState({ selectedMaterials: data });
  }

  selectChange(data) {
    const { reqHandlerTruckType } = this.state;
    this.setState({
      reqHandlerTruckType: Object.assign({}, reqHandlerTruckType, {
        touched: false
      })
    });
    this.setState({ truckType: data.value });
  }

  isFormValid() {
    const truck = this.state;
    let isValid = true;

    this.setState({
      reqHandlerTruckType: { touched: false },
      reqHandlerMaterials: { touched: false }
    });

    if (truck.truckType.length === 0) {
      this.setState({
        reqHandlerTruckType: {
          touched: true,
          error: 'Please select the type of truck you are adding'
        }
      });
      isValid = false;
    }

    if (truck.selectedMaterials.length === 0) {
      this.setState({
        reqHandlerMaterials: {
          touched: true,
          error: 'Please select all of the types of materials you are willing to haul'
        }
      });
      isValid = false;
    }

    if (isValid) {
      return true;
    }

    return false;
  }

  async handleSubmit(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async saveTruck() {
    if (!this.isFormValid()) {
      return;
    }
    const {
      numberOfTrucks,
      truckType,
      selectedMaterials,
      isRatedHour,
      isRatedTon,
      maxCapacity,
      maxDistanceToPickup,
      ratesCostPerHour,
      ratesCostPerTon,
      minTons,
      minOperatingTime
    } = this.state;
    const { userId, companyId, toggle } = this.props;
    let rateType;
    if ((isRatedHour && isRatedTon) || (!isRatedHour && !isRatedTon)) {
      rateType = 'Any';
    }
    if (isRatedHour && !isRatedTon) {
      rateType = 'Hour';
    }
    if (!isRatedHour && isRatedTon) {
      rateType = 'Tonage';
    }

    const equipments = [];
    for (let i = 0; i < numberOfTrucks; i += 1) {
      const newEquipment = {
        companyId,
        name: `${truckType} ${i + 1}`,
        type: truckType,
        image: '',
        description: '',
        driversId: 1,
        defaultDriverId: 1,
        equipmentAddressId: 77,
        maxCapacity,
        maxDistance: maxDistanceToPickup,
        rateType,
        tonRate: rateType === 'Tonage' || rateType === 'Any' ? ratesCostPerTon : null,
        hourRate: rateType === 'Hour' || rateType === 'Any' ? ratesCostPerHour : null,
        minCapacity: rateType === 'Tonage' || rateType === 'Any' ? minTons : null,
        minHours: rateType === 'Hour' || rateType === 'Any' ? minOperatingTime : null,
        createdOn: moment().unix() * 1000,
        createdBy: userId,
        modifiedOn: moment().unix() * 1000,
        modifiedBy: userId
      };
      equipments.push(newEquipment);
    }
    const materials = [];
    for (let i = 0; i < selectedMaterials.length; i += 1) {
      const newMaterial = {
        equipmentsId: 0,
        value: selectedMaterials[i].label,
        createdOn: moment().unix() * 1000,
        createdBy: userId,
        modifiedOn: moment().unix() * 1000,
        modifiedBy: userId
      };
      materials.push(newMaterial);
    }
    try {
      await EquipmentService.createEquipmentsBatch(equipments, materials);
    } catch (e) {
      // console.log(e);
    }
    toggle();
  }

  handleInputChange(e) {
    const { value } = e.target;
    if (e.target.name === 'ratesByHour' && e.target.checked) {
      this.setState({ isRatedHour: true });
    } else if (e.target.name === 'ratesByHour' && !e.target.checked) {
      this.setState({ isRatedHour: false });
    }

    if (e.target.name === 'ratesByTon' && e.target.checked) {
      this.setState({ isRatedTon: true });
    } else if (e.target.name === 'ratesByTon' && !e.target.checked) {
      this.setState({ isRatedTon: false });
    }
    this.setState({
      [e.target.name]: value
    });
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
    Object.values(truckTypes)
      .forEach((itm) => {
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
  }

  render() {
    const {
      numberOfTrucks,
      selectedMaterials,
      allMaterials,
      truckType,
      maxCapacity,
      ratesCostPerHour,
      isRatedHour,
      isRatedTon,
      ratesCostPerTon,
      minOperatingTime,
      minTons,
      maxDistanceToPickup,
      truckTypes,
      reqHandlerTruckType,
      reqHandlerMaterials,
      loaded
    } = this.state;
    const { toggle } = this.props;
    if (loaded) {
      return (
        <React.Fragment>
          <Row>
            <Col md={12}>
              <h3 className="subhead">
                Tell us about your trucks
              </h3>
            </Col>
            <Col md={6}>
              <span>Truck Type</span>
              <SelectField
                input={
                  {
                    onChange: this.selectChange,
                    name: 'Truck Type',
                    value: truckType
                  }
                }
                meta={reqHandlerTruckType}
                value={truckType}
                options={truckTypes}
                placeholder="Truck Type"
              />
            </Col>
            <Col md={6}>
              <span>Number of Trucks</span>
              <TFieldNumber
                input={{
                  onChange: this.handleInputChange,
                  name: 'numberOfTrucks',
                  value: numberOfTrucks
                }}
                value={numberOfTrucks}
              />
            </Col>
            <Col md={12} style={{marginTop: 6}}>
              <span>
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
                meta={reqHandlerMaterials}
                options={allMaterials}
                placeholder="Materials"
              />
            </Col>
          </Row>
          <Row className="pt-4">
            <Col md={12}>
              <h3 className="subhead">
                Truck Rates
              </h3>
            </Col>
          </Row>
          <Row className="pt-2">
            <Col md={2} className="my-auto">
              <TCheckBox
                onChange={this.handleInputChange}
                name="ratesByHour"
                value={isRatedHour}
                label="By Hour"
              />
            </Col>
            <Col md={5}>
              <span className="label">$ Cost / Hour</span>
              <TFieldNumber
                input={
                  {
                    onChange: this.handleInputChange,
                    name: 'ratesCostPerHour',
                    value: ratesCostPerHour
                  }
                }
                placeholder="0"
                decimal
              />
            </Col>
            <Col md={5}>
              <span className="label">Minimum Hours</span>
              <TFieldNumber
                input={
                  {
                    onChange: this.handleInputChange,
                    name: 'minOperatingTime',
                    value: minOperatingTime
                  }
                }
                placeholder="0"
              />
            </Col>
          </Row>
          <Row className="pt-2">
            <Col md={2} className="my-auto">
              <TCheckBox
                onChange={this.handleInputChange}
                name="ratesByTon"
                value={isRatedTon}
                label="By Ton"
              />
            </Col>
            <Col md={5}>
              <span className="label">$ Cost / Ton</span>
              <TFieldNumber
                input={
                  {
                    onChange: this.handleInputChange,
                    name: 'ratesCostPerTon',
                    value: ratesCostPerTon
                  }
                }
                placeholder="0"
                decimal
              />
            </Col>
            <Col md={5}>
              <span className="label">Minimum Tons</span>
              <TFieldNumber
                input={
                  {
                    onChange: this.handleInputChange,
                    name: 'minTons',
                    value: minTons
                  }
                }
                placeholder="0"
              />
            </Col>
          </Row>
          <Row className="pt-4">
            <Col md={6}>
              <span>
                Maximum Capacity (Tons)
              </span>
              <TFieldNumber
                input={
                  {
                    onChange: this.handleInputChange,
                    name: 'maxCapacity',
                    value: maxCapacity
                  }
                }
                placeholder="0"
              />
            </Col>
            <Col md={6}>
              <span>
                Max Distance to Pickup (Miles)
              </span>
              <TFieldNumber
                input={{
                  onChange: this.handleInputChange,
                  name: 'maxDistanceToPickup',
                  value: maxDistanceToPickup
                }}
                placeholder="How far will you travel per job"
              />
            </Col>
          </Row>
          <Row className="pt-4 text-right">
            <Col md={12}>
              <Button className="tertiaryButton" type="button" onClick={toggle}>
                Cancel
              </Button>
              <Button type="submit" className="primaryButton" onClick={() => this.saveTruck()}>
                Save
              </Button>
            </Col>
          </Row>
        </React.Fragment>
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

MultiEquipmentsForm.propTypes = {
  userId: PropTypes.number,
  companyId: PropTypes.number,
  toggle: PropTypes.func.isRequired
};

MultiEquipmentsForm.defaultProps = {
  userId: 0,
  companyId: 0
};
export default MultiEquipmentsForm;
