import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  Row
} from 'reactstrap';
// import classnames from 'classnames';
import moment from 'moment';
import { Select } from '@material-ui/core';
import TTable from '../common/TTable';
// import JobsService from '../../api/JobsService';
// import AgentService from '../../api/AgentService';
import EquipmentService from '../../api/EquipmentService';
import LookupsService from '../../api/LookupsService';
import JobCreateForm from '../jobs/JobCreateForm';

import truckImage from '../../img/default_truck.png';

class DashboardCustomerPage extends Component {
  constructor(props) {
    super(props);

    // copied from Nimda EquipmentForm
    // const equipment = {
    //   name: '',
    //   type: 0,
    //   styleId: 0,
    //   maxCapacity: 0,
    //   minCapacity: 0,
    //   minHours: 0,
    //   maxDistance: 0,
    //   description: '',
    //   licensePlate: '',
    //   vin: '',
    //   image: '',
    //   currentAvailability: 0,
    //   hourRate: 0,
    //   tonRate: 0,
    //   rateType: 'Hour',
    //   companyId: 0,
    //   defaultDriverId: 0,
    //   driverEquipmentsId: 0,
    //   driversId: 0,
    //   equipmentAddressId: 0,
    //   modelId: '',
    //   makeId: '',
    //   notes: '',
    //   createdBy: 0,
    //   createdOn: moment().unix() * 1000,
    //   modifiedBy: 0,
    //   modifiedOn: moment().unix() * 1000,
    //   isArchived: 0
    // };

    // const filter = {
    //   startDate: null,
    //   endDate: null,
    //   truckType: null,
    //   minCapactiy: null,
    //   materials: null,
    //   zipCode: null,
    //   rateType: null
    // };

    this.state = {
      // companyName: '',
      // drivers: [],
      equipmentTypes: [],
      materialTypes: [],
      rateTypes: [],
      // users: [],
      equipments: [],
      goToDashboard: false,
      selectedEquipment: {},
      modal: false
      // ...equipment
      // goToAddJob: false,
      // goToUpdateJob: false,
      // goToCreateJob: false,
      // jobId: 0
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleEquipmentEdit = this.handleEquipmentEdit.bind(this);
    this.toggleAddJobModal = this.toggleAddJobModal.bind(this);
  }

  async componentDidMount() {
    // await this.fetchJobs();
    await this.fetchEquipments();
  }

  // componentWillReceiveProps(nextProps) {
  componentWillReceiveProps() {
    // if (nextProps.equipment) {
    //   const { equipment } = nextProps;
    //   Object.keys(equipment)
    //     .map((key) => {
    //       if (equipment[key] === null) {
    //         equipment[key] = '';
    //       }
    //       return true;
    //     });
    //   this.setState({ ...equipment });
    this.fetchForeignValues();
    this.fetchParentValues();
    // }
  }

  getState() {
    const status = this.state;
    return status;
  }

  async fetchForeignValues() {
    // const { equipment } = this.props;
    // if (equipment.companyId) {
    //   const company = await AgentService.getCompanyById(equipment.companyId);
    //   this.setState({ companyName: company.legalName });
    // }
    //
    const lookups = await LookupsService.getLookups();

    const equipmentTypes = [];
    Object.values(lookups).forEach((itm) => {
      if (itm.key === 'EquipmentType') equipmentTypes.push(itm);
    });
    this.setState({ equipmentTypes });

    const materialTypes = [];
    Object.values(lookups).forEach((itm) => {
      if (itm.key === 'MaterialType') materialTypes.push(itm);
    });
    this.setState({ materialTypes });

    const rateTypes = [];
    Object.values(lookups).forEach((itm) => {
      if (itm.key === 'RateType') rateTypes.push(itm);
    });
    this.setState({ rateTypes });
  }

  async fetchParentValues() {
    // const users = await AgentService.getUsers();
    // const { companyId } = this.state;
    // const drivers = [];
    // Object.values(users).forEach((itm) => {
    //   if (itm.companyId === companyId) {
    //     drivers.push(itm);
    //   }
    // });
    // this.setState({ drivers });
  }

  // async fetchJobs() {
  //   let jobs = await JobsService.getJobs();
  //   jobs = jobs.map((job) => {
  //     const newJob = job;
  //     newJob.modifiedOn = moment(job.modifiedOn)
  //       .format();
  //     newJob.createdOn = moment(job.createdOn)
  //       .format();
  //     return newJob;
  //   });
  //   this.setState({ jobs });
  // }

  async fetchEquipments() {
    let equipments = await EquipmentService.getEquipments();
    equipments = equipments.map((equipment) => {
      const newEquipment = equipment;
      newEquipment.modifiedOn = moment(equipment.modifiedOn)
        .format();
      newEquipment.createdOn = moment(equipment.createdOn)
        .format();
      return newEquipment;
    });
    this.setState({ equipments });
  }

  // async filterEquipment() {
  //
  // }

  // handleJobEdit(id) {
  //   this.setState({
  //     goToUpdateJob: true,
  //     jobId: id
  //   });
  // }

  handleInputChange(e) {
    let { value } = e.target;
    if (e.target.name === 'isArchived') {
      value = e.target.checked ? Number(1) : Number(0);
    }
    this.setState({ [e.target.name]: value });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleEquipmentEdit(id) {
    const { equipments } = this.state;
    const [selectedEquipment] = equipments.filter((equipment) => {
      if (id === equipment.id) {
        return equipment;
      }
      return false;
    }, id);
    selectedEquipment.materials = ['Any'];
    this.setState({
      selectedEquipment,
      modal: true
    });
  }

  toggleAddJobModal() {
    const { modal } = this.state;
    this.setState({
      modal: !modal
    });
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    // if (status.goToAddJob) {
    //   return <Redirect push to="/jobs/save"/>;
    // }
    // if (status.goToUpdateJob) {
    //   return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    // }
    return false;
  }

  renderModal() {
    const {
      // equipments,
      // startAvailability,
      // endAvailability,
      // truckType,
      // minCapacity,
      // materials,
      // zipCode,
      // rateType,
      modal,
      selectedEquipment
    } = this.state;
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleAddJobModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__header">
          <button type="button" className="lnr lnr-cross modal__close-btn" onClick={this.toggleAddJobModal}/>
          <h4 className="bold-text modal__title">Job Request</h4>
        </div>
        <div className="modal__body" style={{ padding: '25px 25px 20px 25px' }}>
          <JobCreateForm selectedEquipment={selectedEquipment} handlePageClick={() => {}} />
        </div>
      </Modal>
    );
  }

  renderBreadcrumb() {
    return (
      <div>
        <button type="button" className="app-link"
                onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &#62;Dashboard
      </div>
    );
  }

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Dashboard</h3>
        </Col>
      </Row>
    );
  }

  renderFilter() {
    const {
      startAvailability,
      endAvailability,
      // truckType,
      minCapacity,
      // materials,
      zipCode,
      // rateType,

      equipmentTypes,
      materialTypes,
      rateTypes
      // modal,
      // equipments,
      // selectedEquipment
    } = this.state;

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <h3>Filters</h3>

              <form className="form" onSubmit={e => this.saveCompany(e)}>
                {/* <Row style={{color:Tomato}}> */}
                <Row>
                  <Col>
                    <span className="form__form-group-label">Start Availability</span>
                    <div className="form__form-group-field">
                      <input name="startAvailability"
                             type="text"
                             placeholder="Select Start Date"
                             value={startAvailability}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </Col>
                  <Col>
                    <span className="form__form-group-label">End Availability</span>
                    <div className="form__form-group-field">
                      <input name="endAvailability"
                             style={{ width: '100%' }}
                             type="text"
                             placeholder="Select End Date"
                             value={endAvailability}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </Col>
                  <Col>
                    <span className="form__form-group-label">Truck Type</span>
                    <div className="form__form-group-field">
                      <Select
                        name="equipmentTypes"
                        value={equipmentTypes}
                        onChange={this.handleInputChange}
                      >
                        {
                          equipmentTypes.map(typeSelect => (
                            <option key={typeSelect.order} value={typeSelect.order}>
                              {typeSelect.val1}
                            </option>
                          ))
                        }
                      </Select>
                    </div>
                  </Col>
                  <Col>
                    <span className="form__form-group-label">Min Capacity</span>
                    <div className="form__form-group-field">
                      <input name="minCapacity"
                             type="text"
                             placeholder="Min # of tons"
                             value={minCapacity}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </Col>
                  <Col>
                    <span className="form__form-group-label">Materials</span>
                    <div className="form__form-group-field">
                      <Select
                        name="materialTypes"
                        value={materialTypes}
                        onChange={this.handleInputChange}
                      >
                        {
                          materialTypes.map(typeSelect => (
                            <option key={typeSelect.order} value={typeSelect.order}>
                              {typeSelect.val1}
                            </option>
                          ))
                        }
                      </Select>
                    </div>
                  </Col>
                  <Col>
                    <span className="form__form-group-label">Zip Code</span>
                    <div className="form__form-group-field">
                      <input name="zipCode"
                             type="text"
                             placeholder="Zip Code"
                             value={zipCode}
                             onChange={this.handleInputChange}
                      />
                    </div>
                  </Col>
                  <Col>
                    <span className="form__form-group-label">Rate Type</span>
                    <div className="form__form-group-field">
                      <Select
                        name="rateTypes"
                        value={rateTypes}
                        onChange={this.handleInputChange}
                      >
                        {
                          rateTypes.map(typeSelect => (
                            <option key={typeSelect.order} value={typeSelect.order}>
                              {typeSelect.val1}
                            </option>
                          ))
                        }
                      </Select>
                    </div>
                  </Col>
                </Row>
              </form>

            </CardBody>
          </Card>
        </Col>

      </Row>
    );
  }

  renderEquipmentRow(equipment) {
    return (
      <React.Fragment>
        <div style={{ paddingTop: '10px' }} className="row">
          <div className="col-sm-3">
            <img width="100" height="85" src={`${window.location.origin}/${truckImage}`} alt=""
                 style={{ width: '100px' }}
            />
          </div>
          <div className="col-sm-3">
            <span>
              {equipment.type}
              {equipment.maxCapacity}
              {equipment.hourRate}

              Rate/hour Minimum ton

              {equipment.hourRate}
              {equipment.tonRate}
              {equipment.companyId}
              {equipment.notes}
              <div className="col-sm-8">
                <button type="button" className="btn btn-primary">
                  Request
                </button>
              </div>

            </span>
          </div>
          <div className="col-sm-3">
            <span>50 Tons</span>
          </div>
          <div className="col-sm-3">
            <span>{equipment.maxCapacity}</span>
          </div>
          <div className="col-sm-3">
            {/* {this.renderEquipmentMaterials()} */}
          </div>
        </div>
        <hr />
      </React.Fragment>
    );
  }

  renderEquipmentTable() {
    const {
      equipments
    } = this.state;

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>

              Displaying&nbsp;
              {equipments.length}
              &nbsp;of&nbsp;
              {equipments.length}

              <Row>
                {
                  equipments.map(equipment => (
                    <div key={equipment.id}>
                      {this.renderEquipmentRow(equipment)}
                    </div>
                  ))
                }
              </Row>

              <TTable
                columns={
                  [
                    {
                      name: 'id',
                      displayName: 'ID'
                    },
                    {
                      name: 'image',
                      displayName: 'Image'
                    },
                    {
                      name: 'type',
                      displayName: 'type'
                    },

                    {
                      name: 'maxCapacity',
                      displayName: 'Max Capacity'
                    },

                    {
                      name: 'hourRate',
                      displayName: 'Hourly Rate'
                    },
                    {
                      name: 'minHours',
                      displayName: 'Min Hours'
                    },

                    {
                      name: 'tonRate',
                      displayName: 'Ton Rate'
                    },

                    {
                      name: 'companyId',
                      displayName: 'Company Name'
                    }
                  ]
                }
                data={equipments}
                handleIdClick={this.handleEquipmentEdit}
              />

            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  render() {
    return (
      <Container className="dashboard">
        {this.renderModal()}
        {this.renderGoTo()}
        {this.renderBreadcrumb()}
        {this.renderTitle()}
        {this.renderFilter()}
        {/* {this.renderTable()} */}
        {this.renderEquipmentTable()}
      </Container>
    );
  }
}

export default DashboardCustomerPage;
