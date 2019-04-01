import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import moment from 'moment';

// import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import TSelect from '../common/TSelect';
import TDateTimePicker from '../common/TDateTimePicker';
import JobService from '../../api/JobService';
import CompanyService from '../../api/CompanyService';
import JobMaterialsService from '../../api/JobMaterialsService';
import AddressService from '../../api/AddressService';

class ReportsCarrierPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      jobs: [],
      goToDashboard: false,
      goToAddJob: false,
      goToUpdateJob: false,
      jobId: 0,
      startDate: new Date(),
      endDate: new Date(),
      timeRanges: [
        { name: 'Last 30 days', value: 30 },
        { name: 'Last 60 days', value: 60 },
        { name: 'Last 90 days', value: 90 }
      ],
      selectedRange: 30
      // profile: null
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.handleSelectFilterChange = this.handleSelectFilterChange.bind(this);
    this.fromDateChange = this.fromDateChange.bind(this);
    this.toDateChange = this.toDateChange.bind(this);
  }

  async componentDidMount() {
    const jobs = await this.fetchJobs();

    // Promise.all(
    jobs.map(async (job) => {
      const newJob = job;

      const company = await CompanyService.getCompanyById(newJob.companiesId);
      newJob.companyName = company.legalName;

      // console.log(companyName);
      // console.log(job.companyName);

      const materialsList = await JobMaterialsService.getJobMaterialsByJobId(job.id);
      const materials = materialsList.map(materialItem => materialItem.value);
      newJob.material = this.equipmentMaterialsAsString(materials);
      // console.log(companyName);
      // console.log(job.material);

      const address = await AddressService.getAddressById(newJob.startAddress);
      newJob.zip = address.zipCode;

      this.setState({ loaded: true });

      return newJob;
    });
    // );
    this.setState({ jobs });
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

  async handleSelectFilterChange(option) {
    const { value, name } = option;
    this.setState({ selectedRange: value });
    console.log(117, name);
    console.log(118, value);
  }

  fromDateChange(data) {
    this.setState({ startDate: data });
    console.log(116, data);
  }

  toDateChange(data) {
    this.setState({ endDate: data });
    console.log(121, data);
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
    const { loaded, timeRanges, startDate, endDate, selectedRange } = this.state;
    /*
    console.log(149, startDate);
    console.log(150, endDate);
    console.log(151, selectedRange);
    */

    let { jobs } = this.state;
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

    const today = new Date();
    const date = new Date();
    const tomorrowDate = date.setDate(date.getDate() + 1);
    const currentDate = today.getTime();

    // console.log(jobs);

    if (loaded) {
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
              <h3 className="page-title">Reporting</h3>
            </Col>
          </Row>

          <div className="row">
            <div className="col-12 col-md-12 col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-2 form__form-group">
                      <span className="form__form-group-label">Time Range</span>
                      <TSelect
                        input={
                          {
                            onChange: this.handleSelectFilterChange,
                            name: timeRanges[0].name,
                            value: timeRanges[0].value
                          }
                        }                      
                        value={timeRanges[0].value.toString()}
                        options={
                          timeRanges.map(timeRange => ({
                            name: timeRange.name,
                            value: timeRange.value.toString(),
                            label: timeRange.name
                          }))
                        }
                        placeholder={timeRanges[0].name}
                      />
                    </div>
                    <div className="col-md-2 form__form-group">
                      <span className="form__form-group-label">From</span>
                      <div className="row">
                        <div className="col-10">
                          <TDateTimePicker
                            input={
                              {
                                onChange: this.FromDateChange,
                                name: 'startDate',
                                value: { currentDate },
                                givenDate: currentDate
                              }
                            }
                            onChange={this.fromDateChange}
                          />
                        </div>
                        <div className="col-2">
                          <i className="material-icons iconSet">calendar_today</i>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 form__form-group">
                      <span className="form__form-group-label">To</span>
                      <div className="row">
                        <div className="col-10">
                          <TDateTimePicker
                            input={
                              {
                                onChange: this.ToDateChange,
                                name: 'startDate',
                                value: { currentDate },
                                givenDate: currentDate
                              }
                            }
                            onChange={this.toDateChange}
                          />
                        </div>
                        <div className="col-2">
                          <i className="material-icons iconSet">calendar_today</i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>New Offers</center></h5>
                  <span><center><h4>{newJobCount}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Jobs in Progress</center></h5>
                  <span><center><h4>{inProgressJobCount}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Jobs Booked</center></h5>
                  <span><center><h4>{acceptedJobCount}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Potential Earnings</center></h5>
                  <span><center><h4>{potentialIncome}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Jobs Completed</center></h5>
                  <span><center><h4>{completedJobCount}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>% completed</center></h5>
                  <span><center><h4>{completedOffersPercent}</h4></center></span>
                </div>
              </div>
            </div>

          </div>

          <Row>
            <Col md={12}>
              <h3 className="page-title">Last 30 days</h3>
            </Col>
          </Row>

          <div className="row">
            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Jobs Completed</center></h5>
                  <span><center><h4>{jobsCompleted}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Total Earnings</center></h5>
                  <span><center><h4>{totalEarnings}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Earnings / Job</center></h5>
                  <span><center><h4>{earningsPerJob}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Cancelled Jobs</center></h5>
                  <span><center><h4>{cancelledJobs}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
              <div className="card">
                <div className="dashboard__card-widget card-body">
                  <h5 className="card__title bold-text"><center>Jobs / Truck</center></h5>
                  <span><center><h4>{jobsPerTruck}</h4></center></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2 col-lg-2">
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
