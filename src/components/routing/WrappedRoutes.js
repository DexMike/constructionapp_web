import React, { PureComponent } from 'react';
import { Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import DashboardPage from '../dashboard/DashboardPage';
// import DashboardCarrierPage from '../dashboard/DashboardCarrierPage';
// import DashboardCustomerPage from '../dashboard/DashboardCustomerPage';

// import JobPage from '../jobs/JobPage';
// import JobCarrierListPage from '../jobs/JobCarrierListPage';
// import JobCustomerListPage from '../jobs/JobCustomerListPage';
import JobListPage from '../jobs/JobListPage';
import JobSavePage from '../jobs/JobSavePage';
import EquipmentListCustomerPage from '../equipments/EquipmentListCustomerPage';

// No longer using TableRoutes
// import TableRoutes from './TableRoutes';

// import CompanyListPage from '../companies/CompanyListPage';
// import CompanySavePage from '../companies/CompanySavePage';
// import AddressListPage from '../addresses/AddressListPage';
// import AddressSavePage from '../addresses/AddressSavePage';
// import UserListPage from '../users/UserListPage';
// import UserSavePage from '../users/UserSavePage';
// import BookingListPage from '../bookings/BookingListPage';
// import BookingSavePage from '../bookings/BookingSavePage';
// import EquipmentListCustomerPage from '../equipments/EquipmentListCustomerPage';
// import EquipmentSavePage from '../equipments/EquipmentSavePage';
// import LookupListPage from '../lookups/LookupListPage';
// import LookupSavePage from '../lookups/LookupSavePage';
// import BidListPage from '../bids/BidListPage';
// import BidSavePage from '../bids/BidSavePage';

// removing use of external file for TableRoutes
// <div className="container__wrap">
//           {/*<Route path="/tables" component={TableRoutes}/>*/}

class WrappedRoutes extends PureComponent {
  render() {
    return (
      <div>
        <Layout/>
        <div className="container__wrap">

          <Route
            exact
            path="/"
            component={DashboardPage}
          />

          <Route
            exact
            path="/dashboard"
            component={DashboardPage}
          />

          <Route
            exact
            path="/jobs"
            component={JobListPage}
          />
          <Route
            exact
            path="/jobs/save"
            component={JobSavePage}
          />
          <Route path="/jobs/save/:id" component={JobSavePage} />
          {/*<Route exact path="/trucks" component={EquipmentListCustomerPage} />*/}

        </div>
      </div>
    );
  }
}

export default WrappedRoutes;
