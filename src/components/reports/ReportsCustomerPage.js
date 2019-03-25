import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
// Button,
import PropTypes from 'prop-types';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import JobService from '../../api/JobService';
import ProfileService from '../../api/ProfileService';
// import CompanyService from '../../api/CompanyService';
// import JobMaterialsService from '../../api/JobMaterialsService';
// import AddressService from '../../api/AddressService';

// NOTE: this is a copy of DashboardCustomerPage

class ReportsCustomerPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
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
    const jobs = await this.fetchJobs();
    this.setState({ jobs, loaded: true });
  }

  getState() {
    const status = this.state;
    return status;
  }

  equipmentMaterialsAsString(materials) {
    let materialsString = '';
    if (materials) {
      let index = 0;
      for (const material of materials) {
        if (index !== materials.length - 1) {
          materialsString += `${material}, `;
        } else {
          materialsString += material;
        }
        index += 1;
      }
    }
    return materialsString;
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
    const profile = await ProfileService.getProfile();
    const companyId = profile.companyId;
    const jobs = await JobService.getJobsByCompanyIdAndCustomerAccepted(companyId);
    return jobs;
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
    let { jobs } = this.state;
    const { loaded } = this.state;

    jobs = jobs.map((job) => {
      const newJob = job;

      const tempRate = newJob.rate;
      if (newJob.rateType === 'Hour') {
        newJob.estimatedIncome = `$${tempRate * newJob.rateEstimate}`;
        newJob.newSize = `${newJob.rateEstimate} Hours`;
      }
      if (newJob.rateType === 'Ton') {
        newJob.estimatedIncome = `$${tempRate * newJob.rateEstimate}`;
        newJob.newSize = `${newJob.rateEstimate} Tons`;
      }
      newJob.newRate = `$${newJob.rate}`;

      // newJob.newStartDate = moment(job.startTime).format("MM/DD/YYYY");
      newJob.newStartDate = TFormat.asDate(job.startTime);

      return newJob;
    });

    if (loaded) {
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
              <h3 className="page-title">Reports</h3>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  Report #1
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  Report #2
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  Report #3
                </CardBody>
              </Card>
            </Col>
          </Row>

        </Container>
      );
    }
    return (
      <Container className="dashboard">
        Loading Customer Reports Page...
      </Container>
    );
  }
}

ReportsCustomerPage.propTypes = {
  // companyId: PropTypes.number.isRequired
};

ReportsCustomerPage.defaultProps = {
  // companyId: null
};

export default ReportsCustomerPage;
