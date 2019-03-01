import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
// Button
import moment from 'moment';
import TTable from '../common/TTable';
// import JobsService from '../../api/JobsService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';
import JobService from '../../api/JobService';

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
    const jobs = await this.fetchJobs();

    Promise.all(
      jobs.map(async (job) => {
        const companyName = await CompanyService.getCompanyById(job.companiesId);
        job.companyName = companyName.legalName;
        console.log(companyName);
        // console.log(job.companyName);

        // const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        // job.material = materialsList.jobId;
        // // console.log(companyName);
        // console.log(job.material);
        // debugger;
      })
    );
    this.setState({
      jobs
    });

    console.log(jobs);

    // jobs = jobs.map(async (job) => {
    //   // job.materials = await JobMaterialService.getJobMaterialsById(job.id);
    //   job.companyName = await CompanyService.getCompanyById(job.companiesId);
    //   return job;
    // });
    //
    // Promise.all(jobs).then((jobs) => {
    //   debugger;
    //   this.setState({
    //     jobs
    //   });
    // });
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
    let jobs = await JobService.getJobs();
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
    let { jobs } = this.state;
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
      return newJob;
    });
    console.log(jobs);
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
                JobCarrierListPage
                <TTable
                  columns={
                    [
                      {
                        name: 'id',
                        displayName: 'Job Id'
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
}

export default JobCarrierListPage;
