import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal,
  Button
} from 'reactstrap';
// Button,
import PropTypes from 'prop-types';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import JobService from '../../api/JobService';
import ProfileService from '../../api/ProfileService';
import JobCreatePopup from './JobCreatePopup';
// import CompanyService from '../../api/CompanyService';
// import JobMaterialsService from '../../api/JobMaterialsService';
// import AddressService from '../../api/AddressService';

class JobCustomerListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      jobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,
      modalAddJob: false
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.toggleNewJobModal = this.toggleNewJobModal.bind(this);
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
    const { companyId } = profile;
    const jobs = await JobService.getJobsByCompanyId(companyId);
    return jobs;
  }

  async toggleNewJobModal() {
    const { modalAddJob } = this.state;
    if (modalAddJob) {
      const jobs = await this.fetchJobs();
      this.setState({ jobs, loaded: true });
    }
    this.setState({
      modalAddJob: !modalAddJob
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

  renderNewJobModal() {
    const {
      modalAddJob
    } = this.state;
    return (
      <Modal
        isOpen={modalAddJob}
        toggle={this.toggleNewJobModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobCreatePopup
          toggle={this.toggleNewJobModal}
        />
      </Modal>
    );
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
          {this.renderNewJobModal()}
          {this.renderGoTo()}
          <button type="button" className="app-link"
                  onClick={() => this.handlePageClick('Dashboard')}
          >
            Dashboard
          </button>
          &#62;Number of Jobs {jobs.length}
          <Row>
            <Col md={12}>
              <h3 className="page-title">Jobs inside JobCustomerListPage</h3>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  {/*
                  <Button
                    onClick={() => this.handlePageClick('AddJob')}
                    className="primaryButton"
                  >
                    Create Job
                  </Button>
                  */}
                  <Button
                    onClick={this.toggleNewJobModal}
                    type="button"
                    className="primaryButton"
                  >
                    ADD A JOB
                  </Button>
                  <hr/>
                  <TTable
                    columns={
                      [
                        {
                          name: 'name',
                          displayName: 'Job Name'
                        },
                        {
                          name: 'companyName',
                          displayName: 'Customer'
                        },
                        {
                          name: 'material',
                          displayName: 'Material'
                        },
                        {
                          name: 'newSize',
                          displayName: 'Size'
                        },
                        {
                          name: 'newStartDate',
                          displayName: 'Start Date'
                        },
                        {
                          name: 'zip',
                          displayName: 'Start Zip'
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
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

JobCustomerListPage.propTypes = {
  companyId: PropTypes.number.isRequired
};

JobCustomerListPage.defaultProps = {
  // companyId: null
};

export default JobCustomerListPage;
