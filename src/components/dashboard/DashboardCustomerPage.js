import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Card, CardBody, Col, Container, Modal, Row } from 'reactstrap';
import moment from 'moment';

// import PropTypes from 'prop-types';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import JobService from '../../api/JobService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';
import AddressService from '../../api/AddressService';
import ProfileService from '../../api/ProfileService';
import JobCreatePopup from '../jobs/JobCreatePopup';

class DashboardCustomerPage extends Component {
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

    // Promise.all(
    jobs.map(async (job) => {
      const newJob = job;

      const company = await CompanyService.getCompanyById(newJob.companiesId);
      newJob.companyName = company.legalName;

      // console.log('Company ID ', newJob.companiesId, ' ',
      // newJob.companyName, ' has ', jobs.length, ' Jobs ',);

      const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      const materials = materialsList.map(materialItem => materialItem.value);
      newJob.material = this.equipmentMaterialsAsString(materials);

      const address = await AddressService.getAddressById(newJob.startAddress);
      newJob.zip = address.zipCode;

      this.setState({ loaded: true });

      return newJob;
    });
    // );
    this.setState({ jobs });
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

    let jobs = await JobService.getJobsByCompanyId(companyId);
    jobs = jobs.map((job) => {
      const newJob = job;
      newJob.modifiedOn = moment(job.modifiedOn)
        .format();
      newJob.createdOn = moment(job.createdOn)
        .format();
      return newJob;
    });
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
      >
        <JobCreatePopup
          toggle={this.toggleNewJobModal}
        />
      </Modal>
    );
  }

  render() {
    const { loaded } = this.state;
    let { jobs } = this.state;
    let newJobCount = 0;
    let acceptedJobCount = 0;
    let inProgressJobCount = 0;
    let completedJobCount = 0;
    let potentialIncome = 0;

    let jobsCompleted = 0;
    let totalEarnings = 0;
    let earningsPerJob = 0;
    let cancelledJobs = 0;
    let jobsPerTruck = 0;
    let idleTrucks = 0;
    let completedOffersPercent = 0;

    jobs = jobs.map((job) => {
      const newJob = job;
      const tempRate = newJob.rate;
      if (newJob.status === 'New') {
        newJobCount += 1;
      }
      if (newJob.status === 'Accepted') {
        acceptedJobCount += 1;
      }
      if (newJob.status === 'In Progress') {
        inProgressJobCount += 1;
      }
      if (newJob.status === 'Job Completed') {
        completedJobCount += 1;
      }
      if (newJob.rateType === 'Hour') {
        newJob.newSize = TFormat.asHours(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByHour(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }
      if (newJob.rateType === 'Ton') {
        newJob.newSize = TFormat.asTons(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }
      newJob.newRate = `$${newJob.rate}`;

      // newJob.newStartDate = moment(job.startTime).format("MM/DD/YYYY");
      newJob.newStartDate = TFormat.asDate(job.startTime);

      potentialIncome += tempRate * newJob.rateEstimate;

      return newJob;
    });

    jobsCompleted = newJobCount * 20;
    totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    cancelledJobs = 1;
    jobsPerTruck = TFormat.asNumber(newJobCount / 0.7);
    idleTrucks = 1;

    // Jobs completed / Job offers responded to
    completedOffersPercent = TFormat.asPercent((completedJobCount / jobs.length) * 100, 2);

    potentialIncome = TFormat.asMoney(potentialIncome);

    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderNewJobModal()}
          {this.renderGoTo()}

          <Row>
            <Col md={12}>
              <h3 className="page-title">Dashboard for Customer (DashboardCustomerPage)</h3>
            </Col>
          </Row>

          <div className="row">

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Jobs Offered</center></h5>
                  <span><center><h4>{newJobCount}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Jobs in Progress</center></h5>
                  <span><center><h4>{inProgressJobCount}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Jobs Booked</center></h5>
                  <span><center><h4>{acceptedJobCount}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Completed Jobs</center></h5>
                  <span><center><h4>{completedJobCount}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>% completed</center></h5>
                  <span><center><h4>{completedOffersPercent}</h4></center></span>
                </div>
              </div>
            </div>

          </div>

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
                        // {
                        //   name: 'id',
                        //   displayName: 'Job Id'
                        // },
                        {
                          name: 'name',
                          displayName: 'Job Name'
                        },
                        {
                          name: 'status',
                          displayName: 'Job Status'
                        },
                        {
                          name: 'companyName',
                          displayName: 'Customer'
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
                        },
                        {
                          name: 'newRate',
                          displayName: 'Rate'
                        },
                        // {
                        //   name: 'estimatedIncome',
                        //   displayName: 'Est. Income'
                        // },
                        {
                          // the materials needs to come from the the JobMaterials Table
                          name: 'material',
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
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

// DashboardCustomerPage.propTypes = {
//   companyId: PropTypes.number.isRequired
// };

export default DashboardCustomerPage;
