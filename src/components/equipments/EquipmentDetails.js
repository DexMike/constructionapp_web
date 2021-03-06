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
import * as PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Storage } from 'aws-amplify';
import Resizer from 'react-image-file-resizer';
import MultiSelect from '../common/TMultiSelect';
// import DropZoneMultipleField from '../common/TDropZoneMultiple';
import SelectField from '../common/TSelect';
// import TField from '../common/TField';
import TCheckBox from '../common/TCheckBox';
import TFieldNumber from '../common/TFieldNumber';
import LookupsService from '../../api/LookupsService';
// import DriverService from '../../api/DriverService';
// import './AddTruck.css';
import EquipmentMaterialsService from '../../api/EquipmentMaterialsService';
import TFileUploadSingle from '../common/TFileUploadSingle';
import StringGenerator from '../../utils/StringGenerator';
import FileGenerator from '../../utils/FileGenerator';
import TSpinner from '../common/TSpinner';
import EquipmentService from '../../api/EquipmentService';
import TField from '../common/TField';
import EquipmentDetailService from '../../api/EquipmentDetailService';

const maxWidth = 1200;
const maxHeight = 800;
const compressFormat = 'JPEG';
const quality = 98;

class EquipmentDetails extends PureComponent {
  constructor(props) {
    super(props);
    const equipment = {
      companyId: 0,
      name: '',
      type: 'Bottom Dump',
      styleId: 0,
      maxCapacity: 0,
      minCapacity: 0,
      minHours: 0,
      maxDistance: 0,
      description: '',
      licensePlate: '',
      vin: '',
      image: '',
      currentAvailability: 0,
      hourRate: 0,
      tonRate: 0,
      rateType: 'Hour',
      externalEquipmentNumber: '',
      currentExternalEquipmentNumber: '',
      defaultDriverId: 0,
      driverEquipmentsId: 0,
      driversId: 0,
      equipmentAddressId: 0,
      modelId: '',
      makeId: '',
      notes: '',
      createdBy: 0,
      createdOn: moment.utc().format(),
      modifiedBy: 0,
      modifiedOn: moment.utc().format(),
      isArchived: 0
    };
    this.state = {
      ...equipment,
      defaultDriver: {},
      companyDrivers: [],
      imageUploading: false,
      selectedMaterials: [],
      allMaterials: [],
      truckTypes: [],
      files: [],
      maxCapacity: '',
      // maxCapacityTouched: false,
      description: '',
      vin: '',
      licensePlate: '',
      isRatedHour: true,
      isRatedTon: false,
      reqHandlerTruckType: { touched: false, error: '' },
      reqHandlerMaterials: { touched: false, error: '' },
      reqHandlerMaxCapacity: { touched: false, error: '' },
      reqHandlerExternalEquipmentNumber: { touched: false, error: ''},
      loaded: false,
      isLoading: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectTypeChange = this.selectTypeChange.bind(this);
    this.selectDefaultDriverChange = this.selectDefaultDriverChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  async componentDidMount() {
    const { equipmentId, companyId, t } = { ...this.props };
    const translate = t;
    let { currentExternalEquipmentNumber, companyDrivers, defaultDriver } = { ...this.state };
    let equipment;
    try {
      equipment = await EquipmentService.getEquipmentById(equipmentId);
      currentExternalEquipmentNumber = equipment.externalEquipmentNumber;
    } catch (e) {
      // console.log(e);
    }

    try {
      await this.setEquipment(equipment);
      await this.fetchMaterials();
      companyDrivers = (await EquipmentDetailService.getEquipmentDefaultDriverList(companyId, equipmentId))
        .data.map(companyDriver => ({
          value: companyDriver.driverId,
          label: `${companyDriver.firstName} ${companyDriver.lastName}`
        }));
    } catch (err) {
      console.error(err);
    }
    companyDrivers = [{ value: null, label: translate('Unassigned') }, ...companyDrivers];
    defaultDriver = { value: null, label: translate('Unassigned') };
    if (equipment && equipment.defaultDriverId) {
      const companyDriverMatch = companyDrivers
        .find(companyDriver => companyDriver.value === equipment.defaultDriverId);
      defaultDriver = companyDriverMatch;
    }
    this.setState({
      companyDrivers,
      defaultDriver,
      currentExternalEquipmentNumber,
      equipmentToUpdate: equipment,
      loaded: true
    });
  }

  async setEquipment(equipmentProps) {
    this.mounted = true;
    let { isRatedHour, isRatedTon } = this.state;
    const equipment = equipmentProps;
    Object.keys(equipment)
      .map((key) => {
        if (equipment[key] === null) {
          equipment[key] = '';
        }
        if (equipment.rateType === 'Tonage') {
          isRatedHour = false;
          isRatedTon = true;
        }
        if (equipment.rateType === 'Hour') {
          isRatedHour = true;
          isRatedTon = false;
        }
        if (equipment.rateType === 'Any') {
          isRatedHour = true;
          isRatedTon = true;
        }
        return true;
      });
    if (this.mounted) {
      this.setState({
        ...equipment,
        isRatedHour,
        isRatedTon
      });
    }
  }

  setUpdatedEquipment() {
    const {
      equipmentToUpdate,
      type,
      truckTypes,
      maxCapacity,
      name,
      description,
      vin,
      licensePlate,
      maxDistance,
      minCapacity,
      minHours,
      hourRate,
      tonRate,
      image,
      isRatedHour,
      isRatedTon,
      externalEquipmentNumber,
      defaultDriver
    } = this.state;

    const { userId } = this.props;

    const newEquipment = equipmentToUpdate;
    newEquipment.type = type;
    newEquipment.truckTypes = truckTypes;
    newEquipment.maxCapacity = maxCapacity;
    newEquipment.name = name;
    newEquipment.description = description;
    newEquipment.vin = vin;
    newEquipment.licensePlat = licensePlate;
    newEquipment.maxDistance = maxDistance;
    newEquipment.minCapacity = minCapacity;
    newEquipment.minHours = minHours;
    newEquipment.hourRate = hourRate;
    newEquipment.tonRate = tonRate;
    newEquipment.image = image;
    newEquipment.externalEquipmentNumber = externalEquipmentNumber;
    if (defaultDriver) {
      newEquipment.defaultDriverId = defaultDriver.value;
    }
    newEquipment.modifiedOn = moment.utc().format();
    newEquipment.modifiedBy = userId;

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
    newEquipment.rateType = rateType;

    return newEquipment;
  }

  handleMultiChange(data) {
    const { reqHandlerMaterials } = this.state;
    this.setState({
      reqHandlerMaterials: Object.assign({}, reqHandlerMaterials, {
        touched: false
      }),
      selectedMaterials: data
    });
  }

  selectTypeChange(data) {
    const { reqHandlerTruckType } = this.state;
    this.setState({
      reqHandlerTruckType: Object.assign({}, reqHandlerTruckType, {
        touched: false
      }),
      type: data.value
    });
  }

  selectDefaultDriverChange(data) {
    // const { defaultDriver } = this.state;
    this.setState({
      defaultDriver: data
    });
  }

  async isFormValid() {
    const {
      type,
      companyId,
      maxCapacity,
      selectedMaterials,
      externalEquipmentNumber,
      currentExternalEquipmentNumber
    } = this.state;
    let isValid = true;

    this.setState({
      reqHandlerTruckType: { touched: false },
      reqHandlerMaterials: { touched: false },
      reqHandlerMaxCapacity: { touched: false },
      reqHandlerExternalEquipmentNumber: { touched: false }
    });

    if (type.length === 0) {
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

    if (maxCapacity === 0) {
      this.setState({
        reqHandlerMaxCapacity: {
          touched: true,
          error: 'Please enter the maximum number of tons you are willing to haul'
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

    if (externalEquipmentNumber !== currentExternalEquipmentNumber) {
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

  async save() {
    this.setState({ isLoading: true });
    const isFormValid = await this.isFormValid();
    if (!isFormValid) {
      this.setState({ isLoading: false });
      return;
    }    
    const { selectedMaterials } = this.state;
    const { toggle } = this.props;
    const equipment = this.setUpdatedEquipment();
    try {
      await EquipmentService.updateEquipment(equipment);
      await EquipmentMaterialsService
        .createAllEquipmentMaterials(selectedMaterials, equipment.id);
      this.setState({ isLoading: false });
      toggle();
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  async archiveTruck() {
    const { selectedMaterials } = this.state;
    const { toggle } = this.props;
    const equipment = this.setUpdatedEquipment();
    equipment.isArchived = '1';
    try {
      await EquipmentService.updateEquipment(equipment);
      toggle();
    } catch (e) {
      // console.log(e);
    }
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

    if (e.target.name === 'maxCapacity') {
      // this.RenderField('renderField', 'coman', 'number', 'Throw error');
    }

    if (e.target.name === 'ratesCostPerHour') {
      reqHandler = 'reqHandlerMinRate';
    } else if (e.target.name === 'minOperatingTime') {
      reqHandler = 'reqHandlerMinTime';
    } else if (e.target.name === 'maxCapacity') {
      reqHandler = 'reqHandlerMaxCapacity';
    } else if (e.target.name === 'externalEquipmentNumber') {
      reqHandler = 'reqHandlerExternalEquipmentNumber';
    }
    // Then we set the touched prop to false, hiding the error label
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      [e.target.name]: value
    });
  }

  async fetchMaterials() {
    const { equipmentId } = this.props;
    const equipmentMaterials = await EquipmentMaterialsService
      .getEquipmentMaterialsByEquipmentId(equipmentId);
    let materials = await LookupsService.getLookupsByType('MaterialType');
    const truckTypes = await LookupsService.getLookupsByType('EquipmentType');

    materials = materials.map(material => ({
      value: String(material.id),
      label: material.val1
    }));

    const selectedMaterials = [];
    Object.values(equipmentMaterials)
      .forEach((itm) => {
        const inside = {
          label: itm.value,
          value: itm.id
        };
        selectedMaterials.push(inside);
      });

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
      truckTypes: allTruckTypes,
      selectedMaterials
    });
  }

  async sendImage(file, name) {
    const year = moment.utc().format('YYYY');
    const month = moment.utc().format('MM');
    const fileName = StringGenerator.makeId(6);
    const fileNamePieces = name.split(/[\s.]+/);
    const fileExtension = fileNamePieces[fileNamePieces.length - 1];
    // try {
    this.setState({ imageUploading: true });
    const result = await Storage.put(`${year}/${month}/${fileName}.${fileExtension}`, file);
    const image = `${process.env.AWS_UPLOADS_ENDPOINT}/public/${result.key}`;
    this.setState({
      image,
      imageUploading: false
    });
  }

  handleImageUpload(filesToUpload) {
    this.setState({ files: filesToUpload });
    const {files} = this.state;
    if (files.length > 0) {
      const file = files[0];
      /**/
      const that = this;
      Resizer.imageFileResizer(
        file, // is the file of the new image that can now be uploaded...
        maxWidth, // is the maxWidth of the  new image
        maxHeight, // is the maxHeight of the  new image
        compressFormat,
        quality,
        0,
        (uri) => {
          that.sendImage(
            FileGenerator.getBlob(uri),
            file.name
          );
        },
        'base64'
      );
    }
  }

  render() {
    const {
      type,
      truckTypes,
      maxCapacity,
      name,
      description,
      selectedMaterials,
      allMaterials,
      vin,
      licensePlate,
      maxDistance,
      minCapacity,
      minHours,
      hourRate,
      tonRate,
      externalEquipmentNumber,
      files,
      imageUploading,
      isRatedHour,
      isRatedTon,
      reqHandlerTruckType,
      reqHandlerMaterials,
      reqHandlerMaxCapacity,
      reqHandlerExternalEquipmentNumber,
      loaded,
      defaultDriver,
      companyDrivers,
      isLoading
    } = this.state;
    const { toggle, t } = this.props;
    const translate = t;
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
              <Col md={6} className="pt-2">
                <span>{t('Truck Number')}</span>
                <TField
                  input={
                    {
                      onChange: this.handleInputChange,
                      name: 'externalEquipmentNumber',
                      value: externalEquipmentNumber
                    }
                  }
                  value={externalEquipmentNumber}
                  placeholder="0"
                  meta={reqHandlerExternalEquipmentNumber}
                />
              </Col>
              <Col md={6} className="pt-2">
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
              <Col md={6} className="pt-2">
                <span>{t('Truck Type')}</span>
                <SelectField
                  input={
                    {
                      onChange: this.selectTypeChange,
                      name: 'type',
                      value: type
                    }
                  }
                  value={type}
                  options={truckTypes}
                  placeholder="Truck Type"
                  meta={reqHandlerTruckType}
                />
              </Col>
              <Col md={6} className="pt-2">
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
                  selectedItems={selectedMaterials}
                  options={allMaterials}
                  placeholder="Materials"
                  meta={reqHandlerMaterials}
                />
              </Col>
              <Col md={6} className="pt-2">
                <span>
                  {t('Truck Name')}
                </span>
                <input
                  name="name"
                  type="text"
                  value={name}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Col md={6} className="pt-2">
                <span>{t('Truck Description')}</span>
                <input
                  name="description"
                  type="text"
                  value={description}
                  onChange={this.handleInputChange}
                />
              </Col>
            </Row>
            <Row className="col-md-12">
              <Col md={6} className="pt-2">
                <span>{t('VIN #')}</span>
                <input
                  name="vin"
                  type="text"
                  value={vin}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Col md={6} className="pt-2">
                <span>
                  {t('License Plate')}
                </span>
                <input
                  name="licensePlate"
                  type="text"
                  value={licensePlate}
                  onChange={this.handleInputChange}
                />
              </Col>
            </Row>
            <Row className="col-md-12">
              <Col md={6} className="pt-2">
                <span>{translate('Default Driver')}</span>
                <SelectField
                  input={
                    {
                      onChange: this.selectDefaultDriverChange,
                      name: 'defaultDriver',
                      value: defaultDriver
                    }
                  }
                  value={defaultDriver}
                  options={companyDrivers}
                  placeholder={translate('Default Driver')}
                  // meta={reqHandlerTruckType}
                />
              </Col>
              <Col md={6} className="pt-2" />
            </Row>
            <Row className="col-12">
              <Col md={12} className="pt-4">
                <h3 className="subhead">
                  {t('Truck Description')}
                </h3>
              </Col>
            </Row>

            <Row className="col-12">
              <Col md={2} className="my-auto">
                <TCheckBox
                  onChange={this.handleInputChange}
                  name="ratesByHour"
                  value={isRatedHour}
                  label={t('By Hour')}
                />
              </Col>
              <Col md={5} className="pt-2">
                <span className="label">{`$ ${t('Cost')} / ${t('Hour')}`}</span>
                <TFieldNumber
                  input={
                    {
                      onChange: this.handleInputChange,
                      name: 'hourRate',
                      value: hourRate
                    }
                  }
                  placeholder="0"
                  decimal
                  currency
                />
              </Col>
              <Col md={5} className="pt-2">
                <span className="label">{t('Minimum Hours')}</span>
                <TFieldNumber
                  input={
                    {
                      onChange: this.handleInputChange,
                      name: 'minHours',
                      value: minHours
                    }
                  }
                  placeholder="0"
                />
              </Col>
            </Row>
            <Row className="col-12">
              <Col md={2} className="my-auto">
                <TCheckBox
                  onChange={this.handleInputChange}
                  name="ratesByTon"
                  value={isRatedTon}
                  label={t('By Ton')}
                />
              </Col>
              <Col md={5} className="pt-2">
                <span className="label">{`$ ${t('Cost')} / ${t('Ton')}`}</span>
                <TFieldNumber
                  input={
                    {
                      onChange: this.handleInputChange,
                      name: 'tonRate',
                      value: tonRate
                    }
                  }
                  placeholder="0"
                  decimal
                  currency
                />
              </Col>
              <Col md={5} className="pt-2">
                <span className="label">{t('Minimum Tons')}</span>
                <TFieldNumber
                  input={
                    {
                      onChange: this.handleInputChange,
                      name: 'minCapacity',
                      value: minCapacity
                    }
                  }
                  placeholder="0"
                />
              </Col>
            </Row>
            <Row className="col-12 pt-4">
              <Col md={6} className="pt-2">
                <span>
                  {`${t('Max Distance to Pickup')} (${t('Miles')}, ${t('Optional')})`}
                </span>
                <TFieldNumber
                  input={
                    {
                      onChange: this.handleInputChange,
                      name: 'maxDistance',
                      value: maxDistance
                    }
                  }
                  placeholder={t('How far will you travel per job')}
                />
              </Col>
              <Col md={6} className="pt-2">
                <h4 className="subhead">
                  {`${t('Upload a picture of your Truck')} (${t('Optional')})`}
                </h4>
                <TFileUploadSingle name="image" files={files} onChange={this.handleImageUpload} />
                {imageUploading && <span>{t('Uploading Image')}...</span>}
              </Col>
            </Row>
            <Row className="col-12 pt-4">
              <ButtonToolbar className="col-md-6 wizard__toolbar">
                <Button className="tertiaryButton" type="button"
                  onClick={toggle} disabled={imageUploading}
                >
                  {t('Cancel')}
                </Button>
              </ButtonToolbar>
              <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                {/*<Button type="submit" className="primaryButton" disabled={imageUploading} onClick={() => this.archiveTruck()}>*/}
                {/*  Delete*/}
                {/*</Button>*/}
                <Button
                  type="submit"
                  className="primaryButton"
                  disabled={imageUploading || isLoading}
                  onClick={() => this.save()}
                >
                  {
                    isLoading ? (
                      <TSpinner
                        color="#808080"
                        loaderSize={10}
                        loading
                      />
                    ) : t('Save')
                  }
                </Button>
              </ButtonToolbar>
            </Row>
          </div>
        </React.Fragment>
      );
    }
    return (
      <Col md={12} className="text-center">
        <Card style={{ paddingBottom: 0 }}>
          <CardBody>
            <Row className="col-md-12"><TSpinner loading /></Row>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

EquipmentDetails.propTypes = {
  equipmentId: PropTypes.number,
  toggle: PropTypes.func.isRequired,
  companyId: PropTypes.number.isRequired
};

EquipmentDetails.defaultProps = {
  equipmentId: 0,
  t: () => {}
};

export default withTranslation()(EquipmentDetails);
