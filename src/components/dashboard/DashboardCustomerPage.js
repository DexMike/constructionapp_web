import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Modal, Row } from 'reactstrap';
// import classnames from 'classnames';
import moment from 'moment';
import TTable from '../common/TTable';
// import JobsService from '../../api/JobsService';
// import AgentService from '../../api/AgentService';
import EquipmentService from '../../api/EquipmentService';
import JobCreateForm from '../jobs/JobCreateForm';

class DashboardCustomerPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      equipments: [],
      goToDashboard: false,
      selectedEquipment: {},
      modal: false
      // goToAddJob: false,
      // goToUpdateJob: false,
      // goToCreateJob: false,
      // jobId: 0
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    // this.handleJobEdit = this.handleJobEdit.bind(this);
    this.handleEquipmentEdit = this.handleEquipmentEdit.bind(this);
    this.toggleAddJobModal = this.toggleAddJobModal.bind(this);
  }

  async componentDidMount() {
    // await this.fetchJobs();
    await this.fetchEquipments();
  }

  getState() {
    const status = this.state;
    return status;
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

  render() {
    const {
      equipments,
      startAvailability,
      endAvailability,
      truckType,
      minCapacity,
      materials,
      zipCode,
      rateType,
      modal,
      selectedEquipment
    } = this.state;
    return (
      <Container className="dashboard">
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
        {this.renderGoTo()}
        <button type="button" className="app-link"
                onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &#62;Dashboard
        <Row>
          <Col md={12}>
            <h3 className="page-title">Dashboard</h3>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <h3>Filters</h3>

                <form className="form" onSubmit={e => this.saveCompany(e)}>
                  {/*<Row style={{color:Tomato}}>*/}
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
                        <input name="truckType"
                               type="text"
                               placeholder="Any"
                               value={truckType}
                             onChange={this.handleInputChange}
                        />
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
                      <span className="form__form-group-label">materials</span>
                      <div className="form__form-group-field">
                        <input name="materials"
                               type="text"
                               placeholder="Any"
                               value={materials}
                             onChange={this.handleInputChange}
                        />
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
                        <input name="rateType"
                               type="text"
                               placeholder="Any"
                               value={rateType}
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

        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                Displaying {
                if equipement !=== null {
                  equipment.length
                } else {
                  none
                  }
                } of YYY
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
      </Container>
    );
  }
}

export default DashboardCustomerPage;
