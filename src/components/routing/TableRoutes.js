import React, { Component } from 'react';
import { Route } from 'react-router-dom';
// import CompanyListPage from '../companies/CompanyListPage';
// import CompanySavePage from '../companies/CompanySavePage';
// import AddressListPage from '../addresses/AddressListPage';
// import AddressSavePage from '../addresses/AddressSavePage';
// import UserListPage from '../users/UserListPage';
// import UserSavePage from '../users/UserSavePage';
// import BookingListPage from '../bookings/BookingListPage';
// import BookingSavePage from '../bookings/BookingSavePage';
import JobListPage from '../jobs/JobListPage';
// import JobCarrierListPage from '../jobs/JobCarrierListPage';
// import JobCustomerListPage from '../jobs/JobCustomerListPage';
// import JobPage from '../jobs/JobPage';
import JobSavePage from '../jobs/JobSavePage';
// import EquipmentListCustomerPage from '../equipments/EquipmentListCustomerPage';
// import EquipmentSavePage from '../equipments/EquipmentSavePage';
// import LookupListPage from '../lookups/LookupListPage';
// import LookupSavePage from '../lookups/LookupSavePage';
// import BidListPage from '../bids/BidListPage';
// import BidSavePage from '../bids/BidSavePage';

class TableRoutes extends Component {
  render() {
    return (
      <React.Fragment>

        <Route
          exact
          path="/dashboard"
          component={DashboardPage}
        />
        <Route
          exact
          path="/jobs/save"
          component={JobSavePage}
        />
        <Route path="/jobs/save/:id" component={JobSavePage} />

      </React.Fragment>
    );
  }
}

export default TableRoutes;
