import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import moment from 'moment';
import TTable from '../common/TTable';
import JobsService from '../../api/JobsService';

class DashboardCustomerPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      jobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
  }

  async componentDidMount() {
    await this.fetchJobs();
  }

  getState() {
    const status = this.state;
    return status;
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
                Filters

                Start Availability
                End Availability
                Truck Type
                Min Capacity
                Materials
                Zip Code
                Rate Type

              </CardBody>
            </Card>
          </Col>

        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardBody>

                <form className="form" onSubmit={e => this.saveCompany(e)}>
                  <div className="form__half">

                    <div className="form__form-group">
                      <span className="form__form-group-label">Start Availability</span>
                      <div className="form__form-group-field">
                        <input name="startAvailability" type="text" placeholder=""
                               value={startAvailability} onChange={this.handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">End Availability</span>
                      <div className="form__form-group-field">
                        <input name="endAvailability" type="text" value={moment(endAvailability)
                          .format()} onChange={this.handleInputChange} disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form__half">

                    <div className="form__form-group">
                      <span className="form__form-group-label">Truck Type</span>
                      <div className="form__form-group-field">
                        <input name="truckType" type="text" placeholder="" value={truckType}
                               onChange={this.handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">minCapacity</span>
                      <div className="form__form-group-field">
                        <input name="minCapacity" type="text" value={minCapacity}
                               onChange={this.handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form__form-group">
                      <span className="form__form-group-label">materials</span>
                      <div className="form__form-group-field">
                        <input name="materials" type="text" value={materials}
                               onChange={this.handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <Container>
                    <Row>
                      <Col md="4">
                        <Button
                          className="account__btn btn-delete"
                          onClick={() => this.handleDelete()}
                        >
                          Delete Company
                        </Button>
                      </Col>
                      <Col md="4">
                        {this.renderGoTo()}
                        <Button
                          className="app-link account__btn btn-back"
                          onClick={() => this.handlePageClick('Company')}
                        >
                          Cancel
                        </Button>
                      </Col>
                      <Col md="4">
                        <Button
                          type="submit"
                          className="account__btn btn-save"
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </Container>
                </form>




              </CardBody>
            </Card>
          </Col>

        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                Dashboard Customer Page
                <TTable
                  columns={
                    [
                      {
                        name: 'companiesId',
                        displayName: 'Customer'
                      },
                      {
                        name: 'notes',
                        displayName: 'Material'
                      },
                      {
                        name: 'rate',
                        displayName: 'Size'
                      },
                      {
                        name: 'startTime',
                        displayName: 'Start Date'
                      },
                      {
                        name: 'startAddress',
                        displayName: 'Start Zip'
                      },
                      {
                        name: 'rateEstimate',
                        displayName: 'Est Income'
                      }
                    ]
                  }
                  data={jobs}
                  handleIdClick={this.handleJobEdit}
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
