import React, { Component } from 'react';
import './jobs.css';
import { AgGridReact } from 'ag-grid-react';
// import moment from 'moment';
// import { Scrollbars } from 'react-custom-scrollbars';
// import TFormat from '../common/TFormat';

class JobAllocatedTrucksModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      trucks: [],

      // Grid
      defaultColumnDef: {
        sortable: true,
        filter: true,
        // width: auto,
        cellStyle: { 'text-align': 'right'},
        resizable: true
        // suppressSizeToFit: true
      },
      columnsJobs: [
        {
          field: 'name',
          rowGroupIndex: null,
          headerName: 'Name',
          // width: 160,
          cellStyle: { 'text-align': 'center'},
          sort: 'desc'
        }, {
          field: 'type',
          headerName: 'Type',
          // width: 160,
          cellStyle: { 'text-align': 'center'},
          sort: 'desc'
        }, {
          field: 'licensePlate',
          headerName: 'License Plate',
          // width: 160,
          cellStyle: { 'text-align': 'center'},
          sort: 'desc'
        }, {
          field: 'driver',
          headerName: 'Driver',
          // width: 160,
          cellStyle: { 'text-align': 'center'},
          sort: 'desc'
        }
      ]
    };
    // Binds
    this.onGridReadyJobs = this.onGridReadyJobs.bind(this);
  }

  async componentDidMount() {
    const { trucks } = this.props;
    this.setState({trucks});
  }

  onGridReadyJobs(params) {
    this.gridApiJobs = params.api;
    this.gridColumnApi = params.columnApi;
  }

  render() {
    const { columnsJobs, defaultColumnDef, trucks } = this.state;
    return (
      <div className="dashboard">
        <h3 className="tittleModalDateJob">
          <span>Trucks Allocated to this Job</span>
        </h3>
        { // no scrolbars neede for the moment but will use if we have more columns
          /*
          <Scrollbars
          autoHeight
          autoHeightMin={0}
          autoHeightMax={800}
        >
        </Scrollbars>
          */
        }
        <div
          id="dateJobsGrid"
          className="ag-theme-balham gridTableTruckList"
          data-html2canvas-ignore="true"
        >
          <AgGridReact
            columnDefs={columnsJobs}
            defaultColDef={defaultColumnDef}
            rowData={trucks}
            // floatingFilter={true}
            onGridReady={this.onGridReadyJobs}
            paginationAutoPageSize
            pagination
            domLayout="print"
            // style={{ width: '900px' }}
          />
        </div>
      </div>
    );
  }
}

export default JobAllocatedTrucksModal;
