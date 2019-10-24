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
  Row
} from 'reactstrap';

import {useTranslation} from 'react-i18next';
import moment from 'moment';

// ag grid
import { AgGridReact } from 'ag-grid-react';

import FilterComparisonReport from "../filters/FilterComparisonReport";
import ProfileService from '../../api/ProfileService';

import './ReportsDark.css';
import '../addresses/Address.css';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import NumberFormatting from '../../utils/NumberFormatting';
import DailyReportFilter from "../filters/DailyReportFilter";

function PageTitle() {
  const {t} = useTranslation();
  return (
    <h3 className="page-title">{t('Comparison Report')}</h3>
  );
}

function bracketsFormatter(params) {
  return "(" + params.value + ")";
}

function currencyFormatter(params) {
  return "$ " + formatNumber(params.value);
  // console.log( TFormat.asMoneyNoDecimals(params.value));
  // return TFormat.asMoneyNoDecimals(params.value);
}

function formatNumber(number) {
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function percentFormatter(params) {
  // console.log( TFormat.asMoneyNoDecimals(params.value));
  return formatNumber(params.value * 100)  + "%";
}

class ReportsCarrierPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      loading: false,
      jobs: [],
      jobId: 0,
      jobsInfo: [],
      totalJobs: 0,

      loadId: 0,
      producers: [],
      producerID: 0,
      producersInfo: [],
      totalProducers: 0,

      products: [],
      productId: 0,
      productsInfo: [],
      totalProducts: 0,

      projects: [],
      projectId: 0,
      projectsInfo: [],
      totalProjects: 0,

      goToDashboard: false,
      goToUpdateJob: false,

      // profile: null
      // Rate Type Button toggle
      filters: {
        isCarrier: true,
        status: ''
      },
      page: 0,
      rows: 99,

      totalCount: 10,

      // Grid
      defaultColumnDef: {
        sortable: true,
        filter: true,
        width: 150,
        cellStyle: { 'text-align': 'right'},
        resizable: true,
        suppressSizeToFit: true,
      },

      columnsProducer: [
        {
          field: 'name',
          headerName: 'Producer Name',
          headerTooltip: "Name of Producer",
          width: 200,
        },     
        {
          field: 'totEarnings',
          headerName: 'Total Earnings',
          headerTooltip: "Total Earnings for this time period",
          sort: "desc"
        }, {          
          field: 'avgTotEarningsComparison',
          headerName: 'Total Earnings Comparison',
          headerTooltip: "Total Earnings Comparison",
        }, {
          field: 'numJobs',
          headerName: '# of Jobs',
          headerTooltip: "Total number of jobs for this time period",
        }, {          
          field: 'avgNumJobsComparison',
          headerName: '# of Jobs Comparison',
          headerTooltip: "Total number of jobs comparison",
        }, {
          field: 'tonsDelivered',
          headerName: 'Tons Delivered',
          headerTooltip: "Total number of tons delivered for this time period",
        }, {
          field: 'avgTonsDeliveredComparison',
          headerName: 'Tons Delivered Comparison',
          headerTooltip: "Total number of tons delivered comparison",
        }, {
          field: 'avgEarningsTon',
          headerName: 'Avg. Earnings / ton',
          headerTooltip: "Average earnings per ton for this time period",
        }, {
          field: 'avgEarningsTonComparison',
          headerName: 'Avg. Earnings / ton comparison',
          headerTooltip: "Average earnings per ton for this time period",
        }, {
          field: 'avgEarningsHour',
          headerName: 'Avg. Earnings / Hour',
          headerTooltip: "Average earnings per hour for this time period",
        }, {
          field: 'avgEarningsHourComparison',
          headerName: 'Avg. Earnings / Hour comparison',
          headerTooltip: "Average earnings per hour for this time period",
        }, {
          field: 'avgMilesTraveled',
          headerName: 'Avg. Miles Traveled',
          headerTooltip: "Average miles traveled for this time period",
        }, {
          field: 'avgMilesTraveledComparison',
          headerName: 'Avg. Miles Traveled comparison',
          headerTooltip: "Average miles traveled for this time period",
        }
      ],

      columnsProducts: [
        {
          field: 'name',
          headerName: 'Product Name',
          headerTooltip: "Name of product",
          width: 200,
        }, {
          field: 'totEarnings',
          headerName: 'Total Earnings',
          headerTooltip: "Total Earnings for this time period",
        }, {
          field: 'numJobs',
          headerName: '# of Jobs',
          headerTooltip: "Total number of jobs for this time period",
        }, {          
          field: 'avgNumJobsComparison',
          headerName: '# of Jobs Comparison',
          headerTooltip: "Total number of jobs comparison",
        }, {
          field: 'tonsDelivered',
          headerName: 'Tons Delivered',
          headerTooltip: "Total number of tons deliveredfor this time period",
        }, {
          field: 'avgTonsDeliveredComparison',
          headerName: 'Tons Delivered Comparison',
          headerTooltip: "Total number of tons delivered comparison",
        }, {
          field: 'avgEarningsTon',
          headerName: 'Avg. Earnings / ton',
          headerTooltip: "Average earnings per ton for this time period",
        }, {
          field: 'avgEarningsTonComparison',
          headerName: 'Avg. Earnings / ton comparison',
          headerTooltip: "Average earnings per ton for this time period",
        }, {
          field: 'avgEarningsHour',
          headerName: 'Avg. Earnings / Hour',
          headerTooltip: "Average earnings per hour for this time period",
        }, {
          field: 'avgEarningsHourComparison',
          headerName: 'Avg. Earnings / Hour comparison',
          headerTooltip: "Average earnings per hour for this time period",
        }, {
          field: 'avgMilesTraveled',
          headerName: 'Avg. Miles Traveled',
          headerTooltip: "Average miles traveled for this time period",
        }, {
          field: 'avgMilesTraveledComparison',
          headerName: 'Avg. Miles Traveled comparison',
          headerTooltip: "Average miles traveled for this time period",
        }
      ],

      // TODO: replace headerName and headerTooltip to be Project
      columnsProjects: [
        {
          field: 'name',
          headerName: 'Job Name',
          headerTooltip: "Name of Job",
          width: 200,
        }, {
          field: 'totEarnings',
          headerName: 'Total Earnings',
          headerTooltip: "Total Earnings for this time period",
        }, {          
          field: 'avgTotEarningsComparison',
          headerName: 'Total Earnings Comparison',
          headerTooltip: "Total Earnings Comparison",
        }, {
          field: 'numJobs',
          headerName: '# of Loads',
          headerTooltip: "Total number of loads for this time period",
        }, {          
          field: 'avgNumJobsComparison',
          headerName: '# of Loads Comparison',
          headerTooltip: "Total number of loads comparison",
        }, {
          field: 'tonsDelivered',
          headerName: 'Tons Delivered',
          headerTooltip: "Total number of tons deliveredfor this time period",
        }, {
          field: 'avgTonsDeliveredComparison',
          headerName: 'Tons Delivered Comparison',
          headerTooltip: "Total number of tons delivered comparison",
        }, {
          field: 'avgEarningsTon',
          headerName: 'Avg. Earnings / ton',
          headerTooltip: "Average earnings per ton for this time period",
        }, {
          field: 'avgEarningsTonComparison',
          headerName: 'Avg. Earnings / ton comparison',
          headerTooltip: "Average earnings per ton for this time period",
        }, {
          field: 'avgEarningsHour',
          headerName: 'Avg. Earnings / Hour',
          headerTooltip: "Average earnings per hour for this time period",
        }, {
          field: 'avgEarningsHourComparison',
          headerName: 'Avg. Earnings / Hour comparison',
          headerTooltip: "Average earnings per hour for this time period",
        }, {
          field: 'avgMilesTraveled',
          headerName: 'Avg. Miles Traveled',
          headerTooltip: "Average miles traveled for this time period",
        }, {
          field: 'avgMilesTraveledComparison',
          headerName: 'Avg. Miles Traveled comparison',
          headerTooltip: "Average miles traveled for this time period",
        }
      ],

    }; // state

    // Ag-Grid
    this.gridApiProducer = null;
    this.gridApiProduct = null;
    this.gridApiProject = null;

    // binds
    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleJobEdit = this.handleJobEdit.bind(this);
    this.returnSelectedMaterials = this.returnSelectedMaterials.bind(this);
    this.handleFilterStatusChange = this.handleFilterStatusChange.bind(this);

    // TODO: need to do for Producer, Product, and Project
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);

    this.returnFilters = this.returnFilters.bind(this);
    this.returnProducers = this.returnProducers.bind(this);
    this.returnProducts = this.returnProducts.bind(this);
    this.returnProjects = this.returnProjects.bind(this);

    this.onBtnExportProducers = this.onBtnExportProducers.bind(this);
    this.onBtnExportProducts = this.onBtnExportProducts.bind(this);
    this.onBtnExportProjects = this.onBtnExportProjects.bind(this);

    this.onGridReadyProducers = this.onGridReadyProducers.bind(this);
    this.onGridReadyProducts = this.onGridReadyProducts.bind(this);
    this.onGridReadyProjects = this.onGridReadyProjects.bind(this);

  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({ profile });
    // await this.fetchJobsInfo();
    // await this.fetchProducerMetrics();
    // await this.fetchProductMetrics();
    // await this.fetchProjectMetrics();
    this.setState({ loaded: true });
  }

  onBtnExportProducers() {
    const params = {
      skipHeader: false, //getBooleanValue("#skipHeader"),
      columnGroups: true, //getBooleanValue("#columnGroups"),
      skipFooters: false, //getBooleanValue("#skipFooters"),
      skipGroups: false, //getBooleanValue("#skipGroups"),
      skipPinnedTop: false, //getBooleanValue("#skipPinnedTop"),
      skipPinnedBottom: false, //getBooleanValue("#skipPinnedBottom"),
      allColumns: true, //getBooleanValue("#allColumns"),
      onlySelected: false, //getBooleanValue("#onlySelected"),
      suppressQuotes: false, //getBooleanValue("#suppressQuotes"),
      fileName: 'producers.csv', //document.querySelector("#fileName").value,
      columnSeparator: ',' //document.querySelector("#columnSeparator").value
    };
    this.gridApiProducers.exportDataAsCsv(params);
  }

  onBtnExportProducts() {
    const params = {
      skipHeader: false, //getBooleanValue("#skipHeader"),
      columnGroups: true, //getBooleanValue("#columnGroups"),
      skipFooters: false, //getBooleanValue("#skipFooters"),
      skipGroups: false, //getBooleanValue("#skipGroups"),
      skipPinnedTop: false, //getBooleanValue("#skipPinnedTop"),
      skipPinnedBottom: false, //getBooleanValue("#skipPinnedBottom"),
      allColumns: true, //getBooleanValue("#allColumns"),
      onlySelected: false, //getBooleanValue("#onlySelected"),
      suppressQuotes: false, //getBooleanValue("#suppressQuotes"),
      fileName: 'products.csv', //document.querySelector("#fileName").value,
      columnSeparator: ',' //document.querySelector("#columnSeparator").value
    };
    this.gridApiProducts.exportDataAsCsv(params);
  }

  onBtnExportProjects() {
    const params = {
      skipHeader: false, //getBooleanValue("#skipHeader"),
      columnGroups: true, //getBooleanValue("#columnGroups"),
      skipFooters: false, //getBooleanValue("#skipFooters"),
      skipGroups: false, //getBooleanValue("#skipGroups"),
      skipPinnedTop: false, //getBooleanValue("#skipPinnedTop"),
      skipPinnedBottom: false, //getBooleanValue("#skipPinnedBottom"),
      allColumns: true, //getBooleanValue("#allColumns"),
      onlySelected: false, //getBooleanValue("#onlySelected"),
      suppressQuotes: false, //getBooleanValue("#suppressQuotes"),
      fileName: 'projects.csv', //document.querySelector("#fileName").value,
      columnSeparator: ',' //document.querySelector("#columnSeparator").value
    };
    this.gridApiProjects.exportDataAsCsv(params);
  }

  onGridReadyProducers(params) {
    this.gridApiProducers = params.api;
    this.gridColumnApi = params.columnApi;
  };

  onGridReadyProducts(params) {
    this.gridApiProducers = params.api;
    this.gridColumnApi = params.columnApi;
  };

  onGridReadyProjects(params) {
    this.gridApiProjects = params.api;
    this.gridColumnApi = params.columnApi;
  };

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
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

  // Helper function to do date comparison in sorting
  // Move to TFormat?
  numberComparator(num) {
    console.log("*** numberComparator");
    return Number(String(num).replace(/[^0-9-\.]+/g, ""));
  }

  // https://stackoverflow.com/questions/22600856/moment-js-date-time-comparison
  dateComparator(date1, date2) {
    var momentA = moment(date1,"MM/DD/YYYY");
    var momentB = moment(date2,"MM/DD/YYYY");
    if (momentA > momentB) {
      return 1;
    } else if (momentA < momentB) {
      return -1;
    } else {
      return 0;
    }
  }

  // renderModal stolen from MarketplaceCarrierPage
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

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    // if (status.goToUpdateJob) {
    //   return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    // }
    return false;
  }

  renderTitle() {
    return (
      <PageTitle />
    );
  }

  // async fetchProducerMetrics() {
  //   const { profile, filters } = this.state;
  //   const response = await ReportsService.getProducersComparisonReport(filters);
  //   const producersInfo = response.data;
  //   const { totalProducers } = response;
  //   this.setState({ totalProducers, producersInfo });
  // }
  //
  // async fetchProductMetrics() {
  //   const { profile, filters } = this.state;
  //   const response = await ReportsService.getProductsComparisonReport(filters);
  //   const productInfo = response.data;
  //   const { totalProducts } = response;
  //   this.setState({ totalProducts, productInfo });
  // }
  //
  // async fetchProjectMetrics() {
  //   const { profile, filters } = this.state;
  //   const response = await ReportsService.getProjectComparisonReport(filters);
  //   const projectInfo = response.data;
  //   const { totalProject } = response;
  //   this.setState({ totalProject, projectInfo });
  // }

  // get data
  returnProducers(producers, filters, metadata) {
    const {totalCount} = metadata;
    this.setState({
      producers,
      filters,
      totalProducers: totalCount
    });
  }

  returnProducts(products, filters, metadata) {
    const {totalCount} = metadata;
    this.setState({
      products,
      filters,
      totalProducts: totalCount
    });
  }

  returnProjects(projects, filters, metadata) {
    const {totalCount} = metadata;
    this.setState({
      projects,
      filters,
      totalProject: totalCount
    });
  }

  // get filters

  returnFilters(
    producers,
    products,
    projects,
    totalProducers,
    totalProducts,
    totalProjects,
    filters/*, metadata*/)
  {
    const totalCount = 0;
    this.setState({
      producers,
      products,
      projects,
      filters,
      totalProducers,
      totalProducts,
      totalProjects,
    });
  }

  // returnFilters(jobs, filters, metadata) {
  //   // const { totalCount } = metadata;
  //   const totalCount = 0;
  //
  //   this.setState({
  //     jobs,
  //     filters,
  //     totalCount
  //   });
  // }

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

  // Carrier: Producer, Product, Projects
  // new stuff from ReportsDailyReports
  renderProducers() {
    let { producers, loading } = this.state;
    return (
      <Row>
        {/*Producers*/}
        <Col md={12}>
          <Card>
            <CardBody>
              <Col lg={12}>

                <Row>
                  <Col md={6}>
                    <h3 className="page-title">Producers</h3>
                  </Col>
                  <Col md={6} className="text-right">
                    <Button
                      disabled={loading}
                      onClick={this.onBtnExportProducers}
                      type="button"
                      className="btn btn-main"
                    >
                      Export to CSV
                    </Button>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
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
                          id="ProducerGrid"
                          className="ag-theme-balham-dark"
                          style={{
                            height: '500px',
                            width: '100%',
                            // height: "100%",
                            // width: "100%",
                            // odd-row-background-color: '#CFD8DC'
                          }}
                        >
                          <AgGridReact
                            columnDefs={this.state.columnsProducer}
                            defaultColDef={this.state.defaultColumnDef}
                            rowData={producers}
                            // floatingFilter={true}
                            onGridReady={this.onGridReadyProducers}
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
    );
  }

  renderProducts() {
    let { products, loading } = this.state;

    return (      
      <Row>
        {/*Products*/}
        <Col md={12}>
          <Card>
            <CardBody>
              <Col lg={12}>

                <Row>
                  <Col md={6}>
                    <h3 className="page-title">Products</h3>
                  </Col>
                  <Col md={6} className="text-right">
                    <Button
                      disabled={loading}
                      onClick={this.onBtnExportProducts}
                      type="button"
                      className="btn btn-main"
                    >
                      Export to CSV
                    </Button>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
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
                          id={"ProductsGrid"}
                          className="ag-theme-balham-dark"
                          style={{
                            height: '500px',
                            width: '100%',
                            // height: "100%",
                            // width: "1040px",
                            // odd-row-background-color: '#CFD8DC'
                          }}
                        >
                          <AgGridReact
                            columnDefs={this.state.columnsProducts}
                            defaultColDef={this.state.defaultColumnDef}
                            rowData={products}
                            // floatingFilter={true}
                            onGridReady={this.onGridReadyProducts}
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
    );
  }

  renderProjects() {
    let { projects, loading } = this.state;

    return (          
      <Row>
        {/*Projects*/}
        <Col md={12}>
          <Card>
            <CardBody>
              <Col lg={12}>

                <Row>
                  <Col md={6}>
                    <h3 className="page-title">Jobs</h3>
                  </Col>
                  <Col md={6} className="text-right">
                    <Button
                      disabled={loading}
                      onClick={this.onBtnExportProjects}
                      type="button"
                      className="btn btn-main"
                    >
                      Export to CSV
                    </Button>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
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
                          id={"ProjectsGrid"}
                          className="ag-theme-balham-dark"
                          style={{
                            height: '500px',
                            width: '100%',
                            // height: "100%",
                            // width: "100%",
                            // odd-row-background-color: '#CFD8DC'
                          }}
                        >
                          <AgGridReact
                            columnDefs={this.state.columnsProjects}
                            defaultColDef={this.state.defaultColumnDef}
                            rowData={projects}
                            // floatingFilter={true}
                            onGridReady={this.onGridReadyProjects}
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
    );
  }

  // Images
  renderResultsProducersPNG() {
    const { loaded } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="card-body">

            <Row>
              <div className="col-md-12 mt-1">
                <img width="100%" height="100%" src={carrierProducerMetrics} alt=""
                />
              </div>
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

  renderResultsProductsPNG() {
    const { loaded } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="card-body">

            <Row>
              <div className="col-md-12 mt-1">
                <img width="100%" height="100%" src={carrierProductMetrics} alt=""
                />
              </div>
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

  renderResultsProjectsPNG() {
    const { loaded } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="card-body">
            <Row>
              <div className="col-md-12 mt-1">
                <img width="100%" height="100%" src={carrierProjectMetrics} alt=""
                />
              </div>
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

  render() {
    const { loaded, page, rows } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderGoTo()}
          {this.renderTitle()}
          {/*{this.renderCards()}*/}
          {/* */}
          <FilterComparisonReport
            type="Carrier"
            showComparison={true}
            ref="filterChild"
            onReturnFilters={this.returnFilters}
            returnProducers={this.returnProducers}
            returnProducts={this.returnProducts}
            returnProjects={this.returnProjects}
            fetching={(value) => {
              this.setState({ loading: value });
            }}
            page={page}
            rows={rows}
          />

          {/*Render ag-grid table*/}
          {this.renderProducers()}
          {this.renderProducts()}
          {this.renderProjects()}

          {/*Render Images*/}
          {/*this.renderResultsProducersPNG()*/}
          {/*this.renderResultsProductsPNG()*/}
          {/*this.renderResultsProjectsPNG()*/}

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

ReportsCarrierPage.propTypes = {
  // companyId: PropTypes.number.isRequired
};

ReportsCarrierPage.defaultProps = {
  // companyId: null
};

export default ReportsCarrierPage;
