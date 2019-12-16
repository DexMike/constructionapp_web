import moment from 'moment';
import TFormat from '../common/TFormat';

function currencyFormatter(params) {
  if (params) {
    return TFormat.currencyFormatter(params.value);
  }
  return '$ 0.00';
}

function currencyFormatterRound(params) {
  if (params) {
    return TFormat.currencyFormatterRound(params.value);
  }
  return '$ 0';
}

function numberFormatter(params) {
  if (params) {
    return TFormat.formatNumber(params.value);
  }
  return '0';
}

// function percentFormatter(params) {
//   return TFormat.formatPercent(params.value);
// }

function dhmsFormatter(params) {
  if (params) {
    return TFormat.asMinutesToDHms(params.value);
  }
  return '0';
}

function decimalFormatter(params) {
  if (params) {
    return TFormat.formatNumberDecimal(params.value);
  }
  return '0';
}

// https://stackoverflow.com/questions/22600856/moment-js-date-time-comparison
function dateComparator(date1, date2) {
  if (date1 > date2) {
    return 1;
  }
  if (date1 < date2) {
    return -1;
  }
  return 0;
}

// Helper function to do date comparison in sorting
// Move to TFormat?

function numberComparator(num) {
  // console.log("*** numberComparator");
  return Number(String(Math.abs(num)).replace(/[^0-9-\.]+/g, ''));
}

const columnsJobs = [
  {
    headerName: 'Jobs',
    children: [
      {
        field: 'date',
        headerName: 'Date',
        headerTooltip: 'Date',
        comparator: dateComparator,
        width: 125,
        cellStyle: { 'text-align': 'center'},
        sort: 'desc'
      }, {
        field: 'completedJobs',
        headerName: 'Completed',
        headerTooltip: '# of completed jobs',
        filter: true,
        sortable: true,
        // comparator: numberComparator,
        // valueFormatter: numberFormatter,
        // filter: 'agNumberColumnFilter',
        width: 100
      }, {
        field: 'notCompletedJobs',
        headerName: 'Not Completed',
        headerTooltip: '# of not completed jobs',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: numberFormatter,
        filter: 'agNumberColumnFilter',
        width: 125
      }, {
        field: 'jobsInProgress',
        headerName: 'In Progress',
        headerTooltip: '# of jobs in progress',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: numberFormatter,
        filter: 'agNumberColumnFilter',
        width: 110
      }, {
        field: 'totalJobs',
        headerName: 'Total Jobs',
        headerTooltip: 'Total number of Jobs',
        comparator: numberComparator,
        filter: 'agNumberColumnFilter',
        valueFormatter: numberFormatter,
        width: 110
      }, {
        field: 'totalLoads',
        headerName: 'Total Loads',
        headerTooltip: '# of loads on that day',
        filter: true,
        sortable: true,
        // comparator: numberComparator,
        // valueFormatter: numberFormatter,
        // filter: 'agNumberColumnFilter',
        width: 110
      }/* , {
        field: 'rateTon',
        headerName: 'Rate per Ton',
        headerTooltip: 'Rate $ per Ton',
        comparator: numberComparator,
        filter: 'agNumberColumnFilter',
        valueFormatter: currencyFormatter
      }/*, {
        field: 'rateHour',
        headerName: 'Rate: $/Hour',
        headerTooltip: 'Rate $/Hour',
        comparator: numberComparator,
        filter: 'agNumberColumnFilter',
        valueFormatter: currencyFormatter
      }
      , {
        field: 'potentialEarnings',
        headerName: 'Potential Earnings',
        headerTooltip: 'Potential Earnings',
        comparator: numberComparator,
        filter: 'agNumberColumnFilter',
        valueFormatter: currencyFormatter,
        width: 140
      }, {
        field: 'totalMarketValue',
        headerName: 'Total Market Value',
        headerTooltip: 'Total Market Value',
        comparator: numberComparator,
        filter: 'agNumberColumnFilter',
        valueFormatter: currencyFormatter,
        width: 150
      } */
    ]
  }, {
    headerName: '',
    children: [
      /*
      { // Not visible for carriers
        field: 'avgMinutesToFirstAccepted',
        headerName: 'Time to First Accepted',
        headerTooltip: 'Average number of minutes from job posting to first person to accept a job',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: dhmsFormatter,
        width: 170
      }, */{
        field: 'avgRevenuePerDay',
        headerName: 'Revenue per Day',
        headerTooltip: 'Average revenue per day',
        filter: true,
        sortable: true,
        // comparator: numberComparator,
        valueFormatter: currencyFormatterRound
      }, /* {
        field: 'avgSizeOfJobByTon',
        headerName: 'Average Tons per Job',
        headerTooltip: 'Average size of job by tons',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: decimalFormatter,
        width: 160
      }, */ {
        field: 'totalTonsHauled',
        headerName: 'Total Tons Hauled',
        headerTooltip: 'Total tons hauled per day',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: decimalFormatter,
        width: 140
      }, /* {
        field: 'avgJobTime',
        headerName: 'Job Duration',
        headerTooltip: 'Average time between a first load and job being closed',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: dhmsFormatter
      }, */{
        field: 'avgDistance',
        headerName: 'Distance (mi)',
        headerTooltip: 'Average distance for a job',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: decimalFormatter
      }
    ]
  }
];

const columnsLoads = [
  {
    headerName: 'Loads',
    children: [
      {
        field: 'date',
        headerName: 'Date',
        headerTooltip: 'Date',
        filter: true,
        sortable: true,
        comparator: dateComparator,
        cellStyle: { 'text-align': 'center' },
        sort: 'desc'
      }, {
        field: 'totalNumberOfLoads',
        headerName: 'Loads',
        headerTooltip: 'Total # of loads',
        filter: true,
        sortable: true,
        comparator: numberComparator
      }, {
        field: 'totalNumberOfCompletedLoads',
        headerName: 'Completed',
        headerTooltip: 'Total # of completed loads',
        filter: true,
        sortable: true,
        comparator: numberComparator
      }, {
        field: 'totalDistanceTravelled',
        headerName: 'Distance travelled',
        headerTooltip: 'Total distance travelled for all loads',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: decimalFormatter
      }
    ]
  }, {
    headerName: 'Average',
    children: [
      {
        field: 'distance',
        headerName: 'Distance',
        headerTooltip: 'Average distance travelled for all loads',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: decimalFormatter
      }, {
        field: 'avgLoadCompletionTime',
        headerName: 'Completion Time',
        headerTooltip: 'Average time between load start and load end',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: dhmsFormatter
      }, {
        field: 'avgSizeOfLoadByTon',
        headerName: 'Size (By Ton)',
        headerTooltip: 'Average size of a load in tons',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: decimalFormatter
      }, {
        field: 'avgPricePerTonByTon',
        headerName: '$ / Ton (By Ton)',
        headerTooltip: 'Average $ / Ton',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: currencyFormatter
      }, {
        field: 'avgPricePerHourByHour',
        headerName: '$ / Hour (By Hour)',
        headerTooltip: 'Average $ / Hour',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: currencyFormatter
      }, {
        field: 'avgSizeOfLoadByHour',
        headerName: 'Size (By Hour)',
        headerTooltip: 'Average size load by Hour',
        filter: true,
        sortable: true,
        comparator: numberComparator,
        valueFormatter: decimalFormatter
      }
    ]
  }
];

class ReportsDailyReportsColumns {
  static getJobsColumns(companyType) {
    const columns = columnsJobs;
    if (companyType === 'Carrier') {
      columns[0].children.splice(6, 7);
      columns[1].children.splice(0, 1);
    }
    return (columns);
  }

  static getLoadsColumns(companyType) {
    return (columnsLoads);
  }
}

export default ReportsDailyReportsColumns;
