import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import classnames from 'classnames';
import moment from 'moment';
import TTable from '../common/TTable';
import JobsService from '../../api/JobsService';
import AgentService from '../../api/AgentService';
import EquipmentService from '../../api/EquipmentService';

class DashboardCustomerPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      jobs: [],
      equipments: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      goToCreateJob: false,
      jobId: 0
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.handleEquipmentEdit = this.handleEquipmentEdit.bind(this);
  }

  async componentDidMount() {
    await this.fetchJobs();
    await this.fetchEquipments();
  }

  getState() {
    const status = this.state;
    return status;
  }

  async fetchJobs() {
    let jobs = await JobsService.getJobs();
    jobs = jobs.map((job) => {
      const newJob = job;
      newJob.modifiedOn = moment(job.modifiedOn)
        .format();
      newJob.createdOn = moment(job.createdOn)
        .format();
      return newJob;
    });
    this.setState({ jobs });
  }

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

  async filterEquipment() {

  }

  handleJobEdit(id) {
    this.setState({
      goToUpdateJob: true,
      jobId: id
    });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleEquipmentEdit(id) {
    this.setState({
      goToUpdateEquipment: true,
      equipmentId: id
    });
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (status.goToAddJob) {
      return <Redirect push to="/jobs/save"/>;
    }
    if (status.goToUpdateJob) {
      return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    }
    return false;
  }

  render() {
    const {
      jobs,
      equipments,
      startAvailability,
      endAvailability,
      truckType,
      minCapacity,
      materials,
      zipCode,
      rateType
    } = this.state;
    return (
      <Container className="dashboard">
        {this.renderGoTo()}
        <button type="button" className="app-link"
                onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &#62;Jobs
        <Row>
          <Col md={12}>
            <h3 className="page-title">Jobs</h3>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <h3>Filters</h3>

                  <form className="form" onSubmit={e => this.saveCompany(e)}>

                    <Row>
                      <Col>
                        <span className="form__form-group-label">Start Availability</span>
                        <div className="form__form-group-field">
                        <input name="startAvailability" type="text" value={startAvailability}
                               onChange={this.handleInputChange}
                        />
                        </div>
                      </Col>
                      <Col>
                        <span className="form__form-group-label">End Availability</span>
                        <div className="form__form-group-field">
                        <input name="endAvailability" type="text" value={endAvailability}
                               onChange={this.handleInputChange}
                        />
                        </div>
                      </Col>
                      <Col>
                        <span className="form__form-group-label">Truck Type</span>
                        <div className="form__form-group-field">
                        <input name="truckType" type="text" value={truckType}
                               onChange={this.handleInputChange}
                        />
                        </div>
                      </Col>
                      <Col>
                        <span className="form__form-group-label">Min Capacity</span>
                        <div className="form__form-group-field">
                        <input name="minCapacity" type="text" value={minCapacity}
                               onChange={this.handleInputChange}
                        />
                        </div>
                      </Col>
                      <Col>
                        <span className="form__form-group-label">materials</span>
                        <div className="form__form-group-field">
                        <input name="materials" type="text" value={materials}
                               onChange={this.handleInputChange}
                        />
                        </div>
                      </Col>
                      <Col>
                        <span className="form__form-group-label">Zip Code</span>
                        <div className="form__form-group-field">
                        <input name="zipCode" type="text" value={zipCode}
                               onChange={this.handleInputChange}
                        />
                        </div>
                      </Col>
                      <Col>
                        <span className="form__form-group-label">Rate Type</span>
                        <div className="form__form-group-field">
                        <input name="rateType" type="text" value={rateType}
                               onChange={this.handleInputChange}
                        />
                        </div>
                      </Col>
                    </Row>
                  </form>

              </CardBody>
            </Card>
          </Col>

        </Row>


        {/*id*/}
        {/*name*/}
        {/*type*/}
        {/*styleId*/}
        {/*maxCapacity*/}
        {/*minCapacity*/}
        {/*minHours*/}
        {/*maxDistance*/}
        {/*description*/}
        {/*licensePlate*/}
        {/*vin*/}
        {/*image*/}

        {/*currentAvailability*/}
        {/*hourRate*/}
        {/*tonRate*/}
        {/*rateType*/}

        {/*companyId*/}
        {/*defaultDriverId*/}
        {/*driverEquipmentsId*/}
        {/*driversId*/}
        {/*equipmentAddressId*/}

        {/*modelId*/}
        {/*makeId*/}
        {/*notes*/}
        {/*createdBy*/}
        {/*createdOn*/}
        {/*modifiedBy*/}
        {/*modifiedOn*/}
        {/*isArchived*/}

        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                Displaying "10" of "575"
                <TTable
                  columns={
                    [
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
                        name: 'hourRate' + "/ Hour",
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
                      },
                      // {
                      //   name: 'equipmentsId.value',
                      //   displayName: 'Materials'
                      // }
                    ]
                  }
                  data={equipments}
                  handleIdClick={this.handleEquipmentEdit}
                />

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default DashboardCustomerPage;
