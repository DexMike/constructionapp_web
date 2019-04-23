import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  Row
} from 'reactstrap';
import moment from 'moment';

// import PropTypes from 'prop-types';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import TField from '../common/TField';
import TSelect from '../common/TSelect';
import TDateTimePicker from '../common/TDateTimePicker';
import TIntervalDatePicker from '../common/TIntervalDatePicker';
import MultiSelect from '../common/TMultiSelect';

import AddressService from '../../api/AddressService';
import AgentService from '../../api/AgentService';
import CompanyService from '../../api/CompanyService';
import JobCreateForm from '../jobs/JobCreateForm';
import JobMaterialsService from '../../api/JobMaterialsService';
import JobService from '../../api/JobService';
import LookupsService from '../../api/LookupsService';
import ProfileService from '../../api/ProfileService';

import JobCreatePopup from '../jobs/JobCreatePopup';

import {useTranslation} from "react-i18next";
import {DashboardObject, DashboardObjectClickable} from "./DashboardObjectClickable";
import {DashboardObjectStatic} from "./DashboardObjectStatic";
import JobFilter from "../filters/JobFilter";

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

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    this.state = {
      loaded: false,
      jobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,
      modalAddJob: false,

      startDate: null,          // values for date control
      endDate: null,            // values for date control

      // Look up lists
      equipmentTypeList: [],
      materialTypeList: [],
      rateTypeList: [],
      sortByList, // array from above
      // sortBy: 1,

      equipments: [],
      selectedEquipment: {},


      // TODO: Refactor to a single filter object
      // Filter values
      filters: {
        status: '',
      },
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.toggleNewJobModal = this.toggleNewJobModal.bind(this);
    this.handleFilterStatusChange = this.handleFilterStatusChange.bind(this);
    this.returnJobs = this.returnJobs.bind(this);
  }

  async componentDidMount() {
    this.setState(
      {
        loaded: true,
        isAvailable: true
      }
    );
  }

  returnJobs(jobs, filters) {
    this.setState({ jobs });
    this.setState({ filters });
  }

  async handleFilterStatusChange({value, name}) {
    const { filters } = this.state;
    if (filters[name] === value) {
      filters[name] = "";
    } else {
      filters[name] = value;
    }
    this.refs.filterChild.filterWithStatus(filters);
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

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({[`goTo${menuItem}`]: true});
    }
  }

  async fetchJobs() {
    // console.log(237);
    const { filters } = this.state;
    const jobs = await JobService.getJobDashboardByFilters(filters);

    this.setState({ jobs });
    return jobs;
  }

  handleJobEdit(id) {
    this.setState({
      goToUpdateJob: true,
      jobId: id
    });
  }

  // handleJobEdit(id) {
  //   const { jobs } = this.state;
  //   const [selectedJob] = jobs.filter((job) => {
  //     if (id === job.id) {
  //       return job;
  //     }
  //     return false;
  //   }, id);
  //   selectedJob.materials = ['Any'];
  //   this.setState({
  //     selectedJob,
  //     modal: true
  //   });
  // }

  async toggleNewJobModal() {
    const {modalAddJob, filters} = this.state;
    if (modalAddJob) {
      this.refs.filterChild.filterWithStatus(filters);
      this.setState({loaded: true});
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

  renderTitle() {
    return (
      <Row>
        <Col md={10}>
          <h3 className="page-title">Job Dashboard</h3>
        </Col>
        <Col md={2}>
          <AddJobButton handle={this.toggleNewJobModal}/>
        </Col>
      </Row>
    );
  }

  renderCards() {
    const {loaded, filters} = this.state;
    let {jobs} = this.state;
    let onOfferJobCount = 0;
    let publishedJobCount = 0;
    let bookedJobCount = 0;
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
      if (newJob.status === 'On Offer') {
        onOfferJobCount += 1;
      }
      if (newJob.status === 'Published') {
        publishedJobCount += 1;
      }
      if (newJob.status === 'Booked') {
        bookedJobCount += 1;
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
      // newJob.newRate = `$${newJob.rate}`;

      // newJob.newStartDate = moment(job.startTime).format("MM/DD/YYYY");
      newJob.newStartDate = TFormat.asDate(job.startTime);

      potentialIncome += tempRate * newJob.rateEstimate;

      return newJob;
    });

    jobsCompleted = onOfferJobCount * 20;
    totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    cancelledJobs = 1;
    jobsPerTruck = TFormat.asNumber(onOfferJobCount / 0.7);
    idleTrucks = 1;

    // Jobs completed / Job offers responded to
    completedOffersPercent = TFormat.asPercent((completedJobCount / jobs.length) * 100, 2);

    potentialIncome = TFormat.asMoney(potentialIncome);

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="row">
            <DashboardObjectClickable title="New Offers" displayVal = {onOfferJobCount} value={"On Offer"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Published Jobs" displayVal = {publishedJobCount} value={"Published"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Booked Jobs" displayVal = {bookedJobCount} value={"Booked"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Jobs in Progress" displayVal = {inProgressJobCount} value={"In Progress"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectClickable title="Completed Jobs" displayVal={completedJobCount} value={"Job Completed"} handle={this.handleFilterStatusChange} name={"status"} status={filters["status"]}/>
            <DashboardObjectStatic title="% Completed" displayVal = {completedOffersPercent} value={"% Completed"}/>
          </div>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }

  renderJobList() {
    const {loaded} = this.state;
    let {jobs} = this.state;
    let onOfferJobCount = 0;
    let publishedJobCount = 0;
    let bookedJobCount = 0;
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
      if (newJob.status === 'On Offer') {
        onOfferJobCount += 1;
      }
      if (newJob.status === 'Published') {
        publishedJobCount += 1;
      }
      if (newJob.status === 'Booked') {
        bookedJobCount += 1;
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
      // newJob.newRate = `$${newJob.rate}`;

      // newJob.newStartDate = moment(job.startTime).format("MM/DD/YYYY");
      newJob.newStartDate = TFormat.asDate(job.startTime);

      potentialIncome += tempRate * newJob.rateEstimate;

      return newJob;
    });

    jobsCompleted = onOfferJobCount * 20;
    totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    cancelledJobs = 1;
    jobsPerTruck = TFormat.asNumber(onOfferJobCount / 0.7);
    idleTrucks = 1;

    // Jobs completed / Job offers responded to
    completedOffersPercent = TFormat.asPercent((completedJobCount / jobs.length) * 100, 2);

    potentialIncome = TFormat.asMoney(potentialIncome);

    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  Displaying {jobs.length} of {jobs.length}
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
                          name: 'legalName',
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
                          name: 'zipCode',
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
                          name: 'materials',
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

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {/*{this.renderModal()}*/}
          {this.renderNewJobModal()}
          {this.renderGoTo()}
          {this.renderTitle()}
          {this.renderCards()}
          <JobFilter returnJobs={this.returnJobs} ref="filterChild"/>
          {/*{this.renderFilter()}*/}
          {this.renderJobList()}
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
