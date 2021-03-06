import React, { PureComponent } from 'react';
import { Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import DashboardPage from '../dashboard/DashboardPage';
import JobListPage from '../jobs/JobListPage';
import JobSavePage from '../jobs/JobSavePage';
import EquipmentListPage from '../equipments/EquipmentListPage';
import EquipmentSavePage from '../equipments/EquipmentSavePage';
import UserPage from '../users/UserPage';
import DriverListPage from '../drivers/DriverListPage';
import DriverForm from '../drivers/DriverForm';
// import UserListPage from '../users/UserListPage';
import UserSavePage from '../users/UserSavePage';
import TrucksList from '../trucksList/TrucksList';
import CarriersCustomerPage from '../trucksList/CarriersCustomerPage';
import MarketplaceCarrierPage from '../marketplace/MarketplaceCarrierPage';
import SettingsPage from '../settings/SettingsPage';
import CompanySettingsPage from '../settings/CompanySettingsPage';
import JobCreatePage from '../jobs/JobCreatePage';
import FileUploadPage from '../FileUploadPage';
import ReportsPage from '../reports/ReportsPage';
import PaymentsPage from '../payments/PaymentsPage';
import PaymentDetails from '../payments/PaymentDetails';
import EquipmentGeneralMap from '../equipments/EquipmentGeneralMap';
import AddressListPage from '../addresses/AddressListPage';
import ReportRoutes from './ReportRoutes';

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
            path="/marketplace"
            component={MarketplaceCarrierPage}
          />

          <Route
            exact
            path="/payments"
            component={PaymentsPage}
          />

          <Route
            exact
            path="/payments/:id"
            component={PaymentDetails}
          />

          <Route
            exact
            path="/reports"
            component={ReportsPage}
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

          <Route
            exact
            path="/JobCreate"
            component={JobCreatePage}
          />

          <Route
            exact
            path="/trucks"
            component={EquipmentListPage}
          />
          <Route
            exact
            path="/trucks/save"
            component={EquipmentSavePage}
          />
          <Route path="/trucks/save/:id" component={EquipmentSavePage} />

          <Route
            exact
            path="/users"
            // component={UserListPage}
            component={UserPage}
          />
          <Route
            exact
            path="/users/save"
            component={UserSavePage}
          />
          <Route path="/users/save/:id" component={UserSavePage} />

          <Route
            exact
            path="/drivers"
            component={DriverListPage}
          />

          <Route
            exact
            path="/drivers/save/:id"
            component={DriverForm}
          />

          <Route
            exact
            path="/users/carriers/save"
            component={UserSavePage}
          />
          <Route path="/users/carrier/save/:id" component={UserSavePage} />

          <Route
            exact
            path="/users/customers/save"
            component={UserSavePage}
          />
          <Route path="/users/customers/save/:id" component={UserSavePage} />

          <Route
            exact
            path="/trucksList"
            component={TrucksList}
          />

          <Route
            exact
            path="/carrierslist"
            component={CarriersCustomerPage}
          />

          <Route
            exact
            path="/settings/:id?"
            component={SettingsPage}
          />

          <Route
            exact
            path="/company/settings"
            component={CompanySettingsPage}
          />

          <Route
            exact
            path="/fileupload"
            component={FileUploadPage}
          />

          <Route
            exact
            path="/generalmap"
            component={EquipmentGeneralMap}
          />

          <Route
            exact
            path="/company/addresses"
            component={AddressListPage}
          />

          <Route
            path="/reports"
            component={ReportRoutes}
          />

        </div>
      </div>
    );
  }
}

export default WrappedRoutes;
