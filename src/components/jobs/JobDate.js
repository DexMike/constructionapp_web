import React, { Component } from 'react';
import './jobs.css';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';

function dateFormatter(date) {
  const dateClean = date.value / 1000;
  return moment.unix(dateClean).format('MMMM Do, YYYY h:mm:ss A');
}

class JobDate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      status: '',
      startTime: null,
      endTime: null,
      rateType: '',
      rate: 0,

      // Grid
      defaultColumnDef: {
        sortable: true,
        filter: true,
        width: 130,
        cellStyle: { 'text-align': 'right'},
        resizable: true,
        suppressSizeToFit: true
      },
      columnsJobs: [
        {
          field: 'name',
          headerName: 'Name',
          headerTooltip: 'Name',
          width: 160,
          cellStyle: { 'text-align': 'center'},
          sort: 'desc'
        }, {
          field: 'status',
          headerName: 'Status',
          headerTooltip: 'Job Status',
          width: 160,
          cellStyle: { 'text-align': 'center'},
          filter: true,
          sortable: true
        }, {
          field: 'actualTravelDistance',
          headerName: 'Travel Distance',
          headerTooltip: 'Actual Travel Distance',
          width: 160,
          cellStyle: { 'text-align': 'center'},
          filter: true,
          sortable: true
        }, {
          field: 'startTime',
          headerName: 'Start Time',
          headerTooltip: 'Start Time',
          width: 145,
          cellStyle: { 'text-align': 'center'},
          filter: true,
          sortable: true,
          valueFormatter: dateFormatter
        }, {
          field: 'endTime',
          headerName: 'End Time',
          headerTooltip: 'End Time',
          width: 145,
          cellStyle: { 'text-align': 'center'},
          filter: true,
          sortable: true,
          valueFormatter: dateFormatter
        }, {
          field: 'rateType',
          headerName: 'Rate Type',
          headerTooltip: 'Rate Type',
          width: 130,
          cellStyle: { 'text-align': 'center'},
          filter: true,
          sortable: true
        }, {
          field: 'rate',
          headerName: 'Rate',
          headerTooltip: 'Rate',
          width: 130,
          cellStyle: { 'text-align': 'center'},
          filter: true,
          sortable: true
        }
      ]
    };
    // Binds
    this.onGridReadyJobs = this.onGridReadyJobs.bind(this);
  }

  async componentDidMount() {
    const { jobsDate } = this.props;
  }

  componentWillReceiveProps(nextProps) {
    const { job } = this.props;
    if (nextProps.job !== job) {
      this.setState({job});
    }
  }

  onGridReadyJobs(params) {
    this.gridApiJobs = params.api;
    this.gridColumnApi = params.columnApi;
  }

  render() {
    const { columnsJobs, defaultColumnDef } = this.state;
    const { jobsDate } = this.props;
    return (
      <div className="dashboard">
        <h3 className="tittleModalDateJob">
          <span>Jobs per Day</span>
        </h3>
        <Scrollbars
          autoHeight
          autoHeightMin={0}
          autoHeightMax={800}
          // disableVerticalScrolling
        >
          <div
            id="dateJobsGrid"
            className="ag-theme-balham gridTableDateJob"
            data-html2canvas-ignore="true"
          >
            <AgGridReact
              columnDefs={columnsJobs}
              defaultColDef={defaultColumnDef}
              rowData={jobsDate}
              // floatingFilter={true}
              onGridReady={this.onGridReadyJobs}
              paginationAutoPageSize
              pagination
              domLayout="print"
              style={{ width: '2100px' }}
            />
          </div>
        </Scrollbars>
      </div>
    );
  }
}

export default JobDate;
