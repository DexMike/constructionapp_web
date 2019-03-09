import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import TFormat from "../common/TFormat";
import TTable from '../common/TTable';
import CompanyService from '../../api/CompanyService';
import JobService from '../../api/JobService';
import JobMaterialsService from '../../api/JobMaterialsService';
import AddressService from '../../api/AddressService';

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
        const newJob = job;
        const company = await CompanyService.getCompanyById(newJob.companiesId);
        newJob.companyName = company.legalName;
        // console.log(companyName);
        // console.log(job.companyName)
        const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        const materials = materialsList.map(materialItem => materialItem.value);
        newJob.material = this.equipmentMaterialsAsString(materials);
        // console.log(companyName);
        // console.log(job.material);

        const address = await AddressService.getAddressById(newJob.startAddress);
        newJob.zip = address.zipCode;

        return newJob;
      })
    );
    this.setState({ jobs });
    // console.log(jobs);
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

    // AJ: commenting out because we don't want to modify the timestamps, unless we save data
    // jobs = jobs.map((job) => {
    //   const newJob = job;
    //   newJob.modifiedOn = moment(job.modifiedOn)
    //     .format();
    //   newJob.createdOn = moment(job.createdOn)
    //     .format();
    //   return newJob;
    // });
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
        newJob.newSize = TFormat.asHours(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByHour(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      } else if (newJob.rateType === 'Ton') {
        newJob.newSize = TFormat.asTons(newJob.rateEstimate);
        newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      } else {
        newJob.newSize = "Invalid Rate Type";
        newJob.newRate = "Invalid Rate Type";
        newJob.estimatedIncome = "Invalid Rate Type";
      }

      // newJob.newStartDate = moment(job.startTime).format("MM/DD/YYYY");
      newJob.newStartDate = TFormat.asDate(job.startTime);

      return newJob;
    });

    // console.log(jobs);
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
                Job Carrier List Page
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
}

export default JobCarrierListPage;
