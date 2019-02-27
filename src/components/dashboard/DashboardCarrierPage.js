import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import moment from 'moment';
// import ProfileService from '../../api/ProfileService';
import TTable from '../common/TTable';
import JobsService from '../../api/JobsService';

class DashboardCarrierPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      jobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0
      // profile: null
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
    const { jobs } = this.state;
    return (
      <Container className="dashboard">
        {this.renderGoTo()}
        <button type="button" className="app-link"
                onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>

        <Row>
          <Col md={12}>
            <h3 className="page-title">Dashboard</h3>
          </Col>
        </Row>

        <div className="row">
          <div className="col-12 col-md-2 col-lg-1">
            <div className="card">
              <div className="dashboard__card-widget card-body">
                <h5 className="bold-text">All Jobs</h5>
                {jobs.length}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2 col-lg-2">
            <div className="card">
              <div className="dashboard__card-widget card-body">
                <h5 className="bold-text">Pending Offers</h5>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2 col-lg-2">
            <div className="card">
              <div className="dashboard__card-widget card-body">
                <h5 className="bold-text">Jobs in Progress</h5>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2 col-lg-2">
            <div className="card">
              <div className="dashboard__card-widget card-body">
                <h5 className="bold-text">Booked Jobs</h5>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2 col-lg-2">
            <div className="card">
              <div className="dashboard__card-widget card-body">
                <h5 className="bold-text">Completed Jobs</h5>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2 col-lg-2">
            <div className="card">
              <div className="dashboard__card-widget card-body">
                <h5 className="bold-text">Upcoming Revenue</h5>
              </div>
            </div>
          </div>

        </div>

        <br />

        {/* {this.renderGoTo()} */}
        {/* <button type="button" className="app-link" */}
        {/* onClick={() => this.handlePageClick('Dashboard')} */}
        {/* > */}
        {/* Dashboard */}
        {/* </button> */}
        <Row>
          <Col md={12}>
            <h3 className="page-title">Jobs</h3>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                Carrier
                <TTable
                  columns={
                    [
                      {
                        name: 'id',
                        displayName: 'Job Id'
                      },
                      {
                        name: 'image',
                        displayName: 'Truck Image'
                      },
                      {
                        name: 'companiesId',
                        displayName: 'Customer'
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
                        name: 'note',
                        displayName: 'Size'
                      },
                      {
                        name: 'rate',
                        displayName: 'Rate'
                      },
                      {
                        name: 'rateEstimate',
                        displayName: 'Est. Income'
                      },
                      {
                        name: 'notes',
                        displayName: 'Materials'
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

export default DashboardCarrierPage;
