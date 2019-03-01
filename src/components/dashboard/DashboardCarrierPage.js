import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import moment from 'moment';
// import ProfileService from '../../api/ProfileService';
import TTable from '../common/TTable';
import JobService from '../../api/JobService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';

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
    const jobs = await this.fetchJobs();

    Promise.all(
      jobs.map(async (job) => {
        const companyName = await CompanyService.getCompanyById(job.companiesId);
        job.companyName = companyName.legalName;
        // console.log(companyName);
        // console.log(job.companyName);

        const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        job.material = materialsList.jobId;
        // console.log(companyName);
        console.log(job.material);
      })
    );
    this.setState({
      jobs
    });

    console.log(jobs);
  }

  // this came from Adam - to reuse
  renderEquipmentMaterials() {
    const { selectedEquipment } = this.props;
    return selectedEquipment.materials.map((material, index, materials) => {
      if (index !== materials.length - 1) {
        return (
          <span key={material}>
            {material}
            ,&nbsp;
          </span>
        );
      }
      return <span key={material}>{material}</span>;
    });
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

        <Row>
          <Col md={12}>
            <h3 className="page-title">Dashboard</h3>
          </Col>
        </Row>

        <div className="row">
          <div className="col-12 col-md-2 col-lg-2">
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
                        name: 'companyName',
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

export default DashboardCarrierPage;
