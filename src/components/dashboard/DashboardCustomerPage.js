import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {Button, Card, CardBody, Col, Container, Modal, Row} from 'reactstrap';
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
import {useTranslation} from "react-i18next";
import {DashboardObject} from "./DashboardObject";

function PageTitle() {
  const {t} = useTranslation();
  return (
    <Row>
      <Col md={12}>
        <h3 className="page-title">{t("Jobs")}</h3>
      </Col>
    </Row>
  )
}

function AddJobButton({handle}) {
  const {t} = useTranslation();
  return (
    <Button
      onClick={handle}
      type="button"
      className="primaryButton"
    >
      {t("ADD A JOB")}
    </Button>
  )
}

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

      this.setState({loaded: true});

      return newJob;
    });
    // );
    this.setState({jobs});
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
      this.setState({[`goTo${menuItem}`]: true});
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
    const {modalAddJob} = this.state;
    if (modalAddJob) {
      const jobs = await this.fetchJobs();
      this.setState({jobs, loaded: true});
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
    const {loaded} = this.state;
    let {jobs} = this.state;
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
              <h3 className="page-title">Jobs</h3>
            </Col>
          </Row>

          <div className="row">
            <DashboardObject title="Offered Jobs" val = {newJobCount}/>
            <DashboardObject title="Jobs in Progress" val = {inProgressJobCount}/>
            <DashboardObject title="Booked Jobs" val = {acceptedJobCount}/>
            <DashboardObject title="Completed Jobs" val={completedJobCount}/>
            <DashboardObject title="% Completed" val = {completedOffersPercent}/>
          </div>

          <PageTitle/>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  <AddJobButton handle={this.toggleNewJobModal}/>
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
