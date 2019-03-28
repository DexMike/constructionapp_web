import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import moment from 'moment';

import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import JobService from '../../api/JobService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';
import AddressService from '../../api/AddressService';

class DashboardCarrierPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
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
    const jobs = await this.fetchJobs();

    // Promise.all(
    jobs.map(async (job) => {
      const newJob = job;

      const company = await CompanyService.getCompanyById(newJob.companiesId);
      newJob.companyName = company.legalName;

      // console.log(companyName);
      // console.log(job.companyName);

      const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      const materials = materialsList.map(materialItem => materialItem.value);
      newJob.material = this.equipmentMaterialsAsString(materials);
      // console.log(companyName);
      // console.log(job.material);

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
    let jobs = await JobService.getJobs();
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

    // console.log(jobs);

    if (loaded) {
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
              <h3 className="page-title">Dashboard for Carrier (DashboardCarrierPage)</h3>
            </Col>
          </Row>

          <div className="row">

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>New Offers</center></h5>
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
                  <h5 className="card__title bold-text"><center>Potential Earnings</center></h5>
                  <span><center><h4>{potentialIncome}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Jobs Completed</center></h5>
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
                  Carrier
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
                          name: 'image',
                          displayName: 'Truck Image'
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
                          name: 'newStartDate',
                          displayName: 'Start Date'
                        },
                        {
                          name: 'zip',
                          displayName: 'Start Zip'
                        },
                        {
                          name: 'newSize',
                          displayName: 'Size'
                        },
                        {
                          name: 'newRate',
                          displayName: 'Rate'
                        },
                        {
                          name: 'estimatedIncome',
                          displayName: 'Est. Income'
                        },
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
      <Container>
        Loading...
      </Container>
    );
  }
}

export default DashboardCarrierPage;
