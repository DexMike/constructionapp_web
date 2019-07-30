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

import DashboardObjectClickable from './DashboardObjectClickable';
import {DashboardObjectStatic} from './DashboardObjectStatic';
import JobFilter from '../filters/JobFilter';


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
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,
      modalAddJob: false,
      // TODO: Refactor to a single filter object
      // Filter values
      filters: {
        status: ''
      },
      page: 0,
      rows: 10,
      totalCount: 10,
      totalJobs: 0
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.toggleNewJobModal = this.toggleNewJobModal.bind(this);
    this.handleFilterStatusChange = this.handleFilterStatusChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.returnJobs = this.returnJobs.bind(this);
  }

  async componentDidMount() {
    await this.fetchJobsInfo();
    this.setState({ loaded: true });
  }

  async fetchJobsInfo() {
    const profile = await ProfileService.getProfile();
    const response = await JobService.getCustomerJobsInfo(profile.companyId);
    const jobsInfo = response.data;
    const { totalJobs } = response;
    this.setState({ totalJobs, jobsInfo });
  }

  returnJobs(jobs, filters, metadata) {
    const { totalCount } = metadata;
    this.setState({
      jobs,
      filters,
      totalCount
    });
  }

  async handleFilterStatusChange({value, name}) {
    const {filters} = this.state;
    if (filters[name] === value) {
      filters[name] = '';
    } else {
      filters[name] = value;
    }
    // clearing filter fields for general jobs based on Status (Top cards)
    filters.equipmentType = [];
    filters.startAvailability = '';
    filters.endAvailability = '';
    delete filters.rateType;
    filters.rate = '';
    filters.minTons = '';
    filters.minHours = '';
    filters.minCapacity = '';
    filters.numEquipments = '';
    filters.zipCode = '';
    filters.range = '';
    this.refs.filterChild.filterWithStatus(filters);
    this.setState({
      filters,
      page: 0
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

  handlePageChange(page) {
    this.setState({ page });
  }

  handleRowsPerPage(rows) {
    this.setState({ rows });
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
      this.fetchJobsInfo();
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
          <PageTitle />
        </Col>
        <Col md={2}>
          <AddJobButton handle={this.toggleNewJobModal}/>
        </Col>
      </Row>
    );
  }

  renderCards() {
    const {loaded, filters, jobsInfo, totalJobs} = this.state;
    let jobs = jobsInfo;
    let onOfferJobCount = 0;
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
        if (newJob.status === 'Published') {
          // publishedJobCount += 1;
          publishedJobCount += newJob.countJobs;
        }
        if (newJob.status === 'Published And Offered') {
          // publishedJobCount += 1;
          onOfferJobCount += newJob.countJobs;
          publishedJobCount += newJob.countJobs;
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
            <DashboardObjectStatic
              title="% Completed"
              displayVal={completedOffersPercent}
              value="% Completed"
            />
          </div>
        </Container>
      );
    }
    return (
      <DashboardLoading  />
    );
  }

  renderJobList() {
    const {loaded, totalJobs, totalCount} = this.state;
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
        // newSize is the size with its original value, so that it can be sorted
        newJob.newSize = newJob.rateEstimate;
        // newSizeFormated is the size as we want it to show
        const formatted = TFormat.asHours(newJob.rateEstimate);
        newJob.newSizeFormated = TFormat.getValue(formatted);

        newJob.newRate = newJob.rate;
        newJob.newRateFormatted = TFormat.getValue(TFormat.asMoneyByHour(newJob.rate));
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }
      if (newJob.rateType === 'Ton') {
        // newSize is the size with its original value, so that it can be sorted
        newJob.newSize = newJob.rateEstimate;
        // newSizeFormated is the size as we want it to show
        const formatted = TFormat.asTons(newJob.rateEstimate);
        newJob.newSizeFormated = TFormat.getValue(formatted);

        newJob.newRate = newJob.rate;
        newJob.newRateFormatted = TFormat.getValue(TFormat.asMoneyByTons(newJob.rate));
        newJob.estimatedIncome = TFormat.asMoney(tempRate * newJob.rateEstimate);
      }

      // newJob.newStartDate = moment(job.startTime).format("MM/DD/YYYY");
      newJob.newStartDate = TFormat.asDate(job.startTime);

      if (typeof job.distance === 'number') {
        newJob.distance = newJob.distance.toFixed(2);
      }

      if (!job.companyCarrierLegalName) {
        newJob.companyCarrierLegalName = 'Unassigned';
      }

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
                        {
                          name: 'distance',
                          displayName: 'Distance (mi)'
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
                    handleRowsChange={this.handleRowsPerPage}
                    handlePageChange={this.handlePageChange}
                    totalCount={totalCount}
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
          {this.renderGoTo()}
          {this.renderTitle()}
          {this.renderCards()}
          <JobFilter
            returnJobs={this.returnJobs}
            page={page}
            rows={rows}
            ref="filterChild"
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
