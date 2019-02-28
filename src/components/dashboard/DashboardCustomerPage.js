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
// import TTable from '../common/TTable';
import EquipmentService from '../../api/EquipmentService';
import LookupsService from '../../api/LookupsService';
import JobCreateForm from '../jobs/JobCreateForm';

import truckImage from '../../img/default_truck.png';
import CompanyService from '../../api/CompanyService';
import AddressService from '../../api/AddressService';
import ProfileService from '../../api/ProfileService';
// import JobsService from '../../api/JobsService';
// import AgentService from '../../api/AgentService';

class DashboardCustomerPage extends Component {
  constructor(props) {
    super(props);

    // copied from Nimda EquipmentForm
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    // Comment
    this.state = {

      // Look up lists
      equipmentTypeList: [],
      materialTypeList: [],
      rateTypeList: [],
      sortByList,
      // Filters
      // sortBy: 1,

      equipments: [],
      selectedEquipment: {},

      modal: false,
      goToDashboard: false,

      // TODO: Refactor to a single filter object
      // Filter values
      filterStartAvailability: '',
      filterEndAvailability: '',
      filterTruckType: '',
      filterMinCapacity: '',
      filterMaterials: '',
      filterZipCode: '',
      filterRateType: '',
      filterSortBy: sortByList[0]

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
    let { filterZipCode , materialTypeList, equipmentTypeList, rateTypeList } = this.state;

    const profile = await ProfileService.getProfile();

    if (profile.companyId) {
      const company = await CompanyService.getCompanyById(profile.companyId);
      if (company.addressId) {
        const address = await AddressService.getAddressById(company.addressId);
        filterZipCode = address.zipCode ? address.zipCode : filterZipCode;
      }
    }

    const lookups = await LookupsService.getLookups();

    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'EquipmentType') equipmentTypeList.push(itm);
      });

    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'MaterialType') materialTypeList.push(itm);
      });

    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'RateType') rateTypeList.push(itm);
      });

    this.setState({
      filterZipCode,
      equipmentTypeList,
      materialTypeList,
      rateTypeList
    });
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
          <button type="button" className="lnr lnr-cross modal__close-btn"
                  onClick={this.toggleAddJobModal}/>
          <h4 className="bold-text modal__title">Job Request</h4>
        </div>
        <div className="modal__body" style={{ padding: '25px 25px 20px 25px' }}>
          <JobCreateForm selectedEquipment={selectedEquipment} handlePageClick={() => {
          }}/>
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
      // Lists
      equipmentTypeList,
      materialTypeList,
      rateTypeList,

      // Filter values
      filterStartAvailability,
      filterEndAvailability,
      filterTruckType,
      filterMinCapacity,
      filterMaterials,
      filterZipCode,
      filterRateType
    } = this.state;

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <h3>Filters</h3>

              <form className="form" onSubmit={e => this.saveCompany(e)}>

                <Col lg={12}>
                  <Row lg={12} style={{ background: '#eef4f8' }}>
                    <Col>
                      Start Availability
                    </Col>
                    <Col>
                      End Availability
                    </Col>
                    <Col>
                      Truck Type
                    </Col>
                    <Col>
                      Min Capacity
                    </Col>
                    <Col>
                      Materials
                    </Col>
                    <Col>
                      Zip Code
                    </Col>
                    <Col>
                      Rate Type
                    </Col>
                  </Row>
                  <Row lg={12} style={{ background: '#c8dde7' }}>
                    <Col>
                      <input name="filterStartAvailability"
                             type="text"
                             placeholder="Select Start Date"
                             value={filterStartAvailability}
                             onChange={this.handleInputChange}
                      />
                    </Col>
                    <Col>
                      <input name="filterEndAvailability"
                             style={{ width: '100%' }}
                             type="text"
                             placeholder="Select End Date"
                             value={filterEndAvailability}
                             onChange={this.handleInputChange}
                      />
                    </Col>
                    <Col>
                      <Select
                        name="filterTruckType"
                        value={filterTruckType}
                        onChange={this.handleInputChange}
                      >
                        {
                          equipmentTypeList.map(equipmentType => (
                            <option key={equipmentType.id} value={equipmentType.order}>
                              {equipmentType.val1}
                            </option>
                          ))
                        }
                      </Select>
                    </Col>
                    <Col>
                      <input name="filterMinCapacity"
                             type="text"
                             placeholder="Min # of tons"
                             value={filterMinCapacity}
                             onChange={this.handleInputChange}
                      />
                    </Col>
                    <Col>
                      <Select
                        name="filterMaterials"
                        value={filterMaterials}
                        onChange={this.handleInputChange}
                      >
                        {
                          materialTypeList.map(materialType => (
                            <option key={materialType.id} value={materialType.order}>
                              {materialType.val1}
                            </option>
                          ))
                        }
                      </Select>
                    </Col>
                    <Col>
                      <input name="filterZipCode"
                             type="text"
                             placeholder="Zip Code"
                             value={filterZipCode}
                             onChange={this.handleInputChange}
                      />
                    </Col>
                    <Col>
                      <Select
                        name="filterRateType"
                        value={filterRateType}
                        onChange={this.handleInputChange}
                      >
                        {
                          rateTypeList.map(rateType => (
                            <option key={rateType.id} value={rateType.order}>
                              {rateType.val1}
                            </option>
                          ))
                        }
                      </Select>
                    </Col>
                  </Row>
                </Col>

                <br/>

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
        <Row lg={12}>
          <Col lg={2} sm={4}>
            <img width="100" height="85" src={`${window.location.origin}/${truckImage}`} alt=""
                 style={{ width: '100px' }}
            />
          </Col>

          <Col lg={4} sm={8}>
            <Row lg={4} sm={8} style={{ background: '#c7dde8' }}>
              <Col>
                Type: {equipment.type}
              </Col>
              <Col>
                Capacity: {equipment.maxCapacity} Tons
              </Col>
            </Row>
            <Row>
              <Col style={{ background: '#ffa83b' }}>
                Rate
              </Col>
              <Col>
                Minimum
              </Col>
            </Row>
            <Row>
              <Col>
                $ {equipment.hourRate} / Hour
              </Col>
              <Col>
                Minimum
                MinCapacity:
                {equipment.minCapacity} / Tons
              </Col>
            </Row>
            <Row>
              <Col>
                $ {equipment.tonRate} / Ton
              </Col>
            </Row>
          </Col>

          <Col lg={6} sm={12} style={{ background: '#e895b4' }}>
            <Row>
              <Col>
                Company Name
              </Col>
            </Row>
            <Row>
              <Col>
                Materials
              </Col>
            </Row>
            <Row>
              <Col>
                HMA
                <br/>
                Stone
                <br/>
                Sand
                <br/>
              </Col>
              <Col>
                Gravel
                <br/>
                Recycling
                <br/>
              </Col>
              <Col>
                <button type="button"
                        className="btn btn-primary"
                        onClick={() => this.handleEquipmentEdit(equipment.id)}
                >
                  Request
                </button>
              </Col>
            </Row>
          </Col>
        </Row>
        <hr/>
      </React.Fragment>
    );
  }

  renderEquipmentTable() {
    const {
      sortByList,
      filterSortBy,
      equipments
    } = this.state;

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <Row>
                <Col>
                  Displaying&nbsp;
                  {equipments.length}
                  &nbsp;of&nbsp;
                  {equipments.length}
                </Col>

                <Col>
                  &nbsp;
                </Col>

                <Col>
                  Sort By&nbsp;
                  <Select
                    name="filterSortBy"
                    value={filterSortBy}
                    onChange={this.handleInputChange}
                  >
                    {
                      sortByList.map(sortBy => (
                        <option key={sortBy} value={sortBy}>
                          {sortBy}
                        </option>
                      ))
                    }
                  </Select>

                </Col>
              </Row>

              <Row>
                {
                  equipments.map(equipment => (
                    <div key={equipment.id}>
                      {this.renderEquipmentRow(equipment)}
                    </div>
                  ))
                }
              </Row>

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
