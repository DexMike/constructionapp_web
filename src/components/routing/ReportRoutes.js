import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import ReportsCarrierPage from "../reports/ReportsCarrrierPage";
import ReportsProducerPage from "../reports/ReportsProducerPage";
import ReportsDailyReportPage from "../reports/ReportsDailyReportPage";
import ReportsPage from '../reports/ReportsPage';

class ReportRoutes extends Component {
  render() {
    return (
      <React.Fragment>
        <Route
          exact
          path="/reports/dailyreport"
          component={ReportsDailyReportPage}
        />
        <Route
          exact
          path="/reports/carrier"
          component={ReportsCarrierPage}
        />
        <Route
          exact
          path="/reports/producer"
          component={ReportsProducerPage}
        />
        <Route
          exact
          path="/reports/comparison"
          component={ReportsPage}
        />
      </React.Fragment>
    );
  }
}

export default ReportRoutes;
