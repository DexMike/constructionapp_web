/* eslint-disable no-multiple-empty-lines,
no-trailing-spaces,
object-curly-spacing,
no-unused-vars,
spaced-comment,
react/jsx-closing-bracket-location,
semi, quotes, no-empty,
react/no-string-refs,
prefer-const, comma-dangle, padded-blocks,
react/jsx-one-expression-per-line,
space-before-function-paren,
keyword-spacing, no-multi-spaces */
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  ButtonGroup,
  Modal
} from 'reactstrap';

import {useTranslation} from 'react-i18next';
import moment from 'moment';

// ag grid
import { AgGridReact } from 'ag-grid-react';
import { Scrollbars } from 'react-custom-scrollbars';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { CSVLink, CSVDownload } from "react-csv";
import StringGenerator from '../utils/StringGenerator';
import TFormat from '../common/TFormat';
import {DashboardObjectStatic} from './DashboardObjectStatic';
import DashboardObjectClickable from './DashboardObjectClickable';
import DailyReportFilter from '../filters/DailyReportFilter';
import JobService from '../../api/JobService';
import ProfileService from '../../api/ProfileService';
import './Reports.css';
import ReportsDailyReportsColumns from './ReportsDailyReportsColumns';

import JobDate from '../jobs/JobDate';


function bracketsFormatter(params) {
  return `(${params.value})`;
}

function currencyFormatter(params) {
  if (params) {
    return TFormat.currencyFormatter(params.value);
  }
  return "$ 0.00";
}

function numberFormatter(params) {
  if (params) {
    return TFormat.formatNumber(params.value);
  }
  return "0";
}

function decimalFormatter(params) {
  if (params) {
    return TFormat.formatNumberDecimal(params.value);
  }
  return "0";
}

function dhmsFormatter(params) {
  if (params) {
    return TFormat.asMinutesToDHms(params.value);
  }
  return "0";
}

// Assumes SQL side did the *100 already
function percentFormatter(params) {
  return TFormat.formatPercent(params.value);
}

function PageTitle() {
  const {t} = useTranslation();
  return (
    <h3 className="page-title">{t('Daily Report')}</h3>
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

class ReportsDailyReportPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      loading: false,
      jobs: [],
      jobId: 0,
      jobsInfo: [],
      totalJobs: 0,
      page: 0,
      rows: 99,

      loads: [],
      loadId: 0,
      loadsInfo: [],
      totalLoads: 0,

      modal: false,
      job: {},
      jobsDate: [],

      totalCount: 1000,
      totalLoadsCount: 99,

      goToDashboard: false,
      goToUpdateJob: false,
      profile: {},
      // Rate Type Button toggle
      filters: {
        status: ''
      },

      // Grid
      defaultColumnDef: {
        sortable: true,
        filter: true,
        width: 125,
        cellStyle: { 'text-align': 'right'},
        resizable: true,
        suppressSizeToFit: true,
      },
      columnsJobs: [],
      columnsLoads: []
    }; // state

    // Ag-Grid
    this.gridApiJobs = null;
    this.gridApiLoads = null;

    // binds
    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.returnSelectedMaterials = this.returnSelectedMaterials.bind(this);
    this.handleFilterStatusChange = this.handleFilterStatusChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.returnFilters = this.returnFilters.bind(this);
    this.onGridReadyJobs = this.onGridReadyJobs.bind(this);
    this.onGridReadyLoads = this.onGridReadyLoads.bind(this);

    // this.toggle = this.toggle.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
  }

  async componentDidMount() {
    let { columnsJobs, columnsLoads } = this.state;
    const profile = await ProfileService.getProfile();
    this.setState({ profile });
    await this.fetchJobsInfo();
    columnsJobs = ReportsDailyReportsColumns.getJobsColumns();
    columnsLoads = ReportsDailyReportsColumns.getLoadsColumns();

    //change labels according to user type
    if (profile.companyType === 'Customer') {
      for (const obj of columnsJobs[1].children) {
        this.setLabelsCustomer(obj);
      }
    }

    this.setState({
      columnsJobs,
      columnsLoads,
      loaded: true
    });
  }

  onGridReadyJobs(params) {
    this.gridApiJobs = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onGridReadyLoads(params) {
    this.gridApiLoads = params.api;
    this.gridColumnApi = params.columnApi;
  }

  setLabelsCustomer (obj) {
    const newObj = obj;
    if (obj.field === 'avgRevenuePerDay') {
      newObj.headerName = 'Cost per Day';
      newObj.headerTooltip = 'Carrier of Producer';
    }
    return newObj;
  }

  async fetchJobsInfo() {
    const { profile } = this.state;
    const response = await JobService.getCarrierJobsInfo(profile.companyId);
    const jobsInfo = response.data;
    const { totalJobs } = response;
    this.setState({ totalJobs, jobsInfo });
  }

  returnFilters(jobs, loads, filters/*, metadata*/) {
    const totalCount = 0;
    this.setState({
      jobs,
      loads,
      filters,
      totalCount
    });
  }
  /**/

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

  returnSelectedMaterials() {
    const { filters } = this.state;
    return filters.materialType;
  }

  extractCSVInfoJobs(data) {
    const { columnsJobs } = this.state;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })

    const newData = data.map(d => ({
      Date: d.date,
      Completed: d.completedJobs,
      'Not Completed': Number(d.notCompletedJobs),
      'In Progress': Number(d.jobsInProgress),
      'Total Jobs': Number(d.totalJobs),
      'Total Loads': Number(d.totalLoads),
      'Rate per Ton': formatter.format(d.rateTon),
      'Cost per Day': formatter.format(d.avgRevenuePerDay),
      'Total Tons Hauled': Number(d.totalTonsHauled),
      'Job Duration': Number(d.avgJobTime),
      'Distance (mi)': Number(d.realDistance),
      //'Rate: $/Hour': d.rateHour
      /*,
      'Potential Earnings': d.potentialEarnings,
      'Total Market Value': d.totalMarketValue
      */

    }))
    return newData;
  }

  extractCSVInfoLoads(data) {
    const newData = data.map(d => ({
      Date: d.date,
      Loads: d.totalNumberOfLoads,
      Completed: d.totalNumberOfCompletedLoads,
      'Distance travelled': d.totalDistanceTravelled
    }))
    return newData;
  }

  // modal with job detail information
  togglePopup() {
    const { modal } = this.state;
    
    if (modal) {
      this.setState(({
        modal: !modal,
      }));
    } else {
      this.setState(({
        modal: !modal
      }));
    }
  }
  
  closeModal() {
    const { modal } = this.state;
    this.setState({
      modal: !modal
    });
  }

  async getJob(date) {
    try {
      const jobsDate = await JobService.getJobsByDate(
        date
      );
      this.setState({
        jobsDate
      }, function done() {
        this.togglePopup();
      });
    } catch (e) {
      console.log('ERROR: ', e);
    }
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
    const { loaded, filters, jobsInfo, totalJobs } = this.state;
    let jobs = jobsInfo;
    let onOfferJobCount = 0;
    let publishedJobCount = 0;
    let bookedJobCount = 0;
    let inProgressJobCount = 0;
    let completedJobCount = 0;
    let totalPotentialIncome = 0;
    let completedOffersPercent = 0;

    if (jobs) {
      jobs = jobs.map((job) => {
        const newJob = job;
        // const tempRate = newJob.rate;
        if (newJob.status === 'On Offer') {
          // onOfferJobCount += 1;
          onOfferJobCount += newJob.countJobs;
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
        totalPotentialIncome += (newJob.estimatedEarnings) * 0.95;

        return newJob;
      });
    }

    // Jobs completed / Job offers responded to
    // completedOffersPercent = TFormat.asPercent((completedJobCount / jobs.length) * 100, 2);
    completedOffersPercent = TFormat.asPercent((completedJobCount / totalJobs) * 100, 2);

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
              title={filters.status === 'Job Completed' ? 'Earnings' : 'Potential Earnings'}
              displayVal={TFormat.asMoney(totalPotentialIncome)}
            />
          </div>
        </Container>
      );
    }
    return (
      <DashboardLoading  />
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

  renderModal() {
    const { modal, jobsDate, closeModal, activeTab } = this.state;
    return (
      <React.Fragment>
        <Modal isOpen={modal} toggle={this.togglePopup} backdrop="static" className="reports-modal-job">
          <div className="dashboard dashboard__job-create" style={{width: 900}}>
            <JobDate
              jobsDate={jobsDate}
              bid={null}
              handlePageClick={this.handlePageClick}
              // companyCarrier={company}
            />
            <div className="reports-cont-btn">
              <Button
                color="minimal"
                className="btn btn-outline-secondary"
                outline
                onClick={this.closeModal}
                >Close &nbsp;
              </Button>
            </div>
          </div>
        </Modal>
      </React.Fragment>
    );
  }

  renderResults() {
    let {
      jobs,
      loads,
      loading,
      columnsJobs,
      defaultColumnDef
    } = this.state;
    let dataToPrintJobs = [];
    let dataToPrintLoads = [];

    dataToPrintJobs = this.extractCSVInfoJobs(jobs);
    dataToPrintLoads = this.extractCSVInfoLoads(loads);

    return (
      <React.Fragment>
        <Row>
          {/*Jobs*/}
          <Col md={12}>
            <Card>
              <CardBody>
                <Col lg={12} className="noSidePadding">
                  <Row>
                    <Col md={8}>
                      <h3 className="page-title">Jobs</h3>
                    </Col>
                    <Col md={4}>
                      <ButtonGroup className="btn-group--icons float-right">
                        <CSVLink data={dataToPrintJobs} filename={`DailyJobsReport_${StringGenerator.getDateString()}.csv`}>
                          <Button
                            outline
                          >Export data as CSV &nbsp;
                            <span className="lnr lnr-chart-bars" />
                          </Button>
                        </CSVLink>
                      </ButtonGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12} className="noSidePadding">
                      {
                        loading && (
                          <div className="spinner-container">
                            <div className="spinner-border" role="status" style={{color: '#006F53'}}>
                              <span className="sr-only">Loading...</span>
                            </div>
                          </div>
                        )
                      }
                      <Scrollbars
                        autoHeight
                        autoHeightMin={0}
                        autoHeightMax={800}
                        // disableVerticalScrolling
                      >
                        <div
                          id="jobsGrid"
                          className="ag-theme-balham gridTableJobs"
                          data-html2canvas-ignore="true"
                        >
                          <AgGridReact
                            columnDefs={columnsJobs}
                            defaultColDef={defaultColumnDef}
                            rowData={jobs}
                            onRowClicked={event => this.getJob(event.data.date)}
                            onGridReady={this.onGridReadyJobs}
                            paginationAutoPageSize
                            pagination
                            domLayout="print"
                            style={{ width: '1800px' }}
                          />
                        </div>
                      </Scrollbars>

                    </Col>
                  </Row>

                </Col>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/*Loads
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <Col lg={12} className="noSidePadding">

                  <Row>
                    <Col md={8}>
                      <h3 className="page-title">Loads</h3>
                    </Col>
                    <Col md={4}>
                      <ButtonGroup className="btn-group--icons float-right">
                        <CSVLink data={dataToPrintLoads} filename={`DailyLoadsReport_${StringGenerator.getDateString()}.csv`}>
                          <Button
                            outline
                          >Export data as CSV &nbsp;
                            <span className="lnr lnr-chart-bars" />
                          </Button>
                        </CSVLink>
                      </ButtonGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12} className="noSidePadding">
                      <Card>
                        <CardBody>
                          {
                            loading && (
                              <div className="spinner-container">
                                <div className="spinner-border" role="status" style={{color: '#006F53'}}>
                                  <span className="sr-only">Loading...</span>
                                </div>
                              </div>
                            )
                          }
                          <div
                            id={"loadsGrid"}
                            className="ag-theme-balham"
                            style={{
                              height: '500px',
                              width: '100%',
                              // height: "100%",
                              // width: "100%",
                              // odd-row-background-color: '#CFD8DC'
                            }}
                          >
                            <AgGridReact
                              columnDefs={this.state.columnsLoads}
                              defaultColDef={this.state.defaultColumnDef}
                              rowData={loads}
                              // floatingFilter={true}
                              onGridReady={this.onGridReadyLoads}
                              paginationAutoPageSize={true}
                              pagination={true}
                            />
                          </div>

                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                </Col>
              </CardBody>
            </Card>
          </Col>
        </Row>
        */}
      </React.Fragment>
    );
  }

  render() {
    const { loaded, page, rows } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderGoTo()}
          {this.renderModal()}
          <Row>
            <Col md={12}>
              {this.renderTitle()}
            </Col>
          </Row>
          
          {/* this.renderCards() */}
          <DailyReportFilter
            onReturnFilters={this.returnFilters}
            fetching={(value) => {
              this.setState({ loading: value })
            }}
            page={page}
            rows={rows}
            ref="filterChild"
            type="Daily"
          />
          {/* {this.renderFilter()} */}
          {this.renderResults()}
          {/* this.renderJobList() */}
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

export default ReportsDailyReportPage;
