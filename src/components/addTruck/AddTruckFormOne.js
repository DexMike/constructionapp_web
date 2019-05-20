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
import MultiSelect from '../common/TMultiSelect';
// import DropZoneMultipleField from '../common/TDropZoneMultiple';
import SelectField from '../common/TSelect';
// import TField from '../common/TField';
import TCheckBox from '../common/TCheckBox';
import TField from '../common/TField';
import LookupsService from '../../api/LookupsService';
// import DriverService from '../../api/DriverService';
import './AddTruck.css';
import EquipmentMaterialsService from '../../api/EquipmentMaterialsService';
import TFileUploadSingle from '../common/TFileUploadSingle';
import StringGenerator from '../../utils/StringGenerator';

// import validate from '../common/validate ';

class AddTruckFormOne extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageUploading: false,
      // ...equipment,
      id: 0, // for use if we are editing
      driversId: 0, // for use if we are editing
      defaultDriverId: 0, // for use if we are editing
      selectedMaterials: [],
      allMaterials: [],
      truckTypes: [],
      files: [],
      image: '',
      maxCapacity: '',
      // maxCapacityTouched: false,
      description: '',
      vin: '',
      licensePlate: '',
      ratesByBoth: false, // this only tracks the select
      ratesByHour: false,
      ratesByTon: false,
      ratesCostPerTon: '',
      ratesCostPerHour: '',
      minOperatingTime: '',
      maxDistanceToPickup: '',
      truckType: '',
      reqHandlerTruckType: { touched: false, error: '' },
      reqHandlerMaterials: { touched: false, error: '' },
      reqHandlerMinRate: { touched: false, error: '' },
      reqHandlerMinTime: { touched: false, error: '' },
      reqHandlerCostTon: { touched: false, error: '' },
      reqHandlerChecks: { touched: false, error: '' },
      reqHandlerMaxCapacity: { touched: false, error: '' }
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
  }

  async componentDidMount() {
    await this.fetchMaterials();
  }

  componentWillReceiveProps(nextProps) {
    const {validateResOne} = this.props;
    if (nextProps.validateOnTabOneClick) {
      if (this.isFormValid()) {
        validateResOne(true);
        this.saveTruckInfo(true);
      } else {
        validateResOne(false);
      }
    }
  }

  handleMultiChange(data) {
    const { reqHandlerMaterials } = this.state;
    this.setState({
      reqHandlerMaterials: Object.assign({}, reqHandlerMaterials, {
        touched: false
      },
      function wait() {
        this.saveTruckInfo(false);
      })
    });
    this.setState({ selectedMaterials: data },
      function wait() {
        this.saveTruckInfo(false);
      });
  }

  selectChange(data) {
    const { reqHandlerTruckType } = this.state;
    this.setState({
      reqHandlerTruckType: Object.assign({}, reqHandlerTruckType, {
        touched: false
      })
    });
    this.setState({ truckType: data.value },
      function wait() {
        this.saveTruckInfo(false);
      });
  }

  isFormValid() {
    const truck = this.state;
    const {
      ratesByBoth,
      // ratesByTon,
      ratesByHour
    } = this.state;
    let isValid = true;

    this.setState({
      reqHandlerTruckType: { touched: false },
      reqHandlerMaterials: { touched: false },
      reqHandlerMinRate: { touched: false },
      reqHandlerMinTime: { touched: false },
      // reqHandlerCostTon: { touched: false },
      reqHandlerChecks: { touched: false },
      reqHandlerMaxCapacity: { touched: false }
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

    if (!truck.maxCapacity) {
      this.setState({
        reqHandlerMaxCapacity: {
          touched: true,
          error: 'Please enter the maximum number of tons you are willing to haul'
        }
      });
      isValid = false;
    }

    /*
    if ((!ratesByHour && !ratesByBoth /* && !ratesByTon )) { // Checkboxes
      this.setState({
        reqHandlerChecks: {
          touched: true,
          error: 'Please select if you want to charge by hour, by ton, or by either'
        }
      });
      isValid = false;
    }
    */

    if (!truck.ratesCostPerHour
      && (ratesByHour === 'on' /* || ratesByBoth === 1 */)) { // 'By Hour' check
      this.setState({
        reqHandlerMinRate: {
          touched: true,
          error: 'Please enter the hourly rate for this truck'
        }
      });
      isValid = false;
    }

    if (!truck.minOperatingTime
      && (ratesByHour === 'on' || ratesByBoth === 1)) { // 'By Hour' check
      this.setState({
        reqHandlerMinTime: {
          touched: true,
          error: 'Please enter minimum number of hours that this truck must be rented for'
        }
      });
      isValid = false;
    }

    /*
    if (!truck.ratesCostPerTon
      && (ratesByTon === 'on' || ratesByBoth === 1)) { // 'By Ton' check
      this.setState({
        reqHandlerCostTon: {
          touched: true,
          error: 'Please enter the minimum number of tons you are willing to haul'
        }
      });
      isValid = false;
    }
    */

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

  saveTruckInfo(redir) {
    const {
      id,
      selectedMaterials,
      defaultDriverId,
      driversId,
      truckType,
      maxCapacity,
      image,
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
    let {saveValues} = this.state;
    const { onTruckFullInfo } = this.props;

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
    let start = new Date();
    let end = new Date();
    // let available = false;

    // dates if preloaded
    const {
      getTruckFullInfo,
      // getAvailiabilityFullInfo,
      equipmentId
    } = this.props;
    const preloaded = getTruckFullInfo();
    // const preloadedAvailability = getAvailiabilityFullInfo();

    // load info from cached (if coming back from next tabs)
    // if (typeof preloaded.info !== 'undefined') {
    //   if (Object.keys(preloaded.info).length > 0) {
    //     start = preloaded.info.startAvailability;
    //     end = preloaded.info.endAvailability;
    //     available = preloadedAvailability.info.isAvailable;
    //   }
    // }
    // // however, if there is already saved dates, we'll use that one
    // if (typeof preloadedAvailability.info !== 'undefined') {
    //   if (Object.keys(preloadedAvailability.info).length > 0) {
    //     start = preloadedAvailability.info.startDate;
    //     end = preloadedAvailability.info.endDate;
    //     available = preloadedAvailability.info.isAvailable;
    //   }
    // }

    // TODO-> Ask which params are required
    saveValues = {
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
      image,
      // currentAvailability: available, // unasigned
      // startAvailability: start, // careful here, it's date unless it exists
      // endAvailability: end,
      ratesByBoth, // keeping here in order to track it
      ratesByHour, // keeping here in order to track it
      ratesByTon, // keeping here in order to track it
      hourRate: ratesCostPerHour,
      tonRate: ratesCostPerTon,
      rateType: chargeBy, // PENDING
      equipmentId,
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
    this.setState({ saveValues },
      function wait() {
        onTruckFullInfo(saveValues);
        this.handleSubmit('Truck');
      });
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
    let { value } = e.target;
    let reqHandler = '';
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

    // We take the input name prop to set the respective requiredHandler
    if (e.target.name === 'ratesCostPerHour') {
      reqHandler = 'reqHandlerMinRate';
    } else if (e.target.name === 'minOperatingTime') {
      reqHandler = 'reqHandlerMinTime';
    } else if (e.target.name === 'ratesCostPerTon') {
      reqHandler = 'reqHandlerCostTon';
    } else if (e.target.name === 'maxCapacity') {
      reqHandler = 'reqHandlerMaxCapacity';
    } else if (
      e.target.name === 'ratesByTon'
      || e.target.name === 'ratesByHour'
      || e.target.name === 'ratesByBoth'
    ) {
      reqHandler = 'reqHandlerChecks';
    }
    // Then we set the touched prop to false, hiding the error label
    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      })
    });

    this.setState({ [e.target.name]: value },
      function wait() {
        this.saveTruckInfo(false);
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

    // check if there is preloaded info
    const { getTruckFullInfo, passedTruckFullInfo, equipmentId } = this.props;
    const preloaded = getTruckFullInfo();

    // if this is loaded from the list instead
    if (Object.keys(passedTruckFullInfo).length > 0) {
      // we have to load the materials for this particular truck
      let truckMaterials = await
      EquipmentMaterialsService.getEquipmentMaterialsByEquipmentId(equipmentId);

      truckMaterials = truckMaterials.map(material => ({
        // careful here, the ID is that of the equipmentMaterial, not from the Material
        // we should probably be saving the materialId instead of the name.
        value: String(material.id),
        label: material.value
      }));

      let { files } = this.state;
      if (passedTruckFullInfo.image
        && passedTruckFullInfo.image.trim().length > 0) {
        const urlPieces = passedTruckFullInfo.image.split('/');
        const name = (urlPieces.length > 0) ? urlPieces[urlPieces.length - 1] : 'undefined';
        files = [
          {
            name,
            preview: passedTruckFullInfo.image
          }
        ];
      }
      this.setState({
        id: passedTruckFullInfo.id,
        driversId: passedTruckFullInfo.driversId,
        defaultDriverId: passedTruckFullInfo.defaultDriverId,
        maxCapacity: passedTruckFullInfo.maxCapacity,
        image: passedTruckFullInfo.image,
        files,
        description: passedTruckFullInfo.description,
        vin: passedTruckFullInfo.vin,
        licensePlate: passedTruckFullInfo.licensePlate,
        minOperatingTime: passedTruckFullInfo.minHours,
        maxDistanceToPickup: passedTruckFullInfo.maxDistance,
        ratesCostPerTon: Number(passedTruckFullInfo.tonRate),
        ratesCostPerHour: passedTruckFullInfo.hourRate,
        truckType: passedTruckFullInfo.type,
        selectedMaterials: truckMaterials
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

    // load info from cached (if coming back from next tabs)
    if (Object.keys(preloaded).length > 0 && preloaded.info) {
      let { files } = this.state;
      if (preloaded.info.image
        && preloaded.info.image.trim().length > 0) {
        const urlPieces = preloaded.info.image.split('/');
        const name = (urlPieces.length > 0) ? urlPieces[urlPieces.length - 1] : 'undefined';
        files = [
          {
            name,
            preview: preloaded.info.image
          }
        ];
      }
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
        // ratesCostPerTon: preloaded.info.tonRate,
        ratesCostPerHour: preloaded.info.hourRate,
        truckType: preloaded.info.type,
        selectedMaterials: preloaded.info.selectedMaterials,
        image: preloaded.info.image,
        files
      });
      // Materials Hauled is missing
    }

    this.saveTruckInfo(false);
    // let's cache this info, in case we want to go back
  }

  async handleImageUpload(filesToUpload) {
    this.setState({ files: filesToUpload });
    const files = filesToUpload;
    if (files.length > 0) {
      const file = files[0];
      const year = moment().format('YYYY');
      const month = moment().format('MM');
      const fileName = StringGenerator.makeId(6);
      const fileNamePieces = file.name.split(/[\s.]+/);
      const fileExtension = fileNamePieces[fileNamePieces.length - 1];
      // try {
      this.setState({ imageUploading: true });
      const result = await Storage.put(`${year}/${month}/${fileName}.${fileExtension}`, file);
      this.setState({ image: `${process.env.AWS_UPLOADS_ENDPOINT}/public/${result.key}` });
      this.setState({ imageUploading: false });
    }
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
      files,
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
      truckTypes,
      reqHandlerTruckType,
      reqHandlerMaterials,
      reqHandlerMinRate,
      reqHandlerMinTime,
      reqHandlerCostTon,
      imageUploading,
      reqHandlerChecks,
      reqHandlerMaxCapacity
    } = this.state;
    const { p, onClose } = this.props;
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            {/*
            <div className="card__title">
              <h5 className="bold-text">
                Welcome to Trelar, Lets add a truck so customers can find you
              </h5>
            </div>
            */}

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
                <div className="col-md-6">
                  <span className="form__form-group-label">Truck description</span>
                  <input
                    name="description"
                    type="text"
                    value={description}
                    onChange={this.handleInputChange}
                  />
                  <input type="hidden" val={p}/>
                  <input type="hidden" val={id}/>
                  <input type="hidden" val={defaultDriverId}/>
                  <input type="hidden" val={driversId}/>
                </div>
                <div className="col-md-6">
                  <span className="form__form-group-label">Truck Type</span>
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
                </div>
              </Row>

              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <span className="form__form-group-label mt-8">
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
                </div>
              </Row>

              <Row className="col-md-12">
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
                <hr />
              </Row>

              <Row className="col-md-12">
                <div className="col-md-12 form__form-group">
                  <h3 className="subhead">
                    Truck Rates
                  </h3>
                </div>

                {/* FIRST ROW */}

                <div className="col-md-12 form__form-group">
                  <TCheckBox
                    onChange={this.handleInputChange}
                    name="ratesByBoth"
                    value={!!ratesByBoth}
                    label="By Both"
                    meta={reqHandlerChecks}
                  />
                </div>

                <div className="col-md-4 form__form-group">
                  <TCheckBox
                    type="hidden"
                    onChange={this.handleInputChange}
                    name="ratesByHour"
                    // value={!!ratesByHour}
                    value="on"
                    label="By Hour"
                  />
                </div>
                <div className="col-md-4 form__form-group">
                  <span className="label">$ Cost / Hour</span>
                  <TField
                    input={
                      {
                        onChange: this.handleInputChange,
                        name: 'ratesCostPerHour',
                        value: ratesCostPerHour
                      }
                    }
                    placeholder="0"
                    type="number"
                    meta={reqHandlerMinRate}
                  />
                </div>
                <div className="col-md-4 form__form-group">
                  <span className="label">Minimum hours</span>
                  <TField
                    input={
                      {
                        onChange: this.handleInputChange,
                        name: 'minOperatingTime',
                        value: minOperatingTime
                      }
                    }
                    placeholder="0"
                    type="number"
                    meta={reqHandlerMinTime}
                  />
                </div>
              </Row>


              <Row className="col-md-12">
                <div className="col-md-3 form__form-group">
                  <TCheckBox onChange={this.handleInputChange} name="ratesByTon"
                             value={!!ratesByTon} label="By Ton"
                  />
                </div>
                {/*
                <div className="col-md-3 form__form-group">
                  <span className="label">Cost per Ton $</span>
                  <TField
                    input={
                      {
                        onChange: this.handleInputChange,
                        name: 'ratesCostPerTon',
                        value: ratesCostPerTon
                      }
                    }
                    placeholder="0"
                    type="number"
                    meta={reqHandlerCostTon}
                  />
                </div>
                */}
              </Row>

              <Row className="col-md-12">
                <hr/>
              </Row>

              <Row className="col-md-12">
                <div className="col-md-6">
                  <span className="form__form-group-label">
                    Maximum Capacity (Tons)
                  </span>
                  <TField
                    input={
                      {
                        onChange: this.handleInputChange,
                        name: 'maxCapacity',
                        value: maxCapacity
                      }
                    }
                    placeholder="0"
                    type="number"
                    meta={reqHandlerMaxCapacity}
                  />
                  <span className="form__form-group-label mt-8">
                    Max Distance to Pickup (Miles)
                  </span>
                  <input
                    name="maxDistanceToPickup"
                    type="number"
                    value={maxDistanceToPickup}
                    onChange={this.handleInputChange}
                    placeholder="How far will you travel per job"
                  />
                </div>
                <div className="col-md-6 form__form-group">
                  <h4 className="subhead">
                    Upload a picture of your Truck (Optional)
                  </h4>
                  <TFileUploadSingle name="image" files={files} onChange={this.handleImageUpload}/>
                  {imageUploading && <span>Uploading Image...</span>}
                </div>
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
                <hr />
              </Row>

              <Row className="col-md-12">
                <ButtonToolbar className="col-md-6 wizard__toolbar">
                  <Button className="tertiaryButton" type="button"
                          onClick={onClose} disabled={imageUploading}
                  >
                    Cancel
                  </Button>
                </ButtonToolbar>
                <ButtonToolbar className="col-md-6 wizard__toolbar right-buttons">
                  <Button type="button" disabled className="secondaryButton">Back</Button>
                  <Button type="submit" className="primaryButton" disabled={imageUploading}>
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

AddTruckFormOne.propTypes = {
  p: PropTypes.number,
  equipmentId: PropTypes.number,
  // companyId: PropTypes.number,
  getTruckFullInfo: PropTypes.func.isRequired,
  // getAvailiabilityFullInfo: PropTypes.func.isRequired,
  onTruckFullInfo: PropTypes.func.isRequired,
  passedTruckFullInfo: PropTypes.shape({
    info: PropTypes.object
  }),
  onClose: PropTypes.func.isRequired,
  validateResOne: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  validateOnTabOneClick: PropTypes.any // eslint-disable-line react/forbid-prop-types
};

AddTruckFormOne.defaultProps = {
  p: null,
  equipmentId: null,
  // companyId: null,
  passedTruckFullInfo: null,
  validateResOne: null,
  validateOnTabOneClick: null
};

export default AddTruckFormOne;
