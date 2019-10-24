const columnsCarrier = [
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
];

const columnsProducer = [
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
];

const columnsProducts = [
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
];

const columnsProjects = [
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
];

class ReportsComparisonColumns {     
  static getCarrierColumns() {
    const object = {
      producer: columnsProducer,
      products: columnsProducts,
      projects: columnsProjects
    };
    return (object);
  }

  static getProducerColumns() {
    const object = {
      carrier: columnsCarrier,
      products: columnsProducts,
      projects: columnsProjects
    };
    return (object);
  }
}

export default ReportsComparisonColumns;
