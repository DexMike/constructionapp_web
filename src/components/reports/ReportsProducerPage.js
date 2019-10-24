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
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import classnames from 'classnames';
import {useTranslation} from 'react-i18next';
import moment from 'moment';

// ag grid
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import PropTypes from 'prop-types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import FilterComparisonReport from "../filters/FilterComparisonReport";
import ProfileService from '../../api/ProfileService';

import './Reports.css';
import '../addresses/Address.css';
import BarRenderer from '../../utils/BarRenderer';
import BarFilter from '../../utils/BarFilter';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

function PageTitle() {
  const {t} = useTranslation();
  return (
    <h3 className="page-title">{t('Comparison Report')}</h3>
  );
}

function bracketsFormatter(params) {
  return `(${params.value})`;
}

function formatNumber(number) {
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function currencyFormatter(params) {
  return `$ ${formatNumber(params.value)}`;
}
  

function percentFormatter(params) {
  return `${formatNumber(params.value * 100)} %`;
}

class ReportsProducerPage extends Component {
  /*
  static propTypes = {
    t: PropTypes.func.isRequired,
  };
  */
  
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

      carriers: [],
      carrierID: 0,
      carriersInfo: [],
      totalCarriers: 0,

      // producers: [],
      // producerID: 0,
      // producersInfo: [],
      // totalProducers: 0,

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
        status: ''
      },
      page: 0,
      rows: 99,

      totalCount: 10,
      activeTab: '1',

      // Grid
      defaultColumnDef: {
        sortable: true,
        filter: true,
        // width: 150,
        cellStyle: { 'text-align': 'right'},
        resizable: true,
        suppressSizeToFit: true,
      },

      columnsCarrier: [
        {
          field: 'name',
          headerName: 'Carrier Name',
          headerTooltip: "Carrier of Producer",
          // width: 200,
        }, {
          field: 'avgTotEarningsComparison',
          headerName: 'Total Earnings',
          headerTooltip: "Total Earnings for this time period",
          sort: "desc",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          valueFormatter: currencyFormatter
        }, {
          field: 'costPerTonMileComparison',
          headerName: 'Cost per Ton/Mile',
          headerTooltip: "Total Cost per Ton/Mile for this time period",
          sort: "desc",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          valueFormatter: currencyFormatter
        }, {
          field: 'totalJobsComparison',
          headerName: '# of Jobs',
          headerTooltip: "Total number of jobs for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgTonsDeliveredComparison',
          headerName: 'Tons Delivered',
          headerTooltip: "Total number of tons delivered for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgEarningsHourComparison',
          headerName: 'Avg. Earnings/Hour',
          headerTooltip: "Average earnings per hour for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgEarningsJobComparison',
          headerName: 'Avg. Earnings/Job',
          headerTooltip: "Average earnings per job for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgEarningsTonComparison',
          headerName: 'Avg. Earnings/Ton',
          headerTooltip: "Average earnings per ton for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgMilesTraveledComparison',
          headerName: 'Avg. Miles Traveled',
          headerTooltip: "Average miles traveled for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }
      ],

      columnsProducts: [
        {
          field: 'name',
          headerName: 'Product Name',
          headerTooltip: "Name of product",
          // width: 200,
        }, {
          field: 'avgTotEarningsComparison',
          headerName: 'Total Earnings',
          headerTooltip: "Total Earnings for this time period",
          sort: "desc",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'totalJobsComparison',
          headerName: '# of Jobs',
          headerTooltip: "Total number of jobs for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgTonsDeliveredComparison',
          headerName: 'Tons Delivered',
          headerTooltip: "Total number of tons delivered for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgEarningsHourComparison',
          headerName: 'Avg. Earnings/Hour',
          headerTooltip: "Average earnings per hour for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgEarningsJobComparison',
          headerName: 'Avg. Earnings/Job',
          headerTooltip: "Average earnings per job for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgEarningsTonComparison',
          headerName: 'Avg. Earnings/Ton',
          headerTooltip: "Average earnings per ton for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgMilesTraveledComparison',
          headerName: 'Avg. Miles Traveled',
          headerTooltip: "Average miles traveled for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }
      ],

      // TODO: replace headerName and headerTooltip to be Job
      columnsProjects: [
        {
          field: 'name',
          headerName: 'Job Name',
          headerTooltip: "Name of Job",
          // width: 200,
        }, {
          field: 'avgTotEarningsComparison',
          headerName: 'Total Earnings',
          headerTooltip: "Total Earnings for this time period",
          sort: "desc",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'totalJobsComparison',
          headerName: '# of Jobs',
          headerTooltip: "Total number of jobs for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgTonsDeliveredComparison',
          headerName: 'Tons Delivered',
          headerTooltip: "Total number of tons delivered for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgEarningsHourComparison',
          headerName: 'Avg. Earnings/Hour',
          headerTooltip: "Average earnings per hour for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgEarningsJobComparison',
          headerName: 'Avg. Earnings/Job',
          headerTooltip: "Average earnings per job for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgEarningsTonComparison',
          headerName: 'Avg. Earnings/Ton',
          headerTooltip: "Average earnings per ton for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }, {
          field: 'avgMilesTraveledComparison',
          headerName: 'Avg. Miles Traveled',
          headerTooltip: "Average miles traveled for this time period",
          // renderer
          enableValue: true,
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter
        }
      ]

    }; // state

    // Ag-Grid
    this.gridApiCarrier = null;
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
    this.returnCarriers = this.returnCarriers.bind(this);
    this.returnProducts = this.returnProducts.bind(this);
    this.returnProjects = this.returnProjects.bind(this);

    this.onBtnExportCarriers = this.onBtnExportCarriers.bind(this);
    this.onBtnExportProducts = this.onBtnExportProducts.bind(this);
    this.onBtnExportProjects = this.onBtnExportProjects.bind(this);

    this.onGridReadyCarriers = this.onGridReadyCarriers.bind(this);
    this.onGridReadyProducts = this.onGridReadyProducts.bind(this);
    this.onGridReadyProjects = this.onGridReadyProjects.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    // await this.fetchJobsInfo();
    // await this.fetchProducerMetrics();
    // await this.fetchProductMetrics();
    // await this.fetchProjectMetrics();
    this.setState({ loaded: true, profile });
  }

  onBtnExportCarriers() {
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
      fileName: 'carriers.csv', //document.querySelector("#fileName").value,
      columnSeparator: ',' //document.querySelector("#columnSeparator").value
    };
    this.gridApiCarrier.exportDataAsCsv(params);
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
    this.gridApiProduct.exportDataAsCsv(params);
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
      fileName: 'jobs.csv', //document.querySelector("#fileName").value,
      columnSeparator: ',' //document.querySelector("#columnSeparator").value
    };
    this.gridApiProject.exportDataAsCsv(params);
  }

  /*
  this.gridApiCarrier = null;
  this.gridApiProduct = null;
  this.gridApiProject = null;
  */

  onGridReadyCarriers(params) {
    this.gridApiCarrier = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onGridReadyProducts(params) {
    this.gridApiProduct = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onGridReadyProjects(params) {
    this.gridApiProject = params.api;
    this.gridColumnApi = params.columnApi;
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  }

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
    // console.log("*** numberComparator");
    return Number(String(num).replace(/[^0-9-\.]+/g, ""));
  }

  // https://stackoverflow.com/questions/22600856/moment-js-date-time-comparison
  dateComparator(date1, date2) {
    let momentA = moment(date1, 'MM/DD/YYYY');
    let momentB = moment(date2, 'MM/DD/YYYY');
    if (momentA > momentB) {
      return 1;
    }
    if (momentA < momentB) {
      return -1;
    }
    return 0;
  }

  // get data
  returnCarriers(carriers, filters, metadata) {
    const {totalCount} = metadata;
    this.setState({
      carriers,
      filters,
      totalCarriers: totalCount
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
    carriers,
    producers,
    products,
    projects,
    totalCarriers,
    totalProducers,
    totalProducts,
    totalProjects,
    filters/*, metadata*/)
  {
    const totalCount = 0;
    this.setState({
      carriers,
      producers,
      products,
      projects,
      filters,
      totalCarriers,
      totalProducers,
      totalProducts,
      totalProjects,
    });
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

  renderTitle() {
    return (
      <PageTitle />
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

  // Producer: carrier, Product, Projects
  // new stuff from ReportsDailyReports
  renderCarriers() {
    let { carriers, products, projects, loading } = this.state;
    // console.log("TCL: renderCarriers -> carriers", carriers);
    // const { t } = this.props;
    const {t} = useTranslation();
    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <div className="card__title">
                <h5 className="bold-text">{t('Results in time range')}</h5>
                <h5 className="subhead">Click on the tabs in order to see the corresponding info.</h5>
              </div>
              <div className="tabs">
                <div className="tabs__wrap">
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '1' })}
                        onClick={() => {
                          this.toggle('1');
                        }}
                      >
                        Carrier
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '2' })}
                        onClick={() => {
                          this.toggle('2');
                        }}
                      >
                        Products
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '3' })}
                        onClick={() => {
                          this.toggle('3');
                        }}
                      >
                        Jobs
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                      <div style={{ width: '100%', height: '262px' }}>
                        <ResponsiveContainer height={250} className="dashboard__area">
                          <AreaChart data={this.state.carriers} margin={{ top: 20, left: -15, bottom: 20 }}>
                            <XAxis dataKey="name" tickLine={false} />
                            <YAxis tickLine={false} />
                            <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
                            <Legend />
                            <CartesianGrid />{/*
                            <Area name="Site A" type="monotone" dataKey="a" fill="#4ce1b6" stroke="#4ce1b6" fillOpacity={0.2} />
                            <Area name="Site B" type="monotone" dataKey="b" fill="#70bbfd" stroke="#70bbfd" fillOpacity={0.2} />*/}
                            <Area name="Total Earnings" type="monotone" dataKey="totEarningsNum" fill="#74B5A5" stroke="#74B5A5" fillOpacity={0.2} />
                            <Area name="Average Earnings per Hour" type="monotone" dataKey="avgEarningsHourNum" fill="#479682" stroke="#479682" fillOpacity={0.2} />
                            <Area name="Average Earnings per Ton" type="monotone" dataKey="avgEarningsTonNum" fill="#176A55" stroke="#176A55" fillOpacity={0.2} />
                            <Area name="Average Earnings per Job" type="monotone" dataKey="avgEarningsJobNum" fill="#044F3C" stroke="#044F3C" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div> 
                      <div
                        id="ProducerGrid"
                        className="ag-theme-balham"
                        style={{
                          width: '100%',
                          // height: "100%",
                          // width: "100%",
                          // odd-row-background-color: '#CFD8DC'
                        }}
                      >
                        <AgGridReact
                          columnDefs={this.state.columnsCarrier}
                          defaultColDef={this.state.defaultColumnDef}
                          rowData={carriers}
                          // floatingFilter={true}
                          onGridReady={this.onGridReadyCarriers}
                          paginationPageSize={25}
                          pagination={true}
                          domLayout="print"
                          rowHeight={60}
                        />
                      </div>
                    </TabPane>
                    <TabPane tabId="2">
                      <div style={{ width: '100%', height: '262px' }}>
                        <ResponsiveContainer height={250} className="dashboard__area">
                          <AreaChart data={this.state.products} margin={{ top: 20, left: -15, bottom: 20 }}>
                            <XAxis dataKey="name" tickLine={false} />
                            <YAxis tickLine={false} />
                            <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
                            <Legend />
                            <CartesianGrid />{/*
                            <Area name="Site A" type="monotone" dataKey="a" fill="#4ce1b6" stroke="#4ce1b6" fillOpacity={0.2} />
                            <Area name="Site B" type="monotone" dataKey="b" fill="#70bbfd" stroke="#70bbfd" fillOpacity={0.2} />*/}
                            <Area name="Total Earnings" type="monotone" dataKey="totEarningsNum" fill="#74B5A5" stroke="#74B5A5" fillOpacity={0.2} />
                            <Area name="Average Earnings per Hour" type="monotone" dataKey="avgEarningsHourNum" fill="#479682" stroke="#479682" fillOpacity={0.2} />
                            <Area name="Average Earnings per Ton" type="monotone" dataKey="avgEarningsTonNum" fill="#176A55" stroke="#176A55" fillOpacity={0.2} />
                            <Area name="Average Earnings per Job" type="monotone" dataKey="avgEarningsJobNum" fill="#044F3C" stroke="#044F3C" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div
                        id="ProductsGrid"
                        className="ag-theme-balham"
                        style={{
                          // height: '500px',
                          width: '100%',
                          // height: "100%",
                          // width: "100%",
                          // odd-row-background-color: '#CFD8DC'
                        }}
                      >
                        <AgGridReact
                          columnDefs={this.state.columnsProducts}
                          defaultColDef={this.state.defaultColumnDef}
                          rowData={products}
                          // floatingFilter={true}
                          onGridReady={this.onGridReadyProducts}
                          paginationPageSize={25}
                          pagination={true}
                          domLayout="print"
                          rowHeight={60}
                        />
                      </div>
                    </TabPane>
                    <TabPane tabId="3">
                      <div style={{ width: '100%', height: '262px' }}>
                        <ResponsiveContainer height={250} className="dashboard__area">
                          <AreaChart data={this.state.projects} margin={{ top: 20, left: -15, bottom: 20 }}>
                            <XAxis dataKey="name" tickLine={false} />
                            <YAxis tickLine={false} />
                            <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
                            <Legend />
                            <CartesianGrid />{/*
                            <Area name="Site A" type="monotone" dataKey="a" fill="#4ce1b6" stroke="#4ce1b6" fillOpacity={0.2} />
                            <Area name="Site B" type="monotone" dataKey="b" fill="#70bbfd" stroke="#70bbfd" fillOpacity={0.2} />*/}
                            <Area name="Total Earnings" type="monotone" dataKey="totEarningsNum" fill="#74B5A5" stroke="#74B5A5" fillOpacity={0.2} />
                            <Area name="Average Earnings per Hour" type="monotone" dataKey="avgEarningsHourNum" fill="#479682" stroke="#479682" fillOpacity={0.2} />
                            <Area name="Average Earnings per Ton" type="monotone" dataKey="avgEarningsTonNum" fill="#176A55" stroke="#176A55" fillOpacity={0.2} />
                            <Area name="Average Earnings per Job" type="monotone" dataKey="avgEarningsJobNum" fill="#044F3C" stroke="#044F3C" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div
                        id={"ProjectsGrid"}
                        className="ag-theme-balham"
                        style={{
                          // height: '500px',
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
                          paginationPageSize={25}
                          pagination={true}
                          domLayout="print"
                          rowHeight={60}
                        />
                      </div>
                    </TabPane>
                  </TabContent>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      
    );
  }

  // Images
  renderResultsCarriersPNG() {
    const { loaded } = this.state;

    if (loaded) {
      return (
        <Container className="dashboard">
          <div className="card-body">

            <Row>
              <div className="col-md-12 mt-1">
                <img width="100%" height="100%" src={producerCarrierMetrics} alt=""
                />
              </div>
            </Row>

          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading Carrier Reports...
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
                <img width="100%" height="100%" src={producerProductMetrics} alt=""
                />
              </div>
            </Row>

          </div>
        </Container>
      );
    }
    return (
      <Container>
        Loading Product Reports...
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
            type="Producer"
            showComparison={true}
            ref="filterChild"
            onReturnFilters={this.returnFilters}
            returnCarriers={this.returnCarriers/*(e, f, g) => {              
              console.log(899, e);
              this.setState({
                carriers: e
              });
            }*/}
            returnProducts={this.returnProducts}
            returnProjects={this.returnProjects}
            fetching={(value) => {
              this.setState({ loading: value });
            }}
            page={page}
            rows={rows}
          />

          {/*Render ag-grid table*/}
          {this.renderCarriers()}
          {/* this.renderProducts() */}
          {/* this.renderProjects() */}

          {/*Render Images*/}
          {/*this.renderResultsCarriersPNG()*/}
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

ReportsProducerPage.propTypes = {
  // companyId: PropTypes.number.isRequired
};

ReportsProducerPage.defaultProps = {
  // companyId: null
};

export default ReportsProducerPage;
