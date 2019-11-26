import React, { Component } from 'react';
import './jobs.css';
import { AgGridReact } from 'ag-grid-react';
// import moment from 'moment';
// import { Scrollbars } from 'react-custom-scrollbars';
// import TFormat from '../common/TFormat';
import { withTranslation } from 'react-i18next';

class JobAllocatedTrucksModal extends Component {
  constructor(props) {
    super(props);
    const { t } = { ...this.props };

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
          headerName: t('Name'),
          // width: 160,
          cellStyle: { 'text-align': 'center'},
          sort: 'desc'
        }, {
          field: 'type',
          headerName: t('Type'),
          // width: 160,
          cellStyle: { 'text-align': 'center'},
          sort: 'desc'
        }, {
          field: 'licensePlate',
          headerName: t('License Plate'),
          // width: 160,
          cellStyle: { 'text-align': 'center'},
          sort: 'desc'
        }, {
          field: 'driver',
          headerName: t('Driver'),
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
    const { t } = { ...this.props };
    return (
      <div className="dashboard jobAllocatedTrcuksModal">
        <h3 className="title">
          <span>{t('Allocated Trucks')}</span>
        </h3>
        { // no scrolbars needed for the moment but will use if we have more columns
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

export default withTranslation()(JobAllocatedTrucksModal);
