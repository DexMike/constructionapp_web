import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {Card, CardBody, Col, Container, Row} from 'reactstrap';
// import moment from 'moment';
// Button,
// import PropTypes from 'prop-types';
// import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import TSelect from '../common/TSelect';
import TDateTimePicker from '../common/TDateTimePicker';
import JobService from '../../api/JobService';
import ProfileService from '../../api/ProfileService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';
import AddressService from '../../api/AddressService';
import customerProductMetrics from '../../img/Customer_ProductMetrics.png';
import customerCarrierMetrics from '../../img/Customer_CarrierMetrics.png';
import customerProjectMetrics from '../../img/Customer_ProjectMetrics.png';
import './Reports.css';

// NOTE: this is a copy of DashboardCustomerPage

class ReportsCustomerPage extends Component {
  constructor(props) {
    super(props);
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];
    // Fixed options for Time Range filtering

    this.timeRanges = [
      {
        name: 'Custom',
        value: 0
      },
      {
        name: 'Last Week',
        value: 7
      },
      {
        name: 'Last 30 days',
        value: 30
      },
      {
        name: 'Last 60 days',
        value: 60
      },
      {
        name: 'Last 90 days',
        value: 90
      }
      // { name: 'Next Week', value: -7 },
      // { name: 'Next 30 days', value: -30 },
      // { name: 'Next 60 days', value: -60 },
      // { name: 'Next 90 days', value: -90 }
    ];

    this.state = {
      loaded: false,
      jobs: [],
      jobsComp: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,

      startDate: null,      // Baseline Start Date
      endDate: null,        // Baseline End Date
      startDateComp: null,  // Comparison Start Date
      endDateComp: null,    // Comparison End Date

      selectIndex: 2, // Parameter for setting the dropdown default option.
      selectedRange: 0, // Parameter for setting startDate.
      // ↑ Prameter for enable/disable the datePickers if 'Custom' option is selected or not.

      selectIndexComp: 3, // Parameter for setting the dropdown default option.
      selectedRangeComp: 0, // Parameter for setting startDate.

      filters: { // Filter object for the first Jobs response
        companiesId: 0,
        rateType: '',

        startAvailability: null,
        endAvailability: null,
        startAvailDateComp: null,    // Comparison
        endAvailDateComp: null,      // Comparison
                                     // NOTE: I don't know if these fields works or exists on the backend for filters
        rate: 'Any',
        minTons: 'Any',
        minHours: '',
        minCapacity: '',
        searchType: 'Customer Job',
        userId: '',

        equipmentType: [],
        numEquipments: '',
        zipCode: '',
        materialType: [],

        sortBy: sortByList[0]

      },
      // ↓ Based on the previous NOTE, added a second filter object for the second Jobs response
      filtersComp: {
        companiesId: 0,
        rateType: '',

        startAvailability: null,
        endAvailability: null,

        rate: 'Any',
        minTons: 'Any',
        minHours: '',
        minCapacity: '',

        equipmentType: [],
        numEquipments: '',
        zipCode: '',
        materialType: [],

        sortBy: sortByList[0]
      }
      // profile: null
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.handleSelectFilterChange = this.handleSelectFilterChange.bind(this);
    this.handleSelectFilterChangeComp = this.handleSelectFilterChangeComp.bind(this);
    this.startDateChange = this.startDateChange.bind(this);
    this.endDateChange = this.endDateChange.bind(this);
    this.startDateCompChange = this.startDateCompChange.bind(this);
    this.endDateCompChange = this.endDateCompChange.bind(this);
  }

  async componentDidMount() {
    const {filters, filtersComp, selectIndex, selectIndexComp} = this.state;
    let {
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectedRange,
      selectedRangeComp
    } = this.state;

    const profile = await ProfileService.getProfile();
    if (profile.companyId) {
      filters.companiesId = profile.companyId;
      filtersComp.companiesId = profile.companyId;
    }
    filters.userId = profile.userId;

    selectedRange = this.timeRanges[selectIndex].value;
    const currentDate = new Date();
    startDate = new Date();
    endDate = currentDate;
    startDate.setDate(currentDate.getDate() - selectedRange);
    filters.startAvailability = startDate;
    filters.endAvailability = endDate;

    const jobs = await this.fetchJobs(filters);
    if (jobs) {
      jobs.map(async (job) => {
        const newJob = job;

        const company = await CompanyService.getCompanyById(newJob.companiesId);
        newJob.companyName = company.legalName;

        const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        const materials = materialsList.map(materialItem => materialItem.value);
        newJob.material = this.equipmentMaterialsAsString(materials);

        const address = await AddressService.getAddressById(newJob.startAddress);
        newJob.zip = address.zipCode;

        return newJob;
      });
    }
    // console.log('First Filter Jobs', jobs);

    // Added a copy of the previous code but using it for the second filter mainly for testing
    selectedRangeComp = this.timeRanges[selectIndexComp].value;
    const currentDate2 = new Date();
    startDateComp = new Date();
    endDateComp = currentDate2;
    startDateComp.setDate(currentDate2.getDate() - selectedRangeComp);
    filtersComp.startAvailability = startDateComp;
    filtersComp.endAvailability = endDateComp;

    const jobsComp = await this.fetchJobs(filtersComp);
    if (jobsComp) {
      jobsComp.map(async (job) => {
        const newJob = job;

        const company = await CompanyService.getCompanyById(newJob.companiesId);
        newJob.companyName = company.legalName;

        const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
        const materials = materialsList.map(materialItem => materialItem.value);
        newJob.material = this.equipmentMaterialsAsString(materials);

        const address = await AddressService.getAddressById(newJob.startAddress);
        newJob.zip = address.zipCode;

        return newJob;
      });
    }
    // console.log('Second Filter Jobs', jobsComp);

    this.setState({
      loaded: true,
      jobs,
      jobsComp,
      filters,
      filtersComp,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectedRange,
      selectedRangeComp
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

  async fetchJobs(filters) {
    /*
    const profile = await ProfileService.getProfile();
    const { companyId } = profile;
    const jobs = await JobService.getJobsByCompanyIdAndCustomerAccepted(companyId);
    */
    const jobs = await JobService.getJobByFilters(filters);

    if (jobs) {
      // if (jobs != null) {
      //   jobs.map((job) => {
      //     const newJob = job;
      //     // newJob.modifiedOn = moment(job.modifiedOn)
      //     //   .format();
      //     // newJob.createdOn = moment(job.createdOn)
      //     //   .format();
      //     return job;
      //   });
      // }
      this.setState({jobs});
    }
    return jobs;
  }

  async fetchAllJobs() {
    const jobs = await JobService.getJobs();
    if (jobs) {
      // if (jobs != null) {
      //   jobs.map((job) => {
      //     const newJob = job;
      //     newJob.modifiedOn = moment(job.modifiedOn)
      //       .format();
      //     newJob.createdOn = moment(job.createdOn)
      //       .format();
      //     return job;
      //   });
      // }
    }
    return jobs;
  }

  async handleSelectFilterChange(option) {
    const {value, name} = option;
    const {filters} = this.state;
    let {
      jobsComp,
      startDate,
      endDate,
      selectedRange,
      selectIndex
    } = this.state;

    selectIndex = this.timeRanges.findIndex(x => x.name === name);

    selectedRange = value;

    const currentDate = new Date();
    startDate = new Date();
    endDate = currentDate;
    startDate.setDate(currentDate.getDate() - selectedRange);
    filters.startAvailability = startDate;
    filters.endAvailability = endDate;

    const jobs = await this.fetchJobs(filters);
    // console.log('First Filter Jobs', jobs);
    // console.log('Second Filter Jobs', jobsComp);
    this.setState({
      jobs,
      loaded: true,
      filters,
      startDate,
      endDate,
      selectedRange,
      selectIndex
    });
  }

  async handleSelectFilterChangeComp(option) {
    const {value, name} = option;
    const {filtersComp} = this.state;
    let {
      jobs,
      startDateComp,
      endDateComp,
      selectedRangeComp,
      selectIndexComp
    } = this.state;

    selectIndexComp = this.timeRanges.findIndex(x => x.name === name);

    selectedRangeComp = value;

    const currentDate = new Date();
    startDateComp = new Date();
    endDateComp = currentDate;
    startDateComp.setDate(currentDate.getDate() - selectedRangeComp);
    filtersComp.startAvailability = startDateComp;
    filtersComp.endAvailability = endDateComp;

    const jobsComp = await this.fetchJobs(filtersComp);
    // console.log('First Filter Jobs', jobs);
    // console.log('Second Filter Jobs', jobsComp);

    this.setState({
      jobsComp,
      loaded: true,
      filtersComp,
      startDateComp,
      endDateComp,
      selectedRangeComp,
      selectIndexComp
    });
  }

  async startDateChange(data) {
    const {filters, endDate} = this.state;
    let {startDate} = this.state;

    startDate = data;
    filters.startAvailability = startDate;
    const jobs = await this.fetchJobs(filters);

    this.isCustomRange(startDate, endDate);
    this.setState({
      jobs,
      startDate,
      filters
    });
  }

  async startDateCompChange(data) {
    const {filters, endDateComp} = this.state;
    let {startDateComp} = this.state;

    startDateComp = data;
    filters.startAvailDateComp = startDateComp;
    const jobs = await this.fetchJobs(filters);

    this.isCustomRangeComp(startDateComp, endDateComp);
    this.setState({
      jobs,
      startDateComp,
      filters
    });
  }

  async endDateChange(data) {
    const {filters, startDate} = this.state;
    let {endDate} = this.state;

    endDate = data;
    filters.endAvailability = endDate;
    const jobs = await this.fetchJobs(filters);

    this.isCustomRange(startDate, endDate);
    this.setState({
      jobs,
      endDate,
      filters
    });
  }

  async endDateCompChange(data) {
    const {filters, startDateComp} = this.state;
    let {endDateComp} = this.state;

    endDateComp = data;
    filters.endAvailDateComp = endDateComp;
    const jobs = await this.fetchJobs(filters);

    this.isCustomRangeComp(startDateComp, endDateComp);
    this.setState({
      jobs,
      endDateComp,
      filters
    });
  }

  formatDate(date) {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return (date.toLocaleDateString('en-US', options));
  }

  async isCustomRange(startDate, endDate) {
    let {selectIndex} = this.state;
    const startDateId = `${startDate.getDate()}${startDate.getMonth()}${startDate.getFullYear()}`;
    const endDateId = `${endDate.getDate()}${endDate.getMonth()}${endDate.getFullYear()}`;

    const currentDate = new Date();
    const currentDateId = `${currentDate.getDate()}${currentDate.getMonth()}${currentDate.getFullYear()}`;

    if (endDateId === currentDateId) {
      for (let i = 1; i < this.timeRanges.length; i += 1) {
        currentDate.setDate(currentDate.getDate() - this.timeRanges[i].value);
        const lastDateId = `${currentDate.getDate()}${currentDate.getMonth()}${currentDate.getFullYear()}`;
        currentDate.setDate(currentDate.getDate() + this.timeRanges[i].value);
        if (startDateId === lastDateId) {
          selectIndex = i;
          i = this.timeRanges.length;
        } else {
          selectIndex = 0;
        }
      }
    } else {
      selectIndex = 0;
    }

    this.setState({
      selectIndex
    });
  }

  async isCustomRangeComp(startDate, endDate) {
    let {selectIndexComp} = this.state;
    const startDateId = `${startDate.getDate()}${startDate.getMonth()}${startDate.getFullYear()}`;
    const endDateId = `${endDate.getDate()}${endDate.getMonth()}${endDate.getFullYear()}`;

    const currentDate = new Date();
    const currentDateId = `${currentDate.getDate()}${currentDate.getMonth()}${currentDate.getFullYear()}`;

    if (endDateId === currentDateId) {
      for (let i = 1; i < this.timeRanges.length; i += 1) {
        currentDate.setDate(currentDate.getDate() - this.timeRanges[i].value);
        const lastDateId = `${currentDate.getDate()}${currentDate.getMonth()}${currentDate.getFullYear()}`;
        currentDate.setDate(currentDate.getDate() + this.timeRanges[i].value);
        if (startDateId === lastDateId) {
          selectIndexComp = i;
          i = this.timeRanges.length;
        } else {
          selectIndexComp = 0;
        }
      }
    } else {
      selectIndexComp = 0;
    }

    this.setState({
      selectIndexComp
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

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Find a Job</h3>
        </Col>
      </Row>
    );
  }

  renderFilter() {
    const {
      loaded,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectIndex,
      selectIndexComp
    } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="row date-filter">
            <div className="col-12 col-md-12 col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-4 col-md-3 col-lg-2 form__form-group">
                      <span className="form__form-group-label">BASELINE&nbsp;</span>
                      <span className="form__form-group-label">Time Range</span>
                      <TSelect
                        input={
                          {
                            onChange: this.handleSelectFilterChange,
                            name: this.timeRanges[selectIndex].name,
                            value: this.timeRanges[selectIndex].value
                          }
                        }
                        value={this.timeRanges[selectIndex].value.toString()}
                        options={
                          this.timeRanges.map(timeRange => ({
                            name: timeRange.name,
                            value: timeRange.value.toString(),
                            label: timeRange.name
                          }))
                        }
                        placeholder={this.timeRanges[selectIndex].name}
                      />
                    </div>
                    <div className="col-sm-4 col-md-3 col-lg-2 form__form-group">
                      <span className="form__form-group-label">From</span>
                      <div className="row">
                        <div className="col-12">
                          <TDateTimePicker
                            input={
                              {
                                onChange: this.startDateChange,
                                name: 'startAvailability',
                                value: {startDate},
                                givenDate: new Date(startDate).getTime()
                              }
                            }
                            placeholderDate={startDate}
                            onChange={this.startDateChange}
                            dateFormat="m/d/Y"
                          />

                        </div>
                        <i className="material-icons iconSet calendarIcon">calendar_today</i>
                      </div>
                    </div>
                    <div className="col-sm-4 col-md-3 col-lg-2 form__form-group">
                      <span className="form__form-group-label">To</span>
                      <div className="row">
                        <div className="col-12">
                          <TDateTimePicker
                            input={
                              {
                                onChange: this.endDateChange,
                                name: 'endAvailability',
                                value: {endDate},
                                givenDate: new Date(endDate).getTime()
                              }
                            }
                            placeholderDate={endDate}
                            onChange={this.endDateChange}
                            dateFormat="m/d/Y"
                          />
                        </div>
                        <i className="material-icons iconSet calendarIcon">calendar_today</i>
                      </div>
                    </div>

                    <div className="col-sm-4 col-md-3 col-lg-2 form__form-group">
                      <span className="form__form-group-label">COMPARISON&nbsp;</span>
                      <span className="form__form-group-label">Time Range</span>
                      <TSelect
                        input={
                          {
                            onChange: this.handleSelectFilterChangeComp,
                            name: this.timeRanges[selectIndexComp].name,
                            value: this.timeRanges[selectIndexComp].value
                          }
                        }
                        value={this.timeRanges[selectIndexComp].value.toString()}
                        options={
                          this.timeRanges.map(timeRange => ({
                            name: timeRange.name,
                            value: timeRange.value.toString(),
                            label: timeRange.name
                          }))
                        }
                        placeholder={this.timeRanges[selectIndexComp].name}
                      />
                    </div>
                    <div className="col-sm-4 col-md-3 col-lg-2 form__form-group">
                      <span className="form__form-group-label">From</span>
                      <div className="row">
                        <div className="col-12">
                          <TDateTimePicker
                            input={
                              {
                                onChange: this.startDateCompChange,
                                name: 'startAvailDateComp',
                                value: {startDateComp},
                                givenDate: new Date(startDateComp).getTime()
                              }
                            }
                            placeholderDate={startDateComp}
                            onChange={this.startDateCompChange}
                            dateFormat="m/d/Y"
                          />

                        </div>
                        <i className="material-icons iconSet calendarIcon">calendar_today</i>
                      </div>
                    </div>
                    <div className="col-sm-4 col-md-3 col-lg-2 form__form-group">
                      <span className="form__form-group-label">To</span>
                      <div className="row">
                        <div className="col-12">
                          <TDateTimePicker
                            input={
                              {
                                onChange: this.endDateCompChange,
                                name: 'endAvailDateComp',
                                value: {endDateComp},
                                givenDate: new Date(endDateComp).getTime()
                              }
                            }
                            placeholderDate={endDateComp}
                            onChange={this.endDateCompChange}
                            dateFormat="m/d/Y"
                          />
                        </div>
                        <i className="material-icons iconSet calendarIcon">calendar_today</i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading Carrier Reports Page...
      </Container>
    );
  }

  renderTopCards() {
    const {
      loaded,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectIndex,
      selectIndexComp
    } = this.state;
    let {jobs} = this.state;
    let newJobCount = 0;
    let acceptedJobCount = 0;
    const totalJobs = jobs.length;
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
    if (loaded) {
      return (
        <Container className="dashboard">
          {/*<div className="card-body">*/}
          {/*  <div className="row">*/}
          {/*    <div className="col-12 col-sm-12 col-md-4 col-lg-3">*/}
          {/*      <div className="card">*/}
          {/*        <div className="dashboard__card-widget card-body">*/}
          {/*          <h5 className="card__title bold-text">Jobs In Progress</h5>*/}
          {/*          <span><h4>{inProgressJobCount}</h4></span>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}

          {/*    <div className="col-12 col-sm-12 col-md-4 col-lg-3">*/}
          {/*      <div className="card">*/}
          {/*        <div className="dashboard__card-widget card-body">*/}
          {/*          <h5 className="card__title bold-text">Booked Jobs</h5>*/}
          {/*          <span><h4>{acceptedJobCount}</h4></span>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}

          {/*    /!*<div className="col-12 col-sm-12 col-md-4 col-lg-3">*!/*/}
          {/*      /!*<div className="card">*!/*/}
          {/*        /!*<div className="dashboard__card-widget card-body">*!/*/}
          {/*          /!*<h5 className="card__title bold-text">New Offers</h5>*!/*/}
          {/*          /!*<span><h4>{newJobCount}</h4></span>*!/*/}
          {/*        /!*</div>*!/*/}
          {/*      /!*</div>*!/*/}
          {/*    /!*</div>*!/*/}

          {/*    /!*<div className="col-12 col-sm-12 col-md-4 col-lg-3">*!/*/}
          {/*      /!*<div className="card">*!/*/}
          {/*        /!*<div className="dashboard__card-widget card-body">*!/*/}
          {/*          /!*<h5 className="card__title bold-text">Potential Earnings</h5>*!/*/}
          {/*          /!*<div className="my-auto">*!/*/}
          {/*            /!*<span><h4>{potentialIncome}</h4></span>*!/*/}
          {/*          /!*</div>*!/*/}
          {/*        /!*</div>*!/*/}
          {/*      /!*</div>*!/*/}
          {/*    /!*</div>*!/*/}

          {/*    <div className="col-12 col-sm-12 col-md-4 col-lg-3">*/}
          {/*      <div className="card">*/}
          {/*        <div className="dashboard__card-widget card-body">*/}
          {/*          <div className="my-auto">*/}
          {/*            <h5 className="card__title bold-text">Job Completion Rate</h5>*/}
          {/*            <span><h4>{completedOffersPercent}</h4></span>*/}
          {/*            <div className="text-center pt-3">*/}
          {/*              <span className="form__form-group-label">completed:</span>&nbsp;<span>{completedJobCount}</span>*/}
          {/*              &nbsp;&nbsp;*/}
          {/*              <span className="form__form-group-label">created:</span>&nbsp;<span>{totalJobs}</span>*/}
          {/*            </div>*/}
          {/*          </div>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}

          {/*    <div className="col-12 col-sm-12 col-md-4 col-lg-3">*/}
          {/*      <div className="card">*/}
          {/*        <div className="dashboard__card-widget card-body">*/}
          {/*          <h5 className="card__title bold-text">Completed Jobs</h5>*/}
          {/*          <span><h4>{completedJobCount}</h4></span>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </div>*/}

          {/*</div>*/}
        </Container>
      );
    }
    return (
      <Container>
        Loading Carrier Reports Page...
      </Container>
    );
  }

  renderComparisonCardReports() {
    const {
      loaded,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectIndex,
      selectIndexComp
    } = this.state;
    let {jobs} = this.state;
    let newJobCount = 0;
    let acceptedJobCount = 0;
    const totalJobs = jobs.length;
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
    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="text-center">
            {/*<Row>*/}
            {/*  <Col md={12}>*/}
            {/*    <h3*/}
            {/*      className="page-title">{this.timeRanges[selectIndex].name} (From {this.formatDate(startDate)} To {this.formatDate(endDate)})</h3>*/}
            {/*    <h3*/}
            {/*      className="page-title">{this.timeRanges[selectIndexComp].name} (From {this.formatDate(startDateComp)} To {this.formatDate(endDateComp)})</h3>*/}
            {/*  </Col>*/}
            {/*</Row>*/}
            <div className="row">
              <div className="col-md-2">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text">
                      Jobs Completed
                    </h5>
                    <span><h4>{jobsCompleted}</h4></span>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text">
                      Total Earnings
                    </h5>
                    <span><h4>{totalEarnings}</h4></span>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text">
                      Average Earnings / Job
                    </h5>
                    <span><h4>{earningsPerJob}</h4></span>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text">
                      Tons Delivered
                    </h5>
                    <span><h4>34,567</h4></span>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text">
                      Average Rate / hr
                    </h5>
                    <span><h4>$50.00</h4></span>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text">
                      Average Rate / ton
                    </h5>
                    <span><h4>$50.00</h4></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading Carrier Reports Page...
      </Container>
    );
  }

  renderAdditionalReports() {
    const {
      loaded,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectIndex
    } = this.state;
    let {jobs} = this.state;
    let newJobCount = 0;
    let acceptedJobCount = 0;
    const totalJobs = jobs.length;
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
    if (loaded) {
      return (
        <Container className="dashboard">

          <div className="card-body">

            <Row>
              <Col md={12}>
                <h3 className="page-title">Additional Reports</h3>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Card>
                  <CardBody>
                    Report #1
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Card>
                  <CardBody>
                    Report #2
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Card>
                  <CardBody>
                    Report #3
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading Carrier Reports Page...
      </Container>
    );
  }

  renderMaterialMetrics() {
    const {
      loaded,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectIndex,
      selectIndexComp
    } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="card-body">

            {/*<Row>*/}
            {/*  <Col md={12}>*/}
            {/*    <h3 className="page-title">Product Metrics</h3>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            <Row>
              <div className="col-md-12 mt-1">
                <img width="100%" height="100%" src={customerProductMetrics} alt=""
                />
              </div>
            </Row>

            {/*<Row>*/}
            {/*  <Col md={6}>*/}
            {/*    <div*/}
            {/*      className="card__title bold-text">Baseline {this.timeRanges[selectIndex].name} (From {this.formatDate(startDate)} To {this.formatDate(endDate)})*/}
            {/*    </div>*/}
            {/*  </Col>*/}
            {/*  <Col md={6}>*/}
            {/*    <div*/}
            {/*      className="card__title bold-text">Comparison {this.timeRanges[selectIndexComp].name} (From {this.formatDate(startDateComp)} To {this.formatDate(endDateComp)})*/}
            {/*    </div>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<Row>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Material</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text"># of Loads</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Cost</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Tons</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Ton</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Hr</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Material</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text"># of Loads</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Cost</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Tons</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Ton</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Hr</div>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<div>*/}
            {/*  {this.renderMaterialMetricsRow('RMA')}*/}
            {/*  {this.renderMaterialMetricsRow('Stone')}*/}
            {/*  {this.renderMaterialMetricsRow('Sand')}*/}
            {/*  {this.renderMaterialMetricsRow('Gravel')}*/}
            {/*  {this.renderMaterialMetricsRow('Recycling')}*/}
            {/*  {this.renderMaterialMetricsRow('Other')}*/}
            {/*  {this.renderMaterialMetricsRow('TOTALS')}*/}
            {/*</div>*/}
          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading Carrier Reports Page...
      </Container>
    );
  }

  renderMaterialMetricsRow(row) {
    return (
      <React.Fragment>
        <Row>
          <Col md={1}>
            <span className="form__form-group-label">{row}</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">15</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 23,456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">23,456</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 56.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 56.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">{row}</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">175</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 23,456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">23,456</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 456.00</span>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderCarrierMetrics() {
    const {
      loaded,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectIndex,
      selectIndexComp
    } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="card-body">

            {/*<Row>*/}
            {/*  <Col md={12}>*/}
            {/*    <h3 className="page-title">Carrier Metrics</h3>*/}
            {/*  </Col>*/}
            {/*</Row>*/}
            <Row>
              <div className="col-md-12 mt-1">
                <img width="100%" height="100%" src={customerCarrierMetrics} alt=""
                />
              </div>
            </Row>

            {/*<Row>*/}
            {/*  <Col md={6}>*/}
            {/*    <div*/}
            {/*      className="card__title bold-text">Baseline {this.timeRanges[selectIndex].name} (From {this.formatDate(startDate)} To {this.formatDate(endDate)})*/}
            {/*    </div>*/}
            {/*  </Col>*/}
            {/*  <Col md={6}>*/}
            {/*    <div*/}
            {/*      className="card__title bold-text">Comparison {this.timeRanges[selectIndexComp].name} (From {this.formatDate(startDateComp)} To {this.formatDate(endDateComp)})*/}
            {/*    </div>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<Row>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Carrier</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text"># of Loads</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Earnings</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Tons</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Ton</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Hr</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Carrier</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text"># of Loads</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Earnings</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Tons</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Ton</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Hr</div>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<div>*/}
            {/*  {this.renderCarrierMetricsRow('Irging Construction')}*/}
            {/*  {this.renderCarrierMetricsRow('Midlo Quarry')}*/}
            {/*  {this.renderCarrierMetricsRow('TexasTexas Dirt')}*/}
            {/*  {this.renderCarrierMetricsRow('Grovel R Us')}*/}
            {/*  {this.renderCarrierMetricsRow('Dump Buddies')}*/}
            {/*</div>*/}
          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading Carrier Reports Page...
      </Container>
    );
  }

  renderCarrierMetricsRow(row) {
    return (
      <React.Fragment>
        <Row>
          <Col md={1}>
            <span className="form__form-group-label">{row}</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">15</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 23,456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">23,456</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 56.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 56.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">{row}</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">175</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 23,456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">23,456</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 456.00</span>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderCustomerMetrics() {
    const {
      loaded,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectIndex,
      selectIndexComp
    } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="card-body">

            {/*<Row>*/}
            {/*  <Col md={12}>*/}
            {/*    <h3 className="page-title">Project Metrics</h3>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            <Row>
              <div className="col-md-12 mt-1">
                <img width="100%" height="100%" src={customerProjectMetrics} alt=""
                />
              </div>
            </Row>

            {/*<Row>*/}
            {/*  <Col md={6}>*/}
            {/*    <div*/}
            {/*      className="card__title bold-text">Baseline {this.timeRanges[selectIndex].name} (From {this.formatDate(startDate)} To {this.formatDate(endDate)})*/}
            {/*    </div>*/}
            {/*  </Col>*/}
            {/*  <Col md={6}>*/}
            {/*    <div*/}
            {/*      className="card__title bold-text">Comparison {this.timeRanges[selectIndexComp].name} (From {this.formatDate(startDateComp)} To {this.formatDate(endDateComp)})*/}
            {/*    </div>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<Row>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Customer</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text"># of Loads</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Earnings</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Tons</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Ton</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Hr</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Customer</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text"># of Loads</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Earnings</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Tons</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Ton</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg $/Hr</div>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<div>*/}
            {/*  {this.renderCustomerMetricsRow('DFW Airport')}*/}
            {/*  {this.renderCustomerMetricsRow('Midland Quarry')}*/}
            {/*  {this.renderCustomerMetricsRow('Dirt USA')}*/}
            {/*  {this.renderCustomerMetricsRow('Us')}*/}
            {/*  {this.renderCustomerMetricsRow('Buddy Dump 3')}*/}
            {/*</div>*/}
          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading Carrier Reports Page...
      </Container>
    );
  }

  renderCustomerMetricsRow(row) {
    return (
      <React.Fragment>
        <Row>
          <Col md={1}>
            <span className="form__form-group-label">{row}</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">15</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 23,456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">23,456</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 56.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 56.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">{row}</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">175</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 23,456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">23,456</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 456.00</span>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  renderSiteMetrics() {
    const {
      loaded,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectIndex,
      selectIndexComp
    } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="card-body">

            {/*<Row>*/}
            {/*  <Col md={12}>*/}
            {/*    <h3 className="page-title">Site Metrics</h3>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<Row>*/}
            {/*  <Col md={6}>*/}
            {/*    <div*/}
            {/*      className="card__title bold-text">Baseline {this.timeRanges[selectIndex].name} (From {this.formatDate(startDate)} To {this.formatDate(endDate)})*/}
            {/*    </div>*/}
            {/*  </Col>*/}
            {/*  <Col md={6}>*/}
            {/*    <div*/}
            {/*      className="card__title bold-text">Comparison {this.timeRanges[selectIndexComp].name} (From {this.formatDate(startDateComp)} To {this.formatDate(endDateComp)})*/}
            {/*    </div>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<Row>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Site</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text"># of Loads</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Earnings</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Tons</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg Time Spent</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg Idle Time</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Site</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text"># of Loads</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Earnings</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Tons</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg Time Spent</div>*/}
            {/*  </Col>*/}
            {/*  <Col md={1}>*/}
            {/*    <div className="card__title bold-text">Avg Idle Time</div>*/}
            {/*  </Col>*/}
            {/*</Row>*/}

            {/*<div>*/}
            {/*  {this.renderSiteMetricsRow('Mega Site')}*/}
            {/*  {this.renderSiteMetricsRow('New Tower Riverside')}*/}
            {/*  {this.renderSiteMetricsRow('SMU Campus')}*/}
            {/*  {this.renderSiteMetricsRow('DFW Airport Facilities')}*/}
            {/*  {this.renderSiteMetricsRow('Amazon HQ3')}*/}
            {/*</div>*/}
          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading Carrier Reports Page...
      </Container>
    );
  }

  renderSiteMetricsRow(row) {
    return (
      <React.Fragment>
        <Row>
          <Col md={1}>
            <span className="form__form-group-label">{row}</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">15</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 23,456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">23,456</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 56.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 56.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">{row}</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">175</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 23,456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">23,456</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 456.00</span>
          </Col>
          <Col md={1}>
            <span className="form__form-group-label">$ 456.00</span>
          </Col>
        </Row>
      </React.Fragment>
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
    const {loaded} = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {/*{this.renderNewJobModal()}*/}
          {this.renderGoTo()}
          {this.renderTitle()}
          {this.renderFilter()}
          {this.renderTopCards()}

          {this.renderComparisonCardReports()}

          {this.renderMaterialMetrics()}
          {this.renderCarrierMetrics()}
          {this.renderCustomerMetrics()}
          {this.renderSiteMetrics()}

          {/*{this.renderAdditionalReports()}*/}
          {/*{this.renderEverything()}*/}
        </Container>
      );
    }
    return (
      <React.Fragment>
        {this.renderLoader()}
      </React.Fragment>
    );
  }

}

ReportsCustomerPage.propTypes = {
  // companyId: PropTypes.number.isRequired
};

ReportsCustomerPage.defaultProps = {
  // companyId: null
};

export default ReportsCustomerPage;
