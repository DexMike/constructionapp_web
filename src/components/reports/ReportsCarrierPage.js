import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import moment from 'moment';

// import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import TSelect from '../common/TSelect';
import TDateTimePicker from '../common/TDateTimePicker';
import ProfileService from '../../api/ProfileService';
import JobService from '../../api/JobService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';
import AddressService from '../../api/AddressService';

import './Reports.css';

class ReportsCarrierPage extends Component {
  constructor(props) {
    super(props);
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];
    // Fixed options for Time Range filtering

    this.timeRanges = [
      { name: 'Custom', value: 0 },
      { name: 'Last Week', value: 7 },
      { name: 'Last 30 days', value: 30 },
      { name: 'Last 60 days', value: 60 },
      { name: 'Last 90 days', value: 90 }
    ];

    this.state = {
      loaded: false,
      jobs: [],
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
      filters: {
        companiesId: 0,
        rateType: '',

        startAvailability: null,
        endAvailability: null,
        startAvailDateComp: null,    // Comparison
        endAvailDateComp: null,      // Comparison

        rate: 'Any',
        minTons: 'Any',
        minHours: '',
        minCapacity: '',

        equipmentType: '',
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
    this.startDateChange = this.startDateChange.bind(this);
    this.endDateChange = this.endDateChange.bind(this);
    this.startDateCompChange = this.startDateCompChange.bind(this);
    this.endDateCompChange = this.endDateCompChange.bind(this);
  }

  async componentDidMount() {
    const { filters } = this.state;
    let {
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectedRange
    } = this.state;

    const profile = await ProfileService.getProfile();
    if (profile.companyId) {
      filters.companiesId = profile.companyId;
    }

    selectedRange = 30;
    const currentDate = new Date();
    startDate = new Date();
    endDate = currentDate;
    startDate.setDate(currentDate.getDate() - selectedRange);
    filters.startAvailability = startDate;
    filters.endAvailability = endDateComp;

    selectedRange = 30;
    const currentDate2 = new Date();
    startDateComp = new Date();
    endDateComp = currentDate2;
    startDateComp.setDate(currentDate2.getDate() - selectedRange);
    filters.startAvailDateComp = startDateComp;
    filters.endAvailDateComp = endDateComp;

    console.log('componentDidMount');
    console.log('startDateComp');
    console.log(startDateComp);
    console.log('endDateComp');
    console.log(endDateComp);

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

    this.setState({
      loaded: true,
      jobs,
      filters,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectedRange
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
      this.setState({ [`goTo${menuItem}`]: true });
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
      this.setState({ jobs });
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
    const { value, name } = option;
    const { filters } = this.state;
    let {
      startDate,
      endDate,
      startDateComp,
      endDateComp,
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

    // const currentDate = new Date();
    startDateComp = new Date();
    endDateComp = currentDate;
    startDateComp.setDate(currentDate.getDate() - selectedRange);
    filters.startAvailDateComp = startDateComp;
    filters.endAvailDateComp = endDateComp;

    console.log('handleSelectFilterChange');
    console.log('startDateComp');
    console.log(startDateComp);
    console.log('endDateComp');
    console.log(endDateComp);

    const jobs = await this.fetchJobs(filters);

    this.setState({
      jobs,
      loaded: true,
      filters,
      startDate,
      endDate,
      startDateComp,
      startDateComp,
      selectedRange,
      selectIndex
    });
  }

  async startDateChange(data) {
    const { filters, endDate } = this.state;
    let { startDate } = this.state;

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
    const { filters, endDateComp } = this.state;
    let { startDateComp } = this.state;

    startDateComp = data;
    filters.startAvailDateComp = startDateComp;
    const jobs = await this.fetchJobs(filters);

    this.isCustomRange(startDateComp, endDateComp);
    this.setState({
      jobs,
      startDateComp,
      filters
    });
  }

  async endDateChange(data) {
    const { filters, startDate } = this.state;
    let { endDate } = this.state;

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
    const { filters, startDateComp } = this.state;
    let { endDateComp } = this.state;

    endDateComp = data;
    filters.endAvailDateComp = endDateComp;
    const jobs = await this.fetchJobs(filters);

    this.isCustomRange(startDateComp, endDateComp);
    this.setState({
      jobs,
      endDateComp,
      filters
    });
  }

  formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return (date.toLocaleDateString('en-US', options));
  }

  async isCustomRange(startDate, endDate) {
    let { selectIndex } = this.state;
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
    const {
      loaded,
      startDate,
      endDate,
      startDateComp,
      endDateComp,
      selectIndex
    } = this.state;
    let { jobs } = this.state;
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
    // console.log(jobs);
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderGoTo()}
          <Row>
            <Col md={12}>
              <h3 className="page-title">Reporting</h3>
            </Col>
          </Row>

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
                                value: { startDate },
                                givenDate: new Date(startDate).getTime()
                              }
                            }
                            onChange={this.startDateChange}
                            dateFormat="MM-dd-yy"
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
                                value: { endDate },
                                givenDate: new Date(endDate).getTime()
                              }
                            }
                            onChange={this.endDateChange}
                            dateFormat="MM-dd-yy"
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
                                onChange: this.startDateCompChange,
                                name: 'startAvailDateComp',
                                value: { startDateComp },
                                givenDate: new Date(startDateComp).getTime()
                              }
                            }
                            onChange={this.startDateCompChange}
                            dateFormat="MM-dd-yy"
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
                                value: { endDateComp },
                                givenDate: new Date(endDateComp).getTime()
                              }
                            }
                            onChange={this.endDateCompChange}
                            dateFormat="MM-dd-yy"
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
          <div className="card-body">
            {
            /*
            <Row>
              <Col md={12}>
                <h3 className="page-title">{this.timeRanges[selectIndex].name}</h3>
              </Col>
            </Row>
            */
            }
            <div className="row">
              <div className="col-12 col-sm-12 col-md-4 col-lg-3">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Jobs In Progress</center></h5>
                    <span><center><h4>{inProgressJobCount}</h4></center></span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-4 col-lg-3">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Booked Jobs</center></h5>
                    <span><center><h4>{acceptedJobCount}</h4></center></span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-4 col-lg-3">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>New Offers</center></h5>
                    <span><center><h4>{newJobCount}</h4></center></span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-4 col-lg-3">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Potential Earnings</center></h5>
                    <div className="my-auto">
                      <span><center><h4>{potentialIncome}</h4></center></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-4 col-lg-3">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <div className="my-auto">
                      <h5 className="card__title bold-text"><center>Job Completion Rate</center></h5>
                      <span><center><h4>{completedOffersPercent}</h4></center></span>
                      <div className="text-center pt-3">
                        <span className="form__form-group-label">completed:</span>&nbsp;<span>{completedJobCount}</span>
                        &nbsp;&nbsp;
                        <span className="form__form-group-label">created:</span>&nbsp;<span>{totalJobs}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-4 col-lg-3">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Completed Jobs</center></h5>
                    <span><center><h4>{completedJobCount}</h4></center></span>
                  </div>
                </div>
              </div>
            </div>

            <Row>
              <Col md={12}>
                <h3 className="page-title">{this.timeRanges[selectIndex].name} (From {this.formatDate(startDate)} To {this.formatDate(endDate)})</h3>
              </Col>
            </Row>

            <div className="row">
              <div className="col-12 col-md-2 col-lg-4">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Jobs Completed</center></h5>
                    <span><center><h4>{jobsCompleted}</h4></center></span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4 col-lg-4">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Total Earnings</center></h5>
                    <span><center><h4>{totalEarnings}</h4></center></span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4 col-lg-4">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Earnings / Job</center></h5>
                    <span><center><h4>{earningsPerJob}</h4></center></span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4 col-lg-4">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Cancelled Jobs</center></h5>
                    <span><center><h4>{cancelledJobs}</h4></center></span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4 col-lg-4">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Jobs / Truck</center></h5>
                    <span><center><h4>{jobsPerTruck}</h4></center></span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4 col-lg-4">
                <div className="card">
                  <div className="dashboard__card-widget card-body">
                    <h5 className="card__title bold-text"><center>Idle Trucks</center></h5>
                    <span><center><h4>{idleTrucks}</h4></center></span>
                  </div>
                </div>
              </div>
            </div>

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
}

export default ReportsCarrierPage;
