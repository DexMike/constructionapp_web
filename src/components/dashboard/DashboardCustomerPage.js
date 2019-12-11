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
import {useTranslation} from 'react-i18next';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import JobService from '../../api/JobService';
import ProfileService from '../../api/ProfileService';
import JobCreatePopup from '../jobs/JobCreatePopup';
import JobWizard from '../jobs/JobWizard';
import DashboardObjectClickable from './DashboardObjectClickable';
import {DashboardObjectStatic} from './DashboardObjectStatic';
import JobFilter from '../filters/JobFilter';
import NumberFormatting from '../../utils/NumberFormatting';
import GeoUtils from '../../utils/GeoUtils';
import JobResumePopup from '../jobs/JobResumePopup';
import JobListResumePopup from '../jobs/JobListResumePopup';

function PageTitle() {
  const {t} = useTranslation();
  return (
    <h3 className="page-title">{t('Job Dashboard')}</h3>
  );
}

function AddJobButton({handle}) {
  const {t} = useTranslation();
  return (
    <Button
      onClick={handle}
      type="button"
      className="primaryButton"
      id="addJobButton"
    >
      {t('ADD A JOB')}
    </Button>
  );
}

function PausedJobsButton({handle}) {
  const {t} = useTranslation();
  return (
    <Button
      onClick={handle}
      type="button"
      className="secondaryButton"
      id="pausedJobsButton"
    >
      {t('PAUSED JOBS')}
    </Button>
  );
}

function DashboardLoading () {
  const {t} = useTranslation();
  return (
    <Container className="dashboard">
        {t('Loading...')}
    </Container>
  );
}

function TableLegend({displayed, totalCount, totalJobs}) {
  const {t} = useTranslation();
  return(
    <div className="ml-4 mt-4">
      {t('Displaying')} {displayed} {t('out of')} {totalCount} {t('filtered jobs')} ({totalJobs} {t('total jobs')})
    </div>
  );
}

class DashboardCustomerPage extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    this.state = {
      loaded: false,
      jobs: [],
      jobsInfo: [],
      pausedJobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,
      modalAddJob: false,
      modalAddJobWizard: false,
      modalResumeJob: false,
      modalResumeJobList: false,
      // TODO: Refactor to a single filter object
      // Filter values
      filters: {
        status: ''
      },
      page: 0,
      rows: 10,
      totalCount: 10,
      totalJobs: 0,
      pausedJobId: null,
      pausedJobsListOnFirstLoad: true,
      isLoading: false
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.toggleNewJobModal = this.toggleNewJobModal.bind(this);
    this.toggleNewJobWizardModal = this.toggleNewJobWizardModal.bind(this);
    this.toggleResumeJobModal = this.toggleResumeJobModal.bind(this);
    this.toggleResumeJobListModal = this.toggleResumeJobListModal.bind(this);
    this.handleFilterStatusChange = this.handleFilterStatusChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.returnJobs = this.returnJobs.bind(this);
    this.sortFilters = this.sortFilters.bind(this);
    this.handleEditPausedJob = this.handleEditPausedJob.bind(this);
    this.handleGoToPausedJobList = this.handleGoToPausedJobList.bind(this);
  }

  async componentDidMount() {
    let { rows, totalCount, filters } = this.state;
    const profile = await ProfileService.getProfile();
    await this.fetchJobsInfo(profile);

    if (localStorage.getItem('filters')) {
      filters = JSON.parse(localStorage.getItem('filters'));
      rows = filters.rows;      
    }    
    if (localStorage.getItem('metadata')) {
      const metadata = JSON.parse(localStorage.getItem('metadata'));
      totalCount = metadata.totalCount;
    }

    this.setState({
      // pausedJobs,
      profile,
      loaded: true,
      rows,
      totalCount,
      filters
    });
  }

  async fetchJobsInfo(profile) {
    const response = await JobService.getCustomerJobsInfo(profile.companyId);
    const jobsInfo = response.data;
    const { totalJobs } = response;
    this.setState({ totalJobs, jobsInfo });
  }

  returnJobs(jobs, filters, metadata, pausedJobsList) {
    const { pausedJobsListOnFirstLoad } = this.state;
    const { totalCount } = metadata;

    if (pausedJobsList && pausedJobsList.length > 0 && pausedJobsListOnFirstLoad) {
      this.toggleResumeJobListModal(true);
    }

    localStorage.setItem('filters', JSON.stringify(filters));
    localStorage.setItem('metadata', JSON.stringify(metadata));
    this.setState({
      jobs,
      pausedJobs: pausedJobsList,
      pausedJobsListOnFirstLoad: false,
      filters,
      totalCount
    });
  }

  async handleFilterStatusChange({value, name}) {
    const { filters } = this.state;
    if (filters[name] === value) {
      filters[name] = '';
    } else {
      filters[name] = value;
    }
    this.refs.filterChild.filterWithStatus(filters);
    this.setState({
      filters,
      page: 0
    });
  }

  sortFilters(orderBy, order) {
    const { filters } = this.state;
    const newFilters = filters;
    newFilters.sortBy = orderBy;
    newFilters.order = order;
    this.setState({
      filters: newFilters
    }, function wait() {
      this.refs.filterChild.fetchJobs();
    });
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
    const {filters} = this.state;
    const jobs = await JobService.getJobDashboardByFilters(filters);
    this.setState({jobs});
    return jobs;
  }

  handleJobEdit(id) {
    this.setState({
      goToUpdateJob: true,
      jobId: id
    });
  }

  handleEditPausedJob(pausedJobId) {
    this.toggleResumeJobListModal();
    this.toggleResumeJobModal();
    this.setState({
      pausedJobId
    });
  }

  handleGoToPausedJobList() {
    this.toggleResumeJobModal();
    this.toggleResumeJobListModal();
  }

  handlePageChange(page) {
    this.setState({ page });
  }

  handleRowsPerPage(rows) {
    this.setState({ rows });
  }

  async toggleNewJobModal() {
    const {modalAddJob, filters} = this.state;
    if (modalAddJob) {
      const profile = await ProfileService.getProfile();
      this.fetchJobsInfo(profile);
      this.refs.filterChild.filterWithStatus(filters);
      this.setState({loaded: true});
    }
    this.setState({
      modalAddJob: !modalAddJob
    });
  }

  async toggleNewJobWizardModal() {
    const {modalAddJobWizard, filters} = this.state;
    if (modalAddJobWizard) {
      const profile = await ProfileService.getProfile();
      this.fetchJobsInfo(profile);
      this.refs.filterChild.filterWithStatus(filters);
      this.setState({loaded: true});
    }
    this.setState({
      modalAddJobWizard: !modalAddJobWizard
    });
  }

  toggleResumeJobModal() {
    const {modalResumeJob} = this.state;
    this.setState({
      modalResumeJob: !modalResumeJob
    });
  }

  toggleResumeJobListModal(toggle) {
    const {modalResumeJobList} = this.state;
    if (toggle) {
      this.setState({
        modalResumeJobList: toggle
      });
    } else {
      this.setState({
        modalResumeJobList: !modalResumeJobList
      });
    }
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

  renderResumeJobListModal() {
    const {
      modalResumeJobList,
      pausedJobs,
      profile
    } = this.state;
    return (
      <Modal
        isOpen={modalResumeJobList}
        toggle={this.toggleResumeJobListModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobListResumePopup
          pausedJobs={pausedJobs}
          profile={profile}
          toggle={this.toggleResumeJobListModal}
          onJobSelect={this.handleEditPausedJob}
        />
      </Modal>
    );
  }

  renderResumeJobModal() {
    const {
      modalResumeJob,
      pausedJobId,
      profile
    } = this.state;
    return (
      <Modal
        isOpen={modalResumeJob}
        toggle={this.toggleResumeJobModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobResumePopup
          jobId={pausedJobId}
          profile={profile}
          toggle={this.toggleResumeJobModal}
        />
      </Modal>
    );
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

  renderNewJobWizardModal() {
    const {
      modalAddJobWizard
    } = this.state;
    return (
      <Modal
        isOpen={modalAddJobWizard}
        toggle={this.toggleNewJobWizardModal}
        className="modal-dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <JobWizard
          toggle={this.toggleNewJobWizardModal}
        />
      </Modal>
    );
  }

  renderTitle() {
    const {pausedJobs} = this.state;
    return (
      <Row>
        <Col md={9}>
          <PageTitle />
        </Col>
        <Col md={3} style={{textAlign: 'right'}}>
          <AddJobButton handle={this.toggleNewJobWizardModal}/>
          {pausedJobs && pausedJobs.length > 0 && (
            <PausedJobsButton handle={this.toggleResumeJobListModal}/>
          )}
        </Col>
      </Row>
    );
  }

  renderCards() {
    const {loaded, filters, jobsInfo, totalJobs} = this.state;
    let jobs = jobsInfo;
    let onOfferJobCount = 0;
    let requestedJobCount = 0;
    let publishedJobCount = 0;
    let bookedJobCount = 0;
    let inProgressJobCount = 0;
    let completedJobCount = 0;
    // let potentialIncome = 0;

    // let jobsCompleted = 0;
    // let totalEarnings = 0;
    // let earningsPerJob = 0;
    // let cancelledJobs = 0;
    // let jobsPerTruck = 0;
    // let idleTrucks = 0;
    let completedOffersPercent = 0;

    if (jobs) {
      jobs = jobs.map((job) => {
        const newJob = job;
        // const tempRate = newJob.rate;
        if (newJob.status === 'On Offer') {
          // onOfferJobCount += 1;
          onOfferJobCount = newJob.countJobs;
        }
        if (newJob.status === 'Requested') {
          requestedJobCount = newJob.countJobs;
        }
        if (newJob.status === 'Published') {
          // publishedJobCount += 1;
          publishedJobCount += newJob.countJobs;
        }
        if (newJob.status === 'Published And Offered') {
          // publishedJobCount += 1;
          onOfferJobCount += newJob.countJobs;
          // publishedJobCount += newJob.countJobs;
        }
        if (newJob.status === 'Booked') {
          // publishedJobCount += 1;
          bookedJobCount = newJob.countJobs;
        }
        if (newJob.status === 'In Progress') {
          // inProgressJobCount += 1;
          inProgressJobCount = newJob.countJobs;
        }
        if (newJob.status === 'Job Completed') {
          // completedJobCount += 1;
          completedJobCount = newJob.countJobs;
        }
        // if (newJob.rateType === 'Hour') {
        //   newJob.newSize = TFormat.asHours(newJob.rateEstimate);
        //   newJob.newRate = TFormat.asMoneyByHour(newJob.rate);
        //   newJob.estimatedIncome = TFormat.asMoney(
        //     (tempRate * newJob.rateEstimate) * 0.95
        //   );
        // }
        // if (newJob.rateType === 'Ton') {
        //   newJob.newSize = TFormat.asTons(newJob.rateEstimate);
        //   newJob.newRate = TFormat.asMoneyByTons(newJob.rate);
        //   newJob.estimatedIncome = TFormat.asMoney(
        //     (tempRate * newJob.rateEstimate) * 0.95
        //   );
        // }
        // newJob.newStartDate = TFormat.asDate(job.startTime);
        // potentialIncome += (tempRate * newJob.rateEstimate) * 0.95;
        return newJob;
      });
    }

    // jobsCompleted = onOfferJobCount * 20;
    // totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    // earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    // cancelledJobs = 1;
    // jobsPerTruck = TFormat.asNumber(onOfferJobCount / 0.7);
    // idleTrucks = 1;

    // Jobs completed / Job offers responded to
    // completedOffersPercent = TFormat.asPercent((completedJobCount / jobs.length) * 100, 2);
    completedOffersPercent = TFormat.asPercent((completedJobCount / totalJobs) * 100, 2);

    // potentialIncome = TFormat.asMoney(potentialIncome);

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="row">
            <DashboardObjectClickable
              title="New Offers"
              displayVal={onOfferJobCount}
              value="On Offer"
              handle={this.handleFilterStatusChange}
              name="status"
              status={filters.status}
            />
            <DashboardObjectClickable
              title="Requested by a Carrier"
              displayVal={requestedJobCount}
              value="Requested"
              handle={this.handleFilterStatusChange}
              name="status"
              status={filters.status}
            />
            <DashboardObjectClickable
              title="Posted Jobs"
              displayVal={publishedJobCount}
              value="Published"
              handle={this.handleFilterStatusChange}
              name="status"
              status={filters.status}
            />
            <DashboardObjectClickable
              title="Booked Jobs"
              displayVal={bookedJobCount}
              value="Booked"
              handle={this.handleFilterStatusChange}
              name="status"
              status={filters.status}
            />
            <DashboardObjectClickable
              title="Jobs in Progress"
              displayVal={inProgressJobCount}
              value="In Progress"
              handle={this.handleFilterStatusChange}
              name="status"
              status={filters.status}
            />
            <DashboardObjectClickable
              title="Completed Jobs"
              displayVal={completedJobCount}
              value="Job Completed"
              handle={this.handleFilterStatusChange}
              name="status"
              status={filters.status}
            />
            {/* <DashboardObjectStatic */}
            {/* title="% Completed" */}
            {/* displayVal={completedOffersPercent} */}
            {/* value="% Completed" */}
            {/* /> */}
          </div>
        </Container>
      );
    }
    return (
      <DashboardLoading  />
    );
  }

  renderJobList() {
    const {profile, loaded, totalJobs, totalCount, isLoading, rows} = this.state;
    const { t } = { ...this.props };
    const translate = t;
    let {jobs} = this.state;
    let onOfferJobCount = 0;
    let publishedJobCount = 0;
    let requestedJobCount = 0;
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
      if ((newJob.status === 'Published And Offered' || newJob.status === 'Published') && (newJob.bidStatus === 'Pending' && newJob.bidHasSchedulerAccepted === 1)) {
        requestedJobCount += 1;
        if (newJob.status === 'Published And Offered') {
          newJob.status = 'Requested And Offered';
        }
        if (newJob.status === 'Published') {
          newJob.status = 'Requested';
        }
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
        // newSize is the size with its original value, so that it can be sorted
        newJob.newSize = newJob.rateEstimate;
        // newSizeFormated is the size as we want it to show
        const formatted = TFormat.asHours(newJob.rateEstimate);
        newJob.newSizeFormated = TFormat.getValue(formatted);

        newJob.newRate = newJob.rate;
        newJob.newRateFormatted = NumberFormatting.asMoney(
          newJob.rate, '.', 2, ',', '$', '/Hour'
        );
      }
      if (newJob.rateType === 'Ton') {
        // newSize is the size with its original value, so that it can be sorted
        newJob.newSize = newJob.rateEstimate;
        // newSizeFormated is the size as we want it to show
        const formatted = TFormat.asTons(newJob.rateEstimate);
        newJob.newSizeFormated = TFormat.getValue(formatted);

        newJob.newRate = newJob.rate;
        newJob.newRateFormatted = NumberFormatting.asMoney(
          newJob.rate, '.', 2, ',', '$', '/Ton'
        );
      }

      newJob.estimatedIncome = NumberFormatting.asMoney(
        (tempRate * newJob.rateEstimate), '.', 2, ',', '$', ''
      );
      // newJob.newStartDate = moment(job.startTime).format("MM/DD/YYYY");
      newJob.newStartDate = TFormat.asDateTime(job.startTime, profile.timeZone);

      if (typeof job.distance === 'number') {
        newJob.distance = newJob.distance.toFixed(2);
      }

      if (typeof job.haulDistance === 'number') {
        newJob.haulDistance = newJob.haulDistance.toFixed(2);
      }

      if (!job.companyCarrierLegalName) {
        newJob.companyCarrierLegalName = 'Unassigned';
      }

      potentialIncome += tempRate * newJob.rateEstimate;

      return newJob;
    });

    // jobsCompleted = onOfferJobCount * 20;
    totalEarnings = TFormat.asMoney(potentialIncome * 3.14159);
    earningsPerJob = TFormat.asMoney((potentialIncome * 3.14159) / (jobsCompleted));
    cancelledJobs = 1;
    jobsPerTruck = TFormat.asNumber(onOfferJobCount / 0.7);
    idleTrucks = 1;

    // Jobs completed / Job offers responded to
    completedOffersPercent = TFormat.asPercent((completedJobCount / totalJobs) * 100, 2);

    potentialIncome = TFormat.asMoney(potentialIncome);

    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <Card>
                <CardBody>
                  <TableLegend
                    displayed={TFormat.asWholeNumber(jobs.length)}
                    totalCount={TFormat.asWholeNumber(totalCount)}
                    totalJobs={TFormat.asWholeNumber(totalJobs)}
                  />
                  <TTable
                    columns={
                      [
                        {
                          name: 'name',
                          displayName: 'Job Name'
                        },
                        {
                          name: 'status',
                          displayName: 'Job Status'
                        },
                        {
                          name: 'companyCarrierLegalName',
                          displayName: 'Carrier'
                        },
                        {
                          name: 'newSize',
                          displayName: 'Size',
                          label: 'newSizeFormated'
                        },
                        {
                          name: 'newStartDate',
                          displayName: 'Start Date'
                        },
                        // This is the producer they do not need to see distance to job
                        // {
                        //   name: 'distance',
                        //   displayName: 'Distance to Zip (mi)'
                        // },
                        {
                          name: 'haulDistance',
                          displayName: 'Haul Distance (One Way) (mi)'
                        },
                        {
                          name: 'newRate',
                          displayName: 'Rate',
                          label: 'newRateFormatted'
                        },
                        {
                          // the materials needs to come from the the JobMaterials Table
                          name: 'materials',
                          displayName: 'Materials'
                        }
                      ]
                    }
                    data={jobs}
                    handleIdClick={this.handleJobEdit}
                    handleSortChange={this.sortFilters}
                    handleRowsChange={this.handleRowsPerPage}
                    handlePageChange={this.handlePageChange}
                    totalCount={totalCount}
                    isLoading={isLoading}
                    defaultRows={rows}
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

  renderLoader() {
    return (
      <div className="load loaded inside-page">
        <div className="load__icon-wrap">
          <svg className="load__icon">
            <path fill="rgb(0, 111, 83)" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const {loaded, page, rows} = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {/* {this.renderModal()} */}
          {this.renderNewJobModal()}
          {this.renderNewJobWizardModal()}
          {this.renderResumeJobModal()}
          {this.renderResumeJobListModal()}
          {this.renderGoTo()}
          {this.renderTitle()}
          {this.renderCards()}
          <JobFilter
            returnJobs={this.returnJobs}
            page={page}
            rows={rows}
            ref="filterChild"
            isLoading={(e) => this.setState({isLoading: e})}  
          />
          {/* {this.renderFilter()} */}
          {this.renderJobList()}
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        {<Row>
          <Col md={12}>
            <PageTitle />
          </Col>
        </Row>}
        {this.renderLoader()}
      </Container>
    );
  }
}

// DashboardCustomerPage.propTypes = {
//   companyId: PropTypes.number.isRequired
// };

export default DashboardCustomerPage;
