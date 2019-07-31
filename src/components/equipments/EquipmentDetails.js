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
      loaded: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  async componentDidMount() {
    const { equipmentId } = this.props;
    const equipment = await EquipmentService.getEquipmentById(equipmentId);
    await this.setEquipment(equipment);
    await this.fetchMaterials();
    this.setState({
      equipmentToUpdate: equipment,
      loaded: true
    });
  }

  async setEquipment(equipmentProps) {
    this.mounted = true;
    const equipment = equipmentProps;
    Object.keys(equipment)
      .map((key) => {
        if (equipment[key] === null) {
          equipment[key] = '';
        }
        return true;
      });
    if (this.mounted) {
      this.setState({
        ...equipment
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
      image
    } = this.state;

    const {userId} = this.props;

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
    newEquipment.modifiedOn = moment.utc().format();
    newEquipment.modifiedBy = userId;

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

  selectChange(data) {
    const { reqHandlerTruckType } = this.state;
    this.setState({
      reqHandlerTruckType: Object.assign({}, reqHandlerTruckType, {
        touched: false
      }),
      type: data.value
    });
  }

  isFormValid() {
    const {
      type,
      maxCapacity,
      selectedMaterials
    } = this.state;
    let isValid = true;

    this.setState({
      reqHandlerTruckType: { touched: false },
      reqHandlerMaterials: { touched: false },
      reqHandlerMaxCapacity: { touched: false }
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
    if (!this.isFormValid()) {
      return;
    }
    const { selectedMaterials } = this.state;
    const { toggle } = this.props;
    const equipment = this.setUpdatedEquipment();
    try {
      await EquipmentService.updateEquipment(equipment);
      await EquipmentMaterialsService
        .createAllEquipmentMaterials(selectedMaterials, equipment.id);
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
      files,
      imageUploading,
      isRatedHour,
      isRatedTon,
      reqHandlerTruckType,
      reqHandlerMaterials,
      reqHandlerMaxCapacity,
      loaded
    } = this.state;
    const { toggle } = this.props;
    if (loaded) {
      return (
        <React.Fragment>
          <div className="form">
            <Row className="col-12">
              <Col md={12}>
                <h3 className="subhead">
                  Tell us about your truck
                </h3>
              </Col>
              <Col md={6} className="pt-2">
                <span>Truck Type</span>
                <SelectField
                  input={
                    {
                      onChange: this.selectChange,
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
                  meta={reqHandlerMaxCapacity}
                />
              </Col>
              <Col md={6} className="pt-2">
                <span>Truck name</span>
                <input
                  name="name"
                  type="text"
                  value={name}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Col md={6} className="pt-2">
                <span>Truck description</span>
                <input
                  name="description"
                  type="text"
                  value={description}
                  onChange={this.handleInputChange}
                />
              </Col>
            </Row>

            <Row className="col-12">
              <Col md={12} className="pt-2">
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
                  options={allMaterials}
                  placeholder="Materials"
                  meta={reqHandlerMaterials}
                />
              </Col>
            </Row>
            <Row className="col-md-12">
              <Col md={6} className="pt-2">
                <span>Vin #</span>
                <input
                  name="vin"
                  type="text"
                  value={vin}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Col md={6} className="pt-2">
                <span>License Plate</span>
                <input
                  name="licensePlate"
                  type="text"
                  value={licensePlate}
                  onChange={this.handleInputChange}
                />
              </Col>
            </Row>
            <Row className="col-12">
              <Col md={12} className="pt-4">
                <h3 className="subhead">
                  Truck Rates
                </h3>
              </Col>
            </Row>

            <Row className="col-12">
              <Col md={2} className="my-auto">
                <TCheckBox
                  onChange={this.handleInputChange}
                  name="ratesByHour"
                  value={isRatedHour}
                  label="By Hour"
                />
              </Col>
              <Col md={5} className="pt-2">
                <span className="label">Minimum cost per hour</span>
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
                <span className="label">Minimum Hours</span>
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
                  label="By Ton"
                />
              </Col>
              <Col md={5} className="pt-2">
                <span className="label">Minimum cost per ton</span>
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
                <span className="label">Minimum Tons</span>
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
                  Max Distance to Pickup (Miles)
                </span>
                <TFieldNumber
                  input={
                    {
                      onChange: this.handleInputChange,
                      name: 'maxDistance',
                      value: maxDistance
                    }
                  }
                  placeholder="How far will you travel per job"
                />
              </Col>
              <Col md={6} className="pt-2">
                <h4 className="subhead">
                  Upload a picture of your Truck (Optional)
                </h4>
                <TFileUploadSingle name="image" files={files} onChange={this.handleImageUpload} />
                {imageUploading && <span>Uploading Image...</span>}
              </Col>
            </Row>
            <Row className="col-12 pt-4">
              <ButtonToolbar className="col-md-6 wizard__toolbar">
                <Button className="tertiaryButton" type="button"
                  onClick={toggle} disabled={imageUploading}
                >
                  Cancel
                </Button>
              </ButtonToolbar>
              <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                <Button type="submit" className="primaryButton" disabled={imageUploading} onClick={() => this.save()}>
                  Save
                </Button>
              </ButtonToolbar>
            </Row>
          </div>
        </React.Fragment>
      );
    }
    return (
      <Col md={12}>
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
  toggle: PropTypes.func.isRequired
};

EquipmentDetails.defaultProps = {
  equipmentId: 0
};

export default EquipmentDetails;
