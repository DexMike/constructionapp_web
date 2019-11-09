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
  TabPane,
  ButtonGroup, 
  ButtonToolbar
} from 'reactstrap';
import classnames from 'classnames';
import {useTranslation} from 'react-i18next';
import moment from 'moment';

// ag grid
import { AgGridReact } from 'ag-grid-react';
import { Scrollbars } from 'react-custom-scrollbars';
// import {html2canvas} from '../../../node_modules/html2canvas';
//import * as html2canvas from '../../../node_modules/html2canvas';
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { CSVLink, CSVDownload } from "react-csv";
import StringGenerator from '../utils/StringGenerator';
import TSelectField from '../common/TSelect';
import TCharts from '../common/TCharts';
import FilterComparisonReport from "../filters/FilterComparisonReport";
import ProfileService from '../../api/ProfileService';
import TFormat from '../common/TFormat';

import './Reports.css';
import '../addresses/Address.css';

import BarRenderer from '../../utils/BarRenderer';
import BarFilter from '../../utils/BarFilter';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { string } from 'prop-types';

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

function currencyFormatterRound(params) {
  if (params) {
    return TFormat.currencyFormatterRound(params.value);
  }
  return '$ 0';
}

function percentFormatter(params) {
  return `${formatNumber(params.value * 100)} %`;
}

function compa (a, b) {
  // return a.total > b.total ? 1 : (a.total < b.total ? -1 : 0);
  return a.total > b.total ? 1 : (a.total < b.total ? -1 : 0);
}

window.html2canvas = html2canvas
class ReportsComparison extends Component {
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
      companyType: null,
      jobs: [],
      jobId: 0,
      jobsInfo: [],
      totalJobs: 0,

      loadId: 0,

      carriers: [],
      carrierID: 0,
      carriersInfo: [],
      totalCarriers: 0,

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
      chartVisType: 'totals',

      goToDashboard: false,
      goToUpdateJob: false,

      chartOpts: [],
      compEnabled: false,

      // profile: null
      // Rate Type Button toggle
      filters: {
        status: ''
      },
      page: 0,
      rows: 99,
      totalCount: 10,
      activeTab: '1',
      chartType: 'bar', //area

      // Grid
      defaultColumnDef: {
        sortable: true,
        filter: true,
        // width: 150,
        cellStyle: { 'text-align': 'right'},
        resizable: true,
        suppressSizeToFit: true,
        enableSorting: true
      },

      columnsCarrier: [
        {
          field: 'name',
          headerName: 'Customer Name',
          headerTooltip: "Carrier of Producer",
          // width: 200,
        }, {
          field: 'avgTotEarningsComparison',
          headerName: 'Total Earnings',
          headerTooltip: "Total Earnings for this time period",
          sort: "desc",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          valueFormatter: currencyFormatterRound,
          comparator: compa
        }, {
          field: 'totalJobsComparison',
          headerName: '# of Jobs',
          headerTooltip: "Total number of jobs for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'totalLoadsComparison',
          headerName: '# of Loads',
          headerTooltip: "Total number of loads for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgTonsDeliveredComparison',
          headerName: 'Tons Delivered',
          headerTooltip: "Total number of tons delivered for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgEarningsTonComparison',
          headerName: 'Ton Rate',
          headerTooltip: "Average earnings per ton for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgMilesTraveledComparison',
          headerName: 'Avg. Miles Traveled',
          headerTooltip: "Average miles traveled for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }
      ],

      columnsProducts: [
        {
          field: 'name',
          headerName: 'Material Name',
          headerTooltip: "Name of material",
          // width: 200,
        }, {
          field: 'avgTotEarningsComparison',
          headerName: 'Total Earnings',
          headerTooltip: "Total Earnings for this time period",
          sort: "desc",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          valueFormatter: currencyFormatterRound,
          comparator: compa
        }, {
          field: 'totalJobsComparison',
          headerName: '# of Jobs',
          headerTooltip: "Total number of jobs for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgTonsDeliveredComparison',
          headerName: 'Tons Delivered',
          headerTooltip: "Total number of tons delivered for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgEarningsJobComparison',
          headerName: 'Earnings per Ton Mile',
          headerTooltip: "Average earnings per job for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgEarningsTonComparison',
          headerName: 'Avg. Ton Rate',
          headerTooltip: "Average earnings per ton for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgMilesTraveledComparison',
          headerName: 'Avg. Miles Traveled',
          headerTooltip: "Average miles traveled for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
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
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          valueFormatter: currencyFormatterRound,
          comparator: compa
        }, {
          field: 'totalLoadsComparison',
          headerName: '# of Loads',
          headerTooltip: "Total number of jobs for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgTonsDeliveredComparison',
          headerName: 'Tons Delivered',
          headerTooltip: "Total number of tons delivered for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgEarningsJobComparison',
          headerName: 'Earnings per Ton Mile',
          headerTooltip: "Average earnings per job for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgEarningsTonComparison',
          headerName: 'Ton Rate',
          headerTooltip: "Average earnings per ton for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
        }, {
          field: 'avgMilesTraveledComparison',
          headerName: 'Avg. Miles Traveled',
          headerTooltip: "Average miles traveled for this time period",
          cellRendererFramework: BarRenderer,
          filterFramework: BarFilter,
          comparator: compa
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
    // this.returnProducers = this.returnProducers.bind(this);

    this.returnProducts = this.returnProducts.bind(this);
    this.returnProjects = this.returnProjects.bind(this);

    this.onGridReadyCarriers = this.onGridReadyCarriers.bind(this);
    this.onGridReadyProducers = this.onGridReadyProducers.bind(this);

    this.onGridReadyProducts = this.onGridReadyProducts.bind(this);
    this.onGridReadyProjects = this.onGridReadyProjects.bind(this);
    this.handleChartTypeChange = this.handleChartTypeChange.bind(this);
    this.handleChartVisualizationTypeChange = this.handleChartVisualizationTypeChange.bind(this);

    this.exportToPDF = this.exportToPDF.bind(this);
    this.exportToCSV = this.exportToCSV.bind(this);
    this.hideShowPie = this.hideShowPie.bind(this);
    this.hideAvg = this.hideAvg.bind(this);
  }

  async componentDidMount() {
    const { columnsProjects, columnsCarrier, columnsProducts } = this.state;    
    const profile = await ProfileService.getProfile();
    this.hideShowPie(true);
    // this.hideAvg(true, 425);

    //change labels according to user type
    if (profile.companyType === 'Customer') {

      // columnsProjects
      for (const obj of columnsProjects) {
        this.setLabelsCustomer(obj);
      }

      // columnsCarrier
      for (const obj of columnsCarrier) {
        this.setLabelsCustomer(obj);
      }

      // columnsProduct
      for (const obj of columnsProducts) {
        this.setLabelsCustomer(obj);
      }
    }

    // if a carrier remove costPerTonMileComparison
    if (profile.companyType === 'Carrier') {
      this.removeCost(columnsCarrier);
      this.removeCost(columnsProducts);
      this.removeCost(columnsProjects);
    }

    this.setState({   
      profile,
      loaded: true,
      companyType: profile.companyType
    });
  }

  onGridReadyCarriers(params) {
    this.gridApiProducers = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onGridReadyProducers(params) {
    this.gridApiProducers = params.api;
    this.gridColumnApi = params.columnApi;
  }


  onGridReadyProducts(params) {
    this.gridApiProducers = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onGridReadyProjects(params) {
    this.gridApiProjects = params.api;
    this.gridColumnApi = params.columnApi;
  }

  setLabelsCustomer (obj) {
    const newObj = obj;
    /*
    if (obj.field === 'name') {
      newObj.headerName = 'Carrier Name';
      newObj.headerTooltip = 'Carrier of Producer';
    }
    */
    if (obj.field === 'avgTotEarningsComparison') {
      newObj.headerName = 'Total Cost';
      newObj.headerTooltip = 'Total Cost for this time period';
    }
    /*
    if (obj.field === 'avgEarningsHourComparison') {
      obj.headerName = 'Avg. Costs/Hour';
      obj.headerTooltip = 'Average costs per hour for this time period';
    }*/
    if (obj.field === 'avgEarningsJobComparison') {
      // obj.headerName = 'Avg. Cost/Job';
      newObj.headerName = 'Cost per Ton Mile';
      newObj.headerTooltip = 'Average costs per job for this time period';
    }
    if (obj.field === 'avgEarningsTonComparison') {
      newObj.headerName = 'Rate per Ton';
      newObj.headerTooltip = 'Average rate per ton for this time period';
    }
    return newObj;
  }

  hideShowPie (show) {
    const { chartOpts } = this.state;
    let opts = [
      {
        value: 'bar',
        label: 'Bar'
      }, {
        value: 'area',
        label: 'Area'
      }, {
        value: 'pie',
        label: 'Pie'
      }
    ];

    if (!show) {
      opts.pop();
    }
    this.setState({
      chartOpts: opts
    });
  }

  hideAvg (show, caller) {
    let { columnsProducts } = this.state;
    if (show) {
      const avgMiles = {
        field: 'avgMilesTraveledComparison',
        headerName: 'Avg. Miles Traveled',
        headerTooltip: "Average miles traveled for this time period",
        // renderer
        // enableValue: true,
        cellRendererFramework: BarRenderer,
        filterFramework: BarFilter
      }
      columnsProducts.push(avgMiles);
      
    } else {
      columnsProducts.pop();
    }
    this.setState({
      columnsProducts
    }, () => {
      // console.log("TCL: ReportsComparison -> hideAvg -> columnsProducts", columnsProducts, show)
    })
  }

  removeCost(columns) {
    for(let i = 0; i < columns.length; i += 1) {
      if (columns[i].field === 'costPerTonMileComparison') {
        columns.splice(i, 1);
        break;
      }
    }
  }

  toggle(tab) {
    let { chartType, activeTab } = this.state;
    if (activeTab !== tab) {

      // hide pie for jobs
      if (tab === '3') {
        this.hideShowPie(false);
        chartType = 'bar';
      } else {
        this.hideShowPie(true);
      }

      // hide avgmilesTraveled for Materials
      /*
      if (tab === '2') {
        this.hideAvg(true, 577);
      } else {
        this.hideAvg(false, 579);
      }
      */

      this.setState({
        activeTab: tab,
        chartType
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
    return Number(String(num).replace(/[^0-9-\.]+/g, ""));
  }

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
  /*
  returnProducers(producers, filters, metadata, enabled) {
    console.log("TCL: ReportsComparison -> returnProducers -> enabled", enabled)
    const {totalCount} = metadata;
    this.setState({
      producers,
      filters,
      totalProducers: totalCount,
      compEnabled: enabled
    });
  }
  */

  returnCarriers(carriers, filters, metadata, enabled) {
    const {totalCount} = metadata;
    this.setState({
      carriers,
      filters,
      totalCarriers: totalCount,
      compEnabled: enabled
    });
  }

  returnProducts(products, filters, metadata, enabled) {
    const {totalCount} = metadata;
    this.setState({
      products,
      filters,
      totalProducts: totalCount,
      compEnabled: enabled
    });
  }

  returnProjects(projects, filters, metadata, enabled) {
    const {totalCount} = metadata;
    this.setState({
      projects,
      filters,
      totalProject: totalCount,
      compEnabled: enabled
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
    filters
  ) {
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

  handleChartTypeChange(e) {
    this.setState({ chartType: e.value });
  }

  handleChartVisualizationTypeChange(e) {
    this.setState({ chartVisType: e.value });
  }

  exportToPDF() {
    window.scrollTo(0, 0);
    const input = document.getElementById('visualizations');
    html2canvas(input)
      .then((canvas) => {
        const img = canvas.toDataURL('image/jpeg', 0.5);
        let marginTop = 5;
        let marginLeft = 5;

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        const width = Math.round(doc.internal.pageSize.getWidth());    
        const height = Math.round(doc.internal.pageSize.getHeight());

        try {
          doc.addImage(
            img,
            'JPEG',
            marginLeft,
            marginTop,
            width - 10,
            height - 10,
            StringGenerator.getDateString(),
            70,
            0
          );
        } catch(e) {
          console.log('PDF Error: ', e);
        }
        
        doc.save(`Report_${StringGenerator.getDateString()}.pdf`);
      });
  }

  exportToCSV() {
    window.simulateClick = (event) => {
      event.click()
    }
  }

  extractCSVInfo(data) {
    let newData = [];
    const { activeTab } = this.state;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })

    if (activeTab === '1') {
      newData = data.map(d => ({
        'Material Name': d.name,
        'Total Cost': formatter.format(d.totEarnings),
        '# of Jobs': Number(d.numJobs),
        'Tons Delivered': Number(d.tonsDelivered),
        'Cost per Ton Mile': formatter.format(d.avgEarningsJob),
        'Rate per Ton': formatter.format(d.avgEarningsHour),
        'Average Miles Traveled': Number(d.avgMilesTraveled),
      }))
      return newData;
    }
    if (activeTab === '2') {
      newData = data.map(d => ({
        'Customer Name': d.name,
        'Total Cost': formatter.format(d.totEarnings),
        '# of Jobs': Number(d.numJobs),
        '# of Loads': Number(d.numLoads),
        'Tons Delivered': Number(d.tonsDelivered),
        'Rate per Ton': formatter.format(d.avgEarningsTon),
        'Average Miles Traveled': Number(d.avgMilesTraveled),
      }))
      return newData;
    }
    if (activeTab === '3') {
      newData = data.map(d => ({
        'Job Name': d.name,
        'Total Cost': formatter.format(d.totEarnings),
        '# of Loads': Number(d.numLoads),
        'Tons Delivered': Number(d.tonsDelivered),
        'Cost per Ton Mile': formatter.format(d.avgEarningsJob),
        'Rate per Ton': formatter.format(d.avgEarningsTon),
        'Average Miles Traveled': Number(d.avgMilesTraveled),
      }))
      return newData;
    }
    return [];
  }

  renderChart(type, data, title) {
    const { chartVisType, companyType, compEnabled } = this.state;
    
    // set some dummy data so that the graph doesn't crash
    if (data.length === 0) {
      data = [
        {
          avgEarningsHour: 0,
          avgEarningsHourComp: 0,
          avgEarningsJob: 0,
          avgEarningsJobComp: 0,
          avgEarningsTon: 0,
          avgEarningsTonComp: 0,
          avgMilesTraveled: null,
          avgMilesTraveledComp: null,
          costPerTonMile: 0,
          costPerTonMileComp: 0,
          endAvailDateComp: null,
          id: 0,
          name: "--",
          numJobs: 0,
          numJobsComp: 0,
          numLoads: 0,
          numLoadsComp: 0,
          page: null,
          rows: null,
          startAvailDateComp: null,
          tonsDelivered: null,
          tonsDeliveredComp: null,
          totEarnings: 0,
          totEarningsComp: 0,
        }
      ]
    }

    return (
      <TCharts
        data={data}
        type={type}
        visType={chartVisType}
        style={{ width: '100%' }}
        profile={companyType}
        compEnabled={compEnabled}
        title={title}
      />
    )
  }

  renderTable(columns, defaultData, data, onGridReady) {
    const { activeTab, compEnabled } = this.state;
    
    let newData = data;
    let colHeight = 60;
    if (Number(activeTab) === 3 || !compEnabled) {
      colHeight = 28;
    }
    // this.compHeight(showComp)
    return (
      <AgGridReact
        columnDefs={columns}
        defaultColDef={defaultData}
        rowData={data}
        // floatingFilter={true}
        onGridReady={onGridReady}
        paginationPageSize={15}
        pagination
        domLayout="print"
        rowHeight={colHeight}
        style={{ width: '2000px' }}
      />
    )
  }

  renderVisualizations() {
    let {
      carriers,
      products,
      projects,
      chartType,
      chartVisType,
      activeTab,
      companyType,
      columnsCarrier,
      columnsProducts,
      columnsProjects,
      defaultColumnDef,
      chartOpts
    } = this.state;  

    let dataToPrint = [];
    let dataToRender = [];
    let dataToRenderA = [];
    let columnsToRender = [];
    let csvName = '';
    let title = '';

    // prepare data for CSV printing
    if (activeTab === '1') {
      dataToPrint = this.extractCSVInfo(products);
      dataToRender = products;
      columnsToRender = columnsProducts;
      csvName = 'Materials';
      title = "Materials";
    } else if (activeTab === '2') {
      dataToPrint = this.extractCSVInfo(carriers);
      dataToRender = carriers;
      columnsToRender = columnsCarrier;
      csvName = 'Carrier';
      title = "Companies";
    } else if (activeTab === '3') {
      dataToPrint = this.extractCSVInfo(projects);
      dataToRender = projects;
      columnsToRender = columnsProjects;
      csvName = 'Jobs';
      title = "Job";
    }

    // const {t} = useTranslation();
    
    return (
      <Row id="visualizations">
        
        <Col md={12}>
          <Card>
            <CardBody>
              <Row data-html2canvas-ignore="true" className="menuOnTop">
                <Col md={4}>
                  <h5 className="bold-text">Results in time range</h5>
                  <h5 className="subhead">Click on the tabs in order to see the corresponding info.</h5>
                </Col>
                <Col md={4}>
                  <ButtonToolbar className="float-sm-left">
                    <ButtonGroup className="btn-group--icons">
                      <Button
                        outline
                        onClick={() => this.exportToPDF()}
                        >Export chart as PDF &nbsp; 
                        <span className="lnr lnr-cloud-download" />
                      </Button>
                    </ButtonGroup>
                    <ButtonGroup className="btn-group--icons">
                      <CSVLink data={dataToPrint} filename={`Report_${csvName}_${StringGenerator.getDateString()}.csv`}>
                        <Button
                          outline
                        >Export data as CSV &nbsp; 
                          <span className="lnr lnr-chart-bars" />
                        </Button>
                      </CSVLink>
                      {/*
                      <Button outline><span className="lnr lnr-heart-pulse" /></Button>
                      <Button outline><span className="lnr lnr-cog" /></Button>
                      <Button outline><span className="lnr lnr-magic-wand" /></Button> */}
                    </ButtonGroup>
                  </ButtonToolbar>
                </Col>
                <Col md={2}>
                  <TSelectField
                    input={
                      {
                        onChange: this.handleChartVisualizationTypeChange,
                        name: 'chartVisType',
                        value: chartVisType
                      }
                    }
                    value={chartType}
                    options={[
                      {
                        value: 'totals',
                        label: 'Totals'
                      }, {
                        value: 'averagesHourAndTon',
                        label: 'Averages per Hour and Ton'
                      }, {
                        value: 'averagesJob',
                        label: 'Averages per Job'
                      }, {
                        value: 'costTonMile',
                        label: 'Cost per Ton/Mile'
                      }, {
                        value: 'tonsDelivered',
                        label: 'Tons Delivered'
                      }
                    ]}
                    placeholder="Visualization type"
                  />
                </Col>
                <Col md={2}>
                  <TSelectField
                    input={
                      {
                        onChange: this.handleChartTypeChange,
                        name: 'chartType',
                        value: chartType
                      }
                    }
                    value={chartType}
                    options={chartOpts}
                    placeholder="Select current status of the bid"
                  />
                </Col>
              </Row>
              <div className="tabs">
                <div className="tabs__wrap">
                  <Nav tabs data-html2canvas-ignore="true">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '1' })}
                        onClick={() => {
                          this.toggle('1');
                        }}
                      >
                        Materials
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '2' })}
                        onClick={() => {
                          this.toggle('2');
                        }}
                      >
                        {
                          (companyType === 'Customer') 
                            ? 'Carrier' : 'Producers'
                        }
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '3' })}
                        onClick={() => {
                          this.toggle('3');
                        }}
                      >
                        Jobs
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      <div style={{ width: '100%', height: '400px' }}>
                        {this.renderChart(chartType, products, title)}
                      </div>
                    </TabPane>
                    <TabPane tabId="2">
                      <div style={{ width: '100%', height: '400px' }}>
                        {this.renderChart(chartType, carriers, title)}
                      </div>
                    </TabPane>
                    <TabPane tabId="3">
                      <div style={{ width: '100%', height: '400px' }}>
                        {this.renderChart(chartType, projects, title)}
                      </div>
                    </TabPane>
                  </TabContent>
                </div>
              </div>

              <Scrollbars
                autoHeight
                autoHeightMin={0}
                autoHeightMax={800}
                // disableVerticalScrolling
                >
                <div className="ag-theme-balham gridTable">
                  {
                    this.renderTable(
                      columnsToRender,
                      defaultColumnDef,
                      dataToRender,
                      this.onGridReadyCarriers
                    )
                  }
                </div>                
              </Scrollbars>
            </CardBody>
          </Card>
        </Col>
      </Row>
      
    );
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    return false;
  }

  renderTitle() {
    return (
      <PageTitle />
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
    const { loaded, page, rows, companyType } = this.state;

    if (loaded) {
      
      return (
        <Container className="dashboard">
          {this.renderGoTo()}
          {this.renderTitle()}
          <FilterComparisonReport
            type={companyType}
            showComparison
            ref="filterChild"
            onReturnFilters={this.returnFilters}
            // returnProducers={this.returnProducers}
            returnCarriers={this.returnCarriers}
            returnProducts={this.returnProducts}
            returnProjects={this.returnProjects}
            fetching={(value) => {
              this.setState({ loading: value });
            }}
            page={page}
            rows={rows}
          />
          {this.renderVisualizations()}
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

ReportsComparison.propTypes = {
  // companyId: PropTypes.number.isRequired
};

ReportsComparison.defaultProps = {
  // companyId: null
};

export default ReportsComparison;