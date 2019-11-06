import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container, Modal,
  Row
} from 'reactstrap';
import {useTranslation} from 'react-i18next';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import {DashboardObjectStatic} from './DashboardObjectStatic';
import DashboardObjectClickable from './DashboardObjectClickable';
import JobFilter from '../filters/JobFilter';
import JobService from '../../api/JobService';
import ProfileService from '../../api/ProfileService';
import NumberFormatting from '../../utils/NumberFormatting';
import UserService from '../../api/UserService';
import DriverForm from '../drivers/DriverForm';
import PromptDefaultDriverModal from './PromptDefaultDriverModal';

function PageTitle() {
  const {t} = useTranslation();
  return (
    <h3 className="page-title">{t('Job Dashboard')}</h3>
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

class DashboardCarrierPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      jobs: [],
      jobsInfo: [],
      goToDashboard: false,
      goToUpdateJob: false,
      jobId: 0,
      // profile: null
      // Rate Type Button toggle
      filters: {
        status: ''
      },
      page: 0,
      rows: 10,
      totalCount: 10,
      totalJobs: 0,
      defaultDriverPrompt: false
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.returnSelectedMaterials = this.returnSelectedMaterials.bind(this);
    this.handleFilterStatusChange = this.handleFilterStatusChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.returnJobs = this.returnJobs.bind(this);
    this.sortFilters = this.sortFilters.bind(this);
  }

  async componentDidMount() {
    let { defaultDriverPrompt } = { ...this.state };
    const profile = await ProfileService.getProfile();
    const user = await UserService.getUserById(profile.userId);
    if (user.defaultDriverPrompt === true) {
      // TODO need to make a modal here
      // alert('You need to add a default driver!');
      defaultDriverPrompt = true;
    }
    const { jobsInfo, totalJobs } = await this.fetchJobsInfo(profile);
    this.setState({
      profile,
      user,
      jobsInfo,
      totalJobs,
      defaultDriverPrompt,
      loaded: true
    });
  }

  async fetchJobsInfo(profile) {
    const response = await JobService.getCarrierJobsInfo(profile.companyId);
    const jobsInfo = response.data;
    const { totalJobs } = response;
    return { jobsInfo, totalJobs };
  }

  returnJobs(jobs, filters, metadata) {
    const { totalCount } = metadata;

    this.setState({
      jobs,
      filters,
      totalCount
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
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async handleFilterStatusChange({value, name}) {
    const { filters } = { ...this.state};
    if (filters[name] === value) {
      filters[name] = '';
    } else {
      filters[name] = value;
    }
    // clearing filter fields for general jobs based on Status (Top cards)
    filters.equipmentType = [];
    filters.materialType = [];
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

  returnSelectedMaterials() {
    const { filters } = this.state;
    return filters.materialType;
  }

  renderPromptDefaultDriverModal() {
    const {
      defaultDriverPrompt,
      profile,
      user
    } = this.state;
    return (
      <Modal
        isOpen={defaultDriverPrompt}
        toggle={() => { this.setState({defaultDriverPrompt: !defaultDriverPrompt}); }}
        className="driver-modal modal-  dialog--primary modal-dialog--header"
        backdrop="static"
      >
        <div className="modal__body" style={{ padding: '0px' }}>
          <PromptDefaultDriverModal
            profile={profile}
            user={user}
            toggle={() => { this.setState({defaultDriverPrompt: !defaultDriverPrompt}); }}
          />
          {/*<DriverForm*/}
          {/*  toggle={this.toggleAddDriversModal}*/}
          {/*  driverId={0}*/}
          {/*  currentUser={{}}*/}
          {/*  onSuccess={this.handleAddedDriver}*/}
          {/*/>*/}
        </div>
      </Modal>
    );
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (status.goToUpdateJob) {
      return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    }
    return false;
  }

  renderTitle() {
    return (
      <PageTitle />
    );
  }

  renderCards() {
    const { loaded, filters, jobsInfo } = this.state;
    let jobs = jobsInfo;
    let onOfferJobCount = 0;
    let bookedJobCount = 0;
    let inProgressJobCount = 0;
    let completedJobCount = 0;
    let totalPotentialIncome = 0;
    let requestedJobCount = 0;

    if (jobs) {
      jobs = jobs.map((job) => {
        const newJob = job;
        // const tempRate = newJob.rate;
        if (newJob.status === 'On Offer' || newJob.status === 'Published And Offered') {
          // onOfferJobCount += 1;
          onOfferJobCount += newJob.countJobs;
        }
        /* if (newJob.status === 'Published And Offered') {
          // publishedJobCount += 1;
          onOfferJobCount += newJob.countJobs;
        } */
        if (newJob.status === 'Booked') {
          // publishedJobCount += 1;
          bookedJobCount = newJob.countJobs;
        }
        if (newJob.status === 'In Progress') {
          // inProgressJobCount += 1;
          inProgressJobCount = newJob.countJobs;
        }
        if (newJob.status === 'Requested') {
          // NOTE:
          // We need to also see if there is a bid for this carrier for this job
          requestedJobCount = newJob.countJobs;
        }
        if (newJob.status === 'Job Completed') {
          // completedJobCount += 1;
          completedJobCount = newJob.countJobs;
        }
        totalPotentialIncome += (newJob.estimatedEarnings) * 0.95;

        return newJob;
      });
    }

    if (loaded) {
      return (
        <Container className="dashboard">
          {/* {this.renderGoTo()} */}
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
              title="Jobs Requested"
              displayVal={requestedJobCount}
              value="Requested"
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
            {
            /*
            <DashboardObjectStatic
              title="% Completed"
              displayVal = {completedOffersPercent}
            />
            */
            }
            <DashboardObjectStatic
              title={filters.status === 'Job Completed' ? 'Earnings' : 'Potential Earnings'}
              displayVal={TFormat.asMoney(totalPotentialIncome)}
            />
          </div>
        </Container>
      );
    }
    return (
      <DashboardLoading />
    );
  }

  renderJobList() {
    const { profile, loaded } = this.state;
    let { jobs } = this.state;

    let onOfferJobCount = 0;
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
      if ((newJob.status === 'On Offer' || newJob.status === 'Published And Offered') && (newJob.bidHasSchedulerAccepted === 0)) {
        onOfferJobCount += 1;
        newJob.status = 'On Offer';
      }
      if ((newJob.status === 'Published' || newJob.status === 'Published And Offered') && (newJob.bidHasSchedulerAccepted === 1)) {
        newJob.status = 'Requested';
      }
      if (newJob.status === 'Booked') {
        acceptedJobCount += 1;
      }
      if (newJob.status === 'In Progress') {
        inProgressJobCount += 1;
      }
      if (newJob.status === 'Job Completed') {
        completedJobCount += 1;
      }

      if (newJob.rateType === 'Hour') {
        newJob.newSize = newJob.rateEstimate;
        newJob.newSizeF = TFormat.getValue(
          TFormat.asHours(newJob.rateEstimate)
        );
        newJob.newRateF = NumberFormatting.asMoney(
          newJob.rate, '.', 2, ',', '$', '/Hour'
        );
      } else if (newJob.rateType === 'Ton') {
        newJob.newSize = newJob.rateEstimate;
        newJob.newSizeF = TFormat.getValue(
          TFormat.asTons(newJob.rateEstimate)
        );
        newJob.newRateF = NumberFormatting.asMoney(
          newJob.rate, '.', 2, ',', '$', '/Ton'
        );
      }

      newJob.newRate = newJob.rate;
      newJob.potentialIncome = Math.round(tempRate * newJob.rateEstimate);
      newJob.potentialIncomeF = NumberFormatting.asMoney(
        tempRate * newJob.rateEstimate
      );
      newJob.newStartDate = TFormat.asDateTime(job.startTime, profile.timeZone);

      // Where are we getting this distance?
      if (typeof job.distance === 'number') {
        newJob.distance = newJob.distance.toFixed(2);
      }
      if (typeof job.haulDistance === 'number') {
        newJob.haulDistance = newJob.haulDistance.toFixed(2);
      }

      potentialIncome += (tempRate * newJob.rateEstimate) * 0.95;

      return newJob;
    });

    // jobsCompleted = onOfferJobCount * 20;
    potentialIncome = TFormat.asMoney(
      potentialIncome
    );

    if (loaded) {
      const { filters, totalCount, totalJobs} = this.state;
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
                        // {
                        //  name: 'id',
                        //  displayName: 'Job Id'
                        // },
                        {
                          name: 'newStartDate',
                          displayName: 'Start Date'
                        },
                        {
                          name: 'name',
                          displayName: 'Job Name'
                        },
                        {
                          name: 'status',
                          displayName: 'Job Status'
                        },
                        {
                          name: 'companyLegalName',
                          displayName: 'Customer'
                        },
                        {
                          name: 'distance',
                          displayName: 'Distance from Me (mi)'
                        },
                        {
                          name: 'haulDistance',
                          displayName: 'Haul Distance (One Way) (mi)'
                        },
                        {
                          name: 'potentialIncome',
                          displayName: filters.status === 'Job Completed' ? 'Earnings' : 'Potential Earnings',
                          label: 'potentialIncomeF'
                        },
                        {
                          name: 'newRate',
                          displayName: 'Rate',
                          label: 'newRateF'
                        },
                        {
                          name: 'newSize',
                          displayName: 'Size',
                          label: 'newSizeF'
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
    const { loaded, page, rows } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderPromptDefaultDriverModal()}
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
        <Row>
          <Col md={12}>
            <PageTitle />
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default DashboardCarrierPage;
