import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import TFormat from '../common/TFormat';
import TTable from '../common/TTable';
import CompanyService from '../../api/CompanyService';
import JobService from '../../api/JobService';
import JobMaterialsService from '../../api/JobMaterialsService';
import AddressService from '../../api/AddressService';
import ProfileService from '../../api/ProfileService';
// import JobPage from './JobPage';

class JobCarrierListPage extends Component {
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
    this.fetchJobs = this.fetchJobs.bind(this);
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
    this.setState({ jobs, loaded: true });
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
    // const jobs = await JobService.getJobs();
    const profile = await ProfileService.getProfile();
    const { companyId } = profile;
    const jobs = await JobService.getJobsByCompanyIdAndCustomerAccepted(companyId);

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
    const { loaded } = this.state;
    const { companyId } = this.props;

    jobs = jobs.map((job) => {
      const newJob = job;
      const tempRate = newJob.rate;
      if (newJob.rateType === 'Hour') {
        newJob.newSize = newJob.rateEstimate;
        newJob.newSizeF = TFormat.getValue(
          TFormat.asHours(newJob.rateEstimate)
        );

        newJob.newRate = newJob.rate;
        newJob.newRateF = TFormat.getValue(
          TFormat.asMoneyByHour(newJob.rate)
        );

        newJob.estimatedIncome = Math.round(tempRate * newJob.rateEstimate);
        newJob.estimatedIncomeF = TFormat.getValue(
          TFormat.asMoney(tempRate * newJob.rateEstimate)
        );
      } else if (newJob.rateType === 'Ton') {
        newJob.newSize = newJob.rateEstimate;
        newJob.newSizeF = TFormat.getValue(
          TFormat.asTons(newJob.rateEstimate)
        );

        newJob.newRate = newJob.rate;
        newJob.newRateF = TFormat.getValue(
          TFormat.asMoneyByTons(newJob.rate)
        );

        newJob.estimatedIncome = Math.round(tempRate * newJob.rateEstimate);
        newJob.estimatedIncomeF = TFormat.getValue(
          TFormat.asMoney(tempRate * newJob.rateEstimate)
        );
      } else {
        newJob.newSize = 'Invalid Rate Type';
        newJob.newSizeF = 'Invalid Rate Type';
        newJob.newRate = 'Invalid Rate Type';
        newJob.newRateF = 'Invalid Rate Type';
        newJob.estimatedIncome = 'Invalid Rate Type';
        newJob.estimatedIncomeF = 'Invalid Rate Type';
      }

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
                          displayName: 'Size',
                          label: 'newSizeF'
                        },
                        {
                          name: 'newRate',
                          displayName: 'Rate',
                          label: 'newRateF'
                        },
                        {
                          name: 'estimatedIncome',
                          displayName: 'Potential Earnings',
                          label: 'estimatedIncomeF'
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
      <Container className="dashboard">
        Loading ({companyId})...
      </Container>
    );
  }
}

JobCarrierListPage.propTypes = {
  companyId: PropTypes.number.isRequired
};

JobCarrierListPage.defaultProps = {
  // companyId: null
};

export default JobCarrierListPage;
