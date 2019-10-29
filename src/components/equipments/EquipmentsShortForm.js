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
import TField from '../common/TField';
import { withTranslation } from 'react-i18next';

class EquipmentsShortForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedMaterials: [],
      allMaterials: [],
      truckTypes: [],
      maxCapacity: 0,
      externalEquipmentNumber: '',
      ratesCostPerTon: 0,
      ratesCostPerHour: 0,
      minOperatingTime: 0,
      minTons: 0,
      maxDistanceToPickup: '',
      truckType: '',
      isRatedHour: false,
      isRatedTon: false,
      reqHandlerTruckType: { touched: false, error: '' },
      reqHandlerMaterials: { touched: false, error: '' },
      reqHandlerExternalEquipmentNumber: { touched: false, error: '' },
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

  async isFormValid() {
    const {
      truckType,
      selectedMaterials,
      externalEquipmentNumber,
      maxCapacity
    } = this.state;
    const { companyId } = { ...this.props };
    let isValid = true;

    this.setState({
      reqHandlerTruckType: { touched: false },
      reqHandlerMaterials: { touched: false },
      reqHandlerMaxCapacity: { touched: false },
      reqHandlerExternalEquipmentNumber: { touched: false }
    });

    if (truckType.length === 0) {
      this.setState({
        reqHandlerTruckType: {
          touched: true,
          error: 'Please select the type of truck you are adding'
        }
      });
      isValid = false;
    }

    if (selectedMaterials.length === 0) {
      this.setState({
        reqHandlerMaterials: {
          touched: true,
          error: 'Please select all of the types of materials you are willing to haul'
        }
      });
      isValid = false;
    }

    if (externalEquipmentNumber === '' || externalEquipmentNumber === null) {
      this.setState({
        reqHandlerExternalEquipmentNumber: {
          touched: true,
          error: 'Please enter truck number'
        }
      });
      isValid = false;
    }

    const response = await EquipmentService.checkExternalEquipmentNumber(
      {
        companyId,
        externalEquipmentNumber
      }
    );

    if (!response.isUnique) {
      this.setState({
        reqHandlerExternalEquipmentNumber: {
          touched: true,
          error: 'You have used this truck number for another truck'
        }
      });
      isValid = false;
    }

    if (maxCapacity === 0 || maxCapacity === '0') {
      this.setState({
        reqHandlerMaxCapacity: {
          touched: true,
          error: 'Please enter trucks max capacity'
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
    const isFormValid = await this.isFormValid();
    if (!isFormValid) {
      return;
    }
    const {
      externalEquipmentNumber,
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
    const { userId, companyId, toggle, onSuccess } = this.props;
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
    // for (let i = 0; i < numberOfTrucks; i += 1) {
    const newEquipment = {
      companyId,
      // name: `${truckType} ${i + 1}`,
      name: truckType,
      type: truckType,
      image: '',
      description: '',
      driversId: 0,
      defaultDriverId: 0,
      equipmentAddressId: null,
      maxCapacity,
      maxDistance: maxDistanceToPickup,
      rateType,
      externalEquipmentNumber,
      tonRate: rateType === 'Tonage' || rateType === 'Any' ? ratesCostPerTon : null,
      hourRate: rateType === 'Hour' || rateType === 'Any' ? ratesCostPerHour : null,
      minCapacity: rateType === 'Tonage' || rateType === 'Any' ? minTons : null,
      minHours: rateType === 'Hour' || rateType === 'Any' ? minOperatingTime : null,
      createdOn: moment.utc().format(),
      createdBy: userId,
      modifiedOn: moment.utc().format(),
      modifiedBy: userId
    };
    equipments.push(newEquipment);
    // }
    const materials = [];
    for (let i = 0; i < selectedMaterials.length; i += 1) {
      const newMaterial = {
        equipmentsId: 0,
        value: selectedMaterials[i].label,
        createdOn: moment.utc().format(),
        createdBy: userId,
        modifiedOn: moment.utc().format(),
        modifiedBy: userId
      };
      materials.push(newMaterial);
    }
    try {
      console.log({equipments, equipmentMaterials: materials});
      await EquipmentService.createEquipmentsBatch(equipments, materials);
    } catch (e) {
      // console.log(e);
    }

    onSuccess({externalEquipmentNumber,
      truckType,
      selectedMaterials,
      isRatedHour,
      isRatedTon,
      maxCapacity,
      maxDistanceToPickup,
      ratesCostPerHour,
      ratesCostPerTon,
      minTons,
      minOperatingTime});

    toggle();
  }

  handleInputChange(e) {
    const { value } = e.target;
    let reqHandler = '';
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

    if (e.target.name === 'externalEquipmentNumber') {
      reqHandler = 'reqHandlerExternalEquipmentNumber';
    }

    if (e.target.name === 'ratesCostPerHour') {
      reqHandler = 'reqHandlerMinHourRate';
    }
    if (e.target.name === 'minOperatingTime') {
      reqHandler = 'reqHandlerMinHours';
    }
    if (e.target.name === 'ratesCostPerTon') {
      reqHandler = 'reqHandlerMinTonRate';
    }
    if (e.target.name === 'minTons') {
      reqHandler = 'reqHandlerMinTons';
    }

    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      [e.target.name]: value
    });
  }

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
      externalEquipmentNumber,
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
      reqHandlerExternalEquipmentNumber,
      reqHandlerMaxCapacity,
      loaded
    } = this.state;
    const { toggle, t } = this.props;
    if (loaded) {
      return (
        <React.Fragment>
          <div className="form">
            <Row className="col-12">
              <Col md={12}>
                <h3 className="subhead">
                  {t('Tell us about your truck')}
                </h3>
              </Col>
              <Col md={4} className="row-item">
                <span>{t('Truck Type')}</span>
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
                  placeholder={t('Truck Type')}
                />
              </Col>
              <Col md={4} className="row-item">
                <span>
                  {`${t('Maximum Capacity')} (${t('Tons')})`}
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
                  meta={reqHandlerMaxCapacity}
                />
              </Col>
              <Col md={4} className="row-item">
                <span>{t('Truck Number')}</span>
                <TField
                  input={{
                    onChange: this.handleInputChange,
                    name: 'externalEquipmentNumber',
                    value: externalEquipmentNumber
                  }}
                  meta={reqHandlerExternalEquipmentNumber}
                  value={externalEquipmentNumber}
                />
              </Col>
              <Col md={12} style={{marginTop: 6}}>
                <span>
                  {t('Materials Hauled')}
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
                  placeholder={t('Materials')}
                />
              </Col>
            </Row>
            <Row className="col-12 pt-4">
              <Col md={12}>
                <h3 className="subhead">
                  {t('Truck Rates')}
                </h3>
              </Col>
            </Row>
            <Row className="col-12 pt-2">
              <Col md={2} className="my-auto">
                <TCheckBox
                  onChange={this.handleInputChange}
                  name="ratesByHour"
                  value={isRatedHour}
                  label={t('By Hour')}
                />
              </Col>
              <Col md={5}>
                <span className="label">{`$ ${t('Cost')} / ${t('Hour')}`}</span>
                <TFieldNumber
                  style={{textAlign: 'right'}}
                  input={
                    {
                      onChange: this.handleInputChange,
                      name: 'ratesCostPerHour',
                      value: ratesCostPerHour
                    }
                  }
                  placeholder="0"
                  decimal
                  currency
                />
              </Col>
              <Col md={5}>
                <span className="label">{t('Minimum Hours')}</span>
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
            <Row className="col-12 pt-2">
              <Col md={2} className="my-auto">
                <TCheckBox
                  onChange={this.handleInputChange}
                  name="ratesByTon"
                  value={isRatedTon}
                  label={t('By Ton')}
                />
              </Col>
              <Col md={5}>
                <span className="label">{`$ ${t('Cost')} / ${t('Ton')}`}</span>
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
                  currency
                />
              </Col>
              <Col md={5}>
                <span className="label">{t('Minimum Tons')}</span>
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
            <Row className="col-12 pt-4">
              <Col md={12}>
                <span>
                  {`${t('Max Distance to Pickup')} (${t('Miles')}, ${t('Optional')})`}
                </span>
                <TFieldNumber
                  input={{
                    onChange: this.handleInputChange,
                    name: 'maxDistanceToPickup',
                    value: maxDistanceToPickup
                  }}
                  placeholder={t('How far will you travel per job')}
                />
              </Col>
            </Row>
            <Row className="col-12 pt-4">
              <Col md={6}>
                <Button className="tertiaryButton" type="button" onClick={toggle}>
                  {t('Cancel')}
                </Button>
              </Col>
              <Col md={6} className="text-right">
                <Button type="submit" className="primaryButton" onClick={() => this.saveTruck()}>
                  {t('Save')}
                </Button>
              </Col>
            </Row>
          </div>
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

EquipmentsShortForm.propTypes = {
  userId: PropTypes.number,
  companyId: PropTypes.number,
  toggle: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  t: PropTypes.func
};

EquipmentsShortForm.defaultProps = {
  userId: 0,
  companyId: 0,
  onSuccess: () => {},
  t: () => {}
};
export default withTranslation()(EquipmentsShortForm);
