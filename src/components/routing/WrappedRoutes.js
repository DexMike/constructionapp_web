import React, { PureComponent } from 'react';
import { Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import TableRoutes from './TableRoutes';
import DashboardPage from '../DashboardPage';

class WrappedRoutes extends PureComponent {
  render() {
    return (
      <div>
        <Layout/>
        <div className="container__wrap">
          <Route path="/" component={DashboardPage}/>
          <Route path="/tables" component={TableRoutes}/>
        </div>
      </div>
    );
  }
}

export default WrappedRoutes;
