import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import moment from 'moment';
import TTable from '../common/TTable';
import JobsService from '../../api/JobsService';

class JobCarrierListPage extends Component {
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
    const { jobs } = this.state;
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
                <Button
                  style={{ width: '150px' }}
                  className="btn btn-primary account__btn account__btn--small"
                  onClick={() => this.handlePageClick('AddJob')}
                >
                  Add Job
                </Button>
                <hr/>
                JobCarrierListPage
                <TTable
                  columns={
                    [
                      {
                        name: 'Customer',
                        displayName: 'Customer'
                      },
                      {
                        name: 'Material',
                        displayName: 'Material'
                      },
                      {
                        name: 'Size',
                        displayName: 'Size'
                      },
                      {
                        name: 'Start Date',
                        displayName: 'Start Date'
                      },
                      {
                        name: 'End Date',
                        displayName: 'End Date'
                      },
                      {
                        name: 'Start Zip',
                        displayName: 'Start Zip'
                      },
                      {
                        name: 'Est Income',
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

export default JobCarrierListPage;
