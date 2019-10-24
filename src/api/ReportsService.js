// import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/reports';

class ReportsService extends AgentService {

  // ////////////////////////////////////////
  // Daily Report
  static async getJobsDailyReport(filters) {
    const response = await super.post(`${PATH}/jobs/filters`, filters);
    return (response);
  }

  static async getLoadsDailyReport(filters) {
    const response = await super.post(`${PATH}/loads/filters`, filters);
    return (response);
  }

  // ////////////////////////////////////////
  // Comparison Report
  static async getCarriersComparisonReport(filters) {
    // console.log("getCarriersComparisonReport");
    // console.table(filters);
    // console.log("calling API");
    const response = await super.post(`${PATH}/jobs/comparisonCarriers`, filters);
    return (response);
  }

  static async getProducersComparisonReport(filters) {
    // console.log("getProducersComparisonReport");
    // console.table(filters);
    // console.log("calling API");
    const response = await super.post(`${PATH}/jobs/comparisonProducers`, filters);
    return (response);
  }

  static async getProductsComparisonReport(filters) {
    // console.log("getProductsComparisonReport");
    // console.table(filters);
    // console.log("calling API");
    const response = await super.post(`${PATH}/jobs/comparisonProducts`, filters);
    return (response);
  }

  static async getProjectComparisonReport(filters) {
    // console.log("getProjectComparisonReport");
    // console.table(filters);
    // console.log("calling API");
    const response = await super.post(`${PATH}/jobs/comparisonProjects`, filters);
    return (response);
  }

}

export default ReportsService;
