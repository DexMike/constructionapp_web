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
import TField from '../common/TField';
import LookupsService from '../../api/LookupsService';
import TDateTimePicker from '../common/TDateTimePicker';
import EquipmentMaterialsService from '../../api/EquipmentMaterialsService';

// import validate from '../common/validate ';

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
      hourlyRate: 0,
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
      instructions: ''
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMultiChange = this.handleMultiChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    // await this.fetchMaterials();

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
    const {
      /*
      ratesByBoth,
      ratesByTon,
      ratesByHour
      */
    } = this.state;
    let isValid = true;

    this.setState({
      /*
      reqHandlerTruckType: { touched: false },
      reqHandlerMaterials: { touched: false },
      */
    });

    /*
    if (truck.truckType.length === 0) {
      this.setState({
        reqHandlerTruckType: {
          touched: true,
          error: 'Please select the type of truck you are adding'
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
    console.log('Se');
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

    this.setState({ [e.target.name]: value });
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
    this.setState({ jobDate: data });
  }

  render() {
    const {
      truckType,
      allTruckTypes,
      capacity,
      allMaterials,
      selectedMaterials,
      ratebyBoth,
      rateByTon,
      rateByHour,
      tonnage,
      hourlyRate,
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
      instructions
    } = this.state;
    const today = new Date();
    let currentDate = today.getTime();
    const { onClose } = this.props;
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
                <div className="col-md-4 form__form-group">
                  <span className="form__form-group-label">Truck Type</span>
                  <SelectField
                    input={
                      {
                        onChange: this.selectChange,
                        name: 'Truck Type',
                        value: truckType
                      }
                    }
                    // meta={reqHandlerTruckType}
                    value={truckType}
                    options={allTruckTypes}
                    placeholder="Truck Type"
                  />
                </div>
                <div className="col-md-4 form__form-group">
                  <span className="form__form-group-label">Capacity</span>
                  <input
                    name="capacity"
                    type="number"
                    value={capacity}
                    onChange={this.handleInputChange}
                    placeholder="Capacity"
                  />
                </div>
                <div className="col-md-4 form__form-group">
                  <span className="form__form-group-label">Materials</span>
                  <MultiSelect
                    input={
                      {
                        onChange: this.handleMultiChange,
                        name: 'materials',
                        value: selectedMaterials
                      }
                    }
                    // meta={reqHandlerMaterials}
                    options={allMaterials}
                    placeholder="Materials"
                  />
                </div>
              </Row>

              <Row className="col-md-12">
                <hr />
                {/* <hr className="bighr"/> */}
              </Row>

              <Row className="col-md-12">
                SET RATE BY
              </Row>

              <Row className="col-md-12">
                <hr />
                {/* <hr className="bighr"/> */}
              </Row>

              <Row className="col-md-12">
                <div className="col-md-4 form__form-group">
                    Select Date of Job
                </div>
                <div className="col-md-8 form__form-group">
                  <TDateTimePicker
                    input={
                      {
                        onChange: this.jobDateChange,
                        name: 'startDate',
                        value: { jobDate },
                        givenDate: currentDate
                      }
                    }
                    onChange={this.jobDateChange}
                    // meta={reqHandlerStartDate}
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

CreateJobFormOne.propTypes = {
  // getJobFullInfo: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

CreateJobFormOne.defaultProps = {
  //
};

export default CreateJobFormOne;
